import pyaudiowpatch as pyaudio
import numpy as np
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
import asyncio


CHUNK_SIZE = 4800
BUFFER_SECONDS = 3

p = pyaudio.PyAudio()

model = WhisperModel("base", device="cpu", compute_type="int8")

try:
    wasapi_info = p.get_host_api_info_by_type(pyaudio.paWASAPI)
except OSError:
    print("WASAPI not available.")
    exit()

default_speakers = p.get_device_info_by_index(
    wasapi_info["defaultOutputDevice"])

if not default_speakers["isLoopbackDevice"]:
    for loopback in p.get_loopback_device_info_generator():
        if default_speakers["name"] in loopback["name"]:
            default_speakers = loopback
            break
    else:
        print("Loopback device not found.")
        exit()

sample_rate = int(default_speakers["defaultSampleRate"])

stream = p.open(
    format=pyaudio.paInt16,
    channels=default_speakers["maxInputChannels"],
    rate=sample_rate,
    frames_per_buffer=CHUNK_SIZE,
    input=True,
    input_device_index=default_speakers["index"],
)

audio_queue = asyncio.Queue()
transcript_queue = asyncio.Queue()


async def capture_audio():
    while True:
        data = await asyncio.to_thread(stream.read, CHUNK_SIZE, exception_on_overflow=False)
        audio = np.frombuffer(data, dtype=np.int16)

        if default_speakers["maxInputChannels"] == 2:
            audio = audio.reshape(-1, 2).mean(axis=1)

        audio = resample_poly(audio, 16000, sample_rate)

        audio = audio.astype(np.float32) / 32768.0

        await audio_queue.put(audio)


async def transcribe_loop():
    buffer = []
    samples_per_buffer = 16000 * BUFFER_SECONDS

    while True:
        chunk = await audio_queue.get()
        buffer.extend(chunk)

        if len(buffer) >= samples_per_buffer:
            audio_data = np.array(buffer[:samples_per_buffer])
            buffer = buffer[samples_per_buffer:]

            segments, info = await asyncio.to_thread(
                model.transcribe,
                audio_data,
                language="ja",
                beam_size=5
            )

            for segment in segments:
                print("Transcript:", segment.text)
                await transcript_queue.put(segment.text)


async def start_threads():
    await asyncio.gather(
        capture_audio(),
        transcribe_loop()
    )

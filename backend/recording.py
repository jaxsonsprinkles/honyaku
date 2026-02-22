import pyaudiowpatch as pyaudio
import numpy as np
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
import queue
import threading
from fugashi import Tagger

CHUNK_SIZE = 4800
BUFFER_SECONDS = 3


model = WhisperModel("base", device="cpu", compute_type="int8")
tagger = Tagger()

try:
    wasapi_info = pyaudio.PyAudio().get_host_api_info_by_type(pyaudio.paWASAPI)
except OSError:
    print("WASAPI not available.")
    exit()

default_speakers = pyaudio.PyAudio().get_device_info_by_index(
    wasapi_info["defaultOutputDevice"])

if not default_speakers["isLoopbackDevice"]:
    for loopback in pyaudio.PyAudio().get_loopback_device_info_generator():
        if default_speakers["name"] in loopback["name"]:
            default_speakers = loopback
            break
    else:
        print("Loopback device not found.")
        exit()

sample_rate = int(default_speakers["defaultSampleRate"])

stream = pyaudio.PyAudio().open(
    format=pyaudio.paInt16,
    channels=default_speakers["maxInputChannels"],
    rate=sample_rate,
    frames_per_buffer=CHUNK_SIZE,
    input=True,
    input_device_index=default_speakers["index"],
)

audio_queue = queue.Queue()
transcript_queue = queue.Queue()


def capture_audio():
    while True:
        data = stream.read(CHUNK_SIZE, exception_on_overflow=False)
        audio = np.frombuffer(data, dtype=np.int16)

        if default_speakers["maxInputChannels"] == 2:
            audio = audio.reshape(-1, 2).mean(axis=1)

        audio = resample_poly(audio, 16000, sample_rate)

        audio = audio.astype(np.float32) / 32768.0

        audio_queue.put(audio)


def transcribe_loop():
    buffer = []
    samples_per_buffer = 16000 * BUFFER_SECONDS

    while True:
        chunk = audio_queue.get()
        buffer.extend(chunk)

        if len(buffer) >= samples_per_buffer:
            audio_data = np.array(buffer[:samples_per_buffer])
            buffer = buffer[samples_per_buffer:]

            segments, info = model.transcribe(
                audio_data,
                language="ja",
                beam_size=5
            )

            for segment in segments:
                print("Transcript:", segment.text)
                transcript_queue.put(segment.text)


def tokenize():
    tokens = []
    while True:
        text = transcript_queue.get()
        for word in tagger(text):
            tokens.append({
                "surface": word.surface,
                "lemma": word.feature.lemma,
                "pos": word.feature.pos1
            })


threading.Thread(target=capture_audio, daemon=True).start()
threading.Thread(target=tokenize, daemon=True).start()

transcribe_loop()

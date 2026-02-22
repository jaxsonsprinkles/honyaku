# Code for recording from https://github.com/s0d3s/PyAudioWPatch/blob/master/examples/pawp_record_wasapi_loopback.py


import pyaudiowpatch as pyaudio
from google.cloud import speech
import numpy as np
from scipy.signal import resample_poly

CHUNK_SIZE = 4800

filename = "loopback_record.wav"

client = speech.SpeechClient()


with pyaudio.PyAudio() as p:

    try:
        # Get default WASAPI info
        wasapi_info = p.get_host_api_info_by_type(pyaudio.paWASAPI)
    except OSError:
        print("Looks like WASAPI is not available on the system. Exiting...")
        exit()

    # Get default WASAPI speakers
    default_speakers = p.get_device_info_by_index(
        wasapi_info["defaultOutputDevice"])

    if not default_speakers["isLoopbackDevice"]:
        for loopback in p.get_loopback_device_info_generator():
            if default_speakers["name"] in loopback["name"]:
                default_speakers = loopback
                break
        else:
            print("Default loopback output device not found.\n\nRun `python -m pyaudiowpatch` to check available devices.\nExiting...\n")
            exit()
    sample_rate = int(default_speakers["defaultSampleRate"])
    print(default_speakers)

    stream = p.open(format=pyaudio.paInt16,
                    channels=default_speakers["maxInputChannels"],
                    rate=sample_rate,
                    frames_per_buffer=CHUNK_SIZE,
                    input=True,
                    input_device_index=default_speakers["index"],
                    )

    streaming_config = speech.StreamingRecognitionConfig(
        config=speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="ja-JP"
        ),
        interim_results=True,
    )

    def record():
        def audio_generator():
            while True:
                data = stream.read(CHUNK_SIZE, exception_on_overflow=False)

                audio = np.frombuffer(data, dtype=np.int16)

                if default_speakers["maxInputChannels"] == 2:
                    audio = audio.reshape(-1, 2)
                    audio = audio.mean(axis=1)

                num_samples = int(len(audio) * 16000 / sample_rate)
                audio_resampled = resample_poly(audio, 1, 3)

                audio_resampled = np.clip(audio_resampled, -32768, 32767)
                audio_resampled = audio_resampled.astype(np.int16)

                yield speech.StreamingRecognizeRequest(
                    audio_content=audio_resampled.tobytes()
                )

        responses = client.streaming_recognize(
            streaming_config, audio_generator())

        for response in responses:
            for result in response.results:
                print("Transcript:", result.alternatives[0].transcript)


record()

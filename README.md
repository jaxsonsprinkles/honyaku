![Honyaku Logo](frontend/assets/splash.png)

# 翻訳 Honyaku

A real-time Japanese transcription and translation desktop app for watching anime. Honyaku captures your system audio, transcribes and displays word by word with tooltips that break down each word's meaning, reading, and examples.

## Features

1. Real-time transcription - Captures your system audio via WASAPI loopback and transcribes Japanese using faster-whisper.
2. Word segmentation - Splits transcriptions into individual tokens using morphological analysis with Fugashi.
3. Hover tooltips - Hover over any word to see its dictionary definition, Kana reading, and example usage via kotobase.
4. Live web socket streaming - Python backend streams results to the Electron frontend instantly with no polling or file I/O.
5. Always-on - It's built with Electron and React, so it sits on top of your media player.

## Requirements

### Backend

- Python 3.10+
- Windows
- CUDA GPU heavily suggested

### Frontend

- Node.js 14+
- npm 7+

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Additionally, I recommend running `kotobase pull-db` to drastically speed up lookup time.

### Frontend

```bash
cd frontend
npm install
```

## Usage

First, start the backend server:

```bash
cd backend
python server.py
```

Then start the frontend:

```
cd frontend
npm start
```

The app will connect automatically. Play any Japanese audio on your system and transcriptions will appear in real time. If Honyaku shows "Not Connected," you may have to reload the page.

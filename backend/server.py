import asyncio
from websockets.asyncio.server import serve
from recording import start_threads, transcript_queue
from fugashi import Tagger
import json
from kotobase import Kotobase

tagger = Tagger()
kb = Kotobase()

async def handler(websocket, path=None):
    print("Websocket connection started")
    while True:
        tokens = []
        print("Waiting for transcription")
        text = await transcript_queue.get()
        for word in tagger(text):
            tokens.append({
                "surface": word.surface,
                "lookup": kb.lookup(word.surface).to_json()
            })
        print("Sending")
        await websocket.send(json.dumps({"tokens": tokens}))


async def main():

    asyncio.create_task(start_threads())

    async with serve(handler, "localhost", 8765) as server:
        await asyncio.sleep(float('inf'))

if __name__ == "__main__":
    asyncio.run(main())


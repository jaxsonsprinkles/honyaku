import asyncio
from websockets.asyncio.server import serve
from recording import start_threads, transcript_queue
from fugashi import Tagger
import json


tagger = Tagger()


async def handler(websocket):

    while True:
        tokens = []
        text = await transcript_queue.get()
        for word in tagger(text):
            tokens.append({
                "surface": word.surface,
                "lemma": word.feature.lemma,
                "pos": word.feature.pos1
            })
        await websocket.send(json.dumps({"tokens": tokens}))


async def main():

    asyncio.create_task(start_threads())

    async with serve(handler, "localhost", 8765) as server:
        await asyncio.sleep(float('inf'))

if __name__ == "__main__":
    asyncio.run(main())

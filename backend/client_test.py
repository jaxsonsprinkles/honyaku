from websockets.sync.client import connect

def hello():
    with connect("ws://localhost:8765") as websocket:
        message = websocket.recv()
        print(message)

if __name__ == "__main__":
    hello()
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useRef, useState } from 'react';
function Main() {
  const ws = useRef<WebSocket>(null);
  const [connected, setConnected] = useState<Boolean>(false);

  useEffect(() => {
    const socket = new WebSocket('wss://localhost:8765');
    socket.onopen = () => {
      setConnected(true);
    };

    socket.onmessage = (event) => {
      console.log('Message:', event.data);
    };
    ws.current = socket;
  });

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-gray-800">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold">翻訳 (Honyaku)</h1>
        <div className="flex flex-col gap-4 justify-center">
          <div className="flex flex-col mx-auto gap-4 justify-center">
            <p
              className={`flex items-center gap-2 ${connected ? 'text-green-500' : 'text-red-500'}`}
            >
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${connected ? 'bg-green-500' : 'bg-red-500'}`}
                ></span>
              </span>

              {connected ? 'Connected' : 'Not Connected'}
            </p>
          </div>

          <button
            onClick={() => {
              sendMessage('Test');
            }}
            className="border p-1 rounded-md cursor-pointer"
          >
            Send message
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}

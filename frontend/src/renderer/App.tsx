import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useRef } from 'react';
function Main() {
  const ws = useRef<WebSocket>(null);

  useEffect(() => {
    const socket = new WebSocket('wss://echo.websocket.org/');
    socket.onopen = () => {
      console.log('Connection established');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-800">翻訳 (Honyaku)</h1>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              sendMessage('Test');
            }}
            className="border p-1 rounded-md"
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

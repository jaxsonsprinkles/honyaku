import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import splash from '../../assets/splash.png';
function Main() {
  const ws = useRef<WebSocket>(null);
  const [connected, setConnected] = useState<Boolean>(false);
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8765');
    socket.onopen = () => {
      console.log('Connected');
      setConnected(true);
    };

    socket.onmessage = (event) => {
      console.log('Message:', event.data);
      const data = JSON.parse(event.data);
      setTokens((prev) => [...prev, data]);
    };

    socket.onerror = (error) => {
      setConnected(false);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center">
      <div className="text-center">
        <div className="mx-10 space-y-6">
          <img src={splash} alt="Honyaku" width={500} height={250} />
          <div className="flex flex-row mx-auto gap-2 justify-center">
            <p
              className={`flex items-center gap-2 ${connected ? 'text-success' : 'text-error'}`}
            >
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${connected ? 'bg-success' : 'bg-error'} opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${connected ? 'bg-success' : 'bg-error'}`}
                ></span>
              </span>
              {connected ? 'Connected' : 'Not Connected'}
            </p>
            <button
              className="btn btn-sm"
              onClick={() => window.location.reload()}
              aria-label="Refresh window"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      <div>
        {tokens.length != 0 ? (
          tokens.map((token: any, i: number) => {
            console.log(token);
            return (
              <div key={i}>
                {token.map((word: any, j: number) => {
                  const lookup = JSON.parse(word.lookup);
                  return (
                    <div key={j} className="tooltip">
                      <div className="tooltip-content">
                        {lookup.entries.length != 0 ? (
                          <div>
                            <h1 className="text-xl font-bold">
                              {JSON.parse(`"${lookup.word}"`)}
                            </h1>
                            <p>{lookup.entries[0].kana[0]}</p>
                            <ul className="list-disc pl-5 text-left text-sm">
                              <li>{lookup.entries[0].senses[0].gloss}</li>
                              <li>{lookup.examples[0].text}</li>
                            </ul>
                          </div>
                        ) : (
                          'No lookup found for this word'
                        )}
                      </div>
                      <span className="bg-base-300 rounded-md m-1 p-1 inline-block">
                        {JSON.parse(`"${word.surface}"`)}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <p className="text-center">
            {connected
              ? 'Waiting on server to send transcriptions...'
              : 'Connect to the server to start receiving captions'}
          </p>
        )}
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

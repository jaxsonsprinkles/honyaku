import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useRef, useState } from 'react';
function Main() {
  const ws = useRef<WebSocket>(null);
  const [connected, setConnected] = useState<Boolean>(false);
  const [tokens, setTokens] = useState<any>({
    tokens: [
      {
        surface: '\u306a\u3044',
        lemma: '\u7121\u3044',
        pos: '\u5f62\u5bb9\u8a5e',
      },
      { surface: '\u3088', lemma: '\u3088', pos: '\u52a9\u8a5e' },
      { surface: '\u3001', lemma: '\u3001', pos: '\u88dc\u52a9\u8a18\u53f7' },
      {
        surface: '\u597d\u304d',
        lemma: '\u597d\u304d',
        pos: '\u5f62\u72b6\u8a5e',
      },
      { surface: '\u3068', lemma: '\u3068', pos: '\u52a9\u8a5e' },
      { surface: '\u304b', lemma: '\u304b', pos: '\u52a9\u8a5e' },
      { surface: '\u305d\u3046', lemma: '\u305d\u3046', pos: '\u526f\u8a5e' },
      { surface: '\u3044\u3046', lemma: '\u8a00\u3046', pos: '\u52d5\u8a5e' },
      { surface: '\u306e', lemma: '\u306e', pos: '\u52a9\u8a5e' },
    ],
  });
  const cache = new Map();

  const lookupWord = async (word: any) => {
    if (cache.has(word)) {
      return cache.get(word);
    }

    try {
      const response = await fetch(
        `https://api.mojidict.com/v1/words/${encodeURIComponent(word)}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP Error with status ${response.status}`);
      }

      const data = await response.json();
      cache.set(word, data);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8765');
    socket.onopen = () => {
      setConnected(true);
    };

    socket.onmessage = (event) => {
      console.log('Message:', event.data);
      setTokens(event.data);
    };
    ws.current = socket;
  });

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-800">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold">翻訳 (Honyaku)</h1>
        <div className="flex flex-col gap-4 justify-center">
          <div className="flex flex-col mx-auto gap-4 justify-center">
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
          </div>

          <p>
            {tokens.tokens.map((token: any, i: number) => {
              return (
                <div
                  className="tooltip"
                  data-tip={JSON.stringify(lookupWord(token))}
                >
                  <span key={i} className="bg-base-300 rounded-md m-1 p-1">
                    {JSON.parse(`"${token.surface}"`)}
                  </span>
                </div>
              );
            })}
          </p>
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

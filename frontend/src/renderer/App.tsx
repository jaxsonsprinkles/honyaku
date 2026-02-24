import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './tailwind.css';
import './App.css';

function Hello() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Honyaku</h1>
      <p className="mt-4 text-lg">Start playing audio to start</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}

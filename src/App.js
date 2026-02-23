import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import Game from './pages/Game';
import Results from './pages/Results';
import Quiz from './pages/Quiz';
import TimedTyping from './pages/TimedTyping';
import NotFound from './pages/NotFound';
import SoundToggle from './components/SoundToggle';
import './App.css';

function App() {
  return (
    <Router>
      <SoundToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
        <Route path="/game" element={<Game />} />
        <Route path="/results" element={<Results />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/timed" element={<TimedTyping />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

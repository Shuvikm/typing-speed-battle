import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SoundToggle from './components/SoundToggle';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

// ─── Lazy-loaded pages (code splitting per route) ──────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Room = lazy(() => import('./pages/Room'));
const Game = lazy(() => import('./pages/Game'));
const Results = lazy(() => import('./pages/Results'));
const Quiz = lazy(() => import('./pages/Quiz'));
const TimedTyping = lazy(() => import('./pages/TimedTyping'));
const Stats = lazy(() => import('./pages/Stats'));
const WordChallenge = lazy(() => import('./pages/WordChallenge'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ─── Suspense fallback ────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#0a0a0f',
    color: '#00d4ff',
    fontSize: '1.2rem',
    fontFamily: 'monospace',
    letterSpacing: '0.1em',
  }}>
    ⚔️ Loading...
  </div>
);

function App() {
  return (
    <Router>
      <SoundToggle />
      <ThemeToggle />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room" element={<Room />} />
          <Route path="/game" element={<Game />} />
          <Route path="/results" element={<Results />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/timed" element={<TimedTyping />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/words" element={<WordChallenge />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

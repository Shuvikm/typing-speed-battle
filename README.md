# ⚔️ Typing Speed Battle

A fast-paced, anime-themed typing game with multiple game modes, real-time stats, and Kahoot-style quiz rounds.

---

## Features

| Feature | Detail |
|---|---|
| 🎯 **Solo Practice** | Improve your WPM alone |
| ⚔️ **Battle Mode** | Real-time multiplayer typing battles |
| 🧠 **Quiz Battle** | Kahoot-style anime quiz + typing |
| ⏱️ **Time Trial** | Type as many anime passages as possible before the clock runs out |
| 🏆 **Local Leaderboard** | Top-5 personal best scores per duration, saved in the browser |
| 💀 **Difficulty Selector** | Easy / Medium / Hard passages — 20+ total |
| 📈 **WPM Graph** | Live mini bar-chart of your WPM over time |
| 🔊 **Sound Toggle** | Mute/unmute with one click — preference saved |
| 🏴‍☠️ **404 Page** | Styled not-found page |
| ⌨️ **Keyboard Shortcuts** | `Tab` → restart, `Esc` → home |

---

## Tech Stack

- **React 18** — UI framework
- **React Router v6** — client-side routing
- **Tailwind CSS** — utility-first styling
- **anime.js** — animation helpers
- **Web Audio API** — synthesized sound effects

---

## Getting Started

```bash
# Install dependencies
cd typing-speed-battle
npm install

# Start development server
npm start
# → Opens at http://localhost:3000

# Run tests
npm test -- --watchAll=false
```

---

## Project Structure

```
src/
├── components/       # Reusable UI pieces (Confetti, RaceTrack, SoundToggle…)
├── hooks/            # Custom React hooks (useLocalStorage)
├── pages/            # Route-level components (Home, Game, Quiz, TimedTyping…)
├── utils/            # Pure helpers (gameLogic, sounds, animeHelper, socket)
└── App.js            # Router + global layout
```

---

## Game Modes

### ⏱️ Time Trial
1. Pick a **difficulty** (Easy / Medium / Hard)
2. Pick a **duration** (15 / 30 / 60 / 120 seconds)
3. Type the anime passages as fast and accurately as possible
4. See your **grade**, **WPM**, **accuracy**, and local **leaderboard** on the results screen

### 🧠 Quiz Battle
Alternating Kahoot-style multiple-choice questions and typing rounds with streaks, combos, and confetti.

---

## Screenshots

> _Add screenshots here once the app is running._

---

## License

MIT

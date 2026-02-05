# ⚔️ Typing Speed Battle 🏴‍☠️

An epic anime-themed typing speed battle game with real-time multiplayer support! Combine the thrill of competitive typing with the adventure of One Piece.

![Typing Speed Battle](https://img.shields.io/badge/React-19.2.3-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-green) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.19-38bdf8) ![MongoDB](https://img.shields.io/badge/MongoDB-Ready-47a248)

## 🎨 Features

- **🎯 Anime + Neon + Hacker Hybrid UI** - Beautiful combination of all three themes
- **⚔️ Real-time Multiplayer Battles** - Challenge friends in live typing competitions
- **🎯 Solo Practice Mode** - Improve your skills on your own
- **🧠 Quiz System** - Test your One Piece knowledge with typing challenges
- **👤 Pirate Avatars** - Choose from 9 Straw Hat crew members (Luffy, Zoro, Nami, etc.)
- **📊 Real-time Stats** - WPM, Accuracy, Combo streaks, and more
- **🏆 Rank System** - Earn titles like "Pirate King", "Yonko", "Super Rookie"
- **🎬 Anime.js Animations** - Smooth, professional animations
- **🔊 Sound Effects** - Audio feedback for all actions
- **🗄️ MongoDB Integration** - Persistent leaderboards and player stats
- **🎨 Custom Fonts** - Anime-style Google Fonts (Orbitron, Audiowide, etc.)

## 🚀 Quick Start

### Prerequisites,,

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, for persistent data)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Shuvikm/typing-speed-battle.git
cd typing-speed-battle
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables (optional):**
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

4. **Start the backend server:**
```bash
npm run server


5. **Start the React app (in another terminal):**
```bash
npm start
```

6. **Or run both together:**
```bash
npm run dev
```

### Access the App

- **Frontend**: http://localhost:3000
- **Backend Server**: http://localhost:3001

## 🎮 How to Play

1. **Home Page**: Choose between Solo Practice, Battle Mode, or Quiz
2. **Room Setup**: 
   - Enter your pirate name
   - Select your avatar (Straw Hat crew member)
   - Create a new room or join an existing one
3. **Battle**: 
   - Wait for the countdown (3...2...1...)
   - Type the text as fast and accurately as possible
   - Watch your WPM, accuracy, and combo meter
   - See real-time opponent progress (in battle mode)
4. **Results**: 
   - View your performance stats
   - See your rank title
   - Check the leaderboard (battle mode)

## 🏆 Rank Titles

- **👑 Pirate King** (100+ WPM)
- **⭐ Yonko** (80+ WPM)
- **🔥 Super Rookie** (60+ WPM)
- **💪 Pirate Captain** (40+ WPM)
- **Marine Captain** (20+ WPM)
- **Cabin Boy** (<20 WPM)

## 🛠️ Tech Stack

- **Frontend**: React 19, TailwindCSS 3, React Router 7
- **Backend**: Node.js, Express, Socket.io 4
- **Database**: MongoDB with Mongoose
- **Animations**: Anime.js 3
- **Real-time**: WebSocket connections for multiplayer

## 📁 Project Structure

```
typing-speed-battle/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Avatar.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── AnimeBackground.jsx
│   │   ├── PowerUp.jsx
│   │   └── Achievement.jsx
│   ├── pages/          # Main pages
│   │   ├── Home.jsx
│   │   ├── Room.jsx
│   │   ├── Game.jsx
│   │   ├── Results.jsx
│   │   └── Quiz.jsx
│   ├── utils/          # Utilities
│   │   ├── gameLogic.js
│   │   ├── socket.js
│   │   ├── animeHelper.js
│   │   └── sounds.js
│   └── assets/         # Static assets
├── config/             # Configuration
│   └── database.js
├── models/             # MongoDB models
│   ├── Player.js
│   ├── Game.js
│   └── Leaderboard.js
├── server.js           # Backend Socket.io server
├── tailwind.config.js  # Tailwind configuration
└── package.json
```

## 🎨 Theme Details

- **Background**: Dark hacker grid with neon accents
- **Colors**: Electric Blue (#00D9FF), Neon Purple (#B026FF), Hacker Green (#00FF41), Pirate Red/Yellow
- **Animations**: Glowing effects, pulse animations, matrix-style falling text
- **Fonts**: Orbitron, Audiowide, Rajdhani, Bangers
- **Icons**: One Piece inspired avatars and emojis

## 🔧 Development

### Available Scripts

- `npm start` - Start React development server
- `npm run server` - Start backend server
- `npm run dev` - Run both frontend and backend
- `npm run build` - Build for production
- `npm test` - Run tests

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/typing-speed-battle
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [README_MONGODB.md](./README_MONGODB.md) - MongoDB setup instructions
- [ANIME_SETUP.md](./ANIME_SETUP.md) - Anime.js and video setup
- [INNOVATIVE_FEATURES.md](./INNOVATIVE_FEATURES.md) - Feature ideas and roadmap
- [FEATURES.md](./FEATURES.md) - Complete features list

## 🎯 Game Modes

### Solo Practice
- Practice typing alone
- Improve your WPM and accuracy
- No multiplayer required

### Battle Mode
- Real-time multiplayer battles
- Compete against friends
- Live progress tracking
- Winner determination

### Quiz Mode
- One Piece themed questions
- Typing challenges after each question
- Leaderboard system
- Score tracking

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
- Frontend: Vercel or Netlify
- Backend: Railway or Render
- Database: MongoDB Atlas

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Shuvik M**
- GitHub: [@Shuvikm](https://github.com/Shuvikm)

## 🙏 Acknowledgments

- Inspired by One Piece anime
- Built with React and modern web technologies
- Special thanks to the open-source community

## 🏴‍☠️ Enjoy the Battle!

Set sail and become the Pirate King of typing! ⚔️⌨️

---

⭐ If you like this project, please give it a star on GitHub!
And i am going to implement the player versus player typing battle


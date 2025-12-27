# 🗄️ MongoDB Setup Guide

## Installation

### Option 1: Local MongoDB

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Homebrew: `brew install mongodb-community`
   - Or use Chocolatey: `choco install mongodb`

2. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   mongod
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free tier (512MB storage)

2. **Create Cluster**
   - Click "Build a Database"
   - Choose free tier (M0)
   - Select your region

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

## Configuration

1. **Create `.env` file** in the root directory:
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your MongoDB connection:**

   **For Local MongoDB:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/typing-speed-battle
   ```

   **For MongoDB Atlas:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/typing-speed-battle?retryWrites=true&w=majority
   ```

## Database Models

### Player Model
Stores individual player statistics:
- Name, Avatar
- Total games, Wins, Losses
- Best WPM, Average WPM, Average Accuracy
- Total typed characters

### Game Model
Stores completed game results:
- Room ID, Mode (solo/battle)
- Game text used
- Results for all players
- Winner information
- Timestamps

### Leaderboard Model
Stores leaderboard rankings:
- Player name, Avatar
- Best WPM, Average WPM
- Win rate, Rank title
- Updated automatically after each game

## API Endpoints

### Get Leaderboard
```bash
GET http://localhost:3001/api/leaderboard
```

Returns top 50 players sorted by best WPM.

### Get Player Stats
```bash
GET http://localhost:3001/api/player/:name
```

Returns detailed stats for a specific player.

## Features

✅ **Automatic Data Persistence**
- All game results are saved to MongoDB
- Player stats update automatically
- Leaderboard updates in real-time

✅ **Performance**
- In-memory storage for active games (fast)
- MongoDB for completed games (persistent)
- Indexed queries for fast leaderboard access

✅ **Data Integrity**
- Player stats calculated automatically
- Win/loss tracking for battle mode
- Rank titles assigned based on best WPM

## Testing Connection

After starting the server, you should see:
```
✅ MongoDB Connected: localhost:27017
🏴‍☠️ Typing Speed Battle Server running on port 3001
Ready for battles! ⚔️
```

If you see an error, check:
1. MongoDB is running (local) or connection string is correct (Atlas)
2. `.env` file exists and has correct `MONGODB_URI`
3. Network/firewall allows connection to MongoDB

## Troubleshooting

**Error: "MongoServerError: Authentication failed"**
- Check your MongoDB username and password in connection string
- For Atlas: Make sure IP whitelist includes your IP (or 0.0.0.0/0 for development)

**Error: "ECONNREFUSED"**
- MongoDB is not running (local)
- Check connection string host/port
- For Atlas: Check cluster is running and accessible

**Error: "MongoNetworkError"**
- Check internet connection (for Atlas)
- Verify connection string format
- Check firewall settings


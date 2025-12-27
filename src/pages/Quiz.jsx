import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSocket, socketEvents } from '../utils/socket';
import Button from '../components/Button';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import ProgressBar from '../components/ProgressBar';

const quizQuestions = [
  {
    id: 1,
    question: "Who is the captain of the Straw Hat Pirates?",
    options: ["Luffy", "Zoro", "Sanji", "Nami"],
    correct: 0,
    typingText: "Luffy is the captain of the Straw Hat Pirates and dreams of becoming the Pirate King!"
  },
  {
    id: 2,
    question: "What is Zoro's dream?",
    options: ["To become Pirate King", "To become the world's greatest swordsman", "To find All Blue", "To map the world"],
    correct: 1,
    typingText: "Zoro aims to become the world's greatest swordsman and never lose a fight again!"
  },
  {
    id: 3,
    question: "What is the name of Luffy's first ship?",
    options: ["Thousand Sunny", "Going Merry", "Red Force", "Moby Dick"],
    correct: 1,
    typingText: "The Going Merry was the first ship that carried the Straw Hat crew through many adventures!"
  },
  {
    id: 4,
    question: "What power does Luffy have?",
    options: ["Sword fighting", "Gum-Gum Fruit", "Weather control", "Navigation"],
    correct: 1,
    typingText: "Luffy ate the Gum-Gum Fruit which gives him the power to stretch his body like rubber!"
  },
  {
    id: 5,
    question: "How many Straw Hat crew members are there?",
    options: ["7", "9", "11", "13"],
    correct: 2,
    typingText: "The Straw Hat Pirates currently have 11 crew members including Luffy, Zoro, Nami, and others!"
  },
];

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('id') || 'default';
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('luffy');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [typingMode, setTypingMode] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const newSocket = createSocket();
    setSocket(newSocket);

    newSocket.on('quiz-joined', (data) => {
      setParticipants(data.participants || []);
    });

    newSocket.on('quiz-result', (data) => {
      setParticipants(data.leaderboard || []);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleTimeUp = () => {
    if (!gameFinished) {
      setGameFinished(true);
      if (socket) {
        socket.emit('quiz-complete', {
          quizId,
          score,
          wpm: 0,
          accuracy: 0,
        });
      }
    }
  };

  useEffect(() => {
    if (gameStarted && !gameFinished && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameFinished, timeLeft]);

  useEffect(() => {
    if (typingMode && startTime) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const correctChars = userInput.split('').filter((char, i) => char === typingText[i]).length;
        const wpmCalc = Math.round((correctChars / 5) / (elapsed / 60));
        const accCalc = typingText.length > 0 ? Math.round((correctChars / typingText.length) * 100) : 100;
        setWpm(wpmCalc);
        setAccuracy(accCalc);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [typingMode, startTime, userInput, typingText]);

  const handleJoinQuiz = () => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }
    if (socket) {
      socket.emit('join-quiz', {
        quizId,
        playerName,
        avatar: selectedAvatar,
      });
      setGameStarted(true);
      setTimeLeft(30);
    }
  };

  const handleAnswerSelect = (index) => {
    if (gameFinished) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const question = quizQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Move to typing challenge
    setTypingMode(true);
    setTypingText(question.typingText);
    setUserInput('');
    setStartTime(Date.now());
  };

  const handleTypingComplete = () => {
    if (userInput === typingText) {
      // Move to next question or finish
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTypingMode(false);
        setSelectedAnswer(null);
        setUserInput('');
        setWpm(0);
        setAccuracy(100);
        setStartTime(null);
      } else {
        setGameFinished(true);
        if (socket) {
          socket.emit('quiz-complete', {
            quizId,
            score,
            wpm,
            accuracy,
          });
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    if (value === typingText) {
      setTimeout(handleTypingComplete, 100);
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
        {/* Anime Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>⚔️</div>
          <div className="absolute top-40 right-20 text-5xl animate-pulse" style={{ animationDuration: '2s' }}>🌟</div>
          <div className="absolute bottom-32 left-1/4 text-4xl animate-float">🏴‍☠️</div>
          <div className="absolute bottom-20 right-1/3 text-5xl animate-pulse" style={{ animationDuration: '1.5s' }}>⭐</div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card glow className="text-center mb-8 border-4 border-pirate-yellow">
              <h1 className="text-5xl font-bold text-glow-blue mb-4 animate-pulse-neon">
                🎯 JOIN MY QUIZ 🎯
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Test your One Piece knowledge and typing skills!
              </p>
              <div className="text-3xl mb-4">🧠⚡⌨️</div>
            </Card>

            <Card glow>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-3 bg-gray-900 border-2 border-neon-blue rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Choose Your Avatar</label>
                  <div className="grid grid-cols-5 gap-3">
                    {['luffy', 'zoro', 'nami', 'sanji', 'chopper'].map((name) => (
                      <Avatar
                        key={name}
                        name={name}
                        selected={selectedAvatar === name}
                        onClick={() => setSelectedAvatar(name)}
                        size="md"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  variant="pirate"
                  size="lg"
                  className="w-full text-xl"
                  onClick={handleJoinQuiz}
                  disabled={!playerName.trim()}
                >
                  🚀 Join Quiz Battle!
                </Button>
              </div>
            </Card>

            <div className="mt-6 text-center">
              <Button variant="secondary" onClick={() => navigate('/')}>
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card glow className="text-center mb-8 border-4 border-pirate-yellow">
              <h1 className="text-6xl font-bold text-glow-blue mb-4">
                🎉 QUIZ COMPLETE! 🎉
              </h1>
              <div className="text-4xl mb-4">🏆</div>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="text-center">
                <div className="text-5xl font-bold text-neon-blue">{score}/{quizQuestions.length}</div>
                <div className="text-lg text-gray-400 mt-2">Correct Answers</div>
              </Card>
              <Card className="text-center">
                <div className="text-5xl font-bold text-hacker-green">{wpm}</div>
                <div className="text-lg text-gray-400 mt-2">WPM</div>
              </Card>
              <Card className="text-center">
                <div className="text-5xl font-bold text-pirate-yellow">{accuracy}%</div>
                <div className="text-lg text-gray-400 mt-2">Accuracy</div>
              </Card>
            </div>

            <Card glow className="mb-6">
              <h3 className="text-2xl font-bold mb-4 text-pirate-yellow">🏆 Leaderboard</h3>
              <div className="space-y-3">
                {participants.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.avatar} size="sm" />
                      <span className="font-bold">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-neon-blue">{p.score || 0} pts</div>
                      <div className="text-sm text-gray-400">{p.wpm || 0} WPM</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button variant="pirate" size="lg" onClick={() => window.location.reload()}>
                🔄 Play Again
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
                🏠 Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (typingMode) {
    const question = quizQuestions[currentQuestion];
    const correctChars = userInput.split('').filter((char, i) => char === typingText[i]).length;
    const progress = typingText.length > 0 ? (userInput.length / typingText.length) * 100 : 0;

    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Card glow className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-neon-blue">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </h2>
              <div className="text-2xl font-bold text-pirate-yellow">
                ⏱️ {timeLeft}s
              </div>
            </div>
            <ProgressBar progress={(currentQuestion / quizQuestions.length) * 100} label="Progress" />
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="text-center">
              <div className="text-3xl font-bold text-neon-blue">{wpm}</div>
              <div className="text-sm text-gray-400">WPM</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-hacker-green">{accuracy}%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-pirate-yellow">{score}</div>
              <div className="text-sm text-gray-400">Score</div>
            </Card>
          </div>

          <Card glow className="mb-6">
            <h3 className="text-2xl font-bold mb-4 text-pirate-yellow">⚡ Typing Challenge ⚡</h3>
            <ProgressBar progress={progress} color="neon-purple" />
            <div className="mt-6 text-xl md:text-2xl font-mono leading-relaxed min-h-[150px]">
              {typingText.split('').map((char, index) => {
                let className = 'text-gray-600';
                if (index < userInput.length) {
                  className = userInput[index] === char ? 'text-hacker-green' : 'text-red-500 bg-red-500/20';
                }
                return (
                  <span key={index} className={className}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className="w-full mt-4 px-4 py-3 bg-gray-900 border-2 border-neon-blue rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder="Start typing..."
              autoFocus
            />
          </Card>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern relative">
      {/* Anime Character Floating */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-7xl animate-float" style={{ animationDelay: '0s' }}>👒</div>
        <div className="absolute top-32 right-20 text-6xl animate-float" style={{ animationDelay: '1s' }}>🗡️</div>
        <div className="absolute bottom-40 left-1/4 text-5xl animate-float" style={{ animationDelay: '2s' }}>🧭</div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Card glow className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-neon-blue">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </h2>
            <div className="text-2xl font-bold text-pirate-yellow">
              ⏱️ {timeLeft}s
            </div>
          </div>
          <ProgressBar progress={(currentQuestion / quizQuestions.length) * 100} label="Progress" />
        </Card>

        <Card glow className="mb-6">
          <h3 className="text-3xl font-bold mb-6 text-glow-blue text-center">
            {question.question}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-4 rounded-lg text-left transition-all duration-300 transform hover:scale-105 ${
                  selectedAnswer === index
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white ring-4 ring-neon-blue'
                    : 'bg-gray-900 border-2 border-gray-700 text-gray-300 hover:border-neon-blue'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{index === 0 ? 'A' : index === 1 ? 'B' : index === 2 ? 'C' : 'D'}</span>
                  <span className="text-lg font-bold">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="pirate"
            size="lg"
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="text-xl px-12"
          >
            ✅ Submit Answer & Start Typing Challenge
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSocket } from '../utils/socket';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import AnimatedCountdown from '../components/AnimatedCountdown';
import FloatingScore from '../components/FloatingScore';
import StreakBadge from '../components/StreakBadge';
import Confetti from '../components/Confetti';

// ─── Question bank ───────────────────────────────────────────────
const ALL_QUESTIONS = [
  // ── CLASSIC 90s-00s ──────────────────────────────────────────
  { id: 1, category: 'Classic 90s-00s', question: "What is Goku's Saiyan birth name?", options: ['Kakarot', 'Bardock', 'Raditz', 'Turles'], correct: 0, typingText: 'Goku was born Kakarot on Planet Vegeta and was sent to Earth as a baby before the planet was destroyed by Frieza.' },
  { id: 2, category: 'Classic 90s-00s', question: 'Which village is Naruto from?', options: ['Sunagakure', 'Kumogakure', 'Konohagakure', 'Kirigakure'], correct: 2, typingText: 'Naruto Uzumaki grew up in Konohagakure, the Hidden Leaf Village, dreaming of becoming Hokage despite being shunned as a jinchuriki.' },
  { id: 3, category: 'Classic 90s-00s', question: "What is the name of Ichigo's zanpakuto?", options: ['Zangetsu', 'Senbonzakura', 'Hyorinmaru', 'Wabisuke'], correct: 0, typingText: "Zangetsu is Ichigo Kurosaki's zanpakuto, a massive cleaver-like blade that reflects his immense spiritual pressure." },
  { id: 4, category: 'Classic 90s-00s', question: 'In Dragon Ball Z, which form comes after Super Saiyan 2?', options: ['Super Saiyan Blue', 'Super Saiyan God', 'Super Saiyan 3', 'Ultra Instinct'], correct: 2, typingText: 'Super Saiyan 3 is the third transformation form, characterized by extremely long golden hair and the loss of eyebrows.' },
  { id: 5, category: 'Classic 90s-00s', question: 'What card game is Yu-Gi-Oh! based around?', options: ['Poker', 'Bridge', 'Duel Monsters', 'Shadow Games'], correct: 2, typingText: 'Duel Monsters is the card game in Yu-Gi-Oh where players summon powerful creatures and cast magical spells to defeat opponents.' },
  { id: 6, category: 'Classic 90s-00s', question: "What is the name of InuYasha's legendary sword?", options: ['Tessaiga', 'Tenseiga', 'Tokijin', 'Bakusaiga'], correct: 0, typingText: "Tessaiga is InuYasha's legendary sword forged from his father's fang, capable of slaying one hundred demons in a single swing." },
  { id: 7, category: 'Classic 90s-00s', question: 'Which team does Sakura belong to in Naruto?', options: ['Team Guy', 'Team Asuma', 'Team Kurenai', 'Team 7'], correct: 3, typingText: 'Sakura Haruno is a member of Team 7 alongside Naruto Uzumaki and Sasuke Uchiha under the leadership of Kakashi Hatake.' },
  { id: 8, category: 'Classic 90s-00s', question: 'What is the Kamehameha in Dragon Ball?', options: ['A sword technique', 'A ki blast technique', 'A power up form', 'A fusion dance'], correct: 1, typingText: "The Kamehameha is Goku's signature energy blast, taught by Master Roshi. It fires a massive beam of concentrated energy from cupped hands." },
  { id: 9, category: 'Classic 90s-00s', question: 'Who is the primary antagonist of Death Note?', options: ['Light Yagami', 'Near', 'Beyond Birthday', 'L Lawliet'], correct: 0, typingText: 'Light Yagami, a genius student, discovers a supernatural notebook that kills anyone whose name is written in it, becoming the self-proclaimed god Kira.' },
  { id: 10, category: 'Classic 90s-00s', question: 'What are the three Legendary Beasts of Johto (Pokemon)?', options: ['Raikou, Entei, Suicune', 'Articuno, Zapdos, Moltres', 'Mewtwo, Mew, Celebi', 'Ho-Oh, Lugia, Celebi'], correct: 0, typingText: 'Raikou, Entei, and Suicune are the Legendary Beasts of Johto, resurrected by Ho-Oh and roaming the region for worthy trainers.' },
  // ── ONE PIECE ────────────────────────────────────────────────
  { id: 11, category: 'One Piece', question: 'Who is the captain of the Straw Hat Pirates?', options: ['Zoro', 'Luffy', 'Sanji', 'Nami'], correct: 1, typingText: 'Monkey D. Luffy is the captain of the Straw Hat Pirates and dreams of becoming the King of the Pirates by finding the legendary treasure One Piece.' },
  { id: 12, category: 'One Piece', question: "What is Zoro's dream?", options: ['Pirate King', 'Find All Blue', "World's Greatest Swordsman", 'Map the World'], correct: 2, typingText: "Roronoa Zoro aims to become the world's greatest swordsman, a promise he made to his childhood rival Kuina who passed away before their shared dream." },
  { id: 13, category: 'One Piece', question: 'What Devil Fruit did Luffy eat?', options: ['Flame Fruit', 'Gum-Gum Fruit', 'Ice Fruit', 'Dark Fruit'], correct: 1, typingText: 'Luffy ate the Gum-Gum Fruit, actually the Mythical Zoan Hito Hito no Mi Model Nika, granting him rubber powers and ultimate freedom.' },
  { id: 14, category: 'One Piece', question: "What is the name of Luffy's first ship?", options: ['Thousand Sunny', 'Red Force', 'Moby Dick', 'Going Merry'], correct: 3, typingText: 'The Going Merry was the beloved first ship of the Straw Hat Pirates, given by Kaya in Syrup Village and given a Viking funeral after her keel broke.' },
  { id: 15, category: 'One Piece', question: "What is Sanji's dream?", options: ['Become Pirate King', 'Find All Blue', 'Become a swordsman', 'Protect Nami'], correct: 1, typingText: 'Sanji dreams of finding All Blue, a legendary sea where fish from all four oceans gather together, the ultimate paradise for any cook.' },
  { id: 16, category: 'One Piece', question: 'Who gave Luffy his iconic straw hat?', options: ['Garp', 'Dragon', 'Shanks', 'Whitebeard'], correct: 2, typingText: "The legendary Red-Haired Shanks gave Luffy his iconic straw hat, asking him to return it once he became a great pirate." },
  { id: 17, category: 'One Piece', question: 'What is the current Straw Hat ship?', options: ['Merry Go', 'Thousand Sunny', 'Red Force', 'Oro Jackson'], correct: 1, typingText: 'The Thousand Sunny is the second ship of the Straw Hats, built by Franky using legendary Adam Wood and powered by the Coup de Burst cannon.' },
  { id: 18, category: 'One Piece', question: 'What is Gear 5 called?', options: ['Sun God Nika', 'Conquering King', 'Gear White', 'Joyboy Mode'], correct: 0, typingText: 'Gear 5 is called Sun God Nika form, the awakened state of the Hito Hito no Mi Model Nika, making Luffy a legendary liberating warrior.' },
  { id: 19, category: 'One Piece', question: 'Who is the First Mate of the Straw Hats?', options: ['Sanji', 'Nami', 'Zoro', 'Usopp'], correct: 2, typingText: 'Roronoa Zoro serves as first mate and combatant of the Straw Hat Pirates, being the second strongest member behind only Luffy himself.' },
  { id: 20, category: 'One Piece', question: 'What are the walls in One Piece that separate the seas?', options: ['Red Line and Grand Line', 'Calm Belt and New World', 'Grand Line and Calm Belt', 'Red Line and Calm Belt'], correct: 0, typingText: 'The Red Line is the only continent that circles the globe while the Grand Line is the most dangerous sea route crossing it at two perpendicular points.' },
  // ── NEW GEN 2010s ────────────────────────────────────────────
  { id: 21, category: 'New Gen (2010s)', question: 'What are the walls in Attack on Titan called?', options: ['Rose, Maria, Sina', 'Alpha, Beta, Gamma', 'Wall Titan, Wall Colossal, Wall Armored', 'Maria, Rose, Sina'], correct: 3, typingText: 'The three walls protecting humanity in Attack on Titan are Wall Maria, Wall Rose, and Wall Sina, with the royal capital Mitras at the center.' },
  { id: 22, category: 'New Gen (2010s)', question: 'What is the quirk of Izuku Midoriya (Deku)?', options: ['Explosion', 'Half-Cold Half-Hot', 'Hardening', 'One For All'], correct: 3, typingText: 'One For All is the quirk passed to Izuku Midoriya by All Might. It stores accumulated power across generations and can be transferred through will.' },
  { id: 23, category: 'New Gen (2010s)', question: 'What game is Sword Art Online set in?', options: ['Gun Gale Online', 'ALfheim Online', 'Sword Art Online', 'Underworld'], correct: 2, typingText: 'Sword Art Online is the infamous VRMMORPG where players are trapped and must clear 100 floors of Aincrad to escape, with real death for in-game deaths.' },
  { id: 24, category: 'New Gen (2010s)', question: "What is the name of Natsu's dragon parent in Fairy Tail?", options: ['Grandeeney', 'Metallicana', 'Skiadrum', 'Igneel'], correct: 3, typingText: 'Igneel is the Fire Dragon King who raised Natsu Dragneel and taught him Dragon Slayer Magic before mysteriously disappearing on July 7, X777.' },
  { id: 25, category: 'New Gen (2010s)', question: 'Who is the No. 1 Hero in My Hero Academia?', options: ['Endeavor', 'All Might', 'Hawks', 'Edgeshot'], correct: 1, typingText: 'All Might, whose real name is Toshinori Yagi, was the No. 1 Hero and Symbol of Peace until his power was spent in his final battle against All For One.' },
  { id: 26, category: 'New Gen (2010s)', question: "In Re:Zero, what is Subaru's special ability?", options: ['Time Stop', 'Return by Death', 'Time Reversal', 'Resurrection'], correct: 1, typingText: "Return by Death is Subaru's mysterious ability in Re:Zero that resurrects him at a save point after dying, though he cannot tell anyone about this power." },
  { id: 27, category: 'New Gen (2010s)', question: "What is the Survey Corps' mission in AoT?", options: ['Guard the walls', 'Fight Titans outside walls', 'Maintain order in the city', 'Protect the royal family'], correct: 1, typingText: "The Survey Corps ventures beyond the walls to fight Titans, gather intelligence, and reclaim territory, suffering enormous casualties for humanity's freedom." },
  { id: 28, category: 'New Gen (2010s)', question: 'What type of magic does Gray Fullbuster use?', options: ['Fire Magic', 'Shadow Magic', 'Ice Make Magic', 'Heaven Magic'], correct: 2, typingText: 'Gray Fullbuster uses Ice Make Magic, a Molding Magic that allows him to create objects and weapons from ice instantaneously with both hands.' },
  { id: 29, category: 'New Gen (2010s)', question: "What is Killua's family famous for in HxH?", options: ['Nen research', 'Assassins', 'Hunters', 'Chimera Ant experiments'], correct: 1, typingText: 'The Zoldyck Family is one of the most feared assassin families in Hunter x Hunter, known for killing even heads of state for the right price.' },
  { id: 30, category: 'New Gen (2010s)', question: 'What power system does Hunter x Hunter use?', options: ['Chakra', 'Spirit Energy', 'Nen', 'Reiatsu'], correct: 2, typingText: 'Nen is the power system in Hunter x Hunter involving manipulation of life energy called aura. Each user has one type: Enhancer, Emitter, Transmuter, Conjurer, Manipulator, or Specialist.' },
  // ── MODERN 2020s ─────────────────────────────────────────────
  { id: 31, category: 'Modern (2020s)', question: "What is Tanjiro Kamado's signature breathing style?", options: ['Thunder Breathing', 'Water Breathing', 'Total Concentration', 'Sun Breathing'], correct: 3, typingText: 'Tanjiro masters Sun Breathing, also known as Hinokami Kagura, the original and most powerful breathing style from which all others are derived.' },
  { id: 32, category: 'Modern (2020s)', question: "What is Gojo's iconic technique in Jujutsu Kaisen?", options: ['Malevolent Shrine', 'Black Flash', 'Infinity + Six Eyes', 'Divergent Fist'], correct: 2, typingText: "Satoru Gojo's Infinity combined with his Six Eyes makes him the strongest sorcerer alive. Infinity deflects all attacks by slowing them infinitely before contact." },
  { id: 33, category: 'Modern (2020s)', question: "What is Chainsaw Man's devil form merged with Denji?", options: ['Gun Devil', 'Chainsaw Devil', 'Bat Devil', 'Zombie Devil'], correct: 1, typingText: 'Denji merges with the Chainsaw Devil Pochita to become Chainsaw Man, a powerful hybrid devil hunter who can pull chainsaws from his own body.' },
  { id: 34, category: 'Modern (2020s)', question: "In Spy x Family, what is Anya's secret power?", options: ['Super strength', 'Telepathy', 'Time travel', 'Invisibility'], correct: 1, typingText: 'Anya is a telepath who can read minds. She knows Lloyd is a spy and Yor is an assassin but keeps quiet because she loves her unconventional family.' },
  { id: 35, category: 'Modern (2020s)', question: 'Which studio animated Demon Slayer?', options: ['MAPPA', 'Bones', 'ufotable', 'Madhouse'], correct: 2, typingText: 'ufotable animated Demon Slayer: Kimetsu no Yaiba, becoming famous for breathtaking water, flame, and thunder visual effects that redefined anime action.' },
  { id: 36, category: 'Modern (2020s)', question: 'What is the highest rank in Jujutsu Kaisen for sorcerers?', options: ['Grade 1', 'Special Grade', 'Grade 0', 'Elite Grade'], correct: 1, typingText: 'Special Grade is the highest rank a Jujutsu Sorcerer can achieve. Only a handful like Gojo Satoru, Yuta Okkotsu, and Geto Suguru ever reach this level.' },
  { id: 37, category: 'Modern (2020s)', question: "What is Rimuru's slime nation called?", options: ['Tempest', 'Veldora', 'Jura', 'Falmuth'], correct: 0, typingText: 'Tempest, also known as the Jura Tempest Federation, is the monster nation founded by Rimuru after reincarnating as an all-devouring slime in Jura Forest.' },
  { id: 38, category: 'Modern (2020s)', question: "What is Eren's plan in AoT's final arc?", options: ['Stop all titans', 'The Rumbling', 'Free Eldia', 'Destroy Marley only'], correct: 1, typingText: "The Rumbling is Eren Yeager's plan to unleash Wall Titans to trample all non-Eldian life outside Paradis, ensuring his homeland's permanent freedom at any cost." },
  { id: 39, category: 'Modern (2020s)', question: 'Who voices Zenitsu in Demon Slayer (Japanese)?', options: ['Natsuki Hanae', 'Yoshitsugu Matsuoka', 'Hiro Shimono', 'Nobuhiko Okamoto'], correct: 2, typingText: 'Hiro Shimono voices Zenitsu Agatsuma in the Japanese version of Demon Slayer, capturing his cowardly screaming and surprisingly powerful battle moments.' },
  { id: 40, category: 'Modern (2020s)', question: 'What does "Plus Ultra" mean in My Hero Academia?', options: ['Beyond Limits', 'Go Forward', 'Go Beyond', 'Even Further Beyond'], correct: 2, typingText: 'Plus Ultra means Go Beyond and is the battle cry of UA High School, urging heroes to push past their limits when all hope seems lost and the world needs saving.' },
  // ── TYPING FACTS ─────────────────────────────────────────────
  { id: 41, category: 'Typing Facts', question: 'What is the average typing speed in WPM?', options: ['20-30 WPM', '40-60 WPM', '80-100 WPM', '120+ WPM'], correct: 1, typingText: 'The average person types at 40 to 60 words per minute while professional typists and coders can often reach 80 to 100 WPM with daily practice.' },
  { id: 42, category: 'Typing Facts', question: 'Which finger should press the spacebar?', options: ['Index finger', 'Pinky finger', 'Thumb', 'Ring finger'], correct: 2, typingText: 'The thumb is responsible for pressing the spacebar in proper touch typing technique, allowing all other fingers to remain on the home row keys.' },
  { id: 43, category: 'Typing Facts', question: "What is QWERTY keyboard layout named after?", options: ["Its inventor", "Top row letter sequence", "Country of origin", "Company name"], correct: 1, typingText: 'QWERTY is named after the first six letters in the top row: Q, W, E, R, T, Y. It was designed in 1873 by Christopher Latham Sholes for typewriters.' },
  { id: 44, category: 'Typing Facts', question: 'What does WPM stand for in typing tests?', options: ['Wrists Per Minute', 'Words Per Minute', 'Weighted Performance Metric', 'Writing Processing Mode'], correct: 1, typingText: 'WPM stands for Words Per Minute. One word is typically calculated as five characters including spaces in a standard typing speed test.' },
  { id: 45, category: 'Typing Facts', question: 'Which alternative keyboard layout claims to be faster than QWERTY?', options: ['AZERTY', 'JCUKEN', 'Dvorak', 'Colemak'], correct: 2, typingText: 'The Dvorak Simplified Keyboard was designed in the 1930s to place the most common letters on the home row, theoretically increasing speed and reducing fatigue.' },
  { id: 46, category: 'Typing Facts', question: 'What is the home row on a QWERTY keyboard?', options: ['QWERTY row', 'ASDFGHJKL row', 'ZXCVBNM row', 'Number row'], correct: 1, typingText: 'The home row is ASDFGHJKL on QWERTY. Proper touch typing keeps all fingers resting here by default, minimizing travel distance for fast accurate typing.' },
  { id: 47, category: 'Typing Facts', question: 'What is the world record for fastest typing speed?', options: ['200 WPM', '256 WPM', '212 WPM', '316 WPM'], correct: 1, typingText: 'The world record for typing speed is 256 words per minute, achieved by Stella Pajunas-Garnand in 1946 on an IBM electric typewriter, a record still standing.' },
  { id: 48, category: 'Typing Facts', question: 'What is touch typing?', options: ['Typing on touchscreens', 'Typing without looking at keys', 'Typing with one hand', 'Typing very slowly'], correct: 1, typingText: 'Touch typing is the skill of typing without looking at the keyboard, relying on muscle memory with consistent home row positioning using all ten fingers.' },
  { id: 49, category: 'Typing Facts', question: 'Which key accepts autocorrect suggestions on most devices?', options: ['Tab', 'Enter', 'Space', 'Shift'], correct: 2, typingText: 'The spacebar accepts auto-correct suggestions on modern devices. It is also the most commonly pressed key in any typing session, between every word.' },
  { id: 50, category: 'Typing Facts', question: 'What fingers rest on F and J keys as home position?', options: ['Index fingers', 'Middle fingers', 'Ring fingers', 'Pinky fingers'], correct: 0, typingText: 'The index fingers rest on F and J keys, which have tactile bumps for positioning without looking. Left index covers F G T, right index covers J H N and Y.' },
];

const CATEGORIES = ['All', 'Classic 90s-00s', 'One Piece', 'New Gen (2010s)', 'Modern (2020s)', 'Typing Facts'];

const Quiz = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [phase, setPhase] = useState('lobby'); // lobby | countdown | question | typing | finished
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('luffy');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerState, setAnswerState] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [typingText, setTypingText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [floatingScores, setFloatingScores] = useState([]);
  const [inputShake, setInputShake] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const typingRef = useRef(null);

  useEffect(() => {
    const newSocket = createSocket();
    setSocket(newSocket);
    newSocket.on('quiz-joined', (data) => setParticipants(data.participants || []));
    newSocket.on('quiz-result', (data) => setParticipants(data.leaderboard || []));
    return () => newSocket.disconnect();
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'question') return;
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(iv);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQ]);

  // Live WPM/acc in typing phase
  useEffect(() => {
    if (phase !== 'typing' || !startTime) return;
    const iv = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const correct = userInput.split('').filter((c, i) => c === typingText[i]).length;
      setWpm(Math.round((correct / 5) / (elapsed / 60)));
      setAccuracy(typingText.length > 0 ? Math.round((correct / typingText.length) * 100) : 100);
    }, 150);
    return () => clearInterval(iv);
  }, [phase, startTime, userInput, typingText]);

  const handleTimeUp = () => {
    setAnswerState('wrong');
    setStreak(0);
    setCorrectStreak(0);
    setTimeout(() => moveToTyping(), 1000);
  };

  const startQuiz = () => {
    if (!playerName.trim()) return;
    const filtered = selectedCategory === 'All'
      ? ALL_QUESTIONS
      : ALL_QUESTIONS.filter(q => q.category === selectedCategory);
    // Shuffle & take 8
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
    if (socket) {
      socket.emit('join-quiz', { quizId: 'default', playerName, avatar: selectedAvatar });
    }
    setPhase('countdown');
  };

  const handleCountdownDone = () => {
    setPhase('question');
    setTimeLeft(20);
  };

  const handleAnswerSelect = (index) => {
    if (answerState !== null) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || answerState !== null) return;
    const q = questions[currentQ];
    const correct = selectedAnswer === q.correct;
    setAnswerState(correct ? 'correct' : 'wrong');

    if (correct) {
      const pts = 100 + streak * 10;
      setScore(prev => prev + pts);
      setStreak(prev => prev + 1);
      setCorrectStreak(prev => prev + 1);
      // Show floating score
      const id = Date.now();
      setFloatingScores(prev => [...prev, { id, text: `+${pts}`, color: '#00FF41' }]);
    } else {
      setStreak(0);
      setCorrectStreak(0);
    }

    setTimeout(() => moveToTyping(), 1200);
  };

  const moveToTyping = () => {
    const q = questions[currentQ];
    setTypingText(q.typingText);
    setUserInput('');
    setStartTime(Date.now());
    setPhase('typing');
    setTimeout(() => typingRef.current?.focus(), 100);
  };

  const handleTypingInput = (e) => {
    const value = e.target.value;
    setUserInput(value);

    // Check last char for shake
    if (value.length > 0) {
      const last = value.length - 1;
      if (value[last] !== typingText[last]) {
        setInputShake(true);
        setTimeout(() => setInputShake(false), 400);
      }
    }

    if (value === typingText) {
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerState(null);
      setUserInput('');
      setWpm(0);
      setAccuracy(100);
      setStartTime(null);
      setTimeLeft(20);
      setPhase('question');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setPhase('finished');
    if (socket) {
      socket.emit('quiz-complete', { quizId: 'default', score, wpm, accuracy });
    }
  };

  const removeFloatingScore = (id) => {
    setFloatingScores(prev => prev.filter(s => s.id !== id));
  };

  // ─── LOBBY ───────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['⚔️', '🌟', '🏴‍☠️', '⭐', '🧠', '⚡'].map((e, i) => (
            <div key={i} className="absolute text-5xl animate-float"
              style={{ left: `${10 + i * 15}%`, top: `${10 + i * 12}%`, animationDelay: `${i * 0.7}s`, opacity: 0.15 }}>
              {e}
            </div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8" style={{ animation: 'bounce-in 0.6s ease-out' }}>
              <div className="text-7xl mb-4 animate-bounce">🧠</div>
              <h1 className="text-5xl font-bold mb-3"
                style={{ fontFamily: 'Audiowide,sans-serif', background: 'linear-gradient(135deg,#00D9FF,#FFD700,#B026FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                QUIZ BATTLE
              </h1>
              <p className="text-gray-400">Answer fast. Type faster. Win BIG.</p>
            </div>

            {/* Form card */}
            <div className="rounded-2xl p-8 space-y-6" style={{ background: '#1a1a2e', border: '2px solid #FFD70040', boxShadow: '0 0 40px #FFD70015' }}>
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-widest">Your Name</label>
                <input
                  type="text" value={playerName} onChange={e => setPlayerName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startQuiz()}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  style={{ background: '#0a0a0f', border: '2px solid #00D9FF40' }}
                />
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm text-gray-400 mb-3 uppercase tracking-widest">Choose Avatar</label>
                <div className="grid grid-cols-5 gap-3">
                  {['luffy', 'zoro', 'nami', 'sanji', 'chopper'].map(name => (
                    <Avatar key={name} name={name} selected={selectedAvatar === name} onClick={() => setSelectedAvatar(name)} size="md" />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-gray-400 mb-3 uppercase tracking-widest">Topic</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className="py-2 px-3 rounded-xl text-sm font-bold transition-all duration-200"
                      style={{
                        background: selectedCategory === cat ? 'linear-gradient(135deg,#00D9FF,#B026FF)' : '#0a0a0f',
                        border: selectedCategory === cat ? '2px solid #00D9FF' : '2px solid #333',
                        color: selectedCategory === cat ? '#fff' : '#666',
                        transform: selectedCategory === cat ? 'scale(1.05)' : 'scale(1)',
                      }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startQuiz} disabled={!playerName.trim()}
                className="w-full py-4 rounded-xl text-xl font-bold transition-all duration-200"
                style={{
                  background: playerName.trim() ? 'linear-gradient(135deg,#FFD700,#FF6600)' : '#333',
                  color: playerName.trim() ? '#000' : '#666',
                  fontFamily: 'Audiowide, sans-serif',
                  boxShadow: playerName.trim() ? '0 0 30px #FFD70040' : 'none',
                  cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                  transform: playerName.trim() ? 'scale(1)' : 'scale(0.98)',
                }}>
                🚀 Start Quiz Battle!
              </button>
            </div>

            <div className="text-center mt-6">
              <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── COUNTDOWN ──────────────────────────────────────────────────
  if (phase === 'countdown') {
    return <AnimatedCountdown from={3} onDone={handleCountdownDone} />;
  }

  // ─── FINISHED ───────────────────────────────────────────────────
  if (phase === 'finished') {
    const grade = score >= 700 ? 'S' : score >= 500 ? 'A' : score >= 300 ? 'B' : 'C';
    const gradeColor = grade === 'S' ? '#FFD700' : grade === 'A' ? '#00FF41' : grade === 'B' ? '#00D9FF' : '#B026FF';
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
        <Confetti count={90} />
        <div className="relative z-10 container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto">
            {/* Banner */}
            <div className="text-center mb-8" style={{ animation: 'bounce-in 0.7s ease-out' }}>
              <div className="text-8xl mb-4">🏆</div>
              <h1 className="text-6xl font-bold" style={{ fontFamily: 'Audiowide,sans-serif', color: '#FFD700', textShadow: '0 0 30px #FFD700' }}>
                QUIZ COMPLETE!
              </h1>
              <div className="text-8xl font-black mt-2" style={{ color: gradeColor, fontFamily: 'Audiowide,sans-serif', textShadow: `0 0 40px ${gradeColor}` }}>
                {grade}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Score', value: score, color: '#FFD700' },
                { label: 'WPM', value: wpm, color: '#00D9FF' },
                { label: 'Accuracy', value: `${accuracy}%`, color: '#00FF41' },
              ].map((s, i) => (
                <div key={i} className="text-center rounded-2xl py-6"
                  style={{
                    background: '#1a1a2e', border: `2px solid ${s.color}40`, boxShadow: `0 0 20px ${s.color}20`,
                    animation: `bounce-in 0.5s ease-out ${i * 0.15}s both`
                  }}>
                  <div className="text-4xl font-black" style={{ color: s.color, fontFamily: 'Orbitron,sans-serif' }}>{s.value}</div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            {participants.length > 0 && (
              <div className="rounded-2xl p-6 mb-8" style={{ background: '#1a1a2e', border: '1px solid #FFD70030' }}>
                <h3 className="text-xl font-bold mb-4 text-pirate-yellow" style={{ fontFamily: 'Audiowide,sans-serif' }}>🏆 Leaderboard</h3>
                <div className="space-y-2">
                  {participants.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: idx === 0 ? 'rgba(255,215,0,0.15)' : '#0a0a0f', border: `1px solid ${idx === 0 ? '#FFD70040' : '#333'}` }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                        <Avatar name={p.avatar} size="sm" />
                        <span className="font-bold">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neon-blue">{p.score || 0} pts</div>
                        <div className="text-xs text-gray-500">{p.wpm || 0} WPM</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button onClick={() => window.location.reload()}
                className="px-8 py-4 rounded-xl font-bold text-lg"
                style={{ background: 'linear-gradient(135deg,#FFD700,#FF6600)', color: '#000', fontFamily: 'Audiowide,sans-serif' }}>
                🔄 Play Again
              </button>
              <button onClick={() => navigate('/')}
                className="px-8 py-4 rounded-xl font-bold text-lg"
                style={{ background: '#1a1a2e', border: '2px solid #333', color: '#aaa', fontFamily: 'Audiowide,sans-serif' }}>
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQ] || {};
  const timerPct = (timeLeft / 20) * 100;
  const timerColor = timeLeft > 10 ? '#00FF41' : timeLeft > 5 ? '#FFD700' : '#FF4444';

  // ─── TYPING PHASE ───────────────────────────────────────────────
  if (phase === 'typing') {
    const correctChars = userInput.split('').filter((c, i) => c === typingText[i]).length;
    const typingProgress = typingText.length > 0 ? (userInput.length / typingText.length) * 100 : 0;
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 rounded-xl p-4" style={{ background: '#1a1a2e', border: '1px solid #333' }}>
            <div className="text-sm text-gray-400" style={{ fontFamily: 'Orbitron,sans-serif' }}>
              Q {currentQ + 1} / {questions.length}
            </div>
            <h2 className="text-lg font-bold text-neon-blue" style={{ fontFamily: 'Audiowide,sans-serif' }}>⚡ Typing Challenge</h2>
            <div className="text-lg font-bold" style={{ color: '#FFD700', fontFamily: 'Orbitron,sans-serif' }}>
              {score} pts
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'WPM', value: wpm, color: '#00D9FF' },
              { label: 'Accuracy', value: `${accuracy}%`, color: '#00FF41' },
              { label: 'Streak', value: `${streak}🔥`, color: '#FF6600' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#1a1a2e', border: `1px solid ${s.color}30` }}>
                <div className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'Orbitron,sans-serif' }}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Streak badge */}
          {correctStreak >= 3 && (
            <div className="flex justify-center mb-4">
              <StreakBadge streak={correctStreak} combo={Math.floor(correctStreak / 3)} />
            </div>
          )}

          {/* Typing progress bar */}
          <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: '#0a0a0f' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${typingProgress}%`, background: `linear-gradient(90deg, #00D9FF, #00FF41)`, boxShadow: '0 0 10px #00D9FF' }} />
          </div>

          {/* Floating scores */}
          <div className="relative">
            {floatingScores.map(s => (
              <FloatingScore key={s.id} text={s.text} color={s.color} onDone={() => removeFloatingScore(s.id)} />
            ))}
          </div>

          {/* Text */}
          <div className="rounded-2xl p-6 mb-5" style={{ background: '#1a1a2e', border: '1px solid #00D9FF30', minHeight: '180px' }}>
            <div className="text-base md:text-xl font-mono leading-relaxed" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
              {typingText.split('').map((char, idx) => {
                let color = '#444';
                if (idx < userInput.length) color = userInput[idx] === char ? '#00FF41' : '#ff4444';
                return (
                  <span key={idx} style={{ color, background: idx < userInput.length && userInput[idx] !== char ? 'rgba(255,68,68,0.2)' : 'transparent', borderBottom: idx === userInput.length ? '2px solid #00D9FF' : 'none' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>
            <input
              ref={typingRef}
              type="text" value={userInput} onChange={handleTypingInput} autoFocus
              className="w-full mt-4 px-4 py-3 bg-transparent text-white text-lg focus:outline-none rounded-xl"
              style={{
                border: inputShake ? '2px solid #FF4444' : '2px solid #00D9FF40',
                animation: inputShake ? 'shake 0.4s ease-out' : 'none',
                background: '#0a0a0f',
              }}
              placeholder="Type the text above..." />
          </div>

          <div className="text-center text-sm text-gray-600">
            {typingText.length - userInput.length} characters remaining
          </div>
        </div>
      </div>
    );
  }

  // ─── QUESTION PHASE ─────────────────────────────────────────────
  const optionLabels = ['A', 'B', 'C', 'D'];
  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-4 rounded-2xl p-4"
          style={{ background: '#1a1a2e', border: '1px solid #333' }}>
          <div className="flex items-center gap-3">
            <Avatar name={selectedAvatar} size="sm" />
            <span className="font-bold text-sm">{playerName}</span>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Question</div>
            <div className="font-bold" style={{ fontFamily: 'Orbitron,sans-serif', color: '#00D9FF' }}>
              {currentQ + 1} / {questions.length}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
            <div className="font-bold" style={{ fontFamily: 'Orbitron,sans-serif', color: '#FFD700' }}>{score}</div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Time remaining</span>
            <span className="font-bold" style={{ color: timerColor, fontFamily: 'Orbitron,sans-serif', animation: timeLeft <= 5 ? 'pulse-neon 0.5s infinite' : '' }}>
              {timeLeft}s
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#0a0a0f' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timerPct}%`, background: `linear-gradient(90deg, ${timerColor}80, ${timerColor})`, boxShadow: `0 0 8px ${timerColor}` }} />
          </div>
        </div>

        {/* Category badge */}
        <div className="flex justify-center mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(0,217,255,0.15)', border: '1px solid #00D9FF40', color: '#00D9FF' }}>
            {question.category || 'Quiz'}
          </span>
        </div>

        {/* Floating scores */}
        <div className="relative h-0">
          {floatingScores.map(s => (
            <FloatingScore key={s.id} text={s.text} color={s.color} onDone={() => removeFloatingScore(s.id)} />
          ))}
        </div>

        {/* Streak badge */}
        {streak >= 3 && (
          <div className="flex justify-center mb-4">
            <StreakBadge streak={streak} combo={Math.floor(streak / 3) + 1} />
          </div>
        )}

        {/* Question */}
        <div className="rounded-2xl p-6 mb-6 text-center"
          style={{ background: '#1a1a2e', border: '2px solid #00D9FF30', boxShadow: '0 0 30px rgba(0,217,255,0.05)', animation: 'pop-in 0.4s ease-out' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed" style={{ fontFamily: 'Audiowide,sans-serif' }}>
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(question.options || []).map((opt, idx) => {
            let bg = 'linear-gradient(135deg, #1a1a2e, #0a0a0f)';
            let border = '#333';
            let shadow = 'none';
            let extraAnim = '';

            if (answerState !== null) {
              if (idx === question.correct) {
                bg = 'linear-gradient(135deg, rgba(0,255,65,0.3), rgba(0,255,65,0.1))';
                border = '#00FF41';
                shadow = '0 0 20px #00FF4140';
                extraAnim = 'answer-correct 0.6s ease-out';
              } else if (idx === selectedAnswer && answerState === 'wrong') {
                bg = 'linear-gradient(135deg, rgba(255,68,68,0.3), rgba(255,68,68,0.1))';
                border = '#FF4444';
                shadow = '0 0 20px #FF444440';
                extraAnim = 'shake 0.5s ease-out';
              }
            } else if (selectedAnswer === idx) {
              bg = 'linear-gradient(135deg, rgba(0,217,255,0.2), rgba(176,38,255,0.2))';
              border = '#00D9FF';
              shadow = '0 0 20px #00D9FF40';
            }

            return (
              <button key={idx} onClick={() => handleAnswerSelect(idx)}
                className="p-5 rounded-2xl text-left transition-all duration-200"
                style={{
                  background: bg, border: `2px solid ${border}`, boxShadow: shadow, animation: extraAnim,
                  transform: selectedAnswer === idx && answerState === null ? 'scale(1.02)' : 'scale(1)',
                  cursor: answerState !== null ? 'default' : 'pointer'
                }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg"
                    style={{ background: selectedAnswer === idx ? '#00D9FF' : '#333', color: selectedAnswer === idx ? '#000' : '#666', fontFamily: 'Orbitron,sans-serif' }}>
                    {optionLabels[idx]}
                  </div>
                  <span className="text-lg font-bold text-white">{opt}</span>
                  {answerState !== null && idx === question.correct && (
                    <span className="ml-auto text-2xl">✅</span>
                  )}
                  {answerState === 'wrong' && idx === selectedAnswer && idx !== question.correct && (
                    <span className="ml-auto text-2xl">❌</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit */}
        {answerState === null && (
          <div className="flex justify-center">
            <button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}
              className="px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-200"
              style={{
                background: selectedAnswer !== null ? 'linear-gradient(135deg,#FFD700,#FF6600)' : '#333',
                color: selectedAnswer !== null ? '#000' : '#666',
                fontFamily: 'Audiowide,sans-serif',
                boxShadow: selectedAnswer !== null ? '0 0 30px #FFD70040' : 'none',
                transform: selectedAnswer !== null ? 'scale(1.03)' : 'scale(1)',
                cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
              }}>
              ✅ Submit Answer
            </button>
          </div>
        )}

        {/* Answer feedback */}
        {answerState !== null && (
          <div className="text-center mt-4" style={{ animation: 'bounce-in 0.4s ease-out' }}>
            <div className="text-4xl font-black" style={{
              color: answerState === 'correct' ? '#00FF41' : '#FF4444',
              fontFamily: 'Audiowide,sans-serif',
              textShadow: `0 0 20px ${answerState === 'correct' ? '#00FF41' : '#FF4444'}`,
            }}>
              {answerState === 'correct' ? '🎉 CORRECT! +' + (100 + streak * 10) + ' pts' : '❌ WRONG!'}
            </div>
            <div className="text-gray-400 mt-1 text-sm">Moving to typing challenge...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;

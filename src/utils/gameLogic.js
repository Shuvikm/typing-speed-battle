// Calculate Words Per Minute
export const calculateWPM = (correctChars, timeInSeconds) => {
  if (timeInSeconds === 0) return 0;
  const words = correctChars / 5; // Average word length is 5 characters
  const minutes = timeInSeconds / 60;
  return Math.round(words / minutes);
};

// Calculate Accuracy
export const calculateAccuracy = (correctChars, totalChars) => {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
};

// ─── Expanded Passage Pool ────────────────────────────────────────────────────
const ALL_PASSAGES = {
  easy: [
    // Anime
    "Luffy will become the Pirate King! The Straw Hat crew sails the Grand Line.",
    "Naruto believed in hard work and friendship above all else in life.",
    "Goku loves rice balls after a long day of intense training with friends.",
    "Pikachu is the most famous Pokemon in the entire world of creatures.",
    "Edward Elric searches for the Philosopher Stone to restore his younger brother.",
    "Totoro lives in the forest and is a friendly spirit of the ancient nature.",
    "Sailor Moon fights for love and justice under the light of the moon.",
    "Eren Yeager swore to exterminate every Titan beyond the walls forever.",
    // Tech
    "The web browser sends an HTTP request to the server and waits for a response.",
    "JavaScript runs in the browser and makes web pages interactive for users.",
    "Git tracks changes in your code so you can roll back mistakes any time.",
    "A function takes input, processes it, and returns an output to the caller.",
    // Science
    "Water boils at one hundred degrees Celsius at standard atmospheric pressure.",
    "The Earth orbits the Sun once every three hundred and sixty five days.",
    "Gravity pulls objects toward each other based on their mass and distance.",
    // Sports
    "A soccer match lasts ninety minutes and is played with eleven players per side.",
    "The fastest runners in the world complete one hundred meters in under ten seconds.",
    "Basketball was invented by James Naismith in eighteen ninety one in Canada.",
  ],
  medium: [
    // Anime
    "In the world of One Piece, Devil Fruits grant incredible powers to those who consume them. The Grand Line is a dangerous sea where only the strongest pirates survive and thrive.",
    "Naruto Uzumaki grew up as an outcast in the Hidden Leaf Village, but his determination and the power of the Nine-Tailed Fox drove him to become the greatest Hokage in history.",
    "The Hero Association ranks heroes from C to S class based on power and contribution. Saitama remains untested in power despite defeating every enemy with a single casual punch.",
    "Fullmetal Alchemist explores the cost of power through the law of Equivalent Exchange. Edward and Alphonse Elric journey across Amestris seeking the Philosopher Stone to fix their bodies.",
    "Attack on Titan began as a story of humanity trapped behind walls, but gradually revealed layers of political conspiracy, cycles of hatred, and the tragic cost of freedom.",
    "Demon Slayer follows Tanjiro Kamado, who becomes a demon slayer after his family is slaughtered. He fights to turn his sister Nezuko back into a human using breathing techniques.",
    "My Hero Academia imagines a world where eighty percent of humanity has a superpower called a Quirk. Izuku Midoriya is born Quirkless but inherits the greatest power from his idol.",
    // Tech
    "React uses a virtual DOM to efficiently update only the parts of the page that have changed. Components are the building blocks of every React application you will ever create.",
    "A REST API communicates over HTTP using standard verbs: GET to fetch data, POST to create, PUT to update, and DELETE to remove resources from the server database.",
    "Machine learning algorithms learn patterns from training data and apply them to new inputs. Neural networks layer these transformations to identify complex features in images and text.",
    "TypeScript adds static type checking to JavaScript, catching errors at compile time before your code runs. This leads to more maintainable codebases and better developer tooling.",
    // Science
    "DNA carries the genetic instructions for the development and function of all known organisms. It consists of two strands wound around each other to form a double helix structure.",
    "Black holes form when massive stars collapse under gravity at the end of their lives. Their gravitational pull is so extreme that not even light can escape beyond the event horizon.",
    // Philosophy
    "Socrates believed that the unexamined life is not worth living. Through dialogue and questioning he sought to expose ignorance and guide others toward deeper understanding of virtue.",
    // Sports
    "The Tour de France is the world's most prestigious cycling race, covering over three thousand kilometers across France in twenty one stages over approximately three weeks in July.",
    "Michael Jordan won six NBA championships with the Chicago Bulls, earning six Finals MVP awards along the way and fundamentally changing the global reach and popularity of basketball.",
  ],
  hard: [
    // Anime
    "The Will of D is a mysterious initial carried by certain individuals throughout history, suggesting a connection to the ancient kingdom and the Void Century. The World Government has suppressed this truth for eight hundred years, and only those who reach Laugh Tale can discover the complete secrets of the One Piece world.",
    "Alchemy is the science of understanding, deconstructing, and reconstructing matter. However, it is not an all-powerful art; it is impossible to create something out of nothing. If one wishes to obtain something, something of equal value must be given. This is the Law of Equivalent Exchange, the basis of all alchemy, and what Edward Elric sacrificed his arm to learn firsthand beyond the Gate of Truth.",
    "The concept of Haki is a mysterious power found in every living organism in the world. Haki is dormant in every living person but only a number of people are able to bring it out. There are three main types: Kenbunshoku Haki for perception, Busoshoku Haki for armament, and the rare Haoshoku Haki, which only one in several million people can use to overpower the will of others.",
    "In the shinobi world, chakra is the essential life force in every shinobi. It is formed through two components: physical energy collected from every cell of the body, and spiritual energy cultivated through experience and meditation. A shinobi who learns to perfectly balance these two energies can perform extraordinary jutsu, shaping the battlefield in ways that ordinary humans can never comprehend.",
    "The Survey Corps ventures beyond the walls to observe, study, and combat the Titans. Every expedition results in significant casualties, yet soldiers march forth armed with Omni-Directional Mobility Gear, certain that sacrifice today means freedom for future generations. The vertical maneuvering ability allows skilled soldiers to swing between structures at high speed and strike vulnerable Titan napes.",
    "Demon Slayer breathing techniques are derived from Total Concentration Breathing, a method of inhaling maximum oxygen to raise physical and mental performance far beyond human limits. Each style is named after a natural element — Flame, Water, Wind, Stone, Thunder, and the derivative Sun Breathing, which is the original form from which all other styles were derived centuries ago.",
    // Tech
    "The event loop is the mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It continuously checks the call stack and, if empty, pushes the first item from the callback queue onto the stack. This design enables asynchronous programming with callbacks, promises, and the async-await syntax introduced in ES2017.",
    "A distributed system is a network of computers that coordinate to achieve a common goal. CAP theorem states that a distributed system can only guarantee two of three properties simultaneously: consistency, availability, and partition tolerance. Engineers must carefully choose which property to sacrifice based on the specific requirements of their application.",
    "Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It groups containers into logical units called pods, managed by higher-level abstractions like Deployments and StatefulSets, allowing complex microservices architectures to scale efficiently across clusters of machines.",
    // Science
    "Quantum entanglement is a phenomenon in which two particles become correlated in such a way that the quantum state of one particle cannot be described independently of the others, even when separated by large distances. Einstein famously referred to it as spooky action at a distance, yet experiments have repeatedly confirmed its reality with extraordinary precision.",
    "The theory of general relativity, published by Albert Einstein in 1915, describes gravity not as a traditional force but as a curvature of spacetime caused by the presence of mass and energy. This curvature causes objects to follow curved paths called geodesics. Its predictions, including gravitational time dilation and the bending of light, have been confirmed by numerous experimental observations.",
    // Philosophy
    "Friedrich Nietzsche proposed that as traditional religious and metaphysical frameworks lose their authority, humanity faces nihilism — the absence of inherent meaning or value. His concept of the Ubermensch represents the individual who creates new values and meaning in a world without absolute truths. The will to power, for Nietzsche, is not domination of others but mastery over oneself.",
    // Sports
    "The Olympics trace their origins to ancient Greece, where they were held every four years at Olympia beginning in 776 BCE as a religious and athletic festival honoring Zeus. The modern Olympics were revived in 1896 by Pierre de Coubertin, and since then have grown into the world's leading international sporting event, featuring thousands of athletes from over two hundred countries.",
  ],
};

// Generate random text for typing
export const generateText = (difficulty = 'medium') => {
  const pool = ALL_PASSAGES[difficulty] || ALL_PASSAGES.medium;
  return pool[Math.floor(Math.random() * pool.length)];
};

/** Returns a random passage across ALL difficulties and categories. */
export const getRandomPassage = (difficulty = 'medium') => generateText(difficulty);

/** Returns all passages for a difficulty (useful for shuffle-based modes). */
export const getAllPassages = (difficulty = 'medium') => [...(ALL_PASSAGES[difficulty] || ALL_PASSAGES.medium)];

// Get rank title based on WPM
export const getRankTitle = (wpm) => {
  if (wpm >= 100) return { title: "Pirate King", color: "text-pirate-yellow", glow: "text-glow-blue" };
  if (wpm >= 80) return { title: "Yonko", color: "text-purple-400", glow: "text-glow-purple" };
  if (wpm >= 60) return { title: "Super Rookie", color: "text-neon-blue", glow: "text-glow-blue" };
  if (wpm >= 40) return { title: "Pirate Captain", color: "text-green-400", glow: "text-glow-green" };
  if (wpm >= 20) return { title: "Marine Captain", color: "text-blue-400" };
  return { title: "Cabin Boy", color: "text-gray-400" };
};

// Check if character is correct
export const checkChar = (expected, typed) => {
  return expected === typed;
};

// Calculate combo streak
export const calculateCombo = (correctStreak) => {
  return Math.floor(correctStreak / 10); // Combo every 10 correct chars
};

// ─── localStorage Best WPM Helpers ───────────────────────────────────────────

const LB_KEY = 'tsb_leaderboard'; // { "15": [wpm, wpm, ...], "60": [...] }

/** Returns the user's best WPM for a given duration (seconds), or 0. */
export const getBestWpm = (durationSec) => {
  try {
    const data = JSON.parse(localStorage.getItem(LB_KEY) || '{}');
    const scores = data[String(durationSec)] || [];
    return scores.length > 0 ? Math.max(...scores) : 0;
  } catch {
    return 0;
  }
};

/** Saves a WPM score for a given duration and returns whether it is a new personal best. */
export const saveBestWpm = (durationSec, wpm) => {
  try {
    const data = JSON.parse(localStorage.getItem(LB_KEY) || '{}');
    const key = String(durationSec);
    const scores = data[key] || [];
    const previousBest = scores.length > 0 ? Math.max(...scores) : 0;
    scores.push(wpm);
    // Keep only top 10 scores
    scores.sort((a, b) => b - a);
    data[key] = scores.slice(0, 10);
    localStorage.setItem(LB_KEY, JSON.stringify(data));
    return wpm > previousBest;
  } catch {
    return false;
  }
};

/** Returns the top-5 scores for a given duration, sorted descending. */
export const getLeaderboard = (durationSec) => {
  try {
    const data = JSON.parse(localStorage.getItem(LB_KEY) || '{}');
    const scores = data[String(durationSec)] || [];
    return [...scores].sort((a, b) => b - a).slice(0, 5);
  } catch {
    return [];
  }
};

/** Clears all stored stats, leaderboards, and personal bests from localStorage. */
export const clearAllStats = () => {
  try {
    const WORDS_KEY = 'tsb_words_best';
    const WPM_HISTORY_KEY = 'tsb_wpm_history';
    localStorage.removeItem(LB_KEY);
    localStorage.removeItem(WORDS_KEY);
    localStorage.removeItem(WPM_HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
};

/** Returns a summary object of all recorded stats for export/display. */
export const exportStats = () => {
  try {
    const lbData = JSON.parse(localStorage.getItem(LB_KEY) || '{}');
    const wordsBest = parseInt(localStorage.getItem('tsb_words_best') || '0', 10);
    return { leaderboards: lbData, wordsBest, exportedAt: new Date().toISOString() };
  } catch {
    return null;
  }
};

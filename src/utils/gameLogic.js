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

// Generate random text for typing
export const generateText = (difficulty = 'medium') => {
  const texts = {
    easy: [
      "The quick brown fox jumps over the lazy dog. This is a simple sentence for beginners.",
      "One Piece is the greatest anime of all time. Luffy will become the Pirate King!",
      "The Straw Hat crew sails the Grand Line searching for the ultimate treasure.",
      "Naruto always believed in hard work and friendship above all else.",
      "Goku loves to eat rice balls after a long day of intense training.",
      "Pikachu is the most famous Pokemon in the entire world.",
      "Totoro lives in the forest and is a friendly spirit of nature.",
      "Edward Elric searches for the Philosopher Stone to restore his brother.",
    ],
    medium: [
      "In the world of One Piece, Devil Fruits grant incredible powers to those who consume them. The Grand Line is a dangerous sea where only the strongest pirates survive. The Going Merry was the first ship of the Straw Hat Pirates, carrying them through countless adventures.",
      "The Thousand Sunny replaced the Going Merry and became the new home of Luffy and his crew. Each crew member has unique abilities that make them essential to the team. Together they face powerful enemies and overcome impossible challenges.",
      "Naruto Uzumaki grew up as an outcast in the Hidden Leaf Village, but his determination and the power of the Nine-Tailed Fox within him drove him to become the greatest Hokage.",
      "The Hero Association ranks heroes from C to S class based on their power and contribution to society. Saitama remains unranked in power despite being able to defeat every enemy with a single punch.",
    ],
    hard: [
      "The Will of D is a mysterious initial carried by certain individuals throughout history, suggesting a connection to the ancient kingdom and the Void Century. The World Government has hidden the true history for eight hundred years, and only those who reach Laugh Tale can discover the secrets of the world. The Ancient Weapons, Poseidon, Pluton, and Uranus, hold the power to reshape the entire world.",
      "Alchemy is the science of understanding, deconstructing, and reconstructing matter. However, it is not an all-powerful art; it is impossible to create something out of nothing. If one wishes to obtain something, something of equal value must be given. This is the Law of Equivalent Exchange, the basis of all alchemy, and what Edward Elric sacrificed his arm and leg to learn firsthand beyond the Gate of Truth.",
      "The concept of Haki is a mysterious power that is found in every living organism in the world. It is not that different from the force of will. Haki is dormant in every living person but only a certain number of people are able to bring it out. There are three main types: Kenbunshoku, Busoshoku, and the rare Haoshoku Haki, which only one in several million people can use.",
      "In the shinobi world, chakra is the essential life force in every shinobi. It is formed through two components: physical energy collected from every cell of the body, and spiritual energy cultivated through experience and meditation. A shinobi who learns to balance these two energies can perform extraordinary jutsu, shaping the battlefield in ways ordinary humans cannot comprehend.",
      "The Survey Corps, also known as the Scouting Legion, is the branch of the military most directly involved in the goal of humanity's survival. They venture beyond the safety of the walls to observe, study, and ultimately combat the Titans. Every expedition results in significant casualties, yet the soldiers march forth armed with Omni-Directional Mobility Gear, certain that sacrifice today means freedom for future generations.",
    ],
  };

  const selectedTexts = texts[difficulty] || texts.medium;
  return selectedTexts[Math.floor(Math.random() * selectedTexts.length)];
};

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

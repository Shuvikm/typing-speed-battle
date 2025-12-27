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
    ],
    medium: [
      "In the world of One Piece, Devil Fruits grant incredible powers to those who consume them. The Grand Line is a dangerous sea where only the strongest pirates survive. The Going Merry was the first ship of the Straw Hat Pirates, carrying them through countless adventures.",
      "The Thousand Sunny replaced the Going Merry and became the new home of Luffy and his crew. Each crew member has unique abilities that make them essential to the team. Together they face powerful enemies and overcome impossible challenges.",
    ],
    hard: [
      "The Will of D is a mysterious initial carried by certain individuals throughout history, suggesting a connection to the ancient kingdom and the Void Century. The World Government has hidden the true history for eight hundred years, and only those who reach Laugh Tale can discover the secrets of the world. The Ancient Weapons, Poseidon, Pluton, and Uranus, hold the power to reshape the entire world.",
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


/**
 * IT Track Institute - Typing Master
 * Comprehensive Word Banks, Quotes & Code Snippets
 */

const WORDS_EASY = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "fast", "mind", "learn"
];

const WORDS_MEDIUM = [
  "institute", "technology", "software", "development", "computer", "keyboard",
  "practice", "accuracy", "performance", "student", "challenge", "learning",
  "mastery", "efficiency", "typing", "digital", "network", "system",
  "database", "interface", "display", "responsive", "advanced", "education",
  "creative", "solution", "project", "discipline", "focus", "speed",
  "algorithm", "engineer", "professional", "success", "future", "knowledge",
  "internet", "modern", "design", "component", "platform", "terminal",
  "command", "session", "progress", "metric", "result", "certificate"
];

const WORDS_HARD = [
  "extraordinary", "sophisticated", "synchronization", "cryptography",
  "architecture", "authentication", "optimization", "infrastructure",
  "asynchronous", "deterministic", "cybersecurity", "countermeasure",
  "multithreading", "vulnerability", "maintainability", "compatibility",
  "encapsulation", "polymorphism", "computational", "telecommunication",
  "standardization", "electromagnetic", "reproducibility", "microprocessor"
];

const QUOTES = [
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman"
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds"
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson"
  },
  {
    text: "Continuous effort, not strength or intelligence, is the key to unlocking our potential.",
    author: "Winston Churchill"
  },
  {
    text: "At IT Track Institute, dedication today builds the technological leadership of tomorrow.",
    author: "IT Track Philosophy"
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler"
  }
];

const CODE_SNIPPETS = [
  "const calculateWPM = (chars, time) => Math.round((chars / 5) / (time / 60));",
  "function trackAccuracy(correct, total) { return ((correct / total) * 100).toFixed(1); }",
  "document.addEventListener('keydown', (event) => { if (event.key === 'Tab') resetTest(); });",
  "const institute = { name: 'IT Track', courses: ['Web Dev', 'Typing', 'Python'] };",
  "export async function fetchUserData(id) { const response = await fetch(`/api/user/${id}`); return response.json(); }",
  "for (let i = 0; i < words.length; i++) { if (words[i].isCorrect) score += 10; }",
  "const observer = new IntersectionObserver((entries) => { entries.forEach(e => e.target.classList.add('visible')); });"
];

/**
 * Returns a pool of words based on current mode and settings
 */
function generateTestContent(mode, subOption, difficulty = "medium") {
  if (mode === "quotes") {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return {
      text: randomQuote.text,
      words: randomQuote.text.split(" "),
      author: randomQuote.author
    };
  }

  if (mode === "code") {
    const randomCode = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    return {
      text: randomCode,
      words: randomCode.split(" "),
      author: "JavaScript Standard"
    };
  }

  // Word pool based on difficulty
  let pool = [...WORDS_EASY];
  if (difficulty === "medium") {
    pool = pool.concat(WORDS_MEDIUM);
  } else if (difficulty === "hard") {
    pool = pool.concat(WORDS_MEDIUM, WORDS_HARD);
  }

  // Determine how many words we need
  let count = 40;
  if (mode === "words") {
    count = parseInt(subOption, 10) || 25;
  } else if (mode === "time") {
    // Generate enough words so fast typists won't run out during 15s - 120s
    count = Math.max(70, (parseInt(subOption, 10) || 30) * 3);
  }

  const generatedWords = [];
  for (let i = 0; i < count; i++) {
    const randWord = pool[Math.floor(Math.random() * pool.length)];
    generatedWords.push(randWord);
  }

  return {
    text: generatedWords.join(" "),
    words: generatedWords,
    author: null
  };
}

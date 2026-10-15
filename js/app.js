/**
 * IT Track Institute - Typing Master
 * Core Application Engine & State Machine
 */

class TypingApp {
  constructor() {
    // State
    this.mode = localStorage.getItem("ittrack_mode") || "time";
    this.subOption = localStorage.getItem("ittrack_sub_option") || "30";
    this.difficulty = localStorage.getItem("ittrack_difficulty") || "medium";
    this.theme = localStorage.getItem("ittrack_theme") || "cyber";

    this.wordsList = [];
    this.currentWordIdx = 0;
    this.currentCharIdx = 0;
    this.typedHistory = []; // Array of arrays of typed chars per word
    this.status = "waiting"; // 'waiting' | 'running' | 'finished'

    this.timer = 30;
    this.timerDuration = 30;
    this.timerInterval = null;
    this.startTime = null;
    this.endTime = null;

    this.totalTypedChars = 0;
    this.totalCorrectChars = 0;
    this.totalErrors = 0;

    // References
    this.virtualKeyboard = null;
    this.initDOMElements();
  }

  initDOMElements() {
    this.dom = {
      wordsContainer: document.getElementById("words-container"),
      hiddenInput: document.getElementById("hidden-input"),
      typingBox: document.getElementById("typing-box"),
      caret: document.getElementById("caret"),
      progressBar: document.getElementById("test-progress-bar"),
      
      // Live Metrics
      statTimer: document.getElementById("stat-timer"),
      statWpm: document.getElementById("stat-wpm"),
      statAcc: document.getElementById("stat-acc"),
      statErrors: document.getElementById("stat-errors"),

      // Controls
      restartBtn: document.getElementById("restart-btn"),
      themeSelect: document.getElementById("theme-select"),
      soundSelect: document.getElementById("sound-select"),
      subOptionsGroup: document.getElementById("sub-options-group"),
      historyBtn: document.getElementById("history-btn"),

      // Modals
      resultsModal: document.getElementById("results-modal"),
      closeResultsBtn: document.getElementById("close-results-btn"),
      tryAgainBtn: document.getElementById("try-again-btn"),
      resWpm: document.getElementById("res-wpm"),
      resAcc: document.getElementById("res-acc"),
      resRawWpm: document.getElementById("res-raw-wpm"),
      resCorrect: document.getElementById("res-correct"),
      resErrors: document.getElementById("res-errors"),
      resTime: document.getElementById("res-time"),
      rankTitle: document.getElementById("rank-title"),
      rankDesc: document.getElementById("rank-desc"),
      rankMedal: document.getElementById("rank-medal"),

      // Certificate
      certStudentInput: document.getElementById("cert-student-name"),
      certGenerateBtn: document.getElementById("cert-generate-btn"),
      certModal: document.getElementById("certificate-modal"),
      closeCertBtn: document.getElementById("close-cert-btn"),
      printCertBtn: document.getElementById("print-cert-btn"),
      certRecipientName: document.getElementById("cert-recipient-name"),
      certStatWpm: document.getElementById("cert-stat-wpm"),
      certStatAcc: document.getElementById("cert-stat-acc"),
      certStatRank: document.getElementById("cert-stat-rank"),
      certDate: document.getElementById("cert-date"),
      certSerial: document.getElementById("cert-serial"),

      // History
      historyModal: document.getElementById("history-modal"),
      closeHistoryBtn: document.getElementById("close-history-btn"),
      historyTableBody: document.getElementById("history-table-body"),
      clearHistoryBtn: document.getElementById("clear-history-btn")
    };
  }

  init() {
    this.virtualKeyboard = new VirtualKeyboard();
    this.applyTheme(this.theme);
    this.setupEventListeners();
    this.renderSubOptions();
    this.resetTest();
  }

  setupEventListeners() {
    // Focus typing on click
    this.dom.typingBox.addEventListener("click", () => {
      this.dom.hiddenInput.focus();
      this.dom.typingBox.classList.remove("unfocused");
      this.dom.typingBox.classList.add("focused");
    });

    this.dom.hiddenInput.addEventListener("blur", () => {
      this.dom.typingBox.classList.add("unfocused");
      this.dom.typingBox.classList.remove("focused");
    });

    this.dom.hiddenInput.addEventListener("focus", () => {
      this.dom.typingBox.classList.remove("unfocused");
      this.dom.typingBox.classList.add("focused");
    });

    // Keystroke input handling
    this.dom.hiddenInput.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Global shortcut: Tab + Enter or Escape to restart
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.resetTest();
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.resetTest();
      }
    });

    // Restart button
    this.dom.restartBtn.addEventListener("click", () => this.resetTest());
    this.dom.tryAgainBtn.addEventListener("click", () => {
      this.dom.resultsModal.close();
      this.resetTest();
    });

    // Mode Buttons
    document.querySelectorAll(".mode-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
        const target = e.currentTarget;
        target.classList.add("active");
        this.mode = target.dataset.mode;
        localStorage.setItem("ittrack_mode", this.mode);

        // Default sub-options based on mode
        if (this.mode === "time") this.subOption = "30";
        else if (this.mode === "words") this.subOption = "25";
        else if (this.mode === "quotes") this.subOption = "standard";
        else if (this.mode === "code") this.subOption = "js";

        localStorage.setItem("ittrack_sub_option", this.subOption);
        this.renderSubOptions();
        this.resetTest();
      });
    });

    // Theme selector
    this.dom.themeSelect.value = this.theme;
    this.dom.themeSelect.addEventListener("change", (e) => {
      this.applyTheme(e.target.value);
    });

    // Sound selector
    this.dom.soundSelect.value = soundEngine.soundType;
    this.dom.soundSelect.addEventListener("change", (e) => {
      soundEngine.setSoundType(e.target.value);
    });

    // Modals
    this.dom.closeResultsBtn.addEventListener("click", () => this.dom.resultsModal.close());
    this.dom.closeCertBtn.addEventListener("click", () => this.dom.certModal.close());
    this.dom.printCertBtn.addEventListener("click", () => window.print());

    // Generate Certificate
    this.dom.certGenerateBtn.addEventListener("click", () => this.generateCertificate());
    this.dom.certStudentInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.generateCertificate();
    });

    // History Modal
    this.dom.historyBtn.addEventListener("click", () => this.openHistoryModal());
    this.dom.closeHistoryBtn.addEventListener("click", () => this.dom.historyModal.close());
    this.dom.clearHistoryBtn.addEventListener("click", () => {
      localStorage.removeItem("ittrack_typing_history");
      this.renderHistoryTable();
    });
  }

  applyTheme(themeName) {
    this.theme = themeName;
    localStorage.setItem("ittrack_theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);

    // Modern color scheme meta element sync
    const metaTheme = document.querySelector('meta[name="color-scheme"]');
    if (metaTheme) {
      metaTheme.content = themeName === "light" ? "light" : "dark";
    }
  }

  renderSubOptions() {
    this.dom.subOptionsGroup.innerHTML = "";
    let options = [];

    if (this.mode === "time") {
      options = [
        { label: "15s", val: "15" },
        { label: "30s", val: "30" },
        { label: "60s", val: "60" },
        { label: "120s", val: "120" }
      ];
    } else if (this.mode === "words") {
      options = [
        { label: "10", val: "10" },
        { label: "25", val: "25" },
        { label: "50", val: "50" },
        { label: "100", val: "100" }
      ];
    } else if (this.mode === "quotes") {
      options = [
        { label: "Quotes", val: "standard" }
      ];
    } else if (this.mode === "code") {
      options = [
        { label: "JavaScript", val: "js" }
      ];
    }

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = `sub-btn ${opt.val === this.subOption ? "active" : ""}`;
      btn.textContent = opt.label;
      btn.dataset.val = opt.val;
      btn.addEventListener("click", () => {
        this.dom.subOptionsGroup.querySelectorAll(".sub-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.subOption = opt.val;
        localStorage.setItem("ittrack_sub_option", this.subOption);
        this.resetTest();
      });
      this.dom.subOptionsGroup.appendChild(btn);
    });
  }

  resetTest() {
    // Clear timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;

    this.status = "waiting";
    this.currentWordIdx = 0;
    this.currentCharIdx = 0;
    this.typedHistory = [];
    this.totalTypedChars = 0;
    this.totalCorrectChars = 0;
    this.totalErrors = 0;
    this.startTime = null;
    this.endTime = null;

    // Reset Metrics
    if (this.mode === "time") {
      this.timerDuration = parseInt(this.subOption, 10) || 30;
      this.timer = this.timerDuration;
      this.dom.statTimer.textContent = `${this.timer}s`;
    } else {
      this.dom.statTimer.textContent = "0s";
    }

    this.dom.statWpm.textContent = "0";
    this.dom.statAcc.textContent = "100%";
    this.dom.statErrors.textContent = "0";
    this.dom.progressBar.style.width = "0%";

    // Generate Words Content
    const generated = generateTestContent(this.mode, this.subOption, this.difficulty);
    this.wordsList = generated.words;

    // Initialize typed history
    this.typedHistory = this.wordsList.map(() => []);

    // Render Words DOM
    this.renderWords();

    // Reset hidden input
    this.dom.hiddenInput.value = "";
    this.dom.hiddenInput.focus();

    // Position Caret
    setTimeout(() => this.updateCaret(), 10);
    this.updateTargetKeyHint();
  }

  renderWords() {
    this.dom.wordsContainer.innerHTML = "";
    this.wordsList.forEach((wordText, wIdx) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = `word ${wIdx === 0 ? "active" : ""}`;
      wordSpan.dataset.wordIndex = wIdx;

      for (let cIdx = 0; cIdx < wordText.length; cIdx++) {
        const letterSpan = document.createElement("span");
        letterSpan.className = "letter";
        letterSpan.textContent = wordText[cIdx];
        wordSpan.appendChild(letterSpan);
      }

      this.dom.wordsContainer.appendChild(wordSpan);
    });
  }

  startTest() {
    this.status = "running";
    this.startTime = performance.now();

    if (this.mode === "time") {
      this.timerInterval = setInterval(() => {
        this.timer--;
        this.dom.statTimer.textContent = `${this.timer}s`;

        const percent = ((this.timerDuration - this.timer) / this.timerDuration) * 100;
        this.dom.progressBar.style.width = `${percent}%`;

        this.calculateRealtimeMetrics();

        if (this.timer <= 0) {
          this.finishTest();
        }
      }, 1000);
    } else {
      // Stopwatch for words / quote / code modes
      this.timer = 0;
      this.timerInterval = setInterval(() => {
        this.timer++;
        this.dom.statTimer.textContent = `${this.timer}s`;
        this.calculateRealtimeMetrics();
      }, 1000);
    }
  }

  handleKeyDown(e) {
    if (this.status === "finished") return;

    // Ignore non-character control keys except Backspace and Space
    if (e.key === "Tab" || e.altKey || e.ctrlKey || e.metaKey) return;

    if (this.status === "waiting") {
      // Only start on actual character or space
      if (e.key.length === 1) {
        this.startTest();
      } else {
        return;
      }
    }

    const currentWord = this.wordsList[this.currentWordIdx];
    const currentTyped = this.typedHistory[this.currentWordIdx];

    if (e.key === "Backspace") {
      e.preventDefault();
      if (this.currentCharIdx > 0) {
        this.currentCharIdx--;
        currentTyped.pop();
        soundEngine.playKeySound();
      } else if (this.currentCharIdx === 0 && this.currentWordIdx > 0) {
        // Go back to previous word
        this.currentWordIdx--;
        this.currentCharIdx = this.typedHistory[this.currentWordIdx].length;
      }
      this.updateWordDOM();
      this.updateCaret();
      this.updateTargetKeyHint();
      return;
    }

    if (e.key === " ") {
      e.preventDefault();
      // Moving to next word
      if (currentTyped.length === 0) return; // Prevent multiple empty spaces

      soundEngine.playKeySound();
      this.currentWordIdx++;
      this.currentCharIdx = 0;

      // Check if finished by words count
      if (this.currentWordIdx >= this.wordsList.length) {
        this.finishTest();
        return;
      }

      // Progress bar for word mode
      if (this.mode !== "time") {
        const percent = (this.currentWordIdx / this.wordsList.length) * 100;
        this.dom.progressBar.style.width = `${percent}%`;
      }

      this.updateWordDOM();
      this.updateCaret();
      this.updateTargetKeyHint();
      this.scrollActiveWordIntoView();
      return;
    }

    // Normal Character input
    if (e.key.length === 1) {
      e.preventDefault();
      const expectedChar = currentWord[this.currentCharIdx];

      if (e.key === expectedChar) {
        soundEngine.playKeySound();
      } else {
        soundEngine.playErrorSound();
        this.totalErrors++;
        this.dom.statErrors.textContent = this.totalErrors;
      }

      currentTyped.push(e.key);
      this.currentCharIdx++;

      this.totalTypedChars++;

      this.updateWordDOM();
      this.updateCaret();
      this.updateTargetKeyHint();
      this.calculateRealtimeMetrics();

      // Check completion for quotes or code
      if (
        (this.mode === "quotes" || this.mode === "code") &&
        this.currentWordIdx === this.wordsList.length - 1 &&
        this.currentCharIdx >= currentWord.length
      ) {
        this.finishTest();
      }
    }
  }

  updateWordDOM() {
    const wordElements = this.dom.wordsContainer.querySelectorAll(".word");

    wordElements.forEach((wEl, wIdx) => {
      // Manage active class
      if (wIdx === this.currentWordIdx) {
        wEl.classList.add("active");
      } else {
        wEl.classList.remove("active");
      }

      const originalWord = this.wordsList[wIdx];
      const typed = this.typedHistory[wIdx] || [];
      const letterEls = wEl.querySelectorAll(".letter:not(.extra)");

      // Reset extra letters from previous passes
      wEl.querySelectorAll(".letter.extra").forEach(el => el.remove());

      // Update standard letters
      for (let i = 0; i < originalWord.length; i++) {
        const letEl = letterEls[i];
        if (!letEl) continue;

        if (i < typed.length) {
          if (typed[i] === originalWord[i]) {
            letEl.className = "letter correct";
          } else {
            letEl.className = "letter incorrect";
          }
        } else {
          letEl.className = "letter";
        }
      }

      // Add extra letters if user typed more characters than the word
      if (typed.length > originalWord.length) {
        for (let i = originalWord.length; i < typed.length; i++) {
          const extraSpan = document.createElement("span");
          extraSpan.className = "letter extra incorrect";
          extraSpan.textContent = typed[i];
          wEl.appendChild(extraSpan);
        }
      }
    });
  }

  updateCaret() {
    const activeWordEl = this.dom.wordsContainer.querySelector(`.word[data-word-index="${this.currentWordIdx}"]`);
    if (!activeWordEl) return;

    const letterEls = activeWordEl.querySelectorAll(".letter");
    const containerRect = this.dom.wordsContainer.getBoundingClientRect();

    if (this.currentCharIdx < letterEls.length) {
      const activeLetter = letterEls[this.currentCharIdx];
      const letterRect = activeLetter.getBoundingClientRect();

      this.dom.caret.style.left = `${letterRect.left - containerRect.left}px`;
      this.dom.caret.style.top = `${letterRect.top - containerRect.top + 4}px`;
    } else {
      // Caret is at the end of the word
      const lastLetter = letterEls[letterEls.length - 1];
      if (lastLetter) {
        const lastRect = lastLetter.getBoundingClientRect();
        this.dom.caret.style.left = `${lastRect.right - containerRect.left}px`;
        this.dom.caret.style.top = `${lastRect.top - containerRect.top + 4}px`;
      }
    }
  }

  scrollActiveWordIntoView() {
    const activeWordEl = this.dom.wordsContainer.querySelector(`.word[data-word-index="${this.currentWordIdx}"]`);
    if (!activeWordEl) return;

    const containerTop = this.dom.wordsContainer.scrollTop;
    const wordOffsetTop = activeWordEl.offsetTop;

    // Keep active row visible within 2 rows
    if (wordOffsetTop > 65) {
      this.dom.wordsContainer.scrollTo({
        top: wordOffsetTop - 50,
        behavior: "smooth"
      });
    } else {
      this.dom.wordsContainer.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  updateTargetKeyHint() {
    if (!this.virtualKeyboard) return;
    const currentWord = this.wordsList[this.currentWordIdx];
    if (!currentWord) return;

    if (this.currentCharIdx < currentWord.length) {
      this.virtualKeyboard.highlightTargetKey(currentWord[this.currentCharIdx]);
    } else {
      // Space is next
      this.virtualKeyboard.highlightTargetKey(" ");
    }
  }

  calculateRealtimeMetrics() {
    if (!this.startTime) return;
    const elapsedMinutes = (performance.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0) return;

    // Calculate correct characters so far
    let correct = 0;
    let totalTyped = 0;

    this.typedHistory.forEach((typed, wIdx) => {
      const original = this.wordsList[wIdx] || "";
      typed.forEach((char, cIdx) => {
        totalTyped++;
        if (char === original[cIdx]) {
          correct++;
        }
      });
    });

    const netWpm = Math.max(0, Math.round((correct / 5) / elapsedMinutes));
    const accuracy = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 100;

    this.dom.statWpm.textContent = netWpm;
    this.dom.statAcc.textContent = `${accuracy}%`;
  }

  finishTest() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.status = "finished";
    this.endTime = performance.now();

    soundEngine.playCelebrationSound();

    // Final calculation
    const totalTimeSeconds = Math.max(1, Math.round((this.endTime - this.startTime) / 1000));
    const elapsedMinutes = totalTimeSeconds / 60;

    let correctChars = 0;
    let incorrectChars = 0;
    let totalChars = 0;

    this.typedHistory.forEach((typed, wIdx) => {
      const original = this.wordsList[wIdx] || "";
      typed.forEach((char, cIdx) => {
        totalChars++;
        if (char === original[cIdx]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      });
    });

    const netWpm = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));
    const rawWpm = Math.max(0, Math.round((totalChars / 5) / elapsedMinutes));
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    // Typist tier determination
    const rank = this.getRankInfo(netWpm);

    // Populate Results Modal
    this.dom.resWpm.textContent = netWpm;
    this.dom.resAcc.textContent = `${accuracy}%`;
    this.dom.resRawWpm.textContent = `${rawWpm} WPM`;
    this.dom.resCorrect.textContent = correctChars;
    this.dom.resErrors.textContent = incorrectChars;
    this.dom.resTime.textContent = `${totalTimeSeconds}s`;

    this.dom.rankTitle.textContent = rank.title;
    this.dom.rankDesc.textContent = rank.desc;
    this.dom.rankMedal.textContent = rank.medal;

    // Cache current result for certificate
    this.latestResult = {
      wpm: netWpm,
      accuracy: accuracy,
      rawWpm: rawWpm,
      rankTitle: rank.title,
      time: totalTimeSeconds,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    };

    // Save to LocalStorage History
    this.saveTestToHistory(this.latestResult);

    // Open Modal
    this.dom.resultsModal.showModal();
  }

  getRankInfo(wpm) {
    if (wpm >= 110) {
      return { title: "Typing Grandmaster", desc: "Top 0.5% elite keystroke velocity!", medal: "👑" };
    } else if (wpm >= 90) {
      return { title: "Speed Demon", desc: "Superhuman typing speed and precision!", medal: "⚡" };
    } else if (wpm >= 70) {
      return { title: "Pro Typist", desc: "Well above professional industry standards!", medal: "💎" };
    } else if (wpm >= 50) {
      return { title: "Fast Typist", desc: "Solid and fluid touch-typing capabilities!", medal: "🥇" };
    } else if (wpm >= 30) {
      return { title: "Competent Typist", desc: "Good foundation, keep practicing for speed!", medal: "🥈" };
    } else {
      return { title: "Novice Typist", desc: "Starting the journey at IT Track Institute!", medal: "🥉" };
    }
  }

  saveTestToHistory(result) {
    const history = JSON.parse(localStorage.getItem("ittrack_typing_history") || "[]");
    history.unshift(result);
    // Keep last 30 tests
    if (history.length > 30) history.pop();
    localStorage.setItem("ittrack_typing_history", JSON.stringify(history));
  }

  generateCertificate() {
    const studentName = this.dom.certStudentInput.value.trim() || "Dedicated Student";
    if (!this.latestResult) return;

    this.dom.certRecipientName.textContent = studentName;
    this.dom.certStatWpm.textContent = `${this.latestResult.wpm} WPM`;
    this.dom.certStatAcc.textContent = `${this.latestResult.accuracy}%`;
    this.dom.certStatRank.textContent = this.latestResult.rankTitle;
    this.dom.certDate.textContent = this.latestResult.date;
    this.dom.certSerial.textContent = `ITT-${Date.now().toString().slice(-6)}`;

    this.dom.resultsModal.close();
    this.dom.certModal.showModal();
  }

  openHistoryModal() {
    this.renderHistoryTable();
    this.dom.historyModal.showModal();
  }

  renderHistoryTable() {
    const history = JSON.parse(localStorage.getItem("ittrack_typing_history") || "[]");
    this.dom.historyTableBody.innerHTML = "";

    if (history.length === 0) {
      this.dom.historyTableBody.innerHTML = `<tr><td colspan="5" class="empty-history-text">No test records yet. Complete your first typing test!</td></tr>`;
      return;
    }

    history.forEach((item, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${idx + 1}</td>
        <td><strong>${item.wpm} WPM</strong></td>
        <td>${item.accuracy}%</td>
        <td>${item.rankTitle}</td>
        <td>${item.date}</td>
      `;
      this.dom.historyTableBody.appendChild(tr);
    });
  }
}

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new TypingApp();
  app.init();
});

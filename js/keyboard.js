/**
 * IT Track Institute - Typing Master
 * Interactive Virtual Keyboard & Finger Placement Guidance
 */

class VirtualKeyboard {
  constructor() {
    this.container = document.getElementById("keyboard-layout");
    this.section = document.getElementById("keyboard-section");
    this.toggleBtn = document.getElementById("toggle-keyboard-btn");
    this.keyMap = new Map();
    this.isVisible = localStorage.getItem("ittrack_keyboard_visible") !== "false";
    
    this.layout = [
      [
        { code: "Backquote", label: "`", shift: "~" },
        { code: "Digit1", label: "1", shift: "!" },
        { code: "Digit2", label: "2", shift: "@" },
        { code: "Digit3", label: "3", shift: "#" },
        { code: "Digit4", label: "4", shift: "$" },
        { code: "Digit5", label: "5", shift: "%" },
        { code: "Digit6", label: "6", shift: "^" },
        { code: "Digit7", label: "7", shift: "&" },
        { code: "Digit8", label: "8", shift: "*" },
        { code: "Digit9", label: "9", shift: "(" },
        { code: "Digit0", label: "0", shift: ")" },
        { code: "Minus", label: "-", shift: "_" },
        { code: "Equal", label: "=", shift: "+" },
        { code: "Backspace", label: "Backspace", class: "key-wider" }
      ],
      [
        { code: "Tab", label: "Tab", class: "key-wide" },
        { code: "KeyQ", label: "Q" },
        { code: "KeyW", label: "W" },
        { code: "KeyE", label: "E" },
        { code: "KeyR", label: "R" },
        { code: "KeyT", label: "T" },
        { code: "KeyY", label: "Y" },
        { code: "KeyU", label: "U" },
        { code: "KeyI", label: "I" },
        { code: "KeyO", label: "O" },
        { code: "KeyP", label: "P" },
        { code: "BracketLeft", label: "[", shift: "{" },
        { code: "BracketRight", label: "]", shift: "}" },
        { code: "Backslash", label: "\\", shift: "|" }
      ],
      [
        { code: "CapsLock", label: "Caps", class: "key-wide" },
        { code: "KeyA", label: "A" },
        { code: "KeyS", label: "S" },
        { code: "KeyD", label: "D" },
        { code: "KeyF", label: "F" },
        { code: "KeyG", label: "G" },
        { code: "KeyH", label: "H" },
        { code: "KeyJ", label: "J" },
        { code: "KeyK", label: "K" },
        { code: "KeyL", label: "L" },
        { code: "Semicolon", label: ";", shift: ":" },
        { code: "Quote", label: "'", shift: "\"" },
        { code: "Enter", label: "Enter", class: "key-wider" }
      ],
      [
        { code: "ShiftLeft", label: "Shift", class: "key-wider" },
        { code: "KeyZ", label: "Z" },
        { code: "KeyX", label: "X" },
        { code: "KeyC", label: "C" },
        { code: "KeyV", label: "V" },
        { code: "KeyB", label: "B" },
        { code: "KeyN", label: "N" },
        { code: "KeyM", label: "M" },
        { code: "Comma", label: ",", shift: "<" },
        { code: "Period", label: ".", shift: ">" },
        { code: "Slash", label: "/", shift: "?" },
        { code: "ShiftRight", label: "Shift", class: "key-wider" }
      ],
      [
        { code: "Space", label: "Space", class: "key-space" }
      ]
    ];

    this.init();
  }

  init() {
    this.render();
    this.updateVisibility();
    this.bindEvents();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = "";

    this.layout.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "kb-row";

      row.forEach(k => {
        const keyDiv = document.createElement("div");
        keyDiv.className = `key ${k.class || ""}`;
        keyDiv.textContent = k.label;
        keyDiv.dataset.code = k.code;
        if (k.label) keyDiv.dataset.char = k.label.toLowerCase();
        if (k.shift) keyDiv.dataset.shift = k.shift;

        this.keyMap.set(k.code, keyDiv);
        rowDiv.appendChild(keyDiv);
      });

      this.container.appendChild(rowDiv);
    });
  }

  bindEvents() {
    window.addEventListener("keydown", (e) => {
      const el = this.keyMap.get(e.code);
      if (el) {
        el.classList.add("active-press");
      }
    });

    window.addEventListener("keyup", (e) => {
      const el = this.keyMap.get(e.code);
      if (el) {
        el.classList.remove("active-press");
      }
    });

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", () => {
        this.isVisible = !this.isVisible;
        localStorage.setItem("ittrack_keyboard_visible", this.isVisible);
        this.updateVisibility();
      });
    }
  }

  updateVisibility() {
    if (!this.section) return;
    if (this.isVisible) {
      this.section.classList.remove("hidden");
      if (this.toggleBtn) this.toggleBtn.textContent = "Hide Keyboard";
    } else {
      this.section.classList.add("hidden");
      if (this.toggleBtn) this.toggleBtn.textContent = "Show Keyboard";
    }
  }

  highlightTargetKey(char) {
    // Clear previous targets
    this.keyMap.forEach(el => el.classList.remove("target-key"));
    if (!char) return;

    if (char === " ") {
      const spaceKey = this.keyMap.get("Space");
      if (spaceKey) spaceKey.classList.add("target-key");
      return;
    }

    const lower = char.toLowerCase();
    for (let [, el] of this.keyMap) {
      if (el.dataset.char === lower || el.dataset.shift === char) {
        el.classList.add("target-key");
        break;
      }
    }
  }
}

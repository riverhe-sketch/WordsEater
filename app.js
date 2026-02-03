const STORAGE_KEY = "word-cache-v1";

const form = document.getElementById("word-form");
const wordInput = document.getElementById("word-input");
const meaningInput = document.getElementById("meaning-input");
const usageInput = document.getElementById("usage-input");
const tagsInput = document.getElementById("tags-input");
const clearFormButton = document.getElementById("clear-form");
const shuffleButton = document.getElementById("shuffle-word");
const markMasteredButton = document.getElementById("mark-mastered");
const reviewWord = document.getElementById("review-word");
const searchInput = document.getElementById("search-input");
const filterSelect = document.getElementById("filter-select");
const wordGrid = document.getElementById("word-grid");
const resetButton = document.getElementById("reset-data");

const statTotal = document.getElementById("stat-total");
const statMastered = document.getElementById("stat-mastered");
const statWeek = document.getElementById("stat-week");

const editDialog = document.getElementById("edit-dialog");
const editWordInput = document.getElementById("edit-word");
const editMeaningInput = document.getElementById("edit-meaning");
const editUsageInput = document.getElementById("edit-usage");
const editTagsInput = document.getElementById("edit-tags");

const wordTemplate = document.getElementById("word-card-template");

let words = loadWords();
let currentReviewId = null;
let editTargetId = null;

function loadWords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function saveWords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getWeekCount() {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  return words.filter((word) => new Date(word.createdAt) >= weekAgo).length;
}

function setStats() {
  const mastered = words.filter((word) => word.mastered).length;
  statTotal.textContent = words.length.toString();
  statMastered.textContent = mastered.toString();
  statWeek.textContent = getWeekCount().toString();
}

function toTags(raw) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function resetForm() {
  form.reset();
  wordInput.focus();
}

function addWord(event) {
  event.preventDefault();
  const newWord = {
    id: crypto.randomUUID(),
    word: wordInput.value.trim(),
    meaning: meaningInput.value.trim(),
    usage: usageInput.value.trim(),
    tags: toTags(tagsInput.value),
    mastered: false,
    createdAt: new Date().toISOString(),
  };

  if (!newWord.word) {
    wordInput.focus();
    return;
  }

  words = [newWord, ...words];
  saveWords();
  resetForm();
  render();
  setReviewWord(newWord.id);
}

function setReviewWord(optionalId) {
  if (!words.length) {
    reviewWord.textContent = "Add a word to start your review flow.";
    currentReviewId = null;
    return;
  }

  if (optionalId) {
    currentReviewId = optionalId;
  } else {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    currentReviewId = randomWord.id;
  }

  const selected = words.find((word) => word.id === currentReviewId);
  reviewWord.textContent = selected
    ? `${selected.word} — ${selected.meaning || "Add a meaning."}`
    : "Pick another word.";
}

function toggleMastered(id) {
  words = words.map((word) =>
    word.id === id ? { ...word, mastered: !word.mastered } : word
  );
  saveWords();
  render();
}

function deleteWord(id) {
  words = words.filter((word) => word.id !== id);
  saveWords();
  render();
  if (currentReviewId === id) {
    setReviewWord();
  }
}

function openEdit(word) {
  editTargetId = word.id;
  editWordInput.value = word.word;
  editMeaningInput.value = word.meaning;
  editUsageInput.value = word.usage;
  editTagsInput.value = word.tags.join(", ");
  editDialog.showModal();
}

function saveEdit() {
  if (!editTargetId) return;
  words = words.map((word) =>
    word.id === editTargetId
      ? {
          ...word,
          word: editWordInput.value.trim(),
          meaning: editMeaningInput.value.trim(),
          usage: editUsageInput.value.trim(),
          tags: toTags(editTagsInput.value),
        }
      : word
  );
  saveWords();
  render();
}

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;
  wordGrid.innerHTML = "";

  const filtered = words.filter((word) => {
    const matchesTerm =
      !term ||
      word.word.toLowerCase().includes(term) ||
      word.meaning.toLowerCase().includes(term) ||
      word.tags.join(" ").toLowerCase().includes(term);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !word.mastered) ||
      (filter === "mastered" && word.mastered);

    return matchesTerm && matchesFilter;
  });

  filtered.forEach((word) => {
    const node = wordTemplate.content.cloneNode(true);
    const title = node.querySelector(".word-card__title");
    const meta = node.querySelector(".word-card__meta");
    const meaning = node.querySelector(".word-card__meaning");
    const tags = node.querySelector(".tags");
    const status = node.querySelector(".pill--status");
    const timestamp = node.querySelector(".timestamp");
    const editButton = node.querySelector('[data-action="edit"]');
    const deleteButton = node.querySelector('[data-action="delete"]');

    title.textContent = word.word;
    meta.textContent = word.usage || "Work context";
    meaning.textContent = word.meaning || "Add a meaning to help recall.";
    timestamp.textContent = `Added ${formatDate(word.createdAt)}`;
    status.textContent = word.mastered ? "Mastered" : "Learning";
    status.addEventListener("click", () => toggleMastered(word.id));

    word.tags.forEach((tag) => {
      const span = document.createElement("span");
      span.className = "pill";
      span.textContent = tag;
      tags.appendChild(span);
    });

    editButton.addEventListener("click", () => openEdit(word));
    deleteButton.addEventListener("click", () => deleteWord(word.id));

    wordGrid.appendChild(node);
  });

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "card card--compact";
    empty.innerHTML =
      "<h3>No words yet</h3><p>Add a word above to start your collection.</p>";
    wordGrid.appendChild(empty);
  }

  setStats();
  if (!currentReviewId) {
    setReviewWord();
  }
}

form.addEventListener("submit", addWord);
clearFormButton.addEventListener("click", resetForm);
shuffleButton.addEventListener("click", () => setReviewWord());
markMasteredButton.addEventListener("click", () => {
  if (currentReviewId) {
    toggleMastered(currentReviewId);
    setReviewWord();
  }
});
searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);
resetButton.addEventListener("click", () => {
  if (confirm("Reset all saved words?")) {
    words = [];
    saveWords();
    render();
  }
});

editDialog.addEventListener("close", () => {
  if (editDialog.returnValue === "save") {
    saveEdit();
  }
  editTargetId = null;
});

render();

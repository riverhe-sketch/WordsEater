<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Vocabulary Memorizer</title>

  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f5f3ef;
      margin: 0;
      padding: 2rem;
    }

    .app {
      max-width: 480px;
      margin: auto;
      background: #fff;
      border: 1px solid #e6e3dd;
      padding: 1.5rem;
    }

    h1 {
      margin-top: 0;
      font-size: 1.2rem;
    }

    input {
      width: 100%;
      padding: 0.6rem;
      margin-bottom: 0.5rem;
      border: 1px solid #e6e3dd;
      font-size: 1rem;
    }

    button {
      border: 1px solid #e6e3dd;
      background: none;
      padding: 0.5rem 1rem;
      margin-right: 0.4rem;
      cursor: pointer;
    }

    .card {
      border: 1px solid #e6e3dd;
      padding: 1.5rem;
      margin-top: 1rem;
      text-align: center;
      min-height: 120px;
    }

    .word {
      font-size: 1.4rem;
      font-weight: 600;
    }

    .meaning {
      margin-top: 0.8rem;
      color: #777;
      display: none;
    }

    .actions {
      margin-top: 1rem;
      text-align: center;
    }

    .info {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>

<div class="app">
  <h1>Vocabulary Memorizer</h1>

  <input id="wordInput" placeholder="Word" />
  <input id="meaningInput" placeholder="Meaning" />
  <button onclick="addWord()">Save</button>

  <div class="card">
    <div class="word" id="cardWord">Add a word to start</div>
    <div class="meaning" id="cardMeaning"></div>
  </div>

  <div class="actions">
    <button onclick="reveal()">Reveal</button>
    <button onclick="again()">Again</button>
    <button onclick="know()">Know</button>
  </div>

  <div class="info" id="info"></div>
</div>

<script>
  const KEY = 'vocab_data';
  let current = null;

  function today() {
    return Math.floor(Date.now() / 86400000);
  }

  function load() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function addWord() {
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();
    if (!word || !meaning) return alert('Enter both fields');

    const data = load();
    data.push({
      word,
      meaning,
      interval: 1,
      due: today()
    });

    save(data);
    wordInput.value = '';
    meaningInput.value = '';
    next();
  }

  function next() {
    const due = load().filter(w => w.due <= today());
    cardMeaning.style.display = 'none';

    if (due.length === 0) {
      cardWord.textContent = 'All done for today';
      cardMeaning.textContent = '';
      info.textContent = '';
      current = null;
      return;
    }

    current = due[Math.floor(Math.random() * due.length)];
    cardWord.textContent = current.word;
    cardMeaning.textContent = current.meaning;
    info.textContent = due.length + ' word(s) to review';
  }

  function reveal() {
    if (!current) return;
    cardMeaning.style.display = 'block';
  }

  function again() {
    if (!current) return;
    update(false);
  }

  function know() {
    if (!current) return;
    update(true);
  }

  function update(known) {
    const data = load();
    const item = data.find(w => w.word === current.word);

    item.interval = known ? item.interval * 2 : 1;
    item.due = today() + item.interval;

    save(data);
    next();
  }

  next();
</script>

</body>
</html>

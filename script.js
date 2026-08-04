// ===== Rotating quote (changes every 12 hours) =====
// Add, remove, or edit quotes freely — the rotation logic doesn't need
// changes when you do. Every visitor within the same 12-hour window sees
// the same quote, and it's fully static — no backend needed.
const QUOTES = [
  { text: 'Fall seven times, stand up eight.', author: 'Japanese Proverb' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Code is like humor. When you have to explain it, it\u2019s bad.', author: 'Cory House' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'Whether you think you can, or you think you can\u2019t \u2014 you\u2019re right.', author: 'Henry Ford' },
  { text: 'Curiosity is the engine of achievement.', author: 'Ken Robinson' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
];

const ROTATION_MS = 12 * 60 * 60 * 1000; // 12 hours

function getCurrentWindowIndex() {
  return Math.floor(Date.now() / ROTATION_MS);
}

function renderQuote() {
  const windowIndex = getCurrentWindowIndex();
  const quote = QUOTES[windowIndex % QUOTES.length];
  document.getElementById('quoteText').textContent = quote.text;
  document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;
}

function renderCountdown() {
  const windowIndex = getCurrentWindowIndex();
  const nextChangeAt = (windowIndex + 1) * ROTATION_MS;
  const remaining = Math.max(nextChangeAt - Date.now(), 0);

  const h = String(Math.floor(remaining / 3600000)).padStart(2, '0');
  const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');

  document.getElementById('quoteTimer').textContent = `${h}:${m}:${s}`;

  // if the countdown hits zero, swap in the new quote right away
  if (remaining <= 0) renderQuote();
}

renderQuote();
renderCountdown();
setInterval(renderCountdown, 1000);

// ===== Visitor count =====
// Uses a free, no-signup counter API (countapi.xyz) — every page load
// increments and returns the total. If the request fails for any reason
// (offline, API down), it just shows a dash instead of breaking the page.
const VISITOR_NAMESPACE = 'faisalkhan-portfolio-2026';
const VISITOR_KEY = 'visits';

fetch(`https://api.countapi.xyz/hit/${VISITOR_NAMESPACE}/${VISITOR_KEY}`)
  .then((res) => res.json())
  .then((data) => {
    document.getElementById('visitorCount').textContent = `${data.value} visits`;
  })
  .catch(() => {
    document.getElementById('visitorCount').textContent = '';
  });

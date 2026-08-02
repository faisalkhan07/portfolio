// This page is intentionally simple — most of the layout needs no JS at all.
// The one interactive piece is the pixel-stamp trail below.

// ===== Pixel stamps =====
// As you move the mouse over the background video, every time you've moved
// far enough from the last spot, a small canvas is stamped down showing a
// zoomed-in crop of the video at that exact point, then fades out and
// removes itself. It's suppressed entirely while hovering the bio/contact
// content (the .wrap block), so it only ever appears over open video.
const bgVideo = document.getElementById('bgVideo');

const SAMPLE_SOURCE_SIZE = 60; // how many video pixels wide/tall to sample (smaller = more zoomed in)
const MIN_SPAWN_DISTANCE = 55; // px the cursor must move before a new stamp appears
const STAMP_LIFETIME_MS = 700;

let lastSpawn = { x: -9999, y: -9999 };

function sampleVideoAt(clientX, clientY, canvas) {
  const ctx = canvas.getContext('2d');
  const rect = bgVideo.getBoundingClientRect();
  const vw = bgVideo.videoWidth;
  const vh = bgVideo.videoHeight;
  if (!vw || !vh) return false;

  const videoAspect = vw / vh;
  const containerAspect = rect.width / rect.height;

  // object-fit: cover scales+crops the video to fill its box — work out
  // that "true" rendered size so the cursor's screen position maps to the
  // right pixel coordinate inside the actual video frame.
  let renderW, renderH;
  if (videoAspect > containerAspect) {
    renderH = rect.height;
    renderW = renderH * videoAspect;
  } else {
    renderW = rect.width;
    renderH = renderW / videoAspect;
  }
  const offsetX = (renderW - rect.width) / 2;
  const offsetY = (renderH - rect.height) / 2;

  const localX = clientX - rect.left + offsetX;
  const localY = clientY - rect.top + offsetY;
  const scale = vw / renderW;

  const sx = localX * scale - SAMPLE_SOURCE_SIZE / 2;
  const sy = localY * scale - SAMPLE_SOURCE_SIZE / 2;

  ctx.drawImage(
    bgVideo,
    sx, sy, SAMPLE_SOURCE_SIZE, SAMPLE_SOURCE_SIZE,
    0, 0, canvas.width, canvas.height
  );
  return true;
}

function spawnStamp(x, y) {
  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 180;
  canvas.className = 'pixel-stamp';
  canvas.style.left = `${x}px`;
  canvas.style.top = `${y}px`;

  const drew = sampleVideoAt(x, y, canvas);
  if (!drew) return;

  document.body.appendChild(canvas);

  // trigger the fade-out shortly after appearing, then remove it
  requestAnimationFrame(() => {
    setTimeout(() => canvas.classList.add('fade-out'), 50);
  });
  setTimeout(() => canvas.remove(), STAMP_LIFETIME_MS);
}

window.addEventListener('mousemove', (e) => {
  // don't stamp while hovering the name/tagline/contact content
  if (e.target.closest('.wrap')) return;
  if (bgVideo.readyState < 2) return;

  const dx = e.clientX - lastSpawn.x;
  const dy = e.clientY - lastSpawn.y;
  if (Math.hypot(dx, dy) < MIN_SPAWN_DISTANCE) return;

  lastSpawn = { x: e.clientX, y: e.clientY };
  spawnStamp(e.clientX, e.clientY);
});

// This page is intentionally simple — most of the layout needs no JS at all.
// The one interactive piece is the cursor "sample" box below.

// ===== Cursor sample =====
// Follows the mouse and draws a zoomed-in crop of the background video,
// taken from the exact spot the cursor is sitting over. Uses canvas
// drawImage() straight from the <video> element, so it always shows the
// video's *current* frame, not a static screenshot.
const bgVideo = document.getElementById('bgVideo');
const sampleCanvas = document.getElementById('cursorSample');
const sctx = sampleCanvas.getContext('2d');

const SAMPLE_SOURCE_SIZE = 60; // how many video pixels wide/tall to sample (smaller = more zoomed in)
const mouse = { x: -9999, y: -9999 };
let hovering = false;

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  hovering = true;
  sampleCanvas.style.left = `${mouse.x}px`;
  sampleCanvas.style.top = `${mouse.y}px`;
  sampleCanvas.classList.add('active');
});

document.addEventListener('mouseleave', () => {
  hovering = false;
  sampleCanvas.classList.remove('active');
});

function drawSample() {
  if (hovering && bgVideo.readyState >= 2 && bgVideo.videoWidth) {
    const rect = bgVideo.getBoundingClientRect();
    const vw = bgVideo.videoWidth;
    const vh = bgVideo.videoHeight;
    const videoAspect = vw / vh;
    const containerAspect = rect.width / rect.height;

    // The video uses object-fit: cover, so it's scaled up and cropped to
    // fill its box. Figure out that "true" rendered size so we can map the
    // cursor's screen position back to a pixel coordinate in the video.
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

    const localX = mouse.x - rect.left + offsetX;
    const localY = mouse.y - rect.top + offsetY;
    const scale = vw / renderW;

    const sx = localX * scale - SAMPLE_SOURCE_SIZE / 2;
    const sy = localY * scale - SAMPLE_SOURCE_SIZE / 2;

    sctx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
    sctx.drawImage(
      bgVideo,
      sx, sy, SAMPLE_SOURCE_SIZE, SAMPLE_SOURCE_SIZE,
      0, 0, sampleCanvas.width, sampleCanvas.height
    );
  }
  requestAnimationFrame(drawSample);
}

requestAnimationFrame(drawSample);

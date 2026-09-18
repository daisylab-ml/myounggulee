import {
  STREAM_TOKENS,
  createBinaryStreams,
  createCodeStreams,
} from "./matrix-streams.js";

const HOME_PATHS = new Set(["/", "/myounggulee"]);
const FRAME_RATE = 24;
const FRAME_INTERVAL = 1000 / FRAME_RATE;
const MAX_DEVICE_PIXEL_RATIO = 1.5;
const FONT_STACK = '11px "SFMono-Regular", Consolas, "Liberation Mono", monospace';
const BINARY_FONT_STACK = '10px "SFMono-Regular", Consolas, "Liberation Mono", monospace';
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let controller = null;
let routeFrame = 0;
let activationReady = false;

function isHomeRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return HOME_PATHS.has(path);
}

function findHomeHero() {
  if (!isHomeRoute()) return null;

  return [...document.querySelectorAll("main section")].find((section) =>
    section.querySelector("h1")?.textContent?.includes("Data & AI Systems"),
  );
}

function createController(hero) {
  const canvas = document.createElement("canvas");
  canvas.className = "matrix-code-background";
  canvas.setAttribute("aria-hidden", "true");
  hero.classList.add("matrix-hero");
  hero.prepend(canvas);

  const context = canvas.getContext("2d", { alpha: true });
  const colors = getComputedStyle(document.documentElement);
  const palette = {
    indigo: colors.getPropertyValue("--code-indigo").trim(),
    slate: colors.getPropertyValue("--code-slate").trim(),
    binary: colors.getPropertyValue("--code-binary").trim(),
    cursor: colors.getPropertyValue("--code-cursor").trim(),
  };
  const state = {
    canvas,
    context,
    hero,
    width: 0,
    height: 0,
    streams: [],
    binaryStreams: [],
    animationFrame: 0,
    lastFrame: performance.now(),
    destroyed: false,
  };

  function resize() {
    const rect = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    state.width = Math.max(1, Math.round(rect.width));
    state.height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(state.width * ratio);
    canvas.height = Math.round(state.height * ratio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    state.streams = createCodeStreams(
      state.width,
      state.height,
      reduceMotion.matches,
    );
    state.binaryStreams = createBinaryStreams(state.width, state.height);
    draw();
  }

  function draw() {
    context.clearRect(0, 0, state.width, state.height);
    const tick = Math.floor(performance.now() / 820);
    context.font = BINARY_FONT_STACK;
    context.textBaseline = "top";

    for (const stream of state.binaryStreams) {
      const rowCount = Math.ceil(state.height / 19) + 2;
      for (let row = 0; row < rowCount; row += 1) {
        const y = (row * 19 + stream.offset) % (state.height + 38) - 19;
        const pulse = (row + stream.index + tick) % 13 === 0;
        context.globalAlpha = pulse ? stream.alpha * 1.8 : stream.alpha;
        context.fillStyle = pulse ? palette.cursor : palette.binary;
        context.fillText((row + stream.index + tick) % 3 === 0 ? "1" : "0", stream.x, y);
      }
    }

    context.font = FONT_STACK;
    context.textBaseline = "top";

    for (const stream of state.streams) {
      if (stream.delay > 0) continue;

      const visibleCount = Math.max(1, Math.floor(stream.typed));
      const visibleText = stream.text.slice(0, visibleCount);
      context.globalAlpha = stream.alpha;
      context.fillStyle = palette[stream.tone];
      context.fillText(visibleText, stream.x, stream.y);

      const isTyping = visibleCount < stream.text.length;
      const blinkPhase = Math.floor(
        performance.now() / STREAM_TOKENS.cursorBlinkInterval,
      );
      const isPersistentCursor =
        stream.lineIndex === stream.blockSize - 1 &&
        (blinkPhase + stream.blockIndex) % 2 === 0;
      if (
        (isTyping && blinkPhase % 2 === 0) ||
        isPersistentCursor
      ) {
        const cursorX = stream.x + context.measureText(visibleText).width + 3;
        context.fillStyle = palette.cursor;
        context.fillRect(cursorX, stream.y + 1, 2, 12);
      }
    }

    context.globalAlpha = 1;
  }

  function update(delta) {
    for (const stream of state.streams) {
      if (stream.delay > 0) {
        stream.delay -= delta;
        continue;
      }

      stream.y += stream.driftSpeed * delta;
      stream.typed = Math.min(
        stream.text.length,
        stream.typed + stream.typingSpeed * delta,
      );

      if (stream.y > state.height + 18) {
        stream.y = -18 - (stream.blockSize - stream.lineIndex) * 18;
        stream.typed = 0;
        stream.delay = stream.lineIndex * 0.24;
      }
    }

    for (const stream of state.binaryStreams) {
      stream.offset = (stream.offset + stream.speed * delta) % (state.height + 38);
    }
  }

  function animate(now) {
    if (state.destroyed || reduceMotion.matches || document.hidden) return;
    state.animationFrame = requestAnimationFrame(animate);
    const elapsed = now - state.lastFrame;
    if (elapsed < FRAME_INTERVAL) return;
    const delta = Math.min(elapsed, 100) / 1000;
    state.lastFrame = now - (elapsed % FRAME_INTERVAL);
    update(delta);
    draw();
  }

  function start() {
    cancelAnimationFrame(state.animationFrame);
    if (reduceMotion.matches || document.hidden) {
      draw();
      return;
    }
    state.lastFrame = performance.now();
    state.animationFrame = requestAnimationFrame(animate);
  }

  function handleMotionChange() {
    resize();
    start();
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(state.animationFrame);
    } else {
      start();
    }
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);
  reduceMotion.addEventListener("change", handleMotionChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  resize();
  start();

  return {
    hero,
    destroy() {
      state.destroyed = true;
      cancelAnimationFrame(state.animationFrame);
      resizeObserver.disconnect();
      reduceMotion.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.remove();
      hero.classList.remove("matrix-hero");
    },
  };
}

function syncBackground() {
  routeFrame = 0;
  const hero = findHomeHero();
  if (controller?.hero === hero) return;
  controller?.destroy();
  controller = hero ? createController(hero) : null;
}

function queueSync() {
  if (!activationReady || routeFrame) return;
  routeFrame = requestAnimationFrame(syncBackground);
}

function activateBackground() {
  const activate = () => {
    activationReady = true;
    queueSync();
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(activate, { timeout: 1200 });
  } else {
    window.setTimeout(activate, 0);
  }
}

new MutationObserver(queueSync).observe(document.getElementById("root"), {
  childList: true,
  characterData: true,
  subtree: true,
});
window.addEventListener("popstate", queueSync);
window.addEventListener("pageshow", queueSync);
if (document.readyState === "complete") {
  activateBackground();
} else {
  window.addEventListener("load", activateBackground, { once: true });
}

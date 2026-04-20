function initLightning() {
  const lightningCanvas = document.getElementById("lightningCanvas");
  if (!lightningCanvas) return;
  const lCtx = lightningCanvas.getContext("2d");

  function resizeLightningCanvas() {
    lightningCanvas.width = window.innerWidth;
    lightningCanvas.height = window.innerHeight;
  }
  resizeLightningCanvas();
  window.addEventListener("resize", resizeLightningCanvas);

  const bolts = [];
  let lastLX = 0,
    lastLY = 0;
  let rafId = null;

  function jolt(x1, y1, x2, y2, depth) {
    if (depth === 0) return [[x1, y1, x2, y2]];
    const spread = Math.hypot(x2 - x1, y2 - y1) * 0.45;
    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
    const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread;
    return [
      ...jolt(x1, y1, mx, my, depth - 1),
      ...jolt(mx, my, x2, y2, depth - 1),
    ];
  }

  let isMouseMoving = false;
  let lastMouseEvent = null;

  function processMouseMove() {
    if (!lastMouseEvent) {
      isMouseMoving = false;
      return;
    }
    const e = lastMouseEvent;
    const dx = e.clientX - lastLX;
    const dy = e.clientY - lastLY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 6) {
      bolts.push({
        segs: jolt(lastLX, lastLY, e.clientX, e.clientY, 3),
        alpha: 1.0,
        decay: 0.04 + Math.random() * 0.04,
        width: 1.5 + Math.random(),
      });

      if (Math.random() < 0.4) {
        const bx = lastLX + dx * 0.5 + (Math.random() - 0.5) * 70;
        const by = lastLY + dy * 0.5 + (Math.random() - 0.5) * 70;
        bolts.push({
          segs: jolt(lastLX + dx * 0.25, lastLY + dy * 0.25, bx, by, 2),
          alpha: 0.55,
          decay: 0.07 + Math.random() * 0.07,
          width: 0.8,
        });
      }

      lastLX = e.clientX;
      lastLY = e.clientY;
    }

    if (bolts.length > 60) bolts.splice(0, bolts.length - 60);

    scheduleLightning();
    isMouseMoving = false;
  }

  document.addEventListener("mousemove", (e) => {
    lastMouseEvent = e;
    if (!isMouseMoving) {
      isMouseMoving = true;
      requestAnimationFrame(processMouseMove);
    }
  });

  function drawLightning() {
    lCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);

    for (let i = bolts.length - 1; i >= 0; i--) {
      const bolt = bolts[i];
      bolt.alpha -= bolt.decay;
      if (bolt.alpha <= 0) {
        bolts.splice(i, 1);
        continue;
      }

      lCtx.save();
      lCtx.globalAlpha = bolt.alpha;
      lCtx.lineCap = "round";
      lCtx.lineJoin = "round";

      lCtx.shadowColor = "#c8f02e";
      lCtx.shadowBlur = 18;
      lCtx.strokeStyle = "rgba(200,240,46,0.85)";
      lCtx.lineWidth = bolt.width;
      bolt.segs.forEach(([x1, y1, x2, y2]) => {
        lCtx.beginPath();
        lCtx.moveTo(x1, y1);
        lCtx.lineTo(x2, y2);
        lCtx.stroke();
      });

      lCtx.shadowBlur = 4;
      lCtx.strokeStyle = "rgba(255,255,220,0.95)";
      lCtx.lineWidth = bolt.width * 0.35;
      bolt.segs.forEach(([x1, y1, x2, y2]) => {
        lCtx.beginPath();
        lCtx.moveTo(x1, y1);
        lCtx.lineTo(x2, y2);
        lCtx.stroke();
      });

      lCtx.restore();
    }

    if (bolts.length > 0) {
      rafId = requestAnimationFrame(drawLightning);
    } else {
      rafId = null;
    }
  }

  function scheduleLightning() {
    if (!rafId) rafId = requestAnimationFrame(drawLightning);
  }
}

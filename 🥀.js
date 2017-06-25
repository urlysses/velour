/* globals window, document */
const TO_RAD = Math.PI * 180;
const MAX_PETALS = 50;
const svg = document.querySelector('svg');
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

function bp(c1x, c1y, c2x, c2y, x, y) {
  return { c1x, c1y, c2x, c2y, x, y };
}
const petalGuides = [
  {
    offsets: { x: -125, y: -140 },
    points: [
      bp(97, 206, 174, 147, 211, 142),
      bp(280, 133, 315, 218, 289, 249),
      bp(279, 260, 244, 320, 235, 332),
      bp(226, 344, 203, 299, 138, 256),
    ],
  },
  {
    offsets: { x: -45, y: -15 },
    points: [
      bp(52, 138, 94, 149, 109, 147),
      bp(139, 143, 174, 116, 180, 95),
      bp(184, 81, 159, 18, 130, 17),
      bp(111, 16, 42, 19, 45, 27),
      bp(48, 34, 46, 106, 46, 91),
    ],
  },
  {
    offsets: { x: -25, y: -4 },
    points: [
      bp(17, 80, 45, 133, 81, 156),
      bp(94, 164, 190, 145, 177, 154),
      bp(165, 163, 212, 109, 215, 94),
      bp(218, 79, 216, 50, 207, 32),
      bp(199, 17, 171, 5, 131, 5),
      bp(116, 5, 63, 16, 51, 9),
      bp(38, 1, 27, 75, 25, 91),
    ],
  },
  {
    offsets: { x: -10, y: -5 },
    points: [
      bp(28, 106, 12, 78, 10, 67),
      bp(7, 52, 61, 15, 76, 8),
      bp(90, 2, 146, 56, 147, 66),
      bp(148, 73, 109, 98, 82, 159),
      bp(76, 173, 70, 139, 52, 123),
    ],
  },
  {
    offsets: { x: -15, y: 0 },
    points: [
      bp(39, 123, 14, 84, 15, 69),
      bp(21, 8, 62, 1, 97, 3),
      bp(112, 4, 183, 25, 190, 38),
      bp(194, 45, 186, 110, 176, 121),
      bp(167, 131, 130, 157, 118, 166),
      bp(106, 175, 78, 155, 62, 138),
    ],
  },
];

let petals = [];
let shook = false;

const renderCanvas = document.createElement('canvas');
const renderContext = renderCanvas.getContext('2d');
renderCanvas.width = 200;
renderCanvas.height = 200;
renderContext.fillStyle = 'red';
function renderPetal({ offsets, points }) {
  renderContext.clearRect(0, 0, renderCanvas.width, renderCanvas.height);

  const { x: ox, y: oy } = offsets;
  const last = points.slice(-1)[0];
  renderContext.beginPath();
  renderContext.moveTo(last.x + ox, last.y + oy);
  points.forEach(({ c1x, c1y, c2x, c2y, x, y }) => {
    renderContext.bezierCurveTo(c1x + ox, c1y + oy, c2x + ox, c2y + oy, x + ox, y + oy);
  });
  renderContext.fill();
  const img = document.createElement('img');
  if (renderCanvas.toBlob && window.URL && window.URL.createObjectURL) {
    renderCanvas.toBlob((blob) => {
      const url = window.URL.createObjectURL(blob);
      img.onload = () => { window.URL.revokeObjectURL(url); };
      img.src = url;
    });
  } else {
    img.src = renderCanvas.toDataURL('image/png');
  }
  return img;
}

function newPetal() {
  const g = petalGuides[Math.floor(petalGuides.length * Math.random())];
  const img = renderPetal(g);
  const h = renderCanvas.height;
  const s = Math.max(0.3, Math.random());

  return {
    img,
    w: renderCanvas.width,
    h,
    sw: renderCanvas.width * s,
    sh: h * s,
    x: Math.random() * canvas.width,
    y: -(h + (Math.random() * h)),
    r: Math.random() * 360,
    speed: {
      x: ((Math.random() > 0.5 ? 1 : -1) * Math.random()) / 2,
      y: 2 + (Math.random() * (h / 40)),
    },
  };
}

function soEmotional() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  petals = petals.map((p) => {
    context.save();
    context.translate(p.x, p.y);
    context.rotate(p.r * TO_RAD);
    context.drawImage(p.img, 0, 0, p.w, p.h, 0, 0, p.sw, p.sh);
    context.restore();
    const newY = p.y + p.speed.y;
    let bye = false;
    if (newY - p.sh >= canvas.height) {
      bye = true;
    }
    return Object.assign(p, { x: p.x + p.speed.x, y: newY, bye });
  }).filter(p => !p.bye);
  if (shook) {
    if (petals.length < MAX_PETALS) {
      petals.push(newPetal());
    }
    shook = false;
  }
  window.requestAnimationFrame(soEmotional);
}

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', setCanvasSize);
window.addEventListener('orientationchange', setCanvasSize);
window.addEventListener('load', () => {
  setCanvasSize();
  for (let i = 0; i < 10; i += 1) {
    petals.push(newPetal());
  }
  soEmotional();
});

// Shook event listeners
const threshold = {
  cursor: 20,
  motion: 2,
};
const lastShook = {
  x: 0,
  y: 0,
  z: 0,
};
const currentShook = {
  x: 0,
  y: 0,
  z: 0,
};
function checkShook(th) {
  const diff = Math.abs(
    (currentShook.x - lastShook.x) +
    (currentShook.y - lastShook.y) +
    (currentShook.z - lastShook.z),
  );
  if (diff > th) {
    shook = true;
  }

  lastShook.x = currentShook.x;
  lastShook.y = currentShook.y;
  lastShook.z = currentShook.z;
}
window.addEventListener('mousemove', (e) => {
  currentShook.x = e.x || e.clientX || e.pageX;
  currentShook.y = e.y || e.clientY || e.pageY;

  checkShook(threshold.cursor);
});
window.addEventListener('devicemotion', (e) => {
  currentShook.x = e.accelerationIncludingGravity.x;
  currentShook.y = e.accelerationIncludingGravity.y;
  currentShook.z = e.accelerationIncludingGravity.z;

  checkShook(threshold.motion);
}, false);

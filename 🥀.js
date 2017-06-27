/* globals window, document */
(() => {
  const TO_RAD = Math.PI * 180;
  const MAX_PETALS = 100;
  const svg = document.querySelector('svg');
  const hairTop = svg.querySelector('#hair_top');
  const arms = svg.querySelector('#arms');
  const head = svg.querySelector('#head');
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');
  const instruct = document.querySelector('.instruct');


  const mask = document.createElement('canvas');
  const maskContext = mask.getContext('2d');

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
  let instructing = true;

  const renderCanvas = document.createElement('canvas');
  const renderContext = renderCanvas.getContext('2d');
  renderCanvas.width = 200;
  renderCanvas.height = 200;
  function renderPetal({ offsets, points }) {
    const rw = renderCanvas.width;
    const rh = renderCanvas.height;

    renderContext.clearRect(0, 0, rw, rh);
    let gradient = renderContext.createLinearGradient(0, 0, rw, rh);
    gradient.addColorStop(0, 'rgb(230, 0, 0)');
    gradient.addColorStop(1, 'red');
    renderContext.fillStyle = gradient;
    renderContext.fillRect(0, 0, rw, rh);

    gradient = renderContext.createLinearGradient(0, 0, rw, rh);
    gradient.addColorStop(0, 'rgba(200, 230, 230, 0)');
    gradient.addColorStop(0.5, 'rgba(200, 230, 230, 0)');
    gradient.addColorStop(1, 'rgba(200, 230, 230, 0.5)');
    renderContext.fillStyle = gradient;
    renderContext.fillRect(0, 0, rw, rh);

    const { x: ox, y: oy } = offsets;
    const last = points.slice(-1)[0];
    renderContext.beginPath();
    renderContext.moveTo(last.x + ox, last.y + oy);
    points.forEach(({ c1x, c1y, c2x, c2y, x, y }) => {
      renderContext.bezierCurveTo(c1x + ox, c1y + oy, c2x + ox, c2y + oy, x + ox, y + oy);
    });
    renderContext.globalCompositeOperation = 'destination-in';
    renderContext.fillStyle = 'black';
    renderContext.fill();
    renderContext.globalCompositeOperation = 'source-over';
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
    const headRect = head.getBoundingClientRect();
    const g = petalGuides[Math.floor(petalGuides.length * Math.random())];
    const img = renderPetal(g);
    const w = renderCanvas.width;
    const h = renderCanvas.height;
    const s = Math.random() * ((headRect.width / 2) / w);
    const hairRect = hairTop.getBoundingClientRect();
    const sw = Math.min(headRect.width * 0.22, Math.max(headRect.width * 0.18, w * s));
    const sh = Math.min(headRect.height * 0.22, Math.max(headRect.height * 0.18, h * s));

    return {
      img,
      w,
      h,
      sw,
      sh,
      x: sw + hairRect.left + (Math.random() * (hairRect.width * 0.4)),
      y: -(sh + (Math.random() * sh)) + hairRect.top + (hairRect.height * 0.3),
      r: Math.random() * 360,
      speed: {
        x: ((Math.random() > 0.5 ? 1 : -1) * Math.random()) / 2,
        y: 2 + (Math.random() * (sh / 10)),
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

    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0);
    context.globalCompositeOperation = 'source-over';

    window.requestAnimationFrame(soEmotional);
  }

  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mask.width = window.innerWidth;
    mask.height = window.innerHeight;

    // Repaint mask.
    // Sorry. I know.
    const height = mask.height;
    const hairRect = hairTop.getBoundingClientRect();
    const armsRect = arms.getBoundingClientRect();
    maskContext.beginPath();
    maskContext.moveTo(
      hairRect.left + (hairRect.width * 0.02),
      hairRect.top + (hairRect.height * 0.3),
    );
    maskContext.lineTo(0, 0);
    maskContext.lineTo(0, height);
    maskContext.lineTo(hairRect.right, height);
    maskContext.lineTo(hairRect.right, hairRect.bottom);
    maskContext.lineTo(hairRect.left + (hairRect.width * 0.79), hairRect.bottom);
    maskContext.lineTo(hairRect.left + (hairRect.width * 0.75), armsRect.bottom);
    maskContext.lineTo(hairRect.left + (hairRect.width * 0.67), armsRect.bottom);
    maskContext.lineTo(
      hairRect.left + (hairRect.width * 0.59),
      armsRect.top + (armsRect.height * 0.89),
    );
    maskContext.lineTo(
      hairRect.left + (hairRect.width * 0.57),
      armsRect.top + (armsRect.height * 0.73),
    );
    maskContext.lineTo(
      hairRect.left + (hairRect.width * 0.58),
      armsRect.top + (armsRect.height * 0.7),
    );
    maskContext.lineTo(
      hairRect.left + (hairRect.width * 0.46),
      armsRect.top + (armsRect.height * 0.52),
    );
    maskContext.lineTo(
      hairRect.left + (hairRect.width * 0.47),
      armsRect.top + (armsRect.height * 0.5),
    );
    maskContext.lineTo(
      hairRect.left + (hairRect.width * 0.35),
      armsRect.top + (armsRect.height * 0.24),
    );
    maskContext.lineTo(
      hairRect.left + (hairRect.width * 0.3),
      armsRect.top + (armsRect.height * 0.26),
    );
    maskContext.lineTo(
      hairRect.left + (hairRect.width * 0.23),
      armsRect.top + (armsRect.height * 0.235),
    );
    maskContext.lineTo(
      hairRect.left + (hairRect.width * 0.15),
      armsRect.top + (armsRect.height * 0.25),
    );
    maskContext.closePath();
    maskContext.fill();
  }

  // Window event listeners.
  window.addEventListener('resize', setCanvasSize);
  window.addEventListener('orientationchange', setCanvasSize);
  window.addEventListener('load', () => {
    setCanvasSize();
    setTimeout(() => {
      document.body.className = '';
      setTimeout(() => {
        for (let i = 0; i < 10; i += 1) {
          petals.push(newPetal());
        }
        instructing = false;
      }, 250);
    }, 2000);
    soEmotional();
  });

  // Shook event listeners.
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
    if (instructing) {
      return;
    }
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
  }, false);
  window.addEventListener('devicemotion', (e) => {
    currentShook.x = e.accelerationIncludingGravity.x;
    currentShook.y = e.accelerationIncludingGravity.y;
    currentShook.z = e.accelerationIncludingGravity.z;

    checkShook(threshold.motion);
  }, false);

  // Shook instructions.
  if (window.DeviceMotionEvent) {
    // Mobile
    instruct.src = 'instructions.svg';
  } else {
    // Etc.
    instruct.src = 'instructions-desktop.svg';
  }
})();

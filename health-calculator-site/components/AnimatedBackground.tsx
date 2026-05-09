'use client';

import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   Brand tokens (mirror globals.css)
───────────────────────────────────────────── */
const YELLOW = 'rgba(245,197,24,';   // #F5C518
const GREEN  = 'rgba(61,220,132,';   // #3DDC84
const WHITE  = 'rgba(255,255,255,';
const BG     = '#0a0a08';

/* ─────────────────────────────────────────────
   Orb definitions
───────────────────────────────────────────── */
const ORBS = [
  { xPct: 0.15, yPct: 0.20, r: 320, color: `${YELLOW}0.055)`, driftX:  0.6, driftY:  0.3 },
  { xPct: 0.82, yPct: 0.60, r: 260, color: `${GREEN}0.04)`,   driftX: -0.5, driftY: -0.25 },
  { xPct: 0.50, yPct: 0.85, r: 200, color: `${YELLOW}0.035)`, driftX:  0.4, driftY: -0.35 },
  { xPct: 0.72, yPct: 0.10, r: 180, color: `${GREEN}0.03)`,   driftX: -0.35, driftY: 0.45 },
];

/* ─────────────────────────────────────────────
   Particle config
───────────────────────────────────────────── */
const PARTICLE_COUNT = 28;

function randomParticle(id: number) {
  const roll = Math.random();
  const color =
    roll < 0.45 ? `${YELLOW}${(0.25 + Math.random() * 0.45).toFixed(2)})` :
    roll < 0.75 ? `${GREEN}${(0.2  + Math.random() * 0.4).toFixed(2)})`  :
                  `${WHITE}${(0.15 + Math.random() * 0.35).toFixed(2)})`;
  const size     = (1.5 + Math.random() * 4).toFixed(1);
  const duration = (8  + Math.random() * 14).toFixed(1);
  const delay    = (Math.random() * 12).toFixed(1);
  const left     = (Math.random() * 100).toFixed(1);
  return { id, color, size, duration, delay, left };
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Canvas animation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let raf = 0;
    let t = 0;
    let resizeTimer: ReturnType<typeof setTimeout>;

    function resize() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();

    function draw() {
      t += 0.004;

      /* Base fill */
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      /* Glowing orbs */
      for (const orb of ORBS) {
        const cx = orb.xPct * W + Math.sin(t * orb.driftX) * 60;
        const cy = orb.yPct * H + Math.cos(t * orb.driftY) * 50;
        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
        grad.addColorStop(0,   orb.color);
        grad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(cx, cy, orb.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      /* Subtle grid */
      const cols    = 14;
      const rows    = 8;
      const gridSpX = W / cols;
      const gridSpY = H / rows;
      const offX    = (t * 18) % gridSpX;
      const offY    = (t * 10) % gridSpY;
      ctx!.strokeStyle = `rgba(255,255,255,0.015)`;
      ctx!.lineWidth   = 0.5;
      ctx!.beginPath();
      for (let x = -gridSpX + offX; x < W + gridSpX; x += gridSpX) {
        ctx!.moveTo(x, 0); ctx!.lineTo(x, H);
      }
      for (let y = -gridSpY + offY; y < H + gridSpY; y += gridSpY) {
        ctx!.moveTo(0, y); ctx!.lineTo(W, y);
      }
      ctx!.stroke();

      /* Diagonal scan line */
      const scanX = ((t * 80) % (W + 300)) - 150;
      const scan  = ctx!.createLinearGradient(scanX - 150, 0, scanX + 150, 0);
      scan.addColorStop(0,    'rgba(245,197,24,0)');
      scan.addColorStop(0.5,  'rgba(245,197,24,0.018)');
      scan.addColorStop(1,    'rgba(245,197,24,0)');
      ctx!.fillStyle = scan;
      ctx!.fillRect(scanX - 150, 0, 300, H);

      raf = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  /* ── Particles ── */
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) =>
    randomParticle(i),
  );

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(110vh); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-10vh);  opacity: 0; }
        }
      `}</style>

      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        0,
          pointerEvents: 'none',
          display:       'block',
        }}
        aria-hidden="true"
      />

      {/* Particle overlay */}
      <div
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        1,
          pointerEvents: 'none',
          overflow:      'hidden',
        }}
        aria-hidden="true"
      >
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position:        'absolute',
              bottom:          0,
              left:            `${p.left}%`,
              width:           `${p.size}px`,
              height:          `${p.size}px`,
              borderRadius:    '50%',
              background:      p.color,
              animation:       `floatUp ${p.duration}s ${p.delay}s infinite linear`,
              willChange:      'transform, opacity',
            }}
          />
        ))}
      </div>
    </>
  );
}

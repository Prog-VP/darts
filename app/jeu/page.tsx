"use client";

import { useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

type Dart = { x: number; y: number; score: number };

const BOARD_SIZE = 500;
const CENTER = BOARD_SIZE / 2;
const R_BULL = 12;
const R_OUTER_BULL = 28;
const R_TRIPLE_IN = 150;
const R_TRIPLE_OUT = 165;
const R_DOUBLE_IN = 235;
const R_DOUBLE_OUT = 250;

const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

function getScore(x: number, y: number): { value: number; label: string } {
  const dx = x - CENTER;
  const dy = y - CENTER;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= R_BULL) return { value: 50, label: "BULLSEYE !" };
  if (dist <= R_OUTER_BULL) return { value: 25, label: "Bull" };
  if (dist > R_DOUBLE_OUT) return { value: 0, label: "Raté" };

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const normalized = (angle + 90 + 9 + 360) % 360;
  const sectorIndex = Math.floor(normalized / 18);
  const base = SECTORS[sectorIndex];

  if (dist >= R_DOUBLE_IN && dist <= R_DOUBLE_OUT) return { value: base * 2, label: `Double ${base}` };
  if (dist >= R_TRIPLE_IN && dist <= R_TRIPLE_OUT) return { value: base * 3, label: `Triple ${base}` };
  return { value: base, label: `${base}` };
}

export default function GamePage() {
  const [darts, setDarts] = useState<Dart[]>([]);
  const [lastLabel, setLastLabel] = useState<string>("Vise le bullseye");

  const throwDart = (clientX: number, clientY: number, rect: DOMRect) => {
    if (darts.length >= 3) return;
    const scaleX = BOARD_SIZE / rect.width;
    const scaleY = BOARD_SIZE / rect.height;
    const rawX = (clientX - rect.left) * scaleX;
    const rawY = (clientY - rect.top) * scaleY;
    const distFromCenter = Math.sqrt((rawX - CENTER) ** 2 + (rawY - CENTER) ** 2);
    const jitter = 55 + distFromCenter * 0.25;
    const angle = Math.random() * Math.PI * 2;
    const magnitude = Math.random() * jitter;
    const x = rawX + Math.cos(angle) * magnitude;
    const y = rawY + Math.sin(angle) * magnitude;
    const { value, label } = getScore(x, y);
    setDarts((prev) => [...prev, { x, y, score: value }]);
    setLastLabel(label);
  };

  const onClick = (e: ReactMouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    throwDart(e.clientX, e.clientY, rect);
  };

  const onTouch = (e: ReactTouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    throwDart(touch.clientX, touch.clientY, rect);
  };

  const reset = () => {
    setDarts([]);
    setLastLabel("Vise le bullseye");
  };

  const total = darts.reduce((sum, d) => sum + d.score, 0);
  const finished = darts.length >= 3;

  const wedges = Array.from({ length: 20 }).map((_, i) => {
    const startAngle = -99 + i * 18;
    const endAngle = startAngle + 18;
    const isAlt = i % 2 === 0;
    return { i, startAngle, endAngle, fillBase: isAlt ? "#1a1a1a" : "#F0E6D2", fillAccent: isAlt ? "#2D8B46" : "#E63946" };
  });

  const arcPath = (r1: number, r2: number, a1: number, a2: number) => {
    const rad = (a: number) => (a * Math.PI) / 180;
    const p1 = [CENTER + r2 * Math.cos(rad(a1)), CENTER + r2 * Math.sin(rad(a1))];
    const p2 = [CENTER + r2 * Math.cos(rad(a2)), CENTER + r2 * Math.sin(rad(a2))];
    const p3 = [CENTER + r1 * Math.cos(rad(a2)), CENTER + r1 * Math.sin(rad(a2))];
    const p4 = [CENTER + r1 * Math.cos(rad(a1)), CENTER + r1 * Math.sin(rad(a1))];
    return `M ${p1[0]} ${p1[1]} A ${r2} ${r2} 0 0 1 ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} A ${r1} ${r1} 0 0 0 ${p4[0]} ${p4[1]} Z`;
  };

  return (
    <main style={styles.main}>
      <div style={styles.header}>
        <a href="/" style={styles.back}>← Retour</a>
        <h1 style={styles.title}>Lancer de Fléchettes</h1>
        <p style={styles.sub}>Clique ou touche la cible — 3 fléchettes.</p>
      </div>

      <div style={styles.scoreRow}>
        <div style={styles.scoreBox}>
          <span style={styles.scoreLabel}>Total</span>
          <span style={styles.scoreValue}>{total}</span>
        </div>
        <div style={styles.scoreBox}>
          <span style={styles.scoreLabel}>Fléchettes</span>
          <span style={styles.scoreValue}>{darts.length} / 3</span>
        </div>
        <div style={styles.scoreBox}>
          <span style={styles.scoreLabel}>Dernier</span>
          <span style={styles.scoreValueSmall}>{lastLabel}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        style={styles.board}
        onClick={onClick}
        onTouchEnd={onTouch}
      >
        <circle cx={CENTER} cy={CENTER} r={R_DOUBLE_OUT + 15} fill="#111" stroke="#2a2a2a" strokeWidth="2" />

        {wedges.map(({ i, startAngle, endAngle, fillBase, fillAccent }) => (
          <g key={i}>
            <path d={arcPath(R_OUTER_BULL, R_TRIPLE_IN, startAngle, endAngle)} fill={fillBase} />
            <path d={arcPath(R_TRIPLE_IN, R_TRIPLE_OUT, startAngle, endAngle)} fill={fillAccent} />
            <path d={arcPath(R_TRIPLE_OUT, R_DOUBLE_IN, startAngle, endAngle)} fill={fillBase} />
            <path d={arcPath(R_DOUBLE_IN, R_DOUBLE_OUT, startAngle, endAngle)} fill={fillAccent} />
          </g>
        ))}

        <circle cx={CENTER} cy={CENTER} r={R_OUTER_BULL} fill="#2D8B46" />
        <circle cx={CENTER} cy={CENTER} r={R_BULL} fill="#E63946" />

        {SECTORS.map((num, i) => {
          const angle = -90 + i * 18;
          const rad = (angle * Math.PI) / 180;
          const r = R_DOUBLE_OUT + 20;
          const x = CENTER + r * Math.cos(rad);
          const y = CENTER + r * Math.sin(rad);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#F0E6D2" fontSize="18" fontWeight="700">
              {num}
            </text>
          );
        })}

        {darts.map((d, idx) => (
          <g key={idx}>
            <circle cx={d.x} cy={d.y} r="5" fill="#fff" stroke="#000" strokeWidth="1.5" />
            <circle cx={d.x} cy={d.y} r="2" fill="#000" />
          </g>
        ))}
      </svg>

      {finished && (
        <div style={styles.endBox}>
          <p style={styles.endText}>Partie terminée — {total} points</p>
          <button onClick={reset} style={styles.button}>Rejouer</button>
        </div>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#F0E6D2",
    fontFamily: "var(--font-display), 'Outfit', sans-serif",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: { textAlign: "center", marginBottom: "1rem" },
  back: { position: "absolute", top: "1rem", left: "1rem", color: "#9a9a9a", textDecoration: "none", fontSize: "0.9rem" },
  title: { fontFamily: "var(--font-heading), 'Bebas Neue', sans-serif", fontSize: "2.2rem", margin: 0, letterSpacing: "0.03em" },
  sub: { margin: "0.3rem 0 0", color: "#9a9a9a", fontSize: "0.9rem" },
  scoreRow: { display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", justifyContent: "center" },
  scoreBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0.6rem 1.2rem",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    background: "#141414",
    minWidth: "100px",
  },
  scoreLabel: { fontSize: "0.7rem", color: "#9a9a9a", letterSpacing: "0.14em", textTransform: "uppercase" },
  scoreValue: { fontFamily: "var(--font-heading), 'Bebas Neue', sans-serif", fontSize: "1.6rem" },
  scoreValueSmall: { fontSize: "1rem", fontWeight: 600 },
  board: {
    width: "min(90vw, 520px)",
    height: "auto",
    cursor: "crosshair",
    touchAction: "none",
    userSelect: "none",
  },
  endBox: {
    marginTop: "1rem",
    textAlign: "center",
  },
  endText: { fontSize: "1.2rem", marginBottom: "0.8rem" },
  button: {
    padding: "0.7rem 1.6rem",
    border: "1px solid #E63946",
    background: "rgba(230,57,70,0.1)",
    color: "#F0E6D2",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "1rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
};

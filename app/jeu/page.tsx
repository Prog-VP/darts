"use client";

import { useState, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

const BEST_KEY = "lausanne-darts-best-score";

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
  const [lastLabel, setLastLabel] = useState<string>("—");
  const [best, setBest] = useState<number>(0);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(BEST_KEY);
    if (stored) setBest(Number(stored) || 0);
  }, []);

  const throwDart = (clientX: number, clientY: number, rect: DOMRect) => {
    if (darts.length >= 3) return;
    const scaleX = (BOARD_SIZE + 80) / rect.width;
    const scaleY = (BOARD_SIZE + 80) / rect.height;
    const rawX = (clientX - rect.left) * scaleX - 40;
    const rawY = (clientY - rect.top) * scaleY - 40;
    const distFromCenter = Math.sqrt((rawX - CENTER) ** 2 + (rawY - CENTER) ** 2);
    const skillFactor = Math.max(0, 1 - gamesPlayed * 0.05);
    const jitter = (55 + distFromCenter * 0.25) * skillFactor;
    const angle = Math.random() * Math.PI * 2;
    const magnitude = Math.random() * jitter;
    const x = rawX + Math.cos(angle) * magnitude;
    const y = rawY + Math.sin(angle) * magnitude;
    const { value, label } = getScore(x, y);
    setDarts((prev) => {
      const updated = [...prev, { x, y, score: value }];
      if (updated.length === 3) {
        const finalTotal = updated.reduce((s, d) => s + d.score, 0);
        if (finalTotal > best) {
          setBest(finalTotal);
          window.localStorage.setItem(BEST_KEY, String(finalTotal));
        }
        setGamesPlayed((g) => g + 1);
      }
      return updated;
    });
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
    setLastLabel("—");
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
        <p style={styles.tip}>À ce qu&apos;il paraît, plus tu joues, plus tu t&apos;améliores…</p>
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
        <div style={styles.scoreBox}>
          <span style={styles.scoreLabel}>Ton best score</span>
          <span style={styles.scoreValue}>{best}</span>
        </div>
        <div style={styles.scoreBox}>
          <span style={styles.scoreLabel}>Parties jouées</span>
          <span style={styles.scoreValue}>{gamesPlayed}</span>
        </div>
      </div>

      <svg
        viewBox={`-40 -40 ${BOARD_SIZE + 80} ${BOARD_SIZE + 80}`}
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
          {total === 180 ? (
            <>
              <div className="jeu-confetti" aria-hidden="true">
                {Array.from({ length: 30 }).map((_, i) => (
                  <span key={i} className="jeu-confetti-piece" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.4}s`,
                    background: ["#E63946", "#2D8B46", "#F0E6D2"][i % 3],
                  }} />
                ))}
              </div>
              <div className="jeu-prize">
                <p style={styles.prizeTitle}>🎯 180 — PARTIE OFFERTE !</p>
                <p style={styles.prizeText}>
                  Screenshot cette page et montre-la à l&apos;ouverture avec ton code :
                </p>
                <p style={styles.promoCode}>BULLSEYE180</p>
              </div>
            </>
          ) : (
            <p style={styles.endText}>Partie terminée — {total} points</p>
          )}
          <button onClick={reset} style={styles.button}>Rejouer</button>
        </div>
      )}

      <style jsx global>{`
        .jeu-prize {
          padding: 1.2rem 1.6rem;
          margin-bottom: 1rem;
          border: 2px solid #E63946;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(230,57,70,0.18), rgba(45,139,70,0.12));
          animation: jeu-prize-in 600ms cubic-bezier(0.2, 1.4, 0.4, 1) both, jeu-prize-glow 1.8s ease-in-out infinite alternate 600ms;
        }
        @keyframes jeu-prize-in {
          0% { transform: scale(0.6) rotate(-4deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes jeu-prize-glow {
          from { box-shadow: 0 0 0 rgba(230, 57, 70, 0); }
          to { box-shadow: 0 0 40px rgba(230, 57, 70, 0.6), 0 0 80px rgba(45, 139, 70, 0.35); }
        }
        .jeu-confetti {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 50;
        }
        .jeu-confetti-piece {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 14px;
          border-radius: 2px;
          animation: jeu-confetti-fall 2.4s ease-in forwards;
        }
        @keyframes jeu-confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
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
  prize: {
    padding: "1.2rem 1.6rem",
    marginBottom: "1rem",
    border: "2px solid #E63946",
    borderRadius: "14px",
    background: "linear-gradient(180deg, rgba(230,57,70,0.15), rgba(45,139,70,0.1))",
  },
  prizeTitle: {
    fontFamily: "var(--font-heading), 'Bebas Neue', sans-serif",
    fontSize: "1.6rem",
    margin: "0 0 0.5rem",
    color: "#F0E6D2",
    letterSpacing: "0.05em",
  },
  prizeText: { margin: 0, fontSize: "0.95rem", color: "#F0E6D2" },
  promoCode: {
    marginTop: "0.8rem",
    fontFamily: "var(--font-heading), 'Bebas Neue', sans-serif",
    fontSize: "1.8rem",
    letterSpacing: "0.25em",
    color: "#F0E6D2",
    padding: "0.4rem 0.8rem",
    border: "1.5px dashed #2D8B46",
    borderRadius: "8px",
    display: "inline-block",
  },
  tip: {
    marginTop: "0.6rem",
    fontSize: "0.8rem",
    color: "#9a9a9a",
    fontStyle: "italic",
  },
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

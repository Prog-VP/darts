"use client";

import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from "react";

const BEST_DARTS_KEY = "lausanne-darts-best-darts";
const STARTING_SCORE = 501;

type Zone = "miss" | "single" | "double" | "triple" | "bull" | "bullseye";
type Dart = { x: number; y: number; score: number; zone: Zone; label: string };

const BOARD_SIZE = 500;
const CENTER = BOARD_SIZE / 2;
const R_BULL = 12;
const R_OUTER_BULL = 28;
const R_TRIPLE_IN = 150;
const R_TRIPLE_OUT = 165;
const R_DOUBLE_IN = 235;
const R_DOUBLE_OUT = 250;

const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

function getScore(x: number, y: number): { value: number; label: string; zone: Zone } {
  const dx = x - CENTER;
  const dy = y - CENTER;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= R_BULL) return { value: 50, label: "Bullseye", zone: "bullseye" };
  if (dist <= R_OUTER_BULL) return { value: 25, label: "Bull", zone: "bull" };
  if (dist > R_DOUBLE_OUT) return { value: 0, label: "Raté", zone: "miss" };

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const normalized = (angle + 90 + 9 + 360) % 360;
  const sectorIndex = Math.floor(normalized / 18);
  const base = SECTORS[sectorIndex];

  if (dist >= R_DOUBLE_IN && dist <= R_DOUBLE_OUT) return { value: base * 2, label: `D${base}`, zone: "double" };
  if (dist >= R_TRIPLE_IN && dist <= R_TRIPLE_OUT) return { value: base * 3, label: `T${base}`, zone: "triple" };
  return { value: base, label: `${base}`, zone: "single" };
}

function suggestCheckout(n: number): string[] | null {
  if (n < 2 || n > 170) return null;
  const endOut = (r: number): string | null => {
    if (r === 50) return "Bull";
    if (r >= 2 && r <= 40 && r % 2 === 0) return `D${r / 2}`;
    return null;
  };
  const oneDart = endOut(n);
  if (oneDart) return [oneDart];

  for (let t = 20; t >= 1; t--) {
    const f = endOut(n - t * 3);
    if (f) return [`T${t}`, f];
  }
  for (let s = 20; s >= 1; s--) {
    const f = endOut(n - s);
    if (f) return [`${s}`, f];
  }
  const bullFirst = endOut(n - 25);
  if (bullFirst) return ["25", bullFirst];

  for (const t1 of [20, 19, 18, 17, 16, 15]) {
    const after1 = n - t1 * 3;
    if (after1 < 2) continue;
    for (let t2 = 20; t2 >= 1; t2--) {
      const f = endOut(after1 - t2 * 3);
      if (f) return [`T${t1}`, `T${t2}`, f];
    }
    for (let s = 20; s >= 1; s--) {
      const f = endOut(after1 - s);
      if (f) return [`T${t1}`, `${s}`, f];
    }
  }
  return null;
}

export default function GamePage() {
  const [remaining, setRemaining] = useState<number>(STARTING_SCORE);
  const [visitDarts, setVisitDarts] = useState<Dart[]>([]);
  const [visitStartScore, setVisitStartScore] = useState<number>(STARTING_SCORE);
  const [totalDarts, setTotalDarts] = useState<number>(0);
  const [lastLabel, setLastLabel] = useState<string>("—");
  const [bust, setBust] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [bestDarts, setBestDarts] = useState<number | null>(null);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [lastVisitScore, setLastVisitScore] = useState<number>(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(BEST_DARTS_KEY);
    if (stored) {
      const value = Number(stored);
      if (value > 0) setBestDarts(value);
    }
  }, []);

  const throwDart = (clientX: number, clientY: number, rect: DOMRect) => {
    if (won || bust) return;
    if (visitDarts.length >= 3) return;

    const scaleX = (BOARD_SIZE + 80) / rect.width;
    const scaleY = (BOARD_SIZE + 80) / rect.height;
    const rawX = (clientX - rect.left) * scaleX - 40;
    const rawY = (clientY - rect.top) * scaleY - 40;
    const distFromCenter = Math.sqrt((rawX - CENTER) ** 2 + (rawY - CENTER) ** 2);
    const skillFactor = Math.max(0, 1 - gamesPlayed * 0.01);
    const jitter = (55 + distFromCenter * 0.25) * skillFactor;
    const angle = Math.random() * Math.PI * 2;
    const magnitude = Math.random() * jitter;
    const x = rawX + Math.cos(angle) * magnitude;
    const y = rawY + Math.sin(angle) * magnitude;
    const { value, label, zone } = getScore(x, y);
    const newDart: Dart = { x, y, score: value, zone, label };

    const isDouble = zone === "double" || zone === "bullseye";
    const potential = remaining - value;
    const isWin = potential === 0 && isDouble;
    const isBust = potential < 0 || potential === 1 || (potential === 0 && !isDouble);

    const updatedVisit = [...visitDarts, newDart];
    const newTotal = totalDarts + 1;

    setTotalDarts(newTotal);
    setLastLabel(label);

    if (isWin) {
      setRemaining(0);
      setVisitDarts(updatedVisit);
      setLastVisitScore(updatedVisit.reduce((s, d) => s + d.score, 0));
      setWon(true);
      setGamesPlayed((g) => g + 1);
      if (bestDarts === null || newTotal < bestDarts) {
        setBestDarts(newTotal);
        window.localStorage.setItem(BEST_DARTS_KEY, String(newTotal));
      }
      return;
    }

    if (isBust) {
      setVisitDarts(updatedVisit);
      setBust(true);
      setLastVisitScore(0);
      window.setTimeout(() => {
        setRemaining(visitStartScore);
        setVisitDarts([]);
        setBust(false);
      }, 1600);
      return;
    }

    setRemaining(potential);
    if (updatedVisit.length === 3) {
      setVisitStartScore(potential);
      setVisitDarts(updatedVisit);
      setLastVisitScore(updatedVisit.reduce((s, d) => s + d.score, 0));
      window.setTimeout(() => setVisitDarts([]), 900);
    } else {
      setVisitDarts(updatedVisit);
    }
  };

  const onClick = (e: ReactMouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    throwDart(e.clientX, e.clientY, rect);
  };

  const reset = () => {
    setRemaining(STARTING_SCORE);
    setVisitDarts([]);
    setVisitStartScore(STARTING_SCORE);
    setTotalDarts(0);
    setLastLabel("—");
    setBust(false);
    setWon(false);
    setLastVisitScore(0);
  };

  const scored = STARTING_SCORE - remaining;
  const ppr = totalDarts === 0 ? 0 : (scored / totalDarts) * 3;
  const visitScoreLive = visitDarts.reduce((s, d) => s + d.score, 0);
  const checkout = suggestCheckout(remaining);

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
    <main style={styles.main} className="jeu-main">
      <div style={styles.header} className="jeu-header">
        <a href="/" style={styles.back} className="jeu-back">← Retour</a>
        <h1 style={styles.title} className="jeu-title">501 SIDO</h1>
        <p style={styles.sub} className="jeu-sub">Commence direct, finis sur un double.</p>
      </div>

      <div className="jeu-panel">
        <div className="jeu-visit-row">
          {[0, 1, 2].map((i) => {
            const d = visitDarts[i];
            return (
              <div key={i} className={`jeu-visit-slot ${d ? "is-filled" : ""}`}>
                {d ? d.label : "—"}
              </div>
            );
          })}
        </div>

        {checkout && !won && (
          <div className="jeu-checkout">
            <span className="jeu-checkout-label">Checkout</span>
            <span className="jeu-checkout-route">
              {checkout.map((c, i) => (
                <span key={i} className="jeu-checkout-step">{c}</span>
              ))}
            </span>
          </div>
        )}

        <div className="jeu-score-main">
          <div className="jeu-score-side">
            <span className="jeu-score-prev">{visitStartScore}</span>
            <span className="jeu-score-delta">
              {visitDarts.length > 0 ? `−${visitScoreLive}` : ""}
            </span>
            <span className="jeu-score-player">V1NCENT_P</span>
          </div>
          <div className="jeu-score-big">{remaining}</div>
        </div>

        <div className="jeu-score-footer">
          <div className="jeu-foot-item">
            <span>PPR</span>
            <strong>{ppr.toFixed(1)}</strong>
          </div>
          <div className="jeu-foot-item">
            <span>Dernière volée</span>
            <strong>{lastVisitScore}</strong>
          </div>
          <div className="jeu-foot-item">
            <span>Darts</span>
            <strong>{totalDarts}</strong>
          </div>
          <div className="jeu-foot-item">
            <span>Best</span>
            <strong>{bestDarts ?? "—"}</strong>
          </div>
        </div>
      </div>

      <svg
        viewBox={`-40 -40 ${BOARD_SIZE + 80} ${BOARD_SIZE + 80}`}
        style={styles.board}
        className="jeu-board"
        onClick={onClick}
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

        {visitDarts.map((d, idx) => (
          <g key={idx}>
            <circle cx={d.x} cy={d.y} r="5" fill="#fff" stroke="#000" strokeWidth="1.5" />
            <circle cx={d.x} cy={d.y} r="2" fill="#000" />
          </g>
        ))}
      </svg>

      {bust && (
        <div className="jeu-bust" aria-live="assertive">BUST</div>
      )}

      {won && (
        <div
          className="jeu-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jeu-modal-title"
        >
          {totalDarts <= 9 && (
            <div className="jeu-confetti" aria-hidden="true">
              {Array.from({ length: 30 }).map((_, i) => (
                <span
                  key={i}
                  className="jeu-confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.4}s`,
                    background: ["#E63946", "#2D8B46", "#F0E6D2"][i % 3],
                  }}
                />
              ))}
            </div>
          )}

          <div className="jeu-modal">
            {totalDarts <= 9 ? (
              <div className="jeu-prize">
                <p id="jeu-modal-title" className="jeu-modal-title jeu-modal-title--prize">
                  🎯 9-DARTER — Partie offerte !
                </p>
                <p className="jeu-modal-text">
                  Tu viens de finir le 501 en {totalDarts} darts. Screenshot cette page et montre-la à l&apos;ouverture avec ton code :
                </p>
                <p className="jeu-promo-code">NINEDARTER</p>
              </div>
            ) : (
              <>
                <p className="jeu-modal-eyebrow">Game shot !</p>
                <p id="jeu-modal-title" className="jeu-modal-score">{totalDarts}</p>
                <p className="jeu-modal-text">
                  {totalDarts <= 15 ? "darts — très propre" : totalDarts <= 24 ? "darts — solide" : "darts pour finir le 501"}
                </p>
              </>
            )}
            <button onClick={reset} className="jeu-modal-button">Rejouer</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .jeu-panel {
          width: 100%;
          max-width: 520px;
          margin-bottom: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          background: #141414;
          overflow: hidden;
        }

        .jeu-visit-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          padding: 0.6rem;
          background: rgba(240, 230, 210, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .jeu-visit-slot {
          display: grid;
          place-items: center;
          padding: 0.55rem 0.4rem;
          border-radius: 8px;
          background: #1e1e1e;
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-family: var(--font-heading), "Bebas Neue", sans-serif;
          font-size: 1.1rem;
          letter-spacing: 0.04em;
          color: rgba(154, 154, 154, 0.7);
          min-height: 40px;
        }

        .jeu-visit-slot.is-filled {
          color: #F0E6D2;
          background: #2a2a2a;
          border-color: rgba(230, 57, 70, 0.3);
        }

        .jeu-checkout {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.8rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(244, 160, 36, 0.06);
        }

        .jeu-checkout-label {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #F4A024;
        }

        .jeu-checkout-route {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .jeu-checkout-step {
          padding: 0.15rem 0.55rem;
          border-radius: 999px;
          background: rgba(244, 160, 36, 0.14);
          border: 1px solid rgba(244, 160, 36, 0.3);
          font-family: var(--font-heading), "Bebas Neue", sans-serif;
          font-size: 0.92rem;
          color: #F0E6D2;
          letter-spacing: 0.04em;
        }

        .jeu-score-main {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 1.1rem;
        }

        .jeu-score-side {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          min-width: 0;
        }

        .jeu-score-prev {
          font-family: var(--font-heading), "Bebas Neue", sans-serif;
          font-size: 1rem;
          color: #9a9a9a;
          text-decoration: line-through;
          letter-spacing: 0.02em;
        }

        .jeu-score-delta {
          min-height: 1.1rem;
          font-family: var(--font-heading), "Bebas Neue", sans-serif;
          font-size: 1.15rem;
          color: #E63946;
          letter-spacing: 0.02em;
        }

        .jeu-score-player {
          margin-top: 0.2rem;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9a9a9a;
        }

        .jeu-score-big {
          justify-self: end;
          font-family: var(--font-heading), "Bebas Neue", sans-serif;
          font-size: clamp(3.4rem, 14vw, 5.4rem);
          line-height: 0.95;
          color: #F0E6D2;
          letter-spacing: 0.01em;
        }

        .jeu-score-footer {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 0.5rem;
          padding: 0.6rem 0.8rem;
          background: #0f0f0f;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .jeu-foot-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          min-width: 0;
        }

        .jeu-foot-item span {
          font-size: 0.58rem;
          color: #9a9a9a;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .jeu-foot-item strong {
          font-family: var(--font-heading), "Bebas Neue", sans-serif;
          font-size: 1.1rem;
          font-weight: 400;
          color: #F0E6D2;
          letter-spacing: 0.02em;
        }

        .jeu-bust {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          z-index: 95;
          font-family: var(--font-heading), "Bebas Neue", sans-serif;
          font-size: clamp(4rem, 18vw, 9rem);
          letter-spacing: 0.1em;
          color: #E63946;
          text-shadow: 0 0 40px rgba(230, 57, 70, 0.7);
          pointer-events: none;
          animation:
            jeu-bust-in 180ms ease both,
            jeu-bust-out 320ms ease 1.25s both;
        }

        @keyframes jeu-bust-in {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes jeu-bust-out {
          to { opacity: 0; transform: scale(1.1); }
        }

        .jeu-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.2rem;
          padding-top: calc(1.2rem + env(safe-area-inset-top));
          padding-bottom: calc(1.2rem + env(safe-area-inset-bottom));
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(10px);
          animation: jeu-fade-in 220ms ease;
        }

        .jeu-modal {
          position: relative;
          width: 100%;
          max-width: 380px;
          padding: 2rem 1.5rem;
          text-align: center;
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 22px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
          animation: jeu-pop-in 360ms cubic-bezier(0.2, 1.2, 0.35, 1);
        }

        .jeu-modal-eyebrow {
          margin: 0;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9a9a9a;
        }

        .jeu-modal-score {
          margin: 0.4rem 0 0;
          font-family: var(--font-heading), "Bebas Neue", sans-serif;
          font-size: 4.5rem;
          line-height: 1;
          color: #F0E6D2;
          letter-spacing: 0.02em;
        }

        .jeu-modal-text {
          margin: 0.4rem 0 0;
          font-size: 0.95rem;
          color: #9a9a9a;
        }

        .jeu-modal-title--prize {
          margin: 0;
          font-family: var(--font-heading), "Bebas Neue", sans-serif;
          font-size: 1.8rem;
          color: #F0E6D2;
          letter-spacing: 0.04em;
        }

        .jeu-modal-button {
          margin-top: 1.4rem;
          padding: 0.85rem 2rem;
          border: 1px solid rgba(230, 57, 70, 0.5);
          background: rgba(230, 57, 70, 0.18);
          color: #F0E6D2;
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition:
            background 220ms ease,
            border-color 220ms ease,
            transform 220ms ease;
        }

        .jeu-modal-button:hover,
        .jeu-modal-button:focus-visible {
          background: rgba(230, 57, 70, 0.28);
          border-color: rgba(230, 57, 70, 0.8);
          outline: none;
          transform: translateY(-1px);
        }

        @keyframes jeu-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes jeu-pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          60% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); }
        }

        @media (max-width: 640px) {
          .jeu-main {
            padding: 1rem 0.75rem !important;
            padding-top: calc(1rem + env(safe-area-inset-top)) !important;
            padding-bottom: calc(2rem + env(safe-area-inset-bottom)) !important;
          }

          .jeu-back {
            position: static !important;
            align-self: flex-start;
            margin-bottom: 0.4rem;
          }

          .jeu-header {
            width: 100%;
            margin-bottom: 0.75rem !important;
          }

          .jeu-title {
            font-size: 1.5rem !important;
          }

          .jeu-sub {
            font-size: 0.82rem !important;
          }

          .jeu-tip {
            display: none;
          }

          .jeu-panel {
            margin-bottom: 0.7rem;
          }

          .jeu-visit-slot {
            font-size: 1rem;
            min-height: 34px;
            padding: 0.4rem 0.3rem;
          }

          .jeu-checkout-label {
            font-size: 0.55rem;
          }

          .jeu-checkout-step {
            font-size: 0.82rem;
          }

          .jeu-score-main {
            padding: 0.8rem 0.9rem;
            gap: 0.6rem;
          }

          .jeu-score-big {
            font-size: clamp(3rem, 16vw, 4.5rem);
          }

          .jeu-score-prev {
            font-size: 0.9rem;
          }

          .jeu-score-delta {
            font-size: 1rem;
          }

          .jeu-foot-item span {
            font-size: 0.52rem;
          }

          .jeu-foot-item strong {
            font-size: 0.95rem;
          }

          .jeu-board {
            width: min(100vw - 1.5rem, 520px) !important;
            margin-bottom: 0.5rem;
          }

          .jeu-modal-score {
            font-size: 3.8rem;
          }
        }

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
    touchAction: "manipulation",
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

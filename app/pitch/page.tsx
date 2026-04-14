"use client";

import dynamic from "next/dynamic";
import { Bebas_Neue, Outfit } from "next/font/google";
import { useCallback, useEffect, useState } from "react";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-heading",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-pitch",
});

const ThreeBackground = dynamic(() => import("../ThreeBackground"), {
  ssr: false,
});

type Slide = {
  tag?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  highlight?: string;
  coverDate?: string;
  columns?: { label: string; value: string }[];
  press?: { quote: string; source: string; date: string }[];
  offers?: { name: string; price: string; perks: string[] }[];
  contact?: { address: string; email: string; team?: { name: string; role: string; desc: string; fun: string }[] };
};

const SLIDES: Slide[] = [
  {
    title: "Lausanne\nDarts",
    coverDate: "Opening : 1er août 2026",
    bullets: ["Rue St-Martin 9, Lausanne"],
  },
  {
    tag: "Le problème",
    title: "Aucun lieu dédié\naux fléchettes",
    subtitle: "Le constat à Lausanne :",
    columns: [
      { label: "Espace inadapté", value: "Des cibles de bar coincées entre la porte et le billard" },
      { label: "Mauvais matériel", value: "Mal entretenu, pointes cassées, cibles usées" },
      { label: "Indisponibilité", value: "Peu de cibles et trop de monde, impossible de jouer quand on veut" },
      { label: "Aucun événement possible", value: "Pas de privatisation, ni team-building, ni soirée de groupe" },
    ],
  },
  {
    tag: "Notre solution",
    title: "60 m² dédiés\naux fléchettes",
    subtitle: "Notre concept",
    columns: [
      { label: "Cibles pro", value: "Matériel dernier cri, scoring automatique précis et rapide" },
      { label: "Jeux dernière génération", value: "Des formats ludiques et compétitifs accessibles à tous" },
      { label: "Espace moderne", value: "Agencé pour bouger et jouer, ambiance immersive" },
      { label: "Sessions libres", value: "Réservation en ligne, horaires flexibles" },
      { label: "Privatisation", value: "Team building, soirées entre amis, événements sur mesure" },
    ],
  },
  {
    tag: "Le marché",
    title: "Une tendance en plein essor",
    press: [
      { quote: "Un véritable changement de dimension pour les fléchettes. Croissance à deux chiffres en France comme dans 90% des pays européens.", source: "Le Parisien / Décathlon", date: "Jan. 2026" },
      { quote: "Les ventes ont bondi de 44% puis 46% en Suisse. Les jeunes sont particulièrement conquis.", source: "24 Heures", date: "Jan. 2026" },
      { quote: "3,71 millions de téléspectateurs pour la finale — le plus fort pic d'audience hors football jamais enregistré sur Sky Sports.", source: "Eurosport", date: "Jan. 2026" },
    ],
  },
  {
    tag: "Partenariat",
    title: "Collaborons ensemble",
    offers: [
      {
        name: "Pack Premium",
        price: "CHF 5'000 / an",
        perks: [
          "Accès libre pour vos employés (selon disponibilité)",
          "Réservation prioritaire avant le public",
          "Privatisation du lieu sur demande (5x / an)",
        ],
      },
      {
        name: "Pack Flex",
        price: "Facturation à l'usage",
        perks: [
          "Vos employés viennent gratuitement, entrées refacturées",
          "Tarif réduit de 50% sur les privatisations",
          "Sans engagement",
        ],
      },
    ],
    highlight: "contact@lausanne-darts.ch",
  },
  {
    tag: "Contact",
    title: "Rejoignez la partie",
    contact: {
      address: "Rue St-Martin 9, 1003 Lausanne",
      email: "contact@lausanne-darts.ch",
      team: [
        { name: "Victor Salphati", desc: "EHL · Master HEC Finance", fun: "Vise la perfection, du bullseye au cocktail" },
        { name: "Jean-Christophe Cuypers", desc: "HEIG-VD · Master HEC Finance", fun: "Ajoute les fléchettes aux 3 disciplines de l'Ironman" },
        { name: "Vincent Porret", desc: "HEIG-VD · Master HEC Finance", fun: "Code le site entre deux triple 1" },
      ],
    },
  },
];

function colorLetterA(text: string) {
  return text.split("").map((char, i) =>
    char.toUpperCase() === "A" ? (
      <span key={i} className="dart-green">
        {char}
      </span>
    ) : (
      char
    )
  );
}

const DART_PALETTE = ["dart-cream", "dart-red", "dart-green", "dart-black"];

function colorDartLetters(text: string, startIndex = 0) {
  return text.split("").map((char, i) => {
    const cls = DART_PALETTE[(i + startIndex) % DART_PALETTE.length];
    return (
      <span key={i} className={cls}>
        {char}
      </span>
    );
  });
}

export default function PitchPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const total = SLIDES.length;

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const index = parseInt(hash, 10);
    if (!isNaN(index) && index >= 0 && index < total) {
      setCurrent(index);
    }
  }, [total]);

  const goTo = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (animating || index === current) return;
      if (index < 0 || index >= total) return;
      setDirection(dir ?? (index > current ? "next" : "prev"));
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
        window.history.replaceState(null, "", `#${index}`);
      }, 450);
    },
    [animating, current, total]
  );

  const next = useCallback(() => {
    if (current < total - 1) goTo(current + 1, "next");
  }, [current, total, goTo]);

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1, "prev");
  }, [current, goTo]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const slide = SLIDES[current];
  const iscover = current === 0;

  return (
    <main className="page">
      <ThreeBackground />

      <div className={`pitch-shell ${bebas.variable} ${outfit.variable}`}>
        {/* Progress bar */}
        <div className="pitch-progress">
          <div
            className="pitch-progress-fill"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>

        {/* Slide */}
        <div
          className={`pitch-slide ${animating ? `pitch-slide--exit-${direction}` : "pitch-slide--enter"} ${iscover ? "pitch-slide--cover-bg" : ""}`}
          key={current}
        >
          {iscover && <div className="pitch-glow" />}

          {slide.tag && <p className={`pitch-tag ${slide.tag === "Notre solution" ? "pitch-tag--green" : ""} ${slide.tag === "Le marché" || slide.tag === "Contact" || slide.tag === "Partenariat" ? "pitch-tag--amber" : ""}`}>{slide.tag}</p>}

          <h1
            className={`pitch-title ${iscover ? "pitch-title--cover" : "pitch-title--inner"}`}
            style={{ whiteSpace: "pre-line" }}
          >
            {iscover ? (
              <>
                <span className="logo-line">Lausanne</span>
                <span className="logo-line logo-line--darts">
                  Darts
                  <span className="logo-underline logo-underline--red" />
                  <span className="logo-underline logo-underline--green" />
                </span>
              </>
            ) : (
              slide.title
            )}
          </h1>

          {!iscover && <div className="pitch-title-line" />}

          {slide.subtitle && (
            <p className="pitch-subtitle">{slide.subtitle}</p>
          )}

          {iscover && (
            <p className="logo-tagline">Pile au centre</p>
          )}

          {slide.coverDate && (
            <div className="cover-cards">
              <div className="cover-card">
                <p className="cover-card-label">Opening</p>
                <p className="cover-card-value">1er août 2026</p>
              </div>
            </div>
          )}

          {slide.highlight && (
            <p className={`pitch-highlight ${iscover ? "pitch-highlight--cover" : ""}`}>
              {slide.highlight}
            </p>
          )}

          {slide.bullets && slide.bullets.length > 0 && !iscover && (
              <div className="pitch-card-grid">
                {slide.bullets.map((b, i) => {
                  const isNegative = slide.tag === "Le problème";
                  return (
                    <div key={i} className={`pitch-card-item ${isNegative ? "pitch-card-item--neg" : "pitch-card-item--pos"}`}>
                      {!isNegative && (
                        <span className="pitch-card-icon pitch-card-icon--pos">{"\u2713"}</span>
                      )}
                      {b.includes("\n") ? (
                        <div className="pitch-card-text">
                          <p>{b.split("\n")[0]}</p>
                          <p className="pitch-card-sub">{b.split("\n")[1]}</p>
                        </div>
                      ) : (
                        <p className="pitch-card-text">{b}</p>
                      )}
                    </div>
                  );
                })}
              </div>
          )}

          {slide.columns && (
            <div className={`pitch-columns ${slide.columns.length === 4 ? "pitch-columns--2x2" : ""}`}>
              {slide.columns.map((col, i) => {
                const isSolution = slide.tag === "Notre solution";
                const isProblem = slide.tag === "Le problème";
                return (
                  <article key={i} className={`pitch-col-card ${isSolution ? "pitch-col-card--green" : ""} ${isProblem ? "pitch-col-card--red" : ""}`}>
                    <p className={`pitch-col-label ${isSolution ? "pitch-col-label--green" : ""}`}>{col.label}</p>
                    <p className="pitch-col-value">{col.value}</p>
                  </article>
                );
              })}
            </div>
          )}

          {slide.press && (
            <div className="pitch-press">
              {slide.press.map((p, i) => (
                <blockquote key={i} className="pitch-press-card">
                  <p className="pitch-press-quote">&laquo; {p.quote} &raquo;</p>
                  <footer className="pitch-press-source">
                    <strong>{p.source}</strong> <span>{p.date}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          )}

          {slide.offers && (
            <div className="pitch-offers">
              {slide.offers.map((offer, i) => (
                <div key={i} className={`pitch-offer ${i === 0 ? "pitch-offer--premium" : ""}`}>
                  <p className="pitch-offer-name">{offer.name}</p>
                  <p className="pitch-offer-price">{offer.price}</p>
                  <ul className="pitch-offer-perks">
                    {offer.perks.map((perk, j) => (
                      <li key={j}><span className={`pitch-offer-check ${i === 0 ? "pitch-offer-check--premium" : ""}`}>{"\u2713"}</span>{perk}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {slide.highlight && !slide.contact && (
            <p className="pitch-highlight">{slide.highlight}</p>
          )}

          {slide.contact && (
            <>
              <p className="pitch-contact-info">
                {slide.contact.address}  ·  {slide.contact.email}
              </p>
              <div className="pitch-contact">
                {slide.contact.team && slide.contact.team.map((member, i) => (
                  <div key={i} className="cover-card pitch-team-card">
                    <p className="pitch-team-name">{member.name}</p>
                    {member.role && <p className="pitch-team-role">{member.role}</p>}
                    <p className="pitch-team-desc">{member.desc}</p>
                    <p className="pitch-team-fun">{member.fun}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="pitch-nav">
          <button
            className="pitch-nav-btn"
            onClick={prev}
            disabled={current === 0}
            aria-label="Slide précédente"
          >
            &larr;
          </button>

          <div className="pitch-counter">
            <span className="pitch-counter-current">{String(current + 1).padStart(2, "0")}</span>
            <span className="pitch-counter-sep" />
            <span className="pitch-counter-total">{String(total).padStart(2, "0")}</span>
          </div>

          <button
            className="pitch-nav-btn"
            onClick={next}
            disabled={current === total - 1}
            aria-label="Slide suivante"
          >
            &rarr;
          </button>
        </div>
      </div>

      <style jsx>{`
        .pitch-shell {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 3rem 2rem;
          font-family: var(--font-pitch), sans-serif;
        }

        .pitch-progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.03);
          z-index: 30;
        }

        .pitch-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--red), var(--amber));
          box-shadow: 0 0 12px var(--red-glow);
          transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pitch-slide {
          max-width: 960px;
          width: 100%;
          text-align: center;
          transition: opacity 450ms cubic-bezier(0.4, 0, 0.2, 1), transform 450ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pitch-slide--enter {
          opacity: 1;
          transform: translateY(0);
        }

        .pitch-slide--exit-next {
          opacity: 0;
          transform: translateX(-40px);
        }

        .pitch-slide--exit-prev {
          opacity: 0;
          transform: translateX(40px);
        }

        .pitch-slide--cover-bg {
          position: relative;
        }

        .pitch-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(230, 57, 70, 0.1) 0%, rgba(45, 139, 70, 0.05) 35%, transparent 65%);
          filter: blur(80px);
          pointer-events: none;
          z-index: -1;
        }

        .pitch-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.6rem 1.1rem;
          border: 1px solid rgba(230, 57, 70, 0.25);
          border-radius: 999px;
          background: rgba(230, 57, 70, 0.1);
          color: var(--red);
          font-family: var(--font-pitch);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 2rem;
          backdrop-filter: blur(8px);
        }

        .pitch-tag--amber {
          color: var(--amber);
          border-color: rgba(244, 160, 36, 0.25);
          background: rgba(244, 160, 36, 0.1);
        }

        .pitch-tag--green {
          color: #2D8B46;
          border-color: rgba(45, 139, 70, 0.25);
          background: rgba(45, 139, 70, 0.1);
        }

        .pitch-tag,
        .pitch-tag--green {
          font-size: 0.95rem;
          padding: 0.7rem 1.4rem;
        }

        .pitch-title {
          font-family: var(--font-heading);
          font-size: clamp(4rem, 9vw, 7.5rem);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-shadow: 0 0 60px rgba(255, 255, 255, 0.08);
        }

        .pitch-title--inner {
          padding-bottom: 0;
          margin-bottom: 0;
        }

        .pitch-title-line {
          width: 60px;
          height: 1px;
          margin: 1rem auto 0;
          background: linear-gradient(90deg, transparent, var(--border-strong), transparent);
        }

        .pitch-title--cover {
          font-size: clamp(5rem, 15vw, 12rem);
          line-height: 0.82;
          letter-spacing: -0.05em;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        :global(.logo-line) {
          display: block;
          line-height: 0.9;
          color: #F0E6D2;
        }

        :global(.logo-line--darts) {
          position: relative;
          padding-bottom: 0.2em;
        }

        :global(.logo-underline) {
          display: block;
          height: 3px;
          width: 100%;
          margin-top: 0.06em;
          border-radius: 2px;
          position: relative;
        }

        :global(.logo-underline)::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          background: inherit;
        }

        :global(.logo-underline--red) { background: #E63946; }
        :global(.logo-underline--green) { background: #2D8B46; margin-top: 0.04em; }

        .logo-tagline {
          margin-top: 1.4rem;
          font-family: var(--font-pitch);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.55em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding-left: 0.55em;
        }


        :global(.pitch-darts-block) {
          display: inline-flex;
          flex-direction: column;
          align-items: stretch;
          letter-spacing: normal;
        }

        :global(.pitch-darts-block > .accent) {
          letter-spacing: -0.05em;
        }

        :global(.pitch-subtitle-inline) {
          display: flex;
          justify-content: space-between;
          font-size: clamp(0.8rem, 2vw, 1.3rem);
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 0.15rem;
          padding: 0;
        }

        .pitch-subtitle {
          margin-top: 1rem;
          font-size: clamp(0.9rem, 1.5vw, 1.05rem);
          color: var(--text-muted);
          opacity: 0.55;
          font-style: italic;
          letter-spacing: 0.02em;
        }

        .pitch-highlight {
          margin-top: 2rem;
          font-family: var(--font-pitch);
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .cover-cards {
          display: flex;
          justify-content: center;
          gap: 1.25rem;
          margin-top: 2.5rem;
        }

        .cover-card {
          padding: 1.2rem 1.8rem;
          border: 1px solid var(--border);
          border-radius: 18px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 40%),
            var(--surface);
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
          text-align: center;
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms ease, box-shadow 300ms ease;
        }

        .cover-card:hover {
          transform: translateY(-3px);
          border-color: var(--border-strong);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        .cover-card-label {
          font-family: var(--font-pitch);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
        }

        .cover-card-value {
          font-family: var(--font-heading);
          font-size: clamp(1.5rem, 3.5vw, 2.2rem);
          font-weight: 400;
          color: var(--text);
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
        }

        .dart-target-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 0.85em;
          height: 0.85em;
        }

        .dart-target {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 8px rgba(45, 139, 70, 0.4));
        }

        .pitch-highlight--cover {
          margin-top: 1rem;
          font-size: clamp(1.1rem, 2.5vw, 1.6rem);
          color: var(--text-muted);
        }

        :global(.dart-green) {
          color: #2D8B46;
          text-shadow: 0 0 18px rgba(45, 139, 70, 0.4);
        }

        :global(.dart-red) {
          color: #E63946;
          text-shadow: 0 0 18px rgba(230, 57, 70, 0.45);
        }

        :global(.dart-cream) {
          color: #F0E6D2;
          text-shadow: 0 0 18px rgba(240, 230, 210, 0.3);
        }

        :global(.dart-black) {
          color: #1a1a1a;
          text-shadow: 0 0 2px rgba(255, 255, 255, 0.6), 0 0 14px rgba(0, 0, 0, 0.6);
        }

        :global(.dart-plain),
        :global(.dart-plain-fill) {
          color: #F0E6D2;
          -webkit-text-fill-color: #F0E6D2;
        }

        :global(.dart-arc) {
          background: radial-gradient(
            ellipse 200% 300% at 50% 300%,
            #F0E6D2 0%,
            #F0E6D2 78%,
            #E63946 78.5%,
            #E63946 82%,
            #F0E6D2 82.5%,
            #F0E6D2 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        :global(.dart-arc--darts) {
          background: radial-gradient(
            ellipse 200% 300% at 50% 300%,
            #F0E6D2 0%,
            #F0E6D2 78%,
            #2D8B46 78.5%,
            #2D8B46 82%,
            #F0E6D2 82.5%,
            #F0E6D2 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        :global(.dart-gradient),
        :global(.dart-gradient-alt) {
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        :global(.dart-gradient-alt) {
          background: radial-gradient(
            ellipse 300% 300% at 50% 310%,
            #F0E6D2 0%,
            #F0E6D2 78%,
            #E63946 78.5%,
            #E63946 82%,
            #F0E6D2 82.5%,
            #F0E6D2 90%,
            #2D8B46 90.5%,
            #2D8B46 94%,
            #F0E6D2 94.5%,
            #F0E6D2 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        :global(.dart-gradient) {
          background: radial-gradient(
            ellipse 400% 250% at 50% 250%,
            #F0E6D2 0%,
            #F0E6D2 78%,
            #E63946 79%,
            #E63946 82%,
            #F0E6D2 83%,
            #F0E6D2 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        .pitch-card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 2.5rem;
          max-width: 860px;
          margin-left: auto;
          margin-right: auto;
        }

        .pitch-card-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          padding: 1.4rem 1.3rem;
          border: 1px solid var(--border);
          border-radius: 18px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 40%),
            var(--surface);
          backdrop-filter: blur(16px);
          text-align: center;
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms ease, box-shadow 300ms ease;
        }

        .pitch-card-item--neg {
          background:
            linear-gradient(180deg, rgba(230, 57, 70, 0.06), transparent 40%),
            rgba(230, 57, 70, 0.04);
          border-color: rgba(230, 57, 70, 0.18);
        }

        .pitch-card-item--neg:hover {
          border-color: rgba(230, 57, 70, 0.35);
          box-shadow: 0 8px 32px rgba(230, 57, 70, 0.08);
        }

        .pitch-card-item--neg .pitch-card-text {
          color: rgba(255, 255, 255, 0.75);
        }

        .pitch-card-item:hover {
          transform: translateY(-3px);
          border-color: var(--border-strong);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        .pitch-card-icon {
          flex-shrink: 0;
          display: grid;
          place-items: center;
          width: 1.6rem;
          height: 1.6rem;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .pitch-card-icon--neg {
          background: rgba(230, 57, 70, 0.12);
          color: var(--red);
          border: 1px solid rgba(230, 57, 70, 0.2);
        }

        .pitch-card-icon--pos {
          background: rgba(45, 139, 70, 0.12);
          color: #2D8B46;
          border: 1px solid rgba(45, 139, 70, 0.2);
        }

        .pitch-card-text {
          font-size: clamp(0.88rem, 1.5vw, 0.98rem);
          line-height: 1.5;
          color: var(--text-muted);
        }

        .pitch-card-sub {
          margin-top: 0.3rem;
          font-size: 0.78rem;
          opacity: 0.55;
        }

        .pitch-bullets {
          list-style: none;
          margin-top: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: left;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .pitch-bullets li {
          position: relative;
          padding-left: 1.5rem;
          font-size: clamp(0.95rem, 1.8vw, 1.15rem);
          line-height: 1.55;
          color: var(--text-muted);
        }

        .pitch-bullets li::before {
          display: none;
        }

        .pitch-bullets--no-dots li {
          padding-left: 0;
          text-align: center;
        }

        .pitch-bullets--no-dots li:first-child {
          font-family: var(--font-pitch);
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .pitch-bullets--no-dots li::before {
          display: none;
        }

        .pitch-columns {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.1rem;
          margin-top: 2.5rem;
          text-align: left;
        }

        .pitch-col-card {
          flex: 0 1 calc(33.333% - 0.75rem);
          min-width: 200px;
          padding: 1.5rem;
          border: 1px solid var(--border);
          border-radius: 20px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 40%),
            var(--surface);
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms ease, box-shadow 300ms ease;
        }

        .pitch-col-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-strong);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
        }

        .pitch-columns--2x2 .pitch-col-card {
          flex: 0 1 calc(50% - 0.55rem);
        }

        .pitch-col-card--red {
          background:
            linear-gradient(180deg, rgba(230, 57, 70, 0.06), transparent 40%),
            rgba(230, 57, 70, 0.04);
          border-color: rgba(230, 57, 70, 0.18);
        }

        .pitch-col-card--red:hover {
          border-color: rgba(230, 57, 70, 0.4);
          box-shadow: 0 16px 48px rgba(230, 57, 70, 0.08);
        }

        .pitch-col-card--green {
          background:
            linear-gradient(180deg, rgba(45, 139, 70, 0.06), transparent 40%),
            rgba(45, 139, 70, 0.04);
          border-color: rgba(45, 139, 70, 0.18);
        }

        .pitch-col-card--green:hover {
          border-color: rgba(45, 139, 70, 0.4);
          box-shadow: 0 16px 48px rgba(45, 139, 70, 0.08);
        }

        .pitch-col-label {
          font-family: var(--font-pitch);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 0.6rem;
        }

        .pitch-col-label--green {
          color: #2D8B46;
        }

        .pitch-col-value {
          font-size: 0.93rem;
          line-height: 1.6;
          color: var(--text-muted);
        }

        .pitch-press {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          margin-top: 2.5rem;
          max-width: 780px;
          margin-left: auto;
          margin-right: auto;
        }

        .pitch-press-card {
          padding: 1.4rem 1.6rem;
          border: 1px solid var(--border);
          border-left: 3px solid var(--amber);
          border-radius: 18px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 40%),
            var(--surface);
          backdrop-filter: blur(16px);
          text-align: left;
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms ease, box-shadow 300ms ease;
        }

        .pitch-press-card:hover {
          transform: translateX(6px);
          border-color: var(--border-strong);
          border-left-color: var(--amber);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .pitch-press-quote {
          font-size: clamp(0.9rem, 1.5vw, 1.05rem);
          line-height: 1.6;
          color: var(--text);
          font-style: italic;
        }

        .pitch-press-source {
          margin-top: 0.7rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .pitch-press-source strong {
          color: var(--amber);
          font-weight: 700;
        }

        .pitch-press-source span {
          opacity: 0.5;
          margin-left: 0.4rem;
        }

        .pitch-offers {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-top: 2.5rem;
          max-width: 780px;
          margin-left: auto;
          margin-right: auto;
        }

        .pitch-offer {
          padding: 2rem 1.75rem;
          border: 1px solid var(--border);
          border-radius: 22px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 40%),
            var(--surface);
          backdrop-filter: blur(16px);
          text-align: left;
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms ease, box-shadow 300ms ease;
        }

        .pitch-offer:hover {
          transform: translateY(-4px);
          border-color: var(--border-strong);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
        }

        .pitch-offer--premium {
          border-color: rgba(244, 160, 36, 0.3);
          background:
            linear-gradient(180deg, rgba(244, 160, 36, 0.06), transparent 40%),
            rgba(244, 160, 36, 0.03);
          box-shadow: 0 4px 32px rgba(244, 160, 36, 0.06);
        }

        .pitch-offer--premium:hover {
          border-color: rgba(244, 160, 36, 0.5);
          box-shadow: 0 16px 48px rgba(244, 160, 36, 0.1);
        }

        .pitch-offer-name {
          font-family: var(--font-pitch);
          font-size: 1.05rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text);
        }

        .pitch-offer--premium .pitch-offer-name {
          color: var(--amber);
        }

        .pitch-offer-price {
          margin-top: 0.6rem;
          font-family: var(--font-pitch);
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .pitch-offer-perks {
          list-style: none;
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .pitch-offer-perks li {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-muted);
        }

        .pitch-offer-check {
          flex-shrink: 0;
          color: #2D8B46;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .pitch-offer-check--premium {
          color: var(--amber);
        }

        .pitch-contact {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.25rem;
          margin-top: 2.5rem;
        }

        .pitch-contact-info {
          margin-top: 1.5rem;
          font-size: 0.82rem;
          color: var(--text-muted);
          opacity: 0.5;
          letter-spacing: 0.02em;
        }

        .pitch-team-card {
          flex: 0 1 calc(33.333% - 0.85rem);
          min-width: 180px;
          text-align: center;
        }

        .pitch-team-name {
          font-family: var(--font-heading);
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          color: var(--text);
          letter-spacing: 0.02em;
        }

        .pitch-team-role {
          margin-top: 0.3rem;
          font-family: var(--font-pitch);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--amber);
        }

        .pitch-team-desc {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          line-height: 1.45;
          color: var(--text-muted);
        }

        .pitch-team-fun {
          margin-top: 0.5rem;
          font-size: 0.78rem;
          font-style: italic;
          color: var(--text-muted);
          opacity: 0.5;
        }

        .pitch-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 3.5rem;
        }

        .pitch-nav-btn {
          display: grid;
          place-items: center;
          width: 3rem;
          height: 3rem;
          border: 1px solid var(--border);
          border-radius: 50%;
          background: transparent;
          backdrop-filter: blur(8px);
          color: var(--text-muted);
          font-size: 1rem;
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pitch-nav-btn:hover:not(:disabled) {
          color: var(--text);
          border-color: var(--border-strong);
          background: rgba(255, 255, 255, 0.04);
        }

        .pitch-nav-btn:disabled {
          opacity: 0.15;
          cursor: default;
        }

        .pitch-counter {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-pitch);
          font-variant-numeric: tabular-nums;
        }

        .pitch-counter-current {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.05em;
        }

        .pitch-counter-sep {
          width: 24px;
          height: 1px;
          background: var(--border-strong);
        }

        .pitch-counter-total {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          opacity: 0.5;
          letter-spacing: 0.05em;
        }

        @media (max-width: 640px) {
          .pitch-shell {
            padding: 1.5rem 1rem;
          }

          .pitch-columns {
            flex-direction: column;
          }

          .pitch-col-card,
          .pitch-columns--2x2 .pitch-col-card {
            flex: 1 1 100%;
          }

          .pitch-offers {
            grid-template-columns: 1fr;
          }

          .pitch-card-grid {
            grid-template-columns: 1fr;
          }

          .pitch-hint {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

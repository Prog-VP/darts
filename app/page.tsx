"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import InviteForm from "./components/InviteForm";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type SectionId = "accueil" | "lieu" | "faq" | "contact";

const OPENING_DATE = "2026-08-01T00:00:00+02:00";
const EMPTY_COUNTDOWN: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

const ThreeBackground = dynamic(() => import("./ThreeBackground"), {
  ssr: false,
});

const SECTION_LINKS: Array<{ id: SectionId; label: string }> = [
  { id: "accueil", label: "Accueil" },
  { id: "lieu", label: "Le lieu" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

const FEATURE_CARDS = [
  {
    title: "Qualité de jeu",
    description: "Cibles en sisal, fléchettes en état, vraies conditions de jeu.",
  },
  {
    title: "Score auto",
    description: "Cibles connectées et stats.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Où ?",
    answer: "Rue St-Martin 9, 1003 Lausanne.",
  },
  {
    question: "Quand ?",
    answer: "Tous les jours, dès le 1er août 2026.",
  },
  {
    question: "Pour qui ?",
    answer: "Ouvert à tous, passionnés comme amateurs.",
  },
  {
    question: "À quelle occasion ?",
    answer:
      "Pour jouer, s’entraîner, préparer la compétition, un date, un anniversaire ou un team building.",
  },
  {
    question: "Comment réserver ?",
    answer: "La plateforme de réservation sera publiée bientôt.",
  },
] as const;

function getCountdown(target: string): Countdown {
  const total = Math.max(0, new Date(target).getTime() - Date.now());

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function formatUnit(value: number, minimumDigits = 2) {
  return value.toString().padStart(minimumDigits, "0");
}

export default function Home() {
  const [countdown, setCountdown] = useState<Countdown>(EMPTY_COUNTDOWN);
  const [countdownReady, setCountdownReady] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("accueil");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setCountdown(getCountdown(OPENING_DATE));
    setCountdownReady(true);

    const timer = window.setInterval(() => {
      setCountdown(getCountdown(OPENING_DATE));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const sections = SECTION_LINKS.map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (!visibleEntry) {
          return;
        }

        setActiveSection(visibleEntry.target.id as SectionId);
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="page">
      <ThreeBackground />

      <div className="page-shell">
        <header className="site-header">
          <a className="brand brand--logo" href="#accueil" aria-label="Aller à l’accueil">
            <span className="brand-badge">
              <span className="brand-badge-inner">LD</span>
            </span>
          </a>

          <nav className="site-nav" aria-label="Navigation principale">
            {SECTION_LINKS.map((section) => (
              <a
                key={section.id}
                className={`nav-link ${
                  activeSection === section.id ? "is-active" : ""
                }`}
                href={`#${section.id}`}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a className="nav-link header-jeu" href="/jeu">🎯 Jeu</a>
            <a className="header-cta" href="#contact">
              Être prévenu
            </a>
          </div>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
          >
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
          </button>
        </header>

        <div
          className={`drawer-backdrop ${menuOpen ? "is-open" : ""}`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        <aside
          id="mobile-drawer"
          className={`drawer ${menuOpen ? "is-open" : ""}`}
          aria-hidden={!menuOpen}
          aria-label="Menu de navigation"
        >
          <div className="drawer-header">
            <span className="brand-badge" aria-hidden="true">
              <span className="brand-badge-inner">LD</span>
            </span>
            <button
              type="button"
              className="drawer-close"
              onClick={closeMenu}
              aria-label="Fermer le menu"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <nav className="drawer-nav" aria-label="Navigation mobile">
            {SECTION_LINKS.map((section) => (
              <a
                key={section.id}
                className={`drawer-link ${
                  activeSection === section.id ? "is-active" : ""
                }`}
                href={`#${section.id}`}
                onClick={closeMenu}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="drawer-footer">
            <a
              href="/jeu"
              className="drawer-link drawer-link--jeu"
              onClick={closeMenu}
            >
              <span aria-hidden="true">🎯</span> Jeu
            </a>
            <a
              href="#contact"
              className="drawer-cta"
              onClick={closeMenu}
            >
              Être prévenu
            </a>
            <p className="drawer-meta">
              Opening · 1<sup>er</sup> août 2026
            </p>
          </div>
        </aside>

        <section id="accueil" className="section-block hero-section">
          <div className="hero-copy">
            <h1 className="hero-logo">
              <span className="hero-logo-line">Lausanne</span>
              <span className="hero-logo-line hero-logo-line--darts">
                Darts
                <span className="hero-logo-underline hero-logo-underline--red" />
                <span className="hero-logo-underline hero-logo-underline--green" />
              </span>
            </h1>

            <p className="hero-lead">
              60 m² dédiés aux fléchettes.
            </p>

            <p className="hero-support">
              {
                "Fini les setups de bar coincés entre la porte de sortie et le billard, avec des embouts cassés et des cibles mal entretenues."
              }
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#contact">
                Être prévenu
              </a>
              <a className="button button-secondary" href="#lieu">
                Voir le lieu
              </a>
            </div>
          </div>

          <div className="hero-panels">
            <article className="glass-card countdown-card">
              <p className="card-eyebrow">Temps avant le 1er août 2026</p>

              <div
                className="countdown"
                role="timer"
                aria-live={countdownReady ? "polite" : "off"}
              >
                <div className="count-item">
                  <strong>{countdownReady ? formatUnit(countdown.days) : "--"}</strong>
                  <span>jours</span>
                </div>
                <div className="count-item">
                  <strong>{countdownReady ? formatUnit(countdown.hours) : "--"}</strong>
                  <span>heures</span>
                </div>
                <div className="count-item">
                  <strong>{countdownReady ? formatUnit(countdown.minutes) : "--"}</strong>
                  <span>min</span>
                </div>
                <div className="count-item">
                  <strong>{countdownReady ? formatUnit(countdown.seconds) : "--"}</strong>
                  <span>sec</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="lieu" className="section-block">
          <div className="section-heading">
            <h2 className="section-title">Le lieu</h2>
            <p className="section-meta">Rue St-Martin 9, Lausanne.</p>
          </div>

          <div className="feature-grid">
            {FEATURE_CARDS.map((feature) => (
              <article key={feature.title} className="glass-card feature-card">
                <p className="feature-title">{feature.title}</p>
                <p className="feature-desc">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="section-block faq-section">
          <div className="section-heading">
            <h2 className="section-title">FAQ</h2>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="faq-item">
                <summary>
                  <span>{item.question}</span>
                  <span className="faq-icon" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contact" className="section-block contact-section">
          <div className="section-heading contact-heading">
            <h2 className="section-title">Être prévenu</h2>
          </div>

          <div className="contact-layout">
            <InviteForm />
          </div>
        </section>

        <footer className="footer">
          <p>© 2026 Lausanne Darts</p>
          <a href="#accueil">Retour en haut</a>
        </footer>
      </div>
    </main>
  );
}

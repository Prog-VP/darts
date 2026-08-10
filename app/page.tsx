"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import InviteForm from "./components/InviteForm";

type SectionId = "accueil" | "lieu" | "faq" | "contact";

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
    answer:
      "Pas encore de date d’ouverture. Le projet prend un peu plus de temps que prévu : on se retrouve cet automne pour la suite.",
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

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionId>("accueil");
  const [menuOpen, setMenuOpen] = useState(false);

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
            <p className="drawer-meta">Opening · à l’automne 2026</p>
          </div>
        </aside>

        <section id="accueil" className="section-block hero-section">
          <div className="hero-copy">
            <h1 className="hero-logo">
              <span className="hero-logo-line">
                {"L"}
                <span className="hero-a">
                  <span className="hero-a-base">A</span>
                  <span className="hero-a-drop" aria-hidden="true">A</span>
                </span>
                {"usanne"}
              </span>
              <span className="hero-logo-line hero-logo-line--darts">
                {"D"}
                <span className="hero-a hero-a--target">
                  <span className="hero-a-base">A</span>
                </span>
                {"rts"}
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
            <article className="glass-card status-card">
              <p className="card-eyebrow">Des nouvelles du chantier</p>

              <p className="status-headline">
                Pas encore de date d’ouverture
              </p>

              <p className="status-text">
                Le projet prend un peu plus de temps que prévu : rien à
                annoncer pour l’instant.
              </p>

              <p className="status-text">
                Profitez de l’été. On revient vers vous avec du concret à la
                rentrée.
              </p>

              <p className="status-badge">On se voit cet automne 🎯</p>
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

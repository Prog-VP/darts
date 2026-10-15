"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import InviteForm from "./components/InviteForm";

type SectionId = "accueil" | "services" | "faq" | "contact";

const ThreeBackground = dynamic(() => import("./ThreeBackground"), {
  ssr: false,
});

const SECTION_LINKS: Array<{ id: SectionId; label: string }> = [
  { id: "accueil", label: "Accueil" },
  { id: "services", label: "Services" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

const FEATURE_CARDS = [
  {
    title: "Location de matériel",
    description:
      "Cibles en sisal, fléchettes en état, scoring connecté : tout le nécessaire pour jouer dans de vraies conditions, chez vous ou à votre événement.",
  },
  {
    title: "Organisation de tournois",
    description:
      "Soirée entre amis, anniversaire, team building ou compétition : on monte le tournoi de A à Z.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Le lieu va-t-il ouvrir ?",
    answer:
      "Pas pour l’instant. Nous n’avons pas trouvé de local à un prix raisonnable, avec un statut d’établissement commercial (nécessaire pour vendre de l’alcool) et sans devoir racheter un fonds de commerce.",
  },
  {
    question: "Que proposez-vous ?",
    answer:
      "La location de matériel de fléchettes et l’organisation de tournois, à Lausanne et dans la région.",
  },
  {
    question: "Pour qui ?",
    answer: "Particuliers, associations, entreprises : passionnés comme amateurs.",
  },
  {
    question: "Pour quelle occasion ?",
    answer:
      "Un anniversaire, une soirée, un team building, une fête de quartier ou une compétition.",
  },
  {
    question: "Comment nous contacter ?",
    answer:
      "Laissez vos coordonnées dans le formulaire ou écrivez à contact@lausanne-darts.ch.",
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
            <a className="header-cta" href="#contact">
              Nous contacter
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
              href="#contact"
              className="drawer-cta"
              onClick={closeMenu}
            >
              Nous contacter
            </a>
            <p className="drawer-meta">Location · Tournois</p>
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
              Location de matériel et tournois de fléchettes.
            </p>

            <p className="hero-support">
              {
                "Des cibles en sisal, des fléchettes en état et un tournoi clé en main pour votre soirée, votre anniversaire ou votre team building."
              }
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#contact">
                Nous contacter
              </a>
              <a className="button button-secondary" href="#services">
                Nos services
              </a>
            </div>
          </div>

          <div className="hero-panels">
            <article className="glass-card status-card">
              <p className="card-eyebrow">Des nouvelles du projet</p>

              <p className="status-headline">
                Pas de local pour l’instant
              </p>

              <p className="status-text">
                À deux reprises, nous avons failli décrocher un bon spot.
                Malheureusement, nous n’avons pas trouvé de local qui coche
                toutes les cases : au centre-ville ou pas loin, un loyer raisonnable, un statut
                d’établissement commercial pour avoir le droit de vendre de
                l’alcool, et sans racheter un fonds de commerce.
              </p>

              <p className="status-text">
                L’aventure continue autrement : nous restons disponibles pour
                la location de matériel et l’organisation de tournois.
              </p>

              <p className="status-badge">Merci pour votre soutien, et peut-être à bientôt 🎯</p>
            </article>
          </div>
        </section>

        <section id="services" className="section-block">
          <div className="section-heading">
            <h2 className="section-title">Nos services</h2>
            <p className="section-meta">Lausanne et région.</p>
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
            <h2 className="section-title">Nous contacter</h2>
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

"use client";

import { useEffect, useRef, useState } from "react";
import InviteForm from "./components/InviteForm";

type Countdown = { days: number; hours: number; minutes: number; seconds: number };
type SectionId = "accueil" | "lieu" | "faq" | "contact";

const FRAME_COUNT = 120;
const FRAME_W = 1280;
const FRAME_H = 688;
const OPENING_DATE = "2026-08-01T00:00:00+02:00";
const EMPTY_COUNTDOWN: Countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };

const SECTION_LINKS: Array<{ id: SectionId; label: string }> = [
  { id: "accueil", label: "Accueil" },
  { id: "lieu", label: "Le lieu" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

const FEATURE_CARDS = [
  { title: "Qualité de jeu", description: "Cibles en sisal, fléchettes en état, vraies conditions de jeu." },
  { title: "Score auto", description: "Cibles connectées et stats." },
];

const FAQ_ITEMS = [
  { question: "Où ?", answer: "Rue St-Martin 9, 1003 Lausanne." },
  { question: "Quand ?", answer: "Tous les jours, dès le 1er août 2026." },
  { question: "Pour qui ?", answer: "Ouvert à tous, passionnés comme amateurs." },
  {
    question: "À quelle occasion ?",
    answer:
      "Pour jouer, s’entraîner, préparer la compétition, un date, un anniversaire ou un team building.",
  },
  { question: "Comment réserver ?", answer: "La plateforme de réservation sera publiée bientôt." },
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

function formatUnit(value: number) {
  return value.toString().padStart(2, "0");
}

export default function RevealPage() {
  const heroRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backdropCanvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const targetProgressRef = useRef(0);
  const renderedProgressRef = useRef(0);
  const lastFrameDrawnRef = useRef(-1);

  const [loadedPct, setLoadedPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>(EMPTY_COUNTDOWN);
  const [countdownReady, setCountdownReady] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("accueil");
  const [menuOpen, setMenuOpen] = useState(false);

  // Countdown
  useEffect(() => {
    setCountdown(getCountdown(OPENING_DATE));
    setCountdownReady(true);
    const id = window.setInterval(() => setCountdown(getCountdown(OPENING_DATE)), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Active section observer
  useEffect(() => {
    const sections = SECTION_LINKS.map(({ id }) => document.getElementById(id)).filter(
      (s): s is HTMLElement => s !== null
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const v = entries.find((e) => e.isIntersecting);
        if (v) setActiveSection(v.target.id as SectionId);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Preload frames
  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = [];
    let loaded = 0;
    const prioritize = (n: number) => Math.min(FRAME_COUNT, Math.max(1, n));
    const order: number[] = [];
    // Load key anchors first, then fill in
    order.push(1, FRAME_COUNT, Math.floor(FRAME_COUNT / 2));
    for (let i = 1; i <= FRAME_COUNT; i++) {
      if (!order.includes(i)) order.push(i);
    }

    order.forEach((i) => {
      const idx = prioritize(i) - 1;
      const img = new Image();
      img.src = `/reveal/frames/${String(i).padStart(3, "0")}.webp`;
      img.onload = () => {
        loaded++;
        if (!cancelled) {
          setLoadedPct(Math.round((loaded / FRAME_COUNT) * 100));
          if (loaded === FRAME_COUNT) setReady(true);
        }
      };
      imgs[idx] = img;
    });
    framesRef.current = imgs;
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll → progress + rAF draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const backdrop = backdropCanvasRef.current;
    const hero = heroRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !backdrop || !hero || !sticky) return;
    const ctx = canvas.getContext("2d");
    const bctx = backdrop.getContext("2d");
    if (!ctx || !bctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Backdrop runs at low resolution on purpose — it'll be blurred heavily via CSS.
      const bw = backdrop.clientWidth;
      const bh = backdrop.clientHeight;
      const bdpr = 0.25; // 1/4 resolution is plenty once blurred
      backdrop.width = Math.max(1, Math.round(bw * bdpr));
      backdrop.height = Math.max(1, Math.round(bh * bdpr));
      bctx.setTransform(bdpr, 0, 0, bdpr, 0, 0);
      lastFrameDrawnRef.current = -1;
    };
    resize();
    window.addEventListener("resize", resize);

    const updateProgress = () => {
      const rect = hero.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        targetProgressRef.current = 0;
        return;
      }
      const raw = -rect.top / scrollable;
      targetProgressRef.current = Math.max(0, Math.min(1, raw));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });

    let raf = 0;
    const tick = () => {
      const target = targetProgressRef.current;
      const current = renderedProgressRef.current;
      const diff = target - current;
      renderedProgressRef.current =
        Math.abs(diff) < 0.0005 ? target : current + diff * 0.12;

      const p = renderedProgressRef.current;
      sticky.style.setProperty("--p", p.toFixed(4));

      const frameIdx = Math.max(
        0,
        Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)))
      );
      if (frameIdx !== lastFrameDrawnRef.current) {
        const img = framesRef.current[frameIdx];
        if (img && img.complete && img.naturalWidth > 0) {
          const cw = canvas.clientWidth;
          const ch = canvas.clientHeight;
          const iar = FRAME_W / FRAME_H;
          const car = cw / ch;
          let dw: number;
          let dh: number;
          let dx: number;
          let dy: number;
          if (car > iar) {
            dw = cw;
            dh = cw / iar;
            dx = 0;
            dy = (ch - dh) / 2;
          } else {
            dh = ch;
            dw = ch * iar;
            dx = (cw - dw) / 2;
            dy = 0;
          }
          ctx.clearRect(0, 0, cw, ch);
          ctx.drawImage(img, dx, dy, dw, dh);

          // Backdrop: draw the same frame stretched to fill backdrop canvas.
          // CSS blur + scale on the element turns this into ambient glow.
          const bw = backdrop.clientWidth;
          const bh = backdrop.clientHeight;
          bctx.clearRect(0, 0, bw, bh);
          // cover-fit onto backdrop as well so colors match what's on screen
          const bcar = bw / bh;
          let bdw: number;
          let bdh: number;
          let bdx: number;
          let bdy: number;
          if (bcar > iar) {
            bdw = bw;
            bdh = bw / iar;
            bdx = 0;
            bdy = (bh - bdh) / 2;
          } else {
            bdh = bh;
            bdw = bh * iar;
            bdx = (bw - bdw) / 2;
            bdy = 0;
          }
          bctx.drawImage(img, bdx, bdy, bdw, bdh);

          // Sample edge pixels from the just-drawn backdrop to drive the page background.
          try {
            const bpw = backdrop.width;
            const bph = backdrop.height;
            if (bpw > 2 && bph > 2) {
              const pts: Array<[number, number]> = [
                [0, 0],
                [bpw - 1, 0],
                [0, bph - 1],
                [bpw - 1, bph - 1],
                [Math.floor(bpw / 2), 0],
                [Math.floor(bpw / 2), bph - 1],
                [0, Math.floor(bph / 2)],
                [bpw - 1, Math.floor(bph / 2)],
              ];
              const data = bctx.getImageData(0, 0, bpw, bph).data;
              let r = 0;
              let g = 0;
              let b = 0;
              for (const [x, y] of pts) {
                const i = (y * bpw + x) * 4;
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
              }
              r = Math.round(r / pts.length);
              g = Math.round(g / pts.length);
              b = Math.round(b / pts.length);
              sticky.style.setProperty("--edge", `rgb(${r}, ${g}, ${b})`);
            }
          } catch {
            // ignore — cross-origin or other edge cases
          }

          lastFrameDrawnRef.current = frameIdx;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="page reveal-page">
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
                className={`nav-link ${activeSection === section.id ? "is-active" : ""}`}
                href={`#${section.id}`}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a className="nav-link header-jeu" href="/jeu">🎯 Jeu</a>
            <a className="header-cta" href="#contact">Être prévenu</a>
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
                className={`drawer-link ${activeSection === section.id ? "is-active" : ""}`}
                href={`#${section.id}`}
                onClick={closeMenu}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="drawer-footer">
            <a href="/jeu" className="drawer-link drawer-link--jeu" onClick={closeMenu}>
              <span aria-hidden="true">🎯</span> Jeu
            </a>
            <a href="#contact" className="drawer-cta" onClick={closeMenu}>
              Être prévenu
            </a>
            <p className="drawer-meta">
              Opening · 1<sup>er</sup> août 2026
            </p>
          </div>
        </aside>

        <section
          id="accueil"
          ref={heroRef}
          className="reveal-hero"
          aria-label="Présentation Lausanne Darts"
        >
          <div ref={stickyRef} className="reveal-sticky">
            <canvas ref={backdropCanvasRef} className="reveal-backdrop" aria-hidden="true" />
            <canvas ref={canvasRef} className="reveal-canvas" />
            <div className="reveal-vignette" aria-hidden="true" />

            <div className="reveal-overlay">
              <div className="reveal-frame-overlay">
                <p className="reveal-eyebrow" aria-hidden="true">
                  <span>Lausanne Darts</span>
                  <span className="reveal-eyebrow-dot">·</span>
                  <span>Ouverture 01.08.2026</span>
                </p>

                <div className="reveal-title-final">
                  <h1 className="reveal-title-slogan">
                    <span className="reveal-title-line">Lausanne</span>
                    <span className="reveal-title-line reveal-title-line--accent">Darts</span>
                  </h1>
                  <p className="reveal-title-tagline">Pile au centre.</p>
                </div>

                <div className="reveal-outro-actions">
                  <a className="button button-primary" href="#contact">Être prévenu</a>
                  <a className="button button-secondary" href="#lieu">Voir le lieu</a>
                </div>
              </div>

              {!ready && (
                <div className="reveal-loader" role="status" aria-live="polite">
                  <span className="reveal-loader-bar" style={{ width: `${loadedPct}%` }} />
                  <span className="reveal-loader-label">{loadedPct}%</span>
                </div>
              )}

              <div className="reveal-scroll-hint" aria-hidden="true">
                <span>Scroll</span>
                <span className="reveal-scroll-arrow" />
              </div>
            </div>
          </div>
        </section>

        <section className="section-block reveal-countdown-section">
          <article className="glass-card countdown-card reveal-countdown-card">
            <p className="card-eyebrow">Temps avant le 1er août 2026</p>
            <div className="countdown" role="timer" aria-live={countdownReady ? "polite" : "off"}>
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
                  <span className="faq-icon" aria-hidden="true">+</span>
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

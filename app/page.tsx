"use client";

import { useEffect, useMemo, useState } from "react";
import InviteForm from "./components/InviteForm";
import ThreeBackground from "./ThreeBackground";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const OPENING_DATE = "2026-08-01T00:00:00+02:00";

function getCountdown(target: string): Countdown {
  const total = Math.max(0, new Date(target).getTime() - Date.now());

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function Home() {
  const target = useMemo(() => OPENING_DATE, []);
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(target));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <main className="page">
      <ThreeBackground />
      <div className="ambient ambient-1" aria-hidden="true" />
      <div className="ambient ambient-2" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      <section className="hero container">
        <div className="dart-trail" aria-hidden="true" />
        <p className="eyebrow">Lausanne-Darts.ch</p>
        <h1>Ouverture le 1er août 2026</h1>
        <p className="subtitle">
          Le nouveau spot fléchettes premium <span className="no-wrap">à Lausanne.</span>{" "}
          Plus d&apos;infos à suivre.
        </p>

        <div className="countdown" role="timer" aria-live="polite">
          <div className="count-item">
            <strong>{countdown.days}</strong>
            <span>jours</span>
          </div>
          <div className="count-item">
            <strong>{countdown.hours}</strong>
            <span>heures</span>
          </div>
          <div className="count-item">
            <strong>{countdown.minutes}</strong>
            <span>minutes</span>
          </div>
          <div className="count-item">
            <strong>{countdown.seconds}</strong>
            <span>secondes</span>
          </div>
        </div>

        <div
          className="badges"
          role="list"
          aria-label="Informations clés"
          id="infos"
        >
          <span role="listitem">Ouverture publique</span>
          <span role="listitem">Lausanne, Suisse</span>
          <span role="listitem">1er août 2026</span>
        </div>

        <InviteForm />
      </section>
    </main>
  );
}

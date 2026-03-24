export default function Home() {
  return (
    <main className="page">
      <div className="noise" aria-hidden="true" />
      <section className="hero container">
        <p className="eyebrow">Lausanne-Darts.ch</p>
        <h1>Coming&nbsp;01.08.2026</h1>
        <p className="subtitle">Salon de fléchettes premium</p>
        <p className="description">
          Un nouveau spot élégant et immersif à Lausanne: pistes calibrées,
          design contemporain, ambiance feutrée et expérience darts nouvelle
          génération.
        </p>

        <div className="badges" role="list" aria-label="Informations clés">
          <span role="listitem">Dark · Premium · Moderne</span>
          <span role="listitem">Lausanne, Suisse</span>
          <span role="listitem">Inscriptions bientôt</span>
        </div>
      </section>
    </main>
  );
}

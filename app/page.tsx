export default function Home() {
  return (
    <main className="page">
      <div className="noise" aria-hidden="true" />
      <section className="hero container">
        <p className="eyebrow">Lausanne-Darts.ch</p>
        <h1>Coming&nbsp;01.08.2026</h1>
        <p className="subtitle">Salon de fléchettes à Lausanne</p>
        <p className="description">
          Ouverture prévue le 01.08.2026. Un lieu dédié aux cibles de
          fléchettes, avec espace de jeu et accueil sur place.
        </p>

        <div className="badges" role="list" aria-label="Informations clés">
          <span role="listitem">Ouverture 01.08.2026</span>
          <span role="listitem">Lausanne, Suisse</span>
          <span role="listitem">Inscriptions bientôt</span>
        </div>
      </section>
    </main>
  );
}

import puppeteer from "puppeteer";

async function exportBrochure() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page {
    size: A4 landscape;
    margin: 0;
  }

  body {
    font-family: 'Outfit', sans-serif;
    background: #0a0a0a;
    color: #f5f5f0;
    -webkit-font-smoothing: antialiased;
  }

  .slide {
    width: 297mm;
    height: 210mm;
    page-break-after: always;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 60px;
    overflow: hidden;
  }

  .slide > * { position: relative; z-index: 1; }

  .tag {
    display: inline-block;
    padding: 8px 20px;
    border: 1px solid rgba(230, 57, 70, 0.25);
    border-radius: 999px;
    background: rgba(230, 57, 70, 0.1);
    color: #e63946;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .tag--green {
    color: #2D8B46;
    border-color: rgba(45,139,70,0.25);
    background: rgba(45,139,70,0.1);
  }

  .tag--amber {
    color: #f4a024;
    border-color: rgba(244,160,36,0.25);
    background: rgba(244,160,36,0.1);
  }

  h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 96px;
    font-weight: 400;
    line-height: 0.95;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-align: center;
  }

  h1.cover-title {
    font-size: 120px;
    line-height: 0.88;
    letter-spacing: -0.02em;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .logo-line { display: block; line-height: 0.9; color: #F0E6D2; }
  .logo-line--darts { padding-bottom: 0.2em; }
  .logo-underline { display: block; height: 3px; width: 100%; margin-top: 0.06em; border-radius: 2px; position: relative; }
  .logo-underline::after { content: ""; position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; border-radius: 50%; transform: translate(-50%, -50%); background: inherit; }
  .logo-underline--red { background: #E63946; }
  .logo-underline--green { background: #2D8B46; margin-top: 0.04em; }
  .logo-tagline {
    margin-top: 18px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.55em;
    text-transform: uppercase;
    color: #9a9a9a;
    padding-left: 0.55em;
  }

  .dart-arc {
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

  .dart-arc--darts {
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

  .green { color: #2D8B46; }
  .red { color: #e63946; }
  .amber { color: #f4a024; }
  .muted { color: #9a9a9a; }

  .subtitle {
    margin-top: 10px;
    font-size: 14px;
    color: #9a9a9a;
    font-style: italic;
    opacity: 0.6;
  }

  .title-line {
    width: 60px;
    height: 1px;
    margin: 16px auto 0;
    background: rgba(255,255,255,0.14);
  }

  .cover-tagline {
    margin-top: 16px;
    font-family: 'Outfit', sans-serif;
    font-size: 22px;
    font-weight: 500;
    color: #9a9a9a;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .cover-card {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 18px 36px;
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 16px;
    background: #141414;
    margin-top: 32px;
  }

  .cover-address {
    margin-top: 18px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9a9a9a;
  }

  .cover-card-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9a9a9a;
    margin-bottom: 4px;
  }

  .cover-card-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 0.02em;
  }

  /* Cards grid */
  .cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    margin-top: 28px;
    width: 100%;
    max-width: 820px;
  }

  .card {
    flex: 0 1 calc(50% - 7px);
    padding: 18px 20px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    background: #111111;
    text-align: left;
  }

  .card--red {
    background: rgba(230,57,70,0.06);
    border-color: rgba(230,57,70,0.18);
  }

  .card--green {
    background: rgba(45,139,70,0.06);
    border-color: rgba(45,139,70,0.18);
  }

  .card--3col { flex: 0 1 calc(33.333% - 10px); }

  .card-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #e63946;
    margin-bottom: 6px;
  }

  .card-label--green { color: #2D8B46; }

  .card-value {
    font-size: 13px;
    line-height: 1.5;
    color: #9a9a9a;
  }

  /* Press */
  .press {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 28px;
    width: 100%;
    max-width: 720px;
  }

  .press-card {
    padding: 16px 20px;
    border: 1px solid rgba(255,255,255,0.08);
    border-left: 3px solid #f4a024;
    border-radius: 14px;
    background: rgba(17,17,17,0.78);
    text-align: left;
  }

  .press-quote {
    font-size: 13px;
    line-height: 1.55;
    font-style: italic;
  }

  .press-source {
    margin-top: 6px;
    font-size: 11px;
    color: #9a9a9a;
  }

  .press-source strong { color: #f4a024; }
  .press-source span { opacity: 0.5; margin-left: 4px; }

  /* Offers */
  .offers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-top: 28px;
    width: 100%;
    max-width: 720px;
  }

  .offer {
    padding: 22px 20px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    background: #111111;
    text-align: left;
  }

  .offer--premium {
    border-color: rgba(244,160,36,0.3);
    background: rgba(244,160,36,0.06);
  }

  .offer-name {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .offer--premium .offer-name { color: #f4a024; }

  .offer-price {
    margin-top: 6px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
  }

  .offer-perks {
    list-style: none;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .offer-perks li {
    font-size: 12px;
    line-height: 1.45;
    color: #9a9a9a;
  }

  .offer-perks li::before {
    content: "✓ ";
    color: #2D8B46;
  }

  .offer--premium .offer-perks li::before { color: #f4a024; }

  /* Contact */
  .team-grid {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 28px;
  }

  .team-card {
    flex: 0 1 220px;
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    background: #111111;
    text-align: center;
  }

  .team-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
  }

  .team-role {
    margin-top: 4px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #f4a024;
  }

  .team-desc {
    margin-top: 6px;
    font-size: 12px;
    color: #9a9a9a;
    line-height: 1.4;
  }

  .team-fun {
    margin-top: 6px;
    font-size: 11px;
    font-style: italic;
    color: #9a9a9a;
    opacity: 0.5;
  }

  .contact-info {
    margin-top: 20px;
    font-size: 14px;
    color: #f5f5f0;
    letter-spacing: 0.05em;
  }

  .page-num {
    position: absolute;
    bottom: 20px;
    right: 30px;
    font-size: 10px;
    color: #9a9a9a;
    opacity: 0.3;
    letter-spacing: 0.1em;
  }
</style>
</head>
<body>

<!-- SLIDE 1: COVER -->
<div class="slide">
  <h1 class="cover-title">
    <span class="logo-line">Lausanne</span>
    <span class="logo-line logo-line--darts">
      Darts
      <span class="logo-underline logo-underline--red"></span>
      <span class="logo-underline logo-underline--green"></span>
    </span>
  </h1>
  <p class="logo-tagline">Pile au centre</p>
  <div class="cover-card">
    <span class="cover-card-label">Opening</span>
    <span class="cover-card-value">1er août 2026</span>
  </div>
  <p class="cover-address">Rue St-Martin 9, Lausanne</p>
</div>

<!-- SLIDE 2: LE PROBLÈME -->
<div class="slide">
  <div class="tag">Le problème</div>
  <h1>Aucun lieu dédié<br/>aux fléchettes</h1>
  <div class="title-line"></div>
  <p class="subtitle">Le constat à Lausanne :</p>
  <div class="cards">
    <div class="card card--red">
      <p class="card-label">Espace inadapté</p>
      <p class="card-value">Des cibles de bar coincées entre la porte et le billard</p>
    </div>
    <div class="card card--red">
      <p class="card-label">Mauvais matériel</p>
      <p class="card-value">Mal entretenu, pointes cassées, cibles usées</p>
    </div>
    <div class="card card--red">
      <p class="card-label">Indisponibilité</p>
      <p class="card-value">Peu de cibles et trop de monde, impossible de jouer quand on veut</p>
    </div>
    <div class="card card--red">
      <p class="card-label">Aucun événement possible</p>
      <p class="card-value">Pas de privatisation, ni team-building, ni soirée de groupe</p>
    </div>
  </div>
  <span class="page-num">02</span>
</div>

<!-- SLIDE 3: NOTRE SOLUTION -->
<div class="slide">
  <div class="tag tag--green">Notre solution</div>
  <h1>60 m² dédiés<br/>aux fléchettes</h1>
  <div class="title-line"></div>
  <p class="subtitle">Notre concept</p>
  <div class="cards">
    <div class="card card--green card--3col">
      <p class="card-label card-label--green">Cibles pro</p>
      <p class="card-value">Matériel dernier cri, scoring automatique précis et rapide</p>
    </div>
    <div class="card card--green card--3col">
      <p class="card-label card-label--green">Jeux dernière génération</p>
      <p class="card-value">Des formats ludiques et compétitifs accessibles à tous</p>
    </div>
    <div class="card card--green card--3col">
      <p class="card-label card-label--green">Espace moderne</p>
      <p class="card-value">Agencé pour bouger et jouer, ambiance immersive</p>
    </div>
    <div class="card card--green">
      <p class="card-label card-label--green">Sessions libres</p>
      <p class="card-value">Réservation en ligne, horaires flexibles</p>
    </div>
    <div class="card card--green">
      <p class="card-label card-label--green">Privatisation</p>
      <p class="card-value">Team building, soirées entre amis, événements sur mesure</p>
    </div>
  </div>
  <span class="page-num">03</span>
</div>

<!-- SLIDE 4: LE MARCHÉ -->
<div class="slide">
  <div class="tag tag--amber">Le marché</div>
  <h1>Une tendance<br/>en plein essor</h1>
  <div class="title-line"></div>
  <div class="press">
    <div class="press-card">
      <p class="press-quote">« Un véritable changement de dimension pour les fléchettes. Croissance à deux chiffres en France comme dans 90% des pays européens. »</p>
      <p class="press-source"><strong>Le Parisien / Décathlon</strong> <span>Jan. 2026</span></p>
    </div>
    <div class="press-card">
      <p class="press-quote">« Les ventes ont bondi de 44% puis 46% en Suisse. Les jeunes sont particulièrement conquis. »</p>
      <p class="press-source"><strong>24 Heures</strong> <span>Jan. 2026</span></p>
    </div>
    <div class="press-card">
      <p class="press-quote">« 3,71 millions de téléspectateurs pour la finale — le plus fort pic d'audience hors football jamais enregistré sur Sky Sports. »</p>
      <p class="press-source"><strong>Eurosport</strong> <span>Jan. 2026</span></p>
    </div>
  </div>
  <span class="page-num">04</span>
</div>

<!-- SLIDE 5: PARTENARIAT -->
<div class="slide">
  <div class="tag tag--amber">Partenariat</div>
  <h1>Collaborons<br/>ensemble</h1>
  <div class="title-line"></div>
  <div class="offers">
    <div class="offer offer--premium">
      <p class="offer-name">Pack Premium</p>
      <ul class="offer-perks">
        <li>Accès libre pour vos employés (selon disponibilité)</li>
        <li>Réservation prioritaire avant le public</li>
        <li>Privatisation du lieu sur demande (5x / an)</li>
      </ul>
    </div>
    <div class="offer">
      <p class="offer-name">Pack Flex</p>
      <ul class="offer-perks">
        <li>Vos employés viennent gratuitement, entrées refacturées</li>
        <li>Tarif réduit de 50% sur les privatisations</li>
        <li>Sans engagement</li>
      </ul>
    </div>
  </div>
  <p style="margin-top:20px;font-size:13px;color:#9a9a9a;">contact@lausanne-darts.ch</p>
  <span class="page-num">05</span>
</div>

<!-- SLIDE 6: CONTACT -->
<div class="slide">
  <div class="tag tag--amber">Contact</div>
  <h1>Rejoignez la partie</h1>
  <div class="title-line"></div>
  <p class="contact-info">Rue St-Martin 9, 1003 Lausanne  ·  contact@lausanne-darts.ch</p>
  <div class="team-grid">
    <div class="team-card">
      <p class="team-name">Victor Salphati</p>
      <p class="team-desc">EHL · Master HEC Finance</p>
      <p class="team-fun">Vise la perfection, du bullseye au cocktail</p>
    </div>
    <div class="team-card">
      <p class="team-name">Jean-Christophe Cuypers</p>
      <p class="team-desc">HEIG-VD · Master HEC Finance</p>
      <p class="team-fun">Ajoute les fléchettes aux 3 disciplines de l'Ironman</p>
    </div>
    <div class="team-card">
      <p class="team-name">Vincent Porret</p>
      <p class="team-desc">HEIG-VD · Master HEC Finance</p>
      <p class="team-fun">Code le site entre deux triple 1</p>
    </div>
  </div>
  <span class="page-num">06</span>
</div>

</body>
</html>`;

  await page.setContent(html, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));

  await page.pdf({
    path: "pitch-lausanne-darts.pdf",
    width: "297mm",
    height: "210mm",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log("✓ Brochure exported: pitch-lausanne-darts.pdf");
}

exportBrochure().catch(console.error);

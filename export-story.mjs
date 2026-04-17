import puppeteer from "puppeteer";

async function exportStory() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 2 });

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    width: 1080px;
    height: 1920px;
    background: #0a0a0a;
    color: #F0E6D2;
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  .stage {
    position: relative;
    width: 1080px;
    height: 1920px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120px 80px;
  }

  .glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1100px;
    height: 1100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(230, 57, 70, 0.12) 0%, rgba(45, 139, 70, 0.06) 35%, transparent 65%);
    filter: blur(100px);
    pointer-events: none;
  }

  .tag {
    position: relative;
    z-index: 1;
    padding: 14px 28px;
    border: 1px solid rgba(244, 160, 36, 0.3);
    border-radius: 999px;
    background: rgba(244, 160, 36, 0.1);
    color: #f4a024;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }

  .logo {
    position: relative;
    z-index: 1;
    margin-top: 60px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 260px;
    line-height: 0.82;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .logo-line { display: block; line-height: 0.9; color: #F0E6D2; }
  .logo-line--darts { position: relative; padding-bottom: 0.2em; }
  .logo-underline {
    display: block;
    height: 7px;
    width: 100%;
    margin-top: 0.06em;
    border-radius: 3px;
    position: relative;
  }
  .logo-underline::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: inherit;
  }
  .logo-underline--red { background: #E63946; }
  .logo-underline--green { background: #2D8B46; margin-top: 0.035em; }

  .tagline {
    position: relative;
    z-index: 1;
    margin-top: 36px;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.55em;
    text-transform: uppercase;
    color: #9a9a9a;
    padding-left: 0.55em;
  }

  .divider {
    position: relative;
    z-index: 1;
    width: 90px;
    height: 1px;
    margin: 90px auto 70px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }

  .opening-card {
    position: relative;
    z-index: 1;
    padding: 42px 70px;
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 28px;
    background: rgba(17,17,17,0.6);
    text-align: center;
    backdrop-filter: blur(16px);
  }

  .opening-label {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: #9a9a9a;
    margin-bottom: 18px;
  }

  .opening-date {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 88px;
    letter-spacing: 0.02em;
    color: #F0E6D2;
    line-height: 1;
  }

  .address {
    position: relative;
    z-index: 1;
    margin-top: 70px;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9a9a9a;
  }

  .footer {
    position: absolute;
    bottom: 90px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 1;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #6a6a6a;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="glow"></div>

    <div class="tag">Save the date</div>

    <h1 class="logo">
      <span class="logo-line">Lausanne</span>
      <span class="logo-line logo-line--darts">
        Darts
        <span class="logo-underline logo-underline--red"></span>
        <span class="logo-underline logo-underline--green"></span>
      </span>
    </h1>

    <p class="tagline">Pile au centre</p>

    <div class="divider"></div>

    <div class="opening-card">
      <p class="opening-label">Opening</p>
      <p class="opening-date">1<sup style="font-size:0.45em;vertical-align:super;">er</sup> août 2026</p>
    </div>

    <p class="address">Rue St-Martin 9 · Lausanne</p>

    <div class="footer">lausanne-darts.ch</div>
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({
    path: "instagram-story.png",
    type: "png",
    omitBackground: false,
    clip: { x: 0, y: 0, width: 1080, height: 1920 },
  });

  await browser.close();
  console.log("✓ Story exported: instagram-story.png (1080×1920)");
}

exportStory().catch(console.error);

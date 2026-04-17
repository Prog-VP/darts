import puppeteer from "puppeteer";

async function exportLogo() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    width: 1080px;
    height: 1080px;
    background: #0a0a0a;
    color: #F0E6D2;
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  .stage {
    position: relative;
    width: 1080px;
    height: 1080px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 900px;
    height: 900px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(230, 57, 70, 0.18) 0%, rgba(45, 139, 70, 0.1) 40%, transparent 70%);
    filter: blur(80px);
    pointer-events: none;
  }

  .ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 960px;
    height: 960px;
    border-radius: 50%;
    border: 1px solid rgba(240, 230, 210, 0.08);
    pointer-events: none;
  }

  .monogram {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .letters {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 520px;
    line-height: 0.8;
    letter-spacing: -0.02em;
    color: #F0E6D2;
    text-transform: uppercase;
    margin-bottom: -20px;
  }

  .lines {
    width: 640px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .line {
    position: relative;
    height: 20px;
    border-radius: 10px;
  }

  .line-red {
    background: #E63946;
    box-shadow: 0 0 36px rgba(230, 57, 70, 0.6);
  }

  .line-green {
    background: #2D8B46;
    box-shadow: 0 0 36px rgba(45, 139, 70, 0.6);
  }

  .line::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: inherit;
    box-shadow: 0 0 28px currentColor;
  }

  .underline-red::after { background: #E63946; }
  .underline-green::after { background: #2D8B46; }
</style>
</head>
<body>
  <div class="stage">
    <div class="glow"></div>
    <div class="ring"></div>
    <div class="monogram">
      <div class="letters">LD</div>
      <div class="lines">
        <div class="line line-red"></div>
        <div class="line line-green"></div>
      </div>
    </div>
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({
    path: "instagram-logo.png",
    type: "png",
    clip: { x: 0, y: 0, width: 1080, height: 1080 },
  });

  await browser.close();
  console.log("✓ Logo exported: instagram-logo.png (1080×1080)");
}

exportLogo().catch(console.error);

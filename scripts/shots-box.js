const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
(async () => {
  const out = path.join(process.cwd(), "evidence");
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const shots = [
    { name: "hero", path: "/" },
    { name: "projekt", path: "/", hash: "#projekter" },
    { name: "tilbud", path: "/", hash: "#tilbud" },
    { name: "admin-upload", path: "/admin/upload" },
  ];
  for (const w of [375, 1280]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: w === 375 ? 812 : 900, deviceScaleFactor: 1 });
    for (const s of shots) {
      await page.goto("http://127.0.0.1:3000" + s.path, { waitUntil: "networkidle2", timeout: 90000 });
      if (s.hash) {
        await page.evaluate((h) => {
          const el = document.querySelector(h);
          if (el) el.scrollIntoView({ block: "start" });
        }, s.hash);
        await new Promise((r) => setTimeout(r, 500));
      }
      const file = path.join(out, s.name + "-" + w + ".png");
      await page.screenshot({ path: file, fullPage: false });
      console.log("WROTE", file);
    }
    await page.close();
  }
  await browser.close();
  console.log("DONE");
})().catch((e) => { console.error(e); process.exit(1); });

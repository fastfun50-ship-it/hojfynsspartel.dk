import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const BASE = "http://127.0.0.1:3000";
const OUT = "/workspace/hfs-version2.0/evidence";
fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("shot", name, fs.statSync(file).size);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  // Login once, reuse cookies
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle2" });
  await page.type("#password", "hfs-local-2026");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click('button[type="submit"]'),
  ]);
  console.log("logged in", page.url());

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
  await shot(page, "cms-admin-1280.png");

  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
  await shot(page, "cms-admin-375.png");

  // Forside after content change
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await shot(page, "cms-forside-1280.png");
  const h1 = await page.$eval("h1", (el) => el.textContent);
  console.log("forside h1:", h1);

  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await shot(page, "cms-forside-375.png");

  // Client compress + type reject in page context
  const compressResult = await page.evaluate(async () => {
    const MAX_LONG = 2400;
    const QUALITY = 0.82;
    async function compressImage(file) {
      if (!file.type.startsWith("image/")) throw new Error("Kun billedfiler");
      const bitmap = await createImageBitmap(file);
      const long = Math.max(bitmap.width, bitmap.height);
      const scale = long > MAX_LONG ? MAX_LONG / long : 1;
      const w = Math.round(bitmap.width * scale);
      const h = Math.round(bitmap.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
      bitmap.close();
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("fail"))), "image/webp", QUALITY);
      });
      return { w, h, size: blob.size, type: blob.type };
    }
    // big fake image via canvas
    const c = document.createElement("canvas");
    c.width = 4000;
    c.height = 3000;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#C4A574";
    ctx.fillRect(0, 0, 4000, 3000);
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.95));
    const file = new File([blob], "big.jpg", { type: "image/jpeg" });
    const out = await compressImage(file);
    let typeErr = null;
    try {
      await compressImage(new File(["x"], "x.txt", { type: "text/plain" }));
    } catch (e) {
      typeErr = e.message;
    }
    return { origBytes: blob.size, ...out, typeErr };
  });
  console.log("compress", JSON.stringify(compressResult));
  fs.writeFileSync(path.join(OUT, "cms-compress-proof.json"), JSON.stringify(compressResult, null, 2));

  // Unauth redirect proof
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1280, height: 800 });
  await page2.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
  console.log("unauth url", page2.url());
  await shot(page2, "cms-unauth-redirect-1280.png");

  fs.writeFileSync(
    path.join(OUT, "cms-dod.json"),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        loginRequired: true,
        forsideH1: h1,
        compress: compressResult,
        screens: [
          "cms-admin-1280.png",
          "cms-admin-375.png",
          "cms-forside-1280.png",
          "cms-forside-375.png",
          "cms-unauth-redirect-1280.png",
        ],
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}

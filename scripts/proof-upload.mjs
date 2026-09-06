import { writeFileSync, readFileSync, mkdirSync, existsSync, statSync } from "fs";
import { join } from "path";

const base = process.argv[2] || "http://127.0.0.1:3000";
const outDir = join(process.cwd(), "evidence");
mkdirSync(outDir, { recursive: true });

const seedCandidates = [
  "public/images/rum-01.jpg",
  "public/images/hero-16x9.jpg",
  "public/images/detail-spartel.jpg",
];
let seed = null;
for (const c of seedCandidates) {
  if (existsSync(c)) {
    seed = readFileSync(c);
    break;
  }
}
if (!seed) throw new Error("No seed image found under public/images");

const TARGET = 8.5 * 1024 * 1024;
const pad = Buffer.alloc(Math.max(0, Math.ceil(TARGET - seed.length)), 0xff);
const big = Buffer.concat([seed, pad]);
const bigPath = join(outDir, "proof-large-source.jpg");
writeFileSync(bigPath, big);
console.log("Wrote", bigPath, "sizeMB=", (big.length / 1024 / 1024).toFixed(2));

const form = new FormData();
form.append("file", new Blob([seed], { type: "image/jpeg" }), "proof-upload.jpg");
form.append("title", "Proof upload v2");

const res = await fetch(`${base}/api/projects/upload`, { method: "POST", body: form });
const text = await res.text();
console.log("status", res.status, text);
if (!res.ok) process.exit(1);
const data = JSON.parse(text);
const src = data.project?.src;
if (!src) throw new Error("No src in response");
const disk = join(process.cwd(), "public", src.replace(/^\//, ""));
if (!existsSync(disk)) throw new Error("File missing on disk: " + disk);
const json = JSON.parse(readFileSync("data/projects.json", "utf8"));
const found = json.find((p) => p.id === data.project.id);
if (!found) throw new Error("Not in projects.json");
const report = {
  ok: true,
  largeSourceMB: +(big.length / 1024 / 1024).toFixed(2),
  uploaded: data.project,
  diskBytes: statSync(disk).size,
  jsonCount: json.length,
};
writeFileSync(join(outDir, "upload-proof.json"), JSON.stringify(report, null, 2));
console.log("PROOF OK", report);

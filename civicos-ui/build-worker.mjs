/* Build the deployable civicos worker from worker.template.mjs.
   Run: `node civicos-ui/build-worker.mjs <out.mjs>` (from the repo root or anywhere).
   It embeds app.html, the build id (the sha256 of app.html) and exactly the faces
   app.html's @font-face rules declare at /fonts/ — named, never found by listing the
   directory, so a stray file in fonts/ cannot ship — and refuses to write a worker with
   a declared face missing or a placeholder unfilled.
   Deploy the result with deploy-ui.mjs. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* The face files an HTML/CSS text's @font-face rules name under /fonts/, in order, once each. */
export function declaredFaces(text) {
  const out = [];
  for (const m of text.matchAll(/@font-face\s*\{[^}]*?src:\s*url\(\s*["']?\/fonts\/([a-z0-9-]+\.woff2)["']?\s*\)/g))
    if (!out.includes(m[1])) out.push(m[1]);
  return out;
}
export function buildWorker({ appHtml = path.join(HERE, "app.html"), template = path.join(HERE, "worker.template.mjs"),
                              fontsDir = path.join(HERE, "fonts") } = {}) {
  const app = readFileSync(appHtml);
  const fonts = {};
  for (const f of declaredFaces(app.toString("utf8"))) {
    const p = path.join(fontsDir, f);
    if (!existsSync(p)) throw new Error(`build-worker: app.html declares /fonts/${f} and ${fontsDir} does not hold it`);
    fonts[f] = readFileSync(p).toString("base64");
  }
  const out = readFileSync(template, "utf8")
    .replace("__APP_HTML_BASE64__", app.toString("base64"))
    .replace("__BUILD_ID__", createHash("sha256").update(app).digest("hex"))
    .replace("__FONTS_JSON__", JSON.stringify(fonts));
  const left = out.match(/__[A-Z0-9_]+__/g);
  if (left) throw new Error(`build-worker: unfilled placeholder(s): ${[...new Set(left)].join(", ")}`);
  return { source: out, fonts: Object.keys(fonts) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dest = process.argv[2];
  if (!dest) { console.error("usage: node civicos-ui/build-worker.mjs <out.mjs>"); process.exit(2); }
  const { source, fonts } = buildWorker();
  writeFileSync(dest, source);
  console.log(`build-worker: wrote ${dest} (${source.length} bytes) with ${fonts.length} face(s): ${fonts.join(", ")}`);
}

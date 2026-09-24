/* Build the deployable civicos worker from worker.template.mjs.
   Run: `node civicos-ui/build-worker.mjs <out.mjs>` (from the repo root or anywhere).
   It embeds app.html, the build id (the sha256 of app.html) and every .woff2 in
   civicos-ui/fonts/, then refuses to write a worker that left a placeholder unfilled.
   Deploy the result with deploy-ui.mjs. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export function buildWorker({ appHtml = path.join(HERE, "app.html"), template = path.join(HERE, "worker.template.mjs"),
                              fontsDir = path.join(HERE, "fonts") } = {}) {
  const app = readFileSync(appHtml);
  const fonts = {};
  for (const f of readdirSync(fontsDir).filter((f) => f.endsWith(".woff2")).sort())
    fonts[f] = readFileSync(path.join(fontsDir, f)).toString("base64");
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

/* UX lane (branch ux/self-hosted-fonts) — THE APP'S TYPEFACES COME FROM ITS OWN ORIGIN, NEVER FROM ANOTHER.
 *
 * Found 2026-09-24: `app.html` declared its faces at `/fonts/…`, but the `civicos` worker served only `/`,
 * `/build` and `/api/*`, and the repository held no `.woff2` at all. So every face 404'd and the page
 * rendered from the "dev convenience only" Google Fonts link — an outside request on every page load, from
 * a product whose `tokens.css` says "Never fetch at runtime: a sovereign install must work offline".
 *
 * ARMS
 *   A1 NO OUTSIDE FACE      — app.html names no font host, loads no stylesheet from another origin, and
 *                             every `@font-face` source is a same-origin `/fonts/` path.
 *   A2 EVERY FACE EXISTS    — each face app.html or tokens.css declares is a file in civicos-ui/fonts/ that
 *                             IS a WOFF2 (its first four bytes read `wOF2`), with its OFL licence beside it.
 *   A3 THE WORKER SERVES IT — the worker build-worker.mjs produces answers each declared face with 200,
 *                             `font/woff2` and the file's exact bytes, and answers an undeclared name 404.
 *
 * The subject files can be redirected (UXF_APP_HTML, UXF_TEMPLATE, UXF_FONTS_DIR) so the control can arm a
 * broken copy without touching the tree.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/self-hosted-fonts.control.mjs` — arms `googlelink` (the Google
 * link restored), `noroute` (the worker's font route removed) and `missingface` (the serif italic file
 * absent), each alone; each must fail its named arm and the baseline must pass.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { buildWorker } from "../build-worker.mjs";

const UI = fileURLToPath(new URL("../", import.meta.url));
const APP = process.env.UXF_APP_HTML || path.join(UI, "app.html");
const TEMPLATE = process.env.UXF_TEMPLATE || path.join(UI, "worker.template.mjs");
const FONTS = process.env.UXF_FONTS_DIR || path.join(UI, "fonts");
const TOKENS = path.join(UI, "tokens.css");

let pass = 0, fail = 0;
function ok(name, cond, detail = "") {
  if (cond) { pass++; console.log("  ok  ", name); }
  else { fail++; console.log("  FAIL", name, detail ? "— " + detail : ""); }
}

const app = fs.readFileSync(APP, "utf8");
const tokens = fs.readFileSync(TOKENS, "utf8");
const faceUrls = (css) => [...css.matchAll(/@font-face\s*\{[^}]*?src:\s*url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
const appFaces = faceUrls(app), tokenFaces = faceUrls(tokens);

// REACH: the reader finds the faces it is meant to judge, so an empty list cannot pass A1-A3 vacuously.
ok(`REACH: app.html declares ${appFaces.length} face(s) and tokens.css ${tokenFaces.length}`, appFaces.length >= 3 && tokenFaces.length >= 3);

// A1 — NO OUTSIDE FACE
const hosts = app.match(/fonts\.(googleapis|gstatic)\.com|use\.typekit\.net|fonts\.bunny\.net/g) || [];
ok("A1 NO OUTSIDE FACE: app.html names no font host", hosts.length === 0, [...new Set(hosts)].join(", "));
const outsideCss = [...app.matchAll(/<link\b[^>]*\bhref=["'](https?:)?\/\/[^"']+["'][^>]*>/gi)].map((m) => m[0])
  .concat([...app.matchAll(/@import\s+(url\()?["']?(https?:)?\/\/[^"')\s]+/gi)].map((m) => m[0]));
ok("A1 NO OUTSIDE FACE: app.html loads no stylesheet or preconnect from another origin", outsideCss.length === 0, outsideCss.join(" | ").slice(0, 200));
const notLocal = appFaces.filter((u) => !/^\/fonts\/[a-z0-9-]+\.woff2$/.test(u));
ok("A1 NO OUTSIDE FACE: every @font-face source is a same-origin /fonts/*.woff2 path", notLocal.length === 0, notLocal.join(", "));

// A2 — EVERY FACE EXISTS
const declared = [...new Set(appFaces.concat(tokenFaces))].filter((u) => u.startsWith("/fonts/")).map((u) => u.slice(7));
for (const f of declared) {
  const p = path.join(FONTS, f);
  const head = fs.existsSync(p) ? fs.readFileSync(p).subarray(0, 4).toString("latin1") : "";
  ok(`A2 EVERY FACE EXISTS: ${f} is in civicos-ui/fonts/ and is a WOFF2`, head === "wOF2", head ? `first bytes ${JSON.stringify(head)}` : "absent");
}
const families = [...new Set(declared.map((f) => f.replace(/(-italic)?-var\.woff2$/, "")))];
for (const fam of families) {
  const lic = path.join(FONTS, `OFL-${fam}.txt`);
  ok(`A2 EVERY FACE EXISTS: ${fam} ships with its OFL licence`, fs.existsSync(lic) && /SIL Open Font License/.test(fs.readFileSync(lic, "utf8")));
}

// A3 — THE WORKER SERVES IT
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uxf-"));
try {
  let worker = null, built = null;
  try {
    built = buildWorker({ appHtml: APP, template: TEMPLATE, fontsDir: FONTS });
    const file = path.join(dir, "worker.mjs");
    fs.writeFileSync(file, built.source);
    worker = (await import(pathToFileURL(file).href)).default;
  } catch (e) { ok("A3 THE WORKER SERVES IT: the worker builds and loads", false, String(e.message || e).slice(0, 200)); }
  if (worker) {
    const get = (p) => worker.fetch(new Request("https://civicos.example" + p), {});
    for (const f of declared) {
      const r = await get("/fonts/" + f);
      const body = Buffer.from(await r.arrayBuffer());
      const want = fs.existsSync(path.join(FONTS, f)) ? fs.readFileSync(path.join(FONTS, f)) : null;
      ok(`A3 THE WORKER SERVES IT: /fonts/${f} answers 200 font/woff2 with the file's exact bytes`,
        r.status === 200 && r.headers.get("content-type") === "font/woff2" && want && body.equals(want),
        `status ${r.status}, type ${r.headers.get("content-type")}, ${body.length} bytes`);
    }
    for (const bad of ["/fonts/nope.woff2", "/fonts/__proto__", "/fonts/../app.html"]) {
      const r = await get(bad);
      ok(`A3 THE WORKER SERVES IT: ${bad} answers 404`, r.status === 404, `status ${r.status}`);
    }
    const page = await get("/");
    ok("A3 THE WORKER SERVES IT: the page itself is still served at /", page.status === 200 && (await page.text()).includes("<title>CivicOS</title>"));
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

console.log(`self-hosted-fonts: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

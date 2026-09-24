/* The negative control for `self-hosted-fonts.test.mjs`. Run: `node civicos-ui/test/self-hosted-fonts.control.mjs`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It never edits the tree — each arm writes a broken COPY of
 * one subject file to a temp directory and hands it to the suite through UXF_APP_HTML, UXF_TEMPLATE or
 * UXF_FONTS_DIR. Each arm is armed ALONE, and its splice is asserted to have matched exactly once, because an
 * arm that did not arm is a finding, not a pass.
 *
 * DECLARED BEFORE ARMING:
 *   baseline    — nothing armed. MUST be GREEN.
 *   googlelink  — the Google Fonts preconnect and stylesheet restored to app.html's head.
 *                 MUST FAIL "A1 NO OUTSIDE FACE: app.html names no font host" and the stylesheet arm.
 *   noroute     — the worker's `/fonts/` route removed. MUST FAIL "A3 THE WORKER SERVES IT: /fonts/…".
 *   missingface — the serif italic file absent from the fonts directory.
 *                 MUST FAIL "A2 EVERY FACE EXISTS: source-serif-4-italic-var.woff2 …".
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const UI = fileURLToPath(new URL("../", import.meta.url));
const SUITE = fileURLToPath(new URL("./self-hosted-fonts.test.mjs", import.meta.url));
const APP = fs.readFileSync(path.join(UI, "app.html"), "utf8");
const TEMPLATE = fs.readFileSync(path.join(UI, "worker.template.mjs"), "utf8");

function one(s, from, to) {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 80)}`);
  return s.replace(from, to);
}
const ARMS = {
  baseline: { expect: [] },
  googlelink: {
    app: (s) => one(s, "<title>CivicOS</title>\n", '<title>CivicOS</title>\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
      + '<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4&display=swap" rel="stylesheet">\n'),
    expect: ["A1 NO OUTSIDE FACE: app.html names no font host", "A1 NO OUTSIDE FACE: app.html loads no stylesheet"],
  },
  noroute: {
    template: (s) => one(s, 'if(p.startsWith("/fonts/")){', 'if(false){'),
    expect: ["A3 THE WORKER SERVES IT: /fonts/source-serif-4-var.woff2"],
  },
  missingface: { dropFont: "source-serif-4-italic-var.woff2", expect: ["A2 EVERY FACE EXISTS: source-serif-4-italic-var.woff2"] },
};

const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uxf-ctl-"));
const bad = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const env = { ...process.env };
    if (arm.app) { const f = path.join(dir, `${name}-app.html`); fs.writeFileSync(f, arm.app(APP)); env.UXF_APP_HTML = f; }
    if (arm.template) { const f = path.join(dir, `${name}-template.mjs`); fs.writeFileSync(f, arm.template(TEMPLATE)); env.UXF_TEMPLATE = f; }
    if (arm.dropFont) {
      const d = path.join(dir, `${name}-fonts`); fs.mkdirSync(d);
      for (const f of fs.readdirSync(path.join(UI, "fonts"))) if (f !== arm.dropFont) fs.copyFileSync(path.join(UI, "fonts", f), path.join(d, f));
      if (fs.readdirSync(d).length !== fs.readdirSync(path.join(UI, "fonts")).length - 1) throw new Error(`ARM ${name} DID NOT ARM`);
      env.UXF_FONTS_DIR = d;
    }
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { out = String(e.stdout || ""); code = e.status ?? -1; }
    const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1]);
    const tally = (/self-hosted-fonts: (\d+) pass, (\d+) fail/.exec(out) || []).slice(1).join(" pass / ") || "no tally";
    console.log(`\n[${name}] exit ${code} · ${tally}`);
    for (const f of fails) console.log(`    FAIL ${f.slice(0, 120)}`);
    const asDeclared = name === "baseline" ? code === 0 && fails.length === 0
      : code !== 0 && arm.expect.every((e) => fails.some((f) => f.startsWith(e)));
    if (!asDeclared) bad.push(name);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log(`\ncontrol: ${bad.length ? "NOT AS DECLARED: " + bad.join(", ") : "every arm as declared"}`);
process.exit(bad.length ? 1 : 0);

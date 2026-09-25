/* UI-120 — the negative control for `content-crop-surface.test.mjs`. Run: `node civicos-ui/test/content-crop-surface.control.mjs [arm]`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It never edits app.html — each arm is ONE splice applied to the
 * EXTRACTED script, written to a temp file and handed to the suite through `UI120_APP_SRC`, so there is nothing to
 * restore and the tree is never touched (UI-96's driver shape). Each arm armed ALONE; the splice is asserted to have
 * matched exactly once, because an arm that did not arm is a finding, not a pass.
 *
 * DECLARED BEFORE ARMING:
 *   baseline    — nothing armed. MUST be GREEN.
 *   stub        — THE ROW'S NAMED CONTROL: the content-crop read stubbed (the ask answers `{ok:false}` without asking
 *                 the plane). MUST FAIL "UI-120 the crop renders" BY NAME, and the arms reading the same answer (the
 *                 JPEG bytes, LABELLED DERIVED, LABELLED WITH ITS CAPTURE, the page, ONE contentcrop read, and the
 *                 C-99 translation arms, which read the plane's refusal). MUST NOT FAIL any section 1 arm (the
 *                 control's placement and the no-read-on-load arms) or any section 4 arm.
 *   onload      — the leg row asks the plane as it is drawn. MUST FAIL "NOTHING IS ASKED ON LOAD" and "NOTHING
 *                 PREFETCHED FOR A STRANGER". MUST NOT FAIL section 3's refusal arms or section 4.
 *   everyleg    — the control offered on every leg with a content row (the image predicate removed). MUST FAIL "a
 *                 non-image extent shows no control" and the `{part}` arm. MUST NOT FAIL section 2's render arms.
 *   unlabelled  — the plane's `why` dropped from beside the picture. MUST FAIL "LABELLED DERIVED". MUST NOT FAIL the
 *                 render arm (the picture is still the plane's) or section 3.
 *   reworded    — DEC-49: a refusal drawn in this surface's own prose instead of the catalogue's translation. MUST
 *                 FAIL every C-99 translation arm in section 3. MUST NOT FAIL section 2.
 *   overstrict  — OVER-STRICTNESS: the control's label spelled differently ("Show the cited image" → "See the
 *                 picture this citation names"). MUST be GREEN.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./content-crop-surface.test.mjs", import.meta.url).pathname;
const BASE = appScript();
const GREEN = new Set(["baseline", "overstrict"]);
const ARMS = {
  baseline: (s) => s,
  stub: (s) => one(s, `try{ r = await recR("contentcrop", { id: String(contentId) }); }catch(e){ r = e; }`,
                      `try{ r = { ok: false }; }catch(e){ r = e; }`),
  onload: (s) => one(s, `  return \`<div class="subj-how" id="crop-\${Number(ord)}"`,
                        `  askContentCrop(r.content_id, ord);\n  return \`<div class="subj-how" id="crop-\${Number(ord)}"`),
  everyleg: (s) => one(s, `  if(!s || s.extent_kind !== "image" || !e || e.part != null || !Array.isArray(e.rect) || e.rect.length !== 4) return "";\n`, ``),
  unlabelled: (s) => one(s, `    + line("what this is", esc(String(r.why||"")))\n`, ``),
  reworded: (s) => one(s, `    return actRefusalHtml(r || {}) + beside;`,
                          `    return actRefusalHtml({ detail: "We could not show this picture right now." }) + beside;`),
  overstrict: (s) => one(s, `>Show the cited image</a>`, `>See the picture this citation names</a>`),
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 80)}`);
  return s.replace(from, to);
}
const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui120-ctl-"));
const results = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI120_APP_SRC: file }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { out = String(e.stdout || ""); code = e.status ?? -1; }
    const tally = (/content-crop-surface: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].slice(0, 110));
    results.push({ name, code, tally, fails });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail`);
    for (const f of fails) console.log(`    FAIL ${f}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const bad = results.filter((r) => GREEN.has(r.name) !== (r.code === 0 && r.tally[1] === 0));
console.log(`\ncontrol: ${results.length} arm(s) run; ${bad.length ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ") : "every arm as declared (green/red)"}`);
process.exit(bad.length ? 1 : 0);

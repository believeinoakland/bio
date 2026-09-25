/* D-732 — the negative-control arms for `d732-document-history-order.test.mjs`,
 * committed so the next session RE-RUNS them in one step.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS civicos-ui/app.html while it runs, and `civicos-ui/test/run.mjs`
 * discovers `.test.mjs` by filename.
 *
 *   node civicos-ui/test/d732-document-history-order.control.mjs        baseline, then each arm ALONE
 *
 * ARMS, each DECLARED before it runs:
 *   key      THE ROW'S CONTROL: writeOrdered's write branch sorts by snap KEY again (both lists).
 *            MUST FAIL §1 (both) and §4; MUST HOLD the fixture, §2, §3.
 *   logkey   only the promotions are re-sorted by path after ordering. MUST FAIL §1's promotions arm and §4;
 *            MUST HOLD §1's revisions arm and the rest (each list is guarded on its own).
 *   revkey   only the kept revisions are re-sorted by key after ordering. MUST FAIL §1's revisions arm and §4;
 *            MUST HOLD §1's promotions arm and the rest.
 *   silent   the stratum's statement of order is dropped. MUST FAIL §2, §3's two "said" arms, §4;
 *            MUST HOLD the fixture, §1, §3's key-order listing.
 *   compare  OVER-STRICTNESS: the rank comparator spelled as a three-way compare. MUST FAIL nothing.
 *
 * Every restore is verified by sha256 AND by a byte compare against a uniquely named per-arm pristine copy in the
 * item's pen (`controlPen`, outside the worktree, M0-182), and the pristine copy's size is printed and floored. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "../../bio-plane/test/pen.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "../..");
const APP = join(REPO, "civicos-ui/app.html");
const SUITE = join(HERE, "d732-document-history-order.test.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const SORT_SITE = `return { order:"write", items: items.slice().sort((a,b)=>ranks.get(keyOf(a))-ranks.get(keyOf(b))) };`;
const LOG_SITE = `  return writeOrdered(entries, e=>e.key, ranks);`;
const REV_SITE = `    const revs = revsO.items;`;
const SAY_SITE = `    const orderSaid = (log.length || revs.length)`;
const P = { fix: "FIXTURE", s1log: "§1 the promotions", s1rev: "§1 the earlier revisions", s2: "§2 ",
            s3list: "§3 an image without seq", s3say: "§3 and says", s3part: "§3 seq on only some", s4: "§4 " };
const ALL = Object.values(P);
const but = (...fail) => ALL.filter((p) => !fail.includes(p));
const ARMS = {
  key:     { edits: [[SORT_SITE, `return { order:"write", items: items.slice().sort((a,b)=>keyOf(a)<keyOf(b)?-1:1) };`]],
             mustFail: [P.s1log, P.s1rev, P.s4], mustHold: but(P.s1log, P.s1rev, P.s4) },
  logkey:  { edits: [[LOG_SITE, `  const o = writeOrdered(entries, e=>e.key, ranks); o.items.sort((a,b)=>a.path<b.path?-1:1); return o;`]],
             mustFail: [P.s1log, P.s4], mustHold: but(P.s1log, P.s4) },
  revkey:  { edits: [[REV_SITE, `    const revs = revsO.items.slice().sort();`]],
             mustFail: [P.s1rev, P.s4], mustHold: but(P.s1rev, P.s4) },
  silent:  { edits: [[SAY_SITE, `    const orderSaid = false && (log.length || revs.length)`]],
             mustFail: [P.s2, P.s3say, P.s3part, P.s4], mustHold: but(P.s2, P.s3say, P.s3part, P.s4) },
  compare: { edits: [[SORT_SITE, `return { order:"write", items: items.slice().sort((a,b)=>(ranks.get(keyOf(a))>ranks.get(keyOf(b)))-(ranks.get(keyOf(a))<ranks.get(keyOf(b)))) };`]],
             mustFail: [], mustHold: ALL },
};

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /d732-document-history-order: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 8) { console.log("baseline is not green; no arm can mean anything"); process.exit(2); }

const PEN = controlPen("d732");
for (const [arm, a] of Object.entries(ARMS)) {
  const bytes = readFileSync(APP);
  if (bytes.length < 1_000_000) { console.log(`REFUSING: ${APP} is ${bytes.length} bytes`); process.exit(2); }
  const dest = join(PEN, `${arm}--civicos-ui_app.html.pristine`);
  writeFileSync(dest, bytes);
  console.log(`\narm ${arm}: pristine civicos-ui/app.html ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…`);
  let text = bytes.toString("utf8"), armed = true;
  for (const [from, to] of a.edits) {
    const n = text.split(from).length - 1;
    if (n !== 1) { console.log(`  ARM DID NOT ARM: anchor matched ${n} times, want 1: ${from.slice(0, 60)}`); armed = false; break; }
    text = text.split(from).join(to);
  }
  if (!armed) { bad++; continue; }
  writeFileSync(APP, text, "utf8");
  let r;
  try { r = runSuite(); }
  finally {
    writeFileSync(APP, bytes);
    const now = readFileSync(APP), pristine = readFileSync(dest);
    const eq = sha(now) === sha(pristine) && now.equals(pristine);
    console.log(`  restored: sha256 ${eq ? "EQUAL" : "**DIFFERENT**"} ${sha(now).slice(0, 12)}… · byte compare ${now.equals(pristine) ? "IDENTICAL" : "**DIFFERS**"}`);
    if (!eq) process.exit(2);
  }
  console.log(`  result: exit ${r.code} · ${r.foot ? `${r.foot.pass} pass / ${r.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
  for (const f of r.failed) console.log(`    failed: ${f.split("\n")[0].slice(0, 110)}`);
  const hit = (p) => r.failed.some((f) => f.startsWith(p));
  const missing = a.mustFail.filter((p) => !hit(p)), leaked = a.mustHold.filter(hit);
  const ok = r.foot && !missing.length && !leaked.length;
  console.log(`  verdict: ${ok ? "AS DECLARED" : "NOT AS DECLARED"}${missing.length ? ` · did not fail: ${missing.join(" | ")}` : ""}`
    + `${leaked.length ? ` · failed but must hold: ${leaked.join(" | ")}` : ""}`);
  if (!ok) bad++;
}
console.log(`\nd732 control: ${bad ? `${bad} arm(s) NOT as declared` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);

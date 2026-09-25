/* D-719 — the negative-control arms for `d719-history-write-order.test.mjs`,
 * committed so the next session RE-RUNS them in one step.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS src/setup.mjs while it runs, so the battery must not discover it
 * (`retirement.control.mjs` set the precedent).
 *
 *   node test/d719-history-write-order.control.mjs        baseline, then each arm ALONE
 *
 * ARMS, each DECLARED before it runs:
 *   key      the row's control: historyOrder's write branch sorts by snap KEY again.
 *            MUST FAIL §1 and §4 (the lists read in key order); MUST HOLD the fixture, §2, §3.
 *   silent   the list's statement of order is dropped. MUST FAIL §2's "says", §3's two "said" arms, §4;
 *            MUST HOLD the fixture, §1, §2's caption, §3's key-order listing.
 *   caption  the fixed caption says "oldest first" again. MUST FAIL §2's caption arm only.
 *   compare  OVER-STRICTNESS: the seq comparator spelled as a three-way compare. MUST FAIL nothing.
 *
 * Every restore is verified by sha256 AND by a byte compare against a uniquely named per-arm pristine copy in the
 * item's pen (`controlPen`, outside the worktree, M0-182), and the pristine copy's size is printed and floored. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const SETUP = join(PLANE, "src/setup.mjs");
const SUITE = join(HERE, "d719-history-write-order.test.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const SORT_SITE = `return write ? { order:"write", entries: list.slice().sort((a,b)=>a.seq-b.seq) }`;
const SAY_SITE = `+ (hist.order === "write" ? "Listed in the order they were written, oldest first."`;
const SAY_END = `: "Listed by snapshot key: this copy of the record does not carry the order they were written, and key order is not necessarily the order they were written.")`;
const CAP_SITE = `<p class="small">Every revision this bundle has ever had. The record is`;
const P = { fix: "FIXTURE", s1: "§1 ", s2say: "§2 the page says", s2cap: "§2 the fixed caption",
            s3list: "§3 an image without seq", s3say: "§3 and says", s3part: "§3 seq on only some", s4: "§4 " };
const ALL = Object.values(P);
const but = (...fail) => ALL.filter((p) => !fail.includes(p));
const ARMS = {
  key:     { edits: [[SORT_SITE, `return write ? { order:"write", entries: list.slice().sort((a,b)=>String(a.key).localeCompare(String(b.key))) }`]],
             mustFail: [P.s1, P.s4], mustHold: but(P.s1, P.s4) },
  silent:  { edits: [[SAY_SITE, `+ (hist.order === "write" ? ""`], [SAY_END, `: "")`]],
             mustFail: [P.s2say, P.s3say, P.s3part, P.s4], mustHold: but(P.s2say, P.s3say, P.s3part, P.s4) },
  caption: { edits: [[CAP_SITE, `<p class="small">Every revision this bundle has ever had, oldest first. The record is`]],
             mustFail: [P.s2cap], mustHold: but(P.s2cap) },
  compare: { edits: [[SORT_SITE, `return write ? { order:"write", entries: list.slice().sort((a,b)=>(a.seq>b.seq)-(a.seq<b.seq)) }`]],
             mustFail: [], mustHold: ALL },
};

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /d719-history-write-order: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 8) { console.log("baseline is not green; no arm can mean anything"); process.exit(2); }

const PEN = controlPen("d719");
for (const [arm, a] of Object.entries(ARMS)) {
  const bytes = readFileSync(SETUP);
  if (bytes.length < 50_000) { console.log(`REFUSING: ${SETUP} is ${bytes.length} bytes`); process.exit(2); }
  const dest = join(PEN, `${arm}--src_setup.mjs.pristine`);
  writeFileSync(dest, bytes);
  console.log(`\narm ${arm}: pristine src/setup.mjs ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…`);
  let text = bytes.toString("utf8"), armed = true;
  for (const [from, to] of a.edits) {
    const n = text.split(from).length - 1;
    if (n !== 1) { console.log(`  ARM DID NOT ARM: anchor matched ${n} times, want 1: ${from.slice(0, 60)}`); armed = false; break; }
    text = text.split(from).join(to);
  }
  if (!armed) { bad++; continue; }
  writeFileSync(SETUP, text, "utf8");
  let r;
  try { r = runSuite(); }
  finally {
    writeFileSync(SETUP, bytes);
    const now = readFileSync(SETUP), pristine = readFileSync(dest);
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
console.log(`\nd719 control: ${bad ? `${bad} arm(s) NOT as declared` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);

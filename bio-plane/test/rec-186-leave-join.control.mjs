/* REC-186 — NEGATIVE CONTROLS for `test/rec-186-leave-join.test.mjs`. NOT a `.test.mjs`: it EDITS REAL
 * SOURCES (src/store.mjs, src/affordances.mjs) while it runs, so the battery must not discover it. The harness
 * is d311.control.mjs's, copied: a BASELINE first, each arm ALONE, its anchor asserted to occur exactly once,
 * every source restored from a per-arm pristine copy and verified by sha256, by content and by `cmp` x2; the pen
 * `.rec186-harness/` at the repo root is gitignored and removed on exit.
 *
 * DECLARED BEFORE ARMING:
 *   (1) THE OWNER CHECK DROPPED — `projectLeave`'s last-owner floor never fires. MUST FAIL "THE REFUSAL";
 *       MUST NOT FAIL "THE JOIN OFFER" (iris's offers are read before her leave, so the cascade is fenced).
 *   (2) JOIN OFFERED UNCONDITIONALLY — `projectjoin`'s `!== "joined"` clause removed, the D-311 predicate.
 *       MUST FAIL "THE JOIN OFFER"; MUST NOT FAIL "THE REFUSAL".
 *   (3) OVER-STRICTNESS — `projectLeave` refuses EVERY owner, co-owners included (a fence tighter than the
 *       ruling, which lets a non-last owner leave). MUST FAIL "A CO-OWNER'S LEAVE LANDS"; MUST NOT FAIL
 *       "THE JOIN OFFER".
 *   (4) THE LEAVE OFFER UNFLOORED — `projectleave` offered to every joined caller again. MUST FAIL "THE LEAVE
 *       OFFER"; MUST NOT FAIL "THE REFUSAL" (the store still refuses; only the offer overclaims).
 *
 * Run it:  node test/rec-186-leave-join.control.mjs [armId]
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = { affordances: ROOT + "src/affordances.mjs", store: ROOT + "src/store.mjs" };
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));
const ONLY = process.argv[2] || null;
const SUITE = "rec-186-leave-join.test.mjs";

for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${Buffer.byteLength(v)} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 5000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}
const PEN = ROOT + "../.rec186-harness";
rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PEN, `record.${k}`));

let armsRun = 0, armsWrong = 0;
function runSuite() {
  let out = "";
  try { out = execFileSync(process.execPath, [ROOT + "test/" + SUITE], { encoding: "utf8", timeout: 900000 }); }
  catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) passed, (\d+) failed/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 200));
  return m ? { pass: +m[1], fail: +m[2], named } : { pass: -1, fail: -1, named };
}
function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in ${key}`);
  writeFileSync(F[key], src.replace(from, to));
}
function restoreAll(armId) {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k} (arm ${armId})`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k} (arm ${armId})`);
    execFileSync("cmp", ["-s", p, join(PEN, `arm${armId}.${k}`)]);
    execFileSync("cmp", ["-s", p, join(PEN, `record.${k}`)]);
    console.log(`    ${k}: ${Buffer.byteLength(now)} bytes restored, verified by sha256, by content, and by cmp x2`);
  }
}
function arm(id, title, edits, { mustFail = [], mustNotFail = [] }) {
  if (ONLY && ONLY !== id) return;
  armsRun++;
  console.log(`\n=== (${id}) ${title}`);
  for (const k of Object.keys(F)) copyFileSync(F[k], join(PEN, `arm${id}.${k}`));
  let wrong = false;
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite();
    console.log(`  MEASURED ${SUITE}: ${r.pass} pass, ${r.fail} fail${r.fail === -1 ? "  ** NO TALLY — the suite THREW" : ""}`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    for (const frag of mustFail) if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL`); wrong = true; }
    for (const frag of mustNotFail) if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (r.fail === -1) { console.log("  ** WRONG: no tally"); wrong = true; }
    if (r.fail === 0) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++; else console.log("  as declared.");
  } finally { restoreAll(id); }
}

console.log("\nREC-186 — negative controls. THE BASELINE FIRST, so every arm is a delta.");
if (!ONLY) {
  const b = runSuite();
  console.log(`  BASELINE ${SUITE}: ${b.pass} pass, ${b.fail} fail`);
  if (b.fail !== 0 || b.pass < 8) { console.log("  ** the tree is not whole; every arm below would measure the wrong thing"); process.exit(1); }
}

arm("1", "THE OWNER CHECK DROPPED — projectLeave records the only owner's request",
  [["store", "    if (floor && !floor.possible)\n      return { ok: false, reason: \"LAST_OWNER_CANNOT_LEAVE\"",
             "    if (false && floor && !floor.possible)\n      return { ok: false, reason: \"LAST_OWNER_CANNOT_LEAVE\""]],
  { mustFail: ["THE REFUSAL:"], mustNotFail: ["THE JOIN OFFER"] });

arm("2", "JOIN OFFERED UNCONDITIONALLY — the joined participant offered a join that does nothing",
  [["affordances", `typeof f.roster?.state === "string" && f.roster.state !== "joined" },`,
                   `typeof f.roster?.state === "string" },`]],
  { mustFail: ["THE JOIN OFFER"], mustNotFail: ["THE REFUSAL:"] });

arm("3", "OVER-STRICTNESS — every owner refused, the co-owner included",
  [["store", "    if (floor && !floor.possible)\n      return { ok: false, reason: \"LAST_OWNER_CANNOT_LEAVE\"",
             "    if (floor)\n      return { ok: false, reason: \"LAST_OWNER_CANNOT_LEAVE\""]],
  { mustFail: ["A CO-OWNER'S LEAVE LANDS"], mustNotFail: ["THE JOIN OFFER"] });

arm("4", "THE LEAVE OFFER UNFLOORED — projectleave offered to the only owner",
  [["affordances", `&& (f.roster?.owner !== true || f.roster?.owner_floor_clear === true) },`, ` },`]],
  { mustFail: ["THE LEAVE OFFER"], mustNotFail: ["THE REFUSAL:"] });

console.log(`\n${armsRun} arm(s) run, ${armsWrong} came back other than declared.`);
rmSync(PEN, { recursive: true, force: true });
process.exit(armsWrong ? 1 : 0);

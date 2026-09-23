/* D-311 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the battery must not
 * discover it — `d310.control.mjs`'s precedent. The pen lives INSIDE this worktree and never in a
 * shared scratchpad (PL-10). `.d311-harness/` is removed at the end.
 *
 * WHAT THE ITEM IS, so the arms read as a shape: `op=affordances` gains the seven roster acts,
 * each derived from its own refusal over a PER-PAIR fact (`roster`, asked of the `by` stamp), and
 * withholds from a machine credential every act its class is refused by name (`MACHINE_REFUSALS`,
 * over the store's `actor_is_machine`). The suite is `d311-roster-affordances.test.mjs`.
 *
 *   (1) THE ROW'S OWN — SWAP IN D-310's FACT. The roster fact's `owner` asks
 *       `#ownsAnyProject(actor)` ("owner of SOME project") instead of the pair. DECLARED: MUST FAIL
 *       "CROSS-PROJECT" and the invite/remove/owner-add agreement rows; MUST NOT FAIL "MACHINE
 *       WITHHELD" nor "THE MACHINE MAP IS THE STORE'S".
 *   (2) THE MACHINE RULE DROPPED — `deriveActs` stops consulting MACHINE_REFUSALS, which is the
 *       state D-311 found. DECLARED: MUST FAIL "MACHINE WITHHELD: on every fixture object"; MUST
 *       NOT FAIL "CROSS-PROJECT" nor "THE MACHINE MAP IS THE STORE'S" (the map still matches the
 *       store; only the publication stops consulting it).
 *   (3) OVER-STRICTNESS — `projectjoin` narrowed to `state === "invited"`, the tidy-looking fence
 *       ("join is the invitee's") that is tighter than `projectJoin`'s rule. DECLARED: MUST FAIL
 *       "THE AGREEMENT — projectjoin" (a joined or leaving participant's join SUCCEEDS and is no
 *       longer offered); MUST NOT FAIL "CROSS-PROJECT".
 *   (4) THE MAP WIDENED — `retire` added to MACHINE_REFUSALS, a code the store never answers a
 *       machine. DECLARED: MUST FAIL "THE MACHINE MAP IS THE STORE'S" (both-directions, the
 *       invented entry named); MUST NOT FAIL "CROSS-PROJECT".
 *
 * Run it:  node test/d311.control.mjs [armId]
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
const SUITE = "d311-roster-affordances.test.mjs";

for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${Buffer.byteLength(v)} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 5000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}
const PEN = ROOT + "../.d311-harness";
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

console.log("\nD-311 — negative controls. THE BASELINE FIRST, so every arm is a delta.");
if (!ONLY) {
  const b = runSuite();
  console.log(`  BASELINE ${SUITE}: ${b.pass} pass, ${b.fail} fail`);
  if (b.fail !== 0 || b.pass < 10) { console.log("  ** the tree is not whole; every arm below would measure the wrong thing"); process.exit(1); }
}

arm("1", "THE ROW'S OWN — D-310's `owner of SOME project` swapped in for the pair",
  [["store", "return { owner: this.#isProjectOwner(b.bundle_id, actor),",
             "return { owner: this.#ownsAnyProject(actor),"]],
  { mustFail: ["CROSS-PROJECT", "THE AGREEMENT — projectinvite", "THE AGREEMENT — projectremove",
               "THE AGREEMENT — projectowneradd"],
    mustNotFail: ["MACHINE WITHHELD", "THE MACHINE MAP IS THE STORE'S"] });

arm("2", "THE MACHINE RULE DROPPED — deriveActs no longer consults MACHINE_REFUSALS",
  [["affordances", "ACTS.filter((a) => a.applies(facts, ty) && !(machine && a.id in MACHINE_REFUSALS));",
                   "ACTS.filter((a) => a.applies(facts, ty) && (machine || true));"]],
  { mustFail: ["MACHINE WITHHELD: on every fixture object"],
    mustNotFail: ["CROSS-PROJECT", "THE MACHINE MAP IS THE STORE'S"] });

arm("3", "OVER-STRICTNESS — projectjoin narrowed to the invitee alone",
  [["affordances", `applies: (f, ty) => ty === "project" && typeof f.roster?.state === "string" },`,
                   `applies: (f, ty) => ty === "project" && f.roster?.state === "invited" },`]],
  { mustFail: ["THE AGREEMENT — projectjoin"], mustNotFail: ["CROSS-PROJECT"] });

arm("4", "THE MAP WIDENED — `retire` declared machine-refused, which the store never answers",
  [["affordances", `  release:            "MACHINE_CANNOT_RELEASE",`,
                   `  release:            "MACHINE_CANNOT_RELEASE",\n  retire:             "MACHINE_CANNOT_RETIRE",`]],
  { mustFail: ["THE MACHINE MAP IS THE STORE'S"], mustNotFail: ["CROSS-PROJECT"] });

console.log(`\n${armsRun} arm(s) run, ${armsWrong} came back other than declared.`);
rmSync(PEN, { recursive: true, force: true });
process.exit(armsWrong === 0 ? 0 : 1);

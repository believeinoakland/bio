/* D-125 — negative controls for `d125-findingmute.test.mjs`. Deliberately NOT a
 * `.test.mjs`: it EDITS REAL SOURCES while it runs and the battery must not
 * discover it (current.control.mjs's precedent, whose shape this copies). Each arm
 * is armed ALONE; every restore is verified by sha256, by content and by `cmp`
 * against a per-arm pristine named with the ARM ID; each arm DECLARES what MUST
 * fail and what MUST NOT; the BASELINE runs first.
 *
 * Run it:  node test/d125-findingmute.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { ANCHOR_DRY, anchorRows, anchorTable } from "../scripts/anchortable.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = { store: ROOT + "src/store.mjs", queuestate: ROOT + "src/queuestate.mjs" };
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 2000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}
const PEN = ROOT + ".d125-harness";
if (!ANCHOR_DRY) {   /* M0-197: no pen under the dry read of tools/anchordrift.mjs */
rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PEN, `record.${k}`));
}

let armsWrong = 0;
function runSuite() {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/d125-findingmute.test.mjs"], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) passed, (\d+) failed/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 150));
  return m ? { pass: +m[1], fail: +m[2], named } : { pass: -1, fail: -1, named };
}
function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in ${key}`);
  writeFileSync(F[key], src.replace(from, to));
}
function restoreAll(id) {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k} (arm ${id})`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k} (arm ${id})`);
    execFileSync("cmp", ["-s", p, join(PEN, `arm${id}.${k}`)]);
    execFileSync("cmp", ["-s", p, join(PEN, `record.${k}`)]);
    console.log(`    ${k}: ${now.length} bytes restored, verified by sha256, by content, and by cmp x2`);
  }
}
function arm(id, title, edits, mustFail, mustNotFail) {
  if (ANCHOR_DRY) return void anchorRows(edits.map(([k, from, to]) => ({ arm: id, file: F[k], find: from, put: to })));   /* M0-197: read, never armed */
  console.log(`\n=== (${id}) ${title}`);
  for (const k of Object.keys(F)) copyFileSync(F[k], join(PEN, `arm${id}.${k}`));
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite();
    console.log(`  MEASURED: ${r.pass} pass, ${r.fail} fail${r.fail === -1 ? "  ** NO TALLY (-1)" : ""}`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = r.fail <= 0;
    if (wrong) console.log("  ** WRONG: the suite did not fail. A control that cannot fail proves nothing.");
    for (const f of mustFail) if (!hit(f)) { console.log(`  ** WRONG: expected "${f}" to FAIL`); wrong = true; }
    for (const f of mustNotFail) if (hit(f)) { console.log(`  ** WRONG: "${f}" failed and must stay GREEN`); wrong = true; }
    if (wrong) armsWrong++; else console.log("  as declared.");
  } finally { restoreAll(id); }
}

if (!ANCHOR_DRY) {   /* M0-197: no baseline suite under the dry read */
const base = runSuite();
console.log(`\n  BASELINE d125-findingmute.test.mjs: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0 || base.pass < 30) { console.log("  ** the tree is not whole; refusing to arm"); process.exit(1); }
}

/* (a) THE ROW'S OWN ARM. The row says "key the item mute by case alone"; the item
   form holds no case, so the faithful arm is the one that takes the MEMBER out of
   the key — the mute keyed on the item alone, so one member's row reaches every
   member's read. */
arm("a", "KEY THE ITEM MUTE WITHOUT THE MEMBER. `#queueItemMutes` reads every member's rows. "
  + "DECLARED: the B-FEED arm and D-170's second-member arm MUST fail. The ann-side ACCEPTS arms and "
  + "the no-disposition arm MUST NOT: ann's feed is exactly right, which is why only a second member "
  + "can see this defect.",
  [["store", "`SELECT item_id FROM queue_item_mutes WHERE member_id=?`, member.trim())) out.add(r.item_id);",
             "`SELECT item_id FROM queue_item_mutes WHERE ?<>''`, member.trim())) out.add(r.item_id);"]],
  ["B-FEED: ben's feed STILL carries F", "while ben's feed still carries it"],
  ["ACCEPTS: F is gone from ann's items", "and NO disposition row exists", "op=proposals STILL carries F"]);

/* (b) THE OBLIGATION FENCE, class half. */
arm("b", "ADMIT OBLIGATION AS PERSONALLY MUTABLE. DECLARED: both OBLIGATION refusal arms MUST fail, "
  + "by kind and by id. The FINDING arms MUST NOT.",
  [["queuestate", `export const PERSONALLY_MUTABLE_CLASSES = ["CONDITION", "FINDING"];`,
                  `export const PERSONALLY_MUTABLE_CLASSES = ["CONDITION", "FINDING", "OBLIGATION"];`]],
  ["by KIND: refused KIND_NOT_PERSONAL", "by ITEM: the task's own id is refused"],
  ["ACCEPTS: F is gone from ann's items", "B-FEED: ben's feed STILL carries F"]);

/* (c) THE OBLIGATION FENCE, naming half: an opaque task id is not asked of `tasks`. */
arm("c", "DO NOT ASK `tasks` TO NAME AN OPAQUE ID. DECLARED: the by-ITEM obligation arm MUST fail "
  + "(it is refused, but as UNKNOWN_KIND rather than by name). The by-KIND arm MUST NOT.",
  [["store", "if (cls === null && this.#one(`SELECT id FROM tasks WHERE id=?`, itemId)) cls = \"OBLIGATION\";",
             "if (cls === null && false) cls = \"OBLIGATION\";"]],
  ["by ITEM: the task's own id is refused"],
  ["by KIND: refused KIND_NOT_PERSONAL"]);

anchorTable();   /* M0-197: prints the arms read above and exits, under the dry read only */
rmSync(PEN, { recursive: true, force: true });
console.log(`\nd125-findingmute.control: ${armsWrong === 0 ? "every arm as declared" : `${armsWrong} arm(s) NOT as declared`}`);
process.exit(armsWrong ? 1 : 0);

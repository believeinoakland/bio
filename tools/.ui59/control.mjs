// UI-59's NEGATIVE CONTROL for its own completeness check.
//
// DECLARED BEFORE ARMING:
//   BASELINE   unarmed tree                      -> exit 0, PASS, 0 missing
//   ARM 1      UI-56's entry removed (SURFACE)   -> exit 1, MISSING lists exactly UI-56
//   ARM 2      UI-53's entry removed (HARNESS)   -> exit 0, PASS   <-- OVER-STRICTNESS:
//              an item that never touched a member surface is a MEASUREMENT and the
//              check must NOT demand an entry for it.
//   ARM 3      the id-set grammar broken         -> exit 2, refuses to sweep an empty
//              corpus (the "headline assertion passed over an empty corpus" class).
//   FINAL      unarmed again                     -> exit 0 AND byte-identical to pristine
//
// Each arm is armed ALONE, the others held open. Restores are by cp-back from a
// UNIQUELY NAMED per-arm pristine, verified by sha256 AND by cmp, with a floored byte
// count — never by `git checkout --`, which restores to HEAD and would discard this
// session's own uncommitted work (CLAUDE.md, measured twice in two days).
// THE DRIVER REMOVES ITS OWN PRISTINE COPIES ON THE WAY OUT, and that is not tidiness.
// Left behind, the arm-3 copy is a whole duplicate of QUEUE.md sitting UNTRACKED in the
// tree — and `bio-plane/test/check-firing.test.mjs` walks the untracked estate looking for
// producers of the two retired gated paths behind C-7.1 and C-8.1. The duplicate quotes
// both, so it read as two new producers and turned the battery RED on a run that had
// nothing to do with the plane. Measured here on 2026-09-14: 98 pass, 2 fail, both naming
// this driver's leftover. A control driver that poisons the battery it exists to validate
// is the M0-30 class one turn later.
//
// AND THE FIRST VERSION OF THIS VERY COMMENT SPELLED THE TWO PATHS OUT, so the check then
// flagged `control.mjs` itself — the same 2 fails, a different producer. That is the
// documented class where a correction is caught because it quotes the token it corrects.
// The paths are named by their CHECK NUMBERS above for that reason; do not re-spell them.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, statSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-a4ad9b33f45a32657";
const LEDGER = `${ROOT}/docs/development/CIVICOS_UI_STATE.md`;
const QUEUE = `${ROOT}/docs/development/QUEUE.md`;
const MIN_LEDGER = 100000; // floor: the backfilled ledger is ~143 KB. Guard an empty write.
const MIN_QUEUE = 100000;

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const run = () => {
  try {
    const out = execFileSync("node", [`${ROOT}/tools/.ui59/completeness.mjs`], { encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: (e.stdout || "") + (e.stderr || "") };
  }
};
const missingIds = (out) => [...out.matchAll(/^ {3}MISSING {2}(UI-\d+[a-z]?)$/gm)].map((m) => m[1]);

const results = [];
const record = (name, declared, r, extra = "") => {
  results.push({ name, declared, code: r.code, pass: r.out.includes("PASS —"), extra });
  console.log(`${name}: exit ${r.code} — ${extra}`);
};

// ---------- BASELINE ----------
let r = run();
record("BASELINE (unarmed)", "exit 0, PASS", r,
  `${r.out.includes("PASS —") ? "PASS" : "NO PASS LINE"}, missing=[${missingIds(r.out)}]`);

// ---------- ARM 1: a landed SURFACE item's entry removed ----------
const P1 = `${ROOT}/tools/.ui59/pristine-arm1-ledger.md`;
copyFileSync(LEDGER, P1);
const before1 = sha(P1);
{
  const txt = readFileSync(LEDGER, "utf8");
  const re = /^v88, [\d-]+ session, thread UI, UI-56\./m;
  if (!re.test(txt)) throw new Error("ARM 1 DID NOT ARM: anchor absent");
  const n = (txt.match(/^v88, [\d-]+ session, thread UI, UI-56\./gm) || []).length;
  if (n !== 1) throw new Error(`ARM 1 DID NOT ARM CLEANLY: anchor occurs ${n} times`);
  writeFileSync(LEDGER, txt.replace(re, "vXX, 2026-09-10 session, thread UI, (entry removed by ARM 1)."));
}
r = run();
const m1 = missingIds(r.out);
record("ARM 1 (UI-56 entry removed, a SURFACE item)", "exit 1, MISSING == [UI-56]", r,
  `missing=[${m1}] ${r.code === 1 && m1.length === 1 && m1[0] === "UI-56" ? "AS DECLARED" : "NOT AS DECLARED"}`);
copyFileSync(P1, LEDGER);
if (sha(LEDGER) !== before1) throw new Error("ARM 1 restore FAILED by sha256");
execFileSync("cmp", [LEDGER, P1]);
if (statSync(LEDGER).size < MIN_LEDGER) throw new Error("ARM 1 restore below floor");
console.log(`   restored byte-identically: YES (sha256 + cmp, ${statSync(LEDGER).size} B)`);

// ---------- ARM 2: OVER-STRICTNESS — an EXEMPT harness-only item's entry removed ----------
const P2 = `${ROOT}/tools/.ui59/pristine-arm2-ledger.md`;
copyFileSync(LEDGER, P2);
const before2 = sha(P2);
{
  const txt = readFileSync(LEDGER, "utf8");
  const re = /^v85, [\d-]+ session, thread UI, UI-53\./m;
  if (!re.test(txt)) throw new Error("ARM 2 DID NOT ARM: anchor absent");
  writeFileSync(LEDGER, txt.replace(re, "vXX, 2026-08-09 session, thread UI, (entry removed by ARM 2)."));
}
r = run();
const m2 = missingIds(r.out);
record("ARM 2 (UI-53 entry removed, HARNESS-ONLY) — OVER-STRICTNESS", "exit 0, PASS", r,
  `missing=[${m2}] ${r.code === 0 && m2.length === 0 ? "AS DECLARED (not demanded)" : "NOT AS DECLARED"}`);
copyFileSync(P2, LEDGER);
if (sha(LEDGER) !== before2) throw new Error("ARM 2 restore FAILED by sha256");
execFileSync("cmp", [LEDGER, P2]);
console.log(`   restored byte-identically: YES (sha256 + cmp, ${statSync(LEDGER).size} B)`);

// ---------- ARM 3: the corpus itself broken ----------
const P3 = `${ROOT}/tools/.ui59/pristine-arm3-queue.md`;
copyFileSync(QUEUE, P3);
const before3 = sha(P3);
{
  const txt = readFileSync(QUEUE, "utf8");
  const armed = txt.replace(/^### (UI-\d+[a-z]?) · /gm, "### ZZ-$1 ~ ");
  if (armed === txt) throw new Error("ARM 3 DID NOT ARM: no headings matched");
  writeFileSync(QUEUE, armed);
}
r = run();
record("ARM 3 (id-set grammar broken)", "exit 2, refuses an empty corpus", r,
  `${r.code === 2 ? "AS DECLARED" : "NOT AS DECLARED"}`);
copyFileSync(P3, QUEUE);
if (sha(QUEUE) !== before3) throw new Error("ARM 3 restore FAILED by sha256");
execFileSync("cmp", [QUEUE, P3]);
if (statSync(QUEUE).size < MIN_QUEUE) throw new Error("ARM 3 restore below floor");
console.log(`   restored byte-identically: YES (sha256 + cmp, ${statSync(QUEUE).size} B)`);

// ---------- FINAL ----------
r = run();
record("FINAL (unarmed again)", "exit 0, PASS", r,
  `${r.out.includes("PASS —") ? "PASS" : "NO PASS LINE"}`);

// Remove ONLY the copies this driver wrote, by name — never a directory sweep, which
// is how M0-30's driver took a sibling worktree with it on a clean exit at code 0.
for (const p of [P1, P2, P3]) rmSync(p, { force: true });
console.log("pristine copies removed (P1, P2, P3) — the untracked estate is clean again");

console.log("\n--- CONTROL REGISTER ---");
for (const x of results) console.log(`  ${x.name}\n      declared: ${x.declared}\n      actual:   exit ${x.code} — ${x.extra}`);
console.log(`\narms: ${results.length} (1 baseline + 3 arms + 1 final)`);

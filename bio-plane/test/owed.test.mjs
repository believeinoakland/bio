/* owed — D-409's predicate: what a LANE still owes, read out of the repository.
 *
 * Bob, 2026-09-17: *"This isn't just a bug in idleness, but a failure to document (in the repo)
 * and follow the commitments you've made."* `kickoffs/BOB.md` rule 10 says a lane keeps going
 * while its list is non-empty, and when that rule was written THERE WAS NO LIST.
 *
 * ------------------------------------------------ WHAT THIS SUITE IS DEFENDING AGAINST
 *
 * **The cheapest way to make a worklist green is to return NOTHING, and the second cheapest is
 * to return EVERYTHING.** Both look like a working instrument and both destroy it:
 *   - RETURN NOTHING and the lane stops while obligations sit. Every arm asserting *X is not
 *     owed* stays green over an empty walk, **so every such arm here asserts a FOUND item in the
 *     same run.**
 *   - RETURN EVERYTHING and the list is noise, which is a list nobody reads — the failure it
 *     exists to prevent. **Measured on the real ledger: the first version returned 58 items,
 *     the second 28, the shipped one 14.**
 *
 * **THE TWO NARROWINGS ARE ARMS HERE, because both were real defects and both are one edit from
 * returning.** Matching the row BODY caught every row that merely QUOTES Bob — a mention is not
 * an assignment. A bare `RESIDUE` caught the word in narration — *the residue that is ALREADY
 * THERE* is prose ABOUT a residue, not a declaration of one.
 *
 * WHY FIXTURES AND NOT THE LIVE LEDGER: the live answer changes every time anyone lands a row,
 * so an assertion against it would be a date-stamped snapshot that fails for the wrong reason.
 * The estate is walked once, separately, and only asserted to be NON-EMPTY and well-formed —
 * an arm that found nothing there would satisfy every fixture arm above it.
 *
 * NEGATIVE CONTROL: (all six RUN 2026-09-17 by BOB #13, exit 0, 33 pass / 0 fail, both baselines
 * green) `node bio-plane/test/owed.control.mjs` from the repo root — six arms, each armed ALONE
 * against a pristine copy in `.d409-harness/`, every restore verified by sha256 AND `cmp` AND a
 * floored byte count.
 *   (A1) the owner test matches the row BODY again -> S1 fails: the measured 58-item defect,
 *        where a row whose body NARRATES an assignment is read as carrying one.
 *   (A2) a bare `RESIDUE` marker -> S2 fails: the measured 28-item defect, where prose ABOUT a
 *        residue counts as a declaration of one.
 *   (A3) the CLOSED-row filter removed -> S3 fails: a resolved row is owed forever, which is how
 *        a worklist stops being read.
 *   (A4) the residue exemption on a closed row removed -> S3 fails: closing a row would erase its
 *        own honest remainder.
 *   (A5) an UNREADABLE ledger reported as an EMPTY one -> S5 fails. The arm that would silently
 *        STOP the lane, and the rule this whole family of instruments turns on.
 *   (A6) THE PRECISION ARM — every judged row returned as owed, so the list is complete and
 *        useless. A sensitivity control does not notice; only this does.
 *
 * **THE SUBJECT'S HEADER FIRST CITED THAT DRIVER BEFORE IT EXISTED** — a citation to a control
 * nobody could run, which is the false-absence class this family exists to catch, committed by a
 * file in the family. Corrected to say so, then built. A declared control is a CLAIM; the
 * artifact is the only witness.
 */

import "./stdio.mjs";
import "./sandbox.mjs";
import { owedFor, owedMessage, OWNER_RE, RESIDUE_RE, SOURCES } from "../../tools/owed.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 6;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

/* A reader over fixtures: the estate's own ledgers are never written by any arm. */
const fixture = (files) => (p) => (p in files ? files[p] : null);
const DEBT = (rows) => ["| id | type | date | body | disposition |", ...rows].join("\n");
const ids = (o) => o.items.map((i) => i.id).sort();

/* ========================================================================== */
section("1 — A DISPOSITION THAT ROUTES WORK TO A LANE IS OWED; ONE THAT MERELY MENTIONS IT IS "
      + "NOT. The first version matched the row BODY and returned 58 items, because every row "
      + "in this ledger quotes Bob.");
{
  const debt = DEBT([
    "| D-1 | gap | 2026-09-17 | Bob, 2026-08-01 — the ORIGINAL plan routed to BOB and he handed it back; that is history, not an assignment | M4 · open |",
    "| D-2 | gap | 2026-09-17 | some body | M4 · open — routed to BOB |",
    "| D-3 | gap | 2026-09-17 | another body | M4 · open — blocked on BOB |",
    "| D-4 | gap | 2026-09-17 | another body | M4 · open — owed by this lane |",
  ]);
  const o = owedFor("BOB", { reader: fixture({ [SOURCES.debt]: debt,
                                               [SOURCES.decisions]: "", [SOURCES.queue]: "" }) });
  t("a row whose DISPOSITION routes to the lane is owed", ids(o).includes("D-2"), true);
  t("...and 'blocked on' counts", ids(o).includes("D-3"), true);
  t("...and 'owed by this lane' counts", ids(o).includes("D-4"), true);
  /* The body says "routed to BOB" as HISTORY. Only the disposition ASSIGNS, so a predicate
     reading the body cannot tell a narrated assignment from a live one. */
  t("A ROW THAT ONLY QUOTES BOB IN ITS BODY IS NOT OWED — the 58-item defect",
    ids(o).includes("D-1"), false);
  t("...so exactly three of four, which is discrimination rather than an empty or full walk",
    o.counts.owed, 3);
}

/* ========================================================================== */
section("2 — A DECLARED RESIDUE IS OWED; THE WORD 'RESIDUE' IN NARRATION IS NOT. The second "
      + "narrowing: 28 items became 14.");
{
  const debt = DEBT([
    "| D-10 | gap | 2026-09-17 | body | M0 · FIXED — and the residue that is ALREADY THERE was handled |",
    "| D-11 | gap | 2026-09-17 | body | M0 · open — STILL OPEN: the arm is undriven |",
    "| D-12 | gap | 2026-09-17 | body | M0 · done — RESIDUE, NAMED: nothing asserts it |",
    "| D-13 | gap | 2026-09-17 | body | M0 · open — NOT CLAIMED DONE: the wiring is unproven |",
  ]);
  const o = owedFor("BOB", { reader: fixture({ [SOURCES.debt]: debt,
                                               [SOURCES.decisions]: "", [SOURCES.queue]: "" }) });
  t("'STILL OPEN' is a declared residue", ids(o).includes("D-11"), true);
  t("'RESIDUE, NAMED' is a declared residue", ids(o).includes("D-12"), true);
  t("'NOT CLAIMED DONE' is a declared residue", ids(o).includes("D-13"), true);
  t("PROSE ABOUT a residue is NOT a declaration of one — the 28-item defect",
    ids(o).includes("D-10"), false);
  t("...so three of four", o.counts.owed, 3);
}

/* ========================================================================== */
section("3 — A CLOSED ROW OWES NOTHING, HOWEVER MANY OWNER WORDS IT CARRIES — unless it declares "
      + "a residue, which is the whole point of writing one on a closed row.");
{
  const debt = DEBT([
    "| D-20 | gap | 2026-09-17 | body | M0 · CLOSED 2026-09-17 — routed to BOB originally |",
    "| D-21 | gap | 2026-09-17 | body | M0 · FIXED AND CONFIRMED — blocked on BOB before |",
    "| D-22 | gap | 2026-09-17 | body | M0 · CLOSED — STILL OPEN: the second half is unbuilt |",
  ]);
  const o = owedFor("BOB", { reader: fixture({ [SOURCES.debt]: debt,
                                               [SOURCES.decisions]: "", [SOURCES.queue]: "" }) });
  t("a CLOSED row is not owed", ids(o).includes("D-20"), false);
  t("...nor a FIXED AND CONFIRMED one", ids(o).includes("D-21"), false);
  t("BUT a closed row DECLARING a residue still is — else closing a row would erase its own "
  + "honest remainder", ids(o).includes("D-22"), true);
  t("...exactly one survives, so the closed-filter is not eating everything", o.counts.owed, 1);
}

/* ========================================================================== */
section("4 — THE OTHER TWO LEDGERS. An open decision is owed; an answered one is not. A blocked "
      + "queue row is owed only when it names the lane.");
{
  const dec = "### DEC-90 · open\nbody\n### DEC-91 · answered\nbody\n";
  const q = "### REC-1 · blocked — BLOCKED ON BOB, ruled 2026-09-17\n"
          + "### REC-2 · blocked — waiting on RECORD's other item\n"
          + "### REC-3 · queued — blocked on BOB is only prose here, the state is queued\n";
  const o = owedFor("BOB", { reader: fixture({ [SOURCES.debt]: DEBT([]),
                                               [SOURCES.decisions]: dec, [SOURCES.queue]: q }) });
  t("an OPEN decision is owed", ids(o).includes("DEC-90"), true);
  t("an ANSWERED decision is not", ids(o).includes("DEC-91"), false);
  t("a BLOCKED row naming the lane is owed", ids(o).includes("REC-1"), true);
  t("a BLOCKED row naming someone else is not", ids(o).includes("REC-2"), false);
  t("a QUEUED row is not, whatever its prose says — the state is the gate",
    ids(o).includes("REC-3"), false);
}

/* ========================================================================== */
section("5 — AN UNREADABLE LEDGER IS NOT AN EMPTY ONE. The rule this whole family of instruments "
      + "turns on, and the one a worklist must never get wrong: silence would read as 'nothing "
      + "owed' and stop the lane.");
{
  const o = owedFor("BOB", { reader: fixture({ [SOURCES.decisions]: "", [SOURCES.queue]: "" }) });
  t("the unreadable ledger is NAMED", o.unreadable, [SOURCES.debt]);
  t("...and counted", o.counts.unreadable, 1);
  t("...and the message says UNKNOWN rather than reporting an empty list",
    /UNKNOWN/.test(owedMessage(o)), true);
  t("...and explicitly refuses the inference", /not an empty one/.test(owedMessage(o)), true);
}

/* ========================================================================== */
section("6 — THE LIVE ESTATE. An arm that found nothing here would satisfy every fixture arm "
      + "above it, so the real ledgers are walked and asserted NON-EMPTY.");
{
  const o = owedFor("BOB");
  t("every ledger was readable", o.unreadable, []);
  t("the walk is NON-EMPTY — the estate does owe this lane something", o.counts.owed > 0, true);
  t("...and every item carries a source, an id and a reason",
    o.items.every((i) => i.source && i.id && i.why), true);
  t("...and the message tells the lane not to stop", /no\n        boundary to stop at/.test(owedMessage(o)), true);
  /* The empty case must still be expressible, or "keep going" could never terminate. */
  const empty = owedFor("NOSUCHLANE", { reader: () => DEBT([]) });
  t("a lane owing nothing gets the EMPTY message, so the rule can terminate",
    /the list is empty/i.test(owedMessage(empty)), true);
  t("the owner and residue patterns are declared once",
    [OWNER_RE("BOB") instanceof RegExp, RESIDUE_RE instanceof RegExp], [true, true]);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`owed: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

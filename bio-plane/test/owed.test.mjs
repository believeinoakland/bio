/* GATE: never-cache (history) — M0-126, BOB #30 (TREE-SHARING §3a condition 1): its verdict reads `origin/coord` through the coord layer (§6's live estate) and pinned historical commits, which no
   result key can name; traced 2026-09-23. M0-136 (2026-09-23): it no longer reads the LIVE `origin/coord` — the coord state
   is read at `COORD_PIN` (`./coordpin.mjs`, named there with its why and its cost), and a planted-ref arm below proves the
   verdict identical whatever `origin/coord` holds.
   NEGATIVE CONTROL (M0-136, RUN 2026-09-23 by the M0-136 worker): `node bio-plane/test/coordpin.control.mjs owed` —
   this suite pointed back at the live `origin/coord` (arm L1, one line after the pin's import) -> exactly two FAILs,
   "…reads the PINNED coord commit, never a ref name" and "…is IDENTICAL whatever origin/coord holds", 49 pass / 2 fail, exit 1;
   the pin spelled out in the suite instead (S0, over-strictness) PASSES; each restored, sha256 and `cmp` identical. */
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
 * green; all SEVEN re-RUN 2026-09-18 by BOB #14 with A7 added, exit 0, 38 pass / 0 fail;
 * all EIGHT re-RUN the same day with A8 added) `node bio-plane/test/owed.control.mjs` from the repo root — ten arms, each armed ALONE
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
 *   (A7) the owner pattern case-INSENSITIVE again -> S7 fails: Bob the PERSON read as the BOB
 *        lane, which is what all four rows BOB #13 handed over as attributed actually were.
 *   (A8) the blocked-row heading read to 220 characters again -> S7 fails: REC-100's routing
 *        to BOB sat past that point and the lane was told it owed nothing.
 *   (A9) the possessive allowed to be followed by a noun -> S7 fails: *IS BOB'S FRAMING* read as the BOB lane.
 *   (All nine RE-RUN 2026-09-19 by the M0-73 worker after A8's anchor was repointed to the lister-fed
 *   `rest` — owed's blocked rows now come from `ledger.mjs`' `pipelineRows` — exit 0, 48 pass / 0 fail,
 *   suite 42/0 at both baselines, restore verified by sha256.)
 *   (A10) the discharge ignored again -> S8 fails at *A ROW CARRYING AN OWNER PHRASE AND A DISCHARGE
 *        FOR THE LANE IS NOT ATTRIBUTED*: D-134's false listing (D-435). The per-lane arm's CONDUCT
 *        half fails with it by construction; the over-strictness, per-lane BOB and case assertions are
 *        asserted to HOLD, each as a PASS line.
 *   (A10 added and A1 re-aimed at the line the discharge changed; all ten RUN 2026-09-21 by BOB #22,
 *   exit 0, 57 pass / 0 fail, suite 47/0 at both baselines, every restore verified by sha256 AND `cmp`
 *   AND a floored byte count. A10 armed alone outside the driver, which prints no per-arm tally: suite
 *   exit 1, 45 pass / 2 fail, exactly the two declared.)
 *
 * **AND SECTION 7 IS A DISCRIMINATION CONTROL THE TOOL SHIPPED WITHOUT, which is why it was
 * WRONG.** `owed.mjs ZZZNOTALANE` returned ELEVEN items — a lane that does not exist cannot
 * owe anything — because the summary summed two populations under one label. The author read
 * that headline and told another lane it owed 12 things within the hour. Found by CONDUCT #3.
 * **An assertion that only ever asks about REAL lanes cannot tell a working filter from no
 * filter at all**, which is M0-54's liar's check: it passed 9/9 with no power.
 *
 * **THE SUBJECT'S HEADER FIRST CITED THAT DRIVER BEFORE IT EXISTED** — a citation to a control
 * nobody could run, which is the false-absence class this family exists to catch, committed by a
 * file in the family. Corrected to say so, then built. A declared control is a CLAIM; the
 * artifact is the only witness.
 */

import "./stdio.mjs";
import "./sandbox.mjs";
import { owedFor, owedMessage, OWNER_RE, RESIDUE_RE, SOURCES } from "../../tools/owed.mjs";
import { plantedCoord, assertPlanted, REPO as PIN_REPO } from "./coordpin.mjs";   /* M0-136: coord read at a PINNED commit */

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
/* 7 since M0-140 (2026-09-24), was 9: §2 and §3 are retired with the DEBT construct and the residue population —
   the note above §1' says what they measured and where what survives is driven. §1 became §1', re-pointed onto a
   blocked plan row's heading. This count is the guard that a section did not silently stop running, so it moves to
   the number of sections that EXIST, never to the number that happened to run. */
const SECTIONS = 7;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

/* A reader over fixtures: the estate's own ledgers are never written by any arm. */
/* CORRECTED 2026-09-18 by LED-6: owed now reads the BACKLOG beside the QUEUE (the pipeline cache
   may hold no `blocked` row, so after the migration every blocked row lives in the backlog). These
   fixtures predate it and state what a QUEUE yields, so a fixture that supplies the QUEUE and does not
   name the BACKLOG supplies an EMPTY one; naming it `null` makes it unreadable, which section 5 drives. */
const fixture = (files) => { const all = SOURCES.queue in files && !(SOURCES.backlog in files) ? { ...files, [SOURCES.backlog]: "" } : files;
                             return (p) => (p in all ? all[p] : null); };
const DEBT = (rows) => ["| id | type | date | body | disposition |", ...rows].join("\n");
const ids = (o) => o.items.map((i) => i.id).sort();

/* ==========================================================================

   SECTIONS 1, 2 and 3 WERE HERE, and are RE-POINTED (1) or RETIRED (2, 3) by M0-140, 2026-09-24, with the DEBT
   construct. All three drove `owedFor` over a fixture DEBT ledger, and `owed.mjs` reads no DEBT source any more.

   §1 — *a disposition that ROUTES work to a lane is owed; one that merely MENTIONS it is not* (the 58-item defect:
   the first version matched the row BODY, and every row in that ledger quoted Bob). The RULE is `OWNER_RE`'s and is
   untouched; only its subject moved, from a disposition cell to a BLOCKED PLAN ROW's heading, which is the one
   attribution source left. It is driven in §1' below, on that subject, with the body/heading distinction intact —
   the walk reads the heading line and nothing else, so a mention in the row's body still cannot assign.

   §2 — *a declared residue is owed; the word RESIDUE in narration is not* (the second narrowing, 28 items to 14) —
   and §3 — *a closed row owes nothing however many owner words it carries, unless it declares a residue*. Both are
   RETIRED, and what they measured is stated plainly rather than quietly dropped: THE RESIDUE POPULATION IS GONE.
   A residue was a DEBT disposition declaring an unfinished half, and there are no DEBT dispositions; `owedFor`
   now returns `residue: []` for every lane, always. Nothing replaces it and nothing should — a plan row with an
   unfinished half is a plan row that is not `done`, which P1-P5 already judge.

   NEITHER PREDICATE IS UNGUARDED BY THIS. `RESIDUE_RE` and `isClosedDebtRow` are still the ONE definition of a
   closed DEBT row, still applied by `ledger.mjs`' `debtRows` when `find` reads the archive, and their spellings —
   every CLOSED form, every open form, and the four M-57 rows that read resolved WHILE declaring a residue — are
   driven in `ledger.test.mjs` §3, which is where that definition now lives.
   ========================================================================== */

/* ========================================================================== */
section("1' — A HEADING THAT ROUTES WORK TO A LANE IS OWED; ONE THAT MERELY MENTIONS IT IS NOT. "
      + "§1's rule, on the subject that survives: a blocked plan row's heading (M0-140).");
{
  const q = "### R-1 · blocked — M4, waiting on a measurement\n"
          + "Bob, 2026-08-01 — the ORIGINAL plan was routed to BOB and he handed it back; that is history,\n"
          + "not an assignment, and it sits BELOW the heading where the walk does not read.\n"
          + "### R-2 · blocked — M4, routed to BOB\n"
          + "### R-3 · blocked — M4, blocked on BOB\n"
          + "### R-4 · blocked — M4, and it is owed by this lane\n";
  const o = owedFor("BOB", { reader: fixture({ [SOURCES.decisions]: "", [SOURCES.queue]: q }) });
  t("a row whose HEADING routes to the lane is owed", ids(o).includes("R-2"), true);
  t("...and 'blocked on' counts", ids(o).includes("R-3"), true);
  /* CORRECTED 2026-09-24 by M0-140, not exempted: §1 asserted that `owed by this lane` COUNTS. It counted as
     RESIDUE, never as attribution — the phrase means *the lane that wrote this row*, which this tool cannot
     determine, and putting it in the owner pattern was the last leak (a NONEXISTENT lane came back with an
     attributed item). With the residue population retired there is nothing for it to count AS, so the assertion
     is inverted to what is now true, with the reason named. */
  t("...and 'owed by this lane' counts as NOTHING now — it was RESIDUE, and the residue population is retired",
    ids(o).includes("R-4"), false);
  /* The row's SECOND LINE says "routed to BOB" as HISTORY. The walk reads the HEADING and stops, so a narrated
     assignment in the body cannot be told from a live one — and is therefore never read at all. */
  t("A ROW THAT ONLY QUOTES BOB BELOW ITS HEADING IS NOT OWED — the 58-item defect",
    ids(o).includes("R-1"), false);
  t("...so exactly two of four, which is discrimination rather than an empty or full walk", o.counts.owed, 2);
  t("...and the residue population is empty, for every lane, always (M0-140)", o.counts.residue, 0);
}

/* ========================================================================== */
section("4 — THE OTHER TWO LEDGERS. An open decision is owed; an answered one is not. A blocked "
      + "queue row is owed only when it names the lane.");
{
  const dec = "### DEC-90 · open\nbody\n### DEC-91 · answered\nbody\n";
  const q = "### REC-1 · blocked — BLOCKED ON BOB, ruled 2026-09-17\n"
          + "### REC-2 · blocked — waiting on RECORD's other item\n"
          + "### REC-3 · queued — blocked on BOB is only prose here, the state is queued\n";
  const o = owedFor("BOB", { reader: fixture({ [SOURCES.decisions]: dec, [SOURCES.queue]: q }) });
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
  /* CORRECTED 2026-09-24 by M0-140: the unreadable ledger this section named was `DEBT.md`, which is retired.
     The RULE is the one this whole family of instruments turns on and it is unchanged — an unreadable source is
     NAMED, counted and reported as UNKNOWN, never as an empty list — so it is driven on a source that still
     exists. An absent DECISIONS.md is the same shape the DEBT case was: readable-or-not, never assumed empty. */
  const o = owedFor("BOB", { reader: fixture({ [SOURCES.queue]: "", [SOURCES.backlog]: "" }) });
  t("the unreadable ledger is NAMED", o.unreadable, [SOURCES.decisions]);
  t("...and counted", o.counts.unreadable, 1);
  t("...and the message says UNKNOWN rather than reporting an empty list",
    /UNKNOWN/.test(owedMessage(o)), true);
  t("...and explicitly refuses the inference", /not an empty one/.test(owedMessage(o)), true);
  /* LED-6: the backlog is a source, and a MISSING backlog is unreadable, never an empty one. */
  const nb = owedFor("BOB", { reader: fixture({ [SOURCES.decisions]: "", [SOURCES.queue]: "", [SOURCES.backlog]: null }) });
  t("an unreadable BACKLOG is NAMED too (LED-6)", nb.unreadable, [SOURCES.backlog]);
  const bl = owedFor("BOB", { reader: fixture({ [SOURCES.decisions]: "", [SOURCES.queue]: "",
    [SOURCES.backlog]: "### REC-8 · blocked — waits on a ruling. Routed to BOB.\n" }) });
  t("a blocked row in the BACKLOG routed to the lane is owed, sourced BACKLOG (LED-6)",
    bl.attributed.map((i) => `${i.source} ${i.id}`), ["BACKLOG REC-8"]);
}

/* ========================================================================== */
section("6 — THE LIVE ESTATE. The real ledgers are walked and every one is READABLE — the "
      + "NON-EMPTY floor is retired with the source that guaranteed it (M0-140).");
{
  const o = owedFor("BOB");
  t("every ledger was readable", o.unreadable, []);
  /* CORRECTED 2026-09-24 by M0-140, not exempted, and this is the assertion that pays for the retirement being
     stated rather than assumed. It read: *the walk is NON-EMPTY — the estate does owe this lane something*, and it
     existed because an arm finding nothing here would satisfy every fixture arm above it. It is RETIRED rather
     than re-pointed, because it would now be a floor that FAILS WHEN THE ESTATE IS HEALTHY. With DEBT retired,
     `owedFor`'s only sources are OPEN DECISIONS and BLOCKED plan rows, and BOTH ARE LEGITIMATELY ZERO — measured
     on `origin/main` 68fecb8d: 0 attributed and 0 residue for BOB, CONDUCT, SCHEDULER, DIST, FLEET, UI, CAPTURE,
     FRAMEWORK, CONTENT-PDF, RECORD and M0 alike. A ledger that is empty because nobody owes anything is not the
     empty-corpus liar this floor was written to catch; the liar is a walk that reads nothing and says so. So the
     READABILITY arm above keeps that duty — it is the half that distinguishes *nothing owed* from *nothing read*
     — and the discrimination this section guarded is driven on fixtures in §1' and §7, which cannot go vacuous. */
  t("...and every item it did find carries a source, an id and a reason",
    o.items.every((i) => i.source && i.id && i.why), true);
  /* CORRECTED 2026-09-17, not exempted: the message was rewritten to count the two populations
     apart (the discrimination-control fix), so the old phrase "no boundary to stop at" is gone.
     The old assertion was pinning WORDING; this one pins the two things that must survive any
     rewrite — the rule it serves, and the fact that it names both populations. */
  t("...and the message names the rule it serves", /rule 10/.test(owedMessage(o)), true);
  /* CORRECTED 2026-09-24 by M0-140: this read the LIVE message, which is now the EMPTY one (the estate owes BOB
     nothing — see the retired floor above), and an empty message names no populations. The property is the
     message's, not the estate's, so it is driven on a list that HAS an item. */
  t("...and reports BOTH populations rather than one summed figure",
    /ATTRIBUTED to this lane, plus \d+ open residue/.test(owedMessage(
      owedFor("BOB", { reader: fixture({ [SOURCES.decisions]: "", [SOURCES.queue]: "### R-6 · blocked — routed to BOB\n" }) }))), true);
  /* The empty case must still be expressible, or "keep going" could never terminate. */
  const empty = owedFor("NOSUCHLANE", { reader: () => "" });
  t("a lane owing nothing gets the EMPTY message, so the rule can terminate",
    /the list is empty/i.test(owedMessage(empty)), true);
  t("the owner and residue patterns are declared once",
    [OWNER_RE("BOB") instanceof RegExp, RESIDUE_RE instanceof RegExp], [true, true]);
}

/* ========================================================================== */
section("7 — THE DISCRIMINATION CONTROL. A NONEXISTENT LANE MUST BE ATTRIBUTED NOTHING — and "
      + "this arm exists because the tool shipped WITHOUT it and was wrong: `owed.mjs "
      + "ZZZNOTALANE` returned ELEVEN items, the author read the headline, and told another "
      + "lane it owed 12 things within the hour.");
{
  /* RE-POINTED 2026-09-24 by M0-140 onto blocked plan rows, the attribution source that survives. The two
     RESIDUE rows this fixture carried (`STILL OPEN`, `owed by this lane`) are dropped with the residue
     population; what they guarded — that a NONEXISTENT lane is attributed NOTHING while a real one is — is the
     arm itself, and it is intact. */
  const q = "### R-30 · blocked — M0, routed to BOB\n"
          + "### R-31 · blocked — M0, waiting on nobody in particular\n"
          + "### R-32 · blocked — M0, blocked on CONDUCT for the spawn\n";
  const files = { [SOURCES.decisions]: "", [SOURCES.queue]: q };
  const real = owedFor("BOB", { reader: fixture(files) });
  const fake = owedFor("ZZZNOTALANE", { reader: fixture(files) });

  t("a real lane IS attributed its own row", real.attributed.map((i) => i.id), ["R-30"]);
  t("A NONEXISTENT LANE IS ATTRIBUTED NOTHING", fake.attributed.length, 0);
  /* Without this pairing the arm is a liar's check: an assertion that only ever asks about REAL
     lanes cannot tell a working filter from no filter at all. */
  /* The lane-independent RESIDUE half of this pairing WAS HERE (both runs seeing the same two residue rows, and
     `owed by this lane` reading as residue rather than attribution). Retired with the population, M0-140. The
     PAIRING itself — the thing that tells a working filter from no filter — is what matters and is above. */
  t("...and neither run invents a residue now: the population is retired, so both are empty (M0-140)",
    [real.counts.residue, fake.counts.residue], [0, 0]);
  t("...so the totals differ by exactly the attributed item",
    real.counts.owed - fake.counts.owed, 1);
  /* A SECOND REAL LANE in the same run, so the filter is shown to discriminate BETWEEN lanes and not merely
     between a lane and a non-lane — R-32 waits on CONDUCT and on nobody else. */
  t("...and a DIFFERENT real lane gets its own row and not BOB's",
    owedFor("CONDUCT", { reader: fixture(files) }).attributed.map((i) => i.id), ["R-32"]);
  /* THE PERSON IS NOT THE LANE (2026-09-18). Under a whole-pattern `i` flag, *is Bob's* matched the
     BOB lane, and all four rows handed to BOB #14 as attributed were false matches of this kind. */
  const person = owedFor("BOB", { reader: fixture({ [SOURCES.decisions]: "", [SOURCES.queue]:
      "### R-33 · blocked — M0, the decision about what it MEANS is Bob's or CONDUCT's\n"
    + "### R-34 · blocked — M0, the INTERVENTION IS BOB'S to run\n" }) });
  t("BOB THE PERSON IS NOT THE BOB LANE — 'is Bob's' attributes nothing, 'IS BOB'S' still does",
    person.attributed.map((i) => i.id), ["R-34"]);
  /* ALL-CAPS PROSE: a possessive followed by a NOUN is the person's possession, not an assignment
     (D-127 "IS BOB'S FRAMING", D-296 "is CONDUCT's own"); followed by a preposition it IS one
     (D-283 "the correction is CONDUCT's at integration"). */
  const caps = owedFor("BOB", { reader: fixture({ [SOURCES.decisions]: "", [SOURCES.queue]:
      "### R-35 · blocked — M0, THIS IS BOB'S FRAMING OF THE PROBLEM\n"
    + "### R-36 · blocked — M0, the correction is BOB's at integration\n"
    + "### R-37 · blocked — M0, THE ACT IS BOB'S, NOT ANYONE ELSE'S\n" }) });
  t("A POSSESSIVE FOLLOWED BY A NOUN IS NOT AN ASSIGNMENT; one followed by a preposition or ending the clause IS",
    caps.attributed.map((i) => i.id).sort(), ["R-36", "R-37"]);
  /* A BLOCKED QUEUE ROW IS READ TO THE END OF ITS HEADING (2026-09-18). REC-100's routing sat past
     character 220 of a heading carrying its history, and the truncated read attributed nothing. */
  const deep = owedFor("BOB", { reader: fixture({ [SOURCES.decisions]: "",
    [SOURCES.queue]: "### REC-9 · blocked — " + "history of the row, kept as the record. ".repeat(12)
                   + "BLOCKED ON A DESIGN RULING. Routed to BOB.\n" }) });
  t("A ROUTING DEEP IN A LONG BLOCKED HEADING IS STILL OWED — the REC-100 false absence",
    deep.attributed.map((i) => i.id), ["REC-9"]);
  /* The headline is the thing that was wrong, so the headline is asserted. */
  t("the message counts the two populations APART — and says 0 residue rather than omitting the population",
    /ATTRIBUTED to this lane, plus 0 open residue/.test(owedMessage(real)), true);
  t("...and says why they are counted apart, so the next reader does not re-sum them",
    /costs nothing to produce/.test(owedMessage(real)), true);
}

/* ========================================================================== */
section("8 — A DISCHARGE BY NAME ENDS ONE LANE'S PART, AND ONLY THAT LANE'S (D-435). The tool "
      + "could attribute but never discharge, so an OPEN row that once said ROUTED TO BOB owed BOB "
      + "forever: D-134 said 'Nothing on this row falls to the BOB lane' and stayed on the list.");
{
  /* A MINIMAL PAIR: D-40 is D-41 plus the discharge sentence and nothing else, so the one variable
     between them is the one under test. The shared text carries the near-misses a WIDENED pattern
     would take — 'Nothing' and 'falls to' in prose that discharges nobody, and 'the BOB lane' outside
     the form — so the liar's fix (widen until the count drops) fails the over-strictness arm. */
  /* RE-POINTED 2026-09-24 by M0-140 from a DEBT disposition to a BLOCKED PLAN ROW's heading — the same prose, the
     same predicate, the subject that survives the construct's retirement. D-435's rule is not about DEBT: it is
     that a tool which can attribute but never discharge owes a lane a row for ever. */
  const base = "M4, ROUTED TO BOB 2026-09-20: the ceremony is a design call for the BOB lane. "
             + "Nothing is placeable until it is ruled; the build then falls to UI.";
  const q = `### R-40 · blocked — ${base} Nothing on this row falls to the BOB lane.\n`
          + `### R-41 · blocked — ${base}\n`
          + "### R-42 · blocked — M4, routed to BOB for the ruling and routed to CONDUCT for the spawn. Nothing on this row falls to CONDUCT.\n"
          + "### R-43 · blocked — M4, ROUTED TO BOB for the ruling; nothing here falls to Bob the person.\n"
          + "### R-44 · blocked — M4, routed to CONDUCT for the spawn.\n";
  const files = { [SOURCES.decisions]: "", [SOURCES.queue]: q };
  const bob = owedFor("BOB", { reader: fixture(files) }).attributed.map((i) => i.id);
  const conduct = owedFor("CONDUCT", { reader: fixture(files) }).attributed.map((i) => i.id);
  /* The not-attributed half is asserted beside a FOUND item from the same run, never alone. */
  t("A ROW CARRYING AN OWNER PHRASE AND A DISCHARGE FOR THE LANE IS NOT ATTRIBUTED — D-134's false listing",
    [bob.includes("R-41"), bob.includes("R-40")], [true, false]);
  t("OVER-STRICTNESS: the same disposition WITHOUT the discharge IS attributed, near-misses and all",
    bob.includes("R-41"), true);
  t("A DISCHARGE IS PER-LANE — a row discharged for CONDUCT is still attributed to BOB, which it also routes to",
    bob.includes("R-42"), true);
  t("...and it IS discharged for CONDUCT, whose undischarged row is attributed in the same run",
    [conduct.includes("R-44"), conduct.includes("R-42")], [true, false]);
  t("BOB THE PERSON DISCHARGES NOTHING — 'nothing here falls to Bob' leaves the row the BOB lane's",
    bob.includes("R-43"), true);
}

/* ========================================================================== */
section("9 — M0-136: THE LIVE-ESTATE WALK READS THE PINNED COORD COMMIT, AND ITS VERDICT DOES NOT MOVE WITH origin/coord");
{
  /* §6 walks the REAL ledgers through the coord layer, and until M0-136 that meant the LIVE `origin/coord`: its
     verdict was a claim about what the lanes had written that minute. The probe is §6's own call, `owedFor("BOB")`.
     RE-POINTED 2026-09-24 by M0-140: the plant emptied `DEBT.md`, and `owed.mjs` no longer reads DEBT at all — the
     plant would have moved nothing, which is an arm that does not arm, and the "moves it when read directly" half
     below is exactly the assertion that caught it. The plant now writes a BLOCKED row routed to BOB into
     `BACKLOG.md`, a source owed DOES read through the coord layer, so it moves the list in the other direction:
     from empty to one attributed item. */
  const p = plantedCoord({
    probe: `const { owedFor } = await import(${JSON.stringify(PIN_REPO + "/tools/owed.mjs")});\nconst o = owedFor("BOB");\nconsole.log(JSON.stringify({ counts: o.counts, unreadable: o.unreadable, items: o.items.map((i) => i.source + ":" + i.id) }));`,
    plant: { "docs/development/BACKLOG.md": "# Backlog\n\n### ZZ-1 · blocked — planted by M0-136, routed to BOB\n\nscope: a planted row\n" } });
  assertPlanted(t, "owed", p);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`owed: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

/* owed — what this estate is waiting on from a LANE, read out of the repository.
 *
 * RULED BY BOB 2026-09-17, and the ruling names the defect precisely: *"You say you fixed your
 * idleness, and then fell idle. This isn't just a bug in idleness, but a failure to document (in
 * the repo) and follow the commitments you've made."*
 *
 * ------------------------------------------------------------ THE DEFECT, WHICH IS NOT IDLENESS
 *
 * `kickoffs/BOB.md` rule 10 says keep going while the list is non-empty. **THERE WAS NO LIST.**
 * This lane's commitments lived in prose — *next on my list is the corpus sweep*, said in a
 * message, recorded nowhere a gate could read. So *the list is non-empty* was a thing a session
 * had to REMEMBER, and the rule was broken in the same turn it was written.
 *
 * **A COMMITMENT IN A MESSAGE IS THE SAME CLASS AS A MECHANISM IN A DOCUMENT NOBODY EXECUTES**
 * (`CLAUDE.md`), and this estate has now met it three times in one day: a protocol change that
 * reached no successor, a guard absent from the checkouts that needed it, and this. **The
 * repository is the channel — for obligations exactly as for code.**
 *
 * ------------------------------------------------------------------- WHAT IT READS, AND WHY THOSE
 *
 * It does NOT invent a new ledger. **Every commitment this lane makes is ALREADY written down**;
 * what was missing was any way to see them together:
 *
 *   - `DEBT.md` dispositions that name a lane as the owner — *routed to BOB*, *owed by this lane*,
 *     *blocked on BOB*, *is BOB's*, *STILL OPEN*.
 *   - `DECISIONS.md` entries still `open`, which are by construction Bob's and this lane's to
 *     surface.
 *   - the plan's rows (`QUEUE.md` and `BACKLOG.md`, read through `ledger.mjs`' one lister since
 *     M0-73) whose state is `blocked` and whose heading names a lane.
 *
 * **THE RESIDUE LINES ARE THE MOST IMPORTANT SOURCE AND THE EASIEST TO LOSE.** A row that says
 * *STILL OPEN AND NOT CLAIMED DONE: …* is a session being honest about what it did not finish, and
 * on 2026-09-17 six such lines existed and none was reachable except by reading every row. They
 * are promises, and a promise nobody can enumerate is a promise nobody keeps.
 *
 * ---------------------------------------------------------------------- WHAT IT IS NOT
 *
 * **It is not a scheduler and it does not rank.** Sequencing is the lane's own judgement (Bob,
 * 2026-07-31). It answers one question — *is there anything left* — so that the answer stops
 * depending on what a session happens to remember, and it prints the items so the lane can
 * choose among them.
 *
 * **And it never scores an unreadable file as clean**, which is the rule this whole family of
 * instruments turns on.
 *
 * NEGATIVE CONTROL: (all six RUN 2026-09-17 by BOB #13, exit 0, 33 pass / 0 fail, both
 * baselines green) `node bio-plane/test/owed.control.mjs` from the repo root.
 *   (A1) the owner test matches the row BODY again -> the 58-item defect: a row whose body
 *        NARRATES an assignment is read as carrying one.
 *   (A2) a bare `RESIDUE` marker -> the 28-item defect: prose ABOUT a residue counts as one.
 *   (A3) the CLOSED-row filter removed -> a resolved row is owed forever.
 *   (A4) the residue exemption on a closed row removed -> closing a row erases its own
 *        honest remainder.
 *   (A5) an UNREADABLE ledger reported as an EMPTY one -> the arm that would silently STOP
 *        the lane, and the rule this whole family turns on.
 *   (A6) THE PRECISION ARM — every judged row returned as owed, so the list is complete and
 *        useless. A sensitivity control does not notice; only this does.
 *   (A7) the owner pattern case-INSENSITIVE again -> Bob the PERSON is read as the BOB lane.
 *   (A8) a blocked queue heading read only to 220 characters -> a routing past that point is lost.
 *   (A9) the possessive allowed to be followed by a noun -> *IS BOB'S FRAMING* is attributed to the lane.
 *   (A7..A9 added and all nine RUN 2026-09-18 by BOB #14, exit 0, 43 pass / 0 fail.)
 *   (All eight RE-RUN 2026-09-18 by the LED-2 worker after A3's anchor was repointed to the one
 *   `isClosedDebtRow` call site, exit 0, 43 pass / 0 fail, restore verified by sha256.)
 *   (A10) the discharge ignored again -> an OPEN row that once said *ROUTED TO BOB* owes BOB forever,
 *        whatever a later sentence in its cell says: D-134's false listing (D-435).
 *   (A10 added and A1 re-aimed at the line the discharge changed; all ten RUN 2026-09-21 by BOB #22,
 *   exit 0, 57 pass / 0 fail, suite 47/0 at both baselines, restore verified by sha256 AND cmp.)
 *
 * **THE HEADER FIRST CITED THIS FILE BEFORE IT EXISTED**, which is the false-absence class this
 * family exists to catch, committed by a file in the family. Corrected to say so, then built.
 * A declared control is a CLAIM; the artifact is the only witness.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
/* M0-73: the plan's rows come from `ledger.mjs`' ONE lister. `ledger.mjs` imports this file too (the one
   closed-DEBT predicate, below), so the import cycle is real, and harmless ONLY because nothing at this
   file's top level touches these bindings: `SOURCES.queue` and `.backlog` are GETTERS for that reason. */
import { LEDGERS, PIPELINE, pipelineRows } from "./ledger.mjs";

export const ROOT = join(new URL("..", import.meta.url).pathname);

export const SOURCES = {
  debt: "docs/development/DEBT.md",
  decisions: "docs/development/DECISIONS.md",
  /* LED-6: the pipeline cache may hold no `blocked` row (WORK-PIPELINE §2, invariant P3), so once
     the migration lands EVERY blocked row lives in the backlog — read both, or this list empties.
     M0-73: both paths are `ledger.mjs`' own, never spelled here, so they cannot drift from the lister's. */
  get queue() { return LEDGERS.QUEUE.live; },
  get backlog() { return LEDGERS.BACKLOG.live; },
};

/* The phrases this corpus ALREADY uses to say a lane owes something. Derived by reading the rows
   that existed on 2026-09-17, not invented — an owner-marker nobody writes is one nobody reads. */
/* NARROWED AFTER DRIVING IT, and the first version is the receipt for why. It matched the row
   BODY as well as the disposition, and every row in this ledger quotes Bob — *Bob, 2026-08-01*,
   *ruled by Bob* — so it returned 58 items of which most owed this lane nothing. **A worklist
   that is mostly noise is a worklist nobody reads, which is the failure mode this instrument
   exists to prevent.** So: the DISPOSITION only, and the owner phrases are the ones that assign
   rather than merely mention. A quotation is not an assignment. */
/* THE LANE TOKEN IS CASE-SENSITIVE; THE PHRASE AROUND IT IS NOT. Found 2026-09-18 by BOB #14: with
   the whole pattern under `i`, *is Bob's* — the PERSON — matched the BOB LANE, and every one of the
   four rows BOB #13 handed over as *attributed to BOB* was a false match: two quoted Bob the person
   (*the decision is Bob's or CONDUCT's*, *Bob's own words*), one named finished work, one a negation.
   Lane names in this estate are always written in capitals, and the person never is. */
/* `is <LANE>'s` IS AN ASSIGNMENT ONLY WHEN THE POSSESSIVE ENDS THE CLAUSE. Found 2026-09-18 by LED-2's
   worker once the CLOSED test was corrected: all-caps prose defeats the case-sensitive lane token —
   *"IS BOB'S FRAMING"* is Bob the PERSON's framing, and *"commit 5df12c4 is CONDUCT's own…"* is a
   possession. What follows decides it: a NOUN makes it a possession; punctuation, the end, or a
   preposition makes it an assignment — *"the correction is CONDUCT's at integration"* (D-283) is a real
   obligation and must stay. Measured over every lane before landing: exactly D-127 and D-296 drop. */
const POSSESSIVE_ENDS = String.raw`(?![ \t]+(?!(?i:at|to|for|now|alone|and|or|as|by|in|on|until|once|when|from|after|before|first|next)\b)[A-Za-z])`;
export const OWNER_RE = (lane) => new RegExp(
  String.raw`(?i:routed to (?:the\s+)?)${lane}\b`
  + String.raw`|(?i:owed by (?:the\s+)?)${lane}\b`
  + String.raw`|(?i:blocked on (?:the\s+)?)${lane}\b`
  + String.raw`|${lane}(?i:'s to |'s call| owns | to decide| to design)`
  + String.raw`|(?i:is )${lane}(?i:'s)` + POSSESSIVE_ENDS);

/* A LANE'S PART IS DISCHARGED BY NAME, AND ONLY THAT LANE'S (D-435, 2026-09-21, BOB #22). Until then this
   file could ATTRIBUTE but never DISCHARGE: an OPEN row whose disposition once said *ROUTED TO BOB* owed
   BOB forever, however plainly a later dated sentence in the same cell said that part was done — so every
   lane's worklist could only grow. D-134 is the exhibit: BOB #18 wrote *Nothing on this row falls to the
   BOB lane* on 2026-09-20, and the row stayed on BOB's list.
   THE ONE FORM THE CORPUS ALREADY WRITES, AND NOTHING ELSE. Measured 2026-09-21 over the live DEBT.md:
   exactly twice (D-134, D-398), both *Nothing on this row falls to the BOB lane.* It is as narrow as
   RESIDUE_RE was forced to be, because the liar's fix for a list that cannot shrink is a pattern wide
   enough to make the count drop: the same day, *nothing* stood outside the form in 25 live dispositions,
   and *falls to* in prose that discharges nobody (the bodies of D-63 and D-304). The phrase is case-insensitive;
   the lane token is case-sensitive and word-bounded, as in OWNER_RE and for its reason — *nothing here
   falls to Bob* is the person. The trailing ` lane` is the corpus's spelling; `\b` is what ends the token.
   PER-LANE, NOT PER-ROW: a discharge names ONE lane, so a row discharged for BOB is still attributed to
   every other lane its disposition names (D-134 remains UI's). Within its own lane it outranks an owner
   phrase wherever in the cell either stands, so a row routed BACK to a lane it discharged must have the
   discharge rewritten, not a routing appended after it — the record is made explicit, never guessed (the
   `owed by this lane` rule below). A residue marker is untouched: a discharged row that still declares
   one stays in the residue population, attributed to nobody. */
export const DISCHARGE_RE = (lane) => new RegExp(
  String.raw`(?i:\bnothing (?:on this row |here )?falls to (?:the )?)${lane}\b(?i: lane)?`);

/* TIGHTENED TWICE, BOTH TIMES BY DRIVING IT. A bare `RESIDUE` matched the word wherever it
   appeared in narration — *the residue that is ALREADY THERE*, *residue each* — which is prose
   ABOUT a residue, not a declaration of one. These are the forms that ANNOUNCE an unfinished
   obligation, and they are the forms this lane actually writes. **A marker that matches
   description as well as declaration turns a worklist into a reading list.** */
/* `owed by this lane` IS NOT AN ATTRIBUTION AND WAS THE LAST LEAK — it matched for EVERY lane,
   because the phrase means *the lane that wrote this row*, which this tool cannot determine.
   With it in the owner pattern, a NONEXISTENT lane still came back with one attributed item.
   It is real open work, so it moves to the residue population where its owner is honestly
   stated as unknown — and the row that used it has been rewritten to NAME its lane, because the
   fix for an unresolvable self-reference is to make the record explicit, not to make the tool
   guess. */
export const RESIDUE_RE = /\bowed by this lane\b|\bSTILL OPEN\b|\bSTILL OWED\b|\bNOT CLAIMED (?:DONE|CLOSED|FIXED)\b|\bRESIDUE[,:]? (?:NAMED|STATED|AND NOT)\b|\bOUTSTANDING\b/i;

/* ------------------------------------------------ THE ONE DEFINITION OF A CLOSED DEBT ROW (LED-2)

   `tools/ledger.mjs` IMPORTS THESE TWO FUNCTIONS AND DEFINES NOTHING OF ITS OWN, so the archiver
   and this instrument cannot disagree about which DEBT row owes nothing: a row the archiver may
   move out of the live ledger is, by construction, a row this file would have skipped. It lives
   HERE because "closed" for archiving means exactly "owes nothing to anybody", and this file is
   the one that defines what is owed. `ledger.test.mjs` runs both over the same ledger.

   THE DISPOSITION IS THE LAST CELL. Until LED-2 this file read `cells[5]`, which is the last cell
   only on a five-column row — and 17 live rows carry a `|` inside their body, so for them it read
   a fragment of the BODY as the disposition. `plancheck` and `planning-hygiene` have always read
   the last cell. Measured 2026-09-18: D-305, D-354, D-367 and D-385 are closed by their real
   disposition and were being judged on a body fragment.

   CLOSED IS A LEADING STATUS WORD, NOT THE WORD ANYWHERE IN THE CELL. The previous test here was
   `/\bCLOSED\b/i` anywhere, and as an ARCHIVE predicate that is a mover that deletes open work:
   measured 2026-09-18 over the live DEBT.md it called D-376 (*open, and its BLOCK IS LIFTED …
   CPDF-19 closed D-319*), D-242 (*NARROWED rather than closed*), D-361 (*not yet closed*), D-300,
   D-161 and D-292 (*DEPLOY HALF CLOSED, INSTALLER HALF IS …*) closed — 13 rows in all whose disposition does not lead with a closure word (M-58). And the
   August roll's test, *the cell lacks `open`*, is wrong the other way (M-57: D-330, D-401, D-405
   and D-407 carry a residue and would have left the owed list with nothing going red).
   So: strip the leading classification tags (`M4 ·`, `ACCEPTED ·`, `DOCTRINE · SKILL ·`, the
   tokens `plancheck` reads), and the row is closed iff the FIRST word after them is a closure word
   (CLOSED, FIXED, RESOLVED, SUPERSEDED — any case), it does not say it closed only in PART or by
   HALF, AND no residue marker appears anywhere in the disposition. Anything else is OPEN, which
   is the safe direction for a mover: a row wrongly kept live costs bytes; a row wrongly moved
   costs the owed list. */
export function debtDisposition(line) {
  const cells = String(line).replace(/\s+$/, "").replace(/\|$/, "").split("|");
  return cells.length > 1 ? cells[cells.length - 1].trim() : "";
}
const CLOSURE_HEAD = /^(?:CLOSED|FIXED|RESOLVED|SUPERSEDED)\b/i;
const PARTIAL_HEAD = /^(?:CLOSED|FIXED|RESOLVED)\s+(?:IN PART|PARTLY|PARTIALLY|HALF)\b/i;
const TAG_SEGMENT = /^[A-Z][A-Za-z0-9'-]*(?: [A-Z][A-Z]+)?$/;
export function isClosedDebtRow(disposition) {
  const d = String(disposition || "").replace(/\*\*/g, "").trim();
  if (!d || RESIDUE_RE.test(d)) return false;
  let head = "";
  for (const seg of d.split(/\s+[·]\s+|\s+-\s+/)) {
    const s = seg.trim();
    if (CLOSURE_HEAD.test(s) || !TAG_SEGMENT.test(s)) { head = s; break; }
  }
  return CLOSURE_HEAD.test(head) && !PARTIAL_HEAD.test(head);
}

const rowsOf = (text, prefix) => {
  const out = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith(prefix)) continue;
    const cells = line.split("|");
    if (cells.length < 6) continue;
    out.push({ id: cells[1].trim(), body: cells[4] || "", disposition: debtDisposition(line), line });
  }
  return out;
};

export function owedFor(lane = "BOB", { repo = ROOT, reader = null } = {}) {
  const read = reader || ((p) => { try { return readFileSync(join(repo, p), "utf8"); } catch { return null; } });
  const owner = OWNER_RE(lane);
  const discharge = DISCHARGE_RE(lane);
  const items = [], unreadable = [];

  const debt = read(SOURCES.debt);
  if (debt === null) unreadable.push(SOURCES.debt);
  else for (const r of rowsOf(debt, "| D-")) {
    /* A CLOSED row owes nothing, however many owner words it carries. */
    if (isClosedDebtRow(r.disposition)) continue;
    /* DISPOSITION ONLY. The body quotes Bob in nearly every row; a mention is not an
       assignment, and conflating them produced a 58-item list that was mostly noise.
       D-435: and a lane the disposition DISCHARGES by name is not attributed, whatever owner
       phrases the same cell carries — per lane, so every other lane it names still is. */
    const owned = owner.test(r.disposition) && !discharge.test(r.disposition);
    const residue = RESIDUE_RE.test(r.disposition);
    if (owned || residue)
      items.push({ source: "DEBT", id: r.id, attributed: owned,
                   why: owned ? `names ${lane}` : "open residue on the row — NOT attributed to any lane",
                   text: (residue ? r.disposition.match(new RegExp(RESIDUE_RE.source + "[^.]{0,180}", "i"))?.[0]
                                  : r.disposition.trim().slice(0, 180)) || "" });
  }

  const dec = read(SOURCES.decisions);
  if (dec === null) unreadable.push(SOURCES.decisions);
  else for (const m of dec.matchAll(/^### (DEC-\d+) · (\w+)/gm))
    if (m[2] === "open") items.push({ source: "DECISIONS", id: m[1], attributed: true,
                                      why: "open decision", text: "awaiting Bob" });

  /* M0-73 BLOCKED-ROWS — THE PLAN'S BLOCKED ROWS ARE THE LISTER'S, AND THIS FILE CARRIES NO ROW GRAMMAR.
     Until M0-73 this read `QUEUE.md` and `BACKLOG.md` with a heading pattern of its OWN (`[A-Z0-9-]+`, one
     space either side of the dot) — D-430's class: it agreed with `ledger.mjs` on every live row and
     disagreed at the edges, reading `### X-1-2 · blocked` (a heading no other arm of the plan reads) and
     missing `### X-1  ·  blocked` (a row every other arm reads). The files are still read through this
     file's `reader`, so an unreadable one is NAMED and a suite can inject fixtures; the ROWS come from
     `pipelineRows`, the one lister (`pipeline-readers.test.mjs` §6 and §7 pin both halves). */
  const texts = {};
  for (const l of PIPELINE) {
    const t = read(l.live);
    if (t === null) unreadable.push(l.live); else texts[l.name] = t;
  }
  for (const r of pipelineRows({ texts }).rows) {
    if (r.state !== "blocked") continue;
    /* THE WHOLE HEADING LINE AFTER ITS STATE, NOT ITS FIRST 220 CHARACTERS. Found 2026-09-18 by BOB #14:
       REC-100 is blocked on a design ruling *Routed to BOB*, deep in a heading that carries its history,
       and the truncated read returned 0 while the row sat routed to this lane. Measured over every lane
       before the change: the full line adds exactly REC-100 for BOB and nothing for anybody else. The
       offset is taken from the lister's own `id` and `state`, never re-parsed. */
    const head = r.body.split("\n")[0];
    const rest = head.slice(head.indexOf(r.state, head.indexOf(r.id) + r.id.length) + r.state.length);
    if (owner.test(rest)) items.push({ source: r.ledger, id: r.id, attributed: true,
                                       why: `blocked on ${lane}`, text: rest.trim().slice(0, 160) });
  }
  /* END M0-73 BLOCKED-ROWS */

  /* TWO POPULATIONS, AND SUMMING ACROSS THEM WAS A FIGURE THAT COST NOTHING TO PRODUCE.
     Found 2026-09-17 by CONDUCT #3 running a DISCRIMINATION CONTROL this file should have had
     from the start: `owed.mjs ZZZNOTALANE` returned ELEVEN items. A lane that does not exist
     cannot owe anything, so eleven of thirteen were never lane-attributed at all — they are
     OPEN RESIDUE on rows, which is real and worth printing and is NOT a statement about any
     lane. **The per-item output already carried the distinction (`names <LANE>` versus
     `residue stated on the row`); the summary line summed across it under one label, and the
     author carried the wrong figure into a message to another lane within the hour.**
     The fix is the LABEL, never the items: an arm that only checks real lanes cannot tell a
     working filter from no filter. */
  const attributed = items.filter((i) => i.attributed);
  const residue = items.filter((i) => !i.attributed);
  return { lane, items, attributed, residue, unreadable,
           counts: { owed: items.length, attributed: attributed.length,
                     residue: residue.length, unreadable: unreadable.length } };
}

export function owedMessage(o) {
  if (o.unreadable.length)
    return `OWED BY ${o.lane} — UNKNOWN: could not read ${o.unreadable.join(", ")}. `
         + `An unreadable ledger is not an empty one.`;
  if (!o.items.length)
    return `OWED BY ${o.lane} — nothing attributed and no open residue. The list is empty `
         + `(kickoffs/BOB.md rule 10).`;
  let out = `OWED BY ${o.lane} — ${o.counts.attributed} ATTRIBUTED to this lane, plus `
    + `${o.counts.residue} open residue\n        row(s) attributed to NOBODY. The two are counted apart because a `
    + `lane that does\n        not exist returns the residue population too — summing them is a figure that\n`
    + `        costs nothing to produce. Sequencing is this lane's own (rule 10).\n`;
  if (o.attributed.length) {
    out += `\n        ATTRIBUTED TO ${o.lane} — ${o.attributed.length}\n`;
    for (const i of o.attributed) out += `\n          ${i.source} ${i.id} — ${i.why}\n            ${i.text}\n`;
  }
  if (o.residue.length) {
    out += `\n        OPEN RESIDUE, OWNER NOT STATED — ${o.residue.length}\n`;
    for (const i of o.residue) out += `\n          ${i.source} ${i.id} — ${i.why}\n            ${i.text}\n`;
  }
  return out;
}

if (process.argv[1] && process.argv[1].endsWith("owed.mjs")) {
  /* A FLAG IS NOT A LANE NAME. `--lane=CONDUCT` was swallowed as the lane itself and returned
     the nonexistent-lane answer — a second way to get a confident wrong number, found in the
     same pass (CONDUCT #3, 2026-09-17). */
  const arg = process.argv[2] || "BOB";
  const lane = arg.startsWith("--lane=") ? arg.slice(7) : arg;
  if (arg.startsWith("--") && !arg.startsWith("--lane=")) {
    console.error(`owed: unrecognised flag ${arg} — usage: owed.mjs [LANE | --lane=LANE]`);
    process.exit(2);
  }
  const o = owedFor(lane);
  console.log(`owed: ${o.counts.attributed} attributed to ${lane}, ${o.counts.residue} open residue `
    + `attributed to nobody (${o.counts.owed} listed); ${o.counts.unreadable} ledger(s) unreadable`);
  console.log(`\n${owedMessage(o)}`);
}

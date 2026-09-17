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
 *   - `QUEUE.md` rows whose state is `blocked` and whose text names a lane.
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
 *
 * **THE HEADER FIRST CITED THIS FILE BEFORE IT EXISTED**, which is the false-absence class this
 * family exists to catch, committed by a file in the family. Corrected to say so, then built.
 * A declared control is a CLAIM; the artifact is the only witness.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const ROOT = join(new URL("..", import.meta.url).pathname);

export const SOURCES = {
  debt: "docs/development/DEBT.md",
  decisions: "docs/development/DECISIONS.md",
  queue: "docs/development/QUEUE.md",
};

/* The phrases this corpus ALREADY uses to say a lane owes something. Derived by reading the rows
   that existed on 2026-09-17, not invented — an owner-marker nobody writes is one nobody reads. */
/* NARROWED AFTER DRIVING IT, and the first version is the receipt for why. It matched the row
   BODY as well as the disposition, and every row in this ledger quotes Bob — *Bob, 2026-08-01*,
   *ruled by Bob* — so it returned 58 items of which most owed this lane nothing. **A worklist
   that is mostly noise is a worklist nobody reads, which is the failure mode this instrument
   exists to prevent.** So: the DISPOSITION only, and the owner phrases are the ones that assign
   rather than merely mention. A quotation is not an assignment. */
export const OWNER_RE = (lane) => new RegExp(
  String.raw`routed to (?:the\s+)?${lane}\b`
  + String.raw`|owed by (?:the\s+)?${lane}\b`
  + String.raw`|blocked on (?:the\s+)?${lane}\b`
  + String.raw`|${lane}(?:'s to |'s call| owns | to decide| to design)`
  + String.raw`|is ${lane}'s\b`, "i");

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

const rowsOf = (text, prefix) => {
  const out = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith(prefix)) continue;
    const cells = line.split("|");
    if (cells.length < 6) continue;
    out.push({ id: cells[1].trim(), body: cells[4] || "", disposition: cells[5] || "", line });
  }
  return out;
};

export function owedFor(lane = "BOB", { repo = ROOT, reader = null } = {}) {
  const read = reader || ((p) => { try { return readFileSync(join(repo, p), "utf8"); } catch { return null; } });
  const owner = OWNER_RE(lane);
  const items = [], unreadable = [];

  const debt = read(SOURCES.debt);
  if (debt === null) unreadable.push(SOURCES.debt);
  else for (const r of rowsOf(debt, "| D-")) {
    /* A CLOSED row owes nothing, however many owner words it carries. */
    if (/\bCLOSED\b|\bFIXED AND CONFIRMED\b/i.test(r.disposition) && !RESIDUE_RE.test(r.disposition)) continue;
    /* DISPOSITION ONLY. The body quotes Bob in nearly every row; a mention is not an
       assignment, and conflating them produced a 58-item list that was mostly noise. */
    const owned = owner.test(r.disposition);
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

  const q = read(SOURCES.queue);
  if (q === null) unreadable.push(SOURCES.queue);
  else for (const m of q.matchAll(/^### ([A-Z0-9-]+) · blocked(.{0,220})/gm))
    if (owner.test(m[2])) items.push({ source: "QUEUE", id: m[1], attributed: true,
                                       why: `blocked on ${lane}`, text: m[2].trim().slice(0, 160) });

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

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
 * NEGATIVE CONTROL: `node bio-plane/test/owed.control.mjs` from the repo root.
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
  + String.raw`|owed by this lane`
  + String.raw`|is ${lane}'s\b`, "i");

/* TIGHTENED TWICE, BOTH TIMES BY DRIVING IT. A bare `RESIDUE` matched the word wherever it
   appeared in narration — *the residue that is ALREADY THERE*, *residue each* — which is prose
   ABOUT a residue, not a declaration of one. These are the forms that ANNOUNCE an unfinished
   obligation, and they are the forms this lane actually writes. **A marker that matches
   description as well as declaration turns a worklist into a reading list.** */
export const RESIDUE_RE = /\bSTILL OPEN\b|\bSTILL OWED\b|\bNOT CLAIMED (?:DONE|CLOSED|FIXED)\b|\bRESIDUE[,:]? (?:NAMED|STATED|AND NOT)\b|\bOUTSTANDING\b/i;

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
      items.push({ source: "DEBT", id: r.id, why: residue ? "residue stated on the row" : `names ${lane}`,
                   text: (residue ? r.disposition.match(new RegExp(RESIDUE_RE.source + "[^.]{0,180}", "i"))?.[0]
                                  : r.disposition.trim().slice(0, 180)) || "" });
  }

  const dec = read(SOURCES.decisions);
  if (dec === null) unreadable.push(SOURCES.decisions);
  else for (const m of dec.matchAll(/^### (DEC-\d+) · (\w+)/gm))
    if (m[2] === "open") items.push({ source: "DECISIONS", id: m[1], why: "open decision", text: "awaiting Bob" });

  const q = read(SOURCES.queue);
  if (q === null) unreadable.push(SOURCES.queue);
  else for (const m of q.matchAll(/^### ([A-Z0-9-]+) · blocked(.{0,220})/gm))
    if (owner.test(m[2])) items.push({ source: "QUEUE", id: m[1], why: `blocked on ${lane}`, text: m[2].trim().slice(0, 160) });

  return { lane, items, unreadable,
           counts: { owed: items.length, unreadable: unreadable.length } };
}

export function owedMessage(o) {
  if (o.unreadable.length)
    return `OWED BY ${o.lane} — UNKNOWN: could not read ${o.unreadable.join(", ")}. `
         + `An unreadable ledger is not an empty one.`;
  if (!o.items.length)
    return `OWED BY ${o.lane} — nothing. The list is empty, which is the only condition under `
         + `which this lane stops (kickoffs/BOB.md rule 10).`;
  let out = `OWED BY ${o.lane} — ${o.items.length} item(s). The list is NOT empty, so there is no\n`
    + `        boundary to stop at (kickoffs/BOB.md rule 10). Sequencing is this lane's own.\n`;
  for (const i of o.items) out += `\n          ${i.source} ${i.id} — ${i.why}\n            ${i.text}\n`;
  return out;
}

if (process.argv[1] && process.argv[1].endsWith("owed.mjs")) {
  const lane = process.argv[2] || "BOB";
  const o = owedFor(lane);
  console.log(`owed: ${o.counts.owed} item(s) owed by ${lane}; ${o.counts.unreadable} ledger(s) unreadable`);
  console.log(`\n${owedMessage(o)}`);
}

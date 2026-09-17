/* delegations — a DELEGATION block in `CLAIMS.md` states its state, DATED, or it FAILS.
 *
 * THE CLASS, in BOB #11's words of 2026-09-15: **EVERY REGISTER IN THIS PROJECT CAN STATE
 * THE PAST AS THE PRESENT, AND NONE OF THEM FAILS LOUDLY WHEN IT DOES.** A `DELEGATION`
 * block carries exactly one date — the one it was RAISED on — so a block that was true when
 * it was written stays indistinguishable from one that is true now, forever and silently.
 * The only instrument that has ever caught that is a CONDUCT session deciding to sweep.
 *
 * THE RECEIPTS, and they are the argument for an instrument rather than a practice:
 *   - The one sweep that ever ran (CONDUCT #11, 2026-09-15) found nine delegations with no
 *     discharge; EIGHT were closed in the tree and said so nowhere, and one had been open
 *     five weeks with a live population.
 *   - D-288 sat `open` for five weeks WITH a good disposition, and `plancheck` — which fails
 *     an open debt row carrying NO disposition — was satisfied for the entire period the
 *     exposure was total. It then cost a stranded item and a trip to a physical machine.
 *   - A debt row named an unmet precondition 38 days after its own remedy shipped, and a
 *     design rested on it (REC-89 / D-225).
 *
 * WHAT THIS ENFORCES. Every `DELEGATION` block in `docs/development/CLAIMS.md` carries, on
 * a line of its own, EITHER
 *
 *     **DISCHARGED <YYYY-MM-DD> — <what closed it, against the tree>**
 *
 * — terminal, never re-judged, because a thing that is closed does not go stale — OR
 *
 *     **open as of <YYYY-MM-DD>** — <why it is still open>
 *
 * which EXPIRES after `THRESHOLD_DAYS` and must then be re-written by somebody who has
 * looked. A block carrying neither FAILS. A block whose newest `open as of` is older than
 * the threshold FAILS. That is the whole mechanism, and it is deliberately the cheapest one
 * that CANNOT BE SATISFIED BY DOING NOTHING.
 *
 * ── WHAT THIS INSTRUMENT IS WORTH, STATED BEFORE ANYTHING ELSE ─────────────────────────
 *
 * ITS TWO ARMS ARE NOT EQUALLY STRONG, and saying so here is not modesty — an instrument
 * that LOOKS like it proves freshness and does not is worse than one that admits it cannot
 * (M0-42's finding, one register over, and it transfers exactly).
 *
 *   THE PRESENCE ARM IS STRONG. A block with neither line fails, and nothing anyone can
 *   omit will satisfy it. A delegation raised tomorrow without a state line fails at the
 *   moment it is written, judged by the author — the one person who knows the answer.
 *
 *   THE STALENESS ARM IS WEAK, AND WEAKER THAN ITS ROW HOPED. `open as of <date>` is an
 *   assertion nobody can verify, and a single `sed` re-dates all of them. Its real content
 *   is narrower than "this register is fresh": it converts a SILENT accumulation into a
 *   DATED assertion that somebody had to re-type, and it converts the past stated as the
 *   present into the past stated as the past, with a date on it. It raises the cost of a
 *   false claim; it does not make one impossible, and it never will.
 *
 *   AND THE INSTRUMENT CANNOT TELL A BLANKET STAMP FROM AN HONEST SWEEP. Both look like a
 *   cohort of blocks affirmed on one day. So the cohort is PRINTED on every run rather than
 *   argued about here — `audit()` returns `cohorts`, and `plancheck` prints the largest, so
 *   a reader can SEE the shape a blanket stamp makes and judge it. A limit conceded in prose
 *   and never surfaced is how an instrument gets believed past its reach.
 *
 * ── WHY 30 DAYS, AND THE HONEST STATE OF THAT NUMBER ───────────────────────────────────
 *
 * THE ROW SAID TO PICK THE THRESHOLD FROM THE MEASURED DISTRIBUTION. THERE IS NO
 * DISTRIBUTION. Measured 2026-09-16 (M0-37) over all 49 `DELEGATION` blocks: 11 carry a
 * discharge, and **all eleven were discharged on the same day by the same session** —
 * 2026-09-15, CONDUCT #11. The latencies are 36d x4 and 1d x7, and both clusters are one
 * event seen from two raise dates. The estate has exactly ONE discharge event in its
 * history, so discharge latency is a single point and cannot tune anything. That is stated
 * rather than dressed up, because this row's own subject is a number quoted with more
 * confidence than its source can carry.
 *
 * SO THE NUMBER IS A POLICY CHOICE CONSTRAINED BY TWO MEASURED FACTS, and it is argued
 * rather than derived:
 *
 *   1. THE DRIFT THIS ROW EXISTS FOR WAS 36 DAYS (raised 2026-08-10, swept 2026-09-15).
 *      Any threshold under 36 turns that drift into a blocking FAIL. 30 fires on day 31,
 *      with six days to spare — and the comparison that matters is not 30 against 36, it is
 *      30 against NEVER, because nothing caught the 36 except somebody choosing to look.
 *   2. DELEGATIONS ARE RAISED AT ~1.3/DAY (49 blocks over the 38 days 2026-08-09..09-16).
 *      With B open blocks and a threshold of T days, steady-state re-affirmation costs B/T
 *      blocks per day. At B=38 and T=30 that is ~1.3/day — the register costs about as much
 *      to maintain as it costs to write. **That equality is the point of the choice.** A
 *      register that costs MORE to maintain than to create is one that gets bypassed, and a
 *      bypassed register measures nothing; this is the same failure the row warns about, one
 *      move ahead.
 *
 * A KNOWN PROPERTY, NAMED RATHER THAN DISCOVERED LATER: bringing 38 blocks into compliance
 * in one act makes them a COHORT that expires on one day. This instrument does not pretend
 * otherwise. What it does is make that day a scheduled sweep instead of an unscheduled one,
 * which is the whole of what the row asked for; the cohort shrinks every time a block is
 * genuinely discharged, because a discharge is terminal and leaves the cohort for good.
 *
 * ── WHAT THIS CANNOT SEE, stated rather than left to be discovered ─────────────────────
 *
 *   - WHETHER AN `open as of` IS TRUE. It can prove somebody wrote a date; it cannot prove
 *     they read the tree. That is the weak arm above, and it is the ceiling on this whole
 *     instrument.
 *   - A DISCHARGE WRITTEN SOMEWHERE ELSE. The check reads the BLOCK. `CLAIMS.md` already
 *     holds one of these — UI-61's delegation to RECORD was discharged in the prose of a
 *     DIFFERENT block, so the delegation itself still reads open to anyone who goes to it.
 *     That is a defect in the register, not in the reader, and this check reports it as
 *     silent ON PURPOSE: a discharge that is not where the delegation is has not been
 *     communicated (ORCHESTRATION.md, "COMMUNICATING A CHANGE").
 *   - ANY REGISTER OTHER THAN `CLAIMS.md`'s DELEGATION blocks. The class BOB #11 named is
 *     every register in the project; this closes one of them. `CLAIM`, `AMENDMENT`,
 *     `FINDING` and `DESIGN GAP` blocks are NOT judged, and the corpus figure says so on
 *     every run rather than scoring them zero.
 *   - THE PHRASE IN PROSE. A state line must START a line (after markdown emphasis), so a
 *     block that merely discusses the words "open as of" is not affirmed by talking. The
 *     converse is the cost: an affirmation buried mid-paragraph is not seen, deliberately,
 *     because a register line has to be findable by a reader and not only by a regex.
 */

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const CLAIMS = "docs/development/CLAIMS.md";

/* The rule, quoted so a failure carries the rule rather than a paraphrase of it. */
export const RULE_SENTENCE =
  "Every DELEGATION block in CLAIMS.md carries, on a line of its own, either a dated "
  + "**DISCHARGED <YYYY-MM-DD>** line or a dated **open as of <YYYY-MM-DD>** line, and an "
  + "`open as of` older than " + "30" + " days must be re-written by somebody who has looked "
  + "(M0-37; BOB #11, 2026-09-15 — a register that states the past as the present).";

/* See "WHY 30 DAYS" in the header. It is a policy choice with its argument at the site,
   NOT a figure derived from a distribution — because the distribution is one point. */
export const THRESHOLD_DAYS = 30;

/* A count PRINTED on every run and floored by the suite, because three headline totality
   assertions in this project have passed over an EMPTY corpus. A matcher that finds nothing
   must be indistinguishable from neither a clean register nor a broken walk — so the floor
   is what makes "0 fail" mean something. Measured 49 on 2026-09-16; floored below that with
   slack for deliberate removal, and a FALL past the floor is a finding about the matcher. */
export const CORPUS_FLOOR = 40;

const HEADING = /^#{1,4} /;
const DELEGATION_HEADING = /^#{2,4} +DELEGATION\b/;
const DATE = /(20\d\d-\d\d-\d\d)/;

/* Both state lines must START a line, after any leading markdown emphasis, bullet or quote
   marker. `CLAIMS.md` writes its existing eleven discharges as `**DISCHARGED …`, so the
   grammar is FITTED TO WHAT THE CORPUS ALREADY WRITES rather than imposed on it — the
   adoption cost for an honest author is zero, which is what keeps a register from being
   routed around (M0-42's over-strictness finding). */
const LEAD = String.raw`^[ \t]*(?:[>*_\x60~\-]|\d+\.)*[ \t]*`;
const DISCHARGE_LINE = new RegExp(LEAD + String.raw`\*{0,2}DISCHARGED\b`, "i");
const AFFIRM_LINE = new RegExp(LEAD + String.raw`\*{0,2}open as of\b`, "i");

const dayMs = 86400000;
export const daysBetween = (a, b) =>
  Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / dayMs);
/* LOCAL date, not UTC, and the reason is that the corpus is authored in local dates: a
   register line written on the evening of the 16th is `2026-09-16` in `CLAIMS.md` while
   `toISOString()` already reads `2026-09-17`. Measured here on the first run of this
   module. The threshold is 30 days so a one-day skew never decides anything; the git arm
   below carries an explicit one-day slack for the same reason, stated there. */
export const todayISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* Every `DELEGATION` block, discovered by walking headings — never a hand list. A block runs
   from its own heading to the next heading of ANY level, which is how `CLAIMS.md` is
   actually written (a `### DELEGATION` nested under a `## CLAIM` ends at the next heading). */
export function parseBlocks(src) {
  const lines = src.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!DELEGATION_HEADING.test(lines[i])) continue;
    let j = i + 1;
    while (j < lines.length && !HEADING.test(lines[j])) j++;
    const body = lines.slice(i + 1, j);

    const discharges = [], affirms = [];
    for (let k = 0; k < body.length; k++) {
      const text = body[k], at = i + 2 + k;          /* 1-based line number in the file */
      if (DISCHARGE_LINE.test(text)) discharges.push({ at, text, date: (text.match(DATE) || [])[1] || null });
      else if (AFFIRM_LINE.test(text)) affirms.push({ at, text, date: (text.match(DATE) || [])[1] || null });
    }
    /* The NEWEST affirmation governs, so a sweep APPENDS a dated line rather than editing
       the last one away. That keeps the re-affirmation history — and a block re-affirmed
       many times without ever closing is a signal in its own right, surfaced as a note. */
    const dated = affirms.filter((a) => a.date).sort((x, y) => y.date.localeCompare(x.date));

    out.push({
      line: i + 1,
      endLine: j,
      heading: lines[i],
      title: lines[i].replace(/^#+ +/, "").slice(0, 96),
      raised: (lines[i].match(DATE) || [])[1] || null,
      discharges,
      affirms,
      affirmations: affirms.length,
      newest: dated[0] || null,
      undatedAffirms: affirms.filter((a) => !a.date),
      undatedDischarges: discharges.filter((d) => !d.date),
    });
  }
  return out;
}

/* THE GIT ARM, AND ITS ONE HONEST INVARIANT.
 *
 * A stated date cannot be NEWER than the commit that wrote the line stating it. You cannot
 * commit, today, a credible claim that this line was re-affirmed next month. That is the one
 * thing about an `open as of` that the repository itself can falsify, and it costs an honest
 * author exactly nothing: they write the line and commit it, and the two dates agree.
 *
 * It does NOT catch the blanket stamp — that is committed today and honestly dated — and
 * saying so is the point of having written the weak-arm paragraph above.
 *
 * IT CANNOT FIRE BEFORE THE COMMIT, which is `corpuscheck`'s date-arm problem measured again
 * one file over: a line edited in this turn blames to `Not Committed Yet`. So it is SKIPPED
 * under `--local`, and an unjudgeable line is NAMED rather than scored clean — D-233's rule,
 * say UNVERIFIED and never say CLEAN. */
export function blameDate(repo, file, line) {
  try {
    const out = execFileSync("git", ["blame", "-L", `${line},${line}`, "--porcelain", "--", file],
      { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    if (/^[0]{20,}/.test(out)) return null;                    /* uncommitted: not judgeable */
    const m = out.match(/^author-time (\d+)$/m);
    if (!m) return null;
    return new Date(Number(m[1]) * 1000).toISOString().slice(0, 10);
  } catch { return null; }
}

/* `src` is injectable so the suite can drive the rule's edges against a fixture without
   writing to the real register — the shape `rowDesignAudit({ queue })` already uses. An
   injected corpus turns the git arm OFF by construction: blaming a line number that belongs
   to a fixture would read a DIFFERENT line of the real file and answer with confidence. */
export function delegationAudit({ repo = ROOT, src = null, today = todayISO(), git = true } = {}) {
  if (src !== null) git = false;
  src ??= readFileSync(join(repo, CLAIMS), "utf8");
  const blocks = parseBlocks(src);

  const discharged = [], affirmed = [], stale = [], silent = [],
        undated = [], contradictory = [], futureDated = [], unjudgeable = [];

  for (const b of blocks) {
    /* A block that carries BOTH is judged on its OPEN half, which is the conservative
       reading and the one that lets "discharged in part, open as of X for the rest" say
       exactly that. If it is closed, the open line comes out. */
    if (b.affirms.length) {
      if (!b.newest) { undated.push({ ...b, why: "an `open as of` line carrying no date" }); continue; }
      if (b.discharges.length) contradictory.push(b);

      const age = daysBetween(b.newest.date, today);
      if (age > THRESHOLD_DAYS) { stale.push({ ...b, age }); continue; }

      if (git) {
        const wrote = blameDate(repo, CLAIMS, b.newest.at);
        if (!wrote) unjudgeable.push({ ...b, why: "the affirming line is not committed on this tree" });
        else if (daysBetween(wrote, b.newest.date) > 1) futureDated.push({ ...b, wrote, age });
      }
      affirmed.push({ ...b, age });
      continue;
    }
    if (b.discharges.length) {
      if (b.undatedDischarges.length === b.discharges.length)
        undated.push({ ...b, why: "a DISCHARGED line carrying no date" });
      else discharged.push(b);
      continue;
    }
    silent.push(b);
  }

  /* The cohort shape. Printed, never gated — a blanket stamp and an honest sweep make the
     SAME shape, and this instrument is not able to tell them apart. Surfacing it lets a
     reader do what the instrument cannot. */
  const cohorts = {};
  for (const a of affirmed) cohorts[a.newest.date] = (cohorts[a.newest.date] || 0) + 1;
  const largestCohort = Object.entries(cohorts).sort((x, y) => y[1] - x[1])[0] || null;

  /* Re-affirmed repeatedly and never closed: a candidate for a QUEUE row rather than a
     register line. A note, because deciding that is CONDUCT's and not a checker's. */
  const perennial = affirmed.filter((a) => a.affirmations >= 3);

  const findings = [
    ...silent.map((b) => ({ kind: "SILENT", b })),
    ...stale.map((b) => ({ kind: "STALE", b })),
    ...undated.map((b) => ({ kind: "UNDATED", b })),
    ...futureDated.map((b) => ({ kind: "FUTURE-DATED", b })),
  ];

  return {
    blocks, discharged, affirmed, stale, silent, undated, contradictory, futureDated,
    unjudgeable, cohorts, largestCohort, perennial, findings,
    corpus: blocks.length, today, threshold: THRESHOLD_DAYS, gitArm: git,
  };
}

const where = (b) => `CLAIMS.md:${b.line}`;

export function delegationMessage(a) {
  const L = [];
  L.push(`A DELEGATION DOES NOT STATE ITS OWN STATE — ${a.findings.length} block(s) in CLAIMS.md.`);
  L.push(`        ${RULE_SENTENCE}`);
  for (const b of a.silent)
    L.push(`          SILENT        ${where(b)} · raised ${b.raised || "no date"} — ${b.title}\n`
         + `                        neither a DISCHARGED line nor an \`open as of\` line. It has said\n`
         + `                        the same thing since the day it was written and nothing re-affirms it.`);
  for (const b of a.stale)
    L.push(`          STALE ${String(b.age).padStart(3)}d   ${where(b)} · open as of ${b.newest.date} (CLAIMS.md:${b.newest.at}) — ${b.title}\n`
         + `                        past the ${a.threshold}-day threshold. Read the tree, then either discharge it\n`
         + `                        or APPEND a new dated \`open as of\` line saying why it is still open.`);
  for (const b of a.undated)
    L.push(`          UNDATED       ${where(b)} — ${b.title}\n`
         + `                        ${b.why}. A state line without a date is the defect this check exists for.`);
  for (const b of a.futureDated)
    L.push(`          FUTURE-DATED  ${where(b)} · claims ${b.newest.date}, the line was committed ${b.wrote}\n`
         + `                        A stamp cannot be newer than the commit that wrote it.`);
  return L.join("\n");
}

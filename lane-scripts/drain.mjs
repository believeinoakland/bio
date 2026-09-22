// SCHEDULER #12: drain BOB #26's inbox entry (move it verbatim to the drained archive), MILESTONES rows, CLAIMS state lines.
// Usage: node drain.mjs <repo> [--write]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const REPO = process.argv[2];
const WRITE = process.argv.includes("--write");
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const rd = (p) => readFileSync(join(REPO, p), "utf-8");
const out = new Map();
const once = (s, a, b, what) => { const n = s.split(a).length - 1; if (n !== 1) fail(`${what}: ${n} occurrences`); return s.replace(a, b); };

// ---- 1. QUEUE.md: take BOB #26's entry out of the inbox, verbatim ----
let q = rd("docs/development/QUEUE.md");
const START = "**2026-09-22 · BOB #26 · SCHEDULER #11's GROUP OF FOUR ANSWERED";
const s0 = q.indexOf(START);
const cacheAt = q.indexOf("## THE CACHE");
if (s0 < 0 || cacheAt < s0) fail("BOB #26's entry not found in the inbox");
// the entry runs to the next inbox entry (a line starting "**2026-") or the cache heading
let e0 = cacheAt;
const nextEntry = q.indexOf("\n**2026-", s0 + START.length);
if (nextEntry >= 0 && nextEntry < cacheAt) e0 = nextEntry + 1;
const entry = q.slice(s0, e0).replace(/\n+$/, "");
q = q.slice(0, s0) + q.slice(e0);
q = q.replace(/\n{3,}## THE CACHE/, "\n\n## THE CACHE");
out.set("docs/development/QUEUE.md", q);

// ---- 2. the drained archive ----
let d = rd("docs/archive/ledgers/BOB-INBOX-drained.md");
const head = "## DRAINED 2026-09-22 by SCHEDULER #12 — BOB #26's entry (`7c967f09`), verified at `BIO_Content_Framework_v0_10.md` §14.4 and §18, `BIO_Intake_Doctrine_v1_1.md` §8 and `NOTIFICATIONS.md` \"MARKED AS HANDLED\", and at the code on `7c967f09`: D-152 and D-164 CLOSED IN FACT (door 1); item 1 PLACED as D-179 and item 2 as D-125 (door 2, each keeping its id), their DEBT rows archived as placed. The digest-level cross-bundle duplicate the entry names as not reached is not rowed here.";
d = d.replace(/\n*$/, "\n\n") + head + "\n\n" + entry + "\n";
out.set("docs/archive/ledgers/BOB-INBOX-drained.md", d);

// ---- 3. MILESTONES.md ----
let m = rd("docs/development/MILESTONES.md");
const ml = m.split("\n");
const drop = (prefix) => { const i = ml.findIndex((l) => l.startsWith(prefix)); if (i < 0) fail(`MILESTONES: ${prefix}`); ml.splice(i, 1); };
drop("| D-152 image-only PDFs are OCR'd");
drop("| D-164 L3 content has no object");
const annotate = (prefix, add) => {
  const i = ml.findIndex((l) => l.startsWith(prefix)); if (i < 0) fail(`MILESTONES: ${prefix}`);
  ml[i] = ml[i].replace(/\s*\|\s*$/, "") + ` · ${add} |`;
};
const i125 = ml.findIndex((l) => l.startsWith("| D-125 "));
if (i125 < 0) fail("MILESTONES: D-125");
ml[i125] = "| D-125 a member's personal mute of a FINDING (DEC-10's (b)/(c)) | RECORD | M8 · PLACED 2026-09-22 in `BACKLOG.md` on BOB #26's ruling |";
annotate("| D-179 ", "PLACED 2026-09-22 in `BACKLOG.md` on BOB #26's ruling");
for (const id of ["D-65", "D-66", "D-74", "D-169", "D-171", "D-178"]) annotate(`| ${id} `, "PLACED 2026-09-22 in `BACKLOG.md`");
annotate("| D-85 / D-86 ", "D-86 PLACED 2026-09-22 in `BACKLOG.md`");
out.set("docs/development/MILESTONES.md", ml.join("\n"));

// ---- 4. CLAIMS.md: discharge #11's DELEGATION; answer #12's items 1-2 ----
let c = rd("docs/development/CLAIMS.md");
const OPEN11 = "**open as of 2026-09-22** — sent to BOB by message the same day; each answer disposes of its row (closed, placed or narrowed further), and nothing runnable waits on any of them.\n";
c = once(c, OPEN11, "", "#11 open-as-of");
const ANS26 = "items and the dispositions are the BOB INBOX's entry of 2026-09-22; nothing keeps this block open past SCHEDULER's drain.";
c = once(c, ANS26, ANS26 + "\n**DISCHARGED 2026-09-22** — SCHEDULER #12 drained BOB #26's entry: D-152 and D-164 CLOSED IN FACT and archived; D-179 and D-125 PLACED in `BACKLOG.md` under their own ids (D-179 after D-171, D-125 last of the M8 corrections), their DEBT rows archived as placed.", "#11 discharge");
const OPEN12 = "**open as of 2026-09-22** — each answer is applied by SCHEDULER in its next landing; nothing runnable waits on any of them.\n";
c = once(c, OPEN12, "**Items 1 and 2 ANSWERED 2026-09-22 by BOB #26 (DECIDED, sequencing being this lane's):** keep 150 KiB (a larger read-whole file is the wrong direction under Bob's ruling; revisit only on a spawn delayed or misbriefed by a cut row), and keep the order (the relayed *M8-M10* named the product rows; within them `CLAUDE.md` §2's over-claim rule decides). Both were already running; nothing moved. Item 3 accepted by BOB #26 for its next landing.\n**open as of 2026-09-22** — item 3 only: D-278's determinations, which BOB #26 rules per group; nothing runnable waits on it.\n", "#12 answers");
out.set("docs/development/CLAIMS.md", c);

for (const [p, t] of out) console.log(p, Buffer.byteLength(rd(p)), "->", Buffer.byteLength(t));
console.log("entry moved:", entry.length, "chars; first line:", entry.split("\n")[0].slice(0, 80));
if (WRITE) { for (const [p, t] of out) writeFileSync(join(REPO, p), t); console.log("WRITTEN"); }

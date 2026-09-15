/* NEGATIVE CONTROL (M0-18, run 2026-08-09, worktree agent-a62aec7acd493144e): the
   provenance floor added to this file is armed by `test/provenance-floor.control.mjs`
   — COMMITTED, so it re-runs in one step. 58 of 58 checks as declared over eight arms,
   each armed ALONE with every other defence held open, every restore verified by sha256
   AND by a full byte comparison against a UNIQUELY-NAMED per-arm pristine copy with the
   byte count printed and floored. ARM 5 is armed on this file and is the half the floor change must not cost: a
   phantom .md carrying an unregistered 'Order of work' heading still REDS this suite.
   TWO ARMS CAME BACK WRONG FIRST AND BOTH FOUND DEFECTS IN THE HARNESS RATHER THAN IN
   THE SUBJECT — the harness pinned the very refusal codes its arm was about to test, and
   spelled an `op=` token that op-claims then read as a real claim. Recorded at their
   sites in the control, not smoothed. */
/* NEGATIVE CONTROL (M0-26, run 2026-09-14, worktree agent-a64d514be75dea71a), on the
   DISCOVERY CORPUS this item had to widen, each arm ALONE and restored by cp-back
   verified sha256 and `cmp` at 17,291 bytes. BASELINE 244 pass 0 fail, corpus 76 docs /
   2 headings. (A) an unregistered `## Order of work` in a live design doc -> 243 pass,
   1 FAIL on the orphan arm, corpus 77/3 — this is the half the widening must not cost,
   and it did not. (B) revert the widening to a plain `allDocs()` -> 243 pass, 1 FAIL on
   the discovery floor at 1 of 1, corpus 75/1 — the exact state measured live at f3b63c4
   when `CONFORMANCE-AND-INTAKE-ARC.md` was archived, over an entirely correct tree.
   (C) over-strictness, nothing armed -> 244 pass, 0 fail. **The finding is (B): a
   registered file leaving `docs/development/` silently narrowed a walk while every
   other figure read right, and the repair is that a REGISTERED file is in the corpus by
   construction — lowering the floor would have recorded the loss instead of fixing it.** */
/* NEGATIVE CONTROL: (M0-30, run 2026-09-14, worktree agent-a12296b3767e15401) the §4.7
   row-design arm, driven by `test/rowdesign.control.mjs` — COMMITTED, so it re-runs in one
   step. **25 of 25 checks as declared FIRST RUN across five arms plus a baseline**, each armed
   ALONE, every restore verified by sha256 AND `cmp` AND a floored byte count against a
   uniquely-named pristine copy in `.m030-harness/`. BASELINE 274 pass 0 fail, plancheck naming
   no row. (A1) the arm this item exists for — M0-29's `design:` pointer REMOVED -> plancheck
   FAILS naming M0-29 and ONLY M0-29, with §4.7's own sentence in the failure. (A2)
   OVER-STRICTNESS — the same pointer replaced by `design: MISSING — routed to BOB (CLAIMS.md
   DELEGATION …)` -> plancheck passes AND reports the routing, because an admitted gap is
   schedulable and silence is the defect. (A2b) OVER-STRICTNESS — the 252 closed rows carrying
   no pointer at all -> NOT judged and in no finding; history is not re-briefed. (A3)
   THE ARM'S OWN ARM — the section deleted from `tools/plancheck.mjs` -> this suite goes red 2
   fails, BY NAME ("plancheck RUNS the row-design check" and the count-equality arm beside it),
   which is why the in-the-loop arm RUNS plancheck and reads its report instead of grepping its
   text (mergecarry's receipt: a COMMENT satisfied the grep). (A4) THE GOVERNED SET IS §5's
   TABLE — a row naming `docs/development/M030-PLANTED-DESIGN.md` FAILS, then that path planted
   into CORPUS-STANDARD.md §5's table -> the SAME row PASSES, and FAILS again after the restore;
   `governed()` is read at call time, so no hand list and no snapshot can sit between the table
   and the judgement. The in-suite half of the same question is the ZZ-12 pair below, which
   swaps the injected set rather than the file.
   **THE DRIVER WAS WRONG ONCE AND IT IS RECORDED RATHER THAN SMOOTHED**: its first cleanup
   removed the PEN DIRECTORY, which also held this session's baseline worktree and every saved
   gate log, deleting all of it on a clean run with exit 0 and a cheerful "pen removed"; the
   registration was cleared with `git worktree prune` and the driver now removes only the
   copies it wrote. The subject was never in doubt, the instrument was. */
/* NEGATIVE CONTROL: (run 2026-07-31) strip the M7 token from open DEBT row D-50 (cell -> "open") -> 2 fail (the D-50 row + the aggregate); AND strip the BUILT(FW-3) marker from CONSTRUCTS "The plan" Step 1 -> 2 fail (the Step 1 item + the aggregate); each restored, 154 pass 0 fail. */
/* Planning-drift hygiene: the M0-6 gate, on D-113's precedent.
 *
 * The repository is the channel between sessions (CLAUDE.md). The PLAN is how a
 * session learns what changed, and a plan drifts the same way every hand-kept
 * list in this repo has drifted: silently, and rediscovered weeks later by a
 * session doing an audit rather than by the session that drifted it. D-113's
 * purge table, the 38-of-41 `npm test` chain, the embedded-version skew — all one
 * class, all closed the same way: an instrument that fails IN THE SESSION THAT
 * DRIFTS, not at the next audit.
 *
 * `tools/plancheck.mjs` already checks the DEBT dispositions below at pre-push
 * time. That is necessary and not sufficient: a session that never runs plancheck
 * still cannot be allowed to drift the plan, so the same invariants are enforced
 * HERE, in the standing battery gate, where every session's `npm run test:battery`
 * runs them. Two checks in two places for one invariant is not duplication — it is
 * the cheap-and-early copy plus the cannot-be-bypassed copy, the same reasoning the
 * D-106 version check and the D-113 purge check already use.
 *
 * The three invariants (MILESTONES.md "How this file stays true", items 1, 2 and
 * the QUEUED cross-reference the status vocabulary carries):
 *
 *   1. Every OPEN row in DEBT.md carries a DISPOSITION TOKEN — a leading
 *      `M<n> | DOCTRINE | ACCEPTED | WATCH | SUPERSEDED | NOT OURS | BOB's`
 *      (or a RESOLVED verb), so the row can be sorted out of the ledger into
 *      work. A row with no disposition is invisible work, which is how a standing
 *      ruling went two design revisions with nothing scheduling it.
 *
 *   2. Every `QUEUED <ID>` cross-reference names an ID that ACTUALLY EXISTS as a
 *      queue item in QUEUE.md — a status marker pointing at a queue id that was
 *      renamed or never created is a dangling reference that reads as scheduled.
 *
 *   3. Every design-doc ORDER-OF-WORK item carries a STATUS MARKER
 *      (`BUILT <version>` | `QUEUED <ID>` | `UNSCHEDULED` | `BLOCKED <what>`).
 *      `CAPTURE-SCALING.md` is why the rule exists: five of its six items were
 *      built while its header still said nothing was.
 *
 * This suite reads the planning surface as text, on purpose: it is cheap, needs no
 * runtime, and catches the drift at the moment it is made.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
/* M0-18 — ONE mechanism, imported. The reason is at `allDocs()`. */
import { readGitProvenance, repoPath, reportProvenance } from "../scripts/provenance.mjs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const DIR = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(DIR, "..", "..");            // bio-plane/test -> repo root
const DEV = join(REPO, "docs/development");
const ARCH = join(REPO, "docs/architecture");
const read = (p) => readFileSync(p, "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* Every .md under docs/development and docs/architecture, walked (not hand-listed)
   so a new doc carrying a QUEUED reference or an Order-of-work heading is seen. */
function allDocs() {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".md")) out.push({ file: p, body: readFileSync(p, "utf8") });
    }
  };
  walk(DEV); walk(ARCH);
  return out;
}

/* M0-18 — the provenance of the walk above. `refs/stash` is repository-wide
   across all sixty worktrees of this repository and `git stash push -u` carries
   untracked files, so a `.md` can arrive under `docs/development/` from a tree
   that never wrote it (D-238, measured). This suite's discovery guard FLOORS on
   what the walk found, and an arrival can only push that floor UP.
   THE GUARD ITSELF STILL READS THE WHOLE WORKING TREE — an "Order of work"
   heading in an uncommitted design doc is still an unregistered heading and must
   still fail the `orphan` arm below, which is the direction that matters. Only
   the FLOOR narrows to `git ls-tree HEAD`. */
const PROV = readGitProvenance(REPO);
const inCommit = (abs) => PROV.inHead === null ? true : PROV.inHead.has(repoPath(REPO, abs));
/* SAY UNVERIFIED, NEVER CLEAN (D-233), in the assertion's prose and not only in
   the report. */
const HEAD_SAYS = PROV.inHead === null
  ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so this is the whole working-tree walk and is NOT a claim about any commit"
  : `in the commit at HEAD (${PROV.headSha})`;

/* ------------------------------------------------------------------ inventory */

const queue = read(join(DEV, "QUEUE.md"));
const debt = read(join(DEV, "DEBT.md"));

/* The queue ids, read out of QUEUE.md's own item headings (`### <ID> · <state>`)
   rather than hand-listed, so an id renamed there is seen here without a second
   edit — the same reason coverage.mjs reads the OPS table from source. */
const QUEUE_IDS = new Set(
  [...queue.matchAll(/^###\s+([A-Z][A-Z0-9]*-\d+)\s+·/gm)].map((m) => m[1]));
t("QUEUE.md declares a non-trivial set of item ids", QUEUE_IDS.size >= 10, true);

/* --------------------------------------- 1. every open DEBT row has a token */
/* The exact predicate plancheck.mjs enforces, ported so a session that runs only
   the battery gets the identical gate. A row is fine if its LAST cell begins with
   a disposition token OR reads as resolved. */
console.log("\n--- every open DEBT row carries a disposition token ---");
{
  const TOKEN = /\|\s*(M\d+|DOCTRINE|ACCEPTED|WATCH|SUPERSEDED|NOT OURS|BOB's)/;
  const RESOLVED = /\|\s*(fixed|resolved|closed|guarded|amended|measured)/i;
  const rows = [];
  for (const line of debt.split("\n")) {
    if (!/^\|\s*D-\d+\s*\|/.test(line)) continue;
    const id = (line.match(/^\|\s*(D-\d+)/) || [])[1];
    const tail = line.replace(/\s+$/, "");
    const i = tail.lastIndexOf("|", tail.length - 2);
    const status = i >= 0 ? tail.slice(i).replace(/^\|\s*|\s*\|$/g, "").trim() : "";
    const ok = TOKEN.test(`| ${status}`) || RESOLVED.test(`| ${status}`);
    rows.push({ id, ok, status });
  }
  t("DEBT.md has debt rows to check", rows.length >= 20, true);
  const bad = rows.filter((r) => !r.ok).map((r) => `${r.id} found:"${r.status.slice(0, 40)}"`);
  t(`every one of ${rows.length} DEBT rows carries a disposition token`, bad, []);
  /* Name each row so a break points at the exact D-number, not just a count. */
  for (const r of rows) t(`${r.id} carries a disposition token`, r.ok, true);
}

/* ---------------------------- 2. every QUEUED <ID> reference names a real item */
/* A status marker's `QUEUED <ID>` (and the prose "QUEUED as <ID>") must point at
   an item that exists in QUEUE.md. The literal template `QUEUED <ID>` in the rule
   text is excluded — an angle-bracketed placeholder is not a reference. */
console.log("\n--- every QUEUED <ID> cross-reference names a real queue item ---");
{
  const refs = [];
  for (const { file, body } of allDocs()) {
    for (const m of body.matchAll(/\bQUEUED\s+(?:as\s+)?([A-Z][A-Z0-9]*-\d+)\b/g))
      refs.push({ file, id: m[1] });
  }
  t("there is at least one concrete QUEUED reference to check", refs.length >= 1, true);
  const dangling = refs.filter((r) => !QUEUE_IDS.has(r.id))
    .map((r) => `${r.id} in ${r.file.slice(REPO.length + 1)}`);
  t(`every QUEUED reference (${refs.length}) names an existing queue item`, dangling, []);
}

/* --------------------------- 3. every order-of-work item carries a marker */
/* GOVERNED forward order-of-work lists — the ones that adopt the status-per-item
   convention. Registered explicitly (few, and each a deliberate forward plan), the
   way the D-113 purge exemptions are registered; the DISCOVERY GUARD below makes a
   NEW list titled "Order of work" impossible to add without triaging it here. */
const ORDER_OF_WORK = [
  { file: join(DEV, "CAPTURE-SCALING.md"), heading: "Order of work" },
  { file: join(ARCH, "CONSTRUCTS.md"), heading: "The plan: bottom up, and each step has a consumer" },
];
/* HISTORICAL order-of-work lists that predate the convention and are CLOSED: every
   step executed and superseded. Retro-stamping build versions on them would
   fabricate a ledger the doc never kept, so they are exempt WITH A REASON rather
   than red-lit — a judgment recorded, not guessed. */
const EXEMPT_ORDER_OF_WORK = [
  /* MOVED 2026-09-14 (M0-26) from `docs/development/` to `docs/archive/` — this
     exemption's own reason is what established the document as closed history, so
     the file went where closed history goes. `allDocs()` does not walk the archive,
     so the discovery guard no longer SEES this heading; the staleness check below
     still reads the file by path, which is why the entry is repointed rather than
     deleted: an exemption whose reason is still true stays on the record. */
  { file: join(REPO, "docs/archive/CONFORMANCE-AND-INTAKE-ARC.md"), heading: "5. Order of work",
    reason: "closed migration architecture; all eight steps executed and superseded by the live plane" },
];

const MARKER = /\b(BUILT|QUEUED|UNSCHEDULED|BLOCKED)\b/;
const ITEM = /^(?:\*\*Step\s+\d+[a-z]?|\d+[a-z]?\.)/;

/* The body of one `## <heading>` section, up to the next `## ` heading or EOF. */
function section(body, heading) {
  const lines = body.split("\n");
  const esc = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${esc}\\s*$`).test(l));
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++)
    if (/^##\s/.test(lines[i])) { end = i; break; }
  return lines.slice(start + 1, end);
}
/* Top-level items in a section: a numbered line or a `**Step N` line. Sub-items
   (`**(a)`, `-`) and prose are not items. Each carries its FIRST physical line,
   which is where the marker lives (`1. **BUILT.** …`, `**Step 0 — BUILT …**`). */
const itemsOf = (lines) => lines.filter((l) => ITEM.test(l));

console.log("\n--- every design-doc order-of-work item carries a status marker ---");
for (const { file, heading } of ORDER_OF_WORK) {
  const rel = file.slice(REPO.length + 1);
  const lines = section(read(file), heading);
  t(`${rel} · "${heading}" section is present (renaming it must not silently disable the check)`, lines != null, true);
  if (!lines) continue;
  const items = itemsOf(lines);
  t(`${rel} · "${heading}" has order-of-work items`, items.length > 0, true);
  const unmarked = items.filter((l) => !MARKER.test(l))
    .map((l) => l.replace(/^\*\*/, "").slice(0, 40).trim());
  t(`${rel} · every item under "${heading}" carries a status marker`, unmarked, []);
  for (const l of items) {
    const label = (l.match(/^\*\*Step\s+\d+[a-z]?|^\d+[a-z]?\./) || ["?"])[0].replace(/[.*]/g, "").trim();
    t(`${rel} · "${heading}" item "${label}" carries a status marker`, MARKER.test(l), true);
  }
}

/* DISCOVERY GUARD. Any heading titled "Order of work" anywhere in the design docs
   must be either GOVERNED or EXEMPT — so the canonical form cannot be added, or an
   exempt one un-exempted, without a decision here. This is the mechanism that keeps
   the hand-kept registry above from falling behind the way D-113's list did. */
console.log("\n--- no unregistered 'Order of work' list escapes the check ---");
{
  const governed = new Set(ORDER_OF_WORK.map((o) => `${o.file}::${o.heading}`));
  const exempt = new Set(EXEMPT_ORDER_OF_WORK.map((o) => `${o.file}::${o.heading}`));
  const found = [];
  /* CORRECTED 2026-09-14 (M0-26), NEVER EXEMPTED, AND THE FLOOR IS NOT LOWERED.
     `allDocs()` walks `docs/development/` and `docs/architecture/` only. When
     `CONFORMANCE-AND-INTAKE-ARC.md` was archived — closed history, on this very
     registry's own recorded reason — its "5. Order of work" heading left the walk
     and the reproducible count fell 2 -> 1, reddening a floor of 2 over an entirely
     correct tree. Lowering the floor would have been the wrong repair: the walk had
     stopped seeing a heading this file still governs. **A REGISTERED FILE IS PART OF
     THE DISCOVERY CORPUS BY CONSTRUCTION**, wherever it lives — anything else lets a
     registry entry and the walk that polices it drift apart, which is the D-113 class
     this guard exists for. Only files the two registries NAME are added; no other
     archived document enters, so the orphan arm's meaning is unchanged. */
  const DOCS = allDocs();
  for (const o of [...ORDER_OF_WORK, ...EXEMPT_ORDER_OF_WORK]) {
    if (DOCS.some((d) => d.file === o.file)) continue;
    try { DOCS.push({ file: o.file, body: readFileSync(o.file, "utf8") }); }
    catch { /* the staleness arm below reports a registry entry with no file */ }
  }
  for (const { file, body } of DOCS) {
    for (const m of body.matchAll(/^#{2,3}\s+((?:\d+\.\s*)?Order of work)\b.*$/gim))
      found.push({ file, heading: m[1].trim() });
  }
  /* M0-18: the FLOOR is the reproducible figure; the ORPHAN arm below is not. */
  const foundRepro = found.filter((f) => inCommit(f.file));
  const docsRepro = DOCS.filter((d) => inCommit(d.file));
  console.log(`  discovery corpus: ${DOCS.length} doc(s) walked, ${found.length} 'Order of work' heading(s)`);
  console.log(`  discovery corpus, REPRODUCIBLE: ${docsRepro.length} of ${DOCS.length} doc(s) and `
    + `${foundRepro.length} of ${found.length} heading(s) are ${HEAD_SAYS} — the floor of 2 applies to THESE`);
  reportProvenance({
    prov: PROV,
    items: DOCS.map((d) => ({ path: repoPath(REPO, d.file), what: d.file.slice(REPO.length + 1),
      counted: `${found.filter((f) => f.file === d.file).length} 'Order of work' heading(s)` })),
    instrument: "the planning-doc discovery guard",
    corpus: `${DOCS.length} doc(s) walked, ${docsRepro.length} of them in the commit`,
    totals: PROV.inHead === null ? [] : [
      { label: "'Order of work' headings", contaminated: found.length, reproducible: foundRepro.length, source: "docs" },
    ],
  });
  /* CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED: this floor was computed over
     a working-tree walk of `docs/`, where an untracked arrival raises it. The
     question — did the guard find the headings it is supposed to govern — is
     unchanged; it is now asked about the docs another checkout reproduces. */
  t(`the discovery guard finds the known 'Order of work' headings, counted over the docs another checkout `
  + `REPRODUCES (${foundRepro.length} of ${found.length}, ${HEAD_SAYS})`, foundRepro.length >= 2, true);
  t("the provenance check either verified against `git ls-tree HEAD` or reported UNVERIFIED — never a silent "
  + "third state, and under UNVERIFIED the two figures COLLAPSE rather than the reproducible one reading zero",
    [PROV.inHead instanceof Set || PROV.inHead === null,
     foundRepro.length <= found.length,
     PROV.inHead === null ? foundRepro.length === found.length : true],
    [true, true, true]);
  const orphan = found
    .filter((f) => !governed.has(`${f.file}::${f.heading}`) && !exempt.has(`${f.file}::${f.heading}`))
    .map((f) => `${f.file.slice(REPO.length + 1)} · "${f.heading}"`);
  t("every 'Order of work' heading is governed or explicitly exempt", orphan, []);
  /* An exemption for a list that does not exist is stale; keep the allowlist honest. */
  for (const e of EXEMPT_ORDER_OF_WORK) {
    const present = section(read(e.file), e.heading) != null;
    t(`exemption "${e.file.slice(REPO.length + 1)} · ${e.heading}" names a real section`, present, true);
  }
}

/* ------------------- 4. every OPEN queue row names the design it builds from */
/* `CORPUS-STANDARD.md` §4.7, Bob 2026-09-14. The predicate is `tools/rowdesign.mjs` —
   IMPORTED, not ported: `plancheck.mjs` self-executes and cannot be imported, so an inline
   arm there would have to be COPIED here, and two readers of one question is how two answers
   were allowed to differ (D-302). The DEBT port above predates that reasoning and is left
   alone; this arm follows `mintid` and `mergecarry` instead.

   The fixtures below use the synthetic namespace `ZZ`, which allocates nothing: `mintid`'s
   corpora are `docs/` files and this is not one, and an id-shaped example in a real namespace
   is how the id tool once poisoned its own floor. */
console.log("\n--- every open queue row names the design it builds from (CORPUS-STANDARD §4.7) ---");
{
  const { rowDesignAudit, governedIndex, openRows } = await import("../../tools/rowdesign.mjs");
  const { governed } = await import("../../tools/corpuscheck.mjs");

  /* THE GOVERNED SET IS READ FROM §5's TABLE, NEVER LISTED — the arm's whole reason for
     importing `corpuscheck`. Asserted as an IDENTITY against `governed()` so the injected
     sets used by the fixtures below cannot hide a hand list in the module. */
  t("the judge's governed set IS corpuscheck's governed() — §5's table, not a list in rowdesign.mjs",
    [...governedIndex().paths].sort(), governed().slice().sort());
  t("the governed set is non-trivial (a headline arm over an empty corpus proves nothing)",
    governedIndex().paths.size >= 20, true);

  /* A fixture queue. Every case is one row, and the cases are the rule's edges. */
  const FIX = [
    `### ZZ-1 · queued — a row naming an architecture document`,
    `milestone: M4`,
    `scope: builds from \`docs/architecture/BIO_Case_Making_v0_1.md\` §3`,
    ``,
    `### ZZ-2 · queued — a row naming a §5 table document by BASENAME`,
    `milestone: M2`,
    `design: \`SCHEDULER.md\` §"The mechanism, and how the next consumer joins"`,
    ``,
    `### ZZ-3 · running — a row naming only an IC`,
    `milestone: M4`,
    `interface: I3 (IC-84 ACCEPTED)`,
    ``,
    `### ZZ-4 · queued — a row naming only LEDGERS and a kickoff`,
    `milestone: M0 (background lane)`,
    `interface: none`,
    `scope: \`DEBT.md\`'s row is the authority; see \`QUEUE.md\` and \`kickoffs/CONDUCT.md\``,
    ``,
    `### ZZ-5 · done — a closed row with no pointer at all`,
    `milestone: M8`,
    `scope: nothing here names a design, and history is not re-briefed`,
    ``,
    `### ZZ-6 · queued — an EXPLICIT routed gap`,
    `milestone: M9`,
    `design: MISSING — routed to BOB (CLAIMS.md DELEGATION 2026-09-14 M0 (M0-30) -> BOB)`,
    ``,
    `### ZZ-7 · queued — a routed gap that routes NOWHERE`,
    `milestone: M9`,
    `design: MISSING — routed to BOB`,
    ``,
    `### ZZ-8 · queued — an M0 row pointing at the test estate's own authority`,
    `milestone: M0 (background lane, holds no slot)`,
    `design: \`docs/development/VERIFICATION.md\` §"The negative-control register"`,
    ``,
    `### ZZ-9 · queued — a NON-M0 row pointing at the same process document`,
    `milestone: M4 — a build row`,
    `design: \`docs/development/VERIFICATION.md\``,
    ``,
    `### ZZ-10 · queued — an AMBIGUOUS basename`,
    `milestone: M8`,
    `design: \`README.md\``,
    ``,
    `### ZZ-11 · queued — a row whose own text names nothing`,
    `milestone: M8`,
    `interface: none`,
    ``,
    `## AN AREA HEADING — the prose below belongs to the AREA, not to ZZ-11`,
    `This section mentions \`docs/architecture/BIO_System_Design.md\` §3 in passing.`,
    ``,
  ].join("\n");

  const verdict = (queue, governedSet) => {
    const a = rowDesignAudit({ queue, governedSet: governedSet ?? governed() });
    const by = new Map(a.open.map((r) => [r.id, r.ok]));
    return { a, by };
  };
  const { a: FA, by } = verdict(FIX);

  t("the fixture parses as eleven rows, ten of them judged (the `done` row is not)",
    [FA.rows.length, FA.open.length, FA.skipped.length], [11, 10, 1]);
  t("ZZ-1 · a docs/architecture path passes", by.get("ZZ-1"), true);
  t("ZZ-2 · a §5-table document named by BASENAME passes", by.get("ZZ-2"), true);
  t("ZZ-3 · an IC token ALONE passes (over-strictness: an IC is an authority)", by.get("ZZ-3"), true);
  t("ZZ-4 · ledgers and a kickoff are NOT designs — the row FAILS", by.get("ZZ-4"), false);
  t("ZZ-5 · a `done` row with no pointer is NOT JUDGED (history is not re-briefed)",
    [by.has("ZZ-5"), FA.skipped.map((r) => r.id)], [false, ["ZZ-5"]]);
  t("ZZ-6 · an EXPLICIT routed gap passes — an admitted gap is honest", by.get("ZZ-6"), true);
  t("ZZ-7 · a routed gap naming no CLAIMS.md FAILS — a gap routed nowhere is a label",
    by.get("ZZ-7"), false);
  t("ZZ-8 · VERIFICATION.md passes for an M0 row (the test estate's own authority)",
    by.get("ZZ-8"), true);
  t("ZZ-9 · the SAME process document FAILS for a non-M0 row — the exception is scoped",
    by.get("ZZ-9"), false);
  t("ZZ-10 · an AMBIGUOUS basename (`README.md` is two governed documents) is not accepted",
    by.get("ZZ-10"), false);
  /* THE LOAD-BEARING BOUNDARY ARM. A row ends at the next `##` area heading, so the last row
     before one cannot pass on that area's prose. Measured, not assumed: without the bound,
     `SK-5` absorbed the whole DIST section and `FW-17` the IS-BUILD-PLAN status block. */
  t("ZZ-11 · a row does NOT inherit the area prose below it — it FAILS on its own text",
    by.get("ZZ-11"), false);
  t("the fixture's failures are exactly the five intended, and no sixth",
    FA.findings.map((f) => f.id).sort(), ["ZZ-10", "ZZ-11", "ZZ-4", "ZZ-7", "ZZ-9"].sort());

  /* THE GOVERNED SET DECIDES, AND IT IS THE TABLE'S. Same row, two sets: a path that is in
     the governed set passes and the same path out of it fails. This is the injectable half of
     the planted-§5-row control (the on-disk half is in the control block at the head). */
  const PLANT = [`### ZZ-12 · queued — a row naming a planted document`, `milestone: M8`,
                 `design: \`docs/development/PLANTED-DESIGN.md\` §1`, ``].join("\n");
  t("a path IN the governed set passes and the SAME path out of it fails — the table decides",
    [verdict(PLANT, [...governed(), "docs/development/PLANTED-DESIGN.md"]).by.get("ZZ-12"),
     verdict(PLANT, governed()).by.get("ZZ-12")], [true, false]);

  /* THE LIVE QUEUE. The cheap-and-early copy of the plancheck gate. */
  const LIVE = rowDesignAudit({ repo: REPO });
  console.log(`  queue design pointers: ${LIVE.open.length} open row(s) judged of ${LIVE.rows.length}, `
    + `${LIVE.skipped.length} closed, ${LIVE.unknownState.length} unrecognised state(s), `
    + `${LIVE.findings.length} naming no design`);
  t("QUEUE.md has open rows to judge (a totality assertion over an empty corpus proves nothing)",
    LIVE.open.length >= 5, true);
  t("every OPEN row in QUEUE.md names a governed design, an IC, or an explicitly routed gap",
    LIVE.findings.map((f) => `${f.id} (QUEUE.md:${f.line})`), []);
  t("every row state in QUEUE.md is one this rule recognises — an unrecognised state is NAMED, "
  + "never silently unjudged", LIVE.unknownState.map((r) => `${r.id} · ${r.state}`), []);

  /* THE MECHANISM IS IN THE LOOP. `plancheck` is what CONDUCT runs before every push, and a
     check that lives only in this battery would not reach the act that writes a row. Grepping
     plancheck's TEXT is satisfied by a comment — mergecarry's arm measured exactly that — so
     plancheck is RUN and its own report is read. */
  const pc = spawnSync(process.execPath, [join(REPO, "tools/plancheck.mjs"), "--local"],
    { cwd: REPO, encoding: "utf8" });
  t("plancheck RUNS the row-design check and reports it in its own output",
    /queue design pointers:\s*\d+ open row\(s\) judged/.test(pc.stdout || ""), true);
  t("plancheck's own count of open rows equals this suite's",
    ((pc.stdout || "").match(/queue design pointers: (\d+) open row\(s\) judged of (\d+)/) || []).slice(1, 3),
    [String(LIVE.open.length), String(LIVE.rows.length)]);
  /* `openRows` is exported and driven directly so a future refactor cannot quietly stop
     parsing the file that QUEUE_IDS above is read from. */
  t("the row parser agrees with this suite's own heading scan on the id set",
    openRows(queue).length >= QUEUE_IDS.size, true);
}

console.log(`\nplanning-hygiene: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

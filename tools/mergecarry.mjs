#!/usr/bin/env node
/* mergecarry — did the merge CARRY what the branch CHANGED?  (M0-20)
 *
 * WHY THIS EXISTS, AND IT IS A MEASURED DEFECT RATHER THAN A HAZARD SOMEBODY IMAGINED.
 *
 *   2026-08-08. CONDUCT merged REC-69 (branch `worktree-agent-a5723f4c87dfd5bd0`, tip
 *   `2d9c57b`, forked at `722c37b`) as `e241672`, first parent `7e5f9b0`. The branch had
 *   changed TWELVE files. The merge carried ELEVEN. The missing one was
 *   `civicos-ui/check-refusal-codes.mjs`, holding SEVENTY lines of floor moves.
 *
 *   NOTHING WENT RED. A dropped floor move goes SLACK, not broken. Eleven floors sat
 *   stale — families, rows, census, reach, governedSites, regions, regionLines,
 *   codesChecked, refusalsJudged, vocabularies, vocabularyTerms — with the battery green,
 *   `coverage.mjs --strict` at exit 0 and `civicos-ui/test/run.mjs` at exit 0. It
 *   surfaced days later, by accident, because REC-69 was re-run and its worker
 *   re-measured.
 *
 * A FAILURE THAT READS AS SUCCESS is this project's most expensive shape, and this is the
 * same shape as the merge loop that ledgered four items done while `git merge` had errored
 * out entirely. `kickoffs/CONDUCT.md` already carries the neighbouring lesson:
 * *"`--is-ancestor` PROVES A MERGE HAPPENED. IT DOES NOT PROVE THE CONTENT SURVIVED."*
 * That paragraph tells a reader to check for the content BY HAND, naming a file and a
 * symbol they must think of themselves. This is the instrument for the same question, and
 * it needs nobody to guess which file to look at.
 *
 *   node tools/mergecarry.mjs                  # merges in origin/main..HEAD
 *   node tools/mergecarry.mjs --range A..B     # merges in an arbitrary range
 *   node tools/mergecarry.mjs --commit <sha>   # one merge, whether or not it is queued
 *   node tools/mergecarry.mjs --verbose        # print every class, not only the findings
 *
 * WHAT IT COMPARES. For a merge M with parents P1..Pn, and for each non-first parent Pk:
 *
 *   branch-changed = paths differing between merge-base(P1,Pk) and Pk
 *   carried        = paths differing between P1 and M
 *
 * A path in branch-changed and not in carried is a CANDIDATE. Note the identity that makes
 * this cheap and exact: a path is absent from `P1..M` if and only if M's blob at that path
 * is byte-identical to P1's. So a candidate is never a file the merge merely resolved
 * oddly — it is always a file where MAIN'S VERSION WAS TAKEN WHOLE. That collapses the
 * space of explanations to four, and only one of them is the defect.
 *
 * THE HARD PART IS THE FALSE POSITIVE, AND IT IS WHERE THIS EARNS OR LOSES ITS PLACE. A
 * check that cries wolf gets switched off — that is `VERIFICATION.md`'s own stated reason
 * for not making `--strict` the gate yet. So every candidate is CLASSIFIED, and only one
 * class fails:
 *
 *   sameEnd    the branch's end state for the path IS what the merge has (blob at Pk ==
 *              blob at P1, including both-absent). Covers "the other side already made the
 *              same change", "the branch's change was already on main", "both deleted it".
 *              Nothing was lost. SILENT — this is the overwhelming majority and printing it
 *              is how a check becomes noise.
 *   moved      the branch's blob for the path is present SOMEWHERE ELSE in M's tree. A
 *              rename or a move on main, or a resolution that relocated it. NOTE.
 *   goneOnMain the path is absent from P1 entirely — main deleted or renamed it and the
 *              merge took that. The branch's work on it is genuinely gone, but at a
 *              modify/delete conflict git STOPS and a human answers, so it is a decision
 *              somebody made rather than one that happened to them. WARN, named, with the
 *              line count, so it is never invisible.
 *   dropped    the path is present in P1, the branch's version differs from main's, and the
 *              merge kept main's byte for byte. THE BRANCH'S CHANGE TO THIS PATH IS IN THE
 *              MERGE NOWHERE. This is REC-69's shape exactly. FAIL.
 *
 * WHAT IT CANNOT DISTINGUISH, STATED PLAINLY BECAUSE THE HONEST LIMIT IS THE POINT.
 * `dropped` is ALSO the shape of a correct hand-resolution that deliberately took one side
 * whole. No amount of git archaeology separates "I chose main's version and I was right"
 * from "I chose main's version and forgot the follow-up" — the trees are identical. THE
 * REC-69 MERGE WAS THE SECOND OF THOSE AND ITS MESSAGE DESCRIBES THE FIRST: it says
 * `check-refusal-codes.mjs` *"took OURS on all six floor hunks"* and promises the figures
 * are *"re-read from the printed figures of the green run at the end of this rebuild"*. The
 * promise was never kept. So prose is NOT the escape hatch here; prose is what failed.
 *
 * The escape hatch is a TRAILER, and it is deliberately something nobody writes by accident:
 *
 *     Dropped-from-branch: civicos-ui/check-refusal-codes.mjs — <why this is correct>
 *
 * That does not make the check able to tell right from wrong. It moves the drop from
 * SILENT to DECLARED, which is the whole of what an instrument can do here — and it puts
 * the declaration at the exact keystroke where REC-69's mistake was made, which is the
 * moment somebody has to finish the sentence "the branch's 70 lines are correctly
 * superseded because…". An unfinishable sentence is the finding.
 *
 * AND THE SECOND LIMIT, WHICH IS THE LARGER ONE AND IS NAMED HERE RATHER THAN LEFT FOR A
 * READER TO DISCOVER: THIS CHECK SEES WHOLE FILES AND NOTHING SMALLER. A merge that carries
 * `store.mjs` but keeps main's side on three of the branch's six hunks is INVISIBLE to it —
 * the path is in the carried set and no candidate is ever raised. That is the same defect
 * one granularity down, and it is deliberately not attempted, because at hunk granularity
 * the benign case IS the normal case: every keep-both resolution of `CLAIMS.md` and
 * `DEBT.md` takes some hunks and not others, ALL THIRTEEN merges of one 2026-08-08 batch
 * conflicted, and a check firing on each of them is a check switched off inside a week.
 * What bounds the damage today is that a WHOLE-FILE drop is the silent one — a partial
 * resolution is something a human was looking at hunk by hunk, while a whole-file take is
 * one keystroke that leaves no trace. The residual is real and is stated, not closed.
 */

import { execFileSync } from "node:child_process";

const ABSENT = null; /* a path with no blob at a commit. Distinct from "" and from a sha. */

/* THREE DROPS WERE ALREADY SITTING IN `origin/main` WHEN THIS WAS WRITTEN, and only one of
   them was known. The sweep that found the other two ran over 182 merges — the whole of
   main's history — and that is the number the false-positive claim rests on: THREE
   findings in 182 merges, and none of the three is a false positive.

   They are registered here rather than excused, with a reason each, and the register has NO
   SLACK IN EITHER DIRECTION: a fourth fails, and a registered one that has stopped being
   dropped ALSO fails, so the list cannot outlive its reason. That is `KNOWN_COLLISIONS`'s
   shape in `tools/mintid.mjs`, deliberately, because it is the same problem.

   THESE THREE ROWS ARE PERMANENT, AND SAYING SO IS THE HONEST VERSION. History cannot be
   rewritten here and a trailer cannot be added to a pushed commit, so the drop stays TRUE
   OF THE COMMIT for ever and `stale` will never fire for these by repair. An earlier
   draft of this comment claimed a row "leaves the list when the consequence is repaired",
   which is a mechanism believed on the strength of a sentence — nothing here grades a
   consequence. What the two directions actually buy:

     fresh  a drop in main's history that NOBODY HAS LOOKED AT. This is the direction that
            found two of the three. It fires on any new merge that reaches main with a drop,
            which is the case that matters.
     stale  a registered row that does not correspond to a real drop — a typo'd sha, a path
            that was never dropped, a row somebody added to quieten something else, or
            history having been rewritten under us. It cannot fire by repair, and it is not
            useless: it is what stops this list becoming an exemption list.

   THE REPAIR IS TRACKED WHERE REPAIRS ARE TRACKED — a debt row (D-263, D-264) — because
   the consequence of a drop is a fact about the CURRENT tree and this register is a fact
   about HISTORY. Conflating them is what the earlier draft did. */
export const KNOWN_HISTORICAL_DROPS = [
  { merge: "e241672", path: "civicos-ui/check-refusal-codes.mjs",
    why: "REC-69, 2026-08-08. 70 lines of floor moves. THE ITEM THIS CHECK EXISTS FOR. "
       + "The floors are NOT stale today — but CORRECTED 2026-08-09 (D-263) because the "
       + "reason this row gave was already false when it was written, and a register that "
       + "grades other people's stale sentences may not carry one. It said the merge `was "
       + "later reverted with git revert -m 1, so the floors are not stale`. That revert "
       + "(80473ea) was ITSELF reverted by the Reapply c8d25cb on 2026-08-09, so REC-69's "
       + "code is in the tree and `it was reverted` is no longer true of anything. What "
       + "actually makes the floors current is the REPLAY: bb7b026 (merged b376c9e) redid "
       + "REC-69 onto main and re-derived these floors from a printed run, finding FOUR "
       + "ratchets where the dropped diff had listed two — the repair went FURTHER than "
       + "the drop. Later items then moved them well past REC-69's intended values. "
       + "MEASURED 2026-08-09 on 19745ad, `node civicos-ui/test/run.mjs` exit 0 unpiped: "
       + "census 429, reach 222, 16 families, 168 rows, 68 governed sites, against the "
       + "dropped diff's 409/203/14/148/59 — every one superseded UPWARD. The drop is the "
       + "receipt and stays here; only its consequence is closed." },
  { merge: "0ca7640", path: "docs/development/VERIFICATION.md",
    why: "REC-68/D-228, 2026-08-08. The merge message says it kept OURS because ours was the "
       + "later measurement — and the number was the cheap half. What went with it was REC-68's "
       + "PROVENANCE SENTENCE recording that the arms figure moved 471 -> 482 and why it moved "
       + "TWICE. Consequence: that provenance is in the tree nowhere. Not repairable by editing "
       + "a number; the row would have to re-state how the figure moves." },
  { merge: "1c5d96a", path: "docs/development/DEBT.md",
    why: "CPDF-9, 2026-08-08. The branch closed D-232's open half; the merge kept main's row. "
       + "CONSEQUENCE, MEASURED 2026-08-09 AND STILL LIVE: D-232 reads `HALF CLOSED ... Open "
       + "half: the member's dependency resolution ... the battery names it dark on every run "
       + "until it is done`, while the battery prints `2 member(s) actually RAN` and no `DARK:` "
       + "at all. The work was done and the ledger still asks for it. Leaves this list when "
       + "D-232's disposition is corrected." },
];

export function git(args, { repo, allowFail = false } = {}) {
  try {
    return execFileSync("git", args, { cwd: repo, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).replace(/\n$/, "");
  } catch (e) {
    if (allowFail) return null;
    throw new Error(`git ${args.join(" ")} failed: ${(e.stderr || e.message || "").toString().trim()}`);
  }
}

const blobAt = (repo, commit, path) =>
  git(["rev-parse", "--quiet", "--verify", `${commit}:${path}`], { repo, allowFail: true }) || ABSENT;

/* Paths differing between two commits. `--no-renames` on BOTH sides on purpose: rename
   detection is a HEURISTIC with a similarity threshold, and a heuristic that fires on one
   side of a set difference and not the other invents candidates. Renames are handled
   afterwards, exactly, by looking for the branch's blob in the merge's tree. */
const changedPaths = (repo, a, b) => {
  const out = git(["diff", "--no-renames", "--name-only", "-z", `${a}`, `${b}`], { repo, allowFail: true });
  if (out === null) return null;
  return out.split("\0").filter(Boolean);
};

/* Lines the branch put into a path, for the message. `-` for binary; report it as such
   rather than as 0, because 0 reads like "nothing was lost". */
function branchLines(repo, base, tip, path) {
  const out = git(["diff", "--no-renames", "--numstat", "-z", base, tip, "--", path], { repo, allowFail: true });
  if (!out) return null;
  const f = out.split("\0")[0]?.split("\t");
  if (!f) return null;
  if (f[0] === "-" || f[1] === "-") return "binary";
  return (+f[0] || 0) + (+f[1] || 0);
}

/* Every blob sha in a commit's tree. Built ONCE per merge and only when a candidate exists,
   because it is the one expensive call here. */
function treeBlobs(repo, commit) {
  const out = git(["ls-tree", "-r", "-z", "--format=%(objectname)", commit], { repo, allowFail: true });
  if (out === null) return null;
  return new Set(out.split("\0").filter(Boolean));
}

/* Declared drops, from TRAILERS ONLY. `%(trailers)` is git's own parser, so this agrees
   with `git interpret-trailers` rather than with a regex somebody wrote once. A path is
   matched EXACTLY against the repo-root-relative path, after stripping any ` — reason`
   tail; a trailing basename does not count, because naming a file is not declaring that
   its changes were discarded — that distinction is the entire REC-69 receipt above. */
function declaredDrops(repo, commit) {
  const out = git(["show", "-s", "--format=%(trailers:key=Dropped-from-branch,valueonly)", commit],
    { repo, allowFail: true }) || "";
  const set = new Set();
  for (const line of out.split("\n")) {
    const v = line.split(/\s+[—–-]\s+/)[0].trim();
    if (v) set.add(v);
  }
  return set;
}

/* ------------------------------------------------------------------ one merge */

export function auditMerge({ repo, commit }) {
  const line = git(["rev-list", "--parents", "-n", "1", commit], { repo });
  const [sha, ...parents] = line.split(/\s+/);
  const subject = git(["show", "-s", "--format=%s", sha], { repo });

  const r = {
    merge: sha, short: sha.slice(0, 7), subject, parents,
    isMerge: parents.length > 1, octopus: parents.length > 2,
    sides: [], counts: { sameEnd: 0, moved: 0, goneOnMain: 0, dropped: 0, declared: 0 },
    findings: [], notes: [],
  };
  if (!r.isMerge) return r;

  const p1 = parents[0];
  const carried = changedPaths(repo, p1, sha);
  if (carried === null) { r.notes.push(`could not diff first parent ${p1.slice(0, 7)}..${sha.slice(0, 7)}`); return r; }
  const carriedSet = new Set(carried);
  const declared = declaredDrops(repo, sha);
  let blobs = null; /* lazy */

  for (const pk of parents.slice(1)) {
    const base = git(["merge-base", p1, pk], { repo, allowFail: true });
    const side = { parent: pk, short: pk.slice(0, 7), base, branchChanged: 0, candidates: [] };
    r.sides.push(side);
    if (!base) { r.notes.push(`no merge base between ${p1.slice(0, 7)} and ${pk.slice(0, 7)} — side not judged`); continue; }

    const branchChanged = changedPaths(repo, base, pk);
    if (branchChanged === null) { r.notes.push(`could not diff ${base.slice(0, 7)}..${pk.slice(0, 7)}`); continue; }
    side.branchChanged = branchChanged.length;
    side.carried = carried.length;

    for (const path of branchChanged) {
      if (carriedSet.has(path)) continue;

      /* Reaching here means M's blob at `path` equals P1's, byte for byte — that is what
         absence from the P1..M diff MEANS. So the only question left is why. */
      const atP1 = blobAt(repo, p1, path);
      const atPk = blobAt(repo, pk, path);

      /* THE ORDER OF THESE TESTS IS LOAD-BEARING AND WAS WRONG WHEN FIRST WRITTEN. Both
         mistakes were caught by the suite's benign arms rather than by reading, which is
         this project's most repeated finding about controls: they find the INSTRUMENT
         wrong more often than the subject.

         (i) The rename test must come BEFORE the absent-on-main test. Main renaming F to G
             leaves F ABSENT at P1, so a rename read as `goneOnMain` — a legitimate rename
             reported as lost work, which is the cry-wolf direction that gets a check
             switched off.
         (ii) Absent at P1 is TWO different things, and the first draft conflated them in
             the FALSE-NEGATIVE direction, which is far worse. `git merge -s ours` drops a
             file the branch ADDED; that path is absent at P1 for the opposite reason to a
             deletion, and it was scoring `goneOnMain` — a WARN — when it is the purest
             possible drop: brand-new work, carried nowhere, and the merge that produces it
             is the four-items-ledgered-while-git-errored shape exactly. The base decides
             which it is: a path that existed at the fork and is gone from P1 was REMOVED by
             main; a path that never existed at the fork was ADDED by the branch. */
      let klass;
      if (atP1 === atPk) klass = "sameEnd";
      else if (atPk === ABSENT) klass = "sameEnd"; /* branch deleted it, main kept it: the
                                                      merge kept main's file. A deletion the
                                                      merge declined is not a lost EDIT, and
                                                      it is loud in the tree rather than
                                                      silent. Counted, never failed. */
      else {
        if (blobs === null) blobs = treeBlobs(repo, sha) || new Set();
        if (blobs.has(atPk)) klass = "moved";
        else if (atP1 === ABSENT)
          klass = blobAt(repo, base, path) === ABSENT ? "dropped" : "goneOnMain";
        else klass = "dropped";
      }
      if (klass === "dropped" && declared.has(path)) klass = "declared";

      r.counts[klass]++;
      const c = { path, klass, base, branch: pk, lines: null };
      if (klass !== "sameEnd") c.lines = branchLines(repo, base, pk, path);
      side.candidates.push(c);
      if (klass !== "sameEnd") r.findings.push(c);
    }
  }
  return r;
}

/* ------------------------------------------------------------------ a range */

export function carryAudit({ repo, range = null, commit = null } = {}) {
  const out = { scope: null, merges: [], findings: [], notes: [], counts: { sameEnd: 0, moved: 0, goneOnMain: 0, dropped: 0, declared: 0 } };

  let shas;
  if (commit) {
    out.scope = `commit ${commit}`;
    shas = [git(["rev-parse", commit], { repo })];
  } else {
    let rev = range;
    if (!rev) {
      /* THE DEFAULT IS "THE MERGES YOU ARE ABOUT TO PUBLISH", because that is the moment
         this defect is cheap to fix and the only moment anybody is looking. */
      const remote = git(["rev-parse", "--quiet", "--verify", "origin/main"], { repo, allowFail: true });
      if (!remote) {
        /* Undetermined is first-class and gets STATED rather than guessed into a range. */
        out.notes.push("no origin/main in this repository — the publishable range is undetermined, "
          + "so only HEAD is judged, and only if HEAD is itself a merge.");
        rev = null;
      } else rev = "origin/main..HEAD";
    }
    out.scope = rev || "HEAD (no comparable remote)";
    if (rev) {
      shas = (git(["rev-list", "--merges", rev], { repo, allowFail: true }) || "").split("\n").filter(Boolean);
    } else {
      const head = git(["rev-parse", "HEAD"], { repo });
      shas = (git(["rev-list", "--merges", "-n", "1", head], { repo, allowFail: true }) || "")
        .split("\n").filter((s) => s === head);
    }
  }

  for (const sha of shas) {
    const m = auditMerge({ repo, commit: sha });
    out.merges.push(m);
    for (const k of Object.keys(out.counts)) out.counts[k] += m.counts[k];
    out.findings.push(...m.findings.map((f) => ({ ...f, merge: m.short, subject: m.subject })));
    out.notes.push(...m.notes.map((n) => `${m.short}: ${n}`));
  }
  return out;
}

/* ------------------------------------------------- the historical register

   Graded in BOTH directions over the real history, which is what makes it evidence rather
   than an exemption list. `fresh` is a drop nobody has looked at; `stale` is a registered
   drop that is no longer one, meaning somebody repaired it and the reason should go with
   the row. Either is a FAIL for the battery copy. */
export function historicalRegister({ repo, range = "origin/main" } = {}) {
  const a = carryAudit({ repo, range });
  const seen = new Set(a.findings.filter((f) => f.klass === "dropped").map((f) => `${f.merge}:${f.path}`));
  const known = new Set(KNOWN_HISTORICAL_DROPS.map((k) => `${k.merge}:${k.path}`));
  return {
    merges: a.merges.length,
    dropped: [...seen],
    fresh: [...seen].filter((k) => !known.has(k)),
    stale: [...known].filter((k) => !seen.has(k)),
    counts: a.counts,
  };
}

/* Drops plancheck should actually fail on: everything except the three already in main's
   history, which no push can fix and which are graded separately by the battery. */
export const unregisteredDrops = (findings) => {
  const known = new Set(KNOWN_HISTORICAL_DROPS.map((k) => `${k.merge}:${k.path}`));
  return findings.filter((f) => f.klass === "dropped" && !known.has(`${f.merge}:${f.path}`));
};

/* The sentence plancheck prints. Kept HERE rather than in plancheck so the CLI and the
   battery say the same thing, which is the reason `mintid.mjs` shares its predicate too. */
export function dropMessage(dropped) {
  return `DROPPED BY A MERGE — ${dropped.length} path(s) were changed on a merged branch and the\n`
    + `        merge kept MAIN'S VERSION BYTE FOR BYTE, so the branch's change to them is in the\n`
    + `        merged tree NOWHERE:\n`
    + dropped.map((d) => `          ${d.merge}  ${d.path}  (${d.lines === null ? "?" : d.lines} line(s) of branch change, `
        + `forked at ${String(d.base).slice(0, 7)})`).join("\n")
    + `\n        This is REC-69's defect, 2026-08-08: the merge carried 11 of the branch's 12 files,\n`
    + `        the missing one held 70 lines of FLOOR MOVES, and a dropped floor goes SLACK rather\n`
    + `        than red — battery green, --strict exit 0, UI harness exit 0, eleven floors stale for\n`
    + `        days until someone re-measured by accident.\n`
    + `        If the branch's version is genuinely superseded, SAY SO IN THE MERGE MESSAGE with a\n`
    + `        trailer per path and finish the sentence:\n`
    + `          Dropped-from-branch: <path> — <why the branch's change is correctly superseded>\n`
    + `        Prose naming the file is NOT the declaration and never has been: REC-69's merge\n`
    + `        message named this exact file, described taking main's side, and promised a re-read\n`
    + `        that never happened.`;
}

/* ------------------------------------------------------------------------ CLI */

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const repo = git(["rev-parse", "--show-toplevel"], { repo: process.cwd() });
  const a = carryAudit({ repo, range: arg("--range"), commit: arg("--commit") });
  const verbose = argv.includes("--verbose");

  console.log(`mergecarry: scope ${a.scope} — ${a.merges.length} merge(s)`);
  for (const m of a.merges) {
    if (!m.isMerge) { console.log(`  ${m.short}  NOT A MERGE (${m.parents.length} parent) — nothing to judge`); continue; }
    const s = m.sides.map((x) => `${x.branchChanged} changed`).join(" / ");
    console.log(`  ${m.short}  ${m.octopus ? `OCTOPUS ${m.parents.length} parents  ` : ""}branch ${s}`
      + `, merge carried ${m.sides[0]?.carried ?? "?"}  — ${m.subject.slice(0, 60)}`);
    if (verbose) for (const c of m.sides.flatMap((x) => x.candidates))
      console.log(`        ${c.klass.padEnd(11)} ${c.path}`);
  }
  for (const n of a.notes) console.log(`  note  ${n}`);
  console.log(`\n  sameEnd ${a.counts.sameEnd}  moved ${a.counts.moved}  goneOnMain ${a.counts.goneOnMain}`
    + `  declared ${a.counts.declared}  DROPPED ${a.counts.dropped}`);
  for (const f of a.findings.filter((f) => f.klass === "goneOnMain"))
    console.log(`  WARN  gone on main: ${f.merge} ${f.path} — the branch changed it (${f.lines} line(s)) and main removed the path.`);
  for (const f of a.findings.filter((f) => f.klass === "moved"))
    console.log(`  note  moved: ${f.merge} ${f.path} — the branch's blob is elsewhere in the merged tree.`);
  for (const f of a.findings.filter((f) => f.klass === "declared"))
    console.log(`  note  declared: ${f.merge} ${f.path} — dropped, and the merge message says so.`);
  const dropped = a.findings.filter((f) => f.klass === "dropped");
  if (dropped.length) console.log(`\n  FAIL  ${dropMessage(dropped)}`);
  process.exit(dropped.length ? 1 : 0);
}

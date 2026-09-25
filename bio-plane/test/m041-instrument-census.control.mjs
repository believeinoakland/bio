/* m041-instrument-census.control.mjs — THE NEGATIVE CONTROL FOR M0-41's CENSUS.
 *
 * **AN ALL-GREEN TABLE IS THE RESULT TO DISTRUST**, so this plants a KNOWN BYPASS
 * of an instrument and requires the census to find it — and, for the namespace the
 * census declares blind, requires the census to come back with a NEGATIVE and say
 * so. A census that cannot return a negative is a walk looking in the wrong place.
 *
 * NOT A `.test.mjs`, for `fleetbundles.control.mjs`'s reason: it EDITS REAL CORPUS
 * FILES and COMMITS while it runs, and neither the battery nor the fleet walk must
 * discover it. THE HARNESS AND ITS PRISTINE COPIES LIVE INSIDE THIS WORKTREE and
 * never in the shared scratchpad, which a concurrent worker overwrote between ARM
 * and RESTORE once already (PL-10).
 *
 * ======================================================== HOW THE ARMS ARE SAFE
 *
 * `tools/mintid.mjs --audit --base <ref>` reads `git diff -U0 <base>...HEAD` —
 * **COMMITTED WORK ONLY, which is itself a measured property of the instrument and
 * is in the published table**: an id sitting in the working tree is invisible to
 * it. So arms 2 and 3 must COMMIT to be seen.
 *
 * **THE COMMITTING ARMS REFUSE TO RUN ON A DIRTY TREE.** `git reset --hard` is how
 * they are undone, and `CLAUDE.md`'s receipt for the adjacent `git checkout --` is
 * a session losing a whole implementation it had not committed. So the precondition
 * is checked, not assumed: if `git status --porcelain` is non-empty the arm REFUSES
 * and says so rather than arming. The HEAD sha is recorded before and compared
 * after, and a mismatch is a FINDING printed by name.
 *
 * Arms 1 and 4 need no commit and are restored by `cp` from a UNIQUELY-NAMED
 * per-arm pristine copy, verified by sha256 AND by `cmp`, with a byte count
 * printed and a minimum guarded.
 *
 * ==================================================================== THE ARMS
 *
 * Each arm names what MUST fail and what MUST NOT, and each is armed ALONE with
 * the others held open. EVERY ANCHOR IS VALIDATED BEFORE ANYTHING IS EDITED
 * (D-331): an arm whose patch matches zero times, or more than once, is a FINDING
 * reported by name and never a silent pass — *an arm that did not arm is a
 * finding*, and this estate has caught three of them.
 *
 *   (1) BASELINE — no edit. The census reads its unmodified figures. **This row
 *       exists because a harness whose first run reported `null` for every arm
 *       INCLUDING the baseline is a real receipt here: only the baseline row
 *       distinguishes six-arms-broken from six-arms-working.**
 *
 *   (2) PLANTED BYPASS, GRADED NAMESPACE — a hand-picked `M0-` id the ledger never
 *       issued, written into the queue corpus as a real item heading and COMMITTED (`QUEUE.md` until M0-110 moved the cache to `coord`; `MILESTONES.md` since — see the arm).
 *         MUST FAIL:    the census's section C reports NOT HELD >= 1 and NAMES it.
 *         MUST NOT:     no ID arm of `plancheck --local` fires — and that half is
 *                       the FINDING, not the control. The loop every session is
 *                       told to run cannot see a bypass `mintid --audit --base`
 *                       sees immediately.
 *       **THIS ARM'S DECLARATION WAS CORRECTED AFTER ITS FIRST RUN, AND THE
 *       CORRECTION IS THE MORE USEFUL HALF.** It originally declared `plancheck`
 *       would read `0 fail`. It read `1 fail` — not because plancheck saw the
 *       planted id, but because EDITING A CORPUS FILE STALES `docs/DECIDED.md`
 *       and a different arm fired. A count cannot tell those apart, so the arm
 *       now classifies WHICH arms failed and asserts on the ID arms by name. An
 *       arm that trips a different arm of the instrument it is measuring proves
 *       nothing about the arm it was aimed at.
 *       **AND THE SAME RUN CAUGHT THIS CONTROL'S OWN MATCHER GRADING ONE
 *       SPELLING**: it reported `NOT HELD 1 · names M0-9001: false`, because
 *       `mintid` prints the tally as `NOT HELD` and LABELS the ids `QUESTION`
 *       ("ASK, do not fail"). The count was right and every id was invisible —
 *       this estate's most-repeated instrument defect, inside the instrument
 *       written to catalogue it.
 *       **AND ITS ANCHOR THEN DIED THE WAY EVERY ANCHOR IN THIS ESTATE DIES — ON
 *       AN ORDINARY ACT, NOT ON ANYBODY'S MISTAKE.** It quoted `M0-41 · running`.
 *       CONDUCT flipped that row to `done`, which is the loop working exactly as
 *       designed, and the anchor went to ZERO; M0-56's worker found it on
 *       2026-09-17 while draining its own row, reporting `3 as declared · 1 NOT as
 *       declared · 1 finding(s)` and saying so rather than working around it.
 *       **A ROW'S STATUS WORD IS THE ONE TOKEN IN A QUEUE ITEM GUARANTEED TO
 *       CHANGE** — `queued` -> `running` -> `done` is the queue's whole purpose —
 *       so an anchor resting on one was not stale by accident but stale by
 *       construction, on a clock nobody was reading. The anchor is now the M0
 *       LANE'S OWN AREA HEADING: a structural line in the same `^## <AREA> — …`
 *       grammar `plancheck` reads areas from, which moves only when somebody
 *       restructures the lane deliberately, and the plant lands as that lane's
 *       FIRST ROW, where an M0 item belongs.
 *
 *       **AND THE DURABILITY THAT ACTUALLY PAYS IS NOT CLEVERNESS — IT IS BEING
 *       WATCHED.** This driver sat in the BLIND HALF of
 *       `m025-arm-anchor-witness.test.mjs`, the anchor-liveness check the battery
 *       ALREADY RUNS, built by M0-25 for precisely this defect class (D-276) — so
 *       nothing in any loop could see the zero until somebody ran this whole
 *       control on a clean tree, which is a periodic act. **The cause was measured
 *       rather than guessed, and it was two independent refusals:** that suite
 *       extracts literals from eight anchor-bearing SHAPES and `anchor:` as an
 *       object KEY is none of them, and the old literal was 19 characters carrying
 *       no code-shaped punctuation, so both of its filters would have refused it
 *       even in a shape it could read. Arms (2) and (4) now bind their anchors to
 *       named `const anchor…` literals — the suite's `anchor…=` assignment shape
 *       — so **A4 FAILS THE BATTERY on the next anchor here that goes to zero**
 *       instead of leaving it for a run nobody schedules.
 *       **AND WRITING THIS PARAGRAPH TRIPPED THE VERY SUITE IT IS ABOUT, WHICH IS
 *       WHY THE SPELLING ABOVE CARRIES AN ELLIPSIS.** The witness's anchor half
 *       does NOT strip comments, and its literal grammar accepts a BACKTICK
 *       string — so prose naming one of its eight shapes inside backticks reads as
 *       an anchor-bearing position, and the span from the closing backtick to the
 *       next one reads as the anchor. The first draft of this section put the
 *       shape's name in bare backticks twice and A4 came back red with TWO dead
 *       anchors that are not arms at all. **Both were PROSE, both were guaranteed
 *       dead, and neither is a defect in any arm** — a false finding, which is the
 *       over-strictness direction this estate refuses everywhere else. The suite
 *       already closes exactly this class on its LABEL half (arm S10: *a driver's
 *       own COMMENTARY is not its code*) and not on its ANCHOR half, so it is the
 *       fix-the-class shape with one half done. ROUTED to CONDUCT in `CLAIMS.md`
 *       rather than fixed here: it is an edit to M0-25's suite with its own
 *       control and reach figures to re-measure, and this claim moves no
 *       `.test.mjs`. Until then, **naming one of those shapes in prose here needs
 *       the ellipsis spelling**, and that is the workaround NAMED rather than
 *       performed silently — `CLAUDE.md`'s rule about a defence nobody records.
 *       **A REGEX ANCHOR WAS THE OTHER CANDIDATE AND IT IS DECLINED, WITH THE
 *       REASON, because it is the more obvious answer and the worse one.**
 *       `/^## M0 — [^\n]*\n/m` survives the heading's descriptor being reworded,
 *       which the literal does not. But that witness suite DECLARES ITSELF BLIND
 *       to a RegExp anchor, so the tail-insensitive spelling buys durability by
 *       leaving the arm unwatched — and an unwatched anchor is exactly what cost
 *       this arm. A literal that fails the battery the day it moves is worth more
 *       than a pattern that survives a rewording nobody was going to make.
 *
 *       **WHAT STAYS BLIND, NAMED RATHER THAN LEFT AS A SILENCE.** Arm (3)'s
 *       anchor is `MEASUREMENTS.md`'s H1 — 14 characters, no code punctuation —
 *       and the witness REFUSES it ON PURPOSE: its own arm S4 asserts that prose
 *       carrying no code-shaped punctuation is not an anchor, and loosening that
 *       filter is the over-strictness direction its control drives. A document's
 *       H1 is already the most durable line in it, so arm (3) keeps it unchanged
 *       and `test/m025-arm-census.mjs`, which RUNS the arms, is what covers it.
 *       Arm (5) holds no anchor at all — it is a RENAME.
 *
 *   (3) PLANTED BYPASS, UNGRADED NAMESPACE — the worked example this project
 *       already owns. A hand-picked `M-` id written into `MEASUREMENTS.md` and
 *       COMMITTED.
 *         MUST NOT FAIL: the census MUST NOT report it. `M` declares no allocation
 *                        site, so the diff arm cannot tell an allocation from a
 *                        mention. **A GREEN HERE IS THE DEFECT, NOT THE PASS.**
 *         MUST:          section B must NAME `M` as UNAUDITABLE with its reason.
 *                        The census's job is to return the NEGATIVE and say why.
 *       **THIS DECLARATION HAS DECAYED AND THE ARM IS TRUTHFULLY RED — MEASURED
 *       2026-09-17, NOT SMOOTHED, NOT EXEMPTED.** See the note at the arm's own
 *       site, which carries the measurement and the decision it needs. It is a
 *       SEPARATE defect from arm (2)'s stale anchor, it predates this session, and
 *       repointing arm (2) neither caused nor cured it — it was merely HIDDEN
 *       behind arm (2)'s louder did-not-arm finding, which is the whole argument
 *       for a control that reports every arm rather than a tally.
 *
 *   (4) OVER-STRICTNESS — correct work in a spelling the matcher did not
 *       anticipate must PASS. `civicos-ui/check-semantics.mjs` is reached by
 *       `civicos-ui/test/run.mjs` through a SPAWN and never through an import;
 *       an edge reader that only followed imports would score it a GAP.
 *         MUST FAIL:    with `spawnEdges` neutered, `check-semantics.mjs` and
 *                       `check-refusal-codes.mjs` flip from USED to CONVENTION —
 *                       two FALSE GAPS, proving the arm can bite.
 *         MUST NOT:     the shipped reader must not produce them. A census that
 *                       calls a legitimately-composed instrument a defect produces
 *                       a list nobody can act on.
 */

import { readFileSync, writeFileSync, copyFileSync, statSync, existsSync, unlinkSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const DRIVER = join(HERE, "m041-instrument-census.mjs");

const sh = (args, opts = {}) =>
  execFileSync(args[0], args.slice(1), { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28, ...opts });
const shq = (args) => { try { return sh(args); } catch (e) { return String(e.stdout || "") + String(e.stderr || ""); } };
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const bytes = (p) => statSync(p).size;

const results = [];
const findings = [];
let armsNeverArmed = 0;

/* --------------------------------------------------------------- arming, safely
   A patch whose anchor does not occur EXACTLY ONCE is refused before the file is
   touched. The count is printed either way, because a silent "it matched" is the
   arm-never-armed defect wearing a pass. */
function armFile(rel, anchor, replacement, tag) {
  const abs = join(REPO, rel);
  const pristine = join(HERE, `.m041-pristine-${tag}-${rel.replace(/[\/.]/g, "_")}`);
  const src = readFileSync(abs, "utf8");
  const n = src.split(anchor).length - 1;
  if (n !== 1) {
    armsNeverArmed++;
    findings.push(`ARM ${tag}: anchor occurred ${n} time(s) in ${rel}, not 1 — THE ARM DID NOT ARM, and that is a finding, not a pass`);
    return null;
  }
  copyFileSync(abs, pristine);
  const before = { sha: sha(abs), bytes: bytes(abs) };
  if (before.bytes < 1000) {
    findings.push(`ARM ${tag}: ${rel} is ${before.bytes} B — below the guarded minimum; refusing to arm over a file this small`);
    unlinkSync(pristine);
    return null;
  }
  writeFileSync(abs, src.replace(anchor, replacement));
  return {
    rel, abs, pristine, before,
    restore() {
      copyFileSync(pristine, abs);
      const after = { sha: sha(abs), bytes: bytes(abs) };
      let cmpOk = true;
      try { sh(["cmp", pristine, abs]); } catch { cmpOk = false; }
      const ok = after.sha === before.sha && after.bytes === before.bytes && cmpOk;
      if (!ok) findings.push(`ARM ${tag}: RESTORE OF ${rel} NOT BYTE-IDENTICAL — sha ${before.sha.slice(0, 12)} -> ${after.sha.slice(0, 12)}, ${before.bytes} -> ${after.bytes} B, cmp ${cmpOk ? "ok" : "DIFFERS"}`);
      unlinkSync(pristine);
      return { ok, before, after, cmpOk };
    },
  };
}

function runCensus() {
  const out = shq([process.execPath, DRIVER]);
  const reach = (re) => { const m = out.match(re); return m ? m[1] : null; };
  return {
    out,
    used: Number(reach(/(\d+) used by a loop/)),
    testedOnly: Number(reach(/·\s+(\d+) TESTED ONLY/)),
    convention: Number(reach(/·\s+(\d+) convention-only/)),
    notHeld: Number(reach(/NOT HELD (\d+) ·/)),
    introduced: Number(reach(/introduced (\d+) ·/)),
    unauditable: (out.match(/UNAUDITABLE \((.+?)\)/) || [])[1] || null,
    namesSemantics: /USED\s+civicos-ui\/check-semantics\.mjs/.test(out),
    namesRefusal: /USED\s+civicos-ui\/check-refusal-codes\.mjs/.test(out),
    namesId: (id) => new RegExp(`NOT HELD\\s+${id}\\b`).test(out),
  };
}

/* **WHICH ARM OF plancheck FIRED IS THE WHOLE QUESTION, NOT A DETAIL.** The first
   run of this control declared that `plancheck --local` would still pass over a
   planted id and it FAILED — and a bare `1 fail` cannot tell "plancheck caught
   the id bypass" from "plancheck caught something else my arm also broke". It was
   the second: editing a corpus file staled `docs/DECIDED.md`, and plancheck's
   decided-index arm fired. An arm that trips a DIFFERENT arm of the instrument it
   is measuring proves nothing about the arm it was aimed at, so the failure TEXT
   is captured and classified here rather than counted. */
function plancheckLocal() {
  const out = shq([process.execPath, join(REPO, "tools/plancheck.mjs"), "--local"]);
  const m = out.match(/plancheck:\s*(\d+) fail,\s*(\d+) warn/);
  /* `plancheck` prints `  FAIL  <message>` — UPPERCASE. The first version of this
     line matched lowercase `fail` and read ZERO fail lines while the tally said
     one, so `sawId` came back false having cost NOTHING to produce: an assertion
     that could never have been honoured, which is the receipt this estate already
     owns three times. The reader is corrected AND the impossibility is now
     detectable — see `blind` below. */
  const fails = [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1].trim());
  const n = m ? Number(m[1]) : -1;
  return {
    out, fail: n, warn: m ? Number(m[2]) : -1,
    fails,
    /* **THE GUARD THAT MAKES `sawId` WORTH READING.** If the tally says N>0 and
       this reader extracted no lines, it is BLIND and `sawId: false` means
       nothing. Reported as a finding rather than passed through. */
    blind: n > 0 && fails.length === 0,
    /* the arms that would mean plancheck SAW the id bypass */
    sawId: fails.some((f) => /DUPLICATE ID|UNREGISTERED ID NAMESPACE/.test(f)),
  };
}

/* ------------------------------------------------------------------- the run */
console.log("M0-41 NEGATIVE CONTROL — the census must be able to come back with a NEGATIVE\n");

/* M0-197: each arm's anchor as data for tools/anchordrift.mjs, before the first git call (a no-op otherwise). The
   quotes are armFile's anchors below, copied: they are bound where each arm arms, after side effects this read may not run. */
anchorTable([{ arm: "(1) baseline", none: "nothing armed" },
  { arm: "(4) over-strictness", file: join(REPO, "bio-plane/test/m041-instrument-census.mjs"), find: "  const call = /\\b(?:execSync|execFileSync|spawnSync|spawn|exec)\\s*\\(/g;" },
  { arm: "(2) planted bypass, GRADED namespace", file: join(REPO, "docs/development/MILESTONES.md"), find: "## How this file stays true\n" },
  { arm: "(3) planted bypass, UNGRADED namespace (M)", file: join(REPO, "docs/development/MEASUREMENTS.md"), find: "# Measurements" },
  { arm: "(5) silent degrade", none: "renames tools/corpuscheck.mjs aside; quotes nothing" }]);

const head0 = sh(["git", "rev-parse", "HEAD"]).trim();
const dirty0 = sh(["git", "status", "--porcelain"]).trim();
console.log(`HEAD at start ${head0.slice(0, 12)} · working tree ${dirty0 ? "DIRTY" : "clean"}`);

/* ---- (1) BASELINE ------------------------------------------------------- */
const base = runCensus();
const basePlan = plancheckLocal();
results.push({
  arm: "(1) baseline", declared: "the census reads clean; plancheck --local 0 fail",
  actual: `used ${base.used} · TESTED ONLY ${base.testedOnly} · convention ${base.convention} · introduced ${base.introduced} · NOT HELD ${base.notHeld} · UNAUDITABLE ${base.unauditable} · plancheck ${basePlan.fail} fail`,
  pass: base.used > 0 && base.notHeld === 0 && basePlan.fail === 0,
});

/* ---- (4) OVER-STRICTNESS (no commit needed; run before the committing arms) */
{
  /* BOUND TO A NAMED `const anchor…` for the reason the header gives: this is
     `m025-arm-anchor-witness.test.mjs`'s `anchor…=` assignment shape, so A4 fails
     the BATTERY if this line in the census driver is ever changed in place without
     the quote moving with it. That is the D-276 class, and it is what killed arm
     (2). The ellipsis in the shape's name is load-bearing — see the header. */
  const anchorOverstrict = "  const call = /\\b(?:execSync|execFileSync|spawnSync|spawn|exec)\\s*\\(/g;";
  const a = armFile("bio-plane/test/m041-instrument-census.mjs", anchorOverstrict,
    "  const call = /\\bNEVER_MATCHES_M041_OVERSTRICT_ARM\\s*\\(/g;",
    "overstrict");
  if (a) {
    const armed = runCensus();
    const r = a.restore();
    const flipped = !armed.namesSemantics && !armed.namesRefusal;
    results.push({
      arm: "(4) over-strictness: spawnEdges neutered",
      declared: "check-semantics AND check-refusal-codes flip USED -> CONVENTION (two FALSE gaps); the shipped reader must NOT produce them",
      actual: `armed: semantics USED=${armed.namesSemantics} refusal USED=${armed.namesRefusal} · convention ${base.convention} -> ${armed.convention} · restore byte-identical: ${r.ok ? "YES" : "NO"} (${r.before.bytes} B, sha ${r.before.sha.slice(0, 12)}, cmp ${r.cmpOk ? "ok" : "DIFFERS"})`,
      pass: flipped && base.namesSemantics && base.namesRefusal && r.ok,
    });
  }
}

/* ---- the committing arms ------------------------------------------------- */
function commitArm({ tag, rel, anchor, replacement, expectId, declared, judge }) {
  const dirty = sh(["git", "status", "--porcelain"]).trim();
  if (dirty) {
    findings.push(`ARM ${tag}: REFUSED — the working tree is dirty and this arm undoes itself with \`git reset --hard\`, which would discard it. Commit first.`);
    results.push({ arm: tag, declared, actual: "REFUSED — dirty tree; the arm was not run", pass: null });
    return;
  }
  const headBefore = sh(["git", "rev-parse", "HEAD"]).trim();
  const a = armFile(rel, anchor, replacement, tag.replace(/[^\w]/g, ""));
  if (!a) return;
  sh(["git", "add", rel]);
  sh(["git", "commit", "-q", "-m", `m041 control arm ${tag} — planted bypass, reverted in the same run`]);
  const armed = runCensus();
  const plan = plancheckLocal();
  /* undo: the arm is the only commit and everything else was committed first */
  sh(["git", "reset", "--hard", "-q", headBefore]);
  const headAfter = sh(["git", "rev-parse", "HEAD"]).trim();
  if (headAfter !== headBefore)
    findings.push(`ARM ${tag}: HEAD NOT RESTORED — ${headBefore.slice(0, 12)} -> ${headAfter.slice(0, 12)}`);
  if (existsSync(a.pristine)) unlinkSync(a.pristine);
  if (plan.blind)
    findings.push(`ARM ${tag}: the plancheck fail-line reader extracted 0 lines while the tally said ${plan.fail} — BLIND, so \`sawId: false\` cost nothing to produce and proves nothing`);
  results.push({
    arm: tag, declared,
    actual: `introduced ${armed.introduced} · NOT HELD ${armed.notHeld} · names ${expectId}: ${armed.namesId(expectId)} · plancheck ${plan.fail} fail [${plan.fails.join("; ") || "none"}]${plan.blind ? " *** READER BLIND ***" : ""} · plancheck SAW the id bypass: ${plan.sawId ? "YES" : "NO"} · HEAD restored: ${headAfter === headBefore ? "YES" : "NO"}`,
    pass: judge(armed, plan) && headAfter === headBefore,
  });
}

/* **THE M0 LANE'S AREA HEADING, BOUND TO A NAMED `const anchor…` SO THE BATTERY
   READS IT.** Both halves are deliberate and the header's arm-(2) section argues
   them: the area heading carries no row STATUS WORD, which is what took the old
   anchor to zero, and the `anchor…=` binding is what lifts this driver out of
   `m025-arm-anchor-witness.test.mjs`'s blind half. The trailing newline is PART
   of the anchor, so the plant is spliced between whole lines and never into the
   middle of one; the replacement re-emits the heading and the plant becomes the
   lane's first row, which is where an M0 item belongs. */
/* CORRECTED 2026-09-18 by SCHEDULER (LED-6 step (2)): the anchor WAS QUEUE.md's
   M0 lane heading (the "M0 — VERIFICATION" section, quoted here without its markup so
   the anchor witness does not read this comment as a live anchor — M0-66's class).
   The pipeline migration moved every per-area section to
   `docs/archive/ledgers/QUEUE-narrative-2026-09-18.md`, so that heading no longer
   exists in the cache and the anchor went to ZERO (`m025-arm-anchor-witness` A4 named
   it). The old assertion was not wrong about the file it was written against; the
   file moved. The census grades an id by its `### <ID> ·` heading ANYWHERE in the
   file, so WHERE the plant lands does not change what the arm measures: it now
   follows the BOB INBOX heading, the one heading every version of the cache keeps. */
/* CORRECTED 2026-09-22 by M0-110: the cache (`QUEUE.md`) left `main` for the branch `coord` (TREE-SHARING.md §1), so
   this working tree holds only its one-line pointer and the inbox heading this arm quoted was no longer on `main` at
   all — `m025-arm-anchor-witness` A4 named it at ZERO in the cutover simulation, and a commit to the pointer would
   plant nothing the census reads. The arm is not wrong about what it measures; its SUBJECT moved. The census grades a
   `### <ID> ·` heading ANYWHERE in the queue corpus (`mintid.mjs` QUEUE_CORPUS), and `MILESTONES.md` is in that
   corpus and STAYS on `main` (BOB #28's ruling 3 moves only its placement table). So the plant lands in MILESTONES.md,
   before its closing structural heading, which carries no status word and moves only when the ladder is restructured. */
const anchorGraded = "## How this file stays true\n";

commitArm({
  tag: "(2) planted bypass, GRADED namespace",
  rel: "docs/development/MILESTONES.md",
  anchor: anchorGraded,
  replacement: "### M0-9001 · queued — M0-41 CONTROL ARM, a hand-picked id the ledger never issued; reverted in the same run\nmilestone: M0\ndesign: `docs/development/VERIFICATION.md`\n\n" + anchorGraded,
  expectId: "M0-9001",
  declared: "census names M0-9001 NOT HELD; plancheck --local does NOT see the id bypass (no DUPLICATE ID / UNREGISTERED NAMESPACE arm fires) and that half is the finding. CORRECTED after the first run: the original declaration said plancheck would read 0 fail, which conflated 'plancheck cannot see the id' with 'my arm broke nothing else' — editing a corpus file stales docs/DECIDED.md and fires a DIFFERENT arm. The question is WHICH arm, never HOW MANY. REPOINTED 2026-09-17: the anchor was `M0-41 · running` and that row now reads `done`, so the arm refused to arm and the guard reported it as a finding — it is now the M0 lane's AREA HEADING, which carries no status word, and it is bound to a named `const anchor…` so the battery's own anchor-liveness check stops being blind to this driver.",
  judge: (a, p) => a.notHeld >= 1 && a.namesId("M0-9001") && p.sawId === false,
});

/* **ARM (3)'S DECLARATION WAS FALSIFIED BY A SIBLING ITEM, AND THE RED IS THE ARM
   TELLING THE TRUTH. IT IS LEFT RED ON PURPOSE.**

   MEASURED 2026-09-17, from the artifacts rather than from a second document
   saying so. The arm reports `NOT AS DECLARED`; `names M-9002: false` still holds
   and `plancheck SAW the id bypass: NO` still holds, so the clause that fails is
   the one requiring section B to name `M` as UNAUDITABLE. It does not, because
   **M0-39 DECLARED AN ALLOCATION SITE FOR `M`** — landed `f2fc2b89`, 2026-09-15,
   found with `git log -S` over `tools/mintid.mjs` and not recalled — and the
   census now prints `20 of 21 namespace(s) gradable · 1 UNAUDITABLE (C)`. The
   declaration was TRUE the day M0-41 wrote it and a sibling closed the gap it
   rested on, which is this estate's row-outlived-its-work class arriving inside a
   control arm.

   **AND THE FIRST CLAUSE NOW PASSES FOR A CHANGED REASON, WHICH IS WORSE THAN A
   FAILING CLAUSE BECAUSE IT LOOKS LIKE A PASS.** The plant writes a THREE-hash
   heading; `M`'s declared site is the TWO-hash entry heading and the queue's
   three-hash item heading is deliberately outside it. So the planted id is
   invisible as a WRONG-SHAPE PLANT rather than as an unauditable namespace — the
   arm still arms, still measures something, and no longer measures what it says.

   **WHY THE JUDGE IS NOT BEING RELAXED.** Dropping the UNAUDITABLE clause turns a
   truthful red into a green over an arm that proves strictly less, which is
   `CLAUDE.md`'s *correct superseded tests, never exempt them* read backwards. The
   correction is a DECISION and it is routed to CONDUCT in `CLAIMS.md` rather than
   taken inside a claim that was opened to repoint one anchor: `C` is the only
   UNAUDITABLE namespace left and it is ungraded for a DIFFERENT reason (a dotted
   family repeats its number by design), so re-aiming the negative there means a
   control arm writing the CHECK CATALOG, which is a ruling about what a control
   may edit and not a detail. The other half worth rowing beside it is a POSITIVE
   arm planting at M's real two-hash site to prove M0-39's site actually bites. */
commitArm({
  tag: "(3) planted bypass, UNGRADED namespace (M)",
  rel: "docs/development/MEASUREMENTS.md",
  anchor: "# Measurements",
  replacement: "# Measurements\n\n### M-9002 · M0-41 CONTROL ARM — a hand-picked measurement id the ledger never issued; reverted in the same run\n",
  expectId: "M-9002",
  declared: "the census MUST NOT find it — M declares no allocation site — and MUST name M as UNAUDITABLE. A GREEN HERE IS THE DEFECT, NOT THE PASS",
  judge: (a, p) => !a.namesId("M-9002") && /UNAUDITABLE\s+M\s/.test(a.out) && p.sawId === false,
});

/* ---- (5) THE SILENT-DEGRADE ARM ----------------------------------------- */
/* **DRIVEN RATHER THAN READ, because a mechanism believed on its EXISTENCE
   rather than its behaviour is the defect this project meets most.**
   `plancheck.mjs` imports three of its arms with `.catch(() => ({}))` —
   `corpuscheck.mjs` (section 6), `rowdesign.mjs` (section 7) and `decided.mjs`
   (the index arm) — and on a failed import each pushes a WARN, not a FAIL. A
   WARN does not move the exit status. So an arm that cannot LOAD reports
   `UNVERIFIED this run` and `plancheck` still exits 0, with the design corpus,
   the row-design rule and the decided index all unchecked.

   THE ARM IS A RENAME, NOT AN EDIT. `tools/**` is M0-39's ground; this row
   writes ABOUT it and changes not one byte of it. The file is moved aside and
   moved back, and the sha is taken before and after anyway, because a restore is
   only believable if it is measured. It happens in THIS worktree's checkout and
   cannot reach any other worktree's. */
{
  const tag = "(5) silent degrade";
  const rel = "tools/corpuscheck.mjs";
  const abs = join(REPO, rel);
  const aside = abs + ".m041-armed-aside";
  if (!existsSync(abs)) {
    findings.push(`ARM ${tag}: ${rel} not found — THE ARM DID NOT ARM`);
    armsNeverArmed++;
  } else {
    const before = { sha: sha(abs), bytes: bytes(abs) };
    renameSync(abs, aside);
    const armedGone = !existsSync(abs);
    const plan = plancheckLocal();
    renameSync(aside, abs);
    const after = { sha: sha(abs), bytes: bytes(abs) };
    const restored = after.sha === before.sha && after.bytes === before.bytes;
    if (!restored) findings.push(`ARM ${tag}: RESTORE OF ${rel} NOT IDENTICAL — ${before.sha.slice(0, 12)} -> ${after.sha.slice(0, 12)}`);
    if (!armedGone) { armsNeverArmed++; findings.push(`ARM ${tag}: the file was still present after the move — THE ARM DID NOT ARM`); }
    const warned = /could not be loaded|UNVERIFIED/.test(plan.out);
    results.push({
      arm: tag,
      declared: "with corpuscheck.mjs unloadable, plancheck WARNS (UNVERIFIED this run) and STILL EXITS 0 — the design corpus and the row-design rule go unchecked and the gate reads green. MUST NOT: it must not FAIL, because the not-failing IS the finding",
      actual: `armed (file gone): ${armedGone} · plancheck ${plan.fail} fail, ${plan.warn} warn [${plan.fails.join("; ") || "none"}]${plan.blind ? " *** READER BLIND ***" : ""} · said UNVERIFIED: ${warned} · restored identically: ${restored ? "YES" : "NO"} (${before.bytes} B, sha ${before.sha.slice(0, 12)})`,
      pass: armedGone && plan.fail === 0 && warned && restored,
    });
  }
}

/* ------------------------------------------------------------------- report */
console.log("\n--- ARMS, declared vs actual ---");
for (const r of results) {
  console.log(`\n  ${r.arm}`);
  console.log(`    DECLARED: ${r.declared}`);
  console.log(`    ACTUAL:   ${r.actual}`);
  console.log(`    ${r.pass === null ? "NOT RUN" : r.pass ? "AS DECLARED" : "*** NOT AS DECLARED — a finding about the ARM, recorded not smoothed ***"}`);
}

const headZ = sh(["git", "rev-parse", "HEAD"]).trim();
const dirtyZ = sh(["git", "status", "--porcelain"]).trim();
console.log(`\nHEAD at end ${headZ.slice(0, 12)} (${headZ === head0 ? "RESTORED" : "*** MOVED ***"}) · working tree ${dirtyZ ? "DIRTY:\n" + dirtyZ : "clean"}`);
console.log(`arms never armed: ${armsNeverArmed}`);
if (findings.length) { console.log("\nFINDINGS:"); for (const f of findings) console.log(`  ${f}`); }

const bad = results.filter((r) => r.pass === false).length;
console.log(`\ncontrol: ${results.length} arm(s) · ${results.filter((r) => r.pass).length} as declared · ${bad} NOT as declared · ${findings.length} finding(s)`);
process.exit(bad || findings.length ? 1 : 0);

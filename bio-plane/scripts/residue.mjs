/* D-237 — WHAT THIS RUN LEFT OUTSIDE THE FENCE, AND WHOSE IT IS.
 *
 * THE DEFECT, MEASURED. `scripts/battery.mjs` hands every suite a `$TMPDIR` of
 * its own and then accounts for temp residue by counting INSIDE it. That is a
 * true sentence about the fence and a FALSE IMPRESSION OF THE ESTATE, because a
 * suite that writes OUTSIDE the fence is not under-reported — it is not reported
 * at all. On 2026-08-08 M0-10 found the runner printing
 * `0 directories, 0 miniflare sandboxes` while 12 MB of Durable Object and R2
 * SQLite sat in `/tmp/mfp`, put there by `bootstrap.test.mjs`'s hardcoded
 * `defaultPersistRoot` and ACCUMULATING SINCE 2026-07-31. Eight days. The
 * runner's silence read as cleanliness.
 *
 * IT WAS WRONG IN THE GENEROUS DIRECTION, which is the direction this project
 * treats as worst: a defect that makes the record claim more than it can support
 * is worse than a missing feature. And the same shape had already defeated the
 * other instrument — `hygiene.test.mjs` required every temp-making suite to
 * IMPORT `sandbox.mjs`, BOTH offenders did, and both passed, because the check
 * certified the IMPORT and never the CONTAINMENT.
 *
 * SO THE FIX IS TO MAKE RESIDUE OUTSIDE `$TMPDIR` VISIBLE, NOT MERELY ABSENT.
 * M0-10 closed the containment half STRUCTURALLY (no suite may root a
 * filesystem ground at an absolute-path LITERAL, and that check FAILS the
 * battery). This module is the reporting half, and it exists for exactly what a
 * source read cannot see: a literal built by concatenation, a path held in a
 * variable, a path handed in through an environment variable, and a path some
 * DEPENDENCY chooses without asking the suite.
 *
 * ---- THE HARD PART IS NOT SEEING IT. IT IS NOT BLAMING THE WRONG PROCESS. ----
 *
 * The space outside the fence is shared by every process on the machine. When
 * this module was written, `/tmp` on the development machine held 388 top-level
 * entries and 236 MB, nearly all of it written by tools that have nothing to do
 * with this battery, and a SECOND worktree's battery was measurably running at
 * the same moment. A report that answered "what is in /tmp" would blame this run
 * for other people's files, and that is the OPPOSITE DEFECT — the record
 * claiming more than it can support, in the other direction. M0-8 already paid
 * for this once: the first version of the fenced assertion counted host-level
 * `miniflare-*` and went RED on a green run because another checkout was writing
 * into the same `$TMPDIR`. A false red on the battery is worse than the leak it
 * reports.
 *
 * SO EVERY LINE THIS MODULE PRINTS CARRIES THE STRENGTH OF ITS OWN EVIDENCE, and
 * there are exactly three strengths. They are different claims and are never
 * collapsed:
 *
 *   HELD — a path outside the fence that a process IN THIS RUN'S OWN DESCENDANT
 *     TREE had open while a suite was running. The pid chain is the attribution;
 *     nothing is inferred from a clock. This is the ONLY state allowed to say
 *     "this run", and it is the state the two historical offenders would have
 *     been caught in on their first run.
 *   CHANGED / APPEARED — a top-level entry under a shared root whose subtree was
 *     written to, or which came into existence, between this run's opening and
 *     closing scans. A CANDIDATE and never a verdict: a concurrent checkout
 *     produces the identical observation, and one was running while this was
 *     written. Where the arrival falls inside a single suite's window the suite
 *     is NAMED, because the battery runs its suites sequentially — that narrows
 *     the candidate, it does not promote it.
 *   PRE-EXISTING — present before this run started and untouched by it. NOT this
 *     run's, said in those words. It is reported anyway, with its size and the
 *     span of its writes, because THIS IS THE STATE `/tmp/mfp` WAS IN and eight
 *     days of silence is what the item is about. Accumulation is the finding;
 *     ownership is not claimed.
 *
 * AND IT REPORTS, IT DOES NOT FAIL — the same provisional M0-15 took for the
 * provenance line, for the same reason and with the same residual stated. The
 * run's own fenced residue still fails the run, exactly as before. Nothing
 * outside the fence does, because nothing outside the fence can be attributed
 * with certainty except the HELD state, and failing on a candidate would put a
 * false red on every battery run on a busy machine. The STRUCTURAL guard that
 * does fail is `hygiene.test.mjs`'s containment check. THE RESIDUAL: a run that
 * left 12 MB in `/tmp/mfp` is still GREEN, and only this report says so.
 *
 * ---- WHAT THIS CANNOT SEE. Stated here, in the instrument, because a matcher
 * that does not publish its blind spots is read as though it had none.
 *
 *  - A SUITE THAT WRITES AND CLEANS UP. Residue is what is LEFT; an arrival that
 *    is gone by the closing scan is not reported. `migrate.test.mjs` wiping
 *    `/tmp/civicos-fixture` on the way out was invisible to a residue question by
 *    construction — which is why the HELD arm exists, and it is the arm that
 *    would have caught it.
 *  - ANYTHING BETWEEN TWO HELD SAMPLES. The HELD arm samples `lsof` at a fixed
 *    cadence per suite (see `sampleHeld`), so a file held briefly and released
 *    between samples is missed. The CHANGED arm is the backstop and says so.
 *  - A PROCESS THAT IS NEITHER `node` NOR `workerd`. The descendant closure is
 *    computed over those two commands only, which is what makes the sample cost
 *    17 ms instead of 118 ms (measured). A suite that shells out to some other
 *    binary which then writes outside the fence is invisible to the HELD arm.
 *  - DEPTH AND BUDGET. The scan walks each root to a bounded depth with a
 *    bounded number of operations. When the budget is hit the report says so and
 *    the figures are a FLOOR, never a total.
 *  - A GROUND THAT LOOKS LIKE NOTHING. The standing scan recognises workerd
 *    persistence by miniflare's OWN directory naming (`miniflare-<Object>`), the
 *    vendor's spelling and the one `scripts/battery.mjs` already counts on. An
 *    ordinary fixture tree with an ordinary name — `civicos-fixture` — matches
 *    nothing and is visible ONLY through the CHANGED, APPEARED and HELD arms.
 *    This is a recogniser for one artifact, not a census of the directory, and
 *    that is deliberate: a census of `/tmp` is the noise this module refuses to
 *    print.
 *  - ROOTS NOBODY NAMED. The roots are DERIVED at runtime (see below) and a
 *    process that writes to a shared path outside all of them is not seen. The
 *    report always prints the roots it walked, so a scan narrowed to nothing
 *    cannot hide behind a clean line — the failure mode this project keeps
 *    meeting, most recently M0-15's own harness comparing two EMPTY files and
 *    calling them byte-identical.
 */

import { readdirSync, lstatSync, realpathSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, sep } from "node:path";

/* ---- the roots -------------------------------------------------------------
 * DERIVED at runtime and then deduplicated by REALPATH, which is not a detail:
 * on macOS `/tmp` is a symlink to `/private/tmp`, `lsof` answers in the resolved
 * spelling, and `os.tmpdir()` is a third path entirely
 * (`/var/folders/…/T`) — which is precisely why counting inside `$TMPDIR` could
 * not see a suite writing to the literal `/tmp`.
 *
 * The conventional POSIX names ARE literals here, and that is correct rather
 * than an exception to M0-10's rule: this module READS, and never writes, roots
 * or wipes them. The rule is about a suite ROOTING A GROUND at a shared literal;
 * looking at the shared literal is the whole job. M0-10 ruled the same way for
 * the probes that read `/tmp/corpus` and `/tmp/tok`.
 *
 * `BIO_SHARED_TEMP_ROOTS` REPLACES the derived list, colon-separated. It exists
 * so `battery-residue.test.mjs` can drive this report end to end without
 * contaminating the machine's real shared temp space to prove a point about the
 * machine's real shared temp space. An override that narrows the scan to nothing
 * would be an instrument reporting clean over an empty corpus, so the report
 * always names the roots it walked AND says when the list came from the
 * environment. */
export const ROOTS_ENV = "BIO_SHARED_TEMP_ROOTS";

export function sharedTempRoots({ hostTmp, env = process.env } = {}) {
  const overridden = typeof env[ROOTS_ENV] === "string" && env[ROOTS_ENV].length > 0;
  const candidates = overridden
    ? env[ROOTS_ENV].split(":").filter(Boolean)
    : [hostTmp, env.TMPDIR, env.TMP, env.TEMP, "/tmp", "/private/tmp", "/var/tmp"].filter(Boolean);
  const seen = new Map();
  for (const c of candidates) {
    let real;
    try { real = realpathSync(c); } catch { continue; }
    try { if (!lstatSync(real).isDirectory()) continue; } catch { continue; }
    if (!seen.has(real)) seen.set(real, c);
  }
  /* Drop a root that lives inside another root: it would be walked twice and
     counted twice, and a double-counted figure is a wrong figure. */
  const reals = [...seen.keys()];
  const roots = reals
    .filter((r) => !reals.some((o) => o !== r && r.startsWith(o.endsWith(sep) ? o : o + sep)))
    .sort()
    .map((real) => ({ real, as: seen.get(real) }));
  return { roots, overridden };
}

const under = (path, dir) => path === dir || path.startsWith(dir.endsWith(sep) ? dir : dir + sep);

/* THE FENCE MUST BE COMPARED IN THE SAME SPELLING AS THE THINGS IT IS COMPARED
 * AGAINST, AND THE FIRST VERSION OF THIS MODULE DID NOT DO THAT. It was caught
 * on the first full battery, by the report accusing the run of holding a path
 * outside its own fence — `HELD BY THIS RUN · suite: acquire.test.mjs · another
 * battery's fence` — over a directory that WAS this run's own `$TMPDIR`.
 *
 * The mechanism: `battery.mjs` builds `RUN_TMP` from `os.tmpdir()`, which on
 * macOS answers `/var/folders/…/T`, while the roots here are REALPATHS and
 * answer `/private/var/folders/…/T`. Two spellings of one directory, so
 * `under(top, fence)` compared them and said NO, the run's own sandbox was
 * walked as though it belonged to somebody else, and every sandbox a suite held
 * inside it came back attributed as residue OUTSIDE the fence.
 *
 * That is the OVER-ATTRIBUTION direction — the report claiming more than it can
 * support — arriving through the same `/private` aliasing that made the original
 * defect invisible. Resolved once, here, so no caller has to remember. */
const realOf = (p) => { try { return p ? realpathSync(p) : p; } catch { return p; } };

/* ---- the deep scan ---------------------------------------------------------
 * One bounded walk per root, keyed by TOP-LEVEL ENTRY, because that is the unit
 * a reader can act on (`/tmp/mfp`, not nineteen sqlite files). Measured on the
 * development machine: 3,478 ops / 134 ms for `/tmp` and 5,233 ops / 170 ms for
 * `$TMPDIR` at depth 4 — cheap enough to run twice per battery, nowhere near
 * cheap enough to run per suite, which is why per-suite resolution comes from
 * the shallow snapshot instead. */
export function scanShared(roots, { fence: rawFence, depth = 4, budget = 250_000,
  ownedPrefix = "", legacyPrefixes = [] } = {}) {
  const fence = realOf(rawFence);
  const tops = new Map();
  const unreadable = [];
  let ops = 0;
  let budgetHit = false;

  const walk = (path, d, acc) => {
    if (ops >= budget) { budgetHit = true; return; }
    let st;
    try { st = lstatSync(path); ops++; } catch { return; }
    if (st.mtimeMs > acc.newestMs) acc.newestMs = st.mtimeMs;
    if (acc.oldestMs === 0 || st.mtimeMs < acc.oldestMs) acc.oldestMs = st.mtimeMs;
    if (st.isSymbolicLink()) return;               /* never follow: cycles, and it is not ours */
    if (st.isFile()) { acc.files++; acc.bytes += st.size; return; }
    if (!st.isDirectory()) return;
    acc.dirs++;
    /* miniflare names each binding's persistence directory `miniflare-<Object>`.
       That is the VENDOR's spelling, not one of ours, and `scripts/battery.mjs`
       already counts sandboxes by it inside the fence — so this is one artifact
       recognised by its own name, not an allowlist of paths that can go stale. */
    const base = path.slice(path.lastIndexOf(sep) + 1);
    if (base.startsWith("miniflare-")) acc.grounds.push(path);
    if (d >= depth) { acc.deeper = true; return; }
    let ents;
    try { ents = readdirSync(path); ops++; } catch { return; }
    for (const n of ents) walk(join(path, n), d + 1, acc);
  };

  for (const root of roots) {
    let ents;
    try { ents = readdirSync(root.real); ops++; }
    catch (e) { unreadable.push({ root: root.real, code: e.code || "EUNKNOWN" }); continue; }
    for (const n of ents) {
      const top = join(root.real, n);
      if (fence && under(top, fence)) continue;    /* the fence has its own accounting */
      const acc = { bytes: 0, files: 0, dirs: 0, newestMs: 0, oldestMs: 0, grounds: [], deeper: false };
      walk(top, 0, acc);
      acc.kind = topKind(n, { ownedPrefix, legacyPrefixes });
      acc.root = root.real;
      tops.set(top, acc);
    }
  }
  return { tops, ops, budgetHit, unreadable, depth, budget };
}

/* Three kinds of top-level entry, and the two lists come from the CALLER so the
   estate states them once. `battery.mjs` owns `bio-battery-` and the legacy
   prefixes; restating them here is how a copy goes stale in one of its homes. */
export function topKind(name, { ownedPrefix = "", legacyPrefixes = [] } = {}) {
  if (ownedPrefix && name.startsWith(ownedPrefix)) return "another battery's fence";
  if (legacyPrefixes.some((p) => name.startsWith(p))) return "legacy orphan";
  return "unfenced";
}

/* ---- the shallow snapshot --------------------------------------------------
 * Names only, one `readdir` per root. Taken around every suite, so an arrival
 * can be narrowed to the suite that was running — the battery runs its suites
 * SEQUENTIALLY, which is the only reason that narrowing means anything. */
export function shallowNames(roots, { fence: rawFence } = {}) {
  const fence = realOf(rawFence);
  const names = new Set();
  for (const root of roots) {
    let ents;
    try { ents = readdirSync(root.real); } catch { continue; }
    for (const n of ents) {
      const top = join(root.real, n);
      if (fence && under(top, fence)) continue;
      names.add(top);
    }
  }
  return names;
}

/* ---- the HELD arm: the only conclusive attribution available ---------------
 * `lsof -FpRn` emits `p<pid>` / `R<ppid>` / `n<name>`, so ONE call yields both
 * the process tree and the open paths. The closure is computed DOWNWARD from
 * this run's own pid: a path is this run's only if some descendant of ours has
 * it open. Nothing here depends on a clock, on a name, or on a prefix.
 *
 * Scoped to `node` and `workerd` (`-c`), measured at 17 ms against 118 ms for an
 * unscoped call. Every process in this run's tree is one or the other, so the
 * chain is complete — a suite that shells out to a third binary is the stated
 * blind spot, not a silent one. BEST EFFORT: an absent or unhappy `lsof` yields
 * `available: false`, and the report says UNVERIFIED for this arm rather than
 * reporting nothing found, which would be D-233 exactly. */
export function sampleHeld({ roots, fence: rawFence, ownPid = process.pid, spawn = spawnSync } = {}) {
  const fence = realOf(rawFence);
  const r = spawn("lsof", ["-n", "-P", "-FpRn", "-c", "node", "-c", "workerd"],
    { encoding: "utf8", timeout: 15_000, maxBuffer: 256 * 1024 * 1024 });
  if (!r || r.error || typeof r.stdout !== "string" || !r.stdout)
    return { available: false, paths: new Map() };

  const parent = new Map();
  /* NAMED `openPaths` AND NOT `opened`, WHICH IS NOT A STYLE CHOICE. The first
     spelling was `opened`, and `civicos-ui/test/publishedcase.test.mjs` walks the
     WHOLE REPOSITORY asserting that the plane's published `opened` field has zero
     consumers outside its producer (UI-40 / IC-22). A local variable in an
     unrelated module read as a consumer and turned that census RED — a
     repository-wide identifier census meeting an ordinary local name. The
     census is load-bearing and this name is incidental, so this name moved. */
  const openPaths = new Map();            /* pid -> Set<path> */
  let pid = null;
  for (const line of r.stdout.split("\n")) {
    if (!line) continue;
    const tag = line[0], rest = line.slice(1);
    if (tag === "p") { pid = Number(rest); if (!openPaths.has(pid)) openPaths.set(pid, new Set()); continue; }
    if (tag === "R") { if (pid !== null) parent.set(pid, Number(rest)); continue; }
    if (tag === "n" && pid !== null && rest.startsWith("/")) openPaths.get(pid).add(rest);
  }

  /* Descendant closure of ownPid, by repeated relaxation over the parent map.
     Bounded by the number of processes, so it terminates on a cycle too. */
  const mine = new Set([ownPid]);
  for (let i = 0; i < parent.size + 1; i++) {
    let grew = false;
    for (const [p, pp] of parent) if (!mine.has(p) && mine.has(pp)) { mine.add(p); grew = true; }
    if (!grew) break;
  }

  const paths = new Map();
  for (const p of mine) {
    const set = openPaths.get(p);
    if (!set) continue;
    for (const name of set) {
      if (fence && under(name, fence)) continue;
      const root = roots.find((rt) => under(name, rt.real));
      if (!root) continue;
      /* Report the TOP-LEVEL entry, the same unit the scan uses, so the two arms
         can be read against each other. */
      const relFirst = name.slice(root.real.length).replace(/^\/+/, "").split("/")[0];
      if (!relFirst) continue;
      const top = join(root.real, relFirst);
      if (!paths.has(top)) paths.set(top, { pid: p, example: name });
    }
  }
  return { available: true, paths, processes: mine.size };
}

/* ---- the report ------------------------------------------------------------
 * `held` is a Map<top, {pid, example, suite}> accumulated over the run; `windows`
 * is a Map<top, suiteLabel> for arrivals the caller could narrow to one suite. */
const MB = (n) => `${(n / 1e6).toFixed(1)} MB`;
const when = (ms) => ms ? new Date(ms).toISOString().replace("T", " ").slice(0, 16) : "unknown";

/* WHAT GETS ENUMERATED, AND WHAT ONLY GETS COUNTED. Not the directory: the
 * directory is 861 top-level entries of other people's work, measured across the
 * three roots on this machine, and a report nobody can read is a report nobody
 * acts on. Three filters, each of them a claim about what residue IS:
 *
 *  1. RESIDUE IS BYTES OR EXISTENCE, NOT AN MTIME. Over a 150 s idle window with
 *     no battery running at all, this machine produced 3 arrivals and 4 changed
 *     entries — and three of the four changed by ZERO BYTES (`TemporaryItems`,
 *     `com.apple.icloud.searchpartyuseragent`, `duetexpertd`, all macOS daemons
 *     touching a directory they own). A touch with no byte delta and no new file
 *     is counted in a summary line and not named. Measured before it was
 *     decided, and the summary line is what stops the filter from being a
 *     silence.
 *  2. A DIRECTORY WHOSE KIND IS ALREADY ACCOUNTED FOR IS SUMMARISED, NOT NAMED.
 *     `bio-battery-<pid>-*` belonging to some other pid is another checkout's
 *     fence and is that run's business; a `legacy-` prefixed orphan is already
 *     the subject of this runner's age-and-owner sweep. Both are real and
 *     neither is this item's class, so each gets one counted line.
 *  3. EVERYTHING THIS RUN WAS CAUGHT HOLDING IS NAMED, unconditionally, whatever
 *     its kind, size or age — that is the one state with a pid chain behind it.
 */
export function classifyOutside({ before, after, held, windows = new Map(), runStartedMs }) {
  const rows = [];
  const summarised = new Map();   /* reason -> { n, bytes } */
  const bump = (reason, bytes) => {
    const s = summarised.get(reason) || { n: 0, bytes: 0 };
    s.n++; s.bytes += bytes;
    summarised.set(reason, s);
  };
  for (const [top, a] of after.tops) {
    const b = before.tops.get(top);
    const isGround = a.grounds.length > 0;
    const heldHere = held.get(top);
    const appeared = !b;
    const grew = b ? a.bytes - b.bytes : a.bytes;
    const touched = !appeared && a.newestMs > b.newestMs;
    if (!isGround && !heldHere && !appeared && !touched) continue;
    if (!heldHere && a.kind !== "unfenced") { bump(a.kind, a.bytes); continue; }
    if (!heldHere && !isGround && !appeared && grew <= 0) { bump("mtime touched, no bytes written", a.bytes); continue; }
    const state = heldHere ? "HELD BY THIS RUN"
      : appeared ? "APPEARED while this run ran"
        : grew > 0 ? "CHANGED while this run ran"
          : (a.oldestMs && a.oldestMs < runStartedMs) ? "PRE-EXISTING, untouched by this run"
            : "present, untouched by this run";
    rows.push({
      top, state, kind: a.kind, ground: isGround, bytes: a.bytes, files: a.files,
      oldestMs: a.oldestMs, newestMs: a.newestMs, deeper: a.deeper, grew,
      suite: heldHere?.suite || windows.get(top) || null,
      pid: heldHere?.pid || null,
    });
  }
  /* ORDERED BY THE STRENGTH OF THE EVIDENCE, NOT BY SIZE, and that is not
     cosmetic. Sorted by bytes, the largest row on this machine was the agent
     harness's own 173 MB scratch directory — a row nobody can act on, sitting
     above the 12 MB ground that is the whole subject. A report whose first line
     is always noise is a report readers stop reading, which is the condition
     this item exists to end. */
  const RANK = { "HELD BY THIS RUN": 0, "APPEARED while this run ran": 1, "CHANGED while this run ran": 2 };
  const rank = (r) => (RANK[r.state] ?? 3) - (r.ground ? 0.5 : 0);
  rows.sort((x, y) => rank(x) - rank(y) || y.bytes - x.bytes);
  return { rows, summarised };
}

export function reportResidue({ roots, overridden, before, after, held, heldAvailable,
  heldSamples = 0, heldSuites = 0, suitesRun = 0,
  windows = new Map(), runStartedMs, fenceLine = "", log = console.log }) {
  const { rows, summarised } = classifyOutside({ before, after, held, windows, runStartedMs });
  const counts = {
    held: rows.filter((r) => r.state.startsWith("HELD")).length,
    moved: rows.filter((r) => r.state.startsWith("APPEARED") || r.state.startsWith("CHANGED")).length,
    standing: rows.filter((r) => r.ground && r.state.includes("untouched")).length,
  };
  /* Every path here is the RESOLVED one, because that is the spelling `lsof`
     answers in and the one the named rows below carry, and two spellings of one
     directory in one report is how a reader concludes there are two directories.
     macOS's `/private` prefix is kernel aliasing rather than information, so it
     is explained ONCE instead of annotated on every root. */
  const priv = roots.some((r) => r.real !== r.as && `/private${r.as}` === r.real);
  const rootList = roots.map((r) => (r.real === r.as || `/private${r.as}` === r.real)
    ? r.real : `${r.real} (as ${r.as})`).join(", ") || "none";
  log(`outside the fence: ${roots.length} shared temp root(s) walked to depth ${after.depth}`
    + ` · ${after.tops.size} top-level entr${after.tops.size === 1 ? "y" : "ies"}`
    + ` · ${counts.held} HELD by this run · ${counts.moved} moved while it ran`
    + ` · ${counts.standing} standing workerd ground(s)`
    + `${overridden ? ` · roots from $${ROOTS_ENV}` : ""}`);
  log(`  roots: ${rootList}${priv ? "  (shown as the kernel resolves them: /private/X IS X)" : ""}`);
  /* THE REACH OF THE ONE CONCLUSIVE ARM, PRINTED. `0 HELD by this run` above is
     two entirely different claims depending on this line — "we looked and found
     none" or "we never looked" — and the whole of D-237 is that the second must
     never read as the first. The unsampled suites are the ones that finished
     before the first `lsof` call could be made; for them the CHANGED and
     APPEARED arms are the only evidence there is. */
  log(`  HELD arm: ${heldSamples} lsof sample(s) covering ${heldSuites} of ${suitesRun} suite(s)`
    + `${suitesRun > heldSuites
        ? ` — ${suitesRun - heldSuites} suite(s) finished before a sample could be taken and were NOT`
          + ` covered by the pid-chain arm`
        : ""}`);

  /* RULE: an instrument that could not look says so, and never reports clean. */
  if (after.unreadable.length)
    log(`  UNVERIFIED for ${after.unreadable.length} root(s) that could not be read:`
      + ` ${after.unreadable.map((u) => `${u.root} (${u.code})`).join(", ")} — the figures above are a FLOOR.`);
  if (after.budgetHit)
    log(`  UNVERIFIED beyond ${after.budget} filesystem operations: the walk hit its budget, so every`
      + ` figure above is a FLOOR and not a total.`);
  if (!heldAvailable)
    log(`  UNVERIFIED for the HELD arm: \`lsof\` could not be sampled, so NOTHING here is attributed to`
      + ` this run by a pid chain. That is not the same claim as "this run held nothing".`);

  /* The summary line is what keeps filter 1 and filter 2 from being a silence:
     a reader can see exactly how much was set aside and on what grounds. */
  for (const [reason, s] of summarised)
    log(`  ${s.n} further shared entr${s.n === 1 ? "y" : "ies"} (${MB(s.bytes)}) not named here: ${reason}.`);

  if (!rows.length) {
    log(`  nothing outside the fence grew or arrived while this run ran, and no workerd persistence is`);
    log(`  standing in a shared root. ${fenceLine || "The fenced figure above describes the fence only (D-237)."}`);
    return { rows, counts, summarised };
  }

  log(`  NAMED — the fenced figure above is a statement about $TMPDIR ONLY, and these are outside it (D-237):`);
  for (const r of rows) {
    log(`    ${r.top}  ${MB(r.bytes)} · ${r.files} file(s) · written ${when(r.oldestMs)} .. ${when(r.newestMs)}`);
    log(`      ${r.state}${r.suite ? ` · suite: ${r.suite}` : ""}${r.pid ? ` · pid ${r.pid}` : ""}`
      + ` · ${r.kind}${r.ground ? " · workerd persistence" : ""}`
      + `${r.deeper ? " · deeper than the scan's depth: size is a floor" : ""}`);
    /* The discriminating evidence, printed rather than left for the reader to
       infer from an absence. "Never held" is the strongest thing that can be
       said AGAINST this run owning a row, and saying nothing would leave the
       reader to guess which way the silence pointed. */
    if (!r.pid)
      log(`      not held by any descendant of this battery in ${heldSamples} lsof sample(s)`
        + `${heldAvailable ? "" : " — but the HELD arm never sampled, so that is UNVERIFIED, not evidence"}`);
  }
  log(`  ATTRIBUTION, and it is three different claims: HELD BY THIS RUN is a pid chain from this`);
  log(`  process to a process that had the path open — that one is ours. APPEARED and CHANGED are`);
  log(`  CANDIDATES ONLY: a concurrent checkout of this repository writing into the same shared root`);
  log(`  produces the identical observation, and one was measurably doing so when this was written.`);
  log(`  PRE-EXISTING is NOT this run's and is named because accumulation is the finding — /tmp/mfp`);
  log(`  sat unreported for eight days while the runner printed 0 directories, 0 sandboxes.`);
  return { rows, counts, summarised };
}

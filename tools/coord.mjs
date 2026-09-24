#!/usr/bin/env node
/* coord — the message board leaves `main`: STATE ABOUT THE WORK lives on the branch `coord` (M0-110).
 *
 * THE DEFECT, MEASURED (`docs/development/TREE-SHARING.md` §"Why"). `main` was both the product and the lanes'
 * message board: a claim, a queue flip or a handoff was a commit, so it moved `main` for every lane, and a gate
 * record is keyed by the exact tree (D-293), so every such move voided every other lane's green result. 89 of 112
 * commits on 2026-09-22 to ~14:45Z touched `CLAIMS.md`, `QUEUE.md` or `DECIDED.md`; 24 of 59 gate runs measured a
 * tree that never reached `main` (M-97). This file is §1's change: ONE place that says which files are state, ONE
 * write command, ONE read command, and the reading layer every tool uses so that the same code answers before and
 * after the cutover.
 *
 * WHAT MOVES (§1, widened by BOB #28's four rulings the same day): `docs/development/CLAIMS.md`, `QUEUE.md`,
 * `BACKLOG.md`, `DEBT.md`, every `kickoffs/<LANE>-NEXT.md`, the WHOLE `docs/archive/ledgers/` family (ruling 1:
 * the archiver writes it in the act that edits the live file, so it is state), and `PLACEMENT.md`, the placement
 * table that leaves `MILESTONES.md` (ruling 3). Everything else stays on `main`. `docs/DECIDED.md` does not move:
 * M0-99 made it untracked and generated on every branch.
 *
 * THE POINTER IS THE SWITCH. The migration (`migrate`, below) leaves at each moved path on `main` a ONE-LINE file
 * beginning `COORD-POINTER:`. `readState(repo, rel)` reads the working tree; when what it finds is the pointer, it
 * answers with the copy on `origin/coord` instead (`BIO_COORD_REF` names another ref, which is how a suite plants a
 * local, unpushed `coord`). So a reader needs no flag and no date: before the cutover it reads `main`'s file, after
 * it the branch, and against a planted fixture directory — which carries no pointer — it reads the fixture, exactly
 * as every suite in the battery already drives it. A file created on `coord` after the cutover (a new lane's
 * handoff, a new cut roll) has no pointer; `listState` lists the ref's side of a moved directory once the tree is
 * SWITCHED (its `QUEUE.md` is a pointer), so those are seen too.
 *
 * THE WRITE IS AN INTENT, NEVER A TEXTUAL MERGE (BOB #27, 2026-09-22, on SCHEDULER #12's question). `write` fetches
 * `coord`, materialises its tree beside `main`'s `docs/` in a temporary directory (NOT a checkout: no `.git`, no
 * index of the repository's), applies each intent — append a block at the end of a file; add lines at the end of the
 * block under a named heading; set a row's status word; replace or delete a row by its id; insert a row before or
 * after another; replace a whole handoff; archive a closed id; refill the cache — runs the LEDGER CHECKS against the result, builds the commit through a TEMPORARY INDEX, and pushes
 * `<sha>:refs/heads/coord` WITHOUT force. A non-fast-forward is not a conflict to resolve: it re-fetches and
 * RE-APPLIES THE INTENTS to the new tip, so two lanes' appends never conflict and a line added to block X lands in
 * block X whatever was appended meanwhile. That is the receipt BOB #27 named: a merge of two tail appends put BOB
 * #26's DISCHARGED line inside DIST #4's claim.
 *
 * THE LEDGER CHECKS (BOB #28's ruling 2). A gate record is keyed by `main`'s tree, so a battery suite that judges
 * the LIVE rows would, after the cutover, judge `coord` — which no `main` record settles. Each such arm left the
 * battery and is an arm of `ledgerChecks` here, named with the suite it came from; `write` refuses a `coord` write
 * that fails one (by name), and `plancheck` runs the same function against the coord view. Arms that run a tool
 * against PLANTED ledgers are BEHAVIOUR and stayed in the battery.
 *
 *   node tools/coord.mjs read <path>                      the file as origin/coord holds it (origin/main's before the cutover)
 *   node tools/coord.mjs write -m <msg> <intent>...       see `usage()`; `--dry-run` applies and checks, pushes nothing
 *   node tools/coord.mjs checks                           the ledger checks against the coord view; exit 1 on a FAIL
 *   node tools/coord.mjs churn [--since <iso>] [--ref <r>]  per-path churn on main, and the landings that touched ONLY state
 *   node tools/coord.mjs migrate [--from <rev>]           build the coord root commit and main's pointer commit (idempotent)
 *   node tools/coord.mjs where                            where the readers read from, on this tree
 *
 * NEGATIVE CONTROL: `node bio-plane/test/coord.control.mjs` from the repo root — (R) one reader (`ledger.mjs`'
 * `readRel`) pointed back at the working tree's old path -> `coord.test.mjs` fails at "findId answers from coord";
 * (W) the write made a textual merge from its stale base instead of re-applying the intent -> the concurrent in-block
 * arm fails; (C) the write command's checks skipped -> the planted-closed-row write is NOT refused and the arm fails.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdtempSync, mkdirSync, rmSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const BRANCH = "coord";
export const REMOTE = "origin";
export const DEFAULT_REF = `${REMOTE}/${BRANCH}`;

/* ------------------------------------------------------------------------------ what is state */

/* M0-121: WHICH FILES ARE STATE is defined in `tools/statepaths.mjs`, a module that walks nothing, and re-exported
   here. An importer that needs only the predicate imports that file, so it does not inherit this module's walks of
   `docs/` (M-106: a MEASUREMENTS-only landing selected every op-claims importer through them). */
import { MOVED_FILES, MOVED_DIRS, NEXT_RE, isMovedPath } from "./statepaths.mjs";
export { MOVED_FILES, MOVED_DIRS, NEXT_RE, isMovedPath };
/* The one file whose pointer says the TREE is switched (for files created on `coord` after the cutover, which
   carry no pointer of their own). The cache is the file every lane reads first. */
export const SWITCH_FILE = "docs/development/QUEUE.md";

/* ONE LINE, and its first bytes are the switch. The exact text is per path, and `plancheck` requires it EXACTLY
   once the tree is switched, so a stale merge that restores content, or a hand edit to a pointer, fails by name. */
export const POINTER_TAG = "COORD-POINTER:";
export const pointerText = (rel) =>
  `${POINTER_TAG} this file lives on the branch \`coord\` — read it with \`node tools/coord.mjs read ${rel}\`, `
  + `change it with \`node tools/coord.mjs write\` (docs/development/TREE-SHARING.md §1; M0-110).\n`;
export const isPointer = (text) => typeof text === "string" && text.startsWith(POINTER_TAG);

/* The placement table leaves MILESTONES.md (BOB #28's ruling 3): this heading's section, to the next `## `. */
export const MILESTONES = "docs/development/MILESTONES.md";
export const PLACEMENT = "docs/development/PLACEMENT.md";
export const PLACEMENT_HEADING = "## Placement: everything open, and where it now sits";
export const placementPointer = () =>
  `${PLACEMENT_HEADING}\n\n${POINTER_TAG} this section lives on the branch \`coord\` as \`${PLACEMENT}\` — read it with `
  + `\`node tools/coord.mjs read ${PLACEMENT}\` (docs/development/TREE-SHARING.md §1, BOB #28's ruling 3; M0-110).\n`;

export const coordRef = () => process.env.BIO_COORD_REF || DEFAULT_REF;

/* ------------------------------------------------------------------------------------- git */

function git(repo, args, { input = null, env = null, buffer = false, allowFail = true } = {}) {
  const r = spawnSync("git", args, {
    cwd: repo, input: input ?? undefined, env: env ? { ...process.env, ...env } : process.env,
    encoding: buffer ? "buffer" : "utf8", maxBuffer: 1 << 30,
  });
  const out = { status: r.status, stdout: r.stdout, stderr: buffer ? String(r.stderr || "") : (r.stderr || "") };
  if (!allowFail && r.status !== 0)
    throw new CoordError("GIT_FAILED", `git ${args.slice(0, 3).join(" ")} … exited ${r.status}: ${String(out.stderr).trim().slice(0, 300)}`);
  return out;
}

export class CoordError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
const refusal = (code, message) => new CoordError(code, message);

/* ------------------------------------------------------------------------- the reading layer */

const shaCache = new Map();   /* `${repo}\0${ref}` -> sha or null */
const blobCache = new Map();  /* `${sha}\0${rel}` -> text or null */
export function resetCoordCache() { shaCache.clear(); blobCache.clear(); }

export function refSha(repo, ref = coordRef()) {
  const k = `${repo}\0${ref}`;
  if (!shaCache.has(k)) {
    const r = git(repo, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
    shaCache.set(k, r.status === 0 ? r.stdout.trim() : null);
  }
  return shaCache.get(k);
}

function fromRef(repo, rel, ref = coordRef()) {
  const sha = refSha(repo, ref);
  if (!sha) return null;
  const k = `${sha}\0${rel}`;
  if (!blobCache.has(k)) {
    const r = git(repo, ["show", `${sha}:${rel}`]);
    blobCache.set(k, r.status === 0 ? r.stdout : null);
  }
  return blobCache.get(k);
}

function head(abs, n = POINTER_TAG.length) {
  try {
    const fd = openSync(abs, "r");
    try { const b = Buffer.alloc(n); const got = readSync(fd, b, 0, n, 0); return b.subarray(0, got).toString("utf8"); }
    finally { closeSync(fd); }
  } catch { return null; }
}

/** Is this tree SWITCHED — its cache a pointer? Read from the first bytes only. */
export const isSwitched = (repo = ROOT) => head(join(repo, SWITCH_FILE)) === POINTER_TAG;

/** THE READ every tool uses for a file that may be state. The working tree's text, unless that is the pointer (or
    the path is state, absent, and the tree is switched), in which case the coord ref's copy; null when neither has
    it — an unreadable ledger is never read as an empty one. */
export function readState(repo, rel) {
  let text = null;
  try { text = readFileSync(join(repo, rel), "utf8"); } catch { text = null; }
  if (isPointer(text)) return fromRef(repo, rel);
  if (text === null && isMovedPath(rel) && isSwitched(repo)) return fromRef(repo, rel);
  return text;
}

/** Does the file exist for a reader — in the working tree, or (when it is state on a switched tree) on the ref. */
export const stateExists = (repo, rel) => readState(repo, rel) !== null;

/** The file names in a directory as a reader should see them: the working tree's, and — once the tree is switched —
    the coord ref's state files in it too (a handoff or a cut roll created on `coord` has no pointer on `main`). */
export function listState(repo, dir) {
  const names = new Set();
  try { for (const n of readdirSync(join(repo, dir))) names.add(n); } catch { /* absent here */ }
  if (isSwitched(repo)) {
    const sha = refSha(repo);
    if (sha) {
      const r = git(repo, ["ls-tree", "--name-only", `${sha}:${dir}`]);
      if (r.status === 0)
        for (const n of r.stdout.split("\n").filter(Boolean)) if (isMovedPath(`${dir}/${n}`)) names.add(n);
    }
  }
  return [...names].sort();
}

/** A recursive walk of `dir` (repo-relative) as a reader should see it: each level `listState`, sorted, depth
    first — the order a sorted `readdirSync` walk gave — so a coord-only file is visited where it would sit. A name
    that is not on disk is a file (only a state file can be missing from the working tree). Returns relative paths. */
export function walkState(repo, dir) {
  const out = [];
  const walk = (rel) => {
    for (const n of listState(repo, rel)) {
      const r = `${rel}/${n}`;
      let isDir = false;
      try { isDir = statSync(join(repo, r)).isDirectory(); } catch { isDir = false; }
      if (isDir) walk(r); else out.push(r);
    }
  };
  let top = false;
  try { top = statSync(join(repo, dir)).isDirectory(); } catch { top = false; }
  if (top) walk(dir);
  return out;
}

/** The revision a `git blame` of a state file must name: the coord ref's sha on a switched tree, else none. */
export function blameRev(repo, rel) {
  if (!isMovedPath(rel)) return null;
  let text = null;
  try { text = readFileSync(join(repo, rel), "utf8"); } catch { text = null; }
  if (isPointer(text) || (text === null && isSwitched(repo))) return refSha(repo);
  return null;
}

/** Where this tree's readers read from, for a CLI to print. */
export function whereReads(repo = ROOT) {
  const switched = isSwitched(repo);
  const ref = coordRef(), sha = refSha(repo, ref);
  return { switched, ref, sha, from: switched ? (sha ? `${ref} @ ${sha.slice(0, 8)}` : `${ref} — ABSENT (fetch it)`) : "the working tree (not switched)" };
}

/** Best-effort fetch of `coord`, for a CLI about to read it. Never for a library call (a suite must not reach the
    network), and never when `BIO_COORD_REF` names a planted ref. */
export function freshen(repo = ROOT) {
  if (process.env.BIO_COORD_REF) return { fetched: false, why: "BIO_COORD_REF is set" };
  const r = git(repo, ["fetch", "-q", REMOTE, `+refs/heads/${BRANCH}:refs/remotes/${REMOTE}/${BRANCH}`]);
  resetCoordCache();
  return r.status === 0 ? { fetched: true } : { fetched: false, why: r.stderr.trim().split("\n")[0] || `exit ${r.status}` };
}

/* ------------------------------------------------------------------------------ the read command */

/** The file as the REMOTE holds it: `origin/coord`'s copy once `coord` exists, `origin/main`'s before. */
export function readRemote(rel, { repo = ROOT, fetch = true } = {}) {
  if (fetch && !process.env.BIO_COORD_REF) {
    git(repo, ["fetch", "-q", REMOTE]);
    resetCoordCache();
  }
  const ref = coordRef();
  if (refSha(repo, ref)) return { ref, sha: refSha(repo, ref), text: fromRef(repo, rel, ref) };
  const main = `${REMOTE}/main`;
  const ms = refSha(repo, main);
  if (!ms) return { ref: null, sha: null, text: null };
  const text = fromRef(repo, rel, main);
  return { ref: main, sha: ms, text: isPointer(text) ? null : text };
}

/* ------------------------------------------------------------------------------ the intents */

const HEAD_RE = /^(#{1,6})\s/;
const lvl = (line) => { const m = HEAD_RE.exec(line); return m ? m[1].length : 0; };
const withNL = (s) => (s.endsWith("\n") ? s : s + "\n");

/** Append a block at the END of a file, separated by one blank line. A new file is created. */
export function appendBlock(text, block) {
  const b = withNL(block.replace(/^\n+/, ""));
  if (text === null || text === "") return b;
  const t = withNL(text);
  return t.endsWith("\n\n") ? t + b : t + "\n" + b;
}

/** The heading line an anchor names: equal to it, or (if none is equal) starting with it. Exactly one, or refused. */
export function findAnchor(lines, anchor) {
  const a = anchor.replace(/\s+$/, "");
  let hits = lines.map((l, i) => [l.replace(/\s+$/, ""), i]).filter(([l]) => lvl(l) && l === a);
  if (!hits.length) hits = lines.map((l, i) => [l, i]).filter(([l]) => lvl(l) && l.startsWith(a));
  if (!hits.length) throw refusal("ANCHOR_NOT_FOUND", `no heading is "${a.slice(0, 100)}" — the block this line belongs to is not there.`);
  if (hits.length > 1) throw refusal("ANCHOR_AMBIGUOUS", `${hits.length} headings match "${a.slice(0, 100)}" (lines ${hits.map(([, i]) => i + 1).join(", ")}) — name the block exactly.`);
  return hits[0][1];
}

/** Add lines at the END of the block under a heading: after its last non-blank line, before the next heading of
    the same or a higher level. The block is found in the text it is applied to, never at a remembered line number. */
export function addLine(text, anchor, add) {
  if (text === null) throw refusal("FILE_ABSENT", `the file has no heading "${anchor}" because it does not exist.`);
  const lines = text.split("\n");
  const at = findAnchor(lines, anchor);
  const L = lvl(lines[at]);
  let end = at + 1;
  while (end < lines.length && !(lvl(lines[end]) && lvl(lines[end]) <= L)) end++;
  let last = end - 1;
  while (last > at && lines[last].trim() === "") last--;
  const ins = add.replace(/\n+$/, "").split("\n");
  return [...lines.slice(0, last + 1), ...ins, ...lines.slice(last + 1)].join("\n");
}

export const ROW_STATES = ["queued", "running", "blocked", "integrated", "done", "superseded"];   /* `integrated`: ledger.mjs HELD_QUEUE_STATES */

/** A plan row's span: from its `### <ID> · <state>` heading to the next heading of level 1–3 (the ledger's own
    grammar), trailing blank lines left outside it. Exactly one, or refused. */
function rowSpan(lines, id) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const head = new RegExp(`^###\\s+${esc}\\s+·\\s+[A-Za-z-]+`);
  const hits = lines.map((l, i) => (head.test(l) ? i : -1)).filter((i) => i >= 0);
  if (!hits.length) throw refusal("ROW_NOT_FOUND", `no row headed \`### ${id} · <state>\`.`);
  if (hits.length > 1) throw refusal("ROW_AMBIGUOUS", `${hits.length} rows are headed ${id}.`);
  const start = hits[0];
  let end = start + 1;
  while (end < lines.length && !/^#{1,3}\s/.test(lines[end])) end++;
  let last = end - 1;
  while (last > start && lines[last].trim() === "") last--;
  return { start, end: last + 1 };
}

/** Replace a whole row (heading to its last non-blank line) with `block`; an EMPTY block deletes it. Anchored to the
    row's id in the text it is applied to, so a row another lane moved or edited meanwhile is found where it now is. */
export function replaceRow(text, id, block) {
  if (text === null) throw refusal("FILE_ABSENT", `no row ${id}: the file does not exist.`);
  const lines = text.split("\n");
  const { start, end } = rowSpan(lines, id);
  const body = block.replace(/\n+$/, "");
  const out = body ? [...lines.slice(0, start), ...body.split("\n"), ...lines.slice(end)]
                   : [...lines.slice(0, start), ...lines.slice(end).slice(lines[end] !== undefined && lines[end].trim() === "" && start > 0 && lines[start - 1].trim() === "" ? 1 : 0)];
  return out.join("\n");
}

/** Insert a row block BEFORE or AFTER the row `id` (the plan's order is file position, WORK-PIPELINE §1), separated by
    one blank line. */
export function insertRow(text, where, id, block) {
  if (!["before", "after"].includes(where)) throw refusal("BAD_POSITION", `insert takes "before" or "after", not ${where}.`);
  if (text === null) throw refusal("FILE_ABSENT", `no row ${id}: the file does not exist.`);
  const lines = text.split("\n");
  const { start, end } = rowSpan(lines, id);
  const body = block.replace(/^\n+|\n+$/g, "").split("\n");
  return (where === "before"
    ? [...lines.slice(0, start), ...body, "", ...lines.slice(start)]
    : [...lines.slice(0, end), "", ...body, ...lines.slice(end)]).join("\n");
}

/** Set a plan row's status word — `### <ID> · <word>` — and, with a note, the rest of its heading. */
export function setStatus(text, id, state, note = null) {
  if (!ROW_STATES.includes(state)) throw refusal("UNKNOWN_STATE", `\`${state}\` is not a row state (${ROW_STATES.join(", ")}).`);
  if (text === null) throw refusal("FILE_ABSENT", `no row ${id}: the file does not exist.`);
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^(###\\s+${esc}\\s+·\\s+)([A-Za-z-]+)(.*)$`, "gm");
  const hits = [...text.matchAll(re)];
  if (!hits.length) throw refusal("ROW_NOT_FOUND", `no row headed \`### ${id} · <state>\`.`);
  if (hits.length > 1) throw refusal("ROW_AMBIGUOUS", `${hits.length} rows are headed ${id}.`);
  return text.replace(re, (_, pre, _old, rest) => `${pre}${state}${note === null ? rest : ` — ${note}`}`);
}

/** Apply ONE intent inside a materialised tree `dir`. Returns the paths it changed. */
async function applyIntent(dir, it) {
  const need = (rel) => {
    if (!rel || !isMovedPath(rel)) throw refusal("NOT_A_STATE_FILE", `${rel} is not a state file — it stays on main (TREE-SHARING §1).`);
    return rel;
  };
  const rd = (rel) => { try { return readFileSync(join(dir, rel), "utf8"); } catch { return null; } };
  const wr = (rel, t) => { mkdirSync(dirname(join(dir, rel)), { recursive: true }); writeFileSync(join(dir, rel), t); };
  switch (it.op) {
    case "append": wr(need(it.file), appendBlock(rd(it.file), it.text)); return;
    case "line": wr(need(it.file), addLine(rd(it.file), it.under, it.text)); return;
    case "replace": wr(need(it.file), withNL(it.text)); return;
    case "row": wr(need(it.file), replaceRow(rd(it.file), it.id, it.text ?? "")); return;
    case "insert": wr(need(it.file), insertRow(rd(it.file), it.where, it.id, it.text)); return;
    case "status": {
      const files = it.file ? [need(it.file)] : ["docs/development/QUEUE.md", "docs/development/BACKLOG.md", "docs/development/BACKLOG-LATER.md"];
      const holders = files.filter((f) => { const t = rd(f); return t !== null && new RegExp(`^###\\s+${it.id.replace(/[-]/g, "\\-")}\\s+·`, "m").test(t); });
      if (!holders.length) throw refusal("ROW_NOT_FOUND", `no row ${it.id} in ${files.join(" or ")}.`);
      if (holders.length > 1) throw refusal("ROW_AMBIGUOUS", `${it.id} is a row of ${holders.join(" and ")} — name the file.`);
      wr(holders[0], setStatus(rd(holders[0]), it.id, it.state, it.note ?? null));
      return;
    }
    case "archive": {
      const L = await import("./ledger.mjs");
      try { L.archiveId(it.id, { repo: dir }); }
      catch (e) { if (e instanceof L.Refusal) throw refusal(`ARCHIVE_${e.code}`, e.message); throw e; }
      return;
    }
    case "refill": {
      const L = await import("./ledger.mjs");
      try { L.refill({ repo: dir }); }
      catch (e) { if (e instanceof L.Refusal) throw refusal(`REFILL_${e.code}`, e.message); throw e; }
      return;
    }
    /* M0-119: hold the backlog's split at its budget — whole rows from its foot to the tail's head, or back as room
       frees (`ledger.mjs` `rebalance`). The named intent also CREATES an absent tail's header; the rebalance `write` runs
       after every write's intents (`auto`) never does, and is skipped on a tree that holds no backlog. */
    case "rebalance": {
      const L = await import("./ledger.mjs");
      if (it.auto && rd(L.LEDGERS.BACKLOG.live) === null) return;
      try { L.rebalance({ repo: dir, ensure: !it.auto }); }
      catch (e) { if (e instanceof L.Refusal) throw refusal(`REBALANCE_${e.code}`, e.message); throw e; }
      return;
    }
    /* M0-119: an exact text, found ONCE in the file it is applied to, replaced — for a preamble line no row intent
       reaches. Anchored to its text, never a line number, so a concurrent write elsewhere in the file is kept. */
    case "swap": {
      const t = rd(need(it.file));
      if (t === null) throw refusal("FILE_ABSENT", `${it.file} does not exist.`);
      const n = it.old ? t.split(it.old).length - 1 : 0;
      if (n !== 1) throw refusal(n ? "SWAP_AMBIGUOUS" : "SWAP_NOT_FOUND", `the text to replace occurs ${n} time(s) in ${it.file}, not once: "${String(it.old).slice(0, 80)}"`);
      wr(it.file, t.replace(it.old, () => it.text));
      return;
    }
    default: throw refusal("UNKNOWN_INTENT", `unknown intent ${JSON.stringify(it).slice(0, 120)}`);
  }
}

/* ------------------------------------------------------------------------- the ledger checks */

/** Every arm that judges the LIVE STATE, as data. Each names where it came from (BOB #28's ruling 2: none is
    dropped). `repo` is a tree whose state files are read through `readState` — a materialised write, the repository
    itself (switched or not), or a planted fixture. An arm that could not run is a FAIL naming why, never a pass. */
export async function ledgerChecks({ repo = ROOT, today = undefined, git: gitArm = false, only = null } = {}) {
  const arms = [];
  const arm = async (id, from, title, fn) => {
    if (only && !only.includes(id)) return;
    try { const r = await fn(); arms.push({ id, from, title, fails: r.fails || [], warns: r.warns || [], note: r.note || "" }); }
    catch (e) { arms.push({ id, from, title, fails: [`the arm could not run: ${e.code || ""} ${String(e.message).slice(0, 200)}`], warns: [], note: "" }); }
  };
  const rs = (rel) => readState(repo, rel);

  await arm("LC-markers", "plancheck §0 (the state files only)", "no unresolved merge marker in a state file", () => {
    const open = "<".repeat(7), mid = "=".repeat(7), close = ">".repeat(7), fails = [];
    let files = 0;
    for (const rel of stateFiles(repo)) {
      const t = rs(rel); if (t === null) continue; files++;
      t.split("\n").forEach((l, i) => { if (l.startsWith(open + " ") || l === mid || l.startsWith(close + " ")) fails.push(`${rel}:${i + 1}`); });
    }
    return { fails, note: `${files} state file(s) scanned` };
  });

  await arm("LC-debt-token", "planning-hygiene §1 (live), plancheck §2", "every open DEBT row carries a disposition token", async () => {
    const { debtTokenAudit } = await import("./ledger.mjs");
    const t = rs("docs/development/DEBT.md");
    if (t === null) return { fails: ["docs/development/DEBT.md could not be read — an unreadable ledger is not an empty one"] };
    const a = debtTokenAudit(t);
    /* NON-VACUITY, not size (M0-109's correction): zero rows is the empty-corpus pass, and it FAILS here by name.
       When LED-7 archives DEBT.md whole, that landing re-points this arm; it is never left to pass over nothing. */
    return { fails: [...(a.rows ? [] : ["DEBT.md has NO debt rows — a token check over nothing passes for free"]),
                     ...a.bad.map((b) => `${b.id} found: "${b.status.slice(0, 60)}"`)], note: `${a.rows} DEBT row(s) read` };
  });

  await arm("LC-queued-refs", "planning-hygiene §2 (live)", "every `QUEUED <ID>` in the design and process docs names a live or archived queue row", async () => {
    const { pipelineRows, archivedQueueIds } = await import("./ledger.mjs");
    const ids = new Set(pipelineRows({ repo }).rows.map((r) => r.id));
    const arch = archivedQueueIds({ repo });
    const refs = queuedRefs(repo);
    const fails = refs.filter((r) => !ids.has(r.id) && !arch.has(r.id)).map((r) => `${r.id} in ${r.file}`);
    /* The suite's three floors, kept as NON-VACUITY (M0-109's principle; the suite floored ids at 10, a SIZE). */
    if (!refs.length) fails.push("no concrete QUEUED reference found — the walk may be reading nothing");
    if (!ids.size) fails.push("the cache and the backlog declare no item id");
    if (!arch.size) fails.push("the archive yields no queue id — the archive-aware lookup would be vacuous");
    return { fails, note: `${refs.length} reference(s), ${ids.size} live id(s), ${arch.size} archived` };
  });

  await arm("LC-row-design", "planning-hygiene §4 (live), pipeline-readers §4 (live), plancheck §7", "every open plan row names a governed design, an IC or a routed gap", async () => {
    const { rowDesignAudit } = await import("./rowdesign.mjs");
    const a = rowDesignAudit({ repo });
    return { fails: [...(a.open.length ? [] : ["the plan has NO open row to judge — a totality assertion over an empty corpus"]),
                     ...a.findings.map((f) => `${f.id} (${f.file}:${f.line}) names no design`),
                     ...a.unknownState.map((r) => `${r.id} · ${r.state} (${r.file}) — an unrecognised state`)],
             note: `${a.open.length} open row(s) judged of ${a.rows.length}` };
  });

  await arm("LC-strays", "pipeline-readers §5 (live)", "no OPEN row hides under a row-shaped heading the grammar cannot read", async () => {
    const { pipelineRows } = await import("./ledger.mjs");
    const p = pipelineRows({ repo });
    return { fails: p.strays.filter((x) => !x.closed).map((x) => `${x.file}:${x.line} ${x.heading.slice(0, 60)}`),
             note: `${p.strays.length} stray heading(s), ${p.strays.filter((x) => x.closed).length} closed` };
  });

  await arm("LC-owed-agreement", "pipeline-readers §7 (live)", "every plan item owed lists is a blocked row the lister reads", async () => {
    const { pipelineRows } = await import("./ledger.mjs");
    const { owedFor } = await import("./owed.mjs");
    const blocked = new Set(pipelineRows({ repo }).rows.filter((r) => r.state === "blocked").map((r) => `${r.ledger} ${r.id}`));
    const o = owedFor("BOB", { repo });
    return { fails: o.items.filter((i) => i.source === "QUEUE" || i.source === "BACKLOG").map((i) => `${i.source} ${i.id}`).filter((k) => !blocked.has(k))
      .map((k) => `${k} is owed and is not a blocked row the lister reads`) };
  });

  await arm("LC-plan-fields", "pipeline-readers §4 (live), plancheck §2", "every plan row's milestone is defined and its interface registered", async () => {
    const { planRows, planFieldAudit } = await import("./rowdesign.mjs");
    const p = planRows({ repo });
    const fa = planFieldAudit(p.rows, { milestones: rs("docs/development/MILESTONES.md"), interfaces: rs("docs/development/INTERFACES.md") });
    return { fails: [...p.unreadable.map((u) => `${u} could not be read`),
                     ...fa.unknownMilestone.map((u) => `${u.id} names ${u.milestone}, which MILESTONES.md does not define`),
                     ...fa.unregisteredInterface.map((u) => `${u.id} is behind ${u.interface}, not in INTERFACES.md`)],
             note: `${fa.rowsRead} row(s) read` };
  });

  await arm("LC-delegations", "planning-hygiene §5 (live), plancheck §8", "every DELEGATION block in CLAIMS.md states its own state, dated", async () => {
    const { delegationAudit, CORPUS_FLOOR } = await import("./delegations.mjs");
    const a = delegationAudit({ repo, git: gitArm, ...(today ? { today } : {}) });
    const fails = a.findings.map((f) => `CLAIMS.md:${f.b.line} ${f.kind}`);
    if (a.corpus < CORPUS_FLOOR) fails.push(`the walk found ${a.corpus} DELEGATION block(s), under the floor ${CORPUS_FLOOR} — a matcher that stops matching reads clean`);
    return { fails, note: `${a.corpus} DELEGATION block(s)` };
  });

  await arm("LC-ledger", "plancheck §2h, ledger §8 (live)", "no closed row live, every depends-on resolves, the pipeline invariants (armed ones)", async () => {
    const L = await import("./ledger.mjs");
    const a = L.ledgerAudit({ repo });
    const fails = a.unreadable.map((u) => `${u} could not be read`), warns = [];
    for (const [arm2, s2] of Object.entries(a.arming))
      if (!s2.found) warns.push(`arm "${arm2}" is switched by ${s2.row}, which is in neither the live ledger nor its archive`);
      else if (s2.state.split("/").every((x) => x === "superseded"))
        fails.push(`arm "${arm2}" is switched by ${s2.row}, which is SUPERSEDED and so can never arm (ledger §8, moved)`);
    for (const [n, ids] of Object.entries(a.closedLive)) if (ids.length) (a.armed.closedLive ? fails : warns).push(`${n}: closed row(s) live — ${ids.join(", ")}`);
    for (const u of a.depends.unresolved) fails.push(`${u.id} (${u.file}:${u.line}) depends on ${u.dep}: ${u.why}`);
    for (const r of a.budget.rowsOver) warns.push(`${r.ledger} row ${r.id} is ${r.bytes} B against ${r.budget}`);
    if (a.pipeline) for (const [k, p] of Object.entries(a.pipeline.arms))
      for (const v of p.violations) (p.armed ? fails : warns).push(`${k} ${L.describeViolation(k, v)}`);
    return { fails, warns, note: a.pipeline ? `cache ${a.pipeline.cacheRows} row(s), backlog ${a.pipeline.backlogRows} row(s), tail ${a.pipeline.tailRows} row(s)` : "pipeline UNREAD" };
  });

  await arm("LC-debt-agreement", "ledger §3 (live)", "no live DEBT row owed lists for any lane reads closed, and no residue reads closed", async () => {
    const L = await import("./ledger.mjs");
    const { owedFor, RESIDUE_RE } = await import("./owed.mjs");
    const t = rs("docs/development/DEBT.md");
    if (t === null) return { fails: ["docs/development/DEBT.md could not be read"] };
    const rows = L.debtRows(t);
    if (!rows.length) return { fails: ["DEBT.md has NO rows — the agreement is vacuous (M0-109's non-vacuity floor, moved here)"] };
    const owed = new Set(["BOB", "CONDUCT", "DIST", "ZZZNOTALANE"].flatMap((lane) => owedFor(lane, { repo }).items.map((i) => i.id)));
    return { fails: [...rows.filter((r) => RESIDUE_RE.test(r.disposition) && r.closed).map((r) => `${r.id} declares a residue and reads closed`),
                     ...rows.filter((r) => r.closed && owed.has(r.id)).map((r) => `${r.id} is owed by a lane and reads closed`)],
             note: `${rows.length} DEBT row(s)` };
  });

  /* RETIRED 2026-09-24 by c19-unionfix (CONDUCT #19, on SCHEDULER #17's finding): the D-388 CLAUSE. This arm held that
     the standard's UNDECIDED set was ROUTED to a live DEBT row, D-388. BOB #32 classified every undecided file in
     CORPUS-STANDARD §6 (land/bob/folds-0924b) and the table is EMPTY: "D-388 drained it". The route it guarded no
     longer exists, and once D-388 leaves DEBT.md (M0-140) the old clause would have refused EVERY coord write. What
     survives is the arm's real duty, that UNDECIDED is a closed hole somebody drains, stated as what is now true: the
     table is EMPTY, and a row arriving there fails here, by name, until it is classified in §5 or §6. */
  await arm("LC-undecided-route", "corpuscheck §5 (live)", "the corpus standard's UNDECIDED table is empty — every design file is classified (D-388 drained it, 2026-09-24)", () => {
    const std = rs("docs/architecture/CORPUS-STANDARD.md");
    if (std === null) return { fails: ["CORPUS-STANDARD.md could not be read"] };
    const at = std.search(/^#{2,4}\s*Undecided\b/mi);
    const sect = at < 0 ? "" : std.slice(at).split(/\n#{2,4}\s/)[0];
    const rows = [...sect.matchAll(/^\|\s*`([^`]+\.md)`\s*\|/gm)].map((m) => m[1]);
    return { fails: rows.map((f) => `CORPUS-STANDARD.md §6 lists ${f} as UNDECIDED — classify it in §5 or §6; the D-388 route that drained this table is retired`),
             note: `${rows.length} undecided row(s)` };
  });

  await arm("LC-op-claims", "op-claims (the state half of its walk)", "every op= claim in a state file names a real op, routes where the plane routes it, or is ledgered exactly", async () => {
    const O = await import("../bio-plane/scripts/op-claims.mjs");
    const files = stateFiles(repo).map((rel) => ({ rel, body: rs(rel) })).filter((f) => f.body !== null);
    /* A ledger entry is held EXACTLY against its own file. An entry whose file this tree does not hold at all is not
       judged as drift — it is NAMED (a planted fixture holds none of them; the real coord holds all eleven). */
    const present = new Set(files.map((f) => f.rel));
    const held = O.LEDGER_STATE.filter((e) => present.has(e.file));
    const absent = [...new Set(O.LEDGER_STATE.filter((e) => !present.has(e.file)).map((e) => e.file))];
    const r = O.sweep({ files, ledger: held });
    return { fails: [...r.findings.map((f) => `${f.site} ${f.class}: ${f.detail}`), ...r.ledgerDrift, ...r.plannedBuilt.map((p) => `PLANNED op ${p} is BUILT`)],
             warns: absent.map((f) => `ledgered file ${f} is not in this tree, so its entries are unjudged`),
             note: `${files.length} state file(s), ${r.mentionsRepro} op= mention(s), ${r.attributionsRepro.length} attribution(s), ${held.length} of ${O.LEDGER_STATE.length} ledger entr(ies) held` };
  });

  await arm("LC-handoff-budget", "plancheck §2e' (the handoffs)", "every lane handoff is within the reading budget", async () => {
    const { check } = await import("./readbudget.mjs");
    const over = check(repo).filter((o) => NEXT_RE.test(o.file));
    return { fails: over.filter((o) => o.verdict === "FAIL").map((o) => `${o.file} is ${o.bytes} B against ${o.budget} B`),
             warns: over.filter((o) => o.verdict !== "FAIL").map((o) => `${o.file} is ${o.bytes} B against ${o.budget} B`) };
  });

  return { arms, ok: arms.every((a) => !a.fails.length) };
}

/** The state files a tree holds, as a reader sees them. */
export function stateFiles(repo) {
  const out = [];
  for (const f of MOVED_FILES) if (stateExists(repo, f)) out.push(f);
  for (const n of listState(repo, "docs/development/kickoffs")) if (NEXT_RE.test(`docs/development/kickoffs/${n}`)) out.push(`docs/development/kickoffs/${n}`);
  for (const d of MOVED_DIRS) for (const n of listState(repo, d)) out.push(`${d}/${n}`);
  return out;
}

/** Every `QUEUED <ID>` (and "QUEUED as <ID>") in the .md files under docs/development and docs/architecture — the
    walk `planning-hygiene` §2 made, over the files a reader sees (state files through the layer). */
export function queuedRefs(repo) {
  const refs = [];
  const seen = new Set();
  const visit = (rel, body) => {
    if (seen.has(rel) || body === null) return; seen.add(rel);
    for (const m of body.matchAll(/\bQUEUED\s+(?:as\s+)?([A-Z][A-Z0-9]*-\d+)\b/g)) refs.push({ file: rel, id: m[1] });
  };
  const walk = (dir) => {
    for (const n of listState(repo, dir)) {
      const rel = `${dir}/${n}`;
      let isDir = false;
      try { isDir = statSync(join(repo, rel)).isDirectory(); } catch { isDir = false; }
      if (isDir) walk(rel);
      else if (n.endsWith(".md")) visit(rel, readState(repo, rel));
    }
  };
  walk("docs/development"); walk("docs/architecture");
  return refs;
}

export function checksReport(r) {
  const L = [];
  for (const a of r.arms) {
    L.push(`${a.fails.length ? "FAIL" : a.warns.length ? "WARN" : "PASS"}  ${a.id} ${a.title}${a.note ? ` — ${a.note}` : ""}   (from ${a.from})`);
    for (const f of a.fails.slice(0, 12)) L.push(`        ${f}`);
    if (a.fails.length > 12) L.push(`        … ${a.fails.length - 12} more`);
    for (const w of a.warns.slice(0, 5)) L.push(`        warn: ${w}`);
  }
  L.push(`ledger checks: ${r.arms.length} arm(s), ${r.arms.filter((a) => a.fails.length).length} failing`);
  return L.join("\n");
}

/* ------------------------------------------------------------------------------ the write command */

function materialise(repo, tip, base = "HEAD") {
  const dir = mkdtempSync(join(tmpdir(), "coord-write-"));
  const extract = (rev, paths) => {
    const a = git(repo, ["archive", "--format=tar", rev, ...paths], { buffer: true });
    if (a.status !== 0) return false;
    const x = spawnSync("tar", ["-x", "-C", dir], { input: a.stdout, maxBuffer: 1 << 30 });
    if (x.status !== 0) throw refusal("MATERIALISE_FAILED", `tar exited ${x.status}: ${String(x.stderr).slice(0, 200)}`);
    return true;
  };
  /* `main`'s side first — the cross-checks' half (designs, INTERFACES, MILESTONES, construct status, CLAUDE.md) —
     then the coord tree over it, so every state file is coord's. `base` missing a path is not an error. */
  /* `git archive` fails WHOLE on a pathspec that matches nothing, so only the paths `base` has are named. */
  const have = git(repo, ["ls-tree", "--name-only", base, "--", "docs", "CLAUDE.md"]).stdout.split("\n").filter(Boolean);
  if (have.length && !extract(base, have)) throw refusal("MATERIALISE_FAILED", `main's side (${have.join(", ")}) could not be read from ${base}.`);
  for (const rel of mainStateFiles(dir)) rmSync(join(dir, rel), { force: true });
  extract(tip, []);
  return dir;
}

/* The state paths present in a directory tree (a materialised base still carries main's pre-cutover state files,
   or its pointers; they are removed before coord's tree is laid over it, so a file deleted on coord stays deleted). */
function mainStateFiles(dir) {
  const out = [];
  for (const f of MOVED_FILES) if (existsSync(join(dir, f))) out.push(f);
  try { for (const n of readdirSync(join(dir, "docs/development/kickoffs"))) if (NEXT_RE.test(`docs/development/kickoffs/${n}`)) out.push(`docs/development/kickoffs/${n}`); } catch { /* none */ }
  for (const d of MOVED_DIRS) try { for (const n of readdirSync(join(dir, d))) out.push(`${d}/${n}`); } catch { /* none */ }
  return out;
}

function commitFrom(repo, tip, dir, message, { env = null } = {}) {
  const lsTree = git(repo, ["ls-tree", "-r", "--full-tree", tip], { allowFail: false }).stdout;
  const before = new Map(lsTree.split("\n").filter(Boolean).map((l) => { const [meta, path] = l.split("\t"); return [path, meta.split(" ")[2]]; }));
  const now = mainStateFiles(dir);
  const hashes = now.length
    ? git(repo, ["hash-object", "-w", "--stdin-paths"], { input: now.map((r) => join(dir, r)).join("\n") + "\n", allowFail: false }).stdout.trim().split("\n")
    : [];
  const after = new Map(now.map((r, i) => [r, hashes[i]]));
  const lines = [];
  const changed = [];
  for (const [p, s] of after) if (before.get(p) !== s) { lines.push(`100644 ${s}\t${p}`); changed.push(p); }
  for (const p of before.keys()) if (isMovedPath(p) && !after.has(p)) { lines.push(`0 ${"0".repeat(40)}\t${p}`); changed.push(p); }
  if (!lines.length) return { commit: null, changed };
  const idx = join(dir, ".coord-index");
  const ienv = { GIT_INDEX_FILE: idx, ...(env || {}) };
  git(repo, ["read-tree", tip], { env: ienv, allowFail: false });
  git(repo, ["update-index", "--index-info"], { env: ienv, input: lines.join("\n") + "\n", allowFail: false });
  const tree = git(repo, ["write-tree"], { env: ienv, allowFail: false }).stdout.trim();
  const commit = git(repo, ["commit-tree", tree, "-p", tip, "-F", "-"], { env, input: message, allowFail: false }).stdout.trim();
  return { commit, changed };
}

/** THE WRITE. Intents are re-applied to the fresh tip on every attempt; nothing is ever merged. */
export async function write({ repo = ROOT, intents, message, remote = REMOTE, branch = BRANCH, base = "HEAD",
                              dryRun = false, maxAttempts = 6, checks = true, beforePush = null, today = undefined,
                              rebalance = true } = {}) {
  if (!Array.isArray(intents) || !intents.length) throw refusal("NO_INTENT", "nothing to write — name at least one intent.");
  if (!message || !String(message).trim()) throw refusal("NO_MESSAGE", "a coord commit carries a message saying what the note is (-m).");
  const tracking = `refs/remotes/${remote}/${branch}`;
  const attempts = [];
  for (let n = 1; n <= maxAttempts; n++) {
    const f = git(repo, ["fetch", "-q", remote, `+refs/heads/${branch}:${tracking}`]);
    const tipR = git(repo, ["rev-parse", "--verify", "--quiet", `${tracking}^{commit}`]);
    if (f.status !== 0 || tipR.status !== 0)
      throw refusal("NO_COORD", `\`${remote}/${branch}\` could not be fetched (${String(f.stderr).trim().split("\n")[0] || "absent"}) — `
        + "the cutover has not happened, or the remote is unreachable. Nothing written.");
    const tip = tipR.stdout.trim();
    const dir = materialise(repo, tip, base);
    try {
      for (const it of intents) await applyIntent(dir, it);
      /* M0-119: A PLACEMENT OVER BUDGET MOVES THE TAIL, NEVER CUTS A ROW (WORK-PIPELINE §2) — so every write, whatever its
         intents, ends by holding the backlog's split at its budget, BEFORE the ledger checks judge the result. */
      if (rebalance && !intents.some((it) => it.op === "rebalance")) await applyIntent(dir, { op: "rebalance", auto: true });
      let checked = null;
      if (checks) {
        checked = await ledgerChecks({ repo: dir, today });
        if (!checked.ok)
          throw refusal("LEDGER_CHECK_FAILED", `the write would leave coord failing ${checked.arms.filter((a) => a.fails.length).map((a) => a.id).join(", ")}:\n`
            + checksReport({ arms: checked.arms.filter((a) => a.fails.length) }) + "\nNothing pushed.");
      }
      const { commit, changed } = commitFrom(repo, tip, dir, withNL(message));
      if (!commit) return { status: "unchanged", tip, attempts, changed };
      if (dryRun) return { status: "dry-run", tip, commit, changed, attempts, checks: checked };
      if (beforePush) await beforePush({ attempt: n, tip, commit });
      const p = git(repo, ["push", "--porcelain", remote, `${commit}:refs/heads/${branch}`]);
      attempts.push({ attempt: n, tip, commit, status: p.status });
      if (p.status === 0) {
        const ls = git(repo, ["ls-remote", "--heads", remote, branch]);
        const onRemote = (ls.stdout.split(/\s/)[0] || "").trim();
        git(repo, ["update-ref", tracking, commit]);
        resetCoordCache();
        return { status: onRemote === commit ? "pushed" : "pushed-unverified", tip, commit, changed, attempts, onRemote,
                 pushOutput: `${p.stdout || ""}${p.stderr || ""}` };
      }
      const why = `${p.stdout || ""}${p.stderr || ""}`;
      if (!/non-fast-forward|fetch first|rejected|stale info|cannot lock ref/i.test(why))
        throw refusal("PUSH_FAILED", `the push of ${commit.slice(0, 8)} was refused, and not for a moved tip: ${why.trim().slice(0, 300)}`);
      /* A moved tip: fetch again and RE-APPLY THE INTENTS. */
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  throw refusal("RETRIES_EXHAUSTED", `coord moved under ${maxAttempts} consecutive attempts; nothing landed.`);
}

/* -------------------------------------------------------------------------------- the churn figure */

/** Per-path churn on a ref since a time, and the figure §1 owes: landings (first-parent commits) whose change
    touched ONLY state files, which after the cutover would not move `main` at all. */
export function churn({ repo = ROOT, ref = `${REMOTE}/main`, since = "2026-09-22T00:00:00Z", until = null } = {}) {
  const range = ["--since", since, ...(until ? ["--until", until] : [])];
  const perPath = new Map();
  const nm = git(repo, ["log", ref, "--no-merges", "--format=@@%H", "--name-only", ...range], { allowFail: false }).stdout;
  let nonMerge = 0;
  for (const l of nm.split("\n")) {
    if (l.startsWith("@@")) { nonMerge++; continue; }
    if (l.trim()) perPath.set(l, (perPath.get(l) || 0) + 1);
  }
  const fp = git(repo, ["log", ref, "--first-parent", "--format=%H %P", ...range], { allowFail: false }).stdout.split("\n").filter(Boolean);
  const DECIDED = "docs/DECIDED.md";
  const klass = { stateOnly: 0, stateOnlyWithDecided: 0, stateOnlyWithMilestones: 0, touchedState: 0, noState: 0, empty: 0 };
  const landings = [];
  for (const line of fp) {
    const [sha, p1] = line.split(" ");
    const files = git(repo, p1 ? ["diff", "--name-only", p1, sha] : ["show", "--format=", "--name-only", sha], { allowFail: false })
      .stdout.split("\n").filter(Boolean);
    const state = files.filter(isMovedPath);
    const rest = files.filter((f) => !isMovedPath(f));
    const restNoDecided = rest.filter((f) => f !== DECIDED);
    const restNoDM = restNoDecided.filter((f) => f !== MILESTONES);
    let k;
    if (!files.length) k = "empty";
    else if (!rest.length) k = "stateOnly";
    else if (state.length && !restNoDecided.length) k = "stateOnlyWithDecided";
    else if (state.length && !restNoDM.length) k = "stateOnlyWithMilestones";
    else if (state.length) k = "touchedState";
    else k = "noState";
    klass[k]++;
    landings.push({ sha, k, files: files.length });
  }
  const rows = [...perPath].sort((a, b) => b[1] - a[1]).map(([path, n]) => ({ path, n, moves: isMovedPath(path) || path === DECIDED }));
  return { ref, since, until, nonMerge, landings: fp.length, klass, rows, tip: refSha(repo, ref) };
}

/* ------------------------------------------------------------------------------------ the migration */

const FIXED_DATE = "2026-09-22T00:00:00Z";

/** Split MILESTONES.md at the placement heading: [the file with the section replaced by its pointer, the section]. */
export function splitMilestones(text) {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => l.replace(/\s+$/, "") === PLACEMENT_HEADING);
  if (at < 0) return null;
  let end = at + 1;
  while (end < lines.length && !/^##\s/.test(lines[end])) end++;
  const section = lines.slice(at, end).join("\n").replace(/\n+$/, "") + "\n";
  const kept = [...lines.slice(0, at), ...placementPointer().replace(/\n$/, "").split("\n"), "", ...lines.slice(end)].join("\n");
  return { milestones: kept, placement: `# PLACEMENT — moved from \`${MILESTONES}\` by M0-110 (BOB #28's ruling 3; state, so it lives on \`coord\`)\n\n${section}` };
}

/** BUILD THE CUTOVER, touching no ref but the two it names. From the integration HEAD `from`:
      coord  — a ROOT commit (no parent: a later merge of `coord` into `main` is refused as unrelated history) holding
               exactly the state files as `from` holds them, plus PLACEMENT.md split out of MILESTONES.md;
      main   — a commit on `from` that swaps each state file for its pointer and MILESTONES' section for its pointer.
    FIXED DATES and a message naming `from`, so a re-run from the same commit by the same identity gives the SAME two
    commits: idempotent. Refused on a tree that is already switched. Writes `refs/heads/<coordBranch>` and
    `refs/heads/<mainBranch>` locally only when asked; pushes nothing — the cutover is CONDUCT's act. */
export function migrate({ repo = ROOT, from = "HEAD", coordBranch = null, mainBranch = null, env = null } = {}) {
  const base = git(repo, ["rev-parse", "--verify", `${from}^{commit}`], { allowFail: false }).stdout.trim();
  const ls = git(repo, ["ls-tree", "-r", "--full-tree", base], { allowFail: false }).stdout.split("\n").filter(Boolean)
    .map((l) => { const [meta, path] = l.split("\t"); const [mode, , sha] = meta.split(" "); return { mode, sha, path }; });
  const state = ls.filter((e) => isMovedPath(e.path));
  const show = (p) => git(repo, ["show", `${base}:${p}`], { allowFail: false }).stdout;
  const q = state.find((e) => e.path === SWITCH_FILE);
  if (q && isPointer(show(SWITCH_FILE))) throw refusal("ALREADY_SWITCHED", `${base.slice(0, 8)} already carries the pointers — the migration has run.`);
  if (!q) throw refusal("NO_STATE", `${base.slice(0, 8)} has no ${SWITCH_FILE} — nothing to move.`);
  const ms = ls.find((e) => e.path === MILESTONES);
  const split = ms ? splitMilestones(show(MILESTONES)) : null;
  const denv = { GIT_AUTHOR_DATE: FIXED_DATE, GIT_COMMITTER_DATE: FIXED_DATE, ...(env || {}) };
  const hash = (text) => git(repo, ["hash-object", "-w", "--stdin"], { input: text, allowFail: false }).stdout.trim();

  const scratch = mkdtempSync(join(tmpdir(), "coord-migrate-"));
  try {
    /* coord: a root commit of the state files. */
    const cidx = { GIT_INDEX_FILE: join(scratch, "coord-index"), ...denv };
    const centries = state.map((e) => `${e.mode} ${e.sha}\t${e.path}`);
    if (split) centries.push(`100644 ${hash(split.placement)}\t${PLACEMENT}`);
    git(repo, ["update-index", "--add", "--index-info"], { env: cidx, input: centries.join("\n") + "\n", allowFail: false });
    const ctree = git(repo, ["write-tree"], { env: cidx, allowFail: false }).stdout.trim();
    const coord = git(repo, ["commit-tree", ctree, "-F", "-"], { env: denv, allowFail: false,
      input: `coord: the message board leaves main (M0-110; TREE-SHARING.md §1)\n\n`
        + `A root commit: the state files exactly as ${base} holds them, and PLACEMENT.md split out of MILESTONES.md\n`
        + `(BOB #28's ruling 3). Built by \`node tools/coord.mjs migrate --from ${base}\`; its dates are fixed so a re-run\n`
        + `from the same commit gives this same commit.\n` }).stdout.trim();

    /* main: the pointer commit. */
    const midx = { GIT_INDEX_FILE: join(scratch, "main-index"), ...denv };
    git(repo, ["read-tree", base], { env: midx, allowFail: false });
    const mentries = state.map((e) => `100644 ${hash(pointerText(e.path))}\t${e.path}`);
    if (split) mentries.push(`100644 ${hash(split.milestones)}\t${MILESTONES}`);
    git(repo, ["update-index", "--index-info"], { env: midx, input: mentries.join("\n") + "\n", allowFail: false });
    const mtree = git(repo, ["write-tree"], { env: midx, allowFail: false }).stdout.trim();
    const main = git(repo, ["commit-tree", mtree, "-p", base, "-F", "-"], { env: denv, allowFail: false,
      input: `M0-110 cutover: each state file on main becomes its one-line pointer to coord\n\n`
        + `${state.length} file(s) moved to the branch coord (its root commit ${coord}); MILESTONES.md's placement table\n`
        + `leaves as PLACEMENT.md with a pointer where it stood. Readers follow through tools/coord.mjs readState:\n`
        + `the pointer is the switch. Built by \`node tools/coord.mjs migrate --from ${base}\`.\n` }).stdout.trim();

    if (coordBranch) git(repo, ["update-ref", `refs/heads/${coordBranch}`, coord], { allowFail: false });
    if (mainBranch) git(repo, ["update-ref", `refs/heads/${mainBranch}`, main], { allowFail: false });
    return { base, coord, main, moved: state.map((e) => e.path), placement: !!split };
  } finally { rmSync(scratch, { recursive: true, force: true }); }
}

/* ---------------------------------------------------------------------------------------- CLI */

function usage(code = 2) {
  console.error([
    "usage: node tools/coord.mjs read <path>",
    "       node tools/coord.mjs write -m <message> <intent>... [--dry-run]",
    "         intents, applied in order to the fresh coord tip on EVERY attempt:",
    "           --append <path> <textfile|->            a block at the end of the file (a new file is created)",
    "           --line <path> <heading> <textfile|->    lines at the end of the block under that heading",
    "           --status <ID> <state> [--note <text>]   a plan row's status word (and the rest of its heading)",
    "           --replace <path> <textfile|->           the whole file (a lane's own handoff)",
    "           --row <path> <ID> <textfile|->          a plan row's whole block (an empty file deletes the row)",
    "           --insert <path> before|after <ID> <textfile|->   a new row placed by the row it follows or precedes",
    "           --archive <ID>                          node tools/ledger.mjs archive, inside the write",
    "           --refill                                node tools/ledger.mjs refill, inside the write",
    "           --rebalance                             node tools/ledger.mjs rebalance, inside the write (creates an absent tail);",
    "                                                   every write ends with one anyway (M0-119), which never creates the tail",
    "           --swap <path> <oldfile|-> <newfile|->   an exact text, found once, replaced (a preamble line)",
    "           --intents <json-file>                   an array of {op, file, text, under, id, state, note}",
    "       node tools/coord.mjs checks [--git]",
    "       node tools/coord.mjs churn [--since <iso>] [--until <iso>] [--ref <ref>]",
    "       node tools/coord.mjs migrate [--from <rev>] [--coord-branch <name>] [--main-branch <name>]",
    "       node tools/coord.mjs where",
  ].join("\n"));
  process.exit(code);
}

async function cli(argv) {
  const [cmd, ...rest] = argv;
  const opt = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : null; };
  const textOf = (f) => (f === "-" ? readFileSync(0, "utf8") : readFileSync(f, "utf8"));
  if (cmd === "read") {
    const rel = rest[0]; if (!rel) usage();
    const r = readRemote(rel);
    if (r.text === null) { console.error(`${rel}: not found on ${r.ref || `${REMOTE}/coord or ${REMOTE}/main`}${r.sha ? ` @ ${r.sha.slice(0, 8)}` : ""}`); process.exit(1); }
    process.stderr.write(`(${rel} from ${r.ref} @ ${r.sha.slice(0, 8)})\n`);
    process.stdout.write(r.text);
  } else if (cmd === "write") {
    const intents = [];
    for (let i = 0; i < rest.length; i++) {
      const a = rest[i];
      if (a === "--append") { intents.push({ op: "append", file: rest[i + 1], text: textOf(rest[i + 2]) }); i += 2; }
      else if (a === "--line") { intents.push({ op: "line", file: rest[i + 1], under: rest[i + 2], text: textOf(rest[i + 3]) }); i += 3; }
      else if (a === "--replace") { intents.push({ op: "replace", file: rest[i + 1], text: textOf(rest[i + 2]) }); i += 2; }
      else if (a === "--row") { intents.push({ op: "row", file: rest[i + 1], id: rest[i + 2], text: textOf(rest[i + 3]) }); i += 3; }
      else if (a === "--insert") { intents.push({ op: "insert", file: rest[i + 1], where: rest[i + 2], id: rest[i + 3], text: textOf(rest[i + 4]) }); i += 4; }
      else if (a === "--status") {
        const it = { op: "status", id: rest[i + 1], state: rest[i + 2] }; i += 2;
        if (rest[i + 1] === "--note") { it.note = rest[i + 2]; i += 2; }
        intents.push(it);
      }
      else if (a === "--archive") { intents.push({ op: "archive", id: rest[i + 1] }); i += 1; }
      else if (a === "--refill") intents.push({ op: "refill" });
      else if (a === "--rebalance") intents.push({ op: "rebalance" });
      else if (a === "--swap") { intents.push({ op: "swap", file: rest[i + 1], old: textOf(rest[i + 2]), text: textOf(rest[i + 3]) }); i += 3; }
      else if (a === "--intents") { intents.push(...JSON.parse(readFileSync(rest[i + 1], "utf8"))); i += 1; }
      else if (a === "-m") { i += 1; }
      else if (a === "--dry-run") { /* below */ }
      else { console.error(`unknown argument ${a}`); usage(); }
    }
    try {
      const r = await write({ intents, message: opt("-m"), dryRun: rest.includes("--dry-run") });
      if (r.status === "unchanged") console.log(`nothing changed on coord @ ${r.tip.slice(0, 8)} — the intents were already true`);
      else if (r.status === "dry-run") console.log(`DRY RUN: would push ${r.commit.slice(0, 8)} onto coord @ ${r.tip.slice(0, 8)} changing ${r.changed.join(", ")}; ledger checks passed`);
      else console.log(`${r.status === "pushed" ? "PUSHED" : "PUSHED, NOT VERIFIED"} ${r.commit.slice(0, 8)} to ${REMOTE}/coord (was ${r.tip.slice(0, 8)}; ${r.attempts.length} attempt(s)) changing ${r.changed.join(", ")}`
        + (r.status === "pushed" ? " — read back from the remote" : ` — the remote answers ${r.onRemote || "nothing"}`));
    } catch (e) {
      if (!(e instanceof CoordError)) throw e;
      console.error(`REFUSED [${e.code}]: ${e.message}`);
      process.exit(1);
    }
  } else if (cmd === "checks") {
    freshen();
    const w = whereReads();
    /* The delegation register's git arm blames every affirming line (~35 s on 2026-09-22's CLAIMS.md, measured):
       opt-in, as plancheck's `--local` skips it. */
    const r = await ledgerChecks({ git: rest.includes("--git") });
    console.log(`reading the state from ${w.from}`);
    console.log(checksReport(r));
    process.exit(r.ok ? 0 : 1);
  } else if (cmd === "churn") {
    const c = churn({ ...(opt("--since") ? { since: opt("--since") } : {}), ...(opt("--until") ? { until: opt("--until") } : {}), ...(opt("--ref") ? { ref: opt("--ref") } : {}) });
    console.log(`churn on ${c.ref} @ ${(c.tip || "?").slice(0, 8)} since ${c.since}${c.until ? ` until ${c.until}` : ""}: ${c.nonMerge} non-merge commit(s), ${c.landings} landing(s) (first-parent)`);
    console.log(`| path | commits | leaves main |\n| --- | --- | --- |`);
    for (const r of c.rows.slice(0, 30)) console.log(`| \`${r.path}\` | ${r.n} | ${r.moves ? "yes" : "no"} |`);
    const k = c.klass;
    console.log(`landings touching ONLY state files (would not move main after the cutover): ${k.stateOnly}`);
    console.log(`  + state files and docs/DECIDED.md only (M0-99 already took DECIDED.md off main): ${k.stateOnlyWithDecided}`);
    console.log(`  + state, DECIDED.md and MILESTONES.md only (upper bound: the placement table leaves): ${k.stateOnlyWithMilestones}`);
    console.log(`landings touching state AND other files: ${k.touchedState}; touching no state file: ${k.noState}; empty: ${k.empty}`);
  } else if (cmd === "migrate") {
    try {
      const r = migrate({ from: opt("--from") || "HEAD", coordBranch: opt("--coord-branch"), mainBranch: opt("--main-branch") });
      console.log(`base   ${r.base}\ncoord  ${r.coord}   (root commit, ${r.moved.length} state file(s)${r.placement ? " + PLACEMENT.md" : ""})\nmain   ${r.main}   (pointer commit on base)`);
    } catch (e) {
      if (!(e instanceof CoordError)) throw e;
      console.error(`REFUSED [${e.code}]: ${e.message}`);
      process.exit(1);
    }
  } else if (cmd === "where") {
    const w = whereReads();
    console.log(`this tree is ${w.switched ? "SWITCHED" : "NOT switched"}; state is read from ${w.from}`);
  } else usage();
}

/* NOT a top-level await: the checks import `ledger.mjs`, which imports this module, and a module still awaiting its
   own evaluation cannot be imported — the cycle deadlocks (measured: exit 13, "unsettled top-level await"). */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  cli(process.argv.slice(2)).catch((e) => { console.error(e && e.stack || e); process.exit(1); });

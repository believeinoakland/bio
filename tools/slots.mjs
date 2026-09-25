#!/usr/bin/env node
/* slots — which cache slots are held with nobody working them, and what each one is owed.
 *
 * M0-191, enacting BOB #33's ruling of 2026-09-24 21:05Z (drained to `docs/archive/ledgers/BOB-INBOX-drained.md` on
 * coord; it supersedes his 18:30Z and 18:33Z entries) with his 21:17Z correction on the row. A port of BOB's prototype
 * `builder/slots.py` (the plan-page artifact's files). Design: `docs/development/VERIFICATION.md` (an instrument states
 * what it reads, never infers it) with `docs/development/WORK-PIPELINE.md` §1's cache states beside it.
 *
 * THE INCIDENT. At 21:03Z 7+ of 16 worker slots were held by rows marked `running` whose workers had finished,
 * blocked, or been counted by nobody, and a `queued` row waited with nobody spawning it. The cache counts ROWS; a
 * worker that goes quiet leaves its row `running`, and nothing woke a lane to look. This file is the look.
 *
 * WHY A PURE JUDGEMENT OVER WHAT WAS PRINTED — `tools/occupancy.mjs` is the precedent. Session state lives in the
 * HARNESS, which no suite can reach, so the judgement lives here, where a suite drives it from a fixture, and the ACT
 * (reading the listing, flipping a row, answering a worker, spawning one) stays with the lane. It never calls the
 * harness and never writes coord.
 *
 * ------------------------------------------------------------------------------------------------ THE SIGNAL
 *
 * `list_sessions`' `status_bucket` (BOB #33 21:05Z: *the signal is the status_bucket, not session status*), read for
 * the ONE worker session whose title is `WORKER <ID> (` with <ID> EQUAL to the row's id. The lists, per cache row:
 *
 *   FLIP CANDIDATE   running; its worker reads COMPLETED and `land/worker/<ID>` is PUSHED (read from the remote, not
 *                    from the session's own `current_branches`, which names a checkout, not a push). A CANDIDATE: the
 *                    lane confirms it from the worker's report before it flips (21:17Z). This tool never flips.
 *   ANSWER           running; its worker reads BLOCKED — it needs an answer. Its `status_detail` is printed.
 *   READ             running; its worker reads COMPLETED with NO pushed `land/worker/<ID>`, or FAILED (its last turn
 *                    errored), or a bucket this file does not know (named, never scored); or `queued` with a worker
 *                    already live on it. Each needs a lane to read the session before anything else.
 *   RESPAWN-OR-READ  running, and no live worker session — read its branch, then flip or respawn.
 *   SPAWN            queued, and no live worker session (none, or only COMPLETED / FAILED ones: the prototype's rule).
 *   WORKING          running; its worker reads WORKING or REVIEW_READY. **REVIEW_READY IS NOT FINISHED** (21:17Z): a
 *                    worker gating reads REVIEW_READY, so it counts as working and is tagged `gating`.
 *
 * Owed = FLIP CANDIDATE, ANSWER, READ, RESPAWN-OR-READ, SPAWN. Exit 1 when anything is owed; 3 when nothing is owed
 * for certain but something is UNDETERMINED (below); 0 when neither; 2 a usage error.
 *
 * ---------------------------------------------------------------------- THE VERDICT IS BOUNDED BY ITS INPUT
 *
 * - A PAGED LISTING cannot show absence. `list_sessions` keeps the most recently active rows and says `has_more`; a
 *   row with no session in a listing that has more pages may have its worker on the next page, and SPAWNING it would
 *   make a duplicate. So when the listing says `has_more: true`, or its row count equals the `--limit` the caller
 *   declares, every no-session verdict (SPAWN, RESPAWN-OR-READ) is moved to UNDETERMINED with that reason.
 * - A BRANCH NOT READ is not a branch absent: with no remote heads (`--no-heads`, or `git ls-remote` failed), a
 *   COMPLETED worker's row reads UNDETERMINED, never FLIP CANDIDATE and never READ.
 * - An ARCHIVED session holds nothing (`session_status` ARCHIVED, as the prototype reads it): it is counted, not used.
 * - TWO LIVE SESSIONS FOR ONE ID (a respawn): a WORKING or REVIEW_READY one wins, else the latest `updated_at`; the
 *   others are counted beside the row.
 *
 * WHAT IT CANNOT SEE, stated rather than left to be found:
 *   - A worker titled in any other form than `WORKER <ID> (` is not that row's worker. A live title beginning
 *     `WORKER ` that does not parse is printed under UNPARSED, never matched loosely: a loose match lets
 *     `WORKER D-49 (…)` satisfy D-492 (the row's negative control).
 *   - Rows run by a LANE, not a worker: a running `DIST-` row is DIST's own (the prototype's rule), listed and skipped.
 *   - Whether a COMPLETED worker's report was delivered, or its branch is the finished work: that is the lane's read.
 *   - One instant. Re-run before acting on it.
 *   - The open-slot figure (CACHE_ROWS from `tools/ledger.mjs` less every non-`integrated` row) is PRINTED, not owed:
 *     whether a refill has a runnable row to take is `ledger.mjs refill`'s judgement.
 *
 *   node tools/slots.mjs [--queue <file>] [--heads <file> | --no-heads] [--limit <n>] < listing
 *
 * stdin: `list_sessions`' output as saved — text wrapping JSON that starts at `{"ccr"` (the cloud's `{ccr:{data}}`
 * shape, measured 2026-09-24 by SCHEDULER #20 and again by this row's worker), that object bare, or a bare array of
 * sessions. `--queue` defaults to coord's QUEUE.md from the remote (`tools/coord.mjs readRemote`); `--heads` is
 * `git ls-remote --heads` output saved, and defaults to asking origin for `refs/heads/land/worker/*`.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/slots.control.mjs` from the repo root; the suite is
 * `bio-plane/test/slots.test.mjs`.
 */

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { queueRows, CACHE_ROWS, HELD_QUEUE_STATES } from "./ledger.mjs";
import { readRemote, ROOT } from "./coord.mjs";

export const EXIT = Object.freeze({ CLEAR: 0, OWED: 1, USAGE: 2, UNDETERMINED: 3 });
export const OWED_LISTS = ["flip", "answer", "read", "respawn", "spawn"];
const BUCKET_PREFIX = "SESSION_STATUS_BUCKET_";
const KNOWN = new Set(["WORKING", "REVIEW_READY", "COMPLETED", "BLOCKED", "FAILED"]);
const LIVE_WORK = new Set(["WORKING", "REVIEW_READY"]);

export class UsageError extends Error {
  constructor(message) { super(message); this.code = "SLOTS_USAGE"; }
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const str = (v) => (typeof v === "string" ? v : "");

/* The JSON value that begins at `start`, by a string-aware bracket walk: the saved text may carry prose after it. */
function valueAt(text, start) {
  const open = text[start], close = open === "{" ? "}" : "]";
  let depth = 0, inStr = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) { if (c === "\\") i++; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); }
        catch (e) { throw new UsageError(`the listing's JSON at offset ${start} does not parse: ${e.message}`); }
      }
    }
  }
  throw new UsageError(`the listing's JSON starting at offset ${start} never closes its '${open}…${close}'`);
}

/** The sessions a saved listing holds, and whether the listing says it is complete. */
export function parseListing(text) {
  const t = str(text);
  let v;
  const at = t.indexOf('{"ccr"');
  if (at >= 0) v = valueAt(t, at);
  else {
    const first = t.search(/[[{]/);
    if (first < 0) throw new UsageError("stdin holds no JSON: pass list_sessions' output as saved");
    v = valueAt(t, first);
  }
  if (Array.isArray(v)) return { sessions: v, hasMore: null };
  if (isObject(v) && isObject(v.ccr) && Array.isArray(v.ccr.data))
    return { sessions: v.ccr.data, hasMore: typeof v.ccr.has_more === "boolean" ? v.ccr.has_more : null };
  throw new UsageError("the listing is neither the cloud's {ccr:{data:[…]}} shape nor a bare array of sessions");
}

/** The cache's rows: `### <ID> · <state>` headings between `## THE CACHE` and the next `## ` heading. */
export function cacheRows(queueText) {
  const t = str(queueText);
  const at = t.search(/^## THE CACHE/m);
  if (at < 0) throw new UsageError("QUEUE.md has no '## THE CACHE' heading — not coord's QUEUE.md");
  const rest = t.slice(at).split("\n");
  let end = rest.findIndex((l, i) => i > 0 && /^## /.test(l));
  if (end < 0) end = rest.length;
  return queueRows(rest.slice(0, end).join("\n") + "\n").map((r) => ({ id: r.id, state: r.state }));
}

/** The pushed `land/worker/<ID>` ids in `git ls-remote --heads` output. */
export function pushedFrom(lsRemoteText) {
  const ids = new Set();
  for (const line of str(lsRemoteText).split("\n")) {
    const m = /^[0-9a-f]{7,64}\s+refs\/heads\/land\/worker\/(\S+)\s*$/.exec(line.trim());
    if (m) ids.add(m[1]);
  }
  return ids;
}

/** EXACT: `WORKER <ID> (`, the id a whole token. Anything else beginning `WORKER ` is unparsed, never guessed. */
export const TITLE_RE = /^WORKER (\S+) \(/;
export function workerIdOf(title) {
  const m = TITLE_RE.exec(str(title));
  return m ? m[1] : null;
}

const bucketOf = (s) => str(s.status_bucket).replace(BUCKET_PREFIX, "") || "(none)";
const archived = (s) => s.session_status === "SESSION_STATUS_ARCHIVED" || s.isArchived === true;
const detailOf = (s) => str(isObject(s.post_turn_summary) ? s.post_turn_summary.status_detail : "")
  || str(isObject(s.post_turn_summary) ? s.post_turn_summary.needs_action : "");

export function judge({ sessions, rows, pushed = null, hasMore = null, limit = null } = {}) {
  if (!Array.isArray(sessions)) throw new UsageError("sessions must be an array");
  if (!Array.isArray(rows)) throw new UsageError("rows must be an array of { id, state }");

  /* ---- the worker sessions, by the id their title names EXACTLY */
  const byId = new Map(), unparsed = [];
  let archivedCount = 0;
  for (const s of sessions.filter(isObject)) {
    const title = str(s.title);
    if (!title.startsWith("WORKER ")) continue;
    if (archived(s)) { archivedCount++; continue; }
    const id = workerIdOf(title);
    if (id === null) { unparsed.push({ title, session: str(s.id) }); continue; }
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push({ session: str(s.id), title, bucket: bucketOf(s), updated: str(s.updated_at), detail: detailOf(s) });
  }
  const workerFor = (id) => {
    const all = byId.get(id) || [];
    if (!all.length) return null;
    const live = all.filter((w) => LIVE_WORK.has(w.bucket));
    const pool = live.length ? live : all;
    const w = [...pool].sort((a, b) => (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0))[0];
    return { ...w, others: all.length - 1 };
  };

  const pageCut = hasMore === true || (Number.isInteger(limit) && sessions.length >= limit);
  const cutWhy = hasMore === true ? "the listing says has_more: a worker may be on a later page"
    : `the listing holds ${sessions.length} row(s), its declared --limit: a worker may be past it`;
  const out = { flip: [], answer: [], read: [], respawn: [], spawn: [], working: [], undetermined: [],
                lane: [], orphans: [], unparsed, archived: archivedCount, pageCut: pageCut ? cutWhy : null };
  const noSession = (list, entry) => (pageCut ? out.undetermined.push({ ...entry, owed: list, why: cutWhy }) : out[list].push(entry));

  const cacheIds = new Set(rows.map((r) => r.id));
  for (const { id, state } of rows) {
    const w = workerFor(id);
    if (state === "running") {
      if (id.startsWith("DIST-") && !w) { out.lane.push({ id, why: "a running DIST row is DIST's own, not a worker's" }); continue; }
      if (!w) { noSession("respawn", { id, why: "no live worker session: read its branch, then flip or respawn" }); continue; }
      const e = { id, session: w.session, bucket: w.bucket, others: w.others };
      if (w.bucket === "WORKING") out.working.push(e);
      else if (w.bucket === "REVIEW_READY") out.working.push({ ...e, gating: true });
      else if (w.bucket === "BLOCKED") out.answer.push({ ...e, why: w.detail || "(no status_detail in the listing)" });
      else if (w.bucket === "COMPLETED") {
        if (pushed === null) out.undetermined.push({ ...e, owed: "flip", why: "COMPLETED, and the remote's land/worker heads were not read" });
        else if (pushed.has(id)) out.flip.push({ ...e, why: `COMPLETED with land/worker/${id} pushed: confirm from its report, then flip` });
        else out.read.push({ ...e, why: `COMPLETED with NO land/worker/${id} on the remote: read the session` });
      }
      else if (w.bucket === "FAILED") out.read.push({ ...e, why: "FAILED: its last turn errored; read it, then answer or respawn" });
      else out.read.push({ ...e, why: `bucket ${w.bucket} is not one this tool knows: read the session` });
    } else if (state === "queued") {
      if (!w || w.bucket === "COMPLETED" || w.bucket === "FAILED") {
        noSession("spawn", { id, why: w ? `queued; its only worker reads ${w.bucket}` : "queued, and no worker session" });
      } else out.read.push({ id, session: w.session, bucket: w.bucket, others: w.others,
                             why: `queued, but a worker reading ${w.bucket} is live on it: the row or the worker is wrong` });
    }
  }
  for (const [id, all] of byId) if (!cacheIds.has(id))
    for (const w of all) out.orphans.push({ id, session: w.session, bucket: w.bucket });

  const slotRows = rows.filter((r) => !HELD_QUEUE_STATES.has(r.state)).length;
  out.slots = { cap: CACHE_ROWS, held: slotRows, open: CACHE_ROWS - slotRows };
  out.owed = OWED_LISTS.reduce((n, k) => n + out[k].length, 0);
  out.exit = out.owed ? EXIT.OWED : out.undetermined.length ? EXIT.UNDETERMINED : EXIT.CLEAR;
  return out;
}

export function render(r) {
  const lines = [];
  const line = (e) => `  ${e.id}${e.session ? `  ${e.session}` : ""}${e.bucket ? `  [${e.bucket}]` : ""}`
    + `${e.others ? `  (+${e.others} other session(s) under this id)` : ""}${e.why ? `  — ${e.why}` : ""}`;
  const block = (head, list) => { lines.push(`${head} (${list.length})`); for (const e of list) lines.push(line(e)); };
  block("FLIP CANDIDATE — the lane confirms by the worker's report; this tool never flips", r.flip);
  block("ANSWER — the worker is BLOCKED", r.answer);
  block("READ — read the session before anything else", r.read);
  block("RESPAWN-OR-READ — running, no live worker", r.respawn);
  block("SPAWN — queued, no live worker", r.spawn);
  if (r.undetermined.length) {
    lines.push(`UNDETERMINED (${r.undetermined.length}) — nothing is owed on these until what was not read is read`);
    for (const e of r.undetermined) lines.push(`${line(e)}  (would be ${e.owed.toUpperCase()})`);
  }
  lines.push(`WORKING ${r.working.length} (WORKING + REVIEW_READY; REVIEW_READY is gating, not finished): `
    + (r.working.map((e) => e.gating ? `${e.id}(gating)` : e.id).join(" ") || "none"));
  if (r.lane.length) lines.push(`NOT A WORKER ROW: ${r.lane.map((e) => e.id).join(" ")} — ${r.lane[0].why}`);
  if (r.orphans.length) lines.push(`WORKERS ON NO CACHE ROW (not owed; named): ${r.orphans.map((e) => `${e.id}[${e.bucket}]`).join(" ")}`);
  if (r.unparsed.length) lines.push(`UNPARSED WORKER TITLES (not matched to any row): ${r.unparsed.map((e) => JSON.stringify(e.title)).join(", ")}`);
  lines.push(`OPEN SLOTS ${r.slots.open} (CACHE_ROWS ${r.slots.cap}, ${r.slots.held} non-integrated row(s)) — printed, not owed`);
  lines.push(`archived worker sessions ignored: ${r.archived}`);
  lines.push(`OWED ${r.owed} · UNDETERMINED ${r.undetermined.length} · exit ${r.exit}`);
  return lines.join("\n");
}

/* ------------------------------------------------------------------------------------------------ the CLI */

function cli(argv) {
  let queueFile = null, headsFile = null, noHeads = false, limit = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--queue") queueFile = argv[++i];
    else if (a === "--heads") headsFile = argv[++i];
    else if (a === "--no-heads") noHeads = true;
    else if (a === "--limit") { limit = Number(argv[++i]); if (!Number.isInteger(limit) || limit < 1) throw new UsageError("--limit takes a positive integer"); }
    else throw new UsageError(`unknown argument '${a}'`);
  }
  if (queueFile === undefined || headsFile === undefined) throw new UsageError("--queue and --heads each take a file");
  const { sessions, hasMore } = parseListing(readFileSync(0, "utf8"));
  let queueText, queueFrom;
  if (queueFile) { queueText = readFileSync(queueFile, "utf8"); queueFrom = queueFile; }
  else {
    const r = readRemote("docs/development/QUEUE.md", { repo: ROOT });
    if (r.text === null) throw new UsageError("coord's QUEUE.md could not be read from the remote");
    queueText = r.text; queueFrom = `${r.ref} @ ${String(r.sha).slice(0, 8)}`;
  }
  let pushed = null, headsFrom = "not read (--no-heads)";
  if (headsFile) { pushed = pushedFrom(readFileSync(headsFile, "utf8")); headsFrom = headsFile; }
  else if (!noHeads) {
    const g = spawnSync("git", ["-C", ROOT, "ls-remote", "--heads", "origin", "refs/heads/land/worker/*"], { encoding: "utf8" });
    if (g.status === 0) { pushed = pushedFrom(g.stdout); headsFrom = "git ls-remote origin"; }
    else headsFrom = `NOT READ: git ls-remote exited ${g.status}`;
  }
  const rows = cacheRows(queueText);
  const r = judge({ sessions, rows, pushed, hasMore, limit });
  console.log(`slots — ${sessions.length} session(s) in the listing (has_more: ${hasMore}), ${rows.length} cache row(s) from ${queueFrom}, `
    + `land/worker heads: ${headsFrom}${pushed ? ` (${pushed.size})` : ""}`);
  if (r.pageCut) console.log(`LISTING INCOMPLETE: ${r.pageCut}`);
  console.log(render(r));
  return r.exit;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { process.exitCode = cli(process.argv.slice(2)); }
  catch (e) {
    if (e instanceof UsageError) { console.error(`slots: ${e.message}`); process.exitCode = EXIT.USAGE; }
    else throw e;
  }
}

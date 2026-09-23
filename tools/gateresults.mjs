#!/usr/bin/env node
/* gateresults.mjs — M0-126 (TREE-SHARING.md §3a): THE SHARED, PER-SUITE, CONTENT-ADDRESSED RESULT RECORD.
 *
 * WHY. A D-293 record is keyed by a whole TREE and lives in one clone: one changed file voids every suite's result, and
 * a lane's GREEN is invisible to the integrator. Here a result belongs to a UNIT and to the HASH OF ITS INPUTS, and it
 * lives on a branch every clone fetches, so a unit that passed anywhere on identical inputs runs nowhere again.
 *
 * THE KEY (`inputHash`): sha256 over a canonical text — the key version, the unit, node's MAJOR version, every
 * `package-lock.json` in the tree by (blob, path), and the unit's input set by (blob, path), sorted. The blob is git's
 * object id of the file's CURRENT content (the index's where the working file is unmodified, `git hash-object`
 * otherwise), so an uncommitted edit moves the key exactly as a committed one does. The input set is `tools/gates.mjs`'
 * to derive; this module only hashes what it is handed.
 *
 * THE RECORD. A PASS only. One file per key, `results/<unit dir>/<input hash>.json`, on the branch `gate-results` of
 * the results remote (`origin`, or `$BIO_GATE_RESULTS_REMOTE`). `<unit dir>` is the unit id with its first `:` made a
 * `/` (`plane:ledger.test.mjs` -> `plane/ledger.test.mjs`, `coverage` -> `coverage`). A write only ADDS files: it
 * commits on the fetched tip through a temporary index (never a checkout), skips any path the tip already holds, and
 * pushes WITHOUT force; a push rejected because the tip moved re-fetches and re-applies, as `coord.mjs write` does.
 * THE BRANCH IS CREATED BY THE FIRST WRITE: when the remote holds no `gate-results`, the first record is a ROOT commit
 * pushed to create it. Nothing here ever deletes a ref or a file: the cloud proxy refuses a ref deletion (HTTP 403,
 * which git prints as "Everything up-to-date", measured by M0-111), and the design never needs one.
 *
 * REVOCATION. A PASS that hid a real failure (a liar's record, or an honest one whose key missed an input) is REVOKED by
 * ADDING `revoked/<unit dir>/<input hash>.json` beside it — `node tools/gateresults.mjs revoke <unit> <hash> --reason
 * "<why>"` — and the reader honours it: a revoked key is never reused and its writer is named from the record. Revoking
 * is itself an append, so it too never needs a delete.
 *
 * HOW A LIAR PASSES IT, STATED: a record file written by hand (or by a gate whose unit never ran) under the right key is
 * indistinguishable from an honest one where it sits — the record proves a PROCEDURE, never an actor (§2's mark). What
 * bounds it is §3a's: the FULL run at each release cut and the GitHub run on `main` (`gates.mjs --full --no-reuse`)
 * re-run every unit, a false PASS then turns `main` red, and the key is revoked. `bio-plane/test/gateresults.test.mjs`
 * drives a hand-written record through `--no-reuse` to red, and its revocation to a re-run.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE_REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
export const RESULTS_BRANCH = "gate-results";
export const KEY_VERSION = 1;
export const GATE_VERSION = "M0-126.1";
export const resultsRemote = (env = process.env) => env.BIO_GATE_RESULTS_REMOTE || "origin";
/* The local ref a fetch leaves the remote's tip in. A remote given as a PATH or URL has no remote-tracking namespace,
   so it is kept under `refs/bio-gate-results/<sanitised>`. */
export const trackingRef = (remote) => (/^[\w.-]+$/.test(remote) ? `refs/remotes/${remote}/${RESULTS_BRANCH}`
  : `refs/bio-gate-results/${remote.replace(/[^\w.-]+/g, "_")}`);

const git = (repo, args, { input, env } = {}) => spawnSync("git", args, { cwd: repo, encoding: "utf8", input,
  maxBuffer: 1 << 28, env: env ? { ...process.env, ...env } : process.env });

export const unitDir = (unit) => String(unit).replace(":", "/");
export const resultPath = (unit, hash) => `results/${unitDir(unit)}/${hash}.json`;
export const revokedPath = (unit, hash) => `revoked/${unitDir(unit)}/${hash}.json`;
export const RECORD_PATH_RE = /^(?:results|revoked)\/[\w.@+/-]+\/[0-9a-f]{64}\.json$/;

/* ---- the blobs: every path's git object id for its CURRENT content ------------------------------------------ */
export function blobsOf({ repo = HERE_REPO, paths }) {
  const out = new Map();
  const idx = git(repo, ["ls-files", "-s", "-z"]);
  const index = new Map();
  for (const rec of String(idx.stdout || "").split("\0").filter(Boolean)) {
    const tab = rec.indexOf("\t");
    index.set(rec.slice(tab + 1), rec.slice(0, tab).split(" ")[1]);
  }
  const dirty = new Set(String(git(repo, ["diff", "--name-only", "-z", "--no-renames"]).stdout || "").split("\0").filter(Boolean));
  const need = [];
  for (const p of paths) {
    if (index.has(p) && !dirty.has(p)) out.set(p, index.get(p));
    else need.push(p);
  }
  if (need.length) {
    const h = git(repo, ["hash-object", "--no-filters", "--stdin-paths"], { input: need.join("\n") + "\n" });
    const ids = String(h.stdout || "").trim().split("\n");
    if (h.status !== 0 || ids.length !== need.length) throw new Error(`git hash-object failed (${String(h.stderr).trim().slice(0, 200)})`);
    need.forEach((p, i) => out.set(p, ids[i]));
  }
  return out;
}

/* ---- the key ----------------------------------------------------------------------------------------------- */
export function runtimeOf({ paths, blobs, node = process.versions.node }) {
  const locks = paths.filter((p) => basename(p) === "package-lock.json").sort().map((p) => [p, blobs.get(p)]);
  return { node: String(node).split(".")[0], locks };
}
export function keyText({ unit, inputs, blobs, runtime }) {
  const lines = [`bio-gate-key v${KEY_VERSION}`, `unit ${unit}`, `node ${runtime.node}`];
  for (const [p, b] of runtime.locks) lines.push(`lock ${b} ${p}`);
  for (const p of [...inputs].sort()) lines.push(`${blobs.get(p) || "MISSING"} ${p}`);
  return lines.join("\n") + "\n";
}
export const inputHash = (args) => createHash("sha256").update(keyText(args)).digest("hex");

/* ---- the reader -------------------------------------------------------------------------------------------- */
/* Fetch the results branch. { ok, tip|null, absent, reason }: `absent` is a remote that holds no branch yet (the first
   write creates it); a fetch that FAILED is not absent, and says why. */
export function fetchResults({ repo = HERE_REPO, remote = resultsRemote() } = {}) {
  const ref = trackingRef(remote);
  const f = git(repo, ["fetch", "-q", "--no-tags", remote, `+refs/heads/${RESULTS_BRANCH}:${ref}`]);
  if (f.status !== 0) {
    const why = String(f.stderr || "").trim().split("\n")[0];
    if (/couldn't find remote ref|could not find remote ref/i.test(why)) return { ok: true, tip: null, absent: true, ref };
    return { ok: false, tip: null, absent: false, reason: why || `git fetch exited ${f.status}`, ref };
  }
  const t = git(repo, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
  return { ok: true, tip: t.status === 0 ? t.stdout.trim() : null, absent: t.status !== 0, ref };
}
export function listPaths({ repo = HERE_REPO, tip }) {
  if (!tip) return new Set();
  const r = git(repo, ["ls-tree", "-r", "-z", "--name-only", tip]);
  return new Set(String(r.stdout || "").split("\0").filter(Boolean));
}
export function readBlobs({ repo = HERE_REPO, tip, paths }) {
  const out = new Map();
  if (!tip || !paths.length) return out;
  const r = git(repo, ["cat-file", "--batch"], { input: paths.map((p) => `${tip}:${p}`).join("\n") + "\n" });
  const buf = Buffer.from(r.stdout || "", "utf8");
  let at = 0;
  for (const p of paths) {
    const nl = buf.indexOf(10, at);
    if (nl < 0) break;
    const head = buf.slice(at, nl).toString();
    at = nl + 1;
    const m = /^[0-9a-f]+ blob (\d+)$/.exec(head);
    if (!m) continue;
    const n = Number(m[1]);
    out.set(p, buf.slice(at, at + n).toString());
    at += n + 1;
  }
  return out;
}
/* Look every key up. Returns Map unit -> { state: "PASS"|"REVOKED"|"NONE"|"UNREADABLE", record?, revoked? }. A record
   that does not parse, or names another unit, key or verdict, is UNREADABLE — never reused, and named. */
export function lookup({ repo = HERE_REPO, tip, keys }) {
  const have = listPaths({ repo, tip });
  const out = new Map();
  const want = [];
  for (const [unit, hash] of keys) {
    const rp = resultPath(unit, hash), vp = revokedPath(unit, hash);
    if (have.has(vp)) { out.set(unit, { state: "REVOKED", path: vp }); want.push(vp, ...(have.has(rp) ? [rp] : [])); continue; }
    if (!have.has(rp)) { out.set(unit, { state: "NONE" }); continue; }
    out.set(unit, { state: "PASS?", path: rp });
    want.push(rp);
  }
  const bodies = readBlobs({ repo, tip, paths: want });
  for (const [unit, hash] of keys) {
    const e = out.get(unit);
    if (e.state === "REVOKED") {
      try { e.revoked = JSON.parse(bodies.get(e.path)); } catch { e.revoked = null; }
      try { e.record = JSON.parse(bodies.get(resultPath(unit, hash))); } catch { e.record = null; }
      continue;
    }
    if (e.state !== "PASS?") continue;
    let rec = null;
    try { rec = JSON.parse(bodies.get(e.path)); } catch { /* unreadable */ }
    if (rec && rec.unit === unit && rec.inputHash === hash && rec.verdict === "PASS") { e.state = "PASS"; e.record = rec; }
    else { e.state = "UNREADABLE"; e.record = rec; }
  }
  return out;
}

/* ---- the writer -------------------------------------------------------------------------------------------- */
function identityEnv(repo) {
  const has = (k) => git(repo, ["config", "--get", k]).status === 0;
  if (has("user.email") && has("user.name")) return {};
  return { GIT_AUTHOR_NAME: "bio gate", GIT_AUTHOR_EMAIL: "gate@invalid", GIT_COMMITTER_NAME: "bio gate",
           GIT_COMMITTER_EMAIL: "gate@invalid" };
}
/* Append files ({ path, body }) to the results branch. Never overwrites: a path the tip already holds is SKIPPED and
   counted. Returns { status: "pushed"|"unchanged"|"failed", commit, added, skipped, attempts, created, reason }. */
export function appendRecords({ repo = HERE_REPO, remote = resultsRemote(), files, message, maxAttempts = 5 } = {}) {
  for (const f of files) if (!RECORD_PATH_RE.test(f.path)) return { status: "failed", reason: `not a record path: ${f.path}`, attempts: 0 };
  const scratch = mkdtempSync(join(tmpdir(), "bio-gate-results-"));
  const ienv = { ...identityEnv(repo), GIT_INDEX_FILE: join(scratch, "index") };
  let attempts = 0;
  try {
    const bodies = files.map((f, i) => { const p = join(scratch, `b${i}.json`); writeFileSync(p, f.body); return p; });
    const h = git(repo, ["hash-object", "-w", "--no-filters", "--stdin-paths"], { input: bodies.join("\n") + "\n" });
    const ids = String(h.stdout || "").trim().split("\n");
    if (h.status !== 0 || ids.length !== files.length) return { status: "failed", reason: "git hash-object -w failed", attempts };
    while (attempts < maxAttempts) {
      attempts++;
      const fr = fetchResults({ repo, remote });
      if (!fr.ok) return { status: "failed", reason: `the results branch could not be fetched (${fr.reason})`, attempts };
      const have = listPaths({ repo, tip: fr.tip });
      const add = files.map((f, i) => [f.path, ids[i]]).filter(([p]) => !have.has(p));
      const skipped = files.length - add.length;
      if (!add.length) return { status: "unchanged", tip: fr.tip, added: 0, skipped, attempts };
      rmSync(ienv.GIT_INDEX_FILE, { force: true });
      const rt = git(repo, fr.tip ? ["read-tree", fr.tip] : ["read-tree", "--empty"], { env: ienv });
      if (rt.status !== 0) return { status: "failed", reason: `git read-tree: ${String(rt.stderr).trim()}`, attempts };
      const ui = git(repo, ["update-index", "--add", "--index-info"], { env: ienv,
        input: add.map(([p, id]) => `100644 ${id}\t${p}`).join("\n") + "\n" });
      if (ui.status !== 0) return { status: "failed", reason: `git update-index: ${String(ui.stderr).trim()}`, attempts };
      const tree = git(repo, ["write-tree"], { env: ienv }).stdout.trim();
      const ct = git(repo, ["commit-tree", tree, ...(fr.tip ? ["-p", fr.tip] : []), "-F", "-"], { env: ienv, input: `${message}\n` });
      const commit = String(ct.stdout || "").trim();
      if (ct.status !== 0 || !commit) return { status: "failed", reason: `git commit-tree: ${String(ct.stderr).trim()}`, attempts };
      const p = git(repo, ["push", "--porcelain", remote, `${commit}:refs/heads/${RESULTS_BRANCH}`]);
      if (p.status === 0) {
        const ls = git(repo, ["ls-remote", "--heads", remote, RESULTS_BRANCH]);
        const onRemote = (String(ls.stdout || "").split(/\s/)[0] || "").trim();
        git(repo, ["update-ref", fr.ref, commit]);
        return { status: onRemote === commit ? "pushed" : "pushed-unverified", commit, onRemote, added: add.length, skipped,
                 attempts, created: !fr.tip };
      }
      const why = `${p.stdout || ""}${p.stderr || ""}`;
      if (!/non-fast-forward|fetch first|rejected|stale info|cannot lock ref/i.test(why))
        return { status: "failed", reason: `the push was refused, and not for a moved tip: ${why.trim().slice(0, 300)}`, attempts };
    }
    return { status: "failed", reason: `the results branch moved under ${maxAttempts} consecutive attempts`, attempts };
  } finally { rmSync(scratch, { recursive: true, force: true }); }
}

/* Revoke one key: add `revoked/<unit dir>/<hash>.json`, naming who wrote the PASS it revokes. */
export function revoke({ repo = HERE_REPO, remote = resultsRemote(), unit, hash, reason, by = null }) {
  if (!/^[0-9a-f]{64}$/.test(String(hash))) return { status: "failed", reason: "the input hash is 64 hex characters" };
  if (!reason) return { status: "failed", reason: "a revocation says why (--reason)" };
  const fr = fetchResults({ repo, remote });
  if (!fr.ok) return { status: "failed", reason: fr.reason };
  const found = lookup({ repo, tip: fr.tip, keys: [[unit, hash]] }).get(unit);
  const body = JSON.stringify({ unit, inputHash: hash, revoked: true, reason, by, at: new Date().toISOString(),
    record: found && found.record ? found.record : null, recordState: found ? found.state : "NONE" }, null, 1) + "\n";
  const r = appendRecords({ repo, remote, files: [{ path: revokedPath(unit, hash), body }],
    message: `gate-results: REVOKE ${unit} ${hash.slice(0, 12)} — ${reason}` });
  return { ...r, writer: found && found.record ? { run: found.record.run, clone: found.record.clone, session: found.record.session,
    head: found.record.head, tree: found.record.tree, at: found.record.at } : null, recordState: found ? found.state : "NONE" };
}

/* ---- CLI: `revoke <unit> <hash> --reason "<why>"` · `show <unit> <hash>` ------------------------------------ */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, unit, hash] = process.argv.slice(2);
  const ri = process.argv.indexOf("--reason");
  const reason = ri > 0 ? process.argv[ri + 1] : null;
  if (cmd === "revoke") {
    const r = revoke({ unit, hash, reason, by: process.env.CLAUDE_SESSION_ID || process.env.USER || null });
    console.log(JSON.stringify(r, null, 1));
    process.exit(r.status === "pushed" || r.status === "unchanged" ? 0 : 1);
  } else if (cmd === "show") {
    const fr = fetchResults({});
    if (!fr.ok) { console.log(`gate-results: could not fetch (${fr.reason})`); process.exit(1); }
    console.log(JSON.stringify(lookup({ tip: fr.tip, keys: [[unit, hash]] }).get(unit), null, 1));
  } else {
    console.log("usage: node tools/gateresults.mjs revoke <unit> <input hash> --reason \"<why>\" | show <unit> <input hash>");
    process.exit(2);
  }
}

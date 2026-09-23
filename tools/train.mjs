#!/usr/bin/env node
/**
 * train.mjs — M0-111: ONE LANE LANDS ON `main`, IN BATCHES (TREE-SHARING.md §2, ruled by Bob 2026-09-22).
 *
 *   node tools/train.mjs list                       what waits on origin: every `land/*` branch, WAITING or LANDED
 *   node tools/train.mjs run [options]              land every waiting branch in one train
 *       --full                                      gate FULL instead of the union's derived class
 *       --branch <ref>                              also land <ref> (e.g. origin/worktree-agent-x) — repeatable
 *       --drop <branch>                             leave a waiting branch out of this train — repeatable
 *       --isolate                                   on a RED union, gate each branch ALONE to name the red ones,
 *                                                   return them by name, and land the rest in one more train
 *       --no-push                                   merge and gate, push nothing (the record says so)
 *       --trailer "<line>"                          append a trailer line to every merge message — repeatable
 *
 * WHY: until this landed every lane landed on `main` itself, so `main` moved under every gate and each landing rebased
 * and re-gated (M-97: 41% of one day's gate runs measured a tree that never reached `main`). Now a lane pushes
 * `land/<lane>/<topic>` and stops; CONDUCT runs this on a cadence.
 *
 * WHAT A RUN DOES, IN ORDER — and each step is one the operator can read in the output:
 *   1. refuses a dirty tree or an unfinished merge; `git fetch origin`.
 *   2. lists `refs/remotes/origin/land/*`: a tip that is an ANCESTOR of `origin/main` is LANDED (prune by ancestry)
 *      and is never merged again; the rest are WAITING, taken oldest tip first.
 *   3. checks out a fresh integration branch `train/<id>` AT `origin/main` and merges each waiting tip (`--no-ff`, the
 *      SHA it listed, never the name, which can move). A merge that conflicts is ABORTED and RETURNED to its lane BY
 *      NAME with the conflicted paths; the rest go on.
 *   4. scans the tracked tree for merge markers (pushguard's own `markerCheck`); gates ONCE — `tools/gates.mjs`, which
 *      derives the union's class from the diff against `origin/main` — and reads the verdict back from the RECORD
 *      (D-293), never from the exit status alone. RED: nothing is pushed; with one branch it is returned by name, with
 *      several the culprit is UNDETERMINED and all are named (or `--isolate` finds it). NOT MEASURED: nothing is pushed.
 *      M0-122: a union whose TREE this clone's record already holds GREEN (a lone `land/*` branch that fast-forwards
 *      `origin/main` merges to exactly its own tip's tree) is NOT gated again; the train says so and names the record.
 *   5. writes the train record `<git common dir>/bio-train/<id>.json` (what landed, what was returned, the gate run),
 *      which with the trailer `Bio-Train: <id>` on every merge is the mark the push guard's `main` arm requires.
 *   6. pushes `HEAD:refs/heads/main` (never force) and verifies it FROM THE REMOTE (`git ls-remote`). M0-122: when the
 *      push is rejected because `main` MOVED (read by ancestry after a fetch), it retries, at most MAX_ATTEMPTS pushes
 *      in all, each stated: merge origin/main (a conflict is RETURNED by name), scan for markers, id audit, gate
 *      `--since <the GREEN tip>`, a train record `<id>-retry<n>`, push, verify from the remote.
 *   7. deletes each landed ref — only if the remote still holds the sha it merged — and VERIFIES each deletion from the
 *      remote. MEASURED 2026-09-23T00:01Z by the M0-111 worker in the cloud: the proxy refuses a ref deletion push
 *      (HTTP 403, "send-pack: unexpected disconnect", exit 1) and git STILL prints "Everything up-to-date", while
 *      `ls-remote` lists the ref unchanged. So a deletion is reported DELETED only when `ls-remote` no longer lists it
 *      — never from the exit status or git's words, and the suite's fixture holds the train to the stricter shape,
 *      a remote that exits 0 and keeps the ref — and otherwise NOT DELETED with git's own words. Nothing relies on
 *      the deletion: step 2's ancestry test is what keeps a landed ref out of every later train.
 *
 * THE LIMITS, STATED: the train proves a PROCEDURE, never an actor (see pushguard's `main` arm for how a liar passes);
 * one gate over N branches cannot say which one is red without `--isolate`, which costs one gate per branch; a branch
 * pushed to again after it listed is landed at the sha it listed, and its ref is kept; the train runs in THIS checkout
 * and leaves it on `train/<id>`.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";
import { markerCheck, readRuns, effectiveVerdict, trainDir, treeOf, TRAIN_TRAILER } from "./pushguard.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
export const LAND_PREFIX = "land/";
const REMOTE_LAND = "refs/remotes/origin/land/";

function gitR(repo, args) {
  const r = spawnSync("git", args, { cwd: repo, encoding: "utf8", maxBuffer: 1 << 28 });
  return { status: r.status, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
}
const git1 = (repo, args) => { const r = gitR(repo, args); return r.status === 0 ? r.out : null; };
const s8 = (x) => String(x || "").slice(0, 8);

/* `land/<lane>/<topic>` — the lane is what a returned branch is returned TO. */
export function laneOf(branch) {
  const m = /^land\/([^/]+)\/(.+)$/.exec(branch);
  return m ? m[1] : null;
}

/* Every `land/*` branch origin holds (as last fetched), classified by ANCESTRY against `origin/main`. */
export function listLand({ repo = REPO } = {}) {
  const raw = git1(repo, ["for-each-ref", "--format=%(refname) %(objectname) %(committerdate:unix)", REMOTE_LAND]) || "";
  const main = git1(repo, ["rev-parse", "--verify", "--quiet", "refs/remotes/origin/main"]);
  const rows = [];
  for (const line of raw.split("\n").filter(Boolean)) {
    const [ref, sha, when] = line.split(" ");
    const branch = ref.slice("refs/remotes/origin/".length);
    const landed = !!main && gitR(repo, ["merge-base", "--is-ancestor", sha, main]).status === 0;
    rows.push({ branch, sha, when: Number(when) || 0, lane: laneOf(branch), state: landed ? "LANDED" : laneOf(branch) ? "WAITING" : "MALFORMED" });
  }
  rows.sort((a, b) => a.when - b.when || a.branch.localeCompare(b.branch));
  return { main, rows };
}

function trainId(now = new Date()) {
  return `train-${now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")}-${process.pid}`;
}

function writeRecord(repo, rec) {
  const d = trainDir({ repo });
  mkdirSync(d, { recursive: true });
  const file = join(d, `${rec.id}.json`);
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(rec, null, 1) + "\n");
  renameSync(tmp, file);
  return file;
}

/* M0-122: A TREE ALREADY RECORDED GREEN IS NOT GATED A SECOND TIME. The D-293 record is keyed by the TREE, so when the
   union's tree is one a gate in this clone's git common dir already recorded GREEN — a lone `land/*` branch that is a
   fast-forward over `origin/main`, whose `--no-ff` merge carries exactly its tip's tree, is the common case — the
   verdict is read through pushguard's own `readRuns` + `effectiveVerdict` (the reader the guard's `main` arm uses) and
   the battery is NOT run again. RED, NOT MEASURED or no record: gated as before. With `--full`, only a tree that also
   carries a GREEN FULL run is reused. Returns null when the tree must be gated. */
function recordedGreen(repo, { full }) {
  const tree = treeOf("HEAD", { repo });
  const runs = readRuns({ repo, tree }).runs;
  if (effectiveVerdict(runs).verdict !== "GREEN") return null;
  const greens = runs.filter((r) => r.verdict === "GREEN" && (!full || r.class === "FULL"));
  const run = greens[greens.length - 1];
  if (!run) return null;
  return { tree, verdict: "GREEN", exit: null, class: run.class, file: run.file, recordsForTree: runs.length, reused: true };
}

/* Gate ONCE, and read the verdict back from the record keyed by the tree — never the exit status alone.
   `since` (M0-122, the retry): `gates.mjs --since <sha>` re-checks only what both sides touched, against <sha>'s
   GREEN record — never a FULL re-run of a union that was already measured. */
function gate(repo, { full, since, log }) {
  const tree = treeOf("HEAD", { repo });
  const reuse = recordedGreen(repo, { full });
  if (reuse) {
    log(`\n=== train · NO GATE RUN: tree ${s8(tree)} is already recorded GREEN (class ${reuse.class}, ${reuse.file}) — read from the D-293 record, not re-measured (M0-122)`);
    return reuse;
  }
  const args = full ? ["--full"] : since ? ["--since", since] : [];
  const before = readRuns({ repo, tree }).runs.length;
  log(`\n=== train · gate: node tools/gates.mjs${args.length ? ` ${args.join(" ")}` : ""} (tree ${s8(tree)})`);
  const r = spawnSync(process.execPath, [join(repo, "tools/gates.mjs"), ...args], { cwd: repo, stdio: "inherit" });
  const runs = readRuns({ repo, tree }).runs;
  const mine = runs.slice(before);
  const run = mine[mine.length - 1] || null;
  let verdict = run ? effectiveVerdict(runs).verdict : null;
  if (!run) verdict = "UNRECORDED";
  else if (verdict === "GREEN" && r.status !== 0) verdict = "RED";   /* exit and record disagree: never GREEN */
  return { tree, verdict, exit: r.status, class: run ? run.class : null, file: run ? run.file : null, recordsForTree: runs.length };
}

/* A merge is the only moment two branches' ids become one corpus (CONDUCT.md): the id audit runs on the union.
   Returns null when it passed or could not run (said in the log), else why it stopped. */
function idAudit(repo, base, log) {
  const mintid = join(repo, "tools/mintid.mjs");
  if (!existsSync(mintid)) { log("train: id audit NOT RUN — tools/mintid.mjs is absent from this tree"); return null; }
  const a = spawnSync(process.execPath, [mintid, "--audit", "--base", base], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 26 });
  const line = ((a.stdout || "").match(/^audit: \d+ break\(s\)[^\n]*/m) || [""])[0];
  log(`train: id audit — ${line || `no completion line (exit ${a.status})`}`);
  if (a.status !== 0 || !/^audit: 0 break/.test(line)) return `the id audit over the union did not pass (${line || `exit ${a.status}`})`;
  return null;
}

/* How many pushes of `main` a train makes when each is rejected because `main` MOVED under it (M0-122). */
export const MAX_ATTEMPTS = 3;

function mergeOne(repo, id, item, trailers) {
  const msg = [`train ${id}: land ${item.branch} @ ${s8(item.sha)}`, "",
    `${TRAIN_TRAILER}: ${id}`, ...trailers].join("\n");
  const r = gitR(repo, ["merge", "--no-ff", "-m", msg, item.sha]);
  if (r.status === 0) return { ok: true };
  const files = (git1(repo, ["diff", "--name-only", "--diff-filter=U"]) || "").split("\n").filter(Boolean);
  const ab = gitR(repo, ["merge", "--abort"]);
  return { ok: false, files, aborted: ab.status === 0, err: `${r.out}\n${r.err}`.trim().split("\n").slice(-3).join(" | ") };
}

/* Delete one landed ref and VERIFY it from the remote. Never claimed: DELETED only when ls-remote no longer lists it. */
export function deleteLanded({ repo = REPO, branch, sha }) {
  const ref = `refs/heads/${branch}`;
  const now = gitR(repo, ["ls-remote", "origin", ref]);
  if (now.status !== 0) return { branch, state: "NOT DELETED", why: `ls-remote failed before the delete (${now.err.split("\n").pop()})` };
  const held = (now.out.split(/\s+/)[0] || "");
  if (!held) return { branch, state: "ABSENT", why: "the remote no longer lists it" };
  if (held !== sha) return { branch, state: "KEPT", why: `it moved to ${s8(held)} after the train listed ${s8(sha)}` };
  const del = gitR(repo, ["push", "origin", "--delete", branch]);
  const after = gitR(repo, ["ls-remote", "origin", ref]);
  if (after.status === 0 && !after.out) return { branch, state: "DELETED", why: "verified: ls-remote no longer lists it" };
  const said = `${del.out}\n${del.err}`.trim().split("\n").filter(Boolean).slice(-2).join(" | ");
  return { branch, state: "NOT DELETED", why: `the remote still lists it after the delete (push exit ${del.status}: ${said || "no output"})` };
}

export function runTrain(opts = {}) {
  const repo = opts.repo || REPO;
  const log = opts.log || ((s) => console.log(s));
  const trailers = opts.trailers || [];
  const out = { id: opts.id || trainId(), landed: [], returned: [], deleted: [], pushed: false, gate: null, reason: null };

  const dirty = git1(repo, ["status", "--porcelain", "--untracked-files=normal"]);
  if (dirty === null || dirty !== "") return { ...out, reason: "REFUSED — the working tree is not clean; a train gates a CLEAN tree (D-293)" };
  if (existsSync(join(git1(repo, ["rev-parse", "--git-dir"]) || ".git", "MERGE_HEAD")))
    return { ...out, reason: "REFUSED — a merge is in progress in this checkout" };
  if (!opts.noFetch) {
    const f = gitR(repo, ["fetch", "-q", "origin"]);
    if (f.status !== 0) return { ...out, reason: `REFUSED — git fetch origin failed (${f.err.split("\n").pop()})` };
  }
  const { main, rows } = listLand({ repo });
  if (!main) return { ...out, reason: "REFUSED — no origin/main" };
  out.base = main;
  const drop = new Set(opts.drop || []);
  const waiting = rows.filter((r) => r.state === "WAITING" && !drop.has(r.branch));
  for (const r of rows.filter((x) => x.state === "MALFORMED"))
    out.returned.push({ branch: r.branch, sha: r.sha, lane: null, reason: "MALFORMED — not `land/<lane>/<topic>`, so no lane to land it for" });
  for (const b of opts.branches || []) {
    if (drop.has(b) || drop.has(b.replace(/^origin\//, ""))) continue;
    const sha = git1(repo, ["rev-parse", "--verify", "--quiet", `${b}^{commit}`]);
    if (!sha) { out.returned.push({ branch: b, sha: null, lane: null, reason: "UNRESOLVED — no such ref" }); continue; }
    if (gitR(repo, ["merge-base", "--is-ancestor", sha, main]).status === 0) { log(`train: ${b} @ ${s8(sha)} is already an ancestor of origin/main — LANDED`); continue; }
    waiting.push({ branch: b.replace(/^origin\//, ""), sha, lane: laneOf(b.replace(/^origin\//, "")), explicit: true });
  }
  const stale = rows.filter((r) => r.state === "LANDED");
  log(`train ${out.id}: origin/main ${s8(main)} · ${waiting.length} waiting · ${stale.length} landed ref(s) still listed${drop.size ? ` · dropped: ${[...drop].join(", ")}` : ""}`);
  for (const w of waiting) log(`train:   WAITING ${w.branch} @ ${s8(w.sha)}`);
  if (!waiting.length) { out.reason = "NOTHING TO LAND"; out.deleted = opts.noDelete ? [] : stale.map((s) => deleteLanded({ repo, ...s })); return out; }

  const co = gitR(repo, ["checkout", "-q", "-B", `train/${out.id}`, main]);
  if (co.status !== 0) return { ...out, reason: `REFUSED — could not cut train/${out.id} at origin/main (${co.err.split("\n").pop()})` };
  const merged = [];
  for (const w of waiting) {
    const m = mergeOne(repo, out.id, w, trailers);
    if (m.ok) { merged.push(w); log(`train:   merged ${w.branch} @ ${s8(w.sha)}`); continue; }
    out.returned.push({ branch: w.branch, sha: w.sha, lane: w.lane, reason: `CONFLICT in ${m.files.join(", ") || "(git named no file)"}${m.aborted ? "" : " — AND THE ABORT FAILED"}` });
    log(`train:   RETURNED ${w.branch} @ ${s8(w.sha)} — CONFLICT in ${m.files.join(", ")}`);
    if (!m.aborted) return { ...out, reason: "STOPPED — a conflicting merge could not be aborted; the checkout needs a human" };
  }
  if (!merged.length) { out.reason = "NOTHING LANDED — every waiting branch was returned"; return out; }
  const mk = markerCheck({ repo });
  if (!mk.ok) return { ...out, reason: `STOPPED — ${mk.message} ${mk.marked.slice(0, 5).join(", ")}` };
  const audit = idAudit(repo, main, log);
  if (audit) return { ...out, reason: `STOPPED — ${audit}; nothing gated or pushed` };

  const g = gate(repo, { full: !!opts.full, log });
  out.gate = g;
  if (g.verdict !== "GREEN") {
    if (g.verdict === "RED" && merged.length === 1) {
      out.returned.push({ branch: merged[0].branch, sha: merged[0].sha, lane: merged[0].lane, reason: `RED — the gate failed (class ${g.class}, record ${g.file})` });
      out.reason = "RED — nothing pushed; the one branch is returned by name";
      return out;
    }
    if (g.verdict === "RED" && opts.isolate) {
      log(`train: RED over ${merged.length} branches — isolating each on origin/main (one gate per branch)`);
      const reds = [];
      for (const w of merged) {
        gitR(repo, ["checkout", "-q", "-B", `train/${out.id}-alone`, main]);
        const m = mergeOne(repo, `${out.id}-alone`, w, trailers);
        const alone = m.ok ? gate(repo, { full: !!opts.full, log }) : { verdict: "CONFLICT" };
        log(`train:   ${w.branch} alone: ${alone.verdict}`);
        if (alone.verdict !== "GREEN") { reds.push(w.branch); out.returned.push({ branch: w.branch, sha: w.sha, lane: w.lane, reason: `RED ALONE on origin/main (${alone.verdict}${alone.file ? `, record ${alone.file}` : ""})` }); }
      }
      if (!reds.length) { out.reason = "RED TOGETHER, GREEN ALONE — the branches fail where they MEET; UNDETERMINED which to return, nothing pushed"; out.suspects = merged.map((w) => w.branch); return out; }
      const next = runTrain({ ...opts, id: `${out.id}-r`, noFetch: true, isolate: false, drop: [...drop, ...reds, ...out.returned.map((r) => r.branch)] });
      return { ...next, returned: [...out.returned, ...next.returned], isolatedFrom: out.id };
    }
    out.suspects = merged.map((w) => w.branch);
    out.reason = g.verdict === "RED"
      ? `RED over ${merged.length} branches — UNDETERMINED which; nothing pushed. Re-run with --isolate, or --drop a suspect: ${out.suspects.join(", ")}`
      : `${g.verdict} — nothing pushed; the gate measured nothing it could land on (M0-107)`;
    return out;
  }

  const landedRows = merged.map((w) => ({ branch: w.branch, sha: w.sha, lane: w.lane }));
  let head = git1(repo, ["rev-parse", "HEAD"]);
  let rec = { v: 1, id: out.id, head, tree: g.tree, base: main, at: new Date().toISOString(),
    landed: landedRows, returned: out.returned,
    gate: { verdict: g.verdict, class: g.class, file: g.file, ...(g.reused ? { reused: true } : {}) }, pushed: false };
  out.record = writeRecord(repo, rec);
  if (opts.noPush) { out.reason = "GATED GREEN, NOT PUSHED (--no-push)"; out.landed = rec.landed; return out; }

  /* M0-122: A PUSH REJECTED BECAUSE `main` MOVED UNDER THE GATE IS RETRIED, BOUNDED BY MAX_ATTEMPTS PUSHES. Each retry
     merges the new `origin/main` into this train branch (a conflict returns the branches that touch the conflicted
     paths, by name), scans for markers, re-runs the id audit, re-gates with `gates.mjs --since <the GREEN tip>` —
     never a FULL re-run — writes a train record of its own (`<id>-retry<n>`, the trailer the retry's merge carries,
     so the guard's `main` arm reads THAT record), and pushes again, verified from the remote. "main moved" is read by
     ANCESTRY after a fetch — the new `origin/main` descends from the train's base and is not already in HEAD — never
     from git's words; any other rejection is a PUSH FAILED, as before. */
  out.attempts = [];
  let base = main, greenTip = head, gNow = g;
  for (let attempt = 1; ; attempt++) {
    const p = gitR(repo, ["push", "origin", "HEAD:refs/heads/main"]);
    const remoteMain = (gitR(repo, ["ls-remote", "origin", "refs/heads/main"]).out.split(/\s+/)[0]) || "";
    out.pushOutput = `${p.out}\n${p.err}`.trim();
    for (const l of out.pushOutput.split("\n").filter((x) => /bio-pushguard|PUSH REFUSED|rejected/.test(x))) log(`train: push — ${l.trim()}`);
    const landedNow = p.status === 0 && remoteMain === head;
    out.attempts.push({ attempt, id: rec.id, head, base, gate: { verdict: gNow.verdict, class: gNow.class, reused: !!gNow.reused }, pushed: landedNow });
    log(`train: attempt ${attempt}/${MAX_ATTEMPTS} — push of ${s8(head)} ${landedNow ? "LANDED, verified on the remote" : `REJECTED (push exit ${p.status}; the remote's main reads ${s8(remoteMain)})`}`);
    if (landedNow) break;
    const failed = (why) => ({ ...out, reason: `PUSH FAILED — ${why}; main on the remote reads ${s8(remoteMain)}, not ${s8(head)} (push exit ${p.status}); nothing landed`, landed: [] });
    const f = gitR(repo, ["fetch", "-q", "origin"]);
    const now = git1(repo, ["rev-parse", "--verify", "--quiet", "refs/remotes/origin/main"]);
    if (f.status !== 0 || !now) return failed("the fetch after the rejection failed, so whether main moved is UNDETERMINED");
    const moved = now !== base && gitR(repo, ["merge-base", "--is-ancestor", base, now]).status === 0
      && gitR(repo, ["merge-base", "--is-ancestor", now, "HEAD"]).status !== 0;
    if (!moved) return failed(now === base ? "main did not move, so the rejection was not a non-fast-forward" : `origin/main ${s8(now)} does not descend from the train's base ${s8(base)}`);
    if (attempt >= MAX_ATTEMPTS) return failed(`main moved under the train before each of its ${MAX_ATTEMPTS} pushes (now ${s8(now)}); the retry bound is spent`);

    const rid = `${out.id}-retry${attempt}`;
    log(`\ntrain: RETRY ${attempt}/${MAX_ATTEMPTS - 1} — main moved ${s8(base)} -> ${s8(now)} under the train; merging origin/main into ${s8(head)} as ${rid}`);
    const msg = [`train ${rid}: RETRY ${attempt} of ${out.id} after a non-fast-forward — merge origin/main ${s8(now)} into its GREEN tip ${s8(head)}`, "",
      `${TRAIN_TRAILER}: ${rid}`, ...trailers].join("\n");
    const mr = gitR(repo, ["merge", "--no-ff", "-m", msg, now]);
    if (mr.status !== 0) {
      const files = (git1(repo, ["diff", "--name-only", "--diff-filter=U"]) || "").split("\n").filter(Boolean);
      const aborted = gitR(repo, ["merge", "--abort"]).status === 0;
      const hit = merged.filter((w) => (git1(repo, ["diff", "--name-only", main, w.sha]) || "").split("\n").some((x) => files.includes(x)));
      for (const w of hit.length ? hit : merged)
        out.returned.push({ branch: w.branch, sha: w.sha, lane: w.lane, reason: `CONFLICT with main as it moved to ${s8(now)} (retry ${attempt}) in ${files.join(", ") || "(git named no file)"}${hit.length ? "" : " — UNDETERMINED which branch, so all are named"}${aborted ? "" : " — AND THE ABORT FAILED"}` });
      log(`train:   retry ${attempt}: CONFLICT merging origin/main ${s8(now)} in ${files.join(", ")}`);
      return { ...out, landed: [], reason: aborted ? `RETURNED — retry ${attempt}: merging origin/main ${s8(now)} conflicts; nothing pushed` : "STOPPED — a conflicting merge could not be aborted; the checkout needs a human" };
    }
    const mk2 = markerCheck({ repo });
    if (!mk2.ok) return { ...out, landed: [], reason: `STOPPED — retry ${attempt}: ${mk2.message} ${mk2.marked.slice(0, 5).join(", ")}` };
    const audit2 = idAudit(repo, now, log);
    if (audit2) return { ...out, landed: [], reason: `STOPPED — retry ${attempt}: ${audit2}; nothing pushed` };
    gNow = gate(repo, { full: !!opts.full, since: greenTip, log });
    out.gate = gNow;
    if (gNow.verdict !== "GREEN") {
      out.suspects = merged.map((w) => w.branch);
      return { ...out, landed: [], reason: `${gNow.verdict} — retry ${attempt}: the --since gate over origin/main ${s8(now)} merged in did not pass; nothing pushed; UNDETERMINED which of ${out.suspects.join(", ")}` };
    }
    writeRecord(repo, { ...rec, retriedAs: rid });
    const sinceTip = greenTip;
    head = git1(repo, ["rev-parse", "HEAD"]);
    base = now; greenTip = head;
    rec = { v: 1, id: rid, retryOf: out.id, attempt: attempt + 1, head, tree: gNow.tree, base: now, at: new Date().toISOString(),
      landed: landedRows, returned: out.returned,
      gate: { verdict: gNow.verdict, class: gNow.class, file: gNow.file, since: sinceTip, ...(gNow.reused ? { reused: true } : {}) }, pushed: false };
    out.record = writeRecord(repo, rec);
  }
  out.pushed = true; out.head = head; out.landed = rec.landed;
  writeRecord(repo, { ...rec, pushed: true, pushedAt: new Date().toISOString() });
  gitR(repo, ["fetch", "-q", "origin"]);
  if (!opts.noDelete) {
    const targets = [...merged.map((w) => ({ branch: w.branch, sha: w.sha })), ...stale.map((s) => ({ branch: s.branch, sha: s.sha }))];
    out.deleted = targets.map((t) => deleteLanded({ repo, ...t }));
  }
  out.reason = "LANDED";
  return out;
}

function report(r) {
  const L = [];
  for (const x of r.returned) L.push(`train: RETURNED ${x.branch}${x.sha ? ` @ ${s8(x.sha)}` : ""}${x.lane ? ` to lane ${x.lane}` : ""} — ${x.reason}`);
  for (const d of r.deleted || []) L.push(`train: ref ${d.branch}: ${d.state} — ${d.why}`);
  const nd = (r.deleted || []).filter((d) => d.state === "NOT DELETED").length;
  L.push(`train: ${r.reason} · id ${r.id} · landed ${r.landed.length}${r.landed.length ? ` (${r.landed.map((l) => l.branch).join(", ")})` : ""}`
    + ` · returned ${r.returned.length} · gate ${r.gate ? `${r.gate.verdict} class ${r.gate.class}` : "not run"}`
    + `${(r.attempts || []).length > 1 ? ` · ${r.attempts.length} push attempts (main moved under the train)` : ""}`
    + `${r.gate && r.gate.reused ? " · no gate run (the tree was already recorded GREEN)" : ""}`
    + `${r.pushed ? ` · main ${s8(r.head)} verified on the remote` : " · main NOT moved"}`
    + `${(r.deleted || []).length ? ` · refs deleted ${(r.deleted || []).filter((d) => d.state === "DELETED").length}/${r.deleted.length}${nd ? ` (${nd} NOT DELETED — landed by ancestry, harmless)` : ""}` : ""}`);
  return L.join("\n");
}

const IS_CLI = process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
if (IS_CLI) {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const many = (flag) => argv.flatMap((a, i) => (a === flag && argv[i + 1] ? [argv[i + 1]] : []));
  if (cmd === "list") {
    const f = gitR(REPO, ["fetch", "-q", "origin"]);
    if (f.status !== 0) console.log(`train: git fetch failed — listing the last fetch (${f.err.split("\n").pop()})`);
    const { main, rows } = listLand();
    console.log(`train: origin/main ${s8(main)} · ${rows.length} land/* ref(s)`);
    for (const r of rows) console.log(`train:   ${r.state.padEnd(9)} ${r.branch} @ ${s8(r.sha)}${r.lane ? ` (lane ${r.lane})` : ""}`);
    process.exit(0);
  } else if (cmd === "run") {
    const r = runTrain({ full: argv.includes("--full"), isolate: argv.includes("--isolate"), noPush: argv.includes("--no-push"),
      branches: many("--branch"), drop: many("--drop"), trailers: many("--trailer") });
    console.log("\n" + report(r));
    process.exit(r.reason === "LANDED" || r.reason === "NOTHING TO LAND" || /^GATED GREEN/.test(r.reason) ? 0 : 1);
  } else {
    console.log("usage: node tools/train.mjs list | run [--full] [--isolate] [--no-push] [--branch <ref>]... [--drop <branch>]... [--trailer \"<line>\"]...");
    process.exit(2);
  }
}

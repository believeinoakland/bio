#!/usr/bin/env node
/* M0-191's NEGATIVE CONTROL DRIVER — twelve arms plus a baseline — over `tools/slots.mjs` and the suite that drives
 * it, `bio-plane/test/slots.test.mjs`.
 *
 *   node bio-plane/test/slots.control.mjs          (from the repo root: the baseline, then every arm)
 *   node bio-plane/test/slots.control.mjs A2       (the baseline, then one arm)
 *
 * Every arm is armed ALONE from the pristine subject, held in memory before anything is armed; each DECLARES before
 * arming the assertion that MUST fail and one that MUST NOT; every anchor is counted (exactly once) before anything
 * arms; every restore is verified by sha256 against the pristine digest AND by byte comparison against the arm's own
 * uniquely-named copy, with the byte count printed and floored. The pen is a `mkdtemp` directory under the OS temp
 * root, OUTSIDE the worktree (BOB #32, 2026-09-24), removed file by file by name — nothing here lists a directory.
 * An exit hook restores the subject from memory on every exit.
 *
 * THE ARMS, each with what MUST fail / what MUST NOT, declared before arming:
 *   A1   titles matched LOOSELY (the row's own control)   -> "D-492 is RESPAWN-OR-READ, failing by name" / "UI-99 is ANSWER"
 *   A2   session_status read in place of the bucket (21:05Z's control) -> "the seven FLIP candidates are named" / "D-492 is RESPAWN…"
 *   A3   REVIEW_READY read as finished (the superseded 21:05Z reading) -> "REC-194 (REVIEW_READY) is not a FLIP candidate" / "D-516 is SPAWN"
 *   A4   the pushed branch not required -> "COMPLETED with no pushed branch is READ, not FLIP" / "UI-99 is ANSWER"
 *   A5   heads NOT READ believed as pushed -> "with the heads NOT READ, COMPLETED is UNDETERMINED…" / "the seven FLIP…"
 *   A6   a paged listing believed -> "has_more moves RESPAWN and SPAWN to UNDETERMINED" / "the seven FLIP…"
 *   A7   OVER-STRICTNESS, every listing read as paged -> "OVER-STRICTNESS: a complete listing names them" / "the seven FLIP…"
 *   A8   an archive not honoured -> "an ARCHIVED worker holds nothing: A-1 is RESPAWN-OR-READ" / "the seven FLIP…"
 *   A9   OVER-STRICTNESS, the title tied to one spawning lane -> "a worker spawned by another lane still matches its row" / "the seven FLIP…"
 *   A10  BLOCKED's status_detail dropped -> "UI-99's status_detail is carried" / "UI-99 is ANSWER"
 *   A11  has_more not read -> "has_more is read" / "a bare array reads, completeness unknown"
 *   A12  the bracket walk not string-aware -> "a brace inside a string does not end the value" / "a bare array reads, completeness unknown"
 *
 * RESULTS: recorded in `bio-plane/test/slots.test.mjs`'s NEGATIVE CONTROL line (12 of 12 as declared, 2026-09-24, with
 * the three findings the first run made about the suite and the arms) and in the M0-191 report.
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync, rmdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { anchorTable } from "../scripts/anchortable.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SUBJECT = join(REPO, "tools/slots.mjs");
const SUITE = join(REPO, "bio-plane/test/slots.test.mjs");
const MIN_BYTES = 8000;
const sha = (b) => createHash("sha256").update(b).digest("hex");

const PRISTINE = readFileSync(SUBJECT);
const PRISTINE_SHA = sha(PRISTINE);
if (PRISTINE.length < MIN_BYTES) { console.error(`subject is ${PRISTINE.length} bytes, under the ${MIN_BYTES} floor: not the subject`); process.exit(2); }
const PEN = mkdtempSync(join(tmpdir(), "m0191-control-"));
const penFiles = [];
process.on("exit", () => {
  if (sha(readFileSync(SUBJECT)) !== PRISTINE_SHA) writeFileSync(SUBJECT, PRISTINE);
  for (const f of penFiles) rmSync(f, { force: true });
  try { rmdirSync(PEN); } catch (e) { console.log(`pen ${PEN} left standing: ${e.code}`); }
});
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => process.exit(130));

const ARMS = {
  A1: { what: "titles matched LOOSELY (a row id that STARTS WITH a worker's id)",
        from: "const all = byId.get(id) || [];",
        to: "const all = [...byId].filter(([k]) => id.startsWith(k)).flatMap(([, v]) => v);",
        fail: "D-492 is RESPAWN-OR-READ, failing by name", hold: "UI-99 is ANSWER" },
  A2: { what: "session_status read in place of status_bucket",
        from: 'const bucketOf = (s) => str(s.status_bucket).replace(BUCKET_PREFIX, "") || "(none)";',
        to: 'const bucketOf = (s) => str(s.session_status).replace("SESSION_STATUS_", "") || "(none)";',
        fail: "the seven FLIP candidates are named, by name", hold: "D-492 is RESPAWN-OR-READ, failing by name" },
  A3: { what: "REVIEW_READY read as finished",
        from: 'else if (w.bucket === "REVIEW_READY") out.working.push({ ...e, gating: true });',
        to: 'else if (w.bucket === "REVIEW_READY") out.flip.push({ ...e, why: "finished" });',
        fail: "REC-194 (REVIEW_READY) is not a FLIP candidate", hold: "D-516 is SPAWN" },
  A4: { what: "the pushed branch not required",
        from: "else if (pushed.has(id)) out.flip.push(",
        to: "else if (true) out.flip.push(",
        fail: "COMPLETED with no pushed branch is READ, not FLIP", hold: "UI-99 is ANSWER" },
  A5: { what: "heads NOT READ believed as pushed",
        from: 'if (pushed === null) out.undetermined.push({ ...e, owed: "flip",',
        to: 'if (pushed === null) out.flip.push({ ...e, owed: "flip",',
        fail: "with the heads NOT READ, COMPLETED is UNDETERMINED, never a candidate", hold: "the seven FLIP candidates are named, by name" },
  A6: { what: "a paged listing believed",
        from: "const pageCut = hasMore === true ||",
        to: "const pageCut = false && hasMore === true ||",
        fail: "has_more moves RESPAWN and SPAWN to UNDETERMINED", hold: "the seven FLIP candidates are named, by name" },
  A7: { what: "OVER-STRICTNESS: every listing read as paged",
        from: "const pageCut = hasMore === true ||",
        to: "const pageCut = true || hasMore === true ||",
        fail: "OVER-STRICTNESS: a complete listing names them", hold: "the seven FLIP candidates are named, by name" },
  A8: { what: "an archive not honoured",
        from: "if (archived(s)) { archivedCount++; continue; }",
        to: "if (false) { archivedCount++; continue; }",
        fail: "an ARCHIVED worker holds nothing: A-1 is RESPAWN-OR-READ", hold: "the seven FLIP candidates are named, by name" },
  A9: { what: "OVER-STRICTNESS: the title tied to the CONDUCT lane's parenthesis",
        from: "export const TITLE_RE = /^WORKER (\\S+) \\(/;",
        to: "export const TITLE_RE = /^WORKER (\\S+) \\(CONDUCT /;",
        fail: "a worker spawned by another lane still matches its row", hold: "the seven FLIP candidates are named, by name" },
  A10: { what: "BLOCKED's status_detail dropped",
        from: 'out.answer.push({ ...e, why: w.detail || "(no status_detail in the listing)" });',
        to: 'out.answer.push({ ...e, why: "(no status_detail in the listing)" });',
        fail: "UI-99's status_detail is carried", hold: "UI-99 is ANSWER" },
  A11: { what: "has_more not read",
        from: 'hasMore: typeof v.ccr.has_more === "boolean" ? v.ccr.has_more : null };',
        to: "hasMore: null };",
        fail: "has_more is read", hold: "a bare array reads, completeness unknown" },
  A12: { what: "the bracket walk not string-aware",
        from: "if (c === '\"') inStr = true;",
        to: "if (false) inStr = true;",
        fail: "a brace inside a string does not end the value", hold: "a bare array reads, completeness unknown" },
};
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).map(([arm, a]) => ({ arm, file: SUBJECT, find: a.from, put: a.to })));

/* preflight: every anchor exactly once in the pristine subject, before anything arms */
const text = PRISTINE.toString("utf8");
for (const [k, a] of Object.entries(ARMS)) {
  const n = text.split(a.from).length - 1;
  if (n !== 1) { console.error(`PREFLIGHT ${k}: anchor occurs ${n} time(s), not once — the arm would not arm`); process.exit(2); }
}

function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8" });
  const out = r.stdout || "";
  const passed = new Set(), failed = new Set();
  for (const m of out.matchAll(/^  (PASS|FAIL)  (.+)$/gm)) (m[1] === "PASS" ? passed : failed).add(m[2]);
  const tally = /^slots: (\d+) pass \/ (\d+) fail · sections (\d+)\/(\d+)$/m.exec(out);
  return { status: r.status, passed, failed, tally: tally ? `${tally[1]} / ${tally[2]} (sections ${tally[3]}/${tally[4]})` : "-1 (no tally: the suite did not reach its foot)" };
}

let ok = 0, bad = 0;
const base = runSuite();
console.log(`BASELINE  exit ${base.status}  ${base.tally}`);
if (base.status !== 0 || base.failed.size) { console.error("the baseline is not green: no arm means anything"); process.exit(2); }

const only = process.argv[2];
for (const [k, a] of Object.entries(ARMS)) {
  if (only && only !== k) continue;
  const copy = join(PEN, `${k}.pristine.mjs`);
  writeFileSync(copy, PRISTINE); penFiles.push(copy);
  writeFileSync(SUBJECT, text.replace(a.from, a.to));
  const armedSha = sha(readFileSync(SUBJECT));
  const r = runSuite();
  writeFileSync(SUBJECT, readFileSync(copy));
  const back = readFileSync(SUBJECT);
  const restored = sha(back) === PRISTINE_SHA && Buffer.compare(back, readFileSync(copy)) === 0 && back.length >= MIN_BYTES;
  const failedAsDeclared = r.failed.has(a.fail);
  const heldAsDeclared = r.passed.has(a.hold);
  const armed = armedSha !== PRISTINE_SHA;
  const good = armed && failedAsDeclared && heldAsDeclared && restored && r.status !== 0;
  good ? ok++ : bad++;
  console.log(`${good ? "OK  " : "BAD "} ${k}  ${a.what}\n       armed ${armed} · exit ${r.status} · ${r.tally}`
    + `\n       MUST FAIL "${a.fail}": ${failedAsDeclared ? "failed" : "DID NOT FAIL"}`
    + `\n       MUST HOLD "${a.hold}": ${heldAsDeclared ? "held" : "DID NOT HOLD"}`
    + `\n       failed: ${[...r.failed].map((s) => JSON.stringify(s)).join(", ") || "(none)"}`
    + `\n       restored ${restored} · ${back.length} bytes · sha256 ${sha(back).slice(0, 12)}…`);
  rmSync(copy); penFiles.splice(penFiles.indexOf(copy), 1);
}
const close = runSuite();
console.log(`CLOSING   exit ${close.status}  ${close.tally} · subject sha256 ${sha(readFileSync(SUBJECT)).slice(0, 12)}… (pristine ${PRISTINE_SHA.slice(0, 12)}…)`);
console.log(`CONTROL: ${ok} arm(s) as declared, ${bad} not`);
process.exit(bad || close.status !== 0 ? 1 : 0);

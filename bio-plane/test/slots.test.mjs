/* slots — M0-191 driven: which cache slots are held with nobody working them. `tools/slots.mjs`, enacting BOB #33's
 * ruling of 2026-09-24 21:05Z with his 21:17Z correction (the row on coord's QUEUE.md). Its row grammar is
 * `tools/ledger.mjs`'s `queueRows`, imported, so this suite names that file for the gate's TARGETED class to find.
 *
 * WHAT THIS SUITE DEFENDS AGAINST, both directions, because each cheap way to make a slot probe green is a real harm:
 *   - NAME TOO LITTLE — read session status instead of the bucket (the seven FLIPs vanish), match titles loosely (a
 *     `WORKER D-49` session satisfies D-492 and the idle row hides), or believe a paged listing (a no-session verdict
 *     over a listing with more pages).
 *   - NAME TOO MUCH — read REVIEW_READY as finished (a gating worker's row flipped under it, 21:17Z), print a flip where
 *     only a candidate is known (no pushed branch, or heads not read), or SPAWN a row whose worker is on page two.
 *
 * THE 21:03Z FIXTURE, AND WHAT OF IT IS REAL. The CACHE is real: its row headings are coord's QUEUE.md at
 * `6919787bf` (SCHEDULER #19, 20:59:10Z — the last QUEUE.md write before 21:03Z; the next, 21:04:15Z, integrated
 * UI-93, D-518, D-476 and REC-194), reduced to the heading's id and state. THE LISTING IS PLANTED: BOB #33's 21:03Z
 * `list_sessions` output was not in his artifact's files (only `builder/slots.py.txt`), so each worker's bucket is
 * planted to reproduce the ruling's named cases — seven COMPLETED with pushed branches, UI-99 BLOCKED, D-516 with no
 * worker — in the shape `list_sessions` printed when measured on 2026-09-24 (SCHEDULER #20; again by this worker at
 * 22:16Z: `ccr.data[]`, `status_bucket`, `session_status`, `updated_at`, `external_metadata.current_branches`,
 * `ccr.has_more`). Every other running row is planted WORKING, except REC-194, planted REVIEW_READY (gating) to hold
 * the 21:17Z correction on the real cache.
 *
 * NEGATIVE CONTROL: RUN 2026-09-24 by the M0-191 worker, `node bio-plane/test/slots.control.mjs` from the repo root —
 * twelve arms plus a baseline, each armed ALONE against `tools/slots.mjs`, every restore verified by sha256 AND byte
 * comparison against the arm's own copy (18242 bytes, floor 8000); driver exit 0, "12 arm(s) as declared, 0 not";
 * baseline and closing suite 55 pass / 0 fail, 9/9 sections; subject sha256 19169d99882f… before and after. Every arm
 * failed at its declared assertion, spared its declared hold, and reached the suite's foot [suite tally under the arm]:
 *   A1  titles matched loosely (the ROW'S control) -> "D-492 is RESPAWN-OR-READ, failing by name" fails alone [54 / 1]
 *   A2  session_status read for the bucket (21:05Z's control) -> the seven FLIPs vanish, "the seven FLIP candidates are named" fails [36 / 19]
 *   A3  REVIEW_READY read as finished -> "REC-194 (REVIEW_READY) is not a FLIP candidate" fails [49 / 6]
 *   A4  the pushed branch not required -> "COMPLETED with no pushed branch is READ, not FLIP" fails alone [54 / 1]
 *   A5  heads not read, believed pushed -> "with the heads NOT READ, COMPLETED is UNDETERMINED…" fails [52 / 3]
 *   A6  a paged listing believed -> "has_more moves RESPAWN and SPAWN to UNDETERMINED" fails [52 / 3]
 *   A7  OVER-STRICTNESS, every listing read as paged -> "OVER-STRICTNESS: a complete listing names them" fails [44 / 11]
 *   A8  an archive not honoured -> "an ARCHIVED worker holds nothing" fails [53 / 2]
 *   A9  OVER-STRICTNESS, the title tied to one lane -> "a worker spawned by another lane still matches its row" fails [53 / 2]
 *   A10 status_detail dropped -> "UI-99's status_detail is carried" fails alone [54 / 1]
 *   A11 has_more not read -> "has_more is read" fails [52 / 3]
 *   A12 the bracket walk not string-aware -> "a brace inside a string does not end the value" fails [52 / 3]
 * THREE FINDINGS on the first run, recorded rather than smoothed — each about the INSTRUMENT, not the subject:
 *   (1) A2 failed at its declared assertion, then a TypeError on `R.answer[0].why` ENDED THE MODULE (tally -1); the
 *       indexings are now `?.`, and a second TypeError in section 8 (`r.working[0].others`) was found and closed the same way.
 *   (2) A12 came back GREEN: the fixture's string held "} and {", which BALANCES, so a walk blind to strings still
 *       closed at the right brace. The fixture now carries an unbalanced "}". Arming it then showed the SUBJECT's
 *       JSON.parse escaping as a raw SyntaxError; `valueAt` now answers a usage error (exit 2), asserted in section 1.
 *   (3) A11's declared hold was itself a has_more assertion, so the hold could not hold: the DECLARATION was wrong, and
 *       A11 and A12 now hold "a bare array reads, completeness unknown".
 */

import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, rmSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseListing, cacheRows, pushedFrom, workerIdOf, judge, render, EXIT } from "../../tools/slots.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");
const CLI = join(REPO, "tools/slots.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 9;
let reached = 0;
const section = (s) => { reached++; console.log(`\n--- ${s} ---`); };
const ids = (list) => list.map((e) => e.id).sort();

/* ---------------------------------------------------------------- FIXTURES */

/* coord's QUEUE.md at 6919787bf, THE CACHE's row headings reduced to id and state (the real 21:03Z cache). */
const CACHE_2103 = [
  ["DIST-13", "integrated"], ["REC-194", "running"], ["M0-173", "integrated"], ["DIST-11", "integrated"],
  ["D-490", "integrated"], ["D-491", "integrated"], ["D-472", "integrated"], ["D-511", "integrated"],
  ["D-510", "integrated"], ["M0-169", "integrated"], ["D-518", "running"], ["M0-178", "integrated"],
  ["D-476", "running"], ["FW-22", "running"], ["FW-23", "running"], ["D-463", "running"], ["D-475", "integrated"],
  ["M0-179", "integrated"], ["M0-180", "integrated"], ["M0-183", "integrated"], ["D-478", "running"],
  ["UI-99", "running"], ["M0-187", "running"], ["UI-101", "running"], ["UI-102", "running"], ["REC-199", "running"],
  ["REC-200", "running"], ["UI-93", "running"], ["D-519", "running"], ["M0-181", "running"], ["M0-182", "running"],
  ["D-513", "running"], ["D-514", "running"], ["D-516", "queued"],
];
const queueText = (rows) => ["# QUEUE", "", "## BOB INBOX — append-only.", "", "### M0-999 · running — an inbox heading is not a cache row", "",
  "## THE CACHE — the next rows, in order", "",
  ...rows.flatMap(([id, st]) => [`### ${id} · ${st} — **the row's headline.** — owner X.`, `status: ${st}`, ""]),
  "## TRACKED ELSEWHERE — open plan rows whose ids another file allocates", "", "### D-998 · running — not a cache row", ""].join("\n");

const T = "2026-09-24T21:0";
let n = 0;
/* A `list_sessions` row in the measured shape. */
const sess = (title, bucket, { status = "SESSION_STATUS_IDLE", updated = `${T}2:00.000000Z`, branch = null, detail = null } = {}) => ({
  id: `session_fixture${String(++n).padStart(4, "0")}`, title, session_status: status,
  created_at: "2026-09-24T19:00:00.000000Z", updated_at: updated, environment_id: "env_fixture",
  external_metadata: { current_branches: { "": branch } },
  ...(detail ? { post_turn_summary: { status_detail: detail } } : {}),
  status_bucket: bucket === null ? undefined : `SESSION_STATUS_BUCKET_${bucket}`, parent_session_id: "session_fixtureparent" });
const W = (id, bucket, o = {}) => sess(`WORKER ${id} (CONDUCT #20)`, bucket, { branch: `land/worker/${id}`, ...o });

const FLIP7 = ["D-476", "D-518", "UI-93", "REC-199", "REC-200", "UI-102", "D-519"];
const LISTING_2103 = [
  ...FLIP7.map((id) => W(id, "COMPLETED")),
  W("UI-99", "BLOCKED", { detail: "needs a ruling on the revision-basis wording" }),
  W("REC-194", "REVIEW_READY", { status: "SESSION_STATUS_RUNNING" }),
  ...["FW-22", "FW-23", "D-463", "D-478", "M0-187", "UI-101", "M0-181", "M0-182", "D-513", "D-514"]
    .map((id) => W(id, "WORKING", { status: "SESSION_STATUS_RUNNING" })),
  sess("CONDUCT #20 (BIO) — integrator lane", "WORKING"),
];
const HEADS_2103 = [...FLIP7, "FW-22", "D-490"].map((id, i) => `${String(i).padStart(40, "a")}\trefs/heads/land/worker/${id}`).join("\n");
const wrap = (sessions, hasMore = false) =>
  `Here is the listing:\n${JSON.stringify({ ccr: { data: sessions, has_more: hasMore, first_id: "x", last_id: "y" } })}\n(end of listing — "}" and "{" in prose)`;

/* ---------------------------------------------------------------- 1. the listing as saved */
section("1. parseListing reads the saved text, the bare object and the bare array");
{
  /* The brace in the string is UNBALANCED on purpose: the first draft's "} and {" balanced itself, so a walk that
     ignored strings still closed in the right place and the control arm (A12) came back GREEN — a finding about the
     fixture, recorded in slots.control.mjs. A parse that throws is caught, so the module always reaches its foot. */
  const DETAIL = 'an unbalanced } brace, and a "quoted" one';
  const tricky = [W("D-1", "WORKING", { detail: DETAIL })];
  let p;
  try { p = parseListing(wrap(tricky, true)); } catch (e) { p = { sessions: [], hasMore: null, err: e.code }; }
  t("the wrapped {\"ccr\"…} text is decoded from its offset, prose after it ignored", p.sessions.length, 1);
  t("a brace inside a string does not end the value", p.sessions[0]?.post_turn_summary?.status_detail ?? p.err, DETAIL);
  t("has_more is read", p.hasMore, true);
  t("the bare {ccr} object reads", parseListing(JSON.stringify({ ccr: { data: [W("D-1", "WORKING")], has_more: false } })).hasMore, false);
  const bare = parseListing(JSON.stringify([W("D-1", "WORKING")]));
  t("a bare array reads, completeness unknown", [bare.sessions.length, bare.hasMore], [1, null]);
  let bad = null;
  try { parseListing('{"ccr":{"data":[{"title":"x",}]}}'); } catch (e) { bad = e.code; }
  t("a listing whose JSON does not parse is a usage error, not a crash", bad, "SLOTS_USAGE");
  let threw = null;
  try { parseListing('{"sessions": []}'); } catch (e) { threw = e.code; }
  t("any other shape is a usage error, never an empty listing", threw, "SLOTS_USAGE");
}

/* ---------------------------------------------------------------- 2. the cache and the heads */
section("2. cacheRows reads THE CACHE alone; pushedFrom reads ls-remote");
{
  const rows = cacheRows(queueText(CACHE_2103));
  t("the 21:03Z cache holds 34 rows (floor: a fixture that read nothing would pass nothing)", rows.length, 34);
  t("an inbox heading and a TRACKED ELSEWHERE heading are not cache rows", rows.some((r) => r.id === "M0-999" || r.id === "D-998"), false);
  t("the states are read", rows.filter((r) => r.state === "running").length, 19);
  t("the heads are the land/worker ids", [...pushedFrom(HEADS_2103 + "\nabc1234\trefs/heads/land/conduct/c20\n")].sort(),
    [...FLIP7, "FW-22", "D-490"].sort());
}

/* ---------------------------------------------------------------- 3. the acceptance: the 21:03Z cache */
section("3. ACCEPTANCE: on the 21:03Z cache it names the seven FLIPs, UI-99 as ANSWER and D-516 as SPAWN");
const R = judge({ sessions: parseListing(wrap(LISTING_2103)).sessions, rows: cacheRows(queueText(CACHE_2103)), pushed: pushedFrom(HEADS_2103), hasMore: false });
{
  t("the seven FLIP candidates are named, by name", ids(R.flip), [...FLIP7].sort());
  t("UI-99 is ANSWER", ids(R.answer), ["UI-99"]);
  /* `?.`: an arm that empties ANSWER must fail HERE by name, not end the module with a TypeError (arm A2's first run). */
  t("UI-99's status_detail is carried", R.answer[0]?.why ?? null, "needs a ruling on the revision-basis wording");
  t("D-516 is SPAWN", ids(R.spawn), ["D-516"]);
  t("nothing is RESPAWN-OR-READ or READ or UNDETERMINED", [R.respawn.length, R.read.length, R.undetermined.length], [0, 0, 0]);
  t("WORKING is 11: ten WORKING and REC-194 REVIEW_READY", R.working.length, 11);
  t("the lane session is not a worker and names no row", R.orphans.length, 0);
  t("owed 9, exit 1", [R.owed, R.exit], [9, EXIT.OWED]);
  const text = render(R);
  t("the render says CANDIDATE and never 'FLIPPED'", [/FLIP CANDIDATE/.test(text), /FLIPPED/i.test(text)], [true, false]);
}

/* ---------------------------------------------------------------- 4. the bucket, not the status */
section("4. BOB #33 21:05Z: the signal is status_bucket, not session_status");
{
  t("every FLIP worker's session_status is IDLE (the status alone names nothing finished)",
    LISTING_2103.filter((s) => FLIP7.includes(workerIdOf(s.title))).every((s) => s.session_status === "SESSION_STATUS_IDLE"), true);
  const noBucket = LISTING_2103.map((s) => ({ ...s, status_bucket: undefined }));
  const r = judge({ sessions: noBucket, rows: cacheRows(queueText(CACHE_2103)), pushed: pushedFrom(HEADS_2103), hasMore: false });
  t("a listing without buckets names no FLIP: every worker is READ, bucket unknown", [r.flip.length, r.read.length], [0, 19]);
}

/* ---------------------------------------------------------------- 5. REVIEW_READY is gating */
section("5. BOB #33 21:17Z: REVIEW_READY is NOT finished, and COMPLETED is only a candidate");
{
  t("REC-194 (REVIEW_READY) is not a FLIP candidate", R.flip.some((e) => e.id === "REC-194"), false);
  t("REC-194 counts WORKING, tagged gating", R.working.filter((e) => e.gating).map((e) => e.id), ["REC-194"]);
  const rows = [{ id: "D-1", state: "running" }, { id: "D-2", state: "running" }];
  const s = [W("D-1", "COMPLETED"), W("D-2", "COMPLETED")];
  const r1 = judge({ sessions: s, rows, pushed: new Set(["D-1"]), hasMore: false });
  t("COMPLETED with no pushed branch is READ, not FLIP", [ids(r1.flip), ids(r1.read)], [["D-1"], ["D-2"]]);
  const r2 = judge({ sessions: s, rows, pushed: null, hasMore: false });
  t("with the heads NOT READ, COMPLETED is UNDETERMINED, never a candidate", [r2.flip.length, r2.read.length, ids(r2.undetermined)], [0, 0, ["D-1", "D-2"]]);
  t("…and exits 3, not 0", r2.exit, EXIT.UNDETERMINED);
  t("current_branches is not read as a push (D-2 names land/worker/D-2 and is still READ)", s[1].external_metadata.current_branches[""], "land/worker/D-2");
}

/* ---------------------------------------------------------------- 6. exact titles */
section("6. the row's NEGATIVE CONTROL shape: a WORKER D-49 session does not satisfy D-492");
{
  const rows = [{ id: "D-492", state: "running" }, { id: "D-4", state: "queued" }];
  const r = judge({ sessions: [W("D-49", "WORKING"), W("D-4920", "WORKING")], rows, pushed: new Set(), hasMore: false });
  t("D-492 is RESPAWN-OR-READ, failing by name", ids(r.respawn), ["D-492"]);
  t("D-4 (queued) is SPAWN: neither D-49 nor D-4920 is its worker", ids(r.spawn), ["D-4"]);
  t("D-49 and D-4920 are named as workers on no cache row", ids(r.orphans), ["D-49", "D-4920"]);
  t("workerIdOf is exact", [workerIdOf("WORKER D-492 (RECORD #3)"), workerIdOf("WORKER D-492: x"), workerIdOf("worker D-492 (X)"), workerIdOf("WORKER  D-492 (X)")],
    ["D-492", null, null, null]);
  const r2 = judge({ sessions: [sess("WORKER D-492: RECORD #3", "WORKING")], rows, pushed: new Set(), hasMore: false });
  t("an unparsed WORKER title is NAMED and matches nothing", [r2.unparsed.map((e) => e.title), ids(r2.respawn)], [["WORKER D-492: RECORD #3"], ["D-492"]]);
  /* OVER-STRICTNESS: another lane's parenthesis and any instance still match */
  const r3 = judge({ sessions: [sess("WORKER D-492 (SCHEDULER #20)", "WORKING")], rows, pushed: new Set(), hasMore: false });
  t("a worker spawned by another lane still matches its row", ids(r3.working), ["D-492"]);
}

/* ---------------------------------------------------------------- 7. a paged listing */
section("7. a listing with more pages cannot show absence");
{
  const rows = [{ id: "D-1", state: "running" }, { id: "D-2", state: "queued" }, { id: "D-3", state: "running" }];
  const r = judge({ sessions: [W("D-3", "BLOCKED")], rows, pushed: new Set(), hasMore: true });
  t("has_more moves RESPAWN and SPAWN to UNDETERMINED", [r.respawn.length, r.spawn.length, ids(r.undetermined)], [0, 0, ["D-1", "D-2"]]);
  t("a BLOCKED worker is still ANSWER: one found is enough", ids(r.answer), ["D-3"]);
  t("exit 1: something is owed for certain", r.exit, EXIT.OWED);
  const r2 = judge({ sessions: [], rows: rows.slice(0, 2), pushed: new Set(), hasMore: true });
  t("with nothing certain, exit 3", r2.exit, EXIT.UNDETERMINED);
  const r3 = judge({ sessions: [W("X-1", "WORKING"), W("X-2", "WORKING")], rows: rows.slice(0, 2), pushed: new Set(), hasMore: null, limit: 2 });
  t("a bare array at its declared --limit is cut too", r3.undetermined.length, 2);
  const r4 = judge({ sessions: [W("X-1", "WORKING")], rows: rows.slice(0, 2), pushed: new Set(), hasMore: false });
  t("OVER-STRICTNESS: a complete listing names them", [ids(r4.respawn), ids(r4.spawn)], [["D-1"], ["D-2"]]);
}

/* ---------------------------------------------------------------- 8. the rest of the buckets */
section("8. archived, respawned, FAILED, unknown, queued-with-a-worker, DIST");
{
  const rows = [{ id: "A-1", state: "running" }, { id: "A-2", state: "running" }, { id: "A-3", state: "running" },
                { id: "A-4", state: "running" }, { id: "A-5", state: "queued" }, { id: "A-6", state: "queued" },
                { id: "DIST-9", state: "running" }, { id: "A-7", state: "integrated" }];
  const s = [
    W("A-1", "COMPLETED", { status: "SESSION_STATUS_ARCHIVED" }),
    W("A-2", "COMPLETED", { updated: "2026-09-24T22:00:00Z" }), W("A-2", "WORKING", { updated: "2026-09-24T21:00:00Z" }),
    W("A-3", "FAILED"), W("A-4", "PAUSED"), W("A-5", "WORKING"), W("A-6", "COMPLETED"),
  ];
  const r = judge({ sessions: s, rows, pushed: new Set(["A-1", "A-2", "A-6"]), hasMore: false });
  t("an ARCHIVED worker holds nothing: A-1 is RESPAWN-OR-READ", ids(r.respawn), ["A-1"]);
  t("the archive is counted", r.archived, 1);
  t("a live WORKING respawn wins over a later COMPLETED session, the other counted", [ids(r.working), r.working[0]?.others], [["A-2"], 1]);
  t("FAILED, an unknown bucket, and a queued row with a live worker are READ", ids(r.read), ["A-3", "A-4", "A-5"]);
  t("the unknown bucket is named, not scored", r.read.find((e) => e.id === "A-4")?.why.includes("PAUSED") ?? false, true);
  t("a queued row whose only worker COMPLETED is SPAWN (the prototype's rule)", ids(r.spawn), ["A-6"]);
  t("a running DIST row with no worker is the lane's, not owed", ids(r.lane), ["DIST-9"]);
  t("open slots: CACHE_ROWS less the 7 non-integrated rows", [r.slots.held, r.slots.open], [7, r.slots.cap - 7]);
}

/* ---------------------------------------------------------------- 9. the CLI */
section("9. the CLI, through its files and exit codes");
{
  const dir = mkdtempSync(join(tmpdir(), "m0191-slots-"));
  const q = join(dir, "queue.md"), h = join(dir, "heads.txt");
  writeFileSync(q, queueText(CACHE_2103)); writeFileSync(h, HEADS_2103);
  const run = (args, input) => spawnSync(process.execPath, [CLI, ...args], { input, encoding: "utf8" });
  const a = run(["--queue", q, "--heads", h], wrap(LISTING_2103));
  t("exit 1 over the 21:03Z cache", a.status, 1);
  t("stdout names each of the seven under FLIP CANDIDATE", FLIP7.every((id) => new RegExp(`^  ${id}  session_`, "m").test(a.stdout.split("ANSWER")[0])), true);
  t("stdout's tally line", /^OWED 9 · UNDETERMINED 0 · exit 1$/m.test(a.stdout), true);
  const b = run(["--queue", q, "--no-heads"], wrap(LISTING_2103));
  t("--no-heads: the seven are UNDETERMINED and ANSWER/SPAWN still owe (exit 1)", [b.status, /UNDETERMINED \(7\)/.test(b.stdout)], [1, true]);
  const onlyWorking = [W("X-1", "WORKING")];
  const c = run(["--queue", q, "--heads", h], wrap(onlyWorking, true));
  t("a paged listing with nothing certain exits 3", [c.status, /LISTING INCOMPLETE/.test(c.stdout)], [3, true]);
  const d = run(["--queue", q, "--bogus"], "[]");
  t("a usage error exits 2", d.status, 2);
  const e = run(["--queue", q, "--heads", h], "no json here");
  t("stdin without JSON is a usage error, never an empty listing", e.status, 2);
  rmSync(q); rmSync(h); rmdirSync(dir);
}

console.log(`\nslots: ${pass} pass / ${fail} fail · sections ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log(`FAIL  the suite did not reach its foot: ${reached} of ${SECTIONS} sections`); fail++; }
process.exit(fail ? 1 : 0);

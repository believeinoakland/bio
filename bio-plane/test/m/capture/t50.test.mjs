/* capture, T50 (T50-8; N1117, N1124; SCREENS-INTAKE #4 J1, SCREENS-INQUIRY #4 J4; K3369, K3375, K3627) at the module's
   interface: R94 (`recordCapturedFor`, the asks `acquire`'s `for` records), R77 and R83 (the asks handed to the registered
   reader and shown through it), R95 (`captureGradeOf`, `op=capturegrade`) and R73's additions (the store handed in
   answers `recordCapturedFor`, `liveCaptureSessions` and `openCaptures`). Sentences are asserted as `word(key)`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, provenance, register, sha, H } from "./fixture.mjs";
import { captureOps, Capture, WITHHELD_QUESTION, CAPTURED_FOR_QUESTION_MAX } from "../../../src/capture/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const everything = (rows) => rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name)
  .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
const route = (c, name, qs = "", body = null) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, c.env)[name]();
const NOW = "2026-03-11T00:00:00Z";
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

/* Two members; m1 takes part in PROJ-1, m2 does not. INFO-1 is filed under two captures (H(1), H(2)), INFO-2 under H(3),
   INFO-3 under no capture. */
function world() {
  const f = fresh();
  const s = f.s;
  for (const m of ["m1", "m2"]) s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('PROJ-1', 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`);
  s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-1', 'm1', 'active', '2026-01-01', '2026-01-01')`);
  register(s, H("1"), "INFO-1");
  register(s, H("2"), "INFO-1");
  register(s, H("3"), "INFO-2");
  s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('INFO-3', 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`);
  return f;
}

/* A stand-in for `capture-requests` R48's reader, answering one entry for each of the asks it is handed and for its own
   requests (none here): Q-OPEN (open, seen by everyone), Q-HID (open, in a project only m1 takes part in). Every call is
   recorded. */
const TITLES = { "Q-OPEN": "Budget 2024", "Q-HID": "Secret project question" };
function reader(c, { module = "capture-requests", useAsks = true } = {}) {
  const calls = [];
  const r = c.registerReader("captured-for", module, (arg) => {
    calls.push(arg);
    const seesHid = arg.viewer === "member:m1" || arg.viewer === "class:admin";
    return { questions: useAsks ? (arg.asks || []).map(({ question, asker }) => {
      const visible = question !== "Q-HID" || seesHid;
      return { question, asker: visible ? `member:${asker}` : null, title: visible ? TITLES[question] : null, visible, waiting: question === "Q-OPEN" };
    }) : [] };
  });
  assert.equal(r.ok, true);
  return calls;
}
const rowsOf = async (c, viewer) => Object.fromEntries((await c.heldCaptures({ viewer, now: NOW })).held.map((r) => [r.bundle_id, r]));

test("R94 recordCapturedFor records once for each (capture digest, question, member) at the first instant, in the table captured_for and nowhere else; a member: prefix and the bare id are one member, and another question or member is another row", () => {
  const { c, rows } = world();
  const before = Object.fromEntries(everything(rows));
  assert.deepEqual(c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "member:m1", at: "2026-03-01T10:00:00Z" }), { recorded: true });
  const one = rows(`SELECT capture_sha, question, asker, at FROM captured_for`).map((r) => ({ ...r }));
  assert.deepEqual(one, [{ capture_sha: H("1"), question: "Q-OPEN", asker: "m1", at: "2026-03-01T10:00:00Z" }]);
  /* a second record of the same triple leaves one row, and the first instant */
  assert.deepEqual(c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "member:m1", at: "2026-03-05T10:00:00Z" }), { recorded: true });
  assert.deepEqual(c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "m1" }), { recorded: true }, "the bare id is the same member");
  assert.deepEqual(rows(`SELECT at FROM captured_for`).map((r) => ({ ...r })), [{ at: "2026-03-01T10:00:00Z" }], "one row, at the first instant");
  /* another question, another member, another capture: each its own row; no instant given reads the clock */
  c.recordCapturedFor({ captureSha: H("1"), question: "Q-HID", by: "m1" });
  c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "m2" });
  c.recordCapturedFor({ captureSha: H("2"), question: "Q-OPEN", by: "m1", at: "not an instant" });
  const all = rows(`SELECT capture_sha, question, asker, at FROM captured_for ORDER BY capture_sha, question, asker`).map((r) => ({ ...r }));
  assert.deepEqual(all.map((r) => [r.capture_sha, r.question, r.asker]),
                   [[H("1"), "Q-HID", "m1"], [H("1"), "Q-OPEN", "m1"], [H("1"), "Q-OPEN", "m2"], [H("2"), "Q-OPEN", "m1"]]);
  for (const r of all) assert.match(r.at, ISO, "a whole-second instant");
  /* it writes captured_for alone */
  const after = Object.fromEntries(everything(rows));
  for (const t of Object.keys(after)) if (t !== "captured_for") assert.equal(after[t], before[t], t);
  /* the question's bound is 200 characters, counted as characters */
  assert.equal(CAPTURED_FOR_QUESTION_MAX, 200);
  assert.deepEqual(c.recordCapturedFor({ captureSha: H("3"), question: "q".repeat(200), by: "m1" }), { recorded: true });
});

test("R94 controls: a digest that is not 64 lowercase hex, a question that is not a non-blank string of at most 200 characters, and a by that is not a member's stamp each answer recorded false and write nothing", () => {
  const { c, rows } = world();
  const before = everything(rows);
  const ok = { captureSha: H("1"), question: "Q-OPEN", by: "member:m1" };
  const bad = [
    { captureSha: H("a").toUpperCase() }, { captureSha: H("1").slice(1) }, { captureSha: null }, { captureSha: 5 }, { captureSha: undefined },
    { question: "" }, { question: "   " }, { question: null }, { question: 7 }, { question: "q".repeat(201) }, { question: ["Q-OPEN"] },
    { by: undefined }, { by: "" }, { by: "  " }, { by: "member:" }, { by: 5 }, { by: "class:admin" }, { by: "class:daemon" },
  ];
  for (const delta of bad) assert.deepEqual(c.recordCapturedFor({ ...ok, ...delta }), { recorded: false }, JSON.stringify(delta));
  assert.deepEqual(c.recordCapturedFor(), { recorded: false });
  assert.deepEqual(c.recordCapturedFor(null), { recorded: false });
  assert.deepEqual(everything(rows), before, "nothing written");
  /* control: the same call with a good digest, question and member records */
  assert.deepEqual(c.recordCapturedFor(ok), { recorded: true });
});

test("R94 never throws: a store that cannot write answers recorded false", () => {
  const { c, s } = world();
  const exec = s.sql.exec;
  s.sql.exec = () => { throw new Error("storage is down"); };
  try { assert.deepEqual(c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "m1" }), { recorded: false }); }
  finally { s.sql.exec = exec; }
  assert.deepEqual(c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "m1" }), { recorded: true }, "the store readable again records");
});

test("R94 R87 captured_for is declared to record-core's purge as capture's other tables are, and a stated read contract (its columns)", () => {
  const { c, core, rows } = world();
  assert.deepEqual(c.declareTables(), { ok: true, module: "capture", declared: true });
  const mine = core.declaredTables().filter((d) => d.module === "capture").map((d) => d.name);
  assert.ok(mine.includes("captured_for"), "declared");
  assert.deepEqual(rows(`PRAGMA table_info(captured_for)`).map((r) => r.name), ["capture_sha", "question", "asker", "at"]);
  /* a second migrate over the same storage creates nothing new and declares nothing twice */
  assert.doesNotThrow(() => c.migrate());
});

test("R94 R77 R83: after recordCapturedFor, heldCaptures answers that document with captured_for.questions naming the question for a viewer who may see it, and for one who may not the withheld sentence and no id, title or count of it", async () => {
  const { c, rows } = world();
  const calls = reader(c);
  c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "member:m1", at: "2026-03-01T10:00:00Z" });
  c.recordCapturedFor({ captureSha: H("2"), question: "Q-HID", by: "member:m1", at: "2026-03-02T10:00:00Z" });
  c.recordCapturedFor({ captureSha: H("3"), question: "Q-HID", by: "member:m1", at: "2026-03-02T10:00:00Z" });
  const before = everything(rows);
  const m1 = await rowsOf(c, "member:m1");
  assert.deepEqual(m1["INFO-1"].captured_for, { questions: [{ question: "Q-HID", title: TITLES["Q-HID"], asker: "member:m1" },
                                                            { question: "Q-OPEN", title: TITLES["Q-OPEN"], asker: "member:m1" }], withheld: null },
                   "m1 may see both");
  const m2 = await rowsOf(c, "member:m2");
  assert.deepEqual(m2["INFO-1"].captured_for, { questions: [{ question: "Q-OPEN", title: TITLES["Q-OPEN"], asker: "member:m1" }], withheld: WITHHELD_QUESTION },
                   "m2 sees the open one and the sentence for the other");
  assert.deepEqual(m2["INFO-2"].captured_for, { questions: [], withheld: word("screen.held.withheld") }, "only a question it may not see: the sentence alone");
  assert.equal(WITHHELD_QUESTION, word("screen.held.withheld"));
  const shown = JSON.stringify([m2["INFO-1"].captured_for, m2["INFO-2"].captured_for]);
  assert.ok(!shown.includes("Q-HID") && !shown.includes("Secret") && !/\b2\b/.test(shown), "no id, title or count of a question not seen");
  /* the reader is asked for the document the row is of */
  assert.ok(calls.some((x) => x.document === "INFO-1" && x.viewer === "member:m2"));
  assert.deepEqual(everything(rows), before, "reading writes nothing");
  /* control: a document captured for no question, and no request, answers questions [] and withheld null */
  assert.deepEqual(m1["INFO-3"].captured_for, { questions: [], withheld: null });
  assert.deepEqual(m2["INFO-3"].captured_for, { questions: [], withheld: null });
  /* control: a blank question and a machine by record nothing, so the document still answers no question */
  const w = world();
  reader(w.c);
  w.c.recordCapturedFor({ captureSha: H("3"), question: "  ", by: "member:m1" });
  w.c.recordCapturedFor({ captureSha: H("3"), question: "Q-OPEN", by: "class:admin" });
  assert.deepEqual((await rowsOf(w.c, "member:m1"))["INFO-2"].captured_for, { questions: [], withheld: null });
});

test("R83 the reader is handed asks: the rows of captured_for for the document's captures as [{question, asker}], each pair once however many captures name it, in question and asker order; a document with none is handed []; this module names no question from asks itself", async () => {
  const { c } = world();
  const calls = reader(c);
  c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "m1" });
  c.recordCapturedFor({ captureSha: H("2"), question: "Q-OPEN", by: "m1" });
  c.recordCapturedFor({ captureSha: H("2"), question: "Q-HID", by: "m2" });
  c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "m2" });
  await c.heldCaptures({ viewer: "member:m1", now: NOW });
  const handed = (doc) => calls.filter((x) => x.document === doc).at(-1);
  assert.deepEqual(handed("INFO-1").asks, [{ question: "Q-HID", asker: "m2" }, { question: "Q-OPEN", asker: "m1" }, { question: "Q-OPEN", asker: "m2" }]);
  assert.deepEqual(handed("INFO-1").captures, [H("1"), H("2")]);
  assert.deepEqual(handed("INFO-2").asks, [], "a document no one asked for");
  assert.deepEqual(handed("INFO-3").asks, [], "a document under no capture");
  /* a reader that takes no asks leaves them unnamed: the row names no question this module read from the table */
  const quiet = world();
  reader(quiet.c, { useAsks: false });
  quiet.c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "m1" });
  assert.deepEqual((await rowsOf(quiet.c, "member:m1"))["INFO-1"].captured_for, { questions: [], withheld: null });
  /* with no reader registered the ask changes nothing: captured_for stays undetermined, as R77 states */
  const none = world();
  none.c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "m1" });
  const row = (await rowsOf(none.c, "member:m1"))["INFO-1"];
  assert.deepEqual([row.captured_for, row.captured_for_basis], [null, word("capture.basis.reader_questions_document")]);
});

test("R79 R94: setAside reads the asks through the same reader, so a question asked for through acquire's for that waits on the document is recorded with the set-aside and stands in its history", async () => {
  const { c } = world();
  reader(c);
  c.recordCapturedFor({ captureSha: H("1"), question: "Q-OPEN", by: "member:m1" });
  c.recordCapturedFor({ captureSha: H("1"), question: "Q-HID", by: "member:m1" });
  const r = c.setAside({ ids: ["INFO-1"], reason: "wrong source", author: "member:m2", viewer: "member:m2" });
  assert.equal(r.ok, true);
  const d = r.documents[0];
  assert.deepEqual(d.captured_for.questions.map((q) => q.question), ["Q-OPEN"], "m2 is shown the question it may see");
  assert.equal(d.captured_for.withheld, WITHHELD_QUESTION);
  assert.deepEqual(d.waiting.questions.map((q) => q.question), ["Q-OPEN"]);
  const history = c.heldActsOf({ question: "Q-OPEN", viewer: "member:m1" });
  assert.deepEqual(history.acts.map((a) => [a.document, a.act, a.reason]), [["INFO-1", "set_aside", "wrong source"]]);
  assert.deepEqual(c.heldActsOf({ question: "Q-HID", viewer: "member:m1" }).acts, [], "Q-HID did not wait on the document, so nothing is recorded with it");
});

/* ---- R95 ---- */

const GRADED = (d) => ({ grade: "B", route: "direct", determined: true, basis: "measured", why: `fetched ${d.slice(0, 4)}` });
const RECEIVED = { grade: null, route: "received", determined: false, basis: "CAPTURE_RECEIVED_NOT_FETCHED", why: "handed over, not fetched" };

function gradedWorld(captureGrade = (d) => (d === H("3") ? RECEIVED : GRADED(d))) {
  const f = world();
  f.c.provenance = Object.assign(provenance(f.s, { registered: [H("1"), H("2"), H("3")] }), captureGrade ? { captureGrade } : {});
  /* a capture in a project bundle, which m2 may not see, and a digest filed under no bundle */
  register(f.s, H("5"), "PROJ-1", { type: "project" });
  f.c.provenance = Object.assign(provenance(f.s, { registered: [H("1"), H("2"), H("3"), H("5"), H("6")] }), captureGrade ? { captureGrade } : {});
  return f;
}

test("R95 captureGradeOf answers {ok, captureSha, grade}, grade provenance.captureGrade's answer whole, equal to the heldcaptures row's capture.grade; a received capture reads as stated there, never as measured; it writes nothing", async () => {
  const { c, rows } = gradedWorld();
  const before = everything(rows);
  const held = await rowsOf(c, "member:m1");
  for (const d of [H("1"), H("3")]) {
    const r = await c.captureGradeOf({ captureSha: d, viewer: "member:m1" });
    assert.deepEqual(r, { ok: true, captureSha: d, grade: c.provenance.captureGrade(d) });
    const doc = d === H("1") ? "INFO-1" : "INFO-2";
    assert.deepEqual(r.grade, held[doc].capture.grade, `${doc}: the same object the held row answers`);
  }
  const received = await c.captureGradeOf({ captureSha: H("3"), viewer: "member:m1" });
  assert.deepEqual(received.grade, RECEIVED);
  assert.equal(received.grade.grade, null, "no letter: stated as received");
  assert.notEqual(received.grade.route, "direct");
  /* an in-process caller passing no viewer reads whole; a capture filed under no bundle is seen by a member */
  assert.equal((await c.captureGradeOf({ captureSha: H("1") })).grade.grade, "B");
  assert.equal((await c.captureGradeOf({ captureSha: H("6"), viewer: "member:m2" })).grade.grade, "B", "filed in no bundle: seen");
  assert.deepEqual(everything(rows), before, "writes nothing");
});

test("R95 controls: a capture in a bundle the viewer may not see, an unheld digest and a capture provenance does not answer for all answer grade null alike", async () => {
  const { c } = gradedWorld();
  const hidden = await c.captureGradeOf({ captureSha: H("5"), viewer: "member:m2" });
  const unheld = await c.captureGradeOf({ captureSha: H("9"), viewer: "member:m2" });
  assert.deepEqual(hidden, { ok: true, captureSha: H("5"), grade: null });
  assert.deepEqual(unheld, { ok: true, captureSha: H("9"), grade: null });
  assert.deepEqual(Object.keys(hidden), Object.keys(unheld), "the same shape: an unseen capture reads as one never held");
  assert.equal((await c.captureGradeOf({ captureSha: H("5"), viewer: "member:m1" })).grade.grade, "B", "a member who takes part sees it");
  assert.equal((await c.captureGradeOf({ captureSha: H("5"), viewer: "class:admin" })).grade.grade, "B", "a machine credential sees it");
  assert.equal((await c.captureGradeOf({ captureSha: H("1"), viewer: "junk" })).grade, null, "an unrecognised viewer sees nothing");
  /* provenance not answering: a throw, a promise, no object, no captureGrade at all (false: gradedWorld gives none) */
  for (const captureGrade of [() => { throw new Error("down"); }, async () => GRADED(H("1")), () => "B", () => null, false]) {
    const w = gradedWorld(captureGrade);
    const r = await w.c.captureGradeOf({ captureSha: H("1"), viewer: "member:m1" });
    assert.deepEqual(r, { ok: true, captureSha: H("1"), grade: null }, String(captureGrade));
  }
  /* the store that cannot be read never throws */
  const w = gradedWorld();
  const exec = w.s.sql.exec;
  w.s.sql.exec = () => { throw new Error("storage is down"); };
  try { assert.deepEqual(await w.c.captureGradeOf({ captureSha: H("1"), viewer: "member:m1" }), { ok: true, captureSha: H("1"), grade: null }); }
  finally { w.s.sql.exec = exec; }
});

test("R95 a captureSha that is not 64 lowercase hex is the required-argument refusal naming it, nothing read", async () => {
  const { c } = gradedWorld();
  for (const bad of [H("a").toUpperCase(), H("1").slice(0, 63), `${H("1")}0`, "", null, undefined, 5, {}]) {
    const r = await c.captureGradeOf({ captureSha: bad, viewer: "member:m1" });
    assert.deepEqual([r.ok, r.reason, r.op, r.argument, r.status], [false, "REQUIRED_ARGUMENT_MISSING", "capturegrade", "captureSha", 400], String(bad));
  }
  assert.equal((await c.captureGradeOf()).reason, "REQUIRED_ARGUMENT_MISSING");
});

test("R95 op=capturegrade is the read: it answers by the stamped viewer, from the query's capture or the body's captureSha, and an unstamped call sees nothing", async () => {
  const { c } = gradedWorld();
  const q = await route(c, "capturegrade", `capture=${H("1")}&viewer=member:m1`);
  assert.deepEqual(q, { ok: true, captureSha: H("1"), grade: GRADED(H("1")) });
  assert.deepEqual(await route(c, "capturegrade", "viewer=member:m1", { captureSha: H("1") }), q, "the body's captureSha");
  assert.equal((await route(c, "capturegrade", `capture=${H("1")}`)).grade, null, "unstamped: nothing");
  assert.equal((await route(c, "capturegrade", `capture=${H("5")}&viewer=member:m2`)).grade, null, "a capture the viewer may not see");
  assert.equal((await route(c, "capturegrade", "capture=zz&viewer=member:m1")).reason, "REQUIRED_ARGUMENT_MISSING");
});

/* ---- R73's additions, and R94 against the real caller (acquisition R47) ---- */

test("R73 the store handed in answers recordCapturedFor (R94), liveCaptureSessions (R46) and openCaptures (acquisition R46): the services acquisition R46 and R47 call", () => {
  const { c } = world();
  for (const name of ["recordCapturedFor", "liveCaptureSessions", "openCaptures"]) assert.equal(typeof c[name], "function", name);
  assert.ok(c instanceof Capture);
  /* liveCaptureSessions: the sessions whose expiry is after now, in session order */
  c.saveCaptureSession({ session: "s2", locator: "https://a.example/2", primarySha: H("2"), primaryFile: "f", base: "b", state: { by: "m1" }, at: "2026-03-10T00:00:00Z" });
  c.saveCaptureSession({ session: "s1", locator: "https://a.example/1", primarySha: H("1"), primaryFile: "f", base: "b", state: { by: "m2" }, at: "2026-03-10T00:00:00Z" });
  const live = c.liveCaptureSessions("2026-03-10T00:30:00Z");
  assert.deepEqual(live.map((x) => x.session), ["s1", "s2"]);
  assert.deepEqual(c.liveCaptureSessions("2026-03-10T02:00:00Z"), [], "expired");
});

test("R73 R46 openCaptures is acquisition's, answered over this module's store: a session its walk parked for a member (state.opened_by) lists for that member and no other, until it expires; the instant is this module's clock when none is given; op=opencaptures reads the stamped member", () => {
  const { c } = world();
  const park = (session, opened_by, at, queue = [1, 2]) => c.saveCaptureSession({ session, locator: `https://a.example/${session}`, primarySha: H("1"), primaryFile: "f",
    base: "b", state: { ...(opened_by ? { opened_by } : {}), queue }, at });
  park("s-old", "member:m1", "2026-03-10T00:00:00Z");
  park("s-new", "member:m1", "2026-03-10T00:10:00Z", [1]);
  park("s-other", "member:m2", "2026-03-10T00:05:00Z");
  park("s-daemon", null, "2026-03-10T00:06:00Z");
  const now = "2026-03-10T00:30:00Z";
  const mine = c.openCaptures({ by: "member:m1", now });
  assert.deepEqual([mine.ok, mine.truncated], [true, false]);
  assert.deepEqual(mine.captures.map((x) => [x.session, x.outstanding]), [["s-new", 1], ["s-old", 2]], "newest started first, with what is left to fetch");
  assert.deepEqual(c.openCaptures({ by: "member:m2", now }).captures.map((x) => x.session), ["s-other"], "no other member's");
  for (const by of [undefined, "", "  ", "class:admin", 5]) assert.deepEqual(c.openCaptures({ by, now }).captures, [], String(by));
  assert.deepEqual(c.openCaptures({ by: "member:m1", now: "2026-03-10T02:00:00Z" }).captures, [], "after expiry");
  /* with no instant given, this module's clock decides (R90's seam) */
  c.clock = () => Date.parse(now);
  assert.equal(c.openCaptures({ by: "member:m1" }).captures.length, 2);
  c.clock = () => Date.parse("2026-03-10T05:00:00Z");
  assert.equal(c.openCaptures({ by: "member:m1" }).captures.length, 0);
  assert.equal(c.openCaptures().captures.length, 0, "no argument at all lists nothing, throws nothing");
  /* the route takes the member from the control plane's stamp and the instant from this module's clock, never the query's */
  c.clock = () => Date.parse(now);
  assert.deepEqual(route(c, "opencaptures", "by=member:m1").captures.map((x) => x.session), ["s-new", "s-old"]);
  assert.deepEqual(route(c, "opencaptures", "by=member:m1&now=2030-01-01T00:00:00Z").captures.length, 2, "a now in the query is not read");
  assert.deepEqual(route(c, "opencaptures", "").captures, [], "unstamped: nothing");
});

const PAGE = "https://a.example/doc";
async function acquireFor(f, body, who = { cls: "member", member: true, sessMember: "m1", storeName: "bio" }) {
  const net = network({ [PAGE]: () => new Response("for a question", { headers: { "content-type": "text/plain" } }) });
  try { return await f.c.acquire({ locator: PAGE, ...body }, who); } finally { net.restore(); }
}

test("R94 R77 acquisition R47: a member's acquire with for calls recordCapturedFor once with the digest, question, member and instant, also when the bytes were already held; heldCaptures then answers the document with the question for a viewer who may see it and the withheld sentence for one who may not", async () => {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  for (const m of ["m1", "m2"]) f.s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  const d = sha("for a question");
  const calls = [];
  const real = f.c.recordCapturedFor.bind(f.c);
  f.c.recordCapturedFor = (a) => { calls.push(a); return real(a); };
  const first = await acquireFor(f, { for: "Q-HID" });
  assert.equal(first.body.ok, true);
  assert.deepEqual(first.body.for, { question: "Q-HID", recorded: true });
  assert.equal(calls.length, 1);
  assert.deepEqual([calls[0].captureSha, calls[0].question, calls[0].by, calls[0].at], [d, "Q-HID", "m1", first.body.document.retrieved]);
  assert.deepEqual(f.rows(`SELECT capture_sha, question, asker, at FROM captured_for`).map((r) => ({ ...r })),
                   [{ capture_sha: d, question: "Q-HID", asker: "m1", at: first.body.document.retrieved }]);
  /* the same bytes again, as a member asking for another question and then the same one: held, still recorded once each */
  const again = await acquireFor(f, { for: "Q-HID" });
  assert.equal(again.body.existed, true);
  assert.deepEqual(again.body.for, { question: "Q-HID", recorded: true });
  await acquireFor(f, { for: "Q-OPEN" });
  assert.deepEqual(f.rows(`SELECT question FROM captured_for ORDER BY question`).map((r) => r.question), ["Q-HID", "Q-OPEN"], "one row for each question");
  /* the promoted document: the register files the capture under it */
  register(f.s, d, "INFO-9");
  reader(f.c);
  const m1 = (await rowsOf(f.c, "member:m1"))["INFO-9"].captured_for;
  assert.deepEqual(m1.questions.map((q) => q.question), ["Q-HID", "Q-OPEN"]);
  assert.equal(m1.withheld, null);
  const m2 = (await rowsOf(f.c, "member:m2"))["INFO-9"].captured_for;
  assert.deepEqual(m2.questions.map((q) => q.question), ["Q-OPEN"]);
  assert.equal(m2.withheld, WITHHELD_QUESTION);
  assert.ok(!JSON.stringify(m2).includes("Q-HID") && !JSON.stringify(m2).includes("Secret"), "nothing of the question it may not see");
});

test("R94 controls with acquisition R47: a call with no for, a daemon call carrying for, and a for that is refused record nothing", async () => {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  const calls = [];
  f.c.recordCapturedFor = (a) => { calls.push(a); return { recorded: true }; };
  const plain = await acquireFor(f, {});
  assert.equal(plain.body.ok, true);
  assert.equal(plain.body.for, undefined, "no for: the answer carries none");
  const daemon = await acquireFor(f, { for: "Q-OPEN" }, { cls: "admin", member: false, sessMember: null, storeName: "bio" });
  assert.equal(daemon.body.ok, true);
  assert.equal(daemon.body.for, undefined, "a daemon call's for is ignored");
  const bad = await acquireFor(f, { for: 5 });
  assert.equal(bad.status, 400);
  assert.equal(bad.body.reason, "BAD_FOR");
  assert.deepEqual(calls, [], "recordCapturedFor was never called");
  assert.deepEqual(f.rows(`SELECT * FROM captured_for`), []);
  /* a blank question reaches recordCapturedFor only if acquisition let it through; it records nothing either way */
  assert.deepEqual(new Capture(f.s, { record: f.core }).recordCapturedFor({ captureSha: sha("for a question"), question: " ", by: "m1" }), { recorded: false });
});

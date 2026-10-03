/* docket: filing to the record (R1), the pressure mark (R2), a record entry taken back (R11), the contesting filing told
   to reevaluation (R13) and who may act (R18), at the module's interface. Every refusal is shown with its negative
   control: the same call with only that condition put right is accepted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, world, file, V, MACHINE, CASE, SUBJECT, OTHER_SUBJECT, RESPONSE, post } from "./fixture.mjs";
import { DOCKET_CHECKS, FOUND_BY, PRESSURE_KINDS } from "../../../src/docket/index.mjs";

const rowOk = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 200));
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  assert.equal(r.check, DOCKET_CHECKS[code].check);
  assert.equal(r.translation, DOCKET_CHECKS[code].translation);
};
/* Refused with nothing written anywhere; then the control, accepted. */
function refusedThenAccepted(w, bad, good, code) {
  const before = w.snapshot();
  const r = bad();
  if (code === "NO_SUCH_CASE") assert.equal(r.reason, code); else rowOk(r, code);
  assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
  const ok = good();
  assert.equal(ok.ok, true, `${code}'s control: ${JSON.stringify(ok).slice(0, 300)}`);
  return r;
}

test("R1 R18 a machine or AI credential, an operator token, an administrator's class or nobody is MACHINE_CANNOT_FILE_DOCKET", () => {
  const w = seeded();
  for (const who of [MACHINE, "class:daemon", "token:operator", "class:admin", "", null])
    refusedThenAccepted(w, () => file(w, { author: who, viewer: who }), () => file(w), "MACHINE_CANNOT_FILE_DOCKET");
});

test("R1 a case absent, with no ratified edition, or whose project the viewer does not see is NO_SUCH_CASE, one answer", () => {
  const w = seeded();
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES ('CASE-2026-0202', ?, 't')`, w.P);   /* never ratified */
  const strip = ({ case: _c, ...x }) => x;
  const absent = file(w, { case: "CASE-2026-9999" });
  const unratified = file(w, { case: "CASE-2026-0202" });
  const unseen = file(w, {}, "dave");
  for (const r of [absent, unratified, unseen]) {
    assert.equal(r.reason, "NO_SUCH_CASE");
    assert.equal(r.check, undefined, "NO_SUCH_CASE carries no row of this module (R22)");
    assert.deepEqual(strip(r), strip(absent), "the same answer for each");
  }
  refusedThenAccepted(w, () => file(w, {}, "dave"), () => file(w, {}, "bob"), "NO_SUCH_CASE");
});

test("R1 `author` not a joined participant of the project is DOCKET_NOT_A_PARTICIPANT", () => {
  const w = seeded();
  /* carol is invited, sees the project, and has not joined */
  const r = file(w, {}, "carol");
  if (r.reason === "NO_SUCH_CASE") {
    /* an invited participant who does not see the project in full is answered NO_SUCH_CASE first; a member who sees it
       as the viewer but files as a non-participant is the arm itself */
    refusedThenAccepted(w, () => file(w, { author: V("carol"), viewer: V("bob") }), () => file(w), "DOCKET_NOT_A_PARTICIPANT");
  } else {
    rowOk(r, "DOCKET_NOT_A_PARTICIPANT");
  }
  refusedThenAccepted(w, () => file(w, { author: V("dave"), viewer: V("bob") }), () => file(w, {}, "alice"), "DOCKET_NOT_A_PARTICIPANT");
});

test("R1 the form checks, each refused with nothing written, each with its control", () => {
  const w = seeded();
  refusedThenAccepted(w, () => file(w, { edition: 2 }), () => file(w, { edition: 1 }), "DOCKET_NO_EDITION");
  for (const edition of [null, "one", 0, 1.5]) rowOk(file(w, { edition }), "DOCKET_NO_EDITION");
  for (const from of [null, "nobody", {}, { kind: "press" }])
    refusedThenAccepted(w, () => file(w, { from }), () => file(w), "DOCKET_NOT_ATTRIBUTED");
  refusedThenAccepted(w, () => file(w, { from: { kind: "subject", entity: OTHER_SUBJECT } }), () => file(w), "DOCKET_NOT_THE_SUBJECT");
  rowOk(file(w, { from: { kind: "subject" } }), "DOCKET_NOT_THE_SUBJECT");
  refusedThenAccepted(w, () => file(w, { from: { kind: "holder", grant: 1 } }), () => file(w), "DOCKET_NO_STANDING");
  for (const name of ["", "   ", "x".repeat(201), "two\nlines", null])
    rowOk(file(w, { kind: "reaction", from: { kind: "other", name } }), "DOCKET_NOT_ATTRIBUTED");
  assert.equal(file(w, { kind: "reaction", from: { kind: "other", name: "x".repeat(200) } }).ok, true, "a name at the bound");
  refusedThenAccepted(w, () => file(w, { capture: "f".repeat(64) }), () => file(w), "DOCKET_NO_CAPTURE");
  const unlocated = w.capture("unlocated", { held: false });
  refusedThenAccepted(w, () => file(w, { capture: unlocated.sha }), () => file(w, { capture: w.cap.sha }), "DOCKET_NO_CAPTURE");
  rowOk(file(w, { capture: "not-a-sha" }), "DOCKET_NO_CAPTURE");
  refusedThenAccepted(w, () => file(w, { kind: "rumour" }), () => file(w, { kind: "statement" }), "DOCKET_KIND_UNKNOWN");
  /* the kind fits who it is from: a response or a statement from the subject or a holder, a reaction from anyone else,
     an outcome from anyone */
  rowOk(file(w, { kind: "reaction" }), "DOCKET_KIND_UNKNOWN");
  rowOk(file(w, { kind: "response", from: { kind: "other", name: "A columnist" } }), "DOCKET_KIND_UNKNOWN");
  rowOk(file(w, { kind: "statement", from: { kind: "other", name: "A columnist" } }), "DOCKET_KIND_UNKNOWN");
  assert.equal(file(w, { kind: "outcome", from: { kind: "other", name: "The council" } }).ok, true);
  assert.equal(file(w, { kind: "outcome" }).ok, true);
  for (const x of [{ proposed: "maybe" }, { proposed: null }, { reason: "" }, { reason: "  " }, { reason: "r".repeat(2001) }, { reason: null }])
    refusedThenAccepted(w, () => file(w, x), () => file(w, { proposed: "record", reason: "r".repeat(2000) }), "DOCKET_NO_REASON");
  for (const proposed of ["record", "public", "both"]) assert.equal(file(w, { proposed }).ok, true);
});

test("R1 refusals come in R1's order: a call breaking several conditions is answered by the earliest", () => {
  const w = seeded();
  const all = { edition: 9, from: null, capture: "x", kind: "rumour", proposed: "maybe", reason: "" };
  rowOk(file(w, { ...all, author: MACHINE, viewer: MACHINE }), "MACHINE_CANNOT_FILE_DOCKET");
  assert.equal(file(w, { ...all, case: "CASE-2026-9999" }).reason, "NO_SUCH_CASE");
  rowOk(file(w, { ...all, author: V("dave"), viewer: V("bob") }), "DOCKET_NOT_A_PARTICIPANT");
  const steps = [["DOCKET_NO_EDITION", { edition: 1 }], ["DOCKET_NOT_ATTRIBUTED", { from: { kind: "subject", entity: OTHER_SUBJECT } }],
                 ["DOCKET_NOT_THE_SUBJECT", { from: { kind: "subject", entity: SUBJECT } }], ["DOCKET_NO_CAPTURE", { capture: w.cap.sha }],
                 ["DOCKET_KIND_UNKNOWN", { kind: "response" }], ["DOCKET_NO_REASON", { proposed: "both", reason: "why" }]];
  let x = { ...all };
  for (const [code, fix] of steps) { rowOk(file(w, x), code); x = { ...x, ...fix }; }
  assert.equal(file(w, x).ok, true);
});

test("R1 the entry is recorded with its instant, author, from, capture, proposal, reason, contests and found_by", () => {
  const w = seeded();
  const pasted = file(w, { contests: true });
  const watched = file(w, { kind: "statement", capture: w.swept.sha, contests: "false" });
  assert.equal(pasted.ok, true);
  assert.equal(pasted.found_by, "paste");
  assert.equal(watched.found_by, "watch", "a capture its register filed with a sweep origin (acquisition R21) is found by a watch");
  assert.ok(FOUND_BY.includes(pasted.found_by) && FOUND_BY.includes(watched.found_by));
  assert.match(pasted.entry, /^DKT-2026-\d{4}$/);
  assert.equal(pasted.filed_at, "2026-10-01T12:00:00Z");
  const d = w.docket.docketOf({ case: CASE, viewer: V("alice") });
  const rec = (id) => d.entries.find((e) => e.entry === id);
  assert.deepEqual({ ...rec(pasted.entry), prompts: undefined }, {
    shelf: "record", at: "2026-10-01T12:00:00Z", entry: pasted.entry, edition: 1, kind: "response",
    from: { kind: "subject", entity: SUBJECT }, capture: w.cap.sha, proposed: "both", reason: RESPONSE(w).reason,
    found_by: "paste", contests: true, answers: null, author: "bob", filed_at: "2026-10-01T12:00:00Z", state: "pending",
    pressure: null, prompts: undefined });
  assert.equal(rec(watched.entry).contests, false, "contests is true only when the member says so");
  assert.equal(rec(watched.entry).found_by, "watch");
});

test("R13 a contesting filing is told to reevaluation once, after it commits; a throw there never undoes it", () => {
  const w = seeded();
  const plain = file(w);
  assert.equal(w.reeval.acted.length, 0, "a filing that does not contest tells nothing");
  const c = file(w, { contests: true });
  assert.deepEqual(w.reeval.acted, [{ kind: "contested", case: CASE, entry: c.entry }]);
  /* told after the commit: the entry is already readable through the registration when docketActed runs */
  const reg = w.reeval.registrations[0].fns;
  assert.deepEqual(reg.contested({}).contested.map((x) => x.entry), [c.entry]);
  w.reeval.throws = true;
  const thrown = file(w, { contests: true });
  assert.equal(thrown.ok, true, "a throw in reevaluation never refuses the filing");
  assert.equal(w.reeval.acted.length, 2);
  assert.ok(w.docket.docketOf({ case: CASE, viewer: V("bob") }).entries.some((e) => e.entry === thrown.entry), "nor undoes it");
  assert.ok(plain.ok);
});

test("R2 a pressure mark: refusals in order, each writing nothing; appended once, never rewriting the entry", () => {
  const w = seeded();
  const e = file(w).entry;
  const mark = (x = {}, who = "bob") => w.docket.docketPressure({ entry: e, pressure: { kind: "legal", note: "A letter from counsel." },
                                                                author: V(who), viewer: V(who), ...x });
  for (const who of [MACHINE, "token:operator", null])
    refusedThenAccepted(w, () => mark({ author: who, viewer: who }), () => ({ ok: true }), "MACHINE_CANNOT_MARK_DOCKET_PRESSURE");
  /* N526 (DEC-49, one code one row): the refusal is this module's own code and row, never action-grammar's
     `MACHINE_CANNOT_MARK_PRESSURE` (C-117.14, `actions`' own), which no row here holds */
  const machine = mark({ author: MACHINE, viewer: MACHINE });
  assert.deepEqual([machine.reason, machine.code, machine.check], ["MACHINE_CANNOT_MARK_DOCKET_PRESSURE", "MACHINE_CANNOT_MARK_DOCKET_PRESSURE", "C-129.10"]);
  assert.equal(Object.hasOwn(DOCKET_CHECKS, "MACHINE_CANNOT_MARK_PRESSURE"), false, "action-grammar's code has no row here");
  assert.ok(!Object.values(DOCKET_CHECKS).some((r) => r.check === "C-117.14"), "nor its check");
  const strip = ({ entry: _e, ...x }) => x;
  const absent = mark({ entry: "DKT-2026-9999" });
  const unseen = mark({}, "dave");
  rowOk(absent, "NO_SUCH_DOCKET_ENTRY");
  rowOk(unseen, "NO_SUCH_DOCKET_ENTRY");
  assert.deepEqual(strip(absent), strip(unseen), "absent and unseen answer alike");
  for (const pressure of [null, { kind: "rude" }, { kind: "legal", note: "n".repeat(501) }, "legal"])
    refusedThenAccepted(w, () => mark({ pressure }), () => ({ ok: true }), "PRESSURE_REFUSED");
  const before = w.rows(`SELECT * FROM docket_record`);
  const ok = mark({ pressure: { kind: "retaliation", note: "n".repeat(500) } });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.pressure, { kind: "retaliation", note: "n".repeat(500), at: "2026-10-01T12:00:00Z" });
  assert.deepEqual(w.rows(`SELECT * FROM docket_record`), before, "the entry itself is never rewritten");
  refusedThenAccepted(w, () => mark(), () => ({ ok: true }), "PRESSURE_MARKED");
  for (const kind of PRESSURE_KINDS) assert.equal(w.docket.docketPressure({ entry: file(w).entry, pressure: { kind }, author: V("alice"), viewer: V("alice") }).ok, true);
  const d = w.docket.docketOf({ case: CASE, viewer: V("bob") });
  assert.deepEqual(d.entries.find((x) => x.entry === e).pressure, ok.pressure);
});

test("R11 a record entry is taken back by a later record act with a reason, and reads taken-back; nothing is deleted", () => {
  const w = seeded();
  const e = file(w).entry;
  const back = (x = {}, who = "bob") => w.docket.docketFile({ case: CASE, takesBack: e, reason: "Filed against the wrong case.",
                                                             author: V(who), viewer: V(who), ...x });
  rowOk(back({ author: MACHINE, viewer: MACHINE }), "MACHINE_CANNOT_FILE_DOCKET");
  assert.equal(back({}, "dave").reason, "NO_SUCH_CASE");
  rowOk(back({ author: V("dave"), viewer: V("bob") }), "DOCKET_NOT_A_PARTICIPANT");
  refusedThenAccepted(w, () => back({ takesBack: "DKT-2026-9999" }), () => ({ ok: true }), "NO_SUCH_DOCKET_ENTRY");
  for (const reason of ["", null, "r".repeat(2001)]) refusedThenAccepted(w, () => back({ reason }), () => ({ ok: true }), "DOCKET_NO_REASON");
  const r = back();
  assert.equal(r.ok, true);
  assert.equal(r.state, "taken-back");
  refusedThenAccepted(w, () => back(), () => ({ ok: true }), "DOCKET_ENTRY_SETTLED");
  const d = w.docket.docketOf({ case: CASE, viewer: V("alice") });
  const x = d.entries.find((y) => y.entry === e);
  assert.equal(x.state, "taken-back");
  assert.deepEqual(x.taken_back, { reason: "Filed against the wrong case.", at: "2026-10-01T12:00:00Z" });
  assert.equal(w.count("docket_record"), 1, "the entry stays");
});

test("R11 a placed record entry is taken back only in public; one taken back is not contested any more (R13)", async () => {
  const w = seeded();
  const f = file(w, { contests: true });
  await post(w, { kind: "response", entry: f.entry });
  rowOk(w.docket.docketFile({ case: CASE, takesBack: f.entry, reason: "r", author: V("bob"), viewer: V("bob") }), "DOCKET_ENTRY_SETTLED");
  const g = file(w, { contests: true });
  const reg = w.reeval.registrations[0].fns;
  assert.deepEqual(reg.contested({}).contested.map((x) => x.entry).sort(), [f.entry, g.entry].sort());
  w.docket.docketFile({ case: CASE, takesBack: g.entry, reason: "Withdrawn by the member.", author: V("bob"), viewer: V("bob") });
  assert.deepEqual(reg.contested({}).contested.map((x) => x.entry), [f.entry]);
});

test("R18 only a member files: no machine, AI run, operator token or administrator's class files, marks or takes back", () => {
  const w = seeded();
  const e = file(w).entry;
  for (const who of [MACHINE, "class:daemon", "token:operator", "class:admin", "ai:run-1"]) {
    const f = file(w, { author: who, viewer: V("bob") });
    assert.equal(f.ok, false);
    assert.equal(f.reason, "MACHINE_CANNOT_FILE_DOCKET", `${who} files nothing`);
    assert.equal(w.docket.docketPressure({ entry: e, pressure: { kind: "other" }, author: who, viewer: V("bob") }).reason,
                 "MACHINE_CANNOT_MARK_DOCKET_PRESSURE");
    assert.equal(w.docket.docketFile({ case: CASE, takesBack: e, reason: "r", author: who, viewer: V("bob") }).reason,
                 "MACHINE_CANNOT_FILE_DOCKET");
  }
  assert.equal(w.count("docket_record"), 1);
  assert.equal(w.count("docket_marks"), 0);
  /* a world with no group slug still files to the record: the slug is a public entry's (R4) */
  const bare = world({ slug: null });
  for (const m of ["alice", "bob"]) bare.member(m);
  bare.P = bare.project("budget", "alice");
  bare.subjects.set("INQ-2026-0001-x", SUBJECT);
  bare.publish(bare.P, CASE, 1, [{ id: "INQ-2026-0001-x", role: "load_bearing" }]);
  bare.cap = bare.capture("reply");
  assert.equal(file(bare, {}, "alice").ok, true);
});

/* action-holds' T45 requirements at their interface (N858 D10; Actions D10; `BIO_Action_v0_2.md` §4 rules 1, 10, 12):
   R2's places (an action, an entry of one, a project, or a case naming its project) and `from` (a pressure mark, a
   pressure record, a docket `legal` mark, a counsel matter); R11 the hold notice a member sent, recording nothing of any
   member's receipt or compliance; R12 pressure recorded outside any action, creating none, and `pressureFor`; R13 the
   machine fence over every act, the tables and their purge. Each refusal with its control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, received } from "./fixture.mjs";
import * as holds from "../../../src/action-holds/index.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";
import { correspondEntryRefusal } from "../../../src/action-records/index.mjs";
import { docketEntryRead } from "../docket/fixtures.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", I = "INFO-2026-0001-d";
const ALICE = V("alice"), BOB = V("bob"), CAROL = V("carol");
const ABSENT = "PROJ-2026-0404-absent";
const NO_ENTRY = docketEntryRead().absent;
const MARK_CODES = { machine: "MACHINE_CANNOT_MARK_PRESSURE", shape: "PRESSURE_REFUSED" };

/* P alice's hidden project, D alice's discoverable one, Q carol's hidden one; A in P with two received entries (the
   first marked legal), B in no project with one; a case CASE-1 owned by P and CASE-3 by Q (publication's `cases`, its
   R40 read contract). */
function ground() {
  const w = world();
  const P = w.project("alice"), D = w.project("alice", "discoverable"), Q = w.project("carol");
  w.action(A, [`project: ${P}`, ...received(2)]);
  w.action(B, received(1));
  w.mark(A, 0, "legal");
  w.st.db.exec(`CREATE TABLE IF NOT EXISTS cases (case_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, opened TEXT NOT NULL)`);
  w.st.db.exec(`INSERT INTO cases VALUES ('CASE-2026-0001', '${P}', 't'), ('CASE-2026-0003', '${Q}', 't')`);
  const H = (x) => w.h.actionHold({ hold: "in_place", reason: "preserving", viewer: ALICE, author: ALICE, ...x });
  return { w, P, D, Q, H };
}
const count = (w, t) => w.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n;

test("R2 places: an action, an entry of one, a project or a case's project, each its own place with its own hold; exactly one place, else HOLD_PLACE_REFUSED after NO_TARGET; a hold on an action with no pressure mark lands", () => {
  const { w, P, D, Q, H } = ground();
  /* NO_TARGET when nothing names a place; HOLD_PLACE_REFUSED after it, for two places or a position with no action */
  const none = H({});
  assert.equal(none.reason, "NO_TARGET");
  assert.equal(H({ hold: "kept", target: "", project: "" }).reason, "NO_TARGET", "NO_TARGET before HOLD_REFUSED");
  for (const x of [{ target: A, project: P }, { target: A, case: "CASE-2026-0001" }, { project: P, case: "CASE-2026-0001" },
                   { target: A, ord: 0, project: P }, { project: P, ord: 0 }, { case: "CASE-2026-0001", ord: 1 }])
    assert.equal(H({ ...x, hold: "kept" }).reason, "HOLD_PLACE_REFUSED", `${JSON.stringify(x)}: before HOLD_REFUSED`);
  const two = H({ target: A, project: P });
  assert.deepEqual([two.code, two.check], ["HOLD_PLACE_REFUSED", "C-149.8"]);
  assert.equal(count(w, "action_holds"), 0, "no refusal writes");
  /* the control: a hold on an action with no pressure mark lands, at the whole action */
  const whole = H({ target: B });
  assert.deepEqual(whole, { ok: true, target: B, ord: null, hold: "in_place", reason: "preserving", by: ALICE,
                            at: "2026-09-28T12:00:00Z", projects: [] });
  /* an entry with no mark, the whole action, a project, a case: four places, each with its own hold */
  assert.deepEqual(H({ target: A, ord: 1 }).projects, [P], "an entry's hold covers its action's project");
  assert.deepEqual(H({ target: A }).projects, [P], "so does the whole action's");
  const proj = H({ project: D, projects: [P] });
  assert.deepEqual([proj.ok, proj.project, proj.projects, "target" in proj], [true, D, [D, P].sort(), false]);
  const viaCase = H({ case: "CASE-2026-0001" });
  assert.deepEqual([viaCase.ok, viaCase.project, viaCase.case, viaCase.projects], [true, P, "CASE-2026-0001", [P]]);
  assert.deepEqual(w.h.holdsOf({ project: P, viewer: ALICE }).holds.map((h) => h.seq), [1], "the case's hold is its project's place");
  /* each place's latest statement is its own: releasing the whole action leaves its entry's hold in place */
  assert.equal(w.h.actionHoldRelease({ target: A, reason: "done", viewer: ALICE, author: ALICE }).ok, true);
  assert.deepEqual([w.h.holdsOf({ target: A, viewer: ALICE }).hold, w.h.holdsOf({ target: A, ord: 1, viewer: ALICE }).hold],
    ["released", "in_place"]);
  assert.deepEqual(w.h.projectHolds({ projects: [P, D], viewer: ALICE }).projects.map((p) => p.held), [true, true]);
  /* a project place the author may not name is refused as a named project is; a case likewise, as an absent project */
  assert.deepEqual([H({ project: Q }).reason, H({ project: ABSENT }).reason, H({ project: "not-a-project" }).reason],
    ["NO_SUCH_PROJECT", "NO_SUCH_PROJECT", "NO_SUCH_PROJECT"]);
  const bobs = w.h.actionHold({ project: D, hold: "in_place", reason: "x", viewer: BOB, author: BOB });
  assert.deepEqual([bobs.reason, bobs.check], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1"]);
  const hiddenCase = H({ case: "CASE-2026-0003" }), absentCase = H({ case: "CASE-2026-0404" });
  assert.deepEqual([hiddenCase.reason, hiddenCase.project, Object.keys(hiddenCase)],
    [absentCase.reason, "CASE-2026-0003", Object.keys(absentCase)], "a case one may not see is answered as an absent one");
  /* the release and the preview take a place as the hold does */
  assert.deepEqual(w.h.holdReleasePreview({ project: D, viewer: ALICE }), { ok: true, project: D, hold: "in_place",
    restarts: [D], out_of_view: false }, "P stays held by the entry's and the case's holds");
  assert.deepEqual(w.h.actionHoldRelease({ case: "CASE-2026-0001", reason: "done", viewer: ALICE, author: ALICE }).restarted, []);
  assert.deepEqual(w.h.actionHoldRelease({ project: D, reason: "done", viewer: ALICE, author: ALICE }).restarted, [D]);
  assert.equal(w.h.actionHoldRelease({ project: D, reason: "again", viewer: ALICE, author: ALICE }).reason, "HOLD_ALREADY_RELEASED");
  /* the op takes each place */
  const op = (q, body) => holds.actionHoldsOps(w.h, new URL(`https://x/?viewer=${ALICE}&author=${ALICE}&${q}`), body);
  assert.equal(op(`project=${D}&hold=in_place&reason=r`, null).actionhold().project, D);
  assert.equal(op("", { case: "CASE-2026-0001", hold: "in_place", reason: "r" }).actionhold().project, P);
  assert.equal(op(`project=${D}`, null).actionholdpreview().hold, "in_place");
  assert.equal(op(`project=${D}&reason=r`, null).actionholdrelease().hold, "released");
});

test("R2 from: a pressure mark, a pressure record, a docket legal mark or a counsel matter, standing at the place, recorded with the statement; anything else HOLD_FROM_REFUSED after the place's own refusals", () => {
  const { w, P, D, H } = ground();
  const docket = {
    docketPressureOf: ({ entry, viewer }) => entry === "DKT-1" && w.membership.sight(P, viewer) === "full"
      ? { ok: true, entry, case: "CASE-2026-0001", project: P, kind: "legal", note: "n", at: "t" }
      : entry === "DKT-2" ? { ok: true, entry, case: "CASE-2026-0001", project: P, kind: "retaliation", note: "n", at: "t" }
      : entry === "DKT-3" ? { ok: true, entry, pressure: null }
      : NO_ENTRY,
    docketPressureMarks: () => ({ ok: true, marks: [], cursor: null }),
  };
  const h = holds.actionHoldsOf({ storage: w.st }, { record: w.record, membership: w.membership, docket, doorbell: null,
                                                     ratification: null, now: () => w.clock.ms });
  const X = (x) => h.actionHold({ hold: "in_place", reason: "preserving", viewer: ALICE, author: ALICE, ...x });
  const rec = h.pressureRecord({ project: P, pressure: { kind: "legal", note: "a letter" }, account: "by post", at: "2026-09-20",
                                 viewer: ALICE, author: ALICE }).pressure;
  /* each form lands at its place, and the statement and the read carry it */
  const fromMark = X({ target: A, ord: 0, from: { mark: { target: A, ord: 0 } } });
  assert.deepEqual([fromMark.ok, fromMark.from], [true, { mark: { target: A, ord: 0 } }]);
  assert.deepEqual(X({ target: A, from: JSON.stringify({ mark: { target: A, ord: "0" } }) }).from, { mark: { target: A, ord: 0 } },
    "the whole action, from its entry's mark, as JSON");
  assert.deepEqual(X({ project: P, from: { pressure: rec } }).from, { pressure: rec });
  assert.deepEqual(X({ project: P, from: { docket_entry: "DKT-1" } }).from, { docket_entry: "DKT-1" });
  assert.deepEqual(h.holdsOf({ project: P, viewer: ALICE }).holds.map((s) => s.from),
    [{ pressure: rec }, { docket_entry: "DKT-1" }]);
  /* a counsel matter: the project itself, once its scope is counsel_matter (project-roster R21, R23) */
  assert.equal(X({ project: P, from: { counsel_matter: P } }).reason, "HOLD_FROM_REFUSED", "scope none: not a counsel matter");
  h.roster.migrate();                                  /* its tables, as the store's boot migrates them */
  const scoped = h.roster.projectScopeSet({ projectId: P, scope: "counsel_matter", reason: "counsel engaged", by: "alice", viewer: ALICE });
  assert.equal(scoped.ok, true, JSON.stringify(scoped));
  assert.deepEqual(X({ project: P, from: { counsel_matter: P } }).from, { counsel_matter: P });
  /* refused: no such form, nothing there, or not standing at the place */
  for (const from of [{ nothing: 1 }, "not json", [1], { mark: { target: A, ord: 0 }, pressure: rec },
                      { mark: { target: A, ord: 1 } }, { mark: { target: B, ord: 0 } }, { mark: { target: A, ord: "x" } },
                      { pressure: `${P}#pressure/9` }, { pressure: `${D}#pressure/1` }, { pressure: "nonsense" },
                      { docket_entry: "DKT-2" }, { docket_entry: "DKT-3" }, { docket_entry: "DKT-404" }, { docket_entry: "" },
                      { counsel_matter: D }])
    assert.equal(X({ project: P, from }).reason, "HOLD_FROM_REFUSED", JSON.stringify(from));
  assert.equal(X({ target: A, ord: 1, from: { mark: { target: A, ord: 0 } } }).reason, "HOLD_FROM_REFUSED", "another entry's mark");
  assert.equal(X({ target: A, from: { pressure: rec } }).reason, "HOLD_FROM_REFUSED", "a record stands at a project, not an action");
  assert.equal(X({ project: D, from: { docket_entry: "DKT-1" } }).reason, "HOLD_FROM_REFUSED", "the mark's project is P");
  const bobs = h.actionHold({ project: D, from: { docket_entry: "DKT-1" }, hold: "in_place", reason: "x", viewer: BOB, author: BOB });
  assert.equal(bobs.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT", "the place's own refusals come first");
  const r = X({ project: P, from: { nothing: 1 } });
  assert.deepEqual([r.code, r.check, r.translation], ["HOLD_FROM_REFUSED", "C-149.9", holds.ACTION_HOLDS_CHECKS.HOLD_FROM_REFUSED.translation]);
  /* a docket that cannot be read answers its own refusal, and nothing is written */
  const n = count(w, "action_holds");
  const broken = holds.actionHoldsOf({ storage: w.st, z: 1 }, { record: w.record, membership: w.membership, doorbell: null,
    ratification: null, docket: { docketPressureOf: () => ({ ok: false, reason: "DOCKET_UNREADABLE" }) } });
  assert.equal(broken.actionHold({ project: P, from: { docket_entry: "DKT-1" }, hold: "in_place", reason: "x", viewer: ALICE,
                                   author: ALICE }).reason, "DOCKET_UNREADABLE");
  assert.equal(count(w, "action_holds"), n);
  /* the op carries `from` in the body or the query */
  const op = holds.actionHoldsOps(h, new URL(`https://x/?project=${P}&hold=in_place&reason=r&viewer=${ALICE}&author=${ALICE}`),
    { from: { docket_entry: "DKT-1" } }).actionhold();
  assert.deepEqual(op.from, { docket_entry: "DKT-1" });
});

test("R11 holdNoticeSent: refusals in R11's order (C-149.10, .11); a hold in place takes the record, held as bytes or her account; a released one is refused; nothing about any recipient is recorded or answered", () => {
  const { w, P, D, Q, H } = ground();
  const s = w.doc(I);
  H({ target: A, ord: 0 });
  H({ project: D });
  w.h.actionHoldRelease({ project: D, reason: "done", viewer: ALICE, author: ALICE });
  const N = (x) => w.h.holdNoticeSent({ place: { target: A, ord: 0 }, at: "2026-09-29", medium: "email", account: "I emailed all members",
                                        viewer: ALICE, author: ALICE, ...x });
  /* each refusal, with everything after it wrong too */
  const worse = { place: { project: Q }, at: "2026-02-31", artifactSha: s };
  assert.deepEqual([N({ author: MACHINE, ...worse }), N({ author: "", ...worse }), N({ ...worse, place: {} }),
    N({ ...worse, place: { target: A, project: P } }), N({ ...worse, place: { target: "ACTN-2026-0404-x" } }),
    N({ ...worse, place: { target: I } }), N({ ...worse, place: { target: A, ord: 9 } }), N({ ...worse }),
    N({ ...worse, place: { project: D } }), N({ ...worse, place: { target: A } }), N({ ...worse, place: { target: A, ord: 0 } }),
    N({ artifactSha: s }), N({ account: "" })].map((r) => r.reason),
    ["MACHINE_CANNOT_SEND", "MACHINE_CANNOT_SEND", "NO_TARGET", "HOLD_PLACE_REFUSED", "NO_SUCH_BUNDLE", "NOT_AN_ACTION",
     "HOLD_PLACE_REFUSED", "NO_SUCH_PROJECT", "HOLD_NOT_IN_PLACE", "HOLD_NOT_IN_PLACE", "BAD_DATE", "CAPTURE_AND_TESTIMONY",
     "NEITHER_CAPTURE_NOR_TESTIMONY"]);
  const m = N({ author: MACHINE }), released = N({ place: { project: D } }), never = N({ place: { target: A } });
  assert.deepEqual([m.code, m.check], ["MACHINE_CANNOT_SEND", "C-149.10"]);
  assert.deepEqual([released.check, released.project, released.detail], ["C-149.11", D, never.detail], "released and never placed: one answer");
  assert.equal(holds.ACTION_HOLDS_CHECKS.HOLD_NOT_IN_PLACE.where, "src/action-holds/index.mjs holdNotInPlace > is-hold-not-in-place");
  for (const [x, code] of [[{ at: "" }, "BAD_DATE"], [{ at: "2026-9-29" }, "BAD_DATE"], [{ account: "a\nb" }, "BAD_ACCOUNT"],
                           [{ medium: "x".repeat(501) }, "BAD_MEDIUM"], [{ account: "", artifactSha: "abc" }, "BAD_SHA"],
                           [{ account: "", artifactSha: "f".repeat(64) }, "UNREGISTERED_ARTIFACT"]])
    assert.equal(N(x).reason, code, JSON.stringify(x));
  assert.equal(N({ at: "" }).check, "C-33.6", "the date's row is action-grammar's");
  assert.equal(count(w, "hold_notices"), 0, "no refusal writes");
  /* a hold in place takes the record: as her account, and as the bytes sent */
  const one = N({});
  assert.deepEqual(one, { ok: true, target: A, ord: 0, seq: 1, at: "2026-09-29", medium: "email", held_as: "testimony",
                          account: "I emailed all members", by: ALICE, recorded_at: "2026-09-28T12:00:00Z", weight: "single" });
  const two = N({ account: "", artifactSha: `sha256:${s.toUpperCase()}`, medium: "" });
  assert.deepEqual([two.ok, two.seq, two.held_as, two.artifact_sha, two.medium], [true, 2, "capture", s, null]);
  const viaCase = w.h.holdNoticeSent({ place: JSON.stringify({ case: "CASE-2026-0001" }), at: "2026-09-29", account: "posted",
                                       viewer: ALICE, author: ALICE });
  assert.equal(viaCase.reason, "HOLD_NOT_IN_PLACE", "the case's project place holds nothing yet");
  /* rule 10: nothing of any recipient, read, acknowledgement or compliance, in the record or any read */
  const cols = w.rows(`PRAGMA table_info(hold_notices)`).map((c) => c.name);
  for (const c of cols) assert.doesNotMatch(c, /recipient|read|ack|compl|to_|member/i, c);
  const read = w.h.holdsOf({ target: A, ord: 0, viewer: ALICE });
  assert.deepEqual(read.notices.map((n) => Object.keys(n).sort()), [["account", "at", "by", "held_as", "medium", "recorded_at", "seq"],
    ["artifact_sha", "at", "by", "held_as", "medium", "recorded_at", "seq"]]);
  assert.doesNotMatch(JSON.stringify(read), /recipient|acknowledg|complied|compliance/i);
  /* the exported minter answers the same row wherever it is called (filings R47) */
  assert.deepEqual(holds.holdNotInPlace({ project: D }), released);
  assert.deepEqual(Object.keys(holds.holdNotInPlace(null)).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
  assert.doesNotThrow(() => holds.holdNotInPlace(new Proxy({}, { get() { throw new Error("no"); } })));
  /* the op, with the stamps */
  const op = (q, body) => holds.actionHoldsOps(w.h, new URL(`https://x/?${q}`), body).holdnoticesent();
  assert.equal(op(`viewer=${ALICE}&author=${MACHINE}`, { place: { target: A, ord: 0 }, at: "2026-09-29", account: "a", author: ALICE }).reason,
    "MACHINE_CANNOT_SEND", "the author is the stamp, never the body's");
  assert.equal(op(`viewer=${ALICE}&author=${ALICE}&at=2026-09-30&account=again`, { place: { target: A, ord: 0 } }).seq, 3);
});

test("R12 pressureRecord: refusals in R12's order; a record lands in a project the member sees at FULL with no action created; pressureFor lists marks and records together, each with where it arrived, paged", () => {
  const { w, P, D, Q } = ground();
  const s = w.doc(I);
  const R = (x) => w.h.pressureRecord({ project: P, pressure: { kind: "legal", note: "a threatening letter" }, account: "it came by post",
                                        at: "2026-09-20", viewer: ALICE, author: ALICE, ...x });
  const worse = { pressure: { kind: "x" }, project: Q, at: "nope", artifactSha: s };
  assert.deepEqual([R({ author: MACHINE, ...worse }), R({ author: "", ...worse }), R({ ...worse }), R({ ...worse, pressure: undefined }),
    R({ ...worse, pressure: { kind: "legal", note: "n" } }), R({ ...worse, pressure: { kind: "legal", note: "n" }, project: ABSENT }),
    R({ at: "nope", artifactSha: s }), R({ artifactSha: s }), R({ account: "" })].map((r) => r.reason),
    /* the other modules' codes are read from the producers that mint them (membership's `noSuchProject`; action-records'
       R16 site, `correspondEntryRefusal`), never hand-listed (K3268) */
    [MARK_CODES.machine, MARK_CODES.machine, MARK_CODES.shape, MARK_CODES.shape, noSuchProject(Q).reason, noSuchProject(ABSENT).reason,
     correspondEntryRefusal({ at: "nope", account: "a" }, {}).reason,
     correspondEntryRefusal({ at: "2026-09-20", artifactSha: s, account: "a" }, {}).reason,
     correspondEntryRefusal({ at: "2026-09-20" }, {}).reason]);
  assert.equal(w.h.pressureRecord({ project: D, pressure: { kind: "legal", note: "n" }, account: "a", at: "2026-09-20", viewer: BOB,
                                    author: BOB }).reason, "NO_SUCH_PROJECT", "a project seen only at EXISTENCE is answered as absent");
  assert.equal(R({ pressure: { kind: "legal", note: 'a"b' } }).reason, "PRESSURE_REFUSED");
  assert.equal(count(w, "pressure_records"), 0, "no refusal writes");
  /* the control: a record lands, creating no action */
  const actions = () => w.rows(`SELECT COUNT(*) AS n FROM bundles WHERE object_type='action'`)[0].n;
  const before = actions();
  const one = R({});
  assert.deepEqual(one, { ok: true, pressure: `${P}#pressure/1`, project: P, kind: "legal", note: "a threatening letter",
                          at: "2026-09-20", held_as: "testimony", account: "it came by post", by: ALICE,
                          recorded_at: "2026-09-28T12:00:00Z", weight: "single" });
  const two = R({ pressure: { kind: "discrediting", note: "a post" }, account: "", artifactSha: s });
  assert.deepEqual([two.pressure, two.held_as, two.artifact_sha], [`${P}#pressure/2`, "capture", s]);
  assert.equal(actions(), before, "no action is created to the sender");
  /* pressureFor: marks and records together, each with where it arrived */
  w.mark(A, 1, "other", ALICE, "a call");
  const all = w.h.pressureFor({ viewer: ALICE });
  assert.deepEqual(all.items.map((x) => [x.arrived, x.kind, x.project]), [
    [{ action: A, ord: 0 }, "legal", P], [{ action: A, ord: 1 }, "other", P],
    [{ pressure: `${P}#pressure/1` }, "legal", P], [{ pressure: `${P}#pressure/2` }, "discrediting", P]]);
  assert.deepEqual(w.h.pressureFor({ project: P, viewer: ALICE }).items.length, 4);
  assert.deepEqual(w.h.pressureFor({ action: A, viewer: ALICE }).items.map((x) => x.arrived.ord), [0, 1], "an action's marks alone");
  assert.deepEqual(w.h.pressureFor({ project: D, viewer: ALICE }).items, []);
  assert.equal(w.h.pressureFor({ project: Q, viewer: ALICE }).reason, "NO_SUCH_PROJECT");
  assert.deepEqual(w.h.pressureFor({ viewer: CAROL }).items, [], "carol sees neither the action nor the project");
  const p1 = w.h.pressureFor({ viewer: ALICE, limit: 3 });
  assert.deepEqual([p1.items.length, p1.truncated, p1.cursor], [3, true, `${P}#pressure/1`]);
  assert.deepEqual(w.h.pressureFor({ viewer: ALICE, after: p1.cursor }).items.map((x) => x.arrived), [{ pressure: `${P}#pressure/2` }]);
  assert.deepEqual(w.h.pressureFor({ viewer: ALICE, after: `${A}#0`, limit: 1 }).items.map((x) => x.arrived), [{ action: A, ord: 1 }]);
  /* a legal record may carry a hold (R2's project place, from it), and is no longer due */
  assert.equal(w.h.actionHold({ project: P, from: { pressure: one.pressure }, hold: "in_place", reason: "r", viewer: ALICE,
                                author: ALICE }).ok, true);
  assert.ok(!w.h.holdsDue({ viewer: ALICE }).items.some((x) => x.arrived.pressure));
  /* the op */
  const op = holds.actionHoldsOps(w.h, new URL(`https://x/?project=${P}&at=2026-09-21&account=a%20call&pressure_kind=other&pressure_note=n&viewer=${ALICE}&author=${ALICE}`), null);
  assert.equal(op.pressurerecord().pressure, `${P}#pressure/3`);
});

test("R13 a machine credential never marks pressure, places or releases a hold, records a hold notice or a pressure record; the tables are this module's, keyed and purged; an invisible action or project reads as absent", () => {
  const { w, P, D, H } = ground();
  H({ target: A, ord: 0 });
  for (const who of [MACHINE, "token:cron", "", null]) {
    const as = { viewer: ALICE, author: who };
    assert.deepEqual([
      w.h.actionPressure({ target: A, ord: 1, pressure: { kind: "legal", note: "n" }, ...as }).reason,
      w.h.actionHold({ project: P, hold: "in_place", reason: "r", ...as }).reason,
      w.h.actionHoldRelease({ target: A, ord: 0, reason: "r", ...as }).reason,
      w.h.holdNoticeSent({ place: { target: A, ord: 0 }, at: "2026-09-29", account: "a", ...as }).reason,
      w.h.pressureRecord({ project: P, pressure: { kind: "legal", note: "n" }, account: "a", at: "2026-09-20", ...as }).reason],
      ["MACHINE_CANNOT_MARK_PRESSURE", "MACHINE_CANNOT_SET_HOLD", "MACHINE_CANNOT_SET_HOLD", "MACHINE_CANNOT_SEND",
       "MACHINE_CANNOT_MARK_PRESSURE"], String(who));
  }
  /* the tables, each keyed by bundle_id, declared to purge; a project place's statements and records purge with it */
  assert.deepEqual([...holds.ACTION_HOLDS_TABLES], ["action_pressure", "action_holds", "action_hold_projects", "hold_notices",
                                                    "pressure_records"]);
  for (const t of holds.ACTION_HOLDS_TABLES)
    assert.ok(w.rows(`PRAGMA table_info(${t})`).some((c) => c.name === "bundle_id"), t);
  const declared = Object.fromEntries(w.record.declaredTables().map((d) => [d.name, d]));
  for (const t of holds.ACTION_HOLDS_TABLES) assert.equal(declared[t].purge, "clear", t);
  assert.equal(holds.actionHoldsOwns("hold_notices"), true);
  assert.equal(holds.actionHoldsOwns("correspondence"), false);
  H({ project: D });
  w.h.holdNoticeSent({ place: { project: D }, at: "2026-09-29", account: "told them", viewer: ALICE, author: ALICE });
  w.h.pressureRecord({ project: D, pressure: { kind: "legal", note: "n" }, account: "a", at: "2026-09-20", viewer: ALICE, author: ALICE });
  w.h.actionHoldRelease({ project: D, reason: "done", viewer: ALICE, author: ALICE });
  w.record.purge({ bundleId: D });
  for (const t of ["action_holds", "action_hold_projects", "hold_notices", "pressure_records"])
    assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ${t} WHERE bundle_id=?`, D)[0].n, 0, t);
  /* every read answers an invisible action or project as an absent one */
  for (const [inv, abs] of [[w.h.holdsOf({ target: A, viewer: "nobody" }), w.h.holdsOf({ target: "ACTN-2026-0404-x", viewer: ALICE })],
                            [w.h.holdsOf({ project: P, viewer: CAROL }), w.h.holdsOf({ project: ABSENT, viewer: CAROL })],
                            [w.h.pressureFor({ action: A, viewer: "nobody" }), w.h.pressureFor({ action: "ACTN-2026-0404-x", viewer: ALICE })],
                            [w.h.pressureFor({ project: P, viewer: CAROL }), w.h.pressureFor({ project: ABSENT, viewer: CAROL })]])
    assert.deepEqual([inv.reason, Object.keys(inv).sort(), inv.detail], [abs.reason, Object.keys(abs).sort(), abs.detail]);
  /* no place is named in this module's behaviour or outward text */
  const said = JSON.stringify([holds.ACTION_HOLDS_CHECKS, w.h.holdsOf({ target: A, ord: 0, viewer: ALICE })]);
  assert.doesNotMatch(said, /Oakland|California|Alameda|Port Ellery/);
});

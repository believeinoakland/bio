/* actions' T34 entry at its interface: R68 (N611, K1681) `place()` and `zoneOf`, R12's zone read given to other
   modules; R69 (K1830) the reader of holds over a project registered with `ratification` (its R45), proved against the
   real ratification's `op=publishat` and scheduled publisher; and T34-87 (DEC-149), the member-facing details that called
   the group's Civicsmith "this instance". */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import * as rat from "../ratification/fixture.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c";
const ALICE = V("alice"), BOB = V("bob"), CAROL = V("carol");
const received = (n) => ["correspondence:", ...Array.from({ length: n }, (_, i) =>
  ["  - direction: received", "    at: 2026-09-03", `    account: "reply ${i}"`, "    author: member:alice"]).flat()];
const view = (ids) => combine(ids).view;
/* Everything a read could write: the settings, the holds and the record. */
const state = (w) => JSON.stringify(["settings", "action_holds", "action_hold_projects", "action_pressure", "manifest", "bundles"]
  .map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`)));

/* ---------------------------------------------------------------- R68 */

test("R68 place() answers the active profiles' combined view as they stand at the call, or null when none can be read; it writes nothing and never throws", () => {
  const w = world();
  assert.deepEqual(w.a.place(), view(["test-port-ellery"]));
  /* at the call (K1649): a change of the active profiles is read at the next call, never cached */
  w.record.setSetting("jurisdiction_profiles", ["oakland-alameda"], V("admin"));
  assert.deepEqual(w.a.place(), view(["oakland-alameda"]));
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery", "oakland-alameda"], V("admin"));
  assert.deepEqual(w.a.place(), view(["test-port-ellery", "oakland-alameda"]), "several profiles: their combined view");
  /* none can be read: no profile active, an empty list, a profile that does not combine */
  for (const ids of [[], ["no-such-profile"]]) {
    w.record.setSetting("jurisdiction_profiles", ids, V("admin"));
    assert.equal(w.a.place(), null, JSON.stringify(ids));
  }
  assert.equal(world({ profiles: null }).a.place(), null);
  /* the setting unreadable: null, never a throw */
  const broken = world({ recordAs: (r) => new Proxy(r, { get(t, key) {
    if (key === "getSetting") return () => { throw new Error("storage unavailable"); };
    const v = t[key]; return typeof v === "function" ? v.bind(t) : v;
  } }) });
  assert.doesNotThrow(() => broken.a.place());
  assert.equal(broken.a.place(), null);
  /* writes nothing */
  const x = world();
  const before = state(x);
  for (let i = 0; i < 3; i++) x.a.place();
  assert.equal(state(x), before);
});

test("R68 zoneOf answers the IANA zone a place states (its time_zone's value; a string read as the zone itself), or null when it states none; it never throws", () => {
  assert.equal(typeof actions.zoneOf, "function", "a module-level function");
  assert.equal(actions.zoneOf(view(["test-port-ellery"])), "America/Halifax");
  assert.equal(actions.zoneOf(view(["oakland-alameda"])), "America/Los_Angeles");
  /* two profiles naming different zones: the view withholds it, and none is answered */
  assert.equal(actions.zoneOf(view(["test-port-ellery", "oakland-alameda"])), null);
  assert.equal(actions.zoneOf({ time_zone: { value: " UTC " } }), "UTC");
  assert.equal(actions.zoneOf({ time_zone: "Europe/Lisbon" }), "Europe/Lisbon");
  assert.equal(actions.zoneOf("America/Halifax"), "America/Halifax", "a string is the zone itself");
  assert.equal(actions.zoneOf(" Asia/Tokyo "), "Asia/Tokyo");
  for (const none of [null, undefined, "", "   ", 7, true, [], {}, { time_zone: null }, { time_zone: {} },
                      { time_zone: { value: 7 } }, { time_zone: { value: "  " } }, { counterparties: [] }])
    assert.equal(actions.zoneOf(none), null, JSON.stringify(none) ?? "undefined");
  const hostile = new Proxy({}, { get() { throw new Error("no"); } });
  assert.doesNotThrow(() => actions.zoneOf(hostile));
  assert.equal(actions.zoneOf(hostile), null);
});

test("R68 R12 read through place() and zoneOf, a local day is the office's, never the UTC day; with no profile held every local day is undetermined", () => {
  const at = Date.parse("2026-09-29T02:00:00Z");          /* 23:00 on the 28th in Halifax, the 29th in UTC */
  const w = world();
  assert.equal(actions.localToday(at, actions.zoneOf(w.a.place())), "2026-09-28");
  const md = actionMd(A, [...CP, "action_kind: other", "clock:", '  - text: "t"', '    description: "d"', "    date: 2026-09-28",
    "    basis: s", "    status: pending"]);
  assert.equal(actions.actionFacts(md, at, w.a.place()).clock_overdue, false, "still the 28th where the office is");
  assert.equal(actions.actionFacts(md, at, actions.zoneOf(w.a.place())).clock_overdue, false, "the zone alone reads the same");
  /* the active profiles changed: the next read follows them */
  w.record.setSetting("jurisdiction_profiles", ["oakland-alameda"], V("admin"));
  assert.equal(actions.localToday(at, actions.zoneOf(w.a.place())), "2026-09-28");
  /* none held: undetermined, never the UTC day */
  for (const nz of [world({ profiles: null }), world({ profiles: ["test-port-ellery", "oakland-alameda"] })]) {
    const zone = actions.zoneOf(nz.a.place());
    assert.equal(zone, null);
    assert.equal(actions.localToday(at, zone), null);
    assert.equal(actions.actionFacts(md, at, nz.a.place()).clock_overdue, null);
    assert.equal(nz.reg.facts[0].fn(md, Date.parse("2026-12-01T00:00:00Z")).clock_overdue, null, "retrieval's registered facts too");
  }
});

/* ---------------------------------------------------------------- R69 */

/* Projects, as t27 lays them down: P1 alice's (hidden), P2 alice's (discoverable), P3 carol's (hidden). A sits in P1 and C
   in P3, each with one received entry marked legal pressure; B in no project with one. */
function ground() {
  const w = world();
  let k = 0;
  const proj = (owner, visibility) => {
    const r = w.promotion.promote({ base: null, snapKey: `p${++k}`, author: V(owner), ownerMemberId: owner,
      ...(visibility ? { visibility } : {}),
      files: [{ path: "bundle.md", text: ["---", "object_type: project", "schema: project@1", `title: "Project ${k}"`,
        "current_state: forming", "prior_state: null", 'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"',
        "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n") }],
      meta: { object_type: "project" } });
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.bundleId;
  };
  const P1 = proj("alice"), P2 = proj("alice", "discoverable"), P3 = proj("carol");
  w.action(A, [`project: ${P1}`, ...received(1)]);
  w.action(B, received(1));
  w.action(C, [`project: ${P3}`, ...received(1)], { author: CAROL });
  for (const [id, who] of [[A, ALICE], [B, ALICE], [C, CAROL]])
    assert.equal(w.a.actionPressure({ target: id, ord: 0, pressure: { kind: "legal", note: "a suit" }, viewer: who, author: who }).ok, true);
  const hold = (target, who, extra = {}) =>
    assert.equal(w.a.actionHold({ target, ord: 0, hold: "in_place", reason: "preserving", viewer: who, author: who, ...extra }).ok, true);
  const release = (target, who) =>
    assert.equal(w.a.actionHoldRelease({ target, ord: 0, reason: "the matter closed", viewer: who, author: who }).ok, true);
  return { w, P1, P2, P3, hold, release };
}

test("R69 at start actions registers once with ratification.registerHoldReader a reader holdsOn({project}); a second actionsOf registers nothing", () => {
  const w = world();
  assert.equal(w.reg.holdReaders.length, 1, "registered once");
  assert.equal(typeof w.reg.holdReaders[0].holdsOn, "function");
  assert.equal(actions.actionsOf(w.host), w.a, "the one instance per host");
  assert.equal(w.reg.holdReaders.length, 1, "a second actionsOf registers nothing");
  /* the registered reader is this module's: it answers as holdsOn answers */
  assert.deepEqual(w.reg.holdReaders[0].holdsOn({ project: "PROJ-2026-0001-x" }), { held: false });
  /* a host given no ratification registers none, and starts */
  assert.doesNotThrow(() => world({ deps: { ratification: null } }));
});

test("R69 holdsOn answers R58's answer for one project read as the plane, whatever the viewer: held with since and recorded_by, or false after reading every hold; it names no action, entry or reason", () => {
  const { w, P1, P2, P3, hold, release } = ground();
  const on = (project) => w.reg.holdReaders[0].holdsOn({ project });
  assert.deepEqual([P1, P2, P3].map(on), [{ held: false }, { held: false }, { held: false }], "no hold in place");
  hold(A, ALICE, { projects: [P2] });                  /* covers P1 (A's own) and P2 */
  w.clock.ms += 60000;
  hold(C, CAROL);                                      /* covers P3, which neither alice nor bob may see */
  hold(B, ALICE, { projects: [P1] });                  /* a later statement also covering P1 */
  assert.deepEqual(on(P1), { held: true, since: "2026-09-28T12:00:00Z", recorded_by: ALICE }, "the earliest statement still in place");
  assert.deepEqual(on(P2), { held: true, since: "2026-09-28T12:00:00Z", recorded_by: ALICE });
  assert.deepEqual(on(P3), { held: true, since: "2026-09-28T12:01:00Z", recorded_by: CAROL }, "read as the plane, whatever the viewer");
  assert.deepEqual(w.a.projectHolds({ projects: [P3], viewer: ALICE }).projects[0].held, null, "where a viewer's read says nothing");
  /* R58's answer, for each project a viewer sees at FULL */
  for (const p of [P1, P2]) {
    const { project, ...r58 } = w.a.projectHolds({ projects: [p], viewer: ALICE }).projects[0];
    assert.deepEqual(on(p), r58, project);
  }
  assert.deepEqual(Object.keys(on(P1)).sort(), ["held", "recorded_by", "since"]);
  const all = JSON.stringify([P1, P2, P3].map(on));
  for (const named of [A, B, C, "preserving", "a suit", "#0"]) assert.ok(!all.includes(named), `names no ${named}`);
  /* A's release leaves P1 held by B's statement, since that statement; P2 is no longer held */
  release(A, ALICE);
  assert.deepEqual([on(P1), on(P2)], [{ held: true, since: "2026-09-28T12:01:00Z", recorded_by: ALICE }, { held: false }]);
  release(B, BOB);
  release(C, CAROL);
  assert.deepEqual([P1, P2, P3, "PROJ-2026-0404-absent", "not a project"].map(on), Array(5).fill({ held: false }));
});

test("R69 holdsOn answers null when it cannot complete the read (no project named, the holds unreadable), never false; it writes nothing and never throws", () => {
  const { w, P1, hold } = ground();
  const reader = w.reg.holdReaders[0];
  hold(A, ALICE);
  for (const args of [undefined, null, {}, { project: "" }, { project: "  " }, { project: 7 }, { project: null }, "PROJ"])
    assert.equal(reader.holdsOn(args), null, JSON.stringify(args) ?? "undefined");
  const hostile = new Proxy({}, { get() { throw new Error("no"); } });
  assert.doesNotThrow(() => reader.holdsOn(hostile));
  assert.equal(reader.holdsOn(hostile), null);
  const before = state(w);
  for (let i = 0; i < 3; i++) reader.holdsOn({ project: P1 });
  assert.equal(state(w), before, "writes nothing");
  for (const table of ["action_holds", "action_hold_projects"]) {
    w.st.db.exec(`ALTER TABLE ${table} RENAME TO away`);
    assert.doesNotThrow(() => reader.holdsOn({ project: P1 }));
    assert.equal(reader.holdsOn({ project: P1 }), null, `${table} unreadable: null, never false`);
    w.st.db.exec(`ALTER TABLE away RENAME TO ${table}`);
  }
  assert.equal(reader.holdsOn({ project: P1 }).held, true, "readable again");
});

/* The real ratification (its R40–R45) on its own fixture's host, with a /6 case document alice (the project's owner,
   holding an attesting key) may sign, stored unsigned; publish-schedule's `scheduleEdition` (its R1, N823) and
   publication's `stampsOf` stand-ins, as ratification's own tests set them. `withActions` starts actions on that host,
   registering R69's reader. */
const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-01T00:00:00Z" };
async function signing({ withActions }) {
  const w = rat.world();
  const key = await rat.newKey();
  w.member("alice", { signer: key });
  const P = w.project("Team", "alice");
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const doc = rat.cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] });
  const text = rat.fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body: rat.CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                                 attribution: { reached: [], legacy: [], stated: [], current: [] },
                                 signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  const sig = await rat.signCase(key, CASE, 1, docSha);
  const scheduled = [];
  w.schedule.scheduleEdition = (a) => (scheduled.push(a), { ok: true, case: a.case, edition: a.edition, state: "waiting",
    at: { ...a.at, zone: "America/Halifax" }, publish_at: "2026-10-09T12:30:00.000Z" });
  w.publication.stampsOf = () => ({ ok: true, stamps: [] });
  const at = { date: "2026-10-09", time: "09:30" };
  const body = { caseId: CASE, edition: 1, docSha, sigArmored: sig, attestorKey: key.keyB64, attestorMember: "alice",
                 gateVersion: "g1", deliveredBy: "member:alice", at };
  const a = withActions ? actions.actionsOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion,
    ratification: w.r, retrieval: null, conformance: {}, capture: null, events: null, duties: null,
    content: { captureFor: () => null }, now: () => Date.parse("2026-10-06T12:00:00Z") }) : null;
  const entry = (checked) => ({ case: CASE, edition: 1, doc_sha: docSha, signature: sig, signer: "alice",
    delivered_by: "member:alice", at: { ...at, zone: "America/Halifax" }, publish_at: "2026-10-09T12:30:00.000Z",
    state: "waiting", checked });
  return { w, a, P, body, scheduled, entry };
}

test("R69 against ratification R45: with no reader op=publishat answers SCHEDULE_UNCHECKABLE for want of one; with actions' reader registered it no longer does, and checked records the holds it answers", async () => {
  const none = await signing({ withActions: false });
  const refused = none.w.op("publishat", {}, none.body);
  assert.equal(refused.reason, "SCHEDULE_UNCHECKABLE");
  assert.match(refused.unreadable.map((u) => u.what).join(), /no hold reader is registered/);
  assert.deepEqual(none.scheduled, []);
  /* actions started on the host: its reader is ratification's one reader (a second is refused), and signing schedules */
  const s = await signing({ withActions: true });
  assert.equal(s.w.r.registerHoldReader({ holdsOn: () => ({ held: false }) }).reason, "HOLD_READER_DECLARED", "actions' is held");
  const ok = s.w.op("publishat", {}, s.body);
  assert.deepEqual([ok.ok, ok.state], [true, "waiting"], JSON.stringify(ok));
  assert.equal(s.scheduled.length, 1);
  assert.deepEqual(JSON.parse(s.scheduled[0].checked.holds).project, { held: false }, "no hold over the case's project");
  /* a litigation hold over the case's project, stated through actions: signing records it, as R58 answers it */
  const md = actionMd(A, [...CP, "action_kind: other", `project: ${s.P}`, ...received(1)]);
  assert.equal(s.w.promotion.promote({ bundleId: A, base: null, snapKey: "a1", author: ALICE,
    files: [{ path: "bundle.md", text: md }], meta: { object_type: "action" } }).ok, true);
  assert.equal(s.a.actionPressure({ target: A, ord: 0, pressure: { kind: "legal", note: "a suit" }, viewer: ALICE, author: ALICE }).ok, true);
  const checkedBefore = s.scheduled[0].checked;
  assert.equal(s.a.actionHold({ target: A, ord: 0, hold: "in_place", reason: "preserving", viewer: ALICE, author: ALICE }).ok, true);
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  assert.deepEqual(JSON.parse(s.scheduled[1].checked.holds).project,
    { held: true, recorded_by: ALICE, since: "2026-10-06T12:00:00Z" });
  /* the scheduled publisher (its R42) reads the hold again at its time: one placed since signing stops it */
  const out = await s.w.r.publishScheduled(s.entry(checkedBefore), "2026-10-09T12:30:00.000Z");
  assert.deepEqual(out.stopped.map((x) => x.code), ["SCHEDULED_HOLD_CHANGED"]);
  /* released, it is as it was at signing */
  assert.equal(s.a.actionHoldRelease({ target: A, ord: 0, reason: "the matter closed", viewer: ALICE, author: ALICE }).ok, true);
  assert.deepEqual(s.a.holdsOn({ project: s.P }), { held: false });
});

/* ---------------------------------------------------------------- T34-87 (DEC-149) */

test("R10 R45 R8 (DEC-149, T34-87) the member-facing details name 'your group's Civicsmith', or need no name, and never 'this instance', 'this copy' or 'this plane'", () => {
  const w = world();
  const kind = w.promote(A, actionMd(A, [...CP, "action_kind: grand_jury"]));
  assert.equal(kind.reason, "ACTION_KIND_UNKNOWN");
  assert.match(kind.detail, /^action_kind 'grand_jury' is not a kind your group's Civicsmith offers: one of records_request, /);
  const contact = actions.contactNotAMember();
  assert.equal(contact.detail, "contact names a member of your group by member id, and this one names none. Nothing was written.");
  assert.equal(w.promote(B, actionMd(B, [...CP, "action_kind: other", "contact: nobody-here"])).detail, contact.detail);
  const x = world({ conformance: {} });
  const det = x.promote(C, actionMd(C, [...CP, "action_kind: other", "breach: true"]));
  assert.deepEqual([det.reason, det.cause], ["ACTION_NO_DETERMINATION", "CONFORMANCE_UNAVAILABLE"]);
  assert.equal(det.detail, "an action recorded for a breach rests on a conformance determination, and no determination can be "
    + "read on your group's Civicsmith yet, so none could be found. Nothing was written.");
  for (const r of [kind, contact, det]) assert.doesNotMatch(r.detail, /this instance|this copy|this plane|the plane/i);
});

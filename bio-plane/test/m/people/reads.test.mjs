/* people's reads at its interface: R13–R19, and M-P5 (a person read at 50,000 lines within the response budget). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, doc, ANN, OUT } from "./fixture.mjs";
import { READ_LIST_MAX, peopleOf } from "../../../src/people/index.mjs";
import { BOUNDS } from "../../../src/connection-grammar/index.mjs";

const span = (from, to) => ({ from, to });

/* One person on two records joined by a claim, with posts on each. */
function linked(w) {
  const a = w.person("Dana Kim"), b = w.person("Dana Kim");
  w.p.claimIdentity({ a, b, kind: "same_as", basis: "testimony", note: "same person", by: ANN });
  return { a, b };
}

test("R13 each read answers over the identity cluster as the viewer sees it, stating the cluster and its state, each item naming the member it is held on; an undetermined cluster answers each item with its own member and joins nothing across the not_same_as", () => {
  const w = world();
  const { a, b } = linked(w);
  const o1 = w.entity("office", "Clerk"), o2 = w.entity("institution", "Harbour Co");
  w.line("holds", a, o1, span("2010-01-01", "2014-12-31"));
  w.line("holds", b, o2, span("2015-01-01", "2019-12-31"));
  const career = w.p.careerOf({ entityId: a, viewer: ANN });
  assert.equal(career.cluster.state, "linked");
  assert.deepEqual(career.cluster.members, [a, b].sort());
  assert.deepEqual(career.career.map((x) => x.member), [a, b], "each item names the member it is held on");
  /* a not_same_as between them: undetermined, nothing joined */
  w.p.claimIdentity({ a, b, kind: "not_same_as", basis: "testimony", note: "different people", by: OUT });
  const und = w.p.careerOf({ entityId: a, viewer: ANN });
  assert.equal(und.cluster.state, "undetermined");
  assert.deepEqual(und.career.map((x) => x.member), [a]);
  for (const read of ["personAt", "credentialsOf", "interestsOf", "statementsOf"]) {
    const r = w.p[read]({ entityId: b, at: "2016-01-01", viewer: ANN });
    assert.equal(r.cluster.state, "undetermined", read);
  }
  /* a fenced claim does not join for an outsider */
  const w2 = world();
  const x = w2.person("Eve Fox"), y = w2.person("Eve Fox");
  w2.p.claimIdentity({ a: x, b: y, kind: "same_as", basis: "testimony", note: "n", by: ANN, project: w2.project() });
  w2.line("holds", y, w2.entity("office", "Port Warden"), span("2010-01-01", "2012-01-01"));
  assert.equal(w2.p.careerOf({ entityId: x, viewer: ANN }).career.length, 1);
  assert.equal(w2.p.careerOf({ entityId: x, viewer: OUT }).career.length, 0);
});

test("R14 personAt refuses NO_ENTITY and NO_DATE and answers names and life facts valid at the date, posts held then with capacity, the duties binding the person then as obligor, each with validity, grade and citation; an item whose validity does not settle the date is listed undetermined with the reason, never as current", () => {
  const w = world();
  const p = w.person("Gil Ruiz", ["G. Ruiz"]);
  assert.equal(w.p.personAt({ entityId: "", at: "2020-01-01", viewer: ANN }).reason, "NO_ENTITY");
  assert.equal(w.p.personAt({ entityId: p, viewer: ANN }).reason, "NO_DATE");
  assert.deepEqual(w.p.personAt({ entityId: "ENT-2026-8888", at: "2020-01-01", viewer: ANN }), { ok: true, found: false, entity_id: "ENT-2026-8888" });
  const c = w.capture("c");
  w.p.recordPersonFact({ person: p, kind: "locality", value: "Port Ellery", valid: { ...span("2018-01-01", "2022-12-31"), precision: "day", zone: "UTC" }, citation: doc(c), by: ANN });
  w.p.recordPersonFact({ person: p, kind: "locality", value: "Marlow", valid: { ...span("2010-01-01", "2012-12-31"), precision: "day", zone: "UTC" }, citation: doc(c), by: ANN });
  const office = w.entity("office", "Port Warden");
  const held = w.line("holds", p, office, span("2019-01-01", "2021-06-30"), { capacity: "elected" });
  w.line("holds", p, w.entity("office", "Old Post"), span("2001-01-01", "2003-01-01"));
  const open = w.line("holds", p, w.entity("office", "Open Post"), span("2018-01-01", null));
  const duty = w.duty(p);
  const gone = w.duty(p);
  assert.equal(w.duties.withdraw({ dutyId: gone, reason: "the test withdraws it", by: "member:bob" }).ok, true);
  const r = w.p.personAt({ entityId: p, at: "2020-06-01", viewer: ANN });
  assert.deepEqual(r.names.map((n) => n.name).sort(), ["G. Ruiz", "Gil Ruiz"]);
  assert.deepEqual(r.facts.map((f) => f.value), ["Port Ellery"]);
  for (const f of r.facts) { assert.ok(f.valid && "grade" in f && f.citation); assert.equal(f.member, p); }
  assert.deepEqual(r.posts.map((x) => x.line_id), [held]);
  assert.equal(r.posts[0].capacity, "elected");
  assert.ok(r.posts[0].grade && r.posts[0].citation && r.posts[0].valid);
  assert.ok(r.duties.length >= 1 && r.duties.every((d) => d.in_force.state === "in_force" && !d.withdrawn && d.obligor === p && d.member === p));
  assert.ok(r.duties.some((d) => d.duty_id === duty));
  assert.ok(!r.duties.some((d) => d.duty_id === gone), "a withdrawn duty binds nothing");
  assert.deepEqual(r.undetermined.map((x) => x.line_id), [open]);
  assert.match(r.undetermined[0].undetermined.why, /no end is stated/);
  assert.equal(w.p.personAt({ entityId: p, at: "2020-06-01", viewer: null }).ok, false, "fails closed with no viewer");
});

test("R15 careerOf answers every holds line of the cluster in validity order with capacity, title as written, bounds, grade and citation; credentialsOf the educated_at and credentialed_by lines, each credential with its issuer's scheme identifier; interestsOf the owns_interest_in lines and the money where the person is payee of income or a gift or payer of a contribution", () => {
  /* No held profile has a scheme for an issuing institution (they identify persons only), so the issuer's identifier is
     answered by entities R44's read over the real registry, laid on for this one entity. */
  let issuer = null;
  const BAR_ID = { scheme: "marlow_bar_issuer", id: "BAR-ISSUER-1", normal: "BAR-ISSUER-1", valid: null, withdrawn: null };
  const w = world({ entitiesOver: (real) => {
    const o = {};
    for (const k of ["has", "readEntity", "entitiesByAlias", "entityByIdentifier", "createEntity"]) o[k] = real[k].bind(real);
    o.identifiersOf = (e) => (e === issuer ? { ok: true, entity_id: e, identifiers: [BAR_ID] } : real.identifiersOf(e));
    return o;
  } });
  const { a, b } = linked(w);
  const gov = w.entity("office", "Clerk"), co = w.entity("institution", "Harbour Co");
  const l2 = w.line("holds", b, co, span("2015-01-01", "2019-12-31"), { capacity: "officer or director" });
  const l1 = w.line("holds", a, gov, span("2010-01-01", "2014-12-31"), { capacity: "elected" });
  const l0 = w.line("holds", a, w.entity("institution", "Early Co"), span(null, null));
  w.line("educated_at", a, w.entity("institution", "Marlow College"), span("1990-01-01", "1994-06-01"));
  const bar = issuer = w.entity("institution", "Marlow Bar");
  const cred = w.line("credentialed_by", b, bar, span("1996-01-01", "2026-12-31"));
  const career = w.p.careerOf({ entityId: a, viewer: ANN }).career;
  assert.deepEqual(career.map((x) => x.line_id), [l1, l2, l0], "validity order, unstated last");
  assert.equal(career[1].capacity, "officer or director");
  for (const x of career) assert.ok("grade" in x && "citation" in x && "valid" in x && "title" in x);
  const creds = w.p.credentialsOf({ entityId: a, viewer: ANN }).credentials;
  assert.deepEqual(creds.map((x) => x.kind).sort(), ["credentialed_by", "educated_at"]);
  assert.deepEqual(creds.find((x) => x.line_id === cred).issuer_identifiers.map((i) => i.id), ["BAR-ISSUER-1"]);
  const asOf = w.p.credentialsOf({ entityId: a, at: "2000-01-01", viewer: ANN }).credentials;
  assert.deepEqual(asOf.map((x) => x.line_id), [cred]);
  const share = w.line("owns_interest_in", a, co, span("2016-01-01", "2016-12-31"));
  const party = (entity) => ({ entity });
  const inc = w.fact({ kind: "income", from: party(co), to: party(a), amount: "1000.00" });
  const gift = w.fact({ kind: "gift", from: party(co), to: party(b), amount: "50.00" });
  const contrib = w.fact({ kind: "contribution", from: party(a), to: party(gov), amount: "200.00" });
  w.fact({ kind: "gift", from: party(a), to: party(co), amount: "9.00" });
  w.fact({ kind: "contribution", from: party(co), to: party(b), amount: "9.00" });
  const i = w.p.interestsOf({ entityId: a, viewer: ANN });
  assert.deepEqual(i.interests.map((x) => x.line_id), [share]);
  assert.deepEqual(i.money.map((m) => `${m.fact_id}:${m.side}`).sort(), [`${contrib}:payer`, `${gift}:payee`, `${inc}:payee`].sort());
  for (const m of i.money) assert.ok(m.citation && m.grade, "each cited and graded");
  assert.ok(!("total" in i), "facts, never a total");
});

test("R16 statementsOf answers each member's statements and acts (decider, signatory, implementer, author) merged in events' order, three-valued: two events whose order the record does not settle are answered as such, never placed", () => {
  const w = world();
  const { a, b } = linked(w);
  const s1 = w.event("statement", { start: "2020-01-05" }, [{ entity: a, role: "speaker" }]);
  const d1 = w.event("order", { start: "2020-03-01" }, [{ entity: b, role: "signatory" }]);
  const d2 = w.event("adoption", { start: "2020-03-01" }, [{ entity: a, role: "decider" }]);
  w.event("meeting", { start: "2020-02-01" }, [{ entity: a, role: "present" }]);
  const s0 = w.event("communication", { start: "2019-12-01" }, [{ entity: b, role: "sender" }]);
  const r = w.p.statementsOf({ entityId: a, viewer: ANN });
  const ids = r.items.map((x) => x.event_id);
  assert.equal(ids.length, 4, "the meeting where they were only present is neither a statement nor an act");
  assert.deepEqual(ids.slice(0, 2), [s0, s1]);
  assert.deepEqual(ids.slice(2).sort(), [d1, d2].sort());
  assert.equal(r.order_undetermined.length, 1);
  assert.deepEqual([r.order_undetermined[0].a, r.order_undetermined[0].b].sort(), [d1, d2].sort());
  assert.ok(r.order_undetermined[0].why);
  assert.deepEqual(r.items.find((x) => x.event_id === d1).as, ["signatory"]);
  assert.deepEqual(r.items.find((x) => x.event_id === d1).members, [b]);
});

test("R17 every read bounds each list at 500 items in its stated order with truncated per list by reading one past, and never answers a count of a truncated list as whole", () => {
  const w = world();
  const p = w.person("Ivy Lane");
  const org = w.entity("institution", "Big Co");
  for (let i = 0; i < 501; i++) w.line("holds", p, org, span(`2000-01-${String(1 + (i % 28)).padStart(2, "0")}`, "2030-01-01"));
  const career = w.p.careerOf({ entityId: p, viewer: ANN });
  assert.equal(career.career.length, READ_LIST_MAX);
  assert.equal(career.truncated, true);
  const at = w.p.personAt({ entityId: p, at: "2020-01-01", viewer: ANN });
  assert.equal(at.posts.length, READ_LIST_MAX);
  assert.equal(at.truncated.posts, true);
  assert.equal(at.truncated.facts, false);
  const w2 = world();
  const q = w2.person("Jo Ash");
  for (let i = 0; i < 500; i++) w2.line("holds", q, w2.entity("office", `O${i}`), span("2000-01-01", "2030-01-01"));
  const exact = w2.p.careerOf({ entityId: q, viewer: ANN });
  assert.equal(exact.career.length, 500);
  assert.equal(exact.truncated, false, "exactly the bound is whole");
});

test("R18 staffingAt answers, for an organisation and its parts at a date, the persons holding a holds line to it then, and beside them each registered roster source's answer with its level, or 'held as a table, not read'; roster rows are never copied into lines", () => {
  const w = world();
  const dept = w.entity("body", "Works Department"), unit = w.entity("body", "Roads Unit"), other = w.entity("body", "Other");
  w.line("part_of", unit, dept, span("2000-01-01", "2030-01-01"));
  const p1 = w.person("Kay Orr"), p2 = w.person("Lu Pei"), p3 = w.person("Mo Quin");
  w.line("holds", p1, dept, span("2019-01-01", "2021-01-01"), { capacity: "employee" });
  w.line("holds", p2, unit, span("2018-01-01", "2022-01-01"), { capacity: "employee" });
  w.line("holds", p3, dept, span("2010-01-01", "2011-01-01"));
  w.line("holds", p3, other, span("2019-01-01", "2021-01-01"));
  const lineCount = () => w.one(`SELECT COUNT(*) AS n FROM lines`).n;
  const before = lineCount();
  const r = w.p.staffingAt({ organisation: dept, at: "2020-01-01", viewer: ANN });
  assert.deepEqual(r.staff.map((s) => s.person).sort(), [p1, p2].sort());
  assert.deepEqual(r.units, [dept, unit]);
  assert.deepEqual(r.rosters, [{ source: null, level: "held as a table, not read" }]);
  w.p.registerRosterSource("calculations", ({ organisation }) => ({ rows: [{ name: "K. Orr", organisation }] }));
  const r2 = w.p.staffingAt({ organisation: dept, at: "2020-01-01", viewer: ANN });
  assert.equal(r2.rosters[0].level, "held as a table, read by calculations");
  assert.deepEqual(r2.rosters[0].answer.rows[0].name, "K. Orr");
  assert.equal(lineCount(), before, "no roster row becomes a line");
  assert.equal(w.p.staffingAt({ organisation: dept, viewer: ANN }).reason, "NO_DATE");
  assert.equal(w.p.staffingAt({ organisation: "ENT-2026-9191", at: "2020-01-01", viewer: ANN }).reason, "NO_SUCH_ENTITY");
});

test("R19 registerRosterSource takes one source per module, refused through membership's listenerRefusal (LISTENER_MALFORMED, LISTENER_DECLARED); sources are asked in the modules' total order; a source that throws is named as failed and the read still answers", () => {
  const w = world();
  const org = w.entity("body", "Board");
  assert.equal(w.p.registerRosterSource("", () => 1).reason, "LISTENER_MALFORMED");
  assert.equal(w.p.registerRosterSource("plane", "no").reason, "LISTENER_MALFORMED");
  assert.equal(w.p.registerRosterSource("plane", () => ({ rows: [] })).ok, true);
  assert.equal(w.p.registerRosterSource("plane", () => ({})).reason, "LISTENER_DECLARED");
  w.p.registerRosterSource("calculations", () => { throw new Error("sheet unreadable"); });
  const r = w.p.staffingAt({ organisation: org, at: "2020-01-01", viewer: ANN });
  assert.equal(r.ok, true);
  assert.deepEqual(r.rosters.map((x) => x.source), ["calculations", "plane"], "the modules' total order, not registration order");
  assert.equal(r.rosters[0].failed, true);
  assert.match(r.rosters[0].error, /sheet unreadable/);
});

test("M-P5 a person read at 50,000 lines answers within the response budget (connection-grammar's time budget)", () => {
  const w = world();
  const p = w.person("Nia Vale");
  const orgs = Array.from({ length: 50 }, (_, i) => w.entity("institution", `Org ${i}`));
  /* one holds line and one part_of line recorded through lines, each cloned 25,000 times in SQL with its bound cache
     (50,000 recorded acts would measure the fixture, not the read) */
  const seeds = [w.line("holds", p, orgs[0], span("2000-01-01", "2030-01-01")), w.line("part_of", orgs[1], orgs[0], span("2000-01-01", "2030-01-01"))];
  const cols = (t) => w.rows(`PRAGMA table_info(${t})`).map((c) => c.name).filter((c) => c !== "line_id");
  for (const [k, seed] of seeds.entries()) for (const t of ["lines", "line_bound_cache"])
    w.st.sql.exec(`WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 25000)
                   INSERT INTO ${t} (line_id, ${cols(t).join(", ")}) SELECT printf('LIN-2026-%d%015d', ${k}, i), ${cols(t).join(", ")}
                   FROM ${t}, n WHERE line_id = ?`, seed);
  assert.equal(w.one(`SELECT COUNT(*) AS n FROM lines`).n, 50002);
  const t0 = Date.now();
  const r = w.p.personAt({ entityId: p, at: "2020-01-01", viewer: ANN });
  const ms = Date.now() - t0;
  assert.equal(r.ok, true);
  assert.equal(r.truncated.posts, true);
  assert.ok(ms < BOUNDS.time_budget_ms, `${ms} ms`);
});

test("R14 peopleOf given no services reaches the real modules on the same host (K1563 (1)); personAt reads a holds line stated current through a day (lines R21) as held on or before that day and undetermined after it, and a line whose bound cache is stale as undetermined with its owner's reason, never as current", () => {
  const w = world();
  const p = w.person("Ora Penn");
  const post = w.entity("office", "Harbour Clerk");
  const open = w.line("holds", p, post, span("2018-01-01", null));
  const c = w.capture("current through");
  assert.equal(w.lines.recordCurrentThrough({ lineId: open, day: "2022-12-31", basis: { captureSha: c.captureSha, extent: { kind: "pdf-page", page: 0 } }, by: ANN }).ok, true);
  const plane = peopleOf(w.host, { record: w.record, membership: w.membership });
  assert.notEqual(plane, w.p, "the plane's own instance");
  const inside = plane.personAt({ entityId: p, at: "2020-06-01", viewer: ANN });
  assert.deepEqual(inside.posts.map((x) => x.line_id), [open], "the real lines, read through the default wiring");
  assert.equal(inside.posts[0].current_through, "2022-12-31");
  const after = plane.personAt({ entityId: p, at: "2024-06-01", viewer: ANN });
  assert.deepEqual(after.posts, []);
  assert.deepEqual(after.undetermined.map((x) => x.line_id), [open]);
  assert.match(after.undetermined[0].undetermined.why, /current through 2022-12-31/);
  /* a stale bound cache (lines R7) */
  const shut = w.line("holds", p, w.entity("office", "Dock Warden"), span("2010-01-01", "2030-01-01"));
  w.st.sql.exec(`UPDATE line_bound_cache SET to_instant='2011-01-01' WHERE line_id=?`, shut);
  const stale = plane.personAt({ entityId: p, at: "2020-06-01", viewer: ANN });
  assert.ok(!stale.posts.some((x) => x.line_id === shut));
  assert.match(stale.undetermined.find((x) => x.line_id === shut).undetermined.why, /cache stale/);
  /* the other services resolve too: candidates (entities), statements (events), interests (money), duties */
  for (const r of [plane.samePersonCandidates({ entityId: p, viewer: ANN }), plane.statementsOf({ entityId: p, viewer: ANN }),
                   plane.interestsOf({ entityId: p, viewer: ANN }), plane.careerOf({ entityId: p, viewer: ANN })]) assert.equal(r.ok, true);
});

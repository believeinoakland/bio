/* actions' T18 entries at its interface: N-A4 (R7's `completed`, R8's premise override, R9's addressee arms with
   `ADDRESSEE_NOT_AN_OFFICE`, R45 `contact`, R46 the plan link, R47 `actionCreate` and the ops `action`/`actions`,
   R48 pressure with `actionPressure`, R49 no grade refusal) and the converts `risk-tier` (R40, R37/R7, R25/R12, the
   D-505 union arms) and `d526-refusal-order` (R2 with no envelope type). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd, CP, NOW_MS } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";
const M = V("alice");
const D1 = "CONF-2026-0001-determination";
const det = { [D1]: { ok: true, id: D1, live: true, superseded_by: null } };
const conf = { determinationRead: ({ id }) => det[id] || { ok: false, reason: "NO_SUCH_DETERMINATION" } };
const md = (id, lines, opts) => actionMd(id, ["action_kind: other", ...lines], opts);
const named = (kind, role, org) => ["counterparty:", "  state: named", `  kind: ${kind}`, `  role: ${role}`, `  organisation: ${org}`];
function determination(w) {
  const r = w.promote(D1, ["---", `id: ${D1}`, "object_type: determination", `title: ${D1}`, "current_state: recorded",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } });
  assert.equal(r.ok, true, JSON.stringify(r));
}

test("R7 R13 `completed` ends an action of any kind, at the move and at the write; another word is still refused", () => {
  const w = world();
  assert.deepEqual([...actions.RESOLUTIONS], ["complied", "denied", "escalated", "withdrawn", "completed"]);
  w.action(A);
  assert.equal(w.a.actionMove({ target: A, to: "active", reason: "sent", viewer: M, author: M }).ok, true);
  const no = w.a.actionMove({ target: A, to: "resolved", resolution: "finished", reason: "done", viewer: M, author: M });
  assert.equal(no.reason, "NO_RESOLUTION"); assert.ok(no.legal.includes("completed"));
  assert.match(no.translation, /completed/, "C-33.3 names it");
  const done = w.a.actionMove({ target: A, to: "resolved", resolution: "completed", reason: "held the meeting", viewer: M, author: M });
  assert.deepEqual([done.ok, done.resolution], [true, "completed"]);
  assert.equal(w.fm(A).resolution, "completed");
  /* at the write, on a kind no counterparty's answer decides */
  assert.equal(w.promote(B, md(B, [...CP, "resolution: completed"], { state: "resolved" })).ok, true);
  const bad = w.promote("ACTN-2026-0003-c", md("ACTN-2026-0003-c", [...CP, "resolution: done"], { state: "resolved" }));
  assert.equal(bad.reason, "ACTION_RESOLUTION_REFUSED"); assert.match(bad.translation, /completed/, "C-101.4 names it");
  assert.deepEqual(w.a.audit({ files: new Map([["bundle.md", w.text(B)]]) }).filter((x) => /resolution/.test(x.message)), []);
});

test("R9 the addressee's arms: office, press, organisation, group, audience, undetermined; each refusal names its arm", () => {
  const w = world();
  const ok = (id, lines) => assert.equal(w.promote(id, md(id, lines)).ok, true, JSON.stringify(lines));
  ok("ACTN-2026-0010-a", CP);
  ok("ACTN-2026-0011-a", ["counterparty:", "  state: named", "  kind: office", "  role: Town Clerk", "  body: Town of Port Ellery"]);
  ok("ACTN-2026-0012-a", named("press", "City desk reporter", "Port Ellery Gazette"));
  ok("ACTN-2026-0013-a", named("organisation", "Policy director", "Harbour Tenants Union"));
  ok("ACTN-2026-0014-a", named("group", "Coordinator", "Friends of the Library"));
  ok("ACTN-2026-0015-a", ["counterparty:", "  state: audience", '  description: "residents of the harbour ward"']);
  ok("ACTN-2026-0016-a", ["counterparty:", "  state: undetermined", '  basis: "the office is not yet known"']);
  const refused = (lines, arm) => {
    const r = w.promote(B, md(B, lines));
    assert.equal(r.reason, "COUNTERPARTY_REFUSED", JSON.stringify(lines)); assert.equal(r.check, "C-101.3");
    assert.ok(r.findings.some((f) => f.detail.includes(`arm: ${arm}`)), `${arm}: ${JSON.stringify(r.findings)}`);
  };
  refused(["counterparty:", "  state: named", "  kind: press", "  role: Reporter"], "press");
  refused(["counterparty:", "  state: named", "  kind: organisation", "  organisation: Union"], "organisation");
  refused(["counterparty:", "  state: named", "  kind: group", "  role: Chair", "  organisation: Friends", "  body: Town"], "group");
  refused(["counterparty:", "  state: named", "  kind: person", "  role: Neighbour", "  organisation: none"], "kind");
  refused(["counterparty:", "  state: audience"], "audience");
  refused(["counterparty:", "  state: audience", `  description: "${"x".repeat(501)}"`], "audience");
  refused(["counterparty:", "  state: audience", '  description: "readers"', "  role: Editor"], "audience");
  refused(["counterparty:", "  state: undetermined", '  basis: "unknown"', "  organisation: Union"], "undetermined");
  refused(["counterparty:", "  state: named", "  role: Town Clerk"], "office");
  const ph = w.promote(B, md(B, named("press", "to be named", "Gazette")));
  assert.equal(ph.reason, "COUNTERPARTY_REFUSED", "the placeholder anywhere");
  /* R3, R27: the matching name, "role, organisation" for the named non-office arms, none for an audience. */
  assert.equal(actions.counterpartyName({ state: "named", kind: "press", role: "Reporter", organisation: "Gazette" }), "Reporter, Gazette");
  assert.equal(actions.counterpartyName({ state: "audience", description: "residents" }), null);
  assert.equal(actions.counterpartyName({ state: "named", name: "City Clerk" }), "City Clerk", "the earlier shape reads as written");
  assert.equal(w.a.actionsFor({ viewer: M, counterparty: "City desk reporter, Port Ellery Gazette" }).items[0].id, "ACTN-2026-0012-a");
});

test("R9 R8 a breach action addresses an office, else ADDRESSEE_NOT_AN_OFFICE; one stating no addressee lands", () => {
  const w = world({ conformance: conf });
  determination(w);
  const breach = (id, cp) => md(id, [...cp, "breach: true", "action_basis:", `  - target: ${D1}`, "    kind: rests_on"]);
  for (const cp of [named("press", "Reporter", "Gazette"), ["counterparty:", "  state: audience", '  description: "voters"'],
                    ["counterparty:", "  state: undetermined", '  basis: "not known"']]) {
    const r = w.promote(B, breach(B, cp));
    assert.deepEqual([r.reason, r.check], ["ADDRESSEE_NOT_AN_OFFICE", "C-117.7"], JSON.stringify(cp));
    assert.ok(r.translation.length > 40);
  }
  assert.equal(w.record.head(B), null, "nothing was written");
  assert.equal(w.promote(A, breach(A, CP)).ok, true, "an office");
  assert.equal(w.promote("ACTN-2026-0003-c", breach("ACTN-2026-0003-c", [])).ok, true, "no addressee yet: a draft");
  assert.equal(w.promote("ACTN-2026-0004-d", md("ACTN-2026-0004-d", named("press", "Reporter", "Gazette"))).ok, true,
    "an action that seeks attention is not asked");
});

test("R8 a member's premise override stands in for the determination, stamped who and when, never edited, removed or added later", () => {
  const w = world({ conformance: conf });
  w.doc("INFO-2026-0001-d");
  const leg = ["action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on"];
  const ov = (reason) => ["premise_override:", `  reason: "${reason}"`];
  /* without one, a breach action resting on no determination is refused */
  assert.equal(w.promote(A, md(A, [...CP, "breach: true", ...leg])).reason, "ACTION_NO_DETERMINATION");
  /* a machine may not state one */
  const m = w.promote(A, md(A, [...CP, "breach: true", ...leg, ...ov("the deadline will pass")]), { author: MACHINE });
  assert.deepEqual([m.reason, m.check], ["MACHINE_CANNOT_OVERRIDE", "C-117.8"]);
  assert.equal(w.promote(A, md(A, [...CP, "breach: true", ...leg, "premise_override:", '  reason: ""'])).reason, "PREMISE_OVERRIDE_REFUSED",
    "an empty reason is refused, never read as no override");
  const shape = w.promote(A, md(A, [...CP, "breach: true", ...leg, "premise_override:", `  reason: "${"x".repeat(501)}"`]));
  assert.deepEqual([shape.reason, shape.check], ["PREMISE_OVERRIDE_REFUSED", "C-117.19"]);
  const extra = w.promote(A, md(A, [...CP, "breach: true", ...leg, ...ov("why"), "  by: member:alice"]));
  assert.equal(extra.reason, "PREMISE_OVERRIDE_REFUSED", "who and when are stamped, never stated");
  /* a member's lands */
  const ok = w.promote(A, md(A, [...CP, "breach: true", ...leg, ...ov("the deadline will pass before a determination")]));
  assert.equal(ok.ok, true, JSON.stringify(ok));
  const r = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual(r.premise_override, { reason: "the deadline will pass before a determination", by: M,
    at: "2026-09-28T12:00:00Z", says: r.premise_override.says });
  assert.match(r.premise_override.says, /Rests on an unestablished premise/);
  /* never edited or removed */
  const edit = w.promote(A, w.text(A).replace("before a determination", "soon"));
  assert.deepEqual([edit.reason, edit.check], ["PREMISE_OVERRIDE_REWRITTEN", "C-117.9"]);
  assert.equal(w.promote(A, w.text(A).replace(/premise_override:\n  reason: "[^"]*"\n/, "")).reason, "PREMISE_OVERRIDE_REWRITTEN");
  assert.equal(w.promote(A, w.text(A).replace("An action.", "Revised.")).ok, true, "carried forward lands");
  w.clock.ms += 60000;
  w.promote(A, w.text(A).replace("Revised.", "Revised again."));
  assert.equal(w.a.actionRead({ id: A, viewer: M }).premise_override.at, "2026-09-28T12:00:00Z", "stamped once");
  /* only on the write that first marks the action a breach */
  w.action(B, leg);
  const late = w.promote(B, w.text(B).replace("action_kind: records_request", 'action_kind: records_request\npremise_override:\n  reason: "later"'));
  assert.equal(late.reason, "PREMISE_OVERRIDE_REWRITTEN", "not with no breach");
  /* an action that seeks evidence is never asked */
  assert.equal(w.a.actionRead({ id: B, viewer: M }).premise_override, null);
  /* the stamp purges with the action */
  w.record.purge({ bundleId: A });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_overrides WHERE bundle_id=?`, A)[0].n, 0);
});

test("R45 contact: a member id, set or changed by a member only, naming a member; shown in the read", async () => {
  const w = world();
  for (const id of ["alice", "carol"])
    assert.equal((await w.membership.memberAdd({ memberId: id, cover: id, role: "admin", by: MACHINE })).ok, true);
  const m = w.promote(A, md(A, [...CP, "contact: carol"]), { author: MACHINE });
  assert.deepEqual([m.reason, m.check], ["MACHINE_CANNOT_SET_CONTACT", "C-117.10"]);
  const none = w.promote(A, md(A, [...CP, "contact: nobody-here"]));
  assert.deepEqual([none.reason, none.check], ["CONTACT_NOT_A_MEMBER", "C-117.11"]);
  assert.equal(w.promote(A, md(A, [...CP, "contact: carol"])).ok, true);
  assert.equal(w.a.actionRead({ id: A, viewer: M }).contact, "carol");
  assert.equal(w.promote(A, w.text(A).replace("contact: carol", "contact: member:alice"), { author: MACHINE }).reason,
    "MACHINE_CANNOT_SET_CONTACT", "a change, by a machine");
  assert.equal(w.promote(A, w.text(A).replace("contact: carol", "contact: member:alice")).ok, true, "the stamp form names a member too");
  assert.equal(w.promote(A, w.text(A).replace("An action.", "Revised."), { author: MACHINE }).ok, true, "carried forward by a machine");
  assert.equal(w.a.actionRead({ id: A, viewer: M }).contact, "member:alice");
});

test("R46 plan and option: set on creation only, never changed or removed; shown in the read", () => {
  const w = world();
  const link = ["plan: PLN-2026-0001", "option: opt-2"];
  assert.equal(w.promote(A, md(A, [...CP, ...link])).ok, true);
  const r = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual([r.plan, r.option], ["PLN-2026-0001", "opt-2"]);
  const ch = w.promote(A, w.text(A).replace("option: opt-2", "option: opt-3"));
  assert.deepEqual([ch.reason, ch.check], ["PLAN_LINK_REWRITTEN", "C-117.12"]);
  assert.equal(w.promote(A, w.text(A).replace("plan: PLN-2026-0001\n", "")).reason, "PLAN_LINK_REWRITTEN", "removed");
  w.action(B);
  assert.equal(w.promote(B, w.text(B).replace("action_kind: records_request", "action_kind: records_request\nplan: PLN-2026-0001\noption: o"))
    .reason, "PLAN_LINK_REWRITTEN", "never added by a revision");
  for (const bad of [["plan: INQ-2026-0001", "option: o"], ["plan: PLN-2026-0001"], ["option: o"], ["plan: PLN-2026-0001", 'option: "two words"']]) {
    const x = w.promote("ACTN-2026-0005-e", md("ACTN-2026-0005-e", [...CP, ...bad]));
    assert.deepEqual([x.reason, x.check], ["PLAN_LINK_REFUSED", "C-117.13"], JSON.stringify(bad));
  }
  assert.deepEqual([w.a.actionRead({ id: B, viewer: M }).plan, w.a.actionRead({ id: B, viewer: M }).option], [null, null]);
});

test("R47 actionCreate is a promotion of an action document, its id minted; op=actioncreate, op=action and op=actions", () => {
  const w = world();
  const doc = actionMd("", [...CP, "action_kind: other"]).replace("id: \n", "");
  const c = w.a.actionCreate({ document: doc, viewer: M, author: M });
  assert.equal(c.ok, true, JSON.stringify(c)); assert.match(c.id, /^ACTN-2026-\d{4}$/);
  assert.equal(w.fm(c.id).id, c.id, "the plane writes the minted id");
  assert.deepEqual(Object.keys(c).sort(), ["id", "ok"]);
  /* its refusals are the promotion's (R1–R11 at the act) */
  const k = w.a.actionCreate({ document: doc.replace("action_kind: other", "action_kind: grand_jury"), viewer: M, author: M });
  assert.equal(k.reason, "ACTION_KIND_UNKNOWN");
  assert.equal(w.a.actionCreate({ document: doc.replace("action_kind: other", "action_kind: other\nrisk_tier: 1"), author: MACHINE }).reason,
    "MACHINE_CANNOT_SET_RISK_TIER");
  assert.equal(w.a.actionCreate({ document: doc.replace("object_type: action", "object_type: information"), author: M }).reason, "NOT_AN_ACTION");
  /* the ops, with the stamps the control plane makes */
  const url = (q) => new URL(`https://x/?${new URLSearchParams(q)}`);
  const op = actions.actionsOps(w.a, url({ viewer: M, author: M }), { document: doc }).actioncreate();
  assert.equal(op.ok, true);
  const read = actions.actionsOps(w.a, url({ id: op.id, viewer: M }), null).action();
  assert.deepEqual([read.ok, read.id, read.kind], [true, op.id, "other"]);
  assert.equal(actions.actionsOps(w.a, url({ id: op.id, viewer: "nobody" }), null).action().reason, "NO_SUCH_BUNDLE");
  const list = actions.actionsOps(w.a, url({ viewer: M, kind: "other" }), null).actions();
  assert.deepEqual(list.items.map((x) => x.id), [c.id, op.id]);
});

test("R48 pressure: marked on a received entry by a member, with actionCorrespond or later by actionPressure; never rewritten; read apart; actionsFor pressure", () => {
  const w = world();
  const s = w.doc("INFO-2026-0001-d");
  w.action(A);
  w.action(B);
  const P = { kind: "legal", note: "a letter threatening a suit" };
  /* at the act */
  const c = (x) => w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-03", artifactSha: s, viewer: M, author: M, ...x });
  assert.deepEqual([c({ pressure: { kind: "lawsuit", note: "x" } }).reason, c({ pressure: { kind: "legal", note: "" } }).reason,
    c({ pressure: { kind: "legal", note: 'a"b' } }).reason, c({ pressure: { kind: "legal", note: "x".repeat(501) } }).reason],
    ["PRESSURE_REFUSED", "PRESSURE_REFUSED", "PRESSURE_REFUSED", "PRESSURE_REFUSED"]);
  const sent = w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "asked", pressure: P, viewer: M, author: M });
  assert.deepEqual([sent.reason, sent.check], ["PRESSURE_NOT_RECEIVED", "C-117.16"]);
  assert.equal(w.fm(A).correspondence, undefined, "nothing was written");
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M });
  const before = w.text(A);
  const at = c({ pressure: P });
  assert.deepEqual([at.ok, at.ord, at.pressure], [true, 1, P]);
  assert.ok(!/pressure/.test(w.text(A)), "the mark is never in the entry's bytes");
  assert.ok(w.text(A).length > before.length);
  /* later, by actionPressure */
  w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-04", artifactSha: s, viewer: M, author: M });
  const X = (x) => w.a.actionPressure({ target: A, ord: 2, pressure: { kind: "retaliation", note: "funding cut" }, viewer: M, author: M, ...x });
  const mach = X({ author: MACHINE });
  assert.deepEqual([mach.reason, mach.check], ["MACHINE_CANNOT_MARK_PRESSURE", "C-117.14"]);
  assert.deepEqual([X({ target: "" }).reason, X({ pressure: { kind: "x", note: "y" } }).reason, X({ target: "ACTN-2026-0404-x" }).reason,
    X({ target: "INFO-2026-0001-d" }).reason, X({ ord: 9 }).reason, X({ ord: "one" }).reason, X({ ord: 0 }).reason, X({ ord: 1 }).reason],
    ["NO_TARGET", "PRESSURE_REFUSED", "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "PRESSURE_NO_ENTRY", "PRESSURE_NO_ENTRY",
     "PRESSURE_NOT_RECEIVED", "PRESSURE_MARKED"]);
  const text = w.text(A);
  const ok = X({ ord: "2" });
  assert.deepEqual([ok.ok, ok.ord, ok.by, ok.at], [true, 2, M, "2026-09-28T12:00:00Z"]);
  assert.equal(w.text(A), text, "never rewrites the entry");
  assert.deepEqual([X({}).reason, X({}).check], ["PRESSURE_MARKED", "C-117.17"]);
  /* the read lists them apart from the ledger */
  const r = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual(r.pressure.map((p) => [p.ord, p.kind, p.by]), [[1, "legal", M], [2, "retaliation", M]]);
  assert.equal(r.correspondence.length, 3);
  assert.deepEqual(w.a.actionsFor({ viewer: M, pressure: true }).items.map((x) => x.id), [A]);
  assert.equal(w.a.actionsFor({ viewer: M }).items.length, 2);
  /* the op */
  const op = actions.actionsOps(w.a, new URL(`https://x/?target=${B}&ord=0&pressure_kind=other&pressure_note=n&viewer=${M}&author=${M}`), null)
    .actionpressure();
  assert.equal(op.reason, "PRESSURE_NO_ENTRY");
  /* purged with the action */
  w.record.purge({ bundleId: A });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_pressure WHERE bundle_id=?`, A)[0].n, 0);
});

test("R49 no action is refused for the grade of what it rests on: a breach action resting on a determination and a document of any grade lands", () => {
  const w = world({ conformance: conf });
  determination(w);
  /* a document captured second-hand (a Drive export grades B, an archive copy C): this module reads no grade */
  w.doc("INFO-2026-0002-export", "an exported copy, graded B where acquired");
  const r = w.promote(A, md(A, [...CP, "breach: true", "action_basis:", `  - target: ${D1}`, "    kind: rests_on",
    "  - target: INFO-2026-0002-export", "    kind: rests_on"]));
  assert.equal(r.ok, true, JSON.stringify(r));
  const codes = Object.keys({ ...actions.ACTION_CATALOGUE_CHECKS, ...actions.ACTION_FENCE_CHECKS, ...actions.ACTION_ACT_CHECKS });
  assert.ok(!codes.some((k) => /GRADE/.test(k)), "no refusal compares a grade with a floor");
});

/* convert: test/risk-tier.test.mjs (actions' share) */
test("R40 riskTierState's full table: 1, 2, 3 as numbers; undetermined, absent and null read undetermined; anything else is no tier", () => {
  const table = [[1, 1], [2, 2], [3, 3], ["undetermined", "undetermined"], [undefined, "undetermined"], [null, "undetermined"],
    ["1", null], ["2", null], [0, null], [4, null], [9, null], [2.5, null], ["", null], ["unknown", null], [true, null]];
  for (const [v, want] of table) assert.equal(actions.riskTierState(v), want, JSON.stringify(v));
  assert.deepEqual(Object.entries(actions.RISK_TIERS).map(([k]) => k).sort(), ["1", "2", "3", "undetermined"]);
});

test("R37 R7 the C-2.10 audit's tier arm reports a tier of 9 or 'unknown', and the write refuses both by name", () => {
  const w = world();
  for (const t of ["9", "unknown"]) {
    const text = md(A, [...CP, `risk_tier: ${t}`]);
    assert.ok(w.a.audit({ files: new Map([["bundle.md", text]]) }).some((f) => f.check === "C-2.10" && /risk_tier/.test(f.message)), t);
    assert.equal(w.promote(A, text).reason, "RISK_TIER_REFUSED", t);
  }
  assert.deepEqual(w.a.audit({ files: new Map([["bundle.md", md(A, [...CP, "risk_tier: undetermined"])]]) }), [], "undetermined is a tier state");
});

test("R25 R12 a stated undetermined tier reads back undetermined, never defaulted; its fact is null", () => {
  const w = world();
  w.action(A, ["risk_tier: undetermined"]);
  const r = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual([r.risk_tier, r.risk_tier_words], ["undetermined", actions.RISK_TIERS.undetermined]);
  assert.equal(actions.actionFacts(w.text(A), NOW_MS).risk_tier, null);
  assert.equal(w.decorate(A).action.risk_tier, "undetermined");
});

test("R1 the D-505 union: an action is known by its document or its envelope, and the union only adds refusals", () => {
  const w = world();
  const env = (id, text, meta, author = MACHINE) => w.promotion.promote({ bundleId: id, base: null, snapKey: `u-${id}`, author,
    files: [{ path: "bundle.md", text }], meta });
  /* the document says action, the envelope says nothing: the machine's tier is refused */
  assert.equal(env(A, md(A, [...CP, "risk_tier: 1"]), {}).reason, "MACHINE_CANNOT_SET_RISK_TIER");
  /* the envelope says action and the document says another type: refused, by the envelope rule or this fence */
  const mirror = env(B, md(B, [...CP, "risk_tier: 1"]).replace("object_type: action", "object_type: information"), { object_type: "action" });
  assert.equal(mirror.ok, false);
  assert.equal(w.record.head(A), null); assert.equal(w.record.head(B), null);
  /* over-strictness: a member's tier through either spelling lands */
  assert.equal(env(A, md(A, [...CP, "risk_tier: 2"]), {}, M).ok, true);
});

/* convert: test/d526-refusal-order.test.mjs (actions' share) */
test("R2 GOVERNING_LAWS_REWRITTEN with no envelope type: the document alone makes it an action", () => {
  const w = world();
  const text = md(A, [...CP, "governing_laws:", "  - level: state", '    citation: "X"', 'governing_laws_by: "member:alice"',
    'governing_laws_at: "2026-09-01T00:00:00Z"']);
  const r = w.promotion.promote({ bundleId: A, base: null, snapKey: "d526", author: M, files: [{ path: "bundle.md", text }], meta: {} });
  assert.deepEqual([r.reason, r.check], ["GOVERNING_LAWS_REWRITTEN", "C-73.1"]);
  assert.equal(w.record.head(A), null);
});

/* B5 (K707): entities joined the uses, so R9's person arm is met through the subject registry (entities R5). */
test("R9 an entity_id the subject registry holds as a person is refused COUNTERPARTY_REFUSED, its finding naming the arm; an office's lands", () => {
  const w = world();
  const ent = (kind, label) => {
    const r = w.a.entities.createEntity({ kind, label, declaredBy: M });
    assert.equal(r.ok, true, JSON.stringify(r)); return r.entity_id;
  };
  const person = ent("person", "A private resident"), office = ent("office", "Town Clerk");
  const withId = (id) => md(B, [...CP, `  entity_id: ${id}`]);
  const r = w.promote(B, withId(person));
  assert.deepEqual([r.reason, r.check], ["COUNTERPARTY_REFUSED", "C-101.3"]);
  assert.ok(r.findings.some((f) => /arm: person/.test(f.detail)), JSON.stringify(r.findings));
  assert.equal(w.record.head(B), null, "nothing was written");
  assert.equal(w.promote(B, withId(office)).ok, true, "an office in the registry");
  assert.equal(w.promote(A, md(A, [...CP, "  entity_id: ENT-2026-9999"])).ok, true, "an id the registry does not hold is not a person");
  const press = w.promote("ACTN-2026-0003-c", md("ACTN-2026-0003-c", [...named("press", "Reporter", "Gazette"), `  entity_id: ${person}`]));
  assert.equal(press.reason, "COUNTERPARTY_REFUSED", "on every named arm");
});

/* actions' T45 entry at its interface (T45-27; N828, N855, N858, N879, N880, N883, N884, N892 (a); K2781 (4), K2845,
   K2848–K2850): the gate (R8 amended, R74–R76), addressing (R9 amended, R77–R79, R94), receipt, responses and outcomes
   (R80–R83, R85, R86, R95), scopes and promises (R87, R88), the misuse guards and recognition (R92, R93), the
   registrations (R97), the view (R10), "what we did" (R66), the machine fence (R33) and the tables (R36).
   Determinations and success records are stand-ins in conformance R9's and consequences R20's shapes; members, entities,
   events, standards and the jurisdiction view are the real modules on the fixture's host. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd, CP, NONCOMPLIANT, COMPLIANT } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";
import * as conformance from "../../../src/conformance/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", D = "ACTN-2026-0004-d";
const M = V("alice");
const reasons = (list) => list.map((r) => r.reason);
const NC = "CONF-2026-0001-noncompliant", CO = "CONF-2026-0002-compliant", VO = "CONF-2026-0003-void",
      SU = "CONF-2026-0004-superseded", PUB = "CONF-2026-0005-published";
const SUC = "SUC-2026-0001", SUC_NONE = "SUC-2026-0404";
const CAUSES = [{ finding: "INQ-2026-0001-q", what: "its check was voided", at: "2026-09-20" }];
/* determinations in conformance R9's shape (T45: `basis` per finding, `void` while void, R33) */
const DETS = {
  [NC]: { ok: true, id: NC, live: true, superseded_by: null, outcomes: NONCOMPLIANT, findings: [
    { finding: "INQ-2026-0001-q", basis: { kind: "checked_held", check: "CHK-1", checked_at: "2026-11-03" } },
    { finding: "INQ-2026-0002-q", basis: { kind: "checked_held", check: "CHK-1", checked_at: "2026-11-03" } },
    { finding: "INQ-2026-0003-q", basis: { kind: "accepted", group: "Hayward Parents", case: "CASE-2026-0009", edition: 2,
      edition_date: "2026-09-03", accepted_at: "2026-09-20", accepted_by: M, identity: "Hayward Parents for Accountability",
      stake: "none declared" } },
    { finding: "INQ-2026-0004-q", basis: { kind: "accepted", group: "Hayward Parents", case: "CASE-2026-0009", edition: 2,
      edition_date: "2026-09-03", accepted_at: "2026-09-20", accepted_by: M, identity: "Hayward Parents for Accountability",
      stake: "none declared" } }] },
  [CO]: { ok: true, id: CO, live: true, superseded_by: null, outcomes: COMPLIANT, findings: [] },
  [VO]: { ok: true, id: VO, live: true, superseded_by: null, void: { causes: CAUSES },
          outcomes: [{ standard: NONCOMPLIANT[0].standard, outcome: "undetermined", recorded_outcome: "noncompliant" }], findings: [] },
  [SU]: { ok: true, id: SU, live: false, superseded_by: NC, outcomes: NONCOMPLIANT, findings: [] },
  [PUB]: { ok: true, id: PUB, live: true, superseded_by: null, outcomes: NONCOMPLIANT,
           findings: [{ finding: "INQ-2026-0005-q", basis: { kind: "published", case: "CASE-2026-0001", edition: 1 } }] },
};
const conf = { determinationRead: ({ id }) => DETS[id] || { ok: false, reason: "NO_SUCH_DETERMINATION" } };
/* a success record in consequences R20's shape; `registerOwnActReader` (its R19) keeps what actions registers */
function consequencesStandIn() {
  const c = { readers: [],
    successRecordRead: ({ id }) => (id === SUC ? { ok: true, id: SUC, statement: "the reports were published", superseded_by: null }
                                               : { ok: false, reason: "NO_SUCH_SUCCESS_RECORD" }),
    registerOwnActReader: (fn) => (c.readers.push(fn), { ok: true }) };
  return c;
}
/* each determination and success record named by a leg, held as the record's own history */
function grounded(opts = {}) {
  const cons = consequencesStandIn();
  const w = world({ conformance: conf, deps: { consequences: cons, ...(opts.deps || {}) }, ...(opts.world || {}) });
  for (const id of Object.keys(DETS))
    assert.equal(w.promote(id, ["---", `id: ${id}`, "object_type: determination", `title: ${id}`, "current_state: recorded",
      'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"),
      { extra: { replay: true } }).ok, true);
  return { w, cons };
}
const legs = (...ids) => ["action_basis:", ...ids.flatMap((d) => [`  - target: ${d}`, "    kind: rests_on"])];
const breach = (id, ...ids) => actionMd(id, [...CP, "action_kind: other", "breach: true", ...legs(...ids)]);
const LEGAL = ["  ground_kind: legal_deadline", '  ground_citation: "Records Act s.6"', "  ground_date: 2026-10-30"];
const IRREVERSIBLE = ["  ground_kind: irreversible_act", '  ground_what: "the council votes to sell the land"', "  ground_when: 2026-10-14T19:00"];
const override = (ground, reason = "the deadline falls first") => ["premise_override:", `  reason: "${reason}"`, ...ground];
const press = (extra = []) => ["counterparty:", "  state: named", "  kind: press", "  role: City desk reporter",
  "  organisation: Port Ellery Gazette", ...extra];
async function members(w, ...ids) {
  for (const id of ids) assert.equal((await w.membership.memberAdd({ memberId: id, cover: id, role: "admin", by: MACHINE })).ok, true);
}
function entity(w, kind, label) {
  const r = w.a.entities.createEntity({ kind, label, note: `${label}, registered by the test`, declaredBy: M });
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.entity_id;
}

/* ================================================================ the gate: R8, R74, R75, R76 */

test("R8 (T45) (a) a breach action rests on a live determination noncompliant for a standard it names; (b) a void one is refused through conformance R33; asked superseded, void, not noncompliant, per leg", () => {
  const { w } = grounded();
  const r = (id, ...ids) => w.promote(id, breach(id, ...ids));
  const nn = r(A, CO);
  assert.deepEqual([nn.ok, nn.reason, nn.code, nn.determination], [false, "DETERMINATION_NOT_NONCOMPLIANT", "DETERMINATION_NOT_NONCOMPLIANT", CO]);
  const v = r(A, VO);
  assert.equal(v.reason, "DETERMINATION_VOID");
  assert.deepEqual(v, conformance.determinationVoided(VO, CAUSES), "conformance's own answer (its R33)");
  /* the order: superseded, then void, then not noncompliant */
  assert.deepEqual(reasons([r(A, CO, VO, SU), r(A, CO, VO), r(A, CO)]),
    ["DETERMINATION_SUPERSEDED", "DETERMINATION_VOID", "DETERMINATION_NOT_NONCOMPLIANT"]);
  assert.equal(w.record.head(A), null, "nothing was written");
  /* controls: (a) the same leg on a noncompliant determination lands; (b) a determination not void lands */
  assert.equal(r(A, NC).ok, true);
  assert.equal(r(B, CO, VO, NC).ok, true, "any leg live, not void and noncompliant rests it");
});

test("R8 (T45) (d) an overridden action may later gain a leg on a live noncompliant determination: the override stays, the read answers both; (e) a rests_on leg may name a live success record", () => {
  const { w } = grounded();
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: other", "breach: true", ...override(LEGAL)])).ok, true);
  const later = w.text(A).replace("breach: true", `breach: true\n${legs(NC).join("\n")}`);
  assert.equal(w.promote(A, later).ok, true, "a member's revision adds the determination");
  const r = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual([r.premise_override.reason, r.breach_rests_on], ["the deadline falls first", [NC]]);
  assert.equal(w.promote(A, w.text(A).replace(/premise_override:\n(  .*\n)+/, "")).reason, "PREMISE_OVERRIDE_REWRITTEN",
    "the override stays");
  /* (e) a success record as a rests_on target; one the record does not hold is refused as any unheld target */
  assert.equal(w.promote(B, actionMd(B, [...CP, "action_kind: other", ...legs(SUC)])).ok, true);
  assert.equal(w.promote(C, actionMd(C, [...CP, "action_kind: other", ...legs(SUC_NONE)])).reason, "ACTION_BASIS_REFUSED");
});

test("R74 the override is {ground, reason}: each ground lands; none, or another kind, is OVERRIDE_NO_GROUND with both grounds and the quick route; a malformed ground OVERRIDE_GROUND_REFUSED; a machine states none; one written before T45 reads ground null", () => {
  const { w } = grounded();
  const ov = (id, ground, opts) => w.promote(id, actionMd(id, [...CP, "action_kind: other", "breach: true", ...override(ground)]), opts);
  /* controls: each ground lands */
  assert.equal(ov(A, LEGAL).ok, true);
  assert.equal(ov(B, IRREVERSIBLE).ok, true);
  const none = ov(C, []);
  assert.deepEqual([none.ok, none.reason, none.code, none.grounds, none.quick_route],
    [false, "OVERRIDE_NO_GROUND", "OVERRIDE_NO_GROUND", ["legal_deadline", "irreversible_act"], { kind: "one_finding_case" }]);
  assert.equal(ov(C, ["  ground_kind: hunch"]).reason, "OVERRIDE_NO_GROUND", "another kind");
  assert.equal(ov(C, ["  ground_kind: legal_deadline", '  ground_citation: "Act"', "  ground_date: 2026-02-30"]).reason,
    "OVERRIDE_GROUND_REFUSED", "a date the calendar does not have");
  assert.equal(ov(C, LEGAL, { author: MACHINE }).reason, "MACHINE_CANNOT_OVERRIDE");
  assert.equal(w.record.head(C), null, "nothing was written");
  /* the read and the disclosure carry ground and reason */
  const r = w.a.actionRead({ id: B, viewer: M });
  assert.deepEqual(r.premise_override.ground, { kind: "irreversible_act", what: "the council votes to sell the land", when: "2026-10-14T19:00" });
  assert.deepEqual(r.disclosures.map((x) => [x.kind, x.ground && x.ground.kind, x.reason]), [["override", "irreversible_act", "the deadline falls first"]]);
  /* an override written before T45 reads as written: ground null, the keyed sentence, never re-asked */
  w.promote(D, actionMd(D, [...CP, "action_kind: other", "breach: true", "premise_override:", '  reason: "old"']), { extra: { replay: true } });
  const old = w.a.actionRead({ id: D, viewer: M }).premise_override;
  assert.deepEqual([old.ground, old.ground_not_stated.key], [null, "actions.override.ground_not_stated"]);
  assert.equal(w.promote(D, w.text(D).replace("An action.", "Revised.")).ok, true, "carried forward, never re-asked");
});

test("R75 the read answers disclosures: one per distinct held check and per distinct accepted source edition, and the override's; published findings carry none", () => {
  const { w } = grounded();
  assert.equal(w.promote(A, breach(A, NC)).ok, true);
  assert.deepEqual(w.a.actionRead({ id: A, viewer: M }).disclosures, [
    { kind: "checked_held", checked_at: "2026-11-03" },
    { kind: "accepted", group: "Hayward Parents", edition_date: "2026-09-03", accepted_at: "2026-09-20",
      identity: "Hayward Parents for Accountability", stake: "none declared" }]);
  /* control: an action resting only on published findings answers none */
  assert.equal(w.promote(B, breach(B, PUB)).ok, true);
  assert.deepEqual(w.a.actionRead({ id: B, viewer: M }).disclosures, []);
});

test("R76 the read and actionsFor (basis_void: true) answer basis_void for each void rests_on determination, derived on read; an action over one not void answers []", () => {
  const { w } = grounded();
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: other", ...legs(VO, NC)])).ok, true);
  assert.equal(w.promote(B, actionMd(B, [...CP, "action_kind: other", ...legs(NC)])).ok, true);
  assert.deepEqual(w.a.actionRead({ id: A, viewer: M }).basis_void, [{ determination: VO, causes: CAUSES }]);
  assert.deepEqual(w.a.actionRead({ id: B, viewer: M }).basis_void, [], "control: not void");
  const list = w.a.actionsFor({ viewer: M, basis_void: true });
  assert.deepEqual(list.items.map((x) => [x.id, x.basis_void]), [[A, [{ determination: VO, causes: CAUSES }]]]);
  assert.equal(actions.actionsOps(w.a, new URL(`https://x/?viewer=${M}&basis_void=true`), null).actions().items.length, 1);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_field_history WHERE field='basis_void'`)[0].n, 0, "never written");
});

/* ================================================================ addressing: R9, R77, R78, R79, R94 */

test("R9 (T45) a press addressee may carry holder, kept inside the group: the read and actionsFor only; on another arm COUNTERPARTY_REFUSED; the venue's delivery point beside an office addressee", () => {
  const w = world();
  assert.equal(w.promote(A, actionMd(A, ["action_kind: other", ...press(['  holder: "Jo Reporter"'])])).ok, true);
  assert.deepEqual(w.a.actionRead({ id: A, viewer: M }).press_holder, { name: "Jo Reporter" });
  assert.deepEqual(w.a.actionsFor({ viewer: M }).items[0].holder, { name: "Jo Reporter" });
  const off = w.promote(B, actionMd(B, ["action_kind: other", ...CP, '  holder: "Jo Reporter"']));
  assert.equal(off.reason, "COUNTERPARTY_REFUSED", "an office's holder is read from the lines, never stated");
  /* never in R66's items, whose label names the role and outlet alone */
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M });
  const items = w.a.eventSource({ set: [A], viewer: M });
  assert.ok(!JSON.stringify(items).includes("Jo Reporter"));
  /* the venue's delivery point beside an office addressee, labelled never the addressee */
  assert.equal(w.promote(C, actionMd(C, ["action_kind: bylaw_complaint", ...CP])).ok, true);
  const dp = w.a.actionRead({ id: C, viewer: M }).delivery_point;
  assert.deepEqual([dp.value, dp.citation], ["the front counter of Port Ellery Town Hall", "P.E.B.L. § 7(1)"]);
  assert.match(dp.says, /never the addressee/);
  assert.equal(w.a.actionRead({ id: A, viewer: M }).delivery_point, undefined, "a press addressee: none");
});

test("R77 copied offices: a list lands; the addressee copied is COPIED_IS_ADDRESSEE; a person COUNTERPARTY_REFUSED; a machine MACHINE_CANNOT_SET_COPIED; copied offices are never addressees (R67)", () => {
  const w = world();
  const copied = (...entries) => ["copied:", ...entries.flatMap(([role, body]) => ["  - state: named", `    role: ${role}`, `    body: ${body}`])];
  const md = (id, lines) => actionMd(id, [...CP, "action_kind: records_request", ...lines]);
  assert.equal(w.promote(A, md(A, copied(["Selectboard", "Port Ellery Selectboard"]))).ok, true, "control: another office");
  assert.deepEqual(w.a.actionRead({ id: A, viewer: M }).copied.map((x) => x.role), ["Selectboard"]);
  assert.equal(w.promote(B, md(B, copied(["Town Clerk", "Town of Port Ellery"]))).reason, "COPIED_IS_ADDRESSEE");
  const person = entity(w, "person", "A private resident");
  assert.equal(w.promote(B, md(B, ["copied:", "  - state: named", "    role: Clerk", "    body: Town", `    entity_id: ${person}`])).reason,
    "COUNTERPARTY_REFUSED");
  const m = w.promote(B, md(B, copied(["Selectboard", "Port Ellery Selectboard"])), { author: MACHINE });
  assert.equal(m.reason, "MACHINE_CANNOT_SET_COPIED");
  /* R67 reads the counterparty only: a duty of a copied office is not triggered by the sending */
  const sb = entity(w, "office", "Selectboard");
  assert.equal(w.promote(C, md(C, ["copied:", "  - state: named", "    role: Selectboard", "    body: Port Ellery Selectboard",
    `    entity_id: ${sb}`])).ok, true);
  w.a.actionCorrespond({ target: C, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M });
  assert.deepEqual(w.a.triggerSource({ duty: { obligor: sb, trigger: {} }, viewer: M }), []);
});

test("R78 partners: organisations by role, stated by a member; an entity naming a person or no organisation PARTNERS_REFUSED; shown in the read; a machine MACHINE_CANNOT_SET_PARTNERS", () => {
  const w = world();
  const org = entity(w, "institution", "Harbour Tenants Union"), person = entity(w, "person", "A private resident");
  const md = (id, eid) => actionMd(id, [...CP, "action_kind: other", "partners:", "  - role: Coordinator",
    "    organisation: Harbour Tenants Union", ...(eid ? [`    entity_id: ${eid}`] : [])]);
  assert.equal(w.promote(A, md(A, org)).ok, true, "control: an organisation entry lands");
  assert.deepEqual(w.a.actionRead({ id: A, viewer: M }).partners, [{ role: "Coordinator", organisation: "Harbour Tenants Union", entity_id: org }]);
  const p = w.promote(B, md(B, person));
  assert.deepEqual([p.reason, p.entry], ["PARTNERS_REFUSED", 0]);
  assert.equal(w.promote(B, md(B, "ENT-2026-9999")).reason, "PARTNERS_REFUSED", "no entity");
  assert.equal(w.promote(B, md(B, null), { author: MACHINE }).reason, "MACHINE_CANNOT_SET_PARTNERS");
  assert.equal(w.record.head(B), null);
});

test("R79 press terms on a press action, stated by a member; each change appended to press_terms_history; on another arm PRESS_TERMS_NOT_PRESS; a machine MACHINE_CANNOT_SET_PRESS_TERMS", () => {
  const w = world();
  const terms = (rec) => ["press_terms:", `  on_record: ${rec}`, "  embargo_until: 2026-10-01T09:00"];
  assert.equal(w.promote(A, actionMd(A, ["action_kind: other", ...press(), ...terms("background")])).ok, true, "control");
  w.clock.ms += 60000;
  assert.equal(w.promote(A, w.text(A).replace("on_record: background", "on_record: on_record")).ok, true);
  const r = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual(r.press_terms, { on_record: "on_record", embargo_until: "2026-10-01T09:00" });
  assert.deepEqual(r.press_terms_history.map((h) => [h.seq, h.value.on_record, h.by, h.at]),
    [[1, "background", M, "2026-09-28T12:00:00Z"], [2, "on_record", M, "2026-09-28T12:01:00Z"]]);
  assert.equal(w.promote(B, actionMd(B, ["action_kind: other", ...CP, ...terms("background")])).reason, "PRESS_TERMS_NOT_PRESS");
  assert.equal(w.promote(B, actionMd(B, ["action_kind: other", ...press(), ...terms("background")]), { author: MACHINE }).reason,
    "MACHINE_CANNOT_SET_PRESS_TERMS");
  assert.equal(w.promote(A, w.text(A).replace("An action.", "Revised.")).ok, true, "carried forward");
  assert.equal(w.a.actionRead({ id: A, viewer: M }).press_terms_history.length, 2, "an unchanged revision appends nothing");
});

test("R94 a sent entry may state its speaker, a member, stated by a member; several speakers on one action land; a non-member CONTACT_NOT_A_MEMBER; never in R66's items", async () => {
  const w = world();
  await members(w, "alice", "carol");
  w.action(A);
  const c = (x) => w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "spoke at the sitting", viewer: M, author: M, ...x });
  const one = c({ speaker: "member:alice" }), two = c({ speaker: "carol" });
  assert.deepEqual([one.ok, one.speaker, two.ok, two.speaker], [true, "member:alice", true, "carol"], "control: two speakers");
  assert.deepEqual(w.a.actionRead({ id: A, viewer: M }).entries.map((e) => [e.ord, e.speaker]), [[0, "member:alice"], [1, "carol"]]);
  const no = c({ speaker: "member:nobody" });
  assert.deepEqual([no.reason, no.check], ["CONTACT_NOT_A_MEMBER", actions.contactNotAMember().check]);
  assert.equal(c({ speaker: "a b" }).reason, "SPEAKER_REFUSED");
  assert.equal(w.fm(A).correspondence.length, 2, "nothing written by a refusal");
  /* at the write, a machine revision setting a speaker is refused as a contact is */
  const text = w.text(A).replace("    speaker: carol", "    speaker: member:alice");
  assert.equal(w.promote(A, text, { author: MACHINE }).reason, "MACHINE_CANNOT_SET_CONTACT");
});

/* ================================================================ receipt, responses and outcomes: R80–R83, R85, R86, R95 */

test("R80 actionReceipt: refusals in order; a receipt or a service recorded on a sent entry, appended; actionRead answers receipts oldest first (K2845)", () => {
  const w = world();
  const s = w.doc("INFO-2026-0001-d");
  w.action(A);
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M });
  w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-04", account: "reply", viewer: M, author: M });
  const R = (x) => w.a.actionReceipt({ target: A, ord: 0, at: "2026-09-03", how: "stamped by the clerk", account: "I saw the stamp",
    viewer: M, author: M, ...x });
  assert.deepEqual(reasons([R({ author: MACHINE }), R({ target: "" }), R({ at: "2026-02-30" }), R({ artifactSha: s }),
    R({ account: "" }), R({ target: "ACTN-2026-0404-x" }), R({ target: "INFO-2026-0001-d" }), R({ ord: 1 }),
    R({ account: "", artifactSha: "d".repeat(64) })]),
    ["MACHINE_CANNOT_CORRESPOND", "NO_TARGET", "BAD_DATE", "CAPTURE_AND_TESTIMONY", "NEITHER_CAPTURE_NOR_TESTIMONY",
     "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "RECEIPT_NOT_ON_SENT", "UNREGISTERED_ARTIFACT"]);
  assert.equal(R({ kind: "delivered" }).reason, "RECEIPT_NOT_ON_SENT", "a kind neither receipt nor service");
  assert.equal(R({ kind: "service" }).reason, "BAD_PARTY", "service names the party served");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_receipts`)[0].n, 0, "no refusal writes");
  const one = R({ at: "2026-09-03T10:15" });
  assert.deepEqual([one.ok, one.kind, one.at, one.held_as, one.seq], [true, "receipt", "2026-09-03T10:15", "testimony", 1]);
  w.clock.ms += 60000;
  const two = R({ kind: "service", party: "the Town Clerk", account: "", artifactSha: s });
  assert.deepEqual([two.ok, two.seq, two.held_as], [true, 2, "capture"]);
  const text = w.text(A);
  assert.deepEqual(w.a.actionRead({ id: A, viewer: M }).receipts.map((x) => [x.ord, x.seq, x.kind]), [[0, 1, "receipt"], [0, 2, "service"]]);
  assert.equal(w.text(A), text, "the entry is never rewritten");
  const op = actions.actionsOps(w.a, new URL(`https://x/?target=${A}&ord=0&at=2026-09-05&how=post&account=x&viewer=${M}&author=${M}`), null).actionreceipt();
  assert.equal(op.ok, true);
});

test("R81 a received entry with an outcome may carry office_status, its status of the view's response statuses for the kind; OFFICE_STATUS_UNKNOWN, OFFICE_STATUS_WITHOUT_OUTCOME; the fixed outcome is never replaced", () => {
  const w = world();
  w.promote(A, actionMd(A, [...CP, "action_kind: bylaw_complaint"]));
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "filed", viewer: M, author: M });
  const r = (x) => w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-10", account: "the decision", viewer: M, author: M, ...x });
  const ok = r({ stage: "denial", follows: "0", outcome: "denied", officeStatus: { words: "Not upheld after review", status: "not_upheld" } });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.deepEqual(ok.office_status, { words: "Not upheld after review", status: "not_upheld" });
  const e = w.a.actionRead({ id: A, viewer: M }).entries.find((x) => x.ord === 1);
  assert.deepEqual(e.office_status, { words: "Not upheld after review", status: "not_upheld" });
  assert.equal(w.fm(A).correspondence[1].outcome, "denied", "the fixed outcome stands");
  assert.equal(r({ stage: "denial", follows: "0", outcome: "denied", officeStatus: { words: "x", status: "rubber_stamped" } }).reason,
    "OFFICE_STATUS_UNKNOWN");
  assert.equal(r({ officeStatus: { words: "Under review" } }).reason, "OFFICE_STATUS_WITHOUT_OUTCOME");
});

test("R82 reply_owed: false, set by a member with a reason, each change in its history; while false a no_response is NO_REPLY_OWED and the read says so; absent reads owed", () => {
  const w = world();
  const no = (id) => w.a.actionCorrespond({ target: id, direction: "no_response", at: "2026-09-20", account: "the window closed", viewer: M, author: M });
  w.action(B);
  assert.equal(no(B).ok, true, "control: absent reads owed");
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: other", "reply_owed: false"])).reason, "REPLY_OWED_REFUSED", "no reason");
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: other", "reply_owed: false", 'reply_owed_reason: "a press statement"']),
    { author: MACHINE }).reason, "MACHINE_CANNOT_SET_REPLY_OWED");
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: other", "reply_owed: no", 'reply_owed_reason: "x"'])).reason, "REPLY_OWED_REFUSED");
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: other", "reply_owed: false", 'reply_owed_reason: "a public statement"'])).ok, true);
  const refused = no(A);
  assert.deepEqual([refused.reason, refused.key], ["NO_REPLY_OWED", "actions.reply.not_owed"]);
  const r = w.a.actionRead({ id: A, viewer: M }).reply_owed;
  assert.deepEqual([r.owed, r.key, r.history.map((h) => [h.value, h.reason, h.by])], [false, "actions.reply.not_owed",
    [[false, "a public statement", M]]]);
  assert.equal(w.a.actionRead({ id: B, viewer: M }).reply_owed.owed, true);
});

test("R83 a received entry may state found_elsewhere, held as a capture: no responds_to edge is added; without one FOUND_ELSEWHERE_NEEDS_CAPTURE; the same entry without it adds the edge", () => {
  const w = world();
  const s = w.doc("INFO-2026-0001-d"), s2 = w.doc("INFO-2026-0002-e");
  w.action(A);
  const r = (x) => w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-10", viewer: M, author: M, ...x });
  const fe = r({ artifactSha: s, foundElsewhere: { kind: "press", note: "quoted in the Gazette" } });
  assert.deepEqual([fe.ok, fe.found_elsewhere, fe.responds_to], [true, { kind: "press", note: "quoted in the Gazette" }, undefined]);
  assert.equal((w.fm("INFO-2026-0001-d").references || []).length, 0, "no edge");
  assert.equal(r({ account: "I read it", foundElsewhere: { kind: "press" } }).reason, "FOUND_ELSEWHERE_NEEDS_CAPTURE");
  assert.equal(r({ artifactSha: s2, foundElsewhere: { kind: "rumour" } }).reason, "FOUND_ELSEWHERE_REFUSED");
  assert.deepEqual(r({ artifactSha: s2 }).responds_to, { bundle_id: "INFO-2026-0002-e", already: false }, "control: a direct reply");
});

test("R85 a records request's stage not in its law's listed stages is STAGE_NOT_IN_LAW; a listed stage lands; with no list it lands and reads undetermined", () => {
  const w = world();
  w.action(A, ['law: "Test Stat. § 1.100"']);
  w.action(B, ['law: "Port Ellery Open Government Bylaw"']);
  const c = (id, x) => w.a.actionCorrespond({ target: id, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M, ...x });
  assert.equal(c(A, { stage: "request" }).ok, true, "control: a listed stage");
  const out = c(A, { stage: "fee_waiver_request", follows: "0" });
  assert.deepEqual([out.reason, out.stages], ["STAGE_NOT_IN_LAW", ["request", "denial", "appeal", "appeal_decision"]]);
  assert.equal(c(B, { stage: "request" }).ok, true);
  assert.equal(c(B, { stage: "fee_waiver_request", follows: "0" }).ok, true, "no stages listed");
  assert.deepEqual(w.a.actionRead({ id: B, viewer: M }).entries.map((e) => e.stage_in_law), ["undetermined", "undetermined"]);
  assert.deepEqual(w.a.actionRead({ id: A, viewer: M }).entries.map((e) => e.stage_in_law), ["in_law"]);
});

test("R86 follows_action: stated on creation, naming a visible action other than itself; never changed; the read answers follows_action and followed_by; actionsFor takes follows", () => {
  const w = world();
  w.action(A);
  const md = (id, f) => actionMd(id, [...CP, "action_kind: other", "follows_action:", `  action: ${f}`, "  ord: 0"]);
  assert.equal(w.promote(B, md(B, A)).ok, true, "control: a visible earlier action");
  assert.deepEqual(w.a.actionRead({ id: B, viewer: M }).follows_action, { action: A, ord: 0 });
  assert.deepEqual(w.a.actionRead({ id: A, viewer: M }).followed_by, [{ action: B, ord: 0 }]);
  assert.deepEqual(w.a.actionsFor({ viewer: M, follows: A }).items.map((x) => x.id), [B]);
  assert.equal(w.promote(C, md(C, C)).reason, "FOLLOWS_ACTION_SELF");
  const hidden = w.promote(C, md(C, "ACTN-2026-0404-x"));
  assert.deepEqual(hidden, { ...actions.noSuchAction("ACTN-2026-0404-x") });
  assert.equal(w.promote(B, w.text(B).replace(`action: ${A}`, `action: ${C}`)).reason, "FOLLOWS_ACTION_REWRITTEN");
  assert.equal(w.promote(D, actionMd(D, [...CP, "action_kind: other"])).ok, true);
  assert.equal(w.promote(D, w.text(D).replace("action_kind: other", `action_kind: other\nfollows_action:\n  action: ${A}`)).reason,
    "FOLLOWS_ACTION_REWRITTEN", "never added by a revision");
});

test("R95 registerResponseListener: one per module; each listener called once after a received entry is promoted, with the action, entry, project, recorder and date; a throw never undoes it; a sent entry or a refused write calls none", () => {
  const w = world();
  w.action(A);
  const heard = [];
  assert.deepEqual(w.a.registerResponseListener("plan-work", (x) => heard.push(x)), { ok: true, module: "plan-work" });
  assert.equal(w.a.registerResponseListener("plan-work", () => {}).reason, "LISTENER_DECLARED");
  assert.equal(w.a.registerResponseListener("", () => {}).reason, "LISTENER_MALFORMED");
  assert.equal(w.a.registerResponseListener("other", () => { throw new Error("boom"); }).ok, true);
  const c = (x) => w.a.actionCorrespond({ target: A, at: "2026-09-02", account: "x", viewer: M, author: M, ...x });
  assert.equal(c({ direction: "sent" }).ok, true);
  assert.deepEqual(heard, [], "control: a sent entry calls no listener");
  const got = c({ direction: "received", at: "2026-09-04" });
  assert.equal(got.ok, true, "a listener that throws never refuses the entry");
  assert.deepEqual(heard, [{ action: A, ord: 1, project: null, recorder: M, at: "2026-09-04" }]);
  assert.equal(c({ direction: "received", at: "2026-02-31" }).reason, "BAD_DATE");
  assert.equal(heard.length, 1, "a refused write calls nothing");
});

/* ================================================================ scopes and promises: R87, R88 */

test("R87 actionScope: refusals in order; each statement appended; the read and actionsFor answer confidential (K2850); a confidential action is not answered by R66, and is again once removed", () => {
  const w = world();
  const office = entity(w, "office", "Town Clerk");
  w.promote(B, actionMd(B, ["counterparty:", "  state: named", "  role: Town Clerk", "  body: Town of Port Ellery", `  entity_id: ${office}`,
    "action_kind: other"]));
  w.a.actionCorrespond({ target: B, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M });
  const S = (x) => w.a.actionScope({ target: B, confidential: true, reason: "a source's safety", viewer: M, author: M, ...x });
  assert.deepEqual(reasons([S({ author: MACHINE }), S({ target: "" }), S({ reason: "" }), S({ reason: 'a"b' }),
    S({ target: "ACTN-2026-0404-x" }), S({ target: "INFO-2026-0404-x" }), S({ confidential: false })]),
    ["MACHINE_CANNOT_SET_SCOPE", "NO_TARGET", "SCOPE_NO_REASON", "BAD_REASON", "NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE", "SCOPE_UNCHANGED"]);
  const src = () => w.a.eventSource({ set: [office], viewer: M });
  assert.equal(src().length, 1, "control: answered while not confidential");
  assert.equal(w.a.actionRead({ id: B, viewer: M }).confidential, false);
  const set = S({});
  assert.deepEqual([set.ok, set.confidential, set.by, set.published.key], [true, true, M, "actions.scope.published_stays"]);
  assert.equal(S({}).reason, "SCOPE_UNCHANGED");
  assert.deepEqual(src(), [], "a confidential action is not answered");
  assert.equal(w.a.actionRead({ id: B, viewer: M }).confidential, true, "seen inside the group as before");
  assert.equal(w.a.actionsFor({ viewer: M }).items.find((x) => x.id === B).confidential, true);
  assert.equal(S({ confidential: "false", reason: "the source has gone public" }).ok, true);
  assert.equal(src().length, 1, "answered again once removed");
  assert.deepEqual(w.a.actionRead({ id: B, viewer: M }).scope.statements.map((x) => x.confidential), [true, false]);
});

test("R88 actionPromise: refusals in order; a promise recorded and ended by a later one, appended; every viewer who sees the action reads them, standing apart from ended", () => {
  const w = world();
  w.action(A);
  const P = (x) => w.a.actionPromise({ target: A, kind: "anonymity", text: "we will not name the source", viewer: M, author: M, ...x });
  assert.deepEqual(reasons([P({ author: MACHINE }), P({ target: "" }), P({ kind: "secrecy" }), P({ text: "" }),
    P({ text: "x".repeat(501) }), P({ ends: "one" }), P({ target: "ACTN-2026-0404-x" }), P({ ends: 9 })]),
    ["MACHINE_CANNOT_RECORD_PROMISE", "NO_TARGET", "PROMISE_REFUSED", "PROMISE_REFUSED", "PROMISE_REFUSED", "PROMISE_REFUSED",
     "NO_SUCH_BUNDLE", "PROMISE_REFUSED"]);
  const one = P({});
  assert.deepEqual([one.ok, one.seq, one.kind], [true, 1, "anonymity"]);
  P({ kind: "embargo", text: "nothing before the 9th" });
  const end = P({ kind: "anonymity", text: "the source asked to be named", ends: 1 });
  assert.equal(end.ok, true);
  const r = w.a.actionRead({ id: A, viewer: V("bob") }).promises;
  assert.deepEqual(r.standing.map((p) => p.seq), [2]);
  assert.deepEqual(r.ended.map((p) => [p.seq, p.ended_by.seq, p.ended_by.text]), [[1, 3, "the source asked to be named"]]);
  assert.equal(P({ ends: 1 }).reason, "PROMISE_REFUSED", "an ended promise is not standing");
});

/* ================================================================ guards and recognition: R92, R93 */

test("R92 openItemsWith: the visible open actions to the same office (entity id, else role and body), each with its first sent date and overdue reply, and their count; a non-office answers none with its sentence; an action to another office is not listed", () => {
  const w = world();
  const other = ["counterparty:", "  state: named", "  role: Selectboard", "  body: Port Ellery Selectboard"];
  const clock = ["clock:", '  - text: "reply"', '    description: "d"', "    date: 2026-09-10", "    basis: Act s.2", "    status: pending"];
  w.action(A, clock);
  w.action(B);
  w.promote(C, actionMd(C, [...other, "action_kind: other"]));
  w.action(D);
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M });
  w.a.actionMove({ target: D, to: "abandoned", reason: "dropped", viewer: M, author: M });
  const r = w.a.openItemsWith({ counterparty: { state: "named", role: "Town Clerk", body: "Town of Port Ellery" }, viewer: M });
  assert.deepEqual(r.items.map((x) => [x.action, x.first_sent, x.clock_overdue]), [[A, "2026-09-02", true], [B, null, false]],
    "control: C (another office) and D (abandoned) are not listed");
  assert.equal(r.overdue_replies, 1);
  assert.deepEqual(w.a.openItemsWith({ action: A, viewer: M }).items.map((x) => x.action), [B], "by an action: the others");
  const aud = w.a.openItemsWith({ counterparty: { state: "audience", description: "readers" }, viewer: M });
  assert.deepEqual([aud.items, aud.key], [[], "actions.openitems.not_office"]);
  assert.deepEqual(w.a.openItemsWith({ action: A, viewer: "nobody" }).reason, "NO_SUCH_BUNDLE");
  const op = actions.actionsOps(w.a, new URL(`https://x/?action=${C}&viewer=${M}`), null).openitemswith();
  assert.deepEqual(op.items, []);
});

test("R93 a recognition (the view's shape: recognition) answers recognition_basis: compliant, success or promise_only with its sentence; nothing is refused for it", () => {
  const { w } = grounded();
  const rec = (id, ...ids) => w.promote(id, actionMd(id, [...CP, "action_kind: recognition_letter", ...(ids.length ? legs(...ids) : [])]));
  assert.equal(rec(A, CO).ok, true);
  assert.equal(rec(B, SUC).ok, true);
  assert.equal(rec(C).ok, true, "nothing is refused for its basis");
  const basis = (id) => w.a.actionRead({ id, viewer: M }).recognition_basis;
  assert.deepEqual(basis(A), { basis: "compliant" });
  assert.deepEqual(basis(B), { basis: "success" }, "control: a success-record leg");
  assert.deepEqual([basis(C).basis, basis(C).key], ["promise_only", "actions.recognition.promise_only"]);
  w.action(D);
  assert.equal(w.a.actionRead({ id: D, viewer: M }).recognition_basis, undefined, "another kind: not asked");
});

/* ================================================================ registrations, view, events, machine fence, tables */

test("R97 at start actions registers once with consequences.registerOwnActReader and standards.registerOwnSendingCheck; each answers the group's own acts and sendings, names back only what it was given; an id of no action is not answered", () => {
  /* the composition root's environment: actions reaches the real standards on its host, as the plane does */
  const { w, cons } = grounded({ deps: { env: {} } });
  const s = w.doc("INFO-2026-0001-d"), other = w.doc("INFO-2026-0002-e");
  w.action(A);
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", artifactSha: s, viewer: M, author: M });
  w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-04", artifactSha: other, viewer: M, author: M });
  assert.equal(cons.readers.length, 1, "registered once");
  assert.deepEqual(cons.readers[0]({ ids: [A, s, other, "INFO-2026-0001-d", "ACTN-2026-0404-x"], viewer: "nobody" }), [A, s],
    "whatever the viewer; a received capture and an id of no action are not answered");
  /* the real standards: actions holds its check */
  assert.equal(w.a.standards.registerOwnSendingCheck("monitoring", () => false).reason, "LISTENER_DECLARED");
  assert.deepEqual([w.a.ownSending({ captureSha: s }), w.a.ownSending({ captureSha: other })], [true, false]);
  assert.equal(actions.actionsOf(w.host), w.a);
  assert.equal(cons.readers.length, 1, "a second actionsOf registers nothing");
  /* a host given neither, and no environment, registers with neither (its composer makes them) */
  const bare = world({ deps: { consequences: undefined } });
  assert.equal(bare.a.standards.registerOwnSendingCheck("monitoring", () => false).ok, true);
});

test("R10 the kinds read the group's governing view (local-facts R12): with no group rule, byte-identical to combine's; with no profile, the product's alone", () => {
  const w = world();
  assert.equal(JSON.stringify(w.a.kinds()), JSON.stringify(grammar.actionKinds(combine(["test-port-ellery"]).view)));
  assert.deepEqual(world({ profiles: null }).a.kinds(), [...grammar.PRODUCT_KINDS]);
});

test("R66 (T45) the event source never answers a confidential act, a counsel matter, an action never sent or a move before its first sending, for any caller; under audience public only the outward acts, each marked public", () => {
  const P = "PROJ-2026-0001-counsel";
  const roster = { projectScope: (p) => ({ scope: p === P ? "counsel_matter" : "none", since: null, by: null }) };
  const w = world({ deps: { projectRoster: roster } });
  const office = entity(w, "office", "Town Clerk");
  const cp = ["counterparty:", "  state: named", "  role: Town Clerk", "  body: Town of Port Ellery", `  entity_id: ${office}`];
  for (const id of [A, B, C]) assert.equal(w.promote(id, actionMd(id, [...cp, "action_kind: other"])).ok, true);
  w.record.bundleInfo = ((orig) => (id) => (id === C ? { ...orig(id), project: P } : orig(id)))(w.record.bundleInfo.bind(w.record));
  w.a.actionMove({ target: A, to: "active", reason: "planned", viewer: M, author: M });
  w.clock.ms = Date.parse("2026-10-01T12:00:00Z");
  for (const [id, d] of [[A, "2026-09-30"], [C, "2026-09-30"]])
    w.a.actionCorrespond({ target: id, direction: "sent", at: d, account: "asked", viewer: M, author: M });
  w.a.actionCorrespond({ target: A, direction: "received", at: "2026-10-01", account: "reply", viewer: M, author: M });
  w.a.actionMove({ target: A, to: "awaiting_response", reason: "sent", viewer: M, author: M });
  const src = (x) => w.a.eventSource({ set: [office], viewer: M, ...x });
  assert.deepEqual(src().map((i) => [i.ref, i.kind]), [[`${A}#correspondence/0`, "correspondence_sent"],
    [`${A}#correspondence/1`, "correspondence_received"], [`${A}#move/1`, "move"]],
    "B was never sent; C is a counsel matter's; A's move before its sending is left out");
  assert.ok(src().every((i) => !("public" in i)));
  assert.deepEqual(src({ audience: "public" }).map((i) => [i.ref, i.public]), [[`${A}#correspondence/0`, true], [`${A}#move/1`, true]],
    "a received entry is not an outward act");
  /* control: the same counsel action in a project of scope none is answered */
  roster.projectScope = () => ({ scope: "none", since: null, by: null });
  assert.ok(src().some((i) => i.ref.startsWith(C)));
  /* through the real events module, as case-authoring asks it */
  const lane = w.a.events.timeline({ set: [office], viewer: M, audience: "public" }).ours.sources.find((x) => x.source === "actions");
  assert.ok(lane.items.length && lane.items.every((i) => i.public === true), JSON.stringify(lane));
});

test("R33 (T45) a machine credential states no override ground, partners, copied offices, press terms, reply_owed, scope, promise, receipt or speaker", () => {
  const { w } = grounded();
  w.action(A);
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M });
  const mach = (lines) => w.promote(B, actionMd(B, [...CP, "action_kind: other", ...lines]), { author: MACHINE }).reason;
  assert.deepEqual([mach(["breach: true", ...override(LEGAL)]),
    mach(["partners:", "  - role: Chair", "    organisation: Union"]),
    mach(["copied:", "  - state: named", "    role: Selectboard", "    body: Port Ellery Selectboard"]),
    mach(["reply_owed: false", 'reply_owed_reason: "x"']),
    w.a.actionScope({ target: A, confidential: true, reason: "r", viewer: MACHINE, author: MACHINE }).reason,
    w.a.actionPromise({ target: A, kind: "other", text: "t", viewer: MACHINE, author: MACHINE }).reason,
    w.a.actionReceipt({ target: A, ord: 0, at: "2026-09-03", how: "h", account: "a", viewer: MACHINE, author: MACHINE }).reason,
    w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-03", account: "a", speaker: "alice", viewer: MACHINE, author: MACHINE }).reason],
    ["MACHINE_CANNOT_OVERRIDE", "MACHINE_CANNOT_SET_PARTNERS", "MACHINE_CANNOT_SET_COPIED", "MACHINE_CANNOT_SET_REPLY_OWED",
     "MACHINE_CANNOT_SET_SCOPE", "MACHINE_CANNOT_RECORD_PROMISE", "MACHINE_CANNOT_CORRESPOND", "MACHINE_CANNOT_CORRESPOND"]);
  assert.equal(w.promote(C, actionMd(C, ["action_kind: other", ...press(), "press_terms:", "  on_record: background"]), { author: MACHINE }).reason,
    "MACHINE_CANNOT_SET_PRESS_TERMS");
  assert.equal(w.record.head(B), null);
});

test("R36 (T45) the new tables (receipts, scopes, promises, the press-terms and reply-owed histories) are keyed by bundle_id, listed and purged with the action", () => {
  const w = world();
  w.action(A, ["reply_owed: false", 'reply_owed_reason: "a statement"']);
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M });
  w.a.actionReceipt({ target: A, ord: 0, at: "2026-09-03", how: "by hand", account: "handed over", viewer: M, author: M });
  w.a.actionScope({ target: A, confidential: true, reason: "r", viewer: M, author: M });
  w.a.actionPromise({ target: A, kind: "other", text: "t", viewer: M, author: M });
  const tables = ["action_receipts", "action_scopes", "action_promises", "action_field_history"];
  for (const t of tables) {
    assert.ok(actions.ACTIONS_TABLES.includes(t), t);
    assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ${t} WHERE bundle_id=?`, A)[0].n, 1, t);
  }
  w.record.purge({ bundleId: A });
  for (const t of tables) assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ${t} WHERE bundle_id=?`, A)[0].n, 0, t);
});

test("R8 R74 R77 R78 R79 R80 R82 R85 R86 R87 R88 (T45) each code this module mints has its row in action-grammar's C-117 (R9), and each row naming this module names a region its source holds", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(new URL("../../../src/actions/index.mjs", import.meta.url), "utf8");
  /* the codes whose act moved to action-holds (its R1, R2, R5–R7; K2781 (1)): their rows are re-pointed by action-grammar,
     reported at this job's COMPLETE, so they are not this module's to hold */
  const MOVED = new Set(["PRESSURE_MARKED", "PRESSURE_NO_ENTRY", "MACHINE_CANNOT_SET_HOLD", "HOLD_REFUSED", "HOLD_NO_LEGAL_MARK",
    "HOLD_RELEASE_IS_ITS_OWN_ACT", "HOLD_PROJECTS_REFUSED", "HOLD_ALREADY_RELEASED"]);
  const rows = Object.entries(grammar.ACTION_CATALOGUE_CHECKS)
    .filter(([code, r]) => r.where.startsWith("src/actions/index.mjs ") && !MOVED.has(code));
  for (const [code, r] of rows) {
    const [fn, region] = r.where.slice("src/actions/index.mjs ".length).split(" > ");
    assert.ok(src.includes(`DEC-49 REGION ${region} `) || src.includes(`DEC-49 REGION ${region}\n`) || src.includes(`DEC-49 REGION ${region} */`), `${code}: ${region}`);
    assert.ok(src.includes(`END DEC-49 REGION ${region}`), `${code}: its region ends`);
    assert.ok(new RegExp(`(^|\\s)${fn.replace(/[#$]/g, "\\$&")}\\(`, "m").test(src), `${code}: ${fn}`);
  }
  for (const code of ["DETERMINATION_NOT_NONCOMPLIANT", "OVERRIDE_NO_GROUND", "MACHINE_CANNOT_SET_COPIED", "MACHINE_CANNOT_SET_PARTNERS",
                      "PARTNERS_REFUSED", "MACHINE_CANNOT_SET_PRESS_TERMS", "RECEIPT_NOT_ON_SENT", "MACHINE_CANNOT_SET_REPLY_OWED",
                      "NO_REPLY_OWED", "STAGE_NOT_IN_LAW", "FOLLOWS_ACTION_REWRITTEN", "MACHINE_CANNOT_SET_SCOPE", "SCOPE_NO_REASON",
                      "SCOPE_UNCHANGED", "MACHINE_CANNOT_RECORD_PROMISE", "PROMISE_REFUSED"])
    assert.ok(rows.some(([c]) => c === code), `${code} has its row`);
});

test("R97 over the real consequences (its R19): actions' reader is the one registered; a second registration is refused naming actions", () => {
  const w = world({ deps: { env: {} } });
  const again = w.a.consequences.registerOwnActReader(() => [], "monitoring");
  assert.deepEqual([again.ok, again.reason, again.module], [false, "LISTENER_DECLARED", "actions"]);
  w.action(A);
  assert.deepEqual(w.a.ownActIds({ ids: [A, "ACTN-2026-0404-x"] }), [A], "control: an id of no action is not answered");
});

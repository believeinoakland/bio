/* affordances: R19's backing for every op op-grades' `t35.mjs` grades `reasoned` (its R22, K2043; K2049), each driven at
   its owning module's own interface over that module's own fixture, as t33-backing.test.mjs drives T33's: called
   well-formed but without its authored reason, it is refused with its owner's code, which is in JUSTIFICATION_REFUSALS;
   called with it, it is accepted. The last test holds the list driven here to the ops `t35.mjs` grades `reasoned`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/op-grades/index.mjs";
import { T35_RUNGS } from "../../../src/op-grades/t35.mjs";

/* Each op driven below, by its owner; the last test holds this list to t35.mjs. */
const DRIVEN = [
  "standardforce", "standardforcewithdraw", "standardrelease", "standardadoption", "standardimpose", "standardbenchmark",
  "usewithdraw",
  "uselink", "useunlink",
];

/* The backing of one op: graded `reasoned`; without its reason refused with `code`, in the family; with it accepted. */
function backed(op, code, refused, accepted) {
  assert.ok(DRIVEN.includes(op), op);
  assert.equal(RUNGS[op], "reasoned", op);
  const got = refused?.code ?? refused?.reason;
  assert.notEqual(refused?.ok, true, `${op}: accepted without its reason: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.equal(got, code, `${op}: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.ok(JUSTIFICATION_REFUSALS.includes(got), `${op}: ${got} is not in JUSTIFICATION_REFUSALS`);
  assert.equal(accepted?.ok, true, `${op}: refused with its reason: ${JSON.stringify(accepted).slice(0, 300)}`);
}

/* ---- standards (R35, R37, R40, R43) ---- */
import * as stFix from "../standards/fixture.mjs";

test("R19: standards' standardforce (declared and confirmed), standardforcewithdraw, standardrelease, standardadoption, "
   + "standardimpose and standardbenchmark, graded `reasoned` (op-grades R22), are refused without their reason with "
   + "STANDARD_NO_REASON, in JUSTIFICATION_REFUSALS, and accepted with it", () => {
  const B = stFix.V("bob"), REASON = stFix.REASON;
  const policyWith = (w, words, extra = {}) => {
    const t = w.passage("hso", { text: words });
    const id = w.declare({ cite: "HSO 4/21 para 3", kind: "policy", issuer: "Harbour Master", text: [t.contentId],
                           portion: { path: "3", content_id: t.contentId }, ...extra }).id;
    return { id, t };
  };
  /* standardforce, its declaring arm (forceDeclare) */
  {
    const w = stFix.seeded();
    const { id, t } = policyWith(w, "The Harbour Master may waive the fee at their discretion.");
    const holder = w.entity("Harbour Master");
    const call = (x) => w.s.forceDeclare({ standard: id, portion: "3", force: "discretionary", holder, criteria: "none",
                                           citation: t.contentId, author: B, viewer: B, ...x });
    backed("standardforce", "STANDARD_NO_REASON", call({ reason: "" }), call({ reason: REASON }));
  }
  /* standardforce, its confirming arm (forceConfirm of a machine's proposal) */
  {
    const w = stFix.seeded();
    const { id, t } = policyWith(w, "Every vessel shall report.");
    const prop = w.s.forcePropose({ standard: id, portion: "3", force: "mandatory", citation: t.contentId, why: "Reads 'shall'.",
                                    proposer: stFix.MACHINE });
    assert.equal(prop.ok, true, JSON.stringify(prop).slice(0, 300));
    const call = (x) => w.s.forceConfirm({ proposal: prop.proposal.id, author: B, viewer: B, ...x });
    backed("standardforce", "STANDARD_NO_REASON", call({ reason: "" }), call({ reason: REASON }));
  }
  /* standardforcewithdraw */
  {
    const w = stFix.seeded();
    const { id, t } = policyWith(w, "The Harbour Master may waive the fee at their discretion.");
    const f = w.s.forceDeclare({ standard: id, portion: "3", force: "discretionary", holder: w.entity("Harbour Master"),
                                 criteria: "none", citation: t.contentId, reason: REASON, author: B, viewer: B });
    assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
    const call = (x) => w.s.forceWithdraw({ force: f.force.id, author: B, ...x });
    backed("standardforcewithdraw", "STANDARD_NO_REASON", call({ reason: "" }), call({ reason: "The clause was misread." }));
  }
  /* standardrelease: a policy whose text is filed in a project only its owner sees */
  {
    const w = stFix.seeded();
    const P = w.project("Source material", "alice");
    const hidden = w.passage("leaked", { text: "Staff shall not discuss the waiver." });
    w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, P, hidden.contentId);
    w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, hidden.bundleId);
    const A = stFix.V("alice");
    const r = w.declare({ cite: "HSO 4/21 para 3", kind: "policy", issuer: "Harbour Master", text: [hidden.contentId],
                          portion: { path: "3", content_id: hidden.contentId }, author: A, viewer: A });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    const call = (x) => w.s.releaseStandard({ standard: r.id, author: A, ...x });
    backed("standardrelease", "STANDARD_NO_REASON", call({ reason: "" }), call({ reason: "The source agreed." }));
  }
  /* standardadoption */
  {
    const w = stFix.seeded();
    const std = w.declare({ cite: "MHS 101-2020 edition", kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
    const at = w.passage().contentId;
    const act = w.declare({ text: [at], issuer: "Port Ellery Selectboard" }).id;
    const call = (x) => w.s.adoptionRecord({ standard: std, act, edition: "2020", from: "2021-07-01", mode: "by_reference",
                                             citation: at, author: B, viewer: B, ...x });
    backed("standardadoption", "STANDARD_NO_REASON", call({ reason: "" }), call({ reason: REASON }));
  }
  /* standardimpose and standardbenchmark */
  {
    const w = stFix.seeded();
    const body = w.entity("Port Ellery Selectboard"), other = w.entity("Marlow Schools Board");
    const lawText = w.passage().contentId;
    const statute = w.declare({ cite: "Some Code § 4", kind: "statute", issuer: "State", period: { from: "2020-01-01", to: "2040-12-31" } }).id;
    const law = w.declare({ cite: "PEBL § 70", text: [lawText], issuer: "State", period: { from: "2022-01-01", to: "2040-01-01" } }).id;
    const impose = (x) => w.s.impositionRecord({ standard: statute, body, law, citation: lawText, author: B, viewer: B, ...x });
    backed("standardimpose", "STANDARD_NO_REASON", impose({ reason: "" }), impose({ reason: REASON }));
    const pol = w.declare({ cite: "Board Rule A12", kind: "policy", issuer: other, period: { from: "2020-01-01", to: null } }).id;
    const bench = (x) => w.s.benchmarkDeclare({ standard: pol, body, author: B, ...x });
    backed("standardbenchmark", "STANDARD_NO_REASON", bench({ reason: "" }), bench({ reason: "We compare against it." }));
  }
});

/* ---- events (R45) ---- */
import * as evFix from "../events/fixture.mjs";

test("R19: events' usewithdraw, graded `reasoned` (op-grades R22), is refused without its reason with NO_REASON, in "
   + "JUSTIFICATION_REFUSALS, and accepted with it", () => {
  const M = evFix.MEMBER;
  const w = evFix.world();
  const page = (n) => ({ kind: "pdf-page", page: n });
  const texts = ["The director grants the variance.", "Reason: the lot is too narrow for the setback."];
  const s = w.capture("t35-use", { pages: texts.length, units: texts.map((text, i) => ({ seq: i, extent: page(i), text })) });
  const director = w.entity("Dana Director"), owner = w.entity("Owen Owner");
  const signed = w.ev.recordDatedFact({ captureSha: s, extent: page(0), kind: "signed", value: "2026-03-04", method: "read by a member", by: M });
  const d = w.ev.recordDiscretion({ kind: "discretion", provision: { standard: "STD-2026-0001", portion: "§4.2" },
    statedReason: { captureSha: s, extent: page(1) }, outcome: { value: "granted", extent: { captureSha: s, extent: page(0) } },
    attestations: [{ datedFactId: signed.dated_fact.dated_fact_id }],
    participants: [{ entityId: director, role: "decider", attestation: 0 }, { entityId: owner, role: "subject", attestation: 0 }],
    by: M });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const call = (x) => w.ev.withdrawUse({ eventId: d.event_id, by: M, ...x });
  backed("usewithdraw", "NO_REASON", call({ reason: " " }), call({ reason: "recorded against the wrong permit" }));
});

/* ---- duties (R27) ---- */
import * as duFix from "../duties/fixture.mjs";

test("R19: duties' uselink and useunlink, graded `reasoned` (op-grades R22), are refused without their reason with "
   + "DUTY_NO_REASON, in JUSTIFICATION_REFUSALS, and accepted with it", () => {
  const B = duFix.BOB, E = duFix.E, ZONE = duFix.ZONE;
  const w = duFix.world();
  const charter = w.standard({ cite: "Test Code § 502", portion: "s502" });
  const power = w.declare({ modality: "power", obligee: null, performance: { act: "grant variances" },
                            source: { kind: "standard", standard: charter, portion: "s502" }, time: { basis: "window" } }).duty_id;
  const use = w.use({ decider: E.council, value: { value: "2026-02-15", precision: "day", zone: ZONE } });
  const link = (x) => w.duties.linkUse({ dutyId: power, eventId: use, by: B, ...x });
  backed("uselink", "DUTY_NO_REASON", link({ reason: " " }), link({ reason: "the minutes say it was under s502" }));
  const unlink = (x) => w.duties.unlinkUse({ dutyId: power, eventId: use, by: B, ...x });
  backed("useunlink", "DUTY_NO_REASON", unlink({ reason: " " }), unlink({ reason: "the minutes were misread" }));
});

/* ---- the list ---- */
test("R19: every op op-grades' t35.mjs grades `reasoned` is driven here", () => {
  const graded = Object.keys(T35_RUNGS).filter((op) => T35_RUNGS[op] === "reasoned").sort();
  assert.deepEqual([...new Set(DRIVEN)].sort(), graded);
});

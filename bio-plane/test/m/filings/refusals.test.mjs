/* filings — every refusal of its own carries its code, its C-115 row and the member's translation (DEC-49, K248), a
   missing action is answered through actions' `noSuchAction` (its R43; N217, K275), and a provider not yet present is
   refused, never passed (K248). Driven at the module's interface, over the real modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, STRANGER, WORDS } from "./fixture.mjs";
import { FILINGS_CHECKS, Filings } from "../../../src/filings/index.mjs";
import { noSuchAction } from "../../../src/actions/index.mjs";
import { FILING_TEMPLATE_CHECKS } from "../../../src/filing-templates/index.mjs";

test("R1 R6 R7 R8 R11 R13 R14 R21 R23 R28 R31 R32 each refusal of this module carries its code, its C-115 row and translation; one actions answered passes through as it came", async () => {
  const x = world();
  const A = x.action();
  const T3 = x.action({ kind: "commitment_claim" });
  const seen = new Set();
  const expect = (r, code) => {
    assert.equal(r.ok, false);
    assert.equal(r.reason, code);
    assert.deepEqual([r.code, r.check, r.translation], [code, FILINGS_CHECKS[code].check, FILINGS_CHECKS[code].translation]);
    seen.add(code);
  };
  const f = x.f;
  expect(f.filingPrepare({ action: A, preparer: "" }), "FILING_NO_PREPARER");
  assert.deepEqual(f.filingPrepare({ action: "NONE", preparer: V("bo"), viewer: V("bo") }), noSuchAction("NONE"),
                   "actions' answer, its row");
  const prep = (action) => f.filingPrepare({ action, preparer: V("bo"), viewer: V("bo") });
  expect(prep(x.action({ state: "resolved", resolution: "complied" })), "ACTION_CLOSED");
  expect(prep(x.action({ risk_tier: undefined })), "FILING_TIER_UNDETERMINED");
  expect(prep(T3), "TIER3_COUNSEL_PACKET");
  const d = f.filingPrepare({ action: A, text: WORDS, preparer: V("bo"), viewer: V("bo") });
  expect((await f.filingApprove({ filing: d.id, author: MACHINE })), "MACHINE_CANNOT_APPROVE");
  expect((await f.filingApprove({ filing: "NONE", author: V("bo"), viewer: V("bo") })), "NO_SUCH_FILING");
  expect((await f.filingApprove({ filing: d.id, author: V("bo"), viewer: V("bo") })), "STILL_UNFILLED");
  expect((await f.filingApprove({ filing: d.id, text: "\uDC00", author: V("bo"), viewer: V("bo") })), "TEXT_UNWRITABLE");
  expect(f.filingRecordSent({ filing: d.id, author: MACHINE }), "MACHINE_CANNOT_FILE");
  expect(f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "x", author: V("bo"), viewer: V("bo") }), "NOT_APPROVED");
  (await f.filingApprove({ filing: d.id, text: "Filed words.", author: V("bo"), viewer: V("bo") }));
  expect((await f.filingApprove({ filing: d.id, text: "Other words.", author: V("bo"), viewer: V("bo") })), "ALREADY_APPROVED");
  const passed = f.filingRecordSent({ filing: d.id, at: "not a date", account: "x", author: V("bo"), viewer: V("bo") });
  assert.equal(passed.reason, "BAD_DATE");
  assert.doesNotMatch(String(passed.check), /^C-115\./, "actions' refusal passes through as it came, its own row");
  f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "x", author: V("bo"), viewer: V("bo") });
  expect(f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "x", author: V("bo"), viewer: V("bo") }), "ALREADY_SENT");
  const d2 = f.filingPrepare({ action: A, text: WORDS, preparer: V("bo"), viewer: V("bo") });
  x.actions.actionRiskTier({ target: A, tier: 2, reason: "raised on review", author: V("olive"), viewer: V("olive") });
  expect((await f.filingApprove({ filing: d2.id, text: "t", author: V("bo"), viewer: V("bo") })), "FILING_STALE");
  const counsel = { name: "A. Counsel", organisation: "Test Chambers" };
  expect(f.counselPacket({ action: T3, counsel, author: MACHINE }), "MACHINE_CANNOT_NAME_COUNSEL");
  expect(f.counselPacket({ action: T3, counsel: {}, author: V("bo"), viewer: V("bo") }), "NO_COUNSEL");
  expect(f.counselPacket({ action: x.action({ kind: "commitment_claim", legs: [] }), counsel, author: V("bo"), viewer: V("bo") }),
         "NO_DETERMINATION");
  const p = f.counselPacket({ action: T3, counsel, author: V("bo"), viewer: V("bo") });
  expect(f.counselPacketRead({ id: "NONE", viewer: V("bo") }), "NO_SUCH_PACKET");
  expect((await f.counselPacketExport({ id: p.id, author: MACHINE })), "MACHINE_CANNOT_EXPORT");
  const tp = (o) => f.theoryPropose({ action: T3, theory: "t", standards: [x.S1], why: "w", proposer: V("bo"), viewer: V("bo"), ...o });
  expect(tp({ theory: "" }), "NO_THEORY");
  expect(tp({ standards: [] }), "THEORY_NO_STANDARDS");
  expect(tp({ proposer: "" }), "THEORY_NO_PROPOSER");
  const ns = tp({ standards: ["STD-NONE"] });
  assert.deepEqual([ns.reason, ns.id], ["NO_SUCH_STANDARD", "STD-NONE"], "standards' own refusal passes through as it came");
  assert.match(String(ns.check), /^C-112\./, "standards' row, not this family's");
  expect(tp({ why: "" }), "THEORY_WHY_REFUSED");
  assert.deepEqual(f.filingsFor({ action: "NONE", viewer: V("bo") }), noSuchAction("NONE"));
  const nd = f.availableActions({ determination: "NONE", viewer: V("bo") });
  assert.equal(nd.reason, "NO_SUCH_DETERMINATION");
  assert.doesNotMatch(String(nd.check), /^C-115\./, "conformance's refusal passes through as it came, its own row");
  const bare = new Filings({ storage: x.st, record: x.record, publication: x.p, provenance: x.prov, content: x.content,
                             actions: x.actions, now: () => x.clock.now });
  expect(bare.availableActions({ determination: x.D, viewer: V("bo") }), "DETERMINATION_UNREADABLE");
  expect(bare.theoryPropose({ action: T3, theory: "t", standards: ["STD-X"], why: "w", proposer: V("bo"), viewer: V("bo") }),
         "THEORY_STANDARD_UNREADABLE");
  /* R23: communications */
  const cp = (o) => f.communicationPrepare({ action: A, text: "A word to the board.", purpose: "a briefing", preparer: V("bo"),
                                             viewer: V("bo"), ...o });
  expect(cp({ preparer: "" }), "COMMUNICATION_NO_PREPARER");
  expect(cp({ action: x.action({ state: "abandoned" }) }), "ACTION_CLOSED");
  expect(cp({ text: "" }), "COMMUNICATION_TEXT_REFUSED");
  expect(cp({ purpose: "x".repeat(501) }), "COMMUNICATION_PURPOSE_REFUSED");
  assert.deepEqual(cp({ action: "NONE" }), noSuchAction("NONE"), "actions' answer, its row");
  /* R28, R31, R32: templates */
  const O = x.action({ kind: "other" });
  expect(prep(O), "TEMPLATE_NOT_NAMED");
  const named = (action, template, o = {}) => f.filingPrepare({ action, template, preparer: V("bo"), viewer: V("bo"), ...o });
  expect(named(A, { id: "TPL-test-bylaw-complaint" }, { text: "Words." }), "TEMPLATE_AND_TEXT");
  expect(named(A, { id: "TPL-test-commitment-brief" }), "TEMPLATE_USE_BRIEF");
  expect(named(O, { id: "TPL-test-bylaw-complaint" }), "TEMPLATE_KIND_MISMATCH");
  expect(f.filingPrepare({ action: A, text: "", preparer: V("bo"), viewer: V("bo") }), "TEXT_UNWRITABLE");
  expect(f.counselPacket({ action: T3, counsel, template: { id: "TPL-test-bylaw-complaint" }, author: V("bo"), viewer: V("bo") }),
         "TEMPLATE_USE_FILE");
  expect(f.templateSave({ filing: d2.id, name: "kept", author: V("bo"), viewer: V("bo") }), "TEMPLATE_FROM_UNAPPROVED");
  /* filing-templates' refusals pass through as its own, its rows */
  for (const r of [named(A, { id: "TPL-NONE" }), f.filingPrepare({ action: A, text: "{{nope}}", preparer: V("bo"), viewer: V("bo") }),
                   f.templateSave({ filing: d.id, name: "kept", author: MACHINE, viewer: V("bo") })]) {
    assert.equal(r.ok, false);
    assert.equal(r.reason in FILINGS_CHECKS, false, `${r.reason} is not this module's`);
    assert.deepEqual([r.check, r.translation], [FILING_TEMPLATE_CHECKS[r.reason].check, FILING_TEMPLATE_CHECKS[r.reason].translation],
                     `${r.reason}: filing-templates' row`);
  }
  assert.deepEqual([...seen].sort(), Object.keys(FILINGS_CHECKS).sort(), "every row of the family is answered");
  assert.equal("NO_SUCH_ACTION" in FILINGS_CHECKS, false, "C-115.2 gave way to actions' row (N217)");
  const checks = Object.values(FILINGS_CHECKS).map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length);
  for (const c of checks) assert.match(c, /^C-115\.\d+$/);
});

test("R1 R3 R8 R15 R21 with a layer-9 provider absent, filings refuses or states the fact undetermined, never passes it (K248)", async () => {
  const x = world();
  const bare = new Filings({ storage: x.st, record: x.record, publication: x.p, provenance: x.prov, content: x.content,
                             now: () => x.clock.now });
  const A = x.action();
  const r = bare.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  assert.deepEqual(r, noSuchAction(A, { why: "no module answers an action's read here, so no action is readable" }),
                   "actions' answer, the reason riding as an extra field (K351)");
  assert.equal(bare.availableActions({ determination: x.D, viewer: V("bo") }).reason, "DETERMINATION_UNREADABLE");
  const noConformance = new Filings({ storage: x.st, record: x.record, publication: x.p, provenance: x.prov, content: x.content,
                                      actions: x.actions, standards: x.standards, filingTemplates: x.f.filingTemplates,
                                      now: () => x.clock.now });
  const d = noConformance.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  assert.match(d.unfilled.find((u) => u.name === "act").why, /no module answers determinations/);
  const T3 = x.action({ kind: "commitment_claim" });
  const p = noConformance.counselPacket({ action: T3, counsel: { name: "A", organisation: "B" }, author: V("bo"), viewer: V("bo") });
  assert.equal(p.reason, "NO_DETERMINATION");
  assert.match(p.detail, /no module answers determinations/);
  /* no filing-templates module: a template is not readable, refused with that module's code; the member's words serve */
  const noTemplates = new Filings({ storage: x.st, record: x.record, publication: x.p, provenance: x.prov, content: x.content,
                                    actions: x.actions, standards: x.standards, conformance: x.conformance, now: () => x.clock.now });
  assert.equal(noTemplates.filingTemplates, null);
  const nt = noTemplates.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  assert.equal(nt.reason, "NO_SUCH_TEMPLATE");
  assert.match(nt.detail, /no module answers the group's templates/);
  assert.equal(noTemplates.filingPrepare({ action: A, text: WORDS, preparer: V("bo"), viewer: V("bo") }).ok, true);
  const block = noConformance.evidenceBlock({ caseId: "CASE-2026-0001", edition: 1, findings: ["INQ-2026-0001"] });
  assert.equal(block.determinations_read, false);
  assert.deepEqual(block.determinations, []);
  assert.match(block.says, /undetermined/);
});

test("R1 R8 R13 R14 every missing action is answered through actions' noSuchAction (its R43, N217): absent, invisible and not an action alike, byte-identical to actions' own answer, its row actions'", async () => {
  const x = world();
  const A = x.action();
  const T3 = x.action({ kind: "commitment_claim" });
  const counsel = { name: "A. Counsel", organisation: "Test Chambers" };
  const asks = {
    R1: (id, viewer) => x.f.filingPrepare({ action: id, preparer: V("bo"), viewer }),
    R8: (id, viewer) => x.f.counselPacket({ action: id, counsel, author: V("bo"), viewer }),
    R13: (id, viewer) => x.f.filingsFor({ action: id, viewer }),
    R14: (id, viewer) => x.f.theoryPropose({ action: id, theory: "t", standards: [x.S1], why: "w", proposer: V("bo"), viewer }),
  };
  const one = noSuchAction("ACTN-NONE");
  assert.equal(one.code, "NO_SUCH_ACTION");
  assert.doesNotMatch(String(one.check), /^C-115\./, "the row is actions', not this family's");
  for (const [id, ask] of Object.entries(asks)) {
    assert.deepEqual(ask("ACTN-NONE", V("bo")), one, `${id}: absent`);
    assert.deepEqual(ask(x.D, V("bo")), noSuchAction(x.D), `${id}: a determination is not an action`);
    const target = id === "R8" || id === "R14" ? T3 : A;
    const hidden = ask(target, STRANGER);
    assert.deepEqual(hidden, noSuchAction(target), `${id}: invisible answers as absent`);
    assert.deepEqual({ ...hidden, action: null }, { ...one, action: null }, `${id}: one answer for hidden and absent`);
    assert.notEqual(ask(target, V("bo")).reason, "NO_SUCH_ACTION", `${id}: negative control`);
  }
  assert.deepEqual(x.op("filingsfor", { action: "ACTN-NONE", viewer: V("bo") }), one, "the op answers the same");
});

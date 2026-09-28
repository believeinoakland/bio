/* filings — every refusal of its own carries its code, its C-115 row and the member's translation (DEC-49, K248), and a
   provider not yet present is refused, never passed (K248). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { FILINGS_CHECKS, Filings } from "../../../src/filings/index.mjs";

const A = "ACTION-2026-0001";

test("R1 R6 R7 R8 R11 R13 R14 R21 each refusal of this module carries its code, its C-115 row and translation; one actions answered passes through as it came", () => {
  const x = world();
  x.action(A);
  x.action("ACTION-T3", { kind: "commitment_claim" });
  const seen = new Set();
  const expect = (r, code) => {
    assert.equal(r.ok, false);
    assert.equal(r.reason, code);
    assert.deepEqual([r.code, r.check, r.translation], [code, FILINGS_CHECKS[code].check, FILINGS_CHECKS[code].translation]);
    seen.add(code);
  };
  const f = x.f;
  expect(f.filingPrepare({ action: A, preparer: "" }), "FILING_NO_PREPARER");
  expect(f.filingPrepare({ action: "NONE", preparer: V("bo"), viewer: V("bo") }), "NO_SUCH_ACTION");
  x.action("ACTION-CLOSED", { current_state: "resolved" });
  expect(f.filingPrepare({ action: "ACTION-CLOSED", preparer: V("bo"), viewer: V("bo") }), "ACTION_CLOSED");
  x.action("ACTION-U", { risk_tier: "undetermined" });
  expect(f.filingPrepare({ action: "ACTION-U", preparer: V("bo"), viewer: V("bo") }), "FILING_TIER_UNDETERMINED");
  expect(f.filingPrepare({ action: "ACTION-T3", preparer: V("bo"), viewer: V("bo") }), "TIER3_COUNSEL_PACKET");
  x.action("ACTION-O", { kind: "other" });
  expect(f.filingPrepare({ action: "ACTION-O", preparer: V("bo"), viewer: V("bo") }), "KIND_NO_TEMPLATE");
  const d = f.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  expect(f.filingApprove({ filing: d.id, author: MACHINE }), "MACHINE_CANNOT_APPROVE");
  expect(f.filingApprove({ filing: "NONE", author: V("bo"), viewer: V("bo") }), "NO_SUCH_FILING");
  expect(f.filingApprove({ filing: d.id, author: V("bo"), viewer: V("bo") }), "STILL_UNFILLED");
  expect(f.filingApprove({ filing: d.id, text: "\uDC00", author: V("bo"), viewer: V("bo") }), "TEXT_UNWRITABLE");
  expect(f.filingRecordSent({ filing: d.id, author: MACHINE }), "MACHINE_CANNOT_FILE");
  expect(f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "x", author: V("bo"), viewer: V("bo") }), "NOT_APPROVED");
  f.filingApprove({ filing: d.id, text: "Filed words.", author: V("bo"), viewer: V("bo") });
  expect(f.filingApprove({ filing: d.id, text: "Other words.", author: V("bo"), viewer: V("bo") }), "ALREADY_APPROVED");
  const passed = f.filingRecordSent({ filing: d.id, at: "not a date", account: "x", author: V("bo"), viewer: V("bo") });
  assert.deepEqual([passed.reason, "check" in passed], ["BAD_DATE", false], "actions' refusal passes through as it came");
  f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "x", author: V("bo"), viewer: V("bo") });
  expect(f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "x", author: V("bo"), viewer: V("bo") }), "ALREADY_SENT");
  const d2 = f.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  x.actions.held.get(A).risk_tier = 2;
  expect(f.filingApprove({ filing: d2.id, text: "t", author: V("bo"), viewer: V("bo") }), "FILING_STALE");
  const counsel = { name: "A. Counsel", organisation: "Test Chambers" };
  expect(f.counselPacket({ action: "ACTION-T3", counsel, author: MACHINE }), "MACHINE_CANNOT_NAME_COUNSEL");
  expect(f.counselPacket({ action: A, counsel, author: V("bo"), viewer: V("bo") }), "NOT_TIER3");
  expect(f.counselPacket({ action: "ACTION-T3", counsel: {}, author: V("bo"), viewer: V("bo") }), "NO_COUNSEL");
  x.action("ACTION-T3N", { kind: "commitment_claim", legs: [] });
  expect(f.counselPacket({ action: "ACTION-T3N", counsel, author: V("bo"), viewer: V("bo") }), "NO_DETERMINATION");
  const p = f.counselPacket({ action: "ACTION-T3", counsel, author: V("bo"), viewer: V("bo") });
  expect(f.counselPacketRead({ id: "NONE", viewer: V("bo") }), "NO_SUCH_PACKET");
  expect(f.counselPacketExport({ id: p.id, author: MACHINE }), "MACHINE_CANNOT_EXPORT");
  const tp = (o) => f.theoryPropose({ action: "ACTION-T3", theory: "t", standards: [x.S1], why: "w", proposer: V("bo"), viewer: V("bo"), ...o });
  expect(tp({ theory: "" }), "NO_THEORY");
  expect(tp({ standards: [] }), "NO_STANDARDS");
  expect(tp({ proposer: "" }), "THEORY_NO_PROPOSER");
  const ns = tp({ standards: ["STD-NONE"] });
  assert.deepEqual([ns.reason, ns.id], ["NO_SUCH_STANDARD", "STD-NONE"], "standards' own refusal passes through as it came");
  assert.match(String(ns.check), /^C-112\./, "standards' row, not this family's");
  expect(tp({ why: "" }), "THEORY_WHY_REFUSED");
  expect(f.filingsFor({ action: "NONE", viewer: V("bo") }), "NO_SUCH_ACTION");
  const nd = f.availableActions({ determination: "NONE", viewer: V("bo") });
  assert.deepEqual([nd.reason, "check" in nd], ["NO_SUCH_DETERMINATION", false], "conformance's refusal passes through as it came");
  const bare = new Filings({ storage: x.st, record: x.record, publication: x.p, provenance: x.prov, content: x.content,
                             actions: x.actions, now: () => x.clock.now });
  expect(bare.availableActions({ determination: "CONF-2026-0001", viewer: V("bo") }), "DETERMINATION_UNREADABLE");
  expect(bare.theoryPropose({ action: "ACTION-T3", theory: "t", standards: ["STD-X"], why: "w", proposer: V("bo"), viewer: V("bo") }),
         "THEORY_STANDARD_UNREADABLE");
  assert.deepEqual([...seen].sort(), Object.keys(FILINGS_CHECKS).sort(), "every row of the family is answered");
  const checks = Object.values(FILINGS_CHECKS).map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length);
  for (const c of checks) assert.match(c, /^C-115\.\d+$/);
});

test("R1 R3 R8 R15 R21 with a layer-9 provider absent, filings refuses or states the fact undetermined, never passes it (K248)", () => {
  const x = world();
  const bare = new Filings({ storage: x.st, record: x.record, publication: x.p, provenance: x.prov, content: x.content,
                             now: () => x.clock.now });
  const r = bare.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  assert.equal(r.reason, "NO_SUCH_ACTION");
  assert.match(r.detail, /no module answers an action's read/);
  assert.equal(bare.availableActions({ determination: "CONF-2026-0001", viewer: V("bo") }).reason, "DETERMINATION_UNREADABLE");
  const noConformance = new Filings({ storage: x.st, record: x.record, publication: x.p, provenance: x.prov, content: x.content,
                                      actions: x.actions, standards: x.standards, now: () => x.clock.now });
  x.action(A);
  const d = noConformance.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  assert.match(d.unfilled.find((u) => u.name === "act").why, /no module answers determinations/);
  x.action("ACTION-T3", { kind: "commitment_claim" });
  const p = noConformance.counselPacket({ action: "ACTION-T3", counsel: { name: "A", organisation: "B" }, author: V("bo"), viewer: V("bo") });
  assert.equal(p.reason, "NO_DETERMINATION");
  assert.match(p.detail, /no module answers determinations/);
  const block = noConformance.evidenceBlock({ caseId: "CASE-2026-0001", edition: 1, findings: ["INQ-2026-0001"] });
  assert.equal(block.determinations_read, false);
  assert.deepEqual(block.determinations, []);
  assert.match(block.says, /undetermined/);
});

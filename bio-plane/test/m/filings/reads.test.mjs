/* filings — the action's filings (R13), the evidence package's available-actions block and its read for escalation
   (R15, R21), and the invariants: every item names its source (R18), append-only, keyed to the action, purged with it,
   and an invisible action answers as absent (R19). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, F, CASE, PROFILE } from "./fixture.mjs";
import { COUNSEL_SENTENCE, TIER_WORDS, filingsOf } from "../../../src/filings/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const A = "ACTION-2026-0001", T3 = "ACTION-2026-0003";
const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };

function busy() {
  const x = world();
  x.action(A);
  x.action(T3, { kind: "commitment_claim" });
  const d1 = x.f.filingPrepare({ action: A, preparer: MACHINE, viewer: MACHINE });
  x.clock.now = "2026-09-28T02:00:00Z";
  const d2 = x.f.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  const text = d2.text.replace("[UNFILLED: bylaw]", "P.E.B.L. § 12");
  x.f.filingApprove({ filing: d2.id, text, author: V("bo"), viewer: V("bo") });
  x.f.filingRecordSent({ filing: d2.id, at: "2026-09-29", account: "handed in", author: V("bo"), viewer: V("bo") });
  const p1 = x.f.counselPacket({ action: T3, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  x.f.counselPacketExport({ id: p1.id, version: 1, author: V("olive"), viewer: V("olive") });
  x.clock.now = "2026-09-28T03:00:00Z";
  const p2 = x.f.counselPacket({ action: T3, counsel: { name: "B. Counsel", organisation: "Other Chambers" }, author: V("olive"), viewer: V("olive") });
  x.f.theoryPropose({ action: T3, theory: "A breach.", standards: ["STD-2026-0001"], why: "named", proposer: V("bo"), viewer: V("bo") });
  return { x, d1, d2, p1, p2, text };
}

test("R13 filingsFor lists the action's drafts (tier, label, approval, sending) and its counsel packets (each version with counsel, basis_changed and exports), in creation order; NO_SUCH_ACTION for an absent or invisible action", () => {
  const { x, d1, d2, p1 } = busy();
  const r = x.f.filingsFor({ action: A, viewer: V("bo") });
  assert.deepEqual(r.drafts.map((d) => [d.filing, d.tier, d.label.state]), [[d1.id, 1, "machine_proposed"], [d2.id, 1, "member_proposed"]]);
  assert.equal(r.drafts[0].approval, null);
  assert.equal(r.drafts[0].sending, null);
  assert.deepEqual([r.drafts[1].approval.approved_by, r.drafts[1].sending.ord, r.drafts[1].sending.sent_on], [V("bo"), 0, "2026-09-29"]);
  assert.deepEqual(r.packets, []);
  const t = x.f.filingsFor({ action: T3, viewer: V("bo") });
  assert.deepEqual(t.packets.map((p) => [p.packet, p.version, p.counsel.name, p.basis_changed, p.exports.length]),
                   [[p1.id, 1, "A. Counsel", null, 1], [p1.id, 2, "B. Counsel", null, 0]]);
  assert.equal(t.packets[0].exports[0].exported_by, V("olive"));
  const absent = x.f.filingsFor({ action: "ACTION-NONE", viewer: V("bo") });
  x.actions.held.get(A).audience = [V("olive")];
  const hidden = x.f.filingsFor({ action: A, viewer: V("bo") });
  assert.deepEqual([absent.reason, absent.detail], [hidden.reason, hidden.detail]);
  assert.equal(absent.reason, "NO_SUCH_ACTION");
  assert.equal(x.op("filingsfor", { action: A, viewer: V("olive") }).drafts.length, 2, "the op answers the same read");
});

function block(x) {
  const c = x.p.publishedCase({ caseId: CASE });
  return c.evidence_package.blocks.available_actions;
}

test("R15 the available-actions block of a published case a live determination rests on: every kind against its offices with tier and words; for Tier 3 the standards, the factual basis, the counsel sentence and the profile's legal organisations; the risk classification in the metadata; never a template or packet content", () => {
  const { x } = busy();
  const b = block(x);
  const view = combine([PROFILE]).view;
  assert.deepEqual(b.kinds.map((k) => [k.kind, k.label, k.tier, k.words]),
                   view.action_kinds.map((k) => [k.kind, k.label, k.tier, TIER_WORDS[k.tier]]));
  assert.deepEqual(b.metadata.risk_classification, Object.fromEntries(view.action_kinds.map((k) => [k.kind, k.tier])));
  const t3 = b.kinds.find((k) => k.kind === "commitment_claim");
  assert.equal(t3.counsel, COUNSEL_SENTENCE);
  assert.deepEqual(t3.legal_organisations.map((o) => [o.name, o.contacts]), view.legal_organisations.map((o) => [o.name, o.contacts]));
  assert.deepEqual(b.determinations.map((d) => d.determination), ["CONF-2026-0001"]);
  const [d] = b.determinations;
  assert.deepEqual([d.office.role, d.office.body, d.office.in_profile], ["Selectboard", "Port Ellery Selectboard", true]);
  assert.deepEqual(d.tier3.standards, ["STD-2026-0001"], "the standards the theory rests on: those found noncompliant");
  assert.deepEqual(d.tier3.factual_basis, [{ finding: F, case: CASE, edition: 1 }]);
  assert.equal(d.tier3.counsel, COUNSEL_SENTENCE);
  const bytes = JSON.stringify(b);
  for (const k of view.action_kinds.filter((k) => k.template)) assert.equal(bytes.includes(k.template), false, `no template of ${k.kind}`);
  assert.equal(bytes.includes("A breach."), false, "no candidate theory");
  assert.equal(bytes.includes("Not for filing"), false, "no packet content");
  /* the profile names no legal organisation: said so */
  const x0 = world();
  const bare = { ...x0.profile(PROFILE), id: "test-filings-noorg", legal_organisations: [] };
  const y = world({ profiles: [bare] });
  const t = block(y).kinds.find((k) => k.kind === "commitment_claim");
  assert.deepEqual(t.legal_organisations, []);
  assert.match(t.legal_organisations_says, /names no legal organisation/);
  /* a case no live determination rests on: no action is listed against an office */
  y.conformance.held.get("CONF-2026-0001").superseded_by = "CONF-2026-0002";
  const none = block(y);
  assert.deepEqual(none.determinations, []);
  assert.match(none.says, /no live determination/);
  /* a determination of another project resting on the finding is not this case's */
  y.conformance.held.set("CONF-2026-0007", { ...structuredClone(x.conformance.held.get("CONF-2026-0001")), id: "CONF-2026-0007", project: "PROJ-OTHER" });
  assert.deepEqual(block(y).determinations, []);
});

test("R15 the block is registered with publication once, at start, and computed at each read", () => {
  const { x } = busy();
  const again = x.p.registerEvidenceBlock("filings", "available_actions", () => 1);
  assert.equal(again.reason, "PROVIDER_DECLARED");
  assert.equal(filingsOf(x.host), x.f, "one instance per host");
  const first = block(x);
  x.standards.held.set("STD-2026-0003", { id: "STD-2026-0003", cite: "x", kind: "ordinance", issuer: "y", text: [], period: {} });
  x.conformance.held.get("CONF-2026-0001").standards.push({ id: "STD-2026-0003", outcome: "noncompliant" });
  assert.deepEqual(block(x).determinations[0].tier3.standards, ["STD-2026-0001", "STD-2026-0003"], "computed at the read");
  assert.notDeepEqual(first, block(x));
});

test("R21 availableActions answers R15's block for a determination's offices, from the same composer; NO_SUCH_DETERMINATION for an absent or invisible one, one answer", () => {
  const { x } = busy();
  const r = x.f.availableActions({ determination: "CONF-2026-0001", viewer: V("bo") });
  assert.deepEqual([r.ok, r.determination, r.live], [true, "CONF-2026-0001", true]);
  const b = block(x);
  assert.deepEqual([r.kinds, r.metadata, r.determinations], [b.kinds, b.metadata, b.determinations]);
  const absent = x.f.availableActions({ determination: "CONF-NONE", viewer: V("bo") });
  x.conformance.held.get("CONF-2026-0001").audience = [V("olive")];
  const hidden = x.f.availableActions({ determination: "CONF-2026-0001", viewer: V("bo") });
  assert.deepEqual([absent.reason, absent.detail], [hidden.reason, hidden.detail]);
  assert.equal(absent.reason, "NO_SUCH_DETERMINATION");
  x.conformance.held.set("CONF-2026-0008", { ...structuredClone(x.conformance.held.get("CONF-2026-0001")), id: "CONF-2026-0008",
    act: { description: "x", actor: { role: "Harbour Master", body: "Nowhere" }, at: "2026-01-01" }, audience: undefined });
  const off = x.f.availableActions({ determination: "CONF-2026-0008", viewer: V("bo") }).determinations[0].office;
  assert.deepEqual([off.in_profile, off.role], [false, "Harbour Master"]);
  assert.match(off.says, /not an office the active profile lists/);
  assert.equal(x.op("availableactions", { determination: "CONF-2026-0001", viewer: V("olive") }).ok, true);
});

test("R18 every filled value, packet item and chronology event names the record source it was read from; an undetermined fact is stated as undetermined, never defaulted", () => {
  const { x, d2, p2 } = busy();
  const d = x.f.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  for (const b of d.blanks) assert.ok(typeof b.source === "string" && b.source, b.name);
  for (const u of d.unfilled) assert.ok(typeof u.why === "string" && u.why, u.name);
  assert.ok(d2.blanks.length);
  const s = x.f.counselPacketRead({ id: p2.id, viewer: V("olive") }).sections;
  for (const [name, sec] of Object.entries(s)) {
    for (const item of sec.items) {
      if (name === "exhibits") assert.ok(item.cited_by.length && item.sha256, name);
      else assert.ok(typeof item.source === "string" && item.source, `${name}: ${JSON.stringify(item).slice(0, 80)}`);
    }
    for (const u of sec.undated || []) assert.ok(u.source && u.why);
  }
  const dl = s.deadlines.items[0];
  assert.equal(dl.date.state, "undetermined");
  assert.ok(dl.date.why);
  x.actions.held.get(T3).state_history = undefined;
  const p3 = x.f.counselPacket({ action: T3, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  assert.ok(p3.sections.chronology.undated.some((u) => /state history/.test(u.event) && u.why), "an unanswered history is stated, not skipped");
});

test("R19 drafts, approvals, sendings, packets, exports and proposals are append-only, keyed to the action and declared to purge; every read answers an action the viewer may not see as absent", () => {
  const { x, d1, d2, p1 } = busy();
  const tables = ["filing_drafts", "filing_approvals", "filing_sendings", "counsel_packets", "counsel_packet_exports", "theory_proposals"];
  const snap = x.snapshot(tables);
  /* further acts add rows and change none */
  x.f.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  x.f.counselPacket({ action: T3, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  x.f.filingApprove({ filing: d2.id, text: "again", author: V("cy"), viewer: V("cy") });
  const after = x.snapshot(tables);
  for (const t of tables) {
    const before = JSON.parse(snap[t]), now = JSON.parse(after[t]);
    assert.deepEqual(now.slice(0, before.length), before, `${t}: earlier rows unchanged`);
  }
  /* purge of one action clears its rows only */
  const report = x.record.purge({ bundleId: A });
  for (const t of tables) assert.ok(t in report.removed, `${t} is declared`);
  assert.equal(x.row(`SELECT COUNT(*) AS n FROM filing_drafts WHERE action_id=?`, A).n, 0);
  assert.equal(x.row(`SELECT COUNT(*) AS n FROM filing_approvals WHERE action_id=?`, A).n, 0);
  assert.ok(x.row(`SELECT COUNT(*) AS n FROM counsel_packets WHERE action_id=?`, T3).n > 0, "another action's rows stay");
  /* invisible answers as absent, in every read */
  x.actions.held.get(T3).audience = [V("olive")];
  assert.equal(x.f.counselPacketRead({ id: p1.id, viewer: V("bo") }).reason, "NO_SUCH_PACKET");
  assert.equal(x.f.filingsFor({ action: T3, viewer: V("bo") }).reason, "NO_SUCH_ACTION");
  assert.equal(x.f.theoryPropose({ action: T3, theory: "t", standards: ["STD-2026-0001"], why: "w", proposer: V("bo"), viewer: V("bo") }).reason,
               "NO_SUCH_ACTION");
  x.action(A);
  const d = x.f.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  x.actions.held.get(A).audience = [V("olive")];
  assert.equal(x.f.filingApprove({ filing: d.id, text: "t", author: V("bo"), viewer: V("bo") }).reason, "NO_SUCH_FILING");
  assert.equal(d1.ok, true);
});

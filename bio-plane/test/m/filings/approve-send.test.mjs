/* filings — a member's approval (R6), the sending a member records (R7) and the machine fences on both (R16). Driven at
   the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { FILING_TEXT_MAX } from "../../../src/filings/index.mjs";
import { createHash } from "node:crypto";

const A = "ACTION-2026-0001";
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");

/* A Tier 1 draft with every blank filled (the test profile's `{{bylaw}}` written in by the approving member). */
function drafted(over = {}) {
  const x = world();
  x.action(A, over);
  const d = x.f.filingPrepare({ action: A, preparer: MACHINE, viewer: MACHINE });
  assert.equal(d.ok, true);
  const text = d.text.replace("[UNFILLED: bylaw]", "P.E.B.L. § 12");
  return { x, d, text };
}
const approve = (x, filing, over = {}) => x.f.filingApprove({ filing, author: V("bo"), viewer: V("bo"), ...over });

test("R6 refusals in order: MACHINE_CANNOT_APPROVE, NO_SUCH_FILING (absent and invisible one answer), FILING_STALE naming what changed, STILL_UNFILLED, TEXT_UNWRITABLE; negative controls", () => {
  const { x, d, text } = drafted();
  assert.equal(approve(x, d.id, { author: MACHINE, text }).reason, "MACHINE_CANNOT_APPROVE");
  assert.equal(approve(x, d.id, { author: "", text }).reason, "MACHINE_CANNOT_APPROVE");
  assert.equal(approve(x, "FIL-NONE", { author: MACHINE }).reason, "MACHINE_CANNOT_APPROVE", "asked first");
  const absent = approve(x, "FIL-NONE", { text });
  x.actions.held.get(A).audience = [V("olive")];
  const hidden = approve(x, d.id, { text });
  assert.deepEqual([absent.reason, absent.detail], [hidden.reason, hidden.detail]);
  assert.equal(absent.reason, "NO_SUCH_FILING");
  delete x.actions.held.get(A).audience;
  assert.equal(approve(x, d.id).reason, "STILL_UNFILLED", "the draft's own text still holds a blank");
  assert.deepEqual(approve(x, d.id).unfilled, ["bylaw"]);
  assert.equal(approve(x, d.id, { text: `${"x".repeat(FILING_TEXT_MAX)}y` }).reason, "TEXT_UNWRITABLE");
  assert.equal(approve(x, d.id, { text: "a lone \uD800 surrogate" }).reason, "TEXT_UNWRITABLE", "not UTF-8 text");
  assert.equal(approve(x, d.id, { text: 42 }).reason, "TEXT_UNWRITABLE");
  assert.equal(approve(x, d.id, { text: "   " }).reason, "TEXT_UNWRITABLE");
  assert.equal(approve(x, d.id, { text: `[UNFILLED: x] ${"y".repeat(FILING_TEXT_MAX)}` }).reason, "STILL_UNFILLED", "asked before the bound");
  assert.equal(approve(x, d.id, { text }).ok, true, "negative control");
});

test("R6 FILING_STALE names each change since the draft: the tier, the counterparty, the determination, the governing laws, a superseded determination", () => {
  const cases = [
    ["the governing tier", (x) => { x.actions.held.get(A).risk_tier = 2; }],
    ["the counterparty", (x) => { x.actions.held.get(A).counterparty = { state: "named", role: "Town Clerk", body: "City of Port Ellery" }; }],
    ["the determination the action rests on", (x) => {
      x.conformance.held.set("CONF-2026-0009", { ...structuredClone(x.conformance.held.get("CONF-2026-0001")), id: "CONF-2026-0009" });
      x.actions.held.get(A).legs = [{ target: "CONF-2026-0009", kind: "rests_on" }]; }],
    ["the governing laws", (x) => { x.actions.held.get(A).governing_laws = { state: "stated", laws: [{ level: "state", citation: "Test Stat. § 1.100" }] }; }],
    ["superseded", (x) => { x.conformance.held.get("CONF-2026-0001").superseded_by = "CONF-2026-0002"; }],
  ];
  for (const [named, change] of cases) {
    const { x, d, text } = drafted();
    change(x);
    const r = approve(x, d.id, { text });
    assert.equal(r.reason, "FILING_STALE", named);
    assert.ok(r.changed.some((c) => c.includes(named)), `${named}: ${r.changed}`);
    assert.equal(x.count("filing_approvals"), 0);
  }
  const { x, d, text } = drafted();
  x.actions.held.get(A).clock = [];
  assert.equal(approve(x, d.id, { text }).ok, true, "negative control: a change R6 does not name");
});

test("R6 a member approves the draft's text or an edited text; the approved text is the member's, recorded with who, when and its SHA-256; at most once (ALREADY_APPROVED)", () => {
  const { x, d, text } = drafted();
  const r = approve(x, d.id, { text });
  assert.deepEqual([r.ok, r.filing, r.approved_by, r.at, r.sha, r.edited], [true, d.id, V("bo"), "2026-09-28T01:00:00Z", sha(text), true]);
  assert.deepEqual(x.row(`SELECT text, sha, approved_by, at FROM filing_approvals WHERE filing_id=?`, d.id),
                   { text, sha: sha(text), approved_by: V("bo"), at: "2026-09-28T01:00:00Z" });
  const again = approve(x, d.id, { text, author: V("cy"), viewer: V("cy") });
  assert.deepEqual([again.reason, again.approved_by], ["ALREADY_APPROVED", V("bo")]);
  const y = world();
  y.action(A, { kind: "records_request", risk_tier: 2, law: "Test Stat. § 1.100" });
  const d2 = y.f.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  const own = d2.text.replace("[UNFILLED: records]", "the minutes");
  const r2 = approve(y, d2.id, { text: own });
  assert.equal(r2.ok, true);
  assert.equal(y.row(`SELECT text FROM filing_drafts WHERE filing_id=?`, d2.id).text, d2.text, "the draft is never edited");
});

test("R7 refusals: MACHINE_CANNOT_FILE, NO_SUCH_FILING, NOT_APPROVED, ALREADY_SENT, then actions' own refusals; nothing is recorded on a refusal", () => {
  const { x, d, text } = drafted();
  const send = (over = {}) => x.f.filingRecordSent({ filing: d.id, at: "2026-09-29", medium: "in person", account: "handed to the clerk",
                                                     author: V("bo"), viewer: V("bo"), ...over });
  assert.equal(send({ author: MACHINE }).reason, "MACHINE_CANNOT_FILE");
  assert.equal(send({ author: "" }).reason, "MACHINE_CANNOT_FILE");
  assert.equal(send({ filing: "FIL-NONE" }).reason, "NO_SUCH_FILING");
  x.actions.held.get(A).audience = [V("olive")];
  assert.equal(send().reason, "NO_SUCH_FILING", "an invisible action's draft answers as absent");
  delete x.actions.held.get(A).audience;
  assert.equal(send().reason, "NOT_APPROVED");
  approve(x, d.id, { text });
  assert.equal(send({ at: "tomorrow" }).reason, "BAD_DATE", "actions' refusal passes through");
  assert.equal(send({ account: null }).reason, "NEITHER_CAPTURE_NOR_TESTIMONY");
  assert.equal(send({ account: null, artifactSha: "ab".repeat(32) }).reason, "UNREGISTERED_ARTIFACT");
  assert.equal(x.count("filing_sendings"), 0, "nothing recorded on a refusal");
  assert.equal(send().ok, true);
  const again = send();
  assert.deepEqual([again.reason, again.ord], ["ALREADY_SENT", 0]);
});

test("R7 the sending is one `sent` correspondence entry on the action, held as the capture sent or the member's account, linked both ways; no state moves and no clock entry is written; `proposed` carries the next state and actions' offered clock entries", () => {
  const { x, d, text } = drafted();
  approve(x, d.id, { text });
  const bytes = x.capture("INFO-2026-0003-sent", text);
  const before = structuredClone(x.actions.held.get(A));
  const r = x.f.filingRecordSent({ filing: d.id, at: "2026-09-29", medium: "mail", artifactSha: bytes, author: V("bo"), viewer: V("bo") });
  assert.deepEqual([r.ok, r.filing, r.action, r.ord, r.held_as], [true, d.id, A, 0, "capture"]);
  const after = x.actions.held.get(A);
  assert.deepEqual(after.correspondence, [{ ord: 0, direction: "sent", at: "2026-09-29", medium: "mail", artifact_sha: bytes, author: V("bo") }]);
  assert.deepEqual([after.current_state, after.clock], [before.current_state, before.clock], "no state moved, no clock entry written");
  assert.deepEqual(x.f.filingsFor({ action: A, viewer: V("bo") }).drafts[0].sending.ord, 0, "the draft names the entry");
  assert.deepEqual(x.row(`SELECT filing_id FROM filing_sendings WHERE action_id=? AND ord=?`, A, 0), { filing_id: d.id },
                   "the entry names the draft");
  assert.deepEqual(r.proposed.next_state.to, "awaiting_response");
  assert.equal(r.proposed.next_state.from, "active");
  assert.deepEqual(r.proposed.clocks, [], "the kind has no deadline starting at filing or receipt");
  /* A records request: its deadline starts at receipt, and actions offers the clock entry. */
  const y = world();
  y.action(A, { kind: "records_request", risk_tier: 2, current_state: "planned", law: "Test Stat. § 1.100" });
  const d2 = y.f.filingPrepare({ action: A, preparer: V("bo"), viewer: V("bo") });
  approve(y, d2.id, { text: d2.text.replace("[UNFILLED: records]", "the minutes") });
  const s = y.f.filingRecordSent({ filing: d2.id, at: "2026-09-29", account: "emailed", author: V("bo"), viewer: V("bo") });
  assert.equal(s.held_as, "testimony");
  assert.deepEqual([s.proposed.next_state.from, s.proposed.next_state.to], ["planned", "active"]);
  assert.deepEqual(s.proposed.clocks.map((c) => [c.rule, c.starts, c.offered.ok]), [["records_answer", "received", true]]);
  assert.deepEqual(y.actions.calls.clockPropose, [{ target: A, rule: "records_answer", proposer: V("bo"), viewer: V("bo") }]);
  assert.equal(y.actions.held.get(A).current_state, "planned");
});

test("R16 nothing a machine writes approves, sends, names counsel or exports; a machine prepares drafts and proposals, each labelled", () => {
  const { x, d, text } = drafted();
  assert.equal(d.label.machine_work, true);
  assert.equal(approve(x, d.id, { author: MACHINE, text }).reason, "MACHINE_CANNOT_APPROVE");
  approve(x, d.id, { text });
  assert.equal(x.f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "x", author: "token:runner", viewer: MACHINE }).reason,
               "MACHINE_CANNOT_FILE");
  x.action("ACTION-T3", { kind: "commitment_claim" });
  const counsel = { name: "A. Counsel", organisation: "Test Chambers" };
  assert.equal(x.f.counselPacket({ action: "ACTION-T3", counsel, author: MACHINE, viewer: MACHINE }).reason, "MACHINE_CANNOT_NAME_COUNSEL");
  const p = x.f.counselPacket({ action: "ACTION-T3", counsel, author: V("olive"), viewer: V("olive") });
  assert.equal(x.f.counselPacketExport({ id: p.id, version: 1, author: MACHINE, viewer: MACHINE }).reason, "MACHINE_CANNOT_EXPORT");
  const t = x.f.theoryPropose({ action: "ACTION-T3", theory: "A breach of the bylaw.", standards: [x.S1],
                                why: "the determination names it", proposer: MACHINE, viewer: MACHINE });
  assert.deepEqual([t.ok, t.proposal.label.machine_work], [true, true]);
  assert.deepEqual([x.count("filing_sendings"), x.count("counsel_packet_exports")], [0, 0]);
});

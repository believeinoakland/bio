/* standards: proposals and their adoption (R9, R10). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, BYLAW } from "./fixture.mjs";
import { STANDARDS_CHECKS, WHY_MAX } from "../../../src/standards/index.mjs";
import { proposalLabel } from "../../../checks/bio-checks.mjs";

test("R9 a proposal is stored apart from standards, labelled by proposalLabel(proposer, \"standard\") with who proposed it and whether it is machine work, with a why of at most 240 characters; it is never a standard, never listed by standardsIn, and is answered with a sentence saying so", () => {
  const w = seeded();
  const text = w.passage().contentId;
  const before = w.count("standards");
  const m = w.s.standardPropose({ cite: BYLAW, kind: "ordinance", text: [text], why: "The permit was issued under it.",
                                  act: "ACT-2026-0001-permit", proposer: MACHINE, viewer: MACHINE });
  assert.equal(m.ok, true);
  assert.equal(m.standard, false);
  assert.match(m.says, /a proposal and not a standard/);
  const label = proposalLabel(MACHINE, "standard");
  assert.deepEqual([m.proposal.by, m.proposal.state, m.proposal.machine_work, m.proposal.says],
                   [label.by, "machine_proposed", true, label.says]);
  assert.deepEqual([m.proposal.cite, m.proposal.kind, m.proposal.issuer, m.proposal.text, m.proposal.why, m.proposal.act, m.proposal.adoption],
                   [BYLAW, "ordinance", null, [text], "The permit was issued under it.", "ACT-2026-0001-permit", null]);
  const b = w.s.standardPropose({ cite: BYLAW, why: "x".repeat(WHY_MAX), proposer: V("carol") });
  assert.equal(b.ok, true, "a why of 240 characters");
  assert.deepEqual([b.proposal.state, b.proposal.machine_work], ["member_proposed", false]);
  assert.equal(w.count("standards"), before, "a proposal is never a standard");
  assert.equal(w.count("standard_proposals"), 2, "stored apart");
  assert.equal(w.s.standardsIn({ viewer: V("carol") }).count, 0, "never listed");
  assert.equal(w.s.standardRead({ id: m.proposal.id, viewer: V("carol") }).reason, "NO_SUCH_STANDARD", "never read as one");
  /* its refusals, each with its row */
  const good = { cite: BYLAW, why: "Because.", proposer: V("carol") };
  const cases = [
    [{ ...good, why: "x".repeat(WHY_MAX + 1) }, "STANDARD_WHY_INVALID"], [{ ...good, why: " " }, "STANDARD_WHY_INVALID"],
    [{ ...good, proposer: "" }, "STANDARD_PROPOSER_UNNAMED"], [{ ...good, cite: "" }, "STANDARD_NO_CITE"],
    [{ ...good, kind: "opinion" }, "STANDARD_KIND_UNKNOWN"], [{ ...good, text: ["f".repeat(64)] }, "STANDARD_TEXT_UNRESOLVED"],
    [{ ...good, act: 7 }, "STANDARD_ACT_INVALID"], [{ ...good, merit: "high" }, "STANDARD_FIELD_UNKNOWN"],
  ];
  const snap = w.snapshot();
  for (const [call, code] of cases) {
    const r = w.s.standardPropose(call);
    assert.equal(r.reason, code, JSON.stringify(call).slice(0, 80));
    assert.equal(r.check, STANDARDS_CHECKS[code].check);
  }
  assert.deepEqual(w.snapshot(), snap, "a refused proposal writes nothing");
});

test("R10 standardAdopt is R1 by a member naming the proposal: the standard records the proposal it came from, the proposal its adoption, and a proposal is adopted at most once", () => {
  const w = seeded();
  const text = w.passage().contentId;
  const p = w.s.standardPropose({ cite: BYLAW, kind: "ordinance", issuer: "Port Ellery Selectboard", text: [text],
                                  why: "It governs permits.", proposer: MACHINE }).proposal;
  /* a machine never adopts */
  assert.equal(w.s.standardAdopt({ proposal: p.id, author: MACHINE }).reason, "MACHINE_CANNOT_DECLARE_STANDARD");
  assert.equal(w.s.standardAdopt({ proposal: "STDP-2026-9999", author: V("bob") }).reason, "STANDARD_NO_SUCH_PROPOSAL");
  assert.equal(w.s.standardAdopt({ proposal: p.id, author: V("bob"), viewer: "nobody" }).reason, "STANDARD_NO_SUCH_PROPOSAL",
               "a viewer the record admits to nothing is answered as for an absent proposal");
  /* R1 holds on an adoption: the member's own fields are checked */
  assert.equal(w.s.standardAdopt({ proposal: p.id, author: V("bob"), kind: "opinion" }).reason, "STANDARD_KIND_UNKNOWN");
  const a = w.s.standardAdopt({ proposal: p.id, author: V("bob"), viewer: V("bob"), period: { from: "2019-01-01", to: null } });
  assert.equal(a.ok, true);
  assert.equal(a.proposal, p.id, "the standard records the proposal it came from");
  assert.deepEqual([a.cite, a.kind, a.issuer, a.text, a.declared_by], [BYLAW, "ordinance", "Port Ellery Selectboard", [text], V("bob")]);
  assert.deepEqual(a.adopted.from_proposal, ["cite", "kind", "issuer", "text"], "the fields taken from the proposal are named");
  assert.equal(w.s.standardRead({ id: a.id, viewer: V("carol") }).proposal, p.id);
  /* adopted at most once; the proposal records its adoption and the refusal names it */
  const snap = w.snapshot();
  const again = w.s.standardAdopt({ proposal: p.id, author: V("carol") });
  assert.equal(again.reason, "STANDARD_PROPOSAL_ADOPTED");
  assert.deepEqual([again.proposal, again.standard], [p.id, a.id]);
  assert.equal(again.check, STANDARDS_CHECKS.STANDARD_PROPOSAL_ADOPTED.check);
  assert.deepEqual(w.snapshot(), snap);
  /* a member's own fields win over the proposal's, and the answer says none came from it */
  const q = w.s.standardPropose({ cite: "MCBC 2024-1", why: "A commitment.", proposer: V("carol") }).proposal;
  const b = w.s.standardAdopt({ proposal: q.id, author: V("bob"), cite: "MCBC 2024-2", kind: "commitment",
                                issuer: "Marlow County Commission", text: [text] });
  assert.equal(b.ok, true);
  assert.equal(b.cite, "MCBC 2024-2");
  assert.deepEqual(b.adopted.from_proposal, []);
  /* a proposal naming no text: the adopting member must name it (R2) */
  const r = w.s.standardPropose({ cite: BYLAW, why: "Maybe.", proposer: MACHINE }).proposal;
  assert.equal(w.s.standardAdopt({ proposal: r.id, author: V("bob"), kind: "ordinance", issuer: "Selectboard" }).reason,
               "STANDARD_NO_TEXT");
});

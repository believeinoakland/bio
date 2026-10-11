/* filings at T45 (the Action layer v0.2; K2780, K2791, K2848): the record check (R34), disclosures (R24, R35), the stamp's
   group fields (R22), communications drafted from chosen findings (R23), joint texts (R36), documenting and the chance
   to fix (R37, R38), election and position (R39), quoting (R40), templates after the act (R41), second approval (R42),
   the assertion gate (R43), "as myself" (R44), recognition (R45), the review copy (R46), the hold notice (R47), junior
   staff (R48), legal facts (R49), and packets without a determination, for defence and in counsel matters (R8–R10).
   Driven at the module's interface over the real modules; what a layer-9 provider merging before filings does not yet
   answer (action-grammar's phrasing lists, R18–R19; actions' disclosures, partners and press terms, R75, R78, R79;
   action-holds' reads, R2, R11, R12) is a stand-in answering as its requirement states (K2848 (7)). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, STRANGER, F, DOC, CASE, PROFILE, WHY, sha, grammar, actionsWith } from "./fixture.mjs";
import { KEYED, FILINGS_CHECKS, sentencesOf, groupLine, counselMarking } from "../../../src/filings/index.mjs";
import { projectRosterOf } from "../../../src/project-roster/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const CLAIM = "The works order was let without the vote the bylaw requires.";
const NEGATED = "The works order was not let without the vote the bylaw requires.";

const f45 = (x, over = {}) => x.filingsWith({ grammar, ...over });
const prep = (f, action, over = {}) => f.filingPrepare({ action, text: "To the {{counterparty_role}}: a letter.", preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const comm = (f, action, over = {}) => f.communicationPrepare({ action, text: "A word to the board.", purpose: "a letter", preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const approve = (f, filing, over = {}) => f.filingApprove({ filing, author: V("bo"), viewer: V("bo"), ...over });

test("R34 the record check: each sentence judged by case-checker's checkAccount against the findings the text rests on and the group's dated correspondence: supported naming them, unsupported pointed out never refused, contradicted held back (CONTRADICTED_HELD) unless the approval releases it by name with a reason; a question and a sentence the member marks as its own doing never judged; a judgment that throws reads undetermined; re-run on the approved text", async () => {
  const x = world();
  const f = f45(x);
  const A = x.action();
  const text = `${CLAIM} The order cost 4,000 dollars. Will the board vote again? We are writing to the board. ${NEGATED}`;
  const d = prep(f, A, { text, own_doing: [3] });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const v = d.outward.record_check.items.map((i) => i.verdict);
  assert.deepEqual(v, ["supported", "unsupported", "question", "own_doing", "contradicted"]);
  assert.ok(d.outward.record_check.items[0].by.includes(F), "supported, naming what supports it");
  assert.match(d.outward.record_check.items[4].contradicted_by, /conclusion other than the record holds it/);
  assert.deepEqual(d.outward.sentences, sentencesOf(text), "one split, the same R43 reads");
  /* held back unless released by name with a reason */
  const held = await approve(f, d.id);
  assert.deepEqual([held.reason, held.check, held.sentences.map((s) => s.index)], ["CONTRADICTED_HELD", "C-115.45", [4]]);
  for (const release of [[{ ord: 4 }], [{ ord: 4, reason: " " }], [{ ord: 1, reason: "not this one" }]])
    assert.equal((await approve(f, d.id, { release })).reason, "CONTRADICTED_HELD", JSON.stringify(release));
  const ok = await approve(f, d.id, { release: [{ ord: 4, reason: "we say so openly, and stand by it" }] });
  assert.deepEqual([ok.ok, ok.released], [true, [{ ord: 4, reason: "we say so openly, and stand by it" }]]);
  assert.deepEqual(JSON.parse(x.row(`SELECT outward FROM filing_approvals WHERE filing_id=?`, d.id).outward).released, ok.released, "recorded with the approval");
  /* control: with no contradicted sentence no release is asked; the check runs again on the approved (edited) text */
  const d2 = prep(f, A, { text });
  const edited = await approve(f, d2.id, { text: `${CLAIM} Will the board vote again?` });
  assert.deepEqual([edited.ok, edited.check.record_check.items.map((i) => i.verdict)], [true, ["supported", "question"]]);
  /* the group's own dated correspondence is cited */
  assert.equal(x.actions.actionCorrespond({ target: A, direction: "sent", at: "2026-03-10", account: "letter to the clerk", author: V("bo"), viewer: V("bo") }).ok, true);
  assert.ok(prep(f, A).outward.record_check.cites.includes(`${A}#0`));
  /* a judgment that throws: undetermined, never supported */
  const thrown = f45(x, { accountCheck: () => { throw new Error("down"); } });
  const u = prep(thrown, A, { text: CLAIM });
  assert.deepEqual([u.outward.record_check.state, u.outward.record_check.items[0].verdict], ["undetermined", "undetermined"]);
  /* the briefing section is checked too */
  const p = f.counselPacket({ reason: WHY, action: x.action({ kind: "commitment_claim" }), counsel: COUNSEL, template: { id: "TPL-test-commitment-brief" },
                              author: V("olive"), viewer: V("olive") });
  assert.ok(p.sections.briefing.record_check.items.length >= 1);
});

test("R35 R24 everything prepared from an action resting on held findings says so, on accepted findings names the group (with its identity and stake), each read from actions' disclosures in their order and printed first; one resting only on published findings carries neither; the override's ground is printed with its reason, author and time", async () => {
  const x = world();
  const H = x.action(), C = x.action(), P = x.action(), O = x.action({ breach: true, override: "the deadline falls before a case" });
  const over = { reason: "the deadline falls before a case", by: V("olive"), at: "2026-03-01T00:00:00Z",
                 ground: { kind: "legal_deadline", citation: "Test Stat. § 9.20", date: "2026-04-01" } };
  const f = f45(x, { actions: actionsWith(x, {
    [H]: { disclosures: [{ kind: "checked_held", checked_at: "2026-11-03" }] },
    [C]: { disclosures: [{ kind: "accepted", group: "Hayward Parents for Accountability", edition_date: "2026-09-03", accepted_at: "2026-09-20",
                           identity: { name: "Hayward Parents", domain: "hpa.example" }, stake: "parents of pupils" },
                         { kind: "checked_held", checked_at: "2026-11-03" }] },
    [P]: { disclosures: [] },
    [O]: { premise_override: over, disclosures: [{ kind: "override", ...over }] } }) });
  const held = KEYED["prepared.rests.held"].replace("{date}", "2026-11-03");
  const h = prep(f, H);
  assert.ok(h.text.startsWith(`${held}\n\n`), h.text);
  const c = comm(f, C);
  const [first, second] = c.text.split("\n");
  assert.equal(first, "Rests on findings of Hayward Parents for Accountability (edition of 2026-09-03), accepted by us on 2026-09-20. "
    + "Its public identity: Hayward Parents, hpa.example. Its declared stake: parents of pupils.", "in its order, the accepted first");
  assert.equal(second, held);
  const pk = f.counselPacket({ reason: WHY, action: C, author: V("olive"), viewer: V("olive") });
  assert.ok(pk.disclosure.startsWith("Rests on findings of Hayward Parents"));
  const p = prep(f, P);
  assert.deepEqual([p.disclosure, p.text.includes("Rests on")], [null, false], "control: published findings only");
  const o = prep(f, O);
  assert.match(o.text, /^Rests on an unestablished premise: the deadline falls before a case; on the ground of a legal deadline, Test Stat\. § 9\.20, falling on 2026-04-01 \(stated by member:olive at 2026-03-01T00:00:00Z\)/);
});

test("R22 an approved text's stamp carries the group's public identity and declared stake (public-read's groupFields) beside the quartet, outside its hash: the body fingerprint is the same with any group's fields", async () => {
  const x = world();
  x.pr.registerGroupIdentity({ identity: () => ({ group: "test-group", display_name: "Port Ellery Watch", domain: "pew.example", domain_verified_at: "2026-09-01" }) });
  x.record.setSetting("declared_stake", "residents of the harbour ward", V("olive"));
  const f = f45(x);
  const d = prep(f, x.action(), { text: "A plain letter." });
  const r = await approve(f, d.id);
  assert.deepEqual([r.inband.group.name, r.inband.group.domain, r.inband.group.stake], ["Port Ellery Watch", "pew.example", "residents of the harbour ward"]);
  assert.ok(r.bytes.includes(groupLine(r.inband.group)));
  const y = world();
  const g = f45(y);
  const e = await approve(g, prep(g, y.action(), { text: "A plain letter." }).id);
  assert.deepEqual([e.inband.hash.sha256, e.body_sha], [r.inband.hash.sha256, r.body_sha], "the fingerprint is computed without the group's fields");
  assert.equal(e.inband.group.name, null, "no identity registered: undetermined");
});

test("R23 a communication is drafted from the findings and inquiries the member chooses (from), published or not, any the preparer may see; one not seen answers as one absent (NO_SUCH_BUNDLE); a request for comment's claims are a sourced list labelled machine work; no published case is needed", async () => {
  const x = world();
  const f = f45(x);
  const Q = "INQ-2026-0002-quay";
  x.inquiry(Q, { legs: [{ target: DOC }] });
  const A = x.action();
  const c = comm(f, A, { from: [F, Q] });
  assert.deepEqual([c.ok, c.from], [true, [F, Q]], JSON.stringify(c).slice(0, 300));
  for (const bad of [["INQ-2026-0999"], [Q]]) {
    const r = comm(f, A, { from: bad, viewer: bad[0] === Q ? STRANGER : V("bo") });
    assert.equal(r.reason, bad[0] === Q ? "NO_SUCH_ACTION" : "NO_SUCH_BUNDLE");
  }
  /* an inquiry of a project bo is not in: answered as one absent */
  const docks = x.project("Docks", "cy");
  const H = "INQ-2026-0003-docks";
  x.inquiry(H, { legs: [{ target: DOC }] });
  assert.equal(x.promote(H, x.text(H).replace(`id: ${H}\n`, `id: ${H}\nproject: ${docks}\n`)).ok, true);
  const hidden = comm(f, A, { from: [H] });
  const absent = comm(f, A, { from: ["INQ-2026-0999"] });
  assert.deepEqual([hidden.reason, hidden.check], [absent.reason, absent.check]);
  assert.equal(hidden.reason, "NO_SUCH_BUNDLE");
  /* a request for comment: the claims from the findings chosen, each naming its finding, machine work */
  const R = x.action({ kind: "request_for_comment", legs: [{ target: Q, kind: "advances" }] });
  const rfc = comm(f, R, { from: [F, Q] });
  assert.equal(rfc.ok, true, JSON.stringify(rfc).slice(0, 300));
  assert.deepEqual(rfc.claims.items.map((i) => [i.finding, i.kind]), [[F, "published"], [Q, "unpublished"]]);
  assert.equal(rfc.claims.items[0].claim, CLAIM);
  assert.equal(rfc.claims.label.machine_work, true);
  assert.equal(FILINGS_CHECKS.NO_SUCH_BUNDLE.check, "C-115.55");
});

test("R36 jointSignatory: a member records that a partner approved the same text in its own copy: refusals MACHINE_CANNOT_APPROVE, NO_SUCH_FILING, NOT_APPROVED, NOT_A_PARTNER, JOINT_FINGERPRINT_MISMATCH; a matching fingerprint from a listed partner lands and filingsFor lists it; one character changed mismatches", async () => {
  const x = world();
  const A = x.action();
  const f = f45(x, { actions: actionsWith(x, { [A]: { partners: [{ role: "chair", organisation: "Harbour Watch" }] } }) });
  const d = prep(f, A, { text: "Our joint letter." });
  const js = (o = {}) => f.jointSignatory({ filing: d.id, organisation: "Harbour Watch", body_sha: sha("Our joint letter."), account: "their chair signed at their meeting",
                                            author: V("bo"), viewer: V("bo"), ...o });
  assert.equal(js({ author: MACHINE }).reason, "MACHINE_CANNOT_APPROVE");
  assert.equal(js({ filing: "FIL-NONE" }).reason, "NO_SUCH_FILING");
  assert.equal(js().reason, "NOT_APPROVED");
  const ap = await approve(f, d.id);
  assert.equal(ap.body_sha, sha("Our joint letter."));
  assert.equal(js({ organisation: "Elsewhere Society" }).reason, "NOT_A_PARTNER");
  assert.equal(js({ body_sha: sha("Our joint letter!") }).reason, "JOINT_FINGERPRINT_MISMATCH", "one character changed");
  const r = js();
  assert.deepEqual([r.ok, r.organisation, r.role], [true, "Harbour Watch", "chair"]);
  assert.deepEqual(f.filingsFor({ action: A, viewer: V("bo") }).drafts[0].signatories.map((s) => s.organisation), ["Harbour Watch"]);
  assert.equal(await x.op("jointsignatory", { author: V("bo"), viewer: V("bo") }, { filing: d.id }).reason, "NOT_A_PARTNER", "the op");
});

test("R37 documenting an infraction: assembled from the record with AI off (the act and its office, the standard, the evidence for each point with its grade, what is still uncertain), each part naming its source; for the violating party a request for comment with the quoting sentence and a time for review and response; the assistant's draft a labelled proposal; audience required", async () => {
  const x = world();
  const f = f45(x);
  const A = x.action();
  const doc = (o) => f.communicationPrepare({ action: A, purpose: "document_infraction", preparer: V("bo"), viewer: V("bo"), ...o });
  assert.deepEqual([doc({}).reason, doc({}).field], ["FILING_MARK_REFUSED", "audience"]);
  assert.equal(doc({ audience: "everyone" }).reason, "FILING_MARK_REFUSED");
  const m = doc({ audience: "members" });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  const names = m.parts.map((p) => p.part);
  for (const n of ["the act", "the standard", "a point", "evidence", "still uncertain"]) assert.ok(names.includes(n), n);
  for (const p of m.parts) assert.ok(p.source || p.part === "still uncertain" || p.undetermined, JSON.stringify(p));
  assert.match(m.text, /The act: the adoption recorded as EVT-.*by Selectboard, Port Ellery Selectboard/);
  assert.equal(m.text.includes(KEYED["rfc.quoting"]), false, "members: no request for comment");
  const vp = doc({ audience: "violating_party" });
  assert.ok(vp.text.includes(KEYED["rfc.quoting"]));
  assert.match(vp.text, /We invite your review and response by 2026-04-01 \(P\.E\.B\.L\. § 4\)/);
  assert.equal((await approve(f, vp.id, { text: vp.text.replace(KEYED["rfc.quoting"], "") })).reason, "RFC_QUOTING_MISSING");
  /* the assistant's draft: a labelled proposal, approved per version */
  const ai = doc({ audience: "oversight", text: "The office let the works order without a vote.", preparer: MACHINE, viewer: MACHINE });
  assert.deepEqual([ai.ok, ai.label.machine_work], [true, true]);
});

test("R38 the chance to fix: a notice of what correcting the act and remedying its harm would look like under the standard, with a time (the law's period, cited, or the group's window); an own-benefit ask is pointed out and refused SELF_BENEFIT_ASK until rewritten, with no override; another ask is pointed out unless it asks for the standard, a recorded remedy or a profile route; a notice asking only for the standard's act is approved", async () => {
  const x = world();
  const f = f45(x);
  const A = x.action();
  const n = f.communicationPrepare({ action: A, purpose: "chance_to_fix", language: "en", preparer: V("bo"), viewer: V("bo") });
  assert.equal(n.ok, true, JSON.stringify(n).slice(0, 300));
  assert.match(n.text, /Correcting the act would look like this: a vote of the Selectboard/);
  assert.ok(n.parts.some((p) => p.part === "a time"));
  const ok = await approve(f, n.id);
  assert.equal(ok.ok, true, `the assembled notice asks only for the standard's act: ${JSON.stringify(ok).slice(0, 300)}`);
  const asking = "We ask that you hold a vote of the Selectboard. We ask that you repaint the quay. Please fund our newsletter.";
  const c = f.communicationPrepare({ action: A, purpose: "chance_to_fix", text: asking, language: "en", preparer: V("bo"), viewer: V("bo") });
  assert.deepEqual(c.outward.asks.map((a) => [a.index, !!a.allowed, !!a.pointed]), [[0, true, false], [1, false, true], [2, false, true]]);
  assert.deepEqual(c.outward.pointed.own_benefit_ask.pointed.map((p) => p.index), [2]);
  const refused = await approve(f, c.id, { resolutions: [] });
  assert.deepEqual([refused.reason, refused.check, refused.sentences.map((s) => s.index)], ["SELF_BENEFIT_ASK", "C-115.46", [2]]);
  assert.equal((await approve(f, c.id, { text: "We ask that you hold a vote of the Selectboard. We ask that you repaint the quay." })).ok, true,
               "rewritten, it is approved; the other ask is pointed out, never refused");
  /* the same holds for any demand */
  const dem = prep(f, A, { text: "Please pay us for our time." });
  assert.equal((await approve(f, dem.id)).reason, "SELF_BENEFIT_ASK");
});

test("R39 when the member marks that a text names a pending measure or a candidate, the governing view's campaign-spending fact is shown once with its citation, never refusing; in a comment prepared as the group's act, each position sentence is pointed out; an unmarked draft carries no notice", async () => {
  const x = world();
  const f = f45(x);
  const A = x.action();
  const fact = combine([PROFILE]).view.legal_facts.find((l) => l.trigger === "pending_measure_or_candidate");
  const d = prep(f, A, { names_pending: true });
  const el = d.notices.filter((n) => n.kind === "election");
  assert.deepEqual(el.map((n) => [n.key, n.citation]), [["filings.election.notice", fact.citation]]);
  assert.equal(prep(f, A).notices.some((n) => n.kind === "election"), false, "control: unmarked");
  const g = comm(f, A, { voice: "group", text: "We support the new budget. The vote was on 2 March." });
  assert.deepEqual(g.outward.pointed.position.pointed.map((p) => p.index), [0]);
  assert.equal("position" in comm(f, A, { text: "We support the new budget." }).outward.pointed, false, "not a comment as the group's act");
  assert.equal((await approve(f, g.id)).ok, true, "pointed out, never refused");
});

test("R40 a draft or communication for a request for comment carries the sentence that the reply may be quoted unless it says otherwise; an approved text without it is refused RFC_QUOTING_MISSING; with it, approved", async () => {
  const x = world();
  const f = f45(x);
  const Q = "INQ-2026-0002-quay";
  x.inquiry(Q, { legs: [{ target: DOC }] });
  const R = x.action({ kind: "request_for_comment", legs: [{ target: Q, kind: "advances" }] });
  const d = comm(f, R, { text: "Please comment on the works order." });
  assert.ok(d.text.endsWith(KEYED["rfc.quoting"]));
  const r = await approve(f, d.id, { text: "Please comment on the works order." });
  assert.deepEqual([r.reason, r.check, r.key], ["RFC_QUOTING_MISSING", "C-115.47", "rfc.quoting"]);
  assert.equal((await approve(f, d.id)).ok, true, "control: with it");
  assert.equal(comm(f, x.action(), { text: "A letter." }).text.includes(KEYED["rfc.quoting"]), false, "another kind carries none");
});

test("R41 templatesForAction answers the offered file versions for the action's kind at governing tier 1 or 2, latest first; it takes an action, never a kind alone (NO_SUCH_ACTION); a Tier 3 action is offered none", async () => {
  const x = world();
  const A = x.action();
  const r = x.f.templatesForAction({ action: A, viewer: V("bo") });
  assert.equal(r.ok, true);
  assert.ok(r.versions.some((v) => v.template === "TPL-test-bylaw-complaint"));
  assert.ok(r.versions.every((v) => v.template !== "TPL-test-commitment-brief"));
  assert.equal(x.f.templatesForAction({ viewer: V("bo") }).reason, "NO_SUCH_ACTION", "no action");
  assert.equal(x.f.templatesForAction({ action: "bylaw_complaint", viewer: V("bo") }).reason, "NO_SUCH_ACTION", "a kind is no action");
  assert.equal(x.f.templatesForAction({ action: A, viewer: STRANGER }).reason, "NO_SUCH_ACTION");
  assert.deepEqual(x.f.templatesForAction({ action: x.action({ kind: "commitment_claim" }), viewer: V("bo") }).versions, []);
  assert.equal(x.op("templatesforaction", { action: A, viewer: V("bo") }).ok, true);
});

test("R42 where the project names the act as needing a second approval, filingRecordSent refuses SECOND_APPROVAL_NEEDED until a member other than the approver approves (filingSecondApprove: MACHINE_CANNOT_APPROVE, NO_SUCH_FILING, NOT_APPROVED, SAME_APPROVER); with no setting naming the act, one approval sends", async () => {
  const x = world();
  const f = f45(x);
  const send = (id) => f.filingRecordSent({ filing: id, at: "2026-09-29", account: "handed in", author: V("bo"), viewer: V("bo") });
  const A = x.action();
  const d0 = prep(f, A, { text: "One." });
  await approve(f, d0.id);
  assert.equal(send(d0.id).ok, true, "control: no setting");
  const roster = projectRosterOf(x.host, { record: x.record });
  roster.migrate();
  const set = roster.projectApprovalSet({ projectId: x.proj, needs: [{ kind: "bylaw_complaint" }], reason: "public letters get two eyes", by: "olive", viewer: V("olive") });
  assert.equal(set.ok, true, JSON.stringify(set).slice(0, 300));
  const B = x.action();
  const d = prep(f, B, { text: "Two." });
  const sa = (o) => f.filingSecondApprove({ filing: d.id, author: V("cy"), viewer: V("cy"), ...o });
  assert.equal(sa({ author: MACHINE }).reason, "MACHINE_CANNOT_APPROVE");
  assert.equal(sa({ filing: "FIL-NONE" }).reason, "NO_SUCH_FILING");
  assert.equal(sa().reason, "NOT_APPROVED");
  await approve(f, d.id);
  assert.equal(send(d.id).reason, "SECOND_APPROVAL_NEEDED");
  assert.equal(sa({ author: V("bo"), viewer: V("bo") }).reason, "SAME_APPROVER");
  assert.equal(sa().ok, true);
  assert.equal(send(d.id).ok, true);
  assert.equal(f.filingsFor({ action: B, viewer: V("bo") }).drafts[0].second_approval.approved_by, V("cy"));
});

test("R43 the assertion gate: each sentence the phrasing list points out (and the assistant's, matched by its verbatim quote, labelled machine work) is resolved at approval: ASSERTION_UNRESOLVED until it is, ASSERTION_RESOLUTION_REFUSED for a malformed resolution; only_asks with words lands; breach_claim makes the action a breach action through actions' revision; a text with none needs no resolution; a language with no list is approved with phrasing.no_list", async () => {
  const x = world();
  const f = f45(x);
  const A = x.action();
  const S = "The board acted in breach of the bylaw.";
  const d = prep(f, A, { text: `${S} We ask for the minutes.` });
  assert.deepEqual(d.outward.pointed.assertion.pointed.map((p) => p.index), [0]);
  const un = await approve(f, d.id);
  assert.deepEqual([un.reason, un.check, un.sentences.map((s) => s.index)], ["ASSERTION_UNRESOLVED", "C-115.52", [0]]);
  for (const resolutions of [[{ sentence: "no such sentence", resolution: "only_asks", words: "x" }], [{ sentence: S, resolution: "only_asks" }], "x"])
    assert.equal((await approve(f, d.id, { resolutions })).reason, "ASSERTION_RESOLUTION_REFUSED", JSON.stringify(resolutions));
  const asks = await approve(f, d.id, { resolutions: [{ sentence: S, resolution: "only_asks", words: "we ask the office to examine it" }] });
  assert.equal(asks.ok, true, JSON.stringify(asks).slice(0, 300));
  assert.deepEqual(JSON.parse(x.row(`SELECT outward FROM filing_approvals WHERE filing_id=?`, d.id).outward).resolutions.map((r) => r.resolution), ["only_asks"]);
  /* breach_claim: the action becomes a breach action through actions' own write */
  assert.equal(x.read(A).breach, false);
  const d2 = prep(f, A, { text: S });
  const bc = await approve(f, d2.id, { resolutions: [{ sentence: S, resolution: "breach_claim" }] });
  assert.equal(bc.ok, true, JSON.stringify(bc).slice(0, 400));
  assert.equal(x.read(A).breach, true);
  /* none pointed: no resolution; Spanish: no list, approved with phrasing.no_list */
  assert.equal((await approve(f, prep(f, A, { text: "We ask for the minutes." }).id)).ok, true);
  const es = await approve(f, prep(f, A, { text: "La junta actuó in breach of la norma.", language: "es" }).id);
  assert.deepEqual([es.ok, es.no_list.key], [true, "phrasing.no_list"]);
  /* the assistant's assertions, matched by quote and never by index */
  const tc = { sentences: [{ index: 99, quote: "repaved the quay without", reads_as: "assertion", why: "reads as a finding" }] };
  const m = prep(f, A, { text: "We ask for the minutes. The office repaved the quay without a permit.", textcheck: tc });
  assert.deepEqual(m.outward.pointed.assertion_machine.items.map((i) => [i.index, i.label.machine_work]), [[1, true]]);
  assert.equal((await approve(f, m.id)).reason, "ASSERTION_UNRESOLVED");
});

test("R44 a public comment or testimony prepared as myself (voice: self) is the member's own notes: answered so, never approved or recorded as the group's act (NOT_THE_GROUPS_ACT); voice group is approved and stamped", async () => {
  const x = world();
  const f = f45(x);
  const A = x.action();
  const s = comm(f, A, { voice: "self", text: "My own notes for the meeting." });
  assert.deepEqual([s.ok, s.voice_says.key], [true, "filings.voice.self"]);
  const ap = await approve(f, s.id);
  assert.deepEqual([ap.reason, ap.check], ["NOT_THE_GROUPS_ACT", "C-115.54"]);
  assert.equal(f.filingRecordSent({ filing: s.id, at: "2026-09-29", account: "read aloud", author: V("bo"), viewer: V("bo") }).reason, "NOT_THE_GROUPS_ACT");
  assert.deepEqual(x.read(A).correspondence, []);
  const g = comm(f, A, { voice: "group", text: "The group's comment." });
  assert.ok((await approve(f, g.id)).inband);
  assert.equal(comm(f, A, { voice: "everyone" }).reason, "FILING_MARK_REFUSED");
});

test("R45 a text for a kind the view marks shape: recognition carries, once, the reminder that thanks name staff publicly, never refusing; a non-recognition draft carries none", async () => {
  const x = world();
  const f = f45(x);
  const R = x.action({ kind: "recognition_letter" });
  const d = prep(f, R, { text: "Thank you to the clerk's office." });
  assert.deepEqual(d.notices.filter((n) => n.kind === "reminder").map((n) => n.key), ["recognition.staff_public"]);
  assert.equal((await approve(f, d.id)).ok, true);
  assert.equal(prep(f, x.action()).notices.some((n) => n.kind === "reminder"), false);
});

test("R46 a press action's review copy carries the embargo and release times on its face and in its stamp's subject; sent before the release time, it is recorded as the review copy, saying so; with no terms, the copy says no embargo is stated", async () => {
  const x = world();
  const press = { state: "named", kind: "press", role: "civic reporter", organisation: "The Port Ellery Ledger" };
  const P = x.action({ counterparty: press }), N = x.action({ counterparty: press });
  const f = f45(x, { actions: actionsWith(x, { [P]: { press_terms: { on_record: "on_record", embargo_until: "2026-10-01T09:00", release_at: "2026-10-02T09:00" } } }) });
  const d = comm(f, P, { text: "Our findings, for your story." });
  assert.ok(d.text.startsWith("Review copy. Embargoed until 2026-10-01T09:00; for release at 2026-10-02T09:00."));
  const ap = await approve(f, d.id);
  assert.match(ap.inband.hash.over, /embargo_until/);
  const s = f.filingRecordSent({ filing: d.id, at: "2026-09-30", account: "emailed to the reporter", author: V("bo"), viewer: V("bo") });
  assert.deepEqual([s.ok, s.review_copy.review_copy], [true, true]);
  assert.match(s.review_copy.says, /review copy/);
  assert.ok(comm(f, N, { text: "Words." }).text.startsWith(KEYED["filings.review_copy.no_embargo"]));
  assert.equal(comm(f, x.action(), { text: "Words." }).text, "Words.", "not a press action: no line");
});

test("R47 holdNoticePrepare: for a hold in place, a plain notice telling members what to keep outside Civicsmith (the place, the reason, the date, the kinds of material), labelled, naming no recipient; a released hold prepares nothing (HOLD_NOT_IN_PLACE, action-holds' own)", async () => {
  const x = world();
  const A = x.action();
  const statements = { [A]: [{ hold: "in_place", reason: "a solicitor's letter", by: V("olive"), at: "2026-09-20T10:00:00Z" }],
                       released: [{ hold: "in_place", reason: "r", at: "2026-09-01" }, { hold: "released", reason: "settled", at: "2026-09-10" }] };
  const actionHolds = { holdsOf: ({ target }) => ({ ok: true, statements: statements[target] || [] }),
                        holdNotInPlace: (place) => ({ ok: false, reason: "HOLD_NOT_IN_PLACE", code: "HOLD_NOT_IN_PLACE", check: "C-149.x", place }) };
  const f = f45(x, { actionHolds });
  const n = f.holdNoticePrepare({ place: { target: A }, preparer: V("bo"), viewer: V("bo") });
  assert.equal(n.ok, true, JSON.stringify(n).slice(0, 300));
  assert.match(n.text, /a solicitor's letter/);
  assert.match(n.text, /2026-09-20/);
  assert.match(n.text, /Keep, outside Civicsmith/);
  for (const m of ["olive", "bo", "cy"]) assert.equal(n.text.includes(m), false, "names no member");
  assert.equal(n.label.state, "member_proposed");
  const r = f.holdNoticePrepare({ place: { target: "released" }, preparer: V("bo"), viewer: V("bo") });
  assert.deepEqual([r.reason, r.check], ["HOLD_NOT_IN_PLACE", "C-149.x"], "action-holds' refusal passed through");
  assert.equal(f.holdNoticePrepare({ place: { target: A }, preparer: "" }).reason, "FILING_NO_PREPARER");
  assert.equal(x.f.holdNoticePrepare({ place: { target: A }, preparer: V("bo"), viewer: V("bo") }).reason, "HOLD_NOT_IN_PLACE", "no module: refused, never passed");
});

test("R48 a sentence naming staff below the responsible official is pointed out only through the assistant's textcheck (reads_as staff_named), labelled, never refusing; with the assistant off the draft says the check did not run", async () => {
  const x = world();
  const f = f45(x);
  const A = x.action();
  const off = prep(f, A, { text: "The clerk, Ann Example, refused." });
  assert.deepEqual([off.outward.pointed.staff_named.ran, off.outward.pointed.staff_named.key], [false, "filings.staff.not_run"]);
  const tc = { sentences: [{ index: 0, quote: "Ann Example", reads_as: "staff_named", why: "a junior clerk" }] };
  const on = prep(f, A, { text: "The clerk, Ann Example, refused.", textcheck: tc });
  assert.deepEqual(on.outward.pointed.staff_named.items.map((i) => [i.index, i.label.machine_work]), [[0, true]]);
  assert.equal((await approve(f, on.id)).ok, true, "never refusing");
});

test("R49 each legal fact of the governing view whose applies_to names the action's kind is shown once with its citation at preparation, never refusing; an entry for another kind is not shown", async () => {
  const x = world();
  const f = f45(x);
  const facts = combine([PROFILE]).view.legal_facts.filter((l) => Array.isArray(l.applies_to) && l.applies_to.includes("bylaw_complaint"));
  const d = prep(f, x.action());
  assert.deepEqual(d.notices.filter((n) => n.kind === "legal_fact").map((n) => [n.key, n.citation]), facts.map((l) => [l.key, l.citation]));
  assert.ok(facts.length >= 1);
  const other = comm(f, x.action({ kind: "commitment_claim" }));
  assert.equal(other.notices.some((n) => n.kind === "legal_fact"), false);
});

test("R8 R9 a packet needs no determination and no override: with none, the facts section sets out each matter's support as it stands (the inquiry and the findings it holds, each with its kind and grade, not determined); purpose claim by default; a defence packet adds challenged statements, pressure received and defence deadlines; a claim packet has none; no fixed sentence states a claim or a protection", async () => {
  const x = world();
  const Q = "INQ-2026-0002-quay";
  x.inquiry(Q, { legs: [{ target: DOC }] });
  const A = x.action({ kind: "commitment_claim", legs: [{ target: Q, kind: "advances" }] });
  const pressure = { pressureFor: ({ action }) => ({ ok: true, items: action ? [{ action, ord: 0, kind: "legal", note: "a solicitor's letter", at: "2026-09-21" }] : [] }) };
  const docket = { docketPressureMarks: () => ({ ok: true, marks: [{ mark: 1, entry: "DKT-1", case: CASE, project: x.proj, kind: "legal", note: "a threat", at: "2026-09-22" },
                                                                   { mark: 2, entry: "DKT-2", case: "CASE-OTHER", project: "PRJ-other", kind: "legal", note: "elsewhere", at: "2026-09-23" }], cursor: null }) };
  const f = f45(x, { actionHolds: pressure, docket });
  const claim = f.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  assert.equal(claim.ok, true, JSON.stringify(claim).slice(0, 300));
  assert.equal(claim.purpose, "claim");
  const facts = claim.sections.facts.items;
  assert.deepEqual(facts.map((i) => [i.finding, i.kind, i.determined]), [[Q, "unpublished", false]]);
  assert.ok(facts.every((i) => i.grade), "each with its grade");
  assert.match(claim.sections.facts.says, /not determined/);
  for (const k of ["challenged", "pressure", "defence_deadlines"]) assert.equal(k in claim.sections, false, `a claim packet has no ${k}`);
  /* a defence packet on an action resting on the determination of the case's finding: the case's docket marks */
  const B = x.action({ kind: "commitment_claim" });
  const def = f.counselPacket({ reason: WHY, action: B, counsel: COUNSEL, purpose: "defence", author: V("olive"), viewer: V("olive"),
                                challenged: [{ statement: "The group said the order was let without a vote.", findings: [F] }] });
  assert.equal(def.ok, true, JSON.stringify(def).slice(0, 300));
  assert.deepEqual(def.sections.challenged.items.map((c) => [c.statement, c.findings.map((y) => y.finding)]), [["The group said the order was let without a vote.", [F]]]);
  assert.deepEqual(def.sections.pressure.items.map((p) => [p.from, p.at]), [["action-holds", "2026-09-21"], ["docket", "2026-09-22"]], "the case's own docket only");
  const defending = combine([PROFILE]).view.deadlines.filter((r) => r.defends === true).map((r) => r.rule);
  assert.deepEqual(def.sections.defence_deadlines.items.map((d) => d.rule), defending);
  assert.equal(f.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, purpose: "attack", author: V("olive"), viewer: V("olive") }).reason, "FILING_MARK_REFUSED");
  assert.equal(f.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, challenged: [{ statement: "x" }], author: V("olive"), viewer: V("olive") }).reason,
               "FILING_MARK_REFUSED", "challenged statements belong to a defence packet");
  /* the packet's own words never say the group has a claim, or whether a protection applies */
  const words = [];
  const walk = (o, k) => { if (typeof o === "string" && ["says", "title", "marking", "text"].includes(k)) words.push(o);
    else if (o && typeof o === "object") for (const [kk, v] of Object.entries(o)) walk(v, kk); };
  walk(def.sections); walk(claim.sections);
  for (const w of words) assert.doesNotMatch(w, /(has|have) a (valid )?claim|protection (applies|does not apply)|is protected/i, w);
  /* an override is still disclosed; NO_DETERMINATION is never answered */
  assert.equal("NO_DETERMINATION" in FILINGS_CHECKS, false);
});

test("R10 a packet for an action of a counsel-matter project carries, beside the marking, the privilege marking and a warning on sharing outside (packet.privileged, packet.privileged.warning) on its head, every section and its export; the same packet in a project of scope none carries neither", async () => {
  const x = world();
  const A = x.action({ kind: "commitment_claim" });
  const none = x.f.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  assert.equal("privileged" in none, false);
  assert.equal((await x.f.counselPacketExport({ id: none.id, author: V("olive"), viewer: V("olive") })).bytes.includes(KEYED["packet.privileged"]), false);
  const roster = projectRosterOf(x.host, { record: x.record });
  roster.migrate();
  const set = roster.projectScopeSet({ projectId: x.proj, scope: "counsel_matter", reason: "counsel is briefed", by: "olive", viewer: V("olive") });
  assert.equal(set.ok, true, JSON.stringify(set).slice(0, 300));
  const p = x.f.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  assert.deepEqual([p.privileged.key, p.privileged.warning.key, p.head.privileged.key, p.marking], ["packet.privileged", "packet.privileged.warning", "packet.privileged", counselMarking(COUNSEL)]);
  for (const s of Object.values(p.sections)) assert.equal(s.privileged && s.privileged.key, "packet.privileged", s.title);
  const e = await x.f.counselPacketExport({ id: p.id, author: V("olive"), viewer: V("olive") });
  assert.ok(e.bytes.split("\n").filter((l) => l === KEYED["packet.privileged.warning"]).length >= 8);
  assert.equal(x.f.counselPacketRead({ id: p.id, viewer: V("olive") }).privileged.key, "packet.privileged");
});

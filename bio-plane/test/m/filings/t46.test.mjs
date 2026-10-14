/* filings at T46 (T46-37): the second approval's read per draft (R50; N930), the eight T45 rows read by key from
   `words.json` (R51), and the keyed sentences read by key, their placeholders filled (R52) (DEC-194, N913); with R34
   checked against case-checker R24 as T46-23 states it (a sentence with nothing checkable reads supported when it cites
   anything). Driven at the module's interface over the real modules, as `t45.test.mjs` is; `words.json` is read here,
   the module's words compared with it by key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, V, F, WHY, actionsWith } from "./fixture.mjs";
import { KEYED, FILINGS_CHECKS, FILINGS_WORDS } from "../../../src/filings/index.mjs";
import { ACTION_HOLDS_CHECKS } from "../../../src/action-holds/checks.mjs";
import { projectRosterOf } from "../../../src/project-roster/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { PROFILE } from "./fixture.mjs";

const WORDS = new Map(JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"))
  .words.map((w) => [w.key, w.en]));
const fill = (key, o) => WORDS.get(key).replace(/\{(\w+)\}/g, (m, k) => (k in o ? String(o[k]) : m));

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const CLAIM = "The works order was let without the vote the bylaw requires.";
const NEGATED = "The works order was not let without the vote the bylaw requires.";
const prep = (f, action, over = {}) => f.filingPrepare({ action, text: "To the {{counterparty_role}}: a letter.", preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const comm = (f, action, over = {}) => f.communicationPrepare({ action, text: "A word to the board.", purpose: "a letter", preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const approve = (f, filing, over = {}) => f.filingApprove({ filing, author: V("bo"), viewer: V("bo"), ...over });
const send = (f, id) => f.filingRecordSent({ filing: id, at: "2026-09-29", account: "handed in", author: V("bo"), viewer: V("bo") });
const needs = (f, action, id) => f.filingsFor({ action, viewer: V("bo") }).drafts.find((d) => d.filing === id).second_needed;

test("R50 filingsFor answers second_needed per draft: true exactly while project-roster's R24 asks a second approval of its sending and none is recorded, then false; with no setting naming the act, false; a draft already sent, or the member's own notes (never sent), needs none", async () => {
  const x = world();
  const f = x.filingsWith();
  const A = x.action();
  const d0 = prep(f, A, { text: "One." });
  assert.equal(needs(f, A, d0.id), false, "control: no setting names the act");
  await approve(f, d0.id);
  assert.equal(needs(f, A, d0.id), false);
  assert.equal(send(f, d0.id).ok, true);
  const roster = projectRosterOf(x.host, { record: x.record });
  roster.migrate();
  assert.equal(roster.projectApprovalSet({ projectId: x.proj, needs: [{ kind: "bylaw_complaint" }], reason: "public letters get two eyes",
                                           by: "olive", viewer: V("olive") }).ok, true);
  assert.equal(needs(f, A, d0.id), false, "already sent: R42 asks nothing of it");
  const B = x.action();
  const d = prep(f, B, { text: "Two." });
  assert.equal(needs(f, B, d.id), true, "the project asks it, none recorded");
  await approve(f, d.id);
  assert.equal(needs(f, B, d.id), true);
  assert.equal(send(f, d.id).reason, "SECOND_APPROVAL_NEEDED", "the read agrees with R42's refusal");
  assert.equal(f.filingSecondApprove({ filing: d.id, author: V("cy"), viewer: V("cy") }).ok, true);
  assert.equal(needs(f, B, d.id), false, "recorded: no further approval");
  assert.equal(send(f, d.id).ok, true);
  /* another kind the setting does not name: false */
  const C = x.action({ kind: "recognition_letter" });
  assert.equal(needs(f, C, prep(f, C, { text: "Thank you." }).id), false);
  /* a communication of the named kind is asked as a filing is */
  const c = comm(f, B, { text: "Three." });
  assert.equal(needs(f, B, c.id), true);
  /* the member's own notes are never sent (R44), so no second approval is asked of them */
  assert.equal(needs(f, B, comm(f, B, { voice: "self", text: "My notes." }).id), false);
});

test("R51 the rows C-115.45, .46, .48, .49 and C-115.51–.53 translate (C-115.47 is filing-templates', R57) by words.json's refusal.<CODE>, read by key, each answered with it; SECOND_APPROVAL_NEEDED (C-115.50) keeps its own; HOLD_NOT_IN_PLACE is action-holds' row, relayed as it comes; codes and numbers unmoved", async () => {
  const taken = { CONTRADICTED_HELD: "C-115.45", SELF_BENEFIT_ASK: "C-115.46", NOT_A_PARTNER: "C-115.48",
                  JOINT_FINGERPRINT_MISMATCH: "C-115.49", SAME_APPROVER: "C-115.51", ASSERTION_UNRESOLVED: "C-115.52",
                  ASSERTION_RESOLUTION_REFUSED: "C-115.53" };
  for (const [code, check] of Object.entries(taken)) {
    assert.ok(WORDS.has(`refusal.${code}`), code);
    assert.equal(FILINGS_WORDS[`refusal.${code}`], WORDS.get(`refusal.${code}`), `${code}: words.json's words, verbatim`);
    assert.deepEqual([FILINGS_CHECKS[code].check, FILINGS_CHECKS[code].translation], [check, WORDS.get(`refusal.${code}`)], code);
  }
  assert.deepEqual(Object.keys(FILINGS_WORDS).sort(), Object.keys(taken).map((c) => `refusal.${c}`).sort(), "no other word is taken");
  /* kept in T46 */
  assert.equal(FILINGS_CHECKS.SECOND_APPROVAL_NEEDED.check, "C-115.50");
  assert.notEqual(FILINGS_CHECKS.SECOND_APPROVAL_NEEDED.translation, WORDS.get("refusal.SECOND_APPROVAL_NEEDED"), "kept, returned to BOB");
  for (const code of ["HOLD_NOT_IN_PLACE", "HOLD_PLACE_REFUSED"]) assert.equal(code in FILINGS_CHECKS, false, `${code} is action-holds'`);
  /* answered: each refusal carries its row's words */
  const x = world();
  const f = x.filingsWith();
  const A = x.action();
  const d = prep(f, A, { text: `${CLAIM} ${NEGATED}` });
  const held = await approve(f, d.id);
  assert.deepEqual([held.reason, held.check, held.translation], ["CONTRADICTED_HELD", "C-115.45", WORDS.get("refusal.CONTRADICTED_HELD")]);
  const nap = await approve(f, d.id, { release: [{ ord: 1, reason: "stated openly" }] });
  assert.equal(nap.ok, true, JSON.stringify(nap).slice(0, 300));
  const np = f.jointSignatory({ filing: d.id, organisation: "Nobody Ltd", body_sha: nap.body_sha, account: "by letter", author: V("bo"), viewer: V("bo") });
  assert.deepEqual([np.reason, np.translation], ["NOT_A_PARTNER", WORDS.get("refusal.NOT_A_PARTNER")]);
  /* relayed: action-holds' row, as it holds it */
  const nh = x.f.holdNoticePrepare({ place: { target: A }, preparer: V("bo"), viewer: V("bo") });
  assert.deepEqual([nh.reason, nh.check, nh.translation],
                   ["HOLD_NOT_IN_PLACE", ACTION_HOLDS_CHECKS.HOLD_NOT_IN_PLACE.check, ACTION_HOLDS_CHECKS.HOLD_NOT_IN_PLACE.translation]);
});

test("R52 each keyed sentence is words.json's words for its key, read by key, its placeholders as words.json names them and filled from the record; phrasing.no_list keeps its sentence (rfc.quoting is filing-templates', R57); filings.voice.self and filings.staff.not_run are replaced by voice.self.means and pointer.staff.notrun", () => {
  const taken = ["prepared.rests.held", "prepared.rests.accepted", "packet.privileged", "packet.privileged.warning", "filings.election.notice",
                 "recognition.staff_public", "pointer.record.supported", "pointer.record.unsupported", "pointer.record.contradicted",
                 "pointer.position", "pointer.selfbenefit", "pointer.staff", "pointer.staff.notrun", "voice.group", "voice.group.means",
                 "voice.self", "voice.self.means", "filings.secondapproval.given"];
  for (const k of taken) assert.equal(KEYED[k], WORDS.get(k), k);
  assert.ok(WORDS.has("phrasing.no_list"));
  assert.notEqual(KEYED["phrasing.no_list"], WORDS.get("phrasing.no_list"), "phrasing.no_list: kept in T46, returned to BOB");
  assert.equal("rfc.quoting" in KEYED, false, "rfc.quoting is filing-templates' since T48 (R57)");
  assert.equal("filings.secondapproval.waiting" in KEYED, false, "not taken in T46");
  for (const k of ["filings.voice.self", "filings.staff.not_run"]) assert.equal(k in KEYED, false, `${k} replaced`);
  for (const k of ["filings.review_copy.no_embargo", "filings.review_copy.terms"]) assert.equal(WORDS.has(k), false, `${k}: words.json holds none`);
});

test("R52 control: each keyed sentence of a draft, packet or communication reads as words.json holds it, its placeholders filled from the record (disclosures, pointers, notices, voice, the second approval, the privilege marking)", async () => {
  const x = world();
  const H = x.action(), C = x.action();
  const f = x.filingsWith({ actions: actionsWith(x, {
    [H]: { disclosures: [{ kind: "checked_held", checked_at: "2026-11-03" }] },
    [C]: { disclosures: [{ kind: "accepted", group: "Hayward Parents for Accountability", edition_date: "2026-09-03", accepted_at: "2026-09-20",
                           identity: { name: "Hayward Parents", domain: "hpa.example" }, stake: "parents of pupils" }] } }) });
  /* R35 */
  assert.ok(prep(f, H).text.startsWith(`${fill("prepared.rests.held", { date: "2026-11-03" })}\n\n`));
  assert.ok(comm(f, C).text.startsWith(`${fill("prepared.rests.accepted", { group: "Hayward Parents for Accountability", date: "2026-09-03",
                                                                           date_accepted: "2026-09-20" })} `));
  /* R34's pointers */
  const A = x.action();
  const d = prep(f, A, { text: `${CLAIM} The order cost 4,000 dollars. ${NEGATED}` });
  const items = d.outward.record_check.items;
  assert.deepEqual(items.map((i) => [i.verdict, i.pointer.key]),
                   [["supported", "pointer.record.supported"], ["unsupported", "pointer.record.unsupported"], ["contradicted", "pointer.record.contradicted"]]);
  assert.equal(items[0].pointer.text, fill("pointer.record.supported", { findings: items[0].by.join(", ") }));
  assert.ok(items[0].pointer.text.includes(F), "the findings named");
  assert.deepEqual(items.slice(1).map((i) => i.pointer.text), [WORDS.get("pointer.record.unsupported"), WORDS.get("pointer.record.contradicted")]);
  const q = prep(f, A, { text: "Will the board vote again?" });
  assert.equal("pointer" in q.outward.record_check.items[0], false, "a question is never pointed out");
  /* R38, R39, R48's pointers */
  const sb = prep(f, A, { text: "Please pay us for our time." });
  assert.deepEqual(sb.outward.pointed.own_benefit_ask.pointed.map((p) => p.pointer), [{ key: "pointer.selfbenefit", text: WORDS.get("pointer.selfbenefit") }]);
  const g = comm(f, A, { voice: "group", text: "We support the new budget." });
  assert.deepEqual(g.outward.pointed.position.pointed.map((p) => p.pointer.text), [WORDS.get("pointer.position")]);
  const tc = { sentences: [{ quote: "Ann Example", reads_as: "staff_named", why: "a junior clerk" }] };
  assert.deepEqual(prep(f, A, { text: "The clerk, Ann Example, refused.", textcheck: tc }).outward.pointed.staff_named.items.map((i) => i.pointer.text),
                   [WORDS.get("pointer.staff")]);
  assert.equal(prep(f, A, { text: "The clerk refused." }).outward.pointed.staff_named.says, WORDS.get("pointer.staff.notrun"));
  /* R44's voice */
  assert.deepEqual(g.voice_says, { key: "voice.group.means", text: WORDS.get("voice.group.means"), voice: { key: "voice.group", text: WORDS.get("voice.group") } });
  const s = comm(f, A, { voice: "self", text: "My notes." });
  assert.deepEqual(s.voice_says, { key: "voice.self.means", text: WORDS.get("voice.self.means"), voice: { key: "voice.self", text: WORDS.get("voice.self") } });
  assert.equal("voice_says" in comm(f, A), false, "control: no voice stated, none answered");
  /* R39's election notice: {fact} and {citation} from the governing view's legal fact */
  const fact = combine([PROFILE]).view.legal_facts.find((l) => l.trigger === "pending_measure_or_candidate");
  const el = prep(f, A, { names_pending: true }).notices.find((n) => n.kind === "election");
  assert.equal(el.text, fill("filings.election.notice", { fact: fact.statement || fact.key, citation: fact.citation }));
  /* R45's reminder */
  const rec = prep(f, x.action({ kind: "recognition_letter" }), { text: "Thank you to the clerk's office." });
  assert.equal(rec.notices.find((n) => n.kind === "reminder").text, WORDS.get("recognition.staff_public"));
  /* R42's second approval given */
  const roster = projectRosterOf(x.host, { record: x.record });
  roster.migrate();
  assert.equal(roster.projectApprovalSet({ projectId: x.proj, needs: [{ kind: "bylaw_complaint" }], reason: "two eyes", by: "olive", viewer: V("olive") }).ok, true);
  const B = x.action();
  const two = prep(f, B, { text: "Two." });
  await approve(f, two.id);
  const sa = f.filingSecondApprove({ filing: two.id, author: V("cy"), viewer: V("cy") });
  const given = fill("filings.secondapproval.given", { member: V("cy"), date: sa.at.slice(0, 10) });
  assert.deepEqual(sa.given, { key: "filings.secondapproval.given", text: given });
  assert.deepEqual(f.filingsFor({ action: B, viewer: V("bo") }).drafts[0].second_approval.given.text, given);
  /* R10's privilege marking */
  assert.equal(roster.projectScopeSet({ projectId: x.proj, scope: "counsel_matter", reason: "counsel is briefed", by: "olive", viewer: V("olive") }).ok, true);
  const p = x.f.counselPacket({ reason: WHY, action: x.action({ kind: "commitment_claim" }), counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  assert.deepEqual([p.privileged.text, p.privileged.warning.text], [WORDS.get("packet.privileged"), WORDS.get("packet.privileged.warning")]);
});

test("R34 agrees with case-checker R24 (T46-23): a sentence with nothing checkable reads supported when it cites anything (the text's findings and correspondence), naming them; one with a checkable figure the record does not hold reads unsupported", () => {
  const x = world();
  const f = x.filingsWith();
  const d = prep(f, x.action(), { text: "The board should hear residents first. The order cost 4,000 dollars." });
  const [plain, figure] = d.outward.record_check.items;
  assert.equal(plain.verdict, "supported", JSON.stringify(plain));
  assert.ok(plain.by.includes(F), "naming what it cites");
  assert.equal(figure.verdict, "unsupported");
});

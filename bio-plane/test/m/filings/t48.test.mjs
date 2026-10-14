/* filings at T48 (T48-51; N880, N882, N1034, N1053): R40's check asked through filing-templates' R33 (R57), a Tier 2
   filing's offer of a counsel packet (R58), and `filingRead`, a prepared draft read again as it was stored (R59).
   Driven at the module's interface, and through its op, over the real modules, as `t45.test.mjs` is. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, DOC } from "./fixture.mjs";
import { FILINGS_CHECKS, FILINGS_WORDS, KEYED } from "../../../src/filings/index.mjs";
import { RFC_QUOTING_SENTENCE, rfcQuotingRefusal } from "../../../src/filing-templates/index.mjs";

const OUTSIDER = V("quinn");
const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const prep = (f, action, over = {}) => f.filingPrepare({ action, text: "To the {{counterparty_role}}: a letter.", preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const comm = (f, action, over = {}) => f.communicationPrepare({ action, text: "A word to the board.", purpose: "a letter", preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const approve = (f, filing, over = {}) => f.filingApprove({ filing, author: V("bo"), viewer: V("bo"), ...over });
const TABLES = ["filing_drafts", "filing_approvals", "filing_sendings", "communication_drafts", "filing_second_approvals", "joint_signatories"];

function rfcWorld() {
  const x = world();
  const Q = "INQ-2026-0002-quay";
  x.inquiry(Q, { legs: [{ target: DOC }] });
  return { x, R: x.action({ kind: "request_for_comment", legs: [{ target: Q, kind: "advances" }] }) };
}

test("R57 R40 the quoting sentence a request for comment carries is filing-templates' RFC_QUOTING_SENTENCE, and R6 asks its rfcQuotingRefusal on the approved text of a draft, a communication and a documenting version for the violating party, answering its refusal field for field; this module holds neither the sentence nor C-115.47", async () => {
  const { x, R } = rfcWorld();
  const f = x.f;
  assert.equal(typeof RFC_QUOTING_SENTENCE, "string");
  assert.equal("rfc.quoting" in KEYED, false, "no copy of the sentence here");
  assert.equal("RFC_QUOTING_MISSING" in FILINGS_CHECKS, false, "C-115.47 is filing-templates'");
  assert.equal("refusal.RFC_QUOTING_MISSING" in FILINGS_WORDS, false);
  for (const [name, make] of [["a draft", () => prep(f, R, { text: "Please comment on the works order." })],
                              ["a communication", () => comm(f, R, { text: "Please comment on the works order." })],
                              ["a documenting version for the violating party", () => comm(f, R, { text: undefined, purpose: "document_infraction", audience: "violating_party" })]]) {
    const d = make();
    assert.equal(d.ok, true, `${name}: ${JSON.stringify(d).slice(0, 300)}`);
    assert.ok(d.text.includes(RFC_QUOTING_SENTENCE), `${name}: prepared with the sentence`);
    const stripped = d.text.replace(RFC_QUOTING_SENTENCE, "").trim();
    const held = x.count("filing_approvals");
    const r = await approve(f, d.id, { text: stripped });
    assert.deepEqual(r, rfcQuotingRefusal(stripped, { filing: d.id }), `${name}: the provider's refusal, field for field`);
    assert.equal(r.reason, "RFC_QUOTING_MISSING");
    assert.equal(r.ok, false);
    assert.equal(x.count("filing_approvals"), held, "nothing written");
    assert.equal((await approve(f, d.id)).ok, true, `${name}: control: the text with the sentence is approved`);
  }
});

test("R57 R40 controls: a text for another kind of action is never asked the sentence, and its absence is no refusal; the refusal keeps its place after R6's own (a still-unfilled text is STILL_UNFILLED first) and writes nothing", async () => {
  const { x, R } = rfcWorld();
  const f = x.f;
  const other = comm(f, x.action(), { text: "A letter." });
  assert.equal(other.text.includes(RFC_QUOTING_SENTENCE), false);
  assert.equal((await approve(f, other.id)).ok, true, "another kind: approved without it");
  const d = comm(f, R, { text: "Please comment." });
  const before = x.count("filing_approvals");
  assert.equal((await approve(f, d.id, { text: "Please comment on [UNFILLED: law]." })).reason, "STILL_UNFILLED");
  assert.equal((await approve(f, d.id, { text: "Please comment." })).reason, "RFC_QUOTING_MISSING");
  assert.equal(x.count("filing_approvals"), before, "nothing written by a refusal");
});

test("R51 (N1053) NOT_A_PARTNER's translation is words.json's refusal.NOT_A_PARTNER in DEC-221's spelling, read by key and answered with it", async () => {
  const x = world();
  const words = JSON.parse((await import("node:fs")).readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"))
    .words.find((w) => w.key === "refusal.NOT_A_PARTNER").en;
  assert.match(words, /organization/);
  assert.equal(FILINGS_WORDS["refusal.NOT_A_PARTNER"], words);
  assert.deepEqual([FILINGS_CHECKS.NOT_A_PARTNER.check, FILINGS_CHECKS.NOT_A_PARTNER.translation], ["C-115.48", words]);
  const f = x.filingsWith();
  const d = prep(f, x.action({ partners: [{ role: "Chair", organisation: "Harbour Watch" }] }));
  const ok = await approve(f, d.id);
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const np = f.jointSignatory({ filing: d.id, organisation: "Nobody Ltd", body_sha: ok.body_sha, account: "by letter", author: V("bo"), viewer: V("bo") });
  assert.deepEqual([np.reason, np.code, np.check, np.translation], ["NOT_A_PARTNER", "NOT_A_PARTNER", "C-115.48", words]);
  assert.equal(f.jointSignatory({ filing: d.id, organisation: "Harbour Watch", body_sha: ok.body_sha, account: "by letter", author: V("bo"), viewer: V("bo") }).ok, true,
               "control: a listed partner lands");
});

test("R58 R4 a filing prepared at governing tier 2 answers offers [counsel_packet] beside its advisory; a Tier 1 draft answers no offers; the offer is never required (the draft is approved and sent without a packet) and the packet it offers is R8's, assembled at Tier 2 with no counsel", async () => {
  const x = world();
  const f = x.f;
  const t2 = prep(f, x.action({ kind: "records_request", risk_tier: 2 }));
  assert.equal(t2.ok, true, JSON.stringify(t2).slice(0, 300));
  assert.equal(t2.tier, 2);
  assert.ok(t2.advisory);
  assert.deepEqual(t2.offers, ["counsel_packet"]);
  const t1 = prep(f, x.action());
  assert.equal(t1.tier, 1);
  assert.equal("offers" in t1, false, "control: Tier 1 answers no offers");
  assert.equal("advisory" in t1, false);
  /* the same tier-2 kind with a profile giving no advisory still offers (the offer is not the advisory) */
  assert.deepEqual(t2.offers, ["counsel_packet"]);
  /* offered, never required: nothing refuses for it */
  const a = await approve(f, t2.id, { text: "To the Selectboard: a request, signed." });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.equal(f.filingRecordSent({ filing: t2.id, at: "2026-09-29", account: "by hand", author: V("bo"), viewer: V("bo") }).ok, true);
  assert.equal(f.filingsFor({ action: t2.action, viewer: V("bo") }).packets.length, 0, "no packet was needed");
  const p = f.counselPacket({ action: t2.action, reason: "the group asks counsel's view", author: V("bo"), viewer: V("bo") });
  assert.equal(p.ok, true, "the offer is R8's packet: assembled at Tier 2 with no counsel named");
  /* no sentence of the answer says whether the group should act */
  assert.doesNotMatch(JSON.stringify(t2.offers), /should|must|recommend/i);
  /* a communication has no tier, so it answers no offer */
  assert.equal("offers" in comm(f, x.action()), false);
  void COUNSEL;
});

test("R59 filingRead answers a draft as it was stored: its text, blanks with their sources, unfilled with why, the member's fills labelled hers, template, advisory, offers, notices, label and action, equal to what filingPrepare answered; nothing is filled again from the record at the read and nothing is written", async () => {
  const x = world();
  const f = x.f;
  const A = x.action({ kind: "records_request", risk_tier: 2 });
  const text = "To the {{counterparty_role}}: records {{records}} from {{group}} about {{law}}.";
  const d = prep(f, A, { text, fills: { records: "the 2026 minutes" }, names_pending: true });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const before = Object.fromEntries(TABLES.map((t) => [t, x.count(t)]));
  const snap = x.snapshot(TABLES);
  x.groupRef.value = "a-different-group"; // the record has moved on since preparing
  const r = f.filingRead({ filing: d.id, viewer: V("bo") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  for (const k of ["action", "tier", "text", "blanks", "unfilled", "template", "advisory", "offers", "notices", "label", "venue", "evidence"])
    assert.deepEqual(r[k], d[k], `${k}: as filingPrepare answered it`);
  assert.equal(r.filing, d.id);
  assert.ok(r.text.includes("the 2026 minutes") && r.text.includes("test-group") && !r.text.includes("a-different-group"), "not re-filled from the record");
  assert.deepEqual(r.fills.map((b) => [b.name, b.value, b.label.kind, b.label.by]), [["records", "the 2026 minutes", "member_fill", V("bo")]], "the member's fills, labelled hers");
  assert.ok(r.blanks.find((b) => b.name === "group").source, "each filled blank names its source");
  assert.deepEqual(r.approval, null);
  assert.deepEqual(r.sending, null);
  assert.deepEqual(r.offers, ["counsel_packet"]);
  assert.equal(r.notices.length, d.notices.length);
  assert.deepEqual(r.unfilled, d.unfilled);
  assert.deepEqual(Object.fromEntries(TABLES.map((t) => [t, x.count(t)])), before, "writes nothing");
  assert.deepEqual(x.snapshot(TABLES), snap);
  /* a template-filled draft and its unfilled blanks, with why */
  const u = prep(f, x.action(), { text: "To {{counterparty_role}}: {{records}} {{act}}." });
  const ru = f.filingRead({ filing: u.id, viewer: V("bo") });
  assert.deepEqual([ru.text, ru.unfilled, ru.fills, ru.template], [u.text, u.unfilled, [], null]);
  assert.equal("offers" in ru, false, "control: a Tier 1 draft answers no offers");
  assert.equal("advisory" in ru, false);
  assert.ok(ru.unfilled.every((b) => typeof b.why === "string" && b.why));
  /* once approved and sent, beside them */
  const approved = d.text.replace("[UNFILLED: law]", "P.E.B.L. § 12");
  const ap = await approve(f, d.id, { text: approved });
  assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 300));
  const s = f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "by hand", reference: "REQ-77", author: V("bo"), viewer: V("bo") });
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  const done = f.filingRead({ filing: d.id, viewer: V("bo") });
  assert.deepEqual([done.approval.approved_by, done.approval.sha, done.approval.text], [V("bo"), ap.sha, approved]);
  assert.deepEqual([done.sending.recorded_by, done.sending.reference, done.sending.ord], [V("bo"), "REQ-77", s.ord]);
  assert.equal(done.text, d.text, "the draft's text is as stored, not the approved text");
});

test("R59 R23 filingRead answers a communication as stored (its words, the member's fills, its purpose and label, no tier, advisory or offers); the op `filingread` answers the same; an absent draft, one on an action the viewer may not see and one drawing on a determination in a project the viewer may not see answer NO_SUCH_FILING alike, naming nothing", async () => {
  const x = world();
  const f = x.f;
  const A = x.action();
  const c = comm(f, A, { text: "Dear board, {{records}} are enclosed.", fills: { records: "the minutes" } });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  const r = f.filingRead({ filing: c.id, viewer: V("bo") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.form, r.purpose, r.action, r.text, r.label, r.notices], ["communication", c.purpose, A, c.text, c.label, c.notices]);
  assert.deepEqual(r.fills.map((b) => [b.name, b.value, b.label.kind]), [["records", "the minutes", "member_fill"]]);
  for (const k of ["tier", "advisory", "offers"]) assert.equal(k in r, false, k);
  assert.deepEqual(x.op("filingread", { filing: c.id, viewer: V("bo") }), r, "the op answers the same");
  assert.deepEqual(x.op("filingread", { viewer: V("bo") }, { filing: c.id }), r, "from the body too");
  /* absent, invisible: one answer */
  const d = prep(f, A);
  const absent = f.filingRead({ filing: "FIL-2026-9999", viewer: V("bo") });
  assert.equal(absent.reason, "NO_SUCH_FILING");
  assert.equal(x.actions.actionRead({ id: A, viewer: OUTSIDER }).ok, true, "the outsider may see the action");
  const hidden = f.filingRead({ filing: d.id, viewer: OUTSIDER });
  assert.deepEqual({ ...hidden, filing: null }, { ...absent, filing: null }, "a draft on a determination in a project the viewer may not see is absent");
  for (const s of [x.proj, x.D, d.text]) assert.equal(JSON.stringify(hidden).includes(s), false, `names nothing of ${s}`);
  const stranger = f.filingRead({ filing: d.id, viewer: "stranger" });
  assert.equal(stranger.reason, "NO_SUCH_FILING", "an action the viewer may not see");
  assert.equal(f.filingRead({ filing: d.id, viewer: V("bo") }).ok, true, "control: a member of the project reads it");
  assert.equal(f.filingRead({ filing: undefined, viewer: V("bo") }).reason, "NO_SUCH_FILING");
  void MACHINE;
});

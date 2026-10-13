/* filings at T47 (T47-90; K3100): the drafts approved and not yet recorded sent (R53; DEC-212), the venue's own reference
   for a sending (R54; DEC-209 (4)) and the member's own values for a text's blanks (R55; DEC-209 (3)). Driven at the
   module's interface and through its ops, over the real modules (the fixture's). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, STRANGER, WORDS, LAW } from "./fixture.mjs";
import { FILINGS_CHECKS, FILINGS_FOR_MAX, unfilledMarker } from "../../../src/filings/index.mjs";

const OUTSIDER = V("quinn");
const DRAFT_TABLES = ["filing_drafts", "communication_drafts", "filing_approvals", "filing_sendings", "filing_second_approvals"];
const prep = (x, action, over = {}) => x.f.filingPrepare({ action, preparer: V("bo"), viewer: V("bo"), ...over });
const comm = (x, action, over = {}) => x.f.communicationPrepare({ action, text: "A word to the board.", purpose: "a letter",
                                                                  preparer: V("bo"), viewer: V("bo"), ...over });
const approve = (x, filing, over = {}) => x.f.filingApprove({ filing, author: V("bo"), viewer: V("bo"), ...over });
const send = (x, filing, over = {}) => x.f.filingRecordSent({ filing, at: "2026-09-29", account: "handed to the clerk",
                                                              author: V("bo"), viewer: V("bo"), ...over });
const unsent = (x, viewer = V("bo")) => x.f.approvedUnsent({ viewer });

test("R53 approvedUnsent lists each filing draft and communication approved and not recorded sent, on an action the viewer may see, {filing, action, project, approved_by, approved_at}, oldest approval first; a draft not approved, one sent, and the member's own notes are not listed; it writes nothing", async () => {
  const x = world();
  const A = x.action(), B = x.action();
  const d1 = prep(x, A, { text: WORDS });
  const c = comm(x, B);
  const notApproved = prep(x, A, { text: "To the {{counterparty_role}}: a draft nobody approved." });
  const sent = comm(x, A, { text: "Sent already." });
  const self = comm(x, A, { voice: "self", text: "My own notes." });
  for (const r of [d1, c, notApproved, sent, self]) assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  /* approved in another order than prepared: the communication first, by cy */
  x.clock.now = "2026-09-28T02:00:00Z";
  assert.equal((await approve(x, c.id, { author: V("cy"), viewer: V("cy") })).ok, true);
  x.clock.now = "2026-09-28T03:00:00Z";
  assert.equal((await approve(x, d1.id, { text: d1.text.replace(unfilledMarker("law"), LAW) })).ok, true);
  assert.equal((await approve(x, sent.id)).ok, true);
  assert.equal(send(x, sent.id).ok, true);
  assert.equal((await approve(x, self.id)).reason, "NOT_THE_GROUPS_ACT", "the member's own notes are never approved");
  const before = x.snapshot(DRAFT_TABLES);
  const r = unsent(x);
  assert.equal(r.ok, true);
  assert.deepEqual(r.items, [
    { filing: c.id, action: B, project: x.proj, approved_by: V("cy"), approved_at: "2026-09-28T02:00:00Z" },
    { filing: d1.id, action: A, project: x.proj, approved_by: V("bo"), approved_at: "2026-09-28T03:00:00Z" }]);
  assert.equal(r.truncated, false);
  assert.deepEqual(x.snapshot(DRAFT_TABLES), before, "writes nothing");
  /* recorded sent: it leaves the list */
  assert.equal(send(x, c.id).ok, true);
  assert.deepEqual(unsent(x).items.map((i) => i.filing), [d1.id]);
  /* a machine reader sees every one; the answer carries this module's rows decoration nowhere (no refusal) */
  assert.deepEqual(x.f.approvedUnsent({ viewer: MACHINE }).items.map((i) => i.filing), [d1.id]);
});

test("R53 an action the viewer may not see, or a draft drawing on a project it may not see (K316), is left out and named nowhere; a reader who sees it gets it; no viewer, none", async () => {
  const x = world();
  const A = x.action();
  const d = prep(x, A, { text: "To the {{counterparty_role}}: a letter." });
  assert.equal((await approve(x, d.id)).ok, true);
  assert.deepEqual(unsent(x, V("cy")).items.map((i) => i.filing), [d.id], "control: a member of the project");
  for (const viewer of [STRANGER, OUTSIDER, null]) {
    const r = x.f.approvedUnsent({ viewer });
    assert.deepEqual([r.ok, r.items, r.truncated], [true, [], false], String(viewer));
    for (const s of [d.id, A, x.proj]) assert.equal(JSON.stringify(r).includes(s), false, `${viewer}: names ${s}`);
  }
  /* the outsider may see the action itself, but not the project its draft draws on */
  assert.equal(x.actions.actionRead({ id: A, viewer: OUTSIDER }).ok, true);
  /* an action resting on no determination draws on no project: listed for the outsider too, its project the action's
     (none) */
  const N = x.action({ legs: [] });
  const own = prep(x, N, { text: "Outsider's letter.", preparer: OUTSIDER, viewer: OUTSIDER });
  assert.equal((await approve(x, own.id, { author: OUTSIDER, viewer: OUTSIDER })).ok, true);
  assert.deepEqual(unsent(x, OUTSIDER).items.map((i) => [i.filing, i.project]), [[own.id, null]]);
});

test("R53 at most 200, oldest first, with truncated when more are held", async () => {
  const x = world();
  const A = x.action();
  const ids = [];
  for (let i = 0; i <= FILINGS_FOR_MAX; i++) {
    const c = comm(x, A, { text: `Letter ${i}.` });
    x.clock.now = `2026-09-28T${String(2 + Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:00Z`;
    assert.equal((await approve(x, c.id)).ok, true);
    ids.push(c.id);
  }
  const r = unsent(x);
  assert.equal(FILINGS_FOR_MAX, 200);
  assert.deepEqual([r.items.length, r.truncated], [FILINGS_FOR_MAX, true]);
  assert.deepEqual(r.items.map((i) => i.filing), ids.slice(0, FILINGS_FOR_MAX), "the oldest approvals");
  assert.equal(send(x, ids[0]).ok, true);
  const after = unsent(x);
  assert.deepEqual([after.items.length, after.truncated, after.items.at(-1).filing], [FILINGS_FOR_MAX, false, ids.at(-1)],
                   "control: exactly 200 held, none truncated");
});

test("R55 filingPrepare takes fills, the member's own values for blanks the template or the member's words name: each filled and labelled the member's (its source the preparer's word, never a record id), in place of the record's value or of an [UNFILLED] marker; a draft so filled is approved as it stands", async () => {
  const x = world();
  const A = x.action();
  /* the member's words: law is a blank the record cannot fill for a bylaw complaint */
  const d = prep(x, A, { text: WORDS, fills: { law: LAW } });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.equal(d.text, `To the Selectboard: the adoption recorded as ${x.ACT_EVENT} does not conform to P.E.B.L. § 12; MCBC 2025-3, under ${LAW}.`);
  assert.deepEqual(d.unfilled, []);
  const law = d.blanks.find((b) => b.name === "law");
  assert.deepEqual([law.value, law.source, law.label.kind, law.label.by, law.label.machine_work], [LAW, `fills:${V("bo")}`, "member_fill", V("bo"), false]);
  assert.match(law.label.says, /not read from the record/);
  for (const b of d.blanks.filter((y) => y.name !== "law")) assert.equal("label" in b, false, `${b.name}: the record's, unlabelled`);
  assert.deepEqual(JSON.parse(x.row(`SELECT blanks FROM filing_drafts WHERE filing_id=?`, d.id).blanks), d.blanks, "stored with the draft");
  assert.equal((await approve(x, d.id)).ok, true, "no blank left: approved as it stands");
  /* a member's value in place of the record's */
  const r = prep(x, A, { text: WORDS, fills: { counterparty_role: "Chair of the Selectboard", law: LAW } });
  assert.ok(r.text.startsWith("To the Chair of the Selectboard: "));
  assert.equal(r.blanks.find((b) => b.name === "counterparty_role").source, `fills:${V("bo")}`);
  /* the profile's template: its blanks only */
  const t = prep(x, A, { fills: { standards: "the bylaw's vote requirement" } });
  assert.equal(t.ok, true, JSON.stringify(t).slice(0, 300));
  assert.equal(t.text, `To the Selectboard: the adoption recorded as ${x.ACT_EVENT} does not conform to the bylaw's vote requirement.`);
  /* a machine preparer's values are labelled as machine work */
  const m = prep(x, A, { text: WORDS, fills: { law: LAW }, preparer: MACHINE, viewer: MACHINE });
  assert.equal(m.blanks.find((b) => b.name === "law").label.machine_work, true);
  /* negative control: without fills, the record alone, the marker left */
  assert.deepEqual(prep(x, A, { text: WORDS }).unfilled.map((u) => u.name), ["law"]);
  assert.deepEqual(prep(x, A, { text: WORDS, fills: {} }).unfilled.map((u) => u.name), ["law"], "an empty map fills nothing");
  /* through the op: fills from the body */
  const o = x.op("filingprepare", { author: V("bo"), viewer: V("bo") }, { action: A, text: WORDS, fills: { law: LAW } });
  assert.deepEqual([o.ok, o.unfilled], [true, []]);
});

test("R55 FILL_UNKNOWN_BLANK (C-115.58): a fill naming a blank the text does not name, or fills that are no map of names, is refused naming it, with nothing written; a value that is not text TEXT_UNWRITABLE naming its blank; asked after R1's and R28's refusals and before the marks; negative controls", async () => {
  const x = world();
  const A = x.action();
  const count = () => x.count("filing_drafts") + x.count("communication_drafts");
  const n = count();
  for (const [fills, blank] of [[{ nope: "x" }, "nope"], [{ act_date: "2 March" }, "act_date"], [{ law: LAW, period: "a year" }, "period"]]) {
    const r = prep(x, A, { text: WORDS, fills });
    assert.deepEqual([r.reason, r.blank, r.check, r.translation], ["FILL_UNKNOWN_BLANK", blank, "C-115.58", FILINGS_CHECKS.FILL_UNKNOWN_BLANK.translation],
                     JSON.stringify(fills));
    assert.deepEqual(r.blanks, ["counterparty_role", "act", "standards", "law"], "the blanks the text names");
  }
  for (const fills of ["law", ["law"], 7]) {
    const r = prep(x, A, { text: WORDS, fills });
    assert.deepEqual([r.reason, r.blank], ["FILL_UNKNOWN_BLANK", null], JSON.stringify(fills));
  }
  assert.equal(prep(x, A, { fills: { law: LAW } }).reason, "FILL_UNKNOWN_BLANK", "the profile's template names no law");
  for (const v of ["", "   ", 42, null, "\uD800", "x".repeat(65537)]) {
    const r = prep(x, A, { text: WORDS, fills: { law: v } });
    assert.deepEqual([r.reason, r.blank], ["TEXT_UNWRITABLE", "law"], JSON.stringify(v).slice(0, 12));
  }
  assert.equal(count(), n, "nothing written on a refusal");
  /* the order: after R1's and R28's, before the marks */
  assert.equal(prep(x, A, { preparer: "", fills: { nope: "x" } }).reason, "FILING_NO_PREPARER");
  assert.equal(prep(x, x.action({ kind: "commitment_claim" }), { text: WORDS, fills: { nope: "x" } }).reason, "TIER3_COUNSEL_PACKET");
  assert.equal(prep(x, A, { text: WORDS, template: { id: "TPL-test-bylaw-complaint" }, fills: { nope: "x" } }).reason, "TEMPLATE_AND_TEXT");
  assert.equal(prep(x, A, { text: "{{nope}}", fills: { nope: "x" } }).reason, "TEMPLATE_BLANK_UNKNOWN", "the words are judged first");
  assert.equal(prep(x, A, { text: WORDS, fills: { nope: "x" }, voice: "loud" }).reason, "FILL_UNKNOWN_BLANK", "before the marks");
  assert.equal(prep(x, A, { text: WORDS, fills: { law: LAW }, voice: "loud" }).reason, "FILING_MARK_REFUSED", "control: good fills, the marks asked");
});

test("R55 communicationPrepare takes fills for the blanks the member's words name: each filled and labelled the member's, a blank no fill names left as written (a communication fills nothing from the record, R23); one the words do not name, or any for a text assembled from the record, FILL_UNKNOWN_BLANK", async () => {
  const x = world();
  const A = x.action();
  const text = "Please send the {{form}} records for {{period}}, under {{law}}. Cost limit: {{cost_limit}}.";
  const c = comm(x, A, { text, fills: { period: "January to March 2026", form: "electronic", cost_limit: "50 dollars" } });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.equal(c.text, "Please send the electronic records for January to March 2026, under {{law}}. Cost limit: 50 dollars.");
  assert.deepEqual(c.blanks.map((b) => [b.name, b.value, b.source, b.label.kind]),
                   [["form", "electronic", `fills:${V("bo")}`, "member_fill"], ["period", "January to March 2026", `fills:${V("bo")}`, "member_fill"],
                    ["cost_limit", "50 dollars", `fills:${V("bo")}`, "member_fill"]]);
  assert.deepEqual(JSON.parse(x.row(`SELECT marks FROM communication_drafts WHERE filing_id=?`, c.id).marks).blanks, c.blanks, "stored with it");
  assert.equal((await approve(x, c.id)).ok, true);
  /* refused */
  const n = x.count("communication_drafts");
  const bad = comm(x, A, { text, fills: { nope: "x" } });
  assert.deepEqual([bad.reason, bad.blank, bad.check], ["FILL_UNKNOWN_BLANK", "nope", "C-115.58"]);
  const assembled = x.f.communicationPrepare({ action: A, purpose: "document_infraction", audience: "members", fills: { period: "x" },
                                               preparer: V("bo"), viewer: V("bo") });
  assert.deepEqual([assembled.reason, assembled.blank], ["FILL_UNKNOWN_BLANK", "period"], "assembled from the record: no blank to fill");
  assert.deepEqual([comm(x, A, { text, fills: { period: 3 } }).reason], ["TEXT_UNWRITABLE"]);
  assert.equal(x.count("communication_drafts"), n, "nothing written");
  /* negative controls: no fills, the words as written; through the op */
  assert.equal(comm(x, A, { text }).text, text);
  assert.equal("blanks" in comm(x, A, { text }), false);
  const o = x.op("communicationprepare", { author: V("bo"), viewer: V("bo") }, { action: A, text, purpose: "a request", fills: { law: LAW } });
  assert.deepEqual([o.ok, o.text.includes(`under ${LAW}.`)], [true, true]);
});

test("R54 filingRecordSent takes the venue's own reference for the sending (one line of 1 to 100 characters), kept as given, answered and listed by filingsFor's sending (R13); none given reads null; the action's state and clock untouched", async () => {
  const x = world();
  const A = x.action();
  const c = comm(x, A);
  assert.equal((await approve(x, c.id)).ok, true);
  const r = send(x, c.id, { reference: "26-11902" });
  assert.deepEqual([r.ok, r.reference, r.ord], [true, "26-11902", 0], JSON.stringify(r).slice(0, 300));
  assert.equal(x.f.filingsFor({ action: A, viewer: V("bo") }).drafts[0].sending.reference, "26-11902");
  assert.deepEqual(x.read(A).correspondence.map((e) => [e.direction, e.account]), [["sent", "handed to the clerk"]], "one sent entry, as R7 writes it");
  /* 100 characters, counted in code points, is allowed; through the op */
  const c2 = comm(x, A, { text: "Second." });
  await approve(x, c2.id);
  const wide = "\u{1F4DC}".repeat(100);
  assert.equal(send(x, c2.id, { reference: wide }).reference, wide);
  const c3 = comm(x, A, { text: "Third." });
  await approve(x, c3.id);
  const o = x.op("filingsent", { author: V("bo"), viewer: V("bo") }, { filing: c3.id, at: "2026-09-29", account: "by the portal", reference: "REQ 7" });
  assert.deepEqual([o.ok, o.reference], [true, "REQ 7"]);
  /* none given: null */
  const c4 = comm(x, A, { text: "Fourth." });
  await approve(x, c4.id);
  assert.equal(send(x, c4.id).reference, null);
  const listed = Object.fromEntries(x.f.filingsFor({ action: A, viewer: V("bo") }).drafts.map((d) => [d.filing, d.sending.reference]));
  assert.deepEqual(listed, { [c.id]: "26-11902", [c2.id]: wide, [c3.id]: "REQ 7", [c4.id]: null });
});

test("R54 SENT_REFERENCE_MALFORMED (C-115.57): a reference empty, blank, not a string, over 100 characters, more than one line or not UTF-8 text is refused with nothing recorded (no entry on the action, no sending); asked after R7's own refusals and second approval, before actions'; negative control", async () => {
  const x = world();
  const A = x.action();
  const c = comm(x, A);
  assert.equal(send(x, c.id, { reference: "" }).reason, "NOT_APPROVED", "R7's refusals first");
  await approve(x, c.id);
  for (const reference of ["", "   ", 42, ["26-1"], "x".repeat(101), "\u{1F4DC}".repeat(101), "26-1\n27-2", "26-1\r", "a b", "\uD800"]) {
    const r = send(x, c.id, { reference });
    assert.deepEqual([r.reason, r.check, r.translation], ["SENT_REFERENCE_MALFORMED", "C-115.57", FILINGS_CHECKS.SENT_REFERENCE_MALFORMED.translation],
                     JSON.stringify(reference).slice(0, 20));
  }
  assert.equal(send(x, c.id, { reference: "", at: "not a date" }).reason, "SENT_REFERENCE_MALFORMED", "before actions' BAD_DATE");
  assert.deepEqual([x.count("filing_sendings"), x.read(A).correspondence], [0, []], "nothing recorded");
  assert.equal(send(x, c.id, { reference: "x".repeat(100) }).ok, true, "negative control: 100 characters");
  assert.equal(send(x, c.id, { reference: "!" }).reason, "ALREADY_SENT", "asked before the reference");
});

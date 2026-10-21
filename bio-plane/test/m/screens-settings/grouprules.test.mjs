/* Settings › Places and offices › Your team's own rules at the module's interface (R61; T51; N858 D8; DEC-340, U366; K3935;
   `local-facts` R10–R13, R18, R19): a rule drafted by one member waits until a different member confirms it; a tier 2, 3 or unknown
   confirmation states the confirmer's qualification before the act is sent; a rule in force is withdrawn with a reason. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { ADMIN, MEMBER, GROUP_RULES, DOC_SHA, VOUCHED_DOC, env, refuse, grouprulesTable } from "./fixtures.mjs";

const item = (o, rule) => all(o.tree, (e) => e.tag === "li" && e.attrs["data-rule"] === rule)[0];
const btn = (n, op) => acts(n).filter((b) => b.attrs["data-act"] === op);

test("R61 reads the rules and the roster; Waiting for a second member lists each drafted rule: what it is for, who drafted it and when, its source as a reference opening the document, its trigger, citation and the day it takes effect", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable() });
  assert.ok(a.p.requests.some((r) => r.op === "grouprules") && a.p.requests.some((r) => r.op === "memberlist"));
  has(a, "screen.grouprules.waiting"); has(a, "screen.grouprules.inforce"); has(a, "screen.grouprules.draft");
  for (const k of ["screen.grouprules.sub1", "screen.grouprules.sub2", "screen.grouprules.note", "screen.grouprules.note2", "screen.grouprules.inprofile", "screen.grouprules.inprofile2"]) has(a, k);
  const one = item(a, "GR-0001"), t = textOf(one);
  assert.ok(t.includes("Parks Commission: written comments close five days before the meeting"), "the rule's own words, as data");
  assert.ok(t.includes(said("screen.grouprules.deadline.for", { kind: said("screen.start-send.kind.request_for_comment") })), "what it is for");
  assert.ok(t.includes(said("screen.grouprules.drafted", { member: "ana", date: day("2026-10-09T00:00:00Z") })));
  assert.ok(t.includes(said("screen.grouprules.row.trigger", { trigger: said("screen.grouprules.trigger.start.hearing") })));
  assert.ok(t.includes(said("screen.grouprules.row.cite", { citation: "Parks Commission Rule 4(b)" })));
  assert.ok(t.includes(said("screen.grouprules.row.eff", { date: day("2026-07-01") })));
  // its source is the document's reference (a link where the page holds the document screen, a card where this module's own page does not), labelled by the capture
  const src = all(one, (e) => (e.tag === "a" || /\bcs-card\b/.test(e.attrs.class || "")) && textOf(e) === "aaaaaaaa")[0];
  assert.ok(src, "its source is a reference to the document");
  // a legal fact for a kind names it, with its trigger and what it requires
  const fact = textOf(item(a, "GR-0003"));
  assert.ok(fact.includes(said("screen.grouprules.fact.for", { kind: said("screen.start-send.kind.public_comment") })));
  assert.ok(fact.includes(said("screen.grouprules.row.requires", { requires: "Speakers register by noon on the meeting day" })));
  assert.ok(fact.includes(said("screen.grouprules.row.trigger", { trigger: said("screen.grouprules.trigger.fact.pending_measure_or_candidate") })));
  // a withdrawn rule is not drawn
  assert.equal(item(a, "GR-0006"), undefined);
});

test("R61 a rule the viewer drafted is told so and has no confirm act; every other waiting rule has one (R61: Drafted by you)", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable() });
  assert.ok(textOf(item(a, "GR-0003")).includes(said("screen.grouprules.drafted.you", { date: day("2026-10-11T00:00:00Z") })));
  assert.ok(textOf(item(a, "GR-0003")).includes(said("screen.grouprules.self")));
  assert.equal(btn(item(a, "GR-0003"), "ruleconfirm").length, 0, "no confirm for one's own rule");
  for (const id of ["GR-0001", "GR-0002", "GR-0004"]) assert.equal(btn(item(a, id), "ruleconfirm").length, 1, id);
  // the section that says what confirming asks, said once
  has(a, "screen.grouprules.confirm.heading"); has(a, "screen.grouprules.confirm.says"); has(a, "screen.grouprules.confirm.qual");
  assert.equal(a.text.split(said("screen.grouprules.confirm.says")).length, 2);
});

test("R61 Confirm this rule: a tier 1 rule asks no statement; a tier 2, 3 or unknown tier asks the confirmer's own, required before the act is sent, kept with the confirmation alone", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable() });
  // tier 1: no field, the rule alone is sent
  assert.equal(all(item(a, "GR-0001"), (e) => e.tag === "input").length, 0, "no statement asked");
  const why = "I read the source and the rule matches it";
  assert.deepEqual((await a.press("ruleconfirm", { data: { rule: "GR-0001" }, reason: why })).sent[0].body, { rule: "GR-0001", reason: why });
  // tier 2: the field, with its help and what becomes of it, and no request without it
  const t2 = item(a, "GR-0002");
  assert.ok(textOf(t2).includes(said("screen.grouprules.qual.label")) && textOf(t2).includes(said("screen.grouprules.confirm.kept")));
  assert.ok(textOf(t2).includes(said("screen.grouprules.qual.help")));
  const none = await a.press("ruleconfirm", { data: { rule: "GR-0002" }, values: { "gr-q-GR-0002": "   " }, reason: why });
  assert.deepEqual(none.sent, [], "not sent without a statement");
  assert.equal(a.refused.key, "refusal.RULE_NEEDS_QUALIFICATION");
  assert.deepEqual((await a.press("ruleconfirm", { data: { rule: "GR-0002" }, values: { "gr-q-GR-0002": " I am a paralegal for tenants. " }, reason: why })).sent[0].body, { rule: "GR-0002", statement: "I am a paralegal for tenants.", reason: why });
  // a kind with no tier is asked too
  assert.equal(all(item(a, "GR-0004"), (e) => e.tag === "input").length, 1);
  assert.deepEqual((await a.press("ruleconfirm", { data: { rule: "GR-0004" }, values: { "gr-q-GR-0004": "x".repeat(501) }, reason: why })).sent, [], "no more than 500 characters");
  assert.ok(a.p.requests.filter((r) => r.op === "grouprules").length >= 2, "the rules are read again after an act (R8)");
});

test("R61 Rules in force: each confirmed rule with who drafted and confirmed it and that it applies, and Withdraw this rule, with a reason (rulewithdraw); a rule not yet in effect is not said to apply", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable() });
  const t = textOf(item(a, "GR-0005"));
  assert.ok(t.includes(said("screen.grouprules.confirmed", { member: "lu", date: day("2026-09-24T00:00:00Z") })));
  assert.ok(t.includes(said("screen.grouprules.drafted", { member: "ana", date: day("2026-09-22T00:00:00Z") })));
  assert.ok(t.includes(said("screen.grouprules.applies")));
  has(a, "screen.grouprules.withdrawn");
  const w = btn(item(a, "GR-0005"), "rulewithdraw");
  assert.equal(w.length, 1);
  assert.equal(textOf(w[0]).startsWith(said("act.rulewithdraw.label.grouprules")), true);
  const r = await a.press("rulewithdraw", { data: { rule: "GR-0005" }, reason: "it was repealed" });
  assert.equal(r.sent[0].body.rule, "GR-0005");
  // control: a confirmed rule that takes effect later is not said to apply yet
  const future = GROUP_RULES.map((x) => (x.rule === "GR-0005" ? { ...x, entry: { ...x.entry, effective_from: "2999-01-01" } } : x));
  const f = await open("grouprules", { me: MEMBER, table: grouprulesTable({ grouprules: env({ ok: true, rules: future, count: future.length }) }) });
  assert.ok(!textOf(item(f, "GR-0005")).includes(said("screen.grouprules.applies")));
});

test("R61 control: the assistant's note is drawn; a failed read is drawn failed, never as no rules; a read with no rules draws no section", async () => {
  const a = await open("grouprules", { me: ADMIN, table: grouprulesTable() });
  has(a, "screen.grouprules.machine"); has(a, "screen.grouprules.machine2");
  const failed = await open("grouprules", { me: MEMBER, table: grouprulesTable({ grouprules: "none" }) });
  assert.equal(all(failed.tree, (e) => e.attrs["data-state"] === "failed").length, 1);
  lacks(failed, "screen.grouprules.waiting");
  const empty = await open("grouprules", { me: MEMBER, table: grouprulesTable({ grouprules: env({ ok: true, rules: [], count: 0 }) }) });
  lacks(empty, "screen.grouprules.waiting"); lacks(empty, "screen.grouprules.confirm.heading");
  assert.deepEqual([...new Set(acts(empty.tree).map((b) => b.attrs["data-act"]))], ["ruledraft"], "nothing to confirm or withdraw: only the draft form's act");
});

/* R61 "Draft the rule" (T51; DEC-357, U386): one name, the fields of a deadline or a legal fact, the document and the passage copied, found in the capture's text */
const FORM = { "gr-kind": "deadline", "gr-name": "Parks Commission: comment cutoff", "gr-amount": "5", "gr-cite": "Parks Commission Rule 4(b)", "gr-eff": "2026-07-01", "gr-why": "We comment to it often", "gr-doc": DOC_SHA, "gr-pass": "Comments close five days before the meeting." };
const PICK = { "gr-app": "request_for_comment", "gr-units": "days", "gr-count": "business", "gr-start": "hearing", "gr-dir": "backward", "gr-owed": "body", "gr-due": "cob" };

test("R61 the draft form draws the design's fields: the kinds of action by their own names (claim first), the choices by their words, the document among the captures held, and writing help only while the assistant is reachable and only under What it says", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable(), reachable: true });
  for (const k of ["screen.grouprules.kind.label", "screen.grouprules.name.label", "screen.grouprules.deadline.legend", "screen.grouprules.amount.label", "screen.grouprules.units.label", "screen.grouprules.start.label", "screen.grouprules.dir.label", "screen.grouprules.owed.label", "screen.grouprules.due.label", "screen.grouprules.fact.summary", "screen.grouprules.statement.label", "screen.grouprules.bears.legend", "screen.grouprules.cite.label", "screen.grouprules.eff.label", "screen.grouprules.src.legend", "screen.grouprules.doc.label", "screen.grouprules.pass.label", "screen.grouprules.why.label"]) has(a, k);
  const kinds = all(all(a.tree, (e) => e.attrs.id === "gr-app")[0], (e) => e.tag === "option").map((o) => [o.attrs.value, textOf(o)]);
  assert.deepEqual(kinds, [["claim", said("screen.grouprules.app.claim")], ["request_for_comment", said("screen.action.kind.request_for_comment")], ["public_comment", said("screen.action.kind.public_comment")], ["party_participation", said("screen.action.kind.party_participation")]]);
  assert.ok(a.p.requests.some((r) => r.op === "rulefields" && r.query.section === "deadlines"));
  const docs = all(all(a.tree, (e) => e.attrs.id === "gr-doc")[0], (e) => e.tag === "option").map((o) => o.attrs.value);
  assert.deepEqual(docs, [DOC_SHA, "e".repeat(64), VOUCHED_DOC.capture.sha256], "the held documents and, R70, the vouched one");
  // writing help: only under What it says, only while the assistant is reachable
  assert.equal(btn(a.tree, "writinghelp").length, 1);
  assert.ok(a.html.indexOf('data-act="writinghelp"') > a.html.indexOf('id="gr-statement"') && a.html.indexOf('data-act="writinghelp"') < a.html.indexOf('id="gr-bears"'));
  const off = await open("grouprules", { me: MEMBER, table: grouprulesTable(), reachable: false });
  assert.equal(btn(off.tree, "writinghelp").length, 0);
  // the words the redrawn form retired are no longer words
  for (const k of ["screen.grouprules.text.label", "screen.grouprules.link.label", "screen.grouprules.trigger.label"]) assert.ok(!hasWord(k), k);
});

test("R61 ruledraft for a deadline sends the section, the entry built from the fields (the stored rule derived from the one name), the source with the passage's place, and the reason", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable() });
  const r = await a.press("ruledraft", { values: FORM, choose: PICK });
  assert.deepEqual(r.sent.find((x) => x.op === "ruledraft").body, { section: "deadlines",
    entry: { rule: "parks_commission_comment_cutoff", applies_to: "request_for_comment", units: "days", amount: 5, starts: "hearing", direction: "backward", count: "business", owed_by: "body", due_at: "close_of_business", citation: "Parks Commission Rule 4(b)", effective_from: "2026-07-01" },
    source: { captureSha: DOC_SHA, extent: { kind: "pdf-page", page: 2 } }, reason: "We comment to it often" });
  assert.ok(r.sent.some((x) => x.op === "reading" && x.query.sha256 === DOC_SHA), "the capture's text is read to find the passage");
  assert.ok(a.p.requests.filter((x) => x.op === "grouprules").length >= 2, "the rules are read again");
  // a set time is typed on the 12-hour clock and sent as HH:MM; units other than days send no count; the office left unsaid sends no owed_by
  const t = await a.press("ruledraft", { values: { ...FORM, "gr-time": "5:30 PM" }, choose: { ...PICK, "gr-units": "hours", "gr-due": "time", "gr-owed": "none" } });
  const e = t.sent.find((x) => x.op === "ruledraft").body.entry;
  assert.deepEqual([e.units, e.due_at, "count" in e, "owed_by" in e], ["hours", "17:30", false, false]);
  assert.equal(await a.press("ruledraft", { values: { ...FORM, "gr-time": "13:00 pm" }, choose: { ...PICK, "gr-due": "time" } }).then((x) => x.sent.length), 0, "a time that is none is refused in place");
});

test("R61 ruledraft for a legal fact sends the key derived from the name, the trigger, what it says and the kinds ticked; none ticked leaves applies_to out", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable() });
  const values = { ...FORM, "gr-kind": "fact", "gr-name": "Speakers register by noon", "gr-statement": "Speakers register by noon on the meeting day", "gr-pass": "Speakers register by noon." };
  const r = await a.press("ruledraft", { values: { ...values, "gr-bears": undefined }, choose: { "gr-shown": "pending_measure_or_candidate" } });
  const b = r.sent.find((x) => x.op === "ruledraft").body;
  assert.equal(b.section, "legal_facts");
  assert.deepEqual(b.entry, { key: "speakers_register_by_noon", trigger: "pending_measure_or_candidate", statement: "Speakers register by noon on the meeting day", citation: "Parks Commission Rule 4(b)", effective_from: "2026-07-01" });
  assert.deepEqual(b.source.extent, { kind: "pdf-page", page: 3 });
});

test("R61 a passage that is not in the document as written sends nothing and says so; a rule with no source held, no name or no whole amount sends nothing", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable() });
  const miss = await a.press("ruledraft", { values: { ...FORM, "gr-pass": "Words the document does not hold" }, choose: PICK });
  assert.deepEqual(miss.sent.filter((x) => x.op === "ruledraft"), []);
  assert.equal(a.refused.key, "screen.grouprules.pass.notfound1");
  has(a, "screen.grouprules.pass.notfound2");
  for (const bad of [{ "gr-name": "  " }, { "gr-amount": "five" }, { "gr-amount": "0" }]) assert.deepEqual((await a.press("ruledraft", { values: { ...FORM, ...bad }, choose: PICK })).sent.filter((x) => x.op === "ruledraft"), [], JSON.stringify(bad));
  assert.deepEqual((await a.press("ruledraft", { values: { ...FORM, "gr-src-1": true }, choose: PICK })).sent.filter((x) => x.op === "ruledraft"), [], "the source first");
  assert.equal(a.refused.key, "screen.grouprules.src.refuse");
});

test("R61 writinghelp under What it says fills the draft into that field, labelled the assistant's, kept only by the member's own ruledraft; it asks for no draft of an empty field", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable({ writinghelp: () => env({ ok: true, text: "Speakers register by noon.", label: { kind: "machine", asked_by: "member:dev" }, withheld: [], note: "" }) }), reachable: true });
  const none = await a.press("writinghelp", { values: { "gr-statement": "" } });
  assert.deepEqual(none.sent, []);
  const r = await a.press("writinghelp", { values: { "gr-statement": "speakers sign up by noon" }, reason: "help me say it" });
  assert.deepEqual(r.sent.find((x) => x.op === "writinghelp").body.op, "ruledraft");
  assert.equal(r.sent.find((x) => x.op === "writinghelp").body.field, "statement");
  assert.equal(a.b.doc.getElementById("gr-statement").value, "Speakers register by noon.");
  has(a, "screen.group-identity.draft.label", { handle: "dev" });
});

/* ---- T51 FR-25: L2 (R70) ---- */

test("R70 the 'Which document' picker is read with state held_and_vouched: with one held and one vouched document it offers both, and a vouched one is chosen and drafted from; asked without that state it would list only the held (control)", async () => {
  const held = { title: "Held rules", capture: { sha256: "1".repeat(64) } }, vouched = { title: "Vouched rules", capture: { sha256: "2".repeat(64) } };
  // the owner's answer by the state asked (capture R77, R88): the documents at collected, and with held_and_vouched those a member vouched for too
  const table = grouprulesTable({ heldcaptures: (q) => env({ ok: true, held: q.state === "held_and_vouched" ? [held, vouched] : [held] }) });
  const a = await open("grouprules", { me: MEMBER, table });
  const asked = a.p.requests.filter((r) => r.op === "heldcaptures");
  assert.equal(asked.length, 1);
  assert.equal(asked[0].query.state, "held_and_vouched");
  const docs = all(all(a.tree, (e) => e.attrs.id === "gr-doc")[0], (e) => e.tag === "option").map((o) => [o.attrs.value, textOf(o)]);
  assert.deepEqual(docs, [[held.capture.sha256, held.title], [vouched.capture.sha256, vouched.title]]);
  // a vouched document can be drafted from: its sha is the one the draft names
  const r = await a.press("ruledraft", { values: { ...FORM, "gr-doc": vouched.capture.sha256 }, choose: PICK });
  const draft = r.sent.find((x) => x.op === "ruledraft");
  assert.equal(draft.body.source.captureSha, vouched.capture.sha256);
  // control: an owner that lists only the held documents (the state not asked) would leave the vouched one out
  const only = await open("grouprules", { me: MEMBER, table: grouprulesTable({ heldcaptures: (q) => env({ ok: true, held: q.state === "held_and_vouched" ? [held] : [] }) }) });
  assert.deepEqual(all(all(only.tree, (e) => e.attrs.id === "gr-doc")[0], (e) => e.tag === "option").map((o) => o.attrs.value), [held.capture.sha256]);
});

/* ---- T51 fix round 2: C14, C87, C94 ---- */

test("R70 C14: the picker is read once when the screen opens, by the cheap picker read (fields picker), and no act reads the whole list again; the picker rows are the cheap ones", async () => {
  const held = { bundle_id: "INFO-1", title: "Held rules", project: null, capture: { sha256: "1".repeat(64) }, standing: "collected" }, vouched = { bundle_id: "INFO-2", title: "Vouched rules", project: null, capture: { sha256: "2".repeat(64) }, standing: "verified" };
  // the owner answers by the fields asked (capture R77, R88): the picker rows carry the document, title, project, digest and standing and nothing else
  const table = grouprulesTable({ heldcaptures: (q) => env({ ok: true, held: q.fields === "picker" ? [held, vouched] : [{ ...held, examination: { slow: true } }], state: q.state }) });
  const a = await open("grouprules", { me: MEMBER, table });
  const asked = () => a.p.requests.filter((r) => r.op === "heldcaptures");
  assert.equal(asked().length, 1, "one read of the held documents for the screen");
  assert.deepEqual([asked()[0].query.fields, asked()[0].query.state], ["picker", "held_and_vouched"]);
  assert.deepEqual(all(all(a.tree, (e) => e.attrs.id === "gr-doc")[0], (e) => e.tag === "option").map((o) => [o.attrs.value, textOf(o)]), [["1".repeat(64), "Held rules"], ["2".repeat(64), "Vouched rules"]]);
  // the acts do not read the list again
  await a.press("ruledraft", { values: { ...FORM, "gr-doc": "2".repeat(64) }, choose: PICK });
  await a.press("ruleconfirm", { data: { rule: "GR-0001" }, reason: "I read the source and the rule matches it" });
  assert.equal(asked().length, 1, "still the one read");
});

test("R61 C87: Draft the rule with a required box empty sends nothing and names the box; filled, it sends (control)", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable() });
  const named = (label) => said("shell.field.needed", { field: label });
  const sent = (r) => r.sent.filter((x) => x.op === "ruledraft");
  for (const [box, label] of [["gr-name", "screen.grouprules.name.label"], ["gr-amount", "screen.grouprules.amount.label"], ["gr-cite", "screen.grouprules.cite.label"], ["gr-eff", "screen.grouprules.eff.label"], ["gr-pass", "screen.grouprules.pass.label"], ["gr-why", "screen.grouprules.why.label"]]) {
    const r = await a.press("ruledraft", { values: { ...FORM, [box]: "  " }, choose: PICK });
    assert.deepEqual(sent(r), [], box + " empty sends nothing");
    assert.equal(a.refused && a.refused.text, named(said(label)), box + " is named: " + (a.refused && a.refused.text));
  }
  // a legal fact names what it says
  const f = await a.press("ruledraft", { values: { ...FORM, "gr-kind": "fact", "gr-statement": "" }, choose: { "gr-shown": "pending_measure_or_candidate" } });
  assert.deepEqual(sent(f), []);
  assert.equal(a.refused.text, named(said("screen.grouprules.statement.label")));
  // control: filled sends
  assert.equal(sent(await a.press("ruledraft", { values: FORM, choose: PICK })).length, 1);
});

test("R61 C94: a rule's drafter and confirmer are named by memberName: a member with no handle by the fallback word, a member the roster does not hold by it too, the founder by hers or the unnamed word, never an id; a member with a handle by it (control)", async () => {
  const mk = (n, over) => ({ rule: "GR-01" + n, section: "deadlines", state: "drafted", entry: { rule: "Rule " + n, starts: "hearing", citation: "x", effective_from: "2026-01-01" }, source: { captureSha: "a".repeat(64), extent: "p1" }, reason: "r", applies_to: "request_for_comment", tier: 1, drafter: "ana", drafted_at: "2026-10-09T00:00:00Z", confirmer: null, confirmed_at: null, ...over });
  const rules = [mk("1", { drafter: "mai-k" }), mk("2", { drafter: "ghost-7" }), mk("3", { drafter: "admin" }), mk("4", { state: "confirmed", drafter: "ana", confirmer: "ghost-7", confirmed_at: "2026-10-10T00:00:00Z" })];
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable({ grouprules: env({ ok: true, rules, count: rules.length }) }) });
  const line = (n) => textOf(item(a, "GR-01" + n));
  const date = day("2026-10-09T00:00:00Z");
  assert.ok(line("1").includes(said("screen.grouprules.drafted", { member: said("shell.card.member"), date })), "no handle: the fallback word");
  assert.ok(line("2").includes(said("screen.grouprules.drafted", { member: said("shell.card.member"), date })), "unknown: the fallback word");
  assert.ok(line("3").includes(said("screen.grouprules.drafted", { member: said("member.founder.unnamed"), date })), "the founder with no handle: the unnamed word");
  assert.ok(line("4").includes(said("screen.grouprules.confirmed", { member: said("shell.card.member"), date: day("2026-10-10T00:00:00Z") })));
  assert.ok(line("4").includes(said("screen.grouprules.drafted", { member: "ana", date })), "control: a member with a handle by it");
  for (const id of ["mai-k", "ghost-7"]) assert.ok(!a.text.includes(id), id + " is not drawn");
});

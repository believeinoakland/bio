/* Settings › Places and offices › Your team's own rules at the module's interface (R61; T51; N858 D8; DEC-340, U366; K3935;
   `local-facts` R10–R13, R18, R19): a rule drafted by one member waits until a different member confirms it; a tier 2, 3 or unknown
   confirmation states the confirmer's qualification before the act is sent; a rule in force is withdrawn with a reason. Over the world
   (store-request): the rules are drafted, confirmed and withdrawn by the real acts of members, the documents are held and read by
   the real captures, and what the tests expect is read back from the owners' answers. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { env } from "./fixtures.mjs";
import { team, SEAL, rulesTeam, holdDoc, draftRule, holdKey, vouch, pickerPages, RULES_TEXT } from "./seed-places.mjs";

const item = (o, rule) => all(o.tree, (e) => e.tag === "li" && e.attrs["data-rule"] === rule)[0];
const btn = (n, op) => acts(n).filter((b) => b.attrs["data-act"] === op);
const rulesOf = async (as) => (await as.read("grouprules")).rules;
const kindWord = (id) => (hasWord("screen.start-send.kind." + id) ? said("screen.start-send.kind." + id) : id);

test("R61 reads the rules and the roster; Waiting for a second member lists each drafted rule: what it is for, who drafted it and when, its source as a reference opening the document, its trigger, citation and the day it takes effect", async () => {
  const { w, dev, ana, ids } = await rulesTeam();
  const rules = await rulesOf(dev), by = (id) => rules.find((r) => r.rule === id);
  const a = await open("grouprules", { world: w, as: dev });
  assert.ok(a.p.requests.some((r) => r.op === "grouprules") && a.p.requests.some((r) => r.op === "memberlist"));
  has(a, "screen.grouprules.waiting"); has(a, "screen.grouprules.inforce"); has(a, "screen.grouprules.draft");
  for (const k of ["screen.grouprules.sub1", "screen.grouprules.sub2", "screen.grouprules.note", "screen.grouprules.note2", "screen.grouprules.inprofile", "screen.grouprules.inprofile2"]) has(a, k);
  const r1 = by(ids.tier1), one = item(a, ids.tier1), t = textOf(one);
  assert.ok(t.includes(r1.entry.rule), "the rule's own words, as data");
  assert.ok(t.includes(said("screen.grouprules.deadline.for", { kind: kindWord(r1.applies_to) })), "what it is for");
  assert.ok(t.includes(said("screen.grouprules.drafted", { member: ana.handle, date: day(r1.drafted_at) })));
  assert.ok(t.includes(said("screen.grouprules.row.trigger", { trigger: said("screen.grouprules.trigger.start." + r1.entry.starts) })));
  assert.ok(t.includes(said("screen.grouprules.row.cite", { citation: r1.entry.citation })));
  assert.ok(t.includes(said("screen.grouprules.row.eff", { date: day(r1.entry.effective_from) })));
  // its source is the document's reference (a link where the page holds the document screen, a card where this module's own page does not), labelled by the capture
  const src = all(one, (e) => (e.tag === "a" || /\bcs-card\b/.test(e.attrs.class || "")) && textOf(e) === r1.source.captureSha.slice(0, 8))[0];
  assert.ok(src, "its source is a reference to the document");
  // a legal fact for a kind names it, with its trigger and what it requires
  const f = by(ids.mine), fact = textOf(item(a, ids.mine));
  assert.ok(fact.includes(said("screen.grouprules.fact.for", { kind: kindWord(f.applies_to[0]) })));
  assert.ok(fact.includes(said("screen.grouprules.row.requires", { requires: f.entry.statement })));
  assert.ok(fact.includes(said("screen.grouprules.row.trigger", { trigger: said("screen.grouprules.trigger.fact." + f.entry.trigger) })));
  // a withdrawn rule is not drawn
  assert.equal(by(ids.withdrawn).state, "withdrawn");
  assert.equal(item(a, ids.withdrawn), undefined);
});

test("R61 a rule the viewer drafted is told so and has no confirm act; every other waiting rule has one (R61: Drafted by you)", async () => {
  const { w, dev, ids } = await rulesTeam();
  const mine = (await rulesOf(dev)).find((r) => r.rule === ids.mine);
  const a = await open("grouprules", { world: w, as: dev });
  assert.ok(textOf(item(a, ids.mine)).includes(said("screen.grouprules.drafted.you", { date: day(mine.drafted_at) })));
  assert.ok(textOf(item(a, ids.mine)).includes(said("screen.grouprules.self")));
  assert.equal(btn(item(a, ids.mine), "ruleconfirm").length, 0, "no confirm for one's own rule");
  for (const id of [ids.tier1, ids.tier2, ids.noKind]) assert.equal(btn(item(a, id), "ruleconfirm").length, 1, id);
  // the section that says what confirming asks, said once
  has(a, "screen.grouprules.confirm.heading"); has(a, "screen.grouprules.confirm.says"); has(a, "screen.grouprules.confirm.qual");
  assert.equal(a.text.split(said("screen.grouprules.confirm.says")).length, 2);
});

test("R61 Confirm this rule: a tier 1 rule asks no statement; a tier 2, 3 or unknown tier asks the confirmer's own, required before the act is sent, kept with the confirmation alone", async () => {
  const { w, dev, ids } = await rulesTeam();
  const a = await open("grouprules", { world: w, as: dev });
  const stateOf = async (id) => (await rulesOf(dev)).find((r) => r.rule === id);
  // tier 1: no field, the rule alone is sent
  assert.equal(all(item(a, ids.tier1), (e) => e.tag === "input").length, 0, "no statement asked");
  const why = "I read the source and the rule matches it";
  assert.deepEqual((await a.press("ruleconfirm", { data: { rule: ids.tier1 }, reason: why })).sent[0].body, { rule: ids.tier1, reason: why });
  assert.equal((await stateOf(ids.tier1)).state, "confirmed", "the world holds it confirmed");
  // tier 2: the field, with its help and what becomes of it, and no request without it
  const t2 = item(a, ids.tier2);
  assert.ok(textOf(t2).includes(said("screen.grouprules.qual.label")) && textOf(t2).includes(said("screen.grouprules.confirm.kept")));
  assert.ok(textOf(t2).includes(said("screen.grouprules.qual.help")));
  const none = await a.press("ruleconfirm", { data: { rule: ids.tier2 }, values: { ["gr-q-" + ids.tier2]: "   " }, reason: why });
  assert.deepEqual(none.sent, [], "not sent without a statement");
  assert.equal(a.refused.key, "refusal.RULE_NEEDS_QUALIFICATION");
  assert.equal((await stateOf(ids.tier2)).state, "drafted");
  assert.deepEqual((await a.press("ruleconfirm", { data: { rule: ids.tier2 }, values: { ["gr-q-" + ids.tier2]: " I am a paralegal for tenants. " }, reason: why })).sent[0].body, { rule: ids.tier2, statement: "I am a paralegal for tenants.", reason: why });
  const second = await stateOf(ids.tier2);
  assert.equal(second.state, "confirmed");
  assert.equal(second.statement, "I am a paralegal for tenants.", "kept with the confirmation");
  // a kind with no tier is asked too
  assert.equal(all(item(a, ids.noKind), (e) => e.tag === "input").length, 1);
  assert.deepEqual((await a.press("ruleconfirm", { data: { rule: ids.noKind }, values: { ["gr-q-" + ids.noKind]: "x".repeat(501) }, reason: why })).sent, [], "no more than 500 characters");
  assert.ok(a.p.requests.filter((r) => r.op === "grouprules").length >= 2, "the rules are read again after an act (R8)");
});

test("R61 Rules in force: each confirmed rule with who drafted and confirmed it and that it applies, and Withdraw this rule, with a reason (rulewithdraw); a rule not yet in effect is not said to apply", async () => {
  const { w, dev, ana, lu, doc, ids } = await rulesTeam();
  const r = (await rulesOf(dev)).find((x) => x.rule === ids.inForce);
  const a = await open("grouprules", { world: w, as: dev });
  const t = textOf(item(a, ids.inForce));
  assert.ok(t.includes(said("screen.grouprules.confirmed", { member: lu.handle, date: day(r.confirmed_at) })));
  assert.ok(t.includes(said("screen.grouprules.drafted", { member: ana.handle, date: day(r.drafted_at) })));
  assert.ok(t.includes(said("screen.grouprules.applies")));
  has(a, "screen.grouprules.withdrawn");
  const wd = btn(item(a, ids.inForce), "rulewithdraw");
  assert.equal(wd.length, 1);
  assert.equal(textOf(wd[0]).startsWith(said("act.rulewithdraw.label.grouprules")), true);
  const sent = await a.press("rulewithdraw", { data: { rule: ids.inForce }, reason: "it was repealed" });
  assert.equal(sent.sent[0].body.rule, ids.inForce);
  const after = (await rulesOf(dev)).find((x) => x.rule === ids.inForce);
  assert.equal(after.state, "withdrawn");
  assert.equal(after.withdrawn.reason, "it was repealed", "the world keeps the reason");
  // control: a confirmed rule that takes effect later is not said to apply yet
  const later = (await draftRule(ana, doc, 1, "legal_facts", { key: "later_rule", trigger: "recording", statement: "A rule for later", citation: "x", effective_from: "2999-01-01" })).rule;
  await lu.act("ruleconfirm", { body: { rule: later, statement: "I am a clerk." } });
  const f = await open("grouprules", { world: w, as: dev });
  assert.equal((await rulesOf(dev)).find((x) => x.rule === later).state, "confirmed");
  assert.ok(!textOf(item(f, later)).includes(said("screen.grouprules.applies")));
});

test("R61 control: the assistant's note is drawn; a failed read is drawn failed, never as no rules; a read with no rules draws no section", async () => {
  const { w, founder, dev } = await team();
  const a = await open("grouprules", { world: w, as: founder });
  has(a, "screen.grouprules.machine"); has(a, "screen.grouprules.machine2");
  const failed = await open("grouprules", { world: w, as: dev, table: { grouprules: "none" } });
  assert.equal(all(failed.tree, (e) => e.attrs["data-state"] === "failed").length, 1);
  lacks(failed, "screen.grouprules.waiting");
  assert.equal((await dev.read("grouprules")).count, 0, "the team holds no rule");
  const empty = await open("grouprules", { world: w, as: dev });
  lacks(empty, "screen.grouprules.waiting"); lacks(empty, "screen.grouprules.confirm.heading");
  assert.deepEqual([...new Set(acts(empty.tree).map((b) => b.attrs["data-act"]))], ["ruledraft"], "nothing to confirm or withdraw: only the draft form's act");
});

/* R61 "Draft the rule" (T51; DEC-357, U386): one name, the fields of a deadline or a legal fact, the document and the passage copied, found in the capture's text */
const PASS0 = RULES_TEXT[0], PASS1 = RULES_TEXT[1];
const form = (doc) => ({ "gr-kind": "deadline", "gr-name": "Parks Commission: comment cutoff", "gr-amount": "5", "gr-cite": "Parks Commission Rule 4(b)", "gr-eff": "2026-07-01", "gr-why": "We comment to it often", "gr-doc": doc.sha, "gr-pass": PASS0 });
const PICK = { "gr-app": "request_for_comment", "gr-units": "days", "gr-count": "business", "gr-start": "hearing", "gr-dir": "backward", "gr-owed": "body", "gr-due": "cob" };
const unitOf = (doc, passage) => doc.units.find((u) => u.text.includes(passage));
/** A team with dev holding a document the passages are found in. */
async function drafting(o) {
  const t = await team(o);
  t.doc = await holdDoc(t.w, t.dev);
  return t;
}

test("R61 the draft form draws the design's fields: the kinds of action by their own names (claim first), the choices by their words, the document among the captures held, and writing help only while the assistant is reachable and only under What it says", async () => {
  const { w, founder, dev, doc } = await drafting({ env: SEAL });
  const second = await holdDoc(w, dev, "More rules.txt", ["Another paragraph.", "And one more."]);
  await vouch(dev, second.bundle);   // a vouched document is offered too (R70)
  const off = await open("grouprules", { world: w, as: dev });   // the team holds no key yet: the assistant is not reachable
  assert.equal(btn(off.tree, "writinghelp").length, 0);
  await holdKey(w, founder);
  const a = await open("grouprules", { world: w, as: dev });
  for (const k of ["screen.grouprules.kind.label", "screen.grouprules.name.label", "screen.grouprules.deadline.legend", "screen.grouprules.amount.label", "screen.grouprules.units.label", "screen.grouprules.start.label", "screen.grouprules.dir.label", "screen.grouprules.owed.label", "screen.grouprules.due.label", "screen.grouprules.fact.summary", "screen.grouprules.statement.label", "screen.grouprules.bears.legend", "screen.grouprules.cite.label", "screen.grouprules.eff.label", "screen.grouprules.src.legend", "screen.grouprules.doc.label", "screen.grouprules.pass.label", "screen.grouprules.why.label"]) has(a, k);
  const fields = (await dev.read("rulefields", { query: { section: "deadlines" } })).fields;
  const choices = fields.find((f) => f.field === "applies_to").choices;
  assert.equal(choices[0], "claim", "claim first");
  const kinds = all(all(a.tree, (e) => e.attrs.id === "gr-app")[0], (e) => e.tag === "option").map((o) => [o.attrs.value, textOf(o)]);
  assert.deepEqual(kinds, choices.map((id) => [id, id === "claim" ? said("screen.grouprules.app.claim") : hasWord("screen.action.kind." + id) ? said("screen.action.kind." + id) : id]));
  assert.ok(a.p.requests.some((r) => r.op === "rulefields" && r.query.section === "deadlines"));
  const held = (await pickerPages(dev))[0].held.map((h) => h.capture.sha256);
  assert.deepEqual(held.sort(), [doc.sha, second.sha].sort(), "the owner holds the held document and the vouched one");
  const docs = all(all(a.tree, (e) => e.attrs.id === "gr-doc")[0], (e) => e.tag === "option").map((o) => o.attrs.value);
  assert.deepEqual(docs.slice().sort(), held.slice().sort(), "the held documents and, R70, the vouched one");
  // writing help: only under What it says, only while the assistant is reachable
  assert.equal(btn(a.tree, "writinghelp").length, 1);
  assert.ok(a.html.indexOf('data-act="writinghelp"') > a.html.indexOf('id="gr-statement"') && a.html.indexOf('data-act="writinghelp"') < a.html.indexOf('id="gr-bears"'));
  // the words the redrawn form retired are no longer words
  for (const k of ["screen.grouprules.text.label", "screen.grouprules.link.label", "screen.grouprules.trigger.label"]) assert.ok(!hasWord(k), k);
});

test("R61 ruledraft for a deadline sends the section, the entry built from the fields (the stored rule derived from the one name), the source with the passage's place, and the reason", async () => {
  const { w, dev, doc } = await drafting();
  const a = await open("grouprules", { world: w, as: dev });
  const r = await a.press("ruledraft", { values: form(doc), choose: PICK });
  assert.deepEqual(r.sent.find((x) => x.op === "ruledraft").body, { section: "deadlines",
    entry: { rule: "parks_commission_comment_cutoff", applies_to: "request_for_comment", units: "days", amount: 5, starts: "hearing", direction: "backward", count: "business", owed_by: "body", due_at: "close_of_business", citation: "Parks Commission Rule 4(b)", effective_from: "2026-07-01" },
    source: { captureSha: doc.sha, extent: unitOf(doc, PASS0).extent }, reason: "We comment to it often" });
  assert.ok(r.sent.some((x) => x.op === "reading" && x.query.sha256 === doc.sha), "the capture's text is read to find the passage");
  const drafted = (await rulesOf(dev)).filter((x) => x.entry.rule === "parks_commission_comment_cutoff");
  assert.equal(drafted.length, 1, "the world holds the draft");
  assert.deepEqual(drafted[0].source, { captureSha: doc.sha, extent: unitOf(doc, PASS0).extent });
  assert.ok(a.p.requests.filter((x) => x.op === "grouprules").length >= 2, "the rules are read again");
  // a set time is typed on the 12-hour clock and sent as HH:MM; units other than days send no count; the office left unsaid sends no owed_by
  const t = await a.press("ruledraft", { values: { ...form(doc), "gr-time": "5:30 PM" }, choose: { ...PICK, "gr-units": "hours", "gr-due": "time", "gr-owed": "none" } });
  const e = t.sent.find((x) => x.op === "ruledraft").body.entry;
  assert.deepEqual([e.units, e.due_at, "count" in e, "owed_by" in e], ["hours", "17:30", false, false]);
  assert.equal(await a.press("ruledraft", { values: { ...form(doc), "gr-time": "13:00 pm" }, choose: { ...PICK, "gr-due": "time" } }).then((x) => x.sent.length), 0, "a time that is none is refused in place");
});

test("R61 ruledraft for a legal fact sends the key derived from the name, the trigger, what it says and the kinds ticked; none ticked leaves applies_to out", async () => {
  const { w, dev, doc } = await drafting();
  const a = await open("grouprules", { world: w, as: dev });
  const values = { ...form(doc), "gr-kind": "fact", "gr-name": "Speakers register by noon", "gr-statement": "Speakers register by noon on the meeting day", "gr-pass": PASS1 };
  const r = await a.press("ruledraft", { values: { ...values, "gr-bears": undefined }, choose: { "gr-shown": "pending_measure_or_candidate" } });
  const b = r.sent.find((x) => x.op === "ruledraft").body;
  assert.equal(b.section, "legal_facts");
  assert.deepEqual(b.entry, { key: "speakers_register_by_noon", trigger: "pending_measure_or_candidate", statement: "Speakers register by noon on the meeting day", citation: "Parks Commission Rule 4(b)", effective_from: "2026-07-01" });
  assert.deepEqual(b.source.extent, unitOf(doc, PASS1).extent);
  assert.deepEqual((await rulesOf(dev)).filter((x) => x.entry.key === "speakers_register_by_noon").map((x) => x.section), ["legal_facts"]);
});

test("R61 a passage that is not in the document as written sends nothing and says so; a rule with no source held, no name or no whole amount sends nothing", async () => {
  const { w, dev, doc } = await drafting();
  const a = await open("grouprules", { world: w, as: dev });
  const miss = await a.press("ruledraft", { values: { ...form(doc), "gr-pass": "Words the document does not hold" }, choose: PICK });
  assert.deepEqual(miss.sent.filter((x) => x.op === "ruledraft"), []);
  assert.equal(a.refused.key, "screen.grouprules.pass.notfound1");
  has(a, "screen.grouprules.pass.notfound2");
  for (const bad of [{ "gr-name": "  " }, { "gr-amount": "five" }, { "gr-amount": "0" }]) assert.deepEqual((await a.press("ruledraft", { values: { ...form(doc), ...bad }, choose: PICK })).sent.filter((x) => x.op === "ruledraft"), [], JSON.stringify(bad));
  assert.deepEqual((await a.press("ruledraft", { values: { ...form(doc), "gr-src-1": true }, choose: PICK })).sent.filter((x) => x.op === "ruledraft"), [], "the source first");
  assert.equal(a.refused.key, "screen.grouprules.src.refuse");
  assert.equal((await dev.read("grouprules")).count, 0, "nothing was drafted");
});

test("R61 writinghelp under What it says fills the draft into that field, labelled the assistant's, kept only by the member's own ruledraft; it asks for no draft of an empty field", async () => {
  const { w, founder, dev } = await team({ env: SEAL });
  await holdKey(w, founder);
  // the model's words are the platform's: its answer to the draft is scripted (an externally driven answer)
  const model = { writinghelp: () => env({ ok: true, text: "Speakers register by noon.", label: { kind: "machine", asked_by: "member:" + dev.member }, withheld: [], note: "" }) };
  const a = await open("grouprules", { world: w, as: dev, table: model });
  const none = await a.press("writinghelp", { values: { "gr-statement": "" } });
  assert.deepEqual(none.sent, []);
  const r = await a.press("writinghelp", { values: { "gr-statement": "speakers sign up by noon" }, reason: "help me say it" });
  assert.deepEqual(r.sent.find((x) => x.op === "writinghelp").body.op, "ruledraft");
  assert.equal(r.sent.find((x) => x.op === "writinghelp").body.field, "statement");
  assert.equal(a.b.doc.getElementById("gr-statement").value, "Speakers register by noon.");
  has(a, "screen.group-identity.draft.label", { handle: dev.handle });
  assert.equal((await dev.read("grouprules")).count, 0, "kept only by the member's own ruledraft");
});

/* ---- T51 FR-25: L2 (R70) ---- */

const optionsOf = (o) => all(all(o.tree, (e) => e.attrs.id === "gr-doc")[0], (e) => e.tag === "option").map((x) => [x.attrs.value, textOf(x)]);

test("R70 the 'Which document' picker is read with state held_and_vouched: with one held and one vouched document it offers both, and a vouched one is chosen and drafted from; asked without that state it would list only the held (control)", async () => {
  const { w, dev } = await team();
  const held = await holdDoc(w, dev, "Held rules.txt", [RULES_TEXT[0], "The held rules."]);
  const vouched = await holdDoc(w, dev, "Vouched rules.txt", [RULES_TEXT[0], "The vouched rules."]);
  await vouch(dev, vouched.bundle);
  // the owner's answer by the state asked (capture R77, R88): the documents at collected, and with held_and_vouched those a member vouched for too
  const plain = (await dev.read("heldcaptures", { query: { limit: "200", fields: "picker" } })).held.map((h) => h.capture.sha256);
  assert.deepEqual(plain, [held.sha], "asked without that state it lists only the held");
  const both = (await pickerPages(dev))[0].held;
  assert.deepEqual(both.map((h) => h.capture.sha256).sort(), [held.sha, vouched.sha].sort());
  const a = await open("grouprules", { world: w, as: dev });
  const asked = a.p.requests.filter((r) => r.op === "heldcaptures");
  assert.equal(asked.length, 1);
  assert.equal(asked[0].query.state, "held_and_vouched");
  assert.deepEqual(optionsOf(a), both.map((h) => [h.capture.sha256, h.title]));
  // a vouched document can be drafted from: its sha is the one the draft names
  const r = await a.press("ruledraft", { values: { ...form(vouched), "gr-doc": vouched.sha }, choose: PICK });
  const draft = r.sent.find((x) => x.op === "ruledraft");
  assert.equal(draft.body.source.captureSha, vouched.sha);
  assert.ok((await rulesOf(dev)).some((x) => x.source.captureSha === vouched.sha), "the world holds the rule drafted from it");
});

/* ---- T51 fix round 2: C14, C87, C94 ---- */

test("R70 C14: the picker is read once when the screen opens, by the cheap picker read (fields picker), and no act reads the whole list again; the picker rows are the cheap ones", async () => {
  const { w, dev, ana, lu, doc, ids } = await rulesTeam();
  const vouched = await holdDoc(w, dev, "Vouched rules.txt", [RULES_TEXT[0], "The vouched rules."]);
  await vouch(dev, vouched.bundle);
  const rows = (await pickerPages(dev))[0].held;
  assert.deepEqual(rows.map((h) => h.standing).sort(), ["collected", "verified"], "the picker rows carry the standing the owner gives");
  const a = await open("grouprules", { world: w, as: dev });
  const asked = () => a.p.requests.filter((r) => r.op === "heldcaptures");
  assert.equal(asked().length, 1, "one read of the held documents for the screen");
  assert.deepEqual([asked()[0].query.fields, asked()[0].query.state], ["picker", "held_and_vouched"]);
  assert.deepEqual(optionsOf(a), rows.map((h) => [h.capture.sha256, h.title]));
  // the acts do not read the list again
  await a.press("ruledraft", { values: { ...form(vouched), "gr-doc": vouched.sha }, choose: PICK });
  await a.press("ruleconfirm", { data: { rule: ids.tier1 }, reason: "I read the source and the rule matches it" });
  assert.equal(asked().length, 1, "still the one read");
  void ana; void lu; void doc;
});

/* ---- T51 fix round 6: G20 (K4571) ---- */

/* WORLD GAP (G20): a real list past a page takes minutes to hold (each document is an upload, an id and a promotion, and each costs more than the last:
   201 take about a minute), so the owner's paging of a long list is scripted: capture R77's, `limit` rows from the cursor `after`, `truncated` and `next`
   while more remain. The last row of such a list is a document really held (the owner's own row), so a rule can be drafted from it. */
const sha = (i) => i.toString(16).padStart(64, "0");
const heldPaged = (total, real = null) => (q) => {
  const from = q.after ? Number(q.after) : 0, n = Math.min(Number(q.limit) || 200, 1000), held = [];
  for (let i = from; i < Math.min(total, from + n); i++)
    held.push(real && i === total - 1 ? real : { bundle_id: "INFO-2026-" + String(i + 1).padStart(4, "0"), title: "Document " + (i + 1), capture: { sha256: sha(i + 1) } });
  const more = from + n < total;
  return env({ ok: true, held, state: q.state, limit: n, truncated: more, next: more ? String(from + n) : null });
};

test("R70 G20: with 250 documents held the picker reaches the 250th, reading on by the cursor, and a draft names it; control: 150 documents are read once and nothing is said of more", async () => {
  const { w, dev } = await team();
  const last = await holdDoc(w, dev, "The last document.txt", [RULES_TEXT[0], "The last."]);
  const row = (await pickerPages(dev))[0].held.find((h) => h.capture.sha256 === last.sha);
  const a = await open("grouprules", { world: w, as: dev, table: { heldcaptures: heldPaged(250, row) } });
  a.redraw();
  const docs = optionsOf(a);
  assert.equal(docs.length, 250, "every document is offered, not the first 200");
  assert.deepEqual(docs[249], [last.sha, row.title]);
  assert.ok(!a.text.includes(said("screen.people.more", { n: "200" })), "nothing left out, nothing said");
  const asked = a.p.requests.filter((r) => r.op === "heldcaptures");
  assert.equal(asked.length, 2, "the first page and the one the cursor names");
  assert.ok(asked.every((r) => r.query.state === "held_and_vouched" && r.query.fields === "picker"));
  assert.equal(asked[1].query.after, "200");
  const r = await a.press("ruledraft", { values: { ...form(last), "gr-doc": last.sha }, choose: PICK });
  assert.equal(r.sent.find((x) => x.op === "ruledraft").body.source.captureSha, last.sha, "the 250th is drafted from");
  assert.ok((await rulesOf(dev)).some((x) => x.source.captureSha === last.sha), "the world holds the rule");
  const few = await open("grouprules", { world: w, as: dev, table: { heldcaptures: heldPaged(150, row) } });
  few.redraw();
  assert.equal(optionsOf(few).length, 150);
  assert.equal(few.p.requests.filter((r) => r.op === "heldcaptures").length, 1, "a list that fits its page is read once");
  assert.ok(!few.text.includes(said("screen.people.more", { n: "150" })));
});

test("R70 G20: past the bound it keeps (the first page and two more) the picker says how many it shows and a search narrows by title; control: the search reads nothing more", async () => {
  const { w, dev } = await team();
  const a = await open("grouprules", { world: w, as: dev, table: { heldcaptures: heldPaged(2500) } });
  a.redraw();
  assert.equal(optionsOf(a).length, 2200, "200, then 1000 and 1000 by the cursor");
  has(a, "screen.people.more", { n: "2200" });
  const before = a.p.requests.filter((r) => r.op === "heldcaptures").length;
  assert.equal(before, 3);
  const q = a.b.doc.getElementById("gr-doc-q");
  assert.ok(q, "a search box narrows the choice");
  q.value = "Document 2199";
  a.b.fire(q, "input");
  await a.b.clock.tick(1000); await a.b.settle();
  a.redraw();
  assert.deepEqual(optionsOf(a), [[sha(2199), "Document 2199"]]);
  assert.equal(a.p.requests.filter((r) => r.op === "heldcaptures").length, before, "narrowing reads nothing more");
  const q2 = a.b.doc.getElementById("gr-doc-q");
  q2.value = "no such title";
  a.b.fire(q2, "input");
  await a.b.clock.tick(1000); await a.b.settle();
  a.redraw();
  has(a, "form.choose.search.none");
});

test("R70 G20: a page the cursor names that cannot be read leaves the first page offered and says it is the first rows shown, never a picker that looks whole", async () => {
  const { w, dev } = await team();
  const paged = heldPaged(250);
  const a = await open("grouprules", { world: w, as: dev, table: { heldcaptures: (q) => (q.after ? "none" : paged(q)) } });
  a.redraw();
  assert.equal(optionsOf(a).length, 200, "what was read stays offered");
  has(a, "screen.people.more", { n: "200" });
});

test("R61 C87: Draft the rule with a required box empty sends nothing and names the box; filled, it sends (control)", async () => {
  const { w, dev, doc } = await drafting();
  const a = await open("grouprules", { world: w, as: dev });
  const named = (label) => said("shell.field.needed", { field: label });
  const sent = (r) => r.sent.filter((x) => x.op === "ruledraft");
  for (const [box, label] of [["gr-name", "screen.grouprules.name.label"], ["gr-amount", "screen.grouprules.amount.label"], ["gr-cite", "screen.grouprules.cite.label"], ["gr-eff", "screen.grouprules.eff.label"], ["gr-pass", "screen.grouprules.pass.label"], ["gr-why", "screen.grouprules.why.label"]]) {
    const r = await a.press("ruledraft", { values: { ...form(doc), [box]: "  " }, choose: PICK });
    assert.deepEqual(sent(r), [], box + " empty sends nothing");
    assert.equal(a.refused && a.refused.text, named(said(label)), box + " is named: " + (a.refused && a.refused.text));
  }
  // a legal fact names what it says
  const f = await a.press("ruledraft", { values: { ...form(doc), "gr-kind": "fact", "gr-statement": "" }, choose: { "gr-shown": "pending_measure_or_candidate" } });
  assert.deepEqual(sent(f), []);
  assert.equal(a.refused.text, named(said("screen.grouprules.statement.label")));
  // control: filled sends
  assert.equal(sent(await a.press("ruledraft", { values: form(doc), choose: PICK })).length, 1);
});

test("R61 C94: a rule's drafter and confirmer are named by memberName: a member with no handle by the fallback word, a member the roster does not hold by it too, the founder by hers or the unnamed word, never an id; a member with a handle by it (control)", async () => {
  const { w, founder, dev, ana, lu, doc } = await (async () => { const t = await team(); t.ana = await t.w.signIn("ana"); t.lu = await t.w.signIn("lu"); t.doc = await holdDoc(t.w, t.ana); return t; })();
  const fact = (key) => ({ key, trigger: "recording", statement: "Rule " + key, citation: "x", effective_from: "2026-01-01" });
  const one = (await draftRule(ana, doc, 0, "legal_facts", fact("rule_one"))).rule;
  const two = (await draftRule(ana, doc, 0, "legal_facts", fact("rule_two"))).rule;
  const three = (await draftRule(founder, doc, 0, "legal_facts", fact("rule_three"))).rule;
  const four = (await draftRule(ana, doc, 0, "legal_facts", fact("rule_four"))).rule;
  await lu.act("ruleconfirm", { body: { rule: four, statement: "I am a clerk." } });
  // seeded: no act makes a rule whose drafter or confirmer has no handle or is not on the roster (a member who acts has enrolled with one)
  await founder.act("memberadd", { body: { memberId: "mai-k", cover: "Mai" } });   // on the roster, invited: no handle yet
  const seq = (id) => Number(id.replace(/^GR-/, ""));
  w.sql.exec("UPDATE local_rule_acts SET by_member = 'member:mai-k' WHERE seq = ?", seq(one));
  w.sql.exec("UPDATE local_rule_acts SET by_member = 'member:ghost-7' WHERE seq = ?", seq(two));
  w.sql.exec("UPDATE local_rule_acts SET by_member = 'member:ghost-7' WHERE act = 'confirm' AND draft_seq = ?", seq(four));
  const roster = (await founder.read("memberlist")).members;
  assert.equal(roster.find((m) => m.member_id === "mai-k").handle, null, "on the roster with no handle");
  assert.ok(!roster.some((m) => m.member_id === "ghost-7"), "not on the roster");
  const rules = (await founder.read("grouprules")).rules, by = (id) => rules.find((r) => r.rule === id);
  const a = await open("grouprules", { world: w, as: dev });   // dev drafted none of these
  const line = (id) => textOf(item(a, id));
  const fallback = (id) => said("screen.grouprules.drafted", { member: said("shell.card.member"), date: day(by(id).drafted_at) });
  assert.ok(line(one).includes(fallback(one)), "no handle: the fallback word");
  assert.ok(line(two).includes(fallback(two)), "unknown: the fallback word");
  const handle = roster.find((m) => m.member_id === "admin").handle;
  assert.ok(handle && handle !== "admin");
  assert.ok(line(three).includes(said("screen.grouprules.drafted", { member: handle, date: day(by(three).drafted_at) })), "the founder by her handle: ");
  assert.ok(line(four).includes(said("screen.grouprules.confirmed", { member: said("shell.card.member"), date: day(by(four).confirmed_at) })));
  assert.ok(line(four).includes(said("screen.grouprules.drafted", { member: ana.handle, date: day(by(four).drafted_at) })), "control: a member with a handle by it");
  for (const id of ["mai-k", "ghost-7"]) assert.ok(!a.text.includes(id), id + " is not drawn");
});

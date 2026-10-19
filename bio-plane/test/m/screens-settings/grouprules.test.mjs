/* Settings › Places and offices › Your team's own rules at the module's interface (R61; T51; N858 D8; DEC-340, U366; K3935;
   `local-facts` R10–R13, R18, R19): a rule drafted by one member waits until a different member confirms it; a tier 2, 3 or unknown
   confirmation states the confirmer's qualification before the act is sent; a rule in force is withdrawn with a reason. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, GROUP_RULES, env, refuse, grouprulesTable } from "./fixtures.mjs";

const item = (o, rule) => all(o.tree, (e) => e.tag === "li" && e.attrs["data-rule"] === rule)[0];
const btn = (n, op) => acts(n).filter((b) => b.attrs["data-act"] === op);

test("R61 reads the rules and the roster; Waiting for a second member lists each drafted rule: what it is for, who drafted it and when, its source as a reference opening the document, its trigger, citation and the day it takes effect", async () => {
  const a = await open("grouprules", { me: MEMBER, table: grouprulesTable() });
  assert.ok(a.p.requests.some((r) => r.op === "grouprules") && a.p.requests.some((r) => r.op === "memberlist"));
  has(a, "screen.grouprules.waiting");
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
  assert.deepEqual(acts(empty.tree), [], "no act with nothing to act on");
});

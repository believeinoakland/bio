/* The tallies and what an ask keeps (R13, R14), the tables' classes (R23), the module's rows (R24), and that no place is
   named in its behaviour or outward text (R25), at the interface; with the ops map the control plane routes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { answersWorld, answer, V } from "./fixture.mjs";
import { ANSWERS_CHECKS, ANSWERS_TABLES, ASK_SCOPE, STANDING_LABEL, ANSWER_LABEL, answersOps } from "../../../src/answers/index.mjs";
import { list } from "../../../../jurisdictions/index.mjs";

const BOB = V("bob"), ALICE = V("alice");

/* One ask under bob's grant: two reads, a rule answer and the check of an answer with one fabricated sentence. */
async function ask(w, g = "g-ask", id = w.standard({ from: "2020-01-01", to: null })) {
  w.a.logRead({ grant: g, viewer: BOB, op: "search", args: { q: "budget" },
                answer: { ok: true, total: 1, hits: [{ bundle_id: "INFO-2026-0001-minutes", title: "Council minutes" }] } });
  const rule = await w.a.ruleAnswer({ service: "standard", args: { id }, viewer: BOB, grant: g });
  return w.a.check({ grant: g, viewer: BOB, answer: answer({
    holdings: [{ address: "INFO-2026-0001-minutes", quote: "Council minutes" }],
    rules: [{ rule_id: rule.rule_id, service: "standard", value: rule.value, label: "legal_information", quote: rule.value.texts[0].text }],
    sentences: [{ text: "The minutes are held.", kind: "quote", support: ["h1"] },
                { text: "The bylaw reads as quoted.", kind: "rule", support: ["r1"] },
                { text: "The law requires a hearing.", kind: "rule", support: [] }] }) });
}

test("R13 counts per local day and mode: asks answered, refused by code, sentences withheld by code; no member, viewer, question, address or text; read by an administrator only", async () => {
  const w = answersWorld();
  const r = await ask(w);
  assert.deepEqual(r.withheld.map((x) => x.code), ["ANSWER_RULE_NOT_PLANE"]);
  w.a.check({ grant: "g-ask", viewer: BOB, answer: { not: "an answer" } });
  w.a.countAsk({ outcome: "refused", codes: ["AI_USE_CEILING_REACHED"], mode: "ask", at: "2026-10-06T02:00:00Z" });
  assert.equal(w.a.countAsk({ outcome: "maybe", mode: "ask" }).ok, false);
  const t = w.a.tallies({ viewer: ALICE });
  assert.equal(t.ok, true);
  /* 01:00Z and 02:00Z on 6 October are 5 October in the profile's zone */
  assert.deepEqual(t.tallies.map((x) => [x.day, x.mode, x.kind, x.code, x.n]), [
    ["2026-10-05", "ask", "answered", "", 1],
    ["2026-10-05", "ask", "refused", "AI_USE_CEILING_REACHED", 1],
    ["2026-10-05", "ask", "refused", "ANSWER_MALFORMED", 1],
    ["2026-10-05", "ask", "withheld", "ANSWER_RULE_NOT_PLANE", 1],
  ]);
  assert.deepEqual(Object.keys(t.tallies[0]).sort(), ["code", "day", "kind", "mode", "n", "zone"]);
  const text = JSON.stringify(w.rows(`SELECT * FROM answers_tallies`));
  for (const leak of ["bob", "budget", "INFO-2026", "minutes", "hearing", "g-ask"]) assert.doesNotMatch(text, new RegExp(leak, "i"), leak);
  assert.deepEqual(w.a.tallies({ viewer: ALICE, from: "2026-10-06" }).tallies, []);
  for (const viewer of [BOB, V("carol"), "class:ai", null]) assert.equal(w.a.tallies({ viewer }).reason, "NOT_AN_ADMIN", String(viewer));
});

test("R14 an ask writes no row but the counts: every table holds the same rows after an ask, except R13's", async () => {
  const w = answersWorld();
  const id = w.standard({ from: "2019-01-01", to: null });   /* the world's own writes, before the ask */
  const before = w.snapshot();
  await ask(w, "g-ask", id);
  const after = w.snapshot();
  assert.deepEqual(Object.keys(after).filter((t) => JSON.stringify(after[t]) !== JSON.stringify(before[t])), ["answers_tallies"]);
  /* and an ask with no member act beside it changes the counts alone */
  const b2 = w.snapshot();
  w.a.logRead({ grant: "g2", viewer: BOB, op: "search", args: {}, answer: { ok: true, hits: [] } });
  await w.a.ruleAnswer({ service: "profiles", args: { section: "time_zone" }, viewer: BOB, grant: "g2" });
  w.a.check({ grant: "g2", viewer: BOB, answer: answer() });
  const a2 = w.snapshot();
  assert.deepEqual(Object.keys(a2).filter((t) => JSON.stringify(a2[t]) !== JSON.stringify(b2[t])), ["answers_tallies"]);
});

test("R23 its tables are declared with their classes: the counts admin-only; standing questions and their runs seen by their owner alone, export never", () => {
  const w = answersWorld();
  const mine = w.record.declaredTables().filter((d) => d.module === "answers");
  assert.deepEqual(mine.map((d) => [d.name, d.export, d.sight]), [
    ["answers_tallies", "admin-only", "group"], ["standing_questions", "never", "owner"], ["standing_runs", "never", "owner"]]);
  for (const d of mine) for (const k of ["purge", "expunge", "derive", "version_chain"]) assert.ok(k in d, `${d.name}.${k}`);
  assert.equal(ANSWERS_TABLES.length, 3);
});

test("R24 its rows are held in its own table with their translations: the four checks, ANSWER_MALFORMED, the rule services' and the standing questions' refusals", () => {
  for (const c of ["ANSWER_MALFORMED", "ANSWER_CITES_UNREAD", "ANSWER_FIGURE_UNSOURCED", "ANSWER_RULE_NOT_PLANE",
                   "ANSWER_ABSENCE_WITHOUT_LEVEL", "RULE_SERVICE_UNKNOWN", "RULE_SERVICE_EXISTS", "MACHINE_CANNOT_AUTHOR",
                   "BAD_CADENCE", "STANDING_NEEDS_END"]) assert.ok(ANSWERS_CHECKS[c], c);
  const checks = Object.values(ANSWERS_CHECKS).map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length);
  for (const [code, r] of Object.entries(ANSWERS_CHECKS)) {
    assert.ok(Object.isFrozen(r), code);
    assert.match(r.check, /^C-134\.\d+$/);
    assert.ok(r.translation && r.translation.length > 20, code);
    assert.match(r.where, /^src\/answers\//);
  }
});

test("R25 no place is named in its behaviour or outward text", async () => {
  const places = list().flatMap((p) => [p.name, ...p.covers]).flatMap((n) => [n, n.replace(/^(City|County) of /, "")]);
  const outward = JSON.stringify([ANSWERS_CHECKS, ASK_SCOPE, STANDING_LABEL, ANSWER_LABEL]);
  for (const p of places) assert.ok(!outward.includes(p), p);
  /* with no profile active, the services answer undetermined or not held, naming no place */
  const w = answersWorld({ profiles: null });
  for (const [service, args] of [["profiles", { section: "time_zone" }], ["deadlinecompute", { rule: "records_answer", start: "2026-03-02" }]]) {
    const r = await w.a.ruleAnswer({ service, args, viewer: BOB });
    assert.ok(r.not_held, service);
    for (const p of places) assert.ok(!JSON.stringify(r).includes(p), `${service}: ${p}`);
  }
});

test("the ops map routes each op to its service with the control plane's stamps from the query, never the body's", async () => {
  const w = answersWorld();
  const url = (q) => new URL(`https://plane.test/?${new URLSearchParams(q)}`);
  const ops = answersOps(w.a, url({ viewer: BOB, grant: "g-op", service: "profiles" }), { args: { section: "time_zone" }, viewer: ALICE });
  const r = await ops.rule();
  assert.equal(r.value.entry.value, "America/Halifax");
  assert.ok(w.a.readLog("g-op").rule(r.rule_id));
  assert.equal(answersOps(w.a, url({ viewer: BOB }), {}).asktallies().reason, "NOT_AN_ADMIN");
  const set = answersOps(w.a, url({ viewer: BOB }), { question: "q", query: "title:budget", cadence: "weekly", ends: "2026-12-31", author: ALICE });
  const s = set.standingset();
  assert.equal(s.ok, true);
  assert.equal(answersOps(w.a, url({ viewer: ALICE, id: s.id }), {}).standing().code, "NO_SUCH_STANDING_QUESTION");
  assert.equal(answersOps(w.a, url({ viewer: BOB, id: s.id }), {}).standing().question.id, s.id);
  assert.equal(answersOps(w.a, url({ viewer: BOB }), {}).standing().questions.length, 1);
  assert.equal(answersOps(w.a, url({ viewer: BOB }), {}).standinganswers().ok, true);
  assert.equal(answersOps(w.a, url({ viewer: BOB, id: s.id }), {}).standingend().ok, true);
  assert.equal(answersOps(w.a, url({ viewer: BOB, grant: "g-op" }), { answer: answer() }).answercheck().ok, true);
  assert.equal(answersOps(w.a, url({ viewer: ALICE }), { on: true }).standingaiswitch().ok, true);
  assert.equal(answersOps(w.a, url({ viewer: ALICE }), { on: false }).ruleservicesswitch().ok, true);
});

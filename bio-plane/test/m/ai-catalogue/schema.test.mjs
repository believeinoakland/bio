/* ai-catalogue: the payload's schema at the interface (R1–R23, R36, R43, R44, R51, R53–R55; build/requirements/ai-catalogue.md).
 * Every fixture is a made-up provider's; `validatePayload` is pure, and the reads are asked of a copy seeded with the
 * payload. Codes and paths are asserted, never words. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePayload } from "../../../src/ai-catalogue/index.mjs";
import { OPEN, ev, quoted, claim, met, gateOf, entry, plan, payload, provider, profile, guidance, publish, pull, seeded, AT, PARTS }
  from "./fixture.mjs";

const refusedAt = (doc, reason, path) => {
  const r = validatePayload(doc);
  assert.equal(r.ok, false, `expected a refusal at ${path}`);
  assert.equal(r.code, "CATALOGUE_PAYLOAD_INVALID");
  assert.deepEqual({ reason: r.reason, path: r.path }, { reason, path });
};
const accepted = (doc) => assert.deepEqual(validatePayload(doc), { ok: true });
const without = (o, k) => { const c = { ...o }; delete c[k]; return c; };
const withEntry = (over, extra = {}) => payload({ entries: [entry("fake-one", over)], ...extra });

/* ===================================================================== R1 */

test("R1 a check answer without a date is refused CATALOGUE_EVIDENCE_MISSING naming entries[0].checks.P1", () => {
  const checks = { ...entry("x").checks, P1: { answer: "met", ev: { grade: "STATED", source: "s", page: "p", quote: "q" } } };
  refusedAt(withEntry({ checks }), "CATALOGUE_EVIDENCE_MISSING", "entries[0].checks.P1");
});
test("R1 control: the same check OPEN is accepted", () => {
  accepted(withEntry({ checks: { ...entry("x").checks, P1: OPEN } }));
});
test("R1 a claim lacking ev, a bad grade, or an unreal date is refused naming the claim", () => {
  const caps = entry("x").capabilities;
  refusedAt(withEntry({ capabilities: { ...caps, tools: { value: true } } }), "CATALOGUE_EVIDENCE_MISSING", "entries[0].capabilities.tools");
  refusedAt(withEntry({ capabilities: { ...caps, tools: { value: true, ev: ev("GUESSED") } } }), "CATALOGUE_EVIDENCE_MISSING", "entries[0].capabilities.tools");
  refusedAt(withEntry({ capabilities: { ...caps, tools: { value: true, ev: { ...ev(), date: "2026-02-30" } } } }),
    "CATALOGUE_EVIDENCE_MISSING", "entries[0].capabilities.tools");
  refusedAt(payload({ plans: [plan("fakeco-api", { scope: { value: "team" } })] }), "CATALOGUE_EVIDENCE_MISSING", "plans[0].scope");
});
test("R1 a check answered met or not_met needs its quote and page", () => {
  const checks = { ...entry("x").checks, P2: { answer: "not_met", ev: ev() } };
  refusedAt(withEntry({ checks }), "CATALOGUE_EVIDENCE_MISSING", "entries[0].checks.P2");
});

/* ===================================================================== R2 */

test("R2 an entry with OPEN price, scope, runtime and context is offered with no checks in force; OPEN is returned as OPEN", async () => {
  const doc = payload({ plans: [plan("fakeco-api", { scope: OPEN, runtimes: OPEN })],
    entries: [entry("fake-one", { prices: OPEN, limits: { ...entry("x").limits, context_stated: OPEN, context_effective: OPEN } })] });
  accepted(doc);
  const { cat } = await seeded(doc);
  assert.deepEqual(cat.entriesFor({ part: "ask", checksInForce: [], at: AT }).entries.map((e) => e.entry_id), ["fake-one"]);
  const e = cat.entryOf("fake-one", { at: AT });
  assert.deepEqual(e.prices, { open: true });
  assert.deepEqual(e.limits.context_stated, { open: true });
  const [{ plans: [p] }] = cat.plansOf({ at: AT });
  assert.deepEqual(p.constraints.runtimes, { open: true });
  assert.equal(p.unconfirmed, true);
});
test("R2 control: P3 OPEN and P3 in force is not offered", async () => {
  const { cat } = await seeded(withEntry({ checks: { ...entry("x").checks, P3: OPEN } }));
  assert.deepEqual(cat.entriesFor({ part: "ask", checksInForce: ["P3"], at: AT }).entries, []);
  assert.equal(cat.entriesFor({ part: "ask", checksInForce: [], at: AT }).entries.length, 1);
});

/* ===================================================================== R3 */

test("R3 a gate verdict graded STATED is refused CATALOGUE_EVIDENCE_MISSING", () => {
  const gate = { ...entry("x").gate, ask: { ...gateOf(), ev: ev("STATED") } };
  refusedAt(withEntry({ gate }), "CATALOGUE_EVIDENCE_MISSING", "entries[0].gate.ask");
  const ch = { ...entry("x").characterization, CH2: { ...entry("x").characterization.CH2, ev: ev("STATED") } };
  refusedAt(withEntry({ characterization: ch }), "CATALOGUE_EVIDENCE_MISSING", "entries[0].characterization.CH2");
  const unnamed = { ...entry("x").gate, ask: { ...gateOf(), run_ref: null } };
  refusedAt(withEntry({ gate: unnamed }), "CATALOGUE_EVIDENCE_MISSING", "entries[0].gate.ask");
});
test("R3 control: REPORTED is accepted and returned with its grade", async () => {
  const gate = { ...entry("x").gate, ask: { ...gateOf(), run_ref: null, ev: ev("REPORTED") } };
  const { cat } = await seeded(withEntry({ gate }));
  assert.equal(cat.entriesFor({ part: "ask", at: AT }).entries[0].part.grade, "REPORTED");
});

/* ===================================================================== R4 */

test("R4 a well-formed entry for a made-up provider is accepted", () => accepted(payload()));
test("R4 control: version_kind floating, an unknown field, a missing display_name and a bad id are each refused", () => {
  refusedAt(withEntry({ version_kind: "floating" }), "CATALOGUE_ENTRY_INVALID", "entries[0].version_kind");
  refusedAt(withEntry({ nickname: "x" }), "CATALOGUE_ENTRY_INVALID", "entries[0].nickname");
  const noName = without(entry("fake-one"), "display_name");
  refusedAt(payload({ entries: [noName] }), "CATALOGUE_ENTRY_INVALID", "entries[0].display_name");
  refusedAt(withEntry({ display_name: "x".repeat(61) }), "CATALOGUE_ENTRY_INVALID", "entries[0].display_name");
  refusedAt(payload({ entries: [entry("Fake One")] }), "CATALOGUE_ENTRY_INVALID", "entries[0].entry_id");
  refusedAt(payload({ entries: [entry("x".repeat(97))] }), "CATALOGUE_ENTRY_INVALID", "entries[0].entry_id");
  refusedAt(payload({ entries: [entry("a"), entry("a")] }), "CATALOGUE_ENTRY_INVALID", "entries[1].entry_id");
  refusedAt(withEntry({ served_ids: [] }), "CATALOGUE_ENTRY_INVALID", "entries[0].served_ids");
  refusedAt(withEntry({ effort_classes: { low: "low", medium: "max", ev: ev() } }), "CATALOGUE_ENTRY_INVALID", "entries[0].effort_classes.medium");
});

/* ===================================================================== R5 */

const twoHosts = () => {
  const relay = provider("relayco", "direct");
  return payload({ providers: [provider(), relay], plans: [plan(), plan("relayco-api", { provider: "relayco" })],
    entries: [entry("fake-one"), entry("fake-one-relay", { host: "relayco", plan_ids: ["relayco-api"] })] });
};
test("R5 one model at two hosts answers two recipients", async () => {
  const { cat } = await seeded(twoHosts());
  assert.deepEqual(cat.entryOf("fake-one", { at: AT }).recipient, { provider: "fakeco", host: "fakeco" });
  assert.deepEqual(cat.entryOf("fake-one-relay", { at: AT }).recipient, { provider: "fakeco", host: "relayco" });
  assert.deepEqual(cat.entriesFor({ part: "ask", at: AT }).entries.map((e) => e.recipient.host).sort(), ["fakeco", "relayco"]);
});
test("R5 control: a plan of another host, an unresolved plan, or an unknown provider is refused", () => {
  const doc = twoHosts();
  doc.entries[1].plan_ids = ["fakeco-api"];
  refusedAt(doc, "CATALOGUE_ENTRY_INVALID", "entries[1].plan_ids");
  refusedAt(withEntry({ plan_ids: ["nowhere"] }), "CATALOGUE_ENTRY_INVALID", "entries[0].plan_ids");
  refusedAt(withEntry({ provider: "nobody" }), "CATALOGUE_ENTRY_INVALID", "entries[0].provider");
});

/* ===================================================================== R6 */

const viaAggregator = (pin, zr = claim(false)) => {
  const doc = payload({ providers: [provider(), provider("hubco", "aggregator")], plans: [plan(), plan("hubco-api", { provider: "hubco" })] });
  doc.entries = [entry("fake-one-hub", { host: "hubco", plan_ids: ["hubco-api"], pin, zero_retention: zr })];
  return doc;
};
const PIN = { only: ["fakeco"], allow_fallbacks: false, deny_collection: true, require_parameters: true };
test("R6 an aggregator entry with allow_fallbacks true, or without a pin, is refused naming pin", () => {
  refusedAt(viaAggregator({ ...PIN, allow_fallbacks: true }), "CATALOGUE_ENTRY_INVALID", "entries[0].pin");
  refusedAt(viaAggregator(undefined), "CATALOGUE_ENTRY_INVALID", "entries[0].pin");
  refusedAt(viaAggregator(PIN, claim(true)), "CATALOGUE_ENTRY_INVALID", "entries[0].pin");
});
test("R6 control: the pinned aggregator entry is accepted; the same entry at a direct host needs no pin", () => {
  accepted(viaAggregator(PIN));
  accepted(viaAggregator({ ...PIN, zero_retention: true }, claim(true)));
  accepted(payload());
});

/* ===================================================================== R7 */

test("R7 an effort set with no dial is accepted", () => {
  accepted(withEntry({ effort_set: { values: [], default: null, ev: ev() }, effort_classes: undefined }));
});
test("R7 control: a default outside values, a missing capability or a value outside its set is refused", () => {
  refusedAt(withEntry({ effort_set: { values: ["low"], default: "high", ev: ev() }, effort_classes: undefined }),
    "CATALOGUE_ENTRY_INVALID", "entries[0].effort_set.default");
  const caps = without(entry("x").capabilities, "batch");
  refusedAt(withEntry({ capabilities: caps }), "CATALOGUE_ENTRY_INVALID", "entries[0].capabilities.batch");
  refusedAt(withEntry({ capabilities: { ...entry("x").capabilities, streaming: claim("partial") } }),
    "CATALOGUE_ENTRY_INVALID", "entries[0].capabilities.streaming");
  refusedAt(withEntry({ limits: { ...entry("x").limits, max_output: claim(-1) } }), "CATALOGUE_ENTRY_INVALID", "entries[0].limits.max_output");
});

/* ===================================================================== R8 */

test("R8 an unstated price is returned as null", async () => {
  const { cat } = await seeded();
  assert.equal(cat.entryOf("fake-one", { at: AT }).prices.cache_write, null);
  assert.equal(cat.entryOf("fake-one", { at: AT }).prices.date, "2026-10-01");
});
test("R8 control: a negative price, or one without its date, is refused", () => {
  refusedAt(withEntry({ prices: { ...entry("x").prices, input: -1 } }), "CATALOGUE_ENTRY_INVALID", "entries[0].prices.input");
  const undated = without(entry("x").prices, "date");
  refusedAt(withEntry({ prices: undated }), "CATALOGUE_ENTRY_INVALID", "entries[0].prices.date");
});

/* ===================================================================== R9 */

test("R9 changing only CH4 changes no entriesFor answer", async () => {
  const a = await seeded();
  const ch = entry("x").characterization;
  const b = await seeded(withEntry({ characterization: { ...ch, CH4: { ...ch.CH4, value: "unreasonable", reviewer: "reviewer-2" } } }));
  for (const part of PARTS) assert.deepEqual(a.cat.entriesFor({ part, at: AT }), b.cat.entriesFor({ part, at: AT }));
});
test("R9 control: a listed entry without its characterization, or without all ten, or CH10 copied, refuses the payload", () => {
  refusedAt(withEntry({ characterization: undefined }), "CATALOGUE_ENTRY_INVALID", "entries[0].characterization");
  const nine = without(entry("x").characterization, "CH5");
  refusedAt(withEntry({ characterization: nine }), "CATALOGUE_ENTRY_INVALID", "entries[0].characterization.CH5");
  refusedAt(withEntry({ characterization: { ...entry("x").characterization, CH10: { value: "met" } } }),
    "CATALOGUE_ENTRY_INVALID", "entries[0].characterization.CH10.value");
  const ch = entry("x").characterization;
  refusedAt(withEntry({ characterization: { ...ch, CH4: { ...ch.CH4, ev: ev("REPRODUCED") } } }),
    "CATALOGUE_EVIDENCE_MISSING", "entries[0].characterization.CH4");
  accepted(withEntry({ characterization: undefined, lifecycle: "lapsed" }));
});

/* ===================================================================== R11 */

test("R11 an entry with six checks is refused", () => {
  const six = without(entry("x").checks, "P6");
  refusedAt(withEntry({ checks: six }), "CATALOGUE_ENTRY_INVALID", "entries[0].checks.P6");
  refusedAt(withEntry({ checks: { ...entry("x").checks, P8: met() } }), "CATALOGUE_ENTRY_INVALID", "entries[0].checks.P8");
});
test("R11 control: seven are accepted, OPEN needing no evidence", () => {
  accepted(withEntry({ checks: { ...entry("x").checks, P4: { answer: "OPEN" } } }));
});

/* ===================================================================== R12 */

const barredAtTwoHosts = () => {
  const doc = twoHosts();
  for (const e of doc.entries) { e.developer = { name: "Barred Dev", jurisdiction: "XB" }; e.checks = { ...e.checks, P7: met("not_met") }; }
  doc.entries.push(entry("fake-other"));
  return doc;
};
test("R12 one model of a barred developer at two hosts: P7 not_met, absent under P7, present without it", async () => {
  const { cat } = await seeded(barredAtTwoHosts());
  const ids = (checks) => cat.entriesFor({ part: "ask", checksInForce: checks, at: AT }).entries.map((e) => e.entry_id).sort();
  assert.deepEqual(ids(["P7"]), ["fake-other"]);
  assert.deepEqual(ids([]), ["fake-one", "fake-one-relay", "fake-other"]);
});
test("R12 control: a barred developer carrying P7 met is refused; the barred list is policy data", () => {
  const doc = barredAtTwoHosts();
  doc.entries[0].checks.P7 = met();
  refusedAt(doc, "CATALOGUE_ENTRY_INVALID", "entries[0].checks.P7");
  doc.policy.origin.barred = [];
  accepted(doc);
});

/* ===================================================================== R13 */

test("R13 a shown value in checksInForce is CHECK_UNKNOWN", async () => {
  const { cat } = await seeded();
  for (const c of ["terms_permit_use", "breach_notification", "P8"]) {
    const r = cat.entriesFor({ part: "ask", checksInForce: [c], at: AT });
    assert.equal(r.code, "CHECK_UNKNOWN");
  }
});
test("R13 control: the shown values are returned by entryOf", async () => {
  const { cat } = await seeded();
  const e = cat.entryOf("fake-one", { at: AT });
  assert.equal(e.shown.terms_permit_use.answer, "met");
  assert.equal(e.shown.breach_notification.answer, "OPEN");
});

/* ===================================================================== R14 */

test("R14 passes_with_limits with empty limits is refused; a part outside parts is refused", () => {
  refusedAt(withEntry({ gate: { ask: gateOf("passes_with_limits", []) } }), "CATALOGUE_ENTRY_INVALID", "entries[0].gate.ask.limits");
  refusedAt(withEntry({ gate: { ask: gateOf("passes_with_limits", [{ kind: "too_slow", value: 1 }]) } }),
    "CATALOGUE_ENTRY_INVALID", "entries[0].gate.ask.limits[0].kind");
  refusedAt(withEntry({ gate: { sing: gateOf() } }), "CATALOGUE_ENTRY_INVALID", "entries[0].gate.sing");
});
test("R14 control: with limits it is accepted and returned; a part with no record reads not_yet_rated", async () => {
  const limits = [{ kind: "context_depth", value: 32000 }];
  const { cat } = await seeded(withEntry({ gate: { ask: gateOf("passes_with_limits", limits) } }));
  assert.deepEqual(cat.entriesFor({ part: "ask", at: AT }).entries[0].part, { verdict: "passes_with_limits", limits, grade: "REPRODUCED" });
  assert.deepEqual(cat.whyNotOffered({ entry_id: "fake-one", part: "draft", at: AT }).reasons, [{ code: "PART_NOT_RATED" }]);
});

/* ===================================================================== R15 */

test("R15 an entry not_suitable for draft is offered for ask when it passes ask", async () => {
  const { cat } = await seeded(withEntry({ gate: { ask: gateOf(), draft: { ...gateOf("not_suitable") } } }));
  assert.equal(cat.entriesFor({ part: "ask", at: AT }).entries.length, 1);
  assert.equal(cat.entriesFor({ part: "draft", at: AT }).entries.length, 0);
  assert.deepEqual(cat.whyNotOffered({ entry_id: "fake-one", part: "draft", at: AT }).reasons,
    [{ code: "PART_NOT_PASSED", verdict: "not_suitable" }]);
});
test("R15 control: not_yet_rated is not offered, and checks answered not_met leave the verdict unchanged", async () => {
  const { cat } = await seeded(withEntry({ gate: { ask: gateOf("not_yet_rated") }, checks: { ...entry("x").checks, P1: met("not_met") } }));
  assert.equal(cat.entriesFor({ part: "ask", at: AT }).entries.length, 0);
  const { cat: c2 } = await seeded(withEntry({ checks: { ...entry("x").checks, P1: met("not_met") } }));
  assert.equal(c2.entriesFor({ part: "ask", at: AT }).entries[0].part.verdict, "passes");
});

/* ===================================================================== R16 */

const planOfKind = (kind) => {
  const k = { api: {}, subscription: { credential_kind: "signin_token", means_allowed: claim(["issued"]), connection_ways: ["provider_signin"],
    token_bounds: { min_length: 20, max_length: 400 }, scope: claim("member") },
  aggregator: {}, gateway: { means_allowed: claim(["gateway"]) },
  builtin: { credential_kind: "none", means_allowed: claim(["none"]), connection_ways: ["built_in"] },
  custom: { means_allowed: claim(["reference"]) } }[kind];
  return plan(`fakeco-${kind}`, { kind, ...k });
};
test("R16 a fixture plan of each kind is accepted", () => {
  const plans = ["api", "subscription", "aggregator", "gateway", "builtin", "custom"].map(planOfKind);
  accepted(payload({ plans, entries: [entry("fake-one", { plan_ids: plans.map((p) => p.plan_id) })] }));
});
test("R16 control: kind pooled is refused CATALOGUE_PLAN_INVALID; so are a bad scope and a token bound off a sign-in plan", () => {
  refusedAt(payload({ plans: [plan("fakeco-api", { kind: "pooled" })] }), "CATALOGUE_PLAN_INVALID", "plans[0].kind");
  refusedAt(payload({ plans: [plan("fakeco-api", { scope: claim("world") })] }), "CATALOGUE_PLAN_INVALID", "plans[0].scope");
  refusedAt(payload({ plans: [plan("fakeco-api", { token_bounds: { min_length: 1, max_length: 2 } })] }),
    "CATALOGUE_PLAN_INVALID", "plans[0].token_bounds");
  refusedAt(payload({ plans: [plan("fakeco-api", { connection_ways: [] })] }), "CATALOGUE_PLAN_INVALID", "plans[0].connection_ways");
});

/* ===================================================================== R17 */

const means = (credential_kind, list) => payload({ plans: [plan("fakeco-api", { credential_kind, means_allowed: claim(list) })] });
test("R17 a signin_token plan allowing gateway is refused; a builtin plan allowing none is accepted", () => {
  refusedAt(means("signin_token", ["gateway"]), "CATALOGUE_PLAN_INVALID", "plans[0].means_allowed");
  accepted(payload({ plans: [planOfKind("builtin")], entries: [entry("fake-one", { plan_ids: ["fakeco-builtin"] })] }));
});
test("R17 control: an api_key plan allowing gateway and sealed is accepted, allowing none refused, and plansOf reads it", async () => {
  accepted(means("api_key", ["gateway", "sealed"]));
  refusedAt(means("api_key", ["none"]), "CATALOGUE_PLAN_INVALID", "plans[0].means_allowed");
  refusedAt(means("api_key", ["issued"]), "CATALOGUE_PLAN_INVALID", "plans[0].means_allowed");
  refusedAt(means("none", ["none", "sealed"]), "CATALOGUE_PLAN_INVALID", "plans[0].means_allowed");
  const { cat } = await seeded();
  assert.deepEqual(cat.plansOf({ plan_id: "fakeco-api", at: AT })[0].plans[0].means_allowed, ["gateway", "sealed"]);
});

/* ===================================================================== R18, R19 */

const planRow = async (over) => {
  const { cat } = await seeded(payload({ plans: [plan("fakeco-api", over)] }));
  return cat.plansOf({ at: AT })[0].plans[0];
};
test("R18 scope member answers [member]; project and team their levels", async () => {
  assert.deepEqual((await planRow({ scope: claim("member") })).levels, ["member"]);
  assert.deepEqual((await planRow({ scope: claim("project") })).levels, ["member", "project"]);
  assert.deepEqual((await planRow({ scope: claim("team") })).levels, ["member", "project", "group"]);
});
test("R18 control: scope unconfirmed answers all three with the flag", async () => {
  const r = await planRow({ scope: claim("unconfirmed") });
  assert.deepEqual([r.levels, r.unconfirmed], [["member", "project", "group"], true]);
  assert.equal((await planRow({ scope: claim("team") })).unconfirmed, false);
});
const sub = (scope) => ({ kind: "subscription", credential_kind: "signin_token", means_allowed: claim(["issued"]),
  connection_ways: ["provider_signin"], scope: claim(scope), runtimes: claim(["member_device"]) });
test("R19 a personal subscription answers level_rule_only", async () => {
  assert.deepEqual((await planRow(sub("member"))).constraints, { runtimes: ["member_device"], token_storage: "sealed", enforce: "level_rule_only" });
});
test("R19 control: the same plan at scope team answers deployment", async () => {
  assert.equal((await planRow(sub("team"))).constraints.enforce, "deployment");
});

/* ===================================================================== R20 */

test("R20 a plan without guidance is not offered, PLAN_NO_GUIDANCE named", async () => {
  const { cat } = await seeded(payload({ guidance: [] }));
  assert.deepEqual(cat.entriesFor({ part: "ask", at: AT }).entries, []);
  const why = cat.whyNotOffered({ entry_id: "fake-one", part: "ask", at: AT });
  assert.deepEqual(why.reasons, [{ code: "NO_PLAN_OFFERED", plans: [{ plan_id: "fakeco-api", reasons: ["PLAN_NO_GUIDANCE"] }] }]);
});
test("R20 control: adding the record offers it; guidance with no step is refused", async () => {
  const { cat } = await seeded(payload());
  assert.equal(cat.entriesFor({ part: "ask", at: AT }).entries[0].plans[0], "fakeco-api");
  refusedAt(payload({ guidance: [{ ...guidance("fakeco-api"), steps: [] }] }), "CATALOGUE_ENTRY_INVALID", "guidance[0].steps");
});

/* ===================================================================== R21 */

const warned = (text) => payload({ plans: [plan("fakeco-api", { free_tier_trains: claim(true), warning_id: "fakeco-free" })],
  warnings: [{ warning_id: "fakeco-free", text, ev: ev() }] });
test("R21 changing one character of the warning text changes warning_version", async () => {
  const a = (await seeded(warned({ en: "fixture warning a" }))).cat.plansOf({ at: AT })[0].plans[0];
  const b = (await seeded(warned({ en: "fixture warning b" }))).cat.plansOf({ at: AT })[0].plans[0];
  assert.match(a.warning_version, /^[0-9a-f]{64}$/);
  assert.notEqual(a.warning_version, b.warning_version);
});
test("R21 control: free_tier_trains true with no warning is refused; OPEN restricts nothing and is shown unconfirmed", async () => {
  refusedAt(payload({ plans: [plan("fakeco-api", { free_tier_trains: claim(true) })] }), "CATALOGUE_PLAN_INVALID", "plans[0].warning_id");
  const { cat } = await seeded(payload({ plans: [plan("fakeco-api", { free_tier_trains: OPEN })] }));
  assert.equal(cat.plansOf({ at: AT })[0].plans[0].free_tier_unconfirmed, true);
  assert.equal(cat.entriesFor({ part: "ask", at: AT }).entries.length, 1);
});

/* ===================================================================== R22 */

const term = (over = {}) => ({ doc: "usage-policy", version: "3", section: "4.2", quote: "fixture term", effective_from: "2026-01-01",
  kind: "political_use", ev: quoted(), ...over });
test("R22 an entry whose plan has a political_use term is still offered", async () => {
  const { cat } = await seeded(payload({ plans: [plan("fakeco-api", { binding_terms: [term()] })] }));
  assert.equal(cat.entriesFor({ part: "ask", at: AT }).entries.length, 1);
  assert.equal(cat.plansOf({ at: AT })[0].plans[0].binding_terms[0].kind, "political_use");
});
test("R22 control: a term lacking quote is refused", () => {
  const unquoted = without(term(), "quote");
  refusedAt(payload({ plans: [plan("fakeco-api", { binding_terms: [unquoted] })] }), "CATALOGUE_EVIDENCE_MISSING", "plans[0].binding_terms[0]");
  refusedAt(payload({ plans: [plan("fakeco-api", { binding_terms: [term({ kind: "secret" })] })] }), "CATALOGUE_PLAN_INVALID", "plans[0].binding_terms[0].kind");
});

/* ===================================================================== R23 */

test("R23 a term effective N days after at answers days_until N; after its date with an old confirmed_at the flag is true", async () => {
  const doc = payload({ plans: [plan("fakeco-api", { confirmed_at: "2026-10-01", binding_terms: [term({ effective_from: "2026-10-12" }),
    term({ doc: "terms", effective_from: "2026-10-05" })] })] });
  const { cat } = await seeded(doc);
  const before = cat.plansOf({ at: AT })[0].plans[0];
  assert.deepEqual(before.terms_pending.map((t) => [t.doc, t.days_until]), [["terms", 3], ["usage-policy", 10]]);
  assert.equal(before.needs_reconfirmation, false);
  const after = cat.plansOf({ at: "2026-10-20T00:00:00Z" })[0].plans[0];
  assert.deepEqual(after.terms_pending, []);
  assert.equal(after.needs_reconfirmation, true);
  assert.equal(cat.entriesFor({ part: "ask", at: "2026-10-20T00:00:00Z" }).entries.length, 1);
});
test("R23 control: a re-confirmed plan answers false, and neither state removes an offer", async () => {
  const { cat } = await seeded(payload({ plans: [plan("fakeco-api", { confirmed_at: "2026-10-15", binding_terms: [term({ effective_from: "2026-10-05" })] })] }));
  assert.equal(cat.plansOf({ at: "2026-10-20T00:00:00Z" })[0].plans[0].needs_reconfirmation, false);
  assert.equal(cat.entriesFor({ part: "ask", at: "2026-10-20T00:00:00Z" }).entries.length, 1);
});

/* ===================================================================== R36 */

test("R36 a payload with one entry lacking P7 is refused naming it, and the held catalogue is unchanged", async () => {
  const { cat } = await seeded();
  const six = without(entry("x").checks, "P7");
  const bad = payload({ seq: 2, entries: [entry("fake-one"), entry("fake-two", { checks: six })] });
  refusedAt(bad, "CATALOGUE_ENTRY_INVALID", "entries[1].checks.P7");
  const r = await pull(cat, await publish(bad));
  assert.equal(r.payload.outcome, "CATALOGUE_PAYLOAD_INVALID");
  assert.equal(r.payload.path, "entries[1].checks.P7");
  assert.equal(cat.catalogueState({ at: AT }).seq, 1);
  assert.equal(cat.entryOf("fake-two"), null);
});
test("R36 control: removing that entry makes it valid; an unknown top-level key or unread schema is refused", () => {
  accepted(payload({ seq: 2, entries: [entry("fake-one")] }));
  refusedAt(payload({ extras: [] }), "CATALOGUE_PAYLOAD_INVALID", "payload.extras");
  assert.equal(validatePayload(payload({ schema_version: 9 }), { supported: [1] }).path, "schema_version");
  assert.equal(validatePayload(null).ok, false);
});

/* ===================================================================== R43, R44 */

const libRow = (over = {}) => ({ row_id: "row-1", subject_id: "fake-one", suiteVersions: { bank: "b1" },
  parts: { ask: { verdict: "passes", limits: [] } }, speed: { median_ms: 900, p90_ms: 2100, window: "30d" },
  task_cost: { low: 0.01, high: 0.03, unit: "usd", price_date: "2026-10-01" }, tested_by: "civicsmith",
  tested_at: "2026-09-20", grade: "REPRODUCED", repeated_by_civicsmith: false, ...over });
const testedAi = (over = {}) => ({ subject_id: "fake-unlisted", display_name: "Fake Unlisted", provider_name: "Fake Co",
  host_name: "Fake Host", model: "fake-unlisted-model", version: "1", developer: { name: "Fake Co", jurisdiction: "ZZ" }, ...over });
const team = (over = {}) => libRow({ row_id: "row-2", tested_by: "team", grade: "REPORTED", ...over });
test("R43 a Civicsmith row and a team row for one entry, and a team row for a tested AI, are each accepted", () => {
  accepted(payload({ tested: [testedAi()], library: [libRow(), team(), team({ row_id: "row-3", subject_id: "fake-unlisted" })] }));
});
test("R43 control: a row whose subject is neither an entry nor a tested AI is refused; a team row graded REPRODUCED is refused", () => {
  refusedAt(payload({ library: [libRow({ subject_id: "nobody" })] }), "CATALOGUE_PAYLOAD_INVALID", "library[0].subject_id");
  refusedAt(payload({ library: [team({ grade: "REPRODUCED" })] }), "CATALOGUE_EVIDENCE_MISSING", "library[0].grade");
});
test("R44 a row with a transcript, or an unconsented team_name, refuses the payload naming library_private", () => {
  refusedAt(payload({ library: [libRow({ transcript: "..." })] }), "CATALOGUE_PAYLOAD_INVALID", "library[0].library_private");
  refusedAt(payload({ library: [team({ team_name: "A Team" })] }), "CATALOGUE_PAYLOAD_INVALID", "library[0].library_private");
  refusedAt(payload({ library: [team({ team_id: "t-1" })] }), "CATALOGUE_PAYLOAD_INVALID", "library[0].library_private");
});
test("R44 control: a row with team_name and consent_ref is accepted and returns the name", async () => {
  const { cat } = await seeded(payload({ library: [team({ team_name: "A Team", consent_ref: "consent-9" })] }));
  assert.equal(cat.libraryRows({ at: AT })[0].team_name, "A Team");
});

/* ===================================================================== R51 */

test("R51 a step with fr only is refused", () => {
  refusedAt(payload({ guidance: [{ ...guidance("fakeco-api"), steps: [{ kind: "copy", text: { fr: "étape" } }] }] }),
    "CATALOGUE_ENTRY_INVALID", "guidance[0].steps[0].text.en");
  refusedAt(warned({ fr: "avertissement" }), "CATALOGUE_ENTRY_INVALID", "warnings[0].text.en");
});
test("R51 control: en and fr are accepted", () => {
  accepted(payload({ guidance: [{ ...guidance("fakeco-api"), steps: [{ kind: "copy", text: { en: "step", fr: "étape" } }] }] }));
});

/* ===================================================================== R53 */

test("R53 an entry naming an absent profile refuses the payload naming profile; profileOf answers key_shapes", async () => {
  refusedAt(withEntry({ profile: { id: "nowhere", min_version: 1 } }), "CATALOGUE_ENTRY_INVALID", "entries[0].profile");
  refusedAt(withEntry({ profile: { id: "fakeco-profile", min_version: 2 } }), "CATALOGUE_ENTRY_INVALID", "entries[0].profile");
  refusedAt(payload({ profiles: [profile({ key_shapes: ["(unclosed"] })] }), "CATALOGUE_PAYLOAD_INVALID", "profiles[0].key_shapes[0]");
  const { cat } = await seeded();
  assert.deepEqual(cat.profileOf("fakeco-profile").key_shapes, ["^fk-[A-Za-z0-9]{20,}$"]);
  assert.equal(cat.profileOf("nowhere"), null);
});
test("R53 control: a profile with key_shapes [] is accepted", () => accepted(payload({ profiles: [profile({ key_shapes: [] })] })));

/* ===================================================================== R54 */

test("R54 a key outside the tested list is refused naming tested; the same id as entry and tested AI refuses", () => {
  refusedAt(payload({ tested: [testedAi({ plan_ids: ["fakeco-api"] })] }), "CATALOGUE_PAYLOAD_INVALID", "tested[0].tested");
  refusedAt(payload({ tested: [testedAi({ subject_id: "fake-one" })] }), "CATALOGUE_PAYLOAD_INVALID", "tested[0].subject_id");
});

/* ===================================================================== R55 */

const comb = (over = {}) => ({ subject_id: "fake-one", part: "ask", as_of: "2026-10-01", window: { from: "2026-04-01", to: "2026-10-01" },
  results: { total: 3, reproduced: 2, reported: 1 }, left_out: 0, groups: { all: { k: 3, n: 3, wilson_low: 0.4, wilson_high: 1 } },
  verdict: "passes", limits: [], speed: { median_ms: 900, p90_ms: 2000 }, task_cost: OPEN, suiteVersions: { bank: "b1" },
  confirmed: false, ...over });
test("R55 a wrong total, or confirmed contradicting the counts, refuses the payload naming combined", () => {
  refusedAt(payload({ combined: [comb({ results: { total: 4, reproduced: 2, reported: 1 } })] }), "CATALOGUE_PAYLOAD_INVALID", "combined[0].results");
  refusedAt(payload({ combined: [comb({ confirmed: true })] }), "CATALOGUE_PAYLOAD_INVALID", "combined[0].confirmed");
  refusedAt(payload({ combined: [comb({ results: { total: 2, reproduced: 2, reported: 0 } })] }), "CATALOGUE_PAYLOAD_INVALID", "combined[0].confirmed");
});

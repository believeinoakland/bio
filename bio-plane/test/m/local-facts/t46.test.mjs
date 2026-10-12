/* local-facts, T46: its ops map carries `grouprules` (R15, N935), and the C-126 rows `words.json` holds take their words
   from it by key (R16, DEC-194, N913). Words are read by key from `words.json` (`./words.mjs`); a key the list lacks
   fails the test. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { LOCAL_FACTS_CHECKS, RULE_WORDS, localFactsOps } from "../../../src/local-facts/index.mjs";
import { WORD, HAS } from "./words.mjs";

const DL = { rule: "group_answer", applies_to: "records_request", units: "days", amount: 7, starts: "received", citation: "Test Bylaw § 9" };
const LF = { key: "group_recording", trigger: "recording", statement: "Recording a sitting needs the chair's leave.", citation: "Test Bylaw § 12" };
const url = (q) => new URL(`https://plane.example/?${q}`);

test("R15 localFactsOps publishes one arm per act and read, grouprules among them, so the plane spreads the map and names no entry", () => {
  const w = world();
  assert.deepEqual(Object.keys(localFactsOps(w.lf, url(""), null)).sort(),
                   ["factconfirm", "factsdue", "factstatus", "grouprules", "ruleconfirm", "ruledraft", "ruleoffer", "rulewithdraw"]);
  for (const arm of Object.values(localFactsOps(w.lf, url(""), null))) assert.equal(typeof arm, "function");
});

test("R15 the grouprules arm answers exactly R12's groupRules({section, viewer}): section the query's (absent read as none), viewer the URL's, never the body's", () => {
  const w = world();
  const src = { captureSha: w.held("INFO-2026-0001", sha("the bylaw")), extent: { kind: "document" } };
  const a = w.lf.ruleDraft({ section: "deadlines", entry: DL, source: src, reason: "the bylaw", by: V("bob"), viewer: V("bob") }).rule;
  const b = w.lf.ruleDraft({ section: "legal_facts", entry: LF, source: src, reason: "the bylaw", by: V("bob"), viewer: V("bob") }).rule;
  w.lf.ruleConfirm({ rule: a, by: V("carol"), viewer: V("carol"), statement: "counsel of twelve years" });
  const arm = (q, body = null) => localFactsOps(w.lf, url(q), body).grouprules();
  /* no section: every rule, exactly R12's answer */
  const all = arm("viewer=member%3Adan");
  assert.deepEqual(all, w.lf.groupRules({ viewer: V("dan") }));
  assert.deepEqual(all.rules.map((r) => r.rule), [a, b]);
  assert.equal(all.rules[0].statement, "counsel of twelve years", "R12's read of the rule, the statement with it");
  /* a section from the query */
  assert.deepEqual(arm("section=legal_facts&viewer=member%3Adan"), w.lf.groupRules({ section: "legal_facts", viewer: V("dan") }));
  assert.deepEqual(arm("section=legal_facts&viewer=member%3Adan").rules.map((r) => r.rule), [b]);
  assert.deepEqual(arm("section=deadlines&viewer=member%3Adan").rules.map((r) => r.rule), [a]);
  /* an unknown section is R12's refusal, its row */
  const bad = arm("section=holidays&viewer=member%3Adan");
  assert.deepEqual(bad, w.lf.groupRules({ section: "holidays", viewer: V("dan") }));
  assert.deepEqual([bad.ok, bad.code, bad.check], [false, "RULE_SECTION_UNKNOWN", "C-126.7"]);
  /* the viewer is the URL's: a body cannot set it, nor the section */
  assert.deepEqual(arm("viewer=nobody", { viewer: V("dan"), section: "deadlines" }), { ok: true, rules: [], count: 0 });
  assert.deepEqual(arm("", { viewer: V("dan") }), { ok: true, rules: [], count: 0 }, "no URL viewer: none, whatever the body says");
  assert.deepEqual(arm("viewer=member%3Adan", { section: "holidays" }), all, "the body's section is not read");
  /* the negative control: the same URL viewer naming a member sees them */
  assert.equal(arm("viewer=member%3Abob", { viewer: "nobody" }).count, 2);
  /* a read: it writes nothing */
  const n = w.rows(`SELECT COUNT(*) AS n FROM local_rule_acts`)[0].n;
  arm("viewer=member%3Adan"); arm("section=deadlines&viewer=member%3Adan");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM local_rule_acts`)[0].n, n);
});

/* R16: the C-126 codes words.json holds as `refusal.<CODE>`; the eight re-worded by it, and RULE_SELF_CONFIRM, which
   already read as its key. */
const KEYED = ["MACHINE_CANNOT_DRAFT_RULE", "RULE_SECTION_UNKNOWN", "RULE_ENTRY_INVALID", "RULE_NO_SOURCE", "RULE_IN_PROFILE",
  "NO_SUCH_GROUP_RULE", "RULE_SELF_CONFIRM", "RULE_NOT_DRAFTED", "RULE_NEEDS_QUALIFICATION"];
/* The rows words.json does not hold keep their translations, as they read before T46. */
const KEPT = {
  MACHINE_CANNOT_CONFIRM: "Confirming, correcting or disputing a local fact (a holiday calendar, an office's hours, the time "
    + "zone), and confirming a rule your group drafted, is a member's act. An assistant may re-check a source and report what "
    + "it found; it may not record a confirmation. Sign in as a member. Nothing was written.",
  NO_SUCH_FACT: "No local fact of the active jurisdiction profiles answers to that path. A path names one profile's holiday "
    + "year (of its office calendar or of a named closure list), an office's hours or the time zone. Nothing was written.",
  FACT_ACT_REFUSED: "A member confirms, corrects or disputes a local fact; this act is none of the three. Nothing was written.",
  FACT_HOW_REFUSED: "Say how you checked, in at most 500 characters: the official page and its address, a call to the office, "
    + "a visit. None was given, or it is too long. Nothing was written.",
  FACT_VALUE_REFUSED: "A correction gives the corrected value, in the form the profile holds that fact in, and its source in "
    + "at most 500 characters. The value is missing or not of that form, or the source is missing or too long. Nothing was "
    + "written.",
  RULE_NO_REASON: "Say why, in at most 500 characters. None was given, or it is too long. Nothing was written.",
  RULE_NOT_CONFIRMED: "Only a rule your group confirmed and still applies can be offered to the shared profile. Nothing was "
    + "written.",
};
/* Codes, numbers and wheres, unmoved by R16. */
const ROWS = {
  MACHINE_CANNOT_CONFIRM: ["C-126.1", "src/local-facts/index.mjs machineRefusal > is-fact-member"],
  NO_SUCH_FACT: ["C-126.2", "src/local-facts/index.mjs noSuchFact > is-fact-named"],
  FACT_ACT_REFUSED: ["C-126.3", "src/local-facts/index.mjs factConfirm > is-fact-act"],
  FACT_HOW_REFUSED: ["C-126.4", "src/local-facts/index.mjs factConfirm > is-fact-how"],
  FACT_VALUE_REFUSED: ["C-126.5", "src/local-facts/index.mjs factConfirm > is-fact-correction"],
  MACHINE_CANNOT_DRAFT_RULE: ["C-126.6", "src/local-facts/rules.mjs machineRuleRefusal > is-rule-member"],
  RULE_SECTION_UNKNOWN: ["C-126.7", "src/local-facts/rules.mjs ruleDraft > is-rule-section"],
  RULE_ENTRY_INVALID: ["C-126.8", "src/local-facts/rules.mjs ruleDraft > is-rule-entry"],
  RULE_NO_SOURCE: ["C-126.9", "src/local-facts/rules.mjs ruleDraft > is-rule-source"],
  RULE_IN_PROFILE: ["C-126.10", "src/local-facts/rules.mjs ruleDraft > is-rule-new"],
  RULE_NO_REASON: ["C-126.11", "src/local-facts/rules.mjs reasonRefusal > is-rule-reason"],
  NO_SUCH_GROUP_RULE: ["C-126.12", "src/local-facts/rules.mjs noSuchRule > is-rule-named"],
  RULE_SELF_CONFIRM: ["C-126.13", "src/local-facts/rules.mjs ruleConfirm > is-rule-other"],
  RULE_NOT_DRAFTED: ["C-126.14", "src/local-facts/rules.mjs ruleConfirm > is-rule-drafted"],
  RULE_NEEDS_QUALIFICATION: ["C-126.15", "src/local-facts/rules.mjs ruleConfirm > is-rule-qualified"],
  RULE_NOT_CONFIRMED: ["C-126.16", "src/local-facts/rules.mjs ruleOffer > is-rule-confirmed"],
};

test("R16 every C-126 row whose code words.json holds as refusal.<CODE> takes its translation from that key, verbatim; the rest keep theirs; codes, numbers and wheres unmoved", () => {
  /* which codes the list holds is the list's own answer: exactly the nine keyed */
  assert.deepEqual(Object.keys(LOCAL_FACTS_CHECKS).filter((c) => HAS(`refusal.${c}`)), KEYED);
  assert.deepEqual(Object.keys(RULE_WORDS), KEYED.map((c) => `refusal.${c}`));
  assert.ok(Object.isFrozen(RULE_WORDS));
  for (const code of KEYED) {
    assert.equal(RULE_WORDS[`refusal.${code}`], WORD(`refusal.${code}`), code);
    assert.equal(LOCAL_FACTS_CHECKS[code].translation, WORD(`refusal.${code}`), code);
  }
  /* RULE_ENTRY_INVALID's {errors} is left for the screen */
  assert.match(LOCAL_FACTS_CHECKS.RULE_ENTRY_INVALID.translation, /\{errors\}/);
  /* the negative control: the rows the list does not hold keep their own words */
  assert.deepEqual(Object.keys(KEPT).sort(), Object.keys(LOCAL_FACTS_CHECKS).filter((c) => !KEYED.includes(c)).sort());
  for (const [code, words] of Object.entries(KEPT)) {
    assert.equal(HAS(`refusal.${code}`), false, code);
    assert.equal(LOCAL_FACTS_CHECKS[code].translation, words, code);
  }
  for (const [code, [check, where]] of Object.entries(ROWS))
    assert.deepEqual([LOCAL_FACTS_CHECKS[code].check, LOCAL_FACTS_CHECKS[code].where], [check, where], code);
  assert.deepEqual(Object.keys(LOCAL_FACTS_CHECKS), Object.keys(ROWS));
});

test("R16 each keyed refusal reached at the interface answers words.json's words, with its behaviour unmoved (RULE_ENTRY_INVALID's errors beside them)", () => {
  const w = world();
  const src = { captureSha: w.held("INFO-2026-0001", sha("source")), extent: { kind: "document" } };
  const draft = (x = {}) => w.lf.ruleDraft({ section: "deadlines", entry: DL, source: src, reason: "r", by: V("bob"), viewer: V("bob"), ...x });
  const rule = draft().rule;
  const kept = draft({ entry: { ...DL, rule: "kept_drafted" } }).rule;
  w.lf.ruleConfirm({ rule, by: V("carol"), viewer: V("carol"), statement: "q" });
  const got = {
    MACHINE_CANNOT_DRAFT_RULE: draft({ by: "class:ai" }),
    RULE_SECTION_UNKNOWN: draft({ section: "x" }),
    RULE_ENTRY_INVALID: draft({ entry: { ...DL, units: "weeks" } }),
    RULE_NO_SOURCE: draft({ source: null }),
    RULE_IN_PROFILE: draft({ entry: { ...DL, rule: "records_answer" } }),
    NO_SUCH_GROUP_RULE: w.lf.ruleConfirm({ rule: "GR-99", by: V("carol"), viewer: V("carol") }),
    RULE_SELF_CONFIRM: w.lf.ruleConfirm({ rule: kept, by: V("bob"), viewer: V("bob") }),
    RULE_NOT_DRAFTED: w.lf.ruleConfirm({ rule, by: V("dan"), viewer: V("dan"), statement: "q" }),
    RULE_NEEDS_QUALIFICATION: w.lf.ruleConfirm({ rule: kept, by: V("carol"), viewer: V("carol") }),
  };
  for (const [code, r] of Object.entries(got)) {
    assert.deepEqual([r.ok, r.code, r.reason, r.check], [false, code, code, LOCAL_FACTS_CHECKS[code].check], code);
    assert.equal(r.translation, WORD(`refusal.${code}`), code);
  }
  assert.deepEqual(got.RULE_ENTRY_INVALID.errors.map((e) => [e.path, e.code]), [["deadlines[0].units", "UNIT_UNKNOWN"]]);
  /* the negative control: a refusal the list does not hold answers its own row's words */
  const reason = draft({ entry: { ...DL, rule: "no_reason" }, reason: "" });
  assert.deepEqual([reason.code, reason.translation], ["RULE_NO_REASON", KEPT.RULE_NO_REASON]);
});

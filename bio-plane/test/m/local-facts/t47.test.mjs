/* local-facts, T47: `RULE_SECTION_UNKNOWN` is minted at one site (R17, N946, K231). R10's `ruleDraft` and R12's
   `groupRules` (and its ops arm, R15) answer the same refusal for the same unknown section, field for field, and
   C-126.7's `where` names the one builder's region. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { LOCAL_FACTS_CHECKS, RULE_SECTIONS, localFactsOps } from "../../../src/local-facts/index.mjs";
import { WORD } from "./words.mjs";

const DL = { rule: "group_answer", applies_to: "records_request", units: "days", amount: 7, starts: "received", citation: "Test Bylaw § 9" };
const url = (q) => new URL(`https://plane.example/?${q}`);

test("R17 ruleDraft and groupRules, given the same unknown section, answer RULE_SECTION_UNKNOWN equal field for field, through one builder", () => {
  const w = world();
  const src = { captureSha: w.held("INFO-2026-0001", sha("the bylaw")), extent: { kind: "document" } };
  const draft = (section) => w.lf.ruleDraft({ section, entry: DL, source: src, reason: "the bylaw", by: V("bob"), viewer: V("bob") });
  const read = (section) => w.lf.groupRules({ section, viewer: V("bob") });
  const long = "s".repeat(60);
  /* every unknown section either act can be given: a word, another profile section, a case variant, a long string, a
     number, an object, an array, a boolean */
  for (const section of ["weather", "holidays", "Deadlines", "", long, 3, { deadlines: true }, ["deadlines"], true]) {
    const d = draft(section), g = read(section);
    assert.deepEqual(d, g, JSON.stringify(section));
    assert.deepEqual(Object.keys(d).sort(), ["check", "code", "detail", "ok", "reason", "section", "sections", "translation"]);
    assert.deepEqual([d.ok, d.reason, d.code, d.check], [false, "RULE_SECTION_UNKNOWN", "RULE_SECTION_UNKNOWN", "C-126.7"]);
    assert.equal(d.translation, WORD("refusal.RULE_SECTION_UNKNOWN"), "R16's key, kept");
    assert.equal(d.translation, LOCAL_FACTS_CHECKS.RULE_SECTION_UNKNOWN.translation);
    assert.equal(d.detail, "a group's rule is drafted in deadlines or legal_facts.");
    assert.equal(d.section, typeof section === "string" ? section.slice(0, 40) : null, "the given value cut to 40 characters, null when not a string");
    assert.deepEqual(d.sections, [...RULE_SECTIONS]);
    assert.deepEqual(d.sections, ["deadlines", "legal_facts"]);
  }
  assert.equal(draft(long).section.length, 40);
  /* each answer is its own: changing one never reaches the other or the exported list */
  const a = draft("weather"), b = read("weather");
  a.sections.push("x");
  assert.deepEqual(b.sections, ["deadlines", "legal_facts"]);
  assert.deepEqual([...RULE_SECTIONS], ["deadlines", "legal_facts"]);
  /* the ops arm answers exactly groupRules' refusal (R15) */
  assert.deepEqual(localFactsOps(w.lf, url("section=weather&viewer=member%3Abob"), null).grouprules(), draft("weather"));
  /* nothing was written by any of them */
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM local_rule_acts`)[0].n, 0);
});

test("R17 the orders and answers are otherwise unchanged: a draft's machine refusal still comes first; a read with no section, or a known one, is no refusal (controls)", () => {
  const w = world();
  const src = { captureSha: w.held("INFO-2026-0001", sha("the bylaw")), extent: { kind: "document" } };
  /* R10: MACHINE_CANNOT_DRAFT_RULE before the section */
  assert.equal(w.lf.ruleDraft({ section: "weather", entry: DL, source: src, reason: "r", by: "class:ai" }).code, "MACHINE_CANNOT_DRAFT_RULE");
  /* R10: a known section passes the section check to the entry's */
  assert.equal(w.lf.ruleDraft({ section: "deadlines", entry: { ...DL, units: "weeks" }, source: src, reason: "r", by: V("bob") }).code, "RULE_ENTRY_INVALID");
  /* R12: absent and null read as none; a known section reads its rules; a viewer naming no member sees none, but an
     unknown section is refused before the viewer is read, as before */
  for (const section of [undefined, null, "deadlines", "legal_facts"])
    assert.deepEqual(w.lf.groupRules({ section, viewer: V("bob") }), { ok: true, rules: [], count: 0 }, String(section));
  assert.equal(w.lf.groupRules({ section: "weather", viewer: "nobody" }).code, "RULE_SECTION_UNKNOWN");
});

test("R17 C-126.7 keeps its code, number and translation, and its where names the one builder's region", () => {
  const row = LOCAL_FACTS_CHECKS.RULE_SECTION_UNKNOWN;
  assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"]);
  assert.equal(row.check, "C-126.7");
  assert.equal(row.translation, WORD("refusal.RULE_SECTION_UNKNOWN"));
  assert.equal(row.where, "src/local-facts/rules.mjs sectionRefusal > is-rule-section");
  /* the one region: no other row of the family names it, and none names the old site in ruleDraft */
  const others = Object.entries(LOCAL_FACTS_CHECKS).filter(([code]) => code !== "RULE_SECTION_UNKNOWN").map(([, r]) => r.where);
  assert.ok(!others.some((x) => x.endsWith("> is-rule-section")));
  assert.ok(!Object.values(LOCAL_FACTS_CHECKS).some((r) => r.where === "src/local-facts/rules.mjs ruleDraft > is-rule-section"));
});

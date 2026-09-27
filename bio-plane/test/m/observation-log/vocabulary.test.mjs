/* observation-log: the vocabulary and the pure judgements (R1, R11, R12, R26, R27, R28), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as ol from "../../../src/observation-log/index.mjs";
import { AI_RUN_CHECKS, LEAD_CHECKS as CATALOGUE_LEAD_CHECKS } from "../../../checks/bio-checks.mjs";

const sentence = (s) => typeof s === "string" && s.trim().length > 10;

test("R1 the vocabulary: the four levels, the states with NEVER_LOOKED named, the actor classes, the nine authority kinds, the seven subject kinds, each with a sentence", () => {
  assert.deepEqual(Object.keys(ol.OBSERVATION_LEVELS).sort(), ["content", "document", "internet", "meaning"]);
  assert.deepEqual(Object.keys(ol.OBSERVATION_STATES).sort(),
    ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "NEVER_LOOKED", "PRESENT", "partial"]);
  assert.deepEqual(Object.keys(ol.OBSERVATION_ACTOR_CLASSES).sort(), ["machine", "member", "plane"]);
  assert.deepEqual(Object.keys(ol.OBSERVATION_AUTHORITY_KINDS).sort(),
    ["acquire", "derive", "extract", "lead", "link", "objective", "ratify", "run", "sweep"]);
  assert.deepEqual(Object.keys(ol.OBSERVATION_SUBJECT_KINDS).sort(),
    ["address", "capture", "description", "entity", "extent", "reference", "unstated"]);
  for (const v of [ol.OBSERVATION_LEVELS, ol.OBSERVATION_STATES, ol.OBSERVATION_ACTOR_CLASSES,
                   ol.OBSERVATION_AUTHORITY_KINDS, ol.OBSERVATION_SUBJECT_KINDS])
    for (const [k, s] of Object.entries(v)) assert.ok(sentence(s), `${k} has a sentence`);
  assert.ok(!("member" in ol.OBSERVATION_AUTHORITY_KINDS), "a member's own search has no authority (§4.6)");
  assert.deepEqual([...ol.DEFINITIVE_STATES].sort(), ["LOOKED_ABSENT", "PRESENT"]);
});

test("R1 the content-axis states, the undetermined answer apart from them, the missing-row causes and the coverage of a row, each with its sentence", () => {
  assert.deepEqual(Object.keys(ol.CONTENT_AXIS_STATES).sort(), ["indexed_full", "indexed_none", "indexed_partial", "not_extracted"]);
  assert.equal(ol.CONTENT_AXIS_UNDETERMINED, "undetermined");
  assert.ok(!(ol.CONTENT_AXIS_UNDETERMINED in ol.CONTENT_AXIS_STATES));
  for (const s of Object.values(ol.CONTENT_AXIS_STATES)) assert.ok(sentence(s));
  assert.deepEqual(Object.keys(ol.MISSING_ROW_CAUSES).sort(), ["never_looked", "pre_log", "purged", "watermark_band"]);
  assert.deepEqual(Object.keys(ol.MEANING_MISSING_ROW_CAUSES).sort(), Object.keys(ol.MISSING_ROW_CAUSES).sort());
  for (const s of [...Object.values(ol.MISSING_ROW_CAUSES), ...Object.values(ol.MEANING_MISSING_ROW_CAUSES)]) assert.ok(sentence(s));
  assert.deepEqual([...ol.ALL_MISSING_ROW_CAUSES], ["pre_log", "purged", "never_looked"]);
  assert.deepEqual(Object.keys(ol.OBSERVATION_COVERAGE).sort(), ["backed", "none_owed"]);
  assert.equal(ol.OBSERVATION_COVERAGE_UNDETERMINED, "undetermined");
  // the coverage of a row, decided from the row alone
  assert.equal(ol.observationCoverage({ state: "PRESENT", resultRef: "abc" }), "backed");
  assert.equal(ol.observationCoverage({ state: "PRESENT", resultRef: null }), "undetermined");
  assert.equal(ol.observationCoverage({ state: "PRESENT", resultRef: "" }), "undetermined");
  for (const s of ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "partial"])
    assert.equal(ol.observationCoverage({ state: s, resultRef: null }), "none_owed");
  assert.equal(ol.observationCoverage({ state: "partial", resultRef: "x" }), "backed");
});

test("R11 missingCause: pre_log on the artifact; purged with no row at the level, no registration instant, or entry before the first row; watermark_band inside the one second before; never_looked only at or after", () => {
  const first = "2026-09-27T03:00:15Z";
  assert.equal(ol.missingCause({ hasArtifact: true, registeredAt: null, firstRowAt: null }), "pre_log");
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: "2026-09-27T04:00:00Z", firstRowAt: null }), "purged");
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: null, firstRowAt: first }), "purged");
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: "2026-09-27T02:59:00.000Z", firstRowAt: first }), "purged");
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: "2026-09-27T03:00:13.999Z", firstRowAt: first }), "purged");
  // the band: the clock second before the first row's own second
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: "2026-09-27T03:00:14.000Z", firstRowAt: first }), "watermark_band");
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: "2026-09-27T03:00:14.999Z", firstRowAt: first }), "watermark_band");
  // the tie inside one second, and after
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: "2026-09-27T03:00:15.000Z", firstRowAt: first }), "never_looked");
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: "2026-09-27T03:00:15.900Z", firstRowAt: first }), "never_looked");
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: "2026-09-28T00:00:00Z", firstRowAt: first }), "never_looked");
  // an unreadable instant never reaches the positive statement
  assert.equal(ol.missingCause({ hasArtifact: false, registeredAt: "yesterday", firstRowAt: first }), "purged");
  // a watermark stored with a fraction has no band
  assert.equal(ol.missingCause({ registeredAt: "2026-09-27T03:00:14.500Z", firstRowAt: "2026-09-27T03:00:15.000Z" }), "purged");
});

test("R11 causesNotRuledOut: pre_log and never_looked each a set of one; purged and the band leave two on two-sided evidence and all three on one-sided or undeclared evidence; an unknown cause the widest set", () => {
  assert.deepEqual(ol.causesNotRuledOut("pre_log"), ["pre_log"]);
  assert.deepEqual(ol.causesNotRuledOut("never_looked"), ["never_looked"]);
  for (const c of ["purged", "watermark_band"]) {
    assert.deepEqual(ol.causesNotRuledOut(c, { evidenceOneSided: false }), ["purged", "never_looked"]);
    assert.deepEqual(ol.causesNotRuledOut(c, { evidenceOneSided: true }), ["pre_log", "purged", "never_looked"]);
    assert.deepEqual(ol.causesNotRuledOut(c), ["pre_log", "purged", "never_looked"]);
  }
  assert.deepEqual(ol.causesNotRuledOut("gremlins", { evidenceOneSided: false }), ["pre_log", "purged", "never_looked"]);
  // where the evidence is one-sided (a reference, an entity) a missing row leaves all three open
  assert.equal(ol.MEANING_EVIDENCE_IS_ONE_SIDED.reference, true);
  assert.equal(ol.MEANING_EVIDENCE_IS_ONE_SIDED.entity, true);
  assert.equal(ol.MEANING_EVIDENCE_IS_ONE_SIDED.capture, false);
  assert.equal(ol.CONTENT_EVIDENCE_IS_ONE_SIDED.capture, false);
});

test("R12 contentAxisFor: the two axes never merged; no row is not_extracted only under never_looked and undetermined naming the cause otherwise", () => {
  const nl = ol.contentAxisFor({ observed: null, missingCause: "never_looked" });
  assert.deepEqual([nl.state, nl.determined, nl.missing_cause], ["not_extracted", true, "never_looked"]);
  for (const cause of ["pre_log", "purged", "watermark_band"]) {
    const u = ol.contentAxisFor({ observed: null, missingCause: cause });
    assert.deepEqual([u.state, u.determined, u.missing_cause], ["undetermined", false, cause]);
    assert.ok(u.why.includes(ol.MISSING_ROW_CAUSES[cause]));
  }
  assert.equal(ol.contentAxisFor({ observed: null }).missing_cause, "purged", "an absent cause takes the weakest");
  assert.equal(ol.contentAxisFor({ observed: null, missingCause: "nonsense" }).state, "undetermined");
  for (const s of ["LOOKED_ABSENT", "LOOKED_INDETERMINATE"])
    assert.equal(ol.contentAxisFor({ observed: s, reason: "no text" }).state, "indexed_none");
  // extraction PRESENT, index read apart
  const base = { observed: "PRESENT", unitIndex: true };
  assert.equal(ol.contentAxisFor({ ...base, unitsComplete: true, indexObserved: "PRESENT" }).state, "indexed_full");
  assert.equal(ol.contentAxisFor({ ...base, unitsComplete: false, indexObserved: "partial" }).state, "indexed_partial");
  assert.equal(ol.contentAxisFor({ ...base, unitsComplete: null }).state, "undetermined");
  assert.equal(ol.contentAxisFor({ ...base, unitsComplete: false, indexObserved: "LOOKED_INDETERMINATE", indexReason: "no arm" }).state, "indexed_none");
  assert.equal(ol.contentAxisFor({ observed: "partial", unitIndex: true, unitsComplete: true, indexObserved: "PRESENT" }).state, "indexed_partial",
    "an extraction that got part of the document is never indexed_full, whatever the index holds");
  assert.equal(ol.contentAxisFor({ observed: "PRESENT", unitIndex: false }).state, "undetermined");
});

test("R26 the C-22 refusals are the catalogue's rows by reference, numbers unchanged; C-54.2–C-54.10 are this module's rows and have left the catalogue, C-54.1 staying with the leg grammars", () => {
  const want = { AI_LOG_STATE_UNKNOWN: "C-22.1", AI_LOG_GOVERNED_ABSENCE: "C-22.2", AI_LOG_SHELL_PRESENT: "C-22.3",
                 AI_RUN_CONDITION_UNKNOWN: "C-22.4", AI_LOG_NOT_A_BUNDLE: "C-22.6", OBS_AUTHORITY_UNNAMED: "C-22.9",
                 OBS_PRESENT_NO_REFERENT: "C-22.10" };
  assert.deepEqual(Object.fromEntries(Object.entries(ol.OBSERVATION_CHECKS).map(([k, r]) => [k, r.check])), want);
  for (const k of Object.keys(want)) {
    assert.equal(ol.OBSERVATION_CHECKS[k], AI_RUN_CHECKS[k], `${k} is the catalogue's one row, not a copy`);
    assert.ok(sentence(ol.OBSERVATION_CHECKS[k].translation));
  }
  const lead = { LEAD_NOT_A_MEMBER: "C-54.2", LEAD_NO_WORDS: "C-54.3", LEAD_TOO_LONG: "C-54.4", LEAD_NOT_FOUND: "C-54.5",
                 LEAD_LOOK_STATE: "C-54.6", LEAD_LOOK_REFERENT: "C-54.7", LEAD_LOOK_NOT_A_MEMBER: "C-54.8",
                 LEAD_SHARE_NOT_A_PARTICIPANT: "C-54.9", LEAD_SHARE_NOT_AUTHOR: "C-54.10" };
  assert.deepEqual(Object.fromEntries(Object.entries(ol.LEAD_CHECKS).map(([k, r]) => [k, r.check])), lead);
  for (const [k, r] of Object.entries(ol.LEAD_CHECKS)) {
    assert.ok(sentence(r.translation), k);
    assert.match(r.where, /^src\/observation-log\/index\.mjs /, `${k} names its site in this module`);
    assert.ok(!(k in CATALOGUE_LEAD_CHECKS), `${k} is no longer a catalogue row`);
  }
  assert.deepEqual(Object.keys(CATALOGUE_LEAD_CHECKS), ["LEAD_NOT_EVIDENCE"]);
  assert.equal(CATALOGUE_LEAD_CHECKS.LEAD_NOT_EVIDENCE.check, "C-54.1");
});

test("R27 one judgement, one place: every writer's outcome rule, the content-axis rule and the missing-row rule are exported pure functions that answer without storage", () => {
  for (const f of ["checkObservation", "checkCondition", "observationReferentFault", "contentObservationsFor", "readerRunObservation",
                   "resolutionObservation", "derivationObservation", "derivationStatement", "contentAxisFor", "missingCause",
                   "causesNotRuledOut", "enteredAfterFirstRow", "observationCoverage"])
    assert.equal(typeof ol[f], "function", f);
  // the writer rules decide rows without a store
  assert.equal(ol.readerRunObservation({ found: true, entities: [{}], content_type: "agenda" }, "s").row.state, "PRESENT");
  assert.equal(ol.readerRunObservation({ found: false, entities: [] }, "s").row.state, "LOOKED_ABSENT");
  assert.equal(ol.readerRunObservation({ found: false, entities: [] }, "s", { readerRegistered: false }).row.state, "LOOKED_INDETERMINATE");
  assert.equal(ol.readerRunObservation(null, "s").row, null);
  assert.equal(ol.resolutionObservation({ ref: "k:1", matches: [] }).row.state, "LOOKED_ABSENT");
  const hit = ol.resolutionObservation({ ref: "k:1", matches: [{ entity_id: "ENT-1", grade: "A" }, { entity_id: "ENT-2", grade: "C" }] }).row;
  assert.deepEqual([hit.state, hit.resultKind, hit.resultRef], ["PRESENT", "entity", "ENT-1"]);
  assert.equal(ol.derivationObservation({ entityId: "ENT-1", count: 0, documents: 1 }).row.state, "LOOKED_ABSENT");
  assert.equal(ol.derivationObservation({ entityId: "ENT-1", count: 3, documents: 3 }).row.state, "PRESENT");
  assert.equal(ol.derivationObservation({ entityId: "ENT-1", count: 3, documents: 40, truncated: true }).row.state, "partial");
  assert.equal(ol.derivationStatement(null, "never_looked").derived, "never_derived");
  assert.equal(ol.derivationStatement(null, "pre_log").derived, "pre_log");
  assert.equal(ol.derivationStatement(null, "watermark_band").derived, "undetermined");
  assert.equal(ol.derivationStatement({ state: "partial", at: "t", detail: "the derivation over 32 document(s) concerning" }).cut, true);
});

test("R28 no place is named in the module's outward text: every exported sentence, refusal translation and published answer word", () => {
  const PLACE = /\b(oakland|alameda|berkeley|california|san francisco|county of|city of|state of)\b/i;
  const strings = [];
  const walk = (v, depth = 0) => {
    if (depth > 4 || v == null) return;
    if (typeof v === "string") { strings.push(v); return; }
    if (v instanceof Set) { for (const x of v) walk(x, depth + 1); return; }
    if (typeof v === "object") for (const x of Object.values(v)) walk(x, depth + 1);
  };
  for (const [k, v] of Object.entries(ol)) if (typeof v !== "function") walk(v);
  assert.ok(strings.length > 100);
  for (const s of strings) assert.doesNotMatch(s, PLACE);
});

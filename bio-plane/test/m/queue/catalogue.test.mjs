/* queue's catalogue (R1–R5): `queuestate.mjs`, pure, driven at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classOfKind, catalogueIdOf, itemClassOf, suppressedBy, mutedAsItem, serializeMutedKinds, parseMutedKinds,
  QUEUE_CONDITION_KINDS, QUEUE_OBLIGATION_KINDS, QUEUE_FINDING_KINDS,
} from "../../../src/queuestate.mjs";
import { CONDITION_KINDS } from "../../../src/observation-log/vocabulary.mjs";

const OBLIGATION = ["authority-undetermined", "bias-debt", "endorsement-owed", "expertise-confirmation-owed",
  "membership-request", "project-owners-inactive"];
/* R1's twenty, `cardinality_exceeded` among them (N107, K209). */
const FINDING = ["missing_predecessor", "overdue_successor", "temporal-expectation-due", "source-modified",
  "source-removed", "duplicate-document", "link-verdict-changed", "reused-asset-changed", "assistant-surfaced-focus",
  "grade-improvable", "objective-gap", "measure-decay", "export-performed", "audit-finding", "register-unbacked",
  "out-of-inquiry-lead", "stance-changed-here-not-elsewhere", "new-version-arrived-from-another-team",
  "shared-inquiry-concluded-by-another-project", "cardinality_exceeded"];
const CONDITION = ["monitoring-recheck-due", "archive-fallback-eligible", "capture-session-ttl-expiring",
  "source-unreachable-governed", "capture-completed-unattended", "partial-capture-outstanding", "text-undetermined",
  "client-rendered-shell", "invitation-spent-or-expired", "governor-holding-host", "runtime-ceiling-reached",
  "render-deferred"];
const sorted = (a) => [...a].sort();

test("R1: every catalogued kind answers its class, anything else null, and every kind has its sentence", () => {
  for (const k of OBLIGATION) assert.equal(classOfKind(k), "OBLIGATION", k);
  for (const k of FINDING) assert.equal(classOfKind(k), "FINDING", k);
  for (const k of CONDITION) assert.equal(classOfKind(k), "CONDITION", k);
  // the catalogue is exactly these: nothing else is classed
  assert.deepEqual(sorted(Object.keys(QUEUE_OBLIGATION_KINDS)), sorted(OBLIGATION));
  assert.deepEqual(sorted(Object.keys(QUEUE_FINDING_KINDS)), sorted(FINDING));
  assert.deepEqual(sorted(Object.keys(QUEUE_CONDITION_KINDS)), sorted(CONDITION));
  for (const v of [undefined, null, "", 7, {}, [], true, "no-such-kind", "N-1", "FINDING", "toString", "__proto__",
                   "hasOwnProperty", " bias-debt", "BIAS-DEBT"])
    assert.equal(classOfKind(v), null, String(v));
  for (const vocab of [QUEUE_OBLIGATION_KINDS, QUEUE_FINDING_KINDS, QUEUE_CONDITION_KINDS])
    for (const [k, s] of Object.entries(vocab)) assert.ok(typeof s === "string" && s.trim().length > 0, k);
  // the cardinality finding is worded as what it is: never "required and absent"
  assert.doesNotMatch(QUEUE_FINDING_KINDS.cardinality_exceeded, /absent/);
});

test("R2: catalogueIdOf answers N-1 for export-performed and null for every other kind", () => {
  assert.equal(catalogueIdOf("export-performed"), "N-1");
  for (const k of [...OBLIGATION, ...FINDING, ...CONDITION].filter((x) => x !== "export-performed"))
    assert.equal(catalogueIdOf(k), null, k);
  for (const v of [undefined, null, "", "toString", "__proto__", "N-1"]) assert.equal(catalogueIdOf(v), null);
});

test("R3: itemClassOf reads FINDING:: and CONDITION:: ids with a non-blank rest, trimmed; else null", () => {
  assert.equal(itemClassOf("FINDING::proc::award"), "FINDING");
  assert.equal(itemClassOf("  CONDITION::governor-holding-host::example.org  "), "CONDITION");
  assert.equal(itemClassOf("FINDING::x"), "FINDING");
  for (const v of ["FINDING::", "FINDING::   ", "CONDITION::", "OBLIGATION::bias-debt::r1", "finding::x", "FINDING:x",
                   "x::FINDING::y", "", "   ", null, undefined, 3, {}, "TASK-2026-0001"])
    assert.equal(itemClassOf(v), null, String(v));
});

test("R4: suppressedBy names the first muted ancestor holding the kind, with no wildcard; the item form and the codec", () => {
  const item = (kind, ids, cls = "CONDITION") => ({ id: `${cls}::${kind}::1`, class: cls, kind,
    case: { ancestors: ids.map((id) => ({ id })) } });
  const mutes = new Map([["INQ-1", new Set(["governor-holding-host"])], ["PRJ-1", new Set(["governor-holding-host", "render-deferred"])]]);
  assert.equal(suppressedBy(item("governor-holding-host", ["INQ-1", "PRJ-1"]), mutes), "INQ-1");
  assert.equal(suppressedBy(item("governor-holding-host", ["PRJ-1", "INQ-1"]), mutes), "PRJ-1");
  assert.equal(suppressedBy(item("render-deferred", ["INQ-1", "PRJ-1"]), mutes), "PRJ-1");
  // a kind not named when the mute was made is not suppressed: no wildcard
  assert.equal(suppressedBy(item("partial-capture-outstanding", ["INQ-1", "PRJ-1"]), mutes), null);
  assert.equal(suppressedBy(item("governor-holding-host", ["PRJ-9"]), mutes), null);
  assert.equal(suppressedBy(item("governor-holding-host", []), mutes), null);
  assert.equal(suppressedBy({ kind: "governor-holding-host" }, mutes), null);
  assert.equal(suppressedBy(item("governor-holding-host", ["INQ-1"]), new Map()), null);
  assert.equal(suppressedBy(null, mutes), null);
  assert.equal(suppressedBy(item("", ["INQ-1"]), new Map([["INQ-1", new Set([""])]])), null);
  // the item form: only a CONDITION or FINDING whose id is in the set
  const set = new Set(["CONDITION::a::1", "FINDING::p::s", "OBLIGATION::bias-debt::r1", "TASK-1"]);
  assert.equal(mutedAsItem({ id: "CONDITION::a::1", class: "CONDITION" }, set), true);
  assert.equal(mutedAsItem({ id: "FINDING::p::s", class: "FINDING" }, set), true);
  assert.equal(mutedAsItem({ id: "OBLIGATION::bias-debt::r1", class: "OBLIGATION" }, set), false);
  assert.equal(mutedAsItem({ id: "TASK-1", class: "OBLIGATION" }, set), false);
  assert.equal(mutedAsItem({ id: "FINDING::q::s", class: "FINDING" }, set), false);
  assert.equal(mutedAsItem({ id: "FINDING::p::s", class: "FINDING" }, new Set()), false);
  assert.equal(mutedAsItem(null, set), false);
  // the codec: sorted, de-duplicated, comma-joined; parse inverts it
  assert.equal(serializeMutedKinds(["b", "a", "b", "", null, 3, "c"]), "a,b,c");
  assert.equal(serializeMutedKinds([]), "");
  assert.equal(serializeMutedKinds(undefined), "");
  assert.deepEqual(parseMutedKinds("c, a,b,a,,"), ["a", "b", "c"]);
  assert.deepEqual(parseMutedKinds(""), []);
  assert.deepEqual(parseMutedKinds(null), []);
  for (const kinds of [["render-deferred"], CONDITION, ["x", "y"]])
    assert.deepEqual(parseMutedKinds(serializeMutedKinds(kinds)), sorted(new Set(kinds)));
});

test("R5: the condition kinds are observation-log's vocabulary, re-exported as QUEUE_CONDITION_KINDS", () => {
  assert.equal(QUEUE_CONDITION_KINDS, CONDITION_KINDS);
  assert.deepEqual(sorted(Object.keys(QUEUE_CONDITION_KINDS)), sorted(CONDITION));
  assert.equal(Object.keys(QUEUE_CONDITION_KINDS).length, 12);
  for (const k of Object.keys(CONDITION_KINDS)) assert.equal(classOfKind(k), "CONDITION", k);
});

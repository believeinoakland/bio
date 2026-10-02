/* queue's catalogue (R1–R5): `queuestate.mjs`, pure, driven at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classOfKind, catalogueIdOf, itemClassOf, suppressedBy, mutedAsItem, serializeMutedKinds, parseMutedKinds,
  QUEUE_CONDITION_KINDS, QUEUE_OBLIGATION_KINDS, QUEUE_FINDING_KINDS,
} from "../../../src/queuestate.mjs";
import { CONDITION_KINDS } from "../../../src/observation-log/vocabulary.mjs";

/* R1's sixteen, N345's two duties among them (DEC-85's unseen one included), N375's self-registered key, the Action
   layer's three (K608, K614), the litigation hold (K899 (7)), K921's review request and local fact, and the unchosen
   credit level (queue-producers R23, DEC-102 item 3). */
const OBLIGATION = ["authority-undetermined", "bias-debt", "endorsement-owed", "expertise-confirmation-owed",
  "membership-request", "project-owners-inactive", "contradiction-duty", "contradiction-duty-unseen",
  "signer-self-registered", "plan-checkpoint-due", "escalation-stage-proposed", "action-reminder", "litigation-hold",
  "template-review-requested", "local-fact-due", "attribution-unchosen"];
/* R1's twenty-six, `cardinality_exceeded` (N107, K209), `newer-capture-affects-reference` (N172) and N345's five among
   them. */
const FINDING = ["missing_predecessor", "overdue_successor", "temporal-expectation-due", "source-modified",
  "source-removed", "duplicate-document", "link-verdict-changed", "reused-asset-changed", "assistant-surfaced-focus",
  "grade-improvable", "objective-gap", "measure-decay", "export-performed", "audit-finding", "register-unbacked",
  "out-of-inquiry-lead", "stance-changed-here-not-elsewhere", "new-version-arrived-from-another-team",
  "shared-inquiry-concluded-by-another-project", "cardinality_exceeded", "newer-capture-affects-reference",
  "contradiction-plurality-unseen", "contradiction-lead", "contradiction-plurality", "side-corrected",
  "tension-after-publication"];
/* observation-log's twelve (R5), and the overdue action clock (K611). */
const LOOK_CONDITION = ["monitoring-recheck-due", "archive-fallback-eligible", "capture-session-ttl-expiring",
  "source-unreachable-governed", "capture-completed-unattended", "partial-capture-outstanding", "text-undetermined",
  "client-rendered-shell", "invitation-spent-or-expired", "governor-holding-host", "runtime-ceiling-reached",
  "render-deferred"];
const CONDITION = [...LOOK_CONDITION, "action-clock-overdue"];
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
  // N375: the self-registered key is an OBLIGATION whose sentence says what happened and what may be done
  assert.match(QUEUE_OBLIGATION_KINDS["signer-self-registered"], /registered their own signing key; you may revoke it/);
  // the Action layer's kinds (K608, K611, K614): each sentence says what came and what a member does about it
  assert.match(QUEUE_OBLIGATION_KINDS["plan-checkpoint-due"], /checkpoint your group set in an action plan has come; a member judges whether its condition was met/);
  assert.match(QUEUE_OBLIGATION_KINDS["escalation-stage-proposed"], /next stage is proposed because its trigger was met; a member advances it or declines with a reason/);
  assert.match(QUEUE_OBLIGATION_KINDS["action-reminder"], /reminder you asked for on one of the group's action deadlines; answer it with another reminder or none/);
  // K899 (7), DEC-61: the litigation hold says what was marked and what a member records
  assert.match(QUEUE_OBLIGATION_KINDS["litigation-hold"], /a reply the group marked as legal pressure: consider whether to place a litigation hold, and record it in place or released with a reason/);
  // K921: the review request and the local fact say what is owed, each with its own door
  assert.match(QUEUE_OBLIGATION_KINDS["template-review-requested"], /a member asked you to review a filing template's version/);
  assert.match(QUEUE_OBLIGATION_KINDS["local-fact-due"], /a holiday calendar or office hours one of the group's deadlines reads is unconfirmed or due for confirmation/);
  // DEC-102 item 3: the unchosen credit level says what the edition reaches and what the member does
  assert.match(QUEUE_OBLIGATION_KINDS["attribution-unchosen"], /a case edition being prepared reaches an observation you authored and you have chosen no credit level for it; choose one/);
  assert.match(QUEUE_CONDITION_KINDS["action-clock-overdue"], /deadline on one of the group's actions passed while its entry is still pending/);
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

test("R5: the condition kinds are observation-log's vocabulary with action-clock-overdue, re-exported as QUEUE_CONDITION_KINDS", () => {
  assert.deepEqual(sorted(Object.keys(CONDITION_KINDS)), sorted(LOOK_CONDITION));
  // every one of observation-log's, with its own sentence, and action-clock-overdue beside them; nothing else
  for (const [k, s] of Object.entries(CONDITION_KINDS)) assert.equal(QUEUE_CONDITION_KINDS[k], s, k);
  assert.deepEqual(sorted(Object.keys(QUEUE_CONDITION_KINDS)), sorted([...Object.keys(CONDITION_KINDS), "action-clock-overdue"]));
  assert.equal(Object.keys(QUEUE_CONDITION_KINDS).length, 13);
  assert.ok(!("action-clock-overdue" in CONDITION_KINDS), "observation-log's list is not changed: no look carries it");
  assert.ok(Object.isFrozen(QUEUE_CONDITION_KINDS));
  for (const k of Object.keys(QUEUE_CONDITION_KINDS)) assert.equal(classOfKind(k), "CONDITION", k);
});

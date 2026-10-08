/* op-grades: T37's grades (R27) and the phone rule read from the Irreversible weight (R18, R26), at the module's exports.
   The ops T37 declares — case-carriage's photo marks, credentials' own password change and subscription sign-in, and
   instance-setup's translation of the interface — each graded by R5 and R3. */
import test from "node:test";
import assert from "node:assert/strict";
import { RUNGS, RUNG_ABSENT, NON_ACTS, MACHINE_REFUSALS, CONSEQUENCE_STATEMENTS, IRREVERSIBLE_WEIGHT, LARGER_SCREEN_ACTS,
         OP_ALIASES, phoneOf } from "../../../src/op-grades/index.mjs";
import { T37_RUNGS, T37_RUNG_ABSENT, T37_NON_ACTS } from "../../../src/op-grades/t37.mjs";

const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? RUNGS[op] : Object.hasOwn(RUNG_ABSENT, op) ? RUNG_ABSENT[op].ground : null;
const isRead = (op) => NON_ACTS[op].startsWith("read: ") && /writes nothing$/.test(NON_ACTS[op]) && NON_ACTS[op].length > 30;

/* ---- R27 ----------------------------------------------------------------------------------------------------------- */
const R27_WRITES = { obscuremark: "undetermined", setpassword: "caller-owned", subscriptionsignin: "credential",
  translationgrant: "credential", translationdraft: "undetermined", translationmark: "undetermined",
  translationadopt: "reversible", translationconfirm: "reversible", translationrevert: "reversible" };
const R27_READS = ["photomarks", "translations", "interfacewords"];
const WORD = "translation-directed: keyed by a language and an interface word; the group's own wording of Civicsmith's "
  + "words, shown to members reading that language; moves no bundle";
const R27_REASONS = {
  obscuremark: "photo-directed: keyed by a photo's capture, reached from the Photos step; a member's mark of areas to "
    + "obscure in the published copy, append-only; moves no bundle",
  setpassword: "session-directed: the caller's own password, the role from their session; ends their other sessions; "
    + "moves no bundle",
  subscriptionsignin: "credential: a member's own sign-in to their own Claude subscription, in their own runner; no login "
    + "held here; moves no bundle",
  translationgrant: "setting: a named member's grant for one language, an administrator's act; moves no bundle",
  translationdraft: "translation-directed: keyed by a language and interface words; drafts labelled machine work for a "
    + "granted speaker to check (`to_language`), or an administrator's back-translation of one protected word that "
    + "writes nothing (`to_english`); moves no bundle",
  translationadopt: WORD, translationconfirm: WORD, translationrevert: WORD, translationmark: WORD,
};

test("R27: T37's ops — obscuremark, translationdraft and translationmark `undetermined`, setpassword `caller-owned`, "
   + "subscriptionsignin and translationgrant `credential`, translationadopt, translationconfirm and translationrevert "
   + "`reversible` — each with R27's reason; the reads photomarks, translations and interfacewords `read:` and ungraded; "
   + "none a machine refusal; subscriptionsignin and translationgrant off the phone, every other a phone act", () => {
  const got = Object.fromEntries(Object.keys(R27_WRITES).map((op) => [op, gradeOf(op)]));
  assert.deepEqual(got, R27_WRITES);
  /* each beside the op R27 names as its precedent */
  for (const [op, like] of [["setpassword", "signout"], ["subscriptionsignin", "subscriptiondisconnect"],
    ["translationgrant", "wizardeditorgrant"], ["translationdraft", "whatchangedpropose"]])
    assert.equal(gradeOf(op), gradeOf(like), `${op} as ${like}`);
  for (const [op, e] of Object.entries(T37_RUNG_ABSENT)) assert.ok(typeof e.is === "string" && e.is.length > 40, op);
  assert.deepEqual(Object.keys(R27_REASONS).sort(), Object.keys(R27_WRITES).sort());
  for (const [op, why] of Object.entries(R27_REASONS)) assert.equal(NON_ACTS[op], why, op);
  for (const op of R27_READS) { assert.ok(isRead(op), op); assert.equal(gradeOf(op), null, op); }
  /* none is a capture act (`capture-directed:` would enrol it in affordances' CAPTURE_ACTS) */
  for (const op of [...Object.keys(R27_WRITES), ...R27_READS]) assert.ok(!NON_ACTS[op].startsWith("capture-directed:"), op);
  assert.deepEqual([...Object.keys(R27_WRITES), ...R27_READS].filter((op) => Object.hasOwn(MACHINE_REFUSALS, op)), []);
  const offPhone = Object.keys(R27_WRITES).filter((op) => !phoneOf(op)).sort();
  assert.deepEqual(offPhone, ["subscriptionsignin", "translationgrant"]);
  /* no vocabulary or statement is added */
  for (const op of [...Object.keys(R27_WRITES), ...R27_READS]) {
    assert.ok(!Object.hasOwn(CONSEQUENCE_STATEMENTS, op), op);
    assert.ok(!IRREVERSIBLE_WEIGHT.includes(op), op);
    assert.ok(!LARGER_SCREEN_ACTS.includes(op), op);
  }
  /* negative control */
  assert.notDeepEqual({ ...got, translationrevert: "reasoned" }, R27_WRITES);
});

test("R27: T37's tables hold exactly these ops, none both graded and stated absent", () => {
  assert.deepEqual(Object.keys(T37_RUNGS).sort(), ["translationadopt", "translationconfirm", "translationrevert"]);
  assert.deepEqual([...Object.keys(T37_RUNGS), ...Object.keys(T37_RUNG_ABSENT)].sort(), Object.keys(R27_WRITES).sort());
  assert.deepEqual(Object.keys(T37_NON_ACTS).sort(), [...Object.keys(R27_WRITES), ...R27_READS].sort());
  assert.deepEqual(Object.keys(T37_RUNGS).filter((op) => Object.hasOwn(RUNG_ABSENT, op)), []);
  assert.deepEqual(Object.keys(T37_RUNG_ABSENT).filter((op) => Object.hasOwn(RUNGS, op)), []);
});

/* ---- R18, R26 ------------------------------------------------------------------------------------------------------ */
test("R18 R26 (T37; DEC-181): phoneOf answers false for every op in IRREVERSIBLE_WEIGHT and for every alias of one, "
   + "standardrelease among them; LARGER_SCREEN_ACTS holds filingsent alone and shares no op with IRREVERSIBLE_WEIGHT", () => {
  assert.ok(IRREVERSIBLE_WEIGHT.length >= 5);
  for (const op of IRREVERSIBLE_WEIGHT) assert.equal(phoneOf(op), false, op);
  for (const [alias, op] of Object.entries(OP_ALIASES))
    if (IRREVERSIBLE_WEIGHT.includes(op)) assert.equal(phoneOf(alias), false, alias);
  for (const op of ["publish", "publishat", "publishatmove", "personexpunge", "standardrelease"])
    assert.ok(IRREVERSIBLE_WEIGHT.includes(op), op);
  /* two of the set are `reasoned`: only the weight keeps them off the phone */
  assert.deepEqual([RUNGS.personexpunge, RUNGS.standardrelease], ["reasoned", "reasoned"]);
  assert.deepEqual([phoneOf("personexpunge"), phoneOf("standardrelease")], [false, false]);
  assert.deepEqual([...LARGER_SCREEN_ACTS], ["filingsent"]);
  assert.deepEqual(LARGER_SCREEN_ACTS.filter((op) => IRREVERSIBLE_WEIGHT.includes(op)), []);
  /* negative control: a reasoned op outside both sets stays a phone act */
  assert.equal(phoneOf("releasescanhold"), true);
});

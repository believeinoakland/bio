/* op-grades: T36's grades (R23–R26), at the module's exports. The five ops K2092 adds, the 23 ops of `file-safety`
   (with `openwithwarning`'s DEC-173 statement), `credentials`' keep-away with `assistantset` retired (its code re-coded in T37), and
   `personexpunge` kept for a larger screen (DEC-170, through IRREVERSIBLE_WEIGHT since DEC-181); each graded by R5 and R3. */
import test from "node:test";
import assert from "node:assert/strict";
import { RUNGS, RUNG_ABSENT, NON_ACTS, MACHINE_REFUSALS, JUSTIFICATION_REFUSALS, CONSEQUENCE_STATEMENTS, IRREVERSIBLE_WEIGHT,
         LARGER_SCREEN_ACTS, phoneOf } from "../../../src/op-grades/index.mjs";
import { T36_RUNGS, T36_RUNG_ABSENT, T36_NON_ACTS, T36_CONSEQUENCE_STATEMENTS } from "../../../src/op-grades/t36.mjs";

const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? RUNGS[op] : Object.hasOwn(RUNG_ABSENT, op) ? RUNG_ABSENT[op].ground : null;
const isRead = (op) => NON_ACTS[op].startsWith("read: ") && /writes nothing$/.test(NON_ACTS[op]) && NON_ACTS[op].length > 30;

/* ---- R23 ----------------------------------------------------------------------------------------------------------- */
const R23_WRITES = { standardinforcethrough: "reasoned", standardinforcethroughwithdraw: "reasoned", spotcheckvisit: "reasoned" };
const R23_CODES = { standardinforcethrough: "STANDARD_NO_REASON", standardinforcethroughwithdraw: "STANDARD_NO_REASON",
  spotcheckvisit: "NOT_TESTIMONY" };
const R23_READS = ["inforcethroughof", "spotcheck"];
const STANDARD_THROUGH = "standard-directed: keyed by a standard's version, reached from the standard; records what a "
  + "checked source shows, with who, when and why; moves no bundle";

test("R23: K2092's five ops — standardinforcethrough, standardinforcethroughwithdraw and spotcheckvisit `reasoned`, each "
   + "backed by its owner's code in JUSTIFICATION_REFUSALS (NOT_TESTIMONY joining), each with R23's reason; the reads "
   + "inforcethroughof and spotcheck `read:` and ungraded; none a machine refusal; the three acts phone acts", () => {
  const got = Object.fromEntries(Object.keys(R23_WRITES).map((op) => [op, gradeOf(op)]));
  assert.deepEqual(got, R23_WRITES);
  for (const [op, code] of Object.entries(R23_CODES)) assert.ok(JUSTIFICATION_REFUSALS.includes(code), `${op}: ${code}`);
  assert.equal(NON_ACTS.standardinforcethrough, STANDARD_THROUGH);
  assert.equal(NON_ACTS.standardinforcethroughwithdraw, STANDARD_THROUGH);
  assert.equal(NON_ACTS.spotcheckvisit, "draw-directed: keyed by a draw and one drawn item, reached from the spot-check; "
    + "ties the visitor's own testimony to the item; moves no bundle");
  for (const op of R23_READS) { assert.ok(isRead(op), op); assert.equal(gradeOf(op), null, op); }
  assert.deepEqual([...Object.keys(R23_WRITES), ...R23_READS].filter((op) => Object.hasOwn(MACHINE_REFUSALS, op)), []);
  assert.deepEqual(Object.keys(R23_WRITES).map(phoneOf), [true, true, true]);
  /* negative control */
  assert.notDeepEqual({ ...got, spotcheckvisit: "undetermined" }, R23_WRITES);
});

/* ---- R24 ----------------------------------------------------------------------------------------------------------- */
/* the 23 ops of file-safety's ops map (`fileSafetyOps`), its own names */
const R24_WRITES = { releasescanhold: "reasoned", deepercheck: "undetermined", safecopyrequest: "undetermined",
  openoriginal: "observational", openwithwarning: "observational", scanbatch: "observational", deeperbatch: "observational",
  renderbatch: "substrate", securityforward: "substrate", securitytooladd: "credential", securitytoolremove: "credential",
  securitytooltest: "substrate" };
const R24_READS = ["verdictnotes", "threatof", "originalstate", "safeview", "safecopy", "scanstatus", "scanfindings",
  "findingkind", "securitytools", "securitytoolcatalogue", "securitytoolevents"];
const FILE_ASKED = "file-directed: keyed by a capture's digest; asks the group's outside tools about this file; records "
  + "no one";
const TOOLS = "setting: the group's security tools, an administrator's act; moves no bundle";
const WAKES = "scheduler: the security wakes; name no member and move no bundle";
const R24_REASONS = {
  openoriginal: "file-directed: keyed by a capture's digest, reached from the safe view's one click; answers the "
    + "original's bytes to a member who may see it, a high-risk file only after a fresh clean deeper check (`override`); "
    + "records no one",
  openwithwarning: "file-directed: keyed by a capture's digest, reached from the warning before opening; answers a "
    + "high-risk original after the member's two confirmations, never under a scan hold; records no one and keeps no "
    + "confirmation",
  deepercheck: FILE_ASKED, safecopyrequest: FILE_ASKED,
  releasescanhold: "file-directed: keyed by a capture's digest under a scan hold, reached from the held file; one "
    + "member's reasoned act of two, never a machine's; moves no bundle",
  securitytooladd: TOOLS, securitytooltest: TOOLS, securitytoolremove: TOOLS,
  scanbatch: WAKES, renderbatch: WAKES, deeperbatch: WAKES, securityforward: WAKES,
};

test("R24: the 23 ops of file-safety — releasescanhold `reasoned` on HOLD_NO_REASON; deepercheck, safecopyrequest "
   + "`undetermined`; the openings and the scan and deeper batches `observational`; renderbatch, securityforward, "
   + "securitytooltest `substrate`; tool add and remove `credential`; the 11 reads `read:` — each with R24's reason, none "
   + "a machine refusal, and only tool add and remove kept off the phone", () => {
  assert.equal(Object.keys(R24_WRITES).length + R24_READS.length, 23);
  const got = Object.fromEntries(Object.keys(R24_WRITES).map((op) => [op, gradeOf(op)]));
  assert.deepEqual(got, R24_WRITES);
  assert.ok(JUSTIFICATION_REFUSALS.includes("HOLD_NO_REASON"));
  assert.notEqual("HOLD_NO_REASON", "HOLD_REFUSED");
  /* each beside the op R24 names as its precedent */
  for (const [op, like] of [["renderbatch", "taskdrain"], ["securityforward", "taskdrain"],
    ["securitytooladd", "keyedserviceset"], ["securitytooladd", "groupkeyset"], ["securitytoolremove", "groupkeyremove"],
    ["securitytooltest", "keyedserviceswitch"]]) assert.equal(gradeOf(op), gradeOf(like), `${op} as ${like}`);
  for (const [op, e] of Object.entries(T36_RUNG_ABSENT)) assert.ok(e.is.length > 40, op);
  assert.deepEqual(Object.keys(R24_REASONS).sort(), Object.keys(R24_WRITES).sort());
  for (const [op, why] of Object.entries(R24_REASONS)) assert.equal(NON_ACTS[op], why, op);
  for (const op of R24_READS) { assert.ok(isRead(op), op); assert.equal(gradeOf(op), null, op); }
  /* none is a capture act (`capture-directed:` would enrol it in affordances' CAPTURE_ACTS) */
  for (const op of [...Object.keys(R24_WRITES), ...R24_READS]) assert.ok(!NON_ACTS[op].startsWith("capture-directed:"), op);
  assert.deepEqual([...Object.keys(R24_WRITES), ...R24_READS].filter((op) => Object.hasOwn(MACHINE_REFUSALS, op)), []);
  const offPhone = Object.keys(R24_WRITES).filter((op) => !phoneOf(op)).sort();
  assert.deepEqual(offPhone, ["securitytooladd", "securitytoolremove"]);
  /* negative control */
  assert.notDeepEqual({ ...got, openwithwarning: "reasoned" }, R24_WRITES);
});

test("R24 R4 (DEC-173 (2)): openwithwarning carries a frozen dialog statement beside its `observational` ground: high "
   + "risk for the reasons shown beside it, what opening risks (own device, its protections, the sign-in to the group), "
   + "the two confirmations verbatim, and that who opens or confirmed is never recorded; no rung is added", () => {
  const e = CONSEQUENCE_STATEMENTS.openwithwarning;
  assert.equal(e, T36_CONSEQUENCE_STATEMENTS.openwithwarning, "the same object, published by reference");
  assert.ok(Object.isFrozen(e));
  assert.deepEqual(Object.keys(e), ["friction", "statement"]);
  assert.equal(e.friction, "dialog");
  for (const part of [/high risk/, /reasons shown beside this/, /your own device/, /that device's protections/,
    /your sign-in to the group/, /"I will open it on my own device, not a shared one"/,
    /"I will not enable macros or editing"/, /Who opens which file, and who confirmed, is never recorded/])
    assert.match(e.statement, part);
  assert.equal(gradeOf("openwithwarning"), "observational");
  assert.ok(!Object.hasOwn(RUNGS, "openwithwarning"));
  assert.ok(!IRREVERSIBLE_WEIGHT.includes("openwithwarning"));
});

/* ---- R25 ----------------------------------------------------------------------------------------------------------- */
test("R25: aikeepaway `reasoned` on AI_KEEP_AWAY_NO_REASON (T37: credentials R51's own code, C-29.32), NO_REASON "
   + "staying for the other ops, with its setting reason; aikeepawaystate `read:`; neither a machine refusal; "
   + "securitycount ungraded; assistantset retired from RUNG_ABSENT and NON_ACTS", () => {
  assert.equal(gradeOf("aikeepaway"), "reasoned");
  assert.ok(JUSTIFICATION_REFUSALS.includes("AI_KEEP_AWAY_NO_REASON"));
  assert.ok(JUSTIFICATION_REFUSALS.includes("NO_REASON"), "NO_REASON stays for the ops that still answer it");
  assert.equal(JUSTIFICATION_REFUSALS.filter((c) => c === "AI_KEEP_AWAY_NO_REASON").length, 1);
  assert.equal(NON_ACTS.aikeepaway, "setting: whether the group keeps its material away from every assistant, an "
    + "administrator's act with a reason; moves no bundle");
  assert.ok(isRead("aikeepawaystate"));
  assert.equal(gradeOf("aikeepawaystate"), null);
  assert.ok(!Object.hasOwn(MACHINE_REFUSALS, "aikeepaway") && !Object.hasOwn(MACHINE_REFUSALS, "aikeepawaystate"));
  assert.equal(gradeOf("securitycount"), null);
  assert.ok(!Object.hasOwn(NON_ACTS, "securitycount"));
  for (const t of [RUNGS, RUNG_ABSENT, NON_ACTS, MACHINE_REFUSALS]) assert.ok(!Object.hasOwn(t, "assistantset"));
  assert.equal(gradeOf("assistantset"), null);
  assert.equal(phoneOf("aikeepaway"), true);
});

test("R23 R24 R25: T36's tables hold exactly these ops, none both graded and stated absent", () => {
  assert.deepEqual(Object.keys(T36_RUNGS).sort(),
    ["aikeepaway", "releasescanhold", "spotcheckvisit", "standardinforcethrough", "standardinforcethroughwithdraw"]);
  assert.deepEqual([...Object.keys(T36_RUNGS), ...Object.keys(T36_RUNG_ABSENT)].sort(),
    [...Object.keys(R23_WRITES), ...Object.keys(R24_WRITES), "aikeepaway"].sort());
  assert.deepEqual(Object.keys(T36_NON_ACTS).sort(), [...Object.keys(R23_WRITES), ...R23_READS, ...Object.keys(R24_WRITES),
    ...R24_READS, "aikeepaway", "aikeepawaystate"].sort());
  assert.deepEqual(Object.keys(T36_RUNGS).filter((op) => Object.hasOwn(RUNG_ABSENT, op)), []);
  assert.deepEqual(Object.keys(T36_CONSEQUENCE_STATEMENTS), ["openwithwarning"]);
});

/* ---- R26 ----------------------------------------------------------------------------------------------------------- */
test("R26 R18 (T37; DEC-181, replacing DEC-170): personexpunge leaves LARGER_SCREEN_ACTS, which holds filingsent alone, "
   + "and phoneOf still answers false for it through IRREVERSIBLE_WEIGHT; no op is in both sets; its `reasoned` rung, its "
   + "Irreversible weight and its consequence statement are unchanged", () => {
  assert.ok(Object.isFrozen(LARGER_SCREEN_ACTS));
  assert.deepEqual([...LARGER_SCREEN_ACTS], ["filingsent"]);
  assert.deepEqual(LARGER_SCREEN_ACTS.filter((op) => IRREVERSIBLE_WEIGHT.includes(op)), []);
  assert.equal(phoneOf("personexpunge"), false);
  assert.equal(RUNGS.personexpunge, "reasoned");
  assert.ok(IRREVERSIBLE_WEIGHT.includes("personexpunge"));
  assert.equal(CONSEQUENCE_STATEMENTS.personexpunge.friction, "dialog");
  /* R18 (T37): standardrelease, in IRREVERSIBLE_WEIGHT, moves from true to false; a reasoned act outside both stays */
  assert.equal(phoneOf("standardrelease"), false);
  assert.equal(phoneOf("releasescanhold"), true);
});

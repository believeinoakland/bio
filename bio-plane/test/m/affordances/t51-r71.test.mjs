/* affordances, T51 fix round 10 (R71; DEC-438 to DEC-441, U481 to U484, K5303): act help for the ops those decisions draw.
   The walker's case: Standard draws four acts in folds and Matter a fifth, each beside a line that says what it does, read from the
   answer of `op=affordances` with no target (R49), which is the one place a screen reads `act.<op>.does` from. */
import test from "node:test";
import assert from "node:assert/strict";
import * as A from "../../../src/affordances.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { DECLARED_OPS as CITATION_OPS } from "../../../src/citation/index.mjs";
import { DECLARED_OPS as CREDENTIAL_OPS } from "../../../src/credentials/index.mjs";
import { T51_STANDARD_OPS, T51_STANDIN_OPS, T51_STANDIN_HELP } from "../../../src/affordances/act-help.mjs";

const gate = { needs: () => null, mode: () => "session" };
const answered = () => affordancesHelp();
const affordancesHelp = () => A.affordancesAnswer({ kinds: [], gate }).act_help;

const STANDARD_OPS = ["standardinforcethrough", "standardinforcethroughwithdraw", "standardadoption", "standardimpose", "standardbenchmark"];

test("R71: the answer with no target explains each of the five Standard acts (DEC-438) by its `act.<op>.does` word, none empty", () => {
  const help = answered();
  assert.deepEqual([...T51_STANDARD_OPS].sort(), [...STANDARD_OPS].sort());
  for (const op of STANDARD_OPS) {
    assert.ok(hasWord(`act.${op}.does`), `${op}: the word list holds its sentence`);
    assert.equal(A.ACT_HELP_KEYS[op], `act.${op}.does`, op);
    assert.equal(help[op], word(`act.${op}.does`), op);
    assert.ok(typeof help[op] === "string" && help[op].trim().length > 0, op);
  }
});

test("R71: `leggrade` (citation R24, merged) is explained under `act.leggrade.does`: the word list's sentence once it holds one, until then a "
   + "plain default that names the grade, its ceiling and its reason", () => {
  const help = answered();
  assert.equal(A.ACT_HELP_KEYS.leggrade, "act.leggrade.does");
  assert.ok(typeof help.leggrade === "string" && help.leggrade.trim().length > 0);
  if (hasWord("act.leggrade.does")) assert.equal(help.leggrade, word("act.leggrade.does"));
  else {
    assert.ok(T51_STANDIN_OPS.includes("leggrade"));
    assert.equal(help.leggrade, T51_STANDIN_HELP.leggrade);
    for (const part of [/grade/i, /\bA to D\b/, /reason/i, /ceiling|no higher|cannot be higher/i]) assert.match(help.leggrade, part);
  }
  /* the real op: declared, a member's act, and its help is the one answer a screen reads (R49) */
  assert.ok(Object.hasOwn(CITATION_OPS, "leggrade") && CITATION_OPS.leggrade.classes.includes("member"), "citation declares op=leggrade, a member's act");
});

test("R71: `signerknown` (credentials R83, merged) is explained under `act.signerknown.does`: the word list's sentence once it holds one, until then "
   + "a plain default naming the administrator, the self-registered key and that nothing else changes", () => {
  const help = answered();
  assert.ok(Object.hasOwn(CREDENTIAL_OPS, "signerknown"), "credentials declares op=signerknown");
  assert.equal(A.ACT_HELP_KEYS.signerknown, "act.signerknown.does");
  if (hasWord("act.signerknown.does")) assert.equal(help.signerknown, word("act.signerknown.does"));
  else {
    assert.ok(T51_STANDIN_OPS.includes("signerknown"));
    assert.equal(help.signerknown, T51_STANDIN_HELP.signerknown);
    for (const part of [/administrator/i, /key/i, /self|own|registered/i, /nothing else/i]) assert.match(help.signerknown, part);
  }
});

test("R71 control: an op absent from the list answers none, and the table is one entry per op (no alias, no owed_ key)", () => {
  const help = answered();
  for (const op of ["strengthbar", "notanop", "standardinforcethroughx"]) assert.equal(Object.hasOwn(help, op), false, op);
  assert.deepEqual(Object.keys(help).filter((k) => k.startsWith("owed_")), []);
  assert.equal(new Set(Object.keys(help)).size, Object.keys(help).length);
  assert.ok(Object.isFrozen(A.ACT_HELP));
  assert.equal(help, A.ACT_HELP, "the very object (R49)");
});

/* affordances, T36 (T36-31; N726, DEC-174 (3), DEC-99; T37-27: N776, DEC-182): R48, the one table of what each act does, checked against the
   design stream's own file entry by entry, and R49, its publication in the answer with no target, the very object. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as A from "../../../src/affordances.mjs";
import * as G from "../../../src/op-grades/index.mjs";

const { ACT_HELP, affordancesAnswer } = A;
const DESIGN_FILE = new URL("../../../../docs/development/ux-substrate/screens/mock-acts.js", import.meta.url);
/* PR #14's file (`e08cd35ecb`), byte-identical on the tranche: a plain script declaring `const ACT_HELP`. */
const DESIGN = new Function(readFileSync(DESIGN_FILE, "utf8") + "; return ACT_HELP;")();

/* R48's named keys, re-stated from the file at `e08cd35ecb` (T37-27). PR #14 withdrew the five op-less texts and
   `claimidentity`'s, and dropped `assistantset` (DEC-182 (1)–(3)): none is in the design, and none is held. */
const WITHDRAWN = ["projectcreated", "countask", "registerproceeding", "deadlinecompute", "claimidentity"];
const RETIRED = ["assistantset"];
const OWED_DECLARED_IN_T36 = ["aikeepaway", "openoriginal", "openwithwarning", "safeview", "deepercheck", "releasescanhold",
  "securitytooladd", "securitytooltest", "securitytoolremove", "archivelist", "findin", "groupdescriptiondraft",
  "memberlanguageset", "notedelete", "noterevise", "publishat", "securitymap", "startfrom", "writinghelp"];
/* The owed acts op-declarations does not declare as this job merges (T37-31, after it, declares all but
   `infolevelset`): held under `owed_<op>` until then, as R48 reads them. */
const OWED_UNDECLARED = ["infolevelset", "subscriptionsignin", "obscuremark", "setpassword", "translationgrant",
  "translationdraft", "translationadopt", "translationconfirm", "translationrevert"];
/* The design's ops that no `NEEDS` row gates (reads and doors before a session: the install, the self-test, the
   invitation, the searches, the public reads), so `op-grades`' gated totality names none of them. */
const UNGATED = ["bootstrap", "selftest", "hostingaccess", "invitelook", "search", "frontier", "verify", "publishedcase"];

const { OP_ALIASES } = G;
const gradedOrPublished = (op) => [G.RUNGS, G.RUNG_ABSENT, G.NON_ACTS].some((t) => Object.hasOwn(t, op))
  || [...A.ACTS, ...A.CAPTURE_ACTS, ...A.PER_ITEM_ACTS].some((a) => a.id === op);

/* R48's reading of a design key: the key it is held under. */
const heldAs = (k) => {
  if (k.startsWith("owed_")) return OWED_DECLARED_IN_T36.includes(k.slice(5)) ? k.slice(5) : k;
  return Object.hasOwn(OP_ALIASES, k) ? OP_ALIASES[k] : k;
};

test("R48: ACT_HELP is a frozen module constant holding exactly the design's 203 texts (PR #14, e08cd35ecb), verbatim, "
   + "each under the key R48 reads it as, in the design's order: aliases under their op, the nineteen owed acts declared "
   + "in T36 under their op, the nine still undeclared under owed_<op>; the withdrawn texts and assistantset nowhere", () => {
  assert.ok(Object.isFrozen(ACT_HELP));
  assert.equal(Object.keys(DESIGN).length, 203);
  for (const k of [...WITHDRAWN, ...RETIRED]) {
    assert.equal(Object.hasOwn(DESIGN, k), false, `${k} is withdrawn from the design`);
    assert.equal(Object.hasOwn(ACT_HELP, k), false, `${k} is not held`);
  }
  const expected = Object.entries(DESIGN).map(([k, text]) => [heldAs(k), text]);
  assert.deepEqual(Object.entries(ACT_HELP), expected);
  /* the arithmetic: every one of the 203 held, no two under one key */
  assert.equal(Object.keys(ACT_HELP).length, 203);
  assert.equal(new Set(expected.map(([k]) => k)).size, 203);
  for (const t of Object.values(ACT_HELP)) assert.ok(typeof t === "string" && t.trim().length > 0);
  /* DEC-182 (1), (4) and DEC-180: `clockpropose` has its own text; setpassword and obscuremark are owed */
  assert.equal(ACT_HELP.clockpropose, DESIGN.clockpropose);
  assert.equal(ACT_HELP.owed_setpassword, DESIGN.owed_setpassword);
  assert.equal(ACT_HELP.owed_obscuremark, DESIGN.owed_obscuremark);
});

test("R48: no key is an alias or a retired op; every alias the design explains is answered by its op's entry; the owed_ "
   + "keys are exactly the nine owed acts op-declarations does not yet declare, none under a T36-declared op; every other "
   + "key is an op op-grades grades or names, or one of the design's ungated ops", () => {
  const keys = Object.keys(ACT_HELP);
  for (const k of keys) {
    assert.equal(Object.hasOwn(OP_ALIASES, k), false, `${k} is no alias`);
    assert.ok(![...WITHDRAWN, ...RETIRED].includes(k), `${k} is not held`);
  }
  /* each alias the design explains is answered by its op's entry, never as a second one */
  for (const [a, op] of Object.entries(OP_ALIASES)) if (Object.hasOwn(DESIGN, a)) assert.ok(Object.hasOwn(ACT_HELP, op), `${a} → ${op}`);
  assert.equal(ACT_HELP.identityclaim, DESIGN.identityclaim);
  /* owed keys: only those still owed (op-grades grades some of them before op-declarations declares them, T37-26) */
  const owed = keys.filter((k) => k.startsWith("owed_"));
  assert.deepEqual(owed.sort(), OWED_UNDECLARED.map((op) => `owed_${op}`).sort());
  for (const op of OWED_UNDECLARED) assert.equal(Object.hasOwn(ACT_HELP, op), false, `${op} is held only as owed_${op}`);
  for (const op of OWED_DECLARED_IN_T36) assert.equal(Object.hasOwn(ACT_HELP, `owed_${op}`), false, op);
  /* every other key is an op */
  for (const k of keys.filter((k) => !k.startsWith("owed_")))
    assert.ok(gradedOrPublished(k) || UNGATED.includes(k), `${k} is an op op-grades grades or names`);
  for (const k of UNGATED) assert.equal(gradedOrPublished(k), false, `${k} is ungated`);
});

const gate = { needs: () => null, mode: () => "session" };
const facts = { ok: true, target: "inquiry-1", object_type: "inquiry", declared_type: "inquiry", current_state: "open" };

test("R49: the answer with no target carries act_help, ACT_HELP itself (the same reference, never a copy); a targeted "
   + "answer and a refusal do not carry it", () => {
  const none = affordancesAnswer({ kinds: [], gate });
  assert.equal(none.target, null);
  assert.equal(none.act_help, ACT_HELP);
  const one = affordancesAnswer({ target: "inquiry-1", facts, kinds: [], gate });
  assert.equal(one.target, "inquiry-1");
  assert.equal(Object.hasOwn(one, "act_help"), false);
  const refused = affordancesAnswer({ target: "x", facts: { ok: false, reason: "NO_SUCH_BUNDLE" }, kinds: [], gate });
  assert.equal(Object.hasOwn(refused, "act_help"), false);
});

test("R49 at the door: op=affordances with no target answers act_help as ACT_HELP itself, and with a target without it", async () => {
  const stub = { fetch: async (u) => u };
  const doAnswer = async (u) => {
    u = await u;
    if (u.startsWith("http://do/actionkinds")) return { answered: true, result: { kinds: [] } };
    if (u.startsWith("http://do/affordancescreens")) return { answered: true, result: { screens: [], wizard_scripts: [] } };
    return { answered: true, result: facts };
  };
  const json = (body, status) => ({ body, status });
  const env = { json, doAnswer, storeSilent: () => ({ silent: true }), storeRefusal: () => ({ refused: true }), gate,
    viewer: "m1", identity: "m1", author: "m1", by: "m1", storeName: "s", cls: "member" };
  const a = await A.affordancesOp(new URL("http://x/?op=affordances"), stub, env);
  assert.equal(a.status, 200);
  assert.equal(a.body.result.act_help, ACT_HELP);
  const b = await A.affordancesOp(new URL("http://x/?op=affordances&target=inquiry-1"), stub, env);
  assert.equal(b.status, 200);
  assert.equal(Object.hasOwn(b.body.result, "act_help"), false);
});

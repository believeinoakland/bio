/* affordances, T36 (T36-31; N726, DEC-174 (3), DEC-99; T37-27: N776, DEC-182; T38-31: DEC-183, K2300; T41-52: DEC-188 (7), (8), U145, K2484): R48,
   the one table of what each act does, checked against the design stream's own file entry by entry, and R49, its publication in the answer with
   no target, the very object. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as A from "../../../src/affordances.mjs";
import * as G from "../../../src/op-grades/index.mjs";

const { ACT_HELP, affordancesAnswer } = A;
const DESIGN_FILE = new URL("../../../../docs/development/ux-substrate/screens/mock-acts.js", import.meta.url);
/* PR #19's file (`3660c18803`), byte-identical on the tranche: a plain script declaring `const ACT_HELP`. */
const DESIGN = new Function(readFileSync(DESIGN_FILE, "utf8") + "; return ACT_HELP;")();

/* R48's named keys, re-stated from the file at `3660c18803` (T41-52; before it `c848b56671`, T38-31; `e08cd35ecb`, T37-27). PR #14 withdrew the
   five op-less texts and `claimidentity`'s, and dropped `assistantset` (DEC-182 (1)–(3)): none is in the design, and none is held. */
const WITHDRAWN = ["projectcreated", "countask", "registerproceeding", "deadlinecompute", "claimidentity"];
const RETIRED = ["assistantset"];
/* DEC-188 (8): ops retired in T41 (to `accountusesset`, `ailimitset`) whose texts the file still gives; no longer declared, so not held. */
const RETIRED_IN_T41 = ["aiceilingset", "aicopyceilingset", "accountswitchset", "groupswitchset"];
const OWED_DECLARED_IN_T36 = ["aikeepaway", "openoriginal", "openwithwarning", "safeview", "deepercheck", "releasescanhold",
  "securitytooladd", "securitytooltest", "securitytoolremove", "archivelist", "findin", "groupdescriptiondraft",
  "memberlanguageset", "notedelete", "noterevise", "publishat", "securitymap", "startfrom", "writinghelp"];
/* The owed acts op-declarations declares in T37 (T37-31, K2249), held under their ops since; and the one it does not
   declare, held under `owed_<op>` (R48). */
const OWED_DECLARED_IN_T37 = ["subscriptionsignin", "setpassword", "obscuremark", "translationgrant", "translationdraft",
  "translationadopt", "translationconfirm", "translationrevert"];
/* The owed act op-declarations declares in T38 (T38-15, its R40), PR #15's new text (DEC-183 (2)), held under its op. */
const OWED_DECLARED_IN_T38 = ["obscuremarkwithdraw"];
/* The owed acts op-declarations declares in T41 (its R41, DEC-188 (7); its R42, the handle ops), PR #19's new texts, held under their ops. */
const OWED_DECLARED_IN_T41 = ["accountusesset", "ailimitset", "projectkeyset", "projectsigninset", "projectaccountswitch",
  "projectaccountremove", "projectkeynoticeseen", "projectaikeepaway", "exploreapprove", "handlechange", "handlecheck"];
const OWED_DECLARED = [...OWED_DECLARED_IN_T36, ...OWED_DECLARED_IN_T37, ...OWED_DECLARED_IN_T38, ...OWED_DECLARED_IN_T41];
const OWED_UNDECLARED = ["infolevelset"];
/* The design's ops that no `NEEDS` row gates (reads and doors before a session: the install, the self-test, the
   invitation, the searches, the public reads), so `op-grades`' gated totality names none of them. */
const UNGATED = ["bootstrap", "selftest", "hostingaccess", "invitelook", "search", "frontier", "verify", "publishedcase"];

const { OP_ALIASES } = G;
const gradedOrPublished = (op) => [G.RUNGS, G.RUNG_ABSENT, G.NON_ACTS].some((t) => Object.hasOwn(t, op))
  || [...A.ACTS, ...A.CAPTURE_ACTS, ...A.PER_ITEM_ACTS].some((a) => a.id === op);

/* R48's reading of a design key: the key it is held under, or null when it is not held (a retired op). */
const heldAs = (k) => {
  if (RETIRED_IN_T41.includes(k)) return null;
  if (k.startsWith("owed_")) return OWED_DECLARED.includes(k.slice(5)) ? k.slice(5) : k;
  return Object.hasOwn(OP_ALIASES, k) ? OP_ALIASES[k] : k;
};
/* R48 as a check over a table: the design's entries R48 holds, each under its key, verbatim, in the design's order. */
const expected = () => Object.entries(DESIGN).flatMap(([k, text]) => (heldAs(k) === null ? [] : [[heldAs(k), text]]));
const meetsR48 = (table) => {
  try { assert.deepEqual(Object.entries(table), expected()); return true; } catch { return false; }
};

test("R48: ACT_HELP is a frozen module constant holding exactly the 211 of the design's 215 texts (PR #19, 3660c18803) R48 holds, verbatim, "
   + "each under the key R48 reads it as, in the design's order: aliases under their op, the nineteen owed acts declared "
   + "in T36, the eight declared in T37, obscuremarkwithdraw declared in T38 and the eleven declared in T41 (op-declarations R41, R42) under their op, "
   + "infolevelset still under owed_<op>; aikeepaway's and groupkeyset's texts as PR #19 re-words them; the retired aiceilingset, aicopyceilingset, "
   + "accountswitchset and groupswitchset, the withdrawn texts and assistantset nowhere; a table departing from any of these is seen (K874)", () => {
  assert.ok(Object.isFrozen(ACT_HELP));
  assert.equal(Object.keys(DESIGN).length, 215);
  for (const k of [...WITHDRAWN, ...RETIRED]) {
    assert.equal(Object.hasOwn(DESIGN, k), false, `${k} is withdrawn from the design`);
    assert.equal(Object.hasOwn(ACT_HELP, k), false, `${k} is not held`);
  }
  for (const k of RETIRED_IN_T41) {
    assert.ok(Object.hasOwn(DESIGN, k), `the design still gives ${k} a text`);
    assert.equal(Object.hasOwn(ACT_HELP, k), false, `${k} is retired and not held`);
    assert.equal(Object.hasOwn(ACT_HELP, `owed_${k}`), false, k);
  }
  assert.ok(meetsR48(ACT_HELP));
  /* the arithmetic: 215 in the design, four retired, every other one held, no two under one key */
  assert.equal(Object.keys(ACT_HELP).length, 211);
  assert.equal(new Set(expected().map(([k]) => k)).size, 211);
  for (const t of Object.values(ACT_HELP)) assert.ok(typeof t === "string" && t.trim().length > 0);
  /* DEC-182 (1), (4) and DEC-180: `clockpropose` has its own text; setpassword and obscuremark are owed */
  assert.equal(ACT_HELP.clockpropose, DESIGN.clockpropose);
  assert.equal(ACT_HELP.setpassword, DESIGN.owed_setpassword);
  assert.equal(ACT_HELP.obscuremark, DESIGN.owed_obscuremark);
  /* DEC-183 (2), credentials R3: PR #15's new texts, under their ops */
  assert.equal(ACT_HELP.obscuremarkwithdraw, DESIGN.owed_obscuremarkwithdraw);
  assert.match(ACT_HELP.setpassword, /^Changes your password\. Every other session signed in as you ends/);
  assert.equal(ACT_HELP.owed_infolevelset, DESIGN.owed_infolevelset);
  /* DEC-188 (7), U145: PR #19's eleven new texts, each under its op */
  for (const op of OWED_DECLARED_IN_T41) assert.equal(ACT_HELP[op], DESIGN[`owed_${op}`], op);
  assert.match(ACT_HELP.ailimitset, /^Sets or removes one limit on this account/);
  assert.match(ACT_HELP.handlecheck, /It never says who has a handle\.$/);
  /* PR #19's re-wordings: aikeepaway (its owed_ text) binds every account; groupkeyset pays last */
  assert.equal(ACT_HELP.aikeepaway, DESIGN.owed_aikeepaway);
  assert.match(ACT_HELP.aikeepaway, /^Keeps the group's material away from AI, for every use or the ones you choose\. It binds every account/);
  assert.equal(ACT_HELP.groupkeyset, DESIGN.groupkeyset);
  assert.match(ACT_HELP.groupkeyset, /It pays for a member's act when neither a project's account nor the member's own serves it\.$/);

  /* negative controls (K874): each way a table can depart from R48 is seen by the same check */
  const variants = {
    "a retired op's text held": { ...ACT_HELP, aiceilingset: DESIGN.aiceilingset },
    "a retired op's text held under owed_": { ...ACT_HELP, owed_groupswitchset: DESIGN.groupswitchset },
    "a T41 owed text held under owed_<op>": Object.fromEntries(Object.entries(ACT_HELP).map(([k, v]) => [k === "ailimitset" ? "owed_ailimitset" : k, v])),
    "a T41 owed text missing": Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== "handlecheck")),
    "aikeepaway's earlier text": { ...ACT_HELP, aikeepaway: "Stops every assistant in the group, the group's and members' own. Members see your reason on Settings › The assistant." },
    "groupkeyset's earlier text": { ...ACT_HELP, groupkeyset: "Holds one Anthropic API key for the group, sealed and never shown again. It serves members with no account of their own, at the group's cost." },
    "a text re-worded here": { ...ACT_HELP, exploreapprove: ACT_HELP.exploreapprove.replace("today", "now") },
    "the design's order lost": Object.fromEntries(Object.entries(ACT_HELP).reverse()),
  };
  for (const [what, table] of Object.entries(variants)) assert.equal(meetsR48(table), false, what);
});

test("R48: no key is an alias or a retired op; every alias the design explains is answered by its op's entry; the owed_ "
   + "keys are exactly the owed acts op-declarations does not declare (infolevelset), none under a T36-, T37-, T38- or T41-declared op; every other "
   + "key is an op op-grades grades or names, or one of the design's ungated ops", () => {
  const keys = Object.keys(ACT_HELP);
  for (const k of keys) {
    assert.equal(Object.hasOwn(OP_ALIASES, k), false, `${k} is no alias`);
    assert.ok(![...WITHDRAWN, ...RETIRED, ...RETIRED_IN_T41].includes(k), `${k} is not held`);
  }
  /* each alias the design explains is answered by its op's entry, never as a second one */
  for (const [a, op] of Object.entries(OP_ALIASES)) if (Object.hasOwn(DESIGN, a)) assert.ok(Object.hasOwn(ACT_HELP, op), `${a} → ${op}`);
  assert.equal(ACT_HELP.identityclaim, DESIGN.identityclaim);
  /* owed keys: only those still owed */
  const owed = keys.filter((k) => k.startsWith("owed_"));
  assert.deepEqual(owed.sort(), OWED_UNDECLARED.map((op) => `owed_${op}`).sort());
  for (const op of OWED_UNDECLARED) assert.equal(Object.hasOwn(ACT_HELP, op), false, `${op} is held only as owed_${op}`);
  for (const op of OWED_DECLARED) {
    assert.equal(Object.hasOwn(ACT_HELP, `owed_${op}`), false, op);
    assert.ok(Object.hasOwn(ACT_HELP, op), `${op} is held under its op`);
  }
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

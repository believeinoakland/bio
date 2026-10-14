/* affordances, T36 (T36-31; N726, DEC-174 (3), DEC-99; T37-27: N776, DEC-182; T38-31: DEC-183, K2300; T41-52: DEC-188 (7), (8), U145, K2484;
   T43-17: DEC-189, DEC-190, K2704; T44-9: DEC-191, N878, K2732; T46-45: DEC-194 (2), DEC-197, N937, N934, K2960; T47-49: N992, DEC-198,
   DEC-199, K3062, K3143): R48, R53, R54 and R56, the one table of what each act does, checked against the design stream's own files entry
   by entry, and R49, its publication in the answer with no target, the very object. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as A from "../../../src/affordances.mjs";
import * as G from "../../../src/op-grades/index.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

const { ACT_HELP, affordancesAnswer } = A;
const SCREENS = new URL("../../../../docs/development/ux-substrate/screens/", import.meta.url);
/* The design's registry as it stands on `main` at PR #34's merge (`4664e8efd4`; DEC-220, DEC-221, DEC-226; R57; before it PR #33's head, `f90b187c7b`, R54, R56), read,
   never copied: `mock-acts.js`, a plain script declaring `const ACT_HELP`, and `words.json`, the word list built from it, which keys
   each text `act.<key>.does`. */
const DESIGN = new Function(readFileSync(new URL("mock-acts.js", SCREENS), "utf8") + "; return ACT_HELP;")();
const WORDS = new Map(JSON.parse(readFileSync(new URL("words.json", SCREENS), "utf8")).words.map((w) => [w.key, w.en]));

/* R48's named keys. PR #14 withdrew the five op-less texts and `claimidentity`'s, and dropped `assistantset` (DEC-182 (1)–(3)); DEC-189
   removed the texts of the four ops retired in T41 (DEC-188 (8)). None is in the design, and none is held. */
const WITHDRAWN = ["projectcreated", "countask", "registerproceeding", "deadlinecompute", "claimidentity"];
const RETIRED = ["assistantset", "aiceilingset", "aicopyceilingset", "accountswitchset", "groupswitchset"];
const OWED_DECLARED_IN_T36 = ["aikeepaway", "openoriginal", "openwithwarning", "safeview", "deepercheck", "releasescanhold",
  "securitytooladd", "securitytooltest", "securitytoolremove", "archivelist", "findin", "groupdescriptiondraft",
  "memberlanguageset", "notedelete", "noterevise", "publishat", "securitymap", "startfrom", "writinghelp"];
const OWED_DECLARED_IN_T37 = ["subscriptionsignin", "setpassword", "obscuremark", "translationgrant", "translationdraft",
  "translationadopt", "translationconfirm", "translationrevert"];
const OWED_DECLARED_IN_T38 = ["obscuremarkwithdraw"];
const OWED_DECLARED_IN_T41 = ["accountusesset", "ailimitset", "projectkeyset", "projectsigninset", "projectaccountswitch",
  "projectaccountremove", "projectkeynoticeseen", "projectaikeepaway", "exploreapprove", "handlechange", "handlecheck"];
/* declared in T42 (op-declarations R47; op-grades R31), given its text by DEC-190 under `owed_pagetranscribe`, re-keyed by DEC-191 (PR #25)
   as `pagetranscribe`, the op served */
const OWED_DECLARED_IN_T42 = ["pagetranscribe"];
/* R53 (T46): the owed acts of T45 the design gives texts under `owed_` (PR #28), each declared by op-declarations in T45 */
const OWED_DECLARED_IN_T45 = ["actionscope", "itemtakeup", "filingsecondapprove"];
/* R53 (K2999): declared by op-declarations in T46 (its R50, R51), so held under their ops */
const OWED_DECLARED_IN_T46 = ["infolevelset", "escalationstoppursuing"];
/* R56 (K3143 (1)): the one `owed_` key the design keeps, declared by op-declarations in T47 (its R57), so held under its op */
const OWED_DECLARED_IN_T47 = ["passwordresetlink"];
const OWED_DECLARED = [...OWED_DECLARED_IN_T36, ...OWED_DECLARED_IN_T37, ...OWED_DECLARED_IN_T38, ...OWED_DECLARED_IN_T41, ...OWED_DECLARED_IN_T42,
  ...OWED_DECLARED_IN_T45, ...OWED_DECLARED_IN_T46, ...OWED_DECLARED_IN_T47];
/* R57 (DEC-226): the update ops `op-declarations` declares at its R66, later in L11's order; their texts stay under `owed_<op>` until it does */
const OWED_UNDECLARED = ["updatestart", "updatelater", "updateskip"];
/* The design's `owed_` keys at PR #34's merge: passwordresetlink, an owed act declared since, and the three update acts not yet declared. */
const DESIGN_OWED = ["passwordresetlink", ...OWED_UNDECLARED];
/* R53: the 42 texts PR #28 added (DEC-194 (2): the ops T45 serves; escalation's stop and reopening), each by the op it is held under;
   PR #31 re-keyed the four `owed_` ones to their ops (R54) */
const NEW_IN_PR28 = ["projectscopeset", "projectapprovalset", "ruledraft", "ruleconfirm", "rulewithdraw", "ruleoffer", "dutyfromresponse",
  "dutiesarising", "procedureguides", "standingendset", "declaredstakeset", "textcheck", "infractiondraft", "bearingdraft", "publishcheck",
  "casecheck", "advocacycheck", "curelink", "successrecord", "outcomecarry", "actionreceipt", "actionscope", "actionpromise",
  "openitemswith", "actionreplybearing", "actionbearingpropose", "arosefrom", "pressurerecord", "holdnoticesent", "jointsignatory",
  "filingsecondapprove", "escalationstoppursuing", "escalationreopen", "scenariosetaside", "scenariorestore", "planpause",
  "planresume", "matteroutcomeset", "itemtakeup", "watchlink", "watchanswer", "followend"];
/* R54 (DEC-198 (1), (3), DEC-199 (5)): the texts the design now keys by their served ops, each held under it, and the
   ops it now gives texts of their own */
const REKEYED_R54 = ["actionscope", "itemtakeup", "filingsecondapprove", "escalationstoppursuing", "infolevelset", "subscriptionsignin",
  "projectaikeepaway"];
const OWN_TEXT_R54 = ["captureupload", "ask", "subscriptiondisconnect", "clockproposals", "joindoors", "statusreportassist", "airundispatch"];
/* R56 and K3143 (1): the ops op-declarations declares in T47 (its R55, R57, R59), whose texts the design gives under their own names,
   held under them now; op-grades grades each (its R36, R37) */
const T47_DECLARED = ["unlock", "passwordreset", "passwordresetlink", "grouplogoset", "grouplanguagesset", "signrequest", "projectlist",
  "projectquestions", "drawquestion", "projectbarset", "monitorset"];
/* R54, K3143 (3): texts no longer in the design, not held: the former `capture` text, and `hostingaccess`'s (the design gives
   `hostingaccessset`) */
const GONE_R54 = ["capture", "hostingaccess"];
/* R53 (DEC-197; membership R129): handlechange's help is the refusal it now is, membership's own row read by reference; the
   design's text, which still describes a change, is not held */
const HANDLE_REFUSAL = MEMBERSHIP_CHECKS.HANDLE_FIXED.translation;
/* The design's ops that no `NEEDS` row gates (reads and doors before a session: the install, the self-test, the
   invitation, the searches, the public reads), so `op-grades`' gated totality names none of them. */
const UNGATED = ["bootstrap", "selftest", "login" /* T47: the sign-in door */, "invitelook", "search", "frontier", "verify",
  "publishedcase"];

const { OP_ALIASES } = G;
const gradedOrPublished = (op) => [G.RUNGS, G.RUNG_ABSENT, G.NON_ACTS].some((t) => Object.hasOwn(t, op))
  || [...A.ACTS, ...A.CAPTURE_ACTS, ...A.PER_ITEM_ACTS].some((a) => a.id === op);

/* R48's reading of a design key: the key it is held under. */
const heldAs = (k) => {
  if (k.startsWith("owed_")) return OWED_DECLARED.includes(k.slice(5)) ? k.slice(5) : k;
  return Object.hasOwn(OP_ALIASES, k) ? OP_ALIASES[k] : k;
};
/* R48 as a check over a table: the design's entries, each under the key R48 holds it as, verbatim, in the design's order;
   handlechange's the refusal sentence in the design's place (R53). */
const expected = () => Object.entries(DESIGN).map(([k, text]) => [heldAs(k), k === "handlechange" ? HANDLE_REFUSAL : text]);
const meetsR48 = (table) => {
  try { assert.deepEqual(Object.entries(table), expected()); return true; } catch { return false; }
};

test("R48 R53 R54 R56 R57: ACT_HELP is a frozen module constant holding all 285 of the design's texts as they stand at PR #34's merge "
   + "(4664e8efd4; DEC-220, DEC-221, DEC-226), verbatim, each under the key R48 reads it as, in the design's order: aliases under their op, the "
   + "owed acts declared since T36 under their op and no owed_ key (R56: passwordresetlink), the texts PR #31 re-keyed and R54's own "
   + "texts under their ops, T47's declared ops under their own names, handlechange as membership's refusal and never the design's text "
   + "of a change; the withdrawn texts, the five retired ops and the texts the design dropped (capture, hostingaccess) nowhere; "
   + "mock-acts.js and words.json give each text alike; a table departing from any of these is seen (K874)", () => {
  assert.ok(Object.isFrozen(ACT_HELP));
  assert.equal(Object.keys(DESIGN).length, 285);
  assert.deepEqual(Object.keys(DESIGN).filter((k) => k.startsWith("owed_")).sort(), DESIGN_OWED.map((op) => `owed_${op}`).sort());
  /* R53: PR #28's 42 texts are each held under their op, as the design now keys them */
  assert.equal(NEW_IN_PR28.length, 42);
  assert.equal(new Set(NEW_IN_PR28).size, 42);
  for (const op of NEW_IN_PR28) {
    assert.ok(Object.hasOwn(DESIGN, op), `${op} is in the design under its op`);
    assert.equal(ACT_HELP[op], DESIGN[op], op);
  }
  /* R54: the re-keyed texts and the new own texts, each under its op, no `owed_` key in the design for any of them */
  for (const op of [...REKEYED_R54, ...OWN_TEXT_R54]) {
    assert.ok(Object.hasOwn(DESIGN, op) && !Object.hasOwn(DESIGN, `owed_${op}`), `${op} is keyed by its op`);
    assert.equal(ACT_HELP[op], DESIGN[op], op);
  }
  /* R56, K3143 (1): T47's declared ops under their own names; passwordresetlink from the design's owed_ key */
  for (const op of T47_DECLARED) {
    assert.equal(ACT_HELP[op], DESIGN[op] ?? DESIGN[`owed_${op}`], op);
    assert.equal(Object.hasOwn(ACT_HELP, `owed_${op}`), false, op);
  }
  assert.equal(ACT_HELP.passwordresetlink, DESIGN.owed_passwordresetlink);
  /* R56: recover names any member; publish, caseratify and publishat under the design's re-worded texts */
  assert.match(ACT_HELP.recover, /for any member/);
  for (const op of ["recover", "publish", "caseratify", "publishat"]) assert.equal(ACT_HELP[op], DESIGN[op], op);
  assert.match(ACT_HELP.caseratify, /publishes it now/);
  /* R54, K3143 (3): the texts the design dropped are held nowhere */
  for (const op of GONE_R54) {
    assert.equal(Object.hasOwn(DESIGN, op), false, `${op} is not in the design`);
    assert.equal(Object.hasOwn(ACT_HELP, op), false, `${op} is not held`);
  }
  /* the registry's two files agree: each design text is the word list's `act.<key>.does`, and the list holds no other act text */
  for (const [k, text] of Object.entries(DESIGN)) assert.equal(WORDS.get(`act.${k}.does`), text, k);
  assert.equal([...WORDS.keys()].filter((k) => /^act\..*\.does$/.test(k)).length, 285);
  for (const k of [...WITHDRAWN, ...RETIRED]) {
    assert.equal(Object.hasOwn(DESIGN, k), false, `${k} is withdrawn from the design`);
    assert.equal(Object.hasOwn(ACT_HELP, k), false, `${k} is not held`);
    assert.equal(Object.hasOwn(ACT_HELP, `owed_${k}`), false, k);
  }
  assert.ok(meetsR48(ACT_HELP));
  /* the arithmetic: 285 in the design, every one held, no two under one key */
  assert.equal(Object.keys(ACT_HELP).length, 285);
  assert.equal(new Set(expected().map(([k]) => k)).size, 285);
  for (const t of Object.values(ACT_HELP)) assert.ok(typeof t === "string" && t.trim().length > 0);
  assert.equal(ACT_HELP.clockpropose, DESIGN.clockpropose);
  for (const op of OWED_UNDECLARED) {
    assert.equal(ACT_HELP[`owed_${op}`], DESIGN[`owed_${op}`], op);
    assert.equal(Object.hasOwn(ACT_HELP, op), false, `${op} is not yet declared`);
  }
  for (const op of OWED_DECLARED.filter((o) => o !== "handlechange")) assert.equal(ACT_HELP[op], DESIGN[`owed_${op}`] ?? DESIGN[op], op);
  /* R53: escalationreopen and textcheck under their own names, as the design keys them */
  assert.equal(ACT_HELP.escalationreopen, DESIGN.escalationreopen);
  assert.equal(ACT_HELP.textcheck, DESIGN.textcheck);
  assert.match(ACT_HELP.escalationreopen, /\S/);
  /* R53 (DEC-197): handlechange states the refusal, membership's own row, the very string; the design's text, which still
     describes a change, is held nowhere; handlecheck's is the design's */
  assert.equal(ACT_HELP.handlechange, HANDLE_REFUSAL);
  assert.match(DESIGN.handlechange, /^Changes the handle/);
  assert.ok(!Object.values(ACT_HELP).includes(DESIGN.handlechange));
  assert.match(ACT_HELP.handlechange, /Nothing was changed\.$/);
  assert.equal(ACT_HELP.handlecheck, DESIGN.handlecheck);
  assert.match(ACT_HELP.setpassword, /^Changes your password\. Every other session signed in as you ends/);
  assert.match(ACT_HELP.handlecheck, /It never says who has a handle\.$/);
  assert.match(ACT_HELP.aikeepaway, /^Keeps the group's material away from AI, for every use or the ones you choose\. It binds every account/);
  assert.match(ACT_HELP.groupkeyset, /It pays for a member's act when neither a project's account nor the member's own serves it\.$/);

  /* negative controls (K874): each way a table can depart from R48, R53, R54 and R56 is seen by the same check */
  const rekey = (from, to) => Object.fromEntries(Object.entries(ACT_HELP).map(([k, v]) => [k === from ? to : k, v]));
  const variants = {
    "a retired op's text held": { ...ACT_HELP, aiceilingset: "Sets the ceiling." },
    "a declared owed text held under owed_<op>": rekey("ailimitset", "owed_ailimitset"),
    "T45's declared owed act held under owed_<op>": rekey("itemtakeup", "owed_itemtakeup"),
    "a T46-declared owed act held under owed_<op>": rekey("escalationstoppursuing", "owed_escalationstoppursuing"),
    "R56's declared owed act held under owed_<op>": rekey("passwordresetlink", "owed_passwordresetlink"),
    "a T47 op left out": Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== "drawquestion")),
    "an owed text missing": Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== "handlecheck")),
    "one of PR #28's texts missing": Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== "escalationreopen")),
    "one of R54's own texts missing": Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== "joindoors")),
    "capture's former text still held": { ...ACT_HELP, capture: "Adds this file or photo to the record." },
    "caseratify's former text held": { ...ACT_HELP, caseratify: "Signs this edition with your key. Readers can check the signature without the group." },
    "handlechange's design text held": { ...ACT_HELP, handlechange: DESIGN.handlechange },
    "a text re-worded here": { ...ACT_HELP, exploreapprove: ACT_HELP.exploreapprove.replace("today", "now") },
    "the design's order lost": Object.fromEntries(Object.entries(ACT_HELP).reverse()),
  };
  for (const [what, table] of Object.entries(variants)) assert.equal(meetsR48(table), false, what);
});

test("R48 (T43-17, T44-9; DEC-190, DEC-191): transcribe and pagetranscribe, both declared since T42, are held under their ops with the "
   + "registry's texts, read by key: act.transcribe.does and act.pagetranscribe.does (re-keyed from owed_pagetranscribe, the text unchanged); "
   + "the design keys neither as owed_; an op the registry gives no help is absent, never guessed", () => {
  for (const op of ["transcribe", "pagetranscribe"]) assert.ok(gradedOrPublished(op), `${op} is declared and graded`);
  const transcribe = WORDS.get("act.transcribe.does");
  const pagetranscribe = WORDS.get("act.pagetranscribe.does");
  assert.ok(transcribe && pagetranscribe);
  /* DEC-191 re-keyed the text: the old key is gone from both files, and the design holds it under the op */
  assert.equal(WORDS.has("act.owed_pagetranscribe.does"), false);
  assert.equal(Object.hasOwn(DESIGN, "owed_pagetranscribe"), false);
  assert.equal(DESIGN.pagetranscribe, pagetranscribe);
  assert.equal(ACT_HELP.transcribe, transcribe);
  assert.equal(ACT_HELP.pagetranscribe, pagetranscribe);
  assert.match(ACT_HELP.transcribe, /^Types the words of a page yourself, from its image\./);
  assert.match(ACT_HELP.pagetranscribe, /^Has the assistant read up to 8 pages of this document/);
  assert.equal(Object.hasOwn(ACT_HELP, "owed_pagetranscribe"), false);
  /* control: a declared, graded op the registry gives no help (translationmark, T37) is absent, as is any op without a registry text */
  assert.ok(gradedOrPublished("translationmark"));
  assert.equal(WORDS.has("act.translationmark.does"), false);
  assert.equal(Object.hasOwn(ACT_HELP, "translationmark"), false);
  for (const k of Object.keys(ACT_HELP)) {
    const keys = [k, `owed_${k}`, ...Object.entries(OP_ALIASES).filter(([, op]) => op === k).map(([a]) => a)];
    assert.ok(keys.some((d) => WORDS.has(`act.${d}.does`)), `${k} has a registry text`);
  }
  /* each way the two can depart is seen */
  const variants = {
    "transcribe missing": Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== "transcribe")),
    "pagetranscribe missing": Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== "pagetranscribe")),
    "pagetranscribe under owed_": Object.fromEntries(Object.entries(ACT_HELP).map(([k, v]) => [k === "pagetranscribe" ? "owed_pagetranscribe" : k, v])),
    "transcribe's text differing": { ...ACT_HELP, transcribe: transcribe.replace("yourself", "by hand") },
  };
  for (const [what, table] of Object.entries(variants)) assert.equal(meetsR48(table), false, what);
});

test("R48 R53: no key is an alias or a retired op; every alias the design explains is answered by its op's entry; the owed_ "
   + "keys are exactly the owed acts op-declarations does not declare (none since T46), none under a declared op; every other "
   + "key is an op op-grades grades or names (T47's declared ops among them, op-grades R36, R37), or one of the design's ungated ops", () => {
  const keys = Object.keys(ACT_HELP);
  for (const k of keys) {
    assert.equal(Object.hasOwn(OP_ALIASES, k), false, `${k} is no alias`);
    assert.ok(![...WITHDRAWN, ...RETIRED].includes(k), `${k} is not held`);
  }
  for (const [a, op] of Object.entries(OP_ALIASES)) if (Object.hasOwn(DESIGN, a)) assert.ok(Object.hasOwn(ACT_HELP, op), `${a} → ${op}`);
  assert.equal(ACT_HELP.identityclaim, DESIGN.identityclaim);
  const owed = keys.filter((k) => k.startsWith("owed_"));
  assert.deepEqual(owed.sort(), OWED_UNDECLARED.map((op) => `owed_${op}`).sort());
  for (const op of OWED_UNDECLARED) assert.equal(Object.hasOwn(ACT_HELP, op), false, `${op} is held only as owed_${op}`);
  for (const op of OWED_DECLARED) {
    assert.equal(Object.hasOwn(ACT_HELP, `owed_${op}`), false, op);
    assert.ok(Object.hasOwn(ACT_HELP, op), `${op} is held under its op`);
  }
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

test("R57: ACT_HELP holds the design at PR #34's merge in DEC-221's American spelling, no text containing \"labelled\"; the update acts under owed_ keys until declared; peopledirectory held, selftest (no text) not; a table with the old spelling is seen", () => {
  for (const [k, t] of Object.entries(ACT_HELP)) assert.doesNotMatch(t, /labelled/i, k);
  assert.match(ACT_HELP.groupdescriptiondraft, /labeled as its draft/);
  assert.match(ACT_HELP.pagetranscribe, /labeled as the assistant's reading/);
  for (const op of ["updatestart", "updatelater", "updateskip"]) {
    assert.equal(ACT_HELP[`owed_${op}`], DESIGN[`owed_${op}`], op);
    assert.equal(Object.hasOwn(ACT_HELP, op), false, `${op} is not yet declared`);
  }
  assert.equal(ACT_HELP.peopledirectory, DESIGN.peopledirectory);
  assert.equal(Object.hasOwn(DESIGN, "selftest"), false);
  assert.equal(Object.hasOwn(ACT_HELP, "selftest"), false);
  assert.equal(Object.keys(ACT_HELP).length, 285);
  /* controls (K874): the old spelling, an update text dropped, and a stale entry are each seen by the check */
  assert.equal(meetsR48({ ...ACT_HELP, testify: DESIGN.testify.replace("labeled", "labelled") }), false);
  assert.equal(meetsR48(Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== "owed_updateskip"))), false);
  assert.equal(meetsR48({ ...ACT_HELP, selftest: "Runs the checks." }), false);
});

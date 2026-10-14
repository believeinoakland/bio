/* affordances, T36 (T36-31; N726, DEC-174 (3), DEC-99; T37-27: N776, DEC-182; T38-31: DEC-183, K2300; T41-52: DEC-188 (7), (8), U145, K2484;
   T43-17: DEC-189, DEC-190, K2704; T44-9: DEC-191, N878, K2732; T46-45: DEC-194 (2), DEC-197, N937, N934, K2960; T47-49: N992, DEC-198,
   DEC-199, K3062, K3143; T49-14: DEC-229 to DEC-241, DEC-245, DEC-246, N1072, K2999, K3366): R48, R53, R54, R56, R57 and R61, the one table of
   what each act does, checked against the design stream's own file entry by entry, R62, its sentences read by key, and R49, its
   publication in the answer with no target, the very object. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as A from "../../../src/affordances.mjs";
import * as G from "../../../src/op-grades/index.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";

const { ACT_HELP, ACT_HELP_KEYS, affordancesAnswer } = A;
const REPO = fileURLToPath(new URL("../../../../", import.meta.url));
const SCREENS = new URL("../../../../docs/development/ux-substrate/screens/", import.meta.url);
/* The design's registry as it stands on `main` at PR #37's merge (R61), read from git at that commit and never copied:
   `mock-acts.js`, a plain script declaring `const ACT_HELP`. The words themselves are read by key (R62). */
const COMMIT = "f498560a37";
const DESIGN_SOURCE = execFileSync("git", ["show", `${COMMIT}:docs/development/ux-substrate/screens/mock-acts.js`],
  { cwd: REPO, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
const DESIGN = new Function(`${DESIGN_SOURCE}; return ACT_HELP;`)();
const READS = JSON.parse(readFileSync(new URL("words-reads.json", SCREENS), "utf8")).modules.affordances;

/* R61: the `owed_` keys the design keeps because their ops are not declared in T49; every other `owed_<op>` is held under its op. */
const OWED_STAY = ["projectstakeset", "actionstake", "watchitem", "secondlook", "actioninquiry"];
/* R61: the `owed_` texts held under their ops now (declared, or spelled `op=`, or `founderhandleset`, which op-declarations R71 declares) */
const OWED_NOW = ["versionconsider", "versionreject", "versionrevert", "versioncurrent", "projectfork", "readtranslate", "updatestart",
  "updatelater", "updateskip", "passwordresetlink", "founderhandleset"];
/* R48's named keys. PR #14 withdrew the five op-less texts and `claimidentity`'s, and dropped `assistantset` (DEC-182 (1)–(3)); DEC-189
   removed the texts of the four ops retired in T41 (DEC-188 (8)). None is in the design, and none is held. */
const WITHDRAWN = ["projectcreated", "countask", "registerproceeding", "deadlinecompute", "claimidentity"];
const RETIRED = ["assistantset", "aiceilingset", "aicopyceilingset", "accountswitchset", "groupswitchset"];
/* R54, K3143 (3): texts no longer in the design, not held: the former `capture` text, and `hostingaccess`'s */
const GONE_R54 = ["capture", "hostingaccess"];
/* R53 (DEC-197; membership R129): handlechange's help is the refusal it now is, membership's own row read by reference; the
   design's text, which still describes a change, is not held */
const HANDLE_REFUSAL = MEMBERSHIP_CHECKS.HANDLE_FIXED.translation;
/* The design's ops that no `NEEDS` row gates (reads and doors before a session: the install, the invitation, the searches, the public
   reads), or that are declared reads without a grade (`instance`, `progression`, `captureprogressions`), so `op-grades`' gated totality
   names none of them. */
const UNGATED = ["bootstrap", "login", "invitelook", "search", "frontier", "verify", "publishedcase", "instance", "progression",
  "captureprogressions"];

const { OP_ALIASES } = G;
const gradedOrPublished = (op) => [G.RUNGS, G.RUNG_ABSENT, G.NON_ACTS].some((t) => Object.hasOwn(t, op))
  || [...A.ACTS, ...A.CAPTURE_ACTS, ...A.PER_ITEM_ACTS].some((a) => a.id === op);

/* R48's reading of a design key: the key it is held under. */
const heldAs = (k) => {
  if (k.startsWith("owed_")) return OWED_STAY.includes(k.slice(5)) ? k : k.slice(5);
  return Object.hasOwn(OP_ALIASES, k) ? OP_ALIASES[k] : k;
};
/* R48 as a check over a table: the design's entries, each under the key R48 holds it as, verbatim, in the design's order, one per op
   (the design gives \`readtranslate\` both bare and \`owed_\`, the one text); handlechange's the refusal sentence in the design's place (R53). */
const expected = () => {
  const held = new Map();
  for (const [k, text] of Object.entries(DESIGN)) {
    const op = heldAs(k);
    if (!held.has(op)) held.set(op, k === "handlechange" ? HANDLE_REFUSAL : text);
  }
  return [...held];
};
const meetsR48 = (table) => {
  try { assert.deepEqual(Object.entries(table), expected()); return true; } catch { return false; }
};

test("R48 R53 R54 R56 R57 R61: ACT_HELP is a frozen module constant holding the design's texts as they stand at PR #37's merge "
   + "(f498560a37; 338 entries), verbatim, each under the key R48 reads it as, in the design's order, once per op: aliases under their op, "
   + "every owed act declared or spelled under its op and no owed_ key but the five whose ops are not declared in T49, handlechange as "
   + "membership's refusal and never the design's text of a change; the withdrawn texts, the retired ops and the texts the design dropped "
   + "nowhere; a table departing from any of these is seen (K874)", () => {
  assert.ok(Object.isFrozen(ACT_HELP));
  assert.equal(Object.keys(DESIGN).length, 338);
  assert.ok(meetsR48(ACT_HELP));
  /* the arithmetic: 338 in the design, `readtranslate` given twice and held once */
  assert.equal(Object.keys(ACT_HELP).length, 337);
  assert.equal(new Set(expected().map(([k]) => k)).size, 337);
  for (const t of Object.values(ACT_HELP)) assert.ok(typeof t === "string" && t.trim().length > 0);
  /* R61: no held key starts owed_ but the five named; the others are held under their ops */
  assert.deepEqual(Object.keys(ACT_HELP).filter((k) => k.startsWith("owed_")).sort(), OWED_STAY.map((op) => `owed_${op}`).sort());
  assert.deepEqual(Object.keys(DESIGN).filter((k) => k.startsWith("owed_")).map((k) => k.slice(5)).filter((op) => !OWED_STAY.includes(op)).sort(),
    [...OWED_NOW].sort());
  for (const op of OWED_NOW) {
    assert.ok(Object.hasOwn(ACT_HELP, op), `${op} is held under its op`);
    assert.equal(Object.hasOwn(ACT_HELP, `owed_${op}`), false, op);
    assert.equal(ACT_HELP[op], DESIGN[`owed_${op}`], op);
  }
  for (const op of OWED_STAY) {
    assert.equal(Object.hasOwn(ACT_HELP, op), false, `${op} is not declared in T49`);
    assert.equal(ACT_HELP[`owed_${op}`], DESIGN[`owed_${op}`], op);
  }
  /* R53 (DEC-197): handlechange states the refusal, membership's own row, the very string; the design's text, which still describes a
     change, is held nowhere; handlecheck's is the design's */
  assert.equal(ACT_HELP.handlechange, HANDLE_REFUSAL);
  assert.ok(!Object.values(ACT_HELP).includes(DESIGN.handlechange));
  assert.equal(ACT_HELP.handlecheck, DESIGN.handlecheck);
  /* R54, K3143 (3): the texts the design dropped are held nowhere */
  for (const op of GONE_R54) {
    assert.equal(Object.hasOwn(DESIGN, op), false, `${op} is not in the design`);
    assert.equal(Object.hasOwn(ACT_HELP, op), false, `${op} is not held`);
  }
  for (const k of [...WITHDRAWN, ...RETIRED]) {
    assert.equal(Object.hasOwn(DESIGN, k), false, `${k} is withdrawn from the design`);
    assert.equal(Object.hasOwn(ACT_HELP, k), false, `${k} is not held`);
    assert.equal(Object.hasOwn(ACT_HELP, `owed_${k}`), false, k);
  }
  /* R54's own texts, R56's, and the ops the design re-keyed: each held under its op as the design gives it */
  for (const op of ["captureupload", "ask", "subscriptiondisconnect", "clockproposals", "joindoors", "statusreportassist", "airundispatch",
                    "actionscope", "itemtakeup", "filingsecondapprove", "escalationstoppursuing", "infolevelset", "subscriptionsignin",
                    "projectaikeepaway", "unlock", "passwordreset", "grouplogoset", "grouplanguagesset", "signrequest", "projectlist",
                    "projectquestions", "drawquestion", "projectbarset", "monitorset", "recover", "publish", "caseratify", "publishat",
                    "clockpropose", "escalationreopen", "textcheck", "peopledirectory"])
    assert.equal(ACT_HELP[op], DESIGN[op], op);
  assert.equal(Object.hasOwn(DESIGN, "selftest"), false);
  assert.equal(Object.hasOwn(ACT_HELP, "selftest"), false);
  /* R61: `queuemute`'s text is the re-worded one, and `projectownervotes` has none, so none is held for it */
  assert.equal(ACT_HELP.queuemute, DESIGN.queuemute);
  assert.equal(Object.hasOwn(DESIGN, "projectownervotes") || Object.hasOwn(DESIGN, "owed_projectownervotes"), false);
  assert.equal(Object.hasOwn(ACT_HELP, "projectownervotes"), false);

  /* negative controls (K874): each way a table can depart from R48, R53, R54, R56 and R61 is seen by the same check */
  const rekey = (from, to) => Object.fromEntries(Object.entries(ACT_HELP).map(([k, v]) => [k === from ? to : k, v]));
  const without = (op) => Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== op));
  const variants = {
    "a retired op's text held": { ...ACT_HELP, aiceilingset: DESIGN.queuemute },
    "a declared owed text held under owed_<op>": rekey("versionconsider", "owed_versionconsider"),
    "founderhandleset held under owed_": rekey("founderhandleset", "owed_founderhandleset"),
    "an undeclared owed text held under its op": rekey("owed_watchitem", "watchitem"),
    "the update acts held under owed_": rekey("updatestart", "owed_updatestart"),
    "an op left out": without("drawquestion"),
    "an owed text missing": without("handlecheck"),
    "one of the new texts missing": without("stepsource"),
    "the readtranslate text missing": without("readtranslate"),
    "capture's former text still held": { ...ACT_HELP, capture: DESIGN.queuemute },
    "handlechange's design text held": { ...ACT_HELP, handlechange: DESIGN.handlechange },
    "a text re-worded here": { ...ACT_HELP, exploreapprove: ACT_HELP.exploreapprove.replace("today", "now") },
    "projectownervotes given a text": { ...ACT_HELP, projectownervotes: DESIGN.queuemute },
    "the design's order lost": Object.fromEntries(Object.entries(ACT_HELP).reverse()),
  };
  for (const [what, table] of Object.entries(variants)) assert.equal(meetsR48(table), false, what);
});

test("R61: measured at f498560a37: the design's 338 keys read by R48 are 295 ops' own texts, 27 aliases' (held under their ops), 11 "
   + "`owed_` texts now held under their ops and 5 that stay `owed_`; the 13 ops op-declarations' ACT_HELP_ABSENT named for want of text "
   + "now have it, `founderhandleset` is held and `projectownervotes` is not", () => {
  const keys = Object.keys(DESIGN);
  const classify = (k) => (k.startsWith("owed_") ? (OWED_STAY.includes(k.slice(5)) ? "owed_stays" : "owed_now")
    : Object.hasOwn(OP_ALIASES, k) ? "alias" : "op");
  const count = {};
  for (const k of keys) count[classify(k)] = (count[classify(k)] ?? 0) + 1;
  assert.deepEqual(count, { op: keys.length - 27 - 16, alias: 27, owed_now: 11, owed_stays: 5 });
  assert.equal(keys.length, 338);
  assert.equal(count.op + count.alias + count.owed_now + count.owed_stays, 338);
  /* fold (b) finding 5: the ops `ACT_HELP_ABSENT` named, now with text under their own names */
  for (const op of ["readtranslate", "planask", "stepsource", "stepsourcewithdraw", "actionreplyquoting", "lookedsince", "proceedingdates",
                    "updatenotice", "aiuseovertime", "exploregraph", "standardproposals", "filingread", "pressurefor"]) {
    assert.ok(Object.hasOwn(ACT_HELP, op), `${op} is held`);
    assert.equal(ACT_HELP[op], DESIGN[op], op);
  }
  assert.ok(Object.hasOwn(ACT_HELP, "founderhandleset"));
  assert.equal(ACT_HELP.founderhandleset, DESIGN.owed_founderhandleset);
  assert.equal(Object.hasOwn(ACT_HELP, "projectownervotes"), false);
  /* control: the 337 held ops are the file's keys read once each; no `owed_` key of the 11 survives */
  for (const op of OWED_NOW) assert.equal(Object.hasOwn(ACT_HELP, `owed_${op}`), false, op);
});

test("R62: ACT_HELP holds its sentences as keys read through setup-words: every key it reads is a word (hasWord), each op's help is "
   + "exactly word(key) for its key, a key the word list lacks is not answered, and every key the design's reads list gives this "
   + "module is a word", () => {
  assert.ok(Object.isFrozen(ACT_HELP_KEYS));
  const ops = Object.keys(ACT_HELP).filter((op) => op !== "handlechange");
  assert.deepEqual(Object.keys(ACT_HELP_KEYS), ops, "a key for every held op but handlechange, in order");
  for (const [op, key] of Object.entries(ACT_HELP_KEYS)) {
    assert.ok(hasWord(key), `${op}: ${key} is a word`);
    assert.equal(ACT_HELP[op], word(key), op);
  }
  /* a sample of keys over fixtures: what the module answers for them is word(key, vars), the English left to the list */
  for (const op of ["publish", "versionconsider", "founderhandleset", "updatestart", "owed_watchitem", "transcribe", "queuemute"])
    assert.equal(ACT_HELP[op], word(ACT_HELP_KEYS[op]), op);
  assert.equal(Object.hasOwn(ACT_HELP_KEYS, "handlechange"), false, "handlechange is read from membership's refusal row (R53)");
  /* the design's reads list for this module (DEC-258): every key is a word; the act keys it names are the keys read here, but for
     handlechange's, whose design text is not held, and the vocabulary keys (t33.test.mjs) */
  assert.ok(READS.reads.length >= 405);
  for (const k of READS.reads) assert.ok(hasWord(k), `${k} is a word`);
  const actKeys = new Set(Object.values(ACT_HELP_KEYS));
  for (const k of READS.reads.filter((k) => k.startsWith("act.") && k !== "act.handlechange.does"))
    assert.ok(actKeys.has(k), `${k} is read`);
  /* controls: an unknown key is not a word, so a table naming one cannot load; the design's text of a change is not read */
  assert.equal(hasWord("act.noop.does"), false);
  assert.throws(() => word("act.noop.does"), { code: "UNKNOWN_WORD" });
  assert.equal(Object.values(ACT_HELP).includes(word("act.handlechange.does")), false);
});

test("R48 (T43-17, T44-9; DEC-190, DEC-191): transcribe and pagetranscribe, both declared since T42, are held under their ops, read by "
   + "key: act.transcribe.does and act.pagetranscribe.does; the design keys neither as owed_; an op the design gives no help is absent, "
   + "never guessed", () => {
  for (const op of ["transcribe", "pagetranscribe"]) assert.ok(gradedOrPublished(op), `${op} is declared and graded`);
  assert.equal(hasWord("act.owed_pagetranscribe.does"), false);
  assert.equal(Object.hasOwn(DESIGN, "owed_pagetranscribe"), false);
  assert.equal(ACT_HELP_KEYS.transcribe, "act.transcribe.does");
  assert.equal(ACT_HELP_KEYS.pagetranscribe, "act.pagetranscribe.does");
  assert.equal(ACT_HELP.transcribe, DESIGN.transcribe);
  assert.equal(ACT_HELP.pagetranscribe, DESIGN.pagetranscribe);
  assert.equal(Object.hasOwn(ACT_HELP, "owed_pagetranscribe"), false);
  /* control: a declared, graded op the design gives no help (translationmark, T37) is absent, as is any op without a text */
  assert.ok(gradedOrPublished("translationmark"));
  assert.equal(hasWord("act.translationmark.does"), false);
  assert.equal(Object.hasOwn(ACT_HELP, "translationmark"), false);
  for (const k of Object.keys(ACT_HELP).filter((k) => k !== "handlechange"))
    assert.ok(hasWord(ACT_HELP_KEYS[k]), `${k} has a registry text`);
  /* each way the two can depart is seen */
  const without = (op) => Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== op));
  const variants = {
    "transcribe missing": without("transcribe"),
    "pagetranscribe missing": without("pagetranscribe"),
    "pagetranscribe under owed_": Object.fromEntries(Object.entries(ACT_HELP).map(([k, v]) => [k === "pagetranscribe" ? "owed_pagetranscribe" : k, v])),
    "transcribe's text differing": { ...ACT_HELP, transcribe: DESIGN.transcribe.replace("yourself", "by hand") },
  };
  for (const [what, table] of Object.entries(variants)) assert.equal(meetsR48(table), false, what);
});

test("R48 R53 R61: no key is an alias or a retired op; every alias the design explains is answered by its op's entry; the owed_ keys "
   + "are exactly the five owed acts whose ops are not declared in T49, none under a declared op; every other key is an op op-grades "
   + "grades or names, or one of the design's ungated ops, or one op-declarations R71 declares in T49 (founderhandleset)", () => {
  const keys = Object.keys(ACT_HELP);
  for (const k of keys) {
    assert.equal(Object.hasOwn(OP_ALIASES, k), false, `${k} is no alias`);
    assert.ok(![...WITHDRAWN, ...RETIRED].includes(k), `${k} is not held`);
  }
  for (const [a, op] of Object.entries(OP_ALIASES)) if (Object.hasOwn(DESIGN, a)) assert.ok(Object.hasOwn(ACT_HELP, op), `${a} → ${op}`);
  assert.equal(ACT_HELP.identityclaim, DESIGN.identityclaim);
  assert.deepEqual(keys.filter((k) => k.startsWith("owed_")).sort(), OWED_STAY.map((op) => `owed_${op}`).sort());
  /* founderhandleset is declared by op-declarations in T49 (R71) and graded by op-grades in T49: held under its op now, graded once that merges */
  const NOT_YET_GRADED = ["founderhandleset"];
  for (const k of keys.filter((k) => !k.startsWith("owed_") && !NOT_YET_GRADED.includes(k)))
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

test("R57 R61: ACT_HELP holds the design in DEC-221's American spelling, no held text containing \"labelled\"; peopledirectory held, "
   + "selftest (no text) not; a table with the old spelling is seen", () => {
  for (const [k, t] of Object.entries(ACT_HELP)) assert.doesNotMatch(t, /labelled/i, k);
  assert.equal(ACT_HELP.peopledirectory, DESIGN.peopledirectory);
  assert.equal(Object.hasOwn(DESIGN, "selftest"), false);
  assert.equal(Object.hasOwn(ACT_HELP, "selftest"), false);
  assert.equal(Object.keys(ACT_HELP).length, 337);
  /* controls (K874): the old spelling, an update text dropped, and a stale entry are each seen by the check */
  assert.equal(meetsR48({ ...ACT_HELP, testify: DESIGN.testify.replace("labeled", "labelled") }), false);
  assert.equal(meetsR48(Object.fromEntries(Object.entries(ACT_HELP).filter(([k]) => k !== "updateskip"))), false);
  assert.equal(meetsR48({ ...ACT_HELP, selftest: DESIGN.queuemute }), false);
});

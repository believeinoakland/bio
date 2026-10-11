/* record-core T35 (T35-13; N655, K1754, DEC-49; N664, DEC-149): requirement-named tests at the module's interface for
   the lease's and the settings' refusals answered with their rows (R81, with R10, R25, R26, R61 as they now answer), and
   the words members read (R82): every sentence a member reads calls the group's own Civicsmith "your group's Civicsmith",
   and each of the sweep's 26 rows for this module (`build/plan/draft-T35-dec149-l1-l7.md`, numbered as the files stood on
   `tranche/T35` before this job) is named by a test below. Over `storage.mjs`, a fresh storage per test. No network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { recordOf, recordCoreOps, mintExhausted, RECORD_CORE_CHECKS, PER_ITEM_CHECKS } from "../../../src/record-core/index.mjs";
import { storage } from "./storage.mjs";

const fresh = () => { const s = storage(); const rc = recordOf({ storage: s }); rc.migrate(); return { s, rc }; };
const rows = (s, q, ...a) => [...s.sql.exec(q, ...a)];
const sha = (t) => createHash("sha256").update(t).digest("hex");
const put = (rc, id, snapKey, text = `x ${id} ${snapKey}`) =>
  rc.commit({ bundleId: id, type: "information", snapKey, files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }] });
const dump = (s) => Object.fromEntries(
  rows(s, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .map((r) => [r.name, JSON.stringify(rows(s, `SELECT * FROM ${r.name} ORDER BY rowid`))]));

const CIVICSMITH = "your group's Civicsmith";
const BUILD_FAULT = "This is a fault in how your group's Civicsmith was built, not in the record, and nothing in the record changed.";
/* R82: the words that never name the group's own Civicsmith in a sentence a member reads. */
const NEVER = /\b(copy|instance|plane|server)\b/i;
const AT = (fn, region) => `src/record-core/index.mjs ${fn} > ${region}`;

/* ---- R81: the lease's refusal with its row ---- */

const LEASE_DETAIL = "a lease is taken under a named actor — a member (from a session) or a machine identity (token:<class>). "
  + "An unnamed writer cannot hold the courtesy lock.";
const LEASE_TRANSLATION = "An edit is held only under the name of whoever is editing, and this request carried no name, so nothing "
  + "was held, ended or changed.";
const ANONYMOUS = ["", "   ", "\t", null, undefined, 7, {}, ["m"], true];

test("R81 R10 R61: ANONYMOUS_LEASE is this module's row C-102.28, its where naming the one function that refuses, its translation a member's sentence", () => {
  const row = RECORD_CORE_CHECKS.ANONYMOUS_LEASE;
  assert.deepEqual({ ...row }, { check: "C-102.28", where: AT("#anonymousLease", "is-anonymous-lease"), translation: LEASE_TRANSLATION });
  assert.ok(Object.isFrozen(row));
  assert.ok(!row.translation.includes(BUILD_FAULT), "a request naming no one is not a fault in how the Civicsmith was built");
  assert.ok(!/ANONYMOUS|C-102/.test(row.translation) && !NEVER.test(row.translation));
});

test("R81 R10 R30: acquireLease refuses an unnamed actor with {ok, reason, code, check, translation, detail}, the detail today's sentence, and holds nothing", () => {
  const { s, rc } = fresh();
  put(rc, "INFO-2026-0001-a", "K1");
  const before = dump(s);
  for (const who of ANONYMOUS) {
    const r = rc.acquireLease("INFO-2026-0001-a", who, 60000);
    assert.deepEqual(r, { ok: false, reason: "ANONYMOUS_LEASE", code: "ANONYMOUS_LEASE", check: "C-102.28", translation: LEASE_TRANSLATION,
                          detail: LEASE_DETAIL }, JSON.stringify(who) ?? "undefined");
    assert.deepEqual(Object.keys(r), ["ok", "reason", "code", "check", "translation", "detail"], "no other field");
  }
  assert.deepEqual(dump(s), before, "no lease row, nothing written");
  /* the control: a named actor takes it, and R11's refusal keeps its own shape */
  assert.equal(rc.acquireLease("INFO-2026-0001-a", "alice", 60000).ok, true);
  const held = rc.acquireLease("INFO-2026-0001-a", "bob", 60000);
  assert.deepEqual(Object.keys(held).sort(), ["heldBy", "ok", "until"], "R11 is unchanged");
  /* a lease another actor holds is no excuse to answer anything but the row for an unnamed one */
  assert.equal(rc.acquireLease("INFO-2026-0001-a", "", 60000).check, "C-102.28");
});

test("R81 R61 R30: releaseLease refuses an unnamed actor with the same row and sentence, ends nothing, and is the answer R10 gives", () => {
  const { s, rc } = fresh();
  put(rc, "INFO-2026-0001-a", "K1");
  rc.acquireLease("INFO-2026-0001-a", "alice", 60000);
  const before = dump(s);
  for (const who of ANONYMOUS) {
    const r = rc.releaseLease("INFO-2026-0001-a", who);
    assert.deepEqual(r, { ok: false, reason: "ANONYMOUS_LEASE", code: "ANONYMOUS_LEASE", check: "C-102.28", translation: LEASE_TRANSLATION,
                          detail: LEASE_DETAIL });
    assert.deepEqual(r, rc.acquireLease("INFO-2026-0001-a", who, 1000), "one refusal for taking and for ending");
  }
  assert.deepEqual(dump(s), before, "the held lease was not ended or changed");
  assert.deepEqual(rc.releaseLease("INFO-2026-0001-a", "alice"), { ok: true, released: true }, "the control: its holder ends it");
  /* the lease route (R72) answers the same row for a request naming no actor */
  const url = new URL("https://plane.invalid/?op=lease&id=INFO-2026-0001-a");
  assert.deepEqual(recordCoreOps(rc, url, null).lease(), rc.acquireLease("INFO-2026-0001-a", null, 300000));
});

/* ---- R81: the settings' refusals with their rows ---- */

const SETTING_ROWS = {
  SETTING_NAME_REQUIRED: ["C-102.29", "A part of your group's Civicsmith tried to record a setting without naming it, so nothing was "
    + "recorded. " + BUILD_FAULT, "a setting is recorded under a name, and none was given; nothing was recorded."],
  SETTING_BY_REQUIRED: ["C-102.30", "A part of your group's Civicsmith tried to record a setting without saying who set it, so nothing "
    + "was recorded. " + BUILD_FAULT, "a setting is recorded with who set it, and no one was named; nothing was recorded."],
  SETTING_VALUE_REQUIRED: ["C-102.31", "A part of your group's Civicsmith tried to record a setting without giving it a value, so "
    + "nothing was recorded. " + BUILD_FAULT, "a setting is recorded with a value, and none was given; nothing was recorded."],
  SETTING_INVALID: ["C-102.32", "The setting was not changed, because the value given is not one it takes. The jurisdictions your group "
    + "follows are set as a list of profiles, each named once, in the order they apply.",
    "jurisdiction_profiles is an ordered list of distinct profile ids; nothing was recorded."],
};
const settingRefusal = (code, more = {}) => {
  const [check, translation, detail] = SETTING_ROWS[code];
  return { ...more, ok: false, reason: code, code, check, translation, detail };
};

test("R81 R25: the four setting refusals are this module's rows C-102.29–.32, each where naming setSetting's region; three are build faults, SETTING_INVALID says the setting was not changed", () => {
  for (const [code, [check, translation]] of Object.entries(SETTING_ROWS)) {
    const row = RECORD_CORE_CHECKS[code];
    assert.deepEqual({ ...row }, { check, where: AT("setSetting", "is-setting-refused"), translation }, code);
    assert.ok(Object.isFrozen(row));
    assert.ok(!/SETTING_|C-102/.test(row.translation) && !NEVER.test(row.translation), code);
  }
  for (const code of ["SETTING_NAME_REQUIRED", "SETTING_BY_REQUIRED", "SETTING_VALUE_REQUIRED"])
    assert.ok(RECORD_CORE_CHECKS[code].translation.endsWith(BUILD_FAULT), `${code} ends with the BUILD_FAULT sentence`);
  assert.ok(!RECORD_CORE_CHECKS.SETTING_INVALID.translation.includes(BUILD_FAULT));
  assert.match(RECORD_CORE_CHECKS.SETTING_INVALID.translation, /^The setting was not changed/);
  const checks = Object.values(RECORD_CORE_CHECKS).map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length, "no number is held twice");
});

test("R81 R25 R26: setSetting answers each refusal in R25's order with its row and one fixed sentence, SETTING_INVALID keeping name, recording nothing", () => {
  const { s, rc } = fresh();
  rc.setSetting("jurisdiction_profiles", ["us-ca-oakland"], "installer");
  const before = dump(s);
  const cases = [
    [["", 1, "admin"], "SETTING_NAME_REQUIRED"], [[null, 1, "admin"], "SETTING_NAME_REQUIRED"], [[undefined, 1, "admin"], "SETTING_NAME_REQUIRED"],
    [["", undefined, ""], "SETTING_NAME_REQUIRED", "the name is asked first"],
    [["x", 1, ""], "SETTING_BY_REQUIRED"], [["x", 1, "  "], "SETTING_BY_REQUIRED"], [["x", 1, null], "SETTING_BY_REQUIRED"], [["x", 1, 7], "SETTING_BY_REQUIRED"],
    [["x", undefined, undefined], "SETTING_BY_REQUIRED", "then who set it"],
    [["x", undefined, "admin"], "SETTING_VALUE_REQUIRED"], [["jurisdiction_profiles", undefined, "admin"], "SETTING_VALUE_REQUIRED", "then the value"],
  ];
  for (const [[n, v, by], code, why] of cases)
    assert.deepEqual(rc.setSetting(n, v, by), settingRefusal(code), why ?? `${String(n)} / ${String(v)} / ${String(by)}`);
  for (const bad of ["us-ca-oakland", [""], [" "], ["a", "a"], [1], null, {}, [null]]) {
    const r = rc.setSetting("jurisdiction_profiles", bad, "installer");
    assert.deepEqual(r, settingRefusal("SETTING_INVALID", { name: "jurisdiction_profiles" }), JSON.stringify(bad));
    assert.deepEqual(Object.keys(r), ["name", "ok", "reason", "code", "check", "translation", "detail"]);
  }
  assert.deepEqual(dump(s), before, "every refusal recorded nothing");
  assert.deepEqual(rc.getSetting("jurisdiction_profiles"), ["us-ca-oakland"]);
  /* answered from a transact, a refusal rolls the caller back, as every refusal does (R32) */
  assert.equal(rc.transact(() => { rc.setSetting("y", 1, "admin"); return rc.setSetting("", 1, "admin"); }).code, "SETTING_NAME_REQUIRED");
  assert.equal(rc.getSetting("y"), null);
  /* the controls: a well-formed setting is recorded, and R26's value too, so the refusals above were the rules' */
  assert.deepEqual(rc.setSetting("x", null, "admin"), { ok: true }, "null is a value; only an absent one is refused");
  assert.deepEqual(rc.setSetting("jurisdiction_profiles", ["a", "b"], "admin"), { ok: true });
  assert.deepEqual(rc.getSetting("jurisdiction_profiles"), ["a", "b"]);
});

/* ---- R82: the words members read ---- */

/* The sweep's 26 rows for this module, numbered as `checks.mjs` and `index.mjs` stood on `tranche/T35` before this job,
   each with the row it lands in and the words it now carries there. */
const SWEEP = [
  ["checks.mjs:38", "MINT_EXHAUSTED", "Your group's Civicsmith could not find a free identifier for this"],
  ["checks.mjs:40–41", "MINT_EXHAUSTED", "if it keeps happening, tell whoever hosts your group's Civicsmith."],
  ["checks.mjs:45", "COUNTS_DECLARED", "A part of your group's Civicsmith tried to report a figure another part already reports"],
  ["checks.mjs:46–47", "COUNTS_DECLARED", "This is a fault in how your group's Civicsmith was built"],
  ["checks.mjs:51", "COUNTS_MALFORMED", "A part of your group's Civicsmith tried to register its figures without naming itself"],
  ["checks.mjs:52", "COUNTS_MALFORMED", "This is a fault in how your group's Civicsmith was built, not in the "],
  ["checks.mjs:65", "AUDIT_CHECK_DECLARED", "A part of your group's Civicsmith tried to register its audit check a second time."],
  ["checks.mjs:70", "AUDIT_CHECK_MALFORMED", "A part of your group's Civicsmith tried to register an audit check without naming itself"],
  ["checks.mjs:82", "GRAMMAR_DECLARED", "A part of your group's Civicsmith tried to register a document grammar a second time"],
  ["checks.mjs:88", "GRAMMAR_MALFORMED", "A part of your group's Civicsmith tried to register a document grammar without naming itself"],
  ["checks.mjs:95", "STATS_SOURCE_DECLARED", "A part of your group's Civicsmith tried to supply its figures when another part already supplies them"],
  ["checks.mjs:100", "STATS_SOURCE_MALFORMED", "A part of your group's Civicsmith tried to supply its figures without naming itself"],
  ["checks.mjs:107", "OPAQUE_ID_MALFORMED", "A part of your group's Civicsmith tried to reserve an identifier without giving one"],
  ["checks.mjs:114", "OPAQUE_ID_SPENT", "if it keeps happening, tell whoever hosts your group's Civicsmith."],
  ["checks.mjs:118", "OPAQUE_ID_NO_TRANSACTION", "A part of your group's Civicsmith tried to reserve an identifier outside the change that would use it"],
  ["checks.mjs:124", "MINT_SEED_DECLARED", "A part of your group's Civicsmith tried to name the identifiers it holds a second time"],
  ["checks.mjs:129", "MINT_SEED_MALFORMED", "A part of your group's Civicsmith tried to name the identifiers it holds without naming itself"],
  ["checks.mjs:135", "TABLE_CLASS_MISSING", "A part of your group's Civicsmith tried to declare a table without saying how it is purged, "],
  ["checks.mjs:140", "TABLE_CLASS_UNKNOWN", "A part of your group's Civicsmith tried to declare a table with a class the record does not know"],
  ["checks.mjs:146", "TABLE_NAME_INVALID", "A part of your group's Civicsmith tried to declare a table whose name, "],
  ["checks.mjs:151", "TABLE_DECLARED", "A part of your group's Civicsmith tried to declare a table that is already declared"],
  ["checks.mjs:157", "STORE_GATE_DECLARED", "A part of your group's Civicsmith tried to register the checks of a table that already has them"],
  ["checks.mjs:162", "STORE_GATE_MALFORMED", "A part of your group's Civicsmith tried to register or run the checks of a table without naming itself"],
  ["checks.mjs:169", "STORE_GATE_FAILED", "If it keeps happening, tell whoever hosts your group's Civicsmith."],
];
/* The words each row carried before, which it carries no more. */
const OLD = [/this instance/, /the instance/, /The plane/, /the plane/, /whoever runs/];

/* The whole of each moved row, as R82 words it. */
const MOVED = {
  MINT_EXHAUSTED: "Your group's Civicsmith could not find a free identifier for this, so nothing was saved and nothing was issued. "
    + "Identifiers are drawn at random so that none of them says how many others exist, and every one it tried was already taken. "
    + "Trying again may succeed; if it keeps happening, tell whoever hosts your group's Civicsmith.",
  COUNTS_DECLARED: "A part of your group's Civicsmith tried to report a figure another part already reports, or to register its figures "
    + "twice, so the second registration was refused and the first still stands. " + BUILD_FAULT,
  COUNTS_MALFORMED: "A part of your group's Civicsmith tried to register its figures without naming itself, the figures or a function to "
    + "count them, so nothing was registered. " + BUILD_FAULT,
  AUDIT_CHECK_DECLARED: "A part of your group's Civicsmith tried to register its audit check a second time. Each part registers once, "
    + "when it starts, so the second was refused and the first still runs. " + BUILD_FAULT,
  AUDIT_CHECK_MALFORMED: "A part of your group's Civicsmith tried to register an audit check without naming itself or without a check "
    + "to run, so nothing was registered. " + BUILD_FAULT,
  GRAMMAR_DECLARED: "A part of your group's Civicsmith tried to register a document grammar a second time, or to claim a check another "
    + "part's grammar already claims, so the second registration was refused and the first still stands. " + BUILD_FAULT,
  GRAMMAR_MALFORMED: "A part of your group's Civicsmith tried to register a document grammar without naming itself, the checks it takes "
    + "over or a function to run, or claimed only part of one of the record's own checks, so nothing was registered. " + BUILD_FAULT,
  STATS_SOURCE_DECLARED: "A part of your group's Civicsmith tried to supply its figures when another part already supplies them, so the "
    + "second was refused and the first still stands. " + BUILD_FAULT,
  STATS_SOURCE_MALFORMED: "A part of your group's Civicsmith tried to supply its figures without naming itself or without a function to "
    + "count them, so nothing was registered. " + BUILD_FAULT,
  OPAQUE_ID_MALFORMED: "A part of your group's Civicsmith tried to reserve an identifier without giving one, so nothing was reserved. "
    + BUILD_FAULT,
  OPAQUE_ID_SPENT: "That identifier has already been used, so it was not given out again and nothing was saved. An identifier names one "
    + "thing only, even after what it named is gone. Trying again gives the thing a new one; if it keeps happening, tell whoever hosts "
    + "your group's Civicsmith.",
  OPAQUE_ID_NO_TRANSACTION: "A part of your group's Civicsmith tried to reserve an identifier outside the change that would use it, so "
    + "nothing was reserved: a reservation is kept only with the change it belongs to. " + BUILD_FAULT,
  MINT_SEED_DECLARED: "A part of your group's Civicsmith tried to name the identifiers it holds a second time, so the second was refused "
    + "and the first still stands. " + BUILD_FAULT,
  MINT_SEED_MALFORMED: "A part of your group's Civicsmith tried to name the identifiers it holds without naming itself, or named a place "
    + "to read them that is not a table and a column, so nothing was registered. " + BUILD_FAULT,
  TABLE_CLASS_MISSING: "A part of your group's Civicsmith tried to declare a table without saying how it is purged, removed, exported, "
    + "seen, derived or versioned, so nothing was declared. " + BUILD_FAULT,
  TABLE_CLASS_UNKNOWN: "A part of your group's Civicsmith tried to declare a table with a class the record does not know, so nothing was "
    + "declared. " + BUILD_FAULT,
  TABLE_NAME_INVALID: "A part of your group's Civicsmith tried to declare a table whose name, or a column or table its declaration names, "
    + "is not a plain name, so nothing was declared. " + BUILD_FAULT,
  TABLE_DECLARED: "A part of your group's Civicsmith tried to declare a table that is already declared, by itself or by another part, so "
    + "the second declaration was refused and the first still stands. " + BUILD_FAULT,
  STORE_GATE_DECLARED: "A part of your group's Civicsmith tried to register the checks of a table that already has them, so the second "
    + "registration was refused and the first still runs. " + BUILD_FAULT,
  STORE_GATE_MALFORMED: "A part of your group's Civicsmith tried to register or run the checks of a table without naming itself, a table "
    + "it declared or a check to run, so nothing was registered and nothing was written. " + BUILD_FAULT,
  STORE_GATE_FAILED: "One of the checks the record runs before saving this stopped with an error instead of answering, so nothing was "
    + "saved. The error is in the check and says nothing yet about what you sent. If it keeps happening, tell whoever hosts your "
    + "group's Civicsmith.",
};

for (const [at, code, words] of SWEEP) {
  test(`R82 (${at}, ${RECORD_CORE_CHECKS[code].check}): the row ${code} now reads "${words}", and its whole translation is R82's`, () => {
    const t = RECORD_CORE_CHECKS[code].translation;
    assert.ok(t.includes(words), t);
    assert.equal(t, MOVED[code]);
    for (const old of OLD) assert.doesNotMatch(t, old);
    assert.doesNotMatch(t, NEVER);
  });
}

/* The sixteen translations that end with `BUILD_FAULT` (`checks.mjs`:33), and the two that spell it inline. */
const BUILD_FAULT_ROWS = ["AUDIT_CHECK_DECLARED", "AUDIT_CHECK_MALFORMED", "GRAMMAR_DECLARED", "GRAMMAR_MALFORMED", "STATS_SOURCE_DECLARED",
  "STATS_SOURCE_MALFORMED", "MINT_SEED_DECLARED", "MINT_SEED_MALFORMED", "TABLE_CLASS_MISSING", "TABLE_CLASS_UNKNOWN", "STORE_GATE_DECLARED",
  "STORE_GATE_MALFORMED", "TABLE_NAME_INVALID", "TABLE_DECLARED", "OPAQUE_ID_MALFORMED", "OPAQUE_ID_NO_TRANSACTION"];

test("R82 (checks.mjs:33, BUILD_FAULT): the sentence reads \"This is a fault in how your group's Civicsmith was built, …\" and moves all sixteen translations, C-102.13 and .14 reading the same", () => {
  assert.deepEqual(BUILD_FAULT_ROWS.map((c) => RECORD_CORE_CHECKS[c].check).sort(),
    ["C-102.1", "C-102.15", "C-102.16", "C-102.17", "C-102.18", "C-102.19", "C-102.2", "C-102.20", "C-102.21", "C-102.22", "C-102.23",
     "C-102.24", "C-102.26", "C-102.27", "C-59.7", "C-59.9"], "the sixteen R82 names");
  for (const c of [...BUILD_FAULT_ROWS, "COUNTS_DECLARED", "COUNTS_MALFORMED"])
    assert.ok(RECORD_CORE_CHECKS[c].translation.endsWith(` ${BUILD_FAULT}`), c);
  /* R81's three build faults end with it too; no row of this module carries the old sentence */
  for (const c of ["SETTING_NAME_REQUIRED", "SETTING_BY_REQUIRED", "SETTING_VALUE_REQUIRED"]) assert.ok(RECORD_CORE_CHECKS[c].translation.endsWith(BUILD_FAULT), c);
  for (const row of Object.values(RECORD_CORE_CHECKS)) assert.ok(!row.translation.includes("how the instance was built"), row.check);
  /* a build fault is never a member's refusal: the rows a member's own act meets do not end with it */
  for (const c of ["ALLOCID_PREFIX_GATED", "AUDIT_CHECK_FAILED", "OPAQUE_ID_SPENT", "MINT_EXHAUSTED", "STORE_GATE_FAILED", "ANONYMOUS_LEASE",
                   "SETTING_INVALID", "EXPUNGE_GROUND_UNKNOWN", "EXPUNGE_NOT_DECLARED", "EXPUNGE_NOT_A_MEMBER", "EXPUNGE_NOTHING"])
    assert.ok(!RECORD_CORE_CHECKS[c].translation.includes(BUILD_FAULT), c);
});

const MINTED = { PROJ: "project", CASE: "case", DRAFT: "draft", RVG: "grant", TASK: "task", SRC: "source", EVT: "event", LIN: "line",
                 MNY: "money fact", PFA: "person fact", IDC: "identity claim", CALC: "calculation",
                 /* T41 (K2431): record-grammar R51, R53 */
                 STP: "step", GUD: "reading guide",
                 /* T42 (K2616, K2617): record-grammar R55 */
                 ACD: "case account draft" };

test("R82 R62 (index.mjs:129, C-59.6): MINT_EXHAUSTED's detail reads \"your group's Civicsmith could not find a free … id\" for every prefix, and the unnamed one", () => {
  for (const [p, what] of Object.entries(MINTED))
    assert.equal(mintExhausted(p).detail, `your group's Civicsmith could not find a free ${what} id: every one it drew was already taken. Nothing was written.`, p);
  for (const p of ["INFO", "", undefined, 7])
    assert.equal(mintExhausted(p).detail, "your group's Civicsmith could not find a free id: every one it drew was already taken. Nothing was written.");
  /* the same detail where it is met: an opaque prefix's 64 hits */
  const { rc } = fresh();
  const orig = crypto.getRandomValues;
  crypto.getRandomValues = (u) => { u[0] = 0; return u; };
  try { rc.allocId("EVT", "2026"); assert.match(rc.allocId("EVT", "2026").detail, /^your group's Civicsmith could not find a free event id/); }
  finally { crypto.getRandomValues = orig; }
});

test("R82: every member-facing sentence this module answers calls the group's own Civicsmith \"your group's Civicsmith\", or needs no name, and never copy, instance, plane or server", () => {
  const sentences = [
    ...Object.entries(RECORD_CORE_CHECKS).map(([c, r]) => [`${c} translation`, r.translation]),
    ...Object.entries(PER_ITEM_CHECKS).map(([c, r]) => [`${c} translation`, r.translation]),
    ...[...Object.keys(MINTED), "INFO"].map((p) => [`MINT_EXHAUSTED detail (${p})`, mintExhausted(p).detail]),
    ["ANONYMOUS_LEASE detail", LEASE_DETAIL],
    ...Object.entries(SETTING_ROWS).map(([c, [, , d]]) => [`${c} detail`, d]),
  ];
  assert.ok(sentences.length >= 50);
  for (const [what, t] of sentences) {
    assert.doesNotMatch(t, NEVER, what);
    for (const m of t.matchAll(/Civicsmith/g)) {
      const before = t.slice(Math.max(0, m.index - "your group's ".length), m.index);
      assert.match(before, /^[Yy]our group's $/, `${what}: the Civicsmith is "your group's"`);
    }
  }
  assert.ok(sentences.filter(([, t]) => t.includes(CIVICSMITH) || t.includes("Your group's Civicsmith")).length >= 25);
  /* the answers themselves carry these sentences: a refusal read live, not only the table */
  const { rc } = fresh();
  assert.equal(rc.registerCounts("", [], null).translation, MOVED.COUNTS_MALFORMED);
  assert.equal(rc.acquireLease("INFO-2026-0001-a", "", 1).translation, LEASE_TRANSLATION);
  assert.equal(rc.setSetting("x", 1, "").translation, SETTING_ROWS.SETTING_BY_REQUIRED[1]);
});

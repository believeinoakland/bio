/* record-core T48 (T48-8; N1018, K3112, K3195): requirement-named tests at the module's interface for R62's new clause,
   `mintExhausted`'s fixed sentence for `WCD` (a draft of a new edition's statement of what changed) and `OUTC` (a carried
   outcome), `case-inputs`' opaque prefixes (its R6, R9; record-grammar R46), each its own and saying nothing was written,
   with `CASE`'s sentence unchanged as the control. Over `storage.mjs`, a fresh storage per test. No network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ID_TABLE } from "../../../src/record-grammar/index.mjs";
import { recordOf, RecordCore, mintExhausted, RECORD_CORE_CHECKS } from "../../../src/record-core/index.mjs";
import { storage } from "./storage.mjs";

const fresh = () => { const s = storage(); const rc = recordOf({ storage: s }); rc.migrate(); return { s, rc }; };
const rows = (s, q, ...a) => [...s.sql.exec(q, ...a)];
const dump = (s) => Object.fromEntries(
  rows(s, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .map((r) => [r.name, JSON.stringify(rows(s, `SELECT * FROM ${r.name} ORDER BY rowid`))]));

const NEVER = /\b(copy|instance|plane|server)\b/i;
const sentence = (what) => `your group's Civicsmith could not find a free ${what}: every one it drew was already taken. Nothing was written.`;
const WCD = sentence("id for a draft of a new edition's statement of what changed");
const OUTC = sentence("carried outcome id");
/* Every other prefix R62 names, each with its sentence as it stood before T48, and the unnamed one. */
const OTHERS = { PROJ: "project", CASE: "case", DRAFT: "draft", RVG: "grant", TASK: "task", SRC: "source", EVT: "event", LIN: "line",
                 MNY: "money fact", PFA: "person fact", IDC: "identity claim", CALC: "calculation", STP: "step", GUD: "reading guide",
                 ACD: "case account draft" };
const UNNAMED = sentence("id");

test("R62 (T48, N1018): mintExhausted(\"WCD\") and mintExhausted(\"OUTC\") each answer MINT_EXHAUSTED under C-59.6 with their own fixed detail, distinct from every other prefix's", () => {
  for (const p of ["WCD", "OUTC"]) assert.ok(ID_TABLE.some((e) => e.prefix === p && e.owner === "case-inputs"), `${p} is case-inputs' in ID_TABLE (record-grammar R46)`);
  const row = RECORD_CORE_CHECKS.MINT_EXHAUSTED;
  for (const [p, detail] of [["WCD", WCD], ["OUTC", OUTC]]) {
    const r = mintExhausted(p);
    assert.deepEqual(r, { ok: false, reason: "MINT_EXHAUSTED", code: "MINT_EXHAUSTED", check: "C-59.6", translation: row.translation,
                          prefix: p, detail }, p);
    assert.deepEqual(Object.keys(r), ["ok", "reason", "code", "check", "translation", "prefix", "detail"], `${p}: no other field`);
    assert.deepEqual(mintExhausted(p), r, "the same answer for every caller, every time");
    assert.deepEqual(mintExhausted(p, undefined), r);
    /* one sentence, saying nothing was written, naming no count or id, in R82's words */
    assert.match(r.detail, /Nothing was written\.$/);
    assert.equal(r.detail.split(". ").length, 2, "one sentence, then the fixed close every prefix's carries");
    assert.ok(!/\d/.test(r.detail) && !NEVER.test(r.detail), p);
    assert.notEqual(r.detail, UNNAMED, `${p} is named, not the unnamed sentence of a prefix outside the set`);
  }
  assert.match(WCD, /a draft of a new edition's statement of what changed/);
  assert.match(OUTC, /carried outcome/);
  /* distinct from every other prefix's and from each other */
  const all = [...Object.keys(OTHERS), "WCD", "OUTC"].map((p) => mintExhausted(p).detail);
  assert.equal(new Set(all).size, all.length, "one sentence per prefix, none shared");
  assert.ok(!all.includes(UNNAMED));
});

test("R62 (T48): control: CASE's sentence, and every other prefix's, is unchanged; a prefix that only resembles WCD or OUTC is named by no object", () => {
  assert.equal(mintExhausted("CASE").detail, "your group's Civicsmith could not find a free case id: every one it drew was already taken. Nothing was written.");
  for (const [p, what] of Object.entries(OTHERS)) assert.equal(mintExhausted(p).detail, sentence(`${what} id`), p);
  assert.deepEqual(Object.keys(OTHERS).slice(0, 5), [...RecordCore.GATED_ID_PREFIXES]);
  for (const near of ["WCDX", "XWCD", "wcd", "OUT", "OUTCOME", "outc", " OUTC", "WCD-2026"])
    assert.equal(mintExhausted(near).detail, UNNAMED, `${near} is neither WCD nor OUTC`);
});

test("R62 (T48): WCD and OUTC answer through mintExhausted as case-inputs meets the condition: mintOpaqueId answers null after 64 hits, nothing is written, and extra never replaces the sentence", () => {
  for (const [p, detail] of [["WCD", WCD], ["OUTC", OUTC]]) {
    const { s, rc } = fresh();
    const before = dump(s);
    let draws = 0;
    const r = rc.transact(() => {
      const id = rc.mintOpaqueId(p, "2026", "", () => { draws++; return true; });
      return id ? { ok: true, id } : mintExhausted(p, { case: "CASE-2026-0001", op: "x" });
    });
    assert.equal(draws, 64, "R9: null only after 64 draws in a row collide");
    assert.deepEqual(r, { ...mintExhausted(p), case: "CASE-2026-0001", op: "x" });
    assert.equal(r.detail, detail);
    assert.deepEqual(dump(s), before, "nothing was written");
    assert.equal(mintExhausted(p, { detail: "mine", prefix: "CASE", check: "C-0" }).detail, detail, "extra never replaces its own");
    /* the control: a draw that is free mints the id in the form case-inputs holds (four digits) */
    assert.match(rc.transact(() => rc.mintOpaqueId(p, "2026")), new RegExp(`^${p}-2026-\\d{4}$`));
  }
});

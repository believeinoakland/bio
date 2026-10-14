/* action-grammar at T48 (T48-46; N1024; K231, K3125, K3189): R29, the rows whose raising site `action-records` (R16) holds
   now (C-32.4, C-33.6–C-33.9) name it, C-33.5 `BAD_DIRECTION` staying `actions`' own with a region of its own; and the
   frozen copies of C-117.34 and C-117.35 re-taken in DEC-221's American spelling (N1053; test-visible wording only). Each at
   the module's interface with its negative controls (K874). */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import * as AG from "../../../src/action-grammar/index.mjs";
import { GOLDEN, ROW_NAMES } from "./fixture.mjs";

const RECORDS_FILE = "src/action-records/index.mjs";
const ACTIONS_FILE = "src/actions/index.mjs";
/* R29's rows, the table each is held in, and the site R29 names. */
const MOVED = {
  MACHINE_CANNOT_CORRESPOND: ["C-32.4", `${RECORDS_FILE} correspondFence > is-machine-correspond`],
  BAD_DATE: ["C-33.6", `${RECORDS_FILE} correspondEntryRefusal > is-correspond-entry`],
  CAPTURE_AND_TESTIMONY: ["C-33.7", `${RECORDS_FILE} correspondEntryRefusal > is-correspond-entry`],
  NEITHER_CAPTURE_NOR_TESTIMONY: ["C-33.8", `${RECORDS_FILE} correspondEntryRefusal > is-correspond-entry`],
  UNREGISTERED_ARTIFACT: ["C-33.9", `${RECORDS_FILE} unregisteredArtifact > is-correspond-artifact`],
};
const BAD_DIRECTION = ["C-33.5", `${ACTIONS_FILE} actionCorrespond > is-correspond-direction`];
const allRows = () => ROW_NAMES.flatMap((t) => Object.entries(AG[t]).map(([code, row]) => ({ table: t, code, row })));
const rowOf = (code) => allRows().find((r) => r.code === code);
/* the translations as the rows read before T48, from the golden record (the same suite's answer over the code before the move) */
const wasTable = (code) => ROW_NAMES.find((t) => GOLDEN.rows[t]?.[code]);
const wasOf = (code) => ROW_NAMES.map((t) => GOLDEN.rows[t]?.[code]).find(Boolean);

test("R29: C-32.4 MACHINE_CANNOT_CORRESPOND, C-33.6 BAD_DATE, C-33.7 CAPTURE_AND_TESTIMONY, C-33.8 NEITHER_CAPTURE_NOR_TESTIMONY and C-33.9 UNREGISTERED_ARTIFACT name action-records' one site, each keeping its check, code, number and translation", () => {
  for (const [code, [check, where]] of Object.entries(MOVED)) {
    const { row } = rowOf(code);
    assert.deepEqual(Object.keys(row), ["check", "where", "translation"], code);
    assert.equal(row.check, check, code);
    assert.equal(row.where, where, code);
    const was = wasOf(code);
    assert.ok(was && was.translation.length > 0, `${code}: recorded`);
    assert.equal(row.translation, was.translation, `${code}: translation unmoved`);
    assert.equal(was.check, check, `${code}: number unmoved`);
  }
  assert.equal(Object.keys(MOVED).length, 5);
  /* control: the row stays in the table it was in, once */
  assert.equal(allRows().filter((r) => r.code === "BAD_DATE").length, 1);
  assert.equal(AG.ACTION_ACT_CHECKS.BAD_DATE.check, "C-33.6");
  assert.equal(rowOf("MACHINE_CANNOT_CORRESPOND").table, wasTable("MACHINE_CANNOT_CORRESPOND"));
});

test("R29: C-33.5 BAD_DIRECTION stays actions' own, its where src/actions/index.mjs actionCorrespond > is-correspond-direction, check, code and translation unmoved; control: no other row names that region, and no row of R29 names it", () => {
  const { row } = rowOf("BAD_DIRECTION");
  assert.deepEqual(Object.keys(row), ["check", "where", "translation"]);
  assert.equal(row.check, BAD_DIRECTION[0]);
  assert.equal(row.where, BAD_DIRECTION[1]);
  assert.equal(row.translation, wasOf("BAD_DIRECTION").translation, "translation unmoved");
  assert.deepEqual(allRows().filter((r) => r.row.where.endsWith("> is-correspond-direction")).map((r) => r.code), ["BAD_DIRECTION"]);
  for (const code of Object.keys(MOVED)) assert.ok(!rowOf(code).row.where.endsWith("> is-correspond-direction"), code);
});

test("R29: no other row moves: the rows naming action-records are R28's twelve and R29's five, every other row names actions' or this module's site; control: C-32.4's neighbours C-32.3, C-32.18, C-32.19 and C-32.20 stay actions'", () => {
  const rows = allRows();
  const naming = rows.filter((r) => r.row.where.startsWith(`${RECORDS_FILE} `)).map((r) => r.code);
  for (const code of Object.keys(MOVED)) assert.ok(naming.includes(code), code);
  assert.equal(naming.length, 12 + 5);
  const others = rows.filter((r) => !naming.includes(r.code));
  for (const { code, row } of others) assert.match(row.where, /^src\/(actions\/index|action-grammar\/checks)\.mjs /, code);
  for (const code of ["MACHINE_CANNOT_SET_LAWS", "MACHINE_CANNOT_SET_RISK_TIER"]) assert.match(rowOf(code).row.where, /^src\/actions\/index\.mjs /, code);
  for (const code of ["NO_RESOLUTION", "RESOLUTION_WITHOUT_RESOLVING"]) assert.match(rowOf(code).row.where, /^src\/actions\/index\.mjs actionMove > /, code);
});

test("R29: golden.json follows: its recorded wheres for the five rows and C-33.5 are the new ones, none names actionCorrespond's old regions for them; control: every other recorded where of the C-32 and C-33 tables is as recorded", () => {
  const recorded = readFileSync(new URL("./golden.json", import.meta.url), "utf8");
  for (const [code, [, where]] of Object.entries(MOVED)) assert.equal(wasOf(code).where, where, code);
  assert.equal(wasOf("BAD_DIRECTION").where, BAD_DIRECTION[1]);
  assert.ok(!recorded.includes(`${ACTIONS_FILE} actionCorrespond > is-machine-correspond`), "golden.json still names the old fence site");
  assert.ok(!recorded.includes(`${ACTIONS_FILE} actionCorrespond > is-correspond-artifact`), "golden.json still names the old artifact site");
  assert.ok(!recorded.includes(`${ACTIONS_FILE} actionCorrespond > is-correspond-entry`), "golden.json still names the old entry site");
  assert.equal(wasOf("NO_RESOLUTION").where, `${ACTIONS_FILE} actionMove > is-move-resolution`);
  assert.equal(wasOf("MACHINE_CANNOT_SET_LAWS").where, `${ACTIONS_FILE} actionLaws > is-machine-set-laws`);
});

test("R29 (the census arm): every one of the six rows' where names a region that exists in the file it names, and no other file in actions or action-records mints the five codes; negative control: a code read from a file that does not hold it is caught", () => {
  const ROOT = new URL("../../../", import.meta.url);
  const text = (file) => (existsSync(new URL(file, ROOT)) ? readFileSync(new URL(file, ROOT), "utf8") : "");
  const hasRegion = (src, region) => new RegExp(`DEC-49 REGION ${region}(?![a-z0-9-])`).test(src) && new RegExp(`END DEC-49 REGION ${region}(?![a-z0-9-])`).test(src);
  const defines = (src, fn) => new RegExp(`(function\\s+${fn}\\s*\\(|(^|\\s)(static\\s+)?(async\\s+)?#?${fn}\\s*\\(|(const|let)\\s+${fn}\\s*=)`, "m").test(src);
  const rows = { ...Object.fromEntries(Object.entries(MOVED).map(([c, [, w]]) => [c, w])), BAD_DIRECTION: BAD_DIRECTION[1] };
  for (const [code, where] of Object.entries(rows)) {
    const [file, fn, , region] = where.split(" ");
    const src = text(file);
    assert.ok(src, `${code}: ${file} is held`);
    assert.ok(hasRegion(src, region), `${code}: ${file} holds the region ${region}`);
    assert.ok(defines(src, fn), `${code}: ${file} defines ${fn}`);
  }
  /* the five are minted at action-records alone; BAD_DIRECTION at actions */
  const mints = (src, code) => new RegExp(`['"\`]${code}['"\`]|\\b${code}\\b`).test(src);
  const records = text(RECORDS_FILE), actions = text(ACTIONS_FILE);
  for (const code of Object.keys(MOVED)) {
    assert.ok(mints(records, code), `${code} is minted at action-records`);
    assert.ok(!mints(actions, code), `${code} is still minted in actions`);
  }
  assert.ok(mints(actions, "BAD_DIRECTION"), "BAD_DIRECTION is actions'");
  assert.ok(!mints(records, "BAD_DIRECTION"), "BAD_DIRECTION is not action-records'");
  /* control: the same reading over a file that does not hold the region or the code catches it */
  assert.ok(!hasRegion(records, "is-nowhere"));
  assert.ok(!defines(records, "noSuchFunction"));
  assert.ok(!mints("", "BAD_DATE"));
});

test("R29 (N1053; DEC-221): ACTION_GRAMMAR_WORDS' two frozen copies, refusal.MACHINE_CANNOT_SET_PARTNERS and refusal.PARTNERS_REFUSED, are in American spelling, and C-117.34 and C-117.35 translate by them; control: no sentence of the table holds a British -isation or -ised form", () => {
  assert.equal(AG.ACTION_GRAMMAR_WORDS["refusal.MACHINE_CANNOT_SET_PARTNERS"], "Only a member names the organizations acting with your group. Nothing was written.");
  assert.equal(AG.ACTION_GRAMMAR_WORDS["refusal.PARTNERS_REFUSED"], "Each partner is a named organization, listed once. Nothing was written.");
  assert.equal(AG.ACTION_CATALOGUE_CHECKS.MACHINE_CANNOT_SET_PARTNERS.translation, AG.ACTION_GRAMMAR_WORDS["refusal.MACHINE_CANNOT_SET_PARTNERS"]);
  assert.equal(AG.ACTION_CATALOGUE_CHECKS.PARTNERS_REFUSED.translation, AG.ACTION_GRAMMAR_WORDS["refusal.PARTNERS_REFUSED"]);
  for (const [key, text] of Object.entries(AG.ACTION_GRAMMAR_WORDS)) assert.doesNotMatch(text, /organis|labelled/i, key);
});

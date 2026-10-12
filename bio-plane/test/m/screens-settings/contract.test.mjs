/* screens-settings at the screen contract (interface-shell R21, R5; draft-T46-interface §4 (1)): the four screens are
   registry screens, each lists exactly its registry acts (with the re-points §3 names), every act names an op `OPS`
   holds, every function is self-contained (K2854 T1: it runs the same when rebuilt from its own source, with nothing
   in scope), and every word a screen names is held in `WORD_ROWS` or the module's own `SCREEN_WORDS`. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { OPS, OP_ALIASES } from "../../../src/op-declarations/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-settings/index.mjs";
import { open } from "./kit.mjs";
import { ADMIN, membersTable, accountTable, connectTable, notesTable } from "./fixtures.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const PATH = "docs/development/ux-substrate/screens/registry.json";
function registry() {
  try { return JSON.parse(execFileSync("git", ["show", `3f40899950:${PATH}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 24 })); }
  catch { return JSON.parse(readFileSync(join(ROOT, PATH), "utf8")); }
}
// the re-points draft-T46-interface §3 names, and the owed act served in T46 (interface-shell R21)
const REPOINT = { "owed:subscriptionsignin DEC-156": ["subscriptionsignin", "subscriptiondisconnect"], "owed:infolevelset DEC-162": ["infolevelset"] };
const EXTRA = { connect: ["subscriptiondisconnect"] };

test("the screens are the registry's members, account, connect and notes, each listing exactly its registry acts", () => {
  const reg = registry().screens;
  assert.deepEqual(SCREENS.map((s) => s.id), ["members", "account", "connect", "notes"]);
  for (const s of SCREENS) {
    const r = reg.find((x) => x.id === s.id);
    assert.ok(r, `${s.id} is a registry screen`);
    const want = new Set(r.acts.flatMap((a) => REPOINT[a.op] ? [REPOINT[a.op][0]] : [a.op]).concat(EXTRA[s.id] || []));
    assert.deepEqual(new Set(s.acts.map((a) => a.op)), want, `${s.id}'s acts`);
    assert.equal(s.acts.length, want.size, `${s.id} lists each act once`);
  }
  // DEC-197: Your account draws no handle change
  assert.ok(!SCREENS.find((s) => s.id === "account").acts.some((a) => a.op === "handlechange"));
});

test("every act names an op OPS holds (owed:infolevelset's op once op-declarations R50 declares it), and every read too", () => {
  for (const s of SCREENS) for (const a of s.acts) {
    const op = OP_ALIASES[a.op] || a.op;
    if (a.op === "infolevelset" && !OPS.infolevelset) continue; // op-declarations R50 (T46), merged before this module
    assert.ok(OPS[op], `${s.id}: ${a.op} is served`);
  }
  for (const s of SCREENS) for (const [n, r] of Object.entries(s.reads({ me: ADMIN, subject: "ana" }))) {
    if (r.op === "infolevel" && !OPS.infolevel) continue;
    assert.ok(OPS[r.op], `${s.id}: read ${n} (${r.op}) is served`);
  }
});

/* A function's source rebuilt with nothing in scope but the language's own globals (interface-shell R21 (1)). */
function rebuild(fn) {
  const src = fn.toString();
  const f = /^(async\s+)?function\b|^(async\s*)?\(|^[\w$]+\s*=>/.test(src) ? new Function(`"use strict"; return (${src});`)() : new Function(`"use strict"; return ({ ${src} });`)()[fn.name];
  assert.equal(typeof f, "function", fn.name);
  return f;
}
const rebuilt = (s) => ({ ...s, reads: rebuild(s.reads), render: rebuild(s.render), parts: Object.fromEntries(Object.entries(s.parts).map(([k, f]) => [k, rebuild(f)])),
  acts: s.acts.map((a) => Object.fromEntries(Object.entries(a).map(([k, v]) => [k, typeof v === "function" ? rebuild(v)
    : k === "refusals" ? Object.fromEntries(Object.entries(v).map(([c, x]) => [c, typeof x === "function" ? rebuild(x) : x])) : v]))) });

test("every function of SCREENS is self-contained: rebuilt from its own source, each screen reads and draws the same", async () => {
  const tables = { members: membersTable(), account: accountTable(ADMIN), connect: connectTable(ADMIN, "own"), notes: notesTable(ADMIN) };
  for (const s of SCREENS) {
    const subject = s.id === "members" ? "ana" : null;
    const a = await open(s.id, { me: ADMIN, table: tables[s.id], subject, reachable: true });
    const b = await open(s.id, { me: ADMIN, table: tables[s.id], subject, reachable: true, s: rebuilt(s) });
    assert.equal(b.html, a.html, `${s.id} draws the same from its source`);
    assert.deepEqual(b.p.requests, a.p.requests, `${s.id} reads the same from its source`);
  }
});

test("SCREEN_WORDS: frozen [key, en, protected] rows, keys distinct, under the screens' own keys or the shell's named rows", () => {
  assert.ok(Object.isFrozen(SCREEN_WORDS));
  const keys = new Set();
  const named = new Set(["handle.fixed", "act.memberlanguageset.does", "act.groupkeyremove.does", "act.owed_subscriptionsignin.does", "ai.label.untested"]);
  for (const r of SCREEN_WORDS) {
    assert.ok(Object.isFrozen(r) && r.length === 3 && typeof r[0] === "string" && typeof r[1] === "string" && typeof r[2] === "boolean", String(r));
    assert.ok(!keys.has(r[0]), `${r[0]} once`);
    keys.add(r[0]);
    assert.ok(/^screen\.(members|account|connect|notes|panel)\./.test(r[0]) || named.has(r[0]), r[0]);
    // DEC-149: the group's own Civicsmith is "your group's Civicsmith", never bare
    // (the software itself, "Civicsmith's tests", is not the group's)
    for (const m of r[1].matchAll(/Civicsmith(?!'s tests)/g)) assert.equal(r[1].slice(Math.max(0, m.index - 8), m.index), "group's ", `${r[0]}: ${r[1]}`);
    assert.ok(!/group's copy|\b(instance|plane|server)\b/i.test(r[1]), `${r[0]} names the group's Civicsmith as DEC-149 says`);
  }
});

test("every word a screen names is held in WORD_ROWS or SCREEN_WORDS", () => {
  const held = new Set([...WORD_ROWS.map((r) => r[0]), ...SCREEN_WORDS.map((r) => r[0])]);
  for (const s of SCREENS) for (const k of s.words) {
    if (Array.isArray(k)) assert.ok(SCREEN_WORDS.includes(k), `${s.id}: its own row ${k[0]} is SCREEN_WORDS' row`);
    else assert.ok(held.has(k), `${s.id}: ${k}`);
  }
});

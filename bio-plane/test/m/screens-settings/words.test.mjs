/* The screens draw no text of their own outside their words (interface-shell R5, DEC-179, as this module's share of
   it), on the real served page: `interfacewords` answers every word's text between two invisible marks, the first
   carrying its key, so each text node the main area draws reads as words (marked) and what remains, the record's own
   data (handles, covers, reasons, notes, dates, counts) or punctuation. Each key a screen draws is one it lists in its
   `words`, or one the shell draws itself. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { open, walk, WORDS, SCREENS } from "./kit.mjs";
import { SHELL_WORDS } from "../../../src/interface-shell/index.mjs";
import * as F from "./fixtures.mjs";

const { membersTable, membersTableMember, accountTable, connectTable, notesTable, groupTable, placesTable, recoveryTable, identityTable, securityTable, translationsTable, env, refuse } = F;

const MARKED = [...WORDS.keys()].map((key) => ({ key, text: "\u2060" + key + "\u2062" + WORDS.get(key) + "\u2061", en: WORDS.get(key), fallback: false }));
// the record's data: everything the fake plane answers, its fixtures' source included (functions' answers among them)
const DATA = JSON.stringify(F) + readFileSync(new URL("./fixtures.mjs", import.meta.url), "utf8") + "https://group.example/#invite=0123456789abcdef0123456789abcdef https://group.example/#join=" + "b".repeat(64) + " " + "a".repeat(64)
  // the languages' names (R31), derived from the tags the record holds, in the member's language
  + ["en", "es"].flatMap((l) => ["en", "en-US", "es", "vi", "zh", "yue", "tl", "ko", "ja", "fr", "ar", "ru", "pt", "hi", "so", "am", "ti", "fa", "uk", "hy", "km", "th", "ht", "de", "it", "pl", "sw", "mn", "lo"].map((t) => { const n = new Intl.DisplayNames([l], { type: "language" }).of(t); return n.charAt(0).toUpperCase() + n.slice(1); })).join(" ");
const strip = (t) => { let s = t, prev; do { prev = s; s = s.replace(/\u2060[^\u2060\u2061]*\u2061/g, " "); } while (s !== prev); return s; };
const keysIn = (t) => [...t.matchAll(/\u2060([^\u2060\u2061\u2062]+)\u2062/g)].map((m) => m[1]);
const PUNCT = /^[\s·:,…$\d.()\-–/%›]*$/;
const SHELL = new Set(SHELL_WORDS.map((r) => r[0]));
const SHELLS = ["rail.", "tab.", "state.", "weight.", "mark.", "date.", "level.", "shell.", "refusal."];

async function check(id, opt, what) {
  const o = await open(id, { ...opt, words: MARKED });
  const listed = new Set(o.s.words.map((x) => (Array.isArray(x) ? x[0] : x)));
  for (const n of walk(o.tree)) {
    if (n.text === undefined || !n.text.trim()) continue;
    for (const k of keysIn(n.text)) assert.ok(listed.has(k) || SHELL.has(k) || SHELLS.some((f) => k.startsWith(f)), `${id} (${what}): ${k} drawn but not in its words`);
    const rest = strip(n.text).trim();
    if (!rest || PUNCT.test(rest)) continue;
    for (const part of rest.split(/\s*[·,]\s*|\s{2,}/).map((x) => x.trim()).filter((x) => x && !PUNCT.test(x)))
      assert.ok(DATA.includes(part.replace(/^…/, "")), `${id} (${what}): "${part}" is neither a word nor the record's data`);
  }
  return o;
}

const STATES = (table) => [["ok", {}], ["loading", Object.fromEntries(Object.keys(table).map((k) => [k, "pending"]))], ["failed", Object.fromEntries(Object.keys(table).map((k) => [k, "none"]))]];

test("every text drawn by every screen, in every state, is a word or the record's data; every key drawn is listed in the screen's words", async () => {
  const runs = [
    ["members", { me: F.ADMIN, table: membersTable(), subject: "ana" }],
    ["members", { me: F.MEMBER, table: membersTableMember() }],
    ["members", { me: F.ADMIN, table: membersTable({ memberlist: env({ members: [] }), aikeepawaystate: env(F.KEEPAWAY_ON), groupkeystate: env({ ok: true, held: false, on: false }) }) }],
    ["account", { me: F.MEMBER, table: accountTable(F.MEMBER) }],
    ["account", { me: F.MEMBER, table: accountTable(F.MEMBER, { infolevel: refuse("UNKNOWN_OP"), memberlanguage: env({ ok: true, language: null, set_at: null }) }) }],
    ...["group", "own", "subscription", "none", "keptaway"].map((s) => ["connect", { me: F.MEMBER, table: connectTable(F.MEMBER, s) }]),
    ["connect", { me: F.MEMBER, table: connectTable(F.MEMBER, "none", { disclosureof: () => env({ ok: true, version: "D311-1", shown: false }) }) }],
    ["connect", { me: F.MEMBER, table: connectTable(F.MEMBER, "none", { bootstrap: { ok: true, part_signin: false } }) }],
    ["connect", { me: F.MEMBER, table: connectTable(F.MEMBER, "none", { bootstrap: { ok: true, part_signin: null }, accountreference: env({ ok: true, held: false, subscription: { connected: false, refused_at: "2026-10-10T00:00:00Z" } }) }) }],
    ["settings", { me: F.ADMIN, table: {} }],
    ["settings", { me: F.MEMBER, table: {} }],
    ["group", { me: F.ADMIN, table: groupTable(), reachable: true }],
    ["group", { me: F.MEMBER, table: groupTable() }],
    ["places", { me: F.ADMIN, table: placesTable() }],
    ["recovery", { me: F.ADMIN, table: recoveryTable() }],
    ["group-identity", { me: F.ADMIN, table: identityTable(), reachable: true }],
    ["security", { me: F.ADMIN, table: securityTable() }],
    ["security", { me: F.MEMBER, table: securityTable() }],
    ["translations", { me: F.ADMIN, table: translationsTable(), subject: "es", reachable: true }],
    ["notes", { me: F.MEMBER, table: notesTable(F.MEMBER), reachable: true }],
    ["notes", { me: F.MEMBER, table: notesTable(F.MEMBER, { notes: env({ ok: true, notes: [] }) }) }],
  ];
  for (const [id, opt] of runs) {
    for (const [what, over] of STATES(opt.table)) {
      await check(id, { ...opt, table: { ...opt.table, ...over } }, what);
    }
  }
  // what the acts draw after answering, too: the invitation, the key, the link, the draft, the court sentence
  const m = await open("members", { me: F.ADMIN, table: membersTable(), words: MARKED });
  await m.press("memberadd", { values: { "mi-id": "x", "mi-cover": "y", "mi-cap-contribute": true } });
  await m.press("websitekeycreate", { values: { "mw-cap": "2" } });
  await m.press("joinlinkenable", { values: { "mw-cap": "2" } });
  for (const n of walk(m.tree)) if (n.text !== undefined) { const r = strip(n.text).trim(); if (r && !PUNCT.test(r)) assert.ok(DATA.includes(r) || r === "x", r); }
});

test("control: a text written into a render, not a word, is found", async () => {
  const s = SCREENS.find((x) => x.id === "notes");
  const bad = { ...s, render(cs) { return cs.title() + "<p>Saved!</p>"; } };
  await assert.rejects(check("notes", { me: F.MEMBER, table: notesTable(F.MEMBER), screens: SCREENS.map((x) => (x.id === "notes" ? bad : x)) }, "control"), /Saved!/);
});

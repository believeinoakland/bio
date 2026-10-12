/* The screens draw no text of their own outside their words (interface-shell R5, DEC-179, as this module's share of
   it): every screen in every state, each drawn text node read with its words marked; what remains once the words are
   taken out is the record's own data (handles, covers, reasons, notes, dates, counts) or punctuation. Each key drawn
   is one the screen lists in its `words`. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, walk, usedKeys, resetUsed } from "./kit.mjs";
import * as F from "./fixtures.mjs";

const { ADMIN, MEMBER, membersTable, membersTableMember, accountTable, connectTable, notesTable, env, refuse } = F;

const DATA = JSON.stringify(F) + JSON.stringify([ADMIN, MEMBER]) + "https://group.example/#invite=0123456789abcdef0123456789abcdef https://group.example/#join=" + "b".repeat(64) + " " + "a".repeat(64);
const strip = (t) => { let s = t, prev; do { prev = s; s = s.replace(/⁠[^⁠⁡]*⁡/g, " "); } while (s !== prev); return s; };
const PUNCT = /^[\s·:,…$\d.()\-–/%]*$/;

async function check(id, opt, what) {
  resetUsed();
  const o = await open(id, { ...opt, trace: true });
  for (const n of walk(o.tree)) {
    if (n.text === undefined || !n.text.trim()) continue;
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
    ["connect", { me: F.MEMBER, table: connectTable(F.MEMBER, "none", { bootstrap: { ok: true, parts: [{ part: "signin", present: false }] } }) }],
    ["notes", { me: F.MEMBER, table: notesTable(F.MEMBER), reachable: true }],
    ["notes", { me: F.MEMBER, table: notesTable(F.MEMBER, { notes: env({ ok: true, notes: [] }) }) }],
  ];
  for (const [id, opt] of runs) {
    for (const [what, over] of STATES(opt.table)) {
      const table = { ...opt.table, ...over };
      const o = await check(id, { ...opt, table }, what);
      const listed = new Set(o.s.words.map((w) => (Array.isArray(w) ? w[0] : w)));
      for (const k of usedKeys()) if (k.startsWith("screen.") || k.startsWith("act.") || k.startsWith("ai.") || k.startsWith("handle.")) {
        const owner = k.startsWith("screen.") && !k.startsWith(`screen.${id}.`) && !k.startsWith("screen.panel.") ? null : k;
        if (owner) assert.ok(listed.has(k) || !o.html.includes("⁠"), `${id}: ${k} listed`);
      }
    }
  }
  // what the acts draw after answering, too: the invitation, the key, the link, the draft, the court sentence
  const m = await open("members", { me: F.ADMIN, table: membersTable(), trace: true });
  await m.press("memberadd", { values: { "mi-id": "x", "mi-cover": "y", "mi-cap-contribute": true } });
  await m.press("websitekeycreate", { values: { "mw-cap": "2" } });
  await m.press("joinlinkenable", { values: { "mw-cap": "2" } });
  for (const n of walk(m.tree)) if (n.text !== undefined) { const r = strip(n.text).trim(); if (r && !PUNCT.test(r)) assert.ok(DATA.includes(r) || r === "x", r); }
});

test("control: a text written into a render, not a word, is found", async () => {
  const { SCREENS } = await import("./kit.mjs");
  const s = SCREENS.find((x) => x.id === "notes");
  const bad = { ...s, render: (cs, view) => s.render(cs, view) + "<p>Saved!</p>" };
  await assert.rejects(check("notes", { me: F.MEMBER, table: notesTable(F.MEMBER), s: bad }, "control"), /Saved!/);
});

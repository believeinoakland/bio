/* journey-check R16 (N1109, N1106; DEC-254 (the member's own reading), DEC-251 (1) (Sign out); amends R9, R14): in the walk
   without the assistant the step that concludes a question is made on the member's own reading and asserts it by key, and
   the step that signs out asserts `shell.menu.signout`. Driven in a real browser over fixture pages drawn from the words. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { word as setupWord } from "../../../src/setup-words/index.mjs";
import { requireWord } from "../../../src/journey-check/words.mjs";
import { browser } from "../../../src/journey-check/run.mjs";

let B;
before(async () => { B = await browser(); });
after(async () => { await B?.close(); });
const on = async (html, fn) => { const ctx = await B.newContext(); try { const p = await ctx.newPage(); await p.setContent(html); return await fn(p); } finally { await ctx.close(); } };

const KEYS = ["question.conclude.own.choice", "question.conclude.own.field", "question.conclude.own.help", "question.empty.conclude.own", "shell.menu.signout"];

test("R16: each key's word is on the page at its step: the own-reading choice, its field and help, the empty sentence, Sign out; and the reading drawn as the member's own", async () => {
  for (const k of KEYS)
    await on(`<main id="cs-main"><div id="cs-menu"><p>${setupWord(k)}</p></div></main>`, (p) => requireWord(p, k, { within: k === "shell.menu.signout" ? "#cs-menu" : "#cs-main", timeout: 2000 }));
  const by = setupWord("question.reading.by.member", { member: "rosa-l" });
  await on(`<main id="cs-main"><p>${by}</p></main>`, (p) => requireWord(p, "question.reading.by.member", { within: "#cs-main", timeout: 2000 }));
  await on(`<main id="cs-main"><p>${by}</p></main>`, (p) => requireWord(p, "question.reading.by.member", { vars: { member: "rosa-l" }, within: "#cs-main", timeout: 2000 }));
});

test("R16 control: a fixture drawing other words fails, and a key the page lacks fails by name", async () => {
  for (const k of KEYS)
    await on(`<main id="cs-main"><div id="cs-menu"><p>Something else entirely.</p></div></main>`, async (p) => {
      await assert.rejects(requireWord(p, k, { within: k === "shell.menu.signout" ? "#cs-menu" : "#cs-main", timeout: 600 }), new RegExp(`does not draw the word ${k.replace(/\./g, "\\.")}`));
    });
  /* Sign out where the shell draws it elsewhere, not in its menu, is not the menu's: the old word fails */
  await on(`<main id="cs-main"><div id="cs-menu"><p>${setupWord("shell.signout")}</p></div></main>`, async (p) => {
    if (setupWord("shell.signout") !== setupWord("shell.menu.signout"))
      await assert.rejects(requireWord(p, "shell.menu.signout", { within: "#cs-menu", timeout: 600 }));
  });
  /* the member's own reading is not another member's: a fixture naming one member fails the walk asking for another */
  await on(`<main id="cs-main"><p>${setupWord("question.reading.by.member", { member: "mai-k" })}</p></main>`, async (p) => {
    await assert.rejects(requireWord(p, "question.reading.by.member", { vars: { member: "rosa-l" }, within: "#cs-main", timeout: 600 }));
  });
});

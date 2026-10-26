/* screens-intake T51 fix round 7 (SCREENS-INTAKE #21): G73, a stated reading is drawn as the sentence the reading states (R57). The address press on a held copy
 * the reading says it did not read (a 41.5 MB capture in 5 parts) drew the reading's own sentence as if it were a refusal code: "no explanation of this refusal
 * ... the capture is 41502904 bytes in 5 parts ...". Over the real store (fix round 10, K5054): the copy is a real capture of a 22 MB file of no known kind (the capture-request arm reads it whole, in parts: over the 20 MiB the reader assembles, so the owner states it did not read it), and the reading the owner
 * states of it (`completeness {state: "stated", failure, why}`) is the real one. Entry by the press. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, main, text, fill, press, says, ok } from "./page.mjs";

const ADDRESS = "https://www.oaklandca.gov/documents/fy23-25-adopted-budget-book-final-reduced-size.dat";
const BYTES = 22 * 1024 * 1024;
/* a copy of the address the team holds, made by real acts: a question, a request to capture the address for it, the daemon's drain (the owner reads the 22 MB whole, in parts),
   the document promoted; the reading the owner states of it is asked once so the page's press meets the reading as it stands */
async function held() {
  const t = await members({ mai: ["contribute", "create_projects"] });
  const w = t.world;
  const project = await w.recipes.project(t.mai, "Budget");
  const q = await w.recipes.question(t.mai, project, { title: "The budget", text: "What did the council adopt?" });
  const bytes = new Uint8Array(BYTES);
  for (let i = 0; i < bytes.length; i += 4096) bytes[i] = (i >> 12) & 255;
  w.script(ADDRESS, async () => new Response(bytes, { status: 200, headers: { "content-type": "application/octet-stream" } }));
  const asked = await t.mai.act("capturerequest", { body: { address: ADDRESS, target: q.id } });
  const drained = await w.door({ url: "/api/?op=capturerequestdrain", init: { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } }, { token: w.env.DAEMON_TOKEN });
  const done = ((drained.json.result || {}).captured || []).find((c) => c.request === asked.request);
  assert.ok(done && done.promoted && done.promoted.ok, "the capture was made and filed by the owner");
  return { ...t, sha: done.sha };
}
const stated = (p) => main(p).querySelectorAll('[data-reading="stated"]');
const pressCapture = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };
const at = (t, plane = {}) => openWorld("/app/capture/address", { world: t.world, as: t.mai, plane });

test("R57 (G73) a held copy the reading states it did not read is drawn as that sentence, once, as the Document screen draws it, never as an unexplained refusal", async () => {
  const t = await held();
  /* the owner's own reading of the copy (asked once, as the press asks it, so the stated reading is the stored one) */
  await t.mai.act("readheld", { body: { sha: t.sha } });
  const real = await t.mai.read("reading", { query: { sha256: t.sha } });
  assert.equal(real.completeness.state, "stated", "the owner states the reading it made");
  const SENTENCE = real.completeness.why;
  assert.ok(typeof SENTENCE === "string" && SENTENCE.length > 20 && !/^[A-Z_]+$/.test(SENTENCE), "a sentence, not a code");
  const p = await at(t);
  await pressCapture(p);
  assert.equal(p.byOp("acquire").length, 0, "nothing is captured: the address is held");
  assert.equal(stated(p).length, 1);
  assert.equal(stated(p)[0].textContent.includes(SENTENCE), true, "the reading's own sentence");
  assert.equal(text(p).split(SENTENCE).length - 1, 1, "drawn once");
  assert.equal(says(p, "refusal.uncatalogued"), false, "no apology over it");
  assert.equal(stated(p)[0].textContent.includes("<code>"), false);
});

test("R57 (G73) control: a stated reading that gives a code is a refusal's words; one that states no reason says none; a sentence with markup is drawn as text", async () => {
  const t = await held();
  await t.mai.act("readheld", { body: { sha: t.sha } });
  const real = await t.mai.read("reading", { query: { sha256: t.sha } });
  /* the owner never states a bare code or a reason of markup: these are the owner's real reading with its stated reason changed, the one scripted answer (a shape the screen must meet) */
  const said = (why) => ok({ ...real, completeness: { ...real.completeness, why } });
  const code = await at(t, { reading: said("TOO_LARGE") });
  await pressCapture(code);
  assert.ok(says(code, "refusal.TOO_LARGE"), "a code is worded");
  const none = await at(t, { reading: said(null) });
  await pressCapture(none);
  assert.ok(says(none, "screen.document.text.none"));
  const markup = await at(t, { reading: said("it was <b>not</b> read") });
  await pressCapture(markup);
  assert.equal(main(markup).querySelectorAll('[data-reading="stated"] b').length, 0, "the sentence is escaped");
});

/* screens-intake T51 fix round 7 (SCREENS-INTAKE #21): G73, a stated reading is drawn as the sentence the reading states (R57). The address press on a held copy
 * the reading says it did not read (a 41.5 MB capture in 5 parts) drew the reading's own sentence as if it were a refusal code: "no explanation of this refusal
 * ... the capture is 41502904 bytes in 5 parts ...". The fixture is at extraction's own shape (`#completenessOf`: `completeness {state: "stated", failure,
 * why}` with the reading's `basis`), and the basis is the real `reading-pipeline.why.capture_bytes_parts` sentence, filled as the pipeline fills it. Entry by the press. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, text, fill, press, says, word, ok, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const ADDRESS = "https://www.oaklandca.gov/documents/fy23-25-adopted-budget-book-final-reduced-size.pdf";
const SHA = "b".repeat(64);
const SENTENCE = word("reading-pipeline.why.capture_bytes_parts", { total: "41502904", parts: "5", multipart_read_max: "25165824" });
const HELD = ok({ ok: true, held: true, copy: { sha256: SHA, document: "INFO-2026-0115-budget-book", project: null, retrieved: "2026-10-22T10:00:00Z", actor: "member:mai", address: ADDRESS },
  versions: 1, truncated: false, changed: { state: "unchanged" } });
const STATED = (why) => ok({ ok: true, found: false, capture_sha: SHA, reading: { found: false, failure: "final", basis: why }, text_units: [], completeness: { state: "stated", failure: "final", why } });
const open = (reading) => openPage("/app/capture/address", { plane: { opencaptures: ok({ ok: true, truncated: false, captures: [] }), heldcaptures: ok({ ok: true, held: [] }),
  memberlist: ok({ members: [{ member_id: "mai", handle: "mai-h", role: "member", status: "active" }] }), heldat: HELD, reading, readheld: ok({ ok: true, read: false, why: "READING_HELD" }) }, screens: [...SCREENS, DOCUMENT_STUB] });
const pressCapture = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };
const stated = (p) => main(p).querySelectorAll('[data-reading="stated"]');

test("R57 (G73) a held copy the reading states it did not read is drawn as that sentence, once, as the Document screen draws it, never as an unexplained refusal", async () => {
  const p = await open(STATED(SENTENCE));
  await pressCapture(p);
  assert.equal(stated(p).length, 1);
  assert.equal(stated(p)[0].textContent.includes(SENTENCE), true, "the reading's own sentence");
  assert.equal(text(p).split(SENTENCE).length - 1, 1, "drawn once");
  assert.equal(says(p, "refusal.uncatalogued"), false, "no apology over it");
  assert.equal(stated(p)[0].textContent.includes("<code>"), false);
});

test("R57 (G73) control: a stated reading that gives a code is a refusal's words; one that states no reason says none; a sentence with markup is drawn as text", async () => {
  const code = await open(STATED("TOO_LARGE"));
  await pressCapture(code);
  assert.ok(says(code, "refusal.TOO_LARGE"), "a code is worded");
  const none = await open(ok({ ok: true, found: false, capture_sha: SHA, reading: { found: false, failure: "final" }, text_units: [], completeness: { state: "stated", failure: "final", why: null } }));
  await pressCapture(none);
  assert.ok(says(none, "screen.document.text.none"));
  const markup = await open(STATED("it was <b>not</b> read"));
  await pressCapture(markup);
  assert.equal(main(markup).querySelectorAll('[data-reading="stated"] b').length, 0, "the sentence is escaped");
});

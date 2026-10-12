/* screens-intake R4: the `held` screen (DEC-97) on the real served page: its read, its rows and picks, the hold strip's
 * acts and the restore. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, html, text, main, btn, fill, press, ok, refused, rawKeys } from "./page.mjs";

const ROWS = [
  { bundle_id: "INFO-2026-0001-photo", title: "Photo · Seminary Ave", project: "Pothole repairs", age_days: 2, eligible: true,
    source: { address: "upload:aa" }, captured_for: { questions: [], withheld: null } },
  { bundle_id: "INFO-2026-0002-budget", title: "City budget", project: null, age_days: 1, eligible: true,
    captured_for: { questions: [{ question: "INQ-1", title: "Were the transfers authorised?", asker: "Ana" }], withheld: null } },
  { bundle_id: "INFO-2026-0003-minutes", title: "Council minutes", project: "Sewer", age_days: 3, eligible: true,
    captured_for: { questions: [], withheld: "Captured for a question you may not see" } },
  { bundle_id: "INFO-2026-0004-lease", title: "Lease amendment", project: "Coliseum", age_days: 0, eligible: false, class: "crucial", reason: "crucial",
    captured_for: { questions: [], withheld: null } },
  { bundle_id: "INFO-2026-0005-packet", title: "Agenda packet (ZIP)", project: "Sewer", age_days: 1, eligible: null, captured_for: null,
    captured_for_basis: "no reader answered",
    archive: { sha256: "d".repeat(64), entries: 41, filed: 36, already_held: 1, not_filed: 2, waiting: 0 },
    files: [{ document: "INFO-2026-0006-agenda", sha256: "e".repeat(64), index: 1, name: "01_Agenda.pdf", grade: "B", eligible: true }],
    files_total: 36, files_truncated: true },
];
const HELD = ok({ ok: true, held: ROWS, truncated: false });
const pick = async (p, id) => p.click(main(p).querySelector(`#pick-held-${id}`));

test("R4 the screen reads heldcaptures; a list with no row is drawn in the screen's own empty sentence", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: HELD } });
  assert.equal(p.byOp("heldcaptures").length, 1);
  const e = await open("/app/held", { plane: { heldcaptures: ok({ ok: true, held: [] }) } });
  assert.match(text(e), /No captures are waiting/);
  /* control: a read that failed is drawn as failed, never as empty */
  const f = await open("/app/held", { plane: { heldcaptures: refused("STORE_SILENT", "The record did not answer.") } });
  assert.match(text(f), /Could not read this/);
  assert.doesNotMatch(text(f), /No captures are waiting/);
});

test("R4 each row with its title, age and project; the questions it waits for; withheld and refused marks with their reasons", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: HELD } });
  const t = text(p);
  for (const r of ROWS) assert.ok(main(p).querySelector(`#pick-held-${r.bundle_id}`), r.bundle_id);
  assert.match(t, /2 days old · Project: Pothole repairs/);
  assert.match(t, /Captured today · Project: Coliseum/);
  assert.match(t, /For Ana's question: “Were the transfers authorised\?”/);
  assert.ok(main(p).querySelector('[data-gap="withheld"]'));
  assert.match(t, /Captured for a question you may not see\./);
  assert.ok(main(p).querySelector('[data-gap="refused"]'));
  assert.match(t, /Not eligible for a batch: it is crucial to a finding\. Vouch for it on its own\./);
  assert.ok(main(p).querySelector('[data-gap="undetermined"]'), "an undetermined eligibility is stated, never drawn eligible");
  assert.deepEqual(rawKeys(p), []);
  /* control: an eligible row with nothing withheld carries no gap mark */
  const one = await open("/app/held", { plane: { heldcaptures: ok({ ok: true, held: [ROWS[0]] }) } });
  assert.equal(main(one).querySelector("[data-gap]"), null);
});

test("R4 rows are picked (shell R19) and the hold strip offers heldsetaside and release; an archive's files open open-file", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: HELD } });
  assert.equal(btn(p, "release"), null, "no strip before a pick");
  await pick(p, "INFO-2026-0001-photo");
  const strip = main(p).querySelector(".cs-hold");
  assert.ok(strip.querySelector('button[data-act="heldsetaside"]'));
  assert.ok(strip.querySelector('button[data-act="release"]'));
  assert.match(strip.textContent, /1 picked/);
  const file = main(p).querySelector(`a.cs-ref[href="/app/open-file/${"e".repeat(64)}"]`);
  assert.equal(file.textContent, "01_Agenda.pdf");
  /* a document's screen is screens-inquiry's: registered alone, this module's page draws its card (shell R16) */
  assert.ok(main(p).querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "City budget"));
  assert.match(text(p), /An archive: 36 files filed and held beside it, 2 not filed/);
  assert.match(text(p), /1 of 36 files shown/);
});

test("R4 release: an enumerated selection of the picked rows, then the release over its handle, with the member's acknowledgment and mitigation", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: HELD, select: ok({ ok: true, handle: "SEL-1", n: 2 }),
    release: ok({ ok: true, released: ["INFO-2026-0001-photo", "INFO-2026-0002-budget"] }) } });
  await pick(p, "INFO-2026-0001-photo");
  await pick(p, "INFO-2026-0002-budget");
  fill(p, { "ch-ack": "Each copy is what its source gave.", "ch-mitigation": "Compared with the site." });
  await press(p, "release");
  assert.deepEqual(p.byOp("select")[0].body, { ids: ["INFO-2026-0001-photo", "INFO-2026-0002-budget"] });
  assert.deepEqual(p.byOp("release")[0].body, { handle: "SEL-1", acknowledgment: "Each copy is what its source gave.", mitigation: "Compared with the site." });
  assert.match(text(p), /Vouched for: 2\./);
  assert.ok(p.byOp("heldcaptures").length >= 2, "read again after the act (R8)");
});

test("R4 release sends nothing with a field missing, or a field outside ratification R20's bounds", async () => {
  const cases = [[{ "ch-ack": "", "ch-mitigation": "" }, /Say why first|say: What you vouch for, What you did to check\./],
                 [{ "ch-ack": "a", "ch-mitigation": "" }, /say: What you did to check\./],
                 [{ "ch-ack": 'has a " quote', "ch-mitigation": "ok" }, /at most 500 characters, with no quotation marks/],
                 [{ "ch-ack": "two\nlines", "ch-mitigation": "ok" }, /no quotation marks, backslashes or line breaks/],
                 [{ "ch-ack": "x".repeat(501), "ch-mitigation": "ok" }, /at most 500 characters/]];
  for (const [values, words] of cases) {
    const p = await open("/app/held", { plane: { heldcaptures: HELD, select: ok({ ok: true, handle: "SEL" }) } });
    await pick(p, "INFO-2026-0001-photo");
    fill(p, values);
    const r = await press(p, "release");
    assert.equal(p.byOp("select").length + p.byOp("release").length, 0, JSON.stringify(values));
    assert.match(r.slot().textContent, words);
  }
  /* control: at 500 characters it is sent; a refused selection sends no release */
  const p = await open("/app/held", { plane: { heldcaptures: HELD, select: ok({ ok: true, handle: "SEL" }) } });
  await pick(p, "INFO-2026-0001-photo");
  fill(p, { "ch-ack": "x".repeat(500), "ch-mitigation": "ok" });
  await press(p, "release");
  assert.equal(p.byOp("release").length, 1);
  const q = await open("/app/held", { plane: { heldcaptures: HELD, select: refused("TOO_LARGE") } });
  await pick(q, "INFO-2026-0001-photo");
  fill(q, { "ch-ack": "a", "ch-mitigation": "b" });
  const r = await press(q, "release");
  assert.equal(q.byOp("release").length, 0);
  assert.match(r.slot().textContent, /could not be gathered/);
});

test("R4 heldsetaside: one reason (the shell's reason field, no writing help) for every picked row; the rows set aside stay in view with heldrestore", async () => {
  const p = await open("/app/held", { reachable: true, plane: { heldcaptures: HELD,
    heldsetaside: ok({ ok: true, act: "set_aside", ids: ["INFO-2026-0002-budget"], reason: "Wrong year.",
      documents: [{ id: "INFO-2026-0002-budget", waiting: [{ question: "INQ-1", title: "Were the transfers authorised?", asker: "Ana" }] }] }),
    heldrestore: ok({ ok: true, act: "restore", ids: ["INFO-2026-0002-budget"] }) } });
  assert.equal(btn(p, "heldrestore"), null);
  await pick(p, "INFO-2026-0002-budget");
  const r = await press(p, "heldsetaside", { reason: "Wrong year." });
  assert.equal(r.slot() && r.slot().querySelector('[data-act="writinghelp"]'), null, "no writing help on a reason (K1841)");
  assert.deepEqual(p.byOp("heldsetaside")[0].body, { ids: ["INFO-2026-0002-budget"], reason: "Wrong year." });
  assert.match(text(p), /Set aside: 1\. They can be restored, with a reason\./);
  assert.match(text(p), /Ana's question “Were the transfers authorised\?” was waiting for it/);
  await press(p, "heldrestore", { reason: "Right year after all." });
  assert.deepEqual(p.byOp("heldrestore")[0].body, { ids: ["INFO-2026-0002-budget"], reason: "Right year after all." });
  assert.match(text(p), /Restored: 1\./);
  assert.equal(btn(p, "heldrestore"), null);
});

test("R4 heldcaptures (\"See held captures\") asks the list again", async () => {
  const p = await open("/app/held", { plane: { heldcaptures: HELD } });
  await press(p, "heldcaptures", { reason: "refresh" });
  assert.ok(p.byOp("heldcaptures").length >= 2);
});

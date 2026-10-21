/* screens-investigate, T51 fix round 3 (wave 2): C59 and N3 (one passage picker, R34), C14 (the pickers read when the screen opens, R34, R52),
 * C95 (the cite list's preselection, R34), each over a scripted plane, with the control that shows the fix is the cause. C8 is in money.test.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, fill, press, PATHS, P, ENT, ORG, SHA, SHA2, MSR, word, drew, notDrew } from "./fixtures.mjs";

const wordsOf = (p, id) => p.doc.querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith(id + "-"));
const unitsOf = (p, id) => wordsOf(p, id).querySelectorAll('[data-shell="word"]').map((e) => e.textContent);
const pickWord = async (p, id, i) => { await p.click(wordsOf(p, id).querySelectorAll('[data-shell="word"]')[i]); await p.settle(); };
const heading = (p, id) => main(p).querySelectorAll("[data-passage]").filter((e) => e.getAttribute("data-passage") === id);
const NOT_READ = word("retrieval.notread.not_extracted");
const orgAt = "/app/person/" + ORG;
const orgPlane = { entity: (r) => ok(r.query.id === ORG ? { ok: true, found: true, entity: { entity_id: ORG, kind: "institution", label: "Public Works Department", note: "", aliases: [], relations: [] } } : { ok: false, found: false }),
  person: refusedIn("NOT_A_PERSON", "The record named is not a person."), samepersoncandidates: refusedIn("NOT_A_PERSON", "The record named is not a person.") };

const SCREENS = [
  ["person", PATHS.person, "person-fact-doc", "person-fact-passage"],
  ["organization", orgAt, "person-fact-doc", "person-fact-passage", orgPlane],
  ["money", PATHS.money, "mf-doc", "mf-passage"],
  ["timeline", PATHS.timeline, "tl-doc", "tl-passage"],
];

for (const [name, path, doc, words, extra] of SCREENS) {
  test(`R34 C59 ${name}: "Choose the passage on the document" is drawn with the chosen document's words, from its reading; control: a document with a reading lists its passages`, async () => {
    const p = await open(path, { plane: extra || {} });
    assert.equal(heading(p, words).length, 1, "the heading is drawn, once");
    assert.ok(heading(p, words)[0].textContent.includes(word("form.choose.passage")));
    assert.deepEqual(unitsOf(p, words), ["Lin Chen, Director of Public Works", "Appointed in March 2022"], "the first document's words");
    assert.equal(p.byOp("reading")[0].query.sha256, SHA);
    assert.equal(main(p).querySelector('[data-state="failed"]'), null, "nothing failed");
    /* choosing the other document redraws the words from that document's reading */
    fill(p, { [doc]: SHA2 });
    p.fire(p.doc.getElementById(doc), "change");
    await p.settle();
    assert.deepEqual(unitsOf(p, words), ["Monthly rent is due on the first."]);
  });

  test(`R34 N3 ${name}: a document with no reading, or one that cannot be read, says why; never "Nothing here" nor "Could not read this"; control: a document with a reading draws no such sentence`, async () => {
    for (const reading of [ok({ ok: true, sha256: SHA, unread_pages: [], text_units: [] }), refusedIn("NOT_READ", ""), () => ({ ok: false })]) {
      const p = await open(path, { plane: Object.assign({ reading }, extra || {}) });
      const sec = main(p).textContent;
      assert.ok(sec.includes(NOT_READ), "the reason is said");
      assert.ok(!sec.includes(word("shell.unread")), "not 'could not read this'");
      assert.equal(wordsOf(p, words), undefined, "no words to select");
      assert.ok(heading(p, words).length === 1, "the heading stays");
    }
    const read = await open(path, { plane: extra || {} });
    assert.ok(!main(read).textContent.includes(NOT_READ), "control: a reading draws no reason");
  });
}

test("R34 C59 money and timeline send the passage chosen on screen, and the whole document when none is chosen", async () => {
  const m = await open(PATHS.money, { plane: { recordfact: ok({ ok: true, fact_id: "MNY-2026-new", grade: { reading: "B" } }), moneysetpropose: ok({ ok: true }) } });
  await pickWord(m, "mf-passage", 1);
  fill(m, { "mf-amount": "1200", "mf-asread": "$1,200" });
  await press(m, "recordfact");
  assert.deepEqual(m.byOp("recordfact")[0].body.source, { capture_sha: SHA, extent: { kind: "pdf-page", page: 1 } });
  await pickWord(m, "mf-passage", 1);
  fill(m, { "mf-amount": "1200", "mf-asread": "$1,200" });
  await press(m, "recordfact");
  assert.deepEqual(m.byOp("recordfact")[1].body.source, { capture_sha: SHA, extent: { kind: "document" } }, "control: nothing selected");
  const t = await open(PATHS.timeline, { plane: { createevent: ok({ ok: true, event_id: "EVT-2026-0099" }) } });
  await pickWord(t, "tl-passage", 0);
  await press(t, "createevent", { reason: "the minutes record it" });
  assert.deepEqual(t.byOp("createevent")[0].body.attestations, [{ captureSha: SHA, extent: { kind: "pdf-page", page: 0 } }]);
});

test("R34 C59 each document's words are their own selection: words picked on one document are not sent for another (control: back on the first, still picked)", async () => {
  const p = await open(PATHS.timeline, { plane: { createevent: ok({ ok: true, event_id: "EVT-2026-0099" }) } });
  await pickWord(p, "tl-passage", 1);
  fill(p, { "tl-doc": SHA2 });
  p.fire(p.doc.getElementById("tl-doc"), "change");
  await p.settle();
  await press(p, "createevent", { reason: "the minutes record it" });
  assert.deepEqual(p.byOp("createevent")[0].body.attestations, [{ captureSha: SHA2, extent: { kind: "document" } }], "the other document is cited whole");
  fill(p, { "tl-doc": SHA });
  p.fire(p.doc.getElementById("tl-doc"), "change");
  await p.settle();
  await press(p, "createevent", { reason: "the minutes record it" });
  assert.deepEqual(p.byOp("createevent")[1].body.attestations, [{ captureSha: SHA, extent: { kind: "pdf-page", page: 1 } }]);
});

/* screens-inquiry fix round 4 (T51), the document screen: C36 aside (R3, R69: the "Your citations" row of a web page names the paragraph the question rests on and the
 * words it cites, and never ends on a separator), N5 and the cite refusal's repairs (R129), C14 (the screen's read set). On interface-shell's served page over a
 * scripted plane; every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, boot } from "../interface-shell/harness.mjs";
import { open, storeWorld, main, says, word, SCREENS, P, Q, Q2, D, SHA, DOCUMENT_MD, inquiryMd } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const text = (el) => String(el && el.textContent || "");
const WEB_WORDS = "Potholes reported through 311 are repaired within seven days.";
const unit = (seq, extent, t) => ({ seq, extent, reference: "u" + seq, truncated: false, text: t });
const TWO = { [D]: { "bundle.md": DOCUMENT_MD, "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: SHA } }] }) } };
const backs = ok({ ok: true, target: D, backlinks: [{ from: Q, from_type: "inquiry", from_title: "Seven days?", rel: "cites" }] });
/* the real world (store-assembly's store with the real door; the state is made by real acts, K5054): a page as `as` reads it over the world's door, `plane` scripting only the ops it names */
const OWN = { capabilities: ["contribute", "create_projects"] };
async function pageOn(world, as, path, o = {}) {
  const { door, session } = world.boot(as);
  const p = await boot({ screens: SCREENS, door, session, path, ...o });
  await p.settle();
  return p;
}
/** A member with a web page (`kind: "page"`, read unless `read: false`) held in her project, and a question of the project drawn into it. */
async function member({ read = true } = {}) {
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const html = "<html><head><title>Policy memo</title></head><body><p>The Director shall repair each reported pothole within seven days.</p><p>Repairs are recorded as closed when the crew reports the work complete.</p></body></html>";
  const held = await world.recipes.hold(ann, "Policy memo", html, project, { type: "text/html", read });
  const q = await world.recipes.question(ann, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?", draw: true });
  return { world, ann, project, question: q.id, document: held.bundle, sha: held.sha, at: "/app/document/" + held.bundle };
}
const rowsOf = (p) => main(p).querySelectorAll("[data-leg-row]");

test("R3 R69 C36-aside the 'Your citations' row of a web page names the paragraph the question rests on and the words it cites, and no row ends on a separator with nothing after it; control: a paged document names its page and its words", async () => {
  const web = [{ target: D, role: "supports", grade: "B", extent_kind: "doc-para", extent_para: 2 }];
  const md = (legs) => inquiryMd(P, undefined, { legs });
  const p = await open(at, { images: { [Q]: { "bundle.md": md(web) }, ...TWO }, plane: { backlinks: () => backs,
    reading: ok({ ok: true, found: true, capture_sha: SHA, reading: { content_type: "text/html", found: true }, text_units: [unit(0, { kind: "doc-para", para: 2, run: null }, WEB_WORDS)], unread_pages: [] }) } });
  const row = rowsOf(p)[0];
  assert.ok(says(row, "screen.question.leg.paragraph", { n: "3" }), "the paragraph it rests on, drawn from one");
  assert.ok(text(row).includes("“" + WEB_WORDS + "”"), "and the words it cites");
  assert.ok(text(row).includes("Pothole repairs"), "beside its project");
  assert.ok(!/·\s*(·|$)/.test(text(row.querySelector(".mk-small, [data-leg-state]") ? row : row).replace(/Ask whether[\s\S]*$/, "")), "no separator with nothing after it");
  /* the same row after the question was asked and the record could not say whether the paragraph differs: still no separator with nothing after it */
  const asked = await open(at, { images: { [Q]: { "bundle.md": md(web) }, ...TWO }, plane: { backlinks: () => backs,
    reevaluationnotices: ok({ ok: true, notices: [] }),
    versionnotice: ok({ ok: true, target: Q, notices: [{ ord: 0, target: D, content_id: "c1", capture_sha: SHA, state: "newer_capture_matched", newer: true, affects: "undetermined", candidates: [{ capture_sha: "9".repeat(64), first_retrieved: "2026-10-09T09:00:00Z" }], chains: [] }], count: 1, wrote: false }),
    reading: ok({ ok: true, found: true, capture_sha: SHA, reading: { content_type: "text/html", found: true }, text_units: [unit(0, { kind: "doc-para", para: 2, run: null }, WEB_WORDS)], unread_pages: [] }) } });
  await asked.click(rowsOf(asked)[0].querySelector('button[data-act="versionnotice"]'));
  await asked.settle();
  const after = rowsOf(asked)[0];
  assert.ok(text(after).includes("“" + WEB_WORDS + "”") && says(after, "screen.question.leg.paragraph", { n: "3" }), "the place and the words stay after the answer");
  assert.ok(after.querySelector('.cs-gap[data-gap="undetermined"]'), "the section marked undetermined, as R69 says");
  const paged = await open(at, { images: { [Q]: { "bundle.md": md([{ target: D, role: "supports", grade: "B", extent_kind: "pdf-page", extent_page: 2 }]) }, ...TWO }, plane: { backlinks: () => backs,
    reading: ok({ ok: true, found: true, capture_sha: SHA, reading: { content_type: "application/pdf", found: true }, text_units: [unit(0, { kind: "pdf-page", page: 2, rect: null }, "Page three words.")], unread_pages: [] }) } });
  const r2 = rowsOf(paged)[0];
  assert.ok(says(r2, "screen.document.place.restson", { page: "3" }) && text(r2).includes("“Page three words.”"), "control: a paged document names its page and its words");
});

/* ---- R129 / R3 / citation R21: a cite refused draws no repair control (fix round 10, item 35: citation R21 retired its C-2.8 arm, K5101, so a refusal's `repairs` is always []) ---- */
const CHECK = "C-2.8";
const JARGON = "1 basis leg carries no ground while 1 do: a basis is grouped WHOLE or not at all";
const refusedCite = (extra = {}) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "BASIS_REFUSED", code: "BASIS_REFUSED",
  findings: [{ check: CHECK, code: null, detail: JARGON, repairs: [] }], repairs: [], ...extra } } });

test("R129 R3 a cite refused draws its finding in words and no repair control; a cite that lands draws none either (citation answers no repairs since R21)", async () => {
  const p = await open(at, { plane: { cite: () => refusedCite() } });
  const el = p.doc.getElementById("document-cite-question");
  el.value = Q; p.fire(el, "change"); await p.settle();
  await p.click(main(p).querySelector('button[data-act="cite"]'));
  await p.settle();
  assert.equal(main(p).querySelectorAll('button[data-act="cite"][data-repair]').length, 0, "no repair act");
  assert.ok(!main(p).querySelector('[data-cite="repair"]'), "and no repair block");
  assert.ok(text(main(p)).includes(JARGON) || text(main(p)).includes(CHECK), "the refusal is still told by its finding");
  const w = await member();
  const landed = await pageOn(w.world, w.ann, w.at);
  const el2 = landed.doc.getElementById("document-cite-question");
  el2.value = w.question; landed.fire(el2, "change"); await landed.settle();
  await landed.click(main(landed).querySelector('button[data-act="cite"]')); await landed.settle();
  const held = await w.ann.read("backlinks", { query: { target: w.document } });
  assert.ok(held.backlinks.some((b) => b.from === w.question), "the world holds the citation the page made");
  assert.equal(main(landed).querySelectorAll('button[data-act="cite"][data-repair]').length, 0, "control: a cite that lands draws none");
});

/* ---- R129 / N5: an unread copy can be read ---- */
import { RE_POINTS } from "../../../src/interface-shell/index.mjs";
import { press, actsIn, READING } from "./fixtures.mjs";

test("R129 N5 interface-shell lists readheld among the acts of document (its RE_POINTS, until the registry does): CAUSE-SHELL-4's line, red by name until it merges", () => {
  assert.ok(Array.isArray(RE_POINTS.document) && RE_POINTS.document.includes("readheld"), "interface-shell's RE_POINTS names readheld for document");
});

const UNREAD = ok({ ok: true, found: false, capture_sha: SHA, reading: null });
test("R129 N5 a copy stored with no reading says so and offers Read it now; pressing it sends readheld with the digest, and the page then draws the reading; control: a copy with a reading offers none", async () => {
  const w = await member({ read: false });
  const p = await pageOn(w.world, w.ann, w.at);
  assert.ok(actsIn(main(p)).includes("readheld"), "Read it now is offered");
  assert.ok(says(main(p), "screen.document.text.unread"), "the page already says the copy is unread");
  assert.ok(text(main(p).querySelector('button[data-act="readheld"]')).includes(word("document.read.title")), "and the act's label is a held word (the owed row's stand-in), not a key");
  await press(p, "readheld", { reason: "the photo was filed before it could be read" });
  const sent = p.byOp("readheld");
  assert.equal(sent.length, 1);
  assert.equal((sent[0].body || {}).sha, w.sha, "the digest, in the body");
  const real = await w.ann.read("reading", { query: { sha256: w.sha } });
  assert.equal(real.found, true, "the world read it");
  const figure = (k) => (real[k] !== undefined ? real[k] : real.reading[k]);
  assert.ok(says(main(p), "screen.document.text.read", { read: String(figure("words_read")), total: String(figure("words_total")) }), "the reading is drawn: Read N of M words, as the world counted them");
  assert.ok(!actsIn(main(p)).includes("readheld") && !says(main(p), "screen.document.text.unread"), "and the offer goes");
  /* control: a copy with a reading held offers none, and sends nothing on load */
  const r = await member();
  const held = await pageOn(r.world, r.ann, r.at);
  assert.ok(!actsIn(main(held)).includes("readheld"), "control: a copy with a reading offers no such act");
  assert.equal(held.byOp("readheld").length, 0);
});

test("R129 N5 a refusal to read says why in words: the original not held whole, or no record to read it into; control: a copy read by someone else meanwhile (READING_HELD) is read again and draws its reading", async () => {
  for (const why of ["NO_WHOLE_OBJECT", "NO_HOME"]) {
    /* still scripted (reading, readheld): needed: a copy held with no original object under its digest (NO_WHOLE_OBJECT), and one whose digest names no home bundle (NO_HOME) */
    const p = await open(at, { plane: { reading: UNREAD, readheld: ok({ ok: true, read: false, why }) } });
    await press(p, "readheld", { reason: "read it" });
    assert.ok(says(main(p).querySelector('[data-outcome="readheld"]'), why === "NO_HOME" ? "refusal.CAPTURE_NOT_HELD" : "transcribe.why.evidenceabsent"), why + " is said, in the nearest words held (the rows owed are asked of the design)");
    assert.ok(actsIn(main(p)).includes("readheld"), "and the act stays, for when it can be done");
  }
  /* the copy is read by someone else (here, her own act) while the page stands open on it unread: the world answers READING_HELD, and the page reads it again */
  const w = await member({ read: false });
  const p = await pageOn(w.world, w.ann, w.at);
  assert.ok(actsIn(main(p)).includes("readheld"), "offered, as the page found it");
  const meanwhile = await w.ann.act("readheld", { query: { sha256: w.sha }, body: { sha: w.sha } });
  assert.equal(meanwhile.read, true);
  await press(p, "readheld", { reason: "read it" });
  assert.equal(p.byOp("readheld").length, 1);
  assert.ok(!says(main(p), "screen.document.text.unread"), "control: READING_HELD reads the copy again and draws what is there");
  assert.equal(main(p).querySelector('[data-outcome="readheld"]'), null, "and says nothing against it");
});

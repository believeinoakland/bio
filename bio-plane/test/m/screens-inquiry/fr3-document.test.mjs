/* screens-inquiry fix round 2 of T51 (SCREENS-INQUIRY #18, package A), the `document` screen: C31 (R125, R3: the cite act sends a body and marks the
 * passage), C33 (R123, R55, R113: retire's refusals in their own sentences; a held copy is set aside, not retired), C40 (R55: one act obtains both
 * confirmations), C42 (R124, R69: a move of citations only where it can be done), C95 (R3: the cite picker), C94 (interface-shell R111: members by
 * handle), C17 (R96: "read N of M words"), DEC-394 (3d, 3e: R126 `resolvetestify`, R127 `contradictionflag`), C41 (R117, R35, R50: the unplaced legs).
 * On interface-shell's served page over a scripted plane; the shell's guard checks every request against its owner's declaration. Every expectation
 * is a word read by key (K3810); no test holds a sentence's English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { ok, refusedIn, boot } from "../interface-shell/harness.mjs";
import { main, actsIn, fill, press, says, section, word, plane, READING, DOCUMENT_MD, provenanceOf, inquiryMd, INQUIRY_REFS, SCREENS, P, Q, Q2, D, SHA, NEWER } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const text = (el) => String(el && el.textContent || "");
async function openWith(path, o = {}) {
  const p = await boot({ screens: SCREENS, plane: plane(o), path, ...(o.boot || {}) });
  await p.settle();
  return p;
}
/** A choice changed as a member does it: the value set and the change fired (the kit's choice that redraws, interface-shell R90). */
async function choose(p, id, value) {
  const el = p.doc.getElementById(id);
  el.value = value;
  p.fire(el, "change");
  await p.settle();
}

/* ---- C31 / R125 / R3: the cite act sends a body and marks the passage ---- */
const LEG_ON_PAGE_3 = [{ target: D, role: "supports", grade: "B", extent_kind: "pdf-page", extent_page: 2 }];
const REF = `${D}#x`;
/** The plane where the question's bundle gains its leg once `cite` has answered (the page reads the question's image again). */
function citingPlane() {
  const base = plane();
  const state = { cited: false };
  return { state, plane: {
    image: (r) => (r.query.id === Q ? ok({ "bundle.md": inquiryMd(P, INQUIRY_REFS, { legs: state.cited ? LEG_ON_PAGE_3 : [] }) }) : base.image(r)),
    cite: () => { state.cited = true; return ok({ ok: true, inquiry: Q, role: "supports", cited: [REF], alreadyCited: [] }); } } };
}

test("R125 R3 C31 the cite act sends the project, role and passage in the request body and none of them in the address", async () => {
  const { plane: pl } = citingPlane();
  const p = await openWith(at, { plane: pl });
  await choose(p, "document-cite-question", Q);
  fill(p, { "document-cite-role": "cuts_against" });
  await press(p, "cite");
  const r = p.byOp("cite")[0];
  const found = typeof r.body.found === "string" ? JSON.parse(r.body.found) : r.body.found;
  assert.deepEqual([r.body.project, r.body.role, found], [Q, "cuts_against", { capture_sha: SHA, extent: { kind: "pdf-page", page: 2 }, kind: "passage" }], "the body carries the three fields");
  for (const f of ["project", "role", "found"]) assert.ok(!(f in r.query), `control: ${f} is not in the address`);
});

test("R125 R3 C31 once cited, the passage is marked on the reading as cited by this question; control: a passage not cited, and a reading before any cite, draw no mark", async () => {
  const { plane: pl } = citingPlane();
  const p = await openWith(at, { plane: pl });
  assert.equal(main(p).querySelector("[data-passage-cited]"), null, "control: nothing cited, no mark");
  await choose(p, "document-cite-question", Q);
  assert.equal(main(p).querySelector("[data-passage-cited]"), null, "control: the question chosen, the passage not cited in it, no mark");
  await press(p, "cite");
  const mark = main(p).querySelector("[data-passage-cited]");
  assert.ok(mark, "the passage cited is marked");
  assert.equal(mark.getAttribute("data-passage-cited"), Q, "as cited by this question");
  assert.ok(says(mark, "screen.finder.cite.cited") && mark.querySelector(`a.cs-ref[href="/app/question/${Q}"]`), "by its key, with the question as a reference");
  /* the passage on the next page (page 4) was not cited: control */
  const next = p.doc.getElementById("document-read-page").querySelectorAll("label").find((l) => l.textContent.includes(word("document.read.next"))).querySelector("input");
  next.checked = true; p.fire(next, "change"); await p.settle();
  assert.equal(main(p).querySelector("[data-passage-cited]"), null, "control: the other passage draws none");
  /* a question that holds a leg on this document at that passage is marked without a cite at all (the question the copy was held for) */
  const held = await openWith(at, { images: { [Q]: { "bundle.md": inquiryMd(P, INQUIRY_REFS, { legs: LEG_ON_PAGE_3 }) } },
    plane: { heldcaptures: ok({ ok: true, held: [{ bundle_id: D, capture: { sha256: SHA }, captured_for: { questions: [{ question: Q, title: "Seven days?" }] } }] }) } });
  assert.equal(held.doc.getElementById("document-cite-question").value, Q);
  assert.equal(main(held).querySelector("[data-passage-cited]").getAttribute("data-passage-cited"), Q, "the question already holding a leg there marks the passage");
});

/* ---- C33 / R123 / R55 / R113: retire, and a held copy ---- */
const HELD_ROW = { bundle_id: D, title: "Pothole repair policy", project: P, collected_since: "2026-10-02T09:00:00Z", capture: { sha256: SHA, grade: { grade: "B" } },
  captured_for: { questions: [{ question: Q, title: "Seven days?", asker: "mai" }], withheld: null } };
const HELD = ok({ ok: true, held: [HELD_ROW] });
const dialog = (p) => p.root().querySelector('[role="dialog"]');
const slotOf = (p, op) => p.root().querySelector(`[data-slot="${p.root().querySelector(`button[data-act="${op}"]`).getAttribute("data-ai")}"]`);
/** Retire pressed and confirmed with a reason; the slot beside the act, where the answer is drawn. */
async function retireIt(p) {
  await press(p, "retire");
  dialog(p).querySelector("textarea").value = "captured from the wrong page";
  await p.click(dialog(p).querySelector('[data-shell="confirm"]'));
  await p.settle();
  return slotOf(p, "retire");
}
const SELECT = { select: (r) => ok({ ok: true, handle: "SEL-9", items: r.body.ids }) };

test("R123 R55 R113 C33 a held copy offers no retire; control: a vouched copy offers it, as does a copy of no held row", async () => {
  const held = await openWith(at, { plane: { heldcaptures: HELD } });
  assert.ok(main(held).querySelector("[data-held]"), "the copy is held");
  assert.ok(!actsIn(main(held)).includes("retire"), "a held copy offers no retire");
  assert.equal(main(held).querySelector('[data-fold="retire"]'), null, "nor the fold that holds it");
  const vouched = await openWith(at, { plane: { heldcaptures: HELD, ...SELECT, release: ok({ ok: true, released: [D] }) } });
  fill(vouched, { "document-release-ack": "Checked", "document-release-mitigation": "None needed" });
  await press(vouched, "release");
  assert.ok(main(vouched).querySelector("[data-vouched]"), "vouched for");
  assert.ok(actsIn(main(vouched)).includes("retire"), "control: a vouched copy offers retire");
  const plain = await openWith(at);
  assert.ok(actsIn(main(plain)).includes("retire"), "control: a copy that is no held row of hers offers retire");
});

const TWO_CITERS = { backlinks: ok({ ok: true, target: D, backlinks: [{ from: Q, from_type: "inquiry", from_title: "Seven days?", rel: "cites" },
  { from: Q2, from_type: "inquiry", from_title: "Does closed mean repaired?", rel: "cites" }] }) };
const cited = (extra = {}) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "CITED", code: "CITED", translation: "This copy is cited.", offenders: [{ id: D, citedBy: [Q, Q2] }], ...extra } } });

test("R123 R113 C33 retire answered CITED draws the questions that cite the copy as references and not the release act's sentence", async () => {
  const p = await openWith(at, { plane: { ...SELECT, ...TWO_CITERS, retire: cited() } });
  const slot = await retireIt(p);
  const refs = slot.querySelectorAll("a.cs-ref");
  assert.deepEqual(refs.map((a) => a.getAttribute("href")), ["/app/question/" + Q, "/app/question/" + Q2], "both questions, each a door to its page");
  assert.deepEqual(refs.map(text), ["Seven days?", "Does closed mean repaired?"], "named by their titles");
  assert.ok(!says(slot, "refusal.ILLEGAL_TRANSITION"), "never the release act's sentence");
  /* control: without the refusal's own list the page's questions that cite the copy are drawn */
  const q = await openWith(at, { plane: { ...SELECT, ...TWO_CITERS, retire: cited({ offenders: undefined }) } });
  const slot2 = await retireIt(q);
  assert.equal(slot2.querySelectorAll("a.cs-ref").length, 2, "from the page's own backlinks");
});

test("R123 R113 C33 retire answered ILLEGAL_TRANSITION does not draw the release act's sentence", async () => {
  const illegal = { status: 200, json: { ok: true, result: { ok: false, reason: "ILLEGAL_TRANSITION", code: "ILLEGAL_TRANSITION", translation: word("refusal.ILLEGAL_TRANSITION"), to: "retired" } } };
  const p = await openWith(at, { plane: { ...SELECT, retire: illegal } });
  const slot = await retireIt(p);
  assert.ok(!says(slot, "refusal.ILLEGAL_TRANSITION") && !text(slot).includes(word("refusal.ILLEGAL_TRANSITION")), "not the release sentence");
  assert.equal(p.byOp("retire").length, 1, "the retire was sent");
  /* control: a vouched, uncited copy retires as before */
  const state = { retired: false };
  const base = plane();
  const RETIRED_MD = DOCUMENT_MD.replace("\nsource:", "\ncurrent_state: retired\nsource:");
  const ok2 = await openWith(at, { plane: { ...SELECT, image: (r) => (r.query.id === D && state.retired ? ok({ "bundle.md": RETIRED_MD, "data/provenance.json": provenanceOf(SHA) }) : base.image(r)),
    retire: () => { state.retired = true; return ok({ ok: true, retired: [D] }); } } });
  await retireIt(ok2);
  assert.ok(main(ok2).querySelector("[data-retired]"), "control: retired as before");
});

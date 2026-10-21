/* screens-inquiry fix round 4 (T51), the document screen: C36 aside (R3, R69: the "Your citations" row of a web page names the paragraph the question rests on and the
 * words it cites, and never ends on a separator), N5 and the cite refusal's repairs (R129), C14 (the screen's read set). On interface-shell's served page over a
 * scripted plane; every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, says, word, P, Q, Q2, D, SHA, DOCUMENT_MD, inquiryMd } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const text = (el) => String(el && el.textContent || "");
const WEB_WORDS = "Potholes reported through 311 are repaired within seven days.";
const unit = (seq, extent, t) => ({ seq, extent, reference: "u" + seq, truncated: false, text: t });
const TWO = { [D]: { "bundle.md": DOCUMENT_MD, "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: SHA } }] }) } };
const backs = ok({ ok: true, target: D, backlinks: [{ from: Q, from_type: "inquiry", from_title: "Seven days?", rel: "cites" }] });
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

/* ---- R129 / R3 / citation R21: a cite refused with repairs ---- */
import { fill } from "./fixtures.mjs";
const CHECK = "C-2.8";
const JARGON = "1 basis leg carries no ground while 1 do: a basis is grouped WHOLE or not at all";
const REPAIRS = [{ key: "citation.index.repair_add_to_group", act: "cite", fields: { ground: "G1" }, text: "Add it to the group G1" },
  { key: "citation.index.repair_remove_grouping", act: "inquiryground", fields: { target: Q, grounds: [] }, text: "Take the grouping off" }];
const refusedCite = (extra = {}) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "BASIS_REFUSED", code: "BASIS_REFUSED",
  findings: [{ check: CHECK, code: null, detail: JARGON, repairs: [] }], repairs: REPAIRS, ...extra } } });
const REF = `${D}#x`;
/** The plane where the first cite is refused as the walker's state is (the only citation grouped), and the next one lands once the grouping is repaired. */
function groupedPlane() {
  const state = { repaired: false, cites: 0 };
  return { state, plane: {
    cite: (r) => { state.cites += 1; return state.repaired || (r.body && r.body.ground === "G1") ? ok({ ok: true, inquiry: Q, role: "supports", cited: [REF], alreadyCited: [] }) : refusedCite(); },
    inquiryground: () => { state.repaired = true; return ok({ ok: true, target: Q }); } } };
}
async function pressedRefusal() {
  const { plane: pl, state } = groupedPlane();
  const p = await open(at, { plane: pl });
  const el = p.doc.getElementById("document-cite-question");
  el.value = Q; p.fire(el, "change"); await p.settle();
  await p.click(main(p).querySelector('button[data-act="cite"]:not([data-repair])'));
  await p.settle();
  return { p, state };
}
const repairButtons = (p) => main(p).querySelectorAll('button[data-act="cite"][data-repair]');

test("R129 R3 a cite refused because the only citation is grouped draws the two repairs as acts, each in the words citation gives it, beside the refusal; control: a refusal with no repairs draws none, and a cite that lands draws none", async () => {
  const { p } = await pressedRefusal();
  const acts = repairButtons(p);
  assert.equal(acts.length, 2, "two repairs, each an act");
  assert.ok(text(acts[0]).includes(word("citation.index.repair_add_to_group", { ground: "G1" })), "the first: add it to the group, naming the group");
  assert.ok(text(acts[1]).includes(word("citation.index.repair_remove_grouping")), "the second: take the grouping off");
  assert.ok(main(p).querySelector('[data-cite="repair"] textarea, [data-cite="repair"] input') !== null, "and the second asks her reason");
  const none = await open(at, { plane: { cite: () => refusedCite({ repairs: [] }) } });
  const el = none.doc.getElementById("document-cite-question");
  el.value = Q; none.fire(el, "change"); await none.settle();
  await none.click(main(none).querySelector('button[data-act="cite"]:not([data-repair])')); await none.settle();
  assert.equal(repairButtons(none).length, 0, "control: a refusal with no repairs draws none");
  const landed = await open(at, { plane: { cite: ok({ ok: true, inquiry: Q, role: "supports", cited: [REF], alreadyCited: [] }) } });
  const el2 = landed.doc.getElementById("document-cite-question");
  el2.value = Q; landed.fire(el2, "change"); await landed.settle();
  await landed.click(main(landed).querySelector('button[data-act="cite"]:not([data-repair])')); await landed.settle();
  assert.equal(repairButtons(landed).length, 0, "control: a cite that lands draws none");
});

test("R129 R3 adding the passage to the group sends the refused cite again with the group, and it lands; the repairs go", async () => {
  const { p, state } = await pressedRefusal();
  await p.click(repairButtons(p)[0]);
  await p.settle();
  const cites = p.byOp("cite");
  assert.equal(cites.length, 2, "the refused cite and the repaired one");
  assert.deepEqual([cites[1].body.project, cites[1].body.role, cites[1].body.ground], [Q, "supports", "G1"], "the original cite with the group the repair names");
  assert.deepEqual(cites[1].body.found, cites[0].body.found, "the same passage");
  assert.equal(p.byOp("inquiryground").length, 0, "control: no grouping change for this repair");
  assert.equal(repairButtons(p).length, 0, "the repairs go once the cite lands");
  assert.ok(main(p).querySelector("[data-cite-done=cited]"), "and the page says it was cited");
  assert.equal(state.cites, 2);
});

test("R129 R3 taking the grouping off asks her reason first and sends nothing without it; with it, the question's grouping is changed and the refused cite is sent again and lands", async () => {
  const { p } = await pressedRefusal();
  await p.click(repairButtons(p)[1]);
  await p.settle();
  assert.equal(p.byOp("inquiryground").length, 0, "no reason, nothing sent");
  assert.equal(p.byOp("cite").length, 1, "and the cite is not sent again");
  fill(p, { "document-cite-repair-reason": "the second passage stands alone" });
  await p.click(repairButtons(p)[1]);
  await p.settle();
  const g = p.byOp("inquiryground");
  assert.equal(g.length, 1);
  assert.deepEqual([g[0].body.target, g[0].body.grounds, g[0].body.reason], [Q, [], "the second passage stands alone"], "the grouping taken off, with her reason");
  const cites = p.byOp("cite");
  assert.equal(cites.length, 2, "then the refused cite again");
  assert.ok(!("ground" in cites[1].body), "as she first asked it");
  assert.equal(repairButtons(p).length, 0);
  assert.ok(main(p).querySelector("[data-cite-done=cited]"));
});

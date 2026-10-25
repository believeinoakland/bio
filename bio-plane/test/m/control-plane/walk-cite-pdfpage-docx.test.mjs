/* control-plane R17, R29 (fix round 10, final pass; K5138; CONTENT #23 J19 (R62, C-45.1), build/jobs/T51/content.md; WALK-FINAL diag2-06.md section 5): the walker's case through the real door.
   A member uploads a Word file (`captureupload`, a generated .docx), files it in her project, selects it (`select`, as the Document screen's "Confirm" does) and cites it into a question of hers
   with `extent_kind=pdf-page`, a kind a Word file cannot hold: `cite` answers BASIS_REFUSED carrying content's finding CONTENT_EXTENT_OUT_OF_RANGE (C-45.1), and writes nothing. Control: the same
   selection cited with `extent_kind=doc-para` (a kind a Word file holds) is accepted. Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { generate as docGenerate } from "../../docgen.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wcitedocx" });
after(() => kit.mf.dispose());
const R = kit.R;
const text = (v) => JSON.stringify(v || {});

test("R17, R29 (content R62, C-45.1): `cite` with extent_kind=pdf-page over a docx selection is refused BASIS_REFUSED carrying CONTENT_EXTENT_OUT_OF_RANGE and writes no leg; control: a doc-para extent over the same selection is cited", { timeout: 900000 }, async () => {
  const own = await kit.ownerOf("wcitedocx-ann");
  const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "Cite a page of a Word file");
  const g = docGenerate({ kind: "docx", seed: 5138, size: { units: 4 } });
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=wcitedocx&name=wcitedocx.docx&type=${encodeURIComponent(g.type)}`, { method: "POST", headers: own.auth, body: Buffer.from(await g.bytes()) })).json()).result;
  assert.equal(up.ok, true, text(up).slice(0, 400));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "wcitedocx", locator: up.document.locator, project });
  assert.equal(filed.refused, undefined, text(filed).slice(0, 400));
  /* the reading must have ended, so the capture's format is the one content judges the extent against */
  const read = await kit.until(async () => {
    const r = R(await kit.get(own.auth, { op: "reading", sha256: up.capture.sha256 }));
    const c = r && r.completeness;
    return r && r.found === true && r.more !== true && c && (c.state === "whole" || c.failure === "final") ? r : null;
  }, 240000, 2000);
  assert.ok(read, "the reading of the Word file ended");
  const question = await kit.questionOf(own.auth, project, "Which page of the minutes carries the vote?");
  const sel = R(await cs.call("select", { body: { ids: [filed.bundleId] } }));
  assert.ok(sel && sel.handle, "a selection: " + text(sel).slice(0, 300));

  const refused = await kit.post(own.auth, "cite", { project: question, handle: sel.handle, role: "supports", extent_kind: "pdf-page", extent_page: "1" });
  const r = R(refused.body);
  assert.equal(r.ok, false, kit.gateLine(refused));
  assert.equal(r.reason, "BASIS_REFUSED", kit.gateLine(refused));
  assert.match(text(r), /CONTENT_EXTENT_OUT_OF_RANGE/, "carrying content's C-45.1 finding: " + kit.gateLine(refused));
  const after1 = R(await kit.get(own.auth, { op: "image", id: question }));
  assert.doesNotMatch(text(after1), /pdf-page/, "nothing was written to the question");

  /* control: a paragraph of the same Word file is a kind it holds */
  const ok = await kit.post(own.auth, "cite", { project: question, handle: sel.handle, role: "supports", extent_kind: "doc-para", extent_para: "0" });
  assert.equal(R(ok.body).ok, true, "a paragraph of a Word file is cited: " + kit.gateLine(ok));
});

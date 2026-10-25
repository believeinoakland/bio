/* control-plane R17, R29 (fix round 10, B11, item 70; K5148; WALK-FINAL-05 R38, diag2-020305.md §7; contradiction R61): the walker's case through the real door. A member uploads two text documents,
   each stating a figure, files them in her project, and "Find in this document" the figure in each (a find mints nothing: the passage has no content row, `content_held: false`); then
   `contradictionflag` for the pair, with her reason, answers ok: the flagging member makes each passage citable. Control: a passage on a paragraph the reading does not have stays `FLAG_NO_PASSAGE`,
   and nothing is written for it. Module cause: contradiction (build/jobs/T51/contradiction.md, J12/J13 COMPLETE: `#flagPassage` mints through `content`). Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "r12flag" });
after(() => kit.mf.dispose());
const R = kit.R;

/* a text uploaded and filed in the project; its figure's sentence found as the Document screen's "Find in this document" finds it */
async function documentWithFigure(own, cs, project, tag, sentence, term) {
  const bytes = kit.te(`${sentence}\n\nThe clerk filed the minutes on Tuesday, and the register ${tag} was signed by the chair.`);
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(tag)}&name=${encodeURIComponent(tag + "-report")}&type=text%2Fplain`, { method: "POST", headers: own.auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: `${tag}-report`, locator: up.document.locator, project });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 400));
  const found = R(await cs.call("findin", { body: { scope: { capture: kit.sha(bytes) }, kinds: ["term"], term } }));
  const item = found.kinds[0].items[0];
  assert.equal(item.words, sentence, "the figure's sentence is found: " + JSON.stringify(item).slice(0, 300));
  assert.equal(item.content_held, false, "a find mints nothing: " + JSON.stringify(item).slice(0, 300));
  return { capture: kit.sha(bytes), item };
}

test("R17, R29 (contradiction R61): two documents each stating a figure, found in and flagged by the member, answer ok through the door; control: a paragraph the reading does not have is FLAG_NO_PASSAGE", { timeout: 600000 }, async () => {
  const own = await kit.ownerOf("r12flag-ann");
  const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "Two reports that disagree on a figure");
  const a = await documentWithFigure(own, cs, project, "r12flaga", "The audit puts the paving contract at four million two hundred thousand dollars.", "paving contract");
  const b = await documentWithFigure(own, cs, project, "r12flagb", "The council report puts the paving contract at five million one hundred thousand dollars.", "paving contract");
  const here = { capture: a.capture, extent: a.item.extent }, other = { capture: b.capture, extent: b.item.extent };
  /* control first: a paragraph the reading does not have is not a passage anyone can see held */
  const past = { capture: a.capture, extent: { ...a.item.extent, para: 99 } };
  const lost = await kit.post(own.auth, "contradictionflag", { here: past, other, reason: "The two reports give different contract figures." });
  assert.equal(R(lost.body).ok, false, kit.gateLine(lost));
  assert.equal(R(lost.body).reason, "FLAG_NO_PASSAGE", kit.gateLine(lost));
  const flagged = await kit.post(own.auth, "contradictionflag", { here, other, reason: "The two reports give different contract figures." });
  assert.equal(flagged.status, 200, kit.gateLine(flagged));
  assert.equal(R(flagged.body).ok, true, kit.gateLine(flagged));
});

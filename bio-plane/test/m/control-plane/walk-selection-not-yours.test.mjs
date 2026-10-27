/* control-plane R17, R29 (fix round 10, final pass; K5138; build/plan/fix-round-10-T51.md item 78; retrieval R99, C-33.59): the walker's case through the real door. A member picks a document of hers
   (`select`, as the Document screen's "Confirm" does) and is given a handle; a second member who names that handle (`selection`, `selectionrelease`) is refused SELECTION_NOT_YOURS, the owner being the
   server's stamp from the session, never the caller's word (a forged `owner` in the query changes nothing). Control: the maker reads and releases her own selection. Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wselect" });
after(() => kit.mf.dispose());
const R = kit.R;

test("R17, R29 (retrieval R99): another member's selection is refused SELECTION_NOT_YOURS on a read and on a release, a forged owner does not open it; control: the maker reads and releases her own", { timeout: 600000 }, async () => {
  const ann = await kit.ownerOf("wselect-ann");
  const ben = await kit.person("wselect-ben");
  const cs = kit.screenCall(ann.auth);
  const project = await kit.projectOf(ann.auth, "Selection walk");
  const bytes = kit.te("The clerk stamped the amended contract RECEIVED before the council voted, wselect.");
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=wselect&name=wselect-minutes&type=text%2Fplain`, { method: "POST", headers: ann.auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "wselect-minutes", locator: up.document.locator, project });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 400));
  const sel = R(await cs.call("select", { body: { ids: [filed.bundleId] } }));
  assert.ok(sel && sel.handle, "Ann's selection: " + JSON.stringify(sel).slice(0, 300));

  /* control: Ann reads her own */
  const mine = R(await kit.get(ann.auth, { op: "selection", handle: sel.handle }));
  assert.notEqual(mine.reason, "SELECTION_NOT_YOURS", "her own is hers: " + JSON.stringify(mine).slice(0, 400));
  assert.equal(mine.ok, true, "she reads her own selection: " + JSON.stringify(mine).slice(0, 400));

  /* Ben names her handle: refused, read and release alike, and a forged owner in the query does not change it */
  const his = R(await kit.get(ben, { op: "selection", handle: sel.handle }));
  assert.equal(his.ok, false, JSON.stringify(his).slice(0, 400));
  assert.equal(his.reason, "SELECTION_NOT_YOURS", "Ben reads Ann's selection: " + JSON.stringify(his).slice(0, 400));
  const forged = R(await kit.get(ben, { op: "selection", handle: sel.handle, owner: "wselect-ann" }));
  assert.equal(forged.reason, "SELECTION_NOT_YOURS", "a named owner is not believed: " + JSON.stringify(forged).slice(0, 400));
  const rel = R((await kit.post(ben, "selectionrelease", {}, { handle: sel.handle })).body);
  assert.equal(rel.ok, false, JSON.stringify(rel).slice(0, 400));
  assert.equal(rel.reason, "SELECTION_NOT_YOURS", "Ben releases Ann's selection: " + JSON.stringify(rel).slice(0, 400));

  /* the refusals left it as it was: Ann still reads it, then releases it */
  const still = R(await kit.get(ann.auth, { op: "selection", handle: sel.handle }));
  assert.equal(still.ok, true, "still hers: " + JSON.stringify(still).slice(0, 400));
  const own = R((await kit.post(ann.auth, "selectionrelease", {}, { handle: sel.handle })).body);
  assert.equal(own.ok, true, "she releases her own: " + JSON.stringify(own).slice(0, 400));
});

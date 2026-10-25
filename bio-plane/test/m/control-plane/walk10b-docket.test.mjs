/* control-plane R17, R29 (fix round 10, final pass; K5138; WALK-FINAL-10B C4 / R177, diag2-10b.md C4; docket B6 COMPLETE, build/jobs/T51/docket.md): the walker's case through the real door.
   The manager of a published case files a `reaction` with `docketfile` (a summary typed at the filing) and prepares it as the screen sends it (`docketprepare`: case, entry, kind, no summary,
   no shelf). Before the fix `docketFile` dropped a reaction's summary and `docketPrepare` asked for one as an argument, so the screens' own sequence ended DOCKET_NO_SUMMARY for every reaction.
   The reaction rests on an upload, which has no co-archive copy offline, so the prepare goes on to DOCKET_NO_ARCHIVE_COPY (specified, R4): the case asserts the summary is no longer the
   refusal. Control: a reaction filed with the summary absent is refused DOCKET_NO_SUMMARY at the prepare as before. Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "w10bdkt" });
after(() => kit.mf.dispose());
const R = kit.R;
const SUMMARY = "A column calling the case unfair.";

let chain = null;
async function publishedCase() {
  if (chain) return chain;
  const e = await kit.preparedEdition("w10bdkt-owner", "w10bdkt", { vouch: true });
  const { res } = await kit.sitAndSign(e);
  assert.equal(res.body.ok, true, kit.gateLine(res));
  /* the page the reaction is about: an upload the member holds (a second text), the capture the form names */
  const bytes = kit.te("A column in the local paper calls the council's stamp unfair, and says so at length, in a second document.");
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent("w10bdkt-column")}&name=w10bdkt-column&type=text%2Fplain`, { method: "POST", headers: e.auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  /* filed in her project as the Capture screen files it, so the register holds it with its origin locator */
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(e.cs, { doc: up.document, title: "w10bdkt-column", locator: up.document.locator, project: e.project });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 400));
  chain = { e, capture: kit.sha(bytes) };
  return chain;
}
const filing = (c, extra = {}) => ({ case: c.e.prepared.caseId, edition: Number(c.e.prepared.edition), capture: c.capture, kind: "reaction", from: { kind: "other", name: "The local paper" },
  proposed: "public", reason: "The group answers the column on its docket.", ...extra });

test("R17, R29 (docket R1, R4; diag2-10b C4): a reaction filed with a summary is prepared as the screen sends it (case, entry, kind): the summary filed is not asked again (not DOCKET_NO_SUMMARY)", { timeout: 900000 }, async () => {
  const c = await publishedCase();
  const filed = await kit.post(c.e.auth, "docketfile", filing(c, { summary: SUMMARY }));
  assert.equal(R(filed.body).ok, true, kit.gateLine(filed));
  const entry = R(filed.body).entry || R(filed.body).entry_id;
  assert.ok(entry, "an entry id: " + kit.gateLine(filed));
  const prep = await kit.get(c.e.auth, { op: "docketprepare", case: c.e.prepared.caseId, entry: String(entry), kind: "reaction" });
  assert.notEqual(R(prep).reason ?? R(prep).code, "DOCKET_NO_SUMMARY", JSON.stringify(prep).slice(0, 600));
  /* the upload has no co-archive copy offline: the refusal that remains is the archive's, specified in R4 (the prepared draft's own summary is docket's unit case, place.test.mjs) */
  assert.equal(R(prep).reason ?? R(prep).code, "DOCKET_NO_ARCHIVE_COPY", JSON.stringify(prep).slice(0, 600));
});

test("R17, R29 (docket R4; diag2-10b C4) control: a reaction filed with its summary absent is refused DOCKET_NO_SUMMARY at the prepare, as before", { timeout: 900000 }, async () => {
  const c = await publishedCase();
  const filed = await kit.post(c.e.auth, "docketfile", filing(c, { reason: "The group answers the column on its docket, without a summary." }));
  const entry = R(filed.body).entry || R(filed.body).entry_id;
  assert.ok(entry, "an entry id: " + kit.gateLine(filed));
  const prep = await kit.get(c.e.auth, { op: "docketprepare", case: c.e.prepared.caseId, entry: String(entry), kind: "reaction" });
  assert.equal(R(prep).reason ?? R(prep).code, "DOCKET_NO_SUMMARY", JSON.stringify(prep).slice(0, 600));
});

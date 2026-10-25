/* control-plane R17, R29 (fix round 10, final pass; K5138, K5148; STORE-REQUEST #3 COMPLETE J11 (3), build/jobs/T51/store-request.md: "`held: true` in SCREENS-PUBLISH or control-plane's Wave B door test (K5138): `recipes.finding`
   is the state; the door case itself is theirs"): the walker's case through the real door. `recipes.finding` (test/m/store-request/recipes.mjs) runs over the store-request world, not over the plane, so the member's
   acts are made here over the Miniflare plane (the seam kit) in the recipe's order and with its fields: a web page uploaded (`captureupload`, text/html) and filed in her project, found and cited into a question of
   hers (one supporting leg), her own reading concluded (`conclude`), her signing key registered (`signerregisterown`), the publication copy awaited (the scheduler's alarm). Then `publishpreflight` and `publishcheck`
   with every authored field stated (statement, scope, subjectPosition, subjectJustification, biasAcknowledgement, excluded, tieAttested, roles): the pre-flight is ready and the check answers `held: true` with a
   check id, and `casecheck` reads the case `held`. Control: with `subjectPosition` left out the check is refused NO_SUBJECT_POSITION. */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wpubheld" });
after(() => kit.mf.dispose());
const R = kit.R;
const text = (v) => JSON.stringify(v || {}).slice(0, 700);

test("R17, R29 (case-check R1; store-request R19): the project's owner concludes her own reading of a held web page and asks `publishpreflight` then `publishcheck` with every authored field stated: the check answers held: true and the case reads held; control: without subjectPosition it is refused NO_SUBJECT_POSITION", { timeout: 900000 }, async () => {
  const own = await kit.ownerOf("wpubheld-ann");
  const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "Potholes, Seven days");
  const reading = "Reported potholes are repaired within seven days.";
  const html = `<html><head><title>Seven days source</title></head><body>\n<h1>Seven days source</h1>\n<p>${reading}</p>\n</body></html>`;
  const bytes = kit.te(html);
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=wpubheld&name=wpubheld-source&type=text%2Fhtml`, { method: "POST", headers: own.auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, text(up));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "wpubheld-source", locator: up.document.locator, project });
  assert.equal(filed.refused, undefined, text(filed));
  const doc = filed.bundleId;
  const question = await kit.questionOf(own.auth, project, "Is the city repairing reported potholes within seven days?");
  const found = R(await cs.call("findin", { body: { scope: { capture: up.capture.sha256 }, kinds: ["term"], term: "repaired within seven days" } }));
  const item = found.kinds[0].items[0];
  assert.ok(item, "the sentence is found in the page: " + text(found));
  const cited = R(await cs.call("cite", { body: { project: question, role: "supports", found: item } }));
  assert.deepEqual(cited.cited, [doc], "the question rests on the page: " + text(cited));
  const concl = R(await cs.call("conclude", { query: { target: question, project, reading, falsifier: "The work orders show otherwise." } }));
  assert.equal(concl.ok, true, "concluded: " + text(concl));
  assert.equal(concl.own_reading, true, "her own reading: " + text(concl));
  const key = await kit.newKey();
  const reg = R(await cs.call("signerregisterown", { body: { keyB64: key.keyB64 } }));
  assert.equal(reg.ok, true, text(reg));

  const publish = { targets: [question], roles: { [doc]: "supporting", [question]: "load_bearing" }, statement: "This case does not cover repairs made after the reports were closed.",
    scope: "Potholes reported in 2026.", subjectPosition: "not_sought", subjectJustification: "The question concerns the city's own repair policy.",
    biasAcknowledgement: "We favour prompt repairs.", excluded: [], tieAttested: true };
  const query = { project };
  /* the publication copy of the page is made by the scheduler's alarm: the pre-flight reads DOCUMENT_COPY_PENDING until it is made */
  let pre = null;
  await kit.until(async () => { pre = await kit.post(own.auth, "publishpreflight", publish, query); return R(pre.body).ready === true; }, 120000, 2000);
  assert.equal(R(pre.body).ready, true, "the pre-flight is ready: " + kit.gateLine(pre));
  const check = await kit.post(own.auth, "publishcheck", publish, query);
  assert.equal(R(check.body).ok, true, kit.gateLine(check));
  assert.equal(R(check.body).held, true, kit.gateLine(check));
  assert.match(String(R(check.body).check), /^CHK-\d{4}-\d{4}$/, "a check id: " + kit.gateLine(check));
  const read = R(await kit.get(own.auth, { op: "casecheck", case: R(check.body).case }));
  assert.equal(read.state, "held", "the case-check reads it held: " + text(read));

  /* control: a field of the case left out is the pre-flight's first refusal */
  const { subjectPosition: _omitted, ...rest } = publish;
  const refused = await kit.post(own.auth, "publishcheck", rest, query);
  assert.equal(R(refused.body).held, false, kit.gateLine(refused));
  assert.match(text(R(refused.body)), /NO_SUBJECT_POSITION/, kit.gateLine(refused));
});

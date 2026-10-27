/* control-plane R17, R29 (fix round 10, B5; K5148; WALK-FINAL-08 C10, diag2-08.md C10; standards R41): the walker's case through the real door. A member uploads a document: the capture records the BARE
   handle as its actor (not `member:<handle>`), and the member's standard drawn from a sentence of it, `access: "paywalled"`, is held (before the fix `#memberCaptured` asked for the `member:` spelling and every
   such standard was refused TEXT_NOT_MEMBER_CAPTURED). Control: a capture no member made (a probe credential's `acquire`, which records no member as its actor) is not accepted as the member's own
   capture: the same declaration over its text is refused TEXT_NOT_MEMBER_CAPTURED. Module cause: standards (build/jobs/T51/standards.md, J5 COMPLETE). Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "r5paywall" });
after(() => kit.mf.dispose());
const R = kit.R;
const SENTENCE = "No person shall park a vehicle on the plaza between midnight and five in the morning.";

test("R17, R29 (standards R41): a member's uploaded document records her bare handle as the actor, and `standarddeclare` with access paywalled over a sentence of it is held (control: a capture no member made is refused TEXT_NOT_MEMBER_CAPTURED)", { timeout: 600000 }, async () => {
  const own = await kit.ownerOf("r5paywall-ann");
  const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "A paywalled ordinance");
  const bytes = kit.te(`${SENTENCE}\n\nThe clerk filed this section on Tuesday, and the register r5paywall was signed by the chair.`);
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=r5paywall&name=ordinance&type=text%2Fplain`, { method: "POST", headers: own.auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "ordinance", locator: up.document.locator, project });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 400));
  const found = R(await cs.call("findin", { body: { scope: { capture: kit.sha(bytes) }, kinds: ["term"], term: "park a vehicle" } }));
  const item = found.kinds[0].items[0];
  assert.equal(item.words, SENTENCE, JSON.stringify(item).slice(0, 300));
  /* the capture's actor is the bare handle, as the walker's `captureaccounts` showed */
  const accounts = R(await kit.get(own.auth, { op: "captureaccounts", capture: kit.sha(bytes) }));
  assert.deepEqual(accounts.actors.map((x) => x.actor), ["r5paywall-ann"], "the bare handle, not member:<handle>: " + JSON.stringify(accounts).slice(0, 300));
  const body = (it) => ({ cite: "Plaza Ordinance 5", kind: "ordinance", issuer: "City Council", reason: "The council set it and we hold it to it.",
    access: "paywalled", text: [{ capture_sha: it.capture_sha, extent: it.extent }] });
  const declared = await kit.post(own.auth, "standarddeclare", body(item));
  assert.equal(R(declared.body).ok, true, kit.gateLine(declared));
  assert.equal(R(declared.body).access, "paywalled", kit.gateLine(declared));
  const id = R(declared.body).id;

  /* control: bytes the binding credential (a machine) acquired record no member as their actor, so a member's declaration over them is refused */
  const name = "machine-ordinance.txt";
  const machineText = `${SENTENCE.replace("plaza", "square")}\n\nThe machine fetched this page from the council's site.`;
  const machineBytes = kit.te(machineText);
  kit.serve(name, machineBytes, { type: "text/plain" });
  const got = await kit.acquire({ authorization: `Bearer ${kit.ADM}` }, { locator: `https://www.example.gov/files/${name}` });
  assert.equal(got.body.ok, true, JSON.stringify(got.body).slice(0, 300));
  const macc = R(await kit.get(own.auth, { op: "captureaccounts", capture: kit.sha(machineBytes) }));
  assert.deepEqual(macc.actors, [], "no member is recorded for the machine's capture: " + JSON.stringify(macc).slice(0, 300));
  /* the member files the document the machine fetched in her own project, and finds the sentence in it */
  const mfiled = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: got.body.document, title: "machine-ordinance", locator: got.body.document.locator, project });
  assert.equal(mfiled.refused, undefined, JSON.stringify(mfiled).slice(0, 400));
  const mfound = R(await cs.call("findin", { body: { scope: { capture: kit.sha(machineBytes) }, kinds: ["term"], term: "park a vehicle" } }));
  const mitem = mfound.kinds[0].items[0];
  const refused = await kit.post(own.auth, "standarddeclare", { ...body(mitem), cite: "Square Ordinance 6" });
  assert.equal(R(refused.body).ok, false, kit.gateLine(refused));
  assert.equal(R(refused.body).reason, "TEXT_NOT_MEMBER_CAPTURED", kit.gateLine(refused));
});

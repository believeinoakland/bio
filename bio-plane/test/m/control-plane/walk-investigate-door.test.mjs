/* control-plane R17, R29 (fix round 10, final pass; K5138, K5178; SCREENS-INVESTIGATE #16 J28 (8), build/jobs/T51/screens-investigate.md; WALK-FINAL-07 R60, WALK-FINAL-08 C2, C9, diag2-07.md, diag2-08.md):
   the walker's cases through the real door, each made by the member's own acts over the Miniflare plane (the seam kit). The removed rows after `personexpunge`, read by another member, are
   `walk-people-door.test.mjs` (people R12).
   (a) `createevent` with `{datedFactId}` (a dated fact recorded from the passage by `recorddatedfact`) is placed on its lane with its date and is not "placed nowhere"; control: the same event
       attested by the bare passage is placed nowhere (events' rule: only an attestation carrying a date dates it).
   (b) `lawrelate` from a standard, the id the page sends once it has split the address `/app/standard/<STD>/<PROJ>` at the slash: the relation is held and read back; control: the id with the
       project path appended (what the page sent before) is refused NO_SUCH_STANDARD.
   (c) `standarddeclare` with the ENT- id of a registered body as `issuer` and a stated period, then `bindsat` for that body on a day inside the period answers `binds`; control: the typed label
       (what the form sent before) leaves the standard's issuer unregistered, so `bindsat` asked for the body does not answer `binds`. */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wlaw" });
after(() => kit.mf.dispose());
const R = kit.R;
const text = (v) => JSON.stringify(v || {}).slice(0, 600);
const REASON = "The passage says so.";

/* a document a member uploads and files in her project, and one sentence of it found: the extent a fact or a standard cites */
async function held(own, project, tag, body, term) {
  const bytes = kit.te(body);
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(tag)}&name=${encodeURIComponent(tag)}&type=text%2Fplain`, { method: "POST", headers: own.auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, text(up));
  const cs = kit.screenCall(own.auth);
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: tag, locator: up.document.locator, project });
  assert.equal(filed.refused, undefined, text(filed));
  const found = R(await cs.call("findin", { body: { scope: { capture: kit.sha(bytes) }, kinds: ["term"], term } }));
  const item = found.kinds[0].items[0];
  assert.ok(item && item.extent, "the passage is found: " + text(found));
  return { sha: kit.sha(bytes), item, cs };
}

test("R17, R29 (events; screens-investigate R33): `createevent` attested by a recorded dated fact `{datedFactId}` lies on its lane with its date; control: attested by the bare passage it is placed nowhere", { timeout: 900000 }, async () => {
  const own = await kit.ownerOf("wlaw-ann");
  await kit.profileSet(["oakland-alameda"]);
  const project = await kit.projectOf(own.auth, "A dated meeting");
  const h = await held(own, project, "wlaw-minutes", "The council met on March 3, 2026 and adopted the budget.\n\nThe chair adjourned at nine.", "met on March 3, 2026");
  const fact = R((await kit.post(own.auth, "recorddatedfact", { captureSha: h.item.capture_sha, extent: h.item.extent, kind: "adopted", value: "2026-03-03", method: "A member read the date in the minutes." })).body);
  assert.equal(fact.ok, true, "the date is recorded: " + text(fact));
  const factId = fact.dated_fact && fact.dated_fact.dated_fact_id;
  assert.ok(factId, "a dated fact id: " + text(fact));
  const made = R((await kit.post(own.auth, "createevent", { kind: "meeting", attestations: [{ datedFactId: factId }] })).body);
  assert.equal(made.ok, true, "the event is created: " + text(made));
  const timeline = async () => R(await kit.get(own.auth, { op: "timeline", captures: h.sha }));
  const t1 = await timeline();
  const lane = [...(t1.world ? t1.world.items : []), ...(t1.us ? t1.us.items : [])];
  assert.equal(lane.length, 1, "the event lies on a lane: " + text(t1));
  assert.equal(lane[0].when && lane[0].when.value, "2026-03-03", "with its date: " + text(lane[0]));
  assert.equal((t1.placed_nowhere || (t1.world && t1.world.placed_nowhere) || []).length, 0, "and is placed nowhere in no list: " + text(t1));

  /* control: an event attested by the passage alone carries no date, so it is placed nowhere */
  const bare = R((await kit.post(own.auth, "createevent", { kind: "other", attestations: [{ captureSha: h.item.capture_sha, extent: h.item.extent }] })).body);
  assert.equal(bare.ok, true, text(bare));
  const t2 = await timeline();
  const nowhere = [...(t2.placed_nowhere || []), ...((t2.world && t2.world.placed_nowhere) || []), ...((t2.us && t2.us.placed_nowhere) || [])];
  assert.equal(nowhere.length, 1, "the undated event is placed nowhere: " + text(t2));
});

test("R17, R29 (law-relations; screens-investigate R8): `lawrelate` from the standard's own id is held and read back; control: the id with the project path the page's address carried is refused NO_SUCH_STANDARD", { timeout: 900000 }, async () => {
  const own = await kit.ownerOf("wlaw2-ann");
  const project = await kit.projectOf(own.auth, "Two laws");
  const a = await held(own, project, "wlaw2-ordinance", "No landlord shall increase the rent above the limit the board sets.\n\nNo landlord shall retaliate against a tenant who complains.", "increase the rent");
  const b = await held(own, project, "wlaw2-policy", "The Director shall repair each reported pothole within seven calendar days.\n\nCrews log each pothole they fill.", "within seven calendar days");
  const declare = async (cite, kind, h) => {
    const r = R((await kit.post(own.auth, "standarddeclare", { cite, kind, issuer: "City Council", reason: REASON, access: "free", text: [{ capture_sha: h.item.capture_sha, extent: h.item.extent }] })).body);
    assert.equal(r.ok, true, cite + ": " + text(r));
    return r.id;
  };
  const ord = await declare("Ordinance 8.22", "ordinance", a);
  const pol = await declare("Public Works Instruction 9.1", "policy", b);
  const std = R(await kit.get(own.auth, { op: "standard", id: pol }));
  const citation = std.texts && std.texts[0] && std.texts[0].content_id;
  assert.ok(citation, "the standard's own passage by its content id: " + text(std));
  const rel = R((await kit.post(own.auth, "lawrelate", { type: "implements", from: pol, to: ord, citation, reason: REASON })).body);
  assert.equal(rel.ok, true, "the relation is held: " + text(rel));
  const read = R(await kit.get(own.auth, { op: "lawrelations", id: pol }));
  assert.equal((read.referential || []).filter((r) => !r.withdrawn).length, 1, "and read back: " + text(read));
  const spoilt = R((await kit.post(own.auth, "lawrelate", { type: "implements", from: `${pol}/${project}`, to: ord, citation, reason: REASON })).body);
  assert.equal(spoilt.ok, false, "the project path is no standard: " + text(spoilt));
  assert.equal(spoilt.reason ?? spoilt.code, "NO_SUCH_STANDARD", text(spoilt));
});

test("R17, R29 (standards R43): `standarddeclare` naming a registered body's ENT- id as the issuer, with a stated period, then `bindsat` for that body answers binds; control: the typed label leaves the issuer unregistered and the body is not bound", { timeout: 900000 }, async () => {
  const own = await kit.ownerOf("wlaw3-ann");
  const project = await kit.projectOf(own.auth, "A binding ordinance");
  const h = await held(own, project, "wlaw3-ordinance", "No person shall park a vehicle on the plaza between midnight and five in the morning.\n\nThe clerk filed this section on Tuesday.", "park a vehicle");
  const made = R((await kit.post(own.auth, "entitycreate", { kind: "body", label: "City of Oakland", note: "The city." })).body);
  assert.equal(made.ok, true, text(made));
  const body = made.entity_id ?? made.id;
  assert.match(String(body), /^ENT-/, "a registered body: " + text(made));
  const declare = async (cite, issuer) => R((await kit.post(own.auth, "standarddeclare", { cite, kind: "ordinance", issuer, reason: REASON, access: "free", period: { from: "2026-01-01", to: "2026-12-31" },
    text: [{ capture_sha: h.item.capture_sha, extent: h.item.extent }] })).body);
  const bound = await declare("Plaza Ordinance 5", body);
  assert.equal(bound.ok, true, text(bound));
  const binds = R(await kit.get(own.auth, { op: "bindsat", id: bound.id, body, date: "2026-10-25" }));
  assert.equal(binds.state, "binds", "the body that set it is bound by it: " + text(binds));
  /* control: the label a member typed is kept as a label, not as the body's entity */
  const typed = await declare("Plaza Ordinance 6", "City of Oakland");
  assert.equal(typed.ok, true, text(typed));
  const not = R(await kit.get(own.auth, { op: "bindsat", id: typed.id, body, date: "2026-10-25" }));
  assert.notEqual(not.state, "binds", "a typed label does not name the registered body: " + text(not));
});

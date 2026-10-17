/* T50-53 (N1143; K3411; agent-worker R90): the composition layer names what a check run's compose step is handed (R51).
 * The note is this module's own words and not a clause; the controls are the other layers and the unchanged pack. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPack, packVersion } from "../../../src/skillpack.mjs";
import { controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { published } from "./fixture.mjs";

const KEYS = ["record_id", "capture_sha", "extent_capture"];
const text = (v) => JSON.stringify(v);

test("R51 the composition layer names record_id and capture_sha on a held document, record_id or null on an unchained item, a leg's target as that record_id and its extent_capture as that capture_sha, and a null record_id as not cited as a leg", () => {
  const body = renderPack(published()).disclosed.composition.body.composition.handed_to_compose;
  assert.equal(body.defined_by, "agent-worker R90");
  assert.deepEqual(body.held_document.carries, ["record_id", "capture_sha"]);
  assert.match(body.held_document.in, /by_document/);
  assert.deepEqual(body.unchained_item.carries, ["record_id"]);
  assert.match(body.unchained_item.in, /unchained_items/);
  assert.match(body.unchained_item.says, /null/);
  assert.match(body.leg.target, /target/);
  assert.match(body.leg.target, /record_id/);
  assert.match(body.leg.extent, /extent_capture/);
  assert.match(body.leg.extent, /capture_sha/);
  assert.match(body.when_null, /record_id is null/);
  assert.match(body.when_null, /not cited as a leg/);
  const all = text(body);
  for (const k of KEYS) assert.ok(all.includes(k), `${k} is named`);
});

test("R51 no text of the note carries control-flow authority (R16, R24)", () => {
  const note = renderPack(published()).disclosed.composition.body.composition.handed_to_compose;
  const strings = [];
  (function walk(v) {
    if (typeof v === "string") strings.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  })(note);
  assert.ok(strings.length > 0);
  for (const s of strings) assert.deepEqual(controlFlowAuthority(s), [], s);
});

test("R51 the pack's version moves with the note: it differs from the pack without it", () => {
  const pack = renderPack(published());
  const bare = structuredClone(pack);
  delete bare.disclosed.composition.body.composition.handed_to_compose;
  assert.notEqual(packVersion(bare), pack.version);
  assert.equal(packVersion(pack), pack.version, "an unchanged pack keeps its version (R11)");
  assert.equal(renderPack(published()).version, pack.version, "the same inputs render the same pack (R22)");
});

test("R51 control: no other layer names record_id, capture_sha or extent_capture, and the resident layer names none", () => {
  const pack = renderPack(published());
  for (const [name, layer] of Object.entries(pack.disclosed)) {
    if (name === "composition") continue;
    for (const k of KEYS) assert.ok(!text(layer).includes(k), `${name} does not name ${k}`);
  }
  for (const k of KEYS) assert.ok(!text(pack.resident).includes(k), `the resident layer does not name ${k}`);
  for (const k of KEYS) assert.ok(text(pack.disclosed.composition).includes(k), `the composition layer names ${k}`);
});

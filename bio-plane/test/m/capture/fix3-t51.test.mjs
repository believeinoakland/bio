/* capture, T51 fix round 2, wave 3 (SCREENS-INQUIRY #18 REPORT, K4337): at the module's interface, over the capture store (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, H } from "./fixture.mjs";

const NOW = "2026-03-11T00:00:00Z";

/* a world of held documents whose register documents (acquisition R17) profile their captures as a pdf, as no format,
   as a profile naming none, and with no register document at all */
function formatWorld() {
  const f = fresh();
  const s = f.s;
  const doc = (i) => s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                                 VALUES (?, 'information', 'g', ?, 'collected', ?, ?, 'x', 1)`, `INFO-${i}`, `title ${i}`, `2026-01-0${i}T00:00:00Z`, `2026-01-0${i}T00:00:00Z`);
  const reg = (i) => s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, registered, bytes) VALUES (?, ?, 'x', '2026-01-01T00:00:00.000Z', 10)`, H(String(i)), `INFO-${i}`);
  const profiled = (i, profile) => s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, 'data/provenance.json', ?, NULL, 1, 'x')`,
                                              `INFO-${i}`, JSON.stringify({ documents: [{ capture: { sha256: H(String(i)) }, ...(profile ? { profile } : {}) }] }));
  for (const i of [1, 2, 3, 4]) { doc(i); reg(i); }
  profiled(1, { format: { format: "pdf" } });      // a registered format
  profiled(2, { format: {} });                      // a profile naming no format id
  profiled(3, null);                                // a register document that profiles nothing
  return f;                                         // INFO-4: no register document at all
}

test("R77 (K4337; DEC-394 (3a)): the full held row carries the register's format id as the register holds it, null where it holds none; the picker row carries none", async () => {
  const { c } = formatWorld();
  const full = await c.heldCaptures({ viewer: "class:admin", now: NOW, });
  assert.deepEqual(full.held.map((r) => [r.bundle_id, r.format]).sort(), [["INFO-1", "pdf"], ["INFO-2", null], ["INFO-3", null], ["INFO-4", null]]);
  /* control: the other fields of the full row are what they were, and the picker row names no format, however it is asked */
  assert.ok(full.held.every((r) => "format" in r && r.capture && r.capture.sha256 && "whole" in r && "actor" in r));
  for (const state of [undefined, "held_and_vouched"]) {
    const picker = await c.heldCaptures({ viewer: "class:admin", now: NOW, fields: "picker", state });
    assert.equal(picker.held.length, 4);
    assert.ok(picker.held.every((r) => !("format" in r)), String(state));
  }
});

import { DECLARED_OPS, captureOps } from "../../../src/capture/index.mjs";

test("R97 (K4334): heldcaptures declares `fields` and `state` among what it accepts, and the arm reads both as declared: `fields: picker` answers picker rows, `state` the lists; control: a value outside either is refused naming it", async () => {
  const { c } = formatWorld();
  assert.ok(["fields", "state"].every((f) => DECLARED_OPS.heldcaptures.fields.accepts.includes(f)));
  const ask = (query) => captureOps(c, new URL(`http://x/?op=heldcaptures&viewer=class:admin&${query}`), {}, c.env).heldcaptures();
  const picker = await ask("fields=picker&state=held_and_vouched");
  assert.equal(picker.held.length, 4);
  assert.ok(picker.held.every((r) => !("format" in r) && r.standing === "collected"));
  assert.ok((await ask("state=set_aside")).held.length === 0);
  for (const bad of ["fields=heavy", "state=everything"]) {
    const r = await ask(bad);
    assert.deepEqual([r.ok, r.reason, r.argument], [false, "REQUIRED_ARGUMENT_MISSING", bad.split("=")[0]], bad);
  }
});

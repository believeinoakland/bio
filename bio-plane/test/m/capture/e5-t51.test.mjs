/* capture, fix round 5 (K4530; E5, capture's half): the upload reads a file as text by the rule `acquisition` exports as `textTypeOf`
   (a declared text type, or a `.txt`, `.md` or `.csv` name when none is declared, used only for bytes that are valid UTF-8 holding no
   NUL), the one code for the one condition, so the pull of a knock (`doorbell`) and the upload cannot disagree. At the module's
   interface: for each case of the matrix the upload's profile is read from text exactly when the shared rule says its bytes are text,
   and the rule is acquisition's export (R92, R93). Red by name until `acquisition` exports `textTypeOf` (merge 2). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";

const te = new TextEncoder();
const STATEMENT = "a printout the clerk handed me at the counter on 3 October";
const AT = "2026-10-09T12:00:00Z";
const NUL = new Uint8Array([97, 0, 98, 10]);
const BAD_UTF8 = new Uint8Array([0xff, 0xfe, 0x41, 10]);
const TEXT = te.encode("first line\nsecond line\n");

/* type / name / bytes, each of the rule's arms and the refusals of it */
const CASES = [
  { why: "a declared text/plain over text", type: "text/plain", bytes: TEXT },
  { why: "a declared text/markdown over text", type: "text/markdown", bytes: TEXT },
  { why: "a declared text/csv over text", type: "text/csv", bytes: TEXT },
  { why: "no type, a .txt name", name: "notes.txt", bytes: TEXT },
  { why: "no type, a .md name", name: "notes.md", bytes: TEXT },
  { why: "no type, a .csv name, upper case", name: "TABLE.CSV", bytes: TEXT },
  { why: "an empty type, a .md name", type: "", name: "notes.md", bytes: TEXT },
  { why: "no type, a .bin name", name: "notes.bin", bytes: TEXT },
  { why: "no type, no name", bytes: TEXT },
  { why: "a declared non-text type over text, a .md name (the declaration wins)", type: "application/octet-stream", name: "notes.md", bytes: TEXT },
  { why: "a declared text type over bytes holding a NUL", type: "text/plain", bytes: NUL },
  { why: "a .md name over bytes holding a NUL", name: "notes.md", bytes: NUL },
  { why: "a declared text type over bytes that are not UTF-8", type: "text/plain", bytes: BAD_UTF8 },
];

test("R92 R93 E5: the upload reads a file as text exactly when acquisition's `textTypeOf` says its bytes are text, across the rule's arms and its refusals; the rule is acquisition's one export", async () => {
  const acquisition = await import("../../../src/acquisition/index.mjs");
  assert.equal(typeof acquisition.textTypeOf, "function", "acquisition exports textTypeOf({bytes, type, name}), the one rule for the one condition (merge 2)");
  for (const k of CASES) {
    const { why, ...file } = k;
    const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
    const r = await f.c.uploadCapture({ bytes: file.bytes, statement: STATEMENT, by: "m1", at: AT, ...(file.type !== undefined ? { type: file.type } : {}), ...(file.name !== undefined ? { name: file.name } : {}) });
    assert.equal(r.ok, true, why);
    const rule = acquisition.textTypeOf({ bytes: file.bytes, type: file.type ?? null, name: file.name ?? null });
    assert.equal(r.document.profile.profiled_from_text === true, typeof rule === "string" && rule !== "", `${why}: the upload reads it as text when the rule says so, and not otherwise`);
  }
});

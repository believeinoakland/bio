/* reading-pipeline G76 (fix round 7; diagnosis-R7-reading.md R7 (c)), R1, R2, R11: a CSV or a plain text is no "application that
   builds its pages in the browser". The host-stack recogniser of a text with no markup (site-profiles' `client_rendered`
   handler, fixed by site-profiles' G76 job) is what every content type's recogniser is handed as `ctx.handler` and `ctx.kind`
   when `read` classifies the text, whether the capture is read as text (R1) or through the CSV entry (R2, inside
   `docprofile.readText`, R11). A recogniser spies on what it is handed; the reading states nothing of an empty frame.
   SEAM: the handler is site-profiles' and merges before this module (layer 1); until it is merged this test is red by name. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";
import { csvText } from "./g48-cases.mjs";

let seen = [];
registerDoctype({
  key: "g76-spy", label: "spy", version: 1,
  detect: (ctx) => { if (typeof ctx.text === "string" && ctx.text.length) seen.push({ handler: ctx.handler && ctx.handler.key, shell: ctx.handler && ctx.handler.shell === true, kind: ctx.kind }); return { match: false, confidence: "none", signals: [] }; },
  parse: () => ({ entities: [] }),
});

const readOf = async (text, ct, format, extra = {}) => {
  const b = bucket();
  const document = doc({ digest: await hold(b, text), bytes: Buffer.byteLength(text), ct, format, fromText: true });
  seen = [];
  const out = await read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...extra });
  return out;
};

const PLAIN = "The council met on Tuesday and heard the staff report on the budget. ".repeat(500);

for (const [what, text, ct, format] of [
  ["a 20 KB CSV", csvText(20_000), "text/csv", "csv"],
  ["a 1 MB CSV", csvText(1_000_000), "text/csv", "csv"],
  ["a CSV declared no type", csvText(50_000), "", "csv"],
  ["a plain text of 35 KB", PLAIN, "text/plain", "undetermined"],
]) {
  test(`R1 R2 R11 (G76): ${what} is classified under no shell handler: its recognisers are handed neither client_rendered nor kind shell, and the reading states no empty frame`, async () => {
    const out = await readOf(text, ct, format);
    assert.equal(out.reading.failure, undefined, out.reading.basis);
    assert.ok(seen.length > 0, "a recogniser was asked");
    for (const s of seen) {
      assert.notEqual(s.handler, "client_rendered", JSON.stringify(s));
      assert.notEqual(s.shell, true, JSON.stringify(s));
      assert.notEqual(s.kind, "shell", JSON.stringify(s));
    }
    assert.ok(!JSON.stringify(out.reading).includes("empty frame"), "the reading carries no warning about an empty frame");
  });
}

test("R1 R2 R11 (G76) control: a read in pieces is classified the same way (the first piece)", async () => {
  const out = await readOf(csvText(1_000_000), "text/csv", "csv", { cursor: null, unitsBudget: 64 * 1024 });
  assert.ok(seen.length > 0);
  assert.ok(seen.every((s) => s.handler !== "client_rendered" && s.kind !== "shell"), JSON.stringify(seen[0]));
  assert.equal(out.reading.failure, undefined);
});

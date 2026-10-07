/* reading-pipeline: DEC-149's sweep rows for this module (T35-24; `plan/draft-T35-dec149-l1-l7.md`, rows
   `index.mjs`:591–592 and :945). Two sentences a member reads on a reading's basis named the deployment "this
   instance"; each now names the group's Civicsmith. Each test pins its whole sentence, at the module's interface,
   and that no member-facing text of it says "instance" or "the plane". Each test names the requirement ids it checks
   in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { tier3Extend } from "../../../src/reading-pipeline/index.mjs";
import { fresh, hold, doc, withEntry, i2, noText } from "./fixture.mjs";

const OLD_NAMES = /\binstance\b|\bthe plane\b/i;
const NO_OCR = "this document has no text layer to read and no OCR engine is installed in your group's Civicsmith, "
             + "so nothing is claimed about what it says";
const NO_STORE = "your group's Civicsmith has no evidence store set up, so the capture's bytes cannot be read";

test("R24 R21 (DEC-149): with no evidence store handed in, the failed reading's basis is exactly \"your group's Civicsmith has no evidence store set up, so the capture's bytes cannot be read\", never \"this instance\"", async () => {
  const { reading } = await fresh({ evidence: null }).read(doc({ digest: "a".repeat(64), fromText: true }));
  assert.equal(reading.found, false);
  assert.equal(reading.basis, NO_STORE);
  assert.doesNotMatch(reading.basis, OLD_NAMES);
});

test("R4 R9 R11 (DEC-149): with no OCR member bound, the tier-3 note is exactly \"this document has no text layer to read and no OCR engine is installed in your group's Civicsmith, so nothing is claimed about what it says\", on tier3Extend's note and on the reading's basis, never \"this instance\"", async () => {
  const scan = i2([{ page: 0, text: "", undetermined: [noText(0)] }]);
  const t3 = await tier3Extend({}, { sha: "d", storeName: "bio", i2text: scan, wiredTier: 1, tier2PerPage: null, fmt: "pdf" });
  assert.equal(t3.ocrNote, NO_OCR);
  assert.equal(t3.stillWanting, true);
  /* through `read`: a scan with no member is a failed reading whose basis carries the note, then the entry's reason */
  const w = fresh();
  const d = await hold(w.evidence, "%PDF dec149");
  const { reading } = await withEntry({ format: "pdf", structure: async () => ({ ok: true, text: structuredClone(scan), pages: 1, notes: [] }) },
    () => w.read(doc({ digest: d, ct: "application/pdf", format: "pdf" })));
  assert.equal(reading.found, false);
  assert.equal(reading.tier3_candidate, true);
  assert.ok(reading.basis.startsWith(`${NO_OCR} (`), reading.basis);
  assert.doesNotMatch(reading.basis, OLD_NAMES);
});

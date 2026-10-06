/* DEC-149 (T34-86): every member-facing sentence the earned registry writes calls the group's Civicsmith "your group's
   Civicsmith", never "this instance", "this copy" or "this plane". Each changed string is driven here at the interface
   (R1's capture entries by every case that writes one, R8's standard ceiling) and checked whole. */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { world as dutiesWorld } from "../duties/fixture.mjs";
import { legEarningOf } from "../../../src/leg-earning/index.mjs";
import { EXTRACTION_SCHEMA } from "../../../src/extraction/schema.mjs";
import { ARCHIVE_VIA } from "../../../src/provenance/index.mjs";
import { EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE, BASIS_GRADES } from "../../../src/record-grammar/index.mjs";

const FORBIDDEN = /\b(this|the) (instance|copy|plane)\b/i;
const CEILING = `Grade ${UNREACHABLE_CAPTURE_GRADE} is not reachable on the capture axis at all: it needs a chain-of-custody `
              + `web archive, which your group's Civicsmith cannot produce and does not claim (CAPTURE-FIDELITY.md).`;
const ocr = (cap) => [{ step: "pixels" }, { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" } }];
const below = (g) => BASIS_GRADES[BASIS_GRADES.indexOf(g) + 1];
const words = (e) => Object.values(e).filter((v) => typeof v === "string").join("\n");

test("R1 DEC-149: every capture entry names the group's Civicsmith as your group's Civicsmith, never this instance or this plane — the fetched ceiling, the byte-bound measured transcription, the route-bound replay, the fidelity-bound transcription, and the unreachable grade", () => {
  const w = world();
  const PLAIN = "INFO-2026-8900-plain", OCR_A = "INFO-2026-8901-ocr-a", REPLAY = "INFO-2026-8902-replay",
        OCR_C = "INFO-2026-8903-ocr-c";
  w.doc(PLAIN, ["publisher-typed"], { chain: null });
  w.doc(OCR_A, ["ocr at A"], { chain: ocr("A") });
  w.doc(REPLAY, ["replayed"], { via: ARCHIVE_VIA });
  w.doc(OCR_C, ["ocr at C"], { chain: ocr("C") });
  const cap = w.k.earned(null, [PLAIN, OCR_A, REPLAY, OCR_C]).earned.capture;
  const fetched = (id) => `${id} holds 1 capture(s) in the record, so the strongest capture grade it can earn is `
    + `${EARNED_CAPTURE_CEILING} — the bytes as your group's Civicsmith fetched them, hashed at receipt.`;
  /* case 1, nothing transcribed; case 3, a measured transcription the bytes bound: the same sentence */
  assert.equal(cap[PLAIN].why, fetched(PLAIN));
  assert.equal(cap[OCR_A].why, fetched(OCR_A));
  /* the route binds: an archive replay, one rank below the ceiling */
  const R = below(EARNED_CAPTURE_CEILING);
  assert.deepEqual([cap[REPLAY].grade, cap[REPLAY].bounded_by], [R, "CAPTURE_BOUNDED_BY_ROUTE"]);
  assert.equal(cap[REPLAY].why, `${REPLAY} holds 1 capture(s) in the record, and the strongest route by which your `
    + `group's Civicsmith received them earns ${R} on the capture axis (provenance's capture grade: an archive replay `
    + `stands one party further from the publisher than a direct fetch), so the strongest capture grade this document `
    + `can earn is ${R}.`);
  /* the fidelity binds */
  assert.equal(cap[OCR_C].bounded_by, "CAPTURE_BOUNDED_BY_FIDELITY");
  assert.ok(cap[OCR_C].why.startsWith(`${OCR_C} holds 1 capture(s) in the record, and the bytes as your group's `
    + `Civicsmith fetched them would be worth ${EARNED_CAPTURE_CEILING} — but this document's TEXT was derived by a `
    + `machine and that derivation is measured at C.`), cap[OCR_C].why);
  for (const id of [PLAIN, OCR_A, REPLAY, OCR_C]) {
    assert.equal(cap[id].ceiling, CEILING, id);
    assert.doesNotMatch(words(cap[id]), FORBIDDEN, id);
  }
});

test("R8 DEC-149: a held standard's capture ceiling names the group's Civicsmith as your group's Civicsmith, never this plane", () => {
  const w = dutiesWorld();
  /* extraction's readings and text-source projection, under its read contract, as `held.test.mjs` composes them */
  for (const t of ["reading_text_source", "readings"])
    w.st.db.exec(new RegExp(`CREATE TABLE IF NOT EXISTS ${t} \\([\\s\\S]*?\\n\\);`).exec(EXTRACTION_SCHEMA)[0].replace(/--[^\n]*/g, ""));
  const le = legEarningOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, content: w.content,
                                    provenance: w.prov, standards: w.standards, duties: w.duties,
                                    now: () => w.clock.now.replace(/\.\d{3}Z$/, "Z") });
  const p = w.passage("direct", { address: "https://example.org/code" });
  const d = w.sw.declare({ text: [p.contentId] });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const held = le.earned(null, [d.id]).earned.capture[d.id];
  const absent = le.earned(null, ["STD-2026-0099"]).earned.capture["STD-2026-0099"];
  assert.equal(held.grade, EARNED_CAPTURE_CEILING);
  assert.equal(absent.undetermined_because, "NO_SUCH_STANDARD");
  for (const e of [held, absent]) {
    assert.equal(e.ceiling, CEILING);
    assert.doesNotMatch(words(e), FORBIDDEN);
  }
});

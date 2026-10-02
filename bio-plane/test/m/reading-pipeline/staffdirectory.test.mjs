/* reading-pipeline: R2's tier 2 through the real `pdf-worker` member over two real captured PDFs, read by docprofile's
   `staff_directory` type (N391, K573; converted from `test/staff-directory-e2e.test.mjs`; moved from `extraction` by
   N513, its assertions unchanged). `read` runs over
   the stored bytes with the real tier-1 `pdf` entry; `PDF_WORKER` is bound to the member's own `fetch` (its source, not
   the committed bundle: R3 names the member through its binding, never the bundle) over the same evidence bucket.
   The fixtures are the bytes FW-20's census read (`s3://cao-94612`, fetched 2026-09-23): a staff directory whose fonts
   carry no Unicode map (`no_tounicode`, tier 2's case) and a meeting schedule whose every row names a staff address
   (reference as membership, which must not read as a directory). `extraction` R46 is the reference's shape. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fresh, hold, doc, sha } from "./fixture.mjs";
import pdfWorker from "../../../../pdf-worker/src/index.mjs";

const FX = (f) => new Uint8Array(readFileSync(new URL(`./fixtures/${f}`, import.meta.url)));
const DIR = FX("nss-staff-directory-2022-06-14.pdf");
const SCHED = FX("ncpc-zoom-meeting-dates.pdf");

/* The member bound as the fleet binds it: its `fetch` over its own CAPTURES read binding (the evidence bucket), every
   call's body recorded. */
function realMember(w) {
  const calls = [];
  return { calls, async fetch(url, init) {
    calls.push({ url, body: JSON.parse(init.body) });
    return pdfWorker.fetch(new Request(url, init), { CAPTURES: w.evidence, VERSION: "test" });
  } };
}
async function readReal(w, bytes, name, env) {
  const d = await hold(w.evidence, bytes);
  const out = await w.read(doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf",
                                   locator: `https://cao-94612.s3.amazonaws.com/documents/${name}`,
                                   headers: [["content-type", "application/pdf"]] }), { env, storeName: "bio" });
  return { d, out, r: out.reading };
}

test("R3 R10 R11 R16 (N391): a staff directory tier 1 cannot map is sent to the bound pdf-worker, its page replaced at tier 2, and read by the staff_directory type: twelve entries, each keyed by its address and placed on its pdf page", async () => {
  assert.equal(sha(DIR), "8d7f6359060360f92456d594fe7523c84ed8d75faffb8f6ffd9695f606c78ce8", "the directory's bytes are the ones the census read");
  const w = fresh();
  const pdf = realMember(w);
  const { d, r } = await readReal(w, DIR, "Neighborhood-Services-Section-Directory-Rev-06-14-22.pdf", { PDF_WORKER: pdf });
  /* R16: the member is reached once, through its binding, with the capture's digest and store only */
  assert.equal(pdf.calls.length, 1);
  assert.deepEqual(pdf.calls[0].body, { capture_sha: d, store: "bio" });
  /* R3: the page was replaced, so the wired tier is 2; one tier throughout, so one layer part (R10) */
  assert.equal(r.read_from_text, true);
  assert.equal(r.text_tier, 2);
  assert.equal(r.text_container, "pdf");
  assert.deepEqual(r.text_source.map((s) => [s.step, s.tier]), [["layer", 2]]);
  assert.equal(r.text_source[0].cap, null);
  assert.ok(r.provenance.pages.length > 0 && r.provenance.pages.every((p) => p.tier === 2 && p.member === "pdf-worker"));
  /* the content type docprofile chose, and what it read */
  assert.equal(r.content_type, "staff_directory");
  assert.equal(r.found, true);
  assert.equal(r.entities.length, 12);
  for (const e of r.entities) {
    assert.match(e.facts.address, /^[^@\s]+@oaklandca\.gov$/, "every entry names its address");
    assert.ok(e.key.endsWith(e.facts.address), "keyed by its address");
    assert.equal(e.ref, `${e.kind}:${e.key}`, "the reference as it appears");
    assert.equal(e.source && e.source.kind, "pdf-page", "placed on its pdf page");
  }
  assert.equal(new Set(r.entities.map((e) => e.key)).size, 12, "twelve distinct entries");
  /* R11: the basis names the reader, the tier and the tier-2 note, and where references were read */
  assert.match(r.basis, /staff_directory reader/);
  assert.match(r.basis, /\(tier 2\)/);
  assert.match(r.basis, /re-read by the tier-2 decoder/);
  assert.match(r.basis, /every reference carries where it was read \(12 of 12\)/);
});

test("R3 R11 (N391): the same directory with no pdf-worker bound leaves tier 1 standing: a failed reading naming the unbound member and the no_tounicode residue, and no content type claimed", async () => {
  const w = fresh();
  const { r } = await readReal(w, DIR, "Neighborhood-Services-Section-Directory-Rev-06-14-22.pdf", {});
  assert.equal(r.read_from_text, false);
  assert.equal(r.found, false);
  assert.equal(r.text_tier, 1);
  assert.deepEqual(r.entities, []);
  assert.notEqual(r.content_type, "staff_directory");
  assert.match(r.basis, /no pdf-worker member is bound/);
  assert.match(r.basis, /no_tounicode/);
});

test("R3 (N391): a meeting schedule whose every row names a staff address, read at tier 2 through the same member, is read from text and is not a staff_directory", async () => {
  assert.equal(sha(SCHED), "6dd4a3c4c0843409145f9df4c6ca44463e4c8b1197c8af727aefd7883cf91e8f", "the schedule's bytes are the ones the census read");
  const w = fresh();
  const pdf = realMember(w);
  const { r } = await readReal(w, SCHED, "NCPC-Zoom-Meeting-Dates-Final.pdf", { PDF_WORKER: pdf });
  assert.equal(pdf.calls.length, 1);
  assert.equal(r.read_from_text, true);
  assert.equal(r.text_tier, 2);
  assert.notEqual(r.content_type, "staff_directory");
});

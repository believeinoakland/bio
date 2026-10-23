/* publication — G47 (K4666): a case document's text has a stated byte bound at the store and at the re-author, so a
   document too large for the platform's value bound is refused, never thrown. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V, sha } from "./fixture.mjs";
import { CASE_DOCUMENT_BYTES_MAX as BOUND } from "../../../src/publication/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

const CASE = "CASE-2026-0001";
const obs = "INFO-2026-0099-observation";

function prepared(opts = {}) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc("INFO-2026-0001-minutes");
  w.inquiry("INQ-2026-0001", { legs: [{ target: "INFO-2026-0001-minutes" }] });
  const roles = [{ target: "INQ-2026-0001", version_sha: w.head("INQ-2026-0001"), role: "load_bearing" }];
  w.prepare(CASE, 1, { project: proj, roles, attributions: [{ observation: obs }], ...opts });
  return { w, proj, roles };
}
/* a text of exactly `n` UTF-8 bytes made of `ch` (1 byte) lines, no document structure */
const bytesOf = (n, ch = "a") => ch.repeat(n);
const lines = (extra) => ({ frontmatter: ["observation_attributions:", `  - observation: ${obs}`, "    level: group",
                                          '    shown: "g"', "    chosen_at_edition: 1"],
                            body: ["## Whose Words These Are", "", extra, ""] });

test("R21 storeCaseDocument refuses a text over CASE_DOCUMENT_BYTES_MAX as CASE_DOCUMENT_TOO_LARGE {bytes, bound}, writing nothing and throwing nothing; exactly the bound is stored", () => {
  assert.equal(BOUND, 1572864);
  const w = world();
  const over = w.p.storeCaseDocument({ case: CASE, edition: 1, text: bytesOf(BOUND + 1), author: V("olive") });
  assert.deepEqual(over, { ok: false, reason: "CASE_DOCUMENT_TOO_LARGE", bytes: BOUND + 1, bound: BOUND });
  assert.equal(w.count("case_documents"), 0, "nothing written");
  const exact = w.p.storeCaseDocument({ case: CASE, edition: 1, text: bytesOf(BOUND), author: V("olive") });
  assert.equal(exact.ok, true);
  assert.equal(exact.stored, true);
  assert.equal(exact.doc_sha, sha(bytesOf(BOUND)));
  /* bytes, not characters: a 2-byte character counts 2, a 3-byte 3, a 4-byte (one code point) 4 */
  const w2 = world();
  assert.equal(w2.p.storeCaseDocument({ case: CASE, edition: 1, text: "é".repeat(BOUND / 2), author: V("olive") }).ok, true);
  assert.equal(w2.p.storeCaseDocument({ case: CASE, edition: 2, text: "é".repeat(BOUND / 2) + "a", author: V("olive") }).bytes, BOUND + 1);
  assert.equal(w2.p.storeCaseDocument({ case: CASE, edition: 3, text: "€".repeat(BOUND / 3 + 1), author: V("olive") }).reason, "CASE_DOCUMENT_TOO_LARGE");
  assert.equal(w2.p.storeCaseDocument({ case: CASE, edition: 4, text: "😀".repeat(BOUND / 4 + 1), author: V("olive") }).bytes, BOUND + 4);
  assert.equal(w2.count("case_documents"), 1, "only the exact one is held");
  /* the refusal is not thrown over a replaced unsigned document either: the stored one stays */
  const again = w.p.storeCaseDocument({ case: CASE, edition: 1, text: bytesOf(BOUND + 5), author: V("olive") });
  assert.equal(again.reason, "CASE_DOCUMENT_TOO_LARGE");
  assert.equal(w.row(`SELECT doc_sha FROM case_documents`).doc_sha, sha(bytesOf(BOUND)));
});

test("R21 reauthorSection refuses only a splice whose result is over the bound and larger than the stored text, answering reauthored false with too_large and a why, the stored text unchanged", () => {
  const { w } = prepared();
  const held = w.row(`SELECT doc_sha, text FROM case_documents`);
  const big = "x".repeat(BOUND);
  const r = w.p.reauthorSection({ case: CASE, edition: 1, docSha: held.doc_sha, section: "attribution", lines: lines(big) });
  assert.equal(r.ok, true);
  assert.equal(r.reauthored, false);
  assert.equal(r.doc_sha, held.doc_sha);
  assert.equal(r.too_large.bound, BOUND);
  assert.ok(r.too_large.bytes > BOUND);
  assert.equal(r.why, localize("publication.index.the_case_document_would_pass",
    "the case document would pass {bound} bytes ({bytes}) and was left as it was", { bytes: r.too_large.bytes, bound: BOUND }));
  assert.deepEqual(w.row(`SELECT doc_sha, text FROM case_documents`), held, "the stored text is unchanged");
  /* a splice under the bound is allowed (control) */
  const small = w.p.reauthorSection({ case: CASE, edition: 1, docSha: held.doc_sha, section: "attribution", lines: lines("fine") });
  assert.equal(small.reauthored, true);
  assert.equal("too_large" in small, false);
});

test("R21 a splice that shrinks or keeps an over-bound unsigned text is allowed, so one stored earlier can be mended", () => {
  const { w } = prepared();
  const held = w.row(`SELECT doc_sha, text FROM case_documents`);
  /* an over-bound unsigned text, as one stored before the bound: placed under the store's own column */
  const huge = held.text + `\n${"y".repeat(BOUND + 100)}\n`;
  const shaHuge = sha(huge);
  w.rows(`UPDATE case_documents SET text=?, doc_sha=?`, huge, shaHuge);
  const mended = w.p.reauthorSection({ case: CASE, edition: 1, docSha: shaHuge, section: "attribution", lines: lines("shorter") });
  assert.equal(mended.reauthored, true, "a shrinking splice of an over-bound text is allowed");
  const now = w.row(`SELECT text FROM case_documents`).text;
  assert.ok(now.length > BOUND, "still over the bound: shrinking is all the splice owes");
  /* growing it further is refused */
  const grow = w.p.reauthorSection({ case: CASE, edition: 1, docSha: sha(now), section: "attribution", lines: lines("z".repeat(2000)) });
  assert.equal(grow.reauthored, false);
  assert.ok(grow.too_large);
});

test("R21 controls: a normal document is stored byte for byte as before, and a signed document is never touched by a larger text", () => {
  const { w, proj, roles } = prepared();
  const held = w.row(`SELECT doc_sha, text FROM case_documents`);
  assert.equal(held.doc_sha, sha(held.text));
  w.signCase(CASE, 1, { project: proj, roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: r.role })) });
  const before = w.snapshot(["case_documents"]);
  const refused = w.p.storeCaseDocument({ case: CASE, edition: 1, text: bytesOf(BOUND + 1), author: V("olive") });
  assert.equal(refused.reason, "CASE_DOCUMENT_TOO_LARGE");
  assert.deepEqual(w.snapshot(["case_documents"]), before);
  const signed = w.p.reauthorSection({ case: CASE, edition: 1, docSha: held.doc_sha, section: "attribution", lines: lines("z".repeat(BOUND)) });
  assert.equal(signed.reauthored, false);
  assert.equal("too_large" in signed, false, "a signed document is refused as signed, before its size is looked at");
});

/* public-read — when an edition was signed and when it was published (R29; DEC-147 (5), N662, K1790, K1826), and R28's
   index read once (N598, K1644). R29: `publishedCase` (its edition and each `edition_index` entry), `publishedList`'s case
   rows and `publishedEditions`' rows answer `signed_at` and `published_at` exactly as `publication` holds them on the
   case edition's `published_cases` row (its R70, R40), never composed from another instant; a finding's own rows are
   unchanged; nothing waiting or unsigned is answered. R28: every read that builds the withholding index reads the stamps
   in one `stampedEditions()` (publication R64), never one `stampsOf` per edition. Driven at the module's interface, its
   ops (`publicReadOps`) over `publication` as it stands (the fixture's stand-ins until publication's T34 merge). Each
   claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { PublicRead } from "../../../src/public-read/index.mjs";

const F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes", CASE = "CASE-2026-0001";
const SIGNED = "2026-10-06T09:00:00Z", PUBLISHED = "2026-10-07T15:30:00Z";

/* CASE edition 1 over F, ratified and published; DOC a document F rests on. */
function published() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  return { w, proj, pin };
}
/* publication's row for one case edition, set as its R70 holds them (a scheduled edition: two instants). */
const hold = (w, caseId, edition, signed, pub) =>
  w.st.sql.exec(`UPDATE published_cases SET signed_at=?, published_at=? WHERE case_id=? AND edition=?`, signed, pub, caseId, edition);
const dates = (o) => [o.signed_at, o.published_at];

test("R29 publishedCase answers its edition's signed_at and published_at, and each edition_index entry its own, exactly as publication holds them, by case, by finding and by hash, from the store op", () => {
  const { w, pin } = published();
  hold(w, CASE, 1, SIGNED, PUBLISHED);
  for (const q of [{ id: CASE }, { id: F }, { sha256: pin }, { id: CASE, edition: 1 }]) {
    const c = w.read("publishedcase", q);
    assert.equal(c.ok, true, JSON.stringify(q));
    assert.deepEqual(dates(c), [SIGNED, PUBLISHED], JSON.stringify(q));
    assert.deepEqual(c.edition_index.map((e) => [e.edition, ...dates(e)]), [[1, SIGNED, PUBLISHED]]);
  }
  /* an edition published at signing (or committed before T34) answers one instant for both, as publication holds it */
  hold(w, CASE, 1, SIGNED, SIGNED);
  assert.deepEqual(dates(w.read("publishedcase", { id: CASE })), [SIGNED, SIGNED]);
  /* negative control: the answer follows the row, and is not composed from `ratified_at` or any other instant */
  const c = w.read("publishedcase", { id: CASE });
  hold(w, CASE, 1, "2030-01-01T00:00:00Z", "2030-01-02T00:00:00Z");
  assert.deepEqual(dates(w.read("publishedcase", { id: CASE })), ["2030-01-01T00:00:00Z", "2030-01-02T00:00:00Z"]);
  assert.notEqual(c.ratified_at, "2030-01-01T00:00:00Z");
});

test("R29 R2 publishedList's case rows and publishedEditions' rows answer both dates of their case edition; publishedList's finding rows are unchanged", () => {
  const { w } = published();
  hold(w, CASE, 1, SIGNED, PUBLISHED);
  const list = w.read("publishedlist");
  assert.deepEqual(list.cases.map((c) => [c.case_id, c.edition, ...dates(c)]), [[CASE, 1, SIGNED, PUBLISHED]]);
  assert.equal("signed_at" in list.bundles[0] || "published_at" in list.bundles[0], false, "a finding's edition is unchanged");
  const eds = w.read("publishededitions", { id: F });
  assert.deepEqual(eds.editions.map((e) => [e.edition, e.case_id, e.case_edition, ...dates(e)]), [[1, CASE, 1, SIGNED, PUBLISHED]]);
  /* negative control: both lists follow the row */
  hold(w, CASE, 1, PUBLISHED, PUBLISHED);
  assert.deepEqual([dates(w.read("publishedlist").cases[0]), dates(w.read("publishededitions", { id: F }).editions[0])],
                   [[PUBLISHED, PUBLISHED], [PUBLISHED, PUBLISHED]]);
});

test("R29 R2 a finding several cases pin answers null dates on publishedEditions, as its other case fields (D-309); a finding in no case answers no dates, and publishedCase's loose branch null", () => {
  const { w, proj, pin } = published();
  w.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.equal(w.signCase("CASE-2026-0002", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "supporting" }] }).ok, true);
  hold(w, CASE, 1, SIGNED, PUBLISHED);
  hold(w, "CASE-2026-0002", 1, PUBLISHED, PUBLISHED);
  const e = w.read("publishededitions", { id: F }).editions[0];
  assert.deepEqual([e.case_id, e.scope, e.cases.length, ...dates(e)], [null, null, 2, null, null]);
  /* each case edition still answers its own dates where it is named */
  assert.deepEqual(w.read("publishedlist").cases.map((c) => [c.case_id, ...dates(c)]),
                   [[CASE, SIGNED, PUBLISHED], ["CASE-2026-0002", PUBLISHED, PUBLISHED]]);
  /* a ratified record in no case: its rows carry no case edition's dates */
  assert.equal(w.signFinding(DOC).ok, true);
  const loose = w.read("publishededitions", { id: DOC }).editions[0];
  assert.deepEqual([loose.cases, "signed_at" in loose, "published_at" in loose], [[], false, false]);
  const lc = w.read("publishedcase", { id: DOC });
  assert.deepEqual([lc.ok, lc.caseId, ...dates(lc)], [true, null, null, null]);
});

test("R29 R14 an edition not yet published (prepared, its signature not committed, as a waiting edition's is) answers as one that does not exist; neither date is in the case file's facts (R23)", () => {
  const { w, proj, pin } = published();
  const never = w.read("publishedcase", { id: "CASE-2099-0001" });
  /* a whole case prepared and not committed */
  w.prepare("CASE-2026-0003", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  const waiting = w.read("publishedcase", { id: "CASE-2026-0003" });
  assert.deepEqual(waiting, never, "the same bytes as a case that never existed");
  /* a further edition of a published case, prepared and not committed */
  w.prepare(CASE, 2, { project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.deepEqual(w.read("publishedcase", { id: CASE, edition: 2 }), never);
  const c = w.read("publishedcase", { id: CASE });
  assert.deepEqual([c.edition, c.edition_index.map((e) => e.edition)], [1, [1]]);
  assert.deepEqual(w.read("publishedlist").cases.map((x) => [x.case_id, x.edition]), [[CASE, 1]]);
  /* R23: the case file is built from caseFileFacts, which carries no publishing date of its own */
  const facts = w.read("casefilefacts", { caseId: CASE, edition: 1 });
  assert.equal(/signed_at|published_at/.test(JSON.stringify(facts)), false);
  /* negative control: the published edition answers */
  assert.equal(c.ok, true);
});

test("R28 (N598) every read building the withholding index reads the stamps once, through stampedEditions, and never one stampsOf per edition", () => {
  const { w, proj, pin } = published();
  w.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w.signCase("CASE-2026-0002", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "supporting" }] });
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 4 }, effect: "redact" });
  const seen = [];
  const spy = new Proxy(w.p, { get(t, k) { const v = t[k]; if (typeof v !== "function") return v;
    return (...a) => { seen.push(String(k)); return v.apply(t, a); }; } });
  const r = new PublicRead({ storage: w.st, publication: spy, docket: w.docket });
  const count = (k) => seen.filter((m) => m === k).length;
  for (const [label, read] of [["publishedList", () => r.publishedList()], ["publishedManifest", () => r.publishedManifest()],
                               ["publishedEditions", () => r.publishedEditions(F)], ["publishedCase", () => r.publishedCase({ caseId: CASE })],
                               ["withheldOf", () => r.withheldOf([pin])]]) {
    seen.length = 0;
    read();
    assert.deepEqual([count("stampedEditions"), count("stampsOf")], [1, 0], label);
  }
  /* the stamp is still served beside its edition */
  assert.deepEqual(r.publishedCase({ caseId: CASE }).court_orders.map((o) => o.effect), ["redact"]);
  /* negative control: with no stamp anywhere, nothing is opened beyond the one read */
  const { w: w2 } = published();
  const seen2 = [];
  const spy2 = new Proxy(w2.p, { get(t, k) { const v = t[k]; if (typeof v !== "function") return v;
    return (...a) => { seen2.push(String(k)); return v.apply(t, a); }; } });
  new PublicRead({ storage: w2.st, publication: spy2, docket: w2.docket }).publishedList();
  assert.deepEqual(seen2.filter((m) => m !== "soleCase"), ["stampedEditions"]);
});

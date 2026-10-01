/* Converts `bio-plane/test/publish.test.mjs`, public-read's share only: R2 — `publishedlist`'s title. Each published
   edition's row carries the title FROZEN INTO IT (the old suite's "the public index names the case by title, so a
   public listing is not N+1", section 3), not the working record's title and not another edition's. The rest of that
   suite (the publishing act, DEC-13, the bar, ratification) belongs to other modules.
   The old suite drove the act and ratification through a whole Worker; here the same facts are rebuilt on
   public-read's world through publication's commits, as ratification makes them: the title committed is the ratified
   bytes' own frontmatter `title` (ratification's committer reads `ratifiedFm.title`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd } from "./fixture.mjs";

const F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const Q1 = "Did the fund transfer happen?", Q2 = "Did the fund transfer happen twice?", Q3 = "Renamed while working";

/* The frozen title of the bytes at `id`'s head, read as ratification reads it. */
const frozenTitle = (w, id) => w.fm(id).title;

function published() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  /* edition 1 of F, in case edition 1 */
  w.inquiry(F, { question: Q1, legs: [{ target: DOC }] });
  const pin1 = w.head(F);
  const t1 = frozenTitle(w, F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin1 }] });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin1, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(F, { title: t1 }).ok, true);
  /* edition 2 of F, revised bytes with a new title, in case edition 2 */
  assert.equal(w.promote(F, inquiryMd(F, { question: Q2, legs: [{ target: DOC }] })).ok, true);
  const pin2 = w.head(F);
  const t2 = frozenTitle(w, F);
  w.prepare("CASE-2026-0001", 2, { project: proj, roles: [{ target: F, version_sha: pin2, edition: 2 }] });
  assert.equal(w.signCase("CASE-2026-0001", 2, { project: proj, roster: [{ bundle_id: F, version_sha: pin2, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(F, { title: t2 }).ok, true);
  /* a loose published bundle (the document F rests on), its own title frozen */
  const tDoc = frozenTitle(w, DOC);
  assert.equal(w.signFinding(DOC, { title: tDoc }).ok, true);
  /* the working record then moves on: a third, unratified revision renames F */
  assert.equal(w.promote(F, inquiryMd(F, { question: Q3, legs: [{ target: DOC }] })).ok, true);
  assert.equal(frozenTitle(w, F), Q3);
  return { w, t1, t2, tDoc, pin1, pin2 };
}

test("R2 (publish) every publishedlist row carries the title frozen into its own edition, never the working title", () => {
  const { w, t1, t2, tDoc, pin1, pin2 } = published();
  assert.deepEqual([t1, t2, tDoc], [Q1, Q2, "Document " + DOC]);
  const list = w.read("publishedlist");
  /* every published edition is listed, each with a string title equal to what was frozen into that edition */
  assert.deepEqual(list.bundles.map((b) => [b.bundle_id, b.edition, b.bundle_sha, b.title]),
                   [[DOC, 1, w.row(`SELECT bundle_sha FROM published_bundles WHERE bundle_id=?`, DOC).bundle_sha, tDoc],
                    [F, 1, pin1, t1], [F, 2, pin2, t2]]);
  for (const b of list.bundles) assert.equal(typeof b.title, "string");
  /* the working title of the moved-on record appears on no row */
  assert.equal(JSON.stringify(list).includes(Q3), false);
  /* the method answers the same as the op */
  assert.deepEqual(w.pr.publishedList(), list);
});

test("R2 (publish) a row's title is the one committed with that edition, as stored, including none", () => {
  const w = world();
  w.member("olive");
  w.doc(DOC);
  /* an edition committed with no title answers null, never a title borrowed from the working record */
  assert.equal(w.signFinding(DOC, { title: null }).ok, true);
  const row = w.read("publishedlist").bundles.find((b) => b.bundle_id === DOC);
  assert.equal(row.title, null);
  assert.equal(JSON.stringify(w.read("publishedlist")).includes(`Document ${DOC}`), false);
});

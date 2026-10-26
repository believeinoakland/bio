/* publication — T51 fix round 5, E4's provider half: `casedocument` answers the findings its document pins, beside the
   citations it signed, so a reloaded ceremony can rebuild what the edition names. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V } from "./fixture.mjs";

const CASE = "CASE-2026-0001";

/* Two findings prepared into one unsigned edition, one load-bearing and one supporting, with one citation. */
function prepared() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc("INFO-2026-0001-minutes");
  w.inquiry("INQ-2026-0001", { legs: [{ target: "INFO-2026-0001-minutes" }] });
  w.inquiry("INQ-2026-0002", { legs: [{ target: "INFO-2026-0001-minutes" }] });
  const roles = [{ target: "INQ-2026-0001", version_sha: w.head("INQ-2026-0001"), role: "load_bearing" },
                 { target: "INQ-2026-0002", version_sha: w.head("INQ-2026-0002"), role: "supporting" }];
  w.prepare(CASE, 1, { project: proj, roles, citations: [{ target: "INFO-2026-0001-minutes", version: "pinned" }] });
  return { w, proj, roles };
}

test("R1 an unsigned edition's casedocument answers findings [{target, version_sha, role}] equal to the roster the preparation pinned, beside citations whose shape is unchanged", () => {
  const { w, roles } = prepared();
  const a = w.p.caseDocument(CASE, 1, V("olive"));
  assert.equal(a.ok, true);
  assert.deepEqual(a.findings, roles.map((r) => ({ target: r.target, version_sha: r.version_sha, role: r.role })),
                   "the pinned roster, in the document's order, each with its pin and role");
  assert.deepEqual(Object.keys(a.citations).sort(), ["rows", "state"], "citations stays {state, rows}");
  assert.equal(a.citations.state, "signed");
  assert.deepEqual(a.citations.rows, [{ target: "INFO-2026-0001-minutes", version: "pinned" }]);
  assert.equal(Array.isArray(a.citations), false, "the project's citation edges are not the findings, and citations is not an array");
  assert.deepEqual(w.op("casedocument", { case: CASE, edition: 1, viewer: V("olive") }).findings, a.findings,
                   "op=casedocument is the same read");
});

test("R1 a signed edition answers the same findings, to anybody; a refusal carries none", () => {
  const { w, proj, roles } = prepared();
  const before = w.p.caseDocument(CASE, 1, V("olive")).findings;
  const roster = roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: r.role }));
  assert.equal(w.signCase(CASE, 1, { project: proj, roster }).ok, true);
  assert.deepEqual(w.p.caseDocument(CASE, 1, null).findings, before);
  /* control: no standing, no document, no findings */
  const stranger = w.p.caseDocument(CASE, 2, V("olive"));
  assert.equal(stranger.ok, false);
  assert.equal("findings" in stranger, false);
});

test("R1 R28 a document stating no roster answers findings null, never an invented list; one stating an empty roster answers []", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  const bare = `---\nformat: bio-case-document/6\ncase_id: ${CASE}\ncase_edition: 1\ncase_project: ${proj}\n---\nbody\n`;
  assert.equal(w.p.storeCaseDocument({ case: CASE, edition: 1, text: bare, author: V("olive"), at: "2026-10-01T00:00:00Z" }).ok, true);
  const none = w.p.caseDocument(CASE, 1, V("olive"));
  assert.equal(none.ok, true);
  assert.equal(none.findings, null);
  w.prepare(CASE, 2, { project: proj, roles: [] });
  assert.deepEqual(w.p.caseDocument(CASE, 2, V("olive")).findings, []);
});

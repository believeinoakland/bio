/* case-import: R4 (K5148; WALK-FINAL-10B R98): `importedCase` and `importedCases` carry the case's `scope` (the case
   document's `case_scope`, its reading name), and each finding of an edition its `title` (the finding file's front matter,
   R31's rule), never only the ids. At the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, imp, caseFile, V, F1, F2, F3 } from "./fixture.mjs";
import { importedNamed } from "./fixtures.mjs";

const SCOPE = "Did the clerk stamp the contract before the vote?";

test("R4 importedCase answers the case's scope and each finding's title, and importedCases the scope of each import", async () => {
  const w = seeded();
  const a = await imp(w, caseFile({ scope: SCOPE, titles: { [F1]: "The stamp predates the vote", [F2]: "The contract was signed" } }));
  const one = w.ci.importedCase({ import: a.import, viewer: V("bob") });
  assert.equal(one.ok, true);
  assert.equal(one.scope, SCOPE);
  const byFinding = Object.fromEntries(one.edition.findings.map((f) => [f.finding, f.title]));
  assert.deepEqual(byFinding, { [F1]: "The stamp predates the vote", [F2]: "The contract was signed", [F3]: null });
  const list = w.ci.importedCases({ viewer: V("bob") });
  assert.equal(list.imports[0].scope, SCOPE);
});

test("R4 control: a case document that states no scope answers scope null, and a finding file with no title answers null, never the id", async () => {
  const w = seeded();
  const a = await imp(w, caseFile({}));
  const one = w.ci.importedCase({ import: a.import, viewer: V("bob") });
  assert.equal(one.scope, null);
  for (const f of one.edition.findings) assert.equal(f.title, null, f.finding);
  assert.equal(w.ci.importedCases({ viewer: V("bob") }).imports[0].scope, null);
});

test("R4 control: the scope is that of the latest edition by default, and of the edition named", async () => {
  const w = seeded();
  const a = await imp(w, caseFile({ edition: 1, scope: "First reading" }));
  await imp(w, caseFile({ edition: 2, scope: "Second reading" }));
  assert.equal(w.ci.importedCase({ import: a.import, viewer: V("bob") }).scope, "Second reading");
  assert.equal(w.ci.importedCase({ import: a.import, edition: 1, viewer: V("bob") }).scope, "First reading");
  assert.equal(w.ci.importedCases({ viewer: V("bob") }).imports[0].scope, "Second reading");
});

test("R4 control: a viewer who is not an active member is answered as no import, with no scope", async () => {
  const w = seeded();
  const a = await imp(w, caseFile({ scope: SCOPE }));
  const r = w.ci.importedCase({ import: a.import, viewer: V("stranger") });
  assert.equal(r.ok, false);
  assert.equal(Object.hasOwn(r, "scope"), false);
});

test("R4 the published fixture importedNamed is made by the real reads and carries the scope and the titles", async () => {
  const { scope, titles, list, one } = await importedNamed();
  assert.equal(one.scope, scope);
  assert.equal(list.imports[0].scope, scope);
  assert.equal(one.edition.findings.find((f) => f.finding === F1).title, titles[F1]);
  assert.equal(one.edition.findings.find((f) => f.finding === F3).title, null);
});

/* case-import: R26 (T50-15; N1087, N1090; K3302; DEC-236 (B204 (2))): `importedCases({viewer})` answers what the team's
   list of imported cases draws, with no read per case: each import's `latest_edition`; each edition's `importer` beside
   `imported_by` and `imported_at`, and its findings counted by result over the latest recreation recorded for it. At the
   module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, imp, caseFile, V, F1, F2, F3, SOURCE, CASE } from "./fixture.mjs";

const g = (grade) => ({ state: "graded", grade });

test("R26 two imports, one edition with a finding recreated in part: the counts, the importer's handle and latest_edition are answered", async () => {
  const w = seeded();
  w.script.set(F2, { role: "supporting", result: "recreated_in_part", missing: [{ sha: "d4".repeat(32), words: "the letter" }],
                     pair: { capture: g("D"), connection: g("D") } });
  w.script.set(F3, { role: "load_bearing", result: "did_not_recreate", differs: [{ axis: "connection" }], pair: null });
  w.clock.now = Date.parse("2026-10-03T09:00:00Z");
  const a = await imp(w, caseFile({ edition: 1 }));
  w.clock.now = Date.parse("2026-10-04T09:00:00Z");
  await imp(w, caseFile({ edition: 2, findings: [F1] }), "bob");
  const b = await imp(w, caseFile({ group: "other-team", case: "CASE-2026-0777", lens: null, findings: [F1, F2] }));
  const r = w.ci.importedCases({ viewer: V("bob") });
  assert.equal(r.count, 2);
  const byId = Object.fromEntries(r.imports.map((i) => [i.import, i]));
  assert.equal(byId[a.import].latest_edition, 2);
  assert.deepEqual(byId[a.import].editions.map((e) => [e.edition, e.imported_by, e.imported_at, e.importer]), [
    [1, "alice", "2026-10-03T09:00:00Z", { member: "alice", handle: "h_alice" }],
    [2, "bob", "2026-10-04T09:00:00Z", { member: "bob", handle: "h_bob" }]]);
  const counts = (e) => [e.findings, e.recreated, e.recreated_in_part, e.did_not_recreate];
  assert.deepEqual(counts(byId[a.import].editions[0]), [3, 1, 1, 1]);
  assert.deepEqual(counts(byId[a.import].editions[1]), [1, 1, 0, 0]);
  assert.equal(byId[b.import].latest_edition, 1);
  assert.deepEqual(counts(byId[b.import].editions[0]), [2, 1, 1, 0]);
  /* the order is today's: source group, case, import */
  assert.deepEqual(r.imports.map((i) => i.group), [...r.imports.map((i) => i.group)].sort());
  assert.equal(r.imports[0].group, "other-team");
  assert.equal(r.imports[1].group, SOURCE);
  assert.equal(r.imports[1].case, CASE);
  assert.equal(r.wrote, false);
});

test("R26 the counts are those of the latest recreation recorded for the edition: a completion that fills the gap moves in-part to recreated", async () => {
  const w = seeded();
  const letter = new TextEncoder().encode("the letter");
  const { createHash } = await import("node:crypto");
  const sha = createHash("sha256").update(letter).digest("hex");
  w.script.set(F2, { role: "supporting", result: "recreated_in_part", missing: [{ sha, words: "the letter" }],
                     pair: { capture: g("D"), connection: g("D") } });
  const a = await imp(w);
  const edition = () => w.ci.importedCases({ viewer: V("bob") }).imports[0].editions[0];
  assert.deepEqual([edition().findings, edition().recreated, edition().recreated_in_part], [3, 2, 1]);
  const done = await w.ci.completeImportedDocument({ import: a.import, edition: 1, bytes: letter, by: V("alice"), viewer: V("alice") });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 200));
  assert.deepEqual([edition().findings, edition().recreated, edition().recreated_in_part, edition().did_not_recreate], [3, 3, 0, 0]);
});

test("R26 an edition with no recreation recorded answers its counts null, not zero; an empty one answers zero", async () => {
  const w = seeded();
  const a = await imp(w);
  const e = () => w.ci.importedCases({ viewer: V("bob") }).imports[0].editions[0];
  /* an edition whose recreation rows are absent, as one recorded before recreations were kept would be */
  w.st.sql.exec(`DELETE FROM case_import_checks WHERE import_id=?`, a.import);
  assert.deepEqual([e().findings, e().recreated, e().recreated_in_part, e().did_not_recreate], [null, null, null, null]);
  /* the control: an edition whose recreation holds no finding counts zero, not null */
  const w2 = seeded();
  await imp(w2, caseFile({ findings: [] }));
  const z = w2.ci.importedCases({ viewer: V("bob") }).imports[0].editions[0];
  assert.deepEqual([z.findings, z.recreated, z.recreated_in_part, z.did_not_recreate], [0, 0, 0, 0]);
});

test("R26 the importer's handle is membership's: null where none is held; the founder is named by her handle with founder: true", async () => {
  const w = seeded();
  w.st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                 VALUES ('erin', 'Cover erin', NULL, 'member', 'active', '["contribute"]', 't', 't')`);
  w.membership.registerClaimed("credentials", () => true);
  const e1 = await w.ci.importCaseFile({ parts: caseFile({ edition: 1 }).parts, by: V("erin"), viewer: V("erin") });
  assert.equal(e1.ok, true);
  const imp1 = () => w.ci.importedCases({ viewer: V("bob") }).imports[0].editions;
  assert.deepEqual(imp1()[0].importer, { member: "erin", handle: null });
  /* the founder holds no handle yet: her row names her with a null handle; once held, by it */
  const e2 = await w.ci.importCaseFile({ parts: caseFile({ edition: 2 }).parts, by: V("admin"), viewer: V("admin") });
  assert.equal(e2.ok, true, JSON.stringify(e2).slice(0, 200));
  assert.deepEqual(imp1()[1].importer, { member: "admin", handle: null, founder: true });
  assert.equal(w.membership.founderHandleSet({ handle: "founder-h", by: "admin" }).ok, true);
  assert.deepEqual(imp1()[1].importer, { member: "admin", handle: "founder-h", founder: true });
  assert.equal(imp1()[1].imported_by, "admin", "imported_by is unchanged");
  /* the founder reads the list under her own viewer, the bare `admin` (membership R43), as a member does */
  assert.equal(w.ci.importedCases({ viewer: "admin" }).count, 1, "the founder sees the imports");
  assert.equal(w.ci.importedCases({ viewer: "admin" }).imports[0].editions.length, 2);
  /* no other row carries founder */
  assert.equal(Object.hasOwn(imp1()[0].importer, "founder"), false);
});

test("R26 with no import held, or a viewer who is not an active member, it is imports: [], count: 0, the bytes of an instance with no import", async () => {
  const w = seeded();
  const empty = JSON.stringify(w.ci.importedCases({ viewer: V("alice") }));
  assert.deepEqual(JSON.parse(empty), { ok: true, imports: [], count: 0, wrote: false });
  await imp(w);
  assert.equal(w.ci.importedCases({ viewer: V("alice") }).count, 1, "the control: a member sees the import");
  for (const v of [V("carol"), V("dave"), V("nobody"), "class:ai", "", "admin"])
    assert.equal(JSON.stringify(w.ci.importedCases({ viewer: v })), empty, JSON.stringify(v));
  /* it writes nothing */
  const before = w.snapshot();
  w.ci.importedCases({ viewer: V("alice") });
  assert.deepEqual(w.snapshot(), before);
});

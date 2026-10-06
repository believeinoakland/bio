/* case-tensions — the case relation (R1), the revision flags and their discharge (R2), the flags read (R3), and the seam
   with publication's provider (K1505 (3)). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW } from "./fixture.mjs";
import { CASE_FLAGS_LIMIT, PUBLICATION_DOORS } from "../../../src/case-tensions/index.mjs";

const F = "INQ-2026-0001", G = "INQ-2026-0002";

/* A ratified case edition (CASE-2026-0001, 1) over F at its pin, owned by PROJ-1. */
function ratified() {
  const w = world();
  w.member("olive");
  const proj = w.project("PROJ-1", ["olive"]);
  const pin = w.finding(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w.sign("CASE-2026-0001", 1);
  return { w, proj, pin };
}

test("R1 caseRelation answers the ratified editions pinning the finding's CURRENT sha and any unsigned preparation naming it; it is promotion's fact caseMember", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("PROJ-1", ["olive"]);
  const pin = w.finding(F);
  assert.deepEqual(w.ct.caseRelation(F), { member: false, pinned: [], prepared: null });
  assert.deepEqual(w.ct.caseRelation("NOPE"), { member: false, pinned: [], prepared: null });
  assert.deepEqual(w.promotion.fact("caseMember", F), { ok: true, fact: "caseMember", value: false });
  /* prepared: an unsigned preparation naming F at its current sha, in an edition not ratified */
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.deepEqual(w.ct.caseRelation(F), { member: true, pinned: [], prepared: { case_id: "CASE-2026-0001", edition: 1 } });
  assert.equal(w.promotion.fact("caseMember", F).value, true);
  /* a preparation naming F at another sha, or another finding, claims nothing */
  w.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: "0".repeat(64) }, { target: G, version_sha: pin }] });
  assert.deepEqual(w.ct.caseRelation(F).prepared, { case_id: "CASE-2026-0001", edition: 1 });
  /* pinned: the signed roster, in case and edition order, with its role */
  w.sign("CASE-2026-0001", 1, { roster: [{ bundle_id: F, version_sha: pin, role: "supporting" }] });
  assert.deepEqual(w.ct.caseRelation(F), { member: true, prepared: null,
    pinned: [{ case_id: "CASE-2026-0001", edition: 1, version_sha: pin, role: "supporting" }] });
  /* an unsigned document of an edition already ratified is no preparation */
  w.pub.put("CASE-2026-0003", 1, w.pub.get("CASE-2026-0001", 1).text.replace(/CASE-2026-0001/g, "CASE-2026-0003"),
            { project: proj, ratified: true });
  assert.equal(w.ct.caseRelation(F).prepared, null);
  /* a revision moves the finding off its pin: an abandoned preparation or a stale pin no longer makes it a member */
  w.finding(F, "revised");
  assert.deepEqual(w.ct.caseRelation(F), { member: false, pinned: [], prepared: null });
  assert.equal(w.promotion.fact("caseMember", F).value, false);
});

test("R1 with no publication provider the relation is undetermined, never a quiet no: the fact caseMember answers FACT_FAILED", () => {
  const w = world({ provider: false });
  w.finding(F);
  const r = w.ct.caseRelation(F);
  assert.deepEqual([r.member, r.undetermined, r.pinned, r.prepared], [false, true, [], null]);
  assert.match(r.why, /publication provider/);
  const fact = w.promotion.fact("caseMember", F);
  assert.deepEqual([fact.ok, fact.reason], [false, "FACT_FAILED"]);
  assert.equal("value" in fact, false, "never read as false");
});

test("R1 R2 R4 R5 the seam: one publication provider, registered once with every door; a second is PROVIDER_DECLARED, one missing a door PROVIDER_MALFORMED", () => {
  const w = world({ provider: false });
  assert.deepEqual(w.ct.publicationProvider(), { registered: false, module: null });
  assert.deepEqual([...PUBLICATION_DOORS], ["pins", "preparations", "caseDocument", "members", "latestRatified",
                                            "signedDocumentsNaming", "reauthorSection"]);
  for (const door of PUBLICATION_DOORS) {
    const { [door]: _gone, ...rest } = w.pub.provider;
    assert.equal(w.ct.registerPublicationProvider("publication", rest).reason, "PROVIDER_MALFORMED", door);
  }
  assert.equal(w.ct.registerPublicationProvider(null).reason, "PROVIDER_MALFORMED");
  assert.deepEqual(w.ct.registerPublicationProvider(w.pub.provider), { ok: true, module: "publication" });
  assert.deepEqual(w.ct.publicationProvider(), { registered: true, module: "publication" });
  const again = w.ct.registerPublicationProvider("other", w.pub.provider);
  assert.deepEqual([again.ok, again.reason, again.module], [false, "PROVIDER_DECLARED", "publication"]);
  /* a door that throws answers as no rows, never a throw */
  const t = world();
  const pin = t.finding(F);
  t.pub.fail.add("pins").add("preparations");
  assert.deepEqual(t.ct.caseRelation(F), { member: false, pinned: [], prepared: null });
  assert.deepEqual(t.ct.flagCasesOnRevision(F, pin, NOW), []);
});

test("R2 a promotion replacing a pinned sha raises one flag per case edition, member and new sha, with the owning project and the instant, never twice", () => {
  const { w, proj, pin } = ratified();
  /* a second case edition pinning the same sha: one flag each */
  w.prepare("CASE-2026-0002", 1, { project: "PROJ-2", roles: [{ target: F, version_sha: pin }] });
  w.sign("CASE-2026-0002", 1);
  assert.equal(w.count("case_revision_flags"), 0);
  const first = w.finding(F, "revised once");
  const rows = w.rows(`SELECT * FROM case_revision_flags ORDER BY case_id`);
  assert.deepEqual(rows.map((r) => [r.case_id, r.edition, r.bundle_id, r.pinned_sha, r.revised_sha, r.project_id, r.acted_at]),
                   [["CASE-2026-0001", 1, F, pin, first, proj, null], ["CASE-2026-0002", 1, F, pin, first, "PROJ-2", null]]);
  for (const r of rows) assert.match(r.since, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  /* the same event again (the same pin, the same head) is the same row: never twice */
  assert.equal(w.ct.flagCasesOnRevision(F, pin, NOW).length, 2);
  assert.equal(w.count("case_revision_flags"), 2);
  /* a second revision moves from a sha no edition pins: nothing more is raised */
  w.finding(F, "revised twice");
  assert.equal(w.count("case_revision_flags"), 2);
  /* a pin whose hash did not move, no base, or no bundle raises nothing */
  const g = w.finding(G);
  w.prepare("CASE-2026-0003", 1, { project: proj, roles: [{ target: G, version_sha: g }] });
  w.sign("CASE-2026-0003", 1);
  assert.deepEqual(w.ct.flagCasesOnRevision(G, g, NOW), []);
  assert.deepEqual(w.ct.flagCasesOnRevision(G, null, NOW), []);
  assert.deepEqual(w.ct.flagCasesOnRevision("", g, NOW), []);
  assert.equal(w.count("case_revision_flags"), 2);
  /* an unsigned preparation pins nothing */
  const h = w.finding("INQ-2026-0003");
  w.prepare("CASE-2026-0004", 1, { project: proj, roles: [{ target: "INQ-2026-0003", version_sha: h }] });
  w.finding("INQ-2026-0003", "revised");
  assert.equal(w.count("case_revision_flags"), 2);
});

test("R2 a case older than DEC-72 owns no project, and its flag says so with null", () => {
  const { w, pin } = ratified();
  w.pub.owners.delete("CASE-2026-0001");
  w.finding(F, "revised");
  assert.deepEqual([w.row(`SELECT project_id FROM case_revision_flags`).project_id,
                    w.row(`SELECT pinned_sha FROM case_revision_flags`).pinned_sha], [null, pin]);
});

test("R2 dischargeCaseFlags discharges a case's outstanding flags, recording by whom and at which edition, and nothing wider", () => {
  const { w, pin } = ratified();
  w.finding(F, "revised");
  w.st.sql.exec(`INSERT INTO case_revision_flags (case_id, edition, bundle_id, pinned_sha, revised_sha, project_id, since)
                 VALUES ('CASE-2026-0009', 1, ?, ?, 'other', 'PROJ-X', ?)`, F, pin, NOW);
  assert.equal(w.ct.dischargeCaseFlags("CASE-2026-0001", 2, "olive", "2026-09-29T00:00:00Z"), 1);
  const mine = w.row(`SELECT * FROM case_revision_flags WHERE case_id='CASE-2026-0001'`);
  assert.deepEqual([mine.acted_at, mine.acted_by, mine.acted_edition], ["2026-09-29T00:00:00Z", "olive", 2]);
  assert.equal(w.row(`SELECT acted_at FROM case_revision_flags WHERE case_id='CASE-2026-0009'`).acted_at, null,
               "another case's flag is untouched");
  assert.equal(w.ct.dischargeCaseFlags("CASE-2026-0001", 3, "bo", "2026-09-30T00:00:00Z"), 0, "only outstanding rows");
  assert.equal(w.row(`SELECT acted_by FROM case_revision_flags WHERE case_id='CASE-2026-0001'`).acted_by, "olive");
  assert.equal(w.count("case_revision_flags"), 2, "discharged, never deleted");
  assert.equal(w.ct.dischargeCaseFlags("", 1, "olive", NOW), 0);
});

test("R3 caseFlags (op=caseflags) answers flags by instant, case, edition and member, limit clamped to [1, 500] and 500 by default, with truncated", () => {
  const w = world();
  const add = (c, e, b, since, acted = null, project = "PROJ-1") => w.st.sql.exec(
    `INSERT INTO case_revision_flags (case_id, edition, bundle_id, pinned_sha, revised_sha, project_id, since, acted_at, acted_by, acted_edition)
     VALUES (?,?,?,?,?,?,?,?,?,?)`, c, e, b, "p", `r-${c}-${e}-${b}`, project, since, acted, acted ? "olive" : null, acted ? e + 1 : null);
  add("CASE-B", 1, "X", "2026-09-02T00:00:00Z", null, null);
  add("CASE-A", 2, "Y", "2026-09-01T00:00:00Z");
  add("CASE-A", 1, "Z", "2026-09-01T00:00:00Z");
  add("CASE-A", 1, "W", "2026-09-01T00:00:00Z", "2026-09-03T00:00:00Z");
  const all = w.op("caseflags", {});
  assert.deepEqual(all.flags.map((f) => [f.case_id, f.edition, f.bundle_id]),
                   [["CASE-A", 1, "W"], ["CASE-A", 1, "Z"], ["CASE-A", 2, "Y"], ["CASE-B", 1, "X"]]);
  assert.deepEqual([all.ok, all.limit, all.truncated, all.count, all.outstanding], [true, CASE_FLAGS_LIMIT, false, 4, 3]);
  assert.equal(CASE_FLAGS_LIMIT, 500);
  assert.deepEqual(all.flags[0], { case_id: "CASE-A", edition: 1, bundle_id: "W", pinned_sha: "p", revised_sha: "r-CASE-A-1-W",
    project_id: "PROJ-1", since: "2026-09-01T00:00:00Z", outstanding: false, acted: { at: "2026-09-03T00:00:00Z", by: "olive", edition: 2 } });
  assert.equal(all.flags[1].acted, null);
  assert.equal(all.flags[3].project_id, null, "an unknown owner is stated null");
  assert.deepEqual(all.projects_owing, ["PROJ-1", null]);
  assert.match(all.doctrine, /SET AND NEVER CLEARED/);
  const one = w.op("caseflags", { limit: 1 });
  assert.deepEqual([one.flags.length, one.limit, one.truncated], [1, 1, true]);
  for (const [asked, got] of [[0, 500], [-3, 1], [9999, 500], ["x", 500], [2.7, 2], [0.5, 500], [null, 500]])
    assert.equal(w.ct.caseFlags({ limit: asked }).limit, got, `limit ${asked}`);
  const byCase = w.op("caseflags", { case: "CASE-A", outstanding: "1" });
  assert.deepEqual([byCase.caseId, byCase.flags.map((f) => f.bundle_id)], ["CASE-A", ["Z", "Y"]]);
  const byTarget = w.op("caseflags", { target: "X" });
  assert.deepEqual([byTarget.target, byTarget.flags.map((f) => f.case_id)], ["X", ["CASE-B"]]);
  /* not gated by viewer, and it writes nothing */
  const before = w.snapshot();
  w.op("caseflags", { viewer: "nobody" });
  assert.deepEqual(w.snapshot(), before);
  /* past the ceiling: 501 rows answer 500 and truncated */
  for (let i = 0; i < 501; i++) add("CASE-C", 1, `M${String(i).padStart(3, "0")}`, "2026-09-05T00:00:00Z");
  const big = w.ct.caseFlags({ caseId: "CASE-C", limit: 9999 });
  assert.deepEqual([big.count, big.limit, big.truncated], [500, 500, true]);
});

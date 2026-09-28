/* publication — MK-7 attribution: the act and its refusals (R17), the level in force at an edition (R39), and the
   reads the gates and the author use (R17). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, NOW, sha } from "./fixture.mjs";
import { ATTRIBUTION_ACT_CHECKS } from "../../../src/publication/checks.mjs";
import { ATTRIBUTION_LEVELS, ATTRIBUTION_PROSE_HEAD, attributionFrontmatterLines,
         attributionBodyLines } from "../../../src/publication/index.mjs";

const F = "INQ-2026-0001";
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" }));

/* ann's observation, which finding F rests on, prepared into CASE-2026-0001 edition 1 with an attribution run. */
function reached() {
  const w = world();
  w.member("olive"); w.member("ann"); w.member("bo");
  const proj = w.project("Parks", "olive");
  const obs = w.observe("ann");
  w.inquiry(F, { legs: [{ target: obs }] });
  const roles = [{ target: F, version_sha: w.head(F) }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, attributions: [{ observation: obs }] });
  return { w, proj, obs, roles };
}
const attribute = (w, o) => w.op("attribute", { by: o.by }, { caseId: "CASE-2026-0001", edition: 1, observation: o.obs, level: o.level, ...o.body });

test("R17 every refusal of the act, in order, carries its code, its check and its translation", () => {
  const { w, obs, proj, roles } = reached();
  const expect = (r, code) => {
    const row = ATTRIBUTION_ACT_CHECKS[code];
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], code);
  };
  expect(attribute(w, { obs, level: "group", by: "" }), "ATTRIBUTION_NOT_A_MEMBER");
  expect(attribute(w, { obs, level: "group", by: "class:ai" }), "ATTRIBUTION_NOT_A_MEMBER");
  expect(attribute(w, { obs, level: "", by: "ann" }), "ATTRIBUTION_NO_LEVEL");
  expect(attribute(w, { obs, level: "legal", by: "ann" }), "ATTRIBUTION_LEVEL_UNKNOWN");
  expect(attribute(w, { obs: F, level: "group", by: "ann" }), "ATTRIBUTION_NOT_AN_OBSERVATION");
  expect(attribute(w, { obs, level: "group", by: "bo" }), "ATTRIBUTION_NOT_THE_AUTHOR");
  expect(attribute(w, { obs, level: "group", by: "ann", body: { edition: 7 } }), "ATTRIBUTION_NOT_REACHED");
  expect(attribute(w, { obs, level: "group", by: "ann", body: { caseId: "CASE-NONE" } }), "ATTRIBUTION_NOT_REACHED");
  assert.deepEqual(Object.values(ATTRIBUTION_ACT_CHECKS).map((r) => r.check),
                   ["C-92.1", "C-92.2", "C-92.3", "C-92.4", "C-92.5", "C-92.6", "C-92.7", "C-92.8", "C-92.9"]);
  /* an author no longer active; a signed edition */
  w.st.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='ann'`);
  expect(attribute(w, { obs, level: "group", by: "ann" }), "ATTRIBUTION_AUTHOR_NOT_ACTIVE");
  w.st.sql.exec(`UPDATE members SET status='active' WHERE member_id='ann'`);
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) });
  expect(attribute(w, { obs, level: "group", by: "ann" }), "ATTRIBUTION_EDITION_RATIFIED");
});

test("R17 name with no handle is refused C-92.9, and every refusal writes nothing", () => {
  const { w, obs } = reached();
  w.st.sql.exec(`UPDATE members SET handle=NULL WHERE member_id='ann'`);
  const before = w.snapshot(["observation_attributions", "case_documents"]);
  const r = attribute(w, { obs, level: "name", by: "ann" });
  assert.deepEqual([r.reason, r.check], ["ATTRIBUTION_NAME_NO_HANDLE", "C-92.9"]);
  assert.deepEqual(w.snapshot(["observation_attributions", "case_documents"]), before);
});

test("R17 a choice is recorded per case, observation and edition, dated, and re-authors the unsigned document's attribution section", () => {
  const { w, obs } = reached();
  const held = w.row(`SELECT doc_sha, text FROM case_documents`);
  const r = attribute(w, { obs, level: "cover", by: "ann" });
  assert.deepEqual([r.ok, r.existed, r.level, r.shown, r.previous], [true, false, "cover", "Cover ann", null]);
  assert.deepEqual(w.rows(`SELECT case_id, edition, bundle_id, level, chosen_by FROM observation_attributions`),
                   [{ case_id: "CASE-2026-0001", edition: 1, bundle_id: obs, level: "cover", chosen_by: "ann" }]);
  assert.match(w.row(`SELECT chosen_at FROM observation_attributions`).chosen_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  const now = w.row(`SELECT doc_sha, text FROM case_documents`);
  assert.equal(r.case_document.reauthored, true);
  assert.equal(r.case_document.doc_sha, now.doc_sha);
  assert.notEqual(now.doc_sha, held.doc_sha, "its hash moves, so a signature over the old bytes is stale");
  assert.equal(now.doc_sha, sha(now.text));
  assert.ok(now.text.includes(attributionFrontmatterLines([{ observation: obs, level: "cover", shown: "Cover ann", chosen_at_edition: 1 }]).join("\n")));
  assert.ok(now.text.includes(ATTRIBUTION_PROSE_HEAD));
  /* the same choice again: existed, nothing new written */
  const same = attribute(w, { obs, level: "cover", by: "ann" });
  assert.equal(same.existed, true);
  assert.equal(w.count("observation_attributions"), 1);
  /* a new choice at the same edition replaces the level, and says what it was */
  const again = attribute(w, { obs, level: "group", by: "ann" });
  assert.deepEqual([again.shown, again.previous], ["test-group", { level: "cover", edition: 1 }]);
  assert.equal(w.row(`SELECT level FROM observation_attributions`).level, "group");
});

test("R17 the level in force is the latest choice at or before the edition, and each level publishes its own value, never the member id", () => {
  const { w, obs, proj, roles } = reached();
  attribute(w, { obs, level: "project", by: "ann" });
  const stmt = (ed) => w.p.attributionStatements("CASE-2026-0001", ed, proj, [obs])[0];
  assert.deepEqual([stmt(1).level, stmt(1).shown, stmt(1).chosen_at_edition], ["project", proj, 1]);
  assert.deepEqual([stmt(3).level, stmt(3).chosen_at_edition], ["project", 1], "a later edition inherits the prior choice");
  assert.deepEqual([stmt(1).level, stmt(1).shown], ["project", proj]);
  /* none chosen: unchosen, with why, never prefilled */
  const { w: w2, obs: o2, proj: p2 } = reached();
  const none = w2.p.attributionStatements("CASE-2026-0001", 1, p2, [o2])[0];
  assert.deepEqual([none.level, none.shown], [null, null]);
  assert.match(none.why, /chosen no level/);
  /* a level whose value cannot be produced is unchosen with its reason */
  attribute(w2, { obs: o2, level: "name", by: "ann" });
  w2.st.sql.exec(`UPDATE members SET handle=NULL WHERE member_id='ann'`);
  const lost = w2.p.attributionStatements("CASE-2026-0001", 1, p2, [o2])[0];
  assert.deepEqual([lost.level, lost.shown], [null, null]);
  assert.match(lost.why, /holds no handle/);
  /* with no observations named, those the edition's document reaches */
  assert.deepEqual(w.p.attributionStatements("CASE-2026-0001", 1, proj).map((s) => s.observation), [obs]);
  for (const level of ["group", "project", "cover", "name"]) {
    const { w: wl, obs: ol, proj: pl } = reached();
    attribute(wl, { obs: ol, level, by: "ann" });
    const s = wl.p.attributionStatements("CASE-2026-0001", 1, pl, [ol])[0];
    assert.equal(s.shown, { group: "test-group", project: pl, cover: "Cover ann", name: "h_ann" }[level]);
    assert.ok(!JSON.stringify(s).includes(`"${V("ann")}"`) && !JSON.stringify(s).includes('"ann"'), "the member id is never a value");
  }
  assert.deepEqual([...ATTRIBUTION_LEVELS], ["group", "project", "cover", "name"]);
});

test("R17 attributionFacts, attributionStatedFor and observationsNamingAuthor answer what the gates read, and the section has one spelling", () => {
  const { w, obs, proj, roles } = reached();
  attribute(w, { obs, level: "group", by: "ann" });
  const doc = w.row(`SELECT case_id, edition, text FROM case_documents`);
  const facts = w.p.attributionFacts(doc);
  assert.deepEqual(facts.reached, [obs]);
  assert.deepEqual(facts.legacy, [], "an observation MK-6 wrote names no author in its own files");
  assert.deepEqual(facts.stated, [{ observation: obs, level: "group", shown: "test-group" }]);
  assert.deepEqual(facts.current.map((c) => [c.observation, c.level, c.shown]), [[obs, "group", "test-group"]]);
  assert.equal(w.p.attributionStatedFor(obs), false, "no RATIFIED document states it yet");
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) });
  assert.equal(w.p.attributionStatedFor(obs), true);
  assert.equal(w.p.attributionStatedFor(""), false);
  /* a file that cannot be read is not in reference form: fenced */
  assert.deepEqual(w.p.observationsNamingAuthor([obs, F, "NOPE", 7]), [F, "NOPE"]);
  const rows = [{ observation: obs, level: null, why: "its author has chosen no level" }];
  assert.equal(attributionBodyLines(rows)[0], ATTRIBUTION_PROSE_HEAD);
  assert.match(attributionBodyLines(rows).join("\n"), /NO LEVEL IS CHOSEN/);
  assert.deepEqual(attributionFrontmatterLines([{ observation: obs, level: "name", shown: 'He said "x"', chosen_at_edition: 2 }]),
    ["observation_attributions:", `  - observation: ${obs}`, "    level: name", "    shown: \"He said 'x'\"", "    chosen_at_edition: 2"]);
});

test("R39 attributionInForce answers the level in force for an observation at a case edition, inherited from the latest earlier edition", () => {
  const { w, obs } = reached();
  assert.equal(w.p.attributionInForce("CASE-2026-0001", 1, obs), null, "none chosen: none, never prefilled");
  attribute(w, { obs, level: "cover", by: "ann" });
  const at1 = w.p.attributionInForce("CASE-2026-0001", 1, obs);
  assert.deepEqual([at1.level, at1.edition, at1.chosen_by], ["cover", 1, "ann"]);
  assert.deepEqual([w.p.attributionInForce("CASE-2026-0001", 4, obs).level, w.p.attributionInForce("CASE-2026-0001", 4, obs).edition],
                   ["cover", 1]);
  assert.equal(w.p.attributionInForce("CASE-2026-0002", 1, obs), null, "another case inherits nothing");
  w.st.sql.exec(`INSERT INTO observation_attributions (case_id, edition, bundle_id, level, chosen_by, chosen_at)
                 VALUES ('CASE-2026-0001', 3, ?, 'name', ?, ?)`, obs, "ann", NOW);
  assert.equal(w.p.attributionInForce("CASE-2026-0001", 2, obs).level, "cover");
  assert.equal(w.p.attributionInForce("CASE-2026-0001", 3, obs).level, "name");
});

/* people's members' ties, the protected source link and sight at its interface: R20, R21, R31. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, doc, ANN, OUT, BOSS, MACHINE } from "./fixture.mjs";
import { TIE_KINDS, ATTRIBUTION_LEVELS } from "../../../src/people/index.mjs";


test("R20 a member declares only their own tie (MTI-), to a registered entity, of kind employer, relative, business or other, with a note and the attribution level they choose; by is the stamp and no field names another member; a machine is refused; seen only by its member and administrators, any other viewer answered exactly as for no tie; tiesConcerning answers the member's ties to given entities with their levels", () => {
  const w = world();
  const co = w.entity("institution", "Harbour Co"), aunt = w.person("Pat Lee");
  const base = { entity: co, kind: "employer", note: "I worked there 2019", attribution: "cover", by: ANN };
  assert.equal(w.p.declareTie({ ...base, by: MACHINE }).reason, "MEMBER_ACT_ONLY");
  assert.equal(w.p.declareTie({ ...base, by: null }).reason, "MEMBER_ACT_ONLY");
  assert.equal(w.p.declareTie({ ...base, entity: "" }).reason, "NO_ENTITY");
  assert.equal(w.p.declareTie({ ...base, entity: "ENT-2026-9999" }).reason, "NO_SUCH_ENTITY");
  const k = w.p.declareTie({ ...base, kind: "friend" });
  assert.equal(k.reason, "UNKNOWN_TIE_KIND");
  for (const t of TIE_KINDS) assert.ok(k.detail.includes(t));
  assert.equal(w.p.declareTie({ ...base, note: " " }).reason, "NO_NOTE");
  assert.equal(w.p.declareTie({ ...base, attribution: "public" }).reason, "UNKNOWN_ATTRIBUTION");
  const t1 = w.p.declareTie({ ...base, member: "out" });
  assert.match(t1.tie_id, /^MTI-2026-\d{4,}$/);
  assert.equal(t1.member, "ann", "the stamp names the member; a field naming another is never read");
  const t2 = w.p.declareTie({ ...base, entity: aunt, kind: "relative", attribution: "group" });
  for (const level of ATTRIBUTION_LEVELS) assert.equal(w.p.declareTie({ ...base, attribution: level, kind: "other" }).ok, true);
  assert.equal(w.p.tiesOf({ member: "ann", viewer: ANN }).count, 6);
  assert.equal(w.p.tiesOf({ viewer: ANN }).count, 6, "a member's own ties by default");
  assert.equal(w.p.tiesOf({ member: "ann", viewer: BOSS }).count, 6, "an administrator sees them");
  assert.deepEqual(w.p.tiesOf({ member: "ann", viewer: OUT }), { ok: true, member: "ann", count: 0, ties: [] }, "exactly as for no tie");
  assert.deepEqual(w.p.tiesOf({ member: "nobody", viewer: OUT }), { ok: true, member: "nobody", count: 0, ties: [] });
  assert.deepEqual(w.p.tiesOf({ member: "ann", viewer: MACHINE }).ties, []);
  const tc = w.p.tiesConcerning({ entities: [aunt, "ENT-2026-0404"], member: "ann", viewer: ANN });
  assert.deepEqual(tc.ties.map((t) => [t.tie_id, t.attribution]), [[t2.tie_id, "group"]]);
  assert.deepEqual(w.p.tiesConcerning({ entities: [aunt], member: "ann", viewer: OUT }).ties, []);
  assert.equal(w.p.withdrawTie({ tieId: t2.tie_id, reason: "not mine", by: OUT }).reason, "NO_SUCH_TIE", "another's tie answers as absent");
  assert.equal(w.p.withdrawTie({ tieId: t2.tie_id, reason: "", by: ANN }).reason, "NO_REASON");
  assert.equal(w.p.withdrawTie({ tieId: t2.tie_id, reason: "she moved away", by: ANN }).ok, true);
  assert.equal(w.p.withdrawTie({ tieId: t2.tie_id, reason: "x", by: ANN }).already, true);
  assert.deepEqual(w.p.tiesConcerning({ entities: [aunt], member: "ann", viewer: ANN }).ties, []);
  assert.ok(w.p.tiesOf({ member: "ann", viewer: ANN }).ties.find((t) => t.tie_id === t2.tie_id).withdrawn, "kept, shown withdrawn");
});

test("R21 a source is linked to a registered person with evidence and a non-empty sight list (NO_SIGHT_LIST); only the listed members read it; every other viewer, every other read and the export answer exactly as if no link were held; being a source is never stated by personAt or any other person read", () => {
  const w = world();
  const p = w.person("Quinn Roe");
  w.S.add("SRC-2026-1234abcd");
  const base = { source: "SRC-2026-1234abcd", person: p, evidence: "the same handwriting", sight: ["member:ann"], by: ANN };
  assert.equal(w.p.linkSourceToPerson({ ...base, source: "SRC-2026-none" }).reason, "NO_SUCH_SOURCE");
  assert.equal(w.p.linkSourceToPerson({ ...base, person: w.entity("office", "Clerk") }).reason, "NOT_A_PERSON");
  assert.equal(w.p.linkSourceToPerson({ ...base, evidence: "" }).reason, "NO_EVIDENCE");
  assert.equal(w.p.linkSourceToPerson({ ...base, sight: [] }).reason, "NO_SIGHT_LIST");
  assert.equal(w.p.linkSourceToPerson({ ...base, sight: null }).reason, "NO_SIGHT_LIST");
  assert.equal(w.p.linkSourceToPerson({ ...base, by: MACHINE }).reason, "MEMBER_ACT_ONLY");
  assert.equal(w.p.linkSourceToPerson(base).ok, true);
  assert.equal(w.p.sourceLinksOf({ person: p, viewer: ANN }).count, 1);
  assert.equal(w.p.sourceLinksOf({ source: "SRC-2026-1234abcd", viewer: ANN }).links[0].person, p);
  for (const v of [OUT, BOSS, MACHINE, null]) {
    assert.deepEqual(w.p.sourceLinksOf({ person: p, viewer: v }), { ok: true, count: 0, links: [] }, String(v));
    assert.deepEqual(w.p.sourceLinksOf({ source: "SRC-2026-1234abcd", viewer: v }), { ok: true, count: 0, links: [] });
  }
  assert.equal(w.record.declaredTables().find((d) => d.name === "source_person_links").export, "never");
  const reads = JSON.stringify([w.p.personAt({ entityId: p, at: "2020-01-01", viewer: ANN }), w.p.careerOf({ entityId: p, viewer: ANN }),
    w.p.identityOf({ entityId: p, viewer: ANN }), w.p.interestsOf({ entityId: p, viewer: ANN }), w.p.credentialsOf({ entityId: p, viewer: ANN }),
    w.p.statementsOf({ entityId: p, viewer: ANN }), w.p.samePersonCandidates({ entityId: p, viewer: ANN })]);
  assert.ok(!reads.includes("SRC-2026-1234abcd") && !/\bsource_link|is a source|as a source\b/i.test(reads), "no person read states it, even to a listed member");
});

test("R31 sight: the registry is group-wide; a fact follows its document's visibility; identity claims, testimony and check results inside a project the viewer may not see are not answered and not counted; ties and the source link take their own narrowest sight; every withheld item answers exactly as an absent one", () => {
  const w = world();
  const p = w.person("Ray Sun"), q = w.person("Ray Sun");
  const open = w.capture("open"), fenced = w.capture("fenced", { fenced: true });
  const valid = { from: "2000-01-01", to: "2030-01-01", precision: "day", zone: "UTC" };
  w.p.recordPersonFact({ person: p, kind: "locality", value: "Open Town", valid, citation: doc(open), by: ANN });
  w.p.recordPersonFact({ person: p, kind: "locality", value: "Hidden Town", valid, citation: doc(fenced), by: ANN });
  w.p.claimIdentity({ a: p, b: q, kind: "same_as", basis: "testimony", note: "n", by: ANN, project: w.project() });
  const ann = w.p.personAt({ entityId: p, at: "2020-01-01", viewer: ANN }), out = w.p.personAt({ entityId: p, at: "2020-01-01", viewer: OUT });
  assert.deepEqual(ann.facts.map((f) => f.value).sort(), ["Hidden Town", "Open Town"]);
  assert.deepEqual(out.facts.map((f) => f.value), ["Open Town"]);
  assert.deepEqual(ann.cluster.members, [p, q].sort());
  assert.deepEqual(out.cluster.members, [p], "the fenced claim is neither shown nor counted");
  /* an outsider's answer for a person with only fenced claims equals that for a person with none */
  const lone = w.person("Ray Sun");
  const strip = (r) => JSON.stringify({ ...r, entity_id: null, members: r.members.length, links: r.links.length });
  assert.equal(strip(w.p.identityOf({ entityId: q, viewer: OUT })), strip(w.p.identityOf({ entityId: lone, viewer: OUT })));
  /* the registry is group-wide: every member reads the person and its names */
  assert.deepEqual(out.names.map((n) => n.name), ["Ray Sun"]);
  /* reads fail closed with no viewer */
  for (const r of [w.p.personAt({ entityId: p, at: "2020-01-01" }), w.p.careerOf({ entityId: p }), w.p.identityOf({ entityId: p })])
    assert.equal(r.ok, false);
});

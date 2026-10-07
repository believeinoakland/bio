/* standards: T35's policies and standards held (R1, R2, R9, R12, R14 amended; R33–R43, R45–R47; T35-31, N643, N659,
   N664, N698; K1713, K1722–K1724, K1739, K1740, K1902 (1); DEC-145, DEC-149, DEC-164). Driven at the module's interface
   over the test profile (`test-port-ellery`: the Harbour Standing Orders, Board Rules, the ferry company's code and the
   Harbour Safety Institute's standards carry series). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, BYLAW, REASON, sha } from "./fixture.mjs";
import { STANDARDS_CHECKS, STANDARD_KINDS, STANDARDS_TABLES, COPY_STATES, ACCESS_STATES, HELD_STATES, FORCES, POLICY_FORCES,
         familyKey, standardsOps, IN_FORCE_STATES } from "../../../src/standards/index.mjs";
import { STANDARD_SOURCE_KINDS } from "../../../../jurisdictions/index.mjs";
import { LAW_RELATIONS_CHECKS } from "../../../src/law-relations/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/labels.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");
const HSO = "HSO 4/21 para 3", MHS = "MHS 101-2020 edition";
/* a policy of the Harbour Master, declared by bob over fresh passages */
const policy = (w, extra = {}) => w.declare({ cite: HSO, kind: "policy", issuer: "Harbour Master", ...extra });
const refusalRow = (r, code) => {
  assert.equal(codeOf(r), code, JSON.stringify(r).slice(0, 300));
  const row = STANDARDS_CHECKS[code] ?? LAW_RELATIONS_CHECKS[code];
  assert.deepEqual([r.check, r.translation], [row.check, row.translation], code);
};

test("R1 R12 the kinds are jurisdictions' seven STANDARD_SOURCE_KINDS (standard included), the same list and never a copy; STANDARD_KIND_UNKNOWN names the seven", () => {
  assert.equal(STANDARD_KINDS, STANDARD_SOURCE_KINDS, "the very list");
  assert.ok(STANDARD_KINDS.includes("standard"));
  const w = seeded();
  const r = w.declare({ kind: "guideline" });
  refusalRow(r, "STANDARD_KIND_UNKNOWN");
  assert.deepEqual(r.kinds, [...STANDARD_SOURCE_KINDS]);
  assert.match(STANDARDS_CHECKS.STANDARD_KIND_UNKNOWN.translation, /standards body, a profession, a regulator or an accreditor/);
  assert.equal(w.declare({ cite: MHS, kind: "standard", issuer: "Marlow Harbour Safety Institute" }).ok, true);
});

test("R1 R2 R34 held is text (the default), cited or absent: STANDARD_NO_TEXT and STANDARD_TEXT_UNRESOLVED apply only to text; a cited or absent declaration naming text is refused STANDARD_TEXT_NOT_HELD_AS; cited needs cited_by (STANDARD_CITED_BY_MISSING), absent needs search (STANDARD_SEARCH_MISSING); each writes nothing", () => {
  const w = seeded();
  const citing = w.passage("ordinance", { page: 0 });
  assert.deepEqual(HELD_STATES, ["text", "cited", "absent"]);
  const before = w.snapshot();
  refusalRow(w.declare({ held: "cited", text: [citing.contentId], cited_by: { captureSha: citing.capSha, extent: { kind: "pdf-page", page: 0 } } }),
             "STANDARD_TEXT_NOT_HELD_AS");
  refusalRow(w.declare({ held: "cited", text: [] }), "STANDARD_CITED_BY_MISSING");
  refusalRow(w.declare({ held: "cited", text: [], cited_by: { captureSha: citing.capSha, extent: { kind: "pdf-page", page: 9 } } }), "STANDARD_CITED_BY_MISSING");
  refusalRow(w.declare({ held: "absent", text: [] }), "STANDARD_SEARCH_MISSING");
  for (const search of [{ places: [] }, { places: ["x".repeat(501)] }, { places: [7] }, { places: ["Portal"], request: 7 }, { places: ["Portal"], extra: 1 }])
    refusalRow(w.declare({ held: "absent", text: [], search }), "STANDARD_SEARCH_MISSING");
  assert.equal(codeOf(w.declare({ held: "hidden", text: [] })), "STANDARD_FIELD_INVALID");
  refusalRow(w.declare({ text: [] }), "STANDARD_NO_TEXT");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const cited = w.declare({ held: "cited", text: [], cited_by: { captureSha: citing.capSha, extent: { kind: "pdf-page", page: 0 } } });
  assert.equal(cited.ok, true, JSON.stringify(cited).slice(0, 300));
  assert.deepEqual([cited.held, cited.text, cited.cited_by.content_id], ["cited", [], citing.contentId]);
  const absent = w.declare({ held: "absent", text: null, search: { places: ["the city's policy portal", { captureSha: citing.capSha, extent: { kind: "pdf-page", page: 0 } }],
                                                                  request: "PRR-2026-14" } });
  assert.equal(absent.ok, true, JSON.stringify(absent).slice(0, 300));
  assert.deepEqual([absent.held, absent.search.places[0], absent.search.request], ["absent", "the city's policy portal", "PRR-2026-14"]);
});

test("R34 isMeasure is true only for a standard held text the viewer may read; inForce and inForceAt answer a cited or absent entry undetermined (\"its text is not held, so it is not a measure\"), never in_force; a cited entry is read like any standard and superseded by one holding its text", () => {
  const w = seeded();
  const c = w.passage();
  const held = w.declare().id;
  const cited = w.declare({ held: "cited", text: [], cited_by: { captureSha: c.capSha, extent: { kind: "pdf-page", page: 0 } } }).id;
  const absent = w.declare({ held: "absent", text: [], search: { places: ["the clerk's office"] } }).id;
  assert.equal(w.s.isMeasure(held, V("carol")), true);
  assert.equal(w.s.isMeasure(held, "nobody"), false, "a viewer that may not read it");
  for (const id of [cited, absent]) {
    assert.equal(w.s.isMeasure(id, V("carol")), false, id);
    const f = w.s.inForceAt({ standard: id, date: "2025-01-01" });
    assert.deepEqual([f.state, f.why], ["undetermined", "its text is not held, so it is not a measure"]);
    assert.equal(w.s.inForce(id, "2025-01-01").state, "undetermined");
    assert.equal(w.s.standardRead({ id, viewer: V("carol") }).ok, true, "read like any standard");
  }
  assert.equal(w.s.isMeasure("STD-2026-9999-x"), false);
  const found = w.declare({ supersedes: cited });
  assert.equal(found.ok, true);
  assert.equal(w.s.standardRead({ id: cited, viewer: V("carol") }).superseded_by, found.id);
});

test("R9 a proposal with no text may be adopted held cited, naming who cited it and where; it is then never a measure until a standard holding its text supersedes it", () => {
  const w = seeded();
  const c = w.passage();
  const p = w.s.standardPropose({ cite: BYLAW, kind: "ordinance", issuer: "Port Ellery Selectboard", why: "Cited in the permit.", proposer: MACHINE }).proposal;
  assert.equal(codeOf(w.s.standardAdopt({ proposal: p.id, author: V("bob"), reason: REASON })), "STANDARD_NO_TEXT");
  const a = w.s.standardAdopt({ proposal: p.id, author: V("bob"), viewer: V("bob"), reason: REASON, held: "cited",
                                cited_by: { captureSha: c.capSha, extent: { kind: "pdf-page", page: 0 } } });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.deepEqual([a.held, a.proposal, w.s.isMeasure(a.id)], ["cited", p.id, false]);
});

test("R33 family: read from the cite's series (id-spaces.recogniseSeries over the active view), a declared one kept with the difference stated, an unknown key/series pair refused FAMILY_UNKNOWN, none undetermined with why; familyKey is pure; standardsIn filters by it; every read answers family and owner", () => {
  const w = seeded();
  const r = policy(w);
  assert.deepEqual([r.family.state, r.family.key, r.family.series, r.family.number, r.family.family_key],
                   ["matched", "harbour-master", "hso", "HSO-4/21", "harbour-master/hso"]);
  assert.equal(familyKey({ key: "harbour-master", series: "hso", number: "x" }), "harbour-master/hso");
  assert.equal(familyKey({ key: "", series: "hso" }), null);
  assert.equal(familyKey(null), null);
  const d = policy(w, { family: { key: "harbour-master", series: "hso", number: "HSO-9/99" } });
  assert.deepEqual([d.family.state, d.family.number], ["declared", "HSO-9/99"]);
  assert.match(d.family.differs.says, /recorded as declared/);
  refusalRow(policy(w, { family: { key: "harbour-master", series: "nope", number: "1" } }), "FAMILY_UNKNOWN");
  assert.equal(codeOf(policy(w, { family: { key: "x" } })), "STANDARD_FIELD_INVALID");
  const none = w.declare();
  assert.equal(none.family.state, "undetermined");
  assert.equal(typeof none.family.why, "string");
  const other = w.declare({ cite: "Board Rule A12", kind: "policy", issuer: "Marlow Schools Board" });
  assert.equal(other.family.family_key, "marlow-schools/rule");
  const list = w.s.standardsIn({ viewer: V("carol"), family: "harbour-master/hso" });
  assert.deepEqual(list.items.map((x) => x.id), [r.id, d.id]);
  assert.deepEqual(w.s.standardsIn({ viewer: V("carol"), family: { key: "marlow-schools", series: "rule" } }).items.map((x) => x.id), [other.id]);
  const read = w.s.standardRead({ id: r.id, viewer: V("carol") });
  assert.deepEqual([read.family.family_key, read.owner.label], ["harbour-master/hso", "Harbour Master"]);
});

test("R35 forceDeclare records the force of one provision by a member, citing its own words: refusals in order (machine, NO_SUCH_STANDARD, FORCE_TEXT_NOT_HELD, PORTION_UNKNOWN, FORCE_UNKNOWN naming the kind's list, FORCE_NO_HOLDER, FORCE_NO_CRITERIA, FORCE_NO_CITATION, STANDARD_PORTION_NOT_IN_TEXT, then STANDARD_NO_REASON); at most one confirmed force a provision (FORCE_ALREADY_CONFIRMED), withdrawn with a reason before a new one; a discretionary force with criteria \"none\" reads \"no criteria stated\"", () => {
  const w = seeded();
  const words = "The Harbour Master may waive the fee at their discretion.";
  const t = w.passage("hso", { text: words });
  const holder = w.entity("Harbour Master");
  const p = policy(w, { text: [t.contentId], portion: { path: "3", content_id: t.contentId } }).id;
  const cited = policy(w, { held: "cited", text: [], cited_by: { captureSha: t.capSha, extent: { kind: "pdf-page", page: 0 } } }).id;
  const good = { standard: p, portion: "3", force: "discretionary", holder, criteria: "none", citation: t.contentId, reason: REASON,
                 author: V("bob"), viewer: V("bob") };
  const stranger = w.passage().contentId;
  const before = w.snapshot();
  refusalRow(w.s.forceDeclare({ ...good, author: MACHINE }), "MACHINE_CANNOT_DECLARE_STANDARD");
  assert.equal(codeOf(w.s.forceDeclare({ ...good, standard: "STD-2026-9999-x" })), "NO_SUCH_STANDARD");
  refusalRow(w.s.forceDeclare({ ...good, standard: cited }), "FORCE_TEXT_NOT_HELD");
  assert.equal(codeOf(w.s.forceDeclare({ ...good, portion: "4" })), "PORTION_UNKNOWN");
  const fu = w.s.forceDeclare({ ...good, force: "forbids" });
  refusalRow(fu, "FORCE_UNKNOWN");
  assert.deepEqual(fu.forces, [...FORCES, ...POLICY_FORCES]);
  refusalRow(w.s.forceDeclare({ ...good, holder: null }), "FORCE_NO_HOLDER");
  refusalRow(w.s.forceDeclare({ ...good, holder: "ENT-2026-9999" }), "FORCE_NO_HOLDER");
  refusalRow(w.s.forceDeclare({ ...good, criteria: null }), "FORCE_NO_CRITERIA");
  refusalRow(w.s.forceDeclare({ ...good, citation: "" }), "FORCE_NO_CITATION");
  assert.equal(codeOf(w.s.forceDeclare({ ...good, citation: stranger })), "STANDARD_PORTION_NOT_IN_TEXT");
  assert.equal(codeOf(w.s.forceDeclare({ ...good, reason: " " })), "STANDARD_NO_REASON");
  assert.equal(codeOf(w.s.forceDeclare({ ...good, merit: 1 })), "STANDARD_FIELD_UNKNOWN");
  assert.deepEqual(w.snapshot(), before, "a refused force writes nothing");
  /* a non-policy's provision takes only requires, recommends, allows */
  const ord = w.declare({ text: [t.contentId] }).id;
  assert.deepEqual(w.s.forceDeclare({ ...good, standard: ord, force: "mandatory", portion: "12" }).forces, [...FORCES]);
  const f = w.s.forceDeclare(good);
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.deepEqual([f.force.force, f.force.holder, f.force.criteria, f.force.citation, f.force.by], ["discretionary", holder, "none", t.contentId, V("bob")]);
  assert.deepEqual(f.force.says, { force: "At the discretion of Harbour Master", beside: words, criteria: "no criteria stated" });
  const again = w.s.forceDeclare({ ...good, force: "mandatory" });
  refusalRow(again, "FORCE_ALREADY_CONFIRMED");
  assert.equal(again.force_id, f.force.id);
  refusalRow(w.s.forceWithdraw({ force: "force-0", reason: "x", author: V("bob") }), "NO_SUCH_FORCE");
  assert.equal(codeOf(w.s.forceWithdraw({ force: f.force.id, reason: "", author: V("bob") })), "STANDARD_NO_REASON");
  const wd = w.s.forceWithdraw({ force: f.force.id, reason: "The clause was misread.", author: V("carol") });
  assert.deepEqual([wd.ok, wd.withdrawn.by], [true, V("carol")]);
  assert.equal(w.s.forceWithdraw({ force: f.force.id, reason: "again", author: V("bob") }).already, true);
  const m = w.s.forceDeclare({ ...good, force: "mandatory" });
  assert.equal(m.ok, true);
  assert.deepEqual(m.force.says, { force: "Required", beside: words });
  const of = w.s.forcesOf({ standard: p, viewer: V("carol") });
  assert.deepEqual([of.forces.map((x) => x.force), of.withdrawn.map((x) => x.force)], [["mandatory"], ["discretionary"]]);
  assert.equal(of.says.owner, "Harbour Master policy");
  for (const [force, word] of [["requires", "Requires"], ["recommends", "Recommends"], ["allows", "Allows"]]) {
    const x = w.declare({ cite: `PEBL § ${force.length}`, text: [t.contentId] }).id;
    assert.equal(w.s.forceDeclare({ ...good, standard: x, portion: "12", force, holder: undefined, criteria: undefined }).force.says.force, word);
  }
  /* criteria named: "criteria stated" */
  const crit = policy(w, { text: [t.contentId] }).id;
  assert.equal(w.s.forceDeclare({ ...good, standard: crit, criteria: t.contentId }).force.says.criteria, "criteria stated");
});

test("R35 R9 a machine's force label is only a proposal, stored apart, labelled through proposalLabel(proposer, \"standard\"), moving nothing until a member confirms it (forceConfirm, refused as forceDeclare is)", () => {
  const w = seeded();
  const t = w.passage("hso", { text: "Every vessel shall report." });
  const p = policy(w, { text: [t.contentId] }).id;
  const prop = w.s.forcePropose({ standard: p, portion: "3", force: "mandatory", citation: t.contentId, why: "Reads 'shall'.", proposer: MACHINE });
  assert.equal(prop.ok, true, JSON.stringify(prop).slice(0, 300));
  const label = proposalLabel(MACHINE, "standard");
  assert.deepEqual([prop.proposal.state, prop.proposal.machine_work, prop.proposal.by, prop.force], [label.state, true, label.by, false]);
  assert.equal(w.count("standard_forces"), 0, "no force written");
  assert.deepEqual(w.s.forcesOf({ standard: p, viewer: V("carol") }).forces, []);
  assert.equal(w.s.forcesOf({ standard: p, viewer: V("carol") }).proposals.length, 1, "its proposals apart");
  assert.equal(codeOf(w.s.forceConfirm({ proposal: prop.proposal.id, reason: REASON, author: MACHINE })), "MACHINE_CANNOT_DECLARE_STANDARD");
  assert.equal(codeOf(w.s.forceConfirm({ proposal: "fprop-0", reason: REASON, author: V("bob") })), "STANDARD_NO_SUCH_PROPOSAL");
  assert.equal(codeOf(w.s.forceConfirm({ proposal: prop.proposal.id, reason: "", author: V("bob") })), "STANDARD_NO_REASON");
  const c = w.s.forceConfirm({ proposal: prop.proposal.id, reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.deepEqual([c.ok, c.force.force, c.force.proposal], [true, "mandatory", prop.proposal.id]);
  assert.equal(codeOf(w.s.forceConfirm({ proposal: prop.proposal.id, reason: REASON, author: V("bob") })), "STANDARD_PROPOSAL_ADOPTED");
  assert.equal(codeOf(w.s.forcePropose({ standard: p, portion: "3", force: "x", citation: t.contentId, why: "w", proposer: MACHINE })), "FORCE_UNKNOWN");
  assert.equal(codeOf(w.s.forcePropose({ standard: p, portion: "3", force: "mandatory", citation: t.contentId, why: "", proposer: MACHINE })), "STANDARD_WHY_INVALID");
});

test("R36 copy is one of eight (COPY_UNKNOWN otherwise), R19's default from the source still applying; copy_claimed {says, extent} is held apart, its extent among the text (COPY_CLAIM_NOT_CITED), and a difference stated, never resolved", () => {
  const w = seeded();
  const t = w.passage().contentId, banner = w.passage().contentId;
  assert.deepEqual(COPY_STATES, ["official", "codifier", "in_force", "draft", "superseded", "production", "vendor_model", "undetermined"]);
  for (const copy of COPY_STATES) assert.equal(w.declare({ text: [t], copy }).copy.copy, copy, copy);
  refusalRow(w.declare({ copy: "photocopy" }), "COPY_UNKNOWN");
  refusalRow(w.declare({ text: [t, banner], copy_claimed: { says: "leaked", extent: banner } }), "COPY_UNKNOWN");
  refusalRow(w.declare({ text: [t], copy_claimed: { says: "draft", extent: banner } }), "COPY_CLAIM_NOT_CITED");
  refusalRow(w.declare({ text: [t], copy_claimed: { says: "draft" } }), "COPY_CLAIM_NOT_CITED");
  const r = w.declare({ text: [t, banner], copy: "production", copy_claimed: { says: "draft", extent: banner } });
  assert.deepEqual([r.copy.copy, r.copy.claimed], ["production", { says: "draft", extent: banner }]);
  assert.match(r.copy.claim_differs, /says it is draft; it is recorded as production, and neither is resolved/);
  assert.equal(w.declare({ text: [t, banner], copy: "draft", copy_claimed: { says: "draft", extent: banner } }).copy.claim_differs, undefined);
  assert.equal(w.declare({ text: [t] }).copy.copy, "official", "R19's default from the source");
});

test("R37 R14 a policy whose text is filed in a hidden project is held at that bundle's sight: every read answers it only to who may see it, to anyone else exactly as absent and counted nowhere; releaseStandard by an owner of that project (RELEASE_NOT_OWNER, NO_SUCH_STANDARD, STANDARD_NO_REASON, NOT_HELD_FROM_SOURCE) opens it to the group from then on, never undone; other kinds keep group sight", () => {
  const w = seeded();
  const P = w.project("Source material", "alice");
  const hidden = w.passage("leaked", { text: "Staff shall not discuss the waiver." });
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, P, hidden.contentId);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, hidden.bundleId);
  const r = policy(w, { text: [hidden.contentId], portion: { path: "3", content_id: hidden.contentId }, author: V("alice"), viewer: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.sight.class, r.not_public.release_by, r.says.public], ["bundle", [{ project: P, owners: ["alice"] }], "Not public"]);
  assert.deepEqual(r.says.release_by, [{ project: P, owners: ["alice"] }]);
  /* an outsider: absent, everywhere */
  const absent = w.s.standardRead({ id: "STD-2026-9999-policy", viewer: V("carol") });
  const strip = (x) => ({ ...x, id: null, standard: null });
  assert.deepEqual(strip(w.s.standardRead({ id: r.id, viewer: V("carol") })), strip(absent));
  assert.equal(w.s.standardsIn({ viewer: V("carol") }).count, 0, "counted nowhere");
  assert.equal(codeOf(w.s.inForceAt({ standard: r.id, date: "2025-01-01", viewer: V("carol") })), "NO_SUCH_STANDARD");
  assert.equal(w.s.inForceAt({ key: r.instrument.key, date: "2025-01-01", viewer: V("carol") }).standard, null);
  assert.deepEqual(w.s.standardsAt({ key: r.instrument.key, viewer: V("carol") }).items, []);
  assert.deepEqual(w.s.standardsWithPortion({ contentId: hidden.contentId, viewer: V("carol") }).items, []);
  assert.equal(codeOf(w.s.forcesOf({ standard: r.id, viewer: V("carol") })), "NO_SUCH_STANDARD");
  assert.equal(codeOf(w.s.bindsAt({ standard: r.id, body: "x", date: "2025-01-01", viewer: V("carol") })), "NO_SUCH_STANDARD");
  assert.equal(codeOf(w.s.overridesOf({ standard: r.id, viewer: V("carol") })), "NO_SUCH_STANDARD");
  assert.equal(w.s.isMeasure(r.id, V("carol")), false);
  /* who may see the source sees it */
  assert.equal(w.s.standardRead({ id: r.id, viewer: V("alice") }).ok, true);
  assert.equal(w.s.standardsIn({ viewer: V("alice") }).count, 1);
  /* the release */
  refusalRow(w.s.releaseStandard({ standard: r.id, reason: "Public now.", author: V("bob"), viewer: V("alice") }), "RELEASE_NOT_OWNER");
  assert.equal(codeOf(w.s.releaseStandard({ standard: r.id, reason: "Public now.", author: V("carol") })), "NO_SUCH_STANDARD");
  assert.equal(codeOf(w.s.releaseStandard({ standard: r.id, reason: "", author: V("alice") })), "STANDARD_NO_REASON");
  assert.equal(codeOf(w.s.releaseStandard({ standard: r.id, reason: "x", author: MACHINE })), "MACHINE_CANNOT_DECLARE_STANDARD");
  const rel = w.s.releaseStandard({ standard: r.id, reason: "The source agreed.", author: V("alice") });
  assert.deepEqual([rel.ok, rel.released.by], [true, V("alice")]);
  const after = w.s.standardRead({ id: r.id, viewer: V("carol") });
  assert.deepEqual([after.ok, after.sight.class, after.not_public, after.says.public], [true, "group", undefined, undefined]);
  assert.equal(w.s.standardsIn({ viewer: V("carol") }).count, 1);
  refusalRow(w.s.releaseStandard({ standard: r.id, reason: "again", author: V("alice") }), "NOT_HELD_FROM_SOURCE");
  /* another kind with the same text keeps group sight */
  const ord = w.declare({ text: [hidden.contentId], author: V("alice"), viewer: V("alice") });
  assert.equal(ord.sight.class, "group");
  refusalRow(w.s.releaseStandard({ standard: ord.id, reason: "x", author: V("alice") }), "NOT_HELD_FROM_SOURCE");
  assert.deepEqual(STANDARDS_TABLES.find((t) => t.name === "standard_releases").sight, "group");
});

test("R38 version_basis: two held captures of one address whose texts differ, naming the version superseded (VERSION_BASIS_INVALID otherwise): the period starts in the band between them, undetermined inside it, never an enactment date", () => {
  const w = seeded();
  const v1 = w.passage("p-v1", { address: "https://ex.org/policy", retrieved: "2025-01-10T12:00:00Z" });
  const v2 = w.passage("p-v2", { address: "https://ex.org/policy", retrieved: "2025-03-20T12:00:00Z" });
  const elsewhere = w.passage("p-x", { address: "https://ex.org/other", retrieved: "2025-02-01T12:00:00Z" });
  const old = policy(w, { text: [v1.contentId], period: { from: "2020-01-01", to: null } }).id;
  refusalRow(policy(w, { text: [v2.contentId], version_basis: { captures: [v1.capSha, v2.capSha] } }), "VERSION_BASIS_INVALID");
  for (const captures of [[v1.capSha], [v1.capSha, v1.capSha], [v1.capSha, elsewhere.capSha], [v2.capSha, v1.capSha], ["x", "y"]])
    refusalRow(policy(w, { text: [v2.contentId], supersedes: old, version_basis: { captures } }), "VERSION_BASIS_INVALID");
  const neu = policy(w, { text: [v2.contentId], supersedes: old, period: { from: null, to: null },
                          version_basis: { captures: [v1.capSha, v2.capSha] } });
  assert.equal(neu.ok, true, JSON.stringify(neu).slice(0, 300));
  assert.deepEqual([neu.version_basis.address, neu.version_basis.after, neu.version_basis.through],
                   ["ex.org/policy", "2025-01-10T12:00:00Z", "2025-03-20T12:00:00Z"]);
  const at = (date) => w.s.inForceAt({ standard: neu.id, date });
  assert.equal(at("2025-01-01").state, "not_in_force");
  assert.equal(at("2025-02-15").state, "undetermined");
  assert.match(at("2025-02-15").why, /changed between the captures of 2025-01-10 and 2025-03-20/);
  assert.equal(at("2025-03-20").state, "undetermined", "no end stated");
});

test("R7 R38 overrides: a portion of this standard displaces a held standard's portion until an event or its own next revision; R20 answers \"overridden\" naming the overriding standard, undetermined where the until event has no when; overridesOf answers both directions; force_source names a kind and its passage (FORCE_SOURCE_INVALID); OVERRIDE_INVALID names the field", () => {
  const w = seeded();
  const t = w.passage().contentId, o = w.passage().contentId;
  const base = w.declare({ text: [t], portion: { path: "12(a)", content_id: t }, period: { from: "2010-01-01", to: "2040-12-31" } }).id;
  const ends = w.event({ value: "2026-01-01" }), nowhen = w.event();
  for (const [overrides, field] of [[[], "list"], [[{ target: base }], "until"], [[{ target: base, portion: "12(a)", until: "soon" }], "until"],
                                    [[{ target: base, portion: "12(a)", until: ends, x: 1 }], "form"]]) {
    const r = policy(w, { text: [o], overrides });
    if (field === "until" && !overrides[0].portion) { assert.equal(codeOf(r), "PORTION_UNKNOWN"); continue; }
    refusalRow(r, "OVERRIDE_INVALID");
    assert.equal(r.field, field);
  }
  assert.equal(codeOf(policy(w, { text: [o], overrides: [{ target: "STD-2026-9999-x", portion: "1", until: ends }] })), "NO_SUCH_STANDARD");
  assert.equal(codeOf(policy(w, { text: [o], overrides: [{ target: base, portion: "9", until: ends }] })), "PORTION_UNKNOWN");
  const ov = policy(w, { text: [o], portion: { path: "3", content_id: o }, period: { from: "2024-01-01", to: "2040-12-31" },
                         overrides: [{ target: base, portion: "12(a)", until: ends }],
                         force_source: { kind: "court_order", citation: o } });
  assert.equal(ov.ok, true, JSON.stringify(ov).slice(0, 300));
  assert.deepEqual(ov.force_source, { kind: "court_order", citation: o });
  const f = w.s.inForceAt({ standard: base, date: "2025-06-01" });
  assert.deepEqual([f.state, f.overridden_by], ["overridden", { standard: ov.id, portion: "3" }]);
  /* R7 (K1973): the alias answers exactly the same state, overridden included, one of the four IN_FORCE_STATES */
  assert.deepEqual([w.s.inForce(base, "2025-06-01").state, IN_FORCE_STATES.includes("overridden")], ["overridden", true]);
  assert.equal(w.s.inForceAt({ standard: base, date: "2026-01-02" }).state, "in_force", "after the until event");
  assert.equal(w.s.inForceAt({ standard: base, date: "2023-06-01" }).state, "in_force", "before the overriding policy");
  assert.deepEqual(w.s.overridesOf({ standard: base, viewer: V("carol") }).overridden_by.map((x) => x.by), [ov.id]);
  assert.deepEqual(w.s.overridesOf({ standard: ov.id, viewer: V("carol") }).makes, [{ target: base, portion: "12(a)", until: { event: ends } }]);
  /* an until event with no when: undetermined, never in force */
  const base2 = w.declare({ cite: "PEBL § 50", text: [t], portion: { path: "50", content_id: t }, period: { from: "2010-01-01", to: "2040-12-31" } }).id;
  policy(w, { text: [o], period: { from: "2024-01-01", to: "2040-12-31" }, overrides: [{ target: base2, portion: "50", until: nowhen }] });
  const u = w.s.inForceAt({ standard: base2, date: "2025-06-01" });
  assert.equal(u.state, "undetermined");
  assert.match(u.why, /no when the record can read/);
  for (const force_source of [{ kind: "edict", citation: o }, { kind: "contract", citation: t }, { kind: "contract" }])
    refusalRow(policy(w, { text: [o], force_source }), "FORCE_SOURCE_INVALID");
});

test("R39 designation and edition are read from the cite (recogniseSeries' number and edition), a declared one kept with the difference stated, an edition never defaulted; issuer may be a registered entity (NO_SUCH_ENTITY otherwise), read back with its label and sector", () => {
  const w = seeded();
  const r = w.declare({ cite: MHS, kind: "standard", issuer: "Marlow Harbour Safety Institute" });
  assert.deepEqual([r.designation, r.edition, r.edition_read.read], ["MHSI Standard 101", "2020", "2020"]);
  const noEd = w.declare({ cite: "MHS 101", kind: "standard", issuer: "Marlow Harbour Safety Institute" });
  assert.equal(noEd.edition, null, "never defaulted");
  assert.match(noEd.edition_read.why, /none is assumed/);
  const d = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", edition: "2018", designation: "MHS 101" });
  assert.deepEqual([d.edition, d.designation], ["2018", "MHS 101"]);
  assert.match(d.edition_read.says, /recorded as declared; the citation reads 2020/);
  assert.deepEqual([w.declare({ edition: "x".repeat(51) }).field, w.declare({ designation: "" }).field], ["edition", "designation"]);
  const ent = w.entity("Ellery Ferries Ltd", { sector: "company" });
  const c = w.declare({ cite: "EF Rule 3.2", kind: "policy", issuer: ent });
  assert.deepEqual([c.owner.entity, c.owner.label, c.owner.sector, c.says.owner], [ent, "Ellery Ferries Ltd", "company", "Ellery Ferries Ltd policy"]);
  assert.equal(codeOf(w.declare({ issuer: "ENT-2026-9999" })), "NO_SUCH_ENTITY");
});

test("R40 adoptionRecord records a body's adoption of an edition by a member's act (MACHINE_CANNOT_RELATE, NO_SUCH_STANDARD naming the end, ADOPTION_MODE_UNKNOWN, ADOPTION_NO_EDITION, ADOPTION_NO_CITATION, STANDARD_NO_REASON, in order, each writing nothing); editionInForce answers the edition the body's adoptions put in force on a date, with the adoption and its lag, undetermined where none or two decide it", () => {
  const w = seeded();
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
  const std2 = w.declare({ cite: "MHS 101-2023 edition", kind: "standard", issuer: "MHSI", period: { from: "2023-01-01", to: null } }).id;
  const at = w.passage().contentId;
  const ord = w.declare({ text: [at], issuer: "Port Ellery Selectboard" }).id;
  const good = { standard: std, act: ord, edition: "2020", from: "2021-07-01", mode: "by_reference", citation: at, reason: REASON,
                 author: V("bob"), viewer: V("bob") };
  const stranger = w.passage().contentId;
  const before = w.snapshot();
  refusalRow(w.s.adoptionRecord({ ...good, author: MACHINE }), "MACHINE_CANNOT_RELATE");
  assert.equal(w.s.adoptionRecord({ ...good, standard: "STD-2026-9999-x" }).end, "standard");
  assert.equal(w.s.adoptionRecord({ ...good, act: "STD-2026-9999-x" }).end, "act");
  refusalRow(w.s.adoptionRecord({ ...good, mode: "by_osmosis" }), "ADOPTION_MODE_UNKNOWN");
  refusalRow(w.s.adoptionRecord({ ...good, edition: "" }), "ADOPTION_NO_EDITION");
  refusalRow(w.s.adoptionRecord({ ...good, citation: stranger }), "ADOPTION_NO_CITATION");
  assert.equal(codeOf(w.s.adoptionRecord({ ...good, reason: "" })), "STANDARD_NO_REASON");
  assert.equal(codeOf(w.s.adoptionRecord({ ...good, from: "July 2021" })), "STANDARD_FIELD_INVALID");
  assert.deepEqual(w.snapshot(), before);
  const a = w.s.adoptionRecord(good);
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.deepEqual([a.adoption.body, a.adoption.edition, a.adoption.mode], ["Port Ellery Selectboard", "2020", "by_reference"]);
  const body = "Port Ellery Selectboard";
  const e = w.s.editionInForce({ standard: std, body, date: "2022-01-01" });
  assert.deepEqual([e.state, e.edition, e.adoption.id, e.lag.days], ["in_force", "2020", a.adoption.id, 547]);
  assert.equal(w.s.editionInForce({ standard: std, body, date: "2021-01-01" }).state, "undetermined", "before any adoption");
  assert.equal(w.s.adoptionRecord({ ...good, standard: std2, edition: "2023", from: "2024-03-01" }).ok, true);
  const later = w.s.editionInForce({ designation: "MHSI Standard 101", body, date: "2025-01-01" });
  assert.deepEqual([later.state, later.edition], ["in_force", "2023"], "across the adoptions of one designation");
  assert.equal(w.s.editionInForce({ designation: "MHSI Standard 101", body, date: "2023-01-01" }).edition, "2020");
  /* two adoptions on one day, differing: undetermined naming them */
  assert.equal(w.s.adoptionRecord({ ...good, edition: "2019", from: "2024-03-01" }).ok, true);
  const two = w.s.editionInForce({ designation: "MHSI Standard 101", body, date: "2025-01-01" });
  assert.equal(two.state, "undetermined");
  assert.equal(two.adoptions.length, 2);
  /* an event start with no when */
  const nowhen = w.event();
  w.s.adoptionRecord({ ...good, standard: std2, edition: "2023", from: { event: nowhen, edge: "start" }, citation: at });
  assert.equal(w.s.editionInForce({ standard: std2, body, date: "2025-01-01" }).state, "undetermined");
});

test("R41 access is free, reading_room or paywalled (ACCESS_UNKNOWN), a standard kind with none reading undetermined; a reading-room or paywalled standard takes text only from a capture a member made (TEXT_NOT_MEMBER_CAPTURED), and no read answers its words to a caller that is not a member viewer", () => {
  const w = seeded();
  const own = w.passage("bought", { text: "Section 4: inspect the hull yearly." }), machine = w.passage("crawled");
  w.actors[own.capSha] = [V("bob")];
  w.actors[machine.capSha] = [MACHINE];
  assert.deepEqual(ACCESS_STATES, ["free", "reading_room", "paywalled"]);
  refusalRow(w.declare({ access: "members_only" }), "ACCESS_UNKNOWN");
  refusalRow(w.declare({ cite: MHS, kind: "standard", access: "paywalled", text: [machine.contentId] }), "TEXT_NOT_MEMBER_CAPTURED");
  refusalRow(w.declare({ cite: MHS, kind: "standard", access: "paywalled", text: [w.passage().contentId] }), "TEXT_NOT_MEMBER_CAPTURED");
  assert.equal(w.declare({ cite: MHS, kind: "standard", access: "free", text: [machine.contentId] }).ok, true, "free text from any capture");
  const pay = w.declare({ cite: MHS, kind: "standard", access: "paywalled", text: [own.contentId], requires: [own.contentId] });
  assert.equal(pay.ok, true, JSON.stringify(pay).slice(0, 300));
  assert.deepEqual([pay.access, pay.says.access], ["paywalled", "Behind a paywall"]);
  assert.equal(w.s.standardRead({ id: pay.id, viewer: V("carol") }).requires_quoted[0].text, "Section 4: inspect the hull yearly.");
  const m = w.s.standardRead({ id: pay.id, viewer: MACHINE });
  assert.deepEqual([m.requires_quoted[0].text, typeof m.text_withheld], [null, "string"], "a machine viewer reads no words");
  assert.equal(w.declare({ cite: MHS, kind: "standard" }).access, "undetermined");
  assert.equal(w.declare({ access: "reading_room", text: [own.contentId] }).says.access, "Reading room only");
  assert.equal(w.declare({ access: "free" }).says.access, "Free to read");
  assert.equal(w.declare().access, null, "not a standard kind: none stated");
});

test("R42 a commitment, policy or standard may carry a target {metric, threshold, period, definition}: comparator at_least, at_most or within, an exact decimal value read by calc-grammar, the unit as the text states it, a period or a stated recurrence, a definition passage or \"none\"; TARGET_INVALID names the field; nothing is computed", () => {
  const w = seeded();
  const t = w.passage().contentId, def = w.passage().contentId;
  const good = { metric: { words: "response time", content_id: t }, threshold: { comparator: "at_most", value: "48", unit: "hours" },
                 period: { from: "2025-01-01", to: "2025-12-31" }, definition: def };
  const c = w.declare({ cite: "MCBC 2024-7", kind: "commitment", issuer: "Marlow County Commission", text: [t], target: good });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.deepEqual(c.target.threshold, { comparator: "at_most", value: "48", unit: "hours", as_read: "48" });
  assert.equal(c.target.met, undefined, "never computed here");
  const none = w.declare({ cite: "MCBC 2024-8", kind: "commitment", text: [t], target: { ...good, definition: "none", period: { recurrence: "each quarter", content_id: t } } });
  assert.deepEqual([none.target.definition, none.target.definition_says, none.target.period.recurrence], ["none", "no definition stated", "each quarter"]);
  for (const [target, field, kind] of [[good, "kind", "ordinance"], [{ ...good, metric: { words: "x" } }, "metric"],
         [{ ...good, threshold: { ...good.threshold, comparator: "about" } }, "threshold"], [{ ...good, threshold: { ...good.threshold, value: "about 48" } }, "threshold"],
         [{ ...good, threshold: { ...good.threshold, value: "40-50" } }, "threshold"], [{ ...good, threshold: { ...good.threshold, unit: "" } }, "threshold"],
         [{ ...good, period: "2025" }, "period"], [{ ...good, definition: null }, "definition"], [{ ...good, extra: 1 }, "form"]]) {
    const r = w.declare({ cite: "MCBC 2024-9", kind: kind ?? "commitment", text: [t], target });
    refusalRow(r, "TARGET_INVALID");
    assert.equal(r.field, field, JSON.stringify(target).slice(0, 80));
  }
});

test("R43 bindsAt: binds when the body issued it, adopted it, an incorporating standard binding it, or an imposition puts it in force on the date; otherwise a policy, standard or commitment is a labelled benchmark and a law undetermined, never benchmark by default; impositionRecord and benchmarkDeclare are a member's acts; a declaration never makes a standard bind", () => {
  const w = seeded();
  const body = w.entity("Port Ellery Selectboard"), other = w.entity("Marlow Schools Board");
  const lawText = w.passage().contentId;
  const own = w.declare({ issuer: body, period: { from: "2020-01-01", to: "2040-12-31" } }).id;
  const pol = w.declare({ cite: "Board Rule A12", kind: "policy", issuer: other, period: { from: "2020-01-01", to: null } }).id;
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
  const statute = w.declare({ cite: "Some Code § 4", kind: "statute", issuer: "State", period: { from: "2020-01-01", to: "2040-12-31" } }).id;
  const law = w.declare({ cite: "PEBL § 70", text: [lawText], issuer: "State", period: { from: "2022-01-01", to: "2040-01-01" } }).id;
  const b = (standard, date = "2025-01-01") => w.s.bindsAt({ standard, body, date, viewer: V("carol") });
  assert.deepEqual([b(own).state, b(own).says.binding], ["binds", "Standard · binds Port Ellery Selectboard"]);
  assert.equal(b(own, "2019-01-01").state, "undetermined", "an ordinance not yet in force: a law is never a benchmark by default");
  const bench = b(pol);
  assert.deepEqual([bench.state, bench.says.binding], ["benchmark", "Benchmark · not binding on Port Ellery Selectboard"]);
  assert.deepEqual([b(statute).state, b(statute).why], ["undetermined", "whether this law binds the body is not recorded"]);
  /* a member's declaration of a benchmark never makes it bind */
  assert.equal(codeOf(w.s.benchmarkDeclare({ standard: pol, body, reason: "", author: V("bob") })), "STANDARD_NO_REASON");
  assert.equal(codeOf(w.s.benchmarkDeclare({ standard: pol, body, reason: REASON, author: MACHINE })), "MACHINE_CANNOT_DECLARE_STANDARD");
  assert.equal(w.s.benchmarkDeclare({ standard: pol, body, reason: "We compare against it.", author: V("bob") }).ok, true);
  assert.equal(b(pol).state, "benchmark");
  /* an adoption binds from its start */
  const at = w.passage().contentId;
  const act = w.declare({ cite: "PEBL § 80", text: [at], issuer: body }).id;
  assert.equal(w.s.adoptionRecord({ standard: std, act, edition: "2020", from: "2024-01-01", mode: "by_reference", citation: at, reason: REASON,
                                   author: V("bob") }).ok, true);
  assert.equal(w.s.bindsAt({ standard: std, body: body, date: "2023-06-01" }).state, "benchmark");
  /* the adopting body is the act's issuer (an entity id here) */
  assert.equal(w.s.bindsAt({ standard: std, body, date: "2024-06-01" }).state, "binds");
  /* an imposition by a held law binds from the law's own in-force date */
  for (const [args, code] of [[{ author: MACHINE }, "MACHINE_CANNOT_RELATE"], [{ standard: "STD-2026-9999-x" }, "NO_SUCH_STANDARD"],
                              [{ law: "STD-2026-9999-x" }, "NO_SUCH_STANDARD"], [{ body: "ENT-2026-9999" }, "NO_SUCH_ENTITY"],
                              [{ citation: w.passage().contentId }, "LAW_RELATION_NO_CITATION"], [{ reason: "" }, "STANDARD_NO_REASON"]])
    assert.equal(codeOf(w.s.impositionRecord({ standard: statute, body, law, citation: lawText, reason: REASON, author: V("bob"), viewer: V("bob"), ...args })), code, code);
  assert.equal(w.s.impositionRecord({ standard: statute, body, law, citation: lawText, reason: REASON, author: V("bob") }).ok, true);
  assert.deepEqual(["2021-06-01", "2023-06-01"].map((date) => b(statute, date).state), ["undetermined", "binds"]);
  assert.ok(b(statute, "2023-06-01").rests_on.some((x) => x.law === law), "names what it rests on");
  /* never throws; refusals */
  assert.equal(codeOf(w.s.bindsAt({ standard: "", body, date: "2025-01-01" })), "STANDARD_NO_ID");
  assert.equal(codeOf(w.s.bindsAt({ standard: own, body, date: "x" })), "STANDARD_DATE_INVALID");
  for (const a of [undefined, null, { standard: 7 }]) assert.doesNotThrow(() => w.s.bindsAt(a ?? undefined));
});

test("R45 every read carries says, the members' words of DEC-145 composed from the record: force words beside the provision's own words, binding or benchmark, \"Cited, not seen\" with who and where, \"Looked for, not found\" with the searches, \"Not public\" with whose to release, access, and a policy with its owner; no served sentence calls the text a practice, and none says confidential", () => {
  const w = seeded();
  const c = w.passage();
  const cited = w.declare({ held: "cited", text: [], cited_by: { captureSha: c.capSha, extent: { kind: "pdf-page", page: 0 } } });
  assert.equal(cited.says.held, "Cited, not seen");
  assert.equal(cited.says.cited_by.content_id, c.contentId);
  const absent = w.declare({ held: "absent", text: [], search: { places: ["the clerk"] } });
  assert.deepEqual([absent.says.held, absent.says.searched.places], ["Looked for, not found", ["the clerk"]]);
  assert.equal(policy(w).says.owner, "Harbour Master policy");
  assert.equal(w.declare().says.owner, undefined, "an ordinance carries no policy owner phrase");
  const listed = w.s.standardsIn({ viewer: V("carol") }).items;
  assert.ok(listed.every((x) => x.says && typeof x.says === "object"), "R8 items carry says");
  assert.ok(w.s.standardsAt({ key: "/eli/xx-port-ellery/selectboard/12", viewer: V("carol") }).items.every((x) => x.says), "R32 items carry says");
  const all = JSON.stringify([listed, Object.values(STANDARDS_CHECKS).map((r) => r.translation)]);
  assert.ok(!/practice/i.test(all), "never a practice");
  assert.ok(!/confidential/i.test(all), "never confidential");
});

test("R46 where no active profile is held or the profiles cannot be combined, R3's why names your group's Civicsmith, never the instance", () => {
  const none = seeded({ profiles: null }).declare();
  assert.equal(none.source.why, "your group's Civicsmith has no active jurisdiction profile, so no source of standards is known");
  const bad = seeded({ profiles: ["no-such-profile"] }).declare();
  assert.equal(bad.source.why, "the active jurisdiction profiles of your group's Civicsmith could not be combined (UNKNOWN_PROFILE), so no source of standards is known");
  assert.ok(![none.source.why, bad.source.why].some((s) => /instance/.test(s)));
});

test("R47 R2 a found extent ({capture_sha, extent}, a find's match) is taken as text exactly as its content id (STANDARD_TEXT_UNRESOLVED when content holds no row, nothing minted); the optional question is an inquiry the author may see (QUESTION_NOT_HELD otherwise, an unseen one alike), kept beside the standard through supersession, answered only to a viewer who may see it", () => {
  const w = seeded();
  const p = w.passage("found", { text: "Fees are set yearly." });
  const match = { kind: "standard", words: "Fees are set yearly.", capture_sha: p.capSha, extent: { kind: "pdf-page", page: 0 } };
  const r = w.declare({ text: [match] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.text, [p.contentId], "the same content id as named directly");
  const rows = w.count("content");
  refusalRow(w.declare({ text: [{ ...match, extent: { kind: "pdf-page", page: 2 } }] }), "STANDARD_TEXT_UNRESOLVED");
  assert.equal(w.count("content"), rows, "nothing minted");
  /* the question */
  const q = w.inquiry();
  const P = w.project("Private", "alice");
  const hidden = w.inquiry(P);
  refusalRow(w.declare({ question: "INQ-2026-9999" }), "QUESTION_NOT_HELD");
  refusalRow(w.declare({ question: hidden }), "QUESTION_NOT_HELD");
  refusalRow(w.declare({ question: p.bundleId }), "QUESTION_NOT_HELD");
  const withQ = w.declare({ question: q });
  assert.equal(withQ.question, q);
  assert.equal(w.s.standardRead({ id: withQ.id, viewer: V("carol") }).question, q);
  const alices = w.declare({ question: hidden, author: V("alice"), viewer: V("alice") });
  assert.equal(alices.ok, true);
  assert.equal(w.s.standardRead({ id: alices.id, viewer: V("carol") }).question, null, "withheld from who may not see it");
  assert.equal(w.s.standardRead({ id: alices.id, viewer: V("alice") }).question, hidden);
  assert.equal(w.declare().question, null);
  const next = w.declare({ supersedes: withQ.id });
  assert.equal(w.s.standardRead({ id: withQ.id, viewer: V("carol") }).question, q, "unchanged by a supersession");
  assert.equal(next.question, null);
});

test("R14 R16 the T35 tables (forces, their withdrawals and proposals, overrides, releases, adoptions, impositions, benchmarks) exist once constructed, are declared explicitly like the others (version_chain, group sight) and are append-only", () => {
  const w = seeded();
  const declared = w.record.declaredTables().filter((d) => d.module === "standards").map((d) => d.name);
  for (const t of ["standard_forces", "standard_force_withdrawals", "standard_force_proposals", "standard_overrides", "standard_releases",
                   "standard_body_adoptions", "standard_impositions", "standard_benchmarks"]) {
    assert.ok(declared.includes(t), t);
    const d = STANDARDS_TABLES.find((x) => x.name === t);
    assert.deepEqual([d.version_chain, d.sight], [true, "group"]);
  }
  const t = w.passage("x", { text: "Shall." });
  const p = policy(w, { text: [t.contentId] }).id;
  const f = w.s.forceDeclare({ standard: p, portion: "3", force: "mandatory", citation: t.contentId, reason: REASON, author: V("bob") });
  const snap = w.rows(`SELECT * FROM standard_forces`);
  w.s.forceWithdraw({ force: f.force.id, reason: "misread", author: V("bob") });
  assert.deepEqual(w.rows(`SELECT * FROM standard_forces`), snap, "the force row stays as written");
});

test("R35 R37 R38 R40 R43 the ops map holds the T35 acts and reads, stamps from the URL", () => {
  const w = seeded();
  const t = w.passage("x", { text: "Shall." });
  const p = policy(w, { text: [t.contentId] }).id;
  const url = (q) => new URL(`https://plane.test/?viewer=${encodeURIComponent(V("bob"))}&${q}`);
  const ops = (q, body = {}) => standardsOps(w.s, url(q), body);
  assert.equal(ops("", { standard: p, portion: "3", force: "mandatory", citation: t.contentId, reason: REASON, author: V("bob") }).standardforce().ok, true);
  assert.equal(ops(`id=${p}`).forcesof().forces.length, 1);
  assert.equal(ops(`id=${p}`).overridesof().ok, true);
  assert.equal(ops(`id=${p}&body=x&date=2025-01-01`).bindsat().state, "benchmark");
  assert.equal(ops(`id=${p}&body=x&date=2025-01-01`).editioninforce().state, "undetermined");
  assert.equal(ops("", { standard: p, reason: "x", author: V("bob") }).standardrelease().reason, "NOT_HELD_FROM_SOURCE");
  assert.equal(ops("", { standard: p, act: p, edition: "1", from: "2020-01-01", mode: "x", citation: t.contentId, reason: REASON, author: V("bob") }).standardadoption().reason,
               "ADOPTION_MODE_UNKNOWN");
  assert.deepEqual(IN_FORCE_STATES, ["in_force", "not_in_force", "undetermined", "overridden"]);
  assert.equal(sha("x").length, 64);
});

test("R48 the law services are law-relations' LawRecords, delegated: LAW_RELATIONS, COURT_LINKS, TREATMENTS, CONNECTION_KINDS, CONNECTION_OWNER and IN_FORCE_METHOD are re-exported as the same objects, each law service answers what that module answers, the ops are kept, and law.mjs is gone", async () => {
  const S = await import("../../../src/standards/index.mjs");
  const L = await import("../../../src/law-relations/index.mjs");
  for (const n of ["LAW_RELATIONS", "COURT_LINKS", "TREATMENTS", "CONNECTION_KINDS", "CONNECTION_OWNER", "IN_FORCE_METHOD"])
    assert.equal(S[n], L[n], n);
  const { existsSync } = await import("node:fs");
  assert.equal(existsSync(new URL("../../../src/standards/law.mjs", import.meta.url)), false);
  const w = seeded();
  const at = w.passage().contentId, bt = w.passage().contentId;
  const a = w.declare({ cite: "PEBL § 10", text: [at] }).id, b = w.declare({ cite: "PEBL § 20", text: [bt] }).id;
  const r = w.s.lawRelate({ type: "incorporates", from: a, to: b, citation: at, edition: "2020", reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(w.s.lawRelationsOf({ standard: b, viewer: V("carol") }).referential[0].type, "incorporates");
  assert.equal(codeOf(w.s.lawRelate({ type: "x", from: a, to: b, citation: at, reason: REASON, author: V("bob") })), "LAW_RELATION_UNKNOWN");
  assert.deepEqual(Object.keys(standardsOps(w.s, new URL("https://p.test/"), {})).filter((k) => /^(law|court|stillstanding|citationresolve)/.test(k)).sort(),
                   ["citationresolve", "courtlink", "courttreat", "lawaddresses", "lawpropose", "lawrelate", "lawrelations", "lawwithdraw", "stillstanding"]);
  /* R43 reads the adopted incorporates relation: a standard incorporated by one that binds the body binds it */
  const body = w.entity("Port Ellery Selectboard");
  const own = w.declare({ cite: "PEBL § 30", text: [bt], issuer: body, period: { from: "2020-01-01", to: "2040-12-31" } }).id;
  const inc = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: "2040-12-31" } }).id;
  assert.equal(w.s.bindsAt({ standard: inc, body, date: "2025-01-01" }).state, "benchmark");
  assert.equal(w.s.lawRelate({ type: "incorporates", from: own, to: inc, citation: bt, edition: "2020", reason: REASON, author: V("bob") }).ok, true);
  const bound = w.s.bindsAt({ standard: inc, body, date: "2025-01-01" });
  assert.equal(bound.state, "binds");
  assert.ok(bound.rests_on.some((x) => x.incorporated_by === own));
});

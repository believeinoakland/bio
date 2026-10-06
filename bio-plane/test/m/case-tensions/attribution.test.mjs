/* case-tensions — MK-7 attribution: the act and its refusals (R5, with DEC-88's reason, C-92.13), the reads the gates
   and the author use (R5), the level in force at an edition (R6), and a capture's attribution (R7). Driven at the
   module's interface; the unsigned case document is held by publication's provider stand-in and re-authored through
   its splice. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, NOW, sha, storage } from "./fixture.mjs";
import { ATTRIBUTION_ACT_CHECKS, ATTRIBUTION_REASON_MAX, migrateCaseTensions } from "../../../src/case-tensions/index.mjs";
import { ATTRIBUTION_LEVELS, ATTRIBUTION_PROSE_HEAD, attributionFrontmatterLines, unnamedSourceStatement }
  from "../../../src/case-grammar/index.mjs";

const F = "INQ-2026-0001", CASE = "CASE-2026-0001";
const REASON = "I would rather the group speak for these words.";

/* ann's observation, which finding F reaches, prepared into CASE edition 1 with an attribution run. */
function reached({ provider = true } = {}) {
  const w = world({ provider });
  w.member("olive"); w.member("ann"); w.member("bo");
  const proj = w.project("PROJ-1", ["olive"]);
  const obs = w.observe("ann");
  const pin = w.finding(F);
  w.reach.set(F, { self: [obs], via: [] });
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }], attributions: [{ observation: obs }] });
  return { w, proj, obs };
}
const attribute = (w, o) => w.op("attribute", { by: o.by }, { caseId: CASE, edition: 1, observation: o.obs,
                                                             level: o.level, reason: REASON, ...o.body });
const expect = (r, code) => {
  const row = ATTRIBUTION_ACT_CHECKS[code];
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], code);
};
const docOf = (w, ed = 1) => w.pub.get(CASE, ed);

test("R5 every refusal of the act, in order, carries its code, its check and its translation, and writes nothing", () => {
  const { w, obs } = reached();
  const before = () => [w.snapshot(["observation_attributions", "capture_attributions"]), docOf(w).doc_sha];
  const held = before();
  expect(attribute(w, { obs, level: "group", by: "" }), "ATTRIBUTION_NOT_A_MEMBER");
  expect(attribute(w, { obs, level: "group", by: "class:ai" }), "ATTRIBUTION_NOT_A_MEMBER");
  expect(attribute(w, { obs, level: "", by: "ann" }), "ATTRIBUTION_NO_LEVEL");
  expect(attribute(w, { obs, level: "group", by: "ann", body: { reason: " " } }), "ATTRIBUTION_NO_REASON");
  expect(attribute(w, { obs, level: "legal", by: "ann" }), "ATTRIBUTION_LEVEL_UNKNOWN");
  expect(attribute(w, { obs: F, level: "group", by: "ann" }), "ATTRIBUTION_NOT_AN_OBSERVATION");
  expect(attribute(w, { obs, level: "group", by: "bo" }), "ATTRIBUTION_NOT_THE_AUTHOR");
  expect(attribute(w, { obs, level: "group", by: "ann", body: { edition: 7 } }), "ATTRIBUTION_NOT_REACHED");
  expect(attribute(w, { obs, level: "group", by: "ann", body: { caseId: "CASE-NONE" } }), "ATTRIBUTION_NOT_REACHED");
  w.reach.set(F, { self: [], via: [] });
  expect(attribute(w, { obs, level: "group", by: "ann" }), "ATTRIBUTION_NOT_REACHED");
  w.reach.set(F, { self: [], via: [{ observation: obs, through: "INQ-X" }] });
  w.st.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='ann'`);
  expect(attribute(w, { obs, level: "group", by: "ann" }), "ATTRIBUTION_AUTHOR_NOT_ACTIVE");
  w.st.sql.exec(`UPDATE members SET status='active', handle=NULL WHERE member_id='ann'`);
  expect(attribute(w, { obs, level: "name", by: "ann" }), "ATTRIBUTION_NAME_NO_HANDLE");
  assert.deepEqual(before(), held, "every refusal writes nothing");
  w.sign(CASE, 1, { roster: [] });
  expect(attribute(w, { obs, level: "group", by: "ann" }), "ATTRIBUTION_EDITION_RATIFIED");
  assert.deepEqual(Object.values(ATTRIBUTION_ACT_CHECKS).map((r) => r.check),
                   ["C-92.1", "C-92.2", "C-92.3", "C-92.4", "C-92.5", "C-92.6", "C-92.7", "C-92.8", "C-92.9", "C-92.13"]);
  /* with no publication provider no edition can be read: refused before anything is written */
  const { w: bare, obs: o2 } = reached({ provider: false });
  expect(attribute(bare, { obs: o2, level: "group", by: "ann" }), "ATTRIBUTION_NOT_REACHED");
  assert.equal(bare.count("observation_attributions"), 0);
});

test("R5 C-92.13: a reason absent, not a string, blank or over 2,000 code points is refused ATTRIBUTION_NO_REASON with nothing written, asked after the level is given and before it is judged", () => {
  const { w, obs } = reached();
  const row = ATTRIBUTION_ACT_CHECKS.ATTRIBUTION_NO_REASON;
  assert.deepEqual([row.check, row.translation], ["C-92.13", "Choosing how a published case shows who said your observation "
    + "records why, in your own words, and no reason was given, or it is longer than 2,000 characters. Write one. Nothing was written."]);
  assert.equal(ATTRIBUTION_REASON_MAX, 2000);
  const held = docOf(w).doc_sha;
  for (const [label, reason] of [["absent", undefined], ["null", null], ["a number", 7], ["an object", { why: "x" }],
                                 ["blank", ""], ["only whitespace", " \t\n "], ["2,001 characters", "r".repeat(2001)],
                                 ["2,001 code points", "\u{1F600}".repeat(2001)]]) {
    expect(attribute(w, { obs, level: "group", by: "ann", body: { reason } }), "ATTRIBUTION_NO_REASON");
    assert.equal(w.count("observation_attributions"), 0, `${label}: nothing written`);
    assert.equal(docOf(w).doc_sha, held, `${label}: the unsigned document is unchanged`);
  }
  assert.equal(attribute(w, { obs, level: "", by: "ann", body: { reason: undefined } }).reason, "ATTRIBUTION_NO_LEVEL");
  assert.equal(attribute(w, { obs, level: "legal", by: "ann", body: { reason: undefined } }).reason, "ATTRIBUTION_NO_REASON");
  assert.equal(attribute(w, { obs, level: "group", by: "class:ai", body: { reason: undefined } }).reason, "ATTRIBUTION_NOT_A_MEMBER");
  /* negative control: exactly 2,000 code points is accepted and read back with the choice */
  const words = "\u{1F600}".repeat(2000);
  const ok = attribute(w, { obs, level: "group", by: "ann", body: { reason: words } });
  assert.deepEqual([ok.ok, ok.level, ok.reason], [true, "group", words]);
  assert.deepEqual(w.rows(`SELECT level, reason FROM observation_attributions`), [{ level: "group", reason: words }]);
  assert.notEqual(docOf(w).doc_sha, held, "the accepted choice re-authors the document");
});

test("R5 a choice is recorded per case, observation and edition, dated, with its reason, and re-authors the unsigned document's attribution section through publication's splice", () => {
  const { w, obs } = reached();
  const held = { ...docOf(w) };
  const r = attribute(w, { obs, level: "cover", by: "ann", body: { reason: "first words" } });
  assert.deepEqual([r.ok, r.existed, r.observation, r.caseId, r.edition, r.level, r.shown, r.reason, r.previous],
                   [true, false, obs, CASE, 1, "cover", "Cover ann", "first words", null]);
  assert.deepEqual(w.rows(`SELECT case_id, edition, bundle_id, level, chosen_by, reason FROM observation_attributions`),
                   [{ case_id: CASE, edition: 1, bundle_id: obs, level: "cover", chosen_by: "ann", reason: "first words" }]);
  assert.match(w.row(`SELECT chosen_at FROM observation_attributions`).chosen_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  const now = docOf(w);
  assert.deepEqual([r.case_document.reauthored, r.case_document.doc_sha], [true, now.doc_sha]);
  assert.notEqual(now.doc_sha, held.doc_sha, "its hash moves, so a signature over the old bytes is stale");
  assert.ok(now.text.includes(attributionFrontmatterLines([{ observation: obs, level: "cover", shown: "Cover ann", chosen_at_edition: 1 }]).join("\n")));
  assert.ok(now.text.includes(ATTRIBUTION_PROSE_HEAD));
  const splice = w.pub.calls.filter((c) => c[0] === "reauthorSection").pop()[1];
  assert.deepEqual(splice, { caseId: CASE, edition: 1, docSha: held.doc_sha, section: "attribution" }, "over the hash read");
  /* the same level again: existed, nothing new written, the first reason stands */
  const same = attribute(w, { obs, level: "cover", by: "ann", body: { reason: "second words" } });
  assert.deepEqual([same.existed, same.reason], [true, "first words"]);
  assert.equal(w.row(`SELECT reason FROM observation_attributions`).reason, "first words");
  /* another level at the same edition replaces it, with its own reason, and says what it was */
  const again = attribute(w, { obs, level: "group", by: "ann", body: { reason: "changed my mind" } });
  assert.deepEqual([again.existed, again.shown, again.reason, again.previous], [false, "test-group", "changed my mind", { level: "cover", edition: 1 }]);
  assert.deepEqual(w.rows(`SELECT level, reason FROM observation_attributions`), [{ level: "group", reason: "changed my mind" }]);
  /* a document carrying no run is left as it is and says so */
  w.prepare("CASE-2026-0002", 1, { roles: [{ target: F, version_sha: w.head(F) }] });
  const none = w.op("attribute", { by: "ann" }, { caseId: "CASE-2026-0002", edition: 1, observation: obs, level: "group", reason: REASON });
  assert.deepEqual([none.ok, none.case_document.reauthored], [true, false]);
  assert.match(none.case_document.why, /no attribution statements/);
});

test("R5 the level in force is the latest choice at or before the edition, and each level publishes its own value, never the member id; unchosen is stated with why", () => {
  const { w, obs, proj } = reached();
  attribute(w, { obs, level: "project", by: "ann" });
  const stmt = (ed) => w.ct.attributionStatements(CASE, ed, proj, [obs])[0];
  assert.deepEqual(stmt(1), { observation: obs, level: "project", shown: proj, chosen_at_edition: 1, why: null });
  assert.deepEqual([stmt(3).level, stmt(3).chosen_at_edition], ["project", 1], "a later edition inherits the prior choice");
  /* with no observations named, those the edition's document reaches */
  assert.deepEqual(w.ct.attributionStatements(CASE, 1, proj).map((s) => s.observation), [obs]);
  assert.deepEqual(w.ct.attributionStatements("CASE-NONE", 1, proj), []);
  const { w: w2, obs: o2, proj: p2 } = reached();
  const none = w2.ct.attributionStatements(CASE, 1, p2, [o2])[0];
  assert.deepEqual([none.level, none.shown, none.chosen_at_edition], [null, null, null]);
  assert.match(none.why, /chosen no level/);
  /* a level whose value cannot be produced is unchosen with its reason */
  attribute(w2, { obs: o2, level: "name", by: "ann" });
  w2.st.sql.exec(`UPDATE members SET handle=NULL WHERE member_id='ann'`);
  const lost = w2.ct.attributionStatements(CASE, 1, p2, [o2])[0];
  assert.deepEqual([lost.level, lost.shown], [null, null]);
  assert.match(lost.why, /holds no handle/);
  for (const level of ATTRIBUTION_LEVELS) {
    const { w: wl, obs: ol, proj: pl } = reached();
    attribute(wl, { obs: ol, level, by: "ann" });
    const s = wl.ct.attributionStatements(CASE, 1, pl, [ol])[0];
    assert.equal(s.shown, { group: "test-group", project: pl, cover: "Cover ann", name: "h_ann" }[level]);
    assert.ok(!JSON.stringify(s).includes(`"${V("ann")}"`) && !JSON.stringify(s).includes('"ann"'), "the member id is never a value");
  }
  /* group with no producing group recorded: the level stands and its value is null, stated in the prose */
  const { w: wg, obs: og, proj: pg } = reached();
  wg.groupRef.value = null;
  attribute(wg, { obs: og, level: "group", by: "ann" });
  assert.deepEqual([wg.ct.attributionStatements(CASE, 1, pg, [og])[0].level, wg.ct.attributionStatements(CASE, 1, pg, [og])[0].shown], ["group", null]);
  assert.deepEqual([...ATTRIBUTION_LEVELS], ["group", "project", "cover", "name"]);
});

test("R5 attributionFacts, attributionStatedFor and observationsNamingAuthor answer what the gates and the author read", () => {
  const { w, obs } = reached();
  attribute(w, { obs, level: "group", by: "ann" });
  const facts = w.ct.attributionFacts(docOf(w));
  assert.deepEqual(facts.reached, [obs]);
  assert.deepEqual(facts.legacy, [], "an observation MK-6 wrote names no author in its own files");
  assert.deepEqual(facts.stated, [{ observation: obs, level: "group", shown: "test-group" }]);
  assert.deepEqual(facts.current.map((c) => [c.observation, c.level, c.shown]), [[obs, "group", "test-group"]]);
  assert.equal(w.ct.attributionStatedFor(obs), false, "no RATIFIED document states it yet");
  w.sign(CASE, 1, { roster: [] });
  assert.equal(w.ct.attributionStatedFor(obs), true);
  const asked = w.pub.calls.filter((c) => c[0] === "signedDocumentsNaming").pop();
  assert.deepEqual(asked, ["signedDocumentsNaming", `  - observation: ${obs}`, 50], "bounded, the text the index");
  assert.equal(w.ct.attributionStatedFor(""), false);
  assert.equal(w.ct.attributionStatedFor("OBS-NONE"), false);
  /* a ratified document naming it with no chosen level does not state one */
  const { w: w2, obs: o2 } = reached();
  w2.sign(CASE, 1, { roster: [] });
  assert.equal(w2.ct.attributionStatedFor(o2), false);
  /* with no provider, none is known to state it */
  assert.equal(world({ provider: false }).ct.attributionStatedFor(obs), false);
  /* a file that cannot be read, or one naming its author, is not in reference form: fenced */
  assert.deepEqual(w.ct.observationsNamingAuthor([obs, F, "NOPE", 7, obs]), [F, "NOPE"]);
  const prov = JSON.parse(w.record.readFile(obs, "data/provenance.json").text);
  prov.documents[0].author = V("ann");
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify(prov), obs);
  assert.deepEqual(w.ct.observationsNamingAuthor([obs]), [obs]);
});

test("R6 attributionInForce answers the level in force with its reason for an observation at a case edition, inherited from the latest earlier edition; null before DEC-88", () => {
  const { w, obs } = reached();
  assert.equal(w.ct.attributionInForce(CASE, 1, obs), null, "none chosen: none, never prefilled");
  attribute(w, { obs, level: "cover", by: "ann" });
  const at1 = w.ct.attributionInForce(CASE, 1, obs);
  assert.deepEqual([at1.level, at1.edition, at1.chosen_by, at1.reason], ["cover", 1, "ann", REASON]);
  assert.deepEqual([w.ct.attributionInForce(CASE, 4, obs).level, w.ct.attributionInForce(CASE, 4, obs).edition], ["cover", 1]);
  assert.equal(w.ct.attributionInForce("CASE-2026-0002", 1, obs), null, "another case inherits nothing");
  w.st.sql.exec(`INSERT INTO observation_attributions (case_id, edition, bundle_id, level, chosen_by, chosen_at)
                 VALUES (?, 3, ?, 'name', 'ann', ?)`, CASE, obs, NOW);
  assert.equal(w.ct.attributionInForce(CASE, 2, obs).level, "cover");
  assert.deepEqual([w.ct.attributionInForce(CASE, 3, obs).level, w.ct.attributionInForce(CASE, 3, obs).reason], ["name", null]);
  /* a store written before DEC-88: the column is added by hand, and every earlier choice reads null, never back-filled */
  const st = storage();
  st.db.exec(`CREATE TABLE observation_attributions (case_id TEXT NOT NULL, edition INTEGER NOT NULL, bundle_id TEXT NOT NULL,
    level TEXT NOT NULL, chosen_by TEXT NOT NULL, chosen_at TEXT NOT NULL, PRIMARY KEY (case_id, edition, bundle_id))`);
  st.sql.exec(`INSERT INTO observation_attributions VALUES ('CASE-2026-0001', 1, 'OBS-1', 'group', 'ann', ?)`, NOW);
  migrateCaseTensions(st.sql);
  migrateCaseTensions(st.sql);
  assert.deepEqual(st.sql.exec(`SELECT level, reason FROM observation_attributions`).toArray(), [{ level: "group", reason: null }]);
});

/* ---------------------------------------------------------------- R7 */

const CAP = sha("the knocked bytes");
const KNOCKED = "INFO-2026-0009-knocked";
const WITHHELD = (capture) => ({ capture, stated: unnamedSourceStatement({ capture, received: NOW }), basis: null });
const ATTESTED = (level, by, signature) => ({ ref: KNOCKED, by_kind: "member", by, level, at: NOW, signature, recorded_in: null });
const CREASON = "Credit the group for what I brought in.";

/* ann attested CAP, off the record; the case document states its source as Withheld and carries the attribution run. */
function offRecord({ sources = [WITHHELD(CAP)] } = {}) {
  const w = world();
  w.member("olive"); w.member("ann"); w.member("bo");
  const proj = w.project("PROJ-1", ["olive"]);
  const pin = w.finding(F);
  w.actors.set(CAP, [V("ann")]);
  w.accounts.set(CAP, [{ by: V("ann"), signature: "SIG-ANN-ACCOUNT" }]);
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }], sources, attributions: [],
    materials: [{ ref: KNOCKED, kind: "document", sha: CAP, text_sha: null, origin: null, archived_copy: null,
                  included: false, rests_under: "supporting" }],
    attestations: [ATTESTED("cover", "Cover ann", "SIG-ANN"), { ref: KNOCKED, by_kind: "group", by: "test-group",
                   level: null, at: NOW, signature: "case", recorded_in: null }] });
  return { w, proj };
}
const attributeCapture = (w, { by = "ann", level = "group", capture = CAP, edition = 1, reason = CREASON } = {}) =>
  w.op("attribute", { by }, { caseId: CASE, edition, capture, level, reason });
const attestations = (w) => docOf(w).text.split("material_attestations:")[1].split("\n---")[0];

test("R7 attributeObservation takes capture in place of observation: the attesting member chooses, per case, capture and edition, dated, with its reason; attributionInForce, attributionStatements and attributionFacts answer it keyed by the capture's SHA-256", () => {
  const { w, proj } = offRecord();
  const r = attributeCapture(w, { level: "cover" });
  assert.deepEqual([r.ok, r.capture, r.observation, r.level, r.shown, r.reason, r.existed], [true, CAP, null, "cover", "Cover ann", CREASON, false]);
  assert.deepEqual(w.rows(`SELECT case_id, edition, capture_sha, level, chosen_by, reason FROM capture_attributions`),
                   [{ case_id: CASE, edition: 1, capture_sha: CAP, level: "cover", chosen_by: "ann", reason: CREASON }]);
  assert.match(w.row(`SELECT chosen_at FROM capture_attributions`).chosen_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.equal(w.count("observation_attributions"), 0, "never an observation's row");
  const inForce = w.ct.attributionInForce(CASE, 3, CAP);
  assert.deepEqual([inForce.level, inForce.edition, inForce.chosen_by, inForce.reason], ["cover", 1, "ann", CREASON], "a later edition inherits it");
  assert.deepEqual(w.ct.attributionStatements(CASE, 1, proj, [CAP]), [{ capture: CAP, level: "cover", shown: "Cover ann", chosen_at_edition: 1, why: null }]);
  assert.deepEqual(w.ct.attributionStatements(CASE, 1, proj).map((x) => x.capture), [CAP], "the edition's own document reaches it");
  const facts = w.ct.attributionFacts(docOf(w));
  assert.deepEqual([facts.reached, facts.legacy], [[CAP], []], "beside the observations; legacy asks of observations only");
  assert.deepEqual(facts.current.map((c) => [c.capture, c.level]), [[CAP, "cover"]]);
  /* the run is re-authored and states it under `capture` (K1315), so the owner signs the level */
  assert.ok(docOf(w).text.includes(`  - capture: ${CAP}`));
  assert.deepEqual(w.ct.attributionFacts(docOf(w)).stated.map((s) => [s.capture, s.level]), [[CAP, "cover"]]);
  /* K1317: the attesting member's row in the attestations section states the chosen level; the group's row is kept */
  assert.ok(/level: "?cover"?/.test(attestations(w)) && attestations(w).includes("Cover ann") && attestations(w).includes("SIG-ANN"));
  const grp = attributeCapture(w, { level: "group", reason: "group now" });
  assert.equal(grp.attestations.reauthored, true);
  assert.ok(!attestations(w).includes("Cover ann") && !attestations(w).includes("SIG-ANN") && !attestations(w).includes("h_ann"),
            "at group: no handle, cover or signature");
  assert.ok(attestations(w).includes("test-group"), "the group's own row is kept");
  /* at name: the handle, and the account's signature where the row carried none */
  const named = attributeCapture(w, { level: "name", reason: "name me" });
  assert.equal(named.shown, "h_ann");
  assert.ok(attestations(w).includes("h_ann") && attestations(w).includes("SIG-ANN-ACCOUNT"), attestations(w));
  const proj2 = attributeCapture(w, { level: "project", reason: "project now" });
  assert.equal(proj2.shown, proj);
  assert.equal(JSON.stringify(w.ct.attributionStatements(CASE, 1, proj, [CAP])).includes('"ann"'), false);
  /* signed: attributionStatedFor reads the capture row */
  assert.equal(w.ct.attributionStatedFor(CAP), false);
  w.sign(CASE, 1, { roster: [] });
  assert.equal(w.ct.attributionStatedFor(CAP), true);
});

test("R7 the same refusals: C-92.4 for a capture the edition does not state as Withheld, C-92.5 for anyone not its attesting member, C-92.6, C-92.8, C-92.9, C-92.13; each writes nothing", () => {
  for (const [label, sources, capture] of [["not stated", [], CAP], ["a basis stated", [{ capture: CAP, stated: "attribute role: clerk", basis: "consent" }], CAP],
                                            ["not a SHA-256", [WITHHELD(CAP)], "INFO-2026-0001-minutes"], ["another capture", [WITHHELD(CAP)], sha("other")]]) {
    const { w } = offRecord({ sources });
    const before = [w.snapshot(["capture_attributions"]), docOf(w).doc_sha];
    expect(attributeCapture(w, { capture }), "ATTRIBUTION_NOT_AN_OBSERVATION");
    assert.deepEqual([w.snapshot(["capture_attributions"]), docOf(w).doc_sha], before, label);
  }
  const { w: w0 } = offRecord();
  expect(attributeCapture(w0, { edition: 7 }), "ATTRIBUTION_NOT_AN_OBSERVATION");
  const { w } = offRecord();
  const before = [w.snapshot(["capture_attributions"]), docOf(w).doc_sha];
  expect(attributeCapture(w, { by: "bo" }), "ATTRIBUTION_NOT_THE_AUTHOR");
  w.actors.set(CAP, []);
  expect(attributeCapture(w), "ATTRIBUTION_NOT_THE_AUTHOR");
  w.actors.set(CAP, [V("ann")]);
  w.st.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='ann'`);
  expect(attributeCapture(w), "ATTRIBUTION_AUTHOR_NOT_ACTIVE");
  w.st.sql.exec(`UPDATE members SET status='active', handle=NULL WHERE member_id='ann'`);
  expect(attributeCapture(w, { level: "name" }), "ATTRIBUTION_NAME_NO_HANDLE");
  expect(attributeCapture(w, { reason: " " }), "ATTRIBUTION_NO_REASON");
  assert.deepEqual([w.snapshot(["capture_attributions"]), docOf(w).doc_sha], before, "nothing written");
  w.sign(CASE, 1, { roster: [] });
  expect(attributeCapture(w), "ATTRIBUTION_EDITION_RATIFIED");
  const t = ATTRIBUTION_ACT_CHECKS;
  assert.match(t.ATTRIBUTION_NOT_AN_OBSERVATION.translation, /Withheld/);
  assert.match(t.ATTRIBUTION_NOT_THE_AUTHOR.translation, /attested/);
});

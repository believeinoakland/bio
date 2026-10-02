/* Testimony credited anonymously (R29, R30; DEC-102 items 1, 2): the pair over a live basis, a version and a candidate
   given `levels`, and the corroboration read, driven at the module's interface over observations held in provenance's
   register (its R48: `authored`, `author`) and documents whose origins it records. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { STRENGTH_AXES, ORIGIN_LIMIT, CREDIT_LEVELS, VERSION_STRENGTH_CHECKS } from "../../../src/strength/index.mjs";

const INQ = "INQ-2026-0001-a";
const OBS = "INFO-2026-0001-observation", OBS2 = "INFO-2026-0002-observation", OBS3 = "INFO-2026-0003-observation";
const DOC = "INFO-2026-0004-a", DOC2 = "INFO-2026-0005-a";
const ANN = "member-ann", BO = "member-bo";
const UNCORROBORATED = /credited anonymously, and nothing independent in what this rests on bears it out/;

const said = (target) => ({ target, grade: "D", axis: "testimony", source: "testimony" });
const conn = (target, grade = "B") => ({ target, grade, axis: "connection", source: "resolution" });

/* Two observations by ann, one by bo, and two documents with captures of their own. */
function observed() {
  const w = world();
  w.observation(OBS, ANN);
  w.observation(OBS2, BO);
  w.observation(OBS3, ANN);
  w.bundle(DOC);
  w.bundle(DOC2);
  w.capture("doc-a", DOC, "https://example.test/a");
  w.capture("doc-b", DOC2, "https://example.test/b");
  return w;
}
const testimonyOf = (p) => p.testimony;
const namedInert = (axis, target) => axis.not_load_bearing.find((m) => m.target_id === target);
const noAuthor = (answer) => {
  const text = JSON.stringify(answer);
  for (const who of [ANN, BO]) assert.ok(!text.includes(who), `no author is named (${who})`);
};

test("R29: CREDIT_LEVELS are DEC-102's four, the first two anonymous", () => {
  assert.deepEqual([...CREDIT_LEVELS], ["group", "project", "cover", "name"]);
  assert.ok(Object.isFrozen(CREDIT_LEVELS));
});

test("R29: a group- or project-level testimony leg alone is inert as R3's ungraded member and named as uncorroborated anonymous testimony; the answer states its levels and names no author", () => {
  for (const level of ["group", "project"]) {
    const w = observed();
    w.inquiry(INQ, [said(OBS)]);
    const p = w.s.strengthOf(INQ, { levels: { [OBS]: level } });
    assert.equal(p.ok, true);
    assert.equal(testimonyOf(p).state, "unrated", level);
    assert.equal(testimonyOf(p).grade, null);
    const m = namedInert(testimonyOf(p), OBS);
    assert.equal(m.grade, null);
    assert.match(m.why, UNCORROBORATED);
    assert.deepEqual(p.levels, { [OBS]: level }, "the answer states the levels it was given");
    noAuthor(p);
  }
  /* Negative control: the same leg with no levels is graded as today. */
  const w = observed();
  w.inquiry(INQ, [said(OBS)]);
  const today = w.s.strengthOf(INQ);
  assert.equal(testimonyOf(today).grade, "D");
  assert.ok(!("levels" in today), "no levels given, none stated");
});

test("R29: the same anonymous leg beside an independent document leg counts at the testimony grade; beside one sharing its origin it does not", () => {
  const w = observed();
  w.inquiry(INQ, [said(OBS), conn(DOC)]);
  const p = w.s.strengthOf(INQ, { levels: { [OBS]: "group" } });
  assert.equal(testimonyOf(p).state, "graded");
  assert.equal(testimonyOf(p).grade, "D");
  assert.equal(testimonyOf(p).weakest.target_id, OBS);
  assert.equal(p.connection.grade, "B", "the corroborating leg is counted on its own axis as before");
  noAuthor(p);
  /* The document retrieved from the address the observation's own capture came from: one origin, no corroboration. */
  const s = world();
  s.observation(OBS, ANN, "obs-shared", "https://example.test/shared");
  s.bundle(DOC);
  s.capture("doc-shared", DOC, "https://example.test/shared");
  s.inquiry(INQ, [said(OBS), conn(DOC)]);
  const shared = s.s.strengthOf(INQ, { levels: { [OBS]: "group" } });
  assert.equal(testimonyOf(shared).state, "unrated");
  assert.match(namedInert(testimonyOf(shared), OBS).why, UNCORROBORATED);
});

test("R29: a cover or name leg, a leg the levels are silent on, and every leg with no levels are graded as today", () => {
  for (const levels of [{ [OBS]: "cover" }, { [OBS]: "name" }, { [OBS2]: "group" }, {}, null, undefined, "group", ["x"]]) {
    const w = observed();
    w.inquiry(INQ, [said(OBS)]);
    const p = w.s.strengthOf(INQ, { levels });
    assert.equal(testimonyOf(p).grade, "D", JSON.stringify(levels));
    assert.equal(testimonyOf(p).weakest.target_id, OBS);
  }
  /* An unknown level word is not a level: the entry is dropped from what the answer states and the leg graded as today. */
  const w = observed();
  w.inquiry(INQ, [said(OBS)]);
  const p = w.s.strengthOf(INQ, { levels: { [OBS]: "rumour", [OBS2]: "cover" } });
  assert.deepEqual(p.levels, { [OBS2]: "cover" });
  assert.equal(testimonyOf(p).grade, "D");
});

test("R29, R30: what bears an anonymous leg out: a cover or name observation by another member does; by the same member, one the levels are silent on, a hunch, an ungraded leg, an inquiry leg and a leg on an observation do not", () => {
  const cases = [
    ["a cover observation by another member", [said(OBS2)], { [OBS2]: "cover" }, true],
    ["a name observation by another member", [said(OBS2)], { [OBS2]: "name" }, true],
    ["a cover observation by the same member", [said(OBS3)], { [OBS3]: "cover" }, false],
    ["an observation by another member the levels are silent on", [said(OBS2)], {}, false],
    ["a second anonymous observation by another member", [said(OBS2)], { [OBS2]: "group" }, false],
    ["a hunch on a document", [{ target: DOC, grade: "A", axis: "connection", source: "hunch" }], {}, false],
    ["an ungraded document leg", [{ target: DOC }], {}, false],
    ["an inquiry leg", [{ target: "INQ-2026-0009-a" }], {}, false],
    ["a connection leg on an observation", [conn(OBS2)], {}, false],
  ];
  for (const [name, beside, more, bears] of cases) {
    const w = observed();
    w.inquiry("INQ-2026-0009-a", [conn(DOC2)]);
    w.inquiry(INQ, [said(OBS), ...beside]);
    const levels = { [OBS]: "group", ...more };
    const p = w.s.strengthOf(INQ, { levels });
    const anon = testimonyOf(p).not_load_bearing.find((m) => m.target_id === OBS);
    assert.equal(!anon, bears, `${name}: ${JSON.stringify(testimonyOf(p)).slice(0, 300)}`);
    const r = w.s.testimonyCorroboration({ inquiry: INQ, levels, viewer: MACHINE });
    assert.equal(r.ok, true);
    const leg = r.legs.find((x) => x.target_id === OBS);
    assert.equal(leg.state, bears ? "corroborated" : "uncorroborated", `${name} (R30)`);
    assert.equal(leg.corroborated_by.length, bears ? 1 : 0, name);
    noAuthor([p, r]);
  }
});

test("R29: an origin read cut at R12's limit does not rule a shared origin out, so that leg bears nothing out", () => {
  const w = observed();
  for (let k = 0; k <= ORIGIN_LIMIT; k++) w.capture(`many-${k}`, DOC);
  w.inquiry(INQ, [said(OBS), conn(DOC)]);
  const p = w.s.strengthOf(INQ, { levels: { [OBS]: "group" } });
  assert.equal(testimonyOf(p).state, "unrated");
  const r = w.s.testimonyCorroboration({ inquiry: INQ, levels: { [OBS]: "group" }, viewer: MACHINE });
  assert.equal(r.legs[0].state, "uncorroborated");
});

test("R29: the levels apply in a sub-inquiry's own basis, judged among its own legs", () => {
  const w = observed();
  w.inquiry("INQ-2026-0002-a", [said(OBS)]);
  w.inquiry(INQ, [{ target: "INQ-2026-0002-a" }, conn(DOC)]);
  const levels = { [OBS]: "group" };
  assert.equal(testimonyOf(w.s.strengthOf(INQ)).grade, "D", "with no levels the inherited testimony is today's");
  const p = w.s.strengthOf(INQ, { levels });
  assert.equal(testimonyOf(p).state, "unrated", "the document beside it one level up is not in its basis");
  w.inquiry("INQ-2026-0003-a", [said(OBS), conn(DOC)]);
  w.inquiry("INQ-2026-0004-a", [{ target: "INQ-2026-0003-a" }]);
  assert.equal(testimonyOf(w.s.strengthOf("INQ-2026-0004-a", { levels })).grade, "D", "borne out in its own basis");
});

test("R29: versionStrength and candidatePair take levels: an uncorroborated anonymous leg is in ungraded, named so, and inert in the pair; borne out it is graded; each answer states its levels and names no author", () => {
  const w = observed();
  w.inquiry(INQ, [], "ENT-1");
  w.testimony.set(OBS, "D");
  w.connection.set(`ENT-1|${DOC}`, "B");
  w.version(INQ, "alone", "accepted", [{ ...said(OBS), ground: "" }]);
  w.version(INQ, "beside", "accepted", [{ ...said(OBS), ground: "" }, { ...conn(DOC), ground: "" }]);
  const levels = { [OBS]: "group" };
  const alone = w.s.versionStrength({ id: INQ, version: "alone", viewer: MACHINE, levels });
  assert.equal(alone.ok, true, JSON.stringify(alone).slice(0, 300));
  assert.deepEqual(alone.graded, []);
  assert.deepEqual(alone.ungraded.map((x) => [x.target_id, x.ord]), [[OBS, 0]]);
  assert.match(alone.ungraded[0].why, UNCORROBORATED);
  assert.ok(!("grade" in alone.ungraded[0]) && !("authored" in alone.ungraded[0]), "an inert leg carries no grade");
  assert.equal(alone.pair.testimony.state, "unrated");
  assert.match(namedInert(alone.pair.testimony, OBS).why, UNCORROBORATED);
  assert.deepEqual(alone.levels, levels);
  const beside = w.s.versionStrength({ id: INQ, version: "beside", viewer: MACHINE, levels });
  assert.deepEqual(beside.graded.map((x) => [x.target_id, x.grade]), [[OBS, "D"], [DOC, "B"]]);
  assert.equal(beside.pair.testimony.grade, "D");
  const today = w.s.versionStrength({ id: INQ, version: "alone", viewer: MACHINE });
  assert.equal(today.pair.testimony.grade, "D", "with no levels, today's grade");
  assert.ok(!("levels" in today));
  noAuthor([alone, beside]);

  const cand = (legs) => w.s.candidatePair({ inquiry: INQ, levels, legs });
  const c1 = cand([{ target: OBS, grade: "D", grade_axis: "testimony", grade_source: "testimony" }]);
  assert.equal(c1.error, null);
  assert.equal(c1.pair.testimony.state, "unrated");
  assert.deepEqual(c1.levels, levels);
  const c2 = cand([{ target: OBS, grade: "D", grade_axis: "testimony", grade_source: "testimony" },
                   { target: DOC, grade: "B", grade_axis: "connection", grade_source: "resolution" }]);
  assert.equal(c2.pair.testimony.grade, "D");
  noAuthor([c1, c2]);
});

test("R30: refusals as R6's (NO_ID; absent and invisible alike NO_SUCH_BUNDLE; NOT_AN_INQUIRY) and, for a named version, VERSION_STRENGTH_NO_SUCH_VERSION (C-30.4)", () => {
  const w = observed();
  w.member("carol");
  w.inquiry(INQ, [said(OBS)]);
  w.project("PROJ-2026-0042-abc", []);
  const tc = (a) => w.s.testimonyCorroboration({ levels: { [OBS]: "group" }, viewer: MACHINE, ...a });
  assert.equal(tc({}).reason, "NO_ID");
  assert.deepEqual(tc({ inquiry: "INQ-2026-0099-a" }), { ok: false, reason: "NO_SUCH_BUNDLE", target: "INQ-2026-0099-a" });
  assert.deepEqual(tc({ inquiry: "PROJ-2026-0042-abc", viewer: "member:carol" }),
                   { ok: false, reason: "NO_SUCH_BUNDLE", target: "PROJ-2026-0042-abc" }, "an invisible id answers as an absent one");
  assert.deepEqual(tc({ inquiry: INQ, viewer: "nobody" }), { ok: false, reason: "NO_SUCH_BUNDLE", target: INQ });
  const doc = tc({ inquiry: DOC });
  assert.equal(doc.reason, "NOT_AN_INQUIRY");
  assert.equal(doc.object_type, "information");
  const nv = tc({ inquiry: INQ, version: "nope" });
  assert.equal(nv.reason, "VERSION_STRENGTH_NO_SUCH_VERSION");
  assert.equal(nv.check, "C-30.4");
  assert.equal(nv.translation, VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_NO_SUCH_VERSION.translation);
});

test("R30: corroborated and uncorroborated legs of the live basis and of a named version, with the legs that bear each out; a corroborator sharing an origin does not; it writes nothing and names no author", () => {
  const w = observed();
  w.observation("INFO-2026-0006-observation", BO, "obs-6", "https://example.test/a");   /* shares DOC's address */
  w.inquiry(INQ, [said(OBS), conn(DOC), said("INFO-2026-0006-observation")], "ENT-1");
  const levels = { [OBS]: "group", "INFO-2026-0006-observation": "project" };
  const dump = () => JSON.stringify(w.rows(`SELECT name, sql FROM sqlite_master ORDER BY name`))
    + JSON.stringify(w.rows(`SELECT * FROM bundles ORDER BY bundle_id`)) + JSON.stringify(w.rows(`SELECT * FROM register ORDER BY capture_sha`));
  const before = dump();
  const r = w.s.testimonyCorroboration({ inquiry: INQ, levels, viewer: MACHINE });
  assert.equal(r.ok, true);
  assert.equal(r.wrote, false);
  assert.deepEqual(r.levels, levels);
  assert.deepEqual(r.legs, [
    { ord: 0, target_id: OBS, level: "group", state: "corroborated", corroborated_by: [{ ord: 1, target_id: DOC }] },
    { ord: 2, target_id: "INFO-2026-0006-observation", level: "project", state: "uncorroborated", corroborated_by: [] },
  ]);
  assert.equal(r.out_of_view, undefined);
  /* The one judgement: the pair counts exactly the legs R30 calls corroborated. */
  const p = w.s.strengthOf(INQ, { levels });
  assert.equal(namedInert(p.testimony, OBS), undefined);
  assert.match(namedInert(p.testimony, "INFO-2026-0006-observation").why, UNCORROBORATED);
  /* A named version's legs, read through the record's grades (R9). */
  w.testimony.set(OBS, "D");
  w.connection.set(`ENT-1|${DOC}`, "B");
  w.version(INQ, "v1", "accepted", [{ ...said(OBS), ground: "" }, { ...conn(DOC2), ground: "" }]);
  const v = w.s.testimonyCorroboration({ inquiry: INQ, version: "v1", levels, viewer: MACHINE });
  assert.equal(v.version, "v1");
  assert.deepEqual(v.legs.map((x) => [x.target_id, x.state]), [[OBS, "uncorroborated"]],
    "the version's document leg earns nothing (R9), so it is not counted and bears nothing out");
  w.connection.set(`ENT-1|${DOC2}`, "C");
  assert.deepEqual(w.s.testimonyCorroboration({ inquiry: INQ, version: "v1", levels, viewer: MACHINE }).legs[0].corroborated_by,
                   [{ ord: 1, target_id: DOC2 }]);
  /* With no levels nothing is anonymous, so nothing is answered. */
  assert.deepEqual(w.s.testimonyCorroboration({ inquiry: INQ, viewer: MACHINE }).legs, []);
  assert.equal(dump(), before, "nothing written");
  noAuthor([r, v]);
});

test("R30: a leg the viewer may not see is withheld whole and never corroborates; out_of_view says only that something was", () => {
  const w = observed();
  w.member("alice");
  w.member("carol");
  const HID = "PROJ-2026-0042-hid";
  w.project(HID, ["alice"]);
  w.inquiry(INQ, [said(OBS), conn(HID)]);
  const levels = { [OBS]: "group" };
  const alice = w.s.testimonyCorroboration({ inquiry: INQ, levels, viewer: "member:alice" });
  assert.deepEqual(alice.legs[0].corroborated_by, [{ ord: 1, target_id: HID }]);
  const carol = w.s.testimonyCorroboration({ inquiry: INQ, levels, viewer: "member:carol" });
  assert.equal(carol.legs[0].state, "uncorroborated", "an unseen leg bears nothing out");
  assert.ok(!JSON.stringify(carol).includes(HID));
  /* The anonymous leg itself on a record the viewer may not see: withheld whole. */
  w.rows(`UPDATE bundles SET project=? WHERE bundle_id=?`, HID, OBS2);
  w.inquiry("INQ-2026-0002-a", [said(OBS2), said(OBS), conn(DOC)]);
  const two = { [OBS]: "group", [OBS2]: "group" };
  const hidden = w.s.testimonyCorroboration({ inquiry: "INQ-2026-0002-a", levels: two, viewer: "member:carol" });
  assert.deepEqual(hidden.legs.map((x) => x.target_id), [OBS]);
  assert.equal(hidden.out_of_view, true);
  assert.ok(!JSON.stringify(hidden.legs).includes(OBS2));
  const seen = w.s.testimonyCorroboration({ inquiry: "INQ-2026-0002-a", levels: two, viewer: "member:alice" });
  assert.deepEqual(seen.legs.map((x) => x.target_id), [OBS2, OBS]);
  assert.equal(seen.out_of_view, undefined);
  for (const axis of STRENGTH_AXES) assert.ok(axis in w.s.strengthOf(INQ, { levels }), "the pair is unchanged in shape");
});

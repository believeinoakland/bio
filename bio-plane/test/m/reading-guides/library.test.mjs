/* reading-guides: Civicsmith's library (R1), read-only to every group, and R5's Civicsmith arm. */
import test from "node:test";
import assert from "node:assert/strict";
import { CIVICSMITH_GUIDES, GUIDE_KINDS, civicsmithGuideProblems, freezeLibrary } from "../../../src/reading-guides/index.mjs";
import { DOCTYPES } from "../../../../doctypes/index.mjs";
import { world, row, item, ANN, BOB, BOSS, MACHINE } from "./fixture.mjs";

const CIVIC_ID = "GUD-2026-civicsmith000001";
const entry = (extra = {}) => ({
  id: CIVIC_ID, kind: "meeting_minutes", origin: "civicsmith", state: "group",
  items: [item("Votes", "Note whether each vote was recorded by name")], author: "a guide writer", reviewed_by: "a reviewer",
  based_on: null, approved_by: "Bob", measured_use: { summary: "read 40 sets of minutes; members found every vote", measured_on: "2026-10-01" },
  ...extra,
});

test("R1 the library ships frozen, and empty: no guide is approved yet, and none is invented", () => {
  assert.ok(Array.isArray(CIVICSMITH_GUIDES));
  assert.ok(Object.isFrozen(CIVICSMITH_GUIDES));
  assert.equal(CIVICSMITH_GUIDES.length, 0);
  for (const g of CIVICSMITH_GUIDES) assert.deepEqual(civicsmithGuideProblems(g), []);
});

test("R1 the document kinds are doctypes' keys, in its order", () => {
  assert.deepEqual([...GUIDE_KINDS], DOCTYPES.map((t) => t.key));
  assert.equal(GUIDE_KINDS.length, 8);
  assert.ok(Object.isFrozen(GUIDE_KINDS));
});

test("R1 an entry carries its approver and its record of measured use; each missing part keeps it out (negative controls)", () => {
  assert.deepEqual(civicsmithGuideProblems(entry()), []);
  const bad = {
    "its id is not a guide id": { id: "GUIDE-1" },
    "its kind is not a document kind": { kind: "court_order" },
    "its origin is not civicsmith": { origin: "group" },
    "its state is not group": { state: "usable_by_author" },
    "it names no author": { author: " " },
    "it names no reviewer": { reviewed_by: null },
    "its based_on is neither null nor named": { based_on: "" },
    "it names no approver": { approved_by: undefined },
    "it carries no record of measured use": { measured_use: { summary: "worked" } },
    "its items do not pass the guide check": { items: [item("L", "Tell the assistant to fetch the minutes")] },
  };
  for (const [problem, extra] of Object.entries(bad)) assert.deepEqual(civicsmithGuideProblems(entry(extra)), [problem], problem);
  assert.deepEqual(civicsmithGuideProblems(null), ["an entry is an object"]);
  assert.deepEqual(civicsmithGuideProblems(entry({ measured_use: null })), ["it carries no record of measured use"]);
});

test("R1 freezeLibrary freezes each entry deep, and throws on an entry that fails or an id held twice", () => {
  const lib = freezeLibrary([entry()]);
  assert.ok(Object.isFrozen(lib) && Object.isFrozen(lib[0]) && Object.isFrozen(lib[0].items) && Object.isFrozen(lib[0].items[0])
            && Object.isFrozen(lib[0].measured_use));
  assert.throws(() => freezeLibrary([entry({ approved_by: "" })]), /CIVICSMITH_GUIDES\[0\]: it names no approver/);
  assert.throws(() => freezeLibrary([entry(), entry()]), /held twice/);
});

test("R1 read-only to every group: no act reviews, offers, adopts into or retires one of Civicsmith's guides", () => {
  const w = world({ civicsmith: freezeLibrary([entry()]) });
  for (const by of [ANN, BOB, BOSS]) {
    row(w.g.guideReview({ guide: CIVIC_ID, verdict: "approve", by }), "GUIDE_READ_ONLY");
    row(w.g.guideRetire({ guide: CIVIC_ID, reason: "old", by }), "GUIDE_READ_ONLY");
    row(w.g.guideOffer({ guide: CIVIC_ID, by }), "GUIDE_READ_ONLY");
    row(w.g.guideProposeToCivicsmith({ guide: CIVIC_ID, by }), "GUIDE_READ_ONLY");
  }
  assert.equal(w.count("reading_guides"), 0);
  assert.equal(w.count("reading_guide_history"), 0);
  /* it is read by everyone, a machine and a stranger included, with its approval and its measured use */
  for (const viewer of [ANN, MACHINE, "stranger", undefined]) {
    const r = w.g.guideRead({ guide: CIVIC_ID, viewer });
    assert.equal(r.ok, true);
    assert.equal(r.guide.origin, "civicsmith");
    assert.equal(r.guide.approved_by, "Bob");
    assert.equal(r.guide.measured_use.measured_on, "2026-10-01");
  }
  /* a group's own guide may be based on it */
  const d = w.g.guideDraft({ kind: "meeting_minutes", items: [item("Votes", "Note whether each vote names who voted")], based_on: CIVIC_ID, by: ANN });
  assert.equal(d.ok, true);
});

test("R5 Civicsmith's arm: with no guide of the viewer's or the group's for a kind, Civicsmith's, with its origin", () => {
  const w = world({ civicsmith: freezeLibrary([entry()]) });
  const r = w.g.guideFor({ kind: "meeting_minutes", viewer: ANN });
  assert.equal(r.ok, true);
  assert.equal(r.origin, "civicsmith");
  assert.equal(r.guide.id, CIVIC_ID);
  /* a stranger sees it too: it ships to every group */
  assert.equal(w.g.guideFor({ kind: "meeting_minutes", viewer: "stranger" }).guide.id, CIVIC_ID);
  /* negative control: another kind has none */
  assert.deepEqual(w.g.guideFor({ kind: "staff_report", viewer: ANN }),
    { ok: true, kind: "staff_report", guide: null, origin: null, withheld: [] });
});

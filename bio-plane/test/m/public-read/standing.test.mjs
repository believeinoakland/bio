/* public-read — R22 (each member's standing, DEC-112 (4)(1)) and R3's `/6` blocks (`method`, `materials`, DEC-112 (3)), at
   `op=publishedcase`. Each `/6` document is the fixture's (`publication`'s, its method and materials blocks as
   case-authoring writes them), with the bar it records; every claim has its negative control (an edition signed before
   T28 in another format, a document stating no bar, a member that is not load-bearing). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseDoc, V, NOW } from "./fixture.mjs";
import { standingOf, CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V6 } from "../../../src/case-grammar/index.mjs";
import { standingsOf } from "../../../src/public-read/index.mjs";

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", G = "INQ-2026-0002";
const SHA = (c) => c.repeat(64);
const MATERIALS = {
  materials: [
    { ref: "INFO-2026-0001", kind: "document", sha: SHA("a"), text_sha: SHA("b"), origin: "https://city.example/m.pdf",
      archived_copy: null, included: true, rests_under: "load_bearing" },
    { ref: "OBS-2026-0001", kind: "observation", sha: SHA("c"), text_sha: null, origin: null, archived_copy: null,
      included: false, rests_under: "supporting" }],
  attestations: [
    { ref: "INFO-2026-0001", by_kind: "group", by: "parks-group", level: null, at: NOW, signature: "case", recorded_in: null },
    { ref: "INFO-2026-0001", by_kind: "member", by: null, level: "group", at: NOW, signature: null, recorded_in: null }],
};
const METHOD = { grading: "bio-grading/1", checks: "1.57.0" };

/* A case document of `format`, its members F (load-bearing) and G (supporting), their frozen pairs, the bar it records
   (`required_strength`), and, for /6, the method and materials blocks. */
function docOf({ format = CASE_DOCUMENT_FORMAT_V6, bar = { declared: true, capture: "B", connection: "C" }, pins }) {
  const text = caseDoc(CASE, 1, { format, project: "PROJ-1", method: METHOD, ...MATERIALS,
    roles: [{ target: F, version_sha: pins[F], role: "load_bearing" }, { target: G, version_sha: pins[G], role: "supporting" }],
    strength: [{ target: F, axis: "capture", grade: "A" }, { target: F, axis: "connection", grade: "D" },
               { target: G, axis: "capture", grade: "E" }, { target: G, axis: "connection", grade: "E" }] });
  const lines = text.split("\n");
  const close = lines.indexOf("---", 1);
  const extra = ["required_strength:", `  declared: ${bar.declared}`, "  source: project", "  project: PROJ-1",
    `  capture: ${bar.capture ?? "null"}`, `  connection: ${bar.connection ?? "null"}`, '  detail: "the bar"'];
  return [...lines.slice(0, close), ...extra, ...lines.slice(close)].join("\n");
}

function published(opts = {}) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  w.inquiry(G);
  const pins = { [F]: w.head(F), [G]: w.head(G) };
  const text = docOf({ ...opts, pins });
  const stored = w.p.storeCaseDocument({ case: CASE, edition: 1, text, author: V("olive"), at: NOW });
  assert.equal(stored.ok, true, JSON.stringify(stored));
  const signed = w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pins[F], role: "load_bearing" },
                                                               { bundle_id: G, version_sha: pins[G], role: "supporting" }] });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  assert.equal(w.signFinding(F).ok, true);
  assert.equal(w.signFinding(G).ok, true);
  return { w, text };
}
const memberOf = (c, id) => c.findings.find((f) => f.bundle_id === id);

test("R22 each member answers `standing`: case-grammar.standingOf over its role, the document's bar and its frozen pair, read from the signed document", () => {
  const { w } = published();
  const c = w.read("publishedcase", { id: CASE });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  const bar = { capture: "B", connection: "C" };
  assert.deepEqual(memberOf(c, F).standing,
    standingOf({ role: "load_bearing", bar, pair: { capture: "A", connection: "D" } }),
    "the load-bearing member: its own pair against the bar the document records");
  assert.equal(memberOf(c, F).standing.meets, false, "connection D falls short of C");
  assert.deepEqual(memberOf(c, F).standing.short, ["connection"]);
  assert.deepEqual(memberOf(c, G).standing, standingOf({ role: "supporting", bar, pair: { capture: "E", connection: "E" } }));
  assert.equal(memberOf(c, G).standing.meets, "not_asked", "a supporting member is not asked to meet the bar");
  /* R11: one line per member and never one for the case. */
  assert.equal(Object.hasOwn(c, "standing"), false, "no case-level standing");
  assert.equal(Object.hasOwn(c, "strength"), false, "no case-level strength");
});

test("R22 negative controls: a document recording no bar answers `no_bar`; one stating no member blocks answers null; the read is the signed document's, never live", () => {
  const nb = published({ bar: { declared: false, capture: null, connection: null } }).w.read("publishedcase", { id: CASE });
  assert.equal(memberOf(nb, F).standing.meets, "no_bar");
  assert.equal(memberOf(nb, G).standing.meets, "no_bar");
  /* A legacy document (/1) states no member blocks: nothing to read, so nothing is answered. */
  assert.equal(standingsOf({ format: "bio-case-document/1", case_roles: [{ target: F, role: "load_bearing" }] }), null);
  assert.equal(standingsOf(null), null);
  /* Exactly the document's facts: the same front matter gives the same standings, whatever the record holds. */
  const s = standingsOf({ format: CASE_DOCUMENT_FORMAT_V6, case_roles: [{ target: F, role: "load_bearing" }],
                          case_strength: [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }],
                          required_strength: { declared: true, capture: "B", connection: "C" } });
  assert.equal(s.get(F).meets, true);
  assert.match(s.get(F).line, /meets this project's bar \(capture B, connection C\)/);
});

test("R3 a /6 document answers its `method` and `materials` blocks as signed (case-grammar R11, R12); any other format answers null for both", () => {
  const { w } = published();
  const c = w.read("publishedcase", { id: CASE });
  assert.deepEqual(c.method, METHOD);
  assert.deepEqual(c.materials.materials.map((m) => [m.ref, m.kind, m.sha, m.included, m.rests_under]),
    [["INFO-2026-0001", "document", SHA("a"), true, "load_bearing"], ["OBS-2026-0001", "observation", SHA("c"), false, "supporting"]]);
  assert.deepEqual(c.materials.attestations.map((a) => [a.ref, a.by_kind, a.by, a.level, a.signature]),
    [["INFO-2026-0001", "group", "parks-group", null, "case"], ["INFO-2026-0001", "member", null, "group", null]],
    "a member row at group level carries no handle and no signature, as signed");
  const five = published({ format: "bio-case-document/5" }).w.read("publishedcase", { id: CASE });
  assert.equal(five.ok, true);
  assert.equal(five.method, null);
  assert.equal(five.materials, null);
});

test("R3 a /7 document, identical in fields to /6 (case-grammar R1; DEC-124), answers the same `method` and `materials` blocks as signed", () => {
  assert.equal(CASE_DOCUMENT_FORMAT, "bio-case-document/7");
  const six = published().w.read("publishedcase", { id: CASE });
  const seven = published({ format: CASE_DOCUMENT_FORMAT }).w.read("publishedcase", { id: CASE });
  assert.equal(seven.ok, true);
  assert.deepEqual(seven.method, METHOD);
  assert.deepEqual(seven.materials, six.materials, "the same blocks as the /6 document's");
  assert.deepEqual(seven.findings.map((f) => f.standing), six.findings.map((f) => f.standing), "and the same standings (R22)");
});

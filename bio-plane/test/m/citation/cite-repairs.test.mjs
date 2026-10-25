/* citation R21 (fix round 4, cite-refusal; retired in fix round 10, K5101): a BASIS_REFUSED a cite gives states `repairs: []`.
   Since inquiry-grammar R68 a second passage beside a grouped one is clean, and the one grouping finding a cite reaches, a
   cutting passage the member named into a group, has no repair: naming the group is the member's choice. Pressed through the
   module's ops map as the door calls it. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, inqMd } from "./fixture.mjs";
import { citationOps } from "../../../src/citation/index.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const DOC = "INFO-2026-0001-doc", DOC2 = "INFO-2026-0002-doc", Q = "INQ-2026-0001-q";

/* a question resting on DOC alone, in a group of its own */
function grouped() {
  const w = world({ inquiry: true });
  w.info(DOC);
  w.info(DOC2);
  w.put(Q, inqMd(Q, [
    `basis:\n  - target: ${DOC}\n    role: supports\n    ground: part 1\n    extent_capture: "${w.content.captureFor(DOC)}"`,
    `grounds:\n  - ground: part 1\n    asserted_by: member:ann\n    at: "2026-09-28T01:00:00Z"`,
  ]).replace("references: []", `references:\n  - rel: cites\n    target: ${DOC}\n    status: confirmed\n    note: ""`));
  return w;
}
/* the press: the fields in the body, the stamps in the address, as the door sends them */
const press = (w, body, stamps = ANN) =>
  citationOps(w.cit, new URL(`http://x/?${new URLSearchParams(stamps)}`), { project: Q, role: "supports", ...body }).cite();

test("R21: a second passage cited beside a grouped one is clean and carries no repairs (inquiry-grammar R68): the new leg is a necessary leg of its own", async () => {
  const w = grouped();
  const r = press(w, { handle: await w.select([DOC2]) });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal("repairs" in r, false, "a cite that is not refused carries none");
  assert.deepEqual(w.fm(Q).basis.map((l) => [l.target, l.ground ?? null]), [[DOC, "part 1"], [DOC2, null]]);
});

test("R21: the grouping finding the real grammar still raises through a cite, a cutting passage named into a group, is BASIS_REFUSED with its findings, repairs [] (the member named the group), nothing written; the same cite without the group lands", async () => {
  const w = grouped();
  const h = await w.select([DOC2]);
  const before = w.md(Q);
  const r = press(w, { handle: h, role: "cuts_against", ground: "part 1" });
  assert.deepEqual([r.ok, r.reason], [false, "BASIS_REFUSED"]);
  assert.ok(r.findings.some((f) => f.check === "C-2.8"), "the finding stays");
  assert.deepEqual(r.repairs, []);
  assert.equal(w.md(Q), before);
  const again = press(w, { handle: h, role: "cuts_against" });
  assert.equal(again.ok, true, JSON.stringify(again).slice(0, 300));
});

test("R21: a refusal with no repair states repairs: [], and an ungrouped basis is not refused", async () => {
  const w = grouped();
  const bad = press(w, { handle: await w.select([DOC2]), extent_kind: "nonsense-kind" });
  assert.equal(bad.reason, "BASIS_REFUSED");
  assert.deepEqual(bad.repairs, []);
  const w2 = world({ inquiry: true });
  w2.info(DOC); w2.info(DOC2); w2.inquiry(Q);
  const ok = press(w2, { handle: await w2.select([DOC2]) });
  assert.equal(ok.ok, true);
  assert.equal("repairs" in ok, false);
});

test("R21: a ground the question does not declare, and a ground on a case, are refused BAD_GROUND, writing nothing", async () => {
  const w = grouped();
  const h = await w.select([DOC2]);
  const before = w.md(Q);
  const r = press(w, { handle: h, ground: "part 9" });
  assert.deepEqual([r.ok, r.reason, r.grounds], [false, "BAD_GROUND", ["part 1"]]);
  assert.equal(w.md(Q), before);
  const p = w.project();
  const c = citationOps(w.cit, new URL(`http://x/?${new URLSearchParams(ANN)}`), { project: p, handle: h, ground: "part 1" }).cite();
  assert.deepEqual([c.ok, c.reason], [false, "BAD_GROUND"]);
});

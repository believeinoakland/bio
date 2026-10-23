/* citation R21 (fix round 4, cite-refusal): a BASIS_REFUSED answer for a grouped basis carries its repairs, each the act that
   clears the finding; done, the cite lands. The walker's case: a question whose only citation is grouped, then "Cite this" on a
   second passage, pressed through the module's ops map as the door calls it. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, inqMd } from "./fixture.mjs";
import { citationOps } from "../../../src/citation/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

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

test("R21: citing a second passage while the only citation is grouped is BASIS_REFUSED with its findings and two repairs, one adding it to the group and one taking the grouping off; nothing is written", async () => {
  const w = grouped();
  const before = w.md(Q);
  const r = press(w, { handle: await w.select([DOC2]) });
  assert.deepEqual([r.ok, r.reason], [false, "BASIS_REFUSED"]);
  assert.ok(r.findings.some((f) => f.check === "C-2.8"), "the finding stays");
  assert.deepEqual(r.repairs.map((x) => [x.key, x.act]), [
    ["citation.index.repair_add_to_group", "cite"], ["citation.index.repair_remove_grouping", "inquiryground"]]);
  assert.deepEqual(r.repairs[0].fields, { ground: "part 1" });
  assert.deepEqual(r.repairs[1].fields, { target: Q, grounds: [] });
  assert.equal(r.repairs[0].text, localize("citation.index.repair_add_to_group", "Add it to the group {ground}", { ground: "part 1" }));
  assert.equal(w.md(Q), before);
});

test("R21: the first repair, done, lets the cite succeed: the new leg joins the group", async () => {
  const w = grouped();
  const h = await w.select([DOC2]);
  const r = press(w, { handle: h });
  const again = press(w, { handle: h, ...r.repairs[0].fields });
  assert.equal(again.ok, true, JSON.stringify(again).slice(0, 300));
  assert.deepEqual(w.fm(Q).basis.map((l) => [l.target, l.ground]), [[DOC, "part 1"], [DOC2, "part 1"]]);
  assert.equal("repairs" in again, false, "a cite that is not refused carries none");
});

test("R21: the second repair, done, lets the cite succeed: the grouping is off and the new leg lands", async () => {
  const w = grouped();
  const h = await w.select([DOC2]);
  const r = press(w, { handle: h });
  const act = r.repairs[1];
  assert.equal(act.act, "inquiryground");
  const g = w.inquiryModule.ground({ ...act.fields, reason: "regrouping", viewer: ANN.viewer, author: ANN.author });
  assert.equal(g.ok, true, JSON.stringify(g).slice(0, 300));
  const again = press(w, { handle: h });
  assert.equal(again.ok, true, JSON.stringify(again).slice(0, 300));
  assert.deepEqual(w.fm(Q).basis.map((l) => l.target), [DOC, DOC2]);
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

/* case-tensions — the tensions found since a case was published (R4, was publication R50). Driven at the module's
   interface. `contradiction` R29's `unresolvedRecordOn` is a stand-in the test controls, answering exactly R29's shapes
   (a seen candidate with both sides; an unseen one with its seen side only; `undetermined`, `truncated`), so each arm
   is reached without an AI run minting candidates. The disclosed tensions are the signed document's `case_tensions`
   rows, read through case-grammar's reader. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { CASE_TENSIONS_MAX } from "../../../src/case-tensions/index.mjs";

const F = "INQ-2026-0001", G = "INQ-2026-0002";
const CASE = "CASE-2026-0001";
const disclosed = (candidate, finding = F) => ({ candidate, finding, state: "open", unseen_other_side: false, depth: 1,
                                                 a_kind: "claim", a_text: "a", b_kind: "claim", b_text: "b" });
const DISCLOSED = [disclosed("c-open"), disclosed("c-expl"), disclosed("c-up"), disclosed("c-hid", G)];

/* A stand-in for contradiction R29: `answers` maps finding -> answer, or (viewer, sha) -> answer; every call recorded. */
function standIn(answers = {}) {
  const calls = [];
  return { calls, unresolvedRecordOn({ finding, sha, viewer }) {
    calls.push({ finding, sha, viewer });
    const a = answers[finding];
    const out = typeof a === "function" ? a(viewer, sha) : a;
    return out ?? { ok: true, wrote: false, finding, sha, candidates: [], truncated: false };
  } };
}
const seen = (id, state = "open") => ({ candidate: id, key: "K2", a: { kind: "claim", text: "a" }, b: { kind: "claim", text: "b" },
                                        state, explanation: "why", kind: "irreconcilable", inquiry: null, depth: 1 });
const unseen = (id) => ({ candidate: id, unseen_other_side: true, state: "open", depth: 1, side: { kind: "claim", text: "mine" },
                          a: { text: "SECRET" }, explanation: "SECRET" });

/* CASE edition 1 over F and G, signed and ratified, owned by PROJ-1 (owner olive); `tensions` the disclosed rows. */
function published({ tensions = DISCLOSED, contradiction = null } = {}) {
  const w = world({ contradiction: contradiction || standIn() });
  w.member("olive"); w.member("bo");
  const proj = w.project("PROJ-1", ["olive"]);
  const roles = [{ target: F, version_sha: w.finding(F) }, { target: G, version_sha: w.finding(G) }];
  w.prepare(CASE, 1, { project: proj, roles, tensions });
  w.sign(CASE, 1);
  return { w, proj, roles };
}

test("R4 a tension formed after ratification appears, with its case, edition, member, candidate and state; a disclosed one does not; a disclosed one no longer answered is resolved_since; it writes nothing and the signed edition never changes", () => {
  const ctr = standIn({
    [F]: { ok: true, candidates: [seen("c-open"), seen("c-new", "explained_not_shown")], truncated: false },
    [G]: { ok: true, candidates: [], truncated: false },
  });
  const { w, proj, roles } = published({ contradiction: ctr });
  const before = { ...w.pub.get(CASE, 1) };
  const snap = w.snapshot();
  const r = w.ct.caseTensions({ project: proj });
  assert.deepEqual(w.snapshot(), snap, "it writes nothing");
  assert.deepEqual([r.ok, r.wrote, r.project, r.limit, r.cursor], [true, false, proj, CASE_TENSIONS_MAX, null]);
  assert.match(r.says, /No strength is composed/);
  assert.equal(r.cases.length, 1);
  const one = r.cases[0];
  assert.deepEqual([one.case, one.edition, one.project], [CASE, 1, proj]);
  assert.deepEqual(one.tensions, [{ case: CASE, edition: 1, member: F, candidate: "c-new", state: "explained_not_shown",
    a: { kind: "claim", text: "a" }, b: { kind: "claim", text: "b" }, kind: "irreconcilable", explanation: "why", depth: 1 }],
    "a candidate the owners see whole carries both sides");
  assert.deepEqual(one.resolved_since, [
    { case: CASE, edition: 1, candidate: "c-expl", resolved_since: true }, { case: CASE, edition: 1, candidate: "c-up", resolved_since: true },
    { case: CASE, edition: 1, candidate: "c-hid", resolved_since: true }]);
  assert.equal("unread" in one, false);
  assert.deepEqual(ctr.calls.map((c) => [c.finding, c.sha, c.viewer]), roles.map((x) => [x.target, x.version_sha, V("olive")]),
                   "each member at its pinned sha, under the owner's sight");
  assert.deepEqual(w.pub.get(CASE, 1), before, "the edition's bytes are unchanged");
  /* a later edition that discloses it: the tension leaves, and only the latest ratified edition is read */
  w.prepare(CASE, 2, { project: proj, roles, tensions: [disclosed("c-new"), disclosed("c-open")] });
  w.sign(CASE, 2);
  const later = w.ct.caseTensions({ project: proj }).cases[0];
  assert.deepEqual([later.edition, later.tensions, later.resolved_since], [2, [], []]);
  /* a signed edition not ratified is not the latest ratified one */
  w.prepare(CASE, 3, { project: proj, roles, tensions: [] });
  w.sign(CASE, 3, { ratified: false });
  assert.equal(w.ct.caseTensions({}).cases[0].edition, 2);
});

test("R4 DEC-85 a candidate with a side any of the project's owners may not see is answered as unresolvedRecordOn answers it, with nothing of that side; a project with no owner is read by nobody", () => {
  const ctr = standIn({ [F]: (viewer) => ({ ok: true, truncated: false, candidates: [viewer === V("bo") ? unseen("c-x") : seen("c-x")] }) });
  const { w, proj } = published({ contradiction: ctr, tensions: [] });
  w.rows(`INSERT INTO project_participants (project_id, member_id, state, owner, owner_order, created, updated)
          VALUES (?, 'bo', 'joined', 1, 9, 't', 't')`, proj);
  const owners = w.membership.projectOwners(proj);
  assert.deepEqual(owners, ["olive", "bo"]);
  const x = w.ct.caseTensions({ project: proj }).cases[0].tensions.find((t) => t.candidate === "c-x");
  assert.deepEqual(x, { case: CASE, edition: 1, member: F, candidate: "c-x", state: "open", unseen_other_side: true,
                        side: { kind: "claim", text: "mine" }, depth: 1 });
  assert.equal(JSON.stringify(x).includes("SECRET"), false, "nothing of the unseen side");
  assert.deepEqual([...new Set(ctr.calls.map((c) => c.viewer))].sort(), owners.map(V).sort());
  /* no owner: asked with a viewer that sees nothing */
  const ctr2 = standIn();
  const { w: w2, proj: p2 } = published({ contradiction: ctr2, tensions: [] });
  w2.rows(`UPDATE project_participants SET owner=0 WHERE project_id=?`, p2);
  const all = w2.ct.caseTensions({});
  assert.equal(all.cases[0].project, p2);
  assert.deepEqual([...new Set(ctr2.calls.map((c) => c.viewer))], [""]);
  assert.deepEqual(w2.ct.caseTensions({ project: "PROJ-OTHER" }).cases, [], "a case its project does not own is not that project's");
});

test("R4 a member whose read fails, is cut or throws is stated, never dropped, and nothing is called resolved on a partial read; it never throws; with no provider it is undetermined", () => {
  const ctr = standIn({ [F]: { ok: true, candidates: [], truncated: false, undetermined: true },
                        [G]: { ok: true, candidates: [seen("c-g")], truncated: true } });
  const one = published({ contradiction: ctr }).w.ct.caseTensions({}).cases[0];
  assert.deepEqual(one.unread, [{ member: F, undetermined: true }, { member: G, truncated: true }]);
  assert.deepEqual(one.resolved_since, [], "a disclosure is never called resolved on a read not made whole");
  assert.deepEqual(one.tensions.map((t) => t.candidate), ["c-g"]);
  const legs = standIn({ [F]: { ok: true, candidates: [], truncated: false, undetermined_legs: 2 } });
  assert.deepEqual(published({ contradiction: legs }).w.ct.caseTensions({}).cases[0].unread[0], { member: F, undetermined: true });
  const boom = published({ contradiction: { unresolvedRecordOn() { throw new Error("down"); } } }).w.ct.caseTensions({});
  assert.deepEqual(boom.cases[0].unread.map((u) => u.undetermined), [true, true]);
  /* a roster member with no pinned version is stated, never read */
  const { w: wp } = published();
  wp.pub.get(CASE, 1).roster[0].version_sha = null;
  assert.deepEqual(wp.ct.caseTensions({}).cases[0].unread[0], { member: F, undetermined: true, why: "no version was pinned" });
  /* the provider failing: undetermined, never a throw */
  const { w: worse } = published();
  worse.pub.fail.add("members");
  const out = worse.ct.caseTensions({});
  assert.deepEqual([out.ok, out.cases, out.undetermined], [true, [], true]);
  const none = world({ provider: false }).ct.caseTensions({ project: "PROJ-1" });
  assert.deepEqual([none.ok, none.wrote, none.cases, none.undetermined, none.cursor], [true, false, [], true, null]);
});

test("R4 pages by case id after `after`, at most `limit` (1–200, 200 by default), the cursor the last case when more follow; only each case's latest ratified edition", () => {
  const { w, proj, roles } = published({ tensions: [] });
  for (let i = 2; i <= 4; i++) {
    w.prepare(`CASE-2026-000${i}`, 1, { project: proj, roles, tensions: [] });
    w.sign(`CASE-2026-000${i}`, 1);
  }
  const all = w.ct.caseTensions({});
  assert.deepEqual([all.cases.map((c) => c.case), all.limit, all.cursor],
                   [["CASE-2026-0001", "CASE-2026-0002", "CASE-2026-0003", "CASE-2026-0004"], CASE_TENSIONS_MAX, null]);
  assert.equal(CASE_TENSIONS_MAX, 200);
  const p1 = w.ct.caseTensions({ limit: 2 });
  assert.deepEqual([p1.cases.map((c) => c.case), p1.cursor], [["CASE-2026-0001", "CASE-2026-0002"], "CASE-2026-0002"]);
  const p2 = w.ct.caseTensions({ limit: 2, after: p1.cursor });
  assert.deepEqual([p2.cases.map((c) => c.case), p2.cursor], [["CASE-2026-0003", "CASE-2026-0004"], null]);
  assert.equal(w.ct.caseTensions({ limit: 4 }).cursor, null, "exactly at the limit: no cursor");
  for (const [asked, got] of [[0, 200], [-5, 1], [999, 200], ["x", 200], [2.7, 2]])
    assert.equal(w.ct.caseTensions({ limit: asked }).limit, got, `limit ${asked}`);
  /* the provider is asked for one more than the page, never the whole store */
  const asked = w.pub.calls.filter((c) => c[0] === "latestRatified").map((c) => c[1].limit);
  assert.ok(asked.every((n) => n <= 201), JSON.stringify(asked));
});

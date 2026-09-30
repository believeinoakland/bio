/* retrieval: the single-bundle projection's registered decorations (R5, R56), at the module's interface.
 *
 * Converted from the old battery's `test/projection-noproject.test.mjs` (N392, K573). That suite drove the no-project
 * conclusion end to end; its retrieval share is how R5's single-bundle answer carries what a later module registers, and
 * that the list form carries none of it. What the conclusion itself says (its equality with `op=basisversions`) is
 * basis-versions' R11 share, tested there; the old suite's §4 read source text and is dropped (P7). The decoration here is
 * the test's own, registered under a module name as inquiry and basis-versions register theirs, over real promoted
 * bundles of the old suite's four kinds: an inquiry concluded, one concluded the legacy way, one still open, and two
 * non-inquiries (an information bundle and a project). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, md, T0 } from "./fixture.mjs";
import { normalizeType } from "../../../checks/bio-checks.mjs";

const has = (o, k) => !!o && typeof o === "object" && Object.prototype.hasOwnProperty.call(o, k);
const inquiry = (id, state) => md({ id, object_type: "inquiry", schema: "inquiry@1",
  title: "Was the sewer transfer booked before the council met?", current_state: state,
  prior_state: state === "open" ? null : "open", created: T0, last_updated: T0, group: "test-group" },
  "\n## Question\n\nWas it?\n");

const ACTED = "INQ-2026-4144-concluded-by-the-act", LEGACY = "INQ-2026-4144-concluded-in-bytes";
const OPEN = "INQ-2026-4144-still-open", LEDGER = "INFO-2026-4144-ledger";

/* A world holding the old suite's bundles, and a decoration that answers, per inquiry and viewer, a conclusion object
   (non-null and long, so equality is never two nulls agreeing) and null, key present, for everything else. `calls`
   records every call, so the list form is seen never to reach it. */
function decorated() {
  const w = world({ members: ["ann", "ruth", "mia"] });
  w.doc(LEDGER);
  for (const [id, state] of [[ACTED, "concluded"], [LEGACY, "concluded"], [OPEN, "open"]]) {
    const head = w.row(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, id);
    const r = w.promotion.promote({ bundleId: id, base: head ? head.bundle_sha : null, snapKey: `${id}-${state}`,
      author: V("ann"), files: [{ path: "bundle.md", text: inquiry(id, state) }], meta: { object_type: "inquiry" } });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  }
  const proj = w.project("Oversight", "ann");
  const calls = [];
  const answers = new Map();
  const conclusionOf = (row, viewer) => ({ relationship: "no_project", project: null, relationship_established: false,
    claim: { state: row.bundle_id === ACTED ? "adopted" : "undetermined",
             text: "The ledger shows the transfer was booked before the council met.", version: "booked early" },
    conclusion: `concluded: ${row.bundle_id}`, read_as: viewer, stated: "x".repeat(200) });
  const reg = w.retrieval.registerProjectionDecoration("inquiry", (row, ctx) => {
    calls.push({ id: row.bundle_id, ctx });
    const v = normalizeType(row.object_type) === "inquiry" && row.current_state === "concluded"
      ? conclusionOf(row, ctx.viewer) : null;
    answers.set(`${row.bundle_id}|${ctx.viewer}`, JSON.stringify(v));
    return { no_project_conclusion: v };
  });
  assert.equal(reg.ok, true);
  return { w, proj, calls, answers };
}

test("R5, R56: a registered decoration's answer is carried on the single-bundle answer byte for byte, per viewer, called with the row and {viewer, nowMs}", () => {
  const { w, calls, answers } = decorated();
  for (const viewer of [V("ruth"), V("mia"), MACHINE]) {
    for (const [id, state] of [[ACTED, "adopted"], [LEGACY, "undetermined"]]) {
      const p = w.retrieval.projection({ bundleId: id, viewer, nowMs: 1234 });
      assert.deepEqual([p.bundle_id, p.current_state], [id, "concluded"], "the row is the concluded inquiry");
      assert.equal(has(p, "no_project_conclusion"), true);
      assert.equal(p.no_project_conclusion.claim.state, state, "non-null, so equality is not two nulls agreeing");
      assert.equal(JSON.stringify(p.no_project_conclusion), answers.get(`${id}|${viewer}`), "byte-identical to what the owner answered");
      assert.ok(JSON.stringify(p.no_project_conclusion).length > 200);
      assert.equal(p.no_project_conclusion.read_as, viewer, "each viewer's answer is its own");
      const last = calls[calls.length - 1];
      assert.deepEqual([last.id, last.ctx.viewer, last.ctx.nowMs], [id, viewer, 1234]);
    }
  }
});

test("R5, R56: a decoration answering a key with null leaves the key present and null: an open inquiry and non-inquiries", () => {
  const { w, proj } = decorated();
  const o = w.retrieval.projection({ bundleId: OPEN, viewer: V("ruth") });
  assert.deepEqual([o.bundle_id, o.current_state, has(o, "no_project_conclusion"), o.no_project_conclusion],
    [OPEN, "open", true, null]);
  for (const id of [LEDGER, proj]) {
    const r = w.retrieval.projection({ bundleId: id, viewer: V("ann") });
    assert.deepEqual([r.bundle_id, has(r, "no_project_conclusion"), r.no_project_conclusion], [id, true, null], id);
  }
});

test("R5, R56: no decoration reaches the list form, paged or filtered, and the list holds the decorated bundles", () => {
  const { w, calls } = decorated();
  const before = calls.length;
  const page = w.retrieval.projection({ viewer: V("ann"), limit: 100 });
  const ids = page.bundles.map((b) => b.bundle_id);
  assert.deepEqual([ids.includes(ACTED), ids.includes(LEGACY), ids.length >= 5], [true, true, true],
    "absence is not an empty page");
  assert.deepEqual(page.bundles.filter((b) => has(b, "no_project_conclusion")).map((b) => b.bundle_id), []);
  const small = w.retrieval.projection({ viewer: V("ann"), limit: 2 });
  const next = w.retrieval.projection({ viewer: V("ann"), limit: 2, after: small.cursor });
  assert.equal([...small.bundles, ...next.bundles].some((b) => has(b, "no_project_conclusion")), false, "nor any page");
  const filtered = w.retrieval.projection({ viewer: V("ann"), jsonPath: "$.current_state", jsonEquals: "concluded" });
  assert.deepEqual(filtered.bundles.map((b) => b.bundle_id).sort(), [ACTED, LEGACY].sort());
  assert.equal(filtered.bundles.some((b) => has(b, "no_project_conclusion")), false);
  assert.equal(calls.length, before, "the list form never calls a decoration");
});

test("R5, R56: a hidden or absent bundle answers null before any decoration runs; a decoration that rejects adds nothing", async () => {
  const { w, proj, calls } = decorated();
  const before = calls.length;
  assert.equal(w.retrieval.projection({ bundleId: proj, viewer: V("mia") }), null, "hidden answers as absent");
  assert.equal(w.retrieval.projection({ bundleId: "NO-SUCH", viewer: V("mia") }), null);
  assert.equal(w.retrieval.projection({ bundleId: ACTED, viewer: null }), null, "no viewer sees nothing");
  assert.equal(calls.length, before, "no decoration saw a row the viewer may not see");
  w.retrieval.registerProjectionDecoration("ai-runs", async () => { throw new Error("unreadable run"); });
  const p = await w.retrieval.projection({ bundleId: ACTED, viewer: V("ruth") });
  assert.equal(p.bundle_id, ACTED);
  assert.equal(p.no_project_conclusion.claim.state, "adopted", "the other decorations still apply");
  assert.equal(has(p, "surfaced_in"), false, "the rejecting one adds no key");
});

/* basis-versions: the single-bundle projection's `no_project_conclusion` (R42), registered with retrieval (its R56).
 *
 * Carried from the old battery's `test/projection-noproject.test.mjs` (N392, K573, K593). Its §1 is this module's share:
 * `op=projection`'s `no_project_conclusion` equals `op=basisversions`' (R11) byte for byte, per viewer, non-null (so
 * equality is never two nulls agreeing), over an inquiry concluded by the act naming its reading (claim adopted) and one
 * concluded in its own bytes the legacy way (claim undetermined); and the adopted answer's content (§7.1 items 5, 6).
 * Its §2's null, key present, for an open inquiry and two non-inquiries is carried too, since that null is this
 * module's answer. Retrieval carried §2–§3 at its own interface (RETRIEVAL #5); §4 read source text and is not carried
 * (tests check behaviour at the interface). Here the retrieval is the real one, handed to the factory as the plane's
 * host hands it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, inqMd, V, MACHINE } from "./fixture.mjs";

const LEDGER = "INFO-2026-4144-ledger";
const ACTED = "INQ-2026-4144-concluded-by-the-act", LEGACY = "INQ-2026-4144-concluded-in-bytes";
const OPEN = "INQ-2026-4144-still-open";
const T = "2026-09-27T00:00:00Z", RUTH = "member:ruth";
const CLAIM = "The ledger shows the transfer was booked before the council met.";
const READING = "booked early";
const ACCEPTED = { state: "accepted", claim: CLAIM, state_by: RUTH, state_at: T, state_reason: "" };
const has = (o, k) => !!o && typeof o === "object" && Object.prototype.hasOwnProperty.call(o, k);

function setup() {
  const w = world({ withRetrieval: true });
  w.doc(LEDGER);
  w.member("ruth"); w.member("mia");
  const lines = block(merge(version(READING, [LEDGER], ACCEPTED), { basis: [{ target: LEDGER, role: "supports" }], refs: [LEDGER] }));
  for (const id of [ACTED, OPEN]) assert.equal(w.inquiry(id, lines, { author: RUTH }).ok, true, id);
  const legacy = w.promotion.promote({ bundleId: LEGACY, base: null, snapKey: "legacy", author: RUTH,
    meta: { object_type: "inquiry" },
    files: [{ path: "bundle.md", text: inqMd(LEGACY, [...block({ basis: [{ target: LEDGER, role: "supports" }], refs: [LEDGER] }),
      'conclusion: "The legacy transfer was authorised."', 'falsifier: "a rescinding minute"'], { state: "concluded" }) }] });
  assert.equal(legacy.ok, true, JSON.stringify(legacy).slice(0, 300));
  const c = w.bv.conclude({ target: ACTED, conclusion: "It was booked before the meeting.",
    falsifier: "a booking entry dated after the meeting", version: READING, author: RUTH, viewer: V("ruth"), identity: RUTH });
  assert.deepEqual([c.ok, c.relationship, c.claim?.state, c.claim?.text], [true, "no_project", "adopted", CLAIM],
    "the fixture is real: the act concluded ACTED with no project, adopting its reading's claim");
  const proj = w.project("Oversight", "ruth", [ACTED]);
  return { w, proj };
}

const VIEWERS = [V("ruth"), V("mia"), MACHINE];

test("R42, R11, R23: op=projection's single-bundle no_project_conclusion is byte-identical to op=basisversions' for the same viewer, non-null, adopted for a conclusion by the act and undetermined for one in the question's own bytes", () => {
  const { w } = setup();
  for (const viewer of VIEWERS) {
    for (const [id, state] of [[ACTED, "adopted"], [LEGACY, "undetermined"]]) {
      const p = w.retrieval.projection({ bundleId: id, viewer });
      const v = w.bv.basisVersions({ id, viewer, limit: 50 });
      assert.deepEqual([p?.bundle_id, p?.current_state], [id, "concluded"], `${viewer} · ${id}: the row is the concluded inquiry`);
      assert.deepEqual([has(p, "no_project_conclusion"), p.no_project_conclusion?.claim?.state, v.no_project_conclusion?.claim?.state],
        [true, state, state], `${viewer} · ${id}: present and non-null on both reads`);
      assert.equal(JSON.stringify(p.no_project_conclusion), JSON.stringify(v.no_project_conclusion), `${viewer} · ${id}: byte-identical`);
      assert.ok(JSON.stringify(p.no_project_conclusion).length > 200, "a whole answer, not two nulls agreeing");
      assert.equal(JSON.stringify(p.no_project_conclusion), JSON.stringify(w.bv.noProjectConclusionOf(id)), "R23's answer");
    }
  }
});

test("R42, R23: the adopted answer says what §7.1 items 5 and 6 say — no project, relationship not established, the reading's claim verbatim; the legacy one is undetermined and never back-filled", () => {
  const { w } = setup();
  const a = w.retrieval.projection({ bundleId: ACTED, viewer: V("mia") }).no_project_conclusion;
  assert.deepEqual([a.relationship, a.project, a.relationship_established, a.state, a.claim, a.conclusion, a.falsifier],
    ["no_project", null, false, "concluded", { state: "adopted", text: CLAIM, version: READING },
     "It was booked before the meeting.", "a booking entry dated after the meeting"]);
  const l = w.retrieval.projection({ bundleId: LEGACY, viewer: V("mia") }).no_project_conclusion;
  assert.deepEqual([l.relationship, l.claim.state, l.claim.text, l.claim.version, l.conclusion],
    ["no_project", "undetermined", null, null, "The legacy transfer was authorised."]);
});

test("R42, R11: null, key present, for an open inquiry and for non-inquiries (an information bundle, a project), as op=basisversions answers the open one", () => {
  const { w, proj } = setup();
  for (const viewer of VIEWERS) {
    const o = w.retrieval.projection({ bundleId: OPEN, viewer });
    assert.deepEqual([o.bundle_id, o.current_state, has(o, "no_project_conclusion"), o.no_project_conclusion,
                      w.bv.basisVersions({ id: OPEN, viewer }).no_project_conclusion], [OPEN, "open", true, null, null]);
    for (const id of [LEDGER, proj]) {
      if (id === proj && viewer === V("mia")) continue;   /* a project is seen by its members; mia has not joined */
      const r = w.retrieval.projection({ bundleId: id, viewer });
      assert.deepEqual([r.bundle_id, has(r, "no_project_conclusion"), r.no_project_conclusion], [id, true, null], `${viewer} · ${id}`);
    }
  }
});

test("R42, R11, R33: a viewer who may not see the inquiry gets no row from op=projection and no conclusion from op=basisversions; the decoration itself answers that viewer null, as R11 does", () => {
  const { w } = setup();
  for (const viewer of [null, "nobody", "member:"]) {
    assert.equal(w.retrieval.projection({ bundleId: ACTED, viewer }), null, `${viewer}: an invisible bundle answers as an absent one`);
    assert.equal(w.bv.basisVersions({ id: ACTED, viewer }).no_project_conclusion, null);
    const row = w.row(`SELECT bundle_id, object_type FROM bundles WHERE bundle_id=?`, ACTED);
    assert.deepEqual(w.bv.projectionDecoration(row, { viewer }), { no_project_conclusion: null });
  }
  const row = w.row(`SELECT bundle_id, object_type FROM bundles WHERE bundle_id=?`, ACTED);
  assert.equal(JSON.stringify(w.bv.projectionDecoration(row, { viewer: V("ruth") }).no_project_conclusion),
    JSON.stringify(w.bv.basisVersions({ id: ACTED, viewer: V("ruth") }).no_project_conclusion));
  assert.deepEqual(w.bv.projectionDecoration(null, { viewer: V("ruth") }), { no_project_conclusion: null }, "never throws");
});

test("R42: registered once, under `basis-versions` — retrieval refuses a second registration by that name — and a host that hands no retrieval registers nothing", () => {
  const { w } = setup();
  const again = w.retrieval.registerProjectionDecoration("basis-versions", () => ({}));
  assert.deepEqual([again.ok, again.reason, again.module], [false, "DECORATION_DECLARED", "basis-versions"]);
  const bare = world();
  assert.equal(bare.retrieval, null);
  assert.equal(typeof bare.bv.projectionDecoration, "function");
});

test("R42: the list form carries no no_project_conclusion, paged or filtered, though it holds the concluded inquiries", () => {
  const { w } = setup();
  const page = w.retrieval.projection({ viewer: V("ruth"), limit: 100 });
  const ids = (page.bundles || []).map((b) => b.bundle_id);
  assert.deepEqual([ids.includes(ACTED), ids.includes(LEGACY)], [true, true]);
  assert.deepEqual((page.bundles || []).filter((b) => has(b, "no_project_conclusion")), []);
  const f = w.retrieval.projection({ viewer: V("ruth"), jsonPath: "$.current_state", jsonEquals: "concluded" });
  assert.deepEqual([(f.bundles || []).map((b) => b.bundle_id).sort(), (f.bundles || []).some((b) => has(b, "no_project_conclusion"))],
    [[ACTED, LEGACY].sort(), false]);
});

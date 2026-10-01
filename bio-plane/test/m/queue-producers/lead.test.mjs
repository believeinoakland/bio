/* The out-of-inquiry lead (R2's lead, R9's take-up, R10) at feedItems' interface, converted from `leadslug.test.mjs`'s
   queue-producers share (`build/jobs/T17/legacy-tests.md`): the lead's MEASURED basis entry in all three states (and both
   undetermined reasons), its `basis_entry` fields, the subject and basis it names, its age, and its homes under the
   question it bears on. capture-requests and provenance are fakes in their published shapes (capture-requests R26,
   provenance R4); the record's bundles and the two basis projections (inquiry R40, connections R58) are real tables. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const INQ_A = "INQ-2026-4100-was-0042-bid", INQ_B = "INQ-2026-4200-how-many-held";
const req = (request, extra = {}) => ({ request, run: "RUN-pl15", target: INQ_A, lead_inquiry: INQ_B,
  address: `https://records.example.gov/contracts/${request}.pdf`, host: "records.example.gov", purpose: "investigate",
  ua_mode: "civicos", capture_sha: `sha-${request}`, captured_at: iso(NOW - 60000),
  attribution: { ok: true, actor: "token:daemon", statement: "the daemon captured this at the session's request" }, ...extra });

function leads(requests, homes = {}) {
  const w = world({ captureRequests: { leads: () => ({ requests: requests() }) },
                    provenance: { homeOf: (sha) => (homes[sha] ? { bundleId: homes[sha] } : null) } });
  w.bundle(INQ_A, "inquiry"); w.bundle(INQ_B, "inquiry");
  w.bundle("PRJ-A", "project"); w.bundle("PRJ-B", "project");
  w.cite("PRJ-A", INQ_A); w.cite("PRJ-B", INQ_B);
  return w;
}
const leadsIn = (r) => r.items.filter((i) => i.kind === "out-of-inquiry-lead");

test("R2: the lead's basis entry is MEASURED in every state: undetermined (no digest, or no register entry), absent (looked for, part of no case), present (carried by a reading)", () => {
  const rows = [req("CR-1"), req("CR-2", { capture_sha: null }), req("CR-3"), req("CR-4"), req("CR-5")];
  const w = leads(() => rows, { "sha-CR-1": "INF-1", "sha-CR-4": "INF-4", "sha-CR-5": "INF-5" });
  w.bundle("INF-1"); w.bundle("INF-4"); w.bundle("INF-5");
  w.leg("INQ-2026-4400-other", "INF-4");                               // a reading carries INF-4
  w.run(`INSERT INTO inquiry_basis_version_legs (bundle_id, name, ord, target_id) VALUES ('INQ-X','v1',0,'INF-5')`);
  const m = byId(w.read(null, "class:admin"));
  const be = (id) => m[`FINDING::out-of-inquiry-lead::${id}`].basis.basis_entry;
  assert.deepEqual((({ state, reason, bundle_id, bundle_state, basis_legs, version_legs }) =>
    [state, reason, bundle_id, bundle_state, basis_legs, version_legs])(be("CR-1")),
    ["absent", "not_made_part_of_the_case", "INF-1", "collected", 0, 0], "a COUNT of both projections, both zero, never an empty field");
  assert.deepEqual([be("CR-2").state, be("CR-2").reason, be("CR-2").basis_legs, be("CR-2").version_legs],
    ["undetermined", "no_capture_sha", null, null], "no digest: nothing to ask about, which is not 'part of nothing'");
  assert.deepEqual([be("CR-3").state, be("CR-3").reason, be("CR-3").bundle_id], ["undetermined", "unregistered_capture", null],
    "no register entry: undetermined, and stated");
  assert.deepEqual([be("CR-4").state, be("CR-4").reason, be("CR-4").basis_legs > 0], ["present", "carried_by_a_reading", true],
    "the same field flips to present with the count that made it so");
  assert.deepEqual([be("CR-5").state, be("CR-5").basis_legs, be("CR-5").version_legs], ["present", 0, 1],
    "a proposed reading's leg is a case too: both projections are asked");
  assert.equal(leadsIn(w.read(null, "class:admin")).length, 5, "every state is still an item: it records an observation somebody made");
  assert.deepEqual(new Set(Object.values(m).filter((i) => i.kind === "out-of-inquiry-lead").map((i) => i.basis.basis_entry.state)),
    new Set(["absent", "undetermined", "present"]));
});

test("R2, R10: the lead names both questions apart, its source, request, run, address and both principals, is aged from its capture, and is homed under the question it bears on, never the one being worked", () => {
  const w = leads(() => [req("CR-1"), req("CR-9", { captured_at: "not an instant" })], { "sha-CR-1": "INF-1" });
  w.bundle("INF-1");
  const r = w.read(null, "class:admin");
  const lead = byId(r)["FINDING::out-of-inquiry-lead::CR-1"];
  assert.deepEqual([lead.class, lead.kind], ["FINDING", "out-of-inquiry-lead"]);
  assert.deepEqual(lead.subject, { kind: "capture_request", id: "CR-1", inquiry: INQ_B,
    address: "https://records.example.gov/contracts/CR-1.pdf", capture_sha: "sha-CR-1", bundle_id: "INF-1" });
  assert.deepEqual([lead.basis.source, lead.basis.request, lead.basis.run, lead.basis.address, lead.basis.found_while_working, lead.basis.bears_on],
    ["capture_requests", "CR-1", "RUN-pl15", "https://records.example.gov/contracts/CR-1.pdf", INQ_A, INQ_B]);
  assert.deepEqual([lead.basis.attribution.ok, lead.basis.attribution.actor.startsWith("token:"), typeof lead.basis.attribution.statement],
    [true, true, "string"], "both principals, through the one composer (DEC-27(b))");
  assert.ok(/BOTH QUESTIONS ARE NAMED/.test(lead.basis.detail), "R10: the derivation is named");
  assert.deepEqual(lead.age, { state: "determined", since: iso(NOW - 60000), ms: 60000 }, "from the capture's own instant");
  assert.deepEqual([byId(r)["FINDING::out-of-inquiry-lead::CR-9"].age.state, byId(r)["FINDING::out-of-inquiry-lead::CR-9"].age.reason],
    ["undetermined", "unparseable_captured_at"]);
  assert.deepEqual([lead.case.ancestors.map((a) => a.id), lead.case.ungrouped], [["PRJ-B"], false],
    "inquiry B's project: a real home, not ungrouped");
  assert.ok(!JSON.stringify(lead).includes("PRJ-A"), "inquiry A's project appears nowhere in the item");
  assert.deepEqual(w.asked.homes.filter((s) => s.includes(INQ_A)), [], "the walk is never asked from inquiry A");
});

test("R2: a row whose attribution cannot be composed mints no lead, and the producer reads only what capture-requests answers the viewer", () => {
  let asked = null;
  const w = world({ captureRequests: { leads: (a) => { asked = a; return { requests: [req("CR-1", { attribution: { ok: false } }), req("CR-2")] }; } } });
  w.member("dave");
  const r = w.read("dave");
  assert.deepEqual(asked, { viewer: "member:dave" }, "the viewer is capture-requests' to gate by (its R26)");
  assert.deepEqual(leadsIn(r).map((i) => i.id), ["FINDING::out-of-inquiry-lead::CR-2"]);
});

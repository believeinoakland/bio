/* instance-setup's published fixtures (`fixtures.mjs`), each called here and compared with the answer the real module gives
   (the fixture rule, K4990), and the contract values other modules hold for what this module answers (FIX-L, K5044 (5)): each is
   stated as data and run against the real code, so a user's hand-built value must equal it. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "./fixture.mjs";
import { assistantState, instanceGroupAnswer, selftestAnswer, fleetReports, bootstrapFacts } from "./fixtures.mjs";
import { NO_GROUP_RECORDED, BOOTSTRAP_FACT_KEYS } from "../../../src/setup.mjs";

test("fixture bootstrapFacts (R95): the real seven facts of an instance set up by real acts, the team named and the counts as the caller states", async () => {
  const f = await bootstrapFacts();
  assert.deepEqual(Object.keys(f).sort(), [...BOOTSTRAP_FACT_KEYS].sort());
  assert.equal(f.team_name, "River Town");
  assert.equal(Date.parse(f.installed_at), Date.parse("2026-10-10T08:00:00Z"), "installed when the running release was first seen");
  assert.equal(Date.parse(f.last_used_at), Date.parse("2026-10-14T17:45:00Z"), "the newest of the three held sessions");
  assert.deepEqual([f.count_projects, f.count_documents, f.count_published, f.count_members], [2, 5, 1, 3]);
});

test("fixture bootstrapFacts (R95): the team name and each count are the ones the caller states, and a count of none is 0, never null", async () => {
  const f = await bootstrapFacts({ team: "Oak Hill", members: 5, projects: 1, documents: 0, published: 0 });
  assert.equal(f.team_name, "Oak Hill");
  assert.deepEqual([f.count_projects, f.count_documents, f.count_published, f.count_members], [1, 0, 0, 5]);
});

test("fixture assistantState: the real answer while the group keeps nothing away and while it keeps its material away", async () => {
  const { notKept, kept } = await assistantState();
  assert.deepEqual(notKept, { ok: true, on: true, set_by: null, set_at: null, reason: null });
  assert.deepEqual([kept.ok, kept.on, kept.reason], [true, false, "We hold tenants' medical letters; none of it may leave our own Civicsmith."]);
  assert.ok(typeof kept.set_by === "string" && kept.set_by && typeof kept.set_at === "string" && kept.set_at);
  assert.deepEqual(Object.keys(kept).sort(), ["ok", "on", "reason", "set_at", "set_by"]);
});

test("fixture instanceGroupAnswer: {ok, group} for a recorded group, {ok, group: null, detail} for none", async () => {
  const { recorded, none } = await instanceGroupAnswer();
  assert.deepEqual(recorded, { ok: true, group: "river-town" });
  assert.deepEqual(none, { ok: true, group: null, detail: NO_GROUP_RECORDED });
});

test("fixture selftestAnswer: a copy whose store binding is not bound is not healthy, its STORE binding false, answered at 500", async () => {
  const r = await selftestAnswer();
  assert.equal(r.status, 500);
  assert.equal(r.ok, false);
  assert.equal(r.bindings.STORE, false);
  assert.equal(r.bindingsAllPresent, false);
  assert.match(r.store, /^ERR /);
  assert.equal(JSON.stringify(r).includes("a-live-admin-token-0123456789"), false, "never returns a secret");
});

test("fixture fleetReports: the real bootstrap body of each lag case installer reads", async () => {
  const r = await fleetReports();
  for (const k of ["serving", "silent", "misnamed", "unbound", "storeVersionAbsent"]) assert.equal(r[k].status, 200, k);
  assert.deepEqual(Object.values(r.serving.memberVersions).map((v) => v.state), ["SERVING", "SERVING", "SERVING", "SERVING", "SERVING", "SERVING"]);
  assert.equal(r.serving.storeVersion, "store-7");
  assert.deepEqual([r.silent.memberVersions["pdf-worker"].state, r.silent.memberVersions["ocr-worker"].state], ["SILENT", "SILENT"]);
  assert.deepEqual(r.misnamed.memberVersions["pdf-worker"], { binding: "PDF_WORKER", state: "MISNAMED", name: "ocr-worker", version: "o-1" });
  assert.deepEqual(r.unbound.memberVersions["ocr-worker"], { binding: "OCR_WORKER", state: "UNBOUND" });
  assert.equal("storeVersion" in r.storeVersionAbsent, false);
  assert.equal("memberVersions" in r.withoutMembers, false);
  assert.equal(r.withoutMembers.storeVersion, "store-7");
});

/* The public group identity of a store that recorded no group: public-read holds the registered `identity()` it is handed and answers it as given
   (its R34), so the value is this module's. `logo` is part of the real answer. */
// fixtures-run: public-read group-identity-public
test("contract group-identity-public: the answer of groupIdentityPublic() with no group recorded", async () => {
  const w = await boot({ env: {} });
  assert.deepEqual(w.m.groupIdentityPublic(), { ok: true, group: null, display_name: null, domain: null, domain_verified_at: null, logo: false,
                                                detail: NO_GROUP_RECORDED });
});

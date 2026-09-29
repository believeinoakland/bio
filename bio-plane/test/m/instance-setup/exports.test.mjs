/* instance-setup's exports the installer imports (N234, installer R30), and R17's member reads, at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { GROUP_SLUG_RE, FLEET_BINDINGS, memberVersions } from "../../../src/setup.mjs";

test("the slug grammar: 3 to 40 of a-z, 0-9 and '-', beginning and ending with a letter or digit (Terms; R2, R4)", () => {
  for (const ok of ["abc", "a-b", "oakland-group", "0ab", "a".repeat(40), "a1-2-3z"]) assert.ok(GROUP_SLUG_RE.test(ok), ok);
  for (const bad of ["", "ab", "a".repeat(41), "-ab", "ab-", "Abc", "a_b", "a b", "ab\n", "é-ab", "abc.d"])
    assert.ok(!GROUP_SLUG_RE.test(bad), JSON.stringify(bad));
});

test("the fleet's member binding names: one pair per member, each name a binding the plane reads (R17)", () => {
  assert.deepEqual(FLEET_BINDINGS, [["agent-worker", "AGENT_WORKER"], ["pdf-worker", "PDF_WORKER"], ["ocr-worker", "OCR_WORKER"]]);
});

const answering = (body, status = 200) => ({ fetch: async () => new Response(JSON.stringify(body), { status }) });

test("R17 members=1: each member's own /version through its binding: SERVING, UNBOUND, SILENT, MISNAMED", async () => {
  const seen = [];
  const env = {
    AGENT_WORKER: { fetch: async (url, init) => { seen.push([url, init.method]); return new Response(JSON.stringify({ name: "agent-worker", version: "1.2.3" })); } },
    PDF_WORKER: answering({ name: "ocr-worker", version: "9.9.9" }),
    // OCR_WORKER unbound
    VERSION: "plane-build",
  };
  const out = await memberVersions(env);
  assert.deepEqual(seen, [["https://agent-worker/version", "GET"]]);
  assert.deepEqual(out["agent-worker"], { binding: "AGENT_WORKER", state: "SERVING", version: "1.2.3" });
  assert.deepEqual(out["pdf-worker"], { binding: "PDF_WORKER", state: "MISNAMED", name: "ocr-worker", version: "9.9.9" });
  assert.deepEqual(out["ocr-worker"], { binding: "OCR_WORKER", state: "UNBOUND" });
  const silent = await memberVersions({
    AGENT_WORKER: answering({ name: "agent-worker" }),              // no version
    PDF_WORKER: answering({ name: "pdf-worker", version: "1" }, 500), // not ok
    OCR_WORKER: { fetch: async () => { throw new Error("connection refused"); } },
  });
  for (const m of ["agent-worker", "pdf-worker", "ocr-worker"]) assert.equal(silent[m].state, "SILENT", m);
  assert.match(silent["ocr-worker"].why, /connection refused/);
});

test("R17 members=1: a member that does not answer within 4 seconds reads SILENT", { timeout: 10000 }, async () => {
  const t0 = Date.now();
  const out = await memberVersions({ AGENT_WORKER: { fetch: () => new Promise(() => {}) } });
  const took = Date.now() - t0;
  assert.equal(out["agent-worker"].state, "SILENT");
  assert.match(out["agent-worker"].why, /within 4000 ms/);
  assert.ok(took >= 3900 && took < 6000, `took ${took} ms`);
});

/* admission, G83 (fix round 7 of T51; K4746, K4747): the team's room is obtained through runtime-limits' `storeStub`, so its
   first `get()` carries the location hint the binding names and its name carries the generation. Driven at this module's
   interface, through the two Worker-side paths that reach the room (`sourceOf`, `securityTally`), with a recording
   `env.STORE` that keeps every `idFromName` name and every `get` argument as the platform receives them. */
import { test } from "node:test";
import assert from "node:assert/strict";

const A = await import("../../../src/admission/index.mjs");

const ADDRESS = "203.0.113.9";

/* A namespace that records what `get` is handed. The reply is the door's contract for `doorwindow` (a string source). */
function recordingEnv(extra = {}) {
  const names = [];
  const gets = [];
  const STORE = {
    idFromName(name) { names.push(name); return { name }; },
    get(id, ...rest) {
      gets.push({ name: id.name, args: [...rest] });
      return {
        fetch: async () => new Response(JSON.stringify({ ok: true, answered: true, result: { source: "fp-g83" } }),
          { headers: { "content-type": "application/json" } }),
      };
    },
  };
  return { env: { STORE, ...extra }, names, gets };
}

const reqFrom = () => new Request("https://plane.example/api", { method: "POST", headers: { "cf-connecting-ip": ADDRESS } });
const RATE_REFUSAL = { ok: false, reason: "DOOR_RATE_LIMITED" };

test("G83 (R21): with STORE_LOCATION set, the room is obtained with that hint on the request path that reaches it", async () => {
  const { env, gets } = recordingEnv({ STORE_LOCATION: "wnam" });
  assert.equal(await A.sourceOf(reqFrom(), env), "fp-g83");
  assert.equal(gets.length, 1);
  assert.equal(gets[0].name, "bio");
  assert.deepEqual(gets[0].args, [{ locationHint: "wnam" }]);
});

test("G83 (R22): the security count reaches the room with the same hint, named by its logical name", async () => {
  const { env, gets } = recordingEnv({ STORE_LOCATION: "enam" });
  const counted = await A.securityTally({ op: "invitelook", answer: RATE_REFUSAL, presented: null, req: reqFrom(), env });
  assert.deepEqual(counted, { kind: "rate", country: null });
  const counts = gets.filter((g) => g.name === "bio");
  assert.equal(counts.length, 1);
  assert.deepEqual(counts[0].args, [{ locationHint: "enam" }]);
});

test("G83 (R21, R22): STORE_GENERATION names the room `bio~g<n>` for the object only, and the hint still reaches it", async () => {
  const { env, names, gets } = recordingEnv({ STORE_LOCATION: "wnam", STORE_GENERATION: "2" });
  await A.sourceOf(reqFrom(), env);
  assert.deepEqual(names, ["bio~g2"]);
  assert.equal(gets[0].name, "bio~g2");
  assert.deepEqual(gets[0].args, [{ locationHint: "wnam" }]);
});

test("G83 (R21): with neither binding, every call is today's: the room `bio` with no second argument", async () => {
  const { env, names, gets } = recordingEnv();
  assert.equal(await A.sourceOf(reqFrom(), env), "fp-g83");
  assert.deepEqual(names, ["bio"]);
  assert.equal(gets.length, 1);
  assert.equal(gets[0].name, "bio");
  assert.deepEqual(gets[0].args, [], "no second argument is passed to get()");
});

test("G83 (R21): a location hint outside the allow-list is not passed (no hint, as today)", async () => {
  for (const bad of ["bogus", "", "WNAM", " wnam"]) {
    const { env, gets } = recordingEnv({ STORE_LOCATION: bad });
    await A.sourceOf(reqFrom(), env);
    assert.deepEqual(gets[0].args, [], `STORE_LOCATION ${JSON.stringify(bad)}`);
  }
});

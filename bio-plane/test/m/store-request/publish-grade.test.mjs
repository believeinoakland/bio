/* store-request R25: every op graded as `publish` is stamped `author` (and, for an agent, `aiCred`) as `publishpreflight` is. The set
   is read from the declarations (publish's spec and capability, `author` declared), never listed here; `publishcheck` is its control. */
import "../../sandbox.mjs";
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { storeWorld, WORLD_TOKENS } from "./fixtures.mjs";
import { innerRequest, QUERY_STAMPS } from "../../../src/store-request/index.mjs";
import { OPS, NEEDS, OP_STAMPS } from "../../../src/op-declarations/index.mjs";

let C = {};
before(async () => {
  const w = await storeWorld();
  const founder = await w.signIn("admin");
  const ruth = await w.signIn("ruth", { capabilities: ["contribute"] });
  const minted = await w.door({ url: "/api/?op=aicredentialmint", init: { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ tokenId: "bot1", principalKind: "organisation", writes: [] }) } }, founder);
  C = { founder: await w.admitted(founder.token), member: await w.admitted(ruth.token), ai: await w.admitted(minted.json.result.token),
        admin: await w.admitted(WORLD_TOKENS.ADMIN_TOKEN), probe: await w.admitted(WORLD_TOKENS.PROBE_TOKEN) };
});
const FORGED = "FORGED";
const make = (op, c) => innerRequest({ op, url: `http://h/api/?${new URLSearchParams({ op, token: "t", ...Object.fromEntries(QUERY_STAMPS.map((k) => [k, FORGED])) })}`,
                                       method: "POST", body: JSON.stringify({ author: FORGED }), caller: c });
const Q = (r) => new URL(r.url).searchParams;
const gradedAsPublish = () => Object.keys(OPS).filter((op) => NEEDS[op] === "publish" && (OP_STAMPS[op] || []).includes("author")
  && JSON.stringify(OPS[op]) === JSON.stringify(OPS.publish));

test("R25: the ops graded as publish are those of publish's spec and capability that declare `author`, and include publishcheck", () => {
  const set = gradedAsPublish();
  assert.ok(set.includes("publishcheck"), set.join());
});

test("R25: for the founder, a member, an administrator token and a probe, every op graded as publish carries publishpreflight's author, a forged one dropped", () => {
  for (const kind of ["founder", "member", "admin", "probe"]) for (const op of gradedAsPublish()) {
    const want = Q(make("publishpreflight", C[kind])).get("author");
    assert.notEqual(want, FORGED); assert.ok(want, kind);
    assert.equal(Q(make(op, C[kind])).get("author"), want, `${kind} ${op}`);
  }
  assert.equal(Q(make("publishcheck", C.member)).get("author"), C.member.member, "a member: the bare member id, not member:<id>");
});

test("R25: an agent's op graded as publish carries aiCred as publishpreflight does; a caller that is no agent carries none", () => {
  const want = Q(make("publishpreflight", C.ai));
  assert.deepEqual(JSON.parse(want.get("aiCred")), { tokenId: C.ai.aiCred.tokenId, principal: C.ai.aiCred.principal });
  for (const op of gradedAsPublish()) {
    const got = Q(make(op, C.ai));
    assert.equal(got.get("aiCred"), want.get("aiCred"), op);
    assert.equal(got.get("author"), want.get("author"), op);
    for (const kind of ["founder", "member", "admin", "probe"]) assert.equal(Q(make(op, C[kind])).has("aiCred"), false, `${kind} ${op}`);
  }
});

test("R25: the walker's case in a world: the project's owner, holding the publish capability, is answered by the pre-flight on `publishcheck` as on `publishpreflight`, never NOT_THE_PROJECT_OWNER; nothing is held for a target that is no finding", async () => {
  const w = await storeWorld();
  const owner = await w.signIn("admin");
  const project = await w.recipes.project(owner, "Walker's project");
  const held = await w.recipes.hold(owner, "Minutes", "the council met on a Tuesday", project);
  const ask = (op, as) => w.door({ url: `/api/?op=${op}&project=${project}`, init: { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ project, targets: [held.bundle], roles: { [held.bundle]: "load_bearing" }, scope: "s", statement: "It does not cover the amendments.",
      subjectPosition: "not_sought", subjectJustification: "A public record.", biasAcknowledgement: "Ours.", excluded: [], author: "FORGED" }) } }, as);
  const pre = (await ask("publishpreflight", owner)).json.result;
  const check = (await ask("publishcheck", owner)).json.result;
  assert.equal(pre.first.reason, "NOT_AN_INQUIRY", "control: the owner reaches the pre-flight's own blocker");
  assert.notEqual(check.reason, "NOT_THE_PROJECT_OWNER");
  assert.deepEqual([check.reason, check.first, check.held, check.ok], [pre.first.reason, pre.first, false, false]);
  const sql = w.sql.exec("SELECT COUNT(*) AS n FROM case_checks").toArray()[0].n;
  assert.equal(sql, 0, "no check is recorded for a blocked pre-flight");
});

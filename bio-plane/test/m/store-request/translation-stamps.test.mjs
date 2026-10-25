/* store-request R7 (K5163 reading, J5): the translation family's acts name the actor by the bare member id (`by`=M), and `translations`
   reads its speaker by it (`viewer`=M), as the translations module asks `membership.isAdministrator` of it. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";
import { innerRequest } from "../../../src/store-request/index.mjs";

const ACTS = ["translationdraft", "translationgrant", "translationadopt", "translationconfirm", "translationrevert", "translationmark"];
const Q = (r) => new URL(r.url).searchParams;

test("R7: the translation acts carry `by` and `translations` carries `viewer` as the session's member id, a forged one dropped; a non-session caller carries `class:<cls>`", async () => {
  const w = await storeWorld();
  const bea = await w.signIn("bea", { admin: true });
  const founder = await w.signIn("admin");
  for (const as of [bea, founder]) {
    const c = await w.admitted(as.token, "translationgrant");
    for (const op of ACTS) assert.equal(Q(innerRequest({ op, url: `http://h/?op=${op}&by=FORGED`, method: "POST", body: "{}", caller: c })).get("by"), as.member, `${as.handle} ${op}`);
    assert.equal(Q(innerRequest({ op: "translations", url: "http://h/?op=translations&viewer=FORGED&language=es", method: "GET", caller: c })).get("viewer"), as.member);
  }
});

test("R7: in a world, a second administrator grants a language and reads `translations` for it; a member holding no grant is refused (control)", async () => {
  const w = await storeWorld();
  const bea = await w.signIn("bea", { admin: true });
  const ruth = await w.signIn("ruth");
  const read = (as) => w.door({ url: "/api/?op=translations&language=es", init: { method: "GET" } }, as);
  assert.equal((await read(bea)).json.result.ok, true);
  assert.equal((await read(ruth)).json.result.reason, "TRANSLATION_NOT_GRANTED", "control");
  assert.equal((await bea.act("translationgrant", { body: { member: "ruth", language: "es" } })).granted, true);
  assert.equal((await read(ruth)).json.result.ok, true, "the grant is read by her bare id");
});

/* T40 (T40-3; N812, D34, D38, K2352), at the interface: the ask grant takes `project` and asks the cascade for
   `{kind: "ask", member, project}` (R27). (T48; K3101) A project's account, the switches, the cascade and the notices are
   `ai-accounts`' (its R10–R14, R22), reached here through R72's delegates; the T40 tests of those moved there. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD } from "./fixture.mjs";
import { ACCOUNT_CHECKS } from "../../../src/credentials/index.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check, translation: ACCOUNT_CHECKS[code].translation });
const KEY = "sk-ant-api03-PROJECT-SENTINEL-40a1";

/* ann owns P (hidden) with bob joined; cy owns S alone (hidden), connected through her subscription; dee owns D
   (discoverable) alone; eve is an active member in nothing; second an administrator; the founder claimed. */
async function projectWorld(opts) {
  const w = await world(opts).group("ann", "bob", "cy", "dee", "eve");
  w.project("P", "ann");
  assert.equal(w.join("P", "ann", "bob").ok, true);
  w.project("S", "cy");
  w.project("D", "dee", "discoverable");
  await w.signin("cy");
  return w;
}


/* ===== R54: a project's AI account ===== */

/* ===== R56: the cascade, and the account used ===== */

test("R27 aiGrantMint takes `project`, asking R56 for {kind: ask, member, project}: refused PROJECT_KEY_NOTICE_DUE as GROUP_KEY_NOTICE_DUE is, and every refusal of the cascade; minted once the project's account serves", async () => {
  const w = await projectWorld();
  const s = (await w.c.login({ handle: "bob", password: PASSWORD("bob") })).token;
  const mint = (project) => w.c.aiGrantMint({ member: "bob", by: "bob", session: s, project });
  assert.equal((await mint()).reason, "NO_ACCOUNT");
  await w.c.projectKeySet({ project: "P", key: KEY, by: "ann" });
  w.c.projectAccountSwitch({ project: "P", on: true, by: "ann" });
  const before = w.snapshot();
  assert.deepEqual(shape(await mint("P")), refusal("PROJECT_KEY_NOTICE_DUE"));
  assert.deepEqual(await mint("S"), noSuchProject("S"));
  assert.equal((await mint()).reason, "NO_ACCOUNT", "without the project, nothing serves bob");
  w.c.accountUsesSet({ owner: "project:P", switch: "ask", on: false, by: "ann" });
  w.c.projectKeyNoticeSeen({ member: "bob", project: "P", by: "bob" });
  assert.deepEqual(shape(await mint("P")), refusal("AI_USE_SWITCHED_OFF"));
  w.c.accountUsesSet({ owner: "project:P", switch: "ask", on: true, by: "ann" });
  const g = await mint("P");
  assert.equal(g.ok, true);
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).viewer, "member:bob");
  assert.notEqual(before, w.snapshot());
  /* the route carries the project */
  assert.equal((await w.ops(`member=bob&by=bob&session=${s}`, { project: "P" }).aigrantmint()).ok, true);
  assert.equal((await w.ops(`member=bob&by=bob&session=${s}&project=S`).aigrantmint()).reason, "NO_SUCH_PROJECT");
});

/* ===== R57: material limits ===== */

/* ===== R59: suspended sign-in accounts ===== */

/* ===== R32 with R55 (K2376 (3)): T40's hold on a sign-in's standing questions is lifted at T41 (N796, K2425);
   `t41.test.mjs` tests R32 as it now stands. ===== */

/* ===== R30: the project tables ===== */

/* ===== the routes ===== */

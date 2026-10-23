/* control-plane R40, G42 (K4635, K4638), platform check (L): `op=stats` through the whole plane in Miniflare's real Worker and
   Store (the `host-governor/ops.test.mjs` pattern). The object's measured size is a real, non-zero figure that grows with a
   1 MB insert; the admin binding and the founder read it exact, an administering member's session reads it floored to a whole
   100,000,000 B, and an ordinary member's and the probe's answer carries none. */
import "../../sandbox.mjs";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const T = { admin: "cp-adm", probe: "cp-prb" };
const GRAIN = 100_000_000;
let mf;
const S = {};
const call = async (q, tok, body) => {
  const headers = tok === undefined ? {} : { authorization: `Bearer ${tok}` };
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body ?? {}), headers });
  const j = await res.json();
  return (j && typeof j === "object" && "result" in j) ? j.result : j;
};

before(async () => {
  mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: T.admin, PROBE_TOKEN: T.probe, VERSION: "test" },
    outboundService() { return new Response("unscripted", { status: 500 }); },
  });
  const enrol = async (id, role, capabilities) => {
    const add = await call("op=memberadd", T.admin, { memberId: id, cover: `cover for ${id}`, role, capabilities });
    if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
    const en = await call("op=enroll", undefined, { invite: add.invite, handle: id, password: `${id}-passphrase-cp` });
    if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
    const lg = await call("op=login", undefined, { handle: id, password: `${id}-passphrase-cp` });
    if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
    return lg.token;
  };
  S.ruth = await enrol("ruth", "admin", ["contribute"]);
  await enrol("gus", "admin", ["contribute"]);   /* a group's second member is an administrator */
  S.cai = await enrol("cai", "member", ["contribute"]);
  const claimed = await call("op=claim", undefined, { bootstrapToken: T.admin, password: "founder-passphrase-cp" });
  if (!claimed?.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
  const fl = await call("op=login", undefined, { handle: "admin", password: "founder-passphrase-cp" });
  if (!fl?.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
  S.founder = fl.token;
});
after(async () => { if (mf) await mf.dispose(); });

test("R40, G42 (L): the real object's `dbBytes` is non-zero and grows across a 1 MB insert; the admin binding and the founder read it exact, an administering member floored to 100,000,000 B, a member and the probe none", async () => {
  const before = await call("op=stats", T.admin);
  assert.ok(Number.isInteger(before.dbBytes) && before.dbBytes > 0, `a measured size: ${before.dbBytes}`);
  /* nine leads of 126 KiB each (under the cap): about 1.1 MB of rows */
  for (let i = 0; i < 9; i++) {
    const lead = await call("op=lead", S.cai, { words: `${i} ${"minutes rewritten after the vote. ".repeat(4000)}`.slice(0, 126 * 1024) });
    assert.ok(lead?.lead_id, `lead ${i}: ${JSON.stringify(lead).slice(0, 200)}`);
  }
  const after = await call("op=stats", T.admin);
  assert.ok(after.dbBytes - before.dbBytes >= 1_000_000, `grew by ${after.dbBytes - before.dbBytes}`);
  const founder = await call("op=stats", S.founder);
  assert.equal(founder.dbBytes, after.dbBytes, "the founder reads the exact figure");
  const ruth = await call("op=stats", S.ruth);
  assert.equal(ruth.dbBytes, Math.floor(after.dbBytes / GRAIN) * GRAIN, "an administering member reads it floored");
  assert.equal(ruth.dbBytes % GRAIN, 0);
  assert.equal("dbBytes" in await call("op=stats", S.cai), false, "a member none");
  assert.equal("dbBytes" in await call("op=stats", T.probe), false, "the probe none");
});

/* unruled-op-fixture.mjs — REC-155. A plane with ONE mutating op that no session reaches and no decision
 * explains, built IN MEMORY from `src/index.mjs` and never written to disk.
 *
 * WHY IT EXISTS. Until REC-155 the session gate's third sentence — `SESSION_ROUTE_NOT_RECORDED` (C-38.8),
 * *"no signed-in session reaches this operation, and no decision on record says why"* — had seven live
 * producers: `provenancechain`, `provenanceroute`, the three calibration writes, `livefire` and `reproject`.
 * BOB #19 RULED all seven (`BIO_Membership_Architecture_v2.md` §4.10), so on the real plane that sentence has
 * NO live producer today. It is still the answer the plane owes the next op somebody adds without a ruling
 * (`UNATTENDED_BY_DECISION`'s header), and a branch no suite drives is a mechanism believed on its existence.
 * So the suites that grade C-38.8 drive it HERE: the real gate, the real catalogue row, one op the real
 * tables have never heard of — exactly the state of an op added tomorrow.
 *
 * WHAT IT CHANGES, AND NOTHING ELSE: one row inserted at the top of `OPS`. The patch must match exactly once
 * or this throws, so a fixture that failed to arm cannot be read as a plane that answered. */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const UNRULED_OP = "rec155unruled";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ANCHOR = "const OPS = {\n";

export function unruledOpSource() {
  const src = readFileSync(SRC, "utf8");
  const at = src.split(ANCHOR).length - 1;
  if (at !== 1) throw new Error(`unruled-op fixture: anchor ${JSON.stringify(ANCHOR)} matched ${at} times, not 1`);
  return src.replace(ANCHOR, `${ANCHOR}  ${UNRULED_OP}: { classes: ["admin", "member", "probe"], mutating: true },\n`);
}

export function unruledOpPlane(bindings) {
  return new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: unruledOpSource(),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    bindings,
  });
}

/* A signed-in member of that plane: two administrators first (§4.2/4.3), then the member. */
export async function unruledOpMemberSession(mf, adminToken) {
  const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json();
  const enrol = async (id, role, caps) => {
    const add = await POST(`op=memberadd&token=${adminToken}`,
      { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
    if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
    const en = await POST("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
    if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
    const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
    if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
    return "token=" + lg.result.token;
  };
  await enrol("uadm1", "admin", ["contribute"]);
  await enrol("uadm2", "admin", ["contribute"]);
  return enrol("umem", "member", ["contribute"]);
}

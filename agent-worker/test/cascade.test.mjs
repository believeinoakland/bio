/* R32, R33, R6, R10, R29, R36, R57 — WHICH CLAUDE ACCOUNT SERVES THE ACT, driven pure AND through the endpoint (K1502,
 * K1755: the member's own reference, or the group's API key, each serving one member's act). `src/cascade.mjs` is the
 * one judgement of the account that arrived, at its own level; this suite walks it as a plain module first, then hands
 * accounts to `POST /run` under miniflare and asserts what travels on the wire: the account named at its level without
 * its secret, an absent, bad or revoked one refused by name before any plane call, and the run's recorded member and
 * the member whose act the account serves refusing to differ, at either level.
 *
 * NEGATIVE CONTROL: `test/cascade.control.mjs` was written against the three-level cascade (K1429) and its arms name
 * source lines T33-57 removed; it is stale until re-armed against this file (recorded in the job's record). The arms
 * this suite must fail on, if re-armed: the published-value check in `levelState` removed (section 1's revoked arm,
 * section 4's published case); the `RUN_NAMES_A_DIFFERENT_PAYER` guard removed (section 5); `accountOf`'s NO_ACCOUNT
 * refusal removed (section 4).
 */
import "../../bio-plane/test/sandbox.mjs";

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
  const resolved = createRequire(planePkg).resolve("miniflare");
  return await import(pathToFileURL(resolved).href);
})();

import {
  CASCADE_ORDER, CASCADE_NO_ACCOUNT, LEVEL_UNSET, LEVEL_REVOKED, LEVEL_AVAILABLE, ACCOUNT_KINDS,
  resolveClaudeCascade, cascadeToken,
} from "../src/cascade.mjs";
import { meaningRowsBranch } from "./plane-meaning.mjs";

const WORKER_SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC = readFileSync(WORKER_SRC, "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* A value GENUINELY on the denylist, read from the file that put it there —
   DS-3's own discipline: a fabricated "published" value would test the test. */
const PUBLISHED_VALUE = readFileSync(
  fileURLToPath(new URL("../../bio-plane/dist/SECRETS.txt", import.meta.url)), "utf8")
  .split("\n").find((l) => l.startsWith("ADMIN_TOKEN=")).split("=")[1].trim();

const KEY = "sk-ant-member-key-fixture-never-echoed";
const TOKEN = "sk-ant-oat-member-subscription-fixture-never-echoed";
const RUTH = "member:ruth", SAM = "member:sam";
const apikey = (member = RUTH, secret = KEY) => ({ kind: "apikey", level: "member", secret, member });
const sub = (member = RUTH, secret = TOKEN) => ({ kind: "subscription", level: "member", secret, member });
/* K1755: the group's API key, as `credentials.accountFor` answers it for a member's act (its R35). */
const GROUP_KEY = "sk-ant-group-key-fixture-never-echoed";
const group = (member = RUTH, secret = GROUP_KEY) => ({ kind: "apikey", level: "group", secret, member });
const states = (st) => st.levels.map((l) => `${l.level}:${l.state}`);

console.log("\n--- 1 · R32: the cascade judges the one account that arrived, at its own level, pure ---");
{
  t("R32: the levels are the member's own and the group's API key, and nothing else (K1502, K1755: no project or "
    + "instance level)", [...CASCADE_ORDER], ["member", "group"]);
  t("R32: the kinds are agent-model's: apikey and subscription", [...ACCOUNT_KINDS], ["apikey", "subscription"]);
  const a = await resolveClaudeCascade(apikey());
  t("R32: an API key of the member's own is available, with its kind and its member",
    [a.available, a.level, a.kind, a.member, states(a)], [true, "member", "apikey", RUTH, [`member:${LEVEL_AVAILABLE}`]]);
  const s = await resolveClaudeCascade(sub());
  t("R32: a subscription token of the member's own is available as a subscription", [s.available, s.kind], [true, "subscription"]);
  for (const [why, acct] of [["absent", undefined], ["empty secret", apikey(RUTH, "")], ["another kind", { kind: "oauth", secret: KEY, member: RUTH }],
                             ["the old cascade's shape", { member: { token: KEY } }],
                             ["an account naming no level", { kind: "apikey", secret: KEY, member: RUTH }],
                             ["an account at the project level", { ...apikey(), level: "project" }]]) {
    const n = await resolveClaudeCascade(acct);
    t(`R32: ${why} is unset: NO_ACCOUNT at the member level`, [n.available, n.reason, n.level, states(n)],
      [false, CASCADE_NO_ACCOUNT, "member", [`member:${LEVEL_UNSET}`]]);
  }
  const g = await resolveClaudeCascade(group());
  t("R32 (K1755): the group's API key is available at the group level, for the member whose act it serves",
    [g.available, g.level, g.kind, g.member, states(g)], [true, "group", "apikey", RUTH, [`group:${LEVEL_AVAILABLE}`]]);
  for (const [why, acct, st] of [["an empty key", group(RUTH, ""), LEVEL_UNSET],
                                 ["a subscription (the group's account is an API key only)", { ...group(), kind: "subscription" }, LEVEL_UNSET],
                                 ["a published key", group(RUTH, PUBLISHED_VALUE), LEVEL_REVOKED]]) {
    const n = await resolveClaudeCascade(acct);
    t(`R32: the group's account with ${why} is NO_ACCOUNT at the group level (${st}), and nothing falls back to another`,
      [n.available, n.reason, n.level, states(n)], [false, CASCADE_NO_ACCOUNT, "group", [`group:${st}`]]);
  }
  const r = await resolveClaudeCascade(apikey(RUTH, PUBLISHED_VALUE));
  t("R32: a PUBLISHED secret is revoked by publication, a different fact from unset, and nothing falls through",
    [r.available, r.reason, states(r)], [false, CASCADE_NO_ACCOUNT, [`member:${LEVEL_REVOKED}`]]);
  t("R32: and the detail is a sentence a surface can render", typeof r.detail === "string" && r.detail.length > 80, true);
  t("R32: no status carries the secret", [a, s, g, r].some((x) => JSON.stringify(x).includes(KEY)
    || JSON.stringify(x).includes(TOKEN) || JSON.stringify(x).includes(GROUP_KEY) || JSON.stringify(x).includes(PUBLISHED_VALUE)), false);
  t("R32: no status names a project or instance level", [a, s, g, r].some((x) => /project|instance/.test(JSON.stringify(x.levels))), false);
}

console.log("\n--- 2 · R33: the reference, derived from the status, in agent-model's terms ---");
{
  t("R33: an API key becomes {kind: apikey, key}", await cascadeToken(apikey()),
    { level: "member", reference: { kind: "apikey", key: KEY } });
  t("R33: a subscription token becomes {kind: subscription, token} — used as a subscription, never as an API key (K1553)",
    await cascadeToken(sub()), { level: "member", reference: { kind: "subscription", token: TOKEN } });
  t("R33 (K1755): the group's API key becomes {kind: apikey, key} at the group level", await cascadeToken(group()),
    { level: "group", reference: { kind: "apikey", key: GROUP_KEY } });
  t("R33: null exactly when R32 does not resolve",
    [await cascadeToken(undefined), await cascadeToken(apikey(RUTH, "")), await cascadeToken(apikey(RUTH, PUBLISHED_VALUE)),
     await cascadeToken(group(RUTH, "")), await cascadeToken({ ...group(), kind: "subscription" })],
    [null, null, null, null, null]);
}

/* ================================================================ THE ENDPOINT
 * The mock's run record names its payer from the run id: `run-sam` was started by member:sam, every other run by
 * member:ruth — so R10's comparison is between two facts this suite controls. */
const AIK = "aik-" + "a".repeat(64);
const PLANE_MOCK = `
let LOG = [];
export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/__mock/state") return Response.json({ log: LOG });
    const op = url.searchParams.get("op") || "";
    const text = req.method === "POST" ? await req.text() : "";
    LOG.push({ op, q: url.search, method: req.method, body: text });
    if (op === "airun") {
      const run = url.searchParams.get("run");
      return Response.json({ ok: true, result: { run, found: true, session: {
        id: run, mode: "check", status: "running", max_passes: 1,
        context: { type: "inquiry", id: "INQ-1" },
        principal: { plane: "member:ruth", claude: run === "run-sam" ? "member:sam" : "member:ruth",
                     ref: null, skill: "investigative-session@1" },
        budget: [{ bound: "fetches", allowed: 50, consumed: 0 },
                 { bound: "subsessions", allowed: 50, consumed: 0 },
                 { bound: "wallclock", allowed: 500000, consumed: 0 },
                 { bound: "runtime", allowed: 5000, consumed: 0 }] } } });
    }
    if (op === "airunlog")
      return Response.json({ ok: true, result: { run: url.searchParams.get("run"), found: true,
        entries: [], limit: 200, truncated: false } });
    if (op === "airunspawn")
      return Response.json({ ok: true, result: { found: true, half: "search",
        payload: { run: url.searchParams.get("run"), mode: "check", skill: "pack-1.0.0",
                   context: { type: "inquiry", id: "INQ-1" }, standard_pair: null, budget: [] } } });
    ${meaningRowsBranch("[]")}
    if (op === "basisversions")
      return Response.json({ ok: true, result: { versions: [], limit: 50, truncated: false } });
    if (op === "whoami")
      return Response.json({ ok: true, result: {
        tokenClass: "ai", session: false, member: null, handle: null,
        administer: false, rootOfTrust: false, capabilities: null,
      }, store: url.searchParams.get("store"), tokenClass: "ai" });
    if (op === "airuntick")
      return Response.json({ ok: true, result: { ticked: true, appended: 1, status: "running" } });
    if (op === "airunclose")
      return Response.json({ ok: true, result: { terminated: true, bound: "completed" } });
    return Response.json({ ok: true, result: { wrote: true } });
  },
};
`;
const mf = new Miniflare({
  workers: [
    { name: "agent-worker", modules: true, modulesRoot: "/", scriptPath: WORKER_SRC, script: SRC,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { VERSION: "test" }, serviceBindings: { PLANE: "plane-mock" } },
    { name: "plane-mock", modules: true, script: PLANE_MOCK,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"] },
  ],
});
const run = (body) =>
  mf.dispatchFetch("http://agent-worker/run", { method: "POST", body: JSON.stringify(body) });
const planeLog = async () => (await (await (await mf.getWorker("plane-mock")).fetch("http://plane/__mock/state")).json()).log;
const base = { run_id: "run-ruth", store: "scratch", credential: AIK, judgements: [] };

console.log("\n--- 3 · R6, R29: through the endpoint, the member's account is NAMED on the wire, without its secret ---");
{
  const res = await run({ ...base, account: apikey() });
  t("R6: a run carrying its starter's own reference DRIVES", res.status, 200);
  const out = await res.json();
  t("R29: claude_account is {available: true, kind, level, member}, never the secret",
    out.claude_account, { available: true, kind: "apikey", level: "member", member: RUTH });
  t("R28: judgements supplied, so no model turn ran, and the answer says whose judgements they were",
    [out.turns_run, out.judgement_source], [0, "body"]);
  t("R36: no secret reaches the wire", JSON.stringify(out).includes(KEY), false);
  const gres = await run({ ...base, account: group() });
  const gout = await gres.json();
  t("R6, R29 (K1755): a run carrying the group's API key for its starter's act DRIVES, named at the group level, "
    + "for that member", [gres.status, gout.claude_account], [200, { available: true, kind: "apikey", level: "group", member: RUTH }]);
  t("R36: the group's key reaches no answer", JSON.stringify(gout).includes(GROUP_KEY), false);
}

console.log("\n--- 4 · R6, R57: no account, a bad one, or the retired cascade's field: refused by name, before any plane call ---");
{
  const before = (await planeLog()).length;
  const cases = [
    ["R6, R57: no account at all", { ...base }, 409, "NO_ACCOUNT"],
    ["R6: an account that is not a plain object", { ...base, account: "sk-ant-x" }, 400, "BAD_ACCOUNT"],
    ["R6: an account that is a list", { ...base, account: [apikey()] }, 400, "BAD_ACCOUNT"],
    ["R6: an account of a kind agent-model does not take", { ...base, account: { kind: "oauth", secret: KEY, member: RUTH } }, 400, "BAD_ACCOUNT"],
    ["R6: an account naming no member", { ...base, account: { kind: "apikey", level: "member", secret: KEY } }, 400, "BAD_ACCOUNT"],
    ["R6: an account naming no level", { ...base, account: { kind: "apikey", secret: KEY, member: RUTH } }, 400, "BAD_ACCOUNT"],
    ["R6: an account at the project level (there is none)", { ...base, account: { ...apikey(), level: "project" } }, 400, "BAD_ACCOUNT"],
    ["R6: the group's account as a subscription (the group's is an API key only)", { ...base, account: { ...group(), kind: "subscription" } }, 400, "BAD_ACCOUNT"],
    ["R6, R32: the group's account with an empty key is no account", { ...base, account: group(RUTH, "") }, 409, "NO_ACCOUNT"],
    ["R6, R32: the group's account with a published key is no account", { ...base, account: group(RUTH, PUBLISHED_VALUE) }, 409, "NO_ACCOUNT"],
    ["R6: a body still carrying claude_accounts", { ...base, account: apikey(), claude_accounts: { member: { token: KEY } } }, 400, "BAD_ACCOUNT"],
    ["R6, R32: an empty secret is no account", { ...base, account: apikey(RUTH, "") }, 409, "NO_ACCOUNT"],
    ["R6, R32: a published secret is no account", { ...base, account: apikey(RUTH, PUBLISHED_VALUE) }, 409, "NO_ACCOUNT"],
  ];
  for (const [label, body, status, code] of cases) {
    const res = await run(body);
    const out = await res.json();
    t(`${label}: ${status} ${code}`, [res.status, out.code, out.reason], [status, code, code]);
    if (code === "NO_ACCOUNT") t(`${label}: stated as the capability unavailable`, out.capability, "unavailable");
    if (body.claude_accounts) t(`${label}: naming the field`, out.field, "claude_accounts");
  }
  t("R6, R57: and not one of those calls reached the plane", (await planeLog()).length, before);
}

console.log("\n--- 5 · R10, R57: a run is continued only under the account of the member whose act started it ---");
{
  const res = await run({ ...base, run_id: "run-sam", account: apikey(RUTH) });
  t("R10: Ruth's reference on Sam's run is REFUSED", res.status, 409);
  const out = await res.json();
  t("R10: by name, naming both members (ids, never a secret)",
    [out.reason, out.recorded, out.supplied, JSON.stringify(out).includes(KEY)],
    ["RUN_NAMES_A_DIFFERENT_PAYER", SAM, RUTH, false]);
  const log = await planeLog();
  const samCalls = log.filter((c) => c.q.includes("run=run-sam") || c.body.includes("run-sam"));
  t("R57: before any step: the refused run was read, and nothing was written to it",
    samCalls.map((c) => c.op), ["airun"]);
  const own = await run({ ...base, run_id: "run-sam", account: apikey(SAM) });
  t("R10 (control): Sam's own reference on Sam's run drives", own.status, 200);
  const subRun = await run({ ...base, account: sub() });
  t("R10 (control): a subscription token of the starter's own drives too, named as one",
    (await subRun.json()).claude_account, { available: true, kind: "subscription", level: "member", member: RUTH });
  const gRes = await run({ ...base, run_id: "run-sam", account: group(RUTH) });
  const gOut = await gRes.json();
  t("R10, R57 (K1755): the group's API key serving Ruth's act, on Sam's run, is REFUSED the same way: the group key serves "
    + "a member's act, never the group's own", [gRes.status, gOut.reason, gOut.recorded, gOut.supplied, JSON.stringify(gOut).includes(GROUP_KEY)],
    [409, "RUN_NAMES_A_DIFFERENT_PAYER", SAM, RUTH, false]);
  const gOwn = await run({ ...base, run_id: "run-sam", account: group(SAM) });
  t("R10, R57 (control): the group's API key serving Sam's own act on Sam's run drives, still Sam's act",
    [gOwn.status, (await gOwn.json()).claude_account], [200, { available: true, kind: "apikey", level: "group", member: SAM }]);
}

console.log("\n--- 6 · R36: the reference is spent here and travels NOWHERE: no plane call carries it ---");
{
  const all = JSON.stringify(await planeLog());
  t("R36: no secret of any reference ever reached the plane, in any call this suite made",
    [KEY, TOKEN, GROUP_KEY, PUBLISHED_VALUE].some((v) => all.includes(v)), false);
}
await mf.dispose();

console.log(`\ncascade: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

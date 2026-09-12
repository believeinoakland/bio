/* FL-6 — THE CLAUDE-ACCOUNT CASCADE AT RUNTIME, driven pure AND through the
 * endpoint. `src/cascade.mjs` is the one expression of Bob's order (member →
 * project → instance) and of the per-level judgement; this suite walks it as a
 * plain module first, then hands material to `POST /run` under miniflare and
 * asserts what travels on the wire: the resolved level named, every level's
 * own absence stated, no secret anywhere, and the record's payer and the
 * runtime's resolution refusing to disagree.
 *
 * NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/cascade.control.mjs` —
 * deliberately NOT a `.test.mjs`, because it edits real sources while it runs
 * (fleetbundles' precedent, one tree over). ALL FOUR ARMS RUN 2026-09-12 IN
 * WORKTREE bio-worktrees/FLEET, each armed ALONE, restores verified by content
 * AND sha256, tallies below MEASURED rather than predicted. **BASELINE
 * 29 pass / 0 fail, exit 0** before each arm.
 *   (1) THE ARM FL-6's ROW NAMES — remove the named-UNAVAILABLE refusal (the
 *       `!cascade.available` guard in `src/index.mjs` flipped so exhausted
 *       material drives on) -> **26 pass, 3 FAIL, exit 1**: section 7's three
 *       arms by name — the refusal, the named reason, the per-level statement.
 *       An empty success is indistinguishable from a run that found nothing,
 *       which is the sentence this item exists to make false. The pure-resolver
 *       arms held: the resolver still answered honestly; the ENDPOINT stopped
 *       saying so, and only the endpoint's arms went red.
 *   (2) THE DENYLIST NEUTERED (`levelState` in `src/cascade.mjs` stops asking
 *       the published question) -> **20 pass, 9 FAIL, exit 1** — the largest
 *       arm because publication-is-revocation is load-bearing at every
 *       altitude: section 2's fall-through pair, section 3's named reason,
 *       per-level statement and renderable detail, section 4's derived-token
 *       refusal, and section 7's three endpoint arms all went red together.
 *   (3) THE PAYER-CONSISTENCY CHECK REMOVED (the `RUN_NAMES_A_DIFFERENT_PAYER`
 *       guard deleted) -> **26 pass, 3 FAIL, exit 1**: exactly section 6 — the
 *       409, its name, and the two facts it must carry. Sections 5 and 7 held,
 *       as declared: an agreeing pair and an empty cascade have nothing to
 *       disagree about.
 *   (4) OVER-STRICTNESS — every fixture in this file is legitimate traffic and
 *       the baseline is the arm: **29 pass, 0 fail, exit 0**, with the
 *       judgements-supplied caller (no material at all) still answering 200,
 *       because a caller that offered no accounts is not a caller whose
 *       cascade exhausted.
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
  CASCADE_ORDER, CASCADE_NO_ACCOUNT, LEVEL_UNSET, LEVEL_REVOKED, LEVEL_AVAILABLE,
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

const MEMBER_TOK = "sk-ant-member-fixture-value-never-echoed";
const PROJECT_TOK = "sk-ant-project-fixture-value-never-echoed";
const INSTANCE_TOK = "sk-ant-instance-fixture-value-never-echoed";
const ALL = {
  member: { token: MEMBER_TOK, ref: "ruth@believe-in-oakland" },
  project: { token: PROJECT_TOK, ref: "believe-in-oakland/claude" },
  instance: { token: INSTANCE_TOK, ref: "instance" },
};
const states = (st) => st.levels.map((l) => `${l.level}:${l.state}`);

console.log("\n--- 1 · the resolver, pure: Bob's order, one expression ---");
{
  t("the order IS member → project → instance, and nothing else may restate it",
    [...CASCADE_ORDER], ["member", "project", "instance"]);

  const m = await resolveClaudeCascade(ALL);
  t("all three supplied -> the MEMBER's account pays, and its ref travels",
    [m.available, m.level, m.ref], [true, "member", "ruth@believe-in-oakland"]);
  t("and every level's own state is still stated beside the resolution",
    states(m), ["member:available", "project:available", "instance:available"]);

  const p = await resolveClaudeCascade({ project: ALL.project, instance: ALL.instance });
  t("no member account -> the PROJECT's pays", [p.available, p.level], [true, "project"]);
  t("and the member level's absence is STATED as unset, not omitted",
    states(p)[0], `member:${LEVEL_UNSET}`);

  const i = await resolveClaudeCascade({ instance: ALL.instance });
  t("member and project absent -> the INSTANCE's pays", [i.available, i.level], [true, "instance"]);
  t("an empty string is the same case as absent (a blank config line is not an account)",
    (await resolveClaudeCascade({ member: { token: "" }, instance: ALL.instance })).level, "instance");
}

console.log("\n--- 2 · publication is revocation, and the cascade FALLS THROUGH a revoked level by name ---");
{
  const r = await resolveClaudeCascade({ member: { token: PUBLISHED_VALUE, ref: "r" }, project: ALL.project });
  t("a PUBLISHED member value is not an account: the project pays",
    [r.available, r.level], [true, "project"]);
  t("and the member level says WHY — revoked_by_publication, a different fact from unset",
    states(r), [`member:${LEVEL_REVOKED}`, "project:available", `instance:${LEVEL_UNSET}`]);
}

console.log("\n--- 3 · nothing resolves: an honest absence, STATED, per level ---");
{
  const n = await resolveClaudeCascade({ member: { token: "" }, project: { token: PUBLISHED_VALUE } });
  t("no level resolves -> available:false with the NAMED reason",
    [n.available, n.reason], [false, CASCADE_NO_ACCOUNT]);
  t("WHICH absence is stated at every level — unset and revoked are different facts",
    states(n), [`member:${LEVEL_UNSET}`, `project:${LEVEL_REVOKED}`, `instance:${LEVEL_UNSET}`]);
  t("and the detail is a sentence a surface can render, not a code to decode",
    typeof n.detail === "string" && n.detail.length > 80, true);
}

console.log("\n--- 4 · no secret in any status; status and token cannot disagree ---");
{
  const st = await resolveClaudeCascade(ALL);
  t("the STATUS carries no secret, so it is safe to log, publish, or record",
    [MEMBER_TOK, PROJECT_TOK, INSTANCE_TOK].some((v) => JSON.stringify(st).includes(v)), false);
  const tok = await cascadeToken(ALL);
  t("the token accessor answers the RESOLVED level's value, for the one spender",
    [tok.level, tok.token === MEMBER_TOK], ["member", true]);
  t("and it refuses whenever the status refuses — derived, not a second reading",
    await cascadeToken({ member: { token: PUBLISHED_VALUE } }), null);
}

/* ================================================================ THE ENDPOINT
 * The mock is the sibling suite's, cut to what these arms exercise, with ONE
 * addition the sibling does not need: `session.principal`, derived from the
 * run id (`run-member` names member, `run-project` project, …) — because
 * FL-6's consistency check compares the RECORD's payer with the runtime's
 * resolution, and a mock without a payer would make every comparison a
 * comparison with null. */
const AIK = "aik-" + "a".repeat(64);
const PLANE_MOCK = `
let LOG = [];
export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/__mock/state") return Response.json({ log: LOG });
    const op = url.searchParams.get("op") || "";
    LOG.push({ op, q: url.search, method: req.method });
    if (op === "airun") {
      const run = url.searchParams.get("run");
      const level = (run || "").split("-")[1] || "project";
      return Response.json({ ok: true, result: { run, found: true, session: {
        id: run, mode: "check", status: "running", max_passes: 1,
        context: { type: "inquiry", id: "INQ-1" },
        principal: { plane: "member:ruth", claude: level, ref: "fixture", skill: "investigative-session@1" },
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

console.log("\n--- 5 · through the endpoint: the resolved level is NAMED on the wire, beside the record's ---");
{
  const res = await run({ run_id: "run-project", store: "scratch", credential: AIK,
    claude_accounts: { project: ALL.project, instance: ALL.instance } });
  t("a run whose record names the resolved level DRIVES", res.status, 200);
  const out = await res.json();
  t("the response names WHICH level pays, with its ref",
    [out.claude_account?.available, out.claude_account?.level, out.claude_account?.ref],
    [true, "project", "believe-in-oakland/claude"]);
  t("and states every level beside it — the instance's availability included, because a level "
    + "the resolution did not reach is not a level whose fact is hidden",
    (out.claude_account?.levels || []).map((l) => `${l.level}:${l.state}`),
    [`member:${LEVEL_UNSET}`, "project:available", "instance:available"]);
  t("the honesty pair is intact: the account resolved, the model turn still did not run",
    [out.turns_run, out.judgement_source], [0, "supplied"]);
  t("no secret reaches the wire in either direction",
    [JSON.stringify(out).includes(PROJECT_TOK), JSON.stringify(out).includes(INSTANCE_TOK)],
    [false, false]);
}

console.log("\n--- 6 · the record's payer and the runtime's resolution refuse to disagree ---");
{
  /* The record (mock run-project) says PROJECT; the material resolves MEMBER. */
  const res = await run({ run_id: "run-project", store: "scratch", credential: AIK,
    claude_accounts: ALL });
  t("driving under a payer the record does not name is REFUSED", res.status, 409);
  const out = await res.json();
  t("by name", out.reason, "RUN_NAMES_A_DIFFERENT_PAYER");
  t("naming BOTH facts, so the reader knows which two disagree",
    [out.recorded, out.resolved], ["project", "member"]);
}

console.log("\n--- 7 · FL-6's OWN FIXTURE: every token removed -> the NAMED unavailable, never an empty success ---");
{
  const res = await run({ run_id: "run-project", store: "scratch", credential: AIK,
    claude_accounts: { member: { token: "" }, project: { token: PUBLISHED_VALUE } } });
  t("the response is a REFUSAL, not an empty success", res.status, 409);
  const out = await res.json();
  t("and it is the NAMED unavailable", [out.ok, out.reason, out.capability],
    [false, CASCADE_NO_ACCOUNT, "unavailable"]);
  t("with WHICH absence stated per level — the sentence a silent no-op could never say",
    (out.levels || []).map((l) => `${l.level}:${l.state}`),
    [`member:${LEVEL_UNSET}`, `project:${LEVEL_REVOKED}`, `instance:${LEVEL_UNSET}`]);
}

console.log("\n--- 8 · a caller that offered no accounts is a DIFFERENT fact, stated as its own absence ---");
{
  const res = await run({ run_id: "run-project", store: "scratch", credential: AIK });
  t("the judgements-supplied mode still drives", res.status, 200);
  const out = await res.json();
  t("and its absence is NAMED as no-material, distinct from an exhausted cascade",
    [out.claude_account?.available, out.claude_account?.reason],
    [false, "NO_ACCOUNT_MATERIAL_SUPPLIED"]);
}

console.log("\n--- 9 · the material is spent here and travels NOWHERE: no plane call carries it ---");
{
  const w = await mf.getWorker("plane-mock");
  const { log } = await (await w.fetch("http://plane/__mock/state")).json();
  const all = JSON.stringify(log);
  t("no Claude token value ever reached the plane, in any call this suite made",
    [MEMBER_TOK, PROJECT_TOK, INSTANCE_TOK].some((v) => all.includes(v)), false);
}
await mf.dispose();

console.log(`\ncascade: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

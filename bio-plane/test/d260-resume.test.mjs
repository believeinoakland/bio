/* NEGATIVE CONTROL: DECLARED HERE, RUN 2026-09-23 BY `test/d260-resume.control.mjs` (patches COPIES of `bio-plane/src` and `agent-worker/src`, so the battery never discovers it and the real sources are verified untouched by sha256 AND content; re-run from `bio-plane/`: `node test/d260-resume.control.mjs [arm]`). Baseline 22/0. (1) dispatch-every — THE ROW'S CONTROL, the gate hands every woken run over whenever the credential resolves -> MEMBER ARM 1, MEMBER ARM 2, OTHER-KEY ARM, the tick's named reasons, MEMBER ARM 3, the withheld-log arm and COUNT ARM fail BY NAME, 15/7. (2) member-prefix-only — a fence looser than the rule, withholding only member runs -> OTHER-KEY ARM, the named reasons, MEMBER ARM 3 and COUNT ARM, 18/4; its first declaration also named the withheld-log arm and that stayed GREEN, MEASURED: the other key's run was dispatched, agent-worker answered ok, and REC-152 refused every tick, so nothing landed — the liar the row names, visible only at the binding. (3) dispatch-none — the opposite defect -> the four INSTANCE arms, COUNT ARM and both REFUSED-DISPATCH arms, 15/7, every member arm green. (4) equal-by-compare — over-strictness, the same equality spelled differently -> nothing fails, 22/0. Every arm AS DECLARED.
 * =========================================================================
 * D-260 — A WOKEN RUN IS RE-ENTERED, AND ONLY UNDER THE CREDENTIAL THAT OPENED IT.
 *
 * `BIO_Assistant_and_AI_Roles_v0_1.md` §6, the D-260 paragraph (BOB #22, 2026-09-21): an instance MAY hold ONE
 * organisation-principal `ai` credential as a deploy secret and hand it to `agent-worker` to resume a woken run
 * THAT CREDENTIAL OPENED; a run a MEMBER's credential opened is never resumed by it — it keeps FL-4's behaviour and
 * the wake says it was not dispatched. FL-4's wake stamped `run_woken_at` and nothing dispatched the run.
 *
 * ACCEPTS-WHEN (the row): a run the instance credential opened RESUMES after its capture completes; a member's run
 * is NOT DISPATCHED AND SAYS SO.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: dispatch EVERY woken run and let REC-152
 * (C-22.12) refuse the member's run at its first tick. The member's run would still end up unticked, the record
 * would still look clean, and the group's key would have been handed a member's attributable run. So the member
 * arms count CALLS AT THE BINDING — `AGENT_WORKER` is a recorder that notes every request before forwarding it to
 * the real `agent-worker` — and never read the tick's outcome as evidence of non-dispatch.
 *
 * THE FIXTURE IS THE REAL PLANE AND THE REAL MEMBER. `index.mjs` and its Durable Object under miniflare, and
 * `agent-worker/src/index.mjs` as a second worker whose `PLANE` binding is that plane. The instance's organisation
 * credential is minted through the Durable Object's own mint surface with the SHA of a value the suite chose,
 * because the op generates its value server-side and a Worker secret is fixed when the Worker boots; the mint's
 * checks are the same function either way, and everything after it (the opens, the requests, the alarm, the
 * resumed run's calls back) goes through the control plane.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) the deploy half — install and update carrying `INSTANCE_AI_TOKEN` as a secret is
 * DIST's (`BIO_Distribution_v0_1.md` §6; BUILT by DIST-9, 2026-09-24 — this line said "not built" until then, which was
 * true of its day) and is tested in `newgroup/test/wizard.test.mjs` and `test/deploybindings.test.mjs`, not here; (ii) a live model turn — `agent-worker` still runs none
 * (`turns_run: 0`), so "resumes" here means the plane handed the run over and the member drove the run's table
 * against the record under the run's own credential; (iii) the `scratch` namespace's cross-object credential
 * lookup is exercised only by `#aiRunResumer`'s code path, not by an arm (scratch cannot mint an `ai` credential,
 * C-29.1, so no scratch run can carry an organisation stamp through the ops).
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the tree (bio-plane/src and agent-worker/src). */
const TREE = process.env.D260_TREE || fileURLToPath(new URL("../..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const IDX = join(TREE, "bio-plane", "src", "index.mjs");
const AW = join(TREE, "agent-worker", "src", "index.mjs");
const { instanceAiCredential, INSTANCE_AI_BINDING, INSTANCE_AI_UNSET, INSTANCE_AI_PUBLISHED, PUBLISHED_TOKEN_HASHES }
  = await import(join(TREE, "bio-plane", "src", "tokens.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* THE INSTANCE'S SECRET. Never printed: every assertion that touches it compares to a boolean. */
const INSTANCE_AI = "aik-" + sha("d260 instance organisation credential");
const OTHER_ORG = "aik-" + sha("d260 a second organisation credential");
const INSTANCE_CLAUDE = "sk-d260-instance-claude-account";
const ADM = "adm-d260", MEM = "mem-d260";

const CALLS = [];                       /* every request the plane made on AGENT_WORKER, as the binding saw it */
let MF;
const mf = new Miniflare({
  workers: [
    { name: "plane", modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
      modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      durableObjects: { STORE: { className: "Store", useSQLite: true } },
      r2Buckets: ["CAPTURES", "PUBLISHED"],
      bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-d260", DAEMON_TOKEN: "dmn-d260",
                  VERSION: "test", INSTANCE_NAME: "biosmoke-d260", GOVERNOR_APPETITE_PER_MIN: "600000",
                  CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000", TASK_DRAIN_DELAY_MS: "3600000",
                  [INSTANCE_AI_BINDING]: INSTANCE_AI, INSTANCE_CLAUDE_TOKEN: INSTANCE_CLAUDE },
      serviceBindings: {
        SELF: async (request) => MF.dispatchFetch(request),
        /* THE RECORDER. It notes the call BEFORE forwarding, so a dispatch the member later refuses is still a
           dispatch — which is the fact the member arms are about. */
        AGENT_WORKER: async (request) => {
          const text = await request.text();
          let body = null; try { body = JSON.parse(text); } catch { body = null; }
          const call = { url: request.url, method: request.method, body, answer: null };
          CALLS.push(call);
          const w = await MF.getWorker("agent-worker");
          const res = await w.fetch(request.url, { method: request.method, headers: request.headers, body: text });
          const out = await res.text();
          call.answer = { status: res.status, text: out };   /* paired with ITS call, never read by position */
          return new Response(out, { status: res.status, headers: { "content-type": "application/json" } });
        },
      },
      outboundService() {
        return new Response(new Uint8Array(2048).map((_, i) => (i * 17 + 3) % 256),
                            { headers: { "content-type": "application/pdf" } });
      } },
    { name: "agent-worker", modules: true, modulesRoot: "/", scriptPath: AW, script: readFileSync(AW, "utf8"),
      modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { VERSION: "test" }, serviceBindings: { PLANE: "plane" } },
  ],
});
MF = mf;
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {
  const ns = await mf.getDurableObjectNamespace("STORE", "plane");
  const obj = ns.get(ns.idFromName("bio"));
  const DO = async (p, body) => rP(await (await obj.fetch("http://x/" + p,
    body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

  const T0 = Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  const NOW = "2026-09-23T00:00:00Z";

  /* ------------------------------------------------------------------ FIXTURE */
  const add = await POST(`op=memberadd&token=${ADM}`,
    { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute", "publish"] });
  const en = await POST("op=enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
  if (!en.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
  const RUTH = (await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" })).token;
  if (!RUTH) throw new Error("login failed");

  const INQ = "INQ-2026-0923-d260-resume";
  const inquiryMd = ["---", `id: ${INQ}`, "object_type: inquiry", "schema: inquiry@1",
    `title: "What does ${INQ} rest on?"`, "current_state: open", "prior_state: null",
    `created: "${NOW}"`, `last_updated: "${NOW}"`, "produced_by:", "  mode: agent", "  capability_tier: high",
    "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "surfaced_by: agent",
    'disposition_reason: ""', "recheck_triggers:", "  - text: Revisit after the next budget cycle",
    "    description: The adopted budget may restate the transfer basis.", "---", "",
    "## Question", "", `What does ${INQ} rest on?`, "", "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "", `### Session ${NOW} | Formation | agent`,
    "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
  const pr = await POST(`op=promote&token=${RUTH}`, {
    bundleId: INQ, base: null, snapKey: `${INQ}-d260`,
    files: [{ path: "bundle.md", text: inquiryMd, bytes: inquiryMd.length, sha256: sha(inquiryMd) }],
    register: [], meta: { object_type: "inquiry", group: "believe-in-oakland",
                          current_state: "open", created: NOW, last_updated: NOW } });
  if (!pr.ok) throw new Error(`promote: ${JSON.stringify(pr).slice(0, 300)}`);

  const WRITES = ["airunopen", "airuntick", "airunclose", "capturerequest", "suggest"];
  const mintOrg = (tokenId, value) => DO(`aicredentialmint?who=ruth&secretSha=${sha(value)}`,
    { tokenId, principalKind: "organisation", taskScope: "investigative", writes: WRITES,
      note: "D-260 fixture: an organisation key" });
  const inst = await mintOrg("instance-org", INSTANCE_AI);
  const other = await mintOrg("other-org", OTHER_ORG);
  const memKey = await POST(`op=aicredentialmint&token=${RUTH}`, { tokenId: "ruth-agent", principalKind: "member",
    taskScope: "investigative", writes: WRITES, note: "D-260 fixture: ruth's own agent" });
  const RUTH_KEY = memKey?.token;
  t("FIXTURE: the instance's organisation credential, a second organisation credential and ruth's member key are "
    + "on the record, with the principals the mint composes",
    [inst?.credential?.principal, other?.credential?.principal, memKey?.credential?.principal, typeof RUTH_KEY],
    ["class:ai", "class:ai", "member:ruth", "string"]);

  const open = async (tok, run, principalClaude) => POST(`op=airunopen&token=${tok}`, {
    run, contextType: "inquiry", contextId: INQ, label: `D-260 fixture ${run}`, mode: "check",
    principalClaude, principalClaudeRef: principalClaude === "instance" ? "instance" : "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], at: iso(T0), leaseMs: 3600000 });
  const RUNS = {
    instance: { run: "RUN-2026-0923-d260-instance", tok: INSTANCE_AI, payer: "instance" },
    session:  { run: "RUN-2026-0923-d260-ruth-session", tok: RUTH, payer: "project" },
    memberKey:{ run: "RUN-2026-0923-d260-ruth-key", tok: RUTH_KEY, payer: "project" },
    otherOrg: { run: "RUN-2026-0923-d260-other-org", tok: OTHER_ORG, payer: "instance" },
  };
  let host = 0;
  for (const [k, r] of Object.entries(RUNS)) {
    const o = await open(r.tok, r.run, r.payer);
    if (o?.started !== true) throw new Error(`airunopen ${k}: ${JSON.stringify(o).slice(0, 300)}`);
    /* ONE HOST PER RUN, so the drain's per-host rule captures every request on the first alarm. */
    const q = await POST(`op=capturerequest&token=${r.tok}`, { target: INQ, run: r.run, purpose: "investigate",
      address: `https://www.d260-host-${host++}.example.gov/doc.pdf`, at: iso(T0) });
    if (q?.ok !== true) throw new Error(`capturerequest ${k}: ${JSON.stringify(q).slice(0, 300)}`);
    r.request = q.request;
  }
  const session = async (r) => ((await GET(`op=airun&token=${r.tok}&run=${r.run}`)) || {}).session || {};
  t("FIXTURE: each run's principal is the plane's stamp — the organisation keys' compared whole, the member's two "
    + "by member",
    [(await session(RUNS.instance)).principal?.plane, (await session(RUNS.session)).principal?.plane,
     (await session(RUNS.memberKey)).principal?.plane, (await session(RUNS.otherOrg)).principal?.plane],
    ["class:ai/instance-org", "member:ruth", "member:ruth/ruth-agent", "class:ai/other-org"]);

  const logOf = async (r) => ((await GET(`op=airunlog&token=${r.tok}&run=${r.run}&limit=500`)) || {}).entries || [];
  const callsFor = (r) => CALLS.filter((c) => c.body && c.body.run_id === r.run);

  /* ------------------------------------------------------------ THE ALARM */
  console.log("\n--- D-260 · one alarm: four captures complete, four runs woken, ONE dispatched ---");
  const a1 = await obj.onAlarm(T0 + 1000);
  const wakes = Object.fromEntries((a1.airunwake?.wakes || []).map((w) => [w.run, w]));
  console.log(`    alarm 1: captured=${a1.capturerequests?.captured?.length} woken=${a1.airunwake?.woken} `
    + `dispatched=${a1.airunwake?.dispatched} calls=${CALLS.length} `
    + `answers=${CALLS.map((c) => c.answer?.status).join(",")}`);
  t("FIXTURE ARMED: the drain captured all four requests and the wake woke all four runs on the same alarm — a "
    + "member arm over a run that was never woken would be free",
    [a1.capturerequests?.captured?.length, a1.airunwake?.woken,
     Object.values(RUNS).map((r) => wakes[r.run]?.woken)], [4, 4, [true, true, true, true]]);

  /* THE MEMBER ARMS — COUNTED AT THE BINDING. */
  t("MEMBER ARM 1 (a member's session run): NEVER DISPATCHED — zero calls at the binding name it",
    callsFor(RUNS.session).length, 0);
  t("MEMBER ARM 2 (a run her own `ai` key opened): NEVER DISPATCHED — the credential she minted is her, not the group",
    callsFor(RUNS.memberKey).length, 0);
  t("OTHER-KEY ARM: a run ANOTHER organisation key opened is not dispatched either — the instance resumes only the "
    + "runs IT opened, compared whole",
    callsFor(RUNS.otherOrg).length, 0);
  t("…and the tick's answer names each withheld resumption by its reason",
    [wakes[RUNS.session.run]?.resume, wakes[RUNS.memberKey.run]?.resume, wakes[RUNS.otherOrg.run]?.resume,
     wakes[RUNS.session.run]?.dispatch ?? null],
    ["MEMBER_PRINCIPAL_RUN", "MEMBER_PRINCIPAL_RUN", "NOT_THE_INSTANCE_CREDENTIALS_RUN", null]);
  const wakeEntry = async (r) => (await logOf(r)).find((e) => /the daemon answered/.test(String(e.detail || "")));
  t("MEMBER ARM 3 (SAYS SO): each member run's own wake entry states it was NOT dispatched and why, in the record",
    [/Resumption: NOT dispatched — a member's credential opened it/.test((await wakeEntry(RUNS.session))?.detail || ""),
     /Resumption: NOT dispatched — a member's credential opened it/.test((await wakeEntry(RUNS.memberKey))?.detail || ""),
     /Resumption: NOT dispatched — another principal opened it/.test((await wakeEntry(RUNS.otherOrg))?.detail || "")],
    [true, true, true]);
  t("MEMBER ARM 4 (FL-4 KEPT): a member's run is still running and still woken — the limitation is non-resumption, "
    + "never loss",
    [(await session(RUNS.session)).status, (await session(RUNS.memberKey)).status], ["running", "running"]);

  /* THE INSTANCE ARM — IT RESUMES. */
  const ic = callsFor(RUNS.instance);
  t("INSTANCE ARM 1: the run the instance credential opened is DISPATCHED exactly once, to POST /run, in its own "
    + "namespace, under THAT credential",
    [ic.length, ic[0]?.method, new URL(ic[0]?.url || "http://x/").pathname, ic[0]?.body?.store,
     ic[0]?.body?.credential === INSTANCE_AI],
    [1, "POST", "/run", "bio", true]);
  t("INSTANCE ARM 2: the dispatch hands `claude_accounts` its INSTANCE level, and that level alone",
    [Object.keys(ic[0]?.body?.claude_accounts || {}), ic[0]?.body?.claude_accounts?.instance?.token === INSTANCE_CLAUDE,
     ic[0]?.body?.claude_accounts?.instance?.ref], [["instance"], true, "instance"]);
  const aw = (() => { try { return JSON.parse(ic[0]?.answer?.text || "null"); } catch { return null; } })();
  t("INSTANCE ARM 3 (RESUMES): agent-worker accepted the run and drove it — its own answer, and the plane's tick "
    + "answer, agree it was dispatched",
    [aw?.ok, aw?.run_id, wakes[RUNS.instance.run]?.resume, wakes[RUNS.instance.run]?.dispatch?.state],
    [true, RUNS.instance.run, "DISPATCH", "DISPATCHED"]);
  t("COUNT ARM: the tick's own answer counts ONE dispatch over four woken runs, and the binding saw one call",
    [a1.airunwake?.dispatched, CALLS.length], [1, 1]);
  const ilog = await logOf(RUNS.instance);
  const wIdx = ilog.findIndex((e) => /the daemon answered/.test(String(e.detail || "")));
  t("INSTANCE ARM 4 (RESUMES, IN THE RECORD): after its wake entry the run's own log carries entries its resumed "
    + "segment wrote — the plane holds what the member did, not only that it was asked",
    [wIdx >= 0, ilog.length > wIdx + 1, /Resumption: handed to agent-worker/.test(ilog[wIdx]?.detail || "")],
    [true, true, true]);
  /* Asked by POSITION, not by count: the drain's own capture entry lands on each run too, so "grew by one" would
     be a claim about the drain. What must hold is that nothing follows the wake entry. */
  const tailAfterWake = async (r) => { const l = await logOf(r);
    const i = l.findIndex((e) => /the daemon answered/.test(String(e.detail || "")));
    return i < 0 ? -1 : l.length - 1 - i; };
  t("…and no withheld run's log carries anything after its wake entry — nothing drove them",
    [await tailAfterWake(RUNS.session), await tailAfterWake(RUNS.memberKey), await tailAfterWake(RUNS.otherOrg)],
    [0, 0, 0]);

  /* EXACTLY ONCE. */
  const n1 = CALLS.length;
  const a2 = await obj.onAlarm(T0 + 2000);
  t("EXACTLY ONCE: a second alarm wakes nothing and dispatches nothing — the stamp consumed the completion",
    [a2.airunwake?.woken ?? 0, CALLS.length - n1], [0, 0]);

  /* A DISPATCH THAT DOES NOT COMPLETE IS RECORDED. The instance key opens a run naming the PROJECT level as payer; the
     plane hands only the instance level, and agent-worker refuses to spend under one payer while the record names
     another. The plane does not pre-judge that (one enforcement point, agent-worker's cascade check) — it records it. */
  console.log("\n--- D-260 · a dispatch agent-worker refuses is recorded, not lost ---");
  {
    const R3 = { run: "RUN-2026-0923-d260-instance-project-payer", tok: INSTANCE_AI };
    const o = await open(R3.tok, R3.run, "project");
    const q = await POST(`op=capturerequest&token=${R3.tok}`, { target: INQ, run: R3.run, purpose: "investigate",
      address: "https://www.d260-host-payer.example.gov/doc.pdf", at: iso(T0) });
    const n3 = CALLS.length;
    const a = await obj.onAlarm(T0 + 2500);
    const w = (a.airunwake?.wakes || []).find((x) => x.run === R3.run);
    const mine = CALLS.slice(n3).filter((c) => c.body && c.body.run_id === R3.run);
    const code = (() => { try { return JSON.parse(mine[0]?.answer?.text || "null")?.reason; } catch { return null; } })();
    const last = (await logOf(R3)).slice(-1)[0];
    t("REFUSED-DISPATCH ARM: the instance's own run is dispatched once, agent-worker refuses it by name, and the tick "
      + "says REFUSED with that reason",
      [o?.started, q?.ok, mine.length, code, w?.dispatch?.state, w?.dispatch?.reason],
      [true, true, 1, "RUN_NAMES_A_DIFFERENT_PAYER", "REFUSED", "RUN_NAMES_A_DIFFERENT_PAYER"]);
    t("…and the run's own log's LAST entry says the dispatch did not complete, and that the run is still resumable",
      /^Resumption: the dispatch to agent-worker did not complete \(REFUSED: RUN_NAMES_A_DIFFERENT_PAYER\)/
        .test(last?.detail || ""), true);
  }

  /* REVOCATION IS STANDING. A second run of the instance key, woken after a member revokes that key. */
  console.log("\n--- D-260 · a revoked instance key resumes nothing ---");
  {
    const R2 = { run: "RUN-2026-0923-d260-instance-2", tok: INSTANCE_AI, payer: "instance" };
    const o = await open(R2.tok, R2.run, "instance");
    const q = await POST(`op=capturerequest&token=${R2.tok}`, { target: INQ, run: R2.run, purpose: "investigate",
      address: "https://www.d260-host-revoked.example.gov/doc.pdf", at: iso(T0) });
    const rv = await POST(`op=aicredentialrevoke&token=${RUTH}&tokenId=instance-org`, {});
    const n2 = CALLS.length;
    const a3 = await obj.onAlarm(T0 + 3000);
    const w = (a3.airunwake?.wakes || []).find((x) => x.run === R2.run);
    t("REVOKED ARM: the key's run is woken and NOT dispatched, and the reason is the record's revocation",
      [o?.started, q?.ok, rv?.revoked, w?.woken, CALLS.length - n2, w?.resume],
      [true, true, true, true, 0, "INSTANCE_AI_CREDENTIAL_REVOKED"]);
  }

  /* THE SECRET NEVER REACHES THE RECORD, NOR ANY ANSWER. */
  console.log("\n--- D-260 · the credential is nowhere in the record ---");
  {
    const reads = [];
    for (const r of Object.values(RUNS)) {
      reads.push(JSON.stringify(await GET(`op=airunlog&token=${r.tok}&run=${r.run}&limit=500`)));
      reads.push(JSON.stringify(await GET(`op=airun&token=${r.tok}&run=${r.run}`)));
    }
    reads.push(JSON.stringify(await GET(`op=capturerequests&token=${ADM}&limit=200`)));
    reads.push(JSON.stringify(await GET(`op=aicredentials&token=${RUTH}`)));
    reads.push(JSON.stringify(a1), JSON.stringify(a2));
    const blob = reads.join("\n");
    t("NO-TOKEN ARM: neither secret appears in any run log, run read, request list, credential list or alarm answer "
      + "(read over a corpus that is not empty)",
      [blob.length > 2000, blob.includes(INSTANCE_AI), blob.includes(INSTANCE_CLAUDE)], [true, false, false]);
  }

  /* THE FENCE: the binding is handled in ONE module and never written. */
  {
    const files = execFileSync("git", ["ls-files", "bio-plane/src"], { cwd: REPO, encoding: "utf8" })
      .split("\n").filter((f) => f.endsWith(".mjs"));
    const hits = [];
    for (const f of files) {
      const p = join(TREE, f);
      if (!existsSync(p)) continue;
      readFileSync(p, "utf8").split("\n").forEach((line, i) => { if (line.includes(INSTANCE_AI_BINDING)) hits.push(`${f}:${i + 1}`); });
    }
    t("FENCE: `INSTANCE_AI_TOKEN` is named in `tokens.mjs` alone — no op, no store row, no setter",
      [hits.length > 0, hits.filter((h) => !h.startsWith("bio-plane/src/tokens.mjs:"))], [true, []]);
    const published = "0000-d260-published";
    PUBLISHED_TOKEN_HASHES.add(sha(published));
    t("FENCE: publication is revocation — a published value is NOT SET, and an absent one says so",
      [await instanceAiCredential({ [INSTANCE_AI_BINDING]: published }), await instanceAiCredential({})],
      [{ token: null, reason: INSTANCE_AI_PUBLISHED }, { token: null, reason: INSTANCE_AI_UNSET }]);
    PUBLISHED_TOKEN_HASHES.delete(sha(published));
  }
} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}
console.log(`\nd260-resume: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

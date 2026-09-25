/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/airun-principal.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/airun-principal.control.mjs [arm]`. RESULTS, RUN 2026-09-19 by REC-152 in worktree agent-a8cfbd5a2893e6b93 on base 0cb784ab + this item (real src/index.mjs 664,532 B sha256 c465f6faa9b6…, src/store.mjs 2,663,685 B fa00fa3ccc56…, src/airun.mjs 133,905 B 42cbc70f4e58…, checks/bio-checks.mjs 793,248 B 11ab9af03a23…, untouched: YES), every arm AS DECLARED: baseline 27/0 · **sent-field — THE ROW'S CONTROL, the stamp honours a `principal` the caller SENT, so the store compares with the sent field -> 25/2: ARM F1 and ARM F2 (THE FORGED ACTOR), by name, and nothing else** · no-principal-check (the rule removed) -> 11/16, every positional refusal plus the read-back and the principal's own counts downstream, as declared · no-sight (sight dropped at both verbs) -> 24/3, U1 U2 U3 — the refusal would tell pia the run exists · exact-compare (a fence tighter than the rule: a member and her credential as two principals) -> 24/3, M2 M3 P3 · fold-by-split (over-strictness, the same fold spelled differently) -> 27/0. RE-RUN 2026-09-22 by REC-165 after re-anchoring `sent-field` on the stamp line REC-165 extended (`|| RUN_PRODUCTION_ACTIONS.includes(op)`; the old anchor occurred zero times after that change): every arm AS DECLARED at the same tallies (27/0, 25/2, 11/16, 24/3, 24/3, 27/0), real sources untouched. **THE CONTROL FOUND A DEFECT IN ITS OWN ARM FIRST:** sent-field's first spelling prefixed the stamp's ternary with `sent ||`, which parses as `(sent || viaSession) ? sessIdentity : …` — it armed (anchor once, file changed) and changed NOTHING, 27/0, NOT AS DECLARED; only the declared-vs-actual comparison saw it. Corrected in the driver and recorded there. BEFORE THIS ITEM (the suite run on the unedited tree `0cb784ab`): pia and cora ticked and closed alice's runs (A1 `ticked: true`, B1/B2 `ticked`/`terminated: true`), and pia over the hidden project was told `found: true`, the run's status and C-22.8 (U1-U3).
 * =========================================================================
 * REC-152 — `airuntick` AND `airunclose` ARE THE RUN'S PRINCIPAL'S ACTS.
 *
 * Membership Architecture v2 §7, the DEC-63 ruling bullet, "WHO MAY TICK AND CLOSE A RUN" (BOB #16,
 * 2026-09-19, `ed249814`): *tick and close are the run's PRINCIPAL's acts — the member (or that member's
 * minted machine credential) the plane stamped as `ai_runs.principal_plane` at open*, because a run's work
 * is attributed to its principal (DEC-24; AI Roles rule 4) and closing it directs someone else's work
 * (administrators included: they direct nothing, §4). *A run nobody drives ends by its own lease and
 * bounds (`#aiRunReap`); no member ends another's. A caller who cannot see the run's context is answered
 * as for a run that does not exist; one who can is refused positionally.*
 *
 * WHAT WAS WRONG, measured on the unedited tree (`0cb784ab`): the three run verbs shared ONE gate — the
 * project gate — so over a QUESTION, which consults no project since REC-145, any member holding
 * `contribute` could tick and close another member's run (`airun-projectgate.test.mjs` ARM H6 pinned it
 * as built), and over a PROJECT any joined co-participant could.
 *
 * THE COMPARISON IS WITH THE STAMPED `principal_plane`, NEVER A SENT FIELD. The caller's own principal is
 * stamped by the control plane exactly as `airunopen` stamps the run's (`member:<id>` for a session,
 * `<principal>/<tokenId>` for an `ai` credential, `class:<cls>` for a token class). A member and the
 * credentials minted FOR that member are one principal (the part before the `/`); a principal with no
 * member behind it (a token class, an organisation key) is compared whole.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: compare with a field the CALLER
 * sends (the run's `actor`, a `principal`) — every honest arm stays green, because an honest caller sends
 * nothing or the truth. ARM F drives a caller who SENDS another member's id in every spelling a request
 * can carry, and must still be refused.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store; (ii) no surface — it asserts what the plane
 * SENDS; (iii) it drives one token class (`MEMBER_TOKEN`) for the whole-string comparison and does not
 * drive an organisation-kind `ai` key, which takes the same branch (a principal not beginning `member:`).
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.AIRUN_PRINCIPAL_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { AI_RUN_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec152", MEM = "mem-rec152";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* THE RAW ANSWER: status, content type and the body's exact bytes — nothing parsed away. */
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const E = encodeURIComponent;

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.token;
};

/* 4.2/4.3: there are no ordinary members until two administrators exist. GUS is the administrator who
   SEES every project and directs none (§4) — the positional arm's hardest caller. */
const RUTH  = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
const GUS   = await member("gus",  ["contribute"], "admin");
/* ALICE opens every member run below; she is the PRINCIPAL. */
const ALICE = await member("alice", ["contribute"]);
/* CORA — contribute, JOINED to the same project: the co-participant the ruling narrows. */
const CORA  = await member("cora", ["contribute"]);
/* PIA — contribute, in NO project: she can see the question and cannot see the project. */
const PIA   = await member("pia",  ["contribute"]);

const NOW = "2026-09-19T00:00:00Z", LATER = "2026-09-19T01:00:00Z";
const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
/* A project's id is MINTED by the plane (REC-141): the creation names no bundleId and its bytes no id. */
const projectMd = () => ["---", "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");
let seq = 0;
const bundle = (id, type) => {
  const md = type === "project" ? projectMd() : inquiryMd(id);
  return {
    ...(type === "project" ? {} : { bundleId: id }), base: null,
    snapKey: `20260919T1200${String(++seq).padStart(2, "0")}Z_aaaa1111`,
    /* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: the label `title for ${id}` contradicted the question's
       own `title:` and is now refused; the project's document states no title, so the label stays its only name. */
    meta: { object_type: type, group: "believe-in-oakland", ...(type === "project" ? { title: `title for ${id}` } : {}),
            current_state: type === "project" ? "forming" : "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [],
  };
};

const Q = "INQ-2026-9152-question";
let P = null;
console.log("\n--- FIXTURE: one project, one question, two joined participants ---");
{
  const p = await POST(`op=promote&${RUTH}`, bundle("rec152 project", "project"));
  P = p?.bundleId;
  const q = await POST(`op=promote&${RUTH}`, bundle(Q, "inquiry"));
  t("FIXTURE: the project and the question are promoted", [p?.ok, !!P, q?.ok], [true, true, true]);
  const inv = [];
  for (const h of ["alice", "cora"])
    inv.push((await POST(`op=projectinvite&${RUTH}&projectId=${E(P)}&handle=${h}`))?.ok);
  const joined = [(await POST(`op=projectjoin&${ALICE}&projectId=${E(P)}`))?.state,
                  (await POST(`op=projectjoin&${CORA}&projectId=${E(P)}`))?.state];
  t("FIXTURE: alice and cora are JOINED participants of the project; pia was never invited",
    [inv, joined], [[true, true], ["joined", "joined"]]);
}

let runSeq = 0;
const openAs = async (tok, contextId, contextType, extra = {}) => {
  const run = `RUN-2026-0919-${++runSeq}`;
  const r = await POST(`op=airunopen&${tok}`, {
    run, contextType, contextId, label: "evidence sweep", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000, ...extra });
  return { run, r };
};
const tick = (tok, run, extraQ = "", body = {}) =>
  RAW(`op=airuntick&${tok}${extraQ}`, { run, consume: { fetches: 1 },
    log: [{ level: "document", subject: "doc:x", state: "NEVER_LOOKED" }], ...body });
const close = (tok, run, extraQ = "", body = {}) =>
  RAW(`op=airunclose&${tok}${extraQ}`, { run, bound: "completed", ...body });
const readRun = async (run) => rP(JSON.parse((await RAW(`op=airun&token=${ADM}&run=${E(run)}`)).body))?.session ?? null;

const QRUN = await openAs(ALICE, Q, "inquiry");
const PRUN = await openAs(ALICE, P, "project");
t("REACH: alice's two runs — one over the QUESTION, one over the PROJECT — are really running, and the "
  + "plane STAMPED her as each run's principal (every refusal below would pass vacuously over a run that "
  + "never started)",
  [QRUN.r?.started, PRUN.r?.started, (await readRun(QRUN.run))?.principal?.plane, (await readRun(PRUN.run))?.principal?.plane],
  [true, true, "member:alice", "member:alice"]);

const C = AI_RUN_CHECKS.AI_RUN_NOT_PRINCIPAL;
const refused = (a, verb) => verb === "tick"
  ? [a?.ticked, a?.found, a?.code, a?.check, a?.translation]
  : [a?.terminated, a?.found, a?.code, a?.check, a?.translation];
const want = (verb) => [false, true, "AI_RUN_NOT_PRINCIPAL", C?.check, C?.translation];

console.log("\n--- ARM A · A SECOND MEMBER WITH `contribute`, OVER A QUESTION ---");
{
  t("ARM A0: the refusal is catalogued as C-22.12 with a canned translation (DEC-49)",
    [C?.check, typeof C?.translation === "string" && C.translation.length > 40], ["C-22.12", true]);
  t("ARM A1: pia (contribute, in no project) cannot TICK alice's run over a question she CAN see — "
    + "refused positionally, by code",
    refused(parse(await tick(PIA, QRUN.run)), "tick"), want("tick"));
  t("ARM A2: nor CLOSE it",
    refused(parse(await close(PIA, QRUN.run)), "close"), want("close"));
  t("ARM A3: nor can cora, alice's co-participant, over the question",
    [refused(parse(await tick(CORA, QRUN.run)), "tick"), refused(parse(await close(CORA, QRUN.run)), "close")],
    [want("tick"), want("close")]);
}

console.log("\n--- ARM B · OVER A PROJECT: the co-participant is narrowed too (deliberately) ---");
{
  t("ARM B1: cora is a JOINED participant of the project and still cannot TICK alice's run over it",
    refused(parse(await tick(CORA, PRUN.run)), "tick"), want("tick"));
  t("ARM B2: nor CLOSE it",
    refused(parse(await close(CORA, PRUN.run)), "close"), want("close"));
}

console.log("\n--- ARM G · AN ADMINISTRATOR SEES EVERY PROJECT AND DIRECTS NONE (§4) ---");
{
  t("ARM G1: gus, an administrator holding contribute, is refused positionally over the question and the "
    + "project — tick and close both",
    [refused(parse(await tick(GUS, QRUN.run)), "tick"), refused(parse(await close(GUS, QRUN.run)), "close"),
     refused(parse(await tick(GUS, PRUN.run)), "tick"), refused(parse(await close(GUS, PRUN.run)), "close")],
    [want("tick"), want("close"), want("tick"), want("close")]);
}

console.log("\n--- ARM U · A CALLER WHO CANNOT SEE THE CONTEXT IS ANSWERED AS FOR A RUN THAT DOES NOT EXIST ---");
{
  const NEVER = "RUN-2026-0919-never-minted";
  const norm = (r, id) => ({ status: r.status, type: r.type, body: r.body.split(id).join("<RUN>") });
  const tU = await tick(PIA, PRUN.run), tN = await tick(PIA, NEVER);
  const cU = await close(PIA, PRUN.run), cN = await close(PIA, NEVER);
  t("ARM U0 (REACH): the never-minted id's answers are the absent-run answers, so the byte arms below "
    + "compare with something real",
    [parse(tN)?.found, parse(cN)?.found], [false, false]);
  t("ARM U1: pia cannot see the project, and her TICK of alice's run over it is BYTE-IDENTICAL to a tick "
    + "of a run id nobody ever minted (status, type, body; the id she sent is the only difference)",
    norm(tU, PRUN.run), norm(tN, NEVER));
  t("ARM U2: and her CLOSE likewise",
    norm(cU, PRUN.run), norm(cN, NEVER));
  t("ARM U3: no code is said to her — a positional refusal would tell her the run exists",
    [parse(tU)?.code ?? null, parse(cU)?.code ?? null], [null, null]);
}

console.log("\n--- ARM F · THE FORGED ACTOR: a caller who SENDS the principal's id is still refused ---");
{
  /* Every spelling a request can carry: the query (`actor`, `principal`, `identity`, `viewer`) and the
     body (`actor`, `principal`, `principalPlane`, `caller`). A gate that believed any of them would pass
     every other arm here. */
  /* ITS OWN RUN, so a control that lets the forger through moves THESE arms and nothing downstream. */
  const FRUN = await openAs(ALICE, Q, "inquiry");
  const q = `&actor=${E("member:alice")}&principal=${E("member:alice")}&identity=${E("member:alice")}`;
  const b = { actor: "member:alice", principal: "member:alice", principalPlane: "member:alice", caller: "member:alice" };
  t("ARM F1 (THE FORGED ACTOR): cora sends alice's id in every field — tick REFUSED positionally, and the "
    + "run is untouched",
    [refused(parse(await tick(CORA, FRUN.run, q, b)), "tick"), (await readRun(FRUN.run))?.ticks], [want("tick"), 1]);
  t("ARM F2 (THE FORGED ACTOR): and close REFUSED positionally, and the run is still running",
    [refused(parse(await close(CORA, FRUN.run, q, b)), "close"), (await readRun(FRUN.run))?.status],
    [want("close"), "running"]);
}

console.log("\n--- ARM R · READ BACK: every refusal above wrote NOTHING ---");
{
  const q = await readRun(QRUN.run), p = await readRun(PRUN.run);
  t("ARM R1: both runs are still running on their first tick with nothing consumed",
    [q?.status, q?.ticks, q?.budget?.[0]?.consumed, p?.status, p?.ticks, p?.budget?.[0]?.consumed],
    ["running", 1, 0, "running", 1, 0]);
}

console.log("\n--- ARM M · THE MEMBER'S MINTED MACHINE CREDENTIAL IS THE SAME PRINCIPAL; ANOTHER MEMBER'S IS NOT ---");
let AK = null, CK = null;
{
  const mint = async (tok, tokenId) => POST(`op=aicredentialmint&${tok}`,
    { tokenId, principalKind: "member", taskScope: "investigative",
      writes: ["airunopen", "airuntick", "airunclose"], note: "REC-152: drives its member's runs" });
  const a = await mint(ALICE, "alice-agent"), c = await mint(CORA, "cora-agent");
  AK = a?.token ? `token=${a.token}` : null;
  CK = c?.token ? `token=${c.token}` : null;
  t("FIXTURE: alice and cora each mint an `ai` credential whose principal is themselves",
    [a?.credential?.principal, c?.credential?.principal, !!AK, !!CK], ["member:alice", "member:cora", true, true]);
  const ct = parse(await tick(CK, QRUN.run));
  t("ARM M1: cora's credential cannot tick alice's run — a credential sees and directs no more than its member",
    refused(ct, "tick"), want("tick"));
  const at = parse(await tick(AK, QRUN.run));
  t("ARM M2: alice's OWN credential ticks her session's run — the member and the credential minted for her are "
    + "one principal",
    [at?.ticked, at?.code ?? null, at?.ticks], [true, null, 2]);
  const opened = await openAs(AK, Q, "inquiry");
  const back = await readRun(opened.run);
  const st = parse(await tick(ALICE, opened.run));
  t("ARM M3: and the other way round — a run her credential opened (stamped `member:alice/alice-agent`) is "
    + "ticked by her session",
    [opened.r?.started, back?.principal?.plane, st?.ticked, st?.code ?? null],
    [true, "member:alice/alice-agent", true, null]);
  const cc = parse(await close(CORA, opened.run));
  t("ARM M4: and cora cannot close it", refused(cc, "close"), want("close"));
}

console.log("\n--- ARM K · A TOKEN CLASS IS ITS OWN PRINCIPAL, COMPARED WHOLE ---");
{
  const k = await openAs(`token=${MEM}`, Q, "inquiry", { principalClaude: "instance" });
  const byMember = parse(await tick(ALICE, k.run));
  const byClass = parse(await tick(`token=${MEM}`, k.run));
  const classOnMember = parse(await tick(`token=${MEM}`, QRUN.run));
  t("ARM K1: a run the MEMBER_TOKEN class opened is ticked by that class and refused to a member; the class "
    + "cannot tick a member's run either",
    [k.r?.started, refused(byMember, "tick"), byClass?.ticked, refused(classOnMember, "tick")],
    [true, want("tick"), true, want("tick")]);
}

console.log("\n--- ARM P · THE PRINCIPAL STILL ENDS THE RUN, AND SO DOES THE REAPER ---");
{
  const pt = parse(await tick(ALICE, PRUN.run));
  t("ARM P1: alice ticks her run over the project — so B1 measures the principal rule and not a broken tick",
    [pt?.ticked, pt?.ticks, pt?.projectGate?.ground], [true, 2, "PARTICIPANT"]);
  const pc = parse(await close(ALICE, PRUN.run));
  t("ARM P2: and closes it — so B2 measures the principal rule and not a broken close",
    [pc?.terminated, pc?.found], [true, true]);
  const qc = parse(await close(AK, QRUN.run));
  t("ARM P3: her credential closes her run over the question", [qc?.terminated, qc?.found], [true, true]);
  /* THE REAPER IS UNCHANGED: a run nobody drives ends by its own lease. Driven exactly as airun.test.mjs
     drives it — `onAlarm(now)` on the Durable Object, the alarm's own body. */
  const orphan = await openAs(ALICE, Q, "inquiry");
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const alarm = await obj.onAlarm(Date.now() + 3600000);
  const mine = (alarm?.airunreap?.reaped ?? []).find((r) => r.run === orphan.run) ?? null;
  t("ARM P4 (THE REAPER): a run of alice's that nobody drives is ended by the alarm, on its lease — no member "
    + "was asked",
    [orphan.r?.started, mine, (await readRun(orphan.run))?.status],
    [true, { run: orphan.run, terminated: true, bound: "lease" }, "stopped"]);
}

console.log(`\nairun-principal: ${pass} pass, ${fail} fail`);
await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
process.exit(fail ? 1 : 0);

/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec165-production-principal.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec165-production-principal.control.mjs [arm]`. RESULTS, RUN 2026-09-22 by REC-165 (CONDUCT #14's worker, cloud) on de40aa56 + this item (real src/index.mjs 704,656 B sha256 bb0e524ed14c…, src/store.mjs 2,793,636 B 200f653d8541…, src/airun.mjs 138,642 B f47ddd05121a…, checks/bio-checks.mjs 815,295 B a52ce90a1a2b…, untouched: YES), EVERY ARM AS DECLARED — on its first run, and AGAIN after the principal relay was rewritten field by field instead of spread (the DEC-49 guard's inherited-verdict ceiling refused the spread; the two gate arms were re-anchored on the new return and re-armed), same tallies: baseline 35/0 · **drop-gate-suggest — THE ROW'S CONTROL, the principal gate in `suggestVersion` removed -> 26/9: ARM S1 and S2 (THE OTHER PRINCIPAL, session AND credential) by name, with S3 S4 S5 F1 F3 and the two order arms N3 X6** · drop-gate-extract -> 30/5: E1 E2 E3 F2 F3 · **drop-context — BOB #28's CONTROL, the context check removed -> 31/4: X1 X2 X3 X4 by name, the order arms X6/X7 unmoved** · no-sight-suggest -> 33/2: U1 X7 · no-sight-extract -> 34/1: U2 · sent-field (the stamp honours a sent `principal`) -> 32/3: F1 F2 F3 · context-too-tight (a fence tighter than the rule: the run's own id only) -> 34/1: X5 · context-by-projects (over-strictness: the same rule spelled through `#runContextProjects`) -> 35/0. BEFORE THIS ITEM (the suite run against `de40aa56`'s sources): 13 pass, 22 fail — cora and her credential wrote suggestions and proposed readings under alice's runs, pia wrote one under a run over a project she cannot see, and every outside-context suggestion landed.
 * =========================================================================
 * REC-165 — A PRODUCTION NAMES A RUNNING RUN ITS CALLER HOLDS, AND A SUGGESTION LANDS INSIDE THAT RUN'S CONTEXT.
 *
 * `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, rule 1 (BOB #25, 2026-09-21): *a production names a
 * RUNNING run whose PRINCIPAL is the caller — the member who opened it, or a machine credential that member
 * minted. REC-152's one stamp expression is extended to `op=suggest` and `op=extractpropose`, and both apply
 * `runPrincipalGate`.* And its TARGET (BOB #28, 2026-09-22): *`op=suggest`'s target is the run's context itself,
 * or, for a run over a project, a question that project confirmed-cites; anything else is refused by a new
 * stated code, checked AFTER the sight and principal checks, so a target the caller cannot see still answers
 * as absent.* `op=extractpropose` names no target question and the target rule does not touch it.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`de40aa56`): `suggestVersion` resolved `run` for EXISTENCE
 * alone (no status, no principal, no context) and `extractPropose` checked running and mode, never whose run it
 * was — so cora could write a suggestion, and a proposed reading, under alice's run, read afterwards against
 * alice's lens, bar, skill version and principal. Four existing suites did exactly that without meaning to
 * (`dec65-single-part`, `suggest`, `bounds`, `extractrun`), corrected in this landing with dated comments.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: gate ONE caller kind only. A gate asked
 * of member SESSIONS alone passes every session arm while any machine credential writes under anybody's run —
 * and the reverse. So every refusal and every landing below is driven from BOTH a member session AND an `ai`
 * credential that member minted (ARMS S, E, L, N and X each carry both). And compare with a field the caller
 * SENDS: ARM F sends the principal's id in every spelling a request can carry, and must still be refused.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store; (ii) no surface — it asserts what the plane SENDS;
 * (iii) it drives no organisation-kind `ai` key (REC-152's suite covers the whole-string branch with a token
 * class); (iv) it does not drive a SEVERED citation for the project-context arm — `#citesInto` is the one
 * live-cites predicate and its severance reading is `severedhomes.test.mjs`'s; (v) `op=capturerequest`, the same
 * class, is NOT gated by this landing (rule 1 names two ops) and is measured, not asserted, in REC-165's report.
 * [2026-09-23, REC-168: that door is now gated by BOB #28's ruling — `test/rec168-capturerequest-principal.test.mjs`.]
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.REC165_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { AI_RUN_CHECKS, SUGGEST_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));
const { EXTRACT_RUN_MODE } = await import(join(SRC_DIR, "extractrun.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec165", MEM = "mem-rec165";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
});

try {

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

/* 4.2/4.3: two administrators before any member. RUTH owns the project; GUS SEES every project and directs none. */
const RUTH  = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
const GUS   = await member("gus",  ["contribute"], "admin");
/* ALICE opens every run below: she is the PRINCIPAL. CORA is her JOINED co-participant. PIA is in no project. */
const ALICE = await member("alice", ["contribute"]);
const CORA  = await member("cora", ["contribute"]);
const PIA   = await member("pia",  ["contribute"]);

const NOW = "2026-09-22T00:00:00Z", LATER = "2026-09-22T01:00:00Z";
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
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* A project's id is MINTED by the plane (REC-141): the creation names no bundleId and its bytes no id. */
const projectMd = () => ["---", "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");
let seq = 0;
const bundle = (id, type, extra = {}) => {
  const md = type === "project" ? projectMd() : type === "information" ? infoMd(id) : inquiryMd(id);
  return {
    ...(type === "project" ? {} : { bundleId: id }), base: null,
    snapKey: `20260922T1200${String(++seq).padStart(2, "0")}Z_aaaa1111`,
    meta: { object_type: type, group: "believe-in-oakland", title: `title for ${id}`,
            current_state: type === "project" ? "forming" : type === "information" ? "collected" : "open",
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }, ...(extra.files ?? [])],
    register: extra.register ?? [],
  };
};

const QP = "INQ-2026-9165-cited";      // cited by the project P
const Q  = "INQ-2026-9165-question";   // cited by nobody
const QX = "INQ-2026-9165-elsewhere";  // cited by nobody: the OTHER question
const DOC = "INFO-2026-9165-read";     // a captured, read document the extract runs propose over
let P = null;
console.log("\n--- FIXTURE: one project citing one question, two loose questions, one read document ---");
{
  const p = await POST(`op=promote&${RUTH}`, bundle("rec165 project", "project"));
  P = p?.bundleId;
  const qs = [];
  for (const id of [QP, Q, QX]) qs.push((await POST(`op=promote&${RUTH}`, bundle(id, "inquiry")))?.ok);
  /* A D-252 scoped chain, so the capture has a text source an `ai` step can extend (extractrun's fixture). */
  const SHA_DOC = sha("rec165-the-document-the-assistant-read");
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: SHA_DOC, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
               entities: [], facts: {},
               text_source: [{ step: "pixels", extent: { kind: "pages", pages: [0, 1] } },
                             { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C",
                               confidence: { basis: "none" }, extent: { kind: "pages", pages: [0, 1] } }] } }] });
  const d = await POST(`op=promote&${RUTH}`, bundle(DOC, "information", {
    files: [{ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [{ path: "snapshots/d.bin", sha256: SHA_DOC, encoding: "binary", bytes: 10 }] }));
  t("FIXTURE: the project, three questions and the document are promoted",
    [p?.ok, !!P, qs, d?.ok], [true, true, [true, true, true], true]);
  const inv = [];
  for (const h of ["alice", "cora"])
    inv.push((await POST(`op=projectinvite&${RUTH}&projectId=${E(P)}&handle=${h}`))?.ok);
  const joined = [(await POST(`op=projectjoin&${ALICE}&projectId=${E(P)}`))?.state,
                  (await POST(`op=projectjoin&${CORA}&projectId=${E(P)}`))?.state];
  t("FIXTURE: alice and cora are JOINED participants of the project; pia was never invited",
    [inv, joined], [[true, true], ["joined", "joined"]]);
  /* THE EDGE IS WRITTEN BY THE ACT `op=cite`, never hand-authored (citeproject-inquiry's discipline). */
  const sel = await POST(`op=select&${RUTH}`, { ids: [QP] });
  const handle = sel?.handle;
  const cited = rP(JSON.parse((await RAW(`op=cite&${RUTH}&project=${E(P)}&handle=${handle}`)).body));
  const back = rP(JSON.parse((await RAW(`op=backlinks&${RUTH}&target=${E(QP)}`)).body));
  t("FIXTURE: the project cites QP by the act op=cite, read back through op=backlinks",
    [cited?.ok, (back?.backlinks ?? []).map((x) => x.from)], [true, [P]]);
}

/* THE CREDENTIALS: each member mints an `ai` credential whose principal is herself, declaring the two
   productions and the run verbs. */
const mint = async (tok, tokenId) => POST(`op=aicredentialmint&${tok}`,
  { tokenId, principalKind: "member", taskScope: "investigative",
    writes: ["airunopen", "airuntick", "airunclose", "suggest", "extractpropose"],
    note: "REC-165: produces under its member's runs" });
const ak = await mint(ALICE, "alice-agent"), ck = await mint(CORA, "cora-agent");
const AK = ak?.token ? `token=${ak.token}` : null, CK = ck?.token ? `token=${ck.token}` : null;
t("FIXTURE: alice and cora each mint an `ai` credential whose principal is themselves",
  [ak?.credential?.principal, ck?.credential?.principal, !!AK, !!CK], ["member:alice", "member:cora", true, true]);

let runSeq = 0;
const openAs = async (tok, contextId, contextType, extra = {}) => {
  const run = `RUN-2026-0922-rec165-${++runSeq}`;
  const r = await POST(`op=airunopen&${tok}`, {
    run, contextType, contextId, label: "REC-165 run", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000, ...extra });
  return { run, r };
};
const openExtract = (tok, contextId, contextType) => openAs(tok, contextId, contextType,
  { mode: EXTRACT_RUN_MODE, bounds: [{ bound: "mints", allowed: 20, unit: "passages" }] });
const readRun = async (run) => parse(await RAW(`op=airun&token=${ADM}&run=${E(run)}`))?.session ?? null;

let nameSeq = 0;
/* THE ONE SUBMITTER. §9's EMPTY-LEVEL kind, because it rests on no document and so is writable by a member
   session AND by a machine credential alike — the property under test is the RUN, and nothing else may differ
   between the two caller kinds. Every name is fresh, so no F10 memo and no name collision answers for the gate. */
const suggest = (tok, run, target, extraQ = "", body = {}) => RAW(`op=suggest&${tok}${extraQ}`, {
  target, run, kind: "level-empty", name: `rec165 reading ${++nameSeq}`,
  description: `Search ${nameSeq}: we searched the meaning layer for a superseding reading and found none.`,
  relationship: "and", level: "meaning", observed_at: `observation:rec165-${nameSeq}`, ...body });
const propose = (tok, run, extraQ = "", body = {}) => RAW(`op=extractpropose&${tok}${extraQ}`, {
  run, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
  refs: [{ ref: `contract:C-${9000 + (++nameSeq)}`, refKind: "contract", refKey: `C-${9000 + nameSeq}` }], ...body });
const versionsOf = async (id) => (parse(await RAW(`op=basisversions&token=${ADM}&id=${E(id)}&limit=1000`))?.versions ?? []).length;
const proposalsOf = async (run) => parse(await RAW(`op=extractproposals&token=${ADM}&run=${E(run)}`))?.count ?? -1;

const QRUN = await openAs(ALICE, Q, "inquiry");         // alice's run over the loose question
const PRUN = await openAs(ALICE, P, "project");         // alice's run over the project
const XRUN = await openExtract(ALICE, Q, "inquiry");    // alice's EXTRACT run over the question
const PXRUN = await openExtract(ALICE, P, "project");   // alice's EXTRACT run over the project
const KRUN = await openAs(AK, Q, "inquiry");            // a run alice's CREDENTIAL opened
t("REACH: alice's five runs are really running and the plane STAMPED her (or her credential) as each run's "
  + "principal — every refusal below would pass vacuously over a run that never started",
  [QRUN.r?.started, PRUN.r?.started, XRUN.r?.started, PXRUN.r?.started, KRUN.r?.started,
   (await readRun(QRUN.run))?.principal?.plane, (await readRun(KRUN.run))?.principal?.plane],
  [true, true, true, true, true, "member:alice", "member:alice/alice-agent"]);

const C = AI_RUN_CHECKS.AI_RUN_NOT_PRINCIPAL;
const refused = (a) => [a?.ok, a?.code, a?.check, a?.translation];
const WANT = [false, "AI_RUN_NOT_PRINCIPAL", C?.check, C?.translation];

console.log("\n--- ARM S · ANOTHER PRINCIPAL'S RUNNING RUN IS REFUSED ON op=suggest, FROM BOTH CALLER KINDS ---");
{
  const before = await versionsOf(Q);
  const s1 = parse(await suggest(CORA, QRUN.run, Q));
  const s2 = parse(await suggest(CK, QRUN.run, Q));
  const s3 = parse(await suggest(GUS, QRUN.run, Q));
  t("ARM S1 (THE OTHER PRINCIPAL, SESSION): cora cannot suggest under alice's running run over a question she "
    + "CAN see — refused positionally, C-22.12, by code", refused(s1), WANT);
  t("ARM S2 (THE OTHER PRINCIPAL, CREDENTIAL): nor can cora's own minted credential", refused(s2), WANT);
  t("ARM S3: nor gus, an administrator — he sees every project and directs none (§4)", refused(s3), WANT);
  t("ARM S4: and the detail names the ACT refused, not the tick's words (runPrincipalGate's `act`)",
    /^suggesting a reading under a run is its principal's act/.test(s1?.detail ?? ""), true);
  t("ARM S5 (NOTHING WRITTEN): the question holds exactly the readings it held before the three refusals",
    await versionsOf(Q), before);
}

console.log("\n--- ARM E · ANOTHER PRINCIPAL'S RUNNING RUN IS REFUSED ON op=extractpropose, FROM BOTH CALLER KINDS ---");
{
  const e1 = parse(await propose(CORA, XRUN.run));
  const e2 = parse(await propose(CK, XRUN.run));
  t("ARM E1 (THE OTHER PRINCIPAL, SESSION): cora cannot propose a reading under alice's extract run — refused "
    + "positionally, by code, with the reason spelled as the code", [...refused(e1), e1?.reason], [...WANT, "AI_RUN_NOT_PRINCIPAL"]);
  t("ARM E2 (THE OTHER PRINCIPAL, CREDENTIAL): nor can cora's minted credential", refused(e2), WANT);
  t("ARM E3 (NOTHING WRITTEN): alice's extract run holds no proposal after the two refusals",
    await proposalsOf(XRUN.run), 0);
}

console.log("\n--- ARM L · THE CALLER'S OWN RUNNING RUN LANDS, FROM A SESSION AND FROM HER MINTED CREDENTIAL ---");
{
  const l1 = parse(await suggest(ALICE, QRUN.run, Q));
  const l2 = parse(await suggest(AK, QRUN.run, Q));
  const l3 = parse(await suggest(ALICE, KRUN.run, Q));
  t("ARM L1 (SESSION): alice suggests under her own running run — it lands as `suggested`",
    [l1?.ok, l1?.state, l1?.code ?? null], [true, "suggested", null]);
  t("ARM L2 (CREDENTIAL): her minted credential suggests under the run her SESSION opened — one principal",
    [l2?.ok, l2?.state, l2?.code ?? null], [true, "suggested", null]);
  t("ARM L3: and her session suggests under the run her CREDENTIAL opened",
    [l3?.ok, l3?.state, l3?.code ?? null], [true, "suggested", null]);
  const l4 = parse(await propose(ALICE, XRUN.run));
  const l5 = parse(await propose(AK, XRUN.run));
  t("ARM L4 (SESSION): alice proposes a reading under her own extract run — it lands",
    [l4?.ok, l4?.code ?? null, l4?.reason ?? null], [true, null, null]);
  t("ARM L5 (CREDENTIAL): and so does her minted credential, under the same run",
    [l5?.ok, l5?.code ?? null, l5?.reason ?? null], [true, null, null]);
}

console.log("\n--- ARM N · THE CALLER'S ENDED RUN IS REFUSED ON op=suggest ---");
{
  const ended = await openAs(ALICE, Q, "inquiry");
  const closed = parse(await RAW(`op=airunclose&${ALICE}`, { run: ended.run, bound: "completed" }));
  const R = SUGGEST_CHECKS.SUGGEST_RUN_NOT_RUNNING;
  const n1 = parse(await suggest(ALICE, ended.run, Q)), n2 = parse(await suggest(AK, ended.run, Q));
  t("ARM N0 (REACH): alice's run is opened and then ENDED by her", [ended.r?.started, closed?.terminated], [true, true]);
  t("ARM N1 (SESSION): alice cannot suggest under her own ENDED run — SUGGEST_RUN_NOT_RUNNING, C-27.18",
    [n1?.ok, n1?.code, n1?.check, n1?.translation], [false, "SUGGEST_RUN_NOT_RUNNING", "C-27.18", R?.translation]);
  t("ARM N2 (CREDENTIAL): nor can her minted credential", [n2?.ok, n2?.code], [false, "SUGGEST_RUN_NOT_RUNNING"]);
  const n3 = parse(await suggest(CORA, ended.run, Q));
  t("ARM N3 (ORDER: POSITION BEFORE STATUS): cora under alice's ended run is told it is not hers, never its status",
    [n3?.code, "status" in (n3 ?? {})], ["AI_RUN_NOT_PRINCIPAL", false]);
}

console.log("\n--- ARM U · A CALLER WHO CANNOT SEE THE RUN'S CONTEXT IS ANSWERED AS FOR A RUN THAT DOES NOT EXIST ---");
{
  const NEVER = "RUN-2026-0922-never-minted";
  const norm = (r, id) => ({ status: r.status, type: r.type, body: r.body.split(id).join("<RUN>") });
  const sU = await suggest(PIA, PRUN.run, QP, "", { name: "pia's probe" });
  const sN = await suggest(PIA, NEVER, QP, "", { name: "pia's probe" });
  t("ARM U0 (REACH): pia can see QP — her suggestion under a never-minted run is refused for the RUN "
    + "(SUGGEST_NO_RUN), not for the question, so the byte arm below compares something real",
    parse(sN)?.code, "SUGGEST_NO_RUN");
  t("ARM U1 (SUGGEST): pia cannot see the project, and her suggestion under alice's run over it is "
    + "BYTE-IDENTICAL to one under a run id nobody minted (the id she sent is the only difference)",
    norm(sU, PRUN.run), norm(sN, NEVER));
  const eU = await propose(PIA, PXRUN.run, "", { refs: [{ ref: "contract:C-1", refKind: "contract", refKey: "C-1" }] });
  const eN = await propose(PIA, NEVER, "", { refs: [{ ref: "contract:C-1", refKind: "contract", refKey: "C-1" }] });
  t("ARM U2 (EXTRACTPROPOSE): and her proposal under alice's extract run over the project is BYTE-IDENTICAL to "
    + "one under a never-minted run — NO_SUCH_RUN, no code",
    [norm(eU, PXRUN.run), parse(eU)?.reason, parse(eU)?.code ?? null],
    [norm(eN, NEVER), "NO_SUCH_RUN", null]);
}

console.log("\n--- ARM F · THE FORGED PRINCIPAL: a caller who SENDS alice's id is still refused, on both ops ---");
{
  const q = `&principal=${E("member:alice")}&caller=${E("member:alice")}&actor=${E("member:alice")}`
          + `&identity=${E("member:alice")}&viewer=${E("member:alice")}`;
  const b = { caller: "member:alice", principal: "member:alice", principalPlane: "member:alice", actor: "member:alice" };
  const before = await versionsOf(Q);
  t("ARM F1 (THE FORGED PRINCIPAL, SUGGEST): cora sends alice's id in every field of query and body — refused "
    + "positionally, nothing written",
    [refused(parse(await suggest(CORA, QRUN.run, Q, q, b))), await versionsOf(Q)], [WANT, before]);
  t("ARM F2 (THE FORGED PRINCIPAL, EXTRACTPROPOSE): and her proposal is refused the same way",
    refused(parse(await propose(CORA, XRUN.run, q, b))), WANT);
  t("ARM F3 (THE FORGED PRINCIPAL, CREDENTIAL): cora's credential sending the same is refused on both",
    [refused(parse(await suggest(CK, QRUN.run, Q, q, b))), refused(parse(await propose(CK, XRUN.run, q, b)))],
    [WANT, WANT]);
}

console.log("\n--- ARM X · BOB #28: A SUGGESTION LANDS ONLY INSIDE ITS RUN'S CONTEXT ---");
{
  const O = SUGGEST_CHECKS.SUGGEST_OUTSIDE_RUN_CONTEXT;
  const before = await versionsOf(QX);
  const x1 = parse(await suggest(ALICE, QRUN.run, QX)), x2 = parse(await suggest(AK, QRUN.run, QX));
  t("ARM X1 (THE OUTSIDE TARGET, SESSION): alice's run over Q cannot land a suggestion on QX — "
    + "SUGGEST_OUTSIDE_RUN_CONTEXT, C-27.19, by name",
    [x1?.ok, x1?.code, x1?.check, x1?.translation], [false, "SUGGEST_OUTSIDE_RUN_CONTEXT", "C-27.19", O?.translation]);
  t("ARM X2 (THE OUTSIDE TARGET, CREDENTIAL): nor can her credential", [x2?.ok, x2?.code], [false, "SUGGEST_OUTSIDE_RUN_CONTEXT"]);
  const x3 = parse(await suggest(ALICE, PRUN.run, QX));
  t("ARM X3 (THE OUTSIDE TARGET, PROJECT RUN): alice's run over the project cannot land on a question the "
    + "project does NOT cite", [x3?.ok, x3?.code], [false, "SUGGEST_OUTSIDE_RUN_CONTEXT"]);
  t("ARM X4 (NOTHING WRITTEN): QX holds what it held", await versionsOf(QX), before);
  const x5 = parse(await suggest(ALICE, PRUN.run, QP)), x6 = parse(await suggest(AK, PRUN.run, QP));
  t("ARM X5 (OVER-STRICTNESS: THE CITED QUESTION): alice's run over the project LANDS a suggestion on QP, which "
    + "the project confirmed-cites — from her session and from her credential",
    [x5?.ok, x5?.state, x6?.ok, x6?.state], [true, "suggested", true, "suggested"]);
  const x7 = parse(await suggest(CORA, QRUN.run, QX));
  t("ARM X6 (ORDER: POSITION BEFORE CONTEXT): cora, outside alice's context AND not her principal, is told the "
    + "run is not hers", x7?.code, "AI_RUN_NOT_PRINCIPAL");
  const NEVER = "RUN-2026-0922-never-minted-x";
  const norm = (r, id) => ({ status: r.status, type: r.type, body: r.body.split(id).join("<RUN>") });
  t("ARM X7 (ORDER: SIGHT BEFORE CONTEXT): pia, aimed OUTSIDE alice's hidden project run, still reads it as "
    + "absent, byte for byte",
    norm(await suggest(PIA, PRUN.run, QX, "", { name: "pia's x probe" }), PRUN.run),
    norm(await suggest(PIA, NEVER, QX, "", { name: "pia's x probe" }), NEVER));
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean, so this line
   existing at all is part of what the count means (WORKER.md). */
console.log(`\nrec165-production-principal: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

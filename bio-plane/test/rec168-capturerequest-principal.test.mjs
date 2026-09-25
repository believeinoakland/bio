/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec168-capturerequest-principal.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec168-capturerequest-principal.control.mjs [arm]`. RESULTS, RUN 2026-09-23 by REC-168 (CONDUCT #14's worker, cloud) on 7b4d3942 + this item (real src/index.mjs 704,992 B sha256 d0b1df9cf585…, src/store.mjs 2,803,630 B 7aa1e7b90a40…, src/airun.mjs 138,642 B f47ddd05121a…, checks/bio-checks.mjs 816,787 B b6f1621e26ce…, untouched: YES), EVERY ARM AS DECLARED (two declarations corrected at the first run, the ARMS right: `no-stamp` also fails F1-F3, because with no stamp nothing overwrites a forged query `principal`; `exact-match` also fails S2): baseline 30/0 · **drop-gate — THE ROW'S CONTROL, `runPrincipalGate`'s refusal in `captureRequest` removed -> 18/12: R1 R2 R3 R4 R5 R6 (THE OTHER PRINCIPAL, session AND credential, and no row written) by name, with S3 U2 F1 F2 F3 I1** · gate-sessions-only (THE LIAR, credentials ungated) -> 24/6: R2 R6 S3 F2 F3 I1 · gate-credentials-only (THE LIAR, sessions ungated) -> 20/10: R1 R3 R4 R5 R6 S3 U2 F1 F3 I1 · no-stamp (`capturerequest` out of RUN_PRODUCTION_ACTIONS) -> 19/11: L1-L4 S1 S2 F1-F4 I0 · no-sight -> 29/1: U1 · record-run-principal (the row takes the run's copy again) -> 27/3: L2 L3 L4 · sent-field-query -> 27/3: F1 F2 F3 · sent-field-body -> 26/4: F1-F4 · exact-match (a fence tighter than the rule) -> 26/4: L2 L3 L4 S2 · sight-by-row (over-strictness) -> 30/0. BEFORE THIS ITEM (the suite run against `7b4d3942`'s sources): 14 pass, 16 fail — cora, her credential and gus filed requests under alice's runs and the rows credited alice; pia filed one under a run over a project she cannot see; and a row named the run's principal, not the account that asked.
 * =========================================================================
 * REC-168 — A CAPTURE REQUEST THAT NAMES A RUN NAMES A RUNNING RUN ITS CALLER HOLDS, AND THE ROW RECORDS THE CALLER.
 *
 * `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, the paragraph *`op=capturerequest` — RULED 2026-09-22 by
 * BOB #28*: rule 1 applies — *a request that names a run is a production of that run, so it names a RUNNING run
 * whose PRINCIPAL is the caller, by the same stamp, the same sight check first and `runPrincipalGate`.* Rule 1's
 * TARGET does not (a request names an address, not a question). A request naming no run is the member's own and is
 * untouched.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`7b4d3942`): `captureRequest` asked only that the run is
 * `running`, never whose, and COPIED the run's principals into the row — so cora could file a request under alice's
 * run and the record said alice's run, under `member:alice`, asked for it. The arms below were run against that tree
 * first (the tally is on the NEGATIVE CONTROL line above).
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: gate ONE caller kind only. A gate asked of
 * member SESSIONS alone passes every session arm while any machine credential files under anybody's run — and the
 * reverse. So every refusal and every landing below is driven from BOTH a member session AND an `ai` credential
 * that member minted. And compare with a field the caller SENDS: ARM F sends alice's id in every spelling a request
 * can carry, and must still be refused.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store; (ii) no surface — it asserts what the plane SENDS and
 * what `op=capturerequests` reads back; (iii) no organisation-kind `ai` key (REC-152's suite covers that branch);
 * (iv) the DRAIN — the row's principal is what the drain's attribution composes from (`#captureRequestAttribution`,
 * asserted on the READ here, which calls the same one function); (v) `agent-worker`'s one `capturerequest` site,
 * which calls with the credential that ticks the run and so is one principal with it (measured, not driven here).
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.REC168_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { AI_RUN_CHECKS, CAPTURE_REQUEST_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec168", MEM = "mem-rec168";
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

const NOW = "2026-09-23T00:00:00Z", LATER = "2026-09-23T01:00:00Z";
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
    snapKey: `20260923T1200${String(++seq).padStart(2, "0")}Z_aaaa1111`,
    /* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: the label `title for ${id}` contradicted the question's
       own `title:` and is now refused; the project's document states no title, so the label stays its only name. */
    meta: { object_type: type, group: "believe-in-oakland", ...(type === "project" ? { title: `title for ${id}` } : {}),
            current_state: type === "project" ? "forming" : "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [],
  };
};

const Q = "INQ-2026-9168-question";   // a question every member can read
let P = null;
console.log("\n--- FIXTURE: one project (alice and cora joined, pia not), one readable question ---");
{
  const p = await POST(`op=promote&${RUTH}`, bundle("rec168 project", "project"));
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

/* THE CREDENTIALS: each member mints an `ai` credential whose principal is herself, declaring the door and the
   run verbs. */
const mint = async (tok, tokenId) => POST(`op=aicredentialmint&${tok}`,
  { tokenId, principalKind: "member", taskScope: "investigative",
    writes: ["airunopen", "airuntick", "airunclose", "capturerequest"],
    note: "REC-168: requests captures under its member's runs" });
const ak = await mint(ALICE, "alice-agent"), ck = await mint(CORA, "cora-agent");
const AK = ak?.token ? `token=${ak.token}` : null, CK = ck?.token ? `token=${ck.token}` : null;
t("FIXTURE: alice and cora each mint an `ai` credential whose principal is themselves",
  [ak?.credential?.principal, ck?.credential?.principal, !!AK, !!CK], ["member:alice", "member:cora", true, true]);

let runSeq = 0;
const openAs = async (tok, contextId, contextType) => {
  const run = `RUN-2026-0923-rec168-${++runSeq}`;
  const r = await POST(`op=airunopen&${tok}`, {
    run, contextType, contextId, label: "REC-168 run", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 600000 });
  return { run, r };
};
const readRun = async (run) => parse(await RAW(`op=airun&token=${ADM}&run=${E(run)}`))?.session ?? null;

let addrSeq = 0;
/* THE ONE REQUESTER. Every address is FRESH unless an arm names one, so the door's (run, address) idempotence can
   never answer for the gate. */
const request = (tok, run, extraQ = "", body = {}) => RAW(`op=capturerequest&${tok}${extraQ}`, {
  ...(run === undefined ? {} : { run }), target: Q, purpose: "investigate",
  address: `https://www.oaklandca.gov/files/rec168-${++addrSeq}.pdf`, ...body });
/* THE ROWS, read back through the op (the admin's machine viewer sees every target). */
const rowsOf = async (run) => (parse(await RAW(`op=capturerequests&token=${ADM}&run=${E(run)}&limit=1000`))?.requests ?? null);
const allRows = async () => (parse(await RAW(`op=capturerequests&token=${ADM}&limit=1000`))?.requests ?? null);

const QRUN = await openAs(ALICE, Q, "inquiry");   // alice's session's run over the question
const KRUN = await openAs(AK, Q, "inquiry");      // a run alice's CREDENTIAL opened
const PRUN = await openAs(ALICE, P, "project");   // alice's run over the project pia cannot see
t("REACH: alice's three runs are really running and the plane STAMPED her (or her credential) as each run's "
  + "principal — every refusal below would pass vacuously over a run that never started",
  [QRUN.r?.started, KRUN.r?.started, PRUN.r?.started,
   (await readRun(QRUN.run))?.principal?.plane, (await readRun(KRUN.run))?.principal?.plane],
  [true, true, true, "member:alice", "member:alice/alice-agent"]);

const C = AI_RUN_CHECKS.AI_RUN_NOT_PRINCIPAL;
const NR = CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NO_RUN;
const refused = (a) => [a?.ok, a?.code, a?.check, a?.translation];
const WANT = [false, "AI_RUN_NOT_PRINCIPAL", C?.check, C?.translation];

console.log("\n--- ARM R · ANOTHER PRINCIPAL'S RUNNING RUN IS REFUSED, FROM BOTH CALLER KINDS, AND WRITES NO ROW ---");
{
  const before = await allRows();
  const r1 = parse(await request(CORA, QRUN.run));
  const r2 = parse(await request(CK, QRUN.run));
  const r3 = parse(await request(GUS, QRUN.run));
  const r4 = parse(await request(CORA, KRUN.run));
  t("ARM R1 (THE OTHER PRINCIPAL, SESSION): cora cannot file a request under alice's running run over a question "
    + "she CAN read — refused positionally, C-22.12, by code", refused(r1), WANT);
  t("ARM R2 (THE OTHER PRINCIPAL, CREDENTIAL): nor can cora's own minted credential", refused(r2), WANT);
  t("ARM R3: nor gus, an administrator — he sees every project and directs none (§4)", refused(r3), WANT);
  t("ARM R4: nor cora under the run alice's CREDENTIAL opened", refused(r4), WANT);
  t("ARM R5: the detail names the ACT refused (runPrincipalGate's `act`), and the reason is spelled as the code",
    [/^requesting a capture under a run is its principal's act/.test(r1?.detail ?? ""), r1?.reason],
    [true, "AI_RUN_NOT_PRINCIPAL"]);
  const after = await allRows();
  t("ARM R6 (NO ROW WRITTEN): the queue holds exactly the rows it held before the four refusals",
    [Array.isArray(before), (after ?? []).length], [true, (before ?? []).length]);
}

console.log("\n--- ARM L · THE CALLER'S OWN RUNNING RUN LANDS, NAMING THE CALLER, FROM A SESSION AND FROM HER CREDENTIAL ---");
{
  const l1 = parse(await request(ALICE, QRUN.run));
  const l2 = parse(await request(AK, QRUN.run));
  const l3 = parse(await request(ALICE, KRUN.run));
  t("ARM L1 (SESSION): alice files under her own running run — it lands as `requested`, naming member:alice",
    [l1?.ok, l1?.state, l1?.code ?? null, l1?.principals?.plane], [true, "requested", null, "member:alice"]);
  t("ARM L2 (CREDENTIAL): her minted credential files under the run her SESSION opened — one principal, and the "
    + "row names the CREDENTIAL that asked", [l2?.ok, l2?.state, l2?.principals?.plane],
    [true, "requested", "member:alice/alice-agent"]);
  t("ARM L3 (THE CALLER, NOT THE RUN): her session files under the run her CREDENTIAL opened — the row names her "
    + "session, not the credential the run's copy would have named", [l3?.ok, l3?.principals?.plane],
    [true, "member:alice"]);
  /* THE ROW, read back: the echo could say one thing and the row another. */
  const byReq = new Map([...(await rowsOf(QRUN.run) ?? []), ...(await rowsOf(KRUN.run) ?? [])].map((r) => [r.request, r]));
  t("ARM L4 (THE ROW): op=capturerequests reads back each row's attribution under the CALLER's principal, the "
    + "claude principal still the run's",
    [l1, l2, l3].map((l) => byReq.get(l?.request)?.attribution?.principals ?? null),
    [{ plane: "member:alice", claude: "member" }, { plane: "member:alice/alice-agent", claude: "member" },
     { plane: "member:alice", claude: "member" }]);
}

console.log("\n--- ARM N · A REQUEST NAMING NO RUN IS UNCHANGED ---");
{
  const before = await allRows();
  const n1 = await request(ALICE, undefined), n2 = await request(AK, undefined);
  const n3 = await request(CORA, undefined, "", { run: "" });
  /* The STORE's answer, whole: the envelope's `tokenClass` names the caller's class and is expected to differ. */
  const strip = (r) => ({ status: r.status, type: r.type, result: JSON.stringify(parse(r)) });
  t("ARM N1 (SESSION): a request naming no run is refused CAPTURE_REQUEST_NO_RUN with DEC-47's words, as before",
    [parse(n1)?.ok, parse(n1)?.code, parse(n1)?.check, parse(n1)?.translation, parse(n1)?.run,
     /^pass run=<the run asking>/.test(parse(n1)?.detail ?? "")],
    [false, "CAPTURE_REQUEST_NO_RUN", NR?.check, NR?.translation, null, true]);
  t("ARM N2 (CREDENTIAL): and from her credential, and from another member with an empty run, the answer is "
    + "BYTE-IDENTICAL — no principal is asked of a request that names no run",
    [strip(n2), strip(n3)], [strip(n1), strip(n1)]);
  t("ARM N3 (NO ROW WRITTEN)", ((await allRows()) ?? []).length, (before ?? []).length);
}

console.log("\n--- ARM S · STATUS: THE CALLER'S ENDED RUN IS REFUSED, AND POSITION IS ASKED BEFORE STATUS ---");
{
  const ended = await openAs(ALICE, Q, "inquiry");
  const closed = parse(await RAW(`op=airunclose&${ALICE}`, { run: ended.run, bound: "completed" }));
  t("ARM S0 (REACH): alice's run is opened and then ENDED by her", [ended.r?.started, closed?.terminated], [true, true]);
  const s1 = parse(await request(ALICE, ended.run)), s2 = parse(await request(AK, ended.run));
  t("ARM S1 (SESSION): alice cannot file under her own ENDED run — CAPTURE_REQUEST_NO_RUN, unchanged",
    [s1?.ok, s1?.code, s1?.check, s1?.run], [false, "CAPTURE_REQUEST_NO_RUN", NR?.check, ended.run]);
  t("ARM S2 (CREDENTIAL): nor can her minted credential", [s2?.ok, s2?.code], [false, "CAPTURE_REQUEST_NO_RUN"]);
  const s3 = parse(await request(CORA, ended.run)), s4 = parse(await request(CK, ended.run));
  t("ARM S3 (ORDER: POSITION BEFORE STATUS): cora and her credential, under alice's ENDED run, are told it is not "
    + "theirs, never its status", [s3?.code, s4?.code], ["AI_RUN_NOT_PRINCIPAL", "AI_RUN_NOT_PRINCIPAL"]);
}

console.log("\n--- ARM U · A CALLER WHO CANNOT SEE THE RUN'S CONTEXT IS ANSWERED AS FOR A RUN THAT DOES NOT EXIST ---");
{
  const NEVER = "RUN-2026-0923-never-minted";
  const norm = (r, id) => ({ status: r.status, type: r.type, body: r.body.split(id).join("<RUN>") });
  const addr = { address: "https://www.oaklandca.gov/files/rec168-pia.pdf" };
  const uN = await request(PIA, NEVER, "", addr);
  t("ARM U0 (REACH): pia's request under a never-minted run is refused for the RUN, so the byte arm below "
    + "compares something real", parse(uN)?.code, "CAPTURE_REQUEST_NO_RUN");
  const uU = await request(PIA, PRUN.run, "", addr);
  t("ARM U1 (SIGHT): pia cannot see the project, and her request under alice's run over it is BYTE-IDENTICAL to "
    + "one under a run id nobody minted (the id she sent is the only difference)",
    norm(uU, PRUN.run), norm(uN, NEVER));
  const cU = await request(CORA, PRUN.run);
  t("ARM U2 (SIGHT IS NOT POSITION): cora, who CAN see the project, is told the run is not hers — so U1's answer "
    + "is the sight check's and not a refusal every non-principal gets", parse(cU)?.code, "AI_RUN_NOT_PRINCIPAL");
}

console.log("\n--- ARM F · THE FORGED PRINCIPAL: a caller who SENDS alice's id is still refused ---");
{
  const q = `&principal=${E("member:alice")}&caller=${E("member:alice")}&actor=${E("member:alice")}`
          + `&identity=${E("member:alice")}&viewer=${E("member:alice")}`;
  const b = { caller: "member:alice", principal: "member:alice", principalPlane: "member:alice",
              principal_plane: "member:alice", actor: "member:alice" };
  const before = await allRows();
  t("ARM F1 (THE FORGED PRINCIPAL, SESSION): cora sends alice's id in every field of query and body — refused "
    + "positionally", refused(parse(await request(CORA, QRUN.run, q, b))), WANT);
  t("ARM F2 (THE FORGED PRINCIPAL, CREDENTIAL): and so is cora's credential",
    refused(parse(await request(CK, QRUN.run, q, b))), WANT);
  t("ARM F3 (NO ROW WRITTEN)", ((await allRows()) ?? []).length, (before ?? []).length);
  const own = parse(await request(ALICE, QRUN.run, "", { caller: "member:cora", principal_plane: "member:cora" }));
  t("ARM F4 (THE ROW NAMES THE STAMP, NEVER A SENT FIELD): alice sending cora's id in the body still lands under "
    + "member:alice", [own?.ok, own?.principals?.plane], [true, "member:alice"]);
}

console.log("\n--- ARM I · IDEMPOTENCE ANSWERS NOBODY THE RUN IS NOT THEIRS ---");
{
  const addr = { address: "https://www.oaklandca.gov/files/rec168-standing.pdf" };
  const first = parse(await request(ALICE, QRUN.run, "", addr));
  const again = parse(await request(ALICE, QRUN.run, "", addr));
  t("ARM I0 (REACH): alice's second ask for one address returns her standing row",
    [first?.requested, again?.already, again?.request === first?.request], [true, true, true]);
  const c = parse(await request(CORA, QRUN.run, "", addr)), k = parse(await request(CK, QRUN.run, "", addr));
  t("ARM I1: cora and her credential asking for the SAME address under alice's run are refused — the standing "
    + "row (and alice's principal on it) is never echoed to them",
    [refused(c), refused(k), "request" in (c ?? {}), "principals" in (k ?? {})], [WANT, WANT, false, false]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean, so this line
   existing at all is part of what the count means (WORKER.md). */
console.log(`\nrec168-capturerequest-principal: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

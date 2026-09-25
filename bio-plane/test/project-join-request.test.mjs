/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/project-join-request.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/project-join-request.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once) and the real sources are hashed before and after; what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RUN 2026-09-25 on branch land/worker/REC-150 over origin/main 964da679 (real sources untouched: YES, by sha256), every arm AS DECLARED on its first run: (a) baseline 62/0 · (b) grant-writes-joined 61/1, the row's own named control — the grant writes `joined`, and §3c (the read-back through op=projectparticipants, "INVITED and NOT JOINED") fails by name while §3b stays green, because the act's own RETURN still says `invited` — the claim a liar keeps, and why §3c reads the record · (c) admin-answers 58/4 — §3a and §3a' by name, §3b and §3c' as declared consequences · (d) lapse-dropped 55/7 — §5a, §5b, §5e by name, with §5d GREEN (the acts answer through sight, which the lapse never touches) · (e) hidden-answered-positionally 61/1 — only §1c' fails: §1c's byte comparison stays green because a hidden id and a never-minted one then answer the same FALSE thing, so a byte comparison proves indistinguishability and never truth · (f) one-open-respelled 62/0, the over-strictness arm.
 * =========================================================================
 * REC-150 / C-95 / IC-320 — THE REQUEST TO JOIN (Membership Architecture v2 §7, item 7.14, "The request to join";
 * step 2 of its decomposition, on REC-149's EXISTENCE level). Bob, 2026-09-18: *"somebody who sees the project can
 * ask to be added as a member"*.
 *
 * WHAT IS ASSERTED, THROUGH THE OPS (never the store alone):
 *   §1 ASK — a member at EXISTENCE asks (one OPEN at a time, an optional comment); a hidden project, a
 *      never-minted id and a non-project bundle answer `#noSuchProject` BYTE FOR BYTE; a caller with FULL sight
 *      (an invited participant, an administrator, the founder) is refused C-95.2; a credential with no member
 *      behind it C-95.1; the directory carries the caller's own request state.
 *   §2 WHO SEES — the requester (its own), the owner and administrators (the project's), and NOT another
 *      participant (C-95.9); at EXISTENCE the project's own id answers C-70.1.
 *   §3 GRANT — THE ROW'S ACCEPTANCE: a grant leaves the requester `invited` and NOT `joined`; the member then
 *      joins by the checkbox (§7.4). An administrator's grant is refused (C-95.5), and the founder's, a machine's
 *      and a non-owner participant's.
 *   §4 DECLINE AND WITHDRAW — recorded; asking again afterwards is allowed; a withdrawal with no open request is
 *      ONE answer whatever the id names.
 *   §5 LAPSE — setting the project HIDDEN lapses every open request; the lapsed requester reads its own request
 *      (naming only what it already saw) and NOTHING ELSE about the project: every act and read answers it as for
 *      a project that does not exist.
 *   §6 GRANT'S TWO REFUSALS about the requester (C-95.7 inactive, C-95.8 already a participant).
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) A grant that writes `joined` — "the owner said yes, so they are in". The requester then reads a project it
 *       never chose to join. §3b reads the participation back through op=projectparticipants and demands
 *       `invited`, and §3d demands the requester's own checkbox is what moves it to `joined`. The control's
 *       `grant-writes-joined` arm is the row's named NEGATIVE CONTROL.
 *   (2) Let an administrator answer — sight of every project read as authority over one. §3a drives the founder,
 *       an enrolled administrator and the operator's bearer, and each is refused C-95.5 with nothing written.
 *   (3) Forget the lapse — hiding a project leaves its open requests open, and the requester keeps reading a
 *       project the owners have just hidden. §5 demands `lapsed` and the absent answer at every act.
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.PROJECT_JOIN_REQUEST_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec150", MEM = "mem-rec150";
const root = mkdtempSync(join(tmpdir(), "rec150-"));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const E = encodeURIComponent;
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = (title, cites) => ["---", "object_type: project", `title: "${title}"`, "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
  "required_strength:", "  capture: B", "  connection: C", "---", "", "## Summary", "", "A project.", "",
  "## Session Log", ""].join("\n");
const meta = (type, state, title) => ({ object_type: type, group: "believe-in-oakland", title,
  current_state: state, created: NOW, last_updated: LATER });
let seq = 0;
const LEDGER = "INFO-2026-9150-ledger";
const TITLE_P = "Discoverable transit project 9150", TITLE_Q = "Hidden transit project 9150";
const NEVER = `PROJ-${new Date().toISOString().slice(0, 4)}-0000-never-minted-9150`;

let mf = null;
try {
mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  durableObjectsPersist: join(root, "persist"),
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
}));
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: await res.text() };
};
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
};
const POST = async (q, b) => parse(await RAW(q, b ?? {}));
const GET = async (q) => parse(await RAW(q));

must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-150" }));
const FOUNDER = (await POST("op=login", { password: "founder-passphrase-150" })).token;
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-passphrase-150` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-150` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin");    /* an enrolled administrator */
const IRIS = await enrol("iris", "member");   /* P's and Q's owner */
const VERA = await enrol("vera", "member");   /* outside P: the requester who is GRANTED */
const PAM = await enrol("pam", "member");     /* outside P: declined, withdraws, lapses */
const OLGA = await enrol("olga", "member");   /* INVITED to P, never joins */
const JO = await enrol("jo", "member");       /* JOINED P, not an owner */
const DAN = await enrol("dan", "member");     /* asks, then is revoked */
const KAI = await enrol("kai", "member");     /* asks, then is invited directly */

must(LEDGER, await POST(`op=promote&token=${ADM}`, { bundleId: LEDGER, base: null, snapKey: `${LEDGER}-${++seq}`,
  files: [{ path: "bundle.md", text: infoMd(LEDGER), bytes: infoMd(LEDGER).length, sha256: sha(infoMd(LEDGER)) }],
  register: [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${LEDGER}`), encoding: "binary", bytes: 10 }],
  meta: meta("information", "collected", `Info ${LEDGER}`) }));
const createProject = async (title) => {
  const text = projectMd(title, [LEDGER]);
  const id = must(`create ${title}`, await POST(`op=promote&token=${ADM}`, { base: null, snapKey: `rec150-create-${++seq}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: meta("project", "forming", title) })).bundleId;
  must(`iris owns ${title}`, await DO("projectclaimowner", { projectId: id, memberId: "iris" }));
  return id;
};
const P = await createProject(TITLE_P), Q = await createProject(TITLE_Q);
must("iris invites olga", await POST(`op=projectinvite&token=${IRIS}&projectId=${P}&handle=olga`));
must("iris invites jo", await POST(`op=projectinvite&token=${IRIS}&projectId=${P}&handle=jo`));
must("jo joins", await POST(`op=projectjoin&token=${JO}&projectId=${P}`));
must("iris sets P discoverable", await POST(`op=projectvisibilityset&token=${IRIS}&projectId=${P}&setting=discoverable`));
t("0: the fixture — two projects with distinct ids, P discoverable and Q hidden (never set)",
  [P !== Q, (await GET(`op=projectvisibility&token=${IRIS}&projectId=${P}`))?.setting,
   (await GET(`op=projectvisibility&token=${IRIS}&projectId=${Q}`))?.setting], [true, "discoverable", "hidden"]);

/* "Byte for byte" is measured on the RAW body with the id the caller sent replaced — the one thing an absent
   answer may echo — so a hidden project and a never-minted id are compared as the caller receives them. */
const asAbsent = async (q, X) => { const r = await RAW(q(X)); return `${r.status} ${r.body.split(X).join("<ID>")}`; };
const sameAsNever = async (q, X) => [await asAbsent(q, X), await asAbsent(q, NEVER)];
const participants = async () => (await GET(`op=projectparticipants&token=${IRIS}&projectId=${P}`))?.participants
  ?.map((p) => [p.handle, p.state]);

/* ================================================================================================ 1. ASK */
console.log("\n--- 1. ASK: a member at EXISTENCE asks; everybody else is answered without disclosure ---");
{
  const r = await POST(`op=projectrequest&token=${VERA}&projectId=${P}&comment=${E("I ride the 72 daily")}`);
  t("1a: vera (outside P, P discoverable) ASKS — recorded open, with her comment and P's name",
    [r?.ok, r?.state, r?.comment, r?.name, typeof r?.asked], [true, "open", "I ride the 72 daily", TITLE_P, "string"]);
  const again = await POST(`op=projectrequest&token=${VERA}&projectId=${P}`);
  t("1b: ONE OPEN REQUEST per member per project — vera's second ask is refused C-95.3, naming when she asked",
    [codeOf(again), again?.check, again?.asked === r?.asked, typeof again?.translation],
    ["PROJECT_REQUEST_ALREADY_OPEN", "C-95.3", true, "string"]);
  const [hid, nev] = await sameAsNever((X) => `op=projectrequest&token=${VERA}&projectId=${X}&comment=hi`, Q);
  t("1c: a request to a HIDDEN project is answered exactly as one to a never-minted id — byte for byte", hid, nev);
  t("1c': and that answer is the absent one", JSON.parse(hid.slice(4))?.result?.reason ?? JSON.parse(hid.slice(4))?.reason,
    "NO_SUCH_PROJECT");
  const [inf, nev2] = await sameAsNever((X) => `op=projectrequest&token=${VERA}&projectId=${X}`, LEDGER);
  t("1d: a request naming a bundle that is not a project answers as no project by that id — byte for byte", inf, nev2);
  const olga = await POST(`op=projectrequest&token=${OLGA}&projectId=${P}`);
  const jo = await POST(`op=projectrequest&token=${JO}&projectId=${P}`);
  const ruth = await POST(`op=projectrequest&token=${RUTH}&projectId=${P}`);
  const iris = await POST(`op=projectrequest&token=${IRIS}&projectId=${P}`);
  t("1e: a caller with FULL sight asks nothing — invited olga, joined jo, administrator ruth and owner iris are "
  + "each refused C-95.2", [codeOf(olga), codeOf(jo), codeOf(ruth), codeOf(iris), olga?.check],
    ["PROJECT_REQUEST_NOT_OUTSIDE", "PROJECT_REQUEST_NOT_OUTSIDE", "PROJECT_REQUEST_NOT_OUTSIDE",
     "PROJECT_REQUEST_NOT_OUTSIDE", "C-95.2"]);
  const founder = await POST(`op=projectrequest&token=${FOUNDER}&projectId=${P}`);
  t("1f: the founder asks nothing either — the founder sees every project, so is refused C-95.2 like any "
  + "administrator", [founder?.ok, codeOf(founder)], [false, "PROJECT_REQUEST_NOT_OUTSIDE"]);
  const adm = await POST(`op=projectrequest&token=${ADM}&projectId=${P}`);
  const mem = await POST(`op=projectrequest&token=${MEM}&projectId=${P}`);
  t("1g: a credential with no member behind it — the operator's bearer, the member bearer — is refused C-95.1",
    [codeOf(adm), codeOf(mem), adm?.check], ["PROJECT_REQUEST_NEEDS_A_MEMBER", "PROJECT_REQUEST_NEEDS_A_MEMBER", "C-95.1"]);
  const dir = await GET(`op=projectdirectory&token=${VERA}`);
  t("1h: vera's DIRECTORY carries her own request's state beside P, and nothing else",
    dir?.projects?.map((p) => [p.id, p.name, p.request?.state, typeof p.request?.asked, p.request?.closed]),
    [[P, TITLE_P, "open", "string", null]]);
  t("1i: pam, who never asked, reads `request: null` — null is now a fact about her",
    (await GET(`op=projectdirectory&token=${PAM}`))?.projects, [{ id: P, name: TITLE_P, request: null }]);
  t("1j: the directory no longer carries REC-149's \"not built\" caveat", "requests" in (dir || {}), false);
}

/* ========================================================================================= 2. WHO SEES */
console.log("\n--- 2. WHO SEES A REQUEST: the requester, the owners, administrators — not other participants ---");
{
  const own = await GET(`op=projectrequests&token=${VERA}`);
  t("2a: vera reads her OWN requests without naming a project — P by id and the name she was shown",
    own?.requests?.map((q) => [q.project, q.name, q.comment, q.state]), [[P, TITLE_P, "I ride the 72 daily", "open"]]);
  t("2a': and her own view does not name who answers — who owns P is contents",
    own?.requests?.every((q) => !("closed_by" in q)), true);
  const byOwner = await GET(`op=projectrequests&token=${IRIS}&projectId=${P}`);
  t("2b: iris (the owner) reads P's requests — the requester's handle and comment",
    byOwner?.requests?.map((q) => [q.handle, q.comment, q.state]), [["vera", "I ride the 72 daily", "open"]]);
  const byAdmin = await GET(`op=projectrequests&token=${RUTH}&projectId=${P}`);
  const byFounder = await GET(`op=projectrequests&token=${FOUNDER}&projectId=${P}`);
  t("2c: an administrator and the founder SEE P's requests (§7.3)",
    [byAdmin?.requests?.length, byFounder?.requests?.length], [1, 1]);
  const olga = await GET(`op=projectrequests&token=${OLGA}&projectId=${P}`);
  const jo = await GET(`op=projectrequests&token=${JO}&projectId=${P}`);
  t("2d: another participant does NOT — invited olga and joined jo are refused C-95.9 (§7.8: a pending requester "
  + "is not a participant)", [codeOf(olga), codeOf(jo), jo?.check],
    ["PROJECT_REQUESTS_NOT_VISIBLE", "PROJECT_REQUESTS_NOT_VISIBLE", "C-95.9"]);
  const veraP = await GET(`op=projectrequests&token=${VERA}&projectId=${P}`);
  t("2e: vera, outside P, naming P's own id is answered POSITIONALLY at EXISTENCE (C-70.1, BOB #32 (a)) — the "
  + "id and name and nothing else", [codeOf(veraP), veraP?.project, veraP?.name, "requests" in (veraP || {})],
    ["PROJECT_SEEN_NOT_A_PARTICIPANT", P, TITLE_P, false]);
  const [hid, nev] = await sameAsNever((X) => `op=projectrequests&token=${PAM}&projectId=${X}`, Q);
  t("2f: a HIDDEN project's requests read exactly as a never-minted id's", hid, nev);
}

/* ============================================================================================ 3. GRANT */
console.log("\n--- 3. GRANT is an INVITATION: the requester is INVITED and NOT JOINED; only an owner answers ---");
{
  const byRuth = await POST(`op=projectrequestanswer&token=${RUTH}&projectId=${P}&handle=vera&answer=grant`);
  const byFounder = await POST(`op=projectrequestanswer&token=${FOUNDER}&projectId=${P}&handle=vera&answer=grant`);
  const byAdm = await POST(`op=projectrequestanswer&token=${ADM}&projectId=${P}&handle=vera&answer=grant`);
  const byJo = await POST(`op=projectrequestanswer&token=${JO}&projectId=${P}&handle=vera&answer=grant`);
  t("3a: AN ADMINISTRATOR'S GRANT IS REFUSED — ruth, the founder, the operator's bearer and joined non-owner jo "
  + "are each refused C-95.5", [codeOf(byRuth), codeOf(byFounder), codeOf(byAdm), codeOf(byJo), byRuth?.check],
    ["PROJECT_REQUEST_ANSWER_NOT_THE_OWNER", "PROJECT_REQUEST_ANSWER_NOT_THE_OWNER",
     "PROJECT_REQUEST_ANSWER_NOT_THE_OWNER", "PROJECT_REQUEST_ANSWER_NOT_THE_OWNER", "C-95.5"]);
  t("3a': and NOTHING was written — vera is no participant and her request is still open",
    [(await participants()).some(([h]) => h === "vera"),
     (await GET(`op=projectrequests&token=${VERA}`))?.requests?.map((q) => q.state)], [false, ["open"]]);
  const byPam = await POST(`op=projectrequestanswer&token=${PAM}&projectId=${P}&handle=vera&answer=grant`);
  t("3a'': pam, outside P, answering is told what EXISTENCE tells her (C-70.1) — not whether a request exists",
    codeOf(byPam), "PROJECT_SEEN_NOT_A_PARTICIPANT");
  const word = await POST(`op=projectrequestanswer&token=${IRIS}&projectId=${P}&handle=vera&answer=accept`);
  t("3b0: an answer that is neither grant nor decline is refused C-95.6", [codeOf(word), word?.check],
    ["PROJECT_REQUEST_UNKNOWN_ANSWER", "C-95.6"]);
  const none = await POST(`op=projectrequestanswer&token=${IRIS}&projectId=${P}&handle=pam&answer=grant`);
  t("3b1: granting a member with no open request is refused C-95.4 and invites nobody",
    [codeOf(none), (await participants()).some(([h]) => h === "pam")], ["PROJECT_REQUEST_NONE_OPEN", false]);
  const g = await POST(`op=projectrequestanswer&token=${IRIS}&projectId=${P}&handle=vera&answer=grant&comment=${E("welcome")}`);
  t("3b: iris GRANTS — the request reads granted and the participation it wrote is `invited`",
    [g?.ok, g?.state, g?.participation, g?.comment], [true, "granted", "invited", "welcome"]);
  const vera = (await participants()).find(([h]) => h === "vera");
  t("3c: THE ROW'S ACCEPTANCE — read back through op=projectparticipants, vera is INVITED and NOT JOINED",
    vera, ["vera", "invited"]);
  const req = await GET(`op=projectrequests&token=${IRIS}&projectId=${P}`);
  t("3c': the owner's view records the answer and the answering owner",
    req?.requests?.map((q) => [q.handle, q.state, q.closed_by, q.closed_comment, typeof q.closed]),
    [["vera", "granted", "iris", "welcome", "string"]]);
  t("3c'': P leaves vera's directory — an invited member has FULL sight, so P is no longer a project to ask to join",
    (await GET(`op=projectdirectory&token=${VERA}`))?.projects, []);
  const j = await POST(`op=projectjoin&token=${VERA}&projectId=${P}`);
  t("3d: vera JOINS BY THE CHECKBOX (§7.4) — her own act, and only now is she joined",
    [j?.ok, (await participants()).find(([h]) => h === "vera")], [true, ["vera", "joined"]]);
  const twice = await POST(`op=projectrequestanswer&token=${IRIS}&projectId=${P}&handle=vera&answer=decline`);
  t("3e: an answered request is not answered again — a second answer finds no open request (C-95.4)",
    codeOf(twice), "PROJECT_REQUEST_NONE_OPEN");
}

/* ============================================================================ 4. DECLINE AND WITHDRAW */
console.log("\n--- 4. DECLINE and WITHDRAW are recorded; asking again is allowed after either ---");
{
  must("pam asks", await POST(`op=projectrequest&token=${PAM}&projectId=${P}&comment=${E("first try")}`));
  const d = await POST(`op=projectrequestanswer&token=${IRIS}&projectId=${P}&handle=pam&answer=decline&comment=${E("not now")}`);
  t("4a: iris DECLINES pam, with a comment — recorded, and pam is invited to nothing",
    [d?.ok, d?.state, d?.comment, "participation" in (d || {}), (await participants()).some(([h]) => h === "pam")],
    [true, "declined", "not now", false, false]);
  const own = await GET(`op=projectrequests&token=${PAM}`);
  t("4b: pam reads her own declined request, with the owner's comment to her",
    own?.requests?.map((q) => [q.project, q.state, q.comment, q.closed_comment]), [[P, "declined", "first try", "not now"]]);
  t("4c: pam's directory shows her latest request's state — declined",
    (await GET(`op=projectdirectory&token=${PAM}`))?.projects?.map((p) => [p.id, p.request?.state]), [[P, "declined"]]);
  const again = await POST(`op=projectrequest&token=${PAM}&projectId=${P}&comment=${E("second try")}`);
  t("4d: after a decline she MAY ask again (§7.14: ownership is the remedy for a nuisance, not a cooldown)",
    [again?.ok, again?.state], [true, "open"]);
  const w = await POST(`op=projectrequestwithdraw&token=${PAM}&projectId=${P}`);
  t("4e: pam WITHDRAWS her open request — recorded withdrawn",
    [w?.ok, w?.state, (await GET(`op=projectrequests&token=${PAM}`))?.requests?.map((q) => q.state)],
    [true, "withdrawn", ["declined", "withdrawn"]]);
  const w2 = await POST(`op=projectrequestwithdraw&token=${PAM}&projectId=${P}`);
  t("4f: withdrawing with nothing open is refused C-95.4", [codeOf(w2), w2?.check], ["PROJECT_REQUEST_NONE_OPEN", "C-95.4"]);
  const [hid, nev] = await sameAsNever((X) => `op=projectrequestwithdraw&token=${PAM}&projectId=${X}`, Q);
  const [dis] = await sameAsNever((X) => `op=projectrequestwithdraw&token=${PAM}&projectId=${X}`, P);
  t("4g: and that refusal is ONE answer whatever the id names — discoverable, hidden, never minted", [hid, dis], [nev, nev]);
  const adm = await POST(`op=projectrequestwithdraw&token=${ADM}&projectId=${P}`);
  t("4h: a credential with no member withdraws nothing (C-95.1)", codeOf(adm), "PROJECT_REQUEST_NEEDS_A_MEMBER");
  const ownAdm = await GET(`op=projectrequests&token=${ADM}`);
  t("4i: and reads no 'own' requests (C-95.1) — it has made none, and an empty list would say otherwise",
    codeOf(ownAdm), "PROJECT_REQUEST_NEEDS_A_MEMBER");
}

/* ============================================================================================ 5. LAPSE */
console.log("\n--- 5. SETTING A PROJECT HIDDEN LAPSES EVERY OPEN REQUEST; the requester keeps only its own record ---");
{
  must("pam asks a third time", await POST(`op=projectrequest&token=${PAM}&projectId=${P}&comment=${E("third try")}`));
  const h = await POST(`op=projectvisibilityset&token=${IRIS}&projectId=${P}&setting=hidden&reason=${E("closing ranks")}`);
  t("5a: iris sets P HIDDEN — the act reports the one open request it lapsed", [h?.ok, h?.requests_lapsed], [true, 1]);
  const own = await GET(`op=projectrequests&token=${PAM}`);
  t("5b: A LAPSED REQUESTER READS ITS OWN REQUEST — lapsed, naming P by the id and name it was shown",
    own?.requests?.at(-1) && [own.requests.at(-1).project, own.requests.at(-1).name, own.requests.at(-1).state,
      own.requests.at(-1).comment], [P, TITLE_P, "lapsed", "third try"]);
  t("5b': and the earlier records are unchanged — a lapse closes only the OPEN row",
    own?.requests?.map((q) => q.state), ["declined", "withdrawn", "lapsed"]);
  t("5c: and NOTHING ELSE — P is gone from her directory", (await GET(`op=projectdirectory&token=${PAM}`))?.projects, []);
  const acts = [
    ["op=projectrequest", (X) => `op=projectrequest&token=${PAM}&projectId=${X}`],
    ["op=projectrequests&projectId=", (X) => `op=projectrequests&token=${PAM}&projectId=${X}`],
    ["op=projectvisibility", (X) => `op=projectvisibility&token=${PAM}&projectId=${X}`],
    ["op=projectjoin", (X) => `op=projectjoin&token=${PAM}&projectId=${X}`],
    ["op=projectinvite", (X) => `op=projectinvite&token=${PAM}&projectId=${X}&handle=dan`],
    ["op=projectrequestanswer", (X) => `op=projectrequestanswer&token=${PAM}&projectId=${X}&handle=dan&answer=grant`],
  ];
  for (const [name, q] of acts) {
    const [lapsed, never] = await sameAsNever(q, P);
    t(`5d: the lapsed requester's ${name} at P is answered exactly as at a never-minted id`, lapsed, never);
  }
  const byOwner = await GET(`op=projectrequests&token=${IRIS}&projectId=${P}`);
  t("5e: the owner's view records the lapse and who hid the project",
    byOwner?.requests?.filter((q) => q.handle === "pam").map((q) => [q.state, q.closed_by]),
    [["declined", "iris"], ["withdrawn", "pam"], ["lapsed", "iris"]]);
  must("iris sets P discoverable again", await POST(`op=projectvisibilityset&token=${IRIS}&projectId=${P}&setting=discoverable`));
  t("5f: discoverable again reopens nothing — pam's directory shows her latest request as lapsed",
    (await GET(`op=projectdirectory&token=${PAM}`))?.projects?.map((p) => [p.id, p.request?.state]), [[P, "lapsed"]]);
  const re = await POST(`op=projectrequest&token=${PAM}&projectId=${P}`);
  t("5g: and she may ask again", [re?.ok, re?.state], [true, "open"]);
  const setD = await POST(`op=projectvisibilityset&token=${IRIS}&projectId=${P}&setting=discoverable`);
  t("5h: setting it discoverable (again) lapses nothing and says nothing about requests",
    [setD?.ok, "requests_lapsed" in (setD || {}),
     (await GET(`op=projectrequests&token=${PAM}`))?.requests?.at(-1)?.state], [true, false, "open"]);
}

/* ============================================================== 6. GRANT'S REFUSALS ABOUT THE REQUESTER */
console.log("\n--- 6. a grant goes to an ACTIVE member who is NOT already a participant ---");
{
  must("dan asks", await POST(`op=projectrequest&token=${DAN}&projectId=${P}`));
  must("dan is revoked", await POST(`op=memberset&token=${ADM}`, { memberId: "dan", status: "revoked" }));
  const g = await POST(`op=projectrequestanswer&token=${IRIS}&projectId=${P}&handle=dan&answer=grant`);
  t("6a: a revoked requester is not invited (C-95.7), and the request stays open",
    [codeOf(g), g?.check, (await participants()).some(([h]) => h === "dan"),
     (await GET(`op=projectrequests&token=${IRIS}&projectId=${P}`))?.requests?.find((q) => q.handle === "dan")?.state],
    ["PROJECT_REQUEST_REQUESTER_INACTIVE", "C-95.7", false, "open"]);
  const d = await POST(`op=projectrequestanswer&token=${IRIS}&projectId=${P}&handle=dan&answer=decline`);
  t("6b: the owner can still decline it", [d?.ok, d?.state], [true, "declined"]);
  must("kai asks", await POST(`op=projectrequest&token=${KAI}&projectId=${P}`));
  must("iris invites kai directly", await POST(`op=projectinvite&token=${IRIS}&projectId=${P}&handle=kai`));
  const k = await POST(`op=projectrequestanswer&token=${IRIS}&projectId=${P}&handle=kai&answer=grant`);
  t("6c: granting a member already a participant is refused C-95.8 — a grant would invite nobody new",
    [codeOf(k), k?.check], ["PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT", "C-95.8"]);
  const kw = await POST(`op=projectrequestwithdraw&token=${KAI}&projectId=${P}`);
  t("6d: and kai, now invited, can still withdraw his own open request", [kw?.ok, kw?.state], [true, "withdrawn"]);
}

/* ======================================== 8. THE REQUESTS READ IS BOUNDED, AND THE BOUND IS PUBLISHED (bounds.test) */
console.log("\n--- 8. op=projectrequests is PAGED: `limit` applied, `truncated` measured one row past the cap ---");
{
  const CEIL = Number((/static PROJECT_REQUESTS_LIMIT = (\d+);/.exec(readFileSync(join(SRC_DIR, "store.mjs"), "utf8")) || [])[1]);
  const whole = await GET(`op=projectrequests&token=${PAM}`);
  const bite = await GET(`op=projectrequests&token=${PAM}&limit=2`);
  const over = await GET(`op=projectrequests&token=${PAM}&limit=${CEIL * 10}`);
  t("8a: the fixture holds more than the bite — pam has made four requests, all listed WHOLE at the default bound",
    [whole?.count, whole?.truncated, whole?.limit, CEIL > 4], [4, false, CEIL, true]);
  t("8b: THE BITE — a limit of two answers exactly two, says so, and says more exists",
    [bite?.count, bite?.limit, bite?.truncated, bite?.requests?.map((q) => q.state)],
    [2, 2, true, whole?.requests?.slice(0, 2).map((q) => q.state)]);
  t("8c: an over-ask is answered AT the ceiling, and the ceiling is what is published", [over?.limit, over?.truncated], [CEIL, false]);
  const pBite = await GET(`op=projectrequests&token=${IRIS}&projectId=${P}&limit=3`);
  const pWhole = await GET(`op=projectrequests&token=${IRIS}&projectId=${P}`);
  t("8d: the project's list is paged the same way — the first three of its requests in the order they were made",
    [pBite?.count, pBite?.truncated, pWhole?.truncated, pBite?.requests?.map((q) => q.handle)],
    [3, true, false, pWhole?.requests?.slice(0, 3).map((q) => q.handle)]);
}

/* ================================================== 7. THE CHECK ROWS REACH THE WIRE WITH THEIR TRANSLATION */
{
  const { PROJECT_JOIN_REQUEST_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));
  t("7a: the C-95 family is nine rows, C-95.1..C-95.9, each with a translation",
    Object.values(PROJECT_JOIN_REQUEST_CHECKS).map((r) => [r.check, typeof r.translation]),
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [`C-95.${n}`, "string"]));
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  if (mf) await mf.dispose();
  rmSync(root, { recursive: true, force: true });
}
console.log(`\nproject-join-request.test.mjs: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

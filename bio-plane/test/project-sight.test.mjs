/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/project-sight.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/project-sight.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once) and the real sources are hashed before and after; what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RUN 2026-09-18 in worktree agent-a93cdfa0fe0f8d435 on base dd52609b (real src/index.mjs 658,971 B sha256 176cbfa2cb58…, src/store.mjs 2,604,600 B sha256 5ba1bb4b00b1…, untouched: YES): (a) baseline 92/0 · (b) cite-distinguishing 90/2 — only cite's byte-identity and never-positional arms · (c) position-first 88/4 — the positional check asked before the sight gate at `#edgeTransition`: sever's and reinstate's byte-identity AND never-positional (C-56-discloses) arms · (d) not-found-to-everyone 72/20 — every byte-identity arm stays GREEN (the lie) and the SEES-NO-ROLE and JOINED arms catch it · (e) roster-stamp-dropped 80/12 — without the control plane's viewer stamp the five roster acts disclose again (and a forged `viewer=` is believed): exactly their §1 and §2 arms · (f) promote-stamp-dropped 88/4 — fails closed, machine credentials included · (g) sight-via-redactor 92/0, the over-strictness arm. RECORDED, NOT SMOOTHED: (d) came back NOT AS DECLARED on the first run because its METHOD perturbed the fixture, and was corrected; (e) came back NOT AS DECLARED because its declaration was one row short (the stamp is also what overwrites a forged viewer), and was then REWRITTEN when the store's absent-viewer rule for the roster acts changed from fail-closed to not-asked (`Store#rosterInSight`) after the first full battery showed fail-closed breaking every suite that drives the roster straight at the store. Reasons at each arm in the driver; re-run, every arm AS DECLARED.
   RE-RUN 2026-09-18 by REC-141 in worktree agent-a12cdccbace704eb6 AFTER correcting this suite (P predicted from the plane's PROJ sequence and asserted at the mint; the fork rows send no newId; §6 CORRECTED from the KNOWN `EXISTS` to the refusal, byte-identical to a never-minted id), real src/index.mjs 660,878 B sha256 98368d9756c0…, src/store.mjs 2,636,157 B sha256 9c6222a402cc…, untouched: YES — every arm AS DECLARED: baseline 94/0 · cite-distinguishing 92/2 · position-first 90/4 · not-found-to-everyone 74/20 · roster-stamp-dropped 82/12 · promote-stamp-dropped 90/4 · sight-via-redactor 94/0 (each +2 passes: the mint-equals-prediction arm and §6's second arm).
 * =========================================================================
 * REC-138 / D-426 / IC-155 — A PROJECT YOU CANNOT SEE IS A PROJECT THAT DOES NOT EXIST, AT EVERY ACT.
 * Membership Architecture v2 §7.9: an UNINVITED member sees nothing of a project, *"Not its
 * existence, not its name, not its references, not its participants."* IC-141's rule for how that is
 * measured: the answer to a caller without standing is BYTE-IDENTICAL to the answer a nonexistent id
 * receives, compared RAW — status, content type and body.
 *
 * HOW THE COMPARISON IS MADE, AND WHY IT IS THE SAME ID. An answer that echoes the project id could
 * never match a DIFFERENT never-minted id, so each act is asked TWICE with the SAME request: once while
 * the id names nothing, and again after the ADMIN token mints it as a project owned by iris that vera
 * was never invited to. Everything else the request names (selections, the bias set, the question)
 * exists in both reads. What changes between the two reads is the project and nothing else.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`dd52609b` + the claim, 29 acts driven): TEN answered
 * the two reads differently — `promote` (ABSENT vs C-56.1), `cite`, `sever`, `reinstate`
 * (NO_SUCH_PROJECT vs C-56.1), `projectinvite`, `projectowneradd`, `projectownerremove`
 * (NO_SUCH_PROJECT vs NOT_THE_OWNER), `projectownerrescue` (NO_SUCH_PROJECT vs ADMIN_ONLY),
 * `projectfork` (NO_SUCH_PROJECT vs NOT_A_PARTICIPANT) and `airunopen` over a project context
 * (projectless-permitted vs AI_RUN_NOT_PROJECT_MEMBER). The other nineteen already matched.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) answer not-found to EVERYONE. Every byte-identity arm goes green. So §3 drives callers who CAN
 *       see the project and hold no role — an INVITED member, an enrolled administrator, the founder —
 *       and each must get the POSITIONAL refusal (C-56.1, NOT_THE_OWNER, ADMIN_ONLY, NOT_JOINED), and
 *       §4 drives the owner, who must get the real answer.
 *   (2) keep the sight gate but ask it AFTER the positional check. The byte arms still fail then, and
 *       §2 names the finding directly: a positional refusal is never said to a caller who cannot see.
 *   (3) forge the stamp. §1 carries a forged `viewer=` on a roster act and a forged `actorViewer` in a
 *       promote body; both are deleted and re-stamped by the control plane, so both still match.
 *   (4) narrow SIGHT for machines. §5 pins that the ADMIN and MEMBER tokens still act on the project.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.PROJECT_SIGHT_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec138", MEM = "mem-rec138";
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
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body) })).json());
};
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const E = encodeURIComponent;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };
/* Every answer that is a statement about the caller's POSITION in a project. Said to a caller who
   cannot see the project, each one is the oracle this item closes. */
const POSITIONAL = ["PROJECT_ACT_NOT_A_PARTICIPANT", "PROJECT_ACT_NOT_THE_OWNER", "NOT_THE_OWNER", "ADMIN_ONLY",
                    "NOT_A_PARTICIPANT", "NOT_JOINED", "AI_RUN_NOT_PROJECT_MEMBER"];

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-138" }));
const FOUNDER = (await POST("op=login", { password: "founder-passphrase-138" })).token;
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-138` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-138` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* The founder counts as the first administrator, so the second must be one too (ADMINS_FIRST). */
const RUTH = await enrol("ruth", "admin");
const IRIS = await enrol("iris", "member");   /* the project's owner */
const VERA = await enrol("vera", "member");   /* NEVER invited: the caller who cannot see it */
const OLGA = await enrol("olga", "member");   /* INVITED, never joins: sees the skeleton, holds no role */
await enrol("pam", "member");                 /* a member iris may invite in §4 */

const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const scalar = (k, v) => v === null ? [`    ${k}: null`] : typeof v === "boolean" ? [`    ${k}: ${v}`] : [`    ${k}: "${String(v)}"`];
const inquiryMd = (id, basis) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the sewer fund transfer follow the adopted process?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references:", `  - target: ${basis}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "recheck_triggers:",
  "  - text: Revisit after the next budget cycle", "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${basis}`, "    role: supports", "basis_versions:", '  - name: "v1"',
  ...scalar("description", "the ledger reading"), ...scalar("relationship", "and"), ...scalar("state", "suggested"),
  ...scalar("derived_from", null), ...scalar("hidden", false), ...scalar("claim", "The transfer followed the adopted process."),
  ...scalar("author", "iris"), ...scalar("at", NOW), "basis_version_grounds:", '  - version: "v1"',
  ...scalar("ground", "g1"), ...scalar("asserted_by", "iris"), ...scalar("at", NOW),
  "basis_version_legs:", '  - version: "v1"', ...scalar("target", basis), ...scalar("role", "supports"),
  ...scalar("ground", "g1"), ...scalar("grade", "B"), ...scalar("grade_axis", "capture"), ...scalar("grade_source", "capture"),
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
/* CORRECTED 2026-09-18 (REC-141, IC-158): `id` null builds a CREATION's bytes, which carry no `id:` line —
   the plane mints the project's id and writes it (C-59.2 refuses bytes already carrying one). */
const projectMd = (id, cites = [], summary = "A project.") => ["---", ...(id === null ? [] : [`id: ${id}`]), "object_type: project",
  `title: "Hidden project 9138"`, "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
                   : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C", "---", "", "## Summary", "", summary, "",
  "## Session Log", ""].join("\n");
const meta = (id, type, state) => ({ object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
  current_state: state, created: NOW, last_updated: LATER });
const pkg = (id, text, type, state, base, snapKey) => ({ bundleId: id, base, snapKey,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: meta(id, type, state) });
let seq = 0;
const promoteAs = (tok, id, text, type, state, base = null) =>
  POST(`op=promote&token=${tok}`, pkg(id, text, type, state, base, `${id}-${++seq}`));
const shaOf = async (id) => (parse(await RAW(`op=list&token=${ADM}&limit=1000`)) || {})
  .bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;

const LEDGER = "INFO-2026-9138-ledger", MINUTES = "INFO-2026-9138-minutes";
for (const d of [LEDGER, MINUTES]) must(d, await promoteAs(ADM, d, infoMd(d), "information", "collected"));
const INQ = "INQ-2026-9138-transfer";
must("inquiry", await promoteAs(ADM, INQ, inquiryMd(INQ, LEDGER), "inquiry", "open"));
must("iris accepts v1", await POST(`op=versionaccept&token=${IRIS}&target=${E(INQ)}&version=v1&reason=${E("borne out")}`, {}));
const BIAS = "BIAS-2026-9138-lens";
const biasMd = (state) => ["---", `id: "${BIAS}"`, 'object_type: "bias"', 'schema: "bias@1"', 'title: "Project lens"',
  `current_state: "${state}"`, `prior_state: ${state === "draft" ? "null" : '"draft"'}`, `created: "${NOW}"`,
  `last_updated: "${LATER}"`, "produced_by:", '  mode: "human"', '  capability_tier: "member"',
  'group: "believe-in-oakland"', "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:",
  "  flag: false", "  since: null", "  source: null", "visuals: []", "statements:", '  - id: "p1"',
  '    kind: "scrutiny"', '    subject: "ENT-2026-0011"',
  '    text: "Figures from the fund\'s own dashboard need the underlying ledger before they bear load."',
  '    justification: "The dashboard is produced by the body under examination."', "    citations: []",
  "    locked: false", "---", "", "## Statements", "", "The lens.", "", "## Adoption", "", "Adopted.", "",
  "## What This Does Not Enforce", "", "BIO checks that each statement names a registered subject. It does NOT "
  + "check whether a second source was independent of the first.", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* The bias set's revision goes straight to the store (an internal write carries no stamp), so the
   fixture does not depend on the promote stamp a control arm removes. */
const bd = must("bias draft", await promoteAs(VERA, BIAS, biasMd("draft"), "bias", "draft"));
must("bias proposed", await DO("promote", { ...pkg(BIAS, biasMd("proposed"), "bias", "proposed", bd.bundleSha, "rec138-bias"),
                                            author: "vera" }));

/* vera's selections, made ONCE and reused, so the handle is the same string in both reads. */
const vSel = async (id) => must(`vera selects ${id}`, await POST(`op=select&token=${VERA}&kind=enumerated`, { ids: [id] })).handle;
const V_MIN = await vSel(MINUTES), V_LED = await vSel(LEDGER);

/* CORRECTED 2026-09-18 (REC-141, IC-158): P was CHOSEN ("PROJ-2026-9138-hidden") and minted at that id after the
   never-minted read. The plane now MINTS a project's id (Membership v2 §7) and refuses a creation naming one, so
   the id cannot be chosen. It is PREDICTED instead, from the plane's own sequence: `op=allocid` takes one step of
   the PROJ sequence (which the mint shares), so the next mint in this private store is that number plus one, with
   the slug of the creation's name. The mint below ASSERTS the minted id equals the prediction, so the comparison
   is still between the SAME id before and after it names a project — never between two different ids. */
const YEAR = new Date().toISOString().slice(0, 4);
const stepped = must("step the PROJ sequence", await POST(`op=allocid&token=${ADM}&prefix=PROJ&year=${YEAR}`));
const P = `PROJ-${YEAR}-${String(Number(String(stepped.id).split("-")[2]) + 1).padStart(4, "0")}-hidden-project-9138`;
const REVISE = pkg(P, projectMd(P, [LEDGER], "A revision."), "project", "forming", "0".repeat(64), "rec138-fixed-snap");

/* ============================================ THE ACTS, as ONE table — vera's request for each.
   Every request is well-formed enough to REACH its project resolution. Nineteen of these already
   answered alike before this item; they are pinned so that stays true. */
const ACTS = [
  ["promote (a revision)", () => RAW(`op=promote&token=${VERA}`, REVISE)],
  ["promote with a FORGED actorViewer", () => RAW(`op=promote&token=${VERA}`, { ...REVISE, actorViewer: `class:admin` })],
  ["cite", () => RAW(`op=cite&token=${VERA}&project=${P}&handle=${V_MIN}&note=${E("the minutes")}`, {})],
  ["sever", () => RAW(`op=sever&token=${VERA}&project=${P}&handle=${V_LED}&reason=${E("superseded")}`, {})],
  ["reinstate", () => RAW(`op=reinstate&token=${VERA}&project=${P}&handle=${V_LED}&reason=${E("back in")}`, {})],
  ["versioncurrent", () => RAW(`op=versioncurrent&token=${VERA}&target=${E(INQ)}&version=v1&project=${P}`, {})],
  ["conclude&project=", () => RAW(`op=conclude&token=${VERA}&target=${E(INQ)}&project=${P}&falsifier=${E("a rescinding minute")}`, {})],
  ["proposedispose (project-scoped)", () => RAW(`op=proposedispose&token=${VERA}`, { project: P, finding: "F-1", to: "deferred", reason: "waiting" })],
  ["biasadopt scope=project", () => RAW(`op=biasadopt&token=${VERA}&bundleId=${BIAS}&scope=project&scopeId=${P}`)],
  ["biasmanifest scope=project", () => RAW(`op=biasmanifest&token=${VERA}&scope=project&scopeId=${P}`)],
  ["basisversions&project=", () => RAW(`op=basisversions&token=${VERA}&id=${E(INQ)}&project=${P}`)],
  ["versionstrength&project=", () => RAW(`op=versionstrength&token=${VERA}&id=${E(INQ)}&version=v1&project=${P}`)],
  ["strengthbarof&project=", () => RAW(`op=strengthbarof&token=${VERA}&project=${P}`)],
  ["publish&project=", () => RAW(`op=publish&token=${VERA}&project=${P}`, {})],
  ["casedraft", () => RAW(`op=casedraft&token=${VERA}`, { project: P })],
  ["airunopen over a project context", () => RAW(`op=airunopen&token=${VERA}`, { run: "RUN-rec138-1", contextType: "project", contextId: P })],
  ["airuns over a project context", () => RAW(`op=airuns&token=${VERA}&contextType=project&contextId=${P}`)],
  ["projectinvite", () => RAW(`op=projectinvite&token=${VERA}&projectId=${P}&handle=pam`)],
  ["projectinvite with a FORGED viewer=", () => RAW(`op=projectinvite&token=${VERA}&projectId=${P}&handle=pam&viewer=${E("class:admin")}`)],
  ["projectjoin", () => RAW(`op=projectjoin&token=${VERA}&projectId=${P}`)],
  ["projectleave", () => RAW(`op=projectleave&token=${VERA}&projectId=${P}`)],
  ["projectremove", () => RAW(`op=projectremove&token=${VERA}&projectId=${P}&handle=olga`)],
  ["projectowneradd", () => RAW(`op=projectowneradd&token=${VERA}&projectId=${P}&handle=olga`)],
  ["projectownerremove", () => RAW(`op=projectownerremove&token=${VERA}&projectId=${P}&handle=iris&reason=${E("r")}`)],
  ["projectownerrescue", () => RAW(`op=projectownerrescue&token=${VERA}&projectId=${P}&handle=olga&reason=${E("r")}`)],
  ["projectownerarith", () => RAW(`op=projectownerarith&token=${VERA}&projectId=${P}`)],
  /* CORRECTED 2026-09-18 (REC-141): no `newId` — a named one is now refused (C-59.3) before sight is asked. */
  ["projectfork", () => RAW(`op=projectfork&token=${VERA}&projectId=${P}&title=${E("A fork")}`)],
  ["projectparticipants", () => RAW(`op=projectparticipants&token=${VERA}&projectId=${P}`)],
  ["affordances target=", () => RAW(`op=affordances&token=${VERA}&target=${P}`)],
  ["image id=", () => RAW(`op=image&token=${VERA}&id=${P}`)],
  ["file id=", () => RAW(`op=file&token=${VERA}&id=${P}&path=bundle.md`)],
];

const absent = [];
for (const [, f] of ACTS) absent.push(await f());
t("the id names nothing yet (so the first read IS the never-minted answer)", await shaOf(P), null);

/* MINT the project: created by the ADMIN token, owned by iris, olga invited. vera is never invited. */
/* CORRECTED 2026-09-18 (REC-141): created with NO id; the plane mints it, and it must be the predicted P. */
{
  const { bundleId: _chosen, ...create } = pkg(P, projectMd(null, [LEDGER]), "project", "forming", null, `${P}-${++seq}`);
  const minted = must("mint the project", await POST(`op=promote&token=${ADM}`, { ...create, meta: { ...create.meta, title: "Hidden project 9138" } }));
  t("the plane minted exactly the predicted id (so both reads below are of ONE id)", minted.bundleId, P);
}
must("iris owns it", await DO("projectclaimowner", { projectId: P, memberId: "iris" }));
/* Straight to the store for the same reason: iris is the positional actor (`by`), and the viewer is
   the operator-internal `admin` one — a fixture's setup act, not a caller's. */
must("iris invites olga", await DO(`projectinvite?projectId=${P}&handle=olga&by=iris&viewer=admin`, {}));
t("and now it exists", typeof (await shaOf(P)), "string");

const hidden = [];
for (const [, f] of ACTS) hidden.push(await f());
console.log(`  corpus: ${ACTS.length} acts, each read twice by vera (never-minted, then hidden)`);
t("the table is not empty and was read in full both times (floor: 31 acts)",
  [ACTS.length >= 31, absent.length === ACTS.length, hidden.length === ACTS.length], [true, true, true]);

/* ======================================================== 1. HIDDEN = ABSENT, RAW */
console.log("\n--- 1. an uninvited member's answer on a hidden project is BYTE-IDENTICAL to a never-minted id's ---");
ACTS.forEach(([name], i) => {
  const a = absent[i], h = hidden[i];
  t(`HIDDEN = ABSENT, raw (status, content type, body): op=${name}`,
    { status: h.status, type: h.type, sha: sha(h.body) }, { status: a.status, type: a.type, sha: sha(a.body) });
});

/* ======================================================== 2. POSITION NEVER SPEAKS FIRST */
console.log("\n--- 2. a positional refusal is never said to a caller who cannot see the project ---");
/* A positional answer the NEVER-MINTED id also receives discloses nothing (`projectleave`'s
   NOT_A_PARTICIPANT, `projectremove`'s NOT_THE_OWNER and `biasadopt`'s C-56.2 are said to a
   non-participant of ANY id, before this item and after it). What is an oracle is a positional
   answer that ONLY an existing project draws — that is what C-56.1 was, for four acts. */
ACTS.forEach(([name], i) => {
  const c = codeOf(parse(hidden[i])), a = codeOf(parse(absent[i]));
  t(`NEVER POSITIONAL TO THE UNSIGHTED: op=${name} (hidden ${c}, never-minted ${a})`,
    POSITIONAL.includes(c) && c !== a, false);
});

/* ======================================================== 3. SEES IT, HOLDS NO ROLE */
console.log("\n--- 3. a caller who CAN see the project and holds no role gets the POSITIONAL answer (the liar's arm) ---");
{
  const sel = async (tok, id) => (await POST(`op=select&token=${tok}&kind=enumerated`, { ids: [id] })).handle;
  const O_MIN = await sel(OLGA, MINUTES), O_LED = await sel(OLGA, LEDGER);
  const base = await shaOf(P);
  t("SEES, NO ROLE: olga (INVITED, not joined — §7.5 view rights) — op=cite answers C-56.1",
    codeOf(await POST(`op=cite&token=${OLGA}&project=${P}&handle=${O_MIN}&note=${E("n")}`, {})), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: olga — op=sever answers C-56.1",
    codeOf(await POST(`op=sever&token=${OLGA}&project=${P}&handle=${O_LED}&reason=${E("r")}`, {})), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: olga — op=reinstate answers C-56.1",
    codeOf(await POST(`op=reinstate&token=${OLGA}&project=${P}&handle=${O_LED}&reason=${E("r")}`, {})), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: olga — op=promote (a revision at the real base) answers C-56.1",
    codeOf(await promoteAs(OLGA, P, projectMd(P, [LEDGER], "olga's edit"), "project", "forming", base)), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: olga — op=projectinvite answers NOT_THE_OWNER",
    codeOf(await POST(`op=projectinvite&token=${OLGA}&projectId=${P}&handle=pam`)), "NOT_THE_OWNER");
  t("SEES, NO ROLE: olga — op=projectowneradd answers NOT_THE_OWNER",
    codeOf(await POST(`op=projectowneradd&token=${OLGA}&projectId=${P}&handle=pam`)), "NOT_THE_OWNER");
  t("SEES, NO ROLE: olga — op=projectownerremove answers NOT_THE_OWNER",
    codeOf(await POST(`op=projectownerremove&token=${OLGA}&projectId=${P}&handle=iris&reason=${E("r")}`)), "NOT_THE_OWNER");
  t("SEES, NO ROLE: olga — op=projectownerrescue answers ADMIN_ONLY (§7.13 is an administrator's)",
    codeOf(await POST(`op=projectownerrescue&token=${OLGA}&projectId=${P}&handle=pam&reason=${E("r")}`)), "ADMIN_ONLY");
  t("SEES, NO ROLE: olga — op=projectfork answers NOT_JOINED",
    codeOf(await POST(`op=projectfork&token=${OLGA}&projectId=${P}&title=${E("olga fork")}`)), "NOT_JOINED");
  t("SEES, NO ROLE: olga — op=airunopen over the project answers AI_RUN_NOT_PROJECT_MEMBER",
    codeOf(await POST(`op=airunopen&token=${OLGA}`, { run: "RUN-rec138-o", contextType: "project", contextId: P })),
    "AI_RUN_NOT_PROJECT_MEMBER");
  const R_MIN = await sel(RUTH, MINUTES);
  t("SEES, NO ROLE: ruth (an enrolled administrator, not in it — §7.3 sight) — op=cite answers C-56.1",
    codeOf(await POST(`op=cite&token=${RUTH}&project=${P}&handle=${R_MIN}&note=${E("n")}`, {})), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: ruth — op=projectfork answers NOT_A_PARTICIPANT",
    codeOf(await POST(`op=projectfork&token=${RUTH}&projectId=${P}&title=${E("ruth fork")}`)), "NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: ruth — op=projectownerrescue answers OWNERS_ARE_ACTIVE (it reached §7.13's condition)",
    codeOf(await POST(`op=projectownerrescue&token=${RUTH}&projectId=${P}&handle=pam&reason=${E("r")}`)), "OWNERS_ARE_ACTIVE");
  t("SEES, NO ROLE: the FOUNDER's session (the administrator's viewer, IC-149) — op=promote answers C-56.1, not ABSENT",
    codeOf(await promoteAs(FOUNDER, P, projectMd(P, [LEDGER], "founder's edit"), "project", "forming", base)),
    "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: the founder — op=projectinvite answers NOT_THE_OWNER, not NO_SUCH_PROJECT",
    codeOf(await POST(`op=projectinvite&token=${FOUNDER}&projectId=${P}&handle=pam`)), "NOT_THE_OWNER");
}

/* ======================================================== 4. THE OWNER GETS THE REAL ANSWER */
console.log("\n--- 4. a JOINED member (the owner) gets the real answer ---");
{
  const sel = async (id) => (await POST(`op=select&token=${IRIS}&kind=enumerated`, { ids: [id] })).handle;
  t("JOINED: iris cites the minutes into her project", (await POST(`op=cite&token=${IRIS}&project=${P}&handle=${await sel(MINUTES)}&note=${E("n")}`, {}))?.ok, true);
  t("JOINED: iris severs the ledger", (await POST(`op=sever&token=${IRIS}&project=${P}&handle=${await sel(LEDGER)}&reason=${E("r")}`, {}))?.ok, true);
  t("JOINED: iris reinstates it", (await POST(`op=reinstate&token=${IRIS}&project=${P}&handle=${await sel(LEDGER)}&reason=${E("r")}`, {}))?.ok, true);
  t("JOINED: iris revises the project's document",
    (await promoteAs(IRIS, P, projectMd(P, [LEDGER, MINUTES], "iris's revision"), "project", "forming", await shaOf(P)))?.ok, true);
  t("JOINED: iris invites pam", (await POST(`op=projectinvite&token=${IRIS}&projectId=${P}&handle=pam`))?.ok, true);
  t("JOINED: iris's op=projectowneradd reaches the handle (NO_SUCH_HANDLE for one that names nobody)",
    codeOf(await POST(`op=projectowneradd&token=${IRIS}&projectId=${P}&handle=nobody-138`)), "NO_SUCH_HANDLE");
  t("JOINED: iris's op=projectownerremove reaches the handle too",
    codeOf(await POST(`op=projectownerremove&token=${IRIS}&projectId=${P}&handle=nobody-138&reason=${E("r")}`)), "NO_SUCH_HANDLE");
  t("JOINED: iris forks it", (await POST(`op=projectfork&token=${IRIS}&projectId=${P}&title=${E("iris fork")}`))?.ok, true);
  t("JOINED: iris's op=airunopen passes the project gate (the next check, the principals, is what answers)",
    codeOf(await POST(`op=airunopen&token=${IRIS}`, { run: "RUN-rec138-i", contextType: "project", contextId: P })),
    "AI_RUN_CAPABILITY_UNAVAILABLE");
}

/* ======================================================== 5. MACHINE CREDENTIALS */
console.log("\n--- 5. machine credentials are unchanged: they see every project and hold no position ---");
{
  const h = (await POST(`op=select&token=${MEM}&kind=enumerated`, { ids: [MINUTES] })).handle;
  t("the MEMBER token still cites into the project", (await POST(`op=cite&token=${MEM}&project=${P}&handle=${h}&note=${E("m")}`, {}))?.ok, true);
  t("the ADMIN token still revises it",
    (await promoteAs(ADM, P, projectMd(P, [LEDGER, MINUTES], "admin token's revision"), "project", "forming", await shaOf(P)))?.ok, true);
}

/* ======================================================== 6. A CREATION AT A HIDDEN ID (D-428's creation half) */
console.log("\n--- 6. CLOSED BY REC-141 (D-428's creation half): a CREATION naming a hidden id answers as one naming a free id ---");
{
  /* PINNED AS MEASURED so a change to it is noticed. A creation at a never-minted id CREATES it, so no
     answer to a creation at a hidden id can be byte-identical to that; the id space is shared and one
     id cannot be two bundles. D-428 carries it (and NAME_TAKEN, 7.1's instance-wide uniqueness).
     2026-09-18, REC-139: NAME_TAKEN no longer names the other project's id or title (IC-156,
     `project-disclosure.test.mjs`); plane-minted ids, which would close THIS pin, are decided and not
     built — the design does not say whether a supplied id is refused or ignored. */
  /* CORRECTED 2026-09-18 (REC-141, IC-158). This pinned `EXISTS` AS MEASURED, as KNOWN: a creation at a hidden id
     said the id was taken, because the caller chose ids and one id cannot be two bundles. The plane now MINTS
     project ids (Membership v2 §7, BOB #15), so a creation that names one is refused BEFORE any id is looked up —
     one answer, taken or not, echoing no id. The old pin was right about the old plane and is wrong about this one. */
  const r = await RAW(`op=promote&token=${VERA}`, pkg(P, projectMd(null), "project", "forming", null, "rec138-create"));
  const FREE = P.replace(/-\d{4}-hidden/, "-9999-hidden");
  const f = await RAW(`op=promote&token=${VERA}`, pkg(FREE, projectMd(null), "project", "forming", null, "rec138-create"));
  t("REC-141: vera's CREATION at the hidden project's id is refused PROJECT_ID_SUPPLIED, not EXISTS", codeOf(parse(r)), "PROJECT_ID_SUPPLIED");
  t("REC-141: and it is BYTE-IDENTICAL to her creation at a never-minted id",
    { status: r.status, type: r.type, sha: sha(r.body) }, { status: f.status, type: f.type, sha: sha(f.body) });
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nproject-sight: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

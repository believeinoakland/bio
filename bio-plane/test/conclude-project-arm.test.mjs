/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/conclude-project-arm.control.mjs` — deliberately NOT a `.test.mjs`, because it ARMS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run from `bio-plane/`: `node test/conclude-project-arm.control.mjs [arm]`. Each arm patches a COPY of `src/` + `checks/` (its anchor asserted to occur EXACTLY ONCE), the suite runs against the copy through CONCLUDE_ARM_SRC, and the real sources are hashed before the first arm and after the last. DECLARED before arming, each arm ALONE:
   (a) no-project-arm — THE ROW'S CONTROL: the PROJECT arm removed from `conclude`'s affordance (keyed on the edge table alone, as before REC-142). MUST FAIL: the two OFFERED arms (iris, jonah) and nothing else.
   (b) liar-edge — THE LIAR'S SHAPE: a `concluded -> concluded` edge added to the catalog's inquiry machine. MUST FAIL: every NOT OFFERED arm (the edge offers the act to everybody), the CANNOT-CONCLUDE-TWICE arm, its nothing-written arm and the structural edge arm. MUST NOT FAIL: the OFFERED arms, §2.
   (c) fact-unnarrowed — the project arm keyed on `current_state === "concluded"` alone, the positional fact ignored. MUST FAIL: every NOT OFFERED arm. MUST NOT FAIL: the OFFERED arms, §2-§4.
   (d) owners-only — OVER-STRICTNESS: the fact asks `#isProjectOwner` instead of `#isJoinedParticipant`. MUST FAIL: jonah's OFFERED arm alone (a joined member who is not an owner concludes for the project at the op).
   RUN 2026-09-18 by the REC-142 worker (`node test/conclude-project-arm.control.mjs` from `bio-plane/`, branch `rec142/affordances-concluded` on base `3dee1fdb`; real sources affordances.mjs 143,287 B sha256 e824897865af…, store.mjs 2,632,707 B sha256 900cdc8d6d14…, bio-checks.mjs 785,417 B sha256 d0fcf070d8d2…, untouched: YES): baseline 17/0 · (a) no-project-arm 14/3 — both of iris's OFFERED arms and jonah's FAILED, nothing else · (b) liar-edge 10/7 — all four NOT OFFERED arms, CANNOT-CONCLUDE-TWICE, its nothing-written arm and the structural edge arm FAILED; the OFFERED arms and §2 stayed green, which is the point: the liar passes every arm a member of a citing project can see · (c) fact-unnarrowed 13/4 — the four NOT OFFERED arms alone · (d) owners-only 16/1 — jonah's OFFERED arm alone, the proof the suite can see a fence tighter than its rule. Every arm ARMED (anchor exactly once) and AS DECLARED on the first run.
   RE-RUN 2026-09-18 by REC-141 (worktree agent-a12cdccbace704eb6, merged with origin/main at 1d439e31) AFTER correcting this suite for plane-minted project ids (P, Q, S read from the promote answers); real sources affordances.mjs 143,287 B sha256 e824897865af…, store.mjs 2,647,691 B sha256 f3065587cad6…, bio-checks.mjs 789,418 B sha256 cc46f5c88c69…, untouched: YES — every arm AS DECLARED with identical figures: baseline 17/0 · (a) 14/3 · (b) 10/7 · (c) 13/4 · (d) 16/1.
 * =========================================================================
 * REC-142 — `op=affordances` PUBLISHES A PROJECT'S `conclude` ON A QUESTION
 * WHOSE OWN STATE IS ALREADY `concluded` (INVESTIGATIVE-SESSION.md §7.1 item 8,
 * DEC-8, the DELEGATION 2026-09-18 UI (UI-65) -> RECORD).
 *
 * THE DEFECT. The store accepts a PROJECT's conclusion on a question the
 * no-project relationship already concluded (REC-124: that state is the
 * no-project relationship's, and one relationship's conclusion must not bar
 * another's). `conclude`'s affordance was keyed on the catalog's edge table
 * alone, which has no `concluded -> concluded` edge, so the act was never
 * published there — and the surface renders only what the plane publishes.
 * §7.1 item 8 was honoured by the store and unreachable by a member.
 *
 * THE SHAPE (decided on the REC-142 claim): `conclude` itself is published on
 * a concluded question — its PROJECT arm — and WHICH project is the act's
 * parameter, `withdrawconclusion`'s precedent. The arm is narrowed by a
 * POSITIONAL fact (D-310's shape): the caller has JOINED some project it can
 * SEE that LIVE-cites the question. That is the weakest fact under which no
 * `project=` could make the act succeed.
 *
 * HOW A LIAR PASSES THIS, stated before what it checks: add a `concluded ->
 * concluded` edge to the inquiry machine. `conclude` is then published on
 * every concluded question and a member of a citing project sees it — but so
 * does everybody, and the NO-PROJECT relationship can conclude TWICE, which
 * re-opens a conclusion to itself. So §1 asserts the act is NOT offered to a
 * stranger in four different positions, and §4 asserts through the op that
 * the no-project relationship cannot conclude again and that the catalog has
 * no such edge.
 *
 * WHAT IS DRIVEN, all through the ops:
 *  0. The fixture is real: a question concluded with NO project (naming its
 *     reading, REC-136's rule, through `adoptable-reading.mjs`).
 *  1. op=affordances on that question offers `conclude` to an OWNER of a
 *     citing project and to a JOINED non-owner (the over-strictness arm); it
 *     does NOT offer it to a member merely INVITED to that project, to a
 *     member whose projects do not cite it or SEVERED it, to an administrator
 *     who sees every project and joined none, or to a machine credential. On
 *     an OPEN question it is offered to every member, as before.
 *  2. The member concludes through the op for the project; the project's
 *     stance reads it; the no-project conclusion is byte-unchanged.
 *  3. The pre-flight and the refusal agree: a stranger forcing `project=` is
 *     refused C-56, and a member of a severed citer is refused NO_CLAIM.
 *  4. The no-project relationship cannot conclude twice.
 *
 * WHAT IT CANNOT SEE: the surface. Whether `civicos-ui` renders the act on
 * the stance surface is UI's; this suite asserts only what the plane
 * publishes and what the op does.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { withAdoptableReading, adoptedVersionParam, ADOPTED_READING, ADOPTED_CLAIM } from "./adoptable-reading.mjs";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.CONCLUDE_ARM_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
/* The catalog is read from the SAME tree the plane runs, so an arm that edits the
   machine is seen by the structural arm too — never a second copy of the table. */
const { STATES } = await import(pathToFileURL(join(SRC_DIR, "..", "checks", "bio-checks.mjs")).href);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec142", MEM = "mem-rec142";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body) })).json());
};
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const E = encodeURIComponent;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

try {

/* ============================================================== FIXTURE */
const claimed = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-142" });
if (!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  const en = await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-142` });
  if (!en || !en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-142` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* The founder counts as the first administrator, so the second must be one too (ADMINS_FIRST). */
const RUTH = await enrol("ruth", "admin");
const IRIS = await enrol("iris", "member");
const JO = await enrol("jonah", "member");
const VERA = await enrol("vera", "member");
const OLGA = await enrol("olga", "member");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* An OPEN question citing one document, with NO readings: `withAdoptableReading`
   adds the one accepted reading a conclusion adopts (REC-136's helper — a
   no-project conclude names its reading). */
const inquiryMd = (id, basis) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the sewer fund transfer follow the adopted process?"`,
  "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  "references:", `  - target: ${basis}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${basis}`, "    role: supports",
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
/* `cites` entries are [target, status]; a SEVERED one is a recorded decision to stop relying. */
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7), which refuses a
   creation naming one (C-59.1) or bytes carrying `id:` (C-59.2). A project is created with `id` null — no bundleId,
   no id line — and its id is read from the answer; `label` keeps the title and snapshot key it had. */
const projectMd = (id, cites = [], label = id) => ["---",
  ...(id === null ? [] : [`id: ${id}`]), "object_type: project", `title: "Project ${label}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length ? ["references:", ...cites.flatMap(([x, st]) => [`  - target: ${x}`, "    rel: cites",
                                                                    `    status: ${st}`])]
                   : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");
let snapSeq = 0;
const promoteAs = async (tok, id, text, type, state, label = id) => POST(`op=promote&token=${tok}`, {
  ...(id === null ? {} : { bundleId: id }), base: null, snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${label}`,
          current_state: state, created: NOW, last_updated: LATER } });
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 900)}`); return r; };
const listed = async (id) => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id) ?? null;
const textOf = async (id) => (await GET(`op=file&token=${ADM}&id=${id}&path=bundle.md`))?.text ?? null;

const LEDGER = "INFO-2026-9142-ledger";
must(`promote ${LEDGER}`, await promoteAs(ADM, LEDGER, infoMd(LEDGER), "information", "collected"));
const INQ = "INQ-2026-9142-concluded-elsewhere", OPENQ = "INQ-2026-9142-still-open";
for (const q of [INQ, OPENQ])
  must(`promote ${q}`, await promoteAs(ADM, q, withAdoptableReading(inquiryMd(q, LEDGER)), "inquiry", "open"));

/* THE PROJECTS, created by the ADMIN token and given rosters through the plane's own owner claim:
     P      iris's; it CITES both questions. jonah is invited and JOINS (not an owner). vera is
            INVITED and never joins.
     Q      olga's; it cites only the ledger — never the question.
     S      olga's; it cited the question and SEVERED the edge.
   ruth is an administrator: she SEES every project and has joined none. */
/* CORRECTED 2026-09-18 (REC-141): the three ids were CHOSEN here; they are now the ids the plane minted. */
const mint = async (label, cites) =>
  must(`promote ${label}`, await promoteAs(ADM, null, projectMd(null, cites, label), "project", "forming", label)).bundleId;
const P = await mint("PROJ-2026-9142-oversight", [[INQ, "confirmed"], [OPENQ, "confirmed"]]);
const Q = await mint("PROJ-2026-9142-elsewhere", [[LEDGER, "confirmed"]]);
const S = await mint("PROJ-2026-9142-severed", [[INQ, "severed"]]);
must("claim P", await DO("projectclaimowner", { projectId: P, memberId: "iris" }));
must("claim Q", await DO("projectclaimowner", { projectId: Q, memberId: "olga" }));
must("claim S", await DO("projectclaimowner", { projectId: S, memberId: "olga" }));
must("iris invites jonah to P", await POST(`op=projectinvite&token=${IRIS}&projectId=${P}&handle=jonah`));
must("jonah joins P", await POST(`op=projectjoin&token=${JO}&projectId=${P}`));
must("iris invites vera to P (vera never joins)", await POST(`op=projectinvite&token=${IRIS}&projectId=${P}&handle=vera`));
/* P stands on the question's accepted reading — a project concludes on the reading it stands on. */
must("iris makes the reading current for P", await POST(`op=versioncurrent&token=${IRIS}&target=${E(INQ)}`
  + `&version=${E(ADOPTED_READING)}&project=${E(P)}`, {}));

/* THE NO-PROJECT CONCLUSION, drawn by vera through the op, naming its reading (§7.1 item 6). */
const NP_TEXT = "The ledger answers the question.";
const np = await POST(`op=conclude&token=${VERA}&target=${E(INQ)}&conclusion=${E(NP_TEXT)}`
  + `&falsifier=${E("a later ledger entry")}${adoptedVersionParam()}`, {});
const inqRow = await listed(INQ);

/* ====================================================================== 0 */
console.log("\n--- 0. the fixture is real ---");
t("the fixture is real: INQ is concluded with NO project, adopting the named reading's claim; OPENQ is open",
  [np?.ok, inqRow?.current_state, (await listed(OPENQ))?.current_state],
  [true, "concluded", "open"]);

/* ====================================================================== 1 */
console.log("\n--- 1. op=affordances on a question concluded with no project ---");
const acts = async (tok, target) => {
  const r = await GET(`op=affordances&token=${tok}&target=${E(target)}`);
  return { ids: ((r || {}).acts || []).map((a) => a.id), act: ((r || {}).acts || []).find((a) => a.id === "conclude") ?? null,
           state: r?.current_state ?? null };
};
{
  const iris = await acts(IRIS, INQ);
  t("OFFERED: iris (an OWNER of P, which cites the question) — conclude on the concluded question",
    [iris.state, iris.ids.includes("conclude")], ["concluded", true]);
  t("OFFERED: iris — and it is conclude's own entry, decorated as everywhere else (weight single, rung reasoned, session)",
    [iris.act?.weight, iris.act?.rung, iris.act?.mode], ["single", "reasoned", "session"]);
  t("OFFERED: jonah (JOINED P, NOT an owner) — conclude on the concluded question; a joined member concludes for the project",
    (await acts(JO, INQ)).ids.includes("conclude"), true);
  t("NOT OFFERED: vera (INVITED to P, never joined — and the author of the no-project conclusion)",
    (await acts(VERA, INQ)).ids.includes("conclude"), false);
  t("NOT OFFERED: olga (owns Q, which never cites the question, and S, which SEVERED it)",
    (await acts(OLGA, INQ)).ids.includes("conclude"), false);
  t("NOT OFFERED: ruth (an administrator — sees P, joined nothing; sight is not authority)",
    (await acts(RUTH, INQ)).ids.includes("conclude"), false);
  t("NOT OFFERED: the ADMIN machine token (no roster position; the fact reads null and the act set is unchanged)",
    (await acts(ADM, INQ)).ids.includes("conclude"), false);
  const openFor = [];
  for (const [who, tok] of [["iris", IRIS], ["vera", VERA], ["olga", OLGA], ["ruth", RUTH], ["ADMIN", ADM]])
    if ((await acts(tok, OPENQ)).ids.includes("conclude")) openFor.push(who);
  t("on the OPEN question conclude is offered to every caller, exactly as before (the edge table)",
    openFor, ["iris", "vera", "olga", "ruth", "ADMIN"]);
}

/* ====================================================================== 2 */
console.log("\n--- 2. the member concludes for the project, through the op ---");
{
  const shaBefore = inqRow?.bundle_sha ?? null;
  const textBefore = await textOf(INQ);
  const npBefore = (await GET(`op=basisversions&token=${ADM}&id=${E(INQ)}&limit=50`))?.no_project_conclusion ?? "ABSENT";
  const r = await POST(`op=conclude&token=${IRIS}&target=${E(INQ)}&project=${E(P)}`
    + `&falsifier=${E("a council minute rescinding the process")}`, {});
  t("iris concludes for P through op=conclude&project=: accepted, the project's relationship, the claim ADOPTED, the inquiry unmoved",
    [r?.ok, r?.relationship, r?.project, r?.claim?.text, r?.inquiry_moved, r?.inquiry_state],
    [true, "project", P, ADOPTED_CLAIM, false, "concluded"]);
  const stance = await GET(`op=basisversions&token=${IRIS}&id=${E(INQ)}&limit=50&project=${E(P)}`);
  t("P's stance reads it: op=basisversions&project=P says concluded, on the reading, adopting its claim",
    [stance?.conclusion_stance, stance?.conclusion?.state, stance?.conclusion?.version, stance?.conclusion?.claim],
    ["concluded", "concluded", ADOPTED_READING, ADOPTED_CLAIM]);
  const npAfter = (await GET(`op=basisversions&token=${ADM}&id=${E(INQ)}&limit=50`))?.no_project_conclusion ?? "ABSENT";
  t("the no-project conclusion is UNCHANGED: INQ's bytes are byte-identical and its no-project read is the same",
    [(await listed(INQ))?.bundle_sha === shaBefore, (await textOf(INQ)) === textBefore,
     JSON.stringify(npAfter) === JSON.stringify(npBefore), npBefore !== null && npBefore !== "ABSENT"],
    [true, true, true, true]);
}

/* ====================================================================== 3 */
console.log("\n--- 3. the pre-flight agrees with the refusal it fronts (DEC-8) ---");
{
  const pBefore = await textOf(P), sBefore = await textOf(S);
  const v = await POST(`op=conclude&token=${VERA}&target=${E(INQ)}&project=${E(P)}`
    + `&falsifier=${E("a council minute")}`, {});
  t("REFUSED: vera forcing project=P through the op — C-56, she has not joined it; nothing written",
    [codeOf(v), (await textOf(P)) === pBefore], ["PROJECT_ACT_NOT_A_PARTICIPANT", true]);
  const o = await POST(`op=conclude&token=${OLGA}&target=${E(INQ)}&project=${E(S)}`
    + `&falsifier=${E("a council minute")}`, {});
  t("REFUSED: olga naming S, which SEVERED the question — NO_CLAIM, S no longer draws on it; nothing written",
    [codeOf(o), (await textOf(S)) === sBefore], ["NO_CLAIM", true]);
}

/* ====================================================================== 4 */
console.log("\n--- 4. the liar: the no-project relationship cannot conclude twice ---");
{
  const shaBefore = (await listed(INQ))?.bundle_sha ?? null;
  const again = await POST(`op=conclude&token=${RUTH}&target=${E(INQ)}&conclusion=${E("Concluded a second time.")}`
    + `&falsifier=${E("a later ledger entry")}${adoptedVersionParam()}`, {});
  t("the no-project relationship CANNOT conclude twice: a second no-project conclude is refused ILLEGAL_TRANSITION",
    [again?.ok ?? null, codeOf(again), again?.from ?? null], [false, "ILLEGAL_TRANSITION", "concluded"]);
  t("and nothing was written by the second: INQ's sha is unchanged",
    (await listed(INQ))?.bundle_sha === shaBefore && !!shaBefore, true);
  const edges = STATES?.inquiry?.edges ?? null;
  t("the catalog's inquiry machine has NO concluded -> concluded edge (the table is read, and it is non-empty)",
    [Array.isArray(edges?.concluded) && edges.concluded.length > 0, (edges?.concluded ?? []).includes("concluded")],
    [true, false]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nconclude-project-arm: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

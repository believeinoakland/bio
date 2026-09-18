/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/project-authority.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/project-authority.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once) and the real sources are hashed before and after; what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RUN 2026-09-18 in worktree agent-a78e80263e9738d43 on the merge of origin/main f16b9b49 (real src/index.mjs 657,700 B sha256 5503f0b281c5…, src/store.mjs 2,597,155 B sha256 a7147b680298…, src/affordances.mjs 140,708 B sha256 0b097eebac16…, untouched: YES): (a) baseline 59/0 · (b) no-check 31/28 — every REFUSED arm is an act that SUCCEEDS without the check, which is the pre-fix defect measured · (c) cite-unchecked 50/9 — only cite's arms · (d) rescue-checked 55/4 — the check applied to §7.13 breaks every rescue arm · (e) stamp-dropped 56/3 — versioncurrent opens when the control plane's stamp is removed · (f) position-from-viewer 50/9 · (g) refuse-every-admin 41/18 — every refusal arm stays GREEN (the lie) and the in-project arms catch it · (h) preflight-unnarrowed 57/2. (f) and (g) came back NOT AS DECLARED on the first run and were corrected in the DECLARATION/METHOD, not the subject (reasons at each arm in the driver); re-run, both AS DECLARED. RE-RUN after the D-426 pin and the two literal C-56 arms were added (figures above are that run), every arm AS DECLARED, sources untouched: YES.
 * =========================================================================
 * REC-134 / IC-152 / C-56 — SIGHT IS NOT AUTHORITY, AT EVERY ACT ON A PROJECT.
 * Membership Architecture v2 §7, the block *"SIGHT IS NOT AUTHORITY — and this is
 * Bob's doctrine, not a new ruling"* (BOB #15, 2026-09-18), quoting §4.9: *"the
 * custodial role can audit everything and direct nothing"*; the one exception is
 * §7.13.
 *
 * WHAT WAS WRONG, measured through the ops before the fix: an ENROLLED
 * administrator (ruth) and the FOUNDER's own session, neither of them in iris's
 * project, could each revise its document (op=promote), cite into it and sever
 * and reinstate its edges, move what it stands on (op=versioncurrent), record a
 * judgement in its feed (op=proposedispose), and adopt a bias set into its scope
 * (op=biasadopt). The first four took the visibility gate as the only barrier —
 * or none — and every administrator passes the visibility gate everywhere.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) refuse every ADMINISTRATOR everywhere. Every refusal arm goes green. So §3
 *       drives the SAME two people, IN a project with the required role, through
 *       every act — and they must succeed — and §4 drives §7.13, the one act an
 *       administrator performs on a project it is not in.
 *   (2) ask the VIEWER instead of the identity. The founder's viewer is the bare
 *       `admin`, which carries no member, so a check read from it asks nobody and
 *       lets the founder through. §2 drives the founder separately from ruth.
 *   (3) narrow SIGHT instead of acts. §1 pins that both still SEE the project,
 *       and REC-132's `founder-sight` suite stays green beside this one.
 *   (4) touch machine credentials. §5 pins that the ADMIN token's acts on the
 *       same project are unchanged.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { PROJECT_AUTHORITY_CHECKS } from "../checks/bio-checks.mjs";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.PROJECT_AUTHORITY_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec134", MEM = "mem-rec134";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
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
const NOT_IN = "PROJECT_ACT_NOT_A_PARTICIPANT", NOT_OWNER = "PROJECT_ACT_NOT_THE_OWNER";

try {

/* ============================================================== FIXTURE */
const claimed = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-134" });
if (!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
const fl = await POST("op=login", { password: "founder-passphrase-134" });
if (!fl || !fl.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
const FOUNDER = fl.token;
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  const en = await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-134` });
  if (!en || !en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-134` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* The founder counts as the first administrator, so the second must be one too (ADMINS_FIRST). */
const RUTH = await enrol("ruth", "admin");
const IRIS = await enrol("iris", "member");
const VERA = await enrol("vera", "member");
const OLGA = await enrol("olga", "member");
const OREN = await enrol("oren", "member");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const scalar = (k, v) => v === null ? [`    ${k}: null`] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
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
  "basis_versions:", '  - name: "v1"', ...scalar("description", "the ledger reading"),
  ...scalar("relationship", "and"), ...scalar("state", "suggested"), ...scalar("derived_from", null),
  ...scalar("hidden", false), ...scalar("claim", "The transfer followed the adopted process."),
  ...scalar("author", "iris"), ...scalar("at", NOW),
  /* The reading rests on the ledger, so a conclusion adopting it rests on something (NO_BASIS otherwise). */
  "basis_version_grounds:", '  - version: "v1"', ...scalar("ground", "g1"), ...scalar("asserted_by", "iris"),
  ...scalar("at", NOW),
  "basis_version_legs:", '  - version: "v1"', ...scalar("target", basis), ...scalar("role", "supports"),
  ...scalar("ground", "g1"),
  ...scalar("grade", "B"), ...scalar("grade_axis", "capture"), ...scalar("grade_source", "capture"),
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const projectMd = (id, { cites = [], summary = "A project." } = {}) => ["---",
  `id: ${id}`, "object_type: project", `title: "Project ${id}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites",
                                                              "    status: confirmed"])]
                   : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", summary, "", "## Session Log", ""].join("\n");
const bundleMeta = (id, type, state) => ({ object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
  current_state: state, created: NOW, last_updated: LATER });
let snapSeq = 0;
const promoteAs = async (tok, id, text, type, state, base = null) => POST(`op=promote&token=${tok}`, {
  bundleId: id, base, snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: bundleMeta(id, type, state) });
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 900)}`); return r; };
const shaOf = async (id) => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {})
  .bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;

/* The shared material: two documents and a question with one reading. */
const LEDGER = "INFO-2026-9134-ledger", MINUTES = "INFO-2026-9134-minutes";
for (const d of [LEDGER, MINUTES]) must(`promote ${d}`, await promoteAs(ADM, d, infoMd(d), "information", "collected"));
const INQ = "INQ-2026-9134-transfer";
must("promote inquiry", await promoteAs(ADM, INQ, inquiryMd(INQ, LEDGER), "inquiry", "open"));

/* THE PROJECTS. Created by the ADMIN token (a machine creation has no owner) and then given
   their rosters through the plane's own owner claim, so each roster is what the case needs:
     P_OUT   iris's. ruth and the founder are NOT in it. vera is INVITED and has not joined.
     P_IN    the founder's. ruth is invited, JOINS, and is made a second OWNER by the founder.
     P_JOIN  iris's. ruth is invited and JOINS, and is NOT an owner — the role distinction.
     P_RES / P_RES2  owned by olga / oren, who are then DEACTIVATED — §7.13's condition. */
const P_OUT = "PROJ-2026-9134-out", P_IN = "PROJ-2026-9134-in", P_JOIN = "PROJ-2026-9134-join";
const P_RES = "PROJ-2026-9134-stranded", P_RES2 = "PROJ-2026-9134-stranded2";
for (const p of [P_OUT, P_IN, P_JOIN])
  must(`promote ${p}`, await promoteAs(ADM, p, projectMd(p, { cites: [LEDGER, INQ] }), "project", "forming"));
for (const p of [P_RES, P_RES2]) must(`promote ${p}`, await promoteAs(ADM, p, projectMd(p), "project", "forming"));
must("claim P_OUT", await DO("projectclaimowner", { projectId: P_OUT, memberId: "iris" }));
must("claim P_JOIN", await DO("projectclaimowner", { projectId: P_JOIN, memberId: "iris" }));
must("claim P_IN", await DO("projectclaimowner", { projectId: P_IN, memberId: "admin" }));
must("claim P_RES", await DO("projectclaimowner", { projectId: P_RES, memberId: "olga" }));
must("claim P_RES2", await DO("projectclaimowner", { projectId: P_RES2, memberId: "oren" }));
must("iris invites vera to P_OUT", await POST(`op=projectinvite&token=${IRIS}&projectId=${P_OUT}&handle=vera`));
must("the founder invites ruth to P_IN", await POST(`op=projectinvite&token=${FOUNDER}&projectId=${P_IN}&handle=ruth`));
must("ruth joins P_IN", await POST(`op=projectjoin&token=${RUTH}&projectId=${P_IN}`));
must("the founder adds ruth as an owner of P_IN (sole owner, unilateral — §7.10)",
  await POST(`op=projectowneradd&token=${FOUNDER}&projectId=${P_IN}&handle=ruth`));
must("iris invites ruth to P_JOIN", await POST(`op=projectinvite&token=${IRIS}&projectId=${P_JOIN}&handle=ruth`));
must("ruth joins P_JOIN", await POST(`op=projectjoin&token=${RUTH}&projectId=${P_JOIN}`));
/* The question's one reading is ACCEPTED (by iris) so a project can stand on it (§6 rule 5). */
must("iris accepts v1", await POST(`op=versionaccept&token=${IRIS}&target=${E(INQ)}&version=v1`
  + `&reason=${E("the ledger bears it out")}`, {}));

/* A project-scoped bias set, written and proposed by iris (a member-authored transition). */
const BIAS = "BIAS-2026-9134-lens";
const biasMd = (state) => ["---",
  `id: "${BIAS}"`, 'object_type: "bias"', 'schema: "bias@1"', 'title: "Project lens"',
  `current_state: "${state}"`, `prior_state: ${state === "draft" ? "null" : '"draft"'}`,
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", '  mode: "human"', '  capability_tier: "member"',
  'group: "believe-in-oakland"', "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
  "statements:", '  - id: "p1"', '    kind: "scrutiny"', '    subject: "ENT-2026-0011"',
  '    text: "Figures from the fund\'s own dashboard need the underlying ledger before they bear load."',
  '    justification: "The dashboard is produced by the body under examination."',
  "    citations: []", "    locked: false",
  "---", "", "## Statements", "", "The lens this project works under.", "",
  "## Adoption", "", "Adopted by the project's owners.", "",
  "## What This Does Not Enforce", "",
  "BIO checks that each statement names a registered subject and carries a justification. It does NOT "
  + "check whether a second source was independent of the first.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const bd = must("bias draft", await promoteAs(IRIS, BIAS, biasMd("draft"), "bias", "draft"));
must("bias proposed", await promoteAs(IRIS, BIAS, biasMd("proposed"), "bias", "proposed", bd.bundleSha));

console.log("  corpus: 5 projects (P_OUT iris's; P_IN the founder's with ruth as second owner; P_JOIN iris's with ruth"
  + " joined; P_RES/P_RES2 to be stranded), 2 documents, 1 question with an accepted reading, 1 proposed bias set");

/* ============================================================ THE ACTS, as one table
   Each is driven through the op, by the named session, against the named project. `fresh`
   distinguishes the arms that must write from those that must not. */
let revSeq = 0;
const ACTS = {
  promote: async (tok, p) => {
    const base = await shaOf(p);
    return promoteAs(tok, p, projectMd(p, { cites: [LEDGER, INQ], summary: `Revised ${++revSeq}.` }),
                     "project", "forming", base);
  },
  cite: async (tok, p) => {
    const sel = await POST(`op=select&token=${tok}&kind=enumerated`, { ids: [MINUTES] });
    return POST(`op=cite&token=${tok}&project=${p}&handle=${sel && sel.handle}&note=${E("the minutes")}`, {});
  },
  sever: async (tok, p) => {
    const sel = await POST(`op=select&token=${tok}&kind=enumerated`, { ids: [LEDGER] });
    return POST(`op=sever&token=${tok}&project=${p}&handle=${sel && sel.handle}&reason=${E("superseded")}`, {});
  },
  reinstate: async (tok, p) => {
    const sel = await POST(`op=select&token=${tok}&kind=enumerated`, { ids: [LEDGER] });
    return POST(`op=reinstate&token=${tok}&project=${p}&handle=${sel && sel.handle}&reason=${E("back in")}`, {});
  },
  versioncurrent: async (tok, p) => POST(`op=versioncurrent&token=${tok}&target=${E(INQ)}&version=v1&project=${p}`, {}),
  proposedispose: async (tok, p) => POST(`op=proposedispose&token=${tok}`,
    { project: p, finding: `F-${p}`, to: "deferred", reason: "waiting on the records request" }),
  biasadopt: async (tok, p) => GET(`op=biasadopt&token=${tok}&bundleId=${BIAS}&scope=project&scopeId=${p}`),
  /* REC-124's per-project conclusion (INVESTIGATIVE-SESSION §7.1), landed while this item ran. It
     adopts the claim of the reading the project stands on, so on P_IN it follows versioncurrent. */
  conclude: async (tok, p) => POST(`op=conclude&token=${tok}&target=${E(INQ)}&project=${p}`
    + `&falsifier=${E("an adopted council minute rescinding the process")}`, {}),
  /* REC-136 (§7.1 item 7): a project WITHDRAWS its conclusion — conclude's position, JOINED.
     Added by REC-136 at its merge of this item, as CONDUCT #5 required: §2 is the arm proving a
     non-participant administrator (ruth, and the founder) is refused; §3 runs it on P_IN right
     after `conclude`, so the owners withdraw a conclusion that exists.
     REC-136's CONTROLS, RUN 2026-09-18, each armed ALONE and restored (sha256 MATCH, content
     IDENTICAL), baseline 63/0: (i) `withdrawconclusion` removed from index.mjs POSITIONAL_ACTS
     (the stamp not set) -> 61/2, both withdraw REFUSED arms; (ii) the `#projectAuthority` call in
     store.mjs #withdrawConclusion replaced by `null` -> 61/2, the same two; (iii) THE MIS-MERGE
     REPLAYED — conclude's dispatch without its `identity` line, which is what git's textual merge
     of this item produced (store.mjs's dispatch comment records it) -> 61/2, both CONCLUDE
     refused arms: this suite would have caught it. */
  withdrawconclusion: async (tok, p) => POST(`op=withdrawconclusion&token=${tok}&target=${E(INQ)}&project=${p}`
    + `&reason=${E("the minute we relied on was superseded")}`, {}),
};
const NEED = { promote: NOT_IN, cite: NOT_IN, sever: NOT_IN, reinstate: NOT_IN, versioncurrent: NOT_IN,
               proposedispose: NOT_IN, biasadopt: NOT_OWNER, conclude: NOT_IN, withdrawconclusion: NOT_IN };

/* ======================================================== 1. SIGHT IS UNCHANGED */
console.log("\n--- 1. sight is unchanged: both administrators SEE the project they are not in (REC-132) ---");
const listed = async (tok, p) => (((await GET(`op=list&token=${tok}&limit=1000`)) || {}).bundles || [])
  .some((b) => b.bundle_id === p);
t("the founder's session lists iris's project P_OUT, which it was never invited to", await listed(FOUNDER, P_OUT), true);
t("ruth, an enrolled administrator, lists it too", await listed(RUTH, P_OUT), true);
t("the founder reads its document (op=image)",
  typeof ((await GET(`op=image&token=${FOUNDER}&id=${P_OUT}`)) || {})["bundle.md"], "string");
t("ruth reads its participant list (§7.8)",
  (((await GET(`op=projectparticipants&token=${RUTH}&projectId=${P_OUT}`)) || {}).participants || [])
    .map((p) => p.handle).sort(), ["iris", "vera"]);

/* ============================================ 2. NOT IN THE PROJECT: DIRECTS NOTHING */
console.log("\n--- 2. NOT in the project: the founder and ruth can do NONE of the acts (§4.9, §7) ---");
for (const [who, tok] of [["the founder", FOUNDER], ["ruth", RUTH]]) {
  for (const act of Object.keys(ACTS)) {
    const r = await ACTS[act](tok, P_OUT);
    t(`REFUSED: ${who} (not in P_OUT) — op=${act} answers ${NEED[act]}`,
      [r && r.ok, codeOf(r), r && r.check], [false, NEED[act], PROJECT_AUTHORITY_CHECKS[NEED[act]].check]);
  }
}
{
  const r = await ACTS.cite(RUTH, P_OUT);
  /* The two checks named as LITERALS, so the coverage register credits each with an assertion that
     proves it FIRES on a violation (a check named only through a computed key is not credited). */
  t("C-56.1 fires: ruth's cite into P_OUT answers the JOINED check",
    [codeOf(r), r && r.check], ["PROJECT_ACT_NOT_A_PARTICIPANT", "C-56.1"]);
  const o = await ACTS.biasadopt(RUTH, P_OUT);
  t("C-56.2 fires: ruth's project-scoped bias adoption on P_OUT answers the OWNER check",
    [codeOf(o), o && o.check], ["PROJECT_ACT_NOT_THE_OWNER", "C-56.2"]);
  t("the refusal carries the catalogue's canned translation (DEC-49) and names the act and the position needed",
    [r && r.translation === PROJECT_AUTHORITY_CHECKS[NOT_IN].translation, r && r.act, r && r.needs, r && r.project],
    [true, "cite", "joined", P_OUT]);
}
t("and nothing was written: P_OUT's document is unchanged — still citing the ledger, never the minutes",
  /MINUTES|minutes/.test(String(((await GET(`op=file&token=${ADM}&id=${P_OUT}&path=bundle.md`)) || {}).text)), false);
t("and P_OUT stands on nothing (no version pointer was written for it)",
  ((await GET(`op=basisversions&token=${ADM}&id=${E(INQ)}&project=${P_OUT}`)) || {}).current ?? null, null);

console.log("\n--- 2b. the rule is the POSITION, not the administrator: an ordinary member too ---");
{
  const r = await ACTS.cite(VERA, P_OUT);
  t("vera is INVITED to P_OUT and has not joined — she sees it (skeleton) and has view rights only (§7.5): "
    + "op=cite answers PROJECT_ACT_NOT_A_PARTICIPANT", codeOf(r), NOT_IN);
  t("vera's op=promote of it is refused the same way", codeOf(await ACTS.promote(VERA, P_OUT)), NOT_IN);
}
console.log("\n--- 2b'. KNOWN, NOT CLOSED HERE (D-426): cite has no SIGHT gate on its project, so an uninvited member learns a project exists ---");
{
  /* PINNED AS MEASURED, so it fails when D-426 is closed and the pin must then be corrected. Before
     REC-134 the same two ids answered NO_SUCH_PROJECT and a successful edit; the edit is closed, the
     existence signal (older than this item: NO_SUCH_PROJECT vs NOT_A_PROJECT already told them apart)
     is not. vera was never invited to P_JOIN. */
  const hidden = await ACTS.cite(VERA, P_JOIN), absent = await ACTS.cite(VERA, "PROJ-2026-9134-nosuch");
  t("D-426 (KNOWN): vera's cite into a project she cannot see answers differently from one that does not exist",
    [codeOf(hidden), codeOf(absent)], [NOT_IN, "NO_SUCH_PROJECT"]);
}
console.log("\n--- 2c. JOINED is not OWNER: ruth has joined P_JOIN and is not its owner ---");
t("ruth may cite into P_JOIN (joined: the working rights, §7.5)", (await ACTS.cite(RUTH, P_JOIN))?.ok, true);
t("ruth may NOT adopt a bias set into P_JOIN's scope — that is its managers' act (Declared Bias; DEC-72 (5))",
  codeOf(await ACTS.biasadopt(RUTH, P_JOIN)), NOT_OWNER);

/* ===================================== 3. IN THE PROJECT WITH THE ROLE: THEY CAN */
console.log("\n--- 3. IN the project with the required role: the SAME people can (the liar's arm) ---");
for (const [who, tok] of [["the founder", FOUNDER], ["ruth", RUTH]]) {
  for (const act of ["promote", "cite", "sever", "reinstate", "versioncurrent", "proposedispose", "biasadopt", "conclude",
                     "withdrawconclusion"]) {
    const r = await ACTS[act](tok, P_IN);
    t(`ALLOWED: ${who} (an owner of P_IN) — op=${act} succeeds`,
      [r && r.ok, r && r.ok ? "ok" : codeOf(r)], [true, "ok"]);
  }
}
t("the founder's make-current landed as P_IN's own stance",
  ((await GET(`op=basisversions&token=${ADM}&id=${E(INQ)}&project=${P_IN}`)) || {}).current?.version
    ?? ((await GET(`op=basisversions&token=${ADM}&id=${E(INQ)}&project=${P_IN}`)) || {}).current, "v1");

/* ===================================== 4. §7.13 — THE ONE ADMINISTRATOR PATH */
console.log("\n--- 4. §7.13 add-an-owner: still the one administrator path, under its condition ---");
t("while olga (P_RES's only owner) is ACTIVE, ruth's rescue is refused OWNERS_ARE_ACTIVE — the condition holds",
  codeOf(await POST(`op=projectownerrescue&token=${RUTH}&projectId=${P_RES}&handle=vera&reason=${E("stranded")}`)),
  "OWNERS_ARE_ACTIVE");
must("olga deactivated", await POST(`op=memberset&token=${ADM}`, { memberId: "olga", status: "revoked" }));
must("oren deactivated", await POST(`op=memberset&token=${ADM}`, { memberId: "oren", status: "revoked" }));
{
  /* Asked FIRST, while the condition holds: once the rescue lands, the new owner is active and the
     condition answers OWNERS_ARE_ACTIVE before the reason is read (the first run of this suite
     asked it afterwards and measured exactly that — the arm's order, not the subject). */
  t("§7.13 needs a reason — still refused without one", codeOf(await POST(
    `op=projectownerrescue&token=${RUTH}&projectId=${P_RES}&handle=iris`)), "NO_REASON");
  const r = await POST(`op=projectownerrescue&token=${RUTH}&projectId=${P_RES}&handle=vera`
    + `&reason=${E("every owner is inactive")}`);
  t("RESCUE: ruth, NOT in P_RES, adds vera as its owner once every owner is inactive (§7.13) — recorded with a reason",
    [r && r.ok, r && r.by, r && r.reason, r && r.addedNotReplaced], [true, "ruth", "every owner is inactive", true]);
  const f = await POST(`op=projectownerrescue&token=${FOUNDER}&projectId=${P_RES2}&handle=iris`
    + `&reason=${E("oren left")}`);
  t("RESCUE: the founder, NOT in P_RES2, performs the same act (it is an administrator's)",
    [f && f.ok, f && f.by], [true, "admin"]);
  t("and the rescue did not make ruth anything in P_RES: she still cannot cite into it",
    codeOf(await ACTS.cite(RUTH, P_RES)), NOT_IN);
}

/* ===================================== 5. MACHINE CREDENTIALS ARE UNCHANGED */
console.log("\n--- 5. machine credentials hold no position and their fences are unchanged ---");
t("the ADMIN token still revises P_OUT's document (a machine credential is not asked a position)",
  (await ACTS.promote(ADM, P_OUT))?.ok, true);
t("the MEMBER token still cites into P_OUT", (await ACTS.cite(MEM, P_OUT))?.ok, true);

/* ===================================== 6. THE PRE-FLIGHT AGREES (DEC-8) */
console.log("\n--- 6. op=affordances does not offer what the act now refuses ---");
const actIds = async (tok, target) => (((await GET(`op=affordances&token=${tok}&target=${target}`)) || {}).acts || [])
  .map((a) => a.id);
for (const [who, tok] of [["the founder", FOUNDER], ["ruth", RUTH]]) {
  const out = await actIds(tok, P_OUT), inn = await actIds(tok, P_IN);
  t(`${who}: on P_OUT (not in it) cite and sever are NOT offered; on P_IN (an owner) both are`,
    [out.includes("cite"), out.includes("sever"), inn.includes("cite"), inn.includes("sever")],
    [false, false, true, true]);
}
{
  const adm = await actIds(ADM, P_OUT);
  t("the ADMIN token's act set on P_OUT is unchanged (cite and sever offered; the fact reads null for it)",
    [adm.includes("cite"), adm.includes("sever")], [true, true]);
}

/* ===================================== 7. STRUCTURE */
console.log("\n--- 7. structure — the identity the check reads is the SERVER's stamp ---");
{
  const r = await ACTS.cite(RUTH, `${P_OUT}&identity=${E("member:iris")}`);
  t("a caller naming `identity=member:iris` is not believed: ruth is still refused on P_OUT",
    codeOf(r), NOT_IN);
  const sel = await POST(`op=select&token=${RUTH}&kind=enumerated`, { ids: [MINUTES] });
  const b = await POST(`op=proposedispose&token=${RUTH}`,
    { project: P_OUT, finding: "F-body", to: "deferred", reason: "body identity", identity: "member:iris" });
  t("nor is an `identity` in a POST body (proposedispose reads it from the URL, after the body)", codeOf(b), NOT_IN);
  void sel;
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nproject-authority: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d311.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (`d310.control.mjs`'s precedent). Re-run from `bio-plane/`: `node test/d311.control.mjs [arm]`. Every arm is armed ALONE, its anchor asserted to occur exactly once, and every source restored from a per-arm pristine copy verified by sha256, by content and by `cmp`. (1) THE ROW'S OWN — swap D-310's fact in: the roster fact's `owner` asks `#ownsAnyProject(actor)` instead of `#isProjectOwner(target, actor)` -> MUST FAIL "CROSS-PROJECT" (iris owns PA and merely joined PB, and is offered projectinvite on PB); MUST NOT FAIL the machine arms. (2) THE MACHINE RULE DROPPED — `deriveActs` no longer consults MACHINE_REFUSALS -> MUST FAIL "MACHINE WITHHELD"; MUST NOT FAIL "CROSS-PROJECT". (3) OVER-STRICTNESS — `projectjoin` narrowed to `state === "invited"` -> MUST FAIL the join row of "THE AGREEMENT" (a joined participant's join succeeds and is no longer offered); MUST NOT FAIL "CROSS-PROJECT". (4) THE STAMP — the roster fact asked of `identity` instead of `by` is NOT drivable here (no `ai` credential in this fixture); stated, not claimed.
   RESULTS, RUN 2026-09-23 by the D-311 worker (sources affordances.mjs 156,123 B sha256 98783a998be2…, store.mjs 2,888,728 B sha256 87599f71a4c9…, each restored after every arm and verified by sha256, by content and by `cmp` x2): BASELINE 21/0 · (1) 15/6 — the invite, remove and owner-add AGREEMENT rows, the positions row, CROSS-PROJECT by name, and the structural `#ownsAnyProject` pin; the machine arms GREEN · (2) 20/1 — "MACHINE WITHHELD: on every fixture object" alone · (3) 19/2 — the projectjoin AGREEMENT row and the positions row · (4) 20/1 — "THE MACHINE MAP IS THE STORE'S" alone. 4 arms, 0 other than declared. The positions row falling beside the named arms in (1) and (3) is WIDER than declared and is kept: it pins the measured positions, so any change to them moves it. RE-RUN 2026-09-24 by c19-unionfix after two drives were added (D-149's `actionlaws`, REC-149's `projectvisibilityset`) and `actionlaws: "MACHINE_CANNOT_SET_LAWS"` joined MACHINE_REFUSALS: baseline 21/0; ARM (5) that entry deleted from affordances.mjs (anchor asserted once; restored by cp, sha256 AND cmp, 167,298 B) -> 20/1, "THE MACHINE MAP IS THE STORE'S" alone, AS DECLARED.
 * =========================================================================
 * D-311 — `op=affordances` PUBLISHED NOTHING ABOUT SEVEN ROSTER ACTS, AND OFFERED A MACHINE
 * CREDENTIAL ACTS ITS CLASS IS REFUSED BY NAME.
 *
 * Design: `BIO_Interaction_Constructs_v0_1.md` §"RULED 2026-08-01: the pre-flight is plane-sourced"
 * (*see what it will refuse and why BEFORE it runs*), with the positions of
 * `BIO_Membership_Architecture_v2.md` §7 (7.2 invite, 7.4 join, 7.6 leave, 7.7 removal AS REVERSED IN
 * v2 — an OWNER's, 7.10 ownership, 7.13 rescue).
 *
 * WHAT THIS HOLDS, as ONE property per act and never as two pins that could drift apart:
 *   §1 THE AGREEMENT — for every (roster act, caller, project) in the fixture, `op=affordances`
 *      OFFERS the act exactly when the store ACCEPTS it on everything but its parameters. Each side
 *      is a live answer; the `want` carries no expectation derived from the subject. The table is
 *      printed and guarded against being uniform (a gate offering everything, and one offering
 *      nothing, both satisfy a biconditional over rows that agree).
 *   §2 CROSS-PROJECT — how a liar passes §1: reuse D-310's "owner of SOME project". iris owns PA
 *      and merely joined PB; she must not be offered `projectinvite` on PB. Named on its own so the
 *      row's negative control fails BY NAME.
 *   §3 THE MACHINE — a machine credential is offered nothing its class is refused: every act in
 *      ACTS is PERFORMED with the machine token and the MACHINE_* codes that come back must be
 *      exactly `MACHINE_REFUSALS` (both directions), and on every fixture object the machine's
 *      published acts must hold none of them — while acts the store does NOT refuse a machine
 *      (`cite` above all) are still offered to it (the over-strictness arm).
 *   §4 THE STAMPS — structural: the two stamps `op=affordances` sends are the SAME expressions the
 *      acts receive, and the facts read `by` (the roster stamp) and not `identity`.
 *
 * WHAT THIS CANNOT SEE, stated: an `ai` credential (whose `identity` is its member principal while
 * its roster `by` is `class:ai`) is not in the fixture, so the `by`-not-`identity` choice is pinned
 * structurally in §4 and not driven; `op=queue`'s options for a machine are not driven here (the
 * queue suites hold them equal to this op's answer).
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { ACTS, MACHINE_REFUSALS } from "../src/affordances.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const ADM = "adm-d311", MEM = "mem-d311";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
}));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
};
/* A success answers "ok" FIRST: several acts echo the caller's own `reason` parameter in a success. */
const codeOf = (r) => (r && r.ok === true) ? "ok" : (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 600)}`); return r; };
const E = encodeURIComponent;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* THE op under test, uninterpolated so coverage credits it here. */
const offered = async (tok, target) => ((await GET(`op=affordances&token=${tok}&target=${E(target)}`))?.acts ?? [])
  .map((a) => a.id);

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-d311" }));
const FOUNDER = (await POST("op=login", { password: "founder-passphrase-d311" })).token;
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-d311` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-d311` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin");    /* an administrator holding no position anywhere */
const IRIS = await enrol("iris", "member");   /* owns PA and PC; JOINED PB, which she does not own */
const PAM = await enrol("pam", "member");     /* owns PB; joined PA; second owner of PC */
const OLGA = await enrol("olga", "member");   /* INVITED to PA, never joins */
const ZED = await enrol("zed", "member");     /* joined PA, then asked to leave */
const VERA = await enrol("vera", "member");   /* sole owner of PR, deactivated: PR is stranded (7.13) */
await enrol("nell", "member");                /* invited by nobody; exists only as a handle */

let snapSeq = 0;
const projectMd = (name) => ["---", "object_type: project", `title: "${name}"`, "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "required_strength:", "  capture: B", "  connection: C", "---", "", "## Summary", "", "A project.", "",
  "## Session Log", ""].join("\n");
const mkProject = async (name) => {
  const text = projectMd(name);
  return must(`promote ${name}`, await POST(`op=promote&token=${ADM}`, {
    base: null, snapKey: `d311-${++snapSeq}-${sha(name).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: name, current_state: "forming",
            created: NOW, last_updated: LATER } })).bundleId;
};
const PA = await mkProject("D-311 project A");
const PB = await mkProject("D-311 project B");
const PC = await mkProject("D-311 project C");
const PR = await mkProject("D-311 project R");
const DOinvite = (p, handle, by) => DO(`projectinvite?projectId=${p}&handle=${handle}&by=${by}&viewer=admin`, {});
must("iris owns PA", await DO("projectclaimowner", { projectId: PA, memberId: "iris" }));
must("pam owns PB", await DO("projectclaimowner", { projectId: PB, memberId: "pam" }));
must("iris owns PC", await DO("projectclaimowner", { projectId: PC, memberId: "iris" }));
must("vera owns PR", await DO("projectclaimowner", { projectId: PR, memberId: "vera" }));
for (const h of ["pam", "olga", "zed"]) must(`iris invites ${h} to PA`, await DOinvite(PA, h, "iris"));
must("pam joins PA", await POST(`op=projectjoin&token=${PAM}&projectId=${PA}`));
must("zed joins PA", await POST(`op=projectjoin&token=${ZED}&projectId=${PA}`));
must("zed asks to leave PA", await POST(`op=projectleave&token=${ZED}&projectId=${PA}`));
must("pam invites iris to PB", await DOinvite(PB, "iris", "pam"));
must("iris joins PB", await POST(`op=projectjoin&token=${IRIS}&projectId=${PB}`));
must("iris invites pam to PC", await DOinvite(PC, "pam", "iris"));
must("pam joins PC", await POST(`op=projectjoin&token=${PAM}&projectId=${PC}`));
must("iris adds pam as PC's second owner (the sole owner acts alone, 7.10)",
  await POST(`op=projectowneradd&token=${IRIS}&projectId=${PC}&handle=pam`));
must("vera deactivated — every owner of PR inactive", await POST(`op=memberset&token=${ADM}`, { memberId: "vera", status: "revoked" }));

const CALLERS = [["iris", IRIS], ["pam", PAM], ["olga", OLGA], ["zed", ZED], ["ruth (admin)", RUTH],
                 ["founder", FOUNDER], ["MEMBER token (machine)", MEM], ["ADMIN token (machine)", ADM]];
const PROJECTS = [["PA", PA], ["PB", PB], ["PC", PC], ["PR", PR]];
/* PROBE ORDER, and it is load-bearing: `projectleave` is PERFORMED before `projectjoin`, because a
   join moves an invited or leaving participant to joined and would make a later leave succeed where
   the offer (read before any probe) was taken on the earlier state. Join's own acceptance turns only on
   a participation row existing, which a leave never removes. */
const ROSTER = ["projectinvite", "projectleave", "projectjoin", "projectremove", "projectowneradd",
                "projectownerremove", "projectownerrescue"];
console.log(`  corpus: ${CALLERS.length} callers x ${PROJECTS.length} projects x ${ROSTER.length} roster acts`);
t("FIXTURE GUARD: the seven roster acts are the ACTS this item adds, and every one is in the catalogue",
  ROSTER.filter((k) => !ACTS.some((a) => a.id === k)), []);

/* ============================ 1. THE AGREEMENT, per (act, caller, project) */
console.log("\n--- 1. D-311: each roster act is OFFERED exactly where its store act ACCEPTS, pair by pair ---");
/* THE OFFER SIDE FIRST, for every pair, before any probe can move the roster. */
const offer = new Map();
for (const [, tok] of CALLERS) for (const [, p] of PROJECTS) offer.set(`${tok}|${p}`, await offered(tok, p));

/* THE ACCEPT SIDE. Each probe carries a parameter chosen to fail AFTER every position and project
   check, so `accepted` means "refused only by the parameter" and nothing is written — except
   projectleave (no parameter to fail on) and projectjoin, which are PERFORMED, leave first: join's
   acceptance turns only on a participation row existing, which a leave does not remove. The
   owner-removal probe names the CALLER as its target with a reason, so the one-owner floor
   (LAST_OWNER) is reached; at two owners the caller's vote is recorded (VOTES_SHORT), which is the
   act accepted and changes no ownership. */
const NOBODY = "__no_such_handle_d311__";
const PARAM_ONLY = new Set(["NO_SUCH_HANDLE", "VOTES_SHORT", "ok"]);
const probe = {
  projectinvite:      (tok, p) => POST(`op=projectinvite&token=${tok}&projectId=${p}&handle=${NOBODY}`),
  projectremove:      (tok, p) => POST(`op=projectremove&token=${tok}&projectId=${p}&handle=${NOBODY}`),
  projectowneradd:    (tok, p) => POST(`op=projectowneradd&token=${tok}&projectId=${p}&handle=${NOBODY}`),
  projectownerrescue: (tok, p) => POST(`op=projectownerrescue&token=${tok}&projectId=${p}&handle=${NOBODY}&reason=${E("stranded")}`),
  projectownerremove: async (tok, p, who) => POST(`op=projectownerremove&token=${tok}&projectId=${p}`
    + `&handle=${E(who)}&reason=${E("d311 probe")}`),
  projectleave:       (tok, p) => POST(`op=projectleave&token=${tok}&projectId=${p}`),
  projectjoin:        (tok, p) => POST(`op=projectjoin&token=${tok}&projectId=${p}`),
};
const HANDLE = new Map(CALLERS.map(([who, tok]) => [tok, who.split(" ")[0]]));
const rows = [];
for (const act of ROSTER)
  for (const [who, tok] of CALLERS)
    for (const [pn, p] of PROJECTS) {
      const r = await probe[act](tok, p, HANDLE.get(tok));
      const reason = codeOf(r);
      rows.push({ act, who, pn, offered: offer.get(`${tok}|${p}`).includes(act), accepted: PARAM_ONLY.has(reason), reason });
    }
for (const act of ROSTER) {
  const mine = rows.filter((r) => r.act === act);
  console.log(`  ${act}: offered ${mine.filter((r) => r.offered).map((r) => `${r.who.split(" ")[0]}@${r.pn}`).join(", ") || "(none)"}`);
  const bad = mine.filter((r) => r.offered !== r.accepted);
  for (const r of bad) console.log(`    DISAGREE ${r.who} @ ${r.pn}: offered=${r.offered}, store answered ${r.reason}`);
  t(`THE AGREEMENT — ${act}: op=affordances OFFERS it exactly where the store ACCEPTS it, for every caller and project`,
    bad.map((r) => `${r.who}@${r.pn}: offered ${r.offered}, ${r.reason}`), []);
}
t("FIXTURE GUARD: every roster act is offered to somebody AND withheld from somebody — neither a gate "
+ "that offers everything nor one that offers nothing can pass the agreement",
  ROSTER.filter((act) => { const m = rows.filter((r) => r.act === act); return !(m.some((r) => r.offered) && m.some((r) => !r.offered)); }), []);
/* The positions the rows rest on, named, so a fixture drift is loud rather than a quiet green. */
const at = (act, who, pn) => rows.find((r) => r.act === act && r.who.startsWith(who) && r.pn === pn);
t("the positions, as measured: invite is the OWNER's; join every participant's (the invitee's, the "
+ "joined, the leaving); leave the joined's; removal an OWNER's and NOT an administrator's (v2 7.7); "
+ "owner-removal clear of the one-owner floor only on PC; the rescue an administrator's on stranded PR only",
  [at("projectinvite", "iris", "PA").offered, at("projectinvite", "pam", "PA").offered,
   at("projectjoin", "olga", "PA").offered, at("projectjoin", "zed", "PA").offered, at("projectjoin", "pam", "PA").offered,
   at("projectleave", "zed", "PA").offered, at("projectleave", "olga", "PA").offered,
   at("projectremove", "ruth", "PA").offered, at("projectremove", "founder", "PA").offered, at("projectremove", "iris", "PA").offered,
   at("projectownerremove", "iris", "PA").offered, at("projectownerremove", "iris", "PC").offered,
   at("projectownerrescue", "ruth", "PR").offered, at("projectownerrescue", "founder", "PR").offered,
   at("projectownerrescue", "ruth", "PA").offered],
  [true, false, true, true, true, false, false, false, false, true, false, true, true, true, false]);

/* ============================ 2. CROSS-PROJECT: the liar's route, named */
console.log("\n--- 2. CROSS-PROJECT: the fact is the PAIR, never D-310's `owner of SOME project` ---");
t("CROSS-PROJECT: iris owns PA and merely JOINED PB — she is offered projectinvite, projectremove and "
+ "projectowneradd on PA and on NEITHER of them on PB, where the store refuses her NOT_THE_OWNER",
  [["projectinvite", "PA"], ["projectremove", "PA"], ["projectowneradd", "PA"],
   ["projectinvite", "PB"], ["projectremove", "PB"], ["projectowneradd", "PB"]]
    .map(([act, pn]) => [act, pn, at(act, "iris", pn).offered, at(act, "iris", pn).reason]),
  [["projectinvite", "PA", true, "NO_SUCH_HANDLE"], ["projectremove", "PA", true, "NO_SUCH_HANDLE"],
   ["projectowneradd", "PA", true, "NO_SUCH_HANDLE"], ["projectinvite", "PB", false, "NOT_THE_OWNER"],
   ["projectremove", "PB", false, "NOT_THE_OWNER"], ["projectowneradd", "PB", false, "NOT_THE_OWNER"]]);

/* ============================ 3. THE MACHINE */
console.log("\n--- 3. a MACHINE credential is offered nothing its class is refused BY NAME ---");
t("MACHINE WITHHELD: neither machine token is offered ANY roster act on ANY project — `by` is "
+ "`class:<cls>`, which holds no row, and every probe above refused it",
  rows.filter((r) => /machine/.test(r.who) && (r.offered || r.accepted)).map((r) => `${r.act}@${r.pn}`), []);

/* The corpus the object-directed half needs: an information bundle, a question resting on it with a
   reading, an action. Promoted by the ADMIN token; nothing about them is under test but the acts. */
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const sc = (k, v) => v === null ? [`    ${k}: null`] : typeof v === "boolean" ? [`    ${k}: ${v}`] : [`    ${k}: "${String(v)}"`];
const inquiryMd = (id, basis) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the transfer follow the adopted process?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references:", `  - target: ${basis}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "recheck_triggers:",
  "  - text: Revisit after the next budget cycle", "    description: The adopted budget may restate the basis.",
  "basis:", `  - target: ${basis}`, "    role: supports", "basis_versions:", '  - name: "v1"',
  ...sc("description", "the ledger reading"), ...sc("relationship", "and"), ...sc("state", "suggested"),
  ...sc("derived_from", null), ...sc("hidden", false), ...sc("claim", "The transfer followed the process."),
  ...sc("author", "iris"), ...sc("at", NOW), "basis_version_grounds:", '  - version: "v1"',
  ...sc("ground", "g1"), ...sc("asserted_by", "iris"), ...sc("at", NOW),
  "basis_version_legs:", '  - version: "v1"', ...sc("target", basis), ...sc("role", "supports"),
  ...sc("ground", "g1"), ...sc("grade", "B"), ...sc("grade_axis", "capture"), ...sc("grade_source", "capture"),
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const actnMd = (id) => ["---", `id: ${id}`, "object_type: action", "schema: action@1", `title: "Request ${id}"`,
  "current_state: planned", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: human", "  capability_tier: member", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "action_kind: cpra_request", "target_body:", "  name: City Clerk", "---", "", "## Request", "",
  "Records.", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const promote = async (id, text, type, state) => must(`promote ${id}`, await POST(`op=promote&token=${ADM}`, {
  bundleId: id, base: null, snapKey: `d311-${++snapSeq}-${sha(id).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information" ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`, current_state: state, created: NOW, last_updated: LATER } }));
const INFO = "INFO-2026-9311-ledger", INQ = "INQ-2026-9311-transfer", ACTN = "ACTN-2026-9311-request";
await promote(INFO, infoMd(INFO), "information", "collected");
await promote(INQ, inquiryMd(INQ, INFO), "inquiry", "open");
await promote(ACTN, actnMd(ACTN), "action", "planned");

/* The published side FIRST, on every fixture object as promoted, for both machine tokens beside a
   member — before the drives below move any of them (a machine's `dispose` SUCCEEDS). */
const OBJECTS = [["information", INFO], ["inquiry", INQ], ["action", ACTN], ["project PA", PA]];
const leak = [];
for (const [, tok] of [["MEM", MEM], ["ADM", ADM]])
  for (const [on, id] of OBJECTS)
    for (const k of await offered(tok, id)) if (k in MACHINE_REFUSALS || ROSTER.includes(k)) leak.push(`${on}:${k}`);
t("MACHINE WITHHELD: on every fixture object neither machine token is offered an act its class is "
+ "refused by name — the pre-flight and the act agree",
  leak, []);
const memberOnInq = await offered(IRIS, INQ);
t("OVER-STRICTNESS: the machine rule narrows MACHINES and nothing else — a member is still offered "
+ "machine-refused acts where the state permits them (the version acts on a question holding a reading)",
  ["versionaccept", "versionconsider"].map((k) => memberOnInq.includes(k)), [true, true]);
const infoOfferedToMachine = (await offered(MEM, INFO)).includes("cite");
/* EVERY ACT IN ACTS, PERFORMED WITH THE MACHINE TOKEN. The machine fences are asked of the author
   stamp before the object's state, so any well-shaped request reaches them; what comes back is the
   store's own answer, and this suite derives the refused set from it rather than typing one. */
const sel = async (ids) => must("select", await POST(`op=select&token=${MEM}&kind=enumerated`, { ids })).handle;
const DRIVE = {
  release: async () => GET(`op=release&token=${MEM}&handle=${await sel([INFO])}&acknowledgment=a&mitigation=m`),
  retire: async () => GET(`op=retire&token=${MEM}&handle=${await sel([INFO])}&reason=r`),
  dispose: async () => GET(`op=dispose&token=${MEM}&handle=${await sel([INQ])}&to=deferred&reason=r`),
  conclude: () => GET(`op=conclude&token=${MEM}&target=${E(INQ)}&conclusion=c&falsifier=f`),
  withdrawconclusion: () => GET(`op=withdrawconclusion&token=${MEM}&target=${E(INQ)}&project=${PA}&reason=r`),
  reopen: () => GET(`op=reopen&token=${MEM}&target=${E(INQ)}&reason=r`),
  publish: () => POST(`op=publish&token=${MEM}`, { target: INQ, project: PA, roles: { [INQ]: "load_bearing" } }),
  inquirydivide: () => POST(`op=inquirydivide&token=${MEM}&target=${E(INQ)}&reason=r`, { children: [] }),
  inquiryground: () => POST(`op=inquiryground&token=${MEM}&target=${E(INQ)}&reason=r`, { grounds: [] }),
  actionmove: () => GET(`op=actionmove&token=${MEM}&target=${E(ACTN)}&to=filed&reason=r`),
  actioncorrespond: () => GET(`op=actioncorrespond&token=${MEM}&target=${E(ACTN)}&direction=sent&at=2026-07-01&account=x`),
  versionaccept: () => GET(`op=versionaccept&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
  versionreject: () => GET(`op=versionreject&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
  versionconsider: () => GET(`op=versionconsider&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
  versionrevert: () => GET(`op=versionrevert&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
  versioncurrent: () => GET(`op=versioncurrent&token=${MEM}&target=${E(INQ)}&version=v1&project=${PA}&reason=r`),
  versionhide: () => GET(`op=versionhide&token=${MEM}&target=${E(INQ)}&version=v1&reason=r`),
  cite: async () => GET(`op=cite&token=${MEM}&project=${PA}&handle=${await sel([INFO])}&note=basis`),
  sever: async () => GET(`op=sever&token=${MEM}&project=${PA}&handle=${await sel([INFO])}&reason=r`),
  reinstate: async () => GET(`op=reinstate&token=${MEM}&project=${PA}&handle=${await sel([INFO])}&reason=r`),
  /* ADDED at integration by c19-unionfix, 2026-09-24: two acts arrived in ACTS with no drive here — D-149's
     `actionlaws` and REC-149's `projectvisibilityset` — and the FIXTURE GUARD below named them. Each is a REAL,
     well-shaped request, so the store answers from its own fences rather than from a malformed body. The first
     drive FOUND A DEFECT: the store refuses a machine BY NAME at `actionlaws` (MACHINE_CANNOT_SET_LAWS) while
     `MACHINE_REFUSALS` did not list it, so a machine was offered the act; fixed in affordances.mjs. */
  actionlaws: () => POST(`op=actionlaws&token=${MEM}&target=${E(ACTN)}`,
    { laws: [{ level: "state", citation: "Cal. Gov. Code 7920.000" }] }),
  projectvisibilityset: () => POST(`op=projectvisibilityset&token=${MEM}&projectId=${PA}&setting=discoverable`),
};
const objectActs = ACTS.map((a) => a.id).filter((k) => !ROSTER.includes(k));
t("FIXTURE GUARD: every object-directed act in ACTS has a drive here — an act added to ACTS without "
+ "one fails by name, so the machine sweep cannot silently shrink",
  objectActs.filter((k) => !(k in DRIVE)), []);
const machineCode = {};
for (const k of objectActs) {
  const c = codeOf(await DRIVE[k]());
  machineCode[k] = c;
  console.log(`  machine performs ${k}: ${c}`);
}
const refusedByName = Object.fromEntries(Object.entries(machineCode).filter(([, c]) => /^MACHINE_/.test(String(c))));
t("THE MACHINE MAP IS THE STORE'S: the MACHINE_* codes a machine credential is answered, act by act, "
+ "are EXACTLY `MACHINE_REFUSALS` — an act refused by name and absent there, or listed there and no "
+ "longer refused, fails here by name",
  refusedByName, Object.fromEntries(objectActs.filter((k) => k in MACHINE_REFUSALS).map((k) => [k, MACHINE_REFUSALS[k]])));
t("and the sweep is not degenerate: the store refuses a machine by name at some acts and at others it does not",
  [Object.keys(refusedByName).length > 0, objectActs.some((k) => !(k in refusedByName))], [true, true]);

t("OVER-STRICTNESS: and a machine is still offered what its class is NOT refused — `cite` on the "
+ "information bundle, which the store lets a machine perform",
  [infoOfferedToMachine, machineCode.cite], [true, "ok"]);

/* ============================ 4. THE STAMPS, structurally */
console.log("\n--- 4. the facts are asked of the stamps the ACTS receive ---");
const indexSrc = readFileSync(IDX, "utf8");
const storeSrc = readFileSync(STORE_SRC, "utf8");
const expr = (re) => { const m = re.exec(indexSrc); return m ? m[1].trim() : null; };
const authorAtAct = expr(/\|\| op === "narrow"\)\s*\n\s*inner\.searchParams\.set\("author", ([^;]+)\);/);
/* CORRECTED 2026-09-23 (REC-159), never exempted: the stamp's last disjunct was `op === "memberadd"`;
   REC-159 widened it to `CUSTODIAL_ACTIONS.includes(op)`, the four §4.9 acts. Same ONE expression. */
const byAtAct = expr(/\|\| CUSTODIAL_ACTIONS\.includes\(op\)\)\s*\n\s*inner\.searchParams\.set\("by", ([^;]+)\);/);
const affAuthor = expr(/const affAuthor = ([^;]+);/);
const affBy = expr(/const affBy = ([^;]+);/);
t("op=affordances sends `author` and `by` composed by the SAME expressions the object-directed acts' "
+ "author stamp and the roster acts' `by` stamp use",
  [authorAtAct !== null, byAtAct !== null, affAuthor === authorAtAct, affBy === byAtAct], [true, true, true, true]);
const facts = (() => {
  const s = storeSrc.indexOf("  affordanceFacts({ target, viewer = null, identity = null, author = null, by = null } = {}) {");
  return s === -1 ? "" : storeSrc.slice(s, storeSrc.indexOf("\n  }\n", s));
})();
const rosterFact = (() => { const s = facts.indexOf("roster: (() => {"); return s === -1 ? "" : facts.slice(s, facts.indexOf("})(),", s)); })();
t("the roster fact is asked of `by` through the predicates the roster refusals run — `#isProjectOwner` "
+ "on THIS target, `#participation`, `ownerMath` over `#owners`, `#rescueRefusal` — and never of "
+ "`identity` nor D-310's `#ownsAnyProject`",
  [rosterFact.length > 200, /#isProjectOwner\(b\.bundle_id, actor\)/.test(rosterFact), /#participation\(/.test(rosterFact),
   /ownerMath\(this\.#owners\(/.test(rosterFact), /#rescueRefusal\(/.test(rosterFact),
   /\bidentity\b/.test(rosterFact.replace(/\/\*[\s\S]*?\*\//g, "")), /#ownsAnyProject/.test(rosterFact)],
  [true, true, true, true, true, false, false]);
const rescue = (() => { const s = storeSrc.indexOf("  projectOwnerRescue({"); return s === -1 ? "" : storeSrc.slice(s, storeSrc.indexOf("\n  }\n", s)); })();
t("and the rescue ACT runs the same `#rescueRefusal` the fact asks — one predicate, not a copy",
  [rescue.length > 200, /this\.#rescueRefusal\(projectId, by\)/.test(rescue), /OWNERS_ARE_ACTIVE/.test(rescue)],
  [true, true, false]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd311-roster-affordances: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

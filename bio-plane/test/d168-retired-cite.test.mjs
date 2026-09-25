/* NEGATIVE CONTROL: RUN 2026-09-23 (D-168 worker, worktree agent-ab0b1ebe531cb428b), each arm ALONE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp (src/store.mjs 2,858,946 B sha256 f4288f242de1…, src/affordances.mjs 149,033 B sha256 4966546525a5…); baseline 19 pass / 0 fail.
   (A) DROP THE CHECK — in src/store.mjs cite(), `if (retiredMembers.length)` -> `if (false && retiredMembers.length)`. DECLARED: every §1 arm and §3's re-cite arm fail, §2 and §4 hold. RESULT 11/8, AS DECLARED: the MEMBER arm "§1 MEMBER onto a QUESTION: a cite of RETIRED information is refused BY NAME" fails first, then the member-onto-a-case, both MACHINE CREDENTIAL arms, the mixed selection, "nothing landed", and §3's re-cite. §3's BYTE-IDENTICAL arm stays GREEN under (A), and that is correct rather than blind: a re-cite of a target the document already cites is the act's idempotent `already` partition and writes nothing either way — what (A) would let land is a NEW citation, which §1's "nothing landed" catches.
   (B) OVER-STRICT — `=== "retired"` -> `!== "collected"` (refuses the verified removed-source bundle too, the liar that reads a second axis). DECLARED: the four §2 arms fail, §1 holds. RESULT 15/4, AS DECLARED.
   (C) THE PRE-FLIGHT — in src/affordances.mjs `cite`, `(ty === "information" && f.current_state !== "retired")` -> `(ty === "information")`. DECLARED: §4 fails alone. RESULT 18/1, AS DECLARED.
   RE-RUN 2026-09-23 by the REC-181 worker after §3's fixture was corrected (see §3's fixture note; src/store.mjs sha256 46596c65df89…, restored by cp and verified by sha256 and cmp): (A) RESULT 10/9 — every §1 arm and §3's re-cite arm fail as before, and §3's BYTE-IDENTICAL arm now fails too: the older edge onto OLD is SEVERED rather than confirmed, so a re-cite is no longer the idempotent `already` partition and (A) lets it write. Stronger than the original, not a regression. */
/* NEGATIVE CONTROL (D-553, §5): RUN 2026-09-25 by the D-553 worker, ALONE, src/store.mjs restored by cp from a per-arm pristine copy and verified by sha256 AND cmp (3,350,918 B, sha256 54bfa2754d8a…); baseline 21 pass / 0 fail. In suggestVersion's CHECK 1, `if (retired) unreachable.push(` -> `if (false && retired) unreachable.push(`. DECLARED: §5's RETIRED arm fails ALONE; §5's hidden-target arm and every §1-§4 arm hold. RESULT 20/1, AS DECLARED. */
/* =========================================================================
 * D-168 — A RETIRED ITEM IS NOT CITABLE.
 * State Rules & Consistency v1.5 §4.1, the paragraph *"A RETIRED ITEM IS NOT
 * CITABLE"* (ruled 2026-09-23 by BOB #30, landed at 4355bfda).
 *
 * THE DEFECT: `op=cite` asked a selection member its TYPE and nothing else, so
 * a member (or a machine credential) could rest a case or a question on an
 * Information bundle the group itself had RETIRED — superseded, or no longer
 * standing — and the claim then read to every later member as live support.
 * The machine's suggest path already refused exactly this
 * (SUGGEST_LEG_UNREACHABLE); the member's door did not.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO, all of it THROUGH THE OP (miniflare):
 *   §1 a cite onto a RETIRED Information bundle is refused BY NAME —
 *      RETIRED_NOT_CITABLE, C-33.39, with the catalog's canned translation —
 *      for a MEMBER'S SESSION and for a MACHINE CREDENTIAL alike, on BOTH arms
 *      (onto a question and onto a case). The whole call is refused, never
 *      narrowed: a mixed selection lands nothing.
 *   §2 a cite onto a `source_status: removed` bundle LANDS, for both callers.
 *      A publisher withdrawing a document is the OTHER axis, never `retired`.
 *   §3 a confirmed leg / edge that PREDATES the retirement is untouched: the
 *      citing documents are byte-identical across the retirement and across
 *      the refused re-cite.
 *   §4 op=affordances does not offer `cite` on a retired bundle and does on a
 *      removed-source one (DEC-8: the pre-flight agrees with the refusal).
 *
 * HOW A LIAR PASSES, and which arm catches each:
 *   (1) refuse at index.mjs for one caller class only — §1 drives a member
 *       session AND the MEMBER_TOKEN machine credential, on both arms.
 *   (2) refuse removed-source bundles too (read `source_status`) — §2 must land.
 *   (3) rewrite old legs — §3 compares the citing documents' bytes by sha256.
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { ACT_SHAPE_CHECKS, parseFrontmatter } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ADM = "adm-d168", MTOK = "mem-d168";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MTOK, VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
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
const E = encodeURIComponent;
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 900)}`); return r; };
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const ROW = ACT_SHAPE_CHECKS.RETIRED_NOT_CITABLE;

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-168" }));
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role,
    capabilities: ["contribute", "publish", "create_projects"] });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-168` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-168` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* The founder counts as the first administrator, so the second enrolment must be one too (ADMINS_FIRST). */
await enrol("ruth", "admin");
const IRIS = await enrol("iris", "member");

const infoMd = (id, { state = "collected", prior = null, history = [], sourceStatus = "unchanged" } = {}) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, `current_state: ${state}`, `prior_state: ${prior === null ? "null" : prior}`,
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []",
  ...(history.length
    ? ["state_history:", ...history.flatMap((h) => [`  - timestamp: "${LATER}"`,
        `    from_state: ${h.from}`, `    to_state: ${h.to}`,
        `    blurb: "moved for the D-168 fixture"`, "    author: iris"])]
    : ["state_history: []"]),
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", `source_status: ${sourceStatus}`,
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "", "## Question", "", "What?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const projectMd = (name) => ["---", "object_type: project", `title: "Project ${name}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promoteAs = async (tok, id, text, type, state, base = null) => POST(`op=promote&token=${tok}`, {
  ...(id != null ? { bundleId: id } : {}), base,
  snapKey: `d168-${String(++snapSeq).padStart(6, "0")}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information" && base === null
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland",
          current_state: state, created: NOW, last_updated: LATER } });
const listed = async (id) => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id) ?? null;
/* Walk an information bundle along its own machine's edges, never create it in a state nothing reached. */
const walk = async (id, to, sourceStatus = "unchanged") => {
  const h1 = [{ from: "collected", to: "verified" }];
  must(`${id} -> verified`, await promoteAs(IRIS, id,
    infoMd(id, { state: "verified", prior: "collected", history: h1, sourceStatus }),
    "information", "verified", (await listed(id)).bundle_sha));
  if (to === "retired")
    must(`${id} -> retired`, await promoteAs(IRIS, id,
      infoMd(id, { state: "retired", prior: "verified", history: [...h1, { from: "verified", to: "retired" }], sourceStatus }),
      "information", "retired", (await listed(id)).bundle_sha));
};

const RET = "INFO-2026-1680-retired", GONE = "INFO-2026-1680-removed";
const OLD = "INFO-2026-1680-older", LIVE = "INFO-2026-1680-live", HELD = "INFO-2026-1680-held";
for (const d of [RET, GONE, OLD, LIVE, HELD]) must(`promote ${d}`, await promoteAs(IRIS, d, infoMd(d), "information", "collected"));
await walk(RET, "retired");
await walk(GONE, "verified", "removed");

const Q = "INQ-2026-1680-q", Q_OLD = "INQ-2026-1680-older";
for (const q of [Q, Q_OLD]) must(`promote ${q}`, await promoteAs(IRIS, q, inquiryMd(q), "inquiry", "open"));
const mkProject = async (name) => {
  const text = projectMd(name);
  const r = must(`promote ${name}`, await POST(`op=promote&token=${ADM}`, { base: null,
    snapKey: `d168-${String(++snapSeq).padStart(6, "0")}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland",
            current_state: "forming", created: NOW, last_updated: LATER } }));
  must(`claim ${name}`, await DO("projectclaimowner", { projectId: r.bundleId, memberId: "iris" }));
  return r.bundleId;
};
const P = await mkProject("d168-case"), P_OLD = await mkProject("d168-older");

/* THE ACT, through the control plane and nothing else; each caller selects for itself. */
const cite = async (tok, target, ids, role = null) => {
  const s = await POST(`op=select&token=${tok}`, { ids });
  if (!s || !s.handle) throw new Error(`select: ${JSON.stringify(s)}`);
  return GET(`op=cite&token=${tok}&project=${E(target)}&handle=${s.handle}${role ? `&role=${role}` : ""}`);
};
const bytesOf = async (id) => (await GET(`op=image&token=${ADM}&id=${E(id)}`))["bundle.md"];

/* THE OLDER LEGS, cited while their targets were still live — by the member onto a question, by the machine onto
   a case.
   CORRECTED BY REC-181 (2026-09-23). This fixture used to cite OLD from BOTH documents and then walk OLD to
   `retired` by `op=promote` with both edges still confirmed. That walk was the defect REC-181 closed: §4.1 refuses
   the terminal transition while a live edge cites the item (`CITED`), and `promote` now asks it as `retire` does, so
   "a confirmed leg on a retired item" is no longer reachable through any write — it survives only in records retired
   before the rule. The fixture now reaches only states the record can hold: the question's confirmed leg rests on
   HELD, whose retirement is REFUSED (and leaves both documents untouched); the case's edge onto OLD is SEVERED — the
   remedy §4.1 names — before OLD retires, so the older edge that predates the retirement is a severed one. */
must("member cites HELD onto Q_OLD while live", await cite(IRIS, Q_OLD, [HELD], "supports"));
must("machine cites OLD onto P_OLD while live", await cite(MTOK, P_OLD, [OLD]));
await walk(HELD, "verified");
await walk(OLD, "verified");
const before = { q: sha(await bytesOf(Q_OLD)), p: sha(await bytesOf(P_OLD)) };
const H1 = [{ from: "collected", to: "verified" }];
const heldRetire = await promoteAs(IRIS, HELD,
  infoMd(HELD, { state: "retired", prior: "verified", history: [...H1, { from: "verified", to: "retired" }] }),
  "information", "retired", (await listed(HELD)).bundle_sha);
const afterHeld = { q: sha(await bytesOf(Q_OLD)), p: sha(await bytesOf(P_OLD)) };
const sOld = await POST(`op=select&token=${IRIS}`, { ids: [OLD] });
must("sever P_OLD's edge onto OLD", await GET(`op=sever&token=${IRIS}&project=${E(P_OLD)}&handle=${sOld.handle}`
  + `&reason=${E("superseded by a later capture")}`));
const severed = { p: sha(await bytesOf(P_OLD)) };
must(`${OLD} -> retired`, await promoteAs(IRIS, OLD,
  infoMd(OLD, { state: "retired", prior: "verified", history: [...H1, { from: "verified", to: "retired" }] }),
  "information", "retired", (await listed(OLD)).bundle_sha));
const afterRetire = { q: sha(await bytesOf(Q_OLD)), p: sha(await bytesOf(P_OLD)) };

t("FIXTURE: RET is genuinely RETIRED, walked there along collected -> verified -> retired",
  (await listed(RET))?.current_state, "retired");
t("FIXTURE: OLD is RETIRED, AFTER a case cited it and severed that edge; HELD, which a question's confirmed leg "
  + "rests on, could NOT be retired (CITED, REC-181) and is still verified",
  [(await listed(OLD))?.current_state, heldRetire?.reason, (await listed(HELD))?.current_state],
  ["retired", "CITED", "verified"]);
t("FIXTURE: GONE is verified with source_status: removed — the OTHER axis, not retired",
  [(await listed(GONE))?.current_state, parseFrontmatter(await bytesOf(GONE)).data?.source_status],
  ["verified", "removed"]);
t("FIXTURE: the catalog row exists and names its region", [ROW?.check, ROW?.where],
  ["C-33.39", "src/store.mjs cite > is-cite-retired"]);
console.log(`  corpus: 5 information (RET retired, OLD retired after its citing edge was severed, HELD held verified `
  + `by a live leg, GONE removed-source, LIVE), `
  + `2 questions, 2 cases, 2 callers (iris's session; the MEMBER_TOKEN machine credential)`);

/* ================================================= §1 REFUSED BY NAME, BOTH CALLERS, BOTH ARMS */
const refusedShape = (r) => [r?.ok, r?.code, r?.reason, r?.check, r?.translation === ROW.translation, r?.offenders];
const want = [false, "RETIRED_NOT_CITABLE", "RETIRED_NOT_CITABLE", "C-33.39", true, [RET]];
const qBefore = sha(await bytesOf(Q)), pBefore = sha(await bytesOf(P));
const mq = await cite(IRIS, Q, [RET], "supports");
t("§1 MEMBER onto a QUESTION: a cite of RETIRED information is refused BY NAME (RETIRED_NOT_CITABLE, C-33.39, "
  + "the catalog's translation, the retired member named)", refusedShape(mq), want);
t("§1 ... and the refusal NAMES THE DOOR: cite what superseded it, or re-collect the source",
  [/superseded/.test(mq?.detail ?? ""), /re-collect/.test(mq?.detail ?? ""), /superseded/.test(ROW.translation),
   /collect the source again/.test(ROW.translation)], [true, true, true, true]);
t("§1 MEMBER onto a CASE: refused by the same name", refusedShape(await cite(IRIS, P, [RET])), want);
t("§1 MACHINE CREDENTIAL onto a QUESTION: refused by the same name — the rule is the store's, not one caller class's",
  refusedShape(await cite(MTOK, Q, [RET], "supports")), want);
t("§1 MACHINE CREDENTIAL onto a CASE: refused by the same name", refusedShape(await cite(MTOK, P, [RET])), want);
const mixed = await cite(IRIS, Q, [LIVE, RET], "supports");
t("§1 A MIXED SELECTION is refused WHOLE, never narrowed to the live member", refusedShape(mixed), want);
t("§1 ... and nothing landed: both citing documents are byte-identical after five refusals",
  [sha(await bytesOf(Q)) === qBefore, sha(await bytesOf(P)) === pBefore], [true, true]);

/* ============================================================ §2 REMOVED SOURCE STAYS CITABLE */
const mg = await cite(IRIS, Q, [GONE], "supports");
t("§2 MEMBER onto a QUESTION: a `source_status: removed` bundle LANDS", [mg?.ok, mg?.reason ?? null], [true, null]);
t("§2 ... and the leg is in the question's own bytes",
  (parseFrontmatter(await bytesOf(Q)).data?.basis ?? []).some((l) => l?.target === GONE), true);
const xg = await cite(MTOK, P, [GONE]);
t("§2 MACHINE CREDENTIAL onto a CASE: a `source_status: removed` bundle LANDS", [xg?.ok, xg?.reason ?? null], [true, null]);
t("§2 ... and the edge is in the case's own bytes",
  (parseFrontmatter(await bytesOf(P)).data?.references ?? []).some((r) => r?.target === GONE && r?.rel === "cites"), true);

/* ======================================================= §3 THE OLDER LEGS ARE UNTOUCHED */
t("§3 RE-CITING the now-retired OLD is refused by name for the member (question) and the machine (case)",
  [refusedShape(await cite(IRIS, Q_OLD, [OLD], "supports"))[1], refusedShape(await cite(MTOK, P_OLD, [OLD]))[1]],
  ["RETIRED_NOT_CITABLE", "RETIRED_NOT_CITABLE"]);
const afterRefuse = { q: sha(await bytesOf(Q_OLD)), p: sha(await bytesOf(P_OLD)) };
t("§3 THE OLDER LEGS ARE BYTE-IDENTICAL: the question's leg (onto HELD) reads the same sha256 before HELD's refused "
  + "retirement, after it, after OLD's retirement and after the refused re-cites; the case (its edge onto OLD severed "
  + "before the retirement) reads the same after the retirement and after the refused re-cites",
  [afterHeld.q === before.q, afterRetire.q === before.q, afterRefuse.q === before.q,
   afterHeld.p === before.p, afterRetire.p === severed.p, afterRefuse.p === severed.p],
  [true, true, true, true, true, true]);
t("§3 ... and the leg is still there, confirmed on HELD; the case's edge onto OLD is still there, severed",
  [(parseFrontmatter(await bytesOf(Q_OLD)).data?.basis ?? []).some((l) => l?.target === HELD),
   (parseFrontmatter(await bytesOf(P_OLD)).data?.references ?? [])
     .some((r) => r?.target === OLD && r?.rel === "cites" && r?.status === "severed")], [true, true]);

/* ========================================================== §4 THE PRE-FLIGHT AGREES (DEC-8) */
const acts = async (id) => ((await GET(`op=affordances&token=${MTOK}&target=${E(id)}`))?.acts ?? []).map((a) => a.id);
t("§4 op=affordances does NOT offer `cite` on a RETIRED bundle, and DOES on a removed-source one",
  [(await acts(RET)).includes("cite"), (await acts(GONE)).includes("cite")], [false, true]);

/* =============================================== §5 THE SUGGEST DOOR ASKS THE SAME PREDICATE (D-553)
   BOB #34 (2026-09-24): the rule follows the STATE, the store asks it through ONE helper at all three doors,
   and viewer-gating never decides citability, only the refusal's WORDING. Driven through `op=suggest` as a
   MEMBER SESSION under a run the member opened. Two arms: a leg onto RET is refused and the refusal says
   RETIRED (the member can read RET); a leg onto a project the member was never invited to is STILL refused,
   worded as unreadable and never naming what the record holds. The cell "retired AND hidden" is not
   reachable today — the viewer filter hides only PROJECT bundles and no project machine has a `retired`
   state — so that it is asked apart from the viewer is pinned structurally in affordances.test.mjs §0. */
const HIDDEN = await (async () => {
  const text = projectMd("d553-hidden");
  const r = must("promote d553-hidden", await POST(`op=promote&token=${ADM}`, { base: null,
    snapKey: `d168-${String(++snapSeq).padStart(6, "0")}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: "Project d553-hidden",
            current_state: "forming", created: NOW, last_updated: LATER } }));
  must("claim d553-hidden", await DO("projectclaimowner", { projectId: r.bundleId, memberId: "ruth" }));
  return r.bundleId;
})();
const RUN5 = "RUN-2026-0925-d553";
must("airunopen d553", await POST(`op=airunopen&token=${IRIS}`, {
  run: RUN5, contextType: "inquiry", contextId: Q, label: "D-553 — the suggest door", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null,
  bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 }));
const suggestLeg = async (leg, name) => POST(`op=suggest&token=${IRIS}`, { target: Q, run: RUN5,
  kind: "basis-version", name, description: `A reading resting on ${leg}, for the D-553 arm.`,
  relationship: "and", grounds: [{ ground: "paper trail" }],
  legs: [{ target: leg, role: "supports", ground: "paper trail" }] });
const sRet = await suggestLeg(RET, "resting on retired material");
t("§5 SUGGEST onto a RETIRED item is refused, and the refusal says RETIRED — the same predicate `op=cite` asks",
  [sRet?.ok, sRet?.code, /RETIRED/.test(String(sRet?.detail))], [false, "SUGGEST_LEG_UNREACHABLE", true]);
const sHid = await suggestLeg(HIDDEN, "resting on a case this member cannot see");
t("§5 SUGGEST onto a target the VIEWER CANNOT SEE is still refused, worded as unreadable, naming nothing it holds",
  [sHid?.ok, sHid?.code, /readable from here/.test(String(sHid?.detail)), /RETIRED/.test(String(sHid?.detail))],
  [false, "SUGGEST_LEG_UNREACHABLE", true, false]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nd168-retired-cite: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

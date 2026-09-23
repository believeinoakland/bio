/* NEGATIVE CONTROL: RUN 2026-09-23 (D-168 worker, worktree agent-ab0b1ebe531cb428b), each arm ALONE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp (src/store.mjs 2,858,946 B sha256 f4288f242de1…, src/affordances.mjs 149,033 B sha256 4966546525a5…); baseline 19 pass / 0 fail.
   (A) DROP THE CHECK — in src/store.mjs cite(), `if (retiredMembers.length)` -> `if (false && retiredMembers.length)`. DECLARED: every §1 arm and §3's re-cite arm fail, §2 and §4 hold. RESULT 11/8, AS DECLARED: the MEMBER arm "§1 MEMBER onto a QUESTION: a cite of RETIRED information is refused BY NAME" fails first, then the member-onto-a-case, both MACHINE CREDENTIAL arms, the mixed selection, "nothing landed", and §3's re-cite. §3's BYTE-IDENTICAL arm stays GREEN under (A), and that is correct rather than blind: a re-cite of a target the document already cites is the act's idempotent `already` partition and writes nothing either way — what (A) would let land is a NEW citation, which §1's "nothing landed" catches.
   (B) OVER-STRICT — `=== "retired"` -> `!== "collected"` (refuses the verified removed-source bundle too, the liar that reads a second axis). DECLARED: the four §2 arms fail, §1 holds. RESULT 15/4, AS DECLARED.
   (C) THE PRE-FLIGHT — in src/affordances.mjs `cite`, `(ty === "information" && f.current_state !== "retired")` -> `(ty === "information")`. DECLARED: §4 fails alone. RESULT 18/1, AS DECLARED. */
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
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id ?? "new"}`,
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
const OLD = "INFO-2026-1680-older", LIVE = "INFO-2026-1680-live";
for (const d of [RET, GONE, OLD, LIVE]) must(`promote ${d}`, await promoteAs(IRIS, d, infoMd(d), "information", "collected"));
await walk(RET, "retired");
await walk(GONE, "verified", "removed");

const Q = "INQ-2026-1680-q", Q_OLD = "INQ-2026-1680-older";
for (const q of [Q, Q_OLD]) must(`promote ${q}`, await promoteAs(IRIS, q, inquiryMd(q), "inquiry", "open"));
const mkProject = async (name) => {
  const text = projectMd(name);
  const r = must(`promote ${name}`, await POST(`op=promote&token=${ADM}`, { base: null,
    snapKey: `d168-${String(++snapSeq).padStart(6, "0")}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: `Project ${name}`,
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

/* THE OLDER LEGS, cited while OLD was still live — by the member onto a question, by the machine onto a case. */
must("member cites OLD onto Q_OLD while live", await cite(IRIS, Q_OLD, [OLD], "supports"));
must("machine cites OLD onto P_OLD while live", await cite(MTOK, P_OLD, [OLD]));
const before = { q: sha(await bytesOf(Q_OLD)), p: sha(await bytesOf(P_OLD)) };
await walk(OLD, "retired");
const afterRetire = { q: sha(await bytesOf(Q_OLD)), p: sha(await bytesOf(P_OLD)) };

t("FIXTURE: RET is genuinely RETIRED, walked there along collected -> verified -> retired",
  (await listed(RET))?.current_state, "retired");
t("FIXTURE: OLD is RETIRED, AFTER a question and a case already rested on it",
  (await listed(OLD))?.current_state, "retired");
t("FIXTURE: GONE is verified with source_status: removed — the OTHER axis, not retired",
  [(await listed(GONE))?.current_state, parseFrontmatter(await bytesOf(GONE)).data?.source_status],
  ["verified", "removed"]);
t("FIXTURE: the catalog row exists and names its region", [ROW?.check, ROW?.where],
  ["C-33.39", "src/store.mjs cite > is-cite-retired"]);
console.log(`  corpus: 4 information (RET retired, OLD retired after being cited, GONE removed-source, LIVE), `
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
t("§3 THE OLDER LEGS ARE BYTE-IDENTICAL: the question and the case citing OLD read the same sha256 before the "
  + "retirement, after it, and after the refused re-cites",
  [afterRetire.q === before.q, afterRefuse.q === before.q, afterRetire.p === before.p, afterRefuse.p === before.p],
  [true, true, true, true]);
t("§3 ... and the leg and the edge are still there, confirmed",
  [(parseFrontmatter(await bytesOf(Q_OLD)).data?.basis ?? []).some((l) => l?.target === OLD),
   (parseFrontmatter(await bytesOf(P_OLD)).data?.references ?? [])
     .some((r) => r?.target === OLD && r?.rel === "cites" && r?.status === "confirmed")], [true, true]);

/* ========================================================== §4 THE PRE-FLIGHT AGREES (DEC-8) */
const acts = async (id) => ((await GET(`op=affordances&token=${MTOK}&target=${E(id)}`))?.acts ?? []).map((a) => a.id);
t("§4 op=affordances does NOT offer `cite` on a RETIRED bundle, and DOES on a removed-source one",
  [(await acts(RET)).includes("cite"), (await acts(GONE)).includes("cite")], [false, true]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nd168-retired-cite: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

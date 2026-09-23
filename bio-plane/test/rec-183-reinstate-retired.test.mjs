/* NEGATIVE CONTROL: RUN 2026-09-23 (REC-183 worker) by `node test/rec-183-reinstate-retired.control.mjs`, each arm ALONE, restored from a per-arm pristine copy and verified by sha256 AND byte compare (src/store.mjs 2,905,408 B sha256 742d62036f41…, src/affordances.mjs 149,606 B sha256 b2b89bd9db62…); baseline 14 pass / 0 fail.
   (skip) #edgeTransition's `if (retiredMembers.length)` -> `if (false && retiredMembers.length)`. DECLARED: §1 fails, §2's landings hold. RESULT 8/6, AS DECLARED — first failure "§1 MEMBER: reinstating a severed edge onto a RETIRED item is refused BY NAME". First run read NOT AS DECLARED: §2's "edge onto RET is STILL severed" was declared to hold and failed, correctly (the unchecked member reinstate landed it); the declaration was corrected, not the arm.
   (overstrict) -> `if (true || retiredMembers.length)`. DECLARED: §2's live and removed-source landings fail; §1 holds. RESULT 11/3, AS DECLARED.
   (preflight) src/affordances.mjs `reinstate` offered on a retired item again. DECLARED: §3 fails alone. RESULT 13/1, AS DECLARED. */
/* =========================================================================
 * REC-183 — `op=reinstate` IS THE THIRD DOOR ONTO A RETIRED ITEM.
 * State Rules & Consistency v1.5 §4.1, *"A RETIRED ITEM IS NOT CITABLE"*
 * (BOB #30, 2026-09-23), with D-168's RETIRED_NOT_CITABLE (C-33.39).
 *
 * THE DEFECT: `cite` refuses a new edge onto a retired item (D-168), and
 * `retire`/`promote` refuse to retire an item a live edge cites (CITED,
 * REC-181). So the edge is SEVERED — the remedy §4.1 names — the item is
 * RETIRED, and `op=reinstate` then moved the severed edge back to
 * `confirmed` without asking what its target had become: the case rested on
 * retired material again, by the one door nobody fenced.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO, all of it THROUGH THE OP (miniflare):
 *   §1 cite, sever, retire, reinstate is refused BY NAME — RETIRED_NOT_CITABLE,
 *      C-33.39, the catalog's translation, the retired member named — for a
 *      MEMBER'S SESSION and a MACHINE CREDENTIAL alike; the case's bytes do
 *      not move and the edge is still SEVERED. A mixed selection is refused
 *      WHOLE.
 *   §2 a LIVE target reinstates (the over-strictness direction), and so does a
 *      `source_status: removed` one — the other axis, never `retired`.
 *   §3 op=affordances does not offer `reinstate` on the retired item, and does
 *      on a live one whose edge is severed (DEC-8).
 *
 * HOW A LIAR PASSES, and which arm catches each:
 *   (1) no check at reinstate — §1 lands the edge and fails by name.
 *   (2) a check that reads `source_status` or refuses every reinstate — §2.
 *   (3) a check on one caller class only — §1 drives both.
 *
 * WHAT THIS CANNOT SEE: the PROJECT arm of the `reinstate` affordance is not
 * narrowed (a count cannot say every severed target is retired) and is not
 * asserted here; an inquiry cited by a case has no `retired` state and is not
 * driven.
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
const ADM = "adm-r183", MTOK = "mem-r183";
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
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-183" }));
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role,
    capabilities: ["contribute", "publish", "create_projects"] });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-183` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-183` });
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
        `    blurb: "moved for the REC-183 fixture"`, "    author: iris"])]
    : ["state_history: []"]),
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", `source_status: ${sourceStatus}`,
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = (name) => ["---", "object_type: project", `title: "Project ${name}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promoteAs = async (tok, id, text, type, state, base = null) => POST(`op=promote&token=${tok}`, {
  ...(id != null ? { bundleId: id } : {}), base,
  snapKey: `r183-${String(++snapSeq).padStart(6, "0")}`,
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

const mkProject = async (name) => {
  const text = projectMd(name);
  const r = must(`promote ${name}`, await POST(`op=promote&token=${ADM}`, { base: null,
    snapKey: `r183-${String(++snapSeq).padStart(6, "0")}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: `Project ${name}`,
            current_state: "forming", created: NOW, last_updated: LATER } }));
  must(`claim ${name}`, await DO("projectclaimowner", { projectId: r.bundleId, memberId: "iris" }));
  return r.bundleId;
};
const P = await mkProject("r183-case");

const cite = async (tok, target, ids) => {
  const s = await POST(`op=select&token=${tok}`, { ids });
  if (!s || !s.handle) throw new Error(`select: ${JSON.stringify(s)}`);
  return GET(`op=cite&token=${tok}&project=${E(target)}&handle=${s.handle}`);
};
const edgeOp = async (op, tok, ids, reason) => {
  const s = await POST(`op=select&token=${tok}`, { ids });
  if (!s || !s.handle) throw new Error(`select: ${JSON.stringify(s)}`);
  return GET(`op=${op}&token=${tok}&project=${E(P)}&handle=${s.handle}&reason=${E(reason)}`);
};
const bytesOf = async (id) => (await GET(`op=image&token=${ADM}&id=${E(id)}`))["bundle.md"];
const edgeStatus = async (id) => ((parseFrontmatter(await bytesOf(P)).data?.references ?? [])
  .find((r) => r?.target === id && r?.rel === "cites"))?.status ?? null;
const H1 = [{ from: "collected", to: "verified" }];
const toVerified = async (id, sourceStatus = "unchanged") => must(`${id} -> verified`, await promoteAs(IRIS, id,
  infoMd(id, { state: "verified", prior: "collected", history: H1, sourceStatus }),
  "information", "verified", (await listed(id)).bundle_sha));
const toRetired = async (id) => promoteAs(IRIS, id,
  infoMd(id, { state: "retired", prior: "verified", history: [...H1, { from: "verified", to: "retired" }] }),
  "information", "retired", (await listed(id)).bundle_sha);

/* cite, sever, retire — every step along a door the record allows, in the order §4.1 names. */
const RET = "INFO-2026-1830-retired", LIVE = "INFO-2026-1830-live", GONE = "INFO-2026-1830-removed";
for (const d of [RET, LIVE, GONE]) must(`promote ${d}`, await promoteAs(IRIS, d, infoMd(d), "information", "collected"));
await toVerified(RET); await toVerified(LIVE); await toVerified(GONE, "removed");
must("cite all three onto P", await cite(IRIS, P, [RET, LIVE, GONE]));
const whileCited = await toRetired(RET);
must("sever all three", await edgeOp("sever", IRIS, [RET, LIVE, GONE], "superseded by a later capture"));
must(`${RET} -> retired after its edge was severed`, await toRetired(RET));

t("FIXTURE: RET could NOT be retired while P cited it (CITED, REC-181), and was retired once the edge was severed",
  [whileCited?.reason, (await listed(RET))?.current_state], ["CITED", "retired"]);
t("FIXTURE: every edge on P is SEVERED before any reinstate",
  [await edgeStatus(RET), await edgeStatus(LIVE), await edgeStatus(GONE)], ["severed", "severed", "severed"]);
t("FIXTURE: GONE is verified with source_status: removed — the OTHER axis, not retired",
  [(await listed(GONE))?.current_state, parseFrontmatter(await bytesOf(GONE)).data?.source_status], ["verified", "removed"]);
t("FIXTURE: the catalog row exists", ROW?.check, "C-33.39");
console.log(`  corpus: 3 information (RET retired after its edge was severed, LIVE verified, GONE removed-source), `
  + `1 case, 2 callers (iris's session; the MEMBER_TOKEN machine credential)`);

/* ============================================ §1 REFUSED BY NAME, BOTH CALLERS, WHOLE CALL */
const refusedShape = (r) => [r?.ok, r?.code, r?.reason, r?.check, r?.translation === ROW.translation, r?.offenders];
const want = [false, "RETIRED_NOT_CITABLE", "RETIRED_NOT_CITABLE", "C-33.39", true, [RET]];
const pBefore = sha(await bytesOf(P));
const mr = await edgeOp("reinstate", IRIS, [RET], "the member wants it back");
t("§1 MEMBER: reinstating a severed edge onto a RETIRED item is refused BY NAME (RETIRED_NOT_CITABLE, C-33.39, "
  + "the catalog's translation, the retired member named)", refusedShape(mr), want);
t("§1 ... and the refusal NAMES THE DOOR: cite what superseded it, or re-collect the source",
  [/superseded/.test(mr?.detail ?? ""), /re-collect/.test(mr?.detail ?? "")], [true, true]);
t("§1 MACHINE CREDENTIAL: refused by the same name — the rule is the store's, not one caller class's",
  refusedShape(await edgeOp("reinstate", MTOK, [RET], "the machine wants it back")), want);
t("§1 A MIXED SELECTION (live + retired) is refused WHOLE, never narrowed to the live member",
  refusedShape(await edgeOp("reinstate", IRIS, [LIVE, RET], "both back")), want);
t("§1 ... and nothing landed: the case is byte-identical after three refusals and the edge onto RET is still SEVERED",
  [sha(await bytesOf(P)) === pBefore, await edgeStatus(RET), await edgeStatus(LIVE)], [true, "severed", "severed"]);

/* ================================================================ §3 THE PRE-FLIGHT (DEC-8) */
const acts = async (id) => ((await GET(`op=affordances&token=${MTOK}&target=${E(id)}`))?.acts ?? []).map((a) => a.id);
t("§3 op=affordances does NOT offer `reinstate` on the RETIRED item, and DOES on the live one whose edge is severed",
  [(await acts(RET)).includes("reinstate"), (await acts(LIVE)).includes("reinstate")], [false, true]);

/* ======================================================= §2 A LIVE TARGET STILL REINSTATES */
const lr = await edgeOp("reinstate", IRIS, [LIVE], "the later capture was wrong");
t("§2 a LIVE target reinstates", [lr?.ok, lr?.reason ?? null, lr?.reinstated], [true, null, [LIVE]]);
t("§2 ... and its edge is confirmed in the case's own bytes", await edgeStatus(LIVE), "confirmed");
const gr = await edgeOp("reinstate", MTOK, [GONE], "a withdrawn source is still evidence");
t("§2 a `source_status: removed` target reinstates, for the machine credential", [gr?.ok, gr?.reason ?? null], [true, null]);
t("§2 ... and the edge onto RET is STILL severed after both landings", await edgeStatus(RET), "severed");

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nrec-183-reinstate-retired: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

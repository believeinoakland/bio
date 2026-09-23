/* NEGATIVE CONTROL: RUN 2026-09-23 (REC-181 worker) by `node test/rec-181-promote-retire.control.mjs`, each arm ALONE, restored from a per-arm pristine copy and verified by sha256 AND byte compare (src/store.mjs 2,885,152 B sha256 46596c65df89…); baseline 12 pass / 0 fail.
   (skip) promote's transition check `if (citedBy.length)` -> `if (false && citedBy.length)`. DECLARED: §1, §2, §3 fail; §4 holds. RESULT 6/6, AS DECLARED — first failure "§1 op=promote moving a CASE-CITED verified item INTO retired is refused CITED, naming the item and its citer".
   (overstrict) -> `if (true || citedBy.length)`. DECLARED: §4's uncited and severed arms fail; §1–§3 and §4's edit arm hold. RESULT 10/2, AS DECLARED. */
/* =========================================================================
 * REC-181 — A TRANSITION INTO `retired` BY `op=promote` ASKS RETIRE'S QUESTION.
 * State Rules & Consistency v1.5 §4.1 (*a retired item is NOT citable; the
 * terminal transition refuses while live legs cite it*, BOB #30), with
 * `op=retire`'s `CITED` refusal as the one predicate.
 *
 * THE DEFECT: `op=retire` refused `CITED` while a live edge cited the item, but
 * `promote` — the one write path, which retire itself runs through — did not
 * ask, so a caller naming `current_state: retired` in a promote package reached
 * the terminal state with live legs still resting on it. D-168's own fixture
 * walked there exactly that way.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO, all of it THROUGH THE OP (miniflare):
 *   §1 a promote retiring a VERIFIED item cited by a CASE is refused `CITED`,
 *      naming the item and its citer, and the bundle is BYTE-IDENTICAL after
 *      (bytes, bundle_sha, state).
 *   §2 the same for an item a QUESTION's basis leg rests on.
 *   §3 the refusal is retire's own: `op=retire` over the same item answers the
 *      same code with the same offenders and the same detail.
 *   §4 an UNCITED verified item retires by promote; an edit of a cited item that
 *      does not move its state lands (the check is on the transition, not on
 *      being cited); a SEVERED edge does not block.
 *
 * HOW A LIAR PASSES, and which arm catches each:
 *   (1) check only in `op=retire` (the defect) — §1/§2 drive op=promote.
 *   (2) refuse every promote into retired — §4's uncited arm must land.
 *   (3) refuse every promote of a cited item — §4's edit arm must land.
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseFrontmatter } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ADM = "adm-r181", MTOK = "mem-r181";
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

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-181" }));
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role,
    capabilities: ["contribute", "publish", "create_projects"] });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-181` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-181` });
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
        `    blurb: "moved for the REC-181 fixture"`, "    author: iris"])]
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
  snapKey: `r181-${String(++snapSeq).padStart(6, "0")}`,
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
    snapKey: `r181-${String(++snapSeq).padStart(6, "0")}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: `Project ${name}`,
            current_state: "forming", created: NOW, last_updated: LATER } }));
  must(`claim ${name}`, await DO("projectclaimowner", { projectId: r.bundleId, memberId: "iris" }));
  return r.bundleId;
};
/* THE ACT, through the control plane and nothing else; each caller selects for itself. */
const cite = async (tok, target, ids, role = null) => {
  const s = await POST(`op=select&token=${tok}`, { ids });
  if (!s || !s.handle) throw new Error(`select: ${JSON.stringify(s)}`);
  return GET(`op=cite&token=${tok}&project=${E(target)}&handle=${s.handle}${role ? `&role=${role}` : ""}`);
};
const bytesOf = async (id) => (await GET(`op=image&token=${ADM}&id=${E(id)}`))["bundle.md"];

const CITED = "INFO-2026-1810-cited", LEGGED = "INFO-2026-1810-legged";
const FREE = "INFO-2026-1810-free", CUT = "INFO-2026-1810-severed";
for (const d of [CITED, LEGGED, FREE, CUT]) {
  must(`promote ${d}`, await promoteAs(IRIS, d, infoMd(d), "information", "collected"));
  await walk(d, "verified");
}
const Q = "INQ-2026-1810-q";
must(`promote ${Q}`, await promoteAs(IRIS, Q, inquiryMd(Q), "inquiry", "open"));
const P = await mkProject("r181-case");
must("case cites CITED", await cite(IRIS, P, [CITED]));
must("case cites CUT", await cite(IRIS, P, [CUT]));
must("question's leg rests on LEGGED", await cite(IRIS, Q, [LEGGED], "supports"));
const sCut = await POST(`op=select&token=${IRIS}`, { ids: [CUT] });
const sv = await GET(`op=sever&token=${IRIS}&project=${E(P)}&handle=${sCut.handle}&reason=${E("no longer relied on")}`);
t("FIXTURE: the case's edge onto CUT is SEVERED through op=sever", sv?.ok, true);

const H1 = [{ from: "collected", to: "verified" }], H2 = [...H1, { from: "verified", to: "retired" }];
const retireByPromote = async (id) => promoteAs(IRIS, id,
  infoMd(id, { state: "retired", prior: "verified", history: H2 }), "information", "retired", (await listed(id)).bundle_sha);
const snapOf = async (id) => { const l = await listed(id); return [sha(await bytesOf(id)), l?.bundle_sha, l?.current_state]; };

t("FIXTURE: all four items are VERIFIED, walked along collected -> verified",
  [CITED, LEGGED, FREE, CUT].map(() => "verified"),
  await Promise.all([CITED, LEGGED, FREE, CUT].map(async (d) => (await listed(d))?.current_state)));
console.log(`  corpus: 4 verified information (CITED by a case, LEGGED under a question's leg, FREE uncited, `
  + `CUT whose only edge is severed), 1 question, 1 case`);

/* ====================================== §1 A CASE CITES IT: promote into retired is refused CITED */
const b1 = await snapOf(CITED);
const r1 = await retireByPromote(CITED);
t("§1 op=promote moving a CASE-CITED verified item INTO retired is refused CITED, naming the item and its citer",
  [r1?.ok, r1?.reason, r1?.to, r1?.offenders], [false, "CITED", "retired", [{ id: CITED, citedBy: [P] }]]);
t("§1 ... and the bundle is BYTE-IDENTICAL after (bundle.md sha256, bundle_sha, state)", await snapOf(CITED), b1);
t("§1 ... still verified, and the case's edge onto it is still confirmed",
  [b1[2], (parseFrontmatter(await bytesOf(P)).data?.references ?? [])
    .some((r) => r?.target === CITED && r?.rel === "cites" && r?.status === "confirmed")], ["verified", true]);

/* ================================ §2 A QUESTION'S LEG RESTS ON IT: refused CITED by the same name */
const b2 = await snapOf(LEGGED);
const r2 = await retireByPromote(LEGGED);
t("§2 op=promote moving an item a QUESTION's leg rests on INTO retired is refused CITED, naming the question",
  [r2?.ok, r2?.reason, r2?.offenders], [false, "CITED", [{ id: LEGGED, citedBy: [Q] }]]);
t("§2 ... and the bundle is BYTE-IDENTICAL after", await snapOf(LEGGED), b2);

/* ============================================= §3 IT IS RETIRE'S OWN REFUSAL, NOT A SECOND ONE */
const s3 = await POST(`op=select&token=${IRIS}`, { ids: [CITED] });
const r3 = await GET(`op=retire&token=${IRIS}&handle=${s3.handle}&reason=${E("superseded by a later filing")}`);
t("§3 op=retire over the same item answers the SAME code, offenders and detail as the promote door",
  [r3?.reason, r3?.offenders, r3?.detail], [r1?.reason, r1?.offenders, r1?.detail]);
t("§3 ... and the bundle is still byte-identical after both doors refused", await snapOf(CITED), b1);

/* ========================== §4 WHAT MUST STILL LAND: uncited, an edit without a move, a severed edge */
const r4 = await retireByPromote(FREE);
t("§4 an UNCITED verified item RETIRES by op=promote", [r4?.ok, (await listed(FREE))?.current_state], [true, "retired"]);
const edit = infoMd(CITED, { state: "verified", prior: "collected", history: H1 })
  .replace("A captured document.", "A captured document, its summary corrected.");
const r5 = await promoteAs(IRIS, CITED, edit, "information", "verified", (await listed(CITED)).bundle_sha);
t("§4 an EDIT of a cited item that does not move its state LANDS (the check is on the transition)",
  [r5?.ok, (await listed(CITED))?.current_state], [true, "verified"]);
const r6 = await retireByPromote(CUT);
t("§4 an item whose only edge is SEVERED retires by op=promote (a severed edge is not a live citation)",
  [r6?.ok, (await listed(CUT))?.current_state], [true, "retired"]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nrec-181-promote-retire: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

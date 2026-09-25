/* NEGATIVE CONTROL: (run 2026-08-04, rec34-agent, FOUR arms, each broken ALONE in src/store.mjs and restored byte-identically; 48 pass when whole) (a) THE ITEM'S OWN — ANSWER FROM THE CACHED COLUMNS: in inquiryStrength replace `const s = this.strengthOf(id);` with `const c = this.#one("SELECT inquiry_capture_strength AS cg, inquiry_capture_state AS cs, inquiry_connection_strength AS ng, inquiry_connection_state AS ns FROM bundles WHERE bundle_id=?", id); const ax = (a, gr, st) => ({ axis: a, state: st, grade: gr, determined: st === "graded", weakest: null, load_bearing: 0, population: 0, not_load_bearing: [], depth_bound: Store.QUEUE_ANCESTOR_DEPTH, detail: "" }); const s = { ok: true, depth_bound: Store.QUEUE_ANCESTOR_DEPTH, capture: ax("capture", c.cg, c.cs), connection: ax("connection", c.ng, c.ns) };` -> 17 assertions fail. THE STALE READ IS NAMED: block 3's "the op moves the INSTANT the leg beneath is raised" wants B and GETS C, while its sibling "the CACHE is genuinely stale (the column still answers capture:C)" still PASSES — which is what proves the two are different sources rather than one. The source assertions name the swap itself ("the op's own code calls the derivation" -> false; "names NONE of the five cached columns" -> lists four), both byte-equality assertions fail, every named leg reads null, the depth sentence and undetermined_at vanish, and block 6 has nothing left to redact. (b) THE PROSE SWEEP — `const prose = (v) => v;` in #redactAxis -> 3 fail, dave receiving PROJ-2026-0001-secret inside `detail`/`why` SENTENCES while every id FIELD is still correctly null (REC-14's measured leak shape reproduced), and the failure "one level up, the inherited answer names no secret either" is the id that appears in NO field of the answer at all — carried up from two levels down inside an inherited leg's `why`. (c) THE SUBJECT ROW — `if (!this.#viewerSees(id, viewer))` -> `if (false)` -> 5 fail: dave is handed the secret project's NOT_AN_INQUIRY answer with `object_type: "project"` and its id spelled out in the detail, hidden-vs-absent stops being byte-identical, the forged-viewer probe flips, and the unstamped read answers instead of failing closed. (d) THE FIELD REDACTION — `static #MEMBER_ID_FIELDS = [];` -> 5 fail, the same secret id standing in `weakest.target_id` and in both not_load_bearing lists while the prose is clean: the two defences are independently breakable and each is loud, which is why they are separate. */
/* NEGATIVE CONTROL: section 8 (REC-105 / D-373) — RUN 2026-09-15 by the REC-105 worker, SIX arms, each armed ALONE in `src/store.mjs` and restored from its OWN uniquely-named pristine copy, every restore verified byte-identical by sha256 AND by `cmp` AND by size (2,149,389 bytes, sha256 80ddb449096ef564, floored at 100 kB). ONE COMMAND EACH: `node test/nc-rec105.mjs <none|a|b|c|d|e>` from `bio-plane/` — the driver holds the patch, the DECLARATION and the declared-vs-actual check, so the next session re-runs an arm in one step instead of re-deriving how to break the subject. BASELINE ARM `none` = 68 pass / 0 fail / exit 0, and it exists because a driver whose every arm reports one number cannot tell six-arms-broken from six-arms-working. (a) THE ITEM'S OWN — `#captureBoundsFor` returns null, so `strengthOf()` hands the walk no bound and every leg reports its stored letter as it did before this item (also IC-102's one-line reversal) -> 61 pass, 7 FAIL, AS DECLARED: the two reads disagree again and the failure NAMES BOTH ANSWERS, labelled — `want {"walk":"C","registry":"C"} got {"walk":"B","registry":"C"}` — because a failure naming one answer is one a reader cannot act on. (b) THE CEILING APPLIED AS A VALUE RATHER THAN AS A CAP (the `<=` short-circuit removed) -> 61 pass, 7 FAIL, AS DECLARED, and it bit HARDER than declared in the correct direction: raising a weaker authored letter to the ceiling moved this suite's OWN pre-existing fixtures in sections 1 and 3 as well as section 8's over-strictness arms. (c) THE UNDETERMINED ARM DROPPED (an unmeasured transcription falls through and keeps its authored letter) -> 66 pass, 2 FAIL, AS DECLARED, both in 8b. (d) THE RECURSION DROPS THE BOUND MAP -> 67 pass, 1 FAIL, AS DECLARED, and it is the ONLY arm 8e catches — without 8e this item would have had a hole that read as working. (e) OVER-STRICTNESS — the SAME rule written in the registry's own `BASIS_GRADES.indexOf` idiom instead of `#GRADE_RANK` -> 68 pass, 0 FAIL, exit 0: correct work in a spelling this item did not anticipate PASSES. THREE FINDINGS ABOUT THE ARMS THEMSELVES — recorded rather than smoothed, kept at each arm in the driver, and deliberately NOT written as an enumerated list, because `countArms` reads one and this declaration arms FIVE, so numbering them would put slack in a ratchet built to carry none (measured with the register itself: transitions 5, enumerations 8 before this wording). FINDING ONE: arm (a) was first declared to break “and the leg it is sent to check is the ACTUAL one” and did NOT: that assertion reads `inherited_from`/`through`, which name WHICH leg set the grade whatever LETTER is reached, so it is blind to this break BY CONSTRUCTION and belongs in the held-open half. FINDING TWO: arm (b) was first declared to break “a publisher-typed document's leg is byte-identical to the DO-internal derivation” and did NOT — and this is the useful one: that equality compares `op=inquirystrength` against the ungated `/strength` route and BOTH GO THROUGH `strengthOf()`, so a change to the arithmetic damages both sides equally and the equality survives. It is a real pin on the GATE and it is STRUCTURALLY BLIND to the derivation beneath it — the costs-nothing rule in miniature. The assertion that does see that break is “it carries NO new key”. FINDING THREE: arm (c)'s first spelling DID NOT ARM AS DECLARED: a bare `return null;` left the undetermined branch's object literal standing as an unconditional return, so every entry came back null — 51 pass / 17 fail, breaking THREE of its four declared held-open assertions, which is precisely the signal the held-open half exists to give. The arm was rewritten surgically and re-run. */
/* NEGATIVE CONTROL: section 9 (D-177) — RUN 2026-09-25 by the D-177 worker, FOUR arms in `src/store.mjs`, each armed ALONE and restored from its own per-arm pristine copy in `controlPen` (outside the worktree), every restore verified byte-identical by sha256 AND `cmp` AND size (3,476,819 bytes, sha256 081b90ed3eb25863, floored at 100 kB; RE-RUN after the gate-driven rewording, every figure unchanged). ONE COMMAND EACH: `node test/nc-d177.mjs <none|a|b|c|d>` from `bio-plane/`; the driver holds each patch, its declaration and the declared-vs-actual check. BASELINE `none` = 77 pass / 0 fail / exit 0. (a) THE ROW'S OWN, READ THE AUTHORED GRADE AGAIN: the measured floor in `#capturedAt` never applies -> 75 pass, 2 FAIL, AS DECLARED, the headline naming both letters — `want {"walk":"B","authored":"C"} got {"walk":"C","authored":"C"}` — and the reason sentence. (b) THE ROUTE IGNORED: any recorded source counts as a direct fetch, so an archive replay earns the direct letter nobody ruled -> 75 pass, 2 FAIL, AS DECLARED, both in 9d. (c) THE CEILING READ AS A MEASUREMENT: the floor is taken from the ceiling for every document, fetched or not -> 69 pass, 8 FAIL, AS DECLARED and harder than declared in the correct direction: sections 1 and 3's own weaker-letter fixtures, 8c's weaker-than-ceiling arm and 9a's BEFORE all move, because the record would be grading a route it never saw. Its FIRST spelling did not arm as declared — it left the reason sentence reading a key the entry lacked, so the suite died in section 1 at -1/-1 without reaching one declared assertion; the arm was rewritten so only the floor's source moves, and the finding is kept at the arm in the driver. (d) OVER-STRICTNESS: the same floor in the registry's own `BASIS_GRADES.indexOf` idiom -> 77 pass, 0 FAIL, exit 0: correct work in a spelling this item did not use PASSES. */
/* NEGATIVE CONTROL: section 9 (D-693) — RUN 2026-09-25 by the D-693 worker through `node test/nc-d177.mjs <arm>`, EIGHT arms plus the baseline, each armed ALONE in `src/store.mjs`, declared before running (must FAIL and must PASS, both checked), and restored from its own per-arm pristine copy in `controlPen`, every restore verified byte-identical by sha256 AND `cmp` AND size (3,481,062 bytes, sha256 ae82d6c62c2518c2…). baseline 84/0. (a) the floor disarmed -> 80/4, AS DECLARED — first declared with the archive headline held OPEN and it broke, because both routes are read through the ONE floor: a finding about the declaration, corrected at its site. (b) FLIPPED, not exempted — THE ROW'S OWN CONTROL: `ARCHIVE_VIA` renamed so archive.org is again a via no ruling names (CAPTURE_GRADE_VIA_UNRULED, as D-177 shipped it) -> 79/5, AS DECLARED, 9d failing BY NAME ("an archive-only document's capture grade is MEASURED", "A LEG ON AN ARCHIVE-ONLY CAPTURE READS THE MEASURED LETTER") while 9f's unruled-via pair and the direct headline held. (c) the ceiling read as the measurement -> 74/10, AS DECLARED after the same correction as (a). (d) OVER-STRICTNESS, the floor in the BASIS_GRADES.indexOf idiom -> 84/0. (e) the archive letter TYPED as its own literal -> 83/1, only the structural pin. (f) no cap from above -> 83/1, only 9e's ceiling-on-archive leg. (g) OVER-STRICTNESS, the letter derived by a slice -> 83/1, only the structural pin on the spelling; every behavioural assertion held. */
/* NEGATIVE CONTROL: section 9d (D-698) — RUN 2026-09-25 by the D-698 worker through `node test/nc-d177.mjs <arm>`, which now arms the FILE an arm names (D-698 moved ARCHIVE_CAPTURE_GRADE into checks/bio-checks.mjs, so D-693's arms (e) and (g) moved with it) and can check a SECOND suite in the same armed run. Each arm ALONE, restored from its own per-arm pristine copy in `controlPen`, verified by sha256 AND `cmp` AND size (bio-checks.mjs 1,007,326 bytes, sha256 39b3f9809967fd38; store.mjs 3,481,508 bytes, sha256 b944c347cbf749fb). baseline 84/0. (e) the archive letter TYPED "C" in the catalogue -> 83/1, only the structural pin, AS DECLARED. (g) OVER-STRICTNESS, the letter derived by a slice -> 83/1, only the structural pin on the spelling, AS DECLARED. (h) THE ROW'S OWN — the EXPORTED letter moved to "D" -> 81/3 with acquire.test.mjs 96/1 in the same run: 9d reads `earned:"D", stamped:"D"` against the ruled C, so the measurement and op=acquire's stamp moved TOGETHER and both suites fail BY NAME. First declared with two must-fail and a THIRD failed ("and the walk says it was fetched through an archive replay"): 9d's fixture authors its leg at D, so at a moved D the letters agree and the walk is correctly silent — a finding about the declaration, corrected at the arm. */
/* REC-34: `op=inquirystrength` — the GATED control-plane read of REC-12's
 * derived pair. UI-11's delegation (measured: no op served the pair for a
 * WORKING inquiry) and UI-12's hard blocker (its live preview re-queries as a
 * member selects legs, and no frozen or published shape can answer that).
 *
 * What is asserted, each in the direction that fails:
 *
 *   1. IT IS REACHABLE AT ALL, through the control plane, by a member. D-43:
 *      `op=invitelook` shipped with a ReferenceError while 1276 store-level
 *      assertions passed, so every assertion here drives the worker.
 *
 *   2. IT ANSWERS FROM `strengthOf()`, BYTE-EQUAL. The two axis objects are
 *      compared with JSON.stringify against the DO-internal derivation itself,
 *      key for key, for a viewer who may see everything — so a redaction that
 *      quietly rebuilt an object would fail here rather than pass silently.
 *
 *   3. THE CACHE IS NOT CONSULTED. Raise a leg BENEATH the inquiry and the op
 *      moves in the same instant while the cached column still answers the old
 *      grade to `op=search`. Both halves are asserted: an op that moved because
 *      the cache moved would pass half of this and fail the other.
 *
 *   4. THE SUBJECT ROW. An inquiry the viewer may not see is withheld WHOLE and
 *      byte-identically to one that never existed, and the same id answers the
 *      OWNER differently — which is what makes it a gate and not a refusal.
 *
 *   5. UNRATED AND UNDETERMINED ARE DISTINGUISHABLE (DEC-18/D-160), and the
 *      cached columns' inability to make that distinction — UI-11's measured
 *      finding — is asserted as the reason this op exists.
 *
 *   6. THE BACK-REFERENCE POSTURE (REC-30, op=reevaluations' shape): an
 *      invisible id inside a visible answer is REDACTED to null while the axis
 *      facts stand, IN THE PROSE AS WELL AS IN THE FIELDS, and the derivation
 *      is identical for both readers.
 *
 * TWO DOORS, ONE STORE. Everything runs against `src/index.mjs`'s real worker.
 * The probe module below adds ONE extra entry — `/probe/<do-path>` — forwarded
 * to the SAME Durable Object the control plane uses, for two things the plane
 * deliberately gives no caller: the ungated DO-internal `/strength` route (the
 * authority this op is compared against) and a raw `inquiry_basis` insert. The
 * raw insert exists because C-2.8 REFUSES a leg whose target is a project at
 * the write, while an APPEND-ONLY history can still hold one (#strengthWalk
 * keeps its no-referent arm for exactly that reason) — and a project bundle is
 * the only thing `viewerPredicate` filters today, so it is the only way to put
 * a genuinely invisible id inside a visible answer and prove the redaction
 * bites. Store code under test is Store's own; the subclass adds one route.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { ARCHIVE_CAPTURE_GRADE } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
/* D-698: the archive letter's ONE definition, and the catalogue it lives in, so 9d
   can resolve op=acquire's stamp to the value it names and pin where it is derived. */
const CHECKS_SRC = readFileSync(fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url)), "utf8");
const QUERY_SRC = readFileSync(SRC("query.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* The probe module: the REAL worker, the REAL Store, one extra door. */
const PROBE_SRC = `
import worker from "./index.mjs";
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/rawleg") {
      const p = url.searchParams;
      this.sql.exec(
        "INSERT OR REPLACE INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,grade,grade_axis,grade_source,note,at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        p.get("from"), Number(p.get("ord") || 0), p.get("to"), p.get("ttype") || "information",
        p.get("role") || "supports", p.get("grade"), p.get("axis"), p.get("source"), null, null);
      return Response.json({ result: { ok: true } });
    }
    return super.fetch(req);
  }
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname.startsWith("/probe/"))
      return env.STORE.get(env.STORE.idFromName("bio"))
        /* D-177: the request itself is the init, so a POST reaches the DO with
           its body — section 9 records a capture's locator through the SAME
           internal route op=acquire calls. A GET forwards exactly as before. */
        .fetch(new Request("http://do/" + u.pathname.slice(7) + u.search, req));
    return worker.fetch(req, env, ctx);
  },
};
`;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("inquirystrength-probe.mjs"), script: PROBE_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "t-admin-rec34", MEMBER_TOKEN: "mem-rec34", PROBE_TOKEN: "prb-rec34", VERSION: "test" },
});

const GET = async (q) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`);
  return { status: r.status, body: await r.json() };
};
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
/* The DO-INTERNAL derivation itself — the authority the op is measured against,
   reached by a door no caller has. */
const doGet = async (p) => (await (await mf.dispatchFetch(`http://x/probe/${p}`)).json()).result;
const doPost = async (p, body) => (await (await mf.dispatchFetch(`http://x/probe/${p}`,
  { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json()).result;

/* `weakest?.` throughout, ON PURPOSE and for one reason: this suite's own
   negative control replaces the derivation with the CACHED COLUMNS, which carry
   no named leg at all, and a suite that dies on a TypeError there reports LESS
   than one that names every assertion the swap broke. The optional chain changes
   nothing about a real answer — block 1 pins the weakest leg by name. */
const pair = async (tok, id) => (await GET(`op=inquirystrength&token=${tok}&id=${id}`));

/* ------------------------------------------------------------------ fixture */

const member = async (id, caps, role = "member") => {
  const add = await POST("op=memberadd&token=t-admin-rec34",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.result.token;
};

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      /* REC-18: a hunch announces itself with an author and a date (DEC-15). */
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : [])])]
  : [];

const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  /* CORRECTED 2026-09-23 by REC-179 (C-66.5): this template said `surfaced_by: agent`, but its questions are created by a member SESSION, which D-78 restamps `human` — so every later revision re-sending the template RELABELLED the question `agent`, the defect REC-179 closes (a revision now carries the value forward or is refused SURFACED_BY_REWRITTEN). The template now says what the record holds. */
  "visuals: []", "surfaced_by: human", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane
   (Membership v2 §7); a null id builds CREATION bytes with no `id:` line (refused
   PROJECT_ID_IN_BYTES otherwise), `label` standing in the title until the id is known. */
const projMd = (id, label = id) => ["---",
  ...(id === null ? [] : [`id: ${id}`]), "object_type: project", "schema: project@1",
  `title: "Secret ${label}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "visuals: []",
  "---", "", "## Summary", "", "A project nobody else is invited to.", ""].join("\n");

const promote = async (tok, id, text, type, base = null) => {
  const r = await POST(`op=promote&token=${tok}`, {
    /* CORRECTED 2026-09-18 (REC-141): a project CREATION sends no bundleId (refused
       PROJECT_ID_SUPPLIED); `id` is then only the label, and the answer carries the minted id. */
    ...(type === "project" && base === null ? {} : { bundleId: id }),
    base, snapKey: `${id}-${base ? sha(base).slice(0, 8) : "new"}`, author: "suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    /* REC-18, 2026-08-04: an INFORMATION bundle REGISTERS a capture, because a
       capture-axis grade is now EARNED from the capture record and a document
       with no registered bytes has nothing for the axis to measure. One sha per
       bundle — `register.capture_sha` is the table's primary key. */
    register: type === "information"
      ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
      : [],
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
            created: NOW, last_updated: LATER } });
  if (!r.result?.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  return r.result;
};

/* 4.2/4.3: the first two roster members must be administrators. carol owns the
   project (her session creates it); dave is the uninvited member. */
const ruth = await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const carol = await member("carol", ["contribute", "create_projects"]);
const dave = await member("dave", ["contribute"]);

/* CORRECTED 2026-09-18 (REC-141, IC-158): PROJ is the id the plane MINTS. The
   fixture's title (in the bytes and the meta) used to CONTAIN its id, so every
   "the answer names no PROJ" guard below also caught a leaked title; the minted
   id is unknown until the creation answers, so the project is revised once
   (base = the returned bundleSha) to carry `id: PROJ` and a title naming PROJ
   again — restoring the fixture's shape, so no guard is weakened. */
const PROJ = await (async () => {
  const made = await promote(carol, "PROJ-2026-0001-secret", projMd(null, "PROJ-2026-0001-secret"), "project");
  await promote(carol, made.bundleId, projMd(made.bundleId), "project", made.bundleSha);
  return made.bundleId;
})();
const MISSING = "INQ-2026-9999-none";        // never created: the no-disclosure yardstick

const CAP_B = "INFO-2026-0900-cap-b", CAP_C = "INFO-2026-0900-cap-c";
const CON_A = "INFO-2026-0900-con-a", CON_D = "INFO-2026-0900-con-d";
const UNGR1 = "INFO-2026-0900-ungraded-1", UNGR2 = "INFO-2026-0900-ungraded-2";
for (const d of [CAP_B, CAP_C, CON_A, CON_D, UNGR1, UNGR2])
  await promote(carol, d, infoMd(d), "information");

/* CORRECTED 2026-08-04 (REC-18), never exempted, and every GRADE below is
   unchanged — this suite is about the GATED READ of the pair, not about the
   ladder. `grade_source` stopped being a label a fixture could pick: `resolution`
   is now EARNED against the inquiry's subject entity and is a CONNECTION source
   only. So the default follows the AXIS — `capture` on the capture axis (earned
   from the capture each document now registers) and `hunch` on the connection
   axis, the honest name for an authored connection grade and the only authored
   source above D, carrying the author and date DEC-15 requires. */
const HUNCH = { author: "suite", date: "2026-08-04" };
const g = (target, grade, axis, source = axis === "capture" ? "capture" : "hunch") =>
  ({ target, role: "supports", grade, axis, source, ...(source === "hunch" ? HUNCH : {}) });
const bare = (target, role = "supports") => ({ target, role });

/* ------------------------------------------------------------------------- */

console.log("--- 1. the op is REACHABLE through the control plane and answers the PAIR (D-43) ---");
const MIX = "INQ-2026-0900-mixed";
{
  const legs = [g(CAP_B, "B", "capture"), g(CAP_C, "C", "capture"),
                g(CON_A, "A", "connection"), g(CON_D, "D", "connection")];
  await promote(carol, MIX, inquiryMd(MIX, { refs: legs.map((l) => l.target), legs }), "inquiry");

  const r = await pair(carol, MIX);
  t("a member reaches it through the worker and it answers ok", [r.status, r.body.result.ok], [200, true]);
  t("CAPTURE reads C, naming its own weakest leg",
    [r.body.result.capture.state, r.body.result.capture.grade, r.body.result.capture.weakest?.target_id ?? null],
    ["graded", "C", CAP_C]);
  t("CONNECTION reads D, naming ITS own — two measurements over two populations (DEC-21)",
    [r.body.result.connection.state, r.body.result.connection.grade, r.body.result.connection.weakest?.target_id ?? null],
    ["graded", "D", CON_D]);
  /* CORRECTED BY MK-2 (IC-142), never exempted: this read "TWO axis objects" and
     pinned the key set with two, which was the axis COUNT and not this line's
     rule. The rule is the second half — NO scalar a surface could render as
     "the strength" — and it is unchanged. The testimony axis is a third
     MEASUREMENT (MEMBER-KNOWLEDGE-DESIGN.md §3), not a summary of the two. */
  t("the answer carries ONE axis object PER AXIS and NO scalar for a surface to render as 'the strength'",
    Object.keys(r.body.result).sort(), ["capture", "connection", "depth_bound", "ok", "target", "testimony"]);
  t("and no composed letter hides in either axis object",
    [Object.keys(r.body.result.capture).includes("strength"),
     Object.keys(r.body.result.connection).includes("strength")], [false, false]);
  t("an id-less call is refused by name rather than answered about nothing",
    (await GET(`op=inquirystrength&token=${carol}`)).body.result.reason, "NO_ID");
  t("a DOCUMENT has no basis to derive a pair from and is refused, never answered UNRATED",
    (await pair(carol, CAP_B)).body.result.reason, "NOT_AN_INQUIRY");
}

console.log("\n--- 2. it answers FROM strengthOf(), BYTE-EQUAL — never a rebuilt shape ---");
{
  const op = (await pair(carol, MIX)).body.result;
  const authority = await doGet(`strength?id=${MIX}`);
  t("the CAPTURE axis object is byte-equal to the derivation's own",
    JSON.stringify(op.capture) === JSON.stringify(authority.capture), true);
  t("the CONNECTION axis object is byte-equal to the derivation's own",
    JSON.stringify(op.connection) === JSON.stringify(authority.connection), true);
  t("including the depth bound, INHERITED and not re-minted here",
    [op.depth_bound, authority.depth_bound], [6, 6]);
  /* A property of the CODE, not of one answer: the source assertions say the
     read cannot have consulted the cache, whatever any single fixture shows. */
  const REGION = STORE_SRC.slice(STORE_SRC.indexOf("REC-34 · the gated read of the pair"),
                                STORE_SRC.indexOf("REC-12: the projection CACHE, per axis"));
  t("the op's own code calls the derivation",
    /this\.strengthOf\(/.test(REGION), true);
  t("and names NONE of the five cached columns",
    ["inquiry_capture_strength", "inquiry_capture_state", "inquiry_connection_strength",
     "inquiry_connection_state", "inquiry_basis_count"].filter((c) => REGION.includes(c)), []);
  t("the prose sweep's id pattern is DERIVED from the catalog's BUNDLE_ID_RE, not a second spelling",
    /BUNDLE_ID_RE\.source/.test(REGION) && !/new RegExp\(["'`]\(INFO\|/.test(REGION), true);
}

console.log("\n--- 3. THE CACHE IS NOT CONSULTED: raise a leg beneath, the op moves, the column stands ---");
const LEAF = "INQ-2026-0901-leaf", PARENT = "INQ-2026-0901-parent";
{
  const L_CAP = "INFO-2026-0901-leaf-cap", L_CON = "INFO-2026-0901-leaf-con", P_CAP = "INFO-2026-0901-par-cap";
  for (const d of [L_CAP, L_CON, P_CAP]) await promote(carol, d, infoMd(d), "information");
  const leafLegs = [g(L_CAP, "C", "capture"), g(L_CON, "B", "connection")];
  const leaf0 = inquiryMd(LEAF, { refs: leafLegs.map((l) => l.target), legs: leafLegs });
  const leafSha = (await promote(carol, LEAF, leaf0, "inquiry")).bundleSha;
  const parentLegs = [g(P_CAP, "B", "capture"), g(LEAF, "A", "connection")];
  await promote(carol, PARENT, inquiryMd(PARENT, { refs: parentLegs.map((l) => l.target), legs: parentLegs }), "inquiry");

  t("the parent inherits the leaf's CAPTURE per axis and reads C through it",
    [(await pair(carol, PARENT)).body.result.capture.grade,
     (await pair(carol, PARENT)).body.result.capture.weakest?.inherited_from ?? null], ["C", LEAF]);
  const cached = async () => (await GET(`op=search&token=${carol}&q=${encodeURIComponent("capture:C")}`))
    .body.result.hits.some((h) => h.bundle_id === PARENT);
  t("the cached column answers a query: the parent is found at capture C", await cached(), true);

  /* Raising a leg ONE LEVEL DOWN does not re-promote the parent, so its stored
     column is stale from that instant. The op must not be reading it. */
  const leafLegs2 = [g(L_CAP, "B", "capture"), g(L_CON, "B", "connection")];
  await promote(carol, LEAF, inquiryMd(LEAF, { refs: leafLegs2.map((l) => l.target), legs: leafLegs2 }),
                "inquiry", leafSha);
  t("the op moves the INSTANT the leg beneath is raised: the parent now reads capture B",
    (await pair(carol, PARENT)).body.result.capture.grade, "B");
  t("and the CACHE is genuinely stale (the column still answers capture:C) — two sources, not one",
    await cached(), true);
  t("the op's answer and the derivation's still agree, byte for byte, after the move",
    JSON.stringify((await pair(carol, PARENT)).body.result.capture)
      === JSON.stringify((await doGet(`strength?id=${PARENT}`)).capture), true);
}

console.log("\n--- 4. THE SUBJECT ROW: an inquiry the viewer may not see is withheld WHOLE ---");
{
  const [hid, abs] = [await pair(dave, PROJ), await pair(dave, MISSING)];
  t("an uninvited member is told nothing about the hidden bundle", hid.body.result.reason, "NO_SUCH_BUNDLE");
  t("hidden and absent answer byte-identically, target aside",
    { ...hid, body: { ...hid.body, result: { ...hid.body.result, target: "X" } } },
    { ...abs, body: { ...abs.body, result: { ...abs.body.result, target: "X" } } });
  t("no field of the refusal counts or hints at what was withheld",
    Object.keys(hid.body.result).sort(), ["ok", "reason", "target"]);
  /* THE GATE, not a blanket refusal: the SAME id answers the owner differently. */
  t("the OWNER gets a different answer for the same id — which is what makes it a gate",
    (await pair(carol, PROJ)).body.result.reason, "NOT_AN_INQUIRY");
  t("an administrator sees it too (7.3)", (await pair(ruth, PROJ)).body.result.reason, "NOT_AN_INQUIRY");
  /* REC-29's carried lesson: the stamp is the SERVER's. A caller-supplied
     viewer must be overwritten, or every gate here is an impostor hole. */
  const forged = await GET(`op=inquirystrength&token=${dave}&id=${PROJ}&viewer=member:carol`);
  t("a caller-supplied `viewer` is overwritten, never honoured", forged.body.result.reason, "NO_SUCH_BUNDLE");
  t("the op is in the server's viewer-stamp list rather than trusting the caller",
    /op === "inquirystrength"/.test(INDEX_SRC), true);
  /* FAIL CLOSED: a missing stamp is an OUTAGE and never a leak. Only the probe
     door can produce one, because the control plane always stamps. */
  t("an UNSTAMPED read of a real inquiry is withheld, not widened",
    (await doGet(`inquirystrength?id=${MIX}`)).reason, "NO_SUCH_BUNDLE");
  t("and the ungated DO-internal derivation still answers there — the gate is on the OP, not the walk",
    (await doGet(`strength?id=${MIX}`)).capture.grade, "C");
}

console.log("\n--- 5. UNRATED and undetermined are DIFFERENT FACTS, and the op keeps them apart (DEC-18) ---");
{
  const UNR = "INQ-2026-0902-unrated";
  const ulegs = [bare(UNGR1), bare(UNGR2, "cuts_against")];
  await promote(carol, UNR, inquiryMd(UNR, { refs: ulegs.map((l) => l.target), legs: ulegs }), "inquiry");
  const u = (await pair(carol, UNR)).body.result;
  t("no leg graded on an axis reads UNRATED — no computed strength, not a low score",
    [u.capture.state, u.capture.grade, u.capture.determined], ["unrated", null, false]);
  t("every ungraded leg is NAMED, including the one that cuts against (invariant 7)",
    u.capture.not_load_bearing.map((m) => m.target_id).sort(), [UNGR1, UNGR2]);

  const D = (n) => `INQ-2026-0903-d${n}`;
  await promote(carol, D(8), inquiryMd(D(8), { refs: [CAP_B], legs: [g(CAP_B, "B", "capture")] }), "inquiry");
  for (let i = 7; i >= 0; i--)
    await promote(carol, D(i), inquiryMd(D(i), { refs: [D(i + 1)], legs: [g(D(i + 1), "A", "connection")] }), "inquiry");
  const deep = (await pair(carol, D(0))).body.result;
  t("a chain deeper than the bound reads `undetermined` and NAMES the depth (R3)",
    [deep.capture.state, deep.capture.grade, deep.capture.determined,
     deep.capture.depth_bound, /depth bound of 6/.test(deep.capture.detail)],
    ["undetermined", null, false, 6, true]);

  /* THE DISTINCTION, ASSERTED AS A DISTINCTION. grade and determined are
     IDENTICAL in both; `state` is the only thing that tells a surface "nothing
     is established here" from "we could not finish looking". */
  t("grade and determined CANNOT tell them apart — they are identical in both",
    [u.capture.grade, u.capture.determined], [deep.capture.grade, deep.capture.determined]);
  t("`state` can, and does", [u.capture.state, deep.capture.state], ["unrated", "undetermined"]);
  t("only the undetermined one says WHERE it stopped",
    [Array.isArray(deep.capture.undetermined_at) && deep.capture.undetermined_at.length > 0,
     "undetermined_at" in u.capture], [true, false]);

  /* UI-11's measured finding, pinned: this is WHY the op exists rather than a
     column on an existing read. If either of these ever becomes false, the
     reason for this op has changed and somebody should say so out loud. */
  const proj = (await GET(`op=projection&token=${carol}&id=${UNR}`)).body.result;
  t("op=projection carries NEITHER cached state column, so it cannot make the distinction",
    ["inquiry_capture_state", "inquiry_connection_state"].filter((c) => c in proj), []);
  t("and query.mjs exposes no state selector either — a facet route could not answer it",
    /inquiry_capture_state/.test(QUERY_SRC), false);
}

console.log("\n--- 6. THE BACK-REFERENCE POSTURE: an invisible id redacted, the axis facts standing ---");
{
  /* A leg whose target is the SECRET PROJECT. C-2.8 refuses this at the write
     (a leg rests on information or on another inquiry); an append-only history
     can hold one, which is why #strengthWalk keeps handling it, and it is the
     only shape that puts a genuinely invisible id inside a visible answer under
     today's predicate — the evidence corpus is shared BY DESIGN (7.9). */
  const HID = "INQ-2026-0905-hidden-leg";
  const legs = [g(CAP_B, "B", "capture"), g(CON_A, "A", "connection")];
  await promote(carol, HID, inquiryMd(HID, { refs: legs.map((l) => l.target), legs }), "inquiry");
  const raw = await (await mf.dispatchFetch(
    `http://x/probe/rawleg?from=${HID}&to=${PROJ}&ord=7&ttype=project&grade=D&axis=connection&source=testimony`)).json();
  t("the raw leg is planted (the write path would have refused it)", raw.result.ok, true);

  const mine = (await pair(carol, HID)).body.result;
  const theirs = (await pair(dave, HID)).body.result;
  t("the owner sees the leg named: it is the weakest connection and it is the project",
    [mine.connection.grade, mine.connection.weakest?.target_id ?? null], ["D", PROJ]);
  t("the uninvited member gets the SAME derivation — grade, state, counts, role, all of it",
    [theirs.connection.grade, theirs.connection.state, theirs.connection.determined,
     theirs.connection.load_bearing, theirs.connection.population,
     theirs.connection.weakest?.ord ?? null, theirs.connection.weakest?.role ?? null, theirs.connection.weakest?.grade_source ?? null],
    [mine.connection.grade, mine.connection.state, mine.connection.determined,
     mine.connection.load_bearing, mine.connection.population,
     mine.connection.weakest?.ord ?? null, mine.connection.weakest?.role ?? null, mine.connection.weakest?.grade_source ?? null]);
  t("and the id ALONE is withheld, redacted to null", theirs.connection.weakest ? theirs.connection.weakest.target_id : "NO WEAKEST NAMED", null);
  t("the withholding is STATED, without a count",
    [theirs.connection.out_of_view, "withheld" in theirs.connection], [true, false]);
  t("the owner's answer carries no such flag — it names everything it derived over",
    "out_of_view" in mine.connection, false);
  /* THE PROSE, which is REC-14's measured leak shape and is worse here. */
  t("the secret id appears NOWHERE in the uninvited member's whole answer, prose included",
    JSON.stringify(theirs).includes(PROJ), false);
  t("but the sentence still says what it derived, and says an object was withheld",
    [/connection D/.test(theirs.connection.detail), /may not see/.test(theirs.connection.detail)],
    [true, true]);
  /* CORRECTED WHILE WRITING, and the correction is the interesting part: this
     assertion first asked for the CAPTURE axis to be byte-equal to the owner's,
     and that is wrong about the derivation rather than about the gate. A leg's
     AXIS is the leg's own recorded fact (R2-b), so a connection-graded leg sits
     in BOTH populations and is named as not load-bearing on capture — where its
     id is a back-reference exactly as it is on connection. So the right
     assertion is the one the posture actually promises: every derived fact
     identical for both readers, the id alone withheld, on both axes. */
  t("the CAPTURE axis derives identically too — only the id in its inert-leg list is withheld",
    [theirs.capture.state, theirs.capture.grade, theirs.capture.weakest?.target_id ?? null,
     theirs.capture.load_bearing, theirs.capture.population,
     theirs.capture.not_load_bearing.map((m) => m.target_id)],
    [mine.capture.state, mine.capture.grade, mine.capture.weakest?.target_id ?? null,
     mine.capture.load_bearing, mine.capture.population,
     mine.capture.not_load_bearing.map((m) => (m.target_id === PROJ ? null : m.target_id))]);
  t("and the project leg IS named on capture, inert with its reason standing",
    theirs.capture.not_load_bearing.filter((m) => m.target_id === null && /connection axis/.test(m.why)).length, 1);
  /* An id from SEVERAL LEVELS DOWN, carried only in prose: the inherited-
     undetermined `why` embeds the sub-walk's whole detail. Nothing structured
     in the answer holds it, so the field-only redaction would miss it. */
  const OUTER = "INQ-2026-0905-outer";
  await promote(carol, OUTER, inquiryMd(OUTER, { refs: [HID], legs: [g(HID, "A", "connection")] }), "inquiry");
  const outer = (await pair(dave, OUTER)).body.result;
  t("one level up, the inherited answer names no secret either",
    JSON.stringify(outer).includes(PROJ), false);
  t("and the inheritance still reads: the parent takes the leg's own D through the hidden one",
    outer.connection.grade, "D");
}

console.log("\n--- 7. the cost shape, for UI-12's live preview (measured, not asserted) ---");
{
  const time = async (id) => {
    const n = 20, t0 = Date.now();
    for (let i = 0; i < n; i++) await pair(carol, id);
    return (Date.now() - t0) / n;
  };
  const each = await time(PARENT), deep = await time("INQ-2026-0903-d0");
  console.log(`  NOTE  cost shape, miniflare on this machine, 20 calls each: a 2-level basis `
    + `~${each.toFixed(1)}ms per call; the depth-exhausted 8-deep chain ~${deep.toFixed(1)}ms. `
    + `The walk is BOUNDED (depth 6) and reads no cache, but it carries NO memo and NO visited set `
    + `by design (REC-12: the bound is what makes it terminate, and a memo would mask the control), `
    + `so a basis whose legs converge on one sub-inquiry re-walks it once per path. UI-12's live `
    + `preview re-queries per selection and pays this each time.`);
  t("the read is genuinely non-mutating: the op table says so and the cached column never moves",
    /inquirystrength: \{ classes: \["admin", "member", "probe"\],      mutating: false \}/.test(INDEX_SRC), true);
}

console.log("\n--- 8. REC-105 / D-373: the capture axis is resolved through `earnedBasisRegistry` ---");
{
  /* WHAT THIS SECTION IS FOR, and it is worth saying because the shape reads as
     a regression at first glance and is not one. Before REC-88 this walk and
     `earnedBasisRegistry` AGREED about a leg's capture letter — and BOTH WERE
     WRONG, publishing a letter stronger than the transcription fidelity can
     support, which is DEC-4 (framework Part II Appendix A.1: *fidelity bounds
     the capture axis as its weakest link, no third scale*). REC-88 corrected
     the registry and IC-96 carried the drift it left as D-373. THIS SECTION
     DRIVES THE SECOND READ BEING CORRECTED. Nothing is reverted and no letter
     is ever raised.

     THE EQUALITY IS DRIVEN, NEVER ASSERTED — which is the trap this item's row
     names by name. Showing the two reads agreeing on a document where they
     would have agreed anyway costs nothing to produce and is not evidence. So
     every arm below is a BEFORE and an AFTER over the SAME leg and the SAME
     store: the leg is written while its document is publisher-typed, the two
     reads agree at the ceiling, THE DOCUMENT IS THEN RE-READ, and the two reads
     are asked again. The leg's own bytes never move — the record is append-only
     and nothing rewrites a member's authored letter — so any change in the
     answer is the RECORD's reading of it changing, which is the whole claim. */
  /* THE RE-READ IS AN EDITION, NOT A SECOND CREATION, so each promotion names
     the bundle sha it builds on — a second `base: null` against a live bundle is
     refused EXISTS, which is the record refusing to lose its own history. */
  const HEAD = new Map();
  const provPromote = async (tok, id, text, chain) => {
    const prov = JSON.stringify({ documents: [{
      capture: { sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 },
      reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
                 entities: [], facts: {}, ...(chain === undefined ? {} : { text_source: chain }) } }] });
    const r = await POST(`op=promote&token=${tok}`, {
      bundleId: id, base: HEAD.get(id) ?? null, snapKey: `${id}-${sha(String(chain)).slice(0, 8)}`, author: "suite",
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
              { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
      register: [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }],
      meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${id}`,
              current_state: "collected", created: NOW, last_updated: LATER } });
    if (!r.result?.ok) throw new Error(`provPromote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
    HEAD.set(id, r.result.bundleSha);
    return r.result;
  };
  const earnedCap = async (tok, inq, doc) => {
    const r = (await GET(`op=earnedbasis&token=${tok}&id=${inq}`)).body.result;
    return (r && r.earned && r.earned.capture ? r.earned.capture[doc] : null) ?? null;
  };
  const OCR_C = [{ step: "pixels" },
    { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }];
  const UNMEASURED = [{ step: "pixels" },
    { step: "ocr", engine: "tesseract", version: "5.3.4", confidence: { basis: "none" } }];

  /* ---- 8a. THE HEADLINE: the walk CHANGES ITS ANSWER where the registry bounds it. */
  const D_OCR = "INFO-2026-0910-later-ocrd";
  const I_OCR = "INQ-2026-0910-later-ocrd";
  await provPromote(carol, D_OCR, infoMd(D_OCR), undefined);        /* read, NO chain */
  const legOcr = [g(D_OCR, "B", "capture")];
  await promote(carol, I_OCR, inquiryMd(I_OCR, { refs: [D_OCR], legs: legOcr }), "inquiry");

  const beforeWalk = (await pair(carol, I_OCR)).body.result.capture;
  const beforeReg = await earnedCap(carol, I_OCR, D_OCR);
  t("BEFORE the re-read the two reads already agree, and the letter is the ceiling",
    [beforeReg.grade, beforeWalk.state, beforeWalk.grade], ["B", "graded", "B"]);

  /* THE ONLY ACT BETWEEN THE TWO MEASUREMENTS. The document's text is now
     derived by a machine whose fidelity is MEASURED. The leg is not touched. */
  await provPromote(carol, D_OCR, infoMd(D_OCR), OCR_C);

  const afterWalk = (await pair(carol, I_OCR)).body.result.capture;
  const afterReg = await earnedCap(carol, I_OCR, D_OCR);
  t("the registry bound MOVED and says so by name",
    [afterReg.grade, afterReg.bounded_by], ["C", "CAPTURE_BOUNDED_BY_FIDELITY"]);
  /* THE ARM THE ROW ASKED FOR: the walk CHANGED its answer. An assertion that
     only showed the two reads equal would have passed on the pristine tree for
     the publisher-typed document below and proved nothing. */
  t("AND THE WALK CHANGED ITS ANSWER — this is the item, and it is a CHANGE rather than an equality",
    [beforeWalk.grade, afterWalk.grade], ["B", "C"]);
  /* BOTH FIGURES, LABELLED, IN THE ASSERTION ITSELF — because the negative
     control for this item removes the consultation and this is the assertion
     that has to fail LOUDLY when it does. A failure naming one answer tells a
     reader that something is wrong; a failure naming BOTH tells them WHAT is
     wrong and which surface to go to, which is the difference between a report
     they can act on and one they have to re-derive. */
  t("the two reads agree AFTER the bound moved, which is D-373 closed",
    { walk: afterWalk.grade, registry: afterReg.grade },
    { walk: afterReg.grade, registry: afterReg.grade });
  t("the leg's own AUTHORED letter is untouched — the record is append-only and nothing rewrote it",
    (await doGet(`basis?id=${I_OCR}`)).legs.map((l) => l.grade), ["B"]);
  t("the axis still names the leg that sets it, at the bounded letter",
    [afterWalk.state, afterWalk.weakest?.target_id ?? null, afterWalk.weakest?.grade ?? null],
    ["graded", D_OCR, "C"]);
  t("and the member is told WHAT bound it, in the registry's own words rather than a second spelling",
    [/no more than/.test(afterWalk.weakest?.why ?? ""),
     /derived by a machine/.test(afterWalk.weakest?.why ?? "")], [true, true]);

  /* ---- 8b. AN UNMEASURED TRANSCRIPTION IS UNDETERMINED, STATED, AND INERT. */
  const D_UNM = "INFO-2026-0911-unmeasured";
  const I_UNM = "INQ-2026-0911-unmeasured";
  await provPromote(carol, D_UNM, infoMd(D_UNM), undefined);
  await promote(carol, I_UNM, inquiryMd(I_UNM, { refs: [D_UNM], legs: [g(D_UNM, "B", "capture")] }), "inquiry");
  const unmBefore = (await pair(carol, I_UNM)).body.result.capture;
  await provPromote(carol, D_UNM, infoMd(D_UNM), UNMEASURED);
  const unmAfter = (await pair(carol, I_UNM)).body.result.capture;
  const unmReg = await earnedCap(carol, I_UNM, D_UNM);
  t("the registry says UNDETERMINED with the empty level named",
    [unmReg.grade, unmReg.determined, unmReg.undetermined_because],
    [null, false, "CAPTURE_FIDELITY_UNMEASURED"]);
  /* DEC-18 AND IC-96's OWN ARM, REUSED RATHER THAN RE-DECIDED. A leg the record
     can support no letter for is INERT — present, NAMED, not load-bearing — and
     it is not dropped and not invented. `#versionLegsAsMembers` has answered
     this case exactly this way since REC-88, and two reads of one fact that
     answer it differently is the defect this item exists to close. */
  t("the walk moved from a graded axis to an UNRATED one and the leg is NAMED as not load-bearing",
    [unmBefore.state, unmBefore.grade, unmAfter.state, unmAfter.grade,
     unmAfter.not_load_bearing.map((m) => m.target_id)],
    ["graded", "B", "unrated", null, [D_UNM]]);
  t("and the empty level travels with it, so a member is told what to go and get",
    [/UNMEASURED/.test(unmAfter.not_load_bearing[0]?.why ?? ""),
     /measured fidelity/.test(unmAfter.not_load_bearing[0]?.why ?? "")], [true, true]);

  /* ---- 8c. OVER-STRICTNESS: correct work in a shape this item did not set out
     to change must answer EXACTLY as it did. On the live instance that is EVERY
     leg there is — `test/rec88-instance-census.mjs` found 0 captures carrying a
     transcription chain anywhere in store `bio` — so a change here would be a
     change nobody asked for, reaching every member for no gain. */
  const D_PUB = "INFO-2026-0912-publishertyped";
  const I_PUB = "INQ-2026-0912-publishertyped";
  await provPromote(carol, D_PUB, infoMd(D_PUB), undefined);
  await promote(carol, I_PUB, inquiryMd(I_PUB, { refs: [D_PUB], legs: [g(D_PUB, "B", "capture")] }), "inquiry");
  const pubWalk = (await pair(carol, I_PUB)).body.result.capture;
  t("a publisher-typed document's leg is byte-identical to the DO-internal derivation, key for key",
    JSON.stringify(pubWalk), JSON.stringify((await doGet(`strength?id=${I_PUB}`)).capture));
  /* CORRECTED BY D-709 (BOB #35, 2026-09-25 10:05Z), never exempted: this read
     "no reason, nothing that says the record looked", with a null `why`, and that
     pin encoded a SILENCE. The document has no recorded fetch route, so the leg's
     letter is the author's, under the ceiling, and the read now SAYS so. The
     letter and the absent bound are unchanged. */
  t("and it carries no BOUND, and states its letter is the author's under the ceiling (no route recorded)",
    [pubWalk.grade, "bounded_by" in pubWalk, /the B its author gave, under the ceiling of /.test(pubWalk.weakest?.why ?? "")],
    ["B", false, true]);
  /* A LEG THAT CLAIMS NOTHING ON A DOCUMENT THE BOUND WOULD HAVE MOVED. The gate
     does not pressure anyone into inventing an attribution (CLAUDE.md), so an
     ungraded leg is legal, is inert by DEC-18, and this item must leave it
     exactly where DEC-18 put it rather than promoting it to the ceiling. */
  const I_BARE = "INQ-2026-0913-ungraded-on-ocrd";
  await promote(carol, I_BARE, inquiryMd(I_BARE, { refs: [D_OCR], legs: [bare(D_OCR)] }), "inquiry");
  const bareWalk = (await pair(carol, I_BARE)).body.result.capture;
  t("an UNGRADED leg on the very document whose bound moved is inert and says the old reason",
    [bareWalk.state, bareWalk.grade, bareWalk.not_load_bearing.map((m) => m.why)],
    ["unrated", null, ["the leg carries no grade"]]);
  /* THE DIRECTION THAT MATTERS MOST, and it is the one a careless cap gets
     wrong: the earned entry is a CEILING, not a value. A member who states a
     WEAKER letter is giving their own account of a poorer route and the record
     must not overwrite it with the maximum — that would be the plane asserting
     a ceiling as a measurement, which is the overclaiming direction. */
  const I_WEAK = "INQ-2026-0914-weaker-than-ceiling";
  await promote(carol, I_WEAK, inquiryMd(I_WEAK, { refs: [D_PUB], legs: [g(D_PUB, "C", "capture")] }), "inquiry");
  const weakWalk = (await pair(carol, I_WEAK)).body.result.capture;
  /* CORRECTED BY D-709 (BOB #35, 2026-09-25 10:05Z), never exempted: the null
     `why` pinned here encoded a SILENCE about an unrecorded route. The letter
     still stands unraised; the read now says it is the author's. */
  t("a leg stating a WEAKER letter than the ceiling keeps its own, and is not raised to the maximum",
    [weakWalk.state, weakWalk.grade, /the C its author gave, under the ceiling of /.test(weakWalk.weakest?.why ?? "")],
    ["graded", "C", true]);

  /* ---- 8e. THE RECURSION CARRIES THE BOUND, and this arm exists because
     without it the item would have a hole that reads as working. A leg to
     another inquiry contributes THAT inquiry's derived pair per axis. If the
     bound map stopped at the top level, an inquiry resting on I_OCR would
     inherit the UNCORRECTED letter while I_OCR itself answered the corrected
     one — the same drift D-373 names, one hop down, inside a single answer. */
  const I_PARENT = "INQ-2026-0915-rests-on-the-bounded-one";
  await promote(carol, I_PARENT,
    inquiryMd(I_PARENT, { refs: [I_OCR], legs: [bare(I_OCR)] }), "inquiry");
  const parentWalk = (await pair(carol, I_PARENT)).body.result.capture;
  t("an inquiry resting on the bounded one INHERITS the bounded letter, not the authored one",
    [parentWalk.state, parentWalk.grade], ["graded", "C"]);
  t("and the leg it is sent to check is the ACTUAL one, two levels down",
    [parentWalk.weakest?.inherited_from ?? null, parentWalk.weakest?.through ?? null],
    [I_OCR, D_OCR]);

  /* ---- 8d. THE VERSION PATH IS UNTOUCHED, AND STRUCTURALLY RATHER THAN BY
     PROMISE. REC-88 named the boundary and QUEUE REC-105 repeats it: the version
     path is REC-12/REC-42's region. `#versionLegsAsMembers` has resolved a
     version's legs through this same registry since REC-88 and hands them to the
     walk as a `legsOverride`; the resolution this item adds rides a SEPARATE
     parameter that `#versionStrength` does not pass, so the version path cannot
     REACH the new code. These two pins are what make that a property of the
     source rather than a sentence — a call added inside the walk, or a bounds
     map handed to the version path, fails here by name. */
  t("`strengthOf` is the ONLY caller that builds the bound map",
    (STORE_SRC.match(/#captureBoundsFor\(/g) ?? []).length, 2);   /* the definition and the one call */
  t("and the walk itself asks the registry NOWHERE — one call for the whole walk, never one per leg",
    /#strengthWalk\(bundleId, depth, bound, legsOverride = null, captureBounds = null\) \{[\s\S]*?\n  \}/
      .exec(STORE_SRC)?.[0].includes("earnedBasisRegistry("), false);
  t("the version path's own walk call passes NO bound map, so it reads exactly as it did",
    /#strengthWalk\(inq, 0, bound, resolved\.legs\)/.test(STORE_SRC), true);
  t("and so does op=suggest's candidate pair",
    /#strengthWalk\(target, 0, Store\.QUEUE_ANCESTOR_DEPTH, walkLegs\)/.test(STORE_SRC), true);
}

console.log("\n--- 9. D-177: a DIRECT capture's grade is MEASURED from its fetch path, not authored ---");
{
  /* THE ROW'S ACCEPTS-WHEN, DRIVEN AS A BEFORE AND AN AFTER over the SAME leg:
     a member-authored letter WEAKER than the ceiling on a document this
     instance fetched itself. Before the record holds the fetch it reads the
     member's letter (8c's rule, which still holds for an unrecorded route);
     after `captured_locators` records a DIRECT fetch of that capture it reads
     the earned letter. The only act between the two is the locator row, and it
     is written through the SAME internal route op=acquire calls
     (recordcapturedlocator), because this suite cannot make a network fetch.
     THE LETTERS ARE READ FROM THE REGISTRY, never typed as the ceiling: the
     measured letter is whatever the record says a direct capture earns. */
  const HEAD9 = new Map();
  /* Section 8's measured chain, restated: that block's consts are scoped to it. */
  const OCR_C = [{ step: "pixels" },
    { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }];
  const cap9 = (id) => sha(`capture-of-d177-${id}`);
  const promote9 = async (id, chain) => {
    const prov = JSON.stringify({ documents: [{
      capture: { sha256: cap9(id), encoding: "binary", bytes: 10 },
      reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
                 entities: [], facts: {}, ...(chain === undefined ? {} : { text_source: chain }) } }] });
    const text = infoMd(id);
    const r = await POST(`op=promote&token=${carol}`, {
      bundleId: id, base: HEAD9.get(id) ?? null, snapKey: `${id}-${sha(String(chain)).slice(0, 8)}`, author: "suite",
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
              { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
      register: [{ path: "snapshots/doc.bin", sha256: cap9(id), encoding: "binary", bytes: 10 }],
      meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${id}`,
              current_state: "collected", created: NOW, last_updated: LATER } });
    if (!r.result?.ok) throw new Error(`promote9 ${id}: ${JSON.stringify(r).slice(0, 600)}`);
    HEAD9.set(id, r.result.bundleSha);
  };
  const locate = async (id, via) => {
    const r = await doPost("recordcapturedlocator", {
      address: `https://example.gov/${id}.pdf`, addressNorm: `example.gov/${id}.pdf`,
      captureSha: cap9(id), retrieved: NOW, via });
    if (!r || r.recorded === false) throw new Error(`locate ${id}: ${JSON.stringify(r)}`);
  };
  const reg9 = async (inq, doc) => {
    const r = (await GET(`op=earnedbasis&token=${carol}&id=${inq}`)).body.result;
    return (r && r.earned && r.earned.capture ? r.earned.capture[doc] : null) ?? null;
  };

  /* ---- 9a. THE HEADLINE. */
  const D_DIR = "INFO-2026-0920-fetched-direct";
  const I_DIR = "INQ-2026-0920-weaker-on-direct";
  await promote9(D_DIR, undefined);
  await promote(carol, I_DIR, inquiryMd(I_DIR, { refs: [D_DIR], legs: [g(D_DIR, "C", "capture")] }), "inquiry");
  const dirBefore = (await pair(carol, I_DIR)).body.result.capture;
  const regBefore = await reg9(I_DIR, D_DIR);
  /* CORRECTED BY D-709 (BOB #35, 2026-09-25 10:05Z), never exempted: this read
     "the entry has NO fetch key", and that pin encoded a SILENCE — an absent key
     cannot be told from "the route was measured and is absent". The entry now
     STATES the route unrecorded, and the leg reads the member's letter and says
     it is the author's, under the ceiling. */
  t("BEFORE the fetch is recorded the route is unrecorded: the member's weaker letter stands and the entry STATES the route unrecorded",
    [dirBefore.grade, regBefore?.fetch?.route ?? "(no fetch key)", regBefore?.fetch?.earned ?? null],
    ["C", "unrecorded", null]);
  await locate(D_DIR, "direct");
  const dirAfter = (await pair(carol, I_DIR)).body.result.capture;
  const regAfter = await reg9(I_DIR, D_DIR);
  t("the registry now MEASURES the document's capture grade from its direct fetch",
    [regAfter?.fetch?.determined, regAfter?.fetch?.direct, regAfter?.fetch?.earned === regAfter?.grade],
    [true, 1, true]);
  /* THE ACCEPTS-WHEN, with BOTH figures and the authored one labelled, so the
     negative control (read the authored grade again) fails naming what it read. */
  t("A MEMBER-AUTHORED WEAKER LETTER ON A DIRECT CAPTURE READS THE EARNED GRADE, NOT THE AUTHORED ONE",
    { walk: dirAfter.grade, authored: "C" }, { walk: regAfter?.fetch?.earned ?? "(no earned grade)", authored: "C" });
  t("and the walk says WHY, in the registry's own words",
    [/fetched .* itself/.test(dirAfter.weakest?.why ?? ""), /directly from its own address/.test(dirAfter.weakest?.why ?? "")],
    [true, true]);
  t("the leg's own AUTHORED letter is untouched in the record",
    (await doGet(`basis?id=${I_DIR}`)).legs.map((l) => l.grade), ["C"]);

  /* ---- 9b. THE MEASURED LETTER FOLLOWS THE CHAIN (DEC-4): a direct capture
     whose text a machine derived at a MEASURED fidelity earns that fidelity,
     not the byte grade, and a leg at the fidelity letter reads unchanged. */
  const D_DOCR = "INFO-2026-0921-direct-ocrd";
  const I_DOCR = "INQ-2026-0921-on-direct-ocrd";
  await promote9(D_DOCR, OCR_C);
  await locate(D_DOCR, "direct");
  await promote(carol, I_DOCR, inquiryMd(I_DOCR, { refs: [D_DOCR], legs: [g(D_DOCR, "C", "capture")] }), "inquiry");
  const docrReg = await reg9(I_DOCR, D_DOCR);
  const docrWalk = (await pair(carol, I_DOCR)).body.result.capture;
  t("a direct capture's measured letter is its fidelity bound, and a leg AT it reads unchanged with no reason",
    [docrReg?.fetch?.earned, docrReg?.grade, docrWalk.grade, docrWalk.weakest?.why ?? null], ["C", "C", "C", null]);

  /* ---- 9c. OVER-STRICTNESS: a leg AT the measured letter on a direct capture
     is byte-for-byte the pre-item answer — no reason, nothing raised. */
  const I_AT = "INQ-2026-0922-at-the-measured-letter";
  await promote(carol, I_AT, inquiryMd(I_AT, { refs: [D_DIR], legs: [g(D_DIR, regAfter.fetch.earned, "capture")] }), "inquiry");
  const atWalk = (await pair(carol, I_AT)).body.result.capture;
  t("a leg stating exactly the measured letter reads it with NO reason attached",
    [atWalk.grade, atWalk.weakest?.why ?? null], [regAfter.fetch.earned, null]);

  /* ---- 9d. AN ARCHIVE-ONLY CAPTURE EARNS ITS LETTER, MEASURED (D-693).
     CORRECTED, NOT EXEMPTED: D-177 shipped this section asserting the archive
     route UNDETERMINED (CAPTURE_GRADE_VIA_UNRULED) and the member's weaker letter
     STANDING, because no ruling then named what an archive replay earns. BOB #35
     ruled it 2026-09-25 07:55Z from doctrine on record (ARCHIVE-FALLBACK's two-hop
     GRADE-C chain; AUTHORITY-AND-TRUST's transitive trust "with disclosure and grade
     adjustment"; grade tracks directness): it EARNS a measured letter strictly below
     a direct capture. So the old assertion now describes a ruled case read as
     undetermined — the exact defect D-693 exists to close. */
  const D_ARC = "INFO-2026-0923-archive-only";
  const I_ARC = "INQ-2026-0923-weaker-on-archive";
  await promote9(D_ARC, undefined);
  await locate(D_ARC, "archive.org");
  await promote(carol, I_ARC, inquiryMd(I_ARC, { refs: [D_ARC], legs: [g(D_ARC, "D", "capture")] }), "inquiry");
  const arcReg = await reg9(I_ARC, D_ARC);
  const arcWalk = (await pair(carol, I_ARC)).body.result.capture;
  /* THE LETTER, PINNED THREE WAYS. The catalogue DERIVES it (one rank below the
     ceiling in BASIS_GRADES — UNREACHABLE_CAPTURE_GRADE's pattern the other way);
     the ruling NAMES it; op=acquire STAMPS it on every archive capture it files.
     All three must be one letter, and the stamp is read as WRITTEN, by the same
     reader acquire.test.mjs uses, so a divergence between the stamp and the
     measurement is named here rather than found by a member.
     D-698 · CORRECTED, NOT EXEMPTED: D-693 pinned the derivation IN store.mjs and
     read the stamp as a typed letter. The derivation moved to the catalogue so the
     stamp could name it; a pin still reading store.mjs would REQUIRE the local copy
     this item removes. The stamp, when it names ARCHIVE_CAPTURE_GRADE, resolves to
     that constant's value — so moving the exported letter moves the stamp and the
     measurement TOGETHER, and both fail against the ruled "C" below, by name. */
  const ACQ_STAMP = /grade:\s*via === "archive\.org"\s*\?\s*("?[A-Za-z_$][\w$]*"?)\s*:/.exec(INDEX_SRC);
  const stampArm = ACQ_STAMP ? ACQ_STAMP[1] : null;
  const stamped = stampArm === null ? "(stamp not found)"
    : /^"[A-Z]"$/.test(stampArm) ? stampArm.replace(/"/g, "")
    : stampArm === "ARCHIVE_CAPTURE_GRADE" ? ARCHIVE_CAPTURE_GRADE
    : `(stamp names ${stampArm}, which this suite cannot resolve)`;
  t("the catalogue DERIVES the archive letter one rank below the enforced ceiling, and the store keeps no copy of it",
    [/export const ARCHIVE_CAPTURE_GRADE =\s*BASIS_GRADES\[BASIS_GRADES\.indexOf\(EARNED_CAPTURE_CEILING\) \+ 1\] \?\? null;/
       .test(CHECKS_SRC),
     /const ARCHIVE_CAPTURE_GRADE\s*=/.test(STORE_SRC)], [true, false]);
  t("an archive-only document's capture grade is MEASURED, at the ruled letter and at op=acquire's stamped archive letter",
    { determined: arcReg?.fetch?.determined, earned: arcReg?.fetch?.earned, via: arcReg?.fetch?.earned_via,
      archive: arcReg?.fetch?.archive, reason: arcReg?.fetch?.undetermined_because ?? null, stamped },
    { determined: true, earned: "C", via: "archive.org", archive: 1, reason: null, stamped: "C" });
  t("and it ranks STRICTLY BELOW what a direct capture of a document earns (grade tracks directness)",
    [arcReg?.fetch?.earned !== regAfter?.fetch?.earned, /archive replay/.test(arcReg?.fetch?.why ?? "")],
    [true, true]);
  t("A LEG ON AN ARCHIVE-ONLY CAPTURE READS THE MEASURED LETTER, NOT THE AUTHORED ONE",
    { walk: arcWalk.grade, authored: "D" }, { walk: arcReg?.fetch?.earned ?? "(no earned grade)", authored: "D" });
  t("and the walk says it was fetched through an archive replay",
    /fetched .* through an archive replay/.test(arcWalk.weakest?.why ?? ""), true);

  /* 9e. FROM ABOVE TOO: the direct ceiling is not what the record holds for a
     document it only ever read through an archive, so a leg stating that ceiling
     is read at the archive letter, and the member's own letter is kept as written. */
  const I_ARCUP = "INQ-2026-0924-ceiling-on-archive";
  const ceilingLetter = regAfter.grade;
  await promote(carol, I_ARCUP, inquiryMd(I_ARCUP, { refs: [D_ARC], legs: [g(D_ARC, ceilingLetter, "capture")] }), "inquiry");
  const upWalk = (await pair(carol, I_ARCUP)).body.result.capture;
  t("a leg stating the DIRECT ceiling on an archive-only capture is read at the archive letter, and says why",
    [upWalk.grade, /from how this instance fetched it/.test(upWalk.weakest?.why ?? "")], [arcReg?.fetch?.earned, true]);
  t("and its AUTHORED letter is untouched in the record",
    (await doGet(`basis?id=${I_ARCUP}`)).legs.map((l) => l.grade), [ceilingLetter]);

  /* 9f. A VIA NO RULING NAMES stays UNDETERMINED, NAMED, and raises nothing: the
     code CAPTURE_GRADE_VIA_UNRULED is kept for exactly this case. */
  const D_UNR = "INFO-2026-0925-unruled-via";
  const I_UNR = "INQ-2026-0925-weaker-on-unruled";
  await promote9(D_UNR, undefined);
  await locate(D_UNR, "some-other-mirror");
  await promote(carol, I_UNR, inquiryMd(I_UNR, { refs: [D_UNR], legs: [g(D_UNR, "D", "capture")] }), "inquiry");
  const unrReg = await reg9(I_UNR, D_UNR);
  const unrWalk = (await pair(carol, I_UNR)).body.result.capture;
  t("a route NO ruling names is NAMED and its grade UNDETERMINED, with the reason coded",
    [unrReg?.fetch?.determined, unrReg?.fetch?.earned, unrReg?.fetch?.other_via, unrReg?.fetch?.undetermined_because,
     /no ruling names/.test(unrReg?.fetch?.why ?? "")],
    [false, null, ["some-other-mirror"], "CAPTURE_GRADE_VIA_UNRULED", true]);
  t("and the member's weaker letter on it STANDS — nothing is invented for an unruled route",
    [unrWalk.grade, unrWalk.weakest?.why ?? null], ["D", null]);

  /* ---- 9g. D-709 (BOB #35, 2026-09-25 10:05Z) — THE ROW'S ACCEPTS-WHEN: A
     CAPTURE WITH NO RECORDED ROUTE IS STATED, NEVER SILENT. A document none of
     whose captures has a locator row carries `fetch: { route: "unrecorded" }`
     with its reason coded and no measured letter; a leg on it reads the letter
     its author gave, under the ceiling, and the walk SAYS the letter is the
     author's. The ceiling is read from the registry, never typed. */
  const D_NOL = "INFO-2026-0925-no-locator";
  const I_NOL = "INQ-2026-0925-weaker-on-no-locator";
  await promote9(D_NOL, undefined);
  await promote(carol, I_NOL, inquiryMd(I_NOL, { refs: [D_NOL], legs: [g(D_NOL, "D", "capture")] }), "inquiry");
  const nolReg = await reg9(I_NOL, D_NOL);
  const nolWalk = (await pair(carol, I_NOL)).body.result.capture;
  t("A NO-LOCATOR CAPTURE'S ENTRY STATES ITS ROUTE UNRECORDED",
    { route: nolReg?.fetch?.route ?? "(no fetch key)", unrecorded: nolReg?.fetch?.unrecorded,
      earned: nolReg?.fetch?.earned, determined: nolReg?.fetch?.determined,
      reason: nolReg?.fetch?.undetermined_because ?? null, says: /no fetch route is recorded/.test(nolReg?.fetch?.why ?? "") },
    { route: "unrecorded", unrecorded: 1, earned: null, determined: false,
      reason: "CAPTURE_ROUTE_UNRECORDED", says: true });
  t("A LEG ON IT READS AUTHORED-UNDER-CEILING AND SAYS SO — the author's letter, never a measured one",
    { grade: nolWalk.grade, authored: /the D its author gave, under the ceiling of /.test(nolWalk.weakest?.why ?? ""),
      ceiling: new RegExp(`under the ceiling of ${nolReg?.grade}:`).test(nolWalk.weakest?.why ?? "") },
    { grade: "D", authored: true, ceiling: true });
}

await mf.dispose();
console.log(`\ninquirystrength: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

/* NEGATIVE CONTROL: (run 2026-08-04, rec34-agent, FOUR arms, each broken ALONE in src/store.mjs and restored byte-identically; 48 pass when whole) (a) THE ITEM'S OWN — ANSWER FROM THE CACHED COLUMNS: in inquiryStrength replace `const s = this.strengthOf(id);` with `const c = this.#one("SELECT inquiry_capture_strength AS cg, inquiry_capture_state AS cs, inquiry_connection_strength AS ng, inquiry_connection_state AS ns FROM bundles WHERE bundle_id=?", id); const ax = (a, gr, st) => ({ axis: a, state: st, grade: gr, determined: st === "graded", weakest: null, load_bearing: 0, population: 0, not_load_bearing: [], depth_bound: Store.QUEUE_ANCESTOR_DEPTH, detail: "" }); const s = { ok: true, depth_bound: Store.QUEUE_ANCESTOR_DEPTH, capture: ax("capture", c.cg, c.cs), connection: ax("connection", c.ng, c.ns) };` -> 17 assertions fail. THE STALE READ IS NAMED: block 3's "the op moves the INSTANT the leg beneath is raised" wants B and GETS C, while its sibling "the CACHE is genuinely stale (the column still answers capture:C)" still PASSES — which is what proves the two are different sources rather than one. The source assertions name the swap itself ("the op's own code calls the derivation" -> false; "names NONE of the five cached columns" -> lists four), both byte-equality assertions fail, every named leg reads null, the depth sentence and undetermined_at vanish, and block 6 has nothing left to redact. (b) THE PROSE SWEEP — `const prose = (v) => v;` in #redactAxis -> 3 fail, dave receiving PROJ-2026-0001-secret inside `detail`/`why` SENTENCES while every id FIELD is still correctly null (REC-14's measured leak shape reproduced), and the failure "one level up, the inherited answer names no secret either" is the id that appears in NO field of the answer at all — carried up from two levels down inside an inherited leg's `why`. (c) THE SUBJECT ROW — `if (!this.#viewerSees(id, viewer))` -> `if (false)` -> 5 fail: dave is handed the secret project's NOT_AN_INQUIRY answer with `object_type: "project"` and its id spelled out in the detail, hidden-vs-absent stops being byte-identical, the forged-viewer probe flips, and the unstamped read answers instead of failing closed. (d) THE FIELD REDACTION — `static #MEMBER_ID_FIELDS = [];` -> 5 fail, the same secret id standing in `weakest.target_id` and in both not_load_bearing lists while the prose is clean: the two defences are independently breakable and each is loud, which is why they are separate. */
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
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
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
        .fetch(new Request("http://do/" + u.pathname.slice(7) + u.search));
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
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
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

const projMd = (id) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Secret ${id}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "visuals: []",
  "---", "", "## Summary", "", "A project nobody else is invited to.", ""].join("\n");

const promote = async (tok, id, text, type, base = null) => {
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${base ? sha(base).slice(0, 8) : "new"}`, author: "suite",
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

const PROJ = "PROJ-2026-0001-secret";
const MISSING = "INQ-2026-9999-none";        // never created: the no-disclosure yardstick
await promote(carol, PROJ, projMd(PROJ), "project");

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
  t("the answer carries TWO axis objects and NO scalar for a surface to render as 'the strength'",
    Object.keys(r.body.result).sort(), ["capture", "connection", "depth_bound", "ok", "target"]);
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

await mf.dispose();
console.log(`\ninquirystrength: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

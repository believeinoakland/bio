/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d546-state-edge.control.mjs` — deliberately NOT a `.test.mjs`, because it builds ARMED COPIES of the sources and the battery must not discover it. Re-run from `bio-plane/`: `node test/d546-state-edge.control.mjs [arm]`. Each anchor asserted to occur EXACTLY ONCE; the real sources hashed before and after. RESULTS, RUN 2026-09-25 by D-546's worker on land/worker/D-546 over land/worker/D-578 700a432d (real `src/store.mjs` 3,494,271 B sha256 513c6759..., `src/index.mjs` 888,201 B sha256 d77611d5..., `checks/bio-checks.mjs` 1,011,315 B sha256 bc569efc..., UNCHANGED before and after): 9/9 AS DECLARED, exit 0. (a) baseline -> 44/0 · (b) drop-one-type — THE ROW'S CONTROL, the fence dropped for `action` alone -> 40/4, failing BY NAME at `action: planned -> resolved is refused`, `action: …and the head is where it stood`, the sweep's `every UNDECLARED move was refused` and the after-run census `nothing undeclared landed under the fence`, while every other type's arm and every over-strictness arm stays green · (c) ask-nothing — the question disarmed for every type -> 31/13, every row arm, both legacy states reached, the sweep and the after-run count · (d) ask-in-place — OVER-STRICTNESS, a revision that moves no state is asked too -> 39/5, the four in-place amendments and the pre-fence bundle's amendment · (e) census-no-table — THE CENSUS'S LIAR, every move counted undeclared -> 41/3 at the section-1 count, the listed move and the after-run count · (f) census-created-order — pairing by the writer's `created` -> 42/2, the whole-run JOINED arm and the after-run count (the mis-ordered pairs undetermined, never classified) · (g) census-created-order-no-join — (f) with the join disarmed -> 43/1, the after-run count grows past the record · (h) census-no-join — the join alone, in write order: DECLARED NO EFFECT -> 44/0 (this suite builds no broken chain; (g) is the arm that shows the join load-bearing) · (i) spelling — OVER-STRICTNESS, the own-key read spelled `Object.hasOwn` -> 44/0. RECORDED, NOT SMOOTHED: the first run was 6/8 — (d) changed the very line the suite used to build its pre-fence plane (a second variable; the suite now disarms at the region marker), and (f) came back NOT AS DECLARED because the census's first join compared a promotion's `base` with the snapshot that same promotion took, equal by construction: the census was corrected (it now joins on the digest the EARLIER promotion wrote), not the declaration. UNFIXED TREE (the suite pointed at land/worker/D-578 700a432d's own sources): 19 pass / 25 fail — every type's undeclared move, and `published`, answered ok: true. */
/* D-546 — `op=promote` ASKS EVERY TYPE'S STATE-EDGE TABLE, NOT ONLY BIAS'S; THE HISTORY IS COUNTED AND SAID, NEVER
 * REWRITTEN. BOB #34, 2026-09-24 23:55Z: *the fence governs moves MADE FROM NOW ON; the history stays as it was
 * written, and is COUNTED and SAID.* State Rules v1.5 §4, "Moves are fenced from now on" (folded by this row); D-468's
 * bias fence (C-26.12) is the precedent, DEC-49 the code (C-86.6 STATE_MOVE_UNDECLARED).
 *
 * THE DEFECT, measured through op=promote on land/worker/D-578 700a432d before this item (the UNFIXED-TREE figure is
 * the driver's): a promotion naming a state its type's table does not declare from the head's — a verified item back
 * to `collected`, a forming project straight to `matured`, a planned action to `resolved`, an open inquiry to the
 * legacy `published` — LANDED and moved the head, because `promote` asked the bias table alone.
 *
 * THE SECTIONS. 0. A plane built from a COPY of these sources with the new region disarmed (a plane BEFORE the fence)
 * writes two undeclared moves into a persisted store; the plane under test then opens the same store. 1. The census
 * reads them, dated, in the ruling's words, and rewrites nothing (the record's counters and the heads read before and
 * after). 2. The row's arm: an undeclared move of each non-bias type is refused BY NAME and the head is unchanged. 3.
 * Over-strictness: a declared move of each type lands, and so does a revision that moves no state. 4. Scope 4: the
 * legacy states stay READABLE in the table and are UNREACHABLE by promote. 5. The sweep: every ordered pair of every
 * non-bias machine, from the catalogue's own table. 6. The census after the whole run still counts exactly the two
 * pre-fence moves. 7. The census's class fence.
 *
 * WHAT THIS CANNOT SEE: a deployed instance's history (M-179 reads it; the op is the method a sovereign instance runs);
 * a move whose date the writer misstated (the census dates a move by the manifest's `created`, which is the writer's
 * `last_updated` where it sent one — a caller's statement, said so on the answer); the in-bytes `state_history` a
 * document carries (the gate's C-4.2 reads it, and does not yet speak the ruling's sentence — reported, not built).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D546_SRC || fileURLToPath(new URL("../src", import.meta.url));
const { STATES, PROMOTED_TYPE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));
const ADM = "adm-d546", MTOK = "mem-d546";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", NOW = "2026-07-24T00:00:00Z";

/* ONE persisted store, opened first by the pre-fence plane and then by the plane under test. */
const PERSIST = mkdtempSync(join(tmpdir(), "d546-persist-"));
const mk = (srcDir) => {
  const idx = join(srcDir, "index.mjs");
  return new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MTOK, PROBE_TOKEN: "prb-d546",
                VERSION: "test" },
    defaultPersistRoot: PERSIST,
  });
};
/* THE PRE-FENCE PLANE: a copy of the sources under test with THIS row's region disarmed, and nothing else changed. */
/* Disarmed at the REGION MARKER, so an arm of the control driver that edits the region's own condition still gets a
   pre-fence plane built the same way (its first spelling anchored on the condition, and the driver's `ask-in-place`
   arm then changed two variables). */
const FENCE = "      /* DEC-49 REGION is-promote-state-edge */\n      if (";
const preFenceSrc = () => {
  const root = mkdtempSync(join(tmpdir(), "d546-prefence-"));
  cpSync(SRC_DIR, join(root, "bio-plane", "src"), { recursive: true });
  cpSync(join(SRC_DIR, "..", "checks"), join(root, "bio-plane", "checks"), { recursive: true });
  cpSync(join(dirname(join(SRC_DIR, "..")), "docprofile"), join(root, "docprofile"), { recursive: true });
  const p = join(root, "bio-plane", "src", "store.mjs");
  const s = readFileSync(p, "utf8");
  const n = s.split(FENCE).length - 1;
  writeFileSync(p, s.replace(FENCE, () => FENCE.replace("if (", "if (false) if (")));
  return { dir: join(root, "bio-plane", "src"), anchors: n };
};

let mf = null;
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* A local store the suite owns (no live record is reached), so the default namespace, as D-563's suite: op=claim and
   op=enroll refuse a named scratch (NAMESPACE_PINNED, D-461). */
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 600)}`); return r; };
const reasonOf = (r) => r?.ok === true ? "LANDED" : (r?.reason ?? JSON.stringify(r).slice(0, 160));

/* The four non-bias machines' documents, each at a given state; `v` varies the body so a revision is a new version. */
const infoMd = (id, state, v = 0) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "source_status: unchanged",
  "---", "", "## Summary", "", `A captured document, version ${v}.`, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join(NL);
const actionMd = (id, state, v = 0) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1", 'title: "Records request"',
  `current_state: ${state}`, "prior_state: null", `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
  "action_kind: cpra_request", "risk_tier: undetermined",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "", "## Plan", "", `Ask for the transfer ledger, version ${v}.`, "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", ""].join(NL);
const inquiryMd = (id, state, v = 0, type = "inquiry") => ["---",
  `id: ${id}`, `object_type: ${type}`, "schema: inquiry@1",
  `title: "Question ${id}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
  "---", "", "## Question", "", `Where did the transfer ${id} go?`, "", `Version ${v}.`, "", "## Session Log", ""].join(NL);
/* A project names no id on its creation (the plane mints it, REC-141), and its title is unique (7.1). */
const projectMd = (id, title, state, v = 0) => ["---",
  ...(id ? [`id: ${id}`] : []), "object_type: project", `title: "${title}"`, `current_state: ${state}`,
  `created: "${NOW}"`, `last_updated: "${NOW}"`, "references: []", "---", "",
  "## Thesis Summary", "", `A project, version ${v}.`, "", "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join(NL);

let seq = 0;
/* CORRECTED 2026-09-25 (D-615, C-86.7), never exempted: `when` dated the manifest row through the ENVELOPE while the
   document said NOW, and a label contradicting the document's dates is now refused; the manifest row is dated by the
   DOCUMENT's last_updated. So `when` is written INTO the bytes, where the writer's date now lives, and the census still
   reads the same dates. */
const promote = async (tok, { id = null, base = null, text: text0, type, state, when = NOW }) => {
  const text = text0.replace(/^last_updated: .*$/m, `last_updated: "${when}"`);
  return POST(`op=promote&token=${tok}`, {
    ...(id ? { bundleId: id } : {}), base, snapKey: `20260724T${String(++seq).padStart(6, "0")}Z_d546`, author: "x",
    meta: { object_type: type, current_state: state, created: NOW, last_updated: when },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] });
};
const listed = async (id) => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id) ?? null;
const census = async (tok = ADM) => GET(`op=statemovecensus&token=${tok}&limit=500`);
const stats = async () => GET(`op=stats&token=${ADM}`);

/* One bundle of a machine, born at `birth`, revisable by `move(to)` — which answers what op=promote answered. */
let serial = 0;
const MAKERS = {
  information: { birth: "collected", md: (id, st, v) => infoMd(id, st, v), id: () => `INFO-2026-${5460 + (++serial)}-d546` },
  action:      { birth: "planned",   md: (id, st, v) => actionMd(id, st, v), id: () => `ACTN-2026-${5460 + (++serial)}-d546` },
  inquiry:     { birth: "open",      md: (id, st, v) => inquiryMd(id, st, v), id: () => `INQ-2026-${5460 + (++serial)}-d546` },
  project:     { birth: "forming",   md: null, id: () => null },
};
let RUTH = null;
const bundle = async (type, label) => {
  const m = MAKERS[type];
  let v = 0, id = m.id();
  const title = `D-546 ${label} ${++serial}`;
  const text = type === "project" ? projectMd(null, title, m.birth, v) : m.md(id, m.birth, v);
  const made = await promote(RUTH, { id, text, type, state: m.birth });
  if (!made || made.ok === false) return { fixture: `create ${type}: ${reasonOf(made)}` };
  id = made.bundleId ?? id;
  const b = { id, type };
  b.move = async (to) => {
    const head = await listed(id);
    const next = type === "project" ? projectMd(id, title, to, ++v) : m.md(id, to, ++v);
    return promote(RUTH, { id, base: head?.bundle_sha, text: next, type, state: to });
  };
  return b;
};

try {

/* ============================================================== 0. THE PRE-FENCE PLANE WRITES THE HISTORY */
console.log("\n--- 0. a plane BEFORE the fence writes two undeclared moves into the persisted store ---");
const pre = preFenceSrc();
t("FIXTURE: the pre-fence plane ARMED — this row's region disarmed at exactly one anchor", pre.anchors, 1);
mf = mk(pre.dir);
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-546" }));
const add = await POST(`op=memberadd&token=${ADM}`, { memberId: "ruth", cover: "cover for ruth", role: "admin",
  capabilities: ["contribute", "publish", "create_projects"] });
must("enroll ruth", await POST("op=enroll", { invite: add && add.invite, handle: "ruth", password: "ruth-pass-546" }));
const lg = await POST("op=login", { role: "member:ruth", password: "ruth-pass-546" });
if (!lg || !lg.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
RUTH = lg.token;
const H = "INFO-2026-5460-d546-prefence";
must("H born collected", await promote(RUTH, { id: H, text: infoMd(H, "collected", 0), type: "information", state: "collected" }));
must("H collected -> verified (declared)", await promote(RUTH, { id: H, base: (await listed(H))?.bundle_sha,
  text: infoMd(H, "verified", 1), type: "information", state: "verified", when: "2026-07-25T00:00:00Z" }));
const back = await promote(RUTH, { id: H, base: (await listed(H))?.bundle_sha,
  text: infoMd(H, "collected", 2), type: "information", state: "collected", when: "2026-07-26T00:00:00Z" });
t("FIXTURE: on the pre-fence plane, verified -> collected LANDS (the history this row may not rewrite)", reasonOf(back), "LANDED");
const A0 = "ACTN-2026-5460-d546-prefence";
must("A0 born planned", await promote(RUTH, { id: A0, text: actionMd(A0, "planned", 0), type: "action", state: "planned" }));
const late = await promote(RUTH, { id: A0, base: (await listed(A0))?.bundle_sha,
  text: actionMd(A0, "resolved", 1), type: "action", state: "resolved", when: "2026-10-01T00:00:00Z" });
t("FIXTURE: on the pre-fence plane, planned -> resolved LANDS, dated AFTER the fence's date by its writer", reasonOf(late), "LANDED");
await mf.dispose();

/* ============================================================== 1. THE CENSUS READS IT, AND WRITES NOTHING */
mf = mk(SRC_DIR);
console.log("\n--- 1. the plane under test counts the stored moves, dated, in the ruling's words, and rewrites nothing ---");
const s0 = await stats(), h0 = await listed(H), a0 = await listed(A0);
const c1 = await census();
t("FIXTURE: the census reached a non-empty store (floor: 2 bundles, 3 pairs)", [c1?.ok, c1?.bundles >= 2, c1?.pairs >= 3], [true, true, true]);
t("it counts EXACTLY the two undeclared moves — never larger or smaller than the record holds",
  [c1?.undeclared, c1?.listed?.length, c1?.per_type?.information?.undeclared, c1?.per_type?.action?.undeclared], [2, 2, 1, 1]);
t("…and the declared move beside them is counted as a move and not listed",
  [c1?.per_type?.information?.moves, c1?.moves], [2, 3]);
t("…and every pair is accounted for, none rounded off (moves + in place + undetermined = pairs)",
  c1 ? c1.moves + c1.revisions_in_place + c1.undetermined : -1, c1?.pairs ?? -2);
const hRow = c1?.listed?.find((r) => r.bundle_id === H), aRow = c1?.listed?.find((r) => r.bundle_id === A0);
t("the pre-fence move is listed with its edge, its date and the ruling's sentence — BEFORE the fence",
  [hRow?.from, hRow?.to, hRow?.date, hRow?.fenced_since, hRow?.reading],
  ["verified", "collected", "2026-07-26T00:00:00Z", "2026-09-25",
   "made by a path the current rules do not allow (before 2026-09-25)"]);
t("a move its writer dated on or after the fence's date is NOT placed before it: the sentence says what is not recorded",
  [aRow?.from, aRow?.to, aRow?.reading],
  ["planned", "resolved", "made by a path the current rules do not allow (dated 2026-10-01T00:00:00Z, not before the "
   + "fence of 2026-09-25: which plane accepted it is not recorded)"]);
t("…and it says it rewrote nothing, and whose word the date is", [c1?.rewritten, typeof c1?.dated_by], [0, "string"]);
t("WITNESS: the record's counters, and both heads, are byte-identical after the census",
  [JSON.stringify(await stats()) === JSON.stringify(s0), (await listed(H))?.bundle_sha, (await listed(A0))?.bundle_sha,
   (await listed(H))?.current_state, (await listed(A0))?.current_state],
  [true, h0?.bundle_sha, a0?.bundle_sha, "collected", "resolved"]);

/* ============================================================== 2. THE ROW'S ARM */
console.log("\n--- 2. an undeclared move of EVERY non-bias type is refused BY NAME, and the head does not move ---");
const ROW = PROMOTED_TYPE_CHECKS.STATE_MOVE_UNDECLARED;
t("FIXTURE: the catalogue row is C-86.6 and names this row's region", [ROW?.check, ROW?.where],
  ["C-86.6", "src/store.mjs promote > is-promote-state-edge"]);
for (const [type, to, legal] of [["information", "retired", ["verified"]], ["action", "resolved", ["active", "abandoned"]],
                                 ["project", "matured", ["investigating", "closed"]],
                                 ["inquiry", "surfaced", ["deferred", "dismissed", "concluded", "divided"]]]) {
  const b = await bundle(type, "row");
  if (b.fixture) throw new Error(b.fixture);
  const before = await listed(b.id);
  const r = await b.move(to);
  t(`${type}: ${MAKERS[type].birth} -> ${to} is refused STATE_MOVE_UNDECLARED, C-86.6, naming the edge and the table's moves`,
    [r?.ok, r?.reason, r?.code, r?.check, r?.from, r?.to, r?.object_type, r?.legal_from, r?.translation === ROW?.translation],
    [false, "STATE_MOVE_UNDECLARED", "STATE_MOVE_UNDECLARED", "C-86.6", MAKERS[type].birth, to, type, legal, true]);
  const after = await listed(b.id);
  t(`${type}: …and the head is where it stood, at the same bytes`,
    [after?.current_state, after?.bundle_sha], [MAKERS[type].birth, before?.bundle_sha]);
}
const hb = await listed(H);
const hr = await promote(RUTH, { id: H, base: hb?.bundle_sha, text: infoMd(H, "retired", 9), type: "information", state: "retired" });
t("the pre-fence bundle's history licenses nothing: from where it stands (collected), `retired` is refused too",
  [reasonOf(hr), (await listed(H))?.bundle_sha], ["STATE_MOVE_UNDECLARED", hb?.bundle_sha]);

/* ============================================================== 3. OVER-STRICTNESS */
console.log("\n--- 3. over-strictness: a DECLARED move of each type lands, and a revision in place always does ---");
for (const [type, to] of [["information", "verified"], ["action", "active"], ["project", "investigating"], ["inquiry", "deferred"]]) {
  const b = await bundle(type, "declared");
  if (b.fixture) throw new Error(b.fixture);
  const r = await b.move(to);
  t(`OVER-STRICTNESS ${type}: ${MAKERS[type].birth} -> ${to} LANDS and moves the head`,
    [reasonOf(r), (await listed(b.id))?.current_state], ["LANDED", to]);
  const same = await b.move(to);
  t(`OVER-STRICTNESS ${type}: a revision that stays at ${to} LANDS (how any item is amended)`,
    [reasonOf(same), (await listed(b.id))?.current_state], ["LANDED", to]);
}
const ab = await listed(A0);
const amend = await promote(RUTH, { id: A0, base: ab?.bundle_sha, text: actionMd(A0, "resolved", 7), type: "action", state: "resolved" });
t("OVER-STRICTNESS: the pre-fence bundle, amended where it stands (resolved -> resolved), LANDS — no stored move is held against it",
  reasonOf(amend), "LANDED");

/* ============================================================== 4. SCOPE 4 — READABLE, UNREACHABLE */
console.log("\n--- 4. the legacy states stay in the table for READING, and promote cannot reach them ---");
t("READABLE: `STATES` still carries focus's `elevated` and inquiry's legacy `published`",
  [STATES.focus.legal.includes("elevated"), STATES.inquiry.legacy.includes("published")], [true, true]);
const q = await bundle("inquiry", "legacy");
const qp = await q.move("published");
t("UNREACHABLE: an open inquiry named `published` is refused by name", [reasonOf(qp), qp?.legal_from],
  ["STATE_MOVE_UNDECLARED", ["deferred", "dismissed", "concluded", "divided"]]);
const P = "PROB-2026-5460-d546-legacy";
must("a legacy `problem` born surfaced", await promote(RUTH, { id: P, text: inquiryMd(P, "surfaced", 0, "problem"),
  type: "problem", state: "surfaced" }));
const pe = await promote(RUTH, { id: P, base: (await listed(P))?.bundle_sha, text: inquiryMd(P, "elevated", 1, "problem"),
  type: "problem", state: "elevated" });
t("UNREACHABLE: a `problem` spelled in the legacy vocabulary cannot be moved to `elevated` — the move is asked of the machine "
  + "this plane runs (inquiry), not the one the spelling was written under",
  [reasonOf(pe), pe?.object_type, (await listed(P))?.current_state], ["STATE_MOVE_UNDECLARED", "inquiry", "surfaced"]);
const pd = await promote(RUTH, { id: P, base: (await listed(P))?.bundle_sha, text: inquiryMd(P, "deferred", 2, "problem"),
  type: "problem", state: "deferred" });
t("OVER-STRICTNESS: the same legacy `problem` moves along a live edge (surfaced -> deferred)", reasonOf(pd), "LANDED");

/* ============================================================== 5. THE SWEEP */
console.log("\n--- 5. every ordered pair of every non-bias machine, from the catalogue's own table ---");
const pathTo = (type, goal) => {
  const edges = STATES[type].edges, start = MAKERS[type].birth;
  const seen = new Map([[start, []]]), queue = [start];
  while (queue.length) {
    const s = queue.shift();
    if (s === goal) return seen.get(s);
    for (const n of edges[s] || []) if (!seen.has(n)) { seen.set(n, [...seen.get(s), n]); queue.push(n); }
  }
  return null;
};
const landed = [], refused = [], broken = [], unreachable = [];
let pairs = 0;
for (const type of ["information", "action", "project", "inquiry"]) {
  const LEGAL = STATES[type].legal, EDGES = STATES[type].edges;
  for (const from of LEGAL) for (const to of LEGAL) {
    if (from === to) continue;
    pairs++;
    const path = pathTo(type, from);
    if (path === null) { unreachable.push([type, from]); continue; }
    const b = await bundle(type, `sweep ${from} ${to}`);
    if (b.fixture) { broken.push([type, from, to, b.fixture]); continue; }
    let ok = true;
    for (const st of path) { const r = await b.move(st); if (!r || r.ok === false) { broken.push([type, from, to, `walk to ${st}: ${reasonOf(r)}`]); ok = false; break; } }
    if (!ok) continue;
    const r = await b.move(to);
    ((EDGES[from] || []).includes(to) ? landed : refused).push([type, from, to, reasonOf(r)]);
  }
}
t("REACH: the corpus is the catalogue's tables — 6 + 20 + 12 + 30 ordered pairs, both halves non-empty",
  [pairs, landed.length > 0, refused.length > 0], [68, true, true]);
t("every state is reachable from its machine's birth by the table's own edges", [...new Set(unreachable.map((u) => u.join(" ")))], []);
t("NO FIXTURE FAILED TO BUILD — anything the sweep could not stand up is named here", broken, []);
t("every DECLARED move LANDED", landed.filter((r) => r[3] !== "LANDED"), []);
t("every UNDECLARED move was refused STATE_MOVE_UNDECLARED", refused.filter((r) => r[3] !== "STATE_MOVE_UNDECLARED"), []);
console.log(`  sweep: ${pairs} pairs, ${landed.length} declared landed, ${refused.length} undeclared refused, `
  + `${broken.length} broken, ${unreachable.length} unreachable`);

/* ============================================================== 6. THE HISTORY, AFTER THE WHOLE RUN */
console.log("\n--- 6. after every move above, the census still counts exactly the two pre-fence moves ---");
const c6 = await census();
t("nothing undeclared landed under the fence: still 2, still the two pre-fence bundles",
  [c6?.undeclared, (c6?.listed || []).map((r) => r.bundle_id).sort()], [2, [A0, H].sort()]);
t("…and the census saw the run's declared moves (floor: more moves than section 1 read)", (c6?.moves ?? 0) > (c1?.moves ?? 0), true);
t("…and every pair of the run's chains JOINED — none left undetermined, so a census that called everything undetermined "
  + "could not pass", [c6?.undetermined, c6 ? c6.moves + c6.revisions_in_place : -1], [0, c6?.pairs ?? -2]);

/* ============================================================== 7. THE CLASS FENCE */
console.log("\n--- 7. the census is an admin and probe read ---");
const cm = await census(MTOK);
t("a member credential may not read the census", cm?.ok === true, false);
/* CORRECTED on this suite's first run: it asserted the probe read the same two moves, and a probe is CONFINED to the
   scratch namespace (D-325's `scopeFor`), which in this store holds nothing — so it answers, over its own store. */
const cp = await census("prb-d546");
t("a probe may, over the namespace it is confined to (snapkeycensus's fence; scratch holds no bundle here)",
  [cp?.ok, cp?.bundles, cp?.undeclared], [true, 0, 0]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  if (mf) await mf.dispose();
}
console.log(`\nd546-state-edge: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

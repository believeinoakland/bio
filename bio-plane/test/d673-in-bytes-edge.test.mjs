/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d673-in-bytes-edge.control.mjs` — deliberately NOT a `.test.mjs`, because it builds ARMED COPIES of the sources and the battery must not discover it. Re-run from `bio-plane/`: `node test/d673-in-bytes-edge.control.mjs [arm]`. Each anchor asserted to occur EXACTLY ONCE; the real sources hashed before and after. RESULTS, RUN 2026-09-25 by D-673's worker on land/worker/D-673 over land/worker/D-546 b690552a (real `src/store.mjs` 3,498,022 B sha256 13096248..., `src/index.mjs` 888,366 B sha256 f9b9cdbc..., `src/gate.mjs` 27,047 B sha256 bda027a9..., `checks/bio-checks.mjs` 1,014,014 B sha256 cd901bac..., UNCHANGED before and after): 9/9 AS DECLARED, exit 0. (a) baseline -> 15/0 · (b) no-corroboration — THE ROW'S CONTROL, first half, nothing ever corroborated (C-4.2 as it was) -> 9/6, failing BY NAME at `THE ROW: the corroborated twin PASSES C-4.2`, the count arm, O's over-strictness and the three op arms, while the uncorroborated twin, the late-dated arm and the declared twin stay green · (c) timestamp-alone — THE ROW'S CONTROL, second half, the BYTES' timestamp buys the reading with no record move -> 7/8, failing BY NAME at `THE ROW: the uncorroborated twin — the same edge, backdated in its bytes, no record move — FAILS C-4.2 by name` and `THE ROW through the op` · (d) bytes-date — the record asked but dated by the bytes -> 11/4, the late-dated arm, O's over-strictness and two op arms · (e) no-fence-date — the date not asked -> 12/3, the late-dated arm and two op arms · (f) no-consume — one record move corroborates every match -> 12/3, the count arm and two op arms · (g) audit-blind — op=audit injects nothing -> 12/3, the three op arms only · (h) facts-blind — the ratify gate's facts inject nothing -> 11/4, the facts fixture and the three gate arms that rest on the record, the op arms green · (i) spelling — OVER-STRICTNESS, the take spelled `.pop()` -> 15/0. RECORDED, NOT SMOOTHED: the suite's first run read section 2 over an EMPTY image (the store's image door was asked with no viewer and answered null), so the gate arms that expect no error passed for nothing; the fixture is now floored. UNFIXED TREE (the suite pointed at b690552a's own sources): 7 pass / 8 fail — no record move reached the gate, and the corroborated twin read the ERROR. */
/* D-673 — C-4.2 AND A DOCUMENT'S IN-BYTES `state_history`: an undeclared edge in a document's OWN bytes is read in
 * D-546's sentence ONLY where the RECORD's own history corroborates the same move. BOB #35, 2026-09-25 08:00Z, option
 * (b): *the pair appears in D-546's `statemovecensus`'s chain-joined record moves for that bundle, at or before the
 * fence. Otherwise C-4.2 keeps the ERROR. A writer's timestamp is a claim the writer can backdate, so it never buys the
 * pre-fence reading on its own.* State Rules v1.5 §4.7 (folded by this row).
 *
 * THE DEFECT, on land/worker/D-546 b690552a before this item: C-4.2 read EVERY undeclared edge in a document's bytes as
 * an ERROR, so a document whose history the record itself holds, made before the fence, could never be said in the
 * ruling's words; and nothing let the record's history be asked at all.
 *
 * THE SECTIONS. 0. A plane built from a COPY of these sources with D-546's fence disarmed writes, pre-fence, the
 * record's own history for four bundles. 1. The plane under test writes two more (a creation carrying a backdated
 * undeclared edge the record never saw, and a declared-only twin). 2. The ratify gate's own function (`runGate`) over the
 * store's own image and gate facts, per bundle. 3. The same verdicts through `op=audit`. 4. The wiring.
 *
 * WHAT THIS CANNOT SEE: a deployed instance's history (M-179: 11 in-bytes entries, 0 undeclared, so nothing live
 * changes); `op=ratify` itself end to end (a signing ceremony — section 4 pins that it threads the same facts to the
 * same `runGate` this suite calls); a record move whose writer misstated its `created` (the census and this
 * corroboration date a move by the manifest's `created`, the writer's `last_updated` where it sent one — D-674).
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
const SRC_DIR = process.env.D673_SRC || fileURLToPath(new URL("../src", import.meta.url));
const { runGate } = await import(join(SRC_DIR, "gate.mjs"));
const { checkBundle } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));
const ADM = "adm-d673", MTOK = "mem-d673";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", NOW = "2026-07-24T00:00:00Z";
const SENTENCE = "made by a path the current rules do not allow (before 2026-09-25)";
const EDGE = "transition verified -> collected is not a legal information edge";

const PERSIST = mkdtempSync(join(tmpdir(), "d673-persist-"));
const mk = (srcDir) => {
  const idx = join(srcDir, "index.mjs");
  return new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MTOK, PROBE_TOKEN: "prb-d673",
                VERSION: "test" },
    defaultPersistRoot: PERSIST,
  });
};
/* THE PRE-FENCE PLANE: D-546's own construction — a copy with `is-promote-state-edge` disarmed at its region marker. */
const FENCE = "      /* DEC-49 REGION is-promote-state-edge */\n      if (";
const preFenceSrc = () => {
  const root = mkdtempSync(join(tmpdir(), "d673-prefence-"));
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
/* A local store the suite owns (no live record is reached), so the default namespace, as D-546's suite. */
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const DO = async (path) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://do/${path}`)).json());
};
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 600)}`); return r; };

/* An Information document at `state`, carrying `hist` — [timestamp, from, to] — in its OWN bytes. */
const infoMd = (id, state, v, hist) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, `current_state: ${state}`, `prior_state: ${hist.length ? hist[hist.length - 1][1] : "null"}`,
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []",
  ...(hist.length ? ["state_history:", ...hist.flatMap(([ts, from, to]) => [
    `  - timestamp: "${ts}"`, `    from_state: ${from}`, `    to_state: ${to}`, '    blurb: "moved"', "    author: ruth"])]
    : ["state_history: []"]),
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "source_status: unchanged",
  "---", "", "## Summary", "", `A captured document, version ${v}.`, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join(NL);

let seq = 0, RUTH = null;
const listed = async (id) => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id) ?? null;
/* One promotion of `id` to `state`, its bytes carrying `hist`, dated by its writer `when` (the manifest's `created`). */
const write = async (id, state, v, hist, when) => {
  const head = await listed(id);
  const text = infoMd(id, state, v, hist);
  return POST(`op=promote&token=${RUTH}`, {
    bundleId: id, base: head ? head.bundle_sha : null, snapKey: `20260724T${String(++seq).padStart(6, "0")}Z_d673`,
    author: "x", meta: { object_type: "information", current_state: state, created: NOW, last_updated: when },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] });
};
const CV = ["2026-07-25T00:00:00Z", "collected", "verified"], VC = ["2026-07-26T00:00:00Z", "verified", "collected"];

try {

/* ============================================================== 0. THE PRE-FENCE PLANE WRITES THE RECORD'S HISTORY */
console.log("\n--- 0. a plane BEFORE the fence writes the record's own history ---");
const pre = preFenceSrc();
t("FIXTURE: the pre-fence plane ARMED — D-546's region disarmed at exactly one anchor", pre.anchors, 1);
mf = mk(pre.dir);
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-673" }));
const add = await POST(`op=memberadd&token=${ADM}`, { memberId: "ruth", cover: "cover for ruth", role: "admin",
  capabilities: ["contribute", "publish", "create_projects"] });
must("enroll ruth", await POST("op=enroll", { invite: add && add.invite, handle: "ruth", password: "ruth-pass-673" }));
const lg = await POST("op=login", { role: "member:ruth", password: "ruth-pass-673" });
if (!lg || !lg.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
RUTH = lg.token;
/* C — THE CORROBORATED TWIN: the record holds verified -> collected, dated by its writer before the fence. */
const C = "INFO-2026-6730-d673-corroborated";
must("C born", await write(C, "collected", 0, [], NOW));
must("C -> verified", await write(C, "verified", 1, [CV], CV[0]));
must("C -> collected (undeclared, pre-fence)", await write(C, "collected", 2, [CV, VC], VC[0]));
/* L — the record holds the SAME move, but its writer dated it AFTER the fence; the in-bytes entry is backdated. */
const L = "INFO-2026-6731-d673-late";
must("L born", await write(L, "collected", 0, [], NOW));
must("L -> verified", await write(L, "verified", 1, [CV], CV[0]));
must("L -> collected (dated after the fence)", await write(L, "collected", 2, [CV, VC], "2026-10-01T00:00:00Z"));
/* M — the record holds the move ONCE; the bytes then claim it TWICE (an in-place amendment adds the second). */
const M = "INFO-2026-6732-d673-twice";
must("M born", await write(M, "collected", 0, [], NOW));
must("M -> verified", await write(M, "verified", 1, [CV], CV[0]));
must("M -> collected (once in the record)", await write(M, "collected", 2, [CV, VC], VC[0]));
must("M amended in place, its bytes claiming the move twice", await write(M, "collected", 3,
  [CV, VC, ["2026-07-27T00:00:00Z", "collected", "verified"], ["2026-07-28T00:00:00Z", "verified", "collected"]], "2026-07-28T00:00:00Z"));
/* O — OVER-STRICTNESS: the record's move is pre-fence; the in-bytes entry's OWN timestamp says after the fence. The
   bytes' timestamp is not the basis either way, so the reading still holds. */
const O = "INFO-2026-6733-d673-late-bytes";
must("O born", await write(O, "collected", 0, [], NOW));
must("O -> verified", await write(O, "verified", 1, [CV], CV[0]));
must("O -> collected (pre-fence in the record)", await write(O, "collected", 2,
  [CV, ["2026-10-05T00:00:00Z", "verified", "collected"]], VC[0]));
await mf.dispose();

/* ============================================================== 1. THE PLANE UNDER TEST */
mf = mk(SRC_DIR);
console.log("\n--- 1. the plane under test: a backdated undeclared edge the record never saw, and a declared twin ---");
/* U — THE UNCORROBORATED TWIN: a CREATION (no head, so not asked by the fence) whose bytes carry the same history as
   C's, backdated before the fence. The record holds no move of U at all. */
const U = "INFO-2026-6734-d673-backdated";
must("U created carrying a backdated undeclared edge",
  await write(U, "collected", 0, [["2026-06-30T00:00:00Z", "collected", "verified"], ["2026-07-01T00:00:00Z", "verified", "collected"]], NOW));
/* D — OVER-STRICTNESS: a declared move, in the bytes and in the record. */
const D = "INFO-2026-6735-d673-declared";
must("D born", await write(D, "collected", 0, [], NOW));
must("D -> verified (declared)", await write(D, "verified", 1, [CV], CV[0]));
const census = await GET(`op=statemovecensus&token=${ADM}&limit=500`);
t("FIXTURE: the census holds the record's undeclared moves — C, L, M, O once each, and none of U or D",
  (census?.listed || []).map((r) => r.bundle_id).sort(), [C, L, M, O].sort());

/* ============================================================== 2. THE GATE, OVER THE STORE'S OWN FACTS */
console.log("\n--- 2. the ratify gate's function over the store's own image and gate facts ---");
const judge = async (id) => {
  const image = await DO(`image?id=${encodeURIComponent(id)}&viewer=admin`);
  const facts = await DO(`gatefacts?id=${encodeURIComponent(id)}`);
  const known = new Set([C, L, M, O, U, D]);
  const gate = await runGate({ bundleId: id, image, knownIds: known, registers: facts.registers || [],
    publishedRegistry: facts.publishedRegistry, publishedCaseRegistry: facts.publishedCaseRegistry,
    earnedRegistry: facts.earnedRegistry, recordedMoves: facts.recordedMoves,
    hasCapture: async () => ({ present: true, bytes: 0 }) });
  /* The gate reports errors only; the stated reading is read from the same catalogue function it calls. */
  const files = new Map(Object.entries(image || {}).filter(([, v]) => typeof v === "string"));
  const te = new TextEncoder();
  const { findings } = await checkBundle({ folderName: id, files, recordedMoves: facts.recordedMoves,
    sha256: async (v) => sha(typeof v === "string" ? te.encode(v) : v), resolveTarget: (x) => known.has(x) });
  return { errors: gate.findings.filter((x) => x.check === "C-4.2").map((x) => x.detail),
           stated: findings.filter((x) => x.check === "C-4.2" && x.severity === "info").map((x) => x.message),
           facts, bytes: typeof image?.["bundle.md"] === "string",
           snaps: Object.keys(image || {}).filter((k) => /^_history\/bundle_.*\.md$/.test(k)).length };
};
const jC = await judge(C), jU = await judge(U), jL = await judge(L), jM = await judge(M), jO = await judge(O), jD = await judge(D);
/* CORRECTED on this suite's first run: the image was read with no viewer, the store's door answered null, and every
   verdict below read "no C-4.2" over an EMPTY image. Floored, so an image the gate never saw cannot pass. */
t("FIXTURE: every judged image carries its bundle.md and its history (floor: 1 and 2 snapshots)",
  [jC, jU, jL, jM, jO, jD].map((j) => [j.bytes, j.snaps >= (j === jU ? 0 : 1)]), Array(6).fill([true, true]));
t("FIXTURE: the store's gate facts carry the record's moves (C: collected -> verified, verified -> collected)",
  (jC.facts?.recordedMoves?.moves || []).map((m) => `${m.from}->${m.to}`), ["collected->verified", "verified->collected"]);
t("THE ROW: the corroborated twin PASSES C-4.2, in D-546's sentence, naming the record's move",
  [jC.errors, jC.stated.length, jC.stated[0]?.startsWith(`${EDGE}: ${SENTENCE}; the record's own history holds the same move`),
   jC.stated[0]?.includes("dated by its writer 2026-07-26T00:00:00Z")], [[], 1, true, true]);
t("THE ROW: the uncorroborated twin — the same edge, backdated in its bytes, no record move — FAILS C-4.2 by name",
  [jU.errors, jU.stated], [[EDGE], []]);
t("a writer's timestamp never buys it: the record holds the move, dated by its writer AFTER the fence -> ERROR",
  [jL.errors, jL.stated], [[EDGE], []]);
t("the reading is never larger than the record's count: two claims, one recorded move -> one stated, one ERROR",
  [jM.errors, jM.stated.length], [[EDGE], 1]);
t("OVER-STRICTNESS: the bytes' own timestamp after the fence does not refuse a move the record holds before it",
  [jO.errors, jO.stated.length], [[], 1]);
t("OVER-STRICTNESS: a declared edge is neither stated nor refused", [jD.errors, jD.stated], [[], []]);

/* ============================================================== 3. THROUGH THE OP */
console.log("\n--- 3. the same verdicts through op=audit ---");
const au = await GET(`op=audit&token=${ADM}&limit=1000`);
const c42 = (id) => ((au?.offenders || []).find((o) => o.bundleId === id)?.errors || [])
  .filter((e) => e.check === "C-4.2").map((e) => e.detail);
const statedOf = (id) => (au?.stated_moves?.listed || []).filter((x) => x.bundleId === id).map((x) => x.detail);
t("FIXTURE: the audit reached the page (6 bundles checked)", [au?.ok, au?.checked], [true, 6]);
t("THE ROW through the op: C is stated in the sentence and carries no C-4.2 error; U carries the ERROR",
  [c42(C), statedOf(C).length, statedOf(C)[0]?.includes(SENTENCE), c42(U), statedOf(U)], [[], 1, true, [EDGE], []]);
t("…and L and M keep their ERROR, O and D none", [c42(L), c42(M), c42(O), c42(D)], [[EDGE], [EDGE], [], []]);
t("…and the stated count is whole: C, M and O once each", [au?.stated_moves?.total, statedOf(M).length, statedOf(O).length], [3, 1, 1]);

/* ============================================================== 4. THE WIRING */
console.log("\n--- 4. op=ratify threads the same facts to the same gate ---");
const idx = readFileSync(join(SRC_DIR, "index.mjs"), "utf8");
t("index.mjs's one runGate call passes the store's recordedMoves", idx.split("recordedMoves: facts.recordedMoves,").length - 1, 1);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  if (mf) await mf.dispose();
}
console.log(`\nd673-in-bytes-edge: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

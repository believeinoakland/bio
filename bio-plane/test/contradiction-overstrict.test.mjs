/* NEGATIVE CONTROL: RUN 2026-09-23 (M0-71), SIX arms, all SIX AS DECLARED, via `cd bio-plane && node test/contradiction-overstrict.control.mjs [arm]`; each armed ALONE, restored from a per-arm pristine copy verified by sha256 AND `cmp` with a byte minimum. baseline 19/0. (1) `pairing` — §7 control 1, K2 disabled in store.mjs `contradictionPairs`: 13/6, fails `K2 COMPARED`, keeps `K1 COMPARED` (store.mjs restored 2902978 B, 893a1cc99c3b). (2) `judgement` — §7 control 2, the candidate labels every pair `world`: 18/1, fails `THE BASELINE CANDIDATE PASSES THE GATE` (FALSE_CONFLICT), keeps `K2 COMPARED`. (3) `disabled` — the candidate returns no label: 17/2, fails the same gate line (JUDGEMENT_ABSENT) and the label-vocabulary line, keeps `EMPTY RECORD`. (4) `empty` — §7 control 3, the NOTHING_COMPARED guard removed from the gate: 18/1, fails `EMPTY RECORD: the gate REFUSES`, keeps the baseline gate. (5) `overstrict` — the gate fails a rate EQUAL to the threshold: 16/3, fails `OVER-STRICTNESS OF THE GATE ITSELF`, keeps the always-`world` arm.
 *
 * M0-71 — CONTRADICTION'S IDENTIFY, 2 of 3: THE FIXTURE AND THE MEASUREMENT.
 * `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §7 (the over-strictness arm,
 * its corpus and its three negative controls) and §9 item 2.
 *
 * WHAT THIS SUITE IS FOR. §7: *a labelled FIXTURE corpus comes before any member
 * sees a candidate*, and *the gate is the FALSE-CONFLICT RATE*. So this suite
 * builds §7's corpus AS A RECORD (every pair formed by REC-146's real
 * `op=contradictionpairs`, never handed to the harness), runs a candidate
 * judgement over what the pairing formed, and holds the result to the gate in
 * `contradiction-gate.mjs`. The figures it prints are the ones recorded in
 * `docs/development/measurements/M-118.md`.
 *
 * THE CHEAPEST LIES, and what stops each:
 *   - "0% false conflicts" over NOTHING. Section 0 reads the EMPTY record first
 *     and demands the harness refuse a rate and carry the op's own empty level
 *     (§6 case (a)) — control arm `empty`.
 *   - a fixture the pairing never compared. Section 2 demands EVERY gold pair be
 *     formed by its own key, asked per key — control arm `pairing` (§7 control 1).
 *   - a gate nothing can fail. Section 4 drives an always-`world` judgement and
 *     a disabled one through the SAME gate and demands each fail BY NAME, and
 *     drives an oracle through it to prove correct work passes (over-strictness
 *     of the gate itself) — control arm `judgement` (§7 control 2) breaks the
 *     candidate in its own file.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { K1, K2, K3, K4, REQUIRED_SHAPES } from "./contradiction-corpus.mjs";
import { measure, gate, pairId, KEYS, LABELS, THRESHOLD } from "./contradiction-gate.mjs";
import { judgeBaseline } from "./contradiction-judge-baseline.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-m071", MEMBER_TOKEN: "mem-m071", PROBE_TOKEN: "prb-m071", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=adm-m071`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const pairsRead = async () => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=contradictionpairs&token=adm-m071`)).json());

const NOW = "2026-09-23T00:00:00Z";
const LATER = "2026-09-23T01:00:00Z";
const pct = (x) => (x === null ? "n/a" : `${(100 * x).toFixed(1)}%`);

try {

/* ------------------------------------------------------------ record shapes */
/* The same bundle shapes REC-146's suite drives (contradictionpairs.test.mjs),
   so what forms here forms by the same rules it was accepted under. */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role || "supports"}`])] : [];
const versionLines = (versions) => versions.length ? [
  "basis_versions:",
  ...versions.map((v) => [`  - name: "${v.name}"`,
    `    description: "A reading of this question, written by the fixture."`,
    `    relationship: "and"`, `    state: "accepted"`, `    state_by: "ruth"`, `    state_at: "${NOW}"`,
    `    derived_from: null`, `    hidden: false`, `    claim: "${v.claim}"`,
    `    author: "ruth"`, `    at: "${NOW}"`].join("\n")),
  "basis_version_grounds:",
  ...versions.map((v) => [`  - version: "${v.name}"`, `    ground: "the record"`,
    `    asserted_by: "ruth"`, `    at: "${NOW}"`].join("\n")),
  "basis_version_legs:",
  ...versions.flatMap((v) => v.legs.map((l) => [`  - version: "${v.name}"`,
    `    target: "${l.target}"`, `    role: "supports"`, `    ground: "the record"`].join("\n"))),
] : [];
const inquiryMd = (id, { refs = [], legs = [], versions = [], subject = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - target: ${x}`, "    rel: cites",
                                                            "    status: confirmed"])] : ["references: []"]),
  "state_history: []",
  ...(subject ? [`subject_entity: ${subject}`] : []),
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the basis.",
  ...legLines(legs), ...versionLines(versions),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const mustPromote = async (id, text, type, { readings = [] } = {}) => {
  const files = [{ path: "bundle.md", text }];
  if (readings.length) files.push({ path: "data/provenance.json", text: JSON.stringify({ documents: readings }) });
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260923T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files });
  if (r.ok === false) throw new Error(`promote ${id} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};
const readingOf = (captureSha, { doctype = "meeting_agenda", date = null, refs = [] } = {}) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: doctype, reader_version: 1, found: refs.length > 0, at: NOW,
             ...(date === null ? {} : { date }), entities: refs,
             text_source: [{ step: "pixels", extent: { kind: "pages", pages: [0, 1] } }] } });
const entRef = (key) => ({ ref: `ordinance:${key}`, kind: "ordinance", key, label: `Ordinance No. ${key}`,
                           source: { kind: "pdf-page", ref: "page 1", page: 0 } });

/* The text of every document side, by capture: the pairing names a capture and
   the member (and the judgement, §5) reads the passage. */
const TEXT = new Map();
const GOLD = new Map();
const PASSAGE = new Map();
const doc = async (id, text, reading = {}) => {
  const cap = sha(`m071-${id}`);
  TEXT.set(cap, text);
  await mustPromote(id, infoMd(id), "information", { readings: [readingOf(cap, reading)] });
  return cap;
};
const sideOf = (s) => (s?.kind === "claim" ? { text: s.claim }
  : { text: TEXT.get(s?.capture_sha) ?? "", doctype: s?.doctype ?? null, date: s?.date ?? null, role: s?.role ?? null });
const contextOf = (p) => PASSAGE.get(pairId(p.key, ...[p.a, p.b].map((s) => (s.kind === "claim"
  ? `${s.inquiry}|${s.version}` : String(s.capture_sha))))) ?? null;

/* ===== 0. THE EMPTY ARM (§7 control 3): nothing compared is case (a), never 0% == */
console.log("\n--- 0. an empty record: the harness states which level was empty, never a rate ---");
const empty = measure({ read: await pairsRead(), gold: new Map(), sideOf, judge: judgeBaseline });
const emptyVerdict = gate(empty);
t("EMPTY RECORD: the gate REFUSES to state a rate and names NOTHING_COMPARED — a 0% false-conflict "
+ "rate over nothing would be the record claiming more than it can support",
  [emptyVerdict.pass, emptyVerdict.fails], [false, ["NOTHING_COMPARED"]]);
t("EMPTY RECORD: and the answer is §6 case (a), carrying the op's OWN per-key empty level rather "
+ "than a bare empty list",
  [empty.empty?.case ?? null, empty.empty?.levels ?? null],
  ["a", { K1: "inquiry", K2: "inquiry", K3: "inquiry", K4: "content" }]);

/* ===== 1. THE CORPUS COVERS §7's SHAPES, AND IS NOT EMPTY ================ */
console.log("\n--- 1. the corpus: §7's shapes, per key, floored ---");
const ALL = [...K1.map((e) => ["K1", e]), ...K2.map((e) => ["K2", e]), ...K3.map((e) => ["K3", e]), ...K4.map((e) => ["K4", e])];
console.log(`  corpus: ${ALL.length} labelled pairs — ${KEYS.map((k) => `${k} ${ALL.filter(([x]) => x === k).length}`).join(", ")}`);
t("THE CORPUS IS FLOORED: at least 26 labelled pairs, and at least 6 per key",
  [ALL.length >= 26, KEYS.every((k) => ALL.filter(([x]) => x === k).length >= 6)], [true, true]);
t("EVERY SHAPE §7 REQUIRES IS PRESENT at least once: Bob's own precision example, rounded, "
+ "approximate and summary precision, both of Bob's world shapes, the record case, and unrelated",
  REQUIRED_SHAPES.filter((s) => !ALL.some(([, e]) => e.shape === s)), []);
t("EVERY KEY carries NEGATIVES (precision or unrelated — what the gate is strict on) AND a genuine "
+ "pair of the case it feeds",
  KEYS.map((k) => [ALL.some(([x, e]) => x === k && (e.label === "precision" || e.label === "unrelated")),
                   ALL.some(([x, e]) => x === k && (e.label === "world" || e.label === "record"))]),
  KEYS.map(() => [true, true]));
t("every gold label is one of §5's five words",
  ALL.every(([, e]) => LABELS.includes(e.label)), true);

/* ===== 2. THE RECORD IS BUILT, AND THE PAIRING — NOT THE SUITE — FORMS EVERY PAIR */
console.log("\n--- 2. the corpus built as a record; every gold pair formed by its own key ---");
for (const e of K1) {
  const a = await doc(`INFO-2026-0071-${e.id}-a`, e.a), b = await doc(`INFO-2026-0071-${e.id}-b`, e.b);
  await mustPromote(`INQ-2026-0071-${e.id}`, inquiryMd(`INQ-2026-0071-${e.id}`, {
    refs: [`INFO-2026-0071-${e.id}-a`, `INFO-2026-0071-${e.id}-b`],
    legs: [{ target: `INFO-2026-0071-${e.id}-a`, role: "supports" }, { target: `INFO-2026-0071-${e.id}-b`, role: "cuts_against" }] }), "inquiry");
  GOLD.set(pairId("K1", a, b), { id: e.id, shape: e.shape, label: e.label });
}
let ek = 0;
for (const e of K2) {
  const ent = (await post("entitycreate", { kind: "fund", label: `Subject ${e.id}`, aliases: [`fund:${7100 + (++ek)}`] })).entity_id;
  if (!ent) throw new Error(`entitycreate for ${e.id} returned no entity_id`);
  const side = async (s, claim) => {
    const inq = `INQ-2026-0071-${e.id}-${s}`, info = `INFO-2026-0071-${e.id}-${s}`;
    await doc(info, `The document ${inq} rests on.`);
    await mustPromote(inq, inquiryMd(inq, { refs: [info], subject: ent, legs: [{ target: info }],
      versions: [{ name: `reading ${s}`, claim, legs: [{ target: info }] }] }), "inquiry");
    return `${inq}|reading ${s}`;
  };
  GOLD.set(pairId("K2", await side("a", e.a), await side("b", e.b)), { id: e.id, shape: e.shape, label: e.label });
}
for (const e of K3) {
  const info = `INFO-2026-0071-${e.id}`;
  await doc(info, e.passage);
  const side = async (s, claim) => {
    const inq = `INQ-2026-0071-${e.id}-${s}`;
    await mustPromote(inq, inquiryMd(inq, { refs: [info], legs: [{ target: info }],
      versions: [{ name: `reading ${s}`, claim, legs: [{ target: info }] }] }), "inquiry");
    return `${inq}|reading ${s}`;
  };
  const id = pairId("K3", await side("a", e.a), await side("b", e.b));
  GOLD.set(id, { id: e.id, shape: e.shape, label: e.label });
  PASSAGE.set(id, e.passage);
}
let k4n = 71000;
for (const e of K4) {
  const key = String(++k4n);
  if (!(await post("entitycreate", { kind: "ordinance", label: `Subject ${e.id}`, aliases: [`ordinance:${key}`] })).entity_id)
    throw new Error(`entitycreate for ${e.id} returned no entity_id`);
  const a = await doc(`INFO-2026-0071-${e.id}-a`, e.a.text, { doctype: e.a.doctype, date: e.a.date, refs: [entRef(key)] });
  const b = await doc(`INFO-2026-0071-${e.id}-b`, e.b.text, { doctype: e.b.doctype, date: e.b.date, refs: [entRef(key)] });
  await mustPromote(`INQ-2026-0071-${e.id}`, inquiryMd(`INQ-2026-0071-${e.id}`, {
    refs: [`INFO-2026-0071-${e.id}-a`, `INFO-2026-0071-${e.id}-b`],
    legs: [{ target: `INFO-2026-0071-${e.id}-a` }, { target: `INFO-2026-0071-${e.id}-b` }] }), "inquiry");
  for (const c of [a, b]) await post("resolve", { captureSha: c });
  GOLD.set(pairId("K4", a, b), { id: e.id, shape: e.shape, label: e.label });
}
const read = await pairsRead();
t("GROUND: the gold map holds one entry per corpus pair — no two entries collapsed onto one identity",
  GOLD.size, ALL.length);
t("THE READ IS BOUNDED AND NOTHING WAS CUT: no key truncated, so every figure below is over the WHOLE corpus",
  KEYS.map((k) => read.keys?.find((x) => x.key === k)?.truncated ?? null), KEYS.map(() => false));

const m = measure({ read, gold: GOLD, sideOf, judge: judgeBaseline, context: contextOf });
for (const k of KEYS)
  t(`${k} COMPARED: every one of ${k}'s gold pairs was FORMED by ${k} over the record — a fixture pair the `
  + `pairing never compared cannot be measured, and this line is what a disabled key fails`,
    [m.per[k].compared, m.per[k].missing], [ALL.filter(([x]) => x === k).length, []]);
t("AND THE PAIRING FORMED NOTHING THE FIXTURE DOES NOT LABEL — the corpus's accounting is the record's",
  KEYS.map((k) => m.per[k].unlabelled.length), [0, 0, 0, 0]);

/* ===== 3. THE MEASUREMENT: the baseline candidate, per key ================ */
console.log("\n--- 3. the baseline candidate's figures (recorded in measurements/M-118.md) ---");
for (const k of [...KEYS, "ALL"]) {
  const x = k === "ALL" ? m.all : m.per[k];
  console.log(`  ${k.padEnd(3)}  compared ${String(x.compared).padStart(2)}  false-conflict ${x.false_conflicts}/${x.negatives} `
    + `(${pct(x.false_conflict_rate)})  recall ${x.correct}/${x.positives} (${pct(x.recall)})  undetermined ${x.undetermined}`);
}
for (const k of KEYS) for (const r of m.per[k].rows)
  console.log(`    ${k} ${r.id.padEnd(11)} gold ${r.gold.padEnd(9)} got ${String(r.got).padEnd(12)} ${r.reason ?? ""}`);
const verdict = gate(m);
console.log(`  THRESHOLD ${THRESHOLD} · gate ${verdict.pass ? "PASS" : "FAIL"} ${verdict.fails.join(" ")}`);
t("THE BASELINE CANDIDATE PASSES THE GATE at the recorded threshold, over the whole corpus",
  [verdict.pass, verdict.fails], [true, []]);
t("every compared pair came back with one of §5's five labels",
  KEYS.every((k) => m.per[k].absent.length === 0), true);

/* ===== 4. THE GATE CAN FAIL, BY NAME — and correct work passes it ========= */
console.log("\n--- 4. the gate itself: always-world fails, disabled fails, an oracle passes ---");
const world = gate(measure({ read, gold: GOLD, sideOf, judge: () => ({ label: "world", reason: "armed" }) }));
t("AN ALWAYS-`world` JUDGEMENT FAILS THE FALSE-CONFLICT GATE BY NAME, on every key and over all — §7: "
+ "a detector that cannot fail this measures nothing",
  [world.pass, ["K1", "K2", "K3", "K4", "ALL"].map((k) => world.fails.includes(`FALSE_CONFLICT:${k}`))],
  [false, [true, true, true, true, true]]);
const off = gate(measure({ read, gold: GOLD, sideOf, judge: () => undefined }));
t("A DISABLED JUDGEMENT FAILS BY NAME (JUDGEMENT_ABSENT on every key) — it has no false conflicts, and "
+ "a gate that read that as strictness would pass a detector that does nothing",
  [off.pass, KEYS.map((k) => off.fails.includes(`JUDGEMENT_ABSENT:${k}`))], [false, [true, true, true, true]]);
/* The oracle needs the pair's identity, so it is driven from the gold rows directly. */
const oracle = gate(measure({ read, gold: GOLD, sideOf: (s, p) => ({ ...sideOf(s), __gold: GOLD.get(pairId(p.key,
  ...[p.a, p.b].map((x) => (x.kind === "claim" ? `${x.inquiry}|${x.version}` : String(x.capture_sha)))))?.label }),
  judge: (i) => ({ label: i.a.__gold, reason: "oracle" }) }));
t("OVER-STRICTNESS OF THE GATE ITSELF: a judgement that gives every pair its GOLD label PASSES — correct "
+ "work in any spelling must get through, or the gate is a fence tighter than its rule",
  [oracle.pass, oracle.fails], [true, []]);
const lenient = measure({ read, gold: GOLD, sideOf, judge: () => ({ label: "precision" }) });
t("AND WHAT THE GATE CANNOT SEE, asserted rather than hidden: an always-`precision` judgement PASSES the "
+ "false-conflict gate with recall 0 — §7 makes recall a figure beside the gate, not the gate, so the "
+ "recall line is what catches it and it must be printed with the rate",
  [gate(lenient).pass, lenient.all.recall], [true, 0]);

console.log(`\ncontradiction-overstrict: ${pass} pass, ${fail} fail`);
} finally {
  await mf.dispose();
}
process.exit(fail ? 1 : 0);

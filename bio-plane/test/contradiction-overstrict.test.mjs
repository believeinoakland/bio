/* NEGATIVE CONTROL: RUN 2026-09-23 (M0-71), SIX arms, all SIX AS DECLARED, via `cd bio-plane && node test/contradiction-overstrict.control.mjs [arm]`; each armed ALONE, restored from a per-arm pristine copy verified by sha256 AND `cmp` with a byte minimum. baseline 19/0. (1) `pairing` — §7 control 1, K2 disabled in store.mjs `contradictionPairs`: 13/6, fails `K2 COMPARED`, keeps `K1 COMPARED` (store.mjs restored 2902978 B, 893a1cc99c3b). (2) `judgement` — §7 control 2, the candidate labels every pair `world`: 18/1, fails `THE BASELINE CANDIDATE PASSES THE GATE` (FALSE_CONFLICT), keeps `K2 COMPARED`. (3) `disabled` — the candidate returns no label: 17/2, fails the same gate line (JUDGEMENT_ABSENT) and the label-vocabulary line, keeps `EMPTY RECORD`. (4) `empty` — §7 control 3, the NOTHING_COMPARED guard removed from the gate: 18/1, fails `EMPTY RECORD: the gate REFUSES`, keeps the baseline gate. (5) `overstrict` — the gate fails a rate EQUAL to the threshold: 16/3, fails `OVER-STRICTNESS OF THE GATE ITSELF`, keeps the always-`world` arm. RUN AGAIN 2026-09-25 (REC-147), TWELVE arms, all TWELVE AS DECLARED, same driver, each armed ALONE and restored by sha256 AND `cmp` (store.mjs 3361399 B 98db0299f03d; contradiction.mjs 6164 B 9a45dea779b9; contradiction-judge-recorded.mjs 16785 B b9d36545e1cb). baseline 51/0; M0-71's six re-run over this suite's sections 5 and 6: pairing 33/15 (reaches its FOOT — section 6's K2 block is GUARDED, where a first draft ended the module on a TypeError and read -1), judgement 50/1, disabled 46/5, empty 50/1, overstrict 45/6. REC-147's six: (7) `twosites` — THE ROW'S CONTROL, a second behaviourally-identical append site written inline in the op: 50/1, fails `§8's ONE APPEND SITE`, keeps the re-run arm. (8) `idempotent` — a nonce in the candidate digest: 46/5, fails `A RE-RUN OVER UNCHANGED REFERENTS WRITES NOTHING NEW`, keeps the one-site arm. (9) `unformed` — the caller's pair taken on its word: 49/2, fails `REFUSED BY NAME — an invented pair`, keeps the first write. (10) `prompt` — one phrase of JUDGEMENT_PROMPT edited: 50/1, fails `THE PROMPT MEASURED IS THE PROMPT SHIPPED`, keeps R2's gate. (11) `recorded` — one false conflict planted in run R1: 49/2, fails `R1: THE MACHINE JUDGEMENT PASSES`, keeps R2's. (12) `abstain` — every recorded answer `precision`: 47/4, fails `R1: AND ITS RECALL IS REPORTED AND BEATS`, KEEPS `R1: THE MACHINE JUDGEMENT PASSES` — the gate passes an abstaining detector and only recall sees it (BOB #32).
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
import { statedJSON } from "./stated.mjs";
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
/* REC-147: the machine judgement, recorded (M-162), and the prompt it answered under. */
import { RUNS, PROMPT_SHA256, recordedJudge } from "./contradiction-judge-recorded.mjs";
import { CONTRADICTION_LABELS, JUDGEMENT_PROMPT, JUDGEMENT_PROMPT_SHA256, renderJudgementInput } from "../src/contradiction.mjs";

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
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
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

/* ===== 5. REC-147: THE MACHINE JUDGEMENT ON THIS GATE, WITH ITS RECALL (M-162) ==
   BOB #32 (2026-09-24, on the row): the run REPORTS recall beside false conflicts, because the gate alone cannot
   see a detector that abstains (section 4's last line proves it cannot), and a judgement whose recall does not
   beat the lexical baseline's is the finding, returned to BOB. So both are asserted here, per recorded run. */
console.log("\n--- 5. REC-147: the machine judgement, as recorded (measurements/M-162.md) ---");
t("THE PROMPT MEASURED IS THE PROMPT SHIPPED: sha256(JUDGEMENT_PROMPT) equals the pinned digest and the digest the "
+ "recording was made under — an edited prompt is a detector that never passed this gate",
  [sha(JUDGEMENT_PROMPT) === JUDGEMENT_PROMPT_SHA256, JUDGEMENT_PROMPT_SHA256 === PROMPT_SHA256], [true, true]);
t("ONE VOCABULARY: the labels the op refuses outside of are the labels this gate scores, in §5's order",
  [...CONTRADICTION_LABELS], LABELS);
/* The run's input is rendered from what the PAIRING formed, in the harness's own terms (sideOf/contextOf). */
const formedInputs = read.pairs.filter((p) => GOLD.has(pairId(p.key, ...[p.a, p.b].map((s) => (s.kind === "claim"
  ? `${s.inquiry}|${s.version}` : String(s.capture_sha))))))
  .map((p) => ({ key: p.key, context: contextOf(p), a: sideOf(p.a), b: sideOf(p.b) }));
const rendered = renderJudgementInput(formedInputs);
t("§5's FENCE ON WHAT THE MACHINE SEES: the rendered input carries every formed pair and NO gold label or fixture "
+ "id — a label shown to the judge would make every figure below free",
  [formedInputs.length, (rendered.match(/^PAIR \d+ · key K\d$/gm) || []).length,
   [...GOLD.values()].some((g) => rendered.includes(g.id) || rendered.includes(g.shape))],
  [ALL.length, ALL.length, false]);
const baseAll = m.all;
for (const r of RUNS) {
  const mm = measure({ read, gold: GOLD, sideOf, judge: recordedJudge(r.id), context: contextOf });
  for (const k of [...KEYS, "ALL"]) {
    const x = k === "ALL" ? mm.all : mm.per[k];
    console.log(`  ${r.id} ${k.padEnd(3)}  compared ${String(x.compared).padStart(2)}  false-conflict ${x.false_conflicts}/${x.negatives} `
      + `(${pct(x.false_conflict_rate)})  recall ${x.correct}/${x.positives} (${pct(x.recall)})  undetermined ${x.undetermined}`);
  }
  const v = gate(mm);
  console.log(`  ${r.id} THRESHOLD ${THRESHOLD} · gate ${v.pass ? "PASS" : "FAIL"} ${v.fails.join(" ")}`);
  t(`${r.id}: THE MACHINE JUDGEMENT PASSES M0-71's GATE at the recorded threshold, every pair answered`,
    [v.pass, v.fails], [true, []]);
  t(`${r.id}: AND ITS RECALL IS REPORTED AND BEATS THE LEXICAL BASELINE's (${baseAll.correct}/${baseAll.positives}) — `
  + `BOB #32: a judgement that does not is the finding`,
    [mm.all.positives === baseAll.positives, mm.all.correct > baseAll.correct], [true, true]);
}

/* ===== 6. REC-147: THE CANDIDATE TABLE, THROUGH THE OP (§8) =================
   The measured judgement's answers go in through op=contradictionpropose, the ONE append site, over the pairs
   the pairing formed. Asserted THROUGH THE OP: every row names both referents and versions, the key, the run,
   the label and the reason; a re-run over unchanged referents writes nothing; a changed side is a new row and the
   old one stays; and the door refuses by name what is not a proposal over a formed pair. */
console.log("\n--- 6. REC-147: candidates through op=contradictionpropose (§8) ---");
const RUN147 = "RUN-2026-0925-contradiction";
const opened = await post("airunopen", {
  run: RUN147, contextType: "inquiry", contextId: `INQ-2026-0071-${K1[0].id}`, label: "contradiction judgement",
  mode: "check", principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null, leaseMs: 600000, at: LATER });
t("GROUND: the judgement's run opens (DEC-62's object; this item adds no second one)",
  [opened.started ?? null, opened.status ?? null], [true, "running"]);
const judgeR1 = recordedJudge("R1");
const propFor = (p) => { const o = judgeR1({ key: p.key, a: sideOf(p.a), b: sideOf(p.b) });
  return { key: p.key, a: p.a, b: p.b, label: o?.label, reason: o?.reason }; };
const gold147 = read.pairs.filter((p) => GOLD.has(pairId(p.key, ...[p.a, p.b].map((x) => (x.kind === "claim"
  ? `${x.inquiry}|${x.version}` : String(x.capture_sha))))));
const proposeAll = await post("contradictionpropose", { run: RUN147, proposals: gold147.map(propFor), at: LATER });
t("THE RECORDED JUDGEMENT ENTERS AS CANDIDATES: one row per formed pair, all written, none unchanged",
  [proposeAll.ok, proposeAll.proposed, proposeAll.written, proposeAll.unchanged], [true, ALL.length, ALL.length, 0]);
const rowsOk = (proposeAll.candidates ?? []).every((c) => c.new === true && KEYS.includes(c.key)
  && c.a_ref && c.a_version && c.b_ref && c.b_version && c.a_kind && c.b_kind && c.run === RUN147
  && LABELS.includes(c.label) && typeof c.reason === "string" && c.reason.length > 0
  && c.state === "proposed" && c.origin === "machine" && typeof c.proposed_by === "string" && c.proposed_by.length > 0);
t("EVERY ROW NAMES BOTH REFERENTS AND THEIR VERSIONS, THE KEY, THE RUN, THE LABEL AND ITS REASON, is state "
+ "`proposed` and labelled MACHINE work, and carries a server-stamped proposer (§8, DEC-24)",
  [(proposeAll.candidates ?? []).length, rowsOk], [ALL.length, true]);
t("THE LABELS WRITTEN ARE THE JUDGEMENT's, pair for pair — 9 conflicts proposed, 17 not",
  (proposeAll.candidates ?? []).filter((c) => c.label === "world" || c.label === "record").length, 9);
t("A CLAIM SIDE IS VERSIONED BY THE CLAIM IT COMPARED (sha256 of the text), a leg or extent side BY ITS CAPTURE",
  (proposeAll.candidates ?? []).filter((c) => c.a_kind === "claim").every((c) => /^[0-9a-f]{64}$/.test(c.a_version))
  && (proposeAll.candidates ?? []).filter((c) => c.a_kind !== "claim").every((c) => /^[0-9a-f]{64}$/.test(c.a_version)),
  true);
const again = await post("contradictionpropose", { run: RUN147, proposals: gold147.map(propFor), at: LATER });
t("A RE-RUN OVER UNCHANGED REFERENTS WRITES NOTHING NEW — §8: the same two referents at the same versions",
  [again.ok, again.written, again.unchanged, (again.candidates ?? []).every((c) => c.new === false)],
  [true, 0, ALL.length, true]);
const flipped = await post("contradictionpropose", { run: RUN147, at: LATER,
  proposals: gold147.slice(0, 1).map((p) => ({ ...propFor(p), label: "undetermined", reason: "a later run said otherwise" })) });
t("AND A DIFFERENT LABEL OVER THE SAME REFERENTS IS NOT A NEW CANDIDATE — the row is about the two things, and "
+ "the first proposal stands exactly as it was written",
  [flipped.written, flipped.candidates?.[0]?.label === proposeAll.candidates?.[0]?.label], [0, true]);
/* §8's ONE APPEND SITE, held STRUCTURALLY over every source the plane RUNS: exactly one statement inserts into the
   candidate table, and it is inside `#appendContradictionCandidate`; nothing updates a candidate; only purge deletes
   one (its two arms). Any spelling of an insert counts (OR IGNORE, OR REPLACE, REPLACE INTO, any case).
   THE FILE LIST IS THE BUNDLE MANIFEST'S first-party inputs (dist/bio-plane.bundle.json), not a directory walk: it is
   exactly what ships, and FL-10's guard fails a manifest that is stale against the sources, so a second site in a new
   file cannot be missed by this list without that guard going red first. WHAT IT CANNOT SEE: an insert built by
   string concatenation that never spells the table name next to INTO — none exists in this plane today. */
{
  const planeRoot = fileURLToPath(new URL("../", import.meta.url));
  const manifest = JSON.parse(readFileSync(planeRoot + "dist/bio-plane.bundle.json", "utf8"));
  const files = (manifest.inputs ?? []).map((x) => x.path).filter((f) => f.endsWith(".mjs"));
  const hits = (re) => files.flatMap((f) => [...readFileSync(planeRoot + f, "latin1").matchAll(re)].map((m) => ({ f, i: m.index })));
  const inserts = hits(/\b(?:INSERT(?:\s+OR\s+\w+)?|REPLACE)\s+INTO\s+contradiction_candidates\b/gi);
  const storeSrc = readFileSync(planeRoot + "src/store.mjs", "latin1");
  const siteAt = storeSrc.indexOf("  #appendContradictionCandidate(row) {");
  const siteEnd = storeSrc.indexOf("\n  }\n", siteAt);
  const inSite = inserts.filter((h) => h.f === "src/store.mjs" && h.i > siteAt && h.i < siteEnd).length;
  console.log(`  append sites: ${inserts.length} over ${files.length} bundled source files; inside the one site: ${inSite}`);
  t("§8's ONE APPEND SITE: exactly one insert into contradiction_candidates in the plane's bundled sources, and it "
  + "is inside #appendContradictionCandidate",
    [files.includes("src/store.mjs") && files.length > 20, inserts.length, inSite], [true, 1, 1]);
  t("APPEND-ONLY: nothing updates a candidate, and only purge's two arms delete one",
    [hits(/\bUPDATE\s+contradiction_candidates\b/gi).length, hits(/\bDELETE\s+FROM\s+contradiction_candidates\b/gi).length],
    [0, 2]);
}
/* GUARDED so a disabled K2 (the `pairing` control arm) FAILS here BY NAME and the suite still reaches its foot,
   rather than a TypeError ending the module with no tally (kickoffs/WORKER.md). */
const k2pair = gold147.find((p) => p.key === "K2");
t("GROUND: a K2 pair was formed, so a claim can be restated beside it", !!k2pair, true);
if (k2pair) {
  const k2e = K2[0];
  const k2inq = `INQ-2026-0071-${k2e.id}-a`, k2info = `INFO-2026-0071-${k2e.id}-a`;
  const k2ent = read.pairs.find((p) => p.key === "K2" && [p.a.inquiry, p.b.inquiry].includes(k2inq))?.subject_entity;
  await mustPromote(k2inq, inquiryMd(k2inq, { refs: [k2info], subject: k2ent, legs: [{ target: k2info }],
    versions: [{ name: "reading a", claim: k2e.a, legs: [{ target: k2info }] },
               { name: "reading a2", claim: `${k2e.a} Restated.`, legs: [{ target: k2info }] }] }), "inquiry");
  const read2 = await pairsRead();
  const moved = read2.pairs.filter((p) => p.key === "K2"
    && [p.a, p.b].some((x) => x.inquiry === k2inq && x.version === "reading a2"));
  const changed = await post("contradictionpropose", { run: RUN147, at: LATER,
    proposals: moved.map((p) => ({ key: p.key, a: p.a, b: p.b, label: "record", reason: "restated claim, judged again" })) });
  const before147 = new Set((proposeAll.candidates ?? []).map((c) => c.candidate));
  t("A CHANGED SIDE IS A NEW CANDIDATE, and the one over the old reading is NOT rewritten (§8: a candidate is a "
  + "statement about two things as they were)",
    [moved.length >= 1, changed.ok, changed.written === moved.length,
     (changed.candidates ?? []).every((c) => !before147.has(c.candidate))], [true, true, true, true]);
  const oldStill = await post("contradictionpropose", { run: RUN147, at: LATER, proposals: gold147.map(propFor) });
  t("AND THE OLD PAIR, still formed over the old reading, is still one row: nothing new",
    [oldStill.written, oldStill.unchanged], [0, ALL.length]);
  const forged = { ...propFor(k2pair), a: { ...k2pair.a, claim: `${k2pair.a.claim} (not what the record holds)` } };
  const stale = await post("contradictionpropose", { run: RUN147, at: LATER, proposals: [forged] });
  t("A PROPOSAL OVER TEXT THE RECORD DOES NOT HOLD IS REFUSED BY NAME: a claim side carries the text it judged, and "
  + "a label about other text is not written against this reading",
    [stale.ok, stale.code, stale.check], [false, "CANDIDATE_PAIR_NOT_FORMED", "C-93.7"]);
}
/* THE DOOR'S REFUSALS, each by its C-93 name, each leaving nothing behind. */
const one = gold147.slice(1, 2).map(propFor);
const refusals = [
  ["no run named", { run: "RUN-nope", proposals: one }, "CANDIDATE_NO_RUN", "C-93.2"],
  ["no proposals", { run: RUN147, proposals: [] }, "CANDIDATE_NO_PROPOSALS", "C-93.4"],
  ["a sixth label", { run: RUN147, proposals: [{ ...one[0], label: "contradiction" }] }, "CANDIDATE_LABEL_UNKNOWN", "C-93.5"],
  ["no reason", { run: RUN147, proposals: [{ ...one[0], reason: "  " }] }, "CANDIDATE_NO_REASON", "C-93.6"],
  ["an invented pair", { run: RUN147, proposals: [{ ...one[0], key: one[0].key === "K1" ? "K4" : "K1" }] }, "CANDIDATE_PAIR_NOT_FORMED", "C-93.7"],
];
for (const [what, body, code, check] of refusals) {
  const r = await post("contradictionpropose", body);
  t(`REFUSED BY NAME — ${what}: ${code} (${check}), with a canned translation`,
    [r.ok, r.code, r.check, (r.translation ?? "").length > 60], [false, code, check, true]);
}
/* C-93.1 CANNOT BE REACHED THROUGH THE CONTROL PLANE, which always stamps the proposer; that is the point of the
   stamp. So it is driven at the Durable Object directly, the one route that can arrive without it, to prove the
   store fails CLOSED rather than writing an unattributed proposal. */
{
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const bare = await (await obj.fetch("http://do/contradictionpropose",
    { method: "POST", body: JSON.stringify({ run: RUN147, proposals: one }) })).json();
  const r = rP(bare);
  t("REFUSED BY NAME — no proposer stamped (the Durable Object reached directly): CANDIDATE_NO_PROPOSER (C-93.1)",
    [r.ok, r.code, r.check], [false, "CANDIDATE_NO_PROPOSER", "C-93.1"]);
}
const batch = await post("contradictionpropose", { run: RUN147,
  proposals: [...gold147.slice(2, 3).map((p) => ({ ...propFor(p), reason: "fresh" })), { ...one[0], label: "nope" }] });
const after = await post("contradictionpropose", { run: RUN147, proposals: gold147.map(propFor), at: LATER });
t("A BATCH WITH ONE BAD PROPOSAL WRITES NONE OF IT — every proposal is checked before anything is written",
  [batch.code, after.written], ["CANDIDATE_LABEL_UNKNOWN", 0]);
/* A CALLER WHO DOES NOT HOLD THE RUN proposes nothing under it: REC-152's principal gate, relayed with its own code. */
const addIra = await post("memberadd", { memberId: "ira147", cover: "cover for ira147", role: "admin",
                                          capabilities: ["contribute", "create_projects"] });
await post("enroll", { invite: addIra.invite, handle: "ira147", password: "ira147-passphrase-1" });
const iraTok = (await post("login", { role: "member:ira147", password: "ira147-passphrase-1" })).token;
const notMine = rP(await (await mf.dispatchFetch(`http://x/api/?op=contradictionpropose&token=${iraTok}`,
  { method: "POST", body: JSON.stringify({ run: RUN147, proposals: gold147.slice(3, 4).map((p) => ({ ...propFor(p), reason: "not my run" })) }) })).json());
t("A CALLER WHO DOES NOT HOLD THE RUN IS REFUSED (REC-152's gate), and nothing is written",
  [typeof iraTok, notMine.ok, notMine.code,
   (await post("contradictionpropose", { run: RUN147, proposals: gold147.map(propFor), at: LATER })).written],
  ["string", false, "AI_RUN_NOT_PRINCIPAL", 0]);
const closedRun = await post("airunclose", { run: RUN147, bound: "completed", at: LATER });
t("GROUND: the run ends", closedRun.terminated, true);
const closed = await post("contradictionpropose", { run: RUN147, proposals: one });
t("AN ENDED RUN PROPOSES NOTHING: CANDIDATE_RUN_NOT_RUNNING (C-93.3)",
  [closed.ok, closed.code, closed.check], [false, "CANDIDATE_RUN_NOT_RUNNING", "C-93.3"]);

console.log(`\ncontradiction-overstrict: ${pass} pass, ${fail} fail`);
} finally {
  await mf.dispose();
}
process.exit(fail ? 1 : 0);

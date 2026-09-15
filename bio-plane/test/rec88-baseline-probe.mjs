/* REC-88 — THE OVER-STRICTNESS PIN'S INSTRUMENT, and `rec83-baseline-probe.mjs`'s
 * shape exactly, for its reason: a literal typed into a suite by the person who
 * wrote the code agrees with that code for free.
 *
 * WHAT IT MEASURES. Three documents, side by side, through `op=earnedbasis`:
 *
 *   PLAIN  — captured, READ, and the reading carries NO transcription chain at
 *            all: publisher-typed text, nothing derived. THE OVER-STRICTNESS
 *            CASE. Its `earned.capture` entry must be BYTE-IDENTICAL on the
 *            pristine pre-item tree and on the post-item tree, digest included.
 *            A capture-axis change that moved this one would be moving a
 *            document whose text no machine ever touched.
 *   OCR    — the same fixture `content-reads.test.mjs` uses: a three-page
 *            scoped chain, tesseract 5.3.4, measured at C. THE ITEM'S CASE.
 *            The pristine tree answers B (the overclaim D-349 named); the
 *            post-item tree answers C (the weakest link). The two digests MUST
 *            DIFFER, and a run that shows them equal means the bound is not
 *            being asked.
 *   UNMEAS — a transcription with NO measured fidelity on any step. The
 *            UNDETERMINED case. The pristine tree answers B; the post-item tree
 *            answers a null grade with the empty level NAMED.
 *
 * HOW TO RE-DERIVE (the whole operating manual):
 *
 *     git worktree add <pristine> <the commit before this item>
 *     ( cd <pristine>/bio-plane && npm ci )
 *     cd bio-plane
 *     node test/rec88-baseline-probe.mjs <pristine>/bio-plane/src/index.mjs
 *     node test/rec88-baseline-probe.mjs            # this tree
 *
 * NOT A SUITE — named `*-probe.mjs` so the battery does not discover it. It
 * needs a second checkout to mean anything, and run against its own tree it
 * would be the free agreement above.
 *
 * THE FIXTURE IS A SECOND COPY OF THE SUITE'S SETUP, deliberately: the pristine
 * tree cannot import a file this item added. What is copied is the SETUP, never
 * the assertion — a setup that drifted shows up as a DIFFERENCE, not as a false
 * agreement. */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = process.argv[2] || fileURLToPath(new URL("../src/index.mjs", import.meta.url));
console.log(`REC-88 baseline probe — source: ${IDX}`);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r88", MEMBER_TOKEN: "mem-r88", PROBE_TOKEN: "prb-r88",
              AI_TOKEN: "ai-r88", VERSION: "test" },
});

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r88") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r88") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-09-14T00:00:00Z";
const LATER = "2026-09-14T01:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`])]
  : [];

const inquiryMd = (id, { subject = null, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(subject ? [`subject_entity: ${subject}`] : []),
  ...legLines(legs),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
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
const promote = async (id, text, type, { register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260914T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};

const scopedChain = (pages, cap = "C") => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" },
    extent: { kind: "pages", pages } },
];
/* An OCR pass that names NO measured fidelity — the undetermined case. `cap` is
   simply absent, which is the shape a chain written before any calibration
   existed has and is exactly what `derivationCap` answers null for. */
const unmeasuredChain = () => [
  { step: "pixels" },
  { step: "ocr", engine: "moondream", version: "2b", confidence: { basis: "none" } },
];

const readingOf = (captureSha, chain, entities = []) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
             at: NOW, entities, facts: {},
             ...(chain === undefined ? {} : { text_source: chain }) } });

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] });
const ORD = eOrd.entity_id;
const ENT = [{ ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680" }];

const CASES = [
  { name: "PLAIN ", id: "INFO-2026-8800-plain", seed: "rec88-publisher-typed", chain: undefined },
  { name: "OCR   ", id: "INFO-2026-8800-paged", seed: "rec88-doc-with-a-page-set", chain: scopedChain([0, 1, 2]) },
  { name: "UNMEAS", id: "INFO-2026-8800-unmeasured", seed: "rec88-unmeasured", chain: unmeasuredChain() },
];

for (const c of CASES) {
  c.sha = sha(c.seed);
  await promote(c.id, infoMd(c.id), "information", {
    reading: readingOf(c.sha, c.chain, ENT),
    register: [{ path: `snapshots/${c.id}.bin`, sha256: c.sha, encoding: "binary", bytes: 10 }] });
  await post("resolve", { captureSha: c.sha });
}

/* ONE WHOLE-DOCUMENT LEG PER CASE, all in one inquiry so one read answers for
   all three and the three entries are produced by the same call. */
const INQ = "INQ-2026-8800-probe";
await promote(INQ, inquiryMd(INQ, { subject: ORD, refs: CASES.map((c) => c.id),
  legs: CASES.map((c) => ({ target: c.id })) }), "inquiry");

const eb = await get("earnedbasis", `id=${INQ}`);
if (eb.ok === false) throw new Error(`earnedbasis: ${JSON.stringify(eb).slice(0, 500)}`);

console.log("\nENTITY  " + ORD);
console.log("EARNED KEYS  " + JSON.stringify(Object.keys(eb.earned).sort()));
for (const c of CASES) {
  const entry = eb.earned.capture[c.id];
  console.log(`\n${c.name} CAPTURE[${c.id}]\n` + JSON.stringify(entry, null, 2));
  console.log(`${c.name} DIGEST  ` + sha(JSON.stringify(entry)));
}
/* Printed as one line so two runs can be diffed without reading three objects. */
console.log("\nDIGESTS  " + CASES.map((c) => `${c.name.trim()}=${sha(JSON.stringify(eb.earned.capture[c.id]))}`).join("  "));

await mf.dispose();
process.exit(0);

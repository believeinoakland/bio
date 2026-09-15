/* REC-88 — THE RESIDUAL, VERIFIED RATHER THAN ASSERTED.
 *
 * "A BLOCKER IS A CLAIM, AND NOTHING HERE AUDITS ONE" (CLAUDE.md). This item is
 * about to write a debt row saying that `op=inquirystrength`'s ordinary walk
 * reports a leg's AUTHORED capture letter from the stored `inquiry_basis.grade`
 * column rather than the bound, so a leg written before this landing keeps
 * reporting the stronger letter there. That is a claim about code, and it gets
 * driven before it is written down.
 *
 * THE SHAPE, and it is a real one rather than a contrivance: a document is
 * captured and READ WITH NO TRANSCRIPTION CHAIN, a member writes a leg on it at
 * capture grade B (legal — publisher-typed text earns the ceiling), and the
 * document is LATER RE-READ with an OCR chain measured at C. The stored letter
 * is now B and the bound is now C. Nothing rewrites the stored letter, by
 * design: a leg is a member's authored statement and the record is append-only.
 *
 * WHAT IT PRINTS: what each surface says about that leg — `op=earnedbasis`
 * (the registry), and `op=inquirystrength` (the derived pair). If they agree
 * there is no residual and the debt row must not be written.
 *
 * Run: `node test/rec88-residual-probe.mjs` from `bio-plane/`. NOT a suite. */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = process.argv[2] || fileURLToPath(new URL("../src/index.mjs", import.meta.url));
console.log(`REC-88 residual probe — source: ${IDX}`);
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

const NOW = "2026-09-15T00:00:00Z", LATER = "2026-09-15T01:00:00Z";
const refLines = (t) => t.length
  ? ["references:", ...t.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: supports`,
      ...(l.grade ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : [])])]
  : [];
const inquiryMd = (id, { subject = null, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(subject ? [`subject_entity: ${subject}`] : []), ...legLines(legs),
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
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260915T${String(400000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] });
const ORD = eOrd.entity_id;
const ENT = [{ ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680" }];
const readingOf = (s, chain) => ({
  capture: { sha256: s, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
             entities: ENT, facts: {}, ...(chain === undefined ? {} : { text_source: chain }) } });

const DOC = "INFO-2026-8801-later-ocrd";
const SHA_D = sha("rec88-residual-doc");
const REG = [{ path: "snapshots/r.bin", sha256: SHA_D, encoding: "binary", bytes: 10 }];

/* 1. captured and read with NO chain — publisher-typed, earns the ceiling. */
await promote(DOC, infoMd(DOC), "information", { reading: readingOf(SHA_D, undefined), register: REG });
await post("resolve", { captureSha: SHA_D });
const before = await get("earnedbasis", `id=INQ-x&targets=${DOC}`);
console.log(`\n1. before any transcription, earned.capture = ` +
  JSON.stringify(before && before.earned ? (before.earned.capture || {})[DOC] : before));

/* 2. a member writes a leg at B. LEGAL TODAY and legal before this item. */
const INQ = "INQ-2026-8801-residual";
const w = await promote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC],
  legs: [{ target: DOC, grade: "B", axis: "capture", source: "capture" }] }), "inquiry");
console.log(`2. the leg at capture grade B LANDED: ${w.ok !== false}`);

/* 3. the document is RE-READ, now with an OCR chain measured at C. */
await promote(DOC, infoMd(DOC), "information", {
  reading: readingOf(SHA_D, [{ step: "pixels" },
    { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }]),
  register: REG });
const after = await get("earnedbasis", `id=${INQ}`);
const cap = after.earned.capture[DOC];
console.log(`3. after the re-read, op=earnedbasis says grade=${JSON.stringify(cap.grade)}`
  + ` bounded_by=${JSON.stringify(cap.bounded_by)}`);

/* 4. what the DERIVED PAIR says — the read a member actually looks at. */
const st = await get("inquirystrength", `id=${INQ}`);
console.log(`4. op=inquirystrength ->\n${JSON.stringify(st, null, 2).slice(0, 2600)}`);

/* 5. and what the raw projection holds. */
const basis = await get("list", `id=${INQ}`);
console.log(`5. op=list (for orientation only) ok=${basis && basis.ok}`);

console.log(`\nVERDICT  the registry says ${JSON.stringify(cap.grade)};`
  + ` compare it against the CAPTURE axis reported by op=inquirystrength above.`
  + ` If they differ, the residual is REAL and the debt row is owed. If they agree, it is NOT.`);
await mf.dispose();
process.exit(0);

/* REC-83 — THE OVER-STRICTNESS PIN'S INSTRUMENT, kept beside the suite so the
 * pin is RE-DERIVABLE rather than remembered.
 *
 * WHY IT EXISTS. `content-reads.test.mjs` asserts that a whole-document leg's
 * earned basis is byte-identical to what `op=earnedbasis` answered BEFORE this
 * item. A literal typed into the suite by the person who wrote the code agrees
 * with that code for free — "an equality that costs nothing to produce is not
 * evidence", measured five times in this estate, including a complete hand copy
 * of 131 op names that passed. So the literal in the suite is a PRINTOUT of
 * this script run against a PRISTINE PRE-ITEM SOURCE TREE.
 *
 * HOW TO RE-DERIVE IT (and this is the whole operating manual):
 *
 *     git worktree add /tmp/pristine <the commit before this item>
 *     ( cd /tmp/pristine/bio-plane && npm ci )
 *     cd bio-plane
 *     node test/rec83-baseline-probe.mjs /tmp/pristine/bio-plane/src/index.mjs
 *     node test/rec83-baseline-probe.mjs            # this tree, for comparison
 *
 * The two printouts must be IDENTICAL for the `earned` object. If they are not,
 * this item changed what a whole-document leg earns, which it must not.
 *
 * NOT A SUITE. It is named `*-probe.mjs` so the battery does not discover it:
 * it needs a second checkout to be meaningful and would be measuring its own
 * tree against itself otherwise — which is exactly the free agreement above.
 *
 * THE FIXTURE IS A SECOND COPY OF THE SUITE'S GROUND, DELIBERATELY AND SAID SO.
 * It has to be: the pristine tree cannot import a file this item added. What is
 * copied is the SETUP, never the assertion — the assertion is the comparison of
 * the two printouts, and a setup that drifted would show up as a difference
 * rather than as a false agreement. */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = process.argv[2] || fileURLToPath(new URL("../src/index.mjs", import.meta.url));
console.log(`REC-83 baseline probe — source: ${IDX}`);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r83", MEMBER_TOKEN: "mem-r83", PROBE_TOKEN: "prb-r83",
              AI_TOKEN: "ai-r83", VERSION: "test" },
});

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r83") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r83") => rP(await (await mf.dispatchFetch(
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

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] });
const ORD = eOrd.entity_id;

const SHA_DOC = sha("rec83-doc-with-a-page-set");
const DOC = "INFO-2026-8300-paged";
await promote(DOC, infoMd(DOC), "information", {
  reading: { capture: { sha256: SHA_DOC, encoding: "binary", bytes: 10 },
             reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
                        entities: [{ ref: "ordinance:24680", kind: "ordinance", key: "24680",
                                     label: "Ordinance No. 24680" }],
                        facts: {}, text_source: scopedChain([0, 1, 2]) } },
  register: [{ path: "snapshots/d.bin", sha256: SHA_DOC, encoding: "binary", bytes: 10 }] });
await post("resolve", { captureSha: SHA_DOC });

/* ONE WHOLE-DOCUMENT LEG — the case the over-strictness arm is about. */
const INQ = "INQ-2026-8300-probe";
await promote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC], legs: [{ target: DOC }] }), "inquiry");

const eb = await get("earnedbasis", `id=${INQ}`);
const conn = { ...(eb.earned.connection[DOC] || {}) };
delete conn.capture_sha;   /* the fixture's own sha, not a claim about grade */

console.log("\nENTITY  " + ORD);
console.log("TOP-LEVEL KEYS  " + JSON.stringify(Object.keys(eb).sort()));
console.log("EARNED KEYS     " + JSON.stringify(Object.keys(eb.earned).sort()));
console.log("\nCONNECTION[doc] (capture_sha removed)\n" + JSON.stringify(conn, null, 2));
console.log("\nCAPTURE[doc]\n" + JSON.stringify(eb.earned.capture[DOC], null, 2));
console.log("\nDIGEST  connection=" + sha(JSON.stringify(conn))
          + "\n        capture=" + sha(JSON.stringify(eb.earned.capture[DOC])));

await mf.dispose();
process.exit(0);

/* REC-97 — THE OVER-STRICTNESS INSTRUMENT, AND IT IS A NON-SUITE ON PURPOSE.
 *
 * The item's accepts-when asks for a digest pin against a PRISTINE-TREE
 * measurement: a cite that names no part must write the same bytes after this
 * item as before it. That figure cannot be taken inside the suite that asserts
 * it, because the suite does not exist on the pristine tree. So this file is
 * SELF-CONTAINED — it imports nothing this item added — and is copied into a
 * scratch worktree of `origin/main`, run there, and run again here; the two
 * figures are compared, and the pristine one is pinned in
 * `test/cite-extent.test.mjs` section 8 so it is re-measured on every run.
 *
 * It has NO `.test.mjs` suffix so the battery does not collect it (REC-85's
 * `rec85-arm-digest.mjs` precedent).
 *
 * THE TWO TIMESTAMPS ARE NORMALISED and nothing else is. `cite` writes
 * `last_updated` and a Session Log heading from `new Date()`, which are the only
 * bytes that legitimately differ between two runs of the same act; normalising
 * anything more would be a digest that agrees for free, which is not evidence.
 *
 *     cd bio-plane && node test/rec97-noextent-digest.mjs
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r97", MEMBER_TOKEN: "mem-r97", PROBE_TOKEN: "prb-r97", VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r97") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r97") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const DOC = "INFO-2026-9700-alpha";
const INQ = "INQ-2026-9700-again";

const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
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
const promote = async (id, text, type, reading = null) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260914T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 500)}`);
  return r;
};

await promote(DOC, infoMd(DOC), "information", {
  capture: { sha256: sha(`rec97-${DOC}`), encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
             entities: [], facts: {},
             text_source: [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
                           { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C",
                             confidence: { basis: "none" },
                             extent: { kind: "pages", pages: [0, 1, 2] } }] } });
await promote(INQ, inquiryMd(INQ), "inquiry");

const sel = await post("select", { ids: [DOC] });
if (!sel.handle) throw new Error(`select: ${JSON.stringify(sel)}`);
const r = await get("cite", `project=${INQ}&handle=${sel.handle}&role=supports&note=a plain cite`);
if (r.ok !== true) throw new Error(`cite: ${JSON.stringify(r).slice(0, 500)}`);

const md = (await get("image", `id=${INQ}`))["bundle.md"];
/* THREE VALUES ARE NORMALISED AND NOTHING ELSE IS, and the third was found by
   this instrument rather than predicted: the Session Log entry names the
   SELECTION HANDLE, which is minted at random per run and is not a property of
   the act. The first measurement differed between the two trees at exactly that
   line with the byte counts EQUAL — which is what said the difference could not
   be this item's. Normalising a value neither tree controls is the difference
   between a pin on the act and a pin on a random number; normalising anything
   MORE would be a digest that agrees for free. */
const normalised = md.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g, "<WHEN>")
                     .replace(/sel-[0-9a-f]+/g, "<SEL>");
console.log(`NOEXTENT-BYTES ${normalised.length}`);
console.log(`NOEXTENT-DOC-SHA256 ${sha(normalised)}`);
await mf.dispose();
if (process.env.REC97_DUMP) console.log("----BEGIN----\n" + normalised + "\n----END----");

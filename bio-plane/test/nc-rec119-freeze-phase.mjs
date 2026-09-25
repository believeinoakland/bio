/* REC-119 · ARM (b)'s SCENARIO — ONE PHASE OF THE TWO-PHASE FREEZE CONTROL.
 *
 * WHY THIS IS TWO PROCESSES AND NOT TWO BLOCKS, AND IT IS THE WHOLE POINT OF THE ARM.
 * Capping `inquiry_basis_versions.composition` cannot be caught by any suite running under ONE
 * code version, because a builder that caps is SELF-CONSISTENT: it writes the capped bytes and it
 * re-computes the capped bytes, so `prior.composition === v.composition` holds and the freeze is
 * silent. The damage appears only ACROSS the change — a version frozen BEFORE it, re-promoted
 * AFTER — which is precisely the case a member hits and no in-process arm can reach.
 *
 * So phase A runs against PRISTINE code and writes the version; the driver then arms the patch;
 * phase B runs against PATCHED code over THE SAME PERSISTED STORE and re-promotes the identical
 * document. If the frozen bytes moved, the freeze refuses with VERSION_FROZEN and an old case has
 * become unratifiable.
 *
 * argv[2] = "a" | "b" (the phase), argv[3] = persist root.
 */
import "./stdio.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { anchorTable } from "../scripts/anchortable.mjs";

/* M0-197: this file is a SCENARIO PHASE, not a driver — it quotes and patches no source. Its arm's anchor is in
   nc-rec119.mjs, which arms between the phases; tools/anchordrift.mjs reads it there. A no-op outside the dry read. */
anchorTable([{ arm: "b", none: "a scenario phase nc-rec119.mjs spawns; it patches nothing — arm (b)'s anchor is nc-rec119.mjs's" }]);

const PHASE = process.argv[2], PERSIST = process.argv[3];
if (!["a", "b"].includes(PHASE) || !PERSIST) {
  console.log("usage: node test/nc-rec119-freeze-phase.mjs <a|b> <persist-root>");
  process.exit(2);
}
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  defaultPersistRoot: PERSIST,
  bindings: { ADMIN_TOKEN: "adm-nc", MEMBER_TOKEN: "mem-nc", PROBE_TOKEN: "prb-nc",
              AI_TOKEN: "ai-nc", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-nc") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-nc") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-09-17T00:00:00Z", LATER = "2026-09-17T01:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`] : v === undefined ? []
  : typeof v === "boolean" ? [`    ${k}: ${v}`] : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ["  - name: \"" + v.name + "\"",
    ...scalar("description", v.description), ...scalar("relationship", v.relationship),
    ...scalar("state", "suggested"), ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("author", "ruth"), ...scalar("at", NOW)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ["  - version: \"" + v.name + "\"", ...scalar("ground", g.ground),
     ...scalar("asserted_by", "ruth"), ...scalar("at", NOW),
     ...scalar("statement", g.statement)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ["  - version: \"" + v.name + "\"", ...scalar("target", l.target),
     ...scalar("role", "supports"), ...scalar("ground", l.ground),
     ...scalar("grade", l.grade), ...scalar("grade_axis", l.grade_axis),
     ...scalar("grade_source", l.grade_source), ...scalar("date", NOW)].join("\n")));
  return ["basis_versions:", ...rows, "basis_version_grounds:", ...grounds,
          "basis_version_legs:", ...legs];
};
const refLines = (t2) => ["references:",
  ...t2.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])];
const inquiryMd = (id, subject, refs, versions) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  `subject_entity: ${subject}`, ...versionLines(versions),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
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

const DOC = "INFO-2026-9911-transcribed", INQ = "INQ-2026-9911-freeze", VNAME = "reading-one";
const S1 = sha("rec119-freeze-a");
let snapSeq = PHASE === "a" ? 0 : 500;
const promote = async (id, text, type, base, { register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) { const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }); }
  return post("promote", { bundleId: id, base,
    snapKey: `20260917T${String(800000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq) + PHASE).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files, register });
};
const REG = [{ path: "snapshots/r.bin", sha256: S1, encoding: "binary", bytes: 10 }];
const ENT = [{ ref: "ordinance:24681", kind: "ordinance", key: "24681", label: "Ordinance No. 24681" }];
const readingOf = (chain) => ({ capture: { sha256: S1, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
             entities: ENT, facts: {}, ...(chain === undefined ? {} : { text_source: chain }) } });
const shaOf = async (id) => ((await get("list", "limit=1000"))?.bundles ?? [])
  .find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const VERSIONS = [{ name: VNAME, relationship: "and",
  description: "The ledger and the minutes together evidence the transfer.",
  grounds: [{ ground: "paper trail", statement: "The ledger and minutes read together." }],
  legs: [{ target: DOC, ground: "paper trail", grade: "B",
           grade_axis: "capture", grade_source: "capture" }] }];

if (PHASE === "a") {
  const e = await post("entitycreate",
    { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24681"] });
  const ORD = e.entity_id;
  const p1 = await promote(DOC, infoMd(DOC), "information", null,
    { reading: readingOf(undefined), register: REG });
  if (p1.ok === false) throw new Error(`phase a doc: ${JSON.stringify(p1).slice(0, 400)}`);
  await post("resolve", { captureSha: S1 });
  const p2 = await promote(INQ, inquiryMd(INQ, ORD, [DOC], VERSIONS), "inquiry", null);
  if (p2.ok === false) throw new Error(`phase a inq: ${JSON.stringify(p2).slice(0, 400)}`);
  const a = await get("basisversions", `id=${INQ}`);
  const comp = a.versions?.[0]?.composition ?? "";
  console.log(JSON.stringify({ phase: "a", wrote: true, entity: ORD,
    composition_leg_letter: (/leg\t0\t[^\t]+\t[^\t]+\t[^\t]+\t([^\t]*)\t/.exec(comp) || [])[1] ?? null,
    published_leg_grade: a.versions?.[0]?.legs?.[0]?.grade ?? null }));
} else {
  /* PHASE B — the SAME document, re-promoted against the SAME store, under PATCHED code. */
  const ORD = JSON.parse(process.env.NC_REC119_ENTITY || '""');
  const base = await shaOf(INQ);
  const again = await promote(INQ, inquiryMd(INQ, ORD, [DOC], VERSIONS), "inquiry", base);
  const a = await get("basisversions", `id=${INQ}`);
  const comp = a.versions?.[0]?.composition ?? "";
  console.log(JSON.stringify({ phase: "b",
    promoted_ok: again.ok !== false, reason: again.reason ?? null,
    version_frozen: again.reason === "VERSION_FROZEN",
    changed: again.changed ?? null,
    stored_composition_leg_letter:
      (/leg\t0\t[^\t]+\t[^\t]+\t[^\t]+\t([^\t]*)\t/.exec(comp) || [])[1] ?? null }));
}
await mf.dispose();
process.exit(0);

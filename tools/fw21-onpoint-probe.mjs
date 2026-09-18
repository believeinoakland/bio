/* FW-21 / D-161 / M-51 — IS A CONNECTION'S DETERMINING PAIR THE ON-POINT MENTION, OR THE STRONGEST-GRADED ONE?
 *
 * Bob, 2026-09-14, second pass on 5.4: the connection pair is the ON-POINT pair, CHOSEN, not merely the
 * strongest-graded mention. FW-17 landed the pair the same evening. This probe answers the question from the
 * running plane (miniflare, through op=promote / op=resolve / op=connect / op=connections&content=) rather
 * than from any row that restates it.
 *
 * GROUND: document A resolves to ONE ordinance TWICE, both at grade A — a reference read on p.2 and another
 * on p.9. Document B resolves once (p.5). A member cites page 9 of A (a GENUINE mention), page 2 (the
 * mention the collapse kept) and page 7 (NO mention at all).
 *
 * WHAT THE ANSWER MEANS. If page 9 and page 7 answer IDENTICALLY, the record cannot tell a citation of a
 * real but unchosen mention from a citation of a page with no mention, and says a definite `outside` about
 * both — a NO it cannot support. That is the state measured on 2026-09-18 (M-51). A fix makes page 9 answer
 * UNDETERMINED (or reach, once a member has chosen it) while page 7 stays `outside`.
 *
 * CONTROL, built in: page 2 MUST reach at grade A. If it does not, the ground is broken and nothing else
 * printed means anything; the probe says so and exits 2.
 *
 * Run after `npm ci` in bio-plane/:   node tools/fw21-onpoint-probe.mjs ; echo $?
 * Exit 0 = measured (verdict printed), 2 = the ground did not hold. It is a MEASUREMENT, not a gate: it
 * is in no battery, and it reports the defect rather than failing on it. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const ROOT = fileURLToPath(new URL("../bio-plane", import.meta.url));
const { Miniflare } = await import(`${ROOT}/node_modules/miniflare/dist/src/index.js`);
const IDX = `${ROOT}/src/index.mjs`;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-p", MEMBER_TOKEN: "mem-p", PROBE_TOKEN: "prb-p", AI_TOKEN: "ai-p", VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body) => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-p`,
  { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "") => rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-p&${qs}`)).json());
const NOW = "2026-09-14T00:00:00Z", LATER = "2026-09-14T01:00:00Z";
let bseq = 0;
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A captured document.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const promoteReading = async (captureSha, entities) => {
  const id = `INFO-2026-${String(7300 + (++bseq))}-p`; const md = infoMd(id);
  const prov = JSON.stringify({ documents: [{ capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW, entities, facts: {}, text_source: [{ step: "layer" }] } }] });
  const r = await post("promote", { bundleId: id, base: null,
    snapKey: `20260914T${String(200000 + bseq).slice(-6)}Z_${sha(String(bseq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`, current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }], register: [] });
  if (r.ok === false) throw new Error(JSON.stringify(r).slice(0, 400)); return id;
};
const legMd = (id, target, page, eref) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Q ${id}"`, "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  "references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "recheck_triggers:", "  - text: Revisit", "    description: d.",
  "basis:", `  - target: ${target}`, "    role: supports", "    extent_kind: pdf-page", `    extent_page: ${page}`, `    extent_ref: "${eref}"`,
  "---", "", "## Question", "", "Q", "", "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const P2 = { kind: "pdf-page", ref: "p.2", page: 1, rect: null };
const P9 = { kind: "pdf-page", ref: "p.9", page: 8, rect: null };
const P5 = { kind: "pdf-page", ref: "p.5", page: 4, rect: null };
const SA = sha("fw21-A"), SB = sha("fw21-B");
const A = await promoteReading(SA, [
  { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579", source: P2 },
  { ref: "ordinance:13579-amended", kind: "ordinance", key: "13579-amended", label: "Ord. 13579 as amended", source: P9 }]);
await promoteReading(SB, [{ ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ord. No. 13,579", source: P5 }]);
const e = await post("entitycreate", { kind: "ordinance", label: "Rent Adjustment Ordinance",
  aliases: ["ordinance:13579", "ordinance:13579-amended"] });
await post("resolve", { captureSha: SA }); await post("resolve", { captureSha: SB });
const res = await get("resolutions", `sha256=${SA}`);
console.log("resolutions of A:", JSON.stringify((res.resolutions || []).map((r) => [r.ref, r.entity_id, r.grade])));
const d = await post("connect", { entityId: e.entity_id });
const c = (await get("connections", `id=${e.entity_id}`)).connections[0];
console.log("connect ok/count:", d.ok, d.count);
console.log("determining pair:", JSON.stringify(c.determining_pair));
console.log("basis:", c.basis);
const cite = async (n, page) => {
  const id = `INQ-2026-${7490 + n}-p`;
  const q = await post("promote", { bundleId: id, base: null, snapKey: `20260914T39999${n}Z_deadbee${n}`,
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "Q", current_state: "open", created: NOW, last_updated: LATER },
    files: [(() => { const md = legMd(id, A, page - 1, `page ${page}`); return { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }; })()], register: [] });
  return get("connections", `content=${q.content?.[0]?.content_id}`);
};
const out = {};
for (const [n, page] of [[1, 9], [2, 2], [3, 7]]) {
  const g = await cite(n, page);
  out[page] = { grade: g.connection_grade ?? null, reaching: g.counts?.reaching ?? null,
                undetermined: g.counts?.undetermined ?? null, outside: g.counts?.outside ?? null };
  console.log(`page-${page} citation of A:`, JSON.stringify(out[page]), "|", g.why);
}
await mf.dispose();
if (!(out[2].grade === "A" && out[2].reaching === 1)) {
  console.log("GROUND BROKEN: the page the kept mention was read on does not reach, so nothing above is evidence");
  process.exit(2);
}
const same = JSON.stringify(out[9]) === JSON.stringify(out[7]);
console.log(same && out[9].outside === 1
  ? "VERDICT: STRONGEST-GRADED, NOT ON-POINT — a citation of a GENUINE unchosen mention (p.9) answers exactly as a page with NO mention (p.7): a definite outside"
  : "VERDICT: CHANGED — p.9 no longer answers as p.7 does; re-read D-161 and FW-21 before trusting either");
process.exit(0);

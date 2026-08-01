/* NEGATIVE CONTROL: (run 2026-07-31) disable the write-path envelope gate in promote (guard `writer && !(operation in MECHANICAL_FIELD_SETS)` with `false`, so a mechanical write naming an unregistered/absent operation is admitted) -> 3 assertions fail (the UNDECLARED_OPERATION refusals); restored, 44 pass. */
/* Mechanical writers, held to their declared envelope.
 *
 * Negative-control detail: disable the write-path envelope gate in promote (guard `writer && !(operation in MECHANICAL_FIELD_SETS)` with `false`, so a mechanical write naming an unregistered/absent operation is admitted) -> 3 assertions fail (the UNDECLARED_OPERATION refusals); restored, 44 pass.
 *
 * A daemon writing into the record is the highest-leverage actor in the system:
 * it writes often, unattended, and nobody reads most of what it does. So the
 * doctrine does not ask it to be careful, it bounds what it is able to change and
 * makes the bound checkable after the fact. MECHANICAL_FIELD_SETS names the
 * frontmatter each operation may touch, a mechanical writer's prose edits are
 * confined to the Session Log, its file writes to bundle.md, snapshots/ and two
 * append-only registers, and a mechanical creation lands at collected and never
 * higher.
 *
 * C-20.1 enforces all of that by diffing history snapshots against the verbatim
 * promotion records, which means the constraint survives a daemon that lies about
 * what it did: the diff is the evidence, not the claim. This suite writes the
 * violations deliberately and asserts each one is caught.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle, MECHANICAL_FIELD_SETS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  /* The capture bucket is needed by op=registeraudit below, which finishes its
     classification by probing <store>/captures/<sha>. Without it the audit
     degrades honestly, calling everything it cannot see unbacked and saying so,
     which is the fail-safe direction but not what this suite is testing. */
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-mech", MEMBER_TOKEN: "mem-mech", PROBE_TOKEN: "prb-mech", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const post = async (op, body) => (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=mem-mech",
  { method: "POST", body: JSON.stringify(body) })).json();
const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=mem-mech&" + qs)).json();

const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));

/* A monitored Information bundle, the thing a monitor tick acts on. */
const md = (id, opts) => {
  const o = { state: "collected", updated: "2026-07-24T01:00:00Z", sessions: 1,
              sourceStatus: "unchanged", lastChecked: null, reeval: false,
              summary: "What the report shows.", extraHeading: null, ...opts };
  return [
    "---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "Monitored source"`, `current_state: ${o.state}`, "prior_state: null",
    "created: 2026-07-24T00:00:00Z", `last_updated: ${o.updated}`,
    "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
    "group: believe-in-oakland", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", `  flag: ${o.reeval}`,
    `  since: ${o.reeval ? o.updated : "null"}`, `  source: ${o.reeval ? "source_status" : "null"}`,
    "visuals: []", "criticality: supporting",
    `source_status: ${o.sourceStatus}`, "source:",
    "  locator: https://www.oaklandca.gov/report.pdf", "  authority: City Auditor",
    "  retrieved: 2026-07-24T00:00:00Z",
    "monitoring:", "  enabled: true", "  frequency: daily",
    `  last_checked: ${o.lastChecked ?? "null"}`, "---", "",
    "## Summary", "", o.summary, "", "## Provenance Notes", "",
    "## Session Log", "",
    ...Array.from({ length: o.sessions }, (_, i) => [`### Session ${i + 1}`, "", `Entry ${i + 1}.`, ""]).flat(),
    "## Review Notes", "", ...(o.extraHeading ? [o.extraHeading, "", "text", ""] : []),
  ].join("\n");
};

const pkg = (id, body, base, snapKey, extra = {}) => ({
  bundleId: id, base, snapKey, author: "bio-daemon",
  meta: { object_type: "information", group: "believe-in-oakland", title: "Monitored source",
          current_state: extra.state || "collected", created: "2026-07-24T00:00:00Z",
          last_updated: extra.updated || "2026-07-24T01:00:00Z" },
  files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }],
  register: [], ...extra.pkg,
});

const judge = async (id) => {
  const img = (await get(`op=image&id=${id}`)).result;
  const files = new Map();
  for (const [p, v] of Object.entries(img)) if (typeof v === "string") files.set(p, v);
  const { findings } = await checkBundle({ folderName: id, files,
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
  return findings.filter((f) => f.severity === "error");
};

console.log("\n--- a mechanical writer must name an operation the catalog knows ---");
t("the envelope has the four registered operations", Object.keys(MECHANICAL_FIELD_SETS).sort(),
  ["deadline-recheck", "member-attest", "monitor-tick", "sweep"]);
const ID0 = "INFO-2026-0700-undeclared";
const bad0 = await post("promote", { ...pkg(ID0, md(ID0), null, "20260724T010000Z_aaaa1111"),
  writer: "mechanical", operation: "do-whatever" });
t("an unregistered operation is refused at the write", bad0.result.reason, "UNDECLARED_OPERATION");
t("and the refusal lists what is allowed", /monitor-tick/.test(bad0.result.detail), true);
t("a mechanical write with no operation at all is refused",
  (await post("promote", { ...pkg(ID0, md(ID0), null, "20260724T010000Z_aaaa1111"),
    writer: "mechanical" })).result.reason, "UNDECLARED_OPERATION");

console.log("\n--- a conformant monitor tick passes ---");
const ID = "INFO-2026-0701-monitored";
const c1 = await post("promote", pkg(ID, md(ID), null, "20260724T010000Z_bbbb1111"));
t("the bundle is created", c1.result.ok, true);
const tickBody = md(ID, { sourceStatus: "modified", lastChecked: "2026-07-24T02:00:00Z",
  reeval: true, updated: "2026-07-24T02:00:00Z", sessions: 2 });
const tick = await post("promote", { ...pkg(ID, tickBody, c1.result.bundleSha, "20260724T020000Z_bbbb2222",
  { updated: "2026-07-24T02:00:00Z" }), writer: "mechanical", operation: "monitor-tick" });
t("the tick lands", tick.result.ok, true);
t("the promotion record carries the mechanical claim",
  JSON.parse((await get(`op=image&id=${ID}`)).result["_history/promotion_20260724T020000Z_bbbb2222.json"]).writer,
  "mechanical");
t("and the operation it named",
  JSON.parse((await get(`op=image&id=${ID}`)).result["_history/promotion_20260724T020000Z_bbbb2222.json"]).operation,
  "monitor-tick");
t("the catalog finds nothing wrong with it", await judge(ID), []);

console.log("\n--- a tick outside its field set is caught by the diff, not by trust ---");
{
  const ID2 = "INFO-2026-0702-overreach";
  const a = await post("promote", pkg(ID2, md(ID2), null, "20260724T010000Z_cccc1111"));
  /* criticality is not in monitor-tick's declared set. */
  const over = md(ID2, { lastChecked: "2026-07-24T02:00:00Z", updated: "2026-07-24T02:00:00Z", sessions: 2 })
    .replace("criticality: supporting", "criticality: crucial");
  const r = await post("promote", { ...pkg(ID2, over, a.result.bundleSha, "20260724T020000Z_cccc2222",
    { updated: "2026-07-24T02:00:00Z" }), writer: "mechanical", operation: "monitor-tick" });
  t("the write itself is allowed: the store is not the auditor", r.result.ok, true);
  const errs = await judge(ID2);
  t("but the gate refuses it", errs.map((e) => e.check), ["C-20.1"]);
  t("naming the field it should not have touched", /criticality/.test(errs[0].message), true);
  t("and quoting the envelope it exceeded", /declared field set/.test(errs[0].message), true);
}

console.log("\n--- a tick that edits prose outside the Session Log is caught ---");
{
  const ID3 = "INFO-2026-0703-prose";
  const a = await post("promote", pkg(ID3, md(ID3), null, "20260724T010000Z_dddd1111"));
  const edited = md(ID3, { lastChecked: "2026-07-24T02:00:00Z", updated: "2026-07-24T02:00:00Z",
    sessions: 2, summary: "A daemon rewrote the summary, which is not its business." });
  await post("promote", { ...pkg(ID3, edited, a.result.bundleSha, "20260724T020000Z_dddd2222",
    { updated: "2026-07-24T02:00:00Z" }), writer: "mechanical", operation: "monitor-tick" });
  const errs = await judge(ID3);
  t("the gate refuses it", errs.map((e) => e.check), ["C-20.1"]);
  t("naming the section", /Summary/.test(errs[0].message), true);
  t("and stating the rule in one clause", /only the Session Log/.test(errs[0].message), true);
}

console.log("\n--- a sweep may change nothing at all ---");
{
  const ID4 = "INFO-2026-0704-sweep";
  const a = await post("promote", pkg(ID4, md(ID4), null, "20260724T010000Z_eeee1111"));
  const moved = md(ID4, { lastChecked: "2026-07-24T02:00:00Z", updated: "2026-07-24T02:00:00Z", sessions: 2 });
  await post("promote", { ...pkg(ID4, moved, a.result.bundleSha, "20260724T020000Z_eeee2222",
    { updated: "2026-07-24T02:00:00Z" }), writer: "mechanical", operation: "sweep" });
  const errs = await judge(ID4);
  t("a sweep that touched frontmatter is refused", errs.length > 0, true);
  t("because its declared set is empty", MECHANICAL_FIELD_SETS.sweep, []);
}

console.log("\n--- a mechanical creation never elevates ---");
{
  const ID5 = "INFO-2026-0705-elevated";
  const born = md(ID5, { state: "verified" });
  await post("promote", { ...pkg(ID5, born, null, "20260724T010000Z_ffff1111", { state: "verified" }),
    writer: "mechanical", operation: "monitor-tick" });
  const errs = await judge(ID5);
  t("a daemon creating a verified bundle is refused",
    errs.some((e) => e.check === "C-20.1" && /never elevate/.test(e.message)), true);
}

console.log("\n--- a hand-authored promotion is held to no envelope ---");
{
  const ID6 = "INFO-2026-0706-human";
  const a = await post("promote", pkg(ID6, md(ID6), null, "20260724T010000Z_99991111"));
  const free = md(ID6, { updated: "2026-07-24T02:00:00Z", sessions: 2,
    summary: "A member rewrote this, which is entirely their business." })
    .replace("criticality: supporting", "criticality: crucial");
  await post("promote", pkg(ID6, free, a.result.bundleSha, "20260724T020000Z_99992222",
    { updated: "2026-07-24T02:00:00Z" }));
  t("no mechanical claim, no envelope, no finding", await judge(ID6), []);
}


console.log("\n--- the monitor tick, written by the plane and audited by the gate ---");
{
  /* The real thing: the plane builds the tick itself, so the assertion is that
     the code which writes it stays inside the envelope the previous section
     proved is enforced. A daemon whose own output the auditor refuses is worse
     than no daemon. */
  const ID7 = "INFO-2026-0707-real-tick";
  const DOC = new Uint8Array(1024).map((_, i) => (i * 7) % 256);
  const DOC_SHA = createHash("sha256").update(DOC).digest("hex");
  const CHANGED = new Uint8Array(1024).map((_, i) => (i * 9) % 256);

  let serve = DOC, status = 200;
  const mfm = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "a2", MEMBER_TOKEN: "m2", PROBE_TOKEN: "p2", VERSION: "test" },
    outboundService: async () => status === 200
      ? new Response(serve) : new Response("gone", { status }),
  });
  const P = async (op, b) => (await mfm.dispatchFetch("http://x/api/?op=" + op + "&token=m2",
    { method: "POST", body: JSON.stringify(b) })).json();
  const G = async (q) => (await mfm.dispatchFetch("http://x/api/?token=m2&" + q)).json();

  const LOC = "https://www.oaklandca.gov/report.pdf";
  const prov = JSON.stringify({ documents: [{
    file: "snapshots/report.pdf", locator: LOC, authority: "City Auditor",
    retrieved: "2026-07-24T00:00:00Z",
    capture: { method: "test", grade: "B", actor_class: "daemon", sha256: DOC_SHA, encoding: "binary" },
    origin: { kind: "named_request" }, attestation_attempts: [],
  }] }, null, 1);
  const body0 = md(ID7).replace("schema: information@1", "schema: information@2")
    .replace("  last_checked: null", "  last_checked: null");
  await mfm.dispatchFetch(`http://x/api/?op=capture&token=m2&sha256=${DOC_SHA}`, { method: "PUT", body: DOC });
  const created = await P("promote", {
    bundleId: ID7, base: null, snapKey: "20260724T010000Z_7777aaaa", author: "member",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Monitored source",
            current_state: "collected", created: "2026-07-24T00:00:00Z", last_updated: "2026-07-24T01:00:00Z" },
    files: [{ path: "bundle.md", text: body0, bytes: body0.length, sha256: sha(body0) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
            { path: "snapshots/report.pdf", blobSha: DOC_SHA, sha256: DOC_SHA, bytes: DOC.length }],
    register: [{ sha256: DOC_SHA, path: "snapshots/report.pdf", encoding: "binary", bytes: DOC.length }],
  });
  t("the monitored bundle is created", created.result.ok, true);

  const same = await P("monitor", { bundleId: ID7 });
  t("an unchanged source reads as unchanged", same.status, "unchanged");
  t("and raises no re-evaluation", same.reeval_raised, false);
  t("the tick is a real revision", typeof same.revision, "string");

  serve = CHANGED;
  const moved = await P("monitor", { bundleId: ID7 });
  t("a changed source reads as modified", moved.status, "modified");
  t("and raises re-evaluation", moved.reeval_raised, true);
  t("it does not record the new hash: that is not a mechanical judgement",
    /not a mechanical judgement/.test(moved.note2), true);

  status = 404;
  const gone = await P("monitor", { bundleId: ID7 });
  t("a withdrawn source reads as removed", gone.status, "removed");

  /* The whole point: the plane's own tick, judged by the catalog. */
  const img = (await G(`op=image&id=${ID7}`)).result;
  const files = new Map();
  for (const [p2, v] of Object.entries(img)) if (typeof v === "string") files.set(p2, v);
  const el = new Set(Object.entries(img).filter(([, v]) => typeof v !== "string").map(([k]) => k));
  const { findings } = await checkBundle({ folderName: ID7, files, elidedPaths: el,
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
  const errs = findings.filter((f) => f.severity === "error");
  for (const x of errs) console.log(`         ${x.check}: ${x.message.slice(0, 130)}`);
  t("three of the plane's own ticks, and the gate finds nothing", errs.length, 0);

  const live = files.get("bundle.md");
  t("the live record shows the last status", /^source_status: removed$/m.test(live), true);
  t("the re-evaluation flag is up", /^\s+flag: true$/m.test(live), true);
  t("and every tick left a session entry",
    (live.match(/### Session 20/g) || []).length >= 3, true);

  const UNMON = "INFO-2026-0708-unmonitored";
  const ub = md(UNMON).replace("  enabled: true", "  enabled: false");
  await P("promote", { bundleId: UNMON, base: null, snapKey: "20260724T010000Z_8888aaaa", author: "member",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Monitored source",
            current_state: "collected", created: "2026-07-24T00:00:00Z", last_updated: "2026-07-24T01:00:00Z" },
    files: [{ path: "bundle.md", text: ub, bytes: ub.length, sha256: sha(ub) }], register: [] });
  t("a bundle that does not ask to be monitored is refused",
    (await P("monitor", { bundleId: UNMON })).reason, "NOT_MONITORED");
  t("an absent bundle is refused", (await P("monitor", { bundleId: "INFO-2026-9999-nope" })).reason, "ABSENT");
  await mfm.dispose();
}


console.log("\n--- op=registeraudit: the diagnostic must ask R2, and must be able to say no ---");
{
  /* 0.22.0 shipped this looking only in `files` and `history`, called anything
     else "dropped", and produced a confident wrong finding that the Apps Script
     migration was unauditable. The bytes were in R2. Neither that version nor
     the corrected one was exercised by any suite: the battery held at 1282
     across both, which is the D-43 shape again. */
  const id = "INFO-2026-7900-regaudit";
  const md = `---\nid: ${id}\nobject_type: information\ncurrent_state: collected\n---\n\n## Summary\n\nAudit.\n`;
  const CAP = "capture bytes that really exist";
  const capSha = sha(CAP);

  /* A register entry backed by a file IN the payload: the `live` class. */
  await post("promote", {
    bundleId: id, base: null, snapKey: "20260726T010000Z_regaudit", author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Audit",
            current_state: "collected", created: "2026-07-26T00:00:00Z", last_updated: "2026-07-26T00:00:00Z" },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [{ path: "bundle.md", sha256: sha(md), encoding: "utf8", bytes: md.length }] });

  const audit = async () => (await (await mf.dispatchFetch("http://x/api/?op=registeraudit&token=adm-mech")).json()).result;
  const a = await audit();
  t("the audit probed the bucket rather than guessing", a.probed, true);
  t("an entry backed by a file in the image is live", a.live >= 1, true);
  t("and the store reads sound", a.sound, true);
  t("with nothing to report", a.sample, []);

  /* THE NEGATIVE CONTROL. A register entry for bytes that are in neither the
     image nor the bucket is the one genuinely broken state, and an audit that
     cannot say so is worth nothing. Written directly, because promote does not
     refuse it: the gate does, at ratify, with PLANE_MISSING_BYTES (D-45). */
  const id2 = "INFO-2026-7901-unbacked";
  const md2 = `---\nid: ${id2}\nobject_type: information\ncurrent_state: collected\n---\n\n## Summary\n\nB.\n`;
  await post("promote", {
    bundleId: id2, base: null, snapKey: "20260726T010100Z_unbacked", author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Unbacked",
            current_state: "collected", created: "2026-07-26T00:00:00Z", last_updated: "2026-07-26T00:00:00Z" },
    files: [{ path: "bundle.md", text: md2, bytes: md2.length, sha256: sha(md2) }],
    register: [{ path: "captures/ghost.bin", sha256: sha("nowhere at all"), encoding: "binary", bytes: 14 }] });

  const b = await audit();
  t("the audit reports the unbacked entry", b.unbacked, 1);
  t("the store no longer reads sound", b.sound, false);
  t("the offender is named", b.sample[0].path, "captures/ghost.bin");
  t("with the reason", b.sample[0].why, "no bytes in the working bucket");

  /* And a capture whose bytes ARE in the bucket but which is deliberately not
     in the bundle image is SOUND, not broken. This is the migrate.mjs pattern
     and the whole reason the first version of this audit was wrong. */
  await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-mech&sha256=${capSha}`,
    { method: "PUT", body: CAP });
  const id3 = "INFO-2026-7902-captured";
  const md3 = `---\nid: ${id3}\nobject_type: information\ncurrent_state: collected\n---\n\n## Summary\n\nC.\n`;
  await post("promote", {
    bundleId: id3, base: null, snapKey: "20260726T010200Z_captured", author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Captured",
            current_state: "collected", created: "2026-07-26T00:00:00Z", last_updated: "2026-07-26T00:00:00Z" },
    files: [{ path: "bundle.md", text: md3, bytes: md3.length, sha256: sha(md3) }],
    register: [{ path: "migration/drive-provenance.json", sha256: capSha, encoding: "utf8", bytes: CAP.length }] });

  const c = await audit();
  t("a capture held only in the bucket counts as captured, not broken", c.captured >= 1, true);
  t("and it is not counted as unbacked", c.unbacked, 1);
}

await mf.dispose();
console.log(`\nmechanical: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

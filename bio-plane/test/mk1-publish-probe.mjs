/* MK-1 (A) — THE PUBLICATION-FENCE PROBE. NOT a `.test.mjs`: it is the
 * measurement CONDUCT #4 asked for, driven through the ops against the real
 * plane, and its output is recorded on the row. Run from `bio-plane/`:
 *
 *     node test/mk1-publish-probe.mjs
 *
 * For every route to the published record it drives, it prints whether the
 * authored bundle, its WORDS, its PROVENANCE DOCUMENT or its AUTHOR'S HANDLE
 * reached anything published — the PUBLISHED bucket's bytes (read back object
 * by object) and every public read (`op=verify`, `op=publishedmanifest`,
 * `op=publishedcase`, `op=publishedbytes`).
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-mk1p", MEMBER_TOKEN: "mem-mk1p", PROBE_TOKEN: "prb-mk1p", VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const codeOf = (r) => (r && typeof r.reason === "string") ? r.reason : (r && typeof r.code === "string") ? r.code : null;
const ADM = "adm-mk1p";
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const dir = mkdtempSync(join(tmpdir(), "mk1-probe-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
const signBytes = (who, text) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, text);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f], { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const signRatify = (who, id, s) => signBytes(who, `bio-ratify ${id} ${s}\n`);
const signCase = (who, c, e, d) => signBytes(who, `bio-ratify-case ${c} ${e} ${d}\n`);
const enrol = async (memberId, role, capabilities) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
  await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-123` });
  return (await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-123` })).token;
};
await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
await enrol("gus", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
/* THE OBSERVER, under a handle that appears nowhere else, so a hit is hers. */
const OLGA = await enrol("olgaobserver", "member", ["contribute"]);
await POST(`op=signeradd&token=${ADM}`, { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" });

const WORDS = "PROBE-WORDS: I watched the deputy clerk stamp the amended contract RECEIVED before the vote.";
const tx = await POST(`op=testify&token=${OLGA}`, { words: WORDS, observedAt: "2026-06-10" });
if (!tx || !tx.ok) throw new Error(`testify: ${JSON.stringify(tx)}`);
const OBS = tx.bundle_id;
const img = await GET(`op=image&token=${IRIS}&id=${OBS}`);
const PROV_SHA = sha(img["data/provenance.json"]);
console.log(`observation ${OBS}, words sha ${tx.capture_sha.slice(0, 12)}…, provenance sha ${PROV_SHA.slice(0, 12)}…`);

/* EVERYTHING PUBLISHED, READ BACK: every object in the PUBLISHED bucket, its bytes. */
const bucket = await mf.getR2Bucket("PUBLISHED");
const leaks = async () => {
  const out = { objects: 0, words: [], provenance: [], handle: [], obsId: [] };
  let cursor;
  do {
    const l = await bucket.list({ cursor });
    for (const o of l.objects) {
      out.objects++;
      const body = await (await bucket.get(o.key)).text();
      if (body.includes("PROBE-WORDS")) out.words.push(o.key);
      if (body.includes('"authored": true') || body.includes('"authored":true')) out.provenance.push(o.key);
      if (body.includes("olgaobserver")) out.handle.push(o.key);
      if (body.includes(OBS)) out.obsId.push(o.key);
    }
    cursor = l.truncated ? l.cursor : undefined;
  } while (cursor);
  const pv = async (s) => (await GET(`op=verify&sha256=${s}`))?.published ?? null;
  out.verify = { words: await pv(tx.capture_sha), provenance: await pv(PROV_SHA) };
  const man = JSON.stringify(await GET("op=publishedmanifest"));
  out.manifest = { obsId: man.includes(OBS), handle: man.includes("olgaobserver"), words: man.includes("PROBE-WORDS") };
  return out;
};
/* ADDED 2026-09-20 by the MK-3 worker — A PATH THAT NEVER RAN MUST NOT PRINT AS
   A CLEAN ONE, and on THIS instrument that is the whole point rather than tidiness.
   `row()` printed `answer {"ok":null,"code":null}` beside an EMPTY bucket whenever
   the act was never reached, which is byte-for-byte what a path that ran and leaked
   nothing prints. Measured 2026-09-20: PATH 3 — the `op=caseratify` route, C-53.12,
   the fence MK-3 would lift — has been printing exactly that, because its `op=publish`
   precondition refuses `NOT_CONCLUDED` (`op=conclude` now refuses `NO_CLAIM`:
   REC-124/REC-136 §7.1 made a conclusion adopt a named reading's claim, and this
   probe's fixture names none). A reader of this output would conclude the case route
   was driven and published nothing. It was not driven at all.
   `ok === null` is the signal, and it is a FINDING, printed as one. */
const DEAD = [];
const row = (path, act, r, l, why = null) => {
  const dead = !r || r.ok === null || r.ok === undefined;
  if (dead && path !== "0 baseline") DEAD.push(`PATH ${path}${why ? ` — ${why}` : ""}`);
  console.log(`\nPATH ${path}\n  act      ${act}\n  answer   ${JSON.stringify({ ok: r && r.ok, code: codeOf(r) })}`
  + (dead && path !== "0 baseline"
      ? `\n  DEAD ARM THIS PATH WAS NEVER DRIVEN${why ? `: ${why}` : ""}. The bucket and verify lines below say`
        + `\n           NOTHING about this route — they are the state left by the paths above it.`
      : "")
  + `\n  bucket   ${l.objects} object(s) · words in ${JSON.stringify(l.words)} · provenance in ${JSON.stringify(l.provenance)} · handle in ${JSON.stringify(l.handle)} · id in ${JSON.stringify(l.obsId)}`
  + `\n  verify   words ${l.verify.words} · provenance ${l.verify.provenance}`
  + `\n  manifest id ${l.manifest.obsId} · handle ${l.manifest.handle} · words ${l.manifest.words}`);
};
row("0 baseline", "nothing ratified yet", { ok: null }, await leaks());

/* PATH 1: op=ratify on the observation directly. */
const listSha = async (id) => {
  const l = await GET(`op=list&token=${IRIS}&limit=1000`);
  return (Array.isArray(l) ? l : (l && l.bundles) || []).find((b) => b.bundle_id === id)?.bundle_sha ?? null;
};
const obsSha = await listSha(OBS);
const r1 = await POST(`op=ratify&token=${IRIS}`, { bundleId: OBS, expectedSha: obsSha, sig: signRatify("iris", OBS, obsSha) });
row("1 op=ratify on the authored bundle itself", `iris signs bio-ratify ${OBS}`, r1, await leaks());
if (r1 && !r1.ok) console.log(`  detail   ${JSON.stringify(r1).slice(0, 600)}`);

/* PATH 1b: the same act after the words' bytes are in the working bucket —
   by op=testify's own write if it puts them there, else by ANY member's
   op=capture PUT of bytes they can read back through op=image. */
const fileKey = Object.keys(img).find((k) => k.startsWith("snapshots/observation-"));
const wordBytes = new TextEncoder().encode(img[fileKey]);
const have = await (await mf.getR2Bucket("CAPTURES")).head(`bio/captures/${tx.capture_sha}`);
const put = have ? { ok: true, note: "already in the working bucket (op=testify put it there)" }
  : await (await mf.dispatchFetch(`http://x/api/?op=capture&token=${IRIS}&sha256=${tx.capture_sha}`,
      { method: "PUT", body: wordBytes })).json();
console.log(`\nbytes into the working bucket: ${JSON.stringify(put).slice(0, 200)}`);
const obsSha1b = await listSha(OBS);
const r1b = await POST(`op=ratify&token=${IRIS}`, { bundleId: OBS, expectedSha: obsSha1b, sig: signRatify("iris", OBS, obsSha1b) });
row("1b op=ratify on the authored bundle once its bytes are in the working bucket", `iris signs bio-ratify ${OBS}`, r1b, await leaks());
if (r1b && !r1b.ok) console.log(`  detail   ${JSON.stringify(r1b).slice(0, 600)}`);

/* PATH 2: a finding whose basis cites the observation, ratified. */
/* CORRECTED 2026-09-20 by the MK-3 worker, never exempted — and the OLD CALL WAS
   WRONG rather than merely stale. It passed `id: "PROJ-2026-5302-probe"`, and
   REC-141/IC-158 (2026-09-18) made a project's id MINTED BY THE PLANE
   (C-59.1 PROJECT_ID_SUPPLIED); `makePublishingProject` now THROWS on `id`
   rather than ignoring it, deliberately, so a caller still expecting its chosen
   id is told at the fixture. This probe is not a `.test.mjs` — it is MK-1's
   measurement instrument, run by hand — so no battery suite could see it die,
   and PATHS 2, 3 and 4 had not run since. Pass `name`, take the minted id. */
const PROJECT = await makePublishingProject({ post: POST, mf, sha, machineToken: ADM, owner: "iris",
  name: "mk1-publish-probe", created: NOW, updated: LATER });
const inquiryMd = (id, question, target) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  "references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next meeting", "    description: The minutes may say otherwise.",
  "basis:", `  - target: ${target}`, "    role: supports",
  "    grade: D", "    grade_axis: connection", "    grade_source: testimony",
  "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const F = "INQ-2026-5302-rests-on-testimony";
const fm = inquiryMd(F, "Was the contract stamped before the vote?", OBS);
const pf = await POST(`op=promote&token=${IRIS}`, { bundleId: F, base: null, snapKey: "20260702T100000Z_aaaa5302",
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: "probe", current_state: "open", created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: fm, bytes: fm.length, sha256: sha(fm) }], register: [] });
console.log(`\nfinding promote: ${JSON.stringify({ ok: pf && pf.ok, code: codeOf(pf) })}${pf && pf.ok ? "" : " " + JSON.stringify(pf).slice(0, 500)}`);
const cc = await GET(`op=conclude&token=${IRIS}&target=${F}&conclusion=${encodeURIComponent("It was stamped first.")}`
  + `&falsifier=${encodeURIComponent("A received-log showing a later stamp would overturn this.")}`);
console.log(`conclude: ${JSON.stringify({ ok: cc && cc.ok, code: codeOf(cc) })}`);
const fSha = await listSha(F);
const r2 = await POST(`op=ratify&token=${IRIS}`, { bundleId: F, expectedSha: fSha, sig: signRatify("iris", F, fSha) });
row("2 op=ratify on a finding whose basis cites the observation", `iris signs bio-ratify ${F}`, r2, await leaks());
if (r2 && !r2.ok) console.log(`  detail   ${JSON.stringify(r2).slice(0, 600)}`);

/* PATH 3: that finding as a member of a case, op=publish then op=caseratify. */
const pubBody = (targets) => ({ project: PROJECT, targets, roles: allLoadBearing({ targets }),
  scope: "Whether the contract was stamped before the vote, on the documents in hand.",
  statement: "This case covers the stamp only, on the documents in hand at edition 1.",
  excluded: [], subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claim to the Clerk on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "This group holds that contracts should be adopted in public session." });
const p3 = await POST(`op=publish&token=${IRIS}`, pubBody([F]));
console.log(`\nop=publish [finding]: ${JSON.stringify({ ok: p3 && p3.ok, code: codeOf(p3) })}${p3 && p3.ok ? "" : " " + JSON.stringify(p3).slice(0, 500)}`);
let r3 = { ok: null };
if (p3 && p3.caseDocument) {
  const D = p3.caseDocument;
  r3 = await POST(`op=caseratify&token=${IRIS}`, { caseId: D.case_id, edition: D.edition, expectedSha: D.doc_sha,
    sig: signCase("iris", D.case_id, D.edition, D.doc_sha) });
  const pc = JSON.stringify(await GET(`op=publishedcase&id=${D.case_id}`));
  console.log(`  publishedcase: id ${pc.includes(OBS)} · handle ${pc.includes("olgaobserver")} · words ${pc.includes("PROBE-WORDS")}`);
}
row("3 op=publish + op=caseratify, the finding as a case member", "iris signs the case document", r3, await leaks(),
    p3 && p3.caseDocument ? null : `op=publish authored no case document (${codeOf(p3) ?? "no answer"}), so op=caseratify was never called`);
if (r3 && r3.ok === false) console.log(`  detail   ${JSON.stringify(r3).slice(0, 600)}`);

/* PATH 4: the observation ITSELF named as a case target. */
const p4 = await POST(`op=publish&token=${IRIS}`, pubBody([OBS]));
console.log(`\nop=publish [observation]: ${JSON.stringify({ ok: p4 && p4.ok, code: codeOf(p4) })} ${JSON.stringify(p4).slice(0, 400)}`);
let r4 = { ok: null };
if (p4 && p4.caseDocument) {
  const D = p4.caseDocument;
  r4 = await POST(`op=caseratify&token=${IRIS}`, { caseId: D.case_id, edition: D.edition, expectedSha: D.doc_sha,
    sig: signCase("iris", D.case_id, D.edition, D.doc_sha) });
}
row("4 op=publish + op=caseratify, the observation itself as a case target", "iris signs", r4, await leaks(),
    p4 && p4.caseDocument ? null : `op=publish refused the observation as a case target (${codeOf(p4) ?? "no answer"}), so op=caseratify was never called — AND THAT REFUSAL IS ITSELF THE MEASUREMENT: an authored observation is object_type information and a case member must be an inquiry, so an observation is NEVER a published_case_members row`);
if (DEAD.length) {
  /* THE FOOT, so a reader who scrolled past a path cannot miss that it never ran.
     WORKER.md: *an arm that did not arm is a finding*, and this instrument's whole
     job is to say what reached the published record — so a path it could not drive
     is the one thing it must not report in silence. */
  console.log(`\n${DEAD.length} PATH(S) NEVER DRIVEN — this run measured nothing about them:`);
  for (const d of DEAD) console.log(`  ${d}`);
} else console.log("\nevery path was driven.");
await mf.dispose();

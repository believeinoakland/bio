/* NEGATIVE CONTROL: RUN 2026-09-23 by the MK-6 worker from `bio-plane/`, each arm ALONE, by editing the REAL `src/store.mjs` (2,904,277 B, sha256 d6a4867b3f7a…), restored from a uniquely-named per-arm pristine copy and verified by `sha256sum -c` AND `cmp` (2 of 2 restores byte-identical; never `git checkout --`). Declared BEFORE arming: (a) `baseline` — nothing armed, MUST be green: 12/0. (b) `sessionlog` — THE ROW'S CONTROL, the member id restored in the Session Log (`| Authored | ${who}`): the POPULATION arm "NO PUBLISHED PART … contains the observer's member id, handle or cover" MUST FAIL, with the file arm and the Session Log arm — 9/3 AS DECLARED, the population naming one bucket object (the observation's bundle.md) under member_id. (c) `provauthor` — data/provenance.json's `author` restored to the member: the population arm, the file arm, the provenance arm and the unlinkable arm MUST FAIL — 8/4 AS DECLARED. The over-strictness side is in the suite: the publisher's own name (iris, the signer) IS found in the published parts, so the matcher is shown to see names.
 *
 * MK-6 — THE BUNDLE NEVER NAMES ITS AUTHOR (`docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.1, BOB #19,
 * 2026-09-21; §8's row for MK-3's replacement (i)).
 *
 * THE RULE. §2 kept the author out of the testimony BYTES. §4.1 extends it to every file of an authored bundle
 * and every record of its authoring the published projection can carry: each names the author by an OPAQUE
 * per-observation reference, `observer:<testimony id>`, and only the register resolves it.
 *
 * THE ACCEPTANCE IS A POPULATION, NOT A LIST OF SITES. A fixture case publishes an observation, and NO published
 * part — no object in the PUBLISHED bucket, no public manifest record — contains the author's member id, handle
 * or cover. The reader walks EVERY object the bucket holds, whatever wrote it, so a site this suite never named
 * is still inside the population.
 *
 * CORRECTED 2026-09-25 by MK-7, never exempted: THE FIXTURE NO LONGER CUTS ANYTHING. MK-7 lifted MK-1's fence in
 * `src/` for an observation in §4.1's form, so the plane below is the real plane, booted from `src/index.mjs`
 * unchanged, and the observation's author takes the real `group`-level act (op=attribute). The cut this paragraph
 * described would now remove MK-7's narrowed fence and leave its attribution gate reading an undefined binding
 * (measured: a ReferenceError at op=caseratify). The paragraph is kept for the record:
 * WHY THE FIXTURE LIFTED MK-1'S FENCE, AND ONLY IN MEMORY (until MK-7). MK-1's publication fence (C-53.10–.12) still stands and
 * MUST (the row: "Existing authored bundles stay fenced"; the lift is MK-3's replacement (ii)). With it standing,
 * nothing of an observation can be published, so a population read over the real plane is empty for free —
 * the equality that costs nothing (CLAUDE.md §5). So the plane is booted from `src/index.mjs`'s text with the
 * two fence REGIONS cut out (each anchor asserted to occur exactly once, and the cut asserted to remove those
 * two regions and nothing else). Every other byte is the real plane, and `store.mjs` is the real file on disk,
 * so `op=testify` is the subject exactly as it ships. Nothing here lifts the fence in `src/`.
 *
 * THE LEVEL. The fixture case is the `group`-level case of the acceptance, now CHOSEN BY ITS AUTHOR through
 * op=attribute (MK-7), and §4.1's point is that the bundle's bytes do not depend on the level. Every other level's
 * round trip is `mk7-attribution.test.mjs`'s.
 *
 * WHAT THIS CANNOT SEE. (0) Section 1 reads the files a ratification can carry, not `_history/`, which names the
 * promoting member and is never published; section 2 would see it if it were. (1) The register's private resolution of `observer:<id>`: no op reads
 * `register.author` today, so the resolution is asserted by the one op that answers it (the testify act's own
 * answer, to its author). (2) Parts a future publication route would add: the population is what TODAY's
 * ratify and caseratify write. (3) A leak by a spelling other than the three needles (the member id, the
 * handle, the cover), such as a hash of the member id.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- mk6-bundle-names-no-author ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH; publication needs a real member signature");
  console.log("mk6-bundle-names-no-author: SKIPPED");
  process.exit(0);
}

/* ------------------------------------------------ the real plane (MK-7: nothing is cut) */
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const ADM = "adm-mk6";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX,
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const okOf = (r) => [r && r.ok, codeOf(r)];
const NOW = "2026-09-18T00:00:00Z";

try {

console.log("\n--- 0. the plane is the real plane: MK-7 lifted MK-1's fence in src/, so nothing is cut ---");

/* THE OBSERVER, under a member id, a handle and a cover that are three distinct strings appearing nowhere else
   in the fixture — so any hit on any of them in a published part is theirs, and which one leaked is named. */
const OBS_ID = "mk6memberid", OBS_HANDLE = "mk6handle", OBS_COVER = "mk6coverword";
const NEEDLES = { member_id: OBS_ID, handle: OBS_HANDLE, cover: OBS_COVER };
const enrol = async (memberId, handle, cover, capabilities, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover, role, capabilities });
  const en = await POST("op=enroll", { invite: add && add.invite, handle, password: `${memberId}-passphrase-6` });
  if (!en || !en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-6` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* A group's first two members are administrators (ADMINS_FIRST), so the publisher and a second admin come first. */
const IRIS = await enrol("iris", "iris", "cover for iris", ["contribute", "publish", "create_projects"], "admin");
await enrol("gus", "gus", "cover for gus", ["contribute"], "admin");
const OBSERVER = await enrol(OBS_ID, OBS_HANDLE, `the ${OBS_COVER} volunteer`, ["contribute"]);

/* ===================================== 1. THE WORKING RECORD: every file names the observer by reference */
console.log("\n--- 1. an observation's every file names its author as observer:<testimony id>, never the member ---");
const WORDS = "MK6-WORDS: on 10 September I watched the deputy clerk stamp the amended contract RECEIVED "
            + "before the council voted on it.";
const tx = await POST(`op=testify&token=${OBSERVER}`, { words: WORDS, observedAt: "2026-09-10" });
const OBS = tx && tx.bundle_id;
const REF = `observer:${OBS}`;
t("op=testify lands, and its answer TO ITS AUTHOR still names the stamped member (the stamp happened; the register holds it)",
  [tx && tx.ok, tx && tx.author, tx && tx.authored], [true, OBS_ID, true]);
const img = await GET(`op=image&token=${OBSERVER}&id=${encodeURIComponent(OBS)}`);
/* THE FILES THE BUNDLE CAN PUBLISH. `_history/` is the working record's promotion audit: op=ratify skips it
   (`if (path.startsWith("_history/")) continue;` in src/index.mjs), so it is never a published part, and it
   DOES name the promoting member (measured on this suite's first run: `_history/promotion_*.json` and
   `_history/manifest.json`). §4 governs the published projection only; the record always knows the author.
   Section 2's population is what holds the line if `_history/` ever starts to cross. */
const allFiles = img && typeof img === "object" ? Object.keys(img).filter((k) => typeof img[k] === "string") : [];
const files = allFiles.filter((k) => !k.startsWith("_history/"));
const inFiles = (needle) => files.filter((k) => img[k].includes(needle));
console.log(`  image: ${allFiles.length} file(s), ${files.length} publishable; working-record-only files naming the member: `
  + JSON.stringify(allFiles.filter((k) => k.startsWith("_history/") && img[k].includes(OBS_ID))));
t("the image holds the three files an observation is (bundle.md, data/provenance.json, the words) — the corpus is not empty",
  [files.includes("bundle.md"), files.includes("data/provenance.json"), files.some((k) => k.startsWith("snapshots/observation-"))],
  [true, true, true]);
t("NO PUBLISHABLE FILE of the bundle contains the member id, the handle or the cover",
  { member_id: inFiles(OBS_ID), handle: inFiles(OBS_HANDLE), cover: inFiles(OBS_COVER) },
  { member_id: [], handle: [], cover: [] });
const prov = files.includes("data/provenance.json") ? JSON.parse(img["data/provenance.json"]) : null;
const d0 = prov && Array.isArray(prov.documents) ? prov.documents[0] : null;
t("data/provenance.json names the author, and its chain's hop, as observer:<testimony id>",
  [d0 && d0.author, d0 && d0.provenance_chain && d0.provenance_chain[0] && d0.provenance_chain[0].who],
  [REF, REF]);
t("bundle.md's Session Log names the author as observer:<testimony id>",
  files.includes("bundle.md") ? /^### Session \S+ \| Authored \| (.*)$/m.exec(img["bundle.md"])?.[1] ?? null : null, REF);
const tx2 = await POST(`op=testify&token=${OBSERVER}`, { words: "MK6-WORDS-2: a second thing I saw.", observedAt: "2026-09-11" });
const img2 = tx2 && tx2.ok ? await GET(`op=image&token=${OBSERVER}&id=${encodeURIComponent(tx2.bundle_id)}`) : null;
const d1 = img2 ? JSON.parse(img2["data/provenance.json"]).documents[0] : null;
t("UNLINKABLE: the same member's second observation carries a DIFFERENT reference, its own id, and not the first's",
  [tx2 && tx2.ok, d1 && d1.author, d1 && d1.author !== REF], [true, `observer:${tx2 && tx2.bundle_id}`, true]);

/* ===================================== 2. THE POPULATION: publish a case resting on the observation */
console.log("\n--- 2. a group-level case publishes the observation; no published part names its author ---");
const kdir = mkdtempSync(join(tmpdir(), "mk6-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "iris", "-f", join(kdir, "iris"), "-q"]);
const signBytes = (text) => {
  const f = join(kdir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, text);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(kdir, "iris"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const keyB64 = readFileSync(join(kdir, "iris.pub"), "utf8").trim().split(/\s+/)[1];
const sr = await POST(`op=signeradd&token=${ADM}`, { keyB64, memberId: "iris", comment: "iris laptop" });
const shaOf = async (id) => {
  const l = await GET(`op=list&token=${IRIS}&limit=1000`);
  return (Array.isArray(l) ? l : (l && l.bundles) || []).find((b) => b.bundle_id === id)?.bundle_sha ?? null;
};
const ratify = async (id) => {
  const s = await shaOf(id);
  return POST(`op=ratify&token=${IRIS}`, { bundleId: id, expectedSha: s, sig: signBytes(`bio-ratify ${id} ${s}\n`) });
};
/* The words' bytes into the working bucket by the ordinary capture route any member has — the route
   `test/mk1-publish-probe.mjs` measured to be the one that crossed before the fence existed. */
const put = await (await mf.dispatchFetch(`http://x/api/?op=capture&token=${IRIS}&sha256=${tx.capture_sha}`,
  { method: "PUT", body: new TextEncoder().encode(img[tx.file]) })).json();

const F1 = "INQ-2026-5601-rests-on-obs";
const findingMd = withAdoptableReading(["---", `id: ${F1}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What did the clerk do?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  "references:", `  - target: ${OBS}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next meeting", "    description: The minutes may say otherwise.",
  "basis:", `  - target: ${OBS}`, "    role: supports",
  "    grade: D", "    grade_axis: connection", "    grade_source: testimony",
  "---", "", "## Question", "", "What did the clerk do?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${NOW} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n"), { by: "iris", at: NOW });
const pf = await POST(`op=promote&token=${IRIS}`, { bundleId: F1, base: null, snapKey: "20260918T560001Z_mk6aaaa1",
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: "What did the clerk do?",
          current_state: "open", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: findingMd, bytes: Buffer.byteLength(findingMd), sha256: sha(findingMd) }] });
const cc = await GET(`op=conclude&token=${IRIS}&target=${F1}&conclusion=${encodeURIComponent("It was stamped first.")}`
  + `&falsifier=${encodeURIComponent("A received-log showing a later stamp would overturn this.")}` + adoptedVersionParam());
const PROJECT = await makePublishingProject({ post: POST, mf, sha, machineToken: ADM, owner: "iris",
  name: "PROJ-2026-5601-mk6", created: NOW, updated: NOW });
const pub = await POST(`op=publish&token=${IRIS}`, { project: PROJECT, targets: [F1], roles: allLoadBearing({ targets: [F1] }),
  scope: "Whether the contract was stamped before the vote, on the documents in hand.",
  statement: "This case covers the stamp only, on the documents in hand at edition 1.",
  excluded: [], subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claim to the Clerk on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "This group holds that contracts should be adopted in public session." });
/* MK-7: THE AUTHOR CHOOSES `group` for this edition (§4.2); the act re-authors the unsigned case document, and its
   new hash is what the publisher signs. */
const at = pub && pub.caseDocument ? await POST(`op=attribute&token=${OBSERVER}`, { caseId: pub.caseDocument.case_id,
  edition: pub.caseDocument.edition, observation: OBS, level: "group" }) : null;
const D = pub && pub.caseDocument
  ? { ...pub.caseDocument, doc_sha: at && at.case_document && at.case_document.doc_sha || pub.caseDocument.doc_sha } : null;
const cr = D ? await POST(`op=caseratify&token=${IRIS}`, { caseId: D.case_id, edition: D.edition, expectedSha: D.doc_sha,
  sig: signBytes(`bio-ratify-case ${D.case_id} ${D.edition} ${D.doc_sha}\n`) }) : null;
/* The ceremony's own order (D-431): the case document, then its finding, then the observation as that case's evidence. */
const rf = await ratify(F1);
const ro = await ratify(OBS);
t("THE PUBLICATION WAS DRIVEN, every act answering ok: signer, capture, finding, conclusion, case, the author's group-level act, case ratified, finding ratified, OBSERVATION RATIFIED",
  [okOf(sr), put && put.ok !== false, okOf(pf), okOf(cc), !!D, okOf(at), okOf(cr), okOf(rf), okOf(ro)],
  [[true, null], true, [true, null], [true, null], true, [true, null], [true, null], [true, null], [true, null]]);

/* THE POPULATION: every object in the PUBLISHED bucket (key and bytes), and every public manifest record. */
const bucket = await mf.getR2Bucket("PUBLISHED");
const parts = [];
let cursor;
do {
  const l = await bucket.list({ cursor });
  for (const o of l.objects) parts.push({ where: `bucket:${o.key}`, text: `${o.key}\n${await (await bucket.get(o.key)).text()}` });
  cursor = l.truncated ? l.cursor : undefined;
} while (cursor);
const bucketCount = parts.length;
parts.push({ where: "op=publishedmanifest", text: JSON.stringify(await GET("op=publishedmanifest")) });
if (D) parts.push({ where: "op=publishedcase", text: JSON.stringify(await GET(`op=publishedcase&id=${encodeURIComponent(D.case_id)}`)) });
const partsOf = (needle) => parts.filter((p) => p.text.includes(needle)).map((p) => p.where);
console.log(`  population: ${bucketCount} bucket object(s) + ${parts.length - bucketCount} manifest read(s); `
  + `observation ${OBS}, case ${D && D.case_id}`);
t("THE POPULATION IS THE OBSERVATION PUBLISHED: its words, its authored provenance document and its bundle.md are published objects",
  [partsOf("MK6-WORDS:").some((w) => w.startsWith("bucket:")),
   parts.some((p) => p.where.startsWith("bucket:") && /"authored":\s*true/.test(p.text) && p.text.includes(REF)),
   parts.some((p) => p.where.startsWith("bucket:") && p.text.includes(`id: ${OBS}`) && p.text.includes("## Session Log"))],
  [true, true, true]);
t("THE MATCHER SEES NAMES: the publisher who signed (iris) IS found in the published parts",
  partsOf("iris").length > 0, true);
t("NO PUBLISHED PART — no bucket object, no manifest record — contains the observer's member id, handle or cover",
  Object.fromEntries(Object.entries(NEEDLES).map(([k, v]) => [k, partsOf(v)])),
  { member_id: [], handle: [], cover: [] });

console.log(`\n  corpus: 2 observations by one member; 1 finding, 1 case, ${bucketCount} published objects; `
  + `needles: member id, handle, cover`);
console.log(`\n${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  console.log(`\n${pass} pass, ${fail + 1} fail`);
  await mf.dispose().catch(() => {});
  process.exit(1);
}

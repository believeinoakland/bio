/* NEGATIVE CONTROL: RUN 2026-09-25 by the MK-7 worker from `bio-plane/` through a driver in the session scratchpad (`nc-mk7.mjs`), each arm ALONE, by editing the REAL source (`src/store.mjs` 3,373,677 B sha256 d4d7f67df69a…, `src/index.mjs` 863,470 B sha256 d69685dc9784…), each anchor asserted to occur exactly once, restored by `cp` from a uniquely-named per-arm pristine copy and verified by sha256 AND `cmp` (6 of 6 restores IDENTICAL; never `git checkout --`). ONE ARM PER LEVEL, each dropping that level's handling in `#attributionStatements`' level-to-value branch, as the row asks. Declared BEFORE arming, and the result: (a) `baseline` — nothing armed, MUST be green: 33/0. (b) `group` — group publishes the author's handle: "LEVEL group" MUST FAIL, with both statement arms — 30/3 AS DECLARED. (c) `project` — project publishes the cover: "LEVEL project" MUST FAIL, with both statement arms — 30/3 AS DECLARED. (d) `cover` — cover publishes the handle: "LEVEL cover" MUST FAIL, with both statement arms (and the edition-2 arm, which reaches cover, and the C-92.11 drift arm, whose no-handle author's cover now reads unchosen rather than stale) — 28/5 AS DECLARED. (e) `name` — name publishes the MEMBER ID: "LEVEL name" MUST FAIL, with both statement arms (and the act's own `shown`) — 29/4 AS DECLARED. (f) `veto` — C-92.10 disarmed at op=caseratify (`if (false)`): the unchosen arm MUST FAIL by name — 20/13; its FIRST RUN ended the module on a TypeError after the named failure (a later line read an act's answer bare), recorded as a finding about the instrument and fixed (`docShaOf`), then re-run to the suite's foot. With the veto disarmed the case ratified with four null levels and C-92.12 still refused every observation's own bytes (group and project publish nothing either way), which is the second line holding. (g) `author` — C-92.5 disarmed: the refusal roster MUST FAIL, and the byte-identical arm with it (the owner's act landed and re-authored the document) — 30/3 AS DECLARED. Figures are the FINAL suite's (33 assertions); the first run, before the C-92.11 and C-53.10/.11 arms were added, read 31/0 and the same named failures. The over-strictness side is in the suite: `cover` IS found for the cover observer and the handle IS found for the name observer, and the publisher's own name is found, so the matcher is shown to see names.
 *
 *
 * MK-7 — THE ATTRIBUTION ACT, AND THEN THE LIFT OF MK-1's FENCE (`docs/development/MEMBER-KNOWLEDGE-DESIGN.md`
 * §4.2–§4.6, BOB #19, 2026-09-21; §8's row for MK-3's replacement (ii)).
 *
 * THE RULE. An observation's AUTHOR, and only they, chooses per (case edition, observation) what a published case
 * shows of who said it: `group | project | cover | name`. Nothing is prefilled. An edition reaching an unchosen
 * observation is not signed, and the refusal names each one (§4.4 — PROVISIONAL, the narrow veto). `name`
 * publishes the member's HANDLE and is refused to a member with none (§4.6 — PROVISIONAL). Then MK-1's fence
 * (C-53.10–.12) is LIFTED for every observation in §4.1's form, and stays standing over one that still names its
 * author in its own files.
 *
 * THE ACCEPTANCE IS A ROUND TRIP THROUGH THE OPS, PER LEVEL. Four observers, each with a member id, a handle and a
 * cover that are distinct strings found nowhere else in the fixture, each record one observation; one finding rests
 * on all four; each observer chooses a different level; the case is signed and every part of it is published. Then
 * the POPULATION of published parts (every object in the PUBLISHED bucket, and the public reads) is searched for
 * each observer's three needles: `group` and `project` publish none of them, `cover` publishes the cover and
 * nothing else of theirs, `name` publishes the handle and nothing else of theirs, and no member id is published at
 * any level. The ratified case document states each level and its published value, read back through the op.
 *
 * TWO PLANES. Section 1–6 run on the REAL plane (`src/` as it ships; nothing cut). Section 7 boots a copy of `src/`
 * and `checks/` in this suite's sandbox with THREE edits, each asserted to occur exactly once, to reach three states
 * the ops of this build cannot produce: a member with NO HANDLE (a member enrolled before handles existed, which
 * `members.handle`'s additive column still admits) and an observation in the PRE-§4.1 form (written before MK-6,
 * naming its author in its own files). Neither edit touches the subject (`attributeObservation`, the gate regions).
 *
 * WHAT THIS CANNOT SEE. (1) A leak by a spelling other than the three needles (a hash of a member id). (2) Parts a
 * future publication route would add: the population is what TODAY's ratify and caseratify write. (3) An author
 * learning which editions reach their observation — no read tells them (a DESIGN GAP, reported); the suite hands
 * the case id over, as a surface would.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { ATTRIBUTION_CHECKS, TESTIMONY_CHECKS } from "../checks/bio-checks.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

console.log("\n--- mk7-attribution ---");
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH; publication needs a real member signature");
  console.log("mk7-attribution: SKIPPED");
  process.exit(0);
}

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const okOf = (r) => [r && r.ok, codeOf(r)];
const NOW = "2026-09-18T00:00:00Z";
const ADM = "adm-mk7";

const boot = (scriptPath, instanceName = "believe-in-oakland") => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath,
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: instanceName, ADMIN_TOKEN: ADM, VERSION: "test" },
});

/* Everything one plane needs to drive the ceremony, over that plane's dispatch. */
const driver = (mf, tag) => {
  const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
  const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
  const enrol = async (memberId, handle, cover, capabilities, role = "member") => {
    const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover, role, capabilities });
    const en = await POST("op=enroll", { invite: add && add.invite, handle, password: `${memberId}-passphrase-7` });
    if (!en || !en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
    const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-7` });
    if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
    return lg.token;
  };
  const kdir = mkdtempSync(join(tmpdir(), `mk7-${tag}-`));
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "iris", "-f", join(kdir, "iris"), "-q"]);
  const signBytes = (text, ns = "bio-ratify") => {
    const f = join(kdir, `stmt-${Math.random().toString(36).slice(2)}`);
    writeFileSync(f, text);
    execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(kdir, "iris"), "-n", ns, f], { stdio: ["ignore", "ignore", "ignore"] });
    return readFileSync(f + ".sig", "utf8");
  };
  const keyB64 = readFileSync(join(kdir, "iris.pub"), "utf8").trim().split(/\s+/)[1];
  return { POST, GET, enrol, signBytes, keyB64 };
};

/* One finding resting on every observation named, promoted and concluded by `iris`. */
const findingMd = (id, obs) => withAdoptableReading(["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What did the clerk do?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  "references:", ...obs.flatMap((o) => [`  - target: ${o}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next meeting", "    description: The minutes may say otherwise.",
  "basis:", ...obs.flatMap((o) => [`  - target: ${o}`, "    role: supports",
    "    grade: D", "    grade_axis: connection", "    grade_source: testimony"]),
  "---", "", "## Question", "", "What did the clerk do?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${NOW} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n"), { by: "iris", at: NOW });

const CASE_ARGS = {
  scope: "Whether the contract was stamped before the vote, on the documents in hand.",
  statement: "This case covers the stamp only, on the documents in hand at this edition.",
  excluded: [], subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claim to the Clerk on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "This group holds that contracts should be adopted in public session." };

/* Build a case over `obs` on plane `d`: finding, conclusion, project, op=publish. Returns the pieces. */
const prepareCase = async (d, { IRIS, fid, snap, obs, mf }) => {
  const md = findingMd(fid, obs);
  const pf = await d.POST(`op=promote&token=${IRIS}`, { bundleId: fid, base: null, snapKey: snap,
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "What did the clerk do?",
            current_state: "open", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }] });
  const cc = await d.GET(`op=conclude&token=${IRIS}&target=${fid}&conclusion=${encodeURIComponent("It was stamped first.")}`
    + `&falsifier=${encodeURIComponent("A received-log showing a later stamp would overturn this.")}` + adoptedVersionParam());
  const PROJECT = await makePublishingProject({ post: d.POST, mf, sha, machineToken: ADM, owner: "iris",
    name: `PROJ-2026-57${snap.slice(-2)}-mk7`, created: NOW, updated: NOW });
  const pub = await d.POST(`op=publish&token=${IRIS}`, { project: PROJECT, targets: [fid],
    roles: allLoadBearing({ targets: [fid] }), ...CASE_ARGS });
  return { pf, cc, PROJECT, pub, D: pub && pub.caseDocument };
};

const docOf = async (d, token, D) => d.GET(`op=casedocument&token=${token}&case=${encodeURIComponent(D.case_id)}&edition=${D.edition}`);
const docText = (r) => (r && (r.text || (r.doc && r.doc.text) || (r.document && r.document.text))) || "";
/* The attribution run of a case document, parsed off its text: [{observation, level, shown}]. */
const statementsIn = (text) => {
  const lines = String(text).split("\n");
  const i = lines.indexOf("observation_attributions:");
  const out = [];
  for (let k = i + 1; i >= 0 && k < lines.length && lines[k].startsWith("  "); k++) {
    const m = /^  (?:- )?\s*(\w+): (.*)$/.exec(lines[k]);
    if (!m) continue;
    if (lines[k].startsWith("  - ")) out.push({});
    const v = m[2] === "null" ? null : m[2].replace(/^"|"$/g, "");
    out[out.length - 1][m[1]] = m[1] === "chosen_at_edition" && v !== null ? Number(v) : v;
  }
  return out;
};

const mfs = [];
try {

/* ================================================================== THE REAL PLANE */
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = boot(IDX); mfs.push(mf);
const P = driver(mf, "real");
const IRIS = await P.enrol("iris", "iris", "cover for iris", ["contribute", "publish", "create_projects"], "admin");
const GUS = await P.enrol("gus", "gus", "cover for gus", ["contribute"], "admin");
/* THE FOUNDER claims the instance (after the two first administrators, whose consensus a third would need) (the root of trust, D-421) — it holds a session and is NO `members` row. */
const claimed = await P.POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-mk7" });
const flog = await P.POST("op=login", { role: "admin", password: "founder-passphrase-mk7" });
const FOUNDER = flog && flog.token;
/* FOUR OBSERVERS, one per level, each under three strings found nowhere else in the fixture. */
const LEVELS = ["group", "project", "cover", "name"];
const OBSERVER = {};
for (const lv of LEVELS)
  OBSERVER[lv] = { id: `mk7id${lv}`, handle: `mk7handle-${lv}`, cover: `mk7cover${lv}word`,
                   token: await P.enrol(`mk7id${lv}`, `mk7handle-${lv}`, `the mk7cover${lv}word volunteer`, ["contribute"]) };
const sr = await P.POST(`op=signeradd&token=${ADM}`, { keyB64: P.keyB64, memberId: "iris", comment: "iris laptop" });

console.log("\n--- 1. four members each record an observation; one finding rests on all four; op=publish prepares the case ---");
const OBS = {};
for (const lv of LEVELS) {
  const tx = await P.POST(`op=testify&token=${OBSERVER[lv].token}`,
    { words: `MK7-WORDS-${lv}: on 10 September I watched the deputy clerk stamp the contract RECEIVED.`, observedAt: "2026-09-10" });
  if (!tx || !tx.ok) throw new Error(`testify ${lv}: ${JSON.stringify(tx)}`);
  OBS[lv] = tx.bundle_id;
  const img = await P.GET(`op=image&token=${OBSERVER[lv].token}&id=${encodeURIComponent(tx.bundle_id)}`);
  /* The words' bytes into the working bucket by the ordinary capture route (mk1-publish-probe's crossing route). */
  const put = await (await mf.dispatchFetch(`http://x/api/?op=capture&token=${IRIS}&sha256=${tx.capture_sha}`,
    { method: "PUT", body: new TextEncoder().encode(img[tx.file]) })).json();
  if (!put || put.ok === false) throw new Error(`capture ${lv}: ${JSON.stringify(put)}`);
}
const F1 = "INQ-2026-5701-rests-on-four";
const all4 = LEVELS.map((lv) => OBS[lv]);
const c1 = await prepareCase(P, { IRIS, fid: F1, snap: "20260918T570001Z_mk7aaaa1", obs: all4, mf });
let D = c1.D;
t("the ceremony's first half was driven: signer, finding, conclusion, case document prepared",
  [okOf(sr), okOf(c1.pf), okOf(c1.cc), !!D], [[true, null], [true, null], [true, null], true]);
const d0 = docText(await docOf(P, IRIS, D));
t("NOTHING IS PREFILLED: the prepared case document states all four reached observations, and every level is null",
  statementsIn(d0).map((r) => [r.observation, r.level, r.shown]), all4.map((o) => [o, null, null]));
t("the prepared document says so in its body, where the owner reads what they sign",
  (d0.match(/NO LEVEL IS CHOSEN/g) || []).length, 4);

/* A draft of a NEW case has no identity to key a level to, and the review copy lists the reached observations. */
const dr = await P.POST(`op=casedraft&token=${IRIS}`, { project: c1.PROJECT, targets: [F1], ...CASE_ARGS,
  roles: allLoadBearing({ targets: [F1] }), newCase: true });
const rc = dr && dr.ok ? await P.GET(`op=reviewcopy&token=${IRIS}&draft=${encodeURIComponent(dr.draftId)}`) : null;
t("THE REVIEW COPY LISTS every observation the edition reaches, each with its state (unchosen) and never a level",
  rc && Array.isArray(rc.observations) ? rc.observations.map((o) => [o.observation, o.chosen, "level" in o]) : rc,
  all4.map((o) => [o, false, false]));

/* §4.3's edition-2 arm needs a SECOND finding over the same four observations: edition 1's finding is already a
   member of edition 1 (ALREADY_A_CASE_MEMBER), and a new edition's roster may change (DEC-44). It is written HERE,
   before any observation is published, because a leg graded on a PUBLISHED observation is refused C-21.2 — the
   inheritance rule reads every published bundle as a published case, evidence included (D-598, reported; not this
   item's to change). */
const F2 = "INQ-2026-5704-rests-on-four-again";
const md2 = findingMd(F2, all4);
const pf2 = await P.POST(`op=promote&token=${IRIS}`, { bundleId: F2, base: null, snapKey: "20260918T570004Z_mk7dddd4",
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: "What did the clerk do?",
          current_state: "open", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: md2, bytes: Buffer.byteLength(md2), sha256: sha(md2) }] });
const cc2 = await P.GET(`op=conclude&token=${IRIS}&target=${F2}&conclusion=${encodeURIComponent("It was stamped first.")}`
  + `&falsifier=${encodeURIComponent("A received-log showing a later stamp would overturn this.")}` + adoptedVersionParam());
console.log("\n--- 2. the edition cannot be signed while any reached observation is unchosen, and the refusal names each ---");
const caseSig = (DD) => P.signBytes(`bio-ratify-case ${DD.case_id} ${DD.edition} ${DD.doc_sha}\n`);
const caseratify = async (DD) => P.POST(`op=caseratify&token=${IRIS}`, { caseId: DD.case_id, edition: DD.edition,
  expectedSha: DD.doc_sha, sig: caseSig(DD) });
const cr0 = await caseratify(D);
t("op=caseratify REFUSES ATTRIBUTION_UNCHOSEN (C-92.10), naming all four observations",
  [codeOf(cr0), cr0 && cr0.check, cr0 && Array.isArray(cr0.unchosen) ? cr0.unchosen.map((u) => u.observation) : null],
  ["ATTRIBUTION_UNCHOSEN", ATTRIBUTION_CHECKS.ATTRIBUTION_UNCHOSEN.check, all4]);

console.log("\n--- 3. who may take the act, and what it refuses ---");
const attribute = (token, body) => P.POST(`op=attribute&token=${token}`, { caseId: D.case_id, edition: D.edition, ...body });
const og = OBSERVER.group.token;
const refusals = {
  noLevel: await attribute(og, { observation: OBS.group }),
  unknown: await attribute(og, { observation: OBS.group, level: "anonymous" }),
  owner: await attribute(IRIS, { observation: OBS.group, level: "group" }),
  admin: await attribute(GUS, { observation: OBS.group, level: "group" }),
  otherObserver: await attribute(OBSERVER.name.token, { observation: OBS.group, level: "name" }),
  machine: await attribute(ADM, { observation: OBS.group, level: "group" }),
  notObs: await attribute(og, { observation: F1, level: "group" }),
  noCase: await P.POST(`op=attribute&token=${og}`, { caseId: "CASE-2026-nosuch", edition: 1, observation: OBS.group, level: "group" }),
  wrongEdition: await attribute(og, { edition: 7, observation: OBS.group, level: "group" }),
};
t("each refusal is its own code, from the catalogue: no level (C-92.2), a fifth level (C-92.3), the project OWNER "
  + "(C-92.5), an administrator (C-92.5), another observer (C-92.5), a machine credential (C-92.1), a finding (C-92.4), "
  + "no such case and no such edition (C-92.7, one answer)",
  Object.fromEntries(Object.entries(refusals).map(([k, r]) => [k, [codeOf(r), r && r.check]])),
  { noLevel: ["ATTRIBUTION_NO_LEVEL", "C-92.2"], unknown: ["ATTRIBUTION_LEVEL_UNKNOWN", "C-92.3"],
    owner: ["ATTRIBUTION_NOT_THE_AUTHOR", "C-92.5"], admin: ["ATTRIBUTION_NOT_THE_AUTHOR", "C-92.5"],
    otherObserver: ["ATTRIBUTION_NOT_THE_AUTHOR", "C-92.5"], machine: ["ATTRIBUTION_NOT_A_MEMBER", "C-92.1"],
    notObs: ["ATTRIBUTION_NOT_AN_OBSERVATION", "C-92.4"], noCase: ["ATTRIBUTION_NOT_REACHED", "C-92.7"],
    wrongEdition: ["ATTRIBUTION_NOT_REACHED", "C-92.7"] });
t("every refusal carries its canned translation, the catalogue's own sentence",
  Object.values(refusals).every((r) => r && typeof r.translation === "string"
    && Object.values(ATTRIBUTION_CHECKS).some((row) => row.translation === r.translation)), true);
t("no refusal wrote anything: the prepared document is byte-identical after all nine",
  docText(await docOf(P, IRIS, D)) === d0, true);

/* §4.5 THROUGH THE OPS: the only author a session can carry who is not an active member is the FOUNDER, which is no
   member row at all (a revoked member's sessions die with the revocation, memberSet). Its observation is its own,
   so the author check passes, and the act is refused by name: nobody chooses for an author who is not a member. */
const ftx = FOUNDER ? await P.POST(`op=testify&token=${FOUNDER}`, { words: "MK7-FOUNDER: I saw it as well.", observedAt: "2026-09-10" }) : null;
const fAct = ftx && ftx.ok ? await attribute(FOUNDER, { observation: ftx.bundle_id, level: "group" }) : null;
t("§4.5: an author who is not an active member (the founder, who holds a session and no member row) cannot take the act — ATTRIBUTION_AUTHOR_NOT_ACTIVE (C-92.6)",
  [okOf(claimed), !!FOUNDER, okOf(ftx), codeOf(fAct), fAct && fAct.check],
  [[true, null], true, [true, null], "ATTRIBUTION_AUTHOR_NOT_ACTIVE", "C-92.6"]);

console.log("\n--- 4. each author chooses; the act re-authors the unsigned document; the last unchosen is named alone ---");
const acts = {};
for (const lv of ["group", "project", "cover"]) acts[lv] = await attribute(OBSERVER[lv].token, { observation: OBS[lv], level: lv });
t("three authors choose group, project and cover — each act ok and each re-authors the prepared document",
  ["group", "project", "cover"].map((lv) => [okOf(acts[lv]), acts[lv] && acts[lv].level,
    !!(acts[lv] && acts[lv].case_document && acts[lv].case_document.reauthored)]),
  ["group", "project", "cover"].map((lv) => [[true, null], lv, true]));
const d3 = docText(await docOf(P, IRIS, D));
/* NULL-TOLERANT (measured by this suite's `veto` control arm: with the gate disarmed the case RATIFIED, every later act
   was refused, and a bare read here ended the module on a TypeError after the arm had already failed by name). */
const docShaOf = (r) => (r && r.case_document && r.case_document.doc_sha) || null;
const D3 = { ...D, doc_sha: docShaOf(acts.cover) };
const cr3 = await caseratify(D3);
t("with three chosen, op=caseratify still refuses ATTRIBUTION_UNCHOSEN — naming ONLY the one observation left",
  [codeOf(cr3), cr3 && Array.isArray(cr3.unchosen) ? cr3.unchosen.map((u) => u.observation) : null],
  ["ATTRIBUTION_UNCHOSEN", [OBS.name]]);
acts.name = await attribute(OBSERVER.name.token, { observation: OBS.name, level: "name" });
const again = await attribute(OBSERVER.name.token, { observation: OBS.name, level: "name" });
t("the fourth chooses name; the same choice again is a retry (existed), and moves no byte",
  [okOf(acts.name), acts.name && acts.name.shown, okOf(again), again && again.existed,
   docShaOf(again) !== null && docShaOf(again) === docShaOf(acts.name)],
  [[true, null], OBSERVER.name.handle, [true, null], true, true]);
const staleSigned = await caseratify(D3);
t("a signature over the bytes as they stood before the last act is refused CASE_RATIFY_STALE — the owner signs "
  + "what now states every level, never a document the author's act did not reach",
  codeOf(staleSigned), "CASE_RATIFY_STALE");
const DF = { ...D, doc_sha: docShaOf(acts.name) };
const dF = docText(await docOf(P, IRIS, DF));
t("THE PREPARED DOCUMENT STATES EACH LEVEL AND WHAT IT PUBLISHES, derived from the acts: the group's slug, the "
  + "project, the cover, the handle",
  statementsIn(dF).map((r) => [r.observation, r.level, r.shown, r.chosen_at_edition]),
  [[OBS.group, "group", "believe-in-oakland", D.edition], [OBS.project, "project", c1.PROJECT, D.edition],
   [OBS.cover, "cover", `the ${OBSERVER.cover.cover} volunteer`, D.edition], [OBS.name, "name", OBSERVER.name.handle, D.edition]]);

console.log("\n--- 5. THE LIFT: the case, its finding and every observation cross, in the ceremony's order ---");
const shaOf = async (id) => {
  const l = await P.GET(`op=list&token=${IRIS}&limit=1000`);
  return (Array.isArray(l) ? l : (l && l.bundles) || []).find((b) => b.bundle_id === id)?.bundle_sha ?? null;
};
const ratify = async (id) => {
  const s = await shaOf(id);
  return P.POST(`op=ratify&token=${IRIS}`, { bundleId: id, expectedSha: s, sig: P.signBytes(`bio-ratify ${id} ${s}\n`) });
};
const early = await ratify(OBS.group);
t("BEFORE the case is signed, an observation's own bytes are refused ATTRIBUTION_UNSTATED (C-92.12): no signed "
  + "case states whose words they are",
  [codeOf(early), early && early.check], ["ATTRIBUTION_UNSTATED", ATTRIBUTION_CHECKS.ATTRIBUTION_UNSTATED.check]);
const crF = await caseratify(DF);
const rf = await ratify(F1);
const ro = {};
for (const lv of LEVELS) ro[lv] = await ratify(OBS[lv]);
t("case ratified, finding ratified, and ALL FOUR OBSERVATIONS RATIFIED — MK-1's fence is lifted for them",
  [okOf(crF), okOf(rf), ...LEVELS.map((lv) => okOf(ro[lv]))],
  [[true, null], [true, null], [true, null], [true, null], [true, null], [true, null]]);

console.log("\n--- 6. THE ROUND TRIP: what each level published, over the whole population of published parts ---");
const bucket = await mf.getR2Bucket("PUBLISHED");
const parts = [];
let cursor;
do {
  const l = await bucket.list({ cursor });
  for (const o of l.objects) parts.push({ where: `bucket:${o.key}`, text: `${o.key}\n${await (await bucket.get(o.key)).text()}` });
  cursor = l.truncated ? l.cursor : undefined;
} while (cursor);
const bucketCount = parts.length;
parts.push({ where: "op=publishedmanifest", text: JSON.stringify(await P.GET("op=publishedmanifest")) });
parts.push({ where: "op=publishedcase", text: JSON.stringify(await P.GET(`op=publishedcase&id=${encodeURIComponent(D.case_id)}`)) });
const signedDoc = docText(await P.GET(`op=casedocument&case=${encodeURIComponent(D.case_id)}&edition=${D.edition}`));
parts.push({ where: "op=casedocument (public, ratified)", text: signedDoc });
const partsOf = (needle) => parts.filter((p) => p.text.includes(needle)).map((p) => p.where);
console.log(`  population: ${bucketCount} bucket object(s) + ${parts.length - bucketCount} public read(s); case ${D.case_id}`);
t("THE POPULATION IS THE CASE PUBLISHED: each observation's words are a published object, and the signed case "
  + "document is readable by anyone",
  [...LEVELS.map((lv) => partsOf(`MK7-WORDS-${lv}:`).some((w) => w.startsWith("bucket:"))), signedDoc.includes(`case_id: ${D.case_id}`)],
  [true, true, true, true, true]);
t("THE MATCHER SEES NAMES: the publisher who signed (iris) IS found in the published parts",
  partsOf("iris").length > 0, true);
const seen = (lv) => ({ member_id: partsOf(OBSERVER[lv].id).length > 0, handle: partsOf(OBSERVER[lv].handle).length > 0,
                        cover: partsOf(OBSERVER[lv].cover).length > 0 });
t("LEVEL group: no published part names that observer — no member id, no handle, no cover",
  seen("group"), { member_id: false, handle: false, cover: false });
t("LEVEL project: no published part names that observer — no member id, no handle, no cover",
  seen("project"), { member_id: false, handle: false, cover: false });
t("LEVEL cover: the published parts carry that observer's COVER, and neither their member id nor their handle",
  seen("cover"), { member_id: false, handle: false, cover: true });
t("LEVEL name: the published parts carry that observer's HANDLE, and neither their member id nor their cover",
  seen("name"), { member_id: false, handle: true, cover: false });
t("the SIGNED case document states each level with its published value, read back through the public op",
  statementsIn(signedDoc).map((r) => [r.observation, r.level, r.shown]),
  [[OBS.group, "group", "believe-in-oakland"], [OBS.project, "project", c1.PROJECT],
   [OBS.cover, "cover", `the ${OBSERVER.cover.cover} volunteer`], [OBS.name, "name", OBSERVER.name.handle]]);
const signed1 = await attribute(og, { observation: OBS.group, level: "name" });
t("a signed edition answers forever: an act on it is refused ATTRIBUTION_EDITION_RATIFIED (C-92.8)",
  [codeOf(signed1), signed1 && signed1.check], ["ATTRIBUTION_EDITION_RATIFIED", "C-92.8"]);

console.log("\n--- 6b. §4.3: a LATER edition inherits each choice until its author changes it ---");
if (!pf2?.ok || !cc2?.ok) throw new Error(`edition 2's finding: ${JSON.stringify([pf2, cc2]).slice(0, 300)}`);
const pub2 = await P.POST(`op=publish&token=${IRIS}`, { project: c1.PROJECT, caseId: D.case_id, targets: [F2],
  roles: allLoadBearing({ targets: [F2] }), ...CASE_ARGS,
  statement: "This case covers the stamp only, on the documents in hand at edition 2.",
  subjectJustification: "We put the claim to the Clerk again on 2026-09-20 and printed what came back.",
  biasAcknowledgement: "This group still holds that contracts should be adopted in public session, at edition 2.",
  excluded: [{ description: "the 2019 council minutes", reason: "outside the period at issue" }] });
const D2 = pub2 && pub2.caseDocument;
console.log(`  edition 2: ${JSON.stringify(okOf(pub2))} ${D2 ? `${D2.case_id} edition ${D2.edition}` : JSON.stringify(pub2).slice(0, 300)}`);
const d2 = D2 ? docText(await docOf(P, IRIS, D2)) : "";
t("edition 2 is prepared with NO new act, and states every observation at the level chosen at edition 1",
  [D2 && D2.edition, statementsIn(d2).map((r) => [r.observation, r.level, r.chosen_at_edition])],
  [2, LEVELS.map((lv) => [OBS[lv], lv, 1])]);
const protect = D2 ? await P.POST(`op=attribute&token=${OBSERVER.name.token}`,
  { caseId: D2.case_id, edition: 2, observation: OBS.name, level: "cover" }) : null;
const d2b = D2 ? docText(await docOf(P, IRIS, D2)) : "";
t("its author makes edition 2 MORE protective (name -> cover) by their own act; edition 2 now states cover, chosen at 2, "
  + "and the signed edition 1 still states name",
  [okOf(protect), statementsIn(d2b).find((r) => r.observation === OBS.name) || null,
   statementsIn(docText(await P.GET(`op=casedocument&case=${encodeURIComponent(D.case_id)}&edition=1`))).find((r) => r.observation === OBS.name)?.level],
  [[true, null], { observation: OBS.name, level: "cover", shown: `the ${OBSERVER.name.cover} volunteer`, chosen_at_edition: 2 }, "name"]);

console.log("\n--- 7. OFF THE RECORD IS A STRUCTURAL ABSENCE: the act's table has no column that could hold a source ---");
const schemaText = readFileSync(fileURLToPath(new URL("../src/schema.mjs", import.meta.url)), "utf8");
const tbl = /CREATE TABLE IF NOT EXISTS observation_attributions \(([\s\S]*?)\n\);/.exec(schemaText);
t("observation_attributions holds exactly case_id, edition, bundle_id, level, chosen_by, chosen_at, and a key",
  tbl ? tbl[1].split("\n").map((l) => l.replace(/--.*$/, "").trim()).filter(Boolean).map((l) => l.split(/[\s(]/)[0]) : null,
  ["case_id", "edition", "bundle_id", "level", "chosen_by", "chosen_at", "PRIMARY"]);

/* ================================================================== THE LEGACY-STATE PLANE */
console.log("\n--- 8. a legacy store: a member with no handle, and an observation written before §4.1 ---");
const SB = mkdtempSync(join(tmpdir(), "mk7-legacy-"));
/* The plane's whole relative import graph: `src/`, `checks/`, and `../../docprofile/` (index.mjs's one import outside). */
cpSync(fileURLToPath(new URL("../src", import.meta.url)), join(SB, "bio-plane", "src"), { recursive: true });
cpSync(fileURLToPath(new URL("../checks", import.meta.url)), join(SB, "bio-plane", "checks"), { recursive: true });
cpSync(fileURLToPath(new URL("../../docprofile", import.meta.url)), join(SB, "docprofile"), { recursive: true });
const storePath = join(SB, "bio-plane", "src", "store.mjs");
let st = readFileSync(storePath, "utf8");
/* EDIT 1 — a member enrolled before handles existed: enrolling with the handle `zz-nohandle` leaves it NULL. */
/* CORRECTED at c22-batch29 (merge of MK-7 over D-610), never exempted: D-610 made op=enroll's UPDATE also stamp
   `status_by`, so the branch's anchor (`... invite_hash=NULL, updated=? ...`) no longer occurred in the real store.mjs and
   the EXACTLY-ONCE arm went red at [0,1,1]. The anchor now spells the statement as the union's store.mjs writes it; the
   edit it carries (the handle bound to NULL for `zz-nohandle`) is unchanged. */
const E1 = "this.sql.exec(`UPDATE members SET status='active', handle=?, invite_hash=NULL, status_by=?, updated=? WHERE member_id=?`,\n      h,";
/* EDIT 2 — the pre-§4.1 form: an observation written by `mk7legacy` names its member in its own files, as every
   observation did before MK-6. */
const E2 = "const observer = Store.observerRef(id);";
/* EDIT 3 — a FUTURE op that changes a member's cover (none exists in this build): re-affirming `mk7nohandle` as active
   through op=memberset also moves their cover. It is the one lever that can make a prepared statement drift (C-92.11). */
const E3 = "this.sql.exec(`UPDATE members SET status=?, status_by=?, updated=? WHERE member_id=?`, status, actor, now, memberId);";
const counts = [st.split(E1).length - 1, st.split(E2).length - 1, st.split(E3).length - 1];
st = st.replace(E1, E1.replace("h,", "h === \"zz-nohandle\" ? null : h,"))
        .replace(E2, "const observer = who === \"mk7legacy\" ? who : Store.observerRef(id);")
        .replace(E3, E3 + "\n    if (memberId === \"mk7nohandle\") this.sql.exec(`UPDATE members SET cover='the renamed volunteer' WHERE member_id=?`, memberId);");
writeFileSync(storePath, st);
t("each legacy-state edit's anchor occurs EXACTLY ONCE in the real store.mjs, and neither touches the subject",
  [counts, st.includes("attributeObservation({"), [E1, E2, E3].some((e) => e.includes("attribute"))], [[1, 1, 1], true, false]);
const mf2 = boot(join(SB, "bio-plane", "src", "index.mjs")); mfs.push(mf2);
const L = driver(mf2, "legacy");
const IRIS2 = await L.enrol("iris", "iris", "cover for iris", ["contribute", "publish", "create_projects"], "admin");
await L.enrol("gus", "gus", "cover for gus", ["contribute"], "admin");
const NOH = await L.enrol("mk7nohandle", "zz-nohandle", "the no-handle volunteer", ["contribute"]);
const LEG = await L.enrol("mk7legacy", "mk7legacy-h", "the legacy volunteer", ["contribute"]);
await L.POST(`op=signeradd&token=${ADM}`, { keyB64: L.keyB64, memberId: "iris", comment: "iris laptop" });
const txN = await L.POST(`op=testify&token=${NOH}`, { words: "MK7-NOHANDLE: I saw it.", observedAt: "2026-09-10" });
const c2 = await prepareCase(L, { IRIS: IRIS2, fid: "INQ-2026-5702-nohandle", snap: "20260918T570002Z_mk7bbbb2", obs: [txN.bundle_id], mf: mf2 });
if (!c2.D) throw new Error(`legacy case: ${JSON.stringify([c2.pf, c2.cc, c2.pub]).slice(0, 600)}`);
const noName = await L.POST(`op=attribute&token=${NOH}`, { caseId: c2.D.case_id, edition: c2.D.edition, observation: txN.bundle_id, level: "name" });
const noCover = await L.POST(`op=attribute&token=${NOH}`, { caseId: c2.D.case_id, edition: c2.D.edition, observation: txN.bundle_id, level: "cover" });
t("`name` chosen by a member with NO HANDLE is refused ATTRIBUTION_NAME_NO_HANDLE (C-92.9); `cover` is not",
  [codeOf(noName), noName && noName.check, okOf(noCover)], ["ATTRIBUTION_NAME_NO_HANDLE", "C-92.9", [true, null]]);
/* C-92.11. A STATEMENT THAT DRIFTED FROM WHAT THE ACT NOW PUBLISHES is unreachable through this build's ops BY
   CONSTRUCTION — a cover, a handle and a producing group are each written once (MEASURED: memberAdd INSERTs, enroll
   sets the handle once, instancegroupseed records once, and op=testify refuses a store recording no group) and every
   act re-authors the document. It is retained as the gate's guard for the day an op changes one of them, and driven
   here through EDIT 3 below, which models exactly that day: op=memberset re-affirming `mk7nohandle` also changes their
   cover. The author chose `cover` above; the cover then changes; the prepared bytes still print the old one. */
const recover = await L.POST(`op=memberset&token=${IRIS2}`, { memberId: "mk7nohandle", status: "active" });
const D2S = { ...c2.D, doc_sha: (noCover && noCover.case_document && noCover.case_document.doc_sha) || c2.D.doc_sha };
const stale = await L.POST(`op=caseratify&token=${IRIS2}`, { caseId: D2S.case_id, edition: D2S.edition, expectedSha: D2S.doc_sha,
  sig: L.signBytes(`bio-ratify-case ${D2S.case_id} ${D2S.edition} ${D2S.doc_sha}\n`) });
t("a statement that drifted from what the act now publishes (cover chosen, then the cover changed — EDIT 3) is refused ATTRIBUTION_STATEMENT_STALE (C-92.11), naming the observation",
  [okOf(recover), codeOf(stale), stale && stale.check, stale && stale.observations],
  [[true, null], "ATTRIBUTION_STATEMENT_STALE", "C-92.11", [txN.bundle_id]]);
const txL = await L.POST(`op=testify&token=${LEG}`, { words: "MK7-LEGACY: I saw it too.", observedAt: "2026-09-10" });
const imgL = await L.GET(`op=image&token=${LEG}&id=${encodeURIComponent(txL.bundle_id)}`);
t("the legacy observation names its member in its own files (the state MK-6 ended), so the arm is armed",
  !!(imgL && typeof imgL["data/provenance.json"] === "string" && imgL["data/provenance.json"].includes("\"author\": \"mk7legacy\"")), true);
const c3 = await prepareCase(L, { IRIS: IRIS2, fid: "INQ-2026-5703-legacy", snap: "20260918T570003Z_mk7cccc3", obs: [txL.bundle_id], mf: mf2 });
const legAct = await L.POST(`op=attribute&token=${LEG}`, { caseId: c3.D.case_id, edition: c3.D.edition, observation: txL.bundle_id, level: "group" });
const D3L = { ...c3.D, doc_sha: legAct && legAct.case_document ? legAct.case_document.doc_sha : c3.D.doc_sha };
const legCase = await L.POST(`op=caseratify&token=${IRIS2}`, { caseId: D3L.case_id, edition: D3L.edition, expectedSha: D3L.doc_sha,
  sig: L.signBytes(`bio-ratify-case ${D3L.case_id} ${D3L.edition} ${D3L.doc_sha}\n`) });
t("AN OBSERVATION WRITTEN BEFORE §4.1 STAYS FENCED even with a level chosen: its case is refused "
  + "TESTIMONY_CASE_UNPUBLISHABLE (C-53.12, narrowed), naming it",
  [okOf(legAct), codeOf(legCase), legCase && legCase.check, legCase && legCase.observations],
  [[true, null], "TESTIMONY_CASE_UNPUBLISHABLE", TESTIMONY_CHECKS.TESTIMONY_CASE_UNPUBLISHABLE.check, [txL.bundle_id]]);
const lshaOf = async (id) => {
  const l = await L.GET(`op=list&token=${IRIS2}&limit=1000`);
  return (Array.isArray(l) ? l : (l && l.bundles) || []).find((b) => b.bundle_id === id)?.bundle_sha ?? null;
};
const lratify = async (id) => {
  const s = await lshaOf(id);
  return L.POST(`op=ratify&token=${IRIS2}`, { bundleId: id, expectedSha: s, sig: L.signBytes(`bio-ratify ${id} ${s}\n`) });
};
const legObs = await lratify(txL.bundle_id);
const legFinding = await lratify("INQ-2026-5703-legacy");
t("…and at op=ratify: the legacy observation itself is refused TESTIMONY_UNPUBLISHABLE (C-53.10, narrowed) and a "
  + "finding resting on it TESTIMONY_CITED_UNPUBLISHABLE (C-53.11, narrowed), each naming the observation",
  [codeOf(legObs), legObs && legObs.check, codeOf(legFinding), legFinding && legFinding.check,
   legFinding && Array.isArray(legFinding.rests_on) ? legFinding.rests_on.map((v) => v.observation) : null],
  ["TESTIMONY_UNPUBLISHABLE", TESTIMONY_CHECKS.TESTIMONY_UNPUBLISHABLE.check,
   "TESTIMONY_CITED_UNPUBLISHABLE", TESTIMONY_CHECKS.TESTIMONY_CITED_UNPUBLISHABLE.check, [txL.bundle_id]]);

console.log(`\n  corpus: 4 observers x 1 observation, 1 finding, 1 case, ${bucketCount} published objects; `
  + `legacy plane: 2 observations, 2 cases; needles: member id, handle, cover per observer`);
console.log(`\n${pass} pass, ${fail} fail`);
for (const m of mfs) await m.dispose();
process.exit(fail ? 1 : 0);
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  console.log(`\n${pass} pass, ${fail + 1} fail`);
  for (const m of mfs) await m.dispose().catch(() => {});
  process.exit(1);
}

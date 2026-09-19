/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/ratify-authority.control.mjs` — deliberately NOT a `.test.mjs`, because it runs this suite against PATCHED COPIES of the sources and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/ratify-authority.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once) and the real sources are hashed before and after; what each arm MUST fail is declared in the driver before it arms. (a) `baseline` — nothing armed, MUST be green. (b) `readmit-project-bundles` — the C-58.1 type refusal disarmed: the PROJECT BUNDLE arms publish, so they MUST fail, and nothing else. (c) `no-owner-check` — C-57.1's owner question dropped in `#caseAuthority`: the NON-OWNER arms publish. (d) `no-delivery-check` — the delivery question dropped: the OUTSIDE ADMINISTRATOR, INVITED, UNINVITED, nothing-published and ruth's RETRY arms. (e) `type-before-sight` — role before visibility: the ratifier's viewer not sent to the gate facts, so a hidden project's bundle reaches the type refusal: only the two SIGHT arms that compare answers. (f) `refuse-every-finding` — the liar: every pinned finding refused: every refusal arm STAYS GREEN and the ALLOWED arms and the joined member's retry MUST fail. (g) `authority-after-retry` — the questions asked only for new bytes: only ruth's RETRY arm. D-431 ADDED THREE (2026-09-19), declared before arming: (h) `readmit-unpinned-finding` — the ROW'S CONTROL 1, an inquiry no ratified case pins or rests on skips the C-58.2 refusal: only the OUTSIDE A CASE (a) arms. (i) `rests-on-reads-basis` — the ROW'S CONTROL 2, the refusal reads the finding's BASIS legs instead of `Store.publishedGraphEdges` (a different edge set from the serving): the IDENTITY arms (behavioural and structural) and every evidence arm over a reference-only bundle. (j) `refuse-every-evidence` — the liar on the evidence side: every refusal arm stays green, and every evidence arm that must COMMIT, the evidence authority arms and the graph identity go red.
   RESULTS, RUN 2026-09-18 by the REC-140 worker (worktree agent-a761302b28f105764, base ff3a4cea + this item; real src/index.mjs 661,904 B sha256 a1c6cb7448bb, src/store.mjs 2,614,766 B sha256 e20e357f1a7c, untouched: YES): (a) 32/0 · (b) 27/5 · (c) 28/4 · (d) 26/6 · (e) 30/2 · (f) 25/7 · (g) 31/1 — every arm AS DECLARED on its first run. RESULTS, RUN 2026-09-19 by the D-431 worker (worktree agent-af4cb02e310604e39, base 7042404e + this item; real src/index.mjs 663,888 B sha256 7d80fc4e243a, src/store.mjs 2,647,601 B sha256 8cf9feabd6a6, untouched: YES), the suite now 51 assertions: (a) 51/0 · (b) 47/4 · (c) 44/7 · (d) 42/9 · (e) 49/2 · (f) 41/10 · (g) 50/1 · (h) 47/4 · (i) 42/9 · (j) 42/9 — every arm AS DECLARED on its first run. One figure MOVED and it is recorded, not smoothed: (b) fails 4 where it failed 5, because with the C-58.1 type refusal disarmed a project bundle now meets D-431's store refusal (C-58.3: nothing rests on it), so §1's "nothing was published" stays green — defence in depth, measured. THE PRE-ITEM MEASUREMENT for D-431: §7's three arms PUBLISHED on the base (32/0 with them pinned as published), which is what (h) and (j) re-create. THE PRE-ITEM MEASUREMENT (this suite against the pristine src/ of ff3a4cea, before §6's catalogue rows existed): 13 pass / 19 fail — the owner's own project bundle, the founder's delivery of it and ruth's delivery of gus's signature over it all PUBLISHED (ok:true; gus named attestor); a hidden project's bundle answered vic 409 RATIFY_STALE (naming its real sha) instead of the never-minted 404 ABSENT, and with a valid sha GATE_REFUSED C-13.1 "bundle.md is missing"; a pinned finding signed by gus (joined, not an owner) and by ruth (via the founder) both PUBLISHED; ruth (an outside administrator) DELIVERED iris's signature on A's finding and it PUBLISHED, and wen's and vic's deliveries were then answered ok:true off that commit; the §7 outside-a-case arms passed then and pass now (unchanged by this item, on purpose).
   RE-RUN 2026-09-18 by REC-141 (worktree agent-a12cdccbace704eb6, merged with origin/main at 8e39602a) AFTER correcting this suite for plane-minted project ids (HIDDEN predicted from the PROJ sequence and asserted at the mint; makeCase's project read from the answer); real src/index.mjs 663,811 B sha256 3f4f83fdb5d6, src/store.mjs 2,642,481 B sha256 d9237596e068, untouched: YES — every arm AS DECLARED: (a) 33/0 · (b) 28/5 · (c) 29/4 · (d) 27/6 · (e) 31/2 · (f) 26/7 · (g) 32/1 (each +1 pass: the mint-equals-prediction arm).
   RE-RUN 2026-09-19 by REC-141 after BOB #16's opaque-suffix ruling (HIDDEN no longer predicted; the never-minted read is at NEVER_ID and the SIGHT comparison normalises each read's own id), real src/index.mjs 663,811 B sha256 3f4f83fdb5d6…, src/store.mjs 2,648,430 B sha256 d037f85ce689…, untouched: YES — every arm AS DECLARED: (a) 33/0 · (b) 28/5 · (c) 29/4 · (d) 27/6 · (e) 31/2 · (f) 26/7 · (g) 32/1.
 * =========================================================================
 * REC-140 / D-429 / IC-157 — `op=ratify` UNDER PUBLICATION RULE 2.
 *
 * BOB #15, 2026-09-18, applying `BIO_Publication_v0_1.md` §3 rule 2 (*"Only findings
 * that are part of a project can be published"*) to D-429:
 *   - a PROJECT's own document is not a finding, so `op=ratify` REFUSES a project
 *     bundle outright — a project publishes through its cases;
 *   - wherever `op=ratify` ratifies a FINDING it takes case ratification's rules
 *     (Membership v2 §7): an OWNER of the publishing project signs (C-57.1's
 *     shape), and the deliverer is the FOUNDER or a JOINED member (C-56.1's);
 *   - a caller who cannot see the project is answered exactly as for one that does
 *     not exist, never with a statement about its contents (REC-138's class).
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) refuse every op=ratify. Every refusal arm goes green — so §4 must COMMIT a
 *       finding signed by an owner and delivered by a joined member, by the founder
 *       and by the owner herself.
 *   (2) refuse a project bundle only when the signer is not its owner. §1 has the
 *       OWNER sign and deliver her own project's document, and it must be refused.
 *   (3) check the signer and not the deliverer (or the reverse). §2 carries a
 *       NON-OWNER's signature through a joined member (only the signer check can
 *       refuse); §3 carries an OWNER's signature through an outside administrator
 *       (only the delivery check can refuse).
 *   (4) answer a hidden project's bundle with the type refusal. §0 compares the RAW
 *       answer against a never-minted id's, taken before the id was minted.
 * Every refusal is asserted to have PUBLISHED NOTHING (no edition on the bundle's
 * own chain), and every success to have published.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectFixtureMd, allLoadBearing } from "./publishingproject.mjs";
/* REC-136 (INVESTIGATIVE-SESSION §7.1 item 6): a no-project conclude must NAME the reading it adopts. */
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- ratify-authority ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("ratify-authority: SKIPPED — who may sign and deliver a finding is only evidence over REAL member signatures");
  process.exit(0);
}

/* The control driver points this at an armed copy of the sources (and of checks/). */
const SRC_DIR = process.env.RATIFY_AUTHORITY_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const CHECKS = await import(pathToFileURL(join(SRC_DIR, "..", "checks", "bio-checks.mjs")).href);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "admin-r140-bootstrap";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const init = body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) };
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`, init)).json());
};
const rawOf = async (q, body) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body) });
  return { status: r.status, body: await r.text() };
};
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const NOT_OWNER_SIGNER = "CASE_SIGNER_NOT_AN_OWNER", NOT_IN = "PROJECT_ACT_NOT_A_PARTICIPANT";
const PROJECT_BUNDLE = "RATIFY_PROJECT_BUNDLE";
/* D-431 (C-58.2, C-58.3): nothing crosses outside a RATIFIED case. */
const UNPINNED = "RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE", NOT_EVIDENCE = "RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE";

try {

const dir = mkdtempSync(join(tmpdir(), "ratify-authority-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE STATEMENTS, WRITTEN OUT IN ASCII rather than imported from src/sshsig.mjs:
   an expectation taken from the thing under test agrees with it for free. */
const signWith = (who, text) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, text);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const signCase = (who, d) => signWith(who, `bio-ratify-case ${d.case_id} ${d.edition} ${d.doc_sha}\n`);
const signBundle = (who, id, s) => signWith(who, `bio-ratify ${id} ${s}\n`);

/* ============================================================== FIXTURE */
const claimed = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-140" });
if (!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
const fl = await POST("op=login", { password: "founder-passphrase-140" });
if (!fl || !fl.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
const FOUNDER = fl.token;
const enrol = async (memberId, role, capabilities) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-passphrase-140` });
  if (!en || !en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-140` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* RUTH: an enrolled ADMINISTRATOR in no project here. IRIS owns every project. GUS
   joins each as a participant who is not an owner. WEN is invited and never joins.
   VIC is in no project: the caller a hidden project must read to as nonexistent. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const GUS = await enrol("gus", "member", ["contribute", "publish"]);
const WEN = await enrol("wen", "member", ["contribute", "publish"]);
const VIC = await enrol("vic", "member", ["contribute", "publish"]);
for (const who of ["iris", "gus", "ruth", "vic"]) {
  const reg = await POST(`op=signeradd&token=${ADM}`, { keyB64: mkKey(who), memberId: who, comment: `${who} laptop` });
  if (!reg || reg.ok === false) throw new Error(`signeradd ${who}: ${JSON.stringify(reg)}`);
}

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* D-431: an information bundle the catalog owes nothing at ratification — `last_updated` equals `created` and
   `source_status` is stated (C-13.2, C-2.7) — so an evidence arm reaches the act rather than the gate. REC-140's
   §7 wrote this inline; it is shared now because §8 ratifies information as evidence. */
const publishableInfoMd = (id) => infoMd(id).replace(`last_updated: "${LATER}"`, `last_updated: "${NOW}"`)
  .replace("criticality: supporting", "criticality: supporting\nsource_status: unchanged");
/* `cites`: further bundles the inquiry REFERENCES (`relates_to`) without a basis leg — D-431's §8, where "rests
   on" must be the published graph's edge set and not the basis. */
const inquiryMd = (id, question, target, cites = []) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed",
  ...cites.flatMap((c) => [`  - target: ${c}`, "    rel: relates_to", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${target}`, "    role: supports",
  "    grade: D", "    grade_axis: connection", "    grade_source: testimony",
  "---", "", "## Question", "", question, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
let snapSeq = 0;
/* CORRECTED 2026-09-18 (REC-141, IC-158): a PROJECT's id is MINTED by the plane (Membership v2 §7) and a
   creation naming one is refused PROJECT_ID_SUPPLIED, so a project is created with `id` null, no bundleId and
   bytes with no `id:` line, and its id is read from the answer's `bundleId`. `label` keeps each title distinct
   (it was the chosen id). Every other type still names its own id. */
const promote = async (id, text, objectType, state, label = id) => {
  const r = await POST(`op=promote&token=${ADM}`, {
    ...(id === null ? {} : { bundleId: id }), base: null,
    snapKey: `20260918T${String(900000 + (++snapSeq)).slice(-6)}Z_${sha(String(label)).slice(0, 8)}`,
    meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${label}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [] });
  if (!r || r.ok === false) throw new Error(`promote ${label}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
const must = (what, r) => { if (!r || r.ok !== true) throw new Error(`${what}: ${JSON.stringify(r).slice(0, 600)}`); return r; };
const shaOf = async (id) => {
  const listed = await GET(`op=list&token=${ADM}&limit=1000`);
  return ((Array.isArray(listed) ? listed : (listed && listed.bundles) || []).find((b) => b.bundle_id === id) || {}).bundle_sha;
};
/* How many editions of this bundle's OWN chain are published — read through a
   different op from the one under test. */
const editionsOf = async (id) => {
  const r = await GET(`op=publishededitions&token=${ADM}&id=${encodeURIComponent(id)}`);
  return ((r && r.editions) || []).length;
};
const ratify = async (token, signer, id) => {
  const s = await shaOf(id);
  return POST(`op=ratify&token=${token}`, { bundleId: id, expectedSha: s, sig: signBundle(signer, id, s) });
};

/* One project owned by iris with gus JOINED (not an owner), wen optionally invited;
   one concluded inquiry; a case document authored by iris and RATIFIED by iris, so
   the finding's bytes are PINNED by a published case edition. */
let seq = 0;
/* D-431: `owner`/`joiner` (§8b needs a project gus owns) and `cites` (§8's reference-only evidence) are new;
   the defaults reproduce REC-140's fixture exactly, except that the case's information is now publishable
   (`publishableInfoMd`), because §8 ratifies it as evidence — nothing before §8 ratifies it. `doc` is returned so
   a caller that prepared the case unratified can sign it later. */
const makeCase = async ({ inviteWen = false, ratifyTheCase = true, owner = "iris", joiner = "gus", cites = [] } = {}) => {
  const TOK = { iris: IRIS, gus: GUS };
  const n = String(9400 + (++seq));
  const info = `INFO-2026-${n}-memo`, lead = `INQ-2026-${n}-lead`;
  /* CORRECTED 2026-09-18 (REC-141): the project's id is minted and read from the answer.
     Combined at integration 2026-09-19 (CONDUCT #6) with D-431's owner/joiner/cites parameters. */
  const project = (await promote(null, projectFixtureMd(null, { created: NOW, updated: LATER, name: `PROJ-2026-${n}-case` }),
    "project", "investigating", `PROJ-2026-${n}-case`)).bundleId;
  must(`projectclaimowner ${project}`, await DO("projectclaimowner", { projectId: project, memberId: owner }));
  must(`${owner} invites ${joiner}`, await POST(`op=projectinvite&token=${TOK[owner]}&projectId=${project}&handle=${joiner}`));
  must(`${joiner} joins`, await POST(`op=projectjoin&token=${TOK[joiner]}&projectId=${project}`));
  if (inviteWen) must(`${owner} invites wen`, await POST(`op=projectinvite&token=${TOK[owner]}&projectId=${project}&handle=wen`));
  await promote(info, publishableInfoMd(info), "information", "collected");
  await promote(lead, withAdoptableReading(inquiryMd(lead, `Was the transfer ${lead} authorised?`, info, cites)), "inquiry", "open");
  must(`conclude ${lead}`, await GET(`op=conclude&token=${TOK[owner]}&target=${lead}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
    + adoptedVersionParam()));
  const pub = await POST(`op=publish&token=${TOK[owner]}`, {
    project, targets: [lead], roles: allLoadBearing({ targets: [lead] }),
    scope: "Whether the FY2024 transfer was authorised, on the documents in hand.",
    statement: "This case covers the FY2024 transfer only, on the documents in hand at edition 1.",
    excluded: [], subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds that transfers should be adopted in public session." });
  if (!pub || pub.ok === false || !pub.caseDocument)
    throw new Error(`publish ${project}: ${JSON.stringify(pub).slice(0, 900)}`);
  const d = pub.caseDocument;
  if (ratifyTheCase)
    must(`caseratify ${d.case_id}`, await POST(`op=caseratify&token=${TOK[owner]}`,
      { caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha, sig: signCase(owner, d) }));
  return { project, info, lead, case_id: d.case_id, doc: d };
};

/* ========================================= 0. SIGHT COMES BEFORE EVERYTHING */
console.log("\n--- 0. a caller who cannot SEE the project is answered as for a bundle that does not exist ---");
/* CORRECTED 2026-09-19 (REC-141, IC-158, as corrected by BOB #16's *"A MINTED ID CARRIES NO COUNT"*): HIDDEN was
   CHOSEN ("PROJ-2026-9490-hidden") and minted at that id after the never-minted read. The plane now mints project ids
   with an OPAQUE random suffix, so the id can be neither chosen nor predicted (the 2026-09-18 correction predicted it
   from `allocId`'s counter — the count BOB #16 ruled out). The never-minted read is taken at NEVER_ID, an id of the
   minted shape that names nothing, BEFORE the mint; the hidden read at the minted HIDDEN. The comparison replaces each
   read's OWN id with one placeholder — the only thing the two differ in by construction (`project-disclosure`'s
   precedent for a run id); every other byte must match. */
const YEAR = new Date().toISOString().slice(0, 4);
const NEVER_ID = `PROJ-${YEAR}-0000-t-proj-2026-9490-hidden`;
const bodyFor = (id) => ({ bundleId: id, expectedSha: "0".repeat(64), sig: "not-a-signature" });
const idless = (body, id) => body.split(id).join("<PROJECT-ID>");
/* The never-minted answer, taken BEFORE the project exists, with the same body but its own id. */
const NEVER = await rawOf(`op=ratify&token=${VIC}`, bodyFor(NEVER_ID));
const HIDDEN = (await promote(null, projectFixtureMd(null, { created: NOW, updated: NOW, name: "PROJ-2026-9490-hidden" }),
  "project", "investigating", "PROJ-2026-9490-hidden")).bundleId;
t("the plane minted an id of the canonical shape, not the never-minted one read above",
  [/^PROJ-\d{4}-\d{4}-t-proj-2026-9490-hidden$/.test(String(HIDDEN)), HIDDEN !== NEVER_ID], [true, true]);
must(`projectclaimowner ${HIDDEN}`, await DO("projectclaimowner", { projectId: HIDDEN, memberId: "iris" }));
{
  const hidden = await rawOf(`op=ratify&token=${VIC}`, bodyFor(HIDDEN));
  t("SIGHT: vic (in NO project) ratifying iris's hidden PROJECT bundle answers BYTE FOR BYTE as for an id never minted (each read's own id normalised) — never the type refusal, never a gate finding about its contents",
    [hidden.status, idless(hidden.body, HIDDEN) === idless(NEVER.body, NEVER_ID)], [NEVER.status, true]);
  t("SIGHT: and the never-minted answer is the bundle-level not-found",
    [NEVER.status, /"ABSENT"/.test(NEVER.body)], [404, true]);
  const s = await shaOf(HIDDEN);
  const withSig = await rawOf(`op=ratify&token=${VIC}`, { bundleId: HIDDEN, expectedSha: s, sig: signBundle("iris", HIDDEN, s) });
  const neverSigned = JSON.parse(NEVER.body);
  t("SIGHT: and carrying the OWNER's valid signature over the real sha changes nothing — still the not-found (never 'bundle.md is missing', REC-53's class)",
    [withSig.status, codeOf(rP(JSON.parse(withSig.body))), /bundle\.md is missing/.test(withSig.body)],
    [NEVER.status, codeOf(rP(neverSigned)), false]);
  t("SIGHT: and nothing was published", await editionsOf(HIDDEN), 0);
}

/* ======================================== 1. A PROJECT BUNDLE IS REFUSED OUTRIGHT */
console.log("\n--- 1. op=ratify REFUSES a project bundle, whoever signs and whoever delivers ---");
{
  const r = await ratify(IRIS, "iris", HIDDEN);
  t("PROJECT BUNDLE: iris, the project's OWNER, signs and delivers her own project's document — refused RATIFY_PROJECT_BUNDLE (a project publishes through its cases)",
    [r && r.ok, codeOf(r), typeof (r && r.check), r && r.bundleId], [false, PROJECT_BUNDLE, "string", HIDDEN]);
  const row = CHECKS.RATIFY_SCOPE_CHECKS && CHECKS.RATIFY_SCOPE_CHECKS[PROJECT_BUNDLE];
  t("PROJECT BUNDLE: the refusal carries its catalogued C-number and canned translation (DEC-49)",
    [!!row, r && r.check, r && r.translation], [true, row && row.check, row && row.translation]);
  const f = await ratify(FOUNDER, "iris", HIDDEN);
  t("PROJECT BUNDLE: the FOUNDER delivering the owner's signature is refused the same way",
    [f && f.ok, codeOf(f)], [false, PROJECT_BUNDLE]);
  const d = await ratify(RUTH, "gus", HIDDEN);
  t("PROJECT BUNDLE (D-429's own measurement, CORRECTED 2026-09-18 from case-authority §7 where it was pinned as PUBLISHED): ruth (outside administrator) carrying gus's signature (neither owner nor participant) — refused, and gus is named nowhere",
    [d && d.ok, codeOf(d), JSON.stringify(d).includes("\"attestor\"")], [false, PROJECT_BUNDLE, false]);
  t("PROJECT BUNDLE: and nothing was published by any of the three", await editionsOf(HIDDEN), 0);
}

const A = await makeCase({ inviteWen: true });
const B = await makeCase();
const C = await makeCase();
const E = await makeCase();   /* the NON-OWNERS arms' own finding: break only the thing */
t("the ground: four published case editions, each finding PINNED and none of the findings ratified yet",
  await Promise.all([A, B, C, E].map((x) => editionsOf(x.lead))), [0, 0, 0, 0]);

/* ======================================= 2. AUTHORITY — A NON-OWNER'S SIGNATURE */
console.log("\n--- 2. AUTHORITY — a finding signed by a NON-OWNER is refused, whoever delivers it ---");
{
  const r = await ratify(GUS, "gus", E.lead);
  t("NON-OWNER: gus (JOINED, not an owner) delivers his OWN signature on E's finding — refused CASE_SIGNER_NOT_AN_OWNER; the delivery check passes, so only the signer check can refuse",
    [r && r.ok, codeOf(r), r && r.check, r && r.signer, r && r.project], [false, NOT_OWNER_SIGNER, "C-57.1", "gus", E.project]);
  t("NON-OWNER: the refusal carries C-57.1's canned translation",
    r && r.translation, CHECKS.CASE_AUTHORITY_CHECKS[NOT_OWNER_SIGNER].translation);
  const f = await ratify(FOUNDER, "ruth", E.lead);
  t("NON-OWNER: the FOUNDER delivering ruth's signature (an administrator's, not an owner's) is refused the same way — the founder's route is carriage, never authority",
    [f && f.ok, codeOf(f), f && f.signer], [false, NOT_OWNER_SIGNER, "ruth"]);
  t("NON-OWNER: and nothing was published", await editionsOf(E.lead), 0);
}

/* ============================ 3. DELIVERY — AN OUTSIDE ADMINISTRATOR, AN INVITEE */
console.log("\n--- 3. DELIVERY — an administrator with NO role in the project is refused, even carrying an OWNER's signature ---");
{
  const r = await ratify(RUTH, "iris", A.lead);
  t("OUTSIDE ADMINISTRATOR: ruth (enrolled admin, not in A's project) delivers iris's VALID OWNER signature on A's finding — refused PROJECT_ACT_NOT_A_PARTICIPANT, act ratify",
    [r && r.ok, codeOf(r), r && r.check, r && r.act, r && r.project], [false, NOT_IN, "C-56.1", "ratify", A.project]);
  t("OUTSIDE ADMINISTRATOR: the refusal carries C-56.1's canned translation",
    r && r.translation, CHECKS.PROJECT_AUTHORITY_CHECKS[NOT_IN].translation);
  const w = await ratify(WEN, "iris", A.lead);
  t("INVITED, NOT JOINED: wen (view rights only, §7.5) delivers iris's signature — refused PROJECT_ACT_NOT_A_PARTICIPANT",
    [w && w.ok, codeOf(w)], [false, NOT_IN]);
  const v = await ratify(VIC, "iris", A.lead);
  t("UNINVITED: vic (no role; the case is PUBLIC, so the project id is already public) delivers iris's signature — refused PROJECT_ACT_NOT_A_PARTICIPANT",
    [v && v.ok, codeOf(v)], [false, NOT_IN]);
  t("DELIVERY: and nothing was published", await editionsOf(A.lead), 0);
}

/* ================================= 4. WHAT COMMITS — AN OWNER'S SIGNATURE */
console.log("\n--- 4. ALLOWED — an OWNER's signature publishes the finding, delivered by a joined member, by the FOUNDER, or by the owner ---");
{
  const r = await ratify(GUS, "iris", A.lead);
  t("ALLOWED: gus (JOINED) carries iris's owner signature and A's finding is PUBLISHED, recording iris as attestor and gus as deliverer",
    [r && r.ok, r && r.attestor, r && r.deliveredBy && r.deliveredBy.member], [true, "iris", "gus"]);
  t("ALLOWED (joined member): the finding's chain holds one edition", await editionsOf(A.lead), 1);
  const f = await ratify(FOUNDER, "iris", B.lead);
  t("ALLOWED: the FOUNDER delivers iris's owner signature (DEC-33's interim route) and B's finding is PUBLISHED",
    [f && f.ok, f && f.attestor, f && f.deliveredBy && f.deliveredBy.kind], [true, "iris", "founder"]);
  t("ALLOWED (founder): published", await editionsOf(B.lead), 1);
  const o = await ratify(IRIS, "iris", C.lead);
  t("ALLOWED: the OWNER delivers her own signature and C's finding is PUBLISHED",
    [o && o.ok, o && o.attestor, o && o.deliveredBy && o.deliveredBy.member], [true, "iris", "iris"]);
  t("ALLOWED (owner): published", await editionsOf(C.lead), 1);
}

/* ============================ 5. THE RETRY IS NOT AN AUTHORITY ANSWER */
console.log("\n--- 5. the idempotent retry does not answer an outside administrator ---");
{
  const r = await ratify(RUTH, "iris", A.lead);
  t("RETRY: ruth re-sends a valid owner signature over A's already-published bytes — refused PROJECT_ACT_NOT_A_PARTICIPANT, never `existed: true`",
    [r && r.ok, codeOf(r), r && r.existed === true], [false, NOT_IN, false]);
  const g = await ratify(GUS, "iris", A.lead);
  t("RETRY: the same act by a joined member is the ordinary retry — ok, `existed: true`, still one edition",
    [g && g.ok, g && g.existed, await editionsOf(A.lead)], [true, true, 1]);
}

/* ============================ 6. THE CATALOGUE ROWS */
console.log("\n--- 6. the catalogue rows ---");
{
  const row = CHECKS.RATIFY_SCOPE_CHECKS && CHECKS.RATIFY_SCOPE_CHECKS[PROJECT_BUNDLE];
  t("RATIFY_PROJECT_BUNDLE is catalogued with a C-number and a region in op=ratify",
    [!!row, row && /^C-\d+\.1$/.test(row.check), row && row.where], [true, true, "src/index.mjs fetch > is-ratify-project-bundle"]);
  t("C-57.1's region moved into the ONE helper both ratify paths call",
    CHECKS.CASE_AUTHORITY_CHECKS[NOT_OWNER_SIGNER].where, "src/store.mjs #caseAuthority > is-case-signer-owner");
}

/* ================ 7. OUTSIDE A CASE — REFUSED (D-431), CORRECTED FROM "AS MEASURED" */
console.log("\n--- 7. op=ratify publishes NOTHING outside a ratified case: (a) a finding no RATIFIED case pins is refused ---");
{
  /* CORRECTED 2026-09-19 by the D-431 worker (BIO_Publication_v0_1.md §3 rule 2, the second note, BOB #16).
     These three arms were pinned by REC-140 AS MEASURED — each PUBLISHED, `ok: true`, one edition — because
     the ruling REC-140 built did not say how to close them, and this block said so: "whoever rules on it turns
     these red and corrects them here". BOB #16 ruled: nothing crosses outside a RATIFIED case. So the old
     expectations described a DEFECT (publication outside a case, and the ceremony's order unenforced), not a
     behaviour to keep, and each is corrected to the refusal, with nothing published. Not exempted: the same
     three acts, driven the same way, now asserting what rule 2 requires. */
  const n = "9480";
  const info = `INFO-2026-${n}-loose`, lead = `INQ-2026-${n}-loose`;
  await promote(info, publishableInfoMd(info), "information", "collected");
  await promote(lead, withAdoptableReading(inquiryMd(lead, "Was the loose transfer authorised?", info)), "inquiry", "open");
  must(`conclude ${lead}`, await GET(`op=conclude&token=${IRIS}&target=${lead}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
    + adoptedVersionParam()));
  const l = await ratify(VIC, "vic", lead);
  t("OUTSIDE A CASE (a): a concluded INQUIRY in no case and no project, signed and delivered by vic — refused RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE (C-58.2), its detail naming op=caseratify as the act to take first",
    [l && l.ok, codeOf(l), l && l.check, /op=caseratify/.test(l && l.detail || ""), await editionsOf(lead)],
    [false, UNPINNED, "C-58.2", true, 0]);
  const row = CHECKS.RATIFY_SCOPE_CHECKS[UNPINNED];
  t("OUTSIDE A CASE (a): the refusal carries C-58.2's canned translation (DEC-49)", l && l.translation, row && row.translation);
  /* A FINDING PREPARED INTO A CASE WHOSE DOCUMENT IS NOT YET RATIFIED: refused whoever signs — the
     project's OWNER included, so this is the ceremony's ORDER being enforced and not an authority answer
     (the liar that checks only the signer passes gus's arm and fails iris's). §4 is the other half: A, B
     and C each have their case document signed FIRST, and their findings then commit. */
  const P = await makeCase({ ratifyTheCase: false });
  const p = await ratify(GUS, "gus", P.lead);
  t("OUTSIDE A CASE (a): a finding PREPARED into iris's case, before the case document is ratified, signed and delivered by gus — refused C-58.2",
    [p && p.ok, codeOf(p), await editionsOf(P.lead)], [false, UNPINNED, 0]);
  const o = await ratify(IRIS, "iris", P.lead);
  t("OUTSIDE A CASE (a): and by iris, the project's OWNER, signing and delivering it — refused C-58.2 the same way: the case document comes first",
    [o && o.ok, codeOf(o), /op=caseratify/.test(o && o.detail || ""), await editionsOf(P.lead)], [false, UNPINNED, true, 0]);
  const i = await ratify(VIC, "vic", info);
  t("OUTSIDE A CASE (b): an INFORMATION bundle no RATIFIED case's finding rests on (the loose inquiry above cites it, and is in no case) — refused RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE (C-58.3)",
    [i && i.ok, codeOf(i), i && i.check, await editionsOf(info)], [false, NOT_EVIDENCE, "C-58.3", 0]);
  const pi = await ratify(IRIS, "iris", P.info);
  t("OUTSIDE A CASE (b): the information a PREPARED (unratified) case's finding rests on, signed and delivered by that project's owner — refused C-58.3: only a RATIFIED case's finding makes evidence",
    [pi && pi.ok, codeOf(pi), await editionsOf(P.info)], [false, NOT_EVIDENCE, 0]);
}

/* ================ 8. EVIDENCE — WHAT A RATIFIED CASE'S FINDING RESTS ON CROSSES, UNDER THAT CASE'S AUTHORITY */
console.log("\n--- 8. (b) evidence a ratified case's finding RESTS ON crosses, signed and delivered as that finding is ---");
{
  /* G's finding RESTS ON four bundles: its own information (a basis leg, `cites`), and three it only
     REFERENCES (`relates_to`, no basis leg). "Rests on" is the published graph's own edge set —
     `Store.publishedGraphEdges`, every `references[]` entry at `serve` class — so all four are evidence.
     A reading of "rests on" as the BASIS legs would admit only the first, which is what the identity arms
     (and the control's `rests-on-reads-basis` arm) exist to catch. G2a and G2b are refused-only — one per
     authority question, so a control that disarms one question moves only its own bundle —
     G3 is the evidence published BEFORE the finding, and G.info AFTER it: the published graph serves an
     edge only to a target already published, and C-21.2 refuses a GRADED leg on a published bundle, so a
     leg's own evidence can only follow its finding (stated in the landing as a design gap, not changed). */
  const G2a = "INFO-2026-9470-signer", G2b = "INFO-2026-9470-deliverer", G3 = "INFO-2026-9470-served";
  await promote(G2a, publishableInfoMd(G2a), "information", "collected");
  await promote(G2b, publishableInfoMd(G2b), "information", "collected");
  await promote(G3, publishableInfoMd(G3), "information", "collected");
  const G = await makeCase({ ratifyTheCase: false, cites: [G2a, G2b, G3] });
  const early = await ratify(IRIS, "iris", G3);
  t("EVIDENCE BEFORE THE CASE: iris (owner) signs and delivers what G's finding rests on BEFORE G's case document is ratified — refused C-58.3",
    [early && early.ok, codeOf(early), await editionsOf(G3)], [false, NOT_EVIDENCE, 0]);
  must(`caseratify ${G.case_id}`, await POST(`op=caseratify&token=${IRIS}`,
    { caseId: G.doc.case_id, edition: G.doc.edition, expectedSha: G.doc.doc_sha, sig: signCase("iris", G.doc) }));

  const ev = await ratify(GUS, "iris", G3);
  t("EVIDENCE ALLOWED: gus (JOINED) carries iris's OWNER signature over a bundle G's ratified finding rests on (a reference, not a basis leg) — PUBLISHED, iris attestor, gus deliverer",
    [ev && ev.ok, ev && ev.attestor, ev && ev.deliveredBy && ev.deliveredBy.member, await editionsOf(G3)], [true, "iris", "gus", 1]);
  const fin = await ratify(IRIS, "iris", G.lead);
  t("ALLOWED (finding after its evidence): iris ratifies G's pinned finding — PUBLISHED",
    [fin && fin.ok, fin && fin.attestor, await editionsOf(G.lead)], [true, "iris", 1]);
  t("IDENTITY (ALLOWED finding's graph): the published graph's serve-class edges from G's finding are EXACTLY the four bundles the refusal treats as resting on it (served + dropped = 4), it serves the one already published (G3), and names nothing name-only",
    fin && fin.graph, { serve: 1, name: 0, dropped: 3 });
  const served = await GET(`op=publishedcase&id=${encodeURIComponent(G.case_id)}`);
  const gf = ((served && served.findings) || []).find((x) => x.bundle_id === G.lead) || {};
  t("IDENTITY (ALLOWED finding's graph): read back through op=publishedcase, the one SERVED edge is to G3",
    (gf.serves || []).map((e) => e.to), [G3]);

  const nonOwner = await ratify(GUS, "gus", G2a);
  t("EVIDENCE NON-OWNER: gus (joined, not an owner) signs and delivers a bundle G's finding rests on — refused CASE_SIGNER_NOT_AN_OWNER (C-57.1), the case's own authority, never C-58.3",
    [nonOwner && nonOwner.ok, codeOf(nonOwner), nonOwner && nonOwner.project], [false, NOT_OWNER_SIGNER, G.project]);
  const outsider = await ratify(RUTH, "iris", G2b);
  t("EVIDENCE OUTSIDE ADMINISTRATOR: ruth (admin, not in G's project) carries iris's owner signature — refused PROJECT_ACT_NOT_A_PARTICIPANT (C-56.1)",
    [outsider && outsider.ok, codeOf(outsider)], [false, NOT_IN]);
  const uninvited = await ratify(VIC, "iris", G2b);
  t("EVIDENCE UNINVITED: vic (no role) carries iris's owner signature — refused PROJECT_ACT_NOT_A_PARTICIPANT",
    [uninvited && uninvited.ok, codeOf(uninvited)], [false, NOT_IN]);
  t("EVIDENCE NON-OWNER: and gus's own signature published nothing", await editionsOf(G2a), 0);
  t("EVIDENCE DELIVERY: and nothing was published by either outside deliverer", await editionsOf(G2b), 0);

  const after = await ratify(FOUNDER, "iris", G.info);
  t("EVIDENCE ALLOWED: the FOUNDER delivers iris's signature over G's own basis information, AFTER the finding — PUBLISHED",
    [after && after.ok, after && after.attestor, await editionsOf(G.info)], [true, "iris", 1]);

  const src = readFileSync(join(SRC_DIR, "store.mjs"), "utf8"), idx = readFileSync(IDX, "utf8");
  const calls = (s) => (s.match(/Store\.publishedGraphEdges\(/g) || []).length;
  t("IDENTITY (structural): ONE definition of the published graph's edge set (`static publishedGraphEdges`), read once by op=ratify to build the graph and once by the refusal's rests-on — and op=ratify spells no edge class of its own",
    [(src.match(/static publishedGraphEdges\(/g) || []).length, calls(idx), calls(src), /disclosure: "serve"/.test(idx)],
    [1, 1, 1, false]);
}

console.log("\n--- 8b. several ratified cases rest on one bundle: an owner of ANY of their projects may sign ---");
{
  const shared = "INFO-2026-9471-shared", only = "INFO-2026-9471-only-k1";
  await promote(shared, publishableInfoMd(shared), "information", "collected");
  await promote(only, publishableInfoMd(only), "information", "collected");
  const K1 = await makeCase({ cites: [shared, only] });                    /* iris owns; gus joined */
  const K2 = await makeCase({ owner: "gus", joiner: "iris", cites: [shared] });
  const one = await ratify(GUS, "gus", only);
  t("EVIDENCE NON-OWNER: gus signs a bundle only K1 rests on, where he is joined and not an owner — refused C-57.1",
    [one && one.ok, codeOf(one), one && one.project, await editionsOf(only)], [false, NOT_OWNER_SIGNER, K1.project, 0]);
  const any = await ratify(GUS, "gus", shared);
  t("ANY OWNER: gus signs and delivers a bundle BOTH K1 (iris's) and K2 (his) rest on — PUBLISHED under K2's authority, gus attestor",
    [any && any.ok, any && any.attestor, await editionsOf(shared)], [true, "gus", 1]);
}

console.log("\n--- 8c. a bundle no RATIFIED case rests on answers the same bytes whether or not a project the caller cannot see prepares a case over it ---");
{
  const X = "INFO-2026-9472-unseen";
  await promote(X, publishableInfoMd(X), "information", "collected");
  const s = await shaOf(X);
  const body = { bundleId: X, expectedSha: s, sig: signBundle("vic", X, s) };
  const neverMinted = await rawOf(`op=ratify&token=${VIC}`, body);
  const H = await makeCase({ ratifyTheCase: false, cites: [X] });         /* vic is in no project: H is hidden from him */
  const unseen = await rawOf(`op=ratify&token=${VIC}`, body);
  t("BYTE-IDENTICAL: vic's refusal for a bundle a HIDDEN project's unratified case rests on is byte for byte his refusal from before that project was minted",
    [unseen.status, unseen.body === neverMinted.body, codeOf(rP(JSON.parse(unseen.body))), unseen.body.includes(H.project)],
    [neverMinted.status, true, NOT_EVIDENCE, false]);
  t("BYTE-IDENTICAL: and nothing was published", await editionsOf(X), 0);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
}
await mf.dispose();
console.log(`\nratify-authority: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

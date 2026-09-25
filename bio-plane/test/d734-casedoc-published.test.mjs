/* D-734 — A RATIFIED CASE DOCUMENT'S HASH IS A PUBLISHED HASH.
 *
 * DESIGN: `docs/architecture/BIO_Publication_v0_1.md` §4 (the verify surface, usable with no account), BOB #36's
 * ruling of 2026-09-25 11:50Z on D-731, part (b): at op=caseratify the case document's sha is registered in
 * published_shas (kind `case_document`); op=verify then answers published:true for it, naming the kind; and
 * op=publishedbytes serves those exact bytes from `case_documents.text`, checked byte-identical to the signed sha.
 * An unratified document's sha still answers not published.
 *
 * THE MEASURED GAP THIS MOVES: only bundle parts and MANIFEST.json were in published_shas, so op=verify answered
 * `published:false` for the one hash a member signs at op=caseratify, and op=verify's own sentence (the public
 * surface's "NOT PUBLISHED ... a hash that was never ratified and a hash that never existed are the same answer")
 * equates that with never ratified. REPRODUCED HERE FIRST, in section 1, on a plane booted WITHOUT the registration.
 * The six-edition arm the row's accepts-when names is `civicos-ui/test/draft-binding.test.mjs` section 7, over the
 * six editions that suite ratifies.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) register the sha and serve nothing, or serve the working text: section 2 re-hashes the bytes served, and
 *      compares them with op=casedocument's signed text, byte for byte.
 *  (b) register at ratification only, leaving every edition signed before the landing reading never ratified:
 *      section 1 signs on a plane WITHOUT the registration and asserts the reboot onto this source answers for it.
 *  (c) register at publication (before the signature): section 3 publishes and does not sign, and the sha must
 *      still answer not published, 404 at publishedbytes, with the unsigned text reaching nobody.
 *  (d) re-register on every boot: section 4 reboots twice more and counts the rows.
 *
 * WHAT IT CANNOT SEE, STATED: CASE_DOCUMENT_UNSERVABLE (bytes that do not hash to the sha) is unreachable through
 * any op — every writer of `case_documents.text` recomputes `doc_sha` beside it and a ratified row is never
 * rewritten — so it is driven only by the negative control's arm (c), which corrupts the store's read.
 *
 * NEGATIVE CONTROL: RUN 2026-09-25 by the D-734 worker against `src/store.mjs` bfd60e4b… (3,484,521 B), each arm ALONE,
 * each anchor matched EXACTLY ONCE, restored from a uniquely-named per-arm copy and verified IDENTICAL by sha256 AND
 * `cmp` after every arm; this suite and `civicos-ui/test/draft-binding.test.mjs` run under each. BASELINE 12/0 and 72/0.
 *  (a) THE ROW'S OWN — the committer's `this.#registerCaseDocumentSha(id, ed, …)` call removed from
 *      `ratifyCaseDocument` -> draft-binding 60/12, the six editions' "op=verify answers published:true" and "publishedbytes
 *      serves" rows and nothing else (op=verify answered `{"published":false,"matches":[]}`, publishedbytes 404 — the
 *      defect, reproduced on all six). THIS suite refuses at its fixture (0/1, "the pre-item plane is ARMED"), because
 *      its pre-item copy is made by removing that same call: stated, not smoothed — section 1 IS that arm, run always.
 *  (b) THE BACKFILL — the boot pass's call replaced by an empty statement -> this suite 8/4, section 1's two "AFTER THE
 *      REBOOT" rows and section 4's two (the pre-item edition never answers); draft-binding 72/0, as it must — every
 *      edition there is signed on this source.
 *  (c) THE RE-HASH — the store's read hands back `d.text + " "` -> this suite 10/2 and draft-binding 66/6, every
 *      "publishedbytes serves" row and nothing else (CASE_DOCUMENT_UNSERVABLE, 500, never the wrong bytes).
 *  (d) OVER-STRICTNESS — the path spelled `CASE-DOCUMENT-e<N>.md` -> 12/0 and 72/0. A filename is not the contract.
 */
import "./stdio.mjs";
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process (the pen below) and removes it on exit */
import fs from "fs";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { withSurfacingRun } from "./surfacing-run.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}\n         got  ${g.slice(0, 600)}\n         want ${w.slice(0, 600)}`); fail++; }
};

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH, and every case here is signed");
  console.log("d734-casedoc-published: SKIPPED — ssh-keygen not on PATH");
  process.exit(0);
}

const sha = (v) => createHash("sha256").update(v).digest("hex");
const req = createRequire(new URL("../package.json", import.meta.url));
const { Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href);

/* THE PEN: a copy of the plane with the registration removed (the tree before this item), the Durable Object's
   persisted storage, and the ssh keys — all in one mkdtemp outside the worktree, removed at the foot. */
const PEN = mkdtempSync(join(tmpdir(), "d734-"));
const REPO = new URL("../../", import.meta.url).pathname;
for (const d of ["bio-plane/src", "bio-plane/checks", "docprofile"])
  cpSync(join(REPO, d), join(PEN, "old", d), { recursive: true });
const OLD_STORE = join(PEN, "old/bio-plane/src/store.mjs");
const REG_CALL = "      this.#registerCaseDocumentSha(id, ed, doc.doc_sha, doc.text, now);\n";
{
  const s = readFileSync(OLD_STORE, "latin1");
  const n = s.split(REG_CALL).length - 1;
  t("(fixture) the pre-item plane is ARMED: the committer's registration call is found exactly once and removed", n, 1);
  if (n !== 1) { console.log(`\nd734-casedoc-published: ${pass} pass, ${fail} fail  [FOOT REACHED — fixture refused]`); process.exit(1); }
  writeFileSync(OLD_STORE, s.replace(REG_CALL, ""), "latin1");
}
const opts = (root) => ({
  modules: true, modulesRoot: "/", scriptPath: join(root, "bio-plane/src/index.mjs"),
  script: fs.readFileSync(join(root, "bio-plane/src/index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  durableObjectsPersist: join(PEN, "do"),
  r2Buckets: ["CAPTURES", "PUBLISHED"], r2Persist: join(PEN, "r2"),
  bindings: { INSTANCE_NAME: "d734-instance", ADMIN_TOKEN: "adm-d734", MEMBER_TOKEN: "mem-d734",
              PROBE_TOKEN: "prb-d734", DAEMON_TOKEN: "dmn-d734", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const mf = withSurfacingRun(new Miniflare(opts(join(PEN, "old"))));
const finish = async () => {
  console.log(`\nd734-casedoc-published: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
  await mf.dispose();
  rmSync(PEN, { recursive: true, force: true });
  process.exit(fail ? 1 : 0);
};
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const must = async (what, r) => {
  if (!r || r.ok === false) { t(`FIXTURE: ${what}`, r, { ok: true }); await finish(); }
  return r;
};
/* THE STRANGER'S TWO READS, holding nothing. */
const verify = async (s) => await GET(`op=verify&sha256=${s}`);
const bytesOf = async (s, extra = "") => {
  const r = await mf.dispatchFetch(`http://x/api/?op=publishedbytes&sha256=${s}${extra}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return { status: r.status, kind: r.headers.get("x-published-kind"), buf,
           json: (() => { try { return JSON.parse(buf.toString("utf8")); } catch { return null; } })() };
};

/* ============================================================ 0. THE GROUND */
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(PEN, who), "-q"]);
  return readFileSync(join(PEN, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
const signCase = (who, caseId, edition, docSha) => {
  const f = join(PEN, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify-case ${caseId} ${edition} ${docSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(PEN, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, role, capabilities) => {
  const add = await must(`memberadd ${memberId}`, await POST("op=memberadd&token=adm-d734",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  await must(`enroll ${memberId}`, await POST("op=enroll",
    { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-734` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-734` });
  if (!lg?.token) { t(`FIXTURE: login ${memberId}`, lg, "a token"); await finish(); }
  return lg.token;
};
await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "admin", ["contribute"]);
let IRIS = await enrol("iris", "member", ["contribute", "publish"]);
await must("signeradd iris", await POST("op=signeradd&token=adm-d734",
  { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));
const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-d734", owner: "iris",
  name: "PROJ-2026-7340-casedoc-published", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
let snapSeq = 0;
const promote = async (id, text, objectType, state) => await POST("op=promote&token=adm-d734", {
  bundleId: id, base: null,
  snapKey: `20260925T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
});
const INFO = "INFO-2026-7340-memo";
const infoMd = ["---", `id: ${INFO}`, "object_type: information", "schema: information@1",
  `title: "Info ${INFO}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id, question) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  "references:", `  - target: ${INFO}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${INFO}`, "    role: supports", "    grade: D",
  "    grade_axis: connection", "    grade_source: testimony",
  "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
await must("promote the memo", await promote(INFO, infoMd, "information", "collected"));
const finding = async (tag, question) => {
  const id = `INQ-2026-7340-${tag}`;
  await must(`promote ${id}`, await promote(id, withAdoptableReading(inquiryMd(id, question)), "inquiry", "open"));
  await must(`conclude ${id}`, await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}`
    + adoptedVersionParam()));
  return id;
};
const caseArgs = (target, tag) => ({
  project: PROJ, targets: [target], roles: allLoadBearing({ targets: [target] }),
  scope: `Whether the transfer was authorised (${tag}).`,
  statement: `This case covers the FY2024 transfer only (${tag}); the FY2023 memo is out of it.`,
  excluded: [{ target: null, description: `the FY2023 memo (${tag})`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator (${tag}).`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public (${tag}).`,
});
const publishOnly = async (target, tag) => {
  const p = await must(`publish ${tag}`, await POST(`op=publish&token=${IRIS}`, caseArgs(target, tag)));
  if (!p.caseDocument?.doc_sha) { t(`FIXTURE: publish ${tag} returned a case document`, p, "a doc sha"); await finish(); }
  return p.caseDocument;
};
const ratify = async (d, tag) => await must(`caseratify ${tag}`, await POST(`op=caseratify&token=${IRIS}`,
  { caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha, sig: signCase("iris", d.case_id, d.edition, d.doc_sha) }));
/* What a published case document's sha must answer, stated once. */
const answersPublished = async (label, d) => {
  const v = await verify(d.doc_sha);
  const doc = await GET(`op=casedocument&case=${encodeURIComponent(d.case_id)}&edition=${d.edition}`);
  t(`${label}: op=verify answers published:true for the signed document's sha, ONE match naming the kind `
    + `case_document, the case, its edition's path and the ratification's own time`,
    /* The path is a disclosed FILENAME, asserted only to name its edition, never pinned to one spelling (arm (d)). */
    [v?.ok, v?.published, v?.sha256, (v?.matches || []).map((m) => [m.kind, m.bundle_id,
      typeof m.path === "string" && new RegExp(`(^|\\D)${d.edition}\\.md$`).test(m.path), m.published])],
    [true, true, d.doc_sha, [["case_document", d.case_id, true, doc?.ratified_at]]]);
  const b = await bytesOf(d.doc_sha);
  t(`${label}: op=publishedbytes serves bytes whose sha256 IS that sha, labelled case_document, byte-identical to `
    + `the signed text op=casedocument serves a stranger`,
    [b.status, b.kind, sha(b.buf), doc?.ratified, b.buf.equals(Buffer.from(String(doc?.text ?? ""), "utf8"))],
    [200, "case_document", d.doc_sha, true, true]);
};

/* ============================================================ 1. THE DEFECT, REPRODUCED, AND THE BACKFILL */
console.log("\n--- 1. a case signed on the plane BEFORE this item reads never ratified; this source's boot answers for it ---");
const Q_OLD = await finding("old", "Was the transfer authorised?");
const D_OLD = await publishOnly(Q_OLD, "old");
await ratify(D_OLD, "old");
{
  const v = await verify(D_OLD.doc_sha);
  const doc = await GET(`op=casedocument&case=${encodeURIComponent(D_OLD.case_id)}&edition=${D_OLD.edition}`);
  const b = await bytesOf(D_OLD.doc_sha);
  t("REPRODUCED (the pre-item plane): the document IS ratified at this sha, and op=verify answers published:false "
    + "with no match, and op=publishedbytes 404s NOT_FOUND — 'never ratified' about a signed document",
    [doc?.ratified, doc?.doc_sha === D_OLD.doc_sha, v?.published, (v?.matches || []).length, b.status, b.json?.reason],
    [true, true, false, 0, 404, "NOT_FOUND"]);
}
await mf.setOptions(opts(REPO));   /* the SAME storage, booted on THIS source */
IRIS = (await POST("op=login", { role: "member:iris", password: "iris-passphrase-734" }))?.token ?? IRIS;
await answersPublished("AFTER THE REBOOT (an edition signed before this item)", D_OLD);

/* ============================================================ 2. THE COMMITTER */
console.log("\n--- 2. a case signed on this source is published in the signing act ---");
const Q_NEW = await finding("new", "Was notice given?");
const D_NEW = await publishOnly(Q_NEW, "new");
t("BEFORE THE SIGNATURE the authored document's sha is not published (the registration is the signing act's)",
  (await verify(D_NEW.doc_sha))?.published, false);
await ratify(D_NEW, "new");
await answersPublished("SIGNED ON THIS SOURCE", D_NEW);
{
  const z = await bytesOf(D_NEW.doc_sha, "&format=zip");
  t("format=zip on a case document's sha is refused NOT_A_CONTAINER — a case document is a part, not a container",
    [z.status, z.json?.reason], [400, "NOT_A_CONTAINER"]);
  const r = await POST(`op=caseratify&token=${IRIS}`, { caseId: D_NEW.case_id, edition: D_NEW.edition,
    expectedSha: D_NEW.doc_sha, sig: signCase("iris", D_NEW.case_id, D_NEW.edition, D_NEW.doc_sha) });
  t("a RETRY of the same signature reports existed and registers nothing twice",
    [r?.ok, r?.existed, ((await verify(D_NEW.doc_sha))?.matches || []).length], [true, true, 1]);
}

/* ============================================================ 3. THE UNSIGNED DOCUMENT */
console.log("\n--- 3. an unratified document's sha still answers not published ---");
const Q_UN = await finding("unsigned", "Was the auditor told?");
const D_UN = await publishOnly(Q_UN, "unsigned");
{
  const v = await verify(D_UN.doc_sha);
  const b = await bytesOf(D_UN.doc_sha);
  const anonDoc = await GET(`op=casedocument&case=${encodeURIComponent(D_UN.case_id)}&edition=${D_UN.edition}`);
  t("AN UNRATIFIED DRAFT'S DOCUMENT SHA answers published:false, no match, publishedbytes 404 NOT_FOUND, and its "
    + "text reaches no stranger",
    [v?.published, (v?.matches || []).length, b.status, b.json?.reason, anonDoc?.ok === true && "text" in (anonDoc || {})],
    [false, 0, 404, "NOT_FOUND", false]);
}

/* ============================================================ 4. IDEMPOTENT ACROSS BOOTS */
console.log("\n--- 4. further boots write nothing more ---");
await mf.setOptions(opts(REPO));
await mf.setOptions(opts(REPO));
t("after two more boots every signed document still answers ONE match, and the unsigned one none",
  [((await verify(D_OLD.doc_sha))?.matches || []).length, ((await verify(D_NEW.doc_sha))?.matches || []).length,
   ((await verify(D_UN.doc_sha))?.matches || []).length], [1, 1, 0]);
t("and the published manifest lists exactly the two case_document rows",
  ((await GET("op=publishedmanifest"))?.shas || []).filter((s) => s.kind === "case_document")
    .map((s) => s.sha256).sort(), [D_OLD.doc_sha, D_NEW.doc_sha].sort());

console.log(`\nd734-casedoc-published: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
await mf.dispose();
rmSync(PEN, { recursive: true, force: true });
process.exit(fail ? 1 : 0);

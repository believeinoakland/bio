/* NEGATIVE CONTROL: RUN BY `test/case-edition-conclusion.control.mjs` (a `.control.mjs`, not discovered by the battery, because it EDITS src/ while it runs). Each arm is armed ALONE, restored by cp from a per-arm pristine copy and verified by sha256, by content AND by cmp; the declarations are on that driver, which CHECKS each run against its declaration as a TOTAL (every failing line declared, every declared line failed, every must-not line passed). RUN 2026-09-21 by the REC-157 worker, every restore MATCH / IDENTICAL / SAME: baseline 36/0 * (a) PIN ON bundle_sha ALONE AGAIN, the row's own control -> 21/15, every second-edition arm BY NAME (edition 2 and its says-why, records-claim-B and withdrawn-absent arms; edition 3's three and its discriminator; the prepared window's moved and records arms; the no-project corner's three) and section 5's two, while section 4's surface-OFFERS arm stayed GREEN: the affordance still asks the comparison, so this arm also exposes the DEC-8 disagreement it creates * (b) THE REFUSAL DROPPED, the liar -> 26/10, every UNCHANGED arm (sections 2, 5, 6, 7, 8) and section 2's names-the-edition arm, with the declared cascade of the liar's own writes (three discriminators and section 4's says-why), while EVERY second-edition arm stayed GREEN, which is exactly how the liar passes and why the unchanged arms exist * (c) OVER-STRICTNESS, the claim compared instead of the act -> 33/3, section 6's three edition-3 arms alone * (d) THE NO-PROJECT PIN IGNORED -> 35/1, section 8's unchanged arm alone * (e) THE PREPARED EDITION NOT ASKED -> 33/3, the unchanged-in-the-window arm with its declared cascade (the window's discriminator and moved-names-the-preparation) * (f) THE AFFORDANCE BACK ON !f.case_member ALONE -> 35/1, section 4's surface-OFFERS arm alone, while the act still published. EVERY ARM AS DECLARED. On the UNTOUCHED plane (origin/main 86523052) this suite reads 19/17 — the second-edition arms fail and the section 9 bytes-route arms pass, which is the measured shape of the defect. RE-RUN 2026-09-22 by the REC-166 worker after §9's correction (a make-current no longer writes the shared question, so §9 reaches edition 2 by the CONCLUSION route): baseline 36/0 * (a) 20/16 — one more than before, §9's route arm, which arm (a)'s pin-only refusal now closes, declared MUST FAIL * (b) 26/10 * (c) 33/3 * (d) 35/1 * (e) 33/3 * (f) 35/1; every restore MATCH / IDENTICAL / SAME, EVERY ARM AS DECLARED.
 *
 *   D-667 (declared and RUN 2026-09-25, WORKER D-667; D-564's pattern), THE RECORDER — every section now runs in
 *   `block()` (D-548's recorder, d84-case-manifest.test.mjs); `bail()` THROWS where it tallied, disposed and exited, so
 *   the subject is the SUITE and the arms break a section's FIXTURE. Re-run in one step:
 *   `node test/d564-block.control.mjs case-edition-conclusion` from bio-plane/. BASELINE -> **36 pass, 0 fail**, per section 0 (setup) 0/0,
 *   1 2/0, 2 4/0, 3 3/0, 4 8/0, 5 2/0, 6 4/0, 7 5/0, 8 6/0, 9 2/0, foot reached.
 *   SECTION 7's FIXTURE BROKEN — P's first make-current names a question id that does not exist (the plane answers
 *     VERSION_ACT_NO_SUCH_VERSION); no later section reads 7. Declared: 7 DIES by name with tally -1, every other
 *     section at its baseline tally
 *     -> **31 pass, 1 fail**, `BLOCK 7 DIED: (fixture) P stands on reading A: {"ok":false,"reason":
 *     "VERSION_ACT_NO_SUCH_VERSION",…`, every other section at its baseline tally, foot reached, exit 1, as declared.
 *   THE RECORDER DISARMED (`block()` rethrows) over the same fixture — declared: NO foot and no section tally, exit 1
 *     -> **no foot, exit 1, no section tally**, as declared (run 2026-09-25 by `d564-block.control.mjs`; the real
 *     suite hashed unchanged before and after).
 * ========================================================================= */
/* REC-157 — A MOVED PROJECT CONCLUSION WARRANTS A NEW CASE EDITION
 * (INVESTIGATIVE-SESSION.md §7.1 item 9, BOB #19 2026-09-21, applying items 4
 * and 7; DEC-12 and DEC-19.)
 *
 * WHAT WAS WRONG, measured by REC-135 through the ops and re-driven here: a
 * published case records the PROJECT's adopted claim (REC-135, IC-166), and a
 * project's conclusion is written on the PROJECT (REC-124), so it can move while
 * the finding's bytes never do. `op=publish`'s ALREADY_A_CASE_MEMBER compared
 * the finding's `bundle_sha` alone, so a case went on asserting a claim its
 * project had withdrawn and DEC-19's one route forward (item 7: "the case's next
 * edition carries it") could not be travelled; `op=reopen` is correctly
 * ILLEGAL_TRANSITION there, since the shared question never left `open`.
 *
 * WHAT THIS SUITE FOUND BEFORE IT CHECKED ANYTHING, and it shapes every arm below:
 * `op=versioncurrent` WROTE INTO THE SHARED QUESTION'S OWN BYTES — CORRECTED
 * 2026-09-22 BY REC-166: that was the defect INVESTIGATIVE-SESSION §7's BOB #25 ruling
 * removed (fix (a)), and since REC-166 a make-current writes ONLY the project, so the
 * paragraph below is the measurement of the plane AS IT WAS. Making a reading
 * current promotes the INQUIRY (a Session Log line naming the project's new stance)
 * before it writes the project's pointer, so it MOVES the finding's `bundle_sha`.
 * Measured on the untouched plane (`origin/main` 86523052): conclude, publish,
 * withdraw, MAKE THE OTHER READING CURRENT, conclude, publish — and the second
 * edition PUBLISHES, because the make-current unpinned the finding and the
 * membership refusal was never asked. So a second-edition arm built that way
 * passes over the defect for the wrong reason. EVERY second-edition arm here is
 * therefore built so the finding's bytes are EXACTLY the pin when it publishes,
 * and says so in a DISCRIMINATOR assertion: the project already stands on the
 * reading it re-concludes on (its pointer moved BEFORE the edition that pins the
 * bytes), or it re-concludes on the same reading (REC-135's own probe). Section 9
 * drove the bytes route once, to keep the two routes told apart; since REC-166
 * (2026-09-22) there is no bytes route through a make-current, and section 9 now
 * asserts THAT: the pointer moved after publication leaves the finding at its pin,
 * and the edition is reached by the conclusion comparison, saying so. The
 * discriminators stay: they are what tells this item's route from any other
 * write that moves the bytes.
 *
 * HOW A LIAR PASSES THIS SUITE, stated before what it checks: DROP THE REFUSAL.
 * Every second-edition arm then passes, because an act that refuses nothing
 * publishes everything. So the UNCHANGED arm — publish again when nothing has
 * moved — is driven BESIDE every second-edition arm, and it must still refuse by
 * name, naming the edition that already records the conclusion. The second liar
 * is cheaper: mint the edition and record SOMETHING. So the arms assert the new
 * edition records the NEW claim word for word, that the WITHDRAWN claim is absent
 * from it, and that the earlier edition still stands and still says what it said.
 *
 * WHAT IS DRIVEN, every act through the control plane as a member, every
 * ratified edition signed with a real ssh-keygen signature:
 *  1. EDITION 1. A project concludes on reading A, then moves its pointer to
 *     reading B (the team looks at B while it stands on its conclusion A), and
 *     publishes: the case records claim A. Ratified.
 *  2. THE UNCHANGED ARM. Publishing again is refused ALREADY_A_CASE_MEMBER naming
 *     edition 1; the surface does not offer it; `op=reopen` is still
 *     ILLEGAL_TRANSITION — the shared object's act, unchanged by item 9.
 *  3. THE WITHDRAWAL. Refused NOT_CONCLUDED (withdrew, not never-concluded), and
 *     edition 1 stands, still recording the withdrawn claim as the history it is.
 *  4. THE SECOND EDITION. The project concludes on reading B, which it already
 *     stands on. The finding's bytes are EXACTLY edition 1's pin, and still the
 *     surface offers `publish`, the act mints edition 2 of the SAME case, says why,
 *     and records claim B; edition 1 stands beside it.
 *  5. THE UNCHANGED ARM, AGAIN, naming edition 2.
 *  6. REC-135'S OWN PROBE: withdraw and conclude again on the SAME reading, with a
 *     new falsifier. A conclusion is a dated, authored act and the case records
 *     its falsifier, so edition 3 is warranted and records the new one.
 *  7. THE PREPARED WINDOW. The same comparison against an UNRATIFIED edition:
 *     unchanged is refused naming it `prepared`; a moved conclusion publishes.
 *  8. THE NO-PROJECT CORNER, RUNNING PROVISIONALLY. A question also concluded in
 *     its own bytes: a project concludes it for itself, publishes, withdraws.
 *     REC-135's provisional no-project disjunct admits the next publication, and
 *     this item asks the SAME answer, so an edition is warranted — and it must
 *     DISCLOSE that it rests on the no-project relationship and must not carry the
 *     withdrawn claim. Unchanged after it is refused, by the pin.
 *  9. THE MAKE-CURRENT ROUTE, CLOSED (REC-166, 2026-09-22 — this arm read "THE BYTES
 *     ROUTE, told apart" and asserted the make-current MOVED the finding's bytes,
 *     which was the defect §7's BOB #25 ruling removed): a make-current AFTER
 *     publication writes nothing on the shared question, the finding stays at its
 *     pin, and the edition is warranted by the conclusion comparison and says so.
 *
 * WHAT IT CANNOT SEE, stated rather than left for the next reader: the sharing
 * edge is hand-authored into `references[]` (REC-72's open finding); two
 * conclusion acts identical in content, author and SECOND read as one (the
 * record's timestamps are second-grained), so no arm re-concludes identically and
 * expects an edition; no arm reads the published CONTAINER bytes
 * (`casesign`/`publishedcase` own them); and arm 8's outcome is REC-135's open
 * question to BOB (whether a no-project conclusion admits a case at all) seen from
 * this item's side — if BOB rules the strict reading, arm 8's publication becomes
 * NOT_CONCLUDED and is corrected here.
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseFrontmatter } from "../checks/bio-checks.mjs";
import { ratifyCase } from "./caseceremony.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- case-edition-conclusion ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("case-edition-conclusion.test.mjs: SKIPPED — ssh-keygen not on PATH; a SECOND EDITION exists only "
    + "once the first is ratified, and ratification is a real bio-ratify signature");
  process.exit(0);
}

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const enc = encodeURIComponent;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* INSTANCE_NAME IS BOUND because every install binds it (D-436, IC-172): a store
     records its producing group from it at its FIRST BOOT, and a creation on a
     store recording none is refused GROUP_UNDETERMINED (C-64.1). The fixture
     pattern is D-436's own, in `publish.test.mjs` and `caseproduction.test.mjs`. */
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-r157", MEMBER_TOKEN: "mem-r157",
              PROBE_TOKEN: "prb-r157", DAEMON_TOKEN: "dmn-r157", VERSION: "0.70.0",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
/* D-667 (D-564's pattern): EVERY SECTION RUNS INSIDE `block()` — D-548's recorder (d84-case-manifest.test.mjs), adopted. Before it,
   `bail()` disposed the sandbox and exited on the FIRST fixture failure, so one broken fixture
   ended the run and every later section went unmeasured. Now a fixture failure is a THROW that `block()` records as
   ONE failure naming its section, and the sections after it still run and report. Each section's own tally is
   printed at the foot; a section that DIED prints -1, never the partial count it reached; a section expected but
   never reported fails by name. A section resting on an earlier one's values asks for them with `needs()` and dies
   naming the section it rests on. */
const bail = (what, r) => { throw new Error(`(fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`); };
const needs = (section, vals) => {
  const missing = Object.entries(vals).filter(([, v]) => v === undefined).map(([k]) => k);
  if (missing.length) throw new Error(`rests on section ${section}, which did not produce ${missing.join(", ")}`);
};
const TALLY = [];
const block = async (name, fn) => {
  const p0 = pass, f0 = fail;
  let died = false;
  try { await fn(); }
  catch (e) {
    died = true;
    fail++;
    console.log(`  FAIL  BLOCK ${name} DIED: ${String((e && e.message) || e).slice(0, 700)}`);
    console.log("         (the sections after this one still run — see below)");
  }
  TALLY.push({ name, pass: died ? -1 : pass - p0, fail: died ? -1 : fail - f0, died });
};
const must = async (what, r) => { if (!r || r.ok !== true) await bail(what, r); return r; };

/* ---- the member, the signing key, the ceremony ---- */
const dir = mkdtempSync(join(tmpdir(), "rec157-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "iris", "-f", join(dir, "iris"), "-q"]);
const keyB64 = readFileSync(join(dir, "iris.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "iris"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, role, caps) => {
  const add = await POST("op=memberadd&token=adm-r157",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add?.ok) await bail(`memberadd ${memberId}`, add);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en?.ok) await bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg?.token) await bail(`login ${memberId}`, lg);
  return lg.token;
};
let IRIS, A, P, N, C;

/* ------------------------------------------------------------- DOCUMENTS */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"),
    ...scalar("state", "suggested"),
    ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("claim", v.claim), ...scalar("author", "iris"), ...scalar("at", NOW)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ['  - version: "' + v.name + '"', ...scalar("ground", g),
     ...scalar("asserted_by", "iris"), ...scalar("at", NOW)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ['  - version: "' + v.name + '"', ...scalar("target", l.target),
     ...scalar("role", "supports"), ...scalar("ground", l.ground),
     ...scalar("grade", "B"), ...scalar("grade_axis", "capture"),
     ...scalar("grade_source", "capture")].join("\n")));
  return ["basis_versions:", ...rows,
          ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
const inquiryMd = (id, { title, versions = [], basis = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${title}"`,
  "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(basis.length ? ["references:", ...basis.flatMap((b) => [`  - target: ${b}`,
      "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(basis.length ? ["basis:", ...basis.flatMap((b) => [`  - target: ${b}`, "    role: supports"])] : []),
  ...versionLines(versions),
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* NO `required_strength`: an ABSENT bar gates nothing (DEC-72), and a declared
   bar would put a second refusal in front of the one under test. */
const projectMd = (title, cites) => ["---",
  "object_type: project", "schema: project@1", `title: "${title}"`,
  "current_state: investigating", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(cites.length
    ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
    : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."',
  "---", "", "## Thesis Summary", "", "A project.", "", "## Open Questions", "",
  "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type) => POST(`op=promote&token=${IRIS}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland",
          current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER } });
/* A project's id is MINTED by the plane (REC-141) and its creator becomes its
   OWNER and a JOINED participant in the same write. */
const createProject = async (label, text) => {
  const r = await POST(`op=promote&token=${IRIS}`, {
    base: null, snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland",
            current_state: "investigating", created: NOW, last_updated: LATER } });
  if (!r?.ok || typeof r.bundleId !== "string") await bail(`create project ${label}`, r);
  return r.bundleId;
};
const bundleRow = async (id) => (await GET(`op=list&token=${IRIS}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id) ?? null;

const LEDGER = "INFO-2026-4157-ledger", MINUTES = "INFO-2026-4157-minutes", AUDIT = "INFO-2026-4157-audit";

const CLAIM_A = "The transfer followed the process the council adopted in 2024.";
const CLAIM_B = "The transfer bypassed the council vote the adopted process requires.";
const VA = { name: "paper trail", claim: CLAIM_A,
  description: "The ledger and the minutes together show the transfer was authorised.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const VB = { name: "the audit", claim: CLAIM_B,
  description: "The audit shows the transfer happened without the required vote.",
  grounds: ["the audit"], legs: [{ target: AUDIT, ground: "the audit" }] };

const Q = "INQ-2026-4157-transfer";          /* sections 1-6: the probe path */
const QP = "INQ-2026-4157-prepared";         /* section 7: the unratified window */
const QN = "INQ-2026-4157-no-project";       /* section 8: concluded in its own bytes too */
const QB = "INQ-2026-4157-bytes-route";      /* section 9: the make-current route */

const accept = async (target, version) =>
  POST(`op=versionaccept&token=${IRIS}&target=${enc(target)}&version=${enc(version)}`
     + `&reason=${enc("the evidence holds")}`, {});
const makeCurrent = async (project, target, version) =>
  POST(`op=versioncurrent&token=${IRIS}&target=${enc(target)}&version=${enc(version)}&project=${enc(project)}`, {});
/* A FALSIFIER IS STATED ON EVERY CONCLUSION, never overridden (REC-135's reason). */
const FALSIFIER = "a council minute showing the vote was never taken";
const concludeFor = async (project, target, falsifier = FALSIFIER) =>
  POST(`op=conclude&token=${IRIS}&falsifier=${enc(falsifier)}&target=${enc(target)}&project=${enc(project)}`, {});
const withdraw = async (project, target, reason) =>
  POST(`op=withdrawconclusion&token=${IRIS}&target=${enc(target)}&project=${enc(project)}&reason=${enc(reason)}`, {});

/* EVERY AUTHORED FIELD IS FRESH PER PUBLICATION. C-21.1 refuses a completeness
   statement, justification, exclusion list or bias acknowledgement carried
   forward byte-identical from the case's previous RATIFIED edition, and that
   refusal is not this item's — so each call states its own, numbered. */
let pubSeq = 0;
const publish = async (project, target) => {
  const n = ++pubSeq;
  return POST(`op=publish&token=${IRIS}`, {
    project, scope: `Whether the record answers ${target}.`,
    targets: [target], roles: { [target]: "load_bearing" },
    statement: `This case does not cover the 2025 transfers (publication ${n}).`,
    subjectPosition: "sought_no_answer",
    subjectJustification: `The subject was asked and declined to comment (publication ${n}).`,
    biasAcknowledgement: `The publishing project is funded by a party with an interest (publication ${n}).`,
    excluded: [{ target: null, description: `The 2025 transfers (publication ${n})`, reason: "Out of scope." }] });
};
/* THE CEREMONY: the case document first (it writes the roster and the pins),
   then the finding on its own bytes — the order `op=publish`'s own `next:` names. */
const ratifyAll = async (pub) => {
  await ratifyCase(async (q, b) => POST(q, b), pub, { dir, key: "iris", token: IRIS });
  for (const f of pub.findings || []) {
    const r = await POST(`op=ratify&token=${IRIS}`,
      { bundleId: f.target, expectedSha: f.bundleSha, sig: signRatify(f.target, f.bundleSha) });
    if (!r?.ok) await bail(`ratify ${f.target}`, r);
  }
};
const caseDoc = async (caseId, edition) => {
  const d = await GET(`op=casedocument&token=${IRIS}&case=${enc(caseId ?? "none")}&edition=${edition}`);
  const text = String(d?.text ?? "");
  return { text, row: ((parseFrontmatter(text).data || {}).case_conclusions || [])[0] || {} };
};
const offersPublish = async (target) =>
  ((await GET(`op=affordances&token=${IRIS}&target=${enc(target)}`))?.acts || []).some((a) => a.id === "publish");
const warrantOf = (pub) => (pub?.findings || [])[0]?.edition_warranted || null;

await block("0 (setup)", async () => {
/* ONE member creates, owns and joins every project and signs every edition —
   the member and the finding are held fixed so that what moves between two
   publications is only what the arm moves. */
IRIS = await enrol("iris", "admin", ["contribute", "publish"]);
await must("register iris's signing key",
  await POST("op=signeradd&token=adm-r157", { keyB64, memberId: "iris", comment: "iris laptop" }));
for (const d of [LEDGER, MINUTES, AUDIT]) await must(`promote ${d}`, await promote(d, infoMd(d), "information"));
for (const [id, title] of [[Q, "Did the sewer fund transfer follow the adopted process?"],
                           [QP, "Was the vote recorded?"], [QN, "Was the ledger reconciled?"],
                           [QB, "Was the contract advertised?"]])
  await must(`promote ${id}`, await promote(id, inquiryMd(id, { title, versions: [VA, VB], basis: [LEDGER] }), "inquiry"));
A = await createProject("oversight", projectMd("Oversight", [Q]));
P = await createProject("prepared", projectMd("Prepared", [QP]));
N = await createProject("noproject", projectMd("No project", [QN]));
C = await createProject("bytes", projectMd("Bytes", [QB]));
for (const id of [Q, QP, QN, QB]) for (const v of [VA, VB]) await must(`accept ${v.name} on ${id}`, await accept(id, v.name));
});

let pub1, CASE, PIN1, doc1, pub2;

/* =======================================================================
   1. EDITION 1 — concluded on reading A, the pointer already on B.
   ======================================================================= */
console.log("\n--- 1. edition 1: A concludes on reading A, moves its pointer to B, and publishes ---");
await block("1", async () => {
needs("0 (setup)", { IRIS, A });

await must("A stands on reading A", await makeCurrent(A, Q, VA.name));
await must("A concludes on it", await concludeFor(A, Q));
/* THE POINTER MOVES BEFORE THE EDITION, and the reason was the finding in this
   suite's header: a make-current wrote into the SHARED question's bytes. Moved
   here, it is inside the bytes edition 1 pins, so nothing after edition 1 moves
   them. (Since REC-166, 2026-09-22, a make-current writes only the project, so the
   placement no longer matters to the pin; it is kept so the fixture is unchanged.) Making a reading current is not concluding on it — A still stands on its
   conclusion A, and edition 1 must record exactly that. */
await must("A moves its pointer to reading B, still standing on its conclusion A", await makeCurrent(A, Q, VB.name));
pub1 = await publish(A, Q);
t("A publishes edition 1 of a new case", [pub1?.ok, pub1?.edition, typeof pub1?.caseId], [true, 1, "string"]);
if (pub1?.ok !== true) await bail("edition 1 publishes", pub1);
await ratifyAll(pub1);
CASE = pub1.caseId; PIN1 = pub1.bundleSha;
doc1 = await caseDoc(CASE, 1);
t("edition 1 records A's CONCLUSION — reading A and claim A — not its pointer",
  [doc1.row.relationship, doc1.row.project, doc1.row.version, doc1.row.claim], ["project", A, VA.name, CLAIM_A]);

});

/* =======================================================================
   2. THE UNCHANGED ARM, BEFORE ANYTHING MOVES.
   ======================================================================= */
console.log("\n--- 2. nothing has moved: publishing again is refused, and op=reopen is unchanged ---");
await block("2", async () => {
needs("0 (setup)", { IRIS, A });
needs("1", { CASE });

const same1 = await publish(A, Q);
t("UNCHANGED: publishing again with nothing moved is REFUSED ALREADY_A_CASE_MEMBER — the arm a liar who "
+ "drops the refusal cannot pass",
  [same1?.ok, same1?.reason], [false, "ALREADY_A_CASE_MEMBER"]);
t("and the refusal names the edition that ALREADY records this conclusion, and the relationship it asked",
  [same1?.recorded_by, same1?.relationship, same1?.project],
  [[{ case_id: CASE, edition: 1, state: "ratified" }], "project", A]);
t("the surface agrees: `publish` is NOT offered on the case member (DEC-8)", await offersPublish(Q), false);
const reopen = await GET(`op=reopen&token=${IRIS}&target=${enc(Q)}&reason=${enc("probe: is reopen still the shared act")}`);
t("op=reopen DOES NOT CHANGE: on a question whose own state never left `open` it is still "
+ "ILLEGAL_TRANSITION — the shared object's act, not the project's (REC-136, item 9)",
  [reopen?.ok, reopen?.reason], [false, "ILLEGAL_TRANSITION"]);

});

/* =======================================================================
   3. THE WITHDRAWAL — refused NOT_CONCLUDED, and the last edition stands.
   ======================================================================= */
console.log("\n--- 3. a project that withdrew and has not concluded again cannot publish; edition 1 stands ---");
await block("3", async () => {
needs("0 (setup)", { IRIS, A });
needs("1", { CASE, doc1 });

await must("A withdraws its conclusion", await withdraw(A, Q, "the audit contradicts the minutes"));
const afterWd = await publish(A, Q);
t("a project that WITHDREW is refused NOT_CONCLUDED — the gate asked first, WITHDREW not NEVER-CONCLUDED",
  [afterWd?.ok, afterWd?.reason, afterWd?.why], [false, "NOT_CONCLUDED", "project_withdrew_its_conclusion"]);
const doc1b = await caseDoc(CASE, 1);
t("and edition 1 STANDS, still recording the claim A withdrew — history, never edited (DEC-19)",
  [doc1b.text.length > 0, doc1b.text === doc1.text, doc1b.row.claim], [true, true, CLAIM_A]);
t("the surface does not offer `publish` to a project that stands on no conclusion", await offersPublish(Q), false);

});

/* =======================================================================
   4. THE SECOND EDITION — the conclusion moved, the bytes did not.
   ======================================================================= */
console.log("\n--- 4. A concludes on reading B: the bytes never moved, and a SECOND EDITION is warranted ---");
await block("4", async () => {
needs("0 (setup)", { IRIS, A });
needs("1", { CASE, PIN1, doc1 });

const cB = await must("A concludes on reading B, which it already stands on", await concludeFor(A, Q));
t("(fixture) A's new conclusion adopts claim B and does NOT move the shared question",
  [cB?.version, cB?.claim?.text, cB?.inquiry_moved], [VB.name, CLAIM_B, false]);
const rowQ = await bundleRow(Q);
t("THE DISCRIMINATOR: the finding's bytes are EXACTLY edition 1's pin and its own state is still `open` — "
+ "only the RELATIONSHIP moved, which is the whole of item 9",
  [typeof PIN1, rowQ?.bundle_sha === PIN1, rowQ?.current_state], ["string", true, "open"]);
t("the surface now OFFERS `publish` on the case member — the act and the surface agree (DEC-8)",
  await offersPublish(Q), true);
pub2 = await publish(A, Q);
t("A publishes a SECOND EDITION of the SAME case — the route REC-135 measured as unreachable",
  [pub2?.ok, pub2?.caseId === CASE, pub2?.edition, pub2?.reason ?? null], [true, true, 2, null]);
const why2 = warrantOf(pub2);
t("and the act SAYS why: the publishing project's conclusion moved since the edition pinning these bytes, "
+ "which recorded claim A",
  [why2?.because, (why2?.pinned_editions || []).map((e) => [e.case_id, e.edition, e.state, e.recorded?.claim])],
  ["the_publishing_projects_conclusion_moved", [[CASE, 1, "ratified", CLAIM_A]]]);
if (pub2?.ok === true) await ratifyAll(pub2);
const doc2 = await caseDoc(CASE, 2);
t("edition 2 RECORDS THE NEW CLAIM: A's relationship, reading B, claim B verbatim",
  [doc2.row.relationship, doc2.row.project, doc2.row.version, doc2.row.claim_state, doc2.row.claim],
  ["project", A, VB.name, "adopted", CLAIM_B]);
t("and the WITHDRAWN claim is nowhere in edition 2 — a case that recorded 'the claim' could have written either",
  [doc2.text.length > 0, doc2.text.includes(CLAIM_A)], [true, false]);
const doc1c = await caseDoc(CASE, 1);
t("edition 1 STILL STANDS beside it, byte for byte what was signed (DEC-19: the record of the reversal)",
  [doc1c.text === doc1.text, doc1c.row.claim], [true, CLAIM_A]);

});

/* =======================================================================
   5. THE UNCHANGED ARM, AFTER THE SECOND EDITION.
   ======================================================================= */
console.log("\n--- 5. after edition 2, publishing unchanged is refused again ---");
await block("5", async () => {
needs("0 (setup)", { IRIS, A });
needs("1", { CASE });

const same2 = await publish(A, Q);
t("UNCHANGED AFTER EDITION 2: refused ALREADY_A_CASE_MEMBER, naming edition 2 as the one recording this "
+ "conclusion — beside the second-edition arm, so dropping the refusal fails here",
  [same2?.ok, same2?.reason, same2?.recorded_by],
  [false, "ALREADY_A_CASE_MEMBER", [{ case_id: CASE, edition: 2, state: "ratified" }]]);
t("and the surface stops offering it again", await offersPublish(Q), false);

});

/* =======================================================================
   6. REC-135'S OWN PROBE — the SAME reading, concluded again.
   ======================================================================= */
console.log("\n--- 6. REC-135's own probe: withdraw and conclude again on the SAME reading, with a new falsifier ---");
await block("6", async () => {
needs("0 (setup)", { IRIS, A });
needs("1", { CASE });
needs("4", { pub2 });

const PIN2 = pub2?.bundleSha ?? null;
await must("A withdraws its conclusion B", await withdraw(A, Q, "the audit was provisional"));
const NEW_FALSIFIER = "the final audit report finding the vote was taken";
await must("A concludes on reading B AGAIN, naming a different falsifier", await concludeFor(A, Q, NEW_FALSIFIER));
const rowQ2 = await bundleRow(Q);
t("(discriminator) the finding's bytes are still exactly edition 2's pin",
  [typeof PIN2, rowQ2?.bundle_sha === PIN2], ["string", true]);
const pub3 = await publish(A, Q);
t("a conclusion re-taken after a withdrawal is a NEW dated, authored act, and the case records its "
+ "falsifier — so edition 3 is warranted over the same claim",
  [pub3?.ok, pub3?.caseId === CASE, pub3?.edition], [true, true, 3]);
if (pub3?.ok === true) await ratifyAll(pub3);
const doc3 = await caseDoc(CASE, 3);
t("and edition 3 records claim B with the NEW falsifier",
  [doc3.row.claim, doc3.row.falsifier], [CLAIM_B, NEW_FALSIFIER]);
const same3 = await publish(A, Q);
t("UNCHANGED AFTER EDITION 3: refused again, naming edition 3",
  [same3?.ok, same3?.reason, same3?.recorded_by],
  [false, "ALREADY_A_CASE_MEMBER", [{ case_id: CASE, edition: 3, state: "ratified" }]]);

});

/* =======================================================================
   7. THE PREPARED WINDOW — the same comparison against an UNRATIFIED edition.
   ======================================================================= */
console.log("\n--- 7. the unratified window: the same comparison, asked of a preparation ---");
await block("7", async () => {
needs("0 (setup)", { IRIS, P });

await must("P stands on reading A", await makeCurrent(P, QP, VA.name));
await must("P concludes on it", await concludeFor(P, QP));
await must("P moves its pointer to reading B before publishing", await makeCurrent(P, QP, VB.name));
const prep1 = await publish(P, QP);
t("(fixture) P publishes and does NOT ratify", [prep1?.ok, prep1?.edition], [true, 1]);
const prepSame = await publish(P, QP);
t("UNCHANGED IN THE WINDOW: refused ALREADY_A_CASE_MEMBER, naming the PREPARED edition that records it",
  [prepSame?.ok, prepSame?.reason, prepSame?.recorded_by],
  [false, "ALREADY_A_CASE_MEMBER", [{ case_id: prep1?.caseId ?? null, edition: 1, state: "prepared" }]]);
await must("P withdraws", await withdraw(P, QP, "the vote record was amended"));
await must("P concludes on reading B, which it already stands on", await concludeFor(P, QP));
const rowQP = await bundleRow(QP);
t("(discriminator) the finding's bytes are exactly the preparation's pin",
  [typeof prep1?.bundleSha, rowQP?.bundle_sha === prep1?.bundleSha], ["string", true]);
const prep2 = await publish(P, QP);
t("a MOVED conclusion in the window publishes, and the act names the preparation it moved from",
  [prep2?.ok, (warrantOf(prep2)?.pinned_editions || []).map((e) => [e.state, e.recorded?.claim])],
  [true, [["prepared", CLAIM_A]]]);
const prepDoc = await caseDoc(prep2?.caseId, prep2?.edition ?? 1);
t("and the new preparation records claim B", [prepDoc.row.relationship, prepDoc.row.claim], ["project", CLAIM_B]);

});

/* =======================================================================
   8. THE NO-PROJECT CORNER — running provisionally on REC-135's disjunct.
   ======================================================================= */
console.log("\n--- 8. a question ALSO concluded in its own bytes: the withdrawal's next edition DISCLOSES whose ---");
await block("8", async () => {
needs("0 (setup)", { IRIS, N });

await must("QN is concluded in its own bytes with no project, adopting reading A",
  await GET(`op=conclude&token=${IRIS}&target=${enc(QN)}&version=${enc(VA.name)}`
    + `&conclusion=${enc("The ledger was reconciled.")}&falsifier=${enc(FALSIFIER)}`));
await must("N stands on reading B", await makeCurrent(N, QN, VB.name));
await must("N concludes it FOR ITSELF on reading B (REC-142's project arm)", await concludeFor(N, QN));
const npub1 = await publish(N, QN);
t("(fixture) N publishes on its OWN conclusion", [npub1?.ok, npub1?.edition], [true, 1]);
if (npub1?.ok !== true) await bail("N's edition 1 publishes", npub1);
await ratifyAll(npub1);
const ndoc1 = await caseDoc(npub1.caseId, 1);
t("(fixture) N's edition 1 records N's own claim B", [ndoc1.row.relationship, ndoc1.row.claim], ["project", CLAIM_B]);
await must("N withdraws", await withdraw(N, QN, "the audit was not final"));
const rowQN = await bundleRow(QN);
t("(discriminator) the finding's bytes are exactly edition 1's pin", rowQN?.bundle_sha === npub1.bundleSha, true);
const npub2 = await publish(N, QN);
t("PROVISIONAL (REC-135's no-project disjunct admits it, and this item asks the SAME answer): N's next "
+ "edition is WARRANTED, since what it would record is not what edition 1 recorded",
  [npub2?.ok, npub2?.caseId === npub1.caseId, npub2?.edition], [true, true, 2]);
if (npub2?.ok === true) await ratifyAll(npub2);
const ndoc2 = await caseDoc(npub1.caseId, 2);
t("and it DISCLOSES that it rests on the NO-PROJECT relationship, never on N — the withdrawn claim B is "
+ "not carried forward as N's",
  [ndoc2.row.relationship, ndoc2.row.project, ndoc2.row.claim, ndoc2.text.includes(CLAIM_B),
   ndoc2.text.includes("AT LEAST ONE MEMBER ENTERED THIS CASE ON A CONCLUSION THAT IS NOT THIS PROJECT'S OWN")],
  ["no_project", null, CLAIM_A, false, true]);
const nSame = await publish(N, QN);
t("UNCHANGED AFTER IT: refused ALREADY_A_CASE_MEMBER — the no-project conclusion is compared BY THE PIN",
  [nSame?.ok, nSame?.reason, nSame?.recorded_by],
  [false, "ALREADY_A_CASE_MEMBER", [{ case_id: npub1.caseId, edition: 2, state: "ratified" }]]);

});

/* =======================================================================
   9. THE MAKE-CURRENT ROUTE, CLOSED.
   CORRECTED 2026-09-22 BY REC-166 (INVESTIGATIVE-SESSION §7, BOB #25, fix (a)),
   never exempted. This section asserted that the make-current below MOVED the
   finding's bytes and that the edition then published by the bytes route with no
   `edition_warranted`. That assertion measured the DEFECT: a project's stance
   written into the shared question, unpinning every case on it. With fix (a) the
   make-current writes only the project, so the finding stays at edition 1's pin
   and the second edition is warranted by the conclusion comparison — item 9's
   premise, now true on this path too.
   ======================================================================= */
console.log("\n--- 9. a make-current AFTER publication writes nothing on the shared question: the conclusion route ---");
await block("9", async () => {
needs("0 (setup)", { IRIS, C });

await must("C stands on reading A", await makeCurrent(C, QB, VA.name));
await must("C concludes on it", await concludeFor(C, QB));
const bpub1 = await publish(C, QB);
if (bpub1?.ok !== true) await bail("C's edition 1 publishes", bpub1);
await ratifyAll(bpub1);
await must("C withdraws", await withdraw(C, QB, "the advertisement was re-dated"));
await must("C moves its pointer to reading B AFTER publication", await makeCurrent(C, QB, VB.name));
await must("C concludes on it", await concludeFor(C, QB));
const rowQB = await bundleRow(QB);
t("the make-current AFTER publication WROTE NOTHING on the shared question: the finding is still at edition 1's pin",
  [typeof bpub1.bundleSha, rowQB?.bundle_sha === bpub1.bundleSha], ["string", true]);
const bpub2 = await publish(C, QB);
t("so the edition publishes by the CONCLUSION route — edition 2, carrying `edition_warranted`, because "
+ "the membership refusal WAS asked and the project's conclusion moved",
  [bpub2?.ok, bpub2?.edition, warrantOf(bpub2)?.because ?? null],
  [true, 2, "the_publishing_projects_conclusion_moved"]);
});

/* D-667 (D-564's pattern): every section's own tally, -1 for one that DIED; a section that never recorded at all is named missing
   rather than read as clean — the foot counts the sections it expected against the ones that reported. */
const EXPECTED = ["0 (setup)", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
console.log("\n--- per-section tallies (D-564: -1 = the section DIED, its tally is missing) ---");
for (const n of EXPECTED) {
  const r = TALLY.find((x) => x.name === n);
  if (!r) { fail++; console.log(`  FAIL  section ${n}: NEVER REPORTED — tally -1`); continue; }
  console.log(`  section ${n}: ${r.pass} pass, ${r.fail} fail${r.died ? "  [DIED]" : ""}`);
}
const DIED = TALLY.filter((x) => x.died).map((x) => x.name);
console.log(`\ncase-edition-conclusion.test.mjs: ${pass} pass, ${fail} fail  [FOOT REACHED${DIED.length ? `; DIED: ${DIED.join(", ")}` : ""}]`);
await mf.dispose();
process.exit(fail ? 1 : 0);

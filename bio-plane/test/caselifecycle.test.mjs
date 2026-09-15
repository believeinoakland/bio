/* NEGATIVE CONTROL: see the block at the FOOT of this file. Every arm is armed
   ALONE with every other defence held open, RUN, and recorded there with the
   count it MEASURED. The driver is `test/caselifecycle.control.mjs` — COMMITTED,
   so the arms re-run in one step with `node test/caselifecycle.control.mjs [arm]`
   — and every restore is verified by CONTENT and by sha256 against a
   uniquely-named per-arm pristine copy taken INSIDE THIS WORKTREE (never a
   shared scratchpad: PL-10's harness was overwritten mid-turn by a concurrent
   worker, and UI-38 met an NC harness that reported a byte-identical restore
   over a file it had not restored). */

/* CASE-4 / DEC-72 — LIFECYCLE AND THE REVISION FLAG.
 *
 * Bob ruled DEC-72 on 2026-08-10 and `docs/archive/CASE-AS-PRODUCTION.md` is
 * the design. This item's bullet: *"`published` removed from the inquiry state
 * machine (State Rules amendment); containing cases FLAGGED when a member
 * finding revises; flags set-but-never-clear until each owning project acts."*
 *
 * THE SENTENCE THIS SUITE EXISTS TO PROVE, and it is the one the supersession
 * table is exact about: *"the precondition survives as 'only a CONCLUDED finding
 * may be a case member'; the state itself becomes the case relation."* Removing
 * the state without preserving the precondition would let an UNCONCLUDED finding
 * into a case — a material set asserted over a question nobody has answered,
 * which is this record's worst class of overclaim reached through a lifecycle
 * tidy-up nobody read as a fence move.
 *
 * WHY THAT IS A REAL RISK AND NOT A HYPOTHETICAL. The rule was never written
 * down as a rule. It was an ARRAY ENTRY: `STATES.inquiry.edges.concluded`
 * carried `published`, and `publishCase()` asked `legalFrom.includes("published")`
 * — one expression enforcing TWO facts, that publishing moves the state and that
 * it is reachable only from `concluded`. DEC-72 deletes the first. Delete the
 * entry and the expression is FALSE FROM EVERY STATE, which reads as a gate
 * refusing everything and IS a gate that has stopped asking; anyone repairing
 * that noise by deleting the guard removes the precondition with it. Block 2
 * proves both halves at once: the edge is gone from the table AND an open
 * inquiry is still refused, BY A NAME OF ITS OWN.
 *
 * THE FLAG NEEDS NO SECOND MECHANISM, and that is CASE-5's gift rather than this
 * item's cleverness. CASE-5 unslaved a member's edition from its case's and made
 * a member resolve BY ITS PIN (`bundle_sha = version_sha`). Asked from the
 * member's side the same equality answers "is my CURRENT version the one some
 * case froze" — so the case relation and the revision flag are ONE comparison
 * over ONE column, read in two directions. A marker in the bytes, or a second
 * state, would have been a second authority for a fact the pin already holds.
 *
 * SET-BUT-NEVER-CLEAR IS THE DESIGN, NOT A SIMPLIFICATION. A flag derived on
 * read was written first and is wrong for exactly one reason: it clears itself.
 * Let the head and the pin agree again by any route and the derived answer
 * vanishes with nobody having acted — which is D-79's ruling one altitude up (a
 * finding AGES rather than vanishes, because one that disappears is
 * indistinguishable from one that was never made). A flag that stops being
 * raised is indistinguishable from a project that dealt with it. So the
 * OBSERVATION is derived and the FLAG is written down, once, at the instant the
 * revision mints; nothing deletes a row; and the discharge is ADDED to the row it
 * discharges.
 *
 * EVERY ARM IS DRIVEN THROUGH AN OP, NEVER ASSERTED AT THE STORE. `op=invitelook`
 * shipped with a ReferenceError while 1276 assertions passed. The flags are read
 * through `op=caseflags`; the precondition through `op=publish`; the guards
 * through `op=inquirydivide`, `op=inquiryground`, `op=versionaccept` and
 * `op=dispose`; the lifecycle through `op=reopen` and `op=list`; the freeze
 * through the ANONYMOUS `op=publishedcase`.
 *
 * AND THE EXPECTATIONS ARE NOT DERIVED FROM THE THING UNDER TEST. Six items have
 * shipped a blind assertion here, including ones that had read the prior reports,
 * so this suite copies CASE-5's three defences: every expected PIN is the sha fed
 * to `ssh-keygen -Y sign` BEFORE ratification (captured independently of every
 * column this item wrote); block 8's expectations are PARSED OUT OF
 * `CASE-AS-PRODUCTION.md` at run time, looked for in `docs/development/` AND
 * `docs/archive/` because CASE-6 archives it; and the state-machine arms read
 * `STATES` from the catalog rather than restating it.
 *
 * WHAT NO ARM HERE REACHES, STATED RATHER THAN LEFT TO BE DISCOVERED:
 *   - A CASE WITH SEVERAL OWNING PROJECTS IS NOT REPRESENTABLE IN THIS PLANE.
 *     `cases` is keyed on `case_id` alone (CASE-1) so a case has exactly ONE
 *     owning project, and `FINDING_IN_ANOTHER_CASE` refuses a finding into a
 *     second case — CASE-5 left that fence standing and named lifting it as
 *     CASE-6's. So block 7 proves the SCOPING on the shape the store can
 *     actually produce: two cases, two owning projects, two flagged members, and
 *     one project acting. That is the same ruling (D-266: a disposition is scoped
 *     to the key's own subject) measured where it is measurable, and the arm says
 *     so rather than claiming a shape it did not build.
 *   - A CASE PUBLISHED BEFORE DEC-72 has no `cases` row, so its flags carry
 *     `project_id: null`. That is CASE-1's stated honest answer and it is pinned
 *     by shape in block 5 rather than by a fixture, because this suite cannot
 *     mint a pre-DEC-72 case through the op surface.
 */

import "./stdio.mjs";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { ratifyCase } from "./caseceremony.mjs"; /* CASE-5b: the case-level signing ceremony */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { STATES } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- caselifecycle ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("caselifecycle: SKIPPED — ssh-keygen not on PATH; a pin is the hash a member SIGNED, so every "
    + "flag assertion here rests on a real bio-ratify signature");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-case4", MEMBER_TOKEN: "mem-case4", PROBE_TOKEN: "prb-case4", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* THE ANONYMOUS CALLERS — no token, no cookie, no header. Both the freeze and
   the flags are facts a reader holding nothing is entitled to, so both are read
   by one. */
const anonCase = async (args) => rP(await (await mf.dispatchFetch(`http://x/api/?op=publishedcase&${args}`)).json());
const anonFlags = async (args = "") => rP(await (await mf.dispatchFetch(`http://x/api/?op=caseflags${args ? "&" + args : ""}`)).json());

const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const SCHEMA_SRC = readFileSync(fileURLToPath(new URL("../src/schema.mjs", import.meta.url)), "utf8");

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "caselifecycle-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
const signRatify = (who, bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-case4",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* TWO administrators before any ordinary member (ADMINS_FIRST). vera and wren
   each own a project, because block 7's whole point is TWO owning projects. */
await enrol("nadia", "nadia-passphrase-33", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-33", "admin", ["contribute", "publish"]);
const VERA = await enrol("vera", "vera-passphrase-33", "member", ["contribute", "publish"]);
const WREN = await enrol("wren", "wren-passphrase-33", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-case4", { keyB64: mkKey("vera"), memberId: "vera", comment: "vera laptop" }));
rP(await POST("op=signeradd&token=adm-case4", { keyB64: mkKey("wren"), memberId: "wren", comment: "wren laptop" }));

/* CASE-5b: which key signs the CASE DOCUMENT for which publisher. Two members,
   two projects, two attestors — block 7's whole point is that one project acting
   does not discharge another's flags, so the two ceremonies must be signed by two
   different people or the arm would be over one production asked twice. */
const SIGNER_FOR = { [VERA]: "vera", [WREN]: "wren" };
const listRow = async (id) => ((await GET(`op=list&token=${VERA}&limit=1000`)).result?.bundles
  || (await GET(`op=list&token=${VERA}&limit=1000`)).result || [])
  .find((b) => b.bundle_id === id);
const shaOf = async (id) => (await listRow(id))?.bundle_sha ?? null;
const stateOf = async (id) => (await listRow(id))?.current_state ?? null;

/* THE RATIFY HELPER RETURNS THE SHA IT SIGNED. Every expected pin and every
   expected `pinned_sha` below is THIS value — the hash that went into the signed
   statement — and never a value read back out of a column this item wrote. The
   two sides of each assertion therefore cannot move together, which is the
   blind-by-construction class this suite is written to stay out of. */
const ratify = async (who, tok, id) => {
  const bundleSha = await shaOf(id);
  const r = rP(await POST(`op=ratify&token=${tok}`,
    { bundleId: id, expectedSha: bundleSha, sig: signRatify(who, id, bundleSha) }));
  return { ...r, signedSha: bundleSha };
};

/* ---- documents ---- */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
      `    grade: ${l.grade}`, `    grade_axis: ${l.axis}`, `    grade_source: ${l.source}`])]
  : [];
const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
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

let snapSeq = 0;
const promote = async (tok, id, md, type, state = "open", extra = {}) => rP(await POST(`op=promote&token=${tok}`, {
  bundleId: id, base: extra.base ?? null,
  snapKey: `20260910T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
  register: extra.register || [],
}));
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[1]}: ${JSON.stringify(r)}`);
  return r;
};
const conclude = async (tok, target, conclusion, falsifier) =>
  rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`));
const reopen = async (tok, target, reason) =>
  rP(await GET(`op=reopen&token=${tok}&target=${encodeURIComponent(target)}&reason=${encodeURIComponent(reason)}`));
const affordances = async (tok, target) =>
  rP(await GET(`op=affordances&token=${tok}&target=${encodeURIComponent(target)}`));
const actIds = (a) => (a?.acts || []).map((x) => x.id);

const INFO_A = "INFO-2026-4400-memo";
const INFO_B = "INFO-2026-4400-left-out";
/* VERA's case */
const V_PUB = "INQ-2026-4400-vera-member";
/* WREN's case — a SECOND owning project, for block 7 */
const W_PUB = "INQ-2026-4400-wren-member";
/* Never published, never in a case: every over-strictness arm's subject */
const FREE = "INQ-2026-4400-never-published";
const OPEN = "INQ-2026-4400-still-open";

const DOC_CAP_SHA = sha("caselifecycle-INFO_A-bytes");
await mustPromote(VERA, INFO_A, infoMd(INFO_A), "information", "collected",
  { register: [{ path: "snapshots/source.bin", sha256: DOC_CAP_SHA, bytes: 512, encoding: "binary" }] });
await mustPromote(VERA, INFO_B, infoMd(INFO_B), "information", "collected");
const inqBody = (id) => inquiryMd(id, { question: "Was the sewer transfer authorised?",
  refs: [INFO_A], legs: [{ target: INFO_A, grade: "B", axis: "capture", source: "capture" }] });
for (const id of [V_PUB, W_PUB, FREE, OPEN]) await mustPromote(VERA, id, inqBody(id), "inquiry");

for (const [tok, id] of [[VERA, V_PUB], [WREN, W_PUB], [VERA, FREE]]) {
  const c = await conclude(tok, id, "The transfer rests on a memo nobody adopted.",
    "An adopted resolution naming the transfer would overturn this.");
  if (!c.ok) throw new Error(`conclude ${id}: ${JSON.stringify(c)}`);
}

const V_PROJECT = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-case4", owner: "vera",
  id: "PROJ-2026-0400-vera", created: NOW, updated: LATER });
const W_PROJECT = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-case4", owner: "wren",
  id: "PROJ-2026-0400-wren", created: NOW, updated: LATER });

/* CASE-5b: THE CASE CEREMONY RIDES THIS HELPER — see caseceremony.mjs. The
   revision FLAG this suite is about is raised against a case edition, and a case
   edition now exists once its DOCUMENT is signed, so the ceremony runs here.
   The signer key is the member whose token is publishing, which is how this
   suite's two projects keep two distinct attestors. */
const publishCase = async (tok, project, body, { sign = true, key = null } = {}) => {
  const r = rP(await POST(`op=publish&token=${tok}`,
    { project, roles: allLoadBearing(body), ...body }));
  if (sign && r && r.ok !== false && r.caseDocument)
    await ratifyCase(async (q, b) => rP(await POST(q, b)), r,
                     { dir, key: key ?? SIGNER_FOR[tok], token: tok });
  return r;
};

/* EVERY AUTHORED FIELD IS FRESH PER EDITION, INCLUDING THE EXCLUSION LIST — C-21.1
   refuses a completeness claim carried forward byte-identically, and it caught
   this fixture's first draft. That refusal is CASE-2's and this suite is not
   about it, so the fixture states this edition's limits in this edition's words
   rather than the suite reaching around the gate. */
/* A FIXTURE FAILURE IS REPORTED BY NAME AND WITH A TALLY, NEVER THROWN — and
   this helper exists because a control arm PROVED it matters rather than because
   it reads tidier. Arm (d) widens the case relation to every `concluded`
   finding, which is so over-strict that `op=publish` refuses the FIRST
   publication (`ALREADY_A_CASE_MEMBER`) and the fixture cannot be built at all.
   With a bare `throw` the suite died before printing its own summary and the
   control read `(suite produced no tally)` — a crash names nothing, which is
   CASE-2's recorded finding arriving here. Now the arm fails at a labelled
   assertion carrying the plane's own refusal, and the run still ends with a
   tally the driver can read. */
const bail = (label, r) => {
  t(label, [r?.ok === true, r?.reason ?? null], [true, null]);
  if (r?.ok !== true) { console.log(`\ncaselifecycle: ${pass} pass, ${fail} fail`); process.exit(1); }
  return r;
};

const CEREMONY = (n) => ({
  scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
  excluded: [{ target: INFO_B, description: "the FY2023 comparison memo",
               reason: `a records request for it was still outstanding with the City Clerk when edition ${n} closed` }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator on 2026-06-2${n} and printed what came back.`,
  biasAcknowledgement: `This group holds a declared position that fund transfers should be adopted in public `
                     + `session; edition ${n} reads the FY2024 record through it.`,
  statement: `This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition ${n}.`,
});

/* ===================================================================== 0
 * THE FIXTURE, ARMED AND PROVED BEFORE ANYTHING IS ASSERTED.
 * =================================================================== */
const vE1 = bail("FIXTURE: vera's project publishes its finding as a case at edition 1",
  await publishCase(VERA, V_PROJECT, { target: V_PUB, ...CEREMONY(1) }));
const vRat1 = bail("FIXTURE: and a member with a real ed25519 key ratifies it",
  await ratify("vera", VERA, V_PUB));
const V_SIGNED_1 = vRat1.signedSha;           /* THE EXPECTATION, FROM THE SIGNATURE */
const V_CASE = vE1.caseId;

const wE1 = bail("FIXTURE: wren's project publishes ITS finding as a SECOND case, at that case's edition 1",
  await publishCase(WREN, W_PROJECT, { target: W_PUB, ...CEREMONY(1) }));
const wRat1 = bail("FIXTURE: and wren ratifies it under wren's own key",
  await ratify("wren", WREN, W_PUB));
const W_SIGNED_1 = wRat1.signedSha;
const W_CASE = wE1.caseId;

console.log("\n=== CASE-4 / DEC-72 · `published` leaves the state machine; the precondition and the flag stay ===");
console.log(`  case ${V_CASE} (${V_PROJECT}) · member ${V_PUB} pinned at ${String(V_SIGNED_1).slice(0, 12)}…`);
console.log(`  case ${W_CASE} (${W_PROJECT}) · member ${W_PUB} pinned at ${String(W_SIGNED_1).slice(0, 12)}…`);

t("FIXTURE ARMED: two cases exist, owned by two DIFFERENT projects, each with one ratified member — "
+ "so block 7's scoping arm is over two real productions and not over one case asked twice",
  [V_CASE !== W_CASE, V_PROJECT !== W_PROJECT,
   (await anonCase(`id=${V_PUB}`))?.project, (await anonCase(`id=${W_PUB}`))?.project],
  [true, true, V_PROJECT, W_PROJECT]);

/* ===================================================================== 1
 * `published` IS OUT OF THE MACHINE.
 * =================================================================== */
console.log("\n--- 1. the state is gone from the inquiry machine, and nothing can enter it ---");
{
  t("`published` is no longer a state the inquiry machine PRODUCES: it is out of `legal`",
    STATES.inquiry.legal.includes("published"), false);
  /* THE LOAD-BEARING HALF. A state with no edge naming it as a destination is
     unreachable by construction, whatever any guard does — which is what
     "removed from the state machine" means for a machine that cannot rewrite its
     own signed history. Asserted over EVERY edge list rather than over
     `concluded`'s alone, because a state re-added anywhere else would be the
     same defect wearing a different from-state. */
  t("and NO edge in the whole inquiry machine names it as a DESTINATION — the state is unreachable "
  + "by construction and not merely by a guard somebody remembered to write",
    Object.entries(STATES.inquiry.edges).filter(([, to]) => to.includes("published")).map(([f]) => f), []);
  /* THE COMPATIBILITY HALF, AND IT IS NAMED AS COMPATIBILITY. Ratified bytes are
     immutable: a store that has published anything holds frontmatter saying
     `current_state: published`, whose hash a stranger may already be verifying
     against. Rewriting them would break every pin that names them. So the word
     stays READABLE in a key of its own rather than being smuggled back into
     `legal`, where every other reader — the affordance derivation, the
     transition guards — would see it again. */
  t("it is READABLE for bytes already signed, in a key of its own that says so — `legacy`, not `legal`",
    [(STATES.inquiry.legacy || []).includes("published"),
     Array.isArray(STATES.inquiry.legacy)], [true, true]);
  t("and the out-edges are kept, so a document ALREADY sitting there is not stranded behind a state "
  + "with no exit",
    STATES.inquiry.edges.published, ["open", "surfaced"]);
  /* THE MACHINE IS THE CATALOG'S AND THE PLANE HOLDS NO COPY — the MAP RULE, and
     the one thing that would make every arm above decorative. */
  t("and the plane keeps NO second copy of the inquiry edge table: the store reads it through the "
  + "catalog's own vocabFor",
    /vocabFor\(STATES,/.test(STORE_SRC) && !/legal:\s*\[\s*["']open["']/.test(STORE_SRC), true);
}

/* ===================================================================== 2
 * THE PRECONDITION SURVIVES THE STATE'S REMOVAL. THE ITEM'S CENTRAL ARM.
 * =================================================================== */
console.log("\n--- 2. only a CONCLUDED finding may be a case member — proved, not asserted ---");
{
  /* PART ONE: the carrier is gone. With `published` out of every edge list, the
     old expression `legalFrom.includes("published")` is false from every state,
     so it cannot be what refuses below. */
  t("the OLD carrier is gone: `concluded` no longer names `published` among its edges, so the "
  + "expression that used to enforce this rule is false from EVERY state",
    STATES.inquiry.edges.concluded.includes("published"), false);
  /* PART TWO: and an unconcluded finding is STILL refused — driven through the
     op, with a name of its own rather than a generic illegal move. If the
     precondition had ridden on the table, this arm would now be green because
     the act succeeded. */
  const openTry = await publishCase(VERA, V_PROJECT, { target: OPEN, ...CEREMONY(1) });
  t("AND AN OPEN INQUIRY IS STILL REFUSED, BY A NAME OF ITS OWN — the precondition survived the "
  + "state's removal because it is now a sentence rather than a side effect of an array entry",
    [openTry.ok, openTry.reason, openTry.target, openTry.from],
    [false, "NOT_CONCLUDED", OPEN, "open"]);
  t("and the refusal says the rule in the words the ruling used, so a member is told WHY rather than "
  + "that a move is illegal",
    [/only a CONCLUDED finding may be a case member/.test(openTry.detail || ""),
     /op=conclude/.test(openTry.detail || "")], [true, true]);
  t("NOTHING HALF-RAN: the refused inquiry is still open and is in no case",
    [await stateOf(OPEN), (await anonFlags(`target=${OPEN}`)).count,
     (await anonCase(`id=${OPEN}`))?.ok], ["open", 0, false]);
  /* PART THREE: the rule is ONLY `concluded`. A deferred finding has a
     conclusion in its history and is still refused, which is what makes this a
     precondition about the CURRENT answer rather than about whether one was ever
     written. */
  const dep = rP(await POST(`op=select&token=${VERA}`, { ids: [FREE] }));
  const disp = rP(await POST(`op=dispose&token=${VERA}&handle=${dep.handle}&to=deferred`
    + `&reason=${encodeURIComponent("the records request is outstanding")}`, {}));
  t("(fixture) a concluded finding in NO case can still be set down — ageing is what happens to a "
  + "finding nobody published (D-79), and that is untouched",
    [disp.ok, await stateOf(FREE)], [true, "deferred"]);
  const defTry = await publishCase(VERA, V_PROJECT, { target: FREE, ...CEREMONY(1) });
  t("and a DEFERRED finding is refused too: the precondition is about the answer the question has "
  + "NOW, not about whether one was ever written",
    [defTry.ok, defTry.reason, defTry.from], [false, "NOT_CONCLUDED", "deferred"]);
  /* Put it back for the over-strictness arms below. */
  const back = await reopen(VERA, FREE, "picked back up for the over-strictness arms");
  const rec = await conclude(VERA, FREE, "The transfer rests on a memo nobody adopted.",
    "An adopted resolution naming the transfer would overturn this.");
  t("(fixture) and it is picked back up and concluded again, so the over-strictness arms below are "
  + "over a genuinely publishable finding",
    [back.ok, rec.ok, await stateOf(FREE)], [true, true, "concluded"]);
}

/* ===================================================================== 3
 * PUBLICATION MOVES NO STATE.
 * =================================================================== */
console.log("\n--- 3. publishing is the CASE RELATION: the finding's lifecycle ends at `concluded` ---");
{
  t("the published member's lifecycle state is exactly where conclude left it",
    await stateOf(V_PUB), "concluded");
  /* AND IT IS IN THE SIGNED BYTES, which is where it matters: a stranger reading
     the ratified document must not be told the finding entered a state the
     machine does not have. */
  const bytes = rP(await GET(`op=image&token=${VERA}&id=${V_PUB}`));
  const md = String(bytes?.files?.["bundle.md"] ?? bytes?.["bundle.md"] ?? "");
  /* CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED, AND THE HALF THIS ITEM
     TOUCHES IS THE SECOND ONE. The FIRST half — the signed bytes say `concluded`
     and never `published` — is CASE-4's own subject and is untouched. The second
     half asked the same bytes to NAME THE CASE, because that is where the case
     relation lived: op=publish stamped `case_id`/`case_edition` into every
     member. CASE-5b removes them, so the relation is named by the CASE DOCUMENT
     and carried by the PIN. Asserting the old pair here would pin a format the
     ruling deleted; asserting nothing in its place would lose the half of the
     sentence that says publication IS a relation rather than nothing at all. So
     the relation is asserted where it now is — off the anonymous public read,
     which resolves a member by the hash the case froze. */
  t("the SIGNED BYTES say `concluded` and never `published` — no state no machine enters",
    [/^current_state: concluded$/m.test(md), /^current_state: published$/m.test(md)], [true, false]);
  t("and the CASE RELATION is real, named by the case's own signed document and resolved BY THE PIN "
  + "rather than by a scalar in the member's frontmatter",
    [md.includes("case_id:"), md.includes("case_edition:"),
     (await anonCase(`id=${V_CASE}&edition=1`))?.findings?.some((f) => f.bundle_id === V_PUB)],
    [false, false, true]);
  /* NO TRANSITION IS INVENTED. A state_history entry naming an edge the machine
     does not have fails C-4.2 the moment it is written, and this is the arm that
     proves the act does not write one. */
  t("and NO state transition to `published` was appended to the document's own history — the record "
  + "of the act is the Session Log entry and the case relation, both inside the signed bytes",
    [/to_state: published/.test(md), /Published \|/.test(md),
     /joined case .* as a member/.test(md)], [false, true, true]);
  /* THE ACT'S ANSWER agrees with the document. */
  t("and `op=publish`'s own answer reports the RELATION it made and no destination state",
    [vE1.to ?? null, vE1.findings[0].state, vE1.findings[0].case_id, vE1.findings[0].case_edition],
    [null, "concluded", V_CASE, 1]);
}

/* ===================================================================== 4
 * THE CASE RELATION CARRIES EVERY GUARD THE STATE USED TO CARRY.
 * =================================================================== */
console.log("\n--- 4. the guards moved to the case relation, and they still bite ---");
{
  const div = rP(await POST(`op=inquirydivide&token=${VERA}&target=${V_PUB}`,
    { reason: "two questions in one, and the parent was malformed",
      children: [{ id: "INQ-2026-4400-a", question: "Was it authorised?", legs: [0] },
                 { id: "INQ-2026-4400-b", question: "Who signed it?", legs: [] }] }));
  t("op=inquirydivide still refuses a case member BY NAME — a signed edition cannot be retroactively "
  + "declared malformed",
    [div.ok, div.reason], [false, "PUBLISHED_CANNOT_DIVIDE"]);
  const gr = rP(await POST(`op=inquiryground&token=${VERA}&target=${V_PUB}`
    + `&reason=${encodeURIComponent("re-cut the structure")}`, { grounds: [] }));
  t("op=inquiryground still refuses it BY NAME — this is the act that RAISES a grade, so a member of "
  + "a signed edition composing to something new is the sharpest form of the hazard",
    [gr.ok, gr.reason], [false, "PUBLISHED_CANNOT_RESTRUCTURE"]);
  const sel = rP(await POST(`op=select&token=${VERA}`, { ids: [V_PUB] }));
  const dis = rP(await POST(`op=dispose&token=${VERA}&handle=${sel.handle}&to=deferred`
    + `&reason=${encodeURIComponent("set it down")}`, {}));
  /* THIS ONE IS A RULE THAT WOULD OTHERWISE HAVE BEEN LOST IN SILENCE. The
     STATES comment has said since REC-14 that `published -> deferred|dismissed`
     is deliberately not an edge; the EDGE TABLE was the enforcement, and a member
     now sits at `concluded`, which does carry those edges. */
  t("and op=dispose refuses it BY NAME — ageing is what happens to a finding NOBODY published (D-79), "
  + "and the edge table that used to enforce that is gone",
    [dis.ok, dis.reason, (dis.offenders || []).map((o) => o.id)],
    [false, "PUBLISHED_CANNOT_BE_SET_DOWN", [V_PUB]]);
  /* THE PRE-FLIGHT AGREES WITH THE REFUSALS (DEC-8). */
  const aff = actIds(await affordances(VERA, V_PUB));
  t("op=affordances publishes NONE of the three on a case member, so the pre-flight and the refusals "
  + "agree (DEC-8)",
    [aff.includes("inquirydivide"), aff.includes("inquiryground"), aff.includes("dispose"),
     aff.includes("publish")], [false, false, false, false]);
  /* OVER-STRICTNESS, THE OTHER DIRECTION. The same acts on a concluded finding
     that is in NO case must be untouched — a guard that fenced every concluded
     finding would be this change quietly freezing the whole corpus. */
  const affFree = actIds(await affordances(VERA, FREE));
  t("OVER-STRICTNESS: a CONCLUDED finding in no case keeps every one of those acts — the guard is on "
  + "the case relation, not on the state the members happen to share",
    [affFree.includes("inquirydivide"), affFree.includes("inquiryground"),
     affFree.includes("dispose"), affFree.includes("publish")], [true, true, true, true]);
  const grFree = rP(await POST(`op=inquiryground&token=${VERA}&target=${FREE}`
    + `&reason=${encodeURIComponent("group what it rests on")}`,
    { grounds: [{ label: "paper trail", legs: [0], author: "vera" }] }));
  t("and the op agrees: restructuring a finding in no case is NOT refused by the published fence",
    [grFree.reason !== "PUBLISHED_CANNOT_RESTRUCTURE", grFree.reason ?? null],
    [true, grFree.reason ?? null]);
}

/* ===================================================================== 5
 * THE REVISION FLAG.
 * =================================================================== */
console.log("\n--- 5. a revised member FLAGS its containing case, by name ---");
{
  t("before any revision, the case carries NO flag — so every count below is a measurement and not a "
  + "row that was always there",
    [(await anonFlags(`case=${V_CASE}`)).count, (await anonFlags()).count], [0, 0]);
  /* REOPENING IS THE REVISION. It mints a new version — the one write in the
     plane that does — so the pin the case froze stops naming this finding's
     current version. Under DEC-72 this is also the route DEC-12 requires for a
     second edition, which is why it is the shape the flag has to notice. */
  const rp = await reopen(VERA, V_PUB, "the FY2023 comparison memo arrived and the finding has to be re-worked");
  t("(fixture) the case member REOPENS from `concluded` — the act DEC-12 requires for a second "
  + "edition, reachable because the finding is a case member and not because of any state word",
    [rp.ok, rp.to, await stateOf(V_PUB)], [true, "open", "open"]);
  const f = await anonFlags(`case=${V_CASE}`);
  const row = (f.flags || [])[0] || {};
  t("THE CONTAINING CASE IS FLAGGED, BY NAME, and an anonymous caller can read it",
    [f.ok, f.count, f.outstanding, row.case_id, row.edition, row.bundle_id],
    [true, 1, 1, V_CASE, 1, V_PUB]);
  /* THE EXPECTATION IS THE SIGNATURE'S. `pinned_sha` must be the hash that went
     into the signed bio-ratify statement — captured before anything read a
     column this item wrote — and `revised_sha` must differ from it, which is the
     whole content of "a revision minted". */
  t("and the flag names the hash the case FROZE — taken from the signed bio-ratify statement, not "
  + "from the column under test — beside the hash that superseded it",
    [row.pinned_sha, row.pinned_sha === V_SIGNED_1, row.revised_sha !== V_SIGNED_1,
     /^[0-9a-f]{64}$/.test(String(row.revised_sha))],
    [V_SIGNED_1, true, true, true]);
  t("and it names the OWNING PROJECT that must act, which is what makes 'until each owning project "
  + "acts' answerable",
    [row.project_id, f.projects_owing], [V_PROJECT, [V_PROJECT]]);
  /* NO SECOND MECHANISM. The detection is the PIN, read the other way, and that
     is asserted against the store's own source rather than described. */
  t("the detection reuses CASE-5's pin and mints no second mechanism: the flag is raised off the "
  + "roster's own `version_sha` matching the sha the new version REPLACED",
    /WHERE bundle_id=\? AND version_sha=\?/.test(STORE_SRC), true);
  /* AND THE FREEZE HELD. The case still serves edition 1 at the old pin: the
     flag reports that something moved and changes nothing about what was
     published, which is the design's "never silently updated". */
  const c = await anonCase(`id=${V_CASE}&edition=1`);
  t("AND EDITION 1 IS UNTOUCHED: the case still answers at the hash it froze, so the flag REPORTS a "
  + "revision and never applies one",
    [(c.findings || [])[0]?.version_sha, (c.findings || [])[0]?.version_sha === V_SIGNED_1],
    [V_SIGNED_1, true]);
  /* THE SHAPE OF THE HONEST NULL, pinned against the schema rather than a
     fixture this suite cannot build: a case published before DEC-72 has no
     `cases` row and its flags carry no project. */
  t("a case published before DEC-72 owns no project, and the column says so rather than inventing "
  + "one — pinned by shape, because this suite cannot mint a pre-DEC-72 case through the op surface",
    /project_id\s+TEXT,\s+-- the OWNING project that must act\. NULL for a pre-DEC-72 case, and STATED/
      .test(SCHEMA_SRC), true);
}

/* ===================================================================== 6
 * SET-BUT-NEVER-CLEAR.
 * =================================================================== */
console.log("\n--- 6. the flag is SET AND NEVER CLEARED: only an owning project's act discharges it ---");
{
  /* A LATER READ DOES NOT CLEAR IT. This is the arm that would catch a
     derived-on-read implementation, which is the design that was tried first and
     rejected. */
  t("a second read answers identically — nothing about reading the flag clears it",
    [(await anonFlags(`case=${V_CASE}`)).outstanding,
     (await anonFlags(`case=${V_CASE}`)).outstanding,
     (await anonFlags(`case=${V_CASE}`)).outstanding], [1, 1, 1]);
  /* NOR DOES MORE WORK ON THE FINDING. Concluding it again mints another version
     and the flag still stands: the act that discharges is the PROJECT's, not the
     author's. */
  const rc = await conclude(VERA, V_PUB, "The transfer rests on a memo nobody adopted, and the FY2023 "
    + "comparison memo does not name it either.",
    "An adopted resolution naming the transfer would overturn this.");
  t("nor does working the finding further: concluding it again mints another version and the flag "
  + "still stands, because the act that answers it belongs to the PROJECT",
    [rc.ok, (await anonFlags(`case=${V_CASE}`)).outstanding], [true, 1]);
  /* AND ONE FLAG, NOT THREE. The row is keyed on the revision event, so the
     versions minted after the first do not each raise a flag against a pin they
     never held. */
  t("and it is ONE flag rather than one per promotion: only the version that REPLACED the pinned one "
  + "is a revision of what the case froze",
    (await anonFlags(`case=${V_CASE}`)).count, 1);
  /* ===== WREN'S MEMBER REVISES **BEFORE** VERA'S PROJECT ACTS, AND THE ORDER IS
     LOAD-BEARING RATHER THAN TIDY. IT IS HERE BECAUSE A CONTROL ARM MEASURED
     THAT IT HAD TO BE.
     Block 7 asserts D-266's scoping — one project acting reaches only its own
     case — and arm (b2) arms exactly that by dropping `case_id=?` from the
     discharge UPDATE so one act answers every outstanding flag in the store.
     With WREN's revision raised in block 7, AFTER VERA's discharge had already
     run, there was nothing of WREN's for the widened statement to over-reach:
     the arm ran GREEN over a plane whose discharge was unscoped. **That is an
     INSTRUMENT LIMIT, not a defence that held**, and it is the same shape CASE-5
     recorded on its own arm (f). The two flags now COEXIST at the instant the
     first project acts, which is the only arrangement in which the scoping is
     observable at all. */
  const wrp = await reopen(WREN, W_PUB, "the same comparison memo bears on this finding too");
  t("(fixture, and the ORDER matters) the SECOND project's member revises BEFORE the first project "
  + "acts, so both flags are outstanding at the moment of the discharge — the only arrangement in "
  + "which a discharge that reached too far could be seen",
    [wrp.ok, (await anonFlags()).outstanding,
     (await anonFlags()).flags.filter((x) => x.outstanding).map((x) => x.case_id).sort()],
    [true, 2, [V_CASE, W_CASE].sort()]);

  /* THE DISCHARGE IS AN AUTHORED ACT, AND IT IS A SIGNED ONE. */
  const vE2 = await publishCase(VERA, V_PROJECT, { target: V_PUB, ...CEREMONY(2) });
  t("(fixture) the owning project publishes a second edition — the deliberate act the design names",
    [vE2.ok, vE2.edition, vE2.caseId], [true, 2, V_CASE]);
  t("and the flag is STILL OUTSTANDING until that edition is RATIFIED: the discharge rests on a "
  + "signature exactly as the pin does, so an unsigned publication answers nothing",
    (await anonFlags(`case=${V_CASE}`)).outstanding, 1);
  const vRat2 = await ratify("vera", VERA, V_PUB);
  t("(fixture) and it ratifies, at the member's own next edition on its own chain",
    [vRat2.ok, vRat2.signedSha !== V_SIGNED_1], [true, true]);
  const after = await anonFlags(`case=${V_CASE}`);
  const arow = (after.flags || [])[0] || {};
  /* THE LITERAL CONTENT OF SET-BUT-NEVER-CLEAR: the row is still there, still
     says a revision was flagged, and now also says what was done about it. */
  t("THE ROW IS NOT DELETED AND THE FLAG IS NOT UNSET — the ACT IS ADDED TO IT, so the record still "
  + "says a revision was flagged and now also says which edition answered it",
    [after.count, after.outstanding, arow.outstanding,
     arow.pinned_sha, arow.acted?.edition, arow.acted?.by, /^\d{4}-\d{2}-\d{2}T/.test(String(arow.acted?.at))],
    [1, 0, false, V_SIGNED_1, 2, "vera", true]);
  t("and no project is owed an act on this case any more",
    after.projects_owing, []);
  /* AND THE ANSWER SAYS SO IN ITS OWN WORDS, so a surface rendering it cannot
     offer a dismiss control. */
  t("the answer STATES the doctrine, where a consumer will read it rather than have to know it",
    [/SET AND NEVER CLEARED/.test(String(after.doctrine)),
     /DISCHARGED by the owning project/.test(String(after.doctrine)),
     /not \n?discharged by one of them acting|not discharged by one of them acting/
       .test(String(after.doctrine).replace(/\s+/g, " "))], [true, true, true]);
  /* AND NOTHING IN THE STORE DELETES ONE. The structural half, stated as
     structural: there is no DELETE against this table anywhere except the purge
     sweep D-113 requires. */
  t("STRUCTURALLY: the only statement in the plane that removes a revision flag is op=purge's "
  + "whole-corpus sweep — nothing else deletes one, so 'never cleared' is a property of the source "
  + "rather than a rule a later caller is trusted to respect",
    (STORE_SRC.match(/DELETE FROM case_revision_flags/g) || []).length, 0);
  /* CORRECTED 2026-09-14 by REC-82, and the old assertion was WRONG rather than
     superseded by a rule change. It read `/"case_revision_flags"\]/` — the name
     followed by the array's CLOSING BRACKET — which asserts "this table is LAST
     in `TABLES`", not "this table is IN `TABLES`". It passed only because
     CASE-4 happened to append it last, and it went red the moment REC-82 added
     `content` after it, while the property it exists to guard was never once at
     risk. A membership test that is really a position test is a check nobody is
     enforcing: the NEXT table appended would have flipped it again, and the
     honest reading of the red would have been "somebody added a table", which
     is the thing that is supposed to be allowed. Now it parses the array the
     way `hygiene.test.mjs`'s own D-113 census does and asks the question it
     meant to ask. */
  const TABLES_ARR = /const TABLES\s*=\s*\[([\s\S]*?)\]/.exec(STORE_SRC);
  t("the purge list is locatable in store.mjs — the parse this assertion rests on",
    !!TABLES_ARR, true);
  t("and the table rides the purge list, so a scratch reset does not report scope ALL while a case "
  + "still reads as flagged (D-113)",
    /"case_revision_flags"/.test(TABLES_ARR ? TABLES_ARR[1] : ""), true);
}

/* ===================================================================== 7
 * D-266's SCOPING: ONE PROJECT ACTING IS NOT EVERY PROJECT ACTING.
 * =================================================================== */
console.log("\n--- 7. a disposition is scoped to the key's own subject — one project acting clears one case ---");
{
  /* WREN's member revises too, so two cases owned by two projects are flagged at
     once. THE SHAPE THIS PLANE CAN PRODUCE, and the suite header says why it is
     this shape: a case has exactly one owning project (CASE-1's key), so "several
     owning projects" is several CASES.

     D-309, 2026-09-10: THE SECOND HALF OF THAT REASON IS GONE AND THE SHAPE IS
     UNCHANGED. This used to read *"and a finding belongs to one case
     (FINDING_IN_ANOTHER_CASE)"*. That refusal is deleted — a finding may now
     serve many cases (DEC-72 clause 6) — but the limit this block is about is the
     OTHER one, and it is untouched: `cases` is keyed on `case_id` alone, so a
     single case still has exactly one owning project and cannot change hands
     between its editions. **D-309 deliberately did not widen that**, and the
     assertions below therefore do not move. Only the citation does. */
  const all = await anonFlags();
  t("and the two outstanding rows name two different cases and two different owning projects",
    [all.count, all.flags.filter((x) => x.outstanding).map((x) => x.case_id),
     all.projects_owing.slice().sort()],
    [2, [W_CASE], [W_PROJECT]]);
  /* VERA's project already acted (block 6) and WREN's has not. THE RULING: a
     disposition is scoped to the key's own subject. */
  t("VERA's project acting on VERA's case did NOT reach WREN's: the discharge names one case_id and "
  + "there is no statement in the plane that names more (D-266)",
    [(await anonFlags(`case=${V_CASE}`)).outstanding,
     (await anonFlags(`case=${W_CASE}`)).outstanding], [0, 1]);
  t("and the two cases' flags are separable by the reader, so 'each owning project acts' is a "
  + "question the record can answer rather than a sentence in a comment",
    [(await anonFlags(`case=${W_CASE}`)).projects_owing,
     (await anonFlags(`case=${V_CASE}`)).projects_owing], [[W_PROJECT], []]);
  /* AND THE OTHER PROJECT CAN STILL ACT, which is what makes the outstanding row
     an obligation rather than a dead end. */
  const wRc = await conclude(WREN, W_PUB, "The transfer rests on a memo nobody adopted, and the FY2023 "
    + "comparison memo does not name it either.",
    "An adopted resolution naming the transfer would overturn this.");
  const wE2 = await publishCase(WREN, W_PROJECT, { target: W_PUB, ...CEREMONY(2) });
  const wRat2 = await ratify("wren", WREN, W_PUB);
  t("and when the SECOND project acts, its own case discharges and the first case's history is "
  + "untouched — two discharges, each naming its own case's edition",
    [wRc.ok, wE2.ok, wRat2.ok,
     (await anonFlags(`case=${W_CASE}`)).outstanding,
     (await anonFlags(`case=${W_CASE}`)).flags[0]?.acted?.by,
     (await anonFlags(`case=${V_CASE}`)).flags[0]?.acted?.by,
     (await anonFlags()).outstanding],
    [true, true, true, 0, "wren", "vera", 0]);
}

/* ===================================================================== 8
 * OVER-STRICTNESS: NOTHING ELSE IS FLAGGED.
 * =================================================================== */
console.log("\n--- 8. over-strictness: an unrelated edit to a non-member flags nothing ---");
{
  const before = (await anonFlags()).count;
  /* FREE has never been published and is in no case. It is edited through the
     SAME WRITE the flag hangs off — `op=promote`, which is the one write in the
     plane that mints a version and therefore the one call site
     `#flagCasesOnRevision` is made from. That is what makes this arm an
     over-strictness control rather than a different act happening not to fire:
     it is the identical code path, and the only difference is that no case ever
     froze this finding's hash.
     DELIBERATELY NOT `op=reopen`: a concluded finding in NO case is refused
     NOT_SET_DOWN (REC-31's rule, which block 4 relies on), so reaching for it
     here would have made this arm measure that refusal instead of the flag. That
     was this fixture's first draft and it went red honestly. */
  const r1 = await promote(VERA, FREE, inqBody(FREE) + "\n", "inquiry", "concluded",
    { base: await shaOf(FREE) });
  const r2 = await promote(VERA, FREE, inqBody(FREE) + "\n\n", "inquiry", "concluded",
    { base: await shaOf(FREE) });
  t("a finding that is in NO case mints new versions and flags nothing — the flag is raised off the "
  + "PIN, so a version that no case froze is not a revision of anything",
    [r1.ok, r2.ok, (await anonFlags()).count, (await anonFlags(`target=${FREE}`)).count],
    [true, true, before, 0]);
  /* AND AN INFORMATION BUNDLE, which promotes through the same write. */
  const p = await mustPromote(VERA, INFO_B, infoMd(INFO_B) + "\n", "information", "collected",
    { base: await shaOf(INFO_B) });
  t("and a new version of an INFORMATION bundle — the same `promote` write — flags nothing either",
    [p.ok, (await anonFlags()).count], [true, before]);
  /* AND THE OUTSTANDING FILTER IS HONEST, rather than an empty answer dressed up
     as a clean bill: discharged rows are still there to be read. */
  const outs = await anonFlags("outstanding=1");
  const allF = await anonFlags();
  t("and `outstanding=1` narrows without hiding: the discharged rows are still readable, so a "
  + "discharge never looks like a deletion",
    [outs.count, allF.count, allF.flags.every((x) => x.acted !== null)], [0, 2, true]);
}

/* ===================================================================== 9
 * THE DESIGN DOCUMENT IS THE EXPECTATION.
 * =================================================================== */
console.log("\n--- 9. the expectation is parsed from CASE-AS-PRODUCTION.md, not from this suite ---");
{
  /* IT LOOKS IN BOTH PLACES, because CASE-6's definition of done ARCHIVES this
     document to `docs/archive/` — where `decided.mjs` still scans it — and a
     suite that only knew one path would go red on a correct landing. CASE-1's
     and CASE-5's blocks took the same precaution and it is copied deliberately. */
  const here = fileURLToPath(new URL("../../docs/development/CASE-AS-PRODUCTION.md", import.meta.url));
  const archived = fileURLToPath(new URL("../../docs/archive/CASE-AS-PRODUCTION.md", import.meta.url));
  const path = existsSync(here) ? here : archived;
  const doc = readFileSync(path, "utf8");
  const bullet = (doc.match(/\*\*CASE-4 · lifecycle and the revision flag\.\*\*([\s\S]*?)Depends/) || [])[1] || "";
  t("the design document is readable and its CASE-4 bullet was found — if this arm goes red the "
  + "expectations below are unanchored and every other arm in this block means nothing",
    bullet.length > 60, true);
  /* THE THREE CLAUSES, READ OUT OF BOB'S DOCUMENT, each bound to a block above.
     The document was written before this code, this item may not edit it, and
     CASE-6 will move it — so the two sides cannot move together. */
  t("clause A — the bullet demands `published` REMOVED from the inquiry state machine, which block 1 "
  + "asserted over the catalog's own table",
    /`published` removed from the inquiry[\s\S]*state machine/.test(bullet), true);
  t("clause B — it demands containing cases FLAGGED when a member finding revises, which block 5 "
  + "drove through op=reopen and read back through op=caseflags",
    /containing cases FLAGGED when a member\s*\n?\s*finding revises/.test(bullet), true);
  t("clause C — it demands flags SET-BUT-NEVER-CLEAR until each owning project acts, which blocks 6 "
  + "and 7 drove and which the schema makes structural",
    /flags set-but-never-clear until each owning project acts/.test(bullet), true);
  /* AND THE SUPERSESSION TABLE'S OWN SENTENCE, which is the one this item was
     told to get right. It lives in the table rather than in the bullet, so it is
     read from there. */
  const table = (doc.match(/\|\s*\*\*`published` as an inquiry lifecycle state\*\*([\s\S]*?)\|\s*\n/) || [])[0] || "";
  t("and the supersession table's own sentence — the precondition survives as `only a CONCLUDED "
  + "finding may be a case member` — is what block 2 drove through op=publish",
    /only a CONCLUDED finding may be a case member/.test(table), true);
  t("and it is the same sentence the plane's own refusal prints, so the document and the record "
  + "cannot drift",
    /only a CONCLUDED finding may be a case member/.test(STORE_SRC), true);
}

/* ==================================================================== 10
 * THE BOUND, DRIVEN HERE BECAUSE THE FIXTURE IS HERE.
 * ================================================================== */
console.log("\n--- 10. op=caseflags' bound, in bounds.test.mjs's own loop shape ---");
{
  /* `bounds.test.mjs` holds the roster of every capped op and the rule that each
     one must be DRIVEN — *"an op that grows a cap tomorrow fails until somebody
     drives it"* — with an explicit refusal to keep an exception list. This op is
     on that roster (its read publishes `limit` beside `truncated`, because the
     flag table grows with every revision of every published member and has no
     natural ceiling) and it is named in that suite's `DRIVEN_ELSEWHERE` set with
     the reason, which is CPDF-10's: the bite needs TWO REVISION FLAGS, and a
     revision flag needs a real publishing project, a published case, a RATIFIED
     member and then a revision — twice. That corpus exists here and building a
     second one there would be two fixtures for one fact, and would make a suite
     that has never needed `ssh-keygen` depend on it.
     THE FIXTURE IS PROVED LARGE ENOUGH BEFORE THE BOUND IS ASKED ABOUT: at a
     corpus of one, a bite of one is a complete answer and every arm below would
     pass at zero cost, which is how a green suite has been recorded over a
     defect more than once in this estate. */
  const whole = await anonFlags("limit=500");
  t("FIXTURE IS LARGE ENOUGH FOR THE BITE TO BITE: the store holds MORE THAN ONE flag, so a bite of "
  + "one has something to cut",
    whole.count > 1, true);
  const bitten = await anonFlags("limit=1");
  t("op=caseflags: publishes the bound it APPLIED, and it is the clamped cap and not the number asked for",
    bitten.limit, 1);
  t("op=caseflags: a cut answer says so, in this op's own vocabulary (`truncated`)",
    bitten.truncated, true);
  t("op=caseflags: a complete answer says the opposite — whether `count` is the number that EXIST or "
  + "only the number it SENT is READABLE, not inferred",
    whole.truncated, false);
  t("op=caseflags: DELTA — 'this is all of it' and 'this is the first N' do NOT read alike",
    bitten.truncated !== whole.truncated, true);
  /* AN OVER-ASK IS CLAMPED AND THE CLAMP IS WHAT IS PUBLISHED — the half a
     caller could not see, and the reason echoing the request back would be a new
     lie. `op=readingname`'s own arm, one op over. */
  const over = await anonFlags("limit=99999");
  t("op=caseflags: an over-ask is answered at the CEILING and the ceiling is what is published — a "
  + "caller is never told they got more than they did",
    [over.limit, over.truncated], [500, false]);
}

/* NEGATIVE CONTROL — RUN 2026-09-10 (case4-lifecycle-flag). SEVEN ARMS PLUS A BASELINE, each armed ALONE with every other defence held open, each RUN, and each restore verified by CONTENT and by sha256 against a uniquely-named per-arm pristine copy taken INSIDE THIS WORKTREE (store.mjs 1,764,229 bytes, sha256 496745342a0c8726…; this file's own sha is not quoted, because a file cannot state its own). The driver is `test/caselifecycle.control.mjs` — COMMITTED, so every arm re-runs in one step with `node test/caselifecycle.control.mjs [arm]`. WHOLE (baseline, nothing armed) = 66 pass, 0 fail. **THE FIGURES BELOW WERE RE-READ AFTER THE COMMIT AND THEY MOVED — recorded rather than left as first written, because a hand-carried number nobody re-measures is this project's most-repeated defect and an NC block is exactly where it hides.** Block 10 (the bound, driven here for `bounds.test.mjs`) was added after the first control run, so every tally rose by six.
   (a) THE ARM THIS ITEM EXISTS FOR — a revised member raises NO FLAG (`#flagCasesOnRevision` returns before it reads the roster) -> **49 pass, 17 FAIL**, and the first is the one written for it: `THE CONTAINING CASE IS FLAGGED, BY NAME`. Blocks 6, 7 and 8's discharge arms fall behind it, because there is nothing to discharge. This is the state the tree was in before this item, so the figure is the size of the hole it closed.
   (b) MAKE THE FLAG CLEAR ITSELF ON A LATER READ — `caseFlags` drops any row whose `revised_sha` is no longer the finding's head, which is the DERIVED-ON-READ design this item considered and rejected -> **57 pass, 9 FAIL**, naming it exactly: `nor does working the finding further … the flag still stands`, then every set-but-never-clear arm behind it. **The defect is invisible to a reader**: nothing is deleted and no act is recorded — the flag simply stops being raised, which is indistinguishable from a project having dealt with it. That is D-79 one altitude up, and it is why the OBSERVATION is derived while the FLAG is written down.
   (b2) MAKE ONE PROJECT'S ACT CLEAR EVERY CASE — drop `case_id=?` from `#dischargeCaseFlags`' UPDATE -> **62 pass, 4 FAIL**, and block 7 names it: `VERA's project acting on VERA's case did NOT reach WREN's`. **THIS ARM CAME BACK GREEN ON ITS FIRST RUN AND THE FIXTURE WAS WHAT WAS WRONG, NOT THE PLANE — recorded rather than smoothed, because it is the more useful half of the measurement.** WREN's member revised in block 7, AFTER VERA's project had already acted in block 6, so at the instant of the discharge there was nothing of WREN's for an unscoped UPDATE to over-reach: the arm passed over a plane whose discharge was not scoped at all. **That is an INSTRUMENT LIMIT, not a defence that held** — CASE-3's arm (f) and CASE-5's arm (c), same shape, third time. Fixed at the FIXTURE: WREN's revision now happens BEFORE VERA acts, the two flags coexist at the moment of the discharge, and the ordering carries a comment saying why it is load-bearing rather than tidy.
   (c) THE PRECONDITION DOES NOT SURVIVE THE STATE'S REMOVAL — delete the `NOT_CONCLUDED` refusal from `publishCase()` -> **63 pass, 3 FAIL**, block 2 first: `AND AN OPEN INQUIRY IS STILL REFUSED, BY A NAME OF ITS OWN` reads `[true, null, …]` — the act SUCCEEDED, which is an unconcluded finding admitted to a case. This is the exact damage the item was warned about and the arm that makes it impossible to ship silently.
   (d) OVER-STRICTNESS, THE WHOLE RELATION WIDENED — `#caseRelationOf` reports every `concluded` finding as a member -> **0 pass, 1 FAIL**, and the ONE named failure is the fixture's own first assertion, `FIXTURE: vera's project publishes its finding as a case at edition 1`, carrying the plane's refusal `ALREADY_A_CASE_MEMBER`: the widening is so over-strict that the FIRST publication in the store is refused. **NOT AS DECLARED, AND THE CORRECTION IS THE INSTRUMENT'S RATHER THAN THE PLANE'S:** on its first run this arm produced NO TALLY AT ALL, because the fixture used a bare `throw` — and a crash names nothing, which is CASE-2's recorded finding arriving here. The fixture now reports through `bail()`, so an arm that kills the fixture still fails at a labelled assertion and still prints a tally.
   (d2) OVER-STRICTNESS, THE REALISTIC SHAPE — ONE guard translated from the state word to `concluded` instead of to the case relation -> **65 pass, 1 FAIL**, and it is EXACTLY the over-strictness arm: `and the op agrees: restructuring a finding in no case is NOT refused by the published fence`. **(d) and (d2) are both kept.** (d) proves the widening is caught catastrophically; (d2) proves block 4's over-strictness arm is what catches the shape a worker would actually produce — every refusal in block 4 still fires under it, so a suite asserting only that the guards bite would have read a fence around the whole corpus as a stronger plane.
   (e) THE SUITE'S OWN ANCHOR — break block 9's design-document parse so the CASE-4 bullet is never found -> **62 pass, 4 FAIL**, and the FIRST is the anchor itself: `the design document is readable and its CASE-4 bullet was found`. The three clause arms fail behind it rather than passing over an empty string, which is what that arm is for. */

/* D-186 / hygiene: every workerd instance is shut down, and `hygiene.test.mjs`
   counts `.dispose()` against `new Miniflare(`. It is before the tally so a
   suite that fails still shuts down. */
await mf.dispose();
console.log(`\ncaselifecycle: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);


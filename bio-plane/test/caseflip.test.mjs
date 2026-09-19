/* NEGATIVE CONTROL: see the block at the FOOT of this file. Every arm is armed
   ALONE with every other defence held open, RUN, and recorded there with the
   count it MEASURED. The driver is `test/caseflip.control.mjs` — COMMITTED, so
   the arms re-run in one step with `node test/caseflip.control.mjs [arm]` — and
   every restore is verified by CONTENT and by sha256 against a uniquely-named
   per-arm pristine copy taken INSIDE THIS WORKTREE (never a shared scratchpad:
   PL-10's harness was overwritten mid-turn by a concurrent worker, and UI-38 met
   an NC harness that reported a byte-identical restore over a file it had not
   restored). */

/* CASE-5 / DEC-72 — THE ARTIFACT FLIP: THE CASE FREEZES ITS MEMBERS, AND A
 * MEMBER IS RESOLVED BY THE VERSION THE CASE PINNED.
 *
 * Bob ruled DEC-72 on 2026-08-10 and `docs/archive/CASE-AS-PRODUCTION.md` is
 * the design. The CASE-5 bullet, verbatim: *"Case-side freezing; finding bytes
 * stop naming a case; `op=verify` / `op=publishedcase` / `op=publishedmanifest`
 * read the case artifact; the stranger-verification path proven end to end;
 * checks corrected never exempted."* The supersession table names what must
 * survive the move: REC-44's finding-side stamping is REWORKED, and *"the
 * property it served — a stranger holding published material can verify without
 * contacting the instance — is preserved case-side."*
 *
 * THE THREAD THIS SUITE EXISTS FOR, HANDED OVER BY NAME. CASE-3 landed the pin
 * and wrote, in its own landing note and in `#caseEditionState`'s comment:
 * *"resolving a member BY THE PIN instead of by the CASE'S edition number is NOT
 * done. Today `version_sha` and the served `bundle_sha` agree only because a
 * member's edition is still slaved to its case's; CASE-5 is where they can
 * diverge and where the pin starts doing work no other column can."*
 *
 * SO THE FIRST THING THIS SUITE HAD TO DO WAS MAKE THEM DIVERGE, AND THAT IS THE
 * DESIGN CALL WORTH READING BEFORE THE ASSERTIONS. There was no fixture over the
 * shipped plane that could produce a divergence, and that is a measurement rather
 * than an opinion: `op=publish` stamped the CASE's edition into every member's
 * bytes and `op=ratify` committed it to `published_bundles`, so a member's edition
 * WAS its case's, by construction, on every path. A finding already published at
 * edition 1 could not even join a second case — that case's edition 1 would demand
 * bytes at a number the finding had spent, and `EDITION_EXISTS` refused it for a
 * reason that has nothing to do with the finding. **That is what "one-case-per-
 * finding baked into the FORMAT" means in the design doc, and unbaking it is the
 * flip.** So `op=publish` now stamps the MEMBER'S OWN next edition as `edition`
 * and the case's as `case_edition`, and the two numbers come apart the first time
 * a case admits a member that has not published as often as the case has.
 *
 * THE FIXTURE, therefore, and it is deliberately the smallest thing that
 * diverges — no second case, no multi-case membership (that is CASE-6's surface):
 *
 *     case edition 1 : [ALPHA]           ALPHA at its own edition 1
 *     case edition 2 : [ALPHA, BETA]     ALPHA at its own edition 2
 *                                        BETA  at its own edition 1   <-- DIVERGED
 *
 * BETA is a finding concluded and never before published, joining at the case's
 * second edition. Under the old predicate `#caseEditionState` looked for BETA in
 * `published_bundles` at edition 2 and found NOTHING — so BETA fell into
 * `awaiting`, the edition read INCOMPLETE forever, and no container was ever
 * assembled. A published case silently insisting it is still waiting for a
 * finding that ratified. That is what negative-control arm (a) restores, and it
 * fails by name.
 *
 * EVERY ARM IS DRIVEN THROUGH AN OP AND MOST OF THEM ANONYMOUSLY. `op=invitelook`
 * shipped with a ReferenceError while 1276 assertions passed, so a store-level
 * test is not evidence that a caller can reach a feature; and the caller this
 * item is FOR holds no credential at all.
 *
 * AND THE EXPECTATIONS ARE NOT DERIVED FROM THE THING UNDER TEST — the class that
 * has now bitten five items on this arc, each one after the previous worker's
 * report was read. Three separate anchors, none of which this item may edit or
 * can move:
 *   - every expected PIN is the sha fed to `ssh-keygen -Y sign` BEFORE
 *     ratification, captured by the ratify helper and never read back out of the
 *     pin column or the published row;
 *   - block 6's clauses are PARSED OUT OF `CASE-AS-PRODUCTION.md` at run time —
 *     a document written before this code, owned by nobody in this worktree, and
 *     one this claim names READ ONLY. It is looked for in `docs/development/` AND
 *     `docs/archive/`, because CASE-6 moves it;
 *   - block 4's stranger drive verifies with `ssh-keygen -Y verify`, an external
 *     binary that shares no code path with anything in `src/`, over bytes this
 *     plane cannot reach at the moment of the check.
 *
 * WHAT NO ARM HERE REACHES, STATED RATHER THAN LEFT TO BE DISCOVERED:
 *   - **CLOSED 2026-09-10 BY CASE-5b.** This entry read: *"A FINDING'S BYTES
 *     STILL NAME A CASE … Nothing here asserts that finding bytes have stopped
 *     naming a case, because they have not."* That was the honest state of the
 *     record, and it is kept here rather than deleted because it is the sentence
 *     the next item was scoped off — a stated limit doing exactly the work a
 *     stated limit is for. CASE-5b minted the CASE-LEVEL SIGNING CEREMONY those
 *     facts had nowhere to move to (a case document, its gate C-41, its ratify
 *     path `op=caseratify`), and the block-6 arm is now INVERTED: it demands
 *     that not one of the eight keys survives in the published document, and
 *     that every one of them is in the case document a member signed. IC-71.
 *   - MULTI-CASE MEMBERSHIP. `FINDING_IN_ANOTHER_CASE` still refuses a finding
 *     into a second case. The flip makes that representable rather than
 *     impossible-by-format. **CASE-6 TOOK THE QUESTION AND KEPT THE FENCE, on a
 *     count rather than a judgement**, and the sentence this replaces — "lifting
 *     the refusal is a surface question (which case does a finding id resolve
 *     to)" — was the part that turned out to be wrong: the class has 11 sites in
 *     `store.mjs`, 9 of them SCALAR readers that are correct only while the fence
 *     holds. Reasoning in full at the refusal's own site; the remaining gap
 *     against DEC-72 clause 6 is in `DEBT.md`. Asserted below as STILL REFUSED,
 *     so the state of the record is pinned rather than left ambiguous.
 */

import "./stdio.mjs";
import { makePublishingProject } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { ratifyCase } from "./caseceremony.mjs"; /* CASE-5b: the case-level signing ceremony */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- caseflip ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("caseflip: SKIPPED — ssh-keygen not on PATH; the stranger drive VERIFIES real signatures with "
    + "the external binary, and a freeze proved with our own verifier proves our verifier");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-case5", MEMBER_TOKEN: "mem-case5", PROBE_TOKEN: "prb-case5", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const shaBytes = (u8) => createHash("sha256").update(Buffer.from(u8)).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* THE ANONYMOUS CALLER — no token, no cookie, no header. The freeze and the
   container exist for a reader who holds nothing, so they are read by one. */
const anon = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const anonRaw = async (q) => mf.dispatchFetch(`http://x/api/?${q}`);

/* ---- keys and members ---- */
const dir = mkdtempSync(join(tmpdir(), "caseflip-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "rosa", "-f", join(dir, "rosa"), "-q"]);
const keyB64 = readFileSync(join(dir, "rosa.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "rosa"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-case5",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* TWO administrators before any ordinary member (ADMINS_FIRST). rosa publishes. */
await enrol("nadia", "nadia-passphrase-55", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-55", "admin", ["contribute", "publish"]);
const ROSA = await enrol("rosa", "rosa-passphrase-55", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-case5", { keyB64, memberId: "rosa", comment: "rosa laptop" }));

const listRow = async (id) => ((await GET(`op=list&token=${ROSA}&limit=1000`)).result?.bundles
  || (await GET(`op=list&token=${ROSA}&limit=1000`)).result || [])
  .find((b) => b.bundle_id === id);
const shaOf = async (id) => (await listRow(id))?.bundle_sha ?? null;

/* THE RATIFY HELPER RETURNS THE SHA IT SIGNED, and that is the whole of this
   suite's independence on the pin: every expected `version_sha` below is THIS
   value — the hash that went into the statement `ssh-keygen` signed — and never a
   value read back out of the pin column, the published row or the manifest. The
   two sides of each pin assertion therefore cannot move together. */
const ratify = async (id) => {
  const bundleSha = await shaOf(id);
  const r = rP(await POST(`op=ratify&token=${ROSA}`,
    { bundleId: id, expectedSha: bundleSha, sig: signRatify(id, bundleSha) }));
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
      `    grade: ${l.grade}`, `    grade_axis: ${l.axis}`, `    grade_source: ${l.source}`,
      ...(l.source === "hunch" ? ["    author: rosa", `    date: ${NOW.slice(0, 10)}`] : [])])]
  : [];
/* BOTH AXES CARRY A LEG, and that is forced by the fixture's own declared bar
   rather than chosen: `unrated` is not a grade and does not meet a declared bar
   of any letter (R2 / DEC-21 — `unrated` and `undetermined` are frozen FACTS,
   not weak grades), so a load-bearing member with no connection leg is refused
   BELOW_PROJECT_STRENGTH before this suite reaches anything it is about. That
   refusal is CASE-2's subject and stays in CASE-2's suite. */
const BOTH_AXES = [{ target: "INFO", grade: "B", axis: "capture", source: "capture" },
                   { target: "INFO", grade: "C", axis: "connection", source: "hunch" }];
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
const promote = async (id, md, type, state = "open", register = []) => rP(await POST(`op=promote&token=${ROSA}`, {
  bundleId: id, base: null,
  snapKey: `20260910T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
  register,
}));
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[0]}: ${JSON.stringify(r)}`);
  return r;
};
/* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
   conclusion drawn with no project NAMES the accepted reading whose claim it
   adopts, and an unnamed one is refused NO_CLAIM. This helper concluded with no
   reading because the act took none; the inquiries it concludes (ALPHA, BETA,
   LOOSE — all three) now carry one (`withAdoptableReading`) and the call names it. */
const conclude = async (target, conclusion, falsifier) =>
  rP(await GET(`op=conclude&token=${ROSA}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`
    + adoptedVersionParam()));
const reopen = async (target, reason) =>
  rP(await GET(`op=reopen&token=${ROSA}&target=${encodeURIComponent(target)}&reason=${encodeURIComponent(reason)}`));

/* THE CEREMONY IS `op=publish` AT THE CONTROL PLANE. Spelled as the literal a
   real caller uses, which is also what `coverage.mjs` credits. The project is
   OWNED BY ROSA because CASE-2's fence is owner-only and rosa is who publishes;
   a project owned by anybody else answers NO_SUCH_PROJECT. */
const PUBLISHING_PROJECT = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-case5", owner: "rosa",
  id: "PROJ-2026-0500-caseflip", created: NOW, updated: LATER,
  /* A DECLARED BAR, deliberately — unlike every other suite's fixture, which
     leaves it absent so the fixture adds a publisher and never a gate. This suite
     is partly ABOUT the bar: DEC-72 clause 2 makes it a property of the CASE, and
     an absent bar would let block 3 assert `bar: null` and call that a freeze.
     `D`/`D` is the weakest grade the vocabulary has, so it is declared and it
     gates nothing — the bar is under assertion here, not the refusal it can
     produce, which is CASE-2's suite and stays there. */
  bar: { capture: "D", connection: "D", author: "rosa", at: NOW } });
/* CASE-5b: THE CASE CEREMONY RIDES THIS HELPER — see caseceremony.mjs. The case's
   own assertions are committed when a member SIGNS the case document, so every
   assertion below is about the state after that signature. Not run when publish
   REFUSED. */
const publishCase = async (body, { sign = true } = {}) => {
  const r = rP(await POST(`op=publish&token=${ROSA}`,
    { project: PUBLISHING_PROJECT, ...body }));
  if (sign && r && r.ok !== false && r.caseDocument)
    await ratifyCase(async (q, b) => rP(await POST(q, b)), r, { dir, key: "rosa", token: ROSA });
  return r;
};

const INFO_A = "INFO-2026-5500-memo";
const INFO_B = "INFO-2026-5500-left-out";
const ALPHA = "INQ-2026-5500-alpha";     /* publishes at case edition 1 AND 2 -> own editions 1, 2 */
const BETA = "INQ-2026-5500-beta";       /* joins at case edition 2 only     -> own edition 1  <-- */
const LOOSE = "INQ-2026-5500-loose";     /* never a member of any case */

/* INFO_A carries a REGISTERED CAPTURE, because the basis legs below state an
   EARNED capture grade of B and C-2.8 refuses a grade over a document whose
   arrival the record never witnessed. The fixture has to be legal on the axis
   this suite is not about, or nothing it IS about can be reached. */
await mustPromote(INFO_A, infoMd(INFO_A), "information", "collected",
  [{ path: "snapshots/source.bin", sha256: sha("caseflip-INFO_A-bytes"), bytes: 512, encoding: "binary" }]);
await mustPromote(INFO_B, infoMd(INFO_B), "information", "collected");
for (const id of [ALPHA, BETA, LOOSE])
  await mustPromote(id, withAdoptableReading(inquiryMd(id, { question: `Was the ${id} transfer authorised?`,
    refs: [INFO_A], legs: BOTH_AXES.map((l) => ({ ...l, target: INFO_A })) })), "inquiry");   /* REC-136: all three are concluded */

const mustConclude = async (id) => {
  const c = await conclude(id, `${id} rests on a memo nobody adopted.`,
    "An adopted resolution naming the transfer would overturn this.");
  if (!c.ok) throw new Error(`conclude ${id}: ${JSON.stringify(c)}`);
};
await mustConclude(ALPHA);
await mustConclude(BETA);

/* ============================================================ CASE EDITION 1 */
const e1 = await publishCase({ target: ALPHA, roles: { [ALPHA]: "load_bearing" },
  statement: "Edition 1 covers the FY2024 sewer transfer on the documents in hand on 1 July.",
  scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
  excluded: [{ target: INFO_B, description: "the FY2023 comparison memo",
               reason: "a records request for it is still outstanding with the City Clerk" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "This group holds a declared position that fund transfers should be adopted in "
                     + "public session; edition 1 reads the FY2024 record through it." });
if (!e1.ok) throw new Error(`publish edition 1: ${JSON.stringify(e1)}`);
const CASE = e1.caseId;
const ratA1 = await ratify(ALPHA);
if (!ratA1.ok) throw new Error(`ratify ALPHA edition 1: ${JSON.stringify(ratA1)}`);
const SIGNED_ALPHA_1 = ratA1.signedSha;

/* ============================================================ CASE EDITION 2 */
/* ALPHA comes back through the ceremony the STATES table describes:
   published -> open -> concluded -> published. BETA has never been published. */
const rA = await reopen(ALPHA, "A second memo surfaced and the reading has to take it in.");
if (!rA.ok) throw new Error(`reopen ALPHA: ${JSON.stringify(rA)}`);
await mustConclude(ALPHA);

const e2 = await publishCase({ targets: `${ALPHA},${BETA}`, caseId: CASE,
  roles: { [ALPHA]: "load_bearing", [BETA]: "supporting" },
  statement: "Edition 2 adds the second memo and states that the FY2023 comparison is still outstanding.",
  scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
  excluded: [{ target: INFO_B, description: "the FY2023 comparison memo",
               reason: "the records request is still outstanding, now with the City Attorney" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: "We put edition 2's added claims to the City Administrator on 2026-08-30.",
  biasAcknowledgement: "The declared position is unchanged; for edition 2 it bears on how the second "
                     + "memo's silence about adoption is read." });
if (!e2.ok) throw new Error(`publish edition 2: ${JSON.stringify(e2)}`);
const ratA2 = await ratify(ALPHA);
if (!ratA2.ok) throw new Error(`ratify ALPHA edition 2: ${JSON.stringify(ratA2)}`);
const SIGNED_ALPHA_2 = ratA2.signedSha;
const ratB1 = await ratify(BETA);
if (!ratB1.ok) throw new Error(`ratify BETA: ${JSON.stringify(ratB1)}`);
const SIGNED_BETA_1 = ratB1.signedSha;

/* ================== 1. THE DIVERGENCE, DRIVEN THROUGH THE ANONYMOUS READ ==== */
console.log("\n--- 1. a member's edition and its case's edition are DIFFERENT NUMBERS, and both are served ---");
{
  const c2 = await anon(`op=publishedcase&id=${CASE}&edition=2`);
  const byId = Object.fromEntries((c2.findings || []).map((f) => [f.bundle_id, f]));

  /* THE MEASUREMENT THE ITEM EXISTS FOR. Two members of ONE case edition sitting
     at DIFFERENT editions of their own — which the plane could not represent
     before this item, on any path. The case's number is 2 because this is the
     second publication act performed above; the members' numbers are counted the
     same way, from acts this suite performed and not from anything it read. */
  t("THE PIN AND THE CASE'S EDITION HAVE ACTUALLY DIVERGED: case edition 2 holds one member at its own "
    + "edition 2 and another at its own edition 1",
    [c2.edition, byId[ALPHA]?.edition, byId[BETA]?.edition], [2, 2, 1]);
  t("and the edition that diverges is REACHABLE AS A CASE EDITION AT ALL — complete, with nothing awaiting: "
    + "under the old predicate BETA had no row at the case's number and the edition read incomplete forever",
    [c2.complete, c2.awaiting], [true, []]);

  /* THE PIN IS WHAT RESOLVED IT, and the expected values are the shas fed to
     ssh-keygen before each ratification — never read back off the pin column. */
  t("each member's pin is the hash THAT MEMBER SIGNED, and the two members signed different bytes",
    [byId[ALPHA]?.version_sha, byId[BETA]?.version_sha,
     byId[ALPHA]?.version_sha === byId[BETA]?.version_sha],
    [SIGNED_ALPHA_2, SIGNED_BETA_1, false]);
  t("and the bytes the case SERVES for each member are the bytes it PINNED — the freeze holding, per member",
    [byId[ALPHA]?.bundle_sha === SIGNED_ALPHA_2, byId[BETA]?.bundle_sha === SIGNED_BETA_1],
    [true, true]);

  /* THE COUNTER-FACT THAT MAKES THE ABOVE MEAN SOMETHING: there is no row for
     BETA at edition 2 to be found by the old predicate. Read through a DIFFERENT
     op, so the claim does not rest on the surface under test.
     `op=publishededitions` takes a credential (`classes: admin|member|probe`),
     unlike every other read in this suite. That is not a gap in the stranger
     property — the property is about the CONTAINER and about `op=publishedcase`,
     both of which are driven anonymously above — and this call is a counter-fact
     the suite checks about its own fixture, not a surface a stranger needs. */
  const be = await GET(`op=publishededitions&token=${ROSA}&id=${BETA}`).then(rP);
  t("BETA HAS NO EDITION 2 AT ALL — its own chain has exactly one entry, so resolving it by the CASE's "
    + "edition number could only ever have found nothing",
    (be.editions || []).map((e) => e.edition), [1]);
  const ae = await GET(`op=publishededitions&token=${ROSA}&id=${ALPHA}`).then(rP);
  t("and ALPHA's chain has two, because ALPHA really did publish twice — the divergence is BETA's history, "
    + "not a number this plane invented",
    (ae.editions || []).map((e) => e.edition), [1, 2]);

  /* EDITION 1 STILL ANSWERS AND STILL HOLDS ONE MEMBER, so the flip did not
     rewrite what a reader of the older edition was given (DEC-12). */
  const c1 = await anon(`op=publishedcase&id=${CASE}&edition=1`);
  t("edition 1 still answers, still names ONE member, and still pins the hash ALPHA signed for it",
    [c1.edition, (c1.findings || []).map((f) => f.bundle_id), c1.findings?.[0]?.version_sha,
     c1.findings?.[0]?.edition],
    [1, [ALPHA], SIGNED_ALPHA_1, 1]);
  t("and edition 1's pin did NOT follow ALPHA forward into edition 2's version",
    c1.findings?.[0]?.version_sha === SIGNED_ALPHA_2, false);

  /* THE AUTHORED PARTITION, ON THE PUBLIC READ. CASE-2 wrote it into the roster
     row and into the signed bytes; before this item no public surface served it,
     so a reader could not see which members the bar was asked of. */
  t("each member's AUTHORED role is served beside its pin, so a supporting member is visibly not carrying "
    + "the case (DEC-72 clause 4)",
    [byId[ALPHA]?.role, byId[BETA]?.role], ["load_bearing", "supporting"]);
}

/* ================== 2. THE STRANGER'S OWN ROUTE: A HASH AND NOTHING ELSE ==== */
console.log("\n--- 2. a caller holding ONLY a member's hash reaches the RIGHT case edition ---");
{
  /* This is the route the published projection exists for, and it is the one the
     conflation damaged worst: `publishedCase()` took the FINDING's edition off its
     published row and asked for the CASE at that number. For BETA that number is
     1 and BETA is in edition 2 — so a stranger holding BETA's hash would have been
     handed edition 1's scope, completeness assertion and roster, over a finding
     edition 1 never contained. */
  const byShaBeta = await anon(`op=publishedcase&sha256=${SIGNED_BETA_1}`);
  t("BETA's hash resolves to the case edition that PINNED it — edition 2, not edition 1, which is the "
    + "number BETA's own published row carries",
    [byShaBeta.ok, byShaBeta.caseId, byShaBeta.edition, byShaBeta.asked], [true, CASE, 2, BETA]);
  t("and the case edition it hands back is the one whose roster actually contains BETA",
    (byShaBeta.findings || []).map((f) => f.bundle_id).sort(), [ALPHA, BETA].sort());

  const byShaAlpha1 = await anon(`op=publishedcase&sha256=${SIGNED_ALPHA_1}`);
  t("ALPHA's FIRST hash still resolves to edition 1 — a hash resolves to its own edition and never to the "
    + "current one, which is what makes 'edition 1 still answers' true rather than stated",
    [byShaAlpha1.edition, (byShaAlpha1.findings || []).map((f) => f.bundle_id)], [1, [ALPHA]]);

  /* A RATIFIED BUNDLE IN NO CASE still answers as what it is, and the pin-based
     resolution must not turn it into a case. LOOSE is never published, so the
     nearest reachable shape is a bundle whose hash was never ratified. */
  const nothing = await anon(`op=publishedcase&sha256=${sha("no such bytes were ever ratified")}`);
  t("a hash that was never ratified is refused exactly as one that never existed — the published "
    + "projection is the only table this read can see",
    [nothing.ok, nothing.reason], [false, "NOT_PUBLISHED"]);
}

/* ================== 3. CASE-SIDE FREEZING, IN THE ARTIFACT THAT TRAVELS ===== */
console.log("\n--- 3. the CASE artifact freezes its members: hash, version, pair, role, the bar, the exclusions ---");
const MANIFEST2 = await (async () => {
  const c2 = await anon(`op=publishedcase&id=${CASE}&edition=2`);
  return c2.manifest_sha;
})();
{
  t("the case edition that DIVERGES has a container at all — the assembler ran, which it could not have "
    + "done while the edition read incomplete",
    /^[0-9a-f]{64}$/.test(String(MANIFEST2)), true);

  /* READ DEFENSIVELY. The negative control's arm (a) removes the pin resolution,
     and the diverged edition then never completes, so no container is ever
     assembled and `MANIFEST2` is null — at which point a suite that assumed JSON
     would CRASH here and report a parse error where the finding is "a fully
     ratified case assembled no container". **A crash names nothing** is CASE-2's
     recorded lesson from three arms that did exactly this, and arm (a) is where
     it arrived here: its first run died after nine named failures instead of
     naming all of them. */
  const raw = MANIFEST2
    ? new Uint8Array(await (await anonRaw(`op=publishedbytes&sha256=${MANIFEST2}`)).arrayBuffer())
    : new Uint8Array();
  let man = null;
  try { man = JSON.parse(new TextDecoder().decode(raw)); } catch { man = null; }
  if (!man) {
    console.log("  (no container: this case edition assembled none, so blocks 3 and 4 assert against an "
      + "ABSENT artifact rather than crashing — the finding is the absence)");
    man = { format: null, case: null, edition: null, parts: [], findings: [],
            completeness: { excluded: "[]" }, bar: null, project: null };
  }
  t("the container answers by its own hash to an anonymous caller, and the bytes ARE that hash",
    [shaBytes(raw) === MANIFEST2, man.case, man.edition], [true, CASE, 2]);
  t("the format version MOVED with the fields the flip adds — a /3 container carrying no pin and a /4 "
    + "container whose pin was withheld must not be indistinguishable to a stranger",
    /* CORRECTED 2026-09-18, REC-128: `/5` -> `/6`, AND THE OLD ASSERTION WAS RIGHT WHEN IT WAS WRITTEN. `/6` carries `delivered_by` beside every `attestor` (who DELIVERED the signature, from the session: a member or the founder), and the version moves for the reason every bump here moved it — a `/5` container that never recorded a deliverer and a `/6` one whose deliverer was not recorded must not read alike. The pin still demands an EXACT version. */
    man.format, "bio-case-container/6");

  /* THE DESIGN'S OWN LIST, one assertion per item on it. */
  t("CONTENT BY HASH: every part is named by sha256 and namespaced by the finding it belongs to",
    [man.parts.length > 0, man.parts.every((p) => /^[0-9a-f]{64}$/.test(p.sha256)),
     man.parts.every((p) => p.path.startsWith(p.finding + "/"))],
    [true, true, true]);
  t("VERSION: each member carries the version the case COMMITTED TO, and it is the hash that member signed",
    man.findings.map((f) => f.version_sha), [SIGNED_ALPHA_2, SIGNED_BETA_1]);
  t("and each member's EDITION inside the container is ITS OWN — the line that used to write the case's "
    + "number onto every member was a false statement in an artifact nobody can check against us",
    man.findings.map((f) => [f.bundle_id, f.edition]), [[ALPHA, 2], [BETA, 1]]);
  t("PER-MEMBER STRENGTH PAIR: two axes each, frozen, and NO case-level letter — composing them into one "
    + "is what R2 forbids at case altitude",
    [man.findings.every((f) => Array.isArray(f.strength) && f.strength.length === 2), "strength" in man],
    [true, false]);
  t("ROLE: the publisher's authored designation travels with the container, so a stranger holding the zip "
    + "can see which members the bar was asked of",
    man.findings.map((f) => f.role), ["load_bearing", "supporting"]);
  t("THE BAR: the case's standard of evidence is IN the artifact and is the case's own property, with the "
    + "project whose production it is beside it",
    [man.bar?.declared, man.bar?.capture, man.bar?.connection, man.bar?.project, man.project],
    [true, "D", "D", PUBLISHING_PROJECT, PUBLISHING_PROJECT]);
  t("THE EXCLUSIONS: what the case left out is frozen case-side inside the completeness assertion, which "
    + "is why the flip does not copy it a second time (D-21)",
    JSON.parse(man.completeness.excluded).map((r) => r[0]), [INFO_B]);

  /* THE BAR IS THE CASE'S, WHICH IS CHECKABLE ONLY BECAUSE IT IS SERVED
     CASE-SIDE: it is asked of the load-bearing member and NOT of the supporting
     one, and both members carry the same case bar because it is one fact. */
  const c2 = await anon(`op=publishedcase&id=${CASE}&edition=2`);
  t("the anonymous read serves the bar as a CASE property, not as one member's stamp",
    [c2.bar?.capture, c2.bar?.connection, c2.project], ["D", "D", PUBLISHING_PROJECT]);
  t("and it says in words that an absent bar would not be a bar of zero, so a null cannot be read as a "
    + "standard nobody chose",
    typeof c2.bar_detail === "string" && c2.bar_detail.length > 40, true);

  /* `op=verify` — THE DOORBELL, and the third op the CASE-5 bullet names. A
     stranger holding the container's hash asks the instance one question, with
     no credential: is this published, and what is it? It answers from
     `published_shas` and NOTHING else, so a hash never ratified and a hash that
     never existed are one answer. What makes it read THE CASE ARTIFACT is the
     row `recordCaseManifest` writes: the manifest is registered under the CASE's
     identity at path MANIFEST.json, so the doorbell names the CASE and not a
     member finding. */
  /* Defensive for the same reason blocks 3 and 4 are: with no container there is
     no hash to ask about, and `op=verify` with no sha256 answers a REFUSAL whose
     shape has no `matches`. The finding is "there is nothing to verify", and a
     TypeError says nothing at all. */
  const v = { matches: [], ...(await anon(`op=verify&sha256=${MANIFEST2 || "absent"}`)) };
  t("op=verify answers for the CASE ARTIFACT itself, anonymously, and names the CASE rather than any "
    + "member finding — the container is registered under the case's own identity",
    [v.published, v.sha256 === MANIFEST2, v.matches.map((m) => [m.bundle_id, m.path, m.kind])],
    [true, true, [[CASE, "MANIFEST.json", "manifest"]]]);
  const vm = { matches: [], ...(await anon(`op=verify&sha256=${SIGNED_BETA_1}`)) };
  t("and the DIVERGED member's own bytes answer the doorbell too, under their own finding id — the "
    + "artifact and its members are both reachable from a hash alone",
    [vm.published, vm.matches.some((m) => m.bundle_id === BETA && m.path === "bundle.md")],
    [true, true]);
  const vn = { matches: [], ...(await anon(`op=verify&sha256=${sha("bytes this record has never held")}`)) };
  t("a hash the record never held answers published:false with no matches — never ratified and never "
    + "existed are ONE answer, by construction rather than by care",
    [vn.published, vn.matches], [false, []]);
}

/* ================== 4. THE STRANGER DRIVE, END TO END, ON BYTES ALONE ======= */
console.log("\n--- 4. a stranger holding published material verifies it WITHOUT contacting this instance ---");
{
  /* PHASE A — ACQUISITION. Everything a stranger is given, taken anonymously and
     copied into `HELD`. This is the only phase that touches the plane, and it is
     the part nobody disputes: bytes have to come from somewhere. What REC-44's
     property claims is about the phase AFTER it. */
  /* DEFENSIVE for block 3's reason and for the same arm. A stranger handed no
     container at all must be reported as holding nothing, not as a parse error. */
  const manRaw = MANIFEST2
    ? new Uint8Array(await (await anonRaw(`op=publishedbytes&sha256=${MANIFEST2}`)).arrayBuffer())
    : new Uint8Array();
  let man = null;
  try { man = JSON.parse(new TextDecoder().decode(manRaw)); } catch { man = null; }
  if (!man) man = { parts: [], findings: [], bar: null, project: null, edition: null };
  const HELD = new Map([["MANIFEST.json", manRaw]]);
  for (const p of man.parts)
    HELD.set(p.path, new Uint8Array(await (await anonRaw(`op=publishedbytes&sha256=${p.sha256}`)).arrayBuffer()));
  /* THE COUNTS ARE LITERALS, NOT SELF-REFERENCES, and that is the difference
     between an assertion and a tautology. `HELD.size === man.parts.length + 1`
     is TRUE OVER AN EMPTY MANIFEST — and an empty manifest is exactly what arm
     (a) produces, so a self-referential count would report a stranger
     successfully holding nothing. Two members, two bundle.md parts. */
  t("the stranger holds the container manifest and every part it names — TWO members' documents and the "
    + "manifest itself — all fetched with NO credential of any kind",
    [man.findings.length, man.parts.length >= 2, HELD.size, HELD.size === man.parts.length + 1],
    [2, true, man.parts.length + 1, true]);

  /* PHASE B — THE INSTANCE IS GONE. Not "not called": UNREACHABLE. Every route
     into the plane this suite has is replaced with a throw for the duration of
     the verification, so an accidental call is a crash and not a silent pass.
     "The instance's continued existence" is REC-44's own wording, and a drive
     that merely declines to call is a drive that could still be depending on it. */
  const liveFetch = mf.dispatchFetch.bind(mf);
  mf.dispatchFetch = () => { throw new Error("THE INSTANCE IS UNREACHABLE — this verification may not touch it"); };
  let reached = null, verified = null;
  try {
    const held = (path) => {
      const b = HELD.get(path);
      if (!b) throw new Error(`the stranger does not hold ${path}`);
      return b;
    };
    /* 1. THE MANIFEST IS THE HASH THEY WERE HANDED. */
    const manifestSelf = shaBytes(held("MANIFEST.json")) === MANIFEST2;

    /* 2. EVERY PART RE-DERIVES TO THE SHA THE MANIFEST NAMES. */
    const partsOk = man.parts.every((p) => shaBytes(held(p.path)) === p.sha256);

    /* 3. EACH FINDING'S OWN BYTES ARE THE BYTES ITS SIGNATURE COVERS — the link
          between "this file is in the container" and "a member signed this". */
    const bytesAreSigned = man.findings.every((f) =>
      shaBytes(held(`${f.bundle_id}/bundle.md`)) === f.bundle_sha);

    /* 4. THE SIGNATURES VERIFY, with ssh-keygen, against the key the artifact
          itself names — no code path shared with anything in src/. The statement
          is REBUILT from the manifest's own id and hash rather than trusted, and
          the artifact's printed statement is checked to agree with it. */
    const sigs = man.findings.map((f) => {
      const signers = join(dir, `held_signers_${f.bundle_id}`);
      writeFileSync(signers, `${f.attestor.member}@bio ssh-ed25519 ${f.attestor.key_b64}\n`);
      const sigFile = join(dir, `held_${f.bundle_id}.sig`);
      writeFileSync(sigFile, f.signature.armored);
      const rebuilt = `bio-ratify ${f.bundle_id} ${f.bundle_sha}\n`;
      if (f.signature.statement !== rebuilt) return "STATEMENT_DISAGREES";
      try {
        execFileSync("ssh-keygen",
          ["-Y", "verify", "-f", signers, "-I", `${f.attestor.member}@bio`,
           "-n", f.signature.namespace, "-s", sigFile],
          { input: Buffer.from(rebuilt), stdio: ["pipe", "ignore", "ignore"] });
        return "OK";
      } catch { return "SIGNATURE_FAILED"; }
    });

    /* 5. THE FREEZE: the case committed to exactly the bytes that were signed. */
    const freezeHolds = man.findings.every((f) => f.version_sha === f.bundle_sha);

    /* 6. THE FLIP, READ OUT OF THE BYTES ALONE: this container's own numbers say
          a member of case edition 2 sits at its own edition 1. A stranger can see
          the two altitudes without asking anybody which is which. */
    const altitudes = man.findings.map((f) => f.edition);

    /* 7. WHAT THE CASE REQUIRED, AND OF WHOM. */
    const roles = man.findings.map((f) => f.role);
    const barPresent = !!(man.bar && man.bar.declared === true && man.project);

    verified = { manifestSelf, partsOk, bytesAreSigned, sigs, freezeHolds,
                 caseEdition: man.edition, altitudes, roles, barPresent };
  } catch (e) {
    reached = String(e && e.message || e);
  } finally {
    mf.dispatchFetch = liveFetch;
  }

  t("THE WHOLE VERIFICATION RAN WITH THE INSTANCE UNREACHABLE — no route into the plane was touched once "
    + "the bytes were in hand",
    reached, null);
  t("the manifest is the hash the stranger was handed, and every part it names re-derives to the sha it "
    + "was given",
    [verified?.manifestSelf, verified?.partsOk], [true, true]);
  t("each finding's own bytes ARE the bytes its signature covers, so the container cannot substitute a "
    + "document for a signature",
    verified?.bytesAreSigned, true);
  t("EVERY MEMBER'S SIGNATURE VERIFIES under ssh-keygen against the key the artifact names, over the "
    + "statement rebuilt from the artifact's own id and hash",
    verified?.sigs, ["OK", "OK"]);
  t("THE FREEZE HOLDS: the version this case committed to is the version each member signed",
    verified?.freezeHolds, true);
  t("and the stranger can read BOTH ALTITUDES off the bytes — a case at edition 2 whose members are at "
    + "their own editions 2 and 1, which is the fact the flip exists to make sayable",
    [verified?.caseEdition, verified?.altitudes], [2, [2, 1]]);
  t("they can also see what the case REQUIRED and of WHOM, without asking us: a declared bar, a named "
    + "producing project, and one load-bearing member beside one that is not",
    [verified?.barPresent, verified?.roles], [true, ["load_bearing", "supporting"]]);

  /* AND THE CHECK IS NOT VACUOUS. An outcome that costs nothing to produce is
     not evidence, and a verifier that passes over anything is a verifier that
     proved nothing. ONE BYTE is flipped in a part the stranger holds, and every
     check that should notice does — offline, on the copy in their hand. */
  const victim = `${ALPHA}/bundle.md`;
  const clean = HELD.get(victim) ?? new Uint8Array([0]);
  const tampered = new Uint8Array(clean);
  tampered[Math.floor(tampered.length / 2)] ^= 0x01;
  let manNow = null;
  try { manNow = JSON.parse(new TextDecoder().decode(HELD.get("MANIFEST.json"))); } catch { manNow = null; }
  /* Defensive for the same arm and the same recorded lesson: with no container
     there is no part and no finding to tamper with, and this block must REPORT
     that rather than throw on `undefined.sha256`. */
  const part = manNow?.parts?.find((p) => p.path === victim) ?? { sha256: "NO-CONTAINER" };
  const fnd = manNow?.findings?.find((f) => f.bundle_id === ALPHA)
           ?? { bundle_sha: "NO-CONTAINER", attestor: { member: "none", key_b64: "none" },
                signature: { armored: "", namespace: "bio-ratify" } };
  const tamperSigners = join(dir, "tamper_signers");
  writeFileSync(tamperSigners, `${fnd.attestor.member}@bio ssh-ed25519 ${fnd.attestor.key_b64}\n`);
  const tamperSig = join(dir, "tamper.sig");
  writeFileSync(tamperSig, fnd.signature.armored);
  let sigOnTampered = "OK";
  try {
    execFileSync("ssh-keygen",
      ["-Y", "verify", "-f", tamperSigners, "-I", `${fnd.attestor.member}@bio`,
       "-n", fnd.signature.namespace, "-s", tamperSig],
      { input: Buffer.from(`bio-ratify ${ALPHA} ${shaBytes(tampered)}\n`), stdio: ["pipe", "ignore", "ignore"] });
  } catch { sigOnTampered = "SIGNATURE_FAILED"; }
  t("ONE FLIPPED BYTE and the stranger's own checks fail: the part no longer matches its sha, the bytes no "
    + "longer match the signed hash, and the signature no longer verifies over what they hold",
    [shaBytes(tampered) === part.sha256, shaBytes(tampered) === fnd.bundle_sha, sigOnTampered],
    [false, false, "SIGNATURE_FAILED"]);
  t("while the untouched copy still passes all three — so the failure above is the tamper and not the check",
    [shaBytes(clean) === part.sha256, shaBytes(clean) === fnd.bundle_sha], [true, true]);
}

/* ================== 5. op=publishedmanifest RECONSTRUCTS THE FLIPPED RECORD == */
console.log("\n--- 5. the reconstruction index carries both altitudes and says how to join them ---");
{
  const pm = await anon("op=publishedmanifest");
  const members = pm.caseMembers.filter((m) => m.case_id === CASE && Number(m.edition) === 2);
  const pubBy = new Map(pm.published.map((p) => [p.bundle_sha, p]));

  t("the roster of the diverged edition carries a pin per member, and every pin resolves to a published "
    + "row — which is the join a reconstructor must make",
    [members.map((m) => m.bundle_id).sort(), members.every((m) => pubBy.has(m.version_sha))],
    [[ALPHA, BETA].sort(), true]);
  t("AND THE JOIN IS PIN-TO-SHA, NOT EDITION-TO-EDITION: joining on the two numbers loses exactly the "
    + "member the pin exists to name",
    members.filter((m) => (pm.published.find((p) => p.bundle_id === m.bundle_id
      && Number(p.edition) === Number(m.edition)) == null)).map((m) => m.bundle_id),
    [BETA]);
  t("and the index SAYS SO in words, so a reconstructor who never reads our source is told the rule rather "
    + "than left to discover it by losing rows",
    pm.production.includes("version_sha") && pm.production.includes("NEVER EDITION TO EDITION"), true);

  const caseRow = pm.cases.find((c) => c.case_id === CASE && Number(c.edition) === 2);
  t("the case row on the public index carries the BAR and the producing project, so the standard a case "
    + "was held to is reconstructible from this op alone",
    [caseRow?.bar?.capture, caseRow?.bar?.connection, caseRow?.project_id],
    ["D", "D", PUBLISHING_PROJECT]);
  /* ONE AUTHORITY EACH, AND THE PAIR IS THE FLIP. `published[]` carries the
     FINDING's own edition and `caseMembers[]` carries the CASE's, and neither
     restates the other — which is D-21 kept rather than a field this item
     declined to add. The two numbers for BETA are 1 and 2, on two different
     rows, which is the whole shape a reconstructor has to get right. */
  t("the two altitudes live on two different rows and neither restates the other: published[] holds the "
    + "FINDING's own edition, caseMembers[] holds the CASE's, and for BETA they are 1 and 2",
    [pm.published.filter((p) => p.bundle_id === BETA).map((p) => Number(p.edition)),
     members.filter((m) => m.bundle_id === BETA).map((m) => Number(m.edition))],
    [[1], [2]]);
}

/* ================== 6. THE EXPECTATION COMES FROM THE AUTHORITY ============= */
console.log("\n--- 6. the clauses are parsed from CASE-AS-PRODUCTION.md, not from this suite ---");
{
  /* The design doc is looked for in BOTH homes: `docs/development/` today, and
     `docs/archive/` after CASE-6 moves it under the working-surface rule. A
     suite that stopped asserting when the document was archived would be a
     ratchet that silently released. */
  const HERE = fileURLToPath(new URL(".", import.meta.url));
  const CANDIDATES = ["../../docs/development/CASE-AS-PRODUCTION.md",
                      "../../docs/archive/CASE-AS-PRODUCTION.md"].map((p) => join(HERE, p));
  const found = CANDIDATES.find((p) => existsSync(p));
  t("the ruled design is FOUND, in `docs/development/` or in `docs/archive/` where CASE-6 will move it — "
    + "an expectation that cannot be loaded is an assertion that stops asserting",
    !!found, true);
  /* WHITESPACE-NORMALISED BEFORE ANYTHING IS MATCHED. The document is prose
     wrapped at 80 columns, so every phrase this block looks for is split across
     a newline and two spaces of indent somewhere in the corpus — and a regex
     that silently matches nothing is exactly the failure this whole block exists
     to avoid. The arm below that asserts each extract is NON-EMPTY is what makes
     that safe rather than assumed. */
  const doc = (found ? readFileSync(found, "utf8") : "").replace(/\s+/g, " ");
  const bullet = (doc.match(/\*\*CASE-5 · the artifact flip\.\*\*(.*?)(?=- \*\*CASE-6)/) || [])[1] || "";
  const flipClause = (doc.match(/\*\*The signed-artifact direction FLIPS\.\*\*(.*?)(?=- \*\*`published`)/) || [])[1] || "";
  const rec44Row = (doc.match(/\*\*REC-44's finding-side case stamping\*\*(.*?)\|(.*?)\|/) || [])[2] || "";
  t("and its CASE-5 bullet, its artifact-flip clause and its REC-44 supersession row are all READ — a "
    + "regex that matched nothing would let every assertion below pass over an empty string",
    [bullet.length > 60, flipClause.length > 60, rec44Row.length > 60], [true, true, true]);

  t("clause A — the bullet demands CASE-SIDE FREEZING, and the container the diverged edition assembled "
    + "carries the version, the role and the bar the flip clause enumerates",
    [/case-side freezing/i.test(bullet),
     /content by hash, version, per-member strength pair, role, the bar, the exclusions/i.test(flipClause)],
    [true, true]);
  t("clause B — the bullet names the three ops that must read the case artifact, and blocks 1, 3 and 5 "
    + "drove all three anonymously",
    ["op=verify", "op=publishedcase", "op=publishedmanifest"].map((o) => bullet.includes(o)),
    [true, true, true]);
  t("clause C — the bullet demands the stranger-verification path PROVEN END TO END, and the supersession "
    + "row says that property is preserved CASE-SIDE rather than dropped with the stamping",
    [/proven end to end/i.test(bullet),
     /a stranger holding published material can verify without contacting the instance.*preserved case-side/i
       .test(rec44Row)],
    [true, true]);

  /* WHAT THE DOCUMENT ALSO DEMANDS AND THIS ITEM DID NOT DO. Asserted as a
     DEMAND THAT EXISTS rather than as a demand that is met — so the gap is
     pinned in the suite that owns it and the next reader finds it here rather
     than deducing it from an absence. */
  /* READ OUT OF THE PUBLISHED BYTES THEMSELVES, not off a read surface. The
     claim is about what a finding's DOCUMENT carries, so the document is what is
     inspected — the same bytes the container hands a stranger, fetched by their
     own sha. Asserting it from `op=publishedcase.caseId` would have been a
     statement about the plane's index, which is not what the bullet is about. */
  const betaBytes = new TextDecoder().decode(new Uint8Array(
    await (await anonRaw(`op=publishedbytes&sha256=${SIGNED_BETA_1}`)).arrayBuffer()));
  /* ===== CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED, AND THIS IS THE
     ASSERTION THE WHOLE ITEM WAS MEASURED AGAINST. ==========================

     WHAT IT SAID, AND WHY IT WAS RIGHT: *"the bullet ALSO demands that FINDING
     BYTES STOP NAMING A CASE, AND THEY STILL DO … pinned as the state of the
     record: those facts have no signature to move to (IC-66)."* CASE-5 could not
     remove them, and it refused to pretend otherwise — this arm existed so that
     "still there" stayed distinguishable from "nobody checked", which is the
     difference between a stated limit and a silent one. It did its job: the item
     that closed the gap was scoped off exactly this sentence.

     WHY IT IS WRONG NOW: CASE-5b mints the signature those facts had nowhere to
     move to. A CASE DOCUMENT carries the case's identity, edition, producing
     project, scope, roster, partition, bias acknowledgement and bar; a member
     reviews it and signs it (`op=caseratify`); and the plane commits `cases`,
     `published_cases` and the roster out of those signed bytes and out of
     nothing else. The keys are gone from finding bytes and the gate REFUSES them
     there, so their absence is a property of the format rather than of
     op=publish remembering not to write them.

     THE ARM IS INVERTED RATHER THAN DELETED, and it demands MORE than the old
     one did: the same five keys the old arm listed, plus the three the ruling
     added after the CASE-5 bullet was written (`case_edition`, `case_project`,
     `bias_acknowledgement`) — because `case_edition` without `case_id` would
     name an edition of no case, which is C-2.8's own sentence. All eight are
     read OUT OF THE PUBLISHED BYTES THEMSELVES, by their own sha, for the reason
     the old arm gave: the claim is about what a finding's DOCUMENT carries, so
     the document is what is inspected. */
  t("the bullet demands that FINDING BYTES STOP NAMING A CASE, AND THEY NO LONGER DO — not one of the "
    + "eight keys survives in the published document, and the case's facts are signed once in the "
    + "CASE DOCUMENT a member ratified (CASE-5b, IC-71)",
    [/finding bytes stop naming a case/i.test(bullet),
     ["case_id:", "case_edition:", "case_project:", "case_findings:", "case_roles:", "case_scope:",
      "bias_acknowledgement:", "required_strength:"].filter((k) => betaBytes.includes(k))],
    [true, []]);
  t("and what a member's bytes still carry is its OWN edition on its own chain — the conflation the "
    + "flip removed stays removed, and the case's number is not in these bytes to be confused with it",
    [/^edition: 1$/m.test(betaBytes), /^case_edition: /m.test(betaBytes)], [true, false]);
  /* AND THE FACTS ARE WHERE THE ITEM SAYS THEY ARE — asserted positively as well
     as negatively, because an absence alone cannot tell a reader whether the
     facts MOVED or were simply dropped. The document is fetched through the
     ANONYMOUS surface, which is the caller the whole flip exists for. */
  const betaDoc = rP(await (await anonRaw(`op=casedocument&case=${CASE}&edition=2`)).json());
  t("and every one of them is in the CASE DOCUMENT instead, in bytes a member SIGNED — the facts "
    + "moved, they were not dropped",
    [["case_id:", "case_edition:", "case_project:", "case_findings:", "case_roles:", "case_scope:",
      "bias_acknowledgement:", "required_strength:"].filter((k) => !String(betaDoc.text).includes(k)),
     betaDoc.ratified, /^[0-9a-f]{64}$/.test(String(betaDoc.doc_sha)),
     String(betaDoc.sig_armored || "").startsWith("-----BEGIN SSH SIGNATURE-----")],
    [[], true, true, true]);

  /* MULTI-CASE MEMBERSHIP, DRIVEN RATHER THAN ASSUMED. LOOSE is concluded and
     published as a case of its own, and ALPHA — already a member of CASE — is
     then offered to it. It is pinned here because the flip removes the FORMAT's
     objection to a finding serving many cases: a reader of this suite must be
     able to tell what the plane does from "nobody checked".

     ===== CORRECTED BY D-309, 2026-09-10 — AND THE SUBJECT MOVED, SO THE
     ASSERTION MOVED WITH IT. This block used to pin MULTI-CASE MEMBERSHIP IS
     STILL REFUSED, and that was true and deliberate when CASE-6 wrote it: the
     fence was KEPT on a measured count, and the pin recorded a DECISION rather
     than a deferral. D-309 is the item that decision named. The nine scalar
     which-case readers are corrected, `CASE_IDENTITY_AMBIGUOUS` covers the
     derivation the fence was also protecting, and `FINDING_IN_ANOTHER_CASE` is
     DELETED — so the old assertion is now pinning a rule that no longer exists.

     IT IS CORRECTED AND NOT EXEMPTED, and the difference matters here more than
     usual: an exempted arm would leave this suite silent about the one property
     CASE-5's flip was FOR. So the arm asserts the OPPOSITE outcome, drives it
     through the ops end to end, and reads the membership BACK — because
     "the act returned ok" is not evidence that the record holds two memberships,
     and this suite's own header is where that lesson was written down. */
  await mustConclude(LOOSE);
  const other = await publishCase({ target: LOOSE, roles: { [LOOSE]: "load_bearing" },
    statement: "A separate case over a separate question, published to test the membership fence.",
    scope: "Whether the loose transfer was authorised.",
    excluded: [],
    subjectPosition: "not_sought",
    subjectJustification: "The subject was not approached for this edition and the reason is stated here.",
    biasAcknowledgement: "The same declared position on public adoption applies to this reading." });
  if (!other.ok) throw new Error(`publish LOOSE's own case: ${JSON.stringify(other)}`);
  const ratL = await ratify(LOOSE);
  if (!ratL.ok) throw new Error(`ratify LOOSE: ${JSON.stringify(ratL)}`);
  /* ALPHA COMES BACK THROUGH THE CEREMONY FIRST, so the payload is complete but
     for the one condition under test. A finding sitting at `published` is refused
     ILLEGAL_TRANSITION by the state machine long before the membership fence is
     consulted — which would have made this arm report that the fence held when
     the fence was never asked. Measured, not assumed: the first run of this arm
     came back ILLEGAL_TRANSITION and that is what sent ALPHA back round. */
  for (const id of [ALPHA, LOOSE]) {
    const rr = await reopen(id, "Offered to a second case, so the reading is opened again.");
    if (!rr.ok) throw new Error(`reopen ${id} for the fence arm: ${JSON.stringify(rr)}`);
    await mustConclude(id);
  }
  const both = await publishCase({ targets: `${LOOSE},${ALPHA}`, caseId: other.caseId,
    roles: { [LOOSE]: "load_bearing", [ALPHA]: "load_bearing" },
    statement: "A finding that already belongs to one case, published into a second one as well.",
    scope: "Whether the loose transfer was authorised.",
    /* D-309: THIS EDITION STATES ITS OWN LIMITS, and that is C-21.1 doing its job
       rather than an inconvenience worked around. The arm used to send
       `excluded: []` — byte-identical to edition 1's — which was invisible while
       the membership fence refused the act on the line before. With the fence
       gone the act reaches the completeness gate, and the gate immediately
       refused `COMPLETENESS_CARRIED_FORWARD`. **That is a finding about the old
       arm, not about this one: it was never reaching the code it claimed to
       test.** Recorded rather than smoothed. */
    excluded: [{ target: INFO_B,
                 description: "the second case's own excluded material",
                 reason: "this edition adds a finding from another case, so its limits are its own "
                       + "and are stated here as of this edition rather than carried forward" }],
    subjectPosition: "not_sought",
    subjectJustification: "Not approached for this attempt, which the fence should refuse first.",
    biasAcknowledgement: "Unchanged declared position on public adoption." });
  /* THE PIN IS KEPT AND ITS REASON IS CORRECTED, NOT EXEMPTED (CASE-6,
     2026-09-10) — and the correction is that CASE-5's own framing of this
     question was WRONG, which is worth more than the assertion it sits on.

     THIS ARM USED TO SAY: "lifting the fence is a surface question that belongs
     with CASE-6". CASE-6 took the question, measured it, and found it is not a
     surface question at all. The class — a SELECT over `published_case_members`
     keyed on `bundle_id`, i.e. "which case is this finding in" — has **11 sites
     in `store.mjs`, 9 of them SCALAR (`#one`) and 2 PLURAL (`#rows`), 0
     unclassified**, counted 2026-09-10. The nine scalar ones (`publishCase`'s
     `belongs` derivation, the container's `rel` lookup, `publishedCase`'s
     finding-id resolution, `#caseClaimOf`, `#caseOf`, `#caseOfSha`) are correct
     ONLY BECAUSE THIS REFUSAL HOLDS — `#caseOfSha` says so in its own words,
     "Nothing writes that shape today" — so lifting it in a surfaces item would
     convert nine correct answers into nine silent `LIMIT 1` guesses over a set.

     SO THE FENCE IS KEPT DELIBERATELY, and this pin now records a DECISION
     rather than a deferral. It remains a PARTIAL against DEC-72 clause 6, which
     rules that a finding CAN serve many cases; the reasoning in full is at the
     refusal's own site in `store.mjs`, and the gap is in `DEBT.md` with its cost
     and its closing move rather than left as a sentence in a suite. The SURFACE
     half clause 6 asks for IS built: the published index renders a finding's
     memberships as a list, correct for any n, so the plane's half can land
     without the surface moving.

     WHAT THE ASSERTION SAYS NOW (D-309, 2026-09-10). The paragraphs above are
     KEPT rather than deleted, because they are the argument that produced this
     item and a reader arriving at this line needs to know the fence was held
     deliberately and then lifted deliberately, not that it was never there. What
     changed underneath them: the nine ARE corrected, so the reason for keeping it
     is discharged rather than overruled. `FINDING_IN_ANOTHER_CASE` and
     `FINDINGS_IN_DIFFERENT_CASES` are both DELETED; neither name may appear in an
     answer again, and the arm asserts that too — a deleted refusal that quietly
     came back would otherwise look exactly like this arm passing. */
  t("MULTI-CASE MEMBERSHIP IS PERMITTED AND DRIVEN (D-309, DEC-72 clause 6): a finding already "
    + "published in one case is published into a SECOND by name, end to end through op=publish — "
    + "the fence CASE-6 measured and kept is gone now that the nine scalar readers answer set-valued",
    [both.ok, both.caseId, both.reason ?? null], [true, other.caseId, null]);
  t("and NEITHER deleted refusal can answer any more — a fence that quietly came back would look "
    + "exactly like the arm above passing, so both names are pinned as absent",
    [["FINDING_IN_ANOTHER_CASE", "FINDINGS_IN_DIFFERENT_CASES"].includes(String(both.reason))], [false]);
  /* AND THE MEMBERSHIP IS READ BACK, because `ok: true` is an outcome that costs
     nothing to produce and is not evidence that the RECORD holds two of them.
     The case document is ratified first — CASE-5b's wall: the roster and its pins
     are committed from the SIGNED BYTES by `ratifyCaseDocument` and by nothing
     else, so before that act there is no membership to read. Then ALPHA's own
     published row is asked through the ANONYMOUS index, which is the caller the
     whole published projection exists for. */
  await ratifyCase(async (q, b) => rP(await POST(q, b)), both, { dir, key: "rosa", token: ROSA });
  for (const id of [LOOSE, ALPHA]) {
    const rb = await ratify(id);
    if (!rb.ok) throw new Error(`ratify ${id} into the second case: ${JSON.stringify(rb)}`);
  }
  /* WHAT THE READ-BACK MEASURED, AND IT CORRECTED THIS ARM'S OWN FIRST DRAFT —
     recorded because it is a fact about the model that was not obvious and that
     the item's brief did not predict.

     A FINDING JOINS A SECOND CASE AT A **NEW VERSION**. `op=publish` promotes
     every member, so ALPHA is at one sha inside CASE and at a later sha inside
     the second case. Each case therefore holds, and signed for, the exact bytes
     it froze — which is CASE-3's pin working as designed and is MORE honest than
     two cases sharing one row, not less. The first draft of this arm asserted
     that ONE published row would carry two `cases` entries; it does not, and the
     assertion was wrong rather than the plane. The memberships live across the
     finding's EDITIONS, so that is where they are read. */
  /* `op=publishededitions` AND NOT `op=publishedlist`, and the difference is a
     measurement rather than a preference: BOTH are `classes: ["admin","member",
     "probe"]`, so neither is anonymous, and the first draft of this arm asked the
     ANONYMOUS caller for the index and got `NOT_AUTHENTICATED` back — an empty
     `bundles` array that would have read as "no memberships" if the arm had been
     written to tolerate it. It is not: the arm asserts the count is 2, so the
     silence failed loudly, which is what it is for. The anonymous surface is
     still driven, on `op=publishedcase` below, which IS ungated and is the
     stranger's own route. */
  const idx = rP(await GET(`op=publishededitions&id=${ALPHA}&token=${ROSA}`));
  const alphaRows = idx.editions || [];
  const alphaCases = [...new Set(alphaRows.flatMap((r) => (r.cases || []).map((c) => c.case_id)))].sort();
  t("and the RECORD holds both memberships, read back through op=publishededitions: ALPHA "
    + "serves two cases, each at the version that case actually froze — the shape DEC-72 clause 6 "
    + "rules for, and `cases` is the set, correct for any n (IC-74)",
    [alphaCases.length, alphaCases.includes(CASE), alphaCases.includes(other.caseId)],
    [2, true, true]);
  /* AND THE SET-VALUED QUESTION IS DRIVEN THROUGH THE OP THAT ASKS IT — sites 3
     and 4 of CASE-6's nine, `publishedCase()`'s resolution of a FINDING id. This
     is the one place a stranger's read can no longer be answered with one case,
     and it is the site that would have become a silent `LIMIT 1` guess had the
     fence been lifted alone. A store-level test would not have reached it. */
  const strangerAmbig = rP(await (await anonRaw(`op=publishedcase&id=${ALPHA}`)).json());
  t("and a STRANGER holding only that finding's id is told it serves TWO cases and asked which they "
    + "mean, rather than being handed one of them — the surface resolves without deciding on the "
    + "reader's behalf what they meant, which is this method's own stated doctrine",
    [strangerAmbig.ok, strangerAmbig.reason, (strangerAmbig.cases || []).slice().sort()],
    [false, "FINDING_IN_SEVERAL_CASES", [CASE, other.caseId].sort()]);
  /* THE OVER-STRICTNESS COMPLEMENT, IN THE SUITE RATHER THAN ONLY IN THE CONTROL:
     a reader who DID say which case is served, not refused. A fence tighter than
     its rule is an undeclared interface change wearing the costume of caution. */
  const strangerNamed = rP(await (await anonRaw(
    `op=publishedcase&id=${ALPHA}&caseId=${encodeURIComponent(other.caseId)}`)).json());
  t("and a reader who NAMES the case is served it — the refusal above is a resolution aid and not a "
    + "wall, and the stranger-verification path stays green for a two-case member",
    [strangerNamed.ok, strangerNamed.caseId], [true, other.caseId]);

  /* ==== AND THE SAME FENCE DRIVEN ON ITS OWN, ADDED BY CASE-6 BECAUSE A
     NEGATIVE CONTROL PROVED THE ARM ABOVE CANNOT SEE IT ====================

     THE FINDING, recorded rather than smoothed. `case6.control.mjs` arm (d)
     neuters FINDING-IN-ANOTHER-CASE (hyphens deliberate: a backticked
     SCREAMING_SNAKE token here is harvested as a code in reach) and declared the
     pin above MUST go red. **It came back GREEN, 52 pass 0 fail.** The reason is
     the assertion's own OR: the two-target fixture puts LOOSE and ALPHA in
     DIFFERENT cases, so `distinct.length > 1` and FINDINGS-IN-DIFFERENT-CASES —
     a different refusal, on a different line, guarding a different rule — fires
     first and satisfies the OR. The pin was pinning "some case fence refused
     this", which was all CASE-5b needed from it.

     THAT IS NO LONGER ENOUGH, because CASE-6 did not defer this question, it
     DECIDED it: the KEEP rests on a specific refusal and a count of the specific
     readers that refusal protects. A decision anchored to an assertion that
     cannot tell which mechanism held is a decision anchored to nothing, and the
     OR above would go on passing if the fence this item reasoned about were
     deleted tomorrow.

     SO THIS ARM MADE `distinct.length` EQUAL ONE. A single target, already a
     member of its own case, published into an EXPLICITLY NAMED existing case:
     nothing was in two cases, so the different-cases refusal had nothing to
     notice, and the only thing between the act and the roster was the
     `had !== theCase` loop. It was pinned by EXACT EQUALITY on the reason.

     ===== CORRECTED BY D-309, AND THE LESSON IS CARRIED FORWARD RATHER THAN THE
     ASSERTION. CASE-6's finding above — *a decision anchored to an assertion that
     cannot tell which mechanism held is a decision anchored to nothing* — is
     exactly as true of THIS item's refusal as it was of the fence, and it is why
     this arm survives its own subject being deleted. `FINDING_IN_ANOTHER_CASE` is
     gone, so the arm now drives the refusal that REPLACED the part of its job
     that was still real: `CASE_IDENTITY_AMBIGUOUS`.

     IT IS DRIVEN ALONE AND NAMED EXACTLY, for CASE-6's reason. ALPHA now serves
     TWO cases (proved by the read-back above, not assumed), and it is published
     again with NO `caseId` and no `newCase` — so the derivation faces two
     candidates and no instruction. Nothing else in the act can answer: every
     other refusal in `publishCase()` is about the payload, and the payload is
     complete. Pinned by EXACT EQUALITY on the reason, never by membership of a
     set, because an OR cannot tell you which mechanism held. */
  for (const rr2 of [await reopen(ALPHA, "Published again with no case named, to drive the "
                                       + "ambiguous derivation on its own.")])
    if (!rr2.ok) throw new Error(`reopen ALPHA for the ambiguity arm: ${JSON.stringify(rr2)}`);
  await mustConclude(ALPHA);
  const ambiguous = await publishCase({ targets: ALPHA,
    roles: { [ALPHA]: "load_bearing" },
    statement: "One finding that serves two cases, published again without saying which case this is.",
    scope: "Whether one finding may serve two cases.",
    excluded: [],
    subjectPosition: "not_sought",
    subjectJustification: "Not approached: the derivation should refuse before any of this is reached.",
    biasAcknowledgement: "Unchanged declared position on public adoption." });
  t("and the AMBIGUOUS DERIVATION is driven ALONE and named EXACTLY (D-309, C-44.1): a finding that "
    + "serves two cases, published with no case named and no new one asked for, is refused — because "
    + "membership no longer says which case this is, and the record will not choose",
    [ambiguous.ok, ambiguous.reason], [false, "CASE_IDENTITY_AMBIGUOUS"]);
  t("and it names EVERY candidate and carries its DEC-49 translation, so a publisher is told what to "
    + "decide rather than only that they may not proceed — a refusal a member cannot act on is the "
    + "state DEC-49 ended",
    [(ambiguous.cases || []).slice().sort(), ambiguous.check,
     typeof ambiguous.translation === "string" && ambiguous.translation.length > 0,
     String(ambiguous.detail).includes("name the case")],
    [[CASE, other.caseId].sort(), "C-44.1", true, true]);
}

/* ------------------------------------------------------------------------------
   NEGATIVE CONTROL — SIX ARMS PLUS A BASELINE, RUN 2026-09-10, EACH ARMED ALONE
   with every other defence held open, over a per-arm uniquely-named pristine copy
   taken inside this worktree, each restore verified by CONTENT and by sha256
   (store.mjs 1,722,468 bytes MATCH / IDENTICAL on every arm; index.mjs 465,344
   likewise). The driver is `test/caseflip.control.mjs`, COMMITTED:
   `node test/caseflip.control.mjs` runs them all, `… control.mjs a` runs one.
       baseline   51 passed,  0 failed
       (a)        29 passed, 22 failed  — the arm this item exists for
       (b)        46 passed,  5 failed
       (c)        29 passed, 22 failed
       (d)        44 passed,  7 failed
       (e)        51 passed,  0 failed  — instrument limit, stated in the arm
       (f)        51 passed,  0 failed  — instrument limit, stated in the arm

   (a) RESOLVE A MEMBER BY THE CASE'S EDITION INSTEAD OF BY ITS PIN — the arm this
       item exists for. `#caseEditionState`'s member lookup goes back to
       `WHERE bundle_id=? AND edition=?` at the case's number, which is the state
       the tree was in before this item and the predicate CASE-3 handed on by name.
       MEASURED 29/22 and it falls exactly where it was declared to: BETA is not
       found, lands in `awaiting`, the diverged edition reads INCOMPLETE, and no
       container is ever assembled — so blocks 3, 4 and 5 fall with block 1 and
       `op=verify` answers for a container that does not exist. A FULLY RATIFIED
       CASE THAT SILENTLY REPORTS ITSELF UNFINISHED is the defect in one sentence,
       and it is the sentence the suite prints. -> 22 named failures.

   (b) STRIP THE CASE-SIDE STRANGER-VERIFICATION DATA — the container manifest
       stops carrying `version_sha`, `role`, `project` and `bar`. MEASURED 46/5:
       the drive FAILS rather than reporting less, which is the question this arm
       was written to answer. The freeze assertion compares `version_sha` to
       `bundle_sha` and `undefined` is not a hash; the bar and role assertions are
       equalities against the two-term vocabulary. BLOCK 1 STAYS GREEN, and that is
       the point of arming it alone — the READ PATH and the ARTIFACT are two
       separate answers to REC-44's property and only the artifact travels, so an
       item that served the pin on the read and forgot the container would have
       looked complete from inside this plane. -> the end-to-end drive fails.

   (c) OVER-STRICTNESS: insist a member's own edition MATCH its case's before the
       member is served. This is precisely the tightening this item's own change
       makes tempting once the pin is load-bearing — they ought to agree, so check.
       MEASURED 29/22, RED as declared. BETA is LEGITIMATELY at its own edition 1
       inside case edition 2, and a case that verifies must keep verifying. A fence
       wider than the ruling it enforces is an undeclared contract change wearing
       the costume of caution. -> a legitimate case stops verifying.
       AND ITS 22 FAILURES ARE THE SAME 22 AS (a)'s, VERIFIED BY DIFFING THE TWO
       ARMS' FAILURE SETS RATHER THAN ASSUMED FROM THE TALLY. That is expected
       and is worth stating: the two arms are DIFFERENT CAUSES with ONE EFFECT —
       (a) removes the pin's answer, (c) refuses to accept it — and both put BETA
       into `awaiting`. Equal tallies from unequal causes is exactly the shape a
       control can report as a coincidence if nobody looks, so it was looked at.

   (d) RE-SLAVE THE EDITION — `publishCase` stamps the CASE's edition as the
       member's `edition:` again. MEASURED 44/7. This is the arm that proves THE
       DIVERGENCE IS REAL rather than an artifact of how this suite reads: with the
       two numbers forced equal the fixture cannot diverge at all, and the
       divergence assertion falls naming [2,2,2] where it wants [2,2,1]. Every
       altitude assertion in blocks 3, 4, 5 and 6 falls with it, in the artifact
       and in the bytes alike. -> the fixture stops diverging.

   (e) DROP THE LEGACY FALLBACK in `#caseOfSha`, so a pre-CASE-3 roster row whose
       pin is honestly NULL stops resolving to its case. MEASURED 51/0, GREEN AS
       DECLARED BEFORE THE RUN, and the declaration is the arm's value: every
       roster row this fixture writes is pinned, so this suite holds no unpinned
       row for the arm to catch. An arm whose subject the fixture cannot produce is
       an INSTRUMENT LIMIT and not a defence that held, and the difference is
       exactly what a control exists to make legible. `publishedcase.test.mjs` and
       `caseobject.test.mjs` are the suites whose fixtures reach it. -> nothing
       here, and that is the measurement.

   (f) REQUIRE A PIN ON EVERY ROSTER ROW before an edition may be complete.
       MEASURED 51/0. THIS ARM WAS WRITTEN AS (c) AND CAME BACK NOT AS DECLARED —
       predicted RED, ran GREEN, for (e)'s reason. It is a real over-strictness
       question, since that tightening would withdraw published editions the record
       still holds, and this suite is the wrong instrument for it. Kept and
       renumbered rather than deleted, with (c) rewritten as the over-strictness
       question this fixture CAN answer; recorded rather than smoothed, because the
       correction is worth more than the arm. -> nothing here, and that is the
       measurement.
   ---------------------------------------------------------------------------
   AND NOTHING HERE ARMS "finding bytes stop naming a case", because they still
   do — the same sentence as this file's header, and the reason is in IC-66. */

/* `mf.dispose()` BEFORE THE TALLY, AND THE TALLY AND THE EXIT GO LAST — AFTER
   THE NEGATIVE-CONTROL BLOCK. Both halves are load-bearing rather than tidy, and
   this suite paid for the first of them on its own first full battery run:
   `hygiene.test.mjs` counts `.dispose()` against `new Miniflare(` and went red
   (643 pass, 1 FAIL, naming this file) because every workerd instance a suite
   starts must be shut down. It also reads the LAST 400 BYTES of every suite to
   check the file ends on its own result, so a NEGATIVE CONTROL block placed after
   the exit call would push the exit out of that window and redden a suite that is
   entirely correct — which CASE-1 and CASE-3 each paid for in turn. Two existing
   ratchets, both catching this worker rather than the plane, which is them
   working. */
await mf.dispose();
console.log(`\ncaseflip: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

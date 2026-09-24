/* D-448 — THE REVIEW COPY'S ELEVEN REFUSALS ARRIVE AT A MEMBER WITH THEIR CANNED TRANSLATION.
 *
 * THE DEFECT. UI-68 built §6A's surface on 2026-09-23 — an editor drafts a case, an owner grants and
 * withdraws a review copy, a recipient holding no credential reads it and comments. The plane refuses
 * those acts on ELEVEN conditions, and NOT ONE of them held a row in any `*_CHECKS` family, so every
 * one reached a member as the plane's own authored `detail` with no translation at all. DEC-49 (Bob,
 * 2026-08-06), as `BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, is that every condition a
 * member can meet carries a code with a CANNED TRANSLATION, and that an untranslated code fails the
 * harness rather than reaching a person. This is D-507's finding one op over and on the same day.
 *
 * WHY THE DEC-49 GUARD DID NOT CATCH IT, which is the part worth keeping. `check-refusal-codes.mjs`
 * puts a code IN REACH by three rules: R1 a catalogue row, R2 a code LITERAL in `civicos-ui/app.html`,
 * R3 a literal in a harness mock. UI-68's surface renders the plane's `detail` and keys on NO code
 * literal, so R2 is blind to it — MEASURED on origin/main 9f8b69e6 before this landing, arm F sorted
 * TEN of the eleven into F6, *out of reach, one site — needs a sentence WHEN its surface exists*, and
 * that surface had existed for a day. "Out of reach" is a statement about the WALK, never about the
 * member. D-542 carries the separate fix (teaching the walk reach-by-op); this row closes the eleven
 * by R1, the rule that does not depend on how a surface spells things.
 *
 * HOW A LIAR PASSES, and this suite is shaped around it: add eleven rows nobody ever mints. Arm A of
 * the DEC-49 guard is satisfied by the ROWS alone and arm C by the HELPER alone. So this suite does
 * two things neither the catalogue nor the guard does:
 *
 *   1. IT DRIVES THE OP. Every wire assertion reads a refusal off the CONTROL PLANE's answer — a real
 *      caller's only route — and asserts `translation` is the catalogue's own sentence, arriving at
 *      the member. A store-level test is not evidence a caller can reach the feature (`op=invitelook`
 *      shipped with a ReferenceError while 1,276 assertions passed).
 *   2. IT PINS THE ROUTING STRUCTURALLY. It reads `src/store.mjs` and asserts each code is minted
 *      EXACTLY ONCE, through the `refusal` helper, INSIDE the DEC-49 region its row's `where` names.
 *      That is the one thing a wire assertion cannot see, and the reason is worth stating rather than
 *      rediscovering: `index.mjs`'s `dec49Decorate` attaches `code`, `check` and `translation` to ANY
 *      `ok:false` answer whose `reason` matches a catalogue row, so THE WIRE ARMS BELOW WOULD PASS
 *      OVER THE ELEVEN ROWS ALONE, with the plane still returning the old bare object literals.
 *      D-484 measured that and recorded it as a surprising green; D-507 restated it. Only the
 *      structural pin distinguishes a governed refusal from a decorated one.
 *
 * ADDITIVE ON THE WIRE. The old answer must still be there: `reason`, each site's own `detail` and its
 * per-site keys (`act`, `caseId`) are asserted UNCHANGED beside the three that JOIN them. That matters
 * here beyond politeness — `index.mjs` branches on `reason === "NO_REVIEW_COPY"` to answer 404 rather
 * than 400, so a rename would have moved a status code a caller already reads, and the status is
 * asserted below for exactly that reason.
 *
 * WHAT THIS SUITE CANNOT SEE, stated plainly rather than left for the next reader to find:
 *   - TWO OF THE ELEVEN ARE NOT DRIVEN THROUGH THE OP, and neither is an omission this suite could
 *     close. Both are facts about the PLANE, established at the code rather than assumed from a
 *     failure to reach them. (i) `REVIEW_UNKNOWN_ACT`: the control plane binds `act` as a LITERAL per
 *     op — `casedraft` sends "draft", `reviewgrant` "grant", `reviewrevoke` "revoke" — so no caller
 *     can present a fourth. It guards `reviewAct` against a store-level caller. (ii) `REVIEW_NO_SECRET`:
 *     `op=reviewgrant` MINTS the secret in the control plane and sets `secretSha` to its 64-hex digest
 *     on every call, so the absent-fingerprint branch is unreachable from the wire. Both are pinned
 *     STRUCTURALLY below, exactly like the nine, and their rows are asserted like the others.
 *   - The structural pin sees a site that stops calling the helper, or a code minted twice. It does
 *     NOT see a site whose `detail` was changed, and it is evidence about NO refusal outside this op.
 *   - It says nothing about a LIVE plane. A green harness is not a serving build (D-108).
 *
 * NEGATIVE CONTROL: SIX ARMS, run by `test/d448-review-copy-translation.control.mjs` — `node
 * test/d448-review-copy-translation.control.mjs [arm]` from `bio-plane/`. Each is armed ALONE with every
 * other defence held open, against a REAL source, restored from a uniquely-named per-arm pristine copy
 * verified by sha256, by content AND by `cmp` with the byte count printed and floored; the pen lives
 * OUTSIDE the worktree (BOB #32, 2026-09-24). Declared before the first run:
 *   (0) BASELINE — nothing armed: this suite GREEN and the DEC-49 guard exit 0. The row that tells
 *       five-arms-working from five-arms-broken, and the one nobody runs.
 *   (a) THE ROW'S OWN NAMED CONTROL, the one D-448's `accepts-when` declares — DROP ONE CODE'S REGION
 *       (`is-review-recipient`) and the census arm names it. MUST FAIL: the guard, naming that region,
 *       and this suite's region-exists arm. MUST NOT FAIL: that code's WIRE arm, because `dec49Decorate`
 *       puts the sentence on the wire from the row alone.
 *   (b) A TRANSLATION BLANKED — C-87.10's sentence emptied: the guard MUST name the row, and this
 *       suite's catalogue and wire arms for that code MUST fail.
 *   (c) A CODE RETURNED OUTSIDE THE HELPER — `REVIEW_NO_COMMENT_TEXT` back to its pre-D-448 bare object
 *       literal, above its region: the guard MUST name `is-review-comment-text` and the three structural
 *       arms MUST fail, while that code's wire arm stays green.
 *   (d) OVER-STRICTNESS — `is-review-secret`'s markers re-spelled in a way the guard accepts: EVERY arm
 *       MUST STAY GREEN.
 *   (e) THE RESOLVER WIDENING REVERTED in `check-refusal-codes.mjs`: the guard MUST fail naming
 *       `#noReviewCopy`, and this suite MUST stay green.
 * ALL SIX ARMS RUN 2026-09-24 by the D-448 worker, driver exit 0, every one AS DECLARED: baseline 129/0
 * guard 0 · (a) 125/1 guard 1 · (b) 127/2 guard 1 · (c) 126/3 guard 1 · (d) 129/0 guard 0 · (e) 129/0
 * guard 1. Every restore verified sha256 MATCH, content IDENTICAL, cmp SAME. TWO ARMS CAME BACK WRONG ON
 * THE FIRST RUN and both were findings recorded at that file's `NEGATIVE CONTROL:` line rather than
 * smoothed — (b) proved this suite's wire assertion compared "" with "" and agreed for free, and (d),
 * the over-strictness arm, proved this suite STRICTER THAN ITS RULE on how a region marker is spelled.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { REVIEW_COPY_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d448", MEMBER_TOKEN: "mem-d448", PROBE_TOKEN: "prb-d448", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const bail = (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`);
  fail++;
  console.log(`\nd448-review-copy-translation: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
  mf.dispose().then(() => process.exit(1));
  throw new Error("fixture");
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const rawOf = async (q, init) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`, init);
  let parsed = null; const body = await r.text();
  try { parsed = rP(JSON.parse(body)); } catch { /* left null; the arm asserts on it */ }
  return { status: r.status, parsed };
};

console.log("\n--- d448: the review copy's eleven refusals, translated ---");

/* ========================================================================= 0
 * THE CORPUS IS NON-EMPTY AND IS PRINTED. A headline assertion over an empty
 * corpus has passed in this repository three times; the floor is stated here.
 * ======================================================================== */
const CODES = Object.keys(REVIEW_COPY_CHECKS);
console.log(`  corpus: ${CODES.length} codes in REVIEW_COPY_CHECKS — ${CODES.join(", ")}`);
t("the family is the ELEVEN codes UI-68's surface can show, and no fewer", CODES.length, 11);

/* ========================================================================= 1
 * THE CATALOGUE ROWS. A row per code, each carrying a C-number, a `where`
 * naming a REGION (never a whole function) and a canned sentence that is not
 * a restatement of the machine code.
 * ======================================================================== */
console.log("\n--- 1. the catalogue rows ---");
/* EACH C-NUMBER AS A LITERAL, and that is a requirement rather than a style. `scripts/coverage.mjs`
   derives the catalogue by reading C-numbers out of bio-checks.mjs and then demands that an ASSERTION
   NAME each one — "never NAMED means no assertion proves the check FIRES on a violation, so it is
   exercised only in the direction that passes", the C-20.1 defect class. A regex (`/^C-87\.\d+$/`) is
   what this suite asserted first and it satisfied NOTHING: it names no id, so all eleven read as never
   named and `--strict` exited 1 on a complete family. FOUND BY THE GATE, not by reading. The literal
   table is also the stronger assertion — it pins WHICH number each code holds, so a renumbering at
   integration (C-82 -> C-83 has happened) is visible here rather than silently absorbed. */
const NUMBERED = {
  NO_REVIEW_COPY: "C-87.1", REVIEW_UNKNOWN_ACT: "C-87.2", REVIEW_NOT_PROJECT_OWNER: "C-87.3",
  REVIEW_NO_PROJECT: "C-87.4", REVIEW_DRAFT_CHANGES_PROJECT: "C-87.5", REVIEW_NO_SUCH_CASE: "C-87.6",
  REVIEW_DRAFT_TOO_LARGE: "C-87.7", REVIEW_NO_RECIPIENT: "C-87.8", REVIEW_NO_SECRET: "C-87.9",
  REVIEW_NO_GRANT: "C-87.10", REVIEW_NO_COMMENT_TEXT: "C-87.11",
};
t("the pinned numbering covers every code in the family, and no more",
  Object.keys(NUMBERED).sort().join(","), CODES.slice().sort().join(","));
for (const [code, row] of Object.entries(REVIEW_COPY_CHECKS)) {
  t(`${code} holds its own catalogue row, ${NUMBERED[code]}`, row.check, NUMBERED[code]);
  t(`${code}'s \`where\` names a REGION, not a whole function`,
    /^src\/store\.mjs \S+ > is-[a-z0-9-]+$/.test(row.where || ""), true);
  /* A translation that merely re-spells the code is the non-translation DEC-49 ended. */
  const words = String(row.translation || "").trim();
  t(`${code} carries a canned sentence that is prose, not the code re-spelled`,
    words.length > 60 && !words.includes(code) && !/^[A-Z_ ]+$/.test(words), true);
}
/* No two codes may share a sentence: a copied translation is one code's words on another's condition. */
const sentences = Object.values(REVIEW_COPY_CHECKS).map(r => r.translation);
t("no two of the eleven share a translation", new Set(sentences).size, 11);
/* Every region name is distinct, or two rows would claim one span. */
t("no two of the eleven share a `where`",
  new Set(Object.values(REVIEW_COPY_CHECKS).map(r => r.where)).size, 11);

/* ========================================================================= 2
 * THE ROUTING, PINNED STRUCTURALLY. Each code is minted EXACTLY ONCE, through
 * the `refusal` helper, INSIDE the region its own row names. This is the arm
 * `dec49Decorate` cannot satisfy — see the header.
 * ======================================================================== */
console.log("\n--- 2. every code is minted once, through the helper, inside its own region ---");
/* THE MARKERS ARE MATCHED THE WAY THE GUARD MATCHES THEM, and this is a CORRECTION made by this
   suite's own over-strictness arm (control arm (d), first run 2026-09-24). The first draft looked for
   the literal string `/* DEC-49 REGION <name> *\/`, so a marker re-spelled as `/**  DEC-49 REGION
   <name>  **\/` — which `check-refusal-codes.mjs` accepts, its pattern being `/\*[\s*]*DEC-49
   REGION\s+<name>\b` — was invisible here while the guard stayed green. That is a suite STRICTER THAN
   ITS RULE, which is an undeclared interface change wearing the costume of caution: it would have
   failed correct work in a spelling nobody anticipated. The over-strictness arm is the only thing that
   catches that, and it earned its place on the first run. The span begins where the opening marker's
   comment CLOSES, exactly as the guard's does, so the marker's own prose is never read as code. */
const REGION_OPEN = (n) => new RegExp(`/\\*[\\s*]*DEC-49 REGION\\s+(${n})\\b`);
const REGION_CLOSE = (n) => new RegExp(`/\\*[\\s*]*END DEC-49 REGION\\s+(${n})\\b`);
const regionText = (name) => {
  const o = REGION_OPEN(name).exec(STORE_SRC), c = REGION_CLOSE(name).exec(STORE_SRC);
  if (!o || !c || c.index <= o.index) return null;
  const afterOpen = STORE_SRC.indexOf("*" + "/", o.index);
  const start = afterOpen < 0 || afterOpen > c.index ? o.index : afterOpen + 2;
  return STORE_SRC.slice(start, c.index);
};
for (const [code, row] of Object.entries(REVIEW_COPY_CHECKS)) {
  const region = row.where.split(" > ")[1];
  const span = regionText(region);
  t(`${code}'s region \`${region}\` exists in store.mjs, opened and closed`, span !== null, true);
  if (span === null) continue;
  /* The helper call, by the identifier arm C reads (`\brefusal\s*\(\s*"CODE"`). */
  const calls = [...STORE_SRC.matchAll(new RegExp(`\\brefusal\\s*\\(\\s*"${code}"`, "g"))].length;
  t(`${code} is minted through the \`refusal\` helper EXACTLY ONCE in store.mjs`, calls, 1);
  t(`${code}'s one mint is INSIDE its own region \`${region}\``,
    (span.match(new RegExp(`\\brefusal\\s*\\(\\s*"${code}"`)) || []).length, 1);
  /* The pre-D-448 shape is gone: a bare object literal naming the code would carry no translation
     of its own and would leave arm C judging a codeless refusal at a governed site. */
  t(`${code} is no longer returned as a bare \`reason:\` object literal`,
    new RegExp(`reason:\\s*"${code}"`).test(STORE_SRC), false);
}

/* ========================================================================= 3
 * THE WIRE. Nine of the eleven driven through the CONTROL PLANE — a real
 * caller's only route — each asserted ADDITIVE: the old `reason` and `detail`
 * still there, with `code`, `check` and `translation` joining them.
 * ======================================================================== */
console.log("\n--- 3. nine of the eleven, driven through the op ---");
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-d448",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
/* TWO ADMINISTRATORS FIRST: the plane refuses an ordinary member until a group has two
   (`ADMINS_FIRST` — administrative access is shared so losing one person does not lose the group),
   which the fixture obeys rather than works around. */
await enrol("nadia", "nadia-passphrase-448", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-448", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "iris-passphrase-448", "member", ["contribute", "publish"]);

const { makePublishingProject } = await import("./publishingproject.mjs");
const { createHash } = await import("node:crypto");
const sha = (v) => createHash("sha256").update(v).digest("hex");
const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-d448", owner: "iris",
  name: "PROJ-2026-1448-review", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
const OTHER = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-d448", owner: "iris",
  name: "PROJ-2026-1449-elsewhere", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

const D1r = await POST(`op=casedraft&token=${IRIS}`,
  { project: PROJ, scope: "Whether the transfer was authorised.", statement: "This case covers FY2024 only." });
const D1 = rP(D1r)?.draftId;
if (!D1) bail("casedraft fixture", rP(D1r));

/* ONE ASSERTION SHAPE for all nine, so an arm cannot be green for a different reason than its
   neighbour: the code, the catalogue's own sentence read off the row (never re-typed here), the
   C-number, and the site's own `detail` still present and non-empty. */
const wire = async (label, code, got, extraKey) => {
  const row = REVIEW_COPY_CHECKS[code];
  const r = got.parsed || {};
  t(`${label} — reason is UNCHANGED (${code})`, r.reason, code);
  t(`${label} — \`code\` joins it`, r.code, code);
  t(`${label} — \`check\` is the catalogue's C-number`, r.check, row.check);
  /* FLOORED AS WELL AS COMPARED, and the floor is the load-bearing half. A comparison ALONE passes
     over TWO EMPTY STRINGS — so a catalogue row whose sentence had been blanked would satisfy this
     assertion for free, because `dec49Decorate` copies whatever the row holds onto the wire. That is
     the costs-nothing equality this project has measured passing three times, and it is not
     hypothetical here: control arm (b) blanked C-87.10's sentence and THIS ASSERTION STAYED GREEN on
     the driver's first run, against its own declaration. The floor is that arm's correction. */
  t(`${label} — \`translation\` is the catalogue's own sentence, arriving at the member`,
    [r.translation, (r.translation || "").length > 60], [row.translation, true]);
  t(`${label} — the site's own authored \`detail\` is still there`,
    typeof r.detail === "string" && r.detail.length > 20, true);
  if (extraKey) t(`${label} — its per-site key \`${extraKey}\` survives`, extraKey in r, true);
};

await wire("a secret that answers to no grant", "NO_REVIEW_COPY",
  await rawOf(`op=reviewcopy&secret=${encodeURIComponent("rv1_" + "A".repeat(43))}`));
/* THE STATUS IS PART OF THE ANSWER, and `index.mjs` picks it by branching on this very `reason`. */
t("the dead answer is still a 404, chosen by branching on `reason`",
  (await rawOf(`op=reviewcopy&secret=${encodeURIComponent("rv1_" + "A".repeat(43))}`)).status, 404);

await wire("withdrawing a grant nobody owns", "REVIEW_NOT_PROJECT_OWNER",
  await rawOf(`op=reviewrevoke&token=${encodeURIComponent(IRIS)}&grant=RVG-2026-NOPE`, { method: "POST", body: "{}" }));

await wire("a draft naming no project", "REVIEW_NO_PROJECT",
  await rawOf(`op=casedraft&token=${encodeURIComponent(IRIS)}`,
    { method: "POST", body: JSON.stringify({ scope: "no project named" }) }));

await wire("a draft moved to another project", "REVIEW_DRAFT_CHANGES_PROJECT",
  await rawOf(`op=casedraft&token=${encodeURIComponent(IRIS)}`,
    { method: "POST", body: JSON.stringify({ draft: D1, project: OTHER }) }));

await wire("a draft naming a case this project never published", "REVIEW_NO_SUCH_CASE",
  await rawOf(`op=casedraft&token=${encodeURIComponent(IRIS)}`,
    { method: "POST", body: JSON.stringify({ project: PROJ, caseId: "BIO-2026-NOSUCH" }) }), "caseId");

await wire("a draft larger than op=publish would accept", "REVIEW_DRAFT_TOO_LARGE",
  await rawOf(`op=casedraft&token=${encodeURIComponent(IRIS)}`,
    { method: "POST", body: JSON.stringify({ project: PROJ, scope: "x".repeat(70 * 1024) }) }));

await wire("a grant addressed to nobody", "REVIEW_NO_RECIPIENT",
  await rawOf(`op=reviewgrant&token=${encodeURIComponent(IRIS)}&draft=${D1}`, { method: "POST", body: "{}" }));

await wire("a withdrawal naming no grant", "REVIEW_NO_GRANT",
  await rawOf(`op=reviewrevoke&token=${encodeURIComponent(IRIS)}`, { method: "POST", body: "{}" }));

await wire("a comment that says nothing", "REVIEW_NO_COMMENT_TEXT",
  await rawOf(`op=reviewcomment&draft=${D1}&token=${encodeURIComponent(IRIS)}`,
    { method: "POST", body: JSON.stringify({ text: "   " }) }));

/* ========================================================================= 4
 * THE TWO THIS SUITE DOES NOT DRIVE, established AT THE CODE rather than
 * inferred from a failure to reach them — an unreachable condition asserted as
 * unreachable, never quietly dropped from the corpus (undetermined is
 * first-class and must be STATED).
 * ======================================================================== */
console.log("\n--- 4. the two the wire cannot reach, and why (at the code, not by assumption) ---");
const IDX_SRC = readFileSync(IDX, "utf8");
t("REVIEW_UNKNOWN_ACT: the store binds `act` as a literal per op, so no caller presents a fourth",
  ["draft", "grant", "revoke"].every(a => STORE_SRC.includes(`act: "${a}"`)), true);
t("REVIEW_NO_SECRET: op=reviewgrant MINTS the secret in the control plane and always sets secretSha",
  /inner\.searchParams\.set\("secretSha", await sha256Hex\(secret\)\)/.test(IDX_SRC), true);

console.log(`\nd448-review-copy-translation: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);

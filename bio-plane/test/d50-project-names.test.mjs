/* NEGATIVE CONTROL: RUN 2026-09-23 (D-50 worker, cloud session WORKER D-50 (CONDUCT #18)), each arm ALONE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp (checks/bio-checks.mjs 851,090 B sha256 01dae8f75584…, src/store.mjs 2,903,335 B sha256 a401012e2b8e…). BASELINE 13/0.
   (A) THE ROW'S ARM — compare RAW titles instead of the key: in checkProjectNameUniqueness `const key = projectNameKey(fm.title);` -> `const key = String(fm.title ?? '');`. DECLARED: the case-and-spacing arm fails BY NAME, with the deactivated, whole-corpus and three-pair arms (all differ in case) and §2's body pin; distinct, over-strictness, non-project, C-77.2, identity and §3 hold. RESULT 8/5, AS DECLARED: "§1 case-and-spacing: two projects differing only in case and whitespace are ONE C-77.1 error naming BOTH by id" FAILED.
   (B) THE LIAR — a second normaliser in the store that agrees on every fixture: `static projectNameKey = projectNameKey;` -> `static projectNameKey = (t) => String(t ?? "").trim().toLowerCase().replace(/\s+/g, " ");`. DECLARED: only §2's identity arm and §2's store pin fail; every §1 arm and §3 hold (equal output). RESULT 11/2, AS DECLARED — no behavioural arm can see this liar, which is why §2 exists.
   (C) A STATE FILTER — `if (fm.current_state === 'closed') continue;` before the key. DECLARED: the deactivated arm, the whole-corpus arm and the totality count fail; case-and-spacing, distinct and three-pair hold. RESULT 10/3, AS DECLARED.
   (D) OVER-LOOSE KEY in the catalog export, first attempt: append `.replace(/[^a-z0-9 ]/g, '')`. DECLARED: over-strictness and §3 fail. RESULT 13/0, NOT AS DECLARED — a finding about the ARM, not the subject: deleting the dash makes 'fundtransfers', still a different key from 'fund transfers', so the arm never loosened the rule on this fixture.
   (D2) OVER-LOOSE KEY, corrected: `.trim().toLowerCase().replace(/\s+/g, ' ')` -> `.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()`. DECLARED: over-strictness and §3 fail. RESULT 10/3: both fail, as declared, AND the whole-corpus arm, NOT PREDICTED (the dashed project then collides too, so the corpus has three pairs). §3 failing beside §1 is the one function driven from both halves: loosening the catalog export loosens the write path's NAME_TAKEN. */
/* =========================================================================
 * D-50 — PROJECT NAME UNIQUENESS IN THE CHECK CATALOG (C-77).
 * BIO_Membership_Architecture_v2.md §11 item 8, *"Project name uniqueness
 * enforced in the check catalog and at the write path"*, with §7.1's rule:
 * case-insensitive, whitespace-collapsed, across deactivated projects.
 *
 * THE GAP: the write path refused a colliding project (`promote` and the fork,
 * NAME_TAKEN, by `Store.projectNameKey`), but the catalog held no such check,
 * so a corpus handed in from elsewhere could not be judged for it.
 *
 * WHAT THIS SUITE HOLDS, in four sections:
 *   §1 the catalog check over a handed fixture corpus: two projects differing
 *      only in case and spacing are reported BY NAME (C-77.1); distinct names
 *      pass; a DEACTIVATED collider is still reported; every pair is named;
 *      a non-project sharing a title is not a collision; C-77.2 states what
 *      could not be judged.
 *   §2 IDENTITY, NOT EQUAL OUTPUT. The way a liar passes §1 is a second
 *      normaliser that agrees on the fixture. So: inside workerd, the store's
 *      `Store.projectNameKey` is the SAME FUNCTION OBJECT as the catalog's
 *      exported `projectNameKey` (`===`), and the catalog check's own body
 *      calls that export and carries no normalising code of its own.
 *   §3 THROUGH THE OP: the write path, driven by `op=promote` over miniflare,
 *      refuses NAME_TAKEN on exactly the pair §1 reports, and admits the pair
 *      §1 passes — the two halves of §11 item 8 agree on real input.
 *
 * WHAT THIS CANNOT SEE: whether a real instance's record already holds a
 * collision (§11 item 9 — a live fact, and this suite reads no instance); a
 * collision under Unicode normalisation (NFC vs NFD of one title), which the
 * ONE key does not fold and so neither half folds — a property of the rule as
 * written, stated rather than tested as a defect.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkProjectNameUniqueness, projectNameKey } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");
let pass = 0, fail = 0;
const t = (l, g, w) => {
  const ok = JSON.stringify(g) === JSON.stringify(w);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${ok ? "" : `\n         want ${JSON.stringify(w)}\n         got  ${JSON.stringify(g)}`}`);
  ok ? pass++ : fail++;
};

/* ------------------------------------------------------------ the fixture
   The title is written between quotes RAW, never through JSON.stringify: the restricted grammar does not unescape
   `\t`, so a JSON-escaped tab arrives as a backslash and a `t` and the case-and-spacing arm tests nothing. */
const doc = (id, type, title, state, extra = "") =>
  `---\nid: ${id}\nobject_type: ${type}\n${title === null ? "" : `title: "${title}"\n`}`
  + `current_state: ${state}\n${extra}created: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n---\n\n## Summary\n\nx\n`;
const bundle = (id, type, title, state, extra) => ({ folderName: id, files: new Map([["bundle.md", doc(id, type, title, state, extra)]]) });

const SEWER_A = bundle("PROJ-2026-0001-sewer-a", "project", "Sewer Fund Transfers", "forming");
const SEWER_B = bundle("PROJ-2026-0002-sewer-b", "project", "  sewer   FUND\ttransfers ", "active");
const AUDIT   = bundle("PROJ-2026-0003-audit", "project", "Sewer Fund Audit", "forming");
const DASHED  = bundle("PROJ-2026-0004-dashed", "project", "Sewer Fund-Transfers", "forming");
const HOUSING_CLOSED = bundle("PROJ-2026-0005-housing-old", "project", "Housing Authority", "closed", "closed_reason: abandoned\n");
const HOUSING_LIVE   = bundle("PROJ-2026-0006-housing-new", "project", "housing  authority", "forming");
const INFO_SAME = bundle("INFO-2026-0007-sewer-memo", "information", "Sewer Fund Transfers", "collected");

const c77 = (r, id) => r.findings.filter((x) => x.check === id);
const names = (x, ...ids) => ids.every((i) => x.message.includes(i));

try {
/* ======================================================== §1 THE CATALOG CHECK */
const corpus = [SEWER_A, SEWER_B, AUDIT, DASHED, HOUSING_CLOSED, HOUSING_LIVE, INFO_SAME];
const all = checkProjectNameUniqueness(corpus);
/* the totality guard: a check over an EMPTY corpus passes for free */
t("§1 the fixture corpus is non-empty and its six projects were all JUDGED (the info bundle is not a project)",
  [corpus.length, all.projects, all.judged], [7, 6, 6]);

const caseSpace = checkProjectNameUniqueness([SEWER_A, SEWER_B]);
t("§1 case-and-spacing: two projects differing only in case and whitespace are ONE C-77.1 error naming BOTH by id",
  [c77(caseSpace, "C-77.1").length, c77(caseSpace, "C-77.1").every((x) => x.severity === "error"),
   c77(caseSpace, "C-77.1").some((x) => names(x, "PROJ-2026-0001-sewer-a", "PROJ-2026-0002-sewer-b")), caseSpace.pass],
  [1, true, true, false]);

const distinct = checkProjectNameUniqueness([SEWER_A, AUDIT, HOUSING_LIVE]);
t("§1 distinct names PASS: no finding at all over three differently-named projects",
  [distinct.pass, distinct.findings.length, distinct.judged], [true, 0, 3]);

/* over-strictness: a key LOOSER than §7.1's (punctuation stripped, say) would call these the same */
const dashed = checkProjectNameUniqueness([SEWER_A, DASHED]);
t("§1 over-strictness: 'Sewer Fund-Transfers' is a DIFFERENT name from 'Sewer Fund Transfers' — §7.1 folds case and whitespace, nothing else",
  [dashed.pass, dashed.findings.length], [true, 0]);

const deact = checkProjectNameUniqueness([HOUSING_CLOSED, HOUSING_LIVE]);
t("§1 a DEACTIVATED collider is still reported, named, with its closed state shown",
  [c77(deact, "C-77.1").length,
   c77(deact, "C-77.1").some((x) => names(x, "PROJ-2026-0005-housing-old", "PROJ-2026-0006-housing-new", "[closed]"))],
  [1, true]);

t("§1 a non-project sharing a project's title is NOT a collision (§7.1 is a rule about the project object)",
  checkProjectNameUniqueness([SEWER_A, INFO_SAME]).findings.length, 0);

/* every PAIR: over the whole corpus there are exactly two colliding pairs */
t("§1 the whole corpus names EXACTLY its two colliding pairs, each by both ids",
  [c77(all, "C-77.1").length,
   c77(all, "C-77.1").some((x) => names(x, "PROJ-2026-0001-sewer-a", "PROJ-2026-0002-sewer-b")),
   c77(all, "C-77.1").some((x) => names(x, "PROJ-2026-0005-housing-old", "PROJ-2026-0006-housing-new"))],
  [2, true, true]);

const THIRD = bundle("PROJ-2026-0008-sewer-c", "project", "SEWER FUND TRANSFERS", "matured");
const three = checkProjectNameUniqueness([SEWER_A, SEWER_B, THIRD]);
t("§1 three projects on one name are THREE pairs, each named", [c77(three, "C-77.1").length,
  c77(three, "C-77.1").some((x) => names(x, "PROJ-2026-0002-sewer-b", "PROJ-2026-0008-sewer-c"))], [3, true]);

/* C-77.2: undetermined is first-class */
const NOMD = { folderName: "PROJ-2026-0009-no-md", files: new Map([["notes.md", "x"]]) };
const UNTITLED = bundle("PROJ-2026-0010-untitled", "project", null, "forming");
const undet = checkProjectNameUniqueness([SEWER_A, NOMD, UNTITLED]);
t("§1 C-77.2 names, as warnings, a bundle with no bundle.md (UNDETERMINED) and an untitled project, and neither fails the corpus",
  [c77(undet, "C-77.2").length, c77(undet, "C-77.2").every((x) => x.severity === "warning"),
   c77(undet, "C-77.2").some((x) => names(x, "PROJ-2026-0009-no-md", "UNDETERMINED")),
   c77(undet, "C-77.2").some((x) => names(x, "PROJ-2026-0010-untitled")), undet.pass],
  [2, true, true, true, true]);

/* ======================================================== §2 IDENTITY, NOT EQUAL OUTPUT */
/* Inside workerd: a wrapper module imports the Store class and the catalog's export by the SAME specifier the store
   uses, so one module instance serves both and `===` asks whether they are ONE function. */
const WRAP = fileURLToPath(new URL("../src/__d50-identity.mjs", import.meta.url));   /* virtual: never written */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: WRAP, compatibilityDate: "2026-07-01",
  script: `import def, { Store } from "./store.mjs";
import { projectNameKey } from "../checks/bio-checks.mjs";
export { Store };
export default { fetch(req, env, ctx) {
  if (new URL(req.url).pathname === "/__d50identity")
    return Response.json({ same: Store.projectNameKey === projectNameKey, kind: typeof Store.projectNameKey,
                           name: Store.projectNameKey.name, sample: Store.projectNameKey("  A \\t B ") });
  return def.fetch(req, env, ctx);
} };`,
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { INSTANCE_NAME: "believe-in-oakland" },
});
try {
  const id = await (await mf.dispatchFetch("http://x/__d50identity")).json();
  t("§2 inside workerd, Store.projectNameKey IS the catalog's exported projectNameKey (===, one function object)",
    [id.same, id.kind, id.name, id.sample], [true, "function", "projectNameKey", "a b"]);

  const body = checkProjectNameUniqueness.toString();
  t("§2 the catalog check keys by the ONE export and carries no normaliser of its own (no toLowerCase, no whitespace regex)",
    [/\bprojectNameKey\(fm\.title\)/.test(body), /toLowerCase|toUpperCase|localeCompare|\\s\+/.test(body)], [true, false]);
  const storeSrc = readFileSync(SRC, "latin1");
  t("§2 the store defines no second key: `static projectNameKey = projectNameKey;` and no `static projectNameKey(` method",
    [storeSrc.includes("static projectNameKey = projectNameKey;"), /static\s+projectNameKey\s*\(/.test(storeSrc)], [true, false]);

  /* ====================================================== §3 THROUGH THE OP */
  const call = async (p, b) => (await (await mf.dispatchFetch("http://x" + p,
    b ? { method: "POST", body: JSON.stringify(b) } : {})).json()).result;
  const md = (title) => `---\nobject_type: project\ncurrent_state: forming\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n---\n\n## Summary\n\n${title}\n`;
  const mk = (title, n) => call("/promote", {
    base: null, snapKey: `d50-${n}`, author: "suite",
    files: [{ path: "bundle.md", text: md(title), bytes: md(title).length, sha256: sha(md(title)) }],
    meta: { object_type: "project", group: "believe-in-oakland", title, current_state: "forming",
            created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });
  const first = await mk("Sewer Fund Transfers", 1);
  const clash = await mk("  sewer   FUND\ttransfers ", 2);
  const other = await mk("Sewer Fund-Transfers", 3);
  t("§3 op=promote: the pair §1 reports C-77.1 is refused NAME_TAKEN at the write; the pair §1 passes is admitted",
    [first?.ok, clash?.ok, clash?.reason, other?.ok], [true, false, "NAME_TAKEN", true]);
} finally {
  await mf.dispose();
}
} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
console.log(`\nd50-project-names: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

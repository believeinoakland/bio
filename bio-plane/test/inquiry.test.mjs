/* NEGATIVE CONTROL: (run 2026-08-03, each site broken ALONE and restored, per REC-10's four normalisation sites) 1. catalog: empty LEGACY_TYPE_ALIASES ({problem:'inquiry',focus:'inquiry'} -> {}) -> 10 fail (legacy legality via C-2.5/C-3.1/C-4.1, projection, filters, facet, dispose); 2. boot normaliser: loop `Object.entries(LEGACY_TYPE_ALIASES)` -> `[]` in store.mjs -> 1 fail ("one boot under the live build and the row is canonical" — block 6's persistent-store reboot); 3. promote: `projectedType = normalizeType(meta.object_type)` -> raw `meta.object_type` -> 5 fail (projects-as-inquiry, all filter spellings, facet); 4. query: `raw = normalizeType(raw.toLowerCase())` -> `raw.toLowerCase()` -> 2 fail (focus and problem filter spellings answered with an empty page). Plus C-16: force `projectedTitle` past the derivation (condition -> false) -> 3 fail (derived-not-authored, word-boundary cut, visible ellipsis). Restored after each; 34 pass. */
/* The Inquiry collapse, code side (REC-10; RECONCILED.md is the design;
 * DATA-MODEL.md §2.7 the change list). Succeeds focus.test.mjs and carries
 * its three blocks forward, because the claims are the same claims one
 * rename later.
 *
 * Four claims, each asserted in the direction a rename can silently break:
 *   1. CANONICAL WORKS: an INQ- bundle with object_type `inquiry` and schema
 *      `inquiry@1` is conformant, projects, filters, facets, and disposes.
 *   2. LEGACY KEEPS WORKING: `problem` and `focus` spellings in existing
 *      history stay legal — INCLUDING their own heading sets and their own
 *      state machine, which the collapse CHANGED (unlike problem→focus,
 *      which kept them) — because history is append-only and a rename that
 *      invalidated the past would be a purge wearing a new name.
 *   3. THE PROJECTION NORMALIZES: a legacy document projects as `inquiry`,
 *      `type:inquiry`, `type:focus` and `type:problem` all find it, and the
 *      facet answers with one spelling, not a split count. The boot
 *      normaliser (site 2) is exercised FOR REAL by seeding a store with a
 *      neutered build and rebooting it with the live one.
 *   4. C-16: the inquiry has ONE authored field, the question. bundles.title
 *      is DERIVED from `## Question` by the catalog's one rule (first
 *      non-empty line, whitespace-collapsed, cut at a word boundary before
 *      120 chars with an ellipsis) and never separately authored; both entry
 *      points (the setup page's writer and a machine caller's op=promote)
 *      produce the same object, and no path asks for a title.
 */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, deriveInquiryTitle } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const mf = new Miniflare({
  modules: true, script: STORE_SRC,
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const callOn = (m) => async (p, body) => (await (await m.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;
const call = callOn(mf);
const STAMP = "viewer=class:member&owner=class:member";

/* The canonical inquiry document, C-16 shaped: the question is the one
   authored field, and the frontmatter title carries the DERIVED rendering of
   it (the entry points write it that way; the projection re-derives it). */
const QUESTION = "Where does the sewer fund transfer basis come from?";
const inquiryMd = (id, { question = QUESTION, title } = {}) => `---
id: ${id}
object_type: inquiry
schema: inquiry@1
title: "${title ?? deriveInquiryTitle(question)}"
current_state: open
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: agent
  capability_tier: high
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
surfaced_by: agent
disposition_reason: ""
recheck_triggers:
  - text: Revisit after the next budget cycle
    description: The adopted budget may restate the transfer basis.
---

## Question

${question}

## What It Rests On

## Conclusion

## What Would Falsify This

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | agent
Trigger: surfacing
Changes: created.

## Review Notes
`;

/* The legacy document, exactly as focus.test.mjs held it: OLD headings, OLD
   machine, either legacy spelling. Append-only means this shape stays legal
   forever. */
const focusMd = (id, { type = "focus", schema = "focus@1", state = "surfaced" } = {}) => `---
id: ${id}
object_type: ${type}
schema: ${schema}
title: "Focus ${id}"
current_state: ${state}
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: agent
  capability_tier: high
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
surfaced_by: agent
disposition_reason: ""
recheck_triggers:
  - text: Revisit after the next budget cycle
    description: The adopted budget may restate the transfer basis.
---

## Statement

The transfer basis is unstated.

## Why It Matters

It decides the remediation options.

## Open Questions

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | agent
Trigger: surfacing
Changes: created.

## Review Notes
`;

const mkOn = (c) => (id, text, type, title) => c("/promote", {
  bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta: { object_type: type, group: "believe-in-oakland", title: title ?? `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "surfaced",
          created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z" },
});
const mk = mkOn(call);
const errorsOf = async (id) => {
  const files = new Map(Object.entries(await call(`/image?id=${id}&viewer=class:member`) /* REC-25 fail-closed gate: direct-DO reads carry the viewer stamp the control plane would have applied */));
  const { findings } = await checkBundle({ folderName: id, files,
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true });
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};
const projOf = async (id) => call(`/projection?id=${id}&viewer=class:member`);
const select = async (ids) => (await call(`/select?${STAMP}`, { ids })).handle;
const S = async (q) => call(`/search?${q}&${STAMP}`);

console.log("--- 1. the canonical vocabulary works end to end ---");
{
  const id = "INQ-2026-0700-canon";
  await mk(id, inquiryMd(id), "inquiry");
  t("an INQ- bundle with inquiry@1 is conformant", await errorsOf(id), []);
  t("it projects as inquiry", (await projOf(id)).object_type, "inquiry");
  t("type:inquiry finds it", (await S("q=type:inquiry+0700&facets=none")).total, 1);
  const h = await select([id]);
  const r = await call(`/dispose?handle=${h}&to=dismissed&reason=${encodeURIComponent("out of scope")}&${STAMP}`);
  t("it disposes like the construct it is (open -> dismissed)", r.ok, true);
  t("and is still conformant dismissed (C-15 recheck coverage included)", await errorsOf(id), []);
}

console.log("\n--- 2. C-16: the title is DERIVED from the question, never separately authored ---");
{
  /* A machine caller supplies a meta.title that is NOT the question; the
     projection must ignore it and derive from ## Question. */
  const id = "INQ-2026-0701-derived";
  await mk(id, inquiryMd(id), "inquiry", "NOT THE QUESTION");
  t("bundles.title is the derived rendering of the question, not the caller's meta.title",
    (await projOf(id)).title, deriveInquiryTitle(QUESTION));
  t("which is the question itself when it fits", deriveInquiryTitle(QUESTION), QUESTION);

  /* The rule's cut: first non-empty line, whitespace collapsed, word-boundary
     cut before 120 chars, ellipsis appended so a cut is visible as a cut. */
  const long = "Why does the adopted budget restate the sewer fund transfer basis three different ways across the operating summary, the capital appendix and the reconciliation schedule without one of them citing the ordinance?";
  const lid = "INQ-2026-0702-long";
  await mk(lid, inquiryMd(lid, { question: long }), "inquiry");
  const lt = (await projOf(lid)).title;
  t("a long question is cut at a word boundary with an ellipsis", lt, deriveInquiryTitle(long));
  t("the cut is visible as a cut", lt.endsWith("…"), true);
  t("and stays within the bound", lt.length <= 121, true);
  /* Elaboration under the question must not retitle the record. */
  t("only the FIRST line of the question titles the record",
    deriveInquiryTitle("Short question?\nA much longer elaboration that should never become the title."),
    "Short question?");

  /* A legacy document has no ## Question; its authored title is document
     truth and is honoured, never re-derived from nothing. */
  const legacy = "PROB-2026-0703-title";
  await mk(legacy, focusMd(legacy, { type: "problem", schema: "problem@1" }), "problem", "The authored legacy title");
  t("a legacy document keeps its authored title", (await projOf(legacy)).title, "The authored legacy title");
}

console.log("\n--- 3. legacy spellings keep working, headings and state machine included ---");
{
  /* The immutable-id case: a PROB- bundle whose frontmatter modernized to
     focus on a later promotion. The id cannot change; the vocabulary can. */
  const id = "PROB-2026-0710-modern";
  await mk(id, focusMd(id, { type: "focus", schema: "focus@1" }), "focus");
  t("a PROB- id carrying object_type focus is coherent, not a C-2.5 error",
    await errorsOf(id), []);
  /* The untouched-history case, spelled entirely the old way. */
  const legacy = "PROB-2026-0711-legacy";
  await mk(legacy, focusMd(legacy, { type: "problem", schema: "problem@1" }), "problem");
  t("a fully legacy problem/problem@1 document is still legal", await errorsOf(legacy), []);
  /* The second rename's own canonical shape, now itself legacy: a FOCUS-
     bundle with the OLD heading set in the OLD machine's `surfaced`. The
     collapse CHANGED both vocabularies, so this is the assertion that a
     legacy document is judged by the contract it was written under. */
  const f = "FOCUS-2026-0712-legacy";
  await mk(f, focusMd(f), "focus");
  t("a focus/focus@1 document with the focus headings and machine is still legal",
    await errorsOf(f), []);
}

console.log("\n--- 4. the projection normalizes, and all three spellings answer ---");
{
  const legacy = "PROB-2026-0720-proj";
  await mk(legacy, focusMd(legacy, { type: "problem", schema: "problem@1" }), "problem");
  t("a legacy problem document projects as inquiry", (await projOf(legacy)).object_type, "inquiry");
  t("type:inquiry finds legacy documents too",
    (await S("q=type:inquiry+0720&facets=none")).total, 1);
  t("the focus filter spelling is honoured, not answered with an empty page",
    (await S("q=type:focus+0720&facets=none")).total, 1);
  t("the problem filter spelling is honoured too",
    (await S("q=type:problem+0720&facets=none")).total, 1);
  t("schema stamps stay document truth: schema:problem@1 still matches",
    (await S("q=schema:problem@1+0720&facets=none")).total, 1);
  const fac = await S("q=0720&facets=type");
  t("the facet answers with one spelling",
    fac.facets.type.map((x) => x.value), ["inquiry"]);
  const h = await select([legacy]);
  const r = await call(`/dispose?handle=${h}&to=deferred&reason=${encodeURIComponent("next cycle")}&${STAMP}`);
  t("dispose still moves a legacy document", r.ok, true);
  t("through the catalog's machine, not a second copy: surfaced is a legal alias of open",
    (await projOf(legacy)).current_state, "deferred");
}

console.log("\n--- 5. either entry point mints the same object, and no path asks for a title ---");
{
  const { SETUP_HTML } = await import("../src/setup.mjs");
  const script = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));
  const el = () => ({ addEventListener() {}, classList: { add() {}, remove() {} },
    textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
  const sandbox = {
    document: { querySelector: () => el(), querySelectorAll: () => [], getElementById: () => el(),
                addEventListener() {}, createElement: () => el(), body: { appendChild() {}, removeChild() {} } },
    location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array,
    setTimeout, TextEncoder, navigator: { clipboard: { writeText: async () => {} } },
  };
  sandbox.window = sandbox;
  const fn = new Function(...Object.keys(sandbox), script + "\n;return { mdFor, FIRST_STATE, PREFIX, SCHEMA_OF, deriveInquiryTitle };");
  const ui = fn(...Object.values(sandbox));

  t("the page embeds the catalog's derivation rule verbatim, so the two cannot drift",
    [ui.deriveInquiryTitle(QUESTION),
     ui.deriveInquiryTitle("  A   question\nwith noise  "),
     ui.deriveInquiryTitle("x".repeat(200) + " tail")],
    [deriveInquiryTitle(QUESTION),
     deriveInquiryTitle("  A   question\nwith noise  "),
     deriveInquiryTitle("x".repeat(200) + " tail")]);
  t("the intake page removes the Title control for a Question rather than greying it",
    /\$\("#n-title"\)\.hidden = isQ/.test(script), true);
  t("a Question's first state comes from the catalog", ui.FIRST_STATE.inquiry, "open");
  t("and its id prefix is INQ", ui.PREFIX.inquiry, "INQ");
  t("and its schema is inquiry@1", ui.SCHEMA_OF.inquiry, "inquiry@1");

  /* Entry point A: the page's own writer, with the title DERIVED — exactly
     what the save handler does. Entry point B: a machine caller's promote
     (blocks 1-2 above). Same catalog contract, same projection. */
  const id = "INQ-2026-0730-intake";
  const text = ui.mdFor(id, "inquiry", ui.FIRST_STATE.inquiry, ui.deriveInquiryTitle(QUESTION), QUESTION,
    "2026-07-24T12:00:00Z", false, null);
  t("the page's writer puts the question under ## Question", text.includes("## Question\n\n" + QUESTION), true);
  const files = new Map([["bundle.md", text]]);
  const { findings } = await checkBundle({ folderName: id, files,
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64), resolveTarget: () => true });
  t("and the result is conformant with no field beyond the derived title asked of the member",
    findings.filter((x) => x.severity === "error").map((x) => x.check), []);
  await mk(id, text, "inquiry", ui.deriveInquiryTitle(QUESTION));
  t("promoted, it projects the SAME derived title as the machine path",
    (await projOf(id)).title, deriveInquiryTitle(QUESTION));
}

console.log("\n--- 6. the boot normaliser converts pre-REC-10 rows (site 2, exercised for real) ---");
{
  /* Seed a persistent store with a build whose boot normaliser AND promote
     normalisation are neutered — the only way to get a legacy-spelled ROW
     out of the current build — then reboot the SAME storage under the live
     build and watch the boot normaliser convert it. */
  const dir = mkdtempSync(join(tmpdir(), "bio-inquiry-boot-"));
  const neutered = STORE_SRC
    .replace("Object.entries(LEGACY_TYPE_ALIASES))", "[])")
    .replace("const projectedType = normalizeType(meta.object_type);",
             "const projectedType = meta.object_type;");
  t("the neutering patch found both sites (markers moved if this fails)",
    neutered !== STORE_SRC && !neutered.includes("const projectedType = normalizeType("), true);
  const mkMf = (src) => new Miniflare({
    modules: true, script: src, modulesRoot: "/", scriptPath: SRC("store.mjs"),
    compatibilityDate: "2026-07-01", durableObjectsPersist: dir,
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
  });
  const legacy = "PROB-2026-0740-boot";
  const mf1 = mkMf(neutered);
  const c1 = callOn(mf1);
  await mkOn(c1)(legacy, focusMd(legacy, { type: "problem", schema: "problem@1" }), "problem");
  t("the neutered build stored the legacy spelling raw",
    (await c1(`/projection?id=${legacy}&viewer=class:member`)).object_type, "problem");
  await mf1.dispose();
  const mf2 = mkMf(STORE_SRC);
  const c2 = callOn(mf2);
  t("one boot under the live build and the row is canonical",
    (await c2(`/projection?id=${legacy}&viewer=class:member`)).object_type, "inquiry");
  await mf2.dispose();
  rmSync(dir, { recursive: true, force: true });
}

await mf.dispose();
console.log(`\ninquiry: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

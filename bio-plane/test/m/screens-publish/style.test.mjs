/* screens-publish R20 (the common line, interface-shell R56 and R61): every element these screens draw uses a class a
 * served stylesheet defines; a section, list or reading that holds nothing is not drawn and no count is drawn at zero;
 * a screen with nothing at all draws its one designed empty state; a read that failed is still drawn failed. The served
 * stylesheets are `civicsmith.css`, `shell.css` and the shell's own `<style>` (R56). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { interfacePage, HOOK_CLASSES } from "../../../src/interface-shell/index.mjs";
import { ASSET_FILES } from "../../../src/interface-assets/index.mjs";
import { open, main, text, drew, press, tick, ok, refusedIn, plane, COPY, PREFLIGHT, SCREENS, P, DR, C } from "./fixtures.mjs";

const tokens = (css) => new Set([...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]));
const page = interfacePage(SCREENS);
const SERVED = new Set([...tokens(ASSET_FILES["civicsmith.css"].body), ...tokens(ASSET_FILES["shell.css"].body),
  ...tokens((/<style[^>]*>([\s\S]*?)<\/style>/.exec(page) || [])[1] || "")]);
const drawn = (p) => new Set([...p.root().innerHTML.matchAll(/\bclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean));
const undefinedIn = (p) => [...drawn(p)].filter((c) => !SERVED.has(c) && !Object.hasOwn(HOOK_CLASSES, c));

const PATHS = {
  "case-editor": `/app/case-editor/${P}`, "review-copy": `/app/review-copy/${P}`, ceremony: `/app/ceremony/${P}/${DR}`,
  published: `/app/published/${C}`, imported: "/app/imported/IMP-2026-0001", docket: `/app/docket/${P}/${C}`, "docket-public": `/app/docket-public/${C}`, doorbell: "/app/doorbell",
};
const PUBLIC = { published: true, "docket-public": true, doorbell: true };
const bootOf = (id) => (PUBLIC[id] ? { session: null } : {});

test("R20 every class the module's screens draw is defined by a served stylesheet (the module's real SCREENS compose; control: the check sees an undefined class)", async () => {
  assert.equal(typeof interfacePage(SCREENS), "string");
  for (const [id, path] of Object.entries(PATHS)) {
    const p = await open(path, { boot: bootOf(id) });
    assert.deepEqual(undefinedIn(p), [], id);
  }
  const q = await open("/app/review", { boot: { session: null, hash: "#grant=SECRET-1" } });
  assert.deepEqual(undefinedIn(q), [], "review-outside");
  const bare = await open("/app/published", { boot: { session: null } });
  assert.deepEqual(undefinedIn(bare), [], "published with no id");
  assert.ok(!SERVED.has("cs-nonesuch"), "control: a class nothing defines is not served, so it would be reported");
  for (const c of ["mk-acts", "mk-note", "mk-list", "mk-grp", "mk-explain", "mk-steps"]) assert.ok(SERVED.has(c), `${c} is served`);
});

test("R20 the states a screen moves through draw only defined classes: the ceremony prepared, the sign step, a refusal, a read said", async () => {
  const p = await open(PATHS.ceremony);
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "r" });
  assert.deepEqual(undefinedIn(p), [], "prepared, the Sign step drawn");
  const n = await open(PATHS.ceremony, { plane: { caseratify: refusedIn("NO_ATTESTING_KEY", "No key.") } });
  tick(n, "ce-tie", "yes");
  await press(n, "publish", { reason: "r" });
  await press(n, "caseratify", { reason: "r" });
  assert.deepEqual(undefinedIn(n), [], "no key in this browser");
  const o = await open(PATHS.ceremony, { plane: { caseratify: refusedIn("CASE_SIGNER_NOT_AN_OWNER", "Not an owner.") } });
  tick(o, "ce-tie", "yes");
  await press(o, "publish", { reason: "r" });
  await press(o, "caseratify", { reason: "r" });
  assert.deepEqual(undefinedIn(o), [], "not an owner");
  const v = await open(PATHS.published, { boot: { session: null }, plane: { verify: ok({ published: false, matches: [] }) } });
  await press(v, "verify");
  assert.deepEqual(undefinedIn(v), [], "a mismatch said");
  const r = await open(PATHS["review-copy"], { plane: { reviewrevoke: ok({ ok: true }) } });
  assert.deepEqual(undefinedIn(r), []);
});

/* Each screen over an empty fixture: every list empty, every count zero. */
const EMPTY = {
  casedrafts: ok({ kind: "review-drafts", project: P, drafts: [] }),
  reviewcomments: ok({ comments: [] }), whatchangeddrafts: ok({ case: C, drafts: [] }),
  reviewcopy: ok(COPY({ authored: {}, findings: [], statement_acknowledgements: { acknowledgements: [] }, observations: [], grants: [] })),
  publishpreflight: ok(PREFLIGHT({ first: null, blockers: [], ready: true, steps: [{ pinned: [] }, { photos: [], unchecked: 0 }, { publish_at: { zone: "America/Los_Angeles" } }] })),
  publishtensions: ok({ wrote: false, project: P, count: 0, candidates: [], says: "" }),
  /* the ceremony asks for the published editions of a case by `caseId` alone: the draft under it is not yet published (R71) */
  publishedcase: (req) => ((req.query || {}).caseId && !(req.query || {}).id ? refusedIn("NOT_PUBLISHED")
    : ok({ caseId: C, edition: 2, scope: "The Coliseum lease", signed_at: "2026-11-18T10:00:00Z", published_at: "2026-11-19T14:00:00Z", editions: [{ edition: 2 }],
      manifest_sha: "a".repeat(64), findings: [], method: { timeline: [] }, people: [], captures: [] })),
  importedcases: ok({ imports: [], count: 0 }), importedcase: ok({ import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "Port lease", edition: { edition: 1, findings: [] } }),
  docket: ok({ case: C, project: P, entries: [] }),
};
const holdsNothing = (p) => main(p).querySelectorAll("section").filter((s) => s.textContent.replace(s.querySelector("h2") ? s.querySelector("h2").textContent : "", "").trim() === "");
const zeros = (p) => text(p).match(/(^|[\s·(])0([\s·).,]|$)/g) || [];

test("R20 each screen over an empty fixture shows no empty section and no zero; a screen with nothing draws its one designed empty state naming the first step", async () => {
  for (const [id, path] of Object.entries(PATHS)) {
    const p = await open(path, { boot: bootOf(id), plane: EMPTY });
    assert.deepEqual(holdsNothing(p).map((s) => s.querySelector("h2").textContent), [], `${id}: an empty section`);
    assert.deepEqual(zeros(p), [], `${id}: a zero drawn`);
    assert.deepEqual(undefinedIn(p), [], `${id}: undefined classes`);
    assert.equal(main(p).querySelector('[data-state="failed"]'), null, `${id}: empty is not failed`);
  }
  const ed = await open(PATHS["case-editor"], { plane: EMPTY });
  assert.equal(main(ed).querySelectorAll('[data-state="empty"]').length, 1, "case-editor: one empty state");
  assert.ok(drew(ed, "screen.case-editor.nodrafts"));
  const im = await open("/app/imported", { plane: EMPTY });
  assert.ok(drew(im, "screen.imported.none"));
  const dk = await open(PATHS.docket, { plane: EMPTY });
  assert.ok(drew(dk, "screen.docket.none"));
  const out = await open("/app/review", { boot: { session: null, hash: "#grant=S" }, plane: { reviewcopy: ok({ kind: "review-copy", draft: DR, case: { case_id: C, edition: 2, identity: "X" }, authored: {}, findings: [], grant: { recipient: "Ana" } }) } });
  assert.deepEqual(holdsNothing(out).map((s) => s.querySelector("h2").textContent), [], "review-outside: an empty section");
});

test("R20 control: a read that failed is still drawn failed, never as empty or dropped (interface-shell R10)", async () => {
  const failed = refusedIn("SOME_REFUSAL", "The plane refused this read.");
  const cases = [["case-editor", "casedrafts"], ["review-copy", "casedrafts"], ["imported", "importedcases"], ["docket", "docket"], ["published", "publishedcase"], ["ceremony", "publishpreflight"]];
  for (const [id, op] of cases) {
    const p = await open(PATHS[id], { boot: bootOf(id), plane: { ...EMPTY, [op]: failed } });
    assert.ok(main(p).querySelector('[data-state="failed"]'), `${id}: ${op} drawn failed`);
  }
});

test("R20 no labelled field is drawn by hand: every input has its label from the kit's field, and no screen draws a form wrapper or a bare label with help", async () => {
  for (const [id, path] of Object.entries(PATHS)) {
    const p = await open(path, { boot: bootOf(id) });
    const html = p.root().innerHTML;
    assert.ok(!/class="[^"]*\bcs-form\b/.test(html), `${id}: no cs-form`);
    const m = main(p);
    assert.deepEqual(m.querySelectorAll("label").filter((l) => l.querySelector(".help")).map((l) => l.textContent), [], `${id}: a bare label with .help`);
    for (const input of m.querySelectorAll("input, textarea")) {
      if (["checkbox", "radio", "hidden", "file"].includes(input.type)) continue;
      assert.ok(input.id && (m.querySelectorAll(`label[for="${input.id}"]`).length > 0 || input.getAttribute("aria-label")), `${id}: ${input.id} is labelled`);
    }
  }
});

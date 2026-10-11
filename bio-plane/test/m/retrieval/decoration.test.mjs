/* retrieval: the single-bundle projection's registered decorations (R5, R56), at the module's interface.
 *
 * Converted from the old battery's `test/projection-noproject.test.mjs` (N392, K573). That suite drove the no-project
 * conclusion end to end; its retrieval share is how R5's single-bundle answer carries what a later module registers, and
 * that the list form carries none of it. What the conclusion itself says (its equality with `op=basisversions`) is
 * basis-versions' R11 share, tested there; the old suite's §4 read source text and is dropped (P7). The decoration here is
 * the test's own, registered under a module name as inquiry and basis-versions register theirs, over real promoted
 * bundles of the old suite's four kinds: an inquiry concluded, one concluded the legacy way, one still open, and two
 * non-inquiries (an information bundle and a project). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, md, T0 } from "./fixture.mjs";
import { normalizeType } from "../../../src/record-grammar/types.mjs";

const has = (o, k) => !!o && typeof o === "object" && Object.prototype.hasOwnProperty.call(o, k);
const inquiry = (id, state) => md({ id, object_type: "inquiry", schema: "inquiry@1",
  title: "Was the sewer transfer booked before the council met?", current_state: state,
  prior_state: state === "open" ? null : "open", created: T0, last_updated: T0, group: "test-group" },
  "\n## Question\n\nWas it?\n");

const ACTED = "INQ-2026-4144-concluded-by-the-act", LEGACY = "INQ-2026-4144-concluded-in-bytes";
const OPEN = "INQ-2026-4144-still-open", LEDGER = "INFO-2026-4144-ledger";

/* A world holding the old suite's bundles, and a decoration that answers, per inquiry and viewer, a conclusion object
   (non-null and long, so equality is never two nulls agreeing) and null, key present, for everything else. `calls`
   records every call, so the list form is seen never to reach it. */
function decorated() {
  const w = world({ members: ["ann", "ruth", "mia"] });
  w.doc(LEDGER);
  for (const [id, state] of [[ACTED, "concluded"], [LEGACY, "concluded"], [OPEN, "open"]]) {
    const head = w.row(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, id);
    const r = w.promotion.promote({ bundleId: id, base: head ? head.bundle_sha : null, snapKey: `${id}-${state}`,
      author: V("ann"), files: [{ path: "bundle.md", text: inquiry(id, state) }], meta: { object_type: "inquiry" } });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  }
  const proj = w.project("Oversight", "ann");
  const calls = [];
  const answers = new Map();
  const conclusionOf = (row, viewer) => ({ relationship: "no_project", project: null, relationship_established: false,
    claim: { state: row.bundle_id === ACTED ? "adopted" : "undetermined",
             text: "The ledger shows the transfer was booked before the council met.", version: "booked early" },
    conclusion: `concluded: ${row.bundle_id}`, read_as: viewer, stated: "x".repeat(200) });
  const reg = w.retrieval.registerProjectionDecoration("inquiry", (row, ctx) => {
    calls.push({ id: row.bundle_id, ctx });
    const v = normalizeType(row.object_type) === "inquiry" && row.current_state === "concluded"
      ? conclusionOf(row, ctx.viewer) : null;
    answers.set(`${row.bundle_id}|${ctx.viewer}`, JSON.stringify(v));
    return { no_project_conclusion: v };
  });
  assert.equal(reg.ok, true);
  return { w, proj, calls, answers };
}

test("R5, R56: a registered decoration's answer is carried on the single-bundle answer byte for byte, per viewer, called with the row and {viewer, nowMs}", () => {
  const { w, calls, answers } = decorated();
  for (const viewer of [V("ruth"), V("mia"), MACHINE]) {
    for (const [id, state] of [[ACTED, "adopted"], [LEGACY, "undetermined"]]) {
      const p = w.retrieval.projection({ bundleId: id, viewer, nowMs: 1234 });
      assert.deepEqual([p.bundle_id, p.current_state], [id, "concluded"], "the row is the concluded inquiry");
      assert.equal(has(p, "no_project_conclusion"), true);
      assert.equal(p.no_project_conclusion.claim.state, state, "non-null, so equality is not two nulls agreeing");
      assert.equal(JSON.stringify(p.no_project_conclusion), answers.get(`${id}|${viewer}`), "byte-identical to what the owner answered");
      assert.ok(JSON.stringify(p.no_project_conclusion).length > 200);
      assert.equal(p.no_project_conclusion.read_as, viewer, "each viewer's answer is its own");
      const last = calls[calls.length - 1];
      assert.deepEqual([last.id, last.ctx.viewer, last.ctx.nowMs], [id, viewer, 1234]);
    }
  }
});

test("R5, R56: a decoration answering a key with null leaves the key present and null: an open inquiry and non-inquiries", () => {
  const { w, proj } = decorated();
  const o = w.retrieval.projection({ bundleId: OPEN, viewer: V("ruth") });
  assert.deepEqual([o.bundle_id, o.current_state, has(o, "no_project_conclusion"), o.no_project_conclusion],
    [OPEN, "open", true, null]);
  for (const id of [LEDGER, proj]) {
    const r = w.retrieval.projection({ bundleId: id, viewer: V("ann") });
    assert.deepEqual([r.bundle_id, has(r, "no_project_conclusion"), r.no_project_conclusion], [id, true, null], id);
  }
});

test("R5, R56: no decoration reaches the list form, paged or filtered, and the list holds the decorated bundles", () => {
  const { w, calls } = decorated();
  const before = calls.length;
  const page = w.retrieval.projection({ viewer: V("ann"), limit: 100 });
  const ids = page.bundles.map((b) => b.bundle_id);
  assert.deepEqual([ids.includes(ACTED), ids.includes(LEGACY), ids.length >= 5], [true, true, true],
    "absence is not an empty page");
  assert.deepEqual(page.bundles.filter((b) => has(b, "no_project_conclusion")).map((b) => b.bundle_id), []);
  const small = w.retrieval.projection({ viewer: V("ann"), limit: 2 });
  const next = w.retrieval.projection({ viewer: V("ann"), limit: 2, after: small.cursor });
  assert.equal([...small.bundles, ...next.bundles].some((b) => has(b, "no_project_conclusion")), false, "nor any page");
  const filtered = w.retrieval.projection({ viewer: V("ann"), jsonPath: "$.current_state", jsonEquals: "concluded" });
  assert.deepEqual(filtered.bundles.map((b) => b.bundle_id).sort(), [ACTED, LEGACY].sort());
  assert.equal(filtered.bundles.some((b) => has(b, "no_project_conclusion")), false);
  assert.equal(calls.length, before, "the list form never calls a decoration");
});

test("R5, R56: a hidden or absent bundle answers null before any decoration runs; a decoration that rejects adds nothing", async () => {
  const { w, proj, calls } = decorated();
  const before = calls.length;
  assert.equal(w.retrieval.projection({ bundleId: proj, viewer: V("mia") }), null, "hidden answers as absent");
  assert.equal(w.retrieval.projection({ bundleId: "NO-SUCH", viewer: V("mia") }), null);
  assert.equal(w.retrieval.projection({ bundleId: ACTED, viewer: null }), null, "no viewer sees nothing");
  assert.equal(calls.length, before, "no decoration saw a row the viewer may not see");
  w.retrieval.registerProjectionDecoration("ai-runs", async () => { throw new Error("unreadable run"); });
  const p = await w.retrieval.projection({ bundleId: ACTED, viewer: V("ruth") });
  assert.equal(p.bundle_id, ACTED);
  assert.equal(p.no_project_conclusion.claim.state, "adopted", "the other decorations still apply");
  assert.equal(has(p, "surfaced_in"), false, "the rejecting one adds no key");
});

/* ---- R78 (T42; N830; K2480): the search page's decorations ----
 *
 * `inquiry` registers its question row's `projects` here (its R60); these tests register the test's own decorations
 * under module names, over a small corpus: four documents and a project only ann may see. */
import { retrievalRoutes } from "../../../src/retrieval/index.mjs";

function searched() {
  const w = world({ members: ["ann", "vera"] });
  w.doc("INFO-1", { title: "Water fund audit" }, { files: [{ path: "n.md", text: "water rates rose sharply" }] });
  w.doc("INFO-2", { title: "Water bonds" }, { files: [{ path: "n.md", text: "water bonds and sewer bonds" }] });
  w.doc("INFO-3", { title: "Parks" }, { files: [{ path: "n.md", text: "parks budget" }] });
  w.doc("INFO-4", { title: "Library" }, { files: [{ path: "n.md", text: "library hours" }] });
  const proj = w.project("Water Secret Fund", "ann");
  return { w, proj };
}
/* Every mode and shape a decoration could reach, as one string: a page, a page with no facets, a miss that widens,
   an empty page, the ids and the count, for a viewer who cannot see the project and one who can. */
const everything = (w) => JSON.stringify(["vera", "ann"].flatMap((m) => [
  w.retrieval.search({ q: "water", viewer: V(m) }),
  w.retrieval.search({ q: "", viewer: V(m), facets: false, sort: "title" }),
  w.retrieval.search({ q: "water library", viewer: V(m) }),
  w.retrieval.search({ q: "zzqx", viewer: V(m) }),
  w.retrieval.search({ q: "water", viewer: V(m), mode: "ids" }),
  w.retrieval.search({ q: "water", viewer: V(m), mode: "count" }),
]));

test("R78: registerSearchDecoration refuses a malformed registration DECORATION_MALFORMED and a module's second DECORATION_DECLARED (R56's codes); a refused one is never called", () => {
  const { w } = searched();
  for (const [m, fn] of [["", () => []], [null, () => []], [7, () => []], ["inquiry", null], ["inquiry", {}], [undefined, undefined]]) {
    const r = w.retrieval.registerSearchDecoration(m, fn);
    assert.deepEqual([r.ok, r.reason], [false, "DECORATION_MALFORMED"], String(m));
  }
  let second = 0;
  assert.deepEqual(w.retrieval.registerSearchDecoration("inquiry", (hits) => hits.map(() => ({ first: 1 }))), { ok: true, module: "inquiry" });
  assert.deepEqual(w.retrieval.registerSearchDecoration("inquiry", (hits) => { second++; return hits.map(() => ({ second: 1 })); }),
    { ok: false, reason: "DECORATION_DECLARED", module: "inquiry" });
  /* Negative control: another module registers; and the projection's slot (R56) is its own, so inquiry may hold both. */
  assert.equal(w.retrieval.registerSearchDecoration("ai-runs", () => null).ok, true);
  assert.equal(w.retrieval.registerProjectionDecoration("inquiry", () => ({})).ok, true);
  const s = w.retrieval.search({ q: "water", viewer: V("vera") });
  assert.ok(s.hits.length > 0);
  assert.ok(s.hits.every((h) => h.first === 1 && !has(h, "second")), "the held registration applies, the refused one does not");
  assert.equal(second, 0, "the refused fn is never called");
});

test("R78: a decoration adds its keys to the page's hits, one entry per hit in the page's order, called once per page with the hits and {viewer}; null adds nothing; total, facets, widen, ids and count are unchanged", () => {
  const { w, proj } = searched();
  const before = everything(w);
  const plain = w.retrieval.search({ q: "", viewer: V("ann"), sort: "title" });
  assert.equal(plain.hits.some((h) => has(h, "decorated")), false, "negative control: no key before a registration");
  const calls = [];
  w.retrieval.registerSearchDecoration("inquiry", (hits, ctx) => {
    calls.push({ ids: hits.map((h) => h.bundle_id), ctx });
    return hits.map((h) => (h.bundle_id === "INFO-3" ? null : { decorated: `${h.bundle_id}|${ctx.viewer}`, ord: h.title }));
  });
  const s = w.retrieval.search({ q: "", viewer: V("ann"), sort: "title" });
  assert.deepEqual(calls, [{ ids: plain.hits.map((h) => h.bundle_id), ctx: { viewer: V("ann") } }], "one call, the page in order");
  assert.deepEqual(s.hits.map((h) => h.bundle_id), plain.hits.map((h) => h.bundle_id), "no hit added, removed or reordered");
  s.hits.forEach((h, i) => {
    const { decorated, ord, ...rest } = h;
    assert.deepEqual(rest, plain.hits[i], "every key R6 answers, unchanged, in its place");
    if (h.bundle_id === "INFO-3") assert.equal(has(h, "decorated") || has(h, "ord"), false, "null adds nothing");
    else assert.deepEqual([decorated, ord], [`${h.bundle_id}|${V("ann")}`, plain.hits[i].title]);
  });
  assert.ok(s.hits.some((h) => h.bundle_id === proj), "ann's page holds her project");
  const { hits: _a, ...restS } = s, { hits: _b, ...restP } = plain;
  assert.deepEqual(restS, restP, "total, facets, widen, query, gate and cached are unchanged");
  /* The ids and count modes, the widen offer and an empty page: byte for byte as before the registration. */
  const n = calls.length;
  const was = JSON.parse(before);
  ["vera", "ann"].forEach((m, k) => {
    for (const [i, input] of [[2, { q: "water library" }], [3, { q: "zzqx" }], [4, { q: "water", mode: "ids" }],
                              [5, { q: "water", mode: "count" }]])
      assert.equal(JSON.stringify(w.retrieval.search({ ...input, viewer: V(m) })), JSON.stringify(was[k * 6 + i]), `${m} ${i}`);
  });
  assert.equal(calls.length, n, "neither ids, count nor an empty page calls a decoration");
});

test("R78: the decoration sees only the hits the viewer's gate passes: a hidden project is never handed to it", () => {
  const { w, proj } = searched();
  const seen = [];
  w.retrieval.registerSearchDecoration("inquiry", (hits, ctx) => { seen.push(...hits.map((h) => [ctx.viewer, h.bundle_id])); return hits.map(() => null); });
  w.retrieval.search({ q: "water", viewer: V("vera") });
  w.retrieval.search({ q: "", viewer: null });
  assert.equal(seen.some(([, id]) => id === proj), false, "vera's page never carries the project to a decoration");
  w.retrieval.search({ q: "water", viewer: V("ann") });
  assert.ok(seen.some(([v, id]) => v === V("ann") && id === proj), "negative control: ann's does");
});

test("R78: a decoration naming a key R6 answers (bundle_id, title, snippet) is ignored for that key; its other keys are added", () => {
  const { w } = searched();
  const plain = w.retrieval.search({ q: "water", viewer: V("vera") });
  w.retrieval.registerSearchDecoration("inquiry", (hits) => hits.map(() => ({ bundle_id: "INQ-FORGED", title: "forged", snippet: "forged", projects: ["P"] })));
  const s = w.retrieval.search({ q: "water", viewer: V("vera") });
  s.hits.forEach((h, i) => {
    const { projects, ...rest } = h;
    assert.deepEqual(rest, plain.hits[i], "no key R6 answers is replaced");
    assert.deepEqual(projects, ["P"], "negative control: the decoration's own key is added");
  });
});

test("R78: a decoration that throws, answers a promise, or answers any other shape adds nothing to any hit, and the answer is byte-identical to the answer with nothing registered; search stays synchronous", async () => {
  const bad = {
    throws: () => { throw new Error("unreadable"); },
    promise: async (hits) => hits.map(() => ({ late: 1 })),
    rejects: async () => { throw new Error("late failure"); },
    thenable: (hits) => ({ then: (ok) => ok(hits.map(() => ({ late: 1 }))) }),
    object: () => ({ late: 1 }),
    nothing: () => undefined,
    null: () => null,
    short: (hits) => hits.slice(1).map(() => ({ late: 1 })),
    long: (hits) => [...hits, null].map(() => ({ late: 1 })),
    strings: (hits) => hits.map(() => "late"),
    arrays: (hits) => hits.map(() => ["late"]),
    mixed: (hits) => hits.map((_, i) => (i === 0 ? 3 : { late: 1 })),
    dated: (hits) => hits.map(() => new Date(0)),
    mutates: (hits) => { hits[0].title = "changed"; return hits.map(() => ({ late: 1 })); },
  };
  for (const [name, fn] of Object.entries(bad)) {
    const { w } = searched();
    const base = everything(w);
    assert.equal(w.retrieval.registerSearchDecoration("inquiry", fn).ok, true);
    const page = w.retrieval.search({ q: "water", viewer: V("vera") });
    assert.equal(typeof page.then, "undefined", `${name}: the answer is not a promise`);
    assert.equal(everything(w), base, `${name}: byte-identical to the answer with nothing registered`);
  }
  /* Negative control: the same corpus with a well-formed decoration does change the page. */
  const { w } = searched();
  const base = everything(w);
  w.retrieval.registerSearchDecoration("inquiry", (hits) => hits.map(() => ({ late: 1 })));
  assert.notEqual(everything(w), base);
  await new Promise((r) => setTimeout(r, 10));   // a rejected promise is handled, never an unhandled rejection
});

test("R78: two modules' decorations apply in the modules' total order, whatever order they registered in; one that fails leaves the others", () => {
  const { w } = searched();
  const order = [];
  /* ai-runs follows inquiry in MODULE_ORDER (membership R83); ai-runs registers first. */
  w.retrieval.registerSearchDecoration("ai-runs", (hits) => { order.push("ai-runs"); return hits.map(() => ({ shared: "ai-runs", runs: 1 })); });
  w.retrieval.registerSearchDecoration("inquiry", (hits) => { order.push("inquiry"); return hits.map(() => ({ shared: "inquiry", projects: [] })); });
  w.retrieval.registerSearchDecoration("actions", () => { order.push("actions"); throw new Error("no"); });
  const s = w.retrieval.search({ q: "water", viewer: V("vera") });
  assert.deepEqual(order, ["inquiry", "ai-runs", "actions"], "called in MODULE_ORDER");
  for (const h of s.hits) assert.deepEqual([h.shared, h.runs, h.projects], ["ai-runs", 1, []], "the later module's value of a shared key; each module's own keys");
});

test("R58, R78: op=search through retrievalRoutes carries the page's decorations, exactly as the service answers; its ids and count modes carry none", () => {
  const { w } = searched();
  w.retrieval.registerSearchDecoration("inquiry", (hits, ctx) => hits.map((h) => ({ projects: [h.bundle_id, ctx.viewer] })));
  const op = (params) => retrievalRoutes(w.retrieval, new URL(`https://x/?${new URLSearchParams(params)}`), null).search();
  const page = op({ q: "water", viewer: V("vera") });
  assert.ok(page.hits.length > 0 && page.hits.every((h) => h.projects[0] === h.bundle_id && h.projects[1] === V("vera")));
  assert.deepEqual(page, w.retrieval.search({ q: "water", viewer: V("vera"), widen: true, snippetChars: 12 }));
  assert.equal(JSON.stringify(op({ q: "water", viewer: V("vera"), mode: "ids" })).includes("projects"), false);
  assert.equal(JSON.stringify(op({ q: "water", viewer: V("vera"), mode: "count" })).includes("projects"), false);
});

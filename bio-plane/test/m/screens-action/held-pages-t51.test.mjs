/* screens-action, fix round 6 (G20; K4571, K4578; audit S11): the matter's document pickers read the project's held documents past
   the first page. `heldcaptures` answers `{held, truncated, next}` (capture R77: at most `limit` rows, `next` the cursor `after` takes);
   the fake below keeps exactly that contract over N documents. A picker that stops at the first 200 without saying so is the defect. */
import test from "node:test";
import assert from "node:assert/strict";
import { inWorld, openIn } from "./world.mjs";
import { main, text, ok, refusedIn, W, DATA_PLANE, PROJECT } from "./page.mjs";

/* the matter of a project that holds no determination: the real store's own answer to `determinations`, over a project the member starts (the pages of
   documents are scripted: 250 and 1200 documents are the fake's, `heldcaptures`' contract kept by it) */
const { world, me, project } = await (async () => {
  const w = await inWorld({ handle: "olive" });
  return { ...w, project: await w.world.recipes.project(w.me, "Stormwater") };
})();
const { determinations: _held, ...READS } = DATA_PLANE;
const NONE = READS;
const open = (path, plane) => openIn(world, me, path, plane);
const STANDARDS = ok({ ok: true, items: [{ id: "STD-1", cite: "Lease §7.2" }], truncated: false });
const PUBLISHED = { publishedlist: ok({ bundles: [], cases: [] }) };
const PROJECT_DOC = ok({ "bundle.md": `---\nid: ${PROJECT}\ntitle: Pothole repairs\nreferences:\n  - target: EVT-1\n    rel: cites\n---\nbody\n` });
const EVENTS = ok({ ok: true, world: { items: [{ event_id: "EVT-1", kind: "vote", when: { value: "2024-03-01", precision: "day" } }], placed_nowhere: [] } });
const CONCLUDED = ok({ ok: true, project: PROJECT, items: [{ inquiry: "INQ-1", title: "Did the adjustments cause the higher rent?", stance: "concluded" }], cursor: null });
const sha = (i) => i.toString(16).padStart(64, "0");

/** `heldcaptures` over `n` documents Doc 1 … Doc n, paged as capture R77 pages them: `limit` rows from the cursor `after`, `truncated` and `next` while more follow. */
function held(n, { failAfter = null } = {}) {
  const calls = [];
  const answer = (req) => {
    const q = req.query;
    calls.push(q);
    const from = q.after ? Number(String(q.after).slice(1)) : 0;
    if (failAfter !== null && from >= failAfter) return refusedIn("INTERNAL");
    const limit = Number(q.limit);
    const end = Math.min(n, from + limit);
    const page = [];
    for (let i = from; i < end; i++) page.push({ bundle_id: `INFO-${i + 1}`, title: `Doc ${i + 1}`, capture: { sha256: sha(i + 1) } });
    const truncated = end < n;
    return ok({ ok: true, held: page, state: q.state, sort: "age", dir: "desc", limit, truncated, next: truncated ? "c" + end : null });
  };
  return { answer, calls };
}
const plane = (h) => ({ ...NONE, standards: STANDARDS, ...PUBLISHED, image: PROJECT_DOC, timeline: EVENTS, projectquestions: CONCLUDED, heldcaptures: h.answer });
const MORE = (count) => W("screen.held.more", { count });

test("R45 (G20, S11): 250 held documents: the evidence picker reaches the 250th, paging by the read's `next`, and says nothing is left out", async () => {
  const h = held(250);
  const p = await open(`/app/matter/${project}`, plane(h));
  assert.ok(text(p).includes("Doc 1"), "the first");
  assert.ok(text(p).includes("Doc 200") && text(p).includes("Doc 250"), "past the first page, the 250th");
  assert.ok(main(p).querySelectorAll("input[id^='mt-d-evidence']").length === 250, "250 documents to choose among");
  const after = h.calls.map((q) => q.after || null);
  assert.deepEqual(after, [null, "c200"], "one read, then the next page by the cursor it answered; the page asked once");
});

test("R45 (G20, S11): the event picker asks the timeline about at most the 200 captures it takes, and says so when more are held", async () => {
  const p = await open(`/app/matter/${project}`, plane(held(250)));
  const caps = p.byOp("timeline")[0].query.captures.split(",");
  assert.equal(caps.length, 200, "the timeline's own bound (events CAPTURES_MAX)");
  assert.ok(text(p).includes(MORE(200)), "the event picker says 200 of the documents were looked at");
});

test("R45 (G20, S11): more than the pages the picker reads: it shows what it read and says how many are shown", async () => {
  const h = held(1200);
  const p = await open(`/app/matter/${project}`, plane(h));
  assert.equal(h.calls.length, 5, "five pages of 200, no more");
  assert.equal(main(p).querySelectorAll("input[id^='mt-d-evidence']").length, 1000);
  assert.ok(text(p).includes(MORE(1000)), "says 1000 are shown");
});

test("R45 (G20, S11): a later page that fails is not read as the end: what was read is shown with the sentence that more are held", async () => {
  const p = await open(`/app/matter/${project}`, plane(held(250, { failAfter: 200 })));
  assert.equal(main(p).querySelectorAll("input[id^='mt-d-evidence']").length, 200);
  assert.ok(text(p).includes(MORE(200)));
});

test("R45 (G20, S11) control: a project holding fewer than a page is read once and says nothing of more", async () => {
  const h = held(3);
  const p = await open(`/app/matter/${project}`, plane(h));
  assert.equal(h.calls.length, 1);
  assert.ok(!h.calls[0].after);
  assert.equal(main(p).querySelectorAll("input[id^='mt-d-evidence']").length, 3);
  assert.ok(!text(p).includes(W("screen.held.more", { count: 3 })) && !text(p).includes(W("screen.held.more", { count: 200 })));
});

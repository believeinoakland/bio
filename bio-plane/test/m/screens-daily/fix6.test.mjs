/* screens-daily, T51 fix round 6 (G12c-casedrafts; K4570, K4571): Home asks for the drafts shared for review once, however many projects
   share one, and draws each project's drafts from its own entry of the answer. Entered by the member opening Home; every sentence is
   asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { resultOf } from "../store-request/door.mjs";
import { open as openRaw, ok, refused, text, main, settle, dmy, word } from "./page.mjs";

const open = (w, as, path, plane = {}) => openRaw(path, plane, w.boot(as));
const day = (iso) => String(iso).slice(0, 10);
/** An instant `n` days past the later of the world's clock and the wall clock (the store judges a grant's end by the wall's), in the record's stamp form. */
const ahead = (w, n) => new Date(Math.max(Date.now(), w.now()) + n * 86_400_000).toISOString().replace(/\.\d{3}Z$/, "Z");
/** The world's own `projectlist` answer, each row's `shared_drafts` set by `shared(id)` (a plain async function, not a held gate). */
const LIST = (w, as, shared) => async (req) => {
  const a = await w.door(req, as);
  const result = a && a.json && a.json.result;
  if (result) for (const r of result.projects || []) r.shared_drafts = shared(r.id);
  return a;
};
const area = (p, k) => text(p, main(p).querySelector(`[data-area="${k}"]`));
// The walker's Home: five projects (made by the real act), each with a case really published by the ceremony (`recipes.published`, the case's scope its project's)
// and a draft of its next edition shared for review by the real acts (`casedraft`, `reviewgrant`); the grant of each ends on a distinct day.
async function walker() {
  const w = await storeWorld();
  const rosa = await w.signIn("rosa", { admin: true });
  const ids = [], drafts = [], scopes = [], untils = [], cases = [];
  for (let i = 1; i <= 5; i++) {
    const id = await w.recipes.project(rosa, "Project " + i);
    const found = await w.recipes.finding(rosa, id);
    scopes.push("Scope of Project " + i);
    const pub = await w.recipes.published(rosa, { ...found, publish: { ...found.publish, body: { ...found.publish.body, scope: scopes[i - 1] } } });
    const draft = await rosa.act("casedraft", { body: { project: id, caseId: pub.case } });
    untils.push(ahead(w, 10 + i));
    await rosa.act("reviewgrant", { body: { draft: draft.draftId, recipient: "A neighbour", until: untils[i - 1] } });
    ids.push(id); drafts.push(draft.draftId); cases.push(pub.case);
    w.tick(1000);
  }
  const listed = (await rosa.read("publishedlist")).cases;
  const published = cases.map((c) => (listed.find((x) => x.case_id === c) || {}).published_at);
  return { w, rosa, ids, drafts, scopes, untils, published };
}
// One of the door's answers is the real one only through a stand-in for the door's stamp, because the world's door and the Worker's part on it (reported):
// `reviewcopy` of a member's session is stamped with her viewer by the
// Worker's door while the world's door stamps none (store-request/door.mjs `publicAnswer`), so the store is asked as the Worker's door asks it for her.
const copyOf = (w, as) => async (req) => {
  const got = await w.send({ url: `http://do/reviewcopy?draft=${encodeURIComponent(req.query.draft)}&viewer=${encodeURIComponent("member:" + as.handle)}`, headers: {}, method: "GET" });
  return ok((await got.json()).result);
};
const plane = (w, rosa, ids, casedrafts, shared) => ({
  ...(shared ? { projectlist: LIST(w, rosa, (id) => shared(ids.indexOf(id) + 1)) } : {}),
  reviewcopy: copyOf(w, rosa),
  ...(casedrafts ? { casedrafts } : {}),
});
const lineOf = (k, n) => word("screen.home.area.edition", { n: "1", case: k.scopes[n - 1], date: dmy(day(k.published[n - 1])), until: dmy(day(k.untils[n - 1])) });

test("R99, R87, R64 (G12c): Home with five projects that share a draft sends ONE casedrafts read for all of them, and draws each project's draft line as the five single reads drew it", async () => {
  const k = await walker();
  const { w, rosa, ids } = k;
  const p = await open(w, rosa, "/app", plane(w, rosa, ids));
  await settle();
  const reads = p.byOp("casedrafts");
  assert.equal(reads.length, 1, "one casedrafts read, not one for each project");
  assert.deepEqual(reads[0].query.projects.split(",").sort(), [...ids].sort(), "it names every project whose row says a draft is shared");
  assert.equal(reads[0].query.project, undefined, "and none of them singly");
  const inv = area(p, "investigation");
  for (const n of [1, 2, 3, 4, 5]) assert.ok(inv.includes(lineOf(k, n)), "the draft line of project " + n);
  assert.deepEqual(p.byOp("reviewcopy").map((r) => r.query.draft).sort(), [...k.drafts].sort(), "each draft's grant is still read once");
});

test("R99, R87, R64 (G12c): a project the viewer may not see answers as the single read answers it: drawn failed in the Investigation block, the other four drawn as before", async () => {
  const k = await walker();
  const { w, rosa, ids } = k;
  // The dead answer is the real one: the store's answer for a project the viewer has no standing in (one that does not exist answers alike, review R19).
  const DEAD = resultOf(await w.door({ url: "/api/?op=casedrafts&project=PROJ-NO-SUCH-PROJECT" }, rosa));
  assert.equal(DEAD.ok, false);
  // The world's own batch, with the hidden project's entry the dead answer.
  const hidden = async (req) => {
    const a = await w.door(req, rosa);
    a.json.result.lists[ids[3]] = DEAD;
    return a;
  };
  const p = await open(w, rosa, "/app", plane(w, rosa, ids, hidden));
  await settle();
  assert.equal(p.byOp("casedrafts").length, 1);
  const block = main(p).querySelector('[data-area="investigation"]');
  assert.equal(block.querySelectorAll('[data-state="failed"]').length, 1, "the hidden project is drawn failed, never as none");
  const inv = area(p, "investigation");
  for (const n of [1, 2, 3, 5]) assert.ok(inv.includes(lineOf(k, n)), "the draft line of project " + n);
  assert.ok(!inv.includes(lineOf(k, 4)) && !p.byOp("reviewcopy").some((r) => r.query.draft === k.drafts[3]), "nothing is drawn or read for the hidden project");
});

test("R99, R87, R64 (G12c): controls: no project sharing a draft sends no casedrafts read; the whole read failing is drawn failed once", async () => {
  const { w, rosa, ids } = await walker();
  const none = await open(w, rosa, "/app", plane(w, rosa, ids, undefined, () => ({ count: 0, newest: null })));
  await settle();
  assert.equal(none.byOp("casedrafts").length, 0, "no draft read when no row says one is shared");
  const down = await open(w, rosa, "/app", plane(w, rosa, ids, refused("STORE_DID_NOT_ANSWER", null, 502)));
  await settle();
  assert.equal(down.byOp("casedrafts").length, 1);
  assert.equal(main(down).querySelector('[data-area="investigation"]').querySelectorAll('[data-state="failed"]').length, 1, "one failed row, not one for each project");
});

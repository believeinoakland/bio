/* Fix round 10 (plan item 134; K5265; walk T51 alpha, causes A-02, A-17, F-B9, F-B10 (a)): the screens' acts and searches at their interface,
   over the REAL store where the case is a member's, and on the real served page. Every sentence is asserted as `word(key, vars)` (R34). */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { open, ok, text, button, press, beside, last, main, word, withScreens, settle } from "./page.mjs";
import { forward } from "../../../src/screens-daily/forward.mjs";

const timeout = { timeout: 300000 };
const openW = (w, as, path, plane = {}, o = {}) => open(path, plane, { ...w.boot(as), screens: withScreens("document", "action", "question", "project"), ...o });

/* ---------- A-02 (R3, R58): "Forward to a member" sends the member's id, not her handle ---------- */

/** Real to-dos: a question in a project and a document captured at rosa's request from an address of its own, whose authority nobody has
 *  determined: after the scheduler's next round an administrator holds a to-do for it, one that can be forwarded (a check request cannot be). */
async function team() {
  const w = await storeWorld();
  const founder = await w.signIn("admin");   // the founder: id `admin`, handle `founder`
  const rosa = await w.signIn("rosa", { admin: true });
  const mo = await w.signIn("mo", { capabilities: ["contribute", "create_projects"] });
  const project = await w.recipes.project(rosa, "Council business");
  const q = await w.recipes.question(rosa, project, { title: "What was decided", text: "What did the council decide?" });
  const address = "https://site1.example.org/minutes.html";
  w.script(address, async () => new Response("<html><head><title>Minutes 1</title></head><body><p>The council met.</p></body></html>", { status: 200, headers: { "content-type": "text/html" } }));
  await rosa.act("capturerequest", { body: { address, target: q.id } });
  await w.door({ url: "/api/?op=capturerequestdrain", init: { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } }, { token: w.env.DAEMON_TOKEN });
  await w.tick(120_000);
  const task = (await rosa.read("tasks")).tasks[0];
  assert.ok(task, "the to-do");
  return { w, founder, rosa, mo, task };
}
const toField = (p) => p.doc.getElementById(button(p, "taskforward").dataset.f + "-to");
const assigneeOf = async (as, id) => (await as.read("tasks")).tasks.find((t) => t.id === id)?.assignee;

test("R3, R58 (A-02): the choice to forward to holds each member by her member id and names her by handle; forwarding to the founder (id admin, handle founder) is answered, and the task is hers by id", timeout, async () => {
  const { w, rosa, task } = await team();
  const p = await openW(w, rosa, "/app/queue");
  await settle();
  const sel = toField(p);
  assert.ok(sel, "the choice of a member");
  const options = sel.querySelectorAll("option").map((o) => [o.value, o.textContent.trim()]);
  assert.ok(options.some(([v, t]) => v === "admin" && t === "founder"), "the founder: value her id, text her handle: " + JSON.stringify(options));
  assert.ok(options.some(([v, t]) => v === "mo" && t === "mo"), "control: mo, whose id is her handle");
  const b = await press(p, "taskforward", { values: { [sel.id]: "admin" } });
  assert.equal(last(p, "taskforward").body.to, "admin", "the id is sent, not the handle");
  assert.ok(!beside(p, b).includes(word("refusal.NO_SUCH_MEMBER")), "no refusal of a member who is on the team: " + beside(p, b));
  assert.equal(await assigneeOf(rosa, task.id), "admin", "the task is the founder's, by id");
});

test("R3, R58 (A-02): a handle typed is sent as the id the roster gives it (the founder's `founder` as `admin`); one the roster does not hold is sent as typed; oneself is refused whichever name is used", () => {
  const roster = (members) => ({ data: { roster: { state: "ok", value: { members } } }, me: { member: "mai", handle: "mai" } });
  const cs = (v) => ({ value: () => v });
  const rows = [{ member_id: "admin", handle: "founder", status: "active" }, { member_id: "rosa", handle: "rosa", status: "active" }, { member_id: "mai-id", handle: "mai", status: "active" }];
  const f = forward();
  assert.deepEqual(f.to(cs("@founder"), roster(rows), "x"), { to: "admin" }, "a typed handle is looked up");
  assert.deepEqual(f.to(cs("admin"), roster(rows), "x"), { to: "admin" }, "an id chosen is sent as it is");
  assert.deepEqual(f.to(cs("nobody"), roster(rows), "x"), { to: "nobody" }, "not on the roster: sent as typed, for the plane to refuse");
  assert.deepEqual(f.to(cs("mai"), { ...roster(rows), me: { member: "mai-id", handle: "mai" } }, "x"), { refuse: "refusal.ALREADY_THEIRS" }, "oneself by handle");
  assert.deepEqual(f.to(cs("mai-id"), { ...roster(rows), me: { member: "mai-id", handle: "mai" } }, "x"), { refuse: "refusal.ALREADY_THEIRS" }, "oneself by id");
  assert.deepEqual(f.to(cs("founder"), { data: {}, me: {} }, "x"), { to: "founder" }, "no roster answered: the typed box's word as typed");
});

/* ---------- A-17 (R3, R50; DEC-299): "Done: ..." names the act of the button pressed, not the op's one label ---------- */

const FINDING_KIND = "shared-inquiry-concluded-by-another-project";
const doneWords = (key) => word("queue.done", { what: word(key) });

test("R3, R50 (A-17): Defer says \"Done: Defer\" and Dismiss \"Done: Dismiss with a reason\" (one op, `proposedispose`); each from the real store's finding", timeout, async () => {
  const w = await storeWorld();
  const rosa = await w.signIn("rosa", { admin: true });
  const mai = await w.signIn("mai");
  const [p1, p2] = [await w.recipes.project(rosa, "Pothole repairs"), await w.recipes.project(rosa, "Coliseum")];
  for (const p of [p1, p2]) { await rosa.act("projectinvite", { query: { projectId: p, handle: "mai" } }); await mai.act("projectjoin", { query: { projectId: p } }); }
  for (const i of [1, 2]) {
    const doc = await w.recipes.page(rosa, `Source ${i}`, { project: p1 });
    const q = await w.recipes.question(rosa, p1, { title: `Question ${i}`, text: `Is ${i} so?`, legs: [{ target: doc.bundle, role: "supports" }], draw: true });
    await rosa.act("drawquestion", { query: { project: p2, inquiry: q.id, note: "" } });
    await rosa.act("conclude", { query: { target: q.id, project: p1, reading: `Reading ${i} holds on the record.`, falsifier: `The record shows otherwise for ${i}.` } });
  }
  await w.tick(120_000);
  assert.equal((await mai.read("queue")).items.filter((i) => i.kind === FINDING_KIND).length, 2, "two findings");
  const p = await openW(w, mai, "/app/queue");
  await settle();
  const at = (to) => main(p).querySelectorAll('button[data-act="proposedispose"]').findIndex((b) => b.dataset.to === to);
  await press(p, "proposedispose", { nth: at("deferred"), reason: "Wait for the clerk" });
  assert.equal(last(p, "proposedispose").body.to, "deferred");
  assert.ok(text(p).includes(doneWords("screen.queue.defer")), "Defer: " + text(p).slice(0, 300));
  assert.ok(!text(p).includes(doneWords("act.proposedispose.label.queue")), "not the op's label");
  await press(p, "proposedispose", { nth: at("dismissed"), reason: "Not relevant to us" });
  assert.equal(last(p, "proposedispose").body.to, "dismissed");
  assert.ok(text(p).includes(doneWords("act.proposedispose.label.queue")), "control: Dismiss keeps the op's label");
  assert.ok(!text(p).includes(doneWords("screen.queue.defer")), "and no longer says Defer");
});

test("R3, R50 (A-17): Turn back on says \"Done: Turn back on\", not the op's label \"Mute a kind\" (one op, `queuemute`)", timeout, async () => {
  const w = await storeWorld();
  const rosa = await w.signIn("rosa", { admin: true });
  const pothole = await w.recipes.project(rosa, "Pothole repairs");
  await rosa.act("queuemute", { body: { case: pothole, kinds: ["step-cost-shared"] } });
  const p = await openW(w, rosa, "/app/queue");
  await settle();
  await press(p, "queuemute", { nth: main(p).querySelectorAll('button[data-act="queuemute"]').findIndex((b) => b.dataset.unmute === "kind") });
  assert.equal(last(p, "queuemute").body.unmute, true);
  assert.ok(text(p).includes(doneWords("queue.muted.unmute")), "Turn back on: " + text(p).slice(0, 300));
  assert.ok(!text(p).includes(doneWords("act.queuemute.label.queue")), "not the op's label");
});

test("R42, R50 (A-17): Decline says \"Done: Decline\" and Grant \"Done: Grant\" (one op, `projectrequestanswer`)", timeout, async () => {
  for (const [nth, key, other] of [[1, "screen.home.request.decline", "screen.home.request.grant"], [0, "screen.home.request.grant", "screen.home.request.decline"]]) {
    const w = await storeWorld();
    const rosa = await w.signIn("rosa", { admin: true });
    const dev = await w.signIn("dev");
    const project = await w.recipes.project(rosa, "Coliseum");
    await rosa.act("projectvisibilityset", { query: { projectId: project, setting: "discoverable", reason: "open to ask" } });
    await dev.act("projectrequest", { query: { projectId: project, comment: "I live next door" } });
    const p = await openW(w, rosa, "/app/queue");
    await settle();
    await press(p, "projectrequestanswer", { nth });
    assert.ok(text(p).includes(doneWords(key)), key + ": " + text(p).slice(0, 300));
    assert.ok(!text(p).includes(doneWords(other)), "control: not the other answer");
    assert.ok(!text(p).includes(doneWords("act.projectrequestanswer.label.queue")), "not the op's one label");
  }
});

/* ---------- F-B9 (R56): OR, NOT, parentheses and quoted phrases are searched in passages too ---------- */

/** The team: a member, her project, and two documents held and read (their passages are in the text index), by the real acts; the plane answers every route. */
let shared = null;
const lab = () => (shared ||= (async () => {
  const w = await storeWorld({ now: Date.now() });
  const mem = await w.signIn("mem", { capabilities: ["contribute", "create_projects"] });
  const project = await w.recipes.project(mem, "Rates");
  await w.recipes.page(mem, "Sewer rate memo", { paragraphs: ["The sewer ordinance sets the rate for every household.", "The council voted on the budget in March."], project });
  await w.recipes.page(mem, "Zoning notes", { paragraphs: ["Nothing here concerns water."], project });
  return { w, mem };
})());
const asPlane = async (path) => { const L = await lab(); return open(path, {}, { ...L.w.boot(L.mem), screens: withScreens("document", "person", "project") }); };
const asked = (p, op) => p.byOp(op).map((r) => r.query.q);

test("R56 (F-B9): a query with OR, NOT, parentheses or a quoted phrase and no field term is sent to the passages route, each term as a passage term and the operators as written; the fields route gets it as written; the subjects route is not asked", async () => {
  for (const [typed, passage] of [
    ["ordinance OR zzzqqq", "passage:ordinance OR passage:zzzqqq"],
    ['"sewer ordinance" budget', 'passage:"sewer ordinance" passage:budget'],
    ["(rent OR ordinance) NOT zoning", "(passage:rent OR passage:ordinance) NOT passage:zoning"],
    ["ordinance AND council", "passage:ordinance AND passage:council"],
    ['"every household"', 'passage:"every household"'],
  ]) {
    const p = await asPlane("/app/finder/" + typed);
    await settle();
    assert.deepEqual(asked(p, "meaningrows"), [passage], typed);
    assert.equal(last(p, "meaningrows").query.rows, "passage");
    assert.deepEqual(asked(p, "search"), [typed], "the fields route: as written (" + typed + ")");
    assert.equal(p.byOp("subjectsnamed").length, 0, "the subjects route reads the words of a name, not the language's operators");
  }
});

test("R56 (F-B9): a query with a field term goes to the fields route alone, and an OR never joins the routes; controls: plain words and `passage:` terms are routed as before", async () => {
  for (const typed of ["capture:b OR zed", "capture:b zed", 'title:"a b" OR c']) {
    const p = await asPlane("/app/finder/" + typed);
    await settle();
    assert.deepEqual(asked(p, "search"), [typed]);
    assert.equal(p.byOp("meaningrows").length, 0, typed);
  }
  const plain = await asPlane("/app/finder/work orders");
  assert.deepEqual([asked(plain, "meaningrows"), asked(plain, "subjectsnamed")], [["passage:work passage:orders"], ["work orders"]]);
  const only = await asPlane("/app/finder/passage:a OR passage:b");
  assert.deepEqual([asked(only, "meaningrows"), only.byOp("search").length], [["passage:a OR passage:b"], 0]);
});

test("R56, R12 (F-B9): where the fields route holds nothing and the passages route holds some, the real plane's answer is drawn for an OR query, a quoted phrase and a NOT, never \"nothing matches\"", async () => {
  const L = await lab();
  for (const typed of ["ordinance OR zzzqqq", '"sewer ordinance"', "ordinance NOT zoning"]) {
    const fields = (await L.mem.read("search", { query: { q: typed } })).total;
    const rows = await L.mem.read("meaningrows", { query: { q: typed.replace(/[^\s()"]*"[^"]*"|[^\s()"]+/g, (t) => (/^(AND|OR|NOT)$/.test(t) ? t : "passage:" + t)), rows: "passage" } });
    assert.ok(rows.total > 0, "the plane answers the passage question for " + typed + ": " + JSON.stringify({ ...rows, grain: undefined, gate: undefined }).slice(0, 600));
    const p = await asPlane("/app/finder/" + typed);
    await settle();
    const t = text(p);
    assert.ok(t.includes(word("screen.finder.route.passages")), "the passages section is drawn for " + typed + " (fields held " + fields + ")");
    assert.ok(!t.includes(word("screen.finder.noresult", { q: typed })), "no false \"nothing\" for " + typed);
  }
});

const NOHITS = (widen) => ok({ ok: true, total: 0, hits: [], limit: 50, offset: 0, widen });
const PASSAGES = (rows, extra = {}) => ok({ ok: true, rows, count: rows.length, total: rows.length, limit: 200, offset: 0, ...extra });

/* ---------- F-B10 (a) (R78): the widening is read from the passages route too ---------- */

test("R78 (F-B10 (a)): when no route holds a match, the wider reading of the passages route (`widen.total` above 0) draws the partial sentence and its count; fields' wins when it has one; controls: 0 or none on both says nothing matches", async () => {
  const q = "alpha zzzqqq";
  const w = (total) => ({ interpretation: "OR", total, q, detail: "d" });
  const drawn = async (fields, passages) => {
    const p = await open("/app/finder/" + q, { search: NOHITS(fields), meaningrows: PASSAGES([], { total: 0, widen: passages }) });
    await settle();
    return text(p);
  };
  const onlyPassages = await drawn(null, w(3));
  assert.ok(onlyPassages.includes(word("screen.finder.noresult.partial", { q })), "the partial sentence: " + onlyPassages.slice(0, 300));
  assert.ok(onlyPassages.includes(word("screen.finder.widen", { n: "3" })), "its count");
  assert.ok(!onlyPassages.includes(word("screen.finder.noresult", { q })), "not the no-match sentence");
  const both = await drawn(w(2), w(9));
  assert.ok(both.includes(word("screen.finder.widen", { n: "2" })), "the fields route's wider reading, as before, when it has one");
  for (const none of [await drawn(null, null), await drawn(w(0), w(0)), await drawn(null, w(0))]) {
    assert.ok(none.includes(word("screen.finder.noresult", { q })), "control: nothing matches");
    assert.ok(!none.includes(word("screen.finder.noresult.partial", { q })));
  }
});

/* ---------- R28 (Since you last looked): instants are compared as instants, not as text ---------- */

/** The answer of `op` as the real store gives it, its result changed in place by `fn`. */
const shaped = (w, as, fn) => async (req) => { const a = await w.boot(as).door(req); fn(a.json.result); return a; };

test("R28: a project changed in the same second as her last look, before it, is not drawn under Since you last looked; one changed after it is (the look carries milliseconds, a change does not)", timeout, async () => {
  const w = await storeWorld();
  const rosa = await w.signIn("rosa", { admin: true });
  for (const name of ["Before the look", "Same second", "After the look"]) await w.recipes.project(rosa, name);
  const at = { "Before the look": "2026-10-26T07:42:46Z", "Same second": "2026-10-26T07:42:47Z", "After the look": "2026-10-26T07:42:48Z" };
  const p = await openW(w, rosa, "/app", {
    projectlist: shaped(w, rosa, (r) => { for (const x of r.projects) x.lastChange = at[x.name]; }),
    lookedsince: () => ok({ since: "2026-10-26T07:42:47.304Z" }),
  });
  await settle();
  const t = text(p);
  const since = t.slice(t.indexOf(word("screen.home.since")));
  assert.ok(since.includes("After the look"), "changed after the look: drawn");
  assert.ok(!since.includes("Same second"), "changed in the second of the look, before it: not drawn");
  assert.ok(!since.includes("Before the look"), "control: changed before: not drawn");
});

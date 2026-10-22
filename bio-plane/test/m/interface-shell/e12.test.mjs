/* interface-shell R123 (fix round 5, E12; PERFORMANCE P9): one request per `(op, query)` per load. The real screens of the nine modules are loaded
   through the harness over the fixtures' plane and every request the page sends is counted; a read identical to one in flight or answered in this
   load is shared, never sent again. Each test was seen failing first. */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, pending, ADMIN, MEMBER, settle } from "./harness.mjs";

const MODS = ["screens-settings", "screens-intake", "screens-daily", "screens-inquiry", "screens-entry", "screens-wizards", "screens-investigate", "screens-publish", "screens-action"];
const REAL = []; let GUIDE = null;
for (const m of MODS) { const x = await import(`../../../src/${m}/index.mjs`); REAL.push(...x.SCREENS); if (x.GUIDE) GUIDE = x.GUIDE; }
const PLANE = { whoami: ok({ ...ADMIN, capabilities: ["contribute", "administer"] }), assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
/* every request as `op query body`, the marks the shell adds (`op`, `background`) left out */
const sigs = (p) => p.requests.map((r) => r.op + " " + JSON.stringify(Object.fromEntries(Object.entries(r.query).filter(([k]) => k !== "op" && k !== "background"))) + (r.body === undefined ? "" : " " + JSON.stringify(r.body)));
const repeats = (p) => { const n = new Map(); for (const s of sigs(p)) n.set(s, (n.get(s) || 0) + 1); return [...n].filter(([, c]) => c > 1).map(([s, c]) => s + " x" + c); };

for (const [name, path] of [["Home", "/app"], ["Queue", "/app/queue"], ["Project", "/app/project/P1"], ["Held", "/app/held"]]) {
  test(`R123 (E12) loading ${name} through the real screens sends each (op, query) at most once`, async () => {
    const p = await boot({ screens: REAL, guide: GUIDE, path, plane: PLANE });
    assert.deepEqual(repeats(p), [], `${name} repeats`);
  });
}

for (const [name, path] of [["Home", "/app"], ["Queue", "/app/queue"]]) {
  test(`R7 R123 (E12, K4530) ${name} reads the whole open queue, so the frame sends no count read of its own and the masthead draws the list's number`, async () => {
    const p = await boot({ screens: REAL, guide: GUIDE, path, plane: { ...PLANE, queue: (req) => (req.query.count ? ok({ ok: true, member: "rosa", count: 99 }) : ok({ items: [{ id: "a", class: "OBLIGATION" }, { id: "b", class: "FINDING" }, { id: "c", class: "CONDITION" }] })) } });
    assert.equal(p.byOp("queue").filter((r) => r.query.count).length, 0, "no count read");
    const n = p.root().querySelector(".cs-rail a .count");
    assert.equal(n && n.textContent, "3", "the sum of the list's three kinds, not a count");
  });
}

test("R7 R123 (E12) control: Project (no open list) asks the frame's one count read", async () => {
  const p = await boot({ screens: REAL, guide: GUIDE, path: "/app/project/P1", plane: PLANE });
  assert.equal(p.byOp("queue").filter((r) => r.query.count).length, 1);
});

/* a screen of the registry id `home` that reads what the frame also reads, and an act that re-reads it; its functions are self-contained (R21), the reads
   carried into them as data */
const stand = (reads, draws = true) => ({ id: "home", words: [], reads: new Function("view", `return ${JSON.stringify(reads)};`),
  acts: [{ op: "taskresolve", send: new Function("view", "el", "cs", "extra", 'return { body: { id: "x" } };'), rereads: Object.keys(reads) }],
  render: new Function("cs", "view", draws
    ? 'return cs.state("identity", view, function (v) { return \'<p id="seen">\' + cs.esc(v.display_name) + "</p>"; }) + cs.act("taskresolve", { label: "act.taskresolve.label.home" });'
    : 'return "<p>x</p>";') });
const reading = { identity: { op: "groupidentity" } };

test("R123 (E12) a screen's read identical to the frame's, still in flight, is the frame's one request, and the screen draws its answer", async () => {
  let release, asked = 0;
  const slow = () => { asked++; return new Promise((r) => { release = () => r(ok({ ok: true, display_name: "River Town" })); }); };
  const p = await boot({ screens: [stand(reading)], plane: { ...PLANE, groupidentity: slow } });
  assert.equal(asked, 1, "one request out for the two readers");
  release();
  await settle();
  assert.equal(p.byOp("groupidentity").length, 1);
  assert.equal(p.doc.getElementById("seen").textContent, "River Town", "the screen drew the shared answer");
});

test("R123 (E12) a read the frame already had answered in this load is not sent again by the screen", async () => {
  /* the frame's answer is back before the screen reads: the screen's `groupidentity` is not sent */
  const p = await boot({ screens: [stand(reading)], plane: PLANE });
  assert.equal(p.byOp("groupidentity").length, 1);
  assert.equal(p.doc.getElementById("seen").textContent, "River Town");
});

test("R123 (E12) control: an act's declared re-reads still re-read", async () => {
  let n = 0;
  const p = await boot({ screens: [stand(reading)], plane: { ...PLANE, groupidentity: () => ok({ ok: true, display_name: "Name " + ++n }), taskresolve: ok({ ok: true }) } });
  assert.equal(p.byOp("groupidentity").length, 1);
  assert.equal(p.doc.getElementById("seen").textContent, "Name 1");
  await p.click('button[data-act="taskresolve"]');
  assert.equal(p.byOp("groupidentity").length, 2, "the act's re-read asks again");
  assert.equal(p.doc.getElementById("seen").textContent, "Name 2", "and draws the new answer");
});

test("R123 (E12) control: reads that differ in a parameter are each sent, an identical one inside the screen once", async () => {
  const two = { a: { op: "queue", query: { muted: "true" } }, b: { op: "queue", query: { aside: "true" } }, c: { op: "queue", query: { muted: "true" } } };
  const p = await boot({ screens: [stand(two, false)] });
  const q = p.byOp("queue").map((r) => Object.keys(r.query).filter((k) => k !== "op" && k !== "background").join());
  assert.deepEqual(q.sort(), ["aside", "count", "muted"], "the frame's count, aside and muted once each; the third (muted) shared");
});

test("R123 (E12) control: a read that is no read (an act's op) is never shared, and a member without the frame's session reads nothing twice", async () => {
  const p = await boot({ screens: [stand(reading)], plane: { ...PLANE, whoami: ok(MEMBER), taskresolve: ok({ ok: true }) } });
  await p.click('button[data-act="taskresolve"]');
  await p.click('button[data-act="taskresolve"]');
  assert.equal(p.byOp("taskresolve").length, 2, "each press is its own request");
});

test("R123 (E12) control: a visit to the screen again, and a refresh of a read, ask again; the frame's one answer is not asked again by a revisit", async () => {
  const p = await boot({ screens: [stand(reading)], plane: PLANE });
  assert.equal(p.byOp("groupidentity").length, 1);
  await p.back("/app");
  assert.equal(p.byOp("groupidentity").length, 2, "the new route asks for its own");
});

test("R123 (E12) two readers of one request are each handed their own copy: a screen that changes its answer changes nobody else's", async () => {
  const same = { a: { op: "queue", query: { muted: "true" } }, c: { op: "queue", query: { muted: "true" } } };
  const draws = new Function("cs", "view", 'var a = view.data.a, c = view.data.c; if (a.state === "ok" && c.state === "ok" && !view.ui.m) { view.ui.m = 1; a.value.items.push({ id: "mut" }); } return \'<p id="n">\' + (c.state === "ok" ? c.value.items.length : "-") + "</p>";');
  const p = await boot({ screens: [{ ...stand(same, false), render: draws }], plane: { ...PLANE, queue: (req) => (req.query.count ? ok({ ok: true, member: "mai", count: 1 }) : ok({ items: [{ id: "a" }] })) } });
  assert.equal(p.byOp("queue").filter((r) => r.query.muted).length, 1, "one request");
  assert.equal(p.doc.getElementById("n").textContent, "1");
});

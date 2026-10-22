/* interface-shell R122 and R93's frame (fix round 4, P9; K4429): the frame's shared reads. `bootstrap` is asked once per page load and its answer handed to the
   frame and the screen; the frame asks `queue` for the count alone, and the list is read by the screen that draws it. Each test counts the read set at the
   shell's interface (the requests the page sends over a scripted plane), as the screens' own tests do for theirs. Each test was seen failing first. */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, silent, queueOf, settle, fitSend, ADMIN } from "./harness.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const BOOT = { ok: true, claimed: true, test_instance: false, marker: "first" };
/* a screen that reads `bootstrap` as home, setup, connect, security and updates do (`{op: "bootstrap"}`, no query, no body), and draws what it answered */
const reading = (id) => ({ id, words: [], reads: () => ({ boot: { op: "bootstrap" } }),
  acts: id === "home" ? [{ op: "taskresolve", send: fitSend("taskresolve"), rereads: ["boot"] }] : [],
  render: (cs, view) => cs.state("boot", view, (v) => '<p id="seen">' + cs.esc(v.marker) + "</p>") + cs.act("taskresolve", { label: "act.taskresolve.label.home" }) });
const SCREENS = ["home", "queue", "project"].map(reading);

for (const [id, path] of [["home", "/app"], ["queue", "/app/queue"], ["project", "/app/project/P1"]]) {
  test(`R122 (P9) loading ${id} sends exactly one bootstrap, though the screen reads it too, and the screen draws that answer; control: a new page load sends one again`, async () => {
    const p = await boot({ screens: SCREENS, path, plane: { bootstrap: ok(BOOT) } });
    assert.equal(p.byOp("bootstrap").length, 1, "the page asks once");
    assert.equal(p.doc.getElementById("seen").textContent, "first", "the screen was handed the answer");
    const q = await boot({ screens: SCREENS, path, plane: { bootstrap: ok(BOOT) } });
    assert.equal(q.byOp("bootstrap").length, 1, "a new page load sends one again");
  });
}

test("R122 (P9) the screen's read waits for the page's bootstrap while it is still out and draws its answer; a first answer that was none is asked for again", async () => {
  let release, asked = 0;
  const slow = () => { asked++; return new Promise((r) => { release = () => r(ok(BOOT)); }); };
  const p = await boot({ screens: [SCREENS[0]], path: "/app", plane: { bootstrap: slow } });
  assert.equal(p.doc.getElementById("seen"), null, "nothing answered yet");
  release();
  await settle();
  assert.equal(asked, 1, "one request");
  assert.equal(p.doc.getElementById("seen").textContent, "first");
  /* control: the page's own request got no answer, so the screen asks for itself */
  let n = 0;
  const q = await boot({ screens: [SCREENS[0]], path: "/app", plane: { bootstrap: () => (++n === 1 ? silent : ok(BOOT)) } });
  assert.equal(n, 2, "asked again");
  assert.equal(q.doc.getElementById("seen").textContent, "first");
});

test("R122 (P9) control: after a successful act, or a change of session, the screen's read asks again, so a screen that re-reads after an act sees the new state", async () => {
  let n = 0;
  const p = await boot({ screens: [SCREENS[0]], path: "/app", plane: { whoami: ok({ ...ADMIN, capabilities: ["contribute", "administer"] }), bootstrap: () => ok({ ...BOOT, marker: "load-" + ++n }), taskresolve: ok({ ok: true }) } });
  assert.equal(p.byOp("bootstrap").length, 1);
  assert.equal(p.doc.getElementById("seen").textContent, "load-1");
  await p.click('button[data-act="taskresolve"]');
  assert.equal(p.byOp("bootstrap").length, 2, "the re-read after the act asks again");
  assert.equal(p.doc.getElementById("seen").textContent, "load-2", "and draws the new answer");
});

/* ---------- the queue: the count for the frame, the list for the screen ---------- */
const ITEMS = [{ id: "a", class: "OBLIGATION" }, { id: "b", class: "OBLIGATION" }, { id: "c", class: "FINDING" }, { id: "d", class: "CONDITION" }, { id: "e", class: "CONDITION" }];
const LIST = { id: "queue", words: [], reads: () => ({ list: { op: "queue" } }), acts: [], render: (cs, view) => cs.state("list", view, () => "<p>list</p>") };
const NONE = { id: "members", words: [], reads: () => ({}), acts: [], render: () => "<p>x</p>" };
const number = (p) => { const e = p.root().querySelector(".cs-rail a .count"); return e ? e.textContent : null; };
const tip = (p) => { const e = p.root().querySelector('.cs-mast [data-kind="todo"]'); return e ? e.getAttribute("data-tip") : null; };
const h = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

test("R93 R122 (P9) R7 (E12, K4530) loading a screen that reads the whole open queue sends that one list read and no count read of the frame's; the number is the sum of the list's three kinds and the explanation names them", async () => {
  const p = await boot({ screens: [LIST], path: "/app/queue", plane: { queue: queueOf(ITEMS) } });
  const reads = p.byOp("queue");
  assert.equal(reads.filter((r) => r.query.count).length, 0, "the frame asks for no count: the screen's list gives the number");
  assert.equal(reads.filter((r) => !r.query.count).length, 1, "the list is read once, by the screen alone");
  assert.equal(number(p), "5", "the number the rail draws");
  assert.equal(tip(p), h(word("shell.queue.waiting", { n: 5, todo: 2, noticed: 1, status: 2 })) + '<span class="more">' + h(word("shell.queue.open")) + "</span>");
});

test("R7 (E12, K4530) control: a whole open list that was refused or not answered leaves the frame to ask for the count, once, after it; the number is the count", async () => {
  for (const list of [silent, ok({ ok: false, reason: "NOPE", code: "NOPE" })]) {
    const p = await boot({ screens: [LIST], path: "/app/queue", plane: { queue: (req) => (req.query.count ? ok({ ok: true, member: "mai", count: 4 }) : list) } });
    assert.deepEqual(p.byOp("queue").map((r) => !!r.query.count), [false, true], "the list, then one count read");
    assert.equal(number(p), "4");
  }
});

test("R93 (P9) a screen that reads no list gets the number from the count and sends no list read at all; the explanation is not drawn with a kind unanswered", async () => {
  const p = await boot({ screens: [NONE], path: "/app/members", plane: { queue: queueOf(ITEMS) } });
  assert.deepEqual(p.byOp("queue").map((r) => !!r.query.count), [true], "one read, the count");
  assert.equal(number(p), "5");
  assert.ok(![...p.root().querySelectorAll("[data-tip]")].some((e) => /\{|undefined|NaN/.test(e.getAttribute("data-tip") || "")), "no sentence with an empty fill");
  assert.equal(tip(p), null, "no sentence over a kind that was not answered");
});

test("R93 (P9) control: a list cut by its limit gives the frame no kinds, and a read of the queue's other lists or of one project's moves nothing", async () => {
  const cut = { id: "queue", words: [], reads: () => ({ list: { op: "queue", query: { limit: 2 } } }), acts: [], render: (cs, view) => cs.state("list", view, () => "<p>list</p>") };
  const plane = { queue: (req) => (req.query.count ? ok({ ok: true, member: "mai", count: 5 }) : ok({ items: ITEMS.slice(0, 2), truncated: true })) };
  const p = await boot({ screens: [cut], path: "/app/queue", plane });
  assert.equal(number(p), "5", "the count stands");
  assert.equal(p.byOp("queue").filter((r) => r.query.count).length, 1, "a cut list gives no number, so the frame asks for the count once");
  assert.equal(tip(p), null, "two of five items name no kinds");
  const other = { id: "queue", words: [], reads: () => ({ muted: { op: "queue", query: { muted: "true" } }, mine: { op: "queue", query: { project: "P1" } } }), acts: [], render: () => "<p>x</p>" };
  const q = await boot({ screens: [other], path: "/app/queue", plane: { queue: (req) => (req.query.count ? ok({ ok: true, member: "mai", count: 5 }) : ok({ items: [{ id: "z", class: "OBLIGATION" }] })) } });
  assert.equal(number(q), "5", "a muted or a project's list is not the member's open list");
});

test("R93 (P9) control: with no count the frame draws no number, and with a count of zero none either", async () => {
  const silentQ = await boot({ screens: [NONE], path: "/app/members", plane: { queue: silent } });
  assert.equal(number(silentQ), null);
  const zero = await boot({ screens: [NONE], path: "/app/members", plane: { queue: queueOf([]) } });
  assert.equal(number(zero), null, "never at zero");
});

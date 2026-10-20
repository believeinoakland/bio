/* interface-shell R10, R13, R19, R27 (T51 fix round; K4194 B15, K4195 B16): a redraw keeps what the member did (a chosen file, ticked
   rows) and what they typed where the screen drew nothing new, and never restores typed text over a value the screen drew from a
   read that arrived since. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "./harness.mjs";

/* a read held back until `release()` */
function gate() {
  let release; const p = new Promise((r) => { release = r; });
  return { wait: () => p, release };
}
const LATE = (g, value) => ({ queue: async () => { await g.wait(); return ok(value); } });

const FILE = {
  id: "home", words: [["screen.home.t.file", "fx file", false]],
  reads() { return { late: { op: "queue" } }; },
  render(cs, view) { return "<h1>x</h1>" + cs.field("pic", "screen.home.t.file", { type: "file" }) + cs.state("late", view, () => "<p id=\"done\">read</p>"); },
  acts: [],
};
const ROWS = {
  id: "home", words: [["screen.home.t.rows", "fx rows", false]],
  reads() { return { late: { op: "queue" } }; },
  render(cs, view) {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
    return "<h1>x</h1>" + cs.rows({ id: "r", cols: ["screen.home.t.rows"], items, key: (i) => i.id, cells: (i) => [cs.esc(i.id)], pick: true })
      + cs.state("late", view, () => "<p id=\"done\">read</p>");
  },
  acts: [],
};
const TEXT = {
  id: "home", words: [["screen.home.t.title", "fx title", false]],
  reads() { return { late: { op: "queue" } }; },
  render(cs, view) {
    const drawn = view.data.late && view.data.late.state === "ok" && view.data.late.value.title ? view.data.late.value.title : "";
    return "<h1>x</h1>" + cs.field("title", "screen.home.t.title", { value: drawn }) + cs.field("note", "screen.home.t.title", { area: true })
      + '<button type="button" id="again" data-shell="theme" data-theme-to="light">go</button>';
  },
  acts: [],
};

test("R10 K4194 B15 a file chosen before the screen's reads arrived is still chosen after the redraw they cause (control: no file chosen draws none)", async () => {
  const g = gate();
  const p = await boot({ screens: [FILE], plane: LATE(g, { items: [1] }) });
  const input = p.doc.getElementById("pic");
  const file = { name: "lease.pdf", size: 3 };
  input.files = [file];
  g.release(); await p.settle();
  assert.ok(p.doc.getElementById("done"), "the read arrived and the screen redrew");
  const after = p.doc.getElementById("pic");
  assert.equal(after.files.length, 1, "the file is still chosen");
  assert.equal(after.files[0], file);
  assert.equal(after.parentElement.localName, "div", "drawn in its field");
  const g2 = gate();
  const q = await boot({ screens: [FILE], plane: LATE(g2, { items: [1] }) });
  g2.release(); await q.settle();
  assert.equal(q.doc.getElementById("pic").files.length, 0, "control: nothing chosen, nothing kept");
});

test("R19 K4194 I-08 four rows ticked across a redraw stay picked (control: the redraw changes no pick)", async () => {
  const g = gate();
  const p = await boot({ screens: [ROWS], plane: LATE(g, { items: [1] }) });
  const pick = (id) => p.click(p.doc.getElementById("pick-r-" + id));
  await pick("a"); await pick("b");
  g.release(); await p.settle();
  await pick("c"); await pick("d");
  for (const id of ["a", "b", "c", "d"]) assert.equal(p.doc.getElementById("pick-r-" + id).checked, true, id + " is picked");
  assert.equal(p.root().querySelector(".cs-hold .n").textContent.replace(/\D/g, ""), "4");
  await pick("b");
  assert.deepEqual(["a", "b", "c", "d"].map((id) => p.doc.getElementById("pick-r-" + id).checked), [true, false, true, true], "control: unticking one changes only it");
});

test("K4195 B16 a value the screen drew from a read that arrived after the first draw is shown, not the empty snapshot of before it", async () => {
  const g = gate();
  const p = await boot({ screens: [TEXT], plane: LATE(g, { title: "From the read" }) });
  assert.equal(p.doc.getElementById("title").value, "");
  g.release(); await p.settle();
  assert.equal(p.doc.getElementById("title").value, "From the read");
});

test("K4195 B16 text typed before the read survives where the read gave none; typed over a value the read gave, the read's value is what is drawn (control: an unrelated redraw keeps typing)", async () => {
  const g = gate();
  const p = await boot({ screens: [TEXT], plane: LATE(g, { title: "" }) });
  p.doc.getElementById("title").value = "typed by Mai";
  p.doc.getElementById("note").value = "a note";
  g.release(); await p.settle();
  assert.equal(p.doc.getElementById("title").value, "typed by Mai", "the read gave none: what was typed stays");
  assert.equal(p.doc.getElementById("note").value, "a note");

  const g2 = gate();
  const q = await boot({ screens: [TEXT], plane: LATE(g2, { title: "From the read" }) });
  q.doc.getElementById("title").value = "typed by Mai";
  g2.release(); await q.settle();
  assert.equal(q.doc.getElementById("title").value, "From the read", "a value drawn from a read that arrived since wins");

  q.doc.getElementById("title").value = "second thoughts";
  await q.click(q.doc.getElementById("again"));
  assert.equal(q.doc.getElementById("title").value, "second thoughts", "an unrelated redraw changes what the screen drew nowhere: typing is kept");
});

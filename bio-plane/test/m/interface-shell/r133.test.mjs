/* interface-shell R133 (R13, R109; T51 fix round 10, walk C C-M12, C-M16; K5271): a fold that holds a pressed act's answer or
   refusal, or a control whose value the member set, stays open across a redraw, and a set control keeps its value. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "./harness.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const btn = (p, op) => p.root().querySelector(`button[data-act="${op}"]`);
/* a form in a fold, as `screens-daily` draws "Start the project" and `screens-inquiry` the contradiction flag: a pick, a field, an act */
const FOLD = {
  id: "connect", words: [["screen.home.t.fold", "fx fold", false]],
  reads() { return { late: { op: "queue" } }; },
  render(cs, view) {
    return "<h1>x</h1>" + '<details class="mk-details" data-fold="form"><summary>' + cs.w("screen.home.t.fold") + "</summary>"
      + cs.choice("pick", "shell.reason", [{ value: "", text: "" }, { value: "0", text: "First passage" }, { value: "1", text: "Second passage" }], { value: "" }) + cs.field("note", "shell.reason")
      + cs.act("disclosureshown") + "</details>"
      + '<button type="button" id="again" data-shell="theme" data-theme-to="light">go</button>'
      + '<details class="mk-details" data-fold="other"><summary>' + cs.w("screen.home.t.fold") + "</summary><p>unrelated</p></details>"
      + cs.state("late", view, () => '<p id="done">read</p>');
  },
  acts: [{ op: "disclosureshown", send: () => ({ refuse: "shell.picked", fills: { n: "1/1" } }) }],
};
const fold = (p, name) => p.root().querySelector(`details[data-fold="${name}"]`);

test("R133 R13 C-M16 a fold holding a pressed act's refusal is open when the refusal is drawn and stays open across every redraw (control: a fold with no refusal stays as it was)", async () => {
  const p = await boot({ screens: [FOLD], path: "/app/connect", plane: { queue: ok({ items: [] }) } });
  assert.equal(fold(p, "form").hasAttribute("open"), false, "drawn closed to begin with");
  await p.click(btn(p, "disclosureshown"));
  const slot = p.root().querySelector('[data-slot="m:0"]');
  assert.equal(slot.textContent, word("shell.picked", { n: "1/1" }));
  assert.ok(fold(p, "form").hasAttribute("open"), "the refusal is seen: its fold is open");
  /* a redraw of the same screen (the read arriving again, a theme press) rebuilds the tree */
  await p.click(p.doc.getElementById("again"));
  assert.ok(fold(p, "form").hasAttribute("open"), "still open after a redraw");
  assert.equal(p.root().querySelector('[data-slot="m:0"]').textContent, word("shell.picked", { n: "1/1" }), "and the refusal is drawn in it");
  assert.equal(fold(p, "other").hasAttribute("open"), false, "control: a fold holding nothing stays closed");
});

test("R133 R109 C-M12 a control the member set inside a fold keeps its value and its fold open across a redraw (control: nothing set, the fold stays closed)", async () => {
  const p = await boot({ screens: [FOLD], path: "/app/connect", plane: { queue: ok({ items: [] }) } });
  fold(p, "form").setAttribute("open", "");
  p.doc.getElementById("pick").value = "1"; p.fire(p.doc.getElementById("pick"), "change"); await p.settle();
  p.doc.getElementById("note").value = "because";
  await p.click(p.doc.getElementById("again"));
  assert.ok(fold(p, "form").hasAttribute("open"), "the fold stays open");
  assert.equal(p.doc.getElementById("pick").value, "1", "the pick keeps its value");
  assert.equal(p.doc.getElementById("note").value, "because", "so does the field");
  const q = await boot({ screens: [FOLD], path: "/app/connect", plane: { queue: ok({ items: [] }) } });
  await q.click(q.doc.getElementById("again"));
  assert.equal(fold(q, "form").hasAttribute("open"), false, "control: nothing set, nothing opened");
});

test("R133 a fold the member opened stays open, and one the member closed stays closed, across a redraw", async () => {
  const p = await boot({ screens: [FOLD], path: "/app/connect", plane: { queue: ok({ items: [] }) } });
  fold(p, "other").setAttribute("open", "");
  await p.click(p.doc.getElementById("again"));
  assert.ok(fold(p, "other").hasAttribute("open"), "opened by the member");
  assert.equal(fold(p, "form").hasAttribute("open"), false, "never opened");
  fold(p, "other").removeAttribute("open");
  await p.click(p.doc.getElementById("again"));
  assert.equal(fold(p, "other").hasAttribute("open"), false, "closed by the member");
});

/* interface-shell R5 (fix round 4, C59/N3; K4429): a word the kit made and handed to another word as a fill is escaped once. The Timeline's kind
   choice, whose read the store did not answer, drew "Could not read this, because your team&#39;s Civicsmith did not answer" because the screen
   gave `state.failed` the already-escaped `shell.noanswer` as its fill and the kit escaped it again. Driven through the page: a read that gets no
   answer, drawn as the screen draws it. Each test was seen failing first. */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, silent, textNodes, fitSend, ADMIN } from "./harness.mjs";
import { word } from "../../../src/setup-words/index.mjs";

/* the Timeline's unread vocabulary (screens-investigate `timeline.mjs`): `state.failed` over `shell.noanswer`, both through the kit's `w` */
const draws = { id: "timeline", words: [], reads: () => ({ vocab: { op: "affordances" } }), acts: [],
  render: new Function("cs", "view", `window.__cs = cs;
    return view.data.vocab && view.data.vocab.state === "failed" ? '<p class="cs-state" data-state="failed" role="alert">' + cs.w("state.failed", { reason: cs.w("shell.noanswer") }) + '</p>' : "<p>wait</p>";`) };

test("R5 (C59) a word handed to another word as a fill is drawn escaped once: the Timeline's unread vocabulary reads 'your team's Civicsmith did not answer' with a plain apostrophe", async () => {
  const p = await boot({ screens: [draws], path: "/app/timeline/P1", plane: { affordances: silent } });
  const said = textNodes(p.root()).map((n) => n.data).join(" ");
  assert.equal(said.includes("&#39;"), false, "not escaped twice: " + said.slice(said.indexOf("Could not"), said.indexOf("Could not") + 90));
  assert.ok(said.includes(word("state.failed", { reason: word("shell.noanswer") })), "the sentence, whole: " + said);
  assert.ok(said.includes(word("shell.noanswer")), "with the word's own apostrophe, plain");
});

test("R5 (C59) control: record data handed to a word as a fill is escaped once, markup and an entity-looking text included; a fragment the kit made as {html} is inserted as it is; the shell's own silent-store sentence is escaped once", async () => {
  const p = await boot({ screens: [draws], path: "/app/timeline/P1", plane: { affordances: silent } });
  const cs = p.win.__cs;
  const head = word("state.failed", { reason: "" });
  assert.equal(cs.w("state.failed", { reason: "<b>x</b> & more" }), head + "&lt;b&gt;x&lt;/b&gt; &amp; more");
  assert.equal(cs.w("state.failed", { reason: "Fish &amp; chips" }), head + "Fish &amp;amp; chips", "a record's own text is data, whatever it looks like");
  assert.equal(cs.w("state.failed", { reason: { html: "<i>kept</i>" } }), head + "<i>kept</i>");
  assert.equal(cs.w("shell.noanswer"), word("shell.noanswer").replace(/'/g, "&#39;"));
  /* the shell's own refusal draw: an act the store did not answer */
  const act = { id: "home", words: [], reads: () => ({}), acts: [{ op: "taskresolve", send: fitSend("taskresolve") }],
    render: (c) => c.act("taskresolve", { label: "act.taskresolve.label.home" }) };
  const q = await boot({ screens: [act], path: "/app", plane: { whoami: ok({ ...ADMIN, capabilities: ["contribute", "administer"] }), taskresolve: silent } });
  await q.click('button[data-act="taskresolve"]');
  const beside = textNodes(q.root()).map((n) => n.data).join(" ");
  assert.equal(beside.includes("&#39;"), false, "the act's refusal beside it is escaped once");
  assert.ok(beside.includes(word("shell.noanswer")), "and drawn: " + beside.slice(-120));
});

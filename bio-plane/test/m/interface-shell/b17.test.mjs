/* interface-shell R107 and R108 (K4197; DEC-384 T-07, B411): an act marked Reasoned asks its reason, and the phone block of the shell's
   layout carries the walk's 390 px rules. Every weight name is read by key. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, ADMIN, MEMBER, fitSend } from "./harness.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { interfacePage } from "../../../src/interface-shell/index.mjs";

const caps = ["contribute", "administer", "create_projects", "publish"];
const WHO = { ...ADMIN, capabilities: caps };
const act = (op) => ({ op, send: fitSend(op) });
const members = { id: "members", words: [], reads: () => ({}), acts: [act("memberadd"), act("memberset"), act("expertiseconfirm"), act("membercaps")],
  render: (cs) => ["memberadd", "memberset", "expertiseconfirm", "membercaps"].map((op) => cs.act(op, { label: "act." + op + ".label.members", data: { who: "mai" } })).join("") };
const account = { id: "account", words: [], reads: () => ({}), acts: [act("memberlanguageset"), act("setpassword")],
  render: (cs) => ["memberlanguageset", "setpassword"].map((op) => cs.act(op, { label: "act." + op + ".label.account" })).join("") };
const project = { id: "project", words: [], reads: () => ({}), acts: [act("projectowneradd")], render: (cs) => cs.act("projectowneradd", { label: "act.projectowneradd.label.project" }) };
const reasonBox = (p) => p.root().querySelector(".mk-slot textarea");

test("R107 the weight marks are read by key: a marked act draws the name its key holds", async () => {
  for (const k of ["weight.reasoned.name", "weight.terminal.name", "weight.signed.name"]) assert.ok(hasWord(k), k);
  const p = await boot({ screens: [members], path: "/app/members", plane: { whoami: ok(WHO) } });
  const mark = p.root().querySelector('button[data-act="memberadd"] .w');
  assert.ok(mark, "the mark is drawn");
  assert.equal(mark.textContent, word("weight.reasoned.name"));
});

for (const [screen, ops, path] of [[members, ["memberadd", "memberset", "expertiseconfirm", "membercaps"], "/app/members"], [project, ["projectowneradd"], "/app/project/P1"]]) {
  for (const op of ops) {
    test(`R107 ${op} (marked Reasoned, no weight) opens the reason box and sends nothing until a reason is given, then sends it as reason`, async () => {
      const p = await boot({ screens: [screen], path, plane: { whoami: ok(WHO) } });
      const btn = p.root().querySelector(`button[data-act="${op}"]`);
      assert.ok(btn, "the act is drawn");
      await p.click(btn);
      assert.equal(p.byOp(op).length, 0, "nothing sent on press");
      const box = reasonBox(p);
      assert.ok(box, "the reason box is open");
      await p.click(p.root().querySelector('[data-shell="reason-send"]'));
      assert.equal(p.byOp(op).length, 0, "an empty reason sends nothing");
      box.value = "because the team asked";
      await p.click(p.root().querySelector('[data-shell="reason-send"]'));
      assert.equal(p.byOp(op).length, 1);
      assert.equal(p.byOp(op)[0].body.reason, "because the team asked");
    });
  }
}

test("R107 control: a Reversible-marked act and a sign-in act still run on press", async () => {
  const p = await boot({ screens: [account], path: "/app/account", plane: { whoami: ok(WHO) } });
  for (const op of ["memberlanguageset", "setpassword"]) {
    await p.click(p.root().querySelector(`button[data-act="${op}"]`));
    assert.equal(p.byOp(op).length, 1, op + " ran on press");
    assert.equal(reasonBox(p), null);
  }
});

test("R108 the phone block of the shell's layout holds the walk's 390 px rules, and nothing of them is outside it", () => {
  const html = interfacePage([]);
  const css = html.slice(html.indexOf("<style>") + 7, html.indexOf("</style>"));
  const at = css.indexOf("@media (max-width:760px)");
  assert.ok(at >= 0, "the phone block");
  const phone = css.slice(at, css.indexOf("@media (prefers-reduced-motion"));
  for (const rule of ["min-width:0;max-width:100%", "overflow-wrap:anywhere", ".mk-cards{grid-template-columns:minmax(0,1fr)}", ".mk-acts{flex-wrap:wrap}", ".tw{max-width:100%;overflow-x:auto}",
    ".cs-path a", ".cs-part>summary", "min-height:44px", ".cs-dock:not(:has(.body>*))", ".cs-band:empty", ".cs-tip{max-width:min(300px", "pointer-events:none"]) assert.ok(phone.includes(rule), rule);
  const outside = css.slice(0, at);
  for (const rule of [".mk-cards", ".tw{", ".cs-tip", ".cs-band:empty"]) assert.ok(!outside.includes(rule), `${rule} is not outside the phone block`);
});

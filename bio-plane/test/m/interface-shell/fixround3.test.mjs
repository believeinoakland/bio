/* interface-shell R112 (fix round 2, wave 3; K4334, C89's shell half): an act may name the answer codes that are its success.
   Such an answer is drawn as done, in the success style, with the code's own row as its sentence, and the act's re-reads run
   as after any success; a code it does not name is a refusal as ever. Every sentence is read through `setup-words` (R70). */
import test from "node:test";
import assert from "node:assert/strict";
import { queueOf, boot, ok, refused, silent, ADMIN, fitSend } from "./harness.mjs";
import { checkScreens } from "../../../src/interface-shell/index.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { inWorld, bootAs } from "./world.mjs";

const WHO = { ...ADMIN, capabilities: ["contribute", "administer", "create_projects", "publish"] };
const PENDING = { ok: false, reason: "CONSENSUS_REQUIRED", code: "CONSENSUS_REQUIRED", memberId: "x", awaiting: ["rosa"] };
/* the act as a screen declares it: `successCodes` names the answers that are its success; `done` is handed the answer's fields */
const endorse = (extra = {}) => ({
  op: "adminendorse", rereads: ["roster"], send: fitSend("adminendorse"),
  done(view, answer, cs) { cs.set("said", String(answer && answer.awaiting)); },
  failed(view, answer, cs) { cs.set("failedCode", String(answer.code)); },
  ...extra,
});
const screen = (act) => ({
  id: "members", words: [], reads: () => ({ roster: { op: "memberlist" } }), acts: [act],
  render: (cs, view) => '<p id="said">' + cs.esc(view.ui.said || "-") + '</p><p id="failedCode">' + cs.esc(view.ui.failedCode || "-") + "</p>" + cs.act("adminendorse", { label: "act.adminendorse.label.members" }),
});
const press = async (p, reason = "because the team asked") => {
  await p.click(p.root().querySelector('button[data-act="adminendorse"]'));
  const box = p.root().querySelector(".mk-slot textarea");
  if (box) { box.value = reason; await p.click(p.root().querySelector('[data-shell="reason-send"]')); }
};
const slot = (p) => p.root().querySelector("#cs-main .mk-slot");

for (const [shape, answer] of [["a refusal at the top level", { status: 400, json: PENDING }], ["a refusal in the result", { status: 200, json: { ok: true, result: PENDING } }]]) {
  test(`R112 an answer the act names in successCodes (${shape}) is drawn as done with the code's own row, hands done its fields and re-reads; control: it is no refusal`, async () => {
    assert.ok(hasWord("refusal.CONSENSUS_REQUIRED"));
    const p = await boot({ screens: [screen(endorse({ successCodes: ["CONSENSUS_REQUIRED"] }))], path: "/app/members", plane: { whoami: ok(WHO), adminendorse: answer, memberlist: ok({ members: [] }) } });
    const reads = p.byOp("memberlist").length;
    await press(p);
    assert.equal(p.byOp("adminendorse").length, 1, "the act was sent once");
    const note = slot(p).querySelector('[data-state="done"]');
    assert.ok(note, "its sentence is drawn beside the act in the done style");
    assert.equal(note.textContent, word("refusal.CONSENSUS_REQUIRED", { awaiting: "rosa" }), "the code's own row, filled from the answer");
    assert.equal(note.getAttribute("role"), "status", "announced politely, not as an alert");
    assert.equal(slot(p).querySelector('[data-gap="refused"]'), null, "no refusal is drawn");
    /* the button follows R74 as after any success of this act: an act with no weight (a read, or a credential-ground act) carries no data-done */
    const plain = await boot({ screens: [screen(endorse())], path: "/app/members", plane: { whoami: ok(WHO), adminendorse: ok({ memberId: "x" }), memberlist: ok({ members: [] }) } });
    await press(plain);
    assert.equal(p.root().querySelector('button[data-act="adminendorse"]').hasAttribute("data-done"), plain.root().querySelector('button[data-act="adminendorse"]').hasAttribute("data-done"), "the button answers as after a plain success (R74)");
    assert.equal(p.doc.getElementById("said").textContent, "rosa", "done was handed the answer's fields");
    assert.equal(p.doc.getElementById("failedCode").textContent, "-", "failed was not called");
    assert.equal(p.byOp("memberlist").length, reads + 1, "the named re-read ran");
    assert.ok(slot(p).querySelector('[data-state="done"]'), "the sentence survives the re-read's redraw");
  });
}

test("R112 control: the same code, not named by the act, is a refusal; a code the act does not name is a refusal; a named code answered by a server error is no success", async () => {
  const same = await boot({ screens: [screen(endorse())], path: "/app/members", plane: { whoami: ok(WHO), adminendorse: { status: 400, json: PENDING }, memberlist: ok({ members: [] }) } });
  const reads = same.byOp("memberlist").length;
  await press(same);
  assert.ok(slot(same).querySelector('[data-gap="refused"]'), "an act that names none draws it as a refusal");
  assert.equal(slot(same).querySelector('[data-state="done"]'), null);
  assert.equal(same.doc.getElementById("failedCode").textContent, "CONSENSUS_REQUIRED", "failed ran");
  assert.equal(same.byOp("memberlist").length, reads, "no re-read after a refusal");

  const other = await boot({ screens: [screen(endorse({ successCodes: ["CONSENSUS_REQUIRED"] }))], path: "/app/members", plane: { whoami: ok(WHO), adminendorse: refused("NOT_PROPOSED", "Not proposed."), memberlist: ok({ members: [] }) } });
  await press(other);
  assert.ok(slot(other).querySelector('[data-gap="refused"]'), "a real refusal of the same act is still a refusal");
  assert.equal(slot(other).querySelector('[data-state="done"]'), null);
  assert.equal(other.root().querySelector('button[data-act="adminendorse"]').hasAttribute("data-done"), false);
  assert.equal(other.doc.getElementById("failedCode").textContent, "NOT_PROPOSED");

  const server = await boot({ screens: [screen(endorse({ successCodes: ["CONSENSUS_REQUIRED"] }))], path: "/app/members", plane: { whoami: ok(WHO), adminendorse: { status: 503, json: PENDING }, memberlist: ok({ members: [] }) } });
  await press(server);
  assert.ok(slot(server).querySelector('[data-gap="refused"]'), "a server error is not the act's success");

  const none = await boot({ screens: [screen(endorse({ successCodes: ["CONSENSUS_REQUIRED"] }))], path: "/app/members", plane: { whoami: ok(WHO), adminendorse: silent, memberlist: ok({ members: [] }) } });
  await press(none);
  assert.ok(slot(none).querySelector('[data-gap="refused"]'), "no answer is no success");
});

test("R112 control: an ordinary success draws no sentence beside the act, and its next press clears a success sentence", async () => {
  const plain = await boot({ screens: [screen(endorse({ successCodes: ["CONSENSUS_REQUIRED"] }))], path: "/app/members", plane: { whoami: ok(WHO), adminendorse: ok({ memberId: "x", invite: "i" }), memberlist: ok({ members: [] }) } });
  await press(plain);
  assert.equal(slot(plain).querySelector('[data-state="done"]'), null, "a plain success says nothing beside the act");
  const p = await boot({ screens: [screen(endorse({ successCodes: ["CONSENSUS_REQUIRED"] }))], path: "/app/members", plane: { whoami: ok(WHO), adminendorse: { status: 400, json: PENDING }, memberlist: ok({ members: [] }) } });
  await press(p);
  assert.ok(slot(p).querySelector('[data-state="done"]'));
  await p.click(p.root().querySelector('button[data-act="adminendorse"]'));
  assert.equal(slot(p).querySelector('[data-state="done"]'), null, "pressed again, the earlier sentence goes");
});

test("R112 a screen whose act names successCodes that are no list of codes is never served; a list of codes composes (control)", async () => {
  const { checkScreens } = await import("../../../src/interface-shell/index.mjs");
  const mk = (successCodes) => [{ id: "members", reads: () => ({}), acts: [{ op: "adminendorse", successCodes, send: () => null }], render: () => "" }];
  for (const bad of ["CONSENSUS_REQUIRED", [1], [""], {}]) assert.throws(() => checkScreens(mk(bad)), /members.*adminendorse.*successCodes/, JSON.stringify(bad));
  assert.equal(checkScreens(mk(["CONSENSUS_REQUIRED"])), true);
});

test("R7 R93 (C66, P9; E12, K4530) the frame's own queue read asks for the count alone, in the background, and never the list, where the screen's list was cut by its limit; control: a screen's own queue read keeps its limit", async () => {
  const cut = (req) => (req.query.count ? ok({ ok: true, member: "mai", count: 9 }) : ok({ items: [{ id: "a", class: "OBLIGATION" }], truncated: true }));
  const p = await boot({ screens: [{ id: "home", words: [], reads: () => ({ list: { op: "queue", query: { limit: 5 } } }), acts: [], render: (cs) => cs.state("list", () => "") }], plane: { queue: cut } });
  const frame = p.byOp("queue").filter((r) => r.query.background === "1");
  assert.equal(frame.length, 1, "the frame reads the queue once");
  assert.equal(frame[0].query.count, "true", "for the count alone");
  assert.equal(frame[0].query.limit, undefined, "never the list");
  assert.ok(p.byOp("queue").some((r) => r.query.limit === "5"), "the screen's own read keeps its limit");
});

/* R117 (fix round 3; C84, C64): the two acts the registry does not yet list on their screens are named re-points, each until it does */
test("R117 a security screen naming scanmirror and a places screen naming officeconfirm are served; control: another unlisted op on those screens still throws", () => {
  const screen = (id, op) => ({ id, render: () => "", acts: [{ op }] });
  assert.equal(checkScreens([screen("security", "scanmirror")]), true);
  assert.equal(checkScreens([screen("places", "officeconfirm")]), true);
  assert.throws(() => checkScreens([screen("security", "officeconfirm")]), /security.*officeconfirm/);
  assert.throws(() => checkScreens([screen("places", "scanmirror")]), /places.*scanmirror/);
  assert.throws(() => checkScreens([screen("security", "groupnameset")]), /security.*groupnameset/);
});

/* R119 (fix round 3, C87 (c); K4410): an act's `ready` runs on the press before any reason box opens */
test("R119 a reasoned act whose ready refuses opens no reason box, sends nothing and draws the refusal beside it; control: an act without ready asks the reason as before", async () => {
  const refusing = endorse({ ready: () => ({ refuse: "refusal.CONSENSUS_REQUIRED", fills: { awaiting: "rosa" } }) });
  const { world, me } = await inWorld();
  const p = await bootAs(world, me, { screens: [screen(refusing)], path: "/app/members" });
  await p.click(p.root().querySelector('button[data-act="adminendorse"]'));
  assert.ok(!p.root().querySelector(".mk-slot textarea"), "no reason box opens");
  assert.equal(p.byOp("adminendorse").length, 0, "nothing is sent");
  assert.ok(slot(p).textContent.includes(word("refusal.CONSENSUS_REQUIRED", { awaiting: "rosa" })), "the refusal is drawn beside the act");
  const plain = await bootAs(world, me, { screens: [screen(endorse())], path: "/app/members" });
  await plain.click(plain.root().querySelector('button[data-act="adminendorse"]'));
  assert.ok(plain.root().querySelector(".mk-slot textarea"), "control: the reason box opens as before");
  assert.equal(plain.byOp("adminendorse").length, 0, "control: nothing is sent before the reason");
});

test("R119 the fills ready answers reach the act's send, with the reason asked before it; the send is handed them", async () => {
  /* the act's functions run in the page from their own text, so the send is self-contained: it answers the fill as a refusal sentence */
  const act = endorse({ ready: () => ({ fills: { note: "n1" } }), send: (view, btn, cs, extra) => ({ refuse: "refusal.CONSENSUS_REQUIRED", fills: { awaiting: String(extra.fills.note) } }) });
  const { world, me } = await inWorld();
  const p = await bootAs(world, me, { screens: [screen(act)], path: "/app/members" });
  await p.click(p.root().querySelector('button[data-act="adminendorse"]'));
  assert.ok(p.root().querySelector(".mk-slot textarea"), "the reason box opens after ready answers");
  p.root().querySelector(".mk-slot textarea").value = "because the team asked";
  await p.click(p.root().querySelector('[data-shell="reason-send"]'));
  assert.ok(slot(p).textContent.includes(word("refusal.CONSENSUS_REQUIRED", { awaiting: "n1" })), "the send drew the fill it was handed");
});

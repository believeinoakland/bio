/* interface-shell, fix round 2 of T51 (cause-shell-t51): C24 (R7), C76 (R11, R107), C77 (R109), C78 (R68), C79 (R9, R93), C80 (R60),
   C94 (R111), C11's shell half (R13), C15's shell half (R5). Every sentence is read through `setup-words`' `word` (R70). */
import test from "node:test";
import assert from "node:assert/strict";
import { FRAMES, PLACE_SCREENS, browserActs } from "../../../src/interface-shell/index.mjs";
import { SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";
import { OPS, NEEDS } from "../../../src/op-declarations/index.mjs";
import { MARKS } from "../../../src/op-grades/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { boot, ok, refused, pending, httpError, fitSend, ADMIN, MEMBER } from "./harness.mjs";
import { inWorld, bootAs, doorAs } from "./world.mjs";
import { ALL } from "./screens.fixture.mjs";

const textOf = (h) => String(h).replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const standIn = (id, render, acts = [], extra = {}) => ({ id, words: [], reads() { return {}; }, acts, render, ...extra });

/* ---------- C24 · R7: a place has one built screen; the rail's Find opens the working finder ---------- */

const FINDER = standIn("finder", new Function("cs", "return cs.title('x');"));
const ANSWERS = standIn("answers", new Function("cs", "return cs.title('x');"));
const railHref = (p, k) => p.root().querySelectorAll(".cs-rail a").find((a) => a.textContent.includes(textOf(word("rail." + k + ".name")))).getAttribute("href");

test("R7 (C24) the rail's Find, the tab and the masthead's search all open the finder, the one screen `find` maps to; control: another place's href is unchanged", async () => {
  const p = await boot({ screens: [FINDER, ANSWERS, ...ALL] });
  assert.deepEqual(PLACE_SCREENS.find, ["finder"], "one built screen for the place");
  assert.equal(railHref(p, "find"), "/app/finder");
  assert.equal(p.root().querySelector("a.mk-mastsearch").getAttribute("href"), "/app/finder");
  assert.equal(p.root().querySelectorAll(".cs-tabs a").find((a) => a.textContent.includes(textOf(word("rail.find.name")))).getAttribute("href"), "/app/finder");
  assert.equal(railHref(p, "projects"), "/app/projects", "another place is unchanged");
  assert.equal(railHref(p, "home"), "/app");
});

test("R7 R9 (C24) an address of the place itself (/app/find) opens the place's built screen, never 'comes later'; a place with no built screen still says so", async () => {
  const p = await boot({ screens: [FINDER, ANSWERS, ...ALL], path: "/app/find" });
  assert.equal(p.location.pathname, "/app/finder", "the address is the screen's");
  assert.equal(p.root().querySelector("#cs-main").getAttribute("data-screen"), "finder");
  assert.ok(!p.root().textContent.includes(textOf(word("shell.later", { place: word("rail.find.name") }))));
  const none = await boot({ screens: [...ALL], path: "/app/find" });
  assert.ok(none.root().textContent.includes(textOf(word("shell.later", { place: word("rail.find.name") }))), "control: no finder registered, the place says it comes later");
});

/* ---------- C76 · R11, R107: the mark and the asking agree ---------- */

/* every working-frame screen of the registry, drawing each of its acts (the real ids and ops, read from the registry and the declarations) */
const ADMIN_ALL = { ...ADMIN, capabilities: [...new Set(Object.values(NEEDS).filter((x) => typeof x === "string"))].concat(["contribute", "administer", "create_projects", "publish"]) };
const actsOf = (reg) => [...reg.acts, ...(reg.owed || []).map((o) => o.op)].filter((op, i, all) => all.indexOf(op) === i && Object.hasOwn(OPS, op) && !Object.hasOwn(browserActs(), op));
const working = SCREEN_REGISTRY.filter((r) => !Object.hasOwn(FRAMES, r.id) && actsOf(r).length);
const drawAll = (reg) => standIn(reg.id, new Function("cs", `return ${JSON.stringify(actsOf(reg))}.map(function (o) { return cs.act(o, { label: 'x' }); }).join('');`),
  actsOf(reg).map((op) => ({ op, send: fitSend(op) })));

test("R11 R107 (C76) over every act of every working screen the registry lists: an act drawn with a Reasoned mark asks its reason before it is sent; a read carries no mark; control: memberadd still marks and asks", async () => {
  const marked = [], bad = [], readMarked = [];
  for (const reg of working) {
    const p = await boot({ screens: [drawAll(reg)], path: "/app/" + reg.id, plane: { whoami: ok(ADMIN_ALL) } });
    for (const btn of p.root().querySelectorAll("button[data-act]")) {
      const op = btn.getAttribute("data-act");
      const w = btn.querySelector("span.w[data-mark]");
      if (OPS[op].mutating === false && w) readMarked.push(reg.id + ":" + op + ":" + w.getAttribute("data-mark"));
      if (!w || w.getAttribute("data-mark") !== "reasoned") continue;
      marked.push(op);
      const before = p.requests.length;
      await p.click(btn);
      const asked = btn.parentElement.querySelector(".mk-slot .cs-reason textarea");
      if (!asked || p.requests.length !== before) bad.push(reg.id + ":" + op);
    }
  }
  assert.deepEqual(readMarked, [], "a read carries no mark");
  assert.deepEqual(bad, [], "every act drawn with the Reasoned mark asks and sends nothing until it has its reason");
  assert.ok(marked.includes("memberadd"), "control: a reasoned administrator's act still marks and asks");
});

test("R107 (C76) control: a reasoned act sent with its reason carries it; a Reversible-marked act and a sign-in act still run on press", async () => {
  const reg = SCREEN_REGISTRY.find((r) => actsOf(r).includes("memberadd") && !Object.hasOwn(FRAMES, r.id));
  const screen = standIn(reg.id, new Function("cs", "return cs.act('memberadd', { label: 'x' }) + cs.act('memberset', { label: 'x' });"),
    [{ op: "memberadd", send: fitSend("memberadd") }, { op: "memberset", send: fitSend("memberset") }]);
  const { world, me } = await inWorld();
  const p = await bootAs(world, me, { screens: [screen], path: "/app/" + reg.id, plane: { whoami: ok(ADMIN_ALL) } });
  await p.click('button[data-act="memberadd"]');
  p.root().querySelector("textarea").value = "because";
  await p.click('button[data-shell="reason-send"]');
  assert.equal(p.byOp("memberadd")[0].body.reason, "because");
  const login = SCREEN_REGISTRY.find((r) => r.acts.includes("login"));
  const lp = await bootAs(world, null, { screens: [standIn(login.id, new Function("cs", "return cs.act('login', { label: 'x' });"), [{ op: "login", send: fitSend("login") }])], path: "/app/" + login.id });
  await lp.click('button[data-act="login"]');
  assert.equal(lp.byOp("login").length, 1, "a sign-in runs on press");
});

/* ---------- C77 · R109: passwords are cleared only after an act that sent one ---------- */

const joinish = (invite) => standIn("join", new Function("cs", "return cs.field('j-handle', 'x') + cs.field('j-pass', 'x', { type: 'password' }) + cs.field('j-pass2', 'x', { type: 'password' }) + cs.act('handlecheck', { label: 'x' }) + cs.act('enroll', { label: 'x' });"),
  [{ op: "handlecheck", send: fitSend("handlecheck", "{ handle: cs.value('j-handle') }") },
    { op: "enroll", send: fitSend("enroll", `{ invite: ${JSON.stringify(invite)}, handle: cs.value('j-handle'), password: cs.value('j-pass') }`) }]);

test("R109 (C77) a successful handle check keeps both typed passwords; control: a successful join empties them", async () => {
  /* the invitation is the administrator's real `memberadd`; the join and the handle check are the world's own */
  const { world, me } = await inWorld();
  const { invite } = await me.act("memberadd", { body: { memberId: "newbie", cover: "the world's new member" } });
  const p = await bootAs(world, null, { screens: [joinish(invite)], path: "/app/join" });
  const type = () => { p.doc.getElementById("j-handle").value = "newbie"; p.doc.getElementById("j-pass").value = "pw-one-one-one"; p.doc.getElementById("j-pass2").value = "pw-one-one-one"; };
  type();
  await p.click('button[data-act="handlecheck"]');
  assert.equal(p.byOp("handlecheck").length, 1);
  assert.equal(p.doc.getElementById("j-pass").value, "pw-one-one-one", "the handle check sent no password");
  assert.equal(p.doc.getElementById("j-pass2").value, "pw-one-one-one");
  await p.click('button[data-act="enroll"]');
  assert.equal(p.byOp("enroll").length, 1);
  assert.equal(p.doc.getElementById("j-pass").value, "", "the join sent it, so it is emptied");
  assert.equal(p.doc.getElementById("j-pass2").value, "", "and the confirmation with it");
});

test("R109 (C77) control: a refused act keeps what was typed, passwords included", async () => {
  /* the refusal is the real one: the handle typed is a member's already */
  const { world, me } = await inWorld();
  const { invite } = await me.act("memberadd", { body: { memberId: "newbie", cover: "the world's new member" } });
  const p = await bootAs(world, null, { screens: [joinish(invite)], path: "/app/join" });
  p.doc.getElementById("j-handle").value = me.handle;
  p.doc.getElementById("j-pass").value = "pw-one-one-one";
  await p.click('button[data-act="enroll"]');
  assert.equal(p.byOp("enroll").length, 1);
  assert.equal(p.byOp("enroll")[0].body.handle, me.handle);
  assert.equal(p.doc.getElementById("j-pass").value, "pw-one-one-one");
});

/* ---------- C78 · R68: a tip closes on the press ---------- */

const tipOpen = (p) => !p.doc.getElementById("cs-tip").hidden;

test("R68 (C78) a tip open on an act closes on its press and stays closed through the redraw that follows; control: hovering opens it after 0.5 s", async () => {
  const p = await boot({ screens: ALL, plane: { promote: ok({ project: null }), projectdirectory: ok({ projects: [] }) } });
  const btn = p.root().querySelector('button[data-act="promote"]');
  assert.ok(btn.getAttribute("data-tip"), "the act explains itself");
  p.fire(btn, "pointerover");
  await p.clock.tick(499);
  assert.equal(tipOpen(p), false, "not before 0.5 s");
  await p.clock.tick(2);
  assert.equal(tipOpen(p), true, "hover opens it");
  p.doc.getElementById("home-title").value = "T";
  btn.focus();
  await p.click(btn);
  assert.equal(tipOpen(p), false, "closed on the press");
  await p.settle();
  assert.equal(tipOpen(p), false, "and not reopened by the focus put back after the redraw");
});

/* ---------- C79 · R9, R93: navigation scrolls to the top ---------- */

test("R9 (C79) a navigation opens the screen at the top whatever the list had scrolled to, and no focus put back scrolls the new screen; control: a redraw of the same screen keeps its scroll", async () => {
  const p = await boot({ screens: ALL, plane: { heldcaptures: ok({ items: [{ id: "h1", title: "one", at: "2026-01-02" }] }) } });
  p.doc.getElementById("cs-main").scrollTop = 600;
  await p.back("/app/held");
  assert.equal(p.doc.getElementById("cs-main").scrollTop || 0, 0, "the held screen opens at the top");
  p.doc.getElementById("cs-main").scrollTop = 40;
  p.fire(p.root().querySelector('[data-shell="menu"]'), "click");
  await p.settle();
  assert.equal(p.doc.getElementById("cs-main").scrollTop, 40, "a redraw of the same screen keeps it");
  p.root().querySelector('input[data-shell="pick"]').focus();
  p.doc.scrolledTo = null;
  p.fire(p.root().querySelector('input[data-shell="pick"]'), "change");
  await p.settle();
  assert.ok(!p.doc.scrolledTo, "the focus put back after a redraw never scrolls");
});

/* ---------- C80 · R60: the masthead holds no placeholder name until the team's name is known ---------- */

const unnamed = () => textOf(word("shell.group.unnamed"));
test("R60 (C80) before groupidentity answers the masthead draws nothing as the team's name; once it answers, the name; a null display_name then draws the word", async () => {
  const { world, me } = await inWorld();
  const none = await bootAs(world, me, { screens: ALL });
  assert.equal(none.root().querySelector(".cs-mast .mk-grp").textContent.trim(), unnamed(), "control: answered with no name, the word");
  const name = (await me.act("groupnameset", { body: { name: "River Town" } })).display_name;
  const door = doorAs(world, me).door;
  let release;
  const gate = new Promise((r) => { release = r; });
  /* only the delay is the test's: the answer, once released, is the door's */
  const p = await bootAs(world, me, { screens: ALL, plane: { groupidentity: async (req) => { await gate; return door(req); } } });
  assert.equal(p.root().querySelector(".cs-mast .mk-grp"), null, "no link and no placeholder while it is unknown");
  assert.ok(!p.root().querySelector(".cs-mast").textContent.includes(unnamed()), "nowhere in the masthead");
  release();
  await p.settle();
  assert.equal(p.root().querySelector(".cs-mast .mk-grp").textContent.trim(), name);
});

test("R60 (C80) the last known name, kept on the device, is drawn while the read is out; a failed read keeps it", async () => {
  const { world, me } = await inWorld();
  const name = (await me.act("groupnameset", { body: { name: "River Town" } })).display_name;
  const p = await bootAs(world, me, { screens: ALL, plane: { groupidentity: pending } });
  assert.equal(p.root().querySelector(".cs-mast .mk-grp"), null, "nothing kept yet");
  const first = await bootAs(world, me, { screens: ALL });
  const kept = [...first.local.entries()].filter(([k, v]) => v === name);
  assert.equal(kept.length, 1, "the name is kept on the device");
  const again = await bootAs(world, me, { screens: ALL, plane: { groupidentity: pending }, local: { [kept[0][0]]: name } });
  assert.equal(again.root().querySelector(".cs-mast .mk-grp").textContent.trim(), name);
});

/* ---------- C94 · R111: members are named by handle ---------- */

const NAMES = standIn("home", new Function("cs", "return ['admin', 'u-2', 'u-3', 'rosa', 'nobody', ''].map(function (id) { return '<p data-nm=\"1\">' + cs.esc(cs.memberName(id)) + '</p>'; }).join('');"));
const memberlist = ok({ members: [{ member_id: "admin", handle: "sparky", founder: true }, { member_id: "u-2", handle: "rosa" }, { member_id: "u-3", handle: null }] });

test("R111 (C94) memberName answers the handle of the founder and of an ordinary member, and a handle as itself; an unknown id and an id with no handle answer a word, never the id", async () => {
  const p = await boot({ screens: [NAMES], plane: { memberlist, whoami: ok({ ...MEMBER, member: "admin", handle: "sparky" }) } });
  const names = p.root().querySelectorAll("p[data-nm]").map((x) => x.textContent);
  assert.equal(names[0], "sparky", "the founder");
  assert.equal(names[1], "rosa", "a member");
  assert.equal(names[3], "rosa", "a handle is answered as itself");
  const fallback = textOf(word("shell.card.member"));
  assert.equal(names[2], fallback, "a member with no handle");
  assert.equal(names[4], fallback, "an id nobody knows");
  assert.equal(names[5], fallback, "no id");
  assert.ok(!names.some((n) => ["admin", "u-2", "u-3", "nobody"].includes(n)), "no id is ever drawn");
});

test("R111 (C94) the signed-in member is named from whoami before the roster answers, the founder too; a roster that cannot be read leaves only that", async () => {
  const p = await boot({ screens: [NAMES], plane: { memberlist: pending, whoami: ok({ ...MEMBER, member: "admin", handle: "sparky" }) } });
  const names = p.root().querySelectorAll("p[data-nm]").map((x) => x.textContent);
  assert.equal(names[0], "sparky");
  assert.equal(names[1], textOf(word("shell.card.member")));
});

/* ---------- C11 · R13: an act's refusal survives the redraw ---------- */

test("R13 (C11) a refusal drawn beside an act stays through a redraw of the screen; pressing again clears it; control: a success draws none", async () => {
  const p = await boot({ screens: ALL, plane: { promote: refused("TEST_CODE_NO_WORD", "No amount was given.") } });
  p.doc.getElementById("home-title").value = "T";
  await p.click('button[data-act="promote"]');
  const slot = () => p.root().querySelector('button[data-act="promote"]').parentElement.querySelector(".mk-slot");
  assert.ok(slot().textContent.includes("No amount was given."), "the refusal is drawn beside the act");
  p.fire(p.root().querySelector('[data-shell="menu"]'), "click");
  await p.settle();
  assert.ok(slot().textContent.includes("No amount was given."), "and is still drawn after the page redraws");
  assert.ok(slot().innerHTML.includes('role="alert"'));
  const ok2 = await boot({ screens: ALL, plane: { promote: ok({ project: null }) } });
  ok2.doc.getElementById("home-title").value = "T";
  await ok2.click('button[data-act="promote"]');
  assert.equal(ok2.root().querySelector('button[data-act="promote"]').parentElement.querySelector(".mk-slot").textContent, "", "control: a success draws none");
});

test("R13 (C11) the refusal goes when the act is pressed again and succeeds, and when the screen is left", async () => {
  let answer = refused("TEST_CODE_NO_WORD", "No amount was given.");
  const p = await boot({ screens: ALL, plane: { promote: () => answer } });
  p.doc.getElementById("home-title").value = "T";
  await p.click('button[data-act="promote"]');
  answer = ok({ project: null });
  await p.click('button[data-act="promote"]');
  assert.equal(p.root().querySelector('button[data-act="promote"]').parentElement.querySelector(".mk-slot").textContent, "");
  answer = refused("TEST_CODE_NO_WORD", "No amount was given.");
  await p.click('button[data-act="promote"]');
  await p.back("/app/held");
  await p.back("/app");
  assert.equal(p.root().querySelector('button[data-act="promote"]').parentElement.querySelector(".mk-slot").textContent, "", "leaving the screen forgets it");
});

/* ---------- C15 · R5: the words are asked for by the release version ---------- */

test("R5 (C15, fix round 3 P1) the words request carries the release version the served page names, whatever bootstrap answers or whether it fails; control: a page naming none sends none", async () => {
  const { world, me } = await inWorld();
  const p = await bootAs(world, me, { screens: ALL, version: "0.86.0" });
  const words = p.byOp("interfacewords");
  assert.equal(words[0].query.v, "0.86.0", "asked for by the page's release version, in hand before bootstrap answers");
  assert.notEqual((await me.read("bootstrap")).version, "0.86.0", "the plane's own release is not the page's: the page's names the words");
  for (const w of words.slice(1)) assert.ok(w.query.v.startsWith("0.86.0~"), "a later ask names the same release first (R128)");
  const down = await bootAs(world, me, { screens: ALL, version: "0.86.0", plane: { bootstrap: httpError(500) } });
  assert.equal(down.byOp("interfacewords").length, 1, "a bootstrap that fails never holds the words back");
  assert.equal(down.byOp("interfacewords")[0].query.v, "0.86.0");
  const bare = await bootAs(world, me, { screens: ALL });
  assert.ok(bare.byOp("interfacewords").length >= 1);
  for (const w of bare.byOp("interfacewords")) assert.equal(w.query.v, undefined, "control: the page names no version, so no field");
});

/* ---------- B4 · R90, R11: a place word explains the act in the confirmation dialog too ---------- */

test("R90 R11 (C48) an act drawn with a here word confirms with that word, not .does; control: an act with none confirms with .does", async () => {
  const draw = (extra) => standIn("ceremony", new Function("cs", `return cs.act('publish', { label: 'x'${extra} });`), [{ op: "publish", send: fitSend("publish") }]);
  const dialogOf = async (extra) => {
    const p = await boot({ screens: [draw(extra)], path: "/app/ceremony/C-1", plane: { whoami: ok(ADMIN_ALL) } });
    await p.click('button[data-act="publish"]');
    return p.root().querySelector(".cs-dialog .ends").textContent;
  };
  const here = textOf(word("act.publish.here.ceremony")), does = textOf(word("act.publish.does"));
  assert.notEqual(here, does);
  assert.equal(await dialogOf(", here: 'ceremony'"), here);
  assert.equal(await dialogOf(""), does);
});

test("R11 (C76) op-grades marks no read above Reversible: every op in MARKS that its owner declares not mutating is Reversible (bootstrap's 'Irreversible' among them)", () => {
  const reads = Object.keys(MARKS).filter((op) => Object.hasOwn(OPS, op) && OPS[op].mutating === false);
  assert.ok(reads.includes("bootstrap") && reads.length > 20);
  assert.deepEqual(reads.filter((op) => MARKS[op] !== "Reversible"), []);
  assert.ok(Object.keys(MARKS).some((op) => Object.hasOwn(OPS, op) && OPS[op].mutating !== false && MARKS[op] !== "Reversible"), "control: an act keeps a mark above Reversible");
});

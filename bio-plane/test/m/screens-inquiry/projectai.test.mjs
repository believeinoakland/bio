/* screens-inquiry R14, R37, R39: the project's AI account screen (`projectai`), on interface-shell's served page over a scripted
 * plane playing `credentials`' project account ops and `ai-use`'s, with screens-settings R9's panel drawn over the
 * project's account. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok, refusedIn } from "../interface-shell/harness.mjs";
import { storeWorld, main, actsIn, button, fill, press, rawKeys, says, section, word, day, SCREENS } from "./fixtures.mjs";

const OWN = { capabilities: ["contribute", "create_projects"] };
const KEY = "sk-ant-api03-" + "7".repeat(40);
/** The project's AI account over the real world (K5054): `ann` makes the project and is its only owner (`sole: false`: `dev` is invited and joins);
 *  `key` holds an API key for it (her password asked again first, as the page's re-ask does), switched on unless `on: false`; `keep` keeps its
 *  material away from AI with that reason; `hidden` hides the project from members who are not in it. All by real acts. */
const worldOf = async ({ sole = true, key = true, on = true, keep = null, hidden = false } = {}) => {
  const world = await storeWorld({ ai: true });
  const ann = await world.signIn("ann", OWN);
  const dev = await world.signIn("dev", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  if (!sole) {
    await ann.act("projectinvite", { query: { projectId: project, handle: "dev" }, body: {} });
    await dev.act("projectjoin", { query: { projectId: project }, body: {} });
  }
  if (key) {
    await ann.act("reauth", { body: { password: ann.password } });
    await ann.act("projectkeyset", { body: { project, key: KEY } });
    await ann.act("projectaccountswitch", { body: { project, on: true } });
    if (!on) await ann.act("projectaccountswitch", { body: { project, on: false } });
  }
  if (keep) await ann.act("projectaikeepaway", { body: { project, on: true, reason: keep } });
  if (hidden) await ann.act("projectvisibilityset", { query: { projectId: project, setting: "hidden" }, body: {} });
  return { world, ann, dev, project, owner: "project:" + project, at: "/app/projectai/" + project };
};
/** The page as `as` reads it over the world's door (`plane` overrides only the ops it names). */
const pageOf = async (w, as, o = {}) => {
  const { door, session } = w.world.boot(as);
  const p = await boot({ screens: SCREENS, door, session, path: w.at, ...o });
  await p.settle();
  return p;
};
/* the notice as the plane answers it: the words row it is made from, read by `word` */
const NOTICE = word("ai.disclosure.projectkey", { project: "Pothole repairs" });
/* the usage the project's key has paid for: no act of the world spends (a use is recorded as the assistant answers, and none answers in a test), so this read alone is scripted over the world */
const USAGE = (project) => ({ aiusage: ok({ ok: true, owner: "project:" + project, uses: [{ use: "ask", calls: 12, tokens: 34000, total_cost_usd: 1.2 }] }) });
/* her sign-in connected: `subscriptionConnected` is in-plane and no act of the world connects one (needed: a recipe connecting a member's sign-in), so the read is scripted over the world */
/* the project's own record, readable: the real image of a hidden project she is not in is empty, so the shell draws "nothing is here"; the screen's own unavailable state (R60) is
   drawn when the record reads and her sight of it is refused (needed: a state where a project reads but is neither listed nor hers; no act makes one), so the record alone is scripted */
const SEEN = (project) => ({ image: ok({ "bundle.md": `---\nid: ${project}\nobject_type: project\ntitle: "Pothole repairs"\n---\n` }) });
const CONNECTED = { subscriptionsignin: ok({ ok: true, connected: true }) };

test("R14 reads: the project's account, its notice and keep-away, her sign-in, and the panel's four reads over owner project:<id>", async () => {
  const w = await worldOf({ sole: false });
  const p = await pageOf(w, w.ann);
  const q = (op) => p.byOp(op)[0] && p.byOp(op)[0].query;
  assert.equal(q("projectaccountstate").project, w.project);
  assert.equal(q("projectkeynotice").project, w.project);
  assert.equal(q("projectaikeepawaystate").project, w.project);
  assert.equal(q("projectparticipants").projectId, w.project);
  assert.deepEqual(p.byOp("subscriptionsignin")[0].body, { step: "state" });
  /* K3419: the panel's four reads name the project's account, and are made for an owner only (below: never for a participant) */
  for (const op of ["accountuses", "ailimits", "aiusage", "accounthistory"]) assert.equal(q(op).owner, w.owner, op);
  assert.ok(p.root().querySelector(".cs-crumbs").textContent.includes("Pothole repairs") && says(p.root().querySelector(".cs-crumbs"), "screen.projectai.name"));
});

test("R14 drawn to an owner: what pays, the panel over the project's account (screens-settings R9), keep-away, and the eight acts", async () => {
  const w = await worldOf();
  const p = await pageOf(w, w.ann, { plane: { ...USAGE(w.project), ...CONNECTED } });
  const m = main(p);
  const held = await w.ann.read("projectaccountstate", { query: { project: w.project } });
  assert.equal(m.querySelector("h1").textContent, "Pothole repairs");
  assert.ok(says(m.querySelector('[data-account="apikey"]'), "screen.projectai.account.key"));
  assert.ok(says(m, "screen.projectai.account.since", { who: "ann", date: day(held.set_at, { year: true }) }));
  /* the panel: its four sections, its use summed naming no member */
  assert.ok(m.querySelectorAll("section").length >= 4, "the panel's sections, drawn by screens-settings");
  assert.ok(m.textContent.includes("$1.20"));
  assert.ok(says(m.querySelector('[data-keepaway="off"]'), "screen.projectai.keepaway.off"));
  /* every act of the screen's own declaration but Join (R37), drawn to an owner */
  assert.deepEqual([...new Set(actsIn(m))].sort(), SCREENS.find((s) => s.id === "projectai").acts.map((a) => a.op).filter((op) => op !== "projectjoin").sort());
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R14 projectkeyset sends the key in the body only, never drawn again", async () => {
  const w = await worldOf();
  const p = await pageOf(w, w.ann);
  const field = main(p).querySelector('input[type="password"]');
  fill(p, { [field.getAttribute("id")]: KEY });
  await press(p, "projectkeyset");
  const r = p.byOp("projectkeyset")[0];
  assert.deepEqual(r.body, { project: w.project, key: KEY });
  for (const x of p.requests) {
    assert.ok(!x.url.includes(KEY), `${x.op} address`);
    if (x !== r) assert.ok(!JSON.stringify(x.body || {}).includes(KEY), `${x.op} body`);
  }
  assert.ok(!p.root().innerHTML.includes(KEY), "never drawn again");
  assert.equal(main(p).querySelector('input[type="password"]').value, "", "the field is empty again");
  for (const v of [...p.store.values(), ...p.local.values()]) assert.ok(!String(v).includes(KEY));
  /* control: no key, nothing sent */
  const n = await pageOf(w, w.ann);
  assert.ok(says(await press(n, "projectkeyset"), "screen.projectai.key.nokey"));
  assert.equal(n.byOp("projectkeyset").length, 0);
});

test("R14 her own sign-in is offered only while the project has no other participant and her sign-in is connected", async () => {
  /* her sign-in is connected and the act is answered as the sole participant's: both scripted over the real project (no recipe connects a sign-in: needed, a member's connected sign-in) */
  const w = await worldOf();
  const p = await pageOf(w, w.ann, { plane: { ...CONNECTED, projectsigninset: ok({ ok: true, project: w.project, kind: "signin" }) } });
  await press(p, "projectsigninset");
  assert.deepEqual(p.byOp("projectsigninset")[0].body, { project: w.project });
  const two = await worldOf({ sole: false });
  assert.ok(!actsIn(main(await pageOf(two, two.ann, { plane: CONNECTED }))).includes("projectsigninset"), "another participant");
  /* the real sign-in of a world is not connected */
  assert.ok(!actsIn(main(await pageOf(w, w.ann))).includes("projectsigninset"), "not connected");
  /* the owner's refusal by its words (ai.refused.notsole) */
  const r = await pageOf(w, w.ann, { plane: { ...CONNECTED, projectsigninset: refusedIn("PROJECT_NOT_SOLE_MEMBER") } });
  assert.ok(says(await press(r, "projectsigninset"), "ai.refused.notsole", { project: "" }));
});

test("R14 switch, remove, the notice, the panel's two acts and keep-away send what their owners take", async () => {
  const w = await worldOf({ sole: false });
  const p = await pageOf(w, w.ann);
  assert.ok(says(button(p, "projectaccountswitch"), "screen.projectai.switch.off"));
  /* the notice drawn before the first use, as it leaves the group */
  assert.ok(main(p).querySelector('[data-notice="projectkey"]').textContent.includes(NOTICE), "the notice as the plane answers it");
  await press(p, "projectkeynoticeseen");
  assert.deepEqual(p.byOp("projectkeynoticeseen")[0].body, { project: w.project });
  assert.equal((await w.ann.read("projectkeynotice", { query: { project: w.project } })).due, false, "the notice is seen");
  await press(p, "accountusesset");
  assert.equal(p.byOp("accountusesset")[0].body.owner, w.owner);
  fill(p, { "aio-amount": "5" });
  await press(p, "ailimitset", { within: p.doc.getElementById("aio-amount").parentElement.parentElement /* the panel's set-a-limit form (screens-settings R20 draws it as a plain block, not .cs-form) */ });
  assert.deepEqual([p.byOp("ailimitset")[0].body.owner, p.byOp("ailimitset")[0].body.amount], [w.owner, 5]);
  assert.equal((await w.ann.read("ailimits", { query: { owner: w.owner } })).limits[0].amount, 5, "the limit is held");
  /* keep-away: what it does said first, on only with a reason */
  assert.ok(says(section(p, "screen.projectai.keepaway.head"), "act.projectaikeepaway.does"));
  fill(p, { "pa-why": "the case is sealed" });
  await press(p, "projectaikeepaway");
  assert.deepEqual(p.byOp("projectaikeepaway")[0].body, { project: w.project, on: true, reason: "the case is sealed" });
  assert.equal((await w.ann.read("projectaikeepawaystate", { query: { project: w.project } })).on, true, "the project's material is kept away");
  /* controls: no reason, nothing sent; a switched-off account offers switching it on */
  const c = await worldOf();
  const n = await pageOf(c, c.ann);
  fill(n, { "pa-why": "" });
  assert.ok(says(await press(n, "projectaikeepaway"), "screen.projectai.keepaway.noreason"));
  assert.equal(n.byOp("projectaikeepaway").length, 0);
  const off = await worldOf({ on: false });
  const o = await pageOf(off, off.ann);
  assert.ok(says(main(o).querySelector('[data-account="off"]'), "screen.projectai.account.off"));
  await press(o, "projectaccountswitch");
  assert.deepEqual(o.byOp("projectaccountswitch")[0].body, { project: off.project, on: true });
  assert.equal((await off.ann.read("projectaccountstate", { query: { project: off.project } })).on, true);
  /* the switch and the removal, on the first page (the account on): switching off, then removing */
  const sw = await pageOf(w, w.ann);
  await press(sw, "projectaccountswitch");
  assert.deepEqual(sw.byOp("projectaccountswitch")[0].body, { project: w.project, on: false });
  await press(sw, "projectaccountremove");
  assert.deepEqual(sw.byOp("projectaccountremove")[0].body, { project: w.project });
  assert.equal((await w.ann.read("projectaccountstate", { query: { project: w.project } })).held, false, "the account is removed");
});

test("R14 keep-away on is drawn with who, when and the reason, and an owner may turn it off with a reason", async () => {
  const w = await worldOf({ keep: "the case is sealed" });
  const kept = await w.ann.read("projectaikeepawaystate", { query: { project: w.project } });
  const p = await pageOf(w, w.ann);
  assert.ok(says(main(p).querySelector('[data-keepaway="on"]'), "screen.projectai.keepaway.on", { who: "ann", date: day(kept.set_at, { year: true }), reason: "the case is sealed" }));
  assert.ok(says(button(p, "projectaikeepaway"), "screen.projectai.keepaway.turnoff"));
  fill(p, { "pa-why": "unsealed today" });
  await press(p, "projectaikeepaway");
  assert.deepEqual(p.byOp("projectaikeepaway")[0].body, { project: w.project, on: false, reason: "unsealed today" });
  assert.equal((await w.ann.read("projectaikeepawaystate", { query: { project: w.project } })).on, false, "turned off");
});

test("R14 controls: a participant who is no owner sees what pays and the keep-away, with no act and no panel; a notice read draws none", async () => {
  const w = await worldOf({ sole: false });
  await w.dev.act("projectkeynoticeseen", { body: { project: w.project } });
  const p = await pageOf(w, w.dev);
  const m = main(p);
  assert.deepEqual(actsIn(m), []);
  assert.ok(says(m, "screen.projectai.owners"));
  assert.ok(!m.querySelector('button[data-act="ailimitset"]'), "no panel");
  assert.ok(says(m.querySelector('[data-notice="seen"]'), "screen.projectai.notice.seen"));
  /* a project with no account says so */
  const c = await worldOf({ key: false });
  const none = await pageOf(c, c.ann);
  assert.ok(says(main(none).querySelector('[data-account="none"]'), "screen.projectai.account.none"));
  assert.ok(!actsIn(main(none)).includes("projectaccountswitch") && !actsIn(main(none)).includes("projectaccountremove"));
  /* an administrator who is no participant of a hidden project sees it unavailable (R60), no account act */
  const h = await worldOf({ hidden: true });
  const rosa = await h.world.signIn("rosa", { admin: true });
  const admin = await pageOf(h, rosa, { plane: SEEN(h.project) });
  assert.deepEqual(actsIn(main(admin)), []);
  assert.ok(says(main(admin), "shell.unavailable.notyours.says"));
});

test("R37 a member not joined to the project sees the not-joined state by key, with Join; never What pays failed", async () => {
  /* R60: a hidden project she is not in is unavailable, with no form */
  const h = await worldOf({ hidden: true });
  /* the real answers of a hidden project to her are NO_SUCH_PROJECT (C-70.5) and the shell draws "nothing is here"; the screen's own refusals (PROJECT_SEEN_NOT_A_PARTICIPANT) are scripted here
     over the real hidden project (needed: a project seen by her yet neither listed nor hers; no act makes one) */
  const seen = { status: 200, json: { ok: true, result: { ok: false, code: "PROJECT_SEEN_NOT_A_PARTICIPANT", reason: "PROJECT_SEEN_NOT_A_PARTICIPANT" } } };
  const hidden = await pageOf(h, h.dev, { plane: { ...SEEN(h.project), projectparticipants: seen, projectaccountstate: seen, projectkeynotice: seen, projectaikeepawaystate: seen } });
  assert.deepEqual(actsIn(main(hidden)), [], "no form");
  assert.ok(says(main(hidden), "shell.unavailable.notyours.says"));
  assert.ok(!says(main(hidden), "screen.projectai.account.head"), "never What pays");
  /* a findable project she has not joined: the real directory lists it to her */
  const w = await worldOf();
  const p = await pageOf(w, w.dev);
  const m = main(p);
  assert.ok(m.querySelector('[data-state="notjoined"]'));
  assert.ok(says(m, "projectai.notjoined", { project: "Pothole repairs" }));
  assert.deepEqual(actsIn(m), ["projectjoin"]);
  assert.ok(!says(m, "screen.projectai.account.head"), "never What pays");
  await press(p, "projectjoin");
  assert.equal(p.byOp("projectjoin")[0].query.projectId, w.project);
  /* control: a joined member sees the panel */
  assert.equal(main(await pageOf(w, w.ann)).querySelector('[data-state="notjoined"]'), null);
  assert.ok(says(main(await pageOf(w, w.ann)), "screen.projectai.account.head"));
});

test("R39 the title is the project's, never its id; a project with none draws undetermined", async () => {
  const w = await worldOf();
  const p = await pageOf(w, w.ann);
  for (const h of main(p).querySelectorAll("h1, h2")) assert.doesNotMatch(h.textContent, /PROJ-/);
  const bare = await pageOf(w, w.ann, { plane: { image: ok({ "bundle.md": `---\nid: ${w.project}\nobject_type: project\n---\n` }) } });
  assert.ok(main(bare).querySelector("h1").textContent.startsWith(word("state.undetermined", { reason: "" }).trim()));
});

test("R14 a joined participant who is not an owner sees what pays, read-only; the owner-only reads are neither made nor drawn for her", async () => {
  /* the real refusal (PROJECT_ACT_NOT_THE_OWNER) is what the world answers should the page ask her for an owner's read */
  const w = await worldOf({ sole: false });
  /* the plane answers a joined participant `{on, serving}` alone (ai-accounts R10); the screen reads a serving account as the project's key */
  const p = await pageOf(w, w.dev);
  const m = main(p);
  assert.ok(says(m.querySelector("[data-account]"), "screen.projectai.account.key"), "what pays, read");
  assert.ok(says(m, "screen.projectai.owners"));
  for (const op of ["accountuses", "ailimits", "aiusage", "accounthistory"]) assert.equal(p.byOp(op).length, 0, op + " is not read for her");
  assert.ok(!m.textContent.includes("PROJECT_ACT_NOT_THE_OWNER") && m.querySelector('[data-state="failed"]') === null, "no owner refusal drawn");
  assert.deepEqual(actsIn(m), ["projectkeynoticeseen"], "only the notice, a participant's own; no act of an owner's");
  /* control: an owner of the project reads and is drawn all four */
  const o = await pageOf(w, w.ann);
  for (const op of ["accountuses", "ailimits", "aiusage", "accounthistory"]) assert.equal(o.byOp(op).length, 1, op);
});

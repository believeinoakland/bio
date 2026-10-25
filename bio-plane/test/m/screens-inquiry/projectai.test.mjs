/* screens-inquiry R14, R37, R39: the project's AI account screen (`projectai`), on interface-shell's served page over a scripted
 * plane playing `credentials`' project account ops and `ai-use`'s, with screens-settings R9's panel drawn over the
 * project's account. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, storeWorld, main, actsIn, button, fill, press, rawKeys, says, section, word, day, SCREENS } from "./fixtures.mjs";

const AI = SCREENS.find((s) => s.id === "projectai");
const KEY = "sk-ant-api03-" + "7".repeat(40);
const OWN = { capabilities: ["contribute", "create_projects"] };
/* the agent runner's sign-in door (an environment binding, not an op of any module): it answers the `code` step with a sign-in token */
const RUNNER = { fetch: async (_url, init) => {
  const asked = JSON.parse(init.body);
  return Response.json({ ok: true, step: asked.step, member: asked.member, connected: true, token: "sk-ant-oat01-" + "a".repeat(40), valid_for: 3600 });
} };

/** The real state by real acts: mai makes the project "Pothole repairs" (so she owns it); `others` (default none) are members invited and joined;
 *  she holds the project's key (`projectkeyset`) unless `key: false`, her own sign-in is connected unless `connected: false`; `seen` has
 *  her read the notice. Answers the world, the members, the project's id and `page(as, plane?, path?)` booting a page over the world. */
async function state(o = {}) {
  const world = await storeWorld({ ai: true, env: { AGENT_WORKER: RUNNER } });
  const mai = await world.signIn("mai", OWN);
  const project = await world.recipes.project(mai, "Pothole repairs");
  const dev = await world.signIn("dev", OWN);
  if (!o.sole) {
    await mai.act("projectinvite", { query: { projectId: project, handle: "dev" }, body: {} });
    await dev.act("projectjoin", { query: { projectId: project }, body: {} });
  }
  if (o.connected !== false) await mai.act("subscriptionsignin", { body: { step: "code", code: "123456" } });
  await mai.act("reauth", { body: { password: mai.password } });   /* setting a key asks the password again (C-29.42) */
  if (o.key !== false) {
    await mai.act("projectkeyset", { body: { project, key: KEY } });
    if (o.off !== true) await mai.act("projectaccountswitch", { body: { project, on: true } });   /* a key is off when first set */
  }
  if (o.seen) await mai.act("projectkeynoticeseen", { body: { project } });
  const page = async (as, plane = {}, path = "/app/projectai/" + project) => {
    const { door, session } = world.boot(as);
    const b = await boot({ screens: SCREENS, door, session, path, plane });
    await b.settle();
    return b;
  };
  return { world, mai, dev, project, owner: "project:" + project, page };
}

test("R14 reads: the project's account, its notice and keep-away, her sign-in, and the panel's four reads over owner project:<id>", async () => {
  const { mai, project, owner, page } = await state();
  const p = await page(mai);
  const q = (op) => p.byOp(op)[0] && p.byOp(op)[0].query;
  assert.equal(q("projectaccountstate").project, project);
  assert.equal(q("projectkeynotice").project, project);
  assert.equal(q("projectaikeepawaystate").project, project);
  assert.equal(q("projectparticipants").projectId, project);
  assert.deepEqual(p.byOp("subscriptionsignin")[0].body, { step: "state" });
  /* K3419: the panel's four reads name the project's account, and are made for an owner only (below: never for a participant) */
  for (const op of ["accountuses", "ailimits", "aiusage", "accounthistory"]) assert.equal(q(op).owner, owner, op);
  assert.ok(p.root().querySelector(".cs-crumbs").textContent.includes("Pothole repairs") && says(p.root().querySelector(".cs-crumbs"), "screen.projectai.name"));
});

test("R14 drawn to an owner: what pays, the panel over the project's account (screens-settings R9), keep-away, and the eight acts", async () => {
  const { world, mai, project, owner, page } = await state({ sole: true });
  const set = (await mai.read("projectaccountstate", { query: { project } })).set_at;
  /* waits on: a use counted to the project's account (no recipe makes one: `askusage` counts to the member's own account, `ai-use` countUsage is no op) */
  const p = await page(mai, { aiusage: ok({ ok: true, owner, uses: [{ use: "ask", calls: 12, tokens: 34000, total_cost_usd: 1.2 }] }) });
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Pothole repairs");
  assert.ok(says(m.querySelector('[data-account="apikey"]'), "screen.projectai.account.key"));
  assert.ok(says(m, "screen.projectai.account.since", { who: "mai", date: day(set, { year: true }) }));
  /* the panel: its four sections, its use summed naming no member */
  assert.ok(m.querySelectorAll("section").length >= 4, "the panel's sections, drawn by screens-settings");
  assert.ok(m.textContent.includes("$1.20"));
  assert.ok(says(m.querySelector('[data-keepaway="off"]'), "screen.projectai.keepaway.off"));
  /* every act of the screen's own declaration but Join (R37), drawn to an owner */
  assert.deepEqual([...new Set(actsIn(m))].sort(), AI.acts.map((a) => a.op).filter((op) => op !== "projectjoin").sort());
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R14 projectkeyset sends the key in the body only, never drawn again", async () => {
  const { mai, project, page } = await state();
  const p = await page(mai);
  const field = main(p).querySelector('input[type="password"]');
  fill(p, { [field.getAttribute("id")]: KEY });
  await press(p, "projectkeyset");
  const r = p.byOp("projectkeyset")[0];
  assert.deepEqual(r.body, { project, key: KEY });
  for (const x of p.requests) {
    assert.ok(!x.url.includes(KEY), `${x.op} address`);
    if (x !== r) assert.ok(!JSON.stringify(x.body || {}).includes(KEY), `${x.op} body`);
  }
  assert.ok(!p.root().innerHTML.includes(KEY), "never drawn again");
  assert.equal(main(p).querySelector('input[type="password"]').value, "", "the field is empty again");
  for (const v of [...p.store.values(), ...p.local.values()]) assert.ok(!String(v).includes(KEY));
  /* control: no key, nothing sent */
  const n = await page(mai);
  assert.ok(says(await press(n, "projectkeyset"), "screen.projectai.key.nokey"));
  assert.equal(n.byOp("projectkeyset").length, 0);
});

test("R14 her own sign-in is offered only while the project has no other participant and her sign-in is connected", async () => {
  const sole = await state({ sole: true });
  const p = await sole.page(sole.mai);
  await press(p, "projectsigninset");
  assert.deepEqual(p.byOp("projectsigninset")[0].body, { project: sole.project });
  assert.equal((await sole.mai.read("projectaccountstate", { query: { project: sole.project } })).kind, "signin", "and it reached the store: her sign-in pays");
  const other = await state({ sole: false });
  assert.ok(!actsIn(main(await other.page(other.mai))).includes("projectsigninset"), "another participant");
  const off = await state({ sole: true, connected: false });
  assert.ok(!actsIn(main(await off.page(off.mai))).includes("projectsigninset"), "not connected");
  /* the owner's refusal by its words (ai.refused.notsole): the page drawn while she is alone, a member joined before she presses */
  const late = await state({ sole: true });
  const r = await late.page(late.mai);
  await late.mai.act("projectinvite", { query: { projectId: late.project, handle: "dev" }, body: {} });
  await late.dev.act("projectjoin", { query: { projectId: late.project }, body: {} });
  const slot = await press(r, "projectsigninset"); console.log("DBG", slot.textContent, "|", word("ai.refused.notsole", { project: "" }));
  assert.ok(says(slot, "ai.refused.notsole", { project: "" }));
});

test("R14 switch, remove, the notice, the panel's two acts and keep-away send what their owners take", async () => {
  const p = await openAi({}, { projectaccountswitch: ok({ ok: true, on: false }), projectaccountremove: ok({ ok: true, removed: true }),
    projectkeynoticeseen: ok({ ok: true, seen: true }), accountusesset: ok({ ok: true }), ailimitset: ok({ ok: true }), projectaikeepaway: ok({ ok: true }) });
  assert.ok(says(button(p, "projectaccountswitch"), "screen.projectai.switch.off"));
  await press(p, "projectaccountswitch");
  assert.deepEqual(p.byOp("projectaccountswitch")[0].body, { project: P, on: false });
  await press(p, "projectaccountremove");
  assert.deepEqual(p.byOp("projectaccountremove")[0].body, { project: P });
  /* the notice drawn before the first use, as it leaves the group */
  assert.ok(main(p).querySelector('[data-notice="projectkey"]').textContent.includes(NOTICE), "the notice as the plane answers it");
  await press(p, "projectkeynoticeseen");
  assert.deepEqual(p.byOp("projectkeynoticeseen")[0].body, { project: P });
  await press(p, "accountusesset");
  assert.equal(p.byOp("accountusesset")[0].body.owner, OWNER);
  fill(p, { "aio-amount": "5" });
  await press(p, "ailimitset", { within: p.doc.getElementById("aio-amount").parentElement.parentElement /* the panel's set-a-limit form (screens-settings R20 draws it as a plain block, not .cs-form) */ });
  assert.deepEqual([p.byOp("ailimitset")[0].body.owner, p.byOp("ailimitset")[0].body.amount], [OWNER, 5]);
  /* keep-away: what it does said first, on only with a reason */
  assert.ok(says(section(p, "screen.projectai.keepaway.head"), "act.projectaikeepaway.does"));
  fill(p, { "pa-why": "the case is sealed" });
  await press(p, "projectaikeepaway");
  assert.deepEqual(p.byOp("projectaikeepaway")[0].body, { project: P, on: true, reason: "the case is sealed" });
  /* controls: no reason, nothing sent; a switched-off account offers switching it on */
  const n = await openAi();
  fill(n, { "pa-why": "" });
  assert.ok(says(await press(n, "projectaikeepaway"), "screen.projectai.keepaway.noreason"));
  assert.equal(n.byOp("projectaikeepaway").length, 0);
  const off = await openAi({ state: { on: false } }, { projectaccountswitch: ok({ ok: true, on: true }) });
  assert.ok(says(main(off).querySelector('[data-account="off"]'), "screen.projectai.account.off"));
  await press(off, "projectaccountswitch");
  assert.deepEqual(off.byOp("projectaccountswitch")[0].body, { project: P, on: true });
});

test("R14 keep-away on is drawn with who, when and the reason, and an owner may turn it off with a reason", async () => {
  const p = await openAi({ keep: { on: true, reason: "the case is sealed", set_by: "dev", set_at: "2026-10-03T09:00:00Z" } }, { projectaikeepaway: ok({ ok: true }) });
  assert.ok(says(main(p).querySelector('[data-keepaway="on"]'), "screen.projectai.keepaway.on", { who: "dev", date: day("2026-10-03T09:00:00Z", { year: true }), reason: "the case is sealed" }));
  assert.ok(says(button(p, "projectaikeepaway"), "screen.projectai.keepaway.turnoff"));
  fill(p, { "pa-why": "unsealed today" });
  await press(p, "projectaikeepaway");
  assert.deepEqual(p.byOp("projectaikeepaway")[0].body, { project: P, on: false, reason: "unsealed today" });
});

test("R14 controls: a participant who is no owner sees what pays and the keep-away, with no act and no panel; a notice read draws none", async () => {
  const p = await open(at, { plane: { ...ai(), projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "dev", state: "joined", owner: true }, { handle: "mai", state: "joined", owner: false }] }),
    projectaccountstate: ok({ ok: true, on: true, serving: true }), projectkeynotice: ok({ ok: true, due: false, text: "x" }) } });
  const m = main(p);
  assert.deepEqual(actsIn(m), []);
  assert.ok(says(m, "screen.projectai.owners"));
  assert.ok(!m.querySelector('button[data-act="ailimitset"]'), "no panel");
  assert.ok(says(m.querySelector('[data-notice="seen"]'), "screen.projectai.notice.seen"));
  /* a project with no account says so */
  const none = await openAi({ state: { held: false, kind: null, on: false, set_at: null, by: null, serving: false } });
  assert.ok(says(main(none).querySelector('[data-account="none"]'), "screen.projectai.account.none"));
  assert.ok(!actsIn(main(none)).includes("projectaccountswitch") && !actsIn(main(none)).includes("projectaccountremove"));
  /* an administrator who is no participant of a hidden project sees it unavailable (R60), no account act */
  const admin = await open(at, { boot: { plane: { ...plane(), ...ai(), whoami: ok({ ...MEMBER, member: "rosa", handle: "rosa", administer: true }) } } });
  assert.deepEqual(actsIn(main(admin)), []);
  assert.ok(says(main(admin), "shell.unavailable.notyours.says"));
});

test("R37 a member not joined to the project sees the not-joined state by key, with Join; never What pays failed", async () => {
  const seen = { status: 200, json: { ok: true, result: { ok: false, code: "PROJECT_SEEN_NOT_A_PARTICIPANT", reason: "PROJECT_SEEN_NOT_A_PARTICIPANT" } } };
  /* R60: a hidden project she is not in is unavailable, with no form */
  const hidden = await openAi({}, { projectparticipants: seen, projectaccountstate: seen, projectkeynotice: seen, projectaikeepawaystate: seen });
  assert.deepEqual(actsIn(main(hidden)), [], "no form");
  assert.ok(says(main(hidden), "shell.unavailable.notyours.says"));
  assert.ok(!says(main(hidden), "screen.projectai.account.head"), "never What pays");
  for (const extra of [{ projectdirectory: ok({ ok: true, projects: [{ id: P, name: "Pothole repairs" }] }) }]) {
    const p = await openAi({}, { projectjoin: ok({ ok: true }), ...extra });
    const m = main(p);
    assert.ok(m.querySelector('[data-state="notjoined"]'));
    assert.ok(says(m, "projectai.notjoined", { project: "Pothole repairs" }));
    assert.deepEqual(actsIn(m), ["projectjoin"]);
    assert.ok(!says(m, "screen.projectai.account.head"), "never What pays");
    await press(p, "projectjoin");
    assert.equal(p.byOp("projectjoin")[0].query.projectId, P);
  }
  /* control: a joined member sees the panel */
  const j = await openAi({ sole: true });
  assert.equal(main(j).querySelector('[data-state="notjoined"]'), null);
  assert.ok(says(main(j), "screen.projectai.account.head"));
});

test("R39 the title is the project's, never its id; a project with none draws undetermined", async () => {
  const p = await openAi({ sole: true });
  for (const h of main(p).querySelectorAll("h1, h2")) assert.doesNotMatch(h.textContent, /PROJ-/);
  const bare = await openAi({ sole: true }, { image: ok({ "bundle.md": `---\nid: ${P}\nobject_type: project\n---\n` }) });
  assert.ok(main(bare).querySelector("h1").textContent.startsWith(word("state.undetermined", { reason: "" }).trim()));
});

test("R14 a joined participant who is not an owner sees what pays, read-only; the owner-only reads are neither made nor drawn for her", async () => {
  const notOwner = { projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "dev", state: "joined", owner: true }, { handle: "mai", state: "joined", owner: false }] }) };
  const refused = refusedIn("PROJECT_ACT_NOT_THE_OWNER");
  const p = await openAi({}, { ...notOwner, accountuses: refused, ailimits: refused, aiusage: refused, accounthistory: refused });
  const m = main(p);
  assert.ok(says(m.querySelector("[data-account]"), "screen.projectai.account.key"), "what pays, read");
  assert.ok(says(m, "screen.projectai.owners"));
  for (const op of ["accountuses", "ailimits", "aiusage", "accounthistory"]) assert.equal(p.byOp(op).length, 0, op + " is not read for her");
  assert.ok(!m.textContent.includes("PROJECT_ACT_NOT_THE_OWNER") && m.querySelector('[data-state="failed"]') === null, "no owner refusal drawn");
  assert.deepEqual(actsIn(m), ["projectkeynoticeseen"], "only the notice, a participant's own; no act of an owner's");
  /* control: an owner of the project reads and is drawn all four */
  const o = await openAi({ sole: true });
  for (const op of ["accountuses", "ailimits", "aiusage", "accounthistory"]) assert.equal(o.byOp(op).length, 1, op);
});

/* screens-inquiry R4, R6, R7: the assistant dock, on interface-shell's served page, opened from the masthead while the
 * assistant is reachable (its R20). The scripted plane plays credentials (`aicredentialmint`, `aicredentialrevoke`),
 * ai-runs (`airunopen`, `airun`, `airunlog`, `airunclose`), run-productions (`suggest`) and control-plane's member-run
 * door (`airundispatch`), recording every request with its address, body and `Authorization` header, so the tests follow
 * the minted credential's value through every request and every draw. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, SESSION } from "../interface-shell/harness.mjs";
import { open, plane, button, fill, P, Q, D } from "./fixtures.mjs";

const TOKEN = "aik-" + "7".repeat(64);
const UNTESTED = { kind: "untested", part: "check", set: "s", set_version: 1, words: "ai.label.untested" };
const SESSION_HEADER = "Bearer " + SESSION.t;

/* the run as the plane holds it; `status` moves when the run is closed or ends */
function stub({ untested = UNTESTED, dispatch = null, open: opened = null, mint = null, own = true } = {}) {
  const held = { status: "running", ticks: 1, entries: [] };
  return {
    held,
    ops: {
      assistantstate: ok({ on: true }),
      accountreference: ok({ held: own }),
      groupkeystate: ok({ held: true, on: true }),
      aiusage: ok({ ok: true, today: { used: "$0.42", limit: "$2.00" } }),
      agentpack: ok({ ok: true, pack: { version: "civicsmith@3+ab12cd" } }),
      aicredentialmint: (r) => mint || ok({ ok: true, minted: true, credential: { tokenId: r.body.tokenId }, token: TOKEN, tokenIsShownOnce: true }),
      aicredentialrevoke: (r) => ok({ ok: true, revoked: true, credential: { tokenId: r.query.tokenId } }),
      airunopen: (r) => opened || ok({ run: r.body.run, started: true, status: "running", ticks: 1, untested }),
      airundispatch: (r) => dispatch || ok({ run: r.body.run, found: true, dispatched: true, status: "running" }),
      airun: (r) => ok({ found: true, session: { id: r.query.run, status: held.status, ticks: held.ticks, untested, condition: held.condition } }),
      airunlog: (r) => ok({ run: r.query.run, found: true, entries: held.entries }),
      airunclose: () => { held.status = "terminated"; held.condition = "cancelled"; return ok({ found: true, terminated: true, status: "terminated" }); },
      suggest: (r) => ok({ record: { name: r.body.name, description: r.body.description } }),
    },
  };
}
async function dock(subject, s, extra = {}) {
  const screen = /^PROJ-/.test(subject) ? "project" : /^INFO-/.test(subject) ? "document" : "question";
  const p = await open(`/app/${screen}/${subject}`, { boot: { plane: { ...plane(), ...s.ops, ...extra } } });
  await p.click(p.root().querySelector('.cs-mast [data-shell="dock"]'));
  await p.settle();
  return p;
}
const panel = (p) => p.root().querySelector(".cs-dock");
const dockActs = (p) => panel(p).querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act"));
const workOn = async (p) => { await p.click(button(p, "airunopen", panel(p))); await p.settle(); };
const leaks = (p, value) => {
  const out = [];
  for (const r of p.requests) {
    if (r.url.includes(value)) out.push(`${r.op} address`);
    if (r.body !== undefined && JSON.stringify(r.body).includes(value)) out.push(`${r.op} body`);
  }
  if (p.root().innerHTML.includes(value)) out.push("drawn");
  for (const v of p.store.values()) if (String(v).includes(value)) out.push("session storage");
  for (const v of p.local.values()) if (String(v).includes(value)) out.push("local storage");
  if (p.location.pathname.includes(value)) out.push("address bar");
  return out;
};

test("R4 the panel says once what it is and never does, and whose account serves her (ai.account.*)", async () => {
  const p = await dock(Q, stub());
  const t = panel(p).textContent;
  assert.equal(t.split("never concludes, signs or sends").length - 1, 1);
  assert.match(t, /serves you here on: your own account/);
  assert.match(t, /\$0\.42 of your \$2\.00 today/);
  const g = await dock(Q, stub({ own: false }));
  assert.match(panel(g).textContent, /serves you here on: your group's key/);
});

test("R4 a project's own account serves her in its project; a document's run is its project's", async () => {
  const p = await dock(D, stub(), { projectaccountstate: ok({ ok: true, on: true, serving: "project" }) });
  assert.match(panel(p).textContent, /serves you here on: the project's account/);
  const b = button(p, "airunopen", panel(p));
  assert.deepEqual([b.getAttribute("data-ctx-type"), b.getAttribute("data-ctx-id")], ["project", P]);
  const none = await dock(D, stub(), { image: (r) => ok(r.query.id === D ? { "bundle.md": `---\nid: ${D}\n---\n` } : null) });
  assert.ok(!dockActs(none).includes("airunopen"));
  assert.match(panel(none).textContent, /works on a question or a project/);
});

test("R6 Work on this, on her own sign-in: a one-day member credential minted, the run opened and dispatched presenting it in the header only", async () => {
  const p = await dock(Q, stub());
  assert.deepEqual(dockActs(p), ["airunopen"]);
  await workOn(p);
  const [mint, opened, dispatch] = ["aicredentialmint", "airunopen", "airundispatch"].map((op) => p.byOp(op)[0]);
  /* the mint: under her session, a member credential, one day, its writes naming the ops it is presented to (K2999) */
  assert.equal(mint.headers.Authorization, SESSION_HEADER);
  assert.equal(mint.body.principalKind, "member");
  assert.equal(mint.body.expiresInDays, 1);
  assert.match(mint.body.tokenId, /^dock-[0-9a-f]{16}$/);
  assert.deepEqual(mint.body.writes, ["airunopen", "airundispatch", "airunclose", "suggest"]);
  /* the open and the dispatch present the credential, and only in the header; neither carries the session */
  assert.equal(opened.headers.Authorization, "Bearer " + TOKEN);
  assert.equal(dispatch.headers.Authorization, "Bearer " + TOKEN);
  assert.deepEqual(Object.keys(opened.body).sort(), ["bounds", "contextId", "contextType", "mode", "principalClaude", "run", "skillVersion"]);
  assert.deepEqual([opened.body.contextType, opened.body.contextId, opened.body.mode, opened.body.principalClaude, opened.body.skillVersion],
                   ["inquiry", Q, "check", "member:mai", "civicsmith@3+ab12cd"]);
  assert.deepEqual(opened.body.bounds, [{ bound: "wallclock", allowed: 1800000, unit: "ms" }, { bound: "fetches", allowed: 0 }, { bound: "subsessions", allowed: 0 }]);
  assert.match(opened.body.run, /^RUN-[0-9a-f]{16}$/);
  assert.deepEqual(dispatch.body, { run: opened.body.run });
  for (const r of p.requests) assert.ok(!(r.body && typeof r.body === "object" && "at" in r.body), `${r.op} sends at`);
  /* controls: no request address or body, no drawn text and no storage carries the value */
  assert.deepEqual(leaks(p, TOKEN), []);
  assert.deepEqual(leaks(p, TOKEN.slice(4)), []);
  assert.match(panel(p).textContent, /Started: the assistant is working on this/);
  assert.deepEqual(dockActs(p).sort(), ["airunclose", "suggest"]);
});

test("R6 the credential is revoked when the run is stopped, and when the run ends by itself", async () => {
  const s = stub();
  const p = await dock(Q, s);
  await workOn(p);
  const tokenId = p.byOp("aicredentialmint")[0].body.tokenId;
  await p.click(button(p, "airunclose", panel(p)));
  await p.settle();
  const close = p.byOp("airunclose")[0];
  assert.equal(close.headers.Authorization, "Bearer " + TOKEN);
  assert.deepEqual(close.body, { run: p.byOp("airunopen")[0].body.run, bound: "cancelled" });
  const rev = p.byOp("aicredentialrevoke");
  assert.equal(rev.length, 1);
  assert.equal(rev[0].query.tokenId, tokenId);
  assert.equal(rev[0].headers.Authorization, SESSION_HEADER);
  assert.match(panel(p).textContent, /The run ended/);
  assert.deepEqual(dockActs(p), ["airunopen"], "a new run may be started");
  assert.deepEqual(leaks(p, TOKEN), []);

  /* a run that ends by itself: seen ended at the next read of the run (after her next act), its credential revoked once,
     the dock still open */
  const s2 = stub();
  const q = await dock(Q, s2);
  await workOn(q);
  s2.held.status = "completed"; s2.held.condition = "completed";
  fill(q, { "assistant-suggest-name": "x", "assistant-suggest-description": "y" });
  await q.click(button(q, "suggest", panel(q)));
  await q.settle();
  assert.ok(panel(q), "the dock is still open");
  assert.equal(q.byOp("aicredentialrevoke").length, 1);
  assert.equal(q.byOp("airunclose").length, 0, "nothing to stop: the run ended by itself");
  assert.match(panel(q).textContent, /The run ended: completed/);
});

test("R6 the dock closed, or the page left: the run stopped under its credential and the credential revoked", async () => {
  for (const leave of ["dock", "pagehide", "navigate"]) {
    const p = await dock(Q, stub());
    await workOn(p);
    if (leave === "dock") await p.click(p.root().querySelector('.cs-mast [data-shell="dock"]'));
    if (leave === "pagehide") for (const f of p.win.listeners.pagehide || []) f({});
    if (leave === "navigate") await p.click(p.root().querySelector('a[href="/app/project/' + P + '"]'));
    await p.settle();
    assert.equal(p.byOp("airunclose")[0].headers.Authorization, "Bearer " + TOKEN, leave);
    assert.equal(p.byOp("aicredentialrevoke").length, 1, leave);
  }
  const idle = await dock(Q, stub());
  for (const f of idle.win.listeners.pagehide || []) f({});
  await idle.settle();
  assert.equal(idle.byOp("aicredentialrevoke").length + idle.byOp("airunclose").length, 0, "a dock holding none sends nothing");
});

test("R6 a reloaded dock offers a new run, the old one left on the record", async () => {
  const s = stub();
  const p = await dock(Q, s);
  await workOn(p);
  /* the page reloaded: a fresh page over the same plane holds no credential and no run */
  const again = await dock(Q, s);
  assert.match(panel(again).textContent, /No run yet/);
  assert.deepEqual(dockActs(again), ["airunopen"]);
  assert.equal(again.byOp("airunclose").length, 0);
});

test("R6 the door's withholdings and refusals drawn by their words; a refused open revokes the credential minted for it", async () => {
  const cases = [["MEMBER_PRINCIPAL_RUN", /not opened on your own credential/], ["MEMBER_RUN_MODE_NOT_ADMITTED", /Only a check or a plan/],
                 ["AI_RUN_NOT_PRINCIPAL", /not yours to start/], ["AGENT_WORKER_UNBOUND", /worker isn't connected/]];
  for (const [code, says] of cases) {
    const p = await dock(Q, stub({ dispatch: ok({ run: "x", found: true, dispatched: false, reason: code }) }));
    await workOn(p);
    assert.match(panel(p).querySelector('[data-refusal="airundispatch"]').textContent, says, code);
  }
  const gone = await dock(Q, stub({ dispatch: ok({ found: false }) }));
  await workOn(gone);
  assert.ok(panel(gone).querySelector('[data-refusal="airundispatch"]'));
  const refused = await dock(Q, stub({ open: refusedIn("AI_RUN_MODE_NOT_DEPLOYED") }));
  await workOn(refused);
  assert.match(panel(refused).textContent, /can't do this kind of work yet/);
  assert.equal(refused.byOp("aicredentialrevoke").length, 1);
  assert.equal(refused.byOp("airundispatch").length, 0);
});

test("R6 only a check is started, and only with the pack named", async () => {
  const p = await dock(Q, stub());
  await workOn(p);
  assert.equal(p.byOp("airunopen")[0].body.mode, "check");
  const nopack = await dock(Q, stub(), { agentpack: refusedIn("PACK_UNDETERMINED") });
  assert.ok(!dockActs(nopack).includes("airunopen"));
  assert.match(panel(nopack).textContent, /isn't ready to work here/);
});

test("R4 refusals by their words: mode not deployed, kept away, no account, use switched off, limit reached", async () => {
  const cases = [["AI_RUN_MODE_NOT_DEPLOYED", /can't do this kind of work yet/], ["AI_KEPT_AWAY", /keeps its material away from AI/],
                 ["AI_NO_ACCOUNT", /No account serves you/], ["AI_USE_SWITCHED_OFF", /switched off on your account/], ["AI_LIMIT_REACHED", /limit for Runs is reached/]];
  const fields = { whose: "your", period: "daily", use: "Runs", when: "tomorrow" };
  for (const [code, says] of cases) for (const where of ["mint", "open"]) {
    const refusal = { status: 200, json: { ok: true, result: { ok: false, reason: code, code, ...fields } } };
    const p = await dock(Q, stub(where === "mint" ? { mint: refusal } : { open: refusal }));
    await workOn(p);
    assert.match(panel(p).textContent, says, `${code} at ${where}`);
    assert.ok(dockActs(p).includes("airunopen"), "the panel stays, the act stays");
  }
});

test("R4 R7 the run's productions drawn as machine work, never evidence, each carrying the run's untested label", async () => {
  const s = stub();
  s.held.entries = [{ says: "The work orders cite \"AI 4.12\" in their category field." }];
  const p = await dock(Q, s);
  await workOn(p);
  fill(p, { "assistant-suggest-name": "Cite the column", "assistant-suggest-description": "Cite the category column" });
  await p.click(button(p, "suggest", panel(p)));
  await p.settle();
  const sug = p.byOp("suggest")[0];
  assert.equal(sug.headers.Authorization, "Bearer " + TOKEN);
  assert.deepEqual(sug.body, { target: Q, kind: "sharpen-question", run: p.byOp("airunopen")[0].body.run, name: "Cite the column", description: "Cite the category column" });
  const items = panel(p).querySelectorAll(".cs-machine");
  assert.equal(items.length, 2, "the log's production and the suggestion");
  for (const it of items) {
    assert.ok(it.querySelector('.cs-origin[data-origin="machine"]'));
    assert.match(it.querySelector('[data-label="untested"]').textContent, /^Not yet tested: this part of the assistant/);
    assert.match(it.textContent, /counts only once a member accepts it/);
    assert.equal(it.querySelector(".cs-grade"), null, "never drawn as evidence, with a grade");
  }
  assert.match(items[0].textContent, /category field/);
  assert.match(items[1].textContent, /Cite the category column/);
});

test("R7 control: an output of a run the plane did not mark untested carries no such label", async () => {
  const s = stub({ untested: null });
  s.held.entries = [{ says: "A production." }];
  const p = await dock(Q, s);
  await workOn(p);
  assert.match(panel(p).textContent, /A production\./);
  assert.equal(panel(p).querySelector('[data-label="untested"]'), null);
  assert.ok(!/Not yet tested/.test(panel(p).textContent));
});

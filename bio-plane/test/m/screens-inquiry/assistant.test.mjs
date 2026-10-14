/* screens-inquiry R4, R6, R7, R8, R13: the assistant dock, on interface-shell's served page, opened from the masthead
 * while the assistant is reachable (its R20). The scripted plane plays ai-runs (`airunopen`, `airun`, `airuns`,
 * `airunlog`, `airunclose`), run-productions (`suggest`) and control-plane's member-run door (`airundispatch`), recording
 * every request with its address, body and `Authorization` header, so the tests find that the dock sends only her
 * session and holds no credential (R13). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, SESSION } from "../interface-shell/harness.mjs";
import { open, plane, button, fill, P, Q, D } from "./fixtures.mjs";

const UNTESTED = { kind: "untested", part: "check", set: "s", set_version: 1, words: "ai.label.untested" };
const SESSION_HEADER = "Bearer " + SESSION.t;
const OLD = "RUN-" + "a".repeat(16);

/* the run as the plane holds it; `status` moves when the run is closed or ends; `runs` what `airuns` answers */
function stub({ untested = UNTESTED, dispatch = null, open: opened = null, runs = [] } = {}) {
  const held = { status: "running", ticks: 1, entries: [] };
  return {
    held,
    ops: {
      assistantstate: ok({ on: true }),
      accountreference: ok({ held: true }),
      groupkeystate: ok({ held: true, on: true }),
      aiusage: ok({ ok: true, today: { used: "$0.42", limit: "$2.00" } }),
      agentpack: ok({ ok: true, pack: { version: "civicsmith@3+ab12cd" } }),
      airuns: (r) => ok({ ok: true, context: { type: r.query.contextType, id: r.query.contextId }, runs, count: runs.length }),
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
const CREDENTIAL_OPS = ["aicredentialmint", "aicredentialrevoke"];

test("R4 the panel says once what it is and never does, and whose account serves her (ai.account.*)", async () => {
  const p = await dock(Q, stub());
  const t = panel(p).textContent;
  assert.equal(t.split("never concludes, signs or sends").length - 1, 1);
  assert.match(t, /serves you here on: your own account/);
  assert.match(t, /\$0\.42 of your \$2\.00 today/);
  const g = await dock(Q, stub(), { accountreference: ok({ held: false }) });
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

test("R6 R13 Work on this opens the run under her session and starts its segment through the door with run alone; the dock holds no credential", async () => {
  const p = await dock(Q, stub());
  assert.deepEqual(dockActs(p), ["airunopen"]);
  await workOn(p);
  const [opened, dispatch] = ["airunopen", "airundispatch"].map((op) => p.byOp(op)[0]);
  assert.deepEqual(Object.keys(opened.body).sort(), ["bounds", "contextId", "contextType", "mode", "principalClaude", "run", "skillVersion"]);
  assert.deepEqual([opened.body.contextType, opened.body.contextId, opened.body.mode, opened.body.principalClaude, opened.body.skillVersion],
                   ["inquiry", Q, "check", "member:mai", "civicsmith@3+ab12cd"]);
  assert.deepEqual(opened.body.bounds, [{ bound: "wallclock", allowed: 1800000, unit: "ms" }, { bound: "fetches", allowed: 0 }, { bound: "subsessions", allowed: 0 }]);
  assert.match(opened.body.run, /^RUN-[0-9a-f]{16}$/);
  assert.deepEqual(dispatch.body, { run: opened.body.run }, "run alone");
  assert.ok(p.requests.indexOf(dispatch) > p.requests.indexOf(opened));
  /* controls: no request the dock sends mints, revokes or presents an `ai` credential, in a header, body or address */
  for (const op of CREDENTIAL_OPS) assert.equal(p.byOp(op).length, 0, `${op} is never sent`);
  /* the page's one public read (`bootstrap`, interface-shell R36) carries no header at all */
  for (const r of p.requests.filter((x) => x.op !== "bootstrap")) {
    assert.equal(r.headers.Authorization, SESSION_HEADER, `${r.op} carries her session alone`);
    const said = JSON.stringify(r.body || {}) + r.url;
    assert.ok(!/token|credential|bearer|aik-/i.test(said), `${r.op} carries no credential`);
    assert.ok(!(r.body && typeof r.body === "object" && "at" in r.body), `${r.op} sends at`);
  }
  for (const v of [...p.store.values(), ...p.local.values()]) assert.ok(!/RUN-|token/i.test(String(v)), "nothing of the run is stored");
  assert.match(panel(p).textContent, /Started: the assistant is working on this/);
  assert.deepEqual(dockActs(p).sort(), ["airunclose", "suggest"]);
});

test("R13 a reloaded dock continues her running run by the same act: airundispatch for that run, nothing opened anew", async () => {
  const mine = { id: OLD, status: "running", ticks: 3, principal: { plane: "member:mai", claude: "member:mai" } };
  const p = await dock(Q, stub({ runs: [mine] }));
  assert.deepEqual([p.byOp("airuns")[0].query.contextType, p.byOp("airuns")[0].query.contextId], ["inquiry", Q]);
  assert.match(panel(p).textContent, /A run of yours is working on this/);
  assert.ok(dockActs(p).includes("airunopen"), "the same act");
  await workOn(p);
  assert.equal(p.byOp("airunopen").length, 0, "no new run");
  assert.deepEqual(p.byOp("airundispatch").map((r) => r.body), [{ run: OLD }]);
  assert.equal(p.byOp("airundispatch")[0].headers.Authorization, SESSION_HEADER);
  assert.match(panel(p).textContent, /Started: the assistant is working on this/);
  /* one opened before T47 on a member credential of hers is hers too */
  const pre = await dock(Q, stub({ runs: [{ ...mine, principal: { plane: "member:mai/dock-0123456789abcdef" } }] }));
  await workOn(pre);
  assert.deepEqual(pre.byOp("airundispatch").map((r) => r.body), [{ run: OLD }]);
  /* controls: another member's running run, or one of hers that ended, is not continued: a new run is opened */
  for (const run of [{ ...mine, principal: { plane: "member:dev" } }, { ...mine, status: "completed" }]) {
    const q = await dock(Q, stub({ runs: [run] }));
    assert.match(panel(q).textContent, /No run yet/);
    await workOn(q);
    assert.equal(q.byOp("airunopen").length, 1);
    assert.notEqual(q.byOp("airundispatch")[0].body.run, OLD);
  }
});

test("R8 a run the dock started is read again on the page clock, at most every 10 seconds, so one that ended by itself is drawn ended", async () => {
  const s = stub();
  const p = await dock(Q, s);
  await workOn(p);
  const reads = () => p.byOp("airun").length;
  const before = reads();
  await p.clock.tick(9000);
  assert.equal(reads(), before, "not before 10 seconds");
  await p.clock.tick(1000);
  assert.equal(reads(), before + 1, "once at 10 seconds");
  s.held.status = "completed"; s.held.condition = "completed";
  await p.clock.tick(10000);
  assert.match(panel(p).textContent, /The run ended: completed/, "without her next act");
  assert.ok(dockActs(p).includes("airunopen"), "a new run may be started");
  const ended = reads();
  await p.clock.tick(60000);
  assert.equal(reads(), ended, "an ended run is not read again");
  /* control: once she leaves the screen, the timer set before never fires */
  const q = await dock(Q, stub());
  await workOn(q);
  await q.click(q.root().querySelector('a[href="/app/project/' + P + '"]'));
  await q.settle();
  const left = q.byOp("airun").filter((r) => r.query.run === q.byOp("airunopen")[0].body.run).length;
  await q.clock.tick(60000);
  assert.equal(q.byOp("airun").filter((r) => r.query.run === q.byOp("airunopen")[0].body.run).length, left);
});

test("R4 R13 Stop the run closes it under her session; a new run may then be started", async () => {
  const s = stub();
  const p = await dock(Q, s);
  await workOn(p);
  await p.click(button(p, "airunclose", panel(p)));
  await p.settle();
  const close = p.byOp("airunclose")[0];
  assert.equal(close.headers.Authorization, SESSION_HEADER);
  assert.deepEqual(close.body, { run: p.byOp("airunopen")[0].body.run, bound: "cancelled" });
  assert.match(panel(p).textContent, /The run ended/);
  assert.deepEqual(dockActs(p), ["airunopen"]);
  for (const op of CREDENTIAL_OPS) assert.equal(p.byOp(op).length, 0);
  /* a run of hers found after a reload may be stopped too */
  const q = await dock(Q, stub({ runs: [{ id: OLD, status: "running", principal: { plane: "member:mai" } }] }));
  await q.click(button(q, "airunclose", panel(q)));
  await q.settle();
  assert.deepEqual(q.byOp("airunclose").map((r) => r.body), [{ run: OLD, bound: "cancelled" }]);
  /* the dock closed or the page left stops nothing: the run continues, to be continued from a reloaded dock */
  const r = await dock(Q, stub());
  await workOn(r);
  for (const f of r.win.listeners.pagehide || []) f({});
  await r.settle();
  assert.equal(r.byOp("airunclose").length, 0);
});

test("R6 R13 the door's withholdings and refusals drawn by their words, beside the act", async () => {
  const cases = [["MEMBER_PRINCIPAL_RUN", /only on your own Claude sign-in/], ["MEMBER_RUN_MODE_NOT_ADMITTED", /can check or plan/],
                 ["AI_RUN_NOT_PRINCIPAL", /not yours to start/], ["AGENT_WORKER_UNBOUND", /worker isn't connected/],
                 ["ACCOUNT_MEMBER_NOT_ACTIVE", /membership is not active/], ["AI_RUN_CREDENTIAL_MALFORMED", /pass it needs to work for you was malformed/],
                 ["CREDENTIAL_RECORD_SILENT", /couldn't record the pass/],
                 ["AI_KEPT_AWAY", /keeps its material away from AI.*rosa set this on 2 October 2026: “court order”/s]];
  for (const [code, says] of cases) for (const how of ["withheld", "refused"]) {
    const answer = how === "withheld" ? ok({ run: "x", found: true, dispatched: false, reason: code, code, keep_away: { reason: "court order", set_by: "rosa", set_at: "2026-10-02T09:00:00Z" } })
      : { status: 200, json: { ok: true, result: { ok: false, reason: code, code, keep_away: { reason: "court order", set_by: "rosa", set_at: "2026-10-02T09:00:00Z" } } } };
    const p = await dock(Q, stub({ dispatch: answer }));
    await workOn(p);
    assert.match(panel(p).querySelector('[data-refusal="airundispatch"]').textContent, says, `${code} ${how}`);
    assert.ok(dockActs(p).includes("airunopen"), "the act stays");
  }
  const ended = await dock(Q, stub({ dispatch: ok({ run: "x", found: true, dispatched: false, status: "completed" }) }));
  await workOn(ended);
  assert.match(panel(ended).querySelector('[data-refusal="airundispatch"]').textContent, /has ended/);
  const gone = await dock(Q, stub({ dispatch: ok({ found: false }) }));
  await workOn(gone);
  assert.ok(panel(gone).querySelector('[data-refusal="airundispatch"]'));
  /* a refused open dispatches nothing */
  const refused = await dock(Q, stub({ open: refusedIn("AI_RUN_MODE_NOT_DEPLOYED") }));
  await workOn(refused);
  assert.match(panel(refused).textContent, /isn't switched on in your group's Civicsmith yet/);
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

test("R4 refusals of the open by their words: mode not deployed, kept away, no account, use switched off, limit reached", async () => {
  const cases = [["AI_RUN_MODE_NOT_DEPLOYED", /isn't switched on in your group's Civicsmith yet/], ["AI_KEPT_AWAY", /keeps its material away from AI/],
                 ["AI_NO_ACCOUNT", /No account serves the assistant for you yet/], ["AI_USE_SWITCHED_OFF", /switched off on your account/], ["AI_LIMIT_REACHED", /limit for Runs is reached/]];
  const fields = { whose: "your", period: "daily", use: "Runs", when: "tomorrow" };
  for (const [code, says] of cases) {
    const refusal = { status: 200, json: { ok: true, result: { ok: false, reason: code, code, ...fields } } };
    const p = await dock(Q, stub({ open: refusal }));
    await workOn(p);
    assert.match(panel(p).textContent, says, code);
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
  assert.equal(sug.headers.Authorization, SESSION_HEADER);
  assert.deepEqual(sug.body, { target: Q, kind: "sharpen-question", run: p.byOp("airunopen")[0].body.run, name: "Cite the column", description: "Cite the category column" });
  const items = panel(p).querySelectorAll(".cs-machinework");
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

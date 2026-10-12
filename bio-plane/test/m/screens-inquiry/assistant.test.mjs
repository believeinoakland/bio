/* screens-inquiry R4, R6, R7: the assistant dock, through the test stand-in kit over a stub plane. The stub plane plays
 * credentials (`aicredentialmint`, `aicredentialrevoke`), ai-runs (`airunopen`, `airun`, `airunlog`, `airunclose`),
 * run-productions (`suggest`) and control-plane's member-run door (`airundispatch`), and records every request with its
 * `Authorization` header, so the tests can follow the minted credential's value through every request and every draw. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { harness, okd, answer, refusal, SESSION } from "./kit.mjs";

const DOCK = SCREENS.find((s) => s.id === "assistant");
const Q = "INQ-2026-0001-seven-days";
const TOKEN = "aik-" + "7".repeat(64);
const UNTESTED = { kind: "untested", part: "check", set: "s", set_version: 1, words: "ai.label.untested" };
const DATA = (o = {}) => ({
  own: okd({ ok: true, reference: o.own === false ? null : { kind: "key", last4: "4f2a" } }),
  signin: okd({ ok: true, connected: false }),
  groupkey: okd({ ok: true, held: true, on: true }),
  usage: okd({ ok: true, today: { used: "$0.42", limit: "$2.00" } }),
  pack: okd({ ok: true, pack: { version: "civicsmith@3+ab12cd" } }),
});
/* a stub plane: the run is held as the plane would hold it; `status` moves when the run is closed or ends */
function stub({ untested = UNTESTED, dispatch = null, open = null, mint = null } = {}) {
  const held = { status: "running", ticks: 1, entries: [] };
  return {
    held,
    plane: {
      aicredentialmint: (r) => mint || ({ ok: true, result: { ok: true, minted: true, credential: { tokenId: r.body.tokenId }, token: TOKEN, tokenIsShownOnce: true } }),
      aicredentialrevoke: (r) => answer({ ok: true, revoked: true, credential: { tokenId: r.query.tokenId } }),
      airunopen: (r) => open || answer({ run: r.body.run, started: true, status: "running", ticks: 1, untested }),
      airundispatch: (r) => dispatch || answer({ run: r.body.run, found: true, dispatched: true, status: "running" }),
      airun: (r) => answer({ found: true, session: { id: r.query.run, status: held.status, ticks: held.ticks, untested, condition: held.condition } }),
      airunlog: (r) => answer({ run: r.query.run, found: true, entries: held.entries }),
      airunclose: () => { held.status = "terminated"; held.condition = "cancelled"; return answer({ found: true, terminated: true, status: "terminated" }); },
      suggest: (r) => answer({ record: { name: r.body.name, description: r.body.description } }),
    },
  };
}
const leaks = (h, value) => {
  const out = [];
  for (const r of h.requests) {
    if (JSON.stringify(r.query || {}).includes(value)) out.push(`${r.op} query`);
    if (r.body !== undefined && JSON.stringify(r.body).includes(value)) out.push(`${r.op} body`);
  }
  if (h.html.includes(value)) out.push("drawn text");
  return out;
};

test("R4 the panel says once what it is and never does, and whose account serves her (ai.account.*)", () => {
  const h = harness(DOCK, { subject: Q, data: DATA() });
  const html = h.render();
  assert.equal([...html.matchAll(/data-key="screen.assistant.says"/g)].length, 1);
  assert.match(html, /never concludes, signs or sends/);
  assert.match(html, /serves you here on:<\/span> <span data-key="ai.account.own.inline">your own account/);
  assert.match(html, /\$0\.42 of your \$2\.00 today/);
  const g = harness(DOCK, { subject: Q, data: DATA({ own: false }) });
  assert.match(g.render(), /data-key="ai.account.group.inline"/);
  assert.deepEqual(Object.fromEntries(Object.entries(DOCK.reads({ subject: Q })).map(([k, v]) => [k, v.op])),
    { own: "accountreference", signin: "subscriptionsignin", groupkey: "groupkeystate", usage: "aiusage", pack: "agentpack" });
});

test("R4 a project's own account serves her in its project; a document's run is its project's", async () => {
  const P = "PROJ-2026-0007";
  const h = harness(DOCK, { subject: "INFO-2026-0004", data: DATA(), plane: {
    image: () => answer({ "bundle.md": `---\nid: INFO-2026-0004\nproject: ${P}\n---\n` }),
    projectaccountstate: () => answer({ ok: true, on: true, serving: "project" }) } });
  h.render();
  const html = await h.settle();
  assert.match(html, /data-key="ai.account.project.inline"/);
  assert.match(html, /data-act="airunopen" data-tone="primary" data-ctx-type="project" data-ctx-id="PROJ-2026-0007"/);
  const none = harness(DOCK, { subject: "INFO-2026-0005", data: DATA(), plane: { image: () => answer({ "bundle.md": "---\nid: INFO-2026-0005\n---\n" }) } });
  none.render();
  await none.settle();
  assert.ok(!none.drawn().includes("airunopen"));
  assert.match(none.html, /screen.assistant.run.nocontext/);
});

test("R6 Work on this, on her own sign-in: a one-day member credential minted, the run opened and dispatched presenting it in the header only", async () => {
  const s = stub();
  const h = harness(DOCK, { subject: Q, data: DATA(), plane: s.plane });
  h.render();
  assert.deepEqual(h.drawn(), ["airunopen"]);
  assert.equal((await h.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "civicsmith@3+ab12cd" } })).sent, null);
  const [mint, open, dispatch] = ["aicredentialmint", "airunopen", "airundispatch"].map((op) => h.requests.find((r) => r.op === op));
  /* the mint: her session, a member credential, one day, its writes naming the ops it is presented to (K2999) */
  assert.equal(mint.authorization, `Bearer ${SESSION}`);
  assert.equal(mint.body.principalKind, "member");
  assert.equal(mint.body.expiresInDays, 1);
  assert.match(mint.body.tokenId, /^dock-[0-9a-f]{16}$/);
  assert.ok(mint.body.writes.includes("airunopen") && mint.body.writes.includes("airundispatch"));
  /* the open and the dispatch present the credential, and only in the header; neither carries the session */
  assert.equal(open.authorization, `Bearer ${TOKEN}`);
  assert.equal(dispatch.authorization, `Bearer ${TOKEN}`);
  assert.deepEqual(Object.keys(open.body).sort(), ["bounds", "contextId", "contextType", "mode", "principalClaude", "run", "skillVersion"]);
  assert.deepEqual([open.body.contextType, open.body.contextId, open.body.mode, open.body.principalClaude, open.body.skillVersion],
                   ["inquiry", Q, "check", "member:m1", "civicsmith@3+ab12cd"]);
  assert.deepEqual(dispatch.body, { run: open.body.run });
  /* controls: no request address or body, and no drawn text, carries the value */
  assert.deepEqual(leaks(h, TOKEN), []);
  assert.deepEqual(leaks(h, TOKEN.slice(4)), []);
  assert.match(h.html, /data-run="running">.*Started: the assistant is working on this/s);
  assert.deepEqual(h.drawn().sort(), ["airunclose", "suggest"]);
  /* held in the dock's memory alone (the shell's `ui`, never stored) */
  assert.equal(h.view.ui.cred.token, TOKEN);
});

test("R6 the credential is revoked when the run is stopped, and when the run ends by itself", async () => {
  const s = stub();
  const h = harness(DOCK, { subject: Q, data: DATA(), plane: s.plane });
  h.render();
  await h.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
  const tokenId = h.requests.find((r) => r.op === "aicredentialmint").body.tokenId;
  await h.press("airunclose");
  const close = h.requests.find((r) => r.op === "airunclose");
  assert.equal(close.authorization, `Bearer ${TOKEN}`);
  assert.deepEqual(close.body.run, h.view.ui.run.id);
  const rev = h.requests.filter((r) => r.op === "aicredentialrevoke");
  assert.equal(rev.length, 1);
  assert.deepEqual(rev[0].query, { tokenId });
  assert.equal(rev[0].authorization, `Bearer ${SESSION}`);
  assert.equal(h.view.ui.cred, null);
  assert.match(h.html, /data-run="ended"/);
  assert.deepEqual(h.drawn(), ["airunopen"], "a new run may be started");
  assert.deepEqual(leaks(h, TOKEN), []);

  /* a run that ends by itself: seen ended at the next read, its credential revoked once */
  const s2 = stub();
  const h2 = harness(DOCK, { subject: Q, data: DATA(), plane: s2.plane });
  h2.render();
  await h2.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
  s2.held.status = "completed"; s2.held.condition = "completed";
  h2.cs.set("seq", 9);
  h2.render();
  await h2.settle();
  await h2.settle();
  assert.equal(h2.requests.filter((r) => r.op === "aicredentialrevoke").length, 1);
  assert.equal(h2.view.ui.cred, null);
});

test("R6 the dock closed, or the page left: the run stopped under its credential and the credential revoked", async () => {
  const s = stub();
  const h = harness(DOCK, { subject: Q, data: DATA(), plane: s.plane });
  h.render();
  await h.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
  h.screen.closed(h.cs, h.view);
  await h.settle();
  assert.equal(h.requests.find((r) => r.op === "airunclose").authorization, `Bearer ${TOKEN}`);
  assert.equal(h.requests.filter((r) => r.op === "aicredentialrevoke").length, 1);
  assert.equal(h.view.ui.cred, null);
  /* a closed dock that holds none sends nothing */
  const idle = harness(DOCK, { subject: Q, data: DATA(), plane: s.plane });
  idle.screen.closed(idle.cs, idle.view);
  assert.equal(idle.requests.length, 0);
});

test("R6 a reloaded dock offers a new run; one holding a running run without its credential says it can't continue it", async () => {
  const fresh = harness(DOCK, { subject: Q, data: DATA(), plane: stub().plane, ui: {} });
  const html = fresh.render();
  assert.match(html, /screen.assistant.run.none/);
  assert.deepEqual(fresh.drawn(), ["airunopen"]);
  const lost = harness(DOCK, { subject: Q, data: DATA(), plane: stub().plane, ui: { run: { id: "RUN-1", status: "running" } } });
  lost.render();
  await lost.settle();
  assert.match(lost.html, /data-run="lost"/);
  assert.deepEqual(lost.drawn(), ["airunopen"], "a new run is offered; the old one is neither stopped nor continued");
});

test("R6 the door's withholdings and refusals drawn by their words; a refused open revokes the credential minted for it", async () => {
  const cases = [
    ["MEMBER_PRINCIPAL_RUN", "screen.assistant.dispatch.principal"], ["MEMBER_RUN_MODE_NOT_ADMITTED", "screen.assistant.dispatch.mode"],
    ["AI_RUN_NOT_PRINCIPAL", "screen.assistant.dispatch.notprincipal"], ["AGENT_WORKER_UNBOUND", "screen.assistant.dispatch.unbound"],
  ];
  for (const [code, key] of cases) {
    const h = harness(DOCK, { subject: Q, data: DATA(), plane: stub({ dispatch: answer({ run: "x", found: true, dispatched: false, reason: code }) }).plane });
    h.render();
    await h.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
    assert.match(h.html, new RegExp(`data-refusal="airundispatch"><span data-key="${key.replace(/\./g, "\\.")}"`), code);
  }
  const ended = harness(DOCK, { subject: Q, data: DATA(), plane: stub({ dispatch: answer({ found: false }) }).plane });
  ended.render();
  await ended.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
  assert.match(ended.html, /data-refusal="airundispatch">/);
  const refused = harness(DOCK, { subject: Q, data: DATA(), plane: stub({ open: refusal("AI_RUN_MODE_NOT_DEPLOYED") }).plane });
  refused.render();
  await refused.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
  assert.match(refused.html, /data-key="ai.refused.modenotdeployed"/);
  assert.equal(refused.requests.filter((r) => r.op === "aicredentialrevoke").length, 1);
  assert.equal(refused.requests.filter((r) => r.op === "airundispatch").length, 0);
  assert.equal(refused.view.ui.cred, null);
});

test("R6 only a check is started (the dock offers no other mode), and only on a member's own sign-in", async () => {
  const h = harness(DOCK, { subject: Q, data: DATA(), plane: stub().plane });
  h.render();
  await h.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
  assert.equal(h.requests.find((r) => r.op === "airunopen").body.mode, "check");
  const founder = harness(DOCK, { subject: Q, data: DATA(), me: { member: "", session: true, tokenClass: "admin" }, plane: stub().plane });
  founder.render();
  assert.ok(!founder.drawn().includes("airunopen"));
  const nopack = harness(DOCK, { subject: Q, data: { ...DATA(), pack: { state: "failed", refusal: { code: "PACK_UNDETERMINED" } } }, plane: stub().plane });
  nopack.render();
  assert.ok(!nopack.drawn().includes("airunopen"));
  assert.match(nopack.html, /screen.assistant.run.notready/);
});

test("R4 refusals by their words: mode not deployed, kept away, no account, use switched off, limit reached", async () => {
  const cases = [["AI_RUN_MODE_NOT_DEPLOYED", "ai.refused.modenotdeployed"], ["AI_KEPT_AWAY", "ai.refused.keptaway"], ["AI_NO_ACCOUNT", "ai.refused.noaccount"],
                 ["AI_USE_SWITCHED_OFF", "ai.refused.off"], ["AI_LIMIT_REACHED", "ai.refused.limit"]];
  for (const [code, key] of cases) {
    for (const where of ["mint", "open"]) {
      const s = stub(where === "mint" ? { mint: refusal(code, { whose: "your", period: "daily", use: "Runs", when: "tomorrow" }) } : { open: refusal(code, { whose: "your", period: "daily", use: "Runs", when: "tomorrow" }) });
      const h = harness(DOCK, { subject: Q, data: DATA(), plane: s.plane });
      h.render();
      await h.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
      assert.match(h.html, new RegExp(`data-key="${key.replace(/\./g, "\\.")}"`), `${code} at ${where}`);
      assert.ok(h.drawn().includes("airunopen"), "the screen stays, the act stays");
    }
  }
});

test("R4 R7 the run's productions drawn as machine work, never evidence, each carrying the run's untested label", async () => {
  const s = stub();
  s.held.entries = [{ says: "The work orders cite \"AI 4.12\" in their category field." }];
  const h = harness(DOCK, { subject: Q, data: DATA(), plane: s.plane, fields: { "assistant-suggest-name": "Cite the column", "assistant-suggest-description": "Cite the category column" } });
  h.render();
  await h.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
  await h.press("suggest", { data: { target: Q } });
  const sug = h.requests.find((r) => r.op === "suggest");
  assert.equal(sug.authorization, `Bearer ${TOKEN}`);
  assert.deepEqual(sug.body, { target: Q, kind: "sharpen-question", run: h.view.ui.run.id, name: "Cite the column", description: "Cite the category column" });
  const items = [...h.html.matchAll(/<div class="cs-machine" data-origin="machine">([\s\S]*?)<\/div>/g)].map((m) => m[1]);
  assert.equal(items.length, 2, "the log's production and the suggestion");
  for (const it of items) {
    assert.match(it, /data-mark="origin.machine"/);
    assert.match(it, /data-label="untested"><span data-key="ai.label.untested">Not yet tested/);
    assert.match(it, /data-key="screen.assistant.notevidence"/);
  }
  assert.ok(!/data-grade=/.test(h.html), "no production is drawn with a grade, as evidence would be");
  assert.match(items[0], /category field/);
  assert.match(items[1], /Cite the category column/);
});

test("R7 control: an output of a run the plane did not mark untested carries no such label", async () => {
  const s = stub({ untested: null });
  s.held.entries = [{ says: "A production." }];
  const h = harness(DOCK, { subject: Q, data: DATA(), plane: s.plane });
  h.render();
  await h.press("airunopen", { data: { ctxType: "inquiry", ctxId: Q, pack: "p@1" } });
  assert.match(h.html, /A production\./);
  assert.ok(!/ai\.label\.untested/.test(h.html));
});

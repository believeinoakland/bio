/* screens-inquiry R4, R6, R7: the assistant dock (registry screen `assistant`, frame `dock`; its 3 acts), drawn beside the
 * screen it serves while the assistant is reachable (interface-shell R20). `view.subject` is the served screen's subject:
 * a question (`INQ-`) or a project (`PROJ-`) is the run's context; a document's is the project it states.
 *
 * The member's own run (R6; K2892, K2947, K2976): at her "Work on this" on her own sign-in, the dock mints her a one-day
 * member-scoped `ai` credential (`op=aicredentialmint`, under her session), opens the run under it (`op=airunopen`) and
 * starts its segment through control-plane's member-run door (`op=airundispatch`), each of those two presenting the
 * credential in `Authorization` only (`cs.call`'s `bearer`, interface-shell R21 (K2998)). The value is held in the dock's
 * `ui`, which the shell keeps in page memory and never stores; it never enters a query, a body, the address, the record or
 * any drawn text, and it is revoked (`op=aicredentialrevoke`) when the run ends, is stopped, or the dock is closed
 * (`closed`). A page reloaded holds no `ui`, so it cannot continue that run; it offers a new one.
 *
 * Every AI output drawn (the run's productions, a suggestion) is machine work (`mark.origin.machine`), never evidence,
 * and carries the test-instance label `untested` the plane marks the run with (R7; `airun`'s `session.untested`, as
 * `airunlog` entries and `suggest` answers carry none, J4 (7)). Self-contained functions (interface-shell R21 (1)). */

import { OWN, ownRows } from "./words.mjs";

/** R4: who serves this member (interface-shell R20's three reads), her use today, and the pack the run names. */
function reads(view) {
  return {
    own: { op: "accountreference", query: {} },
    signin: { op: "subscriptionsignin", body: { step: "state" } },
    groupkey: { op: "groupkeystate", query: {} },
    usage: { op: "aiusage", query: {} },
    pack: { op: "agentpack", query: {} },
  };
}

/** R4, R6, R7: what the panel is, whose account serves her, the run (its state, its productions) and the three acts. */
function render(cs, view) {
  const ui = view.ui;
  const d = view.data || {};
  const subject = String(view.subject || "");
  const later = (key, op, query, token) => {
    const L = ui.later || (ui.later = {});
    const q = JSON.stringify(query) + "#" + (token || "");
    if (!L[key] || L[key].q !== q) {
      L[key] = { q, state: "loading" };
      const settle = (o) => { L[key] = Object.assign({ q }, o); cs.set("later", L); };
      cs.call(op, { query }).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
        if (!a || a.ok === false || (r && r.ok === false))
          settle({ state: "failed", refusal: { code: (r && (r.code || r.reason)) || (a && (a.code || a.reason)) || "" } });
        else if (r && r.found === false) settle({ state: "empty" });
        else settle({ state: "ok", value: r });
      }, () => settle({ state: "failed", refusal: null }));
    }
    return L[key];
  };
  const ok = (k) => d[k] && d[k].state === "ok" && d[k].value;
  const out = [];
  out.push(`<p class="cs-sub">${cs.w("screen.assistant.says")}</p>`);

  /* whose account serves her here (ai.account.*): a project's own account in a project that holds one switched on,
     else her own (a key or her Claude sign-in), else the group's key */
  let context = null;
  if (/^INQ-/.test(subject)) context = { type: "inquiry", id: subject };
  else if (/^PROJ-/.test(subject)) context = { type: "project", id: subject };
  else if (subject) {
    const im = later("context", "image", { id: subject });
    const m = im.state === "ok" && im.value && typeof im.value["bundle.md"] === "string" ? /^project:\s*(\S+)\s*$/m.exec(im.value["bundle.md"]) : null;
    if (m) context = { type: "project", id: m[1] };
  }
  const proj = context && context.type === "project" ? later("projectaccount", "projectaccountstate", { project: context.id }) : null;
  const ownHeld = (ok("own") && (d.own.value.reference || d.own.value.held || d.own.value.ref))
    || (ok("signin") && d.signin.value.connected === true);
  const groupOn = ok("groupkey") && d.groupkey.value.held && d.groupkey.value.on !== false;
  const account = proj && proj.state === "ok" && proj.value.serving === "project" ? "ai.account.project.inline"
    : ownHeld ? "ai.account.own.inline" : groupOn ? "ai.account.group.inline" : "";
  out.push(`<p>${account ? cs.w("screen.assistant.serves") + " " + cs.w(account) : cs.w("screen.assistant.serves.unknown")}</p>`);
  if (ok("usage") && d.usage.value.today && d.usage.value.today.used !== undefined && d.usage.value.today.limit !== undefined)
    out.push(`<p class="cs-meta">${cs.w("screen.assistant.use", { used: String(d.usage.value.today.used), limit: String(d.usage.value.today.limit) })}</p>`);

  /* the run */
  const run = ui.run || null;
  const said = ui.said ? `<p class="cs-refusal" role="alert" data-refusal="${cs.esc(ui.said.op || "")}">${ui.said.html}</p>` : "";
  let runPart = "";
  if (!run) {
    runPart = `<p>${cs.w("screen.assistant.run.none")}</p>`;
  } else {
    const st = later("run", "airun", { run: run.id }, String(ui.seq || 0));
    const log = later("log", "airunlog", { run: run.id, limit: "200" }, String(ui.seq || 0));
    const session = st.state === "ok" && st.value.session ? st.value.session : null;
    const status = session ? session.status : run.status;
    const untested = (session && session.untested) || run.untested || null;
    /* the run ended: its credential is revoked now (R6), once */
    if (status && status !== "running" && ui.cred && !ui.revoking) {
      ui.revoking = true;
      const tokenId = ui.cred.tokenId;
      cs.call("aicredentialrevoke", { query: { tokenId } }).then(() => { cs.set("cred", null); cs.set("revoking", false); },
                                                                 () => { cs.set("cred", null); cs.set("revoking", false); });
    }
    if (status === "running" && !ui.cred) runPart += `<p data-run="lost">${cs.w("screen.assistant.run.lost")}</p>`;
    else if (status === "running") runPart += `<p data-run="running">${run.dispatched ? cs.w("screen.assistant.run.dispatched") + " " : ""}${cs.w("screen.assistant.run.running", { ticks: String((session && session.ticks) || 1) })}</p>`;
    else if (status) runPart += `<p data-run="ended">${cs.w("screen.assistant.run.ended", { why: String((session && session.condition) || status) })}</p>`;
    const label = untested ? `<span class="cs-label" data-label="untested">${cs.w("ai.label.untested")}</span>` : "";
    const productions = [];
    if (log.state === "ok" && Array.isArray(log.value.entries))
      for (const e of log.value.entries) {
        const what = e && (e.says || e.text || e.summary || e.kind);
        if (what) productions.push(String(what));
      }
    for (const s of Array.isArray(ui.suggestions) ? ui.suggestions : []) productions.push(String(s));
    runPart += cs.sec("screen.assistant.productions.head", productions.length
      ? productions.map((p) => `<div class="cs-machine" data-origin="machine">${cs.mark("origin", "machine")}${label}`
          + `<p class="cs-rec">${cs.w("screen.assistant.production", { what: p })}</p>`
          + `<p class="cs-meta">${cs.w("screen.assistant.notevidence")}</p></div>`).join("")
      : `<p>${cs.w("screen.assistant.productions.empty")}</p>`);
  }
  out.push(cs.sec("screen.assistant.run.head", runPart + said));

  /* the acts on the screen's subject: "Work on this" only on a member's own sign-in, with a context and a pack */
  const pack = ok("pack") && ((d.pack.value.pack && (d.pack.value.pack.version || d.pack.value.pack.skillVersion)) || d.pack.value.version);
  const member = view.me && view.me.member;
  const running = run && !(ui.later && ui.later.run && ui.later.run.state === "ok" && ui.later.run.value.session
    && ui.later.run.value.session.status !== "running");
  if (!context) out.push(`<p class="cs-meta">${cs.w("screen.assistant.run.nocontext")}</p>`);
  else if (d.pack && d.pack.state !== "loading" && !pack) out.push(`<p class="cs-meta">${cs.w("screen.assistant.run.notready")}</p>`);
  if (context && pack && member && !(running && ui.cred))
    out.push(cs.act("airunopen", { label: "act.airunopen.label.assistant",
      data: { ctxType: context.type, ctxId: context.id, pack: String(pack) }, tone: "primary" }));
  if (running && ui.cred && context && context.type === "inquiry")
    out.push(cs.field("assistant-suggest-name", "screen.assistant.suggest.name", {})
      + cs.field("assistant-suggest-description", "screen.assistant.suggest.description", { area: true })
      + cs.act("suggest", { label: "act.suggest.label.assistant", data: { target: context.id } }));
  if (running && ui.cred) out.push(cs.act("airunclose", { label: "act.airunclose.label.assistant", data: {} }));
  return out.join("");
}

/** R4's three acts. Each runs its calls itself through `cs.call` (the run's calls present the run's credential, not the
 *  session), so `send` sends nothing through the shell and draws its outcome beside the acts. */
const acts = [
  { op: "airunopen", label: "act.airunopen.label.assistant",
    send(view, el, cs) {
      const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const res = (a) => (a && a.result !== undefined ? a.result : a);
      const refused = (a) => { const r = res(a); return !a || a.ok === false || !r || r.ok === false; };
      const words = {
        AI_RUN_MODE_NOT_DEPLOYED: "ai.refused.modenotdeployed", AI_KEPT_AWAY: "ai.refused.keptaway",
        PROJECT_AI_KEPT_AWAY: "ai.refused.projectkeptaway", AI_NO_ACCOUNT: "ai.refused.noaccount",
        AI_USE_SWITCHED_OFF: "ai.refused.off", AI_LIMIT_REACHED: "ai.refused.limit", AI_LIMIT_UNJUDGED: "ai.refused.limit.unjudged",
        MEMBER_PRINCIPAL_RUN: "screen.assistant.dispatch.principal", MEMBER_RUN_MODE_NOT_ADMITTED: "screen.assistant.dispatch.mode",
        AI_RUN_NOT_PRINCIPAL: "screen.assistant.dispatch.notprincipal", AGENT_WORKER_UNBOUND: "screen.assistant.dispatch.unbound",
        AI_RUN_NOT_RUNNING: "screen.assistant.dispatch.notrunning",
      };
      const sayRefusal = (op, a) => {
        const r = res(a) || {};
        const code = String(r.code || r.reason || (a && (a.code || a.reason)) || "");
        const fills = { whose: r.whose || "", period: r.period || "", use: r.use || "", Use: r.use || "", when: r.when || "",
                        who: r.who || "", for_uses: r.for_uses || "", member: r.member || "", date: r.date || "", reason: r.why || r.detail || code };
        const html = words[code] ? cs.w(words[code], fills)
          : r.translation ? cs.esc(r.translation) : cs.w("screen.assistant.dispatch.unknown", { reason: code });
        cs.set("said", { op, html });
      };
      const revoke = (tokenId) => cs.call("aicredentialrevoke", { query: { tokenId } }).then(() => null, () => null);
      const ctx = { type: el.dataset.ctxType, id: el.dataset.ctxId };
      const member = view.me && view.me.member;
      if (!member || !ctx.type || !ctx.id) return null;
      const tokenId = "dock-" + hex(16);
      const run = "RUN-" + hex(16);
      cs.set("said", null);
      cs.call("aicredentialmint", { body: { tokenId, principalKind: "member", expiresInDays: 1,
        writes: ["airunopen", "airundispatch", "airunclose", "suggest"] } }).then((m) => {
        const mr = res(m);
        if (refused(m) || !mr.token) return sayRefusal("airunopen", m);
        const token = mr.token;
        cs.set("cred", { tokenId, token });
        return cs.call("airunopen", { bearer: token, body: { run, contextType: ctx.type, contextId: ctx.id, mode: "check",
          principalClaude: "member:" + member, skillVersion: el.dataset.pack,
          bounds: [{ bound: "wallclock", allowed: 1800000, unit: "ms" }, { bound: "fetches", allowed: 0 }, { bound: "subsessions", allowed: 0 }] } })
          .then((o) => {
            if (refused(o)) { sayRefusal("airunopen", o); cs.set("cred", null); return revoke(tokenId); }
            const or = res(o);
            cs.set("run", { id: run, status: or.status || "running", untested: or.untested || null, dispatched: false });
            return cs.call("airundispatch", { bearer: token, body: { run } }).then((x) => {
              const xr = res(x);
              if (refused(x) || (xr && xr.found === false) || (xr && xr.dispatched === false)) return sayRefusal("airundispatch", x);
              cs.set("run", Object.assign({}, view.ui.run, { dispatched: true, status: (xr && xr.status) || "running" }));
              cs.set("seq", (view.ui.seq || 0) + 1);
            });
          });
      }, (e) => sayRefusal("airunopen", null));
      return null;
    } },
  { op: "suggest", label: "act.suggest.label.assistant",
    send(view, el, cs) {
      const cred = view.ui.cred, run = view.ui.run;
      if (!cred || !run) return null;
      const name = String(cs.value("assistant-suggest-name") || "").trim();
      const description = String(cs.value("assistant-suggest-description") || "").trim();
      cs.call("suggest", { bearer: cred.token, body: { target: el.dataset.target, kind: "sharpen-question", run: run.id, name, description } })
        .then((a) => {
          const r = a && a.result !== undefined ? a.result : a;
          if (!a || a.ok === false || !r || r.ok === false) {
            cs.set("said", { op: "suggest", html: r && r.translation ? cs.esc(r.translation) : cs.w("state.failed", { reason: (r && (r.code || r.reason)) || "" }) });
            return;
          }
          const rec = r.record || r;
          cs.set("suggestions", (Array.isArray(view.ui.suggestions) ? view.ui.suggestions : []).concat([String(rec.description || rec.name || name)]));
        }, () => cs.set("said", { op: "suggest", html: cs.w("state.failed", { reason: "" }) }));
      return null;
    } },
  { op: "airunclose", label: "act.airunclose.label.assistant",
    send(view, el, cs) {
      const cred = view.ui.cred, run = view.ui.run;
      if (!cred || !run) return null;
      const tokenId = cred.tokenId;
      const end = () => cs.call("aicredentialrevoke", { query: { tokenId } }).then(() => null, () => null).then(() => {
        cs.set("cred", null);
        cs.set("run", Object.assign({}, view.ui.run, { status: "cancelled" }));
        cs.set("seq", (view.ui.seq || 0) + 1);
      });
      cs.call("airunclose", { bearer: cred.token, body: { run: run.id, bound: "cancelled" } }).then(end, end);
      return null;
    } },
];

/** R6: the dock closed, or the page left: a run it opened is stopped and its credential revoked. */
function closed(cs, view) {
  const cred = view.ui && view.ui.cred;
  if (!cred) return;
  const run = view.ui.run;
  const revoke = () => cs.call("aicredentialrevoke", { query: { tokenId: cred.tokenId } }).then(() => null, () => null);
  view.ui.cred = null;
  if (run && run.status === "running")
    cs.call("airunclose", { bearer: cred.token, body: { run: run.id, bound: "cancelled" } }).then(revoke, revoke);
  else revoke();
}

/** The keys the dock may draw. */
const words = [
  "screen.assistant.name", "screen.assistant.purpose",
  ...["airunopen", "suggest", "airunclose"].flatMap((op) => ["act." + op + ".label.assistant", "act." + op + ".does"]),
  "ai.account.own.inline", "ai.account.group.inline", "ai.account.project.inline",
  "ai.refused.off", "ai.refused.limit", "ai.refused.projectkeptaway",
  OWN["ai.refused.modenotdeployed"], OWN["ai.refused.keptaway"], OWN["ai.refused.noaccount"], OWN["ai.refused.limit.unjudged"],
  OWN["ai.label.untested"], "mark.origin.machine.name", "mark.origin.machine.means",
  "state.empty", "state.loading", "state.failed",
  ...ownRows("screen.assistant."),
];

/** The assistant dock (interface-shell R20, R21). */
export const ASSISTANT_SCREEN = Object.freeze({ id: "assistant", reads, render, acts, words, closed });

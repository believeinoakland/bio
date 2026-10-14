/* screens-inquiry R4, R6, R7, R8, R13: the assistant dock (registry screen `assistant`, frame `dock`; its 3 acts), drawn
 * beside the screen it serves while the assistant is reachable (interface-shell R20). `view.subject` is the served
 * screen's subject: a question (`INQ-`) or a project (`PROJ-`) is the run's context; a document's is the project it
 * states.
 *
 * The member's own run (R6, R13; K2892; N955): at her "Work on this" on her own sign-in, the dock opens the run under
 * her session (`op=airunopen`) and starts its segment through control-plane's member-run door (`op=airundispatch`,
 * `{run}` alone), also under her session; the segment's `ai` credential is minted in the plane (`credentials` R63,
 * `ai-runs` R18), so the dock mints, holds, stores and draws none, and sends no `Authorization` but the session's. A
 * reloaded dock finds a run of hers still running on this context (`op=airuns`) and continues it by the same act
 * (`airundispatch` for that run). While a run it started or continued is running, it re-reads the run every 10 seconds
 * by `cs.later` on the page clock (R8; interface-shell R27), so a run that ended by itself is drawn ended without her
 * next act; the shell cancels the timer when she leaves the screen.
 *
 * Every AI output drawn (the run's productions, a suggestion) is machine work (`mark.origin.machine`), never evidence,
 * and carries the test-instance label `untested` the plane marks the run with (R7; `airun`'s `session.untested`, as
 * `airunlog` entries and `suggest` answers carry none, J4 (7)). Self-contained functions (interface-shell R21 (1)). */

import { ownRows } from "./words.mjs";
import * as settingsPanel from "../screens-settings/panel.mjs";

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

/** R4, R6–R8, R13: what the panel is, whose account serves her, the run (its state, its productions) and the three
 *  acts. */
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
          {
          const f = r && r.ok === false ? r : a || {};
          const code = String(f.code || f.reason || "");
          settle({ state: "failed", refusal: { code, words: cs.esc(f.translation || code) } });
        }
        else if (r && r.found === false) settle({ state: "empty" });
        else settle({ state: "ok", value: r });
      }, () => settle({ state: "failed", refusal: null }));
    }
    return L[key];
  };
  const ok = (k) => d[k] && d[k].state === "ok" && d[k].value;
  const out = [];
  out.push(`<p class="mk-sub">${cs.w("screen.assistant.says")}</p>`);

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
  /* no count is drawn at zero (R20) */
  if (ok("usage") && d.usage.value.today && /[1-9]/.test(String(d.usage.value.today.used)) && d.usage.value.today.limit !== undefined)
    out.push(`<p class="mk-small">${cs.w("screen.assistant.use", { used: String(d.usage.value.today.used), limit: String(d.usage.value.today.limit) })}</p>`);

  /* R17: the serving account's thirty days and meters (`screens-settings` R26's render, handed in as `view.parts`), only
     where she is one of that account's owners: her own account; a project's she owns (the read refuses anyone else,
     `ai-use` R12, and a refusal draws nothing, saying nothing of the account's use); the group's key to an
     administrator. An unreadable answer, or a read that fails, is drawn failed, never as zeros. */
  {
    const me = view.me && view.me.member;
    const owner = account === "ai.account.project.inline" && context ? "project:" + context.id
      : account === "ai.account.own.inline" && me ? "member:" + me
      : account === "ai.account.group.inline" && view.me && view.me.administer === true ? "group" : "";
    const bars = view.parts && view.parts.aiUsageBars;
    if (owner && typeof bars === "function") {
      const over = later("useover", "aiuseovertime", { owner });
      const refusedAsNonOwner = over.state === "failed" && over.refusal && over.refusal.code;
      if (over.state === "loading") out.push(cs.state({ state: "loading" }, () => ""));
      else if (over.state === "failed" && !refusedAsNonOwner) out.push(cs.state({ state: "failed", refusal: null }, () => ""));
      else if (over.state === "ok") {
        if (over.value && over.value.unreadable === true) out.push(cs.state({ state: "failed", refusal: null }, () => ""));
        else if (over.value && Array.isArray(over.value.days)) out.push(bars(cs, view, { owner, value: over.value }));
      }
    }
  }

  /* R13: a run of hers still running on this context, found again after a reload (her principal `member:<id>`, or
     `member:<id>/<tokenId>` for one opened before T47) */
  const member = view.me && view.me.member;
  let found = null;
  if (!ui.run && context && member) {
    const runs = later("runs", "airuns", { contextType: context.type, contextId: context.id, limit: "50" }, String(ui.seq || 0));
    const list = runs.state === "ok" && Array.isArray(runs.value.runs) ? runs.value.runs
      : [];
    const mine = (s) => s && s.principal && typeof s.principal.plane === "string"
      && (s.principal.plane === "member:" + member || s.principal.plane.startsWith("member:" + member + "/"));
    const r = list.find((s) => s && s.status === "running" && mine(s));
    if (r && r.id) found = { id: String(r.id), status: "running", untested: r.untested || null, dispatched: false, found: true };
  }

  /* the run */
  const run = ui.run || found;
  const said = ui.said ? `<p class="mk-msg" role="alert" data-refusal="${cs.esc(ui.said.op || "")}">${ui.said.html}</p>` : "";
  let runPart = "";
  let status = null;
  if (!run) {
    runPart = `<p>${cs.w("screen.assistant.run.none")}</p>`;
  } else {
    const st = later("run", "airun", { run: run.id }, String(ui.seq || 0));
    const log = later("log", "airunlog", { run: run.id, limit: "200" }, String(ui.seq || 0));
    const session = st.state === "ok" && st.value.session ? st.value.session : null;
    /* while the run is read again, the last answer stands (a read in flight is not the run's state) */
    if (session) ui.lastStatus = { run: run.id, status: session.status };
    status = session ? session.status : ui.lastStatus && ui.lastStatus.run === run.id ? ui.lastStatus.status : run.status;
    const untested = (session && session.untested) || run.untested || null;
    if (status === "running" && !run.dispatched) runPart += `<p data-run="yours">${cs.w("screen.assistant.run.yours")}</p>`;
    else if (status === "running") runPart += `<p data-run="running">${cs.w("screen.assistant.run.dispatched")} ${cs.w("screen.assistant.run.running", { ticks: String((session && session.ticks) || 1) })}</p>`;
    else if (status) runPart += `<p data-run="ended">${cs.w("screen.assistant.run.ended", { why: String((session && session.condition) || status) })}</p>`;
    /* R8: while the run this dock started or continued is running, read it again on the page clock, at most once
       every 10 seconds; the shell cancels the timer when she leaves the screen */
    if (session && status === "running" && ui.run && ui.run.dispatched && !ui.polling) {
      ui.polling = true;
      cs.later(10000, (k, v) => { v.ui.polling = false; k.set("seq", (v.ui.seq || 0) + 1); });
    }
    const label = untested ? `<span class="cs-draftlabel" data-label="untested">${cs.w("ai.label.untested")}</span>` : "";
    const productions = [];
    if (log.state === "ok" && Array.isArray(log.value.entries))
      for (const e of log.value.entries) {
        const what = e && (e.says || e.text || e.summary || e.kind);
        if (what) productions.push(String(what));
      }
    for (const s of Array.isArray(ui.suggestions) ? ui.suggestions : []) productions.push(String(s));
    /* a section that holds nothing is not drawn (R20) */
    if (productions.length) runPart += cs.sec("screen.assistant.productions.head",
      productions.map((p) => `<div class="cs-machinework" data-origin="machine">${cs.mark("origin", "machine")}${label}`
          + `<p class="rec">${cs.w("screen.assistant.production", { what: p })}</p>`
          + `<p class="mk-small">${cs.w("screen.assistant.notevidence")}</p></div>`).join(""));
  }
  out.push(cs.sec("screen.assistant.run.head", runPart + said));

  /* the acts on the screen's subject: "Work on this" only with a context and a pack, opening a run, or continuing a
     run of hers this page has not started; "Suggest" and "Stop the run" while one it started is running */
  const pack = ok("pack") && ((d.pack.value.pack && (d.pack.value.pack.version || d.pack.value.pack.skillVersion)) || d.pack.value.version);
  const running = !!run && status === "running";
  const started = running && ui.run && ui.run.dispatched;
  if (!context) out.push(`<p class="mk-small">${cs.w("screen.assistant.run.nocontext")}</p>`);
  else if (d.pack && d.pack.state !== "loading" && !pack) out.push(`<p class="mk-small">${cs.w("screen.assistant.run.notready")}</p>`);
  if (context && pack && member && !started)
    out.push(cs.act("airunopen", { label: "act.airunopen.label.assistant",
      data: { ctxType: context.type, ctxId: context.id, pack: String(pack), run: running ? run.id : "" }, tone: "primary" }));
  if (started && context && context.type === "inquiry")
    out.push(cs.field("assistant-suggest-name", "screen.assistant.suggest.name", {})
      + cs.field("assistant-suggest-description", "screen.assistant.suggest.description", { area: true })
      + cs.act("suggest", { label: "act.suggest.label.assistant", data: { target: context.id, run: run.id } }));
  if (running) out.push(cs.act("airunclose", { label: "act.airunclose.label.assistant", data: { run: run.id } }));
  return out.join("");
}

/** R4's three acts. Each runs its calls itself through `cs.call`, under her session alone (R13), so `send` sends
 *  nothing through the shell and draws its outcome beside the acts. */
const acts = [
  { op: "airunopen", label: "act.airunopen.label.assistant",
    send(view, el, cs) {
      const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const res = (a) => (a && a.result !== undefined ? a.result : a);
      const refused = (a) => { const r = res(a); return !a || a.ok === false || !r || r.ok === false; };
      /* the refusals and withholdings she may meet, by their words (R4, R6, R13; interface-shell R13) */
      const words = {
        AI_RUN_MODE_NOT_DEPLOYED: "ai.refused.notdeployed", AI_KEPT_AWAY: "ai.refused.keptaway",
        PROJECT_AI_KEPT_AWAY: "ai.refused.projectkeptaway", AI_NO_ACCOUNT: "ai.refused.noaccount",
        AI_USE_SWITCHED_OFF: "ai.refused.off", AI_LIMIT_REACHED: "ai.refused.limit", AI_LIMIT_UNJUDGED: "ai.refused.limit.unjudged",
        MEMBER_PRINCIPAL_RUN: "screen.assistant.dispatch.principal", MEMBER_RUN_MODE_NOT_ADMITTED: "refusal.MEMBER_RUN_MODE_NOT_ADMITTED",
        AI_RUN_NOT_PRINCIPAL: "screen.assistant.dispatch.notprincipal", AGENT_WORKER_UNBOUND: "screen.assistant.dispatch.unbound",
        AI_RUN_NOT_RUNNING: "screen.assistant.dispatch.notrunning", ACCOUNT_MEMBER_NOT_ACTIVE: "screen.assistant.dispatch.notactive",
        AI_RUN_CREDENTIAL_MALFORMED: "refusal.AI_RUN_CREDENTIAL_MALFORMED", CREDENTIAL_RECORD_SILENT: "screen.assistant.dispatch.silent",
      };
      const sayRefusal = (op, a) => {
        const r = res(a) || {};
        const code = String(r.code || r.reason || (a && (a.code || a.reason)) || (r.dispatched === false && r.status && r.status !== "running" ? "AI_RUN_NOT_RUNNING" : ""));
        const kept = r.keep_away || {};
        const fills = { whose: r.whose || "", period: r.period || "", use: r.use || "", Use: r.use || "", when: r.when || "",
                        who: r.who || "", for_uses: r.for_uses || "", member: r.member || kept.set_by || "",
                        date: r.date || (kept.set_at ? { html: cs.date(String(kept.set_at), { year: true }) } : ""),
                        reason: kept.reason || r.why || r.detail || code };
        const html = words[code] ? cs.w(words[code], fills)
          : r.translation ? cs.esc(r.translation) : cs.w("screen.assistant.dispatch.unknown", { reason: code });
        cs.set("said", { op, html });
      };
      /* the segment started through the member-run door, `run` alone, under her session (R13) */
      const dispatch = (run) => cs.call("airundispatch", { body: { run } }).then((x) => {
        const xr = res(x);
        if (refused(x) || (xr && xr.found === false) || (xr && xr.dispatched === false)) return sayRefusal("airundispatch", x);
        cs.set("run", Object.assign({}, view.ui.run, { dispatched: true, status: (xr && xr.status) || "running" }));
        cs.set("seq", (view.ui.seq || 0) + 1);
      }, () => sayRefusal("airundispatch", null));
      const ctx = { type: el.dataset.ctxType, id: el.dataset.ctxId };
      const member = view.me && view.me.member;
      if (!member || !ctx.type || !ctx.id) return null;
      cs.set("said", null);
      /* R13: a running run of hers this page has not started (a reloaded dock) is continued by the same act */
      if (el.dataset.run) {
        cs.set("run", { id: String(el.dataset.run), status: "running", untested: null, dispatched: false });
        dispatch(String(el.dataset.run));
        return null;
      }
      const run = "RUN-" + hex(16);
      cs.call("airunopen", { body: { run, contextType: ctx.type, contextId: ctx.id, mode: "check",
        principalClaude: "member:" + member, skillVersion: el.dataset.pack,
        bounds: [{ bound: "wallclock", allowed: 1800000, unit: "ms" }, { bound: "fetches", allowed: 0 }, { bound: "subsessions", allowed: 0 }] } })
        .then((o) => {
          if (refused(o)) return sayRefusal("airunopen", o);
          const or = res(o);
          cs.set("run", { id: run, status: or.status || "running", untested: or.untested || null, dispatched: false });
          return dispatch(run);
        }, () => sayRefusal("airunopen", null));
      return null;
    } },
  { op: "suggest", label: "act.suggest.label.assistant",
    send(view, el, cs) {
      const run = view.ui.run;
      if (!run) return null;
      const name = String(cs.value("assistant-suggest-name") || "").trim();
      const description = String(cs.value("assistant-suggest-description") || "").trim();
      cs.call("suggest", { body: { target: el.dataset.target, kind: "sharpen-question", run: run.id, name, description } })
        .then((a) => {
          const r = a && a.result !== undefined ? a.result : a;
          if (!a || a.ok === false || !r || r.ok === false) {
            cs.set("said", { op: "suggest", html: r && r.translation ? cs.esc(r.translation) : cs.w("state.failed", { reason: (r && (r.code || r.reason)) || "" }) });
            return;
          }
          const rec = r.record || r;
          cs.set("suggestions", (Array.isArray(view.ui.suggestions) ? view.ui.suggestions : []).concat([String(rec.description || rec.name || name)]));
          /* the run read again: a run that ended since is seen ended */
          cs.set("seq", (view.ui.seq || 0) + 1);
        }, () => cs.set("said", { op: "suggest", html: cs.w("state.failed", { reason: "" }) }));
      return null;
    } },
  { op: "airunclose", label: "act.airunclose.label.assistant",
    send(view, el, cs) {
      const id = String(el.dataset.run || (view.ui.run && view.ui.run.id) || "");
      if (!id) return null;
      const end = () => {
        cs.set("run", Object.assign({ id, untested: null, dispatched: false }, view.ui.run, { status: "cancelled" }));
        cs.set("seq", (view.ui.seq || 0) + 1);
      };
      cs.call("airunclose", { body: { run: id, bound: "cancelled" } }).then(end, end);
      return null;
    } },
];

/** The keys the dock may draw. */
const words = [
  "screen.assistant.name", "screen.assistant.purpose",
  ...["airunopen", "suggest", "airunclose"].flatMap((op) => ["act." + op + ".label.assistant", "act." + op + ".does"]),
  "ai.account.own.inline", "ai.account.group.inline", "ai.account.project.inline",
  "ai.refused.off", "ai.refused.limit", "ai.refused.projectkeptaway", "ai.refused.notdeployed", "ai.refused.keptaway",
  "ai.refused.noaccount", "ai.refused.limit.unjudged", "refusal.MEMBER_RUN_MODE_NOT_ADMITTED", "refusal.AI_RUN_CREDENTIAL_MALFORMED",
  "ai.label.untested", "mark.origin.machine.name", "mark.origin.machine.means",
  "state.empty", "state.loading", "state.failed",
  ...ownRows("screen.assistant."),
];

/** The assistant dock (interface-shell R20, R21). */
export const ASSISTANT_SCREEN = Object.freeze({ id: "assistant", reads, render, acts, words,
  parts: Object.freeze(settingsPanel.aiUsageBars ? { aiUsageBars: settingsPanel.aiUsageBars } : {}) });

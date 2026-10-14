/* screens-inquiry R4, R6, R7, R8, R13, R33, R42: the assistant dock (registry screen `assistant`, frame `dock`; its 3
 * acts), drawn beside the screen it serves while the assistant is reachable (interface-shell R20). `view.subject` is the
 * served screen's subject: a question (`INQ-`) or a project (`PROJ-`) is the run's context; a document's is the project
 * it states.
 *
 * The member's own run (R6, R13; K2892; N955): at her "Work on this" on her own sign-in, the dock opens the run under
 * her session (`op=airunopen`) and starts its segment through control-plane's member-run door (`op=airundispatch`,
 * `{run}` alone), also under her session; the segment's `ai` credential is minted in the plane (`credentials` R63,
 * `ai-runs` R18), so the dock mints, holds, stores and draws none, and sends no `Authorization` but the session's. A
 * reloaded dock finds a run of hers still running on this context (`op=airuns`) and continues it by the same act.
 * While a run it dispatched is running, it re-reads the run every 10 seconds by `cs.later` on the page clock (R8;
 * interface-shell R27), so a run that ended by itself is drawn ended without her next act.
 *
 * R33: the run is opened with the bounds its mode needs (`MODE_BOUNDS`, handed in as `view.parts.bounds`), never a zero
 * allowance; an open answered `started: false` is a refusal and nothing is dispatched after it (D29: an `ok: true`
 * carrying `started: false`, `dispatched: false` or `withheld` is never success); a withheld dispatch is drawn with its
 * reason by key (`dock.withheld.<CODE>`, else `dock.withheld.other` with the code as its reference); "A run of yours is
 * working on this" only while a run this dock dispatched is running, as the last `airun` read answers it. R42: where the
 * assistant cannot work (a refusal or withholding drawn, or no pack answered), "Other reasons the assistant can't work
 * here" lists, by key, the reasons the reads answer.
 *
 * Every AI output drawn (the run's productions, a suggestion) is machine work (`mark.origin.machine`), never evidence,
 * and carries the test-instance label `untested` the plane marks the run with (R7). Every sentence is a word by key
 * (R44). Self-contained functions (interface-shell R21 (1)). */

import * as settingsPanel from "../screens-settings/panel.mjs";

/** R33: the bounds each mode the dock may open is opened with (`run-rules` `checkConsume`: a declared bound states a
 *  positive allowance; C-109.6: a planning run declares no search allowance). `check` reads and fetches, so it is given
 *  `fetches` (the plane's own figure for a reading run, `question-explorer`'s); it spawns no sub-session, so it declares
 *  none rather than a zero. */
export const MODE_BOUNDS = Object.freeze({
  check: Object.freeze([Object.freeze({ bound: "wallclock", allowed: 1800000, unit: "ms" }), Object.freeze({ bound: "fetches", allowed: 20 })]),
  plan: Object.freeze([Object.freeze({ bound: "wallclock", allowed: 1800000, unit: "ms" })]),
});

/** R33: the dispatch's withholdings the design words (`dock.withheld.<CODE>`), and the refusals `words.json` holds as
 *  `refusal.<CODE>` or `ai.refused.*`, each read by key; any other withholding is `dock.withheld.other`. */
export const WITHHELD = Object.freeze(["MEMBER_PRINCIPAL_RUN", "AGENT_WORKER_UNBOUND", "NAMESPACE_UNDETERMINED", "CREDENTIAL_RECORD_SILENT"]);
export const REFUSALS = Object.freeze({
  AI_RUN_MODE_NOT_DEPLOYED: "ai.refused.notdeployed", AI_KEPT_AWAY: "ai.refused.keptaway", PROJECT_AI_KEPT_AWAY: "ai.refused.projectkeptaway",
  AI_NO_ACCOUNT: "ai.refused.noaccount", AI_USE_SWITCHED_OFF: "ai.refused.off", AI_LIMIT_REACHED: "ai.refused.limit",
  AI_LIMIT_UNJUDGED: "ai.refused.limit.unjudged", MEMBER_PRINCIPAL_RUN: "dock.withheld.MEMBER_PRINCIPAL_RUN",
  MEMBER_RUN_MODE_NOT_ADMITTED: "refusal.MEMBER_RUN_MODE_NOT_ADMITTED", AI_RUN_NOT_PRINCIPAL: "refusal.AI_RUN_NOT_PRINCIPAL",
  AGENT_WORKER_UNBOUND: "dock.withheld.AGENT_WORKER_UNBOUND", AI_RUN_NOT_RUNNING: "refusal.AI_RUN_NOT_RUNNING",
  ACCOUNT_MEMBER_NOT_ACTIVE: "refusal.ACCOUNT_MEMBER_NOT_ACTIVE", AI_RUN_CREDENTIAL_MALFORMED: "refusal.AI_RUN_CREDENTIAL_MALFORMED",
  CREDENTIAL_RECORD_SILENT: "dock.withheld.CREDENTIAL_RECORD_SILENT", AI_RUN_BOUND_NO_ALLOWANCE: "refusal.AI_RUN_BOUND_NO_ALLOWANCE",
});

/** R4: who serves this member (interface-shell R20's three reads), her use today, the pack the run names, and (R42)
 *  whether the group keeps its material away from AI. */
function reads(view) {
  return {
    own: { op: "accountreference", query: {} },
    signin: { op: "subscriptionsignin", body: { step: "state" } },
    groupkey: { op: "groupkeystate", query: {} },
    usage: { op: "aiusage", query: {} },
    pack: { op: "agentpack", query: {} },
    keepaway: { op: "aikeepawaystate", query: {} },
  };
}

/** R4, R6–R8, R13, R33, R42: what the panel is, whose account serves her, the run (its state, its productions), the
 *  reasons it cannot work, and the three acts. */
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
     where she is one of that account's owners; a refusal draws nothing, an unreadable answer is drawn failed */
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
     `member:<id>/<tokenId>` for one opened before T47); continued by "Work on this" */
  const member = view.me && view.me.member;
  let found = null;
  if (!ui.run && context && member) {
    const runs = later("runs", "airuns", { contextType: context.type, contextId: context.id, limit: "50" }, String(ui.seq || 0));
    const list = runs.state === "ok" && Array.isArray(runs.value.runs) ? runs.value.runs : [];
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
  } else if (run.found && !ui.run) {
    status = "running";
  } else {
    const st = later("run", "airun", { run: run.id }, String(ui.seq || 0));
    const log = later("log", "airunlog", { run: run.id, limit: "200" }, String(ui.seq || 0));
    const session = st.state === "ok" && st.value.session ? st.value.session : null;
    /* while the run is read again, the last answer stands (a read in flight is not the run's state) */
    if (session) ui.lastStatus = { run: run.id, status: session.status, ticks: session.ticks, condition: session.condition };
    const last = ui.lastStatus && ui.lastStatus.run === run.id ? ui.lastStatus : null;
    status = last ? last.status : null;
    const untested = (session && session.untested) || run.untested || null;
    /* R33: working is said only while a run this dock dispatched is running, as the last read answers it */
    if (status === "running" && run.dispatched)
      runPart += `<p data-run="running">${cs.w("dock.run.yours")} ${cs.w("screen.assistant.run.running", { ticks: String((last && last.ticks) || 1) })}</p>`;
    else if (status && status !== "running") runPart += `<p data-run="ended">${cs.w("screen.assistant.run.ended", { why: String((last && last.condition) || status) })}</p>`;
    /* R8: while the run this dock dispatched is running, read it again on the page clock, at most once every 10 seconds;
       the shell cancels the timer when she leaves the screen */
    if (session && status === "running" && run.dispatched && !ui.polling) {
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
  if (runPart || said) out.push(cs.sec("screen.assistant.run.head", runPart + said));

  /* the acts on the screen's subject: "Work on this" only with a context and a pack, opening a run, or continuing a
     run of hers this page has not dispatched; "Suggest" and "Stop the run" while one it dispatched is running */
  const pack = ok("pack") && ((d.pack.value.pack && (d.pack.value.pack.version || d.pack.value.pack.skillVersion)) || d.pack.value.version);
  const noPack = !!(d.pack && d.pack.state !== "loading" && !pack);
  const running = !!run && status === "running";
  const started = running && ui.run && ui.run.dispatched;
  if (!context) out.push(`<p class="mk-small">${cs.w("screen.assistant.run.nocontext")}</p>`);
  else if (noPack) out.push(`<p class="mk-small">${cs.w("screen.assistant.run.notready")}</p>`);
  if (context && pack && member && !started)
    out.push(cs.act("airunopen", { label: "act.airunopen.label.assistant",
      data: { ctxType: context.type, ctxId: context.id, pack: String(pack), run: running ? run.id : "" }, tone: "primary" }));
  if (started && context && context.type === "inquiry")
    out.push(cs.field("assistant-suggest-name", "screen.assistant.suggest.name", {})
      + cs.field("assistant-suggest-description", "screen.assistant.suggest.description", { area: true })
      + cs.act("suggest", { label: "act.suggest.label.assistant", data: { target: context.id, run: run.id } }));
  if (running) out.push(cs.act("airunclose", { label: "act.airunclose.label.assistant", data: { run: run.id } }));

  /* R42: where the assistant cannot work, the reasons the reads answer, each by key, and whose account serves her */
  if (ui.said || (context && noPack)) {
    const reasons = [];
    const k = ok("keepaway") ? d.keepaway.value : null;
    if (k && k.on === true)
      reasons.push(cs.w("ai.refused.keptaway", { member: String(k.set_by || "").replace(/^member:/, ""),
        date: { html: k.set_at ? cs.date(String(k.set_at), { year: true }) : "" }, reason: String(k.reason || "") }));
    if (!account && !ownHeld && !groupOn) reasons.push(cs.w("ai.refused.noaccount"));
    if (noPack || (ui.said && ui.said.code === "AGENT_WORKER_UNBOUND")) reasons.push(cs.w("dock.withheld.AGENT_WORKER_UNBOUND"));
    if (account) reasons.push(cs.w("question.ai.whose") + " " + cs.w(account));
    out.push(`<details class="mk-details" data-reasons="assistant"><summary>${cs.w("question.ai.other")}</summary>`
      + reasons.map((r) => `<p class="mk-small">${r}</p>`).join("") + "</details>");
  }
  return out.join("");
}

/** R4's three acts. Each runs its calls itself through `cs.call`, under her session alone (R13), so `send` sends
 *  nothing through the shell and draws its outcome beside the acts. */
const acts = [
  { op: "airunopen", label: "act.airunopen.label.assistant",
    send(view, el, cs) {
      const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const res = (a) => (a && a.result !== undefined ? a.result : a);
      /* D29: an answer carrying `ok: false`, `started: false`, `dispatched: false` or a withholding is never success */
      const refused = (a) => { const r = res(a); return !a || a.ok === false || !r || r.ok === false || r.started === false || r.dispatched === false || !!r.withheld; };
      const P = view.parts || {};
      const words = P.refusals || {};
      const withheldKeys = P.withheld || [];
      const sayRefusal = (op, a) => {
        const r = res(a) || {};
        const code = String(r.code || r.reason || r.withheld || (a && (a.code || a.reason)) || (r.dispatched === false && r.status && r.status !== "running" ? "AI_RUN_NOT_RUNNING" : ""));
        const kept = r.keep_away || {};
        const fills = { whose: r.whose || "", period: r.period || "", use: r.use || "", Use: r.use || "", when: r.when || "",
                        who: r.who || "", for_uses: r.for_uses || "", member: r.member || kept.set_by || "",
                        date: r.date || (kept.set_at ? { html: cs.date(String(kept.set_at), { year: true }) } : ""),
                        reason: kept.reason || r.why || r.detail || code };
        const html = words[code] ? cs.w(words[code], fills)
          : r.withheld && !withheldKeys.includes(code) ? cs.w("dock.withheld.other") + ` <span class="mk-small" data-reference="withheld">${cs.esc(code)}</span>`
          : r.translation ? cs.esc(r.translation) : cs.w("screen.assistant.dispatch.unknown", { reason: code });
        cs.set("said", { op, code, html });
      };
      /* the segment started through the member-run door, `run` alone, under her session (R13) */
      const dispatch = (run) => cs.call("airundispatch", { body: { run } }).then((x) => {
        const xr = res(x);
        if (refused(x) || (xr && xr.found === false)) return sayRefusal("airundispatch", x);
        cs.set("run", Object.assign({}, view.ui.run, { dispatched: true, status: (xr && xr.status) || "running" }));
        cs.set("seq", (view.ui.seq || 0) + 1);
      }, () => sayRefusal("airundispatch", null));
      const ctx = { type: el.dataset.ctxType, id: el.dataset.ctxId };
      const member = view.me && view.me.member;
      if (!member || !ctx.type || !ctx.id) return null;
      cs.set("said", null);
      /* R13: a running run of hers this page has not dispatched (a reloaded dock) is continued by the same act */
      if (el.dataset.run) {
        cs.set("run", { id: String(el.dataset.run), status: "running", untested: null, dispatched: false });
        dispatch(String(el.dataset.run));
        return null;
      }
      const run = "RUN-" + hex(16);
      /* R33: the bounds the mode needs, as the plane's rules state them; the dock opens `check` only (R6) */
      const mode = "check";
      cs.call("airunopen", { body: { run, contextType: ctx.type, contextId: ctx.id, mode,
        principalClaude: "member:" + member, skillVersion: el.dataset.pack, bounds: (P.bounds || {})[mode] || [] } })
        .then((o) => {
          /* R33: `started: false` is a refusal, drawn by its words; nothing is dispatched after it */
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
        cs.set("lastStatus", { run: id, status: "cancelled", condition: "cancelled" });
        cs.set("run", Object.assign({ id, untested: null, dispatched: false }, view.ui.run, { found: false, status: "cancelled" }));
        cs.set("seq", (view.ui.seq || 0) + 1);
      };
      cs.call("airunclose", { body: { run: id, bound: "cancelled" } }).then(end, end);
      return null;
    } },
];

/** The keys the dock may draw (R44: keys only, each a `words.json` word). */
const words = Object.freeze([
  "screen.assistant.name", "screen.assistant.purpose",
  ...["airunopen", "suggest", "airunclose"].map((op) => "act." + op + ".label.assistant"),
  "ai.account.own.inline", "ai.account.group.inline", "ai.account.project.inline",
  ...new Set(Object.values(REFUSALS)), "dock.withheld.NAMESPACE_UNDETERMINED", "dock.withheld.other", "dock.run.yours",
  "question.ai.other", "question.ai.whose",
  "ai.label.untested", "mark.origin.machine.name", "mark.origin.machine.means", "state.failed",
  "screen.assistant.says", "screen.assistant.serves", "screen.assistant.serves.unknown", "screen.assistant.use",
  "screen.assistant.run.head", "screen.assistant.run.running", "screen.assistant.run.ended", "screen.assistant.run.none",
  "screen.assistant.run.notready", "screen.assistant.run.nocontext", "screen.assistant.productions.head",
  "screen.assistant.production", "screen.assistant.notevidence", "screen.assistant.suggest.name",
  "screen.assistant.suggest.description", "screen.assistant.dispatch.unknown",
]);

/** The assistant dock (interface-shell R20, R21), with the screens-settings bars and R33's tables as its parts. */
export const ASSISTANT_SCREEN = Object.freeze({ id: "assistant", reads, render, acts, words,
  parts: Object.freeze({ ...(settingsPanel.aiUsageBars ? { aiUsageBars: settingsPanel.aiUsageBars } : {}),
    bounds: MODE_BOUNDS, refusals: REFUSALS, withheld: WITHHELD }) });

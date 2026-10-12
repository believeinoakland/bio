/* screens-settings R9 (DEC-188 (1)): the AI account panel, one render over an `owner`, drawn by `members` for the group's
   key (`owner: "group"`) and by `connect` for the member's own account (`owner: "member:<id>"`); `projectai` (T47) will
   reuse it. It shows what the account pays for (the uses, `ai.use.<u>.name`; exploring, `ai.explore.*`, at group level
   only), its limits as a table with one form, this month's use summed and naming no member (DEC-188 (5)), and the
   changes with who and when (`accounthistory`'s and `ailimits`' history together).

   Each function is self-contained (interface-shell R21: only its parameters, `cs` and the language's globals), handed
   to the two screens as `view.parts` (J2 (1)). The panel reads the screen's reads `uses`, `limits`, `usage` and
   `history`, each over `owner`. */

/** The panel's HTML. `o`: `{owner, explore, perMember, names}`: whether exploring and a per-member limit apply (group
 *  level), and `names(by)` turning a recorded `by` into the name drawn. */
export function aiPanel(cs, view, o) {
  const W = cs.w, E = cs.esc, S = "screen.panel.";
  // a word as plain text, for another word's fills (the kit escapes fills, interface-shell R5)
  const T = (k, f) => String(W(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
  const USES = ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "suggestions"];
  const p = o.owner === "group" ? "aig" : "aio";
  const name = (by) => (o.names ? o.names(by) : String(by || "").replace(/^member:/, ""));
  const scopeName = (s) => s === "overall" ? T(S + "scope.overall") : s === "per_member" ? T(S + "scope.per_member") : T("ai.use." + s + ".name");
  const unitName = (u) => T(S + "unit." + u);
  const amountOf = (a, u) => u === "usd" ? "$" + Number(a).toFixed(2) : Number(a).toLocaleString("en");
  const data = view.data || {};
  const out = [];

  // what the account pays for: each use switched on its own, exploring chosen at group level
  out.push(cs.sec(S + "uses.heading", cs.state(data.uses, (v) => {
    if (!v.uses) return `<p>${W(S + "uses.none")}</p>`;
    const u = v.uses;
    let h = `<ul class="cs-list">${USES.map((k) => `<li><span>${W("ai.use." + k + ".name")}</span> · <span>${W(u[k] ? S + "on" : S + "off")}</span> ${cs.act("accountusesset", { label: u[k] ? S + "switch.off" : S + "switch.on", data: { sw: k, to: u[k] ? "off" : "on" } })}</li>`).join("")}</ul>`;
    if (o.explore) {
      const x = u.explore || "no";
      h += `<label for="${p}-explore">${W("ai.use.explore.name")}</label><select id="${p}-explore" class="cs-input">${["no", "ask", "yes"].map((y) => `<option value="${y}"${y === x ? " selected" : ""}>${W("ai.explore." + y)}</option>`).join("")}</select>${cs.act("accountusesset", { label: S + "explore.save", data: { sw: "explore" } })}`;
    }
    return h + `<p class="cs-note">${W(S + "uses.stops")}</p>`;
  })));

  // its limits, as a table with one form
  out.push(cs.sec(S + "limits.heading", cs.state(data.limits, (v) => {
    const L = v.limits || [];
    const scopeOf = (l) => l.scope === "overall" || l.scope === "per_member" ? l.scope : l.use || l.scope;
    let h = L.length === 0 ? `<p>${W(S + "limits.none")}</p>` : `<table class="cs-table"><thead><tr><th>${W(S + "col.limit")}</th><th>${W(S + "col.amount")}</th><th>${W(S + "col.counts")}</th><th>${W(S + "col.used")}</th><th>${W(S + "col.acts")}</th></tr></thead><tbody>${L.map((l) => `<tr><td>${E(scopeName(scopeOf(l)))}</td><td>${W(S + "amount", { amount: amountOf(l.amount, l.unit), unit: unitName(l.unit), period: T(S + "period." + l.period) })}</td><td>${l.on_top === true ? W(S + "ontop") : l.on_top === false ? W(S + "within") : ""}</td><td>${l.used === null || l.used === undefined ? "" : E(amountOf(l.used, l.unit))}${l.reached ? " · " + W(S + "reached") : ""}</td><td>${cs.act("ailimitset", { label: S + "limit.remove", data: { remove: "1", scope: scopeOf(l), unit: l.unit, period: l.period } })}</td></tr>`).join("")}</tbody></table>`;
    const set = cs.act("ailimitset", { data: { remove: "" } });
    if (set) {
      const scopes = ["overall", ...USES.filter((k) => k !== "suggestions"), ...(o.explore ? ["explore"] : []), ...(o.perMember ? ["per_member"] : [])];
      h += `<div class="cs-form"><label for="${p}-scope">${W(S + "form.scope")}</label><select id="${p}-scope" class="cs-input">${scopes.map((s) => `<option value="${s}">${E(scopeName(s))}</option>`).join("")}</select>
<label for="${p}-amount">${W(S + "form.amount")}</label><input id="${p}-amount" type="text" inputmode="decimal" class="cs-input">
<label for="${p}-unit">${W(S + "form.unit")}</label><select id="${p}-unit" class="cs-input">${["usd", "tokens", "calls"].map((u) => `<option value="${u}">${E(unitName(u))}</option>`).join("")}</select>
<label for="${p}-period">${W(S + "form.period")}</label><select id="${p}-period" class="cs-input">${["day", "month"].map((x) => `<option value="${x}">${W(S + "period." + x)}</option>`).join("")}</select>
<fieldset><legend>${W(S + "form.inclusive")}</legend><input type="radio" id="${p}-within" name="${p}-inclusive" checked><label for="${p}-within">${W(S + "within")}</label><input type="radio" id="${p}-ontop" name="${p}-inclusive"><label for="${p}-ontop">${W(S + "ontop")}</label></fieldset>${set}</div><p class="cs-note">${W(S + "limits.told")}</p>`;
    }
    return h;
  })));

  // this month's use, summed, naming no member
  out.push(cs.sec(S + "usage.heading", cs.state(data.usage, (v) => {
    const U = v.uses || [];
    if (!U.length) return `<p>${W(S + "usage.none")}</p>`;
    const unstated = (r) => r.cost_unstated || r.total_cost_usd === null || r.total_cost_usd === undefined;
    const cost = (r) => unstated(r) ? W(S + "notstated") : E("$" + Number(r.total_cost_usd).toFixed(2));
    const sum = (k) => U.reduce((t, r) => t + (Number(r[k]) || 0), 0);
    return `<table class="cs-table"><thead><tr><th>${W(S + "col.month")}</th><th>${W(S + "col.calls")}</th><th>${W(S + "col.tokens")}</th><th>${W(S + "col.dollars")}</th></tr></thead><tbody>${U.map((r) => `<tr><td>${W("ai.use." + r.use + ".name")}</td><td>${E(Number(r.calls || 0).toLocaleString("en"))}</td><td>${E(Number(r.tokens || 0).toLocaleString("en"))}</td><td>${cost(r)}</td></tr>`).join("")}<tr><td>${W(S + "usage.all")}</td><td>${E(sum("calls").toLocaleString("en"))}</td><td>${E(sum("tokens").toLocaleString("en"))}</td><td>${U.some(unstated) ? W(S + "notstated") : E("$" + sum("total_cost_usd").toFixed(2))}</td></tr></tbody></table><p class="cs-note">${W(o.owner === "group" ? S + "usage.group" : S + "usage.own")}</p>`;
  })));

  // the changes, with who and when
  out.push(cs.sec(S + "changes.heading", cs.state(data.history, (v) => {
    const items = [];
    const KINDS = ["key_set", "signin_set", "removed", "switched", "use_set", "limit_set"];
    for (const c of v.changes || []) items.push({ at: c.at, html: W(S + "change." + (KINDS.includes(c.change) ? c.change : "other"), { who: name(c.by), on: T(c.on ? S + "on" : S + "off"), use: T("ai.use." + (c.switch || "explore") + ".name"), value: c.switch === "explore" ? T("ai.explore." + (c.value || "no")) : T(c.value ? S + "on" : S + "off") }) });
    const lh = data.limits && data.limits.state === "ok" && data.limits.value ? data.limits.value.history || [] : [];
    for (const h of lh) items.push({ at: h.at, html: W(S + "change.limit." + (h.change === "removed" ? "removed" : "set"), { who: name(h.by), scope: scopeName(h.scope), amount: h.amount === null || h.amount === undefined ? "" : amountOf(h.amount, h.unit), unit: unitName(h.unit), period: T(S + "period." + h.period) }) });
    items.sort((a, b) => String(b.at).localeCompare(String(a.at)));
    return items.length === 0 ? `<p>${W(S + "changes.none")}</p>` : `<ul class="cs-list">${items.map((i) => `<li>${i.html} · ${cs.date(i.at, { year: true })}</li>`).join("")}</ul>`;
  })));
  return out.join("");
}

/** The request one of the panel's acts sends, from the pressed control's data and the form's fields; `{refuse}` (a word
 *  drawn beside the act, nothing sent) when the form cannot make a valid one. */
export function aiPanelSend(op, owner, el, cs) {
  const p = owner === "group" ? "aig" : "aio";
  const ds = (el && el.dataset) || {};
  if (op === "accountusesset") {
    if (ds.sw === "explore") return { body: { owner, switch: "explore", on: cs.value(p + "-explore") || "no" } };
    return { body: { owner, switch: ds.sw, on: ds.to === "on" } };
  }
  if (ds.remove === "1") return { body: { owner, scope: ds.scope, unit: ds.unit, period: ds.period, amount: null } };
  const amount = Number(String(cs.value(p + "-amount") || "").replace(/[,\s$]/g, ""));
  if (!(amount > 0)) return { refuse: "screen.panel.form.noamount" };
  const scope = cs.value(p + "-scope") || "overall";
  const body = { owner, scope, unit: cs.value(p + "-unit") || "tokens", period: cs.value(p + "-period") || "month", amount };
  if (scope !== "overall" && scope !== "per_member") body.inclusive = cs.value(p + "-ontop") !== true;
  return { body };
}

/** R9's refusal of a limit: `ai.refused.limitinvalid` with its field's words (`ai.limitfield.*`). */
export function aiLimitRefused(refusal, cs) {
  const T = (k) => String(cs.w(k)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
  const f = refusal && ["owner", "scope", "unit", "period", "amount", "inclusive", "use", "count"].includes(refusal.field) ? refusal.field : "amount";
  return cs.w("ai.refused.limitinvalid", { field: T("ai.limitfield." + f) });
}

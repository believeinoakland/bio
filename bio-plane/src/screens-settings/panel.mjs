/* screens-settings R9 (DEC-188 (1)): the AI account panel, one render over an `owner`, drawn by `members` for the group's
   key (`owner: "group"`) and by `connect` for the member's own account (`owner: "member:<id>"`); `projectai` (T47) will
   reuse it. It shows what the account pays for (the uses, `ai.use.<u>.name`; exploring, `ai.explore.*`, at group level
   only), its limits as a table with one form, this month's use summed and naming no member (DEC-188 (5)), and the
   changes with who and when (`accounthistory`'s and `ailimits`' history together).

   Every function here is self-contained (interface-shell R21's Suggestions; K2854 T1): it refers only to its parameters,
   so the shell can serialise it into the page. The screens reach these through their `parts`. */

/** The panel's HTML. `o`: `{owner, screen, uses, limits, usage, history, explore, perMember, names}`: `uses`, `limits`,
 *  `usage` and `history` are read outcomes (`accountuses`, `ailimits`, `aiusage` and `accounthistory` over `owner`);
 *  `explore` and `perMember` say whether exploring and a per-member limit apply (group level); `names(by)` turns a
 *  recorded `by` into a name to draw. */
export function aiPanel(cs, o) {
  const W = cs.w, T = cs.t, E = cs.esc;
  const USES = ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "suggestions"];
  const S = "screen.panel.";
  const name = (by) => (o.names ? o.names(by) : String(by || "").replace(/^member:/, ""));
  // each as plain text, for a word's fills (the shell escapes fills, its R5)
  const scopeName = (s) => s === "overall" ? T(S + "scope.overall") : s === "per_member" ? T(S + "scope.per_member") : T("ai.use." + s + ".name");
  const unitName = (u) => T(S + "unit." + u);
  const amountOf = (a, u) => u === "usd" ? "$" + Number(a).toFixed(2) : Number(a).toLocaleString("en");
  const form = (inner) => `<div class="cs-form" data-form>${inner}</div>`;
  const sec = (key, inner) => `<section class="cs-section"><h2>${W(key)}</h2>${inner}</section>`;
  const out = [];

  // what the account pays for
  let uses = "";
  if (o.uses.state !== "ok") uses = cs.state(o.uses);
  else if (!o.uses.value.uses) uses = `<p>${W(S + "uses.none")}</p>`;
  else {
    const u = o.uses.value.uses;
    uses = `<ul class="cs-list">${USES.map((k) => `<li>${form(`<span>${W("ai.use." + k + ".name")}</span> · <span>${W(u[k] ? S + "on" : S + "off")}</span> ${cs.act("accountusesset", { subject: k + "=" + (u[k] ? "off" : "on"), label: u[k] ? S + "switch.off" : S + "switch.on", screen: o.screen })}`)}</li>`).join("")}</ul>`;
    if (o.explore) {
      const v = u.explore || "no";
      uses += form(`<label for="ai-explore-${E(o.owner)}">${W("ai.use.explore.name")}</label><select id="ai-explore-${E(o.owner)}" name="explore" class="cs-input">${["no", "ask", "yes"].map((x) => `<option value="${x}"${x === v ? " selected" : ""}>${W("ai.explore." + x)}</option>`).join("")}</select>${cs.act("accountusesset", { subject: "explore", label: S + "explore.save", screen: o.screen })}`);
    }
    uses += `<p class="cs-note">${W(S + "uses.stops")}</p>`;
  }
  out.push(sec(S + "uses.heading", uses));

  // its limits, as a table with one form
  let lim = "";
  if (o.limits.state !== "ok" || !o.limits.value.limits) lim = cs.state(o.limits.state === "ok" ? { state: "failed", refusal: o.limits.value } : o.limits);
  else {
    const L = o.limits.value.limits;
    lim = L.length === 0 ? `<p>${W(S + "limits.none")}</p>` : `<table class="cs-table"><thead><tr><th>${W(S + "col.limit")}</th><th>${W(S + "col.amount")}</th><th>${W(S + "col.counts")}</th><th>${W(S + "col.used")}</th><th></th></tr></thead><tbody>${L.map((l) => `<tr><td>${E(scopeName(l.scope === "overall" || l.scope === "per_member" ? l.scope : l.use || l.scope))}</td><td>${W(S + "amount", { amount: amountOf(l.amount, l.unit), unit: unitName(l.unit), period: T(S + "period." + l.period) })}</td><td>${l.on_top === true ? W(S + "ontop") : l.on_top === false ? W(S + "within") : ""}</td><td>${l.used === null || l.used === undefined ? "" : E(amountOf(l.used, l.unit))}${l.reached ? " · " + W(S + "reached") : ""}</td><td>${form(cs.act("ailimitset", { subject: "remove:" + [l.scope === "overall" || l.scope === "per_member" ? l.scope : l.use || l.scope, l.unit, l.period].join("|"), label: S + "limit.remove", screen: o.screen }))}</td></tr>`).join("")}</tbody></table>`;
    const scopes = ["overall", ...USES.filter((k) => k !== "suggestions"), ...(o.explore ? ["explore"] : []), ...(o.perMember ? ["per_member"] : [])];
    const id = "ai-lim-" + E(o.owner);
    const set = cs.act("ailimitset", { subject: "set", screen: o.screen });
    if (set) lim += form(`<label for="${id}-s">${W(S + "form.scope")}</label><select id="${id}-s" name="scope" class="cs-input">${scopes.map((s) => `<option value="${s}">${E(scopeName(s))}</option>`).join("")}</select>
<label for="${id}-a">${W(S + "form.amount")}</label><input id="${id}-a" name="amount" type="text" inputmode="decimal" class="cs-input">
<label for="${id}-u">${W(S + "form.unit")}</label><select id="${id}-u" name="unit" class="cs-input">${["usd", "tokens", "calls"].map((u) => `<option value="${u}">${E(unitName(u))}</option>`).join("")}</select>
<label for="${id}-p">${W(S + "form.period")}</label><select id="${id}-p" name="period" class="cs-input">${["day", "month"].map((p) => `<option value="${p}">${W(S + "period." + p)}</option>`).join("")}</select>
<fieldset><legend>${W(S + "form.inclusive")}</legend><label><input type="radio" name="inclusive" value="within" checked> ${W(S + "within")}</label><label><input type="radio" name="inclusive" value="ontop"> ${W(S + "ontop")}</label></fieldset>${set}<p class="cs-note">${W(S + "limits.told")}</p>`);
  }
  out.push(sec(S + "limits.heading", lim));

  // this month's use, summed, naming no member
  let use = "";
  if (o.usage.state !== "ok" || !o.usage.value.uses) use = cs.state(o.usage.state === "ok" ? { state: "failed", refusal: o.usage.value } : o.usage);
  else {
    const U = o.usage.value.uses;
    const sum = (k) => U.reduce((t, r) => t + (Number(r[k]) || 0), 0);
    const cost = (r) => r.cost_unstated || r.total_cost_usd === null || r.total_cost_usd === undefined ? W(S + "notstated") : E("$" + Number(r.total_cost_usd).toFixed(2));
    use = U.length === 0 ? `<p>${W(S + "usage.none")}</p>` : `<table class="cs-table"><thead><tr><th>${W(S + "col.month")}</th><th>${W(S + "col.calls")}</th><th>${W(S + "col.tokens")}</th><th>${W(S + "col.dollars")}</th></tr></thead><tbody>${U.map((r) => `<tr><td>${W("ai.use." + r.use + ".name")}</td><td>${cs.number(r.calls || 0)}</td><td>${cs.number(r.tokens || 0)}</td><td>${cost(r)}</td></tr>`).join("")}<tr><td>${W(S + "usage.all")}</td><td>${cs.number(sum("calls"))}</td><td>${cs.number(sum("tokens"))}</td><td>${U.some((r) => r.cost_unstated || r.total_cost_usd === null || r.total_cost_usd === undefined) ? W(S + "notstated") : E("$" + sum("total_cost_usd").toFixed(2))}</td></tr></tbody></table>`;
    use += `<p class="cs-note">${W(o.owner === "group" ? S + "usage.group" : S + "usage.own")}</p>`;
  }
  out.push(sec(S + "usage.heading", use));

  // the changes, with who and when
  let ch = "";
  const hist = o.history, lh = o.limits;
  if (hist.state !== "ok" && hist.state !== "empty") ch = cs.state(hist);
  else {
    const items = [];
    for (const c of (hist.value && hist.value.changes) || []) items.push({ at: c.at, html: W(S + "change." + (["key_set", "signin_set", "removed", "switched", "use_set", "limit_set"].includes(c.change) ? c.change : "other"), { who: name(c.by), on: T(c.on ? S + "on" : S + "off"), use: c.switch && c.switch !== "explore" ? T("ai.use." + c.switch + ".name") : T("ai.use.explore.name"), value: c.switch === "explore" ? T("ai.explore." + (c.value || "no")) : T(c.value ? S + "on" : S + "off") }) });
    if (lh.state === "ok" && lh.value.history)
      for (const h of lh.value.history) items.push({ at: h.at, html: W(S + "change.limit." + (h.change === "removed" ? "removed" : "set"), { who: name(h.by), scope: scopeName(h.scope), amount: h.amount === null ? "" : amountOf(h.amount, h.unit), unit: unitName(h.unit), period: T(S + "period." + h.period) }) });
    items.sort((a, b) => String(b.at).localeCompare(String(a.at)));
    ch = items.length === 0 ? `<p>${W(S + "changes.none")}</p>` : `<ul class="cs-list">${items.map((i) => `<li>${i.html} · ${cs.date(i.at)}</li>`).join("")}</ul>`;
  }
  out.push(sec(S + "changes.heading", ch));
  return out.join("");
}

/** The request an act of the panel sends, from the pressed control's subject and its form's values. Answers
 *  `{body}`, or `{hold}` (a word key, nothing sent) when the form cannot make a valid request. */
export function aiPanelArgs(op, owner, f, subject) {
  if (op === "accountusesset") {
    if (subject === "explore") return { body: { owner, switch: "explore", on: f.explore || "no" } };
    const [sw, v] = String(subject).split("=");
    return { body: { owner, switch: sw, on: v === "on" } };
  }
  if (String(subject).startsWith("remove:")) {
    const [scope, unit, period] = String(subject).slice(7).split("|");
    return { body: { owner, scope, unit, period, amount: null } };
  }
  const amount = Number(String(f.amount || "").replace(/[,\s$]/g, ""));
  if (!(amount > 0)) return { hold: "screen.panel.form.noamount" };
  const body = { owner, scope: f.scope || "overall", unit: f.unit || "tokens", period: f.period || "month", amount };
  if (body.scope !== "overall" && body.scope !== "per_member") body.inclusive = f.inclusive !== "ontop";
  return { body };
}

/** `ai.refused.limitinvalid` with its field's words (`ai.limitfield.*`), R9's refusal, else the shell's own drawing. */
export function aiPanelRefused(cs, refusal) {
  const r = refusal || {};
  if ((r.code || r.reason) === "AI_LIMIT_INVALID") {
    const f = ["owner", "scope", "unit", "period", "amount", "inclusive", "use", "count"].includes(r.field) ? r.field : "amount";
    return cs.w("ai.refused.limitinvalid", { field: cs.t("ai.limitfield." + f) });
  }
  if ((r.code || r.reason) === "LIMIT_UNIT_UNAVAILABLE") return cs.w("ai.refused.unitunavailable");
  if ((r.code || r.reason) === "SWITCH_VALUE_INVALID") return cs.w("ai.refused.switchvalue");
  return null;
}

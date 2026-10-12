/* screens-settings R4, R5 (and R8, R9, R10): Settings › The assistant, the registry's 7 acts with its two re-points
   (`subscriptionsignin` for the owed sign-in, `subscriptiondisconnect` beside `accountreferenceremove`; interface-shell
   R21). It draws exactly one of four situations: the group keeps its material away from AI; the member's own account
   serves them; the group's key serves them; nothing serves yet. Connecting is offered in DEC-156's order (the
   subscription, only while `op=bootstrap`'s `parts` holds the sign-in, instance-setup R81; then an API key; then
   skipping), after the disclosure of what connecting means. A key or code is sent in the request's body only, and never
   kept, drawn or sent again (R10). Every function is self-contained (K2854 T1). */

export const connect = {
  id: "connect",

  reads(ctx) {
    const me = ctx.me || {};
    const own = "member:" + me.member;
    return [
      { name: "assistant", op: "assistantstate" },
      { name: "keepaway", op: "aikeepawaystate" },
      { name: "groupkey", op: "groupkeystate" },
      { name: "notice", op: "groupkeynotice" },
      // `disclosureshown` records the door's `by`: `member:<id>`, or `admin` for the founder's session
      { name: "disclosure", op: "disclosureof", query: { member: me.member === "admin" ? "admin" : own } },
      { name: "reference", op: "accountreference" },
      // a mutating op (credentials R43), so its state is asked in a body
      { name: "signin", op: "subscriptionsignin", body: { step: "state" } },
      { name: "boot", op: "bootstrap" },
      { name: "uses", op: "accountuses", query: { owner: own } },
      { name: "limits", op: "ailimits", query: { owner: own } },
      { name: "usage", op: "aiusage", query: { owner: own } },
      { name: "history", op: "accounthistory", query: { owner: own } },
      // the member's own use across every payer, with the limits that bind them (ai-use R4's `aiUsageMine`)
      { name: "mine", op: "aiusage" },
    ];
  },

  render(cs, d, ctx, parts) {
    const W = cs.w, T = cs.t, E = cs.esc, S = "screen.connect.";
    const me = ctx.me || {};
    const ok = (o) => o && o.state === "ok" && o.value && o.value.ok !== false;
    const form = (inner) => `<div class="cs-form" data-form>${inner}</div>`;
    const sec = (key, inner, id) => `<section class="cs-section"${id ? ` id="${id}"` : ""}><h2>${W(key)}</h2>${inner}</section>`;
    const outward = (inner) => `<div class="cs-notice"><span class="cs-tag-outward">${W("mark.outward.means")}</span>${inner}</div>`;
    const names = (by) => { const id = String(by || "").replace(/^member:/, ""); return id === me.member ? T(S + "you") : id === "admin" ? T("screen.members.founder") : id; };
    const out = [`<h1>${W("screen.connect.name")}</h1>`, `<p>${W(S + "optional")}</p>`, `<p class="cs-note">${W("ai.whopays")}</p>`];

    // the situation: exactly one of four (R4)
    const ka = d.keepaway, as = d.assistant;
    let kept = null;
    if (ok(ka) && ka.value.on === true) kept = { by: ka.value.set_by, at: ka.value.set_at, reason: ka.value.reason };
    else if (ok(as) && as.value.on === false) kept = { by: as.value.set_by, at: as.value.set_at, reason: as.value.reason };
    else if (ok(ka) && ka.value.on !== false && !ok(as)) kept = { by: null, at: null, reason: null };
    if (!kept && !ok(as) && !ok(ka)) { out.push(cs.state(as.state === "ok" ? { state: "failed", refusal: as.value } : as)); return out.join(""); }
    if (kept) {
      // the group keeps its material away: who, when, the reason in the administrator's words, and no act
      out.push(`<div class="cs-situation" data-situation="keptaway"><p>${kept.by ? W(S + "keptaway", { by: names(kept.by), date: cs.dateText(kept.at) }) : W(S + "keptaway.unread")}${kept.reason ? ` <span class="rec">${E(kept.reason)}</span>` : ""}</p><p>${W(S + "keptaway.ask")}</p></div>`);
      return out.join("");
    }
    const ref = ok(d.reference) ? d.reference.value : null;
    const sub = ok(d.signin) ? d.signin.value : null;
    const subscribed = !!(sub && sub.connected === true) || !!(ref && ref.subscription && ref.subscription.connected === true);
    const keyed = !!(ref && ref.held === true);
    const gk = ok(d.groupkey) ? d.groupkey.value : null;
    const groupServes = !!(gk && gk.on === true);
    const situation = subscribed || keyed ? "own" : groupServes ? "group" : "none";

    if (situation === "own") {
      out.push(`<div class="cs-situation" data-situation="own"><p>${W(subscribed ? S + "own.subscription" : S + "own.apikey")}</p>${groupServes ? `<p>${W(S + "own.thengroup")}</p>` : ""}</div>`);
    } else if (situation === "group") {
      // the member's allowance on the group's key, when a per-member limit is set
      let allowance = "";
      if (ok(d.mine)) {
        const payer = (d.mine.value.payers || []).find((p) => p.whose === "group");
        const lim = payer && (payer.limits || []).find((l) => l.scope === "per_member");
        if (lim) allowance = " " + W(lim.reached ? S + "group.allowance.reached" : S + "group.allowance", { amount: lim.unit === "usd" ? "$" + Number(lim.amount).toFixed(2) : Number(lim.amount).toLocaleString("en"), unit: T("screen.panel.unit." + lim.unit), period: T("screen.panel.period." + lim.period) });
      }
      out.push(`<div class="cs-situation" data-situation="group"><p>${W(S + "group")}${allowance}</p><p><a href="#connect-own">${W(S + "group.more")}</a></p></div>`);
    } else {
      out.push(`<div class="cs-situation" data-situation="none"><p>${W(S + "none")}</p></div>`);
    }
    if (!ok(d.reference) || !ok(d.groupkey)) out.push(cs.state(!ok(d.reference) ? (d.reference.state === "ok" ? { state: "failed", refusal: d.reference.value } : d.reference) : (d.groupkey.state === "ok" ? { state: "failed", refusal: d.groupkey.value } : d.groupkey)));

    // the group key's notice, before the first question on it
    if (situation === "group" && ok(d.notice) && d.notice.value.due === true) {
      const seen = cs.act("groupkeynoticeseen", { subject: "notice", screen: "connect" });
      out.push(sec(S + "notice.heading", outward(`<p>${W(S + "notice.group")}</p>${form(seen)}`)));
    }

    // connecting one's own account (R5), after the disclosure of what it means
    if (situation !== "own") {
      const disc = ok(d.disclosure) ? d.disclosure.value : null;
      let c = "";
      if (!disc) c = cs.state(d.disclosure.state === "ok" ? { state: "failed", refusal: d.disclosure.value } : d.disclosure);
      else if (disc.shown !== true) {
        c = outward(`<p>${W(S + "disclosure.own")}</p>${form(cs.act("disclosureshown", { subject: disc.version || "", screen: "connect" }))}`) + `<p>${W(S + "disclosure.then")}</p>`;
      } else {
        const parts0 = ok(d.boot) && Array.isArray(d.boot.value.parts) ? d.boot.value.parts : [];
        const signinPart = parts0.find((p) => p.part === "signin");
        // 1. the subscription, offered only while the sign-in is present (trial §3.2)
        if (signinPart && signinPart.present === true) {
          const start = cs.act("subscriptionsignin", { subject: "start", label: "act.owed_subscriptionsignin.label.connect", screen: "connect" });
          const code = cs.act("subscriptionsignin", { subject: "code", label: S + "signin.connect", screen: "connect" });
          if (start || code) c += `<h3>${W(S + "signin.heading")}</h3><ol class="cs-list"><li>${W(S + "signin.step1")}</li><li>${W(S + "signin.step2")}</li><li>${W(S + "signin.step3")}</li><li>${W(S + "signin.step4")}</li></ol>${form(start)}${ctx.shown && ctx.shown.signinOpened ? `<p data-shown="signin">${W(S + "signin.opened")}</p>` : ""}${form(`<label for="mc-code">${W(S + "signin.code")}</label><span class="help">${W(S + "signin.help")}</span><input id="mc-code" name="code" type="password" class="cs-input" autocomplete="off">${code}`)}`;
        } else if (signinPart && signinPart.present === false) c += `<p data-state="signin">${W(S + "signin.absent")}</p>`;
        else c += `<p data-state="signin">${W(S + "signin.unread")}</p>`;
        // 2. an API key
        const set = cs.act("accountreferenceset", { subject: "apikey", screen: "connect" });
        if (set) c += `<h3>${W(S + "apikey.heading")}</h3>${form(`<label for="mc-key">${W(S + "apikey.field")}</label><span class="help">${W(S + "apikey.help")}</span><input id="mc-key" name="secret" type="password" class="cs-input" autocomplete="off">${set}`)}`;
        // 3. skip
        c += `<p>${W(S + "skip")}</p>`;
      }
      out.push(sec(S + "own.heading", c, "connect-own"));
    }

    // on the group's key, its settings are the administrators'
    if (situation === "group") out.push(sec(S + "grouplimits.heading", `<p>${W(S + "grouplimits")}</p>`));

    // the member's own account: the panel (R9) and disconnecting
    if (situation === "own") {
      out.push(parts.aiPanel(cs, { owner: "member:" + me.member, screen: "connect", uses: d.uses, limits: d.limits, usage: d.usage, history: d.history, explore: false, perMember: false, names }));
      const dis = (subscribed ? cs.act("subscriptiondisconnect", { subject: "subscription", label: S + "disconnect.subscription", screen: "connect" }) : "") + (keyed ? cs.act("accountreferenceremove", { subject: "apikey", screen: "connect" }) : "");
      if (dis) out.push(sec(S + "disconnect.heading", form(dis)));
    }
    return out.join("");
  },

  acts: [
    { op: "groupkeynoticeseen", rereads: ["notice"],
      args() { return { body: {} }; } },
    { op: "disclosureshown", rereads: ["disclosure"],
      args(f, ctx, d, subject) { const me = ctx.me || {}; return { body: { member: me.member === "admin" ? "admin" : "member:" + me.member, version: subject } }; } },
    // the owed sign-in, re-pointed to `subscriptionsignin` (DEC-156; control-plane R65)
    { op: "subscriptionsignin", registry: "owed:subscriptionsignin DEC-156", rereads: ["signin", "reference", "uses", "limits", "usage", "history"], clears: ["code"],
      args(f, ctx, d, subject) {
        if (subject === "start") return { body: { step: "start" } };
        const code = String(f.code || "").trim();
        return code ? { body: { step: "code", code } } : { hold: "screen.connect.signin.nocode" };
      },
      // Anthropic's page opens in a new browsing context, with no opener and no referrer
      after(a, ctx, d, f, subject) { return a && a.address ? { open: { address: a.address, rel: "noopener noreferrer" }, show: { signinOpened: true } } : null; },
      refused(cs, r) {
        const code = r && (r.code || r.reason);
        if (code === "SIGNIN_REFUSED") return cs.w("screen.connect.refused.SIGNIN_REFUSED", { detail: r.detail || "" });
        if (["NO_SIGNIN_WAITING", "SIGNIN_UNAVAILABLE", "SIGNIN_ADDRESS_UNEXPECTED", "AGENT_WORKER_UNBOUND", "AI_KEPT_AWAY"].includes(code)) return cs.w("screen.connect.refused." + code);
        return null; // RUNNER_NOT_CONFIGURED and DISCLOSURE_DUE: the translation the door relays (control-plane R65)
      } },
    { op: "accountreferenceset", rereads: ["reference", "uses", "limits", "usage", "history"], clears: ["secret"],
      args(f, ctx) { const secret = String(f.secret || "").trim(); return secret ? { body: { member: "member:" + (ctx.me || {}).member, kind: "apikey", secret } } : { hold: "screen.connect.apikey.nokey" }; } },
    { op: "accountusesset", rereads: ["uses", "history"],
      args(f, ctx, d, subject, parts) { return parts.aiPanelArgs("accountusesset", "member:" + (ctx.me || {}).member, f, subject); },
      refused(cs, r, parts) { return parts.aiPanelRefused(cs, r); } },
    { op: "ailimitset", rereads: ["limits"],
      args(f, ctx, d, subject, parts) { return parts.aiPanelArgs("ailimitset", "member:" + (ctx.me || {}).member, f, subject); },
      refused(cs, r, parts) { return parts.aiPanelRefused(cs, r); } },
    { op: "accountreferenceremove", rereads: ["reference", "uses", "limits", "usage", "history"],
      args(f, ctx) { return { body: { member: "member:" + (ctx.me || {}).member } }; } },
    { op: "subscriptiondisconnect", rereads: ["signin", "reference", "uses", "limits", "usage", "history"],
      args() { return { body: {} }; } },
  ],
};

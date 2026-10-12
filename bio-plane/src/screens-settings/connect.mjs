/* screens-settings R4, R5 (and R8, R9, R10): Settings › The assistant, the registry's 7 acts with its two re-points
   (`subscriptionsignin` for the owed sign-in, `subscriptiondisconnect` beside `accountreferenceremove`; interface-shell
   R21). It draws exactly one of four situations: the group keeps its material away from AI; the member's own account
   serves them; the group's key serves them; nothing serves yet. Connecting is offered in DEC-156's order (the
   subscription, only while `op=bootstrap`'s `parts` holds the sign-in, instance-setup R81; then an API key; then
   skipping), once the disclosure of what connecting means is read. A key or code is sent in the request's body only,
   and never kept, drawn or sent again (R10). Every function is self-contained (interface-shell R21). */

export const connect = {
  id: "connect",

  reads(view) {
    const me = view.me || {};
    const own = "member:" + me.member;
    return {
      assistant: { op: "assistantstate" },
      keepaway: { op: "aikeepawaystate" },
      groupkey: { op: "groupkeystate" },
      notice: { op: "groupkeynotice" },
      // `disclosureshown` records the door's `by`: `member:<id>`, or `admin` for the founder's session
      disclosure: { op: "disclosureof", query: { member: me.member === "admin" ? "admin" : own } },
      reference: { op: "accountreference" },
      // a mutating op (control-plane R65), so its state is asked in a body
      signin: { op: "subscriptionsignin", body: { step: "state" } },
      boot: { op: "bootstrap" },
      uses: { op: "accountuses", query: { owner: own } },
      limits: { op: "ailimits", query: { owner: own } },
      usage: { op: "aiusage", query: { owner: own } },
      history: { op: "accounthistory", query: { owner: own } },
      // the member's own use across every payer, with the limits that bind them (ai-use R4; J2's last point)
      mine: { op: "aiusage" },
    };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.connect.";
    const T = (k, f) => String(W(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const me = view.me || {};
    const ui = view.ui || {};
    const data = view.data || {};
    const okv = (o) => (o && o.state === "ok" && o.value && o.value.ok !== false ? o.value : null);
    const outward = (inner) => `<div class="cs-notice"><p class="cs-tag-outward">${W("mark.outward.means")}</p>${inner}</div>`;
    const names = (by) => { const id = String(by || "").replace(/^member:/, ""); return id === me.member ? T(S + "you") : id === "admin" ? T("screen.members.founder") : id; };
    const out = [cs.title(), `<p>${W(S + "optional")}</p>`, `<p class="cs-note">${W("ai.whopays")}</p>`];

    // the situation: exactly one of four (R4)
    const ka = okv(data.keepaway), as = okv(data.assistant);
    let kept = null;
    if (ka && ka.on === true) kept = { by: ka.set_by, at: ka.set_at, reason: ka.reason };
    else if (as && as.on === false) kept = { by: as.set_by, at: as.set_at, reason: as.reason };
    else if (ka && ka.on !== false && !as) kept = { by: null, at: null, reason: null };
    if (!kept && !as && !ka) return out.join("") + cs.state(data.assistant, () => "");
    if (kept) {
      // the group keeps its material away: who, when, the reason in the administrator's words, and no act
      out.push(`<div class="cs-situation" data-situation="keptaway"><p>${kept.by ? W(S + "keptaway", { by: names(kept.by), date: D(kept.at) }) : W(S + "keptaway.unread")}${kept.reason ? ` <span class="rec">${E(kept.reason)}</span>` : ""}</p><p>${W(S + "keptaway.ask")}</p></div>`);
      return out.join("");
    }
    const ref = okv(data.reference), sub = okv(data.signin), gk = okv(data.groupkey);
    const subscribed = !!(sub && sub.connected === true) || !!(ref && ref.subscription && ref.subscription.connected === true);
    const keyed = !!(ref && ref.held === true);
    const groupServes = !!(gk && gk.on === true);
    const situation = subscribed || keyed ? "own" : groupServes ? "group" : "none";

    if (situation === "own") {
      out.push(`<div class="cs-situation" data-situation="own"><p>${W(subscribed ? S + "own.subscription" : S + "own.apikey")}</p>${groupServes ? `<p>${W(S + "own.thengroup")}</p>` : ""}</div>`);
    } else if (situation === "group") {
      // the member's allowance on the group's key, when a per-member limit is set
      let allowance = "";
      const mine = okv(data.mine);
      const payer = mine && (mine.payers || []).find((p) => p.whose === "group");
      const lim = payer && (payer.limits || []).find((l) => l.scope === "per_member");
      if (lim) allowance = " " + W(lim.reached ? S + "group.allowance.reached" : S + "group.allowance", { amount: lim.unit === "usd" ? "$" + Number(lim.amount).toFixed(2) : Number(lim.amount).toLocaleString("en"), unit: T("screen.panel.unit." + lim.unit), period: T("screen.panel.period." + lim.period) });
      out.push(`<div class="cs-situation" data-situation="group"><p>${W(S + "group")}${allowance}</p><p><a href="#connect-own">${W(S + "group.more")}</a></p></div>`);
    } else {
      out.push(`<div class="cs-situation" data-situation="none"><p>${W(S + "none")}</p></div>`);
    }
    // a read that did not answer is said, never taken as "nothing serves" (interface-shell R10)
    if (!ref) out.push(cs.state(data.reference, () => ""));
    if (!gk) out.push(cs.state(data.groupkey, () => ""));

    // the group key's notice, before the first question on it
    const notice = okv(data.notice);
    if (situation === "group" && notice && notice.due === true) out.push(cs.sec(S + "notice.heading", outward(`<p>${W(S + "notice.group")}</p>${cs.act("groupkeynoticeseen")}`)));

    // connecting one's own account (R5), once the disclosure of what it means is read
    if (situation !== "own") {
      const c = cs.state(data.disclosure, (disc) => {
        if (disc.shown !== true) return outward(`<p>${W(S + "disclosure.own")}</p>${cs.act("disclosureshown", { data: { version: disc.version || "" } })}`) + `<p>${W(S + "disclosure.then")}</p>`;
        let h = "";
        const boot = okv(data.boot);
        const part = boot && Array.isArray(boot.parts) ? boot.parts.find((p) => p.part === "signin") : null;
        // 1. the subscription, offered only while the sign-in is present (trial §3.2)
        if (part && part.present === true) {
          const start = cs.act("subscriptionsignin", { label: "act.owed_subscriptionsignin.label.connect", data: { step: "start" } });
          const code = cs.act("subscriptionsignin", { label: S + "signin.connect", data: { step: "code" } });
          if (start || code) {
            const open = ui.signinAddress ? `<p data-shown="signin"><a href="${E(ui.signinAddress)}" target="_blank" rel="noopener noreferrer">${W(S + "signin.open")}</a></p>` : "";
            h += `<h3>${W(S + "signin.heading")}</h3><ol class="cs-list"><li>${W(S + "signin.step1")}</li><li>${W(S + "signin.step2")}</li><li>${W(S + "signin.step3")}</li><li>${W(S + "signin.step4")}</li></ol>${start}${open}<div class="cs-form"><label for="mc-code${ui.gen || 0}">${W(S + "signin.code")}</label><span class="help">${W(S + "signin.help")}</span><input id="mc-code${ui.gen || 0}" type="password" class="cs-input" autocomplete="off">${code}</div>`;
          }
        } else h += `<p data-state="signin">${W(part && part.present === false ? S + "signin.absent" : S + "signin.unread")}</p>`;
        // 2. an API key
        const set = cs.act("accountreferenceset");
        if (set) h += `<h3>${W(S + "apikey.heading")}</h3><div class="cs-form"><label for="mc-key${ui.gen || 0}">${W(S + "apikey.field")}</label><span class="help">${W(S + "apikey.help")}</span><input id="mc-key${ui.gen || 0}" type="password" class="cs-input" autocomplete="off">${set}</div>`;
        // 3. skip
        return h + `<p>${W(S + "skip")}</p>`;
      });
      out.push(`<div id="connect-own">${cs.sec(S + "own.heading", c)}</div>`);
    }

    // on the group's key, its settings are the administrators'
    if (situation === "group") out.push(cs.sec(S + "grouplimits.heading", `<p>${W(S + "grouplimits")}</p>`));

    // the member's own account: the panel (R9) and disconnecting
    if (situation === "own") {
      if (view.parts && view.parts.aiPanel) out.push(view.parts.aiPanel(cs, view, { owner: "member:" + me.member, explore: false, perMember: false, names }));
      const dis = (subscribed ? cs.act("subscriptiondisconnect", { label: S + "disconnect.subscription" }) : "") + (keyed ? cs.act("accountreferenceremove") : "");
      if (dis) out.push(cs.sec(S + "disconnect.heading", dis));
    }
    return out.join("");
  },

  acts: [
    { op: "groupkeynoticeseen", rereads: ["notice"], outward: true,
      send() { return { body: {} }; } },
    { op: "disclosureshown", rereads: ["disclosure"], outward: true,
      send(view, el) { const me = view.me || {}; return { body: { member: me.member === "admin" ? "admin" : "member:" + me.member, version: el.dataset.version } }; } },
    // the owed sign-in, re-pointed to `subscriptionsignin` (DEC-156; control-plane R65): start, then the code
    { op: "subscriptionsignin", rereads: ["signin", "reference", "uses", "limits", "usage", "history"],
      send(view, el, cs) {
        if (el.dataset.step === "start") return { body: { step: "start" } };
        const code = String(cs.value("mc-code" + ((view.ui && view.ui.gen) || 0)) || "").trim();
        return code ? { body: { step: "code", code } } : { refuse: "screen.connect.signin.nocode" };
      },
      // Anthropic's page, offered to open in a new browsing context, with no opener and no referrer (J2 (3))
      // the code's field drawn anew, empty (the shell keeps a field's value by its id; R10)
      done(view, answer, cs) { const a = answer && answer.result !== undefined ? answer.result : answer; if (a && a.address) cs.set("signinAddress", a.address); else cs.set("gen", ((view.ui && view.ui.gen) || 0) + 1); },
      // RUNNER_NOT_CONFIGURED and DISCLOSURE_DUE: the translation the door relays (control-plane R65)
      refusals: { NO_SIGNIN_WAITING: "screen.connect.refused.NO_SIGNIN_WAITING", SIGNIN_REFUSED: "screen.connect.refused.SIGNIN_REFUSED", SIGNIN_UNAVAILABLE: "screen.connect.refused.SIGNIN_UNAVAILABLE",
        SIGNIN_ADDRESS_UNEXPECTED: "screen.connect.refused.SIGNIN_ADDRESS_UNEXPECTED", AGENT_WORKER_UNBOUND: "screen.connect.refused.AGENT_WORKER_UNBOUND", AI_KEPT_AWAY: "screen.connect.refused.AI_KEPT_AWAY" } },
    { op: "accountreferenceset", rereads: ["reference", "uses", "limits", "usage", "history"], outward: true,
      send(view, el, cs) { const secret = String(cs.value("mc-key" + ((view.ui && view.ui.gen) || 0)) || "").trim(); return secret ? { body: { member: "member:" + (view.me || {}).member, kind: "apikey", secret } } : { refuse: "screen.connect.apikey.nokey" }; },
      done(view, answer, cs) { cs.set("gen", ((view.ui && view.ui.gen) || 0) + 1); } },
    { op: "accountusesset", rereads: ["uses", "history"],
      send(view, el, cs) { return view.parts.aiPanelSend("accountusesset", "member:" + (view.me || {}).member, el, cs); },
      refusals: { SWITCH_VALUE_INVALID: "ai.refused.switchvalue" } },
    { op: "ailimitset", rereads: ["limits"],
      send(view, el, cs) { return view.parts.aiPanelSend("ailimitset", "member:" + (view.me || {}).member, el, cs); },
      refusals: { AI_LIMIT_INVALID: (r, cs) => cs.w("ai.refused.limitinvalid", { field: String(cs.w("ai.limitfield." + (["owner", "scope", "unit", "period", "amount", "inclusive", "use", "count"].indexOf(r && r.field) >= 0 ? r.field : "amount"))).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])) }), LIMIT_UNIT_UNAVAILABLE: "ai.refused.unitunavailable" } },
    { op: "accountreferenceremove", rereads: ["reference", "uses", "limits", "usage", "history"],
      send(view) { return { body: { member: "member:" + (view.me || {}).member } }; } },
    { op: "subscriptiondisconnect", rereads: ["signin", "reference", "uses", "limits", "usage", "history"],
      send() { return { body: {} }; } },
  ],
};

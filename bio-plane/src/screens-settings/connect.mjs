/* screens-settings R4, R5 (and R8, R9, R10): Settings › The assistant, the registry's 7 acts with its two re-points
   (`subscriptionsignin` for the owed sign-in, `subscriptiondisconnect` beside `accountreferenceremove`; interface-shell
   R21). It draws exactly one of four situations: the group keeps its material away from AI; the member's own account
   serves them; the group's key serves them; nothing serves yet. Connecting is offered in DEC-156's order (the
   subscription, only while the sign-in is installed; then an API key; then
   skipping), once the disclosure of what connecting means is read. A key or code is sent in the request's body only,
   and never kept, drawn or sent again (R10). Every function is self-contained (interface-shell R21).
   T47: the sign-in is offered only while `op=bootstrap`'s flat `part_signin` answers `true` (R13, instance-setup R82);
   every sign-in refusal is drawn in words, the shell adding its reference (R24, interface-shell R39); the subscription's
   state is read from the plane (`accountreference`'s `subscription`, credentials R70): since when, until when, refused at
   Anthropic ("connect again"); a failed state read is said, never drawn as not connected. */

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
      over: { op: "aiuseovertime", query: { owner: own } },
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
    const outward = (inner) => `<div class="mk-msg"><p class="cs-tag-outward">${W("mark.outward.means")}</p>${inner}</div>`;
    // who did it, by handle: the viewer by their own, the founder by hers or `member.founder.unnamed`, never the id `admin` and never a
    // bare "you" (R37: every fill filled)
    const names = (by) => {
      const id = String(by || "").replace(/^member:/, "");
      if (id === me.member) return me.handle || (me.member === "admin" ? T("member.founder.unnamed") : id);
      return id === "admin" ? T("member.founder.unnamed") : id;
    };
    const out = [cs.title(), `<p>${W(S + "optional")}</p>`, `<p class="mk-note">${W("ai.whopays")}</p>`];

    // the situation: exactly one of four (R4)
    const ka = okv(data.keepaway), as = okv(data.assistant);
    let kept = null;
    if (ka && ka.on === true) kept = { by: ka.set_by, at: ka.set_at, reason: ka.reason };
    else if (as && as.on === false) kept = { by: as.set_by, at: as.set_at, reason: as.reason };
    else if (ka && ka.on !== false && !as) kept = { by: null, at: null, reason: null };
    if (!kept && !as && !ka) return out.join("") + cs.state(data.assistant, () => "");
    if (kept) {
      // the group keeps its material away: who, when, the reason in the administrator's words, and no act
      out.push(`<div class="mk-msg" data-situation="keptaway"><p>${kept.by ? W(S + "keptaway", { by: names(kept.by), date: D(kept.at) }) : W(S + "keptaway.unread")}${kept.reason ? ` <span class="rec">${E(kept.reason)}</span>` : ""}</p><p>${W(S + "keptaway.ask")}</p></div>`);
      return out.join("");
    }
    const ref = okv(data.reference), sub = okv(data.signin), gk = okv(data.groupkey);
    // the subscription's state as the plane holds it (credentials R70): the reference's own read, else the sign-in's
    const st = ref && ref.subscription ? ref.subscription : sub || {};
    const subscribed = st.connected === true;
    // neither the reference nor the sign-in's state could be read: whether the member's own account serves them is not
    // known, so no situation is drawn and the failed read is said, never "not connected" (R24)
    if (!ref && !sub) {
      const failed = data.reference && data.reference.state === "failed" && data.signin && data.signin.state === "failed";
      return out.join("") + (failed ? `<p data-state="signinread">${W(S + "signin.statefailed")}</p>` : "") + cs.state(data.reference, () => "");
    }
    const keyed = !!(ref && ref.held === true);
    const groupServes = !!(gk && gk.on === true);
    const situation = subscribed || keyed ? "own" : groupServes ? "group" : "none";

    if (situation === "own") {
      // what serves them, with every fill filled from the answer (R37): the plan and the day it was signed in, or the key's last four
      // characters, when the plane answers them; else since when (and, when answered, until when: credentials R70) by `own.since`
      const since = subscribed ? st.since : ref && ref.set_at;
      const full = subscribed ? (typeof st.plan === "string" && st.plan && st.since ? W(S + "own.subscription", { plan: st.plan, date: D(st.since) }) : "")
        : typeof (ref && ref.last4) === "string" && ref.last4 ? W(S + "own.apikey", { last4: ref.last4 }) : "";
      const when = since ? `<p data-state="since">${full ? "" : W(S + "own.since", { date: D(since) })}${subscribed && st.valid_until ? (full ? "" : " ") + W(S + "own.until", { date: D(st.valid_until) }) : ""}</p>` : "";
      out.push(`<div class="mk-msg" data-situation="own">${full ? `<p>${full}</p>` : ""}${when}${groupServes ? `<p>${W(S + "own.thengroup")}</p>` : ""}</div>`);
    } else if (situation === "group") {
      // the member's allowance on the group's key, when a per-member limit is set. Its sentence is drawn when every fill is read: the
      // limit, and what they have used of it today (a limit's `used`, in its unit); at the limit, when it is reached, by its period
      let allowance = "";
      const mine = okv(data.mine);
      const payer = mine && (mine.payers || []).find((p) => p.whose === "group");
      const lim = payer && (payer.limits || []).find((l) => l.scope === "per_member");
      const amountOf = (a, u) => (u === "usd" ? "$" + Number(a).toFixed(2) : Number(a).toLocaleString("en"));
      if (lim && lim.reached) allowance = " " + W(S + "group.allowance.reached", { period: T("screen.panel.period." + lim.period) });
      else if (lim && lim.period === "day" && Number.isFinite(Number(lim.used)) && lim.used !== null)
        allowance = " " + W(S + "group.allowance", { limit: T("screen.panel.amount", { amount: amountOf(lim.amount, lim.unit), unit: T("screen.panel.unit." + lim.unit), period: T("screen.panel.period." + lim.period) }), used: amountOf(lim.used, lim.unit), when: T("ai.usage.today") });
      out.push(`<div class="mk-msg" data-situation="group"><p>${W(S + "group")}${allowance}</p><p><a href="#connect-own">${W(S + "group.more")}</a></p></div>`);
    } else {
      out.push(`<div class="mk-msg" data-situation="none"><p>${W(S + "none")}</p></div>`);
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
        // the sign-in's part, read flat (R13; instance-setup R82): `true` installed, `false` not, `null` not read
        const part = boot ? boot.part_signin : null;
        // refused at Anthropic: said once, with the way back (R24)
        if (st.refused_at && !subscribed) h += `<p class="mk-msg" data-state="refused">${W(S + "signin.again", { date: D(st.refused_at) })}</p>`;
        // R30: one choice first, the subscription preselected (DEC-156's order); only the chosen path's steps are drawn, and
        // "Not now" draws nothing more
        h += cs.choice("mc-way", S + "way.field", [["subscription", S + "way.subscription"], ["apikey", S + "way.apikey"], ["later", S + "way.later"]], { acts: {}, value: "subscription" });
        const way = ui["choice:mc-way"] || "subscription";
        if (way === "subscription") {
          // the subscription, offered only while the sign-in is installed (trial §3.2)
          if (part === true) {
            let start = cs.act("subscriptionsignin", { data: { step: "start" } });
            const code = cs.act("subscriptionsignin", { label: S + "signin.connect", data: { step: "code" } });
            // "Open Anthropic's sign-in page" is not pressed again while a start is in flight (R24)
            if (ui.starting) start = start.replace('<button type="button"', '<button type="button" disabled aria-disabled="true"');
            if (start || code) {
              const open = ui.signinAddress ? `<p data-shown="signin"><a href="${E(ui.signinAddress)}" target="_blank" rel="noopener noreferrer">${W(S + "signin.open")}</a></p>` : "";
              h += `<h3>${W(S + "signin.heading")}</h3><ol class="mk-list"><li>${W(S + "signin.step1")}</li><li>${W(S + "signin.step2")}</li><li>${W(S + "signin.step3")}</li><li>${W(S + "signin.step4")}</li></ol>${start}${open}${cs.field("mc-code" + (ui.gen || 0), S + "signin.code", { type: "password", help: S + "signin.whole", autocomplete: "off" })}<p class="mk-note">${W(S + "signin.help")}</p>${code}`;
              // what the sign-in can answer instead of connecting, beside the code (R38, DEC-246): each refusal by its key, its reference
              // as the shell draws one (`refusal.reference`, interface-shell R69). The runner's own word and a reference are shown as examples
              h += `<details class="mk-details" data-list="ifnot"><summary>${W("connect.ifnot")}</summary><div>${["refusal.NO_SIGNIN_WAITING", "refusal.SIGNIN_REFUSED", "refusal.SIGNIN_UNAVAILABLE", "refusal.SIGNIN_ADDRESS_UNEXPECTED", "refusal.AGENT_WORKER_UNBOUND", "instance.part.signin.absent"].map((k) => `<p class="mk-msg" data-refusal="${k}">${W(k, k === "refusal.SIGNIN_REFUSED" ? { detail: "invalid_grant" } : {})}</p>`).join("")}<p class="mk-small">${W("screen.connect.refusal.reference", { example: T("refusal.reference", { ref: "7f3a91c2" }) })}</p></div></details>`;
            }
          } else h += `<p data-state="signin">${part === false ? W("instance.part.signin.absent") : W("instance.part.unknown", { part: T(S + "signin.part") })}</p>`;
        } else if (way === "apikey") {
          const set = cs.act("accountreferenceset");
          if (set) h += `<h3>${W(S + "apikey.heading")}</h3>${cs.field("mc-key" + (ui.gen || 0), S + "apikey.field", { type: "password", help: S + "apikey.help", autocomplete: "off" })}${set}`;
        } else h += `<p class="mk-note" data-state="notnow">${W("connect.notnow")}</p>`;
        return h;
      });
      out.push(`<div id="connect-own">${cs.sec(S + "own.heading", c)}</div>`);
    }

    // on the group's key, its settings are the administrators'
    // (R37: drawn only when every fill is read: the per-member limit, what they have used of it today, and the group's suggestions switch)
    if (situation === "group") {
      const mine = okv(data.mine);
      const payer = mine && (mine.payers || []).find((p) => p.whose === "group");
      const lim = payer && (payer.limits || []).find((l) => l.scope === "per_member" && l.period === "day");
      const sug = gk && typeof gk.suggestions === "boolean" ? gk.suggestions : null;
      if (lim && lim.used !== null && lim.used !== undefined && Number.isFinite(Number(lim.used)) && sug !== null) {
        const amountOf = (a, u) => (u === "usd" ? "$" + Number(a).toFixed(2) : Number(a).toLocaleString("en"));
        out.push(cs.sec(S + "grouplimits.heading", `<p>${W(S + "grouplimits", { limit: T("screen.panel.amount", { amount: amountOf(lim.amount, lim.unit), unit: T("screen.panel.unit." + lim.unit), period: T("screen.panel.period." + lim.period) }), used: amountOf(lim.used, lim.unit), suggestions: T(sug ? "screen.panel.on" : "screen.panel.off") })}</p>`));
      }
    }

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
    // the member's own sign-in (DEC-156; control-plane R65): start, then the code. A start in flight disables its button
    // until it answers (R24): set before it is sent, cleared by its answer or by any refusal (each drawn in words, R24)
    { op: "subscriptionsignin", rereads: ["signin", "reference", "uses", "limits", "usage", "history"],
      send(view, el, cs) {
        if (el.dataset.step === "start") { cs.set("starting", true); return { body: { step: "start" } }; }
        const code = String(cs.value("mc-code" + ((view.ui && view.ui.gen) || 0)) || "").trim();
        return code ? { body: { step: "code", code } } : { refuse: "screen.connect.signin.nocode" };
      },
      // Anthropic's page, offered to open in a new browsing context, with no opener and no referrer (J2 (3))
      // the code's field drawn anew, empty (the shell keeps a field's value by its id; R10)
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (view.ui && view.ui.starting) cs.set("starting", false);
        if (a && a.address) cs.set("signinAddress", a.address); else cs.set("gen", ((view.ui && view.ui.gen) || 0) + 1);
      },
      // every code `/signin` can answer (agent-worker R84's `SIGNIN_CODES`) and the door's own (control-plane R65), each in
      // words: `refusal.<code>` where `words.json` holds it, else this module's meaning; `{detail}` filled where it has one
      refusals: {
        NO_SIGNIN_WAITING: (r, cs) => { cs.set("starting", false); return cs.w("refusal.NO_SIGNIN_WAITING", r); },
        SIGNIN_REFUSED: (r, cs) => { cs.set("starting", false); return cs.w("refusal.SIGNIN_REFUSED", { detail: r.detail || r.code || "SIGNIN_REFUSED" }); },
        SIGNIN_UNAVAILABLE: (r, cs) => { cs.set("starting", false); return cs.w("refusal.SIGNIN_UNAVAILABLE", r); },
        SIGNIN_ADDRESS_UNEXPECTED: (r, cs) => { cs.set("starting", false); return cs.w("refusal.SIGNIN_ADDRESS_UNEXPECTED", r); },
        AGENT_WORKER_UNBOUND: (r, cs) => { cs.set("starting", false); return cs.w("refusal.AGENT_WORKER_UNBOUND", r); },
        DISCLOSURE_DUE: (r, cs) => { cs.set("starting", false); return cs.w("refusal.DISCLOSURE_DUE", r); },
        AI_KEPT_AWAY: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.AI_KEPT_AWAY", r); },
        RUNNER_NOT_CONFIGURED: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.RUNNER_NOT_CONFIGURED", r); },
        RUNNER_NOT_STARTED: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.RUNNER_NOT_STARTED", { detail: r.detail || r.code || "RUNNER_NOT_STARTED" }); },
        RUNNER_SILENT: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.RUNNER_SILENT", r); },
        AGENT_WORKER_SILENT: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.AGENT_WORKER_SILENT", r); },
        ATTEMPT_SUPERSEDED: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.ATTEMPT_SUPERSEDED", r); },
        NOT_THIS_MEMBER: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.NOT_THIS_MEMBER", r); },
        BAD_CODE: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.BAD_CODE", r); },
        BAD_BODY: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.BAD_REQUEST", r); },
        BAD_MEMBER: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.BAD_REQUEST", r); },
        BAD_REQUEST: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.BAD_REQUEST", r); },
        BAD_STEP: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.BAD_REQUEST", r); },
        SIGNIN_NOT_HELD: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.SIGNIN_NOT_HELD", r); },
        SIGNIN_TOKEN_REFUSED: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.SIGNIN_TOKEN_REFUSED", r); },
        SIGNOUT_FAILED: (r, cs) => { cs.set("starting", false); return cs.w("screen.connect.refused.SIGNOUT_FAILED", r); },
      } },
    { op: "accountreferenceset", rereads: ["reference", "uses", "limits", "usage", "history"], outward: true,
      send(view, el, cs) { const secret = String(cs.value("mc-key" + ((view.ui && view.ui.gen) || 0)) || "").trim(); return secret ? { body: { member: "member:" + (view.me || {}).member, kind: "apikey", secret } } : { refuse: "screen.connect.apikey.nokey" }; },
      done(view, answer, cs) { cs.set("gen", ((view.ui && view.ui.gen) || 0) + 1); } },
    { op: "accountusesset", rereads: ["uses", "history"],
      send(view, el, cs) { return view.parts.aiPanelSend("accountusesset", "member:" + (view.me || {}).member, el, cs); },
      refusals: { SWITCH_VALUE_INVALID: "ai.refused.switchvalue" } },
    { op: "ailimitset", rereads: ["limits", "over"],
      send(view, el, cs) { return view.parts.aiPanelSend("ailimitset", "member:" + (view.me || {}).member, el, cs); },
      refusals: { AI_LIMIT_INVALID: (r, cs) => cs.w("ai.refused.limitinvalid", { field: String(cs.w("ai.limitfield." + (["owner", "scope", "unit", "period", "amount", "inclusive", "use", "count"].indexOf(r && r.field) >= 0 ? r.field : "amount"))).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])) }), LIMIT_UNIT_UNAVAILABLE: "ai.refused.unitunavailable" } },
    { op: "accountreferenceremove", rereads: ["reference", "uses", "limits", "usage", "history"],
      send(view) { return { body: { member: "member:" + (view.me || {}).member } }; } },
    { op: "subscriptiondisconnect", rereads: ["signin", "reference", "uses", "limits", "usage", "history"],
      send() { return { body: {} }; } },
  ],
};

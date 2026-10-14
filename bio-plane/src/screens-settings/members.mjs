/* screens-settings R1, R2 (and R8, R9): Settings › Members, the registry's 15 acts. The roster, each row's acts in its
   panel (interface-shell R19, `cs.rows`); the one-administrator note while not met (setup-page R16's meaning); inviting,
   with the invitation shown once; joining through the group's website; the group's API key; the AI account panel over
   `owner: "group"`; keeping the group's material away from AI. A member opened by address (`/app/members/<id>`) has
   their expertise read (`expertiselist`) and their row's panel offers its confirmation. Every function is
   self-contained (interface-shell R21).
   T47: each row's name is the member's reference (R12, `cs.rows`' `name`, interface-shell R27); a row offers "Make a
   reset link" (`passwordresetlink`, the link shown once with the sentence that no email is sent) and "Withdraw
   <handle>'s signing key" (`signerset`) for a lost or stolen device; "More for administrators" links `group`, `places`
   and `recovery` (R23). */

export const members = {
  id: "members",

  reads(view) {
    const admin = !!(view.me && view.me.administer === true);
    const r = {
      roster: { op: "memberlist", empty: (v) => !v.members || v.members.length === 0 },
      groupkey: { op: "groupkeystate" },
      keepaway: { op: "aikeepawaystate" },
      // `claimed` says whether the founder holds the instance: the founder is then an administrator (membership R64, R86), with or without a roster row (R29)
      boot: { op: "bootstrap" },
    };
    if (view.subject) r.expertise = { op: "expertiselist", query: { memberId: view.subject } };
    // the owners refuse these to a member who does not administer (instance-setup R66; credentials R60; ai-use R12)
    if (admin) {
      r.recovery = { op: "adminrecoverystep" };
      r.signers = { op: "signerlist" };
      r.uses = { op: "accountuses", query: { owner: "group" } };
      r.limits = { op: "ailimits", query: { owner: "group" } };
      r.usage = { op: "aiusage", query: { owner: "group" } };
      r.history = { op: "accounthistory", query: { owner: "group" } };
      // thirty days of bars and a meter against each limit, summed (R26)
      r.over = { op: "aiuseovertime", query: { owner: "group" } };
    }
    return r;
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.members.";
    const T = (k, f) => String(W(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const me = view.me || {};
    const ui = view.ui || {};
    const data = view.data || {};
    const admin = me.administer === true;
    const okv = (o) => (o && o.state === "ok" ? o.value : null);
    const roster = okv(data.roster) && Array.isArray(data.roster.value.members) ? data.roster.value.members : [];
    const byId = {};
    for (const m of roster) byId[m.member_id] = m;
    // a recorded `by` (a bare id, `member:<id>` or `admin`) drawn as the member's handle where the roster names it
    const names = (by) => { const id = String(by || "").replace(/^member:/, ""); return id === "admin" ? T(S + "founder") : byId[id] && byId[id].handle ? byId[id].handle : id; };
    const vocabulary = Array.isArray(me.vocabulary) && me.vocabulary.length ? me.vocabulary : ["contribute", "publish", "create_projects"];
    const capName = (c) => vocabulary.indexOf(c) >= 0 || c === "administer" ? T(S + "cap." + c) : c;
    const out = [cs.title()];
    // a member opened by address has their row's panel open (interface-shell R19's `open:<rows>`)
    if (view.subject && view.ui && !view.ui.subjectOpened) { view.ui["open:roster"] = [...(view.ui["open:roster"] || []), String(view.subject)]; view.ui.subjectOpened = true; }

    // the roster (R1): handle, cover, role, capabilities, status; no "formerly" (DEC-197)
    out.push(cs.state(data.roster, (v) => {
      const list = v.members || [];
      const active = list.filter((m) => m.status === "active");
      const rec = okv(data.recovery);
      // administrators as membership R64 and R86 define them: the founder once claimed, then each active member with role admin; never roster rows alone (R29)
      const boot = okv(data.boot);
      const counted = boot && typeof boot.claimed === "boolean" ? active.filter((m) => m.role === "admin" && m.member_id !== "admin").length + (boot.claimed ? 1 : 0)
        : rec && Number.isInteger(rec.administrators) ? rec.administrators : null;
      let h = counted === null ? cs.state({ state: "failed" }, () => "") : `<p>${W(S + "count", { members: active.length, administrators: counted })}</p>`;
      if (admin && rec && rec.met === false)
        h += `<div class="mk-msg" data-note="recovery"><p>${W(rec.administrators === 1 ? S + "recovery.one" : S + "recovery.many", { administrators: rec.administrators })} ${W(rec.codes_held ? S + "recovery.codes" : S + "recovery.nocodes", { remaining: rec.remaining })}</p><p>${rec.administrators < 2 ? `<a href="#members-invite">${W(S + "recovery.add")}</a> ` : ""}${rec.codes_held ? "" : `<a href="/app/recovery" data-nav>${W(S + "recovery.issue")}</a>`}</p></div>`;
      const cols = [S + "col.handle", ...(admin ? [S + "col.cover"] : []), S + "col.role", S + "col.caps", S + "col.status", S + "col.expertise"];
      const expOf = (m) => {
        const ex = okv(data.expertise);
        return view.subject === m.member_id && ex ? ex.expertise || [] : m.expertise || [];
      };
      return h + cs.rows({
        // the member's handle is their reference (R12); one not joined yet has none
        id: "roster", cols, items: list, key: (m) => m.member_id, name: (m) => (m.handle ? cs.ref("member", m.member_id, m.handle) : E(T(S + "nohandle"))),
        cells: (m) => [
          m.handle ? cs.ref("member", m.member_id, m.handle) : E(T(S + "nohandle")),
          ...(admin ? [m.cover !== undefined ? E(m.cover) : ""] : []),
          W(m.role === "admin" ? S + "role.admin" : S + "role.member"),
          E((m.capabilities || []).map(capName).join(", ")),
          W(S + "status." + (["invited", "proposed", "active", "revoked"].indexOf(m.status) >= 0 ? m.status : "other")) + (m.invitation ? " · " + W(S + "invitation." + m.invitation) : ""),
          expOf(m).filter((e) => e.state !== "withdrawn").map((e) => W(e.confirmed ? S + "expertise.confirmed" : S + "expertise.declared", { label: e.label })).join(" · "),
        ],
        // each row's acts, in its panel (R2; interface-shell R19)
        acts: (m) => {
          const label = m.handle || T(S + "nohandle");
          const id = m.member_id;
          const p = [];
          if (m.role !== "admin" && m.status === "active") {
            const c = cs.act("membercaps", { data: { member: id } });
            if (c) p.push(`<fieldset><legend>${W(S + "caps.legend", { handle: label })}</legend>${vocabulary.map((v) => `<input type="checkbox" id="mc-${E(id)}-${v}"${(m.capabilities || []).indexOf(v) >= 0 ? " checked" : ""}><label for="mc-${E(id)}-${v}">${E(capName(v))}</label>`).join("")}</fieldset>${c}`);
          }
          if (m.status === "revoked" || (m.status === "active" && m.role !== "admin")) {
            const next = m.status === "active" ? "revoked" : "active";
            const c = cs.act("memberset", { data: { member: id, status: next } });
            if (c) p.push(`<p>${W(S + "status.to." + next, { handle: label })}</p>${c}`);
          }
          if (m.role === "admin" && m.status === "proposed") { const c = cs.act("adminendorse", { data: { member: id } }); if (c) p.push(`<p>${W(S + "endorse.what", { handle: label })}</p>${c}`); }
          if (m.role === "admin" && m.status === "active" && id !== me.member) {
            const c = cs.act("adminremove", { data: { member: id } });
            if (c) p.push(`${cs.field("mr-" + id, S + "remove.reason", { area: true, rec: true, max: 2000 })}${c}`);
          }
          if (m.invitation === "live") p.push(cs.act("invitewithdraw", { data: { member: id } }));
          // a reset link for a member who has joined (credentials R69), shown once; an administrator's act, which the
          // owner refuses anyone else (drawn only to a session that administers, interface-shell R12)
          if (admin && m.handle && m.status === "active" && id !== me.member) {
            // its label is held under the owed act's key in `words.json` (DEC-201 (2))
            const c = cs.act("passwordresetlink", { label: "act.owed_passwordresetlink.label.members", data: { member: id } });
            if (c) p.push(`${ui.reset && ui.reset.member === id ? `<div class="mk-msg" data-shown="reset"><p>${W(S + "reset.shown", { handle: label, expires: D(ui.reset.expires) })}</p><p><code>${E(ui.reset.link)}</code></p><p>${W(S + "reset.noemail")}</p></div>` : ""}${c}`);
          }
          // the member's active signing keys, each withdrawn for a lost or stolen device (credentials R10)
          const sg = okv(data.signers);
          for (const k of sg && Array.isArray(sg.signers) ? sg.signers.filter((x) => x.member_id === id && x.status === "active") : [])
            p.push(`<p>${W(S + "signer.held", { key: "…" + String(k.key_b64).slice(-8), date: D(k.added) })}</p>${cs.act("signerset", { label: S + "signer.withdraw", fills: { handle: label }, data: { key: k.key_b64 } })}`);
          for (const e of expOf(m)) if (e.state === "declared" && !e.confirmed) p.push(`<p>${W(S + "expertise.declared", { label: e.label })}</p>${cs.act("expertiseconfirm", { data: { member: id, label: e.label } })}`);
          return p.join("");
        },
      });
    }, { empty: S + "empty" }));

    // more for administrators (R23): the group's other settings
    if (admin) out.push(cs.sec(S + "more.heading", `<ul class="mk-list" data-list="more">${["group", "places", "recovery"].map((id) => `<li><a class="cs-ref" href="/app/${id}" data-nav>${W("screen." + id + ".name")}</a></li>`).join("")}</ul>`));

    // inviting (R2): the short id, the cover and the capabilities ticked; the invitation shown once
    const add = cs.act("memberadd");
    if (add) {
      const shown = ui.invite ? `<div class="mk-msg" data-shown="invite"><p>${W(S + "invite.shown", { handle: ui.invite.memberId, expires: D(ui.invite.expires) })}</p><p><code>${E(ui.invite.link)}</code></p></div>` : "";
      out.push(`<div id="members-invite">${cs.sec(S + "invite.heading", `${shown}${cs.field("mi-id", S + "invite.id", { help: S + "invite.id.help", autocomplete: "off" })}${cs.field("mi-cover", S + "invite.cover", { autocomplete: "off" })}<fieldset><legend>${W(S + "invite.caps")}</legend>${vocabulary.map((v) => `<input type="checkbox" id="mi-cap-${v}"${v === "contribute" ? " checked" : ""}><label for="mi-cap-${v}">${E(capName(v))}</label>`).join("")}<input type="checkbox" id="mi-cap-administer"><label for="mi-cap-administer">${E(capName("administer"))}</label></fieldset>${add}<p class="mk-note">${W(S + "invite.noemail")}</p>`)}</div>`);
    }

    // joining through the group's website: a website key, or the reusable join link, each shown once
    const wk = cs.act("websitekeycreate"), jl = cs.act("joinlinkenable");
    if (wk || jl) {
      let shown = "";
      if (ui.websiteKey) shown += `<div class="mk-msg" data-shown="websitekey"><p>${W(S + "website.keyshown")}</p><p><code>${E(ui.websiteKey)}</code></p></div>`;
      if (ui.joinLink) shown += `<div class="mk-msg" data-shown="joinlink"><p>${W(S + "website.linkshown")}</p><p><code>${E(ui.joinLink)}</code></p></div>`;
      out.push(cs.sec(S + "website.heading", `<p>${W(S + "website.what")}</p>${shown}${cs.field("mw-cap", S + "website.cap")}${cs.field("mw-days", S + "website.days")}${wk}${jl}`));
    }

    // the group's API key (R2): held and on, never the key; a key typed is sent in the body only, then switched on
    out.push(cs.sec(S + "key.heading", cs.state(data.groupkey, (g) => {
      let h = `<p data-state="groupkey">${g.held === undefined ? W(g.on ? S + "key.on" : S + "key.off") : !g.held ? W(S + "key.none") : W(g.on ? S + "key.heldon" : S + "key.heldoff", { by: names(g.by), date: D(g.set_at) })}</p>`;
      const set = cs.act("groupkeyset");
      if (set) h += `${cs.field("mk-key" + (ui.keyGen || 0), g.held ? S + "key.replace" : S + "key.field", { type: "password", autocomplete: "off" })}${set}`;
      if (g.held) h += cs.act("groupkeyswitch", { label: g.on ? S + "key.switchoff" : S + "key.switchon", data: { on: g.on ? "off" : "on" } }) + cs.act("groupkeyremove");
      return h;
    }) + `<p class="mk-note">${W("ai.whopays")}</p>`));

    // the AI account panel over the group's key (R9), for those who may read it
    if (admin && view.parts && view.parts.aiPanel) out.push(view.parts.aiPanel(cs, view, { owner: "group", explore: true, perMember: true, names }));

    // keeping the group's material away from AI (R2): on only with a reason, saying first what it does
    out.push(cs.sec(S + "keepaway.heading", cs.state(data.keepaway, (v) => {
      if (v.on !== true && v.on !== false) return `<p data-state="keepaway">${W(S + "keepaway.unread")}</p>`;
      let h = v.on ? `<p data-state="keepaway">${W(S + "keepaway.on", { by: names(v.set_by), date: D(v.set_at) })} <span class="rec">${E(v.reason || "")}</span></p>` : `<p data-state="keepaway">${W(S + "keepaway.off")}</p>`;
      const on = cs.act("aikeepaway", { label: v.on ? S + "keepaway.save" : undefined, data: { on: "on" } });
      if (on) {
        const USES = ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore"];
        const chosen = v.on && Array.isArray(v.uses) && v.uses.length < USES.length ? v.uses : null;
        h += `<div><p>${W("act.aikeepaway.does")}</p><fieldset><legend>${W(S + "keepaway.which")}</legend><input type="radio" id="mk-all" name="mk-scope"${chosen ? "" : " checked"}><label for="mk-all">${W(S + "keepaway.all")}</label><input type="radio" id="mk-some" name="mk-scope"${chosen ? " checked" : ""}><label for="mk-some">${W(S + "keepaway.some")}</label></fieldset><fieldset><legend>${W(S + "keepaway.uses")}</legend>${USES.map((u) => `<input type="checkbox" id="mk-use-${u}"${chosen && chosen.indexOf(u) >= 0 ? " checked" : ""}><label for="mk-use-${u}">${W("ai.use." + u + ".name")}</label>`).join("")}</fieldset>${cs.field("mk-why", S + "keepaway.reason", { area: true, rec: true, max: 2000, value: v.on ? v.reason || "" : "" })}${on}${v.on ? cs.act("aikeepaway", { label: S + "keepaway.turnoff", data: { on: "off" } }) : ""}</div>`;
      }
      return h;
    })));
    return out.join("");
  },

  acts: [
    { op: "memberadd", rereads: ["roster", "recovery"],
      send(view, el, cs) {
        const vocabulary = view.me && Array.isArray(view.me.vocabulary) && view.me.vocabulary.length ? view.me.vocabulary : ["contribute", "publish", "create_projects"];
        const memberId = String(cs.value("mi-id") || "").trim(), cover = String(cs.value("mi-cover") || "").trim();
        if (!memberId || !cover) return { refuse: "screen.members.invite.incomplete" };
        const body = { memberId, cover, capabilities: vocabulary.filter((v) => cs.value("mi-cap-" + v) === true) };
        if (cs.value("mi-cap-administer") === true) body.role = "admin";
        return { body };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (a && a.invite) cs.set("invite", { memberId: a.memberId, expires: a.expires, link: (view.origin || "") + "/#invite=" + encodeURIComponent(a.invite) });
      } },
    { op: "membercaps", rereads: ["roster"],
      send(view, el, cs) {
        const id = el.dataset.member;
        const vocabulary = view.me && Array.isArray(view.me.vocabulary) && view.me.vocabulary.length ? view.me.vocabulary : ["contribute", "publish", "create_projects"];
        return { body: { memberId: id, capabilities: vocabulary.filter((v) => cs.value("mc-" + id + "-" + v) === true) } };
      } },
    { op: "memberset", rereads: ["roster", "recovery"],
      send(view, el) { return { body: { memberId: el.dataset.member, status: el.dataset.status } }; } },
    { op: "adminendorse", rereads: ["roster", "recovery"],
      send(view, el) { return { body: { memberId: el.dataset.member } }; },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (a && a.invite) cs.set("invite", { memberId: a.memberId, expires: a.expires, link: (view.origin || "") + "/#invite=" + encodeURIComponent(a.invite) });
      } },
    // its reason in the administrator's own words, from the row's field (membership R7; interface-shell R11's `reasonField`)
    { op: "adminremove", rereads: ["roster", "recovery"], reasonField: "reason",
      send(view, el, cs) {
        const reason = String(cs.value("mr-" + el.dataset.member) || "").trim();
        return reason && reason.length <= 2000 ? { body: { memberId: el.dataset.member, reason } } : { refuse: "screen.members.remove.noreason" };
      } },
    { op: "expertiseconfirm", rereads: ["roster", "expertise"],
      send(view, el) { return { body: { memberId: el.dataset.member, label: el.dataset.label } }; } },
    // the link the member opens to choose a new password (screens-entry's `reset`), shown once
    { op: "passwordresetlink", rereads: [],
      send(view, el) { return { body: { member: el.dataset.member } }; },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (a && a.link) cs.set("reset", { member: a.member, expires: a.expiresAt, link: (view.origin || "") + "/app/reset#reset=" + encodeURIComponent(a.link) });
      } },
    { op: "signerset", rereads: ["signers"],
      send(view, el) { return { body: { keyB64: el.dataset.key, status: "revoked" } }; } },
    { op: "invitewithdraw", rereads: ["roster"],
      send(view, el) { return { body: { memberId: el.dataset.member } }; } },
    { op: "websitekeycreate", rereads: [],
      send(view, el, cs) {
        const dailyCap = Number(cs.value("mw-cap"));
        if (!(Number.isInteger(dailyCap) && dailyCap >= 1)) return { refuse: "screen.members.website.nocap" };
        const days = String(cs.value("mw-days") || "").trim();
        return { body: days ? { dailyCap, expiresInDays: Number(days) } : { dailyCap } };
      },
      done(view, answer, cs) { const a = answer && answer.result !== undefined ? answer.result : answer; if (a && a.key) cs.set("websiteKey", a.key); } },
    { op: "joinlinkenable", rereads: [],
      send(view, el, cs) {
        const dailyCap = Number(cs.value("mw-cap"));
        if (!(Number.isInteger(dailyCap) && dailyCap >= 1)) return { refuse: "screen.members.website.nocap" };
        const days = String(cs.value("mw-days") || "").trim();
        return { body: days ? { dailyCap, expiresInDays: Number(days) } : { dailyCap } };
      },
      done(view, answer, cs) { const a = answer && answer.result !== undefined ? answer.result : answer; if (a && a.link) cs.set("joinLink", (view.origin || "") + "/#join=" + encodeURIComponent(a.link)); } },
    // the key in the request's body only, never drawn again; then switched on, as setup-page R18 does
    { op: "groupkeyset", rereads: ["groupkey", "uses", "history"],
      send(view, el, cs) { const key = String(cs.value("mk-key" + ((view.ui && view.ui.keyGen) || 0)) || "").trim(); return key ? { body: { key } } : { refuse: "screen.members.key.nokey" }; },
      // the field drawn anew, empty (the shell keeps a field's value by its id, R10); the shell does not await `done`:
      // the switch is sent, then the screen opened again, which reads everything anew
      done(view, answer, cs) { cs.set("keyGen", ((view.ui && view.ui.keyGen) || 0) + 1); cs.call("groupkeyswitch", { body: { on: true } }).then(() => cs.go("members", view.subject)); return { stay: true }; } },
    { op: "groupkeyswitch", rereads: ["groupkey", "history"],
      send(view, el) { return { body: { on: el.dataset.on === "on" } }; } },
    { op: "groupkeyremove", rereads: ["groupkey", "uses", "history"],
      send() { return { body: {} }; } },
    { op: "accountusesset", rereads: ["uses", "history"],
      send(view, el, cs) { return view.parts.aiPanelSend("accountusesset", "group", el, cs); },
      refusals: { SWITCH_VALUE_INVALID: "ai.refused.switchvalue" } },
    { op: "ailimitset", rereads: ["limits", "over"],
      send(view, el, cs) { return view.parts.aiPanelSend("ailimitset", "group", el, cs); },
      refusals: { AI_LIMIT_INVALID: (r, cs) => cs.w("ai.refused.limitinvalid", { field: String(cs.w("ai.limitfield." + (["owner", "scope", "unit", "period", "amount", "inclusive", "use", "count"].indexOf(r && r.field) >= 0 ? r.field : "amount"))).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])) }), LIMIT_UNIT_UNAVAILABLE: "ai.refused.unitunavailable" } },
    // on only with a reason of 1 to 2,000 characters in the administrator's own words, its field the act's reason
    // (interface-shell R11's `reasonField`; credentials R51); off with the reason for turning it off
    { op: "aikeepaway", rereads: ["keepaway", "history", "uses"], reasonField: "reason",
      send(view, el, cs) {
        const reason = String(cs.value("mk-why") || "").trim();
        if (reason.length < 1 || reason.length > 2000) return { refuse: "screen.members.keepaway.noreason" };
        // turning it off is reasoned too (op-grades), its reason the same field's
        if (el.dataset.on === "off") return { body: { on: false, reason } };
        const USES = ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore"];
        if (cs.value("mk-some") !== true) return { body: { on: true, reason } };
        const uses = USES.filter((u) => cs.value("mk-use-" + u) === true);
        return uses.length ? { body: { on: true, reason, uses } } : { refuse: "screen.members.keepaway.nouses" };
      } },
  ],
};

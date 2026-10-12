/* screens-settings R1, R2 (and R8, R9): Settings › Members, the registry's 15 acts. The roster with each row's acts in
   its panel (interface-shell R19: the panel opens beneath the row when the member's name is followed, `/app/members/<id>`,
   which also reads that member's expertise); the one-administrator note while not met (setup-page R16's meaning);
   inviting, with the invitation shown once; joining through the group's website; the group's API key; the AI account
   panel over `owner: "group"`; keeping the group's material away from AI. Every function is self-contained
   (K2854 T1): it refers only to its parameters. */

export const members = {
  id: "members",

  reads(ctx) {
    const admin = !!(ctx.me && ctx.me.administer === true);
    const r = [
      { name: "roster", op: "memberlist" },
      { name: "groupkey", op: "groupkeystate" },
      { name: "keepaway", op: "aikeepawaystate" },
    ];
    if (ctx.subject) r.push({ name: "expertise", op: "expertiselist", query: { memberId: ctx.subject } });
    // the owner refuses these to a member who does not administer (instance-setup R66; credentials R60; ai-use R12)
    if (admin) r.push(
      { name: "recovery", op: "adminrecoverystep" },
      { name: "uses", op: "accountuses", query: { owner: "group" } },
      { name: "limits", op: "ailimits", query: { owner: "group" } },
      { name: "usage", op: "aiusage", query: { owner: "group" } },
      { name: "history", op: "accounthistory", query: { owner: "group" } },
    );
    return r;
  },

  render(cs, d, ctx, parts) {
    const W = cs.w, T = cs.t, E = cs.esc, S = "screen.members.";
    const me = ctx.me || {};
    const admin = me.administer === true;
    const form = (inner) => `<div class="cs-form" data-form>${inner}</div>`;
    const sec = (key, inner, id) => `<section class="cs-section"${id ? ` id="${id}"` : ""}><h2>${W(key)}</h2>${inner}</section>`;
    const ok = (o) => o && o.state === "ok" && o.value && o.value.ok !== false;
    const roster = ok(d.roster) && Array.isArray(d.roster.value.members) ? d.roster.value.members : null;
    const byId = new Map((roster || []).map((m) => [m.member_id, m]));
    // a recorded `by` (a bare id, `member:<id>` or `admin`) drawn as the member's handle where the roster names it
    const names = (by) => { const id = String(by || "").replace(/^member:/, ""); const m = byId.get(id); return id === "admin" ? T(S + "founder") : m && m.handle ? m.handle : id; };
    const vocabulary = Array.isArray(me.vocabulary) && me.vocabulary.length ? me.vocabulary : ["contribute", "publish", "create_projects"];
    const capName = (c) => vocabulary.includes(c) || c === "administer" ? T(S + "cap." + c) : c;
    const out = [`<h1>${W("screen.members.name")}</h1>`];

    // the roster (R1): handle, cover, role, capabilities, status; no "formerly" (DEC-197)
    if (!roster) out.push(cs.state(d.roster.state === "ok" ? { state: "failed", refusal: d.roster.value } : d.roster));
    else {
      const active = roster.filter((m) => m.status === "active");
      out.push(`<p>${W(S + "count", { members: active.length, administrators: active.filter((m) => m.role === "admin").length })}</p>`);
      if (admin && ok(d.recovery) && d.recovery.value.met === false) {
        const r = d.recovery.value;
        out.push(`<div class="cs-note" data-note="recovery"><p>${W(r.administrators === 1 ? S + "recovery.one" : S + "recovery.many", { administrators: r.administrators })} ${W(r.codes_held ? S + "recovery.codes" : S + "recovery.nocodes", { remaining: r.remaining })}</p><p>${r.administrators < 2 ? `<a href="#members-invite">${W(S + "recovery.add")}</a> ` : ""}${r.codes_held ? "" : `<a href="/">${W(S + "recovery.issue")}</a>`}</p></div>`);
      }
      if (roster.length === 0) out.push(cs.state({ state: "empty" }, S + "empty"));
      else {
        const rows = roster.map((m) => {
          const label = m.handle || T(S + "nohandle");
          const exp = (m.expertise || []).filter((e) => e.state !== "withdrawn").map((e) => W(e.confirmed ? S + "expertise.confirmed" : S + "expertise.declared", { label: e.label })).join(" · ");
          const cells = `<td><a href="/app/members/${encodeURIComponent(m.member_id)}" data-ref="member">${E(label)}</a></td>${admin ? `<td>${m.cover !== undefined ? E(m.cover) : ""}</td>` : ""}<td>${W(m.role === "admin" ? S + "role.admin" : S + "role.member")}</td><td>${E((m.capabilities || []).map(capName).join(", "))}</td><td>${W(S + "status." + (["invited", "proposed", "active", "revoked"].includes(m.status) ? m.status : "other"))}${m.invitation ? " · " + W(S + "invitation." + m.invitation) : ""}</td><td>${exp}</td>`;
          let panel = "";
          if (ctx.subject === m.member_id) {
            const p = [];
            const id = encodeURIComponent(m.member_id);
            if (m.role !== "admin" && m.status === "active") {
              const c = cs.act("membercaps", { subject: m.member_id, screen: "members" });
              if (c) p.push(form(`<fieldset><legend>${W(S + "caps.legend", { handle: label })}</legend>${vocabulary.map((v) => `<label><input type="checkbox" name="capabilities" value="${E(v)}"${(m.capabilities || []).includes(v) ? " checked" : ""}> ${E(capName(v))}</label>`).join("")}</fieldset>${c}`));
            }
            if (m.status === "active" || m.status === "revoked") {
              const next = m.status === "active" ? "revoked" : "active";
              const c = m.role === "admin" && m.status === "active" ? "" : cs.act("memberset", { subject: m.member_id + "=" + next, screen: "members" });
              if (c) p.push(form(`<p>${W(S + "status.to." + next, { handle: label })}</p>${c}`));
            }
            if (m.role === "admin" && m.status === "proposed") { const c = cs.act("adminendorse", { subject: m.member_id, screen: "members" }); if (c) p.push(form(`<p>${W(S + "endorse.what", { handle: label })}</p>${c}`)); }
            if (m.role === "admin" && m.status === "active" && m.member_id !== me.member) {
              const c = cs.act("adminremove", { subject: m.member_id, screen: "members" });
              if (c) p.push(form(`<label for="mr-${id}">${W(S + "remove.reason")}</label><textarea id="mr-${id}" name="reason" class="cs-input"></textarea>${c}`));
            }
            if (m.invitation === "live") { const c = cs.act("invitewithdraw", { subject: m.member_id, screen: "members" }); if (c) p.push(form(c)); }
            // the member's expertise, as `expertiselist` answers it for the open row
            if (d.expertise) {
              if (!ok(d.expertise)) p.push(cs.state(d.expertise.state === "ok" ? { state: "failed", refusal: d.expertise.value } : d.expertise));
              else {
                const list = (d.expertise.value.expertise || []).filter((e) => e.state !== "withdrawn");
                p.push(list.length === 0 ? `<p>${W(S + "expertise.none")}</p>` : `<ul class="cs-list">${list.map((e) => `<li>${W(e.confirmed ? S + "expertise.confirmed" : S + "expertise.declared", { label: e.label })}${e.confirmed ? "" : form(cs.act("expertiseconfirm", { subject: m.member_id + "|" + e.label, screen: "members" }))}</li>`).join("")}</ul>`);
              }
            }
            panel = `<tr class="cs-panel" data-panel-of="${E(m.member_id)}"><td colspan="${admin ? 6 : 5}">${p.join("")}</td></tr>`;
          }
          return `<tr data-row="${E(m.member_id)}">${cells}</tr>${panel}`;
        });
        out.push(`<table class="cs-table"><thead><tr><th>${W(S + "col.handle")}</th>${admin ? `<th>${W(S + "col.cover")}</th>` : ""}<th>${W(S + "col.role")}</th><th>${W(S + "col.caps")}</th><th>${W(S + "col.status")}</th><th>${W(S + "col.expertise")}</th></tr></thead><tbody>${rows.join("")}</tbody></table>`);
      }
    }

    // inviting (R2): the short id, the cover and the capabilities ticked; the invitation shown once
    const add = cs.act("memberadd", { subject: "invite", screen: "members" });
    if (add) {
      let shown = "";
      if (ctx.shown && ctx.shown.invite) shown = `<div class="cs-shown" data-shown="invite"><p>${W(S + "invite.shown", { handle: ctx.shown.memberId, expires: cs.dateText(ctx.shown.expires) })}</p><p><code>${E(ctx.shown.link)}</code></p></div>`;
      out.push(sec(S + "invite.heading", `${shown}${form(`<label for="mi-id">${W(S + "invite.id")}</label><span class="help">${W(S + "invite.id.help")}</span><input id="mi-id" name="memberId" type="text" class="cs-input" autocomplete="off">
<label for="mi-cover">${W(S + "invite.cover")}</label><input id="mi-cover" name="cover" type="text" class="cs-input" autocomplete="off">
<fieldset><legend>${W(S + "invite.caps")}</legend>${vocabulary.map((v) => `<label><input type="checkbox" name="capabilities" value="${E(v)}"${v === "contribute" ? " checked" : ""}> ${E(capName(v))}</label>`).join("")}<label><input type="checkbox" name="administer" value="yes"> ${E(capName("administer"))}</label></fieldset>${add}`)}<p class="cs-note">${W(S + "invite.noemail")}</p>`, "members-invite"));
    }

    // joining through the group's website: a website key, or the reusable join link, each shown once
    const wk = cs.act("websitekeycreate", { subject: "website", screen: "members" });
    const jl = cs.act("joinlinkenable", { subject: "join", screen: "members" });
    if (wk || jl) {
      let shown = "";
      if (ctx.shown && ctx.shown.websiteKey) shown += `<div class="cs-shown" data-shown="websitekey"><p>${W(S + "website.keyshown")}</p><p><code>${E(ctx.shown.websiteKey)}</code></p></div>`;
      if (ctx.shown && ctx.shown.joinLink) shown += `<div class="cs-shown" data-shown="joinlink"><p>${W(S + "website.linkshown")}</p><p><code>${E(ctx.shown.joinLink)}</code></p></div>`;
      out.push(sec(S + "website.heading", `<p>${W(S + "website.what")}</p>${shown}${form(`<label for="mw-cap">${W(S + "website.cap")}</label><input id="mw-cap" name="dailyCap" type="text" inputmode="numeric" class="cs-input">
<label for="mw-days">${W(S + "website.days")}</label><input id="mw-days" name="expiresInDays" type="text" inputmode="numeric" class="cs-input">${wk}${jl}`)}`));
    }

    // the group's API key (R2): held and on, never the key; replaced in the body only, then switched on
    let gk = "";
    if (!ok(d.groupkey)) gk = cs.state(d.groupkey.state === "ok" ? { state: "failed", refusal: d.groupkey.value } : d.groupkey);
    else {
      const g = d.groupkey.value;
      gk = `<p data-state="groupkey">${g.held === undefined ? W(g.on ? S + "key.on" : S + "key.off") : !g.held ? W(S + "key.none") : W(g.on ? S + "key.heldon" : S + "key.heldoff", { by: names(g.by), date: cs.dateText(g.set_at) })}</p>`;
      const set = cs.act("groupkeyset", { subject: "key", screen: "members" });
      if (set) gk += form(`<label for="mk-key">${W(g.held ? S + "key.replace" : S + "key.field")}</label><input id="mk-key" name="key" type="password" class="cs-input" autocomplete="off">${set}`);
      if (g.held) gk += form(cs.act("groupkeyswitch", { subject: g.on ? "off" : "on", label: g.on ? S + "key.switchoff" : S + "key.switchon", screen: "members" }) + cs.act("groupkeyremove", { subject: "key", screen: "members" }));
    }
    gk += `<p class="cs-note">${W("ai.whopays")}</p>`;
    out.push(sec(S + "key.heading", gk));

    // the AI account panel over the group's key (R9), for those who may read it
    if (admin) out.push(parts.aiPanel(cs, { owner: "group", screen: "members", uses: d.uses, limits: d.limits, usage: d.usage, history: d.history, explore: true, perMember: true, names }));

    // keeping the group's material away from AI (R2): on only with a reason, saying first what it does
    let ka = "";
    const k = d.keepaway;
    if (!k || k.state !== "ok" || (k.value.on !== true && k.value.on !== false)) ka = k && k.state !== "ok" ? cs.state(k) : `<p data-state="keepaway">${W(S + "keepaway.unread")}</p>`;
    else {
      const v = k.value;
      ka = v.on ? `<p data-state="keepaway">${W(S + "keepaway.on", { by: names(v.set_by), date: cs.dateText(v.set_at) })} <span class="rec">${E(v.reason || "")}</span></p>` : `<p data-state="keepaway">${W(S + "keepaway.off")}</p>`;
      const on = cs.act("aikeepaway", { subject: "on", label: v.on ? S + "keepaway.save" : null, screen: "members" });
      if (on) {
        const USES = ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore"];
        const chosen = v.on && Array.isArray(v.uses) && v.uses.length < USES.length ? v.uses : null;
        ka += form(`<p>${W("act.aikeepaway.does")}</p><fieldset><legend>${W(S + "keepaway.which")}</legend><label><input type="radio" name="scope" value="all"${chosen ? "" : " checked"}> ${W(S + "keepaway.all")}</label><label><input type="radio" name="scope" value="some"${chosen ? " checked" : ""}> ${W(S + "keepaway.some")}</label></fieldset><fieldset><legend>${W(S + "keepaway.uses")}</legend>${USES.map((u) => `<label><input type="checkbox" name="uses" value="${u}"${chosen && chosen.includes(u) ? " checked" : ""}> ${W("ai.use." + u + ".name")}</label>`).join("")}</fieldset><label for="mk-why">${W(S + "keepaway.reason")}</label><textarea id="mk-why" name="reason" class="cs-input" maxlength="2000">${v.on ? E(v.reason || "") : ""}</textarea>${on}`);
        if (v.on) ka += form(cs.act("aikeepaway", { subject: "off", label: S + "keepaway.turnoff", screen: "members" }));
      }
    }
    out.push(sec(S + "keepaway.heading", ka));
    return out.join("");
  },

  acts: [
    { op: "memberadd", rereads: ["roster", "recovery"],
      args(f) {
        const caps = [].concat(f.capabilities || []);
        const body = { memberId: String(f.memberId || "").trim(), cover: String(f.cover || "").trim(), capabilities: caps };
        if ([].concat(f.administer || []).includes("yes")) body.role = "admin";
        return { body };
      },
      after(a, ctx) { return { show: { invite: true, memberId: a.memberId, expires: a.expires, link: (ctx.origin || "") + "/#invite=" + encodeURIComponent(a.invite) } }; } },
    { op: "membercaps", rereads: ["roster"],
      args(f, ctx, d, subject) { return { body: { memberId: subject, capabilities: [].concat(f.capabilities || []) } }; } },
    { op: "memberset", rereads: ["roster", "recovery"],
      args(f, ctx, d, subject) { const [memberId, status] = String(subject).split("="); return { body: { memberId, status } }; } },
    { op: "adminendorse", rereads: ["roster", "recovery"],
      args(f, ctx, d, subject) { return { body: { memberId: subject } }; },
      after(a, ctx) { return a.invite ? { show: { invite: true, memberId: a.memberId, expires: a.expires, link: (ctx.origin || "") + "/#invite=" + encodeURIComponent(a.invite) } } : null; } },
    { op: "adminremove", rereads: ["roster", "recovery"],
      args(f, ctx, d, subject) { const reason = String(f.reason || "").trim(); return reason ? { body: { memberId: subject, reason } } : { hold: "screen.members.remove.noreason" }; } },
    { op: "expertiseconfirm", rereads: ["roster", "expertise"],
      args(f, ctx, d, subject) { const s = String(subject), i = s.indexOf("|"); return { body: { memberId: s.slice(0, i), label: s.slice(i + 1) } }; } },
    { op: "invitewithdraw", rereads: ["roster"],
      args(f, ctx, d, subject) { return { body: { memberId: subject } }; } },
    { op: "websitekeycreate", rereads: [],
      args(f) { const dailyCap = Number(f.dailyCap); if (!(Number.isInteger(dailyCap) && dailyCap >= 1)) return { hold: "screen.members.website.nocap" }; const body = { dailyCap }; if (String(f.expiresInDays || "").trim()) body.expiresInDays = Number(f.expiresInDays); return { body }; },
      after(a) { return { show: { websiteKey: a.key } }; } },
    { op: "joinlinkenable", rereads: [],
      args(f) { const dailyCap = Number(f.dailyCap); if (!(Number.isInteger(dailyCap) && dailyCap >= 1)) return { hold: "screen.members.website.nocap" }; const body = { dailyCap }; if (String(f.expiresInDays || "").trim()) body.expiresInDays = Number(f.expiresInDays); return { body }; },
      after(a, ctx) { return { show: { joinLink: (ctx.origin || "") + "/#join=" + encodeURIComponent(a.link) } }; } },
    { op: "groupkeyset", rereads: ["groupkey", "uses", "history"], clears: ["key"],
      args(f) { const key = String(f.key || "").trim(); return key ? { body: { key } } : { hold: "screen.members.key.nokey" }; },
      // as setup-page R18: the key held, then switched on
      after() { return { then: [{ op: "groupkeyswitch", body: { on: true } }] }; } },
    { op: "groupkeyswitch", rereads: ["groupkey", "history"],
      args(f, ctx, d, subject) { return { body: { on: subject === "on" } }; } },
    { op: "groupkeyremove", rereads: ["groupkey", "uses", "history"],
      args() { return { body: {} }; } },
    { op: "accountusesset", rereads: ["uses", "history"],
      args(f, ctx, d, subject, parts) { return parts.aiPanelArgs("accountusesset", "group", f, subject); },
      refused(cs, r, parts) { return parts.aiPanelRefused(cs, r); } },
    { op: "ailimitset", rereads: ["limits"],
      args(f, ctx, d, subject, parts) { return parts.aiPanelArgs("ailimitset", "group", f, subject); },
      refused(cs, r, parts) { return parts.aiPanelRefused(cs, r); } },
    { op: "aikeepaway", rereads: ["keepaway", "history", "uses"],
      args(f, ctx, d, subject) {
        if (subject === "off") return { body: { on: false } };
        const reason = String(f.reason || "").trim();
        if (reason.length < 1 || reason.length > 2000) return { hold: "screen.members.keepaway.noreason" };
        const body = { on: true, reason };
        if (f.scope === "some") { const uses = [].concat(f.uses || []); if (!uses.length) return { hold: "screen.members.keepaway.nouses" }; body.uses = uses; }
        return { body };
      } },
  ],
};

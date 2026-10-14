/* screens-entry R7 (and R8–R11): `join`, "Your invitation", in the setup frame at `/app/join` (the shell forwards
   `/#invite=` and `/#join=` here and hands the fragment as `view.fragment`, taken from the address on load). An
   invitation is read with `invitelook`; a join link first asks the name the group will know the person by and sends
   `joinlinkinvite`. A dead link draws "This link no longer works" and no form. Then the language among the group's
   (`grouplanguages`), the handle checked as it is typed (`handlecheck`; fixed for good, DEC-197), the password twice;
   `enroll`, `login` on an own device, `memberlanguageset` and `recoverycodesissue`, the codes shown once; then Home, the welcome
   wizard's join steps counted (screens-wizards R7). The invitation, the link and the password travel only in request bodies (R8). Self-contained (interface-shell R21). */

export const join = {
  id: "join",

  reads(view) {
    const f = view.fragment || {};
    const ui = view.ui || {};
    const invite = ui.invite || (typeof f.invite === "string" && f.invite ? f.invite : "");
    const r = { identity: { op: "groupidentity" }, languages: { op: "grouplanguages" } };
    if (invite) r.look = { op: "invitelook", body: { invite } };
    return r;
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.join.";
    const ui = view.ui || {};
    const data = view.data || {};
    const f = view.fragment || {};
    const ok = (r) => (r && r.state === "ok" ? r.value : null);
    const id = ok(data.identity) || {};
    const group = id.display_name || id.group || W("screen.entry.group");
    const invite = ui.invite || (typeof f.invite === "string" && f.invite ? f.invite : "");
    const link = typeof f.join === "string" && f.join ? f.join : "";
    const member = `<p class="cs-small">${W(S + "member")} <a href="/app/front" data-nav>${W(S + "member.go")}</a></p>`;
    const dead = (code) => `<h1 class="t-title">${W(S + "dead")}</h1><p class="cs-row" data-state="dead">${code === "JOIN_LINK_DAILY_CAP" ? W("refusal.JOIN_LINK_DAILY_CAP") : W(S + "dead.what")}</p>` + member;

    // joined: the codes shown once, then Home
    if (ui.joined) {
      return cs.title() + `<p class="cs-row" data-state="joined">${W(ui.joined.signed ? S + "joined" : S + "joined.nosignin", { handle: ui.joined.handle })}</p>`
        + (ui.codes ? cs.sec("screen.entry.codes.heading", `<p>${W("screen.entry.codes.what")}</p><pre class="cs-codes" aria-label="${W("screen.entry.codes.list")}">${ui.codes.map(E).join("\n")}</pre>`)
          : ui.joined.signed ? `<p class="cs-row">${W("screen.entry.codes.none")}</p>` : "")
        + `<p><a class="cs-btn" data-tone="primary" href="${ui.joined.signed ? "/app" : "/app/front"}" data-nav>${W(ui.joined.signed ? S + "home" : "screen.entry.signin")}</a></p>`;
    }
    if (ui.dead) return dead(ui.dead);
    // the join link: first the name the group will know the person by
    if (!invite && link) {
      return `<h1 class="t-title">${W(S + "link", { group })}</h1><p class="cs-sub">${W(S + "link.what")}</p>`
        + cs.field("jn-cover", S + "cover", { help: S + "cover.help", autocomplete: "off" })
        + `<div class="cs-actrow">${cs.act("joinlinkinvite", { tone: "primary" })}</div>` + member;
    }
    if (!invite) return dead(null);
    const look = data.look;
    // a dead invitation draws no form (one sentence for every dead arm)
    if (look && look.state === "failed" && look.refusal && /^NO_SUCH_/.test(String(look.refusal.code || ""))) return dead(null);
    return cs.state(look, (v) => {
      const langs = ok(data.languages);
      const tags = langs && Array.isArray(langs.languages) ? langs.languages : Array.isArray(langs) ? langs : [];
      const check = ui.check;
      const said = !check ? "" : check.state === "free" ? W("handle.free", { handle: check.handle, group })
        : check.state === "taken" ? W("handle.taken", { handle: check.handle, group, suggestion: check.suggestion || "" })
          : check.state === "not_allowed" ? W("handle.characters") : check.paused ? W("handle.refused.paused", { minutes: String(check.minutes || 1) }) : "";
      return `<h1 class="t-title">${W(S + "invited", { group })}</h1>` + (v.cover ? `<p class="cs-sub">${W(S + "invited.as", { cover: v.cover })}</p>` : "")
        + (tags.length ? `<div class="cs-field"><label for="jn-lang">${W(S + "language")}</label><span class="help" id="jn-lang-help">${W(S + "language.help")}</span><select id="jn-lang" class="cs-input" aria-describedby="jn-lang-help">`
          + tags.map((t) => `<option value="${E(t)}">${E(t)}</option>`).join("") + `</select></div>` : "")
        + cs.field("jn-handle", S + "handle", { help: S + "handle.help", autocomplete: "username" })
        + `<p class="cs-small">${W("handle.fixed")}</p>`
        + `<div class="cs-actrow">${cs.act("handlecheck", { tone: "quiet" })}</div>`
        + (said ? `<p class="cs-due" data-due="${check.state === "free" ? "met" : "near"}" role="status">${said}</p>` : "")
        + cs.field("jn-pw", "screen.entry.password", { type: "password", help: "screen.entry.twelve", autocomplete: "new-password" })
        + cs.field("jn-pw2", "screen.entry.again", { type: "password", autocomplete: "new-password" })
        + `<div class="cs-actrow">${cs.act("enroll", { tone: "primary" })}${cs.act("invitelook", { tone: "quiet" })}</div>`
        + `<p class="cs-small">${W(S + "codes.after")}</p>` + member;
    });
  },

  // the handle checked as it is typed (R7): every 600 ms while the field holds a handle not yet checked
  closed(cs, view) { if (view.ui) { delete view.ui.pending; view.ui.watching = false; } },

  acts: [
    { op: "joinlinkinvite", rereads: ["look"],
      send(view, el, cs) {
        const f = view.fragment || {};
        const cover = String(cs.value("jn-cover") || "").trim();
        if (!cover) return { refuse: "screen.join.cover.empty" };
        return typeof f.join === "string" && f.join ? { body: { link: f.join, cover } } : null;
      },
      done(view, answer) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (a && a.invite) view.ui.invite = a.invite;
      },
      // a dead link draws no form: one sentence for NO_SUCH_JOIN_LINK, the daily cap by its own words
      refusals: {
        NO_SUCH_JOIN_LINK: (r, cs) => { cs.set("dead", "NO_SUCH_JOIN_LINK"); return ""; },
        NO_SUCH_INVITATION: (r, cs) => { cs.set("dead", "NO_SUCH_INVITATION"); return ""; },
        JOIN_LINK_DAILY_CAP: (r, cs) => { cs.set("dead", "JOIN_LINK_DAILY_CAP"); return ""; },
      } },
    { op: "invitelook", rereads: ["look"],
      send(view) {
        const f = view.fragment || {};
        const invite = (view.ui && view.ui.invite) || f.invite;
        return invite ? { body: { invite } } : null;
      } },
    { op: "handlecheck", rereads: [],
      send(view, el, cs) {
        const f = view.fragment || {};
        const invite = (view.ui && view.ui.invite) || f.invite;
        const handle = String(cs.value("jn-handle") || "").trim().toLowerCase();
        if (!handle) return { refuse: "screen.join.handle.empty" };
        view.ui.checked = handle;
        // from here on the field is watched as it is typed
        if (!view.ui.watching) {
          view.ui.watching = true;
          const watch = (c, v) => {
            if (!v.ui.watching || v.ui.joined || v.ui.dead) return;
            const h = String(c.value("jn-handle") || "").trim().toLowerCase();
            if (h && h !== v.ui.checked) {
              v.ui.checked = h;
              c.call("handlecheck", { body: { invite: v.ui.invite || (v.fragment || {}).invite, handle: h } }).then((x) => {
                const a = x && x.result !== undefined ? x.result : x;
                if (a && a.ok !== false) c.set("check", { handle: a.handle || h, state: a.state, suggestion: a.suggestion || null });
                else if (a && a.code === "HANDLE_CHECK_PAUSED") c.set("check", { handle: h, paused: true, minutes: Math.max(1, Math.ceil((Number(a.retryAfter) || 60) / 60)) });
              });
            }
            c.later(600, watch);
          };
          cs.later(600, watch);
        }
        return { body: { invite, handle } };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (a) cs.set("check", { handle: a.handle || view.ui.checked, state: a.state, suggestion: a.suggestion || null });
        return { stay: true };
      },
      refusals: { HANDLE_CHECK_PAUSED: (r, cs) => cs.w("handle.refused.paused", { minutes: String(Math.max(1, Math.ceil((Number(r && r.retryAfter) || 60) / 60))) }) } },
    // R7, R8: the invitation, the handle and the password in the body only, the password typed twice alike
    { op: "enroll", rereads: [],
      send(view, el, cs) {
        const f = view.fragment || {};
        const invite = (view.ui && view.ui.invite) || f.invite;
        const handle = String(cs.value("jn-handle") || "").trim().toLowerCase();
        const password = String(cs.value("jn-pw") || "");
        if (!handle) return { refuse: "screen.join.handle.empty" };
        if (password !== String(cs.value("jn-pw2") || "")) return { refuse: "screen.entry.differ" };
        if (password.length < 12) return { refuse: "screen.entry.short" };
        // held in the page's memory only until the sign-in below
        view.ui.pending = { password, language: cs.value("jn-lang") || null };
        return invite ? { body: { invite, handle, password } } : null;
      },
      // then `login` (device own), the member's language, and the codes shown once
      async done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        const p = view.ui.pending || {};
        delete view.ui.pending;
        view.ui.watching = false;
        const handle = (a && (a.handle || a.memberId)) || String(cs.value("jn-handle") || "").trim().toLowerCase();
        const l = await cs.call("login", { body: { handle, password: p.password, device: "own" } });
        const login = l && l.result !== undefined ? l.result : l;
        if (!(login && login.ok !== false && login.token)) { cs.set("joined", { handle, signed: false }); return { stay: true }; }
        await cs.signin(login, { device: "own", handle, stay: true });
        await cs.call("memberlanguageset", { body: { language: p.language || null } });
        const c = await cs.call("recoverycodesissue", { body: {} });
        const codes = c && c.result !== undefined ? c.result : c;
        if (codes && Array.isArray(codes.codes) && codes.codes.length) view.ui.codes = codes.codes.map(String);
        // the welcome wizard's two join steps counted done, once, now the session exists (screens-wizards R7; K3143)
        if (!view.ui.welcomed) { view.ui.welcomed = true; cs.wizard("WIZ-7db08189cc0e58c3", null, { joined: true }); }
        cs.set("joined", { handle, signed: true });
        return { stay: true };
      },
      refusals: {
        NO_SUCH_INVITATION: (r, cs) => { cs.set("dead", "NO_SUCH_INVITATION"); return ""; },
        HANDLE_TAKEN: "screen.join.handle.taken",
        BAD_HANDLE: "handle.characters",
        PASSWORD_TOO_SHORT: "refusal.PASSWORD_TOO_SHORT",
      } },
  ],
};

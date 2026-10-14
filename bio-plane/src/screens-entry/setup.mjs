/* screens-entry R6 (and R8–R11): `setup`, "Become your group's first administrator", in the setup frame at
   `/app/setup` (the shell forwards `/#boot=` here and hands the one-time password as `view.fragment.boot`, taken from
   the address on load). The claim: the one-time password, the founder's password twice (12 or more), `claim`, then
   `login` as `admin` on an own device and `recoverycodesissue`, the ten codes shown once. Then each part is the
   registry's act for it, every part skippable and resumable from what the reads answer: name and website, places,
   offices, the assistant, the court notice, the hosting account (beside `HOSTING_CONTROL`'s words), a second
   administrator, security tools; "Finished" links `/app`. A refused part keeps the step and sends nothing more (the
   shell draws the refusal beside its act and keeps what was typed). Self-contained (interface-shell R21). */

export const setup = {
  id: "setup",

  reads(view) {
    const signed = !!(view.me && view.me.session);
    if (!signed) return { boot: { op: "bootstrap" } };
    return {
      boot: { op: "bootstrap" },
      identity: { op: "groupidentity" },
      profiles: { op: "profiles" },
      place: { op: "placewantedstate" },
      keepaway: { op: "aikeepawaystate" },
      groupkey: { op: "groupkeystate" },
      court: { op: "courtnotice" },
      hosting: { op: "hostingaccess" },
      catalogue: { op: "securitytoolcatalogue" },
      tools: { op: "securitytools", empty: (v) => !(v && Array.isArray(v.tools) && v.tools.length) },
    };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.setup.";
    const ui = view.ui || {};
    const data = view.data || {};
    const ok = (r) => (r && r.state === "ok" ? r.value : null);
    const signed = !!(view.me && view.me.session);
    const boot = ok(data.boot) || {};
    const fragment = view.fragment || {};
    const hosting = () => {
      const p = [];
      for (let i = 1; i < 20; i++) { const k = "screen.hosting.s" + i; const t = W(k); if (t === k) break; p.push(`<p>${t}</p>`); }
      return `<div class="cs-note" id="hosting-control"><p><b>${W("screen.hosting.heading")}</b></p>${p.join("")}<p>${W("screen.hosting.guide")}</p></div>`;
    };
    const codes = () => (ui.codes
      ? cs.sec("screen.entry.codes.heading", `<p>${W("screen.entry.codes.what")}</p><pre class="cs-codes" aria-label="${W("screen.entry.codes.list")}">${ui.codes.map(E).join("\n")}</pre>`)
      : ui.nocodes ? `<p class="cs-row">${W("screen.entry.codes.none")}</p>` : "");
    const out = [cs.title(), `<p class="cs-sub">${W(S + "lede")}</p>`];

    // ---- the claim (R6): before a session exists ----
    if (!signed) {
      if (ui.claimed) {
        out.push(`<p class="cs-row" data-state="claimed">${W(S + "claimed.nosignin")}</p><p><a class="cs-btn" data-tone="primary" href="/app/front" data-nav>${W("screen.entry.signin")}</a></p>`);
        return out.join("");
      }
      out.push(cs.state(data.boot, (b) => {
        if (b.claimed === true) return `<p class="cs-row" data-state="taken">${W(S + "taken")}</p><p><a class="cs-btn" href="/app/front" data-nav>${W("screen.entry.backtofront")}</a></p>`;
        if (b.bootstrapConfigured === false) return `<p class="cs-row" data-state="unarmed">${W(S + "unarmed")}</p>`;
        return cs.sec(S + "claim", hosting()
          + cs.field("su-otp", S + "otp", { help: S + "otp.help", autocomplete: "off", value: typeof fragment.boot === "string" ? fragment.boot : "" })
          + cs.field("su-pw", S + "own", { type: "password", help: S + "own.help", autocomplete: "new-password" })
          + cs.field("su-pw2", "screen.entry.again", { type: "password", help: S + "again.help", autocomplete: "new-password" })
          + `<div class="cs-actrow">${cs.act("claim", { tone: "primary" })}</div>`);
      }));
      return out.join("");
    }

    // ---- signed in: the codes, then every part ----
    const profiles = ok(data.profiles) || {};
    const active = Array.isArray(profiles.profiles) ? profiles.profiles : [];
    const id = ok(data.identity) || {};
    const keep = ok(data.keepaway) || {};
    const gk = ok(data.groupkey) || {};
    const court = ok(data.court) || {};
    const host = ok(data.hosting) || {};
    const tools = ok(data.tools) && Array.isArray(data.tools.value.tools) ? data.tools.value.tools : [];
    const steps = [
      ["claim", true], ["name", !!id.display_name], ["places", active.length > 0 || !!(ok(data.place) || {}).name],
      ["offices", !!ui.offices], ["assistant", keep.on === true || gk.held === true], ["court", court.choice === "tell" || court.choice === "dont"],
      ["hosting", !!host.current], ["admins", !!ui.invite], ["security", tools.length > 0],
    ];
    out.push(`<p class="cs-row" data-state="claimed">${W(S + "claimed")}</p>`);
    out.push(`<nav aria-label="${W(S + "steps")}"><ol class="cs-steps">${steps.map(([k, done]) => `<li${done ? ' class="done"' : ""}>${W(S + "step." + k)}${done ? ` <span class="cs-small">${W(S + "step.done")}</span>` : ""}</li>`).join("")}</ol></nav>`);
    out.push(codes() || cs.sec("screen.entry.codes.heading", `<p>${W("screen.entry.codes.what")}</p><div class="cs-actrow">${cs.act("recoverycodesissue")}</div>`));

    // name and website
    out.push(cs.sec(S + "name", (id.display_name ? `<p>${W(S + "name.now", { name: id.display_name })}</p>` : "")
      + cs.field("su-name", S + "name.field", { help: S + "name.help", value: id.display_name || "" })
      + `<div class="cs-actrow">${cs.act("groupnameset")}</div>`
      + (id.domain && id.domain_verified_at ? `<p>${W(S + "domain.verified", { domain: id.domain })}</p>` : "")
      + cs.field("su-domain", S + "domain", { help: S + "domain.help", value: id.domain || "" })
      + `<div class="cs-actrow">${cs.act("groupdomainset")}</div>`));

    // places and languages
    out.push(cs.sec(S + "places", cs.state(data.profiles, (p) => {
      const choices = Array.isArray(p.choices) ? p.choices : [];
      const on = new Set(active.map((x) => x.id));
      const list = [...active, ...choices.filter((c) => !on.has(c.id))];
      return `<p>${active.length ? W(S + "places.now") : W(S + "places.none")}</p>`
        + (active.length ? `<ul class="cs-list">${active.map((x) => `<li>${E(x.name || x.id)}</li>`).join("")}</ul>` : "")
        + (list.length ? `<fieldset class="cs-field" id="su-pf"><legend>${W(S + "places.choose")}</legend><span class="help" id="su-pf-help">${W(S + "places.help")}</span>`
          + list.map((x, i) => `<label><input type="checkbox" id="su-pf-${i}" value="${E(x.id)}"${on.has(x.id) ? " checked" : ""}> ${E(x.name || x.id)}</label>`).join("")
          + `</fieldset><div class="cs-actrow">${cs.act("profilesset", { data: { ids: list.map((x) => x.id).join(" ") } })}</div>` : "");
    }) + ((ok(data.place) || {}).name ? `<p>${W(S + "place.wanted.now", { name: data.place.value.name })}</p>` : "")
      + cs.field("su-place", S + "place.wanted", { help: S + "place.wanted.help" })
      + `<div class="cs-actrow">${cs.act("placewanted")}</div>`));

    // offices and seats
    out.push(cs.sec(S + "offices", `<p>${W(S + "offices.what")}</p><div class="cs-actrow">${cs.act("officesseed")}</div>`
      + (ui.office ? `<p>${W(S + "office.added", { label: ui.office })}</p>` : "")
      + cs.field("su-office", S + "office.field") + cs.field("su-office-note", S + "office.note")
      + `<div class="cs-actrow">${cs.act("entitycreate")}</div>`));

    // the assistant: keeping the material away from AI (with its reason), the group's key, its switch, the daily limit
    out.push(cs.sec(S + "assistant", `<p>${W(S + "assistant.what")}</p><p>${W(S + "assistant.own")}</p><p>${W(S + "assistant.paid")}</p>`
      + (keep.on === true ? `<p data-state="keepaway">${W(S + "keepaway.on")} <span class="rec">${E(keep.reason || "")}</span></p>` : "")
      + `<p>${W(S + "keepaway")}</p>`
      + cs.field("su-why", S + "keepaway.why", { area: true, rec: true, help: S + "keepaway.help" })
      + `<div class="cs-actrow">${cs.act("aikeepaway", { data: { on: keep.on === true ? "off" : "on" } })}</div>`
      + (gk.held === true ? `<p data-state="groupkey">${W(S + "key.held", { state: { html: W(gk.on ? S + "key.on" : S + "key.off") } })}</p>` : "")
      + cs.field("su-key" + (ui.keyGen || 0), S + "key", { type: "password", help: S + "key.help", autocomplete: "off" })
      + `<div class="cs-actrow">${cs.act("groupkeyset")}${gk.held === true ? cs.act("groupkeyswitch", { label: gk.on ? S + "key.switchoff" : S + "key.switchon", data: { on: gk.on ? "off" : "on" } }) : ""}</div>`
      + (ui.limit ? `<p>${W(S + "limit.set")}</p>` : "")
      + cs.field("su-limit", S + "limit", { help: S + "limit.help" })
      + `<div class="cs-actrow">${cs.act("ailimitset")}</div>`));

    // what a court can reach
    out.push(cs.sec(S + "court", `<p>${W(S + "court.what")}</p>`
      + (court.choice === "tell" || court.choice === "dont" ? `<p>${W(S + "court.now." + court.choice)}</p>` : "")
      + cs.checks("su-court", S + "court.legend", [["tell", S + "court.tell", court.choice === "tell"], ["dont", S + "court.dont", court.choice === "dont"]], { radio: true })
      + `<div class="cs-actrow">${cs.act("courtnoticeset")}</div>`));

    // the hosting account, beside HOSTING_CONTROL's words
    out.push(cs.sec(S + "hosting", hosting()
      + (host.current ? `<p>${W(S + "hosting.now", { holders: String(host.current.holders || "") })}</p>` : "")
      + cs.field("su-holders", S + "hosting.field") + cs.field("su-hnote", S + "hosting.note")
      + `<div class="cs-actrow">${cs.act("hostingaccessset")}</div>`));

    // a second administrator: the invitation shown once
    out.push(cs.sec(S + "admins", `<p>${W(S + "admins.what")}</p>`
      + (ui.invite ? `<div class="cs-shown" data-shown="invite"><p>${W(S + "admins.shown", { date: { html: cs.date(ui.invite.expires) } })}</p><p><code>${E(ui.invite.link)}</code></p></div>` : "")
      + cs.field("su-adm-id", S + "admins.id", { help: S + "admins.id.help", autocomplete: "off" })
      + cs.field("su-adm-cover", S + "admins.cover", { autocomplete: "off" })
      + `<div class="cs-actrow">${cs.act("memberadd")}</div>`));

    // security tools: each offered tool with the fields its entry names; the scanner's sentence only while one runs
    out.push(cs.sec(S + "security", (boot.part_scanner === true ? `<p>${W(S + "security.scanner")}</p>` : "") + `<p>${W(S + "security.what")}</p>`
      + (ui.tool ? `<p data-state="tool">${W(ui.tool.passed ? S + "security.passed" : S + "security.failed", { tool: ui.tool.name })}</p>` : "")
      + tools.map((t) => `<p>${W(S + "security.held", { tool: t.name || t.label || t.provider_id || t.tool_id || "" })}</p>`).join("")
      + cs.state(data.catalogue, (c) => (Array.isArray(c.offered) ? c.offered : []).map((t, i) => {
        const name = t.name || t.label || t.provider_id || "";
        const cfg = Array.isArray(t.config) ? t.config : [];
        const creds = Array.isArray(t.credentials) ? t.credentials : [];
        return `<fieldset class="cs-field" id="su-st-${i}"><legend>${E(name)}</legend>`
          + cfg.map((f, k) => `<label for="su-st-${i}-cfg-${k}">${E(f.label || f.name)}</label><input id="su-st-${i}-cfg-${k}" type="text" class="cs-input">`).join("")
          + creds.map((n, k) => `<label for="su-st-${i}-cred-${k}">${E(n)}</label><input id="su-st-${i}-cred-${k}" type="password" class="cs-input" autocomplete="off">`).join("")
          + `<label><input type="checkbox" id="su-st-${i}-keep"> ${W(S + "security.keep")}</label>`
          + cs.act("securitytooladd", { data: { tool: String(i) } }) + "</fieldset>";
      }).join(""), { empty: "state.empty" })));

    out.push(cs.sec(S + "finished", `<p>${W(S + "finished.what")}</p><p><a class="cs-btn" data-tone="primary" href="/app" data-nav>${W(S + "finished.go")}</a></p>`));
    return out.join("");
  },

  // R8: a password held for the claim's sign-in leaves the page's memory when the founder leaves the screen
  closed(cs, view) { if (view.ui) delete view.ui.pending; },

  acts: [
    // R6, R8: the one-time password and the founder's password in the body only, the password typed twice alike
    { op: "claim",
      send(view, el, cs) {
        const bootstrapToken = String(cs.value("su-otp") || "").trim();
        const password = String(cs.value("su-pw") || "");
        if (!bootstrapToken) return { refuse: "screen.setup.nootp" };
        if (password !== String(cs.value("su-pw2") || "")) return { refuse: "screen.entry.differ" };
        if (password.length < 12) return { refuse: "screen.entry.short" };
        // held in the page's memory only until the sign-in below, never drawn, stored or put in an address
        view.ui.pending = password;
        return { body: { bootstrapToken, password } };
      },
      // then `login` as `admin` on an own device, the session handed to the shell, and the ten codes shown once
      async done(view, answer, cs) {
        const password = view.ui.pending;
        delete view.ui.pending;
        const l = await cs.call("login", { body: { handle: "admin", password, device: "own" } });
        const login = l && l.result !== undefined ? l.result : l;
        if (!(login && login.ok !== false && login.token)) { cs.set("claimed", true); return { stay: true }; }
        await cs.signin(login, { device: "own", handle: "admin", stay: true });
        const c = await cs.call("recoverycodesissue", { body: {} });
        const codes = c && c.result !== undefined ? c.result : c;
        if (codes && Array.isArray(codes.codes) && codes.codes.length) view.ui.codes = codes.codes.map(String); else view.ui.nocodes = true;
      },
      refusals: { ALREADY_CLAIMED: "screen.setup.taken" } },
    { op: "recoverycodesissue", rereads: [],
      send() { return { body: {} }; },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (a && Array.isArray(a.codes) && a.codes.length) cs.set("codes", a.codes.map(String)); else cs.set("nocodes", true);
        return { stay: true };
      } },
    { op: "groupnameset", rereads: ["identity"],
      send(view, el, cs) { const name = String(cs.value("su-name") || "").trim(); return name ? { body: { name } } : { refuse: "screen.setup.name.empty" }; } },
    { op: "groupdomainset", rereads: ["identity"],
      send(view, el, cs) { const domain = String(cs.value("su-domain") || "").trim(); return domain ? { body: { domain } } : { refuse: "screen.setup.domain.empty" }; } },
    // the places ticked, in the order drawn (the active ones first)
    { op: "profilesset", rereads: ["profiles"],
      send(view, el, cs) {
        const ids = String(el.dataset.ids || "").split(" ").filter((x) => x);
        return { body: { profiles: ids.filter((x, i) => cs.value("su-pf-" + i) === true) } };
      } },
    { op: "placewanted", rereads: ["place"],
      send(view, el, cs) { const name = String(cs.value("su-place") || "").trim(); return name ? { body: { name } } : { refuse: "screen.setup.place.empty" }; } },
    { op: "officesseed", rereads: [],
      send() { return { body: {} }; },
      done(view, answer, cs) { cs.set("offices", true); return { stay: true }; } },
    { op: "entitycreate", rereads: [],
      send(view, el, cs) {
        const label = String(cs.value("su-office") || "").trim();
        const note = String(cs.value("su-office-note") || "").trim();
        return label ? { body: { kind: "office", label, note: note || null } } : { refuse: "screen.setup.office.empty" };
      },
      done(view, answer, cs) { cs.set("office", String(cs.value("su-office") || "").trim()); return { stay: true }; } },
    // on only with a reason in the founder's own words, its field the act's reason (interface-shell R11)
    { op: "aikeepaway", rereads: ["keepaway"], reasonField: "reason",
      send(view, el, cs) {
        const reason = String(cs.value("su-why") || "").trim();
        if (reason.length < 1 || reason.length > 2000) return { refuse: "screen.setup.keepaway.noreason" };
        return { body: { on: el.dataset.on !== "off", reason } };
      } },
    // the key in the request's body only, never drawn again (the field drawn anew, empty)
    { op: "groupkeyset", rereads: ["groupkey"],
      send(view, el, cs) { const key = String(cs.value("su-key" + ((view.ui && view.ui.keyGen) || 0)) || "").trim(); return key ? { body: { key } } : { refuse: "screen.setup.key.nokey" }; },
      done(view, answer, cs) { view.ui.keyGen = ((view.ui && view.ui.keyGen) || 0) + 1; } },
    { op: "groupkeyswitch", rereads: ["groupkey"],
      send(view, el) { return { body: { on: el.dataset.on === "on" } }; } },
    // each member's daily use of the group's key, in dollars (ai-use R2: owner group, per member, a day)
    { op: "ailimitset", rereads: [],
      send(view, el, cs) {
        const amount = Number(String(cs.value("su-limit") || "").replace(/[,\s$]/g, ""));
        if (!(amount > 0)) return { refuse: "screen.setup.limit.bad" };
        return { body: { owner: "group", scope: "per_member", unit: "usd", period: "day", amount } };
      },
      done(view, answer, cs) { cs.set("limit", true); return { stay: true }; } },
    { op: "courtnoticeset", rereads: ["court"],
      send(view, el, cs) {
        const choice = cs.value("su-court-0") === true ? "tell" : cs.value("su-court-1") === true ? "dont" : null;
        return choice ? { body: { choice } } : { refuse: "screen.setup.court.pick" };
      } },
    { op: "hostingaccessset", rereads: ["hosting"],
      send(view, el, cs) {
        const holders = String(cs.value("su-holders") || "").trim();
        const note = String(cs.value("su-hnote") || "").trim();
        return holders ? { body: { holders, note: note || null } } : { refuse: "screen.setup.hosting.empty" };
      } },
    // a second administrator (membership R13: role admin); the invitation shown once, here only
    { op: "memberadd", rereads: [],
      send(view, el, cs) {
        const memberId = String(cs.value("su-adm-id") || "").trim(), cover = String(cs.value("su-adm-cover") || "").trim();
        return memberId && cover ? { body: { memberId, cover, role: "admin" } } : { refuse: "screen.setup.admins.incomplete" };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (a && a.invite) cs.set("invite", { expires: a.expires, link: (view.origin || "") + "/#invite=" + encodeURIComponent(a.invite) });
        return { stay: true };
      } },
    // a tool added with the fields its entry names, then tested (file-safety R28, R29), as setup-page R30 did
    { op: "securitytooladd", rereads: ["tools"],
      send(view, el, cs) {
        const c = (view.data || {}).catalogue;
        const t = c && c.value && Array.isArray(c.value.offered) ? c.value.offered[Number(el.dataset.tool)] : null;
        if (!t) return { refuse: "screen.setup.security.nopick" };
        const i = el.dataset.tool;
        const config = {};
        const cfg = Array.isArray(t.config) ? t.config : [];
        for (let k = 0; k < cfg.length; k++) {
          const v = String(cs.value("su-st-" + i + "-cfg-" + k) || "").trim();
          if (v) config[cfg[k].name] = v;
          else if (cfg[k].required) return { refuse: "screen.setup.security.missing", fills: { field: cfg[k].label || cfg[k].name } };
        }
        const credentials = {};
        const names = Array.isArray(t.credentials) ? t.credentials : [];
        for (let k = 0; k < names.length; k++) {
          const v = String(cs.value("su-st-" + i + "-cred-" + k) || "").trim();
          if (!v) return { refuse: "screen.setup.security.missing", fills: { field: names[k] } };
          credentials[names[k]] = v;
        }
        view.ui.toolName = t.name || t.label || t.provider_id || "";
        return { body: { providerId: t.provider_id, config, credentials, handlingDigest: t.handling_digest, confirmRetention: cs.value("su-st-" + i + "-keep") === true, use: "on_request" } };
      },
      async done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        const name = view.ui.toolName || "";
        delete view.ui.toolName;
        const r = a && a.tool_id ? await cs.call("securitytooltest", { body: { toolId: a.tool_id } }) : null;
        const res = r && r.result !== undefined ? r.result : r;
        view.ui.tool = { name, passed: !!(res && res.passed === true) };
      } },
  ],
};

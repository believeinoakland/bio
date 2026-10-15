/* screens-entry R6 (and R8–R11, R14–R20): `setup`, "Become your group's first administrator", in the setup frame at
   `/app/setup` (the shell forwards `/#boot=` here and hands the one-time password as `view.fragment.boot`, taken from
   the address on load). The claim (R6, R17): the one-time password, the handle the founder chooses, her password twice
   (12 or more), `claim` with the handle, then `login` by the handle the claim answers (never `admin`) on an own device
   and `recoverycodesissue`, the ten codes shown once (R20). Then each part is the registry's act for it, every part
   skippable and resumable from what the reads answer: name and website, places, offices, the assistant, the court
   notice, the hosting account (beside `HOSTING_CONTROL`'s words), a second administrator, security tools; "Finished"
   links `/app`. A refused part keeps the step and sends nothing more (the shell draws the refusal beside its act and
   keeps what was typed). R18: a founder signed in with no handle held (`whoami`: `rootOfTrust`, `handle: null`) is
   asked it once (`founderhandleset`), or "Later". R19: anyone else signed in sees only that the group is set up, and
   Home. R20: an instance already claimed draws state c, "Already claimed". Self-contained (interface-shell R21). */

export const setup = {
  id: "setup",

  reads(view) {
    const me = view.me || {};
    if (!me.session) return { boot: { op: "bootstrap" } };
    // R19: a reader who is not the founder reads nothing here; R18: nor does a founder still choosing her handle
    if (me.rootOfTrust !== true || !me.handle) return {};
    return {
      boot: { op: "bootstrap" },
      identity: { op: "groupidentity" },
      // R19: "Show my recovery codes" only before the founder has seen hers
      codes: { op: "recoverycodesstate" },
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
    const me = view.me || {};
    const signed = !!me.session;
    const boot = ok(data.boot) || {};
    const fragment = view.fragment || {};
    const home = (key) => `<div class="mk-acts"><a class="cs-btn" data-tone="primary" href="/app" data-nav>${W(key)}</a></div>`;
    const hosting = () => {
      const p = [];
      for (let i = 1; i < 20; i++) { const k = "screen.hosting.s" + i; const t = W(k); if (t === k) break; p.push(`<p>${t}</p>`); }
      return `<div class="mk-note" id="hosting-control"><p><b>${W("screen.hosting.heading")}</b></p>${p.join("")}<p>${W("screen.hosting.guide")}</p></div>`;
    };
    // R20: the ten codes shown once, with "Copy them" and "Save them as a file"
    const codes = () => (ui.codes
      ? cs.sec("screen.entry.codes.heading", `<p class="mk-note">${W("setup.codes.once")}</p><p class="mk-note">${W("screen.entry.codes.what")}</p><pre data-codes aria-label="${W("screen.entry.codes.list")}">${ui.codes.map(E).join("\n")}</pre><div class="mk-acts">${String(cs.copy(ui.codes.join("\n"), { label: "setup.codes.copy" }) || "")}${String(cs.save("recovery-codes.txt", ui.codes.join("\n") + "\n", { label: "setup.codes.save" }) || "")}</div>`)
      : ui.nocodes ? `<p class="cs-row">${W("screen.entry.codes.none")}</p>` : "");
    // R20 state c: an instance already claimed
    const taken = () => cs.sec("setup.claimed.heading", `<p class="mk-sub">${W("setup.claimed.sub")}</p><p class="cs-row" data-state="taken">${W("refusal.ALREADY_CLAIMED")}</p>`
      + `<div class="mk-acts"><a class="cs-btn" data-tone="primary" href="/app/front" data-nav>${W("screen.entry.signin")}</a></div>`);
    const out = [cs.title()];
    // R15: the lede ("Claim what you just installed…") follows the claimed state: drawn only while the instance answers
    // that it is not yet claimed and no one here has claimed it
    const unclaimed = !signed && !ui.claimed && !ui.taken && !!ok(data.boot) && boot.claimed !== true;
    if (unclaimed) out.push(`<p class="mk-sub" data-lede>${W(S + "lede")}</p>`);

    // ---- the claim (R6, R17): before a session exists ----
    if (!signed) {
      if (ui.taken) return out.concat(taken()).join("");
      if (ui.claimed) {
        out.push(`<p class="cs-row" data-state="claimed">${W(S + "claimed.nosignin")}</p><div class="mk-acts"><a class="cs-btn" data-tone="primary" href="/app/front" data-nav>${W("screen.entry.signin")}</a></div>`);
        return out.join("");
      }
      out.push(cs.state(data.boot, (b) => {
        if (b.claimed === true) return taken();
        if (b.bootstrapConfigured === false) return `<p class="cs-row" data-state="unarmed">${W(S + "unarmed")}</p>`;
        return cs.sec(S + "claim", hosting()
          + cs.field("su-otp", S + "otp", { help: S + "otp.help", autocomplete: "off", value: typeof fragment.boot === "string" ? fragment.boot : "" })
          // R17: the handle she chooses, between the one-time password and her own password
          + cs.field("su-handle", S + "handle", { help: S + "handle.help", autocomplete: "username" })
          + cs.field("su-pw", S + "own", { type: "password", help: S + "own.help", autocomplete: "new-password" })
          + cs.field("su-pw2", "screen.entry.again", { type: "password", help: S + "again.help", autocomplete: "new-password" })
          + `<div class="mk-acts">${cs.act("claim", { tone: "primary" })}</div>`);
      }));
      return out.join("");
    }

    // ---- R19: a member, or an administrator who is not the founder: their own state, no founder words ----
    if (me.rootOfTrust !== true) {
      out.push(cs.sec("setup.member.heading", `<p class="mk-sub">${W("setup.member.sub")}</p>` + home("setup.member.home")));
      return out.join("");
    }

    // ---- R18: the founder of a group claimed before T49 chooses her handle once, or later ----
    if (ui.handleDone) {
      out.push(cs.sec("founder.handle.title", `<p class="cs-row" data-state="done">${W("founder.handle.done", { handle: ui.handleDone })}</p>` + home("setup.member.home")));
      return out.join("");
    }
    if (!me.handle) {
      out.push(cs.sec("founder.handle.title", `<p class="mk-sub">${W("founder.handle.says")}</p>`
        + cs.field("su-fh", S + "handle", { help: S + "handle.help", autocomplete: "username" })
        + `<div class="mk-acts">${cs.act("founderhandleset", { tone: "primary", label: "founder.handle.choose" })}<a class="cs-btn" data-tone="quiet" href="/app" data-nav>${W("founder.handle.later")}</a></div>`
        + `<p class="mk-small">${W("founder.handle.later.help")}</p>`));
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
    // R17: the claim's next step, once, with the group and the handle she chose (R19: the founder only)
    if (ui.claimedHere) {
      const group = id.display_name ? id.display_name : { html: W("screen.entry.group") };
      out.push(`<p class="cs-row" data-state="claimed">${W(S + "claimed", { group, handle: me.handle })}</p>`);
    }
    // the design's steps: each done one marked, the first open one current (R14: "Name" stays open while it is skipped)
    const current = steps.findIndex(([, done]) => !done);
    out.push(`<nav aria-label="${W(S + "steps")}"><ol class="mk-steps">${steps.map(([k, done], i) => `<li${done ? ' class="done"' : ""}${i === current ? ' aria-current="step"' : ""}>${W(S + "step." + k)}${done ? ` <span class="sr">${W(S + "step.done")}</span>` : ""}</li>`).join("")}</ol></nav>`);
    // R19: "Show my recovery codes" only while she holds none she has seen (no unspent code)
    const held = ok(data.codes);
    out.push(codes() || (held && held.held === false ? cs.sec("screen.entry.codes.heading", `<p class="mk-note">${W("screen.entry.codes.what")}</p><div class="mk-acts">${cs.act("recoverycodesissue")}</div>`) : ""));

    // R14: the group's name, the first part after the codes, before any other; its help says where the name shows, and
    // while it is skipped every page says "Your group"
    out.push(cs.sec(S + "name", (id.display_name ? `<p>${W(S + "name.now", { name: id.display_name })}</p>` : "")
      + cs.field("su-name", S + "name.field", { help: S + "name.help", value: id.display_name || "" })
      + `<div class="mk-acts">${cs.act("groupnameset")}</div>`
      + (id.domain && id.domain_verified_at ? `<p>${W(S + "domain.verified", { domain: id.domain })}</p>` : "")
      + cs.field("su-domain", S + "domain", { help: S + "domain.help", value: id.domain || "" })
      + `<div class="mk-acts">${cs.act("groupdomainset")}</div>`));

    // places and languages
    out.push(cs.sec(S + "places", cs.state(data.profiles, (p) => {
      const choices = Array.isArray(p.choices) ? p.choices : [];
      const on = new Set(active.map((x) => x.id));
      const list = [...active, ...choices.filter((c) => !on.has(c.id))];
      return `<p>${active.length ? W(S + "places.now") : W(S + "places.none")}</p>`
        + (active.length ? `<ul class="mk-list">${active.map((x) => `<li>${E(x.name || x.id)}</li>`).join("")}</ul>` : "")
        // the design's checks (`mk-checks`), each place by its own name, the help a note before them (R12)
        + (list.length ? `<p class="mk-note">${W(S + "places.help")}</p><fieldset class="mk-checks" id="su-pf"><legend>${W(S + "places.choose")}</legend>`
          + list.map((x, i) => `<label><input type="checkbox" id="su-pf-${i}" value="${E(x.id)}"${on.has(x.id) ? " checked" : ""}> ${E(x.name || x.id)}</label>`).join("")
          + `</fieldset><div class="mk-acts">${cs.act("profilesset", { data: { ids: list.map((x) => x.id).join(" ") } })}</div>` : "");
    }) + ((ok(data.place) || {}).name ? `<p>${W(S + "place.wanted.now", { name: data.place.value.name })}</p>` : "")
      + cs.field("su-place", S + "place.wanted", { help: S + "place.wanted.help" })
      + `<div class="mk-acts">${cs.act("placewanted")}</div>`));

    // offices and seats
    out.push(cs.sec(S + "offices", `<p class="mk-note">${W(S + "offices.what")}</p><div class="mk-acts">${cs.act("officesseed")}</div>`
      + (ui.office ? `<p>${W(S + "office.added", { label: ui.office })}</p>` : "")
      + cs.field("su-office", S + "office.field") + cs.field("su-office-note", S + "office.note")
      + `<div class="mk-acts">${cs.act("entitycreate")}</div>`));

    // the assistant: keeping the material away from AI (with its reason), the group's key, its switch, the daily limit
    out.push(cs.sec(S + "assistant", `<p class="mk-note">${W(S + "assistant.what")}</p><p class="mk-note">${W(S + "assistant.own")}</p><p class="mk-note">${W(S + "assistant.paid")}</p>`
      + (keep.on === true ? `<p data-state="keepaway">${W(S + "keepaway.on")} <span class="rec">${E(keep.reason || "")}</span></p>` : "")
      + `<p>${W(S + "keepaway")}</p>`
      + cs.field("su-why", S + "keepaway.why", { area: true, rec: true, help: S + "keepaway.help" })
      + `<div class="mk-acts">${cs.act("aikeepaway", { data: { on: keep.on === true ? "off" : "on" } })}</div>`
      + (gk.held === true ? `<p data-state="groupkey">${W(S + "key.held", { state: { html: W(gk.on ? S + "key.on" : S + "key.off") } })}</p>` : "")
      + cs.field("su-key" + (ui.keyGen || 0), S + "key", { type: "password", help: S + "key.help", autocomplete: "off" })
      + `<div class="mk-acts">${cs.act("groupkeyset")}${gk.held === true ? cs.act("groupkeyswitch", { label: gk.on ? S + "key.switchoff" : S + "key.switchon", data: { on: gk.on ? "off" : "on" } }) : ""}</div>`
      + (ui.limit ? `<p>${W(S + "limit.set")}</p>` : "")
      + cs.field("su-limit", S + "limit", { help: S + "limit.help" })
      + `<div class="mk-acts">${cs.act("ailimitset")}</div>`));

    // what a court can reach
    out.push(cs.sec(S + "court", `<p class="mk-note">${W(S + "court.what")}</p>`
      + (court.choice === "tell" || court.choice === "dont" ? `<p>${W(S + "court.now." + court.choice)}</p>` : "")
      + cs.checks("su-court", S + "court.legend", [["tell", S + "court.tell", court.choice === "tell"], ["dont", S + "court.dont", court.choice === "dont"]], { radio: true })
      + `<div class="mk-acts">${cs.act("courtnoticeset")}</div>`));

    // the hosting account, beside HOSTING_CONTROL's words
    out.push(cs.sec(S + "hosting", hosting()
      + (host.current ? `<p>${W(S + "hosting.now", { holders: String(host.current.holders || "") })}</p>` : "")
      + cs.field("su-holders", S + "hosting.field") + cs.field("su-hnote", S + "hosting.note")
      + `<div class="mk-acts">${cs.act("hostingaccessset")}</div>`));

    // a second administrator: the invitation shown once
    out.push(cs.sec(S + "admins", `<p class="mk-note">${W(S + "admins.what")}</p>`
      + (ui.invite ? `<div class="cs-row" data-shown="invite"><p>${W(S + "admins.shown", { date: { html: cs.date(ui.invite.expires) } })}</p><p><code>${E(ui.invite.link)}</code></p></div>` : "")
      + cs.field("su-adm-id", S + "admins.id", { help: S + "admins.id.help", autocomplete: "off" })
      + cs.field("su-adm-cover", S + "admins.cover", { autocomplete: "off" })
      + `<div class="mk-acts">${cs.act("memberadd")}</div>`));

    // security tools: each offered tool with the fields its entry names; the scanner's sentence only while one runs
    out.push(cs.sec(S + "security", (boot.part_scanner === true ? `<p class="mk-note">${W(S + "security.scanner")}</p>` : "") + `<p class="mk-note">${W(S + "security.what")}</p>`
      + (ui.tool ? `<p data-state="tool">${W(ui.tool.passed ? S + "security.passed" : S + "security.failed", { tool: ui.tool.name })}</p>` : "")
      + tools.map((t) => `<p>${W(S + "security.held", { tool: t.name || t.label || t.provider_id || t.tool_id || "" })}</p>`).join("")
      // R12: an empty catalogue draws nothing (a failed read is still drawn as failed)
      + (data.catalogue && data.catalogue.state === "empty" ? "" : cs.state(data.catalogue, (c) => (Array.isArray(c.offered) ? c.offered : []).map((t, i) => {
        const name = t.name || t.label || t.provider_id || "";
        const cfg = Array.isArray(t.config) ? t.config : [];
        const creds = Array.isArray(t.credentials) ? t.credentials : [];
        // each of the tool's own fields by the kit's field, its name the entry's (R12)
        return `<fieldset class="mk-checks" id="su-st-${i}"><legend>${E(name)}</legend>`
          + cfg.map((f, k) => cs.field(`su-st-${i}-cfg-${k}`, S + "security.field", { fills: { field: f.label || f.name } })).join("")
          + creds.map((n, k) => cs.field(`su-st-${i}-cred-${k}`, S + "security.field", { type: "password", autocomplete: "off", fills: { field: n } })).join("")
          + `<label><input type="checkbox" id="su-st-${i}-keep"> ${W(S + "security.keep")}</label>`
          + `<div class="mk-acts">${cs.act("securitytooladd", { data: { tool: String(i) } })}</div></fieldset>`;
      }).join("")))));

    out.push(cs.sec(S + "finished", `<p class="mk-note">${W(S + "finished.what")}</p><div class="mk-acts"><a class="cs-btn" data-tone="primary" href="/app" data-nav>${W(S + "finished.go")}</a></div>`));
    return out.join("");
  },

  // R8: a password held for the claim's sign-in leaves the page's memory when the founder leaves the screen
  closed(cs, view) { if (view.ui) delete view.ui.pending; },

  acts: [
    // R6, R8, R17: the one-time password, the handle she chooses and her password in the body only, the password typed
    // twice alike; no handle sends nothing (a claim with none would hold none)
    { op: "claim",
      send(view, el, cs) {
        const bootstrapToken = String(cs.value("su-otp") || "").trim();
        const handle = String(cs.value("su-handle") || "").trim();
        const password = String(cs.value("su-pw") || "");
        if (!bootstrapToken) return { refuse: "screen.setup.nootp" };
        if (!handle) return { refuse: "refusal.NO_HANDLE" };
        if (password !== String(cs.value("su-pw2") || "")) return { refuse: "screen.entry.differ" };
        if (password.length < 12) return { refuse: "screen.entry.short" };
        // held in the page's memory only until the sign-in below, never drawn, stored or put in an address
        view.ui.pending = password;
        return { body: { bootstrapToken, password, handle } };
      },
      // then `login` by the handle the claim answers (R17: never `admin`) on an own device, the session handed to the
      // shell, and the ten codes shown once (R20)
      async done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        const password = view.ui.pending;
        delete view.ui.pending;
        const handle = a && typeof a.handle === "string" && a.handle ? a.handle : String(cs.value("su-handle") || "").trim();
        const l = await cs.call("login", { body: { handle, password, device: "own" } });
        const login = l && l.result !== undefined ? l.result : l;
        if (!(login && login.ok !== false && login.token)) { cs.set("claimed", true); return { stay: true }; }
        await cs.signin(login, { device: "own", handle, stay: true });
        view.ui.claimedHere = true;
        const c = await cs.call("recoverycodesissue", { body: {} });
        const codes = c && c.result !== undefined ? c.result : c;
        if (codes && codes.ok !== false && Array.isArray(codes.codes) && codes.codes.length) view.ui.codes = codes.codes.map(String); else view.ui.nocodes = true;
      },
      // R17: a refused handle keeps the handle and clears the passwords; R20: ALREADY_CLAIMED draws state c. Every
      // refusal takes the password out of the page's memory (R8)
      refusals: {
        ALREADY_CLAIMED: (r, cs) => { cs.set("pending", null); cs.set("taken", true); return ""; },
        NO_HANDLE: (r, cs) => { cs.set("pending", null); cs.fill("su-pw", ""); cs.fill("su-pw2", ""); return cs.w("refusal.NO_HANDLE"); },
        BAD_HANDLE: (r, cs) => { cs.set("pending", null); cs.fill("su-pw", ""); cs.fill("su-pw2", ""); return cs.w("refusal.BAD_HANDLE"); },
        HANDLE_TAKEN: (r, cs) => { cs.set("pending", null); cs.fill("su-pw", ""); cs.fill("su-pw2", ""); return cs.w("refusal.HANDLE_TAKEN"); },
        HANDLE_FIXED: (r, cs) => { cs.set("pending", null); cs.fill("su-pw", ""); cs.fill("su-pw2", ""); return cs.w("refusal.HANDLE_FIXED"); },
        PASSWORD_TOO_SHORT: (r, cs) => { cs.set("pending", null); return cs.w("refusal.PASSWORD_TOO_SHORT"); },
      } },
    // R18: the founder's handle, chosen once, in the body only
    { op: "founderhandleset", rereads: [],
      send(view, el, cs) {
        const handle = String(cs.value("su-fh") || "").trim();
        return handle ? { body: { handle } } : { refuse: "refusal.NO_HANDLE" };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        cs.set("handleDone", a && typeof a.handle === "string" && a.handle ? a.handle : String(cs.value("su-fh") || "").trim());
        return { stay: true };
      },
      refusals: { NO_HANDLE: "refusal.NO_HANDLE", BAD_HANDLE: "refusal.BAD_HANDLE", HANDLE_TAKEN: "refusal.HANDLE_TAKEN", HANDLE_FIXED: "refusal.HANDLE_FIXED" } },
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

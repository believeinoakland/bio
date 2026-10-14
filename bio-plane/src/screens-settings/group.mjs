/* screens-settings R18 (DEC-201 (8); DEC-205 (1)–(3)): Settings › Your group, the settings chosen at setup, changeable
   here by an administrator: the name (`groupnameset`), the logo (`grouplogoset`, a PNG or JPEG chosen, instance-setup
   R84), the website with the date it was verified (`groupdomainset`), the languages (`grouplanguagesset`, tags among
   those the plane accepts, instance-setup R85), the court notice (`courtnoticeset`), who holds the hosting account
   (`hostingaccessset`) and the group's bar (`strengthbarset`, reasoned). Every member reads it; the acts are drawn only
   to a session that administers (interface-shell R12). Every function is self-contained (interface-shell R21). */

export const group = {
  id: "group",

  reads() {
    return {
      identity: { op: "groupidentity" },
      languages: { op: "grouplanguages" },
      court: { op: "courtnotice" },
      hosting: { op: "hostingaccess" },
      bar: { op: "strengthbarof" },
      // the member's language, in which the languages are named (R31)
      mine: { op: "memberlanguage" },
    };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.group.";
    const T = (k, f) => String(W(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const me = view.me || {};
    const admin = me.administer === true;
    const data = view.data || {};
    // an administrator's act, drawn only to a session that administers
    const A = (op, o) => (admin ? cs.act(op, o) : "");
    // a language by its name in the member's language, never as a tag (R31)
    const mineLang = data.mine && data.mine.state === "ok" && data.mine.value ? data.mine.value.language || null : null;
    const nameOf = (tag) => {
      try { const n = new Intl.DisplayNames([mineLang || "en"], { type: "language" }).of(String(tag)); return n ? n.charAt(0).toUpperCase() + n.slice(1) : String(tag); } catch (e) { return String(tag); }
    };
    // a recorded actor: a value recorded at setup or by the system is "set at setup", never a credential's name (R33)
    const byOf = (by) => { const id = String(by || "").replace(/^member:/, ""); return id === "" || id === "admin" || /^(token|class|daemon|system|seed|bootstrap)/.test(id) ? T("settings.set.setup") : id; };
    const out = [cs.title()];
    if (!admin) out.push(`<p class="mk-note">${W(S + "admins")}</p>`);
    // a section that holds nothing is not drawn (R28)
    const section = (titleKey, inner) => { if (inner) out.push(cs.sec(titleKey, inner)); };

    // the name and the logo
    section(S + "name.heading", cs.state(data.identity, (v) => {
      let h = v.display_name ? `<p data-state="name">${W(S + "name.now", { name: v.display_name })}</p>` : "";
      if (v.logo === true) h += `<p data-state="logo">${W(S + "logo.set")}</p>`;
      const nm = A("groupnameset");
      if (nm) h += `${cs.field("gr-name", S + "name.field", { max: 120, value: v.display_name || "", autocomplete: "off" })}${nm}`;
      const lg = A("grouplogoset");
      if (lg) h += `${cs.field("gr-logo", S + "logo.field", { type: "file", help: S + "logo.help", accept: "image/png,image/jpeg" })}${lg}`;
      return h;
    }));

    // the website, with the date it was verified
    section(S + "domain.heading", cs.state(data.identity, (v) => {
      const claim = v.domain_claim || null;
      const latest = claim && claim.latest ? claim.latest : null;
      let h = v.domain && v.domain_verified_at ? `<p data-state="domain">${W(S + "domain.verified", { domain: v.domain, date: D(v.domain_verified_at) })}</p>` : claim ? `<p data-state="domain">${W(S + "domain.unverified", { domain: claim.domain })}</p>` : "";
      if (latest && latest.verdict && latest.verdict !== "verified") h += `<p>${W(S + "domain.verdict." + (["absent", "mismatched", "undetermined"].indexOf(latest.verdict) >= 0 ? latest.verdict : "undetermined"))}</p>`;
      const dm = A("groupdomainset");
      if (dm) h += `${cs.field("gr-domain", S + "domain.field", { value: claim ? claim.domain : v.domain || "", autocomplete: "off" })}${dm}`;
      return h;
    }));

    // the languages members use, chosen by name (R31)
    section(S + "languages.heading", cs.state(data.languages, (v) => {
      const L = Array.isArray(v.languages) ? v.languages : [];
      let h = L.length ? `<p data-state="languages">${W(S + "languages.now", { languages: L.map(nameOf).join(", ") })}</p>` : "";
      const ls = A("grouplanguagesset");
      if (ls) {
        // the languages offered: the common ones and any already set, kept for the act to read (a function holds no shared constant)
        const COMMON = ["en", "es", "zh", "yue", "vi", "tl", "ko", "ja", "fr", "ar", "ru", "pt", "hi", "so", "am", "ti", "fa", "uk", "hy", "km", "th", "ht", "de", "it", "pl", "sw", "mn", "lo"];
        const offered = [...L, ...COMMON.filter((t) => L.indexOf(t) < 0)];
        view.ui.offered = offered;
        h += `<fieldset><legend>${W(S + "languages.field")}</legend><p class="mk-small">${W(S + "languages.help")}</p>${offered.map((t) => `<input type="checkbox" id="gr-lang-${E(t)}"${L.indexOf(t) >= 0 ? " checked" : ""}><label for="gr-lang-${E(t)}">${E(nameOf(t))}</label>`).join("")}</fieldset>${ls}`;
      }
      return h;
    }));

    // the court notice
    section(S + "court.heading", cs.state(data.court, (v) => {
      const c = v.choice === "tell" || v.choice === "dont" ? v.choice : null;
      let h = `<p data-state="court">${W(c === "tell" ? S + "court.tell" : S + "court.dont")}</p>`;
      const ct = A("courtnoticeset");
      if (ct) h += `<fieldset><legend>${W(S + "court.field")}</legend>${["tell", "dont"].map((x) => `<input type="radio" id="gr-court-${x}" name="gr-court"${(c || "dont") === x ? " checked" : ""}><label for="gr-court-${x}">${W(S + "court.choice." + x)}</label>`).join("")}</fieldset>${ct}`;
      return h;
    }));

    // who holds the hosting account
    section(S + "hosting.heading", cs.state(data.hosting, (v) => {
      const cur = v.current || null;
      let h = cur ? `<p data-state="hosting">${W(S + "hosting.now", { by: byOf(cur.recorded_by), date: D(cur.at) })} <span class="rec">${E(cur.holders)}</span>${cur.note ? ` · <span class="rec">${E(cur.note)}</span>` : ""}</p>` : "";
      const hs = A("hostingaccessset");
      if (hs) h += `${cs.field("gr-holders", S + "hosting.field", { rec: true, max: 500, value: cur ? cur.holders : "", autocomplete: "off" })}${cs.field("gr-hnote", S + "hosting.note", { rec: true, max: 280, value: cur && cur.note ? cur.note : "", autocomplete: "off" })}${hs}`;
      return h;
    }));

    // the group's bar, reasoned
    section(S + "bar.heading", cs.state(data.bar, (v) => {
      const b = v.bar || null;
      let h = b ? `<p data-state="bar">${W(S + "bar.now", { capture: b.capture || "–", connection: b.connection || "–", date: D(b.at) })}</p>${b.reason ? `<p><span class="rec">${E(b.reason)}</span></p>` : ""}` : "";
      const bs = A("strengthbarset");
      if (bs) {
        const opts = [["", S + "bar.unset"], ...["A", "B", "C", "D"].map((g) => ({ value: g, text: g }))];
        h += `${cs.choice("gr-cap", S + "bar.capture", opts, { value: b && b.capture ? b.capture : "" })}${cs.choice("gr-con", S + "bar.connection", opts, { value: b && b.connection ? b.connection : "" })}${cs.field("gr-why", S + "bar.reason", { area: true, rec: true, max: 2000 })}${bs}`;
      }
      return h;
    }));
    return out.join("");
  },

  acts: [
    { op: "groupnameset", rereads: ["identity"],
      send(view, el, cs) { const name = String(cs.value("gr-name") || "").trim(); return name ? { body: { name } } : { refuse: "screen.group.name.empty" }; } },
    // the image's own bytes as the request's body, a PNG or a JPEG (instance-setup R84)
    { op: "grouplogoset", rereads: ["identity"],
      send(view, el, cs) {
        const f = cs.file("gr-logo");
        if (!f) return { refuse: "screen.group.logo.nofile" };
        if (f.type !== "image/png" && f.type !== "image/jpeg") return { refuse: "screen.group.logo.type" };
        if (f.size > 200 * 1024) return { refuse: "screen.group.logo.size" };
        return { raw: f, rawType: f.type };
      } },
    { op: "groupdomainset", rereads: ["identity"],
      send(view, el, cs) { const domain = String(cs.value("gr-domain") || "").trim(); return domain ? { body: { domain } } : { refuse: "screen.group.domain.empty" }; } },
    { op: "grouplanguagesset", rereads: ["languages"],
      send(view, el, cs) {
        const languages = ((view.ui && view.ui.offered) || []).filter((t) => cs.value("gr-lang-" + t) === true);
        return languages.length >= 1 && languages.length <= 20 ? { body: { languages } } : { refuse: "screen.group.languages.count" };
      } },
    { op: "courtnoticeset", rereads: ["court"],
      send(view, el, cs) { return { body: { choice: cs.value("gr-court-tell") === true ? "tell" : "dont" } }; } },
    { op: "hostingaccessset", rereads: ["hosting"],
      send(view, el, cs) {
        const holders = String(cs.value("gr-holders") || "").trim(), note = String(cs.value("gr-hnote") || "").trim();
        return holders ? { body: note ? { holders, note } : { holders } } : { refuse: "screen.group.hosting.empty" };
      } },
    // the bar's reason is the administrator's own words, in its field (interface-shell R11's `reasonField`)
    { op: "strengthbarset", rereads: ["bar"], reasonField: "reason",
      send(view, el, cs) {
        const capture = cs.value("gr-cap") || null, connection = cs.value("gr-con") || null;
        const reason = String(cs.value("gr-why") || "").trim();
        if (!capture && !connection) return { refuse: "screen.group.bar.nograde" };
        if (!reason || reason.length > 2000) return { refuse: "screen.group.bar.noreason" };
        return { body: { capture, connection, reason } };
      } },
  ],
};

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
    };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.group.";
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const me = view.me || {};
    const admin = me.administer === true;
    const data = view.data || {};
    // an administrator's act, drawn only to a session that administers
    const A = (op, o) => (admin ? cs.act(op, o) : "");
    const out = [cs.title()];
    if (!admin) out.push(`<p class="cs-note">${W(S + "admins")}</p>`);

    // the name and the logo
    out.push(cs.sec(S + "name.heading", cs.state(data.identity, (v) => {
      let h = `<p data-state="name">${v.display_name ? W(S + "name.now", { name: v.display_name }) : W(S + "name.none")}</p>`;
      h += `<p data-state="logo">${W(v.logo === true ? S + "logo.set" : S + "logo.none")}</p>`;
      const nm = A("groupnameset");
      if (nm) h += `<div class="cs-form"><label for="gr-name">${W(S + "name.field")}</label><input id="gr-name" type="text" class="cs-input" maxlength="120" value="${E(v.display_name || "")}" autocomplete="off">${nm}</div>`;
      const lg = A("grouplogoset");
      if (lg) h += `<div class="cs-form"><label for="gr-logo">${W(S + "logo.field")}</label><span class="help">${W(S + "logo.help")}</span><input id="gr-logo" type="file" class="cs-input" accept="image/png,image/jpeg">${lg}</div>`;
      return h;
    })));

    // the website, with the date it was verified
    out.push(cs.sec(S + "domain.heading", cs.state(data.identity, (v) => {
      const claim = v.domain_claim || null;
      const latest = claim && claim.latest ? claim.latest : null;
      let h = `<p data-state="domain">${v.domain && v.domain_verified_at ? W(S + "domain.verified", { domain: v.domain, date: D(v.domain_verified_at) }) : claim ? W(S + "domain.unverified", { domain: claim.domain }) : W(S + "domain.none")}</p>`;
      if (latest && latest.verdict && latest.verdict !== "verified") h += `<p>${W(S + "domain.verdict." + (["absent", "mismatched", "undetermined"].indexOf(latest.verdict) >= 0 ? latest.verdict : "undetermined"))}</p>`;
      const dm = A("groupdomainset");
      if (dm) h += `<div class="cs-form"><label for="gr-domain">${W(S + "domain.field")}</label><input id="gr-domain" type="text" class="cs-input" value="${E(claim ? claim.domain : v.domain || "")}" autocomplete="off">${dm}</div>`;
      return h;
    })));

    // the languages members use
    out.push(cs.sec(S + "languages.heading", cs.state(data.languages, (v) => {
      const L = Array.isArray(v.languages) ? v.languages : [];
      let h = `<p data-state="languages">${L.length ? W(S + "languages.now", { languages: L.join(", ") }) : W(S + "languages.none")}</p>`;
      const ls = A("grouplanguagesset");
      if (ls) h += `<div class="cs-form"><label for="gr-langs">${W(S + "languages.field")}</label><span class="help">${W(S + "languages.help")}</span><input id="gr-langs" type="text" class="cs-input" value="${E(L.join(" "))}" autocomplete="off">${ls}</div>`;
      return h;
    })));

    // the court notice
    out.push(cs.sec(S + "court.heading", cs.state(data.court, (v) => {
      const c = v.choice === "tell" || v.choice === "dont" ? v.choice : null;
      let h = `<p data-state="court">${W(c === "tell" ? S + "court.tell" : S + "court.dont")}</p>`;
      const ct = A("courtnoticeset");
      if (ct) h += `<div class="cs-form"><fieldset><legend>${W(S + "court.field")}</legend>${["tell", "dont"].map((x) => `<input type="radio" id="gr-court-${x}" name="gr-court"${(c || "dont") === x ? " checked" : ""}><label for="gr-court-${x}">${W(S + "court.choice." + x)}</label>`).join("")}</fieldset>${ct}</div>`;
      return h;
    })));

    // who holds the hosting account
    out.push(cs.sec(S + "hosting.heading", cs.state(data.hosting, (v) => {
      const cur = v.current || null;
      let h = cur ? `<p data-state="hosting">${W(S + "hosting.now", { by: cur.recorded_by || "", date: D(cur.at) })} <span class="rec">${E(cur.holders)}</span>${cur.note ? ` · <span class="rec">${E(cur.note)}</span>` : ""}</p>` : `<p data-state="hosting">${W(S + "hosting.none")}</p>`;
      const hs = A("hostingaccessset");
      if (hs) h += `<div class="cs-form"><label for="gr-holders">${W(S + "hosting.field")}</label><input id="gr-holders" type="text" class="cs-input rec" maxlength="500" value="${E(cur ? cur.holders : "")}" autocomplete="off"><label for="gr-hnote">${W(S + "hosting.note")}</label><input id="gr-hnote" type="text" class="cs-input rec" maxlength="280" value="${E(cur && cur.note ? cur.note : "")}" autocomplete="off">${hs}</div>`;
      return h;
    })));

    // the group's bar, reasoned
    out.push(cs.sec(S + "bar.heading", cs.state(data.bar, (v) => {
      const b = v.bar || null;
      let h = `<p data-state="bar">${b ? W(S + "bar.now", { capture: b.capture || "–", connection: b.connection || "–", date: D(b.at) }) : W(S + "bar.none")}</p>${b && b.reason ? `<p><span class="rec">${E(b.reason)}</span></p>` : ""}`;
      const bs = A("strengthbarset");
      if (bs) {
        const sel = (id, cur) => `<select id="${id}" class="cs-input"><option value=""${cur ? "" : " selected"}>${W(S + "bar.unset")}</option>${["A", "B", "C", "D"].map((g) => `<option value="${g}"${cur === g ? " selected" : ""}>${g}</option>`).join("")}</select>`;
        h += `<div class="cs-form"><label for="gr-cap">${W(S + "bar.capture")}</label>${sel("gr-cap", b && b.capture)}<label for="gr-con">${W(S + "bar.connection")}</label>${sel("gr-con", b && b.connection)}<label for="gr-why">${W(S + "bar.reason")}</label><textarea id="gr-why" class="cs-input rec" maxlength="2000"></textarea>${bs}</div>`;
      }
      return h;
    })));
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
        const languages = String(cs.value("gr-langs") || "").split(/[\s,]+/).filter(Boolean);
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

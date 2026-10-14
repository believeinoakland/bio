/* screens-settings R16 (N897 (1); N669; DEC-127 (5), DEC-157): Settings › Translations, the registry's 5 acts. The
   language is the screen's subject (`/app/translations/<tag>`), chosen among the group's languages (`grouplanguages`,
   instance-setup R85). For it, `translations` (instance-setup R74; a granted speaker's, else its refusal
   `TRANSLATION_NOT_GRANTED` drawn in its words) and `interfacewords` (what members are shown) are read. Each word is a
   row (interface-shell R19) with its English, its meaning note, its state, its shown or awaiting text with who adopted
   it, and whether its English changed since; its panel offers `translationadopt` (typed, or from a stored draft kept as
   drafted or corrected), `translationconfirm` (an awaiting protected word, by another granted speaker or an
   administrator), `translationrevert` (an administrator's undo) and, to an administrator, the assistant's reading of an
   awaiting protected word back into English (`translationdraft` `to_english`), drawn beside it and adopting nothing.
   The picked words' drafts are asked of the assistant (`translationdraft` `to_language`, only while it is reachable),
   each drawn labelled machine work and shown to no member until adopted. `translationgrant` (an administrator's) grants
   or revokes a named member's right for the language. Every function is self-contained (interface-shell R21). */

export const translations = {
  id: "translations",

  reads(view) {
    const r = { languages: { op: "grouplanguages" }, mine: { op: "memberlanguage" } };
    if (view.subject) {
      r.words = { op: "translations", query: { language: String(view.subject) } };
      r.shown = { op: "interfacewords", query: { language: String(view.subject) } };
    }
    return r;
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.translations.";
    const me = view.me || {};
    const admin = me.administer === true;
    const ui = view.ui || {};
    const data = view.data || {};
    const lang = view.subject ? String(view.subject) : null;
    // a language by its name in the member's language, never as a tag (R31)
    const mineLang = data.mine && data.mine.state === "ok" && data.mine.value ? data.mine.value.language || null : null;
    const nameOf = (tag) => {
      try { const n = new Intl.DisplayNames([mineLang || "en"], { type: "language" }).of(String(tag)); return n ? n.charAt(0).toUpperCase() + n.slice(1) : String(tag); } catch (e) { return String(tag); }
    };
    const out = [cs.title()];

    // the group's languages, each opening its words; the group's source English is not a language to translate into (R31)
    const langs = cs.state(data.languages, (v) => {
      const L = Array.isArray(v.languages) ? v.languages.filter((t) => String(t).split("-")[0].toLowerCase() !== "en") : [];
      return L.length ? `<ul class="cs-list" data-list="languages">${L.map((t) => `<li><a href="/app/translations/${E(encodeURIComponent(t))}" data-nav${t === lang ? ' aria-current="page"' : ""}>${E(nameOf(t))}</a></li>`).join("")}</ul>` : "";
    });
    if (langs) out.push(cs.sec(S + "languages.heading", langs));
    if (!lang) { if (langs) out.push(`<p>${W(S + "choose")}</p>`); return out.join(""); }

    // a member who is not granted reads the refusal's own words alone
    if (data.words && data.words.state === "failed") { out.push(cs.state(data.words, () => "")); return out.join(""); }

    // a grant for the language: an administrator's act
    const grant = admin ? cs.act("translationgrant", { data: { revoke: "" } }) : "";
    if (grant) out.push(cs.sec(S + "grant.heading", `${cs.field("tr-member", S + "grant.member", { fills: { language: nameOf(lang) }, autocomplete: "off" })}<input type="checkbox" id="tr-revoke"><label for="tr-revoke">${W(S + "grant.revoke")}</label>${grant}`));

    // the words, each a row with its acts in its panel; a row shows its English and its meaning, never its key
    out.push(cs.sec(S + "words.heading", cs.state(data.words, (v) => {
      const words = Array.isArray(v.words) ? v.words : [];
      const c = v.counts || {};
      const read = ui.readings || {};
      let h = Number(c.shown || 0) + Number(c.awaiting || 0) + Number(c.missing || 0) > 0 ? `<p data-state="counts">${W(S + "counts", { shown: Number(c.shown || 0), awaiting: Number(c.awaiting || 0), missing: Number(c.missing || 0) })}</p>` : "";
      h += cs.rows({
        id: "words", pick: !!view.reachable, cols: [S + "col.en", S + "col.state", S + "col.text"], items: words, key: (x) => x.key, name: (x) => E(x.en),
        cells: (x) => [
          `${E(x.en)}${x.note ? `<span class="mk-small">${E(x.note)}</span>` : ""}${x.means ? `<span class="mk-small">${E(x.means)}</span>` : ""}${x.protected ? " · " + W(S + "protected") : ""}`,
          W(S + "state." + (["missing", "shown", "awaiting"].indexOf(x.state) >= 0 ? x.state : "missing")) + (x.english_changed ? " · " + W(S + "changed") : ""),
          x.text ? `<span class="rec">${E(x.text)}</span> · ${W(S + "adopted", { by: x.adopted_by_name || x.adopted_by || "" })} ${cs.date(x.adopted_at, { year: true })}` : "",
        ],
        acts: (x) => {
          const k = String(x.key);
          const fid = "tr-t-" + k.replace(/[^A-Za-z0-9_-]/g, "_");
          const drafts = Array.isArray(x.drafts) ? x.drafts : [];
          const p = [];
          // the stored drafts, labelled machine work, each one to keep as drafted or corrected
          if (drafts.length) p.push(`<fieldset><legend>${W(S + "drafts")}</legend>${drafts.map((d, i) => `<input type="radio" id="${fid}-d${i}" name="${fid}-d" data-draft="${E(d.id)}"><label for="${fid}-d${i}"><span class="mk-tag">${W(S + "draft.label", { handle: d.asked_by_name || String(d.asked_by || "").replace(/^member:/, "") })}</span> <span class="rec">${E(d.text)}</span></label>`).join("")}</fieldset>`);
          const adopt = cs.act("translationadopt", { data: { key: k } });
          if (adopt) p.push(`${cs.field(fid, S + "text.field", { help: drafts.length ? S + "text.help.draft" : S + "text.help", rec: true, max: 2000, value: x.text || "", autocomplete: "off" })}${adopt}`);
          if (x.state === "awaiting" && x.protected) {
            if (read[k]) p.push(`<p data-shown="reading"><span class="mk-tag">${W(S + "reading.label", { handle: read[k].askedBy })}</span> <span class="rec">${E(read[k].english)}</span></p>`);
            if (admin && view.reachable && !read[k]) p.push(cs.act("translationdraft", { label: S + "reading.ask", data: { key: k, direction: "to_english" } }));
            p.push(cs.act("translationconfirm", { data: { key: k } }));
          }
          if (admin && Array.isArray(x.acts) && x.acts.length) p.push(cs.act("translationrevert", { data: { key: k } }));
          return p.join("");
        },
        // the picked words' drafts, asked of the assistant while it is reachable
        hold: () => cs.act("translationdraft", { data: { direction: "to_language" } }),
      });
      return h;
    })));
    return out.join("");
  },

  acts: [
    { op: "translationgrant", rereads: [],
      send(view, el, cs) {
        const member = String(cs.value("tr-member") || "").trim().replace(/^member:/, "");
        if (!member) return { refuse: "screen.translations.grant.nomember" };
        return { body: cs.value("tr-revoke") === true ? { member, language: String(view.subject), revoke: true } : { member, language: String(view.subject) } };
      },
      done(view, answer, cs) { cs.set("granted", true); } },
    // typed, or from the stored draft chosen (kept as drafted or corrected)
    { op: "translationadopt", rereads: ["words", "shown"],
      send(view, el, cs) {
        const k = el.dataset.key, fid = "tr-t-" + String(k).replace(/[^A-Za-z0-9_-]/g, "_");
        const words = view.data && view.data.words && view.data.words.value ? view.data.words.value.words || [] : [];
        const w = words.find((x) => x.key === k) || {};
        const drafts = Array.isArray(w.drafts) ? w.drafts : [];
        const i = drafts.findIndex((d, j) => cs.value(fid + "-d" + j) === true);
        const typed = String(cs.value(fid) || "").trim();
        const text = typed || (i >= 0 ? drafts[i].text : "");
        if (!text) return { refuse: "screen.translations.text.none" };
        const body = { language: String(view.subject), key: k, text };
        if (i >= 0) body.draft = drafts[i].id;
        return { body };
      } },
    { op: "translationconfirm", rereads: ["words", "shown"],
      send(view, el) { return { body: { language: String(view.subject), key: el.dataset.key } }; } },
    { op: "translationrevert", rereads: ["words", "shown"],
      send(view, el) { return { body: { language: String(view.subject), key: el.dataset.key } }; } },
    // the assistant's drafts of the picked words (to the language), or its reading of one word back into English
    { op: "translationdraft", rereads: ["words"],
      send(view, el, cs, extra) {
        if (el.dataset.direction === "to_english") return { body: { language: String(view.subject), direction: "to_english", key: el.dataset.key } };
        const keys = (extra && extra.picked) || [];
        return keys.length ? { body: { language: String(view.subject), direction: "to_language", keys } } : { refuse: "screen.translations.pick" };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (a && typeof a.english === "string") {
          const me = view.me || {};
          const by = a.label && a.label.asked_by ? String(a.label.asked_by).replace(/^member:/, "") : me.member;
          cs.set("readings", { ...((view.ui && view.ui.readings) || {}), [a.key]: { english: a.english, askedBy: by === me.member && me.handle ? me.handle : by } });
        }
      } },
  ],
};

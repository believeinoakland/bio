/* screens-settings R19 (DEC-200 (8); N997; setup-page R13, R19, R20 moved): Settings › Places and offices, an
   administrator's. The places whose rules apply (`profiles`, instance-setup R12–R16), chosen with `profilesset`, its
   warning said first (local facts read differently from then on) and choosing none allowed; the place the group wants
   that is not held yet (`placewantedstate`, `placewanted`, R60); the offices and seats the group deals with
   (`entitieskind` office, read page by page to the end, each marked by origin: seeded from the places' rules, or added
   by the group), filled in again (`officesseed`) or added by an administrator (`entitycreate`). A read that failed is
   never drawn as none, a later page's included. Every function is self-contained (interface-shell R21). */

export const places = {
  id: "places",

  reads(view) {
    const r = { profiles: { op: "profiles" }, offices: { op: "entitieskind", query: { kind: "office", limit: "500" } } };
    // the owner answers the place wanted to an administrator only (instance-setup R60)
    if (view.me && view.me.administer === true) r.place = { op: "placewantedstate" };
    return r;
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.places.";
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const me = view.me || {};
    const admin = me.administer === true;
    const ui = view.ui || {};
    const data = view.data || {};
    const out = [cs.title()];
    if (!admin) out.push(`<p class="cs-note">${W(S + "admins")}</p>`);

    // the places whose rules apply, in the order they are read
    out.push(cs.sec(S + "profiles.heading", cs.state(data.profiles, (v) => {
      const act = Array.isArray(v.profiles) ? v.profiles : [];
      let h = act.length ? `<ol class="cs-list" data-list="profiles">${act.map((p) => `<li>${E(p.name || p.id)}${(p.covers || []).length ? ` · ${E(p.covers.join(", "))}` : ""}</li>`).join("")}</ol>` : `<p>${W(S + "profiles.none")}</p>`;
      if ((v.conflicts || []).length) h += `<p class="cs-note">${W(S + "profiles.conflicts", { n: v.conflicts.length })}</p>`;
      const set = admin ? cs.act("profilesset") : "";
      if (set) {
        const choices = Array.isArray(v.choices) ? v.choices : [];
        const on = new Set(act.map((p) => p.id));
        h += `<div class="cs-form"><fieldset><legend>${W(S + "profiles.field")}</legend>${choices.map((p) => `<input type="checkbox" id="pl-p-${E(p.id)}" data-profile="${E(p.id)}"${on.has(p.id) ? " checked" : ""}><label for="pl-p-${E(p.id)}">${E(p.name || p.id)}${(p.covers || []).length ? ` · ${E(p.covers.join(", "))}` : ""}</label>`).join("")}</fieldset><p class="cs-notice" data-warning="profiles">${W(S + "profiles.warning")}</p>${set}</div>`;
      }
      return h;
    })));

    // the place the group wants that is not held yet
    if (admin) out.push(cs.sec(S + "wanted.heading", cs.state(data.place, (v) => {
      let h = `<p data-state="wanted">${v.name ? W(S + "wanted.now", { name: v.name, date: D(v.set_at) }) : W(S + "wanted.none")}</p>`;
      for (const m of v.matches || []) h += `<p class="cs-notice">${W(S + "wanted.match", { profile: m.profile_name || m.profile })}</p>`;
      const pw = cs.act("placewanted");
      if (pw) h += `<div class="cs-form"><label for="pl-want">${W(S + "wanted.field")}</label><span class="help">${W(S + "wanted.help")}</span><input id="pl-want" type="text" class="cs-input" maxlength="200" value="${E(v.name || "")}" autocomplete="off">${pw}</div>`;
      return h;
    })));

    // the offices, every page read; a page that did not answer is said, never taken as the end
    const MACHINE = { authors: ["claude", "pwa-client", "daemon", "sweep", "session", "accelerator", "apps-script", "system", "agent", "ai"], classes: ["daemon", "session", "member"], prefixes: ["token:", "class:"] };
    const byMember = (o) => { const s = String(o.declared_by || "").trim().toLowerCase(); return s !== "" && !(MACHINE.prefixes.some((p) => s.startsWith(p)) || MACHINE.classes.indexOf(s) >= 0 || MACHINE.authors.indexOf(s) >= 0); };
    out.push(cs.sec(S + "offices.heading", cs.state(data.offices, (v) => {
      const pages = [...(v.entities || []), ...(ui.more || [])];
      const next = ui.moreNext !== undefined ? ui.moreNext : v.next;
      // the next page, read on the page's clock (interface-shell R27's `cs.later`), until `next` is null
      if (next && !ui.paging && !ui.moreFailed) {
        view.ui.paging = true;
        cs.later(0, async (k, vw) => {
          const a = await k.call("entitieskind", { query: { kind: "office", limit: "500", after: next } });
          const r = a && a.result !== undefined ? a.result : a;
          if (!r || r.ok !== true || !Array.isArray(r.entities)) { vw.ui.paging = false; k.set("moreFailed", true); return; }
          vw.ui.paging = false;
          vw.ui.more = [...(vw.ui.more || []), ...r.entities];
          k.set("moreNext", r.next || null);
        });
      }
      let h = pages.length ? `<ul class="cs-list" data-list="offices">${pages.map((o) => `<li><span class="rec">${E(o.label)}</span> · ${W(byMember(o) ? S + "offices.bygroup" : S + "offices.seeded")}</li>`).join("")}</ul>` : next ? "" : `<p>${W(S + "offices.none")}</p>`;
      if (next && !ui.moreFailed) h += `<p class="cs-state" data-state="loading">${W("state.loading")}</p>`;
      if (ui.moreFailed) h += `<p class="cs-state" data-state="failed">${W(S + "offices.rest")}</p>`;
      return h;
    }, { empty: S + "offices.none" })));
    if (admin) {
      const seed = cs.act("officesseed");
      const add = cs.act("entitycreate");
      let h = "";
      if (ui.seeded) h += `<p data-shown="seeded">${W(S + "seeded", { seeded: ui.seeded.seeded, already: ui.seeded.already, unseeded: ui.seeded.unseeded })}</p>`;
      if (seed) h += seed;
      if (add) h += `<div class="cs-form"><label for="pl-label">${W(S + "add.label")}</label><input id="pl-label" type="text" class="cs-input rec" autocomplete="off"><label for="pl-note">${W(S + "add.note")}</label><span class="help">${W(S + "add.help")}</span><textarea id="pl-note" class="cs-input rec"></textarea>${add}</div>`;
      if (h) out.push(cs.sec(S + "add.heading", h));
    }
    return out.join("");
  },

  acts: [
    // the places ticked, in the list's order; none is allowed and says what it means (the warning drawn first)
    { op: "profilesset", rereads: ["profiles", "place"],
      send(view, el, cs) {
        const v = view.data && view.data.profiles && view.data.profiles.state === "ok" ? view.data.profiles.value : {};
        return { body: { profiles: (v.choices || []).map((p) => p.id).filter((id) => cs.value("pl-p-" + id) === true) } };
      } },
    { op: "placewanted", rereads: ["place"],
      send(view, el, cs) { const name = String(cs.value("pl-want") || "").trim(); return { body: { name: name || null } }; } },
    { op: "officesseed", rereads: ["offices"],
      send() { return { body: {} }; },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        view.ui.more = []; view.ui.moreNext = undefined; view.ui.moreFailed = false;
        cs.set("seeded", { seeded: (a && a.seeded || []).length, already: (a && a.already || []).length, unseeded: (a && a.unseeded || []).length });
      } },
    // the administrator's own note on the office is its reason (interface-shell R11's `reasonField`; DEC-88)
    { op: "entitycreate", rereads: ["offices"], reasonField: "note",
      send(view, el, cs) {
        const label = String(cs.value("pl-label") || "").trim(), note = String(cs.value("pl-note") || "").trim();
        if (!label || !note) return { refuse: "screen.places.add.incomplete" };
        view.ui.more = []; view.ui.moreNext = undefined; view.ui.moreFailed = false;
        return { body: { kind: "office", label, note } };
      } },
  ],
};

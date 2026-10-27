/* screens-settings R19 (DEC-200 (8); N997; setup-page R13, R19, R20 moved): Settings › Places and offices, an
   administrator's. The places whose rules apply (`profiles`, instance-setup R12–R16), chosen with `profilesset`, its
   warning said first (local facts read differently from then on) and choosing none allowed; the place the group wants
   that is not held yet (`placewantedstate`, `placewanted`, R60); the offices and seats the group deals with
   (`entitieskind` office, read page by page to the end, each marked by origin: seeded from the places' rules, or added
   by the group), filled in again (`officesseed`) or added by an administrator (`entitycreate`). A read that failed is
   never drawn as none, a later page's included. Every function is self-contained (interface-shell R21).
   T50 (R46; N1190; DEC-300 (1), DEC-319 (4)): "Courts", an administrator's section listing the forums of kind `court` the team
   holds (`entitieskind` of kind `body` with `forum_kind: "court"`), each by its name and where it came from, and "Add a court"
   (`entitycreate` with `forum_kind: "court"`) beside "Add an office yourself".
   T51 (R60, R61's reference; N858 D8; DEC-340, U366): for a place named (`placewantedstate` answers a `name`) while `profiles` lists no
   active non-test profile, the screen draws that no profile is held for it, what it therefore offers nothing of, and the field to name
   the place again (`placewanted`), and none of the sections a profile fills (offices, courts, where else to go, the places' choice
   unless some are offered to choose); nothing is filled in from another profile. With a profile active it draws as before. Either
   way the reference to `grouprules` follows, with the sentence that a member may draft a rule and another confirm it.
   T51 fix round 3 (C64; entities R63, R64; DEC-401, DEC-402): an office a member named and no administrator has confirmed is marked
   (`named_by_member: true`, `screen.request.nameoffice.mark`) and offers the administrator's confirm (`officeconfirm`); the contact and the
   law an office states are drawn with it. */

export const places = {
  id: "places",

  reads(view) {
    const r = { profiles: { op: "profiles" }, offices: { op: "entitieskind", query: { kind: "office", limit: "500" } } };
    // the owner answers the place wanted to an administrator only (instance-setup R60)
    if (view.me && view.me.administer === true) {
      r.place = { op: "placewantedstate" };
      // the list of where else to go is the places' rules' data (wizard-scripts R37): only how many are listed is drawn here (R25)
      r.elsewhere = { op: "startfrom" };
      // R46: the courts the team holds, seeded by the places' rules or added by a member
      r.courts = { op: "entitieskind", query: { kind: "body", forum_kind: "court", limit: "500" } };
    }
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
    if (!admin) out.push(`<p class="mk-note">${W(S + "admins")}</p>`);

    // R60: a place named and no active non-test profile: said, and nothing a profile would fill is drawn, none from another profile
    const prof = data.profiles && data.profiles.state === "ok" && data.profiles.value ? data.profiles.value : null;
    const named = admin && data.place && data.place.state === "ok" && data.place.value && data.place.value.name ? String(data.place.value.name) : null;
    const noProfile = !!(named && prof && Array.isArray(prof.profiles) && !prof.profiles.some((p) => p && p.test !== true));
    // the reference to the team's own rules (R61), under both states, to every member: any member drafts, another confirms
    const rulesRef = cs.sec("screen.grouprules.name", `<p class="mk-note">${W(S + "rules.note")}</p><div class="mk-links"><a class="cs-ref" href="/app/grouprules" data-nav data-screen="grouprules">${W("screen.grouprules.name")}</a></div>`);
    if (noProfile) {
      const pw = cs.act("placewanted");
      out.push(cs.sec(S + "noprofile.heading", `<p data-state="noprofile">${W(S + "noprofile.says", { state: named })}</p><p>${W(S + "noprofile.offers")}</p><p class="mk-note">${W(S + "noprofile.still")} ${W(S + "noprofile.asks")}</p>${pw ? `${cs.field("pl-want", S + "noprofile.want", { help: S + "noprofile.want.help", max: 200, value: named, autocomplete: "off" })}${pw}` : ""}`, { fills: { state: named } }));
      // a profile a team could choose is still offered to choose (the act is `profilesset`'s)
      if ((prof.choices || []).length && admin) out.push(cs.sec(S + "profiles.heading", cs.state(data.profiles, (v) => `<div><fieldset><legend>${W(S + "profiles.field")}</legend>${v.choices.map((p) => `<label for="pl-p-${E(p.id)}"><input type="checkbox" id="pl-p-${E(p.id)}" data-profile="${E(p.id)}">${E(p.name || p.id)}${(p.covers || []).length ? ` · ${E(p.covers.join(", "))}` : ""}</label>`).join("")}</fieldset><p class="mk-msg" data-warning="profiles">${W(S + "profiles.warning")}</p>${cs.act("profilesset")}</div>`)));
      out.push(rulesRef);
      return out.join("");
    }

    // the places whose rules apply, in the order they are read
    out.push(cs.sec(S + "profiles.heading", cs.state(data.profiles, (v) => {
      const act = Array.isArray(v.profiles) ? v.profiles : [];
      let h = act.length ? `<ol class="mk-list" data-list="profiles">${act.map((p) => `<li>${E(p.name || p.id)}${(p.covers || []).length ? ` · ${E(p.covers.join(", "))}` : ""}</li>`).join("")}</ol>` : `<p>${W(S + "profiles.none")}</p>`;
      if ((v.conflicts || []).length) h += `<p class="mk-note">${W(S + "profiles.conflicts", { n: v.conflicts.length })}</p>`;
      const set = admin ? cs.act("profilesset") : "";
      if (set) {
        const choices = Array.isArray(v.choices) ? v.choices : [];
        const on = new Set(act.map((p) => p.id));
        h += `<div><fieldset><legend>${W(S + "profiles.field")}</legend>${choices.map((p) => `<label for="pl-p-${E(p.id)}"><input type="checkbox" id="pl-p-${E(p.id)}" data-profile="${E(p.id)}"${on.has(p.id) ? " checked" : ""}>${E(p.name || p.id)}${(p.covers || []).length ? ` · ${E(p.covers.join(", "))}` : ""}</label>`).join("")}</fieldset><p class="mk-msg" data-warning="profiles">${W(S + "profiles.warning")}</p>${set}</div>`;
      }
      return h;
    })));

    // the place the group wants that is not held yet
    if (admin) out.push(cs.sec(S + "wanted.heading", cs.state(data.place, (v) => {
      let h = `<p data-state="wanted">${v.name ? W(S + "wanted.now", { name: v.name, date: D(v.set_at) }) : W(S + "wanted.none")}</p>`;
      for (const m of v.matches || []) h += `<p class="mk-msg">${W(S + "wanted.match", { profile: m.profile_name || m.profile })}</p>`;
      const pw = cs.act("placewanted");
      if (pw) h += `${cs.field("pl-want", S + "wanted.field", { help: S + "wanted.help", max: 200, value: v.name || "", autocomplete: "off" })}${pw}`;
      return h;
    })));

    // R25 (N847; DEC-227 (1)): where else to go, how many are listed and the way to the list; the group neither chooses nor
    // edits it, so no act. A pointer of null is drawn failed, never as none; with none listed only the reference is drawn.
    if (admin && data.elsewhere) out.push(cs.sec("places.elsewhere.head", cs.state(data.elsewhere, (v) => {
      const route = (Array.isArray(v.routes) ? v.routes : []).find((r) => r && r.route === "elsewhere");
      const ptr = route ? route.pointer : null;
      if (!ptr || typeof ptr !== "object" || !Array.isArray(ptr.pointers)) return cs.state({ state: "failed" }, () => "");
      const n = ptr.pointers.length;
      return (n >= 1 ? `<p data-state="elsewhere">${W("places.elsewhere.says", { n })}</p>` : "") + `<div class="mk-links"><a class="cs-ref" href="/app/elsewhere" data-nav data-screen="elsewhere">${W("places.elsewhere.open")}</a></div>`;
    })));

    // the offices, every page read; a page that did not answer is said, never taken as the end
    const MACHINE = { authors: ["claude", "pwa-client", "daemon", "sweep", "session", "accelerator", "apps-script", "system", "agent", "ai"], classes: ["daemon", "session", "member"], prefixes: ["token:", "class:"] };
    const byMember = (o) => { const s = String(o.declared_by || "").trim().toLowerCase(); return s !== "" && !(MACHINE.prefixes.some((p) => s.startsWith(p)) || MACHINE.classes.indexOf(s) >= 0 || MACHINE.authors.indexOf(s) >= 0); };
    const officesHtml = (cs.state(data.offices, (v) => {
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
      // C64 (entities R63, R64): an office a member named, not yet confirmed (`named_by_member: true`), carries the mark and, to an administrator,
      // the confirm; its contact and the law it goes under are drawn where the office states them (`null` when it states neither). Any other
      // office is marked by its origin as before.
      const confirm = (o) => (o.named_by_member === true ? cs.act("officeconfirm", { label: "shell.confirm", data: { office: String(o.entity_id) } }) : "");
      const contact = (o) => (o.contact && typeof o.contact === "object" && o.contact.value ? ` · <span class="mk-small">${W("screen.request.nameoffice.where")}: <span class="rec">${E(o.contact.value)}</span></span>` : "");
      const law = (o) => (typeof o.law === "string" && o.law ? ` · <span class="mk-small">${W("screen.request.nameoffice.law")}: <span class="rec">${E(o.law)}</span></span>` : "");
      let h = (pages.length ? `<ul class="mk-list" data-list="offices">${pages.map((o) => `<li data-office="${E(o.entity_id)}"><span class="rec">${E(o.label)}</span> · ${o.named_by_member === true ? `<span class="mk-tag" data-mark="named-by-member">${W("screen.request.nameoffice.mark")}</span>` : W(byMember(o) ? S + "offices.bygroup" : S + "offices.seeded")}${contact(o)}${law(o)}${confirm(o) ? " " + confirm(o) : ""}</li>`).join("")}</ul>` : "");
      if (next && !ui.moreFailed) h += `<p class="cs-state" data-state="loading">${W("state.loading")}</p>`;
      if (ui.moreFailed) h += `<p class="cs-state" data-state="failed">${W(S + "offices.rest")}</p>`;
      return h;
    }, { empty: S + "offices.none" }));
    // R28: a section that holds nothing is not drawn
    if (officesHtml) out.push(cs.sec(S + "offices.heading", officesHtml));
    // R46: the courts held, each by its name and where it came from; "Add a court" beside "Add an office yourself". A failed read is
    // drawn failed, never as none; an administrator's section only
    if (admin) {
      const added = ui.courtAdded ? `<p data-shown="court">${W(S + "court.done", { name: ui.courtAdded })}</p>` : "";
      const list = cs.state(data.courts, (v) => {
        const items = Array.isArray(v.entities) ? v.entities : [];
        return items.length ? `<ul class="mk-list" data-list="courts">${items.map((o) => `<li><span class="rec">${E(o.label)}</span> · ${byMember(o) ? W(S + "court.added", { name: cs.memberName(String(o.declared_by).replace(/^member:/, "")), date: D(o.at) }) : W(S + "court.seeded")}</li>`).join("")}</ul>` : "";
      });
      const add = cs.act("entitycreate", { label: "court.add", data: { court: "1" } });
      const form = add ? `${cs.field("pl-court", "court.add.name", { help: "court.add.help", rec: true, autocomplete: "off" })}${add}` : "";
      if (list || added || form) out.push(cs.sec(S + "courts", added + list + form));
    }
    if (admin) {
      const seed = cs.act("officesseed");
      const add = cs.act("entitycreate");
      let h = "";
      if (ui.seeded) h += `<p data-shown="seeded">${W(S + "seeded", { seeded: ui.seeded.seeded, already: ui.seeded.already, unseeded: ui.seeded.unseeded })}</p>`;
      if (seed) h += seed;
      if (add) h += `${cs.field("pl-label", S + "add.label", { rec: true, autocomplete: "off" })}${cs.field("pl-note", S + "add.note", { help: S + "add.help", area: true, rec: true })}${add}`;
      if (h) out.push(cs.sec(S + "add.heading", h));
    }
    out.push(rulesRef);
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
    // C64 (entities R64): an administrator confirms an office a member named; `entityId` is the office's id. The mark clears when the offices are read
    // again from the first page, and a repeat (`already: true`) reads the same: both are as done as each other
    { op: "officeconfirm", rereads: ["offices"],
      send(view, el, cs) {
        const id = String(el.dataset.office || "");
        if (!id) return null;
        view.ui.more = []; view.ui.moreNext = undefined; view.ui.moreFailed = false;
        return { body: { entityId: id } };
      } },
    // a court (R46) is the same act with `forum_kind`; the owner requires a note on every entity, and the court's form asks the name alone,
    // so the court's own name is its note
    { op: "entitycreate", rereads: ["offices", "courts"], reasonField: "note",
      send(view, el, cs) {
        if (el.dataset.court === "1") {
          const name = String(cs.value("pl-court") || "").trim();
          // an empty box is refused naming it (C87): the box's own label, as plain text
          if (!name) return { refuse: "shell.field.needed", fills: { field: String(cs.w("court.add.name")).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])) } };
          return { body: { kind: "body", forum_kind: "court", label: name, note: name } };
        }
        const label = String(cs.value("pl-label") || "").trim(), note = String(cs.value("pl-note") || "").trim();
        if (!label || !note) return { refuse: "screen.places.add.incomplete" };
        view.ui.more = []; view.ui.moreNext = undefined; view.ui.moreFailed = false;
        return { body: { kind: "office", label, note } };
      },
      // a court added is said after the answer, by its name (R8, R46)
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        cs.set("courtAdded", a && a.kind === "body" && typeof a.label === "string" ? a.label : null);
      } },
  ],
};

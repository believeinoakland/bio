/* screens-settings R17 (DEC-201 (8)): Settings, every setting in one list. "Yours" first (your account, the assistant,
   your ties, your notes, your recovery codes), then, to a session that administers, "The group's" (your group, who your
   group is, members, places and offices, security, translations, wizards). Each entry is a reference to its screen, its
   name and purpose the registry screen's own words (`screen.<id>.name`, `.purpose`). It reads nothing of its own: the
   shell's `whoami` says whether the session administers (interface-shell R12). Every function is self-contained
   (interface-shell R21). */

export const settings = {
  id: "settings",

  reads() { return {}; },

  render(cs, view) {
    const W = cs.w, S = "screen.settings.";
    const me = view.me || {};
    const list = (ids) => `<ul class="cs-list" data-list="settings">${ids.map((id) => `<li><a class="cs-ref" href="/app/${id}" data-nav data-screen="${id}">${W("screen." + id + ".name")}</a> <span class="help">${W("screen." + id + ".purpose")}</span></li>`).join("")}</ul>`;
    const out = [cs.title(), cs.sec(S + "yours", list(["account", "connect", "ties", "notes", "recovery"]))];
    if (me.administer === true) out.push(cs.sec(S + "groups", list(["group", "group-identity", "members", "places", "security", "translations", "wizards"])));
    return out.join("");
  },

  acts: [],
};

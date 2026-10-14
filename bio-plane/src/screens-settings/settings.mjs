/* screens-settings R17 (DEC-201 (8)): Settings, every setting in one list. "Yours" first (your account, the assistant,
   your ties, your notes, your recovery codes), then, to a session that administers, "The group's" (your group, who your
   group is, members, places and offices, security, updates, translations, wizards). Each entry is a reference to its screen, its
   name and purpose the registry screen's own words (`screen.<id>.name`, `.purpose`). It reads nothing of its own: the
   shell's `whoami` says whether the session administers (interface-shell R12). Every function is self-contained
   (interface-shell R21). */

export const settings = {
  id: "settings",

  reads() { return {}; },

  render(cs, view) {
    const W = cs.w, S = "screen.settings.";
    const me = view.me || {};
    // the design's link list (R32): each section is its icon and its screen's name as the reference, its purpose beneath as a box of
    // its own, so the two never run together
    const ICON = { account: "subject", connect: "machine", ties: "group", notes: "case", recovery: "signed", group: "group", "group-identity": "group", members: "subject",
      places: "group", security: "status", updates: "changed", translations: "wizard", wizards: "wizard" };
    const I = (n) => `<svg class="i" aria-hidden="true"><use href="/app/assets/icons.svg#i-${n}"/></svg>`;
    const list = (ids) => `<div class="mk-links" data-list="settings">${ids.map((id) => `<a class="cs-ref" href="/app/${id}" data-nav data-screen="${id}">${I(ICON[id])}${W("screen." + id + ".name")}</a><span class="mk-small" data-purpose="${id}">${W("screen." + id + ".purpose")}</span>`).join("")}</div>`;
    const out = [cs.title(), cs.sec(S + "yours", list(["account", "connect", "ties", "notes", "recovery"]))];
    if (me.administer === true) out.push(cs.sec(S + "groups", list(["group", "group-identity", "members", "places", "security", "updates", "translations", "wizards"])));
    return out.join("");
  },

  acts: [],
};

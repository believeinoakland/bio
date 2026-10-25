/* screens-entry R5 (R32; and R8–R11): `reset`, "Choose a new password", in the public frame, at
   `/app/reset#reset=<link>`. The shell takes the fragment from the address on load (`view.fragment`, interface-shell
   R36's form) and the link travels only in the bodies of `passwordresetlook` and `passwordreset`; it is never drawn,
   stored or put in an address. States: the link live (for whom, until when), the password set, and the link dead
   (`RESET_LINK_DEAD`, one answer for every dead arm). The words it draws are filled whole (R32): the team's name, as
   `groupidentity` answers it publicly, or the unnamed-team word while none is set, never the short name.
   Self-contained (interface-shell R21). */

export const reset = {
  id: "reset",

  reads(view) {
    const link = view.fragment && typeof view.fragment.reset === "string" ? view.fragment.reset : "";
    return link ? { look: { op: "passwordresetlook", body: { link } }, identity: { op: "groupidentity" } } : {};
  },

  render(cs, view) {
    const W = cs.w, S = "screen.reset.";
    const ui = view.ui || {};
    const link = view.fragment && typeof view.fragment.reset === "string" ? view.fragment.reset : "";
    const look = (view.data || {}).look;
    // R32: the team's name for the words that take it; the unnamed-team word while none is set or the read did not answer
    const idr = (view.data || {}).identity;
    const named = idr && idr.state === "ok" && idr.value && typeof idr.value.display_name === "string" ? idr.value.display_name.trim() : "";
    const team = named || { html: W("screen.entry.group") };
    const back = (key) => `<div class="mk-acts"><a class="cs-btn" data-tone="primary" href="/app/front" data-nav>${W(key)}</a></div>`;
    if (ui.done) return cs.title() + `<p class="mk-sub">${W(S + "forhandle", { handle: ui.done.handle || "" })}</p><p class="cs-row" data-state="set">${W(S + "done")}</p>` + back("screen.entry.signin");
    const dead = !link || ui.dead || (look && look.state === "failed" && look.refusal && look.refusal.code === "RESET_LINK_DEAD")
      || (look && look.state === "ok" && look.value && look.value.live === false);
    if (dead) return `<h1 class="t-title">${W(S + "dead")}</h1><p class="cs-row" data-state="dead">${W(S + "dead.what")}</p>` + back("screen.entry.backtofront");
    return cs.title() + cs.state(look, (v) => {
      const handle = v.handle || "";
      const until = v.expiresAt || "";
      return `<p class="mk-sub">${until ? W(S + "for", { handle, date: { html: cs.date(until) } }) : W(S + "forhandle", { handle })}</p>`
        + cs.field("rs-pw", "screen.entry.newpassword", { type: "password", help: "screen.entry.twelve", autocomplete: "new-password" })
        + cs.field("rs-pw2", "screen.entry.again", { type: "password", autocomplete: "new-password" })
        + `<div class="mk-acts">${cs.act("passwordreset", { tone: "primary" })}</div><p class="mk-small">${W(S + "keeps", { name: team })}</p>`;
    });
  },

  acts: [
    // R5, R8: the link and the password in the body only, the password typed twice alike and 12 or more
    { op: "passwordreset", rereads: [],
      send(view, el, cs) {
        const link = view.fragment && typeof view.fragment.reset === "string" ? view.fragment.reset : "";
        const password = String(cs.value("rs-pw") || "");
        if (password !== String(cs.value("rs-pw2") || "")) return { refuse: "screen.entry.differ" };
        if (password.length < 12) return { refuse: "screen.entry.short" };
        return link ? { body: { link, password } } : null;
      },
      done(view, answer, cs) {
        const look = (view.data || {}).look;
        cs.set("done", { handle: look && look.value ? look.value.handle || "" : "" });
        return { stay: true };
      },
      refusals: {
        RESET_LINK_DEAD: (r, cs) => { cs.set("dead", true); return cs.w("screen.reset.dead.what"); },
        PASSWORD_TOO_SHORT: "refusal.PASSWORD_TOO_SHORT",
      } },
  ],
};

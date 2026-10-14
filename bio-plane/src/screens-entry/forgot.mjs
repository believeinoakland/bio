/* screens-entry R4 (and R8–R11): `forgot`, "Forgot your password", in the public frame. Three ways back in: one of the
   member's recovery codes (`recover`, the handle, the code and the new password in the body only, the password typed
   twice alike), an administrator's reset link, and, when no administrator can get in, the hosting account's way
   (`HOSTING_CONTROL`, instance-setup R47, whose words state the steps). Every refusal of a code is one sentence.
   Self-contained (interface-shell R21). */

export const forgot = {
  id: "forgot",

  reads() { return {}; },

  render(cs, view) {
    const W = cs.w, S = "screen.forgot.";
    const ui = view.ui || {};
    const out = [cs.title(), `<p class="cs-sub">${W(S + "lede")}</p>`];
    if (ui.done) {
      out.push(`<p class="cs-row" data-state="done">${W(S + "done", { remaining: String(ui.done.remaining) })}</p><p><a class="cs-btn" data-tone="primary" href="/app/front" data-nav>${W("screen.entry.signin")}</a></p>`);
    } else {
      out.push(cs.sec(S + "codes", cs.field("fg-handle", "screen.front.handle", { help: S + "handle.help", autocomplete: "username" })
        + cs.field("fg-code", S + "code", { help: S + "code.help", autocomplete: "off" })
        + cs.field("fg-pw", "screen.entry.newpassword", { type: "password", help: "screen.entry.twelve", autocomplete: "new-password" })
        + cs.field("fg-pw2", "screen.entry.again", { type: "password", autocomplete: "new-password" })
        + `<div class="cs-actrow">${cs.act("recover", { tone: "primary" })}</div>`));
    }
    out.push(cs.sec(S + "admin", `<p>${W(S + "admin.what")}</p>`));
    // the hosting account's way (R4): HOSTING_CONTROL's words, which state the steps, carried by key
    const hosting = [];
    for (let i = 1; i < 20; i++) { const k = "screen.hosting.s" + i; const t = W(k); if (t === k) break; hosting.push(`<p>${t}</p>`); }
    out.push(cs.sec(S + "hosting", `<p>${W(S + "hosting.what")}</p><div class="cs-note" id="hosting-control"><p><b>${W("screen.hosting.heading")}</b></p>${hosting.join("")}<p>${W("screen.hosting.guide")}</p></div>`));
    return out.join("");
  },

  acts: [
    // R4, R8: two passwords that differ send nothing; the handle, code and password in the body only
    { op: "recover", rereads: [],
      send(view, el, cs) {
        const handle = String(cs.value("fg-handle") || "").trim();
        const code = String(cs.value("fg-code") || "").trim();
        const password = String(cs.value("fg-pw") || "");
        if (!handle || !code) return { refuse: "screen.forgot.incomplete" };
        if (password !== String(cs.value("fg-pw2") || "")) return { refuse: "screen.entry.differ" };
        if (password.length < 12) return { refuse: "screen.entry.short" };
        return { body: { handle, code, password } };
      },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        cs.set("done", { remaining: a && Number.isFinite(Number(a.remaining)) ? Number(a.remaining) : 0 });
        return { stay: true };
      },
      // one sentence for every arm of a code that did not work (credentials R47, R71 (5)); the code cleared
      refusals: {
        RECOVERY_REFUSED: (r, cs) => { cs.fill("fg-code", ""); return cs.w("refusal.RECOVERY_REFUSED"); },
        PASSWORD_TOO_SHORT: "refusal.PASSWORD_TOO_SHORT",
        SIGN_IN_PAUSED: (r, cs) => {
          const s = r && r.stated && typeof r.stated === "object" ? r.stated.until || r.stated.at || r.stated.time : r && r.stated;
          const t = new Date(typeof s === "number" ? s : String(s || ""));
          const time = isNaN(t.getTime()) ? String(s || "") : String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0");
          return cs.w("refusal.SIGN_IN_PAUSED", { time });
        },
      } },
  ],
};

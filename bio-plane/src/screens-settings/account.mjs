/* screens-settings R3 (and R8, R10): Settings › Your account, the registry's 6 acts. The handle drawn fixed in DEC-197's
   words, with no act that changes it; the member's language; appearance and the explanation level (interface-shell R18,
   R17); the password, typed twice alike before it is sent; expertise; the member's own signing key (its public half, as
   the signing page gives it); links to `connect` and `notes`. Every function is self-contained (interface-shell R21).
   T47: appearance is the kit's own control (`cs.appearance()`, R12); "Sign out on this device" and "Sign out everywhere"
   (`signout`, `signouteverywhere`), each then drawing `front`'s signed-out state (R21); the signing key is made in the
   browser by the kit's signer (`cs.signer`, interface-shell R40) and its public line sent, nothing pasted (R22). */

export const account = {
  id: "account",

  reads(view) {
    const me = view.me || {};
    return {
      me: { op: "whoami" },
      language: { op: "memberlanguage" },
      expertise: { op: "expertiselist", query: { memberId: me.member } },
      signers: { op: "signerlist" },
    };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.account.";
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const data = view.data || {};
    const ui = view.ui || {};
    const me = data.me && data.me.state === "ok" && data.me.value ? data.me.value : view.me || {};
    const out = [cs.title()];

    // the handle, fixed (DEC-197): no act changes it, and nothing says "formerly"
    out.push(cs.sec(S + "handle.heading", `<p><b>${E(me.handle || me.member || "")}</b></p><p>${W("handle.fixed")}</p>`));

    // language, appearance and the explanation level
    let lang = cs.state(data.language, (v) => {
      let h = `<p data-state="language">${v.language ? W(S + "language.now", { language: v.language }) : W(S + "language.device")}</p>`;
      const set = cs.act("memberlanguageset");
      if (set) h += `<div class="cs-form"><label for="ma-lang">${W(S + "language.field")}</label><span class="help">${W(S + "language.help")}</span><input id="ma-lang" type="text" class="cs-input" value="${E(v.language || "")}" autocomplete="off">${set}</div>`;
      return h;
    });
    // appearance is kept on the device (interface-shell R18): the kit's own control (R12; interface-shell R27)
    lang += cs.appearance();
    // the explanation level is the shell's (R17): its value, and its act through the shell's own setting
    const lv = cs.level() === "pause" ? "pause" : "prompt";
    lang += `<div class="cs-form"><label for="ma-level">${W(S + "level.field")}</label><select id="ma-level" class="cs-input">${["prompt", "pause"].map((v) => `<option value="${v}"${v === lv ? " selected" : ""}>${W("level." + v + ".name")}</option>`).join("")}</select>${cs.act("infolevelset")}</div>`;
    out.push(cs.sec(S + "language.heading", lang));

    // what the member knows
    let ex = cs.state(data.expertise, (v) => {
      const list = (v.expertise || []).filter((e) => e.state !== "withdrawn");
      return list.length === 0 ? `<p>${W(S + "expertise.none")}</p>` : `<ul class="cs-list">${list.map((e) => `<li>${W(e.confirmed ? S + "expertise.confirmed" : S + "expertise.declared", { label: e.label })}</li>`).join("")}</ul>`;
    });
    const dec = cs.act("expertisedeclare");
    if (dec) ex += `<div class="cs-form"><label for="ma-exp">${W(S + "expertise.field")}</label><span class="help">${W(S + "expertise.help")}</span><input id="ma-exp" type="text" class="cs-input">${dec}</div>`;
    out.push(cs.sec(S + "expertise.heading", ex));

    // the password, typed twice alike (setup-page R3's rule); no field is drawn with what was typed (R10)
    const pw = cs.act("setpassword");
    // the fields drawn anew, empty, after each change (the shell keeps a field's value by its id; R10)
    const g = ui.pwGen || 0;
    if (pw) out.push(cs.sec(S + "password.heading", (ui.passwordChanged ? `<p data-shown="password">${W(S + "password.changed")}</p>` : "") + `<div class="cs-form"><label for="ma-cur${g}">${W(S + "password.current")}</label><input id="ma-cur${g}" type="password" class="cs-input" autocomplete="current-password">
<label for="ma-new${g}">${W(S + "password.new")}</label><span class="help">${W(S + "password.help")}</span><input id="ma-new${g}" type="password" class="cs-input" autocomplete="new-password">
<label for="ma-again${g}">${W(S + "password.again")}</label><input id="ma-again${g}" type="password" class="cs-input" autocomplete="new-password">${pw}</div>`));

    // the member's own signing key: its public half, registered or revoked (friction by weight, interface-shell R11)
    out.push(cs.sec(S + "key.heading", cs.state(data.signers, (v) => {
      const mine = (v.signers || []).filter((s) => s.member_id === me.member && s.status === "active");
      let h = mine.length === 0 ? `<p>${W(S + "key.none")}</p>` : `<ul class="cs-list">${mine.map((s) => `<li>${W(S + "key.held", { key: "…" + String(s.key_b64).slice(-8), date: D(s.added) })} ${cs.act("signerrevokeown", { data: { key: s.key_b64 } })}</li>`).join("")}</ul>`;
      // made in this browser by the kit's signer; only its public line is sent (R22)
      const reg = cs.act("signerregisterown");
      // kept on this device only when the member ticks it (interface-shell R40); else a key file is made
      if (reg) h += `<div class="cs-form"><p class="help">${W(S + "key.help")}</p><input type="checkbox" id="ma-keep"><label for="ma-keep">${W("signing.ceremony.keepkey")}</label>${reg}</div>`;
      return h;
    })));

    // signing out: on this device, or everywhere (R21)
    const out1 = cs.act("signout"), out2 = cs.act("signouteverywhere");
    if (out1 || out2) out.push(cs.sec(S + "signout.heading", out1 + out2));

    // elsewhere in the member's settings
    out.push(cs.sec(S + "elsewhere.heading", `<p><a href="/app/connect">${W("screen.connect.name")}</a></p><p><a href="/app/notes">${W("screen.notes.name")}</a></p>`));
    return out.join("");
  },

  acts: [
    { op: "memberlanguageset", rereads: ["language"],
      send(view, el, cs) { const t = String(cs.value("ma-lang") || "").trim(); return { body: { language: t || null } }; } },
    // the owed act `owed:infolevelset` (DEC-162), served by instance-setup R79: sent by the shell's own setting, which also
    // keeps the level on the device and redraws the frame (interface-shell R17), so nothing more is sent from here
    { op: "infolevelset", rereads: [],
      send(view, el, cs) { cs.setLevel(cs.value("ma-level") === "pause" ? "pause" : "prompt"); return null; } },
    { op: "expertisedeclare", rereads: ["expertise"],
      send(view, el, cs) { const label = String(cs.value("ma-exp") || "").trim(); return label ? { body: { label } } : { refuse: "screen.account.expertise.nolabel" }; } },
    // sent only when the new password is typed twice alike; neither is kept, drawn again or sent again (R10)
    { op: "setpassword", rereads: [],
      send(view, el, cs) {
        const g = (view.ui && view.ui.pwGen) || 0;
        const password = cs.value("ma-new" + g), again = cs.value("ma-again" + g);
        if (!password || password !== again) return { refuse: "screen.account.password.differ" };
        return { body: { current: String(cs.value("ma-cur" + g) || ""), password: String(password) } };
      },
      done(view, answer, cs) { cs.set("pwGen", ((view.ui && view.ui.pwGen) || 0) + 1); cs.set("passwordChanged", true); } },
    // the key made on this device by the kit's signer (interface-shell R40), its public line `ssh-ed25519 <base64>
    // <label>` sent as credentials R9 takes it; a member who declines sends nothing
    { op: "signerregisterown", rereads: ["signers"],
      async send(view, el, cs) {
        const line = await cs.signer.publicLine({ keep: cs.value("ma-keep") === true });
        const parts = String(line || "").trim().split(/\s+/);
        if (parts[0] !== "ssh-ed25519" || !/^AAAA[A-Za-z0-9+/=]+$/.test(parts[1] || "")) return { refuse: "screen.account.key.declined" };
        const comment = parts.slice(2).join(" ");
        return { body: comment ? { keyB64: parts[1], comment } : { keyB64: parts[1] } };
      } },
    { op: "signerrevokeown", rereads: ["signers"],
      send(view, el) { return { body: { keyB64: el.dataset.key } }; } },
    // then the shell draws `front`'s signed-out state, as the masthead's "Sign out" does (interface-shell R4, R32)
    { op: "signout", rereads: [],
      send() { return { body: {} }; },
      done(view, answer, cs) { cs.signedOut(); return { stay: true }; } },
    { op: "signouteverywhere", rereads: [],
      send() { return { body: {} }; },
      done(view, answer, cs) { cs.signedOut(); return { stay: true }; } },
  ],
};

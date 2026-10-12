/* screens-settings R3 (and R8, R10): Settings › Your account, the registry's 6 acts. The handle drawn fixed in DEC-197's
   words, with no act that changes it; the member's language; appearance and the explanation level (interface-shell R18,
   R17); the password, typed twice alike before it is sent; expertise; the member's own signing key (its public half, as
   the signing page gives it); links to `connect` and `notes`. Every function is self-contained (interface-shell R21). */

export const account = {
  id: "account",

  reads(view) {
    const me = view.me || {};
    return {
      me: { op: "whoami" },
      language: { op: "memberlanguage" },
      expertise: { op: "expertiselist", query: { memberId: me.member } },
      signers: { op: "signerlist" },
      level: { op: "infolevel" },
    };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.account.";
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const data = view.data || {};
    const ui = view.ui || {};
    const me = data.me && data.me.state === "ok" && data.me.value ? data.me.value : view.me || {};
    const out = [];

    // the handle, fixed (DEC-197): no act changes it, and nothing says "formerly"
    out.push(cs.sec(S + "handle.heading", `<p><b>${E(me.handle || me.member || "")}</b></p><p>${W("handle.fixed")}</p>`));

    // language, appearance and the explanation level
    let lang = cs.state(data.language, (v) => {
      let h = `<p data-state="language">${v.language ? W(S + "language.now", { language: v.language }) : W(S + "language.device")}</p>`;
      const set = cs.act("memberlanguageset");
      if (set) h += `<div class="cs-form"><label for="ma-lang">${W(S + "language.field")}</label><span class="help">${W(S + "language.help")}</span><input id="ma-lang" type="text" class="cs-input" value="${E(v.language || "")}" autocomplete="off">${set}</div>`;
      return h;
    });
    // appearance is kept on the device (interface-shell R18): the shell applies the choice it finds marked
    const ap = ui.appearance || "device";
    lang += `<div class="cs-form"><label for="ma-theme">${W(S + "appearance.field")}</label><select id="ma-theme" class="cs-input" data-device="appearance">${["device", "light", "dark"].map((v) => `<option value="${v}"${v === ap ? " selected" : ""}>${W(S + "appearance." + v)}</option>`).join("")}</select></div>`;
    const lv = data.level && data.level.state === "ok" && data.level.value && (data.level.value.level === "prompt" || data.level.value.level === "pause") ? data.level.value.level : ui.level === "pause" ? "pause" : "prompt";
    lang += `<div class="cs-form"><label for="ma-level">${W(S + "level.field")}</label><select id="ma-level" class="cs-input">${["prompt", "pause"].map((v) => `<option value="${v}"${v === lv ? " selected" : ""}>${W("level." + v + ".name")}</option>`).join("")}</select>${cs.act("infolevelset", { label: "act.owed_infolevelset.label.account" })}</div>`;
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
    if (pw) out.push(cs.sec(S + "password.heading", (ui.passwordChanged ? `<p data-shown="password">${W(S + "password.changed")}</p>` : "") + `<div class="cs-form"><label for="ma-cur">${W(S + "password.current")}</label><input id="ma-cur" type="password" class="cs-input" autocomplete="current-password">
<label for="ma-new">${W(S + "password.new")}</label><span class="help">${W(S + "password.help")}</span><input id="ma-new" type="password" class="cs-input" autocomplete="new-password">
<label for="ma-again">${W(S + "password.again")}</label><input id="ma-again" type="password" class="cs-input" autocomplete="new-password">${pw}</div>`));

    // the member's own signing key: its public half, registered or revoked (friction by weight, interface-shell R11)
    out.push(cs.sec(S + "key.heading", cs.state(data.signers, (v) => {
      const mine = (v.signers || []).filter((s) => s.member_id === me.member && s.status === "active");
      let h = mine.length === 0 ? `<p>${W(S + "key.none")}</p>` : `<ul class="cs-list">${mine.map((s) => `<li>${W(S + "key.held", { key: "…" + String(s.key_b64).slice(-8), date: D(s.added) })} ${cs.act("signerrevokeown", { data: { key: s.key_b64 } })}</li>`).join("")}</ul>`;
      const reg = cs.act("signerregisterown");
      if (reg) h += `<div class="cs-form"><label for="ma-pub">${W(S + "key.field")}</label><span class="help">${W(S + "key.help")}</span><input id="ma-pub" type="text" class="cs-input" autocomplete="off">${reg}</div>`;
      return h;
    })));

    // elsewhere in the member's settings
    out.push(cs.sec(S + "elsewhere.heading", `<p><a href="/app/connect">${W("screen.connect.name")}</a></p><p><a href="/app/notes">${W("screen.notes.name")}</a></p>`));
    return out.join("");
  },

  acts: [
    { op: "memberlanguageset", rereads: ["language"],
      send(view, el, cs) { const t = String(cs.value("ma-lang") || "").trim(); return { body: { language: t || null } }; } },
    // the owed act `owed:infolevelset` (DEC-162), served by instance-setup R79; the level also kept on the device
    { op: "infolevelset", rereads: ["level"],
      send(view, el, cs) { return { body: { level: cs.value("ma-level") === "pause" ? "pause" : "prompt" } }; },
      done(view, answer, cs) { cs.set("level", cs.value("ma-level") === "pause" ? "pause" : "prompt"); } },
    { op: "expertisedeclare", rereads: ["expertise"],
      send(view, el, cs) { const label = String(cs.value("ma-exp") || "").trim(); return label ? { body: { label } } : { refuse: "screen.account.expertise.nolabel" }; } },
    // sent only when the new password is typed twice alike; neither is kept, drawn again or sent again (R10)
    { op: "setpassword", rereads: [],
      send(view, el, cs) {
        const password = cs.value("ma-new"), again = cs.value("ma-again");
        if (!password || password !== again) return { refuse: "screen.account.password.differ" };
        return { body: { current: String(cs.value("ma-cur") || ""), password: String(password) } };
      },
      done(view, answer, cs) { cs.set("passwordChanged", true); } },
    { op: "signerregisterown", rereads: ["signers"],
      send(view, el, cs) {
        // the line the signing page gives, `ssh-ed25519 <base64> <label>`, or the base64 alone (credentials R9)
        const parts = String(cs.value("ma-pub") || "").trim().split(/\s+/);
        const b64 = parts[0] === "ssh-ed25519" ? parts[1] : parts[0];
        if (!b64 || !/^AAAA[A-Za-z0-9+/=]+$/.test(b64)) return { refuse: "screen.account.key.bad" };
        const comment = (parts[0] === "ssh-ed25519" ? parts.slice(2) : parts.slice(1)).join(" ");
        return { body: comment ? { keyB64: b64, comment } : { keyB64: b64 } };
      } },
    { op: "signerrevokeown", rereads: ["signers"],
      send(view, el) { return { body: { keyB64: el.dataset.key } }; } },
  ],
};

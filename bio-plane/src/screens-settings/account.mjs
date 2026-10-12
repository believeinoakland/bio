/* screens-settings R3 (and R8): Settings › Your account, the registry's 6 acts. The handle drawn fixed in DEC-197's
   words, with no act that changes it; the member's language; appearance and the explanation level (interface-shell R18,
   R17); the password, typed twice alike before it is sent; expertise; the member's own signing key (its public half,
   as the signing page gives it); links to `connect` and `notes`. Every function is self-contained (K2854 T1). */

export const account = {
  id: "account",

  reads(ctx) {
    const me = ctx.me || {};
    return [
      { name: "me", op: "whoami" },
      { name: "language", op: "memberlanguage" },
      { name: "expertise", op: "expertiselist", query: { memberId: me.member } },
      { name: "signers", op: "signerlist" },
      { name: "level", op: "infolevel" },
    ];
  },

  render(cs, d, ctx) {
    const W = cs.w, E = cs.esc, S = "screen.account.";
    const ok = (o) => o && o.state === "ok" && o.value && o.value.ok !== false;
    const failed = (o) => cs.state(o.state === "ok" ? { state: "failed", refusal: o.value } : o);
    const form = (inner) => `<div class="cs-form" data-form>${inner}</div>`;
    const sec = (key, inner) => `<section class="cs-section"><h2>${W(key)}</h2>${inner}</section>`;
    const me = ok(d.me) ? d.me.value : ctx.me || {};
    const out = [`<h1>${W("screen.account.name")}</h1>`];

    // the handle, fixed (DEC-197): no act changes it, and nothing says "formerly"
    out.push(sec(S + "handle.heading", d.me.state === "ok" || ctx.me ? `<p><b>${E(me.handle || me.member || "")}</b></p><p>${W("handle.fixed")}</p>` : failed(d.me)));

    // language, appearance and the explanation level
    let lang = "";
    if (!ok(d.language)) lang = failed(d.language);
    else {
      const l = d.language.value.language;
      lang = `<p data-state="language">${l ? W(S + "language.now", { language: l }) : W(S + "language.device")}</p>`;
      const set = cs.act("memberlanguageset", { subject: "language", screen: "account" });
      if (set) lang += form(`<label for="ma-lang">${W(S + "language.field")}</label><span class="help">${W(S + "language.help")}</span><input id="ma-lang" name="language" type="text" class="cs-input" value="${E(l || "")}" autocomplete="off">${set}`);
    }
    const ap = ctx.appearance || "device";
    lang += `<div class="cs-form"><label for="ma-theme">${W(S + "appearance.field")}</label><select id="ma-theme" name="appearance" class="cs-input" data-device="appearance">${["device", "light", "dark"].map((v) => `<option value="${v}"${v === ap ? " selected" : ""}>${W(S + "appearance." + v)}</option>`).join("")}</select></div>`;
    const level = ok(d.level) && (d.level.value.level === "prompt" || d.level.value.level === "pause") ? d.level.value.level : ctx.level === "pause" ? "pause" : "prompt";
    const lv = cs.act("infolevelset", { subject: "level", label: "act.owed_infolevelset.label.account", screen: "account" });
    lang += form(`<label for="ma-level">${W(S + "level.field")}</label><select id="ma-level" name="level" class="cs-input">${["prompt", "pause"].map((v) => `<option value="${v}"${v === level ? " selected" : ""}>${W("level." + v + ".name")}</option>`).join("")}</select>${lv}`);
    out.push(sec(S + "language.heading", lang));

    // what the member knows
    let ex = "";
    if (!ok(d.expertise)) ex = failed(d.expertise);
    else {
      const list = (d.expertise.value.expertise || []).filter((e) => e.state !== "withdrawn");
      ex = list.length === 0 ? `<p>${W(S + "expertise.none")}</p>` : `<ul class="cs-list">${list.map((e) => `<li>${W(e.confirmed ? S + "expertise.confirmed" : S + "expertise.declared", { label: e.label })}</li>`).join("")}</ul>`;
    }
    const dec = cs.act("expertisedeclare", { subject: "expertise", screen: "account" });
    if (dec) ex += form(`<label for="ma-exp">${W(S + "expertise.field")}</label><span class="help">${W(S + "expertise.help")}</span><input id="ma-exp" name="label" type="text" class="cs-input">${dec}`);
    out.push(sec(S + "expertise.heading", ex));

    // the password, typed twice alike (setup-page R3's rule)
    const pw = cs.act("setpassword", { subject: "password", screen: "account" });
    if (pw) out.push(sec(S + "password.heading", (ctx.shown && ctx.shown.password ? `<p data-shown="password">${W(S + "password.changed")}</p>` : "") + form(`<label for="ma-cur">${W(S + "password.current")}</label><input id="ma-cur" name="current" type="password" class="cs-input" autocomplete="current-password">
<label for="ma-new">${W(S + "password.new")}</label><span class="help">${W(S + "password.help")}</span><input id="ma-new" name="password" type="password" class="cs-input" autocomplete="new-password">
<label for="ma-again">${W(S + "password.again")}</label><input id="ma-again" name="again" type="password" class="cs-input" autocomplete="new-password">${pw}`)));

    // the member's own signing key: its public half, registered or revoked (friction by weight, the shell's R11)
    let sk = "";
    if (!ok(d.signers) && !(d.signers.state === "ok" && Array.isArray(d.signers.value.signers))) sk = failed(d.signers);
    else {
      const mine = (d.signers.value.signers || []).filter((s) => s.member_id === me.member && s.status === "active");
      sk = mine.length === 0 ? `<p>${W(S + "key.none")}</p>` : `<ul class="cs-list">${mine.map((s) => `<li>${W(S + "key.held", { key: "…" + String(s.key_b64).slice(-8), date: cs.dateText(s.added) })}${form(cs.act("signerrevokeown", { subject: s.key_b64, screen: "account" }))}</li>`).join("")}</ul>`;
      const reg = cs.act("signerregisterown", { subject: "key", screen: "account" });
      if (reg) sk += form(`<label for="ma-pub">${W(S + "key.field")}</label><span class="help">${W(S + "key.help")}</span><input id="ma-pub" name="publicKey" type="text" class="cs-input" autocomplete="off">${reg}`);
    }
    out.push(sec(S + "key.heading", sk));

    // elsewhere in the member's settings
    out.push(sec(S + "elsewhere.heading", `<p><a href="/app/connect">${W("screen.connect.name")}</a></p><p><a href="/app/notes">${W("screen.notes.name")}</a></p>`));
    return out.join("");
  },

  acts: [
    { op: "memberlanguageset", rereads: ["language"],
      args(f) { const t = String(f.language || "").trim(); return { body: { language: t || null } }; } },
    { op: "infolevelset", rereads: ["level"],
      args(f) { return { body: { level: f.level === "pause" ? "pause" : "prompt" } }; },
      after(a, ctx, d, f) { return { device: { level: f.level === "pause" ? "pause" : "prompt" } }; } },
    { op: "expertisedeclare", rereads: ["expertise"], clears: ["label"],
      args(f) { const label = String(f.label || "").trim(); return label ? { body: { label } } : { hold: "screen.account.expertise.nolabel" }; } },
    // sent only when the new password is typed twice alike; neither is kept, drawn again or sent again (R10)
    { op: "setpassword", rereads: [], clears: ["current", "password", "again"],
      args(f) {
        if (!f.password || f.password !== f.again) return { hold: "screen.account.password.differ" };
        return { body: { current: String(f.current || ""), password: String(f.password) } };
      },
      after() { return { show: { password: true } }; } },
    { op: "signerregisterown", rereads: ["signers"], clears: ["publicKey"],
      args(f) {
        // the line the signing page gives: `ssh-ed25519 <base64> <label>`, or the base64 alone
        const parts = String(f.publicKey || "").trim().split(/\s+/);
        const b64 = parts[0] === "ssh-ed25519" ? parts[1] : parts[0];
        if (!b64 || !/^AAAA[A-Za-z0-9+/=]+$/.test(b64)) return { hold: "screen.account.key.bad" };
        const comment = parts[0] === "ssh-ed25519" ? parts.slice(2).join(" ") : parts.slice(1).join(" ");
        return { body: comment ? { keyB64: b64, comment } : { keyB64: b64 } };
      } },
    { op: "signerrevokeown", rereads: ["signers"],
      args(f, ctx, d, subject) { return { body: { keyB64: subject } }; } },
  ],
};

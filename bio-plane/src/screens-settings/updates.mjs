/* screens-settings R27 (T48; N1047; DEC-226 (2), (3); K3158; instance-setup R89, R90): Settings › Updates, administrators
   only. It reads `updatenotice` and draws what runs now (its release, when it was installed and who allowed it, when
   the last check was), the release ready to install with its mark for a security fix, its signature and its notes in
   three parts (plain text, HTML-escaped, never markup), and the earlier releases. An administrator who holds the
   group's hosting account has Update (`updatestart`, which opens the installer's update page in a new browsing context
   on its answer); any other administrator has the hand-off (the address `updatestart` answers, to copy and pass on,
   since the installer runs only with the hosting account's consent); every administrator has Not now (`updatelater`)
   and, under a disclosure, Skip this version (`updateskip`, reasoned). A failed read is drawn failed, never as nothing
   to install. For a member who does not administer it reads nothing and says the screen is administrators'. Every
   function is self-contained (interface-shell R21). */

export const updates = {
  id: "updates",

  reads(view) {
    // `updatenotice` is refused to anyone who does not administer (instance-setup R89), so it is not asked
    if (!(view.me && view.me.administer === true)) return {};
    return { notice: { op: "updatenotice" } };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.updates.";
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const me = view.me || {};
    const ui = view.ui || {};
    const data = view.data || {};
    const out = [cs.title()];
    if (me.administer !== true) { out.push(`<p data-state="admins">${W(S + "admins")}</p>`); return out.join(""); }
    // who allowed or skipped a release, as plain text for a word's fill: a value recorded at setup or by the system is
    // "set at setup", never a credential's name (R33)
    const T = (k) => String(W(k)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const by = (x) => { const id = String(x || "").replace(/^member:/, ""); return id === "" || id === "admin" || /^(token|class):/.test(id) ? T("settings.set.setup") : id; };
    const secure = (r) => (r.security === true ? ` <span class="cs-risk" data-risk="raised" tabindex="0" data-level="1" data-tip="${W("updates.ready.security_says")}">${W("updates.ready.security")}</span>` : "");

    out.push(cs.state(data.notice, (v) => {
      let h = "";
      const run = v.running;
      if (run && run.version) {
        const rows = [cs.row("", `${W("updates.running.release", { version: run.version, date: D(run.installed_at), who: by(run.allowed_by) })}`)];
        if (v.last_check && v.last_check.at) rows.push(cs.row("", W("updates.running.checked", { when: D(v.last_check.at) }), "", W("updates.running.checked_note")));
        h += cs.sec("updates.running.head", cs.sheet(rows.join("")));
      }

      // the release ready, and the choice
      const r = v.ready;
      if (r && r.version) {
        const notes = r.notes || {};
        const part = (key, text) => (typeof text === "string" && text.trim() ? `<dt>${W(key)}</dt><dd>${E(text)}</dd>` : "");
        let body = cs.sheet(cs.row("", `${W("updates.ready.release", { version: r.version, date: D(r.date) })}${secure(r)}`, "", W("updates.ready.signed")));
        const parts = part("updates.notes.members", notes.members) + part("updates.notes.admins", notes.administrators) + part("updates.notes.must", notes.must_do);
        if (parts) body += `<dl class="mk-dl">${parts}</dl>`;
        body += `<p class="mk-note">${W("updates.notes.plain")}</p>`;
        const holds = v.viewer_holds === true;
        const holderRec = v.holder && typeof v.holder === "object" ? v.holder : null;
        const holder = typeof v.holder === "string" ? v.holder : holderRec ? holderRec.holders || holderRec.name || holderRec.handle || "" : "";
        const later = cs.act("updatelater", { label: "updates.act.later", data: { version: r.version } });
        if (holds) {
          const go = cs.act("updatestart", { label: "updates.act.update", tone: "primary", outward: true, data: { version: r.version } });
          // the installer's page, opened in a new browsing context once the act answers (no opener, no referrer)
          const open = ui.address ? `<p data-shown="update"><a href="${E(ui.address)}" target="_blank" rel="noopener noreferrer">${W("updates.act.update")}</a></p>` : "";
          body += `<div class="cs-actrow">${go}${later}</div>${open}`;
        } else {
          // any other administrator: the address to pass to whoever holds the hosting account
          const link = ui.address ? `<div class="cs-sheet"><span class="id">${E(ui.address)}</span>${cs.copy(ui.address, { label: "updates.handoff.copy" })}</div>`
            : cs.act("updatestart", { label: "updates.handoff.copy", data: { version: r.version, handoff: "1" } });
          body += `<h3>${W("updates.handoff.head")}</h3>${holder ? `<p class="mk-note">${W("updates.handoff.says", { holder })}</p>` : ""}${link}${holder ? `<p class="mk-small">${W("updates.handoff.for", { holder })}</p>` : ""}<p class="mk-small">${W("updates.handoff.explain", { version: r.version })}</p><div class="cs-actrow">${later}</div>`;
        }
        // skipping, under a disclosure: reasoned
        const skip = cs.act("updateskip", { label: "updates.act.skip_with_reason", data: { version: r.version } });
        if (skip) body += `<details class="mk-details"><summary>${W("updates.act.skip")}</summary><p class="mk-note">${W("updates.skip.says", { version: r.version })}</p>${cs.field("up-skipwhy", "updates.skip.why", { rec: true, max: 1000 })}${skip}</details>`;
        h += cs.sec("updates.ready.head", body);
      } else h += cs.sec("updates.ready.head", `<p data-state="none">${W("updates.none")}</p>`);

      // the earlier releases
      const earlier = Array.isArray(v.earlier) ? v.earlier : [];
      if (earlier.length) h += cs.sec("updates.earlier.head", cs.sheet(earlier.map((e) => cs.row("", e.skipped_at
        ? W("updates.earlier.skipped", { version: e.version, date: D(e.skipped_at), who: by(e.skipped_by), reason: e.reason || "" })
        : W("updates.earlier.installed", { version: e.version, date: D(e.installed_at), who: by(e.allowed_by) }))).join("")));
      return h;
    }));
    return out.join("");
  },

  acts: [
    // Update: the answer's address is offered to open in a new browsing context; for the hand-off it is the link to copy
    { op: "updatestart", rereads: ["notice"], outward: true,
      send(view, el) { return { body: { version: el.dataset.version } }; },
      done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (a && typeof a.address === "string" && /^https:\/\//.test(a.address)) cs.set("address", a.address);
      } },
    { op: "updatelater", rereads: ["notice"],
      send(view, el) { return { body: { version: el.dataset.version } }; } },
    // the administrator's own reason, one line of 1 to 1,000 characters, every administrator will see it
    { op: "updateskip", rereads: ["notice"], reasonField: "reason",
      send(view, el, cs) {
        const reason = String(cs.value("up-skipwhy") || "").replace(/\s+/g, " ").trim();
        return reason && reason.length <= 1000 ? { body: { version: el.dataset.version, reason } } : { refuse: "screen.updates.skip.noreason" };
      } },
  ],
};

/* screens-settings R27 (T48; N1047; DEC-226 (2), (3); K3158; instance-setup R89, R90): Settings › Updates, administrators
   only. It reads `updatenotice` and draws what runs now (its release, when it was installed and who allowed it, when
   the last check was), the release ready to install with its mark for a security fix, its signature and its notes in
   three parts (plain text, HTML-escaped, never markup), and the earlier releases. An administrator who holds the
   group's hosting account has Update (`updatestart`, which opens the installer's update page in a new browsing context
   on its answer); any other administrator has the hand-off (the address `updatestart` answers, to copy and pass on,
   since the installer runs only with the hosting account's consent); every administrator has Not now (`updatelater`)
   and, under a disclosure, Skip this version (`updateskip`, reasoned). A failed read is drawn failed, never as nothing
   to install. For a member who does not administer it reads nothing and says the screen is administrators'. Every
   function is self-contained (interface-shell R21).
   T51 FR-25 (R68, R73; C82, T-08; DEC-376, DEC-384): "How your copy is doing": the check (`selftest`), what each part runs (`bootstrap`'s
   `memberVersions`) and what running costs (`runtime`), each drawn from its own answer when the administrator asks; and a release no
   member recorded is drawn without a claim about setup unless it is the release installed at setup. The parts are named, and their
   states and the measured work sentences read, by the design's words (DEC-387); a ceiling not yet learned by a refusal is not drawn. */

export const updates = {
  id: "updates",

  reads(view) {
    // `updatenotice` is refused to anyone who does not administer (instance-setup R89), so it is not asked; they are told whose
    // screen it is, by the administrators' handles (the roster a member reads)
    if (!(view.me && view.me.administer === true)) return { roster: { op: "memberlist" } };
    // the set-up release and its day are `updatenotice`'s `setup` (instance-setup R106), the one the copy was set up with (R81)
    return { notice: { op: "updatenotice" } };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.updates.";
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const me = view.me || {};
    const ui = view.ui || {};
    const data = view.data || {};
    const out = [cs.title()];
    if (me.administer !== true) {
      out.push(cs.state(data.roster, (v) => {
        const admins = (Array.isArray(v.members) ? v.members : []).filter((m) => m.role === "admin" && m.status === "active")
          .map((m) => (m.founder === true || m.member_id === "admin" ? m.handle || String(W("member.founder.unnamed")).replace(/&(amp|lt|gt|quot|#39);/g, (x, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])) : m.handle || m.member_id));
        return admins.length ? `<p data-state="admins">${W(S + "admins", { admins: admins.join(", ") })}</p>` : "";
      }));
      return out.join("");
    }
    // who allowed or skipped a release, as plain text for a word's fill (R37: every fill filled). A member by their handle; the founder
    // by hers while her own session answers it. An install with no member behind it (setup, the founder before she has a handle, a
    // token or a seed) has no one to name: it is drawn by the `_setup` words, never as "allowed by set at setup" (R33, R37)
    const T = (k) => String(W(k)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const who = (x) => {
      const id = String(x || "").replace(/^member:/, "");
      if (id === "" || /^(token|class):/.test(id) || ["daemon", "system", "seed", "bootstrap"].indexOf(id) >= 0) return null;
      if (id === "admin") return me.member === "admin" && me.handle ? me.handle : null;
      return cs.memberName(id);
    };
    // R68: the three reports of the copy. Each is asked by its own act and drawn from the answer it gave; a part is named as the answer names it
    // (record data), and a number is the answer's own. A sentence the design has no word for is not drawn (the job REPORTs it)
    const H = "screen.updates.health.";
    const icon = (k) => (typeof cs.icon === "function" ? cs.icon(k) : "");
    const num = (x) => (typeof x === "number" && Number.isFinite(x) ? String(Math.round(x * 100) / 100) : "");
    const data1 = (x) => `<span class="mk-data">${E(String(x))}</span>`;
    const healthOf = () => {
      let hb = `<div>${cs.act("selftest", { label: H + "check" })}</div>`;
      const hv = ui.health || null;
      if (hv) {
        const rows = [cs.row(icon("accepted"), W(H + "store"))];
        if (hv.captures === "read-write ok") rows.push(cs.row(icon("accepted"), W(H + "file.test")));
        if (hv.captures === "not configured") rows.push(cs.row(icon("undetermined"), W(H + "captures.off")));
        hb += cs.sheet(rows.join(""));
      }
      hb += `<p class="mk-note">${W(H + "check.note")} ${W(H + "check.next")}</p>`;
      hb += `<div>${cs.act("bootstrap", { label: H + "parts.act" })}</div>`;
      const pv = ui.parts || null;
      if (pv) {
        // a part is named by the design's words under bootstrap's own id, else as the answer names it; its state by the design's words, any other as the answer gives it
        const NAMES = { "agent-worker": W(H + "part.agent-worker"), "pdf-worker": W(H + "part.pdf-worker"), "ocr-worker": W(H + "part.ocr-worker"), "sheet-worker": W(H + "part.sheet-worker"), "file-scanner": W(H + "part.file-scanner"), "agent-runner": W(H + "part.agent-runner") };
        const release = (r) => (r.version ? W(H + "part.release", { version: String(r.version) }) : "");
        const rows = Object.entries(pv).filter(([, r]) => r && typeof r === "object").map(([part, r]) => {
          const name = Object.hasOwn(NAMES, part) ? NAMES[part] : data1(part);
          return r.state === "SERVING" ? cs.row(icon("accepted"), `${name} · ${W(H + "part.state.answering")} · ${release(r)}`)
            : r.state === "SILENT" ? cs.row(icon("refused"), `${name} · ${W(H + "part.silent")}`)
              : r.state === "UNBOUND" ? cs.row(icon("undetermined"), `${name} · ${W(H + "part.state.unbound")}`)
                : r.state === "MISNAMED" ? cs.row(icon("undetermined"), `${name} · ${W(H + "part.state.misnamed")}${r.name ? " " + data1(r.name) : ""}${r.version ? " · " + release(r) : ""}`)
                  : cs.row(icon("undetermined"), `${name} · ${W(H + "part.other")} ${data1(r.state)}`);
        });
        hb += cs.sheet(rows.join("")) + `<p class="mk-note">${W(H + "parts.note")} ${W(H + "parts.next")}</p>`;
      }
      hb += `<div>${cs.act("runtime", { label: H + "runtime.act" })}</div>`;
      const rv = ui.runtime || null;
      if (rv) {
        const metrics = rv.measured && Array.isArray(rv.measured.metrics) ? rv.measured.metrics : [];
        // a measurement is said in the unit it was recorded in, by its key (DEC-389: `ms`, `bytes`); a unit with no key draws the metric's name and its count of samples only, never a figure with a bare number or the raw token. The subrequests ceiling is a count, with no unit
        // the units the runtime answers (instance-setup R34), each said by its key `screen.updates.health.runtime.unit.<code>` (DEC-389)
        const UNIT_KEYS = ["ms", "bytes"];
        const rows = metrics.map((m) => (UNIT_KEYS.includes(m.unit)
          ? cs.row(icon("status"), data1(m.metric), "", `${W(H + "runtime.heaviest", { peak: num(m.peak), unit: T(H + "runtime.unit." + m.unit) })} · ${W(H + "runtime.average", { mean: num(m.mean), unit: T(H + "runtime.unit." + m.unit) })} · ${W(H + "runtime.samples", { samples: num(m.samples) })}`)
          : cs.row(icon("status"), data1(m.metric), "", W(H + "runtime.samples", { samples: num(m.samples) }))));
        const ceiling = rv.subrequests && Number.isFinite(rv.subrequests.observed) ? String(rv.subrequests.observed) : "";
        hb += cs.sheet(rows.join("") + (ceiling ? cs.row(icon("status"), W(H + "runtime.limits", { ceiling })) : "") + cs.row(icon("status"), W(H + "runtime.cpu"))) + `<p class="mk-note">${W(H + "runtime.note")}</p>`;
      }
      return hb;
    };

    const secure = (r) => (r.security === true ? ` <span class="cs-risk" data-risk="raised" tabindex="0" data-level="1" data-tip="${W("updates.ready.security_says")}">${W("updates.ready.security")}</span>` : "");

    out.push(cs.state(data.notice, (v) => {
      let h = "";
      // the set-up release is `updatenotice`'s `setup`, the oldest running release (R81), never bootstrap's `installed_at`, which is the
      // running release's first sighting; a release with no member behind it that is the set-up release says so (R73)
      const set = v.setup && typeof v.setup === "object" ? v.setup : null;
      const setupAt = set && typeof set.installed_at === "string" && set.installed_at ? set.installed_at : null;
      const isSetup = (version) => set !== null && version === set.version;
      const run = v.running;
      if (run && run.version) {
        const by = who(run.allowed_by);
        // a member by their handle; no member behind it: the setup release says it was set up, a later one only its own date (R73)
        const line = by ? W("updates.running.release", { version: run.version, date: D(run.installed_at), who: by })
          : isSetup(run.version) ? W("updates.running.release_setup", { version: run.version, date: D(run.installed_at) })
            : W("updates.running.release_noactor", { version: run.version, date: D(run.installed_at) });
        const rows = [cs.row("", line)];
        // the one set-up date, apart from any release, unless the release's own line already says it
        if (setupAt && !(!by && isSetup(run.version))) rows.push(cs.row("", W("updates.running.setup_on", { date: D(setupAt) })));
        if (v.last_check && v.last_check.at) rows.push(cs.row("", W("updates.running.checked", { when: D(v.last_check.at) }), "", W("updates.running.checked_note")));
        h += cs.sec("updates.running.head", cs.sheet(rows.join("")));
      }

      // how the copy is doing (R68): the check, what each part runs, what running costs, each from its own answer
      h += cs.sec("screen.updates.health.head", healthOf(), { help: "screen.updates.health.help" });

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
          const open = ui.address ? `<div class="mk-links" data-shown="update"><a class="cs-ref" href="${E(ui.address)}" target="_blank" rel="noopener noreferrer">${W("updates.act.update")}</a></div>` : "";
          body += `<div>${go}${later}</div>${open}`;
        } else {
          // any other administrator: the address to pass to whoever holds the hosting account
          const link = ui.address ? `<div class="cs-sheet"><span>${E(ui.address)}</span>${cs.copy(ui.address, { label: "updates.handoff.copy" })}</div>`
            : cs.act("updatestart", { label: "updates.handoff.copy", data: { version: r.version, handoff: "1" } });
          body += `<h3>${W("updates.handoff.head")}</h3>${holder ? `<p class="mk-note">${W("updates.handoff.says", { holder })}</p>` : ""}${link}${holder ? `<p class="mk-small">${W("updates.handoff.for", { holder })}</p>` : ""}<p class="mk-small">${W("updates.handoff.explain", { version: r.version })}</p><div>${later}</div>`;
        }
        // skipping, under a disclosure: reasoned
        const skip = cs.act("updateskip", { label: "updates.act.skip_with_reason", data: { version: r.version } });
        if (skip) body += `<details class="mk-details"><summary>${W("updates.act.skip")}</summary><p class="mk-note">${W("updates.skip.says", { version: r.version })}</p>${cs.field("up-skipwhy", "updates.skip.why", { rec: true, max: 1000 })}${skip}</details>`;
        h += cs.sec("updates.ready.head", body);
      } else h += cs.sec("updates.ready.head", `<p data-state="none">${W("updates.none")}</p>`);

      // the earlier releases
      const earlier = Array.isArray(v.earlier) ? v.earlier : [];
      if (earlier.length) h += cs.sec("updates.earlier.head", cs.sheet(earlier.map((e) => cs.row("", e.skipped_at
        // a skip is a member's act: the founder with no handle yet is `member.founder.unnamed`, never `admin`
        ? W("updates.earlier.skipped", { version: e.version, date: D(e.skipped_at), who: who(e.skipped_by) || T(String(e.skipped_by || "").replace(/^member:/, "") === "admin" ? "member.founder.unnamed" : "settings.set.system"), reason: e.reason || "" })
        : who(e.allowed_by) ? W("updates.earlier.installed", { version: e.version, date: D(e.installed_at), who: who(e.allowed_by) })
          : isSetup(e.version) ? W("updates.earlier.installed_setup", { version: e.version, date: D(e.installed_at) })
            : W("updates.earlier.installed_noactor", { version: e.version, date: D(e.installed_at) }))).join("")));
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
    // the copy's own check: a read, drawn from its answer; a problem is the answer refused, and drawn in its fold beside the act (R68)
    { op: "selftest", rereads: [],
      send() { return {}; },
      done(view, answer, cs) { const a = answer && answer.result !== undefined ? answer.result : answer; cs.set("health", { ok: !!(a && a.ok !== false), captures: a && a.captures }); },
      refusals: { "500": (r, cs) => `<details class="mk-details" open><summary>${cs.w("screen.updates.health.refused.head")}</summary><div class="cs-gap" data-gap="refused"><span>${cs.w("screen.updates.health.refused.store")} ${cs.w("screen.updates.health.refused.next")}</span></div></details>` } },
    // what each part of the copy runs: `bootstrap` asked for the members' own builds (instance-setup R17)
    { op: "bootstrap", rereads: [],
      send() { return { query: { members: "1" } }; },
      done(view, answer, cs) { const a = answer && answer.result !== undefined ? answer.result : answer; cs.set("parts", a && a.memberVersions && typeof a.memberVersions === "object" ? a.memberVersions : {}); } },
    // what running costs: the instance's measurements (instance-setup R37)
    { op: "runtime", rereads: [],
      send() { return {}; },
      done(view, answer, cs) { const a = answer && answer.result !== undefined ? answer.result : answer; cs.set("runtime", a && typeof a === "object" ? a : {}); } },
    { op: "updatelater", rereads: ["notice"],
      send(view, el) { return { body: { version: el.dataset.version } }; } },
    // the administrator's own reason, one line of 1 to 1,000 characters, every administrator will see it
    { op: "updateskip", rereads: ["notice"], reasonField: "reason",
      send(view, el, cs) {
        const reason = String(cs.value("up-skipwhy") || "").replace(/\s+/g, " ").trim();
        return reason && reason.length <= 1000 ? { body: { version: el.dataset.version, reason } } : { refuse: "refusal.UPDATE_SKIP_NO_REASON" };
      } },
  ],
};

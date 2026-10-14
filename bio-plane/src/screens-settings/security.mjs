/* screens-settings R15 (N897 (1); N703, its share; N710; DEC-165, DEC-166, DEC-168, DEC-169): Settings › Security, an
   administrator's screen; any other member is told only that it is administrators'. The level over the period the
   administrator chooses (`securitymap`, credentials R45, read again by "Show the level for a period"), drawn by kind
   against its usual, naming no address, country, role or member; what is built in, said only as `bootstrap`'s
   `part_scanner` and `part_safe_view` answer it (instance-setup R82; setup-page R30's rule); the scanner's queue
   (`scanstatus`); the tools held (`securitytools`) and what happened to them (`securitytoolevents`); and the catalogue
   (`securitytoolcatalogue`), each entry's panel showing what the tool is sent and keeps, asking only what its `config`
   lists by its labels, its credentials in the request's body only and never drawn again, the vendor's keeping of files
   confirmed where it keeps them, "every file" offered only for a tool on the organization's own servers, and the shown
   handling's digest sent (`securitytooladd`, file-safety R28), then tested (`securitytooltest`), saying whether it is
   on or why it stays off. Every refusal is the owner's own words. Every function is self-contained (interface-shell
   R21). */

export const security = {
  id: "security",

  reads(view) {
    if (!(view.me && view.me.administer === true)) return {};
    const ui = view.ui || {};
    // the period chosen, else the last seven days
    const to = ui.period ? ui.period.to : new Date(Math.floor(Date.now() / 3600000) * 3600000).toISOString();
    const from = ui.period ? ui.period.from : new Date(Date.parse(to) - 7 * 86400000).toISOString();
    return {
      map: { op: "securitymap", query: { from, to } },
      boot: { op: "bootstrap" },
      scan: { op: "scanstatus" },
      tools: { op: "securitytools", empty: (v) => !(v.tools || []).some((t) => t.state !== "removed") },
      events: { op: "securitytoolevents", query: { limit: "50" }, empty: (v) => !(v.events || []).length },
      catalogue: { op: "securitytoolcatalogue", empty: (v) => !(v.offered || []).length },
    };
  },

  render(cs, view) {
    const W = cs.w, E = cs.esc, S = "screen.security.";
    const T = (k, f) => String(W(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const D = (iso) => String(cs.date(iso, { year: true })).replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    const me = view.me || {};
    const out = [cs.title()];
    if (me.administer !== true) { out.push(`<p data-state="admins">${W(S + "admins")}</p>`); return out.join(""); }
    const ui = view.ui || {};
    const data = view.data || {};
    const KINDS = ["signin", "credential", "rate", "handover", "through"];
    const onOwn = (r) => typeof r === "string" && (/^the organization\b/i.test(r.trim()) || /^[^,(]+\(the organization's own [^)]+\)$/i.test(r.trim()));

    // the level for the period, by kind against its usual; counts only
    out.push(cs.sec(S + "level.heading", cs.state(data.map, (v) => {
      const t = v.totals || {};
      const sum = (k) => (v.buckets || []).reduce((n, b) => n + (Number(b.counts && b.counts[k]) || 0), 0);
      const usual = (k) => (v.buckets || []).reduce((n, b) => n + (Number(b.usual && b.usual[k]) || 0), 0);
      const lvl = ["Ordinary", "Raised", "High"].indexOf(v.level) >= 0 ? v.level.toLowerCase() : "ordinary";
      // no count is drawn at zero (R28): a kind with neither a count nor a usual is left out
      const rows = KINDS.filter((k) => sum(k) > 0 || usual(k) > 0);
      return `<p data-state="level">${W(S + "level." + lvl)} ${W(S + "period", { from: D(v.from), to: D(v.to) })}</p>${Number(t.count || 0) > 0 || Number(t.usual || 0) > 0 ? `<p>${W(S + "total", { count: Number(t.count || 0).toLocaleString("en"), usual: Number(t.usual || 0).toLocaleString("en") })}</p>` : ""}${rows.length ? `<table class="mk-table"><thead><tr><th>${W(S + "col.kind")}</th><th>${W(S + "col.count")}</th><th>${W(S + "col.usual")}</th></tr></thead><tbody>${rows.map((k) => `<tr><td>${W(S + "kind." + k)}</td><td>${E(sum(k).toLocaleString("en"))}</td><td>${E(usual(k).toLocaleString("en"))}</td></tr>`).join("")}</tbody></table>` : ""}`;
    }) + `${cs.field("se-from", S + "from", { type: "date" })}${cs.field("se-to", S + "to", { type: "date" })}${cs.act("securitymap")}`));

    // what is built in, as the plane answers it, and the scanner's queue
    out.push(cs.sec(S + "parts.heading", cs.state(data.boot, (b) => {
      const part = (v, key, name) => (v === true ? W("instance.part." + key + ".present") : v === false ? W("instance.part." + key + ".absent") : W("instance.part.unknown", { part: T(S + "part." + name) }));
      let h = `<p data-state="scanner">${part(b.part_scanner, "scanner", "scanner")}</p><p data-state="safeview">${part(b.part_safe_view, "safeview", "safeview")}</p>`;
      if (b.part_scanner === false) h += `<p>${W("instance.scanner.absent.step")}</p>`;
      if (b.part_scanner === true) {
        const sc = data.scan && data.scan.state === "ok" ? data.scan.value : null;
        if (sc && (Number(sc.queued || 0) > 0 || Number(sc.held || 0) > 0)) h += `<p data-state="queue">${W(S + "queue", { queued: Number(sc.queued || 0), held: Number(sc.held || 0) })}</p>`;
      }
      return h;
    })));

    // the tools held: each row's acts in its panel
    if (!data.tools || data.tools.state !== "empty" || ui.tested) out.push(cs.sec(S + "tools.heading", (ui.tested ? `<p data-shown="tested">${W(ui.tested.on ? S + "tested.on" : S + "tested.off", { detail: ui.tested.detail || "" })}</p>` : "") + cs.state(data.tools, (v) => cs.rows({
      id: "tools", cols: [S + "col.tool", S + "col.state", S + "col.added"], items: (v.tools || []).filter((t) => t.state !== "removed"), key: (t) => t.tool_id, name: (t) => E(t.provider_id),
      cells: (t) => [E(t.provider_id), W(S + "state." + (["added", "on", "test_failed", "off"].indexOf(t.state) >= 0 ? t.state : "added")) + (t.use === "routine" ? " · " + W(S + "every.on") : ""), E(D(t.added_at))],
      acts: (t) => cs.act("securitytooltest", { data: { tool: t.tool_id } }) + cs.act("securitytoolremove", { data: { tool: t.tool_id } }),
    }), { empty: S + "tools.none" })));

    // what happened to them
    if (!data.events || data.events.state !== "empty") out.push(cs.sec(S + "events.heading", cs.state(data.events, (v) => `<ul class="mk-list">${(v.events || []).map((e) => `<li>${W(S + "event." + (["added", "test_passed", "test_failed", "removed", "switched_off"].indexOf(e.event) >= 0 ? e.event : "added"), { tool: e.tool_id })} · ${cs.date(e.at, { year: true })}${e.reason ? ` · <span class="rec">${E(e.reason)}</span>` : ""}</li>`).join("")}</ul>`, { empty: S + "events.none" })));

    // the catalogue: each entry's panel says what the tool is sent and keeps, then asks what its config lists
    if (!data.catalogue || data.catalogue.state !== "empty") out.push(cs.sec(S + "catalogue.heading", cs.state(data.catalogue, (v) => cs.rows({
      id: "catalogue", cols: [S + "col.tool", S + "col.does"], items: v.offered || [], key: (t) => t.provider_id, name: (t) => E(t.vendor + " " + t.product),
      cells: (t) => [E(t.vendor + " · " + t.product), (t.kinds || []).map((k) => W(S + "does." + (["scan", "cdr", "sandbox", "url_reputation", "log_sink"].indexOf(k) >= 0 ? k : "scan"))).join(", ")],
      acts: (t) => {
        const add = cs.act("securitytooladd", { data: { provider: t.provider_id } });
        if (!add) return "";
        const h = t.handling || {};
        const p = "sa-" + String(t.provider_id).replace(/[^A-Za-z0-9_-]/g, "_");
        const list = (x) => (Array.isArray(x) ? x.join(", ") : String(x === undefined || x === null ? "" : x));
        let f = `<dl class="mk-dl" data-handling="${E(t.provider_id)}"><dt>${W(S + "h.sends")}</dt><dd>${E(list(h.sends))}</dd><dt>${W(S + "h.never")}</dt><dd>${E(list(h.never_sends))}</dd><dt>${W(S + "h.recipient")}</dt><dd>${E(list(h.recipient))}</dd><dt>${W(S + "h.region")}</dt><dd>${E(list(h.region))}</dd><dt>${W(S + "h.files")}</dt><dd>${E(list(h.file_retention))}</dd><dt>${W(S + "h.results")}</dt><dd>${E(list(h.result_retention))}</dd><dt>${W(S + "h.sharing")}</dt><dd>${W(S + "sharing." + (["none", "vendor_internal_research", "third_parties", "public"].indexOf(h.sample_sharing) >= 0 ? h.sample_sharing : "none"))}</dd></dl>`;
        f += `<div>`;
        if (t.template) f += cs.field(p + "-host", S + "host", { autocomplete: "off" });
        // a field named by the catalogue's own label (record data, a word's fill, so escaped and never read as a key)
        for (const c of Array.isArray(t.config) ? t.config : []) if (c && c.name) f += cs.field(`${p}-c-${c.name}`, c.required ? S + "field" : S + "field.optional", { fills: { label: c.label || c.name }, autocomplete: "off" });
        for (const k of Array.isArray(t.credentials) ? t.credentials : []) f += cs.field(`${p}-k-${k}`, S + "field", { type: "password", fills: { label: k }, autocomplete: "off" });
        if (h.sample_sharing === "vendor_internal_research") f += `<input type="checkbox" id="${p}-keep"><label for="${p}-keep">${W(S + "keep")}</label>`;
        if (onOwn(h.recipient)) f += `<input type="checkbox" id="${p}-every"><label for="${p}-every">${W(S + "every")}</label>`;
        return f + add + "</div>";
      },
    }), { empty: S + "catalogue.none" })));
    return out.join("");
  },

  acts: [
    // a read: the level for the period chosen
    { op: "securitymap", rereads: ["map"],
      send(view, el, cs) {
        const from = String(cs.value("se-from") || ""), to = String(cs.value("se-to") || "");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) return { refuse: "screen.security.period.bad" };
        const period = { from: from + "T00:00:00.000Z", to: new Date(Date.parse(to + "T00:00:00.000Z") + 86400000).toISOString() };
        return { query: period };
      },
      done(view, answer, cs) { const a = answer && answer.result !== undefined ? answer.result : answer; if (a && a.from && a.to) cs.set("period", { from: a.from, to: a.to }); } },
    // the entry's config by its names, its credentials in the body only, its handling's digest, then tested at once
    { op: "securitytooladd", rereads: ["tools", "events", "scan"],
      send(view, el, cs) {
        const cat = view.data && view.data.catalogue && view.data.catalogue.value ? view.data.catalogue.value.offered || [] : [];
        const t = cat.find((x) => x.provider_id === el.dataset.provider);
        if (!t) return null;
        const p = "sa-" + String(t.provider_id).replace(/[^A-Za-z0-9_-]/g, "_");
        const config = {}, credentials = {};
        for (const c of Array.isArray(t.config) ? t.config : []) {
          if (!c || !c.name) continue;
          const v = String(cs.value(p + "-c-" + c.name) || "").trim();
          if (v) config[c.name] = v; else if (c.required) return { refuse: "screen.security.config.missing", fills: { field: c.label || c.name } };
        }
        for (const k of Array.isArray(t.credentials) ? t.credentials : []) {
          const v = String(cs.value(p + "-k-" + k) || "");
          if (!v) return { refuse: "screen.security.config.missing", fills: { field: k } };
          credentials[k] = v;
        }
        const h = t.handling || {};
        const own = typeof h.recipient === "string" && (/^the organization\b/i.test(h.recipient.trim()) || /^[^,(]+\(the organization's own [^)]+\)$/i.test(h.recipient.trim()));
        const body = { providerId: t.provider_id, config, credentials, handlingDigest: t.handling_digest, confirmRetention: cs.value(p + "-keep") === true, use: own && cs.value(p + "-every") === true ? "routine" : "on_request" };
        if (t.template) { const host = String(cs.value(p + "-host") || "").trim(); if (!host) return { refuse: "screen.security.config.missing", fills: { field: "host" } }; body.template = { host }; }
        return { body };
      },
      // tested at once: whether the tool is on, or why it stays off
      async done(view, answer, cs) {
        const a = answer && answer.result !== undefined ? answer.result : answer;
        if (!a || !a.tool_id) return null;
        const t = await cs.call("securitytooltest", { body: { toolId: a.tool_id } });
        const r = t && t.result !== undefined ? t.result : t;
        cs.set("tested", { on: !!(r && r.ok === true && r.passed === true), detail: r ? r.detail || r.translation || r.reason || "" : "" });
        return null;
      } },
    { op: "securitytooltest", rereads: ["tools", "events"],
      send(view, el) { return { body: { toolId: el.dataset.tool } }; },
      done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; cs.set("tested", { on: !!(r && r.passed === true), detail: r ? r.detail || "" : "" }); } },
    { op: "securitytoolremove", rereads: ["tools", "events"],
      send(view, el) { return { body: { toolId: el.dataset.tool } }; } },
  ],
};

/* Find in's recording forms (screens-daily R47, R48; N1177, N1192; DEC-300, DEC-318, DEC-324), a screen part (interface-shell R21,
   K3002) handed to `find-in` as `view.parts.forms`. Each recording act's form is drawn in place from the act's own lists, never
   typed: a person fact's kinds (`screen.person.kind.*`) with the dates it holds true over, a dated fact's kinds
   (`screen.timeline.datekind.*`), a standard's (`screen.standard.kind.*`) and a money fact's kinds, phases and stages
   (`label.moneykinds.*`, `.moneyphases.*`, `.moneystages.*`), the flow step only for an actual payment. A figure or a date read
   from the passage is filled in with `findin.prefilled`. `draw` answers a form's HTML; `body` answers what the act sends, or
   `{refuse, fills}` when a field it needs is empty (`findin.fieldneeded`). The choices redraw on change (`acts: {}`), so the
   form follows the phase chosen. Self-contained: it refers only to its parameters. */

export function forms() {
  const PERSON = ["name", "birth", "death", "locality", "address", "contact"];
  const DATES = ["meeting", "adopted", "effective", "signed", "entered", "issued", "published", "received", "hearing", "period_covered", "edited"];
  const STANDARDS = ["statute", "regulation", "ordinance", "court", "policy", "commitment", "standard"];
  const MONEY = ["allocation", "balance", "behested", "contribution", "debt", "expenditure", "fee_charged", "gift", "income", "other", "payment", "revenue", "settlement", "transfer"];
  const PHASES = ["proposed", "adopted", "adjusted", "actual"];
  const STAGES = ["assessed", "collected", "encumbered", "incurred", "paid"];
  const PRECISIONS = ["day", "minute", "second", "edtf"];
  const SEVEN = ["America/Los_Angeles", "America/Denver", "America/Phoenix", "America/Chicago", "America/New_York", "America/Anchorage", "Pacific/Honolulu"];
  const opts = function (prefix, list) { return list.map(function (k) { return [k, prefix + k]; }); };
  const pick = function (cs, id, label, prefix, list, value) { return cs.choice(id, label, opts(prefix, list), { value: value, acts: {} }); };
  const val = function (cs, id) { const v = cs.value(id); return v === null || v === undefined ? "" : String(v).trim(); };

  // The team's time zone as `factstatus` lists it (local-facts R2): the zone of the profile's own `time_zone`, as it governs here.
  const zoneOf = function (view) {
    const r = view.data && view.data.zone;
    const facts = r && r.state === "ok" && r.value && Array.isArray(r.value.facts) ? r.value.facts : [];
    const f = facts.filter(function (x) { return x && x.fact && x.fact.fact === "time_zone" && !x.fact.office && x.governs; })[0];
    const v = f && f.governs ? f.governs.value : null;
    const id = typeof v === "string" ? v : v && typeof v.value === "string" ? v.value : v && typeof v.zone === "string" ? v.zone : "";
    return id || "";
  };
  // A zone is shown by its name, never its id (DEC-322): the design's seven by key, any other by the browser's generic name and its city.
  const zoneName = function (cs, id) {
    if (SEVEN.indexOf(id) >= 0) return cs.w("label.timezones." + id);
    let generic = "";
    try {
      const parts = new Intl.DateTimeFormat("en", { timeZone: id, timeZoneName: "longGeneric" }).formatToParts(new Date());
      generic = parts.filter(function (p) { return p.type === "timeZoneName"; }).map(function (p) { return p.value; })[0] || "";
    } catch (e) { generic = ""; }
    return cs.esc((generic ? generic + " " : "") + String(id).split("/").pop().replace(/_/g, " "));
  };

  const draw = function (cs, view, op, f, it) {
    const ui = view.ui || {};
    const prefilled = function (v) { return v ? { value: String(v), help: "findin.prefilled" } : {}; };
    if (op === "recordpersonfact") {
      const id = zoneOf(view);
      return pick(cs, f + "-kind", "screen.find-in.field.kind", "screen.person.kind.", PERSON, "name")
        + '<p class="mk-small muted">' + cs.w("screen.find-in.fact.office") + "</p>"
        + cs.field(f + "-value", "screen.find-in.field.value", prefilled(it.words || it.value))
        + '<fieldset class="mk-checks"><legend>' + cs.w("screen.find-in.valid") + '</legend><p class="mk-small muted">' + cs.w("screen.find-in.valid.help") + "</p>"
        + cs.field(f + "-from", "screen.find-in.valid.from", {}) + cs.field(f + "-to", "screen.find-in.valid.to", {})
        + pick(cs, f + "-precision", "screen.find-in.valid.precision", "label.timeprecisions.", PRECISIONS, "day")
        + (id ? '<p class="mk-small muted">' + cs.w("screen.find-in.valid.zone", { zone: { html: zoneName(cs, id) } }) + "</p>" : "") + "</fieldset>";
    }
    if (op === "recorddatedfact") {
      return pick(cs, f + "-kind", "screen.timeline.datekind", "screen.timeline.datekind.", DATES, "meeting")
        + cs.field(f + "-value", "screen.find-in.field.date", prefilled(it.date || it.value || it.words));
    }
    if (op === "standarddeclare") {
      return cs.field(f + "-cite", "screen.find-in.field.cite", {})
        + pick(cs, f + "-kind", "screen.find-in.field.standardkind", "screen.standard.kind.", STANDARDS, "statute")
        + cs.field(f + "-issuer", "screen.find-in.field.issuer", {}) + cs.field(f + "-reason", "screen.find-in.field.reason", {});
    }
    if (op === "recordfact") {
      const phase = ui["choice:" + f + "-phase"] || "proposed";
      const actual = phase === "actual";
      return cs.field(f + "-amount", "screen.find-in.field.amount", prefilled(it.amount || it.as_read))
        + cs.field(f + "-currency", "screen.find-in.field.currency", prefilled(it.currency))
        + pick(cs, f + "-kind", "screen.find-in.field.kind", "label.moneykinds.", MONEY, "payment")
        + pick(cs, f + "-phase", "screen.find-in.field.phase", "label.moneyphases.", PHASES, "proposed")
        + (actual ? pick(cs, f + "-stage", "screen.money.f.stage", "label.moneystages.", STAGES, "paid")
          + '<fieldset class="mk-checks"><legend>' + cs.w("money.flow.step") + '</legend><p class="mk-small muted">' + cs.w("screen.find-in.flow.help") + "</p>"
          + cs.field(f + "-payer", "screen.money.f.payer", {}) + cs.field(f + "-payee", "screen.money.f.payee", {})
          + cs.field(f + "-date", "screen.find-in.field.date", {}) + "</fieldset>" : "")
        + cs.field(f + "-from", "screen.find-in.field.from", {}) + cs.field(f + "-to", "screen.find-in.field.to", {});
    }
    if (op === "tabledeclare") return cs.field(f + "-header", "screen.find-in.field.header", {});
    return "";
  };

  const need = function (cs, key, value) { return value ? null : { refuse: "findin.fieldneeded", fills: { field: { html: cs.w(key) } } }; };

  const body = function (cs, view, op, f, it) {
    const ui = view.ui || {};
    const q = ui.question ? { question: ui.question } : {};
    if (op === "recordpersonfact") {
      const kind = val(cs, f + "-kind");
      const value = val(cs, f + "-value") || String(it.words || "").trim();
      const bad = need(cs, "screen.find-in.field.value", value);
      if (bad) return bad;
      const zone = zoneOf(view);
      const valid = { from: val(cs, f + "-from") || null, to: val(cs, f + "-to") || null, precision: val(cs, f + "-precision") || "day" };
      if (zone) valid.zone = zone;
      return { body: Object.assign({ person: it.entity || it.person || it.entity_id, kind: kind, value: value, valid: valid,
        citation: { capture_sha: it.capture_sha, extent: it.extent } }, q) };
    }
    if (op === "recorddatedfact") {
      const value = val(cs, f + "-value") || String(it.date || it.value || "").trim();
      const bad = need(cs, "screen.find-in.field.date", value);
      if (bad) return bad;
      return { body: Object.assign({ captureSha: it.capture_sha, extent: it.extent, kind: val(cs, f + "-kind"), value: value, method: "typed" }, q) };
    }
    if (op === "standarddeclare") {
      const cite = val(cs, f + "-cite");
      const issuer = val(cs, f + "-issuer");
      const bad = need(cs, "screen.find-in.field.cite", cite) || need(cs, "screen.find-in.field.issuer", issuer);
      if (bad) return bad;
      // R47: the found extent is the standard's text when the passage has no content row yet; a row it has is named.
      const text = it.content_id ? [String(it.content_id)] : [{ capture_sha: it.capture_sha, extent: it.extent }];
      return { body: Object.assign({ cite: cite, kind: val(cs, f + "-kind"), issuer: issuer, reason: val(cs, f + "-reason"), text: text }, q) };
    }
    if (op === "recordfact") {
      const actual = val(cs, f + "-phase") === "actual";
      const amount = val(cs, f + "-amount") || String(it.amount || "").trim();
      const currency = val(cs, f + "-currency") || String(it.currency || "").trim();
      const bad = need(cs, "screen.find-in.field.amount", amount) || need(cs, "screen.find-in.field.currency", currency)
        || (actual ? need(cs, "screen.money.f.payer", val(cs, f + "-payer")) || need(cs, "screen.find-in.field.payee.short", val(cs, f + "-payee"))
          || need(cs, "screen.find-in.field.date", val(cs, f + "-date")) : null);
      if (bad) return bad;
      const out = { amount: amount, as_read: String(it.as_read || it.words || ""), currency: currency, sign: "+", precision: "exact", kind: val(cs, f + "-kind"),
        phase: val(cs, f + "-phase"), basis: "budgetary", period: { from: val(cs, f + "-from"), to: val(cs, f + "-to"), precision: "day" },
        source: { capture_sha: it.capture_sha, extent: it.extent }, method: "typed" };
      if (actual) {
        out.stage = val(cs, f + "-stage");
        out.from = { as_written: val(cs, f + "-payer") };
        out.to = { as_written: val(cs, f + "-payee") };
        // R81: `recordfact` accepts no `date`; the day of an actual payment is the day the fact holds over (its period).
        out.period = { from: val(cs, f + "-date"), to: val(cs, f + "-date"), precision: "day" };
      }
      return { body: Object.assign(out, q) };
    }
    if (op === "tabledeclare") {
      const header = val(cs, f + "-header").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      // R81: a table is declared with its schema, the header's columns as strings (calculations R1), as `calculation` declares one.
      return { body: { source: it.content_id ? String(it.content_id) : { capture_sha: it.capture_sha, extent: it.extent }, header: header,
        schema: { fields: header.map(function (name) { return { name: name, type: "string" }; }) } } };
    }
    return null;
  };
  return { draw: draw, body: body, zoneOf: zoneOf, zoneName: zoneName, SEVEN: SEVEN };
}

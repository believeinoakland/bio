/* Find in this (registry screen `find-in`; screens-daily R5, R7; DEC-164, N698, K1468). One control over a document, the
   documents held together, or a project: the member ticks what to find, with an optional name or term and question;
   `findin` answers results by kind, each with its words as written, its passage and "Found by search"; each result offers
   only the recording act of its kind, and finding itself records nothing. The scope is the route's subject: a project's
   id (`PROJ-…`), a held set's handle (`sel-…`), else a document's capture digest. Every function is self-contained
   (interface-shell R21 (1)). */

export const findIn = Object.freeze({
  id: "find-in",

  reads: function (view) {
    return {
      // The questions a result may be recorded for (R5's optional question): those the member may see.
      questions: {
        op: "search", query: { q: "type:inquiry", limit: "200" },
        empty: function (v) { return !v || !Array.isArray(v.hits) || v.hits.length === 0; },
      },
    };
  },

  // The path's project step (interface-shell R8) when the scope is a project.
  place: function (view) {
    const s = String(view.subject || "");
    return s.indexOf("PROJ-") === 0 ? { project: { id: s, title: s } } : null;
  },

  render: function (cs, view) {
    const ui = view.ui || {};
    const s = String(view.subject || "");
    const form = !s ? "" : s.indexOf("PROJ-") === 0 ? "project" : s.indexOf("sel-") === 0 ? "held" : "document";
    const KINDS = ["people", "money", "dates", "requirements", "events", "term"];
    const RECORD = { people: "recordpersonfact", money: "recordfact", dates: "recorddatedfact", events: "recorddatedfact", requirements: "standarddeclare", term: "cite" };
    // The fields each recording act asks the member, drawn in place in a disclosure with the act and read by its `send`.
    const FIELDS = {
      recordpersonfact: [["kind", "screen.find-in.field.kind"], ["value", "screen.find-in.field.value"]],
      recorddatedfact: [["kind", "screen.find-in.field.kind"], ["value", "screen.find-in.field.date"]],
      standarddeclare: [["cite", "screen.find-in.field.cite"], ["kind", "screen.find-in.field.kind"], ["issuer", "screen.find-in.field.issuer"], ["reason", "screen.find-in.field.reason"]],
      recordfact: [["amount", "screen.find-in.field.amount"], ["currency", "screen.find-in.field.currency"], ["kind", "screen.find-in.field.kind"],
        ["phase", "screen.find-in.field.phase"], ["from", "screen.find-in.field.from"], ["to", "screen.find-in.field.to"]],
      tabledeclare: [["header", "screen.find-in.field.header"]],
    };
    const recordAct = function (op, ki, ii) {
      const f = "fr-" + ki + "-" + ii;
      const button = cs.act(op, { label: "act." + op + ".label.find-in", data: { k: String(ki), i: String(ii), f: f } });
      if (!button || !FIELDS[op]) return button;
      return '<details class="mk-actd"><summary>' + cs.w("act." + op + ".label.find-in") + "</summary>"
        + FIELDS[op].map(function (x) { return cs.field(f + "-" + x[0], x[1], {}); }).join("") + button + "</details>";
    };
    const head = cs.title(undefined, {}) + '<p class="mk-sub">' + cs.w("screen.find-in.sub") + "</p>";
    if (!form) return head + '<p class="mk-note"><b>' + cs.w("state.empty") + "</b> " + cs.w("screen.find-in.scope.none") + "</p>";

    const scope = '<div class="cs-field"><span class="label">' + cs.w("screen.find-in.lookin") + '</span><span class="help">'
      + cs.w("screen.find-in.lookin.help") + "</span><p>" + cs.w("screen.find-in.scope." + form)
      + "</p>" + (form === "held" ? "" : "<p>" + (form === "project" ? cs.ref("project", s, s, []) : cs.ref("document", s, s, [])) + "</p>") + "</div>";
    const ticked = ui.kinds && typeof ui.kinds === "object" ? ui.kinds : { people: true, money: true, dates: true, requirements: true };
    const what = '<fieldset class="mk-checks"><legend>' + cs.w("screen.find-in.what") + "</legend>"
      + KINDS.map(function (k) {
        return '<label><input type="checkbox" id="findin-kind-' + k + '"' + (ticked[k] ? " checked" : "") + "> " + cs.w("screen.find-in.kind." + k) + "</label>";
      }).join("") + "</fieldset>";
    const term = cs.field("findin-term", "screen.find-in.term", { value: ui.term || "", help: "screen.find-in.term.help" });
    const qs = view.data.questions && view.data.questions.state === "ok" && view.data.questions.value && Array.isArray(view.data.questions.value.hits)
      ? view.data.questions.value.hits : [];
    const question = '<div class="cs-field"><label for="findin-question">' + cs.w("screen.find-in.question") + '</label><span class="help">'
      + cs.w("screen.find-in.question.help") + '</span><select id="findin-question" class="cs-input"><option value="">'
      + cs.w("screen.find-in.question.none") + "</option>"
      + qs.map(function (h) {
        const id = String(h.bundle_id);
        return '<option value="' + cs.esc(id) + '"' + (ui.question === id ? " selected" : "") + ">" + cs.esc(h.title || id) + "</option>";
      }).join("") + "</select></div>";
    const acts = '<div class="mk-acts">' + cs.act("findin", { label: "act.findin.label.find-in", tone: "primary" })
      + cs.act("standingquestionset", { label: "act.standingquestionset.label.find-in" }) + "</div>"
      + (ui.keeping ? '<p class="mk-note">' + cs.w("screen.find-in.keeping") + "</p>" : "");

    const found = ui.found && typeof ui.found === "object" ? ui.found : null;
    const results = !found ? "" : (Array.isArray(found.kinds) ? found.kinds : []).map(function (k, ki) {
      const items = Array.isArray(k.items) ? k.items : [];
      const n = typeof k.count === "number" ? k.count : items.length;
      const title = k.kind === "term"
        ? cs.w("screen.find-in.termsection", { term: found.term || "", n: String(n) })
        : cs.w("screen.find-in.section", { kind: cs.w("screen.find-in.kind." + (KINDS.indexOf(k.kind) >= 0 ? k.kind : "term")), n: String(n) });
      const notRead = Array.isArray(k.not_read) && k.not_read.length
        ? '<p class="mk-note">' + cs.w("screen.find-in.notread", { n: String(k.not_read.length) }) + "</p>" : "";
      const body = !items.length
        ? (k.nothing ? '<p class="mk-note"><b>' + cs.w("screen.find-in.nothing") + "</b></p>" : "") + notRead
        : cs.sheet(items.map(function (it, ii) {
          const extent = it.extent && typeof it.extent === "object" ? it.extent : {};
          const p = extent.passage !== undefined ? extent.passage : extent.paragraph;
          const where = (p !== undefined ? "<span>" + cs.w("screen.find-in.passage", { n: String(p) }) + "</span> " : "")
            + (it.capture_sha ? cs.ref("document", String(it.capture_sha), String(it.capture_sha).slice(0, 12), []) : "");
          const rec = Array.isArray(it.recorded) && it.recorded.length ? it.recorded[0] : null;
          const op = it.table || it.kind === "table" ? "tabledeclare" : RECORD[k.kind];
          const right = rec
            ? cs.mark("origin", "accepted") + " " + cs.w("screen.find-in.recorded", { who: String(rec.by || rec.member || rec.who || "") })
            : (op ? recordAct(op, ki, ii) : "");
          return cs.row(cs.mark("origin", "search"), '<span class="rec">' + cs.w("screen.find-in.quote", { words: String(it.words || it.as_read || "") }) + "</span>"
            + '<span class="meta">' + where + "</span>", right, "");
        }).join("")) + notRead;
      const more = k.kind === "term" && k.truncated
        ? '<div class="mk-acts">' + cs.act("search", { label: "act.search.label.find-in", data: { term: String(found.term || "") } }) + "</div>" : "";
      return '<section class="cs-section mk-sec"><h2>' + title + "</h2>" + body + more + "</section>";
    }).join("") + (found.term && !found.kinds.some(function (k) { return k.kind === "term" && k.truncated; })
      ? '<div class="mk-acts">' + cs.act("search", { label: "act.search.label.find-in", data: { term: String(found.term) } }) + "</div>" : "");

    return head + scope + what + term + question + acts + results + '<p class="mk-note">' + cs.w("screen.find-in.note") + "</p>";
  },

  acts: [
    // R5: finding records nothing (`findin` is a read, K1468); the answer is kept in the screen's page memory.
    { op: "findin", label: "act.findin.label.find-in", rereads: [],
      send: function (view, el, cs) {
        const s = String(view.subject || "");
        if (!s) return { refuse: "screen.find-in.scope.none" };
        const KINDS = ["people", "money", "dates", "requirements", "events", "term"];
        const on = function (id) { const v = cs.value(id); return v === true || v === "on" || v === "true"; };
        const ticked = {};
        const kinds = KINDS.filter(function (k) { ticked[k] = on("findin-kind-" + k); return ticked[k]; });
        const term = String(cs.value("findin-term") || "").trim();
        if (!kinds.length) return { refuse: "screen.find-in.kindsfirst" };
        if (kinds.indexOf("term") >= 0 && !term) return { refuse: "screen.find-in.termfirst" };
        cs.set("kinds", ticked);
        cs.set("term", term);
        cs.set("question", String(cs.value("findin-question") || ""));
        const scope = s.indexOf("PROJ-") === 0 ? { project: s } : s.indexOf("sel-") === 0 ? { selection: s } : { capture: s };
        const body = { scope: scope, kinds: kinds };
        if (kinds.indexOf("term") >= 0) body.term = term;
        return { body: body };
      },
      done: function (view, answer, cs) {
        const a = answer && Array.isArray(answer.kinds) ? answer : (answer && answer.result) || {};
        cs.set("found", { kinds: Array.isArray(a.kinds) ? a.kinds : [], term: (view.ui || {}).term || "", scope: a.scope || null });
      } },
    // Keep finding over the scope as documents arrive (answers R15's `find` form); the member's question, if chosen.
    { op: "standingquestionset", label: "act.standingquestionset.label.find-in", rereads: [],
      send: function (view, el, cs) {
        const s = String(view.subject || "");
        if (!s) return { refuse: "screen.find-in.scope.none" };
        const KINDS = ["people", "money", "dates", "requirements", "events", "term"];
        const on = function (id) { const v = cs.value(id); return v === true || v === "on" || v === "true"; };
        const kinds = KINDS.filter(function (k) { return on("findin-kind-" + k); });
        const term = String(cs.value("findin-term") || "").trim();
        if (!kinds.length) return { refuse: "screen.find-in.kindsfirst" };
        if (kinds.indexOf("term") >= 0 && !term) return { refuse: "screen.find-in.termfirst" };
        const qid = String(cs.value("findin-question") || "");
        const qs = view.data.questions && view.data.questions.value && Array.isArray(view.data.questions.value.hits) ? view.data.questions.value.hits : [];
        const chosen = qs.filter(function (h) { return String(h.bundle_id) === qid; })[0];
        const scope = s.indexOf("PROJ-") === 0 ? { project: s } : s.indexOf("sel-") === 0 ? { selection: s } : { capture: s };
        const find = { scope: scope, kinds: kinds };
        if (kinds.indexOf("term") >= 0) find.term = term;
        const ends = new Date(cs.now() + 365 * 86400000).toISOString().slice(0, 10);
        return { body: { question: chosen ? String(chosen.title || qid) : (term || kinds.join(", ")), find: find, cadence: "weekly", ends: ends } };
      },
      done: function (view, answer, cs) { cs.set("keeping", true); } },
    { op: "recordpersonfact", label: "act.recordpersonfact.label.find-in",
      send: function (view, el, cs) {
        const f = {};
        ["kind", "value", "cite", "issuer", "reason", "amount", "currency", "phase", "from", "to", "header"]
          .forEach(function (n) { const v = cs.value(el.dataset.f + "-" + n); f[n] = v === null || v === undefined ? "" : String(v); });
        const k = ((view.ui || {}).found || {}).kinds[Number(el.dataset.k)];
        const it = k && k.items[Number(el.dataset.i)];
        if (!it) return null;
        const body = { person: it.entity || it.person || it.entity_id, kind: String(f.kind || "").trim(), value: String(f.value || it.words || "").trim(),
          citation: { capture_sha: it.capture_sha, extent: it.extent } };
        if ((view.ui || {}).question) body.question = view.ui.question;
        return { body: body };
      } },
    { op: "recorddatedfact", label: "act.recorddatedfact.label.find-in",
      send: function (view, el, cs) {
        const f = {};
        ["kind", "value", "cite", "issuer", "reason", "amount", "currency", "phase", "from", "to", "header"]
          .forEach(function (n) { const v = cs.value(el.dataset.f + "-" + n); f[n] = v === null || v === undefined ? "" : String(v); });
        const k = ((view.ui || {}).found || {}).kinds[Number(el.dataset.k)];
        const it = k && k.items[Number(el.dataset.i)];
        if (!it) return null;
        const body = { captureSha: it.capture_sha, extent: it.extent, kind: String(f.kind || "").trim(),
          value: String(f.value || it.date || it.value || "").trim(), method: "typed" };
        if ((view.ui || {}).question) body.question = view.ui.question;
        return { body: body };
      } },
    // The member's own words why the group holds the city to it are the act's reason (interface-shell R11, K3002).
    { op: "standarddeclare", label: "act.standarddeclare.label.find-in", reasonField: "reason",
      send: function (view, el, cs) {
        const f = {};
        ["kind", "value", "cite", "issuer", "reason", "amount", "currency", "phase", "from", "to", "header"]
          .forEach(function (n) { const v = cs.value(el.dataset.f + "-" + n); f[n] = v === null || v === undefined ? "" : String(v); });
        const k = ((view.ui || {}).found || {}).kinds[Number(el.dataset.k)];
        const it = k && k.items[Number(el.dataset.i)];
        if (!it) return null;
        return { body: { cite: String(f.cite || "").trim(), kind: String(f.kind || "").trim(), issuer: String(f.issuer || "").trim(),
          reason: String(f.reason || "").trim(), text: it.content_id ? [String(it.content_id)] : [] } };
      } },
    { op: "recordfact", label: "act.recordfact.label.find-in",
      send: function (view, el, cs) {
        const f = {};
        ["kind", "value", "cite", "issuer", "reason", "amount", "currency", "phase", "from", "to", "header"]
          .forEach(function (n) { const v = cs.value(el.dataset.f + "-" + n); f[n] = v === null || v === undefined ? "" : String(v); });
        const k = ((view.ui || {}).found || {}).kinds[Number(el.dataset.k)];
        const it = k && k.items[Number(el.dataset.i)];
        if (!it) return null;
        const body = { amount: String(f.amount || "").trim(), as_read: String(it.as_read || it.words || ""), currency: String(f.currency || "").trim(),
          sign: "+", precision: "exact", kind: String(f.kind || "").trim(), phase: String(f.phase || "").trim(), basis: "budgetary",
          period: { from: String(f.from || "").trim(), to: String(f.to || "").trim(), precision: "day" },
          source: { capture_sha: it.capture_sha, extent: it.extent }, method: "typed" };
        if ((view.ui || {}).question) body.question = view.ui.question;
        return { body: body };
      } },
    { op: "tabledeclare", label: "act.tabledeclare.label.find-in",
      send: function (view, el, cs) {
        const f = {};
        ["kind", "value", "cite", "issuer", "reason", "amount", "currency", "phase", "from", "to", "header"]
          .forEach(function (n) { const v = cs.value(el.dataset.f + "-" + n); f[n] = v === null || v === undefined ? "" : String(v); });
        const k = ((view.ui || {}).found || {}).kinds[Number(el.dataset.k)];
        const it = k && k.items[Number(el.dataset.i)];
        if (!it) return null;
        const header = String(f.header || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
        return { body: { source: it.content_id ? String(it.content_id) : { capture_sha: it.capture_sha, extent: it.extent }, header: header } };
      } },
    // Cites the passage in the chosen question (citation's `found` form; every argument in the query).
    { op: "cite", label: "act.cite.label.find-in",
      send: function (view, el, cs) {
        const ui = view.ui || {};
        const k = (ui.found || {}).kinds[Number(el.dataset.k)];
        const it = k && k.items[Number(el.dataset.i)];
        if (!it) return null;
        if (!ui.question) return { refuse: "screen.find-in.questionfirst" };
        return { query: { project: ui.question, question: ui.question, found: JSON.stringify(it) }, body: {} };
      } },
    // "See all in Find": the term searched in Find.
    { op: "search", label: "act.search.label.find-in", rereads: [],
      send: function (view, el) { return el.dataset.term ? { query: { q: el.dataset.term } } : null; },
      done: function (view, answer, cs) { cs.go("finder", String((view.ui || {}).term || "")); } },
  ],
});

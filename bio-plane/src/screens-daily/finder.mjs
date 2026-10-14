/* Find (registry screen `finder`; screens-daily R4, R7, R12, R21). Search with the member's words; each result with its grade and
   where it matched; hold picked results together (retrieval's selection, a handle that lives while it is used), let the
   set go, open "Find in these" over it, see where nobody looked, and count over the held set. The words searched are the
   route's subject (`/app/finder/<words>`) or the member's last search on this page; the held set's handle is kept in the
   screen's page memory (`view.ui`). A search that finds nothing says what search covers and offers "Capture it" (R12).
   Every function is self-contained (interface-shell R21 (1)). */

export const finder = Object.freeze({
  id: "finder",

  reads: function (view) {
    const ui = view.ui || {};
    const q = typeof ui.q === "string" ? ui.q : (view.subject ? String(view.subject) : "");
    const out = {};
    if (q.trim()) {
      out.search = {
        op: "search", query: { q: q, limit: "50", snippet: "160" },
        empty: function (v) { return !v || !Array.isArray(v.hits) || v.hits.length === 0; },
      };
    }
    if (ui.handle) out.selection = { op: "selection", query: { handle: String(ui.handle) } };
    if (ui.frontier) {
      out.frontier = {
        op: "frontier", query: { level: "document" },
        empty: function (v) { return !v || !Array.isArray(v.never_looked) || v.never_looked.length === 0; },
      };
    }
    return out;
  },

  render: function (cs, view) {
    const ui = view.ui || {};
    const q = typeof ui.q === "string" ? ui.q : (view.subject ? String(view.subject) : "");
    const hitsOf = function () {
      const s = view.data.search;
      return s && s.state === "ok" && s.value && Array.isArray(s.value.hits) ? s.value.hits : [];
    };
    const head = cs.title(undefined, {}) + '<p class="mk-sub">' + cs.w("screen.finder.sub") + "</p>";
    const box = '<div class="mk-search">' + cs.field("finder-q", "screen.finder.words", { value: q })
      + '<span class="mk-acts">' + cs.act("search", { label: "act.search.label.finder", tone: "primary" }) + "</span></div>";

    // R12 (DEC-201 (13)): no result: the words searched, what search covers, and "Capture it" (the capture screen).
    const sr = view.data.search;
    const none = sr && sr.state === "empty"
      ? '<div class="mk-note" data-state="empty"><p><b>' + cs.w("screen.finder.noresult", { q: q }) + "</b> " + cs.w("screen.finder.covers") + "</p>"
        + '<p class="mk-acts"><a class="cs-btn" data-tone="quiet" data-nav href="/app/capture">' + cs.w("screen.finder.captureit") + "</a></p></div>"
      : "";
    const results = view.data.search ? (none || cs.state("search", function (s) {
      const hits = Array.isArray(s.hits) ? s.hits : [];
      const total = typeof s.total === "number" ? s.total : hits.length;
      return '<p class="mk-sub">' + (total === 1 ? cs.w("screen.finder.total.one") : cs.w("screen.finder.total.many", { n: String(total) })) + "</p>"
        + cs.sheet(hits.map(function (h) {
          const id = String(h.bundle_id);
          const pick = '<input type="checkbox" id="finder-pick-' + cs.esc(id) + '" aria-label="'
            + cs.w("screen.finder.pick", { title: h.title || id }) + '">';
          const grade = h.grade ? cs.grade("capture", String(h.grade)) + " " : "";
          const where = h.snippet ? cs.esc(String(h.snippet)) : "";
          return cs.row(pick, cs.ref("document", id, h.title || id, []) + '<span class="meta">' + grade + cs.mark("origin", "search") + (where ? " <span>" + where + "</span>" : "") + "</span>", "", "");
        }).join(""));
    })) + (function () {
      const s = view.data.search;
      const w = s && (s.state === "ok" || s.state === "empty") && s.value && s.value.widen;
      return w && typeof w.total === "number" && w.total > 0 && (!s.value.hits || !s.value.hits.length)
        ? '<p class="mk-note">' + cs.w("screen.finder.widen", { n: String(w.total) }) + "</p>" : "";
    })() : "";

    const nobody = (ui.frontier && view.data.frontier ? cs.state("frontier", function (f) {
      const n = typeof f.never_looked_count === "number" ? f.never_looked_count : (f.never_looked || []).length;
      // R21: no count at zero.
      if (!n) return '<p class="mk-note">' + cs.w("screen.finder.nobody.none") + "</p>";
      return '<p class="mk-note">' + cs.mark("gap", "nobody") + " " + cs.w("screen.finder.nobody", { n: String(n) }) + "</p>"
        + '<ul class="mk-list">' + (f.never_looked || []).slice(0, 20).map(function (x) {
          const t = x && typeof x === "object" ? (x.title || x.referent || x.authority || x.detail || "") : String(x);
          return "<li>" + cs.esc(String(t)) + "</li>";
        }).join("") + "</ul>";
    }, { empty: "screen.finder.nobody.none" }) : "")
      + '<span class="mk-acts">' + cs.act("frontier", { label: "act.frontier.label.finder" }) + "</span>";

    // The hold strip (interface-shell R19's): how many documents are held together and until when, from `selection`;
    // drawn only with results to pick or a set held (R21: no empty hold tray).
    const sel = view.data.selection;
    const strip = !hitsOf().length && !ui.handle ? "" : '<div class="cs-hold mk-hold">'
      + (ui.handle && sel ? cs.state("selection", function (v) {
        const n = typeof v.n === "number" ? v.n : (v.members || []).length;
        return '<span class="n">' + (n === 1 ? cs.w("screen.finder.held.one") : cs.w("screen.finder.held.many", { n: String(n) })) + "</span>"
          + (function () {
            // The handle lives five minutes past its last use (retrieval R18, R19): the time of day it lapses.
            const t = v.expires ? new Date(v.expires) : null;
            if (!t || isNaN(t.getTime())) return "";
            const hm = String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0");
            return ' · <span class="drift">' + cs.w("screen.finder.until", { time: hm }) + "</span>";
          })();
      }) : "")
      + '<span class="acts">' + (hitsOf().length ? cs.act("select", { label: "act.select.label.finder" }) : "")
      + (ui.handle ? cs.act("findin", { label: "act.findin.label.finder", data: { handle: String(ui.handle) } })
        + (function () {
          // "Count" asks what is counted and over which period, in place, with the act (read by its `send`).
          const button = cs.act("calculationcreate", { label: "act.calculationcreate.label.finder", data: { handle: String(ui.handle), f: "fc" } });
          return button ? '<details class="mk-details"><summary>' + cs.w("act.calculationcreate.label.finder") + "</summary>"
            + cs.field("fc-question", "screen.finder.count.question", {}) + cs.field("fc-from", "screen.finder.count.from", {})
            + cs.field("fc-to", "screen.finder.count.to", {}) + button + "</details>" : "";
        })()
        + cs.act("selectionrelease", { label: "act.selectionrelease.label.finder", data: { handle: String(ui.handle) } }) : "")
      + "</span></div>";
    const counted = ui.counted ? '<p class="mk-note">' + cs.w("screen.finder.counted", { result: String(ui.counted) }) + "</p>" : "";

    return head + box + results + strip + counted + nobody;
  },

  acts: [
    { op: "search", label: "act.search.label.finder", rereads: ["search"],
      send: function (view, el, cs) {
        const q = String(cs.value("finder-q") || "").trim();
        if (!q) return { refuse: "screen.finder.wordsfirst" };
        cs.set("q", q);
        return { query: { q: q, limit: "50", snippet: "160" } };
      } },
    // Holds the picked results together: an enumerated selection over their ids (retrieval R18).
    { op: "select", label: "act.select.label.finder", rereads: ["selection"],
      send: function (view, el, cs) {
        const s = view.data.search;
        const hits = s && s.state === "ok" && s.value && Array.isArray(s.value.hits) ? s.value.hits : [];
        const ids = hits.map(function (h) { return String(h.bundle_id); }).filter(function (id) {
          const v = cs.value("finder-pick-" + id);
          return v === true || v === "on" || v === "true";
        });
        if (!ids.length) return { refuse: "screen.finder.pickfirst" };
        const q = typeof (view.ui || {}).q === "string" ? view.ui.q : String(view.subject || "");
        return { query: { kind: "enumerated", q: q }, body: { ids: ids } };
      },
      done: function (view, answer, cs) {
        const a = answer && answer.handle ? answer : (answer && answer.result) || {};
        if (a.handle) cs.set("handle", a.handle);
      } },
    { op: "selectionrelease", label: "act.selectionrelease.label.finder", rereads: [],
      send: function (view, el) { return { query: { handle: el.dataset.handle } }; },
      done: function (view, answer, cs) { cs.set("handle", null); } },
    // "Find in these" opens `find-in` over the held set; it sends nothing itself (find-in's own act asks).
    { op: "findin", label: "act.findin.label.finder",
      send: function (view, el, cs) {
        if (!el.dataset.handle) return { refuse: "screen.finder.holdfirst" };
        cs.go("find-in", el.dataset.handle);
        return null;
      } },
    { op: "frontier", label: "act.frontier.label.finder", rereads: ["frontier"],
      send: function (view, el, cs) { cs.set("frontier", true); return { query: { level: "document" } }; } },
    // "Count": a count over the held set, as a calculation with its method shown (calculations R4).
    { op: "calculationcreate", label: "act.calculationcreate.label.finder", rereads: [],
      send: function (view, el, cs) {
        const f = { question: cs.value("fc-question"), from: cs.value("fc-from"), to: cs.value("fc-to") };
        if (!el.dataset.handle) return { refuse: "screen.finder.holdfirst" };
        return {
          body: {
            question: String(f.question || "").trim(),
            period: { from: String(f.from || "").trim(), to: String(f.to || "").trim() },
            kind: "count",
            inputs: [{ name: "held", set: el.dataset.handle }],
          },
        };
      },
      done: function (view, answer, cs) {
        const a = answer && answer.calc_id ? answer : (answer && answer.result) || {};
        const r = a.results && typeof a.results === "object" ? a.results[a.result_key] : undefined;
        cs.set("counted", r !== undefined && r !== null && typeof r !== "object" ? String(r) : String(a.calc_id || ""));
      } },
  ],
});

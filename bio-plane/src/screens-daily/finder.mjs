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
    // The words searched are the member's last search on this page, else the route's subject; a subject opening with `~` is
    // the browse's filters (R44), not words.
    const subject = view.subject ? String(view.subject) : "";
    const q = typeof ui.q === "string" ? ui.q : (subject.charAt(0) === "~" ? "" : subject);
    const out = {};
    if (q.trim()) {
      // R35: the words asked as words, and as passages holding them (retrieval R15); a query in the member's own syntax is sent as written.
      const w = q.trim().split(/\s+/);
      const plain = w.every(function (x) { return /^[\p{L}\p{N}][\p{L}\p{N}'-]*$/u.test(x) && !/^(AND|OR|NOT|NEAR)$/.test(x); });
      const asked = plain ? "(" + w.join(" ") + ") OR (" + w.map(function (x) { return "passage:" + x; }).join(" ") + ")" : q;
      out.search = {
        op: "search", query: { q: asked, limit: "50", snippet: "160" },
        empty: function (v) { return !v || !Array.isArray(v.hits) || v.hits.length === 0; },
      };
    } else {
      // R44: with no words, the browse; the member's last look (`lookedat`, which moves nothing) is what "new" counts from, and
      // the team's themes fill the Theme choice (R43). The browse itself is called from `render` once `since` is known.
      out.lookedat = { op: "lookedat" };
      out.themes = { op: "themeread", empty: function (v) { return !v || !Array.isArray(v.themes) || v.themes.length === 0; } };
      if (ui.theme) out.theme = { op: "themeread", query: { id: String(ui.theme) } };
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
    const subject = view.subject ? String(view.subject) : "";
    const q = typeof ui.q === "string" ? ui.q : (subject.charAt(0) === "~" ? "" : subject);
    const ok = function (r) { return r && r.state === "ok" ? r.value : null; };
    const hitsOf = function () {
      const s = view.data.search;
      return s && s.state === "ok" && s.value && Array.isArray(s.value.hits) ? s.value.hits : [];
    };
    // The screen each kind of thing opens, by what the hit or browse row says it is.
    const SCREEN_OF = { information: "document", document: "document", inquiry: "question", question: "question", project: "project",
      action: "action", action_plan: "plan", plan: "plan", person: "person", organization: "person" };
    const screenOf = function (type, id) {
      const t = SCREEN_OF[String(type || "").toLowerCase()];
      if (t) return t;
      return /^PROJ-/.test(id) ? "project" : /^INQ-/.test(id) ? "question" : "document";
    };
    // R46: the excerpt as its words are, the match brackets drawn as emphasis, never as raw brackets.
    const excerpt = function (text) {
      return String(text).split(/(\[[^\]]*\])/).map(function (part) {
        const m = /^\[([^\]]*)\]$/.exec(part);
        return m ? "<em>" + cs.esc(m[1]) + "</em>" : cs.esc(part);
      }).join("");
    };
    const head = cs.title(undefined, {}) + '<p class="mk-sub">' + cs.w("screen.finder.sub") + "</p>";
    const browsing = !q.trim();
    const box = '<div class="mk-search">' + cs.field("finder-q", "screen.finder.words", { value: q, placeholder: "find.query.placeholder" })
      + '<span class="mk-acts">' + cs.act("search", { label: "act.search.label.finder", tone: "primary" }) + "</span></div>";

    // R44: the browse's filters are the route's: "Show" (kinds) and "Only" are chips that are links, the Theme choice is R43's.
    const KINDS = ["all", "document", "question", "action", "entity", "plan"];
    const ONLY = ["any", "new_since", "watched", "flagged"];
    const ONLY_KEY = { any: "find.state.any", new_since: "find.state.new", watched: "find.state.watched", flagged: "find.state.secondlook" };
    const parts = subject.charAt(0) === "~" ? subject.slice(1).split("~") : [];
    const kind = KINDS.indexOf(parts[0]) >= 0 ? parts[0] : "all";
    const only = ONLY.indexOf(parts[1]) >= 0 ? parts[1] : "any";
    const lk = view.data.lookedat;
    const since = ok(lk) && typeof ok(lk).since === "string" ? ok(lk).since : null;
    const href = function (k, o) { return "/app/finder/~" + k + "~" + o; };
    const chips = function (labelKey, list, current, make, key) {
      return '<nav class="mk-sortrow" aria-label="' + cs.w(labelKey) + '"><span>' + cs.w(labelKey) + "</span> "
        + list.map(function (x) {
          return x === current ? '<b aria-current="true">' + cs.w(key(x)) + "</b>" : '<a data-nav href="' + make(x) + '">' + cs.w(key(x)) + "</a>";
        }).join(" · ") + "</nav>";
    };
    // "New since you last looked" is offered once she has visited Home (`since` is not null).
    const onlyList = ONLY.filter(function (o) { return o !== "new_since" || since; });
    const themes = ok(view.data.themes);
    const themeList = themes && Array.isArray(themes.themes) ? themes.themes : [];
    const filters = !browsing ? "" : chips("find.kind.label", KINDS, kind, function (k) { return href(k, only); }, function (k) { return "find.kind." + k; })
      + chips("find.state.label", onlyList, only, function (o) { return href(kind, o); }, function (o) { return ONLY_KEY[o]; })
      + (lk && lk.state === "ok" && !since ? '<p class="mk-small muted"><b>' + cs.w("find.browse.nosince.summary") + "</b> " + cs.w("find.browse.nosince") + "</p>"
        : since ? '<p class="mk-small muted">' + cs.w("find.browse.new.means") + "</p>" : "")
      + (themeList.length ? cs.choice("finder-theme", "theme.filter", [["", "theme.filter.any"]].concat(themeList.map(function (t) {
          return { value: String(t.theme_id), text: String(t.name || t.theme_id) };
        })), { value: ui.theme || "" }) + '<p class="mk-small muted">' + cs.w("theme.filter.help") + "</p>"
        + '<span class="mk-acts">' + cs.act("themeread", { label: "act.themeread.label.finder" }) + "</span>" : "");

    // R44: the browse's pages, read once per (kind, only, since) and kept in the screen's page memory: "Show more" adds the next.
    const call = function (extra, merge) {
      const query = { limit: "50" };
      if (kind !== "all") query.kinds = kind;
      if (only !== "any") query.only = only;
      if (only === "new_since" && since) query.since = since;
      if (extra) query.after = extra;
      return cs.call("browse", { query: query }).then(function (a) {
        const v = a && typeof a === "object" && a.result && typeof a.result === "object" ? a.result : a;
        if (!v || v.ok === false || !Array.isArray(v.items)) return { state: "failed", key: key };
        return { state: "ok", key: key, since: since, items: (merge ? merge.items : []).concat(v.items), next: v.truncated && v.next ? String(v.next) : null,
          truncated: !!v.truncated, undetermined: v.undetermined || (merge && merge.undetermined) || null };
      }, function () { return { state: "failed", key: key }; });
    };
    const key = kind + "|" + only + "|" + (only === "new_since" ? since : "");
    let browse = ui.browse && typeof ui.browse === "object" && ui.browse.key === key ? ui.browse : null;
    if (browsing && !ui.theme && !browse && (only !== "new_since" || (lk && lk.state !== "loading"))) {
      if (only === "new_since" && !since) {
        browse = { state: "failed", key: key };
      } else {
        ui.browse = browse = { state: "loading", key: key };
        call(null, null).then(function (r) { cs.set("browse", r); });
      }
    }
    const mark = function (it) {
      const bits = [];
      if (it.new === true) bits.push(cs.w("find.row.new"));
      if (it.watched === true) bits.push(cs.w("find.row.watched"));
      if (it.flagged && typeof it.flagged === "object") {
        bits.push(cs.w("find.row.secondlook", { who: String(it.flagged.by || ""), date: { html: cs.date(String(it.flagged.at || "")) }, note: String(it.flagged.note || "") }));
      }
      return bits;
    };
    const pickBox = function (id, title) {
      return '<input type="checkbox" id="finder-pick-' + cs.esc(id) + '" aria-label="' + cs.w("screen.finder.pick", { title: title }) + '">';
    };
    let results = "";
    if (browsing && ui.theme) {
      // R43: with a theme chosen, what was placed in it, then its hunches apart; a hunch is never drawn as membership.
      const th = view.data.theme;
      results = cs.state("theme", function (v) {
        const row = function (p) {
          const id = String(p.target || "");
          const t = p.document && typeof p.document === "object" && p.document.title ? String(p.document.title) : (typeof p.title === "string" && p.title ? p.title : id);
          return cs.row("", cs.ref(screenOf(p.target_kind, id), id, t, []), "", "");
        };
        const members = Array.isArray(v.members) ? v.members : [];
        const hunches = Array.isArray(v.hunches) ? v.hunches : [];
        return (members.length ? cs.sec("theme.placed", cs.sheet(members.map(row).join(""))) : "")
          + (hunches.length ? cs.sec("theme.hunches", '<p class="mk-small muted">' + cs.w("theme.hunch.note") + "</p>" + cs.sheet(hunches.map(row).join(""))) : "");
      }, { empty: "state.empty" }) || "";
      if (!th) results = "";
    } else if (browsing) {
      if (!browse || browse.state === "loading") results = cs.state({ state: "loading" }, null);
      else if (browse.state === "failed") results = cs.state({ state: "failed", refusal: null }, null);
      else {
        const items = browse.items || [];
        const unread = browse.undetermined && typeof browse.undetermined === "object";
        results = (items.length ? cs.sheet(items.map(function (it) {
          const id = String(it.id);
          const title = String(it.title || "");
          const sc = screenOf(it.kind, id);
          const bits = mark(it);
          const acts = (it.watched === true ? cs.act("watchitem", { label: "find.row.unwatch", data: { item: id, off: "1" } }) : "")
            + (it.flagged ? cs.act("secondlookclear", { label: "act.secondlookclear.label.finder", data: { item: id } }) : "");
          return cs.row(pickBox(id, title), cs.ref(sc, id, title, []) + '<span class="meta"><span>' + cs.w("find.row.kind." + (it.kind === "organization" || it.kind === "person" ? it.kind : sc === "question" ? "question" : sc === "action" ? "action" : sc === "plan" ? "plan" : "document")) + "</span>"
            + (bits.length ? " · " + bits.join(" · ") : "") + (unread ? ' · <span class="muted">' + cs.w("state.undetermined", { reason: String(browse.undetermined.why || "") }) + "</span>" : "") + "</span>", acts, "");
        }).join("")) : cs.state({ state: "empty" }, null))
          + (browse.truncated && browse.next ? '<p class="mk-note">' + cs.w("find.browse.more") + '</p><span class="mk-acts">'
            + cs.act("search", { label: "find.browse.showmore", data: { more: String(browse.next) } }) + "</span>" : "");
      }
    } else {
      // R12 (DEC-201 (13)): no result: the words searched, what search covers, and "Capture it" (the capture screen).
      const sr = view.data.search;
      const none = sr && sr.state === "empty"
        ? '<div class="mk-note" data-state="empty"><p><b>' + cs.w("screen.finder.noresult", { q: q }) + "</b> " + cs.w("screen.finder.covers") + "</p>"
          + '<p class="mk-acts"><a class="cs-btn" data-tone="quiet" data-nav href="/app/capture">' + cs.w("screen.finder.captureit") + "</a></p></div>"
        : "";
      results = view.data.search ? (none || cs.state("search", function (s) {
        const hits = Array.isArray(s.hits) ? s.hits : [];
        const total = typeof s.total === "number" ? s.total : hits.length;
        return '<p class="mk-sub">' + (total === 1 ? cs.w("screen.finder.total.one") : cs.w("screen.finder.total.many", { n: String(total) })) + "</p>"
          + cs.sheet(hits.map(function (h) {
            // R46: a row is a reference of its own kind, its title and a plain excerpt (a passage's words when found through one).
            const id = String(h.bundle_id);
            const title = String(h.title || "");
            const grade = h.grade ? cs.grade("capture", String(h.grade)) + " " : "";
            const where = h.snippet ? excerpt(h.snippet) : "";
            return cs.row(pickBox(id, title), cs.ref(screenOf(h.object_type, id), id, title, []) + '<span class="meta">' + grade + cs.mark("origin", "search") + (where ? " <span>" + where + "</span>" : "") + "</span>", "", "");
          }).join(""));
      })) + (function () {
        const w = sr && (sr.state === "ok" || sr.state === "empty") && sr.value && sr.value.widen;
        return w && typeof w.total === "number" && w.total > 0 && (!sr.value.hits || !sr.value.hits.length)
          ? '<p class="mk-note">' + cs.w("screen.finder.widen", { n: String(w.total) }) + "</p>" : "";
      })() : "";
    }

    const nobody = (ui.frontier && view.data.frontier ? cs.state("frontier", function (f) {
      const n = typeof f.never_looked_count === "number" ? f.never_looked_count : (f.never_looked || []).length;
      // R21: no count at zero.
      if (!n) return '<p class="mk-note">' + cs.w("screen.finder.nobody.none") + "</p>";
      return '<p class="mk-note">' + cs.mark("gap", "nobody") + " " + (n === 1 ? cs.w("screen.finder.nobody.one") : cs.w("screen.finder.nobody", { n: String(n) })) + "</p>"
        + '<ul class="mk-list">' + (f.never_looked || []).slice(0, 20).map(function (x) {
          const t = x && typeof x === "object" ? (x.title || x.referent || x.authority || x.detail || "") : String(x);
          return "<li>" + cs.esc(String(t)) + "</li>";
        }).join("") + "</ul>";
    }, { empty: "screen.finder.nobody.none" }) : "")
      + '<span class="mk-acts">' + cs.act("frontier", { label: "act.frontier.label.finder" }) + "</span>";

    // The hold strip (interface-shell R19's): how many are held together and until when, from `selection`; R45's Watch and
    // Flag for what is picked. Drawn only with results to pick or a set held (R21: no empty hold tray).
    const sel = view.data.selection;
    const rows = hitsOf().length || (browsing && !ui.theme && browse && browse.state === "ok" && (browse.items || []).length);
    const strip = !rows && !ui.handle ? "" : '<div class="cs-hold mk-hold">'
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
      + '<span class="acts">' + (rows ? cs.act("select", { label: "act.select.label.finder" }) : "")
      + (rows ? cs.act("watchitem", { label: "act.owed_watchitem.label.finder" }) : "")
      + (rows ? (function () {
        const button = cs.act("secondlook", { label: "act.owed_secondlook.label.finder" });
        return button ? '<details class="mk-details"><summary>' + cs.w("act.owed_secondlook.label.finder") + "</summary>"
          + cs.field("finder-note", "find.secondlook.note", { help: "find.secondlook.note.help" }) + button + "</details>" : "";
      })() : "")
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
    const says = browsing ? '<p class="mk-small muted">' + cs.w("find.browse.says") + "</p>" : "";

    return head + box + says + filters + results + strip + counted + nobody;
  },

  acts: [
    { op: "search", label: "act.search.label.finder", rereads: ["search"],
      send: function (view, el, cs) {
        const ui = view.ui || {};
        // R44: "Show more" asks the browse's next page (`after` its `next`) and adds it below.
        if (el.dataset.more) {
          const b = ui.browse;
          const subject = view.subject ? String(view.subject) : "";
          const parts = subject.charAt(0) === "~" ? subject.slice(1).split("~") : [];
          const query = { limit: "50", after: el.dataset.more };
          if (parts[0] && parts[0] !== "all") query.kinds = parts[0];
          if (parts[1] && parts[1] !== "any") query.only = parts[1];
          if (parts[1] === "new_since" && b && b.since) query.since = b.since;
          return cs.call("browse", { query: query }).then(function (a) {
            const v = a && typeof a === "object" && a.result && typeof a.result === "object" ? a.result : a;
            if (b && v && v.ok !== false && Array.isArray(v.items)) {
              cs.set("browse", Object.assign({}, b, { items: (b.items || []).concat(v.items), next: v.truncated && v.next ? String(v.next) : null, truncated: !!v.truncated }));
              return null;
            }
            return { refuse: "state.failed", fills: { reason: "" } };
          });
        }
        const q = String(cs.value("finder-q") || "").trim();
        // R44: with no words the browse; leaving the words empty returns to it.
        if (!q) { cs.set("q", ""); return null; }
        cs.set("q", q);
        // R35: the words asked as words, and as passages holding them (retrieval R15); a query in the member's own syntax is sent as written.
        const w = q.split(/\s+/);
        const plain = w.every(function (x) { return /^[\p{L}\p{N}][\p{L}\p{N}'-]*$/u.test(x) && !/^(AND|OR|NOT|NEAR)$/.test(x); });
        const asked = plain ? "(" + w.join(" ") + ") OR (" + w.map(function (x) { return "passage:" + x; }).join(" ") + ")" : q;
        return { query: { q: asked, limit: "50", snippet: "160" } };
      } },
    // Holds the picked results together: an enumerated selection over their ids (retrieval R18).
    { op: "select", label: "act.select.label.finder", rereads: ["selection"],
      send: function (view, el, cs) {
        const s = view.data.search;
        const b = (view.ui || {}).browse;
        const hits = s && s.state === "ok" && s.value && Array.isArray(s.value.hits) ? s.value.hits
          : b && b.state === "ok" && Array.isArray(b.items) ? b.items.filter(function (x) { return x.kind === "document"; }).map(function (x) { return { bundle_id: x.id }; }) : [];
        const ids = hits.map(function (h) { return String(h.bundle_id); }).filter(function (id) {
          const v = cs.value("finder-pick-" + id);
          return v === true || v === "on" || v === "true";
        });
        if (!ids.length) return { refuse: "screen.finder.pickfirst" };
        const q = typeof (view.ui || {}).q === "string" ? view.ui.q : (String(view.subject || "").charAt(0) === "~" ? "" : String(view.subject || ""));
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
  
    // R43: the Theme choice applied; the theme's placements and hunches are read by `themeread` with its id.
    { op: "themeread", label: "act.themeread.label.finder", rereads: ["theme"],
      send: function (view, el, cs) {
        const id = String(cs.value("finder-theme") || "");
        cs.set("theme", id);
        return id ? { query: { id: id } } : null;
      } },
    // R45: Watch, for what is picked, one `watchitem` for each picked item in order; one row's "Take off my watch list" is the
    // same act with `on: false`. A refusal stops the rest and is drawn.
    { op: "watchitem", label: "act.owed_watchitem.label.finder", rereads: [],
      refusals: { MARK_NO_ITEM: "refusal.MARK_NO_ITEM", MARK_NO_SUCH_ITEM: "refusal.MARK_NO_SUCH_ITEM", MACHINE_CANNOT_MARK: "refusal.MACHINE_CANNOT_MARK" },
      send: function (view, el, cs) {
        if (el.dataset.item) return { body: { item: el.dataset.item, on: el.dataset.off ? false : true } };
        const ui = view.ui || {};
        const s = view.data.search;
        const list = s && s.state === "ok" && s.value && Array.isArray(s.value.hits) ? s.value.hits.map(function (h) { return String(h.bundle_id); })
          : ui.browse && ui.browse.state === "ok" ? (ui.browse.items || []).map(function (x) { return String(x.id); }) : [];
        const ids = list.filter(function (id) { const v = cs.value("finder-pick-" + id); return v === true || v === "on" || v === "true"; });
        if (!ids.length) return { refuse: "screen.finder.pickfirst" };
        const rest = ids.slice(0, -1);
        const run = function (i) {
          if (i >= rest.length) return Promise.resolve({ body: { item: ids[ids.length - 1], on: true } });
          return cs.call("watchitem", { body: { item: rest[i], on: true } }).then(function (a) {
            const r = a && typeof a === "object" && a.result && typeof a.result === "object" && a.ok !== false ? a.result : a;
            if (r && r.ok === false) return { refuse: "refusal." + String(r.code || r.reason || "MARK_NO_SUCH_ITEM") };
            return run(i + 1);
          });
        };
        return run(0);
      },
      done: function (view, answer, cs) { cs.set("browse", null); } },
    // R45: Flag for a second look…, one note for each picked item (the first refusal stops the rest and is drawn).
    { op: "secondlook", label: "act.owed_secondlook.label.finder", rereads: [],
      refusals: { MARK_NO_ITEM: "refusal.MARK_NO_ITEM", MARK_NO_SUCH_ITEM: "refusal.MARK_NO_SUCH_ITEM", MACHINE_CANNOT_MARK: "refusal.MACHINE_CANNOT_MARK",
        SECOND_LOOK_NO_NOTE: "refusal.SECOND_LOOK_NO_NOTE", SECOND_LOOK_NOT_OPEN: "refusal.SECOND_LOOK_NOT_OPEN" },
      send: function (view, el, cs) {
        const note = String(cs.value("finder-note") || "").trim();
        if (!note || note.length > 500 || /[\r\n]/.test(note)) return { refuse: "refusal.SECOND_LOOK_NO_NOTE" };
        const ui = view.ui || {};
        const s = view.data.search;
        const list = s && s.state === "ok" && s.value && Array.isArray(s.value.hits) ? s.value.hits.map(function (h) { return String(h.bundle_id); })
          : ui.browse && ui.browse.state === "ok" ? (ui.browse.items || []).map(function (x) { return String(x.id); }) : [];
        const ids = list.filter(function (id) { const v = cs.value("finder-pick-" + id); return v === true || v === "on" || v === "true"; });
        if (!ids.length) return { refuse: "screen.finder.pickfirst" };
        const rest = ids.slice(0, -1);
        const run = function (i) {
          if (i >= rest.length) return Promise.resolve({ body: { item: ids[ids.length - 1], note: note } });
          return cs.call("secondlook", { body: { item: rest[i], note: note } }).then(function (a) {
            const r = a && typeof a === "object" && a.result && typeof a.result === "object" && a.ok !== false ? a.result : a;
            if (r && r.ok === false) return { refuse: "refusal." + String(r.code || r.reason || "MARK_NO_SUCH_ITEM") };
            return run(i + 1);
          });
        };
        return run(0);
      },
      done: function (view, answer, cs) { cs.set("browse", null); } },
    // R45: Clear, on a flagged row: any member who may see the item, no reason asked; the row leaves.
    { op: "secondlookclear", label: "act.secondlookclear.label.finder", rereads: [],
      refusals: { MARK_NO_SUCH_ITEM: "refusal.MARK_NO_SUCH_ITEM", MACHINE_CANNOT_MARK: "refusal.MACHINE_CANNOT_MARK", SECOND_LOOK_NOT_OPEN: "refusal.SECOND_LOOK_NOT_OPEN" },
      send: function (view, el) { return el.dataset.item ? { body: { item: el.dataset.item } } : null; },
      done: function (view, answer, cs) { cs.set("browse", null); } },
  ],
});

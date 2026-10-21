/* Find's drawn states (screens-daily R55 to R57; DEC-330 A14, A15, A17; DEC-335, DEC-336), a screen part (interface-shell R21, K3002)
   handed to `finder` as `view.parts.finderStates`: the whole record as one sortable table (R55); the three routes of a search, each
   read apart and counted apart, under a scope, with what the search covered (R56); and citing the whole held set (R57). `hits`
   answers the fields route's hits for the words now searched; `table`, `routes`, `covered` and `cite` answer HTML. Self-contained:
   it refers only to its parameters and the language's own globals. */

export function finderStates() {
  const word = function (x) { return /^[\p{L}\p{N}][\p{L}\p{N}'-]*$/u.test(x) && !/^(AND|OR|NOT|NEAR)$/.test(x); };
  const wordsOf = function (view) {
    const ui = view.ui || {};
    const subject = view.subject ? String(view.subject) : "";
    return String(typeof ui.q === "string" ? ui.q : (subject.charAt(0) === "~" ? "" : subject)).trim();
  };
  const scopeOf = function (view) {
    const v = String((view.ui || {})["choice:finder-scope"] || "");
    return v && v !== "everything" ? v : "";
  };
  const keyOf = function (view) { return wordsOf(view) + "|" + scopeOf(view); };
  const bodyOf = function (a) { return a && typeof a === "object" ? (a.result && typeof a.result === "object" ? a.result : a) : null; };
  const mine = function (view, route) {
    const r = (view.ui || {})["route:" + route];
    return r && r.key === keyOf(view) ? r : null;
  };
  const hits = function (view) {
    const r = mine(view, "fields");
    return r && r.state === "ok" && r.value && Array.isArray(r.value.hits) ? r.value.hits : [];
  };
  // A state's chip: the kit's for the nine kinds it draws (interface-shell R95), the design's own markup for the other states.
  const CHIP = { document: { collected: "review", verified: "reviewed", retired: "retired" }, question: { open: "open", surfaced: "open", concluded: "concluded", published: "published",
    deferred: "deferred", dismissed: "dismissed", divided: "divided" }, action: { awaiting_response: "waiting", planned: "planned", active: "active", resolved: "resolved", abandoned: "abandoned" } };
  const chip = function (cs, kind, state) {
    if (kind === "entity" || kind === "person" || kind === "organization") return "";
    if (state === null || state === undefined || state === "") return cs.w("state.undetermined", { reason: "" });
    let name = (CHIP[kind] || {})[String(state)];
    if (kind === "plan" && ["open", "paused", "closed"].indexOf(String(state)) >= 0) {
      const k = String(state);
      return '<span class="mk-chip" tabindex="0" data-level="1" data-tip="' + cs.w("screen.plan.state." + k) + ": " + cs.w("state.plan." + k + ".means") + '<span class=why>' + cs.w("state.plan." + k + ".can") + '</span>">' + cs.w("screen.plan.state." + k) + "</span>";
    }
    if (!name) return "";
    if (["review", "reviewed", "retired", "open", "concluded", "published", "waiting", "flagged", "watched"].indexOf(name) >= 0 && typeof cs.stateChip === "function") return cs.stateChip(name);
    // `waiting`, `flagged`, `watched`, `planned` and `active` hold no "cannot" line.
    const cannot = ["waiting", "flagged", "watched", "planned", "active"].indexOf(name) < 0 ? " " + cs.w("state.item." + name + ".cannot") : "";
    const tip = "<b>" + cs.w("state.item." + name + ".name") + "</b>: " + cs.w("state.item." + name + ".means") + "<span class=why>" + cs.w("state.item." + name + ".can") + cannot + "</span>";
    return '<span class="mk-chip" tabindex="0" data-level="1" data-tip="' + tip.replace(/"/g, "&quot;") + '">' + cs.w("state.item." + name + ".name") + "</span>";
  };

  /* ---- R55: the whole record as one sortable table ---- */
  const table = function (cs, ui, browse, screenOf, kindWord, pickBox) {
    const COLS = ["item", "kind", "state", "updated"];
    const sort = ui["sort:finder"] && typeof ui["sort:finder"] === "object" ? ui["sort:finder"] : null;
    const valueOf = function (it, col) {
      return col === 0 ? String(it.title || "").toLowerCase() : col === 1 ? String(it.kind || "") : col === 2 ? String(it.state === null || it.state === undefined ? "" : it.state) : String(it.last_changed || "");
    };
    const items = (browse.items || []).slice();
    if (sort) items.sort(function (a, b) { const x = valueOf(a, sort.col), y = valueOf(b, sort.col); return (x < y ? -1 : x > y ? 1 : 0) * (sort.dir === "desc" ? -1 : 1); });
    const total = typeof browse.total === "number" ? browse.total : items.length;
    const awaiting = typeof browse.awaiting === "number" ? browse.awaiting : 0;
    const count = total === 1 ? cs.w("screen.finder.table.count.one", { m: String(awaiting) }) : cs.w("screen.finder.table.count.other", { n: String(total), m: String(awaiting) });
    const head = COLS.map(function (c, i) {
      const s = sort && sort.col === i ? (sort.dir === "desc" ? "descending" : "ascending") : "none";
      return '<th aria-sort="' + s + '"><button type="button" class="mk-sort" data-shell="sort" data-table="finder" data-col="' + i + '" data-level="2" data-tip="' + cs.w("column.finder." + c + ".shows")
        + '" aria-label="' + cs.w("shell.sort", { column: { html: cs.w("column.finder." + c + ".name") } }) + '">' + cs.w("column.finder." + c + ".name") + "</button></th>";
    }).join("");
    const body = items.map(function (it) {
      const id = String(it.id);
      const sc = screenOf(it.kind, id);
      return "<tr><td>" + pickBox(id, String(it.title || "")) + cs.ref(sc, id, String(it.title || ""), []) + "</td><td>" + kindWord(it, sc) + "</td><td>" + chip(cs, sc === "document" ? "document" : sc === "question" ? "question" : sc === "action" ? "action" : sc === "plan" ? "plan" : "entity", it.state) + '</td><td data-sort="'
        + cs.esc(String(it.last_changed || "")) + '">' + (it.last_changed ? cs.date(String(it.last_changed)) : "") + "</td></tr>";
    }).join("");
    return '<p class="mk-small">' + cs.w("screen.finder.table.intro") + '</p><p class="mk-small"><b>' + count + "</b></p>"
      + '<div class="tw"><table class="mk-table"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table></div>"
      + '<p class="mk-note">' + cs.w("screen.finder.table.sorting") + "</p>"
      + (browse.truncated && browse.next ? '<p class="mk-note">' + cs.w("find.browse.more") + '</p><span class="mk-acts">' + cs.act("search", { label: "find.browse.showmore", data: { more: String(browse.next) } }) + "</span>" : "");
  };

  /* ---- R56: the three routes, each read apart and counted apart ---- */
  const routes = function (cs, view, q, screenOf, pickBox) {
    const ui = view.ui || {};
    const key = keyOf(view);
    const scope = scopeOf(view);
    const w = q.split(/\s+/).filter(Boolean);
    const plain = w.every(word);
    const flat = q.replace(/"[^"]*"/g, '""');
    const written = plain ? null : /passage:/.test(flat) && flat.split(/\s+/).every(function (t) { return /^passage:/.test(t); }) ? "passages" : "fields";
    const want = plain ? ["fields", "passages", "subjects"] : [written];
    const start = function (route, op, query) {
      if (ui["route:" + route] && ui["route:" + route].key === key) return;
      ui["route:" + route] = { key: key, state: "loading", value: null };
      const one = function (a) {
        const r = bodyOf(a);
        if (r === null) return { key: key, state: "failed", code: null, value: null };
        return r.ok === false ? { key: key, state: "failed", code: String(r.code || r.reason || ""), value: r } : { key: key, state: "ok", code: null, value: r };
      };
      cs.call(op, { query: query }).then(function (a) { cs.set("route:" + route, one(a)); }, function () { cs.set("route:" + route, { key: key, state: "failed", code: null, value: null }); });
    };
    const extra = scope ? { scope: scope } : {};
    if (want.indexOf("fields") >= 0) start("fields", "search", Object.assign({ q: plain ? w.join(" ") : q, limit: "50", snippet: "160" }, extra));
    if (want.indexOf("passages") >= 0) start("passages", "meaningrows", Object.assign({ q: plain ? w.map(function (x) { return "passage:" + x; }).join(" ") : q, rows: "passage", limit: "200", snippet: "160" }, extra));
    if (want.indexOf("subjects") >= 0) start("subjects", "subjectsnamed", { q: w.join(" "), limit: "50" });
    const f = mine(view, "fields"), p = mine(view, "passages"), s = mine(view, "subjects");
    const drawn = [f, p, s].filter(Boolean);
    const loading = drawn.some(function (r) { return r.state === "loading"; }) || drawn.length < want.length;
    // The scope: `searchfields` answers the keys (retrieval R87); "Cases" is drawn only if the answer holds one.
    const sv = view.data.scopes && view.data.scopes.state === "ok" ? view.data.scopes.value : null;
    const keys = sv && Array.isArray(sv.scopes) ? sv.scopes.map(function (x) { return String(x && x.key); }) : [];
    const LABEL = { everything: "screen.finder.scope.everything", question: "find.kind.question", document: "find.kind.document", action: "find.kind.action",
      awaiting_review: "state.item.review.name", watched: "find.state.watched", flagged: "find.state.secondlook", cases: "screen.finder.scope.cases" };
    const scopes = keys.length ? cs.choice("finder-scope", "screen.find-in.lookin", keys.filter(function (k) { return LABEL[k]; }).map(function (k) { return [k, LABEL[k]]; }), { value: "everything", acts: {} })
      + '<p class="mk-small muted">' + cs.w("screen.finder.scope.help") + "</p>" : "";
    const crossed = drawn.some(function (r) { return r.state === "failed" && r.code === "ROUTES_CROSSED"; });
    const cross = crossed ? '<details class="mk-details" open><summary>' + cs.w("screen.finder.route.cross.heading") + '</summary><p class="mk-small">' + cs.w("screen.finder.route.cross") + "</p></details>" : "";
    const failedRoute = function (r) { return r && r.state === "failed" && r.code !== "ROUTES_CROSSED" ? cs.state({ state: "failed", refusal: null }, null) : ""; };

    // Fields: "In titles, notes and details".
    const hs = hits(view);
    const ftotal = f && f.state === "ok" ? (typeof f.value.total === "number" ? f.value.total : hs.length) : 0;
    const excerpt = function (text) {
      return String(text).split(/(\[[^\]]*\])/).map(function (part) {
        const m = /^\[([^\]]*)\]$/.exec(part);
        return m ? "<em>" + cs.esc(m[1]) + "</em>" : cs.esc(part);
      }).join("");
    };
    const fieldRows = cs.sheet(hs.map(function (h) {
      const id = String(h.bundle_id);
      // R78: the document's title heads the hit, never its file part or id; one with no title says so.
      const title = typeof h.title === "string" && h.title.trim() ? h.title : h.document && typeof h.document.title === "string" && h.document.title.trim() ? h.document.title
        : cs.w("queue.source.untitled", { date: { html: cs.date(String(h.last_updated || h.captured || "")) } });
      const grade = h.grade ? cs.grade("capture", String(h.grade)) + " " : "";
      const where = h.snippet ? excerpt(h.snippet) : "";
      return cs.row(pickBox(id, title), cs.ref(screenOf(h.object_type, id), id, title, []) + '<span class="meta">' + grade + cs.mark("origin", "search") + (where ? " <span>" + where + "</span>" : "") + "</span>", "", "");
    }).join(""));
    const fieldsSec = f && f.state === "ok" && ftotal > 0
      ? cs.sec("screen.finder.route.fields", '<p class="mk-small">' + (ftotal === 1 ? cs.w("screen.finder.route.fields.holds.one") : cs.w("screen.finder.route.fields.holds.other", { n: String(ftotal) })) + "</p>" + fieldRows) : failedRoute(f);

    // Passages: "In what the documents say".
    const prows = p && p.state === "ok" && Array.isArray(p.value.rows) ? p.value.rows : [];
    const ptotal = p && p.state === "ok" ? (typeof p.value.total === "number" ? p.value.total : prows.length) : 0;
    const docsIn = {};
    prows.forEach(function (r) { docsIn[String(r.bundle_id || r.capture_sha || r.document || "")] = true; });
    const pdocs = Object.keys(docsIn).length;
    const passageRows = cs.sheet(prows.map(function (r) {
      // R83: the row names its document, by the `document` the plane gives it (retrieval R92); one with no title by the kit's plain word, never its id.
      const d = r.document && typeof r.document === "object" ? r.document : {};
      const id = String(d.bundle_id || r.bundle_id || r.document_id || "");
      const t = typeof d.title === "string" && d.title.trim() ? d.title : typeof r.title === "string" && r.title.trim() ? r.title : cs.w("shell.card.document");
      const ex = r.extent && typeof r.extent === "object" ? r.extent : {};
      const place = ex.passage !== undefined ? ex.passage : ex.paragraph;
      return cs.row(cs.mark("origin", "search"), '<span class="rec">' + (r.snippet ? excerpt(r.snippet) : "") + '</span><span class="meta">' + cs.w("find.row.kind.passage") + (r.grade ? " · " + cs.grade("capture", String(r.grade)) : "")
        + (id ? " · " + cs.ref("document", id, t, []) : "") + (place !== undefined ? " · " + cs.w("screen.find-in.passage", { n: String(place) }) : "") + "</span>", "", "");
    }).join(""));
    const passagesSec = p && p.state === "ok" && ptotal > 0
      ? cs.sec("screen.finder.route.passages", '<p class="mk-small">' + (ptotal === 1 ? cs.w("screen.finder.route.passages.holds.one") : cs.w("screen.finder.route.passages.holds.other", { n: String(ptotal), m: String(Math.max(pdocs, 1)) })) + "</p>" + passageRows) : failedRoute(p);

    // Subjects: "Subjects named".
    const srows = s && s.state === "ok" && Array.isArray(s.value.subjects) ? s.value.subjects : [];
    const scount = s && s.state === "ok" ? (typeof s.value.count === "number" ? s.value.count : srows.length) : 0;
    const KIND = { institution: "organization", body: "organization", movement: "organization" };
    const subjectRows = cs.sheet(srows.map(function (x) {
      const k = KIND[String(x.kind)] || String(x.kind);
      const n = typeof x.documents === "number" ? x.documents : 0;
      return cs.row("", cs.ref("person", String(x.entity_id), String(x.label || ""), []) + '<span class="meta">' + cs.w("find.row.kind." + k) + " · "
        + (n === 1 ? cs.w("screen.finder.named.nodoc.one") : cs.w("screen.finder.named.nodoc", { n: String(n) })) + "</span>", "", "");
    }).join(""));
    const subjectsSec = s && s.state === "ok" && scount > 0
      ? cs.sec("screen.finder.subjects.heading", '<p class="mk-small">' + (scount === 1 ? cs.w("screen.finder.route.subjects.holds.one") : cs.w("screen.finder.route.subjects.holds.other", { n: String(scount) })) + "</p>" + subjectRows, { help: "screen.finder.subjects.help" })
      : failedRoute(s);

    if (loading) return scopes + cs.state({ state: "loading" }, null) + cross;
    const answeredAll = drawn.length && drawn.every(function (r) { return r.state === "ok"; });
    const nothing = answeredAll && !ftotal && !ptotal && !scount;
    if (nothing) {
      // R12: no result: the words searched, what search covers, and "Capture it".
      // R78: when the wider reading finds documents (`widen.total` above 0) the partial match is told apart from "nothing matches".
      const widen = f && f.value && f.value.widen;
      const wider = widen && typeof widen.total === "number" && widen.total > 0;
      return scopes + '<div class="mk-note" data-state="empty"><p><b>' + (wider ? cs.w("screen.finder.noresult.partial", { q: q }) : cs.w("screen.finder.noresult", { q: q })) + "</b> " + cs.w("screen.finder.covers") + "</p>"
        + '<p class="mk-acts"><a class="cs-btn" data-tone="quiet" data-nav href="/app/capture">' + cs.w("screen.finder.captureit") + "</a></p></div>"
        + (wider ? '<h3 class="mk-h2">' + cs.w("screen.finder.partial.head") + '</h3><p class="mk-note">' + cs.w("screen.finder.widen", { n: String(widen.total) }) + "</p>" : "");
    }
    const total = f && f.state === "ok" ? "" : "";
    return scopes + fieldsSec + passagesSec + subjectsSec + total + (drawn.length > 1 || plain ? '<p class="mk-small muted">' + cs.w("screen.finder.route.apart") + "</p>" : "") + cross;
  };

  // What this search covered (R56): the four levels, each its own fact; the count of what anything rests on is not among the reads named,
  // so that row is undetermined with the statement's reason.
  const covered = function (cs, view, nobody) {
    const f = mine(view, "fields"), p = mine(view, "passages");
    const src = [f, p].filter(function (r) { return r && r.state === "ok" && r.value && r.value.scope && typeof r.value.scope === "object"; })[0];
    if (!src) return "";
    const sc = src.value.scope;
    const levels = src.value.levels && typeof src.value.levels === "object" ? src.value.levels : {};
    // R76: the plane answers the reason as `why` (`retrieval/levels.mjs`); with none the row would end in a stub, so it is not drawn.
    const reason = levels.meaning && typeof levels.meaning === "object" && typeof levels.meaning.why === "string" ? levels.meaning.why.trim() : "";
    const existence = Array.isArray(sc.existence_only_projects) ? sc.existence_only_projects.length : typeof sc.existence_only_projects === "number" ? sc.existence_only_projects : typeof sc.existence_only_count === "number" ? sc.existence_only_count : 0;
    const rows = [];
    if (reason) rows.push(cs.row(cs.icon("finding"), "<b>" + cs.w("screen.finder.covered.rests") + '</b><span class="meta">' + cs.w("state.undetermined", { reason: reason }) + "</span>", "", ""));
    if (typeof sc.documents === "number") {
      const rest = typeof sc.documents_without_rows === "number" ? sc.documents_without_rows : Math.max(0, sc.documents - (Number(sc.documents_with_rows) || 0));
      const read = typeof sc.documents_with_rows === "number" ? sc.documents_with_rows : sc.documents - rest;
      rows.push(cs.row(cs.icon("capture"), "<b>" + cs.w("screen.finder.covered.read") + '</b><span class="meta">'
        + (rest === 1 ? cs.w("screen.finder.covered.read.says.one", { read: String(read), n: String(sc.documents) }) : cs.w("screen.finder.covered.read.says.other", { read: String(read), n: String(sc.documents), rest: String(rest) })) + "</span>", "", ""));
      rows.push(cs.row(cs.icon("capture"), "<b>" + cs.w("screen.finder.covered.docs") + '</b><span class="meta">'
        + (existence === 1 ? cs.w("screen.finder.covered.docs.says.one", { n: String(sc.documents) }) : cs.w("screen.finder.covered.docs.says.other", { n: String(sc.documents), p: String(existence) })) + "</span>", "", ""));
    }
    rows.push(cs.row(cs.icon("nobody"), "<b>" + cs.w("screen.finder.covered.looked") + "</b>", "", "") + nobody);
    return cs.sec("screen.finder.covered.heading", '<p class="mk-small">' + cs.w("screen.finder.covered.levels") + "</p>" + cs.sheet(rows.join("")));
  };

  /* ---- R67, R77: the frontier at four levels ---- */
  // One row for each level `frontier` answered: the places nobody looked at (`never_looked_count`), else what its `tally` says was
  // looked at; a level this reader does not read (`built: false`) is undetermined with the answer's note, a failed read is failed.
  // "Somebody has looked everywhere" (R77) is said only when every level answered, was read and has no place left unlooked.
  const frontier = function (cs, view) {
    const LEVELS = ["document", "content", "meaning", "internet"];
    const STATES = ["LOOKED_FOUND", "LOOKED_ABSENT", "LOOKED_INDETERMINATE"];
    let everywhere = true;
    let answered = 0;
    const rows = LEVELS.map(function (level) {
      const r = view.data["frontier_" + level];
      if (!r || r.state === "loading") { everywhere = false; return ""; }
      if (r.state === "failed") { everywhere = false; answered++; return cs.row(cs.icon("nobody"), "<b>" + cs.w("screen.answers.level." + level) + "</b>" + cs.state("frontier_" + level, null), "", ""); }
      const v = r.value && typeof r.value === "object" ? r.value : null;
      if (!v) { everywhere = false; return ""; }
      answered++;
      const name = "<b>" + cs.w("screen.answers.level." + level) + "</b>";
      if (v.built === false || v.found === false) {
        everywhere = false;
        return cs.row(cs.icon("nobody"), name + '<span class="meta">' + cs.w("state.undetermined", { reason: String(v.note || "") }) + "</span>", "", "");
      }
      const n = typeof v.never_looked_count === "number" ? v.never_looked_count : (Array.isArray(v.never_looked) ? v.never_looked.length : 0);
      if (n > 0) {
        everywhere = false;
        // C22: each place by its name: its title, name or label, else (document level: an address; internet level: a lead's words) its
        // `subject`; a place with no name, or only a digest or an id, draws no item, and a level with none draws no list.
        const items = (Array.isArray(v.never_looked) ? v.never_looked : []).slice(0, 20).map(function (x) {
          const named = x && typeof x === "object" ? (x.title || x.name || x.label || x.referent || x.detail || (level === "document" || level === "internet" ? x.subject : "") || "") : String(x);
          const label = String(named).trim();
          return label && !/^[0-9a-f]{12,}$/i.test(label) ? "<li>" + cs.esc(label) + "</li>" : "";
        }).filter(Boolean).join("");
        return cs.row(cs.icon("nobody"), name + '<span class="meta">' + cs.mark("gap", "nobody") + " " + (n === 1 ? cs.w("screen.finder.nobody.one") : cs.w("screen.finder.nobody", { n: String(n) })) + "</span>"
          + (items ? '<ul class="mk-list">' + items + "</ul>" : ""), "", "");
      }
      // Nothing left unlooked: the states its tally names (a count apiece), each by its word. The log's `PRESENT` is "looked, found" (as
      // `LOOKED_FOUND` is, the two counted together); a look that could not tell is told by the log's own held word; a state with no
      // word held is not drawn as its code (BOB: `screen.answers.state.LOOKED_INDETERMINATE` for the design lane).
      const tally = v.tally && typeof v.tally === "object" ? v.tally : {};
      const counts = {};
      Object.keys(tally).forEach(function (s) {
        const key = s === "PRESENT" || s === "LOOKED_FOUND" ? "LOOKED_FOUND" : s;
        counts[key] = (counts[key] || 0) + (Number(tally[s]) || 0);
      });
      const said = Object.keys(counts).filter(function (s) { return counts[s] > 0 && STATES.indexOf(s) >= 0; }).map(function (s) {
        const state = s === "LOOKED_INDETERMINATE" ? cs.w("refusal.LOOKED_INDETERMINATE") : cs.w("screen.answers.state." + s);
        return (s === "LOOKED_INDETERMINATE" ? state : cs.w("screen.answers.look", { level: { html: cs.w("screen.answers.level." + level) }, state: { html: state } })) + " (" + cs.esc(String(counts[s])) + ")";
      });
      return cs.row(cs.icon("nobody"), name + (said.length ? '<span class="meta">' + said.join(" · ") + "</span>" : ""), "", "");
    }).filter(Boolean);
    const all = everywhere && answered === LEVELS.length;
    return (rows.length ? cs.sheet(rows.join("")) : "") + (all ? '<p class="mk-note">' + cs.w("screen.finder.nobody.none") + "</p>" : "");
  };

  /* ---- R57: citing the whole held set ---- */
  const cite = function (cs, view, sel) {
    const ui = view.ui || {};
    // The questions the member may see, read once (the first preselected).
    if (!ui.citeQs) {
      ui.citeQs = { state: "loading", value: null };
      cs.call("search", { query: { q: "type:inquiry", limit: "200" } }).then(function (a) {
        const r = bodyOf(a);
        cs.set("citeQs", r && r.ok !== false && Array.isArray(r.hits) ? { state: "ok", value: r.hits } : { state: "failed", value: null });
      }, function () { cs.set("citeQs", { state: "failed", value: null }); });
    }
    const titles = ui.titles && typeof ui.titles === "object" ? ui.titles : {};
    const members = sel && sel.state === "ok" && sel.value && Array.isArray(sel.value.members) ? sel.value.members.map(String) : [];
    const heldRows = cs.sheet(members.filter(function (id) { return titles[id]; }).map(function (id) {
      return cs.row(cs.icon("hold"), '<b class="rec">' + cs.esc(titles[id]) + "</b>", "", "");
    }).join(""));
    const qs = ui.citeQs.state === "ok" ? ui.citeQs.value : [];
    const asked = qs.length ? cs.choice("finder-cite-q", "screen.document.cite.question", qs.map(function (h) { return { value: String(h.bundle_id), text: String(h.title || "") }; }), { value: String(qs[0].bundle_id), acts: {} })
      : ui.citeQs.state === "ok" ? '<p class="mk-note">' + cs.w("screen.document.cite.noquestion") + "</p>" : cs.state({ state: ui.citeQs.state }, null);
    const roles = '<fieldset class="mk-checks" id="finder-cite-role"><legend>' + cs.w("screen.finder.cite.legend") + "</legend>"
      + ["supports", "against"].map(function (r) { return '<label><input type="radio" name="finder-cite-role" id="finder-cite-role-' + r + '" value="' + r + '"> ' + cs.w("screen.finder.cite." + (r === "supports" ? "support" : "against")) + "</label>"; }).join("") + "</fieldset>";
    const done = ui.citeDone && typeof ui.citeDone === "object" ? ui.citeDone : null;
    const nameOf = function (id) { return titles[String(id)] ? '<span class="rec">' + cs.esc(titles[String(id)]) + "</span>" : ""; };
    const didRows = done ? (Array.isArray(done.cited) ? done.cited : []).map(function (id) {
      const n = nameOf(id);
      return n ? cs.row(cs.icon("accepted"), "<b>" + cs.w("screen.finder.cite.cited") + "</b> " + n + '<span class="meta">' + (done.role === "cuts_against" ? cs.w("screen.finder.cite.newly_against") : cs.w("screen.finder.a17.newly_cited_supporting_the_question")) + "</span>", "", "") : "";
    }).concat((Array.isArray(done.alreadyCited) ? done.alreadyCited : []).map(function (id) {
      const n = nameOf(id);
      return n ? cs.row(cs.icon("clock"), "<b>" + cs.w("screen.finder.a17.left_as_it_was") + "</b> " + n + '<span class="meta">' + cs.w("screen.finder.a17.the_question_already_cited_it") + "</span>", "", "") : "";
    })).filter(Boolean).join("") : "";
    // What moved in the held set since it was held for citing: added after, gone since (a document no longer held is not cited).
    const held0 = Array.isArray(ui.citeHeld) ? ui.citeHeld.map(String) : null;
    const moved = held0 && sel && sel.state === "ok" ? {
      added: members.filter(function (id) { return held0.indexOf(id) < 0; }), gone: held0.filter(function (id) { return members.indexOf(id) < 0; }) } : null;
    const changed = moved && (moved.added.length || moved.gone.length)
      ? '<p class="mk-note">' + cs.w("screen.finder.cite.set_changed") + "</p>" + cs.sheet(moved.added.map(function (id) {
        const n = nameOf(id);
        return n ? cs.row(cs.icon("hold"), n + '<span class="meta">' + cs.w("screen.finder.cite.added_since") + "</span>", "", "") : "";
      }).concat(moved.gone.map(function (id) {
        const n = nameOf(id);
        return n ? cs.row(cs.icon("clock"), n + '<span class="meta">' + cs.w("screen.finder.cite.gone_since") + "</span>", "", "") : "";
      })).filter(Boolean).join("")) : "";
    return '<h2 class="mk-h2">' + cs.w("act.cite.label.finder") + "</h2>"
      + '<p class="mk-sub">' + cs.w("screen.finder.a17.cite_every_document_you_hold_together_in") + "</p>" + heldRows + asked + roles
      + '<p class="mk-note">' + cs.w("screen.finder.a17.each_document_is_cited_whole_as_its_own_") + " " + cs.w("screen.finder.a17.a_document_the_question_already_cites_is") + " "
      + cs.w("screen.finder.a17.if_the_set_changed_after_you_held_it_wha") + "</p>"
      + changed
      + '<span class="mk-acts">' + cs.act("cite", { label: "act.cite.label.finder", tone: "primary", data: { handle: String(ui.handle), cite: "1" } })
      + '<a class="cs-btn" data-tone="quiet" data-nav href="/app/finder">' + cs.w("screen.finder.cite.back") + '</a></span><p class="mk-small muted">' + cs.w("screen.finder.cite.back.help") + "</p>"
      + (didRows ? cs.sec("queue.answered.col.did", cs.sheet(didRows)) : "");
  };
  // The state's own act: `cite` over the handle, the question chosen and the role (citation R1: no role is refused in place).
  const citeSend = function (view, el, cs) {
    const q = String(cs.value("finder-cite-q") || "");
    if (!q) return { refuse: "screen.document.cite.noquestion" };
    const chosen = cs.value("finder-cite-role");
    const role = Array.isArray(chosen) && chosen.length === 1 && (chosen[0] === "supports" || chosen[0] === "against") ? (chosen[0] === "against" ? "cuts_against" : "supports") : "";
    if (!role) return { refuse: "screen.findin.cite.norole" };
    return { query: { handle: el.dataset.handle, project: q, role: role }, body: {} };
  };

  return { hits: hits, keyOf: keyOf, table: table, routes: routes, covered: covered, frontier: frontier, cite: cite, citeSend: citeSend, chip: chip };
}

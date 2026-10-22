/* Home's remaining readings (screens-daily R64; N1088, K3189, K4059; DEC-218, DEC-219; amends R17): the figures each area at a
   glance adds, from these reads only. A screen part (interface-shell R21): self-contained, handed to Home as
   `view.parts.homeReadings` and called from its `render`. It returns, for the Investigation, Action, Members and
   Administration areas, the readings (`rd(n, one, many)` as Home draws them: none at zero), the lines and the failed reads, each
   drawn failed in its area, never left out as if empty (R17). The reads the figures wait on (a project's drafts, a draft's
   grants, a case's name) are made as it draws, once each, their outcomes kept in the screen's page memory (`later`). */
export function homeReadings(cs, view, d) {
  const ui = view.ui || {};
  const data = view.data;
  const ok = d.ok;
  const failed = d.failed;
  const rd = d.rd;

  // The drawn form of a refusal or a failed read (one place, so a batch entry and a single read are drawn alike).
  const failure = function (f) {
    const code = String(f.code || f.reason || "");
    return { state: "failed", refusal: { code: code, words: cs.esc(f.translation || code), fields: f } };
  };
  // A read made as the screen draws: once per key and query, kept in page memory, drawn on arrival.
  const later = function (key, op, query) {
    const L = ui.later || (ui.later = {});
    const q = JSON.stringify(query);
    if (!L[key] || L[key].q !== q) {
      L[key] = { q: q, state: "loading" };
      const settle = function (o) { L[key] = Object.assign({ q: q }, o); cs.set("later", L); };
      cs.call(op, { query: query }).then(function (a) {
        const r = a && a.result !== undefined ? a.result : a;
        if (!a || a.ok === false || (r && r.ok === false)) settle(failure(r && r.ok === false ? r : a || {}));
        else settle({ state: "ok", value: r });
      }, function () { settle({ state: "failed", refusal: null }); });
    }
    return L[key];
  };
  const list = function (v, key) { return v && Array.isArray(v[key]) ? v[key] : []; };
  const count = function (n) { return typeof n === "number" && isFinite(n) ? n : null; };

  const out = { investigation: { rds: [], lines: [], fails: [] }, action: { rds: [], lines: [], fails: [] }, members: { lines: [] }, administration: { rds: [], fails: [] } };

  // Documents: `browse`'s `total` over the whole set (retrieval-browse R12).
  const docs = ok(data.docs);
  if (docs) out.investigation.rds.push(rd(count(docs.total), "screen.home.rd.document", "screen.home.rd.documents"));
  else if (failed(data.docs)) out.investigation.fails.push(data.docs);

  // People followed: `peopledirectory`'s `following` (people R37).
  const people = ok(data.followed);
  if (people) out.investigation.rds.push(rd(count(people.following), "screen.home.rd.followed.one", "screen.home.rd.followed.other"));
  else if (failed(data.followed)) out.investigation.fails.push(data.followed);

  // Cases: the distinct case ids of `publishedlist`'s case rows (public-read R2, R29).
  const published = ok(data.published);
  const editions = list(published, "cases").filter(function (c) { return c && c.case_id; });
  const caseIds = [];
  editions.forEach(function (c) { if (caseIds.indexOf(String(c.case_id)) < 0) caseIds.push(String(c.case_id)); });
  if (published) out.investigation.rds.push(rd(caseIds.length, "screen.home.rd.case", "screen.home.rd.cases"));
  else if (failed(data.published)) out.investigation.fails.push(data.published);

  // The editions (`publishedlist`, `publishedcase`) and the drafts shared for review (`casedrafts` once for all, `reviewcopy` per
  // draft): the latest edition's line, and a line for each case with a draft shared until a date, with the recipients' comments to
  // answer (review R14: a grant is live while unrevoked and unlapsed, its `until` its end).
  if (published) {
    const byCase = {};
    // C14 (P2.2; project-roster R42): the roster row says whether a draft is shared for review (`shared_drafts.count`), so only the projects
    // that hold one are asked for their drafts; a row answering `null` (not known, or seen only at existence) is not read one by one.
    // G12c (fix round 6): those projects are asked in ONE `casedrafts` read (`projects`, review R19), each project's answer read from its own
    // entry: a project the viewer may not see answers as the single read answers it, so it is drawn failed as before, never as none.
    const shared = (d.projects || []).filter(function (p) { return p && p.id && p.shared_drafts && Number(p.shared_drafts.count) > 0; });
    const batch = shared.length ? later("drafts", "casedrafts", { projects: shared.map(function (p) { return String(p.id); }).join(",") }) : null;
    if (batch && batch.state === "failed") out.investigation.fails.push(batch);
    if (batch && batch.state === "ok") shared.forEach(function (p) {
      const entry = batch.value && batch.value.projects && batch.value.projects[String(p.id)];
      if (!entry || entry.ok === false) { out.investigation.fails.push(failure(entry || {})); return; }
      list(entry, "drafts").forEach(function (x) {
        if (!x || !x.draft_id || !x.case || !x.case.case_id) return;
        const cp = later("copy:" + x.draft_id, "reviewcopy", { draft: String(x.draft_id) });
        if (cp.state === "failed") { out.investigation.fails.push(cp); return; }
        if (cp.state !== "ok") return;
        const live = list(cp.value, "grants").filter(function (g) { return g && g.live === true && typeof g.until === "string" && g.until; });
        if (!live.length) return;
        const id = String(x.case.case_id);
        const e = byCase[id] || (byCase[id] = { until: "", comments: 0 });
        const until = live.map(function (g) { return String(g.until); }).sort().pop();
        if (until > e.until) e.until = until;
        e.comments += list(cp.value, "comments").filter(function (c) { return c && c.author_kind === "recipient"; }).length;
      });
    });
    const latestOf = function (id) {
      const mine = editions.filter(function (c) { return String(c.case_id) === id; });
      return mine.length ? mine.reduce(function (a, c) { return Number(c.edition) > Number(a.edition) ? c : a; }) : null;
    };
    const newest = editions.length ? editions.reduce(function (a, c) {
      return String(c.published_at || c.signed_at || "") > String(a.published_at || a.signed_at || "") ? c : a; }) : null;
    const lineFor = function (id, latest, draft) {
      let name = id;
      if (latest) {
        const one = later("pubcase:" + id, "publishedcase", { caseId: id, edition: String(latest.edition) });
        if (one.state === "failed") { out.investigation.fails.push(one); return; }
        if (one.state !== "ok" || !one.value) return;
        name = String(one.value.scope || one.value.project_reference || one.value.caseId || id);
      }
      const when = latest && (latest.published_at || latest.signed_at || latest.ratified_at);
      const fills = { n: latest ? String(latest.edition) : "", case: name, date: { html: when ? cs.date(String(when)) : "" } };
      if (draft) fills.until = { html: cs.date(draft.until) };
      let key;
      if (latest && when) {
        if (!draft) key = "screen.home.area.edition.published";
        else if (!draft.comments) key = "screen.home.area.edition";
        else { key = draft.comments === 1 ? "screen.home.area.edition.comments.one" : "screen.home.area.edition.comments"; fills.count = String(draft.comments); }
      } else if (draft) {
        // A draft on a case with no published edition: the draft alone, with one comment, or with several.
        key = draft.comments > 1 ? "screen.home.area.edition.draftonly.comments" : draft.comments === 1 ? "screen.home.area.edition.draftonly.comments.one" : "screen.home.area.edition.draftonly";
        if (draft.comments > 1) fills.count = String(draft.comments);
      } else return;
      out.investigation.lines.push(cs.w(key, fills));
    };
    if (newest) lineFor(String(newest.case_id), latestOf(String(newest.case_id)), byCase[String(newest.case_id)] || null);
    Object.keys(byCase).forEach(function (id) {
      if (newest && id === String(newest.case_id)) return;
      lineFor(id, latestOf(id), byCase[id]);
    });
  }

  // Clocks running (`clocksrunning`, action-clocks R24): all of them; our move (owed by the group) and theirs (owed by a body) each
  // as a line with its count and the earliest date due.
  const clocks = ok(data.clocks);
  if (clocks) {
    const by = clocks.by_owed && typeof clocks.by_owed === "object" ? clocks.by_owed : {};
    out.action.rds.push(rd(count(clocks.total), "screen.home.rd.clock", "screen.home.rd.clocks"));
    [["group", "screen.home.area.ourmove"], ["body", "screen.home.area.theirmove"]].forEach(function (k) {
      const o = by[k[0]];
      if (o && typeof o === "object" && count(o.count) && typeof o.next === "string" && o.next) {
        out.action.lines.push(cs.w(k[1], { n: String(o.count), date: { html: cs.date(o.next) } }));
      }
    });
  } else if (failed(data.clocks)) out.action.fails.push(data.clocks);

  // Expertise on hand: each member's labels as `memberlist` answers them (member-roster R14, R20), the member by handle.
  const roster = ok(data.members);
  const have = [];
  list(roster, "members").forEach(function (m) {
    if (!m || m.status !== "active") return;
    const who = m.handle ? cs.esc(String(m.handle)) : cs.w("member.founder.unnamed");
    (Array.isArray(m.expertise) ? m.expertise : []).filter(function (e) { return e && e.label; }).forEach(function (e) {
      have.push(cs.w("screen.home.area.expertise.person", { member: { html: who }, label: String(e.label), standing: cs.w(e.confirmed ? "screen.home.area.expertise.confirmed" : "screen.home.area.expertise.declared") }));
    });
  });
  if (have.length) out.members.lines.push(cs.w("screen.home.area.expertise", { people: { html: have.join("; ") } }));

  // Security level: `securitymap`'s `level` over the last 24 hours (credentials R45), an administrator's, so only read for one.
  if (d.admin) {
    const map = ok(data.security);
    if (map) {
      const key = { ordinary: "ordinary", raised: "raised", high: "high" }[String(map.level || "").toLowerCase()];
      if (key) out.administration.rds.push('<span class="mk-rd"><b>' + cs.w("screen.home.rd.level." + key) + "</b> " + cs.w("screen.home.rd.security") + "</span>");
    } else if (failed(data.security)) out.administration.fails.push(data.security);
  }
  return out;
}

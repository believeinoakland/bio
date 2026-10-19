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

  // A read made as the screen draws: once per key and query, kept in page memory, drawn on arrival.
  const later = function (key, op, query) {
    const L = ui.later || (ui.later = {});
    const q = JSON.stringify(query);
    if (!L[key] || L[key].q !== q) {
      L[key] = { q: q, state: "loading" };
      const settle = function (o) { L[key] = Object.assign({ q: q }, o); cs.set("later", L); };
      cs.call(op, { query: query }).then(function (a) {
        const r = a && a.result !== undefined ? a.result : a;
        if (!a || a.ok === false || (r && r.ok === false)) {
          const f = r && r.ok === false ? r : a || {};
          const code = String(f.code || f.reason || "");
          settle({ state: "failed", refusal: { code: code, words: cs.esc(f.translation || code), fields: f } });
        } else settle({ state: "ok", value: r });
      }, function () { settle({ state: "failed", refusal: null }); });
    }
    return L[key];
  };
  const list = function (v, key) { return v && Array.isArray(v[key]) ? v[key] : []; };
  const count = function (n) { return typeof n === "number" && isFinite(n) ? n : null; };

  const out = { investigation: { rds: [], lines: [], fails: [] }, action: { rds: [], fails: [] }, members: { lines: [] }, administration: { rds: [], fails: [] } };

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

  // Edition drafts: for each of the member's projects, its drafts (`casedrafts`); for each, the live grant's end from
  // `reviewcopy`; the case's latest published edition and name from `publishedlist` and `publishedcase`. The line says
  // there is no comment to answer, so a draft a recipient has commented on is not drawn with it.
  if (published) {
    const grantEnds = [];
    (d.projects || []).forEach(function (p) {
      if (!p || !p.id) return;
      const dr = later("drafts:" + p.id, "casedrafts", { project: String(p.id) });
      if (dr.state === "failed") { out.investigation.fails.push(dr); return; }
      if (dr.state !== "ok") return;
      list(dr.value, "drafts").forEach(function (x) {
        if (!x || !x.draft_id || !x.case || !x.case.case_id) return;
        const cp = later("copy:" + x.draft_id, "reviewcopy", { draft: String(x.draft_id) });
        if (cp.state === "failed") { out.investigation.fails.push(cp); return; }
        if (cp.state !== "ok") return;
        if (list(cp.value, "comments").some(function (c) { return c && c.author_kind === "recipient"; })) return;
        const live = list(cp.value, "grants").filter(function (g) { return g && g.live === true && typeof g.until === "string" && g.until; });
        if (!live.length) return;
        const until = live.map(function (g) { return String(g.until); }).sort().pop();
        grantEnds.push({ caseId: String(x.case.case_id), until: until });
      });
    });
    grantEnds.forEach(function (g) {
      const mine = editions.filter(function (c) { return String(c.case_id) === g.caseId; });
      if (!mine.length) return;
      const latest = mine.reduce(function (a, c) { return Number(c.edition) > Number(a.edition) ? c : a; });
      const one = later("pubcase:" + g.caseId, "publishedcase", { caseId: g.caseId, edition: String(latest.edition) });
      if (one.state === "failed") { out.investigation.fails.push(one); return; }
      if (one.state !== "ok" || !one.value) return;
      const v = one.value;
      const name = String(v.scope || v.project_reference || v.caseId || g.caseId);
      const when = latest.published_at || latest.signed_at || latest.ratified_at;
      if (!when) return;
      out.investigation.lines.push(cs.w("screen.home.area.edition", { n: String(latest.edition), case: name, date: { html: cs.date(String(when)) }, until: { html: cs.date(g.until) } }));
    });
  }

  // Clocks running (`clocksrunning`, action-clocks R24): all of them, then our move (owed by the group) and theirs (owed by a body).
  const clocks = ok(data.clocks);
  if (clocks) {
    const by = clocks.by_owed && typeof clocks.by_owed === "object" ? clocks.by_owed : {};
    const n = function (k) { return by[k] && typeof by[k] === "object" ? count(by[k].count) : null; };
    out.action.rds.push(rd(count(clocks.total), "screen.home.rd.clock", "screen.home.rd.clocks"), rd(n("group"), "home.move.ours", "home.move.ours"), rd(n("body"), "home.move.theirs", "home.move.theirs"));
  } else if (failed(data.clocks)) out.action.fails.push(data.clocks);

  // Expertise on hand: each member's labels as `memberlist` answers them (member-roster R14, R20), the member by handle.
  const roster = ok(data.members);
  const have = [];
  list(roster, "members").forEach(function (m) {
    if (!m || m.status !== "active") return;
    const labels = (Array.isArray(m.expertise) ? m.expertise : []).filter(function (e) { return e && e.label; });
    if (!labels.length) return;
    const who = m.handle ? cs.esc(String(m.handle)) : cs.w("member.founder.unnamed");
    labels.forEach(function (e) {
      have.push(who + " " + cs.w(e.confirmed ? "screen.members.expertise.confirmed" : "screen.members.expertise.declared", { label: String(e.label) }));
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

/* The group's projects as rows (screens-daily R8, R10; N972; DEC-201 (8)), drawn by Home's "What the group is working on"
   and by the Projects screen. A screen part (interface-shell R21, K3002): self-contained, handed to each screen as
   `view.parts.projectRows` and called from its `render`. Each row is the project as `projectlist` answers it (project-roster
   R26: `{id, name, stage}`), a reference opening `project`, with its question count and its stage on the ladder Forming,
   Investigating, Matured, Closed. A project's count is read from `projectquestions` (basis-versions R50), paged to its end
   (a page may hold fewer than its limit while more follow, so only a null cursor ends it); while its pages are read the
   count says it is loading, and a failed read says so, never "no questions". Counts are kept in the screen's page memory
   (`view.ui.counts`), so a redraw reads none again. Members, activity and last change are drawn once `projectlist`
   answers them (N1025, T48): until then nothing is said of them. `w` is the screen's own word prefix (`screen.home`,
   `screen.projects`). */

export function projectRows(cs, view, w) {
  const STAGES = ["forming", "investigating", "matured", "closed"];
  const ui = view.ui;
  if (!ui.counts || typeof ui.counts !== "object") ui.counts = {};
  const counts = ui.counts;
  // One project's count, paged to the end; the outcome lands in page memory and redraws the screen.
  const count = function (id) {
    counts[id] = { state: "loading" };
    let n = 0;
    const page = function (after) {
      const query = { project: id, limit: "500" };
      if (after) query.after = after;
      return cs.call("projectquestions", { query: query }).then(function (a) {
        const v = a && typeof a === "object" && a.result && typeof a.result === "object" ? a.result : a;
        if (!v || v.ok === false || !Array.isArray(v.items)) return { state: "failed" };
        n += v.items.length;
        return v.cursor ? page(String(v.cursor)) : { state: "ok", n: n };
      }, function () { return { state: "failed" }; });
    };
    page(null).then(function (r) {
      const next = Object.assign({}, ui.counts);
      next[id] = r;
      cs.set("counts", next);
    });
  };
  const countOf = function (id) {
    const c = counts[id];
    if (!c) { count(id); return cs.state({ state: "loading" }, null); }
    if (c.state === "loading") return cs.state({ state: "loading" }, null);
    if (c.state === "failed") return cs.state({ state: "failed", refusal: null }, null);
    return '<span class="mk-count">' + (c.n === 1 ? cs.w(w + ".questions.one") : cs.w(w + ".questions.many", { n: String(c.n) })) + "</span>";
  };
  const ladder = function (state) {
    if (state === null || state === undefined || state === "") {
      return '<span class="cs-ladder" data-ladder="stage">' + cs.w("state.undetermined", { reason: cs.w(w + ".stage.none") }) + "</span>";
    }
    const at = STAGES.indexOf(String(state).toLowerCase());
    return '<div class="cs-ladder" data-ladder="stage" aria-label="' + cs.w(w + ".stage.means") + '">'
      + STAGES.map(function (s, i) {
        return '<span class="' + (at >= 0 && i <= at ? "on" : "") + '"' + (i === at ? ' aria-current="step"' : "") + ">"
          + cs.w(w + ".stage." + s) + "</span>";
      }).join("") + "</div>";
  };
  return function (list) {
    const projects = list && Array.isArray(list.projects) ? list.projects : [];
    return cs.sheet(projects.map(function (p) {
      const id = String(p.id);
      return cs.row("", cs.ref("project", id, p.name || id, []) + '<span class="meta">' + countOf(id) + "</span>", ladder(p.stage), "");
    }).join("")) + (list && list.truncated ? '<p class="mk-note">' + cs.w(w + ".truncated") + "</p>" : "");
  };
}

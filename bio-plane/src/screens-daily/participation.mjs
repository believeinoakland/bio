/* The member's own place in each project listed (screens-daily R29; D25; K3369), a screen part (interface-shell R21, K3002)
   handed to Home and Projects as `view.parts.participation`. `participation(cs, view, projects)` answers `{<id>: state}`: a
   project row that answers `participation` (project-roster's `projectlist`, N1118) is taken at its word; any other is read
   once through `projectparticipants` (project-roster R1: every participant's handle and state, to a participant), the
   member's own row there found by her handle, and the outcome kept in the screen's page memory (`view.ui.mine`), so a
   redraw reads none again. A state still being read, one that failed, and a project the member has no row in, answer no
   state: she is offered nothing on a guess. Self-contained: it refers only to its parameters. */

export function participation(cs, view, projects) {
  const ui = view.ui;
  if (!ui.mine || typeof ui.mine !== "object") ui.mine = {};
  const me = view.me && view.me.handle ? String(view.me.handle) : "";
  const out = {};
  (Array.isArray(projects) ? projects : []).forEach(function (p) {
    if (!p || p.id === undefined || p.id === null) return;
    const id = String(p.id);
    if (typeof p.participation === "string") { out[id] = p.participation; return; }
    const known = ui.mine[id];
    if (known === undefined) {
      ui.mine[id] = { state: "loading" };
      const keep = function (r) {
        const next = Object.assign({}, ui.mine);
        next[id] = r;
        cs.set("mine", next);
      };
      cs.call("projectparticipants", { query: { projectId: id } }).then(function (a) {
        const v = a && typeof a === "object" && a.result && typeof a.result === "object" ? a.result : a;
        if (!v || v.ok === false || !Array.isArray(v.participants)) return keep({ state: "failed" });
        const row = v.participants.filter(function (x) { return x && me && x.handle === me; })[0];
        return keep({ state: "ok", value: row && typeof row.state === "string" ? row.state : "" });
      }, function () { keep({ state: "failed" }); });
    } else if (known.state === "ok" && known.value) out[id] = known.value;
  });
  return out;
}

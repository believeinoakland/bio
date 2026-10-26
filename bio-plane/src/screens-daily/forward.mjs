/* Passing a task to a member (screens-daily R3, R58, R75; C75), a screen part (interface-shell R21, K3002) handed to the queue and
   Home as `view.parts.forward`. `field(cs, view, id)` answers the member to forward to: a choice of the group's active members who have a
   handle (`view.data.roster`, `memberlist`), or, when that read is not answered, the box to type her handle in; `to(cs, view, id)` answers
   `{to}` the member id of the one chosen or typed, or the refusal in place: nothing chosen, or oneself (`refusal.ALREADY_THEIRS`: nothing to forward
   to the member it is already with). `taskforward` takes a member id (tasks R3), so the choice's value is the roster row's `member_id` and
   its text the handle; a handle typed is looked up in the same roster and sent as that id (A-02: the founder's id is `admin`, her handle
   her own). Self-contained: it refers only to its parameters. */

export function forward() {
  const members = function (view) {
    const r = view.data && view.data.roster && view.data.roster.state === "ok" ? view.data.roster.value : null;
    return (r && Array.isArray(r.members) ? r.members : []).filter(function (m) { return m && m.status === "active" && typeof m.handle === "string" && m.handle && m.member_id; })
      .map(function (m) { return { id: String(m.member_id), handle: String(m.handle) }; });
  };
  const field = function (cs, view, id) {
    const list = members(view);
    if (!list.length) return cs.field(id, "screen.queue.forward.to", {});
    return cs.choice(id, "screen.queue.forward.to", [{ value: "", text: "" }].concat(list.map(function (m) { return { value: m.id, text: m.handle }; })), { value: "" });
  };
  const to = function (cs, view, id) {
    const v = String(cs.value(id) || "").trim().replace(/^@/, "");
    if (!v) return { refuse: "screen.queue.fieldfirst" };
    const me = view.me || {};
    const found = members(view).filter(function (m) { return m.id === v; })[0] || members(view).filter(function (m) { return m.handle === v; })[0];
    const who = found ? found.id : v;
    if (v === me.handle || v === me.member || who === me.member) return { refuse: "refusal.ALREADY_THEIRS" };
    return { to: who };
  };
  return { field: field, to: to };
}

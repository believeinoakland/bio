/* Passing a task to a member (screens-daily R3, R58, R75; C75), a screen part (interface-shell R21, K3002) handed to the queue and
   Home as `view.parts.forward`. `field(cs, view, id)` answers the member to forward to: a choice of the group's active members who have a
   handle (`view.data.roster`, `memberlist`), or, when that read is not answered, the box to type her handle in; `to(cs, view, id)` answers
   `{to}` the handle chosen or typed, or the refusal in place: nothing chosen, or oneself (`refusal.ALREADY_THEIRS`: nothing to forward
   to the member it is already with). Self-contained: it refers only to its parameters. */

export function forward() {
  const members = function (view) {
    const r = view.data && view.data.roster && view.data.roster.state === "ok" ? view.data.roster.value : null;
    return (r && Array.isArray(r.members) ? r.members : []).filter(function (m) { return m && m.status === "active" && typeof m.handle === "string" && m.handle; })
      .map(function (m) { return String(m.handle); });
  };
  const field = function (cs, view, id) {
    const list = members(view);
    if (!list.length) return cs.field(id, "screen.queue.forward.to", {});
    return cs.choice(id, "screen.queue.forward.to", [{ value: "", text: "" }].concat(list.map(function (h) { return { value: h, text: h }; })), { value: "" });
  };
  const to = function (cs, view, id) {
    const v = String(cs.value(id) || "").trim().replace(/^@/, "");
    if (!v) return { refuse: "screen.queue.fieldfirst" };
    const me = view.me || {};
    if (v === me.handle || v === me.member) return { refuse: "refusal.ALREADY_THEIRS" };
    return { to: v };
  };
  return { field: field, to: to };
}

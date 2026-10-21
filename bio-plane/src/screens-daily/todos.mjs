/* The to-dos Home and the queue draw as the design draws them (screens-daily R3, R17; B21, DEC-389), a screen part (interface-shell
   R21, K3002) handed to both as `view.parts.todos`: "Vouch for N photos you captured on …" (the registry's `release`), one to-do for
   each place the member's held captures come from, and "Read and approve it" (`filingapprove`) on a letter drafted for the group.
   `reads(view)` answers the read the vouch to-dos need (her own held captures, by `member`); `vouch(cs, view, screen)` answers
   `{n, rows}`, the to-dos as rows; `release(view, el, cs)` and `approve(view, el, cs)` are the two acts' `send`. A read of her
   captures that failed adds no mark of its own: the door to Held captures (`doors.mjs`) draws that same read as failed.
   Self-contained: it refers only to its parameters. */

export function todos() {
  const reads = function (view) {
    const me = view.me && view.me.member ? String(view.me.member) : "";
    return me ? { mine: { op: "heldcaptures", query: { member: me, limit: "500" }, empty: function (v) { return !v || !Array.isArray(v.held) || v.held.length === 0; } } } : {};
  };

  // Her captures, grouped by the place each came from (an upload has none: the keys that say no place), in the order read.
  const groupsOf = function (view) {
    const m = view.data.mine;
    const rows = m && m.state === "ok" && m.value && Array.isArray(m.value.held) ? m.value.held : [];
    const groups = [];
    rows.forEach(function (r) {
      const id = r && (r.bundle_id || r.document);
      const s = r && r.source;
      const at = s && typeof s.address === "string" && s.address && s.via !== "upload" && !/^upload:/.test(s.address) ? s.address : "";
      if (!id) return;
      const g = groups.filter(function (x) { return x.place === at; })[0] || (groups.push({ place: at, ids: [] }), groups[groups.length - 1]);
      g.ids.push(String(id));
    });
    return groups;
  };

  const vouch = function (cs, view, screen) {
    const rows = [];
    groupsOf(view).forEach(function (g, i) {
      const f = screen + "-vouch-" + i;
      const button = cs.act("release", { label: "act.release.label." + screen, data: { ids: g.ids.join(","), f: f }, tone: "primary" });
      if (!button) return;
      // The design's sentence has no form for one photo at a place on Home (REPORT): the dashboard's own sentence for it is used.
      const text = g.place
        ? (g.ids.length === 1 ? cs.w("screen.dash-project.next.vouch.one", { place: g.place })
          : cs.w("screen.home.todo.vouch", { count: String(g.ids.length), place: g.place }))
        : g.ids.length === 1 ? cs.w("screen.home.todo.vouch.noplace.one") : cs.w("screen.home.todo.vouch.noplace", { count: String(g.ids.length) });
      rows.push(cs.row(cs.mark("kind", "todo"), text + '<span class="meta"><details class="mk-details"><summary>' + cs.w("act.release.label." + screen) + "</summary>"
        + cs.field(f + "-ack", "screen.held.ack", { help: "screen.held.ackhelp", max: 500 })
        + cs.field(f + "-mitigation", "screen.held.mitigation", { help: "screen.held.mitigationhelp", max: 500 }) + button + "</details></span>", "", ""));
    });
    return { n: rows.length, rows: rows.join("") };
  };

  // Vouching: an enumerated selection of her captures at the place (`select`), then `release` over its handle with her own
  // acknowledgment and what she did to check, each bounded as ratification R20 bounds it (as the project's dashboard does).
  const release = async function (view, el, cs) {
    const ids = String(el.dataset.ids || "").split(",").filter(Boolean);
    const f = String(el.dataset.f || "");
    const ack = String(cs.value(f + "-ack") || "").trim();
    const mitigation = String(cs.value(f + "-mitigation") || "").trim();
    const plain = function (k) { return String(cs.w(k)).replace(/&(amp|lt|gt|quot|#39);/g, function (m, e) { return { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]; }); };
    if (!ids.length) return { refuse: "screen.held.none" };
    const missing = [!ack && "screen.held.ack", !mitigation && "screen.held.mitigation"].filter(Boolean);
    if (missing.length) return { refuse: "screen.held.vouchmissing", fills: { fields: missing.map(plain).join(", ") } };
    const bad = [["screen.held.ack", ack], ["screen.held.mitigation", mitigation]].filter(function (x) { return Array.from(x[1]).length > 500 || /["\\\r\n]/.test(x[1]); })[0];
    if (bad) return { refuse: "screen.held.vouchbad", fills: { field: plain(bad[0]) } };
    const sel = await cs.call("select", { body: { ids: ids } });
    const s = sel && (sel.result || sel);
    if (!s || s.ok === false || typeof s.handle !== "string") return { refuse: "screen.held.selectfailed" };
    return { query: { handle: s.handle, acknowledgment: ack, mitigation: mitigation }, body: { handle: s.handle, acknowledgment: ack, mitigation: mitigation } };
  };

  // Approving a letter: the action's newest draft not yet approved (`filingsfor`); with none the action's own screen is opened,
  // where its state is, and nothing is sent.
  const approve = async function (view, el, cs) {
    const action = String(el.dataset.subject || "");
    if (!action) return null;
    const a = await cs.call("filingsfor", { query: { action: action } });
    const v = a && typeof a === "object" ? (a.result && typeof a.result === "object" ? a.result : a) : null;
    const drafts = v && Array.isArray(v.drafts) ? v.drafts.filter(function (d) { return d && d.filing && !d.sending && !d.approval; }) : [];
    drafts.sort(function (x, y) { return String(x.at || "") < String(y.at || "") ? -1 : String(x.at || "") > String(y.at || "") ? 1 : 0; });
    if (!drafts.length) { cs.go("action", action); return null; }
    return { body: { filing: String(drafts[drafts.length - 1].filing) } };
  };

  return { reads: reads, vouch: vouch, release: release, approve: approve };
}

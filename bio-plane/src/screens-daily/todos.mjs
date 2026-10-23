/* The to-dos Home and the queue draw as the design draws them (screens-daily R3, R17; B21, DEC-389), a screen part (interface-shell
   R21, K3002) handed to both as `view.parts.todos`: "Vouch for N photos you captured on …" (the registry's `release`), one to-do for
   each place the member's held captures come from (a place with one capture is that document, named by its title, C25), and "Read and approve it" (`filingapprove`) on a letter drafted for the group.
   Their read is the one `doors.mjs` makes (C14, P2.3): the held captures as picker rows (`fields: "picker"`, one limit of 500), of which these
   keep the rows whose `actor` is the member, so a screen asks for them once. `vouch(cs, view, screen)` answers
   `{n, rows}`, the to-dos as rows; `loading(view)` is true while that read is being answered, so a screen draws its list and counts
   once, whole (C70); `items(cs, view, screen)` answers them as queue items with no case, and `merge(list, vouch, sort)` places them
   in the list in the sort the member chose; `release(view, el, cs)` and `approve(view, el, cs)` are the two acts' `send`. A read of her
   captures that failed adds no mark of its own: the door to Held captures (`doors.mjs`) draws that same read as failed.
   Self-contained: it refers only to its parameters. */

export function todos() {
  // The held captures are the doors' read (`view.data.held`); the rows that are hers are those whose capture's `actor` is her.
  const heldOf = function (view) {
    const m = view.data.held;
    const me = view.me || {};
    const hers = function (r) { const a = r && r.actor; return !!a && (a === me.member || a === me.handle); };
    return m && m.state === "ok" && m.value && Array.isArray(m.value.held) ? m.value.held.filter(hers) : [];
  };

  // Her captures, grouped by the place each came from (an upload has none: the keys that say no place), in the order read.
  const groupsOf = function (view) {
    const rows = heldOf(view);
    const groups = [];
    rows.forEach(function (r) {
      const id = r && (r.bundle_id || r.document);
      const s = r && r.source;
      const at = s && typeof s.address === "string" && s.address && s.via !== "upload" && !/^upload:/.test(s.address) ? s.address : "";
      if (!id) return;
      const g = groups.filter(function (x) { return x.place === at; })[0] || (groups.push({ place: at, ids: [], titles: [], since: "" }), groups[groups.length - 1]);
      g.ids.push(String(id));
      g.titles.push(typeof r.title === "string" && r.title.trim() ? r.title.trim() : "");
      // The to-do arose when its first capture began to wait.
      if (typeof r.collected_since === "string" && r.collected_since && (!g.since || r.collected_since < g.since)) g.since = r.collected_since;
    });
    return groups;
  };

  // C70: her captures are being read: a screen that counts them waits for the answer and draws once.
  const loading = function (view) { const m = view.data.held; return !!m && m.state === "loading"; };

  const rowOf = function (cs, g, i, screen) {
    const f = screen + "-vouch-" + i;
    const button = cs.act("release", { label: "act.release.label." + screen, data: { ids: g.ids.join(","), f: f }, tone: "primary" });
    if (!button) return "";
    // The design's sentence has no form for one photo at a place on Home (REPORT): the dashboard's own sentence for it is used.
    // C25: one capture is the document, named as every other list names it (the record's title, a reference to it), not the address it came
    // from; several at a place, or one with no title, keep the sentences about the place.
    const text = g.ids.length === 1 && g.titles[0] ? cs.ref("document", g.ids[0], g.titles[0], [])
      : g.place
      ? (g.ids.length === 1 ? cs.w("screen.dash-project.next.vouch.one", { place: g.place })
        : cs.w("screen.home.todo.vouch", { count: String(g.ids.length), place: g.place }))
      : g.ids.length === 1 ? cs.w("screen.home.todo.vouch.noplace.one") : cs.w("screen.home.todo.vouch.noplace", { count: String(g.ids.length) });
    return cs.row(cs.mark("kind", "todo"), text + '<span class="meta"><details class="mk-details"><summary>' + cs.w("act.release.label." + screen) + "</summary>"
      + cs.field(f + "-ack", "screen.held.ack", { help: "screen.held.ackhelp", max: 500 })
      + cs.field(f + "-mitigation", "screen.held.mitigation", { help: "screen.held.mitigationhelp", max: 500 }) + button + "</details></span>", "", "");
  };
  const vouch = function (cs, view, screen) {
    const rows = groupsOf(view).map(function (g, i) { return rowOf(cs, g, i, screen); }).filter(Boolean);
    return { n: rows.length, rows: rows.join("") };
  };

  // C70: the vouch to-dos as queue items (class OBLIGATION, no case, no day due), each holding its own drawn row.
  const items = function (cs, view, screen) {
    return groupsOf(view).map(function (g, i) {
      const html = rowOf(cs, g, i, screen);
      return html ? { id: "vouch::" + i, vouch: html, class: "OBLIGATION", kind: "vouch", case: { ungrouped: true, ancestors: [] }, due: null, age: { since: g.since } } : null;
    }).filter(Boolean);
  };
  // Places the vouch items where the sort puts a to-do with no case and no day due (queue R49): by case, at the head of what is in no case;
  // by time added, among the items by when they arose (newest first); by time due, after the items with a day due, among the to-dos;
  // by kind, among the to-dos by kind.
  const merge = function (list, vouch, sort) {
    if (!vouch.length) return list;
    const out = list.slice();
    const rank = { OBLIGATION: 0, FINDING: 1, CONDITION: 2 };
    const unplaced = function (x) { const c = x && x.case || {}; return !!c.ungrouped || !(Array.isArray(c.ancestors) && c.ancestors.length); };
    const where = function (v) {
      if (sort === "added") {
        const t = Date.parse(v.age.since || "") || 0;
        return out.findIndex(function (x) { const u = Date.parse(x && x.age && x.age.since || ""); return !isNaN(u) && u < t; });
      }
      if (sort === "due") return out.findIndex(function (x) { return !(x && x.due) && !(x && x.class === "OBLIGATION"); });
      if (sort === "kind") return out.findIndex(function (x) { const r = rank[x && x.class]; return r > 0 || (r === 0 && String(x.kind || "") > v.kind); });
      return out.findIndex(unplaced);
    };
    vouch.forEach(function (v) {
      const i = where(v);
      if (i < 0) out.push(v); else out.splice(i, 0, v);
    });
    return out;
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

  return { vouch: vouch, loading: loading, items: items, merge: merge, release: release, approve: approve };
}

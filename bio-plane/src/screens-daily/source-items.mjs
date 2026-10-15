/* The source notices, kept together (screens-daily R22; K3250, K3254; `queue-producers` R40), a screen part (interface-shell
   R21, K3002) handed to Home and the queue as `view.parts.sourceItems`. All the `source-modified` items are one item with
   their count, and all the `source-removed` items another, each in members' keyed words (`queue.source-modified.one` or
   `.many`, `queue.source-removed.one` or `.many`, with `queue.source.detail`), never the producer's English. Each opens in
   place the list of its documents: each document a reference (its `title`, or `queue.source.untitled`) with its own
   options, drawn by the caller's `actsOf(item)`. `fold(items)` answers the list with each kind's items replaced, where its
   first stood, by one `{kind, sources: [items]}`; `draw(cs, group, actsOf)` answers that one's summary, detail and list.
   Self-contained: it refers only to its parameters. */

export function sourceItems() {
  const KINDS = ["source-modified", "source-removed"];
  const fold = function (items) {
    const out = [];
    const at = {};
    (items || []).forEach(function (it) {
      const k = it && KINDS.indexOf(String(it.kind)) >= 0 ? String(it.kind) : null;
      if (!k) { out.push(it); return; }
      if (!(k in at)) { at[k] = out.length; out.push({ id: "sources:" + k, kind: k, class: it.class, sources: [] }); }
      out[at[k]].sources.push(it);
    });
    return out;
  };
  const draw = function (cs, group, actsOf) {
    const list = group.sources || [];
    const n = list.length;
    const summary = n === 1 ? cs.w("queue." + group.kind + ".one") : cs.w("queue." + group.kind + ".many", { n: String(n) });
    const docs = list.map(function (it) {
      const s = it.subject || {};
      const id = s.id !== undefined && s.id !== null ? String(s.id) : "";
      const title = typeof it.title === "string" && it.title.trim() ? it.title : null;
      // The untitled word names when the document was captured: the item's own date, else when the notice arose.
      const since = it.captured || s.captured || (it.age && it.age.since) || "";
      const name = title ? cs.ref("document", id, title, []) : cs.ref("document", id, cs.w("queue.source.untitled", { date: { html: cs.date(String(since)) } }), []);
      const acts = actsOf ? actsOf(it) : "";
      return "<li>" + name + (acts ? ' <span class="mk-acts">' + acts + "</span>" : "") + "</li>";
    }).join("");
    return { summary: summary, detail: cs.w("queue.source.detail"),
      list: '<details class="mk-details" data-sources="' + cs.esc(group.kind) + '"><summary>' + summary + '</summary><ul class="mk-list">' + docs + "</ul></details>" };
  };
  return { fold: fold, draw: draw };
}

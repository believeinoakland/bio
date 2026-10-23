/* Adopting or keeping a newer version for an item that stands for several notices (screens-daily R93; queue-producers R52, K4367, K4370),
   a screen part (interface-shell R21, K3002) handed to Home and the queue as `view.parts.notices`. A `newer-capture-affects-reference` item
   is one item for every notice of one (holder, target, newer version) and names them in `basis.notices`; `versionadopt` and `versionkeep`
   take one `notice` each, so one press sends the act once for each, else the sibling notice would return as an item of its own on the next
   read. `of(it)` answers the notices an item stands for (as the act's `data-notices`); `send(cs, op, el, fields)` sends the act for all but the
   last with `cs.call` (the same `fields`, the adopt reason among them) and answers the last as the act's own request; a refusal on one of
   them is answered as the act's own request instead, so the shell draws its words once and nothing is sent after it. Self-contained: it refers
   only to its parameters. */
export function notices() {
  const of = function (it) {
    const list = it && it.basis && Array.isArray(it.basis.notices) ? it.basis.notices.map(String).filter(Boolean) : [];
    const own = it && it.disposition && it.disposition.notice ? String(it.disposition.notice) : "";
    return list.length ? list.join(",") : own;
  };
  const send = async function (cs, op, el, fields) {
    const all = String(el.dataset.notices || el.dataset.notice || "").split(",").filter(Boolean);
    const one = function (n) { return { body: Object.assign({ notice: n }, fields) }; };
    for (let i = 0; i < all.length - 1; i++) {
      const a = await cs.call(op, one(all[i]));
      const bad = !a || a.ok === false || (a.result && typeof a.result === "object" && a.result.ok === false);
      if (bad) return one(all[i]);
    }
    return one(all.length ? all[all.length - 1] : String(el.dataset.notice || ""));
  };
  return { of: of, send: send };
}

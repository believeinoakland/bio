/* A stand-in for the shell's side of the guide's contract (J2, J3; K3143; interface-shell R31), so the guide is tested at
   its interface before the shell's half lands: one guide instance with its `view`, a kit `cs` that records every
   request, ring, fill, navigation and device note, and a fake plane answering each op. `enter` plays the shell's route
   (a screen drawn, its reads settled, then `entered`); `cs.go` routes the same way. The guide's functions are called as
   the shell calls them: `start`, `entered`, `pressed`, `ring`, `control`, `render`, `marks`, and its acts' `send`/`done`. */
import { GUIDE, SCREENS } from "../../../src/screens-wizards/index.mjs";
import { wordsOf } from "../../../src/interface-shell/index.mjs";

const WORDS = new Map(wordsOf([...SCREENS, GUIDE]));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/** The shell's `w` (its R5): an unknown key is drawn as the key itself. */
export const w = (key, fills) => esc(WORDS.has(key) ? WORDS.get(key) : key).replace(/\{(\w+)\}/g, (m, n) => {
  if (!fills || !(n in fills)) return m;
  const v = fills[n];
  return v && typeof v === "object" && "html" in v ? v.html : esc(v);
});
export const unhtml = (s) => String(s).replace(/<[^>]*>/g, " ").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])).replace(/\s+/g, " ").trim();
/** A word's text as drawn, filled. */
export const said = (key, fills) => unhtml(w(key, fills));
export const settle = async (n = 20) => { for (let i = 0; i < n; i++) await new Promise((r) => setImmediate(r)); };

/**
 * `plane`: op → answer or `(query, body) => answer` (the answer as `cs.call` hands it: the door's `{ok, result}`).
 * `drawn`: screen → the ops whose controls that screen draws for this member (what `cs.ring` finds).
 * `fields`: op → the id of the field that act sends (what `cs.fieldOf` finds); `values`: field id → its text.
 */
export function standIn({ plane = {}, me = { member: "mai", handle: "mai" }, reachable = false, drawn = {}, fields = {}, values = {}, kit = {} } = {}) {
  const requests = [], rings = [], fills = [], nav = [], sets = [], store = new Map();
  const view = { ui: {}, me, reachable, screen: null, subject: null, parts: GUIDE.parts };
  let routing = Promise.resolve();
  const cs = {
    w, esc,
    async call(op, o = {}) {
      requests.push({ op, query: o.query || {}, body: o.body });
      let a = plane[op];
      if (typeof a === "function") a = a(o.query || {}, o.body);
      return a === undefined ? { ok: true, result: { ok: true } } : JSON.parse(JSON.stringify(a));
    },
    set(name, v) { view.ui[name] = v; sets.push(name); },
    go(screen, subject) { nav.push([screen, subject]); routing = routing.then(() => enter(screen, subject)); },
    ring(op) { rings.push(op); return (drawn[view.screen] || []).includes(op); },
    fieldOf(op) { return (drawn[view.screen] || []).includes(op) && Object.hasOwn(fields, op) ? fields[op] : null; },
    fill(id, value, o) { fills.push({ id, value, label: o && o.label }); values[id] = value; },
    value(id) { return Object.hasOwn(values, id) ? values[id] : null; },
    kept(k) { return store.has(k) ? store.get(k) : null; },
    keep(k, v) { store.set(k, String(v)); },
    act(op, o = {}) { const a = GUIDE.acts.find((x) => x.op === op); return a ? `<button type="button" data-act="${op}">${w(o.label || "act." + op + ".label")}</button>` : ""; },
    field(id, labelKey) { return `<label for="${id}">${w(labelKey)}</label><input id="${id}">`; },
    ...kit,
  };
  async function enter(screen, subject = null) {
    view.screen = screen;
    view.subject = subject;
    await GUIDE.entered(cs, view, { screen, subject });
    await settle();
  }
  const out = {
    view, cs, requests, rings, fills, nav, sets, store, values,
    enter: async (screen, subject) => { await enter(screen, subject); await routing; await settle(); },
    async start(o) { await GUIDE.start(cs, view, o); await settle(); await routing; await settle(); },
    async control(what, d) { await GUIDE.control(cs, view, what, d); await settle(); await routing; await settle(); },
    async pressed(op, screen, extra = {}) { GUIDE.pressed(cs, view, { op, screen, ...extra }); await settle(); },
    async ring() { GUIDE.ring(cs, view); await settle(); },
    render: () => GUIDE.render(cs, view),
    text: () => unhtml(GUIDE.render(cs, view)),
    marks: () => GUIDE.marks(cs, view),
    /* the guide's own act, as the shell runs it (its R21: `send`, then `done` on success) */
    async act(op, answer = { ok: true, result: { ok: true } }) {
      const a = GUIDE.acts.find((x) => x.op === op);
      const req = a.send(view, { dataset: {} }, cs, {});
      if (!req || req.refuse) return req;
      requests.push({ op, query: req.query || {}, body: req.body });
      if (a.done) a.done(view, answer, cs);
      await settle();
      return req;
    },
    progress: () => requests.filter((r) => r.op === "wizardprogress").map((r) => r.body),
  };
  return out;
}

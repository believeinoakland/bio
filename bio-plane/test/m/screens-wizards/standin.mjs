/* A stand-in for the shell's side of the guide's contract (J2, J3; K3143; interface-shell R31), so the guide is tested at
   its interface before the shell's half lands: one guide instance with its `view`, a kit `cs` that records every
   request, ring, fill, navigation and device note. Every op the guide calls is answered by the real store through the world's door
   as the member `as` (K5175; `world.mjs`); `faults` scripts only an answer the world cannot make (a failed read). `enter` plays the shell's route
   (a screen drawn, its reads settled, then `entered`); `cs.go` routes the same way. The guide's functions are called as
   the shell calls them: `start`, `entered`, `pressed`, `ring`, `control`, `render`, `marks`, and its acts' `send`/`done`. */
import { GUIDE, SCREENS } from "../../../src/screens-wizards/index.mjs";
import { wordsOf } from "../../../src/interface-shell/index.mjs";

const WORDS = new Map(wordsOf([...SCREENS, GUIDE]));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
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

/** The page's request for `op`, as the shell's `cs.call` makes it. */
const requestOf = (op, o = {}) => ({ url: `/api/?${new URLSearchParams({ op, ...(o.query || {}) })}`,
  init: o.body === undefined ? { method: "GET" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(o.body) } });

/**
 * `team`, `as`: the world (`world.mjs`) and the member whose door answers every op; `faults`: op → an answer (or `(query, body) => answer`)
 * for a read that failed, the one thing the world cannot be asked to make (`silent`, a refusal's shape).
 * `drawn`: screen → the ops whose controls that screen draws for this member (what `cs.ring` finds).
 * `fields`: op → the id of the field that act sends (what `cs.fieldOf` finds); `values`: field id → its text.
 */
export function standIn({ team = null, as = null, faults = {}, reachable = false, drawn = {}, fields = {}, values = {}, kit = {} } = {}) {
  const requests = [], rings = [], fills = [], nav = [], sets = [], store = new Map();
  /* the world answers after real work, which a count of ticks does not wait for: settling also waits while a call of the guide is out */
  let inflight = 0;
  const quiet = async (n = 20) => { do { await settle(n); } while (inflight > 0); };
  const me = as ? { member: as.member, handle: as.handle } : { member: "mai", handle: "mai" };
  const view = { ui: {}, me, reachable, screen: null, subject: null, parts: GUIDE.parts };
  let routing = Promise.resolve();
  const answer = async (op, o = {}) => {
    if (Object.hasOwn(faults, op)) { const f = faults[op]; return typeof f === "function" ? f(o.query || {}, o.body) : f; }
    if (!team || !as) throw new Error(`standIn: ${op} was asked with no world to answer it`);
    /* what the shell's `cs.call` hands back (interface-shell R21): the whole answer, or a refusal's own fields */
    const j = (await team.world.door(requestOf(op, o), as)).json;
    const value = j && typeof j === "object" && "result" in j ? j.result : j;
    return j && typeof j === "object" && j.ok === false ? j : value && typeof value === "object" && value.ok === false ? value : j;
  };
  const cs = {
    w, esc,
    async call(op, o = {}) {
      requests.push({ op, query: o.query || {}, body: o.body });
      inflight++;
      try { return await answer(op, o); } finally { inflight--; }
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
    choice(id, labelKey, options) { return `<label for="${id}">${w(labelKey)}</label><select id="${id}">${options.map((o) => `<option value="${esc(o.value)}">${esc(o.text)}</option>`).join("")}</select>`; },
    ...kit,
  };
  async function enter(screen, subject = null) {
    view.screen = screen;
    view.subject = subject;
    await GUIDE.entered(cs, view, { screen, subject });
    await quiet();
  }
  const out = {
    view, cs, answered: null, requests, rings, fills, nav, sets, store, values,
    enter: async (screen, subject) => { await enter(screen, subject); await routing; await quiet(); },
    async start(o) { await GUIDE.start(cs, view, o); await quiet(); await routing; await quiet(); },
    async control(what, d) { await GUIDE.control(cs, view, what, d); await quiet(); await routing; await quiet(); },
    async pressed(op, screen, extra = {}) { GUIDE.pressed(cs, view, { op, screen, ...extra }); await quiet(); },
    async ring() { GUIDE.ring(cs, view); await quiet(); },
    render: () => GUIDE.render(cs, view),
    text: () => unhtml(GUIDE.render(cs, view)),
    marks: () => GUIDE.marks(cs, view),
    /* the guide's own act, as the shell runs it (its R21: `send`, then `done` on success) */
    async act(op) {
      const a = GUIDE.acts.find((x) => x.op === op);
      const req = a.send(view, { dataset: {} }, cs, {});
      if (!req || req.refuse) return req;
      requests.push({ op, query: req.query || {}, body: req.body });
      const made = team && as ? await answer(op, req) : { ok: true, result: { ok: true } };
      out.answered = made;
      if (a.done && made && made.ok !== false && !(made.result && made.result.ok === false)) a.done(view, made, cs);
      await quiet();
      return req;
    },
    progress: () => requests.filter((r) => r.op === "wizardprogress").map((r) => r.body),
  };
  return out;
}

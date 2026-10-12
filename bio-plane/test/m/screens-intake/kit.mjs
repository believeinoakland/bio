/* A stand-in for interface-shell's kit and harness (K2998: each screen job builds to R21 with its own stand-in until the
 * shell's shared DOM stand-in is merged; re-pointed then). It holds only what interface-shell R21 states:
 *
 * - every screen function is compiled from its own text in a fresh `vm` context holding only the language's globals
 *   (R21 (1)), so a function reaching a module-scope name, `fetch`, `document`, storage, `crypto` or `URL` throws here as
 *   it would in the page;
 * - `w` draws only words a list holds (`WORD_ROWS`, or the screen's own `words` rows) and throws on any other key
 *   (interface-shell R5's test), HTML-escaping each fill;
 * - `call` and `download` record every request the screens make, answered by a script;
 * - `value` and `file` answer the fields a test sets. */
import vm from "node:vm";
import { createHash } from "node:crypto";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";

const SHARED = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* What crosses the wire (or the page's memory) as data, in this realm: the screens' objects are made in their own. */
export const plain = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const unesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/* R21 (1): a function compiled in a context holding only the language's own globals. */
export function compiled(fn) {
  if (typeof fn !== "function") return fn;
  const ctx = vm.createContext({});
  return vm.runInContext(`(${fn.toString()})`, ctx);
}

/* The screen as the page would hold it: every function recompiled from its text. */
export function pageScreen(screen) {
  return {
    ...screen,
    reads: compiled(screen.reads),
    render: compiled(screen.render),
    acts: screen.acts.map((a) => ({ ...a, send: compiled(a.send), done: compiled(a.done) })),
  };
}

/* The words a screen may draw (R21 (1)): its keys of WORD_ROWS and its own rows. */
export function wordsFor(screen) {
  const own = new Map();
  for (const w of screen.words) if (Array.isArray(w)) own.set(w[0], w[1]);
  const keys = new Set(screen.words.map((w) => (Array.isArray(w) ? w[0] : w)));
  return { own, keys };
}

/* The kit over one screen and its view. `opts.can(op)` gates acts (R12); `opts.answers[op]` scripts each call's answer
 * (an object, or a function of the request); `opts.values` and `opts.files` the fields. */
export function kit(screen, view, opts = {}) {
  const { own, keys } = wordsFor(screen);
  const requests = [], drawnKeys = new Set(), saved = [];
  const word = (key, fills = {}) => {
    const en = own.has(key) ? own.get(key) : keys.has(key) || opts.anyShared ? SHARED.get(key) : undefined;
    if (typeof en !== "string") throw new Error(`screen ${screen.id} drew the key ${key}, which no list holds for it`);
    drawnKeys.add(key);
    return en.replace(/\{(\w+)\}/g, (m, n) => (fills && n in fills ? esc(fills[n]) : m));
  };
  /* the kit's own words (its states, a mark's name): the shell's to hold, not the screen's */
  const shellWord = (key, fills = {}) => SHARED.get(key).replace(/\{(\w+)\}/g, (m, n) => (fills && n in fills ? esc(fills[n]) : m));
  const answerOf = (op, req) => {
    const a = opts.answers && opts.answers[op];
    return typeof a === "function" ? a(req) : a === undefined ? { ok: true } : a;
  };
  const cs = {
    w: word,
    esc,
    t: (key, fills) => unesc(word(key, fills)),
    state(outcome, inner, o = {}) {
      if (typeof outcome === "string") outcome = view.data[outcome];
      if (!outcome || outcome.state === "loading") return `<p class="cs-state" data-state="loading">${shellWord("state.loading")}</p>`;
      if (outcome.state === "failed") return `<p class="cs-state" data-state="failed">${shellWord("state.failed", { reason: (outcome.refusal && (outcome.refusal.words || outcome.refusal.code)) || "" })}</p>`;
      if (outcome.state === "empty") return `<p class="cs-state" data-state="empty">${o && o.empty ? word(o.empty) : shellWord("state.empty")}</p>`;
      return inner(outcome.value);
    },
    act(op, o = {}) {
      if (opts.can && !opts.can(op)) return "";
      const a = screen.acts.find((x) => x.op === op);
      if (!a) throw new Error(`screen ${screen.id} drew act ${op}, which it does not declare`);
      const data = o.data ? Object.entries(o.data).map(([k, v]) => ` data-${k}="${esc(v)}"`).join("") : "";
      return `<button type="button" class="cs-btn" data-act="${op}"${data}>${word(o.label || a.label)}</button>`;
    },
    can: (op) => !opts.can || opts.can(op),
    go: () => "",
    set(name, value) { view.ui[name] = plain(value); },
    value: (id) => (opts.values && id in opts.values ? opts.values[id] : ""),
    file: (id) => (opts.files && opts.files[id]) || null,
    ref: (kind, id, text) => `<a class="cs-ref" data-ref="${esc(kind)}:${esc(id)}" href="/app/${esc(kind)}/${esc(id)}">${text}</a>`,
    mark: (family, value) => `<span class="cs-mark" data-mark="${family}.${value}">${shellWord(`mark.${family}.${value}.name`)}</span>`,
    grade: (scale, letter) => `<span class="cs-grade" data-scale="${esc(scale)}">${esc(letter)}</span>`,
    due: () => "",
    hint: () => "",
    date: (iso) => `<time data-iso="${esc(iso)}">${esc(String(iso).slice(0, 10))}</time>`,
    row: (...c) => `<div class="cs-row">${c.join("")}</div>`,
    /* K3002: `cols` the header word keys, `cells(item)` the row's cell HTML, `acts(item)` its panel's HTML, `key(item)` */
    rows({ cols, items, key, cells, pick, acts }) {
      return `<div class="cs-rows"><div class="cs-head">${(cols || []).map((c) => `<span>${word(c)}</span>`).join("")}</div>`
        + (items || []).map((it) => `<div class="cs-row" data-key="${esc(key(it))}">`
        + (pick ? `<input type="checkbox" data-pick="${esc(key(it))}" aria-label="pick">` : "") + cells(it).join("")
        + (acts ? `<div class="cs-panel">${acts(it)}</div>` : "") + "</div>").join("") + "</div>";
    },
    sec: (titleKey, inner) => `<section class="cs-section"><h2>${word(titleKey)}</h2>${inner}</section>`,
    sheet: (inner) => `<div class="cs-sheet">${inner}</div>`,
    field: (id, labelKey, o = {}) => `<div class="cs-field"><label for="${id}">${word(labelKey)}</label>`
      + (o.help ? `<span class="help">${word(o.help)}</span>` : "")
      + (o.area ? `<textarea id="${id}">${esc(o.value)}</textarea>` : `<input id="${id}" value="${esc(o.value)}">`) + "</div>",
    choice: () => "",
    checks: () => "",
    title: (text) => esc(text),
    now: () => opts.now ?? Date.parse("2026-10-12T09:00:00Z"),
    async digest(text) { return createHash("sha256").update(String(text), "utf8").digest("hex"); },
    async call(op, o = {}) {
      const req = { op, query: plain(o.query || {}), body: plain(o.body), kind: "call" };
      requests.push(req);
      return answerOf(op, req);
    },
    async download(op, o = {}) {
      const req = { op, query: plain(o.query || {}), body: plain(o.body), kind: "download" };
      requests.push(req);
      const a = answerOf(op, req);
      if (a && a.ok !== false && a.bytes !== undefined) saved.push({ op, name: a.name });
      return a && a.ok === false ? { ok: false, answer: a } : { ok: true, answer: a };
    },
  };
  return { cs, requests, drawnKeys, saved };
}

/* A view for a screen: every read in the state asked (`ok` with the value given, or the state named). */
export function viewOf(screen, { subject = null, data = {}, me = { member: "MEM-1", administer: false }, ui = {}, reachable = false } = {}) {
  return { subject, data, me, ui, reachable };
}

/* The harness's act: `send`, then (unless it sends nothing or refuses) the act's own request, then `done` on success.
 * Answers what happened: `{sent, refused, request, answer}`. */
export async function press(screen, view, op, opts = {}) {
  const act = screen.acts.find((a) => a.op === op);
  if (!act) throw new Error(`no act ${op}`);
  const k = opts.kit || kit(screen, view, opts);
  const el = { dataset: opts.dataset || {} };
  const extra = { picked: opts.picked || [], fields: opts.fields || {} };
  const out = await act.send(view, el, k.cs, extra);
  if (out === null || out === undefined) return { sent: false, kit: k };
  if (out.refuse) return { sent: false, refused: { key: out.refuse, fills: plain(out.fills), text: k.cs.w(out.refuse, out.fills || {}) }, kit: k };
  const request = { op, query: plain(out.query || {}), body: plain(out.body), raw: out.raw, kind: "act" };
  if (opts.reason !== undefined) request.body = { ...(request.body || {}), [act.reasonField || "reason"]: opts.reason };
  k.requests.push(request);
  const a = opts.answers && opts.answers[op];
  const answer = typeof a === "function" ? a(request) : a === undefined ? { ok: true } : a;
  if (answer && answer.ok === false) {
    const code = answer.reason || answer.code;
    const key = act.refusals && act.refusals[code];
    return { sent: true, request, refused: key ? { key, text: k.cs.w(key) } : { answer }, kit: k };
  }
  if (act.done) await act.done(view, answer, k.cs);
  return { sent: true, request, answer, kit: k };
}

export const ok = (value) => ({ state: "ok", value });

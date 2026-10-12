/* screens-inquiry's test stand-in for interface-shell's kit (its R21's contract, K2996, K2998), until the shell's shared
 * DOM stand-in is announced (B2). It drives each screen the way the page does:
 *
 *  - every screen function is REBUILT FROM ITS SOURCE TEXT (`toString()`) in a scope holding nothing but the language's
 *    globals, as the shell composes the page's script; a function naming anything from its module's scope throws here;
 *  - `cs` draws plain HTML with data attributes the tests read (`data-act`, `data-key`, `data-mark`, `data-ref`);
 *  - `cs.w` draws a word only by a key the screen lists in its `words` (interface-shell R5), recording every key;
 *  - `cs.call` goes to a stub plane, recording each request's op, query, body and `Authorization` header;
 *  - acts are pressed as the shell presses them: `send(view, el, cs, extra)`, and its answer sent through the stub. */

import { WORD_ROWS } from "../../../src/setup-words/index.mjs";

const FROZEN_GLOBALS = ["JSON", "Math", "String", "Number", "Array", "Object", "Date", "Promise", "encodeURIComponent"];

/** A function rebuilt from its source in a scope of the language's globals only (a method's shorthand wrapped). */
export function rebuild(fn) {
  if (typeof fn !== "function") return fn;
  const src = fn.toString();
  const expr = /^(async\s+)?function\b/.test(src) || /^\(?[\w\s,{}[\]]*\)?\s*=>/.test(src) ? `(${src})` : `({${src}})[${JSON.stringify(fn.name)}]`;
  // eslint-disable-next-line no-new-func
  return new Function(...FROZEN_GLOBALS, `"use strict"; return ${expr};`)(JSON, Math, String, Number, Array, Object, Date, Promise, encodeURIComponent);
}

/** A screen with every function rebuilt. */
export function rebuilt(screen) {
  return {
    ...screen,
    reads: rebuild(screen.reads), render: rebuild(screen.render), place: rebuild(screen.place), closed: rebuild(screen.closed),
    acts: screen.acts.map((a) => ({ ...a, send: rebuild(a.send), done: rebuild(a.done) })),
  };
}

const ENGLISH = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

/** A session token the tests look for in every request (interface-shell R3's sentinel). */
export const SESSION = "5e55" + "a".repeat(60);

/**
 * A harness over one screen: `plane` maps an op to `(req) => answer` (the parsed answer the page would get); `denied`
 * lists ops the session may not do (drawn absent, interface-shell R12).
 */
export function harness(screen, { subject = "", data = {}, me = { member: "m1", handle: "rosa", session: true }, reachable = true,
                                   plane = {}, denied = [], fields = {}, ui = {} } = {}) {
  const s = rebuilt(screen);
  const words = new Map();
  for (const w of s.words) {
    if (typeof w === "string") words.set(w, ENGLISH.get(w));
    else words.set(w[0], w[1]);
  }
  const h = {
    screen: s, keys: new Set(), unlisted: new Set(), requests: [], went: [], redraws: 0, html: "",
    view: { subject, data, me, ui, reachable }, fields: { ...fields }, denied: new Set(denied), clock: Date.UTC(2026, 9, 12, 9, 30),
  };
  const w = (key, fills = {}) => {
    h.keys.add(key);
    if (!words.has(key)) { h.unlisted.add(key); return `<span data-key="${esc(key)}" data-unlisted="1"></span>`; }
    const en = words.get(key);
    if (en === undefined) { h.unlisted.add(key); return ""; }
    const text = en.replace(/\{(\w+)\}/g, (m, n) => (fills && fills[n] !== undefined ? esc(fills[n]) : m));
    return `<span data-key="${esc(key)}">${text}</span>`;
  };
  const stateOf = (o, inner, opts = {}) => {
    if (!o || o.state === "loading") return `<p data-state="loading">${w("state.loading")}</p>`;
    if (o.state === "empty") return `<p data-state="empty">${w(opts.empty || "state.empty")}</p>`;
    if (o.state === "failed") return `<p data-state="failed">${w("state.failed", { reason: (o.refusal && (o.refusal.words || o.refusal.code)) || "" })}</p>`;
    return `<div data-state="ok">${inner(o.value)}</div>`;
  };
  const cs = {
    w, esc,
    state(a, b, c) {
      if (typeof a === "string" && b && typeof b === "object" && "data" in b) return stateOf(b.data[a], c);
      if (typeof a === "string") return stateOf(h.view.data[a], b, c || {});
      return stateOf(a, b, c || {});
    },
    can: (op) => !h.denied.has(op),
    act(op, { label, data = {}, tone } = {}) {
      if (h.denied.has(op)) return "";
      const attrs = Object.entries(data).map(([k, v]) => ` data-${k.replace(/[A-Z]/g, (x) => "-" + x.toLowerCase())}="${esc(v)}"`).join("");
      return `<button type="button" data-act="${esc(op)}"${tone ? ` data-tone="${tone}"` : ""}${attrs}>${w(label)}</button>`;
    },
    go(screen2, subject2) { h.went.push([screen2, subject2]); },
    set(name, value) { h.view.ui[name] = value; h.redraws++; },
    value: (id) => h.fields[id],
    file: () => null,
    ref: (kind, id, text, facts = []) => `<a data-ref="${esc(kind)}" data-id="${esc(id)}" data-facts="${esc((facts || []).join(" · "))}">${text}</a>`,
    mark: (family, value, fills) => `<span data-mark="${esc(family)}.${esc(value)}">${w(`mark.${family}.${value}.name`)}</span>`,
    grade: (scale, letter) => `<span data-grade="${esc(scale)}" data-letter="${esc(letter)}">${w(`mark.scale.${scale}.name`)} ${esc(letter)}</span>`,
    due: (iso) => `<span data-due="${esc(iso)}"></span>`,
    hint: () => "",
    date(iso, { year } = {}) {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getUTCMonth()];
      return `${d.getUTCDate()} ${m}${year ? " " + d.getUTCFullYear() : ""}`;
    },
    row: (a = "", b = "", c = "") => `<div class="row">${a}${b}${c}</div>`,
    rows: () => "",
    sec: (key, inner, { help } = {}) => `<section data-sec="${esc(key)}"><h2>${w(key)}</h2>${help ? `<span data-help="${esc(help)}">${w(help)}</span>` : ""}${inner}</section>`,
    sheet: (x) => `<div class="sheet">${x}</div>`,
    field: (id, labelKey, { help } = {}) => `<label for="${esc(id)}">${w(labelKey)}</label>${help ? w(help) : ""}<input id="${esc(id)}" data-field="${esc(id)}">`,
    choice: (id, labelKey, options = [], { value } = {}) => `<label for="${esc(id)}">${w(labelKey)}</label><select id="${esc(id)}" data-field="${esc(id)}">`
      + options.map((o) => `<option value="${esc(o.value)}"${o.value === value ? " selected" : ""}>${o.key ? w(o.key) : esc(o.text)}</option>`).join("") + "</select>",
    checks: () => "",
    title: (text) => `<h1>${text}</h1>`,
    now: () => h.clock,
    call(op, { query = {}, body, bearer } = {}) {
      const req = { op, query: { ...query }, body: body === undefined ? undefined : JSON.parse(JSON.stringify(body)),
                    authorization: `Bearer ${bearer === undefined ? SESSION : bearer}` };
      h.requests.push(req);
      const f = plane[op];
      if (!f) return Promise.resolve({ ok: false, reason: "UNKNOWN_OP" });
      try { return Promise.resolve(f(req)); } catch (e) { return Promise.reject(e); }
    },
  };
  h.cs = cs;
  h.render = () => { h.html = s.render(cs, h.view); return h.html; };
  /* let every pending call and its continuations run, redrawing after, as the shell does on `cs.set` */
  h.settle = async () => {
    for (let round = 0; round < 6; round++) {
      const before = h.requests.length + h.redraws;
      for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r));
      h.render();
      for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r));
      if (h.requests.length + h.redraws === before) break;
    }
    return h.render();
  };
  /* press an act as the shell does: its `send`, then (for an answer) the request through the stub plane and `done` */
  h.press = async (op, { data = {}, dialog = {} } = {}) => {
    const a = s.acts.find((x) => x.op === op);
    if (!a) throw new Error(`no act ${op}`);
    const el = { dataset: { ...data } };
    const sent = a.send(h.view, el, cs, { fields: { ...dialog } });
    let answer = null;
    if (sent && !sent.refuse) {
      const body = sent.body === undefined ? undefined : { ...sent.body, ...(dialog.reason !== undefined && sent.body ? {} : {}) };
      answer = await cs.call(op, { query: sent.query, body });
      if (a.done && answer && answer.ok !== false && !(answer.result && answer.result.ok === false)) a.done(h.view, answer, cs);
    }
    await h.settle();
    return { sent, answer };
  };
  /* the acts drawn, by op, in the order drawn */
  h.drawn = () => [...h.html.matchAll(/data-act="([^"]+)"/g)].map((m) => m[1]);
  return h;
}

/** The answer envelope the door gives a handler's result (control-plane's generic forward). */
export const answer = (result) => ({ ok: true, result });
/** A refusal inside the envelope. */
export const refusal = (code, extra = {}) => ({ ok: true, result: { ok: false, reason: code, code, ...extra } });
/** A read outcome as the shell hands it (`view.data[name]`). */
export const okd = (value) => ({ state: "ok", value });
export const failed = (code) => ({ state: "failed", value: null, refusal: code ? { code } : null });
export const loading = () => ({ state: "loading" });
export const emptyd = () => ({ state: "empty", value: null });

/* screens-entry's tests at the module's interface: its `SCREENS` (interface-shell R21) driven through a stand-in of the
   shell's kit `cs` as interface-shell R21, R27 and R46 state it, over a fake plane that records every request with its
   op, query, body and whether it carried the session. `open(id, …)` draws a screen with its reads answered from a table
   (an answer, a refusal `{ok: false, code}`, `"none"` for no answer, `"pending"`), `press(op, …)` fills fields and runs
   the act as the shell runs it (`send`, the request, `refusals` or `done`, the re-reads), and `tree`/`text` read what
   was drawn. The words are the shell's: `WORD_ROWS` with this module's own rows over it (interface-shell R5).
   The real page's frame (no header, no rail, the fragment taken from the address) is tested over the shell's harness
   in `page.test.mjs`. */
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { OPS, SESSION_OPS, NEEDS } from "../../../src/op-declarations/index.mjs";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-entry/index.mjs";
import fs from "node:fs";
export { SCREENS, SCREEN_WORDS };

// ---- the words: WORD_ROWS, then words.json at the tranche's merge where WORD_ROWS does not yet carry a key, then ours ----
const WORDS = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));
try {
  const file = JSON.parse(fs.readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
  for (const x of file.words || []) if (!WORDS.has(x.key)) WORDS.set(x.key, x.en);
} catch { /* WORD_ROWS alone */ }
for (const [k, en] of SCREEN_WORDS) WORDS.set(k, en);
export { WORDS };

export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'" };
export const unescape = (s) => String(s).replace(/&(amp|lt|gt|quot|#39|apos);/g, (m, e) => ENT[e]);
export const squash = (s) => String(s).replace(/\s+/g, " ").trim();
const usedKeys = new Set();
export const used = () => new Set(usedKeys);
/** The shell's `w(key, fills)`: escaped, each `{name}` filled (a `{html}` fill inserted as it is); an unknown key draws
 *  as itself (interface-shell R5's fallback). */
export function w(key, fills) {
  usedKeys.add(key);
  const t = WORDS.has(key) ? WORDS.get(key) : key;
  return esc(t).replace(/\{(\w+)\}/g, (m, n) => {
    if (!fills || !(n in fills)) return m;
    const v = fills[n];
    return v && typeof v === "object" && "html" in v ? v.html : esc(v);
  });
}
/** A word's text as the member reads it. */
export const said = (key, fills) => squash(unescape(w(key, fills)));
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
export function date(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
  if (!m) return "";
  return w("date.daymonthyear", { day: String(+m[3]), month: { html: w("date.month." + MONTHS[+m[2] - 1]) }, year: m[1] });
}
export const day = (iso) => squash(unescape(date(iso)));

// ---- reading HTML (as screens-settings' kit reads it) ----
const VOID = new Set(["area", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
export function html(s) {
  const root = { tag: "#root", attrs: {}, children: [] };
  let cur = root;
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)|(<)/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) {
      const tag = m[1].toLowerCase();
      let c = cur;
      while (c !== root && c.tag !== tag) c = c.parent;
      if (c === root) throw new Error(`a closing </${tag}> with no element open`);
      cur = c.parent;
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      const attrs = {};
      for (const a of m[3].matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = unescape(a[2] ?? a[3] ?? a[4] ?? "");
      const el = { tag, attrs, children: [], parent: cur };
      cur.children.push(el);
      if (!VOID.has(tag) && !m[4]) cur = el;
    } else if (m[5] !== undefined) cur.children.push({ text: unescape(m[5]), parent: cur });
    else if (m[6]) throw new Error("a bare '<' in the drawn HTML");
  }
  if (cur !== root) throw new Error(`<${cur.tag}> left open`);
  return root;
}
export function* walk(n) { for (const c of n.children || []) { yield c; if (c.tag) yield* walk(c); } }
export const all = (n, pred) => [...walk(n)].filter((c) => c.tag && pred(c));
export const textOf = (n) => (n.text !== undefined ? n.text : (n.children || []).map(textOf).join(""));
export const texts = (n) => [...walk(n)].filter((c) => c.text !== undefined && c.text.trim()).map((c) => squash(c.text));
export const acts = (n) => all(n, (e) => e.tag === "button" && e.attrs["data-act"]);
export const actOps = (n) => [...new Set(acts(n).map((e) => e.attrs["data-act"]))].sort();
export const links = (n) => all(n, (e) => e.tag === "a").map((e) => e.attrs.href);

// ---- the plane ----
const answerOf = (a) => {
  if (a === "none" || a === null) return { kind: "silent" };
  if (a === "pending") return { kind: "pending" };
  if (a && a.ok === false) return { kind: "refused", code: String(a.code || a.reason), fields: a };
  return { kind: "ok", value: a && a.result !== undefined ? a.result : a, json: a && a.result !== undefined ? a : { ok: true, result: a } };
};
const NOT_FOUND = /^NO_SUCH_|_NOT_FOUND$|^NOT_FOUND$/;

/** The member's session as whoami answers it, once the screen has handed one over (`cs.signin`). */
export const FOUNDER = Object.freeze({ tokenClass: "admin", session: true, member: "admin", handle: "admin", administer: true, capabilities: ["contribute", "publish", "create_projects"] });
export const JOINED = Object.freeze({ tokenClass: "member", session: true, member: "mai", handle: "mai", administer: false, capabilities: ["contribute"] });

/**
 * Draws screen `id` as the shell would: `session` the record's state (`view.session`), `fragment` what the shell took
 * from the address (`view.fragment`), `me` whoami's answer when a session exists, `table` op → answer or
 * `(body, query) => answer`, `subject` the address's subject.
 */
export async function open(id, { table = {}, session = { state: "none" }, fragment = {}, me = null, subject = null, signinAs = FOUNDER } = {}) {
  const spec = SCREENS.find((s) => s.id === id);
  if (!spec) throw new Error("no screen " + id);
  const o = { spec, requests: [], signins: [], gone: [], wizards: [], timers: [], now: 0, refused: null, token: session.state === "live" || session.state === "locked" ? "tok-locked" : null };
  const ui = {};
  const data = {};
  const view = { subject, data, ui, me, session, fragment: { ...fragment }, origin: "https://group.example", parts: {} };
  o.view = view;
  let drawn = [];
  const isPublic = (op) => OPS[op] && OPS[op].classes === null;
  // interface-shell R12, R46: before a session only public ops are drawn; with one, R12's gate
  const can = (op) => {
    if (!OPS[op]) return false;
    if (!view.me) return isPublic(op) || (op === "unlock" && session.state === "locked");
    if (isPublic(op)) return true;
    const need = NEEDS[op];
    if (need && !(view.me.capabilities || []).includes(need)) return false;
    const set = view.me.tokenClass === "admin" ? SESSION_OPS.admin : SESSION_OPS.member;
    return set.has(op) || op === "unlock";
  };
  async function request(op, req = {}) {
    const header = !!(o.token && !isPublic(op));
    o.requests.push({ op, query: req.query || {}, body: req.body, header, token: header ? o.token : null });
    let a = table[op];
    if (typeof a === "function") a = a(req.body, req.query || {});
    if (a === undefined) a = { ok: true, result: { ok: true } };
    return answerOf(a);
  }
  const kitOf = () => {
    const cs = {
      w, esc, date: (iso) => date(iso),
      get me() { return view.me; },
      can,
      value(fid) {
        const f = o.fields[fid];
        if (f === undefined) { const el = all(o.tree, (e) => e.attrs.id === fid)[0]; if (!el) return null; if (el.attrs.type === "checkbox" || el.attrs.type === "radio") return el.attrs.checked !== undefined; return el.attrs.value ?? ""; }
        return f;
      },
      set(k, v) { ui[k] = v; draw(); },
      fill(fid, v) { o.fields[fid] = v; },
      go(screen, sub) { o.gone.push(screen + (sub ? "/" + sub : "")); },
      later(ms, fn) { o.timers.push({ at: o.now + ms, fn }); },
      now: () => o.now,
      async call(op, req = {}) { const a = await request(op, req); return a.kind === "ok" ? a.json : a.kind === "refused" ? a.fields : null; },
      async signin(answer, opts = {}) { o.signins.push({ answer, opts }); if (answer && answer.token) o.token = answer.token; view.me = signinAs; },
      wizard(...a) { o.wizards.push(a); },
      state(r, inner, opt = {}) {
        if (typeof r === "string") r = data[r];
        if (!r || r.state === "loading") return `<p class="cs-state" data-state="loading">${w("state.loading")}</p>`;
        if (r.state === "failed") return `<p class="cs-state" data-state="failed">${w("state.failed", { reason: { html: r.refusal ? r.refusal.words : "" } })}</p>`;
        if (r.state === "empty") return `<p class="cs-state" data-state="empty">${w(opt.empty || "state.empty")}</p>`;
        return inner(r.value);
      },
      act(op, opt = {}) {
        const a = spec.acts.find((x) => x.op === op);
        if (!a || !can(op)) return "";
        const dat = Object.entries(opt.data || {}).map(([k, v]) => ` data-${k}="${esc(v)}"`).join("");
        return `<button type="button" class="cs-btn" data-act="${op}"${dat}>${w(opt.label || a.label || "act." + op + ".label." + id, opt.fills)}</button>`;
      },
      title(t) { return `<h1 class="t-title">${t === undefined || t === null ? w("screen." + id + ".name") : esc(t)}</h1>`; },
      sec(k, inner, opt = {}) { return `<section class="cs-section"><h2>${w(k, opt.fills)}</h2>${inner}</section>`; },
      field(fid, k, opt = {}) {
        const type = opt.type || (opt.area ? null : "text");
        const input = opt.area ? `<textarea id="${esc(fid)}" class="cs-input">${esc(opt.value || "")}</textarea>`
          : `<input id="${esc(fid)}" class="cs-input" type="${esc(type)}"${type === "password" ? "" : ` value="${esc(opt.value || "")}"`}>`;
        return `<div class="cs-field"><label for="${esc(fid)}">${w(k, opt.fills)}</label>${opt.help ? `<span class="help">${w(opt.help)}</span>` : ""}${input}</div>`;
      },
      checks(fid, k, options, opt = {}) {
        return `<fieldset class="cs-field" id="${esc(fid)}"><legend>${w(k)}</legend>${options.map(([v, kk, on], i) => `<label><input type="${opt.radio ? "radio" : "checkbox"}" name="${esc(fid)}" id="${esc(fid)}-${i}" value="${esc(v)}"${on ? " checked" : ""}> ${w(kk)}</label>`).join("")}</fieldset>`;
      },
    };
    return cs;
  };
  o.fields = {};
  function draw() {
    o.html = spec.render(kitOf(), view);
    o.tree = html(o.html);
    o.text = squash(textOf(o.tree));
    drawn.push(o.html);
  }
  async function readAll(names) {
    const specs = spec.reads ? spec.reads(view) || {} : {};
    for (const [n, r] of Object.entries(specs)) {
      if (names && !names.includes(n)) continue;
      const a = await request(r.op, { query: r.query, body: r.body });
      if (a.kind === "pending") { data[n] = { state: "loading", value: null, refusal: null }; continue; }
      if (a.kind === "ok") {
        const v = a.value;
        const empty = r.empty ? !!r.empty(v) : v === null || v === undefined || (Array.isArray(v) && !v.length);
        data[n] = { state: empty ? "empty" : "ok", value: v, refusal: null };
      } else if (a.kind === "refused") data[n] = { state: "failed", value: null, refusal: { code: a.code, words: WORDS.has("refusal." + a.code) ? w("refusal." + a.code) : esc(a.code) } };
      else data[n] = { state: "failed", value: null, refusal: { code: null, words: w("state.failed", { reason: "" }) } };
      if (r.subject && a.kind === "refused" && NOT_FOUND.test(a.code)) o.notFound = true;
    }
    draw();
  }
  o.readAll = readAll;
  draw();
  await readAll(null);
  /** Runs act `op` as the shell does: the fields filled (`values`), the button's `data-*` matched (`data`). Answers the
   *  requests it made, and whether it was refused (`o.refused` the words drawn beside it). */
  o.press = async (op, { data: d = {}, values = {} } = {}) => {
    Object.assign(o.fields, values);
    const btn = acts(o.tree).find((b) => b.attrs["data-act"] === op && Object.entries(d).every(([k, v]) => b.attrs["data-" + k] === String(v)));
    if (!btn) throw new Error(`${id}: no ${op} drawn for ${JSON.stringify(d)}`);
    const a = spec.acts.find((x) => x.op === op);
    const before = o.requests.length;
    o.refused = null;
    const el = { dataset: Object.fromEntries(Object.entries(btn.attrs).filter(([k]) => k.startsWith("data-") && k !== "data-act").map(([k, v]) => [k.slice(5).replace(/-([a-z])/g, (m, c) => c.toUpperCase()), v])) };
    const cs = kitOf();
    let req;
    try { req = a.send ? await a.send(view, el, cs, {}) : { body: {} }; } catch (e) { throw new Error(`${id}: ${op}'s send threw: ${e.message}`); }
    if (!req) return { sent: o.requests.slice(before), refused: false };
    if (req.refuse) { o.refused = { key: req.refuse, text: said(req.refuse, req.fills) }; draw(); return { sent: o.requests.slice(before), refused: true }; }
    const ans = await request(op, req);
    if (ans.kind !== "ok") {
      const own = a.refusals && a.refusals[ans.code];
      const words = typeof own === "function" ? own({ code: ans.code, ...(ans.fields || {}) }, cs) : typeof own === "string" ? w(own) : WORDS.has("refusal." + ans.code) ? w("refusal." + ans.code) : esc(ans.code);
      o.refused = { code: ans.code, text: squash(unescape(String(words))) };
      draw();
      return { sent: o.requests.slice(before), refused: true };
    }
    // interface-shell R21 (K3009): every password field cleared after a successful act
    for (const e of all(o.tree, (x) => x.tag === "input" && x.attrs.type === "password")) delete o.fields[e.attrs.id];
    let after = null;
    if (a.done) after = await a.done(view, ans.value, cs);
    if (after && after.stay) draw(); else await readAll(a.rereads || null);
    return { sent: o.requests.slice(before), refused: false };
  };
  /** The page clock moved on: `cs.later` timers due run in order. */
  o.tick = async (ms) => {
    const end = o.now + ms;
    for (;;) {
      const due = o.timers.filter((t) => t.fn && t.at <= end).sort((x, y) => x.at - y.at)[0];
      if (!due) break;
      o.now = due.at; const fn = due.fn; due.fn = null;
      await fn(kitOf(), view);
      for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r));
    }
    o.now = end;
    draw();
  };
  o.drawn = () => drawn.join("\n");
  return o;
}

export const has = (o, key, fills) => { if (!o.text.includes(said(key, fills))) throw new Error(`not drawn: ${key} "${said(key, fills)}"\nin: ${o.text.slice(0, 600)}`); };
export const lacks = (o, key, fills) => { if (o.text.includes(said(key, fills))) throw new Error(`drawn: ${key}`); };

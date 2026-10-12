/* screens-settings' tests' stand-in for the shell (draft-T46-interface §4 (1); K2854 T2): `interface-shell` is built in the
   same layer and is not yet merged, so its kit `cs`, its act gate (R12) and its read states (R10) are stood in here, over
   the screen contract J1 states, and re-pointed to the shell's own at its merge. Nothing here is the module's code: the
   screens run as they will in the browser, through `SCREENS`' self-contained functions, over a fake plane that answers
   each op in its owner's documented shape and records every request (its op, query, body and headers).

   `html(s)` reads an HTML string into a small tree (elements, attributes, text), enough to find what a screen drew:
   its text nodes, its acts (`[data-act]`), its fields (`name`, `type`, `value`) and its links. */
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { OPS, NEEDS, SESSION_OPS, OP_ALIASES } from "../../../src/op-declarations/index.mjs";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-settings/index.mjs";

// ---- reading HTML ----

const VOID = new Set(["area", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", nbsp: " " };
export const unescape = (s) => String(s).replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (ENT[e] !== undefined) return ENT[e];
  if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
  return m;
});

/** An HTML string as `{tag: "#root", children}`; each element `{tag, attrs, children, parent}`, each text `{text}`. */
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
      for (const a of m[3].matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))
        attrs[a[1].toLowerCase()] = unescape(a[2] ?? a[3] ?? a[4] ?? "");
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
export const squash = (s) => s.replace(/\s+/g, " ").trim();
/** Every non-blank text node, trimmed. */
export const texts = (n) => [...walk(n)].filter((c) => c.text !== undefined && c.text.trim()).map((c) => squash(c.text));
export const acts = (n) => all(n, (e) => e.tag === "button" && e.attrs["data-act"]);
export const actOps = (n) => [...new Set(acts(n).map((e) => e.attrs["data-act"]))].sort();
export const fields = (n) => all(n, (e) => ["input", "textarea", "select"].includes(e.tag));
export const ancestor = (e, pred) => { for (let p = e.parent; p; p = p.parent) if (p.tag && pred(p)) return p; return null; };

// ---- the words ----

const ROWS = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));
for (const [k, en] of SCREEN_WORDS) ROWS.set(k, en);
export const WORDS = ROWS;
/** The shell's `w(key, fills)` (its R5): the screen's own row first, else `WORD_ROWS`; each `{name}` filled, escaped. */
export function w(key, fills = {}) {
  if (!ROWS.has(key)) throw new Error(`no word ${key}`);
  used.add(key);
  return esc(ROWS.get(key).replace(/\{(\w+)\}/g, (m, n) => (n in fills ? String(fills[n]) : m)));
}
const used = new Set();
export const usedKeys = () => new Set(used);
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/** A word's text with its fills, as a drawn text node reads it (unescaped), for comparison. */
export const said = (key, fills = {}) => unescape(w(key, fills));

// ---- the act gate (interface-shell R12, stood in) ----

const resolve = (op) => (OP_ALIASES && OP_ALIASES[op]) || op;
const ADMIN_ONLY = new Set(["memberadd", "membercaps", "memberset", "adminendorse", "adminremove", "expertiseconfirm", "invitewithdraw",
  "websitekeycreate", "joinlinkenable", "groupkeyset", "groupkeyswitch", "groupkeyremove", "aikeepaway"]);
export function may(op, me) {
  if (!me) return false;
  const o = resolve(op);
  if (!OPS[o]) return false;
  const need = NEEDS[o] ?? null;
  if (need !== null && !(me.capabilities || []).includes(need)) return false;
  const set = me.founder ? SESSION_OPS.admin : SESSION_OPS.member;
  if (OPS[o].mutating && !set.has(o)) return false;
  if (ADMIN_ONLY.has(op) && me.administer !== true) return false;
  return true;
}

// ---- the kit ----

/** The kit a screen draws with, over `me` (whoami's answer). Each act button carries `data-act`, and `data-subject`
 *  when it acts on one row; each form is `[data-form]`, its fields named. */
export function kit(me, screen) {
  const cs = {
    w, esc,
    state(o, emptyKey) {
      if (o.state === "loading") return `<p class="cs-state" data-state="loading">${w("state.loading")}</p>`;
      if (o.state === "empty") return `<p class="cs-state" data-state="empty">${w(emptyKey || "state.empty")}</p>`;
      if (o.state === "failed") return `<p class="cs-state" data-state="failed">${w("state.failed", { reason: o.refusal ? (o.refusal.translation || o.refusal.code) : "no answer" })}</p>`;
      return "";
    },
    act(op, o = {}) {
      if (!may(op, me)) return "";
      const key = o.label || `act.${op.replace(/^owed:(\w+).*/, "owed_$1")}.label.${screen}`;
      return `<button type="button" class="cs-btn" data-act="${esc(op)}"${o.subject !== undefined ? ` data-subject="${esc(o.subject)}"` : ""}${o.form ? ` data-form-of="${esc(o.form)}"` : ""}>${w(key, o.fills)}</button>`;
    },
    date(iso) { return iso ? esc(String(iso).slice(0, 10)) : ""; },
    number(n) { return esc(Number(n).toLocaleString("en")); },
  };
  return cs;
}

// ---- the fake plane and the screen driver ----

/** Answers each op by `table[op]`: an answer object, a function `(query, body) => answer`, `"pending"` (never answers),
 *  or `"none"` (no answer: a network failure). Every request is recorded. */
export function plane(table) {
  const requests = [];
  async function call(op, query = {}, body = undefined, headers = { authorization: "Bearer SENTINEL" }) {
    requests.push({ op, query, body, headers });
    const t = table[op];
    const a = typeof t === "function" ? t(query, body) : t;
    if (a === undefined) throw new Error(`the fake plane has no answer for ${op}`);
    if (a === "pending") return new Promise(() => {});
    if (a === "none") return { state: "failed", refusal: null };
    return a;
  }
  return { call, requests, table };
}

/** An answer's outcome as the shell hands it to `render` (its R10): ok with the value, empty, or failed with the refusal. */
export function outcomeOf(answer, emptyWhen) {
  if (answer && answer.state === "failed") return answer;
  if (!answer || answer.ok === false) return { state: "failed", refusal: answer || null };
  const value = answer.result !== undefined ? answer.result : answer;
  if (value && value.ok === false) return { state: "failed", refusal: value };
  if (emptyWhen && emptyWhen(value)) return { state: "empty", value };
  return { state: "ok", value };
}

export const screen = (id) => SCREENS.find((s) => s.id === id);

/** Runs one screen: its reads over the fake plane, then its render; answers the drawn tree and helpers. */
export async function open(id, { me, table, subject = null, reachable = false, states = {} }) {
  const s = screen(id);
  const p = plane(table);
  const ctx = { me, subject, reachable };
  const d = {};
  for (const r of s.reads(ctx)) {
    if (states[r.name]) { d[r.name] = states[r.name]; continue; }
    const a = await Promise.race([p.call(r.op, r.query || {}, r.body), new Promise((res) => setTimeout(() => res("pending"), 5))]);
    d[r.name] = a === "pending" ? { state: "loading" } : outcomeOf(a);
  }
  const cs = kit(me, id);
  const draw = () => s.render(cs, d, ctx, s.parts || {});
  const out = { s, p, ctx, d, cs, html: draw() };
  out.tree = html(out.html);
  out.redraw = () => { out.html = draw(); out.tree = html(out.html); return out; };
  /** Presses an act: its args from the form's values, the request sent, `after` applied, the named reads read again. */
  out.press = async (op, { subject, values = {} } = {}) => {
    const spec = s.acts.find((a) => a.op === op);
    if (!spec) throw new Error(`${id} lists no act ${op}`);
    const before = p.requests.length;
    const req = spec.args(values, ctx, d, subject);
    if (req === null) return { sent: [], refused: true };
    const answer = await p.call(spec.send || resolve(op).replace(/^owed:(\w+).*/, "$1"), req.query || {}, req.body);
    let followed = null;
    if (spec.after && answer && answer.ok !== false && !(answer.result && answer.result.ok === false)) {
      followed = spec.after(answer.result !== undefined ? answer.result : answer, ctx, d, values);
      if (followed && followed.then) for (const t of [].concat(followed.then)) await p.call(t.op, t.query || {}, t.body);
      if (followed && followed.show) d.__shown = followed.show;
    }
    if (answer && answer.ok !== false)
      for (const r of s.reads(ctx).filter((r) => (spec.rereads || []).includes(r.name))) d[r.name] = outcomeOf(await p.call(r.op, r.query || {}, r.body));
    out.redraw();
    return { sent: p.requests.slice(before), answer, followed };
  };
  return out;
}

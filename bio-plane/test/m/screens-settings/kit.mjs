/* screens-settings' tests' stand-in for the shell (draft-T46-interface §4 (1); K2854 T2): `interface-shell` is built in the
   same layer and is not yet merged, so its kit `cs`, its act gate (R12) and its read states (R10) are stood in here, over
   the screen contract interface-shell R21 states (K2996, K2998), and re-pointed to the shell's own at its merge. Nothing here is the module's code: the
   screens run as they will in the browser, through `SCREENS`' self-contained functions, over a fake plane that answers
   each op in its owner's documented shape and records every request (its op, query, body and headers).

   `html(s)` reads an HTML string into a small tree (elements, attributes, text), enough to find what a screen drew:
   its text nodes, its acts (`[data-act]`), its fields (`name`, `type`, `value`) and its links. */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { OPS, NEEDS, SESSION_OPS, OP_ALIASES } from "../../../src/op-declarations/index.mjs";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-settings/index.mjs";
export { SCREENS };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

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

/* The stand-in draws `WORD_ROWS`' words, and, while `setup-words` R5 (T46: `words.json` at 3f40899950) is not yet merged
   into this branch, that file's words, which R5 carries; `contract.test.mjs` holds the screens to `WORD_ROWS` itself. */
function wordsAt3f() {
  try { return JSON.parse(execFileSync("git", ["show", "3f40899950:docs/development/ux-substrate/screens/words.json"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 24 })).words.map((x) => [x.key, x.en]); }
  catch { return []; }
}
const ROWS = new Map([...wordsAt3f(), ...WORD_ROWS.map((r) => [r[0], r[1]])]);
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
export const resetUsed = () => used.clear();
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/** A word's text with its fills, as a drawn text node reads it (unescaped), for comparison. */
export const said = (key, fills = {}) => unescape(w(key, fills));
/** A word's text, unescaped, for a fill (the kit's `t`). */
export const t = (key, fills = {}) => unescape(w(key, fills));

// ---- the act gate (interface-shell R12, stood in) ----

const resolve = (op) => OP_ALIASES[op] || op;
// the acts their owners refuse to a member who does not administer (membership's administrator acts, credentials'
// group-key acts, `aikeepaway`)
const ADMIN_ONLY = new Set(["memberadd", "membercaps", "memberset", "adminendorse", "adminremove", "expertiseconfirm", "invitewithdraw",
  "websitekeycreate", "joinlinkenable", "groupkeyset", "groupkeyswitch", "groupkeyremove", "aikeepaway"]);
const SERVED_LATER = new Set(["infolevelset"]); // op-declarations R50 (T46), merged before this module
export function may(op, me) {
  if (!me) return false;
  const o = resolve(op);
  if (!OPS[o] && !SERVED_LATER.has(o)) return false;
  const spec = OPS[o] || { mutating: true };
  const need = NEEDS[o] ?? null;
  if (need !== null && !(me.capabilities || []).includes(need)) return false;
  const set = me.member === "admin" ? SESSION_OPS.admin : SESSION_OPS.member;
  if (spec.mutating && OPS[o] && !set.has(o)) return false;
  if (ADMIN_ONLY.has(op) && me.administer !== true) return false;
  return true;
}
const OWED = { subscriptionsignin: "owed_subscriptionsignin", infolevelset: "owed_infolevelset" };

// ---- the kit ----

/** The kit a screen draws with (interface-shell R21 (5)), over the view. Each act button carries `data-act` and its
 *  `data-*`; `rows` draws each row's panel beneath it, as `data-panel-of`. */
export function kit(view, screenId, hooks = {}) {
  // traced: each word drawn between two invisible marks, so a test can tell words from data in what is drawn
  const W = hooks.trace ? (k, f) => "\u2060" + w(k, f) + "\u2061" : w;
  const cs = {
    w: W, esc,
    state(o, inner, opt = {}) {
      if (!o || o.state === "loading") return `<p class="cs-state" data-state="loading">${W("state.loading")}</p>`;
      if (o.state === "empty") return `<p class="cs-state" data-state="empty">${W(opt.empty || "state.empty")}</p>`;
      if (o.state === "failed") return `<p class="cs-state" data-state="failed">${W("state.failed", { reason: o.refusal ? (o.refusal.words || o.refusal.code) : "no answer" })}</p>`;
      return inner(o.value);
    },
    act(op, o = {}) {
      if (!may(op, view.me)) return "";
      const key = o.label || `act.${OWED[op] || op}.label.${screenId}`;
      const data = Object.entries(o.data || {}).filter(([, v]) => v !== undefined).map(([k, v]) => ` data-${k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}="${esc(v)}"`).join("");
      return `<button type="button" class="cs-btn" data-act="${esc(op)}"${data}>${W(key)}</button>`;
    },
    can(op) { return may(op, view.me); },
    set(name, value) { view.ui[name] = value; if (hooks.redraw) hooks.redraw(); },
    value(id) { return hooks.values ? hooks.values[id] : undefined; },
    call(op, o = {}) { return hooks.call(op, o.query || {}, o.body); },
    sec(titleKey, inner) { return `<section class="cs-section"><h2>${W(titleKey)}</h2>${inner}</section>`; },
    rows({ cols, items, key, cells, acts }) {
      return `<table class="cs-table"><thead><tr>${cols.map((c) => `<th>${W(c)}</th>`).join("")}</tr></thead><tbody>${items.map((it) => {
        const k = key(it);
        const panel = acts ? acts(it) : "";
        return `<tr data-row="${esc(k)}">${cells(it).map((c) => `<td>${c}</td>`).join("")}</tr>${panel ? `<tr class="cs-panel" data-panel-of="${esc(k)}"><td colspan="${cols.length}">${panel}</td></tr>` : ""}`;
      }).join("")}</tbody></table>`;
    },
    date(iso, o = {}) { return iso ? esc(String(iso).slice(0, o.year ? 10 : 10)) : ""; },
  };
  return cs;
}

// ---- the fake plane and the screen driver ----

/** Answers each op by `table[op]`: an answer object, a function `(query, body) => answer`, `"pending"` (never answers),
 *  or `"none"` (no answer: a network failure). Every request is recorded with its op, query, body and header. */
export function plane(table) {
  const requests = [];
  async function call(op, query = {}, body = undefined) {
    requests.push({ op, query, body, headers: { authorization: "Bearer SENTINEL-SESSION" } });
    const t = table[op];
    const a = typeof t === "function" ? t(query, body) : t;
    if (a === undefined) throw new Error(`the fake plane has no answer for ${op}`);
    if (a === "pending") return new Promise(() => {});
    if (a === "none") return null;
    return a;
  }
  return { call, requests, table };
}

/** An answer as the shell hands a read to `render` (its R10, R21 (2)): `{state, value, refusal}`, `value` the answer's
 *  `result` (or the answer, for `bootstrap` and `subscriptionsignin`, which the door relays at the top level). */
export function outcomeOf(answer, empty) {
  if (!answer) return { state: "failed", refusal: null };
  const value = answer.result !== undefined ? answer.result : answer;
  if (answer.ok === false || (value && value.ok === false)) { const r = value && value.ok === false ? value : answer; return { state: "failed", refusal: { code: r.code || r.reason, words: r.translation || null } }; }
  if (empty && empty(value)) return { state: "empty", value };
  return { state: "ok", value };
}

export const screen = (id) => SCREENS.find((s) => s.id === id);

/** Runs one screen as the shell does: its reads over the fake plane (each pending read drawn loading), then its render.
 *  `states` stands a read's outcome in directly. */
export async function open(id, { me, table, subject = null, reachable = false, origin = "https://group.example", states = {}, s: given = null, trace = false } = {}) {
  const s = given || screen(id);
  const p = plane(table);
  const view = { subject, data: {}, me, ui: {}, reachable, origin, parts: s.parts };
  const hooks = { values: {}, call: p.call, trace };
  const out = { s, p, view, opened: [], refused: null };
  const cs = kit(view, id, hooks);
  out.cs = cs;
  const readOne = async (name, r) => {
    if (states[name]) return states[name];
    const a = await Promise.race([p.call(r.op, r.query || {}, r.body), new Promise((res) => setTimeout(() => res("pending"), 5))]);
    return a === "pending" ? { state: "loading" } : outcomeOf(a, r.empty);
  };
  const readAll = async (names) => { const rs = s.reads(view); for (const [n, r] of Object.entries(rs)) if (!names || names.includes(n)) view.data[n] = await readOne(n, r); };
  out.redraw = () => { out.html = s.render(cs, view); out.tree = html(out.html); return out; };
  hooks.redraw = () => out.redraw();
  await readAll(null);
  out.redraw();
  /** Presses an act as the shell does (its R11–R13; this module's R8): `send` over the pressed control (`data`) and
   *  the form's values; `{refuse}` draws a word and sends nothing; a refusal is drawn and nothing else changes; on
   *  success, `done`, then the act's reads read again, and the screen drawn again. */
  out.press = async (op, { data = {}, values = {}, reason, extra = {} } = {}) => {
    const spec = s.acts.find((a) => a.op === op);
    if (!spec) throw new Error(`${id} lists no act ${op}`);
    const before = p.requests.length;
    out.refused = null;
    hooks.values = values;
    const req = await spec.send(view, { dataset: { ...data } }, cs, extra);
    if (req === null) return { sent: [] };
    if (req.refuse) { out.refused = { key: req.refuse, drawn: w(req.refuse) }; return { sent: [], refuse: req.refuse }; }
    const body = req.body !== undefined ? { ...req.body } : undefined;
    if (spec.reasonField && reason !== undefined) body[spec.reasonField] = reason;
    const answer = await p.call(op, req.query || {}, body);
    const o = outcomeOf(answer);
    if (o.state === "failed") {
      const r = answer ? (answer.result && answer.result.ok === false ? answer.result : answer) : null;
      const code = r && (r.code || r.reason);
      const how = spec.refusals && spec.refusals[code];
      out.refused = { code, drawn: typeof how === "function" ? how(r, cs) : how ? w(how, r) : r && r.translation ? esc(r.translation) : w("state.failed", { reason: code || "no answer" }) };
      return { sent: p.requests.slice(before), answer, refused: true };
    }
    if (spec.done) await spec.done(view, answer, cs);
    await readAll(spec.rereads || null);
    out.redraw();
    return { sent: p.requests.slice(before), answer };
  };
  return out;
}

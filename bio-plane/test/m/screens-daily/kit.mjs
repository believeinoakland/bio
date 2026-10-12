/* A stand-in for interface-shell's kit `cs` and its act machinery, at interface-shell R21's contract (K2996, K2998), for
   screens-daily's tests until interface-shell's shared DOM stand-in is merged (B3: re-pointed then). It draws every word
   as `<w k="key">English, filled</w>`, so a test can find which words were drawn; every act as
   `<button data-act="op" data-label="key" data-*>`; and records every `go`, `set` and drawn act. `allow(op)` decides
   interface-shell R12's gate (all drawn by default). The words' English is `WORD_ROWS`' or the screen's own row. */
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { SCREEN_WORDS } from "../../../src/screens-daily/index.mjs";

const ENGLISH = new Map([...WORD_ROWS.map((r) => [r[0], r[1]]), ...SCREEN_WORDS.map((r) => [r[0], r[1]])]);
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const attrs = (data) => Object.entries(data || {}).map(([k, v]) => ` data-${k}="${esc(v)}"`).join("");

/** A view as the shell hands it: `data[name]` given as `{state, value, refusal}` or, for brevity, as a value (state ok). */
export function viewOf({ subject = null, data = {}, me = { member: "mai", capabilities: ["contribute"] }, ui = {}, reachable = false } = {}) {
  const d = {};
  for (const [k, v] of Object.entries(data)) d[k] = v && typeof v === "object" && "state" in v && ("value" in v || v.state !== "ok") ? v : { state: "ok", value: v };
  return { subject, data: d, me, ui, reachable };
}

export function kit({ allow = () => true, values = {}, now = Date.now() } = {}) {
  const log = { words: [], go: [], set: [], acts: [], missing: [] };
  let view = null;
  const w = (key, fills = {}) => {
    log.words.push(key);
    if (!ENGLISH.has(key)) log.missing.push(key);
    const en = (ENGLISH.get(key) ?? key).replace(/\{(\w+)\}/g, (m, n) => (n in fills ? esc(fills[n]) : m));
    return `⟦${key}⟧${en}⟦/⟧`;
  };
  const cs = {
    w, esc,
    state(name, a, b, c) {
      // state(readName, view, inner, opts) or state(readName, inner, opts)
      const v = typeof a === "function" ? view : a;
      const inner = typeof a === "function" ? a : b;
      const opts = (typeof a === "function" ? b : c) || {};
      const r = v && v.data ? v.data[name] : undefined;
      if (!r || r.state === "loading") return `<p data-state="loading">${w("state.loading")}</p>`;
      if (r.state === "failed") return `<p data-state="failed">${w("state.failed", { reason: (r.refusal && r.refusal.code) || "" })}</p>`;
      if (r.state === "empty") return `<p data-state="empty">${w(opts.empty || "state.empty")}</p>`;
      return `<div data-state="ok">${inner(r.value)}</div>`;
    },
    act(op, { label, data, tone } = {}) {
      if (!allow(op)) return "";
      log.acts.push({ op, label, data: { ...(data || {}) } });
      return `<button type="button" class="cs-btn" data-act="${op}" data-label="${label || ""}"${tone ? ` data-tone="${tone}"` : ""}${attrs(data)}>${label ? w(label) : op}</button>`;
    },
    can: (op) => allow(op),
    go(screen, subject) { log.go.push([screen, subject]); },
    set(name, value) { log.set.push([name, value]); if (view) view.ui[name] = value; },
    value: (id) => values[id],
    file: () => null,
    now: () => now,
    digest: async () => "",
    ref: (kind, id, text, facts = []) => `<a class="cs-ref" data-ref="${kind}" href="/app/${kind}/${encodeURIComponent(id)}">${esc(text)}</a>`,
    mark: (family, value, fills) => `<span class="cs-mark" data-mark="${family}.${value}">${w(`mark.${family}.${value}.name`, fills)}</span>`,
    grade: (scale, letter) => `<span class="cs-grade" data-scale="${scale}">${esc(letter)}</span>`,
    due: (iso, state) => `<span class="cs-due" data-due="${state || ""}" data-iso="${esc(iso)}">${esc(iso.slice(0, 10))}</span>`,
    hint: () => `<span class="cs-hint">${w("mark.hint.label")}</span>`,
    date: (iso) => String(iso).slice(0, 10), // text, as the shell's `date` (R6) answers it; `w` escapes it as a fill
    row: (a, b, c = "", meta = "") => `<div class="cs-row">${a}<span>${b}</span>${c}${meta ? `<span class="meta">${meta}</span>` : ""}</div>`,
    rows: () => "",
    sec: (key, inner) => `<section class="cs-section"><h2>${w(key)}</h2>${inner}</section>`,
    sheet: (inner) => `<div class="cs-sheet">${inner}</div>`,
    field: (id, labelKey, o = {}) => `<div class="cs-field"><label for="${id}">${w(labelKey)}</label>${o.help ? `<span class="help">${w(o.help)}</span>` : ""}<input id="${id}" value="${esc(o.value || "")}"></div>`,
    choice: () => "", checks: () => "",
    title: (text) => `<h1>${text}</h1>`,
  };
  return {
    cs, log,
    render(screen, v) { view = v; return screen.render(cs, v); },
    /** Presses `op`'s act as the shell would: `send(view, el, cs, extra)` with the dataset drawn. */
    send(screen, op, v, dataset = {}, extra = {}) {
      view = v;
      const act = screen.acts.find((a) => a.op === op);
      if (!act) throw new Error(`no act ${op} on ${screen.id}`);
      return act.send(v, { dataset }, cs, extra);
    },
    done(screen, op, v, answer) {
      view = v;
      const act = screen.acts.find((a) => a.op === op);
      if (act.done) act.done(v, answer, cs);
    },
  };
}

/** The acts drawn in `html`: each `[op, dataset]`. */
export function drawn(html) {
  return [...html.matchAll(/<button [^>]*data-act="([^"]+)"([^>]*)>/g)].map(([, op, rest]) => {
    const d = {};
    for (const [, k, v] of rest.matchAll(/data-([a-z]+)="([^"]*)"/g)) d[k] = v.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    return [op, d];
  });
}
export const ops = (html) => drawn(html).map(([op]) => op);
/** The word keys drawn in `html`. */
export const keys = (html) => [...html.matchAll(/⟦([^⟧/][^⟧]*)⟧/g)].map((m) => m[1]);
/** The text a reader sees: tags removed, entities read. */
export const text = (html) => html.replace(/⟦[^⟧]*⟧/g, "").replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

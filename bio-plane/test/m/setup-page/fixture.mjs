/* setup-page's tests' fixture (K1851; seam read §5): copies of instance-setup's `pageOver` and `storage`, so no test here
   imports `setup.mjs` or instance-setup's fixture (instance-setup is later in the order). `storage` is a Durable Object
   storage at the plane's shape (K316): `sql.exec` answers a CURSOR, as workerd's does, never an array, and refuses a
   LIKE or GLOB pattern over workerd's 50 bytes (K313), which node:sqlite does not. */
import { DatabaseSync } from "node:sqlite";
import { webcrypto } from "node:crypto";

export const WORKERD_PATTERN_CAP = 50;
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const rest = c.toArray(); if (rest.length !== 1) throw new Error(`expected one row, got ${rest.length}`); return rest[0]; },
  };
  return c;
}

function patternsOf(q, args) {
  const literal = [...q.matchAll(/\b(?:GLOB|LIKE)\s+'((?:[^']|'')*)'/gi)].map((m) => m[1].replace(/''/g, "'"));
  const bound = /\b(?:GLOB|LIKE)\s+\?|\b(?:glob|like)\s*\(/i.test(q) ? args.filter((a) => typeof a === "string") : [];
  return [...literal, ...bound];
}

/** One Durable Object storage. `failWrites(pred)` makes a matching write throw, as a store that does not answer. */
export function storage(db = new DatabaseSync(":memory:")) {
  let n = 0;
  let failing = null;
  const statements = [];
  const sql = {
    exec(q, ...args) {
      statements.push(q);
      if (patternsOf(q, args).some((p) => Buffer.byteLength(p) > WORKERD_PATTERN_CAP)) throw new Error("LIKE or GLOB pattern too complex");
      if (failing && failing(q, args)) throw new Error("the store did not answer this write");
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
  };
  return {
    sql, db, statements,
    failWrites(pred) { failing = pred; },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

/**
 * The page's script (the last `<script>` of `html`, the page as served) run over a small document stand-in: every
 * `$(selector)` is one element, kept; `fetch` is the page's own, handed in (a scripted answer, or the real plane's).
 * Answers `ui` (the script's named functions), `el(selector)`, the `sandbox`, `replaced()` (history rewrites), `picks`
 * (the profile checkboxes the page drew) and `ibtns()` (the inbox's buttons as it last drew them).
 */
export function pageOver({ html, hash = "", session = null, fetch }) {
  const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
  const els = new Map();
  let replaced = 0;
  const mk = (sel) => ({
    sel, listeners: {}, textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {}, checked: false,
    disabled: false, options: [],
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener(t, f) { (this.listeners[t] ||= []).push(f); },
    async fire(t = "click") { for (const f of this.listeners[t] || []) await f(); },
  });
  const el = (sel) => { if (!els.has(sel)) els.set(sel, mk(sel)); return els.get(sel); };
  el("#n-type").options = ["information", "inquiry", "project", "action"].map((value) => ({ value, hidden: false }));
  el("#n-type").value = "information";
  const picks = new Map();
  let ibtns = [];
  const document = {
    querySelector(s) {
      if (s === "input[name=n-risk]:checked") return [...els.values()].find((e) => /^#n-risk-/.test(e.sel) && e.checked) || null;
      return el(s);
    },
    querySelectorAll(s) {
      if (s === "#pf-choices .pf-pick")
        return [...el("#pf-choices").innerHTML.matchAll(/class="pf-pick" value="([^"]*)"/g)].map((m) => {
          if (!picks.has(m[1])) picks.set(m[1], { ...mk(`pick:${m[1]}`), value: m[1] });
          return picks.get(m[1]);
        });
      /* the inbox's buttons as the page last drew them, fresh at each draw (R48) */
      if (s === "#inbox-body .ibtn")
        return (ibtns = [...el("#inbox-body").innerHTML.matchAll(/class="ibtn" data-i="(\d+)" data-id="([^"]*)" data-to="([^"]*)"/g)]
          .map((m) => ({ ...mk(`ibtn:${m[1]}:${m[3]}`), dataset: { i: m[1], id: m[2], to: m[3] } })));
      /* a list of selectors: each bare id in it is its element */
      return s.split(",").map((x) => x.trim()).filter((x) => /^#[\w-]+$/.test(x)).map((x) => el(x));
    },
    getElementById: (id) => el("#" + id), addEventListener() {}, createElement: () => mk("new"),
    body: { appendChild() {}, removeChild() {} },
  };
  const store = new Map(session ? [["bio-session", JSON.stringify(session)]] : []);
  const sandbox = {
    document, fetch, URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array, Set, Map, Promise,
    crypto: webcrypto, setTimeout, TextEncoder, encodeURIComponent, decodeURIComponent,
    location: { hash, pathname: "/", origin: "https://copy.example" },
    history: { replaceState() { replaced += 1; sandbox.location.hash = ""; } },
    sessionStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) },
    navigator: { clipboard: { writeText: async () => {} } },
  };
  sandbox.window = sandbox;
  const ui = new Function(...Object.keys(sandbox), script + `
;return { mdFor, historyOrder, FIRST_STATE, HEADINGS, RISK_TIERS, riskTierState, SETTABLE_TIERS, deriveInquiryTitle,
          profilesWarning, openProfiles, panel, chosenRiskTier, openBundle, signerAddBody, describeKey, acquireWhy,
          PREFIX, SCHEMA_OF, splitFm, mdRender, ratifyWhy, openBrowse, openInbox, openAssistant };`)(...Object.values(sandbox));
  return { ui, el, sandbox, replaced: () => replaced, picks, ibtns: () => ibtns };
}

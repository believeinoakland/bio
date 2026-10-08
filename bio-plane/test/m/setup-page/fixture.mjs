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

/** The last script element's body in `html`, whatever attributes its tag carries (its nonce, R28). */
export function scriptOf(html) {
  const at = html.lastIndexOf("<script");
  return html.slice(html.indexOf(">", at) + 1, html.lastIndexOf("</script>"));
}

/** The session a request carries in its `Authorization: Bearer` header (R26), or null. `init.headers` as the page
 *  passes it: a plain object. */
export const bearerOf = (init) => {
  const h = init && init.headers ? init.headers : {};
  const v = Object.entries(h).find(([k]) => k.toLowerCase() === "authorization");
  const m = v && /^Bearer (.+)$/.exec(String(v[1]));
  return m ? m[1] : null;
};

/**
 * The page's script (the last `<script>` of `html`, the page as served) run over a small document stand-in: every
 * `$(selector)` is one element, kept; `fetch` is the page's own, handed in (a scripted answer, or the real plane's).
 * Answers `ui` (the script's named functions), `el(selector)`, the `sandbox`, `replaced()` (history rewrites), `picks`
 * (the profile checkboxes the page drew), `ibtns()` (the inbox's buttons as it last drew them), `dlbtns()` (a record's
 * download buttons as it last drew them), `files` (each file the page handed the browser: `{name, blob, url, clicked}`),
 * `objectUrls` (each object address made, and whether it was released), `hashchange()` (the browser's event when the
 * address's fragment changes) and `drawn(selector, data)` (a button the page drew into a box, by its data-* attributes).
 */
export function pageOver({ html, hash = "", session = null, fetch, globals = {} }) {
  const script = scriptOf(html);
  const els = new Map();
  let replaced = 0;
  const mk = (sel) => own({
    sel, listeners: {}, textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {}, checked: false,
    disabled: false, options: [],
    classes: new Set(),
    addEventListener(t, f) { (this.listeners[t] ||= []).push(f); },
    async fire(t = "click") { for (const f of this.listeners[t] || []) await f(); },
  });
  /* each element's class list, its own: the page shows a section by adding "on" to it */
  const own = (e) => { e.classList = { add: (c) => e.classes.add(c), remove: (c) => e.classes.delete(c), contains: (c) => e.classes.has(c) }; return e; };
  const el = (sel) => { if (!els.has(sel)) els.set(sel, mk(sel)); return els.get(sel); };
  /* the section the page shows: the one whose class list holds "on" */
  const shown = () => [...els.values()].filter((e) => /^#s-/.test(e.sel) && e.classList.contains("on")).map((e) => e.sel);
  el("#n-type").options = ["information", "inquiry", "project", "action"].map((value) => ({ value, hidden: false }));
  el("#n-type").value = "information";
  const picks = new Map();
  let ibtns = [], dlbtns = [];
  const files = [], objectUrls = [], winListeners = {};
  const drawnEls = new Map();
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
      /* every section the page holds: the ones it has addressed, each by its id */
      if (s === "section") return [...els.values()].filter((e) => /^#s-/.test(e.sel));
      /* a record's download buttons as the page last drew them (R26) */
      if (s === "#b-files .dlbtn")
        return (dlbtns = [...el("#b-files").innerHTML.matchAll(/class="histbtn dlbtn" data-sha="([^"]*)" data-name="([^"]*)"/g)]
          .map((m) => ({ ...mk(`dl:${m[2]}`), dataset: { sha: m[1], name: m[2] } })));
      if (s === "#inbox-body .ibtn")
        return (ibtns = [...el("#inbox-body").innerHTML.matchAll(/class="ibtn" data-i="(\d+)" data-id="([^"]*)" data-to="([^"]*)"/g)]
          .map((m) => ({ ...mk(`ibtn:${m[1]}:${m[3]}`), dataset: { i: m[1], id: m[2], to: m[3] } })));
      /* buttons the page draws into a box (R30's catalogue and tools): "#box .cls", each with its data-* attributes,
         fresh at each draw, kept by box, class and data so a test can press one */
      const drawn = /^#([\w-]+) \.([\w-]+)$/.exec(s);
      if (drawn) return [...el("#" + drawn[1]).innerHTML.matchAll(new RegExp(`<button class="${drawn[2]}"((?: data-[\\w-]+="[^"]*")*)>`, "g"))]
        .map((m) => {
          const dataset = Object.fromEntries([...m[1].matchAll(/data-([\w-]+)="([^"]*)"/g)].map((d) => [d[1], d[2]]));
          const key = `${s}:${JSON.stringify(dataset)}`;
          drawnEls.set(key, { ...mk(key), dataset });
          return drawnEls.get(key);
        });
      /* a list of selectors: each bare id in it is its element */
      return s.split(",").map((x) => x.trim()).filter((x) => /^#[\w-]+$/.test(x)).map((x) => el(x));
    },
    getElementById: (id) => el("#" + id), addEventListener() {},
    /* an anchor the page makes to hand the browser a file: its click is the download starting */
    createElement: () => { const a = mk("new"); a.click = () => { const u = objectUrls.find((x) => x.url === a.href);
      files.push({ name: a.download, url: a.href, blob: u ? u.blob : null, clicked: true }); }; return a; },
    body: { appendChild() {}, removeChild() {} },
  };
  const store = new Map(session ? [["bio-session", JSON.stringify(session)]] : []);
  const sandbox = {
    document, fetch, URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array, Set, Map, Promise,
    crypto: webcrypto, setTimeout, TextEncoder, encodeURIComponent, decodeURIComponent, Blob,
    URL: { createObjectURL: (blob) => { const url = `blob:https://copy.example/${objectUrls.length + 1}`; objectUrls.push({ url, blob, released: false }); return url; },
           revokeObjectURL: (url) => { const u = objectUrls.find((x) => x.url === url); if (u) u.released = true; } },
    addEventListener: (t, f) => { (winListeners[t] ||= []).push(f); },
    location: { hash, pathname: "/", origin: "https://copy.example" },
    history: { replaceState() { replaced += 1; sandbox.location.hash = ""; } },
    sessionStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) },
    navigator: { clipboard: { writeText: async () => {} } },
  };
  Object.assign(sandbox, globals);
  sandbox.window = sandbox;
  const ui = new Function(...Object.keys(sandbox), script + `
;return { mdFor, historyOrder, FIRST_STATE, HEADINGS, RISK_TIERS, riskTierState, SETTABLE_TIERS, deriveInquiryTitle,
          profilesWarning, openProfiles, panel, chosenRiskTier, openBundle, signerAddBody, describeKey, acquireWhy,
          PREFIX, SCHEMA_OF, splitFm, mdRender, ratifyWhy, openBrowse, openInbox, openKeepAway, openOffices, isMachine,
          addedByMember };`)(...Object.values(sandbox));
  const hashchange = async () => { for (const f of winListeners.hashchange || []) await f(); };
  /* the button a box last drew with this data (R30): `drawn("#mk-st-tools .st-rm", { id: "x" })` */
  const drawn = (sel, data) => drawnEls.get(`${sel}:${JSON.stringify(data)}`) || null;
  return { ui, el, sandbox, replaced: () => replaced, picks, ibtns: () => ibtns, dlbtns: () => dlbtns, files, objectUrls, hashchange, shown, drawn };
}

/* R30: a security tools catalogue in file-safety R27's documented shape: an offered tool on the organization's own servers
   with no vendor retention, one whose vendor keeps files for its research, a template, one whose `config` list names a
   required and an optional setting (T37, N777: each entry's list `[{name, label, required}]`, empty when the tool reads
   none; the template's as file-scanner's catalogue states it), and a refused and a held service, each with its reason in
   member words. The digests stand for SHA-256 of each handling's canonical JSON. */
const NEVER = ["file_name", "member_identity", "ip_address"];
export const CATALOGUE = Object.freeze({ ok: true,
  offered: [
    { provider_id: "metadefender-core", vendor: "OPSWAT, Inc.", product: "MetaDefender Core", kinds: ["scan"], transport: "https", reach: "tunnel",
      template: false, credentials: ["api_key"], config: [], licence_note: "the organization's own licence",
      handling: { sends: ["file_bytes"], never_sends: NEVER, recipient: "the organization's own MetaDefender Core server", sub_processors: [],
                  region: "where it runs", file_retention: "as the organization configures it", result_retention: "as configured", sample_sharing: "none" },
      handling_digest: "a".repeat(64), source_urls: [], read_on: "2026-10-07" },
    { provider_id: "sophos-intelix", vendor: "Sophos Ltd", product: "SophosLabs Intelix", kinds: ["scan", "sandbox"], transport: "https", reach: "public",
      template: false, credentials: ["client_id", "client_secret"], config: [], licence_note: null,
      handling: { sends: ["file_bytes"], never_sends: NEVER, recipient: "Sophos Ltd", sub_processors: [], region: "the region chosen",
                  file_retention: "clean files up to 30 days", result_retention: "metadata up to 6 months", sample_sharing: "vendor_internal_research" },
      handling_digest: "b".repeat(64), source_urls: [], read_on: "2026-10-07" },
    { provider_id: "icap-generic", vendor: "", product: "An ICAP scanner you run", kinds: ["scan"], transport: "icap", reach: "tunnel",
      template: true, credentials: [], licence_note: null,
      config: [{ name: "engine_family", label: "The engines the tool runs, as its maker names them", required: true },
               { name: "handling", label: "The tool's statement of what it receives, keeps and shares", required: true },
               { name: "source_urls", label: "Where that statement is published", required: false },
               { name: "service", label: "ICAP service name (default avscan)", required: false }],
      handling: { sends: ["file_bytes"], never_sends: NEVER, recipient: "stated by the administrator", sub_processors: [], region: "stated by the administrator",
                  file_retention: "stated by the administrator", result_retention: "stated by the administrator", sample_sharing: "none" },
      handling_digest: "c".repeat(64), source_urls: [], read_on: "2026-10-07" },
    { provider_id: "cloudflare-intel", vendor: "Cloudflare, Inc.", product: "Cloudflare Intel", kinds: ["url_reputation"], transport: "https", reach: "public",
      template: false, credentials: ["api_token"], licence_note: null,
      config: [{ name: "account_id", label: "Cloudflare account ID", required: true },
               { name: "zone_hint", label: "A zone to look up first (optional)", required: false }],
      handling: { sends: ["hash_prefix"], never_sends: NEVER, recipient: "Cloudflare, Inc.", sub_processors: [], region: "global",
                  file_retention: "no file is sent", result_retention: "not kept", sample_sharing: "none" },
      handling_digest: "d".repeat(64), source_urls: [], read_on: "2026-10-07" },
  ],
  refused: [{ provider_id: "anyrun", reason: "SHARES_BY_DEFAULT", words: "It shares files it is sent unless a paid private mode is checked on every call." }],
  held: [{ provider_id: "some-vendor", reason: "HANDLING_NOT_STATED", words: "Its vendor does not state how long it keeps files." }],
});

/* R12, R28 (R30's sections): the catalogue and the group's tools with every string the page draws set to `evil`, so a
   test can find whether any of it is drawn as markup. */
export const hostileSecurity = (evil) => ({
  securitytoolcatalogue: { result: { ok: true,
    offered: [{ provider_id: evil, vendor: evil, product: evil, kinds: [evil], template: false, credentials: [evil], licence_note: evil,
                config: [{ name: evil, label: evil, required: true }],
                handling: { sends: [evil], never_sends: [evil], recipient: evil, sub_processors: [evil], region: evil, file_retention: evil,
                            result_retention: evil, sample_sharing: evil }, handling_digest: evil }],
    refused: [{ provider_id: evil, reason: evil, words: evil }], held: [{ provider_id: evil, reason: evil, words: evil }] } },
  securitytools: { result: { ok: true, tools: [{ tool_id: evil, provider_id: evil, use: "routine", state: evil, off_reason: evil, monthly_limit: evil }] } },
  securitytooladd: { result: { ok: true, tool_id: evil, state: "added" } },
  securitytooltest: { result: { ok: true, tool_id: evil, state: "test_failed", passed: false, detail: evil } },
  aikeepawaystate: { result: { on: true, reason: evil, set_by: evil, set_at: evil } },
});

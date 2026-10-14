/* interface-shell: the browser program (R3–R22, R24, R26–R45). `shellProgram(D, SCREENS, win, GUIDE)` is serialized whole
   into the page's one script by `interfacePage` (draft-T46-interface §1.3): it refers only to its parameters and to the
   language's own globals, so the same function runs in node over the tests' document stand-in. `D` is the page's frozen
   data (words, the act gate's tables, the grades, the paths, the frames), `SCREENS` the registered screens (R21), `win`
   the window and `GUIDE` the dock's wizard guide (R31) or null. It reads no table and writes nothing of the record: every
   read and act is an op the plane serves, under the session record this module keeps (R32); it keeps no log of reads or
   of screens visited (R24). */
export function shellProgram(D, SCREENS, win, GUIDE) {
  "use strict";
  const doc = win.document;
  const store = (name) => ({
    get(k) { try { return win[name].getItem(k); } catch { return null; } },
    set(k, v) { try { win[name].setItem(k, v); } catch { /* R26, R18: a storage that cannot be written keeps the default */ } },
    del(k) { try { win[name].removeItem(k); } catch { /* nothing kept to remove */ } },
  });
  const local = store("localStorage"), tab = store("sessionStorage");

  /* ---------- words (R5, R6) ---------- */
  const BASE = new Map(D.words);
  let SHOWN = new Map();
  let wordsRead = false, wordsRetry = false;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const unesc = (s) => String(s).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
  const textOf = (h) => unesc(String(h == null ? "" : h).replace(/<[^>]*>/g, "")).trim();
  const has = (key) => BASE.has(key);
  const text = (key) => (SHOWN.has(key) ? SHOWN.get(key) : BASE.has(key) ? BASE.get(key) : key);
  /* `w(key, fills)`: the word, HTML-escaped, each `{name}` filled with its value escaped; a value `{html}` is a fragment
     the kit itself made (a date, a refusal's words), inserted as it is. */
  const w = (key, fills) => esc(text(key)).replace(/\{(\w+)\}/g, (m, n) => {
    if (!fills || !(n in fills)) return m;
    const v = fills[n];
    return v && typeof v === "object" && "html" in v ? v.html : esc(v);
  });
  const html = (s) => ({ html: s });
  const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  /* R6: a date by `date.daymonthyear` (or `date.daymonth` with `{year: false}`) and `date.month.*`, never ISO. */
  function date(iso, o = {}) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    let y, mo, d;
    if (m) { y = +m[1]; mo = +m[2] - 1; d = +m[3]; }
    else {
      const t = new Date(typeof iso === "number" ? iso : String(iso || ""));
      if (isNaN(t.getTime())) return "";
      y = t.getUTCFullYear(); mo = t.getUTCMonth(); d = t.getUTCDate();
    }
    if (!(mo >= 0 && mo < 12)) return "";
    const month = html(w("date.month." + MONTHS[mo]));
    return o.year === false ? w("date.daymonth", { day: String(d), month }) : w("date.daymonthyear", { day: String(d), month, year: String(y) });
  }

  /* ---------- frames (R30, R45) ---------- */
  const frameOf = (id) => D.frames[id] || "working";
  const sessionless = (id) => frameOf(id) === "public" || frameOf(id) === "published";

  /* ---------- the session record (R32) ---------- */
  /* Beside the record, never holding the token: why it last changed, for the other tabs (`locked`, `ended`,
     `signedout`); the last instant of the member's own activity, shared by the tabs (R33); and, in this tab's
     sessionStorage, the path to return to. */
  const STATE_KEY = D.storeKey + ":state", ACTIVE_KEY = D.storeKey + ":active", RETURN_KEY = D.storeKey + ":return";
  let S = null, ME = null, LOCKED = false, ENTRY = { state: null, handle: null }, STARTED = false;
  /* R46: the fragment, read once on load and removed from the address before any request; page memory only */
  let FRAGMENT = {}, RECORD_READ = false;
  function readRecord() {
    try {
      const s = JSON.parse(local.get(D.storeKey) || "null");
      if (s && typeof s.t === "string" && s.t && (!s.e || s.e > Date.now())) return { t: s.t, e: Number(s.e) || 0, d: s.d === "own" ? "own" : "shared", w: typeof s.w === "string" ? s.w : "" };
    } catch { /* an unreadable record is none */ }
    return null;
  }
  function writeRecord(r) { local.set(D.storeKey, JSON.stringify({ t: r.t, e: r.e || 0, d: r.d, w: r.w || "" })); local.del(STATE_KEY); }
  function clearRecord(why) { if (why) local.set(STATE_KEY, why); else local.del(STATE_KEY); local.del(D.storeKey); }
  const working = () => ROUTE && frameOf(ROUTE.screen) === "working" && !ROUTE.root;
  /* R32: the path to return to, the address alone (never a query, a fragment or the token) */
  function keepReturn() { if (working()) tab.set(RETURN_KEY, win.location.pathname); }
  function takeReturn() { const r = tab.get(RETURN_KEY); tab.del(RETURN_KEY); return r && /^\/app(\/|$)/.test(r) ? r : "/app"; }
  /* The session is over (R3, R32, R33): the record cleared, the other tabs told why, and `front` drawn in that state. */
  function over(why) {
    if (!S) return;
    keepReturn();
    const handle = S.w || (ME && ME.handle) || null;
    /* a dialog still open over the screen answers no */
    if (REAUTH) { const r = REAUTH; REAUTH = null; r.resolve(false); }
    if (DIALOG) { const d = DIALOG; DIALOG = null; if (d.resolve) d.resolve(d.kind === "register" ? null : false); }
    OVERLAY_REFUSAL = "";
    S = null; ME = null; LOCKED = false; stopIdle();
    clearRecord(why);
    ENTRY = { state: why, handle };
    route();
  }

  /* The op client: the token only in the Authorization header (R3); a 401 to any request ends the session (R32); the
     plane's `SESSION_LOCKED` locks the page (R33). A request with no session, or for a screen drawn without one,
     carries no Authorization header and is sent only for a public op (R30, R45). Answers `{kind: "ok", value}`,
     `{kind: "refused", code, translation, fields, server}` (R13) or `{kind: "silent"}` (no answer). */
  async function call(op, req = {}) {
    const own = typeof req.bearer === "string" && req.bearer !== "";
    /* R46: `unlock` is sent under the locked session's token, from whichever frame */
    const pub = !own && (!S || (!!req.public && op !== "unlock"));
    if (pub && !D.publicOps.includes(op)) return { kind: "refused", code: "NOT_SIGNED_IN", translation: null, fields: {} };
    const qs = new URLSearchParams();
    qs.set("op", op);
    for (const [k, v] of Object.entries(req.query || {})) if (v !== undefined && v !== null) qs.set(k, String(v));
    /* R33: a read the shell makes on its own timers is marked background, so the plane counts it as no activity */
    if (req.background) qs.set("background", "1");
    const init = { headers: {} };
    if (!pub) init.headers.Authorization = "Bearer " + (own ? req.bearer : S.t);
    if (req.raw !== undefined) { init.method = "POST"; init.body = req.raw; if (req.rawType) init.headers["content-type"] = req.rawType; }
    else if (req.body !== undefined) { init.method = "POST"; init.body = JSON.stringify(req.body); init.headers["content-type"] = "application/json"; }
    const held = S;
    let r;
    try { r = await win.fetch("/api/?" + qs.toString(), init); } catch { return { kind: "silent" }; }
    if (r.status === 401 && !own && !pub) { if (S && S === held) over("ended"); return { kind: "silent" }; }
    if (req.bytes) return { kind: "response", r };
    let j = null;
    const type = r.headers && typeof r.headers.get === "function" ? String(r.headers.get("content-type") || "") : "";
    const server = r.status >= 500;
    const refusedOf = (o) => {
      const a = { kind: "refused", code: String((o && (o.code || o.reason)) || r.status), translation: o && typeof o.translation === "string" ? o.translation : null, fields: o || {}, server };
      if (a.code === "SESSION_LOCKED" && !own && !pub && !req.noLock && S === held) lock(false);
      return a;
    };
    if (/ndjson/i.test(type)) {
      /* R21 (K3011): a streamed answer (application/x-ndjson, `agent-worker` R54) is its list of parsed events, the
         answer the last; a line that does not parse is no answer */
      let events = null;
      try { events = String(await r.text()).split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)); } catch { events = null; }
      if (!events || !events.length) return { kind: "silent" };
      const last = events[events.length - 1];
      if (!r.ok || (last && typeof last === "object" && last.ok === false)) return refusedOf(last && typeof last === "object" ? last : null);
      return { kind: "ok", value: events, json: events };
    }
    try { j = await r.json(); } catch { j = null; }
    if (j && typeof j === "object" && j.ok === false) return refusedOf(j);
    const value = j && typeof j === "object" && "result" in j ? j.result : j;
    if (value && typeof value === "object" && value.ok === false) return refusedOf(value);
    if (!r.ok) return j && typeof j === "object" ? refusedOf(j) : { kind: "refused", code: String(r.status), translation: null, fields: {}, server };
    if (j === null) return { kind: "silent" };
    return { kind: "ok", value, json: j };
  }
  const unreachable = (a) => a.kind === "silent" || (a.kind === "refused" && a.server);

  /* ---------- the act gate (R12, R30, R45) and the weights (R11) ---------- */
  const ADMIN = new Set(D.adminActs);
  const SESSION = { member: new Set(D.sessionOps.member), admin: new Set(D.sessionOps.admin) };
  function can(op, inst) {
    if (!(op in D.ops)) return false;
    /* R30, R45: a screen drawn without a session offers only the public ops */
    if (inst && inst.pub) return D.publicOps.includes(op) || (op === "unlock" && !!S);
    if (!ME) return false;
    const need = D.needs[op];
    const caps = Array.isArray(ME.capabilities) ? ME.capabilities : [];
    if (need !== undefined && need !== null && !caps.includes(need)) return false;
    const set = ME.tokenClass === "admin" ? SESSION.admin : SESSION.member;
    if (!set.has(op)) return false;
    if (ADMIN.has(op) && ME.administer !== true) return false;
    return true;
  }
  const WEIGHTS = ["reversible", "reasoned", "terminal", "signed", "irreversible"];
  const weightOf = (op) => { const r = D.rungs[op]; const n = r === "attested" ? "signed" : r; return n === "none" || WEIGHTS.includes(n) ? n : "reasoned"; };

  /* ---------- explanation level (R17), appearance (R18), the rail's width (R26) ---------- */
  let LEVEL = local.get("cs-level") === "pause" ? "pause" : "prompt";
  let LEVEL_INFO = null;
  let THEME = ["light", "dark"].includes(local.get("cs-theme")) ? local.get("cs-theme") : "device";
  const RAIL_DEFAULT = 184;
  const clampW = (n) => Math.max(64, Math.min(320, Math.round(n)));
  let RAILW = (() => { const n = Number(local.get("cs-railw")); return Number.isFinite(n) && n >= 64 && n <= 320 ? n : RAIL_DEFAULT; })();
  function applyTheme() {
    const root = doc.documentElement;
    if (THEME === "device") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", THEME);
  }
  async function setLevel(v, asked) {
    LEVEL = v === "pause" ? "pause" : "prompt";
    local.set("cs-level", LEVEL);
    const body = asked ? { level: LEVEL, asked: true } : { level: LEVEL };
    if (can("infolevelset")) {
      const a = await call("infolevelset", { body });
      if (a.kind === "ok" && asked) LEVEL_INFO = Object.assign({}, LEVEL_INFO || {}, { asked_at: "now" });
    }
    draw();
  }
  function setTheme(v) { THEME = ["light", "dark"].includes(v) ? v : "device"; local.set("cs-theme", THEME); applyTheme(); draw(); }

  /* ---------- the phone width ---------- */
  const mq = typeof win.matchMedia === "function" ? win.matchMedia("(max-width: " + D.phoneWidth + "px)") : null;
  const phone = () => !!(mq && mq.matches);

  /* ---------- the frame's reads ---------- */
  let GROUP = null, TODO = null, REACHABLE = false, DOCK = false, ASK_LEVEL = false, BOOT = null;
  const screenOf = (id) => SCREENS.find((s) => s.id === id) || null;

  /* ---------- screen instances: reads, states, acts ---------- */
  let MAIN = null, DOCKI = null, GUIDEI = null, ROUTE = null, RING = null, UNREACHED = false;
  function emptyOf(spec, v) {
    if (spec && typeof spec.empty === "function") return !!spec.empty(v);
    if (v === null || v === undefined) return true;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "object") for (const k of ["items", "results", "list", "rows", "words"]) if (Array.isArray(v[k])) return v[k].length === 0;
    return false;
  }
  /* R39 (N1001): a refusal's trace, drawn as a short reference beside its words and kept nowhere */
  const traceOf = (a) => (a && a.fields && typeof a.fields.trace === "string" && a.fields.trace
    ? ' <span class="cs-trace">' + w("shell.trace", { trace: a.fields.trace.slice(0, 8) }) + "</span>" : "");
  /* R13: `refusal.<code>` (or the screen's own key for the code) when held; else the answer's translation; else
     `state.failed` with the code (a read's state already says it, so a read is handed the code alone) */
  function refusalWords(a, own, bare, inst) {
    /* R21 (K3002): a screen's own word for the code, or its own function `(refusal, cs)` → HTML */
    if (own && typeof own[a.code] === "function") {
      try { return String(own[a.code]({ code: a.code, translation: a.translation, ...(a.fields || {}) }, inst ? kit(inst) : null)) + traceOf(a); } catch { /* falls to the words below */ }
    }
    const key = own && typeof own[a.code] === "string" ? own[a.code] : "refusal." + a.code;
    if (has(key)) return w(key, a.fields || {}) + traceOf(a);
    if (a.translation) return esc(a.translation) + traceOf(a);
    return (bare ? esc(a.code) : w("state.failed", { reason: a.code })) + traceOf(a);
  }
  function outcome(spec, a) {
    if (a.kind === "ok") return emptyOf(spec, a.value) ? { state: "empty", value: a.value, refusal: null } : { state: "ok", value: a.value, refusal: null };
    if (a.kind === "refused") return { state: "failed", value: null, refusal: { code: a.code, words: refusalWords(a, spec && spec.refusals, true, null) } };
    return { state: "failed", value: null, refusal: { code: null, words: w("shell.noanswer") } };
  }
  /* R46: the session as a screen sees it: `none`, `signedout`, `ended`, `locked` or `live`, with the handle */
  function sessionView() {
    if (S && !LOCKED && ENTRY.state !== "locked") return { state: "live", handle: S.w || (ME && ME.handle) || null };
    if (ENTRY.state) return { state: ENTRY.state, handle: ENTRY.handle };
    if (S && LOCKED) return { state: "locked", handle: S.w || null };
    return { state: "none", handle: null };
  }
  function instance(spec, subject, key, serves) {
    const inst = { key, spec, subject, serves: serves || null, data: {}, ui: {}, acts: [], binds: [], gen: 0, unavail: null, timers: [], fills: {}, labels: {}, stash: null, retry: null, images: {}, areas: {} };
    inst.view = key === "g"
      /* K3143: the guide's one view for the page's life: `{ui, me, reachable, screen, subject}` */
      ? { ui: inst.ui, get me() { return ME; }, get reachable() { return REACHABLE; }, get screen() { return ROUTE ? ROUTE.screen : null; },
        get subject() { return ROUTE ? ROUTE.subject : null; }, parts: spec.parts || {}, origin: win.location.origin }
      : { subject, data: inst.data, ui: inst.ui, get me() { return ME; }, get reachable() { return REACHABLE; }, serves: inst.serves,
        get session() { return sessionView(); }, get fragment() { return Object.assign({}, FRAGMENT); },
        parts: spec.parts || {}, origin: win.location.origin };
    /* R30, R45: a screen of the public or published frame is drawn without a session, whatever the record holds */
    Object.defineProperty(inst, "pub", { get: () => key !== "g" && (sessionless(spec.id) || !S) });
    return inst;
  }
  const NOT_FOUND = /^NO_SUCH_|_NOT_FOUND$|^NOT_FOUND$/;
  const live = (inst) => inst === MAIN || inst === DOCKI || inst === GUIDEI;
  async function readAll(inst, names, background) {
    let specs = {};
    try { specs = inst.spec.reads ? inst.spec.reads(inst.view) || {} : {}; } catch { specs = {}; }
    const gen = ++inst.gen;
    const todo = Object.entries(specs).filter(([n]) => !names || names.includes(n));
    for (const [n] of todo) if (!inst.data[n] || !names) inst.data[n] = { state: "loading", value: null, refusal: null };
    if (!names && !background) inst.unavail = null;
    draw();
    await Promise.all(todo.map(async ([n, spec]) => {
      const a = await call(spec.op, { query: spec.query, body: spec.body, public: inst.pub, background });
      if (gen !== inst.gen && !names) return;
      inst.data[n] = outcome(spec, a);
      /* R9, R35: the subject's read decides whether the screen can be drawn at all */
      if (spec.subject) {
        const was = inst.unavail;
        if (unreachable(a)) inst.unavail = "unreachable";
        else if (a.kind === "refused" && D.notYours.includes(a.code)) inst.unavail = "notyours";
        else if (inst.data[n].state === "empty" || (a.kind === "refused" && NOT_FOUND.test(a.code))) inst.unavail = "nothing";
        else inst.unavail = null;
        if (inst.unavail === "unreachable") retryLater(inst);
        if (was === "unreachable" && !inst.unavail && inst.stash) { inst.pending = inst.stash; inst.stash = null; }
      }
      draw();
    }));
  }
  /* R35: an unreachable screen is tried again every 30 seconds, in the background, while it is the one shown */
  function retryLater(inst) {
    if (inst.retry !== null) return;
    inst.retry = setTimeout(() => { inst.retry = null; if (live(inst)) readAll(inst, null, true); }, D.retry);
  }

  /* ---------- the kit `cs` (draft §2.2 Suggestions; the screen contract, R21) ---------- */
  const I = (n) => '<svg class="i" aria-hidden="true"><use href="' + D.icons + "#i-" + n + '"/></svg>';
  const tipAttr = (tip, level) => (tip ? ' data-level="' + level + '" data-tip="' + esc(tip) + '"' : "");
  const kw = (key) => (has(key) ? w(key) : "");
  const MARK = {
    kind: { cls: "cs-kind", attr: "data-kind", icon: (v) => v },
    gap: { cls: "cs-gap", attr: "data-gap", icon: (v) => v },
    origin: { cls: "cs-origin", attr: "data-origin", icon: (v) => v },
    hint: { cls: "cs-hint", attr: null, icon: () => "hint" },
    hunch: { cls: "cs-hunch", attr: null, icon: () => "hunch" },
    outward: { cls: "cs-tag-outward", attr: null, icon: () => "outward" },
    path: { cls: "cs-path", attr: null, icon: null },
    tag: { cls: "cs-kind", attr: null, icon: null },
    scale: { cls: "cs-grade", attr: "data-scale", icon: (v) => v },
  };
  const wordOrData = (o) => (o && typeof o === "object" ? (typeof o.key === "string" ? w(o.key, o.fills) : esc(o.text)) : typeof o === "string" ? w(o) : "");
  function kit(inst, bg) {
    const cs = {
      w, esc, date,
      get me() { return ME; },
      get reachable() { return REACHABLE; },
      can: (op) => can(op, inst),
      level: () => LEVEL,
      setLevel: (v) => setLevel(v),
      theme: () => THEME,
      setTheme: (v) => setTheme(v),
      go: (screen, subject) => navigate(hrefOf(screen, subject)),
      now: () => Date.now(),
      /* R21 (K3002): the lowercase hex SHA-256 of the text's UTF-8 bytes */
      async digest(t) {
        const buf = await win.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(t)));
        return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      },
      /* R21 (K2998): one op, its parsed answer (null when none came); `bearer` replaces the session for this request only;
         R33: a call made from `cs.later` is background */
      async call(op, o = {}) {
        const a = await call(op, { query: o.query, body: o.body, raw: o.raw, rawType: o.rawType, bearer: o.bearer, public: inst.pub, background: !!(bg || o.background) });
        return a.kind === "ok" ? a.json : a.kind === "refused" ? a.fields : null;
      },
      /* R21 (K2999): a byte answer handed to the browser as a file, its object address released once the download starts */
      async download(op, o = {}) {
        const a = await call(op, { query: o.query, body: o.body, bytes: true, public: inst.pub });
        if (a.kind !== "response") return { ok: false, answer: null };
        const r = a.r;
        const type = r.headers && r.headers.get ? r.headers.get("content-type") || "" : "";
        if (!r.ok || /json/i.test(type)) { let j = null; try { j = await r.json(); } catch { j = null; } return { ok: false, answer: j }; }
        const blob = await r.blob();
        saveFile(blob, o.name || "");
        return { ok: true, answer: { type, size: blob.size } };
      },
      set: (name, value) => { inst.ui[name] = value; draw(); },
      value(id) {
        /* R49: an areas control answers its rectangles in the image's pixels */
        if (Object.hasOwn(inst.areas, id)) return inst.areas[id].map((r) => ({ left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) }));
        const el = doc.getElementById(id);
        if (!el) return null;
        if (el.tagName === "FIELDSET") return Array.from(el.querySelectorAll("input")).filter((i) => i.checked).map((i) => i.value);
        if (el.type === "checkbox" || el.type === "radio") return !!el.checked;
        return el.value;
      },
      /* R27 (K3014): a field the screen drew set to `value` over what was typed there, kept by later redraws */
      fill(id, value, o = {}) {
        const el = doc.getElementById(id);
        const owner = inst.key === "g" ? MAIN || inst : inst;
        /* K3143: a draft's label, drawn beside the field as `field`'s draft label is */
        if (o && o.label) owner.labels[id] = o.label; else delete owner.labels[id];
        if (el && !(el.type === "file")) { if (el.type === "checkbox" || el.type === "radio") el.checked = !!value; else el.value = String(value == null ? "" : value); draw(); }
        else owner.fills[id] = value;
      },
      /* K3143: the text field the control for `op` sends: the nearest textarea, else text input, before the control
         inside its enclosing section or row panel; null when none */
      fieldOf(op) {
        const main = doc.getElementById("cs-main");
        const ctl = main ? main.querySelector('[data-act="' + String(op).replace(/"/g, "") + '"]') : null;
        if (!ctl) return null;
        const scope = ctl.closest("tr.cs-panel") || ctl.closest("section") || main;
        let best = null;
        for (const el of scope.querySelectorAll("textarea, input")) {
          if (el.localName === "input" && el.type !== "text") continue;
          if (!el.id) continue;
          if (precedes(el, ctl)) best = el.localName === "textarea" || !best || best.localName !== "textarea" ? el : best;
        }
        return best ? best.id : null;
      },
      /* K3143: the device's own note under `cs-guide:`, wrapped as R26's (an unreadable storage answers null) */
      kept: (k) => local.get("cs-guide:" + String(k)),
      keep: (k, v) => { if (v === null || v === undefined) local.del("cs-guide:" + String(k)); else local.set("cs-guide:" + String(k), String(v)); },
      /* R27 (K3013): `fn(cs, view)` once after `ms` on the page's clock, cancelled when the member leaves the screen or
         the page; the calls it makes are background (R33) */
      later(ms, fn) {
        const t = setTimeout(() => {
          inst.timers = inst.timers.filter((x) => x !== t);
          if (!live(inst) || typeof fn !== "function") return;
          try { fn(kit(inst, true), inst.view); } catch { /* a screen's own timer never stops the shell */ }
        }, Math.max(0, Number(ms) || 0));
        inst.timers.push(t);
        return t;
      },
      file(id) { const el = doc.getElementById(id); return el && el.files && el.files[0] ? el.files[0] : null; },
      /* R10: a read in one of four states; `inner(value)` draws its data */
      state(r, inner, o) {
        if (typeof r === "string" && inner && typeof inner === "object" && typeof o === "function") { const f = o; o = {}; inner = f; }
        if (typeof r === "string") r = inst.data[r];
        o = o || {};
        if (!r || r.state === "loading") return '<p class="cs-state" data-state="loading" role="status"><span class="bar" aria-hidden="true"></span>' + w("state.loading") + "</p>";
        if (r.state === "failed") return '<p class="cs-state" data-state="failed" role="alert">' + w("state.failed", { reason: html(r.refusal ? r.refusal.words : w("shell.noanswer")) }) + "</p>";
        if (r.state === "empty") return '<p class="cs-state" data-state="empty">' + w(o.empty || "state.empty") + "</p>";
        return typeof inner === "function" ? inner(r.value) : "";
      },
      /* R11, R12: the act's button, gated, labelled, weighted; "" when the session may not do it */
      act(op, o = {}) {
        const spec = (inst.spec.acts || []).find((a) => a.op === op);
        if (!spec || !can(op, inst)) return "";
        const weight = weightOf(op);
        const label = w(o.label || spec.label || "act." + op + ".label." + (inst.spec.id || "guide"), o.fills);
        const does = has("act." + op + ".does") ? w("act." + op + ".does") : "";
        const outward = !!(spec.outward || o.outward);
        /* R11 (DEC-181), R50: a signed or irreversible act, or one of `op-grades`' larger-screen acts, is held at the phone width */
        if (phone() && (weight === "signed" || weight === "irreversible" || D.larger.includes(op)))
          return '<div class="cs-reason" data-phone-act="' + esc(op) + '"><b>' + label + "</b>" + (does ? "<p>" + does + "</p>" : "") + "<p>" + w("shell.phone.larger") + "</p></div>";
        const idx = inst.acts.push({ op, spec, data: o.data || {}, table: inst.holding || o.table || null }) - 1;
        const data = Object.entries(o.data || {}).map(([k, v]) => " data-" + k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + '="' + esc(v) + '"').join("");
        const weighed = weight !== "none";
        const pips = '<span class="cs-pips" aria-hidden="true">' + [1, 2, 3, 4, 5].map((i) => "<i" + (i <= WEIGHTS.indexOf(weight) + 1 ? ' class="on"' : "") + "></i>").join("") + "</span>";
        const tip = (does ? "<b>" + label + "</b>: " + does : "<b>" + label + "</b>") + (weighed ? '<span class="why">' + w("weight." + weight + ".means") + "</span>" : "")
          + (outward ? '<span class="why">' + w("mark.outward.means") + "</span>" : "");
        return '<span class="cs-actwrap"><button type="button" class="cs-btn"' + (o.tone ? ' data-tone="' + esc(o.tone) + '"' : "")
          + ' data-act="' + esc(op) + '" data-ai="' + inst.key + ":" + idx + '"' + data + tipAttr(tip, 2) + ">"
          + (o.icon ? I(o.icon) : "") + (outward ? I("outward") : "") + label
          + (weighed ? '<span class="w">' + pips + w("weight." + weight + ".name") + "</span>" : "") + "</button>"
          + '<span class="cs-slot" data-slot="' + inst.key + ":" + idx + '"></span></span>';
      },
      /* R16: an item the record holds, a link to its screen where one is built, with its card */
      ref(kind, id, label, facts) {
        const screen = D.refScreens[kind];
        const target = screen && screenOf(screen) && id !== undefined && id !== null && id !== "" ? hrefOf(screen, id) : null;
        const card = "<b>" + kw("shell.card." + kind) + "</b>" + (facts || []).filter((f) => f !== null && f !== undefined && f !== "")
          .map((f) => '<span class="why">' + esc(f) + "</span>").join("") + (target ? '<span class="more">' + w("shell.card.open") + "</span>" : "");
        return target
          ? '<a class="cs-ref" href="' + esc(target) + '" data-nav' + tipAttr(card, 1) + ">" + esc(label) + "</a>"
          : '<span class="cs-card" tabindex="0"' + tipAttr(card, 1) + ">" + esc(label) + "</span>";
      },
      /* level 1: a mark explains itself; its name is the word `mark.<family>.<value>.name` (or `.label`) */
      mark(family, value, fills) {
        const m = MARK[family] || { cls: "cs-kind", attr: null, icon: null };
        const base = "mark." + family + (value ? "." + value : "");
        const nameKey = [base + ".name", base + ".label"].find(has);
        const meansKey = [base + ".means", "mark." + family + ".means"].find(has);
        const extra = fills && fills.reason !== undefined && fills.reason !== null ? "<span>" + esc(fills.reason) + "</span>" : "";
        const name = nameKey ? (extra ? "<b>" + w(nameKey, fills) + "</b>" : w(nameKey, fills)) : "";
        return '<span class="' + m.cls + '"' + (m.attr && value ? " " + m.attr + '="' + esc(value) + '"' : "") + ' tabindex="0"'
          + tipAttr(meansKey ? w(meansKey, fills) : "", 1) + ">" + (m.icon ? I(m.icon(value)) : "") + name + extra + "</span>";
      },
      grade(scale, letter) {
        const tip = "<b>" + kw("mark.scale." + scale + ".name") + "</b>: " + kw("mark.scale." + scale + ".means") + '<span class="why">' + kw("mark.grade.reading") + "</span>";
        return '<span class="cs-grade" data-scale="' + esc(scale) + '" tabindex="0"' + tipAttr(tip, 1) + ">" + I(scale) + '<span class="sr">' + kw("mark.scale." + scale + ".name") + "</span>" + esc(letter) + "</span>";
      },
      due(iso, state) {
        return '<span class="cs-due"' + (state ? ' data-due="' + esc(state) + '"' : "") + ' tabindex="0"' + tipAttr(kw("mark.due.means"), 1) + ">"
          + I(state === "met" ? "accepted" : "clock") + date(iso) + "</span>";
      },
      hint(label) {
        return '<span class="cs-hint" tabindex="0"' + tipAttr(kw("mark.hint.means"), 1) + ">" + I("hint") + (label ? esc(label) : kw("mark.hint.label")) + "</span>";
      },
      title(label, o = {}) {
        if (o.thing) o = typeof o.thing === "string" ? { kind: o.thing, facts: o.facts } : { kind: o.thing.kind, facts: o.thing.facts };
        const purpose = kw("screen." + inst.spec.id + ".purpose");
        const t = label === undefined || label === null ? kw("screen." + inst.spec.id + ".name") : esc(label);
        const tip = o.kind
          ? "<b>" + kw("shell.card." + o.kind) + "</b>" + (o.facts || []).map((f) => '<span class="why">' + esc(f) + "</span>").join("") + (purpose ? '<span class="more">' + purpose + "</span>" : "")
          : purpose;
        return '<h1 class="t-title" tabindex="0"' + tipAttr(tip, o.kind ? 1 : 2) + ">" + t + "</h1>";
      },
      sec(titleKey, inner, o = {}) {
        const help = o.help || (has(titleKey + ".holds") ? titleKey + ".holds" : null);
        return '<section class="cs-section"' + (o.id ? ' id="' + esc(o.id) + '"' : "") + '><h2 tabindex="0"' + tipAttr(help ? w(help) : "", 2) + ">" + w(titleKey, o.fills) + "</h2>" + inner + "</section>";
      },
      sheet: (inner) => '<div class="cs-sheet">' + inner + "</div>",
      row: (a, b, c = "", meta = "") => '<div class="cs-row">' + a + "<span>" + b + "</span>" + c + (meta ? '<span class="meta">' + meta + "</span>" : "") + "</div>",
      /* R22: every field has its label */
      field(id, labelKey, o = {}) {
        const cls = "cs-input" + (o.rec ? " rec" : "") + (o.draft ? " cs-draft" : "");
        const attrs = (o.type ? ' type="' + esc(o.type) + '"' : o.area ? "" : ' type="text"') + (o.max ? ' maxlength="' + esc(o.max) + '"' : "")
          + (o.accept ? ' accept="' + esc(o.accept) + '"' : "") + (o.capture ? ' capture="' + esc(o.capture) + '"' : "")
          + (o.help ? ' aria-describedby="' + esc(id) + '-help"' : "") + (o.autocomplete ? ' autocomplete="' + esc(o.autocomplete) + '"' : "");
        const input = o.area ? '<textarea id="' + esc(id) + '" class="' + cls + '"' + attrs + ">" + esc(o.value || "") + "</textarea>"
          : "<input id=\"" + esc(id) + '" class="' + cls + '"' + attrs + (o.type === "file" || o.type === "password" ? "" : ' value="' + esc(o.value || "") + '"') + ">";
        return '<div class="cs-field"><label for="' + esc(id) + '">' + w(labelKey, o.fills) + "</label>"
          + (o.help ? '<span class="help" id="' + esc(id) + '-help">' + w(o.help) + "</span>" : "") + input
          + (o.draft ? '<span class="cs-draftlabel">' + I("machine") + w(o.draft, o.draftFills) + "</span>" : "") + "</div>";
      },
      /* R27 (N986): options are words by key, `[value, key, fills]`, or record data, `{value, text}`, the text drawn as
         data, HTML-escaped and never read as a key */
      choice(id, labelKey, options, o = {}) {
        const valueOf = (x) => (Array.isArray(x) ? x[0] : x && typeof x === "object" ? x.value : x);
        /* R49 (K3150): `{acts: {<value>: op}}`: the choice drives the act it governs, one button following it */
        const drives = !!(o.acts && typeof o.acts === "object");
        const values = (options || []).map(valueOf);
        const chosen = drives ? (values.includes(inst.ui["choice:" + id]) ? inst.ui["choice:" + id] : values.includes(o.value) ? o.value : values[0]) : o.value;
        if (drives) inst.ui["choice:" + id] = chosen;
        const opt = (x) => {
          const [v, t] = Array.isArray(x) ? [x[0], w(x[1], x[2])] : x && typeof x === "object" ? [x.value, typeof x.key === "string" ? w(x.key, x.fills) : esc(x.text)] : [x, esc(x)];
          return '<option value="' + esc(v) + '"' + (chosen === v ? " selected" : "") + ">" + t + "</option>";
        };
        const field = '<div class="cs-field"><label for="' + esc(id) + '">' + w(labelKey) + '</label><select id="' + esc(id) + '" class="cs-input"' + (drives ? ' data-shell="choice" data-choice="' + esc(id) + '"' : "") + ">"
          + (options || []).map(opt).join("") + "</select></div>";
        return drives && Object.hasOwn(o.acts, chosen) ? field + cs.act(o.acts[chosen], o.act || {}) : field;
      },
      /* R49 (K3147, K3150): an image an op answers, fetched with the session's header and drawn from an object address
         the page made (never a credential in an address); `alt` a word key or `{text}` */
      image(op, params, o = {}) {
        const key = op + "?" + JSON.stringify(params || {});
        let im = inst.images[key];
        if (!im) { im = inst.images[key] = { url: null, state: "loading" }; loadImage(inst, im, op, params); }
        return '<img class="cs-image" alt="' + wordOrData(o.alt) + '" data-image="' + im.state + '"' + (im.url ? ' src="' + esc(im.url) + '"' : "") + ">";
      },
      /* R49: rectangles drawn over an image by pointer, touch or keyboard, each moved and resized; read by `cs.value(id)`
         as `[{left, top, width, height}]` in the image's pixels */
      areas(imageHtml, o = {}) {
        const id = String(o.id || "areas");
        if (!Object.hasOwn(inst.areas, id)) inst.areas[id] = (o.areas || []).map((r) => ({ left: +r.left || 0, top: +r.top || 0, width: +r.width || 0, height: +r.height || 0 }));
        const list = inst.areas[id];
        const nat = inst.ui["areas-size:" + id] || null;
        const pos = (r) => (nat ? "left:" + (100 * r.left / nat.w) + "%;top:" + (100 * r.top / nat.h) + "%;width:" + (100 * r.width / nat.w) + "%;height:" + (100 * r.height / nat.h) + "%"
          : "left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px");
        const label = o.label ? wordOrData(o.label) : w("shell.areas");
        return '<div class="cs-areas" id="' + esc(id) + '" role="group" aria-label="' + label + '"><div class="cs-areas-box" data-shell="areas-box" data-areas="' + esc(id) + '">' + imageHtml
          + list.map((r, i) => '<button type="button" class="cs-area" data-shell="area" data-areas="' + esc(id) + '" data-i="' + i + '" style="' + pos(r) + '" aria-label="'
            + w("shell.areas.one", { n: String(i + 1), left: String(Math.round(r.left)), top: String(Math.round(r.top)), width: String(Math.round(r.width)), height: String(Math.round(r.height)) }) + '"></button>').join("")
          + '</div><p class="help">' + w("shell.areas.help") + '</p><span class="cs-actrow"><button type="button" class="cs-btn" data-tone="quiet" data-shell="area-add" data-areas="' + esc(id) + '">' + w("shell.areas.add") + "</button>"
          + (list.length ? '<button type="button" class="cs-btn" data-tone="quiet" data-shell="area-clear" data-areas="' + esc(id) + '">' + w("shell.areas.clear") + "</button>" : "") + "</span></div>";
      },
      checks(id, legendKey, options, o = {}) {
        return '<fieldset class="cs-field" id="' + esc(id) + '"><legend>' + w(legendKey) + "</legend>" + options.map(([v, k, on], i) =>
          '<label><input type="' + (o.radio ? "radio" : "checkbox") + '" name="' + esc(id) + '" id="' + esc(id) + "-" + i + '" value="' + esc(v) + '"' + (on ? " checked" : "") + "> " + w(k) + "</label>").join("") + "</fieldset>";
      },
      /* R27 (N985): R18's control, drawn by the kit, so no screen draws the shell's own buttons */
      appearance() {
        return '<div class="cs-actrow" role="group" aria-label="' + w("shell.appearance") + '">' + ["device", "light", "dark"].map((t) =>
          '<button type="button" class="cs-btn" data-tone="quiet" aria-pressed="' + (THEME === t) + '" data-shell="theme" data-theme-to="' + t + '">' + w("shell.appearance." + t) + "</button>").join("") + "</div>";
      },
      /* R19: rows, each row's acts in a panel beneath it; picks bring the hold strip. R27: the row's name (`name(item)`,
         its HTML, a reference where the item has a screen) is drawn with the panel's control beside it, never around
         it. With `cells(item)` one short of `cols`, the name is the first column; with as many, `cells(item)[0]` is. */
      rows(t) {
        const id = t.id || "rows";
        const open = inst.ui["open:" + id] || (inst.ui["open:" + id] = []);
        const picked = inst.ui["pick:" + id] || (inst.ui["pick:" + id] = []);
        const sort = inst.ui["sort:" + id] || null;
        let items = (t.items || []).slice();
        if (sort && typeof t.sortKey === "function") {
          items.sort((a, b) => { const x = t.sortKey(a, sort.col), y = t.sortKey(b, sort.col); return (x < y ? -1 : x > y ? 1 : 0) * (sort.dir === "desc" ? -1 : 1); });
        }
        const cols = t.cols || [];
        const head = "<thead><tr>" + (t.pick ? '<th class="cs-pickc"></th>' : "") + cols.map((c, i) => {
          const s = sort && sort.col === i ? (sort.dir === "desc" ? "descending" : "ascending") : "none";
          return '<th aria-sort="' + s + '">' + (typeof t.sortKey === "function"
            ? '<button type="button" class="cs-btn" data-tone="quiet" data-shell="sort" data-table="' + esc(id) + '" data-col="' + i + '" aria-label="' + w("shell.sort", { column: html(w(c)) }) + '"' + tipAttr(w("shell.sort.holds"), 2) + ">" + w(c) + "</button>" : w(c)) + "</th>";
        }).join("") + "</tr></thead>";
        const body = items.map((it) => {
          const key = String(t.key(it));
          let cells = t.cells(it);
          const nameHtml = t.name ? String(t.name(it)) : null;
          if (nameHtml !== null && cells.length === cols.length - 1) cells = [nameHtml].concat(cells);
          const name = nameHtml !== null ? textOf(nameHtml) : textOf(cells[0]) || key;
          const isOpen = open.includes(key);
          const acts = t.acts ? t.acts(it) : "";
          const control = acts ? '<button type="button" class="cs-btn" data-tone="quiet" data-shell="row" data-table="' + esc(id) + '" data-id="' + esc(key) + '" aria-expanded="' + isOpen
            + '" aria-label="' + w("shell.row.open", { name }) + '"' + tipAttr(w("shell.row.open.holds"), 2) + ">" + w("shell.row.acts") + "</button>" : "";
          return '<tr class="cs-r">' + (t.pick ? '<td><input type="checkbox" id="pick-' + esc(id) + "-" + esc(key) + '" data-shell="pick" data-table="' + esc(id) + '" data-id="' + esc(key) + '"'
              + (picked.includes(key) ? " checked" : "") + ' aria-label="' + w("shell.pick", { name }) + '"></td>' : "")
            + cells.map((c, i) => i === 0
              ? '<td data-label="' + w(cols[0] || "state.empty") + '"><span class="cs-rowname">' + c + control + "</span></td>"
              : '<td data-label="' + w(cols[i] || "state.empty") + '">' + c + "</td>").join("") + "</tr>"
            + (acts ? '<tr class="cs-panel"' + (isOpen ? "" : " hidden") + '><td colspan="' + (cols.length + (t.pick ? 1 : 0)) + '"><div class="cs-actrow">' + acts + "</div></td></tr>" : "");
        }).join("");
        const keep = picked.filter((k) => items.some((it) => String(t.key(it)) === k));
        inst.ui["pick:" + id] = keep;
        const hold = t.pick && keep.length
          ? '<div class="cs-hold" role="region" aria-label="' + w("shell.picked", { n: String(keep.length) }) + '"><span class="n">' + w("shell.picked", { n: String(keep.length) }) + '</span><span class="acts">'
            + (t.hold ? (inst.holding = id, (() => { try { return t.hold(keep); } finally { inst.holding = null; } })()) : "") + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="unpick" data-table="' + esc(id) + '">' + w("shell.unpick") + "</button></span></div>"
          : "";
        return '<table class="cs-rows">' + head + "<tbody>" + body + "</tbody></table>" + hold;
      },
      /* R44 (DEC-214 (2)): the at-a-glance elements, each drawn once, as the visual language draws them */
      reading(o = {}) {
        return '<div class="cs-tile"><span class="k">' + wordOrData(o.label) + '</span><b class="v">' + esc(o.value) + "</b>"
          + (o.change ? '<span class="d">' + wordOrData(o.change) + "</span>" : "") + (Array.isArray(o.bars) ? spark(o.bars, null) : "") + "</div>";
      },
      activity: (weeks, word) => spark(weeks, word || null),
      initials(names) {
        const list = (names || []).map((n) => String(n));
        return '<span class="cs-people" role="img" aria-label="' + w("shell.glance.people", { n: String(list.length), names: list.join(", ") }) + '">'
          + list.slice(0, 4).map((n) => "<i>" + esc(n.slice(0, 1).toUpperCase()) + "</i>").join("")
          + (list.length > 4 ? '<i class="more">' + w("shell.glance.more", { n: String(list.length - 4) }) + "</i>" : "") + "<span>" + esc(list.length) + "</span></span>";
      },
      path(steps) {
        return '<ol class="cs-next">' + (steps || []).map((s) => "<li" + (s.now ? ' aria-current="step"' : "") + "><span>" + wordOrData(s.text) + "</span>" + (s.act || "") + "</li>").join("") + "</ol>";
      },
      storyline(events, o = {}) {
        const dated = (events || []).filter((e) => e && e.date && date(e.date));
        const ev = (e) => {
          const t = "<b>" + date(e.date) + "</b>" + wordOrData(e.text);
          return '<div class="ev ' + (e.us ? "us" : "them") + '" role="listitem"><span class="t">' + (e.us ? "" : t) + '</span><i></i><span class="t">' + (e.us ? t : "") + "</span></div>";
        };
        return '<div class="cs-tl" role="list">' + dated.map(ev).join("") + "</div>"
          + (o.open ? '<a class="cs-btn" data-tone="quiet" href="' + esc(hrefOf(o.open.screen, o.open.subject)) + '" data-nav>' + w("shell.glance.timeline") + "</a>" : "");
      },
      strip(readings) {
        const four = (readings || []).slice(0, 4);
        if (phone()) {
          const n = four.reduce((a, r) => a + (Number(r.n) || 0), 0);
          return '<div class="cs-strip" role="region" aria-label="' + w("shell.glance.strip") + '"><a class="cs-ref" href="' + esc(placeHref("queue")) + '" data-nav><b>' + esc(n) + "</b> "
            + w("shell.glance.strip.sum", { n: "" }).trim() + "</a></div>";
        }
        return '<div class="cs-strip" role="region" aria-label="' + w("shell.glance.strip") + '">' + four.map((r) =>
          '<a class="cs-ref" href="' + esc(hrefOf(r.screen || "queue", r.subject)) + '" data-nav><b>' + esc(r.n) + "</b> " + wordOrData(r.label) + "</a>").join("") + "</div>";
      },
    };
    /* R46 (screens-entry R2, R6, R7): the session handed over by a screen, and its end */
    cs.signin = (answer, o = {}) => signedIn(answer, o);
    cs.signedOut = () => signedOut();
    /* R46, R47: controls the shell binds: R4's sign-out, a file made in the page, the clipboard */
    const bound = (kind, o, extra) => {
      const i = inst.binds.push(Object.assign({ kind }, extra)) - 1;
      const key = o && o.label ? o.label : { signout: "shell.signout", save: "shell.save", copy: "shell.copy" }[kind];
      return '<button type="button" class="cs-btn" data-tone="quiet" data-shell="bind" data-bi="' + inst.key + ":" + i + '">' + (kind === "save" ? I("add") : "") + w(key, o && o.fills) + "</button>";
    };
    cs.signout = (o = {}) => bound("signout", o, {});
    cs.save = (name, content, o = {}) => bound("save", o, { name: String(name || ""), text: String(content == null ? "" : content) });
    cs.copy = (content, o = {}) => bound("copy", o, { text: String(content == null ? "" : content) });
    /* R34: the password asked again, for a screen that sends its act by `cs.call` */
    cs.reauth = () => reauthAsk();
    /* R31, K3143: the dock's wizard guide started, and the ring */
    cs.wizard = (script, version, o = {}) => startWizard(script, version, o);
    cs.ring = (op, label) => ring(op, label);
    /* R40–R42, R47: the signer */
    cs.signer = SIGNER;
    return cs;
  }
  /* whether `a` comes before `b` in the document's order */
  function precedes(a, b) {
    if (typeof a.compareDocumentPosition === "function") return !!(a.compareDocumentPosition(b) & 4);
    const order = [];
    const walk = (n) => { for (const c of n.children || []) { order.push(c); walk(c); } };
    walk(doc.getElementById("cs-root"));
    return order.indexOf(a) < order.indexOf(b);
  }
  /* R44: eight weeks of bars in the stage hue, the newest darker, with the word they say */
  function spark(vals, word) {
    const v = (vals || []).map((x) => Math.max(0, Number(x) || 0));
    const m = Math.max(1, ...v);
    const said = word ? w(word) : "";
    return '<span class="cs-spark" role="img" aria-label="' + w("shell.glance.weeks", { word: html(said), weeks: v.join(", ") }) + '">'
      + v.map((x, i) => '<i style="height:' + Math.max(2, Math.round(18 * x / m)) + 'px"' + (i === v.length - 1 ? ' class="now"' : "") + "></i>").join("")
      + (said ? "<b>" + said + "</b>" : "") + "</span>";
  }
  async function loadImage(inst, im, op, params) {
    const a = await call(op, { query: params || {}, bytes: true, public: inst.pub });
    const r = a.kind === "response" ? a.r : null;
    const type = r && r.headers && r.headers.get ? String(r.headers.get("content-type") || "") : "";
    if (!r || !r.ok || /json/i.test(type)) { im.state = "failed"; if (live(inst)) draw(); return; }
    const blob = await r.blob();
    if (!live(inst)) return;
    im.url = win.URL.createObjectURL(blob);
    im.state = "ok";
    draw();
  }
  /* R49: the areas control's own handling: the image's natural size learned once drawn, a rectangle drawn by the
     pointer, and each moved (arrows), resized (Shift and arrows) or removed (Delete) from the keyboard */
  function areasOf(id) { return MAIN && Object.hasOwn(MAIN.areas, id) ? MAIN : DOCKI && Object.hasOwn(DOCKI.areas, id) ? DOCKI : null; }
  function areasSize(inst, id) {
    const box = doc.getElementById("cs-root").querySelector('[data-shell="areas-box"][data-areas="' + id.replace(/"/g, "") + '"]');
    const img = box ? box.querySelector("img") : null;
    const w0 = img ? Number(img.naturalWidth) : 0, h0 = img ? Number(img.naturalHeight) : 0;
    if (w0 > 0 && h0 > 0) inst.ui["areas-size:" + id] = { w: w0, h: h0 };
    const nat = inst.ui["areas-size:" + id] || null;
    const rect = box && box.getBoundingClientRect ? box.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    return { nat, rect, sx: nat && rect.width ? nat.w / rect.width : 1, sy: nat && rect.height ? nat.h / rect.height : 1 };
  }
  const clampArea = (r, nat) => {
    const W = nat ? nat.w : Infinity, H = nat ? nat.h : Infinity;
    r.width = Math.max(1, Math.min(r.width, W)); r.height = Math.max(1, Math.min(r.height, H));
    r.left = Math.max(0, Math.min(r.left, W - r.width)); r.top = Math.max(0, Math.min(r.top, H - r.height));
    return r;
  };
  function saveFile(blob, name) {
    const url = win.URL.createObjectURL(blob);
    const link = doc.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", name || "");
    doc.body.appendChild(link);
    link.click();
    doc.body.removeChild(link);
    win.URL.revokeObjectURL(url);
  }

  /* ---------- routes (R9, R32, R36) and paths (R8) ---------- */
  function hrefOf(screen, subject) {
    if (screen === "home") return "/app";
    const at = Object.keys(D.addresses).find((k) => D.addresses[k] === screen);
    if (at) screen = at;
    return "/app/" + encodeURIComponent(screen) + (subject !== undefined && subject !== null && subject !== "" ? "/" + encodeURIComponent(subject) : "");
  }
  function parse(pathname) {
    const p = String(pathname || "");
    /* R32: `/` opens Home with a live record and `front` without one */
    if (!/^\/app(\/|$)/.test(p)) return { screen: S ? "home" : "front", subject: null, root: true };
    const rest = p.replace(/^\/app\/?/, "");
    const [s, ...sub] = rest.split("/").filter((x) => x !== "");
    let subject = sub.length ? sub.join("/") : null;
    try { subject = subject === null ? null : decodeURIComponent(subject); } catch { /* kept as written */ }
    const screen = s ? (Object.hasOwn(D.addresses, s) ? D.addresses[s] : s) : "home";
    return { screen, subject, root: false };
  }
  const placeOf = (id) => (D.paths[id] && D.places.includes(D.paths[id][0]) ? D.paths[id][0] : ["settings", "people", "more", "projects"].includes(id) ? id : null);
  /* R7, R37: a place opens the first of its screens registered, else the shell's own page for it */
  function placeHref(k) {
    const target = (D.placeScreens[k] || []).find(screenOf);
    return target === "home" ? "/app" : target ? hrefOf(target) : "/app/" + k;
  }
  function pathNav(route, inst) {
    const steps = [];
    const p = D.paths[route.screen] || (inst && inst.unavail ? D.paths.unavailable : null);
    if (p) {
      let proj = null;
      try { proj = inst && inst.spec.place ? (inst.spec.place(inst.view) || {}).project : null; } catch { proj = null; }
      p.forEach((step, i) => {
        if (step === "@project") { if (proj && proj.title) steps.push({ label: esc(proj.title), href: route.screen === "project" ? null : hrefOf("project", proj.id) }); }
        else if (i === 0 && D.places.includes(step)) steps.push({ label: w("rail." + step + ".name"), href: placeHref(step) });
        else steps.push({ label: w(step) });
      });
      if (route.screen === "project" && !(proj && proj.title)) steps.push({ label: w("screen.project.name") });
    } else if (D.places.includes(route.screen)) steps.push({ label: w(route.screen === "more" ? "shell.more" : "rail." + route.screen + ".name") });
    else steps.push({ label: inst && has("screen." + route.screen + ".name") ? w("screen." + route.screen + ".name") : w("screen.unavailable.name") });
    if (steps.length) steps[steps.length - 1].href = null;
    return '<nav class="cs-crumbs" aria-label="' + w("shell.path") + '"><ol>' + steps.map((s, i) => "<li>" + (i === steps.length - 1
      ? '<span aria-current="page">' + s.label + "</span>"
      : '<a href="' + esc(s.href) + '" data-nav>' + s.label + "</a>") + "</li>").join("") + "</ol></nav>";
  }

  /* ---------- drawing ---------- */
  /* R35 (DEC-201 (8)): unavailable, in its three states */
  function unavailableHtml(kind) {
    const key = kind === "notyours" ? "shell.unavailable.notyours" : kind === "unreachable" ? "shell.unavailable.unreachable" : "shell.unavailable.nothing";
    return '<h1 class="t-title" tabindex="0"' + tipAttr(kw("screen.unavailable.purpose"), 2) + ">" + w("screen.unavailable.name") + "</h1>"
      + '<p class="cs-state" data-state="' + (kind === "unreachable" ? "failed" : "empty") + '" data-unavailable="' + esc(kind) + '"' + (kind === "unreachable" ? ' role="alert"' : "") + ">" + w(key) + "</p>"
      + (kind === "unreachable" ? "" : '<p><a class="cs-btn" data-tone="quiet" href="/app" data-nav>' + w("shell.unavailable.home") + "</a></p>");
  }
  const shellPage = (route) => {
    const k = route.screen;
    const titled = (key) => '<h1 class="t-title">' + w(key) + "</h1>";
    if (k === "settings") {
      /* R37: until `settings` is registered, the settings screens registered, and no link to `/` */
      const links = D.settingsScreens.filter(screenOf).map((s) =>
        '<li><a href="' + hrefOf(s) + '" data-nav' + tipAttr(kw("screen." + s + ".purpose"), 2) + ">" + w("screen." + s + ".name") + "</a></li>").join("");
      return titled("shell.settings.title") + '<ul class="cs-list">' + links + "</ul>";
    }
    if (k === "more") {
      return titled("shell.more") + '<ul class="cs-list">' + ["projects", "people", "settings"].map((p) =>
        '<li><a href="' + placeHref(p) + '" data-nav' + tipAttr(w("rail." + p + ".holds"), 2) + ">" + w("rail." + p + ".name") + "</a></li>").join("") + "</ul>";
    }
    return titled("rail." + k + ".name") + '<p class="cs-state" data-state="empty">' + w("shell.later", { place: html(w("rail." + k + ".name")) }) + "</p>";
  };
  function renderOf(inst) {
    if (inst.key !== "g") { inst.acts = []; inst.binds = []; }
    try { return inst.spec.render(kit(inst), inst.view); } catch { return inst.key === "g" ? "" : '<p class="cs-state" data-state="failed" role="alert">' + w("state.failed", { reason: html(w("shell.noanswer")) }) + "</p>"; }
  }
  /* K3143: the guide's marks, under the path of every working screen, on each draw */
  function marksHtml() {
    if (!GUIDEI || typeof GUIDE.marks !== "function") return "";
    try { return String(GUIDE.marks(kit(GUIDEI), GUIDEI.view) || ""); } catch { return ""; }
  }
  function mainHtml(route) {
    if (UNREACHED) return unavailableHtml("unreachable");
    if (!MAIN && !ENTRY_PAGE && !ME) return '<p class="cs-state" data-state="loading" role="status"><span class="bar" aria-hidden="true"></span>' + w("state.loading") + "</p>";
    if (ENTRY_PAGE) return entryPage();
    if (!MAIN) {
      if (D.places.includes(route.screen)) return pathNav(route, null) + marksHtml() + shellPage(route);
      return pathNav(route, null) + unavailableHtml("nothing");
    }
    if (MAIN.unavail) return pathNav(route, MAIN) + unavailableHtml(MAIN.unavail);
    const body = renderOf(MAIN);
    return (frameOf(MAIN.spec.id) === "working" ? pathNav(route, MAIN) + marksHtml() : "") + body;
  }
  /* R32: with no `front` registered, the state the session ended in, drawn by the shell */
  let ENTRY_PAGE = false;
  const entryPage = () => '<h1 class="t-title">' + w("screen.unavailable.name") + "</h1>"
    + (ENTRY.state ? '<p class="cs-state" data-state="empty">' + w("session." + ENTRY.state) + "</p>" : '<p class="cs-state" data-state="empty">' + w("shell.unavailable.notyours") + "</p>");
  function dockHtml() {
    /* R31, K3143: one panel at a time: the guide's while it draws one (a wizard runs), else the assistant's */
    const guideBody = GUIDEI ? renderOf(GUIDEI) : "";
    const guide = !!guideBody;
    const inst = guide ? GUIDEI : REACHABLE && DOCK && DOCKI ? DOCKI : null;
    if (!inst) return "";
    const body = guide ? guideBody : renderOf(inst);
    const name = guide ? "shell.guide" : "shell.assistant";
    return '<aside class="cs-dock" aria-label="' + w(name) + '" data-panel="' + (guide ? "guide" : "assistant") + '"><header>' + I(guide ? "wizard" : "machine") + w(name) + '<span class="spacer"></span>'
      + (guide ? "" : '<button type="button" class="cs-btn" data-tone="quiet" data-shell="dock" aria-label="' + w("shell.assistant.close") + '">' + I("close") + "</button>") + "</header>"
      + '<div class="body">' + body + "</div></aside>";
  }
  function mastHtml() {
    const name = GROUP ? esc(GROUP) : "";
    const level = w(LEVEL === "pause" ? "level.pause.name" : "level.prompt.name");
    const initial = ME && ME.handle ? esc(String(ME.handle).slice(0, 1).toUpperCase()) : "";
    const signout = can("signout") ? '<button type="button" class="cs-btn" data-tone="quiet" data-shell="signout" role="menuitem"' + tipAttr(w("shell.signout.does"), 2) + ">" + w("shell.signout") + "</button>" : "";
    const themes = ["device", "light", "dark"].map((t) => '<button type="button" class="cs-btn" data-tone="quiet" role="menuitemradio" aria-checked="' + (THEME === t) + '" data-shell="theme" data-theme-to="' + t + '">' + w("shell.appearance." + t) + "</button>").join("");
    /* R43 (DEC-214 (1)): the mark opens the masthead, before the group's name */
    const mark = '<span class="cs-mark" role="img" aria-label="' + w("shell.mark") + '" tabindex="0"' + tipAttr("<b>" + w("shell.mark") + "</b>: " + w("shell.mark.means"), 1)
      + '><svg viewBox="0 0 60 90" aria-hidden="true"><use href="' + D.icons + '#i-mark"/></svg></span>';
    return '<header class="cs-mast">' + mark + (name ? '<a class="grp" href="/app" data-nav>' + name + "</a>" : "") + '<span class="spacer"></span>'
      + '<a class="cs-btn" data-tone="quiet" href="' + placeHref("find") + '" data-nav' + tipAttr(w("shell.search.holds"), 2) + ">" + I("search") + w("shell.search") + "</a>"
      + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="level"' + tipAttr(w("shell.level.holds"), 2) + ">" + I("question") + w("shell.level", { level: html(level) }) + "</button>"
      + (REACHABLE ? '<button type="button" class="cs-btn" data-tone="quiet" data-shell="dock" aria-expanded="' + DOCK + '"' + tipAttr(w("shell.assistant.holds"), 2) + ">" + I("machine") + w("shell.assistant") + "</button>" : "")
      + (TODO !== null ? '<a class="cs-kind" data-kind="todo" href="' + placeHref("queue") + '" data-nav' + tipAttr(w("shell.todo.means"), 1) + ">" + I("queue") + w("shell.todo", { n: String(TODO) }) + "</a>" : "")
      + '<span class="cs-menuwrap"><button type="button" class="cs-btn" data-shell="menu" aria-haspopup="menu" aria-expanded="' + !!MENU + '" aria-controls="cs-menu"'
      + tipAttr(w("shell.you.holds"), 2) + '><span aria-hidden="true">' + initial + '</span><span class="sr">' + w("shell.you", { handle: ME ? ME.handle || "" : "" }) + "</span></button>"
      + '<div class="cs-dialog cs-menu" id="cs-menu" role="menu"' + (MENU ? "" : " hidden") + ">" + signout
      + '<div role="group" aria-label="' + w("shell.appearance") + '"><span class="eyebrow">' + w("shell.appearance") + "</span>" + themes + "</div></div></span></header>";
  }
  /* R48: the main frame's root names the registered screen it drew; the shell's own fallbacks name none */
  const screenAttr = () => (MAIN && !MAIN.unavail && !UNREACHED && !ENTRY_PAGE ? ' data-screen="' + esc(MAIN.spec.id) + '"' : "");
  /* R36: the test-instance band, on every frame, while `bootstrap` answers `test_instance: true` */
  const bandHtml = () => (BOOT && BOOT.test_instance === true ? '<div class="cs-testband" role="note">' + w("instance.test.notice") + "</div>" : "");
  const RAIL = ["home", "queue", "find", "add", "projects", "people", "settings"];
  const TABS = ["home", "queue", "add", "find", "more"];
  const RAIL_ICON = { home: "home", queue: "queue", find: "search", add: "add", projects: "project", people: "subject", settings: "settings", more: "settings" };
  function frameHtml(route) {
    if (GUIDEI) { GUIDEI.acts = []; GUIDEI.binds = []; }
    const shown = MAIN ? MAIN.spec.id : route.screen;
    const frame = ENTRY_PAGE ? "public" : MAIN ? frameOf(shown) : "working";
    if (frame !== "working") {
      /* R30, R45: the public, published and setup frames: no rail, tabs, dock or member menu */
      return '<div class="cs-frame" data-frame="' + esc(frame) + '" id="cs-frame">' + bandHtml() + '<main class="cs-main" id="cs-main"' + screenAttr() + ">" + mainHtml(route) + "</main></div>";
    }
    const place = placeOf(route.screen);
    const rail = RAIL.map((k) => '<a href="' + placeHref(k) + '" data-nav' + (place === k ? ' aria-current="page"' : "") + tipAttr(w("rail." + k + ".holds"), RAILW < 120 ? 1 : 2) + ">"
      + I(RAIL_ICON[k]) + w("rail." + k + ".name") + "</a>").join("")
      + '<button type="button" class="cs-grip" data-shell="grip" role="separator" aria-orientation="vertical" aria-label="' + w("shell.width") + '" aria-valuemin="64" aria-valuemax="320" aria-valuenow="' + RAILW + '"' + tipAttr(w("shell.width.holds"), 2) + "></button>";
    const tabs = TABS.map((k) => '<a href="' + (k === "more" ? "/app/more" : placeHref(k)) + '" data-nav'
      + ((place === k || (k === "more" && ["projects", "people", "settings", "more"].includes(place))) ? ' aria-current="page"' : "")
      + tipAttr(k === "more" ? w("tab.more.holds") : w("rail." + k + ".holds"), 2) + ">" + I(RAIL_ICON[k]) + w(k === "more" ? "tab.more.name" : "rail." + k + ".name") + "</a>").join("");
    const main = mainHtml(route);
    const dock = dockHtml();
    const band = '<div class="cs-band" data-band="working"><span tabindex="0"' + tipAttr(w("mark.band.means") + '<span class="why">' + w("mark.path.working.means") + "</span>", 1) + "><b>" + w("mark.path.working.name") + "</b></span></div>";
    const ask = ASK_LEVEL ? '<div class="cs-reason" role="region"><p>' + w("shell.level.ask", { level: html(w(LEVEL === "pause" ? "level.pause.name" : "level.prompt.name")) }) + "</p><div>"
      + '<button type="button" class="cs-btn" data-shell="level-keep">' + w("shell.level.keep") + "</button>"
      + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="level-switch">' + w("shell.level.switch", { level: html(w(LEVEL === "pause" ? "level.prompt.name" : "level.pause.name")) }) + "</button></div></div>" : "";
    return '<div class="cs-frame cs-shell' + (dock ? " with-dock" : "") + (RAILW < 120 ? " rail-icons" : "") + '" data-frame="working" id="cs-frame" style="--rail:' + RAILW + 'px">'
      + bandHtml() + mastHtml() + band + '<nav class="cs-rail" aria-label="' + w("shell.sections") + '">' + rail + "</nav>"
      + '<main class="cs-main" id="cs-main"' + screenAttr() + ">" + ask + main + "</main>" + dock
      + '<nav class="cs-tabs" aria-label="' + w("shell.sections") + '">' + tabs + "</nav></div>";
  }
  /* R33, R34: the lock over the screen, and the password asked again; R41: what the key signs, exactly */
  let REAUTH = null, DIALOG = null, OVERLAY_REFUSAL = "";
  function overlayHtml() {
    const field = (id) => '<span class="cs-field"><label for="' + id + '">' + w("shell.password") + '</label><input id="' + id + '" class="cs-input" type="password" autocomplete="current-password"></span>';
    const slot = '<span class="cs-slot" data-overlay-refusal>' + OVERLAY_REFUSAL + "</span>";
    if (LOCKED) {
      const who = S ? S.w || (ME && ME.handle) || "" : "";
      return '<div class="cs-overlay"><div class="cs-dialog" role="dialog" aria-modal="true" aria-labelledby="cs-lock-t" data-overlay="lock"><h2 id="cs-lock-t">' + w("shell.lock.title") + "</h2><p>" + w("session.locked") + "</p>"
        + field("cs-lock-pw") + slot + '<span class="cs-actrow"><button type="button" class="cs-btn" data-tone="primary" data-shell="unlock">' + w("shell.lock.unlock") + "</button>"
        + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="lock-other">' + w("shell.lock.other", { handle: who }) + "</button></span></div></div>";
    }
    if (REAUTH) {
      return '<div class="cs-overlay"><div class="cs-dialog" role="dialog" aria-modal="true" aria-labelledby="cs-reauth-t" data-overlay="reauth"><h2 id="cs-reauth-t">' + w("shell.reauth.title") + "</h2><p>" + w("session.reauth") + "</p>"
        + field("cs-reauth-pw") + slot + '<span class="cs-actrow"><button type="button" class="cs-btn" data-tone="primary" data-shell="reauth">' + w("shell.reauth.send") + "</button>"
        + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="reauth-cancel">' + w("shell.cancel") + "</button></span></div></div>";
    }
    if (DIALOG && DIALOG.kind === "register") {
      return '<div class="cs-overlay"><div class="cs-dialog" role="dialog" aria-modal="true" aria-labelledby="cs-key-t" data-overlay="register"><h2 id="cs-key-t">' + w("shell.signer.passphrase") + "</h2>"
        + '<span class="cs-field"><label for="cs-key-pass">' + w("shell.signer.passphrase") + '</label><span class="help" id="cs-key-pass-help">' + w("shell.signer.passphrase.help")
        + '</span><input id="cs-key-pass" class="cs-input" type="password" autocomplete="new-password" aria-describedby="cs-key-pass-help"></span>'
        + '<span class="cs-field"><label for="cs-key-again">' + w("shell.signer.passphrase.again") + '</label><input id="cs-key-again" class="cs-input" type="password" autocomplete="new-password"></span>'
        + slot + '<span class="cs-actrow"><button type="button" class="cs-btn" data-tone="primary" data-shell="dialog-yes">' + w("shell.signer.makefile") + "</button>"
        + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="dialog-no">' + w("shell.cancel") + "</button></span></div></div>";
    }
    if (DIALOG && DIALOG.kind === "sign") {
      const load = DIALOG.needKey ? '<fieldset class="cs-field"><legend>' + w("shell.signer.load") + '</legend><span class="cs-field"><label for="cs-key-file">' + w("shell.signer.loadfile")
        + '</label><textarea id="cs-key-file" class="cs-input" spellcheck="false" autocomplete="off"></textarea></span><span class="cs-field"><label for="cs-key-filepass">' + w("shell.signer.loadpass")
        + '</label><input id="cs-key-filepass" class="cs-input" type="password" autocomplete="off"></span></fieldset>' : "";
      return '<div class="cs-overlay"><div class="cs-dialog" role="dialog" aria-modal="true" aria-labelledby="cs-sign-t" data-overlay="sign"><h2 id="cs-sign-t">' + w("shell.signer.exactly") + "</h2><ol>"
        + DIALOG.list.map((s) => "<li><b>" + esc(s.label) + "</b><pre>" + esc(s.line) + "</pre></li>").join("") + "</ol>" + load + "<p>" + w("signing.ceremony.device") + "</p>"
        + slot + '<span class="cs-actrow"><button type="button" class="cs-btn" data-tone="primary" data-shell="dialog-yes">' + w("shell.signer.sign") + "</button>"
        + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="dialog-no">' + w("shell.signer.decline") + "</button></span></div></div>";
    }
    return "";
  }
  /* R15 (DEC-177 (1)): no explaining element inside another: an explaining element absorbs those inside it, said after
     its own, so whatever a screen draws, one element carries one explanation. */
  function absorb(root) {
    for (const el of root.querySelectorAll("[data-tip]")) {
      const outer = el.parentElement ? el.parentElement.closest("[data-tip]") : null;
      if (!outer) continue;
      outer.setAttribute("data-tip", outer.getAttribute("data-tip") + '<span class="why">' + el.getAttribute("data-tip") + "</span>");
      el.removeAttribute("data-tip");
      el.removeAttribute("data-level");
    }
  }
  let MENU = false;
  const focusKey = (el) => (!el || !el.getAttribute ? null : el.id ? "#" + el.id
    : ["data-shell", "data-ai", "data-table", "data-id", "data-col", "data-theme-to", "data-areas", "data-i"].map((a) => (el.getAttribute(a) !== null ? "[" + a + '="' + el.getAttribute(a) + '"]' : "")).join("") || null);
  function draw() {
    const root = doc.getElementById("cs-root");
    if (!root || !ROUTE) return;
    closeTip();
    const values = {};
    for (const el of root.querySelectorAll("input, textarea, select")) if (el.id && el.type !== "file") values[el.id] = el.type === "checkbox" || el.type === "radio" ? { checked: el.checked } : { value: el.value };
    /* R35: what was typed is kept while the screen cannot be reached, and comes back with it */
    if (MAIN && MAIN.unavail === "unreachable" && Object.keys(values).length) MAIN.stash = Object.assign({}, MAIN.stash || {}, values);
    const fk = focusKey(doc.activeElement);
    root.innerHTML = frameHtml(ROUTE) + overlayHtml();
    absorb(root);
    const restore = (id, v) => {
      const el = doc.getElementById(id);
      if (!el || el.getAttribute("data-shell") === "pick") return;
      if ("checked" in v) el.checked = v.checked; else el.value = v.value;
    };
    for (const [id, v] of Object.entries(values)) restore(id, v);
    for (const inst of [MAIN, DOCKI, GUIDEI]) {
      if (!inst) continue;
      if (inst.pending) { for (const [id, v] of Object.entries(inst.pending)) restore(id, v); inst.pending = null; }
      /* R27: a field filled before it was drawn takes its value once it is */
      for (const [id, v] of Object.entries(inst.fills)) { const el = doc.getElementById(id); if (el) { if (el.type === "checkbox" || el.type === "radio") el.checked = !!v; else el.value = String(v == null ? "" : v); delete inst.fills[id]; } }
      /* K3143: a filled draft's label beside its field */
      for (const [id, l] of Object.entries(inst.labels)) {
        const el = doc.getElementById(id);
        if (!el || !el.parentElement) continue;
        const span = doc.createElement("span");
        span.setAttribute("class", "cs-draftlabel");
        span.innerHTML = I("machine") + wordOrData(l);
        el.parentElement.insertBefore(span, el.nextElementSibling);
      }
    }
    ringDraw(root);
    if (fk) { let el = null; try { el = root.querySelector(fk); } catch { el = null; } if (el && el.focus) el.focus(); }
    if (GROUP) doc.title = GROUP;
  }

  /* ---------- navigation ---------- */
  function navigate(href, replace) {
    if (replace) win.history.replaceState({}, "", href); else win.history.pushState({}, "", href);
    route();
  }
  /* R21 (K2998): a screen's `closed(cs, view)` when the member leaves it or the page; R27: its timers cancelled */
  function closing(inst) {
    if (!inst) return;
    for (const t of inst.timers) clearTimeout(t);
    inst.timers = [];
    if (inst.retry !== null) { clearTimeout(inst.retry); inst.retry = null; }
    /* R49: the images' object addresses released with the screen */
    for (const im of Object.values(inst.images)) if (im.url) { try { win.URL.revokeObjectURL(im.url); } catch { /* released */ } im.url = null; }
    if (typeof inst.spec.closed !== "function") return;
    try { inst.spec.closed(kit(inst), inst.view); } catch { /* a screen's own leave-taking never stops the shell */ }
  }
  let ROUTING = 0;
  async function route() {
    const n = ++ROUTING;
    closing(MAIN);
    closing(DOCKI);
    MAIN = null; DOCKI = null; ENTRY_PAGE = false; RING = null;
    ROUTE = parse(win.location.pathname);
    MENU = false;
    let id = ROUTE.screen;
    /* R30: a screen of the public or published frame, drawn without a session, asking no record */
    if (sessionless(id) && !ROUTE.root) return show(id);
    if (!S && !RECORD_READ) {
      RECORD_READ = true;
      S = readRecord();
      if (S && ROUTE.root) { win.history.replaceState({}, "", "/app"); ROUTE = parse(win.location.pathname); id = ROUTE.screen; }
    }
    if (sessionless(id)) return show(id);
    if (!S) {
      /* R45: a screen of the setup frame asks no session before one exists */
      if (frameOf(id) === "setup") return show(id);
      /* R32: no live record: `front`, keeping the path to return to */
      keepReturn();
      return showFront();
    }
    const signedAlready = !!ME;
    if (!ME) {
      draw();
      const got = await whoami();
      if (n !== ROUTING) return;
      /* R45: a screen of the setup frame stays, whatever the record turns out to hold */
      if (frameOf(id) === "setup" && got !== "ok") { UNREACHED = false; LOCKED = false; return show(id); }
      if (got === "unreachable") return draw();
      if (got === "locked") {
        /* R32, R33: a page opened on a locked session draws `front` locked (the shell's own lock without `front`) */
        keepReturn();
        if (screenOf("front")) { ENTRY = { state: "locked", handle: S.w || null }; return showFront(); }
        return lock(false);
      }
      if (got === "none") { keepReturn(); ENTRY = { state: null, handle: null }; return showFront(); }
    }
    /* R5's Suggestions: a failed `interfacewords` read is tried once more, on the next screen change */
    if (signedAlready && !wordsRead && wordsRetry) { wordsRetry = false; loadWords(); }
    show(id);
  }
  function show(id, subject) {
    const spec = screenOf(id);
    MAIN = spec && spec.id !== "assistant" ? instance(spec, subject !== undefined ? subject : ROUTE.subject, "m") : null;
    DOCKI = !MAIN || frameOf(MAIN.spec.id) === "working" ? (REACHABLE && screenOf("assistant") ? instance(screenOf("assistant"), ROUTE.subject, "d", { screen: ROUTE.screen, subject: ROUTE.subject }) : null) : null;
    draw();
    const n = ROUTING;
    const reads = MAIN && (MAIN.pub || ME) ? readAll(MAIN) : Promise.resolve();
    if (DOCKI && DOCK && ME) readAll(DOCKI);
    if (doc.getElementById("cs-main") && doc.getElementById("cs-main").scrollTo) doc.getElementById("cs-main").scrollTo(0, 0);
    /* K3143: the guide told the screen it is on, once the screen's reads have settled */
    reads.then(() => { if (n === ROUTING && ROUTE) guideCall("entered", { screen: ROUTE.screen, subject: ROUTE.subject }); });
  }
  function showFront() {
    if (screenOf("front")) return show("front", null);
    ENTRY_PAGE = true;
    draw();
    if (ROUTE) guideCall("entered", { screen: ROUTE.screen, subject: ROUTE.subject });
  }

  /* ---------- the session's start, hand-over and end (R3, R32, R33) ---------- */
  /* `whoami` for the record held: "ok", a member session; "locked", the plane's lock; "none", no member session (the
     record cleared); "unreachable", no answer or a 5xx (tried again every 30 seconds, R35) */
  async function whoami(background) {
    const who = await call("whoami", { background, noLock: true });
    if (!S) return "none";
    if (who.kind === "ok" && who.value && who.value.session && who.value.member) {
      UNREACHED = false;
      ME = who.value;
      await loadWords();
      wordsRetry = !wordsRead;
      armIdle();
      Promise.all([loadFrame(), loadReach()]);
      return "ok";
    }
    if (unreachable(who)) {
      UNREACHED = true;
      setTimeout(async () => { if (S && UNREACHED && (await whoami(true)) !== "unreachable") { UNREACHED = false; route(); } }, D.retry);
      return "unreachable";
    }
    if (who.kind === "refused" && who.code === "SESSION_LOCKED") return "locked";
    S = null; ME = null; clearRecord(null);
    return "none";
  }
  /* R32 (screens-entry R2, R6, R7): a screen hands over the session `login` answered: the record written for every tab,
     then the page kept to return to, else Home; `stay` keeps the screen (a setup or join that goes on) */
  async function signedIn(answer, o = {}) {
    const a = answer && typeof answer === "object" && answer.result && typeof answer.result === "object" ? answer.result : answer;
    if (!(a && typeof a.token === "string" && a.token)) return false;
    const e = typeof a.expires === "number" ? a.expires : Date.parse(a.expires) || 0;
    S = { t: a.token, e, d: o.device === "own" ? "own" : "shared", w: typeof o.handle === "string" ? o.handle : "" };
    writeRecord(S);
    ME = null; LOCKED = false; ENTRY = { state: null, handle: null };
    activity();
    if (o.stay) { const got = await whoami(); draw(); return got === "ok"; }
    win.history.replaceState({}, "", takeReturn());
    await route();
    return !!ME;
  }
  /* R46: a screen that sent `signout` (or `signouteverywhere`) itself: the record cleared, `front` signed out */
  function signedOut() {
    if (S) over("signedout");
    else { ENTRY = { state: "signedout", handle: null }; route(); }
  }
  /* R33, R46: `front`'s locked state unlocked by its own `unlock` act: back to the page kept, as it was */
  async function unlocked() {
    LOCKED = false; local.del(STATE_KEY); ENTRY = { state: null, handle: null };
    activity();
    ME = null;
    win.history.replaceState({}, "", takeReturn());
    await route();
  }
  /* R4: sign out, whatever the answer: the record cleared for every tab, `front` drawn signed out */
  async function signOut() {
    if (S) { try { await call("signout", { body: {} }); } catch { /* whatever the answer */ } }
    if (S) over("signedout");
    else { ENTRY = { state: "signedout", handle: null }; route(); }
  }
  /* R33 (K3061 D3): the member's own input and acts are activity; the page's clock locks an own device at 30 minutes
     idle and signs a shared one out at 15, the plane's answer governing over it */
  let LAST = Date.now(), SHARED_AT = 0, idleT = null;
  function activity() {
    LAST = Date.now();
    if (LAST - SHARED_AT >= 10000 || SHARED_AT > LAST) { SHARED_AT = LAST; local.set(ACTIVE_KEY, String(LAST)); }
  }
  const lastActive = () => Math.max(LAST, Number(local.get(ACTIVE_KEY)) || 0);
  function stopIdle() { if (idleT !== null) clearTimeout(idleT); idleT = null; }
  function armIdle() {
    stopIdle();
    if (!S || LOCKED) return;
    const limit = S.d === "own" ? D.idleLock : D.idleEnd;
    idleT = setTimeout(idleCheck, Math.max(0, lastActive() + limit - Date.now()));
  }
  async function idleCheck() {
    idleT = null;
    if (!S || LOCKED) return;
    const limit = S.d === "own" ? D.idleLock : D.idleEnd;
    if (Date.now() - lastActive() < limit) return armIdle();
    if (S.d === "own") return lock(false);
    try { await call("signout", { body: {}, background: true }); } catch { /* the page's clock ends it whatever the answer */ }
    over("ended");
  }
  function lock(elsewhere) {
    if (!S || LOCKED) return;
    LOCKED = true; OVERLAY_REFUSAL = ""; stopIdle();
    if (!elsewhere) local.set(STATE_KEY, "locked");
    closeTip();
    draw();
    const pw = doc.getElementById("cs-lock-pw");
    if (pw && pw.focus) pw.focus();
  }
  async function unlockNow() {
    const pw = doc.getElementById("cs-lock-pw");
    const password = pw ? String(pw.value || "") : "";
    if (!password) return;
    const a = await call("unlock", { body: { password } });
    const field = doc.getElementById("cs-lock-pw");
    if (field) field.value = "";
    if (a.kind === "ok") {
      LOCKED = false; OVERLAY_REFUSAL = ""; local.del(STATE_KEY);
      activity();
      if (!ME) return route();
      armIdle(); draw();
      return;
    }
    if (!S) return;
    OVERLAY_REFUSAL = refusalHtml(a.kind === "refused" ? refusalWords(a, null, false, null) : w("state.failed", { reason: html(w("shell.noanswer")) }));
    draw();
  }
  /* R34: the password asked again; answers whether `reauth` opened its window */
  function reauthAsk() {
    if (!S) return Promise.resolve(false);
    if (REAUTH) return REAUTH.promise;
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    REAUTH = { promise, resolve };
    OVERLAY_REFUSAL = "";
    draw();
    const pw = doc.getElementById("cs-reauth-pw");
    if (pw && pw.focus) pw.focus();
    return promise;
  }
  async function reauthNow(go) {
    const r = REAUTH;
    if (!r) return;
    if (!go) { REAUTH = null; OVERLAY_REFUSAL = ""; draw(); return r.resolve(false); }
    const pw = doc.getElementById("cs-reauth-pw");
    const password = pw ? String(pw.value || "") : "";
    if (!password) return;
    const a = await call("reauth", { body: { password } });
    const field = doc.getElementById("cs-reauth-pw");
    if (field) field.value = "";
    if (a.kind === "ok") { REAUTH = null; OVERLAY_REFUSAL = ""; draw(); return r.resolve(true); }
    if (!S || LOCKED) { REAUTH = null; return r.resolve(false); }
    OVERLAY_REFUSAL = refusalHtml(a.kind === "refused" ? refusalWords(a, null, false, null) : w("state.failed", { reason: html(w("shell.noanswer")) }));
    draw();
  }

  /* ---------- the dock's wizard guide and the ring (R31) ---------- */
  /* K3143: `cs.wizard(script, version, o)` hands the start to the guide; it draws itself in the dock while it runs */
  function startWizard(script, version, o) {
    if (!GUIDEI || typeof GUIDE.start !== "function") return false;
    try { GUIDE.start(kit(GUIDEI), GUIDEI.view, Object.assign({}, o || {}, { script, version: version === undefined ? null : version })); } catch { return false; }
    draw();
    return true;
  }
  function guideCall(name, arg) {
    if (!GUIDEI || typeof GUIDE[name] !== "function") return;
    try { GUIDE[name](kit(GUIDEI), GUIDEI.view, arg); } catch { /* the guide's own work never stops the shell */ }
  }
  /* `cs.ring(op, label)`: the control the current screen drew for `op` rung, its row panel opened, scrolled to and
     focused; answers whether there was one. The shell never presses it. */
  function ring(op, label) {
    if (!MAIN) return false;
    const main = () => doc.getElementById("cs-main");
    const find = () => (main() ? main().querySelector('[data-act="' + String(op).replace(/"/g, "") + '"]') : null);
    let el = find();
    if (!el) return false;
    const panel = el.closest ? el.closest("tr.cs-panel") : null;
    if (panel && panel.hidden) {
      const row = panel.previousElementSibling;
      const ctl = row ? row.querySelector('[data-shell="row"]') : null;
      if (ctl) {
        const table = ctl.getAttribute("data-table"), id = ctl.getAttribute("data-id");
        const open = MAIN.ui["open:" + table] || (MAIN.ui["open:" + table] = []);
        if (!open.includes(id)) open.push(id);
      }
    }
    RING = { op: String(op), label: typeof label === "string" && label ? label : null };
    draw();
    el = find();
    if (!el) return false;
    if (el.scrollIntoView) { try { el.scrollIntoView({ block: "center", behavior: "auto" }); } catch { /* best effort */ } }
    if (el.focus) el.focus();
    return true;
  }
  function ringDraw(root) {
    if (!RING || !MAIN) return;
    const main = root.querySelector("#cs-main");
    const el = main ? main.querySelector('[data-act="' + RING.op.replace(/"/g, "") + '"]') : null;
    if (!el) return;
    el.classList.add("cs-ring");
    const label = doc.createElement("span");
    label.setAttribute("class", "cs-ringlabel");
    label.setAttribute("id", "cs-ringlabel");
    label.innerHTML = w(RING.label || (el.tagName === "BUTTON" ? "shell.ring.ready" : "shell.ring.here"));
    if (el.parentElement) el.parentElement.insertBefore(label, el);
  }

  /* ---------- the signer (R40–R42; DEC-207, DEC-208, DEC-210; K3079 (a), K3080) ---------- */
  /* The member's Ed25519 key, made in this browser and never sent: kept, by the member's choice, as a non-extractable key
     in this origin's IndexedDB; otherwise given out once as a key file (`signatures` R43's `BIOKEY1.`, made here) and held
     in page memory for this sitting only. A key file already held is loaded for the sitting only. Signatures are
     SSHSIG (version 1, `ssh-ed25519`, `sha512`), the exact form `ssh-keygen -Y sign` makes. */
  const enc = new TextEncoder();
  const u8 = (...a) => { let n = 0; for (const p of a) n += p.length; const o = new Uint8Array(n); let i = 0; for (const p of a) { o.set(p, i); i += p.length; } return o; };
  const b64 = (bytes) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return win.btoa(s); };
  const unb64 = (s) => Uint8Array.from(win.atob(String(s).replace(/\s+/g, "")), (c) => c.charCodeAt(0));
  const u32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
  const sshStr = (v) => { const b = typeof v === "string" ? enc.encode(v) : v; return u8(u32(b.length), b); };
  const wirePub = (raw32) => u8(sshStr("ssh-ed25519"), sshStr(raw32));
  const LABEL = "bio-ratify";
  const PKCS8_HEAD = new Uint8Array([0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20]);
  const KDF_ITER = 600000;
  let SITTING = null;
  const subtle = () => win.crypto.subtle;
  const lineOf = (raw32, comment) => { const keyB64 = b64(wirePub(raw32)); return { line: "ssh-ed25519 " + keyB64 + " " + comment, keyB64, comment }; };
  function idb(mode, fn) {
    return new Promise((resolve) => {
      let req;
      try { req = win.indexedDB.open("civicsmith-signer", 1); } catch { return resolve(null); }
      req.onupgradeneeded = () => { try { req.result.createObjectStore("keys"); } catch { /* already made */ } };
      req.onerror = () => resolve(null);
      req.onsuccess = () => {
        try {
          const tx = req.result.transaction("keys", mode);
          const r = fn(tx.objectStore("keys"));
          r.onsuccess = () => resolve(r.result === undefined ? null : r.result);
          r.onerror = () => resolve(null);
        } catch { resolve(null); }
      };
    });
  }
  const kept = () => idb("readonly", (st) => st.get("own"));
  async function seedKeys(seed) {
    const pkcs8 = u8(PKCS8_HEAD, seed);
    const priv = await subtle().importKey("pkcs8", pkcs8, { name: "Ed25519" }, false, ["sign"]);
    const jwk = await subtle().exportKey("jwk", await subtle().importKey("pkcs8", pkcs8, { name: "Ed25519" }, true, ["sign"]));
    return { priv, raw32: unb64(jwk.x.replace(/-/g, "+").replace(/_/g, "/")) };
  }
  async function wrapSeed(seed, pass) {
    const salt = win.crypto.getRandomValues(new Uint8Array(16));
    const iv = win.crypto.getRandomValues(new Uint8Array(12));
    const base = await subtle().importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    const key = await subtle().deriveKey({ name: "PBKDF2", salt, iterations: KDF_ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
    const ct = new Uint8Array(await subtle().encrypt({ name: "AES-GCM", iv }, key, seed));
    return ["BIOKEY1", LABEL, b64(salt), b64(iv), b64(ct), KDF_ITER].join(".");
  }
  async function unwrapKey(s, pass) {
    s = String(s || "").trim();
    if (s.startsWith("BIOKEY-RAW1.")) { const [, , seed] = s.split("."); const b = unb64(seed); if (b.length !== 32) throw new Error("not a key"); return b; }
    if (!s.startsWith("BIOKEY1.") || !pass) throw new Error("not a key");
    const [, , salt, iv, ct, iter] = s.split(".");
    if (!/^[1-9][0-9]{0,6}$/.test(iter || "")) throw new Error("not a key");
    const base = await subtle().importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    const key = await subtle().deriveKey({ name: "PBKDF2", salt: unb64(salt), iterations: Number(iter), hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const seed = new Uint8Array(await subtle().decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(ct)));
    if (seed.length !== 32) throw new Error("not a key");
    return seed;
  }
  async function sshsig(priv, raw32, namespace, message) {
    const h = new Uint8Array(await subtle().digest("SHA-512", message));
    const signed = u8(enc.encode("SSHSIG"), sshStr(namespace), sshStr(""), sshStr("sha512"), sshStr(h));
    const sig = new Uint8Array(await subtle().sign("Ed25519", priv, signed));
    const blob = u8(enc.encode("SSHSIG"), u32(1), sshStr(wirePub(raw32)), sshStr(namespace), sshStr(""), sshStr("sha512"), sshStr(u8(sshStr("ssh-ed25519"), sshStr(sig))));
    return "-----BEGIN SSH SIGNATURE-----\n" + b64(blob).replace(/(.{70})/g, "$1\n") + "\n-----END SSH SIGNATURE-----\n";
  }
  const bytesOf = (b) => (b instanceof Uint8Array ? b : b instanceof ArrayBuffer ? new Uint8Array(b) : enc.encode(String(b == null ? "" : b)));
  const clear = (...ids) => { for (const id of ids) { const el = doc.getElementById(id); if (el) el.value = ""; } };
  const valueOf = (id) => { const el = doc.getElementById(id); return el ? String(el.value || "") : ""; };
  async function heldKey() {
    if (SITTING) return SITTING;
    const k = await kept();
    return k && k.priv && k.raw32 ? { priv: k.priv, raw32: new Uint8Array(k.raw32) } : null;
  }
  /* R40, R47: the key made in the browser; kept on the device only when `keep`, else handed out once as a key file in
     `BIOKEY1.` form under a passphrase the member types twice in the kit's own dialog. Answers `{ok, keyB64}` or
     `{ok: false, declined: true}` when the member stops. */
  async function register(o = {}) {
    if (o.keep) {
      const pair = await subtle().generateKey({ name: "Ed25519" }, false, ["sign", "verify"]);
      const raw32 = new Uint8Array(await subtle().exportKey("raw", pair.publicKey));
      await idb("readwrite", (st) => st.put({ priv: pair.privateKey, raw32: raw32.buffer.slice(0), label: LABEL }, "own"));
      if (!(await kept())) return { ok: false, declined: true };
      SITTING = null;
      return { ok: true, kept: true, ...lineOf(raw32, LABEL) };
    }
    for (;;) {
      const pass = await new Promise((resolve) => { DIALOG = { kind: "register", resolve }; OVERLAY_REFUSAL = ""; draw(); });
      if (pass === null) return { ok: false, declined: true };
      const seed = win.crypto.getRandomValues(new Uint8Array(32));
      const { priv, raw32 } = await seedKeys(seed);
      const file = await wrapSeed(seed, pass);
      seed.fill(0);
      saveFile(new Blob([file + "\n"], { type: "text/plain" }), "bio-signing-key.txt");
      SITTING = { priv, raw32 };
      return { ok: true, kept: false, ...lineOf(raw32, LABEL) };
    }
  }
  const SIGNER = {
    /* the key this browser holds: kept on the device, or loaded for this sitting */
    async held() {
      const key = await heldKey();
      return key ? { held: true, kept: !SITTING, ...lineOf(key.raw32, LABEL) } : { held: false };
    },
    register: (o) => register(o),
    /* R46: the signer's `ssh-ed25519` public line, the key made (and kept or filed as `keep` says) when none is held;
       null when the member stops */
    async publicLine(o = {}) {
      const key = await heldKey();
      if (key) return lineOf(key.raw32, LABEL).line;
      const r = await register(o);
      return r.ok ? r.line : null;
    },
    /* the kept key removed from this device (its revocation is the screen's act) */
    async forget() { SITTING = null; await idb("readwrite", (st) => st.delete("own")); return true; },
    /* R41, R47: "What your key signs, exactly", one confirmation for the whole list; one SSHSIG per statement in list
       order, or `{ok: false, declined: true}` signing nothing. With no key held, the dialog offers "Use a key file you
       already have", loaded for this sitting only. */
    async sign(statements) {
      const list = (Array.isArray(statements) ? statements : []).map((s) => ({ label: String((s && s.label) || ""), bytes: bytesOf(s && s.bytes), namespace: String((s && s.namespace) || "") }));
      if (!list.length || list.some((s) => !s.namespace)) return { ok: false, declined: true };
      let key = await heldKey();
      const shown = list.map((s) => ({ label: s.label, line: new TextDecoder().decode(s.bytes) }));
      let refusal = "";
      for (;;) {
        const yes = await new Promise((resolve) => { DIALOG = { kind: "sign", resolve, list: shown, needKey: !key }; OVERLAY_REFUSAL = refusal; draw(); });
        if (!yes) return { ok: false, declined: true };
        if (!key) {
          try {
            const seed = await unwrapKey(yes.file, yes.pass);
            key = await seedKeys(seed);
            seed.fill(0);
            SITTING = key;
          } catch { key = null; }
          if (!key) { refusal = refusalHtml(w("shell.signer.notkey")); continue; }
        }
        break;
      }
      const signatures = [];
      for (const s of list) signatures.push(await sshsig(key.priv, key.raw32, s.namespace, s.bytes));
      return { ok: true, signatures, ...lineOf(key.raw32, LABEL) };
    },
  };
  /* the kit's own signing dialogs answered: the register dialog's passphrase (twice alike), the sign dialog's yes (with
     a key file and its passphrase when no key is held), or no */
  function dialogAnswer(yes) {
    const d = DIALOG;
    if (!d) return;
    if (!yes) { DIALOG = null; OVERLAY_REFUSAL = ""; draw(); return d.resolve && d.resolve(d.kind === "register" ? null : false); }
    if (d.kind === "register") {
      const pass = valueOf("cs-key-pass"), again = valueOf("cs-key-again");
      clear("cs-key-pass", "cs-key-again");
      if (!pass || pass !== again) { OVERLAY_REFUSAL = refusalHtml(w("shell.signer.passphrase.differ")); return draw(); }
      DIALOG = null; OVERLAY_REFUSAL = ""; draw();
      return d.resolve(pass);
    }
    if (d.needKey) {
      const file = valueOf("cs-key-file"), pass = valueOf("cs-key-filepass");
      clear("cs-key-file", "cs-key-filepass");
      if (!file.trim()) { OVERLAY_REFUSAL = refusalHtml(w("shell.signer.nokey")); return draw(); }
      DIALOG = null; OVERLAY_REFUSAL = ""; draw();
      return d.resolve({ file, pass });
    }
    DIALOG = null; OVERLAY_REFUSAL = ""; draw();
    return d.resolve(true);
  }

  /* ---------- acts: friction (R11), sending, refusals beside the act (R13), the password asked again (R34) ---------- */
  const instOf = (k) => (k === "m" ? MAIN : k === "d" ? DOCKI : k === "g" ? GUIDEI : null);
  function slotOf(ai) { return doc.getElementById("cs-root").querySelector('[data-slot="' + ai + '"]'); }
  function besideAct(ai, inner) { const s = slotOf(ai); if (s) s.innerHTML = inner; }
  const refusalHtml = (words) => '<span class="cs-gap" data-gap="refused" role="alert">' + I("refused") + "<span>" + words + "</span></span>";
  function press(btn) {
    const ai = btn.getAttribute("data-ai");
    const [k, i] = String(ai).split(":");
    const inst = instOf(k);
    const d = inst && inst.acts[Number(i)];
    if (!d) return;
    activity();
    if (RING && RING.op === d.op) RING = null;
    /* R31, K3143: the guide hears each act pressed on the screen, by its op and screen only, never a value */
    if (inst === MAIN) guideCall("pressed", { op: d.op, screen: MAIN.spec.id });
    const weight = weightOf(d.op);
    if (weight === "reversible" || weight === "none") return run(inst, d, btn, ai, {});
    /* R11 (DEC-88): an act whose own field carries the member's authored words sends them as its reason, asking none */
    if (weight === "reasoned" && d.spec.reasonField) return run(inst, d, btn, ai, { own: true });
    if (weight === "reasoned") {
      const rid = "cs-reason-" + ai.replace(":", "-");
      return besideAct(ai, '<span class="cs-reason" role="group"><span class="cs-field"><label for="' + rid + '">' + w("shell.reason") + '</label><span class="help" id="' + rid + '-help">'
        + w("shell.reason.help") + '</span><textarea id="' + rid + '" class="cs-input" aria-describedby="' + rid + '-help"></textarea></span><span class="cs-actrow">'
        + '<button type="button" class="cs-btn" data-shell="reason-send" data-for="' + esc(ai) + '">' + w("shell.reason.send") + "</button>"
        + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="cancel" data-for="' + esc(ai) + '">' + w("shell.cancel") + '</button></span><span data-reason-refusal="' + esc(ai) + '"></span></span>');
    }
    const label = btn.childNodes ? btn.textContent : "";
    const fields = (d.spec.dialog || []).map((f, j) => '<span class="cs-field"><label for="cs-dlg-' + ai.replace(":", "-") + "-" + j + '">' + w(f.label) + '</label><textarea class="cs-input" id="cs-dlg-' + ai.replace(":", "-") + "-" + j + '"></textarea></span>').join("");
    const does = has("act." + d.op + ".does") ? "<p>" + w("act." + d.op + ".does") + "</p>" : "";
    besideAct(ai, '<span class="cs-dialog" role="dialog" aria-label="' + esc(label) + '"><span class="ends">' + does + "</span><p>"
      + w(weight === "signed" ? "shell.dialog.signed" : "shell.dialog.signs", { handle: ME ? ME.handle || "" : "" }) + "</p>" + fields + '<span class="cs-actrow">'
      + '<button type="button" class="cs-btn" data-tone="primary" data-shell="confirm" data-for="' + esc(ai) + '">' + w("shell.confirm") + "</button>"
      + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="cancel" data-for="' + esc(ai) + '">' + w("shell.cancel") + "</button></span></span>");
  }
  async function run(inst, d, btn, ai, extra) {
    let req;
    if (d.table) extra.picked = (inst.ui["pick:" + d.table] || []).slice();
    try {
      req = d.spec.send ? await d.spec.send(inst.view, btn, kit(inst), extra) : { body: Object.assign({}, d.data) };
    } catch { req = null; }
    if (!req) return;
    if (req.refuse) return besideAct(ai, refusalHtml(w(req.refuse, req.fills)));
    if (extra.own) {
      const words = req.raw !== undefined ? (req.query || {})[d.spec.reasonField] : (req.body || {})[d.spec.reasonField];
      if (!(typeof words === "string" && words.trim())) return besideAct(ai, refusalHtml(w("shell.reason.needed")));
    }
    if (extra.reason !== undefined) {
      if (req.raw !== undefined) req.query = Object.assign({}, req.query, { [d.spec.reasonField || "reason"]: extra.reason });
      else req.body = Object.assign({}, req.body || {}, { [d.spec.reasonField || "reason"]: extra.reason });
    }
    besideAct(ai, "");
    req.public = inst.pub;
    let a = await call(d.op, req);
    /* R34: an act answered `REAUTH_DUE` asks the password again and, on `reauth`'s success, is sent once more */
    if (a.kind === "refused" && a.code === "REAUTH_DUE" && S) {
      if (!(await reauthAsk())) return;
      a = await call(d.op, req);
    }
    if (a.kind !== "ok") {
      if (a.kind === "silent" && !S && !inst.pub) return;
      const words = a.kind === "refused" ? refusalWords(a, d.spec.refusals, false, inst) : w("state.failed", { reason: html(w("shell.noanswer")) });
      return besideAct(ai, refusalHtml(words));
    }
    if (d.op === "unlock" && inst === MAIN && frameOf(MAIN.spec.id) !== "working") { for (const el of doc.getElementById("cs-root").querySelectorAll('input[type="password"]')) el.value = ""; return unlocked(); }
    let after = null;
    /* R21 (K3009): no secret survives a successful act: every password field its screen drew is cleared, so no redraw
       restores one */
    for (const el of doc.getElementById("cs-root").querySelectorAll('input[type="password"]')) el.value = "";
    /* R21 (K3009): a `done` that answers a promise is awaited before the re-reads, so a follow-up act does not race them */
    try { after = d.spec.done ? await d.spec.done(inst.view, a.value, kit(inst)) : null; } catch { after = null; }
    if (after && after.stay) return draw();
    if (live(inst)) readAll(inst, d.spec.rereads || null);
  }

  /* ---------- explanations (R14) ---------- */
  let TIP = null, openT = null, closeT = null;
  const tipEl = () => doc.getElementById("cs-tip");
  function openTip(el) {
    clearTimeout(closeT); clearTimeout(openT);
    if (TIP && TIP !== el) closeTip();
    const t = tipEl();
    if (!t || !el.getAttribute("data-tip")) return;
    t.innerHTML = el.getAttribute("data-tip");
    t.hidden = false;
    TIP = el;
    el.setAttribute("aria-describedby", "cs-tip");
    if (el.getBoundingClientRect && t.style) {
      const r = el.getBoundingClientRect();
      t.style.left = Math.max(8, Math.round(r.left)) + "px";
      t.style.top = Math.round(r.bottom + 6) + "px";
    }
  }
  function closeTip() {
    clearTimeout(openT); clearTimeout(closeT);
    const t = tipEl();
    if (t) { t.hidden = true; t.innerHTML = ""; }
    if (TIP && TIP.removeAttribute) TIP.removeAttribute("aria-describedby");
    TIP = null;
  }
  const delayOf = (el) => (el.getAttribute("data-level") === "2" && LEVEL === "pause" ? 1500 : 500);
  const onTipOrEl = (n) => !!(n && ((TIP && (n === TIP || (TIP.contains && TIP.contains(n)))) || (tipEl() && (n === tipEl() || (tipEl().contains && tipEl().contains(n))))));

  /* ---------- events, bound once by delegation (no inline handler, R2) ---------- */
  const blocked = (t) => (LOCKED || REAUTH || DIALOG) && !(t.closest && t.closest(".cs-overlay"));
  function bind() {
    const root = doc.getElementById("cs-root");
    root.addEventListener("click", (e) => {
      const t = e.target;
      /* R33, R34, R41: under the lock or a dialog over the screen, nothing beneath it answers */
      if (blocked(t)) { e.preventDefault(); return; }
      const nav = t.closest ? t.closest("a[data-nav]") : null;
      if (nav && !(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)) { e.preventDefault(); activity(); return navigate(nav.getAttribute("href")); }
      const act = t.closest ? t.closest("button[data-act]") : null;
      if (act) return press(act);
      const sh = t.closest ? t.closest("[data-shell]") : null;
      if (sh) return shell(sh, e);
      const tipped = t.closest ? t.closest("[data-tip]") : null;
      if (tipped && !tipped.matches("a,button,input,select,textarea")) openTip(tipped);
    });
    root.addEventListener("change", (e) => {
      if (blocked(e.target)) return;
      const sh = e.target.closest ? e.target.closest('[data-shell="pick"]') : null;
      if (sh) return shell(sh, e);
      /* R49: a choice that drives its act redraws with the act following it */
      const ch = e.target.closest ? e.target.closest('[data-shell="choice"]') : null;
      if (ch) { const inst = [MAIN, DOCKI, GUIDEI].find((i) => i && Object.hasOwn(i.ui, "choice:" + ch.getAttribute("data-choice"))); if (inst) { inst.ui["choice:" + ch.getAttribute("data-choice")] = ch.value; draw(); } }
    });
    root.addEventListener("pointerover", (e) => {
      const el = e.target.closest ? e.target.closest("[data-tip]") : null;
      if (!el) return;
      clearTimeout(closeT);
      if (el === TIP) return;
      if (e.pointerType === "touch") return openTip(el);
      clearTimeout(openT);
      openT = setTimeout(() => openTip(el), delayOf(el));
    });
    root.addEventListener("pointerout", (e) => {
      const el = e.target.closest ? e.target.closest("[data-tip]") : null;
      if (!el) return;
      if (el !== TIP) { clearTimeout(openT); return; }
      if (onTipOrEl(e.relatedTarget)) return;
      clearTimeout(closeT);
      closeT = setTimeout(closeTip, 500);
    });
    root.addEventListener("focusin", (e) => { const el = e.target.closest ? e.target.closest("[data-tip]") : null; if (el) openTip(el); });
    root.addEventListener("focusout", (e) => { if (TIP && e.target.closest && e.target.closest("[data-tip]") === TIP) closeTip(); });
    const t = tipEl();
    if (t) {
      t.addEventListener("pointerover", () => clearTimeout(closeT));
      t.addEventListener("pointerout", (e) => { if (!onTipOrEl(e.relatedTarget)) closeT = setTimeout(closeTip, 500); });
    }
    root.addEventListener("pointerdown", (e) => {
      if (blocked(e.target)) return;
      /* R49: a rectangle drawn over the image, or one moved, by the pointer or a finger */
      const box = e.target.closest ? e.target.closest('[data-shell="areas-box"]') : null;
      if (box) {
        const id = box.getAttribute("data-areas"), inst = areasOf(id);
        if (!inst) return;
        e.preventDefault();
        const at = areasSize(inst, id), list = inst.areas[id];
        const px = (m) => ({ x: (m.clientX - at.rect.left) * at.sx, y: (m.clientY - at.rect.top) * at.sy });
        const p0 = px(e);
        const hit = e.target.closest('[data-shell="area"]');
        const r = hit ? list[Number(hit.getAttribute("data-i"))] : { left: p0.x, top: p0.y, width: 0, height: 0 };
        const from = { left: r.left, top: r.top };
        if (!hit) list.push(r);
        const move = (m) => {
          const p = px(m);
          if (hit) { r.left = from.left + p.x - p0.x; r.top = from.top + p.y - p0.y; clampArea(r, at.nat); }
          else { r.left = Math.min(p0.x, p.x); r.top = Math.min(p0.y, p.y); r.width = Math.abs(p.x - p0.x); r.height = Math.abs(p.y - p0.y); }
        };
        const up = (m) => {
          win.removeEventListener("pointermove", move); win.removeEventListener("pointerup", up);
          if (m && m.clientX !== undefined) move(m);
          if (!hit && (r.width < 2 || r.height < 2)) list.splice(list.indexOf(r), 1); else clampArea(r, at.nat);
          activity(); draw();
        };
        win.addEventListener("pointermove", move);
        win.addEventListener("pointerup", up);
        return;
      }
      const g = e.target.closest ? e.target.closest('[data-shell="grip"]') : null;
      if (!g) return;
      e.preventDefault();
      const rail = g.parentElement;
      const left = rail && rail.getBoundingClientRect ? rail.getBoundingClientRect().left : 0;
      const move = (m) => { RAILW = clampW(m.clientX - left); const f = doc.getElementById("cs-frame"); if (f && f.style) f.style.setProperty("--rail", RAILW + "px"); g.setAttribute("aria-valuenow", String(RAILW)); };
      const up = () => { win.removeEventListener("pointermove", move); win.removeEventListener("pointerup", up); local.set("cs-railw", String(RAILW)); draw(); };
      win.addEventListener("pointermove", move);
      win.addEventListener("pointerup", up);
    });
    root.addEventListener("keydown", (e) => {
      if (blocked(e.target)) return;
      const g = e.target.closest ? e.target.closest('[data-shell="grip"]') : null;
      if (g && ["ArrowLeft", "ArrowRight", "Home"].includes(e.key)) {
        e.preventDefault();
        RAILW = e.key === "Home" ? RAIL_DEFAULT : clampW(RAILW + (e.key === "ArrowRight" ? 8 : -8));
        local.set("cs-railw", String(RAILW));
        draw();
      }
      const row = e.target.closest ? e.target.closest('[data-shell="row"]') : null;
      if (row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); shell(row, e); }
      /* R49: an area moved by the arrow keys, resized with Shift, removed by Delete */
      const area = e.target.closest ? e.target.closest('[data-shell="area"]') : null;
      if (area && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete", "Backspace"].includes(e.key)) {
        e.preventDefault();
        const id = area.getAttribute("data-areas"), inst = areasOf(id);
        if (!inst) return;
        const at = areasSize(inst, id), list = inst.areas[id], i = Number(area.getAttribute("data-i")), r = list[i];
        if (!r) return;
        if (e.key === "Delete" || e.key === "Backspace") { list.splice(i, 1); draw(); return; }
        const step = at.nat ? Math.max(1, Math.round(Math.max(at.nat.w, at.nat.h) / 100)) : 10;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0, dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        if (e.shiftKey) { r.width += dx; r.height += dy; } else { r.left += dx; r.top += dy; }
        clampArea(r, at.nat);
        draw();
      }
    });
    /* R33: the member's own input is activity */
    for (const type of ["keydown", "pointerdown", "touchstart", "wheel"]) doc.addEventListener(type, () => { if (!LOCKED) activity(); });
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeTip(); if (MENU) { MENU = false; draw(); } if (REAUTH) reauthNow(false); if (DIALOG) dialogAnswer(false); }
      if (LOCKED || REAUTH || DIALOG) return;
      if (e.altKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.code === "KeyI")) { e.preventDefault(); setLevel(LEVEL === "prompt" ? "pause" : "prompt"); }
      /* R31: Alt+Shift+W asks the running guide to ring its step again */
      if (e.altKey && e.shiftKey && (e.key === "W" || e.key === "w" || e.code === "KeyW") && GUIDEI) { e.preventDefault(); guideCall("ring"); }
    });
    win.addEventListener("popstate", () => route());
    win.addEventListener("pagehide", () => { closing(MAIN); closing(DOCKI); closing(GUIDEI); SITTING = null; });
    /* R32: every tab sees a sign-in, a lock, a sign-out or an end through the storage event */
    win.addEventListener("storage", (e) => {
      if (!e || (e.key !== D.storeKey && e.key !== STATE_KEY && e.key !== null)) return;
      const rec = readRecord();
      const why = local.get(STATE_KEY);
      if (S && !rec) return over(why === "ended" ? "ended" : "signedout");
      if (rec && (!S || rec.t !== S.t)) {
        S = rec; ME = null; LOCKED = false; ENTRY = { state: null, handle: null };
        /* a public, published or setup screen stays as it is (R30, R45; screens-entry R11); `front` opens the page kept */
        if (ROUTE && ROUTE.root) win.history.replaceState({}, "", takeReturn());
        if (ROUTE && (ROUTE.root || working())) route(); else draw();
        return;
      }
      if (S && rec && why === "locked" && !LOCKED) return lock(true);
      if (S && LOCKED && why !== "locked") { LOCKED = false; OVERLAY_REFUSAL = ""; activity(); armIdle(); draw(); }
    });
    if (mq && mq.addEventListener) mq.addEventListener("change", () => draw());
    win.addEventListener("beforeprint", () => doc.documentElement.setAttribute("data-theme", "light"));
    win.addEventListener("afterprint", () => applyTheme());
  }
  function shell(el, e) {
    const what = el.getAttribute("data-shell");
    const inst = MAIN;
    const table = el.getAttribute("data-table"), id = el.getAttribute("data-id");
    activity();
    if (what === "unlock") return unlockNow();
    if (what === "lock-other") return signOut();
    if (what === "reauth") return reauthNow(true);
    if (what === "reauth-cancel") return reauthNow(false);
    if (what === "dialog-yes") return dialogAnswer(true);
    if (what === "dialog-no") return dialogAnswer(false);
    if (what === "bind") {
      const [k, i] = String(el.getAttribute("data-bi") || "").split(":");
      const ins = instOf(k);
      const b = ins && ins.binds[Number(i)];
      if (!b) return;
      if (b.kind === "signout") return signOut();
      if (b.kind === "save") return saveFile(new Blob([b.text], { type: "text/plain" }), b.name);
      if (b.kind === "copy") { try { const c = win.navigator && win.navigator.clipboard; if (c && c.writeText) c.writeText(b.text); } catch { /* the clipboard refused: nothing copied */ } return; }
      return;
    }
    if (what === "area-add" || what === "area-clear") {
      const id = el.getAttribute("data-areas"), ins = areasOf(id);
      if (!ins) return;
      const at = areasSize(ins, id);
      if (what === "area-clear") ins.areas[id].length = 0;
      else ins.areas[id].push(clampArea(at.nat ? { left: at.nat.w * 0.4, top: at.nat.h * 0.4, width: at.nat.w * 0.2, height: at.nat.h * 0.2 } : { left: 10, top: 10, width: 100, height: 60 }, at.nat));
      return draw();
    }
    if (what === "area" || what === "areas-box") return;
    if (what === "menu") { MENU = !MENU; return draw(); }
    if (what === "signout") return signOut();
    if (what === "theme") { MENU = false; return setTheme(el.getAttribute("data-theme-to")); }
    if (what === "level") return setLevel(LEVEL === "prompt" ? "pause" : "prompt");
    if (what === "level-keep") { ASK_LEVEL = false; local.set("cs-level-asked", "1"); return setLevel(LEVEL, true); }
    if (what === "level-switch") { ASK_LEVEL = false; local.set("cs-level-asked", "1"); return setLevel(LEVEL === "prompt" ? "pause" : "prompt", true); }
    if (what === "dock") {
      if (DOCK) closing(DOCKI);
      DOCK = !DOCK;
      if (DOCK && DOCKI && !Object.keys(DOCKI.data).length) readAll(DOCKI);
      return draw();
    }
    if (what === "cancel") return besideAct(el.getAttribute("data-for"), "");
    if (what === "reason-send" || what === "confirm") {
      const ai = el.getAttribute("data-for");
      const [k, i] = ai.split(":");
      const ins = instOf(k);
      const d = ins && ins.acts[Number(i)];
      const btn = doc.getElementById("cs-root").querySelector('button[data-ai="' + ai + '"]');
      if (!d || !btn) return;
      if (what === "reason-send") {
        const ta = doc.getElementById("cs-reason-" + ai.replace(":", "-"));
        const reason = ta ? String(ta.value || "").trim() : "";
        if (!reason) { const r = doc.getElementById("cs-root").querySelector('[data-reason-refusal="' + ai + '"]'); if (r) r.innerHTML = refusalHtml(w("shell.reason.needed")); return; }
        return run(ins, d, btn, ai, { reason });
      }
      const fields = {};
      (d.spec.dialog || []).forEach((f, j) => { const t = doc.getElementById("cs-dlg-" + ai.replace(":", "-") + "-" + j); fields[f.name] = t ? t.value : ""; });
      return run(ins, d, btn, ai, { fields });
    }
    if (!inst) return;
    if (what === "row") {
      const open = inst.ui["open:" + table] || (inst.ui["open:" + table] = []);
      const at = open.indexOf(id);
      if (at >= 0) open.splice(at, 1); else open.push(id);
      return draw();
    }
    if (what === "pick") {
      const picked = inst.ui["pick:" + table] || (inst.ui["pick:" + table] = []);
      const at = picked.indexOf(id);
      if (at >= 0) picked.splice(at, 1); else picked.push(id);
      return draw();
    }
    if (what === "unpick") { inst.ui["pick:" + table] = []; return draw(); }
    if (what === "sort") {
      const col = Number(el.getAttribute("data-col"));
      const s = inst.ui["sort:" + table];
      inst.ui["sort:" + table] = { col, dir: s && s.col === col && s.dir === "asc" ? "desc" : "asc" };
      return draw();
    }
  }

  /* ---------- start ---------- */
  async function loadWords() {
    const a = await call("interfacewords");
    if (a.kind !== "ok" || !a.value || !Array.isArray(a.value.words)) return;
    wordsRead = true;
    const shown = new Map();
    for (const x of a.value.words) if (x && typeof x.key === "string" && typeof x.text === "string" && x.text && x.fallback === false) shown.set(x.key, x.text);
    SHOWN = shown;
    if (typeof a.value.language === "string" && a.value.language) doc.documentElement.setAttribute("lang", a.value.language);
    draw();
  }
  async function loadFrame() {
    /* R33: the queue count is the shell's own read, not the member's activity */
    const [g, q, lv] = await Promise.all([call("groupidentity"), call("queue", { query: { limit: 500 }, background: true }), call("infolevel")]);
    if (!ME) return;
    if (g.kind === "ok" && g.value) GROUP = g.value.display_name || g.value.group || null;
    if (q.kind === "ok" && q.value && Array.isArray(q.value.items)) TODO = q.value.items.filter((x) => x && x.class === "OBLIGATION").length;
    if (lv.kind === "ok" && lv.value && (lv.value.level === "prompt" || lv.value.level === "pause")) {
      LEVEL_INFO = lv.value;
      if (lv.value.set_at) { LEVEL = lv.value.level; local.set("cs-level", LEVEL); }
    }
    /* R17 (DEC-162 (2)): after the member's first month (from the first day this device served her, or the level's
       first setting), the shell asks once whether to keep the level */
    const firstKey = "cs-first:" + (ME.member || "");
    if (!local.get(firstKey)) local.set(firstKey, String(Date.now()));
    const first = Math.min(Number(local.get(firstKey)) || Date.now(), LEVEL_INFO && LEVEL_INFO.set_at ? Date.parse(LEVEL_INFO.set_at) || Date.now() : Date.now());
    const asked = (LEVEL_INFO && LEVEL_INFO.asked_at) || local.get("cs-level-asked");
    ASK_LEVEL = !asked && Date.now() - first >= 30 * 24 * 3600 * 1000;
    draw();
  }
  async function loadReach() {
    const [st, ref, sub, gk] = await Promise.all([call("assistantstate"), call("accountreference"), call("subscriptionsignin", { body: { step: "state" } }), call("groupkeystate")]);
    if (!ME) return;
    const on = st.kind === "ok" && st.value && st.value.on === true;
    const own = ref.kind === "ok" && ref.value && ref.value.held === true;
    const signed = sub.kind === "ok" && sub.value && sub.value.connected === true;
    const group = gk.kind === "ok" && gk.value && gk.value.on === true && gk.value.held !== false;
    const was = REACHABLE;
    REACHABLE = !!(on && (own || signed || group));
    if (REACHABLE !== was) {
      DOCKI = REACHABLE && screenOf("assistant") && ROUTE && (!MAIN || frameOf(MAIN.spec.id) === "working") ? instance(screenOf("assistant"), ROUTE.subject, "d", { screen: ROUTE.screen, subject: ROUTE.subject }) : null;
      if (!REACHABLE) DOCK = false;
      draw();
      if (MAIN) readAll(MAIN);
    }
  }
  /* R36: old addresses forwarded, the fragment carried and nothing else */
  function forward() {
    const p = String(win.location.pathname || "/"), h = String(win.location.hash || "");
    if (/^\/app(\/|$)/.test(p)) return;
    if (/^#(invite|join)=/.test(h)) win.history.replaceState({}, "", "/app/join" + h);
    else if (/^#boot=/.test(h)) win.history.replaceState({}, "", "/app/setup" + h);
  }
  /* R46: the fragment read once (`boot`, `invite`, `join`, `reset`, and `grant` for `review-outside`, K3147), then removed
     from the address before any request */
  function takeFragment() {
    const h = String(win.location.hash || "");
    if (!h || h === "#") return;
    const out = {};
    for (const part of h.slice(1).split("&")) {
      const at = part.indexOf("=");
      if (at < 0) continue;
      const k = part.slice(0, at);
      if (!["boot", "invite", "join", "reset", "grant"].includes(k)) continue;
      try { out[k] = decodeURIComponent(part.slice(at + 1)); } catch { out[k] = part.slice(at + 1); }
    }
    FRAGMENT = out;
    win.history.replaceState({}, "", win.location.pathname);
  }
  async function start() {
    if (STARTED) return;
    STARTED = true;
    applyTheme();
    bind();
    forward();
    takeFragment();
    if (GUIDE) GUIDEI = instance(GUIDE, null, "g", null);
    /* R32: the record read when a screen first needs it (never for a public or published one, R30); `/` with a live
       record opens Home */
    /* R36: the test-instance band, read once without a session */
    call("bootstrap", { public: true }).then((b) => { BOOT = b.kind === "ok" && b.value && typeof b.value === "object" ? b.value : null; if (BOOT && BOOT.test_instance === true) draw(); });
    await route();
  }
  return { start, state: () => ({ ME, ROUTE, LEVEL, THEME, RAILW, REACHABLE, DOCK, TODO, GROUP, MAIN, DOCKI, LOCKED, S: !!S }), absorb, date, w };
}

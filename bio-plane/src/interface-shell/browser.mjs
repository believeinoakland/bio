/* interface-shell: the browser program (R3–R20, R22, R24, R26). `shellProgram(D, SCREENS, win)` is serialized whole
   into the page's one script by `interfacePage` (draft-T46-interface §1.3): it refers only to its parameters and to the
   language's own globals, so the same function runs in node over the tests' document stand-in. `D` is the page's frozen
   data (words, the act gate's tables, the grades, the paths), `SCREENS` the registered screens (R21), `win` the window.
   It reads no table and writes nothing of the record: every read and act is an op the plane serves, under the session
   the setup page handed over (R3); it keeps no log of reads or of screens visited (R24). */
export function shellProgram(D, SCREENS, win) {
  "use strict";
  const doc = win.document;
  const local = {
    get(k) { try { return win.localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { win.localStorage.setItem(k, v); } catch { /* R26, R18: a storage that cannot be written keeps the default */ } },
  };

  /* ---------- words (R5, R6) ---------- */
  const BASE = new Map(D.words);
  let SHOWN = new Map();
  let wordsRead = false, wordsRetry = false;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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

  /* ---------- the session (R3, R4) ---------- */
  let S = null, ME = null, GONE = false;
  function readSession() {
    try {
      const s = JSON.parse(win.sessionStorage.getItem(D.storeKey) || "null");
      if (s && typeof s.t === "string" && s.t && (!s.e || s.e > Date.now())) return s;
    } catch { /* an unreadable record is none */ }
    return null;
  }
  function gone() {
    if (GONE) return;
    GONE = true;
    try { win.sessionStorage.removeItem(D.storeKey); } catch { /* nothing kept to remove */ }
    win.location.assign("/");
  }

  /* The op client: the token only in the Authorization header (R3); a 401 to any request signs the page out. Answers
     `{kind: "ok", value}`, `{kind: "refused", code, translation, fields}` (R13) or `{kind: "silent"}` (no answer). */
  async function call(op, req = {}) {
    if (GONE) return { kind: "silent" };
    const qs = new URLSearchParams();
    qs.set("op", op);
    for (const [k, v] of Object.entries(req.query || {})) if (v !== undefined && v !== null) qs.set(k, String(v));
    const own = typeof req.bearer === "string" && req.bearer !== "";
    const init = { headers: { Authorization: "Bearer " + (own ? req.bearer : S.t) } };
    if (req.raw !== undefined) { init.method = "POST"; init.body = req.raw; if (req.rawType) init.headers["content-type"] = req.rawType; }
    else if (req.body !== undefined) { init.method = "POST"; init.body = JSON.stringify(req.body); init.headers["content-type"] = "application/json"; }
    let r;
    try { r = await win.fetch("/api/?" + qs.toString(), init); } catch { return { kind: "silent" }; }
    if (r.status === 401 && !own) { gone(); return { kind: "silent" }; }
    if (req.bytes) return { kind: "response", r };
    let j = null;
    try { j = await r.json(); } catch { j = null; }
    const refused = (o) => ({ kind: "refused", code: String(o.code || o.reason || r.status), translation: typeof o.translation === "string" ? o.translation : null, fields: o });
    if (j && typeof j === "object" && j.ok === false) return refused(j);
    const value = j && typeof j === "object" && "result" in j ? j.result : j;
    if (value && typeof value === "object" && value.ok === false) return refused(value);
    if (!r.ok) return j && typeof j === "object" ? refused(j) : { kind: "refused", code: String(r.status), translation: null, fields: {} };
    if (j === null) return { kind: "silent" };
    return { kind: "ok", value, json: j };
  }

  /* ---------- the act gate (R12) and the weights (R11) ---------- */
  const ADMIN = new Set(D.adminActs);
  const SESSION = { member: new Set(D.sessionOps.member), admin: new Set(D.sessionOps.admin) };
  function can(op) {
    if (!ME) return false;
    if (!(op in D.ops)) return false;
    const need = D.needs[op];
    const caps = Array.isArray(ME.capabilities) ? ME.capabilities : [];
    if (need !== undefined && need !== null && !caps.includes(need)) return false;
    const set = ME.tokenClass === "admin" ? SESSION.admin : SESSION.member;
    if (!set.has(op)) return false;
    if (ADMIN.has(op) && ME.administer !== true) return false;
    return true;
  }
  const WEIGHTS = ["reversible", "reasoned", "terminal", "signed", "irreversible"];
  const weightOf = (op) => { const r = D.rungs[op]; const n = r === "attested" ? "signed" : r; return WEIGHTS.includes(n) ? n : "reasoned"; };

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
  let GROUP = null, TODO = null, REACHABLE = false, DOCK = false, ASK_LEVEL = false;
  const screenOf = (id) => SCREENS.find((s) => s.id === id) || null;

  /* ---------- screen instances: reads, states, acts ---------- */
  let MAIN = null, DOCKI = null, ROUTE = null;
  function emptyOf(spec, v) {
    if (spec && typeof spec.empty === "function") return !!spec.empty(v);
    if (v === null || v === undefined) return true;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "object") for (const k of ["items", "results", "list", "rows", "words"]) if (Array.isArray(v[k])) return v[k].length === 0;
    return false;
  }
  /* R13: `refusal.<code>` (or the screen's own key for the code) when held; else the answer's translation; else
     `state.failed` with the code (a read's state already says it, so a read is handed the code alone) */
  function refusalWords(a, own, bare) {
    const key = own && own[a.code] ? own[a.code] : "refusal." + a.code;
    if (has(key)) return w(key, a.fields || {});
    if (a.translation) return esc(a.translation);
    return bare ? esc(a.code) : w("state.failed", { reason: a.code });
  }
  function outcome(spec, a) {
    if (a.kind === "ok") return emptyOf(spec, a.value) ? { state: "empty", value: a.value, refusal: null } : { state: "ok", value: a.value, refusal: null };
    if (a.kind === "refused") return { state: "failed", value: null, refusal: { code: a.code, words: refusalWords(a, spec && spec.refusals, true) } };
    return { state: "failed", value: null, refusal: { code: null, words: w("shell.noanswer") } };
  }
  function instance(spec, subject, key, serves) {
    const inst = { key, spec, subject, serves: serves || null, data: {}, ui: {}, acts: [], gen: 0, notFound: false };
    inst.view = { subject, data: inst.data, ui: inst.ui, get me() { return ME; }, get reachable() { return REACHABLE; }, serves: inst.serves };
    return inst;
  }
  const NOT_FOUND = /^NO_SUCH_|_NOT_FOUND$|^NOT_FOUND$/;
  async function readAll(inst, names) {
    let specs = {};
    try { specs = inst.spec.reads ? inst.spec.reads(inst.view) || {} : {}; } catch { specs = {}; }
    const gen = ++inst.gen;
    const todo = Object.entries(specs).filter(([n]) => !names || names.includes(n));
    for (const [n] of todo) if (!inst.data[n] || !names) inst.data[n] = { state: "loading", value: null, refusal: null };
    draw();
    await Promise.all(todo.map(async ([n, spec]) => {
      const a = await call(spec.op, { query: spec.query, body: spec.body });
      if (gen !== inst.gen && !names) return;
      inst.data[n] = outcome(spec, a);
      /* R9: a subject the read does not find is the screen's "Nothing here" */
      if (spec.subject && (inst.data[n].state === "empty" || (a.kind === "refused" && NOT_FOUND.test(a.code)))) inst.notFound = true;
      draw();
    }));
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
  function kit(inst) {
    const cs = {
      w, esc, date,
      get me() { return ME; },
      get reachable() { return REACHABLE; },
      can: (op) => can(op),
      level: () => LEVEL,
      setLevel: (v) => setLevel(v),
      theme: () => THEME,
      setTheme: (v) => setTheme(v),
      go: (screen, subject) => navigate(hrefOf(screen, subject)),
      /* R21 (K2998): one op, its parsed answer (null when none came); `bearer` replaces the session for this request only */
      async call(op, o = {}) {
        const a = await call(op, { query: o.query, body: o.body, raw: o.raw, rawType: o.rawType, bearer: o.bearer });
        return a.kind === "ok" ? a.json : a.kind === "refused" ? a.fields : null;
      },
      /* R21 (K2999): a byte answer handed to the browser as a file, its object address released once the download starts */
      async download(op, o = {}) {
        const a = await call(op, { query: o.query, body: o.body, bytes: true });
        if (a.kind !== "response") return { ok: false, answer: null };
        const r = a.r;
        const type = r.headers && r.headers.get ? r.headers.get("content-type") || "" : "";
        if (!r.ok || /json/i.test(type)) { let j = null; try { j = await r.json(); } catch { j = null; } return { ok: false, answer: j }; }
        const blob = await r.blob();
        const url = win.URL.createObjectURL(blob);
        const link = doc.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", o.name || "");
        doc.body.appendChild(link);
        link.click();
        doc.body.removeChild(link);
        win.URL.revokeObjectURL(url);
        return { ok: true, answer: { type, size: blob.size } };
      },
      set: (name, value) => { inst.ui[name] = value; draw(); },
      value(id) {
        const el = doc.getElementById(id);
        if (!el) return null;
        if (el.tagName === "FIELDSET") return Array.from(el.querySelectorAll("input")).filter((i) => i.checked).map((i) => i.value);
        if (el.type === "checkbox" || el.type === "radio") return !!el.checked;
        return el.value;
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
        if (!spec || !can(op)) return "";
        const weight = weightOf(op);
        const label = w(o.label || spec.label || "act." + op + ".label." + inst.spec.id, o.fills);
        const does = has("act." + op + ".does") ? w("act." + op + ".does") : "";
        const outward = !!(spec.outward || o.outward);
        if (phone() && (weight === "signed" || weight === "irreversible"))
          return '<div class="cs-reason" data-phone-act="' + esc(op) + '"><b>' + label + "</b>" + (does ? "<p>" + does + "</p>" : "") + "<p>" + w("shell.phone.larger") + "</p></div>";
        const idx = inst.acts.push({ op, spec, data: o.data || {}, table: inst.holding || o.table || null }) - 1;
        const data = Object.entries(o.data || {}).map(([k, v]) => " data-" + k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + '="' + esc(v) + '"').join("");
        const pips = '<span class="cs-pips" aria-hidden="true">' + [1, 2, 3, 4, 5].map((i) => "<i" + (i <= WEIGHTS.indexOf(weight) + 1 ? ' class="on"' : "") + "></i>").join("") + "</span>";
        const tip = (does ? "<b>" + label + "</b>: " + does : "<b>" + label + "</b>") + '<span class="why">' + w("weight." + weight + ".means") + "</span>"
          + (outward ? '<span class="why">' + w("mark.outward.means") + "</span>" : "");
        return '<span class="cs-actwrap"><button type="button" class="cs-btn"' + (o.tone ? ' data-tone="' + esc(o.tone) + '"' : "")
          + ' data-act="' + esc(op) + '" data-ai="' + inst.key + ":" + idx + '"' + data + tipAttr(tip, 2) + ">"
          + (o.icon ? I(o.icon) : "") + (outward ? I("outward") : "") + label
          + '<span class="w">' + pips + w("weight." + weight + ".name") + "</span></button>"
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
      choice(id, labelKey, options, o = {}) {
        return '<div class="cs-field"><label for="' + esc(id) + '">' + w(labelKey) + '</label><select id="' + esc(id) + '" class="cs-input">'
          + options.map(([v, k, fills]) => '<option value="' + esc(v) + '"' + (o.value === v ? " selected" : "") + ">" + w(k, fills) + "</option>").join("") + "</select></div>";
      },
      checks(id, legendKey, options, o = {}) {
        return '<fieldset class="cs-field" id="' + esc(id) + '"><legend>' + w(legendKey) + "</legend>" + options.map(([v, k, on], i) =>
          '<label><input type="' + (o.radio ? "radio" : "checkbox") + '" name="' + esc(id) + '" id="' + esc(id) + "-" + i + '" value="' + esc(v) + '"' + (on ? " checked" : "") + "> " + w(k) + "</label>").join("") + "</fieldset>";
      },
      /* R19: rows, each row's acts in a panel beneath it; picks bring the hold strip */
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
            ? '<button type="button" class="cs-btn" data-tone="quiet" data-shell="sort" data-table="' + esc(id) + '" data-col="' + i + '"' + tipAttr(w("shell.sort.holds"), 2) + ">" + w(c) + "</button>" : w(c)) + "</th>";
        }).join("") + "</tr></thead>";
        const body = items.map((it) => {
          const key = String(t.key(it));
          const name = t.name ? t.name(it) : key;
          const isOpen = open.includes(key);
          const cells = t.cells(it);
          const acts = t.acts ? t.acts(it) : "";
          return '<tr class="cs-r">' + (t.pick ? '<td><input type="checkbox" id="pick-' + esc(id) + "-" + esc(key) + '" data-shell="pick" data-table="' + esc(id) + '" data-id="' + esc(key) + '"'
              + (picked.includes(key) ? " checked" : "") + ' aria-label="' + w("shell.pick", { name }) + '"></td>' : "")
            + cells.map((c, i) => i === 0 && acts
              ? '<td><button type="button" class="cs-btn" data-tone="quiet" data-shell="row" data-table="' + esc(id) + '" data-id="' + esc(key) + '" aria-expanded="' + isOpen + '" aria-label="' + w("shell.row.open", { name }) + '">' + c + "</button></td>"
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
    };
    return cs;
  }

  /* ---------- routes (R9) and paths (R8) ---------- */
  function hrefOf(screen, subject) {
    if (screen === "home") return "/app";
    return "/app/" + encodeURIComponent(screen) + (subject !== undefined && subject !== null && subject !== "" ? "/" + encodeURIComponent(subject) : "");
  }
  function parse(pathname) {
    const rest = String(pathname || "").replace(/^\/app\/?/, "");
    const [s, ...sub] = rest.split("/").filter((x) => x !== "");
    let subject = sub.length ? sub.join("/") : null;
    try { subject = subject === null ? null : decodeURIComponent(subject); } catch { /* kept as written */ }
    return { screen: s ? s : "home", subject };
  }
  const placeOf = (id) => (D.paths[id] ? D.paths[id][0] : ["settings", "people", "more"].includes(id) ? id : null);
  function placeHref(k) {
    const target = D.placeScreens[k];
    return target === "home" ? "/app" : screenOf(target) ? hrefOf(target) : "/app/" + k;
  }
  function pathNav(route, inst) {
    const steps = [];
    const p = D.paths[route.screen];
    if (p) {
      steps.push({ label: w("rail." + p[0] + ".name"), href: placeHref(p[0]) });
      let proj = null;
      try { proj = inst && inst.spec.place ? (inst.spec.place(inst.view) || {}).project : null; } catch { proj = null; }
      for (const step of p.slice(1)) {
        if (step === "@project") { if (proj && proj.title) steps.push({ label: esc(proj.title), href: route.screen === "project" ? null : hrefOf("project", proj.id) }); }
        else steps.push({ label: w(step) });
      }
      if (route.screen === "project" && !(proj && proj.title)) steps.push({ label: w("screen.project.name") });
    } else if (D.places.includes(route.screen)) steps.push({ label: w(route.screen === "more" ? "shell.more" : "rail." + route.screen + ".name") });
    else steps.push({ label: w("state.empty") });
    if (steps.length) steps[steps.length - 1].href = null;
    return '<nav class="cs-crumbs" aria-label="' + w("shell.path") + '"><ol>' + steps.map((s, i) => "<li>" + (i === steps.length - 1
      ? '<span aria-current="page">' + s.label + "</span>"
      : '<a href="' + esc(s.href) + '" data-nav>' + s.label + "</a>") + "</li>").join("") + "</ol></nav>";
  }

  /* ---------- drawing ---------- */
  const shellPage = (route) => {
    const k = route.screen;
    const titled = (key) => '<h1 class="t-title">' + w(key) + "</h1>";
    if (k === "settings") {
      const links = ["members", "account", "connect", "notes"].filter(screenOf).map((s) =>
        '<li><a href="' + hrefOf(s) + '" data-nav' + tipAttr(kw("screen." + s + ".purpose"), 2) + ">" + w("screen." + s + ".name") + "</a></li>").join("");
      return titled("shell.settings.title") + "<ul class=\"cs-list\">" + links + '<li><a href="/"' + tipAttr(w("shell.groupsettings.holds"), 2) + ">" + w("shell.groupsettings") + "</a></li></ul>";
    }
    if (k === "more") {
      return titled("shell.more") + '<ul class="cs-list">' + ["projects", "people", "settings"].map((p) =>
        '<li><a href="' + placeHref(p) + '" data-nav' + tipAttr(w("rail." + p + ".holds"), 2) + ">" + w("rail." + p + ".name") + "</a></li>").join("") + "</ul>";
    }
    return titled("rail." + k + ".name") + '<p class="cs-state" data-state="empty">' + w("shell.later", { place: html(w("rail." + k + ".name")) }) + "</p>";
  };
  function mainHtml(route) {
    if (!ME) return '<p class="cs-state" data-state="loading" role="status"><span class="bar" aria-hidden="true"></span>' + w("state.loading") + "</p>";
    if (!MAIN) {
      if (D.places.includes(route.screen)) return pathNav(route, null) + shellPage(route);
      return pathNav(route, null) + '<p class="cs-state" data-state="empty">' + w("state.empty") + "</p>";
    }
    MAIN.acts = [];
    if (MAIN.notFound) return pathNav(route, MAIN) + '<p class="cs-state" data-state="empty">' + w("state.empty") + "</p>";
    let body;
    try { body = MAIN.spec.render(kit(MAIN), MAIN.view); } catch { body = '<p class="cs-state" data-state="failed" role="alert">' + w("state.failed", { reason: html(w("shell.noanswer")) }) + "</p>"; }
    return pathNav(route, MAIN) + body;
  }
  function dockHtml() {
    if (!(REACHABLE && DOCK && DOCKI)) return "";
    DOCKI.acts = [];
    let body = "";
    try { body = DOCKI.spec.render(kit(DOCKI), DOCKI.view); } catch { body = ""; }
    return '<aside class="cs-dock" aria-label="' + w("shell.assistant") + '"><header>' + I("machine") + w("shell.assistant") + '<span class="spacer"></span>'
      + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="dock" aria-label="' + w("shell.assistant.close") + '">' + I("close") + "</button></header>"
      + '<div class="body">' + body + "</div></aside>";
  }
  function mastHtml() {
    const name = GROUP ? esc(GROUP) : "";
    const level = w(LEVEL === "pause" ? "level.pause.name" : "level.prompt.name");
    const initial = ME && ME.handle ? esc(String(ME.handle).slice(0, 1).toUpperCase()) : "";
    const signout = can("signout") ? '<button type="button" class="cs-btn" data-tone="quiet" data-shell="signout" role="menuitem"' + tipAttr(w("shell.signout.does"), 2) + ">" + w("shell.signout") + "</button>" : "";
    const themes = ["device", "light", "dark"].map((t) => '<button type="button" class="cs-btn" data-tone="quiet" role="menuitemradio" aria-checked="' + (THEME === t) + '" data-shell="theme" data-theme-to="' + t + '">' + w("shell.appearance." + t) + "</button>").join("");
    return '<header class="cs-mast">' + (name ? '<a class="grp" href="/app" data-nav>' + name + "</a>" : "") + '<span class="spacer"></span>'
      + '<a class="cs-btn" data-tone="quiet" href="' + placeHref("find") + '" data-nav' + tipAttr(w("shell.search.holds"), 2) + ">" + I("search") + w("shell.search") + "</a>"
      + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="level"' + tipAttr(w("shell.level.holds"), 2) + ">" + I("question") + w("shell.level", { level: html(level) }) + "</button>"
      + (REACHABLE ? '<button type="button" class="cs-btn" data-tone="quiet" data-shell="dock" aria-expanded="' + DOCK + '"' + tipAttr(w("shell.assistant.holds"), 2) + ">" + I("machine") + w("shell.assistant") + "</button>" : "")
      + (TODO !== null ? '<a class="cs-kind" data-kind="todo" href="' + placeHref("queue") + '" data-nav' + tipAttr(w("shell.todo.means"), 1) + ">" + I("queue") + w("shell.todo", { n: String(TODO) }) + "</a>" : "")
      + '<span class="cs-menuwrap"><button type="button" class="cs-btn" data-shell="menu" aria-haspopup="menu" aria-expanded="' + !!MENU + '" aria-controls="cs-menu"'
      + tipAttr(w("shell.you.holds"), 2) + '><span aria-hidden="true">' + initial + '</span><span class="sr">' + w("shell.you", { handle: ME ? ME.handle || "" : "" }) + "</span></button>"
      + '<div class="cs-dialog cs-menu" id="cs-menu" role="menu"' + (MENU ? "" : " hidden") + ">" + signout
      + '<div role="group" aria-label="' + w("shell.appearance") + '"><span class="eyebrow">' + w("shell.appearance") + "</span>" + themes + "</div></div></span></header>";
  }
  const RAIL = ["home", "queue", "find", "add", "projects", "people", "settings"];
  const TABS = ["home", "queue", "add", "find", "more"];
  const RAIL_ICON = { home: "home", queue: "queue", find: "search", add: "add", projects: "project", people: "subject", settings: "settings", more: "settings" };
  function frameHtml(route) {
    const place = placeOf(route.screen);
    const rail = RAIL.map((k) => '<a href="' + placeHref(k) + '" data-nav' + (place === k ? ' aria-current="page"' : "") + tipAttr(w("rail." + k + ".holds"), RAILW < 120 ? 1 : 2) + ">"
      + I(RAIL_ICON[k]) + w("rail." + k + ".name") + "</a>").join("")
      + '<button type="button" class="cs-grip" data-shell="grip" role="separator" aria-orientation="vertical" aria-label="' + w("shell.width") + '" aria-valuemin="64" aria-valuemax="320" aria-valuenow="' + RAILW + '"' + tipAttr(w("shell.width.holds"), 2) + "></button>";
    const tabs = TABS.map((k) => '<a href="' + (k === "more" ? "/app/more" : placeHref(k)) + '" data-nav'
      + ((place === k || (k === "more" && ["projects", "people", "settings", "more"].includes(place))) ? ' aria-current="page"' : "")
      + tipAttr(k === "more" ? w("tab.more.holds") : w("rail." + k + ".holds"), 2) + ">" + I(RAIL_ICON[k]) + w(k === "more" ? "tab.more.name" : "rail." + k + ".name") + "</a>").join("");
    const dock = dockHtml();
    const band = '<div class="cs-band" data-band="working"><span tabindex="0"' + tipAttr(w("mark.band.means") + '<span class="why">' + w("mark.path.working.means") + "</span>", 1) + "><b>" + w("mark.path.working.name") + "</b></span></div>";
    const ask = ASK_LEVEL ? '<div class="cs-reason" role="region"><p>' + w("shell.level.ask", { level: html(w(LEVEL === "pause" ? "level.pause.name" : "level.prompt.name")) }) + "</p><div>"
      + '<button type="button" class="cs-btn" data-shell="level-keep">' + w("shell.level.keep") + "</button>"
      + '<button type="button" class="cs-btn" data-tone="quiet" data-shell="level-switch">' + w("shell.level.switch", { level: html(w(LEVEL === "pause" ? "level.prompt.name" : "level.pause.name")) }) + "</button></div></div>" : "";
    return '<div class="cs-frame cs-shell' + (dock ? " with-dock" : "") + (RAILW < 120 ? " rail-icons" : "") + '" data-frame="working" id="cs-frame" style="--rail:' + RAILW + 'px">'
      + mastHtml() + band + '<nav class="cs-rail" aria-label="' + w("shell.sections") + '">' + rail + "</nav>"
      + '<main class="cs-main" id="cs-main">' + ask + mainHtml(route) + "</main>" + dock
      + '<nav class="cs-tabs" aria-label="' + w("shell.sections") + '">' + tabs + "</nav></div>";
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
    : ["data-shell", "data-ai", "data-table", "data-id", "data-col", "data-theme-to"].map((a) => (el.getAttribute(a) !== null ? "[" + a + '="' + el.getAttribute(a) + '"]' : "")).join("") || null);
  function draw() {
    if (GONE) return;
    const root = doc.getElementById("cs-root");
    if (!root || !ROUTE) return;
    closeTip();
    const values = {};
    for (const el of root.querySelectorAll("input, textarea, select")) if (el.id && el.type !== "file") values[el.id] = el.type === "checkbox" || el.type === "radio" ? { checked: el.checked } : { value: el.value };
    const fk = focusKey(doc.activeElement);
    root.innerHTML = frameHtml(ROUTE);
    absorb(root);
    for (const [id, v] of Object.entries(values)) {
      const el = doc.getElementById(id);
      if (!el || el.getAttribute("data-shell") === "pick") continue;
      if ("checked" in v) el.checked = v.checked; else el.value = v.value;
    }
    if (fk) { let el = null; try { el = root.querySelector(fk); } catch { el = null; } if (el && el.focus) el.focus(); }
    if (GROUP) doc.title = GROUP;
  }

  /* ---------- navigation ---------- */
  function navigate(href, replace) {
    if (replace) win.history.replaceState({}, "", href); else win.history.pushState({}, "", href);
    route();
  }
  /* R21 (K2998): a screen's `closed(cs, view)` when the member leaves it or the page */
  function closing(inst) {
    if (!inst || typeof inst.spec.closed !== "function") return;
    try { inst.spec.closed(kit(inst), inst.view); } catch { /* a screen's own leave-taking never stops the shell */ }
  }
  function route() {
    closing(MAIN);
    closing(DOCKI);
    ROUTE = parse(win.location.pathname);
    MENU = false;
    if (!wordsRead && wordsRetry && ME) { wordsRetry = false; loadWords(); }
    const spec = screenOf(ROUTE.screen);
    MAIN = spec && spec.id !== "assistant" ? instance(spec, ROUTE.subject, "m") : null;
    DOCKI = REACHABLE && screenOf("assistant") ? instance(screenOf("assistant"), ROUTE.subject, "d", { screen: ROUTE.screen, subject: ROUTE.subject }) : null;
    draw();
    if (MAIN && ME) readAll(MAIN);
    if (DOCKI && DOCK && ME) readAll(DOCKI);
    if (doc.getElementById("cs-main") && doc.getElementById("cs-main").scrollTo) doc.getElementById("cs-main").scrollTo(0, 0);
  }

  /* ---------- acts: friction (R11), sending, refusals beside the act (R13) ---------- */
  const instOf = (k) => (k === "m" ? MAIN : k === "d" ? DOCKI : null);
  function slotOf(ai) { return doc.getElementById("cs-root").querySelector('[data-slot="' + ai + '"]'); }
  function besideAct(ai, inner) { const s = slotOf(ai); if (s) s.innerHTML = inner; }
  const refusalHtml = (words) => '<span class="cs-gap" data-gap="refused" role="alert">' + I("refused") + "<span>" + words + "</span></span>";
  function press(btn) {
    const ai = btn.getAttribute("data-ai");
    const [k, i] = String(ai).split(":");
    const inst = instOf(k);
    const d = inst && inst.acts[Number(i)];
    if (!d) return;
    const weight = weightOf(d.op);
    if (weight === "reversible") return run(inst, d, btn, ai, {});
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
      + w(weight === "signed" ? "shell.dialog.signed" : "shell.dialog.signs", { handle: ME.handle || "" }) + "</p>" + fields + '<span class="cs-actrow">'
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
    if (extra.reason !== undefined) {
      if (req.raw !== undefined) req.query = Object.assign({}, req.query, { [d.spec.reasonField || "reason"]: extra.reason });
      else req.body = Object.assign({}, req.body || {}, { [d.spec.reasonField || "reason"]: extra.reason });
    }
    besideAct(ai, "");
    const a = await call(d.op, req);
    if (a.kind !== "ok") {
      const words = a.kind === "refused" ? refusalWords(a, d.spec.refusals) : w("state.failed", { reason: html(w("shell.noanswer")) });
      return besideAct(ai, refusalHtml(words));
    }
    let after = null;
    try { after = d.spec.done ? d.spec.done(inst.view, a.value, kit(inst)) : null; } catch { after = null; }
    if (after && after.stay) return draw();
    if (inst === MAIN || inst === DOCKI) readAll(inst, d.spec.rereads || null);
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
  function bind() {
    const root = doc.getElementById("cs-root");
    root.addEventListener("click", (e) => {
      const t = e.target;
      const nav = t.closest ? t.closest("a[data-nav]") : null;
      if (nav && !(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)) { e.preventDefault(); return navigate(nav.getAttribute("href")); }
      const act = t.closest ? t.closest("button[data-act]") : null;
      if (act) return press(act);
      const sh = t.closest ? t.closest("[data-shell]") : null;
      if (sh) return shell(sh, e);
      const tipped = t.closest ? t.closest("[data-tip]") : null;
      if (tipped && !tipped.matches("a,button,input,select,textarea")) openTip(tipped);
    });
    root.addEventListener("change", (e) => { const sh = e.target.closest ? e.target.closest('[data-shell="pick"]') : null; if (sh) shell(sh, e); });
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
      const g = e.target.closest ? e.target.closest('[data-shell="grip"]') : null;
      if (g && ["ArrowLeft", "ArrowRight", "Home"].includes(e.key)) {
        e.preventDefault();
        RAILW = e.key === "Home" ? RAIL_DEFAULT : clampW(RAILW + (e.key === "ArrowRight" ? 8 : -8));
        local.set("cs-railw", String(RAILW));
        draw();
      }
      const row = e.target.closest ? e.target.closest('[data-shell="row"]') : null;
      if (row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); shell(row, e); }
    });
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeTip(); if (MENU) { MENU = false; draw(); } }
      if (e.altKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.code === "KeyI")) { e.preventDefault(); setLevel(LEVEL === "prompt" ? "pause" : "prompt"); }
    });
    win.addEventListener("popstate", () => route());
    win.addEventListener("pagehide", () => { closing(MAIN); closing(DOCKI); });
    if (mq && mq.addEventListener) mq.addEventListener("change", () => draw());
    win.addEventListener("beforeprint", () => doc.documentElement.setAttribute("data-theme", "light"));
    win.addEventListener("afterprint", () => applyTheme());
  }
  function shell(el, e) {
    const what = el.getAttribute("data-shell");
    const inst = MAIN;
    const table = el.getAttribute("data-table"), id = el.getAttribute("data-id");
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
  /* R4: sign out, whatever the answer */
  async function signOut() {
    try { await call("signout", { body: {} }); } catch { /* whatever the answer */ }
    gone();
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
    const [g, q, lv] = await Promise.all([call("groupidentity"), call("queue", { query: { limit: 500 } }), call("infolevel")]);
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
    const on = st.kind === "ok" && st.value && st.value.on === true;
    const own = ref.kind === "ok" && ref.value && ref.value.held === true;
    const signed = sub.kind === "ok" && sub.value && sub.value.connected === true;
    const group = gk.kind === "ok" && gk.value && gk.value.on === true && gk.value.held !== false;
    const was = REACHABLE;
    REACHABLE = !!(on && (own || signed || group));
    if (REACHABLE !== was) {
      DOCKI = REACHABLE && screenOf("assistant") && ROUTE ? instance(screenOf("assistant"), ROUTE.subject, "d", { screen: ROUTE.screen, subject: ROUTE.subject }) : null;
      if (!REACHABLE) DOCK = false;
      draw();
      if (MAIN) readAll(MAIN);
    }
  }
  async function start() {
    applyTheme();
    S = readSession();
    if (!S) return gone();
    ROUTE = parse(win.location.pathname);
    bind();
    draw();
    const who = await call("whoami");
    if (GONE) return;
    if (who.kind !== "ok" || !who.value || !who.value.session || !who.value.member) return gone();
    ME = who.value;
    await loadWords();
    route();
    wordsRetry = !wordsRead;
    await Promise.all([loadFrame(), loadReach()]);
  }
  return { start, state: () => ({ ME, ROUTE, LEVEL, THEME, RAILW, REACHABLE, DOCK, TODO, GROUP, MAIN, DOCKI }), absorb, date, w };
}

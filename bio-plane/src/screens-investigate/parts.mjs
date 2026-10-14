/* screens-investigate: the small readers every screen of the module shares, handed to each screen as `view.parts`
 * (interface-shell R21, K3002: each part self-contained, serialised by the shell beside the screen's functions). Each
 * takes what it needs as parameters, never another part, so its text alone is its whole meaning. */

export const PARTS = Object.freeze({
  /** A refusal drawn in words beside what it answers (interface-shell R13): its translation, else the code. */
  said(cs, f) {
    const words = f && f.translation ? cs.esc(f.translation) : cs.w("state.failed", { reason: (f && f.code) || cs.w("shell.noanswer") });
    return `<p class="cs-refusal" role="alert" data-refusal="${cs.esc((f && f.code) || "")}">${words}</p>`;
  },
  /** A read made as the screen draws, once per key: its outcome, in R10's four states, kept in the screen's memory
   *  (`view.ui.later`) and drawn on arrival. A refusal (the plane's `ok: false` or explore's `refused`) is `failed`. */
  later(cs, view, key, op, o) {
    const L = view.ui.later || (view.ui.later = {});
    const q = JSON.stringify(o || {});
    if (!L[key] || L[key].q !== q) {
      L[key] = { q, state: "loading", value: null, refusal: null };
      const settle = (x) => { L[key] = Object.assign({ q }, x); cs.set("later", L); };
      cs.call(op, o || {}).then((a) => {
        const r = a && typeof a === "object" && a.result !== undefined ? a.result : a;
        const bad = !a || a.ok === false || (r && typeof r === "object" && (r.ok === false || typeof r.refused === "string"));
        if (bad) {
          const f = !a ? {} : a.ok === false ? a : r;
          const code = String(f.code || f.reason || f.refused || "");
          const t = f.translation || f.why || null;
          settle({ state: "failed", value: null, refusal: { code, words: t ? cs.esc(t) : cs.esc(code || cs.w("shell.noanswer")) } });
        } else settle({ state: "ok", value: r, refusal: null });
      }, () => settle({ state: "failed", value: null, refusal: { code: "", words: cs.w("shell.noanswer") } }));
    }
    return L[key];
  },
  /** The page clock's calendar day, `YYYY-MM-DD` (the shell's `cs.now()`, the harness's fake clock in tests). */
  today(cs) {
    return new Date(cs.now()).toISOString().slice(0, 10);
  },
  /** A passage the member names: a capture's SHA-256 and, optionally, its page (counted from 1), in content's extent
   *  grammar (a PDF page counted from 0, else the whole document). */
  passage(sha, page) {
    const s = String(sha || "").trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(s)) return null;
    const n = Number(String(page || "").trim());
    return { captureSha: s, extent: Number.isInteger(n) && n > 0 ? { kind: "pdf-page", page: n - 1 } : { kind: "document" } };
  },
  /** A record id drawn as a reference to its screen (interface-shell R16): a person or organisation the record follows
   *  opens `person`, a document, capture, question or project its own; anything else carries its card only. */
  refOf(cs, id, label, facts, kind) {
    const s = String(id || "");
    const k = kind || (/^ENT-/.test(s) ? "person" : /^[0-9a-f]{64}$/.test(s) ? "capture" : /^(INFO|INF)-/.test(s) ? "document"
      : /^INQ-/.test(s) ? "question" : /^PROJ-/.test(s) ? "project" : "record");
    return cs.ref(k, s, label || s, facts || []);
  },
  /** A record document's front matter: its top-level scalars, and its `references` as `{target, rel, status}`. */
  front(text) {
    const out = { refs: [] };
    if (typeof text !== "string") return out;
    const head = text.replace(/^---\s*\n/, "").split(/\n---\s*(\n|$)/)[0];
    let inRefs = false, cur = null;
    for (const line of head.split("\n")) {
      if (/^references:\s*$/.test(line)) { inRefs = true; continue; }
      if (inRefs && /^\s+-\s*/.test(line)) { cur = {}; out.refs.push(cur); }
      if (inRefs && /^\s+/.test(line) && cur) {
        const m = /^\s+(?:-\s*)?(\w+):\s*(.*)$/.exec(line);
        if (m) cur[m[1]] = m[2].trim();
        continue;
      }
      inRefs = false;
      const m = /^(\w+):\s*(.*)$/.exec(line);
      if (m) {
        let v = m[2].trim();
        try { if (v.startsWith("\"")) v = JSON.parse(v); } catch { /* the raw value is kept */ }
        out[m[1]] = v;
      }
    }
    return out;
  },
  /** A date known only by its month (`YYYY-MM`): its month's name, as `date.month.*` holds it (interface-shell R6). */
  month(cs, ym) {
    const m = /^(\d{4})-(\d{2})$/.exec(String(ym || ""));
    if (!m) return null;
    const names = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const n = Number(m[2]) - 1;
    return n >= 0 && n < 12 ? { month: cs.w("date.month." + names[n]), year: m[1] } : null;
  },
});

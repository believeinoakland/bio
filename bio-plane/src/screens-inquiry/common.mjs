/* screens-inquiry: the readers the screens share, each self-contained (interface-shell R21 (1)) and handed to a screen as
 * its `parts` (interface-shell R21, K3002), so the served page carries each once by its own text and no screen copies
 * it. None draws a word. */

/** A record document's front matter and body, as the record grammar writes it: top-level scalars (a quoted value
 *  JSON-read); a key with no value followed by `  - k: v` items as a list of maps (`references`, `basis`, `grounds`);
 *  one followed by `  k: v` lines as a map (`source`); and, from the body, the `## Question` text and the Session Log's
 *  regroupings (`### Session <at> | Grouped|Restructured | <who>`, with their `Reason:` and `Strength before:` lines). */
export function front(text) {
  const out = { lists: {}, maps: {}, question: "", log: [] };
  if (typeof text !== "string") return out;
  const val = (v) => { v = String(v).trim(); try { if (v.startsWith("\"")) v = JSON.parse(v); } catch { /* raw */ } return v; };
  const head = text.replace(/^---\s*\n/, "").split(/\n---\s*(\n|$)/)[0];
  let key = null, cur = null;
  for (const line of head.split("\n")) {
    const top = /^(\w+):\s*(.*)$/.exec(line);
    if (top) {
      key = top[2].trim() === "" ? top[1] : null;
      cur = null;
      if (!key) out[top[1]] = top[2].trim() === "[]" ? [] : val(top[2]);
      continue;
    }
    if (!key) continue;
    const item = /^\s+-\s+(\w+):\s*(.*)$/.exec(line);
    if (item) {
      cur = {};
      (out.lists[key] || (out.lists[key] = [])).push(cur);
      cur[item[1]] = val(item[2]);
      continue;
    }
    const sub = /^(\s+)(\w+):\s*(.*)$/.exec(line);
    if (sub && cur && sub[1].length >= 4) cur[sub[2]] = val(sub[3]);
    else if (sub) (out.maps[key] || (out.maps[key] = {}))[sub[2]] = val(sub[3]);
  }
  const q = /\n## Question\s*\n+([\s\S]*?)(\n## |$)/.exec(text);
  out.question = q ? q[1].trim() : "";
  const log = /\n## Session Log\s*\n([\s\S]*?)(\n## (?!#)|$)/.exec(text);
  if (log) for (const part of log[1].split(/\n(?=### Session )/)) {
    const h = /^### Session (\S+) \| (Grouped|Restructured) \| (.+)$/m.exec(part);
    if (!h) continue;
    const reason = /^Reason:\s*(.*)$/m.exec(part);
    const before = /^Strength before:\s*(.*?)\.?\s*$/m.exec(part);
    out.log.push({ at: h[1], act: h[2], who: h[3].trim(), reason: reason ? reason[1].trim() : "", before: before ? before[1].trim() : "" });
  }
  return out;
}

/** A read the screen makes as it draws: once per key and query (and `token`, to read again), its outcome kept in the
 *  screen's memory and drawn on arrival. An answer `ok: false` (top level or in `result`) is failed, with its words;
 *  `found: false` is empty. A refusal keeps its answer's fields (a project seen only to exist names its `name` and
 *  `owners`). */
export function later(cs, ui, key, op, query, token) {
  const L = ui.later || (ui.later = {});
  const q = JSON.stringify(query) + "#" + (token || "");
  if (!L[key] || L[key].q !== q) {
    L[key] = { q, state: "loading" };
    const settle = (o) => { L[key] = Object.assign({ q }, o); cs.set("later", L); };
    cs.call(op, { query }).then((a) => {
      const r = a && a.result !== undefined ? a.result : a;
      if (!a || a.ok === false || (r && r.ok === false)) {
        const f = r && r.ok === false ? r : a || {};
        const code = String(f.code || f.reason || "");
        settle({ state: "failed", refusal: { code, words: cs.esc(f.translation || code), fields: f } });
      } else if (r && r.found === false) settle({ state: "empty" });
      else settle({ state: "ok", value: r });
    }, () => settle({ state: "failed", refusal: null }));
  }
  return L[key];
}

/** A word as plain text, for record-data options, a title and a fill (the kit escapes each once more). */
export function plain(cs, key, fills) {
  return String(cs.w(key, fills)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
}

/** A member as drawn (R40): her handle; the founder with no handle by `member.founder.unnamed`, never `admin`. */
export function who(cs, x) {
  if (x && typeof x === "object") {
    if (x.handle) return String(x.handle);
    if (x.founder === true) return String(cs.w("member.founder.unnamed")).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
    return "";
  }
  const s = String(x == null ? "" : x).replace(/^(member:|token:)/, "");
  return s === "admin" ? String(cs.w("member.founder.unnamed")).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])) : s;
}

/** The parts every screen of the module carries. */
export const COMMON = Object.freeze({ front, later, plain, who });

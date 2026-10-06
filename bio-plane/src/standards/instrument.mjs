/* standards — the instrument key (requirements: `build/requirements/standards.md`, R18, R21; K1446). Pure: nothing here
 * reads a store, the network or a clock. A key is shaped like ELI's work identifier, `/eli/<jurisdiction>/<issuer>/<number>`,
 * and is composed ONLY from profile data (`jurisdictions` R50): the view's `instrument_key.jurisdiction` segment, the
 * matched `standard_sources` entry's `key` segment and the instrument's own number or section path as the cite states
 * it. A source with no `key`, a view with no `instrument_key`, or no active profile answers the key undetermined with
 * why: no place is named in code (R13, `layers.md` rule 1). */

const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const SEGMENT = /^[a-z0-9][a-z0-9-]*$/;
/* The number at the end of what a citation pattern matched: digits first, then letters, digits, `.` or `-` (a section
   path such as 12-3 or 2024-7), any parenthesised subsection markers after it dropped (they name a portion, R18). */
const TRAILING_NUMBER = /(\d[\w.\-]*)\s*(?:\([^()]{1,12}\)\s*)*$/u;

/** The first `standard_sources` entry whose `cite` pattern matches `cite`, with what it matched; null for none. */
export function matchSource(view, cite) {
  const entries = isObj(view) && Array.isArray(view.standard_sources) ? view.standard_sources : [];
  const text = String(cite ?? "");
  for (const e of entries) {
    let m = null;
    try { m = e && e.cite ? new RegExp(e.cite.re, e.cite.flags || "").exec(text) : null; } catch { m = null; }
    if (m) return { entry: e, matched: m[0], index: m.index };
  }
  return null;
}

/** The `vocabulary.codes` entry a source names, or null. */
export function codeOf(view, source) {
  const codes = isObj(view) && isObj(view.vocabulary) && Array.isArray(view.vocabulary.codes) ? view.vocabulary.codes : [];
  return source && typeof source.code === "string" ? codes.find((c) => c && c.key === source.code) || null : null;
}

/* The instrument's own number or section path as `text` states it: a code's section-number pattern when the source
   names a code that states one, else the number ending what the source's pattern matched. Lower-cased, white space
   removed; null when the text states none. */
function numberIn(view, source, text, matched) {
  const code = codeOf(view, source);
  const pattern = code && isObj(code.sections) && isObj(code.sections.number) ? code.sections.number : null;
  if (pattern) {
    try {
      const m = new RegExp(pattern.re, (pattern.flags || "").replace(/g/g, "")).exec(text);
      if (m) return m[0].replace(/\s+/g, "").toLowerCase();
    } catch { /* an unreadable pattern states nothing */ }
  }
  const m = TRAILING_NUMBER.exec(String(matched ?? "").trim());
  return m ? m[1].replace(/[.\-]+$/, "").toLowerCase() || null : null;
}

/* A key from its three segments; undetermined with why when the view or the source states one not. */
function compose(view, source, number) {
  const ik = isObj(view) && isObj(view.instrument_key) ? view.instrument_key : null;
  if (!ik || typeof ik.jurisdiction !== "string" || !SEGMENT.test(ik.jurisdiction))
    return { state: "undetermined", key: null,
             why: "the active jurisdiction profiles state no instrument_key segment, so no instrument key is composed" };
  if (!source || typeof source.key !== "string" || !SEGMENT.test(source.key))
    return { state: "undetermined", key: null,
             why: `the source ${source ? `'${source.source}' ` : ""}states no key segment, so no instrument key is composed` };
  if (!number) return { state: "undetermined", key: null, why: "the citation states no number or section path" };
  return { state: "composed", key: `/eli/${ik.jurisdiction}/${source.key}/${number}`, source: source.source,
           basis: [ik.basis, source.basis].filter(Boolean).join("; ") };
}

/** R18: `instrumentKey({cite, view})` → `{state: "composed", key, source, basis}` or `{state: "undetermined", key:
 *  null, why}`. The source is R3's first match; no view, no match, a source with no `key` or a cite with no number is
 *  undetermined. Never throws. */
export function instrumentKey({ cite = null, view = null } = {}) {
  try {
    if (!isObj(view)) return { state: "undetermined", key: null, why: "no active jurisdiction profile, so no instrument key is composed" };
    const m = matchSource(view, cite);
    if (!m) return { state: "undetermined", key: null,
                     why: "the citation matches the citation form of no source the active jurisdiction profiles list" };
    return compose(view, m.entry, numberIn(view, m.entry, String(cite), m.matched));
  } catch {
    return { state: "undetermined", key: null, why: "the citation could not be read for an instrument key" };
  }
}

/** R21: the instrument key a reading's reference names, with how it was read, or null. A `code_section` reference
 *  (`<code>:<section>`, `doctypes`' reading) names the source whose `code` is that code; any other reference is read
 *  as a citation through R3's patterns, over its label, then its key, then the reference itself. Never throws. */
export function referenceKey(view, ref) {
  try {
    if (!isObj(view) || !isObj(ref)) return null;
    if (ref.ref_kind === "code_section" && typeof ref.ref_key === "string") {
      const i = ref.ref_key.indexOf(":");
      const code = i > 0 ? ref.ref_key.slice(0, i) : null, section = i > 0 ? ref.ref_key.slice(i + 1).trim() : "";
      const source = (Array.isArray(view.standard_sources) ? view.standard_sources : []).find((s) => s && s.code === code);
      const k = source && section ? compose(view, source, section.replace(/\s+/g, "").toLowerCase()) : null;
      if (k && k.state === "composed") return { key: k.key, how: "code_section" };
    }
    for (const text of [ref.label, ref.ref_key, ref.ref]) {
      if (typeof text !== "string" || !text.trim()) continue;
      const k = instrumentKey({ cite: text, view });
      if (k.state === "composed") return { key: k.key, how: "instrument_key" };
    }
    return null;
  } catch { return null; }
}

/** R19: the copy status a source's code states (`jurisdictions` R6), or `undetermined` when it states none. */
export function sourceCopy(view, source) {
  const code = codeOf(view, source);
  return code && ["official", "codifier", "undetermined"].includes(code.copy) ? code.copy : "undetermined";
}

/** The fold two citations are compared on: trimmed, white space collapsed, lower-cased. */
export const foldCite = (s) => String(s ?? "").trim().replace(/\s+/g, " ").toLowerCase();

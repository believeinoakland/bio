// @ts-check
/* record-grammar: the restricted front-matter parser (R6–R11), with the core fields and forbidden aliases it
   recovers buried keys by (R10). Moved from the check catalogue at T18 with its comments. */

/**
 * @typedef {{check: string, severity: 'error'|'warn'|'info', message: string, repairable?: boolean, repairs?: string[]}} Finding
 */

/** Universal core fields (spec 3.1). */
export const CORE_FIELDS = [
  'id', 'object_type', 'schema', 'title', 'current_state', 'prior_state',
  'created', 'last_updated', 'produced_by', 'group', 'references',
  'state_history', 'annotations_open', 'reeval_pending', 'visuals'
];

/** Forbidden alias -> canonical (spec 3.3). */
export const FORBIDDEN_ALIASES = {
  status: 'current_state', state: 'current_state', pipeline_state: 'current_state',
  verdict: 'current_state', type: 'object_type', updated: 'last_updated', modified: 'last_updated'
};

/** A finding (R11): `repairable` and `repairs` only when a repair is named. The catalogue's own `f` also carries
 *  REC-56's optional `code`; no finding here has one.
 * @returns {Finding} */
function f(check, severity, message, repairs) {
  /** @type {Finding} */
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  return out;
}

const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* A key is written as an OWN data property, so `__proto__` in a document is a key like any other and never reaches
   the object's prototype. */
function put(o, k, v) {
  Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true });
}

// ---------------------------------------------------------------------------
// Restricted-grammar frontmatter parser (spec 2.2, 3.3)
// Grammar: '---' fences; top-level keys at column 0; one-level maps at 2 spaces;
// arrays of scalars or of objects ('- ' at 2 spaces, object props at 4 spaces);
// inline [] arrays; optional '# ' comments after values; double or single quotes.
// ---------------------------------------------------------------------------

function stripComment(raw) {
  let inS = false, inD = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === '#' && !inS && !inD && (i === 0 || raw[i - 1] === ' ')) return raw.slice(0, i);
  }
  return raw;
}

function parseScalar(raw) {
  let v = stripComment(raw).trim();
  if (v === '') return '';
  if (v === 'null' || v === '~') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  /* Wrapped means two quote characters: a lone `"` or `'` is the string it is (R8). */
  if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) return v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (inner === '') return [];
    return inner.split(',').map(s => parseScalar(s));
  }
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

/**
 * Parse bundle.md frontmatter under the restricted grammar.
 * @param {string} text full bundle.md content
 * @returns {{data: Record<string, any>|null, findings: Finding[], body: string}}
 */
export function parseFrontmatter(text) {
  if (typeof text !== 'string') throw new TypeError('parseFrontmatter: text must be a string');
  /** @type {Finding[]} */
  const findings = [];
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') {
    findings.push(f('C-2.1', 'error', 'bundle.md does not begin with a --- frontmatter fence'));
    return { data: null, findings, body: text };
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) if (lines[i] === '---') { end = i; break; }
  if (end === -1) {
    findings.push(f('C-2.1', 'error', 'frontmatter fence is never closed'));
    return { data: null, findings, body: text };
  }

  /** @type {Record<string, any>} */
  const data = {};
  let topKey = null;          // current open block key ('key:' with no value)
  let topMode = null;         // 'map' | 'array' | null (undecided)
  let curElem = null;         // current array element object

  const keyLine = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
  const indKeyLine = /^( +)([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
  const itemLine = /^( +)- (.*)$/;

  for (let n = 1; n < end; n++) {
    const line = lines[n];
    const stripped = stripComment(line);
    if (stripped.trim() === '') continue;

    let m;
    if ((m = keyLine.exec(line))) {                     // column-0 key
      const key = m[1];
      const rest = m[2];
      topKey = null; topMode = null; curElem = null;
      if (own(data, key)) {
        findings.push(f('C-2.1', 'error', `duplicate top-level key '${key}' at line ${n + 1}`));
      }
      if (stripComment(rest).trim() === '') {           // block start
        topKey = key; put(data, key, undefined);        // decided by first child
      } else {
        put(data, key, parseScalar(rest));
      }
    } else if ((m = itemLine.exec(line))) {             // '- ' array item
      const indent = m[1].length;
      const rest = m[2];
      if (!topKey) {
        findings.push(f('C-2.1', 'error', `array item outside any block at line ${n + 1}`));
        continue;
      }
      if (indent !== 2) findings.push(f('C-2.1', 'error', `array item indented ${indent} (expected 2) at line ${n + 1}`));
      if (topMode === null) { topMode = 'array'; put(data, topKey, []); }
      if (topMode !== 'array') { findings.push(f('C-2.1', 'error', `array item inside a map block '${topKey}' at line ${n + 1}`)); continue; }
      const km = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/.exec(rest);
      if (km && stripComment(km[2]).trim() !== '') {    // object element: '- key: value'
        curElem = {}; put(curElem, km[1], parseScalar(km[2]));
        data[topKey].push(curElem);
      } else {                                          // scalar element
        curElem = null;
        data[topKey].push(parseScalar(rest));
      }
    } else if ((m = indKeyLine.exec(line))) {           // indented key
      const indent = m[1].length;
      const key = m[2];
      const rest = m[3];
      const isCore = CORE_FIELDS.includes(key) || own(FORBIDDEN_ALIASES, key);
      if (topKey && topMode === null && indent === 2) { // first child decides: map
        topMode = 'map'; put(data, topKey, {});
        put(data[topKey], key, parseScalar(rest));
      } else if (topKey && topMode === 'map' && indent === 2) {
        put(data[topKey], key, parseScalar(rest));
      } else if (topKey && topMode === 'array' && curElem && indent === 4) {
        put(curElem, key, parseScalar(rest));
      } else {
        // A key indented where the grammar has no slot for it: the Alpha buried-key failure mode.
        if (isCore) {
          findings.push(f('C-2.4', 'error',
            `top-level key '${key}' is buried by stray indentation at line ${n + 1} and will not register`,
            [`re-indent '${key}' to column 0`]));
          put(data, key, parseScalar(rest));            // recover for downstream checks
        } else {
          findings.push(f('C-2.1', 'error', `key '${key}' indented ${indent} does not fit the restricted grammar at line ${n + 1}`));
        }
      }
    } else {
      findings.push(f('C-2.1', 'error', `line ${n + 1} does not fit the restricted grammar: ${line.slice(0, 60)}`));
    }
  }

  // undecided empty blocks become empty arrays
  for (const k of Object.keys(data)) if (data[k] === undefined) data[k] = [];

  return { data, findings, body: lines.slice(end + 1).join('\n') };
}

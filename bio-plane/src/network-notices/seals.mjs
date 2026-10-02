/* network-notices — the pure part (requirements: `build/requirements/network-notices.md` R7, R14, R15, R16, R18):
 * UTC ISO weeks, the activity level's cut-offs, and the padded, salted Merkle seals with their openings.
 *
 * A seal commits to one week's member acts on one project. Each act is a leaf `{bundle, digest, operation, at, salt}`
 * (never its author), with its own random 256-bit salt. The leaves sit at random positions among a fixed number of
 * slots (`SEAL_SLOTS`, or the next power of two above it when a week holds more acts), and every other slot holds a
 * salted dummy derived from the seal's private secret, so the root says neither what the acts were nor how many. The
 * week's project seals are the leaves of a second tree of the same shape (`WEEK_SLOTS`), whose root is the one value
 * timestamped for the week (R15). An opening (R17) carries chosen leaves with their salts, their paths to the project
 * seal and the seal's path to the week root, and the timestamp response; `verifyOpening` checks it with nothing but
 * this file and `signatures.parseTimestampResponse`, so a stranger can check it without this instance (R18).
 *
 * Every hash is SHA-256, lowercase hex, over the UTF-8 of a tagged line: the tag keeps a leaf, a dummy and a node from
 * ever being taken for one another (`SEAL_METHOD` states the construction for a verifier written elsewhere). */
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { canonicalJson } from "../record-grammar/json.mjs";
import { parseTimestampResponse } from "../tsa.mjs";

/* ---------------------------------------------------------------- weeks (the Terms: a UTC ISO week) */

export const DAY_MS = 86400000;
export const WEEK_MS = 7 * DAY_MS;

/** The Monday 00:00Z that starts the UTC ISO week holding `ms`. */
export function weekStartOf(ms) {
  const d = Math.floor(Number(ms) / DAY_MS) * DAY_MS;
  const dow = (new Date(d).getUTCDay() + 6) % 7;            /* Monday 0 … Sunday 6 */
  return d - dow * DAY_MS;
}

/** The ISO week label `YYYY-Www` of the week starting at `start` (its Thursday names the year). */
export function weekLabel(start) {
  const thu = new Date(Number(start) + 3 * DAY_MS);
  const year = thu.getUTCFullYear();
  const jan4 = Date.UTC(year, 0, 4);
  const week = 1 + Math.round((weekStartOf(thu.getTime()) - weekStartOf(jan4)) / WEEK_MS);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** The start (ms) of the week a label names, or null for a label that is not one. */
export function weekStartFromLabel(label) {
  const m = typeof label === "string" ? /^(\d{4})-W(\d{2})$/.exec(label) : null;
  if (!m) return null;
  const start = weekStartOf(Date.UTC(Number(m[1]), 0, 4)) + (Number(m[2]) - 1) * WEEK_MS;
  return weekLabel(start) === label ? start : null;
}

/** The date `YYYY-MM-DD` (UTC) of `ms`. */
export const dateOf = (ms) => new Date(Number(ms)).toISOString().slice(0, 10);

/** `YYYY-MM-DD` that is a real calendar date, as milliseconds at its 00:00Z; null otherwise. */
export function parseDate(v) {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const ms = Date.parse(`${v}T00:00:00Z`);
  return Number.isFinite(ms) && dateOf(ms) === v ? ms : null;
}

/* ---------------------------------------------------------------- the activity level (R7, R9, R10) */

/** R9: the window, in complete weeks before `as_of`. */
export const ACTIVITY_WINDOW = 13;
/** R7: the five levels and their cut-offs, this module's constants, highest first: a level holds from `min` counted
 *  weeks up to the next level's `min`. */
export const ACTIVITY_LEVELS = Object.freeze([
  Object.freeze({ level: "Very active", min: 10, max: 13 }),
  Object.freeze({ level: "Active", min: 7, max: 9 }),
  Object.freeze({ level: "Some work", min: 4, max: 6 }),
  Object.freeze({ level: "Quiet", min: 1, max: 3 }),
  Object.freeze({ level: "Dormant", min: 0, max: 0 }),
]);
/** R10: the method's version; a change to the method is a new version. */
export const ACTIVITY_METHOD_VERSION = "civicos-working-on-activity/1";
/** R10: the method as fixed text with its version. */
export const ACTIVITY_METHOD = Object.freeze({
  version: ACTIVITY_METHOD_VERSION,
  window: `The ${ACTIVITY_WINDOW} complete UTC ISO weeks (Monday 00:00Z to the next Monday 00:00Z) before the date the `
    + "level is computed.",
  counted: "A week counts when it holds at least one member act on the project. How many acts a week holds never "
    + "changes the level; only whether it holds one does.",
  member_act: "A member act is a write to one of the project's records whose history entry names a member as its "
    + "author: not a machine, an automated process or a run of the assistant, and not a mechanical writer. A member's "
    + "adoption of a machine draft counts; the draft does not.",
  levels: ACTIVITY_LEVELS.map((l) => `${l.level}: ${l.min === l.max ? l.min : `${l.min} to ${l.max}`} counted weeks`),
  never_counted: "Never counted: the assistant's work, machine and mechanical writes, the number of acts in a week, "
    + "and anything outside the project's own records.",
});

/** R7: the level for a number of counted weeks. */
export function levelOf(weeksCounted) {
  const n = Math.max(0, Math.min(ACTIVITY_WINDOW, Math.trunc(Number(weeksCounted) || 0)));
  return ACTIVITY_LEVELS.find((l) => n >= l.min).level;
}

/* ---------------------------------------------------------------- the seals (R14–R18) */

/** The fewest slots a project's week seal and a week's root are padded to. */
export const SEAL_SLOTS = 1024;
export const WEEK_SLOTS = 256;
/** The construction, stated for a verifier written elsewhere (R18). */
export const SEAL_METHOD = Object.freeze({
  version: "civicos-working-on-seal/1",
  hash: "SHA-256, lowercase hex, over the UTF-8 bytes of the tagged line",
  leaf: "civicos-seal-leaf/1\\n + canonical JSON of {bundle, digest, operation, at, salt}",
  node: "civicos-seal-node/1\\n + left hash + right hash",
  week_leaf: "civicos-week-leaf/1\\n + the project seal",
  path: "siblings from the leaf upward; the leaf's position, read bit by bit from the lowest, says which side it is on",
});

const tagged = (tag, s) => sha256HexSync(`${tag}\n${s}`);
export const leafHash = (leaf) => tagged("civicos-seal-leaf/1", canonicalJson({
  bundle: leaf.bundle, digest: leaf.digest, operation: leaf.operation, at: leaf.at, salt: leaf.salt }));
export const nodeHash = (l, r) => tagged("civicos-seal-node/1", `${l}${r}`);
export const weekLeafHash = (seal) => tagged("civicos-week-leaf/1", seal);
const dummyHash = (secret, i) => tagged("civicos-seal-dummy/1", `${secret}\n${i}`);

/** The slot count for `n` leaves: `min`, or the next power of two at or above `n`. */
export function slotsFor(n, min) {
  let s = min;
  while (s < n) s *= 2;
  return s;
}

/** 256 random bits, hex. */
export function randomHex(bytes = 32) {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/** `n` distinct random positions in `[0, size)`. */
export function randomPositions(n, size) {
  const taken = new Set(), u = new Uint32Array(1);
  while (taken.size < n) {
    crypto.getRandomValues(u);
    taken.add(u[0] % size);
  }
  return [...taken];
}

/** The tree's levels, leaves first: `hashes` holds every slot's hash (`placed` at their positions, a dummy derived from
 *  `secret` in every other slot). */
export function treeOf(placed, size, secret) {
  const level = new Array(size);
  for (let i = 0; i < size; i++) level[i] = placed.has(i) ? placed.get(i) : dummyHash(secret, i);
  const levels = [level];
  for (let cur = level; cur.length > 1;) {
    const next = new Array(cur.length / 2);
    for (let i = 0; i < next.length; i++) next[i] = nodeHash(cur[2 * i], cur[2 * i + 1]);
    levels.push(next);
    cur = next;
  }
  return levels;
}
export const rootOf = (levels) => levels[levels.length - 1][0];
/** The siblings of slot `pos`, leaf level upward. */
export function pathOf(levels, pos) {
  const out = [];
  for (let l = 0, p = pos; l < levels.length - 1; l++, p >>= 1) out.push(levels[l][p ^ 1]);
  return out;
}
/** The root a hash at `pos` reaches through `path`. */
export function climb(hash, pos, path) {
  let h = hash, p = Number(pos);
  for (const s of path) { h = p & 1 ? nodeHash(s, h) : nodeHash(h, s); p >>= 1; }
  return h;
}

const HEX64 = /^[0-9a-f]{64}$/;
const b64ToBytes = (s) => { try { return Uint8Array.from(atob(String(s)), (c) => c.charCodeAt(0)); } catch { return null; } };

/** R18: PURE. Whether an opening's leaves hash to the project seal it names, whether that seal reaches the week root,
 *  and whether the timestamp response is bound to that root (`signatures.parseTimestampResponse`). Answers
 *  `{ok, leaves, seal, timestamp, detail}`: `leaves` true when every leaf climbs to the seal, `seal` true when the seal
 *  climbs to the week root, `timestamp` `"bound"`, `"not_bound"` or `"untimestamped"`; `ok` when all hold and the week
 *  is timestamped. Never throws. */
export function verifyOpening(opening) {
  try {
    const o = opening && typeof opening === "object" ? opening : null;
    if (!o || !HEX64.test(o.seal) || !HEX64.test(o.week_root) || !Array.isArray(o.leaves))
      return { ok: false, leaves: false, seal: false, timestamp: "not_bound", detail: "not an opening" };
    const okPath = (p, size) => Array.isArray(p) && 2 ** p.length === size && p.every((x) => HEX64.test(x));
    const leaves = o.leaves.length > 0 && o.leaves.every((x) => x && x.leaf && Number.isInteger(x.position)
      && x.position >= 0 && x.position < o.size && okPath(x.path, o.size)
      && climb(leafHash(x.leaf), x.position, x.path) === o.seal);
    const seal = Number.isInteger(o.seal_position) && okPath(o.seal_path, o.week_size)
      && climb(weekLeafHash(o.seal), o.seal_position, o.seal_path) === o.week_root;
    let timestamp = "untimestamped";
    if (o.timestamp) {
      const bytes = b64ToBytes(o.timestamp);
      timestamp = bytes && parseTimestampResponse(bytes, o.week_root).ok ? "bound" : "not_bound";
    }
    const ok = leaves && seal && timestamp === "bound";
    return { ok, leaves, seal, timestamp,
             detail: ok ? "every leaf hashes to the sealed root, and the timestamp is bound to the week's root"
               : !leaves ? "a leaf does not hash to the project's seal" : !seal ? "the seal does not reach the week's root"
               : timestamp === "untimestamped" ? "the leaves hash to the sealed root; the week was not timestamped"
               : "the timestamp is not bound to the week's root" };
  } catch {
    return { ok: false, leaves: false, seal: false, timestamp: "not_bound", detail: "not an opening" };
  }
}

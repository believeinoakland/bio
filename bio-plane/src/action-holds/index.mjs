/* action-holds — the group's litigation holds and the pressure it receives (requirements:
 * `build/requirements/action-holds.md`; `BIO_Action_v0_2.md` §4 rules 1, 10, 12; Actions D10). A member marks pressure
 * on a received entry or records pressure that arrived outside any action; any member who can see an action, an entry
 * of one or a project places a hold there with a reason, and releases it; a hold stops a purge of what it covers (R9),
 * a scheduled publication (R10, through `ratification`) and a doorbell clearance (R4); a member records that she sent
 * the hold notice (R11). A machine does none of it (R13), and nothing here records whether any member received, read or
 * complied with a notice (rule 10).
 *
 * Split from `actions` (T45; K2781 (1), K617, K624: copy, then `actions` deletes its copy in T45-27): `actionPressure`,
 * the hold acts and reads and the two registrations are `actions`' R48, R52, R54–R60 and R69, copied with their
 * comments and renumbered (R48 → R1, R52 → R2, R54 → R3, R55 → R4, R56 → R5, R57 → R6, R58 → R7, R59 → R8, R60 → R9,
 * R69 → R10); places, `from`, the docket and pressure-record arms of `holdsDue`, the hold notice (R11) and pressure
 * records (R12) are new.
 *
 * REACHED as `actionHoldsOf(host, deps)` (K61): one instance per host, created on the first call. At creation it creates
 * its tables and declares them to record-core's purge (R13), and registers its litigation-hold reader with doorbell (R4;
 * doorbell R3) and its reader of the holds over a project with ratification (R10; ratification R45). In the copy window
 * (reconciliation R19) `actions` holds both registrations and the first three tables' purge declaration; a refusal
 * naming `actions` as the holder leaves `actions`' standing, so one registration stands at any time.
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership   `transact`, `stampInstant`, `bundleInfo`, `readFile`, `declarePurge`; `viewerPredicate`,
 *                        `sight`, `visibilityOf`, `existenceAct`, `noSuchProject` (R2, R6–R8, R12).
 *   docket               `docketPressureOf`, `docketPressureMarks` (its R27; R2, R3).
 *   roster               project-roster's `projectScope` (its R23; R2's counsel matter).
 *   doorbell             `registerReader` (its R3): the litigation-hold reader (R4); `null` registers none.
 *   ratification         `registerHoldReader` (its R45): the reader of holds over a project (R10); `null` registers none.
 *   now, env             the instance clock (milliseconds; default `env.BIO_NOW_MS`, else the wall clock).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`) and `files`, its R37;
 * provenance's `register` (`capture_sha`), its R48; publication's `cases` (`case_id`, `project_id`), its R40. */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, noSuchProject } from "../membership/index.mjs";
import { docketOf } from "../docket/index.mjs";
import { projectRosterOf } from "../project-roster/index.mjs";
import { doorbellOf } from "../doorbell/index.mjs";
import { ratificationOf } from "../ratification/index.mjs";
import { isCalendarDate } from "../civil-time/index.mjs";
import { parseFrontmatter, normalizeType, isMachineIdentity, BUNDLE_ID_RE } from "../record-grammar/index.mjs";
import { ACTION_ACT_CHECKS, ACTION_CATALOGUE_CHECKS } from "../action-grammar/index.mjs";
import { ACTION_HOLDS_CHECKS } from "./checks.mjs";
import { ACTION_HOLDS_TABLES, COPIED_TABLES, migrateActionHolds } from "./schema.mjs";

export { ACTION_HOLDS_SCHEMA, ACTION_HOLDS_TABLES } from "./schema.mjs";
export { ACTION_HOLDS_CHECKS } from "./checks.mjs";

/** R1, R2, R11, R12: the longest note, reason, account or medium (`actions`' `NOTE_MAX`). */
export const NOTE_MAX = 500;
/** R1 (K597 (1)): the kinds of pressure a received entry, or a pressure record, may be marked with. */
export const PRESSURE_KINDS = Object.freeze(["legal", "retaliation", "discrediting", "other"]);
/** R2 (K899 (7), DEC-61): what a litigation hold is stated as. */
export const HOLD_STATES = Object.freeze(["in_place", "released"]);
/** R2 (T45): what may prompt a hold (its `from`). */
export const HOLD_FROM_KINDS = Object.freeze(["mark", "pressure", "docket_entry", "counsel_matter"]);
/** R3: the most items one `holdsDue` page lists. */
export const HOLDS_DUE_MAX = 500;
/** R8: the most statements one `holdsReleased` page lists. */
export const HOLDS_RELEASED_MAX = 500;
/** R12: the most items one `pressureFor` page lists. */
export const PRESSURE_PAGE_MAX = 500;
/** R2, R7 (DEC-113): the most distinct projects one hold statement names, and one `projectHolds` read asks. */
export const HOLD_PROJECTS_MAX = 50;
/* R2: a project's id, a bundle id of the project prefix. */
const PROJECT_ID_RE = { test: (x) => BUNDLE_ID_RE.test(x) && x.startsWith("PROJ-") };
/* R2, R12: a pressure record's name, `<project>#pressure/<seq>`. */
const PRESSURE_REF_RE = /^(PROJ-[^#\s]+)#pressure\/([1-9]\d*)$/;
/* R2: the position stored for a whole action or a project (no entry). */
const WHOLE = -1;

/* R2, R5, R6 (DEC-113): which hold act `actionHold`'s body runs (`hold`, `release` or `preview`). A Symbol, so no
   request can carry one: the release and the preview reach that body only through their own methods. */
const HOLD_MODE = Symbol("dec113-hold-mode");

/* The catalogue-backed refusals: each carries its code, check and translation. This module's own rows (C-149) win over
   `action-grammar`'s for a code both hold (the moved rows, in the copy window). */
const ROWS = Object.assign({}, ACTION_ACT_CHECKS, ACTION_CATALOGUE_CHECKS, ACTION_HOLDS_CHECKS);
export function withRow(r) {
  if (!r || typeof r !== "object" || r.ok !== false || typeof r.reason !== "string") return r;
  const row = ROWS[r.reason];
  if (!row) return r;
  return { ...r, code: r.code ?? r.reason, check: r.check ?? row.check, translation: r.translation ?? row.translation };
}
const refuse = (code, detail, extra) => withRow({ ok: false, reason: code, detail, ...(extra || {}) });

/* R11 (K231, K2848). THE ONE ANSWER TO ONE CONDITION: the hold at a place is not in place (none placed, or released), so
   no hold notice is recorded for it. This module's `holdNoticeSent` answers it through here, and so does `filings` R47
   (the notice's text), so `HOLD_NOT_IN_PLACE` is minted at one site with its one row (C-149.11). `place` is R2's
   (`{target, ord?}`, `{project}` or `{case}`); its keys are answered beside the row as given, each a string or a whole
   number, and nothing else of it. The detail is one fixed sentence. Writes nothing and never throws. */
const HOLD_NOT_IN_PLACE_DETAIL = "a hold notice is recorded for a hold in place, and the hold at this place is not in place: "
  + "none has been placed there, or it was released. Nothing was written.";
export function holdNotInPlace(place = null) {
  let keys = {};
  try {
    const p = place && typeof place === "object" && !Array.isArray(place) ? place : {};
    for (const k of ["target", "ord", "project", "case"]) {
      const v = p[k];
      if (typeof v === "string" || (Number.isInteger(v) && v >= 0) || (k === "ord" && v === null && "target" in p)) keys[k] = v;
    }
  } catch { keys = {}; }
  /* DEC-49 REGION is-hold-not-in-place */
  const row = ACTION_HOLDS_CHECKS.HOLD_NOT_IN_PLACE;
  return { ok: false, reason: "HOLD_NOT_IN_PLACE", code: "HOLD_NOT_IN_PLACE", check: row.check, translation: row.translation,
           ...keys, detail: HOLD_NOT_IN_PLACE_DETAIL };
  /* END DEC-49 REGION is-hold-not-in-place */
}

const clampLimit = (v, dflt, max) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(n, max) : dflt; };
const str = (v) => (typeof v === "string" ? v.trim() : "");
/* A value given as an object or its JSON, or null. */
const objectOf = (v) => {
  let x = v;
  if (typeof x === "string") { try { x = JSON.parse(x); } catch { return null; } }
  return x && typeof x === "object" && !Array.isArray(x) ? x : null;
};
/* An entry's position as given (a whole number, or its digits), or NaN. */
const positionOf = (ord) => (typeof ord === "number" ? ord : /^\d+$/.test(String(ord ?? "").trim()) ? Number(String(ord).trim()) : NaN);
const given = (v) => v !== undefined && v !== null && !(typeof v === "string" && !v.trim());

export class ActionHolds {
  #deps;

  constructor({ storage, record, membership, host = null, docket = undefined, roster = undefined, now = null, env = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.#deps = { host, docket, roster };
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
  }

  /* R2, R3: docket's marks (its R27) and project-roster's scope (its R23), reached on the same host unless a test passes
     its own; a host on which one cannot be created answers null, and what it would have answered is a refusal. */
  #reach(name, make) {
    if (this.#deps[name] === undefined || this.#deps[name] === null) {
      try { this.#deps[name] = make(this.#deps.host); } catch { this.#deps[name] = false; }
    }
    return this.#deps[name] || null;
  }
  get docket() { return this.#reach("docket", (h) => docketOf(h)); }
  get roster() { return this.#reach("roster", (h) => projectRosterOf(h, { record: this.record, membership: this.membership })); }

  migrate() { migrateActionHolds(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  /* The instance clock: the injected clock, then `env.BIO_NOW_MS`, then the wall. */
  #nowMs() {
    if (this.now) { const n = Number(this.now()); if (Number.isFinite(n) && n >= 0) return n; }
    const v = Number(this.env && this.env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }
  #heldFm(id) {
    const f = this.record.readFile(id, "bundle.md");
    if (!f || typeof f.text !== "string") return null;
    const fm = parseFrontmatter(f.text).data;
    return fm && typeof fm === "object" ? fm : null;
  }
  #visibleAction(id, viewer) {
    const gate = viewerPredicate(viewer);
    return this.#one(`SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                     id, ...gate.args);
  }
  /* R2: the project of a bundle (record-core R34), or null for none or one that cannot be read. */
  #projectOfBundle(id) {
    try { return this.record.bundleInfo(id)?.project ?? null; } catch { return null; }
  }

  /* ================================================================ R1: pressure marked on a received entry */

  /** R1: a pressure mark as given (`{kind, note}`, or its JSON), trimmed, or null when it is not one. */
  static #pressureOf(p) {
    const v = objectOf(p);
    if (!v) return null;
    return { kind: typeof v.kind === "string" ? v.kind.trim() : "", note: typeof v.note === "string" ? v.note.trim() : "",
             raw: typeof v.note === "string" ? v.note : "" };
  }

  /* R1 (K597 (1)), R12: the conditions on a pressure mark, at `actionPressure` and `pressureRecord` alike. Its codes are
     `action-grammar`'s rows (C-117.14–.16), which `actions`' `actionCorrespond` mints too. */
  #pressureRefusal({ who, mark, direction }) {
    /* DEC-49 REGION is-pressure */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_MARK_PRESSURE", "marking pressure directed at the group is a member's judgement; a "
        + "machine credential may not mark it. Nothing was written.");
    if (!mark || !PRESSURE_KINDS.includes(mark.kind) || !mark.note || mark.note.length > NOTE_MAX || /["\\\r\n]/.test(mark.raw))
      return refuse("PRESSURE_REFUSED", `a pressure mark is {kind, note}: kind one of ${PRESSURE_KINDS.join(", ")}, the note `
        + `1 to ${NOTE_MAX} characters with no quote, backslash or line break. Nothing was written.`,
        { legal: PRESSURE_KINDS, max: NOTE_MAX });
    if (direction !== "received")
      return refuse("PRESSURE_NOT_RECEIVED", `pressure is marked on a received entry; this one is ${direction || "not one"}. `
        + "Nothing was written.");
    /* END DEC-49 REGION is-pressure */
    return null;
  }

  /** R1: `actionPressure` marks pressure on a received entry already recorded, in this module's own table; the entry
   *  is never rewritten (`actions` R34). */
  actionPressure({ target, ord = null, pressure = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    const mark = ActionHolds.#pressureOf(pressure);
    if (!who || isMachineIdentity(who)) return this.#pressureRefusal({ who });
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const shape = this.#pressureRefusal({ who, mark, direction: "received" });
    if (shape) return { ...shape, target };
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const fm = this.#heldFm(target) || {};
    const ledger = Array.isArray(fm.correspondence) ? fm.correspondence : [];
    const n = positionOf(ord);
    const entry = Number.isInteger(n) ? ledger[n] : undefined;
    /* DEC-49 REGION is-pressure-entry */
    if (!entry || typeof entry !== "object")
      return refuse("PRESSURE_NO_ENTRY", "no correspondence entry stands at that position. Nothing was written.",
        { target, ord: ord ?? null, entries: ledger.length });
    /* END DEC-49 REGION is-pressure-entry */
    const notReceived = this.#pressureRefusal({ who, mark, direction: entry.direction });
    if (notReceived) return { ...notReceived, target, ord: n };
    /* DEC-49 REGION is-pressure-marked */
    if (this.#one(`SELECT ord FROM action_pressure WHERE bundle_id=? AND ord=?`, target, n))
      return refuse("PRESSURE_MARKED", "that entry is already marked as pressure, and a mark is never rewritten. "
        + "Nothing was written.", { target, ord: n });
    /* END DEC-49 REGION is-pressure-marked */
    const at = stampInstant("second", this.#nowMs());
    this.sql.exec(`INSERT INTO action_pressure (bundle_id, ord, kind, note, marked_by, at) VALUES (?,?,?,?,?,?)`,
      target, n, mark.kind, mark.note, who, at);
    return { ok: true, target, ord: n, pressure: { kind: mark.kind, note: mark.note }, by: who, at, weight: "single" };
  }

  /* ================================================================ R2: places and what prompted a hold */

  /* R2 (T45; Actions D10): the place a call names: an action (`{target}`), an entry of one (`{target, ord}`), or a project
     (`{project}`, or `{case}`, naming its owning project). Answers `{place}` (`kind` `entry`, `action` or `project`;
     `bundle` and `ord` as stored) or the refusal: `NO_TARGET` when nothing names one, `HOLD_PLACE_REFUSED` when more than
     one does or a position that is no whole number is given (`shapeOnly` stops there: R2 asks the rest later); then
     each place's own sight: `NO_SUCH_BUNDLE`, `NOT_AN_ACTION` and `HOLD_PLACE_REFUSED` for a position at which no entry
     stands, or for a project the answer to one the author may not name (R2's named projects'). */
  #placeOf({ target = null, ord = null, project = null, caseId = null, viewer = null, shapeOnly = false }) {
    const names = [given(target), given(project), given(caseId)].filter(Boolean).length;
    if (!names) return { refusal: { ok: false, reason: "NO_TARGET", detail: "a hold is placed at one place: pass target=<action id> "
      + "(and ord=<entry position> for one entry), or project=<project id>" } };
    const hasOrd = given(ord);
    const n = hasOrd ? positionOf(ord) : null;
    /* DEC-49 REGION is-hold-place */
    if (names > 1 || (hasOrd && (!given(target) || !Number.isInteger(n))))
      return { refusal: refuse("HOLD_PLACE_REFUSED", "a hold is placed at exactly one place: an action, an entry of one "
        + "by its position (a whole number from zero), or a project. Nothing was written.") };
    /* END DEC-49 REGION is-hold-place */
    if (shapeOnly) return { place: null };
    if (given(target)) {
      const id = str(String(target));
      const b = this.#visibleAction(id, viewer);
      if (!b) return { refusal: { ok: false, reason: "NO_SUCH_BUNDLE", target: id } };
      if (normalizeType(b.object_type) !== "action")
        return { refusal: { ok: false, reason: "NOT_AN_ACTION", target: id, object_type: b.object_type } };
      if (!hasOrd) return { place: { kind: "action", bundle: id, ord: WHOLE, target: id } };
      const ledger = (this.#heldFm(id) || {}).correspondence;
      /* DEC-49 REGION is-hold-place */
      if (!Array.isArray(ledger) || !ledger[n] || typeof ledger[n] !== "object")
        return { refusal: refuse("HOLD_PLACE_REFUSED", "no correspondence entry of that action stands at that position, so "
          + "no hold can be placed on it. Nothing was written.", { target: id, ord: n }) };
      /* END DEC-49 REGION is-hold-place */
      return { place: { kind: "entry", bundle: id, ord: n, target: id } };
    }
    if (given(caseId)) {
      const c = str(String(caseId));
      let row = null;
      try { row = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, c); } catch { row = null; }
      const p = row && typeof row.project_id === "string" ? row.project_id : null;
      if (!p || !this.#mayName(p, viewer)) return { refusal: noSuchProject(c) };
      return { place: { kind: "project", bundle: p, ord: WHOLE, project: p, case: c } };
    }
    const p = str(String(project));
    if (!PROJECT_ID_RE.test(p)) return { refusal: noSuchProject(p) };
    const seen = this.#projectSeen(p, viewer);
    if (seen) return { refusal: seen };
    return { place: { kind: "project", bundle: p, ord: WHOLE, project: p } };
  }

  /* R2: null when the viewer may name `project`, else the answer membership gives (its R77, R78): `existenceAct`, then
     `noSuchProject`. */
  #projectSeen(project, viewer) {
    if (this.#mayName(project, viewer)) return null;
    let existence = null;
    try { existence = this.membership.existenceAct(project, viewer); } catch { existence = null; }
    return existence || noSuchProject(project);
  }

  /* R2: a place as answers state it. */
  static #placeKeys(place) {
    if (place.kind === "project") return { project: place.project, ...(place.case ? { case: place.case } : {}) };
    return { target: place.target, ord: place.kind === "entry" ? place.ord : null };
  }

  /* R2 (T45): what prompted a hold, `from`, read against the place: `{mark: {target, ord}}` (a pressure mark on that
     entry, or on an entry of that action), `{pressure: "<project>#pressure/<n>"}` (a pressure record of that project),
     `{docket_entry}` (a docket mark of kind `legal` on an entry of a case of that project, read through
     `docket.docketPressureOf` as the author), `{counsel_matter: <project>}` (that project, whose scope is
     `counsel_matter`). Answers `{from: {kind, ref}}` (null when none is given) or the refusal `HOLD_FROM_REFUSED`; a
     docket that cannot be read answers its own refusal. */
  #fromOf(from, place, viewer) {
    if (!given(from)) return { from: null };
    const f = objectOf(from);
    const keys = f ? Object.keys(f) : [];
    const kind = keys.length === 1 && HOLD_FROM_KINDS.includes(keys[0]) ? keys[0] : null;
    const v = kind ? f[kind] : null;
    const no = () => ({ refusal: refuse("HOLD_FROM_REFUSED", "what prompted a hold is a pressure mark, a pressure record, a "
      + "docket entry marked as legal pressure, or a counsel matter, standing at the place the hold is placed; this names "
      + "none you can see there. Nothing was written.", { from: kind ? { [kind]: v } : null }) });
    /* DEC-49 REGION is-hold-from */
    if (kind === "mark") {
      const m = objectOf(v);
      const t = m ? str(String(m.target ?? "")) : "", n = m ? positionOf(m.ord) : NaN;
      if (!t || !Number.isInteger(n) || place.kind === "project" || t !== place.bundle || (place.kind === "entry" && n !== place.ord)
          || !this.#one(`SELECT ord FROM action_pressure WHERE bundle_id=? AND ord=?`, t, n)) return no();
      return { from: { kind, ref: `${t}#${n}` } };
    }
    if (kind === "pressure") {
      const ref = str(String(v ?? "")), m = PRESSURE_REF_RE.exec(ref);
      if (!m || place.kind !== "project" || m[1] !== place.project
          || !this.#one(`SELECT seq FROM pressure_records WHERE bundle_id=? AND seq=?`, m[1], Number(m[2]))) return no();
      return { from: { kind, ref } };
    }
    if (kind === "docket_entry") {
      const e = str(String(v ?? ""));
      if (!e || place.kind !== "project") return no();
      const d = this.docket;
      let r = null;
      try { r = d ? d.docketPressureOf({ entry: e, viewer }) : null; } catch { r = null; }
      if (!r) return { refusal: { ok: false, reason: "DOCKET_UNREADABLE", detail: "the docket's marks could not be read, so "
        + "whether that entry is marked cannot be said. Nothing was written." } };
      if (r.ok === false && r.reason === "DOCKET_UNREADABLE") return { refusal: r };
      if (r.ok === false || r.kind !== "legal" || r.project !== place.project) return no();
      return { from: { kind, ref: e } };
    }
    if (kind === "counsel_matter") {
      const p = str(String(v ?? ""));
      let scope = null;
      try { scope = this.roster ? this.roster.projectScope(p).scope : null; } catch { scope = null; }
      if (!p || place.kind !== "project" || p !== place.project || scope !== "counsel_matter") return no();
      return { from: { kind, ref: p } };
    }
    /* END DEC-49 REGION is-hold-from */
    return no();
  }

  /* R2: a stored `from` as answers state it. */
  static #fromAnswer(kind, ref) {
    if (!kind) return null;
    if (kind === "mark") { const i = ref.lastIndexOf("#"); return { mark: { target: ref.slice(0, i), ord: Number(ref.slice(i + 1)) } }; }
    return { [kind]: ref };
  }

  /* ================================================================ R2, R5, R6: the hold acts */

  /** R2 (K899 (7), DEC-61, DEC-113; N-A19; T45, Actions D10): a member states a litigation hold `in_place` at a place (an
   *  action, an entry of one, or a project), with a reason, what prompted it (`from`) and the projects it records (the
   *  place's own, filled in here, and those named). Each statement is appended to this module's own tables and never
   *  rewritten; the latest at a place is its hold. While it stands, no material of a project it covers, nor the action,
   *  is purged (R9). The same body runs `actionHoldRelease` (R5) and `holdReleasePreview` (R6) under `HOLD_MODE`, so each
   *  hold refusal is minted at the one region its row names (C-149). */
  actionHold({ target = null, ord = null, project = null, case: caseId = null, from = null, hold = null, reason = null,
               projects = null, viewer = null, author = null, [HOLD_MODE]: mode = "hold" } = {}) {
    const who = String(author ?? "").trim();
    const preview = mode === "preview", release = mode === "release";
    const h = release ? "released" : typeof hold === "string" ? hold.trim() : "";
    const why = typeof reason === "string" ? reason.trim() : "";
    /* DEC-49 REGION is-hold */
    const machine = !preview && (!who || isMachineIdentity(who))
      ? refuse("MACHINE_CANNOT_SET_HOLD", "saying whether a litigation hold is in place is a member's judgement; a "
        + "machine credential may not state it. Nothing was written.") : null;
    const shape = !preview && (!HOLD_STATES.includes(h) || !why || why.length > NOTE_MAX || /["\\\r\n]/.test(why))
      ? refuse("HOLD_REFUSED", `a litigation hold is one of ${HOLD_STATES.join(", ")}, with a reason of 1 to ${NOTE_MAX} `
        + "characters and no quote, backslash or line break. Nothing was written.", { legal: HOLD_STATES, max: NOTE_MAX })
      : null;
    /* END DEC-49 REGION is-hold */
    if (machine) return machine;
    const names = { target, ord, project, caseId, viewer };
    const shaped = this.#placeOf({ ...names, shapeOnly: true });
    if (shaped.refusal) return shaped.refusal;
    /* DEC-49 REGION is-hold-release-own-act */
    if (mode === "hold" && h === "released")
      return refuse("HOLD_RELEASE_IS_ITS_OWN_ACT", "a hold is released by its own act, op=actionholdrelease, which "
        + "states what the release restarts. Nothing was written.", { target });
    /* END DEC-49 REGION is-hold-release-own-act */
    if (shape) return { ...shape, ...(target ? { target } : {}) };
    let named = [];
    if (mode === "hold") {
      const p = this.#holdProjects(projects, false);
      if (!p.ok) return { ...p, ...(target ? { target } : {}) };
      named = p.projects;
    }
    const at0 = this.#placeOf(names);
    if (at0.refusal) return at0.refusal;
    const place = at0.place;
    const where = ActionHolds.#placeKeys(place);
    const latest = this.#one(`SELECT seq, hold FROM action_holds WHERE bundle_id=? AND ord=? ORDER BY seq DESC LIMIT 1`,
      place.bundle, place.ord);
    if (preview) {
      const all = this.#restarts(place.bundle, place.ord);
      const seen = all.filter((p) => this.#mayName(p, viewer));
      return { ok: true, ...where, hold: latest ? latest.hold : null, restarts: seen, out_of_view: seen.length < all.length };
    }
    /* DEC-49 REGION is-hold-already-released */
    if (release && latest && latest.hold === "released")
      return refuse("HOLD_ALREADY_RELEASED", "this place's hold is already released; a release ends a hold in place. "
        + "Nothing was written.", where);
    /* END DEC-49 REGION is-hold-already-released */
    /* R2: the first named project the author may not name answers as membership answers it (its R77, R78). */
    for (const p of named) {
      const seen = this.#projectSeen(p, viewer);
      if (seen) return seen;
    }
    const prompted = release ? { from: null } : this.#fromOf(from, place, viewer);
    if (prompted.refusal) return prompted.refusal;
    const at = stampInstant("second", this.#nowMs());
    /* R5: `restarted` is what R6 would answer at this instant, whatever the author sees, read and written in one
       transaction with the statement, so no hold lands between the read and the write. */
    const written = this.record.transact(() => {
      const seq = this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM action_holds WHERE bundle_id=? AND ord=?`,
        place.bundle, place.ord).n;
      let list;
      if (release) list = this.#restarts(place.bundle, place.ord);
      else {
        const own = place.kind === "project" ? place.project : this.#projectOfBundle(place.bundle);
        list = [...new Set([...(own ? [own] : []), ...named])];
      }
      this.sql.exec(`INSERT INTO action_holds (bundle_id, ord, seq, hold, reason, stated_by, at, from_kind, from_ref)
        VALUES (?,?,?,?,?,?,?,?,?)`, place.bundle, place.ord, seq, h, why, who, at,
        prompted.from ? prompted.from.kind : null, prompted.from ? prompted.from.ref : null);
      for (const p of list)
        this.sql.exec(`INSERT INTO action_hold_projects (bundle_id, ord, seq, project) VALUES (?,?,?,?)`,
          place.bundle, place.ord, seq, p);
      return { ok: true, list };
    });
    if (release)
      return { ok: true, ...where, hold: "released", reason: why, by: who, at,
               restarted: written.list.filter((p) => this.#mayName(p, viewer)) };
    return { ok: true, ...where, hold: h, reason: why, by: who, at,
             ...(prompted.from ? { from: ActionHolds.#fromAnswer(prompted.from.kind, prompted.from.ref) } : {}),
             projects: [...this.#covered(place.bundle, place.ord)].sort().filter((p) => this.#mayName(p, viewer)) };
  }

  /** R5 (DEC-113; K1134 (3)): a member states `released` at a place, recording what it restarted. */
  actionHoldRelease({ target = null, ord = null, project = null, case: caseId = null, reason = null, viewer = null,
                      author = null } = {}) {
    return this.actionHold({ target, ord, project, case: caseId, reason, viewer, author, [HOLD_MODE]: "release" });
  }

  /** R6 (DEC-113): what releasing a place's hold would restart, before any member releases it. Writes nothing. */
  holdReleasePreview({ target = null, ord = null, project = null, case: caseId = null, viewer = null } = {}) {
    return this.actionHold({ target, ord, project, case: caseId, viewer, [HOLD_MODE]: "preview" });
  }

  /* R2, R7 (C-149.4): a list of project ids, given as a list, its JSON, or ids separated by commas. At R2 (`exact`
     false) absent is none, repeats are one, and at most 50 distinct; at R7 (`exact` true) 1 to 50, each once. */
  #holdProjects(value, exact) {
    let list = value;
    if (typeof list === "string") {
      const t = list.trim();
      if (t.startsWith("[")) { try { list = JSON.parse(t); } catch { list = null; } }
      else list = t ? t.split(",").map((x) => x.trim()) : [];
    }
    const absent = value === null || value === undefined || (typeof value === "string" && !value.trim());
    const ids = Array.isArray(list) ? list : null;
    const distinct = ids ? new Set(ids) : null;
    /* DEC-49 REGION is-hold-projects */
    if ((!absent || exact) && (!ids || ids.some((x) => typeof x !== "string" || !PROJECT_ID_RE.test(x))
        || distinct.size > HOLD_PROJECTS_MAX || (exact && (!ids.length || distinct.size !== ids.length))))
      return refuse("HOLD_PROJECTS_REFUSED", `projects is a list of ${exact ? "1 to " : "at most "}${HOLD_PROJECTS_MAX} `
        + `distinct project ids (PROJ-…)${exact ? ", each named once" : ""}. Nothing was ${exact ? "read" : "written"}.`,
        { max: HOLD_PROJECTS_MAX });
    /* END DEC-49 REGION is-hold-projects */
    return { ok: true, projects: absent ? [] : [...distinct] };
  }

  /* R2 (D54; K2484): whether the viewer may name a project here: she sees it at FULL, or, as an administrator neither
     invited nor joined, a HIDDEN project at EXISTENCE (membership R44, R85's `visibilityOf`), which reaches its id and
     hold state and never its contents. A discoverable project's EXISTENCE names nothing. Anything else, a failure
     included, is not. */
  #mayName(project, viewer) {
    try {
      const sight = this.membership.sight(project, viewer);
      if (sight === "full") return true;
      return sight === "existence" && this.membership.visibilityOf(project) === "hidden";
    } catch { return false; }
  }
  /* R3, R12: whether the viewer sees a project at FULL (a project's pressure is its contents). */
  #seesFull(project, viewer) {
    try { return this.membership.sight(project, viewer) === "full"; } catch { return false; }
  }

  /* R2: every `in_place` statement of a hold still in place (no `released` statement after it at its place), one row per
     project it records (`project` null for a statement recording none). Throws when the tables cannot be read. */
  #standing() {
    return this.#rows(`SELECT h.bundle_id, h.ord, h.seq, h.stated_by, h.at, p.project FROM action_holds h
      LEFT JOIN action_hold_projects p ON p.bundle_id = h.bundle_id AND p.ord = h.ord AND p.seq = h.seq
      WHERE h.hold = 'in_place' AND NOT EXISTS (SELECT 1 FROM action_holds r WHERE r.bundle_id = h.bundle_id
        AND r.ord = h.ord AND r.seq > h.seq AND r.hold = 'released')
      ORDER BY h.at, h.bundle_id, h.ord, h.seq, p.project`);
  }

  /* R2: the projects a place's hold covers now (none unless it is in place). */
  #covered(id, ord) {
    return new Set(this.#standing().filter((r) => r.bundle_id === id && r.ord === ord && r.project).map((r) => r.project));
  }

  /* R5, R6: the projects a place's hold covers that no other hold in place covers, sorted, whatever the viewer. */
  #restarts(id, ord) {
    const rows = this.#standing();
    const mine = new Set(), others = new Set();
    for (const r of rows) if (r.project) (r.bundle_id === id && r.ord === ord ? mine : others).add(r.project);
    return [...mine].filter((p) => !others.has(p)).sort();
  }

  /* ================================================================ R2: the holds at a place, and R7, R10 */

  /* R2: a place's hold statements, oldest first, each with those of its projects the viewer may name (an `in_place`
     statement's `projects`, a release's `restarted`) and its `from`, and its current hold (the latest; null while none). */
  #holdsAt(id, ord, viewer) {
    const holds = this.#rows(`SELECT seq, hold, reason, stated_by, at, from_kind, from_ref FROM action_holds
      WHERE bundle_id=? AND ord=? ORDER BY seq`, id, ord).map((h) => {
      const projects = this.#rows(`SELECT project FROM action_hold_projects WHERE bundle_id=? AND ord=? AND seq=?
        ORDER BY project`, id, ord, h.seq).map((p) => p.project).filter((p) => this.#mayName(p, viewer));
      const from = ActionHolds.#fromAnswer(h.from_kind, h.from_ref);
      return { seq: h.seq, hold: h.hold, reason: h.reason, by: h.stated_by, at: h.at, ...(from ? { from } : {}),
               [h.hold === "released" ? "restarted" : "projects"]: projects };
    });
    return { holds, hold: holds.length ? holds[holds.length - 1].hold : null };
  }

  /** R2 (T45): a place's hold statements, oldest first (as `actions` R25's read showed a legal mark's), its current
   *  `hold`, and the hold notices recorded for it (R11: when, how and how held; never a recipient). The place's own
   *  refusals answer an absent or invisible one. Writes nothing. */
  holdsOf({ target = null, ord = null, project = null, case: caseId = null, viewer = null } = {}) {
    const at = this.#placeOf({ target, ord, project, caseId, viewer });
    if (at.refusal) return withRow(at.refusal);
    const { place } = at;
    const notices = this.#rows(`SELECT seq, sent_on, medium, artifact_sha, account, recorded_by, recorded_at FROM hold_notices
      WHERE bundle_id=? AND ord=? ORDER BY seq`, place.bundle, place.ord).map((n) => ({
      seq: n.seq, at: n.sent_on, medium: n.medium ?? null, held_as: n.artifact_sha ? "capture" : "testimony",
      ...(n.artifact_sha ? { artifact_sha: n.artifact_sha } : { account: n.account }), by: n.recorded_by, recorded_at: n.recorded_at }));
    return { ok: true, ...ActionHolds.#placeKeys(place), ...this.#holdsAt(place.bundle, place.ord, viewer), notices };
  }

  /** R7 (DEC-113): for each of 1 to 50 projects, whether a hold in place covers it: `held: true` with the `at` and `by`
   *  of the earliest such statement, `false`, or `null` for a project absent or one the viewer may not name (R2). A read
   *  it cannot complete is a refusal, never `false`. Names no action, entry or reason. Writes nothing. */
  projectHolds({ projects = null, viewer = null } = {}) {
    const asked = this.#holdProjects(projects, true);
    if (!asked.ok) return asked;
    let rows;
    try { rows = this.#standing(); } catch {
      return { ok: false, reason: "HOLDS_UNREADABLE", detail: "the litigation holds could not be read, so whether these "
        + "projects are held cannot be said. Ask again." };
    }
    const earliest = new Map();
    for (const r of rows) if (r.project && !earliest.has(r.project)) earliest.set(r.project, r);
    return { ok: true, projects: asked.projects.map((p) => {
      if (!this.#mayName(p, viewer)) return { project: p, held: null };
      const e = earliest.get(p);
      return e ? { project: p, held: true, since: e.at, recorded_by: e.stated_by } : { project: p, held: false };
    }) };
  }

  /** R10 (K1830; ratification R45): R7's answer for one project, read as the plane (whatever the viewer): `{held:
   *  true, since, recorded_by}` (the earliest `in_place` statement, among holds still in place, recording it) or
   *  `{held: false}` after reading every hold; `null` when the read cannot complete (no project named, or the holds
   *  unreadable). Names no action, entry or reason. Writes nothing; never throws. */
  holdsOn(args = {}) {
    try {
      const p = args && typeof args.project === "string" ? args.project.trim() : "";
      if (!p) return null;
      const e = this.#standing().find((r) => r.project === p);
      return e ? { held: true, since: e.at, recorded_by: e.stated_by } : { held: false };
    } catch { return null; }
  }

  /** R8 (DEC-113; for `queue-producers` R29): every `released` statement that ended a hold in place, at a place the
   *  viewer may see (an action she sees, or a project she may name, R2), with the hold's placers and the projects it
   *  restarted that the viewer may name; at most 500 per page in (place, position, sequence) order. `cursor` is the last
   *  answered, `<action or project>#<position>#<sequence>` (position -1 for a whole action or a project), when
   *  `truncated`, else null; `after` is a cursor or a place's id, read as after all that place's statements. */
  holdsReleased({ after = null, limit = null, viewer = null } = {}) {
    const max = clampLimit(limit, HOLDS_RELEASED_MAX, HOLDS_RELEASED_MAX);
    const gate = viewerPredicate(viewer);
    const from = after === null || after === undefined || after === "" ? null : String(after);
    const at = from ? /^(.+)#(-?\d+)#(\d+)$/.exec(from) : null;
    let seek = at ? [at[1], Number(at[2]), Number(at[3])] : from ? [from, Number.MAX_SAFE_INTEGER, 0] : null;
    const items = [];
    let truncated = false;
    for (;;) {
      const s = seek ? { sql: "AND (r.bundle_id > ? OR (r.bundle_id = ? AND (r.ord > ? OR (r.ord = ? AND r.seq > ?))))",
                         args: [seek[0], seek[0], seek[1], seek[1], seek[2]] } : { sql: "", args: [] };
      const rows = this.#rows(`SELECT r.bundle_id, r.ord, r.seq, r.reason, r.stated_by, r.at, b.object_type AS t FROM action_holds r
        JOIN bundles b ON b.bundle_id = r.bundle_id
        WHERE r.hold = 'released' AND ((b.object_type = 'action' AND (${gate.sql})) OR b.object_type = 'project') ${s.sql}
          AND (SELECT p.hold FROM action_holds p WHERE p.bundle_id = r.bundle_id AND p.ord = r.ord AND p.seq < r.seq
               ORDER BY p.seq DESC LIMIT 1) = 'in_place'
        ORDER BY r.bundle_id, r.ord, r.seq LIMIT ?`, ...gate.args, ...s.args, max + 1);
      for (const r of rows) {
        seek = [r.bundle_id, r.ord, r.seq];
        if (r.t === "project" && !this.#mayName(r.bundle_id, viewer)) continue;
        if (items.length === max) { truncated = true; break; }
        items.push({
          ...(r.t === "project" ? { project: r.bundle_id } : { action: r.bundle_id, ord: r.ord === WHOLE ? null : r.ord }),
          seq: r.seq, released_by: r.stated_by, released_at: r.at, reason: r.reason,
          placers: this.#rows(`SELECT stated_by FROM action_holds WHERE bundle_id = ? AND ord = ? AND seq < ? AND hold = 'in_place'
            AND seq > COALESCE((SELECT MAX(s.seq) FROM action_holds s WHERE s.bundle_id = ? AND s.ord = ? AND s.seq < ?
                                AND s.hold = 'released'), 0)
            GROUP BY stated_by ORDER BY MIN(seq)`, r.bundle_id, r.ord, r.seq, r.bundle_id, r.ord, r.seq).map((x) => x.stated_by),
          restarted: this.#rows(`SELECT project FROM action_hold_projects WHERE bundle_id = ? AND ord = ? AND seq = ?
            ORDER BY project`, r.bundle_id, r.ord, r.seq).map((x) => x.project).filter((p) => this.#mayName(p, viewer)),
          _key: `${r.bundle_id}#${r.ord}#${r.seq}`,
        });
      }
      if (truncated || rows.length <= max) break;
    }
    const tail = items[items.length - 1];
    return { ok: true, items: items.map(({ _key, ...x }) => x), limit: max, truncated,
             cursor: truncated && tail ? tail._key : null };
  }

  /** R9 (DEC-113; K1252, K1253; asked by `store-door` R4): whether a purge of the record would reach held material,
   *  whatever the viewer. No `bundleId`: whether any hold is in place. A `bundleId`: whether a hold is in place and the
   *  bundle is a held project, belongs to one, is an action carrying a hold in place, or has no project that can be
   *  determined. Synchronous, so it is asked in the purge's own turn; writes nothing, never throws, and answers `true`
   *  when the holds cannot be read. It reads every hold and every bundle's project whatever any viewer may see, never
   *  through a viewer's sight (D54: the founder's viewer no longer sees a hidden project, membership R43). */
  purgeHeld({ bundleId = null } = {}) {
    try {
      const id = bundleId === null || bundleId === undefined ? "" : String(bundleId).trim();
      /* the whole-store purge: R4's reader itself, so the two answers cannot drift apart (R9) */
      if (!id) return this.holdInPlace();
      const rows = this.#standing();
      if (!rows.length) return false;
      const held = new Set(rows.map((r) => r.project).filter(Boolean));
      if (held.has(id) || rows.some((r) => r.bundle_id === id)) return true;
      const info = this.record.bundleInfo(id);
      if (!info) return true;
      return !!(info.project && held.has(info.project));
    } catch { return true; }
  }

  /** R4 (DEC-108; doorbell R3): whether any litigation hold is in place in the group: whether any place the instance
   *  holds has `in_place` as its latest statement (R2), whatever the viewer. Synchronous; writes nothing and never
   *  throws: a read that fails answers `true`, so doorbell clears nothing it cannot rule a hold out for. */
  holdInPlace() {
    try {
      const r = this.#one(`SELECT 1 AS held FROM action_holds h WHERE h.hold='in_place'
        AND h.seq = (SELECT MAX(s.seq) FROM action_holds s WHERE s.bundle_id = h.bundle_id AND s.ord = h.ord) LIMIT 1`);
      return r !== null;
    } catch { return true; }
  }

  /* ================================================================ R3: what still wants a hold */

  /** R3 (K899 (7); reconciliation R14; for `action-producers` R5): every `legal` pressure the viewer may see on which no
   *  hold is placed, whatever an action's state (a legal matter outlives the action): (1) each `legal` mark on a visible
   *  action with no hold stated at its entry and none placed `from` it, in (action id, position) order; (2) each docket
   *  `legal` mark (`docket.docketPressureMarks`, read as the plane) on an entry of a project the viewer sees at FULL, with
   *  no hold placed `from` it, in the order made; (3) each `legal` pressure record of a project she sees at FULL with no
   *  hold placed `from` it, in (project, sequence) order. At most 500 per page; `cursor` is the last item answered
   *  (`<action>#<position>`, `DOCKET#<mark>` or `<project>#pressure/<n>`) when `truncated`, else null; `after` is a
   *  cursor, or an action id read as after all that action's marks. A docket read that fails answers its refusal, never
   *  a short list. Writes nothing. */
  holdsDue({ after = null, limit = null, viewer = null } = {}) {
    const max = clampLimit(limit, HOLDS_DUE_MAX, HOLDS_DUE_MAX);
    const from = after === null || after === undefined || after === "" ? null : String(after);
    const docketAt = from ? /^DOCKET#(\d+)$/.exec(from) : null;
    const recordAt = from ? PRESSURE_REF_RE.exec(from) : null;
    const items = [];
    const full = new Map();
    const sees = (p) => { if (!full.has(p)) full.set(p, this.#seesFull(p, viewer)); return full.get(p); };
    /* (1) the action marks */
    if (!docketAt && !recordAt) {
      const gate = viewerPredicate(viewer);
      const at = from ? /^(.+)#(\d+)$/.exec(from) : null;
      const seek = at ? { sql: "AND (p.bundle_id > ? OR (p.bundle_id = ? AND p.ord > ?))", args: [at[1], at[1], Number(at[2])] }
        : from ? { sql: "AND p.bundle_id > ?", args: [from] } : { sql: "", args: [] };
      const rows = this.#rows(`SELECT p.bundle_id, p.ord, p.note, p.marked_by, p.at FROM action_pressure p
        JOIN bundles b ON b.bundle_id = p.bundle_id
        WHERE p.kind='legal' AND b.object_type='action' AND (${gate.sql}) ${seek.sql}
          AND NOT EXISTS (SELECT 1 FROM action_holds h WHERE h.bundle_id = p.bundle_id AND h.ord = p.ord)
          AND NOT EXISTS (SELECT 1 FROM action_holds h WHERE h.from_kind = 'mark' AND h.from_ref = p.bundle_id || '#' || p.ord)
        ORDER BY p.bundle_id, p.ord LIMIT ?`, ...gate.args, ...seek.args, max + 1);
      const projects = new Map();
      for (const r of rows) {
        if (!projects.has(r.bundle_id)) {
          const p = this.#projectOfBundle(r.bundle_id);
          projects.set(r.bundle_id, p && this.#mayName(p, viewer) ? p : null);
        }
        items.push({ action: r.bundle_id, ord: r.ord, note: r.note, marked_by: r.marked_by, marked_at: r.at,
                     project: projects.get(r.bundle_id), arrived: { action: r.bundle_id, ord: r.ord }, _key: `${r.bundle_id}#${r.ord}` });
      }
    }
    /* (2) the docket's legal marks, read as the plane and kept where the viewer sees the project at FULL */
    if (items.length <= max && !recordAt) {
      const d = this.docket;
      let cursor = docketAt ? Number(docketAt[1]) : 0;
      const resolved = new Set(this.#rows(`SELECT from_ref FROM action_holds WHERE from_kind = 'docket_entry'`).map((r) => r.from_ref));
      for (;;) {
        let r = null;
        try { r = d ? d.docketPressureMarks({ kind: "legal", after: cursor, limit: 1000 }) : null; } catch { r = null; }
        if (!r || r.ok === false)
          return r && r.reason === "DOCKET_UNREADABLE" ? r
            : { ok: false, reason: "DOCKET_UNREADABLE", detail: "the docket's marks could not be read; this is not an empty list" };
        for (const m of r.marks || []) {
          cursor = m.mark;
          if (!m.project || !sees(m.project) || resolved.has(m.entry)) continue;
          items.push({ arrived: { docket_entry: m.entry, case: m.case ?? null }, note: m.note ?? null, marked_by: null,
                       marked_at: m.at, project: m.project, _key: `DOCKET#${m.mark}` });
          if (items.length > max) break;
        }
        if (items.length > max || r.cursor === null || r.cursor === undefined) break;
        cursor = r.cursor;
      }
    }
    /* (3) the legal pressure records */
    if (items.length <= max) {
      const seek = recordAt ? { sql: "AND (r.bundle_id > ? OR (r.bundle_id = ? AND r.seq > ?))",
                                args: [recordAt[1], recordAt[1], Number(recordAt[2])] } : { sql: "", args: [] };
      let more = seek;
      for (;;) {
        const rows = this.#rows(`SELECT r.bundle_id, r.seq, r.note, r.recorded_by, r.recorded_at FROM pressure_records r
          WHERE r.kind = 'legal' ${more.sql} AND NOT EXISTS (SELECT 1 FROM action_holds h WHERE h.from_kind = 'pressure'
            AND h.from_ref = r.bundle_id || '#pressure/' || r.seq)
          ORDER BY r.bundle_id, r.seq LIMIT ?`, ...more.args, max + 1);
        for (const r of rows) {
          if (!sees(r.bundle_id)) continue;
          const ref = `${r.bundle_id}#pressure/${r.seq}`;
          items.push({ arrived: { pressure: ref }, note: r.note, marked_by: r.recorded_by, marked_at: r.recorded_at,
                       project: r.bundle_id, _key: ref });
          if (items.length > max) break;
        }
        if (items.length > max || rows.length <= max) break;
        const last = rows[rows.length - 1];
        more = { sql: "AND (r.bundle_id > ? OR (r.bundle_id = ? AND r.seq > ?))", args: [last.bundle_id, last.bundle_id, last.seq] };
      }
    }
    const truncated = items.length > max;
    const page = items.slice(0, max);
    const tail = page[page.length - 1];
    return { ok: true, items: page.map(({ _key, ...x }) => x), limit: max, truncated,
             cursor: truncated && tail ? tail._key : null };
  }

  /* ================================================================ R11: the hold notice */

  /* R11, R12: the capture-or-account pair and the text it carries (`actions` R15's rule): the refusal, or null. */
  #heldAs({ artifactSha, account, medium }) {
    const sha = String(artifactSha ?? "").trim().replace(/^sha256:/, "").toLowerCase();
    const acct = String(account ?? "").trim();
    if (sha && acct)
      return { refusal: { ok: false, reason: "CAPTURE_AND_TESTIMONY", detail: "it is held as the captured bytes OR a named "
        + "account, never both. Nothing was written." } };
    if (!sha && !acct)
      return { refusal: { ok: false, reason: "NEITHER_CAPTURE_NOR_TESTIMONY", detail: "it is held as an artifact_sha that "
        + "resolves in the register or as an account by its author. Nothing was written." } };
    if (sha && !/^[0-9a-f]{64}$/.test(sha))
      return { refusal: { ok: false, reason: "BAD_SHA", detail: "artifact_sha is a sha256 hash (64 hex characters)" } };
    for (const [name, v] of [["account", acct], ["medium", String(medium ?? "").trim()]])
      if (v.length > NOTE_MAX || /["\\\r\n]/.test(v))
        return { refusal: { ok: false, reason: `BAD_${name.toUpperCase()}`, detail: `${name} is at most ${NOTE_MAX} `
          + "characters and cannot contain a quote, a backslash, or a newline" } };
    if (sha && !this.#one(`SELECT capture_sha FROM register WHERE capture_sha=?`, sha))
      return { refusal: { ok: false, reason: "UNREGISTERED_ARTIFACT", artifact_sha: sha, detail: "this hash names no "
        + "capture in this store. Capture it first (op=capture), or record a named account instead." } };
    return { sha: sha || null, account: acct || null };
  }

  /** R11 (T45; N858 D10; v0.2 rules 10, 12): a member records that she sent the hold notice for the hold at `place`
   *  (R2's place: `{target, ord?}`, `{project}` or `{case}`, or its JSON), on `at`, held as the bytes sent or her
   *  account. It records no recipient, read, acknowledgement or compliance of any member, and no read here answers
   *  one (rule 10). The notice's text is `filings`' (its R47). */
  holdNoticeSent({ place = null, at = null, medium = null, artifactSha = null, account = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-send */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_SEND", "recording that the hold notice was sent is a member's statement of what she "
        + "did; a machine credential may not make it. Nothing was written.");
    /* END DEC-49 REGION is-machine-send */
    const p = objectOf(place) || {};
    const found = this.#placeOf({ target: p.target ?? null, ord: p.ord ?? null, project: p.project ?? null,
                                  caseId: p.case ?? null, viewer });
    if (found.refusal) return withRow(found.refusal);
    const { place: pl } = found;
    const where = ActionHolds.#placeKeys(pl);
    const latest = this.#one(`SELECT hold FROM action_holds WHERE bundle_id=? AND ord=? ORDER BY seq DESC LIMIT 1`, pl.bundle, pl.ord);
    if (!latest || latest.hold !== "in_place") return holdNotInPlace(where);
    const day = String(at ?? "").trim();
    if (!isCalendarDate(day))
      return withRow({ ok: false, reason: "BAD_DATE", at: day, detail: "the day the notice was sent is a YYYY-MM-DD the "
        + "calendar has. Nothing was written." });
    const held = this.#heldAs({ artifactSha, account, medium });
    if (held.refusal) return withRow({ ...held.refusal, ...where });
    const med = String(medium ?? "").trim() || null;
    const recorded = stampInstant("second", this.#nowMs());
    const seq = this.record.transact(() => {
      const n = this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM hold_notices WHERE bundle_id=? AND ord=?`, pl.bundle, pl.ord).n;
      this.sql.exec(`INSERT INTO hold_notices (bundle_id, ord, seq, sent_on, medium, artifact_sha, account, recorded_by, recorded_at)
        VALUES (?,?,?,?,?,?,?,?,?)`, pl.bundle, pl.ord, n, day, med, held.sha, held.account, who, recorded);
      return n;
    });
    return { ok: true, ...where, seq, at: day, medium: med, held_as: held.sha ? "capture" : "testimony",
             ...(held.sha ? { artifact_sha: held.sha } : { account: held.account }), by: who, recorded_at: recorded,
             weight: "single" };
  }

  /* ================================================================ R12: pressure that arrived outside any action */

  /** R12 (T45; S1 §C 16; v0.2 rule 12): a member records pressure that arrived outside any action (a letter, a post, a
   *  call), with R1's `pressure` shape, on the day it arrived, held as a capture or her account, in a project she sees
   *  at FULL. It creates no action to the sender. Answers the record's name, `<project>#pressure/<n>`, which a hold's
   *  `from` and `holdsDue` name it by. */
  pressureRecord({ project = null, pressure = null, artifactSha = null, account = null, at = null, viewer = null,
                   author = null } = {}) {
    const who = String(author ?? "").trim();
    if (!who || isMachineIdentity(who)) return this.#pressureRefusal({ who });
    const mark = ActionHolds.#pressureOf(pressure);
    const shape = this.#pressureRefusal({ who, mark, direction: "received" });
    if (shape) return shape;
    const p = str(String(project ?? ""));
    if (!PROJECT_ID_RE.test(p) || !this.#seesFull(p, viewer)) return noSuchProject(p || null);
    const day = String(at ?? "").trim();
    if (!isCalendarDate(day))
      return withRow({ ok: false, reason: "BAD_DATE", at: day, detail: "the day the pressure arrived is a YYYY-MM-DD the "
        + "calendar has. Nothing was written." });
    const held = this.#heldAs({ artifactSha, account, medium: null });
    if (held.refusal) return withRow({ ...held.refusal, project: p });
    const recorded = stampInstant("second", this.#nowMs());
    const seq = this.record.transact(() => {
      const n = this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM pressure_records WHERE bundle_id=?`, p).n;
      this.sql.exec(`INSERT INTO pressure_records (bundle_id, seq, kind, note, arrived_on, artifact_sha, account, recorded_by,
        recorded_at) VALUES (?,?,?,?,?,?,?,?,?)`, p, n, mark.kind, mark.note, day, held.sha, held.account, who, recorded);
      return n;
    });
    return { ok: true, pressure: `${p}#pressure/${seq}`, project: p, kind: mark.kind, note: mark.note, at: day,
             held_as: held.sha ? "capture" : "testimony", ...(held.sha ? { artifact_sha: held.sha } : { account: held.account }),
             by: who, recorded_at: recorded, weight: "single" };
  }

  /** R12, R1 (T45): pressure marks and pressure records together, each with where it arrived (`{action, ord}` or
   *  `{pressure}`), its project, kind, note, who marked or recorded it and when, and for an action's `legal` mark its
   *  entry's holds (R2, as `actions` R25's read showed them). With `action`, that action's marks (`NO_SUCH_BUNDLE` for one
   *  the viewer may not see); with `project`, the marks on actions of that project and its records (a project she does
   *  not see at FULL answered as absent); with neither, every visible mark and every record of a project she sees at
   *  FULL. At most 500 per page in place order (marks by action and position, then records by project and sequence),
   *  `cursor` the last item answered when `truncated`. Writes nothing. */
  pressureFor({ project = null, action = null, after = null, limit = null, viewer = null } = {}) {
    const max = clampLimit(limit, PRESSURE_PAGE_MAX, PRESSURE_PAGE_MAX);
    const a = str(String(action ?? "")), p = str(String(project ?? ""));
    if (a) {
      const b = this.#visibleAction(a, viewer);
      if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: a };
      if (normalizeType(b.object_type) !== "action") return { ok: false, reason: "NOT_AN_ACTION", target: a, object_type: b.object_type };
    }
    if (p && (!PROJECT_ID_RE.test(p) || !this.#seesFull(p, viewer))) return noSuchProject(p);
    const from = after === null || after === undefined || after === "" ? null : String(after);
    const recordAt = from ? PRESSURE_REF_RE.exec(from) : null;
    const items = [];
    if (!recordAt) {
      const gate = viewerPredicate(viewer);
      const at = from ? /^(.+)#(\d+)$/.exec(from) : null;
      const seek = at ? { sql: "AND (m.bundle_id > ? OR (m.bundle_id = ? AND m.ord > ?))", args: [at[1], at[1], Number(at[2])] }
        : from ? { sql: "AND m.bundle_id > ?", args: [from] } : { sql: "", args: [] };
      const only = a ? { sql: "AND m.bundle_id = ?", args: [a] } : p ? { sql: "AND b.project = ?", args: [p] } : { sql: "", args: [] };
      const rows = this.#rows(`SELECT m.bundle_id, m.ord, m.kind, m.note, m.marked_by, m.at, b.project FROM action_pressure m
        JOIN bundles b ON b.bundle_id = m.bundle_id
        WHERE b.object_type='action' AND (${gate.sql}) ${only.sql} ${seek.sql}
        ORDER BY m.bundle_id, m.ord LIMIT ?`, ...gate.args, ...only.args, ...seek.args, max + 1);
      for (const r of rows)
        items.push({ arrived: { action: r.bundle_id, ord: r.ord },
                     project: r.project && this.#mayName(r.project, viewer) ? r.project : null,
                     kind: r.kind, note: r.note, by: r.marked_by, at: r.at,
                     ...(r.kind === "legal" ? this.#holdsAt(r.bundle_id, r.ord, viewer) : {}), _key: `${r.bundle_id}#${r.ord}` });
    }
    if (!a && items.length <= max) {
      let seek = recordAt ? [recordAt[1], Number(recordAt[2])] : null;
      for (;;) {
        const s = seek ? { sql: "AND (bundle_id > ? OR (bundle_id = ? AND seq > ?))", args: [seek[0], seek[0], seek[1]] }
          : { sql: "", args: [] };
        const only = p ? { sql: "AND bundle_id = ?", args: [p] } : { sql: "", args: [] };
        const rows = this.#rows(`SELECT bundle_id, seq, kind, note, arrived_on, artifact_sha, account, recorded_by, recorded_at
          FROM pressure_records WHERE 1=1 ${only.sql} ${s.sql} ORDER BY bundle_id, seq LIMIT ?`, ...only.args, ...s.args, max + 1);
        for (const r of rows) {
          seek = [r.bundle_id, r.seq];
          if (!this.#seesFull(r.bundle_id, viewer)) continue;
          const ref = `${r.bundle_id}#pressure/${r.seq}`;
          items.push({ arrived: { pressure: ref }, project: r.bundle_id, kind: r.kind, note: r.note, by: r.recorded_by,
                       at: r.recorded_at, arrived_on: r.arrived_on, held_as: r.artifact_sha ? "capture" : "testimony",
                       ...(r.artifact_sha ? { artifact_sha: r.artifact_sha } : { account: r.account }), _key: ref });
          if (items.length > max) break;
        }
        if (items.length > max || rows.length <= max) break;
      }
    }
    const truncated = items.length > max;
    const page = items.slice(0, max);
    const tail = page[page.length - 1];
    return { ok: true, items: page.map(({ _key, ...x }) => x), limit: max, truncated,
             cursor: truncated && tail ? tail._key : null };
  }
}

/* The acts answer their catalogue-backed refusals with code, check and translation. */
for (const m of ["actionPressure", "actionHold", "actionHoldRelease", "holdReleasePreview", "projectHolds", "holdsOf",
                 "holdNoticeSent", "pressureRecord", "pressureFor", "holdsDue"]) {
  const fn = ActionHolds.prototype[m];
  ActionHolds.prototype[m] = function (...a) { return withRow(fn.apply(this, a)); };
}

const instances = new WeakMap();

/** K61: the one instance per host; at creation it declares its tables (R13) and registers its litigation-hold reader
 *  (R4; doorbell R3) and its reader of holds over a project (R10; ratification R45). In the copy window (reconciliation
 *  R19) `actions` holds the first three tables' declaration and both registrations: a refusal naming `actions` leaves
 *  `actions`' standing, and this module registers once `actions`' job (T45-27) has deleted its own. */
export function actionHoldsOf(host, deps) {
  let h = instances.get(host);
  if (!h) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    h = new ActionHolds({ ...d, host, storage, record, membership });
    instances.set(host, h);
    h.migrate();
    /* R13: declared once; the copied tables stay declared by `actions` until its job drops them from its list. */
    const declared = record.declarePurge("action-holds", [...ACTION_HOLDS_TABLES]);
    if (declared && declared.ok === false) {
      if (declared.reason !== "TABLE_DECLARED" || !["actions", "action-holds"].includes(declared.declaredBy))
        throw new Error(`action-holds: record-core refused the purge declaration: ${declared.reason}`);
      if (declared.declaredBy === "actions") {
        const own = ACTION_HOLDS_TABLES.filter((t) => !COPIED_TABLES.includes(t));
        const r = record.declarePurge("action-holds", own);
        if (r && r.ok === false && r.declaredBy !== "action-holds")
          throw new Error(`action-holds: record-core refused the purge declaration: ${r.reason}`);
      }
    }
    /* R4 (T42; N826): once per host, with doorbell (its R3). One already held by this module (another host over the same
       storage) or by `actions` (the copy window) stands; one held by any other module is a defect of the wiring. */
    const doorbell = d.doorbell === null ? null : (d.doorbell || doorbellOf(host));
    if (doorbell) {
      const r = doorbell.registerReader("litigation-hold", "action-holds", () => h.holdInPlace());
      if (r && r.ok === false && !["actions", "action-holds"].includes(r.module))
        throw new Error(`action-holds: doorbell refused the litigation-hold reader: ${r.reason}${r.module ? ` (held by ${r.module})` : ""}`);
    }
    /* R10 (K1830; ratification R45): once per host, the reader of holds over a project that publishing at a set time
       records and checks again. Ratification is reached on the host when the composition root starts this module with
       its environment, or given; a reader already held (`HOLD_READER_DECLARED`: `actions`' in the copy window) stands. */
    let ratification = null;
    if (d.ratification !== null && (d.ratification || d.env)) {
      try { ratification = d.ratification || ratificationOf(host); } catch { ratification = null; }
    }
    if (ratification && typeof ratification.registerHoldReader === "function")
      ratification.registerHoldReader({ holdsOn: (args) => h.holdsOn(args) });
  }
  return h;
}

/** Which purge declaration names one of this module's tables (record-core R21). */
export function actionHoldsOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return ACTION_HOLDS_TABLES.includes(name);
}

/** The module's ops (K3), as entries of the plane's one route map (`plane` composes them, T45-47; `op-declarations`
 *  declares them). `viewer` and `author` are the control plane's stamps, read from the query, so a caller's own copy
 *  never wins. */
export function actionHoldsOps(h, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const pick = (k) => (b[k] !== undefined && b[k] !== null ? b[k] : q(k));
  const pressure = () => b.pressure ?? (q("pressure_kind") !== null || q("pressure_note") !== null
    ? { kind: q("pressure_kind") ?? "", note: q("pressure_note") ?? "" } : null);
  return {
    /* R1: a pressure mark on a recorded received entry. */
    actionpressure: () => h.actionPressure({ target: q("target") || b.target, ord: q("ord") ?? b.ord ?? null, pressure: pressure(),
      viewer: q("viewer"), author: q("author") }),
    /* R2: a litigation hold at a place (declared to the door by op-declarations, K902). */
    actionhold: () => h.actionHold({ target: q("target") || b.target || null, ord: q("ord") ?? b.ord ?? null,
      project: pick("project"), case: pick("case"), from: b.from ?? q("from"), hold: q("hold") ?? b.hold ?? null,
      reason: q("reason") ?? b.reason ?? null, projects: b.projects ?? q("projects"), viewer: q("viewer"), author: q("author") }),
    /* R5, R6, R7 (DEC-113): the hold's release, what it would restart, and whether projects are held. */
    actionholdrelease: () => h.actionHoldRelease({ target: q("target") || b.target || null, ord: q("ord") ?? b.ord ?? null,
      project: pick("project"), case: pick("case"), reason: q("reason") ?? b.reason ?? null, viewer: q("viewer"), author: q("author") }),
    actionholdpreview: () => h.holdReleasePreview({ target: q("target") || b.target || null, ord: q("ord") ?? b.ord ?? null,
      project: pick("project"), case: pick("case"), viewer: q("viewer") }),
    projectholds: () => h.projectHolds({ projects: b.projects ?? q("projects"), viewer: q("viewer") }),
    /* R11: the hold notice a member sent. */
    holdnoticesent: () => h.holdNoticeSent({ place: b.place ?? q("place"), at: pick("at"), medium: pick("medium"),
      artifactSha: pick("artifact_sha"), account: pick("account"), viewer: q("viewer"), author: q("author") }),
    /* R12: pressure that arrived outside any action. */
    pressurerecord: () => h.pressureRecord({ project: pick("project"), pressure: pressure(), artifactSha: pick("artifact_sha"),
      account: pick("account"), at: pick("at"), viewer: q("viewer"), author: q("author") }),
  };
}

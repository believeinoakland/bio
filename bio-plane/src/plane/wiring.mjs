/* plane R21–R23 (T33-90): the small adapters the composition root hands the modules T33 adds, held apart from the class
   so each is tested at the interface without the Durable Object runtime. None holds a construct: each is the port one
   module's requirements name, answered by the module that owns the answer (R9). */
import { registerDoctype, generic } from "../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../doctypes/index.mjs";
import { registerLegistar } from "../../../legistar-reader/index.mjs";
import { registerRosterTypes, ROSTER_TYPES } from "../../../roster-reader/index.mjs";
import { registerCourtTypes } from "../../../court-doctypes/index.mjs";
import { registerBudgetTypes } from "../../../budget-doctypes/index.mjs";
import { factReader } from "../action-clocks/index.mjs";
import { MACHINE_VIEWER } from "../lines/index.mjs";

/** R22 (T33-12; docprofile R36; K617, K1513): the content types registered into docprofile's registry, in this order
 *  and once each: doctypes' seven, Legistar's, the roster and org-chart readers, the court registers, the budget
 *  readers, then `generic` last. Each register function is idempotent on the one `registerDoctype`, and docprofile's
 *  registry is the isolate's, so a second call registers nothing new. Answers each step's answer, in order. */
export function registerReaders(register = registerDoctype) {
  return [
    ["doctypes", registerDoctypes(register)],
    ["legistar-reader", registerLegistar(register)],
    ["roster-reader", registerRosterTypes(register)],
    ["court-doctypes", registerCourtTypes(register)],
    ["budget-doctypes", registerBudgetTypes(register)],
    ["generic", register(generic)],
  ];
}

/** R23 (K1505 (6); people R19): roster-reader's source for `people.staffingAt`. roster-reader reads a roster's header
 *  and holds no store (its R10), so no roster row is read here: the source states its level and reads nothing, never
 *  copying a row into a line (people R18). */
export const ROSTER_NOT_READ = "roster-reader reads a roster's columns and holds no store; no held roster is read here";
export const rosterSource = () => ({ organisation, at } = {}) => ({
  level: "held as a table, not read", rows: [], organisation: organisation ?? null, at: at ?? null,
  types: ROSTER_TYPES.map((t) => t.key), why: ROSTER_NOT_READ });

/** K1563 (10), K1654: the seeded offices' two reads (instance-setup R50), asked of instance-setup's instance when it
 *  answers them, else null, so local-facts falls back to the profile and conformance names no entity, each saying so. */
export function officePorts(instanceSetup) {
  const ask = (name, ...a) => {
    let s;
    try { s = instanceSetup(); } catch { return null; }
    if (!s || typeof s[name] !== "function") return null;
    try { return s[name](...a) ?? null; } catch { return null; }
  };
  return { officeOf: (entityId, profile) => ask("officeOf", entityId, profile),
           officeEntityOf: (office) => ask("officeEntityOf", office) };
}

/** K1569 (duties R9; civil-time R9): the `factOf` civil-time reads a calendar entry's status through: a closure-list
 *  entry is the profile's list, never a local fact (K1519); an office-calendar entry is local-facts' answer, read as
 *  action-clocks' `factReader` reads it (its R12). */
export function dutiesFactOf(localFacts) {
  return (h) => {
    if (h && typeof h === "object" && h.list !== undefined && h.list !== null) return { status: "profile_list" };
    const read = factReader(localFacts(), null);
    return read ? read(h) : { status: "absent", why: "local facts are not reachable on this host" };
  };
}

/* The bundle's own date, from its document's front matter (`created`), a local day. */
function createdOf(files) {
  const doc = Array.isArray(files) ? files.find((f) => f && f.path === "bundle.md") : null;
  const m = doc && typeof doc.text === "string" ? /^created:\s*"?(\d{4}-\d\d-\d\d)/m.exec(doc.text) : null;
  return m ? m[1] : null;
}

/** K1593 (retrieval R68 route (b)): the projected fields' providers, each the owner's one rule. `standard`: the
 *  standards a bundle's readings cite (`standards.standardsFor`, its R21). `holder`: for each office a bundle's
 *  captures resolve to (entities' read contract, R35), its holder on the bundle's own date (`lines.holderAt`, its
 *  R11), only a holder `lines` determines. Synchronous; a read that refuses or throws gives nothing. */
export function retrievalTerms({ standards, lines, sql }) {
  return {
    standard: ({ bundleId }) => {
      const r = standards().standardsFor({ target: bundleId, limit: 500, viewer: MACHINE_VIEWER });
      return r && r.ok !== false && Array.isArray(r.items) ? r.items.map((i) => i && i.standard).filter(Boolean) : [];
    },
    holder: ({ bundleId, files }) => {
      const at = createdOf(files);
      if (!at) return [];
      const offices = [...sql().exec(`SELECT DISTINCT r.entity_id AS id FROM resolutions r JOIN entities e
                                        ON e.entity_id = r.entity_id WHERE r.bundle_id = ? AND e.kind = 'office'`, bundleId)];
      const out = [];
      for (const { id } of offices) {
        const h = lines().holderAt({ office: id, at, viewer: MACHINE_VIEWER });
        if (h && typeof h.holder === "string") out.push(h.holder);
      }
      return out;
    },
  };
}

/** R21 (K1570; workbooks R6, R7; sheet-worker): the recompute workbooks reads as `ctx.recompute(captureSha)`, over the
 *  `SHEET_WORKER` service binding (`POST /recompute {capture_sha, store}`), the store being the object's namespace.
 *  None bound: a refusal workbooks records as "not recomputed here", never a guess. */
export const NO_ENGINE = Object.freeze({ ok: false, reason: "NO_ENGINE", why: "no engine bound: SHEET_WORKER is not bound to this plane" });
export function sheetRecompute(env, storeName) {
  return async (captureSha) => {
    const w = env && env.SHEET_WORKER;
    if (!w || typeof w.fetch !== "function") return NO_ENGINE;
    const r = await w.fetch("https://sheet-worker/recompute", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ capture_sha: captureSha, store: storeName() }) });
    return r.json();
  };
}

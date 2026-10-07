/* plane R21–R23 (T33-90): the small adapters the composition root hands the modules T33 adds, held apart from the class
   so each is tested at the interface without the Durable Object runtime. None holds a construct: each is the port one
   module's requirements name, answered by the module that owns the answer (R9). */
import { registerDoctype } from "../../../docprofile/registry.mjs";
import { registerDoctypes, generic } from "../../../doctypes/index.mjs";
import { registerLegistar } from "../../../legistar-reader/index.mjs";
import { registerRosterTypes, ROSTER_TYPES, rosterColumns } from "../../../roster-reader/index.mjs";
import { readerView } from "../../../docprofile/registry.mjs";
import { viewerPredicate } from "../membership/index.mjs";
import { parseCsv } from "../calculations/index.mjs";
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

/** R23 (K1505 (6); people R19; N633, K1730; roster-reader R12): the store's read roster-reader's `rosterSource(reads)`
 *  is handed, `({organisation, viewer}) → {items}`. It answers the held rosters of that organisation (an entity id) the
 *  viewer may see (membership's sight over the bundle that holds each, `viewerPredicate`; a viewer never sent is an
 *  in-plane read and sees every one), in roster-reader's item shapes:
 *  - each capture extraction placed as `staff_roster` or `org_chart` (its `readings`' content type) that entities
 *    resolved to the organisation (`resolutions`), as a document `{source: {capture_sha}, type, text}`, its text the
 *    capture's text units in reading order (extraction's `capture_text`);
 *  - each table calculations holds whose source capture entities resolved to the organisation and whose header
 *    roster-reader names a roster (its R6, `rosterColumns`, under the reader view roster-reader reads it with), as a
 *    table `{source: {table}, header, rows}`, its rows the canonical bytes calculations holds for a synchronous read
 *    (`calc_table_bytes`, its R1), never copied anywhere.
 *  Synchronous, as a roster source answers; it writes nothing. A read that fails answers `{ok: false, why}`, which
 *  roster-reader states as "held as a table, not read". */
export const ROSTER_CONTENT_TYPES = Object.freeze(ROSTER_TYPES.map((t) => t.key));
export function rosterReads({ sql, sight = viewerPredicate }) {
  return ({ organisation = null, viewer = null } = {}) => {
    if (typeof organisation !== "string" || organisation === "") return { ok: false, why: "no organisation was named by its entity id" };
    try {
      const g = viewer === null || viewer === undefined ? { sql: "1=1", args: [] } : sight(viewer);
      const db = sql();
      const items = [];
      const types = ROSTER_CONTENT_TYPES.map(() => "?").join(",");
      for (const r of [...db.exec(`SELECT DISTINCT rd.capture_sha AS sha, rd.content_type AS type FROM readings rd
                                     JOIN bundles b ON b.bundle_id = rd.bundle_id
                                    WHERE rd.content_type IN (${types})
                                      AND rd.capture_sha IN (SELECT capture_sha FROM resolutions WHERE entity_id = ?)
                                      AND (${g.sql}) ORDER BY rd.capture_sha`, ...ROSTER_CONTENT_TYPES, organisation, ...g.args)]) {
        const text = [...db.exec(`SELECT text FROM capture_text WHERE capture_sha = ? ORDER BY seq`, r.sha)].map((u) => u.text).join("\n");
        items.push({ source: { capture_sha: r.sha }, type: r.type, text });
      }
      const view = readerView({});
      for (const t of [...db.exec(`SELECT t.sha AS sha, t.header_json AS header FROM calc_tables t
                                     JOIN bundles b ON b.bundle_id = t.bundle_id
                                    WHERE json_extract(t.source_json, '$.capture_sha') IN (SELECT capture_sha FROM resolutions WHERE entity_id = ?)
                                      AND (${g.sql}) ORDER BY t.sha`, organisation, ...g.args)]) {
        let header;
        try { header = JSON.parse(t.header); } catch { continue; }
        if (!rosterColumns(header, view).roster) continue;
        const csv = [...db.exec(`SELECT chunk FROM calc_table_bytes WHERE sha = ? ORDER BY seq`, t.sha)].map((c) => c.chunk).join("");
        const parsed = csv ? parseCsv(csv) : null;
        const rows = parsed && Array.isArray(parsed.rows) ? parsed.rows.slice(1) : null;
        items.push(rows ? { source: { table: t.sha }, header, rows } : { source: { table: t.sha }, header });
      }
      return { items };
    } catch (e) {
      return { ok: false, why: `the store's read of held rosters failed (${String((e && e.message) || e).slice(0, 160)})` };
    }
  };
}

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

/** K1832 (ratification R42, R39, R6): the Worker's reach ratification is handed, so a scheduled edition's commit, run on
 *  the object at its time, copies its materials and assembles its container in-process, as `op=caseratify` does in the
 *  Worker: the environment (its buckets), a stub whose `fetch` is this object's own door (`door`, the class's `fetch`,
 *  answering through control-plane's frame as a stub of the object would), and the store's name, the object's own
 *  namespace read when asked. */
export function ratificationWorker({ env, door, namespace }) {
  return { env, stub: { fetch: (u, init) => door(u instanceof Request ? u : new Request(u, init)) },
           get storeName() { return namespace(); } };
}

/** F16 (K1881, K2038; capture R73, acquisition R42, capture-sources R55, R65): the group's own hosts, built from what
 *  the object holds, since it cannot see the host a request reached (the door forwards every request as `http://do/`)
 *  and no binding names it (an install-time binding is N745): the host of the origin the administrator's session
 *  reached when the group's domain was claimed (`instance-setup`'s `groupIdentity().domain_claim.instance_address`,
 *  its R7), and, when that host is a `workers.dev` name (`<name>.<subdomain>.workers.dev`), the suffix
 *  `.<subdomain>.workers.dev`, which holds every fleet member on the account. The claimed domain itself is the group's
 *  own website, which a member may capture, so it is never one. With nothing recorded the list is empty and the
 *  own-host checks refuse nothing (capture-sources R65: fail-open, F16 low). Pure; never throws. */
export function ownHostsOf(identity) {
  try {
    const address = identity && identity.domain_claim && identity.domain_claim.instance_address;
    if (typeof address !== "string" || address === "") return [];
    const u = new URL(address);
    if (u.protocol !== "https:" && u.protocol !== "http:") return [];
    const host = u.hostname.toLowerCase().replace(/\.$/, "");
    if (!host) return [];
    const labels = host.split(".");
    const out = [host];
    if (labels.length >= 4 && labels.slice(-2).join(".") === "workers.dev") out.push(`.${labels.slice(-3).join(".")}`);
    return out;
  } catch {
    return [];
  }
}

/* events: the uses of a power (T35-28; R43–R48). An act of discretion and a waiver (POLICIES L3 PO6, PO7) and an
   accreditation assessment (STANDARDS L3 ST8) are events of their own kinds, each with a facet held beside it: the
   provision it rests on as an opaque `standards` key (checked for shape only; events does not use standards, P4), the
   reason as the record states it or "none", the outcome, a waiver's scope, conditions and expiry, an assessment's unmet
   items. Every reason, outcome and scope is a cited passage of a capture: nothing here, member or machine, holds a reason
   the record does not state. Its words are read from the record (`content`'s passage text), never taken from a caller.
   A facet is never edited; a use recorded wrongly is withdrawn and stays readable. `usesOf` answers the held uses a
   viewer may see: a population, never a census (§6B.5). The question an act was recorded under is kept beside its row
   and shown only to a viewer who may see that inquiry (R48). */
import { readDate } from "./time.mjs";
import { noSha } from "../extraction/index.mjs";
import { canonicalExtent } from "../content/index.mjs";
import { isMachineIdentity } from "../record-grammar/index.mjs";

export const USE_KINDS = Object.freeze(["discretion", "waiver", "assessment"]);
export const OUTCOMES = Object.freeze(["granted", "denied", "partly_granted", "other"]);
export const PROVISION_MAX = 200;
export const WORDS_MAX = 300;
export const POPULATION = "these are the held uses you may see, never every use made: a population, not a census";

const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const said = (v) => typeof v === "string" && v.trim() !== "";
const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, detail, ...extra });
const json = (s) => { try { return JSON.parse(s); } catch { return null; } };
const given = (v) => v !== undefined && v !== null;

/* ---- Terms ---- */

/** A provision key `{standard, portion?}`, each a non-blank string of at most 200 characters and nothing else, held as
 *  given; null when it is not one. Its meaning is never read here. */
export function provisionKey(p) {
  if (!isObj(p) || Object.keys(p).some((k) => k !== "standard" && k !== "portion")) return null;
  const ok = (s) => said(s) && s.length <= PROVISION_MAX;
  if (!ok(p.standard) || (given(p.portion) && !ok(p.portion))) return null;
  return { standard: p.standard, portion: given(p.portion) ? p.portion : null };
}
const malformed = (what) => refuse("PROVISION_MALFORMED",
  `${what} is a provision key {standard, portion?}: each a non-blank string of at most ${PROVISION_MAX} characters`);

/* A cited passage `{captureSha, extent}` (a found match's own `capture_sha` taken alike, K1941), refused as R1 refuses an
   extent; the citation held is `{capture_sha, bundle_id, extent}`, the extent canonical. */
function citation(k, c, by, what) {
  if (!isObj(c)) return refuse("NO_EXTENT", `${what} is a passage of a captured document: {captureSha, extent}`);
  const sha = c.captureSha ?? c.capture_sha;
  if (!said(sha)) return noSha(`${what} names the captured document that states it, by its capture sha256`);
  const held = k.heldCapture(sha, by);
  if (!held) return refuse("CAPTURE_NOT_HELD", "the record holds no such capture you can see");
  if (!isObj(c.extent)) return refuse("NO_EXTENT", `${what} names the extent of the capture that states it`);
  const bad = k.extentRefusal(held.sha, c.extent);
  if (bad) return bad;
  return { ok: true, cite: { capture_sha: held.sha, bundle_id: held.bundleId, extent: canonicalExtent(c.extent), raw: c.extent } };
}
/* The passage named by an object holding it as `extent: {captureSha, extent}` or beside its own keys (a match spread). */
const passageOf = (o) => (isObj(o.extent) && (o.extent.captureSha !== undefined || o.extent.capture_sha !== undefined) ? o.extent
  : { captureSha: o.captureSha ?? o.capture_sha, extent: o.extent });

/* The citation as stored: minted once through content (find or mint), so its words are read from the record later. */
function stored(k, cite, by) {
  if (!cite) return null;
  const content_id = k.mint({ bundleId: cite.bundle_id, captureSha: cite.capture_sha, extent: cite.raw, by });
  return JSON.stringify({ capture_sha: cite.capture_sha, bundle_id: cite.bundle_id, extent: cite.extent, content_id });
}

/* R48: the question named, or a refusal; an absent and an unseen inquiry are answered alike. */
function questionOf(k, q, by) {
  if (!given(q)) return { ok: true, id: null };
  if (said(q) && k.questionSeen(q.trim(), by)) return { ok: true, id: q.trim() };
  return refuse("QUESTION_NOT_HELD", "no question with that id is held where you can see it; a question is an inquiry the record holds");
}

const member = (by) => said(by) && !isMachineIdentity(by);
const memberOnly = () => refuse("MEMBER_ACT_ONLY", "only a member records a use of a power; the machine proposes one, never records it (K1443)");

/* ---- R43: an act of discretion or a waiver ---- */

export function recordDiscretion(k, { kind, provision, statedReason, outcome, attestations, participants, scope, conditions,
                                      expiry, question, by = null } = {}) {
  if (kind !== "discretion" && kind !== "waiver")
    return refuse("KIND_NOT_DISCRETION", "recordDiscretion holds an act of discretion (discretion) or a waiver (waiver)", { kinds: ["discretion", "waiver"] });
  if (!member(by)) return memberOnly();
  const c = k.checkCreate({ kind, attestations, participants, by });
  if (!c.ok) return c;
  let prov = null;
  if (given(provision)) { prov = provisionKey(provision); if (!prov) return malformed("the provision"); }
  if (!given(statedReason) || (typeof statedReason === "string" && statedReason !== "none"))
    return refuse("STATED_REASON_MISSING", "the stated reason is a passage of a captured document that states it, or \"none\" when the record states none");
  let reason = null;
  if (statedReason !== "none") { reason = citation(k, statedReason, by, "the stated reason"); if (!reason.ok) return reason; }
  if (!isObj(outcome) || !OUTCOMES.includes(outcome.value))
    return refuse("OUTCOME_UNKNOWN", `an outcome is one of ${OUTCOMES.join(", ")}, with the passage stating it`, { outcomes: [...OUTCOMES] });
  const out = citation(k, passageOf(outcome), by, "the outcome");
  if (!out.ok) return out;
  const q = questionOf(k, question, by);
  if (!q.ok) return q;
  let sc = null, conds = [], exp = null;
  if (kind === "waiver") {
    if (!given(scope)) return refuse("WAIVER_NO_SCOPE", "a waiver names the passage stating what is waived and for whom");
    sc = citation(k, scope, by, "the waiver's scope");
    if (!sc.ok) return sc;
    if (given(conditions) && !Array.isArray(conditions)) return refuse("NO_EXTENT", "a waiver's conditions are a list of cited passages, empty for none");
    for (const x of conditions || []) { const r = citation(k, x, by, "a condition"); if (!r.ok) return r; conds.push(r); }
    if (given(expiry)) { const d = readDate(expiry, k.zone()); if (d.bad) return refuse("BAD_DATE", d.bad); exp = d; }
  } else {
    for (const [field, v] of [["scope", scope], ["conditions", conditions], ["expiry", expiry]])
      if (given(v)) return refuse("FIELD_NOT_FOR_KIND", `${field} is a waiver's; an act of discretion holds none`, { field });
  }
  return k.writeEvent(c, (eventId) => k.insert("event_uses", { event_id: eventId, kind,
    provision_standard: prov ? prov.standard : null, provision_portion: prov ? prov.portion : null,
    reason_stated: reason ? 1 : 0, reason: stored(k, reason && reason.cite, by), outcome: outcome.value,
    outcome_cite: stored(k, out.cite, by), scope: sc ? stored(k, sc.cite, by) : null,
    conditions: kind === "waiver" ? JSON.stringify(conds.map((x) => json(stored(k, x.cite, by)))) : null,
    expiry: exp ? JSON.stringify(exp) : null, question: q.id, by_actor: k.stamp(by), at: k.now(), withdrawn: 0 }));
}

/* ---- R44: an accreditation or certification assessment ---- */

export function recordAssessment(k, { provision, unmet, attestations, participants, question, by = null } = {}) {
  if (!member(by)) return memberOnly();
  const c = k.checkCreate({ kind: "assessment", attestations, participants, by });
  if (!c.ok) return c;
  const prov = provisionKey(provision);
  if (!prov) return malformed("the standard assessed against");
  if (given(unmet) && !Array.isArray(unmet)) return malformed("each unmet item's provision (unmet is a list)");
  const attesting = new Set(c.rows.map((r) => r.capture_sha).filter(Boolean));
  const items = [];
  for (const u of unmet || []) {
    const p = isObj(u) ? provisionKey(u.provision) : null;
    if (!p) return malformed("an unmet item's provision");
    const at = passageOf(u);
    if (!given(at.extent) && !given(at.captureSha)) return refuse("UNMET_NOT_CITED", "each unmet item cites the passage of an attesting capture stating it unmet", { provision: p });
    const r = citation(k, at, by, "an unmet item");
    if (!r.ok) return r;
    if (!attesting.has(r.cite.capture_sha))
      return refuse("EXTENT_NOT_IN_CAPTURE", "an unmet item is cited in a capture that attests the assessment", { provision: p });
    items.push({ p, cite: r.cite });
  }
  const q = questionOf(k, question, by);
  if (!q.ok) return q;
  return k.writeEvent(c, (eventId) => {
    k.insert("event_uses", { event_id: eventId, kind: "assessment", provision_standard: prov.standard, provision_portion: prov.portion,
      reason_stated: null, reason: null, outcome: null, outcome_cite: null, scope: null, conditions: null, expiry: null,
      question: q.id, by_actor: k.stamp(by), at: k.now(), withdrawn: 0 });
    for (const it of items) k.insert("event_unmet", { event_id: eventId, provision_standard: it.p.standard,
      provision_portion: it.p.portion, cite: stored(k, it.cite, by) });
  });
}

/* ---- R45: withdrawal, never an edit ---- */

export function withdrawUse(k, { eventId, reason, by = null } = {}) {
  if (!said(reason)) return refuse("NO_REASON", "a withdrawal says why the use was recorded wrongly; it is kept beside it");
  const id = k.resolve(eventId);
  if (!id) return k.noSuchEvent(eventId ?? null);
  const u = k.one(`SELECT * FROM event_uses WHERE event_id=?`, id);
  if (!u) return refuse("KIND_NOT_DISCRETION", "only a use of a power (discretion, waiver, assessment) is withdrawn this way", { event_id: id });
  if (u.withdrawn) return { ok: true, already: true, event_id: id, withdrawn: { by: u.withdrawn_actor, at: u.withdrawn_at, reason: u.withdrawn_why } };
  const at = k.now(), why = reason.trim().slice(0, 2000);
  k.rows(`UPDATE event_uses SET withdrawn=1, withdrawn_actor=?, withdrawn_at=?, withdrawn_why=? WHERE event_id=?`, k.stamp(by), at, why, id);
  return { ok: true, event_id: id, withdrawn: { by: k.stamp(by), at, reason: why } };
}

/* ---- R45, R48: the facet as read ---- */

const cut = (s) => (s.length <= WORDS_MAX ? s : `${s.slice(0, WORDS_MAX).replace(/\s+\S*$/, "")}…`);
const OUTCOME_WORDS = { granted: "granted", denied: "denied", partly_granted: "partly granted", other: "decided" };

/** The facet of a use event for a viewer, or null for an event that is no use. `view` is the event as read (its `when`
 *  and participants), so the facet says only what that reader may see. */
export function facetOf(k, eventId, viewer, view) {
  const u = k.one(`SELECT * FROM event_uses WHERE event_id=?`, eventId);
  if (!u) return null;
  const sees = (b) => k.sees(b, viewer);
  const cite = (s) => {
    const c = typeof s === "string" ? json(s) : s;
    if (!c) return null;
    if (!sees(c.bundle_id)) return { withheld: true };
    const text = c.content_id ? k.passageText(c.content_id) : null;
    return { capture_sha: c.capture_sha, extent: json(c.extent), words: typeof text === "string" && text.trim() ? cut(text.trim()) : null };
  };
  const quoted = (c) => (c.withheld ? "in a document you cannot see" : c.words ? `“${c.words}”` : "in the cited passage, its words not read");
  const parts = ((view && view.participants) || []).filter((p) => !p.superseded);
  const who = (role) => { const p = parts.find((x) => x.role === role); return p ? k.entityLabel(p.entity_id, viewer) : null; };
  const decider = who("decider"), subject = who("subject");
  const w = view && isObj(view.when) ? view.when : null;
  const date = w && w.value ? w.value : "date not recorded";
  const by = decider || "decider not recorded";
  const provision = u.provision_standard ? { standard: u.provision_standard, ...(u.provision_portion ? { portion: u.provision_portion } : {}) } : null;
  const provWords = provision ? `${provision.standard}${provision.portion ? ` ${provision.portion}` : ""}` : "provision not recorded";
  const facet = { kind: u.kind, provision, ...(provision ? {} : { provision_says: "provision not recorded" }) };
  if (u.kind === "assessment") {
    const unmet = k.rows(`SELECT * FROM event_unmet WHERE event_id=? ORDER BY unmet_id`, eventId).map((r) => ({
      provision: { standard: r.provision_standard, ...(r.provision_portion ? { portion: r.provision_portion } : {}) }, extent: cite(r.cite) }));
    const list = unmet.map((x) => `${x.provision.standard}${x.provision.portion ? ` ${x.provision.portion}` : ""}`);
    Object.assign(facet, { unmet, says: `Assessment of ${subject || "subject not recorded"} by ${by}, ${date}, against ${provWords}: `
      + (unmet.length ? `found unmet: ${list.join("; ")}` : "no standard found unmet") });
  } else {
    const reason = u.reason_stated ? cite(u.reason) : "none";
    const outcome = { value: u.outcome, extent: cite(u.outcome_cite) };
    const why = reason === "none" ? "no reason stated" : `stated reason: ${quoted(reason)}`;
    Object.assign(facet, { stated_reason: reason, outcome });
    if (u.kind === "discretion") facet.says = `Discretion used by ${by}, ${date}, ${why}`;
    else {
      const scope = cite(u.scope), conditions = (json(u.conditions) || []).map(cite), expiry = json(u.expiry);
      Object.assign(facet, { scope, conditions, expiry });
      facet.says = `Waiver ${OUTCOME_WORDS[u.outcome] || "decided"} by ${by}, ${date}, ${why}; waived: ${quoted(scope)}; `
        + (conditions.length ? `conditions: ${conditions.map(quoted).join("; ")}` : "no conditions stated") + "; "
        + (expiry ? `expires ${expiry.value}` : "no expiry stated");
    }
  }
  facet.withdrawn = u.withdrawn ? { by: u.withdrawn_actor, at: u.withdrawn_at, reason: u.withdrawn_why } : null;
  if (u.question == null) facet.question = null;
  else if (k.questionSeen(u.question, viewer)) facet.question = u.question;
  facet.by = u.by_actor; facet.at = u.at;
  return facet;
}

/* ---- R46: the population of held uses ---- */

export function usesOf(k, { provision = null, decider = null, subject = null, kinds = null, from = null, to = null, after = null,
                            limit = null, viewer = null } = {}) {
  try {
    const ks = Array.isArray(kinds) && kinds.length ? kinds : typeof kinds === "string" && kinds ? kinds.split(",").map((x) => x.trim()) : [...USE_KINDS];
    const off = ks.find((x) => !USE_KINDS.includes(x));
    if (off !== undefined) return refuse("KIND_NOT_DISCRETION", `a use is one of ${USE_KINDS.join(", ")}`, { kinds: [...USE_KINDS] });
    let prov = null;
    if (given(provision)) { prov = provisionKey(provision); if (!prov) return malformed("the provision asked for"); }
    const where = [`e.alias_of IS NULL`, `u.withdrawn = 0`, `u.kind IN (${ks.map(() => "?").join(",")})`], args = [...ks];
    if (prov) { where.push(`u.provision_standard = ?`); args.push(prov.standard); if (prov.portion) { where.push(`u.provision_portion = ?`); args.push(prov.portion); } }
    for (const [role, id] of [["decider", decider], ["subject", subject]]) if (said(id)) {
      where.push(`EXISTS (SELECT 1 FROM event_participants p WHERE p.event_id = u.event_id AND p.role = '${role}' AND p.entity_id = ? AND p.superseded_by IS NULL)`);
      args.push(id.trim());
    }
    const ids = k.rows(`SELECT u.event_id FROM event_uses u JOIN events e ON e.event_id = u.event_id WHERE ${where.join(" AND ")}`, ...args)
      .map((r) => r.event_id);
    const views = ids.map((id) => k.eventView(id, viewer)).filter(Boolean)
      .map((v) => ({ ...v, when: isObj(v.when) ? v.when : null, ...(isObj(v.when) ? {} : { when_read: v.when }) }));
    const r = k.range(views.filter((v) => v.when), from, to);
    if (r.bad) return refuse("BAD_DATE", r.bad);
    const o = k.order([...r.items, ...views.filter((v) => !v.when)]);
    const all = [...o.placed, ...o.nowhere.map((v) => ({ ...v, placed_nowhere: true }))];
    const start = said(after) ? all.findIndex((v) => v.event_id === after.trim()) + 1 : 0;
    const cap = k.clamp(limit), page = all.slice(start, start + cap + 1), shown = page.slice(0, cap);
    return { ok: true, items: shown.filter((v) => !v.placed_nowhere), placed_nowhere: shown.filter((v) => v.placed_nowhere),
             count: shown.length, limit: cap, truncated: page.length > cap,
             next: page.length > cap ? shown[shown.length - 1].event_id : null, population: POPULATION };
  } catch (e) { return refuse("USES_UNREADABLE", String(e && e.message || e).slice(0, 200)); }
}

/* provenance-routes — each document's chain of hops, and the route marker (requirements:
 * `build/requirements/provenance-routes.md`). The chain is reconstructed only from fields the record already holds
 * (R1, R2); a member's assessment of whether an information bundle's route can be shown is recorded as a standing
 * mark beside the bundle's state (R4), read back as a finding (R5), tallied on the audit (R6) and counted for
 * `op=stats` (R10). A hop attests bytes, address and time, never the credibility of the content.
 *
 * Split from `provenance` by N512 (K1193, K1220; `build/plan/draft-T25-splits.md` P-1), with no change of meaning:
 * the chain and route-finding section, `rowUnlessStated` and the methods `provenanceChainRebuild`, `routeOf`,
 * `routeTally`, `provenanceRouteAssess` and `provenanceRoutesMarked` moved here from provenance's `index.mjs`, the
 * table `provenance_route_marks` from its `schema.mjs` (now `./schema.mjs`), C-34 `ROUTE_MARK_CHECKS` from its
 * `checks.mjs` (now `./checks.mjs`) and the three route arms from its `ops.mjs` (now `./ops.mjs`). Their comments
 * moved with them, each requirement id re-pointed to this module's (provenance R19–R23 are R1–R5, R54 is R6, R36 is
 * R7); where one names `Store.x`, the thing it names is now this module's `x`.
 *
 * REACHED as `provenanceRoutesOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on
 * the first call with `deps` and returned to every later caller. At creation it declares its table to record-core's
 * purge (R12), and registers with record-core its audit finding `route` (R6; record-core R68) and its figure
 * `routeMarks` (R10; record-core R63), each under this module's name. Its ops are `./ops.mjs`' `provenanceRouteOps`
 * (R9), for the composition root to spread.
 * `deps`:
 *   record, membership, promotion  the modules it uses, `recordOf(host)`, `membershipOf(host)`, `promotionOf(host)`
 *                                  unless a test passes its own.
 *   now           the module's clock, an ISO instant (default: the wall clock). R2's reconstruction instant and R4's
 *                 mark read it, never a caller's time.
 *   instanceName  the instance's name for a reconstructed hop by this instance (R1), default `unnamed`; the
 *                 composition root hands in the deployment's name, as it did to provenance before N512. */

import { parseFrontmatter, isMachineIdentity, createSha256 } from "../record-grammar/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { DOORBELL_ORIGIN, PROVENANCE_ACT_CHECKS } from "../provenance/index.mjs";
import { migrateProvenanceRoutes } from "./schema.mjs";
import { ROUTE_MARK_CHECKS } from "./checks.mjs";

export { PROVENANCE_ROUTES_SCHEMA } from "./schema.mjs";
export { ROUTE_MARK_CHECKS } from "./checks.mjs";

/** The table this module owns (R12): no other module declares, writes or reshapes it. */
export const PROVENANCE_ROUTES_TABLES = ["provenance_route_marks"];
/** The name this module registers under with record-core (R6, R10) and declares its table by (R12). */
export const PROVENANCE_ROUTES_MODULE = "provenance-routes";

const te = new TextEncoder();
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const secondOf = (iso) => String(iso).replace(/\.\d+Z$/, "Z");

/** D-129's vocabulary, word for word as `observation-log`'s `OBSERVATION_STATES` states it (run-rules re-exports
 *  the same object), and the `means` the audit's route tally publishes beside it (R6, as `op=audit` has always
 *  answered it). That object sits in a later module (layer 5), which this one cannot import (P4), so the five
 *  meanings are held here, unchanged, and the copy is reported (job record, PROVENANCE #9; moved here by N512). Frozen: a reader takes
 *  the words, never a handle to change them. */
export const OBSERVATION_MEANS = Object.freeze({
  NEVER_LOOKED:         "nobody looked at this level for this subject",
  LOOKED_ABSENT:        "we looked and it is positively not there",
  LOOKED_INDETERMINATE: "we looked and could not tell",
  PRESENT:              "we looked and it is there",
  partial:              "we looked and got part of it (SWH's crawl status; CPDF-5's measured 88% case)",
});
/** The three meanings a route finding can carry (LOOKED_ABSENT and partial are unreachable for a route, below). Frozen,
 *  as `OBSERVATION_MEANS` is. */
export const FINDING_MEANS = Object.freeze({
  NEVER_LOOKED:         OBSERVATION_MEANS.NEVER_LOOKED,
  LOOKED_INDETERMINATE: OBSERVATION_MEANS.LOOKED_INDETERMINATE,
  PRESENT:              OBSERVATION_MEANS.PRESENT,
});

/* ======================================================================= *
 * THE CHAIN (R1) AND THE ROUTE FINDING (R5), both pure.
 * ======================================================================= */

/* REC-54 / D-200: DERIVE a provenance chain from what the capture record
 * ACTUALLY HOLDS, or refuse and say what is missing. Nothing here invents a
 * hop, and the difference between deriving and inventing is the whole item.
 *
 * WHAT MAKES THIS A RECONSTRUCTION RATHER THAN A BACK-DATING. The ten bundles
 * D-200 names were captured 2026-07-19..22; C-18.9's chain requirement was
 * written 2026-07-31. The chain FIELD was never populated because the field
 * did not exist yet — but the FACTS a hop carries were recorded at capture
 * time, in the same register, by the path that fetched the bytes: `locator`
 * (the address asked), `retrieved` (the instant), `capture.method` and
 * `capture.actor_class` (who asked), `capture.sha256` (what came back). This
 * moves those recorded facts into the field that now has to carry them. It
 * asserts NOTHING the register did not already assert, which is exactly the
 * test: if a fact is not already in the record, no hop may claim it.
 *
 * THREE RULES THAT ARE THE POINT, not implementation detail:
 *
 *  1. EVERY HOP IS STAMPED `reconstructed`. A chain derived today must not be
 *     readable as one recorded at capture. Without the stamp the record would
 *     silently claim these routes were witnessed when they were re-derived,
 *     and THAT is the back-dating the gate exists to prevent — the invention
 *     is not in the hop's content, it is in letting it pass as contemporaneous.
 *
 *  2. `co_archive` IS NEVER A HOP. Eight of the ten carry an archive.org
 *     replay URL, and it is tempting to read it as a second hop. It is not: it
 *     records that we ALSO asked an archive to keep a copy, not that the bytes
 *     REACHED US THROUGH one. Writing it as a hop would state the capture was
 *     archive-sourced, which is a WEAKER route than what happened, and would
 *     contradict the `grade: B` the register already carries — B being what a
 *     direct capture by this instance earns (EARNED_CAPTURE_CEILING). The
 *     recorded grade is itself evidence the route was direct and single-hop.
 *
 *  3. REFUSAL IS A REAL OUTCOME AND NAMES WHAT IS MISSING. A document whose
 *     route was never recorded is `undetermined`, and undetermined is
 *     first-class and must be STATED (CLAUDE.md). It is not repaired here.
 */
export function chainFromEvidence(doc, { instanceName = "unnamed", at = null } = {}) {
  if (!doc || typeof doc !== "object")
    return { ok: false, missing: ["the document entry is not an object"] };
  const str = (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
  const cap = doc.capture && typeof doc.capture === "object" ? doc.capture : {};
  const method = str(cap.method);
  const sha = str(cap.sha256);
  const retrieved = str(doc.retrieved);
  const locator = str(doc.locator);
  const custody = doc.custody && typeof doc.custody === "object" ? doc.custody : null;
  const holder = custody ? str(custody.holder) : null;
  const obtained = custody ? str(custody.obtained) : null;
  const tsr = doc.timestamp && typeof doc.timestamp === "object" ? doc.timestamp : null;
  const tsrAuth = tsr ? str(tsr.authority) : null;
  const tsrFile = tsr ? str(tsr.token_file) : null;
  /* The timestamp token binds THE BYTES TO AN INSTANT and says nothing about
     where they came from, so it is cited as evidence and never as the hop's
     attestor, and it never flips `bound` to true: what is unbound here is the
     locator-to-bytes link, which is precisely what a TSR does not cover. */
  const tsrNote = tsrAuth && tsrFile
    ? `; RFC3161 token ${tsrFile} from ${tsrAuth} binds these bytes to their capture instant, not to the address`
    : "";
  const stamp = (from) => ({
    at: at || secondOf(new Date().toISOString()),
    by: "op=provenancechain (REC-54)",
    basis: "derived from fields the capture record already held; no fact is asserted that the register did not carry",
    from,
  });

  /* ARM D — RECEIVED THROUGH THE DOORBELL (R1; provenance R51; K581). The bytes were handed in and never fetched, so the
     document is never a fetched route, whatever its `locator` (`knock:<id>`) looks like: reading it as one would
     state that this instance was served the bytes at an address, which is the fetch provenance R51 says did not happen. Its one
     hop is read from the knock's receipt the document states: the digest taken as the bytes arrived, and the instant.
     With no receipt, the route is undetermined, and the answer says the receipt is what is missing. */
  if (doc.origin && typeof doc.origin === "object" && doc.origin.kind === DOORBELL_ORIGIN) {
    const receipt = doc.source && typeof doc.source === "object" && doc.source.receipt && typeof doc.source.receipt === "object"
      ? doc.source.receipt : null;
    const knockId = receipt ? str(receipt.knock_id) : null;
    const received = receipt ? str(receipt.received) : null;
    if (!knockId || !received)
      return { ok: false, missing: ["the knock's receipt it was received under (`source.receipt`, with `knock_id` and `received`)"] };
    const rsha = str(receipt.sha256) || sha;
    return { ok: true, hops: [{
      who: `instance ${instanceName} (doorbell)`,
      asserts: `these bytes were received for knock:${knockId} at ${received}`,
      evidence: `the knock's receipt, sha256 ${rsha || "not recorded"} taken as the bytes arrived${tsrNote}`,
      bound: false,
      via: DOORBELL_ORIGIN,
      reconstructed: stamp(["origin.kind", "source.receipt.knock_id", "source.receipt.received", "source.receipt.sha256"]),
    }] };
  }

  /* ARM A — A ROUTE THAT WAS FETCHED. The register names an address, an
     instant and a method, so our own leg is reconstructible: we know what we
     asked for and when, which is the one leg C-18.9's doctrine says we always
     know. `bound: false` because the assertion is STATED, exactly as
     op=acquire's own direct hop states it. */
  if (method && retrieved && locator && locator !== "in hand") {
    const actor = str(cap.actor_class);
    return { ok: true, hops: [{
      who: `instance ${instanceName} (${actor ? `${actor} ` : ""}capture method ${method})`,
      asserts: `these bytes were served for ${locator} at ${retrieved}`,
      evidence: `${method}, sha256 ${sha || "not recorded"} recorded at receipt${tsrNote}`,
      bound: false,
      via: "direct",
      reconstructed: stamp(["locator", "retrieved", "capture.method", "capture.actor_class", "capture.sha256"]),
    }] };
  }

  /* ARM B — A MEMBER ORIGINAL. There is no fetch to describe: the bytes were
     handed to the record by a person, and the custody block is the record of
     who held them and in what setting. That IS the chain, and the attestor is
     the member rather than the instance. */
  if (holder && obtained) {
    return { ok: true, hops: [{
      who: `member ${holder}`,
      asserts: `this member held these bytes and supplied them to the record at ${obtained}`,
      evidence: `${str(custody.setting) || "setting not recorded"}${str(custody.attestation) ? `; ${str(custody.attestation)}` : ""}`
              + `; sha256 ${sha || "not recorded"} recorded at receipt${tsrNote}`,
      bound: false,
      via: "member",
      reconstructed: stamp(["custody.holder", "custody.obtained", "custody.setting", "custody.attestation", "capture.sha256"]),
    }] };
  }

  /* NEITHER ARM. Say what is absent rather than guessing between them. */
  const missing = [];
  if (!locator || locator === "in hand") missing.push("a fetched address (`locator`)");
  if (!retrieved) missing.push("the instant it was retrieved (`retrieved`)");
  if (!method) missing.push("how it was captured (`capture.method`)");
  if (!holder) missing.push("a named custodian (`custody.holder`)");
  if (!obtained) missing.push("when the custodian obtained it (`custody.obtained`)");
  return { ok: false, missing };
}

/* ==================================================================== *
 * REC-63 / DEC-56 / D-204 — THE STANDING MARKER, AND ITS PUBLICATION.
 *
 * Bob ruled the principle across DEC-56/57/58 together, 2026-08-06: ACT, AND
 * SAY WHAT YOU COULD NOT ESTABLISH. Applied to a provenance chain that cannot
 * be reconstructed it settles a shape rather than a mechanism: NOT a
 * `verified -> collected` retraction edge, and NOT silence — a standing MARKER
 * at `verified` stating that the route cannot be shown.
 *
 * WHY NOT THE RETRACTION EDGE, so nobody re-opens it here. Retracting a
 * verification RESTATES A GROUP'S OWN PAST ACT, and this project's posture is
 * that correction moves FORWARD (DEC-19): a record adds, and every correction
 * is itself a dated, attributed act. A marker is also what is actually TRUE —
 * the bytes may be exactly what was captured, and what cannot be shown is the
 * ROUTE, which is a statement about OUR EVIDENCE rather than about the
 * document. `STATES.information.edges` is untouched by this item (record-grammar's
 * to hold; the legacy suite that pinned it, `provenance-marker.test.mjs`, was
 * deleted at T20).
 *
 * ------------------------------------------------------------------------
 * THE PART THAT IS ACTUALLY HARD, AND IT IS A PUBLICATION QUESTION:
 * A MARKER NOBODY CAN SEE IS NOT A MARKER.
 *
 * REC-74 is running on exactly this failure one field over — a run condition
 * WRITTEN by one op and PUBLISHED by none, so a condition recorded and never
 * published is not recorded for anybody who was not there. So the finding is
 * driven out through the reads a member actually uses:
 *
 *   op=list             every row carries `route`. 14 call sites in app.html —
 *                       the most-used bundle read there is.
 *   op=audit            a `route` block: the tally over the page, the marked
 *                       bundles named with their STATE beside the finding, and
 *                       the standing sentence that says the two disagree ON
 *                       PURPOSE. `ok`, `clean` and `tally` do not move — a
 *                       marker is a stated doubt, NOT a conformance error, or
 *                       a store carrying one could never be "audit clean"
 *                       again and CLAUDE.md's own ladder would break.
 *   op=provenanceroute  the act's own answer.
 *   op=provenancechain  both arms, so the op that MEETS the underivable chain
 *                       also shows whether the doubt was ever recorded.
 *
 * AND THE THING A CONSUMER MUST BE ABLE TO DO: TELL THE TWO ABSENCES APART.
 * "The route cannot be shown" and "nobody looked" are different facts and they
 * read alike if the field is simply absent when there is no marker. So `route`
 * is NEVER ABSENT and never null on these reads, and its `finding` is D-129's
 * vocabulary (observation-log's `OBSERVATION_STATES`, `airun.mjs`'s then) rather than a fifth private spelling
 * of absence:
 *
 *   NEVER_LOOKED          no assessment has ever run. NOBODY LOOKED.
 *   LOOKED_INDETERMINATE  THE MARKER. We looked and the route cannot be shown.
 *   PRESENT               we looked and every document's route can be shown.
 *
 * LOOKED_ABSENT is deliberately unreachable and the reason is doctrinal: it
 * would assert the bytes have NO route, and every captured byte came from
 * somewhere. What is absent is our EVIDENCE, which is the LOOKED_INDETERMINATE
 * case exactly. `partial` is unreachable for the same reason one level up: a
 * register where three of five documents can be shown is one whose route
 * CANNOT be shown, and the per-document array says which three.
 * ==================================================================== */

/** The standing sentence that makes the disagreement LEGIBLE rather than
 *  readable as a bug. Composed once, published by every read that carries a
 *  marker, because the whole risk of this shape is a member meeting a
 *  `verified` document with a doubt on it and concluding the record is broken. */
export const ROUTE_MARK_NOTE =
  "this document stays where the group put it: a verification was an attested act by people, and "
  + "this record corrects FORWARD rather than un-saying one (DEC-19). What is recorded here is that "
  + "its ROUTE cannot be shown from the evidence held — a statement about our evidence, not about the "
  + "bytes. The state and this finding disagree deliberately, and neither is a defect in the other.";

/** THE ONE COMPOSITION POINT for what a read publishes, so `op=list`,
 *  `op=audit` and both provenance ops cannot answer this question in three
 *  slightly different shapes. A hand copy agrees with its author at zero cost
 *  and this repository has measured that five times.
 *
 *  `applies` is the FOURTH state and it is not a fudge: a route is a fact
 *  about a CAPTURED document, and a question or a project was written into the
 *  record rather than fetched from anywhere. Publishing `NEVER_LOOKED` for an
 *  inquiry would be true and useless — it would say nobody looked for a thing
 *  there was never anything to look for. Publishing NOTHING would re-create
 *  the conflation this whole item exists to remove, so it is stated. */
export function routeFinding(objectType, mark) {
  if (objectType !== "information")
    return { applies: false, assessed: false, marked: false, finding: null, means: null,
             note: "a route is a fact about a captured document, and this record is not one" };
  if (!mark)
    return { applies: true, assessed: false, marked: false,
             finding: "NEVER_LOOKED", means: FINDING_MEANS.NEVER_LOOKED,
             note: "no assessment of this document's route has ever been recorded. This is NOT a finding "
                 + "that the route cannot be shown; it is the absence of the question having been asked." };
  const marked = mark.finding === "LOOKED_INDETERMINATE";
  return {
    applies: true, assessed: true, marked,
    finding: mark.finding, means: FINDING_MEANS[mark.finding] ?? null,
    at: mark.at, by: mark.by, stateAt: mark.state_at, seq: mark.seq,
    register: mark.register_state, undetermined: mark.undetermined, documents: mark.documents_n,
    note: marked ? ROUTE_MARK_NOTE
                 : "this document's route was assessed and every document in its register can be shown",
  };
}

/* ==================================================================== *
 * REC-63 / DEC-56 — THE MARKER, ON THE SWEEP (R6; record-core R68). Moved from the legacy store's `auditPass`
 * (T19 layer 3; that store is retired): record-core's audit (its R68) answers this module's registered finding under
 * `route`.
 *
 * DEC-56's acceptance is that a document sits at `verified` while the audit REPORTS it, and that the disagreement
 * is LEGIBLE rather than reading as a bug. Three decisions make that true and each is here rather than in a doc:
 *
 *  1. `ok`, `clean`, `withErrors` and `tally` DO NOT MOVE. A marker is a STATED DOUBT, not a conformance error.
 *     If it were an error, a store that honestly recorded one could never be "audit clean" again, and the honest
 *     act would have broken the gate that rewards honesty. (A missing chain at `verified` is STILL a C-18.9 error
 *     and still tallies; the marker explains that finding, it does not cancel it.) Record-core keeps a finding
 *     beside those fields, never inside them (its R68).
 *  2. THE TALLY IS OVER THE WHOLE PAGE AND IS ALWAYS PRESENT, including its `NEVER_LOOKED` count. That count is the
 *     answer to "nobody looked", and an operator who cannot see it cannot tell a clean corpus from an unexamined
 *     one. An absent tally would say nothing, and "nothing to report" and "this build does not report it" would
 *     read alike, which is the conflation the marker exists to end, one level up.
 *  3. THE NAMED LIST IS BOUNDED at 20, like `offenders` beside it, and `markedTotal` publishes how many there were.
 *     A bound applied and not published is REC-57's defect and it is not being re-created here.
 *
 * The marks are read over the PAGE'S OWN ID RANGE and then kept only for the page's ids, so an invisible bundle's
 * marker cannot ride out on this answer and the read cannot become an unbounded scan of the marks table.
 * ==================================================================== */

/** The audit answer's key this module's finding is registered under (record-core R68): the one spelling, read by
 *  the composition root that relays the audit's answer. */
export const ROUTE_FINDING_KEY = "route";
/** The most marked bundles one page's finding names (R6); `markedTotal` says how many the page holds. */
export const ROUTE_TALLY_MARKED_MAX = 20;
/** The fixed sentence the finding carries (R6), word for word as `op=audit` has always answered it. */
export const ROUTE_TALLY_NOTE =
  "these are STATED DOUBTS, not conformance errors, and they are deliberately not counted in "
  + "`tally` or `withErrors`: each names a document whose route cannot be shown, standing where "
  + "the group put it (DEC-56/DEC-19). `NEVER_LOOKED` is a different fact again — it means no "
  + "assessment has run, not that anything is wrong.";

/* The route-mark read's constants (R5). In the legacy store they were declared after the method that used them, so
   that the suites walking `store.mjs` by method segment read them as that method's; here they are module constants. */
/** The one finding this op asks about. Bound as a PARAMETER rather than
 *  inlined, so the statement below reads `m.finding = ?` and the planner sees
 *  the leading-column equality `provenance_route_marks_finding` was declared
 *  for (M-41, M-49). */
export const ROUTE_MARKED_FINDING = "LOOKED_INDETERMINATE";
export const ROUTE_MARKED_LIMIT_DEFAULT = 50;
export const ROUTE_MARKED_LIMIT_MAX = 200;

/** REC-116 / IC-120: which documents in this instance carry a STANDING
 *  `LOOKED_INDETERMINATE` marker. Bounded, gated, and an empty answer always
 *  says WHY it is empty. See the block above for every decision in here. */

/** The canned sentence per cause, held beside the ladder rather than typed at
 *  the site, so the four answers cannot drift apart. */
export const ROUTE_MARKED_CAUSES = {
  no_documents_visible:
    "there is no captured document in this record that this viewer may see, so the question cannot "
    + "be asked of them. This says NOTHING about whether any document carries a marker",
  never_assessed:
    "no document in this record has EVER been assessed for its provenance route. This is NEVER_LOOKED "
    + "— the absence of the question having been asked — and it is NOT a finding that every route can "
    + "be shown. Nobody has looked",
  none_standing:
    "documents in this record HAVE been assessed, and every assessment that still stands found the "
    + "route showable. This is the earned statement that no document carries a marker: somebody looked",
  page_exhausted:
    "there are no further marked documents after this cursor. Documents DO carry standing markers in "
    + "this record — this page is past the last of them, which is a fact about the cursor and not "
    + "about the record",
};

/* D-563: an internal relabel's fallback — each row value is sent only when the carried `bundle.md` states no such
   key, so the plane never labels its own write against the document it is carrying. */
function rowUnlessStated(files, row) {
  const md = files.find((f) => f && f.path === "bundle.md");
  const fm = md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null;
  const out = {};
  for (const [k, v] of Object.entries(row))
    if (!(fm && typeof fm === "object" && Object.prototype.hasOwnProperty.call(fm, k))) out[k] = v;
  return out;
}

/* A refusal carrying its catalogue row (K72 (5)). The code is a literal at each site, so DEC-49's guard reads which
   code a region mints. */
const rowRefusal = (family) => (code, detail, extra) => {
  const row = family[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
};
/* The C-103 row this module answers through (R2: `NO_BUNDLE`, C-103.3), provenance's `PROVENANCE_ACT_CHECKS` (its R58),
   imported rather than moved, so one family stays in one file; its sentence is true at both sites. */
const actRefusal = rowRefusal(PROVENANCE_ACT_CHECKS);

/* ======================================================================= *
 * THE MODULE
 * ======================================================================= */

class ProvenanceRoutes {
  #sql; #record; #membership; #promotion; #now; #instanceName;

  constructor({ storage, record, membership, promotion, now, instanceName } = {}) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#promotion = promotion;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
    this.#instanceName = typeof instanceName === "string" && instanceName ? instanceName : "unnamed";
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** This module's table (R12), created or brought up to shape. Called by the host at every boot; idempotent. */
  migrate() {
    migrateProvenanceRoutes(this.#sql);
    return { ok: true };
  }

  /** REC-54 / D-200: rebuild the provenance chains of ONE bundle from the
   *  evidence its own capture record holds, through the plane's own write path.
   *
   *  Reports before it writes and writes nothing unless `apply` is set, because
   *  the dispositions this exists for are corrections to the REAL record and
   *  each one is a decision that wants its evidence read first.
   *
   *  A document that ALREADY has a chain is never touched — overwriting a
   *  recorded route with a derived one would destroy the better evidence and
   *  replace a witnessed chain with a reconstructed one.
   *
   *  The bundle is refused WHOLE when any document cannot be derived, on
   *  release()'s precedent: a register half-reconstructed is a record where the
   *  reader cannot tell which documents were established and which were skipped.
   */
  provenanceChainRebuild({ bundleId = "", apply = false, author = null, viewer = null } = {}) {
    const who = String(author ?? "").trim();
    /* R3 · REC-158: a named MEMBER's act. A machine identity (a bearer's `token:<class>` stamp is nobody's name) is
       refused by the same name as no author, before anything is read. */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "NO_AUTHOR",
               detail: who
                 ? `'${who.slice(0, 60)}' is a machine credential. Reconstructing a provenance chain is a named `
                   + "member's act: the record must show which person decided that the evidence supported this route"
                 : "reconstructing a provenance chain is a named act: the record must show who decided "
                   + "that the evidence supported this route" };
    if (!bundleId)
      return actRefusal("NO_BUNDLE", "pass bundleId=<id>");
    /* The bundle the viewer may see (membership R43; absent and unseen answer alike), and the row values a relabel
       falls back on where the carried document states none (record-core R41 and its `bundles` read contract, R37). */
    const head = this.#record.head(bundleId);
    const seen = head && this.#membership.inSight(bundleId, viewer)
      ? { bundle_sha: head.bundleSha, object_type: head.type, group_id: head.groupId, title: head.title,
          current_state: head.currentState, prior_state: head.priorState,
          ...(this.#one(`SELECT created, last_updated, criticality FROM bundles WHERE bundle_id=?`, bundleId) || {}) }
      : null;
    if (!seen)
      return { ok: false, reason: "NO_SUCH_BUNDLE", bundleId };
    const img = this.#record.readImage(bundleId) || {};
    const raw = img["data/provenance.json"];
    if (typeof raw !== "string")
      return { ok: false, reason: "NO_REGISTER",
               detail: "this record carries no readable data/provenance.json, so there is no capture record to derive from" };
    let reg;
    try { reg = JSON.parse(raw); } catch {
      return { ok: false, reason: "UNPARSABLE_REGISTER", detail: "data/provenance.json is not valid JSON" };
    }
    const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
    if (!docs)
      return { ok: false, reason: "NO_DOCUMENTS", detail: 'data/provenance.json must be {"documents": [...]}' };

    const at = secondOf(this.#now());
    const instanceName = this.#instanceName;
    const report = [], refused = [];
    let changed = 0;
    const next = docs.map((d, i) => {
      const existing = d && typeof d === "object" ? d.provenance_chain : undefined;
      if (Array.isArray(existing) && existing.length) {
        report.push({ index: i, file: d.file ?? null, outcome: "already_recorded", hops: existing.length });
        return d;
      }
      const built = chainFromEvidence(d, { instanceName, at });
      if (!built.ok) {
        report.push({ index: i, file: (d && d.file) ?? null, outcome: "undetermined", missing: built.missing });
        refused.push(i);
        return d;
      }
      changed++;
      report.push({ index: i, file: (d && d.file) ?? null, outcome: "reconstructed",
                    hops: built.hops.length, who: built.hops.map((h) => h.who) });
      return { ...d, provenance_chain: built.hops };
    });

    if (refused.length)
      return { ok: false, reason: "EVIDENCE_INSUFFICIENT", bundleId, documents: report,
               /* REC-63 / D-204: the honest route, named in the refusal that
                  needs it. Until now a bundle whose chain could not be
                  reconstructed had nowhere to go but `retire`, which asserts
                  something quite different — that the document is withdrawn.
                  It has somewhere to go now: the doubt is RECORDED at the state
                  the document already sits in, which is what DEC-56 settles. */
               route: routeFinding("information", this.#latestRouteMark(bundleId)),
               detail: "the capture record does not hold a route for every document in this register, and a "
                     + "chain that cannot be reconstructed is UNDETERMINED rather than assumed. Nothing was "
                     + "written. Stating the route these bytes took would be an invention, which is the one "
                     + "thing this path exists to refuse. What CAN be done is to say so in the record: "
                     + "op=provenanceroute records a standing marker on this document that its route cannot "
                     + "be shown, leaving the document where it is (DEC-56, DEC-19)." };
    if (!apply || !changed)
      return { ok: true, bundleId, applied: false, changed, documents: report,
               /* REC-63: the marker travels with the report too, so an operator
                  deciding whether to rebuild sees whether this document already
                  carries a standing statement that its route cannot be shown. */
               route: routeFinding("information", this.#latestRouteMark(bundleId)),
               detail: changed ? "pass apply=1 to write these chains into the register" : "every document already records a chain" };

    /* Through promote, the plane's own write path, carrying every other file
       BYTE-FOR-BYTE. bundle.md is NOT touched: this corrects the register, and
       inventing a state transition or a new last_updated to describe that would
       be a second claim nobody made. */
    const text = JSON.stringify({ ...reg, documents: next }, null, 2);
    const bytes = new TextEncoder().encode(text);
    const carried = [];
    for (const path of this.#record.livePaths(bundleId) || []) {
      if (path === "data/provenance.json") continue;
      const f = this.#record.readFile(bundleId, path);
      if (!f) continue;
      carried.push(typeof f.text === "string"
        ? { path, text: f.text, bytes: te.encode(f.text).length, sha256: f.sha256 }
        : { path, blobSha: f.blobSha, sha256: f.sha256, bytes: f.bytes });
    }
    /* `meta` is rebuilt from THE ROW THIS BUNDLE ALREADY HAS, not from the
       frontmatter, and the difference is not cosmetic: bundle.md is deliberately
       not touched here, so every one of these values must come back UNCHANGED,
       and reading them from the projection is what guarantees that. Deriving
       them from frontmatter instead made a bundle whose document omits `created`
       fail promote's NOT NULL — a correction to the register destroying the
       bundle's identity over a field this operation has no business touching. */
    const promoted = this.#promotion.promote({
      bundleId, base: seen.bundle_sha, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`,
      author: who,
      files: [{ path: "data/provenance.json", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      /* D-563: the row's title and state are sent ONLY where the held document states none. `promote` now derives
         them from the document and refuses a label that contradicts it; relabelling from the ROW would refuse this
         correction on every bundle whose row an envelope once wrote apart from its bytes — M-172 counted 11 in `bio`
         (row `prior_state` null, document `collected`). Where the document states them the projection takes the
         document's value, which is the value the bundle's own bytes have always carried. */
      meta: { object_type: seen.object_type, group: seen.group_id,
              ...rowUnlessStated(carried, { title: seen.title, current_state: seen.current_state,
                                                   prior_state: seen.prior_state ?? null }),
              created: seen.created, last_updated: seen.last_updated,
              criticality: seen.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, bundleId, documents: report };
    /* `sha` is the promoted bundle's digest (promotion R1's `bundleSha`). Until N512 it read `promoted.sha`, a key
       `promote` never answers, so it was always null (PROVENANCE-ROUTES #1). */
    return { ok: true, bundleId, applied: true, changed, documents: report, sha: promoted.bundleSha ?? null };
  }
  /** The current finding for one bundle, or null when no assessment ever ran.
   *  Append-only: the highest `seq` is the current one and the ones before it
   *  stay readable, which is how correction moves forward here. */
  #latestRouteMark(bundleId) {
    return this.#one(
      `SELECT * FROM provenance_route_marks WHERE bundle_id=? ORDER BY seq DESC LIMIT 1`, bundleId) || null;
  }

  /** R5's read for one bundle: the latest mark read through `routeFinding`, for the reads that publish `route`
   *  beside a bundle (`op=list`, `op=audit`; once the retired legacy store's `#withRoute`). `objectType` is the bundle's. */
  routeOf(bundleId, objectType) {
    return routeFinding(objectType, this.#latestRouteMark(bundleId));
  }

  /** R6 — the route-marker tally over one audit page (record-core R68's `page`: `{bundles: [{bundleId, type, state}],
   *  after, last}`), registered as the audit's `route` finding (see the block above `ROUTE_FINDING_KEY`). Reads the
   *  standing mark of each bundle the page names, over the page's own id range, kept for the page's ids only. */
  routeTally({ bundles = [], after = "", last = null } = {}) {
    const page = Array.isArray(bundles) ? bundles.filter(isObj) : [];
    const ids = new Set(page.map((b) => b.bundleId));
    const top = last ?? (page.length ? page[page.length - 1].bundleId : null);
    const marks = new Map();
    if (page.length)
      for (const m of this.#rows(
        `SELECT m.* FROM provenance_route_marks m
          WHERE m.bundle_id > ? AND m.bundle_id <= ?
            AND m.seq = (SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id = m.bundle_id)`,
        String(after ?? ""), String(top)))
        if (ids.has(m.bundle_id)) marks.set(m.bundle_id, m);
    const tally = { LOOKED_INDETERMINATE: 0, PRESENT: 0, NEVER_LOOKED: 0, notApplicable: 0 };
    const marked = [];
    let markedTotal = 0;
    for (const b of page) {
      const found = routeFinding(b.type, marks.get(b.bundleId) || null);
      if (!found.applies) { tally.notApplicable++; continue; }
      tally[found.finding] = (tally[found.finding] || 0) + 1;
      if (!found.marked) continue;
      markedTotal++;
      if (marked.length < ROUTE_TALLY_MARKED_MAX) marked.push({ bundleId: b.bundleId, state: b.state, ...found });
    }
    return { tally, marked, markedTotal, markedShown: marked.length, means: OBSERVATION_MEANS, note: ROUTE_TALLY_NOTE };
  }

  /** R10 — this module's figure for `op=stats` and purge's proof (record-core R63), as the retired legacy store's
   *  `#counts` took it: `routeMarks`, keyed on `bundle_id`. `hid` (`{sql, args}`, the bundles the caller may not see,
   *  or null for a whole count) drops the rows naming a hidden bundle; a row whose column is null names none and is
   *  counted (`NULL NOT IN (…)` is NULL, so the column is read through COALESCE). Writes nothing. */
  counts(hid = null) {
    const hidden = isObj(hid) && typeof hid.sql === "string";
    const n = this.#one(
      `SELECT count(*) AS c FROM provenance_route_marks${hidden ? ` WHERE COALESCE(bundle_id, '') NOT IN ${hid.sql}` : ""}`,
      ...(hidden && Array.isArray(hid.args) ? hid.args : [])).c;
    return { routeMarks: n };
  }

  /** REC-63 / DEC-56: ASSESS one document's provenance route and record what was
   *  found — the act DEC-56's ruling licenses and D-204 said had nowhere to go.
   *
   *  IT RUNS THE SAME DERIVATION `op=provenancechain` RUNS, through the same
   *  `Store.chainFromEvidence`, and that is the point rather than a convenience:
   *  the marker must say the route cannot be shown for exactly the registers the
   *  reconstruction path refuses to invent a chain for, or the two would disagree
   *  about one fact and a member would have to know which to believe.
   *
   *  IT WRITES NOTHING INTO THE BUNDLE. No state moves, no file changes, no sha
   *  changes — the whole shape of DEC-56(b) is that the document stays where the
   *  group put it. `test/m/provenance-routes/chain-route.test.mjs` (R4) asserts the
   *  head (bundle_sha, current_state) is identical across a marking.
   *
   *  A REPEAT THAT FOUND THE SAME THING APPENDS NOTHING. The record adds when
   *  something changed; a second identical row would be the record repeating
   *  itself rather than saying anything, and it would let a caller grow the log
   *  without limit. */
  provenanceRouteAssess({ bundleId = "", author = null, viewer = null } = {}) {
    /* The helper sits ABOVE the region marker so its own variable-coded return is
       not inside the governed span — PL-15's and PL-14's convention, and the
       reason arm C of the DEC-49 guard (deleted at T20) could COMPARE every code below rather than read past it. */
    const refusal = rowRefusal(ROUTE_MARK_CHECKS);
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-route-mark
     *
     * THE SPAN `ROUTE_MARK_CHECKS`' four rows name (REC-71): the DOOR, and only
     * the door — is there a named member, and is there a captured document to
     * assess. Everything below this region is the assessment itself, which
     * REFUSES NOTHING BY DESIGN: an unreadable register is the marker's own
     * subject and not a complaint, so conscripting the rest of this method into
     * the family with a whole-function `where` would claim a span whose set
     * grows with the method and whose refusals are not this family's. */
    /* REC-158 (R4, as R3): a MACHINE principal is refused too, by the same row. The act is a named member's, and
       a bearer credential's `token:<class>` stamp is nobody's name (Membership v2 §4.10's provenance pair). */
    if (!who || isMachineIdentity(who))
      return refusal("ROUTE_MARK_NO_AUTHOR",
        who ? `'${who.slice(0, 60)}' is a machine credential. Recording that a route cannot be shown is a named `
              + "member's act: the record must show which person assessed the evidence and found it did not "
              + "support a route, and a credential's class is nobody's name."
            : "recording that a route cannot be shown is a named act: the record must show who assessed the "
              + "evidence and found it did not support a route. A standing statement with nobody's name on it "
              + "is not a statement.");
    if (!bundleId)
      return refusal("ROUTE_MARK_NO_BUNDLE", "pass bundleId=<id>");
    const gate = viewerPredicate(viewer);
    const seen = this.#one(
      `SELECT bundle_id, object_type, current_state FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
      bundleId, ...gate.args);
    if (!seen)
      return refusal("ROUTE_MARK_NO_SUCH_BUNDLE",
        "no document of that name is in the record, or none this viewer may see — the two answer "
        + "identically here, as they do on every read addressed to a record (REC-25/D-15).",
        { bundleId });
    if (seen.object_type !== "information")
      return refusal("ROUTE_MARK_NOT_A_DOCUMENT",
        `this record is a ${String(seen.object_type).slice(0, 40)}, and only a captured document `
        + "travelled a route to get into the record. Marking one would put a doubt on every question in "
        + "the store, which says nothing about any of them.",
        { bundleId, objectType: seen.object_type });
    /* END DEC-49 REGION is-route-mark */

    /* THE REGISTER IS READ, AND EVERY WAY IT CAN FAIL TO READ IS A FINDING
       RATHER THAN A REFUSAL. This is the ruling applied literally: a register we
       cannot read is precisely a route we cannot show, so the honest act is to
       record that, not to decline to answer. `op=provenancechain` refuses these
       same three conditions and is right to — it is being asked to WRITE a
       chain. The two ops meet one fact and carry opposite obligations. */
    const img = this.#record.readImage(bundleId) || {};
    const raw = img["data/provenance.json"];
    let registerState = "readable", docs = [];
    if (typeof raw !== "string") registerState = "absent";
    else {
      let reg = null;
      try { reg = JSON.parse(raw); } catch { reg = undefined; }
      if (reg === undefined) registerState = "unparsable";
      else if (!reg || !Array.isArray(reg.documents)) registerState = "no_documents";
      else if (!reg.documents.length) registerState = "empty";
      else docs = reg.documents;
    }

    const documents = [];
    let undetermined = 0;
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      const existing = d && typeof d === "object" ? d.provenance_chain : undefined;
      if (Array.isArray(existing) && existing.length) {
        documents.push({ index: i, file: (d && d.file) ?? null, outcome: "recorded", hops: existing.length });
        continue;
      }
      const built = chainFromEvidence(d, { instanceName: "unassessed", at: "1970-01-01T00:00:00Z" });
      if (built.ok) {
        documents.push({ index: i, file: (d && d.file) ?? null, outcome: "derivable" });
        continue;
      }
      undetermined++;
      documents.push({ index: i, file: (d && d.file) ?? null, outcome: "undetermined", missing: built.missing });
    }

    /* THE BUNDLE-LEVEL FINDING. Any document whose route cannot be shown makes
       the BUNDLE's route unshowable — the same whole-register posture
       `provenanceChainRebuild` takes, and for the same reason: a register half
       established is one where the reader cannot tell which half. */
    const finding = (registerState !== "readable" || undetermined > 0)
      ? "LOOKED_INDETERMINATE" : "PRESENT";
    const at = secondOf(this.#now());
    const docsJson = JSON.stringify(documents);

    const prev = this.#latestRouteMark(bundleId);
    const same = prev && prev.finding === finding && prev.register_state === registerState
      && prev.undetermined === undetermined && prev.documents_n === docs.length
      && prev.documents === docsJson;
    if (!same) {
      const seq = (this.#one(
        `SELECT COALESCE(MAX(seq), 0) AS m FROM provenance_route_marks WHERE bundle_id=?`, bundleId).m || 0) + 1;
      this.#sql.exec(
        `INSERT INTO provenance_route_marks
           (bundle_id, seq, at, by, finding, state_at, register_state, undetermined, documents_n, documents)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        bundleId, seq, at, who, finding, seen.current_state, registerState, undetermined, docs.length, docsJson);
    }
    return {
      ok: true, bundleId, appended: !same,
      route: routeFinding("information", this.#latestRouteMark(bundleId)),
      documents,
      detail: same ? "this assessment found exactly what the last one found, so nothing was appended: the "
                   + "record adds when something changed rather than repeating itself"
                   : finding === "LOOKED_INDETERMINATE"
                     ? "recorded: this document's route cannot be shown from the evidence held. Its state has "
                     + "NOT moved and no byte of it was touched"
                     : "recorded: every document in this register can show its route",
    };
  }

  /* ===================================================================== *
   * REC-116 / IC-120 — THE READ THE MARKER NEVER HAD.
   * ===================================================================== *
   *
   * REC-69's DELEGATION of 2026-08-09 asked one question — *which documents in
   * this instance carry a standing `LOOKED_INDETERMINATE` marker* — and the
   * INDEX for it landed 2026-08-08, one day before the sweep that would have
   * caught it. The reader never did. For 39 days `op=provenanceroute` was
   * `mutating: true`, a WRITE, `query.mjs` named this table ZERO times, and a
   * group wanting to know where its own record's provenance was doubted had to
   * page the whole store and count for itself. This is that reader.
   *
   * IT ANSWERS THE DELEGATED QUESTION AND NOT A WIDER ONE, AND THAT IS A
   * DECISION RATHER THAN AN OMISSION. `finding` is NOT a caller parameter: it is
   * bound from the constant below. A caller-chosen finding would have needed a
   * refusal for a value outside the stored vocabulary, and therefore a fifth
   * DEC-49 code minted for a READ — but the stronger reason is the row's own
   * warning. The cheapest wrong answer here is *an op that returns every
   * document with any route row at all*: non-empty, plausible, and not the
   * question. An op that cannot be ASKED for that cannot drift into it.
   *
   * ============ WHY THIS IS NOT `WHERE finding = 'LOOKED_INDETERMINATE'` =====
   *
   * THE TABLE IS APPEND-ONLY AND CORRECTION MOVES FORWARD (DEC-19, and the
   * schema comment says so). A document marked at `seq` 1 and re-assessed
   * showable at `seq` 2 has NO STANDING MARKER — the doubt was raised and then
   * answered. A bare `finding = ?` returns every document that EVER carried the
   * marker, which would publish a standing doubt over documents whose route the
   * record can now show. That is the record claiming more than it can support,
   * which `CLAUDE.md` ranks worse than a missing feature. So the predicate
   * carries the same `MAX(seq)` clause `routeTally` and `#latestRouteMark`
   * already use — three readers, one rule about what "current" means.
   *
   * ============ THE TWO FACTS THIS CONSTRUCT EXISTS TO SEPARATE =============
   *
   * *The op returned nothing* and *no document carries a marker* are DIFFERENT
   * FACTS, and an empty list that cannot say which is the unearned absence this
   * whole design was written against — D-129's vocabulary, `OBSERVATION-LOG-
   * DESIGN.md` §5.1's three causes, and `Store.routeFinding`'s own NEVER_LOOKED
   * branch are all the same rule. An empty page therefore always carries a
   * CAUSE, taken in order, and each one is a different statement about the
   * world:
   *
   *   `no_documents_visible`  this viewer can see no captured document at all,
   *                           so the question is not askable of them. Covers a
   *                           DENY stamp and an empty store, and those two are
   *                           deliberately indistinguishable — REC-25/D-15.
   *   `never_assessed`        documents exist and NOT ONE has ever been
   *                           assessed. NEVER_LOOKED, at the level of the whole
   *                           instance. This is the cause that is NOT "no
   *                           document carries a marker".
   *   `none_standing`         assessments exist and every one of them found the
   *                           route showable. THIS, and only this, is the
   *                           earned statement that no document carries a
   *                           marker — earned because somebody looked.
   *   `page_exhausted`        the caller paged past the last marked document.
   *                           An artefact of the cursor, not a fact about the
   *                           record, and saying so stops a reader banking it.
   *
   * AND `never_assessed` IS PUBLISHED EVEN WHEN THE PAGE IS FULL, because a
   * roster of marked documents drawn over a corpus half of which nobody ever
   * assessed is an answer whose COMPLETENESS is undetermined. `complete` says
   * which of those two the caller is holding. Sparse is the normal condition at
   * every level and absence at one level is not evidence of absence at the next.
   *
   * ============ THE FENCE =================================================
   *
   * A route mark names a DOCUMENT the group holds, so the page is resolved
   * through the viewer gate and a row naming a bundle this viewer cannot see —
   * or one that no longer exists — is WITHHELD WHOLE and counted nowhere. That
   * is REC-103's row-whole withholding at the document level and `op=airuns`'
   * rule for a collection read: absent, byte-identically to a row that never
   * existed. Nothing here publishes how many rows were withheld, because that
   * count is itself the disclosure.
   *
   * MEASURED RATHER THAN ASSUMED, because it changes what this fence is DOING:
   * `viewerPredicate` filters PROJECT bundles and nothing else (`query.mjs`,
   * and its own comment says the evidence corpus stays shared), and a route mark
   * can only ever name an `information` bundle — the write refuses every other
   * type with ROUTE_MARK_NOT_A_DOCUMENT. So for any RECOGNISED viewer this gate
   * withholds nothing, and the case it is load-bearing for is the UNRECOGNISED
   * one, where `viewerPredicate` returns `0=1` and the read fails closed. It is
   * applied anyway rather than reasoned away: the gate is the only place that
   * rule lives, and an op that skipped it would be correct today and wrong the
   * day the predicate widens. */

  provenanceRoutesMarked({ after = "", limit = null, viewer = null } = {}) {
    const gate = viewerPredicate(viewer);
    const asked = ROUTE_MARKED_FINDING;
    const after0 = String(after ?? "");
    /* THE BOUND IS APPLIED AND PUBLISHED. A bound applied and not published is
       REC-57's defect and it is not being re-created here. */
    const want = Number(limit);
    const n = Number.isFinite(want) && want > 0
      ? Math.min(Math.floor(want), ROUTE_MARKED_LIMIT_MAX)
      : ROUTE_MARKED_LIMIT_DEFAULT;

    /* One row over the bound, so `more` is MEASURED rather than inferred from a
       full page — a page that happens to be exactly `n` long is not evidence
       that there is another one. */
    /* THE PAGE STATEMENT IS WRITTEN INLINE, AND IT WAS A CONSTANT UNTIL AN
       INSTRUMENT SAID OTHERWISE. Holding it in `Store.ROUTE_MARKED_PAGE_SQL` read
       well and let the query-plan driver extract it — but `derivation-bounds`'
       D-365 arm grades every published `truncated` against the SQL OF THE ROW
       SOURCE IT WAS MEASURED OVER, and it read that SQL at the `#rows(` call
       (that legacy suite, `derivation-bounds.test.mjs`, was deleted at T20).
       With the statement behind a constant the arm reported
       `provenanceRoutesMarked:raw (no SQL LIMIT)` — a TRUE reading of what it
       could see, over a source that has carried `LIMIT ?` all along. The bound
       was real and invisible, which is the same defect as an unbounded read for
       every purpose that instrument serves. Inlining is this file's house shape
       for every other `#rows` call, so the deviation was mine; the driver still
       extracts these exact bytes (M-49), just from the call rather than from a
       constant. */
    const raw = this.#rows(
      `SELECT m.* FROM provenance_route_marks m
        WHERE m.finding = ?
          AND m.bundle_id > ?
          AND m.seq = (SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id = m.bundle_id)
        ORDER BY m.bundle_id
        LIMIT ?`, asked, after0, n + 1);
    const truncated = raw.length > n;
    const page = truncated ? raw.slice(0, n) : raw;

    /* The gate, over the PAGE'S OWN ID RANGE so this cannot become an unbounded
       scan of the bundles table — `routeTally`'s shape, and for the same reason. */
    const seen = new Map();
    if (page.length)
      for (const b of this.#rows(
        `SELECT b.bundle_id, b.current_state, b.object_type FROM bundles b
          WHERE b.bundle_id > ? AND b.bundle_id <= ? AND (${gate.sql})`,
        after0, page[page.length - 1].bundle_id, ...gate.args))
        seen.set(b.bundle_id, b);

    const documents = [];
    for (const m of page) {
      const b = seen.get(m.bundle_id);
      if (!b) continue;                      /* withheld whole, counted nowhere */
      documents.push({
        bundleId: m.bundle_id, state: b.current_state,
        ...routeFinding(b.object_type, m),
      });
    }

    /* THE CURSOR ADVANCES OVER WHAT WAS EXAMINED, NOT OVER WHAT WAS RETURNED.
       If it advanced over the returned rows, a withheld row would be re-read on
       every page and a caller whose whole page was withheld would loop forever
       on the same cursor.

       THE KEYS ARE `limit` / `truncated` / `cursor` AND NOT A NEW SPELLING, AND
       THAT WAS A CORRECTION RATHER THAN A CHOICE. This op's first draft published
       `more` and `nextAfter`, which read perfectly well and are used nowhere else
       in this plane. `meaning-bounds.test.mjs` (a legacy suite, deleted at T20) judged the op BARE — *a collection
       off an unbounded row source with no bound published* — and it was RIGHT by
       its own vocabulary: `MORE_KEY` knows `truncated`, `cursor`, `hasMore` and
       five more, and knows neither of the two this method had invented. The
       ratchet was not widened to admit them. REC-57's whole point is that every
       capped op settles its two questions IN ONE SHAPE, so a new read inventing a
       second spelling is the hand-copy defect arriving in a key name — and the
       instrument caught it the first time it ran. */
    const cursor = truncated && page.length ? page[page.length - 1].bundle_id : null;

    /* ============ THE CENSUS, ALL OF IT THROUGH THE SAME GATE ==============
       It is a GROUP BY over the standing rows rather than a count of the asked
       finding, and that is deliberate: a `finding = ?` count can only report
       what it was told to look for, so a third finding arriving in this table
       would be invisible to it and would silently shrink `assessed`. Inverting
       the question — report every finding that is actually standing — is the
       *invert, do not lengthen a list* rule, and it costs this one statement the
       use of the index. That is stated rather than hidden: the INDEX serves the
       PAGE above, which is the read the delegation asked for. */
    const standing = {};
    for (const r of this.#rows(
      `SELECT m.finding AS f, COUNT(*) AS n FROM provenance_route_marks m
         JOIN bundles b ON b.bundle_id = m.bundle_id
        WHERE m.seq = (SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id = m.bundle_id)
          AND b.object_type = 'information'
          AND (${gate.sql})
        GROUP BY m.finding`, ...gate.args))
      standing[r.f] = r.n;

    const documentsVisible = this.#one(
      `SELECT COUNT(*) AS n FROM bundles b WHERE b.object_type = 'information' AND (${gate.sql})`,
      ...gate.args).n;
    const assessed = Object.values(standing).reduce((a, b) => a + b, 0);
    const marked = standing[asked] || 0;
    const neverAssessed = Math.max(0, documentsVisible - assessed);

    /* The cause ladder. Order matters and each rung is a different statement. */
    let cause = null;
    if (!documents.length) {
      cause = documentsVisible === 0 ? "no_documents_visible"
            : assessed === 0         ? "never_assessed"
            : marked === 0           ? "none_standing"
            :                          "page_exhausted";
    }

    return {
      ok: true,
      finding: asked, means: FINDING_MEANS[asked],
      documents, returned: documents.length,
      limit: n, after: after0, cursor, truncated,
      /* `marked` is the TOTAL standing at this finding, beside a page bounded at
         `limit` — the two are different numbers and publishing only the page's
         would be REC-57's defect. */
      census: {
        documents_visible: documentsVisible,
        assessed, never_assessed: neverAssessed,
        standing, marked,
      },
      /* WHY THE ANSWER LOOKS THE WAY IT DOES, IN WORDS, ALWAYS. */
      cause,
      complete: neverAssessed === 0,
      says: !documents.length
        ? ROUTE_MARKED_CAUSES[cause]
        : `${marked} document${marked === 1 ? "" : "s"} in this record carry a standing marker saying `
          + `their route cannot be shown from the evidence held`,
      completeness: neverAssessed === 0
        ? "every captured document this viewer can see has been assessed at least once, so this roster "
          + "is complete over the corpus"
        : `${neverAssessed} of ${documentsVisible} captured documents have NEVER been assessed — `
          + "NEVER_LOOKED, which is the ABSENCE OF THE QUESTION HAVING BEEN ASKED and not a finding "
          + "that their routes can be shown. This roster is complete over what was assessed and says "
          + "nothing about the rest",
    };
  }
}

const instances = new WeakMap();

/** The one provenance-routes instance for `host` (the Durable Object's `ctx`, with its `storage`); `deps` are read on
 *  the first call only. At creation it declares its table to purge (R12; record-core R21), and registers the
 *  route-marker tally as the audit's `route` finding (R6; record-core R68) and its figure (R10; record-core R63), each
 *  under this module's name. The composition root builds it after `provenance`, so `routeMarks` follows `register`
 *  in `op=stats` (R10). */
export function provenanceRoutesOf(host, deps) {
  let p = instances.get(host);
  if (!p) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host);
    p = new ProvenanceRoutes({ ...d, storage: d.storage || host.storage, record, membership, promotion });
    instances.set(host, p);
    record.declarePurge(PROVENANCE_ROUTES_MODULE, PROVENANCE_ROUTES_TABLES);
    /* R6, record-core R68: the route-marker tally beside every audit page, under `route`. */
    record.registerAuditFinding(PROVENANCE_ROUTES_MODULE, ROUTE_FINDING_KEY, (page) => p.routeTally(page));
    /* R10, record-core R63: this module's figure for `op=stats` and purge's proof. */
    record.registerCounts(PROVENANCE_ROUTES_MODULE, ["routeMarks"], (hid) => p.counts(hid));
  }
  return p;
}

export { provenanceRouteOps } from "./ops.mjs";

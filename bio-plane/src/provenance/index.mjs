/* provenance — the record's trust root (requirements: `build/requirements/provenance.md`). It holds the register,
 * which says which bundle is the one home of each captured byte sequence; the plane's own acquisition receipts, which
 * say which bytes it fetched from which address, by which route and when; each document's chain of hops and the capture
 * grade its route earns; trusted timestamps over capture hashes; and a member's firsthand observation, the one capture
 * whose bytes are a person's own words. A hop attests bytes, address and time, never the credibility of the content.
 *
 * Extracted from the legacy modules (T4-2; K49, K59, K72): `store.mjs` (the register write and the testimony fence
 * that ran inside `promote`, `testify`, the chain and route-mark services, the register audit, census and holds, the
 * receipts and the version chain), `index.mjs` (`partsHeld` and the `attest` and `registeraudit` handlers), `schema.mjs`
 * (the three tables, now `./schema.mjs`) and `bio-checks.mjs` (the C-18 register arms, now `./register-checks.mjs`).
 * The legacy code's comments moved with it; where one names `Store.x`, the thing it names is now this module's `x`.
 *
 * REACHED as `provenanceOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps` and returned to every later caller. At creation it declares its tables to record-core's purge and
 * registers its check and projection with promotion (R1–R3, R42–R46). `deps`:
 *   record, membership, promotion  the modules it uses, `recordOf(host)`, `membershipOf(host)`, `promotionOf(host)`
 *                                  unless a test passes its own.
 *   now           the module's clock, an ISO instant (default: the wall clock). R1's `registered`, R13's receipts
 *                 when a caller gives none, R28's `recorded_at` and R29's `at` read it, never a caller's time.
 *   instanceName  the instance's name for a reconstructed hop (R19), default `unnamed`.
 *   signingKey    the instance's receipt-signing key (R34, K59): an Ed25519 private key, PKCS#8, base64; held as a
 *                 secret by the operator and replaceable. Absent, `signReceipt` answers that no key is bound. */

import { parseFrontmatter, isMachineIdentity, isPublicHttpsLocator, createSha256, TESTIMONY_CHECKS,
         ROUTE_MARK_CHECKS, VERSION_CHAIN_CHECKS, EARNED_CAPTURE_CEILING, BASIS_GRADES, TESTIMONY_GRADE, checkBundle }
  from "../../checks/bio-checks.mjs";
import { timestampRequest, parseTimestampResponse, TSA_ENDPOINTS, TSA_CONTENT_TYPE, TSA_ACCEPT, ARCHIVE_SAVE_BASE,
         ARCHIVE_SERVICE, archiveLocatorFrom } from "../tsa.mjs";
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK } from "../membership/index.mjs";
import { promotionOf, recordAudit, recordChecks } from "../promotion/index.mjs";
import { migrateProvenance } from "./schema.mjs";
import { registerChecks } from "./register-checks.mjs";

export { PROVENANCE_SCHEMA } from "./schema.mjs";

/** The tables this module owns (R41): no other module declares, writes or reshapes them. */
export const PROVENANCE_TABLES = ["register", "captured_locators", "provenance_route_marks", "origin_declarations",
                                  "signed_receipts", "receipt_keys"];
export { registerChecks } from "./register-checks.mjs";

const te = new TextEncoder();
const hexOf = (bytes) => createSha256().update(bytes).hex();
const hexBytes = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const secondOf = (iso) => String(iso).replace(/\.\d+Z$/, "Z");
const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = (s) => Uint8Array.from(atob(String(s)), (c) => c.charCodeAt(0));
/* A JSON parse that answers null for text that does not parse (the legacy store's `safeJson`). */
function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}
/* A digest as the register keys it: a `sha256:` prefix and case ignored (R5). */
const bareSha = (v) => (typeof v === "string" ? v.trim().replace(/^sha256:/, "").toLowerCase() : null);

/* D-129's vocabulary as the route marks use it: what each finding MEANS, word for word as `airun.mjs`'s
   OBSERVATION_STATES states it. That object sits in a later module (ai-runs), which this one cannot import (P4);
   the three meanings a route finding can carry are held here, and the copy is reported (job record). */
const FINDING_MEANS = {
  NEVER_LOOKED:         "nobody looked at this level for this subject",
  LOOKED_INDETERMINATE: "we looked and could not tell",
  PRESENT:              "we looked and it is there",
};

/* D-15: the bundle gate compiled over a QUALIFIED column (the legacy store's `#bundleGate`), for reads that join a
   row carrying a bundle id to the viewer predicate (membership R43) over record-core's `bundles` (its R37). */
function bundleGate(col, viewer) {
  if (typeof col !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(col))
    throw new Error(`REFUSED: the D-15 bundle gate needs a QUALIFIED column (got ${col}). `
      + "An unqualified name binds to `bundles` inside the gate's own subquery and passes everything.");
  const gate = viewerPredicate(viewer);
  if (gate.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
  if (gate.scope === "DENY") return { sql: gate.sql, args: [] };
  return {
    sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b
            WHERE b.bundle_id = ${col} AND (${gate.sql})))`,
    args: gate.args,
  };
}

/* ======================================================================= *
 * CAPTURE GRADE, FROM THE ROUTE (R24–R27; D-177, D-693, D-709; DEC-75: capture grade is about the fetch path).
 * ======================================================================= */

/** The receipt `via` of a capture read through an archive replay (D-96's split; ARCHIVE-FALLBACK.md). */
export const ARCHIVE_VIA = "archive.org";

/** R25 · D-693 (BOB #35, 2026-09-25 07:55Z): what a capture whose only recorded source is an archive replay earns on
 *  the capture axis, DERIVED rather than typed: one rank below the direct ceiling in the same BASIS_GRADES array a
 *  leg is compared against, because grade tracks directness and the archive hop is one more party between the
 *  record and the publisher (AUTHORITY-AND-TRUST's transitive trust "with disclosure and grade adjustment";
 *  ARCHIVE-FALLBACK.md's two-hop chain). Move the ceiling and this letter moves with it; null rather than a lie if
 *  the ceiling were ever the weakest letter. The one definition, exported for every reader (op=acquire's stamp on
 *  an archive capture, the earned registry). */
export const ARCHIVE_CAPTURE_GRADE = BASIS_GRADES[BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING) + 1] ?? null;

/* ======================================================================= *
 * THE CHAIN (R19) AND THE ROUTE FINDING (R23), both pure.
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
 * document. `STATES.information.edges` is untouched by this item and the suite
 * pins that it stays untouched.
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
 * vocabulary taken LIVE from `airun.mjs` rather than a fifth private spelling
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
             note: "a route is a fact about a captured document, and this bundle is not one" };
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

/* The route-mark read's constants (R23). In the legacy store they were declared after the method that used them, so
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
/* PL-10 / D-220. The chain's bound, in the pair every capped read in this
   file publishes: the default a caller gets by saying nothing, and the
   ceiling a caller cannot ask past. 200 because a weekly capture of one
   calendar reaches roughly 50 versions a year and a member reading a chain is
   reading a HISTORY, not paging a corpus; 1000 because past that the answer
   stops being something a person reads and becomes something a run walks,
   and a run has `offset`. Named rather than literal so REC-57's roster walk
   can see this method carries a cap at all. */
export const VERSION_CHAIN_LIMIT_DEFAULT = 200;
export const VERSION_CHAIN_LIMIT_MAX = 1000;

/* ==================================================================== *
 * MK-1 / D-184 / IC-133 / IC-134 — THE AUTHORED BUNDLE.
 *
 * `MEMBER-KNOWLEDGE-DESIGN.md` §2, read at the artifact before this was built
 * (§8's condition): *an observation is an authored INFORMATION bundle whose
 * bytes are exactly the member's words, registered like any capture, so that it
 * IS content in the record's one sense of the word … and every reader already
 * built works on it unchanged.* Bob's ruling it serves (§1, quoted there): *a
 * member's own eyewitness knowledge can be evidence — though it stands on the
 * trust held by that member.*
 *
 * WHAT IT IS, BUILT OUT OF WHAT EXISTED. An INFO bundle, written through
 * `promote` — the one write path — with the member's words — below the canonical header (`Store.testimonyBytes`) — as a file under
 * `snapshots/`, a `data/provenance.json` document declaring origin `member`,
 * actor class `member` and `authored: true`, and a register row over the
 * words' bytes. In the SAME transaction: one passage-index unit over the whole
 * words (so `passage:` search finds them) and one `document` content row
 * (so a leg can cite them by `content_id` exactly as it cites any row).
 *
 * WHAT KEEPS IT HONEST, and it is the half that matters (§2): a capture of a
 * publisher's document and a member's authored statement are different acts
 * and the register must never let one pass for the other.
 *   - the `authored` flag is settable ONLY here — `TESTIMONY_PATH` is a Symbol,
 *     which no JSON body can carry — and `#testimonyFence` refuses it at
 *     `promote` on anything this method did not write (C-53.8);
 *   - the author is STAMPED by the control plane from the session; a caller
 *     naming one is refused (C-53.2), and a machine is refused (C-53.1);
 *   - two dates, kept apart: `observed_at` is the member's statement,
 *     `recorded_at` is this record's own clock and is not taken from the caller;
 *   - the words are the member's AS WRITTEN, after a canonical header of the testimony's id and observed_at (BOB #14, 2026-09-18) — nothing trims, paraphrases
 *     or cleans them. An edit is a new observation, never a rewrite.
 *
 * HOW IT READS ON THE THREE AXES (MK-2 built the third, §3): the TESTIMONY
 * axis earns TESTIMONY_GRADE — `earnedBasisRegistry`'s `testimony` map, from
 * the register's `authored` flag and from nothing else; the CAPTURE axis earns
 * NO letter for an authored capture — undetermined and stated
 * (`CAPTURE_AXIS_AUTHORED`) — because the axis measures the act of reading a
 * document in, which did not happen; the CONNECTION axis earns nothing, since
 * no reader ran over the words and nothing resolved them. A leg citing an
 * observation is graded on the testimony axis or not at all (checkTestimonyLeg).
 * ==================================================================== */

/** One passage: the same per-unit cap the content-grain text index stores a
 *  unit to, for `TRANSCRIPTION_MAX_BYTES`'s reason — REFUSED over it, never
 *  cut, because words silently truncated are words the member did not write. */
export const TESTIMONY_MAX_BYTES = 128 * 1024;   /* CAPTURE_TEXT_UNIT_CAP, 131,072 B (M-20) */

/** THE CANONICAL AUTHORED BYTES — PERMANENT ONCE ON MAIN, so stated exactly.
 *
 *  Ruled by BOB #14, 2026-09-18 (MK-1 design gap 1): identical words from two
 *  members are two testimonies, and the register is keyed by the bytes' sha,
 *  so the bytes carry a header that makes them unique per testimony. The
 *  format, byte for byte, UTF-8:
 *
 *      bio-testimony/1\n
 *      id: <the testimony's own bundle id>\n
 *      observed_at: <the member's observedAt, exactly as accepted>\n
 *      \n
 *      <the member's words, exactly as written — nothing added after them>
 *
 *  Three header lines in THIS order, each `key: value` with one space, LF line
 *  ends, then ONE empty line; the words begin at the first byte after the first
 *  "\n\n" and run to the end of the file. `bio-testimony/1` names the format so
 *  a later one is a new version line, never a silent change. Both values are
 *  single-line by construction (`id` is canonical, `observed_at` is validated
 *  to a date or instant), so the header cannot be forged from inside the words.
 *
 *  NO AUTHOR IDENTITY IS IN THE BYTES, by the same ruling: who the author is
 *  and what a published case shows of them is the attribution level's to
 *  govern (§4), and bytes are what verification publishes. The author is in
 *  the REGISTER alone (`register.author`, written only under TESTIMONY_PATH);
 *  every other file of the bundle names them by `Store.observerRef` (§4.1). */
export const TESTIMONY_FORMAT = "bio-testimony/1";
export function testimonyBytes({ id, observedAt, words }) {
  return `${TESTIMONY_FORMAT}\nid: ${id}\nobserved_at: ${observedAt}\n\n${words}`;
}

/** MK-6 — THE BUNDLE NEVER NAMES ITS AUTHOR (MEMBER-KNOWLEDGE-DESIGN.md §4.1,
 *  BOB #19, 2026-09-21). §2 kept the author out of the testimony BYTES; §4.1
 *  extends the rule to EVERY file of an authored bundle, because a ratified
 *  bundle's files are exactly what the published bucket receives. Wherever a
 *  file records who authored it (the Session Log, `data/provenance.json`'s
 *  `author` and its chain's `who`), it writes this OPAQUE, PER-OBSERVATION
 *  reference instead of the member. One reference per testimony, so two
 *  observations by one member are unlinkable by construction. Only the
 *  register's `author` column resolves it, privately. The bundle is therefore
 *  the same bytes at every attribution level, and the level lives outside it
 *  (§4.3). */
export function observerRef(testimonyId) {
  return `observer:${testimonyId}`;
}

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

/* A refusal carrying its catalogue row, for a family this module's Uses name (legacy-checks, K72 (5)). The code is a
   literal at each site, so DEC-49's guard reads which code a region mints. */
const rowRefusal = (family) => (code, detail, extra) => {
  const row = family[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
};

/* ======================================================================= *
 * THE MEMBER'S OBSERVATION: its bytes and its reference (R28).
 * ======================================================================= */

/** MK-1: the key under which `testify` tells `promote`, and this module's registered step, that a package is the
 *  testimony path's own. A Symbol, so no JSON body a caller sends can carry it: the `authored` flag is settable only by
 *  `testify` (R3, R38). A later module's projection that writes the observation's content (the passage index, the
 *  content row, the extraction look; K31) reads the payload under this key: `{captureSha, author, observedAt,
 *  recordedAt, words}`. */
export const TESTIMONY_PATH = Symbol("mk1-testimony-path");

/** The legacy store's `observedMs`: when the member says they observed it, a calendar date or a UTC instant, a real
 *  one (2026-02-31 is refused, not rolled over), as epoch ms — or null. REQUIRED, and that STANDS by BOB #14's ruling
 *  of 2026-09-18: the record does not date a member's observation for them. */
function observedMs(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?Z)?$/.exec(v);
  if (!m) return null;
  const ms = Date.parse(m[4] === undefined ? `${v}T00:00:00Z` : v);
  if (!Number.isFinite(ms)) return null;
  const back = new Date(ms).toISOString();
  if (back.slice(0, 10) !== v.slice(0, 10)) return null;
  return ms;
}


/* ======================================================================= *
 * THE EVIDENCE STORE: parts (R7), the audit's probe (R8, R9), trusted timestamps (R31–R33). Each takes the evidence
 * store as callbacks (`head`, `get`, `put` by digest), record-core's R38 in the Durable Object and the bucket keyed
 * by the control plane in the Worker, so the one rule runs at every door.
 * ======================================================================= */

/* D-533: ARE THESE PARTS, AS THE RECORD NAMES THEM, HELD — each present under its own content address and its
   digest verified? `op=registeraudit` asks it of a capture held only in parts (Intake Doctrine section 8, BOB #33's
   ruling of 2026-09-24 21:17Z). A part is VERIFIED when R2 reports the SHA-256 it checked at the put (both
   writers, `op=acquire` and `op=capture`, pass it) and that digest is the one the record names, and the stored
   size is the record's. An object carrying no such checksum is read and hashed when it is no larger than one
   acquire part; a larger one is left UNVERIFIED and said so, never passed. Three lists, each naming the part:
   `missing`, `disagree` (size or digest), `unverified`.
   D-556 (BOB #34, 2026-09-25 00:00Z): THREE READERS, ONE RULE. The ratify gate asks it of a whole-hash register row
   held in parts before admitting it, and publication asks it again of the PUBLISHED bucket after copying the parts
   across, so `keyOf` names the bucket's key for a part's hash rather than this function assuming the working one. */
export const PART_VERIFY_READ_MAX = 8 * 1024 * 1024;
export async function partsHeld(bucket, keyOf, parts) {
  const missing = [], disagree = [], unverified = [];
  for (const p of parts) {
    const name = { file: p.file, sha256: p.sha256, bytes: p.bytes };
    const h = await bucket.head(keyOf(p.sha256));
    if (!h) { missing.push(name); continue; }
    if (h.size !== p.bytes) { disagree.push({ ...name, stored_bytes: h.size }); continue; }
    let digest = h.checksums?.sha256 ? hexBytes(h.checksums.sha256) : null;
    if (!digest && h.size <= PART_VERIFY_READ_MAX) {
      const o = await bucket.get(keyOf(p.sha256));
      if (o) digest = hexBytes(await crypto.subtle.digest("SHA-256", await o.arrayBuffer()));
    }
    if (!digest) unverified.push({ ...name, why: "no stored checksum, and too large to read here" });
    else if (digest !== p.sha256) disagree.push({ ...name, stored_sha256: digest });
  }
  return { missing, disagree, unverified };
}

/** R8, R9 — the register audit's report, from the store's classification of every register row (`registerRows`)
 *  and a probe of the evidence store (`evidence`: `{head, get}` by digest; null when the instance has none). Every
 *  row the store could not resolve from the bundle image is probed:
 *    captured       the bytes are not in the bundle image but ARE in the working bucket, whole, and the size agrees
 *    mismatched     the register and the stored object disagree about size, or a part about its digest
 *    held_in_parts  every part the record names is held and verified, and the parts' sizes sum to the row's
 *    unbacked       not held, a part missing, or the home gone: the one broken state, with its reason
 *    undetermined   the record's parts cannot be read, or a part is present and unverified: counted OUTSIDE `sound`
 *  REC-52: this answer is a SOUNDNESS VERDICT about the register, so an audit that could not probe says so
 *  (`probed: false`) and calls every unresolved row unbacked with that reason, never clean. */
export async function registerAuditReport(r, evidence) {
  const canProbe = !!(evidence && typeof evidence.head === "function");
  const captured = [], unbacked = [], mismatched = [], heldInParts = [], undetermined = [];
  for (const { named_parts: named, ...row } of r.unresolved || []) {
    if (row.class === "orphan") { unbacked.push({ ...row, why: "the bundle itself is absent" }); continue; }
    if (!canProbe) { unbacked.push({ ...row, why: "no capture bucket is configured to check" }); continue; }
    const h = await evidence.head(row.capture_sha);
    if (h) {
      if (typeof row.bytes === "number" && h.size !== row.bytes)
        mismatched.push({ ...row, registered: row.bytes, stored: h.size });
      else captured.push(row);
      continue;
    }
    /* D-533 (BOB #33, 2026-09-24 21:17Z; Intake Doctrine section 8): A CAPTURE HELD IN PARTS HAS NO
       WHOLE KEY. `op=acquire` stores a multi-part document only as its parts, so the head above misses for
       every one of them and this audit called held bytes missing and the record unsound. The ruling: such
       a row is SOUND when every part the record names is present and each part's digest is verified
       ("held in parts, all present"); a missing part is NAMED; and a row resolving neither way is
       UNDETERMINED, counted outside `sound`, never inside it. */
    if (named?.state === "unreadable") { undetermined.push({ ...row, why: named.why }); continue; }
    if (named?.state !== "named") { unbacked.push({ ...row, why: "no bytes in the working bucket" }); continue; }
    const v = await partsHeld(evidence, (s) => s, named.parts);
    const sum = named.parts.reduce((n, p) => n + p.bytes, 0);
    if (v.missing.length)
      unbacked.push({ ...row, why: `${v.missing.length} of the ${named.parts.length} parts the record names `
                                 + `are not in the working bucket`, missing_parts: v.missing });
    else if (v.disagree.length || (typeof row.bytes === "number" && sum !== row.bytes))
      mismatched.push({ ...row, registered: row.bytes, stored: sum,
                        ...(v.disagree.length ? { disagreeing_parts: v.disagree } : {}) });
    else if (v.unverified.length)
      undetermined.push({ ...row, why: `every part the record names is present, but the digest of `
                                     + `${v.unverified.length} could not be verified`, unverified_parts: v.unverified });
    else heldInParts.push(row);
  }
  return {
    total: r.total, live: r.live, superseded: r.superseded, historical: r.historical,
    captured: captured.length, held_in_parts: heldInParts.length,
    mismatched: mismatched.length, unbacked: unbacked.length, undetermined: undetermined.length,
    sound: unbacked.length === 0 && mismatched.length === 0, probed: canProbe,
    detail: "captured means the bytes are not in the bundle image but ARE in the working bucket, which "
          + "is the deliberate pattern migrate.mjs uses and what the two-bucket design exists for. "
          + "held_in_parts is the same for a document the store keeps only in parts: every part the "
          + "record names is in the working bucket and each part's digest is verified (the reassembled "
          + "whole's digest is C-18.6's check, not re-read here). "
          + "unbacked is the only broken state, and names any missing part; mismatched means the register "
          + "and the stored object disagree about size, or a part about its digest. undetermined rows "
          + "resolved neither way and are counted OUTSIDE sound: sound speaks for the other rows only.",
    sample: [...unbacked, ...mismatched, ...undetermined].slice(0, 40),
  };
}

/* Trusted timestamps: why the plane asks for them at all.
 *
 * A trusted timestamp (RFC 3161) is a signature by a third party over a hash and an instant, under a key outside our
 * control, so it proves the capture EXISTED at the claimed instant, which is the part an attacker holding a write
 * token cannot forge.
 *
 * Every attempt is recorded, successes and failures alike, in the shape C-18.1 requires. The doctrine is explicit
 * that a failed attempt is recorded with its reason and never omitted: a provenance register showing no attempt and
 * one showing an attempt that failed are different claims, and collapsing them would let an absence read as a
 * success. */
/** R31–R33 — `attest({sha256, archive, locator}, {head, put, fetch, holds, now})`. `head(sha)` and `put(sha, bytes)`
 *  are the evidence store by digest; `fetch` the network (R39: only the compiled endpoints `signatures` names are
 *  asked); `holds(sha)` asks the record whether a receipt or the register names the hash (`registerHolds`, R5), and
 *  answers null when the record could not be asked. Answers `{ok, attempts, archive?, attestation?, held?, note}` or a
 *  refusal (`BAD_SHA`, `CAPTURE_HELD_IN_PARTS`, `NO_SUCH_CAPTURE`). Never throws for a well-formed call. */
export async function attest(body, { head, put, fetch: fetchFn, holds, now = () => new Date().toISOString() } = {}) {
  const sha = typeof body?.sha256 === "string" ? body.sha256.toLowerCase() : "";
  if (!/^[0-9a-f]{64}$/.test(sha))
    return { ok: false, reason: "BAD_SHA", detail: "attest takes the sha256 of a capture already in the store" };
  /* D-530: A MISS ON THE WHOLE-HASH KEY IS NOT ABSENCE. A document over one part
     is stored ONLY as its parts, each under its own hash, and never under the
     whole's (D-469, D-476), so this head misses for every such capture - and the
     setup surface attests the whole hash straight after acquiring it. The
     refusal it gave, "nothing in this store has that hash; capture the document
     before attesting it", was false for bytes the record holds and sent a member
     to capture them again. So a miss asks the store the whole-document question
     (Intake Doctrine section 8, D-476's `registerholds`), and three answers are
     kept apart:
       - the plane's own ACQUISITION RECEIPT names the hash: the plane hashed
         these bytes as they arrived and keeps them in parts, and no caller can
         write that row. The hash is attested, and the answer says how it is held.
       - only the REGISTER names it: a row `op=promote` wrote from what its caller
         named, without reading R2 (D-45). A timestamp is not rested on that
         alone, and the bytes are not called absent either: CAPTURE_HELD_IN_PARTS.
       - neither, or the store did not answer: NO_SUCH_CAPTURE, saying what was
         asked rather than that nothing anywhere holds the bytes. */
  let held = null;
  if (!(await head(sha))) {
    let holdsAnswer = null;
    try { holdsAnswer = typeof holds === "function" ? await holds(sha) : null; } catch { holdsAnswer = null; }
    if (holdsAnswer && holdsAnswer.acquired === true) {
      held = { form: "parts", on: "acquisition_receipt",
               detail: "no object is stored under this hash, because the document was captured in parts "
                     + "and only its parts are stored, each under its own hash. This plane hashed the "
                     + "whole document as it arrived and recorded that receipt, which is what this "
                     + "attestation rests on." };
    } else {
      /* DEC-49 REGION is-attest-parts */
      if (holdsAnswer && holdsAnswer.registered === true)
        return { ok: false, reason: "CAPTURE_HELD_IN_PARTS", sha256: sha,
          detail: "the record's register names these bytes, but no object is stored under this hash and "
                + "this plane holds no receipt of having acquired them, which is the shape of a document "
                + "kept only in parts. A register row is written from what the promoting caller named, so "
                + "a timestamp is not rested on it alone. Nothing here says the bytes are missing." };
      /* END DEC-49 REGION is-attest-parts */
      return { ok: false, reason: "NO_SUCH_CAPTURE",
               detail: holdsAnswer
                 ? "no object is stored under that hash, the register holds no row for it under a "
                   + "bundle that exists, and this plane holds no receipt of having acquired it"
                 : "no object is stored under that hash, and the store could not be asked whether "
                   + "its register or an acquisition receipt names it, so this is not a finding that "
                   + "the record lacks the bytes" };
    }
  }

  const stamp = () => secondOf(now());
  const attempts = [];
  let token = null, tokenSha = null, service = null;
  for (const endpoint of TSA_ENDPOINTS) {
    const attempted = stamp();
    try {
      const { der } = timestampRequest(sha);
      const res = await fetchFn(endpoint, {
        method: "POST", body: der,
        headers: { "content-type": TSA_CONTENT_TYPE, accept: TSA_ACCEPT },
      });
      if (!res.ok) {
        attempts.push({ service: endpoint, attempted, ok: false, note: `http ${res.status}` });
        continue;
      }
      const parsed = parseTimestampResponse(new Uint8Array(await res.arrayBuffer()), sha);
      if (!parsed.ok) {
        attempts.push({ service: endpoint, attempted, ok: false, note: parsed.reason });
        continue;
      }
      tokenSha = hexBytes(await crypto.subtle.digest("SHA-256", parsed.token));
      await put(tokenSha, parsed.token);
      token = parsed.token; service = endpoint;
      attempts.push({ service: endpoint, attempted, ok: true, kind: "rfc3161",
                      token_sha256: tokenSha, token_bytes: parsed.token.length });
      break;
    } catch (e) {
      attempts.push({ service: endpoint, attempted, ok: false, note: String(e && e.message || e).slice(0, 120) });
    }
  }

  /* The opt-in second path. Off unless the caller asks, because asking a
     public archive to fetch a URL publishes the fact of interest, and that
     is a tactical judgement rather than a default. */
  let archive = null;
  if (body.archive === true) {
    const attempted = stamp();
    const locator = typeof body.locator === "string" ? body.locator : "";
    if (!isPublicHttpsLocator(locator)) {
      attempts.push({ service: ARCHIVE_SERVICE, attempted, ok: false,
                      note: "no public https locator to archive" });
    } else {
      try {
        const res = await fetchFn(ARCHIVE_SAVE_BASE + locator, { redirect: "follow" });
        const archived = archiveLocatorFrom(res, locator);
        if (res.ok && archived) {
          archive = { service: ARCHIVE_SERVICE, locator: archived };
          attempts.push({ service: ARCHIVE_SERVICE, attempted, ok: true,
                          kind: "co-archive", archived_locator: archived });
        } else {
          attempts.push({ service: ARCHIVE_SERVICE, attempted, ok: false,
                          note: res.ok ? "archived but returned no locator" : `http ${res.status}` });
        }
      } catch (e) {
        attempts.push({ service: ARCHIVE_SERVICE, attempted, ok: false,
                        note: String(e && e.message || e).slice(0, 120) });
      }
    }
  }

  return {
    ok: !!token,
    attempts,
    ...(archive ? { archive } : {}),
    ...(token ? {
      attestation: {
        file: `snapshots/timestamp-${tokenSha.slice(0, 12)}.tsr`,
        kind: "rfc3161", service, sha256: tokenSha, bytes: token.length,
        over: sha,
      },
      note: "A trusted timestamp over the capture hash. Anyone can check it with openssl ts -verify against the authority's certificate; this plane obtains and stores it, and does not claim to have verified the signature.",
      ...(held ? { held } : {}),
    } : {
      reason: "NO_ATTESTATION",
      note: "Every attempt was recorded. A register showing a failed attempt and one showing no attempt are different claims, so the failures above belong in the document rather than being dropped.",
    }),
  };
}

/** The HTTP status `op=attest` answers each outcome with (the control plane's envelope keeps it). */
export function attestStatus(a) {
  if (a && a.ok) return 200;
  return { BAD_SHA: 400, CAPTURE_HELD_IN_PARTS: 409, NO_SUCH_CAPTURE: 404 }[a && a.reason] ?? 502;
}

/* ======================================================================= *
 * THE C-18 ARMS AT THE GATE AND IN THE AUDIT (K72 (4); K64's pattern), so moving them out of the catalogue loses none.
 * ======================================================================= */

/* An image (path → text, or a blob reference) as the arms read it: the files, the elided paths and the front matter. */
function imageForChecks(image) {
  const files = new Map(), elided = new Set();
  for (const [path, v] of Object.entries(image || {})) (typeof v === "string" ? files.set(path, v) : elided.add(path));
  const md = files.get("bundle.md");
  const fm = typeof md === "string" ? parseFrontmatter(md).data : null;
  return { files, elided, fm: isObj(fm) ? fm : null };
}

/** The gate's answer (promotion's `runGate`, R27–R29) with the C-18 register arms run over the same image after it:
 *  an error finding joins `findings` and makes `ok` false, a warning adds to `warnings`. */
export function withRegisterChecks(image, gate) {
  const found = registerChecks(imageForChecks(image));
  const errors = found.filter((x) => x.severity === "error")
    .map((x) => ({ check: x.check, detail: x.message, ...(x.repairs ? { repairs: x.repairs } : {}) }));
  const findings = [...(gate.findings || []), ...errors];
  return { ...gate, ok: gate.ok && errors.length === 0, findings,
           warnings: (gate.warnings || 0) + found.length - errors.length };
}

/** K64's pattern for this module: promotion's audit (`recordAudit`, itself record-core's `auditPass` with promotion's
 *  checks) with the C-18 register arms run over the same page, so the audit loses none of them. A bundle they find in
 *  error that the pass counted clean is counted with errors instead, once; the tallies and offenders carry them. */
export async function provenanceAudit(host, opts = {}) {
  const pass = await recordAudit(host, opts);
  const record = recordOf(host);
  const out = { ...pass, tally: { ...(pass.tally || {}) }, offenders: [...(pass.offenders || [])] };
  const tallyDetail = { ...(pass.tallyDetail || {}) };
  const sha256 = async (v) => hexBytes(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te.encode(v) : v));
  const sha512 = async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b));
  for (const id of pass.page || []) {
    const moved = registerChecks(imageForChecks(record.readImage(id) || {})).filter((x) => x.severity === "error");
    if (!moved.length) continue;
    /* Re-judged whole, as promotion's wrapper does: the pass counted this bundle clean unless the catalogue or
       promotion's moved checks found an error in it, and a bundle is counted once. */
    const img = record.readImage(id) || {};
    const files = new Map(), elided = new Set();
    for (const [path, v] of Object.entries(img)) (typeof v === "string" ? files.set(path, v) : elided.add(path));
    const { findings } = await checkBundle({ folderName: id, files, elidedPaths: elided, sha256, sha512,
      resolveTarget: (t) => !!record.bundleInfo(t),
      ...(typeof opts.context === "function" ? (opts.context(id) || {}) : {}) });
    const before = [...findings, ...await recordChecks({ folderName: id, files, sha256 })].filter((x) => x.severity === "error");
    if (!before.length) { out.clean--; out.withErrors++; }
    const at = out.offenders.findIndex((o) => o.bundleId === id);
    for (const e of moved) {
      out.tally[e.check] = (out.tally[e.check] || 0) + 1;
      if (e.code) { const k = `${e.check}/${e.code}`; tallyDetail[k] = (tallyDetail[k] || 0) + 1; }
    }
    const extra = moved.map((e) => ({ check: e.check, detail: e.message }));
    if (at >= 0) out.offenders[at] = { bundleId: id, errors: [...out.offenders[at].errors, ...extra].slice(0, 5) };
    else if (out.offenders.length < 20) out.offenders.push({ bundleId: id, errors: extra.slice(0, 5) });
  }
  if (Object.keys(tallyDetail).length) out.tallyDetail = tallyDetail;
  return out;
}


/* ======================================================================= *
 * THE MODULE
 * ======================================================================= */

class Provenance {
  #storage; #sql; #record; #membership; #promotion; #now; #instanceName; #signingKey;
  #listeners = [];        // R47: {module, fn, rank}
  #order;

  constructor({ storage, record, membership, promotion, now, instanceName, signingKey, order } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#promotion = promotion;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
    this.#instanceName = typeof instanceName === "string" && instanceName ? instanceName : "unnamed";
    this.#signingKey = typeof signingKey === "string" && signingKey.trim() ? signingKey.trim() : null;
    this.#order = Array.isArray(order) ? order : [];
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** This module's tables (R41), created or brought up to shape. Called by the host at every boot; idempotent. */
  migrate() {
    migrateProvenance(this.#sql);
    return { ok: true };
  }

  /* ===================================================================== *
   * R1–R3, R42–R46: THE REGISTER, WRITTEN INSIDE A PROMOTION (promotion R39, K31).
   * ===================================================================== */

  /* The check, before anything is written: the testimony fence (R3) and one capture, one home (R2), then the C-18
     register arms (R42–R46). A refusal refuses the whole promotion (promotion R2). */
  #check(c) {
    const { pkg, bundleId, files, register, head, promotedType, replay } = c;
    const testimony = pkg && pkg[TESTIMONY_PATH] ? pkg[TESTIMONY_PATH] : null;
    const fenced = this.#testimonyFence(bundleId, files, register, testimony,
      { identity: pkg ? pkg.actorIdentity ?? null : null, viewer: pkg ? pkg.actorViewer ?? null : null });
    if (fenced) return fenced;
    return this.#registerArms({ bundleId, files, head, promotedType, replay, docFm: c.docFm });
  }

  /* R42–R46 at the write (K72 (4)): the C-18 arms over the promoted package, for an information bundle whose register
     is present. Every error finding of a creation refuses it; a revision is refused for an error finding the held
     version does not already carry, so a promotion never adds a violation and is never refused for one it inherited
     (correction moves forward; Q1 in the job record). A replay is exempt, as the gathering grammar's check is: the
     record's history must be holdable verbatim. A warning (C-18.4) never refuses. */
  #registerArms({ bundleId, files, head, promotedType, replay, docFm }) {
    if (replay) return null;
    const type = String(promotedType ?? "").toLowerCase();
    if (type !== "information") return null;
    if (!files.some((f) => f && f.path === "data/provenance.json")) return null;
    const asImage = (list) => {
      const img = {};
      for (const f of list) if (f && typeof f.path === "string") img[f.path] = typeof f.text === "string" ? f.text : { blobSha: f.blobSha };
      return img;
    };
    const now = registerChecks({ ...imageForChecks(asImage(files)), fm: isObj(docFm) ? docFm : imageForChecks(asImage(files)).fm })
      .filter((x) => x.severity === "error");
    if (!now.length) return null;
    let held = new Set();
    if (head) {
      const img = this.#record.readImage(bundleId) || {};
      const live = {};
      for (const [p, v] of Object.entries(img)) if (!p.startsWith("_history/")) live[p] = v;
      held = new Set(registerChecks(imageForChecks(live)).filter((x) => x.severity === "error")
        .map((x) => `${x.check}\u0000${x.message}`));
    }
    const added = now.filter((x) => !held.has(`${x.check}\u0000${x.message}`));
    if (!added.length) return null;
    return { ok: false, reason: "PROVENANCE_REGISTER_REFUSED", bundleId,
             findings: added.map((x) => ({ check: x.check, detail: x.message, ...(x.code ? { code: x.code } : {}),
                                            ...(x.repairs ? { repairs: x.repairs } : {}) })),
             detail: `this promotion's data/provenance.json fails ${added.length} of the intake provenance register's `
                   + `rules (C-18) that the version it revises did not fail. Nothing was written.` };
  }

  /* R1: the register write, after `commit`, in the same transaction. `registered` is this module's clock; the
     authored columns are written from the testimony path's own key and never from the entry a caller sent. */
  #project(c) {
    const { pkg, bundleId, register } = c;
    const testimony = pkg && pkg[TESTIMONY_PATH] ? pkg[TESTIMONY_PATH] : null;
    /* MK-1 / IC-134: the three authored columns are written FROM THE
       TESTIMONY PATH'S OWN KEY and never from the entry a caller sent — `c`
       may carry an `authored` field and it is not read. An UPSERT rather than
       the `INSERT OR REPLACE` this was, so that a later revision re-registering
       an authored capture under the SAME bundle keeps what it is (REPLACE would
       have reset it to the default, the flag being cleared by any writer). The
       other five columns move exactly as REPLACE moved them. A re-registration
       under a DIFFERENT bundle that still exists cannot reach here for ANY row:
       the fence above refuses it (C-53.8 for an authored row, C-53.13 for every
       other, D-179), so the UPDATE arm moves a row only within its own bundle or
       off a home that no longer exists. */
    const at = this.#now();
    for (const r of Array.isArray(register) ? register : []) {
      if (!r || typeof r.sha256 !== "string") continue;
      const own = !!(testimony && testimony.captureSha === r.sha256);
      this.#sql.exec(
        `INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered,authored,author,observed_at)
         VALUES (?,?,?,?,?,?,?,?,?)
         ON CONFLICT(capture_sha) DO UPDATE SET
           bundle_id=excluded.bundle_id, path=excluded.path, encoding=excluded.encoding,
           bytes=excluded.bytes, registered=excluded.registered,
           authored=MAX(register.authored, excluded.authored),
           author=COALESCE(excluded.author, register.author),
           observed_at=COALESCE(excluded.observed_at, register.observed_at)`,
        r.sha256, bundleId, r.path, r.encoding ?? "utf8", r.bytes, at,
        own ? 1 : 0, own ? testimony.author : null, own ? testimony.observedAt : null);
    }
    return null;
  }

  /** Registers this module's check and projection with promotion, once (the factory calls it). */
  joinPromotion() {
    return this.#promotion.registerStep("provenance", { check: (c) => this.#check(c), project: (c) => this.#project(c) });
  }

  /* Why is a register row unreferenced? (D-9)
   *
   * The register maps a capture's sha to the bundle and path it was intake for.
   * Nothing could read it until 0.22.0, so the 30 unreferenced rows on the live
   * record were explained only by a guess.
   *
   * THE FIRST VERSION OF THIS LOOKED IN TWO OF THE THREE PLACES BYTES CAN LIVE.
   * It checked `files` and `history` and called everything else "dropped", which
   * produced a confident and wrong finding: that the Apps Script migration could
   * not be audited from the record it produced. The bytes were in R2 the whole
   * time. `migrate.mjs` says so in its own header, carrying Drive provenance
   * "verbatim as a registered drive-provenance capture, so the Drive era remains
   * inspectable without polluting the live file image", which is precisely what
   * the two-bucket design is for.
   *
   * So this returns rows and their capture hashes, and the CONTROL PLANE probes
   * `bio-captures` to finish the classification, exactly as the ratify path does
   * with `hasCapture`. The Durable Object does not know its own store name and
   * R2 keys are `<store>/captures/<sha>`, so the probe cannot honestly be done
   * from in here.
   *
   *   live        the capture's bytes are the current file at that path
   *   superseded  the path is still there carrying different bytes now
   *   historical  not live anywhere, but present in history
   *   unresolved  in neither, so the control plane must ask R2 before this row
   *               can be called sound or broken
   */
  registerRows() {
    const rows = this.#rows(`SELECT capture_sha, bundle_id, path, encoding, bytes, registered FROM register`);
    const out = { total: rows.length, live: 0, superseded: 0, historical: 0, orphan: 0, unresolved: [] };
    for (const r of rows) {
      if (!this.#record.bundleInfo(r.bundle_id)) {
        out.orphan++; out.unresolved.push({ ...r, class: "orphan" }); continue;
      }
      const here = this.#record.readFile(r.bundle_id, r.path);
      if (here && here.sha256 === r.capture_sha) { out.live++; continue; }
      /* History is record-core's table, read on its digest column (reported: record-core's read contract, R37, does not
         yet state it). */
      if (this.#one(`SELECT sha256 FROM history WHERE bundle_id=? AND sha256=? LIMIT 1`, r.bundle_id, r.capture_sha)) {
        out.historical++; continue;
      }
      if (here) { out.superseded++; continue; }
      out.unresolved.push({ ...r, class: "unresolved", named_parts: this.partsNamed(r.bundle_id, r.capture_sha) });
    }
    return { ok: true, ...out, needsCaptureProbe: out.unresolved.length };
  }

  /* D-533 (BOB #33, 2026-09-24 21:17Z; Intake Doctrine section 8): WHICH PARTS DOES THE RECORD NAME FOR A
   * CAPTURE IT HOLDS IN PARTS? `op=acquire` stores a multi-part document ONLY as its parts, each under its own
   * hash, and never the whole under the whole's; the one place the record names those parts is the holding
   * bundle's intake provenance register, `data/provenance.json`, whose document for that `capture_sha` carries
   * `parts: [{file, sha256, bytes}]` (the shape C-18.1 checks). So the audit's R2 probe of the WHOLE key can
   * only ever miss for such a row, and it called held bytes missing.
   *
   *   none        the register document names no parts for this sha (or the bundle has no register): the
   *               whole key is the only place the record says the bytes live
   *   named       the parts, as the record names them, for the control plane to head and verify
   *   unreadable  the register exists and could not be read to an answer, with why: the row resolves
   *               NEITHER way, and the ruling counts it UNDETERMINED, outside `sound`
   *
   * It reads the live image only (`files`), which is what the audit's `live` class reads too. */
  partsNamed(bundleId, sha) {
    const f = typeof bundleId === "string" && bundleId ? this.#record.readFile(bundleId, "data/provenance.json") : null;
    if (!f) return { state: "none" };
    if (typeof f.text !== "string")
      return { state: "unreadable", why: "the bundle's data/provenance.json is held as a blob, which the store cannot read" };
    let reg;
    try { reg = JSON.parse(f.text); } catch {
      return { state: "unreadable", why: "the bundle's data/provenance.json does not parse" };
    }
    const bare = (v) => typeof v === "string" ? v.trim().replace(/^sha256:/, "").toLowerCase() : null;
    const doc = (Array.isArray(reg?.documents) ? reg.documents : [])
      .find((d) => d && bare(d.capture?.sha256) === bareSha(sha) && d.parts !== undefined);
    if (!doc) return { state: "none" };
    const ok = Array.isArray(doc.parts) && doc.parts.length && doc.parts.every((p) =>
      p && /^[0-9a-f]{64}$/.test(bare(p.sha256) || "") && Number.isInteger(p.bytes) && p.bytes >= 0);
    if (!ok) return { state: "unreadable", why: "the register document names parts for this capture without a digest and size for each" };
    return { state: "named", parts: doc.parts.map((p) => ({ file: typeof p.file === "string" ? p.file : null,
                                                            sha256: bare(p.sha256), bytes: p.bytes })) };
  }
  /* REC-190: THE CENSUS OF DISPLACED HOMES (`BIO_Intake_Doctrine_v1_1.md` §8, ONE CAPTURE, ONE HOME — the ORIGINAL's;
     D-179's residue). Before D-179's fence `op=promote` UPSERTed `register.bundle_id` on the `capture_sha` key, so a
     second bundle registering bytes the record already held MOVED the first bundle's register row to itself, and the
     first bundle's own `files` / `history` rows kept carrying bytes the register now says live elsewhere. This lists
     every such row: a `files` or `history` row whose sha256 the register assigns to a DIFFERENT bundle that STILL
     EXISTS, with both bundles named, grouped by the sha. READ-ONLY and never a repair (BOB #31, 2026-09-23 22:03Z: the
     census's report STANDS ALONE): WHICH BUNDLE HELD THE CAPTURE FIRST IS UNDETERMINED — the register keeps one holder
     and no prior one, and a row a bundle carried without ever registering it reads the same — so the answer names the
     register's CURRENT holder as that and nothing more, and says so. A sha shared by several bundles that the register
     does not assign elsewhere (an identical ordinary file, or the holder's own revisions) is NOT a displaced home and
     is not listed: only the register decides a home. A register row whose bundle no longer exists names no home and
     is counted apart (`home_absent`), never listed. The digest-level duplicate (the same content in different bytes)
     is out of reach: this compares the bytes' digest and nothing about their meaning. Shas are compared lower-cased on
     both sides, so a spelling difference is not a second identity. Bounded by `limit` shas listed (the counts are
     always whole). */
  homeCensus({ limit } = {}) {
    const asked = limit === undefined || limit === null || limit === "" ? NaN : Number(limit);
    const cap = Math.max(0, Math.min(Number.isInteger(asked) ? asked : 50, 500));
    const homes = new Map();
    const reg = { rows: 0, home_absent: 0 };
    for (const r of this.#sql.exec(`SELECT r.capture_sha, r.bundle_id, r.path, b.bundle_id AS present
                                     FROM register r LEFT JOIN bundles b ON b.bundle_id = r.bundle_id`)) {
      reg.rows++;
      if (r.present === null) { reg.home_absent++; continue; }
      homes.set(String(r.capture_sha).toLowerCase(), { bundle_id: r.bundle_id, path: r.path });
    }
    const bySha = new Map();
    const walk = (table) => {
      const out = { rows: 0, displaced: 0 };
      for (const r of this.#sql.exec(table === "files"
          ? `SELECT bundle_id, NULL AS snap_key, path, sha256 FROM files`
          : `SELECT bundle_id, snap_key, path, sha256 FROM history`)) {
        out.rows++;
        const s = String(r.sha256 ?? "").toLowerCase();
        const home = homes.get(s);
        if (!home) continue;
        if (home.bundle_id === r.bundle_id) continue;                     /* the different-bundle predicate */
        out.displaced++;
        if (!bySha.has(s)) bySha.set(s, { capture_sha: s, home: { ...home }, held_by: [] });
        bySha.get(s).held_by.push({ table, bundle_id: r.bundle_id, path: r.path,
                                    ...(r.snap_key ? { snap_key: r.snap_key } : {}) });
      }
      return out;
    };
    const files = walk("files"), history = walk("history");
    return { ok: true, register: reg, files, history, shas: bySha.size, listed: [...bySha.values()].slice(0, cap),
             first_holder: "UNDETERMINED", rewritten: 0,
             note: "read-only: each listed sha is registered to `home` and ALSO carried by every `held_by` row, a "
                 + "different bundle that still exists. Nothing is rewritten or repaired. `home` is the register's "
                 + "current holder, never a finding about which bundle held the capture first — that is undetermined. "
                 + "The same content in different bytes is not reached." };
  }

  /** D-476 - IS THIS WHOLE DOCUMENT ALREADY IN THE REGISTER? ONE BOUNDED READ ON
   *  THE REGISTER'S OWN KEY, and the only question `op=acquire` can ask about a
   *  MULTI-PART capture.
   *
   *  D-469 answered acquire's `existed` for a single-part capture by asking R2 for
   *  the whole's own key BEFORE the put. A multi-part capture has no such key: the
   *  whole is never stored under its own hash, only its parts are. So that
   *  question cannot be asked at all, and acquire answered a flat `false` - which
   *  CLAIMS THE BYTES ARE NEW every time a document the record already holds is
   *  re-fetched. This is the question that CAN be asked, and it is the record's
   *  own: `register` is keyed by `capture_sha`, the identity of the bytes across
   *  the whole system (`INTERFACES.md` I1 section 1), and one capture has one
   *  home (D-179; `BIO_Intake_Doctrine_v1_1.md` section 8).
   *
   *  THE HOLDER MUST STILL EXIST - the `bundles` join D-179's fence makes, for
   *  the reason that ruling gives: bytes whose home was purged register afresh,
   *  so a register row whose bundle is gone is not a holding.
   *
   *  IT NAMES NO BUNDLE, and so it needs no viewer. A caller learns only that the
   *  record holds these bytes, which is the whole of what `existed` has ever said;
   *  WHICH bundle holds them is D-15's question, answered under a visibility stamp
   *  by `op=promote`'s refusal and never here.
   *
   *  A MISS IS NOT AN ABSENCE, and THE CALLER STATES THAT, not this read: the
   *  register answers for documents the record REGISTERED, and a prior acquire
   *  never promoted leaves parts in R2 and no register row. `registered: false` is
   *  that one fact and nothing more; `registered: null` is no question asked.
   *
   *  D-530 - AND THE PLANE'S OWN RECEIPT, `acquired`. `captured_locators` has one
   *  writer, `op=acquire`, and the hash in it is the one the plane computed as the
   *  bytes ARRIVED; nothing deletes a store's captures. So a receipt for a whole
   *  hash that has no object under it says the plane took the document and keeps
   *  it in parts, and no caller can write it. The register cannot say that: a
   *  register row is written by `op=promote` from what its CALLER names, and
   *  promote does not read R2 (D-45). `op=attest` attests on the receipt and not on
   *  the register alone; the ratify gate names a whole-hash row held in parts
   *  rather than calling its bytes absent. One bounded read on the
   *  `captured_locators_sha` index, and like `registered` it names no bundle.
   */
  /*  D-556 (BOB #34, 2026-09-25 00:00Z) - AND, when the caller names the BUNDLE whose row it is gating, the
   *  PARTS that bundle's record names for the hash (`#partsNamedFor`, D-533's reader, not a second one). The
   *  ratify gate asks it on a whole-hash miss: a row held in parts is admitted when every part the record names
   *  is present and verifies, and publication copies exactly those parts. The bundle's own register document is
   *  read, so it names nothing the ratifier has not already been handed in the image. */
  registerHolds({ sha = null, bundle = null } = {}) {
    const s = typeof sha === "string" && sha.trim()
      ? sha.trim().replace(/^sha256:/, "").toLowerCase() : null;
    if (!s) return { ok: true, sha: null, asked: false, registered: null, acquired: null };
    const b = typeof bundle === "string" && bundle.trim() ? bundle.trim() : null;
    return { ok: true, sha: s, asked: true, ...(b ? { parts: this.partsNamed(b, s) } : {}), registered: !!this.#one(
      `SELECT r.capture_sha FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id
        WHERE r.capture_sha = ? LIMIT 1`, s),
      acquired: !!this.#one(`SELECT capture_sha FROM captured_locators WHERE capture_sha = ? LIMIT 1`, s) };
  }

  /** R8, R9 — the register audit: every row classified (`registerRows`), each unresolved one probed in the evidence
   *  store (`{head, get}` by digest; record-core's R38 when none is passed; null when the instance has none). */
  async registerAudit(evidence) {
    const store = evidence === undefined ? this.#record.evidenceStore?.() ?? null : evidence;
    return { ok: true, ...await registerAuditReport(this.registerRows(), store) };
  }

  /** R4 — the capture's home, or null when no row names it or its bundle no longer exists. Never the author. */
  homeOf(captureSha) {
    const s = bareSha(captureSha);
    if (!s) return null;
    const r = this.#one(`SELECT r.capture_sha, r.bundle_id, r.path, r.encoding, r.bytes, r.registered, r.authored
                           FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id WHERE r.capture_sha = ?`, s);
    return r ? { bundleId: r.bundle_id, path: r.path, encoding: r.encoding, bytes: r.bytes, registered: r.registered,
                 authored: Number(r.authored) === 1 } : null;
  }

  /** R11 — every register row whose home is `bundleId`, in `capture_sha` order. */
  registeredFor(bundleId) {
    return this.#rows(`SELECT capture_sha, path, bytes, encoding, registered, authored FROM register
                        WHERE bundle_id = ? ORDER BY capture_sha`, String(bundleId ?? ""))
      .map((r) => ({ capture_sha: r.capture_sha, path: r.path, bytes: r.bytes, encoding: r.encoding,
                     registered: r.registered, authored: Number(r.authored) === 1 }));
  }

  /** R12 · D-580 — the bundle's captures in the order the record first held them. `held_at` is the earlier of the
   *  row's `registered` and its earliest receipt's `first_retrieved`, both this instance's clock, compared as
   *  instants and never as strings (`…:00Z` is before `…:00.123Z`). A document's own stated date never orders them,
   *  and no other clock is put in the column. Ties break on the capture's digest, so the order is total. */
  capturesOf(bundleId) {
    const rows = this.#rows(
      `SELECT r.capture_sha, r.registered,
              (SELECT MIN(cl.first_retrieved) FROM captured_locators cl WHERE cl.capture_sha = r.capture_sha) AS first
         FROM register r WHERE r.bundle_id = ?`, String(bundleId ?? ""));
    const ms = (v) => (typeof v === "string" && v ? Date.parse(v) : NaN);
    return rows.map((r) => {
      const a = ms(r.registered), b = ms(r.first);
      const held = Number.isFinite(b) && (!Number.isFinite(a) || b < a) ? r.first : r.registered;
      return { capture_sha: r.capture_sha, held_at: held, t: ms(held) };
    }).sort((x, y) => ((Number.isFinite(x.t) ? x.t : Infinity) - (Number.isFinite(y.t) ? y.t : Infinity))
                      || (x.capture_sha < y.capture_sha ? -1 : x.capture_sha > y.capture_sha ? 1 : 0))
      .map(({ capture_sha, held_at }) => ({ capture_sha, held_at }));
  }

  /* ===================================================================== *
   * THE ACQUISITION RECEIPTS (R13–R16, R47).
   * ===================================================================== */

  /** R47 — a later module's work on each receipt, registered once at start (K31's pattern, promotion R39). */
  onReceipt(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "LISTENER_MALFORMED", detail: "a listener names its module and its function" };
    if (this.#listeners.some((l) => l.module === module))
      return { ok: false, reason: "LISTENER_DECLARED", module, detail: `${module} has already registered its listener` };
    const i = this.#order.indexOf(module);
    this.#listeners.push({ module, fn, rank: i === -1 ? Infinity : i, seq: this.#listeners.length });
    this.#listeners.sort((a, b) => (a.rank - b.rank) || (a.seq - b.seq));
    return { ok: true, module };
  }

  /** R13, R14, R47 — the plane's own acquisition receipt: one row per (address, capture, via).
   *
   *  WHICH OF THE THREE — `new`, `unchanged`, `changed` — this look was is READ FROM THE RECORD BEFORE THE UPSERT,
   *  never declared by the caller (REC-93; OBSERVATION-LOG-DESIGN.md §4.1). A caller that tells us the bytes were
   *  unchanged is a caller we would be taking a coverage claim from for free, and an equality that costs nothing to
   *  produce is not evidence. ONE AGGREGATE ROW, NOT A SCAN: the decision needs exactly two facts — has this address
   *  been retrieved through this source before, and were these the same bytes.
   *
   *  Widen the interval rather than replacing a date. Seeing the same bytes again later is not a duplicate, it is the
   *  observation that proves the target held still in between. The interval widens PER SOURCE (D-96): via is part of
   *  the key, so a direct observation and an archive observation of the same bytes are two rows.
   *
   *  THE LISTENERS (R47): after the write, every registered listener runs inside the same transaction, in the
   *  modules' order, with the receipt and the observation; one that refuses or throws does not undo the receipt, and
   *  the answer names each one's outcome. `context` is the caller's own, handed to the listeners unread (who asked,
   *  under which authority), so a listener can attribute its row without this module knowing what it writes. */
  recordReceipt({ address, addressNorm, captureSha, retrieved, via = "direct", retrievalLocator = null, context = null } = {}) {
    if (!addressNorm || !captureSha) return { recorded: false };
    const v = String(via || "direct");
    const when = typeof retrieved === "string" && retrieved ? retrieved : this.#now();
    return this.#record.transact(() => {
      const seen = this.#one(
        `SELECT COUNT(*) AS n, SUM(CASE WHEN capture_sha = ? THEN 1 ELSE 0 END) AS same
           FROM captured_locators WHERE address_norm = ? AND via = ?`,
        captureSha, addressNorm, v) || { n: 0, same: 0 };
      const observation = Number(seen.n) === 0 ? "new" : Number(seen.same) > 0 ? "unchanged" : "changed";
      this.#sql.exec(
        `INSERT INTO captured_locators (address_norm, address, capture_sha, via, retrieval_locator, first_retrieved, last_retrieved, observations)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(address_norm, capture_sha, via) DO UPDATE SET
           first_retrieved   = MIN(first_retrieved, excluded.first_retrieved),
           last_retrieved    = MAX(last_retrieved,  excluded.last_retrieved),
           retrieval_locator = COALESCE(excluded.retrieval_locator, retrieval_locator),
           observations      = observations + 1`,
        addressNorm, address || addressNorm, captureSha, v, retrievalLocator, when, when);
      const event = { address: address || addressNorm, address_norm: addressNorm, capture_sha: captureSha, via: v,
                      retrieval_locator: retrievalLocator, retrieved: when, observation, context };
      const listeners = this.#listeners.map(({ module, fn }) => {
        try {
          const out = fn(event);
          return out && out.ok === false ? { module, outcome: "refused", answer: out } : { module, outcome: "ran", answer: out ?? null };
        } catch (e) {
          return { module, outcome: "threw", error: String(e && e.message ? e.message : e).slice(0, 200) };
        }
      });
      return { recorded: true, address_norm: addressNorm, via: v, observation, listeners };
    });
  }

  /** R16 — every receipt for the address (all when none is given), ordered by `via`, and their summed observations.
   *  `observations` is not bookkeeping — a run of them across an interval is the PRIMARY route by which the record
   *  establishes that a link was contemporaneous (LINK-FIDELITY.md), REC-26. */
  receipts({ addressNorm = null } = {}) {
    const rows = addressNorm
      ? this.#rows(`SELECT * FROM captured_locators WHERE address_norm = ? ORDER BY via`, addressNorm)
      : this.#rows(`SELECT * FROM captured_locators ORDER BY address_norm, via`);
    return { address_norm: addressNorm, rows: rows.map((r) => ({ ...r })),
             observations: rows.reduce((n, r) => n + r.observations, 0) };
  }

  /* ===================================================================== *
   * R24–R27: THE CAPTURE AXIS FOR ONE CAPTURE, FROM ITS ROUTE.
   * ===================================================================== */

  /** `captureGrade(captureSha) → {grade, route, determined, basis, why}`. The route is the record's own fact about
   *  WHO SERVED the bytes, written by the fetch that received them (the receipts' `via`), never by a member; the
   *  issuing authority (D-97) is a different axis and is never read here. No letter above the ceiling is earned. */
  captureGrade(captureSha) {
    const s = bareSha(captureSha);
    const reg = s ? this.#one(`SELECT authored FROM register WHERE capture_sha = ?`, s) : null;
    /* R27: a member's authored observation earns no capture letter: the axis measures the act of reading a
       document in, which did not happen. Its grade is testimony, which nothing raises. */
    if (reg && Number(reg.authored) === 1)
      return { grade: null, route: "authored", determined: false, basis: "CAPTURE_AXIS_AUTHORED",
               testimony: TESTIMONY_GRADE,
               why: "a member's own words were not read in from anywhere, so the capture axis earns no letter; the "
                  + `observation is graded as testimony, ${TESTIMONY_GRADE}, and nothing raises that` };
    const vias = s ? this.#rows(`SELECT DISTINCT via FROM captured_locators WHERE capture_sha = ? ORDER BY via`, s)
      .map((r) => r.via) : [];
    /* R24 · D-177: a capture this instance fetched `direct` earns the ceiling, measured. */
    if (vias.includes("direct"))
      return { grade: EARNED_CAPTURE_CEILING, route: "direct", determined: true, basis: "measured",
               why: `this instance fetched these bytes directly from their address, so their capture grade is `
                  + `${EARNED_CAPTURE_CEILING} by that fact rather than by a member's account` };
    /* R25 · D-693: read only through an archive replay: one rank below, measured. */
    if (vias.includes(ARCHIVE_VIA))
      return { grade: ARCHIVE_CAPTURE_GRADE, route: "archive", determined: ARCHIVE_CAPTURE_GRADE !== null,
               basis: "measured",
               why: `this instance fetched these bytes only through an archive replay (${ARCHIVE_VIA}), never from `
                  + `their publisher: one more party stands between the record and the publisher, so their capture `
                  + `grade is ${ARCHIVE_CAPTURE_GRADE}, ranked below a direct capture` };
    /* R26 · D-709: no recorded route at all: stated, never guessed. A leg on it keeps its author's letter, under the
       ceiling, and that letter is the author's account, not a measurement. */
    if (!vias.length)
      return { grade: null, route: "unrecorded", determined: false, basis: "CAPTURE_ROUTE_UNRECORDED",
               ceiling: EARNED_CAPTURE_CEILING,
               why: "no fetch route is recorded for these bytes (bytes a provenance document carried, or a member's "
                  + "upload), so no capture grade is measured from how they were fetched. A leg on them keeps the "
                  + `letter its author gave, under the ceiling (${EARNED_CAPTURE_CEILING}), stated as authored` };
    /* R26: a route no ruling grades is NAMED, and the grade is undetermined. */
    return { grade: null, route: vias.join(","), determined: false, basis: "CAPTURE_GRADE_VIA_UNRULED",
             ceiling: EARNED_CAPTURE_CEILING,
             why: `these bytes were served by a route no ruling grades (${vias.join(", ")}), so what they earn on the `
                + "capture axis is UNDETERMINED" };
  }

  /* ===================================================================== *
   * R29, R30 · REC-225: A MEMBER'S DECLARED ORIGIN FOR A DOCUMENT. A host serves many offices, so a host is not an
   * origin: the system a document came from is a member's attributed statement, per document, dated and append-only.
   * ===================================================================== */

  declareOrigin({ bundleId = "", system = "", by = null, viewer = null } = {}) {
    const who = String(by ?? "").trim();
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "ORIGIN_NOT_A_MEMBER",
               detail: who ? `'${who.slice(0, 60)}' is a machine credential. Which system a document came from is a `
                             + "named member's attributed statement, never a machine's"
                           : "declaring a document's origin is a named member's act, and this call carries nobody" };
    if (!bundleId) return { ok: false, reason: "NO_BUNDLE", detail: "pass bundleId=<id>" };
    const info = this.#record.bundleInfo(bundleId);
    if (!info || !this.#membership.inSight(bundleId, viewer))
      return { ok: false, reason: "NO_SUCH_BUNDLE", bundleId,
               detail: "no document of that name is in the record, or none this viewer may see; the two answer alike" };
    if (String(info.type).toLowerCase() !== "information")
      return { ok: false, reason: "ORIGIN_NOT_A_DOCUMENT", bundleId,
               detail: `this bundle is a ${String(info.type).slice(0, 40)}; only a document came from a system` };
    const sys = String(system ?? "").replace(/[\p{Cc}]+/gu, " ").replace(/\s+/g, " ").trim();
    if (!sys || sys.length > 200)
      return { ok: false, reason: "ORIGIN_NO_SYSTEM",
               detail: "name the system the document came from, in at most 200 characters" };
    const at = secondOf(this.#now());
    const seq = (this.#one(`SELECT COALESCE(MAX(seq), 0) AS m FROM origin_declarations WHERE bundle_id = ?`, bundleId).m || 0) + 1;
    this.#sql.exec(`INSERT INTO origin_declarations (bundle_id, seq, system, by, at) VALUES (?, ?, ?, ?, ?)`,
                   bundleId, seq, sys, who, at);
    return { ok: true, bundleId, system: sys, by: who, at, seq };
  }

  /** R30 — the standing declaration (the latest), or null. A reader of a document's origin asks this before any
   *  system derived from its host. */
  originOf(bundleId) {
    const r = this.#one(`SELECT system, by, at FROM origin_declarations WHERE bundle_id = ? ORDER BY seq DESC LIMIT 1`,
                        String(bundleId ?? ""));
    return r ? { system: r.system, by: r.by, at: r.at } : null;
  }

  /* ===================================================================== *
   * R34 · K59: THE INSTANCE SIGNS ITS OWN RECEIPT FOR AN ARCHIVE-SOURCED CAPTURE (ARCHIVE-FALLBACK §Shape on the
   * capture): that on this date it fetched these bytes from this retrieval locator and they hashed to this value.
   * One key per instance, held as a secret and replaceable by the operator; every public key it signed with is kept,
   * so a receipt signed before a replacement stays verifiable against the key it was signed with.
   * ===================================================================== */

  /** The exact statement a receipt signs, UTF-8. */
  static receiptStatement({ instance, retrieved, retrievalLocator, captureSha }) {
    return `bio-receipt/1\ninstance: ${instance}\nfetched: ${retrieved}\nlocator: ${retrievalLocator}\nsha256: ${captureSha}\n`;
  }

  async #key() {
    if (!this.#signingKey) return null;
    const priv = await crypto.subtle.importKey("pkcs8", unb64(this.#signingKey), { name: "Ed25519" }, true, ["sign"]);
    const jwk = await crypto.subtle.exportKey("jwk", priv);
    const pub = Uint8Array.from(atob(jwk.x.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - jwk.x.length % 4) % 4)), (c) => c.charCodeAt(0));
    return { priv, pub: b64(pub), keyId: hexOf(pub) };
  }

  /** Signs and keeps the receipt for an archive-sourced capture. Answers `{ok, statement, signature, key_id,
   *  public_key}`, or `RECEIPT_NO_KEY` when no key is bound (stated, never a silent skip), or `RECEIPT_MALFORMED`. */
  async signReceipt({ captureSha, retrievalLocator, retrieved } = {}) {
    const s = bareSha(captureSha);
    if (!s || !/^[0-9a-f]{64}$/.test(s) || typeof retrievalLocator !== "string" || !retrievalLocator
        || typeof retrieved !== "string" || !retrieved)
      return { ok: false, reason: "RECEIPT_MALFORMED",
               detail: "a receipt names the capture's sha256, the retrieval locator and the instant it was fetched" };
    const key = await this.#key();
    if (!key)
      return { ok: false, reason: "RECEIPT_NO_KEY",
               detail: "this instance holds no receipt-signing key, so the receipt is not signed. The operator binds "
                     + "one as a secret; nothing is claimed signed until then" };
    const statement = Provenance.receiptStatement({ instance: this.#instanceName, retrieved, retrievalLocator, captureSha: s });
    const signature = b64(await crypto.subtle.sign({ name: "Ed25519" }, key.priv, te.encode(statement)));
    const at = this.#now();
    this.#record.transact(() => {
      this.#sql.exec(`INSERT OR IGNORE INTO receipt_keys (key_id, public_key, first_used) VALUES (?, ?, ?)`,
                     key.keyId, key.pub, at);
      this.#sql.exec(`INSERT OR REPLACE INTO signed_receipts
                        (capture_sha, retrieval_locator, retrieved, statement, signature, key_id, signed_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`, s, retrievalLocator, retrieved, statement, signature, key.keyId, at);
      return { ok: true };
    });
    return { ok: true, statement, signature, key_id: key.keyId, public_key: key.pub };
  }

  /** The receipts signed for a capture, each verified against the public key it was signed with (kept, R34). */
  async signedReceipts(captureSha) {
    const s = bareSha(captureSha) || "";
    const out = [];
    for (const r of this.#rows(`SELECT sr.*, k.public_key FROM signed_receipts sr
                                  LEFT JOIN receipt_keys k ON k.key_id = sr.key_id
                                 WHERE sr.capture_sha = ? ORDER BY sr.retrieved`, s)) {
      let verified = false;
      if (r.public_key) {
        try {
          const pub = await crypto.subtle.importKey("raw", unb64(r.public_key), { name: "Ed25519" }, false, ["verify"]);
          verified = await crypto.subtle.verify({ name: "Ed25519" }, pub, unb64(r.signature), te.encode(r.statement));
        } catch { verified = false; }
      }
      out.push({ capture_sha: r.capture_sha, retrieval_locator: r.retrieval_locator, retrieved: r.retrieved,
                 statement: r.statement, signature: r.signature, key_id: r.key_id, public_key: r.public_key ?? null,
                 verified });
    }
    return out;
  }

  /** PL-10 / D-220 — EVERY VERSION AT AN ADDRESS, IN DATE ORDER, WITH ITS
   *  BUNDLE, AND NOT ONE NEW BYTE OF SCHEMA TO ANSWER IT.
   *
   *  Bob ruled (2026-08-06) that versions of one document must be linked and
   *  indexed by the same url. **The index he described already existed.**
   *  `captured_locators` is keyed `(address_norm, capture_sha, via)` with
   *  `captured_locators_addr ON (address_norm, first_retrieved)`; `register`
   *  maps `capture_sha` to `bundle_id` on its primary key. So the link is not a
   *  thing to BUILD, it is a thing to ASK — one indexed seek and one join, and
   *  this method is the asking.
   *
   *  **THEREFORE NO EDGE BETWEEN VERSIONS IS ADDED, AND THAT IS THE ITEM.** An
   *  explicit `supersedes` relation would be a SECOND COPY of a fact the record
   *  already holds, and a second copy of a fact drifts from the first — D-164's
   *  solve-it-once, D-138's guard that guarded nothing. There is no new table,
   *  no new column, no new index and no new write: `recordReceipt` above
   *  is untouched and remains the only writer. `test/versionchain.test.mjs`
   *  asserts that STRUCTURALLY rather than trusting this comment, because a
   *  comment promising an absence is exactly the kind of guard that has guarded
   *  nothing here before.
   *
   *  ONE VERSION IS ONE `capture_sha`, WHICH IS WHY THIS GROUPS. The primary key
   *  carries `via` (D-96): an archive sighting of the same bytes is a different
   *  FACT from a direct one, and the write path keeps both rows deliberately. It
   *  is not a different VERSION. Grouping on the sha is what stops a document
   *  seen twice through two routes from reading as two versions — the same
   *  false-coverage failure this op exists to remove, one axis over. The `via`
   *  values survive into the answer, so the distinction the key preserves is
   *  reported rather than flattened away.
   *
   *  ORDER IS `first_retrieved` — WHEN WE FIRST HELD THESE BYTES — and never
   *  `last_retrieved`, which moves every time the target holds still and would
   *  reorder a settled history as a side effect of re-checking it. `capture_sha`
   *  is the tiebreak, so the order is TOTAL and `offset` paging cannot repeat or
   *  skip a version. The record cannot say when the SOURCE published a version;
   *  it can say when we first saw it, and that difference is why the field is
   *  named in the answer rather than relabelled "published".
   *
   *  D-221's FIX LIVES HERE, and it is a consequence of the shape rather than a
   *  patch on top of it. The defect was that `heldMatch` found prior versions
   *  with `locator:"<url>"` — a FULL-TEXT query on a text-indexed field, which
   *  compiles to a text atom, which creates a rank arm, which orders by
   *  RELEVANCE; every capture at one address carries identical URL text, the
   *  bm25 scores tie, and the tiebreak decided. The predecessor named was
   *  therefore not the previous version at all. Here `at` is resolved by
   *  ADDRESS EQUALITY and the predecessor is the row immediately before it in
   *  date order. No text index is consulted, no relevance exists to be ordered
   *  by, and there is nothing to get wrong.
   *
   *  A CHAIN OF ONE IS A CHAIN. A single capture at an address answers with one
   *  version, `at_index` 0 and `predecessor: null` — that is the record saying
   *  "these are the first bytes we held", not a degenerate failure, and the
   *  suite pins it as its own arm.
   *
   *  GATED at `register.bundle_id` through `#bundleGate`, the same predicate
   *  every other read in this file compiles, and `total` is counted through the
   *  SAME join and the SAME predicate as the rows — so a viewer cannot learn
   *  from a total that something was withheld. Nothing publishes how many rows
   *  the gate removed, because that count is the leak (REC-36). */
  versionChain({ addressNorm = null, at = null, limit = null, offset = 0, viewer = null } = {}) {
    const refuse = (key, detail) => {
      const row = VERSION_CHAIN_CHECKS[key];
      return { ok: false, reason: key, check: row.check, translation: row.translation, detail };
    };
    const addr = addressNorm == null ? "" : String(addressNorm).trim();
    if (!addr)
      return refuse("VERSION_CHAIN_NO_ADDRESS",
        "op=versionchain answers for ONE document address: pass address=<url>. The plane normalises it "
        + "with the same normaliser the capture wrote it with, so the address you captured is the "
        + "address that answers.");
    const anchor = at == null ? "" : String(at).trim().toLowerCase();
    if (anchor && !/^[0-9a-f]{64}$/.test(anchor))
      return refuse("VERSION_CHAIN_BAD_ANCHOR",
        `at=${JSON.stringify(String(at).slice(0, 80))} is not a sha256. A version is anchored by the `
        + "capture identity of its bytes, which is 64 hex characters.");

    const cap = Math.max(1, Math.min(VERSION_CHAIN_LIMIT_MAX,
      Math.floor(Number(limit) || VERSION_CHAIN_LIMIT_DEFAULT)));
    const from = Math.max(0, Math.floor(Number(offset) || 0));
    const seen = bundleGate("r.bundle_id", viewer);

    /* THE JOIN, WRITTEN ONCE. Every answer below — the page, the total, the
       anchor, the predecessor — reads this same CTE, so they cannot disagree
       about what a version is or about which ones this viewer may see. It is
       `#conditionBundlesForHost`'s join generalised off a host prefix onto the
       address the index is actually keyed on. */
    const CHAIN = `WITH chain AS (
        SELECT cl.capture_sha                   AS capture_sha,
               MIN(cl.first_retrieved)          AS first_retrieved,
               MAX(cl.last_retrieved)           AS last_retrieved,
               SUM(cl.observations)             AS observations,
               COUNT(*)                         AS sightings,
               MIN(cl.address)                  AS address,
               group_concat(DISTINCT cl.via)    AS via,
               r.bundle_id                      AS bundle_id,
               r.path                           AS path,
               r.encoding                       AS encoding,
               r.bytes                          AS bytes,
               r.registered                     AS registered
          FROM captured_locators cl
          JOIN register r ON r.capture_sha = cl.capture_sha
         WHERE cl.address_norm = ?
           AND (${seen.sql})
         GROUP BY cl.capture_sha)`;
    const args = [addr, ...seen.args];

    const total = this.#one(`${CHAIN} SELECT COUNT(*) AS n FROM chain`, ...args)?.n ?? 0;
    const shape = (r) => r && ({
      capture_sha: r.capture_sha, bundle_id: r.bundle_id,
      first_retrieved: r.first_retrieved, last_retrieved: r.last_retrieved,
      observations: r.observations, sightings: r.sightings,
      via: String(r.via || "").split(",").filter(Boolean).sort(),
      address: r.address, path: r.path, encoding: r.encoding,
      bytes: r.bytes, registered: r.registered,
    });
    const versions = this.#rows(
      `${CHAIN} SELECT * FROM chain ORDER BY first_retrieved, capture_sha LIMIT ? OFFSET ?`,
      ...args, cap, from).map(shape);

    /* THE PREDECESSOR, when an anchor was given. Two seeks, both on the same
       CTE: the anchor's own position in the order, then the one row before it.
       `predecessor: null` at `at_index` 0 is the OLDEST version saying so — an
       honest absence with the reason readable beside it, not a lookup that
       failed. */
    let anchorRow = null, predecessor = null, atIndex = null;
    if (anchor) {
      anchorRow = shape(this.#one(`${CHAIN} SELECT * FROM chain WHERE capture_sha = ?`, ...args, anchor));
      if (!anchorRow)
        return refuse("VERSION_CHAIN_NO_SUCH_VERSION",
          `no version with capture ${anchor.slice(0, 12)}… is held at ${addr}. A capture the record does `
          + "not hold, one filed at a different address, and one inside a project you were not invited to "
          + "answer identically here, deliberately.");
      const before = `first_retrieved < ? OR (first_retrieved = ? AND capture_sha < ?)`;
      const beforeArgs = [anchorRow.first_retrieved, anchorRow.first_retrieved, anchorRow.capture_sha];
      atIndex = this.#one(`${CHAIN} SELECT COUNT(*) AS n FROM chain WHERE ${before}`,
        ...args, ...beforeArgs)?.n ?? 0;
      predecessor = shape(this.#one(
        `${CHAIN} SELECT * FROM chain WHERE ${before} ORDER BY first_retrieved DESC, capture_sha DESC LIMIT 1`,
        ...args, ...beforeArgs)) || null;
    }

    return {
      ok: true,
      address_norm: addr,
      /* The count of DOCUMENTS is one, always, and saying so is the point of the
         op: sixty rows here are sixty versions of ONE document, and a consumer
         that read `count` as a document count would rebuild the exact false
         coverage D-220 names. It is stated in the answer rather than left to be
         inferred from a field name. */
      documents: total > 0 ? 1 : 0,
      versions, count: versions.length, total,
      limit: cap, offset: from,
      /* REC-57's discipline: the bound PUBLISHED is the one APPLIED, after
         clamping, never the number asked for; and `truncated` settles
         completeness so "this is all of it" cannot read like "the first N". */
      truncated: from + versions.length < total,
      /* Present only when asked for, and null-valued rather than absent when the
         anchor IS the oldest, so a consumer can tell "there is no earlier
         version" from "nobody asked". */
      at: anchorRow, at_index: atIndex, predecessor,
    };
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
    /* R21 · REC-158: a named MEMBER's act. A machine identity (a bearer's `token:<class>` stamp is nobody's name) is
       refused by the same name as no author, before anything is read. */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "NO_AUTHOR",
               detail: who
                 ? `'${who.slice(0, 60)}' is a machine credential. Reconstructing a provenance chain is a named `
                   + "member's act: the record must show which person decided that the evidence supported this route"
                 : "reconstructing a provenance chain is a named act: the record must show who decided "
                   + "that the evidence supported this route" };
    if (!bundleId)
      return { ok: false, reason: "NO_BUNDLE", detail: "pass bundleId=<id>" };
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
               detail: "this bundle carries no readable data/provenance.json, so there is no capture record to derive from" };
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
    return { ok: true, bundleId, applied: true, changed, documents: report, sha: promoted.sha ?? null };
  }
  /** The current finding for one bundle, or null when no assessment ever ran.
   *  Append-only: the highest `seq` is the current one and the ones before it
   *  stay readable, which is how correction moves forward here. */
  #latestRouteMark(bundleId) {
    return this.#one(
      `SELECT * FROM provenance_route_marks WHERE bundle_id=? ORDER BY seq DESC LIMIT 1`, bundleId) || null;
  }

  /** R23's read for one bundle: the latest mark read through `routeFinding`, for the reads that publish `route`
   *  beside a bundle (`op=list`, `op=audit`; the legacy store's `#withRoute`). `objectType` is the bundle's. */
  routeOf(bundleId, objectType) {
    return routeFinding(objectType, this.#latestRouteMark(bundleId));
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
   *  group put it. The suite asserts the bundle_sha and current_state are
   *  byte-identical across a marking.
   *
   *  A REPEAT THAT FOUND THE SAME THING APPENDS NOTHING. The record adds when
   *  something changed; a second identical row would be the record repeating
   *  itself rather than saying anything, and it would let a caller grow the log
   *  without limit. */
  provenanceRouteAssess({ bundleId = "", author = null, viewer = null } = {}) {
    /* The helper sits ABOVE the region marker so its own variable-coded return is
       not inside the governed span — PL-15's and PL-14's convention, and the
       reason arm C can COMPARE every code below rather than read past it. */
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
    /* REC-158 (R22, as R21): a MACHINE principal is refused too, by the same row. The act is a named member's, and
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
        + "identically here, as they do on every read addressed to a bundle (REC-25/D-15).",
        { bundleId });
    if (seen.object_type !== "information")
      return refusal("ROUTE_MARK_NOT_A_DOCUMENT",
        `this bundle is a ${String(seen.object_type).slice(0, 40)}, and only a captured document `
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
   * carries the same `MAX(seq)` clause `auditPass` and `#latestRouteMark`
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
       SOURCE IT WAS MEASURED OVER, and it reads that SQL at the `#rows(` call.
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
       scan of the bundles table — `auditPass`' shape, and for the same reason. */
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
       in this plane. `meaning-bounds.test.mjs` judged the op BARE — *a collection
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

  /** THE AUTHORED FLAG'S FENCE, run by `promote` before its first write.
   *
   *  THREE REFUSALS, and each is a way the register could let a member's word
   *  pass for a captured document or the other way round (§7):
   *   (1) a document claiming `authored` that this record did not author through
   *       the testimony path — including a register entry that would re-file an
   *       authored capture's bytes under a DIFFERENT bundle (C-53.8, THE LIAR);
   *   (2) an authored document whose origin or actor class is not `member`
   *       (C-53.7) — reachable only by a REVISION, since `testify` writes both;
   *   (3) an authored document that stops saying `authored: true`, or whose
   *       provenance document is gone from the revision (C-53.9).
   *  AND ONE MORE, ASKED OF EVERY CAPTURE (D-179, C-53.13): a register entry
   *  whose bytes another EXISTING bundle already holds — one capture, one home.
   *
   *  IMPORT AND REPLAY GO THROUGH THE TESTIMONY PATH (BOB #14, 2026-09-18, §7):
   *  there is no replay exemption here, so a migration carrying an authored
   *  bundle must re-author it through `testify`, never promote it verbatim.
   *
   *  "AUTHORED" IS READ FROM THE REGISTER, NEVER FROM THE DOCUMENT. The register
   *  row's flag is written only under `TESTIMONY_PATH`, so it is the one fact
   *  here a caller cannot have produced; the document's `authored` field is the
   *  CLAIM being judged against it. ONE read, whatever the package holds: the
   *  shas travel as one bound JSON array (D-36's ~100-variable ceiling). */
  #testimonyFence(bundleId, files, register, testimony, viewing = {}) {
    const refusal = rowRefusal(TESTIMONY_CHECKS);
    const prov = Array.isArray(files) ? files.find((f) => f && f.path === "data/provenance.json") : null;
    /* `safeJson`, the class's one remedy (provenance-marker.test.mjs's swallowed-
       read ratchet admits it by name), and the null is SURFACED rather than
       smoothed: an unreadable provenance document on an authored bundle is
       refused below as C-53.9 with a sentence that says it could not be read. */
    let docs = [], unreadable = false;
    if (prov) {
      const j = typeof prov.text === "string" ? safeJson(prov.text) : null;
      if (j === null) unreadable = true;
      else docs = Array.isArray(j.documents) ? j.documents : [];
    }
    const shaOf = (d) => d && typeof d === "object" && d.capture && typeof d.capture === "object"
      && typeof d.capture.sha256 === "string" && d.capture.sha256 ? d.capture.sha256 : null;
    const regs = Array.isArray(register) ? register.filter((c) => c && typeof c.sha256 === "string") : [];
    const asked = [...new Set([...docs.map(shaOf).filter(Boolean), ...regs.map((c) => c.sha256)])];
    /* BOUNDED, AND THE BOUND IS EXACT RATHER THAN A CAP THAT COULD HIDE A ROW.
       `capture_sha` is the key, so the IN half answers at most one row per sha
       the package names; the `bundle_id` half answers this bundle's AUTHORED rows,
       and a bundle holds at most one — `testify` writes exactly one register row
       for a bundle id it has just allocated, a re-registration under the same
       bundle keeps its sha, and a re-filing from another bundle is refused
       below. So `asked.length + 1` is the whole population, not a page of it. */
    const held = this.#rows(
      `SELECT capture_sha, bundle_id FROM register
        WHERE authored = 1 AND (bundle_id = ? OR capture_sha IN (SELECT value FROM json_each(?)))
        LIMIT ?`,
      bundleId, JSON.stringify(asked), asked.length + 1);
    const here = new Set(held.filter((r) => r.bundle_id === bundleId).map((r) => r.capture_sha));
    const elsewhere = new Set(held.filter((r) => r.bundle_id !== bundleId).map((r) => r.capture_sha));
    const own = (s) => !!(testimony && testimony.captureSha === s && !elsewhere.has(s));
    /* DEC-49 REGION is-testimony-fence */
    for (const c of regs)
      if (elsewhere.has(c.sha256))
        return refusal("TESTIMONY_AUTHORED_UNEARNED",
          `this promotion registers capture ${c.sha256.slice(0, 16)}… under ${bundleId}, and those bytes are `
          + `already registered as ANOTHER bundle's authored observation. Re-filing them here would move a `
          + `member's word under a document that is not theirs`, { bundleId, capture_sha: c.sha256 });
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      if (!d || typeof d !== "object") continue;
      const s = shaOf(d);
      const claims = d.authored !== undefined && d.authored !== null && d.authored !== false;
      const authored = s != null && (here.has(s) || own(s));
      if (claims && !authored)
        return refusal("TESTIMONY_AUTHORED_UNEARNED",
          `data/provenance.json documents[${i}] claims authored: ${JSON.stringify(d.authored).slice(0, 40)}, and `
          + `${s ? `capture ${s.slice(0, 16)}… was not authored through op=testify` : `names no capture at all`}. `
          + `Only the testimony act marks a document as a member's own observation`, { bundleId, index: i });
      if (!authored) continue;
      if (d.authored !== true)
        return refusal("TESTIMONY_AUTHORED_DROPPED",
          `data/provenance.json documents[${i}] is the member's authored observation ${s.slice(0, 16)}… and this `
          + `revision sets authored to ${JSON.stringify(d.authored ?? null).slice(0, 40)}`, { bundleId, index: i });
      const origin = d.origin && typeof d.origin === "object" ? d.origin.kind : undefined;
      const actor = d.capture.actor_class;
      if (origin !== "member" || actor !== "member")
        return refusal("TESTIMONY_ORIGIN_NOT_MEMBER",
          `data/provenance.json documents[${i}] is the member's authored observation ${s.slice(0, 16)}… and `
          + `claims origin '${String(origin).slice(0, 40)}', actor class '${String(actor).slice(0, 40)}' — both `
          + `must be 'member'`, { bundleId, index: i, origin: origin ?? null, actor_class: actor ?? null });
    }
    const stated = new Set(docs.filter((d) => d && typeof d === "object" && d.authored === true)
      .map(shaOf).filter(Boolean));
    for (const s of here)
      if (!stated.has(s))
        return refusal("TESTIMONY_AUTHORED_DROPPED",
          unreadable
            ? `${bundleId} holds the member's authored observation ${s.slice(0, 16)}…, and this revision's `
              + `data/provenance.json cannot be read, so it cannot be shown to still say so`
            : `${bundleId} holds the member's authored observation ${s.slice(0, 16)}…, and this revision's `
              + `data/provenance.json no longer carries it as authored`, { bundleId, capture_sha: s });
    /* END DEC-49 REGION is-testimony-fence */
    /* D-179 — ONE CAPTURE, ONE HOME, THE ORIGINAL's (BOB #26, 2026-09-22; Intake Doctrine §8). The
       register write below UPSERTs `bundle_id` on the `capture_sha` key, so without this a capture
       already registered under ANOTHER bundle would be moved to this one and the first bundle's row
       would read as never having held it. C-53.8 above refused that only for an authored capture;
       this asks it of every register entry, after C-53.8 so an authored capture keeps its own words.
       The holder must STILL EXIST (`bundles` joined): a purged home's register rows are deleted with
       it, and a row orphaned any other way is not a home. The SAME bundle is never asked, so a
       revision re-registering its own bytes is unchanged. ONE bounded read, the shas as one bound
       JSON array (D-36); `capture_sha` is the key, so `shas.length` rows is the whole population.
       THE HOLDER IS NAMED ONLY TO A CALLER WHO MAY SEE IT (D-15), asked of the VISIBILITY stamp the
       control plane sets beside `actorIdentity` (`#inSight`, fail-closed on a stamped identity with
       no viewer). An unstamped write is not a caller (the store's own writes, fixtures driven at the
       store) and is told the holder, on `#rosterInSight`'s precedent. */
    const shas = [...new Set(regs.map((c) => c.sha256))];
    const homes = shas.length ? this.#rows(
      `SELECT r.capture_sha, r.bundle_id FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id
        WHERE r.bundle_id <> ? AND r.capture_sha IN (SELECT value FROM json_each(?)) LIMIT ?`,
      bundleId, JSON.stringify(shas), shas.length) : [];
    /* DEC-49 REGION is-register-home */
    if (homes.length) {
      const h = homes[0];
      const caller = viewing.identity != null || viewing.viewer != null;
      const named = !caller || this.#membership.inSight(h.bundle_id, viewing.viewer ?? null);
      return refusal("CAPTURE_HELD_BY_ANOTHER_BUNDLE",
        `this promotion registers capture ${h.capture_sha.slice(0, 16)}… under ${bundleId}, and those bytes are `
        + `already registered under ${named ? h.bundle_id : "another bundle"}. One capture has one home, the `
        + `original's; registering it here would move that bundle's register row`,
        { bundleId, capture_sha: h.capture_sha, holder: named ? h.bundle_id : null });
    }
    /* END DEC-49 REGION is-register-home */
    return null;
  }

  /** op=testify — A MEMBER RECORDS A FIRSTHAND OBSERVATION. */
  testify({ words = null, observedAt = null, title = null, author = null, claimedAuthor = null } = {}) {
    const refusal = rowRefusal(TESTIMONY_CHECKS);
    const who = typeof author === "string" ? author.trim() : "";
    /* DEC-49 REGION is-testify-act
       WHO FIRST, `transcribe`'s order: a machine is refused for BEING a machine.
       The control plane stamps `author` from the credential and overwrites any
       query-string value a caller sent, so a machine arrives honestly named
       `class:<cls>`. A caller who put an author in the BODY is refused by name
       rather than silently overridden — overriding would make the request look
       accepted as sent, and it was not. */
    if (!who || isMachineIdentity(who))
      return refusal("TESTIMONY_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential. A firsthand observation is a person's `
              + `word about what they saw, and it stands on that person's trust`
            : `this call carries nobody. The plane stamps the author from the credential that asked, `
              + `so an empty one means the act arrived by a route that does not attribute it`);
    if (claimedAuthor !== null && claimedAuthor !== undefined)
      return refusal("TESTIMONY_AUTHOR_SUPPLIED",
        `the request names an author (${JSON.stringify(claimedAuthor).slice(0, 60)}). The author of an `
        + `observation is the signed-in member, stamped by the plane, and is never taken from the request`);
    /* END DEC-49 REGION is-testify-act */
    const text = typeof words === "string" ? words : "";
    const bytes = new TextEncoder().encode(text);
    const recorded = secondOf(this.#now());
    const obs = typeof observedAt === "string" ? observedAt.trim() : "";
    const obsMs = observedMs(obs);
    /* DEC-49 REGION is-testify-words */
    if (!text.trim())
      return refusal("TESTIMONY_NO_WORDS",
        `the observation is empty. Nothing is prefilled: the words are what the member saw, in theirs`);
    if (bytes.length > TESTIMONY_MAX_BYTES)
      return refusal("TESTIMONY_WORDS_TOO_LONG",
        `${bytes.length} B written, over the ${TESTIMONY_MAX_BYTES} B one passage is stored to `
        + `(CAPTURE_TEXT_UNIT_CAP). Refused rather than cut: words silently truncated would be words the `
        + `member did not write, standing in their name`,
        { bytes: bytes.length, limit: TESTIMONY_MAX_BYTES });
    if (obsMs == null || obsMs > Date.parse(recorded))
      return refusal("TESTIMONY_OBSERVED_AT_INVALID",
        obsMs == null
          ? `observedAt ${obs ? `'${obs.slice(0, 40)}' is not a real calendar date (YYYY-MM-DD) or UTC instant `
              + `(YYYY-MM-DDTHH:MM[:SS]Z)` : `was not given`}. It is the member's own statement of when they `
              + `saw it, and the record does not supply one`
          : `observedAt '${obs}' is later than this record's own clock (${recorded})`,
        { observed_at: obs || null });
    /* END DEC-49 REGION is-testify-words */
    /* D-436 and K72 (7): THE PRODUCING GROUP the bytes name is the instance's recorded one, read by `promote` as its
       registered fact (promotion R13, K69) and written into the document there; with none recorded the creation
       states none and `promote` refuses it (GROUP_UNDETERMINED). That refusal rolls back the transaction below with
       the id it allocated, so no id is spent on a document that is not written. */
    const heading = (typeof title === "string" ? title : "")
      .replace(/[\p{Cc}]+/gu, " ").replace(/\s+/g, " ").trim().slice(0, 200)
      || `Firsthand observation, observed ${obs}`;
    /* THE CANONICAL ID (`BUNDLE_ID_RE`) carries a slug after the allocated
       number. It is the fixed word `observation` rather than one derived from
       the title or the words, so an id — which travels further than a document
       does — says what KIND of thing it names and nothing of what it says. */
    const out = this.#record.transact(() => {
      const id = `${this.#record.allocId("INFO", recorded.slice(0, 4)).id}-observation`;
      /* THE AUTHORED BYTES: A CANONICAL HEADER, THEN THE WORDS. Ruled by BOB #14,
         2026-09-18: two members' identical observations are TWO testimonies
         (MEMBER-KNOWLEDGE-DESIGN.md §3), and the register — keyed by the bytes —
         must not collide them; the answer is NOT an I5 key change but bytes that
         are unique per testimony. `testimonyBytes` is the one definition. */
      const fileText = testimonyBytes({ id, observedAt: obs, words: text });
      const fileBytes = new TextEncoder().encode(fileText);
      const sha = createSha256().update(fileBytes).hex();
      /* DEC-49 REGION is-testify-bytes
         THE REGISTER IS KEYED BY THE BYTES, and with the header those bytes are
         unique to this testimony — so a hit here is somebody having registered,
         IN ADVANCE, the exact bytes the next observation would have (the id is
         sequential and therefore predictable). Recording over them would re-file
         their register row under this bundle. Refused, naming no bundle (D-15);
         the id is spent and the next attempt gets new bytes. */
      if (this.#one(`SELECT 1 AS x FROM register WHERE capture_sha=?`, sha))
        return { spent: refusal("TESTIMONY_WORDS_REGISTERED",
          `the canonical bytes of ${id} (${sha.slice(0, 16)}…) are already registered in this record`) };
      /* END DEC-49 REGION is-testify-bytes */
      const file = `snapshots/observation-${sha.slice(0, 16)}.txt`;
      const locator = "a member's firsthand observation, authored in this record";
      /* MK-6 (§4.1): every file below names the author by this reference, never
         by `who`. `who` goes to the register row and the private rows beside it
         (the content row's minter, the log's actor), which no publication carries. */
      const observer = observerRef(id);
      const md = ["---",
        `id: ${id}`, "object_type: information", "schema: information@1",
        `title: ${JSON.stringify(heading)}`, "current_state: collected", "prior_state: null",
        `created: "${recorded}"`, `last_updated: "${recorded}"`,
        "produced_by:", "  mode: human", "  capability_tier: session",
        "references: []", "state_history: []",
        "annotations_open: 0",
        "reeval_pending:", "  flag: false", "  since: null", "  source: null",
        "visuals: []", "criticality: supporting", "source_status: unchanged",
        "source:", `  locator: ${JSON.stringify(locator)}`, "  authority: the observing member",
        `  retrieved: ${recorded}`,
        "monitoring:", "  enabled: false", "  frequency: none",
        "---", "", "## Summary", "",
        `A member's firsthand observation. Their words are \`${file}\`, below its canonical header, exactly as written; nothing here `
        + `paraphrases or summarises them.`, "",
        "## Provenance Notes", "",
        `Authored through op=testify. Observed ${obs}, in the member's own statement; recorded ${recorded}, `
        + `by this record's clock. The author is stamped by the plane from the signed-in session. It stands on `
        + `that member's trust, graded as testimony (MEMBER-KNOWLEDGE-DESIGN.md section 3).`, "",
        "## Session Log", "",
        `### Session ${recorded} | Authored | ${observer}`,
        "Trigger: testify",
        "Changes: created as a member's authored observation.", "",
        "## Review Notes", ""].join("\n");
      const doc = {
        file, locator, retrieved: recorded,
        /* THE THREE THE DESIGN NAMES, in the register entry. `authored` is honoured
           only because this method wrote it (the fence reads the register's flag,
           not this field); the author is the STAMP, recorded in the register and
           named here only by its opaque reference (MK-6, §4.1); the two dates are apart. */
        authored: true, author: observer, observed_at: obs, recorded_at: recorded,
        authority: "the observing member", authority_state: "determined",
        authority_basis: `the author of these bytes is the signed-in member the plane stamped from the session `
                       + `at op=testify, ${recorded}; the request could not name it`,
        provenance_chain: [{
          who: observer,
          asserts: `these are my own words, as written, about what I observed at ${obs}`,
          evidence: "authored through op=testify under a signed-in member session, hashed at receipt",
          bound: false,
        }],
        capture: {
          method: "authored by a member through op=testify; the bytes are a canonical header (bio-testimony/1: id, observed_at) and then the member's words as written, "
                + "hashed at receipt",
          /* NO `grade`, and the absence is the statement (§3, and C-18.1's authored
             arm): the capture axis measures reading a document in, and nothing was
             read in. */
          actor_class: "member", sha256: sha, encoding: "utf8", bytes: fileBytes.length,
          content_type: "text/plain; charset=utf-8",
        },
        origin: { kind: "member" },
        attestation_attempts: [],
      };
      const provText = JSON.stringify({ documents: [doc] }, null, 2);
      const enc = (t) => {
        const b = new TextEncoder().encode(t);
        return { text: t, bytes: b.length, sha256: createSha256().update(b).hex() };
      };
      /* The words' later work (the passage index, the content row over them and the extraction look) is the
         projections of the modules that own it (K31; `extraction`, `content`, `observation-log`), registered with
         promotion and run inside this same transaction when they read the payload under TESTIMONY_PATH; until they are
         extracted `legacy-store` registers them. A projection that answers `testimony: {content_id}` names the content
         row this answer reports. */
      const promoted = this.#promotion.promote({
          bundleId: id, base: null, snapKey: `${recorded.replace(/[-:]/g, "")}_${rand(4)}`,
          author: who,
          files: [{ path: "bundle.md", ...enc(md) }, { path: "data/provenance.json", ...enc(provText) },
                  { path: file, text: fileText, bytes: fileBytes.length, sha256: sha }],
          meta: { object_type: "information", title: heading,
                  current_state: "collected", prior_state: null, created: recorded, last_updated: recorded,
                  criticality: "supporting" },
          register: [{ sha256: sha, path: file, encoding: "utf8", bytes: fileBytes.length }],
          [TESTIMONY_PATH]: { captureSha: sha, author: who, observedAt: obs, recordedAt: recorded, words: text },
        });
      if (!promoted.ok) return promoted;
      return { ok: true, id, sha, file, fileBytes, promoted };
    });
    if (out.spent) return out.spent;
    if (!out.ok) return out;
    const { id, sha, file, fileBytes, promoted } = out;
    return {
      ok: true, bundle_id: id, bundle_sha: promoted.bundleSha ?? null, capture_sha: sha, file,
      bytes: fileBytes.length, words_bytes: bytes.length, content_id: promoted.testimony ? promoted.testimony.content_id ?? null : null,
      authored: true, origin: "member", actor_class: "member",
      author: who, observed_at: obs, recorded_at: recorded,
      axes: {
        capture: { grade: null, determined: false, undetermined_because: "CAPTURE_AXIS_AUTHORED",
                   why: "the capture axis measures the act of reading a document in, and a member's own "
                      + "words were not read in from anywhere, so it earns no letter here" },
        connection: { grade: null, determined: false,
                      why: "no reader ran over these words and nothing resolved them to a subject" },
        /* MK-2 / IC-142: the letter is the registry's own constant, so this answer and a leg's refusal cannot
           name different letters. */
        testimony: { grade: TESTIMONY_GRADE, determined: true,
                     why: `an observation is graded as testimony, ${TESTIMONY_GRADE}, on the observing `
                        + "member's trust (MEMBER-KNOWLEDGE-DESIGN.md section 3). A leg citing it carries "
                        + `grade_axis: testimony, grade: ${TESTIMONY_GRADE}, grade_source: testimony, and `
                        + "nothing raises it — another member agreeing is a co-signature, not a second "
                        + "observation" },
      },
      says: `${who} recorded a firsthand observation, observed ${obs}. The words are held exactly as `
          + `written and are the document; they stand on ${who}'s trust. This record takes the author from `
          + `the signed-in account and never from the request.`,
    };
  }

}

const instances = new WeakMap();

/** The one provenance instance for `host` (the Durable Object's `ctx`, with its `storage`); `deps` are read on the
 *  first call only. At creation it declares its tables to purge (record-core R21, R46) and joins every promotion with
 *  its check and projection (promotion R39). */
export function provenanceOf(host, deps) {
  let p = instances.get(host);
  if (!p) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host);
    p = new Provenance({ ...d, storage: d.storage || host.storage, record, membership, promotion });
    instances.set(host, p);
    record.declarePurge("provenance", ["register", "provenance_route_marks", "origin_declarations",
      { name: "captured_locators", keys: [] }, { name: "signed_receipts", keys: [] }], { exempt: ["receipt_keys"] });
    p.joinPromotion();
  }
  return p;
}

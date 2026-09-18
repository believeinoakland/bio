import { SCHEMA } from "./schema.mjs";
import { livefire } from "./livefire.mjs";
import { SETUP_HTML } from "./setup.mjs";
import { SIGN_HTML } from "./signpage.mjs";
import { liveToken } from "./tokens.mjs";
import { runGate, runCaseGate, GATE_VERSION } from "./gate.mjs";
import { verifySshsig, ratifyStatement, caseRatifyStatement, NS_RATIFY } from "./sshsig.mjs";
/* REC-128: who DELIVERED an attested act, read off the SESSION, and its read shape. */
import { deliveringPrincipal, delivererOf } from "./deliverer.mjs";
/* The locator fence, taken from the catalog rather than restated: https only,
   public hosts only, no credentials in the authority, no bare IPs, no localhost.
   It is the one bound between a member typing a URL and this Worker fetching it,
   so it must be the same function the checker uses on the queue. */
/* REC-50: `EARNED_CAPTURE_CEILING` arrives on the same import for the same
   reason — op=acquire STAMPS the direct-fetch capture grade, and the letter it
   stamps is the ceiling `checkEarnedLeg` enforces rather than a copy that
   happens to agree. One value, read where it is refused. */
/* REC-46 (2026-08-04): the two prefixes this file STAMPS on a machine
   credential now come from the catalog rather than being typed here twenty
   times. This is the trust boundary and the mint, so it is where the value used
   to live — but store.mjs held a copy of one of them and the catalog's gate
   knew about NEITHER, which is how `asserted_by: token:member` reached the
   record through op=promote (REC-45's measurement). One home, one spelling: a
   refusal that reads one literal while the stamp writes another is exactly the
   drift D-164 exists to stop. Nothing on the wire moves — the composed stamps
   are character-identical while the prefixes are `token:` and `class:`. */
import { isPublicHttpsLocator, parseFrontmatter, createSha256, normalizeType,
         completenessFields, biasAcknowledgementOf, sectionText, EARNED_CAPTURE_CEILING,
         /* PL-4: the ONE composer for the honest agent, and the capture-request
            arm's DEC-49 row. Both live in the catalog so the Durable Object's
            drain and this control plane cannot disagree about what was sent. */
         civicosUserAgent, CAPTURE_REQUEST_CHECKS,
         /* PL-11 / IS-5 / D-199: the ai credential's DEC-49 rows. The four this
            file enforces are the REACH ones, and they are here rather than in
            the store because the OPS table below is the only thing that knows
            what an op is or which classes may call it. */
         AI_CREDENTIAL_CHECKS,
         /* REC-79 / C-38: the ADMISSION GATE's DEC-49 rows — every refusal a
            caller meets before their op runs. Four of the six carried no code at
            all until REC-79, so the gate every caller passes through was outside
            the rule governing everything behind it. */
         ADMISSION_CHECKS,
         /* CAP-8 / C-48: the Google Drive host stack's DEC-49 rows. Every one is
            a NAMING — a folder, a kind the address does not carry, a shape this
            recogniser does not read, the application shell, an export that could
            not be fetched, and a caller trying to author the hop (D-112). The
            item's rule is that none of these is ever a silent skip. */
         DRIVE_CAPTURE_CHECKS,
         /* CPDF-19 / C-51: the read-time re-extraction's DEC-49 rows (D-319). */
         REEXTRACT_CHECKS,
         MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX,
         /* REC-123: the ONE machine-identity predicate (REC-46), asked by the two
            ratification fences of the stamp an `ai` credential acts under. */
         isMachineIdentity,
         /* CASE-4 / DEC-72: THE CASE RELATION, asked of signed bytes. Imported
            rather than restated so the ratify committer and the catalog that
            refuses on the same fact cannot answer it differently. */
         isCaseMemberBytes } from "../checks/bio-checks.mjs";
/* D-262: THE WHOLE CATALOGUE, AS A NAMESPACE AND NOT A LIST. `dec49Attach`
   below resolves a refusal code against every DEC-49 family the catalogue
   exports, and it finds those families BY THE `_CHECKS` SUFFIX — the same rule
   `civicos-ui/check-refusal-codes.mjs` harvests by, so a family minted tomorrow
   is reachable here with no edit. A named-import list would be a hand-kept copy
   of a set that grows every week, which is the staleness this project meets
   most; the named imports above stay named because they are used AS VALUES. */
import * as CHECK_CATALOGUE from "../checks/bio-checks.mjs";
/* REC-22 / DEC-34: the container serialiser. The manifest REC-14 writes carries
   a `layout` block that says how the parts assemble; this module reads it and
   writes the zip, so nothing about the container's shape is decided twice. */
import { serialiseContainer, containerEntries } from "./container.mjs";
/* CAP-8: the Google Drive HOST STACK, enacting Bob's ruling of 2026-09-14 — a
   link to a Drive file KEEPS THE LINK and the harvest is the OpenDocument export.
   `drive.mjs` is PURE (no fetch, no store, no registry): it reads an address's
   shape and composes the export address from the file id and the kind, and it
   builds the hop from what the plane itself derived. Nothing about the hop's
   three facts — export address, export format, producer — is readable off a
   request body, and `callerSuppliedHopFacts` makes an attempt to supply one a
   NAMED refusal rather than a silent drop (D-112). */
import { readDriveAddress, driveHop, callerSuppliedHopFacts,
         DRIVE_PRODUCER, driveConvertStep } from "./drive.mjs";
/* REC-19 / DEC-8: the act catalogue and derivation behind op=affordances. The
   catalogue reads the legal-edge table from the check catalogue (exported,
   never copied); `needs` and `mode` are composed HERE from NEEDS and
   SESSION_OPS, the tables that actually gate the call, so the publication and
   the gate cannot drift. */
/* REC-48 / DEC-39: op=acquire's `note` is COMPOSED from the enforced capture
   ceiling rather than spelled here. It is not the attest fence and is not
   `ATTEST_FENCE` — a different act, a different reader — but it states the same
   doctrine, so its two grade letters come from the same place the refusal reads
   them. The reasoning is on `acquireGradeNote` itself, beside the fence. */
import { ACTS, RUNGS, RUNG_ABSENT, VOCABULARIES, CAPTURE_ACTS, deriveActs,
         ACQUIRE_GRADE_NOTE } from "./affordances.mjs";
import { timestampRequest, parseTimestampResponse, TSA_ENDPOINTS,
         TSA_CONTENT_TYPE, TSA_ACCEPT,
         ARCHIVE_SAVE_BASE, ARCHIVE_SERVICE, archiveLocatorFrom } from "./tsa.mjs";
import { captureSubresources, normalizeAddress, normalizeCitation } from "./subresources.mjs";
/* COFF-1 (I7): the FORMAT registry is the ONLY format dispatch in this file.
   pdfstructure.mjs is no longer imported here — it is the registry's pdf
   entry, reached through getFormat("pdf").structure with byte-identical
   output; the acquire-time subresource guard and the profile's format stamp
   consult detectFormat. A new format costs one registerFormat() in
   formats.mjs and NO edit here — the D-70 test, and formats.test.mjs holds
   the evidence. */
import { detectFormat, getFormat } from "./formats.mjs";
/* CPDF-10: the transcription provenance CHAIN. Imported, never restated — the
   rules about what a derivation may claim live in ONE module so the wire that
   builds a chain and the act that attests to one cannot disagree about them.
   This file supplies no fidelity letters of its own beyond the two measured
   constants below, and holds no opinion about any engine. */
import { layerChain, appendStep, describeChain, checkChain, checkAnchor,
         checkConfidence, applyConfidenceFloor, mergedChain, convertedChain,
         /* FW-17 / IC-86: the reading-position normaliser lives beside the
            extent vocabulary it belongs to, for `checkAnchor`'s own stated
            reason — I2 already carries `source` for an element reference, and
            solving one problem twice produces two answers that disagree. */
         readingSource,
         /* REC-98 / D-283: the per-page tier-1-vs-tier-2 rule. CPDF-20 landed it,
            drove it over four real PDFs and PROVED it unreached — `npm run build`
            produced a byte-identical `bio-plane.bundled.mjs` because nothing
            imported these three names and esbuild shook them out. THIS LINE is
            what makes the rule reach the plane; the two call sites below are the
            wire CPDF-20's DELEGATION (CLAIMS.md 2026-09-14) names exactly. */
         mergeTier2Text, tier2Note } from "./textchain.mjs";
import { parseCdx, selectCapture, replayLocator, cdxQuery, archiveHop } from "./cdx.mjs";
/* docprofile is READ here, never copied. This is the FIRST plane consumer of it
   (CONSTRUCTS Step 1 / FW-3): op=acquire calls identify() and doctypeFor() to
   RECORD which host stack and which content type the record thinks it holds, so
   a judgment can later be found and revised when its recogniser turns out wrong.
   The package lives outside bio-plane/, which costs the deployed artifact nothing
   (I4): esbuild inlines it at build, and the miniflare battery resolves it from
   disk (modulesRoot "/"). profileRecord serialises the stack axis; the doctype
   axis is added beside it at the call site.

   CONSTRUCTS Step 2 / FW-4 also reads docprofile's `digests()` — the ONE
   implementation of the three normalisation digests, never a second copy — and
   `CONFIDENCE` (the single ladder) to gate whether a normalised digest can be
   trusted to assert two documents are the same substance. */
import { identify, doctypeFor, profileRecord, digests, CONFIDENCE, readText } from "../../docprofile/registry.mjs";

/* The plane's identity to a source, in one place because it was in three and
   they had drifted: `bio-acquire` on capture, `bio-monitor` on monitoring, both
   bare tokens with no version, no contact and no product form.
   *
   * BIO does not disguise its requests, which is a standing position and is not
   * what this changes. What it changes is that a bare token matches no browser
   * and no known-good crawler pattern, and a great many WAF rulesets refuse on
   * exactly that shape. The clients that DO reach the sources refusing us
   * (Google Apps Script, archive.org_bot) are both openly self-declared bots
   * with a version and a URL, so honesty is evidently not what is being
   * punished; illegibility might be.
   *
   * Whether this is the cause of the oaklandca.gov refusal is UNDECIDED, and it
   * is confounded with source-network reputation because every client that
   * succeeds has both a reputable network and a legible agent while we have
   * neither. This makes the variable we control testable. It does not settle
   * anything by itself, and a failure after this lands is a real result. */
export function userAgent(env, purpose = "acquire", delegated = null) {
  const version = (env && env.VERSION) || "0.0.0";
  const instance = (env && env.INSTANCE_NAME) || "unnamed";
  /* PL-4 / BOB-3: a DELEGATED member-browser agent is returned verbatim. It
   * reaches here only from op=acquire's capture-request arm, which reads it from
   * a row the drain's conduct check already judged legible — a caller cannot put
   * one on a request body, and there is no other call site that passes one. */
  if (typeof delegated === "string" && delegated.trim() !== "") return delegated.trim();
  /* The contact URL must RESOLVE. believeinoakland.org/civicos does not exist
   * yet (the registrar transfer is pending), and SOURCE-ACCESS.md records that
   * a contact address that 404s is worse than none. The repo URL resolves
   * today and names the project. MEASURED 2026-07-30 before shipping: this
   * exact string, 8/8 200 on the ACFR path and 4/4 on a second path, same
   * instrument as the SOURCE-ACCESS table. Revert to the domain URL when the
   * zone moves and the path exists. */
  /* PL-4: the STRING is now composed in `checks/bio-checks.mjs` and this
   * function delegates. The name, the signature and every call site here are
   * unchanged — what moved is the one place the bytes are decided, so the
   * Durable Object's capture-request drain can CHECK the agent it is about to
   * cause to be sent instead of checking a copy of it. A conduct check reading a
   * second copy is the "two bare tokens that did not agree with each other"
   * defect SOURCE-ACCESS.md records, rebuilt one layer down. */
  return civicosUserAgent(version, instance, purpose);
}

/* D-95: every governed outbound fetch asks the Durable Object for admission
 * first, waits the jittered gap the governor names, fetches with the legible
 * agent, and reports the outcome back so the host's discovered capacity is
 * learned rather than guessed. Refusal by the governor is a named answer, not
 * an exception. An UNREACHABLE governor never blocks the fetch: this is
 * politeness, not coordination, and if the store is down the op fails by
 * itself anyway. MEASURED case in point, 2026-07-30 on the deployed 0.46.0:
 * eleven captures of www.oaklandca.gov from Workers egress, one 403 on the
 * only cold back-to-back pair, ten paced or warmed requests admitted. */
/* The archive fallback's decision, in ONE place so the lookup op and the capture
 * path cannot drift into disagreeing about when the fallback may fire or which
 * capture it picks.
 *
 * Returns the selection AND the provenance hop. The hop is built HERE, from the
 * CDX record this function itself fetched, and is never accepted from a caller:
 * a chain hop a caller can hand us is a chain hop a caller can invent, and the
 * whole value of a disclosed transitive-trust chain is that the disclosure is
 * ours rather than theirs. That is D-112.
 */
async function archiveSelect(env, st, address) {
  const addrNorm = normalizeAddress(address);
  const reach = (await (await st.fetch(
    `http://x/sourcereach?address=${encodeURIComponent(addrNorm)}`)).json()).result;
  if (!reach.fallback_eligible) {
    return { ok: false, status: 409, payload: { ok: false, reason: "NOT_ELIGIBLE",
      detail: "archive.org is a backup source and this document has not been unreachable long enough to justify one",
      reachability: reach } };
  }
  /* THEIR figure, ours to obey conservatively. Set on first contact, recorded as
     a third-party number in ARCHIVE-FALLBACK.md, never presented as measured. */
  try {
    await st.fetch("http://x/governorconfig", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ host: "web.archive.org", appetite_per_min: 24 }),
    });
  } catch { /* the default appetite already governs; a missing override is not a failure */ }

  let res;
  try {
    const g = await governedFetch(env, st, cdxQuery(address), "archive-lookup");
    if (g.refusedByGovernor)
      return { ok: false, status: 429, payload: { ok: false, reason: "HOST_COOLING_OFF",
        detail: `the governor is holding requests to web.archive.org (${g.reason})`,
        retry_in_ms: g.retry_in_ms || 0 } };
    res = g.res;
  } catch (e) {
    return { ok: false, status: 502, payload: { ok: false, reason: "ARCHIVE_UNREACHABLE", detail: String(e && e.message || e) } };
  }
  if (!res.ok)
    return { ok: false, status: 502, payload: { ok: false, reason: "ARCHIVE_REFUSED", status: res.status,
      detail: res.status === 429
        ? "the Internet Archive is rate-limiting us; the governor will hold this host"
        : "the CDX endpoint did not answer with a record" } };

  const parsed = parseCdx(await res.text());
  if (!parsed.ok) return { ok: false, status: 502, payload: { ok: false, ...parsed } };
  const sel = selectCapture(parsed.rows);
  if (!sel.ok)
    return { ok: false, status: 404, payload: { ok: false, reason: sel.reason, detail: sel.detail,
      considered: sel.considered, address } };

  const replay = replayLocator(sel.chosen);
  return { ok: true, reach, chosen: sel.chosen, rejected: sel.rejected,
           usable_count: sel.usable_count, replay, hop: archiveHop(sel.chosen, replay) };
}

/* PL-4: `delegated` is the MEMBER'S OWN BROWSER AGENT and the only caller that
 * may supply one is the capture-request arm, which reads it from a request row
 * the drain has already judged — never from a request body. BOB-3 (DEC-47's
 * access-parity amendment) permits it for publicly available documents because
 * delegating an agent a member actually uses is a member speaking as themselves
 * through a tool they run; SOURCE-ACCESS.md's line is AUTHORSHIP, and a
 * fabricated string invents a client that does not exist. Every other call site
 * passes nothing and gets the honest CivicOS string, which stays the default for
 * all other traffic. */
async function governedFetch(env, stub, target, purpose, delegated = null) {
  let host = null;
  try { host = new URL(target).host; } catch { /* isPublicHttpsLocator refuses these shapes upstream */ }
  let waitMs = 0;
  if (host && stub) {
    try {
      const a = await (await stub.fetch("http://x/governoradmit", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ host }),
      })).json();
      const g = (a && a.result) || null;
      if (g && g.admitted === false)
        return { refusedByGovernor: true, reason: g.reason || "governed",
                 retry_in_ms: g.retry_in_ms || 0, last_refusal_status: g.last_refusal_status || null };
      waitMs = (g && g.wait_ms) || 0;
    } catch { /* ungoverned is better than unfetched; see above */ }
  }
  if (waitMs) await new Promise((s) => setTimeout(s, waitMs));
  const res = await fetch(target, { redirect: "follow", headers: { "user-agent": userAgent(env, purpose, delegated) } });
  if (host && stub) {
    const ra = res.headers.get("retry-after");
    let raMs = null;
    if (ra) {
      const n = Number(ra);
      raMs = Number.isFinite(n) ? n * 1000 : Math.max(0, Date.parse(ra) - Date.now() || 0);
    }
    try {
      await stub.fetch("http://x/governorreport", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ host, status: res.status, retry_after_ms: raMs }),
      });
    } catch { /* an unrecorded outcome is not a failed fetch */ }
  }
  return { res };
}
import { cpuProbe } from "./cpu.mjs";
import { Store } from "./store.mjs";
export { Store };
export { PUBLISHED_TOKEN_HASHES, liveToken } from "./tokens.mjs";

/* BIO plane, control plane entry.
 *
 * Secret discipline, which is a design constraint rather than a convention:
 *
 *   1. No module reads a credential at import time. Every secret arrives as a
 *      binding on env, so the whole tree loads and the whole battery runs with
 *      no secrets present at all. That is what makes the local suite
 *      credential-free by construction rather than by accident.
 *   2. R2 credentials never leave the Worker. The Worker holds the bucket as a
 *      BINDING, not as an access key, so there is no key to leak, rotate, or
 *      hand to anyone. Nothing outside Cloudflare ever signs an R2 request.
 *   3. Callers present a token whose CLASS bounds what it can do. A probe-class
 *      token can read and can touch only the scratch namespace. If it leaks it
 *      buys nothing.
 *
 * Token classes, extending the accelerator's tokenClass_ rather than replacing
 * it:
 *   admin   every op, including promotion against the live store
 *   member  read, lease, allocid, promote within the member's group
 *   probe   read-only ops, plus writes confined to the scratch namespace
 *   daemon  the UNATTENDED PATH, and nothing else: op=monitor and the archive
 *           arm of op=acquire, against the LIVE store. Not scratch-confined,
 *           because what it does is write the real record's reachability. See
 *           `classify()` for DEC-37's reasoning and why it is named for the
 *           path rather than for either of its two consumers.
 *
 * There is deliberately no public class. A credential handed to the public is
 * not a credential: to be public it must be widely distributed, and once
 * distributed it bounds nothing. It bought two ops and cost one real defect,
 * because the class existing invited op=index onto its list while op=index reads
 * the working corpus (D-30). The public surface is protected STRUCTURALLY
 * instead, by the classes:null ops below, each of which enforces its own gate
 * and answers only from the published projection. Safety comes from WHERE an op
 * reads, not from who holds a token.
 */

/* REC-91 — HOW MUCH OF A CAPTURE'S TEXT THE ACQUIRE ANSWER MAY CARRY. See the
 * long note at the emission site: this is NOT `CONTENT-SEARCH-DESIGN.md` §4.3's
 * per-capture bound (2 MiB, from M-20, applied in `store.mjs`), it is the bound
 * that actually binds, and it exists because `op=promote` refuses an inline
 * bundle file over `INLINE_MAX` (1 MiB) outright. Half of that, so JSON escaping
 * and the rest of the acquire document cannot push a promote over the limit. */
const ACQUIRE_TEXT_UNITS_BUDGET = 512 * 1024;
/* What one unit costs the wire BESIDE its text: the extent object, the seq, the
   keys and the indentation a caller serialising with `JSON.stringify(doc, null, 1)`
   adds — which is what `civicos-ui/app.html` does. Charged per unit so a document
   of twenty thousand short paragraphs cannot pass a byte budget on its words and
   then blow `INLINE_MAX` on its punctuation. */
const ACQUIRE_TEXT_UNIT_ENVELOPE = 128;
/* REC-111 -- THE UNIT CEILING THIS WIRE ALREADY HAS, WRITTEN DOWN. IT IS A
 * STATED CONSEQUENCE, NOT A SECOND CHECK, AND THE ABSENCE OF A CHECK HERE IS THE
 * ITEM'S OWN MEASURED RESULT RATHER THAN AN OMISSION.
 *
 * `CONTENT-SEARCH-DESIGN.md` section 4.3 asks for a unit budget "beside the byte
 * budget ... so both are stated in one place and neither hides the other",
 * because the index costs ROWS and FTS ENTRIES while every bound in that section
 * counts BYTES. The premise REC-111 was given -- *a container whose units are
 * many and small is bounded by nothing* -- is TRUE OF THE DESIGN AND FALSE OF
 * THIS WIRE, and that was found by measuring rather than by reading: the budget
 * above charges `ACQUIRE_TEXT_UNIT_ENVELOPE` per unit and a unit with no text is
 * never emitted at all (see the `arm` helper), so the smallest chargeable unit
 * is 1 + 128 B and this wire can emit AT MOST
 *
 *     floor(524288 / 129) = 4,064 units
 *
 * whatever the document is. M-20's fit (0.0076 ms/unit + 0.054 ms/KiB against a
 * 257 ms window) puts that worst case at 58.5 ms -- 22.8 % of the window. So the
 * many-small-unit overflow cannot happen HERE. It can happen one step down, in
 * `op=promote`, which reads `data/provenance.json` from a caller who may author
 * it: M-35 measured 13,720 units through that route before `INLINE_MAX` refuses
 * the file. That is where `store.mjs`'s `CAPTURE_TEXT_CAPTURE_UNIT_BOUND` bites,
 * and it is the bound that fires.
 *
 * WHY NO SECOND `if` IN THE LOOP BELOW, stated because adding one is the obvious
 * move and it is wrong. The largest unit budget that REGRESSES NOTHING is 4,096
 * (M-20's own *"largest promote that fits is ~3,900 units"*, at the resolution
 * these constants use), and 4,096 is ABOVE the 4,064 this wire can reach -- so a
 * wire-side unit budget provably cannot fire on this tree. Set it lower and it
 * starts trimming real documents: M-20's median `doc-para` is 10 B, so a
 * document of ~3,800 short paragraphs passes today, and a budget of 3,000 would
 * silently stop indexing part of it. **A refusal invented without measuring what
 * the record already accepts takes capability away silently** -- section 4.3 has
 * shipped exactly that once and this item exists partly to undo it. A check that
 * cannot fire is worse than no check, because it is a mechanism a reader would
 * believe on the strength of its existence.
 *
 * WHAT IS LIVE INSTEAD IS AN ASSERTION, and there is deliberately NO
 * `ACQUIRE_TEXT_UNITS_CEILING` constant here to go with this paragraph: a
 * constant nothing reads is the same dead mechanism one sentence up, wearing a
 * name. The ceiling is DERIVED where it can be checked --
 * `capture-text-index.test.mjs` reads the two operands out of THIS FILE and the
 * bound out of `store.mjs`, does the division itself, and pins
 * `ceiling <= CAPTURE_TEXT_CAPTURE_UNIT_BOUND`. **That is the whole point.** The
 * ceiling is a side effect of an ENVELOPE ESTIMATE -- "about eight indented
 * lines" -- and section 4.1 already names `sheet-range` as a coming unit arm
 * whose extent is larger, so that estimate WILL be revised. Without the pin, a
 * change about BYTES would silently change what a member's promote may COST,
 * which is the drift this item exists to stop. */
const OPS = {
  //  op          class allowed              mutating
  selftest:   { classes: ["admin", "member", "probe"],           mutating: false },
  livefire:   { classes: ["admin", "probe"],                     mutating: true  },
  /* op=index reads the `bundles` table, which is WORKING corpus, so it is not a
     published-scope read and the public class must not have it. A title is the
     leak that matters: it names what the group is looking into, and the state
     says how far along they are, both before there is anything to answer. The
     public surface for a listing is `publishedlist`, which reads the projection
     that has never held unratified material. Asserted in test/fence.test.mjs. */
  index:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* S-10 step 1. The metadata projection the retrieval surface filters and sorts
     on, including source.locator and source.authority, which Bob settled as
     searchable. Working corpus, so member class and above, never public: the
     same fence that governs op=index governs this. */
  projection: { classes: ["admin", "member", "probe"],           mutating: false },
  reproject:  { classes: ["admin", "probe"],                     mutating: true  },

  /* Section 7 participation. These existed in the Durable Object's route map
     and were absent HERE, so every real caller got "unknown op": 7.2, 7.4, 7.6,
     7.7 and 7.8 were shipped and unreachable. Standing lesson 5 one level
     worse, since they were not merely tested at the DO but reachable only
     there. `by` is stamped server-side below from the session.

     A machine credential reaches these and is refused by the store, because
     `class:member` is not a member id and matches no participation row. Fail
     closed rather than fail open. */
  projectinvite:       { classes: ["admin", "member", "probe"], mutating: true  },
  projectjoin:         { classes: ["admin", "member", "probe"], mutating: true  },
  projectleave:        { classes: ["admin", "member", "probe"], mutating: true  },
  projectremove:       { classes: ["admin", "member", "probe"], mutating: true  },
  projectowneradd:     { classes: ["admin", "member", "probe"], mutating: true  },
  projectownerremove:  { classes: ["admin", "member", "probe"], mutating: true  },
  projectfork:         { classes: ["admin", "member", "probe"], mutating: true  },
  /* 7.13. The single exception to administrators holding no authority over
     projects, and only when EVERY owner of that project is inactive. The store
     enforces both halves; `by` is stamped server-side below. */
  projectownerrescue:  { classes: ["admin", "member", "probe"], mutating: true  },
  projectparticipants: { classes: ["admin", "member", "probe"], mutating: false },
  /* The 7.10 arithmetic, computed rather than transcribed, so an interface can
     tell a group what a change would take BEFORE they start one. op=adminarith
     is the same thing for section 4.7, and the two differ at n=2 on purpose. */
  projectownerarith:   { classes: ["admin", "member", "probe"], mutating: false },
  /* Section 1.3. A member declares their own; an administrator confirms. Both
     stamped server-side below, because a declaration a caller can address to
     someone else is not a declaration, and a confirmation a caller can sign as
     an administrator is not a confirmation. GATES NOTHING: these appear in no
     capability check and no session. */
  expertisedeclare:    { classes: ["admin", "member", "probe"], mutating: true  },
  expertiseconfirm:    { classes: ["admin", "member", "probe"], mutating: true  },
  expertiselist:       { classes: ["admin", "member", "probe"], mutating: false },
  /* D-98, the task inbox. Note what is NOT here: `taskenqueue`. The producer is
     the capture path and reaches the queue through the Durable Object directly,
     so there is no control-plane route by which any credential can put an event
     in the queue on its own account. The consumer, `taskdrain`, is the sole
     writer of tasks, and `actor` on every one of these is stamped server-side
     below: a forward a caller can sign as someone else is not a forward. */
  /* D-104. The counter the archive fallback will read, exposed so an operator can
     see WHY a document is or is not eligible, including the governed refusals
     that are deliberately excluded from the verdict. */
  sourcereach:         { classes: ["admin", "member", "probe"], mutating: false },
  /* The archive fallback's DECISION half. Non-mutating: it asks the Internet
     Archive what it holds and applies the rules; capturing the bytes is a
     separate, ordinary op=acquire carrying via=archive.org. Keeping them apart
     means the eligibility fence and the capture path each do one thing, and the
     lookup can be run to ask "would this fire, and why" without fetching
     anything into the record. */
  archivelookup:       { classes: ["admin", "member", "probe"], mutating: false },
  tasks:               { classes: ["admin", "member", "probe"], mutating: false },
  taskdrain:           { classes: ["admin", "member", "probe"], mutating: true  },
  /* REC-28 / D-151: NO PROBE CLASS on the two MEMBER verbs, and the class list is
     the smaller half of that fix. A probe credential has no business forwarding
     or resolving anything — it is the unattended prober, and these two verbs are
     a person's acts — so the table stops advertising it and answers "forbidden
     for token class".
     What the class list CANNOT do is the reason the real fence is in the store:
     `classes` is checked against the caller's CLASS, and a member/admin SESSION
     arrives as exactly that class (index.mjs sets `cls = kind` from the session),
     so "admin"/"member" must stay for the Tasks screen to work at all — and a
     MEMBER_TOKEN or ADMIN_TOKEN machine credential is INDISTINGUISHABLE here from
     the session it must admit. Both still REACH the ops and are refused by the
     store BY SHAPE on the server-stamped actor (MACHINE_CANNOT_FORWARD /
     MACHINE_CANNOT_RESOLVE), the same way release/conclude/reopen are. Removing
     probe narrows who knocks; the act refusal is what answers the door. */
  taskforward:         { classes: ["admin", "member"],          mutating: true  },
  taskresolve:         { classes: ["admin", "member"],          mutating: true  },
  /* Section 8.1. Admin class ONLY, and additionally refused to a SESSION below:
     "the ADMIN_TOKEN-class credential" is not satisfied by a session belonging
     to an administrator, because a session is password-derived and the root of
     trust is the token set in the hosting dashboard. Mutating, because it writes
     the export log: an export that left no trace would defeat the recording. */
  export:              { classes: ["admin"],                    mutating: true  },
  /* The log is READ by in-app administrators who cannot run an export. They must
     be able to see that one happened even though they cannot cause it. */
  exportlog:           { classes: ["admin", "member", "probe"], mutating: false },
  /* Section 8.2. classes: null, because published-record reconstruction requires
     NOTHING: the hashes are public and verifiable by any stranger without this
     instance's cooperation or continued existence. It reads the published
     projection and never the working corpus, which is the whole of its safety,
     exactly as op=verify does. */
  publishedmanifest:   { classes: null,                         mutating: false },
  /* What the caller may DO, so an interface builds its controls from the plane
     rather than from a copy that drifts, exactly as op=searchfields does for the
     query language. Section 5's "absent from their interface" is implementable
     only if the interface can ask. */
  whoami:              { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-19, standing doctrine DEC-8: what may be DONE to an object, published
     by the plane so an act surface renders options it received and never
     computes one — whoami's pattern for capabilities, searchfields' for the
     query language, extended to the act construct. Reads the working corpus
     (an object's state and edges), so member class and above, never public;
     when REC-25 stamps the D-15 viewer gate onto the read paths this op should
     take the same stamp. */
  affordances:         { classes: ["admin", "member", "probe"], mutating: false },
  /* S-10 steps 2 to 4: the retrieval surface. It reads the WORKING corpus, so it
     is member class and above and never public, exactly like op=index and
     op=projection. There is no public token class to grant it to and there must
     never be one: a search result carries titles, states, locators and
     authorities, which together name what the group is looking into and how far
     along it is, before there is anything to answer.
     `viewer` is stamped below from the authenticated identity and a
     caller-supplied value is overwritten, because the D-15 visibility gate is
     only a gate if the caller cannot choose whose view it compiles. */
  search:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* PL-9 / D-222 option C: the SAME query compiler, read at MEANING grain — the
     legs a claim rests on and the resolutions a document carries, for the
     bundles `q` selects. Fenced exactly as op=search is and for a STRONGER
     reason: a search result names what the group is looking into, and this names
     what it thinks the evidence establishes. `viewer` is stamped below from the
     authenticated identity, because a gate the caller can choose the view of is
     not a gate. */
  meaningrows: { classes: ["admin", "member", "probe"],          mutating: false },
  /* The vocabulary of the query language, so a UI builds its controls from the
     plane rather than from a copy that drifts. Working-corpus field names, so
     the same fence applies. */
  searchfields:{ classes: ["admin", "member", "probe"],          mutating: false },
  /* The verifier for "the index cannot diverge from the corpus": it re-derives
     the expected text row for every bundle and compares. Read-only. */
  searchindexcheck: { classes: ["admin", "member", "probe"],     mutating: false },
  /* S-10 step 5. A selection is a server-side construct so the set an operator
     selected is the set an action lands on. Two kinds: a QUERY selection, where
     the operator picked a criterion and the current answer to it is the correct
     set by definition, and an ENUMERATED one, where they picked specific items
     and membership is frozen. `select` is mutating because it writes a snapshot;
     it writes nothing about the corpus and a probe-class caller is still
     confined to scratch. */
  select:          { classes: ["admin", "member", "probe"],      mutating: true  },
  selection:       { classes: ["admin", "member", "probe"],      mutating: false },
  selectionlist:   { classes: ["admin", "member", "probe"],      mutating: false },
  selectionrelease:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* The first action that refers to a selection: citing Information in a
     Project, at weight `report`. Mutating, because it promotes the Project with
     the new edges written into its bundle.md; `refs` is a projection of that
     document and is never written directly (D-21). Member class and above like
     every other reader of the working corpus, and there is no public class to
     grant it to. */
  cite:            { classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11 step 3: bulk disposition of Problems, weight `refuse`. Contribute-gated
     like every other corpus write. */
  dispose:         { classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11 step 4: bulk retirement of Information, weight `refuse`. Heavier than
     dispose because `retired` is TERMINAL, and it additionally refuses anything
     a live `cites` edge still points at: stranding citations manufactures the
     C-6.2 error condition at whatever scale the operator selected. */
  retire:          { classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11 step 5, the last rung. A machine class REACHES it and is refused by
     the store (MACHINE_CANNOT_RELEASE), fail closed like participation: the
     collected-to-verified transition is a named member's decision (Intake
     Doctrine section 4, C-18.1), and the author stamp below is `token:<class>`
     for a machine, which the store refuses by shape. */
  release:         { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-13: CONCLUDING an inquiry, open -> concluded. Release's shape and
     release's class list for release's reason — a machine class REACHES it and
     is refused by the store (MACHINE_CANNOT_CONCLUDE) rather than being absent,
     fail closed, because "a machine may surface a question and may never author
     the conclusion" is a rule about who the caller IS and is enforced on the
     author stamp below. Unlike its state-action siblings it takes a single
     `target` rather than a selection: one conclusion answers one question, and
     a bulk conclude would be the checkbox the construct exists to refuse. */
  conclude:        { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-31: REOPENING an inquiry the group set down, deferred|dismissed ->
     open. Conclude's class list for conclude's reason — a machine class
     REACHES it and is refused by the store (MACHINE_CANNOT_REOPEN) rather
     than being absent, fail closed, because overturning the group's own
     disposition is a rule about who the caller IS and is enforced on the
     author stamp below. One `target`, like conclude: one question is picked
     back up at a time. */
  reopen:          { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-16: DIVIDING an inquiry, open|surfaced|concluded -> divided. Conclude's
     class list for conclude's reason — a machine class REACHES it and is
     refused by the store (MACHINE_CANNOT_DIVIDE) rather than being absent, fail
     closed, because deciding that a question was two questions is a member's
     judgement about the record and the rule is about who the caller IS. One
     `target`, like conclude and reopen: one question is divided at a time, and
     the CHILDREN arrive in the POST body because the apportionment is an array
     of arrays and a query string cannot express one honestly (op=publish's
     precedent exactly). */
  inquirydivide:   { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-45: AUTHORING THE GROUNDS PARTITION on an inquiry (DEC-32). Conclude's
     class list for conclude's reason — a machine class REACHES it and is
     refused by the store (MACHINE_CANNOT_GROUND) rather than being absent, fail
     closed, because "these reasons are enough on their own" is a member's
     authored judgement about their own argument and the rule is about who the
     caller IS. One `target`, like conclude, reopen and inquirydivide: one
     question's structure is authored at a time. The PARTITION arrives in the
     POST body because it is an array of objects each holding an array of
     ordinals, which a query string cannot express honestly — op=publish's and
     op=inquirydivide's precedent exactly. */
  inquiryground:   { classes: ["admin", "member", "probe"],      mutating: true  },
  /* PL-2 / IS-2: THE SIX MEMBER OPS OF THE SIXTH STATE MACHINE — the acts that
     settle which reading of the evidence a question's answer rests on.
     Conclude's class list for conclude's reason: a machine class REACHES all six
     and is refused BY THE STORE (MACHINE_CANNOT_MOVE_VERSION) rather than being
     absent from this table, fail closed, because "the AI holds no op that
     accepts" (INVESTIGATIVE-SESSION.md section 4) is a rule about who the caller IS
     and is enforced on the author stamp below.
     One `target` and one `version` each, like conclude and reopen: one reading
     is settled at a time, and a bulk version would be the checkbox these
     constructs exist to refuse. The REASON arrives in the POST body because it
     is prose and a query string is a poor place for a sentence a member wrote. */
  versionaccept:   { classes: ["admin", "member", "probe"],      mutating: true  },
  versionreject:   { classes: ["admin", "member", "probe"],      mutating: true  },
  versionconsider: { classes: ["admin", "member", "probe"],      mutating: true  },
  versionrevert:   { classes: ["admin", "member", "probe"],      mutating: true  },
  versioncurrent:  { classes: ["admin", "member", "probe"],      mutating: true  },
  versionhide:     { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-24 (c)/(d): THE TWO OPS THAT OPERATE AN ACTION — the first ops in this
     table whose subject is an action at all. `STATES.action` has carried five
     states and seven edges since the catalog was written and nothing wrote them,
     so IMPACTING had zero reachable processes.
     Conclude's class list for conclude's reason: a machine class REACHES both
     and is refused BY THE STORE (MACHINE_CANNOT_MOVE_ACTION,
     MACHINE_CANNOT_CORRESPOND) rather than being absent from the table, so the
     refusal says what is wrong instead of saying "requires a credential you
     have". An action reaches OUTSIDE this system and touches people who never
     agreed to be in it, and testimony about an exchange is somebody's — neither
     is a scheduler's to author.
     One `target` each, like conclude and reopen: one action moves at a time and
     one entry is appended at a time, and a bulk version of either would be the
     checkbox these constructs exist to refuse. */
  actionmove:      { classes: ["admin", "member", "probe"],      mutating: true  },
  actioncorrespond:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11 step 2: the first STATE-CHANGING actions to refer to a selection, and
     therefore the first callers of selectionResolve's REFUSING arm. Severing
     withdraws a citation without deleting it and reinstating restores one; both
     require a reason, because the catalog's own remediation for a bad reference
     is "sever with reason" and an edge moved with no reason is an unexplained
     change wearing a status field. */
  sever:           { classes: ["admin", "member", "probe"],      mutating: true  },
  reinstate:       { classes: ["admin", "member", "probe"],      mutating: true  },
  list:       { classes: ["admin", "member", "probe"],           mutating: false },
  image:      { classes: ["admin", "member", "probe"],           mutating: false },
  file:       { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-25: the plane-side gated BACKLINK read — every edge INTO a bundle,
     with the citing bundle filtered by the viewer's position (Membership
     Architecture 7.9). Exists so the UI can delete its client-side
     reverseRefs walk, which rebuilt the reverse-edge leak by walking every
     project's projection. Working corpus, so member class and above; the
     viewer is stamped server-side below like every retrieval read. */
  backlinks:  { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-17 / P-64: the RE-EVALUATION OBLIGATION, derived on read. Which
     inquiries rest on something that has MOVED — superseded, republished at a
     new edition, deferred, reopened or dismissed — as a query over REC-11's
     reverse index and the supersession reverse column, never a stored flag and
     never a verdict computed from strength. Working corpus, so member class and
     above; the viewer is stamped server-side below like every retrieval read.
     NO `NEEDS` ENTRY, deliberately and on op=governorstate's precedent: a read
     carries no working capability, so REC-19's NEEDS/NON_ACTS totality neither
     gains nor loses a row. */
  reevaluations: { classes: ["admin", "member", "probe"],        mutating: false },
  /* REC-34: REC-12's derived PAIR for one inquiry, GATED — UI-11's delegation
     and UI-12's hard blocker. It answers from `strengthOf()`, the authority,
     and never from the five cached columns (a stale cache must not impersonate
     the derivation). Working corpus, so member class and above, exactly as
     op=backlinks and op=reevaluations are: the pair is what a member reading a
     question needs in order to weigh it, and fencing it to admin would fence a
     member off the one number the whole page is about. The viewer is stamped
     server-side below like every retrieval read. It carries a NEEDS entry of
     null rather than no entry at all — op=queue's precedent, not
     op=reevaluations' — so REC-19's totality guard SEES the op and its
     NON_ACTS row states why a read is not an act on an object. */
  inquirystrength: { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-18: what the RECORD earns for each candidate basis leg, GATED. It is
     part of the earned rule rather than a convenience beside it: op=promote
     refuses a leg whose earned grade is not the value the record holds, and a
     member with no way to LEARN that value is a member the refusal pressures
     into guessing — "a gate that pressures someone into inventing one is a bug
     in the gate" (CLAUDE.md). The refusal and this answer come from ONE store
     function, so they cannot disagree. Member class and above on
     op=inquirystrength's reasoning exactly, and the viewer is stamped
     server-side below. NEEDS entry of null with a NON_ACTS row, same shape. */
  earnedbasis: { classes: ["admin", "member", "probe"],          mutating: false },
  /* REC-83 / IC-84 (4): THE FIXED-KEY CONTENT READ — one content row by
     `content_id`: its extent, its human `ref`, the chain and cap it was minted
     under, whether the transcription has since moved (`stale`), and the
     attestations that COVER it.

     MEMBER CLASS AND ABOVE, on op=textattest's reasoning exactly rather than by
     resemblance: what a citation points at, and whether the text under it has
     been checked, is a fact about the record that a view-only member weighing a
     case needs precisely as a contributor does. A probe may ask, because "is
     anything in this store cited at a grain nobody has attested" is a question
     an operator should be able to answer without a session.

     `mutating: false` AND IT WRITES NOTHING — unlike its sibling op=earnedbasis,
     whose backfill arm is declared at its own site. This op resolves a row that
     already exists and mints nothing: an id nothing has cited does not exist,
     and answering NO_SUCH_CONTENT is the whole of what it does about that.

     FIXED-KEY, AND THE REFUSAL IS PART OF THE CONTRACT (D-222): the
     content-grain QUERY arm is stage C, behind D-225's caps. This op takes its
     key and the server-stamped viewer and REFUSES every other parameter by
     name — a predicate or a page is not ignored here, because a parameter
     silently dropped is a filter the caller believes was applied.

     `viewer` is stamped server-side below like every read that names a bundle;
     the store fails closed on an absent stamp and answers a row the caller may
     not see EXACTLY as one that does not exist. That matters more here than on
     most reads: the id is a hash of a capture, an extent and a chain, so an
     answer that distinguished hidden from absent would let a caller confirm a
     passage exists in a project they were never invited to by guessing its
     address. NEEDS entry of null with a NON_ACTS row, op=earnedbasis' shape. */
  content:     { classes: ["admin", "member", "probe"],          mutating: false },
  /* SK-7 / framework Part II §14.4 (Bob's 5.7): MARKING A PASSAGE AS CITABLE.
     *"The assistant may mark passages as citable on its own, every such row
     labelled as machine work, never attested by it, and part of a finding only
     when a member cites it."*

     BEFORE THIS OP THERE WAS NO DOOR AT ALL. A content row came into being only
     inside `op=promote`'s projection, which means a passage became addressable
     at the instant a member had ALREADY cited it — so the EXTRACT role §14.4
     gives the machine had nowhere to land, and `minted_by` (IC-83's column,
     landed with REC-82) could only ever read `plane`.

     `probe` IS ADMITTED, and the cut is a different one from `attesttext`'s two
     lines up rather than a looser one. EXTRACTING is what §14.4 says the machine
     may do — *"document → content … the role that makes everything else
     addressable"* — and the recognisers and fleet members that do it today are
     probe-class by construction. ATTESTING is testimony and is refused to every
     machine credential (C-35.10, UNCHANGED). The two acts sit on opposite sides
     of the one fence this item is about, so they take opposite class cuts and
     the reasoning is written out rather than inherited by proximity.

     `member` IS IN THE LIST AND THAT IS WHAT LETS AN AGENT REACH IT AT ALL —
     `aiReachesAsMember` is the ONLY door for the `ai` class, so this row admits
     no `ai` (no row does) and FL-6's cascade reaches it exactly when the member
     who minted the credential named this op in its declared `writes`. Nothing
     about the class list is special-cased for machines; the floor does it.

     THE MINTER IS STAMPED SERVER-SIDE below and the body's is never read, which
     is the impostor rule at a field whose entire subject is who acted. */
  contentmint: { classes: ["admin", "member", "probe"],          mutating: true  },
  /* SK-8 / `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3 — THE EXTRACT RUN'S
     PRODUCTIONS, and the class cut is the one directly above rather than a new
     one. D-358's answer was that EXTRACT runs in DEC-62's RUN with **no new
     runtime, no new credential class, no new fence**, so these two sit in
     `contentmint`'s classes because the write performs `contentmint`'s act
     inside a bounded object. The `ai` class reaches them through the DEC-55
     floor exactly as it reaches that one — the credential's own declared
     `writes` is what admits it, and nothing here is special-cased for machines.

     THE REAL NARROWING IS NOT IN THIS TABLE AND IS NOT IN A CLASS LIST: it is
     the STORE's, where the run object is. `extractPropose` refuses a production
     with no live EXTRACT run by name, and refuses one whose run declares no
     `mints` bound — because a run begins on a member's act (§7.3 (4)) and its
     productions are budgeted in the bounds table it already has (§7.3 (5)).
     `extractpropose` is named in `AI_RUN_ACTIONS` to say what KIND of act it is;
     that array gates nothing. The proposer is stamped server-side below and the
     body's is never read. */
  extractpropose:   { classes: ["admin", "member", "probe"],     mutating: true  },
  extractproposals: { classes: ["admin", "member", "probe"],     mutating: false },
  /* REC-86 / IC-123 — NARROW (Bob's 5.3). The ACT and its candidate READ, and
     the class cut is `contentmint`'s: a member (or an admin, or the probe) may
     reach both. What the ACT refuses to a machine is not decided here — it is
     the store's `NARROW_NOT_A_MEMBER` (C-50.5), on the author the control plane
     stamps below, because a machine arrives honestly named `token:<class>` and
     is refused BY SHAPE rather than by a class list that would also have to
     keep the probe out. The READ is open to every class that may read: a
     machine's proposals are listed to whoever may see the question. */
  narrow:           { classes: ["admin", "member", "probe"],     mutating: true  },
  narrowcandidates: { classes: ["admin", "member", "probe"],     mutating: false },
  dangling:   { classes: ["admin", "member", "probe"],           mutating: false },
  stats:      { classes: ["admin", "member", "probe"],           mutating: false },
  promote:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-130's sweep, stated at the site because the row asked for it: `allocid`
     with `prefix=CASE` tells its caller the NEXT number off the CASE sequence, so
     it discloses how many case identities this year has minted. It does NOT fall
     under the unsigned-case rule, and the reason is the rule's own: that rule is
     about a stranger learning a case's EXISTENCE AND CONTENT, and this op is
     gated to the instance's own members (never anonymous), names no case, carries
     no scope, roster or title, and burns the number it reveals. A count of
     sequence draws is the same disclosure for every namespace (INQ, INFO, …) and
     is instance-level knowledge a member already holds. */
  allocid:    { classes: ["admin", "member", "probe"],           mutating: true  },
  lease:     { classes: ["admin", "member", "probe"],           mutating: true  },
  purge:      { classes: ["admin", "probe"],                     mutating: true  },
  capture:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* A pure read, and computed at read time on purpose: which partition a link
     falls in depends on what the record holds today, not on what it held when
     the document was captured. */
  links:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* PL-10 / D-220: the DOCUMENT-VERSION CHAIN — every version at one address,
     in date order, with its bundle. A pure read, and it adds no state of its
     own: the answer is a JOIN over `captured_locators` and `register`, both of
     which the record has always held, asked through the index that has always
     existed. It sits beside op=links because it is the same kind of question
     asked of the same address key — op=links asks what pointed AT an address,
     this asks what we have HELD at one.
     `viewer` is stamped below from the authenticated identity: the answer names
     a bundle per version, so a member must not be able to learn from a version
     chain what op=list would not tell them. */
  versionchain: { classes: ["admin", "member", "probe"],         mutating: false },
  /* PL-1 / IS-1: THE BASIS VERSIONS OF ONE INQUIRY — every alternative account
     of the evidence for a question, with its ground partition, the AND/OR
     relationship it states, the derivation edge it came along, and the run that
     proposed it. A pure read, and there is deliberately NO write op beside it:
     versions are authored in `bundle.md` and land through op=promote's own
     projection, so a version table an op could append to directly would be a
     second place to state a fact `bundle.md` already holds (D-21).
     `viewer` is stamped below from the authenticated identity: the answer names
     an inquiry and the bundles its versions rest on, so a member must not learn
     from a version set what op=list would not tell them. */
  basisversions: { classes: ["admin", "member", "probe"],        mutating: false },
  /* PL-14 / IS-7: THE STRENGTH PAIR over ONE reading of a question's evidence
     (§12) — per axis, over two populations, never composed into one number. A
     pure read: it writes nothing, adopts nothing and makes nothing current,
     which is §6 rule 6 as a mechanism rather than a promise (exploring an
     unaccepted reading is CALCULATING OVER IT, never designating it). The
     state-set argument defaults to `accepted` inside the store, so a caller who
     says nothing gets the record's own answer rather than a permissive one.
     `viewer` is stamped below from the authenticated identity: the answer names
     a question and every document its legs rest on, so a member must not learn
     from a strength what op=list would not tell them. */
  versionstrength: { classes: ["admin", "member", "probe"],      mutating: false },

  /* PL-12 / D-84: the bias object's three ops.
     `biasmanifest` is a READ and is gated on the viewer below, like every read
     in this table that names a bundle.
     `biasadopt` is MUTATING and is deliberately reachable by `member` and not
     only by `admin`: the doctrine puts instance bias in the admins' hands and
     PROJECT bias in the project managers', and a project manager is a member.
     What stops a member adopting on the instance's behalf is not this list — it
     is that the act is ATTRIBUTED, published with the group's work, and refused
     outright to a credential with no name (C-26.9).
     `biasinhale` is MUTATING: FALSE, and that is not an accident of shape, it
     is DEC-54 (c). Reading a policy proposes; it never installs. The method
     holds no write path at all and `test/bias.test.mjs` asserts that off the
     source — this row is the second, weaker statement of the same fence, and it
     is here so that a caller reading the op table learns the fact too. */
  biasmanifest: { classes: ["admin", "member", "probe"],         mutating: false },
  biasadopt:    { classes: ["admin", "member", "probe"],         mutating: true  },
  biasinhale:   { classes: ["admin", "member", "probe"],         mutating: false },
  /* CONTENT-PDF's structure extractor (D-91), exposed as a READ over already-
     captured bytes. It reads the exact R2 object op=capture serves and parses
     it; it writes nothing and holds no PUT arm, so unlike op=capture it is
     genuinely non-mutating. That gives it the SAME effective posture as an
     op=capture GET — admin/member/probe class, a signed-in session reaches it
     with no capability, no write gate — without the GET special-case op=capture
     needs only because op=capture also writes. No new permission is invented. */
  pdfstructure: { classes: ["admin", "member", "probe"],         mutating: false },
  runtime:    { classes: ["admin", "member", "probe"],           mutating: false },
  /* Turning resolved links into traversable edges WRITES, so it is its own op
     rather than a flag on the read. A mutating arm hiding inside a
     non-mutating op would pass the gate that exists to stop exactly that. */
  linkproject:{ classes: ["admin", "member", "probe"],           mutating: true  },
  /* Burns compute deliberately to find where the runtime cuts it off. Probe and
     admin only: it belongs nowhere near a member's session. */
  cpuprobe:   { classes: ["admin", "probe"],                     mutating: true  },
  /* Acquisition: the fetch layer the intake doctrine calls M2'. It writes bytes
     and no bundle state, because the doctrine is explicit that no intake path
     writes live state and the daemon and the member are writers like any other. */
  /* REC-33: `daemon` is admitted HERE so the class can reach the op at all, and
     is then confined to the ARCHIVE ARM inside the handler — the direct arm
     refuses it by name. The confinement cannot live in this table, which knows
     only the op, so the two halves are asserted together in
     test/daemon-token.test.mjs: admitted here, refused there. */
  acquire:    { classes: ["admin", "member", "probe", "daemon"], mutating: true  },
  /* Co-attestation. Asks a timestamp authority to attest that a capture existed
     at a claimed instant, which is the one part of provenance a group cannot
     fabricate for itself. */
  attest:     { classes: ["admin", "member", "probe"],           mutating: true  },
  /* The monitor. Checks whether a monitored source still serves what was
     captured and records the answer as a mechanical monitor-tick, inside the
     field set C-20.1 holds that operation to. */
  /* REC-33: the FIRST of the daemon class's two verbs, and the whole of it —
     op=monitor is admitted wholesale because the op IS the unattended job; it
     has no second arm to confine the class to. */
  monitor:    { classes: ["admin", "member", "probe", "daemon"], mutating: true  },
  /* A conformance pass over the whole store, run inside the Durable Object where
     the images already are. Read-only, paginated, and resumable by cursor. */
  audit:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-54 / D-200. Rebuild a document's provenance chain FROM THE EVIDENCE the
     capture record already holds, or refuse and name what is missing. Mutating,
     but it REPORTS by default and writes only on `apply=1`, because every use of
     it is a correction to the real record. NOT open to `daemon`: deciding that
     the evidence supports a route is a named member's judgement, which is the
     same line op=release and op=reopen already draw, and the whole risk this op
     carries is a chain nobody witnessed being written by something unattended. */
  provenancechain: { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-63 / DEC-56 / D-204. ASSESS a document's provenance route and record
     what was found — the standing MARKER Bob's ruling licenses, at the state the
     document already sits in. Mutating because it writes a marker row, and it is
     the ONLY thing it writes: no state moves, no file changes, no sha changes.
     NOT open to `daemon`, on op=provenancechain's own line: deciding that the
     evidence does not support a route is a named member's judgement about the
     record, and a standing statement in the record with nobody's name on it is
     not a statement. */
  provenanceroute: { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-116 / IC-120: the READ half. `mutating: false` is the whole point of the
     row — for 39 days the only op over this table was the WRITE above. */
  provenanceroutes: { classes: ["admin", "member", "probe"],     mutating: false },
  /* Write arc. Ratification's authority is the SSHSIG itself, checked
     against the registered signers; the token or session only reaches the
     surface. Member and signer administration is admin-only. Probe class
     reaches everything so the whole write arc is exercisable against
     scratch, whose Durable Object is a different instance with its own
     member tables, so scratch enrollment can never touch the live roster. */
  ratify:       { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-14. The state act that AUTHORS a case: it writes the completeness
     assertion, the declared subject position, both frozen strengths and the
     declared bar into the bytes op=ratify then signs. Separate from ratify
     because authoring the assertion CHANGES THE SHA -- you cannot sign first
     and write the caveat later. */
  publish:      { classes: ["admin", "member", "probe"],           mutating: true  },
  strengthbar:  { classes: ["admin", "member", "probe"],           mutating: true  },
  strengthbarof:{ classes: ["admin", "member", "probe"],           mutating: false },
  publishededitions: { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-22, the PUBLIC READ PATH. `classes: null` — NO credential of any kind,
     and it is the same argument op=verify and op=publishedmanifest already make
     rather than a new one: both read the PUBLISHED PROJECTION ONLY
     (published_bundles, published_shas, published_edges and the PUBLISHED
     bucket), all of which are written by ratification alone, so there is no
     working material for a missing predicate to leak. That is the property
     schema.mjs:172 says those tables exist to guarantee, and REC-30's sweep
     records both ops as deliberately ungated for exactly this reason.

     publishedcase answers by BUNDLE ID (with an optional edition, latest by
     default) or by BUNDLE SHA, which resolves to ITS OWN edition — DEC-12's
     "edition 1 still answers after edition 2 lands", checkable rather than
     stated. publishedbytes answers BY HASH AND NEVER BY PATH, so the published
     corpus cannot be walked: a sha with no published_shas row 404s, and it 404s
     identically whether it was never ratified or never existed. */
  publishedcase:  { classes: null,                                 mutating: false },
  publishedbytes: { classes: null,                                 mutating: false },
  /* CASE-4 / DEC-72: THE REVISION FLAGS ON A PUBLISHED CASE. A case is a frozen,
     signed edition honest as of its date; when a member finding is later revised
     the containing cases are FLAGGED, set-but-never-clear until each owning
     project acts. This is where a reader — a member deciding whether to publish
     a new edition, or a stranger weighing how current a case is — sees which
     flags stand and which were discharged.

     `classes: null` — UNGATED, on publishedcase's own reasoning above and not on
     a new one. Every fact in the answer is already public: the case editions and
     their rosters come out of op=publishedcase, the pinned hash is in the
     container manifest a stranger verifies against, and the revised hash is a
     published version's own. Nothing here reads working material, so there is no
     working material for a missing predicate to leak — and gating it would
     withhold from a member exactly what the published record already tells
     anybody. NO `NEEDS` ENTRY, on op=reevaluations' precedent: a read carries no
     working capability, so REC-19's NEEDS/NON_ACTS totality neither gains nor
     loses a row. */
  caseflags:      { classes: null,                                 mutating: false },
  /* CASE-5b / DEC-72: THE CASE-LEVEL SIGNING CEREMONY, and it is two ops
     because reviewing and signing are two acts.

     `casedocument` is UNGATED (`classes: null`) on op=publishedcase's own
     reasoning and not a new one. A RATIFIED case document is signed published
     bytes a stranger is entitled to check — it is the artifact the container
     carries, and gating it would make the stranger-verification path depend on
     this instance's goodwill, which is the one thing that path exists to refute.
     AN UNRATIFIED one is working material and — CORRECTED by REC-130 / IC-141,
     2026-09-18 — it answers ONLY to standing in the owning project. This comment
     used to say it was answered to anybody, "deliberately", because the answer
     says `ratified: false`; that was a mechanism choice with no ruling behind it,
     and it handed a stranger the group's scope, roster, exclusions and bias
     acknowledgement before any member had signed them, over ids that come off a
     sequence. BOB #14 ruled it as the publication fence applied: every caller
     without standing is answered EXACTLY as for a case that does not exist, so
     enumeration learns nothing. The op stays `classes: null` because the signed
     half must stay public; `caseReader` resolves who is asking without refusing
     anybody, and the store's `caseDocumentFacts` decides.

     `caseratify` is GATED like `ratify`, and to the same classes: it is the
     publication surface, and the registered signing key governs the authority on
     top of the capability. No fifth capability token is minted. */
  casedocument:   { classes: null,                                 mutating: false },
  caseratify:     { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-126 / DEC-31 / IC-145: THE REVIEW COPY (`BIO_Publication_v0_1.md` §6A),
     an addressed act BESIDE publish that never leaves the instance.

     `casedraft`, `reviewgrant` and `reviewrevoke` are GATED to the classes that
     reach `publish`, and ride its capability in NEEDS: authoring the group's draft
     and handing it to a named person is the publication surface, one act short of
     publishing. The store then asks the project-OWNER question (`publishCase`'s
     own predicate) and refuses a machine by name, so a machine class reaching the
     op is refused at the act rather than here.

     `reviewcopy` and `reviewcomment` are UNGATED (`classes: null`) on
     `casedocument`'s reasoning, because their whole point is a RECIPIENT who
     holds no credential of this instance — only the grant's read SECRET, which is
     not a token, is never classified, and cannot reach any other op. A member
     reaches both with an ordinary session through the same `caseReader` the
     unsigned case document uses. Both answer every caller without a live grant or
     standing with ONE set of bytes. `reviewcomment` is `mutating: true` because it
     writes a row; its NEEDS entry is below with its reason. */
  casedraft:      { classes: ["admin", "member", "probe"],           mutating: true  },
  reviewgrant:    { classes: ["admin", "member", "probe"],           mutating: true  },
  reviewrevoke:   { classes: ["admin", "member", "probe"],           mutating: true  },
  reviewcopy:     { classes: null,                                   mutating: false },
  reviewcomment:  { classes: null,                                   mutating: true  },
  excludedby:   { classes: ["admin", "member", "probe"],           mutating: false },
  publishedlist:{ classes: ["admin", "member", "probe"],           mutating: false },
  inbox:        { classes: ["admin", "member", "probe"],           mutating: false },
  inboxget:     { classes: ["admin", "member", "probe"],           mutating: false },
  inboxresolve: { classes: ["admin", "member", "probe"],           mutating: true  },
  memberadd:    { classes: ["admin", "probe"],                     mutating: true  },
  memberlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  memberset:    { classes: ["admin", "probe"],                     mutating: true  },
  /* The membership model's member half. `memberadd`, `memberset`, `membercaps`,
     `adminendorse` and `adminremove` are admin-only: section 4 governance.
     `memberlist` is NOT, and this comment used to say it was — the second of
     D-157's three self-contradicting sites, sitting two lines under the entry
     that is the first: a grant of admin, member AND probe, which was the
     TRUTHFUL one. Section 3 gives members and the public the
     HANDLE roster ("Members and the public see handles"); what only
     administrators see is the cover↔handle PAIRING ("Pairing. Only
     administrators see cover and handle together"). That distinction cannot be
     expressed by a class ACL — the op must stay reachable by the callers who
     must not see the pairing — so it is a PROJECTION in Store.memberList(),
     driven by the `administer` stamp set beside the D-15 viewer stamp below.
     `adminarith` is a read of the rule itself, so a UI can tell a group what a
     removal would take before they begin one. */
  membercaps:   { classes: ["admin", "probe"],                     mutating: true  },
  adminendorse: { classes: ["admin", "probe"],                     mutating: true  },
  adminremove:  { classes: ["admin", "probe"],                     mutating: true  },
  adminarith:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* D-9: why a register row is unreferenced. A read that classifies every row
     against what the store actually holds, so the 20 unexplained rows on the
     live instance stop being a plausible story and become a measured one.
     Admin, because the register is intake provenance for the working corpus. */
  registeraudit:{ classes: ["admin", "probe"],                     mutating: false },
  /* CONSTRUCTS Step 3 (FW-5): the reading persisted at promote. `reading` reads
     one captured document's reading (entities + document facts) by its capture
     sha; `readingref` is the reverse index — which documents' readings carry a
     raw entity reference (kind:key, as it appears, unresolved). Both read-only:
     a member watching the record may see what kind of thing the plane read out of
     a document and which other documents mention the same reference. */
  reading:      { classes: ["admin", "member", "probe"],           mutating: false },
  readingref:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-36: the same reverse question asked by NAME. Entity-driven and not
     name-driven on purpose: the measurement (MEASUREMENTS.md 2026-08-04) found
     abbreviations in the corpus whose full names appear in no label, and only a
     name somebody registered reaches those. Read-only, and it establishes nothing:
     it offers CANDIDATES for a member to confirm, and op=resolve is still the only
     thing that grades.

     REC-40 WIDENED IT TO EVERY TIER, and the two ops are no longer split by which
     tier they can reach. As REC-36 shipped, `readingname` answered on the NAME a
     reading recorded (8.1's grade C) and `readingref` on the REFERENCE STRING, so
     the A and B tiers — a document whose reference, or whose reference key, is
     spelled like one of the subject's registered names — were proposable only by a
     caller who already knew the exact string to ask for, and after UI-26 traded the
     per-name loop away they were proposable from no surface at all. The term index
     now carries all three of the strings `#recognise` grades on, each under its own
     source, so ONE `readingname` call answers every tier at one indexed lookup,
     gated identically, and each candidate says which string carried the name and
     what op=resolve WOULD mint for it.

     THE TWO OPS ANSWER DIFFERENT QUESTIONS AND ARE DELIBERATELY NOT COLLAPSED.
     `readingref` takes a raw reference string FROM THE CALLER and answers which
     documents carry exactly it, knowing nothing about the registry; `readingname`
     takes a REGISTERED SUBJECT and walks its own aliases into the index. A caller
     holding a reference string and no entity still has only the first, and one
     answering on behalf of a subject wants the second. `readingref` is unchanged. */
  readingname:  { classes: ["admin", "member", "probe"],           mutating: false },
  /* CPDF-10 — THE TRANSCRIPTION PROVENANCE SURFACE, and the three-way split is
     the item's doctrine expressed as a capability boundary rather than as a
     comment.

     `textprovenance` and `textattest` are READS on the same terms every other
     reading read is on: what a document's text was produced BY is a fact about
     the record, and a view-only member weighing a case needs it precisely as a
     contributor does — op=earnedbasis' reasoning, one axis over. A probe may
     ask, because "is anything in this store OCR'd" is exactly the question an
     operator should be able to answer without a session.

     `attesttext` IS DIFFERENT IN KIND, and the difference is the whole item.
     Attesting is a person saying they compared this text against the image of
     the page — it is testimony, it carries their name for as long as the record
     lasts, and there is no version of it a token can perform. So it is
     `mutating: true` (SESSION_OPS therefore keeps a machine credential off the
     session route) AND `checkAttestation` refuses a machine stamp at the store.
     TWO FENCES ON PURPOSE: REC-45 measured that the gate accepted
     `asserted_by: token:member` while eleven hand-typed copies of the same
     question disagreed, so an act this consequential is refused at the door it
     is asked at and again at the door it is written through. */
  textprovenance: { classes: ["admin", "member", "probe"],         mutating: false },
  textattest:   { classes: ["admin", "member", "probe"],           mutating: false },
  attesttext:   { classes: ["admin", "member"],                    mutating: true  },
  /* REC-87 / IC-128 — TRANSCRIBE (Bob's 5.2), and the class cut is `attesttext`'s
     one row up for `attesttext`'s reason: typing what a page says, and attesting
     somebody else's typing, are both a person's word carrying their name for as
     long as the record lasts. `mutating: true` keeps a machine credential off
     the session route, and the store refuses a machine stamp BY NAME again
     (C-52.1 for the typist, C-35.10 for the attestor) — two fences on purpose.
     The READ is open to every class that may read, on `op=content`'s terms. */
  transcribe:          { classes: ["admin", "member"],             mutating: true  },
  transcriptionattest: { classes: ["admin", "member"],             mutating: true  },
  transcription:       { classes: ["admin", "member", "probe"],    mutating: false },
  /* MK-1 / D-184 / IC-133 — TESTIFY: a member records a firsthand observation,
     which becomes an authored INFO bundle whose bytes are their words
     (MEMBER-KNOWLEDGE-DESIGN.md section 2). The class cut is `transcribe`'s one
     row up and for its reason: a person's word in their own name. NAMED `testify`
     because `op=claim` is the instance-claim op and the design's own word for
     the route is "the testimony path"; `resolvetestify` is a DIFFERENT act (a
     member's grade-D testimony that a document concerns a subject), and the two
     share the verb because both are a member's word standing on their trust. The
     store refuses a machine stamp BY NAME (C-53.1) — two fences, `transcribe`'s. */
  testify:             { classes: ["admin", "member"],             mutating: true  },
  /* MK-4 / IC-136 — THE LEAD (D-194, MEMBER-KNOWLEDGE-DESIGN.md §5). Writing a
     lead and recording that you followed it are a PERSON's acts in their own
     name — what they were told, where they looked — so both are `transcribe`'s
     class cut: `mutating: true` keeps a machine credential off the session route
     and the store refuses a machine stamp BY NAME again (C-54.2, C-54.8). The
     READ is open to every class that may read; the store answers a lead the
     viewer may not read exactly as one that does not exist (C-54.5). */
  lead:                { classes: ["admin", "member"],             mutating: true  },
  leadlook:            { classes: ["admin", "member"],             mutating: true  },
  /* BOB #14's ruling (2026-09-18): the AUTHOR shares a lead to a project, an
     authored dated act — `lead`'s class cut and reason. */
  leadshare:           { classes: ["admin", "member"],             mutating: true  },
  leadread:            { classes: ["admin", "member", "probe"],    mutating: false },
  /* CPDF-13 — THE CALIBRATION SURFACE (D-183, D-253), and the class split is a
     different cut from CPDF-10's above because a different thing is at stake.

     THE TWO READS are on the same terms every reading read is: what an engine
     was measured at, and which transcriptions rest on a measurement that has
     since moved, are facts about the record. `calibrationdrift` in particular
     is the answer to "is anything in this store graded against a number nobody
     stands behind any more", and withholding that from a view-only member
     weighing a case would be the record knowing something about its own
     reliability that the person relying on it may not ask.

     `calibrate` IS THE CONSEQUENTIAL WRITE and is nonetheless open to `probe`,
     which is the opposite of `attesttext` beside it — so the reasoning is
     written out rather than assumed. ATTESTING IS TESTIMONY: a person says they
     compared this text against the image, it carries their name for as long as
     the record lasts, and there is no version of it a token can perform.
     CALIBRATING IS MEASURING: a probe ran, over stated inputs, and produced
     stated scores, and a machine is exactly the right thing to do that — the
     scheduled re-probe this item builds is a machine act by construction. The
     fence that matters here is therefore NOT about who may measure; it is that
     a measurement may never move a GRADE, and that is enforced structurally at
     the store (`CAL_CANNOT_REGRADE`) and by the drift handler writing nothing.
     Admitting `probe` and then refusing the grade move is the honest shape;
     refusing the machine and letting the grade move would be the fence in the
     wrong place, which is the defect this project meets most.

     `calibrationsignal` is the WEAKEST act in the plane and is open for the
     same reason: it records that a vendor announced something, carries no
     fidelity, and can only ever pull the next probe EARLIER. */
  calibrations: { classes: ["admin", "member", "probe"],           mutating: false },
  calibrationdrift: { classes: ["admin", "member", "probe"],       mutating: false },
  calibrate:    { classes: ["admin", "member", "probe"],           mutating: true  },
  calibrationsubject: { classes: ["admin", "member", "probe"],     mutating: true  },
  calibrationsignal: { classes: ["admin", "member", "probe"],      mutating: true  },
  /* CONSTRUCTS Step 4, SLICE A (FW-6): the SUBJECT REGISTRY / entity axis (D-83 —
     the framework's entity axis and the bias doctrine's safeguard-4 subject registry
     are ONE construct). Members BUILD the registry: entitycreate registers a subject
     (with inline aliases), entityalias attaches an alias, relationdeclare declares a
     CONSTITUTIVE relation (proxy_for/member_of/overlaps) carrying a justification +
     citation and NO connection grade (a declared relation is not on the §8.1 grade
     axis; grading it Grade D is the category error D-83 names). The three writes
     stamp declared_by from the session, like expertisedeclare. The reads (entity by
     key, entitybyalias, relation by id) are read-only. Members author and read the
     registry; probe is admitted so the surface is exercisable. */
  entitycreate: { classes: ["admin", "member", "probe"],           mutating: true  },
  entityalias:  { classes: ["admin", "member", "probe"],           mutating: true  },
  relationdeclare:{ classes: ["admin", "member", "probe"],         mutating: true  },
  entity:       { classes: ["admin", "member", "probe"],           mutating: false },
  entitybyalias:{ classes: ["admin", "member", "probe"],           mutating: false },
  relation:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* CONSTRUCTS Step 4, SLICE B (FW-7): the RECOGNISERS. `resolve` runs the recogniser
     over a captured document's reading references and stores each resolution with its
     §8.1 connection grade (A source's own composite identifier, B the source's bare
     identifier in content, C name correspondence — never D, which the machine never
     mints); `resolvetestify` is the member's grade-D TESTIMONY path (an author and a
     date, no captured basis). Both mutate and stamp resolved_by from the session below.
     `resolutions` reads a document's resolutions; `concerns` is the REVERSE INDEX —
     every document that concerns an entity, joined on entity_id, never through a
     declared relation. Both read-only; probe admitted so the surface is exercisable. */
  resolve:        { classes: ["admin", "member", "probe"],         mutating: true  },
  resolvetestify: { classes: ["admin", "member", "probe"],         mutating: true  },
  resolutions:    { classes: ["admin", "member", "probe"],         mutating: false },
  concerns:       { classes: ["admin", "member", "probe"],         mutating: false },
  /* CONSTRUCTS Step 5, SLICE A (FW-8): CONNECTIONS AS DATA and the PROGRESSION
     DEFINITION as data (framework §8/§8.1/§8.2 — absorbs D-67 storage + D-72 grade).
     `connect` DERIVES and persists the connections among the documents that concern one
     entity, each carrying the §8.1 grade of its WEAKER end (the two-node base case of a
     progression); `connections` reads them by entity or by capture; `progressiondefine`
     authors a progression's ordered stages as data (both example progressions expressible
     as rows), stamping the declaring member below; `progression` reads one. The two writes
     mutate; the two reads are ungated like the FW-7 reads. Probe admitted so the surface is
     exercisable. */
  connect:          { classes: ["admin", "member", "probe"],       mutating: true  },
  connections:      { classes: ["admin", "member", "probe"],       mutating: false },
  progressiondefine:{ classes: ["admin", "member", "probe"],       mutating: true  },
  progression:      { classes: ["admin", "member", "probe"],       mutating: false },
  /* CONSTRUCTS Step 5, SLICE B (FW-9): PROGRESSION INSTANCES and the MISSING-PREDECESSOR
     finding (M4's acceptance). `thread` threads REAL captured documents through a definition's
     stages by a threading entity — only documents that RESOLVE to it (FW-7) — and stamps the
     threading member below; `instance` reads the instance with its grade (the WEAKEST
     connection along the N-stage chain, D-73 pair→chain) and its missing-predecessor findings,
     both DERIVED on read. `thread` mutates; `instance` is ungated like the other reads. */
  thread:           { classes: ["admin", "member", "probe"],       mutating: true  },
  instance:         { classes: ["admin", "member", "probe"],       mutating: false },
  /* CONSTRUCTS Step 5, SLICE C (FW-10): EXCEPTION DOCUMENTS that discharge a lawful skip
     (framework §8.2). `discharge` records an exception document against an instance's stage — a
     real captured document that RESOLVES to the threading entity (FW-7) and NAMES a real stage,
     carrying reason + citation — and stamps the declaring member below; op=instance then renders
     that missing required stage as a "discharged" state, not a missing-predecessor finding.
     `exceptions` reads the raw discharge rows. `discharge` mutates; `exceptions` is ungated like
     the other progression reads. */
  discharge:        { classes: ["admin", "member", "probe"],       mutating: true  },
  exceptions:       { classes: ["admin", "member", "probe"],       mutating: false },
  /* REC-6: the DISCOVERY feed for DERIVED findings (UI-5's delegation). `proposals` walks every
     progression instance at READ time for its missing-predecessor findings and returns them BOTH
     raw-per-instance (the shape UI-5's loadProposals already consumes) and D-79-aggregated (one
     proposal per (progression_key, stage_key), N instances, weakest grade, surfaced_by machine).
     It REPORTS and never mutates — derived things inform — and is ungated like the other
     progression reads (op=instance / op=exceptions): a member session reads the record's own
     questions. It needs no scheduled alarm; the PUSH walking-task is a separate later item. */
  proposals:        { classes: ["admin", "member", "probe"],       mutating: false },
  /* REC-7: record a member's DEFER/DISMISS of a derived proposal WITHOUT minting a bundle (UI-5's
     second delegation). op=dispose disposes a focus BUNDLE; a proposal is not a bundle, and D-79
     settles that declining ages a finding with a recorded reason — it does not author. So this
     MUTATES (it writes one disposition row) but mints no bundle, opens no focus, attributes nothing
     beyond the disposition. Contribute-gated like the other progression writes; the deciding member
     is stamped server-side below, and op=proposals then ages the disposed proposal out of open. */
  proposedispose:   { classes: ["admin", "member", "probe"],       mutating: true  },
  /* REC-9: the per-document progression lookup (UI-9's delegation). `captureprogressions` maps a
     CAPTURE back to the progression instances it is threaded into, its stage in each, and each
     instance's missing_predecessor + overdue_successor findings — the ONE derivation point
     (#assembleInstance + REC-8's #overdueFindings), keyed by capture instead of by (progression,
     entity). No existing op answers it: op=instance needs BOTH (progression_key, entity_id), and
     op=proposals walks every instance but carries no capture_sha. It REPORTS and never mutates —
     derived things inform — and is ungated like the other progression reads (op=instance /
     op=proposals): a member session reads this document's place in the record's processes. Takes the
     same optional `now` as-of clock op=proposals takes. */
  captureprogressions:{ classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-20 / DEC-16: the member's ONE queue. OBLIGATIONs (from `tasks`) and
     FINDINGs (from the proposals derivation) in ONE contract, each carrying its
     `class`, its `options[]` (REC-19's derivation, never a surface's copy) and
     its `case` — EVERY ancestor over a bounded walk of the basis and citation
     edges. It REPORTS and never mutates. Member class and above and never
     public: a queue names what the group is working on and who owes what, which
     is the working corpus. `member` AND `viewer` are stamped server-side below
     — whose queue this is, and whose view its case names are compiled for, are
     server decisions or they are not decisions at all (D-15 §7.9: the queue is
     the one surface every member opens by habit, so it is the one that must not
     leak a project identity). */
  queue:              { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-21 / D-125: the queue's PERSONAL half, and NO PROBE CLASS on either —
     which is the deliberate part. A machine credential has no member behind it,
     so there is no attention for it to be a preference ABOUT; admitting probe
     and refusing inside would be inventing a member in order to refuse them.
     This is not the D-151 fence-versus-act question (an unassigned task is a
     real object a machine could reach and must not resolve); it is that a mute
     with no member is not a thing that exists. The store refuses NO_MEMBER too,
     so a bypass fails closed rather than writing a row keyed on nothing.
     BOTH MUTATE, and they mutate ONE table: `queue_state`. Neither writes to
     `tasks` or `proposal_dispositions` and neither mints a bundle — the
     op=proposedispose precedent carried one step on. Declining is not
     authoring; a preference is not even a disposition. */
  queuemute:          { classes: ["admin", "member"],               mutating: true  },
  queuesnooze:        { classes: ["admin", "member"],               mutating: true  },
  /* IS-6 / INVESTIGATIVE-SESSION.md §11: THE INVESTIGATIVE RUN. Three writes
     and two reads, and the class lists say two things worth stating.

     PROBE IS ADMITTED on all five, unlike the queue pair above, and the
     distinction is the same one D-151 drew: a mute with no member behind it is
     not a thing that exists, whereas a RUN is a real object with a real subject
     that a machine credential legitimately drives — the whole design has the run
     executing in a FLEET MEMBER (§14a), which is a machine. What bounds it is
     not the class list but `scopeFor`, which confines probe to the scratch
     namespace, and the store's own two-principal requirement.

     NO `ai` CLASS IS MINTED HERE. D-199's `ai` credential class is IS-5's, and
     inventing one now would be choosing its shape before the item that owns it
     measures anything. These ops ride the existing classes and IS-5 narrows
     them; that direction is safe and the other is not.

     THE TWO READS ARE GATED (D-15) on the run's context, which is an inquiry or
     a project bundle — classified in test/gate-reads.test.mjs, where every read
     op must be. `viewer` is stamped server-side below. */
  airunopen:          { classes: ["admin", "member", "probe"],      mutating: true  },
  airuntick:          { classes: ["admin", "member", "probe"],      mutating: true  },
  airunclose:         { classes: ["admin", "member", "probe"],      mutating: true  },
  airun:              { classes: ["admin", "member", "probe"],      mutating: false },
  airunlog:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-93 / IC-92 — THE FRONTIER READ (`OBSERVATION-LOG-DESIGN.md` §6 row 1):
     *what have we looked for at this level, and what came of it* — the candidate
     list for FETCH / EXTRACT / DERIVE. A READ, so `mutating: false`.
     THE CLASSES ARE THE RUN LOG'S, and that is deliberate rather than copied: §6
     says *"a subject discloses a project's interest, so REC-36's withholding
     applies row-whole across the fence"*. What a caller may SEE is decided by
     the D-15 viewer stamp in the store, never by the class here — the same line
     `airuns` draws two rows down. */
  frontier:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-94 / IC-95 — THE PER-CAPTURE CONTENT-AXIS READ (`OBSERVATION-LOG-DESIGN.md`
     section 4.2, section 6 row 2): *which of the four content-axis states is this
     capture in, and why*. A READ, so `mutating: false`.
     THE CLASSES AND THE GATE ARE `frontier`'S, for the reason section 6 gives one
     row up: this answers whether a particular document's text was ever extracted,
     which discloses that this project holds that document at all — the same
     disclosure a frontier subject makes, one capture at a time. The viewer stamp
     below decides what a caller may see; the class list here never does. */
  contentaxis:        { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-69 / UI-49's delegation: the CONTEXT-keyed read. Same classes as its
     three run-id-keyed siblings, because what a caller may see is decided by
     the D-15 viewer stamp in the store and never by the class here. */
  airuns:             { classes: ["admin", "member", "probe"],      mutating: false },
  /* PL-3 / IS-4 — THE SUGGEST ENDPOINT, the ONE write the investigative
     session holds (§4 group 2: it REQUESTS acquisition, it SUGGESTS, and it
     ACCEPTS nothing). It rides the SAME classes as the run ops above and for
     the same recorded reason: PL-11 mints the `ai` class and NARROWS these, and
     widening later is the safe direction while shipping a class nothing
     measures is not. Its own fence is not the class list — it is that the sole
     state it can write is `suggested`, written as a literal with no parameter
     behind it, and that the six pre-write checks run PLANE-SIDE. */
  suggest:            { classes: ["admin", "member", "probe"],      mutating: true  },
  /* PL-4 / IS-4 / SWEEP 4b.1 — THE CAPTURE-REQUEST DOOR, and the split between
     these four rows IS the item.

     `capturerequest` is §4 group 1: *"It REQUESTS acquisition — it does not
     perform it."* It writes a row and holds no fetch, so it rides the same
     classes as the run ops and PL-11 narrows them.

     `capturerequestdrain` is the DAEMON'S verb and carries NO MEMBER CLASS. It
     is the one thing in this plane that turns a request into a fetch, and a
     member reaching for it by hand would be a person doing the daemon's job with
     the daemon's conduct rules applied to them — the same line op=taskdrain
     draws between a producer and a consumer, one door over. `daemon` is here
     BY DECISION: SWEEP 4b item 1 is the decision DEC-37 required for widening
     the class *"by decision, not by drift"*, and test/daemon-token.test.mjs's
     totality assertion is corrected in the same turn rather than exempted.

     `capturerequestdraining` and `capturerequests` are READS, and NEITHER
     ADMITS THE DAEMON CLASS. That is deliberate and it is the narrower half of
     the widening: op=acquire's capture-request arm asks the DURABLE OBJECT
     directly, not through this table, so the daemon needs no read here — and a
     credential that sits unattended in a config file has no business
     enumerating the queue of addresses this group is about to fetch. The class
     therefore reaches exactly THREE ops, one more than DEC-37 scoped it to and
     that one by decision. */
  capturerequest:      { classes: ["admin", "member", "probe"],           mutating: true  },
  capturerequestdrain: { classes: ["admin", "probe", "daemon"],           mutating: true  },
  capturerequestdraining: { classes: ["admin", "probe"],                  mutating: false },
  capturerequests:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* PL-11 / IS-5 / D-199 — MINTING AN AI CREDENTIAL, AND THE CLASS LIST IS THE
     ENFORCEMENT RATHER THAN A NOTE ON IT.

     NO `ai` CLASS APPEARS IN ANY ROW OF THIS TABLE, INCLUDING THESE. That is
     not an omission and it is asserted structurally in
     test/aicredential.test.mjs: the `ai` class is admitted by a SHAPE over this
     table (`aiTaskScope` below), never by being named in it, so adding "ai" to
     a row would grant nothing and removing one would take nothing away. PL-4
     delegated exactly this constraint — op=capturerequestdrain must never gain
     the class — and this is how it is made structurally true rather than
     remembered.

     `probe` IS ABSENT FROM ALL THREE, unlike almost everything around them, and
     the reason is D-199 (3). A probe credential is a MACHINE, and minting is a
     member act; admitting probe here so the surface were exercisable would be
     the `index.mjs:668` hole DEC-52 measured — *"probe is admitted so the
     surface is exercisable"* — arriving at the one act that decides what
     machines may do. The store refuses a machine stamp anyway (C-29.1), so this
     is the second of two fences and neither is load-bearing alone; what it buys
     is that the refusal a probe gets says the true thing.

     THE READ IS WIDER THAN THE WRITES ON PURPOSE. What agents this group has
     running, under whose name, and what they may touch is exactly the sort of
     thing a member should not have to ask an administrator for. It carries no
     value and no hash. */
  aicredentialmint:    { classes: ["admin", "member"],                    mutating: true  },
  aicredentialrevoke:  { classes: ["admin", "member"],                    mutating: true  },
  aicredentials:       { classes: ["admin", "member"],                    mutating: false },
  /* PL-12 / §14: THE FENCE, and it is an op so that it can be POINTED AT. The
     spawn contract for a search sub-session omits the bias manifest BY
     CONSTRUCTION; before this it existed only as a sentence in a design
     document, where no assertion could read it and no negative control could
     break it. A THIRD gated read on the run's context, like its two siblings. */
  airunspawn:         { classes: ["admin", "member", "probe"],      mutating: false },
  /* D-103: the per-host governor's operator surface. governorstate is a read of
     which hosts are held and why (admin and member: a member watching a capture
     stall deserves to see the governor is the reason, not a broken source);
     governorconfig sets a host's appetite and is admin/probe because tuning how
     hard we lean on a counterparty is an operator decision, not a member one,
     the same line memberset and signerset draw. Neither is a capacity FINDING:
     a refusal still teaches capacity through governorReport on the fetch path.
     This only exposes what the DO already tracks; it discovers nothing new. */
  governorstate:  { classes: ["admin", "member", "probe"],           mutating: false },
  governorconfig: { classes: ["admin", "probe"],                     mutating: true  },
  signeradd:    { classes: ["admin", "probe"],                     mutating: true  },
  signerlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  signerset:    { classes: ["admin", "probe"],                     mutating: true  },
  /* The bootstrap trio and the doorbell are the unauthenticated surface.
     Each enforces its own gate: bootstrap reveals nothing but
     claimed/unclaimed, claim requires the bootstrap secret and refuses once
     spent, login requires the password, enroll requires a live one-time
     invite. verify answers only from the published projection, which has
     never seen unratified material, so there is nothing to leak. knock
     lands in a quarantined inbox, size-capped and rate-limited; the worst
     case under attack is a full inbox. */
  bootstrap:  { classes: null,                                   mutating: false },
  claim:      { classes: null,                                   mutating: true  },
  login:      { classes: null,                                   mutating: false },
  enroll:     { classes: null,                                   mutating: true  },
  /* What a burner URL resolves to. Unauthenticated by necessity: the invitee
     holds no credential yet, which is the whole point of an invitation. It
     answers only for a LIVE invitation, and a spent token is indistinguishable
     from one that never existed, so it leaks nothing about who was invited. */
  invitelook: { classes: null,                                   mutating: false },
  verify:     { classes: null,                                   mutating: false },
  knock:      { classes: null,                                   mutating: true  },
};

/* What a signed-in browser session may do, the write arc's evolution of the
   read-only session rule. Intake is browser-writable: it is append-only,
   CAS-protected, history-preserving, and runs through the same promote path
   as everything else. Publishing requires a registered key's signature
   regardless of how the caller authenticated, and purge stays reachable
   only by machine credential. Member sessions get intake and review; admin
   sessions additionally manage the roster and keys. */
/* The retrieval READS belong here as much as `select` does, and their absence
   was a real gap rather than a boundary: a signed-in member could create a
   selection and then neither search to build one nor resolve the one they had
   made, so the browser half of S-10 was unreachable from a session. Found when
   `cite` needed them, 2026-07-25. They read the working corpus, which a member
   session already reads through op=index and op=audit, so this widens no fence:
   `viewer` and `owner` are stamped from the session's own identity below. */
/* PL-9 adds `meaningrows` here rather than to a new list, and that is the point:
   it is a statement shape on op=search's own compiler, so it takes op=search's
   own session reach and op=search's own server-side `viewer` stamp. A second
   list would be one more place for the member and admin sets to drift apart —
   the defect class this file keeps naming. */
const RETRIEVAL_READS = ["search", "searchfields", "searchindexcheck", "selection", "selectionlist",
                         "meaningrows"];
/* CONSTRUCTS Step 3 (FW-5): the reading reads. A member session viewing a
   captured document may read what the plane read out of it and which other
   documents' readings carry the same entity reference. Reads of the working
   corpus, like the retrieval reads above; named as one set so the member and
   admin lists cannot drift apart.
   CORRECTED 2026-08-04 by REC-36, and stated rather than quietly reworded: this
   comment used to say "neither takes a viewer stamp: they key on a capture sha
   and a raw reference, not on the corpus view." That stopped being true when
   REC-30 swept both into REC30_VIEWER_READS — their answers name the bundle a
   capture is filed in — and the sentence survived the sweep. All three are
   stamped, and REC-36's `readingname` is entity-driven besides. */
/* CPDF-10 adds the two transcription-provenance READS to this set rather than
   listing them beside it, for the reason the block above gives: the member and
   admin lists drifting apart is the defect this naming exists to prevent. The
   WRITE (`attesttext`) is deliberately NOT here — it is a member act with its
   own session route, and folding it into a read set would be exactly the
   collapse the fence exists to stop. */
const READING_READS = ["reading", "readingref", "readingname", "textprovenance", "textattest"];
/* The selection-backed actions on a Project's citation edges. Named as a set
   rather than listed twice, because the member and admin session lists drifting
   apart is exactly the class of defect this repository keeps finding. */
/* `linkproject` belongs here rather than beside acquire: it creates EDGES, which
   is what these actions do, and it is a member's contribution even though the
   edge it creates records the SOURCE's assertion rather than the member's. The
   member's act is deciding to admit the observed connection into the graph; the
   edge itself says asserted_by: source. */
const EDGE_ACTIONS = ["cite", "sever", "reinstate", "linkproject"];
/* S-11 step 3. The first selection-backed action to move an OBJECT's state
   rather than an edge's, so it takes the same server-side viewer, owner and
   author stamps the edge actions take: a caller that could name the viewer
   could dispose Problems it cannot see. */
/* REC-13 adds `conclude`. It belongs in THIS array rather than a fourth list
   because it needs exactly what the array confers — both SESSION_OPS lists, the
   server-side viewer stamp and the server-side author stamp — and a second list
   would be one more place for the two session sets to drift apart, which is the
   defect class this file keeps naming. It is not selection-backed, so the
   `owner` stamp below is inert for it (nothing reads it); that costs nothing and
   is cheaper than a list that exists to omit one parameter. */
/* REC-31 adds `reopen` and REC-14 adds `publish`, both for exactly REC-13's
   reason above: each needs what this array confers — both SESSION_OPS lists,
   the server-side viewer stamp and the server-side author stamp — and nothing
   else. Neither is selection-backed (one question is picked back up at a time;
   one case is published at a time), so the `owner` stamp is inert for both.
   `publish`'s author is the member whose name goes on the completeness
   assertion and on the declared position about putting the case to its
   subject, which is the strictest reason in this file for the stamp to be the
   server's. */
/* REC-16 adds `inquirydivide` for exactly the same reason as its three
   predecessors: it needs both SESSION_OPS lists, the server-side viewer stamp
   and the server-side author stamp, and nothing else. Not selection-backed (one
   question is divided at a time), so the `owner` stamp is inert for it. Its
   author is the member whose name goes on the apportionment — WHO decided where
   each leg went, including every leg that cuts against the case — which is the
   same reason publish's stamp must be the server's. */
const STATE_ACTIONS = ["dispose", "retire", "release", "conclude", "reopen", "publish", "inquirydivide"];
/* REC-24: the two ACTION acts, as their own array rather than folded into
   STATE_ACTIONS. They need exactly what that array confers — both SESSION_OPS
   lists, the server-side viewer stamp and the server-side author stamp — and
   op=actionmove would sit there honestly. op=actioncorrespond would NOT: it
   moves no state, and a reader of that array would then be reading a list whose
   name had stopped being true. The `owner` stamp STATE_ACTIONS also sets is
   inert for both (neither is selection-backed), so nothing is lost by naming
   them separately and one thing is kept: the name of each list still says what
   is in it. The author is the member whose name goes on the state_history entry
   and, on the testimony arm of a correspondence entry, on the evidence itself —
   which is the strictest reason in this file for a stamp to be the server's. */
const ACTION_ACTIONS = ["actionmove", "actioncorrespond"];
/* REC-14 / DEC-17: declaring the group's default required strength is a
   session act whose AUTHOR is part of the declaration — "you can lower your own
   bar; you cannot do it quietly" — so it takes the author stamp without being a
   state action on any object. */
const DECLARATION_ACTIONS = ["strengthbar"];
/* REC-45 / DEC-32: AUTHORING THE STRUCTURE of an inquiry's basis. Its own array
   and NOT folded into STATE_ACTIONS, on the same reasoning REC-24 wrote for
   ACTION_ACTIONS and for the same benefit: it moves NO state. An inquiry that
   was `open` before it was grouped is `open` after, and a reader of an array
   called STATE_ACTIONS that contained this op would be reading a list whose
   name had stopped being true. What it needs is what that array CONFERS minus
   one thing — both SESSION_OPS lists, the server-side viewer stamp and the
   server-side author stamp — and `owner` is inert for it anyway (it is not
   selection-backed: one question's structure is authored at a time).

   THE AUTHOR STAMP IS THE STRICTEST INSTANCE IN THIS FILE OF THE RULE IT
   SHARES WITH `publish`, and REC-45 exists partly to say so. Grouping is the
   ONE act in the record that makes a finding STRONGER — OR takes the maximum —
   and what it writes into the document is a NAME and a DATE against the claim
   "these reasons were enough on their own". A caller who could supply that name
   could put somebody else's signature on an overclaim, and a caller who could
   supply the date could make a structure authored AFTER a strength was seen
   look like one authored before it, which is precisely the distinction DEC-32
   requires a reader to be able to draw. So the store DELETES any caller-supplied
   `asserted_by`/`at` on every row before stamping — the op=promote
   `ownerMemberId` discipline — and this stamp is where the name comes from. */
const STRUCTURE_ACTIONS = ["inquiryground"];
/* PL-2 / IS-2 — THE SIXTH STATE MACHINE'S SIX MEMBER OPS, in their own array
   for the reason STRUCTURE_ACTIONS has one: they share a stamp, a capability and
   a class list, and a list written out six times in four places is the drift
   that made DISPOSITIONS one array.

   THE `author` STAMP IS THE FIRST OF THE THREE LAYERS the fence around these
   acts is made of, and it is worth naming all three here because a reader
   meeting one of them will assume it is the whole thing:

     1. HERE — a machine credential is stamped `token:<class>` and a
        caller-supplied `author` is OVERWRITTEN, never honoured. Without this a
        machine could sign a member's name to the decision.
     2. THE ENDPOINT — `NEEDS` requires `contribute`, so a session that does not
        hold it is refused before the store is reached.
     3. THE TRANSITION — the store refuses a machine identity BY SHAPE through
        REC-46's one predicate (MACHINE_CANNOT_MOVE_VERSION).

   Each layer absorbs the others when it is whole, which is exactly why
   VERIFICATION rule 3a requires the control to break EACH ONE with the other two
   HELD OPEN; `test/versionstate.control.mjs` does that and nothing less would
   prove any of the three is doing anything.

   Machine classes REACH all six and are refused by the store rather than being
   absent from the table — conclude's posture, fail closed, so the refusal says
   what is wrong instead of "requires a credential you have". */
const VERSION_ACTIONS = ["versionaccept", "versionreject", "versionconsider",
                         "versionrevert", "versioncurrent", "versionhide"];
const PROJECT_ACTIONS = ["projectinvite", "projectjoin", "projectleave", "projectremove",
                         "projectowneradd", "projectownerremove", "projectfork",
                         "projectownerrescue"];
/* Section 1.3. Both are in the MEMBER set: a member declares their own, and a
   member reaching confirm is refused by the store with ADMIN_ONLY, which says
   what is wrong. Putting confirm in the admin set alone would answer "requires a
   machine credential", which is true of neither the caller nor the rule. */
const EXPERTISE_ACTIONS = ["expertisedeclare", "expertiseconfirm"];
/* CONSTRUCTS Step 4, SLICE A (FW-6): the SUBJECT REGISTRY actions. Members BUILD the
   registry — register a subject, alias it, declare a constitutive relation — and
   READ it by key, by alias, and by relation id. Named as one set, in both the member
   and admin lists, so the two cannot drift apart (the class of defect this repository
   keeps finding). The three WRITES are stamped with the declaring member below, like
   the expertise actions: a declared relation is a member's constitutive statement,
   and who declared it is part of the record. The reads take no viewer stamp: they key
   on an entity id, an alias and a relation id, not on the corpus view.
   REC-65 / DEC-52: "Members BUILD the registry" is now *members AND machine credentials
   build it*. Bob ruled 2026-08-07 that the machine may rule, and nothing here ever refused
   one — the code was the right half and this sentence was the wrong one. A machine's entry
   carries `class:<cls>` where a member's carries their id, so who built what stays legible.
   The reasoning is at the FW-6 stamp site and deliberately not copied here. */
const REGISTRY_ACTIONS = ["entitycreate", "entityalias", "relationdeclare",
                          "entity", "entitybyalias", "relation"];
/* D-98, the TASK construct's two member verbs. Forwarding and resolving a task
   are MEMBER actions performed by a PERSON through their session — the construct
   makes them a human judgement, and the record's whole point is that who
   resolved or forwarded a task is that member's own act. They were reachable
   only by a machine credential, which left the browser half unreachable: the
   `recPost("taskresolve", …)` a signed-in member fires from the Tasks screen was
   answered "requires a machine credential". They belong in BOTH session lists
   for the same reason the edge and state actions do (REC-4). The actor is
   stamped server-side from the session below, so a browser can never sign a
   forward or a resolution as somebody else, and the store's TASK-ACTOR FENCE
   (`#refuseNotYours`, NOT_YOURS) refuses a member who is neither the assignee
   nor an admin — the enforcement UI-1 delegated as cosmetic. */
const TASK_ACTIONS = ["taskforward", "taskresolve"];
/* REC-21: the queue's PERSONAL writes. They are MUTATING, so SESSION_OPS is what
   actually lets a member session reach them, and they are in BOTH lists for the
   same reason every other member surface is: an administrator is a member too.
   Kept as their own array rather than folded into TASK_ACTIONS because they are
   the OTHER doctrine — a task act changes the record for everyone, and these
   change nothing for anyone but the member who made them. Naming them together
   would be the first step toward one control. */
const QUEUE_ACTIONS = ["queuemute", "queuesnooze"];
/* IS-6: the investigative run's three WRITES. Its two reads are not here, for
   the reason stated on QUEUE_ACTIONS above and restated by capability.test.mjs:
   SESSION_OPS gates MUTATING ops alone, so a read appears in it nowhere.
   Named as one array rather than folded into an existing set because a run is
   neither a task act (it changes nothing for anyone else yet) nor a personal
   preference (it spends the group's Claude budget and will propose versions to
   the record). Naming them together would be the first step toward one control
   over two different doctrines — the same reason QUEUE_ACTIONS was kept apart
   from TASK_ACTIONS. */
/* PL-4 joins `capturerequest` and NOT `capturerequestdrain`, and the split is
   the item: the door is a SESSION's act (the run asks, under a member's session
   or a machine credential's class), and the drain is the DAEMON'S — a member
   reaching for it by hand would be a person doing the daemon's job with the
   daemon's conduct rules applied to them. `taskenqueue`/`taskdrain` draw the
   same line one door over, and `taskenqueue` is not in OPS at all for the same
   reason `capturerequestdrain` is not in this list. */
const AI_RUN_ACTIONS = ["airunopen", "airuntick", "airunclose", "suggest", "capturerequest",
                        /* SK-8: the EXTRACT role's production is an ACT OF A RUN
                           (§7.3 (2)), and it is named here for the reason
                           `suggest` and `capturerequest` are — this array says
                           WHAT KIND OF ACT an op is and carries it into the
                           member and admin class sets as one entry rather than
                           two literals. IT IS NOT THE GATE, and that is worth
                           saying because a reader could take it for one: nothing
                           in this array checks that a run exists. The refusal for
                           a production with no live run is the STORE's
                           (`extractPropose`: NO_RUN, NO_SUCH_RUN,
                           RUN_NOT_RUNNING, NOT_AN_EXTRACT_RUN), where the run
                           object is, which is the only place that can see it.
                           The READ is deliberately absent: reading what a run
                           proposed is not a production, and a member reviews
                           proposals without holding a run at all. */
                        "extractpropose"];
/* PL-18 / DEC-63 — THE THREE RUN VERBS, AS THEIR OWN LIST, because Bob's
   ruling is about exactly these three and not about the array above them.
   `AI_RUN_ACTIONS` also carries `suggest` and `capturerequest`, which are acts
   a run performs rather than the act of running, and neither is gated on
   project participation: PL-3 and PL-4 settled their capabilities on their own
   grounds and DEC-63 does not reach them. Writing the three as one named list
   rather than as three literals at the stamp site is the same discipline
   `QUEUE_ACTIONS` and `PROJECT_ACTIONS` keep — a fourth run verb should join
   the gate by being added here, not by somebody remembering. */
const RUN_VERB_ACTIONS = ["airunopen", "airuntick", "airunclose"];
/* PL-12 / D-84: the bias object's ONE write. `op=biasmanifest` and
   `op=biasinhale` are not here for the reason restated on AI_RUN_ACTIONS above —
   SESSION_OPS gates MUTATING ops alone — and `op=biasinhale` in particular is
   non-mutating BY RULING rather than by shape (DEC-54 c: it proposes and never
   installs), so its absence from this array is the third place that fact is
   enforced and not a fourth place it is merely stated.
   ONE-MEMBER ARRAY, ON PURPOSE, and kept apart from every existing set for the
   reason QUEUE_ACTIONS was kept apart from TASK_ACTIONS: adoption is its own
   doctrine — an authored, attributed act that puts a LENS over a group's work —
   and folding it into a neighbouring array would be the first step toward one
   control over two different things. It is in BOTH lists because an
   administrator is a member too, and because the doctrine puts instance bias
   with the admins and project bias with the project managers, who are members. */
const BIAS_ACTIONS = ["biasadopt"];
/* CONSTRUCTS Step 4, SLICE B (FW-7): the RECOGNISER actions. A member RESOLVES a
   captured document's references to registry entities (resolve), TESTIFIES a grade-D
   connection (resolvetestify), and READS the resolutions of a document (resolutions)
   and the reverse index for an entity (concerns). Named as one set in both the member
   and admin lists so the two cannot drift apart. The two WRITES are stamped with the
   resolving member below, like the registry writes: who resolved or testified is part
   of the record. The reads take no viewer stamp — they key on a capture sha and an
   entity id, not on the corpus view. */
const RECOGNISER_ACTIONS = ["resolve", "resolvetestify", "resolutions", "concerns"];
/* CONSTRUCTS Step 5, SLICE A (FW-8): CONNECTIONS AS DATA and the PROGRESSION DEFINITION
   as data. A member DERIVES the connections among the documents concerning an entity
   (connect) and READS them (connections), and AUTHORS a progression definition
   (progressiondefine) and READS one (progression). Named as one set in both the member
   and admin lists so the two cannot drift apart. The two WRITES are stamped with the
   declaring member below, like the registry and recogniser writes: a progression
   definition is a member's claim about how an institution ought to behave (framework
   §8.1), and who derived a connection is part of the record. The reads take no viewer
   stamp — they key on an entity id, a capture sha and a progression key.
   CONSTRUCTS Step 5, SLICE B (FW-9) extends the set: a member THREADS real documents into a
   progression instance (thread — stamped with the threading member below, like the writes
   above) and READS the instance (instance — no viewer stamp, keyed on progression key and
   entity id). Named here so the member and admin lists cannot drift apart.
   CONSTRUCTS Step 5, SLICE C (FW-10) extends it again: a member DISCHARGES a lawful skip by
   recording an exception document (discharge — stamped with the declaring member below) and
   READS the raw discharges (exceptions — no viewer stamp, keyed on progression key + entity id).
   REC-6 extends it once more with a READ: `proposals` is the DISCOVERY feed — a read-time walk of
   every progression instance for its missing-predecessor findings, D-79-aggregated. Ungated like
   the other progression reads (no viewer stamp, keys on nothing — it enumerates the whole record's
   derived questions), named here so the member and admin lists cannot drift apart.
   REC-7 adds a WRITE: `proposedispose` records a member's DEFER/DISMISS of a derived proposal
   (stamped with the deciding member below, like the other progression writes) — WITHOUT minting a
   bundle (D-79: declining is not authoring). op=proposals then ages the disposed proposal out of
   the open feed. Named here so the member and admin lists cannot drift apart.
   REC-9 adds a READ: `captureprogressions` is the per-document lookup — it maps a CAPTURE back to the
   progression instances it is threaded into, its stage in each, and each instance's missing-predecessor
   + overdue-successor findings (the same ONE derivation op=proposals reads, keyed by capture). Ungated
   like the other progression reads, named here so the two lists cannot drift apart.
   REC-65 / DEC-52 CORRECTS THE ACTOR IN EVERY SENTENCE ABOVE, and it is one correction rather
   than five: where this block says a MEMBER authors a progression definition, threads an instance
   or discharges a skip, read *a member OR a machine credential*. Bob ruled 2026-08-07 that the
   machine may rule; nothing here ever refused one, and DEC-52 settles that the CODE was right and
   this prose was wrong. Who acted is recorded either way — `class:<cls>` for a machine, never a
   person's name — so the two remain distinguishable claims. The full reasoning, and the four
   things the ruling carries with it, are at the FW-6 stamp site in the request path; it is not
   restated here, because a ruling copied into two files is a ruling that will disagree with
   itself. `proposedispose` is the EXCEPTION and is NOT covered — see its own site. */
const PROGRESSION_ACTIONS = ["connect", "connections", "progressiondefine", "progression",
                             "thread", "instance", "discharge", "exceptions", "proposals",
                             "proposedispose", "captureprogressions"];
const SESSION_OPS = {
  member: new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   /* CASE-5b: signing the CASE DOCUMENT, beside signing a finding.
                      A session op for `ratify`'s own reason — the attestation carries
                      a member's name for as long as the record lasts. */
                   "caseratify",
                   /* CPDF-10: attesting that a transcription matches the image is a
                      MEMBER act — a person's testimony, carrying their name for as
                      long as the record lasts. It is a session op before it is
                      anything else, on `aicredentialmint`'s reasoning below: the
                      only route that produces a name the store will accept is a
                      session, and the store refuses every other shape (C-35.10). */
                   "attesttext",
                   /* SK-7 / framework Part II §14.4: MARKING A PASSAGE AS CITABLE is
                      a session op TOO, and the reason is the ruling's own list rather
                      than symmetry with the line above. §14.4: *"where an edge points
                      at a whole document, the assistant, A MEMBER, or another means
                      tries to find the specific passages"* — so a member doing by hand
                      what the assistant does on its own is the SAME act by a different
                      actor, and the record distinguishes them by who is stamped on the
                      row rather than by which of them is allowed to perform it. It is
                      NOT the act that changes a leg's target (REC-86's NARROW) and it
                      is not TRANSCRIBE (REC-87); it mints an address and writes no
                      edge. Unlike `attesttext` above, the machine route is open too —
                      that asymmetry IS this item. */
                   "contentmint",
                   /* SK-8: the READ half of the EXTRACT role. `extractpropose` is
                      NOT named here because it arrives through `AI_RUN_ACTIONS`
                      below, as an act of a run; this one is not an act of a run
                      and a member reviews proposals without holding one, so it
                      is named beside `contentmint`, whose act it reads back. */
                   "extractproposals",
                   /* REC-86: NARROW and its candidate read — a member's act on a
                      reading of a question, reached by a signed-in member. */
                   "narrow", "narrowcandidates",
                   /* REC-87: TRANSCRIBE and the attestation of a typing — a person's
                      word in their own name, `attesttext`'s route and reason. */
                   "transcribe", "transcriptionattest",
                   /* MK-1: TESTIFY — a member's own word, `transcribe`'s route. */
                   "testify",
                   /* MK-4: THE LEAD and a look recorded against it — a person's word
                      in their own name, `transcribe`'s route and reason. */
                   "lead", "leadlook", "leadshare",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease", "governorstate",
                   ...RETRIEVAL_READS, ...READING_READS, ...REGISTRY_ACTIONS, ...RECOGNISER_ACTIONS,
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...ACTION_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS, ...AI_RUN_ACTIONS,
                   ...BIAS_ACTIONS,
                   ...DECLARATION_ACTIONS, ...STRUCTURE_ACTIONS, ...VERSION_ACTIONS,
                   /* PL-11 / IS-5 / D-199 (3): MINTING AN AI TOKEN IS A MEMBER ACT,
                      and a MEMBER is a signed-in person — not the MEMBER_TOKEN
                      machine credential, which stamps `token:member` and is a
                      machine by REC-46's predicate exactly as REC-45 measured. So
                      these are session ops before they are anything else: the only
                      route that produces a name the store will accept is a session,
                      and the store refuses everything else BY SHAPE (C-29.1). */
                   "aicredentialmint", "aicredentialrevoke",
                   /* REC-126 / DEC-31: THE REVIEW COPY's three authoring acts. A
                      session op before anything else, on `aicredentialmint`'s
                      reasoning: each is attributed to the person who performed it,
                      and the store refuses every machine shape by name. */
                   "casedraft", "reviewgrant", "reviewrevoke"]),
  admin:  new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "caseratify",
                   "attesttext",
                   "contentmint",
                   /* SK-8: the READ half of the EXTRACT role. `extractpropose` is
                      NOT named here because it arrives through `AI_RUN_ACTIONS`
                      below, as an act of a run; this one is not an act of a run
                      and a member reviews proposals without holding one, so it
                      is named beside `contentmint`, whose act it reads back. */
                   "extractproposals",
                   "narrow", "narrowcandidates",
                   "transcribe", "transcriptionattest",
                   "testify",
                   "lead", "leadlook", "leadshare",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease",
                   ...RETRIEVAL_READS, ...READING_READS, ...REGISTRY_ACTIONS, ...RECOGNISER_ACTIONS,
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...ACTION_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS, ...AI_RUN_ACTIONS,
                   ...BIAS_ACTIONS,
                   ...DECLARATION_ACTIONS, ...STRUCTURE_ACTIONS, ...VERSION_ACTIONS, "memberadd", "memberset",
                   "signeradd", "signerset", "governorstate", "governorconfig",
                   "aicredentialmint", "aicredentialrevoke",
                   "casedraft", "reviewgrant", "reviewrevoke"]),
};

/* ---- capabilities at the op layer. Membership Architecture v2 section 5 ----
 *
 * Capabilities gate a SESSION and nothing else. A token class has no member
 * behind it and therefore holds no capabilities: a machine credential is bounded
 * by OPS above and by scopeFor below, and asking a capability question about one
 * would mean inventing a member who does not exist.
 *
 * Section 5 says a capability a member does not hold is ABSENT from their
 * interface rather than present and refused. BOTH halves ship. setup.mjs builds
 * its controls from op=whoami so the control is not there, and this table
 * refuses the op anyway, because a hidden button is a courtesy and not a
 * boundary.
 *
 * STRUCTURAL, not a hand list. Every mutating op a SESSION can reach appears
 * here, including the ones that need no capability, written as an explicit null
 * with the reason. test/capability.test.mjs reads SESSION_OPS and this table out
 * of the source and fails on any session-reachable mutating op that is missing,
 * AND on anything named here that no session can reach, so the table cannot rot
 * in either direction. Standing lesson 2: a later addition must not pass by not
 * being mentioned.
 */
const NEEDS = {
  /* contribute: create and revise bundles in the working corpus (5). */
  promote:          "contribute",
  lease:            "contribute",
  allocid:          "contribute",
  capture:          "contribute",   // the PUT; its GET is a read and is exempted at the check
  linkproject:      "contribute",
  acquire:          "contribute",
  attest:           "contribute",
  /* CPDF-10: NO FIFTH CAPABILITY TOKEN, on REC-13's reasoning below exactly.
     Attesting that a transcription matches the image is a corpus write and
     rides `contribute` like every other one. The thing that makes it different
     from its siblings is not a permission — it is that a MACHINE cannot perform
     it, and that is enforced where machine-ness is decided (the store's
     `checkAttestation`, C-35.10), never by inventing a capability a group would
     have to be told about. */
  attesttext:       "contribute",
  /* SK-7: NO FIFTH CAPABILITY TOKEN, on `attesttext`'s reasoning immediately
     above. Marking a passage as citable puts a row in the corpus and rides
     `contribute` like every other corpus write — and a VIEW-ONLY member must
     not, because a row minted here is a durable address the record then carries
     with an author's name on it. What is special about this act is not a
     permission either: it is that a machine credential MAY perform it (§14.4's
     EXTRACT role) where it may never perform the one above, and that asymmetry
     lives in the OPS class cut and in C-35.10, not in a capability a group
     would have to be told about. */
  contentmint:      "contribute",
  /* SK-8: the same capability as the act they perform, for the reason written
     against `contentmint` above — a proposal is CONTRIBUTING and it is never
     publishing. Nothing either op writes is the group putting its name on
     anything: an uncited machine-minted row is a PROPOSAL (§7.3 (6)), and the
     act that makes one part of a finding is a member's citation. */
  extractpropose:   "contribute",
  extractproposals: "contribute",
  /* REC-86: NO FIFTH CAPABILITY TOKEN. Narrowing a citation writes a new reading
     into the working corpus and rides `contribute` like `cite`, the act that
     wrote the citation in the first place; the candidate read rides it too, on
     `extractproposals`' reasoning one line up. Nothing either writes is the
     group putting its name on anything — the new reading is born `suggested`. */
  narrow:           "contribute",
  narrowcandidates: "contribute",
  /* REC-87: NO FIFTH CAPABILITY TOKEN. Typing a portion's text writes a content
     row and its text into the working corpus, and attesting a typing is
     `attesttext`'s act on different text — both ride `contribute`, as
     `attesttext` does. Nothing either writes is the group putting its name on
     anything. The READ takes none, on `op=content`'s reasoning: resolving what a
     citation points at, including what a member typed, is reading the record. */
  transcribe:          "contribute",
  transcriptionattest: "contribute",
  transcription:       null,
  /* MK-1: an observation is written into the working corpus as an INFO bundle —
     `contribute`, as capturing a document is. Nothing it writes is the group
     putting its name on anything; attribution in a published case is MK-3's. */
  testify:             "contribute",
  /* MK-4: NO FIFTH CAPABILITY TOKEN, on `transcribe`'s reasoning. A lead and a
     look against it are writes into the record in a member's name and ride
     `contribute`; a VIEW-ONLY member must not, because either leaves a row
     carrying their name for as long as the record lasts. The read takes none. */
  lead:                "contribute",
  leadlook:            "contribute",
  leadshare:           "contribute",
  leadread:            null,
  monitor:          "contribute",
  cite:             "contribute",
  sever:            "contribute",
  reinstate:        "contribute",
  dispose:          "contribute",
  retire:           "contribute",
  /* Release authority is the member's decision (Intake Doctrine 4); the
     SURFACE it rides is contribute, like its state-action siblings, and the
     named-member requirement is enforced by the store on the author stamp,
     not by a capability, because capabilities gate sessions and the rule here
     is about who a session IS. */
  release:          "contribute",
  /* REC-13: concluding rides `contribute` like every other corpus write, and
     NO FIFTH CAPABILITY TOKEN IS MINTED. CAPABILITIES.md §4 is explicit that a
     fifth would break the pattern and would need §5 reopened, and the strength
     of a claim is not a permission question — a group does not hold a
     "conclude" right distinct from the right to write the record. DEC-30 fixes
     the rest: no owner gate and no ballot, so any contribute holder may
     conclude and the act is attributed in the state_history and the Session
     Log. The named-member requirement is enforced by the store on the author
     stamp, exactly as release's is, because capabilities gate SESSIONS and the
     rule here is about who a session IS. */
  conclude:         "contribute",
  /* REC-31: reopening rides `contribute` like every other corpus write, and
     mints no capability of its own. Disagreeing with a disposition is not a
     separate right a group grants — CAPABILITIES.md §4 is explicit that a
     fifth token would need §5 reopened — and DEC-30 fixes the rest: no owner
     gate, no ballot, the act attributed in the state_history and the Session
     Log. The named-member requirement is enforced by the store on the author
     stamp, as release's and conclude's are, because capabilities gate SESSIONS
     and the rule here is about who a session IS. */
  reopen:           "contribute",
  /* REC-16 / DEC-30, and this one is SETTLED rather than provisional: division
     is AUTHOR-SCOPED — any `contribute` holder, with the act attributed — and
     no fifth capability token is minted. The reasoning is Bob's and it is
     decisive: division is how a member escapes an overclaiming mix, so
     owner-only would let an owner hold another member's name against an
     overclaim that member can see, and DE-ESCALATION MUST NEVER REQUIRE
     PERMISSION FROM SOMEONE WHOSE INCENTIVE MAY RUN THE OTHER WAY. What bounds
     misuse is not a gate but R4's disclosure: nothing leaves the record, the
     sibling exists, and a published child must name it. The named-member
     requirement is enforced by the store on the author stamp, as release's,
     conclude's and reopen's are, because capabilities gate SESSIONS and the
     rule here is about who a session IS. */
  inquirydivide:    "contribute",
  /* REC-45: GROUPING RIDES `contribute` and NO NEW CAPABILITY TOKEN IS MINTED,
     which the item states and which the reasoning above already settles.
     Membership §5's four rights are the whole set and a fifth would need §5
     reopened; there is nothing here a fifth would express that `contribute`
     does not, because authoring the structure of a basis is a corpus write on a
     question and a view-only member does not perform one.

     THE ARGUMENT FOR A NARROWER GATE IS REAL AND IS REJECTED, and it is worth
     stating because this act raises a grade. One could argue that the act which
     makes a finding STRONGER deserves `publish`'s right, or an owner's. It
     would be the wrong mechanism twice over. First, `publish` gates the
     PUBLICATION, which is where a stronger grade actually reaches a reader, and
     it is untouched: a member may group their reasons all day and nothing
     leaves the record until somebody with `publish` authors a case. Second — and
     this is DEC-30's argument arriving from the other side — grouping is also
     the only route BACK to an ungrouped basis, so an owner-only gate would let
     an owner hold a structure in place that another member can see is an
     overclaim, and DE-ESCALATION MUST NEVER REQUIRE PERMISSION FROM SOMEONE
     WHOSE INCENTIVE MAY RUN THE OTHER WAY. What bounds misuse here is not a
     gate: it is the NAME on every group, the legs staying visible under it, and
     the frozen per-group breakdown a reader checks (DEC-32's three
     containments). The named-member requirement is enforced by the store on the
     author stamp, as release's, conclude's, reopen's and inquirydivide's are,
     because capabilities gate SESSIONS and the rule here is about who a session
     IS. */
  inquiryground:    "contribute",
  /* PL-2 / IS-2: the six version acts ride `contribute` like every other corpus
     write and mint NO fifth capability token. CAPABILITIES.md §4 is explicit
     that a fifth would break the pattern and would need §5 reopened, and what a
     group's record stands on is not a permission question — a group does not
     hold a "settle a reading" right distinct from the right to write the record.
     The NAMED-MEMBER requirement is enforced by the store on the author stamp,
     exactly as release's, conclude's and inquiryground's are, because
     capabilities gate SESSIONS and the rule here is about who a session IS.
     THIS IS FENCE LAYER 2 (see VERSION_ACTIONS above). A member session without
     `contribute` is refused here and never reaches the store — which is exactly
     why the negative control has to break this row with the other two layers
     standing, or the transition refusal absorbs it and proves nothing. */
  versionaccept:    "contribute",
  versionreject:    "contribute",
  versionconsider:  "contribute",
  versionrevert:    "contribute",
  versioncurrent:   "contribute",
  versionhide:      "contribute",
  /* REC-24: BOTH ACTION OPS RIDE `contribute`, and NO NEW CAPABILITY TOKEN is
     minted — the item says so and the reasoning is the one every act above
     already runs on. Membership §5's four rights are the whole set; a fifth
     would need §5 reopened, and there is nothing here a fifth would express
     that `contribute` does not: moving an action and recording what came back
     are corpus writes, and a view-only member does neither.
     It is tempting to argue the OUTWARD reach deserves its own right — an
     action touches people outside the system. It would be the wrong mechanism:
     what bounds that reach is the RISK TIER on the object and the counterparty
     that must be named or honestly undetermined (REC-23), both of which are
     properties of the act being composed. A capability is a property of the
     SESSION and could not see either. The named-member requirement is enforced
     by the store on the author stamp, as release's, conclude's and reopen's
     are, because capabilities gate sessions and this rule is about who a
     session IS. */
  actionmove:       "contribute",
  actioncorrespond: "contribute",
  /* FW-6 / D-83: building the SUBJECT REGISTRY reshapes what the working corpus's
     statements MEAN — registering a subject, aliasing it, and declaring a
     constitutive relation between subjects (mechanical bias-statement equivalence
     extends exactly as far as the registry declares it, safeguard 4). That is a
     corpus-shaping act, the same surface as the state and edge actions, so it takes
     `contribute`: a view-only member does not reshape subject equivalences. The
     declaring member is stamped server-side, so who fixed a relation is in the
     record; the reads (entity/entitybyalias/relation) are ungated, like the other
     working-corpus reads. */
  entitycreate:     "contribute",
  entityalias:      "contribute",
  relationdeclare:  "contribute",
  /* FW-7: RESOLVING a reference to an entity, and TESTIFYING a grade-D connection,
     both write into the record what documents concern which subjects — a corpus-shaping
     act on the same surface as building the registry, so `contribute`: a view-only
     member does not resolve references or testify. The resolving member is stamped
     server-side. The reads (resolutions/concerns) are ungated, like the registry and
     working-corpus reads. */
  resolve:          "contribute",
  resolvetestify:   "contribute",
  /* FW-8: deriving a CONNECTION between two documents that concern one subject, and
     authoring a PROGRESSION DEFINITION, both write into the record how the corpus's
     documents relate and how the group expects its institutions to behave — a corpus-
     shaping act on the same surface as building the registry and resolving references, so
     `contribute`: a view-only member does not derive connections or define progressions.
     The declaring member is stamped server-side. The reads (connections/progression) are
     ungated, like the registry, recogniser and working-corpus reads. */
  connect:          "contribute",
  progressiondefine:"contribute",
  /* FW-9: threading REAL documents into a progression instance places evidence into the
     record's account of how a happening unfolded — a corpus-shaping act on the same surface
     as deriving connections and defining progressions, so `contribute`: a view-only member
     does not thread instances. The threading member is stamped server-side. The read
     (instance) is ungated, like connections/progression. */
  thread:           "contribute",
  /* FW-10: recording an exception document that DISCHARGES a lawful skip is likewise a
     corpus-shaping act — it changes what the record claims about a missing stage (a gap becomes
     a lawful recorded skip) — so `contribute`, stamped with the declaring member below. The read
     (exceptions) is ungated, like the other progression reads. */
  discharge:        "contribute",
  /* REC-7: deferring or dismissing a derived proposal ages the record's own question — it changes
     what the working corpus SURFACES as open (an aged finding stops appearing) — so it rides the
     same `contribute` surface as the other progression writes: a view-only member does not age the
     record's questions. It mints NO bundle (D-79: declining is not authoring); the deciding member
     is stamped server-side. op=proposals (the read) is ungated, like the other progression reads. */
  proposedispose:   "contribute",
  /* Dispositioning a knock decides what enters the working corpus, which is the
     contribute surface even though the row it writes is an inbox row. Reading
     the inbox is not gated; acting on it is. */
  inboxresolve:     "contribute",
  /* publish: ratify. The capability governs the SURFACE and the registered
     signing key governs the authority (5). Both exist because before this the
     key was doing the capability's job: a member with no publish reached
     op=ratify and was stopped only by not having a key. */
  ratify:           "publish",
  /* CASE-5b: ratifying the CASE DOCUMENT is the same surface as ratifying a
     finding — it is the act that commits what the group is publishing, one
     altitude up. A member who may not publish may not sign a case either. */
  caseratify:       "publish",
  /* REC-14: authoring a case carries the SAME capability as ratifying one, and
     deliberately not `contribute`. Concluding says what the record shows;
     publishing puts the group's name on it and states, in the group's voice,
     what it does not cover and whether it was put to its subject. That is the
     publication surface, and a member who may not publish may not author it
     either. No fifth capability token is minted (CAPABILITIES.md section 4). */
  publish:          "publish",
  /* REC-126 / DEC-31: the review copy's three authoring acts ride the SAME surface
     as publish, because they are the act that stands beside it — a member who may
     not publish may not hand the group's draft to a named outsider either. No
     fifth capability token is minted. */
  casedraft:        "publish",
  reviewgrant:      "publish",
  reviewrevoke:     "publish",
  /* DEC-17: the group's declared bar is about what publishing REQUIRES, so it
     rides the publication surface too. Lowering your own bar is legitimate and
     is an authored, dated, on-the-record act; what it may not be is quiet. */
  strengthbar:      "publish",
  /* create_projects is deliberately absent, because no op creates a project. A
     project is created by promoting a bundle with no base whose object_type is
     `project`, so the check lives at that SHAPE, once, in the promote branch. */

  /* No capability, and the reason, so a later reader does not read the absence
     as an oversight. A selection is a server-side snapshot of what the caller
     themselves selected; it writes nothing about the corpus, and a member with
     view rights only still needs to build one in order to read (7.5). */
  select:           null,
  selectionrelease: null,
  /* The roster ops are governed by `administer`, which is not a working
     capability and moves only by the Section 4 process. What bounds them is
     SESSION_OPS.admin above, not section 5. */
  /* Participation is governed by section 7, not section 5, and the store
     enforces it: only an owner invites and removes (7.2, 7.7 as REVERSED in v2),
     and `by` is stamped server-side so the store judges the real caller. */
  projectinvite:    null,
  projectjoin:      null,
  projectleave:     null,
  projectremove:    null,
  projectowneradd:  null,
  projectownerremove: null,
  projectownerrescue: null,
  /* The one participation op that DOES carry a capability, because a fork
     creates a project. Without this any participant creates projects they were
     not trusted to create, which is create_projects defeated by a button. */
  projectfork:      "create_projects",
  /* No capability. Declaring what you hold is not a corpus write, and
     confirming one is an administrator act governed by the class ACL. Neither
     is section 5's business, and declared expertise gates nothing in the other
     direction either. */
  expertisedeclare: null,
  expertiseconfirm: null,
  memberadd:        null,
  memberset:        null,
  signeradd:        null,
  signerset:        null,
  /* PL-11 / IS-5 / D-199: NO WORKING CAPABILITY, and NO FIFTH CAPABILITY TOKEN
     IS MINTED — CAPABILITIES.md §4's rule, which every act since REC-13 has
     followed. Creating or withdrawing an agent credential is instance-level
     governance in `memberadd`/`signeradd`'s family, bounded by the class ACL
     and by SESSION_OPS, not by section 5's four working rights. It would be
     tempting to hang it on `contribute` because the credential can go on to
     write; that would be the wrong mechanism for the reason `release` records
     one line of reasoning over — a capability is a property of the SESSION, and
     what bounds this act is who a session IS. */
  aicredentialmint:   null,
  aicredentialrevoke: null,
  /* D-103: setting a host's appetite is an operator act bounded by
     SESSION_OPS.admin, the same as the roster ops above, not a section-5
     working capability. governorstate is a read and needs no entry at all. */
  governorconfig:   null,
  /* REC-4 / D-98: forwarding or resolving a task carries NO working capability.
     The authorization is not "may this member contribute" but "is this THIS
     member's task" — an identity question the store's TASK-ACTOR FENCE answers
     (`taskResolve`/`taskForward` refuse a non-assignee, non-admin with NOT_YOURS,
     naming who it is with). Exactly the reasoning `release` records: the rule is
     about who a session IS, not a capability, so a view-only member holds these
     as much as a contributor does — an obligation is settled by whoever it was
     addressed to. */
  taskforward:      null,
  taskresolve:      null,
  /* REC-20: reading your own queue carries NO working capability, for the same
     reason taskforward/taskresolve carry none — the question is not "may this
     member contribute" but "what has this record put in front of THIS member",
     and a view-only member holds it exactly as a contributor does. It is
     non-mutating, so SESSION_OPS does not gate it either. The entry exists
     rather than being absent so REC-19's totality guard can see it: an op in
     NEEDS is either a published act or a NAMED non-act, and op=queue is named
     in NON_ACTS with its reason. */
  queue:            null,
  /* REC-34: reading the derived pair carries NO working capability, on op=queue's
     reasoning exactly — the question is not "may this member contribute" but "what
     does this question rest on", and a view-only member holds it precisely as a
     contributor does; weighing a case is what viewing IS. It is non-mutating, so
     SESSION_OPS does not gate it either, and what bounds it is the D-15 viewer
     stamp rather than section 5. The entry exists rather than being absent so
     REC-19's totality guard can SEE it: an op in NEEDS is either a published act
     or a NAMED non-act, and op=inquirystrength is named in NON_ACTS with its
     reason. (op=reevaluations' precedent — no entry at all — is the other legal
     shape for a read; this one is taken because the op is a SURFACE a member acts
     from, and a read that is silently absent from both registries is exactly how
     REC-25's six ungated reads accumulated.) */
  inquirystrength:  null,
  /* REC-18: NO CAPABILITY, on op=inquirystrength's reasoning exactly. Asking
     what the record already earned for a document is reading the record, not
     shaping it — the WRITE that puts the earned grade on a leg is op=promote,
     which carries `contribute` and is where the capability belongs. A view-only
     member weighing a case needs to see what its legs rest on precisely as a
     contributor does. Present rather than absent so REC-19's totality guard
     sees it; named in NON_ACTS with its reason. */
  earnedbasis:      null,
  /* REC-83: NO CAPABILITY, on op=earnedbasis' reasoning exactly. Resolving what
     a citation POINTS AT is reading the record; the acts that create or change
     the thing resolved carry their own gates (op=promote's projection mints it,
     op=attesttext attests it, REC-86's NARROW re-points a leg). A view-only
     member weighing a case needs to see what a leg actually cites precisely as
     a contributor does — and a fence here would mean a member could be shown a
     citation and never be told what part of the document it names. Present
     rather than absent so REC-19's totality guard SEES it, and named in
     NON_ACTS with its reason. */
  content:          null,
  /* REC-36: NO CAPABILITY, on op=earnedbasis' reasoning exactly. Asking which
     documents NAME a subject is reading the record; the write that acts on the
     answer is op=resolve, which carries its own gate and is where the capability
     belongs. A view-only member weighing a case needs to see what mentions their
     subject precisely as a contributor does. Present rather than absent so
     REC-19's totality guard SEES it — a read silently absent from both registries
     is how REC-25's six ungated reads accumulated — and named in NON_ACTS with
     its reason. (Its two siblings op=reading/op=readingref take the other legal
     shape, no entry at all; this op takes op=queue's because it is a SURFACE a
     member acts from: the candidate list a resolve is chosen out of.) */
  readingname:      null,
  /* REC-21 / D-125: NO CAPABILITY, and the reason IS the doctrine rather than a
     convenience. `contribute` is the corpus-shaping surface — it is what
     separates a member who may change what the record says from one who may only
     read it. A mute changes nothing the record says: it is one member deciding
     what they are told about their own attention, and requiring `contribute` for
     it would classify a personal preference as a corpus act, which is the exact
     collapse this item exists to prevent. It would also mean a view-only member
     could be notified and could never manage it — an attention surface they can
     receive and cannot answer. The `select` precedent is the same shape: a
     server-side snapshot of the caller's own state, writing nothing about the
     corpus, and needed by a view-only member in order to read at all.
     What DOES bound these is SESSION_OPS above (they are mutating, so a machine
     credential cannot reach them through a session route) and the store's own
     NO_MEMBER refusal — an identity question, like the task fence, not a
     capability one. */
  queuemute:        null,
  queuesnooze:      null,
  /* IS-6. Opening an investigative run rides the CONTRIBUTE surface, and the
     reasoning is the one op=proposedispose records two entries up rather than a
     new one: a run shapes what the working corpus surfaces as open — it will
     propose versions of an inquiry's basis and it spends the group's Claude
     budget against their account. A view-only member does not start work the
     group pays for and the record then carries. It is deliberately NOT
     `publish`: a run proposes and nothing it does is the group putting its name
     on anything (§1's suggesting / authoring / committing, kept apart).

     `airuntick` and `airunclose` carry the SAME capability rather than none.
     The alternative — gate the open and leave the tick free — would mean a
     credential that may not start a run may still spend its budget and close
     it, which is the fence in the wrong place. The two READS are ungated by
     capability and gated by VIEWER, like every other read here.

     ***** PL-18 / DEC-63, 2026-08-09: THESE THREE VALUES ARE NOW A FLOOR AND
     NO LONGER THE GATE, AND THE FLOOR IS THE SMALLER HALF. *****
     IS-6 shipped `contribute` as a PROVISIONAL and asked Bob which capability a
     run costs. He answered that it is not a capability question at all:
     *"AN INVESTIGATION CAN BE STARTED BY ANY MEMBER OF A PROJECT… the gate is
     PROJECT MEMBERSHIP, not a capability tier — participation in the project
     the inquiry belongs to is what licenses asking the system to look, and the
     spend rides on membership the group already governs."*
     So `contribute` STAYS HERE — unchanged, still enforced, and refusing in its
     own words with `needs` on the answer — while the real gate is participation
     in the project the run's context belongs to, checked in the store where the
     citation graph and the participation rows are, and refused with its own
     C-22.8 code and canned translation.
     **THE TWO REFUSALS ARE DELIBERATELY NOT ONE.** *You are not in this
     project* and *you lack contribute* are different facts about an account
     with different remedies — an owner of that project invites you, or an
     administrator grants a capability — and a single refusal covering both
     would tell a member nothing they can act on.
     The order is: this capability floor first (here, at the control plane),
     then participation (in the store). A member who fails both is told about
     the capability, because that is the refusal that fires first; neither
     answer is ever both. */
  airunopen:        "contribute",
  airuntick:        "contribute",
  airunclose:       "contribute",
  /* PL-3 / IS-4. A suggestion is `contribute` and deliberately NOT `publish`:
     §1's three verbs are kept apart, and proposing a reading of the evidence is
     suggesting. Nothing this op writes is the group putting its name on
     anything — the version is born `suggested`, and every act that would make
     it the record's stance is a member act this credential cannot reach. */
  suggest:          "contribute",
  /* PL-4 / IS-4. Requesting a capture is `contribute` and deliberately NOT
     `publish`: it adds a document to the STORE and adds nothing to any case.
     Bob, 2026-08-05 — *"the capture is an entry of a document to the cache
     (store), but not an entry of the document into the leg of a claim"* — so a
     run that captures four hundred documents has changed the store and changed
     no conclusion. It is not NULL either, the way a personal mute is: this act
     sends traffic to somebody else's server with the group's name on it, which
     is corpus-shaping work and not a preference about one's own attention. */
  capturerequest:   "contribute",
  /* PL-12 / D-84. Adopting a bias set is `contribute` and deliberately NOT
     `publish`: it is the group declaring the lens it works under, which is
     ordinary record work that every contributing member's own project managers
     do — and DEC-20 settles that declaring a bias never gates anything, so
     nothing downstream of this is a publication act. A view-only member does not
     put a lens over other people's work; the capability is what says so.
     `biasinhale` carries NONE, like every other read in this file, and it is a
     read precisely because it writes nothing. */
  biasadopt:        "contribute",
};

/* REC-19's act decoration, hoisted to module scope by REC-20 so op=affordances
   and op=queue share ONE function rather than one function and a copy of it.
   The store derives WHICH acts exist (deriveActs over its own facts); this adds
   the metadata that lives only here — the capability NEEDS gates the call with,
   how the op is reached, and the DECLARED ladder rung. A queue item's options[] and
   an op=affordances answer for the same subject are therefore identical by
   construction and not by agreement, which is the property the item's suite
   asserts byte-for-byte. */
/* REC-16 / DEC-29(b) adds `prompt`: the wording a surface MUST show when it
   offers this act, null wherever no ruling attaches one. It is published rather
   than left to the client for DEC-8's reason — a surface renders what it
   received — and it is on the act rather than in a separate table so a surface
   that has the control necessarily has the sentence that must accompany it. */
/* REC-38: `weight ?? null`, and the null is STATED rather than the key being
   dropped — this file's own rule for `rung` one line down, applied to the one
   other declared field. Every entry in ACTS carries a weight, so nothing about
   the act catalogue changes; CAPTURE_ACTS entries carry none, because a capture
   act is not selection-backed and there is no set-application weight to report.
   Omitting the key would let a surface read `undefined` and guess; publishing
   null says the record has no such number for this act. */
const decorateAct = (a) => ({
  id: a.id, label: a.label, weight: a.weight ?? null,
  needs: NEEDS[a.id] ?? null,
  mode: SESSION_OPS.member.has(a.id) ? "session"
      : SESSION_OPS.admin.has(a.id) ? "admin-session" : "machine",
  rung: RUNGS[a.id] ?? null,
  /* FW-14. `rung: null` NOW MEANS SOMETHING IT DID NOT MEAN BEFORE, and this key
     is what makes the difference legible to a surface. Until this item a null
     rung meant "nobody has classified this"; every mutating op is now either
     rung-bearing or NAMED IN `RUNG_ABSENT` with the ground on which it has none,
     asserted total in both directions. So a null rung beside a stated ground is
     a CLASSIFIED ABSENCE — undetermined stated, which CLAUDE.md makes
     first-class — and a null rung beside a null ground is the shape that can no
     longer reach a caller, because the suite refuses to let such an op exist.
     Published rather than left implicit for DEC-8's reason: a surface must be
     able to render "this act has no rung, because <ground>" without computing
     the sentence itself. */
  rung_absence: RUNG_ABSENT[a.id]?.ground ?? null,
  prompt: a.prompt ?? null,
});

const KNOCK = {

  windowMs: 10 * 60 * 1000,
  perIp: 12,          // knocks per source per window
  global: 300,        // knocks per instance per window; bounds hostile R2 writes
  maxBytes: 8 * 1024 * 1024,   // with R2: enough for a captured PDF
  maxInline: 64 * 1024,        // without R2: inline into the DO, small only
};

const SCRATCH = "scratch";
/* REC-22: the ONE namespace the public read path answers from. An instance has
   one published record, so op=publishedcase and op=publishedbytes are pinned
   here exactly as op=verify and op=publishedmanifest are — and a probe's
   `scratch` rehearsal, which lives in a different Durable Object under a
   different PUBLISHED prefix, is therefore unreachable from the public surface. */
const PUBLISHED_STORE = "bio";

async function fingerprint(v) {
  if (!v) return null;
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].slice(0, 8).map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* Full 64-hex SHA-256 of a string or a byte view. This is what docprofile's
   `digests()` calls to name each normalised variant (CONSTRUCTS Step 2 / FW-4);
   it hashes the SAME raw bytes for `identity`, which is why identity must equal
   the capture sha and is asserted to. */
async function sha256Hex(v) {
  const b = await crypto.subtle.digest("SHA-256", typeof v === "string" ? new TextEncoder().encode(v) : v);
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* REC-33 / DEC-37. THE FOURTH CLASS, and what it is a class OF.
 *
 * Bob, 2026-08-04: "Sounds like we need a daemon token" — and the NAME is the
 * ruling, not decoration. The entry that raised this proposed `MONITOR_TOKEN`;
 * it was renamed because this credential drives TWO verbs, op=monitor and the
 * archive arm of op=acquire, and naming it for one of its consumers would have
 * invited the next unattended consumer either to mis-scope itself under a
 * monitor name or to mint a FIFTH class. THE CLASS IS THE UNATTENDED PATH, NOT
 * THE MONITOR. A later unattended consumer belongs here.
 *
 * WHY IT EXISTS AT ALL. Every monitor tick and every archive fallback on every
 * installed instance authenticated as ADMIN_TOKEN — the root of trust §8.1
 * builds every membership rule on — to do two narrow things. That credential is
 * bound into an instance's configuration and sits there unattended
 * indefinitely: the place a credential lives longest and travels furthest.
 * Today a leak there is total instance compromise; scoped, it is a monitoring
 * nuisance.
 *
 * WIDEN BY DECISION, NOT BY DRIFT. It is admitted to EXACTLY the two verbs it
 * needs today (OPS.monitor, and op=acquire's archive arm only — the direct arm
 * refuses it below), and the totality of that reach is asserted structurally
 * over this table in test/daemon-token.test.mjs, so an op that admits `daemon`
 * later fails that suite until somebody answers for it.
 *
 * ADMIN_TOKEN REMAINS THE FALLBACK in Store's `#monitorToken()`, so an instance
 * installed before this class existed keeps monitoring rather than arming an
 * alarm that 401s forever — DIST-1's constraint, and the reason the plane
 * learns the class BEFORE any installer binds it.
 *
 * Ordered after admin deliberately: if an operator ever set both bindings to
 * the same value, the caller gets the WIDER class it already holds rather than
 * a silent, surprising narrowing. */
async function classify(token, env) {
  if (!token) return null;
  if (token === env.ADMIN_TOKEN && (await liveToken(env.ADMIN_TOKEN))) return "admin";
  if (token === env.MEMBER_TOKEN && (await liveToken(env.MEMBER_TOKEN))) return "member";
  if (token === env.PROBE_TOKEN && (await liveToken(env.PROBE_TOKEN))) return "probe";
  if (token === env.DAEMON_TOKEN && (await liveToken(env.DAEMON_TOKEN))) return "daemon";
  return null;
}

/* A probe-class token may mutate, but only inside the scratch namespace. This
   is what lets an automated caller exercise the real write path, including the
   CAS, against the real deployment, without any ability to touch live state. */
/* A probe-class caller is confined to the scratch namespace. Confinement is by
   REFUSAL, not by silent redirection: a caller that believes it addressed the
   live store must be told it did not, rather than quietly succeeding somewhere
   else. Defaulting with no store parameter is scratch. */
/* REC-33: THE DAEMON CLASS IS DELIBERATELY NOT CONFINED HERE, and the absence
   is the decision rather than an omission. Confining it to scratch is precisely
   what makes PROBE_TOKEN the wrong credential for this job: monitoring writes
   the REAL record's reachability and the archive fallback files the REAL
   record's bytes, and a rehearsal of that in a different Durable Object records
   nothing anyone will ever read. So the daemon class falls through to the
   default and addresses `bio` like an operator does. What bounds it is the op
   table — two verbs — and not the namespace. */
function scopeFor(cls, url) {
  const asked = url.searchParams.get("store");
  if (cls === "probe") return asked && asked !== SCRATCH ? { error: `probe class is confined to the ${SCRATCH} namespace, refused request for ${JSON.stringify(asked)}` } : { name: SCRATCH };
  return { name: asked === SCRATCH ? SCRATCH : "bio" };
}

/* =====================================================================
 * PL-11 / IS-5 / D-199 — THE FIFTH CLASS, AND THE FIRST ONE THAT IS NOT A
 * BINDING.
 *
 * WHY `classify()` ABOVE SAYS NOTHING ABOUT IT. The four classes it resolves
 * are ENV BINDINGS: an operator sets a value in the hosting dashboard and the
 * plane compares. D-199 (2) rules that out for this class, transplanting
 * DEC-17's reasoning verbatim — a settings row *"would be a way to change the
 * standard with nothing to read afterwards"*, and what an AI credential may
 * reach is exactly the thing that must be amendable only as an authored, dated,
 * on-the-record act. So an `ai` credential resolves against a ROW that names
 * the member who minted it and the day they did, and the resolution happens in
 * the fetch handler below, one step after `classify()` returns nothing, in the
 * same place and for the same reason a signed-in session resolves there.
 *
 * A DELIBERATE CONSEQUENCE, STATED SO NOBODY LATER READS IT AS AN OVERSIGHT:
 * this class costs a Durable Object round trip on every call, which the four
 * binding classes do not. A cached copy in the Worker would buy the round trip
 * back and would also be a second answer to "what may this credential do",
 * ageing separately from the row a member just amended. REC-46 is an entire
 * item spent removing three unsynchronised answers to a smaller question.
 *
 * D-199 (1) — ONE CLASS CARRYING A DECLARED TASK SCOPE, NOT A CLASS PER TASK.
 * The plane already had the two-dimensional answer and DEC-55 names it: class
 * plus scope, with the scope enforced at the gate BY REFUSING, which is what
 * `scopeFor` does to the probe class one function up. `aiTaskScope` is that
 * shape reused — same return shape, same enforcement point, same refusal
 * posture — and it gives per-function confinement at the cost of one class.
 *
 * THE SCOPE NAME IS FREE TEXT AND THE WRITES ARE THE ENFORCEABLE HALF. A closed
 * vocabulary of scope NAMES was considered and refused: it would grow one entry
 * per task and become D-199 (1)'s class-per-task arriving through a different
 * door, while buying nothing — what confines a credential is the op set, and a
 * name nobody enforces is a label. So `task_scope` records what the authoring
 * member called this piece of work, and `scope_writes` is what the gate reads.
 * ===================================================================== */

/* The presented shape. Deliberately NOT the 64-hex a session token uses: the
   handler must be able to tell "this is an agent credential that did not
   resolve" from "this is a session token that did not resolve", because those
   are different answers and only one of them is worth a member's attention. */
const AI_TOKEN_SHAPE = /^aik-[0-9a-f]{64}$/;

/* THE FLOOR, AND IT IS THE WHOLE FENCE: an `ai` credential may be admitted only
 * where a MEMBER class is admitted. ONE property of the OPS table, read live.
 *
 * THIS IS PL-4'S DELEGATED CONSTRAINT DISCHARGED — *the fence is a SHAPE, not a
 * class list.* op=capturerequestdrain carries no member class BY CONSTRUCTION,
 * because PL-4 ruled that a member reaching for the daemon's verb by hand would
 * be a person doing the daemon's job with the daemon's conduct rules applied to
 * them. It therefore falls outside every scope anybody can author, today and
 * after the next unattended op lands, and NOBODY HAD TO REMEMBER IT.
 *
 * IT HOLDS FROM THE OTHER SIDE TOO. No row of the OPS table names `ai` — that
 * is asserted structurally in test/aicredential.test.mjs — so adding the class
 * to a row would admit nothing, and this function is the only door. Two
 * independent proofs, both driven, because a fence with one proof is a fence
 * with one place to go wrong.
 *
 * `classes: null` ops (the unauthenticated surface) answer FALSE here rather
 * than throwing, and that is the fail-closed direction: they enforce their own
 * gates and an agent credential has no business inside a bootstrap claim. */
function aiReachesAsMember(spec) {
  return !!spec && Array.isArray(spec.classes) && spec.classes.includes("member");
}

/* THE DECLARATION, judged once when a member AUTHORS it. Separate from the gate
 * below on purpose: this asks whether a sentence may be written into the record
 * at all, and the gate asks whether a call is within a sentence already there.
 * PL-4 measured what happens when one predicate sits at two points — one of the
 * two codes becomes unreachable and can never be driven — so these are
 * different questions with different codes and both are driven.
 *
 * IT IS ITS OWN NAMED FUNCTION rather than an inline block in the handler, and
 * that is REC-71's rule paid at allocation time: a DEC-49 `where` resolves a
 * span BY FUNCTION NAME, and PL-4 shipped one pointing at `acquire`, a name that
 * does not exist because the op lives inside the fetch handler — so nothing was
 * checking that site at all. */
function aiScopeDeclaration(writes) {
  const refusal = (code, detail, extra) => {
    const row = AI_CREDENTIAL_CHECKS[code];
    return { error: { reason: code, code, check: row.check, translation: row.translation,
                      detail, ...(extra || {}) } };
  };
  const asked = Array.isArray(writes) ? writes.map((w) => String(w ?? "").trim()).filter(Boolean) : [];

  /* DEC-49 REGION is-ai-scope-declaration
   *
   * THE SPAN `AI_SCOPE_UNKNOWN_OP` and `AI_SCOPE_BEYOND_MEMBER_REACH` name
   * (REC-71). A REGION and not the whole function, so the normalisation either
   * side of it is not conscripted into this family. Helper `refusal`, and every
   * code a STRING LITERAL at its site so arm C of the DEC-49 guard can COMPARE
   * it rather than read past a variable. */
  for (const op of asked) {
    if (!Object.prototype.hasOwnProperty.call(OPS, op))
      return refusal("AI_SCOPE_UNKNOWN_OP",
        `'${op.slice(0, 60)}' is not an operation this instance performs. A scope naming something `
        + `nothing recognises would sit in the record looking like a permission and meaning nothing, `
        + `which is exactly what declaring the scope on the record rather than in a settings row is `
        + `for (D-199 (2)).`, { op });
    if (!aiReachesAsMember(OPS[op]))
      return refusal("AI_SCOPE_BEYOND_MEMBER_REACH",
        `'${op.slice(0, 60)}' is not reachable by a member of this group, so it cannot be handed to `
        + `an agent. This is a property of the operation and not a list of forbidden ones: the `
        + `unattended worker's own verbs carry no member class by construction, so they are outside `
        + `every scope anybody can author.`,
        { op, classes: Array.isArray(OPS[op].classes) ? OPS[op].classes : null });
  }
  /* END DEC-49 REGION is-ai-scope-declaration */

  return { writes: [...new Set(asked)].sort() };
}

/* THE GATE. `scopeFor`'s shape, one class over: `{ error }` or the admission.
 *
 * READS ARE THE FLOOR AND WRITES ARE THE DECLARATION. An `ai` credential reaches
 * every NON-MUTATING op a member reaches — that is IS-5's "reads across the
 * project", and what bounds WHAT it sees is not this function but the STATED
 * VIEWER stamped from the record's principal, so a member-scoped credential
 * sees exactly what that member sees and an organisation-scoped one sees what
 * any instance-level credential sees. A MUTATING op additionally has to be named
 * in the writes the record declares.
 *
 * THE FLOOR IS RE-EVALUATED HERE ON EVERY CALL even though the mint already
 * applied it, and that is not the duplicated-predicate mistake PL-4 measured: it
 * answers with the GATE's code, not the mint's, because a row can outlive the
 * rule that admitted it. An op that loses its member class tomorrow leaves every
 * credential naming it refused today, with nobody having to find the rows.
 *
 * THERE IS NO OP NAME IN THIS FUNCTION. Not one literal, and the suite asserts
 * it over this function's own source — the fence is a shape, and a shape with an
 * exception list in it is a list. */
function aiTaskScope(cred, op, spec) {
  const refusal = (code, detail, extra) => {
    const row = AI_CREDENTIAL_CHECKS[code];
    return { error: { reason: code, code, check: row.check, translation: row.translation,
                      detail, ...(extra || {}) } };
  };

  /* DEC-49 REGION is-ai-task-scope
   *
   * THE SPAN `AI_BEYOND_TASK_SCOPE` and `AI_CREDENTIAL_REVOKED` name (REC-71):
   * a REGION, so the admission returned below is not read as a refusal site.
   * Helper `refusal`, codes as STRING LITERALS. */
  if (cred.revoked)
    return refusal("AI_CREDENTIAL_REVOKED",
      `credential '${String(cred.tokenId).slice(0, 60)}' was withdrawn on ${cred.revokedAt} by `
      + `${cred.revokedBy}. The entry and the date are kept rather than deleted, so what it did while `
      + `it was live stays readable.`,
      { tokenId: cred.tokenId, revokedAt: cred.revokedAt });

  if (!aiReachesAsMember(spec))
    return refusal("AI_BEYOND_TASK_SCOPE",
      `no member of this group reaches '${String(op).slice(0, 60)}', so no declared scope reaches it `
      + `either. An agent is confined to what a member could do themselves, which is a property of the `
      + `operation rather than a list kept anywhere.`,
      { op, tokenId: cred.tokenId, taskScope: cred.taskScope, declared: cred.writes });

  if (spec.mutating && !cred.writes.includes(op))
    return refusal("AI_BEYOND_TASK_SCOPE",
      `credential '${String(cred.tokenId).slice(0, 60)}' declares the task scope '${cred.taskScope}', `
      + `whose writes are ${cred.writes.length ? cred.writes.join(", ") : "(none)"}. Widening it is an `
      + `authored, dated act by a member on the record (D-199 (2)/(3)), not something the agent holding `
      + `it can ask for.`,
      { op, tokenId: cred.tokenId, taskScope: cred.taskScope, declared: cred.writes });
  /* END DEC-49 REGION is-ai-task-scope */

  return { ok: true, viewer: cred.principal };
}

/* REC-130 / IC-141 — WHO IS ASKING, FOR AN OP THAT ANSWERS ANYBODY BUT ANSWERS
 * WORKING MATERIAL ONLY TO SOME. `op=casedocument` stays UNGATED because a
 * RATIFIED case document is what a stranger verifies, and an unsigned one answers
 * only to standing in its owning project. So the op cannot demand a credential and
 * cannot ignore one: this resolves the caller the way the gated path does and
 * returns the VIEWER STRING the store's D-15 predicate reads — or "" for nobody.
 *
 * IT NEVER REFUSES. An absent, unknown, expired or out-of-scope credential is
 * resolved to "" and the caller is answered as a stranger, because a refusal
 * here would be a second shape of answer, and the whole property is that a
 * caller without standing cannot tell an unsigned case from no case. The ONLY
 * non-answer is a store silence during the lookup, which is a fact about the
 * instance and is the same whatever case was named.
 *
 * "OUTSIDE SCOPE" FOR A MACHINE CREDENTIAL, decided rather than left open: a
 * binding class stands only if the OPS table admits it to the working-corpus
 * listing (`index`, whose own comment is why a title is working material) AND
 * `scopeFor` addresses it to the store this op reads. So `daemon` (two verbs)
 * and `probe` (confined to scratch) are outside it and read as strangers; the
 * `admin` and `member` bindings are instance-level and read as they read every
 * other piece of working material. An `ai` credential stands as its declared
 * principal, through the same `aiTaskScope` the gated path runs. */
/* REC-132 / D-422 / IC-149 — THIS IS NOW THE ONE RESOLVER OF A SESSION FOR EVERY
 * SESSION-STAMPED READ, and the history below is kept because it is the argument.
 * Membership Architecture v2 §7, *"THE FOUNDER IS AN ADMINISTRATOR HERE TOO"* (BOB
 * #15, 2026-09-18). `resolveSession(sess)` returns TWO things, kept apart:
 *
 *   viewer    WHAT THE SESSION MAY SEE — the D-15 viewer every visibility gate
 *             compiles. The FOUNDER's is the bare `admin`, `viewerPredicate`'s
 *             root-administrator spelling, so it sees every project and every
 *             participant list (§7.3, §7.8); every other session is `member:<id>`,
 *             exactly as before.
 *   identity  WHO THE SESSION IS — `member:<id>`, the founder's being
 *             `member:admin` — for authorship, ownership, votes and D-310's
 *             positional facts. It is stamped beside the viewer as `identity`, and a
 *             store site that asks WHO reads it and never the viewer.
 *   member    the folded id (`admin` for the founder), the string every author, by,
 *             actor and looker stamp in this file has always carried.
 *
 * THE WIDENING STOPS WHERE A RULING NAMES SOMEONE NARROWER THAN AN ADMINISTRATOR.
 * A LEAD is readable by its author and by participants it was shared to, never by
 * administrators (MEMBER-KNOWLEDGE-DESIGN.md §5), so the store's lead predicate
 * (`#leadReach`) asks the identity: the founder sees its own leads by position and
 * nobody else's. REC-132's IC-149 carries the per-site table of which arm governs.
 *
 * THE FOUNDER IS TOLD APART BY THE SESSION'S ROLE, never by the folded name, and the
 * id `admin` is now RESERVED (`memberAdd`, C-55.1), so the two cannot collide going
 * forward; an instance that already holds such a member is REPORTED by op=audit.
 *
 * REC-128 x REC-130 — THE ONE PLACE A SIGNED-IN SESSION BECOMES THE VIEWER AN
 * UNSIGNED CASE DOCUMENT ANSWERS TO. Both readers of one — `op=casedocument`
 * (through `caseReader` below) and `op=caseratify`'s facts read — call THIS,
 * so the two cannot disagree about who a session is.
 *
 * THE DEFECT IT CLOSES, measured on CONDUCT #5's merge of REC-128 onto REC-130:
 * both sites spelled the viewer as `member:` plus the FOLDED session role, and
 * the FOUNDER's session role is the bare `admin` (Store.ROOT_ADMIN), so the
 * founder read as `member:admin` — a member NAMED admin with no participation
 * and no members row — and was answered NO_CASE_DOCUMENT. That refused the
 * founder a case ratification BOB #14 ruled ALLOWED (D-421 as corrected: a
 * HUMAN's own authenticated session, a member's or the founder's), and hid every
 * unsigned case document from the instance's root administrator.
 *
 * THE RULING APPLIED, no new doctrine. IC-141 gives standing to a participant in
 * the owning project, an ACTIVE ADMINISTRATOR (Membership Architecture 7.3), or
 * an instance-level credential; 7.3 says administrators see ALL projects; 4.1
 * makes the solo founder THE administrator, and 4.6 puts the ADMIN_TOKEN holder
 * above every membership rule. The store already counts the founder as an active
 * administrator by that name (`#activeAdmins`, `#isAdminMember`). So the
 * founder has standing, as an administrator, in every project.
 *
 * WHY THE BARE `admin` VIEWER AND NOT `member:admin` OR `class:admin`.
 * `viewerPredicate` compiles bare `admin` UNFILTERED — its root-administrator
 * spelling — which is the founder's standing exactly. `member:admin` cannot
 * carry it: the predicate's administrator arm reads a `members` row the founder
 * never has, and in `store=scratch` (where acts are addressed while sessions
 * live in `bio`) nothing was ever claimed either, so no store-side check could
 * find the founder. `class:admin` would stamp a MACHINE class on a human's
 * session — the inner URL lying about who is asking, which REC-29 closed. And
 * the founder is told apart by the session ROLE, never by the folded name: a
 * member ENROLLED with the id `admin` has role `member:admin` and stays an
 * ordinary member here.
 *
 * SCOPE, AS IT WAS (IC-147) AND AS IT IS (IC-149). IC-147 made this the viewer
 * for the two case-document reads only, and said why the rest waited: several
 * other session-stamped reads also ask POSITIONAL questions of the same id
 * (D-310), which a bare `admin` viewer cannot answer. REC-132 closed D-422 by
 * giving the resolver the SECOND half those questions need (`identity`), and every
 * session-stamped read in this file now takes its viewer from here. */
function resolveSession(sess) {
  const r = sess && typeof sess.role === "string" ? sess.role : "";
  const member = r.startsWith("member:") ? r.slice(7) : r;
  return {
    viewer: r === "admin" ? "admin" : `member:${member}`,   /* the founder — Store.ROOT_ADMIN, an administrator (7.3) */
    identity: `member:${member}`,
    member,
  };
}

async function caseReader(url, env, storeName) {
  const t = url.searchParams.get("token");
  if (!t) return { viewer: "" };
  const cls = await classify(t, env);
  if (cls) {
    const scope = scopeFor(cls, url);
    const inScope = OPS.index.classes.includes(cls) && !scope.error && scope.name === storeName;
    return { viewer: inScope ? `${MACHINE_CLASS_PREFIX}${cls}` : "" };
  }
  const st = env.STORE.get(env.STORE.idFromName("bio"));
  if (AI_TOKEN_SHAPE.test(t)) {
    const aOut = await doAnswer(st.fetch(`http://do/aicredentiallook?sha=${await sha256Hex(t)}`));
    if (!aOut.answered) return { silent: "aicredentiallook" };
    const cred = aOut.result?.found ? aOut.result.credential : null;
    const scoped = cred ? aiTaskScope(cred, "index", OPS.index) : null;
    return { viewer: scoped && !scoped.error ? scoped.viewer : "" };
  }
  if (/^[0-9a-f]{64}$/.test(t)) {
    const sOut = await doAnswer(st.fetch(`http://do/session?t=${t}`));
    if (!sOut.answered) return { silent: "session" };
    const sess = sOut.result?.session;
    if (!sess) return { viewer: "" };
    return { viewer: resolveSession(sess).viewer };
  }
  return { viewer: "" };
}

const json = (o, status = 200) =>
  new Response(JSON.stringify(dec49Attach(o), null, 1), {
    status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

/* =========================================================================
 * D-262 — THE CATALOGUE ROW, ATTACHED ON THE WAY OUT. ONE PLACE.
 *
 * WHAT WAS WRONG, MEASURED RATHER THAN SUSPECTED. Twelve `MACHINE_CANNOT_*`
 * fences fire; twelve carry a catalogued C-number and a canned translation
 * (REC-64 wrote eleven of them); **exactly ONE put either on the wire.** That
 * one — `MACHINE_CANNOT_MOVE_VERSION` — is the only site in the family that
 * refuses through a helper that reads the catalogue row. The other eleven build
 * `{ ok: false, reason: "MACHINE_CANNOT_…", detail: … }` by hand, and a hand
 * cannot carry a row it does not read. So a member's agent met the string
 * `MACHINE_CANNOT_RELEASE` and nothing else, which is the exact failure DEC-49
 * exists to prevent, surviving inside the mechanism built to prevent it.
 *
 * WHY A DECORATION AND NOT ELEVEN EDITS — decided by measurement, and the
 * measurement is the reversal cost as much as the write cost. Eleven site edits
 * are eleven places to be right and eleven places to be wrong, and they close
 * ELEVEN sites out of a plane that mints hundreds of refusals in eight
 * separately-written `refuse` closures; the twelfth site proves the per-site fix
 * does not generalise, because it was written and the other eleven still were
 * not. This file already rules on the shape: `doAnswer`'s own header says *"the
 * fix is a CHOKEPOINT, not twenty-four remembered checks, because a rule that
 * must be remembered at every site is a rule that will be forgotten at the
 * twenty-fifth."* `json()` is that chokepoint on the way OUT — **MEASURED
 * 2026-08-09: 118 of this file's 125 response returns go through `json()`, and
 * the other 7 are `new Response(...)` returning a 204, a version string, two
 * HTML pages and three byte bodies — not one of them a refusal carrier.** It
 * covers the generic store forward AND the 36 `doAnswer` handlers that never
 * reach that forward. Eleven site edits would have closed the generic forward's
 * eleven and left every one of the 36 exactly as it was.
 *
 * WHAT IT COSTS TO REVERSE: delete this block and the one call above. Nothing
 * else in the plane depends on it, because nothing in the plane READS these
 * three fields — they exist for the caller. That is the asymmetry that decided
 * it: the decoration's blast radius is one function, and eleven site edits'
 * blast radius is eleven member-facing methods.
 *
 * WHAT IT DELIBERATELY DOES NOT DO, and each is a fence rather than an omission:
 *
 *   - **IT NEVER OVERWRITES.** A field already present is left exactly as the
 *     site wrote it. So a site that says something DIFFERENT from the catalogue
 *     is not silently corrected into agreement — `test/refusal-wire.test.mjs`
 *     compares what the caller RECEIVED against the row and fails on a
 *     divergence. A decoration that overwrote would make that check unable to
 *     fail, which is the "equality that costs nothing" this project refuses.
 *   - **IT NEVER INVENTS.** A code with no catalogue row is left bare and is
 *     reported by the instrument as census. Untranslated codes are REC-64's
 *     remaining sweep; making one up here would hide that work rather than do
 *     it.
 *   - **IT ADDS NO CODE OF ITS OWN**, so it mints nothing DEC-49 must catalogue
 *     and it moves no floor in the guard.
 *   - **IT DOES NOT MAKE A SITE'S CODE INVISIBLE.** Every code stays a STRING
 *     LITERAL at its site; arm C of the DEC-49 guard still COMPARES it. This
 *     decoration is downstream of the guard's whole subject and replaces none
 *     of it.
 *
 * REACH, STATED PLAINLY BECAUSE IT IS NOT TOTAL: this covers what leaves through
 * `json()`. The eight `new Response(...)` returns in this file (bytes, HTML, the
 * setup and signing pages) do not pass through it and are not refusal carriers;
 * a future one that IS would be outside this and is exactly what the
 * instrument's op sweep would find.
 * ========================================================================= */

/* Built ONCE, LAZILY, and never at module load — a Worker pays module
   initialisation on every cold start, and this is only needed by a response that
   actually refuses. Families are found by the `_CHECKS` suffix (a RESERVED
   SUFFIX in this repository: the DEC-49 guard harvests every one of them as a
   refusal family), so this is a PROPERTY and not a list. */
let DEC49_ROWS = null;
function dec49Row(code) {
  if (DEC49_ROWS === null) {
    DEC49_ROWS = new Map();
    /* Sorted so a duplicated code — which the guard's arm A already refuses —
       resolves the same way on every isolate rather than by module order. */
    for (const family of Object.keys(CHECK_CATALOGUE).sort()) {
      if (!/_CHECKS$/.test(family)) continue;
      const rows = CHECK_CATALOGUE[family];
      if (!rows || typeof rows !== "object") continue;
      for (const [key, row] of Object.entries(rows)) {
        if (!row || typeof row !== "object") continue;
        if (typeof row.translation !== "string" || row.translation === "") continue;
        if (!DEC49_ROWS.has(key))
          DEC49_ROWS.set(key, { check: row.check ?? null, translation: row.translation });
      }
    }
  }
  return DEC49_ROWS.get(code) ?? null;
}

/* A REFUSAL is `ok: false` carrying a code — and `ok: false` is required rather
   than inferred from the presence of a `reason`, because an ANSWER may carry a
   `reason` field for something that is not a refusal at all, and decorating one
   of those would put a member-facing sentence on a success. A refusal shape that
   does NOT say `ok: false` is therefore out of reach here, and the instrument
   prints it rather than quietly covering for it. */
function dec49Decorate(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) return;
  if (r.ok !== false) return;
  const code = typeof r.reason === "string" ? r.reason
             : typeof r.code === "string" ? r.code : null;
  if (!code) return;
  const row = dec49Row(code);
  if (!row) return;
  if (r.code === undefined) r.code = code;
  if (r.check === undefined) r.check = row.check;
  if (r.translation === undefined) r.translation = row.translation;
}

/* TWO LEVELS AND NO MORE. The control plane answers a refusal in exactly two
   shapes: its own, at the top level, and the store's, forwarded UNDER `result`
   by the generic tail (the Durable Object's envelope is `{ok:true, result:…}`
   even when the method inside it refused, which is precisely why `result.ok`
   has to be looked at). A general deep walk would reach into arrays of rows and
   sub-objects that are DATA rather than refusals — `residue` entries, per-part
   verdicts, a run's steps — and put a member-facing sentence on something no
   member is being refused. Bounded on purpose. */
function dec49Attach(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return o;
  dec49Decorate(o);
  if (o.result && typeof o.result === "object") dec49Decorate(o.result);
  return o;
}

/* ===============================================================   REC-52: A FAILURE TO ANSWER IS NOT AN ANSWER, AND THE PLANE MUST NOT
   CONVERT ITS OWN INTO A CLAIM ABOUT THE RECORD.
   ===============================================================
   THE DEFECT THIS CLOSES, stated once so the next reader does not have to
   reconstruct it. The Durable Object answers in exactly one envelope:

       { ok: true,  result: <whatever the method returned> }        // it answered
       { ok: false, error: <stack> }                       500      // it threw
       { ok: false, error: "unknown op: <op>" }            400      // no such method
       { ok: false, reason: "BAD_JSON", detail: … }        400      // unreadable body

   Twenty-four handlers in this file used to read `.result` off that envelope
   WITHOUT LOOKING AT `ok`, and JavaScript makes both failure modes silent:

     - `json({ ok: true, ...out.result })` spreads `undefined`, which is a
       no-op, so what leaves the control plane is `{ok:true}` at HTTP 200 —
       a SUCCESSFUL envelope carrying nothing. Section 7a (`op=verify`) was
       the measured instance, and UI-37 could not fix its own defect by making
       the transport throw on `ok:false` BECAUSE THERE WAS NO `ok:false` TO
       THROW ON; the motivating case sailed straight past.

     - `(c || { reason: "NOT_PUBLISHED" })` and `if (!v || !v.published)
       return notFound()` turn an absent answer into a SUBSTANTIVE NEGATIVE:
       the plane telling a stranger that the record does not hold that part,
       when in fact the plane failed to ask. This is the defect this project
       ranks worst — the record asserting something it does not know — and it
       sits at the layer BENEATH every surface, where no surface can correct
       it. A surface that faithfully renders what it received will faithfully
       render a lie.

   THE FIX IS A CHOKEPOINT, not twenty-four remembered checks, because a rule
   that must be remembered at every site is a rule that will be forgotten at
   the twenty-fifth. `doAnswer` is the ONLY place in this file that opens a
   Durable Object envelope, and `test/plane-envelope.test.mjs` asserts that
   structurally over the source rather than by convention.

   `answered` is `ok === true` AND NOTHING ELSE. It is deliberately NOT
   "result is present and non-empty": a store method may legitimately answer
   `null`, `[]` or `{}`, and treating a real empty answer as a non-answer
   would be this same collapse running in the opposite direction — which is
   one character away and is asserted against in its own arm.

   WHAT THE CALLER IS TOLD, and why it says so little. `storeSilent` reports
   the state of the EXCHANGE and makes no statement about the record at all,
   because there is none to make. It does NOT echo the Durable Object's
   `error`: that field is a raw stack trace (`String(e && e.stack || e)`),
   and every op below that can reach this refusal — verify, publishedcase,
   publishedbytes, publishedmanifest, bootstrap — is reachable with NO
   credential of any kind. An anonymous stack trace is a disclosure, and a
   diagnostic a stranger cannot act on is not worth one. */
const STORE_SILENT_REASON = "STORE_DID_NOT_ANSWER";
const STORE_SILENT_DETAIL =
  "this instance could not consult its own record, so nothing here is a statement about the record. "
  + "It is NOT a claim that what you asked for is absent, unpublished, unknown or refused — those are "
  + "answers, and this is the absence of one. The question stands unanswered; ask again.";

/* Takes the Response (or a promise of one) from a Durable Object stub fetch and
   returns `{ answered, result }`. A body that is not JSON at all is not an
   answer either, which is why the parse is guarded rather than allowed to throw
   into whatever catch happens to be nearest. */
async function doAnswer(res) {
  let out = null;
  try { out = await (await res).json(); } catch { out = null; }
  return (out && out.ok === true)
    ? { answered: true, result: out.result }
    : { answered: false, result: undefined };
}

/* PL-4 / IS-4 — THE CAPTURE-REQUEST ARM OF op=acquire, AND THE ITEM'S SPINE.
 * THE AI DOES NOT CAPTURE. IT REQUESTS, AND THE DAEMON CAPTURES.
 *
 * IT IS ITS OWN NAMED FUNCTION rather than an inline block inside the handler,
 * and that is a REC-71 consequence rather than a style choice: a DEC-49 `where`
 * names a span, arm C resolves that span by FUNCTION NAME, and there is no
 * function called `acquire` — the op lives inside the fetch handler. A region
 * marker inside an unnamed span is a `where` the guard cannot resolve, which
 * means nothing would be checking this site for a codeless refusal. Measured by
 * the guard on this item's first run, and fixed here rather than by widening the
 * `where` to something the guard could find.
 *
 * WHAT IT RETURNS: the address, purpose and agent read FROM THE ROW, or a
 * refusal, or the silence flag. A silence is distinguished from a refusal
 * (REC-52) — both fail closed, but only one of them is the fence holding. */
async function captureRequestArm(env, storeName, body, cls) {
  const stCr = env.STORE.get(env.STORE.idFromName(storeName));
  const dAns = await doAnswer(stCr.fetch(
    `http://x/capturerequestdraining?request=${encodeURIComponent(String(body?.request || ""))}`));
  /* REC-52, AND IT SITS OUTSIDE THE GOVERNED REGION DELIBERATELY — the DEC-49
     guard put it there. A silence is NOT a refusal: it is the plane failing to
     ask, and it owes an operator's diagnosis rather than a member's canned
     translation. Read raw it would answer `undefined`, fail the test below and
     refuse, which READS as the fence holding when in fact nothing was checked.
     Failing closed is still right and is what happens; what this adds is that
     the silence is DISTINGUISHABLE from a real refusal. The guard failed this
     item once for returning it inside the region as a codeless refusal, which is
     the guard drawing exactly the line it exists to draw. */
  if (!dAns.answered) return { ok: false, silent: true };
  const d = dAns.result;
  /* DEC-49 REGION is-capture-request-arm
   *
   * THE SPAN `CAPTURE_NOT_DRAINING`'s `where` names (REC-71). A region and not
   * the whole function, so a refusal that arrives here later is not conscripted
   * into this family. The code is a STRING LITERAL at its site so arm C can
   * COMPARE it rather than read past a variable.
   *
   * THE GATE IS A SHAPE, NOT A CLASS LIST. `draining` is set by the drain inside
   * the tick that then fetches, so the window in which this plane will fetch for
   * a request is exactly the window in which the drain is doing it. A member, a
   * probe, an operator, the daemon's own credential outside a tick, or a future
   * `ai` credential holding a real request id are all refused identically — and
   * PL-11 need not edit this line for it to hold on the day `token:ai` exists. */
  if (!d || d.draining !== true) {
    const row = CAPTURE_REQUEST_CHECKS.CAPTURE_NOT_DRAINING;
    return { ok: false, silent: false, refusal: {
      ok: false, reason: "CAPTURE_NOT_DRAINING", code: "CAPTURE_NOT_DRAINING",
      check: row.check, translation: row.translation, cls,
      request: body?.request ?? null, state: d ? d.state : null,
      detail: "this instance fetches a requested document only from inside its own drain, and no "
            + "such request is being drained right now. The AI does not capture: it REQUESTS, and "
            + "the daemon captures with provenance preserved (DEC-47's structural gate, DEC-60). "
            + "Write a request and let the drain make it." } };
  }
  /* END DEC-49 REGION is-capture-request-arm */
  return { ok: true, silent: false, locator: d.address, purpose: d.purpose,
           agent: d.ua_mode === "member-browser" ? d.agent : null };
}

/* 502 rather than 500: the control plane is intact and reachable — what failed
   is the store BEHIND it, which is precisely the distinction this refusal
   exists to draw. `op` is named so an operator reading a log knows which read
   went silent without the answer implying anything about what it was reading. */
const storeSilent = (op) =>
  json({ ok: false, reason: STORE_SILENT_REASON, op, detail: STORE_SILENT_DETAIL }, 502);

/* THE ADMISSION GATE'S DEC-49 FIELDS, read from the ONE row (REC-79 / C-38).
 *
 * Spread into the refusal beside a `reason` that is a STRING LITERAL at its
 * site, which is DEC-49's rule and is what lets arm C of the guard COMPARE the
 * code rather than read past a variable.
 *
 * IT THROWS RATHER THAN RETURNING A PARTIAL ROW, and that is the whole reason it
 * is a function. DEC-49 exists because a refusal once shipped
 * `translation: undefined` to a member — a machine word where a sentence was
 * promised — and it shipped that way because the code was in a variable and the
 * lookup silently missed. A throw here is a 500 in a test, which is loud; a
 * missing sentence is silent and reaches a person. `admission-gate.test.mjs`
 * drives this branch. */
/* CAP-8's row reader, `admissionRow`'s shape one family over. Same discipline and
   the same reason: the code is a STRING LITERAL at its site so the DEC-49 guard's
   arm C can COMPARE it rather than read past a variable, and the SENTENCE lives
   once, in the catalogue, rather than being written at six call sites. A code with
   no sentence behind it throws here rather than reaching a member. */
const driveRow = (code) => {
  const row = DRIVE_CAPTURE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`driveRow: ${code} has no DRIVE_CAPTURE_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* CPDF-19 / C-51: the re-extraction family's row reader, `driveRow`'s shape. */
const reextractRow = (code) => {
  const row = REEXTRACT_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`reextractRow: ${code} has no REEXTRACT_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* REC-123: the C-32 row for a machine fence that lives in THIS file (op=ratify,
   op=caseratify). Same shape and same refusal-to-invent as `reextractRow`. */
/* MK-1 (A): the publication fence's catalogue rows (C-53.10–.12), on
   `machineFenceRow`'s shape and for its reason — a code with no canned sentence
   behind it must not reach a member. */
const testimonyFenceRow = (code) => {
  const row = CHECK_CATALOGUE.TESTIMONY_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`testimonyFenceRow: ${code} has no TESTIMONY_CHECKS row with a canned translation (DEC-49).`);
  return { code, check: row.check, translation: row.translation };
};
const machineFenceRow = (code) => {
  const row = CHECK_CATALOGUE.MACHINE_FENCE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`machineFenceRow: ${code} has no MACHINE_FENCE_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

const admissionRow = (code) => {
  const row = ADMISSION_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`admissionRow: ${code} has no ADMISSION_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* Some of these reads happen INSIDE a per-item renderer that returns a rendered
   object rather than a Response, so it has no way to refuse on its own behalf.
   Rather than let it fabricate a rendering from an answer it never got, it
   throws this and the handler that owns the Response turns it into the same
   refusal. A sentinel class and not a bare string, so a genuine crash on the
   same path is re-thrown instead of being reported as a polite silence. */
class StoreSilent extends Error {
  constructor(op) { super(`the store did not answer ${op}`); this.op = op; }
}

/* The R2 key for a capture's bytes (I1 §2): content-addressed under the store
   prefix. The ONE place this shape is written, so op=capture and op=pdfstructure
   read the identical object rather than two copies of the key drifting apart. */
const captureKey = (storeName, sha) => `${storeName}/captures/${sha}`;

/* Escalate a PDF to the pdf-worker (I6) ONLY when Tier 1 got essentially nothing:
   more undetermined REGIONS than decoded characters. That is the measured line
   between CPDF-5's buckets — the whole-document no-/ToUnicode case (many regions,
   ~nil chars) and encryption (one `encrypted` region, zero chars) both escalate,
   while a budget book Tier 1 already reads at ~88% (hundreds of thousands of
   chars, far fewer regions) does not. Region count, not code-point count, is
   what makes the zero-char encrypted case cross the line. A `text` that is
   missing or malformed escalates nothing. */
function needsTier2(text) {
  const c = text && text.counts;
  if (!c || typeof c.chars !== "number" || typeof c.undetermined !== "number") return false;
  if (!(c.undetermined > c.chars)) return false;
  /* CPDF-10 — AND A SCAN DOES NOT ESCALATE TO TIER 2, because Tier 2 has
     nothing to tell it. `no_text_layer` means the page declares no font and
     draws an image: pdf.js would walk the same file and reach the same answer,
     one cross-worker hop later. The predicate above only started firing for
     this class when Tier 1 learned to NAME it (see pdfstructure.mjs) — before
     that a scan produced zero markers and zero chars and escalated to nothing,
     so this is not a narrowing of existing behaviour but a bound on new
     behaviour, placed in the same turn that created it.

     A MIXED DOCUMENT STILL ESCALATES, and that is the over-strictness this
     guard is written to avoid: a report with scanned exhibits stapled to the
     back carries `no_text_layer` markers AND `no_tounicode` ones, and Tier 2
     genuinely helps with the second kind. So the test is "is EVERY marker a
     scan marker", never "is ANY marker a scan marker". */
  const marks = Array.isArray(text.undetermined) ? text.undetermined : [];
  if (marks.length && marks.every((m) => m && m.reason === "no_text_layer")) return false;
  return true;
}

/* CPDF-10 — WHAT FIDELITY A TEXT LAYER SUPPORTS, and the answer is NULL:
   UNDETERMINED, STATED. That is a decision rather than an omission, so it is
   argued here.
 *
 * The tempting answer is a strong letter. Tier 1 decodes the real Legistar
 * agenda at 99.9% (CPDF-5), so the DECODE is excellent — and the decode is not
 * the question. Transcription fidelity asks whether the text matches what is
 * ON THE PAGE, and a text layer is somebody else's transcription that we decode
 * faithfully: `pdfstructure.mjs` reads it through the FILE'S OWN /ToUnicode
 * map, so a perfect decode of a wrong layer is a perfect decode of a wrong
 * layer. CPDF-9 MEASURED that this is not hypothetical — 3 of 14 recent
 * Legistar attachments name ABBYY FineReader in their producer metadata, and
 * those are the Clerk's CERTIFIED ENACTED RESOLUTIONS carrying garbled machine
 * OCR overlays. The record has been reading those as authored text.
 *
 * So: no measurement exists for "a text layer's fidelity", because it is not
 * one population — it is authored text and third-party OCR mixed together with
 * no marker the plane currently reads. `null` is what that is, and undetermined
 * is first-class here rather than a gap to be filled with a plausible letter.
 * A letter invented here would be the record claiming more than it can support,
 * one field wide, on every document in the store.
 *
 * WHAT WOULD MOVE IT: the producer-metadata read CPDF-9 recommended and this
 * item did not build — see the DEBT row and the CONTENT-PDF delegation. With it,
 * a layer whose producer names OCR software becomes `layer -> ocr(<product>)`
 * with the product NAMED, and a layer with no such marker stays undetermined
 * (never "authored" — an absent marker is an absent marker). */
const LAYER_FIDELITY_CAP = null;
const LAYER_FIDELITY_SOURCE = "unmeasured: a text layer is itself an unverified transcription "
                            + "(CPDF-9, MEASUREMENTS.md 2026-08-03)";

/* D-251 — AND NOW THE FILE ITSELF SAYS WHO MADE THAT LAYER, ON THE DOCUMENTS
 * THE RECORD ALREADY HOLDS.
 *
 * The paragraph above ends "WHAT WOULD MOVE IT: the producer-metadata read
 * CPDF-9 recommended and this item did not build." This is that read, arriving
 * at the one place a chain is composed. `pdfstructure.mjs` does the reading and
 * owns the whole argument for why it is a DETECTOR rather than a lookup table;
 * this file composes what it found into a step and holds no opinion about any
 * engine, exactly as `textchain.mjs` holds none.
 *
 * WHAT CHANGES AND WHAT CANNOT. A layer whose /Info names OCR software gains a
 * SECOND step — `layer -> ocr(<product>)`, the product named from the document's
 * own bytes — and a layer with no such marker is untouched: one `layer` step,
 * byte-identical to what every chain carried before this existed. The
 * composition below can only ever APPEND, through `appendStep`, which is the
 * function that already refuses a step claiming a stronger cap than the chain it
 * extends. There is no path here that removes a step, replaces a chain, or
 * raises a cap, so the classification cannot strengthen a claim even by mistake.
 *
 * THE NAMED ENGINE'S CAP IS NULL, and that is not an oversight to be filled in
 * later by whoever ships a number. It is somebody ELSE'S engine, run at a
 * quality nobody here measured, on documents nobody here re-ran: CPDF-9 read
 * `2022 NOV 23 AM 9* 59 p|{ £0OFFICE OF THE CITY CLERK` off one of these layers.
 * `null` is UNDETERMINED, STATED. What the chain gained is not a letter — it is
 * the ENGINE'S NAME, which is what a calibration is OF (CPDF-13) and what a
 * reader would need to re-run the claim. */
const NAMED_ENGINE_CAP = null;
const NAMED_ENGINE_SOURCE = "unmeasured: the engine is NAMED by the document's own /Info producer "
                          + "metadata (D-251; CPDF-9, MEASUREMENTS.md 2026-08-03), and no "
                          + "calibration of it exists here (CPDF-13)";

/* The chain a document's own text layer produces, EXTENDED by what the file
   says made it. `layerChain` remains the only builder; this adds the one step
   D-251 discovered and returns the base chain unchanged for every document
   that has no marker — including a text shape from a producer that emits no
   `producer` field at all (an office container, a Tier-2 answer), which is an
   ABSENCE and reads as one. A refused append (it cannot happen with a null cap,
   and is checked rather than assumed) keeps the base chain. */
function layerChainFor(i2text, { tier, container }) {
  const base = layerChain({ tier, container,
                            cap: LAYER_FIDELITY_CAP, measured_by: LAYER_FIDELITY_SOURCE });
  const p = i2text && i2text.producer;
  if (!p || p.determination !== "ocr") return base;
  const engine = p.ocr && typeof p.ocr.engine === "string" ? p.ocr.engine.trim() : "";
  /* A determination of `ocr` that names no product would be rule 1's collapse
     arriving one level down — "ocr" as a label. `checkChain` refuses it; this
     keeps the honest base chain rather than handing it a refusal to store. */
  if (!engine) return base;
  const ext = appendStep(base, {
    step: "ocr", engine, version: null, field: p.ocr.field, marker: p.ocr.marker,
    cap: NAMED_ENGINE_CAP, measured_by: NAMED_ENGINE_SOURCE,
  });
  return Array.isArray(ext) ? ext : base;
}

/* CPDF-10 — THE TIER-3 PREDICATE, and it is deliberately NOT "did Tier 2 fail".
 *
 * A document Tier 2 could not decode and a document with NO TEXT TO DECODE are
 * different findings, and only the second is what OCR is for. pdf.js reports
 * the second as the `no_text_layer` marker (I2's Tier-2 vocabulary): a page it
 * recovered nothing for, which is a scan. An encrypted document is NOT a Tier-3
 * candidate however little text it yielded — running OCR over a page we were
 * refused access to would transcribe whatever the viewer happened to render,
 * and the honest answer there is the `encrypted` marker Tier 1 already names.
 *
 * READ FROM THE MARKER VOCABULARY, NOT FROM A CHAR COUNT. A char count cannot
 * tell a scanned page from a blank one from an encrypted one, and CPDF-9
 * measured that the distinction is structural: the image-only exhibit carried
 * 0 fonts, which is a fact about the file rather than about how much text came
 * out of it.
 *
 * WHAT THIS PREDICATE CANNOT SEE, stated because the next reader will need it:
 * a MIXED document — a text-layer report with three scanned exhibits stapled
 * to the back — has both kinds of page and answers TRUE here on the strength of
 * the scanned ones. That is the intended answer (those pages want OCR) but it
 * means "this document is a Tier-3 candidate" is never "this document is a
 * scan". Per-page routing is CPDF-12's to make real, because it needs a
 * producer that works a page at a time. */
function needsTier3(text) {
  const marks = (text && Array.isArray(text.undetermined)) ? text.undetermined : [];
  if (marks.some((m) => m && m.reason === "encrypted")) return false;
  return marks.some((m) => m && m.reason === "no_text_layer");
}

/* D-252 — WHICH PAGES WANT OCR, WHICH IS THE QUESTION `needsTier3` DOES NOT ASK.
 *
 * The routing predicate above is per DOCUMENT and the thing it routes is per
 * PAGE. That was stated at the predicate by CPDF-10 and left open because the
 * producer did not exist; this is the half that can be built without one,
 * because it reads only the marker vocabulary the plane already emits.
 *
 * `needsTier3` IS DELIBERATELY UNCHANGED. It would have been tidy to define it
 * as "this list is non-empty", and it would have been a silent behaviour change:
 * a `no_text_layer` marker that names NO page still selects the document (the
 * document wants OCR) but contributes no page here, so the two answers can
 * legitimately differ and the routing question must keep the answer it had.
 * MEASURED rather than assumed: both producers of this marker name the page
 * (`pdfstructure.mjs` emits `page: pageIdx`, `pdf-worker/src/index.mjs` emits
 * `page: i`), so the pageless case is defensive today — and the merge below is
 * built so that it stays SAFE rather than merely unlikely.
 *
 * The encrypted rule is the document-level one on purpose and is not softened
 * to a page: Tier 1 decodes NOTHING from an encrypted file and says so with one
 * document-level marker, so there is no per-page finding to have. Running an
 * engine over pages we were refused access to is what the rule above refuses,
 * and it refuses it for the whole document. */
function tier3Pages(text) {
  const marks = (text && Array.isArray(text.undetermined)) ? text.undetermined : [];
  if (marks.some((m) => m && m.reason === "encrypted")) return [];
  const pages = [];
  for (const m of marks) {
    if (!m || m.reason !== "no_text_layer") continue;
    if (!Number.isInteger(m.page) || m.page < 0) continue;
    if (!pages.includes(m.page)) pages.push(m.page);
  }
  return pages.sort((a, b) => a - b);
}

/* ===================================================================== *
 * D-252 — THE MERGE. AN OCR PASS MAY FILL A PAGE. IT MAY NEVER REPLACE ONE.
 * ===================================================================== *
 *
 * The defect this closes, stated as it was handed forward: a MIXED document — a
 * text-layer report with three scanned exhibits stapled to the back, an ordinary
 * Council packet shape — answers TRUE at `needsTier3` on the strength of the
 * scanned pages, and the wire then assigned `i2text = built.text` WHOLESALE. So
 * a perfectly good text layer would have been thrown away and replaced by an OCR
 * pass at cap `C`. Harmless while the branch was untaken; a live defect the
 * moment a member exists.
 *
 * I2's text shape already has the right grain (`pages[]`), so this is a MERGE
 * RULE and not a new structure — CPDF-10's reading of it, and it held.
 *
 * TWO CONDITIONS, AND A PAGE IS FILLED ONLY IF BOTH HOLD:
 *
 *   1. THE PAGE WAS SELECTED. It carries the `no_text_layer` marker — the
 *      structural signal, read from the marker vocabulary rather than from a
 *      character count, exactly as the routing predicate reads it.
 *   2. THE PAGE HAS NOTHING TO LOSE. Its base text is empty.
 *
 * The second is not redundant and it is the one that makes the guarantee
 * UNCONDITIONAL. Condition 1 is a claim by a producer about its own output;
 * condition 2 is a fact about the text in hand. With both, this function CANNOT
 * degrade a page that carries text, whatever a marker says, whatever a member
 * returns, and whatever a future tier's marker vocabulary comes to mean. A
 * guarantee that rests on another component's correctness is the class of
 * mechanism this project meets most often and believes least.
 *
 * A MEMBER'S ANSWER FOR A PAGE IT WAS NOT ASKED ABOUT IS DROPPED AND COUNTED,
 * never merged. The page list travels in the request as a HINT and the answer is
 * checked against it here, because a hint the consumer trusts is not a hint —
 * it is a contract enforced at the wrong end.
 *
 * A SELECTED PAGE THE MEMBER DID NOT ANSWER FOR KEEPS ITS MARKER. It stays
 * honestly unread rather than becoming an empty page, which is the same rule one
 * tier up: an absence with nothing to report is not a finding, but an absence
 * something WAS expected for is.
 *
 * WHAT THIS FUNCTION WILL NOT DO, and it is the case that would otherwise be
 * silent: if the base text has no usable `pages[]` grain, there is no way to
 * tell which text would be replaced, so the OCR answer is taken ONLY when the
 * base holds no text at all (nothing can be lost — the wholly-image-only class
 * CPDF-9 measured, and the only class any of this has ever run on). Otherwise
 * the answer is REFUSED with a reason and the base text stands. Refusing a
 * transcription costs a document that stays unread; accepting it costs a
 * document whose good text was overwritten by a weaker one, and only the second
 * makes the record claim more than it can support. */
function mergeTier3Text(base, ocr, eligible) {
  const basePages = (base && Array.isArray(base.pages)) ? base.pages : [];
  const usable = basePages.filter((p) => p && Number.isInteger(p.page));
  const ocrPages = (ocr && Array.isArray(ocr.pages)) ? ocr.pages : [];
  const wanted = new Set(eligible);

  if (!usable.length) {
    const baseChars = (base && base.counts && Number.isFinite(base.counts.chars))
      ? base.counts.chars
      : (typeof (base && base.document) === "string" ? base.document.length : 0);
    if (baseChars > 0)
      return { ok: false, filled: [], refused: [], unanswered: [],
               why: `this document's text could not be merged page by page (the tier that read it `
                  + `reported no per-page text), and it already holds ${baseChars} decoded `
                  + `character(s), so an OCR pass was refused rather than allowed to replace text `
                  + `that may be better than it` };
    /* Nothing to lose: the wholly-unread document. This is the path every
       Tier-3 document has taken to date and it is unchanged. */
    return { ok: true, text: ocr, filled: ocrPages.map((p) => p.page).filter(Number.isInteger),
             refused: [], unanswered: [], wholesale: true };
  }

  const byPage = new Map();
  const refused = [];
  for (const p of ocrPages) {
    if (!p || !Number.isInteger(p.page)) continue;
    const target = usable.find((b) => b.page === p.page);
    const empty = target && !(typeof target.text === "string" && target.text.length);
    if (!target || !wanted.has(p.page) || !empty) { refused.push(p.page); continue; }
    byPage.set(p.page, p);
  }

  const filled = [], pages = [], undetermined = [];
  for (const b of usable) {
    const got = byPage.get(b.page);
    if (got) {
      filled.push(b.page);
      pages.push({ page: b.page, text: typeof got.text === "string" ? got.text : "",
                   undetermined: Array.isArray(got.undetermined) ? got.undetermined : [] });
    } else {
      pages.push(b);
    }
    for (const u of pages[pages.length - 1].undetermined || []) undetermined.push(u);
  }
  const unanswered = eligible.filter((p) => !filled.includes(p));
  const document = pages.map((p) => p.text).filter((t) => typeof t === "string" && t.length).join("\n");
  /* The regions ride along for the pages that were filled, and ONLY those: a
     region is an anchor into an image of a page, and a page nobody transcribed
     has none. */
  const regions = (ocr && Array.isArray(ocr.regions))
    ? ocr.regions.filter((r) => r && r.source && filled.includes(r.source.page)) : [];
  const text = { ...base, document, pages, undetermined,
                 counts: { chars: document.length, undetermined: undetermined.length } };
  if (regions.length) text.regions = regions;
  return { ok: true, text, filled, refused, unanswered, wholesale: false };
}

/* D-252 — WHAT THE MERGE DID, IN THE RECORD'S OWN SENTENCE.
 *
 * Three findings, and they are three because collapsing them loses the one a
 * reader needs: pages that WERE transcribed, pages that wanted OCR and did not
 * get it (still unread — an expected absence IS a finding), and pages a member
 * answered for that it was not asked about (dropped, and evidence about the
 * member rather than about the document). `null` when there is nothing to say,
 * so a clean wholesale transcription reads exactly as it read before. */
function tier3Note(m, memberNote) {
  const say = [];
  if (!m.wholesale && m.filled.length)
    say.push(`${m.filled.length} scanned page(s) were transcribed by the OCR member and merged into `
           + `this document's own text; the ${m.filled.length === 1 ? "page" : "pages"} that already `
           + `had text kept it`);
  if (m.unanswered.length)
    say.push(`${m.unanswered.length} page(s) with no text layer were not transcribed and stay `
           + `honestly unread`);
  if (m.refused.length)
    say.push(`${m.refused.length} page(s) the OCR member returned were not pages it was asked `
           + `about, and were dropped rather than allowed to overwrite text this document already had`);
  if (memberNote) say.push(memberNote);
  return say.length ? say.join("; ") : null;
}

/* ===================================================================== *
 * CPDF-19 / D-319 — THE TIER-3 SEAM AS ONE FUNCTION, SO THE ACQUIRE PATH AND
 * THE READ PATH COMPOSE ONE CHAIN BY ONE RULE.
 * ===================================================================== *
 *
 * EVERY LINE BELOW WAS MOVED, NOT REWRITTEN, out of `op=acquire`'s format wire,
 * where it was CPDF-10's seam, D-252's page-wise merge and REC-102's per-page
 * layer partition. D-319 is that `op=pdfstructure` — the READ-time op — had no
 * route to it, and `EXTRACTION-BREADTH-DESIGN.md` §5.1 lifts the seam into the
 * read op "behind the same `needsTier3`/`tier3Pages` predicates and the same
 * page-wise merge". A second copy in the read op would be two spellings of the
 * one rule REC-102 exists to keep single, so the rule now lives here and both
 * call sites hand it what they hold.
 *
 * FOUR EDITS AND ONLY FOUR, each so a caller can tell what happened:
 *   - `chainSet` says the merge composed a chain. `chain` is left UNDEFINED
 *     otherwise, because the acquire path's caller may already hold the tier-2
 *     merge's scoped chain and "this block did not touch it" is not "null".
 *   - `filled` and `engine` report WHICH pages the member transcribed and WHO
 *     it was, which the read path's observation and answer name.
 *   - D-417: the calibration join addressed the Durable Object as
 *     `http://x/?op=calibrations`. The store routes on the PATH (`op-claims.mjs`
 *     states the two levels), so the lookup answered `unknown op` every time and
 *     read a field the answer does not have — the join NEVER FIRED and every
 *     chain named no calibration, which reads exactly like "this store holds
 *     none". It now asks `/calibrations` and reads `result.calibrations`.
 *
 * WHAT IT RETURNS: the text (merged or unchanged), the tier, the chain when one
 * was composed, the reason when OCR could not help, the pages filled and the
 * engine that filled them. It never throws for a member's failure: that is an
 * `ocrNote`, exactly as it always was. */
async function tier3Extend(env, { sha, storeName, i2text, wiredTier, tier2PerPage, fmt }) {
  let chain, chainSet = false, ocrNote = null, filled = [], engine = null, unanswered = [];
  const wanted = !!(i2text && needsTier3(i2text));
  if (i2text && needsTier3(i2text)) {
    /* D-252: WHICH pages, established before the member is called
       and kept for the merge. The list travels in the request so a
       member need not transcribe pages that already have text — the
       cost half — and it is checked again on the way back, because
       the correctness half cannot rest on the member having read it.
       `baseTier` is remembered here because `wiredTier` becomes 3
       below and the text-layer part of a MIXED document still came
       through the tier it came through. */
    const wantPages = tier3Pages(i2text);
    const baseTier = wiredTier;
    const baseText = i2text;
    if (env.OCR_WORKER) {
      try {
        const r = await env.OCR_WORKER.fetch("https://ocr-worker/transcribe", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ capture_sha: sha, store: storeName,
                                 pages: wantPages }),
        });
        /* THE STATUS IS READ BEFORE THE BODY, and that ordering is
           the fix for a real defect this suite caught: parsing the
           body of a 500 THROWS, so the catch below reported "could
           not be reached" for a member that answered perfectly well
           and answered an error. Two different findings — the member
           is down, and the member failed on this document — were
           collapsing into the first, which is the wrong one to
           report because only the second is about the document. */
        if (!r.ok) {
          ocrNote = `the OCR member answered ${r.status}, so this document stays unread`;
        } else {
          /* CPDF-13 / D-253 — THE CALIBRATION THE MEMBER'S OWN
             FIDELITY RESTS ON, joined here so the chain NAMES it.
             Without this the chain records the ENGINE and the grade
             rests on a MEASUREMENT with nothing between them, which
             is D-253 in one sentence.
  
             THE COST IS ONE STORE READ ON A BRANCH THAT ALREADY
             MADE A NETWORK CALL, and it is taken HERE rather than
             once per acquire on purpose. A capture with a text
             layer never reaches this line, so an instance with no
             OCR member pays nothing at all for this feature on the
             capture path.
  
             CORRECTED 2026-09-14 (CPDF-17): that sentence used to
             read "an instance with no OCR member — WHICH IS EVERY
             INSTANCE TODAY". The clause has been false since
             CPDF-10 (`698a07b`) and release 0.58.0 (`e67e275`) —
             the project's own instance HAS the member and reaches
             this line, and a sovereign group's does not until Bob
             releases the installer's fleet. The COST ARGUMENT is
             unchanged and still holds for the un-fleeted instance;
             only the false claim about how many instances that is
             has gone. Part II §16.4 of
             `docs/architecture/BIO_Content_Framework_v0_10.md`
             carries the verified state.
  
             IT FAILS OPEN TO NULL, NEVER TO A GUESS. A store that
             does not answer, an engine with no calibration, or a
             calibration that has been superseded all produce `null`
             — the pre-CPDF-13 chain, with `cap` and `measured_by`
             and no reference. A transcription that cannot name its
             measurement says so by not naming one; it never names
             the nearest available number, which would be the
             record claiming a join it does not have. */
          const ocrAnswer = await r.json();
          let calRef = null;
          try {
            const stCal = env.STORE.get(env.STORE.idFromName(storeName));
            const cOut = await doAnswer(stCal.fetch(
              `http://x/calibrations?engine=${
                encodeURIComponent(String(ocrAnswer && ocrAnswer.engine || ""))}`));
            const live = ((cOut && cOut.answered && cOut.result && cOut.result.calibrations) || [])
              .find((c) => c.superseded_by == null
                        && c.version === (ocrAnswer && ocrAnswer.version));
            calRef = live ? live.calibration_id : null;
          } catch { /* a calibration this record cannot read is a
                       calibration this chain does not name. */ }
          const built = ocrTextFromMember(ocrAnswer, { calibration: calRef });
          if (built.ok) {
            engine = { engine: String(ocrAnswer.engine), version: String(ocrAnswer.version), calibration: calRef };
            /* D-252 — PAGE-WISE, NEVER WHOLESALE. This line was
               `i2text = built.text`, which threw away a text layer
               the moment one scanned exhibit was stapled to the
               back of a report. */
            const m = mergeTier3Text(baseText, built.text, wantPages);
            if (!m.ok) ocrNote = m.why;
            else {
              i2text = m.text;
              /* The pages that kept their own text: what is LEFT of
                 the base after the fill, computed FROM THE TEXT
                 rather than from the page list, so a page carrying
                 text is in this part whether or not anything
                 predicted it would be. A selected page nobody
                 transcribed carries no text and therefore belongs to
                 neither part — it has no provenance to record,
                 because nothing produced anything for it. */
              const layerPages = (Array.isArray(m.text.pages) ? m.text.pages : [])
                .filter((p) => p && Number.isInteger(p.page) && !m.filled.includes(p.page)
                            && typeof p.text === "string" && p.text.length)
                .map((p) => p.page);
              const parts = [];
              /*__REC102_TIER3_LAYER_PARTS_START__*/
              /* REC-102 / D-372 — THE LAYER PART IS PARTITIONED BY
                 THE TIER-2 MERGE'S OWN PER-PAGE STATEMENT, NOT
                 COLLAPSED ONTO ONE DOCUMENT-LEVEL TIER.
                 This block used to be a single part at `baseTier`,
                 and that single tier is a DOCUMENT-level answer to a
                 PER-PAGE question — the very shape D-252 closed one
                 tier up and REC-98 closed one merge earlier. A
                 document that escalates to tier 2 per page and THEN
                 re-extracts to tier 3 had its per-page statement
                 rebuilt as `tier: 2` over every page the tier-2
                 merge had deliberately KEPT at tier 1, so the record
                 named a derivation those pages do not have. Not a
                 regression (before REC-98 the escalation assigned
                 tier 2 wholesale anyway) and that is why it is a row
                 rather than a revert — but it is the record
                 overclaiming, which is the direction this project
                 cares about most.
                 THE FALL-BACK IS THE OLD BEHAVIOUR EXACTLY. With no
                 per-page partition (`tier2PerPage` null — tier 2
                 never ran, or took the document wholesale) every
                 layer page is `unspoken` and this composes the one
                 part at `baseTier` that it always composed, in the
                 same position, so a document reaching only ONE of
                 the two merges answers byte-identically.
                 A PAGE THE PARTITION DOES NOT SPEAK FOR IS NAMED,
                 NEVER SCORED TO A TIER. It goes to the `baseTier`
                 part rather than being guessed into tier 1 or tier
                 2: undetermined is first-class, and the document's
                 own wired tier is the honest answer for a page the
                 merge said nothing about.
                 `baseText` is the pre-merge shape at every site, so
                 D-251's producer marker is still read off the
                 DOCUMENT rather than off the OCR member's answer —
                 unchanged, and true of all three parts. */
              const layerSet = new Set(layerPages);
              const spokenFor = tier2PerPage
                ? [[1, (tier2PerPage.tier1 || []).filter((p) => layerSet.has(p))],
                   [2, (tier2PerPage.tier2 || []).filter((p) => layerSet.has(p))]]
                : [];
              const spoken = new Set(spokenFor.flatMap(([, ps]) => ps));
              /* IN THE ORDER THE ATTEMPTS HAPPENED, which is what
                 `tiersEvidenced` reads the chain as and what the
                 content-level writer walks cumulatively: the tier-1
                 decode had its go before the tier-2 one, which had
                 its go before the engine. */
              for (const [tier, ps] of spokenFor)
                if (ps.length)
                  parts.push({ pages: ps,
                    chain: layerChainFor(baseText, { tier, container: fmt }) });
              const unspoken = layerPages.filter((p) => !spoken.has(p));
              if (unspoken.length)
                parts.push({ pages: unspoken,
                  chain: layerChainFor(baseText, { tier: baseTier, container: fmt }) });
              /*__REC102_TIER3_LAYER_PARTS_END__*/
              if (m.filled.length) parts.push({ pages: m.filled, chain: built.chain });
              /* ONE part gives that part's chain back unscoped, so a
                 wholly-scanned document records exactly what it
                 recorded before D-252; TWO give the scoped, mixed
                 chain whose derivation cap is UNDETERMINED rather
                 than the engine's letter. */
              const merged = mergedChain(parts);
              /* A refusal from the chain builder records NO chain
                 rather than filing merged text under one part's
                 provenance. */
              chain = Array.isArray(merged) ? merged : null; chainSet = true;
              if (m.filled.length) wiredTier = 3;
              filled = m.filled; unanswered = m.unanswered || [];
              ocrNote = tier3Note(m, built.note);
            }
          } else ocrNote = built.why;
        }
      } catch {
        ocrNote = "the OCR member could not be reached, so this document stays unread";
      }
    } else {
      ocrNote = "this document has no text layer to read and no OCR engine is installed "
              + "in this instance, so nothing is claimed about what it says";
    }
  }
  /* D-418 — WHETHER THIS DOCUMENT STILL WANTS OCR, stated as its own fact.
     `tier3_candidate` was set from `ocrNote`'s TRUTHINESS, which was right when
     CPDF-10 wrote it (the note only ever said why a document was LEFT unread) and
     wrong from D-252 on, when `tier3Note` began carrying the SUCCESS sentence too
     ("N scanned page(s) were transcribed … and merged"). So every document the
     member transcribed page-wise was filed as still wanting OCR: REC-94's writer
     read that flag as a shortfall and recorded `partial`, and the content-axis
     frontier listed it as a re-extraction candidate for ever — the list D-319's
     re-read is chosen from, which a re-read could then never empty. A document
     wants OCR when it was selected and some selected page is still unread. */
  const stillWanting = wanted && (!filled.length || unanswered.length > 0);
  return { i2text, wiredTier, chain, chainSet, ocrNote, filled, engine, stillWanting };
}

/*__REC91_TEXT_UNITS_START__*/
/* CPDF-19: REC-91's block, MOVED VERBATIM into a function so the read path's
   re-extraction (D-319) derives a capture's indexable units by the SAME rule and
   the SAME wire budget as the acquire path. The assignments below are to this
   function's locals; the caller copies them. */
function textUnitsFor(i2text) {
  let textUnits = null, textUnitsOverBound = 0;
  /* REC-91 / `CONTENT-SEARCH-DESIGN.md` section 4.1 -- THE INDEXABLE
   * UNITS OF THIS CAPTURE'S TEXT, taken off the I2 shape at the one
   * place `i2text` is final, exactly where CAP-12's container extent
   * is taken and for the same reason. **It reads the same object and
   * touches not one line of that block**, which is deliberate: that
   * region is COFF-12's live claim.
   *
   * WHY THIS EXISTS AT ALL. Section 4.1 says the units are written
   * at promote "from the I2 shape the acquire path already holds" --
   * and the acquire path HOLDS it here and, until this line, carried
   * none of it forward. `readings.reading` holds `entities`,
   * `facts`, the chain, the tier, the page count and the container
   * extent, and NO TEXT; `reading_text_source` stores the chain and
   * not the text; per-page text was persisted nowhere at all. So the
   * store had no text to index and the design's own sentence had no
   * mechanism under it. This is that mechanism, and it is a SIBLING
   * of `reading` rather than a field ON it, which is the one shape
   * decision in this block and is load-bearing -- see below.
   *
   * RECOGNISED BY SHAPE, NEVER BY A LIST OF CONTAINER NAMES, which
   * is CAP-12's own rule and the reason a seventh producer landing
   * in the same I2 shape is fed by this code with no edit. `pages[]`
   * is a PDF; `paragraphs[]` a word-processing container; `slides[]`
   * a deck. A workbook returns `sheets[]`, which is none of these
   * and correctly yields nothing -- a cell is not a passage and
   * the `sheet-range` extent arm (FW-19) has no unit writer here yet.
   *
   * THE DECK IS ONE UNIT PER SLIDE, RULED BY BOB 2026-09-15, written
   * as a `slide-shape` extent with the SHAPE OMITTED -- which
   * `covers()` already accepts as covering the whole slide, so no
   * grammar change is owed and `pptx.mjs` needs no change either: it
   * emits one text string per slide today. A shape is not a passage,
   * exactly as a cell is not one.
   *
   * SPEAKER NOTES ARE NOT INDEXED, AND THAT IS STATED RATHER THAN
   * LEFT TO BE NOTICED. `pptxText` emits `speakerNotes[]` per slide
   * and DEC-5 requires them "DISTINGUISHABLE from slide text
   * EVERYWHERE shown, cited or indexed, never merged" -- so they
   * cannot be folded into the slide's unit. Nor can they have a unit
   * of their own: the only address that reaches a slide is
   * `slide-shape`, whose shape-omitted form is now THE SLIDE, so a
   * notes unit would collide with the slide's own primary key. There
   * is no extent arm for a slide's notes, so the most candid text in
   * a deck is not searchable at content grain. Reported as a DESIGN
   * GAP against section 4.1.
   *
   * THE RECT IS DEGENERATE ON PURPOSE. Section 4.1 says `pdf-page`
   * "with the page's full rectangle"; I2's text shape carries no
   * rectangle, and inventing one would be worse than not having it —
   * `canonicalExtent` hashes the rect INTO the content address, so a
   * literal rectangle would give the indexed unit a different
   * `contentIdFor` from the one a member citing "page 14" produces,
   * and the hit would stop being the citation's own identity
   * (section 4.5). The absent rect IS the whole page, in the
   * record's own spelling, and `describeExtent` already reads it
   * that way.
   *
   * A UNIT WITH NO TEXT IS NOT EMITTED. M-20 measured 26.3 % of PDF
   * pages recovering nothing at all -- scans and image-only pages --
   * and they are indexed as NOTHING rather than as empty, which is
   * why section 4.4's `scope` tally exists. Text below the OCR floor
   * never reaches here at all: it is discarded rather than carried
   * beside a flag (Part II section 16, chain rule 4). */
  if (i2text) {
    const arm = (list, kind, fields) => (Array.isArray(list) ? list : [])
      .map((u, i) => (u && typeof u === "object" && typeof u.text === "string" && u.text.length
        ? { extent: { kind, ...fields(u, i) }, seq: i, text: u.text } : null))
      .filter(Boolean);
    /* The index each producer ALREADY assigns is carried, never
       re-counted from the array position: `pages[].page`,
       `paragraphs[].para` and `slides[].slide` are the producer's own
       numbering and are what every other reference into these
       containers is written against. A re-count would silently
       disagree the first time a producer skipped one. */
    const units =
        Array.isArray(i2text.pages)      ? arm(i2text.pages, "pdf-page",
          (u, i) => ({ page: Number.isInteger(u.page) ? u.page : i, rect: null }))
      : Array.isArray(i2text.paragraphs) ? arm(i2text.paragraphs, "doc-para",
          (u, i) => ({ para: Number.isInteger(u.para) ? u.para : i, run: null }))
      : Array.isArray(i2text.slides)     ? arm(i2text.slides, "slide-shape",
          (u, i) => ({ slide: Number.isInteger(u.slide) ? u.slide : i, shape: null }))
      : null;
    /* AN EMPTY LIST IS NULL AND NEVER A ZERO, which is CAP-12's rule
       twelve lines up applied to this key. A container whose entry
       returned `pages: []` because it was over the size bound has not
       told us it holds no pages, and emitting `[]` would let the
       store record "extracted, unit arm present, nothing to index"
       for a document nobody managed to read. The absent key and the
       empty array are two different facts; only one of them belongs
       on the wire. */
    /* THE WIRE'S OWN BUDGET, AND IT IS NOT §4.3's BOUND — IT IS THE
       ONE THAT ACTUALLY BINDS, MEASURED BY THIS ITEM'S OWN SUITE
       RATHER THAN REASONED.
       *
       * §4.3 sets a PER-CAPTURE bound of 2,097,152 B from M-20, and
       * `#writeCaptureText` applies exactly that. But the route the
       * design names for getting the units to the store is
       * `data/provenance.json`, and `op=promote` REFUSES an inline
       * bundle file over `INLINE_MAX` — 1,048,576 B — with
       * `OVERSIZE_INLINE`. So a capture carrying more text than that
       * would not be indexed to the bound and reported `partial`: THE
       * WHOLE PROMOTION WOULD BE REFUSED. Measured at 2,460,076 B on
       * this item's first run of its own bound arm.
       *
       * THAT WOULD BE A REGRESSION AND NOT A NEW LIMIT, which is why
       * it is fixed here rather than reported and left. M-20's census
       * holds real documents over it — the largest PDF at 1,354,686 B
       * of text and the largest docx at 1,187,253 B — and every one of
       * them promotes today. Emitting their text unbounded would make
       * this item REFUSE documents the record currently accepts, which
       * is the worst direction available: a capture the group cannot
       * file at all, because of an index.
       *
       * THE FIGURE, and it is half of `INLINE_MAX` on purpose. The
       * other half is headroom for the rest of the document — the
       * reading, the chain, the provenance hops — and for JSON
       * ESCAPING, which is not a constant factor: a quote or a control
       * byte expands, so a budget set close to the limit would fail on
       * text rather than on size and would do it unpredictably. At
       * M-20's percentiles 524,288 B admits the PDF sample past its
       * 99th (396,328 B) and every docx and pptx but the largest two.
       *
       * AND WHAT IS DROPPED IS COUNTED, NEVER SILENT. The count rides
       * beside the units so the store's `indexed` observation reads
       * `partial` and names this bound — otherwise a capture truncated
       * at the wire would be recorded as fully indexed, which is the
       * record claiming coverage it does not have at the one level a
       * member reads absence from. Reported as a DESIGN GAP against
       * §4.3: the bound the design sets is not the bound that binds. */
    let budget = ACQUIRE_TEXT_UNITS_BUDGET, kept = [], dropped = 0;
    for (const u of (units || [])) {
      /* THE ENVELOPE IS CHARGED WITH THE TEXT, AND THAT IS NOT
         FASTIDIOUSNESS — a unit costs the wire its JSON STRUCTURE as
         well as its words, and the structure is the half that bites.
         `civicos-ui/app.html` serialises the acquire document with
         `JSON.stringify(..., null, 1)`, so every unit spends about
         eight indented lines on its extent, its seq and its keys
         whatever its text weighs. M-20's worst docx carries 20,571
         paragraph units at a mean of 60 B: charged on text alone
         they are 1.2 MB and fit the budget twice over, while their
         ENVELOPES ALONE are about 1.8 MB and would take the promote
         past `INLINE_MAX` on their own. A budget that counted only
         the words would have been a bound that did not bound.
         AND IT LANDS NEAR A NUMBER NOBODY AIMED AT, which is worth
         the line: 512 KiB at 128 B of envelope admits about 4,000
         units, and M-20 measured the largest promote that fits the
         CPU window at ~3,900 units at that corpus's mean unit size.
         Two independent limits agreeing is not evidence of either —
         it is a coincidence worth noticing and not resting on. */
      const size = new TextEncoder().encode(u.text).length + ACQUIRE_TEXT_UNIT_ENVELOPE;
      if (size > budget) { dropped++; continue; }
      budget -= size; kept.push(u);
    }
    textUnits = kept.length ? kept : null;
    textUnitsOverBound = dropped;
  }
  return { textUnits, textUnitsOverBound };
}
/*__REC91_TEXT_UNITS_END__*/

/* CPDF-19: MOVED VERBATIM from `op=acquire` (its explanation stays at the acquire site). */
const readEntities = (list) => (Array.isArray(list) ? list : []).map((e) => ({
  key: e && e.key != null ? String(e.key) : null,
  kind: e && e.kind != null ? e.kind : null,
  label: e && e.label != null ? e.label : null,
  facts: e && e.facts && typeof e.facts === "object" ? e.facts : {},
  /* The reference exactly as the reading carries it: kind:key, raw. */
  ref: `${e && e.kind != null ? e.kind : ""}:${e && e.key != null ? e.key : ""}`,
  /* FW-17 / IC-86: WHERE the reference was read, in IC-1's union and no
     other vocabulary. Validated here rather than trusted, for the reason
     IC-1 states as its own load-bearing part — a required `kind`
     discriminator turns a silent misread into a loud one, and this is the
     boundary where a reader's answer becomes the record's. An unrecognised
     kind, a missing human form or a missing per-arm field yields null: the
     reading still writes and the position is absent, which is the honest
     direction. NULL IS NEVER "the whole document was meant". */
  source: readingSource(e && e.source),
})).filter((e) => e.key != null || e.kind != null);

/* CPDF-19: THE READING A WIRED TEXT PRODUCES, as one function. MOVED VERBATIM
   out of `op=acquire` — the `determined` branch and the failed branch — so a
   read-time re-extraction (D-319) persists a reading composed by exactly the rule
   an acquire composes it by: the same basis sentence, the same tier-3 candidacy,
   the same position statement. `docType` is only read on the FAILED branch, which
   is why the re-extraction can hand it the stored reading's own type. */
function readingFromWire({ wired, docType, chain, wiredTier, fmt, retrieved, tier2note, ocrNote,
                           tier3Candidate = !!ocrNote }) {
  let reading = null;
  if (wired && wired.determined) {
    const { entities: wiredEntities, ...wrest } = (wired.parsed || {});
    const wfacts = (wrest && typeof wrest.facts === "object" && Object.keys(wrest).length === 1)
      ? wrest.facts : wrest;
    const entities = wired.parse_error ? [] : readEntities(wiredEntities);
    const wtype = wired.doctype.type;
    /* FW-17 / IC-86 — THE POSITION SENTENCE, and it is written whichever
       way the answer came out. A reading whose references carry no
       position must SAY SO: a null column that nobody explained reads as a
       reader that did not bother, and a reader that could not say is a
       different fact from a reader that was not asked. Three cases and
       they are three different findings — the container itemised and the
       reader placed every reference; the container itemised and the reader
       placed some (a reference read in a stretch no part claims); the
       container never itemised at all, which is the PRODUCER's absence and
       carries the producer's own reason. */
    const positioned = entities.filter((e) => e.source).length;
    const posNote = !entities.length ? null
      : positioned === entities.length
        ? `every reference carries where it was read (${positioned} of ${entities.length})`
        : positioned
          ? `${positioned} of ${entities.length} references carry where they were read; the rest were `
            + `read in stretches of text no part of the container claims, so their position is not stated`
          : `no reference carries where it was read — ${wired.position_why
              || "this reader does not say where"}`;
    reading = {
      content_type: wtype.key, reader_version: wtype.version ?? null,
      read_from_text: true, found: entities.length > 0,
      entities, facts: wired.parse_error ? {} : (wfacts || {}), at: retrieved,
      /* D-152's provenance rule, and CPDF-10's correction of how it was
         carried. This was the STRING "layer" — right about the fact and
         wrong about the shape, because the moment a second derivation
         exists a single label cannot say which engine produced the text
         or how many hands it passed through. It is now the CHAIN
         `textchain.mjs` owns: an ordered list of steps, each naming what
         performed it, each only able to weaken what it received. A text
         layer is itself an unverified transcription (CPDF-9 measured
         ABBYY FineReader in 3 of 14 recent Legistar attachments), so
         `layer` is a derivation step like any other rather than the
         absence of one. `text_tier`/`text_container` stay exactly as they
         were — a consumer reading only those is unaffected (IC-39). */
      text_source: chain, text_tier: wiredTier, text_container: fmt,
      basis: (wired.parse_error
        ? `the ${wtype.key} reader could not parse the ${fmt} text-layer text (${wired.parse_error}), so nothing is claimed about its entities`
        : (entities.length
            ? `read by the ${wtype.key} reader v${wtype.version} over ${fmt} ${describeChain(chain)} (tier ${wiredTier}); ${wired.why}`
            : `the ${wtype.key} reader found no entities in this document's ${fmt} text-layer text (tier ${wiredTier}); recorded as an empty reading, never an emptied document`))
        /* D-252: A DOCUMENT THAT READ IS STILL ALLOWED TO HAVE PAGES IT
           COULD NOT READ, and until now only the FAILED branch carried
           that sentence. A mixed document — a report with scanned exhibits
           — reads perfectly well off its text layer and reached here with
           `ocrNote` computed and then dropped on the floor, so the record
           said nothing at all about the exhibits. Same class as the merge
           above: the document-level answer stood in for a per-page fact. */
        /* REC-98 / D-283: and the same sentence one tier down. A document
           whose text layer is a MERGE of two decodes says so on the basis
           the record keeps, rather than presenting a merge as one tier's
           reading. Kept a separate clause from `ocrNote` for D-252's own
           stated reason — collapsing them loses the one a reader needs. */
        + (tier2note ? ` — ${tier2note}` : "")
        + (ocrNote ? ` — ${ocrNote}` : "")
        + (posNote ? ` — ${posNote}` : ""),
      ...(tier3Candidate ? { tier3_candidate: true } : {}),
      /* FW-17 / IC-86: the producer-side facts about position, carried on
         the reading so a later reader can tell an absent position that was
         never available from one a reader declined to give. */
      position_parts: wired.position_parts ?? 0,
      position_why: positioned ? null : (wired.position_why || null),
    };
  } else if (wired) {
    /* text-undetermined: a FAILED reading, recorded as such — the tier
       that could not decode says so, and no refs are invented. */
    reading = {
      content_type: docType.type.key, reader_version: docType.type.version ?? null,
      read_from_text: false, found: false, entities: [], facts: {}, at: retrieved,
      text_source: chain, text_tier: wiredTier, text_container: fmt,
      /* CPDF-10: a Tier-3 candidate says WHY it is unread, and the two
         reasons are different findings. `ocrNote` names the scan case —
         there was nothing to decode and no engine to read it — where
         `wired.why` names a decode that was attempted and failed. Reading
         them as one would file a scanned budget book beside a broken font
         map, and only one of those is waiting on a capability. */
      /* REC-98 / D-283: the tier-2 merge's finding rides here too. A
         document that stayed unread AND had a tier-2 escalation refused has
         two different things to say and only one of them is `wired.why`. */
      basis: [tier2note, ocrNote ? `${ocrNote} (${wired.why})` : wired.why]
               .filter(Boolean).join(" — "),
      ...(tier3Candidate ? { tier3_candidate: true } : {}),
    };
  }
  return reading;
}

/* ===================================================================== *
 * CPDF-10 — THE SEAM. THIS IS THE CONTRACT CPDF-12's OCR MEMBER MUST MEET.
 *
 * The renderer and the engine are CPDF-12's and are being measured in
 * parallel with this item. Rather than guess at their shape or build a
 * second renderer to have something to test against, this item builds the
 * CONSUMER side completely and states the producer side exactly — so the day
 * the member answers, the only new code is the member.
 *
 * THE MEMBER ANSWERS `POST /transcribe` WITH:
 *
 *   { ok: true,
 *     engine: "<name>", version: "<version>",     // REQUIRED, both
 *     cap: "A"|"B"|"C"|"D",                       // REQUIRED — the MEASURED
 *     measured_by: "<where the measurement lives>",//   fidelity, and where
 *     confidence_floor: <0..1> | null,            // null = engine reports none
 *     pages: [ { page:<0-based>,
 *                regions: [ { text, source:{kind:"pdf-page",page,rect},
 *                             confidence: "none" | {value,basis:"engine"} } ] } ] }
 *
 * FIVE THINGS THE MEMBER MUST NOT DO, each refused below rather than trusted:
 *
 *  1. It must not report a `cap` it did not measure. `measured_by` is required
 *     and is a pointer to MEASUREMENTS.md, because a fidelity letter is a
 *     measurement and this project's most-repeated finding is a hand-carried
 *     number going stale in a file nobody re-measures.
 *  2. It must not omit the anchor. A region with no `{page, rect}` is dropped,
 *     because a transcription nobody can check against the pixels is exactly
 *     what CPDF-10 refuses to put in the record.
 *  3. It must not self-report confidence. `basis:"engine"` means a classic
 *     decoder computed it; there is no basis a generative model can name, and
 *     that is deliberate (DEC-35's forbidden pseudo-confidence).
 *  4. It must not send a best guess for a region it could not read. It may send
 *     a low confidence and let the floor discard it — which is what the floor
 *     is for — but a region below the floor arrives here as text and LEAVES as
 *     `undetermined` with the text dropped.
 *  5. It must not assert. Fleet rule 2 (I6): the member writes nothing, holds
 *     no STORE and no PUBLISHED binding, and answers this one question.
 *
 * WHAT THE PLANE GUARANTEES BACK: the member is called ONLY for a document
 * `needsTier3` selected, is handed a capture sha and a store name and nothing
 * else, and its answer is never trusted as text without passing through here.
 *
 * ON FAILURE THIS RETURNS A REASON, NOT A THROW. A member that answers badly
 * must leave the document HONESTLY UNREAD (`ok:false` with a `why` the reading
 * carries), never half-transcribed and never crashing an acquire — the same
 * posture the Tier-2 escalation already takes one tier down.
 * ===================================================================== */
/* CPDF-13 / D-253 — WHAT THE `calibration` PARAMETER IS, AND WHY IT ARRIVES
 * HERE RATHER THAN BEING LOOKED UP HERE.
 *
 * `measured_by` (required above, and unchanged) is a free STRING and is a
 * pointer a HUMAN can follow. D-253 is that nothing checks it resolves, nothing
 * notices when the named engine ships a new version, and nothing can answer
 * "which transcriptions rest on a measurement that has been superseded". The
 * calibration reference is the machine-followable half of the same pointer, and
 * it lands here because THIS is where the chain is composed.
 *
 * IT IS PASSED IN, NOT FETCHED HERE, for `cap`'s own reason exactly (see
 * `textchain.mjs`'s header): a measurement must not acquire a second home. This
 * function knows what a step must carry; the store holds the measurements; the
 * caller joins them. A lookup inside here would make this module a reader of
 * the calibration table, which is the shape that eventually disagrees with it.
 *
 * BOTH DERIVATION STEPS TAKE THE SAME REFERENCE, because both already take the
 * same `cap` and for the same reason: the member measured its pipeline end to
 * end — page to pixels to text — and reports one fidelity for it. Stamping the
 * reference on the `ocr` step alone would say the rendering half rests on
 * nothing, which is not what was measured.
 *
 * NULL IS LEGAL AND IS THE PRE-CPDF-13 SHAPE. A member answering in an instance
 * that holds no calibration of it produces exactly the chain it produced
 * before: `cap` and `measured_by` and no reference. That is honest — the grade
 * rests on a measurement recorded somewhere this record cannot join to — and it
 * is why `checkChain` refuses only a reference that is present and unreadable. */
function ocrTextFromMember(res, { calibration = null } = {}) {
  const r = res && typeof res === "object" ? res : {};
  if (r.ok !== true)
    return { ok: false, why: `the OCR member declined to transcribe this document`
                             + `${typeof r.reason === "string" ? ` (${r.reason})` : ""}` };
  if (!(typeof r.engine === "string" && r.engine) || !(typeof r.version === "string" && r.version))
    return { ok: false, why: `the OCR member did not name its engine and version, so nothing it `
                             + `produced could be re-run or calibrated later` };
  if (!(typeof r.cap === "string" && r.cap) || !(typeof r.measured_by === "string" && r.measured_by))
    return { ok: false, why: `the OCR member reported no MEASURED fidelity for itself; a `
                             + `transcription's ceiling is a measurement, never a default` };

  /* The regions, walked page by page. A region with no checkable anchor is
     DROPPED and counted rather than kept — dropping is the conservative
     direction here, because the alternative is text in the record that nobody
     can point at a page to verify. */
  const pages = Array.isArray(r.pages) ? r.pages : [];
  let anchorless = 0, kept = 0, floored = 0, undetermined = 0;
  const outPages = [];
  for (const p of pages) {
    const pageNo = p && Number.isInteger(p.page) ? p.page : null;
    if (pageNo == null) continue;
    const anchored = [];
    for (const region of (Array.isArray(p && p.regions) ? p.regions : [])) {
      if (checkAnchor(region && region.source)) { anchorless++; continue; }
      anchored.push(region);
    }
    /* Rule 4 — the floor, applied by textchain.mjs so this file holds no copy
       of the discard rule. A null floor means the engine reports no confidence
       at all, which is a stated first-class answer and NOT a reason to invent
       a threshold: the engine's measured `cap` is what carries it. */
    const f = applyConfidenceFloor(anchored,
      typeof r.confidence_floor === "number" ? r.confidence_floor : null);
    floored += f.floored; undetermined += f.undetermined;
    kept += f.regions.filter((x) => x.text != null).length;
    outPages.push({ page: pageNo, regions: f.regions,
                    text: f.regions.map((x) => x.text).filter((t) => typeof t === "string").join("\n"),
                    undetermined: f.regions.filter((x) => x.undetermined)
                      .map((x) => ({ page: pageNo, reason: "ocr_below_floor", font: null,
                                     codes: null, count: 1, why: x.why })) });
  }
  if (!outPages.length)
    return { ok: false, why: `the OCR member returned no page this record could anchor, so nothing `
                             + `it produced can be checked against the document` };

  /* The chain. `pixels` before `ocr` because that IS what happened and the
     chain is a record of what happened — the page became pixels, and an engine
     read them. Both steps carry the same measured cap; `appendStep` would
     refuse the second if it claimed more, which is rule 2 doing its job on the
     path a member's answer actually travels. */
  let chain = appendStep([{ step: "pixels", cap: r.cap, measured_by: r.measured_by,
                            calibration }],
                         { step: "ocr", engine: r.engine, version: r.version,
                           cap: r.cap, measured_by: r.measured_by, calibration });
  if (!Array.isArray(chain))
    return { ok: false, why: `the OCR member's own provenance was refused: ${chain.detail}` };

  /* The I2 text shape, unchanged — a Tier-3 producer emits what Tier 1 and
     Tier 2 emit, so FRAMEWORK's reader consumes all three identically and this
     item adds no fourth text shape (I2 1.1.0, and D-164's lesson). */
  const text = {
    document: outPages.map((p) => p.text).filter(Boolean).join("\n"),
    pages: outPages.map((p) => ({ page: p.page, text: p.text, undetermined: p.undetermined })),
    undetermined: outPages.flatMap((p) => p.undetermined),
    counts: { chars: outPages.reduce((n, p) => n + p.text.length, 0), undetermined },
    regions: outPages.flatMap((p) => p.regions),
  };
  const note = anchorless
    ? `${anchorless} region(s) the OCR member returned carried no checkable image region and were `
      + `dropped rather than recorded`
    : null;
  return { ok: true, text, chain, kept, floored, note };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type" } });

    /* The API lives under /api so the instance can serve its own setup UI at
       the root. A bare GET of / with no op parameter is a person in a browser
       and gets the page. The legacy root query API (/?op=...) still answers,
       for the one deployment that predates this, and should be dropped once
       that instance is gone. */
    /* The signing page, served by the group's own instance. It is the same
       self-contained file that ships in tools/, with no network calls, and
       it holds no secret: keys are made and used in the visitor's browser.
       Serving it means the instance can LINK to it, which is the difference
       between a step an ordinary person can follow and one they cannot. */
    /* Which version is this? A plain GET, no token, no op parameter, no JSON
       field to know the name of. `op=bootstrap` has always carried the version
       and always will, but "call bootstrap and read the version field" is not
       something anyone should have to be told, and the question gets asked
       after every update. */
    if (req.method === "GET" && (url.pathname === "/version" || url.pathname === "/version/"))
      return new Response((env.VERSION || "0.0.0") + "\n",
        { headers: { "content-type": "text/plain; charset=utf-8",
                     "access-control-allow-origin": "*" } });
    if (req.method === "GET" && (url.pathname === "/sign" || url.pathname === "/sign/"))
      return new Response(SIGN_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    if (req.method === "GET" && !url.pathname.startsWith("/api")
        && (url.pathname === "/" || url.pathname === "") && !url.searchParams.get("op"))
      return new Response(SETUP_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });

    const path = url.pathname.replace(/^\/api\/?/, "/");
    const op = url.searchParams.get("op") || path.slice(1) || "selftest";
    const spec = OPS[op];
    if (!spec) return json({ ok: false, error: "unknown op", op }, 400);

    /* Unauthenticated by design. Each one gates itself. */
    if (spec.classes === null) {
      const fp = await fingerprint(env.ADMIN_TOKEN);
      const stub = env.STORE.get(env.STORE.idFromName("bio"));
      /* Claiming and logging in are pinned to `bio` above, because an instance
         has ONE identity and there is nothing to claim in a scratch namespace.
         The INVITATION ops are different: the token IS the authority and it
         exists in exactly one store, so an unauthenticated caller naming a
         store gains nothing they do not already have, and pinning them to `bio`
         made an invitation created in `scratch` unredeemable. `memberadd` in
         `scratch` answered ok and handed over a token that could never work,
         which is a silent dead end and made the scratch namespace useless for
         rehearsing the member surface. Found against the deployed plane while
         closing D-41, not by the suite. */
      const invStub = url.searchParams.get("store") === SCRATCH
        ? env.STORE.get(env.STORE.idFromName(SCRATCH)) : stub;
      if (op === "claim") {
        const body = await req.json().catch(() => ({}));
        if (!env.ADMIN_TOKEN) return json({ ok: false, error: "instance has no bootstrap credential set" }, 409);
        if (!(await liveToken(env.ADMIN_TOKEN)))
          return json({ ok: false, error: "bootstrap credential is a published repository value and can never arm a claim; set a fresh ADMIN_TOKEN in the Cloudflare dashboard" }, 409);
        if (body.bootstrapToken !== env.ADMIN_TOKEN)
          return json({ ok: false, error: "bootstrap credential does not match" }, 403);
        const r = await stub.fetch(new Request(`http://do/claim?fp=${fp}`, {
          method: "POST", body: JSON.stringify({ role: "admin", password: body.password }) }));
        return json(await r.json(), 200);
      }
      if (op === "login") {
        const body = await req.json().catch(() => ({}));
        const r = await stub.fetch(new Request("http://do/login", {
          method: "POST", body: JSON.stringify({ role: body.role || "admin", password: body.password }) }));
        return json(await r.json(), 200);
      }
      if (op === "invitelook") {
        const body = await req.json().catch(() => ({}));
        const r = await invStub.fetch(new Request("http://do/invitelook", {
          method: "POST", body: JSON.stringify(body) }));
        return json(await r.json(), 200);
      }
      if (op === "enroll") {
        const body = await req.json().catch(() => ({}));
        const r = await invStub.fetch(new Request("http://do/enroll", {
          method: "POST", body: JSON.stringify(body) }));
        return json(await r.json(), 200);
      }
      /* 7a. Anyone, no token, no session. The DO consults only the
         published projection. */
      if (op === "verify") {
        const sha = (url.searchParams.get("sha256") || "").toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(sha))
          return json({ ok: false, error: "verify requires sha256=<64 lowercase hex>" }, 400);
        /* REC-52, SITE (a). This read used to be
             `const out = await r.json(); return json({ ok: true, ...out.result }, 200);`
           with no look at `out.ok`, so a store failure left the plane as an
           HTTP 200 SUCCESS carrying nothing — no `published`, no `sha256`, no
           `matches` — and D-197's public verification surface rendered that as
           "NOT PUBLISHED … a hash that was never ratified and a hash that never
           existed are the same answer here, deliberately", a sentence that is
           true of a real absence and false of a silence. */
        const out = await doAnswer(stub.fetch(new Request(`http://do/verify?sha256=${sha}`)));
        if (!out.answered) return storeSilent("verify");
        return json({ ok: true, ...out.result }, 200);
      }
      /* Section 8.2. Anyone, no token, no session, and nothing to withhold.
         Published material is content-addressed and its hashes are public, so
         any member or any stranger rebuilds and independently verifies the
         published record without this instance's cooperation, permission, or
         continued existence. Reads the published projection ONLY, exactly as
         op=verify above does, which is the whole safety of an open endpoint:
         working material is never consulted, so there is nothing to leak. */
      if (op === "publishedmanifest") {
        /* REC-52, and this one was NOT in the item's scope — the sweep found
           it. The re-wrap read `result: (await r.json()).result`, so a store
           failure produced `{ok:true, result:undefined}`, and `JSON.stringify`
           DROPS an undefined value: `{ok:true}` at HTTP 200 again, by a
           different route from section 7a's spread. This is the op that fills
           the published INDEX, so the rendered consequence was the whole
           record rather than one hash — which is the shape UI-37 measured as
           the worst of its three. The WRAPPED envelope is preserved on the
           success path (auth-surface.test.mjs pins that it is not flattened). */
        const out = await doAnswer(stub.fetch(new Request("http://do/publishedmanifest")));
        if (!out.answered) return storeSilent("publishedmanifest");
        return json({ ok: true, result: out.result }, 200);
      }

      /* ============================================================         REC-22: THE PUBLIC READ PATH. Anyone, no token, no session, and — the
         part that matters — nothing withheld, because there is nothing here
         that was not deliberately published.

         WHY THIS IS SAFE WITHOUT A CREDENTIAL, stated once for both ops: every
         byte either op can reach comes from the published projection —
         published_bundles, published_shas, published_edges, and the PUBLISHED
         bucket, which the ratification act is the only writer of. The fence is
         structural in two independent layers (a table set and a bucket
         boundary), so it does not depend on a predicate being remembered. That
         is the property schema.mjs states those tables exist for, and REC-30's
         sweep classifies both ops as deliberately ungated for exactly it.

         PINNED TO `bio`, like op=verify and op=publishedmanifest above: an
         instance has ONE published record. A probe's `scratch` namespace has its
         own Durable Object and its own PUBLISHED prefix and is therefore NOT
         readable here, which is deliberate — rehearsing a publication must not
         put anything on the public surface. */
      /* ---- CASE-4 / DEC-72: op=caseflags ----
         WHICH PUBLISHED CASES ARE CARRYING A STALE PIN, AND WHICH OWNING
         PROJECTS HAVE ACTED. Placed with the public read path above and pinned
         to `bio` for its reason: every fact in the answer is already on the
         public surface, and an instance has ONE published record, so a probe's
         scratch namespace is deliberately not readable here.

         `case=` OR `target=` OR NEITHER, and neither is a whole-store sweep of
         the FLAG TABLE only — bounded by the number of revisions that have ever
         been made to a published member, which is a small number by
         construction and never a walk of the corpus. */
      if (op === "caseflags") {
        const q = new URLSearchParams();
        const cid = (url.searchParams.get("case") || "").trim();
        const tgt = (url.searchParams.get("target") || "").trim();
        if (cid) q.set("case", cid);
        if (tgt) q.set("target", tgt);
        if (url.searchParams.get("outstanding") === "1") q.set("outstanding", "1");
        if (url.searchParams.get("limit")) q.set("limit", url.searchParams.get("limit"));
        const fOut = await doAnswer(stub.fetch(`http://do/caseflags?${q}`));
        if (!fOut.answered) return storeSilent("caseflags");
        return json({ ok: true, result: fOut.result }, 200);
      }

      /* ===== CASE-5b / DEC-72: THE CASE-LEVEL SIGNING CEREMONY ================

         THE READ. A member cannot sign what they have not read, and the container
         manifest's constraint — *a case-level signature would be a signature over
         something nobody reviewed* — is answered by this op existing and by the
         document it hands back being the WHOLE document rather than a summary of
         it. The sha in the answer is the sha the signature covers. */
      if (op === "casedocument") {
        const caseId = url.searchParams.get("case") || "";
        const ed = url.searchParams.get("edition");
        if (!caseId || !ed)
          return json({ ok: false, reason: "MALFORMED",
                        detail: "casedocument requires case=<CASE-YYYY-NNNN> and edition=<n>" }, 400);
        /* REC-130: the viewer is STAMPED here from the credential and never read
           from the request — the inner URL is built from nothing of the caller's
           but the two keys. The store answers an unsigned document to standing
           and answers everybody else exactly as it answers a case that does not
           exist. */
        const reader = await caseReader(url, env, "bio");
        if (reader.silent) return storeSilent(reader.silent);
        /* REC-126 / IC-145: A LIVE GRANT HOLDER is the second party §6A.2's
           precondition admits to an unsigned document. The secret is HASHED HERE
           and only its fingerprint crosses to the store, which judges it through
           the review copy's one live-grant predicate. Absent, the parameter is
           not sent at all and the answer is REC-130's, unchanged. */
        const docSecret = url.searchParams.has("secret") ? await sha256Hex(url.searchParams.get("secret") || "") : "";
        const out = await doAnswer(stub.fetch(
          `http://do/casedocument?case=${encodeURIComponent(caseId)}&edition=${encodeURIComponent(ed)}`
          + `&viewer=${encodeURIComponent(reader.viewer)}`
          + (docSecret ? `&secretSha=${docSecret}` : "")));
        if (!out.answered) return storeSilent("casedocument");
        const r = out.result;
        /* THE VERDICT IS DECLARED AS A LITERAL, FIRST, rather than inherited
           from the spread. D-240's detector grades a json() site by its first
           boolean-shaped property, and an answer whose verdict arrives only
           inside a spread reads as UNCLASSIFIED — which is a place this
           detector'"'"'s own subject could hide. The spread still carries the
           store'"'"'s own `ok`, so the two cannot disagree. */
        if (!r?.ok) return json({ ok: false, ...r }, 404);
        return json({ ok: true, ...r,
                      /* THE STATEMENT TO SIGN, PRINTED. It is the exact bytes
                         `caseRatifyStatement` builds, handed to the member so the
                         signer page, the wizard and a member at a terminal all
                         sign the same thing — the same service `op=ratify`'s own
                         clients get, one altitude up. */
                      sign: { namespace: NS_RATIFY,
                              statement: new TextDecoder().decode(
                                caseRatifyStatement(r.case_id, r.edition, r.doc_sha)) } });
      }

      /* ===== REC-126 / DEC-31 / IC-145: THE REVIEW COPY'S READ AND COMMENT ======

         UNGATED, because the reader it exists for holds no credential of this
         instance. Two doors and nothing else:
           - `secret=` — a RECIPIENT. The value is HASHED HERE and only the
             fingerprint crosses to the store (`aicredentialmint`'s rule: nothing
             past this line has ever held the value). ANY presented value takes
             this door, including an empty or malformed one, so a malformed secret
             travels the same path as a revoked one and meets the same bytes.
           - otherwise the caller's session or credential, resolved by
             `caseReader` exactly as the unsigned case document resolves it, and
             the store asks standing in the producing project.
         Every caller who is neither a live grant's holder nor a member with
         standing receives ONE answer — the store's `#noReviewCopy`, built from no
         argument — at ONE status, so revoked, never-issued, malformed, a draft
         that does not exist and a draft the caller cannot see are the same bytes.
         The inner URL is built from nothing of the caller's but `draft`. */
      if (op === "reviewcopy" || op === "reviewcomment") {
        const bySecret = url.searchParams.has("secret");
        const q = new URLSearchParams();
        const draftParam = (url.searchParams.get("draft") || "").trim();
        if (draftParam) q.set("draft", draftParam);
        if (op === "reviewcopy" && url.searchParams.get("limit")) q.set("limit", url.searchParams.get("limit"));
        if (bySecret) {
          q.set("bySecret", "1");
          q.set("secretSha", await sha256Hex(url.searchParams.get("secret") || ""));
        } else {
          const reader = await caseReader(url, env, "bio");
          if (reader.silent) return storeSilent(reader.silent);
          q.set("viewer", reader.viewer);
        }
        let commentBody = null;
        if (op === "reviewcomment") {
          let b = {};
          try { b = req.method === "POST" ? JSON.parse((await req.text()) || "{}") : {}; } catch { b = {}; }
          commentBody = JSON.stringify({ text: typeof b?.text === "string" ? b.text : "" });
        }
        const out = await doAnswer(stub.fetch(`http://do/${op}?${q}`,
          commentBody === null ? undefined : { method: "POST", body: commentBody }));
        if (!out.answered) return storeSilent(op);
        const r = out.result;
        if (!r?.ok) return json({ ok: false, ...r }, r?.reason === "NO_REVIEW_COPY" ? 404 : 400);
        return json({ ok: true, ...r }, 200);
      }

      if (op === "publishedcase" || op === "publishedbytes") {
        const shaParam = (url.searchParams.get("sha256") || "").toLowerCase();
        const pubKey = (sha) => `${PUBLISHED_STORE}/published/${sha}`;
        const pubBytes = async (sha) => {
          if (typeof env.PUBLISHED?.get !== "function") return null;
          const o = await env.PUBLISHED.get(pubKey(sha));
          return o ? new Uint8Array(await o.arrayBuffer()) : null;
        };

        if (op === "publishedbytes") {
          if (!/^[0-9a-f]{64}$/.test(shaParam))
            return json({ ok: false, error: "publishedbytes requires sha256=<64 lowercase hex>. This surface "
                        + "answers BY HASH and never by path, so there is nothing to walk." }, 400);
          /* THE GUARD, and it is the whole op. A sha is served if and only if a
             published_shas row names it. Everything else 404s with the SAME body
             — a hash that was never ratified and a hash that never existed are
             one answer, so the absence of a document cannot be inferred from the
             shape of a refusal.

             It is NOT redundant with the bucket boundary and the suite proves
             that: point PUBLISHED at the working bucket (a plausible installer
             slip that nothing else in the plane would catch) and this guard is
             the only thing standing between an anonymous caller and the working
             corpus. */
          /* REC-52, a THIRD site the item did not name and the sweep found.
             `!v` and `!v.published` used to be one test, so a store that never
             answered fell into `notFound()` — and `notFound()` is not a shrug,
             it is a CLAIM: "no published part answers to that hash … a hash
             that was never ratified and a hash that never existed are the same
             answer here, deliberately." That clause is exactly what makes the
             sentence convincing, and it is true only of a real absence. The
             two are now separated: a silence is a silence, and the guard below
             keeps its whole meaning for the answers that reach it. */
          const vOut = await doAnswer(stub.fetch(`http://do/verify?sha256=${shaParam}`));
          if (!vOut.answered) return storeSilent("publishedbytes");
          const v = vOut.result;
          const notFound = () => json({ ok: false, reason: "NOT_FOUND", sha256: shaParam,
            detail: "no published part answers to that hash. A hash that was never ratified and a hash that "
                  + "never existed are the same answer here, deliberately." }, 404);
          if (!v || !v.published) return notFound();
          if (typeof env.PUBLISHED?.get !== "function")
            return json({ ok: false, reason: "NO_PUBLISHED_STORE",
              detail: "this instance has no published object store configured, so its published bytes are "
                    + "not servable. The hash is genuine and this instance cannot hand over the bytes." }, 503);

          /* DEC-34, THE CONTAINER. The manifest's own hash IS the container's
             identity — it names and hashes every part — so the zip is addressed
             by that hash like everything else here, and `format=zip` on a hash
             that is not a manifest is refused by NAME rather than quietly
             serving the part instead. */
          const wantZip = (url.searchParams.get("format") || "") === "zip";
          const isManifest = v.matches.some((m) => m.kind === "manifest");
          if (wantZip && !isManifest)
            return json({ ok: false, reason: "NOT_A_CONTAINER", sha256: shaParam,
              detail: "format=zip serialises a case CONTAINER, which is addressed by its MANIFEST's hash. "
                    + "This hash names a part inside a container, not a container." }, 400);
          const raw = await pubBytes(shaParam);
          if (!raw) return notFound();
          if (!wantZip) {
            const m = v.matches[0] || {};
            return new Response(raw, { status: 200, headers: {
              "content-type": "application/octet-stream", "access-control-allow-origin": "*",
              "x-published-sha256": shaParam, "x-published-kind": m.kind || "",
              /* The PATH is disclosed on the way OUT and is never accepted on the
                 way IN: a reader saving the file deserves its name; a caller
                 asking by path would be walking the corpus. */
              "content-disposition": `attachment; filename="${(m.path || shaParam).split("/").pop().replace(/[^\w.\-]/g, "_")}"`,
            } });
          }
          let manifest = null;
          try { manifest = JSON.parse(new TextDecoder().decode(raw)); } catch { manifest = null; }
          if (!manifest || typeof manifest !== "object")
            return json({ ok: false, reason: "MANIFEST_UNREADABLE", sha256: shaParam }, 500);
          const built = await containerEntries(manifest, raw, pubBytes);
          if (!built.ok) return json({ ok: false, ...built }, 409);
          const zip = serialiseContainer(built.entries);
          if (!zip.ok) return json({ ok: false, ...zip }, 413);
          const zipSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", zip.bytes))]
            .map((x) => x.toString(16).padStart(2, "0")).join("");
          return new Response(zip.bytes, { status: 200, headers: {
            "content-type": "application/zip", "access-control-allow-origin": "*",
            "x-manifest-sha256": shaParam, "x-container-sha256": zipSha,
            "x-container-parts": String(built.entries.length),
            "content-disposition": `attachment; filename="${String(manifest.case || "case").replace(/[^\w.\-]/g, "_")}`
                                 + `-edition-${Number(manifest.edition) || 1}.zip"`,
          } });
        }

        /* ---- op=publishedcase ---- */
        const id = url.searchParams.get("id");
        if (!id && !/^[0-9a-f]{64}$/.test(shaParam))
          return json({ ok: false, error: "publishedcase requires id=<bundle id> (with an optional "
                      + "&edition=N, latest by default) or sha256=<the bundle sha of an edition>" }, 400);
        const q = new URLSearchParams();
        if (id) q.set("id", id);
        if (url.searchParams.get("edition")) q.set("edition", url.searchParams.get("edition"));
        /* D-309 / IC-74: a finding may serve many cases (DEC-72 clause 6), so a
           finding id alone can be an ambiguous question and the store refuses it
           `FINDING_IN_SEVERAL_CASES` naming every candidate. This forwards the
           reader's ANSWER to that question. It is a resolution aid and never an
           assertion: the store still resolves the case from the RECORD and only
           uses this to pick among memberships the record already holds, so a
           caseId a caller invents reaches nothing. */
        if (url.searchParams.get("caseId")) q.set("caseId", url.searchParams.get("caseId"));
        if (/^[0-9a-f]{64}$/.test(shaParam)) q.set("sha256", shaParam);
        /* REC-52, SITE (b). This read used to be
             `if (!c || !c.ok) return json({ ok: false, ...(c || { reason: "NOT_PUBLISHED" }) }, 404);`
           — the plane MANUFACTURING a substantive claim about the record out
           of a failure to answer. `NOT_PUBLISHED` is the store's own word for
           a real absence, and it carries the store's own sentence with it
           (store.mjs states it, and preauth-vocabulary.test.mjs reads it out
           of there rather than typing a copy); minting the bare code here
           produced a refusal that LOOKS like that answer and is not one.
           THE STORE'S OWN `NOT_PUBLISHED` IS UNTOUCHED and still reaches the
           caller verbatim on the branch below — the two must not collapse in
           either direction, and both directions have their own arm. */
        const cOut = await doAnswer(stub.fetch(`http://do/publishedcase?${q}`));
        if (!cOut.answered) return storeSilent("publishedcase");
        const c = cOut.result;
        /* MEASURED, not assumed: `Store.publishedCase` returns an object on
           every path — its own `{ok:false, reason:"NOT_PUBLISHED", detail}`
           when nothing answers. So `!c` is a store that answered with nothing
           at all, which is a silence wearing an answer's envelope and gets the
           silence's reply rather than the record's. */
        if (!c) return storeSilent("publishedcase");
        if (!c.ok) return json({ ok: false, ...c }, 404);

        /* REC-44 / DEC-44: RENDERED PER FINDING, PLURAL. This surface used to
           render one body, one basis and one frozen pair because a case was
           assumed to be one inquiry. A case is a container over one or MORE
           findings, so the body and the basis are rendered for EACH of them and
           the frozen pair travels with the finding it belongs to. There is no
           case-level `strength` anywhere in this answer and there must never be
           one — composing two findings' strengths into one letter is R2's
           forbidden composition arriving at case altitude, which is exactly what
           DEC-44's own negative control exists to catch. */
        const renderFinding = async (fnd) => {
          /* D-1: THE BODY COMES FROM THE SAME BYTES AS THE FROZEN STRENGTH. The
             document is fetched from the published bucket by the finding's own
             bundle_sha, so what a reader is shown and what the group signed cannot
             be two different documents — which is precisely the overclaim D-1
             refuses (rendering a frozen strength beside a live working body). An
             unreadable body is STATED as unavailable with its reason; it is never
             substituted from the working corpus, which would be the same overclaim
             by a shorter route. */
          const md = await pubBytes(fnd.bundle_sha);
          const text = md ? new TextDecoder().decode(md) : null;
          const fm = text ? (parseFrontmatter(text).data || {}) : null;
          const body = text
            ? { state: "published", from_sha: fnd.bundle_sha,
                question: sectionText(text, "## Question"),
                conclusion: sectionText(text, "## Conclusion"),
                falsifies: sectionText(text, "## What Would Falsify This"),
                excludes: sectionText(text, "## What This Excludes"),
                /* BOTH, because the document says it in two places and they are not
                   the same statement. The FRONTMATTER carries what op=conclude
                   authored and what the catalog gates — that is the conclusion of
                   record. The SECTION carries the prose beside it, which is where a
                   division writes its account and where a person reads. Returning
                   only one of them would either drop the gated claim or drop the
                   explanation; a renderer needs to know which is which. */
                /* REC-117 / BOB 2026-09-17, AND THIS SURFACE IS THE ONE HE NAMED.
                   "a member can override either temporarily or IN THE PUBLISHED
                   RECORD" — so the override travels into the signed bytes and is
                   rendered from them here, beside the falsifier it stands in for.
                   `falsifier_override` is `{by, at}` or NULL and never absent: a
                   renderer that had to tell the two cases apart by a missing key
                   would be inferring the condition, and the whole of this item is
                   that the condition is STATED. A published finding whose
                   falsifier is empty and whose override is null is a document
                   that predates this item or was never gated — NOT a silent
                   override, and a renderer must not print one as the other. */
                authored: { conclusion: typeof fm?.conclusion === "string" ? fm.conclusion : null,
                            falsifier: typeof fm?.falsifier === "string" ? fm.falsifier : null,
                            falsifier_override:
                              (typeof fm?.falsifier_override_by === "string" && fm.falsifier_override_by.trim()
                               && typeof fm?.falsifier_override_at === "string" && fm.falsifier_override_at.trim())
                                ? { by: fm.falsifier_override_by.trim(), at: fm.falsifier_override_at.trim() }
                                : null },
                detail: "`authored` is what op=conclude wrote into the frontmatter and what the gate holds "
                      + "the finding to; the section fields are the prose printed beside it in the signed "
                      + "bytes. `falsifier_override`, when it is not null, is the member who recorded that "
                      + "NO falsifier could be stated for this finding, and when they did so." }
            : { state: "unavailable", from_sha: fnd.bundle_sha,
                reason: typeof env.PUBLISHED?.get === "function" ? "OBJECT_MISSING" : "NO_PUBLISHED_STORE",
                detail: "this instance cannot hand over the bytes of that edition, so its conclusion is not "
                      + "rendered here. It is NOT read from the working record instead: the frozen strength "
                      + "and the rendered body must come from the same bytes." };

          /* THE BASIS LEGS, from the signed bytes, each one classified as a leg
             this surface can SERVE or one it can only NAME. `served` is decided
             against the published projection and nothing else, so a leg resting on
             working material is named and never resolved; the cited EDITION's
             frozen pair travels with it (DEC-12: a leg names an edition and does
             not silently follow a newer one). A leg rests on a FINDING, never on a
             case — C-21.2's altitude, which DEC-44 leaves exactly where it was. */
          const legs = Array.isArray(fm?.basis) ? fm.basis.filter((l) => l && typeof l.target === "string") : [];
          let registry = {};
          if (legs.length) {
            const ids = [...new Set(legs.map((l) => l.target))];
            /* REC-52, a FIFTH site and the one that argues hardest for sweeping
               rather than fixing the two the item named. `registry = (rt &&
               rt.registry) || {}` meant a store that never answered produced an
               EMPTY registry, and an empty registry makes every leg resolve to
               `served: false` with the sentence "this leg is NAMED and not
               served: what it rests on is not in the published record". That is
               a substantive claim about the published record — the same defect
               as site (b), reached by a `||` on a different line, and it would
               have been rendered as a finding's own basis on the surface a
               stranger arrives at. An empty registry is now only ever the
               store's own answer. */
            const rtOut = await doAnswer(stub.fetch(
              `http://do/publishedtargets?ids=${encodeURIComponent(ids.join(","))}`));
            if (!rtOut.answered) throw new StoreSilent("publishedcase/publishedtargets");
            const rt = rtOut.result;
            registry = (rt && rt.registry) || {};
          }
          const basis = legs.map((l) => {
            const reg = registry[l.target] || null;
            const named = l.target_edition != null ? String(l.target_edition) : null;
            const cited = reg ? (named ? reg.editions[named] : reg.editions[String(reg.latest)]) : null;
            return {
              target: l.target, role: l.role ?? "supports",
              grade: l.grade ?? null, grade_axis: l.grade_axis ?? null, grade_source: l.grade_source ?? null,
              target_edition: l.target_edition ?? null,
              served: !!cited,
              cited_edition: cited
                ? { edition: cited.edition, title: cited.title, bundle_sha: cited.bundle_sha,
                    ratified_at: cited.ratified_at, case_id: cited.case_id ?? null,
                    capture: cited.capture, connection: cited.connection,
                    /* MK-2 / IC-142: present only where the edition froze one. */
                    ...(cited.testimony ? { testimony: cited.testimony } : {}) }
                : null,
              detail: cited
                ? "this leg rests on a published finding, so it can be served from this surface."
                : "this leg is NAMED and not served: what it rests on is not in the published record, so this "
                + "surface can say the finding cites it and can hand over nothing of it.",
            };
          });
          return { ...fnd, object_type: normalizeType(fm?.object_type) ?? null, body, basis,
                   bytes: `op=publishedbytes&sha256=${fnd.bundle_sha}` };
        };
        const findings = [];
        try {
          for (const fnd of c.findings || []) findings.push(await renderFinding(fnd));
        } catch (e) {
          /* REC-52: a store silence inside the renderer refuses the WHOLE read
             rather than serving a partially-rendered case, because a case
             rendered from a registry that was never consulted asserts things
             about its own basis that nobody checked. Anything else is re-thrown
             untouched — a real crash must not arrive dressed as a silence. */
          if (e instanceof StoreSilent) return storeSilent(e.op);
          throw e;
        }

        return json({ ok: true, ...c, findings,
          verification: {
            container: c.manifest_sha ? `op=publishedbytes&sha256=${c.manifest_sha}&format=zip` : null,
            manifest: c.manifest_sha ? `op=publishedbytes&sha256=${c.manifest_sha}` : null,
            findings: findings.map((f) => ({ bundle_id: f.bundle_id,
                                             bytes: `op=publishedbytes&sha256=${f.bundle_sha}` })),
            detail: "tamper-EVIDENT, not tamper-proof: every part is named by sha256 in the manifest, the "
                  + "manifest answers by its own sha256, and EACH FINDING's signature covers that finding's "
                  + "own bundle sha. Nothing here prevents a modified copy; everything here makes one "
                  + "detectable by anyone holding it, without this instance's cooperation.",
          } }, 200);
      }
      /* 7b. Anyone, no token, no session. Size-capped, rate-limited, and
         confined to the inbox namespace: payload bytes land under
         bio/inbox/<sha256> in the working bucket and nowhere else, the way
         probe is confined to scratch. Nothing is read back out except by a
         signed-in member. */
      if (op === "knock") {
        if (req.method !== "POST") return json({ ok: false, error: "knock is a POST" }, 405);
        const raw = await req.arrayBuffer();
        if (raw.byteLength > KNOCK.maxBytes + 4096)
          return json({ ok: false, reason: "TOO_LARGE", maxBytes: KNOCK.maxBytes }, 413);
        let body; try { body = JSON.parse(new TextDecoder().decode(raw)); } catch { body = null; }
        if (!body || (typeof body.contentB64 !== "string" && typeof body.contentText !== "string"))
          return json({ ok: false, error: "knock requires contentB64 or contentText, plus optional note and contact" }, 400);
        let bytes;
        try {
          bytes = body.contentB64 !== undefined
            ? Uint8Array.from(atob(body.contentB64), (c) => c.charCodeAt(0))
            : new TextEncoder().encode(body.contentText);
        } catch { return json({ ok: false, error: "contentB64 is not valid base64" }, 400); }
        if (bytes.length === 0) return json({ ok: false, reason: "EMPTY" }, 400);
        const r2 = typeof env.CAPTURES?.put === "function";
        const cap = r2 ? KNOCK.maxBytes : KNOCK.maxInline;
        if (bytes.length > cap)
          return json({ ok: false, reason: "TOO_LARGE", maxBytes: cap,
                        detail: r2 ? undefined : "this instance stores knocks inline; large material needs its evidence storage configured" }, 413);
        const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
          .map((x) => x.toString(16).padStart(2, "0")).join("");
        const win = Math.floor(Date.now() / KNOCK.windowMs);
        const ipHash = (await fingerprint(req.headers.get("cf-connecting-ip") || "unknown")) || "unknown";
        const knockId = `KNOCK-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}`;
        const rec = await doAnswer(stub.fetch(new Request("http://do/knock", {
          method: "POST", body: JSON.stringify({
            knockId, sha256: sha, bytes: bytes.length,
            content: r2 ? null : new TextDecoder().decode(bytes),
            inR2: r2, note: body.note, contact: body.contact,
            ipBucket: `ip:${ipHash}:${win}`, globalBucket: `all:${win}`,
            perIpLimit: KNOCK.perIp, globalLimit: KNOCK.global,
          }) })));
        /* REC-52: `if (!rec.result?.ok) return json({ ok:false, ...rec.result }, 429)`
           sent a store silence back as a bare `{ok:false}` at HTTP 429 — the
           TOO-MANY-REQUESTS status, which is itself a substantive claim: it
           tells an anonymous member of the public that they knocked too often,
           when in fact nobody counted. The rate refusal the store really sends
           is unchanged and still arrives whole. */
        if (!rec.answered) return storeSilent("knock");
        if (!rec.result?.ok) return json({ ok: false, ...rec.result }, 429);
        if (r2) await env.CAPTURES.put(`bio/inbox/${sha}`, bytes,
          { sha256: await crypto.subtle.digest("SHA-256", bytes) });
        return json({ ok: true, knockId, sha256: sha, bytes: bytes.length,
                      received: "Your material is in the group's inbox awaiting member review." }, 200);
      }
      /* REC-52: the same spread as section 7a's. A store silence used to leave
         a `{ok:true}` carrying the service name, the version and the bootstrap
         flag and NOTHING the store knows — an instance answering "here is what
         I am" while unable to say anything about itself. The installer and
         `newgroup` both read this op (measured at newgroup/src/index.mjs:364
         and :631), so the false success reached a caller deciding whether an
         instance was ready. */
      const out = await doAnswer(stub.fetch(new Request(`http://do/bootstrap?fp=${fp}`)));
      if (!out.answered) return storeSilent("bootstrap");
      return json({ ok: true, service: "bio-plane", version: env.VERSION || "0.0.0",
                    bootstrapConfigured: await liveToken(env.ADMIN_TOKEN), ...out.result }, 200);
    }

    let cls = await classify(url.searchParams.get("token"), env);
    let viaSession = false;
    let sessMember = null, sessRights = null, sessCaps = null;
    /* REC-132: the two halves of `resolveSession`, set with `sessMember` and never
       apart from it. `sessViewer` goes wherever a VISIBILITY gate is stamped;
       `sessIdentity` wherever the question is WHO. */
    let sessViewer = null, sessIdentity = null;
    let aiCred = null;
    /* PL-11 / IS-5 / D-199 (2) — THE `ai` CLASS RESOLVES AGAINST THE RECORD,
       AND THAT IS THE DETERMINATION RATHER THAN AN IMPLEMENTATION DETAIL.
       `classify()` above compared four env bindings and found nothing; this
       block asks the store. A settings row "would be a way to change the
       standard with nothing to read afterwards" (DEC-17, transplanted by
       D-199 (2)), so what an agent may reach is a row a member wrote, with
       their name and the date on it.

       THE SHAPE IS CHECKED FIRST so a session token never reaches this lookup
       and an agent credential never falls through into the session one. Two
       different failures deserve two different answers.

       REC-52: a store silence is NOT "this credential is unknown". Answering
       401 on a store we could not consult would be the plane converting its own
       failure into a statement about who somebody is — the exact class REC-52
       closed, and the session block below already refuses to make it. */
    if (!cls) {
      const t = url.searchParams.get("token");
      if (t && AI_TOKEN_SHAPE.test(t)) {
        const st = env.STORE.get(env.STORE.idFromName("bio"));
        const sha = await sha256Hex(t);
        const aOut = await doAnswer(st.fetch(`http://do/aicredentiallook?sha=${sha}`));
        if (!aOut.answered) return storeSilent("aicredentiallook");
        if (aOut.result?.found) { cls = "ai"; aiCred = aOut.result.credential; }
      }
    }
    /* A browser signed in with a password holds a session token, not a
       machine credential. The write arc opens INTAKE to sessions: promote,
       lease, allocid, capture, ratify, and inbox review run through the
       same gated paths as machine callers, with authorship stamped
       server-side from the session identity so a browser can never claim
       to be someone else. Everything outside SESSION_OPS, purge above all,
       still requires a machine credential. capture is nominally mutating
       because of its PUT path; its GET is a read and is treated as one. */

    /* DEC-49 REGION is-admission
     *
     * THE ADMISSION GATE (REC-79 / C-38) — every refusal a caller meets BEFORE
     * their op runs, and the first thing anybody, signed in or not, ever meets.
     *
     * FOUR OF THE SIX REFUSALS IN HERE CARRIED NO CODE AT ALL until this region
     * was drawn. They answered with a bare `error:` sentence and nothing a
     * surface could key on, which made them invisible to DEC-49's guard and
     * absent from its 427-code census — a census of CODES cannot count a refusal
     * that has none. They were found by GOVERNING the site rather than reading
     * it: the guard's outcome reader could not see `return json({ … }, 403)` at
     * all, so this region reported nothing to judge until that was widened.
     *
     * Every code below is a STRING LITERAL at its site, and `admissionRow` reads
     * the C-number and the canned translation from the ONE row, so the
     * `translation: undefined` DEC-49 was written to prevent cannot be spelled
     * here — the helper throws instead.
     *
     * THE SPAN, and why it starts where it does. It opens at the session-token
     * lookup and closes after the scope refusal, because that is the whole of
     * "may this caller act at all"; the op's own work begins below. Both markers
     * sit at the SAME brace depth on purpose (REC-71's wrong-span failure).
     *
     * WHAT IS IN THE SPAN AND DELIBERATELY NOT GOVERNED, stated rather than left
     * for the next reader to wonder about: `return storeSilent("session")`. It
     * is not an admission refusal — it is the plane declining to make ANY claim
     * about who somebody is when the store could not be reached (REC-52), which
     * is a fact about the instance and not about the caller. It carries its own
     * code, `STORE_DID_NOT_ANSWER`, held in a CONSTANT rather than written as a
     * literal — so no source-text matcher sees it and it is not in the census at
     * all. REC-79 names that rather than fixing it; it is D-236's class, one
     * layer out, and it belongs to the partition arm's own residue. */
    if (!cls) {
      const t = url.searchParams.get("token");
      if (t && /^[0-9a-f]{64}$/.test(t)) {
        const st = env.STORE.get(env.STORE.idFromName("bio"));
        /* REC-52, and this is the class arriving at the AUTHENTICATION path,
           which is why it is converted rather than left as an internal read.
           `r?.result?.session` swallowed a store silence into `undefined`, and
           the code below then refuses the caller BY NAME — "this operation
           requires a machine credential", or the generic session refusal. So a
           store that could not be reached was reported to a signed-in member as
           a fact about their credential. The record makes no claim about who
           somebody is when it could not look. */
        const sOut = await doAnswer(st.fetch(`http://do/session?t=${t}`));
        if (!sOut.answered) return storeSilent("session");
        const sess = sOut.result?.session;
        if (sess) {
          const kind = sess.role === "admin" ? "admin" : "member";
          /* Section 8.1, checked BEFORE the generic session refusal so the
             answer says the right thing. The generic message is "this operation
             requires a machine credential", which is true and misleading: a
             MEMBER_TOKEN machine credential cannot export either. What is
             required is the ADMIN_TOKEN-class credential specifically, and for a
             security-critical op the caller deserves the actual rule. */
          if (op === "export")
            return json({ ok: false, reason: "ROOT_OF_TRUST_REQUIRED", ...admissionRow("ROOT_OF_TRUST_REQUIRED"), op,
              detail: "a full working-corpus export needs the ADMIN_TOKEN-class credential itself, not a "
                    + "signed-in session, and not in-app administrator status. A session is derived from a "
                    + "password; the root of trust is the token held in the hosting account. This refuses "
                    + "the founder's own browser too, which is the one place in this system where being "
                    + "the founder is not enough. The published record needs no credential at all: see "
                    + "op=publishedmanifest." }, 403);
          /* `error` IS KEPT BYTE-IDENTICAL and the code is added beside it
             (REC-79). 28 suites assert on these sentences; a rule this project
             adopted late has to be arrivable at without breaking what already
             reads the old shape, so C-38 is ADDITIVE on the wire. IC-REC-79. */
          if (spec.mutating && !(op === "capture" && req.method === "GET")
              && !SESSION_OPS[kind].has(op))
            return json({ ok: false, reason: "MACHINE_CREDENTIAL_REQUIRED", ...admissionRow("MACHINE_CREDENTIAL_REQUIRED"),
              error: "this operation requires a machine credential, not a signed-in session", op }, 403);
          cls = kind;
          ({ member: sessMember, viewer: sessViewer, identity: sessIdentity } = resolveSession(sess));
          sessRights = sess;
          viaSession = true;
        }
      }
    }
    if (!cls) return json({ ok: false, reason: "NOT_AUTHENTICATED", ...admissionRow("NOT_AUTHENTICATED"),
      error: "unauthenticated" }, 401);
    /* PL-11 / D-199 (1): CLASS PLUS SCOPE, and for THIS class the scope is the
       whole of it. The `ai` class is admitted by `aiTaskScope` and never by
       appearing in a row of the OPS table — no row names it, which is asserted
       structurally — so this branch is not an exemption from the class ACL. It
       is the class ACL, in the shape `scopeFor` already uses one function over,
       reading a declaration a member authored instead of a literal in a table.
       Refusals here carry their C-number and canned translation like every other
       refusal a member can receive (DEC-49). */
    if (cls === "ai") {
      const scoped = aiTaskScope(aiCred, op, spec);
      if (scoped.error) return json({ ok: false, ...scoped.error, op, cls }, 403);
    } else if (!spec.classes.includes(cls)) {
      return json({ ok: false, reason: "CLASS_FORBIDDEN", ...admissionRow("CLASS_FORBIDDEN"),
        error: "forbidden for token class", op, cls }, 403);
    }

    /* Section 8.1: the ROOT OF TRUST, and not in-app administrator status.
     *
     * A full working-corpus export is the group's entire unpublished position.
     * If any administrator could take it, one captured administrator
     * exfiltrates everything and the export becomes the most efficient attack
     * in the system, which section 8 names as the whole difficulty.
     *
     * So the ADMIN_TOKEN-class credential itself, and NOT a session belonging to
     * an administrator. A session is derived from a password; the root of trust
     * is the token set in the hosting dashboard. This refuses a stolen admin
     * password, and it refuses the founder's own signed-in browser, which is the
     * one place in this system where being the founder is not enough. */
    if (op === "export" && viaSession)
      return json({ ok: false, reason: "ROOT_OF_TRUST_REQUIRED", ...admissionRow("ROOT_OF_TRUST_REQUIRED"), op,
        detail: "a full working-corpus export needs the ADMIN_TOKEN-class credential itself, not a "
              + "signed-in session, and not in-app administrator status. A session is derived from a "
              + "password; the root of trust is the token held in the hosting account. The published "
              + "record needs no credential at all and is available at op=publishedmanifest." }, 403);

    /* Section 5 enforcement. Only a SESSION carries capabilities; a machine
       credential has no member behind it and stays bounded by the class ACL
       above. capture's GET is a read and is treated as one here for the same
       reason the session ACL treats it as one directly above. */
    if (viaSession) {
      sessCaps = new Set(sessRights.capabilities || []);
      const needs = NEEDS[op];
      if (needs && !(op === "capture" && req.method === "GET") && !sessCaps.has(needs))
        return json({ ok: false, reason: "NOT_CAPABLE", ...admissionRow("NOT_CAPABLE"),
          op, needs, held: [...sessCaps].sort(),
          detail: `this account does not hold the ${needs} capability. Capabilities are set by an `
                + `administrator, so ask one to grant it rather than looking for another route.` }, 403);
    }

    const scope = scopeFor(cls, url);
    if (scope.error) return json({ ok: false, reason: "SCOPE_REFUSED", ...admissionRow("SCOPE_REFUSED"),
      error: scope.error, tokenClass: cls }, 403);
    /* END DEC-49 REGION is-admission */
    const storeName = scope.name;

    /* D-9. The register audit finishes HERE and not in the Durable Object,
       because classifying a register row needs R2, and the DO neither holds the
       store name nor should guess it: capture keys are `<store>/captures/<sha>`.
       This is the SAME probe the gate already uses on the ratify path, where
       runGate enforces "bytes the register claims must exist" and refuses with
       PLANE_MISSING_BYTES. Making the diagnostic ask the same question as the
       enforcer, rather than inventing a second answer, is the whole point: the
       first version of this audit looked only in `files` and `history`, called
       everything else "dropped", and produced a confident wrong finding that
       the Apps Script migration was unauditable. The bytes were in R2. */
    /* op=whoami. What the caller is and what they may DO, so an interface can
       satisfy section 5's "absent from their interface" without keeping its own
       copy of the capability rules and letting it drift.

       A machine credential holds NO capabilities and the honest answer is null
       rather than an empty list or a full one: there is no member behind a token
       class, so there is nothing to hold them. What bounds a machine caller is
       the op table and the scratch confinement, and reporting it as though
       section 5 applied would be inventing a member who does not exist.

       `vocabulary` is the full set, so an interface can tell "not held" from
       "not a capability at all" without hardcoding the list. */
    if (op === "whoami") {
      return json({ ok: true, result: {
        tokenClass: cls,
        session: viaSession,
        member: viaSession ? sessMember : null,
        handle: viaSession ? (sessRights.handle ?? null) : null,
        administer: viaSession ? !!sessRights.administer : false,
        rootOfTrust: viaSession ? !!sessRights.rootOfTrust : false,
        capabilities: viaSession ? [...sessCaps].sort() : null,
        vocabulary: Store.CAPABILITIES,
        detail: viaSession
          ? "capabilities are set by an administrator and gate what this account may DO, not what it may see"
          : "a machine credential has no member behind it and therefore holds no capabilities; it is bounded "
          + "by the operation table and by namespace confinement instead",
      }, store: storeName, tokenClass: cls }, 200);
    }

    /* op=affordances (REC-19, DEC-8). THE plane-sourced act pre-flight: for
       this object as it stands, which acts exist — each with the capability it
       needs, how it is reached, its set-application weight and its declared
       ladder rung — plus the object vocabularies, so a surface renders what it
       received and keeps no copy of any of it.

       Composed HERE, not in the store, deliberately: the store reports FACTS
       (type, state, citation edges — through the same predicate retire's CITED
       refusal runs), and the act metadata comes from NEEDS and SESSION_OPS in
       this file plus the catalogue's exported state table. Nothing is asked of
       the caller and nothing here mutates.

       `rung` is DECLARED, never guessed, and since FW-14 it is also TOTAL: every
       op the dispatch table declares mutating either carries a rung or is named
       with the GROUND on which it has none, asserted in both directions by
       `test/rung-ladder.test.mjs`. So `rung: null` is now always accompanied by
       a non-null `rung_absence`, and the pair "no rung, no ground" is a shape
       the suite refuses to let exist. The line this replaces carried the figure
       "7 of 57 mutating ops have a source" — the 57 was never re-measured and
       the table declares 84, which is why the count now lives in the suite's
       printed corpus rather than in this comment.
       An `action` bundle returns an empty act list because nothing operates one
       until REC-24, and an empty list is the honest answer. */
    if (op === "affordances") {
      /* REC-20 hoisted this to module scope (decorateAct) so op=queue's
         options[] and this answer come from the SAME function. */
      const decorate = decorateAct;
      const target = url.searchParams.get("target");
      if (!target) {
        /* No target: the whole catalogue and the vocabularies, the shape a
           surface loads once — searchfields' precedent exactly. */
        return json({ ok: true, result: {
          target: null,
          catalog: ACTS.map((a) => ({ ...decorate(a), appliesTo: a.types })),
          vocabularies: VOCABULARIES,
          capture_acts: CAPTURE_ACTS.map(decorate),
          detail: "pass target=<bundle id> for the acts available on that object right now; "
                + "rung is the weight ladder (vocabularies.rung_ladder, low to high, IRREVERSIBLE "
                + "at the top per DEC-19 with vocabularies.rung_correction_path beside it) and is "
                + "null only where the act carries a STATED absence — read rung_absence for the "
                + "ground, and vocabularies.rung_absence_grounds for what that ground means; "
                + "capture_acts are keyed by a capture sha rather than by a bundle, so they are "
                + "published with their metadata and never derived against an object's state",
        }, store: storeName, tokenClass: cls }, 200);
      }
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-25: the D-15 viewer stamp, server-side from the authenticated
         identity exactly as the passthrough reads take it below. An object the
         viewer may not see answers NO_SUCH_BUNDLE, identical to an absent one. */
      const affViewer = viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`;
      /* REC-132: D-310's owner fact is POSITIONAL, so it is asked of the identity. */
      const affIdentity = viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`;
      /* REC-52: `(facts || { reason: "NO_FACTS" })` is site (b)'s shape with a
         different word — a store silence answering "there are no facts about
         that object", which is a claim about the object. What the acts on an
         object are is the whole of what this op is asked, so answering it out
         of a failure to ask would put a wrong set of affordances in front of a
         member. The store's own NO_SUCH_BUNDLE, and its 404, are untouched. */
      const fOut = await doAnswer(st.fetch(
        `http://do/affordancefacts?target=${encodeURIComponent(target)}&viewer=${encodeURIComponent(affViewer)}`
        + `&identity=${encodeURIComponent(affIdentity)}`));
      if (!fOut.answered) return storeSilent("affordances");
      const facts = fOut.result;
      if (!facts) return storeSilent("affordances");
      if (facts.ok !== true)
        return json({ ok: false, ...facts, store: storeName, tokenClass: cls },
                    facts.reason === "NO_SUCH_BUNDLE" ? 404 : 400);
      return json({ ok: true, result: {
        target: facts.target, object_type: facts.object_type,
        current_state: facts.current_state,
        acts: deriveActs(facts).map(decorate),
        vocabularies: VOCABULARIES,
        /* REC-38. The SAME block the no-target catalogue answers, and it is
           deliberately NOT filtered by this target: a capture act's subject is
           a capture sha, and whether one is attestable turns on the bytes being
           in the store — a fact `affordanceFacts` does not carry and this
           handler must not guess at. So this is metadata a surface RENDERS
           beside a capture it already holds, never a derivation about this
           object; deriving one here would be the publication disagreeing with
           op=attest's own NO_SUCH_CAPTURE. The reasoning is on CAPTURE_ACTS,
           where both consumers of the distinction read it. */
        capture_acts: CAPTURE_ACTS.map(decorate),
      }, store: storeName, tokenClass: cls }, 200);
    }

    /* op=queue (REC-20, ruled by DEC-16). The member's ONE feed: OBLIGATIONs
       from `tasks` and FINDINGs from the proposals derivation, in one contract,
       each with the case set it belongs to and the acts available on its
       subject.

       Composed the way op=affordances is, and for the same reason: the store
       derives the ITEMS and the homes (it holds the edges and the D-15
       predicate), and the act metadata is added HERE, where NEEDS, SESSION_OPS
       and RUNGS live — through decorateAct, the SAME function op=affordances
       uses, so the two answers cannot drift.

       TWO server-side stamps, both set AFTER nothing of the caller's is read,
       because either one taken from the request would defeat the other:
         - `member` decides WHOSE obligations these are. A caller who could name
           the member could read anyone's queue.
         - `viewer` decides which case names the answer may contain. D-15 has
           exactly one compilation point and this is the only place the identity
           enters it; the store fails closed, so a missing stamp yields an
           ungrouped feed rather than an unfiltered one.
       A machine credential has no member behind it, so it stamps `member` empty
       and receives the whole live set — the operator view the token exists for,
       and the same carve-out D-15 makes for a machine viewer. */
    if (op === "queue") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const inner = new URL("http://do/queue");
      inner.searchParams.set("viewer", viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`);
      inner.searchParams.set("member", viaSession ? sessMember : "");
      for (const k of ["now", "limit"]) {
        const v = url.searchParams.get(k);
        if (v !== null) inner.searchParams.set(k, v);
      }
      /* REC-52: `(r || { reason: "NO_QUEUE" })` — a store silence reported to a
         member as a statement that there is no queue. It refused with `ok:false`
         rather than a false success, so it is the milder half of the class and
         it is still the plane inventing a word the store never said. */
      const qOut = await doAnswer(st.fetch(inner.toString()));
      if (!qOut.answered) return storeSilent("queue");
      const r = qOut.result;
      if (!r) return storeSilent("queue");
      if (r.ok !== true)
        return json({ ok: false, ...r, store: storeName, tokenClass: cls }, 400);
      return json({ ok: true, result: {
        ...r,
        items: r.items.map((i) => ({ ...i, options: (i.options || []).map(decorateAct) })),
        vocabularies: VOCABULARIES,
      }, store: storeName, tokenClass: cls }, 200);
    }

    if (op === "registeraudit") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-52: this one CRASHED rather than lied — `r.unresolved` on an absent
         result throws a TypeError and the caller gets a platform 500 — so it is
         the less dangerous half of the class. It is converted anyway, because
         the answer below is a SOUNDNESS VERDICT about the register ("sound:
         true") and an audit that reports on a register it could not read is the
         worst possible place to be one line away from a false clean bill. */
      const aOut = await doAnswer(st.fetch("http://do/registeraudit"));
      if (!aOut.answered || !aOut.result) return storeSilent("registeraudit");
      const r = aOut.result;
      const canProbe = typeof env.CAPTURES?.head === "function";
      const captured = [], unbacked = [], mismatched = [];
      for (const row of r.unresolved) {
        if (row.class === "orphan") { unbacked.push({ ...row, why: "the bundle itself is absent" }); continue; }
        if (!canProbe) { unbacked.push({ ...row, why: "no capture bucket is configured to check" }); continue; }
        const h = await env.CAPTURES.head(`${storeName}/captures/${row.capture_sha}`);
        if (!h) unbacked.push({ ...row, why: "no bytes in the working bucket" });
        else if (typeof row.bytes === "number" && h.size !== row.bytes)
          mismatched.push({ ...row, registered: row.bytes, stored: h.size });
        else captured.push(row);
      }
      return json({ ok: true, result: {
        total: r.total, live: r.live, superseded: r.superseded, historical: r.historical,
        captured: captured.length, mismatched: mismatched.length, unbacked: unbacked.length,
        sound: unbacked.length === 0 && mismatched.length === 0, probed: canProbe,
        detail: "captured means the bytes are not in the bundle image but ARE in the working bucket, which "
              + "is the deliberate pattern migrate.mjs uses and what the two-bucket design exists for. "
              + "unbacked is the only broken state, and mismatched means the register and the stored object "
              + "disagree about size.",
        sample: [...unbacked, ...mismatched].slice(0, 40),
      }, store: storeName, tokenClass: cls }, 200);
    }

    /* selftest reports deployment health as JSON, so "did the deploy work" is a
       link rather than a command. It asserts every binding is present and that
       the store answers, and it never returns a secret. */
    if (op === "selftest") {
      /* R2 is optional by design: a new group has nothing over the spill
         threshold, so everything lives in SQLite and no card is needed.
         "Not configured" is a first-class healthy state, distinct from
         "configured and broken", which stays a failure. Fence doctrine
         survives because the buckets are only ever added as a pair. */
      const r2Configured = typeof env.CAPTURES?.get === "function"
                        && typeof env.PUBLISHED?.get === "function";
      const out = {
        ok: true, service: "bio-plane", version: env.VERSION || "0.0.0",
        time: new Date().toISOString(), tokenClass: cls,
        bindings: {
          STORE: typeof env.STORE?.idFromName === "function",
          CAPTURES: typeof env.CAPTURES?.get === "function" ? true : "not configured",
          PUBLISHED: typeof env.PUBLISHED?.get === "function" ? true : "not configured",
          ADMIN_TOKEN: await liveToken(env.ADMIN_TOKEN),
          MEMBER_TOKEN: await liveToken(env.MEMBER_TOKEN),
          PROBE_TOKEN: await liveToken(env.PROBE_TOKEN),
          /* REC-33: REPORTED, and deliberately NOT required below. An instance
             that predates this class runs monitoring on the ADMIN_TOKEN
             fallback and is HEALTHY; making the binding required would fail
             every already-installed instance's own health check for holding the
             posture it shipped with. Absence is a first-class state here, the
             same way R2's is — and reporting it is what lets an operator SEE
             whether the fallback is what is carrying their monitoring. */
          DAEMON_TOKEN: (typeof env.DAEMON_TOKEN === "string" && env.DAEMON_TOKEN.length > 0)
            ? await liveToken(env.DAEMON_TOKEN)
            : "not configured",
        },
        r2Configured,
        schemaChars: SCHEMA.length,
      };
      /* Half a fence is a defect, not an option. */
      if ((typeof env.CAPTURES?.get === "function") !== (typeof env.PUBLISHED?.get === "function")) {
        out.ok = false;
        out.r2 = "MISCONFIGURED: one bucket bound without the other; the fence requires both or neither";
      }
      try {
        /* REC-52: a store that ANSWERED `ok:false` reported `out.store =
           undefined` and left `out.ok` TRUE — a deployment health check
           reporting healthy because the failure it was looking for arrived in
           the one shape it did not read. Only a thrown fetch was caught. */
        /* REC-129 / IC-144: selftest RELAYS the store's stats, so it is the same answer through a
           second door and takes the same stamp op=stats does (see there). */
        const sOut = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName))
          .fetch(`http://x/stats?operator=${cls === "admin" ? "1" : "0"}`));
        if (!sOut.answered) { out.ok = false; out.store = "ERR the store did not answer /stats"; }
        else out.store = sOut.result;
      } catch (e) { out.ok = false; out.store = "ERR " + String(e && e.message || e); }
      if (r2Configured) {
        try {
          const key = `${SCRATCH}/selftest-${Date.now()}`;
          await env.CAPTURES.put(key, "ok");
          const back = await env.CAPTURES.get(key);
          out.captures = (await back.text()) === "ok" ? "read-write ok" : "MISMATCH";
          await env.CAPTURES.delete(key);
        } catch (e) { out.ok = false; out.captures = "ERR " + String(e && e.message || e); }
      } else {
        out.captures = "not configured";
      }
      /* Required for health: the store and three live token bindings. R2 is
         reported but not required. */
      out.bindingsAllPresent =
        out.bindings.STORE === true && out.bindings.ADMIN_TOKEN === true
        && out.bindings.MEMBER_TOKEN === true && out.bindings.PROBE_TOKEN === true;
      if (!out.bindingsAllPresent) out.ok = false;
      return json(out, out.ok ? 200 : 500);
    }

    /* purge is the only destructive op. It refuses unless the caller names the
       store it resolved to, so a purge can never land somewhere the caller did
       not mean. Probe class reaches it, but scopeFor has already confined probe
       to scratch, so probe can only ever confirm "scratch". */
    if (op === "purge") {
      const confirm = url.searchParams.get("confirm");
      if (confirm !== storeName)
        return json({ ok: false, error: "purge requires confirm=<store>", expected: storeName,
                      got: confirm, tokenClass: cls, store: storeName }, 400);
    }

    if (op === "livefire") {
      const out = await livefire(env, storeName, { operator: cls === "admin" });
      return json(out, out.ok ? 200 : 500);
    }

    /* capture is the one op that moves bytes. PUT or POST writes capture
       content to the working bucket, content-addressed by its SHA-256 and
       verified server-side against the received body, so a caller can never
       land bytes under the wrong name. Existing keys are immutable: a re-put
       of identical content answers ok with existed true and writes nothing.
       GET reads the bytes back and honours a Range header. The DO is not
       involved: the register row that NAMES a capture travels inside a
       promote package; this op only moves the bytes the row names. Keys live
       under `<store>/captures/<sha256>`, so probe confinement to the scratch
       store confines its captures mechanically, the same way as everything
       else. Publishing to the PUBLISHED bucket is the publisher's act during
       ratification and deliberately has no op here. */
    /* What a captured document pointed at, resolved against the store as it
       stands NOW rather than as it stood at capture. That is deliberate: which
       partition a link falls in depends on what the record holds, and the
       record changes, so the answer is computed at read time and never frozen
       into the capture. */
    /* What runs here have COST, measured. A read, and the honest counterpart to
       the store's `capturelimit` read — a DO PATH and not an op, M0-12; nothing
       on the control plane reaches it — : that one reports a ceiling found by
       being refused, this
       one reports consumption found by measuring, because CPU has no catchable
       refusal to find a ceiling with. */
    if (op === "runtime") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-52: three unchecked reads feeding one `{ok:true}`. A store silence
         made every one of them `undefined`, `JSON.stringify` dropped all three,
         and the answer became `{ok:true, asymmetry:"…"}` — a MEASUREMENT op
         reporting success while carrying no measurement, which is this class at
         its most literal: an outcome that costs nothing to produce. */
      const obsOut = await doAnswer(st.fetch("http://x/runtimeobservations"));
      const probeOut = await doAnswer(st.fetch("http://x/cpuprobestate"));
      const limOut = await doAnswer(st.fetch("http://x/capturelimit?runtime=subrequests"));
      if (!obsOut.answered || !probeOut.answered || !limOut.answered) return storeSilent("runtime");
      const obs = obsOut.result, probe = probeOut.result, lim = limOut.result;
      return json({ ok: true, measured: obs, cpu_probe: probe, subrequests: lim,
        asymmetry: "a refused subrequest throws and is caught, so the subrequest ceiling is known by "
                 + "having hit it. Exceeding the CPU limit TERMINATES the isolate, so no run can "
                 + "report its own death: consumption is measured on every run and the ceiling is "
                 + "found by op=cpuprobe, whose checkpoints survive the kill." });
    }

    /* Find the CPU ceiling by walking into it. Each completed step is
       checkpointed durably BEFORE the next begins, so when the isolate is killed
       the trail shows the last step that finished and the ceiling is bracketed.
       Probe class only: it burns compute on purpose and belongs nowhere near a
       member's session. */
    if (op === "cpuprobe") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-52: `before.highest_completed` threw on an absent result, so this
         one crashed rather than lied. Converted for the same reason as
         op=registeraudit — the answer it builds is a CEILING, and a ceiling
         derived from a starting point nobody read is a number presented as a
         measurement. */
      const beforeOut = await doAnswer(st.fetch("http://x/cpuprobestate"));
      if (!beforeOut.answered || !beforeOut.result) return storeSilent("cpuprobe");
      const before = beforeOut.result;
      const iters = Math.max(100000, Number(url.searchParams.get("iterations")) || 2000000);
      const budget = Math.max(50, Number(url.searchParams.get("budget_ms")) || 20000);
      const r = await cpuProbe({
        startStep: before.highest_completed, iterationsPerStep: iters, budgetMs: budget,
        checkpoint: async (step, elapsed) => {
          await st.fetch("http://x/recordcpuprobestep", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ step, elapsedMs: elapsed, iterations: iters }) });
        },
      });
      const afterOut = await doAnswer(st.fetch("http://x/cpuprobestate"));
      if (!afterOut.answered) return storeSilent("cpuprobe");
      const after = afterOut.result;
      return json({ ok: true, run: r, state: after,
        note: "this run RETURNED, so the ceiling is above its elapsed time. If a later run does not "
            + "return, the trail's highest step is the last one that fit and the ceiling lies just "
            + "above its elapsed_ms." });
    }

    /* Project a capture's resolved links into edges. Separate from op=links
       because it writes, and the capability gate has to see that. */
    if (op === "linkproject") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const capture = url.searchParams.get("capture");
      if (!/^[0-9a-f]{64}$/.test(capture || ""))
        return json({ ok: false, reason: "NEED_CAPTURE", detail: "pass capture=<sha256>" }, 400);
      const bundle = url.searchParams.get("bundle");
      /* REC-52: op=linkproject WRITES — it projects a capture's links into
         edges — and `json({ ok: true, ...p.result })` reported a store silence
         as a successful projection carrying no counts. A write reported as
         done when nothing was written is the worst member of this class after
         the public reads, because the caller stops asking. */
      const p = await doAnswer(st.fetch(`http://x/projectlinks?capture=${capture}`
        + (bundle ? `&bundle=${encodeURIComponent(bundle)}` : "")));
      if (!p.answered) return storeSilent("linkproject");
      return json({ ok: true, ...p.result });
    }

    if (op === "governorstate") {
      /* D-103: which hosts the governor is holding and why. A read; the host
         param narrows to one, absence returns all. The store method already
         shapes the rows, so this only forwards. */
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const host = url.searchParams.get("host");
      /* REC-52: the same spread. An empty `{ok:true}` here reads as "the
         governor is holding nothing", which is a claim about what the instance
         is doing to other people's servers. */
      const r = await doAnswer(st.fetch(`http://x/governorstate${host ? `?host=${encodeURIComponent(host)}` : ""}`));
      if (!r.answered) return storeSilent("governorstate");
      return json({ ok: true, ...r.result });
    }

    if (op === "governorconfig") {
      /* D-103: set a host's appetite. A host is required so a fat-fingered
         global change is impossible; appetite_per_min omitted or null resets
         that host to the instance default rather than pinning a number, which
         is how an operator says "stop treating this host specially". */
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const host = url.searchParams.get("host");
      if (!host)
        return json({ ok: false, reason: "NEED_HOST", detail: "pass host=<hostname>; governorconfig never sets a global appetite" }, 400);
      const raw = url.searchParams.get("appetite_per_min");
      let appetite = null;
      if (raw !== null && raw !== "") {
        appetite = Number(raw);
        if (!Number.isFinite(appetite) || appetite <= 0)
          return json({ ok: false, reason: "BAD_APPETITE", detail: "appetite_per_min must be a positive number, or omit it to reset to the instance default" }, 400);
      }
      /* REC-52, and this is the second WRITE in the class: an operator sets a
         host's appetite, the store never records it, and the plane answers
         `{ok:true}`. The operator then believes a courtesy limit is in force on
         somebody else's server when none is. */
      const r = await doAnswer(st.fetch("http://x/governorconfig", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ host, appetite_per_min: appetite }),
      }));
      if (!r.answered) return storeSilent("governorconfig");
      return json({ ok: true, ...r.result });
    }

    if (op === "links") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const capture = url.searchParams.get("capture");
      const address = url.searchParams.get("address");
      if (address) {
        /* REC-52: "what points at this address" answered `{ok:true}` with no
           rows on a store silence, which a reader cannot tell from "nothing
           points at it" — an absence at one level reported as an absence at the
           next, which CLAUDE.md names as its own rule. */
        const r = await doAnswer(st.fetch(`http://x/linksto?address=${encodeURIComponent(normalizeAddress(address))}`));
        if (!r.answered) return storeSilent("links");
        return json({ ok: true, ...r.result });
      }
      if (!/^[0-9a-f]{64}$/.test(capture || ""))
        return json({ ok: false, reason: "NEED_CAPTURE_OR_ADDRESS",
          detail: "pass capture=<sha256> for a document's outbound links, or address=<url> for what points at it" }, 400);
      /* REC-52: same again for a document's outbound links. */
      const r = await doAnswer(st.fetch(`http://x/resolvelinks?capture=${capture}`));
      if (!r.answered) return storeSilent("links");
      return json({ ok: true, ...r.result });
    }

    if (op === "capture") {
      if (typeof env.CAPTURES?.get !== "function")
        return json({ ok: false, error: "R2 is not configured on this instance" }, 503);
      const sha = (url.searchParams.get("sha256") || "").toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(sha))
        return json({ ok: false, error: "capture requires sha256=<64 lowercase hex>" }, 400);
      const key = captureKey(storeName, sha);
      if (req.method === "PUT" || req.method === "POST") {
        const body = new Uint8Array(await req.arrayBuffer());
        const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", body))]
          .map((x) => x.toString(16).padStart(2, "0")).join("");
        if (digest !== sha)
          return json({ ok: false, reason: "INTEGRITY", detail: "body hash does not match the sha256 parameter",
                        expected: sha, got: digest, store: storeName, tokenClass: cls }, 400);
        const existing = await env.CAPTURES.head(key);
        if (existing)
          return json({ ok: true, sha256: sha, bytes: existing.size, existed: true, store: storeName, tokenClass: cls });
        await env.CAPTURES.put(key, body, { sha256: await crypto.subtle.digest("SHA-256", body) });
        return json({ ok: true, sha256: sha, bytes: body.length, existed: false, store: storeName, tokenClass: cls });
      }
      const wantRange = req.headers.get("range");
      const obj = await env.CAPTURES.get(key, wantRange ? { range: req.headers } : undefined);
      const dl = (url.searchParams.get("dl") || "").replace(/[^\w.\- ]/g, "").slice(0, 120);
      if (!obj)
        return json({ ok: false, reason: "NOT_FOUND", sha256: sha, store: storeName, tokenClass: cls }, 404);
      return new Response(obj.body, {
        status: wantRange ? 206 : 200,
        headers: { "content-type": "application/octet-stream",
                   "access-control-allow-origin": "*", "x-capture-sha256": sha,
                   ...(dl ? { "content-disposition": `attachment; filename="${dl}"` } : {}) },
      });
    }

    /* D-91 delegation (CONTENT-PDF → CAPTURE): read a captured PDF's outbound-
       link structure. This is a READ layered on op=capture — it takes the same
       sha256 parameter, reads the SAME R2 object through the same captureKey
       path, and returns the extractor's container-agnostic structure (the
       provisional I2 shape). It parses bytes; it never writes them, which is why
       its OPS spec is non-mutating and it needs no capture-GET special-case. */
    if (op === "pdfstructure") {
      if (typeof env.CAPTURES?.get !== "function")
        return json({ ok: false, error: "R2 is not configured on this instance" }, 503);
      const sha = (url.searchParams.get("sha256") || "").toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(sha))
        return json({ ok: false, error: "pdfstructure requires sha256=<64 lowercase hex>" }, 400);
      /* CPDF-19 / D-319 — THE OPT-IN RE-READ TO TIER 3 (`EXTRACTION-BREADTH-DESIGN.md`
         §5.1). WITHOUT `ocr` NOTHING BELOW THIS BLOCK CHANGES, AND NOTHING IN IT RUNS:
         the answer is byte-identical to the read this op always was, which is the
         design's own over-strictness control and `reextract.test.mjs`'s digest arm.
         *
         * WITH `ocr=1` every way the request can be wrong is refused HERE, before a
         * byte is read or an engine is called, because two of the five cost
         * something (a ~10 s engine call per image-only page, CPDF-10's figure) and
         * the other three would otherwise leave a member believing the record had
         * looked again when it had not. */
      const ocrAsked = url.searchParams.has("ocr");
      let reBasis = null, reAuthor = null, reViewer = null;
      /* DEC-49 REGION is-reextract
       *
       * THE SPAN C-51's five codes name. Helper `reextractRow`, every code a
       * STRING LITERAL at its site. */
      if (ocrAsked) {
        if (url.searchParams.get("ocr") !== "1")
          return json({ ok: false, reason: "REEXTRACT_FLAG_MALFORMED", ...reextractRow("REEXTRACT_FLAG_MALFORMED"),
            op, detail: `ocr=${JSON.stringify(String(url.searchParams.get("ocr")).slice(0, 40))} is not a value `
                      + `this op reads. Send ocr=1 to re-read the document with the OCR member, or leave the `
                      + `parameter off for the ordinary read.` }, 400);
        if (cls === "ai")
          return json({ ok: false, reason: "REEXTRACT_AGENT_REFUSED", ...reextractRow("REEXTRACT_AGENT_REFUSED"),
            op, detail: `op=pdfstructure is declared a read, so no agent task scope can name it as a write, `
                      + `and ocr=1 writes this capture's reading. An agent is confined to the writes its `
                      + `member declared (D-199).` }, 403);
        if (viaSession && !(sessCaps && sessCaps.has("contribute")))
          return json({ ok: false, reason: "REEXTRACT_NOT_CAPABLE", ...reextractRow("REEXTRACT_NOT_CAPABLE"),
            op, needs: "contribute", held: [...(sessCaps || [])].sort(),
            detail: `a re-read replaces this capture's reading, its text units and the standing of `
                  + `content rows cited under the old one, which is a write to the record and asks the `
                  + `capability a promotion asks.` }, 403);
        if (!env.OCR_WORKER)
          return json({ ok: false, reason: "REEXTRACT_NO_OCR_MEMBER", ...reextractRow("REEXTRACT_NO_OCR_MEMBER"),
            op, sha256: sha,
            detail: `no OCR member is bound to this instance (the OCR_WORKER service binding is absent), `
                  + `so there is no tier 3 to reach. Nothing was read, called or written. An instance `
                  + `that installs the member later can re-read this capture then (D-115, D-319).` }, 501);
        reViewer = viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`;
        reAuthor = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
        const reStore = env.STORE.get(env.STORE.idFromName(storeName));
        const bOut = await doAnswer(reStore.fetch(
          `http://do/reextractbasis?sha256=${sha}&viewer=${encodeURIComponent(reViewer)}`));
        if (!bOut.answered) return storeSilent(op);
        if (!(bOut.result && bOut.result.held))
          return json({ ok: false, reason: "REEXTRACT_NOT_READ", ...reextractRow("REEXTRACT_NOT_READ"),
            op, sha256: sha,
            detail: `this record holds no reading of that capture that you can see, so there is nothing `
                  + `for a re-read to replace. A capture is read when a bundle carrying it is promoted; `
                  + `a capture in a project you are not part of answers exactly as one never filed.` }, 409);
        reBasis = bOut.result;
      }
      /* END DEC-49 REGION is-reextract */
      const obj = await env.CAPTURES.get(captureKey(storeName, sha));
      if (!obj)
        return json({ ok: false, reason: "NOT_FOUND", sha256: sha, store: storeName, tokenClass: cls }, 404);
      const bytes = new Uint8Array(await obj.arrayBuffer());
      /* COFF-1 (I7): dispatch through the FORMAT registry's pdf entry — the
         same extractor as ever (pdfstructure.mjs IS the entry), byte-identical
         output, but the registry is now the only place that knows it. The op
         NAMES its format: it is op=PDFstructure, so it asks for "pdf" rather
         than sniffing, and an absent entry is a NAMED server-side gap (501),
         never a guess at some other extractor. */
      const pdfEntry = getFormat("pdf");
      if (!pdfEntry || typeof pdfEntry.structure !== "function")
        return json({ ok: false, reason: "FORMAT_UNREGISTERED", format: "pdf",
                      error: 'format "pdf" is not registered in the format registry (formats.mjs), so op=pdfstructure has no extractor to dispatch to' }, 501);
      const structure = await pdfEntry.structure(bytes);
      /* A found object that is not a parseable PDF (NOT_A_PDF / NOT_BYTES) is a
         well-formed answer about ill-formed input, not a server fault: 422. The
         bytes existed and were read; the record simply does not hold a PDF at
         that sha. `ok:true` structure is the ordinary 200. */
      if (!structure.ok) return json(structure, 422);

      /* TIER 2 (I6, the fleet). Tier 1 above is pure-JS, in-plane, free, and it
         FULLY serves the agenda class the citation graph is keyed on. What it
         cannot decode is the measured residue (CPDF-5): CID / no-/ToUnicode
         fonts and permission-only ENCRYPTED PDFs — the staff-report substance an
         agenda links to, and encrypted ACFRs. That residue is handled by a
         SEPARATE Worker holding unpdf/pdf.js, called here over a service binding.

         WHEN we escalate: only when Tier 1 got essentially NOTHING — more
         undetermined regions than decoded characters (the encryption and
         whole-document no-/ToUnicode cases that zero a document out), never for
         a budget book Tier 1 already read at ~88%. That is a measured threshold
         (CPDF-5's buckets), not a guess, and it keeps the free in-plane path the
         common case and the paid cross-Worker hop the exception.

         The plane ASSERTS the provenance; the member asserts nothing (fleet rule
         2). We hand it a capture sha and a store and get back the record's own
         I2 shape — the plane writes nothing here either; this op is read-only.

         DELEGATION NOTE: this call site lives in index.mjs, RECORD's control
         plane (I3), not CONTENT-PDF's paths. It ships here as one turn with the
         member per the CPDF-6 item, and is flagged to CONDUCT as the CAPTURE/
         RECORD-owned surface a normal CONTENT-PDF turn would DELEGATE. */
      /*__REC98_TIER2_WIRE_STRUCTURE_START__*/
      /* REC-98 / D-283 — CALL SITE 1 OF 2. THE ASSIGNMENT HALF, PAGE BY PAGE.
       *
       * This block used to end `if (r.ok && t2 && t2.ok) return json(t2, 200)` —
       * the member's whole answer handed back over Tier 1's, which is the
       * WHOLESALE assignment D-283 names. Tier 1 and Tier 2 are both `layer`
       * derivations of the same source under the same null cap, so nothing is
       * OVERCLAIMED by the swap; what was unbounded is TEXT LOSS, because
       * `needsTier2` is a DOCUMENT-level predicate deciding a PER-PAGE fact.
       *
       * The rule is `mergeTier2Text`'s and is NOT re-derived here: per page,
       * Tier 2 replaces Tier 1 only when it has strictly FEWER undetermined
       * characters (§5.2's award axis — Tier 1's own admission that it failed on
       * that page) AND strictly MORE decoded characters (CPDF-20's one-directional
       * guard, which can only ever WITHHOLD an award). CPDF-20 measured §5.2 as
       * originally written and it FAILED §8's own control on real documents: both
       * producers publish a field named `undetermined` and they count different
       * things, so the first condition alone awarded Tier 2 145 of 203 census
       * pages and DEGRADED 23 of them. With the guard: 122 pages moved, 0
       * degraded, +186,242 characters.
       *
       * `needsTier2` is UNCHANGED and deliberately so — the routing half was
       * closed on purpose; this is the assignment half.
       *
       * THE `tier` FIELD NOW ANSWERS A MERGE HONESTLY. It was assigned `1`
       * unconditionally below and the escalated answer never reached that line;
       * it is now the merge's own verdict, so a document where no page moved
       * reads `tier: 1` with Tier 2 having been asked and having added nothing —
       * which is what happened, rather than a `2` true of no page. */
      let structureTier = 1;
      /* CPDF-19: what the tier-2 merge decided, kept for the `ocr=1` re-read below, which
         composes the chain and the basis by the acquire path's rule and needs both. */
      let readT2PerPage = null, readT2Note = null;
      if (env.PDF_WORKER && needsTier2(structure.text)) {
        try {
          const r = await env.PDF_WORKER.fetch("https://pdf-worker/structure", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ capture_sha: sha, store: storeName }),
          });
          const t2 = await r.json();
          if (r.ok && t2 && t2.ok) {
            /* THE MEMBER'S OWN NOTES ARE CARRIED, NOT DROPPED, and this is a
               finding the wholesale return used to deliver for free. The member
               declines documents over its envelope by answering `ok:true` at
               tier 1 with `tier2_declined_over_envelope` on its notes — so
               returning `structure` instead of `t2` would have silently lost the
               one sentence that says WHY nothing improved. Deduped against what
               the plane already said so one finding does not acquire two homes. */
            for (const n of (Array.isArray(t2.notes) ? t2.notes : []))
              if (typeof n === "string" && !structure.notes.includes(n))
                structure.notes = [...structure.notes, n];
            const m = mergeTier2Text(structure.text, t2.text);
            if (m.ok) {
              /* D-251 PRESERVED THROUGH THE WIRE: who made the layer is a fact
                 about the FILE, not about the tier that read it. The member
                 returns the I2 shape with no `producer`, so the wholesale path
                 (`m.text` IS the member's object) would drop the marker on
                 exactly the documents most likely to carry one. The page-wise
                 path keeps it by construction (`{...base}`); this line closes the
                 wholesale one. Carried forward, never re-derived, and only when
                 the member supplied none of its own. */
              structure.text = (structure.text && structure.text.producer && !m.text.producer)
                ? { ...m.text, producer: structure.text.producer } : m.text;
              structureTier = m.replaced.length ? 2 : 1;
              const n = tier2Note(m);
              if (n) structure.notes = [...structure.notes, n];
              readT2PerPage = m.perPageTier || null; readT2Note = n || null;
            } else {
              /* The merge REFUSED — the Tier-1 reading has no page grain to merge
                 on and already holds text. Tier 1 stands and the refusal says so
                 in the record's own words, because refusing costs an unread
                 document and accepting costs an overwritten one. */
              structure.notes = [...structure.notes, m.why];
              readT2Note = m.why || null;
            }
          } else {
            /* The member answered but could not help (not a PDF to it, an error):
               keep Tier 1, and SAY the escalation was tried and did not add text. */
            structure.notes = [...structure.notes, "tier2_no_improvement"];
          }
        } catch (e) {
          /* Binding threw (member unavailable / rolling out, D-108 per member):
             degrade to Tier 1, named, never a platform error to the caller. */
          structure.notes = [...structure.notes, "tier2_unavailable"];
        }
      }
      structure.tier = structureTier;
      /*__REC98_TIER2_WIRE_STRUCTURE_END__*/
      /* CPDF-19 / D-319 — THE RE-READ, reached only with `ocr=1` and only after
         every refusal above has had its chance. THE SAME SEAM, THE SAME MERGE, THE
         SAME CHAIN RULE AND THE SAME READING RULE AS `op=acquire`, because each is
         now one function both paths call (`tier3Extend`, `textUnitsFor`,
         `readingFromWire`) — so a capture re-read here records exactly what it
         would have recorded had the member been installed when it was captured.
         *
         * WHAT IS WRITTEN, AND BY WHAT. The new reading goes to the store's
         * `reextract` path, which hands it to promote's own per-capture writer:
         * the chain projection, REC-82's stale mark on content rows minted under
         * the OLD chain (marked, never deleted — Bob's 5.8), REC-91's text units
         * replaced, and REC-94's content-level observation under
         * `authority_kind = extract` with the asking member as `actor`. No bundle
         * version is minted — see `Store.reextract` for why and for the guard that
         * cost buys.
         *
         * NOTHING IS WRITTEN WHEN NOTHING WAS TRANSCRIBED. A document with no
         * image-only page is not a tier-3 candidate and the engine is never
         * called; a member that declined or failed leaves the document exactly as
         * it was read. Both answer `performed: false` WITH THE REASON — the
         * absence of a re-read is a finding and is stated, never an empty field. */
      if (ocrAsked) {
        const stored = (reBasis && reBasis.reading) || {};
        const t3 = await tier3Extend(env, { sha, storeName, i2text: structure.text, wiredTier: structureTier,
                                            tier2PerPage: readT2PerPage, fmt: "pdf" });
        const cost = "about 10 s per image-only page on the deployed OCR member (CPDF-10's measurement, MEASUREMENTS.md)";
        /* ONE RETURN FOR EVERY ANSWER OF THIS OP, the plain read's own, below. The
           re-read only DECORATES `structure`; it adds no `json()` site of its own,
           so `plane-envelope.test.mjs`'s unclassified-site census (D-240 (e)) is not
           asked to take on two more variables it cannot grade. */
        if (!t3.filled.length) {
          structure.reextraction = {
            performed: false, written: false, cost,
            candidate: needsTier3(structure.text),
            why: t3.ocrNote
              || "no page of this document lacks a text layer, so there is nothing for OCR to read; the "
               + "engine was not called and nothing about this capture was changed",
          };
        } else {
          /* THE CHAIN, by the acquire path's own two lines: the merge's composed
             chain, or — if the chain builder refused to compose one — the layer
             chain at the tier the document now reads at. */
          let chain = t3.chainSet ? t3.chain : null;
          if (!chain) chain = layerChainFor(t3.i2text, { tier: t3.wiredTier, container: "pdf" });
          /* THE READING, over the NEW text, through the content-type registry — so a
             type that is registered for a class nobody could read before (FW-20's
             staff directory, D-376) is consulted the moment a re-read makes the text
             exist. `at` STAYS THE CAPTURE INSTANT: it is when these bytes were
             retrieved, and the re-read is stamped separately below. */
          /* NO CONTENT TYPE AND NO HEADERS ARE HANDED ON, because this op does not hold
             the served ones and inventing them would put a fact on the reading nobody
             observed. Measured rather than assumed: nothing under `docprofile/` reads
             `ctx.content_type`, and the one handler that reads headers treats their
             absence as empty. The LOCATOR is the acquire's own, read back from the
             bundle's provenance document. */
          const wired = readText(t3.i2text, { headers: null, locator: reBasis.locator || null,
                                               content_type: null, at: stored.at ?? null });
          const reading = readingFromWire({
            wired, docType: { type: { key: stored.content_type ?? null, version: stored.reader_version ?? null } },
            chain, wiredTier: t3.wiredTier, fmt: "pdf", retrieved: stored.at ?? null,
            tier2note: readT2Note, ocrNote: t3.ocrNote, tier3Candidate: t3.stillWanting });
          reading.page_count = Number.isInteger(structure.pages) && structure.pages > 0
            ? structure.pages : (Number.isInteger(stored.page_count) ? stored.page_count : null);
          reading.container_extent = Object.prototype.hasOwnProperty.call(stored, "container_extent")
            ? stored.container_extent : null;
          /* THE RE-READ, STATED ON THE READING ITSELF: when, at whose request, by
             which engine, over which pages. It is also what `Store.#heldByReextraction`
             keys on, so an ordinary revision of the bundle cannot silently put the
             acquire-time reading back. */
          reading.reextracted = {
            at: new Date().toISOString().split(".")[0] + "Z", by: reAuthor,
            engine: t3.engine ? t3.engine.engine : null, version: t3.engine ? t3.engine.version : null,
            calibration: t3.engine ? t3.engine.calibration ?? null : null,
            pages: t3.filled, via: "op=pdfstructure&ocr=1",
          };
          const u = textUnitsFor(t3.i2text);
          const reStore = env.STORE.get(env.STORE.idFromName(storeName));
          const wOut = await doAnswer(reStore.fetch("http://do/reextract", {
            method: "POST", body: JSON.stringify({ captureSha: sha, viewer: reViewer, author: reAuthor, reading,
                                                   textUnits: u.textUnits, textUnitsOverBound: u.textUnitsOverBound }) }));
          if (!wOut.answered) return storeSilent(op);
          const w = wOut.result || {};
          structure.text = t3.i2text;
          structure.tier = t3.wiredTier;
          if (t3.ocrNote) structure.notes = [...structure.notes, t3.ocrNote];
          structure.reextraction = {
            performed: true, written: w.ok === true, cost,
            ...(w.ok === true ? {} : { why: "the record's reading of this capture could not be written (it was no "
                                          + "longer held for this caller when the write arrived), so the text above "
                                          + "was read and NOT recorded" }),
            pages: t3.filled, engine: t3.engine,
            text_source: chain, chain: describeChain(chain),
            reading: { content_type: reading.content_type, read_from_text: reading.read_from_text,
                       found: reading.found, entities: Array.isArray(reading.entities) ? reading.entities.length : 0,
                       text_tier: reading.text_tier },
            staled: w.staled ?? 0, units: w.indexed ?? null, observed: w.observed ?? null,
            candidates: "the content-axis frontier (op=frontier&level=content) lists the captures still below "
                      + "what this instance's fleet can read; this one is re-read now",
          };
        }
      }
      return json(structure, 200);
    }

    /* Acquisition: the fetch layer the intake doctrine calls M2'.
     *
     * What it produces is Grade B and says so. The doctrine's Section 3 is
     * precise: Grade B is "the document bytes as fetched by a capable surface,
     * hashed at receipt, with locator and instant", and Grade A requires a WACZ
     * or equivalent chain-of-custody capture of the source as served, which a
     * Worker cannot produce. Claiming A here would be the one thing the grading
     * scheme exists to prevent, since "a claim about evidence is only as strong
     * as its weakest named layer".
     *
     * It writes no bundle state. The doctrine: "No intake path writes live
     * state; the daemon and the member are writers like every writer." So this
     * returns a provenance document and the caller promotes it.
     */
    /* ---- the archive fallback's decision half (D-99 / ARCHIVE-FALLBACK.md) ----
     *
     * ARCHIVE.ORG IS A BACKUP SOURCE, NEVER A PRIMARY ONE (RULED). This refuses
     * unless the source-failure counter says the document has actually been
     * unreachable: three consecutive failures the SOURCE produced, or a failing
     * run of fourteen days. D-104's exclusion is what makes that fence mean
     * something, because our own governor declining to ask never advances it.
     * Without the fence, sustained politeness would load somebody else's
     * infrastructure to solve a problem we made.
     *
     * It fetches through the same governor as everything else, and its host
     * appetite is set conservatively from THEIR published figures rather than
     * discovered by probing for the wall. Bob, 2026-07-31: there is no need to
     * push traffic to the breaking point; there is plenty of time.
     */
    if (op === "archivelookup") {
      const body = req.method === "POST" ? await req.json().catch(() => null) : null;
      const address = body?.address || url.searchParams.get("address");
      if (typeof address !== "string" || !isPublicHttpsLocator(address))
        return json({ ok: false, reason: "BAD_ADDRESS",
                      detail: "the document address must be https on a public host" }, 400);
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const sel = await archiveSelect(env, st, address);
      if (!sel.ok) return json(sel.payload, sel.status);
      return json({
        ok: true, address,
        eligible_because: sel.reach.basis,
        chosen: sel.chosen,
        /* Every row the index offered and why it was not used. A fallback that
           says only "nothing suitable" when the index holds forty redirects is
           unauditable. */
        rejected: sel.rejected,
        usable_count: sel.usable_count,
        retrieval_locator: sel.replay,
        provenance_hop: sel.hop,
        capture_with: { op: "acquire", via: "archive.org", address },
        note: "this op decides and reports; op=acquire with via=archive.org decides AGAIN and captures, "
            + "because the hop that reaches the record must be built by the same call that fetched the CDX record",
      });
    }

    if (op === "acquire") {
      if (req.method !== "POST") return json({ ok: false, error: "acquire is a POST" }, 405);
      if (typeof env.CAPTURES?.put !== "function")
        return json({ ok: false, error: "this instance has no evidence storage configured" }, 503);
      const body = await req.json().catch(() => null);
      /* REC-33: THE DAEMON CLASS'S CONFINEMENT, and it belongs here rather than
         in the OPS table because the table knows only the op while the scope
         Bob ruled is one ARM of it. The class was minted for the archive
         fallback; the DIRECT arm is ordinary acquisition and a daemon
         credential has no business filing bytes it was not sent for. Refused by
         name, loudly, rather than by omission, so an operator who binds the
         wrong credential into an intake script learns which credential is
         wrong. Widen this by DECISION — the totality of the class's reach is
         asserted in test/daemon-token.test.mjs. */
      /* WIDENED 2026-08-08 BY PL-4, BY DECISION AND NOT BY DRIFT — which is the
         condition DEC-37 attached to widening this class. The decision is SWEEP
         §4b item 1, taken 2026-08-07 on Bob's own ruling that *"capturing a
         document (with provenance preserved) is something the daemon does
         (sometimes at the suggestion of an AI)"*: the capture-request drain IS
         the daemon doing that, and it is a THIRD verb. The arm below is
         narrower than the class list, exactly as the archive arm is: it admits
         only a request row the drain has already put in `draining`. */
      if (cls === "daemon" && body?.via !== "archive.org" && body?.via !== "capture-request")
        return json({ ok: false, reason: "NOT_PERMITTED", op, cls,
          detail: "the daemon class reaches op=acquire through the archive fallback "
                + "(via: \"archive.org\") and through the capture-request drain (via: \"capture-request\"). "
                + "Direct acquisition is a member's or an operator's act, and the "
                + "unattended credential is scoped to the verbs the unattended paths need." }, 403);
      /* D-112. An archive-sourced capture names the DOCUMENT and lets the plane
         find the replay address, rather than being handed one. The lookup runs
         HERE, inside the same call that will file the bytes, for two reasons:
         the eligibility fence cannot be walked around by calling acquire
         directly, and the provenance hop that reaches the record is built from
         the CDX record this call fetched. A caller supplies no hop, no replay
         URL and no document address, so there is nothing about the archive leg
         of the chain that a caller can invent. */
      const stArc = env.STORE.get(env.STORE.idFromName(storeName));
      let archiveHopRecorded = null, archiveChosen = null, archiveAddress = null;
      if (body?.via === "archive.org") {
        /* RULED: an alternative source counts as a re-fetch FOR MONITORING.
           Monitoring is an operator and daemon function, so the archive arm is
           admin and probe class only. A member reaching for the Archive by hand
           is outside what the ruling permits, and the narrower surface also
           keeps a UI from growing a button that loads somebody else's
           infrastructure. The DIRECT arm of acquire is unaffected. */
        /* REC-33 / DEC-37: "an operator or daemon credential" is now literally
           true — the daemon class this sentence already described exists, and
           it joins admin and probe here. This is one of its exactly two verbs. */
        if (cls !== "admin" && cls !== "probe" && cls !== "daemon")
          return json({ ok: false, reason: "NOT_PERMITTED", op, via: "archive.org",
            detail: "the archive fallback is a monitoring path: it runs under an operator or daemon credential, "
                  + "never a member's. Capture the document directly, or ask an administrator to run the fallback." }, 403);
        const addr = body?.address;
        if (typeof addr !== "string" || !isPublicHttpsLocator(addr))
          return json({ ok: false, reason: "BAD_ADDRESS",
            detail: "an archive-sourced capture names the document address, not a replay locator" }, 400);
        const sel = await archiveSelect(env, stArc, addr);
        if (!sel.ok) return json(sel.payload, sel.status);
        archiveHopRecorded = sel.hop;
        archiveChosen = sel.chosen;
        archiveAddress = sel.chosen.original;
        /* Only the locator is written back, because only the locator feeds the
           ordinary capture path. The document address is carried in
           archiveAddress and read from there, so `documentAddress` never exists
           on a request body at all and cannot be smuggled in on one. */
        body.locator = sel.replay;
      }
      /* PL-4 / IS-4 — THE CAPTURE-REQUEST ARM, AND IT IS THE ITEM'S SPINE.
         THE AI DOES NOT CAPTURE. IT REQUESTS, AND THE DAEMON CAPTURES. */
      let crPurpose = null, crAgent = null;
      if (body?.via === "capture-request") {
        const arm = await captureRequestArm(env, storeName, body, cls);
        if (arm.silent) return storeSilent(op);
        if (!arm.ok) return json({ ...arm.refusal, op }, 403);
        /* EVERYTHING THAT DECIDES WHAT LEAVES THIS INSTANCE COMES FROM THE ROW,
           never from the body: the address the request named, the purpose token
           the conduct check admitted, and the agent it judged legible. The drain
           sends `via` and `request` and nothing else. */
        body.locator = arm.locator;
        crPurpose = arm.purpose;
        crAgent = arm.agent;
      }
      /* CAP-8 — THE GOOGLE DRIVE HOST STACK, sited HERE for the same reason the
         archive arm is sited where it is: the recognition, the composition and
         the fetch all happen inside the ONE call that will file the bytes, so
         there is no window in which a caller can hand us a hop for a fetch we
         did not make.
         *
         * BOB RULED IT, 2026-09-14: *"A link to a Google Drive file should keep
         * the link and export an OpenDocument version that the content is
         * extracted from."* (framework Part II §16, the Google Drive paragraphs.)
         * So the record holds the DRIVE ADDRESS as the citation of where the
         * document lives and the ODF EXPORT BYTES as the capture — which is
         * exactly the two-address shape D-96 already built for the archive, used
         * for a second reason.
         *
         * WHAT THIS IS NOT: it is not a format, not a credential, and not a new
         * fetch path. `body.locator` is rewritten to the composed export address
         * and EVERYTHING downstream — the public-host fence, the governor, the
         * outcome counter, the parts streaming, the size bounds, the profile, the
         * reading, the register — runs unchanged. There is no Drive-shaped fetch
         * anywhere in this file; there is a Drive-shaped ADDRESS. */
      let driveCapture = null, driveHopRecorded = null;

      /* DEC-49 REGION is-drive-capture
       *
       * THE SPAN `DRIVE_HOP_FACT_SUPPLIED`, `DRIVE_FOLDER_NOT_A_DOCUMENT`,
       * `DRIVE_KIND_UNDETERMINED` and `DRIVE_SHAPE_UNRECOGNISED` name (REC-71).
       * A REGION and not the whole handler, so the four hundred lines of
       * ordinary acquisition either side of it are not conscripted into this
       * family. Helper `driveRow`, every code a STRING LITERAL at its site. */
      {
        /* D-112 FIRST, AND BEFORE THE ADDRESS IS EVEN LOOKED AT. The refusal is
           not conditional on the address being a Drive one: a caller inventing
           an export format for a document on any host is performing the same
           act, and a fence that only fires on the addresses we already handle is
           a fence anybody can step around by changing the address. */
        const supplied = callerSuppliedHopFacts(body);
        if (supplied.length)
          return json({ ok: false, reason: "DRIVE_HOP_FACT_SUPPLIED",
            ...driveRow("DRIVE_HOP_FACT_SUPPLIED"), op, supplied,
            detail: `this request carried ${supplied.map((k) => `\`${k}\``).join(", ")}. The export `
                  + `address, the export format and the producer are DERIVED by this instance from the `
                  + `file id and the kind in the address, at the moment it performs the fetch, and are `
                  + `never read from a request. A provenance hop a caller can hand us is a provenance `
                  + `hop a caller can invent (D-112), and the whole value of a disclosed chain is that `
                  + `the disclosure is ours. Send the Drive link alone.` }, 400);

        const drive = readDriveAddress(body?.locator);
        if (drive) {
          /* NAMED, NEVER SILENTLY SKIPPED — the item's rule, and the reason each
             of these is a refusal with a code rather than a fall-through. A
             silent fall-through would capture the application shell at a folder
             or file address and file it as the document, which is precisely the
             outcome the ruling exists to prevent. */
          if (drive.shape === "folder")
            return json({ ok: false, reason: "DRIVE_FOLDER_NOT_A_DOCUMENT",
              ...driveRow("DRIVE_FOLDER_NOT_A_DOCUMENT"), op,
              drive: { host: drive.host, shape: drive.shape, harvestable: false },
              locator: drive.address, detail: drive.why }, 422);
          if (drive.shape === "file")
            return json({ ok: false, reason: "DRIVE_KIND_UNDETERMINED",
              ...driveRow("DRIVE_KIND_UNDETERMINED"), op,
              drive: { host: drive.host, shape: drive.shape, harvestable: false,
                       ...(drive.fileId ? { file_id: drive.fileId } : {}) },
              locator: drive.address, detail: drive.why }, 422);
          if (drive.shape === "unknown")
            return json({ ok: false, reason: "DRIVE_SHAPE_UNRECOGNISED",
              ...driveRow("DRIVE_SHAPE_UNRECOGNISED"), op,
              drive: { host: drive.host, shape: drive.shape, harvestable: false },
              locator: drive.address, detail: drive.why }, 422);
          /* `published` is recognised IN ORDER TO BE LEFT ALONE. Google's
             publish-to-web address serves static HTML that is already an honest
             document — no application shell — and its `e/…` id is not one the
             export endpoint accepts. Diverting it would break a path that works
             today, which is the over-strictness direction this project keeps
             measuring. It falls through to the ordinary capture, unchanged. */
          if (drive.harvestable) {
            driveCapture = drive;
            /* Only the LOCATOR is rewritten, because only the locator feeds the
               ordinary capture path. The document address is carried on
               `driveCapture` and read from there, exactly as `archiveAddress` is
               — so the Drive link never has to survive a round trip through a
               request body and cannot be smuggled in on one. */
            body.locator = drive.exportAddress;
          }
        }
      }
      /* END DEC-49 REGION is-drive-capture */

      const locator = body?.locator;
      if (typeof locator !== "string" || !isPublicHttpsLocator(locator))
        return json({ ok: false, reason: "BAD_LOCATOR",
                      detail: "a locator must be https on a public host: no bare IP address, no localhost, no credentials in the address" }, 400);
      /* D-97: authority is THREE-VALUED and undetermined is a task, not a
         blocker (RULED, AUTHORITY-AND-TRUST.md). A caller who names the
         issuing party makes a member assertion, recorded as such; a caller who
         cannot leaves the capture honestly undetermined, to be resolved
         through the task list rather than refused at the door. What was here
         before, a hard refusal on a missing string, forced callers to invent
         an authority to get past the gate, which is exactly the false
         assertion the ruling exists to prevent. Both states record HOW they
         were reached, because "we could not establish this" is as much a
         dated fact as "the member asserted it". */
      const authorityAsserted = typeof body?.authority === "string" && body.authority.trim()
        ? body.authority.trim() : null;

      const retrieved = new Date().toISOString().split(".")[0] + "Z";
      const stGov = env.STORE.get(env.STORE.idFromName(storeName));
      /* D-104. Every way this fetch can end is recorded against the DOCUMENT
         address, and exactly one of them is not a failure of the source.
         *
         * The archive fallback will read this counter to decide whether to go to
         * the Internet Archive. If a governed refusal counted, sustained
         * self-throttling would trip that fallback: we would fetch from IA
         * because WE paced ourselves, and load somebody else's infrastructure to
         * solve a problem we made. Bob, 2026-07-31: the governor keeps traffic
         * low enough that being banned is not a concern, which is precisely why
         * its refusals are COMMON and must never read as the source failing.
         *
         * Recorded here rather than in governedFetch because this is where the
         * document address is known; the governor knows only a host. */
      /* D-96/D-99. A capture has TWO addresses and they are only the same for a
         direct fetch. The DOCUMENT ADDRESS is what the record identifies, and
         for an archive-sourced capture it is the CDX `original`, not the replay
         URL. The RETRIEVAL LOCATOR is what we actually fetched. Keying
         captured_locators on the document address is what lands an archive
         capture on the SAME row as a direct one, so two sources agreeing
         accumulate as corroboration instead of looking like two documents.
         *
         * `via` is a closed set rather than a free string for the reason D-104
         * gives for outcomes: the value exists to hold a distinction, and a free
         * string lets a caller erase it by accident. */
      const via = body?.via === "archive.org" ? "archive.org" : "direct";
      /* Set by archiveSelect above, from the CDX record, never read from the
         request as it arrived. */
      /* CAP-8 JOINS THE SAME SEAM, AND `via` DOES NOT MOVE FOR IT. A Drive export
         is a DIRECT fetch — we asked Google and Google answered us, with nobody
         in between — so it is `via: "direct"` and its two addresses split for a
         different reason than the archive's. The archive's split because a third
         party replayed the bytes; this one splits because the bytes are a
         CONVERSION Google performs at fetch time, at an address the plane
         composed. Both cases file the capture under the DOCUMENT address, which
         is what "keep the link" means concretely: the Drive link the source page
         carried is the address this capture answers to, and a link resolving
         against `captured_locators` finds it. */
      const documentAddress = via === "archive.org" && archiveAddress ? archiveAddress
                            : (driveCapture ? driveCapture.address : locator);
      /* The two cases in which `res.url` is NOT the document — hoisted so the
         locator write below states the rule once instead of spelling a condition
         twice and letting the two drift. */
      const addressIsDerived = (via === "archive.org" && !!archiveAddress) || !!driveCapture;
      const addrNorm = normalizeAddress(documentAddress);
      const noteOutcome = async (outcome, status) => {
        try {
          await stGov.fetch("http://x/recordsourceoutcome", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ addressNorm: addrNorm, outcome, status: status ?? null, at: retrieved }),
          });
        } catch { /* an unrecorded outcome must not turn a fetch into an error */ }
      };
      let res;
      try {
        /* PL-4: the PURPOSE and the DELEGATED AGENT both come from the request
           row (above) on the capture-request arm, and are the ordinary
           `"acquire"` and no delegation on every other arm. The purpose is what
           lets a source tell an investigation fetch from a routine re-check —
           DEC-47's second conduct rule, applied to the bytes that actually go
           out rather than only to the row. */
        const g = await governedFetch(env, stGov, locator, crPurpose || "acquire", crAgent);
        if (g.refusedByGovernor) {
          /* Counted in its own column, excluded from the threshold. Visible so
             an operator can tell a source nobody could reach from a source
             nobody asked. */
          await noteOutcome("governed", null);
          return json({ ok: false, reason: "HOST_COOLING_OFF",
                        detail: `the per-host governor is holding requests to this host (${g.reason}); retry in about ${Math.ceil((g.retry_in_ms || 0) / 1000)}s`,
                        retry_in_ms: g.retry_in_ms || 0, locator }, 429);
        }
        res = g.res;
      } catch (e) {
        await noteOutcome("fetch_failed", null);
        return json({ ok: false, reason: "FETCH_FAILED", detail: String(e && e.message || e), locator }, 502);
      }
      /* DEC-49 REGION is-drive-export
       *
       * THE SPAN `DRIVE_EXPORT_UNREACHABLE` and `DRIVE_EXPORT_IS_THE_SHELL` name
       * (REC-71) — the two ways Google answers the export address with something
       * that is not the document. A REGION, so the ordinary `SOURCE_REFUSED`
       * below it (which has no code and is not this family's) is not read as a
       * refusal site of this family's. Helper `driveRow`, codes as STRING
       * LITERALS.
       *
       * THE HALF THAT MATTERS IS WHAT DOES NOT HAPPEN HERE. There is no fallback.
       * A 403, a 404 or an HTML answer ends the capture with the failure named;
       * NOTHING reaches back for the application page, and no bytes are filed.
       * A record holding Google's app in place of a city's document would look
       * exactly like evidence and be none, which CLAUDE.md ranks worse than a
       * missing feature. */
      if (driveCapture && !res.ok) {
        await noteOutcome("source_refused", res.status);
        return json({ ok: false, reason: "DRIVE_EXPORT_UNREACHABLE",
          ...driveRow("DRIVE_EXPORT_UNREACHABLE"), op, status: res.status,
          locator: driveCapture.address, export_address: driveCapture.exportAddress,
          drive: { host: driveCapture.host, shape: driveCapture.shape,
                   kind: driveCapture.kind, file_id: driveCapture.fileId,
                   export_format: driveCapture.format },
          detail: `Google answered ${res.status} at the OpenDocument export address `
                + `${driveCapture.exportAddress}, which this instance composed from the ${driveCapture.kind} `
                + `id in ${driveCapture.address}. Nothing was captured, and the application page at the `
                + `document's own address was NOT captured in its place — a fallback to the shell would `
                + `record a success holding no document. A 404 usually means the id is wrong; a 403 `
                + `usually means the file is not shared with anyone who has the link.` }, 502);
      }
      if (driveCapture) {
        /* THE SHELL, ON THE DECLARED TYPE. Google answers the export address with
           `text/html` — a sign-in page, an error page, the app — when the file is
           not shared with anyone who has the link. It arrives with HTTP 200, so
           the status check above does not see it. It is refused BY NAME and the
           body is never read: not parsed, not sniffed, not filed. The BYTES arm
           of the same refusal sits after the stream, where bytes exist. */
        const ect = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
        if (ect === "text/html" || ect === "application/xhtml+xml") {
          await noteOutcome("source_refused", res.status);
          try { await res.body?.cancel?.(); } catch { /* the source may already be gone */ }
          return json({ ok: false, reason: "DRIVE_EXPORT_IS_THE_SHELL",
            ...driveRow("DRIVE_EXPORT_IS_THE_SHELL"), op, status: res.status,
            locator: driveCapture.address, export_address: driveCapture.exportAddress,
            declared_content_type: ect, refused_on: "the declared content type",
            drive: { host: driveCapture.host, shape: driveCapture.shape,
                     kind: driveCapture.kind, file_id: driveCapture.fileId,
                     export_format: driveCapture.format },
            detail: `the OpenDocument export address answered with \`${ect}\`, which is the Google Drive `
                  + `APPLICATION — a client-rendered shell whose bytes carry no document (framework Part I `
                  + `§6's UNWATCHABLE case, D-64/D-55). It is refused by name and it is not parsed: the `
                  + `shell is never filed as the document. Google serves it here when the file is not `
                  + `shared with anyone who has the link.` }, 502);
        }
      }
      /* END DEC-49 REGION is-drive-export */
      if (!res.ok) {
        await noteOutcome("source_refused", res.status);
        return json({ ok: false, reason: "SOURCE_REFUSED", status: res.status, locator }, 502);
      }
      await noteOutcome("success", res.status);

      /* Streamed in parts, so peak residency is one part rather than the whole
         document. The 39.6MB budget book in the real record is the case that
         forced this: a Worker that must hold a document to hash it cannot
         capture the documents a city actually publishes.
         *
         * The incremental hasher is the CATALOG'S, the same one C-18.6 uses to
         * verify parts on the way back out. If the plane hashed the whole with
         * WebCrypto and the catalog rehashed the parts with its own
         * implementation, a disagreement between the two would look like
         * tampering. Using one hasher for both makes that class of false alarm
         * impossible.
         *
         * A single part under the inline bound stays a single capture, so the
         * common case is unchanged and the parts shape appears only when a
         * document actually needs it. */
      const PART = 8 * 1024 * 1024;
      const MAX = 256 * 1024 * 1024;
      const whole = createSha256();
      const parts = [];
      let total = 0, held = [], heldBytes = 0, oversize = false;

      const flush = async () => {
        if (!heldBytes) return;
        const buf = new Uint8Array(heldBytes);
        let at = 0; for (const c of held) { buf.set(c, at); at += c.length; }
        held = []; heldBytes = 0;
        const d = await crypto.subtle.digest("SHA-256", buf);
        const psha = [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
        if (!(await env.CAPTURES.head(`${storeName}/captures/${psha}`)))
          await env.CAPTURES.put(`${storeName}/captures/${psha}`, buf, { sha256: d });
        parts.push({ sha256: psha, bytes: buf.length });
      };

      /* CAP-8: the first kibibyte of a DRIVE export, kept so the shell can be
         recognised from the BYTES and not only from what Google declared. Gated
         on `driveCapture` so the ordinary capture path allocates nothing and
         behaves byte-for-byte as it did — the over-strictness arm measures
         exactly that. 1024 is `detectFormat`'s own sniff window, so the plane
         and the registry agree about how much a header is. */
      const driveHead = driveCapture ? new Uint8Array(1024) : null;
      let driveHeadBytes = 0;
      const reader = res.body && res.body.getReader ? res.body.getReader() : null;
      if (!reader) return json({ ok: false, reason: "NO_BODY", locator }, 502);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > MAX) { oversize = true; break; }
        whole.update(value);
        if (driveHead && driveHeadBytes < driveHead.length) {
          const take = Math.min(value.length, driveHead.length - driveHeadBytes);
          driveHead.set(value.subarray(0, take), driveHeadBytes);
          driveHeadBytes += take;
        }
        held.push(value); heldBytes += value.length;
        if (heldBytes >= PART) await flush();
      }

      /* DEC-49 REGION is-drive-bytes
       *
       * THE SPAN `DRIVE_EXPORT_BYTES_ARE_THE_SHELL` names, and nothing else
       * (REC-71). A REGION of a few lines rather than the handler, so neither
       * the streaming loop above nor the codeless `TOO_LARGE`/`EMPTY` refusals
       * below are read as sites of this family's.
       *
       * WHY THIS IS A SECOND CODE AND NOT THE SAME ONE FIRING TWICE. PL-4
       * measured what happens when one predicate sits at two points: one of the
       * two becomes unreachable and can never be driven, so a refusal nobody can
       * drive is a refusal nobody can prove fires. These are two DIFFERENT
       * predicates over two different pieces of evidence, both drivable, and
       * they are two different findings about Google: C-48.5 is *"Google told us
       * it was a web page"*, this is *"Google told us it was a document and it
       * was a web page"*. The second is the more serious fact and deserves its
       * own name.
       *
       * DETECTION IS BYTES-FIRST AND CERTAIN (COFF-1's registry doctrine), which
       * is what makes this arm worth having: a byte signature ALWAYS outranks a
       * declared content type, so Google's declared type need not be trusted at
       * all. What is refused is the SHELL. A non-HTML export whose flavour is not
       * the one asked for is FILED with the disagreement stated on the hop, never
       * refused — the rule is that the shell is never filed as the document, not
       * that only a perfectly detecting export may be filed, and a fence tighter
       * than its rule is an undeclared interface change wearing the costume of
       * caution.
       *
       * ON RESIDENCY: for a single-part capture — every Drive export measured, and
       * the shell in every arm — nothing has been PUT yet, because `flush()` runs
       * below. A multipart body would have parts in R2 already; they are
       * unregistered and unreferenced, exactly as `TOO_LARGE`'s are, and the
       * record holds nothing. */
      if (driveCapture && driveHeadBytes > 0) {
        const sniff = detectFormat(driveHead.subarray(0, driveHeadBytes), null);
        /* What Google DECLARED, read here only so the refusal can report the
           disagreement. The capture path's own `ct` is derived below from the
           same header; this is a read of the response, not a second derivation. */
        const declared = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
        if (sniff.format === "html") {
          try { await reader.cancel(); } catch { /* the source may already be gone */ }
          await noteOutcome("source_refused", res.status);
          return json({ ok: false, reason: "DRIVE_EXPORT_BYTES_ARE_THE_SHELL",
            ...driveRow("DRIVE_EXPORT_BYTES_ARE_THE_SHELL"), op, status: res.status,
            locator: driveCapture.address, export_address: driveCapture.exportAddress,
            declared_content_type: declared || null, refused_on: "the bytes",
            detected: sniff,
            drive: { host: driveCapture.host, shape: driveCapture.shape,
                     kind: driveCapture.kind, file_id: driveCapture.fileId,
                     export_format: driveCapture.format },
            detail: `the OpenDocument export address served bytes that are HTML — ${sniff.signals.join("; ")} `
                  + `— while declaring \`${declared || "(no content type)"}\`. That is the Google Drive `
                  + `APPLICATION, not the document, and the declared type did not say so. Detection here is `
                  + `bytes-first and certain, which is the whole reason this arm exists beside the one that `
                  + `reads the header. Nothing was filed, and the shell is never filed as the document.` }, 502);
        }
      }
      /* END DEC-49 REGION is-drive-bytes */
      if (oversize) {
        try { await reader.cancel(); } catch { /* the source may already be gone */ }
        return json({ ok: false, reason: "TOO_LARGE", bytes: total, maxBytes: MAX,
                      detail: "the document exceeds what this surface will capture even in parts" }, 413);
      }
      await flush();
      if (total === 0) return json({ ok: false, reason: "EMPTY", locator }, 502);
      const sha = whole.hex();

      /* One part and small enough to be a plain capture: store the whole under
         its own hash so the ordinary single-file shape still applies. */
      let existed = false, multipart = parts.length > 1;
      if (!multipart) {
        const only = parts[0];
        if (only.sha256 !== sha) {
          /* Cannot happen: one part IS the whole. Asserted rather than assumed,
             because a mismatch here would mean the incremental hasher and
             WebCrypto disagree, and that would be worth knowing loudly. */
          return json({ ok: false, reason: "HASH_DISAGREEMENT",
                        detail: "the incremental hash and the block hash of the same bytes differ" }, 500);
        }
        existed = !!(await env.CAPTURES.head(`${storeName}/captures/${sha}`));
      }

      const ct = (res.headers.get("content-type") || "").split(";")[0].trim();

      /* WARC keeps the whole response. We kept content-type and threw the rest
         away, which meant Last-Modified and ETag were discarded at the only
         moment they existed, despite LINK-FIDELITY naming both as recordable
         evidence. Headers cost nothing to keep and cannot be recovered later:
         a capture taken without them is permanently poorer than one taken with.
         *
         * Every header the source sent, in the order it sent them, with
         * duplicates preserved. No allowlist: a header nobody thought to name
         * is exactly the one a later question turns out to need, and the volume
         * is a few hundred bytes against captures measured in megabytes. */
      const responseHeaders = [];
      for (const [k, v] of res.headers) responseHeaders.push([k, v]);

      /* Where the request actually landed. `res.url` is the post-redirect URL,
         so a locator that redirected records both ends. WARC would carry each
         hop as its own record; the runtime follows redirects internally and
         does not expose the chain, so we record the endpoints and say so
         rather than implying we watched every hop. */
      const transport = {
        requested: locator,
        resolved: res.url || locator,
        redirected: !!(res.url && res.url !== locator),
        status: res.status,
        http_headers: responseHeaders,
        /* WARC records WARC-IP-Address: the address that actually answered.
           The Workers runtime does not expose the peer address of an outbound
           fetch, so we do not have it and this says so rather than leaving a
           field a reader would take as absence of a redirect or of an address.
           Recorded as a named limitation because a silently missing field and
           an unobtainable one are different facts about the record. */
        peer_address: null,
        peer_address_unavailable: "the Workers runtime does not expose the peer address of an outbound fetch",
      };
      const name = (body.file || locator.split("/").pop() || "capture")
        .replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100) || "capture";

      const stLim = stGov;

      /* D-58. File the address this capture holds, UNCONDITIONALLY, beside the
         capture itself. This used to sit inside the subresource branch, behind
         three further guards (HTML content type, under the parse ceiling, the
         primary reading back out), so a capture that took any other path filed
         no address at all and could never be a link target however plainly the
         record held it.
         *
         * That was not a partial gap. It was worst on the document class this
         * project exists for: a council agenda PDF failed the content-type
         * guard, so every link pointing at it resolved `offsite` while its bytes
         * sat in the store. The reverse re-resolution loop is driven from this
         * index, so an index that reflects only HTML captured with subresources
         * on would have made the loop fire correctly and under-report silently,
         * which is worse than not running it: an `offsite` verdict that has been
         * re-checked looks settled.
         *
         * Nothing here needs the parser. The address, its normalised form, the
         * hash and the retrieval instant are all known the moment the bytes are.
         * The LINKS write legitimately needs the parse and stays where it is. */
      try {
        await stLim.fetch("http://x/recordcapturedlocator", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ address: addressIsDerived ? documentAddress : (res.url || locator),
            addressNorm: addressIsDerived ? addrNorm : normalizeAddress(res.url || locator),
            captureSha: sha, retrieved,
            /* D-96: a direct fetch is its own source, and the document address
               and the retrieval locator are the same string. An archive-sourced
               capture will name via 'archive.org' and split the two.
               *
               CAP-8: A DRIVE EXPORT SPLITS THEM TOO, WITH `via` STILL 'direct',
               AND THIS IS WHERE "KEEP THE LINK" IS ACTUALLY KEPT. The `address`
               column takes the Drive link EXACTLY as the source page carried it
               (`driveCapture.address` is the caller's own string, untouched);
               `address_norm` is that link through the plane's normaliser, so
               `resolveLinks` finds this capture for a page linking to the Doc;
               and `retrieval_locator` holds the export address we actually
               fetched. `res.url` is deliberately NOT used here — Google redirects
               the export to a `googleusercontent.com` download address, and
               filing the capture under THAT would file it under a one-time CDN
               URL that names no document and no link would ever resolve to. */
            via, retrievalLocator: locator }),
        });
      } catch { /* an unfiled address is not a failed capture */ }

      /* D-98 PRODUCER, and this is the entire extent of what the capture path
         may do about an undetermined capture: enqueue ONE event.
         *
         * Bob RULED that an undetermined-authority capture creates a task
         * automatically at capture. Writing the task here would mean a leaked
         * capture credential could choose an assignee, forge a history entry and
         * put text of its choosing in front of a member. It cannot. This names no
         * assignee, sets no status, writes no history, and cannot reach the tasks
         * table at all; the consumer decides every one of those and is the sole
         * writer. The blast radius of this credential stops at the queue.
         *
         * The event carries a capture_sha and NOT a bundle id, because at this
         * moment no bundle exists: op=acquire returns a document that op=promote
         * later files. The consumer resolves the sha through the register once it
         * does, and an event whose capture is never promoted simply waits rather
         * than inventing a subject to point at. */
      if (!authorityAsserted) {
        try {
          await stLim.fetch("http://x/taskenqueue", {
            method: "POST", headers: { "content-type": "application/json" },
            /* CAP-8: THE SUBJECT IS THE DOCUMENT, NOT THE EXPORT ADDRESS — and
               this line is here because the item would otherwise have made the
               record WORSE at the one place a person reads it. Before the Drive
               handler, acquiring a Doc link enqueued a task whose subject was
               that link; after it, the locator is the composed export address,
               so the member resolving "who issued this?" would have been shown
               `…/export?format=odt` instead of the document. `documentAddress`
               is the Drive link for a Drive capture and IS `locator` for every
               other direct capture, so no existing task changes by one byte.
               The ARCHIVE arm is deliberately left as it was: its subject is the
               replay URL today, which is a separate and pre-existing question
               this item does not answer by drive-by. */
            body: JSON.stringify({ kind: "authority-undetermined", captureSha: sha,
              subject: driveCapture ? documentAddress : locator, locator, at: retrieved }),
          });
        } catch { /* An unqueued task is not a failed capture. The capture is
                     still recorded as undetermined and C-18.9 still refuses it
                     at or past verified, so the fence holds without the inbox. */ }
      }

      /* Capture fidelity. A captured page whose stylesheets were never fetched
         renders bare, which makes the capture a poor rendition of what the
         source served even though its bytes are perfect. So on request the
         page's supporting files are fetched too, each one its own
         content-addressed capture holding exactly what the source sent, and a
         DERIVED companion is built that can be shown without any of them being
         re-fetched from the live web at viewing time.
         *
         * Opt-in, because it turns one fetch into up to forty-one and a caller
         * capturing a PDF should not pay for a parser it does not need.
         *
         * The primary is read BACK OUT of the store rather than held from the
         * stream. It costs one R2 read and it means the parser sees the bytes
         * the record actually holds, not a copy that was in flight beside them.
         * If those two ever differed, parsing the copy would hide it. */
      /* COFF-1 (I7): detection consults the FORMAT registry — the former
         HTML_CT constant moved into the registry's html entry, where every
         other format also lives. The consult is content-type-only at this
         seam because the primary has deliberately not been read back yet
         (that read happens inside the branch, and only once the guard has
         admitted it); magic-byte detection happens where bytes exist, at the
         profile stamp below. The subresource branch itself stays HTML-only
         in behaviour: a page is the only thing with subresources, and the
         guard admits exactly what it admitted before. */
      const SUB_PARSE_MAX = 8 * 1024 * 1024;
      /* Declared out here with subs, because the response literal below reads
         it and the capture branch is a nested block. It was declared inside
         that block, which threw only on a page big enough to need a session. */
      let subs = null, subsSkipped = null, sessionId = null;
      if (body.subresources === true) {
        if (multipart || total > SUB_PARSE_MAX)
          subsSkipped = { reason: "TOO_LARGE_TO_PARSE", detail:
            "subresource capture reads the primary back into memory to parse it, so it is bounded to "
            + `${SUB_PARSE_MAX} bytes; this document is ${total}` };
        else if (detectFormat(null, ct || null).format !== "html")
          subsSkipped = { reason: "NOT_HTML", content_type: ct || null, detail:
            "only an HTML page has subresources; the capture is unaffected and complete" };
        else {
          const obj = await env.CAPTURES.get(`${storeName}/captures/${sha}`);
          if (!obj) subsSkipped = { reason: "PRIMARY_UNREADABLE", detail: "the primary capture did not read back" };
          else {
            const primaryBytes = new Uint8Array(await obj.arrayBuffer());
            const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
            /* What this runtime was last OBSERVED to allow. Not a constant
               anywhere in this codebase: the number belongs to the platform,
               differs per account, and moves without notice, so it is read from
               what an earlier run learned by being refused. probeDue
               deliberately discards it every so often and runs to refusal
               again, because a ceiling only ever learned downward would leave an
               upgraded account at the old caps forever. */
            /* stLim is hoisted to the capture body above, where the
               unconditional locator write needs it. */
            /* Continuing a capture that ran out of budget. The primary is
               complete from tick one, so nothing here re-fetches it: only the
               outstanding support material is picked up. */
            let resumeState = null;
            sessionId = body.continue || null;
            if (sessionId) {
              try {
                const ld = (await (await stLim.fetch(`http://x/loadcapturesession?session=${encodeURIComponent(sessionId)}`)).json()).result;
                if (ld && ld.found) resumeState = ld.state;
                else subsSkipped = { reason: "NO_SUCH_SESSION", detail: ld && ld.note };
              } catch { subsSkipped = { reason: "SESSION_UNREADABLE" }; }
            }
            let limit = null;
            try { limit = (await (await stLim.fetch("http://x/capturelimit?runtime=subrequests")).json()).result; }
            catch { limit = null; }
            const useCeiling = limit && limit.observed && !limit.probeDue ? limit.observed : null;

            /* What this host has served before. Bytes were always shared by
               content-addressing; FETCHES were not, and fetches are the scarce
               thing. A stylesheet stable across the window and seen in more
               than one document is reused at zero subrequest cost, and every
               reuse is recorded as one. */
            let baseHost = null;
            try { baseHost = new URL(res.url || locator).hostname.toLowerCase(); } catch { baseHost = null; }
            let siteKnown = {};
            if (baseHost) {
              try {
                siteKnown = (await (await stLim.fetch("http://x/siteassets", {
                  method: "POST", headers: { "content-type": "application/json" },
                  body: JSON.stringify({ host: baseHost }),
                })).json()).result.assets || {};
              } catch { siteKnown = {}; }
            }

            subs = await captureSubresources({
              platformCeiling: useCeiling,
              resume: resumeState,
              siteLookup: baseHost ? async (norm) => siteKnown[norm] || null : null,
              readBack: async (sh) => {
                const o = await env.CAPTURES.get(`${storeName}/captures/${sh}`);
                return o ? new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(await o.arrayBuffer())) : null;
              },
              html: new TextDecoder("utf-8", { fatal: false }).decode(primaryBytes),
              base: res.url || locator,
              primarySha: sha,
              primaryFile: `snapshots/${name}`,
              isPublic: isPublicHttpsLocator,
              sha256: async (b) => hex(await crypto.subtle.digest("SHA-256", b)),
              put: async (s, b) => {
                const k = `${storeName}/captures/${s}`;
                if (await env.CAPTURES.head(k)) return { existed: true };
                await env.CAPTURES.put(k, b, { sha256: await crypto.subtle.digest("SHA-256", b) });
                return { existed: false };
              },
              fetchOne: async (u) => {
                /* D-95, the subresource case. A PERSON'S browser bursts a
                   page's assets; it is document loads that a person paces. So
                   subresources ride the primary fetch's admission rather than
                   consuming a token apiece (forty tokens for one page would
                   pace like nothing human), take a small jittered stagger the
                   way a browser's connection pool does, and REPORT every
                   outcome so a refusal mid-page still teaches the governor.
                   A host that has entered cool-off since the primary was
                   admitted stops the remaining assets. */
                let subHost = null;
                try { subHost = new URL(u).host; } catch { /* refused below by the fetch itself */ }
                if (subHost) {
                  try {
                    const st = await (await stGov.fetch(`http://x/governorstate?host=${encodeURIComponent(subHost)}`)).json();
                    const row = st?.result?.hosts?.[0];
                    if (row && row.cooloff_until > Date.now())
                      return { ok: false, status: 0, reason: "HOST_COOLING_OFF" };
                  } catch { /* an unreadable governor never blocks; politeness, not coordination */ }
                }
                const stagger = env.GOVERNOR_SUBRESOURCE_STAGGER_MS !== undefined
                  ? Number(env.GOVERNOR_SUBRESOURCE_STAGGER_MS) || 0
                  : 50 + Math.floor(Math.random() * 200);
                if (stagger) await new Promise((s) => setTimeout(s, stagger));
                const r = await fetch(u, { redirect: "follow", headers: { "user-agent": userAgent(env, "acquire") } });
                if (subHost) {
                  try {
                    await stGov.fetch("http://x/governorreport", {
                      method: "POST", headers: { "content-type": "application/json" },
                      body: JSON.stringify({ host: subHost, status: r.status,
                        retry_after_ms: (() => { const ra = r.headers.get("retry-after"); if (!ra) return null;
                          const n = Number(ra); return Number.isFinite(n) ? n * 1000 : Math.max(0, Date.parse(ra) - Date.now() || 0); })() }),
                    });
                  } catch { /* an unrecorded outcome is not a failed fetch */ }
                }
                if (!r.ok) return { ok: false, status: r.status, reason: "SOURCE_REFUSED" };
                return { ok: true, status: r.status,
                         bytes: new Uint8Array(await r.arrayBuffer()),
                         contentType: r.headers.get("content-type") || "" };
              },
            });
            /* Report what the run learned, INCLUDING learning nothing. A run
               never refused is filed as such: it advances the counter toward the
               next probe and does not pretend its spend was the limit. */
            try {
              subs.limitRecord = (await (await stLim.fetch("http://x/recordcapturelimit", {
                method: "POST", headers: { "content-type": "application/json" },
                body: JSON.stringify({ runtime: "subrequests", observed: subs.manifest.platform.observed_ceiling }),
              })).json()).result;
            } catch { /* an observation that could not be filed is not a capture failure */ }
            /* Park what is left, or clear the session when there is nothing
               left. A capture that finished must not leave a row behind saying
               it has work outstanding. */
            if (subs.resumeState) {
              sessionId = sessionId || `cs_${sha.slice(0, 16)}_${Date.now().toString(36)}`;
              try {
                subs.session = (await (await stLim.fetch("http://x/savecapturesession", {
                  method: "POST", headers: { "content-type": "application/json" },
                  body: JSON.stringify({ session: sessionId, locator, primarySha: sha,
                    primaryFile: `snapshots/${name}`, base: res.url || locator, state: subs.resumeState }),
                })).json()).result;
              } catch { /* an unparked session means the caller starts over, not that the capture failed */ }
            } else if (sessionId) {
              try { await stLim.fetch(`http://x/dropcapturesession?session=${encodeURIComponent(sessionId)}`); } catch {}
            }
            /* File what this capture COST. Measured every run, because a CPU
               overrun terminates the isolate and can never report itself: the
               only way to know the headroom is to know the consumption. */
            try {
              subs.computeRecord = (await (await stLim.fetch("http://x/recordruntime", {
                method: "POST", headers: { "content-type": "application/json" },
                body: JSON.stringify({ metric: "capture_work_bytes",
                  ms: subs.manifest.compute.work_bytes,
                  detail: `${subs.manifest.compute.work_calls} compute calls over `
                        + `${subs.manifest.compute.work_bytes} bytes; ${subs.manifest.counts.fetched} fetched, `
                        + `${subs.manifest.discovered} discovered` }),
              })).json()).result;
            } catch { /* an unfiled measurement is not a failed capture */ }
            /* The address is filed above, unconditionally, for every capture.
               What is left here is the LINKS write, which genuinely needs the
               parse and therefore genuinely belongs inside this branch. */
            try {
              if (subs.links && subs.links.length) {
                await stLim.fetch("http://x/recordlinks", {
                  method: "POST", headers: { "content-type": "application/json" },
                  body: JSON.stringify({ sourceCapture: sha, capturedAt: retrieved,
                    /* Anchors are filed too. An in-page anchor is an element
                       reference into this document, which makes it a component
                       reference rather than noise; dropping it left the manifest
                       counting 27 anchors while the links table held none. */
                    links: subs.links.filter((l) => l.address).map((l) => ({
                      ref: l.ref, address: l.address,
                      address_norm: normalizeAddress(l.address),
                      citation_norm: l.citation || normalizeCitation(l.address),
                      fragment: l.fragment || null,
                      type: l.type, origin: l.origin })) }),
                });
              }
            } catch { /* an unfiled link is not a failed capture */ }
            /* File what this run saw of the host. The change case matters most:
               an address returning different bytes is a dated fact about the
               site AND retrospectively puts every document that reused the old
               bytes into question, so both are recorded and the affected
               documents are named. */
            if (baseHost && subs.siteObservations && subs.siteObservations.length) {
              try {
                subs.siteRecord = (await (await stLim.fetch("http://x/recordsiteassets", {
                  method: "POST", headers: { "content-type": "application/json" },
                  body: JSON.stringify({ host: baseHost, primarySha: sha, observations: subs.siteObservations }),
                })).json()).result;
              } catch { /* likewise */ }
            }
          }
        }
      }

      /* CONSTRUCTS Step 1 (FW-3): the plane RECORDS THE PROFILE. docprofile is
         READ, never copied — identify() names the host stack and doctypeFor()
         names the kind of content, each with a confidence and its signals, and,
         the part the whole ladder above rests on, each recogniser's own key and
         VERSION so a judgment can be found and revised when the recogniser later
         turns out wrong. The profile is a sibling field on the acquire document
         (op=promote persists it into data/provenance.json); it ADDS to the record
         and reshapes no existing field, so it is additive to I1.

         The recognisers read the document as TEXT, so the primary is read back out
         of the store — bounded, and only when the bytes are single-part and look
         textual — for the same reason the subresource walk reads it back: the
         recogniser must see the bytes the record actually holds. A PDF or a
         multipart giant is neither cheap to decode nor something these HTML-stack
         recognisers can read, so it is HONESTLY left unread (text ""), which lands
         it on the conservative handler and the generic type rather than a guess.
         Even then the headers and the address still carry signal. */
      const PROFILE_TEXT_MAX = 8 * 1024 * 1024;
      let profileText = "", profileBytes = null;
      if (!multipart && total <= PROFILE_TEXT_MAX
          && /^(?:text\/|application\/(?:xhtml\+xml|xml|json)|application\/[a-z0-9.+-]*\+xml)/i.test(ct || "")) {
        try {
          const pobj = await env.CAPTURES.get(`${storeName}/captures/${sha}`);
          /* The raw bytes are kept, not just the decoded text: FW-4's digests()
             hashes them for `identity` (which must equal the capture sha) and
             re-encodes the normalised text for the other two. */
          if (pobj) { profileBytes = new Uint8Array(await pobj.arrayBuffer());
                      profileText = new TextDecoder("utf-8", { fatal: false }).decode(profileBytes); }
        } catch { /* an unreadable primary is not a failed capture: the profile below
                     still records what the headers and the address say. */ }
      }
      /* COFF-1 (I7): what the FORMAT registry's detect() found, stamped into
         the profile ADDITIVELY (I1 §4c gains `format`, 1.3.0 — the FW-3/FW-4
         precedent: a new sibling key, no existing field reshaped). Magic
         bytes first: when FW-3 already read the primary back as text those
         bytes are sniffed; when it did not (a PDF, a non-textual type), the
         first KiB is range-read from R2 — detection needs a header, not the
         document — and only a multipart or unreadable primary falls back to
         the declared content type, with the absence stated in signals. */
      let formatBytes = profileBytes;
      if (!formatBytes && !multipart && total > 0) {
        try {
          const fobj = await env.CAPTURES.get(`${storeName}/captures/${sha}`,
            { range: { offset: 0, length: Math.min(1024, total) } });
          if (fobj) formatBytes = new Uint8Array(await fobj.arrayBuffer());
        } catch { /* detection falls back to the declared content type; detect()
                     states in its signals that no bytes were available. */ }
      }
      const profHeaders = {};
      for (const [hk, hv] of res.headers) profHeaders[hk.toLowerCase()] = hv;
      const profCtx = { headers: profHeaders, locator: documentAddress, content_type: ct || null, text: profileText };
      const stackId = identify(profCtx);
      const docType = doctypeFor({ ...profCtx, handler: stackId.handler, kind: stackId.kind });
      const profile = {
        /* The STACK axis, via docprofile's own serialiser (handler key/label/
           version, its confidence, its signals, the document kind, what was
           considered, the instant, and any note). Reused rather than restated so
           the record's notion of "how a document was profiled" lives in one place. */
        ...profileRecord(stackId, { now: retrieved }),
        /* The CONTENT-TYPE axis beside it: the second confidence and second signal
           set the item asks for, keyed distinctly from the stack axis's. */
        content_type: docType.type.key,
        content_type_label: docType.type.label,
        content_type_version: docType.type.version,
        content_type_confidence: docType.confidence,
        content_type_signals: docType.signals,
        contract: docType.type.contract || null,
        /* What this handler treats as machinery/furniture on this class of
           document — the normalisation the profile's judgment rests on. Declared
           (region + label), not the computed digests: those are Step 2, with their
           own consumers. Recorded so a later reader can see WHY a digest called
           certain bytes non-substantive. */
        normalised: (typeof stackId.handler.rules === "function"
          ? stackId.handler.rules(profCtx) : []).map((r) => ({ region: r.region, label: r.label })),
        boundary: !!(typeof stackId.handler.boundary === "function" && stackId.handler.boundary(profCtx)),
        /* The source's own Content-Type, distinct from the recognised content
           TYPE above: one is what the server declared, the other is what the
           record decided the document is. */
        source_content_type: ct || null,
        profiled_from_text: !!profileText,
        /* COFF-1 (I7): the FORMAT axis — { format, confidence, signals }
           exactly as detectFormat returned it, `undetermined` first-class
           when nothing matched. Advisory like the rest of the profile: it
           records what the record THINKS the bytes are, never authority. */
        format: detectFormat(formatBytes, ct || null),
      };

      /* CAP-8 — THE HOP, BUILT HERE AND FROM WHAT THIS CALL ITSELF ESTABLISHED.
         `archiveHop`'s discipline, one host stack over (D-112): the export
         address came from the recogniser's composition, the export format from
         the kind in the address, the producer is a constant in `drive.mjs`, and
         the confirmation comes from the FORMAT registry's own detection over the
         bytes we just hashed — `profile.format`, reused rather than re-detected,
         so the hop and the profile cannot disagree about what these bytes are.
         Not one field of it is readable off a request body.

         WHAT THE HOP DISCLOSES, AND IT IS NARROW ON PURPOSE: that Google served a
         conversion of the named file at the named address, in the named format,
         at the named instant. It asserts nothing about the FIDELITY of the
         conversion — nobody outside Google has seen the stored original — and
         nothing about the credibility of the content. Transitive trust is
         accepted WHERE DISCLOSED, and what is inherited is the FACT OF
         PUBLICATION (RULED, AUTHORITY-AND-TRUST.md). `bound: false`, with the
         reason in words rather than left to inference.

         THE GRADE IS NOT TOUCHED BY THIS, AND THAT IS A DECISION RATHER THAN AN
         OVERSIGHT — REC-50's shape, one axis over. Grade tracks DIRECTNESS and
         this fetch is direct: we asked Google and Google answered us. Whether a
         CONVERSION should nonetheless cap below a direct capture of original
         bytes is a second capture-axis doctrine value, and minting a constant for
         it would settle a question that is Bob's. It is routed rather than
         written here, and the chain discloses the conversion either way. */
      if (driveCapture) {
        driveHopRecorded = driveHop(driveCapture,
          { retrieved, resolved: res.url || null, detected: profile.format });
      }

      /* CONSTRUCTS Step 2 (FW-4): COMPUTE and STORE the normalisation digests the
         profile's declared policy above defines. docprofile names THREE digests
         (DOCUMENT-PROFILES.md, "Three digests, not one"):

           identity     sha256 of the raw bytes — the capture's name. This ALREADY
                        exists as `capture_sha` (I1 §1) and is NOT recomputed under
                        a second name: it is `sha`, and digests().identity is only
                        used to VERIFY the read-back bytes are the registered ones.
           rendition    mechanical regions normalised — "would this look the same?"
           evidentiary  presentational AND mechanical normalised — "has the
                        substance changed?" This is the one the dup sweep compares.

         The digests are stored ONLY when they can be trusted to assert sameness:
         the bytes were read as text AND the stack was identified with CERTAINTY (a
         signal only that stack emits, e.g. Legistar's __VIEWSTATE field). The
         failure asymmetry runs the OTHER WAY here than in compare(): reporting a
         change that did not happen costs attention, but folding two DISTINCT review
         items into one corroboration HIDES a document — so a normalised digest that
         claims "same substance" must be earned. That is why the conservative
         handler's narrow-without-certainty licence (which compare() honours because
         its job is to over-report CHANGE) is deliberately NOT extended to dedup: a
         merely-likely or unrecognised document records its normalised digests
         ABSENT (null), never a fabricated value, and the sweep must never treat two
         absents as equal. */
      const digestCertain = !!profileBytes && stackId.handler.textual === true
        && stackId.confidence === CONFIDENCE.CERTAIN;
      if (digestCertain) {
        const dg = await digests(profileBytes, stackId.handler, { ...profCtx, sha256: sha256Hex });
        if (dg.identity !== sha) {
          /* The bytes read back are not the bytes registered. An equality asserted
             on the wrong bytes is worse than none, so refuse to claim a digest
             rather than store one computed from something else (CLAUDE.md: an
             equality that costs nothing to produce is not evidence). */
          profile.digests = { determined: false, rendition: null, evidentiary: null,
            basis: "the primary bytes read back from the store did not hash to the capture identity, so no normalised digest could be trusted" };
        } else {
          profile.digests = {
            determined: true,
            rendition: dg.rendition,
            evidentiary: dg.evidentiary,
            boundary_missed: !!dg.boundary_missed,
            basis: `normalised under ${stackId.handler.key} v${stackId.handler.version} (certain); identity is the capture sha`,
          };
        }
      } else {
        profile.digests = {
          determined: false, rendition: null, evidentiary: null,
          basis: profileBytes
            ? `the ${stackId.handler.key} stack was not identified with certainty (${stackId.confidence}); its normalisation is not trusted to assert sameness, so the substance digest is undetermined`
            : `the document was not read as text (${multipart ? "multipart" : "non-textual or too large"}); no normalisation was applied, so the substance digest is undetermined`,
        };
      }

      /* 2026-09-14, REC-81: every citation into the content framework in this file
         names a SECTION rather than a line. The line numbers they carried went stale
         the moment the framework gained front matter — 89 lines, measured — and
         CORPUS-STANDARD.md §4.6 rules that a citation into a design document names
         the SECTION. */

      /* CONSTRUCTS Step 3 (FW-5): the plane READS the document. The doctype
         resolved above (docType) declares a reader — parse(ctx) -> reading:
         entities[] + document facts (framework §7). Run it over the SAME captured
         text FW-3 already read back, and carry the reading on the acquire document
         so op=promote can persist it beside the register row (the reading is
         per-capture, written when the capture is promoted — never here, because no
         intake path writes live state).

         "A reading that finds nothing is a failed reader, never an emptied
         document" (framework §7). A reader that is absent, that could not run
         (the bytes were not read as text), or that found nothing is recorded
         HONESTLY as a failed/empty reading — found:false, no entities — never
         backfilled with invented entities to make it look productive. That
         asymmetry is the single most dangerous error available to this layer, so
         the failure direction is the safe one and it is stated.

         The entity REFERENCES are carried AS THEY APPEAR: each entity's raw,
         source-assigned kind:key (an id in a URL is a key, framework §7). They are
         NOT resolved to a canonical entity id — that, and the subject registry,
         are Step 4 / D-83 and are deliberately not built here. The reference is
         what op=promote indexes so a later lookup by reference returns the
         documents whose readings carry it. */
      /* CPDF-19: `readEntities` is now a MODULE-LEVEL function (moved verbatim, just above
         `readingFromWire`), because the read path's re-extraction composes a reading by the
         same rule and a second copy would be two spellings of one boundary. */
      let reading;
      /* REC-91: declared BESIDE `reading` and not beside `containerExtent`, and
         the difference is a scope rather than a preference. `wired`,
         `pageCount` and `containerExtent` live in the FORMAT WIRE's own block,
         which closes before the answer is assembled — they reach the answer by
         being written ONTO `reading`. This one is a SIBLING of `reading` on the
         wire rather than a field on it (see the answer's own note), so it has to
         outlive that block, and declaring it inside was a ReferenceError on every
         acquire until this suite drove one. */
      let textUnits = null, textUnitsOverBound = 0;
      const canRead = !!profileText && typeof docType.type.parse === "function";
      if (canRead) {
        try {
          const parsed = docType.type.parse({ ...profCtx, handler: stackId.handler, at: retrieved }) || {};
          const { entities: parsedEntities, ...rest } = parsed;
          /* Document facts: the reader's own `facts` object when it returned one
             alone (the generic shape), otherwise the named top-level keys it
             returned beside its entities (a calendar's window and reading instant).
             Either way it is what the reader said, never invented. */
          const facts = (rest && typeof rest.facts === "object" && Object.keys(rest).length === 1)
            ? rest.facts : rest;
          const entities = readEntities(parsedEntities);
          reading = {
            content_type: docType.type.key, reader_version: docType.type.version ?? null,
            read_from_text: true, found: entities.length > 0,
            entities, facts: facts || {}, at: retrieved,
            basis: entities.length
              ? `read by the ${docType.type.key} reader v${docType.type.version}`
                + `${entities.some((e) => e.source) ? "" : " — no reference carries where it was read: this "
                  + "document was read as one undivided string, which names no part of a container to point at"}`
              : `the ${docType.type.key} reader found no entities in this document; recorded as an empty reading, never an emptied document`,
            /* FW-17 / IC-86: the acquire path's own text read-back is a BARE
               DECODED STRING with no itemisation, so there is no segment map and
               no position to carry. Stated rather than left to a null column. */
            position_parts: 0,
            position_why: entities.some((e) => e.source) ? null
              : "the text was read back as one decoded string, which carries no container structure, so "
              + "where in the document a reference was read cannot be said",
          };
        } catch (e) {
          /* A reader that THREW read nothing. A failed reading, stated, never a
             fabricated one. */
          reading = {
            content_type: docType.type.key, reader_version: docType.type.version ?? null,
            read_from_text: true, found: false, entities: [], facts: {}, at: retrieved,
            basis: `the ${docType.type.key} reader could not parse this document (${String(e && e.message || e)}), so nothing is claimed about its entities`,
          };
        }
      } else if (profileText) {
        /* Read as text, but the resolved type declares no reader. Unchanged
           from FW-5 (read_from_text mirrors whether a READER ran, as before). */
        reading = {
          content_type: docType.type.key, reader_version: docType.type.version ?? null,
          read_from_text: false, found: false, entities: [], facts: {}, at: retrieved,
          basis: `the ${docType.type.key} content type declares no reader, so this document has no reading`,
        };
      } else {
        /* FW-15: THE L2→L3 WIRE. The document was not read as text at intake
           (a PDF, an office container — any non-textual single-part capture),
           but the FORMAT axis (COFF-1) may know how to produce its TEXT, and
           the intent layer runs over TEXT from anywhere: docprofile's ONE
           entry point (readText) takes I2's text field — whatever tier or
           container produced it — and runs identify()/doctypeFor()/parse()
           over it, so op=acquire produces a reading for a PDF exactly as it
           does for an HTML page.

           The honesty rules ride the entry point and are recorded here:
           a tier that could not decode SAYS SO; text-undetermined is a FAILED
           reading (found:false, the producer's own markers named), never a
           fabricated one; a PARTIAL decode reads only with the shortfall
           STATED on the basis. Tier 1 runs in-plane; the pdf-worker (I6) is
           consulted through the same measured predicate op=pdfstructure uses
           (needsTier2: Tier 1 got essentially nothing) when the binding
           exists. OCR is NOT here (CPDF-10): a document with no text layer
           stays honestly unread. */
        /* CAP-9 / D-345: the page count rides beside `wired`/`wiredTier`
           because it is the same kind of fact — what the FORMAT wire learned
           about this document on this pass — and it stays null until a producer
           that actually counts pages answers. */
        /* CAP-12 / D-354: the CONTAINER'S OWN EXTENT rides here for the same
           reason the page count does — it is a fact the FORMAT wire learned
           about this document on this pass — and it stays null until an entry
           that actually itemises a container answers. */
        let wired = null, wiredTier = null, pageCount = null, containerExtent = null;
        /* CPDF-10: the chain this text's provenance will be recorded as, built
           up as the wire actually walks it rather than labelled at the end. It
           starts empty and is null until a text surface answers, so a document
           that never reached one carries NO chain rather than a chain claiming
           a layer it does not have. `ocrNote` carries the Tier-3 finding for a
           document that wanted OCR and could not have it. */
        /* REC-98 / D-283: `tier2note` is `ocrNote`'s counterpart one tier down —
           what the TIER-2 merge found, for a document whose text layer is a merge
           of two decodes or whose Tier-2 escalation was refused. It rides beside
           `ocrNote` for the reason D-252 gives for `ocrNote` itself: a finding
           computed and then dropped on the floor is the document-level answer
           standing in for a per-page fact all over again. `null` when there is
           nothing to say, so a document no page moved on reads as it always did. */
        /* REC-102 / D-372: `tier2PerPage` is the TIER-2 MERGE'S OWN PER-PAGE
           STATEMENT — `{tier1: [...], tier2: [...]}` — carried to the tier-3
           block below, which is the only other place in this assembly that
           composes a layer part. It rides here rather than being re-derived
           there for the reason D-164 gives about second spellings: the merge
           already said which tier produced each page, and asking a second time
           is how the two answers learn to disagree. `null` means no tier-2
           merge produced a per-page partition — either tier 2 never ran, or it
           took the document WHOLESALE — and the tier-3 block's fall-back to the
           single document-level tier is then exactly what it always did. */
        let chain = null, ocrNote = null, tier2note = null, tier2PerPage = null;
        /* D-418: whether the tier-3 seam left this document still wanting OCR. */
        let t3Wanting = false;
        const fmt = profile.format && profile.format.format;
        if (!multipart && fmt && fmt !== "undetermined") {
          try {
            const entry = getFormat(fmt);
            if (entry && (typeof entry.text === "function" || typeof entry.structure === "function")) {
              const wobj = await env.CAPTURES.get(`${storeName}/captures/${sha}`);
              const wbytes = wobj ? new Uint8Array(await wobj.arrayBuffer()) : null;
              let i2text = null;
              if (wbytes && typeof entry.text === "function") {
                /* The office shape: text() takes parts (or bytes — the entries
                   accept both) and returns the I2 text shape, including the
                   pageless paragraphs[] degenerate form (I2 1.1.0). */
                const parts = typeof entry.parts === "function" ? await entry.parts(wbytes) : wbytes;
                const tt = await entry.text(parts);
                if (tt && tt.ok !== false) { i2text = tt; wiredTier = 1; }
              } else if (wbytes && typeof entry.structure === "function") {
                /* The PDF shape: Tier-1 text rides structure()'s own I2 object
                   (pdfstructure.mjs's do-not-fork rule). */
                const st = await entry.structure(wbytes);
                if (st && st.ok) {
                  i2text = st.text || null; wiredTier = 1;
                  /* CAP-9 / D-345: I2's OWN page count, taken at the one place
                     I2 answers it. `structure()` returns `pages: doc.pageCount`
                     (I2's top-level field, registry §"The shape"), and this
                     path threw it away — so nothing in the plane persisted a
                     page count and IC-83's "the page count I2 already carries
                     at acquire" had no source. It is READ, never re-derived:
                     counting `st.text.pages` here would be a second opinion
                     about one number, three lines from the first. A count of
                     zero is NOT a page count — it is a document with no pages
                     the structure reader could order — and it stays null. */
                  if (Number.isInteger(st.pages) && st.pages > 0) pageCount = st.pages;
                  if (env.PDF_WORKER && needsTier2(i2text)) {
                    try {
                      const r = await env.PDF_WORKER.fetch("https://pdf-worker/structure", {
                        method: "POST", headers: { "content-type": "application/json" },
                        body: JSON.stringify({ capture_sha: sha, store: storeName }),
                      });
                      const t2 = await r.json();
                      if (r.ok && t2 && t2.ok && t2.text) {
                        /*__REC98_TIER2_WIRE_ACQUIRE_START__*/
                        /* REC-98 / D-283 — CALL SITE 2 OF 2. This line was
                           `i2text = t2.text` with the D-251 carry wrapped round
                           it: the member's decode of EVERY page assigned over
                           Tier 1's on the strength of a document-level predicate.
                           Same defect, same shape and one tier down from D-252's
                           `i2text = built.text` twelve lines below — which is why
                           `mergeTier2Text` is deliberately `mergeTier3Text`'s
                           shape with its comparison changed rather than a second
                           mechanism invented for one job. */
                        const m = mergeTier2Text(i2text, t2.text);
                        if (m.ok) {
                          const tier1Text = i2text;
                          /* D-251, UNCHANGED IN EFFECT AND MOVED ONE LINE OUT.
                             WHO MADE THE LAYER IS A FACT ABOUT THE FILE, NOT
                             ABOUT THE TIER THAT READ IT. The member returns the
                             I2 text shape without a `producer` field, so handing
                             its answer through unchanged would DROP the marker on
                             exactly the documents most likely to carry one — a
                             scanned certified resolution is the class that both
                             escalates and names ABBYY. The page-wise merge keeps
                             it by construction; this closes the WHOLESALE branch
                             `mergeTier2Text` takes for a document Tier 1 read
                             nothing of, which is the same branch this line always
                             served. Carried forward, never re-derived, and only
                             when the member supplied none of its own. */
                          i2text = (tier1Text && tier1Text.producer && !m.text.producer)
                            ? { ...m.text, producer: tier1Text.producer } : m.text;
                          /* REC-102 / D-372 — THE PER-PAGE STATEMENT IS KEPT,
                             because the tier-3 block below composes a layer
                             part too and had no way to know what this merge
                             decided. Taken from the merge's own return rather
                             than from the `tier` stamps on the pages: one fact,
                             one home, and `tier-pagewise.test.mjs` already
                             asserts the two agree. */
                          tier2PerPage = m.perPageTier;
                          /* TIER 2 ONLY IF TIER 2 ACTUALLY PRODUCED A PAGE. A
                             document where the member answered and no page met
                             the rule was read by Tier 1, and saying `2` would be
                             the record claiming a derivation no page of it has. */
                          if (m.replaced.length) wiredTier = 2;
                          /* THE CHAIN RECORDS THE WINNER PER PAGE — the half of
                             §5.2 that is not a merge, and the reason this needed
                             the control plane rather than `textchain.mjs`. The
                             parts mechanism is D-252's `mergedChain`, reused
                             rather than re-invented: one part per stretch with
                             its own provenance, each stamped with the pages it
                             covers. Both parts are `layer` derivations of the
                             same file, so both read the producer off the same
                             document and differ only in `tier`.
                             SET ONLY WHEN THE DOCUMENT IS ACTUALLY MIXED. With
                             one part `mergedChain` returns that chain UNSCOPED,
                             which is exactly what the tail's `layerChainFor`
                             already produces — so a wholly-tier-1 and a
                             wholly-tier-2 document record byte-for-byte what they
                             recorded before this wire existed, and only a
                             document that really is a merge gets a scoped chain.
                             Leaving `chain` null here is what hands the unmixed
                             cases back to that one existing site. */
                          if (m.replaced.length && m.kept.length) {
                            const merged = mergedChain([
                              { pages: m.kept,     chain: layerChainFor(i2text, { tier: 1, container: fmt }) },
                              { pages: m.replaced, chain: layerChainFor(i2text, { tier: 2, container: fmt }) },
                            ]);
                            /* A refusal from the chain builder records NO chain
                               rather than filing merged text under one tier's
                               provenance — D-252's rule, and the tail will then
                               compose the unscoped chain as it always did. */
                            if (Array.isArray(merged)) chain = merged;
                          }
                          tier2note = tier2Note(m);
                        } else {
                          /* REFUSED: no page grain to merge on and Tier 1 already
                             holds text. Tier 1 stands, and the reason is CARRIED
                             rather than computed and dropped on the floor —
                             D-252's own correction, which found `ocrNote` doing
                             exactly that one tier up. */
                          tier2note = m.why;
                        }
                        /*__REC98_TIER2_WIRE_ACQUIRE_END__*/
                      }
                    } catch { /* member unavailable: Tier 1's honest answer stands */ }
                  }
                }
              }
              /* CPDF-10 — TIER 3, AND WHICH BRANCH RUNS IS A FACT ABOUT THE
                 INSTANCE, NOT ABOUT THE FLEET.
                 The document reached a text surface and that surface reports
                 pages it recovered NOTHING for: a scan. This is the seam an OCR
                 producer plugs into, AND THE PRODUCER EXISTS — `ocr-worker` is
                 the third fleet member (CPDF-10, `698a07b`), bound as
                 `OCR_WORKER` in `wrangler.jsonc`, shipped and deployed in
                 release 0.58.0 (`e67e275`). So on the project's own instance
                 this branch is TAKEN. On an instance with no OCR member the
                 `else` below runs and is equally honest: the document is NAMED
                 as wanting OCR and is left unread rather than being quietly
                 filed as an empty document — D-115's rule for an un-fleeted
                 instance, one tier further on. Both branches are true; neither
                 is the placeholder.

                 CORRECTED 2026-09-14 (CPDF-17). This block used to say "the
                 binding does not exist yet — so the branch that would call it
                 is present, narrow and UNTAKEN". That was true when D-252 wrote
                 the merge against a stub producer and FALSE from CPDF-10's
                 landing onward, and a comment describing a mechanism that no
                 longer exists is the record overclaiming (D-334's
                 posture-string precedent, and D-106's class). The verified
                 state of this branch — driven against the tree rather than
                 copied from this comment — is Part II §16.4 of
                 `docs/architecture/BIO_Content_Framework_v0_10.md`, which is
                 the authority if this text and the tree ever disagree again. */
              /* CPDF-19 / D-319: THE SEAM LIVES IN `tier3Extend` NOW, moved verbatim so
                 `op=pdfstructure&ocr=1` composes by the same rule. Nothing about what
                 the acquire path records changed except D-417's calibration join. */
              {
                const t3 = await tier3Extend(env, { sha, storeName, i2text, wiredTier, tier2PerPage, fmt });
                i2text = t3.i2text; wiredTier = t3.wiredTier;
                if (t3.chainSet) chain = t3.chain;
                if (t3.ocrNote != null) ocrNote = t3.ocrNote;
                t3Wanting = t3.stillWanting;
              }
              /* CAP-12 / D-354 — THE CONTAINER'S OWN EXTENT, TAKEN OFF THE I2
                 SHAPE THE ENTRY ALREADY RETURNED, at the one place `i2text` is
                 final.
                 *
                 * REC-85 built the `sheet-cell` / `doc-para` / `slide-shape`
                 * arms of C-45.1 with two halves each: a SHAPE half (is this an
                 * address at all) that the leg feeds, and a CONTAINER half (does
                 * THIS document hold it) that only the record can answer — and
                 * nothing persisted a sheet, a paragraph or a shape, so the
                 * second half was built, correct and UNFED. That is D-354, and
                 * this is the feed.
                 *
                 * IT IS READ, NEVER RE-DERIVED. The six office entries
                 * (COFF-3/4/5 and COFF-10's three ODF entries) already return a
                 * per-unit list named for what the unit IS — `sheets[]`,
                 * `paragraphs[]`, `slides[]` — and the figures below are those
                 * lists, counted. Re-walking the container here would be a
                 * second opinion about one number a few lines from the first.
                 *
                 * RECOGNISED BY SHAPE, NOT BY A LIST OF CONTAINER NAMES. A
                 * seventh entry landing in the same I2 shape is fed by this code
                 * with no edit, and a list of six spellings would go stale the
                 * moment a seventh was written. A PDF's I2 text carries none of
                 * the three keys and correctly yields nothing here.
                 *
                 * WHAT IS NOT HERE — CORRECTED IN PLACE 2026-09-15 BY COFF-12,
                 * AND THE CORRECTION IS THE NEWS RATHER THAN HOUSEKEEPING. These
                 * lines said the inner figures "are NOT RETURNED by any entry",
                 * and that was TRUE when CAP-12 wrote it and measured against all
                 * six returns. COFF-11 landed the producer half (IC-100, I2
                 * 2.2.0) and COFF-12 the wire below, so the INNER bound of both
                 * container arms is now fed too: a cell past the sheet's grid and
                 * a shape past the slide's list are each refused C-45.1 BY NAME
                 * with the figure in the refusal. The sentence is rewritten and
                 * not deleted, because what it recorded was real and its closing
                 * is what a later reader needs to see.
                 *
                 * WHAT IS STILL NOT HERE, so this block does not become the same
                 * stale reassurance one item later: a DECK LENGTH. The entry
                 * emits its readable slides and nothing that says how long the
                 * deck is, so a deck whose trailing slides are unreadable is
                 * recorded SHORTER than it is — see the keying note at the site.
                 * And `.ods`/`.odp` carry an honestly NULL grid bound because
                 * OpenDocument fixes no maximum table size; that null is a
                 * STATEMENT and is not a gap in this wire.
                 *
                 * AN EMPTY LIST IS NULL AND NEVER A ZERO. Every entry's
                 * over-the-size-bound branch returns `sheets: []` /
                 * `paragraphs: []` / `slides: []` with the guard marker beside
                 * it, and reading that as "this workbook holds no sheets" would
                 * be the record asserting a fact nobody established — the exact
                 * inversion of CAP-9's "never a zero" rule, one construct
                 * wider. */
              /* AND THE LEVEL A CONTAINER HAS NO NOTION OF IS NOT A GAP IN IT.
                 A workbook has no paragraph count and never will, which is a
                 different fact from a workbook whose sheets this record does not
                 hold — so `levels` names the levels THIS container itemises at
                 all, taken from which keys the entry emitted rather than from a
                 list of container names, and the store reports a missing level
                 only against that. The KEY's presence is the notion; its
                 LENGTH is whether the record holds it. */
              if (i2text) {
                const has = (k) => Array.isArray(i2text[k]);
                const held = (k) => (has(k) && i2text[k].length ? i2text[k] : null);
                if (has("sheets") || has("paragraphs") || has("slides")) {
                  const sh = held("sheets"), pa = held("paragraphs"), sl = held("slides");
                  /* COFF-12 / IC-100 / D-359 — THE INNER FIGURES ARE READ FROM THE
                     PRODUCER AND NO LONGER WRITTEN AS LITERALS. Until 2026-09-15 the
                     three lines below read `rows: null, cols: null` and `shapes: null`
                     and the slide map did not even BIND its element, so every figure
                     COFF-11's entries emit arrived here and was discarded. The keys
                     were fed and unread, which is the inverse of the gap D-359 was
                     filed for and is why that row stayed open past its producer half.

                     AN INTEGER OR NULL, NEVER A COERCION. `int` is deliberately not
                     `Number(v) || null`: a producer that answered something other than
                     an integer must land as UNDETERMINED AND STATED rather than as a
                     figure this wire invented, because `coversSheetCell` and
                     `coversSlideShape` REFUSE against whatever is stored here and a
                     bound nobody measured is the one thing they must never be handed.
                     `.ods` and `.odp` exercise this for real and not hypothetically:
                     OpenDocument fixes no maximum table size, so `odsText` emits an
                     honestly NULL grid bound beside a MEASURED used range, and that
                     null must survive this wire exactly as it was emitted.

                     `usedRows`/`usedCols` ARE CARRIED AND BOUND NOTHING. They are a
                     different fact from the grid — "empty at capture" against "outside
                     the grid" — and IC-100's decision is that only the grid fences. No
                     predicate reads them and none may; COFF-11's `usedrangeasbound`
                     arm is what breaks if a later session wires them in as a fence. */
                  const int = (v) => (Number.isInteger(v) ? v : null);
                  /* THE SLIDE MAP IS KEYED ON THE UNIT'S OWN `slide`, NEVER ON ITS
                     POSITION, AND THIS IS A PRE-EXISTING DEFECT CORRECTED HERE RATHER
                     THAN ONE THIS ITEM INTRODUCED (named in COFF-11's IC-100 so it
                     would not be discovered twice). `pptxText` OMITS a slide whose part
                     could not be read — it pushes an `undetermined` entry instead —
                     while every surviving unit keeps its TRUE 1-based `slide` number.
                     So on a deck whose slide 2 is unreadable the old `sl.map(() => …)`
                     stored slide 3's shape count at index 1, and `coversSlideShape`
                     reads `slides[e.slide - 1]`: it would have bounded slide 2 by slide
                     3's shape count and refused slide 3 as past the deck. That is the
                     record refusing a TRUE citation and admitting a false one, from one
                     unreadable part — and nothing in the battery could see it, which is
                     why this item's `slidesbyposition` arm exists.

                     THE LENGTH NEVER TIGHTENS AGAINST WHAT THIS WIRE STORED BEFORE.
                     It is `max(unit count, highest slide number)`: a unit with a NULL
                     `slide` (a slide part outside the declared order — `deckOf` emits
                     those) has no position to occupy, so keying alone could SHORTEN the
                     array and make the deck's outer bound stricter than it was. A fence
                     tighter than its rule is an undeclared interface change wearing the
                     costume of caution, so the count still holds the floor.

                     AN UNFILLED SLOT IS `shapes: null` — UNDETERMINED AND STATED, never
                     a zero. The deck HAS that slide; this record could not read it, and
                     `coversSlideShape` skips a null rather than refusing every shape on
                     it. WHAT THIS STILL CANNOT SEE, stated rather than left to be found:
                     a deck whose LAST slides are unreadable reports a deck SHORTER than
                     it is, because the entry emits no deck length and the highest slide
                     number this wire can see is the highest READABLE one. That
                     under-reports in the refusing direction and is D-359's residue after
                     this item; closing it is a producer change (a deck length on the I2
                     text shape) and therefore another IC, not a line here. */
                  const slideExtents = (units) => {
                    let n = units.length;
                    for (const u of units)
                      if (u && Number.isInteger(u.slide) && u.slide > n) n = u.slide;
                    const out = Array.from({ length: n }, () => ({ shapes: null }));
                    for (const u of units) {
                      if (!(u && Number.isInteger(u.slide) && u.slide >= 1)) continue;
                      out[u.slide - 1] = { shapes: int(u.shapes) };
                    }
                    return out;
                  };
                  /* FW-19 / IC-124 — TWO MORE LEVELS, `tables` and `images`, for
                     the `doc-table` arm and the `image` reference. THEIR ABSENCE
                     RULE IS NOT THE THREE ABOVE'S, and the difference is what the
                     producers emit rather than a preference: the three lists
                     above come back EMPTY from an over-the-bound branch, so an
                     empty one must be read as NULL; these two come back NULL from
                     every branch that did not walk (`tables: null` beside the
                     guard, `images: null` with `imagesWhy`), so an EMPTY list is
                     a MEASURED ZERO — the body was walked and held no table, the
                     media directory was looked in and held no image — and a
                     citation of table 1 of a document with none is refused by
                     name. The LEVEL is named whenever the KEY is present, null
                     or not, because the key's presence is the notion and its
                     value is whether the record holds it (the rule stated one
                     paragraph up). */
                  const own = (k) => Object.prototype.hasOwnProperty.call(i2text, k);
                  const tablesOf = (list) => (Array.isArray(list)
                    ? list.map((t) => ({ rows: int(t && t.rows), cols: int(t && t.cols) })) : null);
                  /* EXHAUSTIVE OR NULL, on the producer's own rule: one entry
                     this wire cannot read as a content address makes the whole
                     list undetermined, because dropping it would let the arm
                     refuse a true citation of that image as absent. */
                  const imagesOf = (list) => (Array.isArray(list)
                      && list.every((x) => x && typeof x.part === "string" && /^[0-9a-f]{64}$/.test(x.part))
                    ? list.map((x) => ({ part: x.part, mime: typeof x.mime === "string" ? x.mime : null }))
                    : null);
                  containerExtent = {
                    container: typeof i2text.container === "string" ? i2text.container : null,
                    levels: [...["sheets", "paragraphs", "slides"].filter(has),
                             ...["tables", "images"].filter(own)],
                    sheets: sh ? sh.map((s) => ({
                      name: s && typeof s.name === "string" ? s.name : null,
                      rows: int(s && s.rows), cols: int(s && s.cols),
                      usedRows: int(s && s.usedRows), usedCols: int(s && s.usedCols) })) : null,
                    paragraphs: pa ? pa.length : null,
                    slides: sl ? slideExtents(sl) : null,
                    ...(own("tables") ? { tables: tablesOf(i2text.tables) } : {}),
                    ...(own("images") ? { images: imagesOf(i2text.images) } : {}),
                  };
                }
              }
              /* REC-91's units, by `textUnitsFor` (CPDF-19: one rule for both paths). */
              { const u = textUnitsFor(i2text); textUnits = u.textUnits; textUnitsOverBound = u.textUnitsOverBound; }
              if (i2text) wired = readText(i2text, { headers: profHeaders,
                locator: documentAddress, content_type: ct || null, at: retrieved });
              /* The chain, at last, and only if a text surface actually
                 answered. Tier 3 already set its own above (it names the engine
                 that produced it); anything else came out of the document's own
                 text layer, which is what FW-15's `text_source: "layer"` token
                 said and is now a chain step that can be extended — and D-251
                 is the first thing that extends it: a layer whose /Info names
                 OCR software records
                 `layer -> ocr(<product>)` here, with the product named, while a
                 layer with no marker records exactly the one step it always
                 did. */
              if (i2text && !chain)
                chain = layerChainFor(i2text, { tier: wiredTier, container: fmt });
              /* CAP-10 / DEC-75 / IC-122 — A DRIVE EXPORT'S TEXT PASSED THROUGH
                 GOOGLE'S CONVERSION BEFORE ANY TIER READ IT, so the chain says so
                 at its HEAD: `convert(google-export, <format>) -> layer`, cap
                 UNDETERMINED. Placed HERE, after every branch above has settled
                 its chain (the tier-2 merge, tier 3's parts, the tail's layer
                 chain), so it is ONE site for all of them rather than one per
                 branch that a future branch could miss.
                 KEYED ON `driveCapture` AND NOTHING ELSE — the recogniser's own
                 verdict, set only when the address was diverted to an export. An
                 ordinary OpenDocument file is the same container and NOT a
                 conversion; keying on the format would have given every city
                 .odt a step nobody performed (the control's `overstrict` arm).
                 A REFUSED prepend records NO chain and a FAILED reading naming
                 the refusal. It must never fall back to the chain it was handed:
                 that chain omits the conversion and would read as a direct
                 capture of original bytes, which is the claim DEC-75 withdrew. */
              if (driveCapture && Array.isArray(chain)) {
                const converted = convertedChain(driveConvertStep(driveCapture), chain);
                if (Array.isArray(converted)) chain = converted;
                else {
                  chain = null;
                  wired = { determined: false,
                            why: `the text chain of this Google Drive export could not be stated honestly `
                               + `(${converted.check} ${converted.code}: ${converted.detail}), so nothing is `
                               + `claimed about its text rather than claiming it was read from original bytes` };
                }
              }
            }
          } catch { /* a wire failure must not fail the capture: fall through to
                       the honest no-reading below */ }
        }
        if (wired) {
          /* CPDF-19: the two wired branches, by `readingFromWire` (one rule for the
             acquire path and the read path's re-extraction). */
          reading = readingFromWire({ wired, docType, chain, wiredTier, fmt, retrieved, tier2note, ocrNote,
                                      tier3Candidate: t3Wanting });
        } else {
          reading = {
            content_type: docType.type.key, reader_version: docType.type.version ?? null,
            read_from_text: false, found: false, entities: [], facts: {}, at: retrieved,
            basis: `the document was not read as text (${multipart ? "multipart" : "non-textual or too large"}), so no reading was attempted`,
          };
        }
        /* CAP-9 / D-345 — THE PAGE COUNT, CARRIED ONTO THE READING THE PLANE
           PERSISTS, at ONE site for all three branches above.
           *
           * IC-83's Rules mint a content row against "the page count I2 already
           * carries at acquire", and until this line nothing in this plane
           * persisted one. `Store#pageSetForCapture` could therefore answer only
           * from the pages a D-252 SCOPED chain or an attestation happened to
           * name — a MIXED document and nothing else — so the out-of-range
           * refusal (C-45.1) reached the rare case and missed every ordinary
           * PDF. That is D-345, and this is the field that closes it.
           *
           * THE KEY IS PRESENT AND NULL RATHER THAN ABSENT, and the difference
           * is the sparse-at-every-level rule rather than tidiness. An ABSENT
           * key says nothing ever tried to count this document's pages (an HTML
           * page, a multipart giant — the wire never ran); `null` says the wire
           * DID run and the producer reported no count (an office container, a
           * PDF whose page tree could not be ordered). No absence may stand in
           * for another — the same rule `#writeTextSource` obeys one field over,
           * where no row and `transcribed: 0` are different facts.
           *
           * AND IT IS NEVER A ZERO. Zero would say this document HAS no pages,
           * which is a third fact and one nothing here established; `null` says
           * the page set is undetermined, which is what the row then records and
           * what `op=content` states back. Undetermined is first-class, and a
           * refusal is not owed for it (D-345's interim law, and C-45.1's own
           * guard).
           *
           * WHY IT IS NOT A COLUMN. `readings.reading` already holds the whole
           * reading as JSON and `readings` is keyed by `capture_sha`, which is
           * exactly the key the one reader (`contentContextFor`) looks up by —
           * so a column would be a projection nothing filters, counts or asks
           * for, on a table this area does not own (I5: `readings` is
           * FRAMEWORK's). `#writeTextSource`'s columns exist because the chain
           * had to be filterable; this number does not. */
        reading.page_count = Number.isInteger(pageCount) && pageCount > 0 ? pageCount : null;
        /* CAP-12 / D-354 — THE CONTAINER EXTENT, CARRIED ONTO THE READING THE
           PLANE PERSISTS, at the same ONE site and under the same three-state
           absence rule IC-87 fixed for `page_count` one line up.
           *
           * KEY ABSENT: nothing ever tried to itemise this document's container
           * — an HTML page read as text at intake, where this wire never ran.
           * PRESENT AND NULL: the wire RAN and no entry itemised a container at
           * all — a PDF, whose I2 text carries no sheet, paragraph or slide
           * list, and a primary the wire could not read. AN OBJECT: an entry
           * answered, `levels` names what this container itemises and each named
           * level is either the figure or NULL, undetermined and stated.
           * No absence stands in for another, and none of them is a zero.
           *
           * WHY NOT A COLUMN: `readings.reading` already holds the reading as
           * JSON keyed by the `capture_sha` the one reader (`contentContextFor`)
           * looks up by, so a column would be a projection nothing filters —
           * CAP-9's reasoning unchanged, on a table I5 assigns to FRAMEWORK. */
        reading.container_extent = containerExtent;
      }

      /* The shape C-18.1 requires, assembled here so the caller does not have to
         know it and cannot get it subtly wrong. */
      return json({
        ok: true, existed,
        document: {
          file: `snapshots/${name}`,
          locator, retrieved,
          /* CONSTRUCTS Step 1 (FW-3): which host stack and which content type the
             record thinks it holds, with the confidence, signals and recogniser
             versions that let it be revised later. A new sibling field, additive
             to I1. */
          profile,
          /* CONSTRUCTS Step 3 (FW-5): what the doctype's reader found in this
             document — entities[] (each with its raw kind:key reference) plus
             document facts. A new sibling field, additive to I1. op=promote
             derives it from data/provenance.json and persists it into the
             `readings` table indexed by entity reference; a failed/empty reading
             is carried honestly (found:false), never fabricated (framework §7). */
          reading,
          /*__REC91_TEXT_UNITS_WIRE_START__*/
          /* REC-91 / `CONTENT-SEARCH-DESIGN.md` section 4.1 -- THE INDEXABLE
             UNITS OF THIS DOCUMENT'S TEXT. A new sibling field, ADDITIVE to I1
             in `reading`'s and `profile`'s own shape: `op=promote` derives the
             content-grain text index from `data/provenance.json` exactly as it
             already derives `readings` and `reading_refs` from it, and a caller
             that copies the acquire document wholesale -- which is the shape
             C-18.1 requires and every caller already builds -- carries this with
             no change of its own.
             *
             * A SIBLING OF `reading` AND NOT A FIELD ON IT, and that is the one
             * shape decision here. `readings.reading` is persisted WHOLE as
             * JSON, so a `reading.text_units` would store every byte of the
             * document's text in the `readings` table AND AGAIN in
             * `capture_text` -- and section 3's chosen option is option (iii)
             * precisely because "text is stored once". As a sibling the store
             * consumes it into `capture_text` and the reading persists exactly
             * as it did before this landing, gaining not one byte.
             *
             * WHAT THIS DOES COST, MEASURED AND REPORTED RATHER THAN LEFT TO BE
             * FOUND: `data/provenance.json` is a bundle FILE, so its bytes land
             * in `files.content` and in `history` -- which means the text IS
             * stored a second time, in the one place section 3 says it is not.
             * It is the only route that needs no change from any caller, and the
             * alternative (a promote-package sibling outside the bundle image)
             * costs edits in two areas this item does not own. Reported as a
             * DESIGN GAP against section 3 / section 4.1 with the figure, not
             * closed here by widening the scope. */
          ...(textUnits ? { text_units: textUnits } : {}),
          /* WHAT THE WIRE'S OWN BUDGET DROPPED, so the store can say `partial`
             rather than recording a truncated capture as a whole one. Emitted
             only when it is non-zero, so a document nothing was dropped from
             carries exactly the keys it carried before. */
          ...(textUnitsOverBound ? { text_units_over_bound: textUnitsOverBound } : {}),
          /*__REC91_TEXT_UNITS_WIRE_END__*/
          /* D-97: authority mirrors verdict / verdict_basis / verdict_at
             rather than inventing a shape. The determination when one was
             made; the STATE always; the basis in BOTH cases, dated, because
             "the member asserted it" and "nothing could establish it" are
             both facts about how the record got here. An undetermined
             capture is held and barred from publication, never refused at
             intake (RULED, AUTHORITY-AND-TRUST.md). */
          ...(authorityAsserted ? { authority: authorityAsserted } : {}),
          authority_state: authorityAsserted ? "determined" : "undetermined",
          authority_basis: authorityAsserted
            ? `asserted by the capturing ${viaSession ? "member" : "caller"} at intake, ${retrieved}`
            : `no assertion was supplied and no mechanical determination is implemented; recorded ${retrieved} for resolution through the task list`,
          /* The chain of custody as ordered hops from us back to the origin,
             each naming who, what they assert, the evidence, and whether the
             assertion is cryptographically bound or merely stated (RULED). A
             direct fetch is ONE hop, which is what grades it above an
             archive-sourced capture of the same document: grade tracks
             directness, never technique. */
          /* Ordered hops from us back to the origin. A direct fetch is ONE hop,
             which is what grades it above an archive-sourced capture of the same
             document: grade tracks directness, never technique.
             *
             * An archive capture is TWO, and the second is weaker and says so.
             * Our hop is honest about what we actually did (we fetched the
             * replay address, not the publisher), and theirs carries the CDX
             * evidence with `bound: false` and the reason it is unsigned. RULED:
             * transitive trust is accepted WHERE DISCLOSED, and what is
             * inherited is the fact of publication, never the credibility of
             * the content. */
          provenance_chain: [{
            who: `instance ${env.INSTANCE_NAME || "unnamed"} (CivicOS/${env.VERSION || "0.0.0"})`,
            asserts: `these bytes were served for ${locator} at ${retrieved}`,
            evidence: "first-party https fetch, hashed at receipt, transport record on this document",
            bound: false,
            via,
          /* CAP-8 joins the SAME spread, and a capture is never both: an archive
             arm requires `via: "archive.org"`, which the Drive arm never sets.
             A Drive export is therefore TWO hops — ours, honest that what we
             fetched was the export address rather than the document's own, and
             Google's, carrying the three facts with `bound: false` and the
             reason it is unsigned. */
          }, ...(archiveHopRecorded ? [archiveHopRecorded] : []),
             ...(driveHopRecorded ? [driveHopRecorded] : [])],
          capture: {
            method: multipart
              ? `bio-plane acquire, https fetch, streamed in ${parts.length} parts, hashed at receipt`
              : "bio-plane acquire, https fetch, hashed at receipt",
            /* GRADE TRACKS DIRECTNESS, NEVER TECHNIQUE (RULED). An archive hop
               is one more party between us and the publisher, so it grades
               below a direct capture of the same document even though the
               bytes may be identical and the method just as careful.
               *
               REC-50: THE DIRECT-FETCH LETTER IS THE ENFORCED CEILING, so it is
               that value and not a copy of it. `EARNED_CAPTURE_CEILING` is what
               `checkEarnedLeg` refuses a capture leg for exceeding, and R2-g's
               doctrine — "Grade B is what a direct capture by this instance is
               worth" — is a statement ABOUT this stamp. A typed letter here
               agreed with the rule at zero cost and would have drifted silently
               the moment the ceiling moved, handing a caller a grade the gate
               will not accept: the same defect REC-43 closed on the attest
               fence and REC-48 on this op's own `note:`, one field over.
               *
               THE ARCHIVE-SOURCED LETTER IS DELIBERATELY STILL TYPED, and that
               is open BY DECISION rather than by oversight. Naming it would
               assert what an archive-sourced capture EARNS and whether that is
               a ceiling or a fixed grade — a second capture-axis doctrine
               value, which is a ruling and not a worker's or CONDUCT's to make
               by writing a constant (QUEUE.md REC-50). What IS already ruled is
               the ORDERING stated at the top of this comment, and
               acquire.test.mjs pins that the typed letter still ranks strictly
               below the ceiling — so if the ceiling ever moves onto or past it,
               the suite says so by name instead of the record quietly claiming
               an archive capture is worth as much as a direct one. */
            grade: via === "archive.org" ? "C" : EARNED_CAPTURE_CEILING,
            /* WHO SERVED US THESE BYTES, which is not who issued the document.
               Bob, 2026-07-31: recording that the capture came through the
               Internet Archive is proper even while the CONTENT authority is
               still undetermined, because publication gates on there being no
               undetermined authority link in the PROVENANCE, and the archive
               leg is perfectly well attributed. Set only for an archive
               capture: for a direct fetch the server and the document address
               are the same string, and adding a field restating the locator
               would invite it being read as the issuing party. */
            ...(via === "archive.org" ? { authority: "Internet Archive" } : {}),
            actor_class: viaSession ? "member" : (cls === "probe" ? "session" : "daemon"),
            /* Over the reassembled whole, which is what C-18.1 requires of a
               parted document and what C-18.6 checks by streaming the parts. */
            sha256: sha, encoding: "binary", bytes: total,
            ...(ct ? { content_type: ct } : {}),
            transport,
          },
          ...(multipart ? { parts: parts.map((p, i) => ({
            file: `snapshots/${name}.part${String(i).padStart(3, "0")}`,
            sha256: p.sha256, bytes: p.bytes })) } : {}),
          /* Named on the SAME register document rather than as documents of
             their own. C-18.3 treats one capture hash appearing under two
             register entries as a missed corroboration, and beyond that a
             derived artifact is not an independent acquisition: it has no
             locator, no authority, and no grade of its own. It is a rendering
             of this document and it says so here. */
          ...(subs ? { renditions: subs.renditions } : {}),
          origin: { kind: body.matchedSweep ? "sweep" : "named_request",
                    ...(body.matchedSweep ? { matched_sweep: body.matchedSweep, deeming_actor: sessMember || cls } : {}) },
          attestation_attempts: [],
        },
        ...(multipart ? { parts: parts.length } : {}),
        ...(subs ? {
          subresources: subs.subresources,
          snapshot: {
            manifest_file: "data/snapshot-manifest.json", manifest_sha256: subs.manifestSha,
            render_file: `snapshots/${name}.render.html`, render_sha256: subs.companionSha,
            discovered: subs.discovered, attempted: subs.attempted, truncated: subs.truncated,
            fetched: subs.manifest.counts.fetched, failed: subs.manifest.counts.failed,
            refused: subs.manifest.counts.refused,
            scripts_held_unreferenced: subs.manifest.counts.scripts_held_unreferenced,
            complete: subs.manifest.complete, outstanding: subs.manifest.outstanding,
            platform: subs.manifest.platform,
            reuse: subs.manifest.reuse,
            compute: subs.manifest.compute,
            ...(subs.computeRecord ? { compute_recorded: subs.computeRecord } : {}),
            ...(subs.resumeState ? { continuation: {
              session: sessionId, outstanding: subs.manifest.outstanding,
              ticks: subs.session ? subs.session.ticks : 1,
              how: "call op=acquire again with {continue: \"<session>\"} to pick up the outstanding parts; "
                 + "the primary is already complete and is never re-fetched",
            } } : {}),
            ...(subs.siteRecord ? { site: subs.siteRecord } : {}),
            ...(subs.limitRecord ? { limit_recorded: subs.limitRecord } : {}),
          },
          files: {
            [`snapshots/${name}.render.html`]: subs.companionSha,
            "data/snapshot-manifest.json": subs.manifestSha,
          },
        } : {}),
        ...(subsSkipped ? { subresources_skipped: subsSkipped } : {}),
        note: ACQUIRE_GRADE_NOTE,
        store: storeName, tokenClass: cls,
      }, 200);
    }

    /* Co-attestation over a capture hash.
     *
     * The doctrine's asymmetry: a self-recorded hash proves integrity since
     * capture and nothing about origin, because it is the group attesting to
     * itself. A timestamp token is issued by somebody the group does not
     * control, so it proves the capture EXISTED at the claimed instant, which
     * is the part an attacker holding a write token cannot forge.
     *
     * Every attempt is recorded, successes and failures alike, in the shape
     * C-18.1 requires. The doctrine is explicit that a failed attempt is
     * recorded with its reason and never omitted: a provenance register showing
     * no attempt and one showing an attempt that failed are different claims,
     * and collapsing them would let an absence read as a success.
     */
    if (op === "attest") {
      if (req.method !== "POST") return json({ ok: false, error: "attest is a POST" }, 405);
      if (typeof env.CAPTURES?.put !== "function")
        return json({ ok: false, error: "this instance has no evidence storage configured" }, 503);
      const body = await req.json().catch(() => null);
      const sha = typeof body?.sha256 === "string" ? body.sha256.toLowerCase() : "";
      if (!/^[0-9a-f]{64}$/.test(sha))
        return json({ ok: false, reason: "BAD_SHA", detail: "attest takes the sha256 of a capture already in the store" }, 400);
      if (!(await env.CAPTURES.head(`${storeName}/captures/${sha}`)))
        return json({ ok: false, reason: "NO_SUCH_CAPTURE",
                      detail: "nothing in this store has that hash; capture the document before attesting it" }, 404);

      const attempts = [];
      let token = null, tokenSha = null, service = null;
      for (const endpoint of TSA_ENDPOINTS) {
        const attempted = new Date().toISOString().split(".")[0] + "Z";
        try {
          const { der } = timestampRequest(sha);
          const res = await fetch(endpoint, {
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
          const digest = await crypto.subtle.digest("SHA-256", parsed.token);
          tokenSha = [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
          await env.CAPTURES.put(`${storeName}/captures/${tokenSha}`, parsed.token, { sha256: digest });
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
        const attempted = new Date().toISOString().split(".")[0] + "Z";
        const locator = typeof body.locator === "string" ? body.locator : "";
        if (!isPublicHttpsLocator(locator)) {
          attempts.push({ service: ARCHIVE_SERVICE, attempted, ok: false,
                          note: "no public https locator to archive" });
        } else {
          try {
            const res = await fetch(ARCHIVE_SAVE_BASE + locator, { redirect: "follow" });
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

      return json({
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
        } : {
          reason: "NO_ATTESTATION",
          note: "Every attempt was recorded. A register showing a failed attempt and one showing no attempt are different claims, so the failures above belong in the document rather than being dropped.",
        }),
        store: storeName, tokenClass: cls,
      }, token ? 200 : 502);
    }

    /* Monitoring: has the source changed under us?
     *
     * What this writes is deliberately narrow. MECHANICAL_FIELD_SETS lets a
     * monitor-tick touch source_status, monitoring.last_checked, the three
     * reeval_pending fields, and last_updated. It may not record the new
     * document's hash, and that absence is the design rather than an oversight:
     * detecting that a source moved is mechanical, deciding what the new version
     * means is not. So the tick raises a flag and a human or a session decides
     * whether to capture the new bytes. This is the escalation ladder in one
     * operation.
     *
     * It writes through promote like every other writer, marked mechanical, so
     * C-20.1 audits it from the history diff rather than taking its word.
     */
    if (op === "monitor") {
      if (req.method !== "POST") return json({ ok: false, error: "monitor is a POST" }, 405);
      const body = await req.json().catch(() => null);
      const bundleId = body?.bundleId;
      if (typeof bundleId !== "string" || !bundleId)
        return json({ ok: false, error: "monitor needs a bundleId" }, 400);

      const stub0 = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-25: the store's image read fails closed without a viewer. The
         monitor is a machine caller acting as itself, so it reads at its own
         credential's scope, which D-15 deliberately leaves unfiltered. */
      /* REC-52: `!img` and `typeof img["bundle.md"] !== "string"` were one
         test, so a store silence answered `ABSENT` at 404 — the plane telling a
         caller that a bundle does not exist when it failed to look. `ABSENT` is
         also deliberately the answer a bundle the viewer may not SEE gets
         (REC-25's fail-closed read), which made the invented one especially
         convincing. The two are separated; the fail-closed meaning is intact. */
      const imgOut = await doAnswer(stub0.fetch(`http://do/image?id=${encodeURIComponent(bundleId)}&viewer=${encodeURIComponent(viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`)}`));
      if (!imgOut.answered) return storeSilent("monitor");
      const img = imgOut.result;
      if (!img || typeof img["bundle.md"] !== "string")
        return json({ ok: false, reason: "ABSENT", bundleId }, 404);
      const live = img["bundle.md"];
      const fm = parseFrontmatter(live).data || {};
      if (!fm.monitoring || fm.monitoring.enabled !== true)
        return json({ ok: false, reason: "NOT_MONITORED",
                      detail: "this bundle does not ask to be monitored" }, 409);
      const locator = fm.source?.locator;
      if (typeof locator !== "string" || !isPublicHttpsLocator(locator))
        return json({ ok: false, reason: "NO_LOCATOR",
                      detail: "monitoring needs a public https locator in source.locator" }, 409);

      /* The baseline is whatever the provenance register says was captured from
         this locator. Without one there is nothing to compare against, and the
         tick says so rather than guessing at a status. */
      let baseline = null;
      try {
        const reg = JSON.parse(img["data/provenance.json"] || "{}");
        const match = (reg.documents || []).find((d) => d && d.locator === locator);
        baseline = match?.capture?.sha256 || null;
      } catch { /* C-14.3 reports unparsable JSON; monitoring just has no baseline */ }

      const checked = new Date().toISOString().split(".")[0] + "Z";
      let status = null, note = null, seen = null;
      try {
        /* D-95: a monitor tick is a document fetch and paces like one. A
           governed refusal is a tick outcome with a name, not an error: the
           check simply did not run, and saying so beats a fabricated status. */
        const g = await governedFetch(env, env.STORE.get(env.STORE.idFromName(storeName)), locator, "monitor");
        if (g.refusedByGovernor)
          return json({ ok: false, reason: "HOST_COOLING_OFF",
                        detail: `the per-host governor is holding requests to this host (${g.reason}); retry in about ${Math.ceil((g.retry_in_ms || 0) / 1000)}s`,
                        retry_in_ms: g.retry_in_ms || 0, locator }, 429);
        const res = g.res;
        if (res.status === 404 || res.status === 410) { status = "removed"; note = `the source answered ${res.status}`; }
        else if (!res.ok) { note = `the source answered ${res.status}`; }
        else {
          const bytes = new Uint8Array(await res.arrayBuffer());
          const d = await crypto.subtle.digest("SHA-256", bytes);
          seen = [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
          if (!baseline) note = "no captured baseline to compare against; recorded the check only";
          else if (seen === baseline) { status = "unchanged"; note = "the source still serves the captured bytes"; }
          else { status = "modified"; note = "the source no longer serves the captured bytes"; }
        }
      } catch (e) {
        note = "the source could not be reached: " + String(e && e.message || e).slice(0, 90);
      }

      /* Rewrite ONLY the permitted fields, line by line, so nothing else can
         move by accident. A mechanical writer that rebuilt the document from a
         parse would reformat it, and reformatting is a change. */
      const flags = status === "modified" || status === "removed";
      const out = [];
      let fence = 0, inMon = false, inRe = false;
      for (const line of live.split("\n")) {
        if (line === "---" && fence < 2) { fence++; inMon = inRe = false; out.push(line); continue; }
        if (fence === 1) {
          if (/^[a-zA-Z_]/.test(line)) { inMon = /^monitoring:/.test(line); inRe = /^reeval_pending:/.test(line); }
          if (status && /^source_status:/.test(line)) { out.push("source_status: " + status); continue; }
          if (/^last_updated:/.test(line)) { out.push("last_updated: " + checked); continue; }
          if (inMon && /^\s+last_checked:/.test(line)) { out.push("  last_checked: " + checked); continue; }
          if (inRe && flags && /^\s+flag:/.test(line)) { out.push("  flag: true"); continue; }
          if (inRe && flags && /^\s+since:/.test(line)) { out.push("  since: " + checked); continue; }
          if (inRe && flags && /^\s+source:/.test(line)) { out.push("  source: source_status"); continue; }
        }
        out.push(line);
      }
      let text = out.join("\n");
      if (!/^\s+last_checked:/m.test(text) && /^monitoring:/m.test(text))
        text = text.replace(/^monitoring:/m, "monitoring:\n  last_checked: " + checked);

      /* The Session Log is the one body surface a mechanical writer may add to,
         and C-13.2 requires an entry whenever last_updated moves. */
      const entry = "### Session " + checked + "\n\nMonitor tick: " + (note || "checked") + "\n";
      const at = text.indexOf("## Session Log");
      if (at < 0) text += "\n## Session Log\n\n" + entry;
      else {
        const nxt = text.indexOf("\n## ", at + 1);
        const cut = nxt === -1 ? text.length : nxt + 1;
        text = text.slice(0, cut) + entry + "\n" + text.slice(cut);
      }

      const carried = [];
      for (const [path, v] of Object.entries(img)) {
        if (path === "bundle.md" || path.startsWith("_history/")) continue;
        if (typeof v === "string") {
          const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
          carried.push({ path, text: v, bytes: v.length,
                         sha256: [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("") });
        } else carried.push({ path, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes });
      }
      const liveSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(live)))]
        .map((x) => x.toString(16).padStart(2, "0")).join("");
      const textSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))]
        .map((x) => x.toString(16).padStart(2, "0")).join("");
      const stamp = checked.replace(/[-:]/g, "") + "_" +
        [...crypto.getRandomValues(new Uint8Array(4))].map((x) => x.toString(16).padStart(2, "0")).join("");

      const promoted = await doAnswer(stub0.fetch("http://do/promote", { method: "POST", body: JSON.stringify({
        bundleId, base: liveSha, snapKey: stamp, author: "bio-monitor",
        writer: "mechanical", operation: "monitor-tick",
        meta: { object_type: fm.object_type, group: fm.group || "believe-in-oakland",
                title: fm.title, current_state: fm.current_state, prior_state: fm.prior_state ?? null,
                created: fm.created, last_updated: checked },
        /* Every OTHER file carried forward untouched. promote writes a whole
           image, so a writer that mentions one file deletes the rest: the first
           version of this tick removed the provenance register, which took the
           monitoring baseline with it and left an information@2 bundle with no
           register at all. A mechanical writer silently destroying evidence is
           the worst thing in this system, and the shape of promote made it the
           DEFAULT behaviour of a careless caller. */
        files: [
          { path: "bundle.md", text, bytes: text.length, sha256: textSha },
          ...carried,
        ],
        register: [],
      }) }));
      /* REC-52: a store silence produced `ok:false` at 409 with `reason` and
         `detail` both undefined — a CONFLICT status over an empty refusal —
         while the monitoring verdict above it (`status`, `note`, `seen`) was
         still reported as though the tick had been recorded. The tick is
         reported only when the store said it recorded one. */
      if (!promoted.answered) return storeSilent("monitor/promote");

      return json({
        ok: !!promoted.result?.ok,
        checked, status, note, baseline, seen,
        reeval_raised: flags,
        ...(promoted.result?.ok ? { revision: promoted.result.bundleSha } : { reason: promoted.result?.reason, detail: promoted.result?.detail }),
        note2: "A tick records that the source moved. It does not capture the new version: what a change MEANS is not a mechanical judgement.",
        store: storeName, tokenClass: cls,
      }, promoted.result?.ok ? 200 : 409);
    }

    const stub = env.STORE.get(env.STORE.idFromName(storeName));

    /* THE SIGNATURE, AND THE COMMIT. Same order of operations as `op=ratify`,
       deliberately: verify everything, run the catalog, then commit. What is
       different is the SUBJECT — this act commits the CASE's own assertions, out
       of the case document, which is the signature those facts had nowhere to
       move to before this item. */
    if (op === "caseratify") {
      /* DEC-49 REGION is-machine-ratify-case — REC-123 / C-32.13. The fence alone,
         FIRST and before the payload is read, so it is the FENCE that answers a
         machine and never a payload complaint behind it (REC-73's lesson). Driven:
         before this, an `ai` credential whose scope named this op, carrying a
         registered member's valid signature, COMMITTED THE CASE and the record
         named the member. The `ai` class only HERE; the operator's env-binding
         classes are refused by the region directly below (REC-125, D-421).
         THE GUARD'S SHAPE IS REC-46's AND NOT STYLE: `aiCred` is resolved only for a
         minted agent credential (it is what makes the caller the `ai` class), and
         WHETHER the identity it acts under is a machine is asked of the ONE
         predicate over the stamp the plane writes for it — never decided here by a
         string comparison (`hygiene.test.mjs` D1). */
      if (aiCred && isMachineIdentity(`${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`))
        return json({ ok: false, reason: "MACHINE_CANNOT_RATIFY_CASE", ...machineFenceRow("MACHINE_CANNOT_RATIFY_CASE"),
          op, tokenClass: cls,
          detail: "committing a case is a member's signed act. An assistant's credential may assemble the "
                + "case document and may never commit it, whoever's signature it carries (DEC-24 rule 4)." }, 403);
      /* END DEC-49 REGION is-machine-ratify-case */
      /* DEC-49 REGION is-operator-ratify-case — REC-125 / C-32.15, D-421 DECIDED by
         BOB #14. See `op=ratify`'s twin region for the whole reasoning: an attested
         act is delivered ONLY by a signed-in member's own session, so every caller
         that did not arrive through one — every env-binding bearer class `classify()`
         resolves, today ADMIN / MEMBER / PROBE — is refused here, NAMING its class,
         whoever's valid signature it carries. Keyed on HOW the caller arrived and
         never on a list of token classes or token strings, so a fifth binding
         admitted to this op later is refused without anybody remembering this line. */
      if (!viaSession)
        return json({ ok: false, reason: "OPERATOR_TOKEN_CANNOT_RATIFY_CASE",
          ...machineFenceRow("OPERATOR_TOKEN_CANNOT_RATIFY_CASE"), op, tokenClass: cls,
          detail: `committing a case is a member's own signed act, delivered through that member's own `
                + `signed-in session. The credential that asked is the operator's \`${cls}\`-class bearer `
                + `token: the signature says who authorised the case, and the credential that delivers it `
                + `decides when the record changes, so a bearer token may not carry it in (D-421).` }, 403);
      /* END DEC-49 REGION is-operator-ratify-case */
      const body = await req.json().catch(() => null);
      if (!body?.caseId || !Number.isInteger(body?.edition) || !body?.expectedSha
          || typeof body?.sig !== "string")
        return json({ ok: false, reason: "MALFORMED",
                      detail: "caseratify requires caseId, edition (integer), expectedSha, and sig "
                            + "(armored SSH signature over the case document's sha)" }, 400);

      const factsOut = await doAnswer(stub.fetch(
        `http://do/casedocfacts?case=${encodeURIComponent(body.caseId)}`
        + `&edition=${encodeURIComponent(String(body.edition))}`
        /* REC-130: the SAME standing `op=casedocument` answers to, resolved by
           the SAME function (`resolveSession`). Only a HUMAN's own session
           reaches this line (the region above) — a member's, or the FOUNDER's,
           which BOB #14 ruled may deliver (D-421). A member without standing in
           the owning project is answered NO_CASE_DOCUMENT exactly as for a case
           that does not exist, rather than CASE_RATIFY_STALE with the document's
           sha. REC-128's merge CORRECTED this comment and the viewer: it said
           "only a member's own session" and stamped `member:` plus sessMember,
           and so answered the founder as a member named admin with no standing. */
        + `&viewer=${encodeURIComponent(sessViewer)}`));
      /* REC-53's chokepoint, and the same judgement `op=ratify` records once for
         its whole block: BEFORE the commit a silence refuses the act outright,
         because nothing has been written and 502's sentence — nothing here is a
         statement about the record — is exactly true. */
      if (!factsOut.answered) return storeSilent("caseratify/facts");
      const facts = factsOut.result;
      if (!facts.ok) return json({ ok: false, ...facts, store: storeName, tokenClass: cls }, 404);

      /* DEC-49 REGION is-testimony-publish-case — MK-1 (A) / C-53.12. A case whose
         findings rest, at any depth, on a member's authored observation does not
         cross until MK-3's attribution-honouring projection lifts this; lifting it
         is MK-3's act. MEASURED before it existed (`test/mk1-publish-probe.mjs`,
         path 3): such a case RATIFIED. Refused before the signature is weighed, so
         the answer is the same whoever signed. */
      if (facts.testimony && facts.testimony.via.concat(facts.testimony.self).length)
        return json({ ok: false, reason: "TESTIMONY_CASE_UNPUBLISHABLE", ...testimonyFenceRow("TESTIMONY_CASE_UNPUBLISHABLE"),
          caseId: facts.doc.case_id, edition: facts.doc.edition, rests_on: facts.testimony.via,
          detail: `a finding in ${facts.doc.case_id} rests on a member's authored observation `
                + `(${[...facts.testimony.via.map((v) => `${v.finding} -> ${v.observation}`), ...facts.testimony.self].slice(0, 5).join(", ")}); `
                + `what a published case shows of an observation is the attesting member's choice (MEMBER-KNOWLEDGE-DESIGN.md §4), `
                + `and this build cannot yet honour it (MK-3)`,
          store: storeName, tokenClass: cls }, 409);
      /* END DEC-49 REGION is-testimony-publish-case */

      if (facts.doc.doc_sha !== body.expectedSha)
        return json({ ok: false, reason: "CASE_RATIFY_STALE",
                      detail: "the case document has changed since it was reviewed; read it again and re-sign",
                      expected: facts.doc.doc_sha, got: body.expectedSha,
                      store: storeName, tokenClass: cls }, 409);
      /* D-57: NO_SIGNERS IS INSTANCE-WIDE and the detail must never say "for
         you" — the same sentence op=ratify carries, for the same reason. */
      if (!facts.signers.length)
        return json({ ok: false, reason: "NO_SIGNERS",
                      detail: "no active registered signing keys; an admin must register a member key before anything can be ratified",
                      store: storeName, tokenClass: cls }, 409);
      const sv = await verifySshsig(body.sig,
                                    caseRatifyStatement(facts.doc.case_id, facts.doc.edition, facts.doc.doc_sha),
                                    NS_RATIFY, facts.signers.map((s) => s.key_b64));
      if (!sv.ok)
        return json({ ok: false, reason: "SIG_" + sv.reason,
                      ...(sv.keyB64 ? { keyB64: sv.keyB64 } : {}),
                      ...(sv.detail ? { detail: sv.detail } : {}),
                      store: storeName, tokenClass: cls }, 403);
      const attestor = facts.signers.find((s) => s.key_b64 === sv.keyB64);

      /* THE CATALOG, over the bytes the signature covers and over nothing else.
         `priorCase` is C-21.1's fact at case altitude and comes down with the
         rest of the facts from the one place that has the rows — passing null
         would not soften C-21.1, it would blind it. */
      const fm = parseFrontmatter(facts.doc.text).data || {};
      const gate = runCaseGate({ caseId: facts.doc.case_id, edition: Number(facts.doc.edition),
                                 fm, priorCase: facts.priorCase
                                   ? { edition: facts.priorCase.edition,
                                       statement: facts.priorCase.completeness
                                         ? (JSON.parse(facts.priorCase.completeness).statement ?? null) : null,
                                       bias_acknowledgement: facts.priorCase.bias_acknowledgement ?? null }
                                   : null });
      if (!gate.ok)
        return json({ ok: false, reason: "GATE_REFUSED", gateVersion: gate.gateVersion,
                      findings: gate.findings, store: storeName, tokenClass: cls }, 409);

      /* REC-128 — THE RECORD STATES WHO AUTHORISED AND WHO DELIVERED (BOB #14, the
         honesty half of D-421). The SIGNATURE says who authorised (`attestor`, from
         the verified key's registered member); the SESSION says who delivered — a
         member, or the founder, whose password session is the only live publishing
         route (DEC-33). They are two facts and each has ONE source:
           - the deliverer comes from the session ROW the admission block resolved,
             never from the signature, and never from `sessMember` (which folds the
             founder's `admin` role into a bare string);
           - the SIGNER no longer falls back to the session. It read
             `attestor?.member_id ?? sessMember`: unreachable while `signers.member_id`
             is NOT NULL and the key was matched out of the signer set, but it was
             the same conflation pointed the other way — a session standing in for a
             signature — and with a deliverer now recorded beside it, it would have
             written one person under both names. Absent is stated as null.
         REC-125's fence above guarantees a session here, so `sessRights` is the row. */
      const deliveredBy = deliveringPrincipal(sessRights); /* REC-128: op=caseratify */
      const out = await doAnswer(stub.fetch("http://do/caseratify", {
        method: "POST", body: JSON.stringify({
          caseId: facts.doc.case_id, edition: Number(facts.doc.edition), docSha: facts.doc.doc_sha,
          sigArmored: body.sig, attestorKey: sv.keyB64,
          attestorMember: attestor?.member_id ?? null, gateVersion: gate.gateVersion,
          deliveredBy,
        }) }));
      if (!out.answered) return storeSilent("caseratify/commit");
      const r = out.result;
      if (!r?.ok)
        return json({ ok: false, ...(r && r.reason ? r : { reason: "CASE_PUBLISH_FAILED", detail: r }),
                      store: storeName, tokenClass: cls }, 409);
      return json({ ok: true, ...r, gateVersion: gate.gateVersion,
                    attestor: { member: attestor?.member_id ?? null, key_b64: sv.keyB64 },
                    /* REC-128: who carried the signature in, beside who made it. On a
                       retry of the same signature (`existed`) the store wrote nothing,
                       so the RECORD's deliverer is the first one — read it back through
                       op=casedocument; this field is who delivered THIS request. */
                    deliveredBy: delivererOf(deliveredBy),
                    /* THE WINDOW, NAMED IN THE ANSWER RATHER THAN LEFT TO BE
                       INFERRED FROM AN EMPTY LIST. The case is committed and the
                       members still sign their own bytes, because the finding is
                       the unit of truth — the container becomes assemblable when
                       the last of them lands. */
                    next: r.awaiting?.length
                      ? `the case is committed. ${r.awaiting.length} member finding(s) still to ratify `
                        + `(op=ratify): ${r.awaiting.join(", ")}. This edition becomes servable as a `
                        + `container when the last of them lands.`
                      : "the case is committed and every member finding is already ratified at the version "
                        + "this case pinned.",
                    store: storeName, tokenClass: cls });
    }

    /* Ratification: the act that moves a bundle into the published corpus.
       The authority is the SSHSIG over the canonical statement, verified
       against the registered active signers. WHO may carry that signature in
       is a separate question with a separate answer (REC-125, D-421): a
       signed-in member's own session and nothing else. The caller states the sha it reviewed, so
       ratification has its own CAS: nobody can ratify a revision they have
       not seen. Order of operations is deliberate: verify everything, then
       commit the published rows, then copy bytes to the published bucket.
       A failure mid-copy leaves rows that a re-ratification converges. */
    if (op === "ratify") {
      /* DEC-49 REGION is-machine-ratify-bundle — REC-123 / C-32.12. The fence alone, first,
         for `caseratify`'s reason above. Driven: before this, an `ai` credential whose
         scope named this op, carrying a registered member's valid signature,
         PUBLISHED THE FINDING and the record named the member as its attestor. The
         guard's shape is `caseratify`'s, for REC-46's reason stated there. */
      if (aiCred && isMachineIdentity(`${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`))
        return json({ ok: false, reason: "MACHINE_CANNOT_RATIFY", ...machineFenceRow("MACHINE_CANNOT_RATIFY"),
          op, tokenClass: cls,
          detail: "ratifying is a member's signed act. An assistant's credential may prepare the finding and "
                + "may never carry the signature in, whoever's key made it (DEC-24 rule 4)." }, 403);
      /* END DEC-49 REGION is-machine-ratify-bundle */
      /* DEC-49 REGION is-operator-ratify-bundle — REC-125 / C-32.14. D-421, DECIDED by
         BOB #14 applying `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 4 (no new
         doctrine): an ATTESTED act is performed ONLY by a named member's OWN
         AUTHENTICATED SESSION. REC-123 fenced the `ai` class above and deliberately
         left the operator's env-binding tokens open, because the AUTHORITY is the
         member's signature and those tokens were the operator's publication path as
         built. The ruling closes that: *the signature proves who AUTHORISED; the
         credential that delivers it decides WHEN the record changes, and the record
         names the actor.* A bearer token held in the hosting account is not the
         member it would name.
         THE PRECONDITION WAS MEASURED BEFORE THIS LINE WAS WRITTEN: the only surface
         that submits op=ratify is the instance page (`setup.mjs` ratifyPanel), and it
         posts with the SESSION from op=login; no kickoff, script, tool, installer or
         DIST procedure submits either op with a bearer token.
         THE PREDICATE IS HOW THE CALLER ARRIVED, NOT WHICH TOKEN IT HELD. `viaSession`
         is set only by the session lookup in the admission block; every class
         `classify()` resolves from an env binding leaves it false, so the fence covers
         ADMIN, MEMBER and PROBE today and any binding added tomorrow, and no token
         string or class list appears here to go stale. The refusal NAMES the class
         (`tokenClass`), so a caller learns which of its credentials was refused. */
      if (!viaSession)
        return json({ ok: false, reason: "OPERATOR_TOKEN_CANNOT_RATIFY",
          ...machineFenceRow("OPERATOR_TOKEN_CANNOT_RATIFY"), op, tokenClass: cls,
          detail: `ratifying is a member's own signed act, delivered through that member's own signed-in `
                + `session. The credential that asked is the operator's \`${cls}\`-class bearer token: the `
                + `signature says who authorised publication, and the credential that delivers it decides `
                + `when the record changes, so a bearer token may not carry it in (D-421).` }, 403);
      /* END DEC-49 REGION is-operator-ratify-bundle */
      const body = await req.json().catch(() => null);
      if (!body?.bundleId || !body?.expectedSha || typeof body?.sig !== "string")
        return json({ ok: false, reason: "MALFORMED", detail: "ratify requires bundleId, expectedSha, and sig (armored SSH signature)" }, 400);

      /* REC-53: EVERY Durable Object read in this block goes through REC-52's
         chokepoint (`doAnswer`/`storeSilent`), and not one of them keeps a local
         guard — the whole point of that item is that there is now ONE place that
         opens an envelope, so a rule remembered here would be the twenty-fifth
         remembered check that gets forgotten. REC-52 found eleven caller-facing
         instances of this class and converted them; it left these EIGHT alone
         because the publish/ratify block was another item's ground, and they are
         the same defect: a failure to ANSWER converted into a substantive claim
         about the RECORD, at the layer beneath every surface.

         THE ONE JUDGEMENT THIS BLOCK NEEDS, because it is the only handler in
         the file with a COMMIT in the middle of it, and it is recorded here
         rather than repeated at each site:

           - BEFORE `do/publish` commits, a silence refuses the whole act with
             `storeSilent`. Nothing has been written, the caller must ask again,
             and 502 saying "nothing here is a statement about the record" is
             exactly true.
           - AFTER it commits, a silence may NOT refuse, because a ratification
             genuinely LANDED and 502's own sentence would then be false in the
             other direction — denying knowledge we have is the same overclaim
             wearing modesty. So the post-commit sites keep the true `ok:true`
             answer and state the UNDETERMINED part IN ITS OWN FIELD, which is
             CLAUDE.md's "undetermined is first-class and must be STATED" applied
             to the half of an act that did not answer.

         Every post-commit conversion is byte-identical on the wire when the
         store ANSWERS: the new fields appear only on the path that previously
         lied, so no consumer of a working instance sees anything move. */
      const factsOut = await doAnswer(stub.fetch(`http://do/gatefacts?id=${encodeURIComponent(body.bundleId)}`));
      /* A silence here previously threw a TypeError on `facts.ok` — a crash and
         not a claim, which is the mildest member of this class and is converted
         anyway because what this read answers is the GATE'S OWN FACTS: the
         published registry, the earned registry and the signer set. A gate that
         cannot see the record cannot confirm anything, and a 500 with a stack
         trace tells a publisher nothing they can act on. */
      if (!factsOut.answered) return storeSilent("ratify/gatefacts");
      const facts = factsOut.result;
      if (!facts.ok) return json({ ...facts, store: storeName, tokenClass: cls }, 404);
      /* DEC-49 REGION is-testimony-publish-bundle — MK-1 (A) / C-53.10, C-53.11.
         MEASURED before it existed (`test/mk1-publish-probe.mjs`): op=ratify on an
         observation whose bytes were in the working bucket PUBLISHED its words,
         its provenance document and the observer's handle; a finding resting on
         one ratified. What a published case shows of an observation is the
         attesting member's choice (MEMBER-KNOWLEDGE-DESIGN.md §4), which this
         build cannot yet honour — so neither crosses until MK-3's projection
         lifts this, and lifting it is MK-3's act. Below the scope check and the
         machine fence, before the signature is weighed. */
      if (facts.testimony && facts.testimony.self.length)
        return json({ ok: false, reason: "TESTIMONY_UNPUBLISHABLE", ...testimonyFenceRow("TESTIMONY_UNPUBLISHABLE"),
          bundleId: body.bundleId,
          detail: `${body.bundleId} is a member's authored observation; what a published case shows of it is the `
                + `attesting member's choice (MEMBER-KNOWLEDGE-DESIGN.md §4), and this build cannot yet honour it (MK-3)`,
          store: storeName, tokenClass: cls }, 409);
      if (facts.testimony && facts.testimony.via.length)
        return json({ ok: false, reason: "TESTIMONY_CITED_UNPUBLISHABLE", ...testimonyFenceRow("TESTIMONY_CITED_UNPUBLISHABLE"),
          bundleId: body.bundleId, rests_on: facts.testimony.via,
          detail: `${body.bundleId} rests on a member's authored observation `
                + `(${facts.testimony.via.slice(0, 5).map((v) => v.observation).join(", ")}); what a published case `
                + `shows of it is the attesting member's choice, and this build cannot yet honour it (MK-3)`,
          store: storeName, tokenClass: cls }, 409);
      /* END DEC-49 REGION is-testimony-publish-bundle */
      if (facts.row.bundle_sha !== body.expectedSha)
        return json({ ok: false, reason: "RATIFY_STALE",
                      detail: "the bundle has changed since it was reviewed; read it again and re-sign",
                      expected: facts.row.bundle_sha, got: body.expectedSha, store: storeName, tokenClass: cls }, 409);

      if (!facts.signers.length)
        return json({ ok: false, reason: "NO_SIGNERS",
                      detail: "no active registered signing keys; an admin must register a member key before anything can be ratified",
                      store: storeName, tokenClass: cls }, 409);
      const sv = await verifySshsig(body.sig, ratifyStatement(body.bundleId, body.expectedSha),
                                    NS_RATIFY, facts.signers.map((s) => s.key_b64));
      if (!sv.ok)
        return json({ ok: false, reason: "SIG_" + sv.reason,
                      ...(sv.keyB64 ? { keyB64: sv.keyB64 } : {}),
                      ...(sv.detail ? { detail: sv.detail } : {}),
                      store: storeName, tokenClass: cls }, 403);
      const attestor = facts.signers.find((s) => s.key_b64 === sv.keyB64);

      /* REC-25: ratification reads at the RATIFIER'S scope — a bundle the
         caller may not see cannot be assembled for their signature, and the
         answer is the same ABSENT a hidden bundle would give anywhere else. */
      const ratViewer = encodeURIComponent(viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`);
      /* REC-53: `runGate` does `Object.entries(image || {})`, so a silence here
         handed the gate an EMPTY BUNDLE and the ratification came back
         GATE_REFUSED with the catalog's findings about missing required files —
         a publisher told their document is empty when the plane simply failed to
         read it. Same shape as `do/list` below, one field earlier. */
      const imgOut = await doAnswer(stub.fetch(`http://do/image?id=${encodeURIComponent(body.bundleId)}&viewer=${ratViewer}`));
      if (!imgOut.answered) return storeSilent("ratify/image");
      const image = imgOut.result;
      const r2 = typeof env.CAPTURES?.head === "function";
      /* The catalog resolves references against the whole store, so it needs
         to know which identifiers exist. One cheap query rather than a probe
         per reference.

         REC-53, AND THIS IS THE WORST REACHABLE FORM OF REC-52'S CLASS. The read
         was `(…).result || []`, so a store silence gave `runGate` an EMPTY
         known-id set and `resolveTarget` answered false for EVERY reference in
         the bundle. The ratification was then refused with C-6.2 / C-8.1 /
         C-19.1 findings reading "does not resolve in the store" — the plane
         telling a publisher, at the moment they sign, that their case cites
         things that are not there, when in fact NOTHING ANSWERED. A refusal ABOUT
         THE RECORD manufactured out of a failure to consult it, on the one act
         this whole product exists to make trustworthy.

         `|| []` SURVIVES THE FIX and that is deliberate, not an oversight: once
         `answered` is true an empty list is a REAL ANSWER — a viewer who can see
         no bundles — and treating a genuinely empty result as a non-answer would
         be this same collapse running in the opposite direction, which is what
         REC-52's arm (f) measured and what `doAnswer` refuses to do by defining
         `answered` as `ok === true` and nothing else. */
      const listOut = await doAnswer(stub.fetch(`http://do/list?viewer=${ratViewer}`));
      if (!listOut.answered) return storeSilent("ratify/list");
      const known = new Set((listOut.result || []).map((b) => b.bundle_id));
      const gate = await runGate({
        bundleId: body.bundleId, image, knownIds: known,
        registers: facts.registers,
        /* REC-14: the two facts the catalog cannot read out of the bundle --
           what THIS case asserted at its previous EDITION (C-21.1) and what the
           cases beneath it FROZE when they were signed (C-21.2). They come from
           the store with the rest of the gate facts, so the gate and the write
           path judge against the same published record. Passing nothing here
           does not soften the gate, it blinds it. */
        publishedRegistry: facts.publishedRegistry,
        /* REC-44: C-21.1's fact moved to CASE altitude and travels in its own
           registry, from the same one place that has the rows. */
        publishedCaseRegistry: facts.publishedCaseRegistry,
        /* REC-18: and the third — what each basis target EARNS from the record
           (resolutions against the question's subject entity; the capture
           record for the capture axis). Same reasoning, same source: an earned
           grade is computed by the record, so a gate that cannot see the record
           cannot confirm one, and threading it here is what makes the gate and
           op=promote's write path judge an earned leg identically. */
        earnedRegistry: facts.earnedRegistry,
        hasCapture: async (sha) => {
          if (!r2) return { present: false, bytes: 0 };
          const h = await env.CAPTURES.head(`${storeName}/captures/${sha}`);
          return h ? { present: true, bytes: h.size } : { present: false, bytes: 0 };
        },
      });
      if (!gate.ok)
        return json({ ok: false, reason: "GATE_REFUSED", gateVersion: gate.gateVersion,
                      findings: gate.findings, store: storeName, tokenClass: cls }, 409);

      /* REC-22: a capture part's SIZE, taken from the register the store already
         handed us with the gate facts. The public file manifest states per-file
         sha AND bytes, and a blob part is the one kind whose length is not in
         the image — reading it here costs nothing (the rows are already in
         memory) and beats a HEAD per part against R2. Absent means absent: a
         part the register does not size stays `null` rather than being given a
         plausible number. */
      const registerBytes = new Map((facts.registers || []).map((r) => [r.path, r.bytes]));
      const shas = [];
      for (const [path, v] of Object.entries(image)) {
        if (path.startsWith("_history/")) continue;
        if (typeof v === "string") {
          const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)))]
            .map((x) => x.toString(16).padStart(2, "0")).join("");
          shas.push({ sha256: sha, path, kind: path === "bundle.md" ? "bundle" : "file",
                      bytes: new TextEncoder().encode(v).length, text: v });
        } else {
          shas.push({ sha256: v.blobSha, path, kind: "capture",
                      bytes: registerBytes.has(path) ? registerBytes.get(path) : null });
        }
      }

      /* REC-14 / DEC-12: the EDITION, the frozen pair, the declared bar and the
         completeness assertion all come out of the RATIFIED BYTES -- never off
         the request and never re-derived here. The signature covers this
         document, so anything committed beside it must be inside the hash the
         member signed; re-deriving the strength at this point would put a
         number in the public projection that nobody attested. An inquiry that
         is not `published` ratifies exactly as before with edition 1, which is
         what every information bundle is. */
      const ratifiedFm = typeof image["bundle.md"] === "string"
        ? (parseFrontmatter(image["bundle.md"]).data || {}) : {};
      /* CASE-4 / DEC-72: THE CASE RELATION, read out of the SIGNED BYTES exactly
         as the state word was. A member finding no longer wears `published`; it
         asserts membership of a case edition, and that assertion is inside the
         hash the member signed for REC-44's own reason. Left keyed on the state
         word, this would be FALSE for every document published after this item —
         and everything it gates would then quietly take its non-case default:
         edition 1, no frozen strength, no frozen completeness, no case. A case
         would ratify as though it were an information bundle, with the suite
         green, which is why this line is the most dangerous one in the change. */
      const isCase = normalizeType(ratifiedFm.object_type) === "inquiry"
        && isCaseMemberBytes(ratifiedFm);
      const edition = isCase && Number.isInteger(ratifiedFm.edition) ? ratifiedFm.edition : 1;
      const frozenStrength = isCase && Array.isArray(ratifiedFm.published_strength)
        ? ratifiedFm.published_strength : null;
      const frozenCompleteness = isCase ? {
        ...completenessFields(ratifiedFm),
        subject_position: ratifiedFm.completeness?.subject_position ?? null,
        author: ratifiedFm.completeness?.author ?? null,
        at: ratifiedFm.completeness?.at ?? null,
      } : null;
      /* ===== CASE-5b / DEC-72: EIGHT CASE READS LEFT THIS BLOCK ==============

         `caseId`, `caseFindings`, `caseScope`, `caseProject`, `caseRoles`,
         `caseEdition`, `caseBar` and `caseBiasAck` were all read out of THIS
         MEMBER'S ratified frontmatter and handed to `publish()`, which committed
         `cases`, `published_cases` and the roster from them. That was the only
         way to get a case fact inside a signature, and REC-44's sentence for it
         was exact: *a case identity, a scope statement or a roster that is not
         inside the hash the member signed is one this plane would be asserting on
         their behalf.*

         THE SENTENCE IS UNCHANGED AND THE HASH IS A DIFFERENT ONE NOW. Those
         facts are committed by `op=caseratify`, out of the CASE DOCUMENT a member
         reviewed and signed, before any member ratifies. So this act has no case
         fact to read and none to pass: it commits one finding's own published
         row, and the store resolves which case that row belongs to from the PIN
         the case froze — `published_case_members.version_sha = bundle_sha`,
         CASE-3's column answering CASE-3's question.

         WHAT STAYED IS WHAT WAS ALWAYS THE FINDING'S — its own edition, its
         frozen strength pair, its frozen completeness. Read out of the ratified
         bytes exactly as before, and out of nothing else. ==================== */

      /* DEC-34 as REC-44 corrects it: THE CONTAINER IS THE CASE'S, and it is
         therefore NOT BUILT HERE. It used to be, because a case was assumed to
         be one inquiry and the manifest could be assembled from the one
         document this act ratifies. A case holds one or MORE findings, each
         signed on its own bytes, so the container can only be assembled when
         the LAST member of an edition lands — which is why it is built below,
         after the store has said whether this ratification completed the
         edition. Everything DEC-34 required is unchanged: every part named by
         sha256, the manifest answerable by its own hash, and tamper-EVIDENT
         rather than tamper-proof.

         DEC-34: the CONTAINER's signed hash manifest. "Protected" means
         TAMPER-EVIDENT and the record must never claim otherwise -- a zip
         password is either broken encryption or a lock on the stranger this
         surface exists to serve, and a PDF's write-protect flag is advisory.
         What actually protects: every part is listed here by sha256, the
         manifest names the bundle sha the SSHSIG covers and carries the
         armored signature itself, and the manifest's OWN sha goes into
         published_shas -- so any copy of the container anywhere can be checked
         against this instance by hash, and a modified copy is DETECTABLE by
         anyone without our cooperation. That is the stronger property, and it
         needs no DRM.

         THE CONTAINER IS THE BUNDLE'S PORTABLE FORM, not a new object: the
         parts listed here ARE the bundle's files, each already content-addressed
         in the published bucket. `layout` says how they serialise into the zip
         so REC-22 -- which serves the container and its PDF renderings -- has a
         shape to build against rather than one to invent. The renderings and
         the per-page brazening are REC-22/UI-18's half and are deliberately not
         produced here; when they land they join `parts` with kind "rendering"
         and the manifest shape does not change.

         EDITIONS ARE OVER THE CONTAINER (DEC-12): a new edition is a new
         manifest with a new hash, and earlier editions keep answering. */
      /* REC-22 / R4: THE PUBLISHED GRAPH, read out of the RATIFIED BYTES and out
         of nothing else — not the caller's request, not the working `refs`
         table, which is a projection of whatever bundle.md says today and moves
         under a published edition every time somebody promotes. What the
         signature covers is what the published graph says.

         The CLASSIFICATION is made here and enforced in the store:
           - references[]      candidates for a SERVE edge. The store admits one
                               only if the target is itself published; the rest
                               are dropped, which is what stops the published
                               graph naming working material.
           - division_parent   NAME-ONLY, by kind, whatever the target's state.
           - division_siblings A divided parent is TERMINAL and can never be
                               published and a sibling may not be, so R4's
                               disclosure — "a published child names its parent
                               and its siblings" — exists only as a name-only
                               edge. It is name-only even when the target IS
                               published: the rule is "names them while serving
                               neither", which is about the disclosure and not
                               about what happens to be reachable. */
      const fmRefs = Array.isArray(ratifiedFm.references) ? ratifiedFm.references : [];
      const edges = [
        ...fmRefs.filter((r) => r && typeof r.target === "string")
          .map((r) => ({ to: r.target, kind: typeof r.rel === "string" && r.rel ? r.rel : "cites",
                         disclosure: "serve" })),
        ...(typeof ratifiedFm.division_parent === "string" && ratifiedFm.division_parent !== "null"
          ? [{ to: ratifiedFm.division_parent, kind: "division_parent", disclosure: "name" }] : []),
        ...(Array.isArray(ratifiedFm.division_siblings) ? ratifiedFm.division_siblings : [])
          .filter((s) => typeof s === "string" && s)
          .map((s) => ({ to: s, kind: "division_sibling", disclosure: "name" })),
      ];

      /* REC-53: THE COMMIT, and the last site that may refuse. A silence here
         synthesised `reason:"PUBLISH_FAILED"` at HTTP 500 — a ternary fallback,
         which is why REC-52's detector B (built for the `||` form) could not see
         it. It is the same invention: the plane asserting the ratification did
         NOT publish when it does not know whether it did. The fallback SURVIVES
         below and is now honest, because it is reached only when the store
         ANSWERED with a result carrying no reason of its own — a description of
         what the store said rather than of a silence. */
      /* REC-128: the deliverer from the SESSION ROW, the signer from the SIGNATURE,
         each from its one source — `op=caseratify`'s twin block says why, including
         why the signer's `?? sessMember` fallback is gone. */
      const deliveredBy = deliveringPrincipal(sessRights); /* REC-128: op=ratify */
      const pubOut = await doAnswer(stub.fetch(new Request("http://do/publish", {
        method: "POST", body: JSON.stringify({
          bundleId: body.bundleId, bundleSha: body.expectedSha, deliveredBy,
          attestorKey: sv.keyB64, attestorMember: attestor?.member_id ?? null,
          gateVersion: gate.gateVersion, sigArmored: body.sig,
          /* Only a CASE names its edition, and it names it in the signed bytes.
             Everything else leaves it to the store, which appends the next one
             — an information bundle has no authored edition to assert and the
             control plane must not invent one for it. */
          ...(isCase ? { edition } : {}), title: ratifiedFm.title ?? null,
          completeness: frozenCompleteness, strength: frozenStrength,
          /* CASE-5b: `required` IS NOT SENT ANY MORE. The bar is the CASE's
             (DEC-72 clause 2) and it left these bytes with the rest of the case,
             so there is nothing here to send. `publish()` reads it from
             `published_cases.bar` — committed from the case document a member
             signed — which is the same doctrine reading a different signature. */
          group: ratifiedFm.group ?? null,
          edges,
          shas: shas.map(({ text, ...s }) => s),
        }) })));
      if (!pubOut.answered) return storeSilent("ratify/publish");
      const pub = pubOut.result;
      if (!pub?.ok)
        return json({ ok: false, ...(pub && pub.reason ? pub : { reason: "PUBLISH_FAILED", detail: pub }),
                      store: storeName, tokenClass: cls },
                    pub && (pub.reason === "EDITION_NOT_INCREMENTED" || pub.reason === "EDITION_EXISTS"
                            || pub.reason === "CASE_ASSERTION_DIVERGED" || pub.reason === "CASE_MEMBERSHIP_DIVERGED"
                            /* CASE-2 / DEC-72: both are DISAGREEMENTS BETWEEN
                               SIGNED DOCUMENTS, which is what 409 says here —
                               the same class as the roster and the assertion
                               beside them, not a fault in this request. */
                            || pub.reason === "CASE_ROLES_DIVERGED" || pub.reason === "CASE_PRODUCTION_DIVERGED"
                            || pub.reason === "CASE_NAMES_NO_PROJECT"
                            || pub.reason === "CASE_ROSTER_EXCLUDES_SELF") ? 409 : 500);

      /* The fence: ratified bytes land content-addressed in the published
         bucket, so the published corpus is self-contained. Existing keys
         are immutable and skipped; captures stream across from the working
         bucket where their presence was just gate-verified. */
      let copied = 0, present = 0, r2state = "not configured";
      if (typeof env.PUBLISHED?.put === "function" && r2) {
        r2state = "ok";
        for (const s of shas) {
          const key = `${storeName}/published/${s.sha256}`;
          if (await env.PUBLISHED.head(key)) { present++; continue; }
          if (s.kind === "capture") {
            const obj = await env.CAPTURES.get(`${storeName}/captures/${s.sha256}`);
            if (!obj) { r2state = "INCOMPLETE: capture vanished between gate and copy"; continue; }
            await env.PUBLISHED.put(key, obj.body);
          } else {
            await env.PUBLISHED.put(key, new TextEncoder().encode(s.text));
          }
          copied++;
        }
      }

      /* REC-44 / DEC-34: THE CASE CONTAINER, assembled the moment the LAST
         member finding of an edition is ratified and not before. A case is a
         container over one or MORE findings, each signed on its own bytes, so
         there is a real window in which a case edition EXISTS and cannot be
         served whole; the store states that as `awaiting` rather than
         pretending, and a manifest built earlier would name parts that are not
         in the published store yet — the PART_MISSING refusal by construction.
         DEC-44 determination 3 is what makes the assembly non-negotiable: a
         stranger holding the zip must be able to check EVERY finding the case
         rests on without contacting this instance, so naming them is not enough
         and every member's parts are carried in full.
         There is NO case-level strength here and there must never be one: each
         finding carries its own frozen pair inside findings[], and one letter
         over the case is R2's forbidden composition at case altitude. */
      let container = null;
      if (pub.case && pub.case.complete && !pub.case.manifest_sha) {
        const cs = pub.case;
        const manifest = {
          /* REC-47 bumps 2 -> 3, and the bump is deliberate rather than
             bookkeeping. The container gains `bias_acknowledgement`, which is a
             DISCLOSURE a reader is entitled to rely on being present: without a
             version move, a /2 container carrying no acknowledgement and a /2
             container that simply predates the field are indistinguishable to a
             stranger holding the zip, and "the record is silent" would read as
             "the group declared nothing". The whole premise of the container is
             that it is readable without our cooperation, so the only place that
             ambiguity could be resolved is the one place the reader cannot
             reach. REC-44 bumped 1 -> 2 for the same class of reason. */
          /* CASE-5 / DEC-72 bumps 3 -> 4, AND THE BUMP IS THE SAME ARGUMENT
             REC-47 MADE, arriving on the fields the artifact flip adds. `/4`
             carries the PIN, the AUTHORED ROLE, each member's OWN edition, whose
             production the case is and the standard it was held to. Without a
             version move a `/3` container carrying no pin and a `/4` container
             whose pin was WITHHELD are indistinguishable to a stranger holding
             the zip, and "the record is silent" would read as "the case froze
             nothing" — which is the one claim this artifact exists to refute.
             The whole premise is that it is readable without our cooperation, so
             the only place that ambiguity could be resolved is the one place the
             reader cannot reach. */
          /* CASE-5b / DEC-72 bumps 4 -> 5, AND THIS BUMP IS LOAD-BEARING IN A WAY
             THE OTHERS WERE NOT. `/4` and every version before it carried the
             case's scope, roster, partition, bias acknowledgement and bar as
             MANIFEST FIELDS — and a stranger could check every one of them,
             because the same facts were inside each member's SIGNED bundle.md.
             That is the property REC-44 bought and it is why the fields could be
             taken on trust here: the manifest was a convenience over material
             the reader could verify.

             CASE-5b removes those facts from member bytes. A `/4`-shaped
             manifest built after this item would carry the same fields with
             NOTHING BEHIND THEM — assertions this instance makes about itself,
             checkable against nothing, which is precisely the ambiguity the
             format comment above says this artifact exists to refute. So `/5`
             carries `case_document`: the bytes, their hash, and the armored
             signature a member made over them, verifiable with ssh-keygen
             against a key the artifact names.

             WITHOUT THE VERSION MOVE a reader could not tell a `/4` container
             whose case facts were member-signed from a `/4` container whose case
             facts were nobody's. That distinction is the entire difference
             between this record and a press release. */
          /* REC-128 bumps 5 -> 6, ON THE ARGUMENT EVERY BUMP ABOVE MADE. `/6`
             carries `delivered_by` beside every `attestor` — on the case document
             and on each finding — naming whose authenticated session CARRIED the
             signature in: a member, or the instance's founder. Without the move a
             `/5` container (which never recorded a deliverer) and a `/6` one whose
             deliverer was not recorded would read alike, and a stranger could not
             tell "nobody said" from "the format had no place to say". EXISTING
             containers are untouched: a manifest is built once, when an edition
             completes, and is served by its own stored hash, so nothing already
             published verifies against anything new. `delivered_by` is THIS
             INSTANCE'S RECORD and not covered by any signature (a member signs
             before anybody delivers), and `verify` below says so in words. */
          format: "bio-case-container/6",
          case: cs.caseId,
          edition: cs.edition,
          group: cs.group ?? null,
          /* THE SIGNED CASE DOCUMENT, WHOLE. The text is carried rather than a
             digest of it for the same reason every member's bundle.md is carried
             rather than named: a stranger must be able to RE-HASH what they hold
             and check the signature over it themselves. A digest alone would let
             them detect a mismatch and never let them read what was signed.

             THE STATEMENT IS PRINTED IN ASCII, which is CASE-5's own correction
             arriving on the new field: `caseRatifyStatement()` returns a
             Uint8Array, and `JSON.stringify` renders one as an object of byte
             indices — so a `/4` container told a stranger to verify over a
             statement printed as numbered integers. Decoded here, at the site,
             rather than by changing what the statement builder returns. */
          case_document: cs.document ? {
            doc_sha: cs.document.doc_sha,
            text: cs.document.text,
            gate_version: cs.document.gate_version,
            ratified_at: cs.document.ratified_at,
            attestor: cs.document.attestor,
            delivered_by: cs.document.delivered_by,
            signature: { namespace: NS_RATIFY,
                         statement: new TextDecoder().decode(
                           caseRatifyStatement(cs.caseId, cs.edition, cs.document.doc_sha)),
                         /* `armored`, the SAME field name every member's
                            signature already uses twelve lines down. A second
                            spelling for one thing in one artifact is how a
                            consumer comes to handle only the half it happened to
                            meet first. */
                         armored: cs.document.sig_armored },
          } : null,
          /* DEC-72 clause 2, INSIDE THE ARTIFACT THAT TRAVELS. Whose production
             this case is, and the standard of evidence it was held to. The
             design doc's own list of what the CASE artifact freezes names the
             bar; before this item it was reachable only by opening a member's
             bundle.md and reading that member's copy, which is one member's
             stamp of a case property. A stranger weighing a case has to be able
             to see what the group required of it and who required it, from the
             bytes in their hand. `bar: null` is the absent-bar posture and never
             a bar of zero, which `verify` below says in words. */
          project: cs.project ?? null,
          bar: cs.bar ?? null,
          /* DEC-44 determination 2: what the case is ABOUT, authored by the
             group. Beside it, what it left OUT. A reader needs both. */
          scope: cs.scope ?? null,
          /* REC-47 / DEC-46 (a): INSIDE THE CONTAINER, which is the copy that
             matters most. DEC-20 makes the bias part of the evidentiary record
             that TRAVELS with publication, and the container is the artifact
             that travels — a stranger holding the zip must be able to read the
             lens this case was made under without coming back to this instance.
             An acknowledgement served only from a live op would be a disclosure
             that stops existing the moment the instance does. */
          bias_acknowledgement: cs.bias_acknowledgement ?? null,
          completeness: cs.completeness ?? null,
          /* REC-58, 2026-08-05: `ratified_at` and NOT `opened`, and the pair is
             a decision rather than an accident of which fields were to hand.
             `cs` is the whole case-edition state and carries both. The instant
             the LAST member signed is what this container can stand behind; the
             instant somebody started work is a fact about the working record,
             and a stranger holding this zip has no way to check it and no stated
             use for it. Named rather than spread, for the reason at the sibling
             pick above: this artifact travels without this instance, so a field
             that leaks into it cannot be withdrawn from the copies. */
          ratified_at: cs.ratified_at,
          /* EVERY MEMBER FINDING, each with its OWN signature, its OWN attestor
             and its OWN frozen PAIR. The signature is per finding because the
             FINDING is the unit of truth: what a member signed is one
             document's bytes, and a case-level signature would be a signature
             over something nobody reviewed. */
          findings: cs.findings.map((f) => ({
            bundle_id: f.bundle_id, title: f.title,
            /* CASE-5, AND THIS ONE LINE WAS A FALSE STATEMENT IN A SIGNED-ADJACENT
               ARTIFACT. It read `edition: cs.edition` — the CASE's number,
               written onto every member as though it were the member's. While
               the two were slaved it happened to be true; the artifact flip makes
               it a claim about a finding that the finding's own published row
               contradicts, and this is the copy that TRAVELS, so a reader has no
               way to check it against anything. It is the member's own edition,
               off the member's own published row, resolved by the pin. */
            edition: f.edition,
            bundle_sha: f.bundle_sha,
            /* THE PIN AND THE DESIGNATION, INSIDE THE CONTAINER. The design's
               sentence: the CASE artifact freezes its members — *"content by
               hash, version, per-member strength pair, role, the bar, the
               exclusions."* The pair and the exclusions were already here (the
               latter inside `completeness.excluded`, which is why it is not
               copied a second time); the version and the role were not.
               `version_sha` is what the case COMMITTED TO and `bundle_sha` is
               what the member SIGNED — equal by construction at assembly, and
               carried as two fields anyway, because a reader checking the freeze
               must be able to see the case's commitment as a separate statement
               from the finding's own hash. `role` is the authored designation
               (clause 4): a stranger holding a SUPPORTING member must be able to
               see it was not presented as carrying the case. */
            version_sha: f.version_sha ?? null,
            role: f.role ?? null,
            ratified_at: f.ratified_at, gate_version: f.gate_version,
            attestor: f.attestor,
            delivered_by: f.delivered_by,
            /* CASE-5 CORRECTS `statement`, AND IT IS THE ONE FIELD IN THIS
               ARTIFACT THAT WAS UNREADABLE BY THE READER IT EXISTS FOR.
               `ratifyStatement()` returns a Uint8Array — it is the message fed
               to the signer — and JSON.stringify turns a Uint8Array into an
               OBJECT KEYED BY BYTE INDEX: {"0":98,"1":105,…}. So the container
               told a stranger to check a signature over a statement it printed
               as 47 numbered integers, and the one thing they had to have in
               ASCII was the one thing they had to decode. Nothing consumed it —
               measured across `civicos-ui`, the battery and this file — so this
               is a correction and not a withdrawal, and it rides the /4 bump
               with the rest of what the flip adds. Decoded here rather than by
               changing `ratifyStatement`, whose Uint8Array return is exactly
               right for `verifySshsig`'s caller two thousand lines up. */
            signature: { namespace: NS_RATIFY,
                         statement: new TextDecoder().decode(ratifyStatement(f.bundle_id, f.bundle_sha)),
                         armored: f.sig_armored },
            strength: f.strength, required_strength: f.required,
            parts: f.parts.map((p) => `${f.bundle_id}/${p.path}`),
          })),
          /* The parts are NAMESPACED BY FINDING, and that is forced rather than
             chosen: every finding carries a `bundle.md`, so a flat parts[]
             would have two members claiming one path and the archive would say
             two things about one name. */
          parts: cs.findings.flatMap((f) => f.parts.map((p) => ({
            path: `${f.bundle_id}/${p.path}`, finding: f.bundle_id,
            sha256: p.sha256, kind: p.kind, bytes: p.bytes ?? null }))),
          layout: { root: `${cs.caseId}/`, parts_at: "path", manifest_at: "MANIFEST.json",
                    note: "the zip carries every part at <case>/<finding>/<path> with this manifest at the "
                        + "root. Check each part's sha256 against this list, then check this manifest's own "
                        + "sha256 and each finding's signature over its own bundle_sha. Renderings (REC-22) "
                        + "join parts[] as kind: rendering." },
          verify: "tamper-EVIDENT, not tamper-proof: nothing here prevents a modified copy, and everything here "
                + "makes one detectable by anyone holding it, without this instance's cooperation. Each "
                + "finding is signed on its own bytes; there is no case-level strength, because composing "
                + "several findings' strengths into one letter is a claim the evidence does not support. "
                /* CASE-5: THE INSTRUCTIONS A STRANGER ACTUALLY NEEDS, in the
                   artifact rather than in our documentation — which they do not
                   have, and which is the whole point of the thing they are
                   holding. Three sentences, one per field the flip adds, each of
                   them a check the reader can RUN. */
                + "EACH FINDING'S `edition` IS ITS OWN, on its own version chain, and is NOT this case's "
                + "edition: since the artifact flip the two are separate numbers, so a member of edition 2 "
                + "of this case may be at its own edition 1. `version_sha` is the version THIS CASE "
                + "COMMITTED TO and must equal that finding's `bundle_sha` here; if they differ, this "
                + "container was assembled over a member the case did not pin and you should not rely on "
                + "it. `role` is the publisher's authored designation: only `load_bearing` members were "
                + "held to the `bar` above, and a `supporting` member is part of the published work without "
                + "being presented as carrying it. Where `bar` is null NO STANDARD WAS RECORDED, which is "
                + "not a standard of zero — the case claims no cleared bar and says so. "
                /* REC-128: the two principals of one ratification, told apart in
                   the artifact that travels. */
                + "`attestor` is who SIGNED, and the signature proves it. `delivered_by` is who DELIVERED "
                + "that signature to this instance — the authenticated session that performed the act, a "
                + "member or the instance's founder — and it is this instance's record, not covered by any "
                + "signature. `undetermined` there means the delivery was not recorded; it never means the "
                + "signer delivered it.",
        };
        const mText = JSON.stringify(manifest, null, 1);
        const mBytes = new TextEncoder().encode(mText);
        const mSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", mBytes))]
          .map((x) => x.toString(16).padStart(2, "0")).join("");
        /* REC-53, THE FIRST POST-COMMIT SITE. A silence here made `rec`
           undefined and the fallback minted `reason:"MANIFEST_NOT_RECORDED"` —
           a statement that the published record does NOT hold this case's
           container — and carried it inside an `ok:true` ratification answer.
           Invisible to REC-52's detector B, which reads `json()` arguments, and
           to detector A, which looks for a `.result` spread: this one travels to
           the caller in a LOCAL VARIABLE and is spread twelve lines later.
           The ratification has ALREADY COMMITTED here, so this may not refuse;
           it states the exchange instead. The `MANIFEST_NOT_RECORDED` fallback
           survives for the answered path, where it describes a store that said
           `ok:false` without a reason of its own. */
        const recOut = await doAnswer(stub.fetch(new Request("http://do/recordcasemanifest", {
          method: "POST", body: JSON.stringify({ caseId: cs.caseId, edition: cs.edition,
                                                 manifest, manifestSha: mSha, bytes: mBytes.length }) })));
        const rec = recOut.result;
        if (recOut.answered && rec && rec.ok && typeof env.PUBLISHED?.put === "function") {
          const key = `${storeName}/published/${mSha}`;
          if (!(await env.PUBLISHED.head(key))) await env.PUBLISHED.put(key, mBytes);
        }
        container = !recOut.answered
          ? { ok: false, reason: STORE_SILENT_REASON, op: "ratify/recordcasemanifest",
              detail: STORE_SILENT_DETAIL }
          : rec && rec.ok
            ? { manifest_sha: mSha, parts: manifest.parts.length, findings: manifest.findings.length,
                zip: `op=publishedbytes&sha256=${mSha}&format=zip` }
            : { ok: false, ...(rec || { reason: "MANIFEST_NOT_RECORDED" }) };
      }

      /* CAP-4 / CAPTURE-SCALING item 6: re-fetch the reused parts at
         ratification, which is where a working capture's reuse becomes evidence.
         MANDATORY as an ATTEMPT AND A RECORD, never as agreement (item 6b): the
         four outcomes -- confirmed, changed, unavailable, not_attempted -- all
         ratify and say different things, and the one forbidden thing is ratifying
         with a reused part and saying nothing. A PLAIN GET, not If-None-Match
         (item 6c): both cost the one scarce subrequest, but our own SHA-256 over
         what we received is the evidence the record is keyed on, where a 304 would
         be only the origin's assertion. Bounded by the calibrated capture_limits
         ceiling (item 6d): parts the budget cannot reach are recorded
         `not_attempted` WITH the reason, never silently omitted. Ratification is
         rare and deliberate, so the budget is available exactly when the stakes
         rise; this does not gate -- every outcome still ratifies. */
      let reuseReport = null;
      /* REC-53, THE ITEM'S SECOND NAMED SITE. A silence made `reused` undefined,
         the guard below fell through, `reuseReport` stayed null and the `reuse`
         key was simply ABSENT from the answer — which reads as "no part of this
         bundle was reused", a statement about WHAT THE GROUP DID, manufactured
         out of a failure to look. Worse than it sounds against item 6b directly
         above: "the one forbidden thing is ratifying with a reused part and
         saying nothing" is precisely what a store silence made the plane do.
         Post-commit, so it states the undetermined rather than refusing. */
      const reusedOut = await doAnswer(stub.fetch(`http://do/reusedparts?id=${encodeURIComponent(body.bundleId)}`));
      const reused = reusedOut.result;
      if (!reusedOut.answered) {
        reuseReport = { ok: false, reason: STORE_SILENT_REASON, op: "ratify/reusedparts",
                        detail: STORE_SILENT_DETAIL,
                        note: "whether this bundle reused any part from the record is UNDETERMINED for this "
                            + "ratification, and that is NOT the same as no part having been reused. The "
                            + "bundle is ratified -- the signature, the gate and the published rows are all "
                            + "unaffected by this read -- and the reuse re-check (CAP-4 item 6b) did not "
                            + "happen. Re-ratifying converges it." };
      } else if (reused && Array.isArray(reused.parts) && reused.parts.length) {
        /* REC-53: a silence here left `observed` null, which is ALSO what a
           genuine "nothing calibrated yet" answers — so the recorded basis of
           every not_attempted part said "none observed" about a ceiling nobody
           read, and that sentence is written into the RECORD by
           recordreuseverdicts below. The two are separated by `ceilingRead`. */
        const limOut = await doAnswer(stub.fetch("http://do/capturelimit?runtime=subrequests"));
        const ceilingRead = limOut.answered;
        const lim = limOut.result;
        const observed = ceilingRead && lim && lim.observed ? lim.observed : null;
        const ceilingWord = !ceilingRead
          ? "UNREAD -- the store did not answer the capture-limit read, so this budget is our own appetite "
            + "and not a calibrated ceiling"
          : observed == null ? "none observed" : String(observed);
        /* Our APPETITE is ours and constant; the runtime's CAPACITY is the
           observed ceiling, discovered by being refused (capture_limits doctrine).
           A margin is reserved for the plane's own DO/R2 subrequests during this
           ratification so re-fetching does not itself trip the ceiling. */
        const appetite = Number(env.RATIFY_REFETCH_BUDGET) || 500;
        const margin = env.RATIFY_REFETCH_MARGIN !== undefined ? (Number(env.RATIFY_REFETCH_MARGIN) || 0) : 4;
        const budget = observed != null ? Math.min(appetite, Math.max(0, observed - margin)) : appetite;
        const rhex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
        const verdicts = [];
        let spent = 0;
        for (const p of reused.parts) {
          const base = { source_capture: p.primary_sha, host: p.host,
                         address_norm: p.address_norm, reused_sha: p.reused_sha };
          if (!p.address || !isPublicHttpsLocator(p.address)) {
            verdicts.push({ ...base, verdict: "unavailable", observed_sha: null,
              basis: "the reused part has no re-fetchable public https address on record, so the source "
                   + "cannot be re-checked; ratified with the bytes captured on the day" });
            continue;
          }
          if (spent >= budget) {
            verdicts.push({ ...base, verdict: "not_attempted", observed_sha: null,
              basis: `this ratification's re-fetch budget (${budget}, bounded by the calibrated subrequest `
                   + `ceiling ${ceilingWord}) was spent before this part; `
                   + `it is recorded as outstanding, not silently omitted` });
            continue;
          }
          spent++;
          let r = null;
          try { r = await fetch(p.address, { redirect: "follow", headers: { "user-agent": userAgent(env, "ratify") } }); }
          catch { r = null; }
          if (!r || !r.ok) {
            verdicts.push({ ...base, verdict: "unavailable", observed_sha: null,
              basis: `a plain GET returned ${r ? r.status : "a network error"}; the source no longer answers, `
                   + `and the bundle is ratified with the bytes captured on the day` });
            continue;
          }
          const got = rhex(await crypto.subtle.digest("SHA-256", new Uint8Array(await r.arrayBuffer())));
          if (got === p.reused_sha)
            verdicts.push({ ...base, verdict: "confirmed", observed_sha: got,
              basis: "a plain GET re-fetched the reused part and our own SHA-256 over what we received "
                   + "matches the reused bytes" });
          else
            verdicts.push({ ...base, verdict: "changed", observed_sha: got,
              basis: "a plain GET returned different bytes than were reused; ratified with the bytes captured "
                   + "on the day, the divergence recorded as the dated fact it is" });
        }
        const at = new Date().toISOString();
        /* REC-53: this write was FIRE-AND-FORGET, so a silence left the verdicts
           out of the record while the report below handed the caller the
           outcomes and the sentence "every reused part carries an outcome" —
           true of the response, false of the record it names. Being unread, it
           was invisible even to REC-52's detector C, which only sees a body that
           is CONSUMED; the block-level assertion in `plane-envelope.test.mjs` is
           what covers it now. */
        const vOut = await doAnswer(stub.fetch(new Request("http://do/recordreuseverdicts", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ bundleId: body.bundleId, at, verdicts }) })));
        const tally = (k) => verdicts.filter((v) => v.verdict === k).length;
        reuseReport = {
          reused_parts: reused.parts.length, budget,
          /* Both spreads are EMPTY on the answered path, so a working instance's
             answer is byte-identical to what it was before this item; the extra
             field exists only where the answer used to be a claim nobody could
             support. */
          ...(ceilingRead ? { ceiling: observed }
                          : { ceiling_unread: { reason: STORE_SILENT_REASON, op: "ratify/capturelimit",
                                                detail: STORE_SILENT_DETAIL } }),
          confirmed: tally("confirmed"), changed: tally("changed"),
          unavailable: tally("unavailable"), not_attempted: tally("not_attempted"),
          outcomes: verdicts.map((v) => ({ address_norm: v.address_norm, source_capture: v.source_capture,
                                           verdict: v.verdict, observed_sha: v.observed_sha, basis: v.basis })),
          note: "every reused part carries an outcome. confirmed/changed/unavailable all ratify and say "
              + "different things; not_attempted names a part the budget could not reach. Re-fetch is a plain "
              + "GET, hashed by us -- a reused part ratified in silence is what is forbidden.",
          ...(vOut.answered ? {}
                            : { recorded: { ok: false, reason: STORE_SILENT_REASON,
                                            op: "ratify/recordreuseverdicts", detail: STORE_SILENT_DETAIL,
                                            note: "the outcomes above are what this ratification OBSERVED; "
                                                + "whether they reached the record is undetermined, so do not "
                                                + "read their absence from the reuse history as their never "
                                                + "having been checked. Re-ratifying converges it." } }),
        };
      }

      return json({ ok: true, bundleId: body.bundleId, bundleSha: body.expectedSha,
                    edition: pub.edition,
                    /* REC-22: the manifest's own hash IS the container's identity — every
                       part is named and hashed by it — so it is also the address the zip
                       is served at (op=publishedbytes&sha256=<manifest_sha>&format=zip),
                       and `graph` reports what the published edges did: how many the
                       surface may SERVE, how many it may only NAME, and how many
                       references were dropped for pointing at unpublished material. */
                    /* REC-58, 2026-08-05: THIS PICK IS A FENCE AND IS NAMED AS
                       ONE, because it was doing the work with nothing saying
                       so. `pub.case` is `#caseEditionState`'s WHOLE return,
                       arriving over the internal `do/publish` hop, and it
                       carries `opened` — the only route by which that field can
                       leave the store. Five fields are forwarded and `opened` is
                       not among them, so it stops here. KEEP THIS A PICK: a
                       `...pub.case` would put an unconsumed field (re-measured
                       at zero consumers by REC-58) on a public answer with
                       nobody having decided to publish it. test/case-opened.test.mjs
                       asserts both the named fields and the absence of a spread. */
                    ...(pub.caseId ? { caseId: pub.caseId,
                                       case: { edition: pub.case?.edition ?? null,
                                               complete: !!pub.case?.complete,
                                               awaiting: pub.case?.awaiting ?? [],
                                               findings: (pub.case?.findings ?? []).map((f) => f.bundle_id),
                                               detail: pub.case?.detail ?? null } } : {}),
                    container: container
                      ?? (pub.case && pub.case.manifest_sha
                        ? { manifest_sha: pub.case.manifest_sha,
                            zip: `op=publishedbytes&sha256=${pub.case.manifest_sha}&format=zip` }
                        : null),
                    graph: pub.edges ?? null,
                    existed: pub.existed, ratifiedAt: pub.ratifiedAt,
                    attestor: attestor?.member_id ?? null, gateVersion: gate.gateVersion,
                    /* REC-128: who DELIVERED this request (a retry that `existed`
                       wrote nothing; the record keeps its first deliverer). */
                    deliveredBy: delivererOf(deliveredBy),
                    published: { shas: shas.length, copied, alreadyPresent: present, r2: r2state },
                    ...(reuseReport ? { reuse: reuseReport } : {}),
                    store: storeName, tokenClass: cls }, 200);
    }

    /* A few ops read better at the edge than they do inside the store, so
       the public name and the internal name differ. The map is the only
       place that difference lives. */
    /* REC-14: op=publish is the STATE ACT; the store's own /publish is the
       ratify committer that writes the published_bundles row. Two different
       things with one obvious name, so the public name and the internal name
       differ here exactly as they do for op=inbox. */
    const DO_PATH = { inbox: "inboxlist", memberlist: "memberlist", signerlist: "signerlist",
                      publish: "publishcase" };
    const inner = new URL("http://x/" + (DO_PATH[op] || op));
    for (const [k, v] of url.searchParams) if (k !== "token" && k !== "op") inner.searchParams.set(k, v);
    /* REC-132 / D-422: `identity` — WHO is asking, beside `viewer`'s what they may see —
       is the SERVER's stamp and nothing else. Deleted for every op before anything is
       stamped, so a caller naming a member here reads as nobody rather than as them. */
    inner.searchParams.delete("identity");
    /* Who holds a lease is stamped by the server, never taken from the request,
       for BOTH a session and a machine credential — the same impostor rule
       `author`, `by` and `viewer` follow below. A session stamps the member; a
       machine credential stamps `token:<class>`, a NAMED machine identity, so an
       unattended writer can take the lock (D-61) without borrowing a person's
       name and without being anonymous. The caller's own `actor` was copied in
       the loop above, so it is DELETED first and set second: a lease whose actor
       the caller may choose names nobody. This does not weaken integrity — the
       lease is a courtesy lock and promote's CAS on `base` is what prevents a
       lost update — it makes the courtesy lock reachable by a named daemon.
       The store additionally refuses a null/blank actor by name, so a bypass of
       this stamp fails closed rather than tripping the NOT NULL constraint. */
    if (op === "lease") inner.searchParams.set("actor", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* D-15: whose view a query compiles for is decided by the SERVER, from the
       credential that authenticated, and set AFTER the caller's parameters were
       copied so a caller-supplied `viewer` is overwritten rather than honoured.
       The gate is flat member scope today and returns true for a member; when
       projects and positions land it returns a real predicate and this is still
       the only place the identity comes from. A viewer the compiler does not
       recognise compiles to a deny predicate, so the failure mode of a missing
       stamp is an empty result rather than an unfiltered one. */
    /* REC-25 / F-8: the stamp covers EVERY read that could name a bundle, not
       only the compiled-query paths. op=list, op=index, op=projection,
       op=image and op=file bypassed it — an uninvited member read every
       project's id, title and state, and op=image handed over the document
       body itself — and op=backlinks is born stamped. The store fails closed
       on an absent viewer, so removing an op from this list yields an empty
       answer rather than an unfiltered one. (op=affordances takes the same
       stamp in its own handler above; op=search and the edge/state actions
       were stamped from the first commit.) */
    /* REC-30: the sweep of what REC-25 left. REC-25 stamped the reads ADDRESSED
       to a bundle; these are the reads addressed to something else that NAME a
       bundle on the way past — op=dangling (measured: a project citing a
       nonexistent target handed an uninvited member its own id), the task inbox
       and its refers_to filter, the recogniser and progression reads and the
       two write-echoes that read an instance back, and the two paging integrity
       sweeps whose findings name bundles. Every one fails closed in the store on
       an absent stamp, so removing an op from this list withholds an answer and
       never widens one. `op=queue` and `op=affordances` take the same stamp in
       their own handlers above. */
    /* REC-36: `readingname` joins them, and its posture is the STRONGER of the
       two the gate's header describes. The other reading reads keep the row and
       withhold the bundle back-reference; a CANDIDATE list withholds the ROW,
       because a document a member cannot open is not a candidate and offering a
       nameless one still discloses that something mentioning their subject sits
       in a project they were not invited to. Fails closed in the store on an
       absent stamp, like every op in this list. */
    /* CPDF-10: both transcription reads name the bundle a capture is filed in,
       so both take the same stamp for REC-30's reason exactly — the answer
       would otherwise disclose that a document sits in a project the caller was
       never invited to, by telling them what produced its text. `attesttext`
       is NOT here: it is a WRITE and takes its own member route. */
    /* REC-132 / D-422: the ops whose store method reads the POSITIONAL `identity` stamp
       (`#positionalMember`). `affordances` and `queue` build their own inner requests
       above and stamp it there. A new reader of `identity` joins this list. */
    const IDENTITY_READS = ["leadlook", "leadread", "leadshare", "frontier"];
    const REC30_VIEWER_READS = ["dangling", "tasks", "reading", "readingref", "readingname",
                                "textprovenance", "textattest",
                                /* CPDF-13: the drift obligation's rows NAME the bundle each
                                   affected capture is filed in, so it takes the same stamp
                                   for REC-30's reason exactly — otherwise "which of your
                                   documents rest on a superseded measurement" would disclose
                                   that a document sits in a project the caller was never
                                   invited to. `calibrations` is NOT here: it answers about
                                   ENGINES and names no bundle at all. */
                                "calibrationdrift", "resolutions",
                                "concerns", "connections", "instance", "exceptions", "thread",
                                "discharge", "audit", "searchindexcheck", "projectownerarith",
                                /* REC-14's read, swept at the merge: its bar report NAMES the
                                   projects that declared the bar, which is §7.9's reverse-edge
                                   walk arriving by a new door. The VALUE stays whole for every
                                   reader (DEC-17) — only the names are withheld. */
                                "strengthbarof"];
    /* PL-9: op=meaningrows is the SAME compiler read at meaning grain, so it
       takes op=search's stamp beside op=search rather than joining a list of
       reads that merely name a bundle. Its answer is a CANDIDATE LIST in §14c's
       sense and takes REC-36's stronger posture in the store — the whole ROW is
       withheld, never a redacted reference — and, like every op here, it fails
       closed on an absent stamp: the deny predicate answers zero rows AND a zero
       total, so hidden and absent are the same answer. */
    if (op === "search" || op === "meaningrows" || op === "select" || op === "selection" || EDGE_ACTIONS.includes(op)
        || STATE_ACTIONS.includes(op)
        /* REC-24: both action acts read the bundle behind the fail-closed gate
           before they write it, so an action the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. */
        || ACTION_ACTIONS.includes(op)
        /* REC-45: it reads the inquiry behind the fail-closed gate before it
           rewrites it, so a question the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. */
        || STRUCTURE_ACTIONS.includes(op)
        || op === "list" || op === "index" || op === "projection" || op === "image"
        || op === "file" || op === "backlinks" || op === "excludedby" || op === "reevaluations"
        /* REC-34: the gated read of the derived pair. Its subject is a bundle
           and its answer NAMES bundles in fields AND in prose, so it is stamped
           with every other retrieval read; the store fails closed on an absent
           stamp and withholds the answer as an absent bundle's. */
        || op === "inquirystrength"
        /* REC-18: its subject is an inquiry and its answer names the bundles a
           basis rests on, so it is stamped with every other retrieval read. The
           store fails closed on an absent stamp, withholds an invisible inquiry
           as an absent one, and drops an invisible target with no id and no
           count. */
        || op === "earnedbasis"
        /* REC-83 / IC-84 (4): the fixed-key content read. Its subject is a
           content ROW and its answer names the BUNDLE the row's capture is
           filed in, so it takes the same stamp for REC-30's reason exactly. It
           matters more here than on most of this list: the id is
           hash(capture, extent, chain), so a caller who can guess an address
           must not be able to learn from the answer whether the passage exists
           in a project they were never invited to. The store fails closed on an
           absent stamp and answers an invisible row EXACTLY as an absent one. */
        || op === "content"
        /* REC-54: its subject is a bundle and it reads that bundle's register
           before it rewrites it, so a document the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. The store fails closed on
           an absent stamp, like every op in this list. */
        || op === "provenancechain"
        /* REC-63: its subject is a bundle and its answer names it, so it is
           stamped with every other retrieval read — and the store's own refusal
           makes an invisible document answer EXACTLY as an absent one
           (ROUTE_MARK_NO_SUCH_BUNDLE), which is the whole reason the stamp
           matters here: a marker on a document the caller may not see must not
           be establishable by asking to make one. */
        || op === "provenanceroute"
        /* REC-116: the COLLECTION read over the same marks, and it is the shape
           that LEAKS if the stamp is missing rather than the shape that merely
           refuses — a marker names a document the group holds, so a row the
           caller may not see must be ABSENT from the roster byte-identically to
           one that does not exist (op=airuns' rule, REC-30/REC-25's leak). The
           store fails closed on an absent stamp, like every op in this list. */
        || op === "provenanceroutes"
        || QUEUE_ACTIONS.includes(op)
        /* IS-6: a run names an inquiry or a project bundle, so a run over a
           project the caller was never invited to must answer exactly as a
           nonexistent run does — REC-25/REC-30's leak, one object over. The
           store fails closed on an absent stamp, like every op in this list. */
        || op === "airun" || op === "airunlog" || op === "airunspawn"
        /* REC-93: the frontier's subjects are addresses a project went looking
           for, which is the same disclosure a run is — §6 says REC-36's
           withholding applies row-whole across the fence. Stamped here so the
           store fails closed on an absent stamp, like every op in this list. */
        || op === "frontier" || op === "contentaxis"
        /* REC-69: the same gate, keyed the other way round. Its three siblings
           take a RUN ID and answer about the context that run names; this one
           takes the CONTEXT and answers about the runs in it — so it is the
           shape that leaks if the stamp is missing, rather than the shape that
           merely refuses. A run in a project the caller was never invited to is
           ABSENT from the list, byte-identically to one that does not exist, and
           the store fails closed on an absent stamp like every op in this list. */
        || op === "airuns"
        /* PL-10 / D-220: a version chain names a BUNDLE per version, so a
           document captured inside a project the caller was never invited to
           must be absent from the chain exactly as it is absent from op=list.
           The store gates at `register.bundle_id` through the same
           `#bundleGate` every read here compiles and counts `total` through the
           same predicate, so hidden and absent are one answer; and it fails
           closed on an absent stamp, like every op in this list. */
        || op === "versionchain"
        /* PL-1 / IS-1: a version set names its INQUIRY and every bundle its legs
           rest on, so an inquiry the caller was never invited to must answer
           exactly as one with no versions and as one that does not exist. The
           store applies `#bundleGate` to the inquiry ONCE and counts `total`
           behind the same gate, so hidden and absent are one answer; and it
           fails closed on an absent stamp, like every op in this list. */
        || op === "basisversions"
        /* PL-14 / IS-7: a strength names the QUESTION and every document its
           reading rests on, so a question the caller was never invited to must
           answer exactly as one that does not exist. The store applies
           `#bundleGate` to the inquiry ONCE, before any leg is read, and fails
           closed on an absent stamp, like every op in this list. */
        || op === "versionstrength"

        /* PL-12 / D-84: a project-scoped manifest names a PROJECT bundle, and
           the adopted bias bundles are bundles too, so a caller who may not see
           the project must be answered exactly as they are for a project that
           does not exist — REC-25/REC-30's leak arriving at the lens. The store
           gates through the same `#bundleGate` every read here compiles and
           fails closed on an absent stamp, like every op in this list. */
        || op === "biasmanifest"
        /* PL-2 / IS-2: the six acts name an inquiry, and make-current also names
           a project. A question the caller was never invited to must refuse
           exactly as an absent one does, so the store gates both through the same
           predicate and fails closed on an absent stamp, like every op here. */
        || VERSION_ACTIONS.includes(op)
        /* PL-3 / IS-4: the suggest endpoint names an inquiry AND resolves every
           leg against the corpus, so it takes the same fail-closed viewer stamp
           for BOTH — a question the caller was never invited to must refuse
           exactly as an absent one does, and a leg the caller cannot see must
           be unreachable rather than silently accepted. */
        || op === "suggest"
        /* PL-4 / IS-4: the capture-request door names the inquiry the request is
           accountable to, so a question the caller was never invited to must
           refuse exactly as an absent one does — otherwise the door would be a
           way to learn that a question exists by asking to fetch under it. */
        || op === "capturerequest"
        /* PL-4: and the queue READ, for the same reason one line up — a request
           names the question it was asked under, so the queue under an inquiry
           the caller was never invited to must be absent exactly as one that was
           never made. */
        || op === "capturerequests"
        /* D-266 / IC-60: the disposition act's SECOND key shape names a PROJECT — the team
           whose feed the decision governs — so it takes the same fail-closed stamp for the
           same reason every op above does. A project the caller was never invited to must
           refuse EXACTLY as one that does not exist, or the act becomes a way to learn that
           a project exists by trying to record a judgment under it (REC-25/REC-30's leak
           arriving at a WRITE rather than a read). The instance-wide shape names no project
           and is unaffected: it reaches the same store method and never consults the stamp. */
        || op === "proposedispose"
        /* SK-7: marking a passage citable NAMES A DOCUMENT, so it takes the same
           fail-closed stamp every op above does and for the same reason arriving
           at a new door. A content id is `hash(capture, extent, chain)` and the
           act answers whether the row was NEWLY minted, so without the gate a
           caller could learn that a document exists in a project they were never
           invited to by trying to mark a page of it — REC-25/REC-30's leak,
           arriving at a WRITE. The store fails closed on an absent stamp and
           answers an invisible bundle EXACTLY as an absent one. */
        || op === "contentmint"
        /* SK-8: both EXTRACT ops, for `contentmint`'s reason exactly. The WRITE
           mints through that same door, so it carries the same oracle; and the
           READ answers about documents, so an ungated listing would be the
           identical leak one op over. Fails closed on an absent stamp. */
        || op === "extractpropose" || op === "extractproposals"
        /* REC-86: NARROW and its candidate read both NAME A QUESTION and read
           its readings, so a question the caller was never invited to must
           answer exactly as one that does not exist — the version acts' reason
           one screen up. Fails closed on an absent stamp. */
        || op === "narrow" || op === "narrowcandidates"
        /* REC-87: all three TRANSCRIBE ops name a DOCUMENT (the act) or a content
           row filed in one (the attestation and the read), so a document the
           caller was never invited to must answer exactly as one that does not
           exist — `contentmint`'s and `content`'s reason. Fails closed on an
           absent stamp. */
        || op === "transcribe" || op === "transcriptionattest" || op === "transcription"
        /* MK-4: the look and the read name a LEAD, readable by its author only,
           and the look names what it found (a capture or a content row), which is
           gated like every other reference to a document. Fails closed on an
           absent stamp. */
        || op === "leadlook" || op === "leadread" || op === "leadshare"
        || REC30_VIEWER_READS.includes(op)) {
      /* PL-11 / IS-5 / D-199 (4) — THE STATED VIEWER, AND IT IS THE RECORD'S
         ANSWER RATHER THAN THE CLASS'S.
         An `ai` credential does NOT stamp `class:ai`. It stamps the PRINCIPAL
         the minting member wrote down, which is `member:<id>` for a
         member-scoped key and `class:ai` for an organisation-scoped one. That
         makes D-199 (4)'s distinction operational instead of decorative: a
         member-scoped credential compiles under `viewerPredicate`'s
         PARTICIPATION FILTER and sees exactly what that member sees, so an
         agent cannot read a project its principal was never invited to — while
         an organisation key acts for the group and is unfiltered like every
         other instance-level credential. The two are measurably different reads
         and both arms are driven.
         IS-5's "member-scoped default" lives at the MINT, where a principal must
         be stated (C-29.2) and the member-scoped form is the documented one; it
         is not defaulted here, because a viewer this function guessed would be a
         viewer the record cannot account for. */
      inner.searchParams.set("viewer",
        viaSession ? sessViewer
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
      /* REC-132 / D-422: THE POSITIONAL HALF, stamped beside the viewer for the ops whose
         store method READS it. It differs from the viewer for exactly ONE principal — the
         founder's session, whose viewer is the administrator's and whose identity is
         `member:admin` — and the store reads it only where a ruling names a person: the
         lead reads (`#leadReach`: author, or a participant it was shared to) and the
         internet frontier built on them.
         NAMED OPS, NOT EVERY OP IN THIS LIST, and that is measured rather than tidy: the
         first build stamped it on every op here and `op=content` — a FIXED-KEY read that
         refuses any parameter it does not name (D-222) — refused every call, which six
         content suites caught. A param a route does not read is not free. */
      if (IDENTITY_READS.includes(op)) inner.searchParams.set("identity",
        viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    }
    /* D-157: WHETHER THIS CALLER ADMINISTERS, decided by the SERVER from the
       credential that authenticated, and set AFTER the caller's parameters were
       copied above so a caller-supplied `administer` is overwritten rather than
       honoured. It drives ONE thing: whether op=memberlist's rows carry `cover`
       beside `handle`. Section 3 gives members and the public the handle roster
       and gives only administrators the PAIRING, so the rule is a projection in
       the store (Store.memberList) rather than a class ACL here — the op is
       legitimately reachable by a member, and what a member must not receive is
       a FIELD, not the answer.

       Who administers: a SESSION reports its own `administer` right, which is
       true for the root-admin session and for a member whose role is admin —
       the same field op=whoami publishes, so an interface cannot be told one
       thing and served another. A MACHINE credential administers only when it is
       the ADMIN_TOKEN class, the root of trust every membership rule sits
       beneath (4.6). MEMBER_TOKEN does not, which is half of what D-157
       measured. PROBE_TOKEN does not either, and that is deliberate rather than
       incidental: scopeFor confines probe to the scratch namespace — a different
       Durable Object with its own member table — so it never reached the live
       roster, and it now also cannot use scratch to rehearse a read of a pairing
       no non-administrator is entitled to.

       The store fails closed on an absent or unrecognised stamp (handles, no
       cover), so deleting this line loses the pairing rather than leaking it. */
    /* PL-10 / D-220. THE ADDRESS IS NORMALISED BY THE SAME FUNCTION THAT WROTE
       THE ROW, and that is not a convenience — it is the whole reason the chain
       can be trusted. `recordCapturedLocator` stores `address_norm` as
       `normalizeAddress` produced it at capture time; a chain that normalised
       differently, or not at all, would answer "no versions" for a document the
       record plainly holds, and `subresources.mjs` says exactly why that is the
       failure hardest to notice: *a normalisation MISS looks exactly like "not
       captured"*. The store cannot do this itself — the normaliser lives in
       subresources.mjs and store.mjs does not import it — so it happens here,
       at the same seam op=links has used since REC-52. The caller's raw
       `address` was copied in the loop above and is overwritten. */
    if (op === "versionchain")
      inner.searchParams.set("address", normalizeAddress(url.searchParams.get("address") || ""));
    /* PL-12 / D-84 / DEC-46: WHOSE NAME IS ON THE ADOPTION, decided by the
       SERVER from the credential that authenticated and set after the caller's
       parameters were copied, so a caller-supplied `author` is overwritten
       rather than honoured. This is the strictest reading of DEC-54 (c): the
       whole hazard the ruling names is a group appearing to follow an
       organisation's standards "with nobody in the group having authored
       anything", and an author a caller can name is an author nobody authored.
       A machine credential stamps `token:<class>` and the store refuses it BY
       NAME (C-26.9) rather than recording a machine as the adopter — the same
       fence op=publishedcase already draws for the bias acknowledgement. */
    if (op === "biasadopt")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* REC-129 / IC-144 — WHETHER THIS CALLER IS THE INSTANCE'S OPERATOR, for op=stats' two
       instance-wide counts over rows no member may all read (`leads`, `observations`;
       `MEMBER-KNOWLEDGE-DESIGN.md` §5, ruled by BOB #15). Decided by the SERVER from the class
       that authenticated and set AFTER the caller's parameters were copied, so a caller-supplied
       `operator=1` is overwritten rather than honoured. `admin` is the ADMIN_TOKEN class and the
       ROOT-admin session (`cls = kind` above). A member whose ROLE is admin signs in as class
       `member` with an `administer` right (D-157) and is NOT the admin class — the ruling names the
       class, and no administrator member may read another member's lead. Member, probe, ai: not. */
    if (op === "stats") inner.searchParams.set("operator", cls === "admin" ? "1" : "0");
    if (op === "memberlist")
      inner.searchParams.set("administer",
        (viaSession ? !!sessRights.administer : cls === "admin") ? "1" : "0");
    /* REC-21. WHOSE attention this is, stamped by the server and never taken
       from the request — the strictest instance of the impostor rule in this
       file, because the thing being written is not a claim about the record but
       a claim about a PERSON: a caller who could name the member could decide
       what somebody else is told about, and could do it leaving nothing in the
       record for that person to find. The caller's own `member` was copied in the
       loop above, so it is overwritten here rather than honoured. A machine
       credential stamps EMPTY rather than `class:<cls>` — unlike a lease actor,
       there is no named machine identity that makes sense here, because a
       preference belongs to somebody's attention and a token has none — and the
       store refuses NO_MEMBER, so a bypass fails closed instead of writing a row
       nobody owns. The viewer stamp above covers the case-visibility gate, so
       muting cannot be used to probe for a project you were never invited to. */
    if (QUEUE_ACTIONS.includes(op))
      inner.searchParams.set("member", viaSession ? sessMember : "");
    /* CPDF-10 / SK-7 — WHO ATTESTED, STAMPED BY THE SERVER, AND THIS IS A
       CORRECTION OF A FENCE THAT DID NOT HOLD.
       *
       * THE MEASUREMENT, taken through a REAL minted `ai` credential rather
       * than reasoned about: `op=attesttext` read its `member` from the request
       * BODY. C-35.10 refuses a MACHINE IDENTITY, so it fired only when the
       * caller volunteered one — and a caller who wants to attest does not
       * volunteer one. An `ai` credential whose member had named `attesttext`
       * in its declared `writes` posted `member: "ruth"` and THE ATTESTATION
       * LANDED, attributed to ruth, who had said nothing. `member: "member:ruth"`
       * landed too, at an attestor string no member has. The MEMBER_TOKEN
       * machine credential did the same. Only `class:ai` was refused, which is
       * the one spelling every suite drove.
       *
       * `content-extent.test.mjs` recorded the belief that an op-level arm was
       * impossible here — *"driving it through op=attesttext with a machine
       * token answers NOT_AUTHENTICATED before checkAttestation is ever
       * reached"*. That was measured with a token that was not a credential at
       * all. With a real one the op IS reached, and the fence was not there.
       * The assertion is corrected at its site rather than exempted.
       *
       * SO IT IS STAMPED, exactly as the queue's `member` above is, and for the
       * identical reason written there: the thing being written is not a claim
       * about the record but a claim about a PERSON. The caller's own `member`
       * was copied in the loop above and is overwritten here rather than
       * honoured. A machine credential of ANY class stamps `class:<cls>`, which
       * `isMachineIdentity` answers TRUE for, so C-35.10 refuses BY NAME at the
       * store instead of being handed a name it cannot question — the second of
       * CPDF-10's *two fences on purpose*, now actually load-bearing rather than
       * reachable only by a caller who incriminates itself.
       *
       * THE `ai` CLASS STAMPS ITS CLASS AND NEVER ITS PRINCIPAL. A member-scoped
       * credential's principal is `member:<id>`, which is NOT a machine identity
       * by this record's own predicate — stamping it would walk the hole
       * straight back in wearing a server-side stamp. The principal answers what
       * a credential may SEE (D-199 (4)); it is not who acted. */
    if (op === "attesttext")
      inner.searchParams.set("attestor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-87 / IC-128 — WHO TYPED, AND WHO ATTESTED THE TYPING, stamped by the
       server on `attesttext`'s rule one stamp up and for its measured reason: a
       body field is a name a machine can post. Typing a page's text is a
       member's own act in their own name, and so is attesting another member's
       typing. The caller's own `transcriber`/`attestor` was copied in the loop
       above and is overwritten here rather than honoured. A machine credential
       of ANY class stamps `class:<cls>`, which `isMachineIdentity` answers TRUE
       for, so the store refuses it BY NAME — C-52.1 at `transcribe`, C-35.10
       (`checkAttestation`, unchanged) at `transcriptionAttest`. NEVER the
       principal: `member:<id>` is not a machine identity by this record's own
       predicate, and stamping it would let an `ai` credential type in a
       member's name. */
    if (op === "transcribe")
      inner.searchParams.set("transcriber", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* The ATTESTOR of a typing, stamped on `attesttext`'s rule exactly and in its
       shape. Its machine fence is C-35.10 inside `checkAttestation` — the SAME
       function `attesttext` reaches, imported from textchain.mjs, which
       `scripts/identity-claims.mjs` states it cannot follow (it reads the store
       method and one private helper). Driven, not assumed: transcribe.test.mjs
       section 3 refuses the MEMBER_TOKEN machine credential here as
       TEXT_ATTEST_MACHINE, including when its body names a person. */
    if (op === "transcriptionattest")
      inner.searchParams.set("attestor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* MK-1 / D-184 / IC-133 — WHO OBSERVED IT, stamped by the server on the rule
       of every authorship field in this block, and OVERWRITING any `author` the
       caller put in the query string (the loop above copied it). The design's
       words: the author is server-stamped from the session, as every authorship
       in this plane is. A machine credential of any class stamps `class:<cls>`,
       which the store refuses BY NAME (C-53.1). NEVER the principal of an `ai`
       credential: `member:<id>` is not a machine identity by this record's own
       predicate, and stamping it would let an assistant testify in a member's
       name. */
    if (op === "testify")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* MK-4 / IC-136 — WHO WROTE THE LEAD, AND WHO FOLLOWED IT, stamped on
       `transcribe`'s rule one stamp up and for its measured reason (§7: an author
       field supplied by the caller rather than stamped is refused). A machine
       credential of any class stamps `class:<cls>`, and the store refuses it BY
       NAME (C-54.2 at the act, C-54.8 at the look). Never the principal. */
    if (op === "lead")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (op === "leadlook")
      inner.searchParams.set("looker", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (op === "leadshare")
      inner.searchParams.set("sharer", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* SK-7 / framework Part II §14.4 (Bob's 5.7) — WHO MARKED THIS PASSAGE AS
       CITABLE, stamped by the server on the same rule as every authorship field
       in this block. The body's own `mintedBy` is not read at the store at all
       (the DO route takes it from the query string), so there is no second door.
       A MACHINE CREDENTIAL STAMPS `class:<cls>` AND THAT IS THE LABEL'S WHOLE
       SOURCE OF TRUTH: `contentMintState` reads the stamp through
       `isMachineIdentity`, so the sentence a member is shown about a
       machine-minted row is derived from the credential that authenticated and
       from nothing a caller could write. The `ai` class stamps its CLASS and its
       tokenId — `class:ai/<tokenId>` — for `op=airunopen`'s reason (an act
       stays attributable to the named credential a member chose) while keeping
       the `class:` prefix that makes it a machine identity. NEVER the principal:
       `member:<id>` is not a machine identity, and stamping it would label the
       assistant's own row as a member's.

       IDENTITY-CLAIM: RULED DEC-24 — a machine credential MAY perform this act
       and the ruling is framework Part II §14.4's EXTRACT role under DEC-24
       (*the machine may do the looking, the member does the concluding*), folded
       there as Bob's 5.7. So the member-actor words above describe WHO IS SHOWN
       the label, never who may write the field, and there is deliberately no
       fence on this op: what the machine may not do is ATTEST, which is
       C-35.10's and sits at `op=attesttext` one stamp above. The naming half the
       ruling rests on is the `class:<cls>` stamp this line writes — permission
       is granted against a NAMED actor, and a row whose minter were anonymous
       would be a row the label could say nothing about. */
    if (op === "contentmint")
      inner.searchParams.set("mintedBy",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* SK-8 — WHO PROPOSED THIS READING, stamped on the identical rule and in the
       identical shape, because it is the identical question about the identical
       kind of act: a claim about a PERSON (or about a machine) rather than about
       the record. The two lines are kept apart rather than folded into one
       condition so each op's own reasoning stays readable at its own site; what
       must never drift is the VALUE, and it cannot, because both read the same
       three cases off the same `viaSession` / `cls` / `aiCred` state. A machine
       class stamps `class:<cls>`; the `ai` class stamps its tokenId beside it so
       the act stays attributable to the named credential a member chose; and
       NEITHER ever stamps the PRINCIPAL — `member:<id>` is not a machine
       identity by this record's own predicate, and stamping it would label the
       assistant's own proposal as a member's.

       IDENTITY-CLAIM: RULED DEC-24 — a machine credential MAY perform this act,
       and the ruling is the EXTRACT role under DEC-24 (*the machine may do the
       looking, the member does the concluding*), placed at
       `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3 and folded into framework Part II
       §14.4 as Bob's 5.7. So the member-actor words in this block describe WHO IS
       SHOWN the label, never who may write the field, and there is deliberately
       no fence on this op. What the machine may not do is ATTEST — C-35.10's, at
       `op=attesttext` a few stamps above — and PRODUCE WITHOUT A BOUND, refused
       at the store by name when the run declares no `mints` allowance (§7.3 (5)).
       The naming half the ruling rests on is the `class:<cls>` stamp this line
       writes: permission is granted against a NAMED actor, and a proposal whose
       proposer were anonymous would be one the record could say nothing about,
       which is exactly what `NO_PROPOSER` refuses at the store. */
    if (op === "extractpropose")
      inner.searchParams.set("proposedBy",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* Ownership of a selection is the same server-side stamp. A selection is
       readable only by the credential that made it, and "only by the credential"
       is worth nothing if the caller names the credential. */
    if (op === "select" || op === "selection" || op === "selectionlist" ||
        op === "selectionrelease" || EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op))
      inner.searchParams.set("owner", viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* Who cited is part of the record, and citing writes a Session Log entry
       carrying the name. Stamped like every other authorship in this file: a
       browser cannot write history as someone else, and a machine credential
       says plainly that it was a machine rather than borrowing a person's name.
       A caller-supplied `author` is overwritten, not honoured. */
    /* REC-24 adds the two action acts to the author stamp, and the correspondence
       arm is the strictest instance of the impostor rule in this file: on the
       testimony half, the author IS the evidence — "who says this exchange
       happened" is the whole of what the record holds when there are no bytes —
       so a caller naming it would be a caller signing somebody else's name to a
       claim about a real party outside this system. */
    /* REC-45 joins them, and the reasoning is on STRUCTURE_ACTIONS above: the
       name this stamps is the name that goes against "these reasons were enough
       on their own", which is the one authored judgement in the record that
       makes a finding stronger. */
    /* REC-54 joins them. Reconstructing a provenance chain is a named member's
       judgement that the capture record supports the route being written — the
       act D-200 exists to keep honest — so the name against it is stamped by the
       server like every other authorship here, and a caller-supplied `author` is
       overwritten rather than honoured. It is NOT added to STATE_ACTIONS: it
       moves no state and applies to no selection, so it would inherit an `owner`
       stamp and a set-application shape it does not have.
       IDENTITY-CLAIM: OPEN — DEC-52 rules on three verbs and reconstructing a provenance
       chain is not one of them. Routed to CONDUCT, pinned by name, not decided.
       OPEN AND NAMED, REC-65: the sentence above says "a named member's judgement"
       and **NOTHING IN THE PLANE REFUSES A MACHINE FROM MAKING IT** —
       `provenanceChainRebuild` carries no identity fence of any kind. DEC-52 ruled on
       three verbs and this is not one of them, so REC-65 neither fenced it nor extended
       the ruling to cover it; a worker doing either would be deciding doctrine nobody
       asked for. It is ROUTED to CONDUCT and PINNED as a known-open finding in
       `test/identity-claims.test.mjs`, which fails if a fence appears OR if this
       sentence stops making the claim — so the gap cannot close silently in either
       direction. What is NOT open: the stamp itself. A machine arrives named
       `token:<class>`, so whatever is ruled later can be enforced on an honest
       identity rather than a guessed one. */
    /* PL-2 / IS-2 joins them, and this is FENCE LAYER 1 (see VERSION_ACTIONS
       above). The name this stamps is the name that goes against "this is the
       reading this record stands on" and against the reason a member gave for
       turning one down — the two facts D-214 says the whole rejection record
       exists to hold. A caller-supplied `author` is OVERWRITTEN rather than
       honoured, which is what makes the store's MACHINE_CANNOT_MOVE_VERSION
       refusal possible at all: a machine arrives honestly named `token:<class>`
       instead of borrowing a person's. It is NOT added to STATE_ACTIONS: these
       move no bundle state and apply to no selection, so they would inherit an
       `owner` stamp and a set-application shape they do not have. */
    if (EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op) || ACTION_ACTIONS.includes(op)
        || DECLARATION_ACTIONS.includes(op) || STRUCTURE_ACTIONS.includes(op)
        || VERSION_ACTIONS.includes(op)
        /* PL-3 / IS-4: and the suggest endpoint, for the reason one paragraph
           up. `author` here is the name that goes against a STRUCTURAL claim —
           "this part of the argument would carry the answer on its own" — which
           C-25.15 says only a named member may make. A caller-supplied `author`
           is OVERWRITTEN rather than honoured, which is what lets the store
           refuse a machine BY SHAPE through REC-46's one predicate instead of
           trusting what the caller wrote. */
        || op === "suggest"
        || op === "provenancechain"
        /* REC-63: `author` here is the name that goes against a STANDING
           STATEMENT that a document's route cannot be shown, which C-34.1 says
           only a named member may make. Overwritten rather than honoured, for
           the reason one paragraph up: a principal a caller can name is not one. */
        || op === "provenanceroute"
        /* REC-86: the name that goes against "this passage is the one on point"
           and against the new reading's partition. Overwritten rather than
           honoured, so the store refuses a machine BY SHAPE (C-50.5). */
        || op === "narrow")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* Who is acting on a project's roster is decided by the SERVER. Set after
       the caller's parameters were copied, so a caller-supplied `by` is
       overwritten rather than honoured: "only an owner may remove" is worth
       nothing if the caller names who they are. A machine credential says
       plainly that it was a machine, which matches no participation row and no
       administrator, so it is refused by the store rather than let through. */
    if (PROJECT_ACTIONS.includes(op) || op === "projectparticipants" || op === "projectownerarith")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* IS-6 / §14a, DEC-27(b), DEC-55.4: THE PLANE-CREDENTIAL PRINCIPAL on a run,
       decided by the SERVER from the credential that authenticated and set after
       the caller's parameters were copied, so a caller-supplied `principal` is
       overwritten rather than honoured. A principal a caller can name is not a
       principal.

       This is only HALF of what the run must name. The other half — WHICH LEVEL
       of the Claude-account cascade pays (member, then project, then instance)
       — is NOT stamped here and cannot be: it is resolved where the token
       actually resolves, in the fleet member, and the plane learns it by being
       told. So the store REFUSES to open a run that does not carry it, which is
       the fail-closed direction: a run with no payer named is a run nobody can
       be billed for and nobody can audit. Never a token value, on either half. */
    /* PL-11 / D-199 (4): AN `ai` CREDENTIAL NAMES BOTH — THE PRINCIPAL BEHIND
       IT AND THE TOKEN IDENTITY — IN ONE STRING, and the composite is why a
       requested capture stays attributable. PL-4 copies `principal_plane` off
       the run into every `capture_requests` row and the drain composes the
       capture's attribution from it, so an identity dropped here would be an
       identity missing from the provenance of a document. NEVER THE TOKEN'S
       VALUE — the identity is a public name a member chose, which is exactly
       what D-199 (4) distinguishes it from.
       IT IS DELIBERATELY NOT THE VIEWER STRING. The viewer is the bare
       principal, because `viewerPredicate` decides what a caller may SEE and
       that is a question about the person or the group, not about which of
       their credentials asked. Two fields, two questions, and collapsing them
       would silently widen or narrow one of the two. */
    if (op === "airunopen")
      inner.searchParams.set("principal",
        viaSession ? sessIdentity
        : cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* PL-18 / DEC-63 — WHICH MEMBER IS ASKING, for the project-participation
       gate on the three run verbs. Bob ruled 2026-08-09 that an investigation
       can be started by ANY MEMBER OF THE PROJECT: the gate is participation in
       the project the inquiry belongs to, with `contribute` (in NEEDS above)
       kept as the FLOOR beneath it.
       DELETED FIRST AND SET SECOND, the `ownerMemberId` discipline: a
       caller-supplied `actor` would be a caller deciding whose membership is
       checked, which is the whole gate handed to the person it gates.
       A MACHINE CREDENTIAL STAMPS EMPTY rather than `class:<cls>` — the
       QUEUE_ACTIONS precedent one stamp above — because participation is a
       relationship between a PERSON and a project and a token class is not a
       person. The store reads empty as *no participation to check* and does not
       apply the gate, which keeps its population identical to the capability
       floor's: `NEEDS` is enforced only `if (viaSession)` too. A fence wider
       than the floor beneath it would refuse the daemon outright, and DEC-63
       names the lever for the machine half explicitly and it is a different
       one — *"any narrowing happens at the credential layer"*, IS-5's `ai`
       credential scope.

       ***** THE `delete` IS SCOPED TO THE THREE VERBS, AND IT IS SCOPED
       BECAUSE AN UNSCOPED ONE BROKE `op=lease` — MEASURED, NOT REASONED. *****
       `actor` IS NOT THIS ITEM'S PARAMETER NAME: `op=lease` has stamped its own
       `actor` since REC-21's neighbourhood, forty lines above this. PL-18's
       first draft deleted the key UNCONDITIONALLY, on the `ownerMemberId`
       precedent — and `ownerMemberId` is a name only `promote` uses, which is
       what makes that precedent safe and this copy of it wrong. The battery
       caught it: `members.test.mjs`, *"session lease is stamped with the
       member, not the claimed actor"*, one assertion, a lease arriving at the
       store with its actor wiped. **A server-side stamp that clears a key it
       does not own reaches every op that shares the name**, and the blast
       radius of this class is the whole parameter namespace, not the op being
       edited. Both halves now sit inside the guard, so nothing outside these
       three verbs is touched. */
    if (RUN_VERB_ACTIONS.includes(op)) {
      inner.searchParams.delete("actor");
      inner.searchParams.set("actor", viaSession ? sessMember : "");
    }
    let passBody = req.method === "POST" ? await req.text() : undefined;
    /* create_projects (section 5) and the 7.1 owner claim, in one place.
     *
     * There is no op that creates a project: a project is created by promoting a
     * bundle with no base whose object_type is `project`. So the capability
     * gates that SHAPE, here, rather than appearing in NEEDS as an op name that
     * does not exist.
     *
     * `ownerMemberId` is deleted UNCONDITIONALLY before anything else and is
     * then set only for an identified session creating a project. It is the
     * field the store uses to decide who owns a new project, so a caller
     * supplying it would be a caller granting ownership to whomever they liked.
     * Deleting first and stamping second is the same discipline `author`,
     * `viewer`, `owner` and `by` follow in this file. */
    if (op === "promote" && passBody) {
      try {
        const b = JSON.parse(passBody);
        delete b.ownerMemberId;
        /* Who is ACTING, for the 7.11 owner check on deactivation and
           reactivation. Deleted first and stamped only for a session, like every
           other identity field here: a machine credential carries none and so
           cannot deactivate a project, which is deliberate. */
        delete b.actorMemberId;
        /* Authorship on the manifest is the server's stamp, never the caller's,
           for a machine credential as much as a session — the same rule `author`
           already follows for cite/sever and `by` for the roster. A session
           stamps the member; a machine credential stamps `token:<class>`, so an
           unattended writer that completes a capture a member walked away from
           (D-61) is NAMED on the manifest rather than anonymous, and cannot
           borrow a person's name. Deleted first so a caller-supplied `author` is
           overwritten, not honoured. `actorMemberId` stays session-only: a
           machine credential holds no member and so cannot deactivate a
           project. */
        delete b.author;
        if (viaSession) { b.author = sessMember; b.actorMemberId = sessMember; }
        else b.author = `${MACHINE_AUTHOR_PREFIX}${cls}`;
        if (b.base === null && b.meta && b.meta.object_type === "project" && viaSession) {
          /* **THE SECOND SITE OF `NOT_CAPABLE`, AND REC-79 IS SAYING SO RATHER
             THAN HIDING IT.** C-38.5's `where` names the admission region above;
             this condition is the same refusal minted a second time, here,
             because it depends on the PAYLOAD (is this bundle a project?) and
             not on the op, so the op-level `NEEDS` table cannot express it.
             A DEC-49 row holds ONE `where` and one code may not hold two rows,
             so this `where` cannot name both spans — which is exactly the
             MULTI-SITE class REC-79's partition arm measures at 96 codes and
             deliberately does NOT close, because the fix is a set-valued `where`
             or a consolidating helper and neither is a translation.
             WHAT IS CLOSED HERE: the member gets the sentence either way. The
             canned translation is read from the same one row, so the two sites
             cannot drift into two wordings for one condition — and
             `admission-gate.test.mjs` drives BOTH through the op and asserts
             they carry the SAME translation, so this comment is not the only
             thing holding it. */
          if (!sessCaps.has("create_projects"))
            return json({ ok: false, reason: "NOT_CAPABLE", ...admissionRow("NOT_CAPABLE"),
              op, needs: "create_projects",
              held: [...sessCaps].sort(),
              detail: "creating a project needs the create-projects capability. This account may still "
                    + "contribute to projects it has been invited to, if it holds contribute." }, 403);
          b.ownerMemberId = sessMember;
        }
        /* D-78: surfaced_by is the ACTOR CLASS, decided by the SERVER and never
           taken from the caller's assertion. A focus opened by an assistant (a
           machine credential) honestly records `agent`; one opened by a member
           records `human`. Both bundle writers (setup.mjs, civicos-ui) emit a
           literal `human`, and the store byte-trusts bundle.md, so the honest
           place to decide it is HERE, at the trust boundary, beside author,
           owner and by — the same delete-and-restamp discipline, and the reason
           it fixes BOTH writers at once. C-2.8 already permits either value.
           Stamped on the CREATION (the surfacing act itself); a revision carries
           the document's value forward, so the origin fact is not rewritten by
           whoever later edits it. Only a focus/problem carries the field, and
           the store recomputes nothing — the recomputed bundle.md sha below is
           what becomes the bundle_sha, so overwriting a caller's `agent` claim
           on a session write cannot smuggle a false attribution past the gate. */
        if (b.base === null && b.meta
            /* Through the catalog's normalizeType (REC-10), so the canonical
               `inquiry` spelling and both legacy spellings all get the D-78
               restamp — hand-listed spellings here is how the last rename
               made a check silently stop firing. */
            && normalizeType(b.meta.object_type) === "inquiry"
            && Array.isArray(b.files)) {
          const bm = b.files.find((f) => f && f.path === "bundle.md" && typeof f.text === "string");
          if (bm) {
            const want = viaSession ? "human" : "agent";
            const lines = bm.text.split("\n");
            const end = lines.indexOf("---", 1);
            let changed = false;
            for (let i = 1; i < (end === -1 ? lines.length : end); i++) {
              if (lines[i].startsWith("surfaced_by:")) { lines[i] = "surfaced_by: " + want; changed = true; break; }
            }
            if (changed) {
              bm.text = lines.join("\n");
              const bytes = new TextEncoder().encode(bm.text);
              bm.bytes = bytes.length;
              bm.sha256 = createSha256().update(bytes).hex();
            }
          }
        }
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* Who dispositioned a knock is part of the record. A session signs its
       own name; a machine credential says so plainly rather than borrowing
       a person's. */
    /* A member declares their OWN expertise and an administrator confirms as
       THEMSELVES. Both stamped from the session and overwritten if supplied, on
       the same reasoning as author and by: a declaration a caller can address to
       someone else is not a declaration. Without a session there is no member to
       be, so the store refuses on the identity it is handed.

       IDENTITY-CLAIM: ENFORCED-ELSEWHERE NO_SUCH_MEMBER ADMIN_ONLY — the machine is
       refused here, but NOT as a machine, and the difference is the finding.

       CORRECTED BY DEC-52 (REC-65), AND THIS PAIR IS THE ONE WHERE THE RULING AND THE
       BEHAVIOUR COME APART — which is why it gets its own paragraph instead of a
       pointer to FW-6. DEC-52 permits a machine credential to perform the constitutive
       acts, so the last sentence above must NOT be read as a machine fence. It is not
       one, and it never was. What actually refuses is MEASURED rather than inferred
       (REC-65, driven through the control plane under a machine credential with a
       payload a member then completes successfully with the same body):
         - op=expertisedeclare answers **NO_SUCH_MEMBER** — `class:member` is not a
           member id, so there is no row to hang a licence on;
         - op=expertiseconfirm answers **ADMIN_ONLY** — `#isAdminMember("class:admin")`
           is false, so a machine ADMIN credential is not an administrator MEMBER.
       NEITHER IS A MACHINE REFUSAL, and saying so is the point: this is D-229's exact
       shape — a fence believed to be doing work that an ordinary identity guard is
       doing instead. The distinction is load-bearing here, because a later author who
       thought a machine fence stood here might delete the membership guard as
       redundant and open BOTH doors at once.
       WHY THE OUTCOME IS NEVERTHELESS RIGHT AND IS NOT A GAP TO CLOSE: expertise (§1.3)
       is a claim about a PERSON'S standing, and confirmation is one person VOUCHING FOR
       another. DEC-52 licenses a machine to declare things about the RECORD; it says
       nothing about a machine acquiring a licence of its own, and there is nowhere in
       the members table to put one. The act is permitted by doctrine and impossible by
       construction, which is a better outcome than a fence and is left exactly as it
       is. */
    if ((op === "expertisedeclare" || op === "expertiseconfirm") && passBody) {
      try {
        const b = JSON.parse(passBody);
        if (op === "expertisedeclare") b.memberId = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        else b.by = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-6: the SUBJECT REGISTRY writes carry WHO declared the entry or the
       relation, stamped from the session and overwritten if the caller supplied it,
       on the same reasoning as author, by and memberId above: a declared relation is
       a member's constitutive statement, so an entry a caller could attribute to
       someone else is not that member's declaration. A machine credential says what
       it is (class:<cls>) rather than borrowing a person's name.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may declare a relation, and
       the record names it.

       CORRECTED 2026-08-07 BY DEC-52 (enacted as REC-65), AND THE CORRECTION RUNS THE
       OPPOSITE WAY FROM THE ONE THE SENTENCE ABOVE INVITES. Bob ruled: *"allowing the
       machine to rule doesn't go against doctrine. So it can rule."* A MACHINE
       CREDENTIAL MAY DECLARE A RELATION DIRECTLY INTO THE RECORD — the act is
       permitted, not tolerated. The paragraph above read for months as though only a
       member could, and NOTHING HAS EVER ENFORCED THAT: REC-46 measured the gap,
       deliberately changed no site here, and every one stayed green, which WAS the
       measurement. **The comment was the wrong half, not the code. No fence is to be
       added at `declareRelation`, `createEntity` or `addEntityAlias` to make the older
       wording true**, and the absence of one is now a DECISION a later author may rely
       on rather than an oversight to tidy up. This block is the long form; the FW-7,
       FW-8, FW-9 and expertise sites below point back here rather than restating it,
       because five copies of a ruling drift and this project has measured that five
       times.

       WHY A FALSE COMMENT WAS WORTH AN ITEM: a comment describing a constraint that
       does not exist is a FENCE THAT READS AS PRESENT TO EVERY SUBSEQUENT AUTHOR —
       the class D-229, REC-73, D-228 and IC-33 each cost a whole item, in its cheapest
       and most durable form.

       WHAT THE RULING CARRIES WITH IT, and a later author must not drop any of it:
         - THE RECORD NAMES THE MACHINE PRINCIPAL on every such act — `class:<cls>`,
           never a person's name (DEC-55 det 4 / D-199.4). That is what the stamp on
           the next line is FOR, and it is now load-bearing rather than merely honest:
           permission to act is granted against a named actor.
         - A machine-declared statement is therefore VISIBLY MACHINE-ATTRIBUTED
           (D-82's look-derived rule) — a reader can tell a machine's declaration from
           a member's, which is the whole reason the two may sit in one table.
         - GRADES STAY EARNED (framework §8.1). The ruling decides WHO may declare and
           says nothing about what a declaration is worth; a declared relation still
           carries no connection grade at all (D-83).
         - DEC-15 stands: a hunch is a member act.
         - The earlier provisional — sidebar approval as the act of record — is
           SUPERSEDED AS A GATE. The sidebar (INVESTIGATIVE-SESSION.md §14a) remains a
           visibility and bulk-review surface, and reviewing is not the same as
           permitting. */
    if ((op === "entitycreate" || op === "entityalias" || op === "relationdeclare") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-7: WHO resolved a reference or TESTIFIED a grade-D connection is part of the
       record, stamped from the session and overwritten if supplied, on the same
       reasoning as the registry writes above: a resolution a caller could attribute to
       someone else is not that member's act, and a grade-D testimony without a named
       author is not testimony at all (framework 8.1). A machine credential says what it
       is (class:<cls>) rather than borrowing a person's name.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may resolve a reference and
       may testify, and the record names it (class:<cls>).

       CORRECTED BY DEC-52 (REC-65) — SEE THE FW-6 BLOCK ABOVE FOR THE RULING IN FULL.
       A MACHINE CREDENTIAL MAY RESOLVE A REFERENCE, and nothing here refuses one BY
       DESIGN rather than by omission. Two things this site adds to the ruling and they
       are not decoration. (1) DEC-52's own reasoning records that `resolve` is DERIVED
       — `#recogniseTier` is a deterministic cascade over aliases a member ALREADY
       registered, and it never mints the weakest grade — so it asserts nothing the
       member's alias declaration did not already imply. Fencing it would have cost the
       automated-recognition capability and bought no honesty; that is why the derived
       act was the easiest of the three to rule on. (2) `resolvetestify` is the opposite
       case — PURE TESTIMONY, and the sentence above about a grade-D testimony needing a
       named author STANDS UNCHANGED under the ruling, because `class:<cls>` IS a name.
       What §8.1 refuses is anonymity, not machinery: the act is permitted and the
       ANONYMITY is not, which is the distinction the whole stamp exists to draw. */
    if ((op === "resolve" || op === "resolvetestify") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.resolvedBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-8: a PROGRESSION DEFINITION is a member's constitutive claim about how an
       institution ought to behave (framework §8.1 note 3), so who declared it is stamped
       from the session and overwritten if the caller supplied it, exactly as the registry
       writes are. And a DERIVED connection is asserted by the SYSTEM in slice A: asserted_by
       is FORCED to "system" server-side so a caller cannot pass it off as source- or
       member-asserted (a member-asserted connection is a distinct, slice-B fact — an
       equality a caller can hand us is one a caller can invent).

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may define a progression, and
       the record names it (class:<cls>).

       CORRECTED BY DEC-52 (REC-65) — SEE THE FW-6 BLOCK ABOVE FOR THE RULING IN FULL.
       A MACHINE CREDENTIAL MAY DEFINE A PROGRESSION and is refused by nothing here, BY
       DECISION. The §8.1 note-3 sentence above still describes what the claim IS — a
       constitutive claim about how an institution ought to behave — and the ruling
       changes only who may make it, on Bob's reasoning that letting the machine rule
       does not go against doctrine. The record says which: `class:<cls>` on the row, so
       a definition proposed by an agent and one authored by a member are DISTINGUISHABLE
       facts rather than one indistinguishable one.
       THE `assertedBy: "system"` FORCE ON op=connect IS A DIFFERENT RULE AND IS
       UNTOUCHED. It is not an identity fence at all: it stops a caller passing a DERIVED
       connection off as source- or member-asserted, which is a claim about HOW the
       connection was reached, not about who reached it. DEC-52 does not reach it. */
    if (op === "progressiondefine" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    if (op === "connect" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.assertedBy = "system";
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-9: WHICH stage a document fills in a progression instance is the threading member's
       authored judgment, so who threaded it is stamped from the session and overwritten if the
       caller supplied it, on the same reasoning as the registry, recogniser and progression
       writes above. The GRADE of each placement is the record's (a document's resolution to the
       entity), never the caller's, so only the authorship is stamped here. A machine credential
       says what it is (class:<cls>) rather than borrowing a person's name.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may thread a progression, and
       the record names it (class:<cls>).

       CORRECTED BY DEC-52 (REC-65) — SEE THE FW-6 BLOCK ABOVE FOR THE RULING IN FULL. A
       MACHINE CREDENTIAL MAY THREAD A PROGRESSION, and the absence of a fence here is a
       decision rather than an omission. The sentence above about an authored judgment
       stands as a description of the JUDGMENT; what it no longer implies is that only a
       member may make it.
       AND THE SECOND SENTENCE IS WHY THIS ACT WAS THE SAFEST OF THE THREE TO RULE ON,
       which is worth having at the site: the GRADE of each placement is EARNED from the
       document's resolution to the entity and is never taken from the caller, so a
       machine that threads a progression cannot thereby make the record claim anything
       stronger than the evidence already supports (framework §8.1). Grades stay earned
       is not a promise made elsewhere about this act — it is a property of this act. */
    if (op === "thread" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.threadedBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-10: an exception document DISCHARGES a lawful skip, and WHO declared the skip lawful is
       part of the record — the author of a justification, exactly as a progression definition or a
       declared relation carries its author. Stamped from the session and overwritten if the caller
       supplied it; a machine credential says what it is (class:<cls>) rather than borrowing a
       person's name. The GRADE-like earning (the document must resolve to the entity) is the
       record's, checked in the store, never the caller's.
       REC-65 / DEC-52: this site states its rule BY REFERENCE — "exactly as a progression
       definition or a declared relation carries its author" — so the reference now points at
       corrected prose, and that is deliberate rather than incidental. A machine credential may
       discharge a lawful skip, for the same reason and with the same naming (`class:<cls>`).
       A comment that inherits its rule inherits its corrections too, which is the argument for
       writing it by reference in the first place. */
    if (op === "discharge" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* REC-7: WHO deferred or dismissed a proposal is the whole of the disposition — declining is
       not authoring, so the disposition record IS the act, and it must carry the deciding member.
       Stamped from the session and overwritten if the caller supplied it, exactly as the other
       progression writes are: a member's decision to set aside the record's question, addressed to
       nobody but themselves. A machine credential says what it is (class:<cls>) rather than
       borrowing a person's name; the store refuses a blank decider (NO_DECIDER), so a bypass fails
       closed.

       IDENTITY-CLAIM: OPEN — DEC-52 rules on three verbs and setting aside the record's
       own question is not one of them. Routed to CONDUCT, pinned by name, not decided.

       OPEN, NAMED, AND DELIBERATELY NOT CLOSED BY REC-65 — read this before adding a
       fence OR relying on its absence. **DEC-52 DOES NOT REACH THIS ACT.** Bob ruled on
       three verbs — declare a relation, resolve a reference, thread a progression — and
       setting aside the record's own question is none of them. But the sentence above
       describes it as a member's decision and NOTHING REFUSES A MACHINE, which REC-65
       MEASURED rather than inferred: driven through the control plane under a machine
       credential, `op=proposedispose` SUCCEEDS and the row reads
       `decided_by: "class:member"`. So an agent can defer the record's own question to
       nobody but itself, and the record will say so honestly and permit it.
       WHY IT IS LEFT AS IT IS RATHER THAN FENCED OR BLESSED: fencing it would be a
       worker deciding a doctrine question Bob has not been asked, and blessing it would
       be worse — it would extend a ruling by analogy, which is exactly how a ruling
       drifts. It is ROUTED to CONDUCT (REC-65's report) as the question DEC-52's
       reasoning raises without answering, and it is PINNED as a known-open finding in
       `test/identity-claims.test.mjs` so it cannot quietly become normal. **The pin
       fails when either half moves** — when a fence appears, or when this comment stops
       claiming it is a member's decision — which is the mechanical expiry M0-12's ledger
       technique exists for. */
    if (op === "proposedispose" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.decidedBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    if (op === "inboxresolve" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.by = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* D-98. Who forwarded a task and who resolved it are the two facts its
       history exists to hold, so neither is taken from the caller. A machine
       credential says what it is rather than borrowing a person's name.
       CORRECTED 2026-08-04 (REC-28, D-151): this comment used to finish "and the
       store refuses a forward or a resolution that names no member, so a daemon
       cannot close somebody's work" — true of the NO_ACTOR refusal it described
       and NOT the guarantee it sounded like, because an UNASSIGNED task is
       nobody's work and the store closed it happily for `token:probe`. The stamp
       is what MAKES the store's act refusals possible and is unchanged: it is
       precisely because a machine is honestly named `token:<class>` here that
       taskForward/taskResolve can refuse it BY SHAPE (MACHINE_CANNOT_FORWARD /
       MACHINE_CANNOT_RESOLVE). `taskdrain` keeps the stamp and no such refusal:
       routing an event into a task is the daemon's job. */
    if ((op === "taskforward" || op === "taskresolve" || op === "taskdrain") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.actor = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* PL-11 / IS-5 / D-199 (3): WHO WITHDREW AN AGENT CREDENTIAL is the whole
       content of `revoked_by`, so it is stamped from the session and the
       caller's own copy is overwritten rather than honoured — the same rule
       every identity field in this file follows. A machine credential arrives
       honestly named `token:<class>` and the store refuses it BY SHAPE
       (C-29.4), which is only possible because the stamp is the server's. */
    if (op === "aicredentialrevoke")
      inner.searchParams.set("who", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* REC-126 / DEC-31: WHO AUTHORED THE DRAFT, WHO ISSUED THE GRANT, WHO WITHDREW
       IT — the three facts §6A.2's "attributed" row demands, so all three are
       stamped by the server and a caller-supplied `author` is overwritten rather
       than honoured. A machine arrives honestly named `token:<class>` and the store
       refuses it BY NAME (MACHINE_CANNOT_REVIEW). `secretSha` is DELETED for the
       same reason: only the mint below may set it. */
    if (op === "casedraft" || op === "reviewgrant" || op === "reviewrevoke") {
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
      inner.searchParams.delete("secretSha");
    }

    /* PL-11 / IS-5 / D-199 — THE MINT, AND IT IS NOT A PLAIN FORWARD FOR ONE
     * REASON: THE VALUE IS GENERATED HERE AND IS RETURNED EXACTLY ONCE.
     *
     * The Durable Object receives the SHA and never the value, so no method in
     * `store.mjs` can print a credential because none has ever held one — a
     * stronger statement than a rule about not logging it, and asserted over
     * that file's source in test/aicredential.test.mjs. What is stored is an
     * identity a member chose and a hash that verifies a presentation, and
     * D-199 (4) is explicit that the record names the identity and the
     * principal, NEVER the token's value.
     *
     * THE DECLARATION IS JUDGED BEFORE ANYTHING IS WRITTEN, because a scope the
     * gate would refuse is a sentence that must not enter the record at all
     * (C-29.8 / C-29.9). `who` and `secretSha` are SET rather than merged: a
     * caller who could name either could mint themselves a credential in
     * somebody else's name, or bind a secret they chose. */
    if (op === "aicredentialmint") {
      let asked = {};
      try { asked = passBody ? JSON.parse(passBody) : {}; } catch { asked = {}; }
      const declared = aiScopeDeclaration(asked.writes);
      if (declared.error) return json({ ok: false, ...declared.error, op, cls }, 403);
      const raw = new Uint8Array(32);
      crypto.getRandomValues(raw);
      const secret = "aik-" + [...raw].map((x) => x.toString(16).padStart(2, "0")).join("");
      inner.searchParams.set("who", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
      inner.searchParams.set("secretSha", await sha256Hex(secret));
      const minted = await doAnswer(stub.fetch(new Request(inner,
        { method: req.method, body: JSON.stringify({ ...asked, writes: declared.writes }) })));
      if (!minted.answered) return storeSilent("aicredentialmint");
      if (!minted.result || minted.result.ok !== true)
        return json({ ok: false, ...(minted.result || {}), op, store: storeName, tokenClass: cls }, 403);
      return json({ ok: true, result: {
        ...minted.result,
        /* THE ONE TIME THIS VALUE EXISTS ANYWHERE A CALLER CAN READ IT. It is
           not recoverable afterwards from this instance by any route, because
           nothing here kept it — losing it means minting another and revoking
           this one, which leaves both acts on the record where they belong. */
        token: secret,
        tokenIsShownOnce: "This is the only time this instance will show this value. It is not stored "
          + "and cannot be recovered — the record holds the credential's NAME and who created it, "
          + "never the value. If it is lost, withdraw this credential and create another.",
      }, store: storeName, tokenClass: cls }, 200);
    }

    /* REC-126 / DEC-31 / IC-145 — THE GRANT'S READ SECRET, GENERATED HERE AND
     * SHOWN EXACTLY ONCE, on `aicredentialmint`'s pattern one block up and for its
     * reason: the Durable Object receives the SHA-256 and never the value, so no
     * method in `store.mjs` can print it because none has ever held it. The value is
     * a READ credential only (§6A.2): it is not a token, `classify` never admits it,
     * and the only ops that read it are `reviewcopy`, `reviewcomment` and the
     * unsigned half of `casedocument`. 32 random bytes, base64url, behind a version
     * prefix — not an id, and not derivable from one. */
    if (op === "reviewgrant") {
      const raw = new Uint8Array(32);
      crypto.getRandomValues(raw);
      const secret = "rv1_" + btoa(String.fromCharCode(...raw)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      inner.searchParams.set("secretSha", await sha256Hex(secret));
      const issued = await doAnswer(stub.fetch(new Request(inner, { method: req.method, body: passBody })));
      if (!issued.answered) return storeSilent("reviewgrant");
      if (!issued.result || issued.result.ok !== true)
        return json({ ok: false, ...(issued.result || {}), op, store: storeName, tokenClass: cls }, 403);
      return json({ ok: true, result: {
        ...issued.result,
        secret,
        secretIsShownOnce: "This is the only time this instance will show this value. It is stored only as a "
          + "fingerprint and cannot be recovered. Give it to the recipient: it lets them READ this one draft and "
          + "COMMENT on it, and nothing else. If it is lost, withdraw this grant and issue another.",
        read: "op=reviewcopy&secret=<the value above>",
      }, store: storeName, tokenClass: cls }, 200);
    }

    const res = await stub.fetch(new Request(inner, { method: req.method, body: passBody }));
    const body = await res.json();
    return json({ ...body, store: storeName, tokenClass: cls }, res.status);
  },
};

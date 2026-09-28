import { SCHEMA } from "./schema.mjs";
import { livefire } from "./livefire.mjs";
import { setupPage } from "./setup.mjs";
import { SIGN_HTML } from "./signpage.mjs";
import { liveToken } from "./tokens.mjs";
import { GATE_VERSION } from "./gate.mjs";
import { ratifyStatement, caseRatifyStatement, NS_RATIFY } from "./sshsig.mjs";
/* REC-128: who DELIVERED an attested act, read off the SESSION, and its read shape. */
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
import { parseFrontmatter, createSha256, normalizeType,
         EARNED_CAPTURE_CEILING,
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
         /* D-270 / C-61: the argument complaint's row. Named rather than reached
            through the namespace below, because it is used AS A VALUE at the one
            governed site — the code is a STRING LITERAL there so the DEC-49
            guard's arm C can COMPARE it rather than read past a variable. */
         REQUIRED_ARGUMENT_CHECKS, INSTALLATION_CHECKS, DISPATCH_CHECKS,
         /* D-456 / C-78: a `store=` naming no namespace, refused at the front door. */
         NAMESPACE_CHECKS,
         /* CAP-8 / C-48: the Google Drive host stack's DEC-49 rows. Every one is
            a NAMING — a folder, a kind the address does not carry, a shape this
            recogniser does not read, the application shell, an export that could
            not be fetched, and a caller trying to author the hop (D-112). The
            item's rule is that none of these is ever a silent skip. */
         DRIVE_CAPTURE_CHECKS,
         /* D-64 / C-83: the render arm's DEC-49 rows. */
         RENDER_CAPTURE_CHECKS,
         MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX,
         /* REC-123: the ONE machine-identity predicate (REC-46), asked by the two
            ratification fences of the stamp an `ai` credential acts under. */
         isMachineIdentity } from "../checks/bio-checks.mjs";
/* D-262: THE WHOLE CATALOGUE, AS A NAMESPACE AND NOT A LIST. `dec49Attach`
   below resolves a refusal code against every DEC-49 family the catalogue
   exports, and it finds those families BY THE `_CHECKS` SUFFIX — the same rule
   `civicos-ui/check-refusal-codes.mjs` harvests by, so a family minted tomorrow
   is reachable here with no edit. A named-import list would be a hand-kept copy
   of a set that grows every week, which is the staleness this project meets
   most; the named imports above stay named because they are used AS VALUES. */
import * as CHECK_CATALOGUE from "../checks/bio-checks.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "./publication/worker.mjs";
import { publishedGraphEdges } from "./publication/index.mjs";
import { inbandQuartet } from "./inband.mjs";   /* REC-148: DEC-31's in-band quartet, one function */
/* CAP-8: the Google Drive HOST STACK, enacting Bob's ruling of 2026-09-14 — a
   link to a Drive file KEEPS THE LINK and the harvest is the OpenDocument export.
   `drive.mjs` is PURE (no fetch, no store, no registry): it reads an address's
   shape and composes the export address from the file id and the kind, and it
   builds the hop from what the plane itself derived. Nothing about the hop's
   three facts — export address, export format, producer — is readable off a
   request body, and `callerSuppliedHopFacts` makes an attempt to supply one a
   NAMED refusal rather than a silent drop (D-112). */
import { odfEvidentiaryDigest, ODF_FORMATS } from "./odf.mjs";
import { driveHop, callerSuppliedHopFacts,
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
import { ACTS, RUNGS, RUNG_ABSENT, VOCABULARIES, CAPTURE_ACTS, PER_ITEM_ACTS, PER_ITEM_MAX, deriveActs,
         ACQUIRE_GRADE_NOTE } from "./affordances.mjs";
import { captureSubresources, normalizeAddress, normalizeCitation } from "./subresources.mjs";
/* D-64: the render arm's pure half and its renderer seam. */
import { RENDER_DEFAULTS, completenessReading, keepRenderBodies, renderAllowanceMs,
         renderConcurrencyCap, renderBlock,
         renderedAuthority, renderReserveMs, rendererFor } from "./render.mjs";
/* COFF-1 (I7): the FORMAT registry is the ONLY format dispatch in this file.
   pdfstructure.mjs is no longer imported here — it is the registry's pdf
   entry, reached through getFormat("pdf").structure with byte-identical
   output; the acquire-time subresource guard and the profile's format stamp
   consult detectFormat. A new format costs one registerFormat() in
   formats.mjs and NO edit here — the D-70 test, and formats.test.mjs holds
   the evidence. */
import { detectFormat, getFormat, readingDialect } from "./formats.mjs";
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
import { identify, doctypeFor, profileRecord, digests, CONFIDENCE, readText, CONTRACT } from "../../docprofile/registry.mjs";

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
  return fetchGoverned(target, { userAgent: userAgent(env, purpose, delegated), fetch: (...a) => fetch(...a),
                                 governor: stub ? governorOverStub(stub) : null });
}
import { cpuProbe } from "./cpu.mjs";
import { Store } from "./store.mjs";
import { attest, attestStatus, registerAuditReport } from "./provenance/index.mjs";
import { withBiasChecks } from "./bias/index.mjs";
import { governedFetch as fetchGoverned, governorOverStub, governorOp } from "./host-governor/index.mjs";
import { knockOp } from "./capture/doorbell.mjs";
import { userAgent } from "./capture/acquire.mjs";
import { linksOp, captureObjectOp, archiveLookupOp, acquireOp } from "./capture/ops.mjs";
import { monitorOp } from "./monitoring/index.mjs";
import { pdfStructureOp, acquireReadingOp } from "./extraction/ops.mjs";
import { caseRatifyOp, ratifyOp } from "./ratification/ops.mjs";
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
  /* REC-149 (Membership v2 §7.14): DISCOVERABLE or HIDDEN. The setting is an OWNER's recorded act (the store
     refuses every other caller, machines included, by C-70.2); its read serves the setting and its history to a
     caller who can see the project; the directory lists, for a member session, the discoverable projects it is
     not in (a credential with no member is refused, C-70.4). */
  projectvisibilityset: { classes: ["admin", "member", "probe"], mutating: true  },
  projectvisibility:    { classes: ["admin", "member", "probe"], mutating: false },
  projectdirectory:     { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-150 (Membership v2 §7.14, the request to join): ASK and WITHDRAW are a member session's own acts (the store
     refuses a credential with no active member behind it, C-95.1); ANSWER — grant, which writes `invited`, or
     decline — is an OWNER's (C-95.5 for everyone else, administrators and machines included); the read serves a
     project's requests to its owners and administrators, and a member its own. */
  projectrequest:         { classes: ["admin", "member", "probe"], mutating: true  },
  projectrequestwithdraw: { classes: ["admin", "member", "probe"], mutating: true  },
  projectrequestanswer:   { classes: ["admin", "member", "probe"], mutating: true  },
  projectrequests:        { classes: ["admin", "member", "probe"], mutating: false },
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
  /* D-436 / IC-172 — THE INSTANCE'S PRODUCING GROUP (State Rules v1.5 §3.1), the one value every bundle this
     instance writes names as its `group`. The READ is open to every class that reads the record, AND SINCE
     REC-163 (IC-174) TO THE PUBLIC: `BIO_Publication_v0_1.md` §7 point 1 (BOB #24, 2026-09-21) rules THE SLUG
     PUBLIC — it travels in every published bundle's signed `group` and names the worker, so a stranger learns
     nothing the group has not already published or served. `classes: null` is how this table says public (there
     is deliberately no public CLASS — see the header above), so the op answers through its own handler in the
     unauthenticated branch: a stranger is told the slug, or that none is recorded, and NOTHING ELSE — when and by
     which act it was recorded are not published anywhere, and §7 rules only the slug; a caller whose credential
     the admission gate would admit (a machine class in its namespace, a session, an agent credential in scope)
     is answered the whole row exactly as before. It answers what the store records, and when it records nothing
     it says so. The SEED is the other half of decision (b):
     a store that already held documents when the value arrived records nothing at boot, and is given its group
     by this act, once. RECORDING THE INSTANCE'S PRODUCING GROUP IS THE ROOT OF TRUST'S ACT — THE ADMIN_TOKEN
     CREDENTIAL HELD IN THE HOSTING ACCOUNT, THE CREDENTIAL THE INSTALLER'S OWN CLAIM IS ARMED BY — AND NO
     SESSION OF ANY ROLE REACHES IT: it is named in no SESSION_OPS set, and UNATTENDED_BY_DECISION cites this
     row, so a session is told which credential the verb is addressed to rather than an invented reason. */
  instancegroup:       { classes: null,                         mutating: false },
  instancegroupseed:   { classes: ["admin"],                    mutating: true  },
  /* REC-164 / Publication §7 points 2 and 3. `groupidentity` is PUBLIC on point 1's reasoning, and answers a stranger
     the slug, the display name only beside it, and the domain only while its latest verdict is `verified`; a
     credential the admission gate admits is answered the claim, its state and both dated histories too. The two SET
     acts are an administrator's own session act (`IDENTITY_ACTIONS`): admitted to the three bearer classes only so
     the fence can refuse a bearer BY NAME (C-64.4) rather than by a class list, exactly as the §4 governance acts. */
  groupidentity:       { classes: null,                         mutating: false },
  groupnameset:        { classes: ["admin", "member", "probe"], mutating: true  },
  groupdomainset:      { classes: ["admin", "member", "probe"], mutating: true  },
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
  /* REC-136 / INVESTIGATIVE-SESSION.md §7.1 item 7: A PROJECT WITHDRAWS ITS
     CONCLUSION — an act that APPENDS to the relationship's history and never
     overwrites it. Conclude's class list for conclude's reason: a machine
     class REACHES it and is refused by the store (MACHINE_CANNOT_CONCLUDE,
     the same condition) rather than being absent. One `target` and one
     `project`: one project's stance on one question moves at a time. */
  withdrawconclusion: { classes: ["admin", "member", "probe"],   mutating: true  },
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
  /* D-149: stating the laws that govern an action's request. Conclude's class list for conclude's reason: a
     machine class REACHES it and is refused BY THE STORE (MACHINE_CANNOT_SET_LAWS), so the refusal says what
     is wrong. One `target`; the list arrives in the POST body. */
  actionlaws:      { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-214 (BOB #33, 2026-09-24): a member's revision of an action's risk tier — an authored, append-only act with
     a REQUIRED reason. `actionlaws`' class list for its reason: a machine class REACHES it and is refused BY THE
     STORE (MACHINE_CANNOT_SET_RISK_TIER, C-32.19), so the refusal says what is wrong. */
  actionrisktier:  { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-195: the PROPOSAL of that list — D-149's remaining half. `themepropose`'s class cut, for its reason:
     proposing is the MACHINE's half of the ruling, so the `ai` class reaches it through the DEC-55 floor when
     its minted `writes` name it, and the store refuses NOBODY by class here. The fence that matters is one op
     up: a machine is refused at `actionlaws` BY NAME (C-32.18), and this op writes no list at all. */
  actionlawspropose:{ classes: ["admin", "member", "probe"],      mutating: true  },
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
  /* D-419 (T5-11, content R32): THE CROP OF A CITED PDF IMAGE, `content`'s `cropOf`, cut in the store through
     `pdf-pixels`. A READ on op=content's class cut and for its reason: the crop is what a viewer SHOWS for an image
     citation, which a view-only member weighing a case needs as a contributor does. It writes nothing. `viewer` is
     stamped below, and the store answers a row the caller may not see exactly as one that does not exist
     (NO_SUCH_CONTENT). NEEDS null, op=content's shape. */
  contentcrop: { classes: ["admin", "member", "probe"],          mutating: false },
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
  /* REC-122 / IC-232 — A MEMBER CHOOSES THE ON-POINT MENTION of one end of a connection
     (D-161 act 3). `narrow`'s class cut and `narrow`'s reasoning: what the act refuses to a
     machine is decided by the store on the author the control plane stamps below
     (`CONNECTION_CHOICE_NOT_A_MEMBER`, C-74.1), so a machine arriving honestly named
     `token:<class>` is refused BY SHAPE and the probe with it. */
  connectionchoose: { classes: ["admin", "member", "probe"],     mutating: true  },
  /* T5-11 (K145, connections R53–R57): connections' ops for the connections derivation does not make.
     `connectionassert` is a MEMBER's assertion of a connection between two documents (R31, R53), and
     `filemembershipjudge` a member's confirmation or rejection of a stored containment (R57): `connectionchoose`'s
     class cut and reasoning, the store refusing a machine BY SHAPE on the `author` the control plane stamps below.
     `filemembershipstore` stores an agenda capture's item-to-file containments as SYSTEM-asserted connections (R49,
     R55); it asserts nothing of the caller's, so it takes the same cut and any credential that reaches it may run
     it. The two reads (R54, R56) are open to every class that may read. All five take the viewer stamp below. */
  connectionassert:    { classes: ["admin", "member", "probe"],  mutating: true  },
  connectionsasserted: { classes: ["admin", "member", "probe"],  mutating: false },
  filemembershipstore: { classes: ["admin", "member", "probe"],  mutating: true  },
  filemembership:      { classes: ["admin", "member", "probe"],  mutating: false },
  filemembershipjudge: { classes: ["admin", "member", "probe"],  mutating: true  },
  /* REC-146 / IC-167 — CONTRADICTION'S IDENTIFY, THE PAIRING READ. A pure read on
     `narrowcandidates`' class cut exactly: whoever may READ the record may ask which of
     its assertions are worth comparing. It writes nothing, judges nothing and mints
     nothing, so there is no act here to fence to a person — what it DOES need is the
     viewer, which it takes fail-closed in the stamp block below, because the pairing
     runs AS A MEMBER and pairs only what that member may see. */
  contradictionpairs: { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-147 / IC-318 — CONTRADICTION'S IDENTIFY, THE JUDGEMENT'S WRITE. `extractpropose`'s class cut and for its
     reason: a run's production, reached by the `ai` class through AI_RUN_ACTIONS and by a member or admin session,
     and narrowed where the run object is — the STORE refuses a proposal with no live run in sight, one whose run
     is not the caller's (REC-152's gate), and any proposal over a pair the plane does not itself form for the
     viewer (C-93). The proposer is stamped server-side below and the body's is never read. */
  contradictionpropose: { classes: ["admin", "member", "probe"], mutating: true },
  /* D-148: A FEE QUOTE IS EVIDENCE — the read that sets quotes side by side, by
     counterparty or by request. A pure read on `contradictionpairs`' cut: whoever
     may read the record may read what a body quoted. It takes the viewer
     fail-closed in the stamp block below, because it ENUMERATES across actions. */
  actionquotes:     { classes: ["admin", "member", "probe"],     mutating: false },
  dangling:   { classes: ["admin", "member", "probe"],           mutating: false },
  stats:      { classes: ["admin", "member", "probe"],           mutating: false },
  promote:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-176: the census of manifest rows a repeated snap key overwrote before `op=promote` refused one
     (`SNAP_KEY_TAKEN`, C-67.1) — per bundle, promotions (row_version) against manifest rows, counted and listed,
     NEVER rewritten. The method a deployed instance runs to learn whether its own history lost a row. Admin and
     probe, `registeraudit`'s fence: it is an audit of the working corpus, and it lists bundle ids. */
  snapkeycensus: { classes: ["admin", "probe"],                    mutating: false },
  /* D-256: every "changed from" sentence the pre-2026-08-08 `addGo` wrote, each resolved through the version chain
     (`op=versionchain`, PL-10) and classed wrong / right / undetermined with the three totals apart. WRITES NOTHING:
     BOB #31 ruled (2026-09-23 22:22Z) that the bodies stay as written and the correction is the read. Admin and
     probe, `registeraudit`'s fence: it is an audit of the working corpus, and it lists bundle ids. */
  changedfromaudit: { classes: ["admin", "probe"],                 mutating: false },
  /* REC-130's sweep said here that `allocid` with `prefix=CASE` disclosing how
     many case identities this year had minted was acceptable — instance-level
     knowledge a member already holds. SUPERSEDED 2026-09-19 by BOB #16 (Membership
     v2 §7, *"A MINTED ID CARRIES NO COUNT"*): a count is a disclosure of existence,
     and "`op=allocid` exposing the same counts … is the same defect, not a reason
     to accept it". REC-151: the plane mints every GATED prefix (PROJ, CASE, DRAFT,
     RVG, TASK) opaque, and this op REFUSES those prefixes (`Store#allocIdOp`,
     C-59.5). A shared prefix (INFO, INQ, …) still counts: everyone may see those
     objects, so counting them discloses nothing. */
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
  /* D-394 — THE CROSS-VERSION NOTICE (framework §18.1): does a newer capture exist at
     the address of a document a citation rests on, and is a passage at the same extent
     in it. A pure READ on `versionchain`'s class cut, because it IS that chain asked
     from a citation's side; it writes nothing, so there is no act to fence. `viewer`
     is stamped below, fail-closed, like the chain it reads. */
  versionnotice: { classes: ["admin", "member", "probe"],        mutating: false },
  /* T6-13 (reevaluation R8, R9, R14–R16; K199): reevaluation's six ops beyond the three above.
     `reevaluationraise` is R14's BOUNDED SWEEP that raises the pushed notices, called by `scheduler` or `monitoring`:
     the unattended path, so admin and daemon, `capturerequestdrain`'s cut and reason (K199 records the decision, and
     UNATTENDED_BY_DECISION cites it); it reads under the store's own machine viewer and stamps nothing.
     `reevaluationnotices` (R14's notices, for the queue that renders them) and `reevaluationchanges` (R9's pull read)
     are READS on `reevaluations`' cut, viewer-stamped, and no NEEDS entry, `reevaluations`' precedent.
     `versionadopt`, `versionkeep` (R15) and `reevaluationrecord` (R16) are a member's acts on a reference they hold:
     `conclude`'s cut and reason — a machine REACHES them and the store refuses it BY NAME on the author stamped
     below (MACHINE_CANNOT_ADOPT_VERSION, MACHINE_CANNOT_KEEP_VERSION, MACHINE_CANNOT_RECORD_REEVALUATION) — `contribute` in NEEDS, the
     version acts' capability, and a session op in both sets. */
  reevaluationraise:   { classes: ["admin", "daemon"],                    mutating: true  },
  reevaluationnotices: { classes: ["admin", "member", "probe"],          mutating: false },
  reevaluationchanges: { classes: ["admin", "member", "probe"],          mutating: false },
  versionadopt:        { classes: ["admin", "member", "probe"],          mutating: true  },
  versionkeep:         { classes: ["admin", "member", "probe"],          mutating: true  },
  reevaluationrecord:  { classes: ["admin", "member", "probe"],          mutating: true  },
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
  /* REC-161 / §12 clause (c): D-195's independence derivation over a PROPOSED
     partition of a question's reasons — the read the elicitation's read-back
     makes BEFORE the member's answers are written. A pure read through the one
     `#independenceOf`; it shows no strength and writes nothing. Same classes and
     the same fail-closed `viewer` stamp as versionstrength, below, because it
     names a question and every document its reasons rest on. REC-192: `version=`
     reads a STORED version's independence ON ITS OWN, with no strength key (BOB #31,
     2026-09-23 22:22Z), under the same classes and stamp. */
  partitionindependence: { classes: ["admin", "member", "probe"], mutating: false },

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
     reach `publish`. Their capabilities and authority are §6A.2's (BOB #15, built
     by REC-133; the NEEDS rows carry the reasoning): AUTHOR = the project's edit
     permission (`contribute` in NEEDS, owner-or-joined in the store); ISSUE = the
     project OWNER (`publish` in NEEDS, `publishCase`'s owner predicate in the
     store, no administrator bypass); REVOKE = the same, unchanged (§6A.2 as
     corrected: administrators direct nothing). The store refuses a machine by name,
     so a machine class reaching the op is refused at the act rather than here.

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
  /* D-150 / BIO_Publication_v0_1.md §3 rule 11: THE EXCLUSION STATEMENT'S ACKNOWLEDGEMENT.
     UNGATED on `reviewcomment`'s reasoning and through its two doors, because one of the two
     people rule 11 names — a review-copy recipient — holds no credential of this instance, only
     the grant's read secret. A member acknowledges with an ordinary session, of a draft or of an
     unsigned case document; the store asks the POSITION (a joined participant, not the author).
     `mutating: true`: it writes a row. It gates nothing, and nothing gates on it. */
  statementack:   { classes: null,                                   mutating: true  },
  /* REC-198 / BOB #32 (2026-09-23 23:08Z; BIO_Publication §3 rule 15 (a)): the LIST of a project's drafts, fenced exactly
     like reading one draft. GATED, unlike `reviewcopy`: the list has no recipient door — a grant reads ONE
     draft and names it — so only the member door exists here, and a caller holding no credential of this
     instance has no business at it. The fence is the store's `#seesProjectDrafts`, the very predicate the
     single read's member door calls, fed the same server-stamped `viewer`. */
  casedrafts:     { classes: ["admin", "member", "probe"],           mutating: false },
  excludedby:   { classes: ["admin", "member", "probe"],           mutating: false },
  publishedlist:{ classes: ["admin", "member", "probe"],           mutating: false },
  inbox:        { classes: ["admin", "member", "probe"],           mutating: false },
  inboxget:     { classes: ["admin", "member", "probe"],           mutating: false },
  inboxresolve: { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-159 (Membership v2 §4.9: each custodial act is EVERY administrator's): `member` joins
     the four rows below so an ENROLLED administrator's session, whose `kind` is `member`,
     passes this table; the roster then decides (`CUSTODIAL_ACTIONS`). `machineClasses` is
     what keeps that from being a widening for anybody else: a caller that did NOT arrive by
     a session is judged against it instead of `classes`, so the MEMBER_TOKEN bearer and an
     `ai` credential stay refused exactly as they were, and the operator's `admin` and
     `probe` bearers keep the reach BOB #22 ruled they keep. */
  memberadd:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  memberlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  memberset:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  /* The membership model's member half. `memberadd`, `memberset`, `membercaps`,
     `adminendorse` and `adminremove` are ADMINISTRATOR acts: section 4 governance,
     decided by the roster (REC-159 moved the first two, with `signeradd` and
     `signerset`, onto D-136's footing below).
     D-136: the last three gain `member` and a server-stamped `by`
     (`GOVERNANCE_ACTIONS` below), and the grant is `expertiseconfirm`'s six
     rows up rather than a new idea — an ADMINISTRATOR-ONLY act carrying
     `["admin","member","probe"]` because `kind` for every signed-in person but
     the founder is `member`, so a class list without it refuses every real
     administrator's browser with CLASS_FORBIDDEN before the session gate is
     ever reached. MEASURED, not reasoned: the first draft of this item left
     these three lists alone and ruth, an enrolled administrator, was refused
     CLASS_FORBIDDEN at her own endorsement.
     **THE GRANT IS NOT A WIDENING OF WHO MAY GOVERN.** What decides these acts
     is the ROSTER: the `by` stamp names whoever is signed in and the store
     refuses a `by` that is not an active administrator, by name. An ordinary
     member reaching them is told NOT_AN_ADMIN — the thing that is true — which
     is `expertiseconfirm`'s ADMIN_ONLY and `conclude`'s fail-closed posture. The
     `member` CLASS also admits the MEMBER_TOKEN bearer, which
     `is-operator-governance-act` refuses along with every other bearer, keyed on
     how the caller arrived rather than on a class list that would go stale.
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
  membercaps:   { classes: ["admin", "member", "probe"],           mutating: true  },
  adminendorse: { classes: ["admin", "member", "probe"],           mutating: true  },
  adminremove:  { classes: ["admin", "member", "probe"],           mutating: true  },
  adminarith:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* N43 (T4): membership's three rules built in T3 (N18) — an administrator's resignation (R10), the record of who
     holds hosting access (R11) and a member's published cover-and-handle pairing (R19). They were routed in the
     store and absent HERE, so every caller got "unknown op": this file's own standing lesson 5 again. The three
     acts are `ROSTER_SELF_ACTIONS` below: both session sets and a server-stamped `by`, and the ROSTER decides
     (the store refuses a `by` that may not act, by name). `member` in `classes` for `memberadd`'s reason — an
     enrolled administrator's session is a `member` kind — and `machineClasses` keeps the MEMBER_TOKEN bearer and
     an `ai` credential out as REC-159 does. The two reads serve the record as membership answers it. */
  adminresign:      { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  hostingaccessset: { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  hostingaccess:    { classes: ["admin", "member", "probe"],           mutating: false },
  memberpairingset: { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  memberpairings:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* D-9: why a register row is unreferenced. A read that classifies every row
     against what the store actually holds, so the 20 unexplained rows on the
     live instance stop being a plausible story and become a measured one.
     Admin, because the register is intake provenance for the working corpus. */
  registeraudit:{ classes: ["admin", "probe"],                     mutating: false },
  /* REC-175: the digest census — every row already held (the live image and the history) whose stored sha256
     disagrees with its own stored bytes, counted and listed, NEVER rewritten. The method a deployed instance runs
     to learn whether `op=promote`'s old unchecked digest left a false one behind. Admin and probe, as
     `registeraudit` beside it: it is an audit of the working corpus, and it lists paths. */
  digestcensus: { classes: ["admin", "probe"],                     mutating: false },
  /* REC-190: the census of displaced homes — every `files` / `history` row whose sha the register assigns to a
     DIFFERENT bundle that still exists (D-179's residue: the pre-fence promote MOVED a register row), both bundles
     named, NEVER repaired; which bundle held it first is undetermined and the answer says so. Admin and probe, as
     `digestcensus` beside it: an audit of the working corpus that lists bundle ids and paths. */
  homecensus:   { classes: ["admin", "probe"],                     mutating: false },
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
  /* MK-7 — THE ATTRIBUTION ACT (MEMBER-KNOWLEDGE-DESIGN.md §4.2–§4.6): an observation's AUTHOR chooses
     what one case edition publishes of who said it. A person's decision about their own words, in their
     own name — `testify`'s class cut and reason; the store refuses a machine stamp BY NAME (C-92.1). */
  attribute:           { classes: ["admin", "member"],             mutating: true  },
  leadread:            { classes: ["admin", "member", "probe"],    mutating: false },
  /* D-681 (T5-11, observation-log R20): the leads THIS viewer may read, each once — `leadread`'s class cut and fence. */
  leadlist:            { classes: ["admin", "member", "probe"],    mutating: false },
  /* D-162 / IC-241 — THE THEME (BIO_Content_Framework_v0_10.md §8.4, Bob's ruling of 2026-09-21).
     DECLARING a theme and PLACING a document in one are a PERSON's acts in their own name — a lens
     and a judgement against its test — so both take `lead`'s class cut: `mutating: true` keeps a
     machine credential off the session route, and the store refuses a machine stamp BY NAME again
     (C-81.2, C-81.7). PROPOSING is the machine's half of fence 3 and takes `contentmint`'s cut
     instead: admin, member and probe, and the `ai` class through the DEC-55 floor when its minted
     `writes` name it — the proposal is a HUNCH, never membership, whoever proposes it. The READ is
     open to every class that may read; placements are gated per document by the viewer stamp. */
  themedeclare:        { classes: ["admin", "member"],             mutating: true  },
  themeplace:          { classes: ["admin", "member"],             mutating: true  },
  themepropose:        { classes: ["admin", "member", "probe"],    mutating: true  },
  themeread:           { classes: ["admin", "member", "probe"],    mutating: false },
  /* T5-11 (connections R43): WITHDRAWING a membership or REJECTING a hunch is a person's act in their own name, with a
     reason, so it takes `themeplace`'s class cut; the store refuses a machine actor by name (C-81.11). */
  themewithdraw:       { classes: ["admin", "member"],             mutating: true  },
  /* REC-203: the identifier-space judgement (Framework §8.3). A READ: it writes nothing, and a pair's two
     captures are gated by the viewer stamp, `themeread`'s posture. */
  idmatch:             { classes: ["admin", "member", "probe"],    mutating: false },
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
  /* T5-11 (entities R8, K106): the registry CORRECTED without being erased — an alias or a relation withdrawn with a
     reason, kept and shown as withdrawn. A registry write on the three writes' class cut, stamped below with the
     withdrawing member as they are with the declaring one. */
  aliaswithdraw:  { classes: ["admin", "member", "probe"],         mutating: true  },
  relationwithdraw:{ classes: ["admin", "member", "probe"],        mutating: true  },
  entity:       { classes: ["admin", "member", "probe"],           mutating: false },
  entitybyalias:{ classes: ["admin", "member", "probe"],           mutating: false },
  relation:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* CONSTRUCTS Step 4, SLICE B (FW-7): the RECOGNISERS. `resolve` runs the recogniser
     over a captured document's reading references and stores each resolution with its
     §8.1 connection grade (A source's own composite identifier, B the source's bare
     identifier in content, C name correspondence — never D, which the machine never
     mints); `resolvetestify` is the member's grade-D TESTIMONY path (an author and a
     date, the member's stated basis, no captured document). Both mutate and stamp
     resolved_by from the session below.
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
  /* T6-13 (intent R2–R18, K207; INTENT #1 REPORT J4.2): INTENT's seventeen ops — the objective's condition, progress
     and gaps; goals; aspirations; the discovery loop's proposals and triage; working an objective.
     THE TEN ACTS take `conclude`'s cut for `conclude`'s reason: a machine REACHES each and the store refuses it BY
     NAME on the `author` stamped into the body below (MACHINE_CANNOT_SET_OBJECTIVE, MACHINE_CANNOT_DECLARE_GOAL,
     MACHINE_CANNOT_DECLARE_ASPIRATION, MACHINE_CANNOT_TRIAGE, MACHINE_CANNOT_CHOOSE_THE_QUESTION) — except
     `triage`'s `question`, the one act R16 gives a machine, which is why the cut must admit one. Each rides
     `contribute` (a revision of a project document, a record document, an adoption, a question or a run) and is a
     session op in both sets (INTENT_ACTIONS). THE SEVEN READS are open to every class that reads the record, and
     what a caller may see is the store's, on the viewer stamped below (intent R23); each carries a NEEDS entry of
     null, op=queue's precedent (B3). */
  objectivecondition:  { classes: ["admin", "member", "probe"],      mutating: true  },
  objectiveprogress:   { classes: ["admin", "member", "probe"],      mutating: false },
  objectivegaps:       { classes: ["admin", "member", "probe"],      mutating: false },
  goaldeclare:         { classes: ["admin", "member", "probe"],      mutating: true  },
  goallink:            { classes: ["admin", "member", "probe"],      mutating: true  },
  goalclose:           { classes: ["admin", "member", "probe"],      mutating: true  },
  goal:                { classes: ["admin", "member", "probe"],      mutating: false },
  aspirationdeclare:   { classes: ["admin", "member", "probe"],      mutating: true  },
  aspirationdepart:    { classes: ["admin", "member", "probe"],      mutating: true  },
  aspirationdeadend:   { classes: ["admin", "member", "probe"],      mutating: true  },
  aspirationretire:    { classes: ["admin", "member", "probe"],      mutating: true  },
  aspirations:         { classes: ["admin", "member", "probe"],      mutating: false },
  aspirationcontacts:  { classes: ["admin", "member", "probe"],      mutating: false },
  pursuit:             { classes: ["admin", "member", "probe"],      mutating: false },
  intentproposals:     { classes: ["admin", "member", "probe"],      mutating: false },
  triage:              { classes: ["admin", "member", "probe"],      mutating: true  },
  workobjective:       { classes: ["admin", "member", "probe"],      mutating: true  },
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
  /* REC-207 (BOB #32, 2026-09-23 23:42Z): the two doors that settle a bias-debt obligation and read what
     settled it.

     `biasdebtresolve` HAS NO PROBE CLASS, and the reason is the one `queuemute` records two blocks up
     rather than a new one: settling a bias debt is a member's judgement that a lens change does not bear
     on a finding, so a credential with no person behind it has no judgement to record. The store refuses
     a machine BY SHAPE as well (BIAS_DEBT_MACHINE_CANNOT_RESOLVE, `taskResolve`'s precedent), so a bypass
     of this list fails closed rather than writing a row attributed to a token.

     `biasdebt` IS a read and carries the run reads' classes: it names a RUN and answers about the
     obligation on it, so it is gated on the run's context exactly as op=airun and op=airunlog are, and a
     debt on a run the caller cannot open answers byte-identically to a run that never carried one. It is
     classified in test/gate-reads.test.mjs, where every read op must be. */
  biasdebtresolve:    { classes: ["admin", "member"],               mutating: true  },
  biasdebt:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-93 / IC-92 — THE FRONTIER READ (`OBSERVATION-LOG-DESIGN.md` §6 row 1):
     *what have we looked for at this level, and what came of it* — the candidate
     list for FETCH / EXTRACT / DERIVE. A READ, so `mutating: false`.
     THE CLASSES ARE THE RUN LOG'S, and that is deliberate rather than copied: §6
     says *"a subject discloses a project's interest, so REC-36's withholding
     applies row-whole across the fence"*. What a caller may SEE is decided by
     the D-15 viewer stamp in the store, never by the class here — the same line
     `airuns` draws two rows down. */
  frontier:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* D-525 — THE DRIVE SHELL SWEEP: which Drive-linked bundles hold a baseline
     captured from Google's application page rather than the export (a pre-CAP-8
     acquire), so their monitor reads `modified` on every tick. A READ that lists
     and names the remedy; it never re-acquires. Classes and the D-15 stamp are
     op=index's, because it walks the same working corpus and names bundle ids. */
  driveshells:        { classes: ["admin", "member", "probe"],      mutating: false },
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
     the rows below IS the item.

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

     `capturerequests` is a READ, and it DOES NOT ADMIT THE DAEMON CLASS. That
     is deliberate and it is the narrower half of the widening: op=acquire's
     capture-request arm asks the DURABLE OBJECT directly, not through this
     table, so the daemon needs no read here — and a credential that sits
     unattended in a config file has no business enumerating the queue of
     addresses this group is about to fetch. The class therefore reaches exactly
     THREE ops here, one more than DEC-37 scoped it to and that one by decision
     (and `reevaluationraise` below, by K199's).
     T6-13 (K181 (6)): `capturerequestdraining` is RETIRED — capture-requests
     removed its function and its store route (its R16), so its row went with
     them rather than answering admin and probe an `unknown op` from the store. */
  capturerequest:      { classes: ["admin", "member", "probe"],           mutating: true  },
  capturerequestdrain: { classes: ["admin", "probe", "daemon"],           mutating: true  },
  capturerequests:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* T6-13 (capture-requests R42, K181 (6)): RETRYING a request the SOURCE refused, once a member has supplied what it
     asked for. A member's act on the group's queue: admin and member, `contribute` in NEEDS, a session op; the store
     asks the stamped viewer's sight of the request's question and relays the stamped principal as the caller. */
  capturerequestretry: { classes: ["admin", "member"],                    mutating: true  },
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
     hard we lean on a counterparty is an operator decision, not a member one —
     and not an administrator's either (§4.9, RULED by BOB #23). CORRECTED
     2026-09-23 by REC-159: this ended "the same line memberset and signerset
     draw", which that landing made false — both are EVERY administrator's now,
     and governorconfig is the one op the founder's session alone reaches. Neither is a capacity FINDING:
     a refusal still teaches capacity through governorReport on the fetch path.
     This only exposes what the DO already tracks; it discovers nothing new. */
  governorstate:  { classes: ["admin", "member", "probe"],           mutating: false },
  governorconfig: { classes: ["admin", "probe"],                     mutating: true  },
  /* REC-159: `member` and `machineClasses` for the reason written at `memberadd`. */
  signeradd:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  signerlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  signerset:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
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
/* REC-136 adds `withdrawconclusion` for exactly conclude's reason: it needs both
   SESSION_OPS lists, the server-side viewer stamp and the server-side author
   stamp — the author is the member whose name goes on the withdrawal in the
   project's append-only record, which a caller must not be able to supply. It
   moves the (project, inquiry) relationship's state, so the array's name stays
   true. Not selection-backed, so `owner` is inert for it. */
const STATE_ACTIONS = ["dispose", "retire", "release", "conclude", "reopen", "publish", "inquirydivide",
                       "withdrawconclusion"];
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
/* D-149 adds `actionlaws`, for REC-24's reason: it needs both SESSION_OPS lists, the server-side viewer stamp
   and the server-side author stamp — the author is the member named beside the list of laws the request is made
   under — and it moves no state, so STATE_ACTIONS would be the wrong list. */
/* REC-214 adds `actionrisktier` for the same reason: the author is the member named beside the revision and its
   reason, so the stamp must be the server's; it moves no state. */
const ACTION_ACTIONS = ["actionmove", "actioncorrespond", "actionlaws", "actionrisktier"];
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
                         "projectownerrescue",
                         /* REC-149: the owner's §7.14 setting — `by` and `viewer` stamped like every roster act. */
                         "projectvisibilityset",
                         /* REC-150: §7.14's request to join — the requester's two acts and the owner's answer,
                            each needing the SERVER's `by` (who asks, who answers) and `viewer` (at what sight). */
                         "projectrequest", "projectrequestwithdraw", "projectrequestanswer"];
/* D-136 — THE SECTION 4.7 VOTE AND THE SECTION 4.9 CAPABILITY EDIT, AND THEY ARE
   ONE ARRAY BECAUSE THEY ARE ONE LANDING.
   `BIO_Membership_Architecture_v2.md` §4.7 (BOB #17, 2026-09-19, read at the
   code) found these three reachable by NO session while §4.7 assigns the vote to
   a PERSON, and `by` stamped for `PROJECT_ACTIONS` alone — so on the one
   reachable path THE CALLER NAMED THE VOTER, and seven releases of governance
   arithmetic rested on an attribution the caller supplied.
   **EITHER HALF ALONE IS WORSE THAN NEITHER, which is why one array carries
   both.** Session reach without the stamp leaves the vote forgeable by whoever
   can name a voter; the stamp without reach makes the vote castable by NOBODY,
   because a bearer token would stamp as a machine and be refused with no session
   route to replace it. An array is what makes the two halves impossible to ship
   apart: it is spread into BOTH of `SESSION_OPS`' sets below, it is a disjunct
   of the `by` stamp's condition, and it is the operator fence's subject — so a
   later hand adding a fourth governance verb gets all three at once or none.
   Why BOTH sets rather than the admin one is argued at the spread itself, where
   a reader meets it: `SESSION_OPS.admin` means the FOUNDER'S session alone, and
   §4.7 gives these acts to every administrator.
   `membercaps` rides with the two votes rather than beside the roster ops:
   §4.9 makes setting capabilities a custodial act over MEMBERSHIP, §5 says an
   administrator's own field is not editable at all (4.4 defeated by arithmetic
   otherwise), and the store refuses that case by name. It is the same
   bearer-only state and the same fix.
   NOT `memberadd`/`memberset` — CORRECTED 2026-09-21 by REC-156, because only one
   of this sentence's three clauses was true. It read: *"they already hold session
   reach, they take their own `by` at the store, and widening this array to them
   would be a reach change wearing this item's costume."* `memberSet` takes NO `by`
   at all, and `memberadd`'s session reach is the FOUNDER'S alone (`SESSION_OPS.admin`
   — this block's own measurement). Its `by` WAS the caller's: the §4.7 forgery this
   array closed for three ops, alive in a fourth. REC-156 stamps it by its OWN
   disjunct on the `by` stamp, NOT by joining this array — and the reason is the
   clause that stays true: this array also spreads MEMBER-set reach and the operator
   fence, and moving either is a reach change and a refusal nobody ruled. The stamp
   site says what was decided about a bearer, and that it is provisional. */
const GOVERNANCE_ACTIONS = ["adminendorse", "adminremove", "membercaps"];
/* REC-164 / Publication §7 points 2 and 3: the group's display name and its domain claim are set by an
   administrator's session, with `by` stamped by the server "as for the Membership v2 §4 governance acts". A SET OF
   ITS OWN rather than three more names in `GOVERNANCE_ACTIONS`, because that array's fence carries C-32.17, whose
   canned sentence names the §4 votes and the capability edit — it would be FALSE here (D-270's class). Same shape:
   both session sets (an enrolled administrator holds `member:<id>`, so the admin set alone is the founder alone),
   a fence that refuses any caller who did not arrive by a session, and a `by` stamp the store asks the roster. */
const IDENTITY_ACTIONS = ["groupnameset", "groupdomainset"];
/* REC-159 — §4.9's CUSTODIAL ACTS, AND EACH IS EVERY ADMINISTRATOR'S. `BIO_Membership_Architecture_v2.md`
   §4.7's block *"WHAT IS STILL NOT CLOSED"* named this fix and REC-156 measured the defect: the four sat in
   `SESSION_OPS.admin` alone — the FOUNDER'S password session — so an enrolled administrator was refused
   them with a sentence calling the op an administrator's, which she IS. D-136's call, applied again, in
   three halves that ship together or not at all:
     (1) REACH — spread into BOTH `SESSION_OPS` sets, and `member` in each OPS row's `classes`, because an
         enrolled administrator's `kind` is `member` however her roster row reads;
     (2) THE STAMP — a disjunct of the `by` stamp, so the SERVER names who acted, and the store's relays
         read `by` from the query over anything in the body;
     (3) THE ROSTER — each store method refuses a member-named `by` that is not an ACTIVE administrator,
         NOT_AN_ADMIN, before it looks anything up (`Store#custodialBar`).
   Reach without the roster would hand an ordinary member the roster; the roster without the stamp would
   let a caller name somebody who passes it.
   **NOT `GOVERNANCE_ACTIONS`, and that is the one call this array exists to make.** That array also
   carries the operator fence (C-32.17), and BOB #22 RULED that an operator's bearer keeps reaching these
   four, its `by` stamped `class:<cls>` and naming no person. So the bearer route is bounded by each row's
   `machineClasses` instead — `admin` and `probe`, the classes it held before — which keeps the
   MEMBER_TOKEN bearer and an `ai` credential out exactly as they were. */
const CUSTODIAL_ACTIONS = ["memberadd", "memberset", "signeradd", "signerset"];
/* N43 (T4) — membership's R10, R11 and R19, each a named person's own act on the roster: an administrator resigning
   (never the founder, whom the store answers ROOT_OF_TRUST), an administrator recording who holds hosting access,
   and a member (or an administrator) choosing whether a pairing is published. REC-159's three halves: REACH in both
   `SESSION_OPS` sets, THE STAMP (`by` set by the server, read by the store from the query after the body), and THE
   ROSTER (the store refuses NOT_AN_ADMIN or PAIRING_NOT_YOURS). A SET OF ITS OWN rather than more names in
   `GOVERNANCE_ACTIONS` or `CUSTODIAL_ACTIONS`: the first carries the operator fence, whose C-32.17 sentence names
   the §4.7 votes and would be false here (D-270's class), and the second's `by` condition is pinned as one
   expression by the old battery. A bearer stamps `class:<cls>`, which is on no roster, so the store refuses it. */
const ROSTER_SELF_ACTIONS = ["adminresign", "hostingaccessset", "memberpairingset"];
/* REC-155 — `BIO_Membership_Architecture_v2.md` §4.10 (RULED by BOB #19, 2026-09-21): five of the seven ops
   that no session reached and no decision explained JOIN BOTH SESSION SETS. Both sets for D-136's reason at
   the spread below: `SESSION_OPS.admin` is the FOUNDER'S session alone, and none of the five is the founder's.
   THE PROVENANCE PAIR: their OPS rows call the act *"a named member's judgement"*, and a signed-in session is
   the one caller that carries a name — the `author` stamp already names `sessMember` on the session route.
   The bearer WRITE route closes in §4.10's SECOND landing (REC-158), not here: this one refuses nobody. */
const PROVENANCE_JUDGEMENT_ACTIONS = ["provenancechain", "provenanceroute"];
/* THE CALIBRATION WRITES: their OPS row rules that the fence is NOT who may measure but that a measurement
   never moves a GRADE (`CAL_CANNOT_REGRADE`), so a person measures on the same terms as a probe, and the
   bearer route stays — a scheduled re-probe is a machine act by construction. */
const CALIBRATION_WRITE_ACTIONS = ["calibrate", "calibrationsubject", "calibrationsignal"];
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
/* T5-11 (entities R8): the two withdrawals join the set, stamped with the withdrawing member as the three writes are
   with the declaring one. */
const REGISTRY_ACTIONS = ["entitycreate", "entityalias", "relationdeclare", "aliaswithdraw", "relationwithdraw",
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
                        "extractpropose",
                        /* REC-147: the judgement's candidates are an act OF A RUN, for extractpropose's reason; the
                           run is checked at the store (C-93.2, C-93.3), not here. */
                        "contradictionpropose"];
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
/* REC-165 (INVESTIGATIVE-SESSION.md §11 item 5, rule 1, BOB #25): THE RUN'S PRODUCTIONS. A production names
   a run, and the run is what the production is READ AGAINST (its lens, bar, skill version and principal), so the
   store asks that the run is one the CALLER holds — REC-152's `runPrincipalGate`, fed by REC-152's ONE `principal`
   stamp expression, which this list EXTENDS and nothing else of the run verbs' does: not the `actor` stamp (PL-18
   measured its blast radius) and not DEC-63's project gate.
   REC-168 (BOB #28, 2026-09-22, the `op=capturerequest` paragraph of §11 item 5): `capturerequest` JOINS — a request
   that names a run is a production of that run, so it takes the same stamp and the store asks sight, then
   `runPrincipalGate`, then status, and records the CALLER's principal on the row. It is the ONE list extended, not a
   second stamp condition beside it. Rule 1's TARGET does not reach it (a request names an address, not a question). */
/* REC-147 JOINS: a candidate names a run, is read against it, and takes the same principal stamp. */
const RUN_PRODUCTION_ACTIONS = ["suggest", "extractpropose", "capturerequest", "contradictionpropose"];
/* REC-134 / C-56: the acts that change a project and read the POSITIONAL `identity` stamp for
   the store's `#projectAuthority` check (SIGHT IS NOT AUTHORITY, Membership v2 §7). `op=promote`
   carries the same stamp in its body as `actorIdentity`. The stamp site says why. */
/* REC-136 adds `withdrawconclusion`: it writes the project's own conclusion record, so it is conclude's position. */
/* D-722 (T5-11, connections R27) adds `linkproject`: edges it hangs on a PROJECT's source bundle are that project's,
   so it is cite's position. Its handler stamps the identity itself (it returns above the stamp site); listed here so the
   set of positional acts is read in one place. */
const POSITIONAL_ACTS = ["cite", "sever", "reinstate", "versioncurrent", "proposedispose", "biasadopt", "conclude",
                         "withdrawconclusion", "linkproject"];
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
/* REC-207 (BOB #32, 2026-09-23 23:42Z): SETTLING A BIAS-DEBT OBLIGATION, which is a MEMBER's act through
   their session and nothing else. `op=biasdebt` is not here for the reason restated on BIAS_ACTIONS above —
   SESSION_OPS gates MUTATING ops alone — and this array is the third place the resolve's member-only nature
   is enforced rather than a fourth place it is stated: the OPS table admits no probe class, this list is what
   a signed-in session actually reaches, and the store refuses a machine BY SHAPE.
   ITS OWN ARRAY, on BIAS_ACTIONS's and QUEUE_ACTIONS's reasoning: adopting a lens and answering the debt a
   lens change left are two different doctrines, and one control over both is how they come to drift.
   WITHOUT THIS LINE THE DOOR DOES NOT EXIST FOR A PERSON — measured on this item's first suite run, where a
   signed-in member's resolve was answered SESSION_ROUTE_NOT_RECORDED, D-270's honest "no session reaches
   this and no decision says why". It is in BOTH lists because an administrator is a member too. */
const BIAS_DEBT_ACTIONS = ["biasdebtresolve"];
/* T6-13 (intent R2, R8–R11, R16, R18): INTENT's ten acts, as ONE array for the reason every array here is one — they
   share a stamp (`author`, in the body), a capability (`contribute`) and both session sets, and a list written out in
   four places is the drift that made DISPOSITIONS one array. Its own array and not STATE_ACTIONS: they move no bundle
   state through the selection path and would inherit an `owner` stamp and a viewer-gated set shape they do not have. */
const INTENT_ACTIONS = ["objectivecondition", "goaldeclare", "goallink", "goalclose", "aspirationdeclare",
                        "aspirationdepart", "aspirationdeadend", "aspirationretire", "triage", "workobjective"];
/* T6-13 (intent R3–R6, R12–R15): its seven reads, every one stamped with the viewer (intent R23). */
const INTENT_READS = ["objectiveprogress", "objectivegaps", "goal", "aspirations", "aspirationcontacts", "pursuit",
                      "intentproposals"];
/* T6-13 (reevaluation R15, R16): a member's three acts on a reference they hold, stamped `author` in the query, where
   reevaluation reads it after the body. */
const REEVALUATION_ACTIONS = ["versionadopt", "versionkeep", "reevaluationrecord"];
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
                   /* REC-122: choosing a connection's on-point mention — a member's
                      act, reached by a signed-in member. */
                   "connectionchoose",
                   /* T5-11 (K145): connections' three writes, `connectionchoose`'s route. */
                   "connectionassert", "filemembershipstore", "filemembershipjudge",
                   /* D-136: THE §4.7 VOTE BECOMES CASTABLE BY THE PEOPLE §4.7 ASSIGNS IT
                      TO — AND THAT IS WHY THE THREE ARE IN **BOTH** SETS, WHICH IS THE ONE
                      DESIGN CALL THIS ITEM HAD TO MAKE. It is `EXPERTISE_ACTIONS`' posture,
                      written out at that array with its reasoning, and the reasoning is the
                      same here.
                      **THE MEASUREMENT THAT FORCED IT.** `kind` is
                      `sess.role === "admin" ? "admin" : "member"`, so `SESSION_OPS.admin`
                      does NOT mean *an administrator's session*: it means THE FOUNDER'S
                      PASSWORD SESSION AND NOTHING ELSE. An enrolled administrator holds
                      `member:<id>` however their roster row reads —
                      `d270-refusal-truth.test.mjs` records two separate harnesses making
                      exactly that mistake and measuring a split of zero over a plane that
                      had one. So `...GOVERNANCE_ACTIONS` in the ADMIN SET ALONE would have
                      given the §4.7 vote to ONE person, the founder, while the operator
                      fence below took the bearer route away from everybody else — and §4.7
                      needs *the consensus of all existing administrators*. A group of three
                      would have been left unable to add or remove an administrator at all.
                      **That is the row's own failure mode, not an improvement on it:**
                      "stamping without reach makes the 4.7 vote unreachable by anybody",
                      arrived at one administrator instead of zero.
                      **WHAT DECIDES THESE ACTS IS THE ROSTER, AND THE STORE ASKS IT.** Both
                      sets reach the op; the `by` stamp below names whoever is signed in;
                      and `adminEndorse`, `adminRemove` and `memberCaps` each refuse a `by`
                      that is not an ACTIVE ADMINISTRATOR, by name. An ordinary member
                      therefore gets NOT_AN_ADMIN — which says what is actually wrong —
                      rather than "only an administrator's session", which would be true of
                      neither the caller nor the rule, and which every real administrator
                      would have received too. `expertiseconfirm` is in the member set for
                      that sentence exactly, and `conclude`'s fail-closed posture is the
                      same argument: reach the handler, be refused by the thing that knows.
                      IT WIDENS NOTHING A MEMBER COULD NOT ALREADY SEE: `op=memberlist` is
                      admin/member/probe and already publishes the roster with its roles, so
                      no arm of these three discloses anything new before refusing.
                      Before this landing the three were in NEITHER set, so every session
                      got SESSION_ROUTE_NOT_RECORDED: an OMISSION honestly stated (D-270
                      (c)), and this is the item that discharges it. */
                   ...IDENTITY_ACTIONS,
                   ...GOVERNANCE_ACTIONS,
                   /* REC-159: §4.9's custodial acts, in BOTH sets for D-136's reason
                      above — the roster decides them, asked by the store against the
                      stamped `by`, and an ordinary member is told NOT_AN_ADMIN. */
                   ...CUSTODIAL_ACTIONS,
                   /* N43: membership's R10, R11 and R19 acts, in BOTH sets for D-136's reason above. */
                   ...ROSTER_SELF_ACTIONS,
                   /* REC-155: §4.10's five, in BOTH sets for D-136's reason above — none
                      of them is the founder's act, and an enrolled administrator is a
                      `member` kind. */
                   ...PROVENANCE_JUDGEMENT_ACTIONS, ...CALIBRATION_WRITE_ACTIONS,
                   /* REC-146: THE CONTRADICTION PAIRING READ. It reads across QUESTIONS,
                      their accepted readings and the documents those rest on, so the
                      viewer decides what it may pair at all — the session route is the
                      only one that produces a member the gate can filter by. */
                   "contradictionpairs",
                   /* D-148: the fee-quote read, across actions, gated by the viewer. */
                   "actionquotes",
                   /* D-394: THE CROSS-VERSION NOTICE — shown where a member meets a
                      citation, so the session route is the one it must reach. */
                   "versionnotice",
                   /* REC-87: TRANSCRIBE and the attestation of a typing — a person's
                      word in their own name, `attesttext`'s route and reason. */
                   "transcribe", "transcriptionattest",
                   /* MK-1: TESTIFY — a member's own word, `transcribe`'s route. */
                   "testify",
                   /* MK-4: THE LEAD and a look recorded against it — a person's word
                      in their own name, `transcribe`'s route and reason. */
                   "lead", "leadlook", "leadshare",
                   /* MK-7: THE ATTRIBUTION ACT — the author's own choice about their own words, `testify`'s
                      route and reason. */
                   "attribute",
                   /* D-162: THE THEME — declaring, placing and proposing, each a session
                      op for `lead`'s reason (a person's act in their own name); the
                      store refuses a machine declarer or placer by name. */
                   "themedeclare", "themeplace", "themepropose",
                   /* T5-11 (connections R43): withdrawing from a theme, `themeplace`'s route and reason. */
                   "themewithdraw",
                   /* REC-195: the governing-law PROPOSAL, a session op for `themepropose`'s reason — the
                      proposer is stamped from the credential that asked, and the session route is the one
                      that produces a member's own name for a member's proposal. */
                   "actionlawspropose",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease", "governorstate",
                   ...RETRIEVAL_READS, ...READING_READS, ...REGISTRY_ACTIONS, ...RECOGNISER_ACTIONS,
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...ACTION_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS, ...AI_RUN_ACTIONS,
                   ...BIAS_DEBT_ACTIONS,
                   ...BIAS_ACTIONS,
                   ...DECLARATION_ACTIONS, ...STRUCTURE_ACTIONS, ...VERSION_ACTIONS,
                   /* T6-13: intent's ten acts and reevaluation's three, a member's own acts in their own name, and
                      capture-requests' retry (R42), a member's act on the group's queue; in BOTH sets, because an
                      administrator is a member too. */
                   ...INTENT_ACTIONS, ...REEVALUATION_ACTIONS, "capturerequestretry",
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
                   "connectionchoose",
                   "connectionassert", "filemembershipstore", "filemembershipjudge",
                   "contradictionpairs",
                   "actionquotes",
                   "versionnotice",
                   "transcribe", "transcriptionattest",
                   "testify",
                   "lead", "leadlook", "leadshare",
                   /* MK-7: THE ATTRIBUTION ACT — the author's own choice about their own words, `testify`'s
                      route and reason. */
                   "attribute",
                   /* D-162: THE THEME — declaring, placing and proposing, each a session
                      op for `lead`'s reason (a person's act in their own name); the
                      store refuses a machine declarer or placer by name. */
                   "themedeclare", "themeplace", "themepropose",
                   "themewithdraw",
                   /* REC-195: the governing-law PROPOSAL, a session op for `themepropose`'s reason — the
                      proposer is stamped from the credential that asked, and the session route is the one
                      that produces a member's own name for a member's proposal. */
                   "actionlawspropose",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease",
                   ...RETRIEVAL_READS, ...READING_READS, ...REGISTRY_ACTIONS, ...RECOGNISER_ACTIONS,
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...ACTION_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS, ...AI_RUN_ACTIONS,
                   ...BIAS_DEBT_ACTIONS,
                   ...BIAS_ACTIONS,
                   ...DECLARATION_ACTIONS, ...STRUCTURE_ACTIONS, ...VERSION_ACTIONS,
                   ...INTENT_ACTIONS, ...REEVALUATION_ACTIONS, "capturerequestretry",
                   ...IDENTITY_ACTIONS,
                   ...GOVERNANCE_ACTIONS,
                   ...CUSTODIAL_ACTIONS,
                   ...ROSTER_SELF_ACTIONS,
                   ...PROVENANCE_JUDGEMENT_ACTIONS, ...CALIBRATION_WRITE_ACTIONS,
                   "governorstate", "governorconfig",
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
  /* REC-122: choosing a connection's on-point mention rides `contribute`, on `narrow`'s
     reasoning — it is a member's judgment written into the working record, and nothing it
     writes is the group putting its name on anything. */
  connectionchoose: "contribute",
  /* T5-11 (K145): asserting a connection, storing an agenda's containments and judging one each write the working
     record's connections, `connectionchoose`'s capability and reason. */
  connectionassert:    "contribute",
  filemembershipstore: "contribute",
  filemembershipjudge: "contribute",
  /* REC-146: NO CAPABILITY. The pairing read takes none, on `op=content`'s and
     `op=transcription`'s reasoning: asking which of the record's own assertions are
     worth comparing is READING the record. It writes nothing into the working corpus
     and puts nobody's name on anything, so there is no contribution to gate — and a
     capability here would mean a member could be shown a question and refused the
     answer to "what else does this record say about it". */
  contradictionpairs: null,
  /* REC-147: `extractpropose`'s capability and for its reason — a proposal is CONTRIBUTING, never publishing, and
     nothing it writes puts the group's name on anything: a candidate is labelled machine work, state proposed. */
  contradictionpropose: "contribute",
  /* D-148: NO CAPABILITY, on `contradictionpairs`' reasoning: reading what a body
     quoted is READING the record, and it writes nothing. */
  actionquotes: null,
  /* D-394: NO CAPABILITY, on `op=content`'s reasoning — asking whether the document a
     citation rests on has a newer version is READING the record, and it writes nothing. */
  versionnotice: null,
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
  /* MK-7: NO FIFTH CAPABILITY TOKEN. §4.2: the act needs no `publish` capability — it is a decision about
     the member's own words, not about the case — so it rides `contribute`, the token that recorded them. */
  attribute:           "contribute",
  /* D-162: declaring a theme, placing in one and proposing a placement all write the working
     record's lens layer, `lead`'s capability. */
  themedeclare:        "contribute",
  themeplace:          "contribute",
  themepropose:        "contribute",
  /* T5-11 (connections R43): withdrawing from a theme writes the lens layer too, `themeplace`'s capability. */
  themewithdraw:       "contribute",
  leadread:            null,
  /* D-681: the lead list takes no capability, `leadread`'s posture; the store answers each viewer its own reach. */
  leadlist:            null,
  /* D-162: the theme read takes no capability, `leadread`'s posture; its placements are gated by the viewer. */
  themeread:           null,
  /* REC-203: the identifier judgement takes no capability; it reads, and its captures are gated by the viewer. */
  idmatch:             null,
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
  /* REC-136: withdrawing a conclusion rides `contribute` for conclude's reason
     — a group holds no separate right to change its mind — and the named-member
     requirement is the store's, on the author stamp. */
  withdrawconclusion: "contribute",
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
  actionlaws:       "contribute",
  actionrisktier:   "contribute",
  /* REC-195: proposing takes `contribute` beside the act it proposes to, and the capability is the only gate
     it has — who proposed is RECORDED and labelled rather than fenced (D-149: the machine may propose). */
  actionlawspropose: "contribute",
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
  /* T5-11 (entities R8): correcting the registry is the same corpus-shaping surface as building it. */
  aliaswithdraw:    "contribute",
  relationwithdraw: "contribute",
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
  /* REC-126 / DEC-31, as REC-133 builds `BIO_Publication_v0_1.md` §6A.2 (BOB #15).
     No fifth capability token is minted for any of the three.
     - ISSUING and REVOKING a grant ride `publish`, UNCHANGED: handing the group's
       unratified draft to a named outsider is the act that stands beside
       publishing, and a member who may not publish may not do it either; the store
       adds the OWNER, with no administrator bypass for either act (§6A.2 as
       corrected by BOB #15 the same day: administrators direct nothing).
     - AUTHORING a draft rides `contribute`: §6A.2 makes it the project's EDIT
       permission (*"editing needs project permissions and is the editor's act"*),
       and `contribute` is Membership v2 §5's *"create and revise bundles in the
       working corpus"* — the capability half; the store checks the positional half
       (an owner or a joined participant, §7.5). REC-126 had it at `publish`, so an
       owner holding `publish` WITHOUT `contribute` no longer authors a draft: that
       is the ruling applied, since such an owner may edit nothing in the corpus. */
  casedraft:        "contribute",
  reviewgrant:      "publish",
  reviewrevoke:     "publish",
  /* REC-198: NO CAPABILITY, on `reviewcopy`'s terms — the single read takes none, and the list is fenced exactly
     like it (BOB #32). Listing which drafts one's own project holds is reading; it writes nothing. */
  casedrafts:       null,
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
  /* REC-149: §7.14's setting is an owner's act over participation-level policy, governed by §7 and not §5. */
  projectvisibilityset: null,
  /* REC-150: §7.14's request to join is participation, governed by §7 and not §5 — the same reason as the roster
     acts: asking to be added needs no working capability, and answering is an owner's position. */
  projectrequest: null,
  projectrequestwithdraw: null,
  projectrequestanswer: null,
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
  /* REC-159: still NO working capability now that an enrolled administrator's
     session reaches these (and `signeradd`/`signerset` below): what bounds them is
     the ROSTER, asked by the store against the stamped `by` — D-136's reasoning
     for the three that follow, applied again. */
  memberadd:        null,
  memberset:        null,
  /* D-136: NO WORKING CAPABILITY, and the reason is §5's own rather than
     `memberadd`'s by proximity. The §4.7 vote and the §4.9 capability edit are
     custodial powers over MEMBERSHIP: what bounds them is `SESSION_OPS.admin`
     above — who a session IS — and section 4's process, not one of section 5's
     four working rights. Hanging `administer` here would be the wrong mechanism
     twice over: `administer` is not a working capability, it moves only by the
     section 4 process, and §5 says an administrator holds every working
     capability and their own field is not consulted at all — so a capability
     test here would be a test of a field the design says nobody reads.
     PRESENT rather than absent because both totality guards must SEE them: the
     capability suite fails on a session-reachable mutating op that is missing
     from this table, and `affordances.mjs` requires every NEEDS key to be an ACT
     or a NAMED non-act — all three are named there with their reasons. */
  membercaps:       null,
  adminendorse:     null,
  adminremove:      null,
  /* REC-164: NO WORKING CAPABILITY, on D-136's reasoning above: what bounds the two is who a session IS, and the
     store asks the roster for an ACTIVE ADMINISTRATOR (C-64.5), not one of section 5's four working rights. */
  groupnameset:     null,
  groupdomainset:   null,
  signeradd:        null,
  signerset:        null,
  /* N43: NO WORKING CAPABILITY, on D-136's reasoning above — what bounds each is who the session IS, asked of the
     roster by the store against the stamped `by` (membership R10, R11, R19). */
  adminresign:      null,
  hostingaccessset: null,
  memberpairingset: null,
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
     SESSION_OPS.admin, not a section-5 working capability. CORRECTED 2026-09-23
     by REC-159: this read "the same as the roster ops above", and REC-159 moved
     those into both session sets; governorconfig is the operator's (§4.9, BOB #23).
     governorstate is a read and needs no entry at all. */
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
  /* D-419 (T5-11): NO CAPABILITY, on op=content's reasoning exactly — showing the picture a citation names is reading
     the record. Present rather than absent so REC-19's totality guard SEES it. */
  contentcrop:      null,
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
  /* REC-207: NO CAPABILITY on either, and `op=taskresolve`'s entry above is the precedent rather than a
     new argument. Settling an obligation the record raised is answering something addressed to you; it is
     not the corpus-shaping surface `contribute` separates out, and a view-only member who is shown a
     bias-debt obligation and cannot answer it has been handed an item they can receive and never
     discharge. What DOES bound the act is its class list (no probe), the store's own machine refusal by
     shape, and the run's read gate — an identity question, like the task fence, not a capability one. */
  biasdebtresolve:  null,
  biasdebt:         null,
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
  /* T6-13 (capture-requests R42): retrying a refused request sends the group's traffic to the source again, the
     request's own capability and reason. */
  capturerequestretry: "contribute",
  /* T6-13 (intent R2, R8–R11, R16, R18): each of intent's acts writes the working record — a project document's
     condition or adoption, a goal or aspiration document, a question, a triage row, a run — so each rides
     `contribute` and mints NO fifth capability token (CAPABILITIES.md §4). What bounds a GROUP aspiration to an
     administrator (R9) and an adoption to a joined member is the store's, asked of the stamped author: who a session
     IS, not a capability. */
  objectivecondition: "contribute",
  goaldeclare:        "contribute",
  goallink:           "contribute",
  goalclose:          "contribute",
  aspirationdeclare:  "contribute",
  aspirationdepart:   "contribute",
  aspirationdeadend:  "contribute",
  aspirationretire:   "contribute",
  triage:             "contribute",
  workobjective:      "contribute",
  /* T6-13 (intent R3–R6, R12–R15; B3, AFFORDANCES #1 J4.3): intent's seven READS take NO capability, op=queue's
     precedent and not op=reevaluations': each is a SURFACE a member acts from (progress and gaps, the goals and
     aspirations in force, the proposals a triage is chosen out of), so it is present here, null, where REC-19's totality
     guard SEES it and `affordances.mjs` names it in NON_ACTS with its reason. What bounds each is the viewer stamp. */
  objectiveprogress:  null,
  objectivegaps:      null,
  goal:               null,
  aspirations:        null,
  aspirationcontacts: null,
  pursuit:            null,
  intentproposals:    null,
  /* T6-13 (reevaluation R15, R16): adopting a newer version appends a basis version, keeping the earlier one and
     recording a re-evaluation write the working record — the version acts' capability and their reason. */
  versionadopt:       "contribute",
  versionkeep:        "contribute",
  reevaluationrecord: "contribute",
  /* PL-12 / D-84. Adopting a bias set is `contribute` and deliberately NOT
     `publish`: it is the group declaring the lens it works under, which is
     ordinary record work that every contributing member's own project managers
     do — and DEC-20 settles that declaring a bias never gates anything, so
     nothing downstream of this is a publication act. A view-only member does not
     put a lens over other people's work; the capability is what says so.
     `biasinhale` carries NONE, like every other read in this file, and it is a
     read precisely because it writes nothing. */
  biasadopt:        "contribute",
  /* REC-155 / §4.10: NO FIFTH CAPABILITY TOKEN. Repairing a provenance chain and recording a route marker are
     corrections to the working record in a member's name, and recording a calibration, an engine to probe or a
     vendor's announcement puts a row in the record — each rides `contribute`, as `attesttext` does, and a
     VIEW-ONLY member does neither. PROVISIONAL, and stated: `provenancechain`'s REPORT arm writes nothing, but
     this table gates an op rather than an arm (only `capture`'s GET is exempted, at the check), so a view-only
     member does not reach the report through a session either. §4.10 ruled reach and is silent on capability. */
  provenancechain:    "contribute",
  provenanceroute:    "contribute",
  calibrate:          "contribute",
  calibrationsubject: "contribute",
  calibrationsignal:  "contribute",
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
/* D-456 (IC-237): THERE IS NO FALL-THROUGH TO `bio` ANY MORE. This function answered `bio` for EVERY `store=` value
   it did not recognise, so `op=stats&store=biosmoke-pdf` answered `store:"bio"` and a brief or a typo naming a
   namespace that does not exist wrote the REAL record while the caller believed it was somewhere else. The named
   refusal is `namespaceGate`'s, at the front door, before any class is resolved, so every caller meets it first; this
   function no longer defaults an unrecognised value to anything, and if one ever reaches it (a caller that skipped
   the gate) it REFUSES, which the admission site answers as SCOPE_REFUSED. ABSENT `store=` IS UNCHANGED: probe reads
   `scratch`, every other class `bio`. */
function scopeFor(cls, url) {
  const named = url.searchParams.has("store");
  const asked = url.searchParams.get("store");
  if (named && !NAMESPACES.includes(asked))
    return { error: `no namespace ${JSON.stringify(asked)} exists on this instance; the namespaces are ${NAMESPACES.join(" and ")}` };
  if (cls === "probe") return named && asked !== SCRATCH ? { error: `probe class is confined to the ${SCRATCH} namespace, refused request for ${JSON.stringify(asked)}` } : { name: SCRATCH };
  return { name: asked === SCRATCH ? SCRATCH : "bio" };
}

/* D-456 (C-78.1, IC-237) — A NAMESPACE THAT DOES NOT EXIST IS REFUSED BY NAME, FOR EVERY CALLER, AT THE FRONT DOOR.
 *
 * WHAT WAS WRONG, MEASURED. `scopeFor` confined only the probe class and answered `bio` for any other `store=` value;
 * the unauthenticated path (the invitation ops, op=instancegroup) did the same with `=== SCRATCH ? SCRATCH : "bio"`.
 * So `store=biosmoke-pdf`, `store=Scratch` and an empty `store=` all ADDRESSED THE REAL RECORD — and a live
 * verification whose whole no-write guarantee is naming its namespace (CLAUDE.md §5, D-325) wrote production while
 * believing it was elsewhere. Found by CPDF-3's worker, whose brief named a namespace that has never existed.
 *
 * WHY HERE AND NOT ONLY IN `scopeFor`: this runs once, before a credential is classified, so the admin, member, probe,
 * daemon and `ai` classes, a signed-in session and the no-credential path meet ONE refusal from ONE governed span
 * (a DEC-49 row holds one `where`). The set is exact and case-sensitive: `Scratch` is not `scratch`, because a Durable
 * Object name is an exact string and folding it here would be this function guessing what the caller meant.
 * `store=` ABSENT is not a refusal — every class keeps its default. Nothing was read or written when this answers. */
const NAMESPACES = Object.freeze(["bio", SCRATCH]);
function namespaceGate(url) {
  if (!url.searchParams.has("store")) return null;
  const asked = url.searchParams.get("store");
  if (NAMESPACES.includes(asked)) return null;
  /* DEC-49 REGION is-namespace-gate */
  return json({ ok: false, reason: "NAMESPACE_UNKNOWN", ...namespaceRow("NAMESPACE_UNKNOWN"),
                error: `no namespace ${JSON.stringify(asked.slice(0, 80))} exists on this instance`,
                asked: asked.slice(0, 80), namespaces: [...NAMESPACES] }, 400);
  /* END DEC-49 REGION is-namespace-gate */
}

/* D-461 (C-78.2, IC-250) — A PUBLIC OP THAT ALWAYS ANSWERS FROM `bio` REFUSES `store=scratch` BY NAME.
 *
 * WHAT WAS WRONG, MEASURED. The unauthenticated block opens ONE stub on `bio` and twelve of its fifteen ops answer
 * through it whatever `store=` says — three of them MUTATING (`knock`, `claim`, `reviewcomment`). So
 * `op=knock&store=scratch` passed D-456's gate (`scratch` is a namespace), filed a knock in the REAL record's inbox,
 * and answered `ok` without saying which store it wrote. A live verification whose no-write guarantee is naming
 * `store=scratch` on every call (CLAUDE.md §5, D-325) wrote production while believing it was in scratch.
 *
 * WHY REFUSE AND NOT REDIRECT. Claiming and logging in are pinned on purpose (an instance has ONE identity), and the
 * published reads are the record's public face; answering them from scratch would change what they MEAN. Refusal is
 * also D-456's rule for a namespace the op cannot serve: the caller is told, never silently answered elsewhere.
 *
 * THE SET IS INVERTED ON PURPOSE. It lists the public ops that DO address scratch — the invitation ops and
 * op=instancegroup, each of which reads `store=` itself — and every other `classes: null` op is pinned. A public op
 * added later is refused `store=scratch` until somebody makes it answer from scratch and lists it here, which is the
 * safe direction: the unlisted default is the refusal, never the real record. Gated ops take their namespace from
 * `scopeFor` and are not this function's. `store=bio` and an absent `store=` are unchanged. Nothing is read or
 * written when this answers.
 *
 * + `groupidentity` (CONDUCT #19, c19-batch11, 2026-09-24): REC-164's op reads `store=` itself, op=instancegroup's way
 * (a credential's store from `scopeFor`, else `store=scratch` honoured), and d456-namespace-scope drives it answering
 * from scratch; it met this list only at the union, where the pin refused it (400) and that suite went red. */
const SCRATCH_ADDRESSING_PUBLIC_OPS = Object.freeze(["invitelook", "enroll", "instancegroup", "groupidentity"]);
function pinnedNamespaceGate(url, op, spec) {
  if (spec.classes !== null || SCRATCH_ADDRESSING_PUBLIC_OPS.includes(op)) return null;
  if (url.searchParams.get("store") !== SCRATCH) return null;
  /* DEC-49 REGION is-pinned-namespace-gate */
  return json({ ok: false, reason: "NAMESPACE_PINNED", ...namespaceRow("NAMESPACE_PINNED"),
                error: `op=${op} always answers from the bio namespace and has no ${SCRATCH} counterpart; nothing was read or written`,
                op, asked: SCRATCH, pinned: "bio" }, 400);
  /* END DEC-49 REGION is-pinned-namespace-gate */
}

/* D-463 (C-78.3) — A CREDENTIAL MINTED CONFINED TO `scratch` ADDRESSES `scratch` ON EVERY CALL IT MAKES.
 *
 * WHAT WAS WRONG, AND IT WAS NAMED IN THE RULES BEFORE IT WAS BUILT. `CLAUDE.md` §5's live-verify rule ends
 * *"RESIDUE: no credential binds to scratch for life"*, and `BIO_Distribution_v0_1.md` §6 rung 6 carried the same
 * sentence as a stated LIMITATION (D-325; BOB #17 ruled the per-call posture SUFFICIENT 2026-09-19, BOB #22 stated the
 * residue 2026-09-21) — so the whole no-write guarantee of a live verification was the DISCIPLINE of naming
 * `store=scratch` on every call, plus the witness afterwards. BOB #22 named the one condition on which a sticky
 * confinement would be raised: *"raised only if a live verification is measured writing the real record despite the
 * naming and the witness."* IT WAS MEASURED TWICE. D-456: `store=biosmoke-pdf` — a brief naming a namespace that has
 * never existed — answered from `bio`. D-461: `op=knock&store=scratch` filed a knock in the REAL record's inbox and
 * answered `ok`. Both were found by workers whose every call was disciplined; the discipline was not the thing that
 * failed. A property that has to be re-asserted on every call is one an instrument omits once, and this is the
 * credential property that makes a forgotten parameter unable to reach the record at all.
 *
 * WHY ONE GATE AT THE FRONT DOOR AND NOT A SECOND ANSWER IN `scopeFor`. `scopeFor` decides a namespace from a CLASS
 * (the probe class's confinement lives there, by class and not by credential); this decides it from the ROW a member
 * authored. Putting it in both places would be two answers to "which store does this call land in" ageing separately,
 * which is REC-46's measured defect and PL-4's duplicated-predicate one at once. So the rule lives here, ONCE, ahead of
 * everything: ahead of the unauthenticated block, ahead of `classify`, ahead of `scopeFor`'s call site — and the
 * SUITE PINS THAT ORDER STRUCTURALLY (`d463-confined-credential.test.mjs` §5), because a gate that can be reached
 * around is a mechanism believed on the strength of its existence.
 *
 * THE TWO ARMS ARE DIFFERENT ACTS AND BOTH ARE THE CONFINEMENT.
 *   - A `store=` NAMED as anything but `scratch` is REFUSED BY NAME, 403 `NAMESPACE_CONFINED`. D-456's rule: a caller
 *     who believes it addressed the record must be TOLD it did not, never quietly answered somewhere else. `bio` is
 *     refused like any other, and the sentence says the credential can go nowhere else.
 *   - A `store=` ABSENT is SET to `scratch` here, and that is a default rather than a redirection: every class already
 *     has one (probe's is `scratch`, everybody else's `bio`), and this credential's is the row's. Setting it on the URL
 *     rather than computing it later is what makes the confinement TOTAL for a caller that names nothing: the twenty-four
 *     sites that address a namespace read it from `scopeFor`'s answer, the invitation ops and `op=instancegroup` /
 *     `op=groupidentity` read `store=` themselves, and every one of them now reads `scratch`. THE ANSWER SAYS SO: the
 *     envelope's `store` is the namespace that answered, so nothing is silent about where the call went.
 *     A DELIBERATE CONSEQUENCE, STATED SO IT IS NOT READ AS AN OVERSIGHT: a confined credential calling one of the
 *     PUBLIC ops D-461 pins to `bio` now meets `NAMESPACE_PINNED` — `op=knock` included, the write that item measured.
 *     That is the right outcome and the reason the two gates are ordered this way: the confined caller cannot file a
 *     knock in the real record's inbox, and it is told which of the two fences stopped it.
 *
 * WHAT THIS DOES NOT CONFINE, MEASURED RATHER THAN ASSUMED. The credential's OWN ROW is read from `bio` (the
 * `ai_credentials` table lives in one store, and `aicredentiallook` has always been asked there): resolving who a
 * caller is is not addressing the record's content, and a confinement that could not look itself up would be one
 * nothing could enforce. Sessions are likewise resolved from `bio`, and a session is not a minted credential. The four
 * BINDING classes cannot be confined at all — they are values an operator sets in the hosting dashboard, with no row to
 * carry the property — so for ADMIN, MEMBER, DAEMON and PROBE the per-call rule and `scopeFor` are unchanged, and the
 * live-verify obligation in `CLAUDE.md` §5 still binds every caller holding one. */
function confinedNamespaceGate(url, cred) {
  if (!cred || cred.confinedTo !== SCRATCH) return null;
  if (url.searchParams.has("store") && url.searchParams.get("store") !== SCRATCH) {
    /* DEC-49 REGION is-confined-namespace-gate */
    return json({ ok: false, reason: "NAMESPACE_CONFINED", ...namespaceRow("NAMESPACE_CONFINED"),
                  error: `credential '${String(cred.tokenId).slice(0, 60)}' is confined to the ${SCRATCH} `
                       + `namespace for its whole life and cannot address `
                       + `${JSON.stringify(String(url.searchParams.get("store")).slice(0, 80))}; nothing was read or written`,
                  tokenId: cred.tokenId, asked: String(url.searchParams.get("store")).slice(0, 80),
                  confinedTo: SCRATCH }, 403);
    /* END DEC-49 REGION is-confined-namespace-gate */
  }
  url.searchParams.set("store", SCRATCH);
  return null;
}

/* D-463 (C-29.10) — WHAT MAY BE WRITTEN AS A CONFINEMENT, judged once when a member AUTHORS it.
 *
 * `aiScopeDeclaration`'s shape and its reason (PL-4: one predicate at two points leaves one of the two codes
 * unreachable, so the DECLARATION and the per-call GATE are different questions with different codes and both are
 * driven). Its own named function and its own region, because a DEC-49 `where` resolves a span BY FUNCTION NAME.
 *
 * `scratch` IS THE ONLY CONFINEMENT THERE IS, AND `bio` IS REFUSED WITH THE UNKNOWN NAMES. That is a decision: `bio` is
 * where every unconfined credential already lands, so a row reading "confined to bio" would look like a fence in the
 * record and hold nothing — the sentence-that-enforces-nothing D-199 (2) moved the scope out of a settings row to
 * avoid. Absent, null and empty are UNCONFINED and are not refusals: a member who says nothing is minting the
 * credential this instance has always minted. */
/* D-463 — THE PRESENTED `ai` CREDENTIAL, RESOLVED ONCE PER REQUEST AND READ IN THREE PLACES.
 *
 * The gate above needs the credential's ROW before anything else happens, and the admission block and `caseReader`
 * needed it already. One resolution, passed along, for two reasons and neither is tidiness: (1) a second
 * `aicredentiallook` would be a second Durable Object round trip on every agent call, which is the cost D-199's own
 * comment accepts ONCE and no more; (2) two lookups can disagree — a credential revoked between them would be live at
 * one gate and withdrawn at the next, and which fence a caller met would depend on the order they ran in.
 *
 * THE SHAPE IS CHECKED BEFORE THE STORE IS ASKED, so a session token (64 hex) never reaches this lookup and an agent
 * credential never falls through into the session one: two different failures deserve two different answers. A STORE
 * SILENCE IS NOT "THIS CREDENTIAL IS UNKNOWN" (REC-52): it is returned as a silence and the caller is told the record
 * could not be consulted, never refused as though something were known about them. */
async function aiCredentialPresented(url, env) {
  const t = url.searchParams.get("token");
  if (!t || !AI_TOKEN_SHAPE.test(t)) return { cred: null };
  const st = env.STORE.get(env.STORE.idFromName("bio"));
  const out = await doAnswer(st.fetch(`http://do/aicredentiallook?sha=${await sha256Hex(t)}`));
  if (!out.answered) return { silent: "aicredentiallook" };
  return { cred: out.result?.found ? out.result.credential : null };
}

function aiConfinementDeclaration(confinedTo) {
  const refusal = (code, detail, extra) => {
    const row = AI_CREDENTIAL_CHECKS[code];
    return { error: { reason: code, code, check: row.check, translation: row.translation,
                      detail, ...(extra || {}) } };
  };
  /* THE VALUE IS JUDGED EXACTLY, AND NOTHING IS TRIMMED OR FOLDED — D-456's rule for the namespace set, one layer
     in: a Durable Object name is an exact string, and normalising here would be this function guessing what the
     member meant. So `Scratch`, `SCRATCH`, `"scratch\n"` and a lone space are each refused BY NAME, which is the
     direction that cannot end in a credential believing it is fenced. ABSENT is the only silence: the field omitted,
     `null`, or `undefined`. A PRESENT empty string is a value and is refused with the rest, because an empty
     `store=` is exactly one of the values D-456 measured addressing the real record. */
  if (confinedTo === null || confinedTo === undefined) return { confinedTo: null };
  const asked = String(confinedTo);

  /* DEC-49 REGION is-ai-confinement-declaration
   *
   * THE SPAN `AI_CONFINEMENT_NOT_SCRATCH` names. Helper `refusal`, the code a STRING LITERAL at its site so arm C of
   * the DEC-49 guard COMPARES it rather than reading past a variable. */
  if (asked !== SCRATCH)
    return refusal("AI_CONFINEMENT_NOT_SCRATCH",
      `'${asked.slice(0, 80)}' is not a confinement a credential can carry. The one namespace a credential `
      + `may be bound to for its whole life is ${JSON.stringify(SCRATCH)}; ${JSON.stringify("bio")} is where `
      + `every unconfined credential already lands, so recording it as a confinement would put a fence in the `
      + `record that holds nothing (D-199 (2)). The name is matched exactly, so a capital letter or a stray space `
      + `is a different name. Leave the field out altogether to mint an unconfined credential.`,
      { asked: asked.slice(0, 80), confinements: [SCRATCH] });
  /* END DEC-49 REGION is-ai-confinement-declaration */

  return { confinedTo: SCRATCH };
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
  /* REC-159: a row that bounds machine credentials by `machineClasses` hands an agent nothing —
     no row names `ai` there either — so the four custodial ops stay beyond every scope, as they
     were before `member` joined their `classes` for an enrolled administrator's session. */
  return !!spec && Array.isArray(spec.classes) && spec.classes.includes("member")
    && !Array.isArray(spec.machineClasses);
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
    /* SCOPE-ADD to REC-162 (BOB #32, 2026-09-24): since REC-159 the four custodial acts carry
       `member` for an enrolled administrator's OWN session and `machineClasses` for every
       credential, so "not reachable by a member" was loosely false of them. The detail now says
       which of the two properties refused the op, each read off its OPS row. */
    if (!aiReachesAsMember(OPS[op]))
      return refusal("AI_SCOPE_BEYOND_MEMBER_REACH",
        Array.isArray(OPS[op].machineClasses)
          ? `'${op.slice(0, 60)}' is reached by a member only from that member's own signed-in `
            + `session, and no agent credential is among the credentials it admits, so it cannot be `
            + `handed to an agent. This is a property of the operation and not a list of forbidden `
            + `ones: its OPS row names the credentials that reach it, and an agent's is not one.`
          : `'${op.slice(0, 60)}' is not reachable by a member of this group, so it cannot be handed `
            + `to an agent. This is a property of the operation and not a list of forbidden ones: the `
            + `unattended worker's own verbs carry no member class by construction, so they are `
            + `outside every scope anybody can author.`,
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

/* REC-163 (IC-174): beside the viewer, `cls` — the class this caller would carry through the admission gate: the
   machine class, `ai`, or a session's kind spelled exactly as the gate spells it (`sess.role === "admin"`). The
   public op=instancegroup names it on a credentialed answer, as that answer did when it came through the gate. The
   three callers before it read only `viewer` and `silent`. */
/* REC-126 / REC-198 — THE REVIEW COPY'S ANSWER SHAPE, ONE FUNCTION FOR EVERY READ OF A DRAFT. The store's
   `#noReviewCopy` is carried at 404 with nothing added, so a caller outside the fence reads the same status and the
   same bytes from the single read (`reviewcopy`) and from the list (`casedrafts`); a store that did not answer is a
   silence, stated as one. */
async function reviewAnswer(out, op) {
  if (!out.answered) return storeSilent(op);
  const r = out.result;
  if (!r?.ok) return json({ ok: false, ...r }, r?.reason === "NO_REVIEW_COPY" ? 404 : 400);
  if (op === "reviewcopy") {
    /* REC-148 / DEC-31's BOUND RULE (`BIO_Publication_v0_1.md` §6A.3 point 1): the answer carries its
       hash, date, author and both floors IN-BAND, by the SAME function the container manifest is
       hashed with. The hash is over every byte of this answer but `inband` itself, in the form it is
       served; the floors are the project's required strength, the quantity `op=publish` freezes into
       the case document and the container carries as `bar`. The store's `required_strength` is read
       into the floors and not served twice. (Moved here from the review door's inline branch by CONDUCT #19
       at c19-batch9, when REC-198 made this function the one answer shape for every read of a draft.) */
    const { required_strength: bar, ...copy } = r;
    const served = { ok: true, ...copy };
    const { quartet } = await inbandQuartet({
      subject: served,
      over: "this answer exactly as served, without its `inband` key: parse it, delete `inband`, and "
          + "hash JSON.stringify(rest, null, 1) as UTF-8",
      /* REC-200 / BOB #32, 2026-09-23 23:08Z: THE DATE IS THE COPY'S LAST CHANGE, not the draft's last
         EDIT — a comment moves these bytes, so it moves the hash, and it must move the date with it. The
         store computes it over the rows it SERVES and says in `last_change.stated` what it cannot see.
         THE AUTHOR DOES NOT MOVE: the ruling is about the date, and a recipient who comments on a copy
         has not authored it; `last_change.by` is who made that change, beside it. */
      date: r.last_change?.at ?? null, author: r.updated_by ?? null, bar: bar ?? null });
    return json({ ...served, inband: quartet }, 200);
  }
  return json({ ok: true, ...r }, 200);
}

async function caseReader(url, env, storeName, presentedAi) {
  const t = url.searchParams.get("token");
  if (!t) return { viewer: "" };
  const cls = await classify(t, env);
  if (cls) {
    const scope = scopeFor(cls, url);
    const inScope = OPS.index.classes.includes(cls) && !scope.error && scope.name === storeName;
    return { viewer: inScope ? `${MACHINE_CLASS_PREFIX}${cls}` : "", cls };
  }
  const st = env.STORE.get(env.STORE.idFromName("bio"));
  if (AI_TOKEN_SHAPE.test(t)) {
    /* D-463: the caller hands us the row the front door already read (`presentedAi`), so an agent calling one of these
       four ops costs the lookup ONCE rather than twice and both fences judge the SAME row. `undefined` means nobody
       resolved it — this function is reachable from paths that do not — and then it is looked up here as before. */
    let cred = presentedAi === undefined ? undefined : presentedAi;
    if (cred === undefined) {
      const aOut = await doAnswer(st.fetch(`http://do/aicredentiallook?sha=${await sha256Hex(t)}`));
      if (!aOut.answered) return { silent: "aicredentiallook" };
      cred = aOut.result?.found ? aOut.result.credential : null;
    }
    const scoped = cred ? aiTaskScope(cred, "index", OPS.index) : null;
    return { viewer: scoped && !scoped.error ? scoped.viewer : "", cls: "ai" };
  }
  if (/^[0-9a-f]{64}$/.test(t)) {
    const sOut = await doAnswer(st.fetch(`http://do/session?t=${t}`));
    if (!sOut.answered) return { silent: "session" };
    const sess = sOut.result?.session;
    if (!sess) return { viewer: "" };
    return { viewer: resolveSession(sess).viewer, cls: sess.role === "admin" ? "admin" : "member" };
  }
  return { viewer: "" };
}

/* REC-163 / IC-174 — THE PUBLIC READ OF THE PRODUCING GROUP, ONE READER FOR THE TWO SURFACES THAT SHOW IT TO A
   STRANGER: op=instancegroup's public arm and the setup page served at `/`. `BIO_Publication_v0_1.md` §7 point 1:
   the slug is PUBLIC. It asks the store's `instanceGroupPublic`, which selects nothing but the slug through the one
   reader every stamp uses, so the page, the op and the bytes of every document this store creates name ONE group.
   Answers `doAnswer`'s `{ answered, result }`, and a silence is the caller's to state AS a silence. An instance with
   no store binding at all cannot be asked, and that is a silence too: the page it serves must still be served.

   D-596 — WHICH PUBLIC PROJECTION IS THE CALLER'S TO NAME, AND THERE ARE EXACTLY TWO. op=instancegroup's public arm
   keeps `instancegrouppublic`, the slug and nothing else (REC-163's contract, its key set pinned by group-public's
   G1/G2/C3/C5). The setup page names `groupidentitypublic`, the projection op=groupidentity answers a stranger
   (REC-164): the slug, the display name only beside a slug, and a domain only while its latest verdict is `verified`,
   dated. Both read the slug through the store's one `#producingGroup()` reader, so the page and the op still name
   ONE group. THE DEFECT: the page read `instancegrouppublic` alone, so it showed the slug and never the name or the
   verified domain, while op=groupnameset's answer told the administrator every public surface shows the name beside
   the slug. Any other value is answered as a silence rather than forwarded, so a typo cannot reach a DO path. */
const PUBLIC_GROUP_PROJECTIONS = ["instancegrouppublic", "groupidentitypublic"];
async function publicInstanceGroup(env, storeName, projection = "instancegrouppublic") {
  if (!PUBLIC_GROUP_PROJECTIONS.includes(projection)) return { answered: false, result: undefined };
  let stub = null;
  try { stub = env.STORE.get(env.STORE.idFromName(storeName)); } catch { stub = null; }
  if (!stub) return { answered: false, result: undefined };
  return doAnswer(stub.fetch(`http://do/${projection}`));
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

/* 502 rather than 500: the control plane is intact and reachable — what failed
   is the store BEHIND it, which is precisely the distinction this refusal
   exists to draw. `op` is named so an operator reading a log knows which read
   went silent without the answer implying anything about what it was reading. */
/* D-561 (C-69.2): THE CODE IS NOW A STRING LITERAL AT THIS SITE and carries its canned translation, because every
   public read meets this refusal and its reader is often a member of the public. `STORE_SILENT_REASON` still names
   the same code for the three post-commit sub-reports in `ratify` and `recordcasemanifest` — the SAME condition
   (the store did not answer), stated inside an answer rather than refused; the DEC-49 guard's arm G declares the two
   spellings one condition by name. The wire only GAINS `code`, `check` and `translation`. */
function storeSilent(op) {
  /* DEC-49 REGION is-store-silent */
  return json({ ok: false, reason: "STORE_DID_NOT_ANSWER", ...dispatchRow("STORE_DID_NOT_ANSWER"),
                op, detail: STORE_SILENT_DETAIL }, 502);
  /* END DEC-49 REGION is-store-silent */
}

/* D-116 — EACH FLEET MEMBER'S BUILD, READ BACK THROUGH THE BINDING THIS PLANE ACTUALLY HOLDS.
 *
 * A member versions and rolls out on its own (`BIO_Distribution_v0_1.md` §4 rule 1), and an installer that uploaded
 * one has only Cloudflare's word that it landed — never the member's, and never the PLANE's view of it, which is the
 * one that decides whether a group's PDFs, OCR and assistant do what every description of them says (D-115). So the
 * question is asked where it matters: over `env.<BINDING>`, `GET /version`, the route every member has served since
 * CPDF-9 / FL-2 / CPDF-10. Each answer is the MEMBER'S OWN reply — its `name` and `version` fields, copied — and never
 * this isolate's env.VERSION: a plane that filled these in from its own env would make every member agree for free.
 *
 * States, per member, each a first-class statement rather than a missing key:
 *   SERVING   the member answered through the binding, under its own name, with `version`.
 *   UNBOUND   this plane holds no binding by that name — the member is unreachable FROM HERE whatever the account holds.
 *   SILENT    bound, and it did not answer a readable version within the bound (`why` says what happened).
 *   MISNAMED  something answered through the binding, but under another name — the binding points at the wrong worker.
 * Read only on `op=bootstrap&members=1`, so the anonymous answer a browser polls does not fan out to three workers. */
const FLEET_BINDINGS = [["agent-worker", "AGENT_WORKER"], ["pdf-worker", "PDF_WORKER"], ["ocr-worker", "OCR_WORKER"]];
const MEMBER_VERSION_WAIT_MS = 4000;
async function memberVersions(env) {
  const out = {};
  await Promise.all(FLEET_BINDINGS.map(async ([member, binding]) => {
    const b = env[binding];
    if (!b || typeof b.fetch !== "function") { out[member] = { binding, state: "UNBOUND" }; return; }
    let timer;
    try {
      const r = await Promise.race([
        b.fetch(`https://${member}/version`, { method: "GET" }),
        new Promise((_, no) => { timer = setTimeout(() => no(new Error(`no answer within ${MEMBER_VERSION_WAIT_MS} ms`)),
                                                    MEMBER_VERSION_WAIT_MS); }),
      ]);
      const j = await r.json().catch(() => null);
      if (!r.ok || !j || typeof j.version !== "string" || !j.version) {
        out[member] = { binding, state: "SILENT", why: `answered HTTP ${r.status} without a version` };
      } else if (j.name !== member) {
        out[member] = { binding, state: "MISNAMED", name: typeof j.name === "string" ? j.name : null, version: j.version };
      } else {
        out[member] = { binding, state: "SERVING", version: j.version };
      }
    } catch (e) {
      out[member] = { binding, state: "SILENT", why: String(e && e.message || e).slice(0, 200) };
    } finally { clearTimeout(timer); }
  }));
  return out;
}

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
/* REC-123: the C-32 row for a machine fence that lives in THIS file (op=ratify,
   op=caseratify). Same shape and same refusal-to-invent as `reextractRow`. */
const machineFenceRow = (code) => {
  const row = CHECK_CATALOGUE.MACHINE_FENCE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`machineFenceRow: ${code} has no MACHINE_FENCE_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* D-512: C-66.6's row — a replay the plane could not verify — on `identityFenceRow`'s shape and its refusal to invent. */
const replayRow = (code) => {
  const row = CHECK_CATALOGUE.SURFACE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`replayRow: ${code} has no SURFACE_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* REC-164: C-64.4's row, the fence's canned sentence taken from the one catalogue family that holds it. */
const identityFenceRow = (code) => {
  const row = CHECK_CATALOGUE.INSTANCE_GROUP_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`identityFenceRow: ${code} has no INSTANCE_GROUP_CHECKS row with a canned translation `
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

/* D-270 / C-61: the argument complaint's row reader, `admissionRow`'s shape and
   its refusal to invent — a code with no sentence behind it throws here rather
   than reaching a member. */
const requiredArgumentRow = (code) => {
  const row = REQUIRED_ARGUMENT_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`requiredArgumentRow: ${code} has no REQUIRED_ARGUMENT_CHECKS row with a canned `
                  + `translation (DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* D-456 / C-78: the namespace refusal's row reader, the same shape and the same refusal to invent. */
const namespaceRow = (code) => {
  const row = NAMESPACE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`namespaceRow: ${code} has no NAMESPACE_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* D-278 / C-68 and C-69: the same reader again, one per family, and the same
   refusal to invent. */
const installationRow = (code) => {
  const row = INSTALLATION_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`installationRow: ${code} has no INSTALLATION_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};
const dispatchRow = (code) => {
  const row = DISPATCH_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`dispatchRow: ${code} has no DISPATCH_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* =========================================================================
 * D-270 — THE SESSION GATE ANSWERED THREE DIFFERENT FACTS WITH ONE SENTENCE,
 * AND THE SENTENCE WAS FALSE FOR TWO OF THEM.
 *
 * THE RULE IS BOB'S, 2026-09-19, and its home is CITED rather than restated
 * here: `docs/architecture/BIO_Membership_Architecture_v2.md` §4, the §4.7
 * block. The generating rule is one line — A REFUSAL MAY STATE ONLY WHAT THE
 * SYSTEM CAN SUPPORT — and it yields three sentences where this gate had one:
 *
 *   (a) "this verb is not for a person"  — a DESIGN CLAIM. Sayable ONLY where
 *       such a decision is RECORDED. `MACHINE_CREDENTIAL_REQUIRED`.
 *   (b) "your credential does not reach this verb" — ALWAYS sayable, because it
 *       is about the caller rather than about the design.
 *       `SESSION_ROLE_CANNOT_REACH_OP`.
 *   (c) for an OMISSION — NEITHER. State the fact and invent no rationale.
 *       `SESSION_ROUTE_NOT_RECORDED`.
 *
 * **WHY (c) HAD TO EXIST, AND IT IS THE ARGUMENT RATHER THAN A FOOTNOTE.** A
 * false rationale SUPPRESSES ITS OWN BUG REPORT. A member told that an absence
 * is a DECISION will not report it as a gap, so the sentence recruits the one
 * person who could have caught it into believing there is nothing to catch. The
 * measured case is D-136's: `adminendorse`, `adminremove` and `membercaps` WERE
 * reachable by NO session, and §4.7 assigns that very vote to a person. A
 * TWO-way split — which is what IC-55 proposed in 2026-08 — would have written
 * "this verb is not for a person" onto the three ops whose bug report it then
 * suppresses.
 *
 * **THAT CASE IS NOW DISCHARGED, AND THE TENSE IS THE POINT (D-136, 2026-09-19).**
 * The three ops hold reach in BOTH session sets and a server-stamped `by`, so no
 * session is refused at this gate and the ROSTER answers a non-administrator
 * `NOT_AN_ADMIN`. (CORRECTED 2026-09-25 by REC-162: this read "`SESSION_OPS.admin`
 * reach … a member's session gets (b), which names the administrator as the
 * route" — false of D-136's landing, which put them in both sets; and (b) now
 * names the SESSION that reaches the op, the founder's where the admin set alone
 * holds it, because an enrolled administrator holds a member's session.)
 * They are no longer examples of (c) and `d270-refusal-truth.test.mjs`' arm was
 * CORRECTED rather than exempted. **THE PARAGRAPH IS KEPT IN THE PAST TENSE
 * BECAUSE IT IS THE ARGUMENT FOR (c), NOT A LIST OF ITS MEMBERS**: the reason (c)
 * had to exist is that this absence WAS an omission and a false rationale would
 * have suppressed the report that fixed it. Rewriting the receipt out once the
 * bug is closed is how a rule loses the evidence that earned it — and (c)'s live
 * members are read from the gate rather than from this prose, so nothing here
 * decides who gets which sentence.
 *
 * **AND (a) IS NARROWER THAN IT LOOKS.** `op=provenancechain` and
 * `op=provenanceroute` were inside the old sentence's reach, and their own OPS
 * rows say the opposite of it in as many words: *"NOT open to `daemon`: deciding
 * that the evidence supports a route is a named member's judgement."* The plane
 * was telling a member that an op reserved to a named member's judgement is
 * performed by an unattended writer. Under (c) they got the fact and no
 * invented reason, which was the honest answer until somebody ruled — and BOB
 * #19 did (§4.10, 2026-09-21): REC-155 gave both SESSION reach, so a signed-in
 * member now performs them under their own name, as their OPS rows say.
 *
 * **WHAT THIS DOES NOT CHANGE, AND IT IS THE WHOLE SAFETY ARGUMENT: WHO REACHES
 * WHAT.** Not one op moves between `SESSION_OPS`' sets and no class list moves.
 * Exactly the same callers are refused exactly the same verbs; what changes is
 * what they are TOLD. A fix here that widened reach would be a different item
 * wearing this one's costume.
 * ======================================================================= */

/* WHERE A DECISION IS RECORDED THAT A VERB IS NOT FOR A PERSON.
 *
 * THIS TABLE IS THE PLANE HOLDING ITS OWN WARRANT. Sentence (a) is a claim
 * about the DESIGN, and the plane may only make it while it can say where the
 * decision lives — so the citation is served to the caller in `recorded` and
 * the claim travels with the thing that licenses it.
 *
 * IT IS A PROPERTY AND NOT A LIST OF SPELLINGS, which is what makes it safe to
 * leave alone: an op added tomorrow is absent from this table, so it gets (c)
 * automatically and the plane invents nothing about it. **The default is the
 * honest answer**, and that is deliberate — the failure mode this item exists
 * to close is a rationale asserted where none was recorded, so the direction
 * that costs nothing must be the one that claims nothing.
 *
 * EACH ENTRY WAS READ AT THE ARTIFACT, not inferred from an op looking
 * machine-ish. Adding a row here is recording a decision, so it is an act to
 * take deliberately and never to tidy up.
 * CORRECTED 2026-09-25 BY REC-155. This paragraph read: *"Ops refused to every
 * session with NO entry here — `livefire`, `reproject`, `provenancechain`,
 * `provenanceroute` and the three calibration writes — are UNDETERMINED rather
 * than decided."* True until BOB #19 RULED all seven
 * (`BIO_Membership_Architecture_v2.md` §4.10): the provenance pair and the three
 * calibration writes JOINED BOTH SESSION SETS (`PROVENANCE_JUDGEMENT_ACTIONS`,
 * `CALIBRATION_WRITE_ACTIONS`), and `livefire` and `reproject` are recorded
 * below, each with the citation §4.10 quotes. So on this plane NO mutating op
 * that reaches the gate is an omission today — and sentence (c) STAYS, because
 * it is the answer the plane owes the next op somebody adds without a ruling. */
const UNATTENDED_BY_DECISION = {
  purge: "src/index.mjs, the admission gate's own doctrine paragraph: 'Everything outside "
       + "SESSION_OPS, purge above all, still requires a machine credential.'",
  cpuprobe: "src/index.mjs, op=cpuprobe's OPS row: 'Burns compute deliberately to find where the "
          + "runtime cuts it off. Probe and admin only: it belongs nowhere near a member's session.'",
  capturerequestdrain: "src/index.mjs, op=capturerequestdrain's OPS row: 'daemon is here BY "
                     + "DECISION: SWEEP 4b item 1 is the decision DEC-37 required for widening the "
                     + "class by decision, not by drift.'",
  taskdrain: "src/index.mjs, the AI_RUN_ACTIONS note (PL-4): 'the drain is the DAEMON'S — a member "
           + "reaching for it by hand would be a person doing the daemon's job with the daemon's "
           + "conduct rules applied to them.'",
  /* D-436: recorded by the D-436 worker as a PROVISIONAL decision, and stated as one in IC-172 — the seed is
     the root of trust's, as the claim and the export are. The citation is the OPS row's own sentence. */
  instancegroupseed: "src/index.mjs, op=instancegroupseed's OPS row (D-436, provisional): 'RECORDING THE "
                   + "INSTANCE'S PRODUCING GROUP IS THE ROOT OF TRUST'S ACT — THE ADMIN_TOKEN CREDENTIAL HELD IN "
                   + "THE HOSTING ACCOUNT, THE CREDENTIAL THE INSTALLER'S OWN CLAIM IS ARMED BY — AND NO SESSION "
                   + "OF ANY ROLE REACHES IT.'",
  /* REC-155: the two §4.10 RULES unattended by decision (BOB #19, 2026-09-21). Each citation is the one §4.10
     quotes, re-read at the artifact by this landing; the ruling is cited beside it so a caller can find both. */
  livefire: "BIO_Membership_Architecture_v2.md §4.10 (BOB #19), citing src/livefire.mjs, header: 'the only "
          + "channel available for reaching a deployment may be a plain fetch of a URL. Confined to the scratch "
          + "namespace' — the deployment's live-fire battery, addressed to the operator's credential.",
  /* T6-13: recorded by K199 (BOB #51, 2026-09-28), reevaluation R14's sweep. The citation is the ruling's own words. */
  reevaluationraise: "build/rulings.md K199 (BOB #51), reevaluation R14: 'R14's notices are raised by a bounded sweep "
                   + "raiseNotices({limit, after}) (op reevaluationraise, admin and daemon)', which scheduler or "
                   + "monitoring calls.",
  reproject: "BIO_Membership_Architecture_v2.md §4.10 (BOB #19), citing src/store.mjs, reproject: 'Exposed "
           + "because a deploy runs the bounded pass once at construction and a large store may need more than "
           + "one' — a deploy's maintenance pass, addressed to the operator's credential.",
};

/* THE SESSION GATE. A browser signed in with a password holds a session token,
 * not a machine credential; `SESSION_OPS` is what says which MUTATING ops that
 * session may drive, per role.
 *
 * IT IS ITS OWN NAMED FUNCTION rather than a block inside `fetch`, and that is
 * REC-71's rule paid at allocation time: a DEC-49 `where` resolves a span BY
 * FUNCTION NAME, and PL-4 shipped one pointing at `acquire` — a name that does
 * not exist, because the op lives inside `fetch` — so nothing was checking that
 * site at all. A gate left inline in `fetch` is a gate no `where` can name.
 *
 * `error` IS KEPT BESIDE THE CODE, and that is deliberate rather than timidity:
 * every consumer of this refusal reads `reason || error` or `error || reason`,
 * so ADDING a code moves nobody while REMOVING the string would. For the
 * by-decision arm the sentence is the byte-identical legacy one. For the other
 * two it is NEW, because the legacy sentence was not merely coarse there — it
 * was WRONG, and a consumer switching on it was switching on a false statement.
 * IC-55 carries that half. */
function sessionOpGate(kind, op, spec, method) {
  /* **THIS GATE RETURNS THE RESPONSE ITSELF, NOT A REFUSAL OBJECT FOR `fetch` TO
     SPREAD, AND THAT IS A MEASURED CHOICE RATHER THAN A STYLE.** The obvious
     shape — return `{ error: {...} }` and write `return json({ ok: false,
     ...gated.error }, 403)` at the call site — was built first and the DEC-49
     guard REFUSED it: that call site is a return-position outcome whose CODE
     comes from a spread, which the walk cannot resolve until run time, and
     `inheritedVerdicts` is a CEILING THAT MAY ONLY FALL. It sat at 4 and the
     shape would have made it 5 — a new place a refusal can pass through
     ungraded, bought for nothing. Returning the Response keeps every code a
     STRING LITERAL inside the governed region where the walk compares it against
     the catalogue, and leaves `fetch` with no outcome literal to misread. */
  const refusal = (code, error, detail, extra) =>
    json({ ok: false, reason: code, ...admissionRow(code), error, detail, op, ...(extra || {}) }, 403);
  /* `capture` is nominally mutating because of its PUT path; its GET is a read
     and is treated as one. Computed and returned OUTSIDE the region on purpose,
     so the admission is not conscripted into this family as a refusal site. */
  if (!spec.mutating || (op === "capture" && method === "GET") || SESSION_OPS[kind].has(op))
    return null;

  /* DEC-49 REGION is-session-op-gate
   *
   * THE SPAN the three session codes name (REC-71). A REGION and not the whole
   * function, so the admission above is not read as part of the family. Helper
   * `refusal`, and every code a STRING LITERAL at its site so arm C of the
   * DEC-49 guard can COMPARE it rather than read past a variable — one code in
   * a variable shipped `translation: undefined` to a member.
   *
   * THE ORDER IS THE HONESTY, and it runs from what the system can support MOST
   * to what it can support LEAST. Ask the session lists FIRST: if any role
   * reaches this verb then the refusal is about THIS caller's role, and it is
   * true without consulting any record. Only then ask whether a decision is
   * recorded. And if none is, say so — do not fall back on the design claim,
   * because the fallback IS the defect. */
  /* REC-162 (Membership v2 §4.9, BOB #23): THE SENTENCE SAYS WHICH SESSION REACHES THE OP, DERIVED
     FROM THE SET THAT HOLDS IT. Reaching here means exactly ONE set holds `op` and it is not this
     session's. `SESSION_OPS.admin` is the FOUNDER'S password session and nothing else — an enrolled
     administrator signs in as `member:<id>` — so an op the admin set alone holds is *reserved to the
     founder's session*, and the old sentence (*"reserved to an administrator of this group"*, with
     `role: 'member'`) was FALSE of every enrolled administrator it refused. `role` is gone for that
     reason: `session` names the session's kind, which is true of anybody who holds it. */
  if (SESSION_OPS.admin.has(op))
    return refusal("SESSION_ROLE_CANNOT_REACH_OP",
      "this operation is reserved to the founder's session",
      `'${String(op).slice(0, 60)}' is reachable from a signed-in session, but only the founder's: `
      + `the password session made when this instance was claimed with its root credential. This is `
      + `a member's session, which is what every enrolled member signs in with, an administrator of `
      + `this group included — so an administrator's session is refused this exactly as this one is, `
      + `and nothing here says whether you are one. There is no machine credential to go and find: `
      + `the founder performs this from their own browser.`,
      { session: kind, reachedBy: "founder" });
  if (SESSION_OPS.member.has(op))
    return refusal("SESSION_ROLE_CANNOT_REACH_OP",
      "this operation is reserved to a member's own session",
      `'${String(op).slice(0, 60)}' is reachable from a signed-in session, but only a member's `
      + `own, and this is the founder's session. There is no machine credential to go and find: `
      + `a member performs this from their own browser.`,
      { session: kind, reachedBy: "member" });
  const recorded = UNATTENDED_BY_DECISION[op];
  if (recorded)
    return refusal("MACHINE_CREDENTIAL_REQUIRED",
      /* THE LEGACY SENTENCE, BYTE-IDENTICAL. It is TRUE of these, and keeping
         it is what makes the code purely additive for them. */
      "this operation requires a machine credential, not a signed-in session",
      `'${String(op).slice(0, 60)}' is on the unattended path. No signed-in session of any role `
      + `reaches it, the founder's included; it answers to a credential held in the hosting `
      + `account. This instance holds a decision on record saying so, cited in 'recorded' so you `
      + `can check it. Nothing here says a machine is trusted more than a person (DEC-52 rules the `
      + `opposite): it says which credential this verb is addressed to.`,
      { recorded });
  return refusal("SESSION_ROUTE_NOT_RECORDED",
    "no signed-in session reaches this operation, and no decision on record says why",
    `'${String(op).slice(0, 60)}' is reachable by no session of any role, and this instance holds `
    + `no recorded decision that it is not meant for a person. The plane will not invent one: a `
    + `member told an absence is a decision stops reporting it as the gap it may well be. If you `
    + `expected to perform this, that expectation is worth filing rather than working around.`);
  /* END DEC-49 REGION is-session-op-gate */
}

/* THE ARGUMENT COMPLAINT (C-61). ONE code for the whole condition with the
 * argument in `argument` and the shape in `shape`, rather than a row per op —
 * `AI_BEYOND_TASK_SCOPE` is the standing precedent for one code whose producers
 * are told apart by a field.
 *
 * A HELPER RATHER THAN THREE EDITED SITES, for the `where` field's sake: a
 * DEC-49 row holds ONE `where` naming the SMALLEST SPAN, so a code minted at
 * three sites inside `fetch` could not name one honestly. */
function requiredArgument(op, argument, shape, error) {
  /* DEC-49 REGION is-required-argument
   * THE SPAN `REQUIRED_ARGUMENT_MISSING` names. Code a STRING LITERAL at its
   * site. `error` is passed in BYTE-IDENTICAL from the call site rather than
   * rebuilt from a template here, so all three legacy sentences survive this
   * change unaltered and no consumer reading `error` moves at all. */
  return { ok: false, reason: "REQUIRED_ARGUMENT_MISSING",
           ...requiredArgumentRow("REQUIRED_ARGUMENT_MISSING"),
           error, op, argument, shape,
           detail: `op=${op} needs '${argument}' in the shape ${shape}, and this request carried `
                 + `none the operation could use. Nothing was changed.` };
  /* END DEC-49 REGION is-required-argument */
}

/* THE CAPABILITY COMPLAINT (C-68.1, D-278). A copy installed with no evidence
 * storage bound cannot serve `capture`, `pdfstructure`, `acquire` or `attest`.
 * ONE row for the four, the op named beside it, minted here rather than at four
 * sites inside `fetch` for the same reason `requiredArgument` is: a DEC-49 row
 * holds one `where`. `error` is passed in BYTE-IDENTICAL from each site — the
 * sites said two different sentences before this and still do. */
function storageAbsent(op, error) {
  /* DEC-49 REGION is-storage-absent */
  return json({ ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED",
                ...installationRow("EVIDENCE_STORAGE_NOT_CONFIGURED"), error, op }, 503);
  /* END DEC-49 REGION is-storage-absent */
}


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

/* D-533: `partsHeld`, the one rule for a capture held in parts, is provenance's (R7; imported above). */

/* REC-173 (INVESTIGATIVE-SESSION.md §11 item 5, "A MIGRATION IS A REPLAY, NOT A SURFACING", BOB #30): IS THIS
   CREATION A MIGRATION REPLAY? — and since D-512 (BOB #33's step (2)) IS THIS PROMOTION, of ANY type and ANY revision,
   A REPLAY THE SERVER CAN VERIFY? The same test answers both: nothing below is particular to an inquiry or to a
   creation (`b.bundleId` is the bundle a revision revises too). Condition (2) of the ruling, asked of what the SERVER
   holds and never of what the caller says: the promotion names a capture (`provenanceCapture`, a sha256) that is
     - REGISTERED as the Drive era's provenance — at `DRIVE_PROVENANCE_PATH` — by this creation's own `register`
       list, the one writer of the register (`promote`) and so the earliest act that can register anything against
       a bundle that does not exist yet (the builder's DESIGN GAP, stated in the IC);
     - HELD: its bytes are read back from R2 under the one capture key and must hash to the sha named, so the
       provenance is the bytes already in the record, not a copy the request carries;
     - and its PRESERVED PROMOTION RECORDS name THIS bundle id (`record.target`) and, in THE SAME record, list THIS
       revision's `bundle.md` SHA-256 — computed here from the text being promoted, and the `sha256` the caller
       sent must BE that value, because the store keeps the caller's figure as the bundle's head.
   Null when any of it fails: a promotion that ASSERTED `replay` is then refused REPLAY_UNVERIFIED (C-66.6, D-512), and
   an inquiry creation that asserted nothing is an ORDINARY creation and rule 2 and D-78 apply unchanged, so this
   door cannot be used to skip a run. Condition (1), the ADMIN class, is the caller's to ask before calling this.
   WHAT THIS CANNOT CHECK, stated rather than hidden: the provenance capture is uploaded by the root of trust, whose
   honesty the record does not model (Membership §DEC-2, deferred). */
const DRIVE_PROVENANCE_PATH = "migration/drive-provenance.json";
async function migrationReplayOf(env, storeName, b) {
  const cap = typeof b.provenanceCapture === "string" ? b.provenanceCapture.trim() : "";
  if (!/^[0-9a-f]{64}$/.test(cap)) return null;
  const registered = Array.isArray(b.register)
    && b.register.some((r) => r && r.sha256 === cap && r.path === DRIVE_PROVENANCE_PATH);
  if (!registered) return null;
  const bm = Array.isArray(b.files) ? b.files.find((f) => f && f.path === "bundle.md" && typeof f.text === "string") : null;
  if (!bm) return null;
  const mdSha = createSha256().update(new TextEncoder().encode(bm.text)).hex();
  if (bm.sha256 !== mdSha) return null;
  let held;
  try { held = await env.CAPTURES.get(captureKey(storeName, cap)); } catch { return null; }
  if (!held) return null;
  const bytes = new Uint8Array(await held.arrayBuffer());
  if (createSha256().update(bytes).hex() !== cap) return null;
  let prov;
  try { prov = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); } catch { return null; }
  const records = Array.isArray(prov?.promotions) ? prov.promotions : [];
  const match = records.find((p) => p && p.record && typeof p.record === "object"
    && p.record.target === b.bundleId
    && Array.isArray(p.record.files)
    && p.record.files.some((f) => f && f.name === "bundle.md" && f.sha256 === mdSha));
  if (!match) return null;
  return { capture: cap, promotion: typeof match.key === "string" ? match.key : null, bundleMdSha: mdSha };
}

bindPublishedPlane({ json, doAnswer, storeSilent, requiredArgument, StoreSilent, STORE_SILENT_REASON,
                    STORE_SILENT_DETAIL, PUBLISHED_STORE });

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
    /* REC-163 / IC-174: the page names whose record this is — the group ITS record records, read when the page is
       SERVED, through the one public read (`publicInstanceGroup`). `setupPage` puts the slug in the served bytes,
       or says in words that none is recorded, or — when the record did not answer — says THAT, never "none" and
       never a name. `no-store`, because the bytes now carry a fact the record can change: a page kept from before a
       seed would go on saying none is recorded. D-596: the read is op=groupidentity's PUBLIC projection, so the line
       carries the display name beside the slug and a verified domain with its date (`setup.mjs` `groupLine`).

       D-475 — AND THE NAMESPACE IS THE CALLER'S TO NAME HERE, because NOTHING BELOW CAN REACH THIS ROUTE. This is an
       HTML route: it answers before `path` and `op` exist, so D-456's `namespaceGate` and D-461's
       `pinnedNamespaceGate`, both of which run at the op front door a few lines down, never see it. MEASURED: the
       read was written `publicInstanceGroup(env, "bio")`, so `/?store=scratch` served `bio`'s slug as this copy's
       own — a live verification whose whole no-write guarantee is naming its namespace (CLAUDE.md §5, D-325) read
       production while believing it was in scratch — and `/?store=nonsense` did the same, which is D-456's own
       defect surviving at the one route D-456 did not reach. Found by D-461's worker.

       THE RULE IS op=instancegroup's, NOT A NEW ONE, and that is the decision rather than a convenience: this page
       and that op are ONE READER (`publicInstanceGroup` — its own header says so) shown to a stranger, so a
       namespace that does not exist is refused BY NAME through the very gate every other caller meets,
       `store=scratch` reads scratch, and everything else reads `bio`. The page is deliberately NOT added to
       D-461's pinned set: pinning one of two surfaces over one reader would make `store=scratch` mean two things on
       the same copy — refused on the page, honoured on the op — and the op is exempt because it reads `store=`
       itself, which is now exactly what the page does. `/version` and `/sign` are left alone on purpose: they
       address no namespace, and a gate on a route that reads no record would be a fence tighter than its rule. */
    if (req.method === "GET" && !url.pathname.startsWith("/api")
        && (url.pathname === "/" || url.pathname === "") && !url.searchParams.get("op")) {
      const pageNamespace = namespaceGate(url);
      if (pageNamespace) return pageNamespace;
      const pageStore = url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio";
      return new Response(setupPage(await publicInstanceGroup(env, pageStore, "groupidentitypublic")),
        { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }

    const path = url.pathname.replace(/^\/api\/?/, "/");
    const op = url.searchParams.get("op") || path.slice(1) || "selftest";
    const spec = OPS[op];
    /* DEC-49 REGION is-unknown-op
       D-278 (C-69.1). `error` stays "unknown op" BYTE-IDENTICAL and stays the
       FIRST key after `ok`: civicos-ui's `queueAbsent` reads the sentence to tell
       an older plane from a refusal (I3), and `preauth-vocabulary.test.mjs` reads
       it out of this line textually. */
    if (!spec) return json({ ok: false, error: "unknown op", reason: "UNKNOWN_OP", ...dispatchRow("UNKNOWN_OP"),
                             op }, 400);
    /* END DEC-49 REGION is-unknown-op */

    /* D-456: a `store=` naming no namespace is refused here, before any credential is read (`namespaceGate`). */
    const unknownNamespace = namespaceGate(url);
    if (unknownNamespace) return unknownNamespace;
    /* D-463: the presented `ai` credential's ROW, read ONCE here and reused by the admission block and `caseReader`
       below, because the confinement is a property of the row and the gate needs it before anything else runs. A
       request presenting no credential, or one that is not an agent credential, asks the store nothing. */
    const presentedAi = await aiCredentialPresented(url, env);
    if (presentedAi.silent) return storeSilent(presentedAi.silent);
    /* D-463: a credential MINTED CONFINED to `scratch` is held to it here — a named `store=` refused by name, an absent
       one set to `scratch` — BEFORE D-461's gate, so a confined caller reaching a bio-pinned public op is told which
       fence stopped it and files nothing in the real record (`confinedNamespaceGate`). */
    const confinedNamespace = confinedNamespaceGate(url, presentedAi.cred);
    if (confinedNamespace) return confinedNamespace;
    /* D-461: `store=scratch` on a public op that always answers from `bio` is refused here (`pinnedNamespaceGate`). */
    const pinnedNamespace = pinnedNamespaceGate(url, op, spec);
    if (pinnedNamespace) return pinnedNamespace;

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
        /* DEC-49 REGION is-bootstrap-claim
           D-278 (C-68.2–.4): installation facts, each `error` byte-identical, and
           no row says more than its sentence did. */
        if (!env.ADMIN_TOKEN) return json({ ok: false, reason: "BOOTSTRAP_CREDENTIAL_UNSET",
          ...installationRow("BOOTSTRAP_CREDENTIAL_UNSET"), error: "instance has no bootstrap credential set" }, 409);
        if (!(await liveToken(env.ADMIN_TOKEN)))
          return json({ ok: false, reason: "BOOTSTRAP_CREDENTIAL_PUBLISHED", ...installationRow("BOOTSTRAP_CREDENTIAL_PUBLISHED"),
            error: "bootstrap credential is a published repository value and can never arm a claim; set a fresh ADMIN_TOKEN in the Cloudflare dashboard" }, 409);
        if (body.bootstrapToken !== env.ADMIN_TOKEN)
          return json({ ok: false, reason: "BOOTSTRAP_CREDENTIAL_MISMATCH", ...installationRow("BOOTSTRAP_CREDENTIAL_MISMATCH"),
            error: "bootstrap credential does not match" }, 403);
        /* END DEC-49 REGION is-bootstrap-claim */
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
          /* D-278: C-61.1. `error` is written as a KEY here rather than passed into the helper, so the
             sentence stays readable where `preauth-vocabulary.test.mjs` reads it textually; the key after
             the spread is the one on the wire, byte-identical to the pre-D-278 answer. */
          return json({ ok: false, ...requiredArgument("verify", "sha256", "<64 lowercase hex>"),
            error: "verify requires sha256=<64 lowercase hex>" }, 400);
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

      /* ===== REC-163 / IC-174: op=instancegroup — THE PRODUCING GROUP, AND ITS SLUG IS PUBLIC ================
         `BIO_Publication_v0_1.md` §7 point 1 (BOB #24, 2026-09-21). WHO ASKS DECIDES WHICH PROJECTION, NEVER
         WHETHER:
           - a caller holding a credential the admission gate would admit to this read — a machine class in its
             own namespace, a session, an agent credential in scope — is answered the store's WHOLE ROW, provenance
             included, exactly as before this item. `caseReader` decides it, the one resolver of "who is asking"
             this branch already has, asked about the store this read addresses;
           - anybody else is answered the PUBLIC projection — the slug, or the statement that none is recorded,
             and nothing else — through `publicInstanceGroup`, the read the setup page makes too.
         WHICH STORE: the namespace a machine credential is confined to or names (`scopeFor`'s rule, so a probe
         naming nothing still reads `scratch`), and for every other caller `store=scratch` when named and `bio`
         otherwise, the invitation ops' rule — the slug is the same public fact either way. The answer says which
         store answered. A SILENCE IS A SILENCE (REC-52): never "no group is recorded", on either arm. */
      if (op === "instancegroup") {
        const held = url.searchParams.get("token");
        const heldCls = held ? await classify(held, env) : null;
        const heldScope = heldCls ? scopeFor(heldCls, url) : null;
        const igStore = heldScope && !heldScope.error ? heldScope.name
          : (url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio");
        const igReader = await caseReader(url, env, igStore, presentedAi.cred);
        if (igReader.silent) return storeSilent(igReader.silent);
        if (igReader.viewer) {
          const igOut = await doAnswer(env.STORE.get(env.STORE.idFromName(igStore)).fetch("http://do/instancegroup"));
          if (!igOut.answered) return storeSilent("instancegroup");
          return json({ ok: true, result: igOut.result, store: igStore, tokenClass: igReader.cls }, 200);
        }
        const pubOut = await publicInstanceGroup(env, igStore);
        if (!pubOut.answered) return storeSilent("instancegroup");
        return json({ ok: true, result: pubOut.result, store: igStore }, 200);
      }

      /* ===== REC-164: op=groupidentity — THE DISPLAY NAME AND THE VERIFIED DOMAIN, BESIDE THE PUBLIC SLUG =========
         `BIO_Publication_v0_1.md` §7 points 2 and 3. op=instancegroup's rule for WHO and WHICH STORE, unchanged: a
         caller the admission gate would admit is answered the claim, its latest verdict and both dated histories
         (§7: "members see the claim and its state"); anybody else the public projection — the slug, the display
         name only beside a slug, and a domain only while its latest verdict is `verified`. A silence is a silence. */
      if (op === "groupidentity") {
        const held = url.searchParams.get("token");
        const heldCls = held ? await classify(held, env) : null;
        const heldScope = heldCls ? scopeFor(heldCls, url) : null;
        const giStore = heldScope && !heldScope.error ? heldScope.name
          : (url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio");
        const giReader = await caseReader(url, env, giStore, presentedAi.cred);
        if (giReader.silent) return storeSilent(giReader.silent);
        const giOut = await doAnswer(env.STORE.get(env.STORE.idFromName(giStore))
          .fetch(giReader.viewer ? "http://do/groupidentity" : "http://do/groupidentitypublic"));
        if (!giOut.answered) return storeSilent("groupidentity");
        return json({ ok: true, result: giOut.result, store: giStore,
                      ...(giReader.viewer ? { tokenClass: giReader.cls } : {}) }, 200);
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
        const reader = await caseReader(url, env, "bio", presentedAi.cred);
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
      /* D-150: `statementack` takes these two doors, and a member may name an unsigned case
         document (`case` + `edition`) in place of a draft. */
      if (op === "reviewcopy" || op === "reviewcomment" || op === "statementack") {
        const bySecret = url.searchParams.has("secret");
        const q = new URLSearchParams();
        const draftParam = (url.searchParams.get("draft") || "").trim();
        if (draftParam) q.set("draft", draftParam);
        if (op === "statementack" && !bySecret)
          for (const k of ["case", "edition"])
            if (url.searchParams.get(k)) q.set(k, (url.searchParams.get(k) || "").trim());
        if (op === "reviewcopy" && url.searchParams.get("limit")) q.set("limit", url.searchParams.get("limit"));
        if (bySecret) {
          q.set("bySecret", "1");
          q.set("secretSha", await sha256Hex(url.searchParams.get("secret") || ""));
        } else {
          const reader = await caseReader(url, env, "bio", presentedAi.cred);
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
        return reviewAnswer(out, op);
      }

      if (op === "publishedcase" || op === "publishedbytes") return publishedRoutes({ op, url, env, stub });
      /* 7b. Anyone, no token, no session. Size-capped, rate-limited, and
         confined to the inbox namespace: payload bytes land under
         bio/inbox/<sha256> in the working bucket and nowhere else, the way
         probe is confined to scratch. Nothing is read back out except by a
         signed-in member. */
      if (op === "knock") return knockOp(req, env, stub, { json, requiredArgument, storeSilent });
      /* REC-52: the same spread as section 7a's. A store silence used to leave
         a `{ok:true}` carrying the service name, the version and the bootstrap
         flag and NOTHING the store knows — an instance answering "here is what
         I am" while unable to say anything about itself. The installer and
         `newgroup` both read this op (measured at newgroup/src/index.mjs:364
         and :631), so the false success reached a caller deciding whether an
         instance was ready. */
      const out = await doAnswer(stub.fetch(new Request(`http://do/bootstrap?fp=${fp}`)));
      if (!out.answered) return storeSilent("bootstrap");
      /* D-116 / IC (see INTERFACE-CHANGES.md): THREE BUILDS, EACH READ FROM WHERE IT RUNS. `version` is THIS routing
         isolate's; `storeVersion` arrives inside `out.result` from the Durable Object's own env (store.mjs, the
         `bootstrap` route) and is NEVER written here — filling it from `env.VERSION` would make the two agree for
         free, which is exactly the lie this field exists to prevent. `memberVersions` (on `members=1` only) is each
         fleet member's own reply through this plane's binding. */
      return json({ ok: true, service: "bio-plane", version: env.VERSION || "0.0.0",
                    bootstrapConfigured: await liveToken(env.ADMIN_TOKEN), ...out.result,
                    ...(url.searchParams.get("members") === "1" ? { memberVersions: await memberVersions(env) } : {}) },
                  200);
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
    /* D-463: THE LOOKUP THIS BLOCK USED TO MAKE HAS MOVED TO THE FRONT DOOR and its answer arrives here as
       `presentedAi`. Nothing about the resolution changed — the shape is still checked before the store is asked, a
       silence is still a silence and is converted there (REC-52), and a credential the store does not know still leaves
       `cls` null so the session block below gets its turn. What changed is that the confinement gate needs the row
       BEFORE the unauthenticated block runs, and resolving it twice would let a revocation land between the two. */
    if (!cls && presentedAi.cred) { cls = "ai"; aiCred = presentedAi.cred; }
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
     * **CORRECTED 2026-09-19 BY D-270: THE SESSION GATE HAS LEFT THIS REGION.**
     * The count above is the count as REC-79 drew it and is kept as the record
     * of why the region exists; what this span holds TODAY is five refusals, not
     * six. The sixth — `MACHINE_CREDENTIAL_REQUIRED` — moved out to its own
     * named function `sessionOpGate` and its own region `is-session-op-gate`,
     * because it turned out to be answering THREE different facts with one
     * sentence and to be false for two of them. Its `where` moved with it. This
     * paragraph is corrected rather than deleted for the reason the project
     * keeps meeting from the other side: a comment describing a mechanism the
     * tree does not carry is its most-repeated defect.
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
          /* D-270: the gate is a NAMED FUNCTION now, so a DEC-49 `where` can
             point at it, and it answers THREE different conditions where this
             line answered one — of which the one it answered was false for two.
             It returns the REFUSAL RESPONSE or null, rather than an object for
             this line to spread — see its own header: spreading it here would
             add a fifth INHERITED VERDICT to a DEC-49 ceiling that may only
             fall, and it buys nothing, because the codes are literals inside the
             gate's own governed region where the walk can compare them. */
          const gated = sessionOpGate(kind, op, spec, req.method);
          if (gated) return gated;
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
    } else if (!(viaSession || !Array.isArray(spec.machineClasses) ? spec.classes : spec.machineClasses).includes(cls)) {
      /* REC-159: a row carrying `machineClasses` judges a caller that did NOT arrive by a session
         against THAT list, so granting `member` to an enrolled administrator's session admits no
         MEMBER_TOKEN bearer (the four custodial ops' rows). One refusal, the same code and sentence. */
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
        /* D-463: WHETHER THIS CREDENTIAL CAN EVER REACH THE RECORD, answered as a value rather than left for a
           caller to infer from the `store` beside it. The two are different facts and an instrument needs both:
           `store` is where THIS call landed, `confinedTo` is where every call it will ever make lands. `null` is
           "not confined", which is the honest answer for a session (a member is not a confined credential) and
           for the four binding classes (an operator sets them in the hosting dashboard, and there is no row to
           carry the property — the probe class's confinement is its CLASS's, read out of `scopeFor`, and is
           reported as `store` on every one of its answers). */
        confinedTo: cls === "ai" && aiCred ? (aiCred.confinedTo ?? null) : null,
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
          /* D-126: the acts that take a SET under the `per-item` weight (affordances.mjs PER_ITEM_ACTS),
             decorated from the same tables as every act, with the bound the store enforces. */
          set_acts: PER_ITEM_ACTS.map((a) => ({ ...decorate(a), set_key: a.set_key, item_keys: a.item_keys,
                                               shared_keys: a.shared_keys, max_items: PER_ITEM_MAX })),
          detail: "pass target=<bundle id> for the acts available on that object right now; "
                + "rung is the weight ladder (vocabularies.rung_ladder, low to high, IRREVERSIBLE "
                + "at the top per DEC-19 with vocabularies.rung_correction_path beside it) and is "
                + "null only where the act carries a STATED absence — read rung_absence for the "
                + "ground, and vocabularies.rung_absence_grounds for what that ground means; "
                + "capture_acts are keyed by a capture sha rather than by a bundle, so they are "
                + "published with their metadata and never derived against an object's state; "
                + "set_acts take a selection as `items` under the per-item weight: each item is "
                + "applied or RETAINED with its own act's reason, and none stops the others",
        }, store: storeName, tokenClass: cls }, 200);
      }
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-25: the D-15 viewer stamp, server-side from the authenticated
         identity exactly as the passthrough reads take it below. An object the
         viewer may not see answers NO_SUCH_BUNDLE, identical to an absent one. */
      const affViewer = viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`;
      /* REC-132: D-310's owner fact is POSITIONAL, so it is asked of the identity.
         REC-134: an `ai` credential's identity is its PRINCIPAL here, as it is at every act the
         positional check reads (`POSITIONAL_ACTS` below) — a member-scoped key acts as its
         member and is refused where its member would be, so the pre-flight must ask the same
         member or it offers `cite`/`sever`/`reinstate` the act then refuses (DEC-8). The VIEWER
         (sight) is unchanged; an organisation-scoped key's principal is `class:ai` and answers
         null, byte-unchanged. */
      const affIdentity = viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`;
      /* REC-52: `(facts || { reason: "NO_FACTS" })` is site (b)'s shape with a
         different word — a store silence answering "there are no facts about
         that object", which is a claim about the object. What the acts on an
         object are is the whole of what this op is asked, so answering it out
         of a failure to ask would put a wrong set of affordances in front of a
         member. The store's own NO_SUCH_BUNDLE, and its 404, are untouched. */
      /* D-311: THE TWO ACT STAMPS, composed by the SAME expressions the acts receive them by —
         `author` as the object-directed acts' author stamp (a bearer is `token:<cls>`), `by` as the
         roster acts' `by` stamp (a bearer is `class:<cls>`, the `ai` class included, whose
         `identity` above is its member principal). The store asks the machine fences' predicate of
         the first and the roster predicates of the second, so the pre-flight asks each question of
         the caller the act will see. `d311-roster-affordances.test.mjs` pins these two expressions
         to the stamp sites' own text. */
      const affAuthor = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
      const affBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
      const fOut = await doAnswer(st.fetch(
        `http://do/affordancefacts?target=${encodeURIComponent(target)}&viewer=${encodeURIComponent(affViewer)}`
        + `&identity=${encodeURIComponent(affIdentity)}`
        + `&author=${encodeURIComponent(affAuthor ?? "")}&by=${encodeURIComponent(affBy ?? "")}`));
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
      /* R8, R9: provenance's report, each unresolved row probed in the working bucket (D-533's parts included). */
      return json({ ok: true, result: await registerAuditReport(aOut.result, typeof env.CAPTURES?.head === "function"
        ? { head: (sha) => env.CAPTURES.head(captureKey(storeName, sha)), get: (sha) => env.CAPTURES.get(captureKey(storeName, sha)) }
        : null), store: storeName, tokenClass: cls }, 200);
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
        /* REC-131 / IC-148: selftest RELAYS the store's stats — the same answer through a second
           door, under op=stats' one stamp: `dbBytes` for the admin class only (see op=stats). */
        const sOut = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName))
          .fetch(`http://x/stats?capacity=${cls === "admin" ? "1" : "0"}&viewer=${encodeURIComponent(
            viaSession ? sessViewer : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`)}`));
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
        /* REC-185 / D-278's class: C-61.1 through the ONE governed helper, so this site adds no row
           and the row's `where` keeps naming one span. The condition IS the argument complaint —
           `confirm` is missing or in a shape the op cannot use — and the shape it must take is the
           store name this request resolved to, which is why `expected` is kept beside it.
           `error` is passed in BYTE-IDENTICAL (D-270's pattern), so `purge.test.mjs`'s two arms and
           any script reading `error` move not at all. The helper's `detail` says NOTHING WAS CHANGED,
           which on the plane's one destructive op is the sentence a caller most needs. */
        return json({ ok: false,
                      ...requiredArgument("purge", "confirm", "<store name>",
                                          "purge requires confirm=<store>"),
                      expected: storeName,
                      got: confirm, tokenClass: cls, store: storeName }, 400);
    }

    if (op === "livefire") {
      const out = await livefire(env, storeName, { capacity: cls === "admin",
        viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}` });
      /* D-506 / IC-265, on BOB #32's ruling of 2026-09-24 06:07Z. This read `out.ok ? 200 : 500`, and
         `out.ok` WAS the canary's verdict — which is why a failing canary answered `ok:false` with no
         code of any kind to every consumer that reads `ok:false` as a refusal. `out.ok` is now
         `true` whenever the op answered, and the verdict lives in `out.verdict` / `out.failing`.
         THE STATUS IS KEYED TO THE VERDICT, so it is byte-for-byte what it was for every outcome: a
         DIST gate or a curl that reads the status alone loses nothing to this change, which is the
         whole point of moving the verdict to keys of its own rather than deleting it from the wire. */
      return json(out, out.verdict === "pass" ? 200 : 500);
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
      /* D-706 (T5-11, connections R26): the answer names capture shas and the target's bundle, so the store reads
         the source and every target through the D-15 viewer, decided here by the SERVER exactly as the stamp block
         below decides it (a member-scoped agent key stamps its principal), and fails CLOSED on an absent one.
         D-722 (connections R27): where the source bundle is a PROJECT the store asks REC-134's JOINED test, as `cite`
         does, of the POSITIONAL identity. This handler builds its own store request and returns above that block,
         so it stamps both here, by the same expressions. */
      const linkViewer = viaSession ? sessViewer : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`;
      const linkIdentity = viaSession ? sessIdentity : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`;
      const p = await doAnswer(st.fetch(`http://x/projectlinks?capture=${capture}`
        + (bundle ? `&bundle=${encodeURIComponent(bundle)}` : "") + `&viewer=${encodeURIComponent(linkViewer)}`
        + `&identity=${encodeURIComponent(linkIdentity)}`));
      if (!p.answered) return storeSilent("linkproject");
      return json({ ok: true, ...p.result });
    }

    {
      const g = await governorOp(op, url, () => env.STORE.get(env.STORE.idFromName(storeName)));
      if (g) return g.silent ? storeSilent(op) : json(g.body, g.status);
    }

    if (op === "links") return linksOp(url, env.STORE.get(env.STORE.idFromName(storeName)),
      { json, storeSilent, viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}` });

    if (op === "capture") return captureObjectOp(req, url, env,
      { json, storageAbsent, requiredArgument, key: (s) => captureKey(storeName, s), storeName, cls });

    /* R31–R35: op=pdfstructure is extraction's; the control plane stamps who asks. */
    if (op === "pdfstructure") return pdfStructureOp(url, env, env.STORE.get(env.STORE.idFromName(storeName)),
      { json, storeSilent, storageAbsent, requiredArgument, cls, session: viaSession, caps: sessCaps,
        viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`,
        author: viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`, storeName });

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
    if (op === "archivelookup") return archiveLookupOp(req, url, env.STORE.get(env.STORE.idFromName(storeName)), { json, storeSilent });

    if (op === "acquire") {
      /* K72 (8), (11): the acquisition is capture's service in the Durable Object; this op forwards to it and then
         runs the reading block below over what it filed, until `extraction` takes the block (K49). */
      const acquired = await acquireOp(req, env, env.STORE.get(env.STORE.idFromName(storeName)),
        { json, storeSilent, storageAbsent, cls, member: viaSession, sessMember, storeName });
      if (acquired.response) return acquired.response;
      const read = await acquireReadingOp(acquired.answer, env.STORE.get(env.STORE.idFromName(storeName)), { storeSilent, storeName });
      if (read.response) return read.response;
      return json(Object.assign(read.body, { note: ACQUIRE_GRADE_NOTE }), 200);
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
        return storageAbsent(op, "this instance has no evidence storage configured");
      // R31–R33: provenance's `attest`, over the working bucket by digest, the network, and the store's register and
      // receipts (D-476's `registerholds`, which answers whether a receipt or the register names the hash).
      const body = await req.json().catch(() => null);
      const attested = await attest(body || {}, {
        head: (sha) => env.CAPTURES.head(captureKey(storeName, sha)),
        put: (sha, bytes) => env.CAPTURES.put(captureKey(storeName, sha), bytes, { sha256: sha }),
        fetch: (...a) => fetch(...a),
        holds: async (sha) => {
          const hOut = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName)).fetch(
            `http://x/registerholds?sha256=${encodeURIComponent(sha)}`));
          return hOut.answered ? hOut.result : null;
        },
      });
      return json({ ...attested, store: storeName, tokenClass: cls }, attestStatus(attested));
    }

    if (op === "monitor") return monitorOp(req, env.STORE.get(env.STORE.idFromName(storeName)), { json, storeSilent, requiredArgument, viewer: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`, actorClass: viaSession ? "member" : "machine", actor: viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`, storeName, cls });

    const stub = env.STORE.get(env.STORE.idFromName(storeName));

    if (op === "caseratify") return caseRatifyOp(req, stub, { env, json, doAnswer, storeSilent, assembleCaseContainer, storeName, cls, aiCred, viaSession, sessViewer, sessRights });
    if (op === "ratify") return ratifyOp(req, stub, { env, json, doAnswer, storeSilent, assembleCaseContainer, storeName, cls, aiCred, viaSession, sessViewer, sessRights, captureKey, withBiasChecks, STORE_SILENT_REASON, STORE_SILENT_DETAIL });

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
    /* D-681 (T5-11): `leadlist` joins, `leadread`'s reach asked of the same positional stamp. */
    const IDENTITY_READS = ["leadlook", "leadread", "leadshare", "leadlist", "frontier"];
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
                                "strengthbarof",
                                /* REC-149: the setting's read and the directory decide by the caller's SIGHT
                                   (Membership v2 §7.14), so both take the stamp; each fails closed without it. */
                                "projectvisibility", "projectdirectory",
                                /* REC-196: the roster read names a project by its own id, so the store needs the
                                   caller's SIGHT to answer C-70.1 at EXISTENCE (BOB #32's ruling (a)). Its own
                                   answer still reads the `by` stamp below; the viewer is read only by that check. */
                                "projectparticipants",
                                /* REC-150: the requests read decides by the caller's SIGHT of the project it
                                   names (C-70.1 at EXISTENCE, the absent answer at NONE), so it takes the stamp. */
                                "projectrequests"];
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
        /* D-419 (T5-11): the crop resolves ONE content row by id, so it takes op=content's stamp for op=content's
           reason, and the store answers an invisible row exactly as an absent one (NO_SUCH_CONTENT). */
        || op === "contentcrop"
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
        /* REC-139 / D-428: the three RUN VERBS state how many projects draw on the run's question
           (`projectGate.projects`), and that count may include only projects the caller can SEE
           (Membership v2 §7, BOB #15). The stamp is what the store counts in; DEC-63's verdict is
           not read from it. Fails closed on an absent stamp: no project is stated, never every one. */
        || RUN_VERB_ACTIONS.includes(op)
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
        /* D-394: the notice names the question or passage asked about AND the
           newer version it found, so both are gated: the subject through
           `#viewerSees` and the chain through `versionChain`'s own gate. Fails
           closed on an absent stamp, like the chain it reads. */
        || op === "versionnotice"
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
        /* REC-161: the proposed-partition independence read names the same
           QUESTION and the documents its reasons rest on, so it takes the same
           stamp; the store gates the inquiry ONCE, before any leg is read, and
           fails closed on an absent stamp. */
        || op === "partitionindependence"

        /* PL-12 / D-84: a project-scoped manifest names a PROJECT bundle, and
           the adopted bias bundles are bundles too, so a caller who may not see
           the project must be answered exactly as they are for a project that
           does not exist — REC-25/REC-30's leak arriving at the lens. The store
           gates through the same `#bundleGate` every read here compiles and
           fails closed on an absent stamp, like every op in this list. */
        || op === "biasmanifest"
        /* REC-207: the bias-debt READ names a RUN and its answer names the run's context, so it takes the
           same fail-closed stamp its three run-read siblings do — a debt on a run the caller was never
           invited to must be absent byte-identically to a run that never carried one. And the RESOLVE
           takes it too, because its refusal is asked through the SAME `#bundleGate`: an unseen debt and an
           absent one are deliberately one answer, which they cannot be if the gate is not stamped. Fails
           closed on an absent stamp, like every op in this list. */
        || op === "biasdebt" || op === "biasdebtresolve"
        /* REC-149 (Membership v2 §7.14): the two acts that name a project and took no viewer — a bias set adopted
           into a project's scope, and a review copy's draft under a project. Each asks the stamp ONLY for
           EXISTENCE (a discoverable project, a member outside it: C-70.1); every other caller's answer is
           unchanged, because each act's own fence already answers without it. */
        || op === "biasadopt" || op === "casedraft"
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
        /* T6-13 (capture-requests R42): the retry names a request and the question it was asked under, so the store
           asks this viewer's sight of it and answers an unseen request as an absent one. Fails closed on an absent
           stamp. */
        || op === "capturerequestretry"
        /* T6-13 (intent R23): every one of intent's reads and acts names a project, a goal or an aspiration, and each
           answers one the viewer may not see exactly as an absent one, so all seventeen take the stamp. */
        || INTENT_ACTIONS.includes(op) || INTENT_READS.includes(op)
        /* T6-13 (reevaluation R9, R14–R16, R20): the notices and the pull read name findings and passages, and the three
           acts name a notice or a dependent, each seen through its holder; an unseen one answers as absent. */
        || op === "reevaluationnotices" || op === "reevaluationchanges" || REEVALUATION_ACTIONS.includes(op)
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
        /* REC-147: the candidate write re-forms the pairs AS THIS VIEWER (§6) and pairs only what the viewer may
           see, so it needs the viewer exactly as `contradictionpairs` does. Fails closed on an absent stamp. */
        || op === "contradictionpropose"
        /* REC-86: NARROW and its candidate read both NAME A QUESTION and read
           its readings, so a question the caller was never invited to must
           answer exactly as one that does not exist — the version acts' reason
           one screen up. Fails closed on an absent stamp. */
        || op === "narrow" || op === "narrowcandidates"
        /* REC-122: choosing a connection's on-point mention NAMES A DOCUMENT (the end
           chosen on), so a document the caller was never invited to must answer exactly
           as a connection that does not exist (C-74.2). Fails closed on an absent stamp. */
        || op === "connectionchoose"
        /* T5-11 (K145, connections R53–R57): each names a document or a capture — the two ends asserted, a
           document's asserted connections, an agenda capture, a stored containment's two ends — so a document the
           caller was never invited to answers exactly as one that does not exist. Fails closed on an absent stamp. */
        || op === "connectionassert" || op === "connectionsasserted" || op === "filemembershipstore"
        || op === "filemembership" || op === "filemembershipjudge"
        /* REC-146: THE PAIRING READ names no single object and is gated for a wider
           reason than the two above — it ENUMERATES, across every question and every
           cited document, and section 6 of its design requires it to pair only what
           the viewer may see and never to enter a project's contents uninvited. An
           absent stamp therefore fails CLOSED to `scope: DENY`, and the answer SAYS
           it compared nothing rather than reading as a record with no conflicts. */
        || op === "contradictionpairs"
        /* D-148: the quote read ENUMERATES across actions by counterparty, so it
           reads only what the viewer may see and fails CLOSED on an absent stamp. */
        || op === "actionquotes"
        /* REC-198: the LIST of a project's drafts NAMES A PROJECT and enumerates its working material, so a
           project the caller cannot see must answer exactly as one that does not exist — and the single read of
           a draft answers such a caller `#noReviewCopy`, so the list does too (BOB #32: fenced exactly like it).
           Fails closed on an absent stamp. */
        || op === "casedrafts"
        /* REC-87: all three TRANSCRIBE ops name a DOCUMENT (the act) or a content
           row filed in one (the attestation and the read), so a document the
           caller was never invited to must answer exactly as one that does not
           exist — `contentmint`'s and `content`'s reason. Fails closed on an
           absent stamp. */
        || op === "transcribe" || op === "transcriptionattest" || op === "transcription"
        /* T5-11 (content R43, K134): attesting a capture's text names the bundle the capture is filed in, so the
           store asks the viewer before it records anything and answers a capture filed where the caller cannot see
           exactly as one this record has not read (NO_READING); it fails closed on an absent stamp. The attestor
           is stamped below, by its own rule. */
        || op === "attesttext"
        /* MK-4: the look and the read name a LEAD, readable by its author only,
           and the look names what it found (a capture or a content row), which is
           gated like every other reference to a document. Fails closed on an
           absent stamp. */
        || op === "leadlook" || op === "leadread" || op === "leadshare" || op === "leadlist"
        /* D-162: a THEME's placement acts and its read NAME A DOCUMENT (or a passage
           of one), so a document the caller was never invited to must answer exactly
           as one that does not exist — `contentmint`'s reason. Fails closed on an
           absent stamp. */
        || op === "themeplace" || op === "themepropose" || op === "themeread" || op === "themewithdraw"
        /* REC-203: a PAIR judgement names two CAPTURES and reads where the record retrieved each, so a
           document the caller was never invited to must answer exactly as one the record does not hold
           (C-91.3) — `contentmint`'s reason. Fails closed on an absent stamp. */
        || op === "idmatch"
        /* REC-195: the governing-law proposal NAMES AN ACTION and reads it behind the fail-closed gate before
           it writes anything, so an action the caller may not see refuses NO_SUCH_BUNDLE identically to an
           absent one — `ACTION_ACTIONS`' own reason, arriving at an op that is not one of them. */
        || op === "actionlawspropose"
        /* D-464: the COUNTS. Every counter `op=stats` serves names rows, and a row naming a project the caller
           cannot see is that project's existence (§7.9) — so the counts are taken through the caller's own
           sight, and fail closed on an absent stamp. `op=selftest` relays the same answer and stamps the same
           viewer at its own fetch. */
        || op === "stats"
        /* D-464: `op=selectionlist`'s `bytes` sums every owner's selection rows, so it takes the same stamp. */
        || op === "selectionlist"
        /* D-525: the Drive shell sweep walks `bundles` and names bundle ids, so it takes
           op=index's stamp for op=index's reason (REC-25): an invisible bundle is not walked. */
        || op === "driveshells"
        /* REC-138 / D-426: the ROSTER acts name a project, so one the caller cannot see must
           answer exactly as one that does not exist — asked of SIGHT before any positional test
           (`Store#inSight`). `by` (below) stays the positional half; this is the visibility half.
           ONE DIFFERENCE from the rest of this list, stated at `Store#rosterInSight`: the store
           treats a viewer that was never SENT as a direct internal call and does not ask, on
           `#projectAuthority`'s absent-identity precedent — so this stamp is load-bearing, and the
           `roster-stamp-dropped` control arm measures what removing it discloses. */
        || PROJECT_ACTIONS.includes(op)
        /* N85's other half (membership R19, K124): which pairings a caller may see is asked of its viewer — a
           member sees its own unpublished pairing — beside the administer stamp below. Without either the store
           answers the published pairings alone (fails closed). */
        || op === "memberpairings"
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
    /* REC-131 / IC-148: THERE IS NO `operator` STAMP ON op=stats ANY MORE — every COUNT is the same for
       every class (`MEMBER-KNOWLEDGE-DESIGN.md` §5, BOB #15), and a caller's `operator=` is not read.
       What remains is `capacity`, which governs `dbBytes` ONLY (the admin class's: capacity is an
       operator need, and the figure moves in whole pages on every write, a lead's included). Set by
       the SERVER from the class that authenticated, AFTER the caller's parameters were copied, so a
       caller's `capacity=1` is overwritten. `admin` is the ADMIN_TOKEN class and the ROOT-admin
       session; an admin-ROLE member signs in as class `member` and does not receive it. */
    if (op === "stats") inner.searchParams.set("capacity", cls === "admin" ? "1" : "0");
    if (op === "memberlist")
      inner.searchParams.set("administer",
        (viaSession ? !!sessRights.administer : cls === "admin") ? "1" : "0");
    /* N85's other half (membership R19): an administrator sees every pairing, published or not — memberlist's stamp,
       by memberlist's expression. */
    if (op === "memberpairings")
      inner.searchParams.set("administer",
        (viaSession ? !!sessRights.administer : cls === "admin") ? "1" : "0");
    /* BOB #32 (2026-09-24), D-162's theme readings: THE SAME STAMP, on the same rule and for the same
       reason. Every theme act and read names a declarer, a placer or a proposer; a reader who does not
       administer is shown the HANDLE alone, and the member id and cover go to administrators only
       (Membership v2 §3; MK-6's precedent). The store fails closed on an absent stamp. */
    if (op === "themedeclare" || op === "themeplace" || op === "themepropose" || op === "themeread"
        || op === "themewithdraw")
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
    /* MK-7 — WHO CHOSE THE ATTRIBUTION, stamped on `testify`'s rule: the store compares it with the
       observation's registered author, so a caller-supplied chooser would be a way to choose for somebody
       else. A machine credential stamps `class:<cls>`, refused BY NAME (C-92.1). Never the principal. */
    if (op === "attribute")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-162 / IC-241 — WHO DECLARED THE THEME, WHO PLACED IN IT, WHO PROPOSED, stamped on
       `lead`'s rule one stamp up (§8.4 fence 1: declared under the member's own name, never a
       caller's field). A machine credential stamps `class:<cls>`, which the store refuses BY NAME
       for a declaration (C-81.2) and a placement (C-81.7) and RECORDS for a proposal — the hunch
       is attributed to the credential that proposed it. */
    if (op === "themedeclare")
      inner.searchParams.set("declarer", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (op === "themeplace")
      inner.searchParams.set("placer", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T5-11 (connections R43): WHO WITHDREW OR REJECTED, stamped on `themeplace`'s rule; the store compares it with
       the placer (or the administer stamp) and refuses a machine stamp BY NAME (C-81.11). */
    if (op === "themewithdraw")
      inner.searchParams.set("actor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-162: WHO PROPOSED A PLACEMENT. Any credential may propose (the result is a hunch, graded C,
       never membership), so the only obligation here is NAMING: a session stamps its signed-in id, a
       machine stamps `class:<cls>`, and the `ai` class stamps its tokenId beside its class —
       `extractpropose`'s form — so a hunch stays attributable to the exact key that proposed it.
       Never the principal a key was minted for, which would put an assistant's hunch under a
       person's id. */
    if (op === "themepropose")
      inner.searchParams.set("proposer",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-195 / D-149: WHO PROPOSED AN ACTION'S GOVERNING LAWS, stamped on the line above for its reason
       exactly. Any credential may propose — the plane LABELS a proposal rather than fencing it — so the only
       obligation here is NAMING: a session stamps its signed-in id, a machine stamps `class:<cls>`, and the
       `ai` class stamps its tokenId beside its class, so a proposal stays attributable to the exact key that
       proposed it. Never the principal a key was minted for, which would put a machine's citations under
       somebody else's id. A caller-supplied `proposer` is overwritten rather than honoured: the label is the
       whole product and a label a caller can write is not one.
       THE PROSE HERE DELIBERATELY CLAIMS NO PERSON-ONLY CONSTRAINT, and that is not style:
       `identity-claims.mjs` reads a stamp site's own comment for a claim that only a signed-in person may
       write the field, and grades it a DEFECT where nothing refuses a machine identity. Nothing refuses one
       here BY DESIGN — D-149 says the machine MAY propose — so a comment claiming otherwise would be the
       instrument reading this site correctly. The fence is one op up, at the act that SETS the list. */
    if (op === "actionlawspropose")
      inner.searchParams.set("proposer",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
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
    /* REC-147: the contradiction candidate's proposer is the same server-side stamp, for the same reason. */
    if (op === "extractpropose" || op === "contradictionpropose")
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
        /* REC-122: the name that goes against "this mention is the one on point for this
           connection". Overwritten rather than honoured, so the store refuses a machine BY
           SHAPE (C-74.1). Placed ABOVE `VERSION_ACTIONS` and not beside `narrow` below: the
           versionstate suite pins FENCE LAYER 1 by the span from `VERSION_ACTIONS` to this
           stamp, and a new op is not a reason to lengthen that span. */
        || op === "connectionchoose"
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
    /* T5-11 (K145, connections R53, R57): the member who asserts a connection, and the member who confirms or rejects
       a stored containment, stamped on `connectionchoose`'s rule by its expression and in a statement of its own so
       the span pinned above is not lengthened. A caller's `author` is overwritten; a machine arrives honestly named
       and the store refuses it BY SHAPE (CONNECTION_ASSERT_NOT_A_MEMBER, FILE_MEMBERSHIP_NOT_A_MEMBER). */
    if (op === "connectionassert" || op === "filemembershipjudge")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* T6-13 (reevaluation R15, R16): the member who adopts a newer version, keeps the earlier one, or records a
       re-evaluation, stamped by the version acts' expression (`VERSION_ACTIONS`' author above), which reevaluation reads
       from the query after the body; a caller's `author` is overwritten, and a machine arrives honestly named, refused
       BY NAME at the store (MACHINE_CANNOT_ADOPT_VERSION, MACHINE_CANNOT_KEEP_VERSION, MACHINE_CANNOT_RECORD_REEVALUATION). */
    if (REEVALUATION_ACTIONS.includes(op))
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* REC-134 / C-56 — SIGHT IS NOT AUTHORITY (Membership v2 §7, BOB #15): the acts that change
       a project and took the VISIBILITY gate as their only barrier (or none) now ask the actor's
       OWN POSITION in that project, and the store reads that position from THIS stamp — the
       POSITIONAL identity, never the viewer. A session stamps `resolveSession`'s identity
       (`member:<id>`, the founder's `member:admin`); a member-scoped `ai` credential stamps its
       PRINCIPAL, so an agent is refused exactly where its member would be (D-199 (4)'s rule for
       sight, applied to acts); every instance credential stamps `class:<cls>`, which holds no
       roster position and is not asked — machine fences are their own and unchanged. The caller's
       `identity` was DELETED for every op above, so nothing here can be named by a caller.
       A new act on a project joins POSITIONAL_ACTS; the suite's arms read it through the ops. */
    if (POSITIONAL_ACTS.includes(op))
      inner.searchParams.set("identity",
        viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-587 (T5-11, calibration R5, K136): WHO MEASURED is the control plane's stamp and never the body's — a session
       its member, a machine credential `class:<cls>`, an `ai` credential its principal — by the identity stamp's own
       expression. The store records it as `measured_by` and refuses an empty one CAL_UNATTRIBUTED (C-42.8). */
    if (op === "calibrate")
      inner.searchParams.set("identity",
        viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* DEC-49 REGION is-operator-governance-act — D-136, applying D-421's ruling
       (BOB #14, C-32.14 / C-32.15) to the acts §4.7 and §4.9 assign to a named
       administrator. *The signature proves who AUTHORISED; the credential that
       delivers it decides WHEN the record changes, and the record names the
       actor.* A §4.7 vote is the same shape with the signature replaced by a
       roster position: a bearer token held in the hosting account is not the
       administrator it would name.
       WHY A FENCE AND NOT ONLY THE STAMP BELOW. The stamp alone already refuses
       a bearer caller — its `by` becomes `class:<cls>`, which matches no roster
       row, and the store answers NOT_AN_ADMIN. That refusal is CORRECT and its
       SENTENCE IS FALSE: it tells the operator that some member is not an
       administrator when the fact is that a token is not a person, and
       `NOT_AN_ADMIN` carries no canned translation to say otherwise. DEC-49's
       rule is that a refusable condition says what is true, so the honest answer
       gets its own code and its own sentence here, in front.
       THE TWO LAYERS ARE BOTH LOAD-BEARING AND THE CONTROL BREAKS EACH WITH THE
       OTHER HELD OPEN (`adminvote.control.mjs` arms `fence-dropped` and
       `stamp-dropped`): with the fence gone the stamp still refuses, with the
       stamp gone the fence still refuses, and only removing BOTH lets a caller
       name the voter. A single layer would be a fence nobody could prove was
       doing anything.
       THE PREDICATE IS HOW THE CALLER ARRIVED, NOT WHICH TOKEN IT HELD —
       C-32.14's own shape. `viaSession` is set only by the session lookup in the
       admission block, so this covers ADMIN, MEMBER and PROBE today and any
       binding added tomorrow, and no token string or class list appears here to
       go stale. The refusal NAMES the class, so an operator learns which of its
       credentials was refused.
       THE PRECONDITION WAS MEASURED BEFORE THIS LINE WAS WRITTEN: no surface,
       script, tool, installer or DIST procedure submits any of the three with a
       bearer token — `civicos-ui` sends no act op from the members screen at all
       (D-134's surface is deliberately not built yet), and the only bearer
       drives in the tree were two suites asserting the pre-item behaviour, both
       corrected here with their reasons at the site. Capabilities are still set
       at INVITATION time through `op=memberadd`, which is untouched, so nothing
       in the bootstrap path depends on a bearer capability edit. */
    if (GOVERNANCE_ACTIONS.includes(op) && !viaSession)
      return json({ ok: false, reason: "OPERATOR_TOKEN_CANNOT_GOVERN",
        ...machineFenceRow("OPERATOR_TOKEN_CANNOT_GOVERN"), op, tokenClass: cls,
        detail: `section 4 governance is a named administrator's own act, delivered through that `
              + `administrator's own signed-in session. The credential that asked is the operator's `
              + `\`${cls}\`-class bearer token, which holds no position on the roster: it cannot be `
              + `one of the administrators whose consensus §4.7 requires, and a vote it delivered `
              + `would be attributed to whoever the caller named. Sign in as the administrator and `
              + `do it there (D-136, applying D-421).` }, 403);
    /* END DEC-49 REGION is-operator-governance-act */
    /* REC-164 — THE SAME FENCE FOR THE GROUP'S PUBLIC IDENTITY (Publication §7 points 2 and 3), with its OWN code
       and sentence, because C-32.17's names the §4 votes. The predicate is how the caller ARRIVED, never which token
       it held, so every bearer class is refused and one added tomorrow is too. */
    /* DEC-49 REGION is-group-identity-session */
    if (IDENTITY_ACTIONS.includes(op) && !viaSession)
      return json({ ok: false, reason: "GROUP_IDENTITY_NEEDS_SESSION",
        ...identityFenceRow("GROUP_IDENTITY_NEEDS_SESSION"), op, tokenClass: cls,
        detail: `the group's display name and its domain claim are set by a named administrator's own signed-in `
              + `session, and the record names who set each one (Publication §7). The credential that asked is the `
              + `operator's \`${cls}\`-class bearer token, which holds no place on the roster. Nothing was changed.` }, 403);
    /* END DEC-49 REGION is-group-identity-session */
    /* Who is acting on a project's roster is decided by the SERVER. Set after
       the caller's parameters were copied, so a caller-supplied `by` is
       overwritten rather than honoured: "only an owner may remove" is worth
       nothing if the caller names who they are. A machine credential says
       plainly that it was a machine, which matches no participation row and no
       administrator, so it is refused by the store rather than let through. */
    /* D-136 adds `GOVERNANCE_ACTIONS`, and it is THE SAME SENTENCE one section
       out: the comment above says *"only an owner may remove" is worth nothing
       if the caller names who they are*, and §4.7 read against it says **"every
       subsequent addition requires the consensus of all existing
       administrators" is worth nothing if the caller names who consented.**
       The store already ASKED for `by` on `adminEndorse` and `adminRemove` and
       checked it against the live administrator roster — the check was whole and
       the INPUT was the caller's, which is the shape a fence acquires when
       nobody supplies its subject. `memberCaps` gains the same argument and the
       same check in this landing, so the stamp is READ on all three rather than
       being recorded and trusted. */
    /* REC-156 adds `memberadd` — D-136's sentence in the one op that ruling did
       not name. `Store#memberAdd` WRITES the proposer's `admin_votes` ('add') row
       when an addition needs §4.7's consensus, and the voter it wrote was whoever
       the caller put in `by`, so a proposal could carry one endorsement in another
       administrator's name. Now the SERVER names the proposer, and the store's
       relay reads it from the query, never the body: a proposal records its
       proposer's own endorsement and nobody else's.
       ITS OWN DISJUNCT, NOT `GOVERNANCE_ACTIONS`: that array also spreads
       MEMBER-set reach and the operator fence, and REC-156 moves neither.
       A SESSION stamps its member — the FOUNDER'S (`admin`), because
       `SESSION_OPS.admin` is the only set holding this op, and the store counts
       the founder an administrator only where a claim was spent. A BEARER stamps
       `class:<cls>`, which is on no roster: it opens a proposal and endorses nothing.
       **PROVISIONAL, AND BOB'S TO RULE: a bearer reaching `memberadd` is NOT
       refused** the way C-32.17 refuses one at the three ops above. MEASURED
       before choosing (MEASUREMENTS M-84): 99 battery suites, five probes and
       FLEET's live VF-4 run create their members through a bearer `memberadd`;
       `setup.mjs`, the one non-test caller, posts with the founder's SESSION.
       With this stamp a bearer's `by` names nobody, and what the op still does for
       one — an invitation, §4.2's second administrator, a proposal awaiting every
       administrator — attributes no act to any administrator and is the
       ADMIN_TOKEN holder's by §4.6. C-32.17's sentence (*"a vote it delivered
       would be attributed to whoever the caller named"*) would be FALSE here,
       which is D-270's class. REVERSING IT costs one disjunct on the fence above
       and a founder-session fixture for every caller named in M-84. */
    /* REC-159 widens REC-156's disjunct from `op === "memberadd"` to the four §4.9 custodial acts,
       one expression still: a session stamps its member — now an ENROLLED administrator's too — and
       a bearer `class:<cls>`, which the store records as the operator's credential and never as a
       person. `memberset`, `signeradd` and `signerset` write the stamp into the row they change
       (`status_by`); the store refuses a member-named `by` that is not an active administrator. */
    if (PROJECT_ACTIONS.includes(op) || GOVERNANCE_ACTIONS.includes(op)
        || op === "projectparticipants" || op === "projectownerarith"
        || CUSTODIAL_ACTIONS.includes(op))
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-150: whose requests to join a caller reads — its own, or a project's as its owner or an administrator — is
       a POSITIONAL question, so `op=projectrequests` takes the server's `by` exactly as projectparticipants does, by
       the SAME expression. A statement of its own rather than a disjunct above, `IDENTITY_ACTIONS`' precedent below:
       that condition is pinned as one expression by adminvote.test and anchored by adminvote.control, and it sits at
       its pin's bound. */
    if (op === "projectrequests")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* N43: membership's R10, R11 and R19 acts take the server's `by` by the same expression, in a statement of their
       own for the reason just given; the store's relays read it from the query after the body, so a caller's `by`
       names nobody. */
    if (ROSTER_SELF_ACTIONS.includes(op))
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-164: the setter of the group's display name or domain is the SERVER's stamp — set after the caller's
       parameters were copied, so a caller's `by` is overwritten rather than honoured, and the store asks the roster
       for an active administrator (C-64.5). `origin` is stamped the same way: the address the administrator's
       session reached is the instance address the domain's well-known file must name, never one the caller types. */
    if (IDENTITY_ACTIONS.includes(op)) {
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
      inner.searchParams.set("origin", url.origin);
    }
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
    /* REC-152 (Membership v2 §7, "WHO MAY TICK AND CLOSE A RUN", BOB #16): THE SAME STAMP ON THE TICK AND
       THE CLOSE, because they are the run's PRINCIPAL's acts and the store compares the caller with the
       principal the OPEN stamped — so both sides of that comparison must be composed by ONE expression, or
       a member and her own credential could stop being recognised as one principal by a spelling drift.
       SET, never appended: a `principal` the caller put in its own query is overwritten here, and the
       store reads it as `caller` only from this stamp (a principal a caller can name is not one).
       REC-165 (§11 item 5 rule 1, BOB #25): THE SAME EXPRESSION FOR THE RUN'S TWO PRODUCTIONS, so a suggestion
       and a proposed reading are compared with the run's principal in the one form the open stamped. */
    if (RUN_VERB_ACTIONS.includes(op) || RUN_PRODUCTION_ACTIONS.includes(op))
      inner.searchParams.set("principal",
        viaSession ? sessIdentity
        : cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T6-13 (capture-requests R42, K181 (6)): the retry's caller, by the same expression, in a statement of its own —
       a retry is not a production of a run, so it does not join RUN_PRODUCTION_ACTIONS. */
    if (op === "capturerequestretry")
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
        /* D-526 (`BIO_Case_Making_v0_1.md` §2; D-510, C-86.1): WHAT THIS PROMOTION IS, derived ONCE from the bytes
           the caller sent — the document's own `object_type` through the catalogue's `normalizeType`, the envelope's
           only where the document states none — exactly as `promote` derives it in the store. The three gates below
           that ask it (the migration-replay admission, `create_projects`, D-78's `surfaced_by` restamp) asked the
           ENVELOPE, and an envelope is legal with no type at all: measured on 8bdf20e6, a member without
           `create_projects` created a project by leaving the type out, and a member's question kept the
           `surfaced_by: agent` its bytes claimed. A contradicting envelope is still refused, by the store
           (ENVELOPE_TYPE_DISAGREES); here it only stops deciding which gate a caller meets. */
        const promotedType = (() => {
          const md = Array.isArray(b.files) ? b.files.find((f) => f && f.path === "bundle.md") : null;
          const fm = md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null;
          const said = fm && typeof fm === "object" ? fm.object_type : undefined;
          if (typeof said === "string" && said.trim() !== "") return normalizeType(said);
          return b.meta && typeof b.meta === "object" ? normalizeType(b.meta.object_type) : undefined;
        })();
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
        /* REC-134 / C-56: the POSITIONAL identity a revision of a PROJECT's document is checked
           against (the actor must have joined it, §7.5) — `POSITIONAL_ACTS`' stamp, in the body
           because promote's payload is a body. Deleted first and set second, every credential:
           a session its identity, an `ai` key its principal, an instance credential its class
           (no roster position, not asked). */
        delete b.actorIdentity;
        b.actorIdentity = viaSession ? sessIdentity
          : cls === "ai" ? aiCred.principal
          : `${MACHINE_CLASS_PREFIX}${cls}`;
        /* REC-138 / D-426: and the VISIBILITY half beside it, so a revision of a project the actor
           cannot see answers exactly as a revision of one that does not exist (ABSENT), asked
           BEFORE the positional check. The same three arms as the viewer stamp on every gated op:
           the founder's is the administrator viewer, an `ai` key its principal. Deleted first. */
        delete b.actorViewer;
        b.actorViewer = viaSession ? sessViewer
          : cls === "ai" ? aiCred.principal
          : `${MACHINE_CLASS_PREFIX}${cls}`;
        /* D-85 (INVESTIGATIVE-SESSION.md §11 item 5, rule 2, BOB #25): AN ASSISTANT OPENS A QUESTION ONLY INSIDE A
           RUN IT HOLDS. The store asks that of a creation carrying THIS stamp, and only an `ai` credential carries
           it: a member's creation is untouched. It is the run's principal stamp in the ONE form `RUN_PRODUCTION_ACTIONS`
           uses (`<principal>/<tokenId>`), so `runPrincipalGate` recognises a member and the credential she minted as
           one principal by the same expression the run verbs are compared with. Deleted FIRST for every caller, so a
           session that sends one is not taken for an assistant and an assistant cannot name someone else.
           REC-171 (§11 item 5, "Rule 2's reach", BOB #30): THE RULE BINDS THE SURFACING ACT, NOT THE `ai` CLASS. Every
           creation that did not arrive through a member's session is the one D-78 stamps `surfaced_by: agent` below —
           an admin, member or probe DEPLOY TOKEN's included, which has no member behind it — so every such caller
           carries the stamp, composed by the run verbs' OWN expression (`class:<cls>` for a deploy token, the same
           string `op=airunopen` stamped as the run's principal), and `runPrincipalGate` compares it unchanged. The
           condition is `!viaSession` and never a list of classes: a class added later is asked, not exempted. The
           alternative — restamping a deploy token's creation `human` — would invent a person, and is not done. */
        /* REC-173 (§11 item 5, "A MIGRATION IS A REPLAY, NOT A SURFACING", BOB #30): A THIRD CASE, ADMITTED BY WHAT THE
           SERVER CAN CHECK. A creation of an inquiry is a MIGRATION REPLAY when (1) it arrives under the ADMIN class —
           the root of trust, a deploy token and never a session — and (2) `migrationReplayOf` finds the registered,
           held drive-provenance capture it names listing this bundle id and this `bundle.md` SHA-256. A replay is
           (a) exempt from rule 2 — no surfacing happens on this plane, so no `assistantPrincipal` is stamped; (b) NOT
           restamped by D-78 below — its Drive-era `surfaced_by` is kept, because a server-verified replay of recorded
           bytes is not a caller's assertion; and (c) recorded by the store as migrated, so its read states `not
           recorded (migrated from the Drive era)`. `migrationReplay` is the SERVER's stamp: deleted first for every
           caller, set only here. A verified replay is a replay: `replay` is set with it, so no creation-time stamp
           (D-436's group) rewrites the bytes the provenance lists. Anything failing (1) or (2) falls through to the
           ordinary creation unchanged. */
        /* D-511 (§11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S", RULED 2026-09-24 by BOB #33 on
           D-505's finding), STEP (1), THE FENCE. `replay` exempts a promotion from every SHAPE fence `promote` has —
           the gathering grammar, the inquiry and action basis arms, the correspondence arms, the bias arm, the
           creation-time group stamp, and C-32.19's rule that no machine writes a member's `risk_tier`. The exemption
           is right for what it is FOR: a replay re-states the record's own past verbatim, and that past predates the
           fences. But the flag ARRIVED IN THE REQUEST BODY and nothing removed it, so any caller could hand itself
           the exemption. MEASURED by D-505 through op=promote (`risk-tier.test.mjs` §7 arm (ix), now INVERTED): a
           MEMBER-class deploy token sending `replay: true` landed `risk_tier: 1` — "file freely" — on an action
           nobody assessed, and `op=projection` published it. A provenance hop a caller can hand us is one a caller
           can invent (`CLAUDE.md` §5), which is the reasoning `migrationReplay` below already answers one field over.
           THE CONDITION IS THE ADMIN CLASS WITH NO SESSION, AND BOTH HALVES ARE LOAD-BEARING. Admin is the only class
           `migrate.mjs` uses (it narrowed to admin at REC-173, and refuses to run under any other), so the migration
           is untouched. `!viaSession` is there because the session block above sets `cls = kind` from
           `sess.role === "admin"`, and the FOUNDER'S OWN SESSION — the one whose stored role is the literal `admin`
           (`Store.ROOT_ADMIN`, `rootOfTrust: true`), minted by `op=claim` and `op=login` — therefore arrives as
           `cls === "admin"` exactly as the deploy token does. A person signed in at a browser is not the root of
           trust, which is the distinction `op=export` draws in this file in the same words. MEASURED, because the
           first draft of this comment said an ADMIN-ROLE MEMBER's session arrives that way too and that is FALSE:
           a member login stores `member:<id>`, so her class is `member` and `m.role === "admin"` decides only her
           capabilities (`Store#sessionRights`). `risk-tier.test.mjs` §8's REACH arm asks `op=whoami` for all four
           callers rather than asserting any of it, and this section's control caught the error. Everything else
           — a member session, a member, probe or `ai` token, and any class added later — has the flag removed BEFORE
           the store sees it, so every fence applies to it. It is a DELETE and not a refusal: the caller asked for an
           exemption it may not have, and the honest answer is the promotion judged as what it IS, which then refuses
           by the fence's own name (C-32.19 for the measured case) rather than by a name about the flag.
           DELETED BEFORE the `migrationReplay` block below, which sets `b.replay` as the SERVER's word on a verified
           migration replay — the only writer of it that remains.
           THE RESIDUE STEP (1) LEFT — an ADMIN-class caller could still ASSERT a replay it cannot show — IS CLOSED BY
           STEP (2) (D-512, the block below): every replayed promotion, of any type and any revision, now names a
           drive-provenance capture the plane verifies, and this class test stays as its second condition. */
        if (viaSession || cls !== "admin") delete b.replay;
        delete b.migrationReplay;
        /* D-512 (§11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S", BOB #33), STEP (2), THE END STATE.
           `replay` is honoured only where the SERVER VERIFIES it: a replayed promotion of ANY type and ANY revision
           names its drive-provenance capture, and `migrationReplayOf` — REC-173's check, which asked this of an
           inquiry's creation alone — finds the capture registered by this promotion, its bytes HELD and hashing to
           the sha named, and one preserved promotion record naming THIS bundle and listing THIS revision's
           `bundle.md` SHA-256, computed here from the text being promoted. The caller's flag is read once and
           DELETED; the only writer of `b.replay` after this line is the verification. Step (1)'s class test above
           is KEPT as the SECOND condition, as BOB #33 ruled: a non-admin caller's flag was already removed, so it is
           judged by the fences it tried to skip exactly as D-511 made it (no new refusal reaches that class).
           AN ADMIN THAT ASSERTS A REPLAY IT CANNOT SHOW IS REFUSED BY NAME (C-66.6), NOT DOWNGRADED. Deleting the
           flag and letting the promotion land as an ordinary one would be D-511's answer, and it is wrong for the
           one caller that sends the flag honestly: `migrate.mjs` carries the Drive era VERBATIM, and an ordinary
           creation is rewritten on the way in (D-436's group stamp; D-78's restamp) — the migration would report
           success over bytes the Drive record does not list. So the root of trust hears which claim failed and
           nothing is written. An inquiry CREATION that asserts nothing is still asked, as REC-173 built it: verified,
           it is a migration replay; unverified, it is an ordinary creation and rule 2 and D-78 apply unchanged.
           RESIDUE, STATED: the provenance capture is itself uploaded by the root of trust, whose honesty the record
           does not model (Membership §DEC-2, deferred). After this step no caller can ASSERT a replay the held
           bytes do not list; an admin can still FABRICATE the bytes. */
        const replayAsserted = !!b.replay;
        delete b.replay;
        const creatingInquiry = b.base === null && !!b.meta && promotedType === "inquiry";   /* D-526's one derivation (c21-batch28) */
        const proven = (!viaSession && cls === "admin" && (replayAsserted || creatingInquiry))
          ? await migrationReplayOf(env, storeName, b) : null;
        /* DEC-49 REGION is-promote-replay-verified */
        if (replayAsserted && !proven)
          return json({ ok: false, reason: "REPLAY_UNVERIFIED", ...replayRow("REPLAY_UNVERIFIED"), op,
            bundleId: typeof b.bundleId === "string" ? b.bundleId.slice(0, 200) : null,
            provenanceCapture: typeof b.provenanceCapture === "string" ? b.provenanceCapture.slice(0, 64) : null,
            detail: `this promotion says it is a replay of the record's own past, and a replay is honoured only when the `
                  + `plane can check it: it must name a drive-provenance capture (\`provenanceCapture\`) that this `
                  + `promotion registers at ${DRIVE_PROVENANCE_PATH}, whose bytes the record holds, and whose preserved `
                  + `promotion records name this bundle and list this revision's bundle.md SHA-256. One of those did not `
                  + `hold. Nothing was written.` }, 403);
        /* END DEC-49 REGION is-promote-replay-verified */
        if (proven) b.replay = true;
        /* REC-173's migration-replay stamp stays an INQUIRY CREATION's: it is what `op=projection`'s `surfaced_in`
           reads, and no other promotion has a surfacing act to account for. */
        const replayed = creatingInquiry ? proven : null;
        if (replayed) b.migrationReplay = replayed;
        delete b.assistantPrincipal;
        if (!viaSession)
          b.assistantPrincipal = cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;
        /* REC-173 (a): a verified migration replay is exempt from rule 2 — no surfacing happens on this plane — so it
           carries no stamp for `#surfacingGate` to ask. Written as its own line after REC-171's stamp, which stands
           byte-for-byte for every other caller. */
        if (replayed) delete b.assistantPrincipal;
        if (b.base === null && b.meta && promotedType === "project" && viaSession) {
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
        if (b.base === null && b.meta && !replayed   /* REC-173 (b): a verified migration replay keeps its Drive-era bytes */
            /* Through the catalog's normalizeType (REC-10), so the canonical
               `inquiry` spelling and both legacy spellings all get the D-78
               restamp — hand-listed spellings here is how the last rename
               made a check silently stop firing. */
            && promotedType === "inquiry"
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
            /* REC-175: A SUPPLIED DIGEST THAT IS NOT OF THE BYTES SENT IS NOT PAPERED OVER HERE. This restamp
               recomputes the sha of what it writes, which would silently REPLACE a caller's false `sha256` with a
               true one and answer `ok: true` over it. So the restamp runs only when the caller sent no digest or
               the digest OF THE TEXT IT SENT; otherwise the bytes and the digest go to the store as sent, and
               `promote` refuses them FILE_DIGEST_MISMATCH by name. Compared by the store's own rule (UTF-8, hex
               case-insensitive). */
            const sentSha = createSha256().update(new TextEncoder().encode(bm.text)).hex();
            const sentOk = bm.sha256 === undefined || bm.sha256 === null
              || (typeof bm.sha256 === "string" && bm.sha256.toLowerCase() === sentSha);
            if (changed && sentOk) {
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
    /* T5-11 (entities R8, R4, R28): WHO WITHDREW an alias or a relation, stamped on the FW-6 rule above and overwriting
       any `withdrawnBy` the caller put in the body, so a correction is never attributed to someone who did not make it.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may correct the registry it may build, and the record names it (class:<cls>).

       The FW-6 block above carries the ruling in full; nothing refuses a machine here BY DESIGN. */
    if ((op === "aliaswithdraw" || op === "relationwithdraw") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.withdrawnBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
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
    /* T6-13 (intent R2, R8–R11, R16, R18, R20; INTENT #1 REPORT J4.2): WHO SET THE CONDITION, DECLARED, LINKED, CLOSED,
       DEPARTED, RECORDED, RETIRED, TRIAGED OR SET AN ASSISTANT TO WORK — intent reads `author` from the BODY, so it is
       stamped into the body here and a caller's is overwritten. It is the POSITIONAL identity (`member:<id>`, the
       founder's `member:admin`), the form intent asks membership's `projectAuthority` of; a machine credential stamps
       `class:<cls>` and an `ai` credential `class:ai/<tokenId>` (`contentmint`'s form), each a machine identity intent
       refuses BY NAME at every act but `triage`'s `question` — NEVER a key's principal, which would put an assistant's
       act under a person's name.
       `triage` also carries `assistantPrincipal`, op=promote's stamp by op=promote's expression: `question` opens an
       inquiry through promotion, and ai-runs' surfacing step (its R25) asks that stamp for the run the caller holds. It
       is deleted first for every caller and set only for one that did not arrive by a session, so a session is never
       taken for an assistant and an assistant cannot name another. `run` stays the caller's word: the step asks every
       question of it (sight, position, status, bound). An empty POST body is stamped too, so a signed-in session's
       act never reads as a machine's for want of a body. */
    if (INTENT_ACTIONS.includes(op) && req.method === "POST") {
      try {
        const b = passBody ? JSON.parse(passBody) : {};
        if (b && typeof b === "object" && !Array.isArray(b)) {
          b.author = viaSession ? sessIdentity
            : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
            : `${MACHINE_CLASS_PREFIX}${cls}`;
          if (op === "triage") {
            delete b.assistantPrincipal;
            if (!viaSession)
              b.assistantPrincipal = cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;
          }
          passBody = JSON.stringify(b);
        }
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
    /* REC-207: `op=biasdebtresolve` takes the SAME body stamp and for the same reason. WHO settled the
       obligation is the whole of what the act records beside the reason, so it is the server's word and
       never the caller's; and a machine credential arriving honestly named `token:<class>` is precisely
       what lets the store refuse it BY SHAPE rather than by guessing from an absence. */
    if ((op === "taskforward" || op === "taskresolve" || op === "taskdrain"
         || op === "biasdebtresolve") && passBody) {
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
    /* D-436 / IC-172: WHO RECORDED THE INSTANCE'S PRODUCING GROUP is the whole of `recorded_by`, so it is the
       SERVER's stamp, set after the caller's parameters were copied — a caller-supplied `author` is overwritten.
       Only the root of trust reaches the op (its OPS row), so this reads `token:admin` in practice. */
    if (op === "instancegroupseed")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
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
      /* D-463: THE CONFINEMENT IS JUDGED HERE TOO, and before anything is written, for the declaration's own
         reason one line up (C-29.8 / C-29.9): a confinement the gate could never honour is a sentence that must
         not enter the record at all. It is judged in THIS file because this is where `NAMESPACES` lives, exactly
         as `writes` is judged here because this is where the OPS table lives; the store records what it is told
         and keeps no second copy of either vocabulary. The NORMALISED value crosses to the store below — never
         the caller's own spelling, which is the same rule `who` and `secretSha` follow in this block. */
      const confinement = aiConfinementDeclaration(asked.confinedTo);
      if (confinement.error) return json({ ok: false, ...confinement.error, op, cls }, 403);
      const raw = new Uint8Array(32);
      crypto.getRandomValues(raw);
      const secret = "aik-" + [...raw].map((x) => x.toString(16).padStart(2, "0")).join("");
      inner.searchParams.set("who", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
      inner.searchParams.set("secretSha", await sha256Hex(secret));
      const minted = await doAnswer(stub.fetch(new Request(inner,
        { method: req.method, body: JSON.stringify({ ...asked, writes: declared.writes,
                                                     confinedTo: confinement.confinedTo }) })));
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

    /* REC-198: the list of a project's drafts answers in the review copy's OWN shape — through `reviewAnswer`,
       the function `reviewcopy` answers through — so the dead answer a caller outside the fence receives is the
       single read's, status and bytes, and not this handler's generic envelope. */
    if (op === "casedrafts")
      return reviewAnswer(await doAnswer(stub.fetch(new Request(inner, { method: "GET" }))), op);

    const res = await stub.fetch(new Request(inner, { method: req.method, body: passBody }));
    const body = await res.json();
    return json({ ...body, store: storeName, tokenClass: cls }, res.status);
  },
};

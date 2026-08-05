import { SCHEMA } from "./schema.mjs";
import { livefire } from "./livefire.mjs";
import { SETUP_HTML } from "./setup.mjs";
import { SIGN_HTML } from "./signpage.mjs";
import { liveToken } from "./tokens.mjs";
import { runGate, GATE_VERSION } from "./gate.mjs";
import { verifySshsig, ratifyStatement, NS_RATIFY } from "./sshsig.mjs";
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
         MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX } from "../checks/bio-checks.mjs";
/* REC-22 / DEC-34: the container serialiser. The manifest REC-14 writes carries
   a `layout` block that says how the parts assemble; this module reads it and
   writes the zip, so nothing about the container's shape is decided twice. */
import { serialiseContainer, containerEntries } from "./container.mjs";
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
import { ACTS, RUNGS, VOCABULARIES, CAPTURE_ACTS, deriveActs,
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
export function userAgent(env, purpose = "acquire") {
  const version = (env && env.VERSION) || "0.0.0";
  const instance = (env && env.INSTANCE_NAME) || "unnamed";
  /* The contact URL must RESOLVE. believeinoakland.org/civicos does not exist
   * yet (the registrar transfer is pending), and SOURCE-ACCESS.md records that
   * a contact address that 404s is worse than none. The repo URL resolves
   * today and names the project. MEASURED 2026-07-30 before shipping: this
   * exact string, 8/8 200 on the ACFR path and 4/4 on a second path, same
   * instrument as the SOURCE-ACCESS table. Revert to the domain URL when the
   * zone moves and the path exists. */
  return `CivicOS/${version} (+https://github.com/believeinoakland/bio; instance ${instance}; ${purpose})`;
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

async function governedFetch(env, stub, target, purpose) {
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
  const res = await fetch(target, { redirect: "follow", headers: { "user-agent": userAgent(env, purpose) } });
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
  dangling:   { classes: ["admin", "member", "probe"],           mutating: false },
  stats:      { classes: ["admin", "member", "probe"],           mutating: false },
  promote:    { classes: ["admin", "member", "probe"],           mutating: true  },
  allocid:    { classes: ["admin", "member", "probe"],           mutating: true  },
  lease:      { classes: ["admin", "member", "probe"],           mutating: true  },
  purge:      { classes: ["admin", "probe"],                     mutating: true  },
  capture:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* A pure read, and computed at read time on purpose: which partition a link
     falls in depends on what the record holds today, not on what it held when
     the document was captured. */
  links:      { classes: ["admin", "member", "probe"],           mutating: false },
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
const RETRIEVAL_READS = ["search", "searchfields", "searchindexcheck", "selection", "selectionlist"];
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
const READING_READS = ["reading", "readingref", "readingname"];
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
   on an entity id, an alias and a relation id, not on the corpus view. */
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
   like the other progression reads, named here so the two lists cannot drift apart. */
const PROGRESSION_ACTIONS = ["connect", "connections", "progressiondefine", "progression",
                             "thread", "instance", "discharge", "exceptions", "proposals",
                             "proposedispose", "captureprogressions"];
const SESSION_OPS = {
  member: new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease", "governorstate",
                   ...RETRIEVAL_READS, ...READING_READS, ...REGISTRY_ACTIONS, ...RECOGNISER_ACTIONS,
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...ACTION_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS,
                   ...DECLARATION_ACTIONS, ...STRUCTURE_ACTIONS]),
  admin:  new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease",
                   ...RETRIEVAL_READS, ...READING_READS, ...REGISTRY_ACTIONS, ...RECOGNISER_ACTIONS,
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...ACTION_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS,
                   ...DECLARATION_ACTIONS, ...STRUCTURE_ACTIONS, "memberadd", "memberset",
                   "signeradd", "signerset", "governorstate", "governorconfig"]),
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
  /* REC-14: authoring a case carries the SAME capability as ratifying one, and
     deliberately not `contribute`. Concluding says what the record shows;
     publishing puts the group's name on it and states, in the group's voice,
     what it does not cover and whether it was put to its subject. That is the
     publication surface, and a member who may not publish may not author it
     either. No fifth capability token is minted (CAPABILITIES.md section 4). */
  publish:          "publish",
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
};

/* REC-19's act decoration, hoisted to module scope by REC-20 so op=affordances
   and op=queue share ONE function rather than one function and a copy of it.
   The store derives WHICH acts exist (deriveActs over its own facts); this adds
   the metadata that lives only here — the capability NEEDS gates the call with,
   how the op is reached, and the DECLARED ladder rung (null wherever no
   document assigns one; FW-14 assigns the rest). A queue item's options[] and
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

const json = (o, status = 200) =>
  new Response(JSON.stringify(o, null, 1), {
    status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

/* ======================================================================
   REC-52: A FAILURE TO ANSWER IS NOT AN ANSWER, AND THE PLANE MUST NOT
   CONVERT ITS OWN INTO A CLAIM ABOUT THE RECORD.
   ======================================================================

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
const storeSilent = (op) =>
  json({ ok: false, reason: STORE_SILENT_REASON, op, detail: STORE_SILENT_DETAIL }, 502);

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
  return c.undetermined > c.chars;
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

      /* ===================================================================
         REC-22: THE PUBLIC READ PATH. Anyone, no token, no session, and — the
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
                authored: { conclusion: typeof fm?.conclusion === "string" ? fm.conclusion : null,
                            falsifier: typeof fm?.falsifier === "string" ? fm.falsifier : null },
                detail: "`authored` is what op=conclude wrote into the frontmatter and what the gate holds "
                      + "the finding to; the section fields are the prose printed beside it in the signed bytes." }
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
                    capture: cited.capture, connection: cited.connection }
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
    /* A browser signed in with a password holds a session token, not a
       machine credential. The write arc opens INTAKE to sessions: promote,
       lease, allocid, capture, ratify, and inbox review run through the
       same gated paths as machine callers, with authorship stamped
       server-side from the session identity so a browser can never claim
       to be someone else. Everything outside SESSION_OPS, purge above all,
       still requires a machine credential. capture is nominally mutating
       because of its PUT path; its GET is a read and is treated as one. */
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
            return json({ ok: false, reason: "ROOT_OF_TRUST_REQUIRED", op,
              detail: "a full working-corpus export needs the ADMIN_TOKEN-class credential itself, not a "
                    + "signed-in session, and not in-app administrator status. A session is derived from a "
                    + "password; the root of trust is the token held in the hosting account. This refuses "
                    + "the founder's own browser too, which is the one place in this system where being "
                    + "the founder is not enough. The published record needs no credential at all: see "
                    + "op=publishedmanifest." }, 403);
          if (spec.mutating && !(op === "capture" && req.method === "GET")
              && !SESSION_OPS[kind].has(op))
            return json({ ok: false, error: "this operation requires a machine credential, not a signed-in session", op }, 403);
          cls = kind;
          sessMember = sess.role.startsWith("member:") ? sess.role.slice(7) : sess.role;
          sessRights = sess;
          viaSession = true;
        }
      }
    }
    if (!cls) return json({ ok: false, error: "unauthenticated" }, 401);
    if (!spec.classes.includes(cls)) return json({ ok: false, error: "forbidden for token class", op, cls }, 403);

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
      return json({ ok: false, reason: "ROOT_OF_TRUST_REQUIRED", op,
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
        return json({ ok: false, reason: "NOT_CAPABLE", op, needs, held: [...sessCaps].sort(),
          detail: `this account does not hold the ${needs} capability. Capabilities are set by an `
                + `administrator, so ask one to grant it rather than looking for another route.` }, 403);
    }

    const scope = scopeFor(cls, url);
    if (scope.error) return json({ ok: false, error: scope.error, tokenClass: cls }, 403);
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

       `rung` is DECLARED, never guessed: null wherever no document assigns one
       (7 of 57 mutating ops have a source; FW-14 assigns the rest). An `action`
       bundle returns an empty act list because nothing operates one until
       REC-24, and an empty list is the honest answer. */
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
                + "rung is null wherever no document assigns one (FW-14 assigns them); "
                + "capture_acts are keyed by a capture sha rather than by a bundle, so they are "
                + "published with their metadata and never derived against an object's state",
        }, store: storeName, tokenClass: cls }, 200);
      }
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-25: the D-15 viewer stamp, server-side from the authenticated
         identity exactly as the passthrough reads take it below. An object the
         viewer may not see answers NO_SUCH_BUNDLE, identical to an absent one. */
      const affViewer = viaSession ? `member:${sessMember}` : `${MACHINE_CLASS_PREFIX}${cls}`;
      /* REC-52: `(facts || { reason: "NO_FACTS" })` is site (b)'s shape with a
         different word — a store silence answering "there are no facts about
         that object", which is a claim about the object. What the acts on an
         object are is the whole of what this op is asked, so answering it out
         of a failure to ask would put a wrong set of affordances in front of a
         member. The store's own NO_SUCH_BUNDLE, and its 404, are untouched. */
      const fOut = await doAnswer(st.fetch(
        `http://do/affordancefacts?target=${encodeURIComponent(target)}&viewer=${encodeURIComponent(affViewer)}`));
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
      inner.searchParams.set("viewer", viaSession ? `member:${sessMember}` : `${MACHINE_CLASS_PREFIX}${cls}`);
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
        const sOut = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName)).fetch("http://x/stats"));
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
      const out = await livefire(env, storeName);
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
       op=capturelimit: that one reports a ceiling found by being refused, this
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
      if (env.PDF_WORKER && needsTier2(structure.text)) {
        try {
          const r = await env.PDF_WORKER.fetch("https://pdf-worker/structure", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ capture_sha: sha, store: storeName }),
          });
          const t2 = await r.json();
          if (r.ok && t2 && t2.ok) return json(t2, 200);
          /* The member answered but could not help (not a PDF to it, an error):
             keep Tier 1, and SAY the escalation was tried and did not add text. */
          structure.notes = [...structure.notes, "tier2_no_improvement"];
        } catch (e) {
          /* Binding threw (member unavailable / rolling out, D-108 per member):
             degrade to Tier 1, named, never a platform error to the caller. */
          structure.notes = [...structure.notes, "tier2_unavailable"];
        }
      }
      structure.tier = 1;
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
      if (cls === "daemon" && body?.via !== "archive.org")
        return json({ ok: false, reason: "NOT_PERMITTED", op, cls,
          detail: "the daemon class reaches op=acquire only through the archive fallback "
                + "(via: \"archive.org\"). Direct acquisition is a member's or an operator's act, and the "
                + "unattended credential is scoped to the two verbs the monitoring path needs." }, 403);
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
      const documentAddress = via === "archive.org" && archiveAddress ? archiveAddress : locator;
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
        const g = await governedFetch(env, stGov, locator, "acquire");
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

      const reader = res.body && res.body.getReader ? res.body.getReader() : null;
      if (!reader) return json({ ok: false, reason: "NO_BODY", locator }, 502);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > MAX) { oversize = true; break; }
        whole.update(value);
        held.push(value); heldBytes += value.length;
        if (heldBytes >= PART) await flush();
      }
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
          body: JSON.stringify({ address: via === "archive.org" ? documentAddress : (res.url || locator),
            addressNorm: via === "archive.org" ? addrNorm : normalizeAddress(res.url || locator),
            captureSha: sha, retrieved,
            /* D-96: a direct fetch is its own source, and the document address
               and the retrieval locator are the same string. An archive-sourced
               capture will name via 'archive.org' and split the two. */
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
            body: JSON.stringify({ kind: "authority-undetermined", captureSha: sha,
              subject: locator, locator, at: retrieved }),
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

      /* CONSTRUCTS Step 3 (FW-5): the plane READS the document. The doctype
         resolved above (docType) declares a reader — parse(ctx) -> reading:
         entities[] + document facts (framework:480). Run it over the SAME captured
         text FW-3 already read back, and carry the reading on the acquire document
         so op=promote can persist it beside the register row (the reading is
         per-capture, written when the capture is promoted — never here, because no
         intake path writes live state).

         "A reading that finds nothing is a failed reader, never an emptied
         document" (framework:489). A reader that is absent, that could not run
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
      const readEntities = (list) => (Array.isArray(list) ? list : []).map((e) => ({
        key: e && e.key != null ? String(e.key) : null,
        kind: e && e.kind != null ? e.kind : null,
        label: e && e.label != null ? e.label : null,
        facts: e && e.facts && typeof e.facts === "object" ? e.facts : {},
        /* The reference exactly as the reading carries it: kind:key, raw. */
        ref: `${e && e.kind != null ? e.kind : ""}:${e && e.key != null ? e.key : ""}`,
      })).filter((e) => e.key != null || e.kind != null);
      let reading;
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
              : `the ${docType.type.key} reader found no entities in this document; recorded as an empty reading, never an emptied document`,
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
        let wired = null, wiredTier = null;
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
                  if (env.PDF_WORKER && needsTier2(i2text)) {
                    try {
                      const r = await env.PDF_WORKER.fetch("https://pdf-worker/structure", {
                        method: "POST", headers: { "content-type": "application/json" },
                        body: JSON.stringify({ capture_sha: sha, store: storeName }),
                      });
                      const t2 = await r.json();
                      if (r.ok && t2 && t2.ok && t2.text) { i2text = t2.text; wiredTier = 2; }
                    } catch { /* member unavailable: Tier 1's honest answer stands */ }
                  }
                }
              }
              if (i2text) wired = readText(i2text, { headers: profHeaders,
                locator: documentAddress, content_type: ct || null, at: retrieved });
            }
          } catch { /* a wire failure must not fail the capture: fall through to
                       the honest no-reading below */ }
        }
        if (wired && wired.determined) {
          const { entities: wiredEntities, ...wrest } = (wired.parsed || {});
          const wfacts = (wrest && typeof wrest.facts === "object" && Object.keys(wrest).length === 1)
            ? wrest.facts : wrest;
          const entities = wired.parse_error ? [] : readEntities(wiredEntities);
          const wtype = wired.doctype.type;
          reading = {
            content_type: wtype.key, reader_version: wtype.version ?? null,
            read_from_text: true, found: entities.length > 0,
            entities, facts: wired.parse_error ? {} : (wfacts || {}), at: retrieved,
            /* D-152's provenance rule, applied from day one: this text came out
               of the document's own text LAYER (never OCR), by which tier, from
               which container. Distinguishable everywhere the reading is shown. */
            text_source: "layer", text_tier: wiredTier, text_container: fmt,
            basis: wired.parse_error
              ? `the ${wtype.key} reader could not parse the ${fmt} text-layer text (${wired.parse_error}), so nothing is claimed about its entities`
              : (entities.length
                  ? `read by the ${wtype.key} reader v${wtype.version} over ${fmt} text-layer text (tier ${wiredTier}); ${wired.why}`
                  : `the ${wtype.key} reader found no entities in this document's ${fmt} text-layer text (tier ${wiredTier}); recorded as an empty reading, never an emptied document`),
          };
        } else if (wired) {
          /* text-undetermined: a FAILED reading, recorded as such — the tier
             that could not decode says so, and no refs are invented. */
          reading = {
            content_type: docType.type.key, reader_version: docType.type.version ?? null,
            read_from_text: false, found: false, entities: [], facts: {}, at: retrieved,
            text_source: "layer", text_tier: wiredTier, text_container: fmt,
            basis: wired.why,
          };
        } else {
          reading = {
            content_type: docType.type.key, reader_version: docType.type.version ?? null,
            read_from_text: false, found: false, entities: [], facts: {}, at: retrieved,
            basis: `the document was not read as text (${multipart ? "multipart" : "non-textual or too large"}), so no reading was attempted`,
          };
        }
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
             is carried honestly (found:false), never fabricated (framework:489). */
          reading,
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
          }, ...(archiveHopRecorded ? [archiveHopRecorded] : [])],
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
      const imgOut = await doAnswer(stub0.fetch(`http://do/image?id=${encodeURIComponent(bundleId)}&viewer=${encodeURIComponent(viaSession ? `member:${sessMember}` : `${MACHINE_CLASS_PREFIX}${cls}`)}`));
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

    /* Ratification: the act that moves a bundle into the published corpus.
       The authority is the SSHSIG over the canonical statement, verified
       against the registered active signers; the token or session only
       reached this surface. The caller states the sha it reviewed, so
       ratification has its own CAS: nobody can ratify a revision they have
       not seen. Order of operations is deliberate: verify everything, then
       commit the published rows, then copy bytes to the published bucket.
       A failure mid-copy leaves rows that a re-ratification converges. */
    if (op === "ratify") {
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
      const ratViewer = encodeURIComponent(viaSession ? `member:${sessMember}` : `${MACHINE_CLASS_PREFIX}${cls}`);
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
      const isCase = normalizeType(ratifiedFm.object_type) === "inquiry"
        && ratifiedFm.current_state === "published";
      const edition = isCase && Number.isInteger(ratifiedFm.edition) ? ratifiedFm.edition : 1;
      const frozenStrength = isCase && Array.isArray(ratifiedFm.published_strength)
        ? ratifiedFm.published_strength : null;
      const frozenCompleteness = isCase ? {
        ...completenessFields(ratifiedFm),
        subject_position: ratifiedFm.completeness?.subject_position ?? null,
        author: ratifiedFm.completeness?.author ?? null,
        at: ratifiedFm.completeness?.at ?? null,
      } : null;
      /* REC-44 / DEC-44: WHICH CASE THIS FINDING WAS PUBLISHED IN, AND WITH
         WHOM — read out of the RATIFIED BYTES like the edition beside it, and
         out of nothing else. op=publish wrote all three into every member's
         document before the sha was taken, so the signature covers them: a case
         identity, a scope statement or a roster that is not inside the hash the
         member signed is one this plane would be asserting on their behalf. */
      const caseId = isCase && typeof ratifiedFm.case_id === "string" && ratifiedFm.case_id !== "null"
        ? ratifiedFm.case_id : null;
      const caseFindings = caseId && Array.isArray(ratifiedFm.case_findings) ? ratifiedFm.case_findings : null;
      const caseScope = caseId && typeof ratifiedFm.case_scope === "string" ? ratifiedFm.case_scope : null;
      /* REC-47 / DEC-46 (a): the AUTHORED bias acknowledgement, read out of the
         RATIFIED BYTES exactly like the scope beside it and out of nothing
         else. A disclosure this plane took off the request rather than out of
         the signed document would be one we made on the group's behalf — and a
         reader has no way to tell the difference, which is precisely why it
         must come from inside the hash the member signed. */
      const caseBiasAck = caseId ? biasAcknowledgementOf(ratifiedFm) : null;

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
      const pubOut = await doAnswer(stub.fetch(new Request("http://do/publish", {
        method: "POST", body: JSON.stringify({
          bundleId: body.bundleId, bundleSha: body.expectedSha,
          attestorKey: sv.keyB64, attestorMember: attestor?.member_id ?? sessMember,
          gateVersion: gate.gateVersion, sigArmored: body.sig,
          /* Only a CASE names its edition, and it names it in the signed bytes.
             Everything else leaves it to the store, which appends the next one
             — an information bundle has no authored edition to assert and the
             control plane must not invent one for it. */
          ...(isCase ? { edition } : {}), title: ratifiedFm.title ?? null,
          completeness: frozenCompleteness, strength: frozenStrength,
          required: isCase ? (ratifiedFm.required_strength ?? null) : null,
          caseId, caseScope, caseFindings, caseBiasAck, group: ratifiedFm.group ?? null,
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
          format: "bio-case-container/3",
          case: cs.caseId,
          edition: cs.edition,
          group: cs.group ?? null,
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
            bundle_id: f.bundle_id, title: f.title, edition: cs.edition,
            bundle_sha: f.bundle_sha, ratified_at: f.ratified_at, gate_version: f.gate_version,
            attestor: f.attestor,
            signature: { namespace: NS_RATIFY, statement: ratifyStatement(f.bundle_id, f.bundle_sha),
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
                + "several findings' strengths into one letter is a claim the evidence does not support.",
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
    const REC30_VIEWER_READS = ["dangling", "tasks", "reading", "readingref", "readingname", "resolutions",
                                "concerns", "connections", "instance", "exceptions", "thread",
                                "discharge", "audit", "searchindexcheck", "projectownerarith",
                                /* REC-14's read, swept at the merge: its bar report NAMES the
                                   projects that declared the bar, which is §7.9's reverse-edge
                                   walk arriving by a new door. The VALUE stays whole for every
                                   reader (DEC-17) — only the names are withheld. */
                                "strengthbarof"];
    if (op === "search" || op === "select" || op === "selection" || EDGE_ACTIONS.includes(op)
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
        /* REC-54: its subject is a bundle and it reads that bundle's register
           before it rewrites it, so a document the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. The store fails closed on
           an absent stamp, like every op in this list. */
        || op === "provenancechain"
        || QUEUE_ACTIONS.includes(op)
        || REC30_VIEWER_READS.includes(op)) {
      inner.searchParams.set("viewer", viaSession ? `member:${sessMember}` : `${MACHINE_CLASS_PREFIX}${cls}`);
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
    /* Ownership of a selection is the same server-side stamp. A selection is
       readable only by the credential that made it, and "only by the credential"
       is worth nothing if the caller names the credential. */
    if (op === "select" || op === "selection" || op === "selectionlist" ||
        op === "selectionrelease" || EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op))
      inner.searchParams.set("owner", viaSession ? `member:${sessMember}` : `${MACHINE_CLASS_PREFIX}${cls}`);
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
       stamp and a set-application shape it does not have. */
    if (EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op) || ACTION_ACTIONS.includes(op)
        || DECLARATION_ACTIONS.includes(op) || STRUCTURE_ACTIONS.includes(op)
        || op === "provenancechain")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* Who is acting on a project's roster is decided by the SERVER. Set after
       the caller's parameters were copied, so a caller-supplied `by` is
       overwritten rather than honoured: "only an owner may remove" is worth
       nothing if the caller names who they are. A machine credential says
       plainly that it was a machine, which matches no participation row and no
       administrator, so it is refused by the store rather than let through. */
    if (PROJECT_ACTIONS.includes(op) || op === "projectparticipants" || op === "projectownerarith")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
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
          if (!sessCaps.has("create_projects"))
            return json({ ok: false, reason: "NOT_CAPABLE", op, needs: "create_projects",
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
       be, so the store refuses on the identity it is handed. */
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
       it is (class:<cls>) rather than borrowing a person's name. */
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
       is (class:<cls>) rather than borrowing a person's name. */
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
       equality a caller can hand us is one a caller can invent). */
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
       says what it is (class:<cls>) rather than borrowing a person's name. */
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
       record's, checked in the store, never the caller's. */
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
       closed. */
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
    const res = await stub.fetch(new Request(inner, { method: req.method, body: passBody }));
    const body = await res.json();
    return json({ ...body, store: storeName, tokenClass: cls }, res.status);
  },
};

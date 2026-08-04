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
import { isPublicHttpsLocator, parseFrontmatter, createSha256, normalizeType,
         completenessFields } from "../checks/bio-checks.mjs";
/* REC-19 / DEC-8: the act catalogue and derivation behind op=affordances. The
   catalogue reads the legal-edge table from the check catalogue (exported,
   never copied); `needs` and `mode` are composed HERE from NEEDS and
   SESSION_OPS, the tables that actually gate the call, so the publication and
   the gate cannot drift. */
import { ACTS, RUNGS, VOCABULARIES, deriveActs } from "./affordances.mjs";
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
  acquire:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* Co-attestation. Asks a timestamp authority to attest that a capture existed
     at a claimed instant, which is the one part of provenance a group cannot
     fabricate for itself. */
  attest:     { classes: ["admin", "member", "probe"],           mutating: true  },
  /* The monitor. Checks whether a monitored source still serves what was
     captured and records the answer as a mechanical monitor-tick, inside the
     field set C-20.1 holds that operation to. */
  monitor:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* A conformance pass over the whole store, run inside the Durable Object where
     the images already are. Read-only, paginated, and resumable by cursor. */
  audit:      { classes: ["admin", "member", "probe"],           mutating: false },
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
   admin lists cannot drift apart. Neither takes a viewer stamp: they key on a
   capture sha and a raw reference, not on the corpus view. */
const READING_READS = ["reading", "readingref"];
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
const STATE_ACTIONS = ["dispose", "retire", "release", "conclude", "reopen", "publish"];
/* REC-14 / DEC-17: declaring the group's default required strength is a
   session act whose AUTHOR is part of the declaration — "you can lower your own
   bar; you cannot do it quietly" — so it takes the author stamp without being a
   state action on any object. */
const DECLARATION_ACTIONS = ["strengthbar"];
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
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS,
                   ...DECLARATION_ACTIONS]),
  admin:  new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease",
                   ...RETRIEVAL_READS, ...READING_READS, ...REGISTRY_ACTIONS, ...RECOGNISER_ACTIONS,
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS,
                   ...DECLARATION_ACTIONS, "memberadd", "memberset",
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
const decorateAct = (a) => ({
  id: a.id, label: a.label, weight: a.weight,
  needs: NEEDS[a.id] ?? null,
  mode: SESSION_OPS.member.has(a.id) ? "session"
      : SESSION_OPS.admin.has(a.id) ? "admin-session" : "machine",
  rung: RUNGS[a.id] ?? null,
});

const KNOCK = {

  windowMs: 10 * 60 * 1000,
  perIp: 12,          // knocks per source per window
  global: 300,        // knocks per instance per window; bounds hostile R2 writes
  maxBytes: 8 * 1024 * 1024,   // with R2: enough for a captured PDF
  maxInline: 64 * 1024,        // without R2: inline into the DO, small only
};

const SCRATCH = "scratch";

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

async function classify(token, env) {
  if (!token) return null;
  if (token === env.ADMIN_TOKEN && (await liveToken(env.ADMIN_TOKEN))) return "admin";
  if (token === env.MEMBER_TOKEN && (await liveToken(env.MEMBER_TOKEN))) return "member";
  if (token === env.PROBE_TOKEN && (await liveToken(env.PROBE_TOKEN))) return "probe";
  return null;
}

/* A probe-class token may mutate, but only inside the scratch namespace. This
   is what lets an automated caller exercise the real write path, including the
   CAS, against the real deployment, without any ability to touch live state. */
/* A probe-class caller is confined to the scratch namespace. Confinement is by
   REFUSAL, not by silent redirection: a caller that believes it addressed the
   live store must be told it did not, rather than quietly succeeding somewhere
   else. Defaulting with no store parameter is scratch. */
function scopeFor(cls, url) {
  const asked = url.searchParams.get("store");
  if (cls === "probe") return asked && asked !== SCRATCH ? { error: `probe class is confined to the ${SCRATCH} namespace, refused request for ${JSON.stringify(asked)}` } : { name: SCRATCH };
  return { name: asked === SCRATCH ? SCRATCH : "bio" };
}

const json = (o, status = 200) =>
  new Response(JSON.stringify(o, null, 1), {
    status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

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
        const r = await stub.fetch(new Request(`http://do/verify?sha256=${sha}`));
        const out = await r.json();
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
        const r = await stub.fetch(new Request("http://do/publishedmanifest"));
        return json({ ok: true, result: (await r.json()).result }, 200);
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
        const rec = await (await stub.fetch(new Request("http://do/knock", {
          method: "POST", body: JSON.stringify({
            knockId, sha256: sha, bytes: bytes.length,
            content: r2 ? null : new TextDecoder().decode(bytes),
            inR2: r2, note: body.note, contact: body.contact,
            ipBucket: `ip:${ipHash}:${win}`, globalBucket: `all:${win}`,
            perIpLimit: KNOCK.perIp, globalLimit: KNOCK.global,
          }) }))).json();
        if (!rec.result?.ok) return json({ ok: false, ...rec.result }, 429);
        if (r2) await env.CAPTURES.put(`bio/inbox/${sha}`, bytes,
          { sha256: await crypto.subtle.digest("SHA-256", bytes) });
        return json({ ok: true, knockId, sha256: sha, bytes: bytes.length,
                      received: "Your material is in the group's inbox awaiting member review." }, 200);
      }
      const r = await stub.fetch(new Request(`http://do/bootstrap?fp=${fp}`));
      const out = await r.json();
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
        const r = await (await st.fetch(`http://do/session?t=${t}`)).json();
        const sess = r?.result?.session;
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
          detail: "pass target=<bundle id> for the acts available on that object right now; "
                + "rung is null wherever no document assigns one (FW-14 assigns them)",
        }, store: storeName, tokenClass: cls }, 200);
      }
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      /* REC-25: the D-15 viewer stamp, server-side from the authenticated
         identity exactly as the passthrough reads take it below. An object the
         viewer may not see answers NO_SUCH_BUNDLE, identical to an absent one. */
      const affViewer = viaSession ? `member:${sessMember}` : `class:${cls}`;
      const facts = (await (await st.fetch(
        `http://do/affordancefacts?target=${encodeURIComponent(target)}&viewer=${encodeURIComponent(affViewer)}`)).json()).result;
      if (!facts || facts.ok !== true)
        return json({ ok: false, ...(facts || { reason: "NO_FACTS" }),
                      store: storeName, tokenClass: cls },
                    facts && facts.reason === "NO_SUCH_BUNDLE" ? 404 : 400);
      return json({ ok: true, result: {
        target: facts.target, object_type: facts.object_type,
        current_state: facts.current_state,
        acts: deriveActs(facts).map(decorate),
        vocabularies: VOCABULARIES,
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
      inner.searchParams.set("viewer", viaSession ? `member:${sessMember}` : `class:${cls}`);
      inner.searchParams.set("member", viaSession ? sessMember : "");
      for (const k of ["now", "limit"]) {
        const v = url.searchParams.get(k);
        if (v !== null) inner.searchParams.set(k, v);
      }
      const r = (await (await st.fetch(inner.toString())).json()).result;
      if (!r || r.ok !== true)
        return json({ ok: false, ...(r || { reason: "NO_QUEUE" }), store: storeName, tokenClass: cls }, 400);
      return json({ ok: true, result: {
        ...r,
        items: r.items.map((i) => ({ ...i, options: (i.options || []).map(decorateAct) })),
        vocabularies: VOCABULARIES,
      }, store: storeName, tokenClass: cls }, 200);
    }

    if (op === "registeraudit") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const r = (await (await st.fetch("http://do/registeraudit")).json()).result;
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
        const r = await env.STORE.get(env.STORE.idFromName(storeName)).fetch("http://x/stats");
        out.store = (await r.json()).result;
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
      const obs = (await (await st.fetch("http://x/runtimeobservations")).json()).result;
      const probe = (await (await st.fetch("http://x/cpuprobestate")).json()).result;
      const lim = (await (await st.fetch("http://x/capturelimit?runtime=subrequests")).json()).result;
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
      const before = (await (await st.fetch("http://x/cpuprobestate")).json()).result;
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
      const after = (await (await st.fetch("http://x/cpuprobestate")).json()).result;
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
      const p = await (await st.fetch(`http://x/projectlinks?capture=${capture}`
        + (bundle ? `&bundle=${encodeURIComponent(bundle)}` : ""))).json();
      return json({ ok: true, ...p.result });
    }

    if (op === "governorstate") {
      /* D-103: which hosts the governor is holding and why. A read; the host
         param narrows to one, absence returns all. The store method already
         shapes the rows, so this only forwards. */
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const host = url.searchParams.get("host");
      const r = await (await st.fetch(`http://x/governorstate${host ? `?host=${encodeURIComponent(host)}` : ""}`)).json();
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
      const r = await (await st.fetch("http://x/governorconfig", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ host, appetite_per_min: appetite }),
      })).json();
      return json({ ok: true, ...r.result });
    }

    if (op === "links") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const capture = url.searchParams.get("capture");
      const address = url.searchParams.get("address");
      if (address) {
        const r = await (await st.fetch(`http://x/linksto?address=${encodeURIComponent(normalizeAddress(address))}`)).json();
        return json({ ok: true, ...r.result });
      }
      if (!/^[0-9a-f]{64}$/.test(capture || ""))
        return json({ ok: false, reason: "NEED_CAPTURE_OR_ADDRESS",
          detail: "pass capture=<sha256> for a document's outbound links, or address=<url> for what points at it" }, 400);
      const r = await (await st.fetch(`http://x/resolvelinks?capture=${capture}`)).json();
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
        if (cls !== "admin" && cls !== "probe")
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
               bytes may be identical and the method just as careful. */
            grade: via === "archive.org" ? "C" : "B",
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
        note: "Grade B: bytes as fetched, hashed at receipt. Grade A needs a chain-of-custody web archive, which this surface cannot produce. Co-attestation raises B toward evidentiary weight.",
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
      const img = (await (await stub0.fetch(`http://do/image?id=${encodeURIComponent(bundleId)}&viewer=${encodeURIComponent(viaSession ? `member:${sessMember}` : `class:${cls}`)}`)).json()).result;
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

      const promoted = await (await stub0.fetch("http://do/promote", { method: "POST", body: JSON.stringify({
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
      }) })).json();

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

      const facts = (await (await stub.fetch(`http://do/gatefacts?id=${encodeURIComponent(body.bundleId)}`)).json()).result;
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
      const ratViewer = encodeURIComponent(viaSession ? `member:${sessMember}` : `class:${cls}`);
      const image = (await (await stub.fetch(`http://do/image?id=${encodeURIComponent(body.bundleId)}&viewer=${ratViewer}`)).json()).result;
      const r2 = typeof env.CAPTURES?.head === "function";
      /* The catalog resolves references against the whole store, so it needs
         to know which identifiers exist. One cheap query rather than a probe
         per reference. */
      const known = new Set(((await (await stub.fetch(`http://do/list?viewer=${ratViewer}`)).json()).result || [])
        .map((b) => b.bundle_id));
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
        hasCapture: async (sha) => {
          if (!r2) return { present: false, bytes: 0 };
          const h = await env.CAPTURES.head(`${storeName}/captures/${sha}`);
          return h ? { present: true, bytes: h.size } : { present: false, bytes: 0 };
        },
      });
      if (!gate.ok)
        return json({ ok: false, reason: "GATE_REFUSED", gateVersion: gate.gateVersion,
                      findings: gate.findings, store: storeName, tokenClass: cls }, 409);

      const shas = [];
      for (const [path, v] of Object.entries(image)) {
        if (path.startsWith("_history/")) continue;
        if (typeof v === "string") {
          const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)))]
            .map((x) => x.toString(16).padStart(2, "0")).join("");
          shas.push({ sha256: sha, path, kind: path === "bundle.md" ? "bundle" : "file",
                      bytes: new TextEncoder().encode(v).length, text: v });
        } else {
          shas.push({ sha256: v.blobSha, path, kind: "capture" });
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

      /* DEC-34: the CONTAINER's signed hash manifest. "Protected" means
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
      const manifest = {
        format: "bio-case-container/1",
        case: body.bundleId,
        title: ratifiedFm.title ?? null,
        edition,
        group: ratifiedFm.group ?? null,
        bundle_sha: body.expectedSha,
        gate_version: gate.gateVersion,
        attestor: { member: attestor?.member_id ?? sessMember, key_b64: sv.keyB64 },
        signature: { namespace: NS_RATIFY, statement: ratifyStatement(body.bundleId, body.expectedSha),
                     armored: body.sig },
        strength: frozenStrength,
        required_strength: isCase ? (ratifiedFm.required_strength ?? null) : null,
        parts: shas.map(({ text, ...part }) => part),
        layout: { root: `${body.bundleId}/`, parts_at: "path", manifest_at: "MANIFEST.json",
                  note: "the zip carries every part at its own path with this manifest at the root. Check "
                      + "each part's sha256 against this list, then check this manifest's own sha256 and the "
                      + "signature over bundle_sha. Renderings (REC-22) join parts[] as kind: rendering." },
        verify: "tamper-EVIDENT, not tamper-proof: nothing here prevents a modified copy, and everything here "
              + "makes one detectable by anyone holding it, without this instance's cooperation.",
      };
      const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest, null, 1));
      const manifestSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", manifestBytes))]
        .map((x) => x.toString(16).padStart(2, "0")).join("");
      shas.push({ sha256: manifestSha, path: "MANIFEST.json", kind: "manifest",
                  bytes: manifestBytes.length, text: JSON.stringify(manifest, null, 1) });

      const pub = (await (await stub.fetch(new Request("http://do/publish", {
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
          manifest, manifestSha,
          shas: shas.map(({ text, ...s }) => s),
        }) }))).json()).result;
      if (!pub?.ok)
        return json({ ok: false, ...(pub && pub.reason ? pub : { reason: "PUBLISH_FAILED", detail: pub }),
                      store: storeName, tokenClass: cls },
                    pub && (pub.reason === "EDITION_NOT_INCREMENTED" || pub.reason === "EDITION_EXISTS") ? 409 : 500);

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
      const reused = (await (await stub.fetch(`http://do/reusedparts?id=${encodeURIComponent(body.bundleId)}`)).json()).result;
      if (reused && Array.isArray(reused.parts) && reused.parts.length) {
        const lim = (await (await stub.fetch("http://do/capturelimit?runtime=subrequests")).json()).result;
        const observed = lim && lim.observed ? lim.observed : null;
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
                   + `ceiling ${observed == null ? "none observed" : observed}) was spent before this part; `
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
        await stub.fetch(new Request("http://do/recordreuseverdicts", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ bundleId: body.bundleId, at, verdicts }) }));
        const tally = (k) => verdicts.filter((v) => v.verdict === k).length;
        reuseReport = {
          reused_parts: reused.parts.length, budget, ceiling: observed,
          confirmed: tally("confirmed"), changed: tally("changed"),
          unavailable: tally("unavailable"), not_attempted: tally("not_attempted"),
          outcomes: verdicts.map((v) => ({ address_norm: v.address_norm, source_capture: v.source_capture,
                                           verdict: v.verdict, observed_sha: v.observed_sha, basis: v.basis })),
          note: "every reused part carries an outcome. confirmed/changed/unavailable all ratify and say "
              + "different things; not_attempted names a part the budget could not reach. Re-fetch is a plain "
              + "GET, hashed by us -- a reused part ratified in silence is what is forbidden.",
        };
      }

      return json({ ok: true, bundleId: body.bundleId, bundleSha: body.expectedSha,
                    edition: pub.edition, container: { manifest_sha: manifestSha, parts: manifest.parts.length },
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
    if (op === "lease") inner.searchParams.set("actor", viaSession ? sessMember : `token:${cls}`);
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
    const REC30_VIEWER_READS = ["dangling", "tasks", "reading", "readingref", "resolutions",
                                "concerns", "connections", "instance", "exceptions", "thread",
                                "discharge", "audit", "searchindexcheck", "projectownerarith",
                                /* REC-14's read, swept at the merge: its bar report NAMES the
                                   projects that declared the bar, which is §7.9's reverse-edge
                                   walk arriving by a new door. The VALUE stays whole for every
                                   reader (DEC-17) — only the names are withheld. */
                                "strengthbarof"];
    if (op === "search" || op === "select" || op === "selection" || EDGE_ACTIONS.includes(op)
        || STATE_ACTIONS.includes(op)
        || op === "list" || op === "index" || op === "projection" || op === "image"
        || op === "file" || op === "backlinks" || op === "excludedby" || QUEUE_ACTIONS.includes(op)
        || REC30_VIEWER_READS.includes(op)) {
      inner.searchParams.set("viewer", viaSession ? `member:${sessMember}` : `class:${cls}`);
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
      inner.searchParams.set("owner", viaSession ? `member:${sessMember}` : `class:${cls}`);
    /* Who cited is part of the record, and citing writes a Session Log entry
       carrying the name. Stamped like every other authorship in this file: a
       browser cannot write history as someone else, and a machine credential
       says plainly that it was a machine rather than borrowing a person's name.
       A caller-supplied `author` is overwritten, not honoured. */
    if (EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op) || DECLARATION_ACTIONS.includes(op))
      inner.searchParams.set("author", viaSession ? sessMember : `token:${cls}`);
    /* Who is acting on a project's roster is decided by the SERVER. Set after
       the caller's parameters were copied, so a caller-supplied `by` is
       overwritten rather than honoured: "only an owner may remove" is worth
       nothing if the caller names who they are. A machine credential says
       plainly that it was a machine, which matches no participation row and no
       administrator, so it is refused by the store rather than let through. */
    if (PROJECT_ACTIONS.includes(op) || op === "projectparticipants" || op === "projectownerarith")
      inner.searchParams.set("by", viaSession ? sessMember : `class:${cls}`);
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
        else b.author = `token:${cls}`;
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
        if (op === "expertisedeclare") b.memberId = viaSession ? sessMember : `class:${cls}`;
        else b.by = viaSession ? sessMember : `class:${cls}`;
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
        b.declaredBy = viaSession ? sessMember : `class:${cls}`;
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
        b.resolvedBy = viaSession ? sessMember : `class:${cls}`;
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
        b.declaredBy = viaSession ? sessMember : `class:${cls}`;
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
        b.threadedBy = viaSession ? sessMember : `class:${cls}`;
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
        b.declaredBy = viaSession ? sessMember : `class:${cls}`;
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
        b.decidedBy = viaSession ? sessMember : `class:${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    if (op === "inboxresolve" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.by = viaSession ? sessMember : `token:${cls}`;
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
        b.actor = viaSession ? sessMember : `token:${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    const res = await stub.fetch(new Request(inner, { method: req.method, body: passBody }));
    const body = await res.json();
    return json({ ...body, store: storeName, tokenClass: cls }, res.status);
  },
};

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
import { isPublicHttpsLocator, parseFrontmatter, createSha256 } from "../checks/bio-checks.mjs";
import { timestampRequest, parseTimestampResponse, TSA_ENDPOINTS,
         TSA_CONTENT_TYPE, TSA_ACCEPT,
         ARCHIVE_SAVE_BASE, ARCHIVE_SERVICE, archiveLocatorFrom } from "./tsa.mjs";
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
  dangling:   { classes: ["admin", "member", "probe"],           mutating: false },
  stats:      { classes: ["admin", "member", "probe"],           mutating: false },
  promote:    { classes: ["admin", "member", "probe"],           mutating: true  },
  allocid:    { classes: ["admin", "member", "probe"],           mutating: true  },
  lease:      { classes: ["admin", "member", "probe"],           mutating: true  },
  purge:      { classes: ["admin", "probe"],                     mutating: true  },
  capture:    { classes: ["admin", "member", "probe"],           mutating: true  },
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
  publishedlist:{ classes: ["admin", "member", "probe"],           mutating: false },
  inbox:        { classes: ["admin", "member", "probe"],           mutating: false },
  inboxget:     { classes: ["admin", "member", "probe"],           mutating: false },
  inboxresolve: { classes: ["admin", "member", "probe"],           mutating: true  },
  memberadd:    { classes: ["admin", "probe"],                     mutating: true  },
  memberlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  memberset:    { classes: ["admin", "probe"],                     mutating: true  },
  /* The membership model's member half. All admin-only: memberlist pairs cover
     with handle and only administrators see those together (section 3), and the
     rest is section 4 governance. `adminarith` is a read of the rule itself, so
     a UI can tell a group what a removal would take before they begin one. */
  membercaps:   { classes: ["admin", "probe"],                     mutating: true  },
  adminendorse: { classes: ["admin", "probe"],                     mutating: true  },
  adminremove:  { classes: ["admin", "probe"],                     mutating: true  },
  adminarith:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* D-9: why a register row is unreferenced. A read that classifies every row
     against what the store actually holds, so the 20 unexplained rows on the
     live instance stop being a plausible story and become a measured one.
     Admin, because the register is intake provenance for the working corpus. */
  registeraudit:{ classes: ["admin", "probe"],                     mutating: false },
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
/* The selection-backed actions on a Project's citation edges. Named as a set
   rather than listed twice, because the member and admin session lists drifting
   apart is exactly the class of defect this repository keeps finding. */
const EDGE_ACTIONS = ["cite", "sever", "reinstate"];
/* S-11 step 3. The first selection-backed action to move an OBJECT's state
   rather than an edge's, so it takes the same server-side viewer, owner and
   author stamps the edge actions take: a caller that could name the viewer
   could dispose Problems it cannot see. */
const STATE_ACTIONS = ["dispose"];
const PROJECT_ACTIONS = ["projectinvite", "projectjoin", "projectleave", "projectremove",
                         "projectowneradd", "projectownerremove", "projectfork",
                         "projectownerrescue"];
/* Section 1.3. Both are in the MEMBER set: a member declares their own, and a
   member reaching confirm is refused by the store with ADMIN_ONLY, which says
   what is wrong. Putting confirm in the admin set alone would answer "requires a
   machine credential", which is true of neither the caller nor the rule. */
const EXPERTISE_ACTIONS = ["expertisedeclare", "expertiseconfirm"];
const SESSION_OPS = {
  member: new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease",
                   ...RETRIEVAL_READS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...PROJECT_ACTIONS,
                   ...EXPERTISE_ACTIONS]),
  admin:  new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease",
                   ...RETRIEVAL_READS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...PROJECT_ACTIONS,
                   ...EXPERTISE_ACTIONS, "memberadd", "memberset", "signeradd", "signerset"]),
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
  acquire:          "contribute",
  attest:           "contribute",
  monitor:          "contribute",
  cite:             "contribute",
  sever:            "contribute",
  reinstate:        "contribute",
  dispose:          "contribute",
  /* Dispositioning a knock decides what enters the working corpus, which is the
     contribute surface even though the row it writes is an inbox row. Reading
     the inbox is not gated; acting on it is. */
  inboxresolve:     "contribute",
  /* publish: ratify. The capability governs the SURFACE and the registered
     signing key governs the authority (5). Both exist because before this the
     key was doing the capability's job: a member with no publish reached
     op=ratify and was stopped only by not having a key. */
  ratify:           "publish",
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
};

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
    if (op === "capture") {
      if (typeof env.CAPTURES?.get !== "function")
        return json({ ok: false, error: "R2 is not configured on this instance" }, 503);
      const sha = (url.searchParams.get("sha256") || "").toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(sha))
        return json({ ok: false, error: "capture requires sha256=<64 lowercase hex>" }, 400);
      const key = `${storeName}/captures/${sha}`;
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
    if (op === "acquire") {
      if (req.method !== "POST") return json({ ok: false, error: "acquire is a POST" }, 405);
      if (typeof env.CAPTURES?.put !== "function")
        return json({ ok: false, error: "this instance has no evidence storage configured" }, 503);
      const body = await req.json().catch(() => null);
      const locator = body?.locator;
      if (typeof locator !== "string" || !isPublicHttpsLocator(locator))
        return json({ ok: false, reason: "BAD_LOCATOR",
                      detail: "a locator must be https on a public host: no bare IP address, no localhost, no credentials in the address" }, 400);
      if (typeof body?.authority !== "string" || !body.authority.trim())
        return json({ ok: false, reason: "NO_AUTHORITY",
                      detail: "record who issued the document; the capture chain and the source are separate claims and both are named" }, 400);

      const retrieved = new Date().toISOString().split(".")[0] + "Z";
      let res;
      try {
        res = await fetch(locator, { redirect: "follow", headers: { "user-agent": "bio-acquire" } });
      } catch (e) {
        return json({ ok: false, reason: "FETCH_FAILED", detail: String(e && e.message || e), locator }, 502);
      }
      if (!res.ok)
        return json({ ok: false, reason: "SOURCE_REFUSED", status: res.status, locator }, 502);

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
      const name = (body.file || locator.split("/").pop() || "capture")
        .replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100) || "capture";

      /* The shape C-18.1 requires, assembled here so the caller does not have to
         know it and cannot get it subtly wrong. */
      return json({
        ok: true, existed,
        document: {
          file: `snapshots/${name}`,
          locator, authority: body.authority.trim(), retrieved,
          capture: {
            method: multipart
              ? `bio-plane acquire, https fetch, streamed in ${parts.length} parts, hashed at receipt`
              : "bio-plane acquire, https fetch, hashed at receipt",
            grade: "B",
            actor_class: viaSession ? "member" : (cls === "probe" ? "session" : "daemon"),
            /* Over the reassembled whole, which is what C-18.1 requires of a
               parted document and what C-18.6 checks by streaming the parts. */
            sha256: sha, encoding: "binary", bytes: total,
            ...(ct ? { content_type: ct } : {}),
          },
          ...(multipart ? { parts: parts.map((p, i) => ({
            file: `snapshots/${name}.part${String(i).padStart(3, "0")}`,
            sha256: p.sha256, bytes: p.bytes })) } : {}),
          origin: { kind: body.matchedSweep ? "sweep" : "named_request",
                    ...(body.matchedSweep ? { matched_sweep: body.matchedSweep, deeming_actor: sessMember || cls } : {}) },
          attestation_attempts: [],
        },
        ...(multipart ? { parts: parts.length } : {}),
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
      const img = (await (await stub0.fetch(`http://do/image?id=${encodeURIComponent(bundleId)}`)).json()).result;
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
        const res = await fetch(locator, { redirect: "follow", headers: { "user-agent": "bio-monitor" } });
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

      const image = (await (await stub.fetch(`http://do/image?id=${encodeURIComponent(body.bundleId)}`)).json()).result;
      const r2 = typeof env.CAPTURES?.head === "function";
      /* The catalog resolves references against the whole store, so it needs
         to know which identifiers exist. One cheap query rather than a probe
         per reference. */
      const known = new Set(((await (await stub.fetch("http://do/list")).json()).result || [])
        .map((b) => b.bundle_id));
      const gate = await runGate({
        bundleId: body.bundleId, image, knownIds: known,
        registers: facts.registers,
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

      const pub = (await (await stub.fetch(new Request("http://do/publish", {
        method: "POST", body: JSON.stringify({
          bundleId: body.bundleId, bundleSha: body.expectedSha,
          attestorKey: sv.keyB64, attestorMember: attestor?.member_id ?? sessMember,
          gateVersion: gate.gateVersion, sigArmored: body.sig,
          shas: shas.map(({ text, ...s }) => s),
        }) }))).json()).result;
      if (!pub?.ok) return json({ ok: false, reason: "PUBLISH_FAILED", detail: pub, store: storeName, tokenClass: cls }, 500);

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

      return json({ ok: true, bundleId: body.bundleId, bundleSha: body.expectedSha,
                    existed: pub.existed, ratifiedAt: pub.ratifiedAt,
                    attestor: attestor?.member_id ?? null, gateVersion: gate.gateVersion,
                    published: { shas: shas.length, copied, alreadyPresent: present, r2: r2state },
                    store: storeName, tokenClass: cls }, 200);
    }

    /* A few ops read better at the edge than they do inside the store, so
       the public name and the internal name differ. The map is the only
       place that difference lives. */
    const DO_PATH = { inbox: "inboxlist", memberlist: "memberlist", signerlist: "signerlist" };
    const inner = new URL("http://x/" + (DO_PATH[op] || op));
    for (const [k, v] of url.searchParams) if (k !== "token" && k !== "op") inner.searchParams.set(k, v);
    /* Authorship from a session is stamped by the server, never taken from
       the request: a browser cannot write history as someone else. */
    if (viaSession && op === "lease") inner.searchParams.set("actor", sessMember);
    /* D-15: whose view a query compiles for is decided by the SERVER, from the
       credential that authenticated, and set AFTER the caller's parameters were
       copied so a caller-supplied `viewer` is overwritten rather than honoured.
       The gate is flat member scope today and returns true for a member; when
       projects and positions land it returns a real predicate and this is still
       the only place the identity comes from. A viewer the compiler does not
       recognise compiles to a deny predicate, so the failure mode of a missing
       stamp is an empty result rather than an unfiltered one. */
    if (op === "search" || op === "select" || op === "selection" || EDGE_ACTIONS.includes(op)
        || STATE_ACTIONS.includes(op)) {
      inner.searchParams.set("viewer", viaSession ? `member:${sessMember}` : `class:${cls}`);
    }
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
    if (EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op))
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
        if (viaSession) { b.author = sessMember; b.actorMemberId = sessMember; }
        if (b.base === null && b.meta && b.meta.object_type === "project" && viaSession) {
          if (!sessCaps.has("create_projects"))
            return json({ ok: false, reason: "NOT_CAPABLE", op, needs: "create_projects",
              held: [...sessCaps].sort(),
              detail: "creating a project needs the create-projects capability. This account may still "
                    + "contribute to projects it has been invited to, if it holds contribute." }, 403);
          b.ownerMemberId = sessMember;
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
    if (op === "inboxresolve" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.by = viaSession ? sessMember : `token:${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    const res = await stub.fetch(new Request(inner, { method: req.method, body: passBody }));
    const body = await res.json();
    return json({ ...body, store: storeName, tokenClass: cls }, res.status);
  },
};

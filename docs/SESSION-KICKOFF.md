# Starting a BIO session

Claude reads everything it needs from this public repository at the start
of a session, with no credentials: the full source tree and the documents
in docs/. Attach nothing. As of July 24, 2026 that includes the whole
doctrine corpus in docs/architecture/, so the mission, the requirements,
the functional and technical architecture, the state rules, and the intake
doctrine are all readable without an upload. docs/architecture/README.md
indexes them and marks which are superseded.

Say what to work on. Below is the COMPLETE list of credentials a session can
need, what each unlocks, and what scope it must carry. Values are pasted into
the session by Bob, never stored here.

**Why the values are not in this file.** Not caution, mechanics. `tokens.mjs`
denylists by SHA-256 every token value that has ever appeared in this
repository and treats a denylisted value as NOT SET, so committing MEMBER_TOKEN
or ADMIN_TOKEN here would make the plane refuse it: publishing the credential
is the same act as revoking it. The release PRIVATE key is worse than that. Its
public half is compiled into the installer's ARMED_SIGNERS, so anyone holding
the private half can sign a release that every sovereign installer accepts as
authentic; in a public repository that is a supply-chain key for the groups who
install BIO, not just a key of Bob's. Bob's own standing decision, recorded
below since July 24, is that these are pasted once per session, which is a
paste and not a re-mint.

1. **SHIP A RELEASE** (push code, release files, docs, or tags to this repo):
   the GitHub personal access token, repo scope on `believeinoakland/bio`.
   Long-lived by Bob's decision (July 24, 2026): during development the repo
   holds no production instance and nobody else runs BIO, so per-session
   minting was pure friction. Revisit when a real group installs.

2. **TOUCH AN INSTANCE'S DATA** (read or write the live record from the
   session): the instance MEMBER_TOKEN. Reads and intake writes. Note that
   ADMIN_TOKEN has never been supplied to a session; D-9 (unreferenced register
   rows) is the one open item that needs it.

3. **SIGN A RELEASE**: the release private key, format
   `BIOKEY-RAW1.bio-release.<base64 32-byte seed>`. Signs the asset BYTES in
   namespace `bio-release`, sha512. A session with this key can cut a release
   end to end; without it, Bob signs in `tools/sign-release.html` and pastes
   the block back. The ratification key
   (`BIOKEY-RAW1.bio-ratify.<seed>`, namespace `bio-ratify`, signing
   `bio-ratify <bundleId> <sha256>`) attests documents for publishing.
   Namespace separation is what stops a ratification signature installing
   software, and `wizard.test.mjs` asserts it.

4. **DEPLOY TO AN INSTANCE** (update a running Worker without the browser
   wizard): a Cloudflare API token with exactly three account permissions,
   **Workers Scripts: Edit**, **Workers R2 Storage: Edit**, **Account
   Settings: Read**, scoped to the one account, with NO zone permissions and
   NO IP filter. Zone permissions are unnecessary because instances live on
   `workers.dev`, and leaving them off keeps DNS and the
   `believeinoakland.org` zone out of reach. An IP filter breaks the token,
   because a session's egress address is not stable. Set a TTL. The
   permission applies account-wide rather than to one Worker, so a session
   should target the script by name and say which.

   The account id is not a secret and saves a lookup:
   `20b533579290b9b93168345edd3b7f72`
   (`Biocloudflare@neologic.com's Account`). It holds two Workers, `biosmoke7`
   (the development plane) and `newgroup` (the installer wizard), and both R2
   buckets, `bio-captures` and `bio-published`.

5. **INSTALL OR UPDATE VIA THE WIZARD**: no grant needed. The installer at
   newgroup.believeinoakland.workers.dev authenticates through Cloudflare's
   own sign-in with a click, asking consent for the same three scopes.

### The update shape, which is not obvious and is easy to get wrong

A deploy that updates an existing instance must mirror `uploadUpdate` in
`newgroup/src/index.mjs`. Two details are load-bearing:

- `keep_bindings: ["secret_text", "durable_object_namespace"]`. Without it a
  PUT deletes the instance's ADMIN_TOKEN, MEMBER_TOKEN, and PROBE_TOKEN.
- **No `migrations` field at all.** The `Store` class already exists and its
  SQLite backend never changes; re-sending `new_sqlite_classes` against a live
  instance is how the record gets endangered. Migrations belong only to a
  first install.

Bind R2 explicitly when the buckets exist, supply VERSION fresh as
`plain_text`, and verify after: version moved, `stats` identical before and
after, `op=audit` clean, all bindings still present. Expect the version
endpoints to disagree for up to a minute while edge locations propagate; poll
for convergence rather than reading one endpoint once and declaring failure.

Release signing is BUILT and ARMED as of 0.4.0. The installer carries
Bob's release public key and refuses any repository release that is not
signed by it, falling back to its own built-in copy and saying so. Bob
signs each release asset in tools/sign-release.html, a local browser
page that never touches the network, and pastes the resulting signature
block into the session. Development keys were generated July 24, 2026
and are disposable; production gets fresh keys, passphrase-protected,
before any real group installs.


## Current state and next task, as of 2026-07-25

The plane is **0.17.0**, signed, tagged `v0.17.0`, and running on
biosmoke7.believeinoakland.workers.dev. Battery 1032 assertions across 25 suites
in about 79 seconds (`npm test` in bio-plane); installer wizard 90 assertions
(`node test/wizard.test.mjs` in newgroup). Live record: 30 bundles, 87 register
rows, `op=audit` 30 checked with zero findings.

**S-10 RETRIEVAL IS COMPLETE, steps 1 through 5.** The projection, the text
index, the query language, `op=search`, and server-side selections.
`development/RETRIEVAL-SUBSTRATE.md` is the specification and its design
questions are settled, not open.

Ops, all member class and above because they read the working corpus: `search`,
`searchfields`, `searchindexcheck`, `select`, `selection`, `selectionlist`,
`selectionrelease`.

**Read the performance numbers from the bench, not from the probe (D-32).**
`npm run bench:retrieval` measures the REAL path: 5ms to 163ms at 20,000
bundles. The ~46ms ceiling in RETRIEVAL-SUBSTRATE.md was measured with a probe
object that is not the plane and must not be quoted as describing this code.

**Two workerd ceilings are load-bearing and undocumented (D-36).** A statement
binds about 100 variables; a compound SELECT takes five terms. Both were found
by the bench, both broke real code, and both are now guarded. Any new statement
shape can meet another one, so run the bench when you add one.

Open, in Bob's order of interest: D-1 (root of trust unmodelled, doctrine work),
D-9 (20 unreferenced register rows, needs an admin credential), S-9 (retire the
Apps Script plane, Bob's hands), D-15 (viewer-position filtering, when project
visibility is built; the single compilation point is in place, asserted, and now
a WHERE predicate over the alias `b`, so this is a change in one function),
D-32 (further retrieval optimisation), D-37 (the 300s keep-alive is a guess).

**The actions that refer to a selection are the natural next step.** The gate
they call already exists: `selectionResolve` takes a weight and either hands over
the members or refuses. What does not exist is any action that calls it.

---

## Next session's task: implement the membership architecture

`docs/architecture/BIO_Membership_Architecture_v1.md` is a first-class architecture
document specifying covers and handles, administrators, capabilities,
burner-URL invitations, and project participation. It was written on July
24, 2026 from Bob's specification, checked against the existing
architecture documents, and it supersedes one decision in
BIO_Technical_Architecture_Decisions v10 Section 10 (per-member tokens
deliberately not used).

Read it first. It is the design; do not re-derive it.

NOTHING IN THE DOCUMENT IS UNDECIDED. Every question was settled on July
24, 2026 and the reasoning is recorded in place.

Four obligations that are easy to miss and expensive to retrofit:

1. Project visibility has THREE positions: uninvited (the project is
   invisible entirely), invited-not-joined (skeleton only: Problems it
   stands above, Information it cites, Actions it initiates), and joined
   (everything). Do not collapse the first two.
2. The index derives reverse edges and MUST filter them by the viewer's
   position. Unfiltered, it leaks which projects are interested in which
   Information. The edge itself already lives on the citing object per
   State Rules 5.2, so only the derived projection needs the filter.
3. Administrator removal counts the TARGET in the denominator but does not
   let them vote (Section 4.7). That is what makes removal impossible at
   two administrators without a special case. Adding administrators past
   the second requires consensus, which is what stops a captured admin
   from manufacturing a majority.
4. Full working-corpus export requires the ROOT OF TRUST credential, not
   in-app administrator status (Section 8). An export any administrator
   can run is the most efficient attack in the system.

The member half below Section 7 is unblocked and can be built immediately:
identity and handle with uniqueness enforcement, the required
administrator-assigned identity label, capabilities, burner-URL
invitations replacing the current invitation code, and the two-admin
bootstrap rules in Section 4. Note that the enrolment screen shipped in
0.4.0 is UNREACHABLE (nothing calls `show("#s-enroll")`); the burner URL
is what should reach it.

ARCHITECTURE DEBT, recorded in Section 9: the root of trust is unmodelled.
Three parts of the design lean on it, and the only thing implementing it is
ADMIN_TOKEN, a bootstrap credential that became the root of trust by
accident of being the only thing that can reclaim an instance. It is a
proxy for hosting access, has no custody model, is not auditable, and
cannot be rotated without returning the instance to unclaimed. Deciding
what a root of trust should BE for a BIO group is a doctrine question of
the same weight as the membership model and deserves its own session.

Also scheduled: secure verified export (Section 8), which is what makes
every governance rule enforceable, since a group that cannot leave can be
held. The migration tooling already performs a verified transfer of the
real record, so this is productization rather than new ground.

THE CONFORMANCE AND ACQUISITION ARCS ARE DONE. PLAN.md steps S-1 through S-8
are complete and recorded there with their outcomes. The battery is 592
assertions across twenty-one suites in about 52 seconds; `npm test` in
bio-plane runs all of it and `npm run bench 20000` runs the scale harness.
The live record at biosmoke7 audits at 30 clean against the full catalog.

S-9, retiring the old plane, is Bob's: revoke the R2 key pair in Cloudflare
and the SPN2 pair in the Internet Archive account, delete the Apps Script
deployment (which retires its four bearer tokens by removing what they open),
then delete docs/development/apps-script/promotion-service.gs per its own
expiry condition. The SPN2 pair only needs revoking, not replacing, because
co-attestation went anonymous in 0.9.1.

## THE NEXT ARC IS RETRIEVAL, AND IT NEEDS A DESIGN CONVERSATION FIRST

Do not start implementing. The technical design does not exist yet, and this
is the trap that cost the membership work a whole reconciliation:

**Nothing in docs/architecture/ specifies retrieval.** The Roadmap has a
Search UX category (user-initiated retrieval, persistent requests, results
carrying provenance into Context) and that is all. FTS5, Vectorize and
reciprocal rank fusion appear ONLY in docs/development/, which is to say they
are prior sessions' intentions, not doctrine. Search the corpus and confirm
this before believing it, then ask Bob rather than inferring, the way the
membership model should have been asked about and was not.

What IS settled and should shape the conversation:

- Whole-store work inside the Durable Object costs about 0.2ms per bundle
  (S-8). A brute-force scan of 20,000 bundles is under four seconds inside
  the object and about eight on the deployed plane. Retrieval is therefore
  not needed for correctness at any plausible group's scale, which makes it a
  usability question rather than a feasibility one, and changes what a good
  answer looks like.
- `op=audit` already demonstrates the shape a whole-store operation takes:
  cursor-paginated, run where the data is, agreeing exactly with the
  equivalent pass from outside. Test/audit.test.mjs asserts that agreement,
  and any index must be held to the same standard: an index that disagrees
  with a scan is worse than no index.
- The two-bucket fence is absolute. An index over the working corpus must not
  be readable through any public surface, and the doorbell's `verify` answers
  only from the published projection. Whatever is built, the fence is not
  negotiable and no index may become a way around it.
- Conversion Plan probe 1, FTS5 virtual tables versus an exported index, is
  UNANSWERED. It was folded into S-8 optimistically and could not be measured
  because FTS5 does not exist yet. It is a real question and it now has a
  measurement harness (test/scale.mjs) to answer it in.

The member half below Section 7 is unblocked and can be built immediately:
identity and handle with uniqueness enforcement, the required
administrator-assigned identity label, capabilities, burner-URL
invitations replacing the current invitation code, and the two-admin
bootstrap rules in Section 4. Note that the enrolment screen shipped in
0.4.0 is UNREACHABLE (nothing calls `show("#s-enroll")`); the burner URL
is what should reach it.

ARCHITECTURE DEBT, recorded in Section 9: the root of trust is unmodelled.
Three parts of the design lean on it, and the only thing implementing it is
ADMIN_TOKEN, a bootstrap credential that became the root of trust by
accident of being the only thing that can reclaim an instance. It is a
proxy for hosting access, has no custody model, is not auditable, and
cannot be rotated without returning the instance to unclaimed. Deciding
what a root of trust should BE for a BIO group is a doctrine question of
the same weight as the membership model and deserves its own session.

Also scheduled: secure verified export (Section 8), which is what makes
every governance rule enforceable, since a group that cannot leave can be
held. The migration tooling already performs a verified transfer of the
real record, so this is productization rather than new ground.

THE NEXT ARC IS SPECIFIED. Read
docs/development/CONFORMANCE-AND-INTAKE-ARC.md first. It is the work plan:
make the plane conformant to the check catalog, then rebuild on it the
acquisition tooling the Apps Script accelerator carried. Order of work is in
its Section 5 and the first three steps are not optional.

Bob's direction, July 24, 2026: do not spend effort preserving what exists.
The corpus is development reference and no production system will use it
without refetching from source. Spend effort on rigorously recreating the
capture tooling on the new plane, conformant to the architecture, and on
making the storage and transport plane complete and performant.

The catalog is at bio-plane/checks/bio-checks.mjs, version 1.16.4,
hash-verified, 49 checks, zero dependencies, filesystem injected at five
seams. plane-gate/1.0 must RUN it, not reimplement it: a reimplementation is
a fourth implementation pretending to be conformance.

FOUR MEASURED DIVERGENCES, detail in the arc document Section 1: history
paths are laid out wrongly so all 30 bundles fail C-12.2; promotion records
are not projected at all so two more checks are unreachable; the manifest
kind vocabulary differs, which is what hid the second divergence; and the
gate implements four checks where the catalog has 49, which is how the
intake UI's defects shipped invisibly.

The member half below Section 7 is unblocked and can be built immediately:
identity and handle with uniqueness enforcement, the required
administrator-assigned identity label, capabilities, burner-URL
invitations replacing the current invitation code, and the two-admin
bootstrap rules in Section 4. Note that the enrolment screen shipped in
0.4.0 is UNREACHABLE (nothing calls `show("#s-enroll")`); the burner URL
is what should reach it.

ARCHITECTURE DEBT, recorded in Section 9: the root of trust is unmodelled.
Three parts of the design lean on it, and the only thing implementing it is
ADMIN_TOKEN, a bootstrap credential that became the root of trust by
accident of being the only thing that can reclaim an instance. It is a
proxy for hosting access, has no custody model, is not auditable, and
cannot be rotated without returning the instance to unclaimed. Deciding
what a root of trust should BE for a BIO group is a doctrine question of
the same weight as the membership model and deserves its own session.

Also scheduled: secure verified export (Section 8), which is what makes
every governance rule enforceable, since a group that cannot leave can be
held. The migration tooling already performs a verified transfer of the
real record, so this is productization rather than new ground.

THE C-SERIES CATALOG IS NOW IN THE REPO, hash-verified, at
bio-plane/checks/bio-checks.mjs (version 1.16.4, 49 checks, zero
dependencies, injected filesystem). The gate port is no longer blocked on
access. Read bio-plane/checks/README.md for the five injection seams that
are the whole porting surface.

THE MIGRATED RECORD IS CONFORMANT. The catalog was run against all 30
bundles on biosmoke6 and found zero content findings. Do not re-migrate.

THREE SHIPPED DEFECTS found by the July 24 consistency audit and recorded in
BIO_DATAPLANE_STATE.md: the intake UI stamps illegal first states for
Problems and Actions; it writes four frontmatter fields where the catalog
requires fifteen; and readImage emits history as _history/<key>/<path> where
the canonical layout is _history/bundle_<key>.md, which makes every bundle
fail C-12.2 against the real checker. The third is the one to fix FIRST,
because nothing else can be verified through a projection the checker cannot
parse. schema.mjs line 3 settles which side changes: the bundle format is
authoritative and the projection must never bend it.

Fix the first two with the port, not before, so the gate proves the fix
rather than the fix being asserted.

Also outstanding: the C-series gate catalog port (the plane
ships `plane-gate/0.1`, mechanical checks only), and the Conversion Plan
step 6 benchmark at 5,000 and 20,000 bundles.

Read docs/architecture/README.md before designing anything. This session's
membership work was designed BEFORE the corpus was read and had to be
reconciled afterward; that is avoidable now.

Document layout is explained in docs/README.md. The two files at the top of
docs/ are the entry points: this one and BIO_DATAPLANE_STATE.md. Doctrine
lives in docs/architecture/, operational records in docs/development/.

The state of the work lives in docs/BIO_DATAPLANE_STATE.md in this
repository. Claude keeps it current with every release.

## What the session of 2026-07-24 knew that is not written elsewhere

Recorded deliberately, because the risk in ending a long session is
undocumented context rather than unfinished code.

- **The catalog is the authority and the plane RUNS it.** `bio-plane/checks/`
  is 1.16.6 and diverges from the 1.16.4 the retired Apps Script pinned by
  two changes, both recorded in that directory's README with reasoning. Never
  reimplement a check: the three-implementation conformance requirement is
  satisfied by three callers of the same bytes, and a rewrite is a fourth
  implementation pretending to be agreement.
- **The instance page is one enormous template literal.** An unescaped
  backtick terminates it and a dollar-brace starts an interpolation, so a
  COMMENT written in ordinary prose can destroy the served script. This has
  happened twice, at 0.3.8 and again on 2026-07-24.
  `test/hygiene.test.mjs` now scans for it, loads the module, and parses what
  it serves. Trust that suite and do not hand-verify.
- **`promote` writes a whole image.** As of 0.13.1 it refuses to drop a file
  the previous revision had unless the caller names it in `drop[]`. That
  refusal exists because three separate callers destroyed evidence by
  mentioning only the file they cared about.
- **Every Miniflare instance must be disposed and every suite must exit on
  its own result.** `hygiene.test.mjs` enforces both. Three suites without
  that discipline cost about 150 seconds each per run and reported nothing
  wrong.
- **Bob's own error rate observation applies to Claude too.** This session
  introduced roughly ten defects of its own, several in shipped code: a token
  sliced at the wrong offset, a monitor that deleted provenance registers, a
  promotion record carrying pre-image hashes which silently disabled the
  mechanical audit entirely, and a benchmark measured over non-conformant
  input. Every one was caught by a test written in the same sitting, which is
  the process working. The lesson recorded for successors: write the
  violation test before the feature, and measure rather than assume, because
  the failures that cost the most here were checks that silently declined to
  run rather than checks that failed.

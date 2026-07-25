# Starting a BIO session

Claude reads everything it needs from this public repository at the start
of a session, with no credentials: the full source tree and the documents
in docs/. Attach nothing. As of July 24, 2026 that includes the whole
doctrine corpus in docs/architecture/, so the mission, the requirements,
the functional and technical architecture, the state rules, and the intake
doctrine are all readable without an upload. docs/architecture/README.md
indexes them and marks which are superseded.

Say what to work on. If the session will do any of the following, grant
the matching permission when asked, or up front:

1. SHIP A RELEASE (push code, release files, or docs to this repo):
   paste the GitHub token. It lives in Bob's notes and is long-lived by
   his decision (July 24, 2026): during development the repo holds no
   production instance and nobody else runs BIO, so per-session minting
   was pure friction. Claude cannot carry a secret between sessions, so
   the value has to be pasted once per session; that is a paste, not a
   re-mint. Revisit when a real group installs.

2. TOUCH AN INSTANCE'S DATA (migrate, load, inspect the record from the
   session): paste the MEMBER_TOKEN. Same standing arrangement.

3. INSTALL OR UPDATE AN INSTANCE: no grant needed. The installer at
   newgroup.believeinoakland.workers.dev authenticates through
   Cloudflare's own sign-in with a click.

Release signing is BUILT and ARMED as of 0.4.0. The installer carries
Bob's release public key and refuses any repository release that is not
signed by it, falling back to its own built-in copy and saying so. Bob
signs each release asset in tools/sign-release.html, a local browser
page that never touches the network, and pastes the resulting signature
block into the session. Development keys were generated July 24, 2026
and are disposable; production gets fresh keys, passphrase-protected,
before any real group installs.


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

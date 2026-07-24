# Starting a BIO session

Claude reads everything it needs from this public repository at the start
of a session, with no credentials: the full source tree and the documents
in docs/. Attach nothing.

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

`docs/BIO_Membership_Architecture_v1.md` is a first-class architecture
document specifying covers and handles, administrators, capabilities,
burner-URL invitations, and project participation. It was written on July
24, 2026 from Bob's specification, checked against the existing
architecture documents, and it supersedes one decision in
BIO_Technical_Architecture_Decisions v10 Section 10 (per-member tokens
deliberately not used).

Read it first. It is the design; do not re-derive it.

NOTHING IN THE DOCUMENT IS UNDECIDED. Sections 4.6 and 7.9 were both
settled on July 24, 2026 and the reasoning is recorded there.

Two obligations from it that are easy to miss and expensive to retrofit:

1. Project visibility has THREE positions, not two: uninvited (the project
   is invisible entirely), invited-not-joined (skeleton only: the Problems
   it stands above, the Information it cites, the Actions it initiates),
   and joined (everything). Do not collapse the first two.
2. The index derives the reverse-edge graph, and those derived edges MUST
   be filtered by the viewer's position. Unfiltered, the index leaks which
   projects are interested in which Information to every member, which
   defeats the visibility model. The edge itself lives on the citing
   object per State Rules 5.2, so the underlying data is already correct;
   only the derived projection needs the filter.

The member half below Section 7 is unblocked and can be built immediately:
identity and handle with uniqueness enforcement, the required
administrator-assigned identity label, capabilities, burner-URL
invitations replacing the current invitation code, and the two-admin
bootstrap rules in Section 4. Note that the enrolment screen shipped in
0.4.0 is UNREACHABLE (nothing calls `show("#s-enroll")`); the burner URL
is what should reach it.

Also outstanding, unrelated: the C-series gate catalog port (the plane
ships `plane-gate/0.1`, mechanical checks only), and the Conversion Plan
step 6 benchmark at 5,000 and 20,000 bundles.

The state of the work lives in docs/BIO_DATAPLANE_STATE.md in this
repository. Claude keeps it current with every release.

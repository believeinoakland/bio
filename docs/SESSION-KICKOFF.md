# Starting a BIO session

**Kickoffs are per THREAD (2026-07-30).** More than one session may be running
at once, and they must not overwrite each other's handoffs. Each line of work has
its own file under `docs/development/kickoffs/`, the first line of a session's
prompt names which thread it belongs to, and a session rewrites only its own
kickoff at the close. `docs/development/kickoffs/README.md` is the register: it
lists the active threads, the paths each owns, the append-only rules for shared
files like `DEBT.md` and the state doc, and the rule that a rejected push means
another thread landed work and must be rebased onto, never forced over.

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


## Current state and next task, as of 2026-07-26

Plane **0.32.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset. Battery **1503 assertions across 32 suites** (`npm test` in
bio-plane, about three minutes). Installer wizard 90 (`node test/wizard.test.mjs`
in newgroup). Live record: 30 bundles, 137 files, 239 history rows, 10 refs, 87
register rows, `op=audit` 30 checked and 30 clean, `op=registeraudit` sound.

Nine releases shipped on 2026-07-26, 0.24.0 through 0.32.0. `BIO_DATAPLANE_STATE.md`
carries them as v21 through v29; the v29 block at the top is what is true now and
everything below it is narrative.

**S-12 (membership) is COMPLETE.** Every section of Membership Architecture v2 is
built: capability enforcement at the op layer, the section 7 project rules
including the 7.7 reversal and 7.10 owner governance, lifecycle authority, fork,
licences, project name uniqueness, secure verified export, and 7.13.

**S-11 (selection-backed actions) is COMPLETE, 5 of 5, as of 0.34.0.** Citing, severing,
reinstating, bulk disposition of Focuses and bulk retirement of Information are
all shipped. Step 5, bulk release, SHIPPED in 0.34.0 with the recorded-acknowledgement
design: named-member authorship enforced on the author stamp's shape, the
acknowledgment and mitigation written into every released document's Session
Log, crucial refused from batches, and C-2.7 entry requirements checked before
any state moves. The Focus rename's code side shipped in 0.35.0. S-9 closed on 2026-07-27, so THE FOUNDATION LADDER S-1 THROUGH S-12 IS COMPLETE. Per Bob's three-layer roadmap, development focus moves next to UI DESIGN (standing brief: docs/development/UI-KICKOFF.md), with anchored citations and declared-bias bundles as the standing foundation arcs when called.

### Work from v2, not v1

`docs/architecture/BIO_Membership_Architecture_v2.md` is the design and nothing in
it is undecided. **v1 is superseded and must not be worked from.** Its section 7.7
says the OPPOSITE of v2's on who removes a project participant, and code was
written against the old rule before it was corrected. v2 carries a change table
at the top listing every difference.

## What is open, in the order it matters

**1. Bulk release, S-11 step 5: BOB DECIDED IN THE 2026-07-27 SESSION THAT IT
WILL BE BUILT.** His use case: a collection of 20 or 100 job applications of
interest to a project, where per-document release is tedium without protection.
His conditions: the UX must state the risks of releasing in bulk and require the
member's explicit acknowledgement of their mitigation steps before proceeding.
Design consequence agreed in the same session: the acknowledgement must land IN
THE RECORD as part of the operation's payload, not only in a browser dialog, so
a bulk release is permanently distinguishable from per-document releases and
auditable as such. This design also DECOUPLES bulk release from the
trust-inheritance question: nothing is inherited from the source; the member's
recorded acknowledgement is the trust act, made fresh, consistent with the
no-transitive-trust decision.

Scope RESOLVED, 2026-07-27, and the doctrine amended to v1.2: origin is not
the discriminator. Bob's ruling: bulk is legitimized by volume plus
little-to-no variance in the trustworthiness of the collection, whatever
brought it in (his example: applications found on a public jobs board), because
verification asserts only that a document appears to be what it claims to be,
not spam, not phishing, and never accuracy. The discriminator that remains is
criticality: crucial or contested documents are refused from bulk, whole set
refused with offenders named, because F4 co-attestation verification is
per-document work. Each batched document still receives its own member-authored
release transition, so C-18.1's mechanical rule is satisfied unchanged. Step 5
shipped in 0.34.0.

The relevant finding, which corrected an earlier overstatement in the same
session: **C-18.1 constrains WHO authors the `collected` to `verified` transition,
not how many documents move at once.** Its excluded-author list is `claude`,
`pwa-client`, `daemon`, `sweep`, `session`, `accelerator`, `apps-script`,
`system`, `agent`, `ai`. A signed-in member's session stamps the author as their
member id, which passes. The per-document requirement appears only in the
sweep-origin branch, in the words "verified requires per-document human
ratification". C-18.7, the detached release signature, is a WARNING staged until
member keys are distributed and blocks nothing today. C-2.7 separately requires a
well-formed `content_hash` for anything in the verified state, so a bulk release
cannot be a blind state flip even at the schema level.

**2. D-50**, project name uniqueness in the check catalog. The write path already
refuses a collision, so nothing can be written wrong; the catalog cannot yet
report the condition on a corpus handed in from elsewhere, which is what the
conformance path is for.

**3. D-52**, an export is recorded and discoverable but no administrator is
NOTIFIED. Section 8.1 asks for both. `export_log` and `op=exportlog` deliver the
first half. There is no notification channel in this system at all, so closing
this needs a channel decision rather than more code.

## Trust, credence and the epistemics ladder: current state, 2026-07-27

**The 2026-07-26 trust, reputation and credence brainstorm is VOID at Bob's
direction, in full.** Its content is deliberately not summarised here and must
not be recovered from history or memory as a basis for work. What stands is
only what follows.

**Mechanical facts, still true and grepped, not assumed:** the code contains no
credence, reputation, trust or confidence field, table or check anywhere in
`checks/` or `src/`. **Ratified architecture, unaffected by the void:**
`BIO_Technical_Architecture_Decisions_v10` carries No transitive trust (trust
re-established locally at every hop; credibility demonstrated by the work,
never the producer's reputation; scope is peer BIO groups and R13).
`BIO_Design_Requirements_v2` section 4: reputation accrues through consistent
quality with no authority managing the process, so anything built must be a
group's own ledger, never a shared score.

**Standing results of the 2026-07-27 session, all shipped or specified:**
verification's meaning is doctrine (v1.2): a member's reassurance that a
document APPEARS to be what it claims to be, never accuracy. Batch ratification
is legitimized by volume plus homogeneity, not origin; crucial stays
per-document (v1.2). Document-level classification is removed (0.33.0);
fact/analysis/judgment is a stance a citing project takes toward a passage.
Anchored citations (bundle, file, content hash, one or more selectors) are the
working direction for claim-level work; a reference-grammar change, not an
object-model change. A `rejected` Information state is tabled until the trust
model settles. AI never authors release.

**Bob's framing in progress, 2026-07-27, discussion continuing (bias next):**
credentials, reputation, conventional wisdom and narrative are highly
subjective, manipulable compressions; BIO's raison d'etre is to counterweight
them. Credentials are awarded yet socially assumed earned. Reputation is a
frame held by others, commonly manipulated. Conventional wisdom is sometimes a
good starting point, not always the best endpoint. Narrative sets artificial
limits on the range of discussion. Against these, BIO rests on a FORMAL WEB OF
TRUST in the internet-PKI sense: verified rests on the trust owned by the
verifying member, granted at the discretion of the instance admin, and so on up
a recorded, revocable, narrow chain. And verification is only ONE element of
trust in the store. The intended ladder, partially evident in the current
system: from Information documents the system identifies EVIDENCE; evidence is
the substrate ANALYSIS is built from; CONCLUSIONS are graded on how they follow
ONLY from evidence and analysis. The bias discussion produced DECLARED BIAS,
drafted in full at `docs/architecture/BIO_Declared_Bias_v0_1.md` (DRAFT, not
ratified): bias as a first-class, declared, justified construct; three
statement kinds (scrutiny, inference, pattern) with the malformedness rule (no
verdicts); bias bundles adopted per the group's own documented process;
project overrides structurally loud; instance locks non-overridable (Bob:
build in another instance); bias manifests in the evidentiary record; regrade
and cross-group rerun. Record further findings here as the discussion settles;
do not re-derive the void material.

## Standing lessons, all learned the hard way here

The 2026-07-26 session shipped nine releases and made an unusually high number of
mistakes doing it. Every one was caught, most by a test or by checking the
deployed instance rather than by reasoning. The pattern was always a conclusion
drawn after reading one file and before reading the next, then built upon.

1. A probe that never saw a failure has not found a ceiling, it has found the top
   of the range it was given.
2. Prefer structural assertions to fixed lists, so a later addition cannot pass by
   not being mentioned. Make them run BOTH ways: the capability suite caught two
   ops named in the capability table that no session could reach, which is a
   direction that only exists because the check runs both ways.
3. A rule that breaks old tests is doing its job. Correct the tests, do not exempt
   the rule.
4. Conformance-check the fixture BEFORE the change as well as after, or the
   after-check measures nothing. This paid twice in two consecutive releases,
   both times against fixtures written believing they were fine.
5. An unauthenticated (`classes: null`) op tested only at the Durable Object is
   untested, because the control plane is the only route a real caller has.
6. Check what the harness is actually measuring.
7. Read the enforcement path before declaring something unenforced. Name the file
   that would contain it and say whether you read it.
8. **A test that reads the RETURN VALUE instead of the RECORD proves nothing.**
   Four assertions this session passed or failed for a reason other than the one
   they named: one asked `op=get`, which does not exist, so it passed for every
   input; one asserted `f.rel`, a literal the fork method returned while never
   writing the edge; one built the string `token=undefined` because
   `setpassword` is not a control-plane op; one answered `EXISTS` because the live
   roster already held that member id from an earlier session.
9. **Version convergence is not full convergence.** After a deploy, `op=selftest`
   can report the new version on the first poll while another edge still answers
   `unknown op` for an op that release added. Poll for the BEHAVIOUR that changed,
   not the version string. This cost real time at 0.30.0 and was avoided at
   0.31.0 by polling correctly.
10. **A single sample is not a measurement.** A bench reading of 8.01ms against an
    earlier 6.46ms looked like a 24% write regression. Benching the new code
    against the previous release, twice each, gave overlapping ranges: the earlier
    figure was a quieter container, not faster code.

## Gotchas that have cost real time

- workerd binds about **100 variables** per statement, not SQLite's documented
  32,766. Chunk any `IN (...)` list; the selection code uses 64. A query dies at
  **98 metadata filter terms** on the variable limit. workerd allows **five
  terms** in a compound SELECT, not 500. Both are D-36 and both were found by a
  harness, not the suite. Note that `op=dispose` and `op=retire` are NOT subject
  to either: they issue one promote per member rather than one statement over all
  of them, so there is no list to chunk. Probed to 4,000 Focuses in one call,
  linear at about 1ms each, no ceiling found.
- **`op=projection` caps at 200 rows.** A test helper that scans it silently stops
  finding things exactly when the corpus gets big enough for scale assertions to
  matter, and reports it as a crash rather than a miss. Ask for the one bundle
  with `?id=`, which returns a single row and not an array.
- **Deploy update shape.** Mirror `uploadUpdate` in `newgroup/src/index.mjs`. Use
  `keep_bindings: ["secret_text", "durable_object_namespace"]` or the PUT deletes
  the instance's tokens. Send **no migrations field**.
- **`ssh-keygen` will not load a raw `BIOKEY-RAW1` seed**, and the repo's own
  signer is browser-only (`src/signpage.mjs`). To sign in-session, reconstruct the
  SSHSIG path in Node from that page's algorithm, out of tree in `/tmp`, and
  verify the output with stock `ssh-keygen -Y verify` plus negative controls for
  altered bytes and a wrong namespace.
- **Backticks in a `git commit -m` string are command-substituted** and silently
  delete the word inside them. Use `-F` with a file or a heredoc.
- **`git -c user.email=...` carries to commit but NOT to `git tag -a`.** Configure
  the identity in the repo.
- Cloudflare `/content` refuses an API token. To read back deployed bytes, GET the
  script itself, which returns a multipart envelope containing `index.mjs`.
- `python3` urllib gets 403 from Cloudflare's bot filter on instance URLs. curl
  and node `fetch` work.
- `ssh-keygen` may be missing. `apt-get update` FIRST, then
  `apt-get install -y openssh-client`.
- `npm install` in bio-plane before running anything. Miniflare suites must run
  from inside bio-plane.
- A promote payload with an empty POST body used to throw; fixed in 0.21.1, but
  send `{}` rather than nothing.
- **The second member of a group must be an administrator, and there are no
  ordinary members until two exist** (4.2, 4.3). A test fixture that adds an
  ordinary member first fails with `ADMINS_FIRST`, and one that hardcodes an
  endorser list builds no administrator at all and then asserts against a member
  who does not exist. Discover the administrator set rather than guessing it.

## Verification discipline that has repeatedly paid off

Write the failing case first and confirm it fails for the reason you think. If it
does not fail, say so and fix the claim rather than the comment.

A pass at small scale is not a pass. Scale it until the assumption breaks.

Verify against the deployed artifact and the live instance, not only the source
and the suite. Compare the deployed bytes to the signed release asset.

Include negative controls. A verifier that says yes to everything says nothing.

**RUN THE RELEVANT HARNESS BEFORE SIGNING.** `npm run bench:retrieval` (the query
path at 20,000, paging integrity, the facet head-to-head, and the participation
filter), `npm run bench` (the store), `npm run probe:cite` (the citing write),
`npm run probe:limits` (workerd's undocumented SQL ceilings). Run the relevant one
before signing anything that changes a statement shape or what a write emits, and
read its worst-shape line.

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

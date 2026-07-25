# BIO data plane: source state, migration plan, and build status

v14, July 25, 2026. Current state, on top of the v13 narrative below. The plane
is 0.14.1. The development instance is now biosmoke7.believeinoakland.workers.dev
(v13 below still names biosmoke5/6; the record moved forward with each fresh
install). The live record is 30 bundles, 87 register rows, and audits 30 clean
against the full 49-check catalog run inside the object via `op=audit`. The
battery is 660 assertions across 21 suites in about 52 seconds; `npm test` in
bio-plane runs all of it. plane-gate is `plane-gate/1.0` running the catalog
(1.16.6) rather than the `plane-gate/0.1` mechanical subset the v13 text
describes.

**Retrieval probe 1 answered (July 25).** FTS5 exists in the Durable Object's
SQLite and was measured against an exported index at 5,000 and 20,000 bundles
with three-way exact agreement against a brute-force scan. FTS5 wins on
corpus-independent selective latency, on being the one-call-in-answer-out shape
D-26 chose, and on keeping the index behind the two-bucket fence. Record and
open design questions in `development/RETRIEVAL-PROBE.md`; plan step S-10. No
retrieval op ships until the design questions are answered by Bob. The plane
source is unchanged by this probe.

**Retrieval probe 2 answered (July 25).** Bob set the scope: the surface is
search, filter, list, sort, and select, with Google-like query syntax and
searchable metadata and frontmatter, not free text alone. Probe 2 measured the
four verbs probe 1 did not. The engine has every feature the query language
needs, including nested booleans, phrases, prefix, NEAR, bm25, snippets,
column-scoped terms, JSON1, generated columns, and expression indexes. Typed
indexed columns beat a facet table by about 9x on write cost and 5.5x on space,
with JSON1 covering the heterogeneous per-schema frontmatter tail, so no facet
table is needed. Nothing exceeds about 46ms at 20,000 bundles, sidebar facet
counts included, and all shapes agree exactly with an unindexed ground truth at
20,000 and on the real 30-bundle corpus. The current `bundles` projection covers
roughly half the frontmatter the UX must filter on and needs extending. Record in
`development/RETRIEVAL-SUBSTRATE.md`. The plane source is unchanged by this probe
as well.

**Retrieval design settled, and one fence hole closed in 0.14.1 (July 25).** Bob
answered all five design questions, so S-10 is unblocked: `source.locator` and
`source.authority` are searchable, a result carries ids plus full provenance,
default order is relevance with reordering trivially available, and a selection is
a server-side construct rather than a client-held set. Search ships at flat member
scope ahead of the membership model, with the D-15 viewer-visibility filter
designed in as a single compilation point that returns true for a member today, so
satisfying D-15 later is one function rather than an audit of every query path.

0.14.1 is the one source change: `op=index` no longer grants the `public` token
class (D-30). It reads the working-corpus `bundles` table while the module's own
header says the public class is published-scope reads only, so a public credential
was receiving every bundle's id, title, current state, last-updated time, and
image hash. `publishedlist` remains the public listing surface and reads the
projection that has never held unratified material. A new suite,
`test/fence.test.mjs`, holds the boundary and is run against the built `dist`
artifact as well as `src`; it was written first and failed on exactly the three
assertions covering the hole. The battery is now 22 suites.

**0.14.1 is cut, signed, and published**, tag `v0.14.1`, asset sha256
`9bccbd44596b1ad423afc5f256a679e0c22519458fe0cabe91a2c3bdbc84a37a`. Signed with
the `bio-release` key in the `bio-release` namespace over the asset bytes. Verified
four ways with negative controls at each: the signing key derives exactly the
public key compiled into the installer's `ARMED_SIGNERS`; stock `ssh-keygen -Y
verify` accepts it and refuses both a wrong namespace and altered bytes; the
repo's own `verifySshsig` accepts it and refuses wrong namespace, altered bytes,
and a stranger-only allow list; and the installer's real verification path accepts
the committed manifest. Finally the published bytes were fetched back from
`raw.githubusercontent.com/believeinoakland/bio/main/release`, the path the
installer actually uses, re-verified, and confirmed to carry the ACL fix. The
deployed instance still runs 0.14.0 until someone with Cloudflare credentials
deploys; no `PUBLIC_TOKEN` is set there, so nothing was exposed in practice.

---

v13, July 24, 2026. THE WRITE ARC IS BUILT AND LIVE ON BIOSMOKE6 (tree
0.4.1, 328 assertions green across fifteen suites, whole plane battery 20
seconds). 0.4.1 adds the instance-served signing page and the plain-words
roster refusals described at the end of this section. Members, intake, the gate, the doorbell,
and release signing all ship together, and the instance page is now a
working front end rather than a read-only window.

**Member credentials.** Admin invites a member, who spends a one-time
code to set their own password. Passwords live as PBKDF2 hashes under
credentials role `member:<id>`, which is why sessions and credentials
needed no schema change. Revoking a member kills their live sessions,
their login, and their signing keys in one stroke.

**Sessions can now write intake.** This reverses the 0.3.8 rule that a
signed-in browser could only read. A session may promote, lease, allocid,
capture, ratify, and review the inbox; it may never purge or run the
live-fire battery, and only an admin session may touch the roster.
Authorship is stamped server-side from the session, so a browser cannot
write history as someone else; the members suite proves it by sending an
author of "IMPOSTOR" and finding the real member in the record.

**The gate** is plane-native and versioned `plane-gate/0.1`, recorded on
every publish. It is honestly scoped to mechanical integrity: frontmatter
coherence, live hashes against the recorded bundle_sha, the base chain
against history snapshots, registered captures present in R2 at the
recorded size, and no dangling references. The full C-series catalog
still lives in the record rather than the repo and is a later port, which
is why the version string exists.

**Ratification.** Authority is an SSHSIG over `bio-ratify <id> <sha>`
from a registered active member key, verified against the signer
registry. It has its own CAS, so you can only publish the revision you
read. Publishing copies bytes content-addressed into the PUBLISHED
bucket and appends hash rows; re-ratifying converges, and a hash once
published verifies forever, including after later revisions.

**The doorbell.** `verify` is unauthenticated and answers ONLY from the
published projection, so working material cannot leak through it.
`knock` accepts material from anyone into a quarantined inbox, capped at
8MB with R2 or 64KB inline, rate-limited to 12 per source and 300 per
instance per ten minutes, transactional so a race cannot slip the caps.
Worst case under attack is a full inbox.

**Release signing is armed.** RELEASE.json carries `sig` and `signer`;
the installer holds Bob's release public key in ARMED_SIGNERS and refuses
any repository release that is unsigned, signed by a stranger, or signed
for a different purpose, falling back to its built-in copy and saying so
in plain words. Namespace separation means a ratification signature can
never install software. Bob signs in `tools/sign-release.html`, a single
local file with no network access, whose output stock `ssh-keygen -Y
verify` accepts. Development keys were generated July 24, 2026 and are
disposable; production gets fresh, passphrase-protected keys.

**The instance page** gained: member sign-in by name, create a bundle,
revise through lease plus CAS, inbox review with dispositions, member and
key administration for admins, enrolment for invited members, and a
publish panel that shows the exact id and hash to sign and explains every
refusal in plain words. The browse suite still parses AND executes the
served script, which is what caught the 0.3.8 generation defect.

**Standing credentials, revised by Bob (July 24).** Long-lived GitHub and
MEMBER tokens are acceptable during development; per-session minting was
friction without a threat, since nobody runs BIO while it is in
development. Claude still cannot carry a secret across sessions, so the
value is pasted once per session. Revisit at production.

**Two test-harness defects found by measuring, both costing hours.**
First, three suites written this session built Miniflare and never
disposed it. Miniflare runs a real workerd child process, so each suite
printed its result in about a second and then hung until something killed
it: roughly 150 seconds per suite per run, with nothing failing and no
symptom except slowness. Second, the whole plane battery now runs as one
command. `npm test` covers all fourteen suites in 23 seconds, and it runs
`hygiene.test.mjs` FIRST, which reads its sibling suites as text and
fails the battery if any of them constructs a Miniflare it does not
dispose, or ends without exiting on its own result. That guard caught
four older suites relying on the event loop draining; all are now
uniform. The lesson recorded for future sessions: measure before
theorising about performance, because both defects were invisible to
every assertion and obvious to a wall clock.

**One defect found and fixed in the existing wizard suite.** Four probe
stubs answered `{ ok: true }` without the `bindings.STORE` field the
installer requires, so `verifyInstall` exhausted ten retries at three
seconds each in eight blocks. The suite spent 240 of its 241 seconds
asleep and three original blocks had been silently exercising a failed
verification path. Fixed; the suite now runs in under a second.

**0.4.1, from watching Bob use it.** Three things were opaque or wrong.
(a) The instance asked for "the public key from the signing page" with no
link to any such page and no way to tell which of a member's two keys it
wanted. The plane now SERVES the signing page at `/sign`, embedded at
build time by `scripts/embed-signpage.mjs` from the same
`tools/sign-release.html` the conformance suite tests, and the roster page
links to it and explains in two sentences where a key comes from and why
the public half is safe to hand around. (b) The key box now reads a pasted
line back in words before it is committed, naming the label it sees and
refusing the RELEASE key by name if that is what was pasted. (c) Roster
refusals printed raw store codes (`BAD_MEMBER_ID`); they are now sentences,
and the member-name field normalizes what is typed instead of rejecting a
capital letter.

**A generation defect caught before it shipped.** The first cut of the key
reader used `split(/\s+/)` inside the page template, and the template ate
the backslash, so the browser would have received `split(/s+/)`: valid
JavaScript that splits on the letter s. That is the identical mechanism
that broke 0.3.8. The browse suite now executes the SERVED script and
asserts the key reader's behaviour, which is the only way this class of
defect is visible, and the page avoids backslash escapes entirely.

## Consistency audit, July 24, 2026

Run after the doctrine corpus and the Apps Script promotion service were both
brought into the repository, comparing the documents, the authoritative check
catalog, and the shipped plane against each other. The catalog is
`bio-plane/checks/bio-checks.mjs`, version 1.16.4, hash-verified against the
constant the accelerator pinned beside it.

**Finding 1: the plane's intake UI creates bundles the catalog would refuse.**
Severity: real defect, shipped in 0.4.0 and 0.4.1.

The "Add something new" form stamps `current_state` from a table reading
`{information: collected, problem: forming, project: forming, action: forming}`.
Only two of those are legal. The catalog's `STATES` table is:

| type | legal states |
|---|---|
| information | collected, verified, retired |
| problem | surfaced, elevated, deferred, dismissed |
| project | forming, investigating, matured, closed |
| action | planned, active, awaiting_response, resolved, abandoned |

So a Problem created through the browser lands at `forming`, which is not a
Problem state at all, and an Action lands at `forming`, which is not an Action
state. Check C-4.1 refuses both. `plane-gate/0.1` does not implement C-4.1, so
the plane accepts them silently and the defect is invisible until the catalog
is ported. Correct first states are `surfaced` for a Problem and `planned` for
an Action.

**Finding 2: the plane writes four frontmatter fields where fifteen are
required.** Severity: real defect, same scope.

`CORE_FIELDS` requires id, object_type, schema, title, current_state,
prior_state, created, last_updated, produced_by, group, references,
state_history, annotations_open, reeval_pending, visuals. The intake form
writes id, object_type, current_state, and title. Check C-2.2 fires once per
missing field, so every bundle created through the browser carries eleven
errors. The canonical headings per type (C-3.1) are also unmet: the form
writes `## Summary` for every type, which is right only for Information.

Both findings have the same root cause. The intake UI was written against the
plane's own tolerant store rather than against the catalog, because the catalog
was unavailable. It is available now.

**Finding 3: the plane's history projection is incompatible with the
authoritative checker.** Severity: real defect in the plane's read path. NOT a
migration defect.

The catalog was run against all 30 migrated bundles on biosmoke6, the first
time the authoritative checks have ever been applied to the live record. Result:
30 of 30 bundles report errors, and every one of the 168 errors is the same
check with the same shape:

```
C-12.2: history file '_history/20260719T044000Z_9ed7a0c8/bundle.md'
        maps to no manifest entry
```

The cause is a layout disagreement, not missing or corrupt content. The plane's
`readImage` emits history as a directory path:

```
_history/<snap_key>/<path>              store.mjs line 59
```

The canonical bundle layout, which the catalog parses and which Drive used, is
flat with the key as a filename suffix:

```
_history/bundle_<snap_key>.md          bio-checks checkHistoryCoherence
```

Same snapshots, same keys, same bytes, different arrangement. The catalog looks
for `bundle_<key>.md` beside the manifest, finds a directory instead, and
reports every snapshot as unaccounted for.

**Which side is wrong is not a matter of taste.** `schema.mjs` states the rule
in its own second line: "The bundle format is authoritative; this is a
projection of it and must never bend it." The plane's projection is the
deviation and the plane is what changes. Rewriting the catalog's path
expectations would bend the format to fit the projection, which is the one thing
the rule forbids.

**What this result says about the migration: it is sound, and now
independently so.** Beyond the projection mismatch there were ZERO findings.
No missing core fields, no illegal states, no wrong headings, no unresolved
references, no append-only violations, no hash mismatches, no release-authority
violations. The catalog checked frontmatter contracts, state legality and
transition edges, append-only surfaces against history snapshots, reference
resolution across the whole store, citation registers, provenance registers,
and mechanical-writer conformance, and found the migrated content conformant
throughout. The earlier migration verification compared the plane against the
Drive mirror; this is a stronger statement, because it checks the content
against the specification rather than against its source.

**There is therefore no reason to wipe and re-migrate.** The record is intact.
One function in the plane's read path emits the wrong shape.

**Finding 4: the relationship vocabulary disagrees between document and
implementation.** Severity: documentation drift.

State Rules 5.1 declares the vocabulary "closed until amended by this spec" and
lists six values: cites, relates_to, elevated_into, initiates, derived_from,
supersedes. The catalog's `REL_VOCAB` carries a seventh, `corroborates`. The
implementation is ahead of its specification, and since the spec claims to be
the closed authority, the document needs the amendment rather than the code
needing a change.

**Capture integrity, verified independently.** The conformance run above
ELIDED capture bytes, because the plane's image returns blob references rather
than content, so C-18.6 (registered hashes verify against stored bytes) was
skipped. Provenance rests on precisely that check, so the conformance result did
not cover it. Closed separately: all 67 distinct captures referenced anywhere in
the record, live or historical, were fetched and hashed in this session.

```
verified byte-identical : 67
hash mismatch           : 0
absent from storage     : 0
total bytes hashed      : 148.4 MB
```

Census also matches: 28 information, 1 problem, 1 project, 30 total, which is
what the Drive store held.

**One residual, small and named.** The register holds 87 rows; 67 are referenced
by a file in some revision of some bundle. The remaining 20 are registered
captures nothing in the record points at, most plausibly bytes superseded by a
later revision plus the dropped transport twins, and they were not verified
because nothing references them. Storage bookkeeping rather than provenance:
no claim in the record depends on them.

**The boundary of what is known.** Two things are established: the record is
conformant to its own specification, and every capture it references hashes
correctly. One thing is not: this session has never read the Drive store, so
fidelity to the source rests on the migration tool's own comparison against the
Drive mirror rather than on independent confirmation. Spec conformance is the
stronger check for the purposes the record serves, and it is the one that was
missing until now, but it is not the same claim as source fidelity and should
not be reported as though it were.

**THE STORE OF REFERENCE IS NOW BIOSMOKE6.** Decided July 24, 2026 on the
evidence above. The Drive CivicOS store is demoted to a frozen snapshot: it is
kept, it is not written to, and it is not of record. Two planes of record cannot
coexist, and the one with independent verification wins. Note the standing
qualification Bob attached: this corpus is real data taken from the web, and no
production system will ever use it without refetching from source, so its role
is development reference rather than evidentiary archive.

**What else was checked and found consistent.** Object type prefixes and their
type-root mapping; Project lifecycle and the work-product readiness ladder
against State Rules 4.3; Action kinds and risk tiers against 4.4; the
`bio-release` SSHSIG namespace, which the plane, the catalog, and the member
key registry all agree on; and the intake doctrine's release-authority rule
that a collected-to-verified transition is never authored by a surface or AI
identity, which the catalog enforces as C-18.1 and the plane's ratification
signature requirement independently satisfies.

NEXT: port the C-series catalog into the gate (needs the record), the
5,000 and 20,000 bundle benchmark from Conversion Plan step 6, and the
retrieval arc.

## The source of record, verified live today

FROZEN SNAPSHOT as of July 24, 2026, no longer of record. The former source
lived in Google Drive under `CivicOS`
(ID `1xBxJIjOCHShLqoo5fJx-Aevlu2397GuU`): `information/` (28 bundles),
`problems/` (1, state elevated), `projects/` (1, state forming),
`actions/` (0), and `index/` holding `index.json` (registry v0.12.10, all
30 bundles with locator, state, and live bundle.md sha256) plus
`invocations.jsonl`. The accelerator daemon remains live during
development; the CivicOS zip Bob downloads is the migration snapshot. Canonical IDs
include the slug, so the repeated numeric prefixes at 0100 and 0106 are
distinct IDs, not collisions.

Nothing in the store is in a ratified state: the whole migration lands in
the working corpus, and bio-published starts empty until the first real
ratification on the new plane. `INFO-2026-5460-member-release-key-registry`
(verified, July 22) must arrive intact; signature enforcement depends on
it. 0098 (accelerator selftest) and 0120 (D5 acceptance test) are test
material; they migrate anyway and can be deleted later through the normal
path.

## Bundle anatomy and the capture evidence chain

Each bundle: `bundle.md`, `data/*.json`, `_history/` (snapshot pairs
`bundle_<stamp>_<hash8>.md` + `promotion_<stamp>_<hash8>.json`, archived
data files in a nested `data/`, `manifest.json`), and for capture-bearing
bundles `snapshots/` holding up to three forms per capture: the binary, a
`.b64` transport twin, and an RFC 3161 `.tsr` token.

Verified against INFO-2026-0103's actual records:
- Promotion records are `{target, base, files:[{name, sha256, encoding?}],
  created, author, skill_version}`; creation base is the empty-string SHA.
- Entries marked `encoding: "base64"` hash the single-line base64 transport
  text, not the binary. The authoritative binary hash is
  `capture.sha256` in `data/provenance.json`.
- The RFC 3161 token attests the `.b64` file's bytes (freetsa.org names
  the `.b64` form as its token_file). But base64 is a deterministic
  function of the binary, so the stamped bytes can be regenerated on
  demand and the twins are droppable transport remnants. Final policy:
  each twin is verified to decode to its binary AND to be byte-exactly
  reproducible by re-encoding, its hash is recorded in the provenance
  capture as the proof, and it is dropped. A twin that is not
  byte-reproducible is genuinely load-bearing for its token and is kept,
  flagged. A twin that lies aborts its bundle. Expected on the real
  store: every twin dropped.

Volume: low hundreds of MB dominated by PDF captures, twins excluded,
far inside the R2 free tier.

## Conversion Plan reconciliation (July 23 plan vs today)

Sequencing steps 2 through 4 of the plan (plane layer, core port, client)
were executed as the bio-plane conversion; the plane stands at 147 green
assertions across seven suites. Step 5, migration and acceptance, is what
this arc delivers. Of the four Section 2 probes: probe 3 (R2 at real
object sizes) is answered by the July 23 live measurements; probe 2 is
partially answered by the scaling runs; probes 1 (FTS5 virtual tables vs
export) and 4 (Vectorize under the cap) belong to the retrieval arc, which
per the plan's own lean ships after parity, and probe 1 only bites once
FTS5 tables exist. The plan's acceptance criteria are folded into the
migration tool's verification pass below. Retrieval architecture (plan
decision 1) and its scheduling (decision 2) remain open and are not
blocking the migration.

## What was built and proven today (tree 0.3.4)

**The capture op.** The plane had no way to move capture bytes: promote
records blobSha references, but nothing on the public surface wrote R2.
Any future client faces the same wall, so this is a plane feature, not
migration scaffolding. `op=capture` PUT lands bytes content-addressed
under `<store>/captures/<sha256>`, server-verifies the body hash against
the parameter, treats existing keys as immutable (re-put answers ok,
existed true, writes nothing), and GET reads bytes back honouring Range.
Probe confinement to scratch holds mechanically through the store prefix.
19 assertions.

**The migration tool** (`bio-plane/migrate/migrate.mjs`, runbook in
`migrate/README.md`). Front-door replay: reconstructs every revision state
of every bundle backward from `_history`, prunes files that had not yet
been created, cross-checks every reconstructed state against the SHA-256s
in the original promotion records (encoding-aware) and every base against
the prior revision's bundle.md hash, then replays forward through promote
with the Drive snapshot keys passed verbatim as snapKeys. Captures,
twins, and tokens travel through the capture op. The original promotion
records, manifest, and index entry migrate verbatim as a registered
`migration/drive-provenance.json` capture per bundle. Verification then
compares the plane's image against the mirror file by file, history key by
history key, checks the live hash against the index entry on both sides,
and range-reads every capture back byte-identical. Any failure aborts that
bundle with nothing partial landed, and a re-run refuses at creation
through the CAS. 35 assertions against a fixture modeled on the observed
store, including the tampered-twin abort, the b64-only recovery path, and
a kept unreproducible twin.

Plane totals: 24 store, 14 purge, 18 bootstrap, 18 livefire, 27 installer,
19 capture, 35 migrate, all green (155 total). Wizard untouched at 59 green. Tree 0.3.5.


## Migration rehearsal: DONE, all 30 bundles clean (this session)

The full real store (the CivicOS zip downloaded 2026-07-24 14:41 UTC,
151MB, 411 files) was migrated end to end into a local plane instance in
the session container and verified clean: exit 0, 30 bundles, 121
promotions replayed, 137 live files, 239 history revisions under the
original Drive snapshot keys, 10 cross-references, 87 registered
captures, 1.1MB of metadata. Per-bundle ledger in
`MIGRATION-REHEARSAL.log`.

Real-store facts the rehearsal established, now encoded in the tool:

- The daemon originally wrote captures under `.b64` transport names and a
  later daemon pass (0.11.x member-attest) decoded them, deleted most
  transport files, and re-issued RFC 3161 tokens. The tool synthesizes
  derivable historical transports (validated against the records' own
  hashes) and preserves the recorded hash where bytes are truly gone.
- 26 first-generation timestamp-token transports are unrecoverable; each
  is documented with its recorded hash in the per-bundle
  drive-provenance capture. All CURRENT tokens migrated byte-exact.
- 10 reproducible transport twins dropped with proofs; 12 captures
  verified against the store's own provenance registers, including the
  split-part budget book reassembly check.
- The selftest bundle's rotated early history is handled as documented
  truncation. Refused-write records and packages are preserved verbatim.
- INFO-2026-0301's split `.p000`/`.p001` parts migrate as recorded
  first-class files; concatenation verified against `capture.sha256`.

The identical command loads biosmoke5 once it is reachable and current.

## Standing credentials process (agreed July 24)

Claude has no storage between sessions and its cross-session memory is
prohibited from holding credentials, so standing access means a process,
not a stored secret. The repo write token is supply-chain sensitive: the
repo is the distribution channel and its integrity manifest lives in the
same repo, so a leaked token could ship a poisoned release. Process:

- Cloudflare: already solved. Installs and updates authenticate through
  Cloudflare's own sign-in inside the wizard, approved by a click, no
  credential in chat. Instance work (like migrations) uses a throwaway
  token set in the Worker's settings and rotated after.
- GitHub: Bob keeps the token recipe in his password manager: GitHub,
  profile, Settings, Developer settings, Fine-grained tokens: 7-day
  expiry, only believeinoakland/bio, Contents read-write. Mint per
  release session, paste in chat, delete after. Under a minute.
- The relaxation that makes long-lived tokens acceptable later: signed
  releases, verified by installers against the member release key
  registry (INFO-2026-5460), planned with the write arc. After that, a
  leaked repo token cannot poison installs, and a long-lived token in
  the password manager becomes reasonable convenience.

## Getting the repository live: Bob's two browser steps, then Claude

1. Create a GitHub account (or organization) named exactly
   `believeinoakland` at github.com. If that name is taken, pick another
   and tell Claude the actual name so the installer constant can be
   re-cut; nothing else changes. Then create a new PUBLIC repository in
   it named exactly `bio`, empty, no README.
2. Mint Claude a credential: GitHub Settings, Developer settings,
   Personal access tokens, Fine-grained tokens, Generate new token.
   Repository access: Only select repositories, believeinoakland/bio.
   Permissions: Contents, Read and write. Expiration: 7 days. Paste the
   token in chat. It is burned by chat exposure; delete it from GitHub
   when the session is done.

Claude then pushes the full source tree, the release/ folder
(RELEASE.json plus bio-plane.bundled.mjs), and a v-tag, and verifies the
installer's fetch paths answer. Every future release: attach the current
tree zip in a session, provide a fresh short-lived token, and Claude
pushes source, release files, and tag. Bob pastes the wizard only when
the wizard itself changed, and the delivery note will say so.

One paste remains to activate repo distribution: newgroup-0_3_11-paste
into the newgroup Worker, after the repo is live.

## Deployment picture and migration sequence

biosmoke5.believeinoakland.workers.dev is THE development instance. All
development, including the trial migration of the real record, runs
against it. It will be wiped and a fresh production instance installed
once the workflow is ready for real work. Until then, the Google Drive
CivicOS store remains the permanent record of authority and the Apps
Script daemon keeps running; nothing on the Drive side is decommissioned
during development.

Installer hardened this session (tree 0.3.6, wizard 67 assertions green,
by Bob's direction that the installer must do everything because real BIO
groups are not tech savvy):

- Evidence storage (R2 buckets plus bindings) is now REQUIRED at install.
  If the account has no payment method, the installer stops before
  creating anything, with a plain-words page explaining the one Cloudflare
  prerequisite and the exact next step. No more half-instances like
  biosmoke5.
- The update path now self-heals: it creates the buckets and binds them
  explicitly when the account allows, quietly completing any copy
  installed before storage was required. Storage trouble never blocks an
  update.
- The unconfirmed-version ending is no longer a red failure. It reads as
  done, with a patient note that new addresses take a few minutes, which
  is true and normal. (Root cause of the confusing screen: every release
  used to report version 0.3.0, so confirmation could never see a change.
  Versions are now truthful and aligned; this release is 0.3.6
  everywhere.)

Development migration (repeatable, disposable):

1. DONE: payment method on the believeinoakland account.
2. Bob pastes the delivered newgroup-0_3_6-paste.mjs into the existing
   newgroup Worker (dashboard, Edit code, replace module, Deploy) so the
   live installer carries release 0.3.6 with required storage.
3. DONE: biosmoke5 deleted; biosmoke6 installed by the 0.3.6 installer,
   complete and claimed, storage proven live.
4. DONE this session: rehearsal migration of the full real store into a
   local plane, all 30 bundles verified clean (section above).
5. DONE: the full record loaded into biosmoke6 and verified, 30 of 30
   clean, via a throwaway MEMBER_TOKEN since rotated back. After any
   future wipe: re-download CivicOS, set a fresh throwaway, rerun the
   same command; resume makes interruptions harmless.
6. DONE: the read view (tree 0.3.8, browse suite 17 assertions). The
   instance page, after password sign-in, opens the record: bundles
   listed by type with states, each bundle readable with its rendered
   record, its files, downloadable captures, and its full append-only
   history including viewing any past revision. Sign-in sessions can
   read everything and write nothing; every write still requires a
   machine credential. To put it live: Bob pastes newgroup-0_3_8-paste
   into the newgroup Worker (Edit code, replace, Deploy), then runs the
   installer's /update against biosmoke6. This is also the first real
   update of a loaded instance: version goes 0.3.6 to 0.3.8 and the
   record must come through untouched, which the browsing page then
   proves by eye. NEXT: the write side of the workflow (member
   credentials, intake, promotion through the gate) and, per the
   Conversion Plan, the retrieval arc. ALSO NEXT, per Bob (July 24): the
   Conversion Plan step 6 benchmark has not run as such. Real live
   measurements exist and beat the plan's refutation thresholds by wide
   margins (July 23, on real infrastructure: whole-store pass 112ms at
   504 bundles against a refute-over-10s threshold; ~100ms fixed round
   trip; R2 ~32MB/s with 220-250ms per-object overhead; and today, the
   full 30-bundle record with 87 captures migrated and verified over the
   public internet in minutes). What has NOT been measured: synthesized
   stores at 5,000 and 20,000 bundles on the deployed plane, which is
   the formal benchmark against the plan's prediction table. It should
   run before the retrieval arc, using the plan's own tool approach, and
   costs about half a session.

7. REQUIRED IN THE WRITE ARC, per Bob (July 24): doorbell operations, a
   public surface safe even under attack, safe by construction:
   (a) public verification scoped to ratified material only: anyone can
   ask whether a document's SHA-256 is in the PUBLISHED record; the
   published corpus has never seen unratified material, so there is
   nothing to leak. (b) public intake, the knock: outsiders submit
   material into a quarantined inbox namespace confined the way probe is
   confined to scratch today, size-capped and rate-limited, touching
   nothing until a member pulls it through the gate. Worst case under
   attack is a full inbox. Ships with ratification and member review,
   which it depends on.

Production cutover (later, once the workflow is ready):

7. Install the production instance via the installer (the real test of
   the wizard's R2-create branch, now that a card is on the account).
8. Disable the daemon permanently, confirm the index files go quiet for a
   full trigger interval, download CivicOS one final time, run the same
   migration runbook against production, verify, prove with eyes.
9. Wipe biosmoke5. Decommission the old 0.2.0 test deployment on the old
   account (delete the Worker, empty and delete both old buckets; the 504
   scratch bundles die with them). This can also happen earlier at any
   point, since nothing needed lives there.
10. Zone move still waits on the Network Solutions registrar transfer.

The daemon is never repointed at the plane; its Apps Script substrate
assumptions do not carry. Its plane-native replacement is future work in
the retrieval-and-beyond arc, before production cutover.

## Live findings on the Cloudflare side, from this morning, unchanged

- `bio-plane.neocloudflare.workers.dev` (0.2.0) answers on the legacy root
  form; the 0.3.x SECRETS.txt tokens are denylisted by design and are not
  the deployed ones. Nothing in the old store is needed; Drive is the
  record of authority.
- `newgroup.believeinoakland.workers.dev` answers 200.

## Open items

- Installer remainder 2 (host the invitation page at
  believeinoakland.org/newgroup on the old account) is still open.
- The workflow front end (the healthy-page dead end) is unbuilt; the
  migration wants at least a minimal read view for step 6.
- Retrieval arc: probes 1 and 4, then FTS5 plus Vectorize plus RRF, per
  the Conversion Plan. Not blocking.

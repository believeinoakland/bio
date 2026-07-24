# BIO data plane: source state, migration plan, and build status

v13, July 24, 2026. THE WRITE ARC IS BUILT (tree 0.4.0, 324 assertions
green across fifteen suites, whole battery 23 seconds). Members, intake, the gate, the doorbell,
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

NEXT: port the C-series catalog into the gate (needs the record), the
5,000 and 20,000 bundle benchmark from Conversion Plan step 6, and the
retrieval arc.

## The source of record, verified live today

The real record lives in Google Drive under `CivicOS`
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

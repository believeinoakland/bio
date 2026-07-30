# Thread CAPTURE: paste-ready kickoff

Rewritten 2026-07-30 at the close of the source-access session. See
`kickoffs/README.md` for the thread register and the append-only rules, and
`kickoffs/BATON.md` for the release baton, which CAPTURE currently holds.

This thread owns the capture and citation machinery in the plane:
`bio-plane/src/subresources.mjs`, `src/cpu.mjs`, the capture and link tables in
`src/schema.mjs`, the capture ops in `src/index.mjs`, the link and capture
functions in `src/store.mjs`, the capture and authority checks in `bio-checks`,
and `test/subresources.test.mjs`. It does NOT own `civicos-ui/**` or
`docprofile/**`.

Bob pastes the block below verbatim and fills the three grant slots. Everything
the session needs it fetches for itself from the public repo; Bob attaches
nothing.

---

Kickoff: thread CAPTURE. Fetch these from
raw.githubusercontent.com/believeinoakland/bio/main and read them before anything
else: docs/development/kickoffs/README.md (the thread register and the
never-force-push rule), docs/development/kickoffs/BATON.md (who may cut a plane
release; CAPTURE holds it), docs/development/DEBT.md (D-91 through D-100 are this
session's work; take the next free D-number at the moment you write),
docs/development/SOURCE-ACCESS.md (rewritten 2026-07-30 from measurement: the
oaklandca.gov refusal was OUR user-agent, not the City's policy, and the previous
version of that document was wrong), docs/development/AUTHORITY-AND-TRUST.md
(Bob's rulings on delegated trust, three-valued authority, and the task list;
sections marked RULED are settled and are not to be re-litigated),
docs/development/ARCHIVE-FALLBACK.md (the archive as a BACKUP source only, what
it can and cannot attest, and the third-party rate limits which are not our
measurements), docs/development/MEASUREMENTS.md (every number the project's
limits rest on, with its date and instrument),
docs/development/LINK-FIDELITY.md (the link and citation design; RATIFIED
markers are Bob's rulings), docs/development/CAPTURE-SCALING.md,
docs/development/CLIENT-RENDERED.md (unblocked by the authority ruling; D-55 is
narrowed, not closed), docs/development/CIVICOS_UI_STATE.md (newest two entries
only), bio-plane/package.json and bio-plane/scripts/deploy.mjs (the release
path, which takes --thread and checks the baton on the REMOTE).

This session, in order. Stop and tell me if any item changes the ones after it.
(1) Cut the release that did not happen last session: npm run build, the whole
suite, sign with the bio-release key, release/RELEASE.json, tag, deploy via
bio-plane/scripts/deploy.mjs --thread CAPTURE, op=audit clean. The code is
already on main and green; nothing is deployed, so biosmoke7 still sends the old
agent and still cannot reach oaklandca.gov. Verify against the live host
immediately after deploying, because that is the first time the fix runs from
Cloudflare egress rather than from a test container. (2) D-95, the per-host
governor, in the Durable Object, with a config table keyed by host, our appetite
as a configured constant and their capacity discovered by refusal, 429 handling
that overrides the bucket, and request pacing that resembles a human rather than
a loop. (3) D-94's mechanical user-agent probe: vary the components of our agent
systematically against a host that is refusing us, record every combination and
its result as a measurement, so that when admission stops the pattern is learned
rather than guessed. (4) D-96 and D-97, the schema and provenance work the
authority rulings need: the via column, the document-address and
retrieval-locator split, authority_state, authority_basis and provenance_chain.
(5) Push, appending to DEBT.md and MEASUREMENTS.md rather than rewriting them,
prepending a state doc entry naming this thread, and rewriting ONLY
docs/development/kickoffs/CAPTURE.md for the session after.

Grants for this session (sessions carry no secrets; paste all three even if
unchanged): Cloudflare deploy token: [PASTE]. GitHub fine-grained token for
believeinoakland/bio, Contents read/write, 7-day expiry: [PASTE]. Member token,
read-only, for post-deploy verification: [PASTE]. Deploy target account id
20b533579290b9b93168345edd3b7f72 (biocloudflare), plane worker biosmoke7. Work
without asking me to confirm anything determinable from the repo; decision items
at the end only.

---

## What this thread should know without being told

**The source-access failure was ours, and finding that took three sessions.**
`www.oaklandca.gov` returned 403 to `bio-acquire`, a bare token with no version
and no contact. It returns 200 to an honest `CivicOS/<version> (+url; instance;
purpose)` string from the same network. Two whole theories were built on
Cloudflare egress reputation and both were wrong. **They were wrong for a
reusable reason: every client that succeeded had both a reputable network and a
legible agent, so the two variables were confounded, and nothing settles a
confound except varying one alone.** When two clients differ in two ways, the
comparison is evidence about neither.

**Test through the op, not the function.** A continuation suite once drove
`captureSubresources` directly with 22 green assertions while `op=acquire` threw
1101 on every page big enough to need a session. This session the same rule
caught a weaker test: asserting the user-agent constant would have tested our
intention, so the test reads what the fake SOURCE received instead, which is the
only thing a bot manager ever sees.

**Assertions run both ways.** The D-58 test asserts that a PDF and a plainly
captured page both resolve as `linked` naming their real hashes AND that an
address the record genuinely lacks is still `offsite`. A filing that said yes to
everything would pass a one-way check by being useless.

**Numbers come from MEASUREMENTS.md, never from a vendor table or from
reasoning.** The subresource cap was 40 from a guess and truncated every real
page. This session a claim that PDF text extraction is "expensive and
failure-prone" was written without measuring and had to be withdrawn: `unpdf` is
a serverless pdf.js build targeting Workers, and the real constraints are bundle
size against the 3MB Free limit and CPU against the measured ceiling, both
measurable. Third-party figures (archive.org's rate limits) are recorded WITH
their source and marked as not ours.

**A Worker cannot time itself.** Cloudflare freezes `Date.now()` during
synchronous execution, so any millisecond figure from inside one is a
fabrication. Count work, not time. D-56 is a watch item with no task because a
CPU overrun terminates the isolate and no run can report its own death.

**The Durable Object is where a governor belongs.** It serialises, so a token
bucket held there is globally correct for the instance for free. A bucket in
Worker memory governs nothing, because every invocation is independent.

**Schema changes on a live store.** `CREATE TABLE IF NOT EXISTS` cannot add a
column. Derived tables get a reshape pass in `store.mjs` which must run BEFORE
schema application. Never reshape a table holding first-party material; the suite
asserts it. Provenance documents are first-party material, which is why the
transport record makes the corpus non-uniform rather than migrating it.

**Signing needs an out-of-tree reconstruction.** `ssh-keygen` will not load a raw
BIOKEY-RAW1 seed and the repo's signer is browser-only (`src/signpage.mjs`).
Rebuild the SSHSIG path in Node from the sign page's own algorithm and verify
every signature against stock `ssh-keygen -Y verify` with negative controls. Note
D-93: without `ssh-keygen` on PATH the suite CRASHES at `ratify` rather than
skipping, and because `npm test` chains with `&&` everything after it silently
never runs.

**Deploy believes only the bytes.** `deploy.mjs` reads the module back, hashes
it, and compares against the signed asset. A deploy once returned an HTML error
page while the instance stayed on the old version and only the hash check caught
it. It also takes `--thread` and checks the baton on the REMOTE, failing closed.

**Do not create debt that can be avoided.** Standing policy from Bob. If a fix is
correct and ready, it ships in the release being cut rather than the next one.
Offering to defer is itself the error.

## Bob's rulings, already made. Do not re-ask.

From earlier sessions: source addresses are not exempt from canonical identity
and the address is a comment on a canonical-ID citation. Element references are
part of citations. `undetermined` is first-class and must be STATED. A superseded
link offers the capture the record does hold, labelled. Re-fetch at ratification
is mandatory in the sense that the attempt and its outcome are recorded, not that
it must succeed. Cascade may run unattended behind the ratification fence. The
cascade objective is its own stored object. Chrome links are cascade-considered
only when the objective judgement reaches for them. `site_chrome` is a derived
table. Workers Paid is an optimisation and never a requirement. JS-rendered
content IS the content, at the SAME grade.

From 2026-07-30, all detailed in `AUTHORITY-AND-TRUST.md`: the renderer is
immaterial and authority follows the data. Authority is three-valued and
undetermined becomes a task, not a blocker. An authority-undetermined capture
cannot be published. Transitive trust is accepted where disclosed in the
provenance chain with grade and confidence adjusted. Authority tasks go to the
project manager, falling back to a group admin, forwardable, on a per-user inbox
whose transport may one day be email, which is why field bounds are enforced at
write time. An alternative source counts as a re-fetch for monitoring after three
consecutive failures or fourteen days. Content is identified in PDFs as it is in
HTML, with CAPTURE extracting structure and FRAMEWORK deciding content.
Archive.org is a BACKUP source only. BIO does not disguise its requests, and the
2026-07-30 measurement showed that legibility is also what works.

## Open, and named

**D-94 is the one with a clock on it.** We are admitted because Akamai does not
recognise CivicOS. When the string is categorised we will be refused exactly as
`archive.org_bot` already is on that host. The durable fix is an allowlist
request to the City, which is Bob's to make.

**The contact URL in the agent does not resolve.** It names a path that does not
exist on a domain whose registrar transfer is pending. A user-agent advertising a
contact address that 404s is worse than one with none.

**Design only, not built:** cascade planting into the gathering queue, the
objective object type, the reverse re-resolution loop, WARC and Memento
interchange, PDF structure extraction, and the tasks table.

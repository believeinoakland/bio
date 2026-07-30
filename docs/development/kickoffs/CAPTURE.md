# Thread CAPTURE: paste-ready kickoff

Written 2026-07-30 at the close of the nine-release capture session (plane
0.36.0 through 0.45.0). See `kickoffs/README.md` for the thread register, the
paths this thread owns, and the append-only rules for shared files.

This thread owns the capture and citation machinery in the plane:
`bio-plane/src/subresources.mjs`, `src/cpu.mjs`, the capture and link tables in
`src/schema.mjs`, the capture ops in `src/index.mjs`, and
`test/subresources.test.mjs`. It does NOT own `civicos-ui/**` or `docprofile/**`.

Bob pastes the block below verbatim and fills the three grant slots. Everything
the session needs it fetches for itself from the public repo; Bob attaches
nothing.

---

Kickoff: thread CAPTURE. Fetch these from
raw.githubusercontent.com/believeinoakland/bio/main and read them before anything
else: docs/development/kickoffs/README.md (the thread register: what this thread
owns, the append-only rules for shared files, and the never-force-push rule),
docs/development/MEASUREMENTS.md (every number this project's limits rest on,
with its date and the op that produced it),
docs/development/LINK-FIDELITY.md (the link and citation design; the header says
which sections are BUILT and which are still design, and my rulings are marked
RATIFIED inline), docs/development/CAPTURE-SCALING.md (reuse, continuation and
the discovered ceiling), docs/development/CLIENT-RENDERED.md (JS-rendered
sources, blocked on D-55), docs/development/SOURCE-ACCESS.md (the oaklandca.gov
refusal and the standing position on user-agents),
docs/development/CIVICOS_UI_STATE.md (read the newest two entries only),
docs/development/DEBT.md (take the next free D-number at the moment you write),
bio-plane/package.json and bio-plane/scripts/deploy.mjs (the release path).

This session, in order, and stop to tell me if the first item changes the rest:
(1) the reverse re-resolution loop, which is the last structural gap in the
citation work: when a capture of B lands, every already-captured document whose
links point at B must be re-resolved and re-verdicted, driven from the links
table's address index. Nothing does this today, so a link that became resolvable
stays recorded as offsite until something happens to re-read it. (2) Recurrence
chrome classification applied at capture, reading `siteChrome` from the site
asset record, since structural detection finds almost nothing on the municipal
sites that matter and the recurrence data has been accumulating unused. (3)
Whatever D-55 needs to stop blocking CLIENT-RENDERED.md, or a clear statement of
why it cannot be unblocked without a ruling from me. (4) Release discipline in
full: npm run build, the whole suite, sign with the bio-release key,
release/RELEASE.json, tag, deploy via bio-plane/scripts/deploy.mjs --thread CAPTURE (this thread holds
the release baton; the script reads it from the remote and refuses without it),
op=audit clean. (5) Push, appending to DEBT.md and MEASUREMENTS.md rather than rewriting
them, prepending a state doc entry naming this thread, and rewriting ONLY
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

**Plane 0.36.0 through 0.45.0 shipped in one session**, each signed, deployed
byte-identical, audit 30/30 clean. Capture fidelity, the document boundary, the
discovered subrequest ceiling, the remembered ceiling, per-site asset reuse,
resumable capture, link resolution with a three-valued verdict, element
references, and `links_to` in `REL_VOCAB`. A concurrent UI thread has since
built the surfaces for most of it.

**Test through the op, not the function.** A continuation suite drove
`captureSubresources` directly with 22 green assertions while `op=acquire` threw
1101 on every page big enough to need a session: `sessionId` was block-scoped
inside the capture branch while the response literal reading it sat outside. A
unit test that never crosses the surface the caller uses is not testing the
feature. Two sibling defects the same day: a temporal dead zone that only fired
on pages with `<a>` elements, because the fixture had none; and link dedup
rebuilt empty each tick.

**Numbers come from MEASUREMENTS.md, never from a vendor docs table.** The
subresource cap was 40 from a guess and truncated every real page including a
54-item one. A source comment read "50 on this account", which was a guess about
somebody else's infrastructure. Our appetite and the runtime's capacity are now
separate values: appetite is a constant because it is ours, capacity is
discovered by being refused and recorded.

**A Worker cannot time itself.** Cloudflare freezes `Date.now()` during
synchronous execution as a timing-attack defence, so any millisecond figure
measured inside one is a fabrication. Count work, not time. The CPU ceiling is
found by `op=cpuprobe`, which checkpoints durably per step because exceeding CPU
TERMINATES the isolate and no run can report its own death. D-56 is held open as
a watch item with no task for exactly that reason.

**Schema changes on a live store.** `CREATE TABLE IF NOT EXISTS` cannot add a
column. Derived tables get a reshape pass in `store.mjs`, which must run BEFORE
schema application or a new index hits the old table and throws inside
`blockConcurrencyWhile`, which bricks the Durable Object rather than failing a
test. Never reshape a table holding first-party material; the suite asserts it.

**Signing needs an out-of-tree reconstruction.** `ssh-keygen` will not load a raw
BIOKEY-RAW1 seed and the repo's signer is browser-only (`src/signpage.mjs`).
Rebuild the SSHSIG path in Node from the sign page's own algorithm, verify every
signature against stock `ssh-keygen -Y verify` with negative controls, and check
the derived public key matches the recorded release key character for character.

**This thread holds the release baton** (`kickoffs/BATON.md`), so it may cut
plane releases. Pass `--thread CAPTURE` to `deploy.mjs`. If the baton has moved,
the script refuses and says who holds it; ask Bob rather than forcing, because a
release race produces two tags claiming one version and git reports success.

**Deploy believes only the bytes.** `bio-plane/scripts/deploy.mjs` reports what
the Cloudflare API said and trusts none of it: it reads the module back, hashes
it, and compares against the signed asset. A deploy returned an HTML error page
while the instance stayed on the old version, and only the hash check caught it.

**Structural assertions earned their place.** The capability-table check caught
two separate attempts in one session to put a non-session-reachable op into the
table that must name only session-reachable mutating ops. Prefer an assertion
that derives from the source over a fixed list, and make it run both ways.

## Bob's rulings, already made. Do not re-ask.

Source addresses are not exempt from canonical identity; the address is a
comment string on a canonical-ID citation. Element references are part of
citations, not comments on them. `undetermined` is first-class and must be
STATED rather than omitted. A superseded link offers the capture the record does
hold, labelled. Re-fetch at ratification is mandatory, meaning the attempt and
its outcome are recorded, not that ratification requires a matching answer.
Cascade may run unattended behind the ratification fence. The cascade objective
is its own stored object. Chrome links are cascade-considered only when the
objective judgement reaches for them. `site_chrome` is a derived table. Workers
Paid is an optimisation and never a requirement, and Bob is deliberately staying
on Free so the path every community instance uses stays the one he exercises.
JS-rendered content IS the content, captured as evidence at the SAME grade as
the rest of the document, because the JS render happened in the site's own
execution environment at capture time while the HTML/CSS rendition is rendered
later in the reader's. Third-party script output, if it is evidence, is evidence
produced by that third party.

## Open, and named

**Deferred pending Bob's counsel:** what the plane's user-agent says. BIO does
not disguise its requests, and that part is not waiting on anyone. See
SOURCE-ACCESS.md.

**Blocked:** D-55, a rendered capture may carry content whose authority is not
the hosting site while `capture.authority` holds one value. Nothing may be
treated as evidence out of a render until that is settled.

**Design only, not built:** cascade planting into the gathering queue, the
objective object type, and the reverse re-resolution loop, which is item 1 above.

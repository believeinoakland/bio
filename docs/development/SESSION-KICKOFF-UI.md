# Paste-ready kickoff for the next session

Rewritten 2026-07-29 at the end of the six-release session (plane 0.36.0
through 0.41.0, U7 done). Bob pastes the block below verbatim and fills the
three grant slots. Everything the session needs it fetches for itself from
the public repo; Bob attaches nothing.

---

Kickoff. Fetch these from raw.githubusercontent.com/believeinoakland/bio/main
and read them before anything else: docs/development/LINK-FIDELITY.md (this
session's spec, DRAFT with my rulings marked RATIFIED inline),
docs/development/UI-PLAN.md (the plan of record),
docs/development/CIVICOS_UI_STATE.md (read the newest two entries only),
docs/SESSION-KICKOFF.md (grant process), bio-plane/package.json (build and
test commands).

This session, in order: (1) the links table with address normalisation,
storing the normalised form alongside the raw address and never instead of
it; (2) read-time resolution, a plane op answering for a deferred address
whether the store holds a capture, in which bundle, with the contemporaneity
verdict and its basis named; (3) the three-valued verdict as appended, dated
material, never overwritten, with `undetermined` as the resting state and the
expected common case; (4) `links_to` added to REL_VOCAB as a source-asserted
relation, with resolved links projecting into refs and the address carried as
a comment string on a canonical-ID target; (5) release discipline in full for
whatever version this lands as: npm run build, the whole test suite, sign with
the bio-release key, release/RELEASE.json, tag, deploy via
bio-plane/scripts/deploy.mjs, op=audit clean; (6) push everything, update
UI-PLAN.md and LINK-FIDELITY.md, add a state doc entry, and rewrite this
kickoff file for the session after.

Grants for this session (sessions carry no secrets; paste all three even if
unchanged): Cloudflare deploy token: [PASTE]. GitHub fine-grained token for
believeinoakland/bio, Contents read/write, 7-day expiry: [PASTE]. Member
token, read-only, for post-deploy verification: [PASTE]. Deploy target
account id 20b533579290b9b93168345edd3b7f72 (biocloudflare), worker
biosmoke7. Work without asking me to confirm anything determinable from the
repo; decision items at the end only.

---

## What the session should know without being told

**The plane is at 0.41.0** on biosmoke7, record of 30 bundles, audit clean.
The UI is at U7 done. Both suites green: 34 plane test files, 8 UI harnesses.

**Signing needs an out-of-tree reconstruction.** ssh-keygen will not load a
raw BIOKEY-RAW1 seed and the repo's signer is browser-only
(src/signpage.mjs). Rebuild the SSHSIG path in Node from the sign page's own
algorithm, verify every signature against stock `ssh-keygen -Y verify`
including negative controls, and confirm the derived public key matches the
recorded release key character for character before trusting it.

**Deploy through bio-plane/scripts/deploy.mjs.** It reports what the
Cloudflare API said and believes none of it, reading the module back and
comparing hashes. A deploy on 2026-07-28 returned an HTML error page while
the instance stayed on the previous version; only the hash check caught it.

**Capture is multi-tick now.** A page over the runtime's subrequest ceiling
returns `complete:false` with a continuation session. Anything built on
capture has to drive it to completion rather than presenting a partial page
as a capture.

**Bob's rulings already made, do not re-ask:** source addresses are NOT
exempt from the canonical-identity rule, the address is a comment string on
a canonical-ID citation; `undetermined` is a first-class outcome; a
superseded link offers the capture the record does hold, labelled; re-fetch
at ratification is mandatory, meaning the attempt and its outcome are
recorded, not that ratification requires a matching answer; cascade may run
unattended behind the ratification fence; the cascade objective is its own
stored object; chrome links are cascade-considered only when the objective
judgement reaches for them; site_chrome is a derived table; Workers Paid is
an optimisation and never a requirement.

**Deferred, awaiting Bob's counsel:** what the plane's user-agent says.
www.oaklandca.gov returns 403 to the plane on every path including
robots.txt. Do not implement a browser-impersonating agent.

**The lesson from last session.** A continuation suite drove the internal
function directly, 22 assertions green, while the op the caller actually
uses threw on every page the feature existed to serve. Test through the op.

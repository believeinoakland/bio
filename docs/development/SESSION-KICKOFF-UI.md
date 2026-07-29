# Paste-ready kickoff for the next session

Rewritten 2026-07-29 at the close of the nine-release session (plane 0.36.0
through 0.45.0, U7 done). Bob pastes the block below verbatim and fills the
three grant slots. Everything the session needs it fetches for itself from the
public repo; Bob attaches nothing.

---

Kickoff. Fetch these from raw.githubusercontent.com/believeinoakland/bio/main
and read them before anything else: docs/development/UI-PLAN.md (the plan of
record; read the standing dependencies section carefully, it names four things
the plane now does that the UI does not show),
docs/development/CIVICOS_UI_STATE.md (read the newest two entries only, v28 and
v27), docs/development/LINK-FIDELITY.md (the link and citation design, with my
rulings marked RATIFIED inline), docs/development/DEBT.md (D-54 through D-56 are
this session's), civicos-ui/README.md and civicos-ui/test/run.mjs (the UI build
and test path), bio-plane/package.json (build and test commands).

This session, in order: (1) the document page's link surface, which is the
largest gap between what the record knows and what it shows. A captured
document's outbound links, partitioned as anchor / intra / linked / offsite /
refused, each showing the element cited where there is one, the contemporaneity
verdict and its basis in plain words, and a reader who follows a link out of the
record told they are leaving audited content before they go, not after. (2)
Honesty about incomplete captures: a capture with complete:false must say so on
the document page with its outstanding count, and offer to continue it. (3)
Honesty about reused parts: a part with fetched_this_capture:false must be
distinguishable from one fetched during this capture, naming when the source was
last seen serving those bytes. (4) U8, the Add surface: acquire by locator with
the authority named and the grade shown honestly, driving a continuation to
completion rather than presenting a half-captured page as a capture. (5) UI
deploy discipline: node test/run.mjs bare, deploy, verify /build, push source
and docs together. (6) Update UI-PLAN.md, add a state doc entry, and rewrite
this kickoff file for the session after.

Grants for this session (sessions carry no secrets; paste all three even if
unchanged): Cloudflare deploy token: [PASTE]. GitHub fine-grained token for
believeinoakland/bio, Contents read/write, 7-day expiry: [PASTE]. Member token,
read-only, for post-deploy verification: [PASTE]. Deploy target account id
20b533579290b9b93168345edd3b7f72 (biocloudflare), plane worker biosmoke7, UI
worker civicos. Work without asking me to confirm anything determinable from the
repo; decision items at the end only.

---

## What the session should know without being told

**Plane 0.45.0, UI at U7 done.** Both suites green: 34 plane test files (314
assertions in subresources alone), 8 UI harnesses plus the semantics conformance
check. Record: 30 bundles, 137 files, 87 register rows, audit 30/30 clean.

**The ops the UI needs.** `op=links&capture=<sha>` resolves a capture's outbound
links at read time with verdicts. `op=links&address=<url>` answers the reverse
question. `op=linkproject&capture=<sha>` turns resolved links into `links_to`
edges and WRITES, so it is a member contribution and not a read.
`op=runtime` reports measured work, the CPU probe trail, and the subrequest
ceiling. `op=capture&sha256=` serves any capture by hash, which is how U7
resolves manifest parts.

**Test through the op, not the function.** Last session a continuation suite
drove `captureSubresources` directly with 22 green assertions while
`op=acquire` threw 1101 on every page the feature existed to serve. A unit test
that never crosses the surface the caller uses is not testing the feature.

**Signing needs an out-of-tree reconstruction.** `ssh-keygen` will not load a raw
BIOKEY-RAW1 seed and the repo's signer is browser-only (`src/signpage.mjs`).
Rebuild the SSHSIG path in Node from the sign page's own algorithm, verify every
signature against stock `ssh-keygen -Y verify` with negative controls, and check
that the derived public key matches the recorded release key character for
character before trusting it.

**Deploy through `bio-plane/scripts/deploy.mjs`,** which reports what the
Cloudflare API said and believes none of it: it reads the module back, hashes it,
and compares against the signed asset. A deploy returned an HTML error page while
the instance stayed on the old version, and only the hash check caught it.

**A Worker cannot time itself.** Cloudflare freezes `Date.now()` during
synchronous execution. Any millisecond figure measured inside a Worker is a
fabrication. Count work, not time.

**Schema changes on a live store.** `CREATE TABLE IF NOT EXISTS` cannot add a
column. Derived tables get a reshape pass in `store.mjs#migrate`, which must run
BEFORE schema application or a new index hits the old table and throws inside
`blockConcurrencyWhile`, which bricks the Durable Object rather than failing a
test. Never reshape a table holding first-party material; the suite asserts it.

**Bob's rulings already made, do not re-ask.** Source addresses are not exempt
from canonical identity, the address is a comment string on a canonical-ID
citation. Element references are part of citations. `undetermined` is
first-class and must be stated, not omitted. A superseded link offers the capture
the record does hold, labelled. Re-fetch at ratification is mandatory, meaning
the attempt and outcome are recorded, not that ratification requires agreement.
Cascade may run unattended behind the ratification fence. The cascade objective
is its own stored object. Chrome links are cascade-considered only when the
objective judgement reaches for them. `site_chrome` is a derived table. Workers
Paid is an optimisation and never a requirement, and Bob is deliberately staying
on Free so the path every community instance uses stays exercised. JS-rendered
content is the content, captured as evidence at the same grade as the rest of the
document. Third-party script output, if evidence, is attributed to that third
party.

**Deferred, awaiting Bob's counsel:** what the plane's user-agent says.
`www.oaklandca.gov` returns 403 to the plane on every path including
`robots.txt`, while `data.oaklandca.gov` and `oaklandca.opengov.com` answer
normally. Do not implement a browser-impersonating agent.

**Blocked, and named:** D-55, a rendered capture may contain content whose
authority is not the hosting site while `capture.authority` holds one value.
Nothing may be treated as evidence out of a render until that is settled.

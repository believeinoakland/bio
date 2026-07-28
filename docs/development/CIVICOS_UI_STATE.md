# CivicOS Layer 3 UI: state and next-session kickoff

v7, 2026-07-28 session, part five: THE DOCUMENT ITSELF OPENS ON THE DOCUMENT
PAGE.

**Changelog v7, and a correction that retires gap G2.** G2 ("the plane
serves no binary blob bytes") was wrong: `op=capture`'s GET arm has served
raw capture bytes by sha256 all along, content-addressed under
`<store>/captures/<sha>`, Range-capable, and every snapshot part was written
to exactly those keys at promotion. The gap was the UI's knowledge of the
plane, not the plane; no plane release was needed and none was made. The
document page now has the viewer: every binary artifact card carries "Open
the document (size)". Opening fetches each part through `op=capture` with a
live progress bar, hashes every part in the browser with WebCrypto, and
compares against the sha the record carries. ONLY VERIFIED BYTES ARE EVER
SHOWN: a mismatch renders a refusal in the plane's voice (REFUSING TO
DISPLAY, expected vs got) instead of the document. On success: a verdigris
"every byte verified against the record" line, the PDF inline in an embed
(images inline as images; .tsr and unknown types verify-and-download), and a
download of the same verified bytes under the original filename. Proven
live end to end: both parts of the 41.5MB FY23-25 budget book fetched
through the civicos proxy, both shas identical to the record, and the
reassembled file is a well-formed PDF (%PDF header, %%EOF trailer). Harness
covers part ordering, concatenation, the integrity refusal, and the
missing-capture reason; all prior harnesses and the semantics check stay
green.

(v6 and earlier follow; all still hold, except G2 which is retired as
mis-diagnosed.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v6, 2026-07-28 session, part four: Bob's five fixes from the live document
page.

**Changelog v6.** THE ROOT CAUSE FIRST: #work used min-height:100vh, so a
tall page scrolled the whole body instead of the content pane. That single
bug produced two of Bob's five reports: the rail and tab bar scrolling away
(nothing could stick because the pane they stick within never scrolled), and
the strata strips staying grey past the first (the scrollspy watches the
content pane, which never moved). The grid is now height:100dvh with
min-height:0 on the scroll children; the rail and tab bar hold, and the
strips follow the reader. The rest: BACK moved to the masthead at top level,
left of the wordmark, bigger (21px), appearing whenever there is somewhere
to go back to; the crumb is a location line again. Back now restores the
EXACT scroll position through a settle-proof restore (set, two animation
frames, and a 120ms re-set, because web-font reflow was clamping the offset
set at first paint), the browser back button and the in-app arrow converge
on one stack without double-popping, and a Search screen on the way back
re-runs its remembered query so the result list the reader was working
through comes back scrolled to where they were. CHIPS became SEALS: the
document's states now render as single-mark stamps (V verified, ! crucial,
M monitored, and marks for every state in the semantics table) riding
right-justified in the sticky tab bar, so load-bearing state never scrolls
away; hover names them, click discloses the full semantics row, and the
seal marks live in the SEMANTICS table like everything else. The chips row
left the body of stratum one.

(v5 and earlier follow; all still hold.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v5, 2026-07-28 session, part three: Bob's eight document-page refinements.

**Changelog v5, all from Bob's review of the live page:** the strata tab bar's
stray scrollbar is gone and the bar now sticks to the top of the page while
content scrolls, with a scrollspy keeping the active tab true to the reader's
position (tabs scroll to a stratum; nothing is hidden, and the banding makes
that legible). Each stratum is a banded section: a left rule that turns
verdigris as the reader enters it, under a mono eyebrow naming it, so the
content belonging to each tab is visibly delimited without new colors. The
Design page's warm band is captured as an ADDITIVE token (--band, umber) in
tokens.css and tops every document page as its identity. The rail collapses
to an icon-only 56px strip (toggle in the masthead, persisted, tooltips on
icons; hidden on phones where the rail is already a top bar). Back returns
the reader to the exact scroll position of the page they came from, via an
in-app navigation stack wired to the browser's own back button; the crumb
shows where back leads. Tabs, eyebrows, and the docband carry explanatory
tooltips from STRATA_INFO. A GLOSSARY table (sibling of SEMANTICS: same
one-source-of-truth idea) wraps system and civic-finance terms (ACFR, GPF,
FY, sha256, RFC 3161, SSHSIG, manifest, provenance, frontmatter) in rendered
prose with dotted-underline click-overs; the wrapper never touches tags or
attributes and handles compounds like FY23. Document-SPECIFIC terminology is
deliberately not in the UI table; if adopted, it belongs in the bundle at
capture time (open decision below).

(v4 text follows; all of it still holds.)

---

v4, 2026-07-28 session, part two: the record screen rebuilt on Bob's UX
principles.

**Changelog v4: the document page is content-first on four strata, the
semantics table is live with its consistency check, lists are live-updating,
and the working space lays out on phones.**

## New in v4

- **The document page** (openBundle) now answers the reader's questions in the
  reader's order, four strata with an in-page nav: WHAT IT SAYS (state and
  criticality chips, the prose, then the captured source material itself:
  text files including JSON open and render in place; chunked binary
  snapshots fold into one card per artifact with parts, sizes, RFC 3161
  timestamp, and per-part hashes); IN THE CASE (a project's objective and
  work-product state, forward references with their notes, and reverse
  citations computed client-side by walking the projections of every focus
  and project); TRUST (authority, source link, retrieved, source status,
  content and bundle hashes with copy, monitor schedule, and the
  anyone-may-verify sentence); THE RECORD (the session log parsed from the
  bundle's own _history/promotion_*.json, each entry with its actor, its
  move, and the member's recorded acknowledgment and mitigation rendered as
  speech, plus every earlier revision with an in-place line diff against the
  current text). Release stays at the end, after the reading.
- **SEMANTICS** is the one source of truth for presentation: for every object
  type and state in the plane's catalog, plus criticality and flags and the
  two spaces, one row declares the chip, the reader-language meaning, what it
  enables, what it forbids and why, and the legal next states. Every chip is
  a click-over disclosing that row (tap works; nothing is hover-only). The
  block is marker-extractable, and `check-semantics.mjs` fails the build if
  any plane state lacks a row or the table invents a state. THE CHECK PAID
  FOR ITSELF ON ITS FIRST RUN: it caught two invented states ("modified",
  "deactivated") that existed in UI copy but nowhere in the plane; both are
  gone, and Monitoring now reads the real drift signals (reeval_flag,
  monitor_enabled) instead of a state that does not exist.
- **Liveness**: polite 45s polling while the tab is visible; the Record and
  Review lists reconcile in place when the record actually changed, never
  while a dialog is open, and a review selection in progress is preserved
  across an update.
- **Phones**: below 680px the rail becomes a scrolling top bar and everything
  lays out in one column; the strata nav scrolls horizontally. Viewing is
  fully served; judgment surfaces remain best on larger screens, per the
  agreed viewing-MVP posture.
- **Gap G2, named**: the plane serves no binary blob bytes (`op=file` returns
  text or hash metadata only), so archived binary snapshots (the captured
  PDFs) cannot be viewed in the browser yet. The document page says so
  honestly on each such artifact and shows the verify path. A blob-serving
  op is plane-side work, and the public reading surface (G1) will want it
  too.

(For the v1-v3 narrative, op contracts, and deploy procedure, see the v3 text
below; all of it still holds.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v3, 2026-07-28 session: record headings dropped to the canonical token
(--t-rec 22px, inline sizes removed); Bob resolved the open heading decision in
favor of the token/Design value. Bob's standing UX principles recorded verbatim
in UI-KICKOFF.md. (Previously: v2, 2026-07-27 session (doc previously dated ahead; plane is 0.35.0 on biosmoke7,
see BIO_DATAPLANE_STATE.md).)

**Changelog v2: the first write action is wired. Release runs end to end from
the UI: per-document from the bundle page and batch from Review, through
`op=select` (enumerated) then `op=release`, with the doctrine's recorded
acknowledgment and mitigation.** Details below; v1 narrative follows unchanged.

## New in v2: the release flow

- **Review** now loads collected Information via `op=search`
  (`type:information state:collected`, limit 500) because search's provenance
  columns carry `criticality`, which `op=list` does not; the flow needs it to
  keep crucial material out of `op=release` before the plane has to refuse it.
  Fallback to `op=list` if search cannot answer (criticality then unknown; the
  plane's refusal renders verbatim).
- **Batch release from Review.** Checkbox selection (select-all included), one
  verdigris primary that counts the set. The dialog states what a batch release
  is, lists the set, and requires the member to type the homogeneity
  acknowledgment and what they actually checked. Nothing is prefilled: the
  doctrine's record is the member's own words. Client-side validation mirrors
  the store exactly: each field <=500 chars, no quote, backslash, or newline.
- **Per-document release from the bundle page**, placed at the BOTTOM, after
  the prose and history, because the doctrine's reviewer must see the source
  material before the judgment. Same dialog, per-document language.
- **Crucial material never enters the flow.** Any selection containing
  crucial-criticality material is refused whole by the store, so the UI gives
  crucial rows no checkbox and says why: verifying crucial means checking its
  co-attestations, per-document work, surface not built yet.
- **Capability- and session-shaped.** The release affordance EXISTS only for a
  member session holding `contribute` (`canRelease()`); a machine token sees
  the read-only review with the doctrine's own sentence about why it cannot
  release. Absent, not greyed.
- **Refusals teach.** The plane's refusal JSON renders verbatim with offenders
  named (`ENTRY_REQUIREMENTS` lists each document's exact lacks,
  `ILLEGAL_TRANSITION` its current state). `SET_MOVED` refreshes the list and
  says to look again; it is never auto-retried, because refuse-weight means
  the operator looks again.
- **After success** the UI lands on Review with a confirmation card naming the
  released ids and the Session Log record each now carries, and the record
  cache is invalidated so chips show verified.
- The facts card no longer shows `classification` (removed from the catalog in
  plane 0.33.0; frontmatter residue is inert and drains on promotion).
- Flow verified against a stub plane implementing the store's exact contracts
  (select POST shape, release params, refusal shapes, the 500-char rule). The
  harness caught one real bug before it shipped: a local `const go` shadowing
  the router's `go()` in the success path.

### Op contracts added in v2 (verified against src/index.mjs, src/store.mjs)

- `POST /api/?op=select&kind=enumerated&token=T` with body `{ids:[...]}` ->
  `{ok, handle, kind, n, expires, ttlSeconds}`. Owner and viewer are stamped
  server-side from the credential; a selection is readable only by the
  credential that made it. TTL 300s, refreshed on resolve.
- `GET /api/?op=release&handle=H&acknowledgment=A&mitigation=M&token=T` ->
  `{ok, released:[ids], acknowledgment, mitigation, weight:"refuse", drift}`.
  Requires a MEMBER SESSION holding `contribute`; a machine credential is
  refused by the store on the author stamp's shape (MACHINE_CANNOT_RELEASE).
  Only collected, non-crucial Information; refusals carry offenders. Both text
  fields <=500 chars, no quote, backslash, or newline (RELEASE_ACK_MAX).

---

## v1 narrative (2026-07-27, first UI build session)

v1, 2026-07-28. Follows plane **0.35.0** on biosmoke7 (see BIO_DATAPLANE_STATE.md).

**The Layer 3 UI runtime exists and is live, reading the real record from R2.**
Open https://civicos.believeinoakland.workers.dev and it serves the CivicOS
client, which loads the actual 30-bundle working record (the sewer-fund
evidence series, the auditor report, the ACFR statements, the OpenGov transfer
series) from the biosmoke7 plane. It is a real runtime wired to the live ops,
not a prototype. The signed plane and its record are untouched: `op=audit`
reads 30 checked, 30 clean.

## What runs where, and why the UI is a separate worker

The UI does **not** live in the plane. It runs as an isolated dev worker named
`civicos`, which serves `app.html` and forwards `/api/*` to the plane
(`biosmoke7`) through a Cloudflare **service binding** named `PLANE`. The plane
is signed and its deployed bytes are verified identical to the signed release;
injecting UI code into it would break that discipline and put the record within
reach of a deploy mistake. So the dev UI is a separate artifact. For production
the UI folds into the real domain as `believeinoakland.com/CivicOS` once that
zone is in place; the dev proxy worker is scaffolding, not the shipped shape.

The service binding is required, not a preference: a worker cannot HTTP-fetch
another worker on the same `*.workers.dev` zone (Cloudflare error 1042). The
binding routes worker-to-worker directly and avoids it.

## The design source of truth

`civicos-ui/tokens.css` is canonical (Bob's design foundation from the Claude
Design session; the handoff calls it the drop-in deliverable, do not fork the
values). Civic-ledger register: verdigris `#2F6F62` is the only signature
(primary action, verified fill), terracotta `#B3441E` is rationed to at most one
attention element per screen, working sits on `--paper`, published on `--sheet`.
Two spaces are set by `[data-space="working"|"published"]` on the document root.
The fence is a printer's double rule and appears nowhere else. Serif is
judgment, sans is plain speech, mono is machine fact. Chips are lowercase; the
only uppercase in the system is mono eyebrows. Radius ceiling is 2px, no pill.
The standing design brief is `docs/development/UI-KICKOFF.md`; requirements are
`docs/development/BIO_Design_Requirements_v2.md`. The full design-language
foundation (tokens plus the two register proofs) came from the Claude Design
session; `civicos-ui/tokens.css` is its committed, canonical output.

## The runtime (`civicos-ui/app.html`)

Self-contained client. It inlines `tokens.css` verbatim for standalone opening
(canonical remains `tokens.css`; when served, swap the inline block for
`<link rel="stylesheet" href="/tokens.css">`). Fonts load from Google Fonts for
dev convenience; production embeds the OFL WOFF2 faces under `/fonts/` per the
`@font-face` block already in `tokens.css`.

Connection: `const PLANE = { base:"", token, session, preview }`. Empty `base`
means same-origin, which is true when served by the `civicos` worker, so
`/api/...` calls reach the proxy and no CORS is involved. The gate offers three
ways in: sign in with `op=login` (member handle, or empty handle for the
administrator), paste a `MEMBER_TOKEN`, or "preview the design" with no data.

Wired to real ops and live on connect:
- Rail is capability-shaped from `op=whoami` (a capability the member lacks is
  absent, not greyed; Members & Keys hides for a non-admin).
- Record from `op=list`, leading with the human title (bundle id dropped from
  the row), lowercase chips, verdigris fill for verified.
- Bundle view from `op=image`, parsing the real nested YAML frontmatter into the
  facts card plus a mono provenance line, and rendering the prose and the
  append-only history.
- Search from `op=search` with a client-side fallback over `op=list`.
- Published space from `op=publishedmanifest` (public, currently empty).
- Members from `op=memberlist`.

## Op contracts (verified against biosmoke7 this session)

- Auth is a query param: `/api/?op=X&token=Y`. `op=login` is a POST of
  `{role, password}` returning `{ok, token}`; `role` is the member handle, empty
  is the administrator. The returned token is then passed as `token=`.
- `op=list` -> `{result:[{bundle_id, object_type, title, current_state, last_updated}]}`.
- `op=image&id=X` -> `{result:{filename: content | {sha256, bytes, ...}}}`.
  `bundle.md` carries YAML frontmatter: top-level `current_state`,
  `criticality`, `classification`, `content_hash` (`sha256:...`),
  `source_status`, and a nested `source: { locator, authority, retrieved }`.
- `op=whoami` -> `{result:{tokenClass, session, member, handle, administer,
  capabilities, vocabulary}}`. A `MEMBER_TOKEN` returns `tokenClass:"member"`,
  `session:false`, `capabilities:null` (reads work; capability-shaping needs a
  member session via login).
- `op=publishedmanifest` is public, no token ->
  `{result:{published:[{bundle_id, bundle_sha, ratified_at, attestor_member,
  gate_version}], shas:[]}}`. Currently `published:[]`.
- The worker sets **no CORS headers**. That is the whole reason the UI must be
  same-origin (served or proxied) rather than a local file calling the plane.

## Build and deploy the dev worker

`civicos-ui/worker.template.mjs` is the proxy logic with an
`__APP_HTML_BASE64__` placeholder. To (re)deploy after any UI edit, from a shell
with a Cloudflare deploy token:

    # 1. embed the current app.html into a deployable worker.mjs
    python3 - <<'PY'
    import base64,re
    app=open("civicos-ui/app.html","rb").read()
    t=open("civicos-ui/worker.template.mjs").read()
    t=t.replace("__APP_HTML_BASE64__", base64.b64encode(app).decode())
    open("/tmp/worker.mjs","w").write(t)
    PY

    # 2. deploy the 'civicos' script (account + subdomain below)
    ACCT=20b533579290b9b93168345edd3b7f72        # from the credentials file
    curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/civicos" \
      -H "Authorization: Bearer $CF_TOKEN" \
      -F 'metadata={"main_module":"worker.mjs","compatibility_date":"2026-07-01","bindings":[{"type":"service","name":"PLANE","service":"biosmoke7"}]};type=application/json' \
      -F 'worker.mjs=@/tmp/worker.mjs;type=application/javascript+module'

    # 3. first time only: enable the workers.dev URL
    curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/civicos/subdomain" \
      -H "Authorization: Bearer $CF_TOKEN" -H "content-type: application/json" \
      --data '{"enabled":true,"previews_enabled":false}'

Account subdomain is `believeinoakland`, so the URL is
`https://civicos.believeinoakland.workers.dev`. The plane is never touched by
this.

## Done this session

Adopted the design foundation; built the runtime and wired it to the live ops;
stood up the `civicos` dev worker and verified it end to end against real R2
data; refined the record layout, wordmark, chips, and the bundle view to match
the storyboard.

## Next

1. **Wire the write actions.** Release is DONE (v2 above): per-document and
   batch, acknowledgment recorded. Next in the ladder: triage on Focuses
   (`op=dispose`, to deferred or dismissed with a reason), cite in Projects,
   capture in Add (`op=capture` / `op=promote`).
2. **Keep refining the look** against the storyboard as Bob drives real data.
3. **Production shape.** Decide whether to keep the dev proxy worker or fold the
   UI into the plane's own serving path for `believeinoakland.com/CivicOS`.
4. **Fonts.** Embed the OFL WOFF2 faces under `/fonts/` instead of Google Fonts.
5. **The published reading surface** (gap G1): no public op renders a ratified
   case-file body yet; the manifest and per-hash verify exist.

## Open decision for Bob

RESOLVED 2026-07-28: Bob chose the token value. Headings now ride `--t-rec`
(22px) with inline sizes removed; the token file stays unforked.

## Grants (pasted per session, never committed)

Same model as SESSION-KICKOFF.md. This work needs: a **Cloudflare deploy token**
(redeploy `civicos`), a throwaway **MEMBER_TOKEN** (read and verify against
biosmoke7), and the **GitHub token** (push). The account id and instance ids are
in the credentials file Bob pastes; no value is stored here.

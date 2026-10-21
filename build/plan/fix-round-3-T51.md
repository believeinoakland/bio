# Fix round 3 of T51: the plan (seed)

**Status** · Seeded by BOB #241 (K4350) while the targeted re-walk runs (`walk-T51-rewalk/A.md`, `B.md`, K4348). The round is planned whole once the re-walk ends (K4297 (3)): every STILL and NEW finding grouped by cause, one job per cause or module, one redeploy. Entries placed before then:

## Placed

- **C64, federal offices (DEC-401, DEC-402; K4350):** design @ 43379a1a44 merged into the tranche. Owed:
  - `entities`: `entitycreate` admits an office to a member when sent from `request`, saved for the team with the "Named by a member" mark (`screen.request.nameoffice.mark`) until an administrator confirms it; an administrator's confirm of a member-named office (a provided service: requirement change BOB writes first, §7).
  - `op-grades`: the grade of `entitycreate` from a member on `request` (if its marks require it).
  - `screens-action` (`request.mjs`): "Name the office yourself" drawn as DEC-402 draws it, `entitycreate` in request's acts, the reworded `screen.request.nooffice.admin`.
  - `screens-settings` (`places.mjs`): the administrator's confirm of a member-named office under Places and offices.
  - `wizard-scripts`: the registry re-taken at 43379a1a44 (request's acts gain `entitycreate`).
- **Small, from K4320, K4230, K4332, K4334:** the inbox list routed `inboxlist` but hand-declared `inbox` (the route's alias, plane R71); wizard-scripts' `wizards` declares `state` though its arm reads it from the query; case-authoring R77's not-reached minutes shape; `impact.mjs` lists `plane/r42-entry.mjs` as a test (BOB's tooling).

## From the performance lane (P1–P6, K4353)

- **interface-shell:** (P1) the shell reads the release version from its served page for `loadWords`, so `interfacewords` names `v` and the year cache applies; (P2.1) `loadReach` redraws without re-reading the screen; (P6) an act re-reads only the reads its screen marks as depending on it (or whose request changed), "all" only for an act that says so, the fallback kept for undeclared acts; (P2.4) the program served as a versioned, `immutable` script with its hash in the CSP in place of the per-response nonce (with control-plane's page policy).
- **control-plane:** (P2.4) the page policy for the versioned shell script.
- **project-roster:** (P2.2) `projectlist` answers each project's question count and its drafts-shared-for-review summary.
- **screens-daily:** (P2.2) the rows read those fields (no per-project `projectquestions`, `casedrafts`); (P2.3) `todos.mjs` asks `fields=picker` and shares one `heldcaptures` read with `doors.mjs`.
- **capture:** (P2.3) a picker row answers `whole` from the register's recorded size, `head` kept for single-document screens.
- **screens-inquiry:** (P3) the citation picker's questions in one read (or read when it opens), and `heldcaptures` for this copy's row only.
- **acquisition:** (P4a) no fixed 3 s attest wait: the answer returns with the attempt pending, the late outcome recorded as today (capture R68); (P4b) one governor booking per host visit on the render path; (C5) parts kept in memory and the whole put once, a `keep` stage timed apart.
- **host-governor:** (P4b) an admission without booking (a peek), or the render path's admission passed to its fetch.
- **capture-sources:** (P5) sub-resource bodies collected concurrently and from the start of the load, the body phase capped to what the door's bound leaves, timed per phase; the visitor-view capture answered when the page is kept, the render continuing as its second part (`render_pending`).
- Then the lane re-measures against the bar after the redeploy.

# control-plane (T50)

**Status** · session_013W39qjn8635aB3vuz3De9S · depth 2 · WORKING · handled B3

## J1 · QUESTION

QUESTION J1. Three readings I am building on; the first needs your word because it changes what I can deliver.

1. R105's bound (the measured live `acquire`). I cannot make it as the line is written. Plan rule 9 says no remote cell is run from a Claude session's own tools, and the handoff says a deploy to biosmoke8 needs Bob's one-line approval each time, so there is no way for me to time `acquire` of a large page on biosmoke8 from my code. My best reading, under Bob's K3717/K3718 (lines that wait on the remote proof stay unbuilt, accepted red by name): I build the `for` sight judgment now (the refusal `BAD_FOR`, before any fetch, one answer for an unseen question and an absent one, asked of the store's `inquirypartition` read as the viewer, fail-closed on a silence) and leave the bound unbuilt: R105's second sentence and its second test stay `not yet met: T50`, named in my record as waiting on the remote proof, with the door's `acquire` path left exactly as it is. If you want a bound built anyway, give me its value and I add a deadline at the door that answers a named refusal when it passes.
2. R106. I stamp every `ai` caller's `viewer` from `admission.callerViewer(caller, {carry: false})`, replacing `aiCred.principal` at the viewer sites only (identity and author stamps keep the principal). Admission R30 is not merged yet, so my test pins the door to whatever `callerViewer` answers for the same caller; it asserts a project-carrying viewer only once admission's merge makes the credential's look carry one.
3. R107. `op-declarations` R74 puts `viewer` on `inboxpull` and `inboxresolve` in the table; I also stamp it at the door itself for both (and delete a body `viewer` for both), so the stamp holds whichever table state is merged.

R103's test reads the 15 ops from `op-declarations`' `OPS`; it stays red until T50-24 merges (rule 5's inherited red for the same ops in `r53-routes.test.mjs`).

## J2 · BLOCKED

BLOCKED (cause: needs Bob). R105's bound only; the rest of T50-35 is built and pushed.

NEEDS BOB: approve, in this session, one live `acquire` of one large public page (https://en.wikipedia.org/wiki/United_States) on biosmoke8 as the walk's member sign-in (JOURNEY_MEMBER_*), made directly without the agent proxy, to time it for R105's bound. It files one capture in that test instance. My permission check refused the act ("Production Deploy"); I did not try another route. I signed in once (login answered 200 in 3.2 s) and made no acquire.

Your answer (2) gave a fallback for a session with no credential. I hold the credential but am refused, so I have not taken the fallback: say "build 25 s" and I build the bound at 25 s with the refusal ACQUIRE_TIMED_OUT (its key a REPORT for the design lane) and say so in my record; or have Bob approve the timed acquire and I state the measured bound. Everything else waits for neither.

Built (committed on job/T50/control-plane): R102, R103 (door-side; the ops answer once op-declarations T50-24 merges), R104, R105's `for` sight judgment, R106, R107, R108. Module tests 307 of 310 pass; the three reds are: R103's two tests (op-declarations R73 not merged, so the 15 ops are undeclared; proven green with a temporary local declaration, reverted), and r53-routes R53 (the same cause: following's map holds watchitem, secondlook and secondlookclear, which have no spec until op-declarations merges; it passed under the same temporary declaration).

## Completion record (T50-35) — interim, R105's bound open

**Entries applied.**
- **R102.** The review copy's group fields are read with the draft's project: `groupOf(stub, project)` calls the Store's `groupFields({project})` with the `project` the review copy answers (`review` R9's `project: d.project_id`), and `groupFields()` with none for a draft in no project. `matter_stake` rides in the quartet's `group` and stays outside `hash` (tested: three matter stakes, one hash).
- **R103.** The 15 ops route through the door's general path by their declarations and owners' maps, no code of mine beyond one line: `opencaptures` deletes a caller's `at` and `now` from the address (the owner takes only `by`). The test drives all 15 through `routesForSessions` (every declared stamp from the session, none the caller's, every `member`/`own`/`ownread` op refused to each machine credential).
- **R104.** `app.mjs` `addressPageOf`: a GET or HEAD of a path that is not `/`, `/app…`, `/api…`, carries no `op=` and names no op (an alias read as its op) draws `interfacePage` at 404, under the same namespace and address gates as the other page routes and the page policy; `/doorbell` and `/tour` (trailing slash allowed) draw it at 200. Everything else answers `UNKNOWN_OP` JSON byte for byte (tested five ways). R101's control moved to `/api/no-such-op`.
- **R105 (the `for` half).** A member session's `acquire` whose `for` is a well-formed string is asked of the store's `inquirypartition` as her viewer before the handler runs; only `ok: true` passes. Unseen, absent and no-question are one `BAD_FOR` answer from acquisition's own row `ARCHIVE_CHECKS.BAD_FOR` (C-139.21, `refusal.BAD_FOR`); a store silence is a silence. Malformed `for`, no `for` and any non-member caller's `for` are not judged (acquisition's, R47).
- **R106.** Every `viewer` stamp for an `ai` caller (the sight list, `pdfstructure`/`pagetranscribe`, the capture GET, the promotions' `actorViewer`, the archive's) is `admission.callerViewer(caller, {carry: false})`; identity, author and principal stamps keep the principal. `gatedOp`'s context also carries `aiViewer`.
- **R107.** `inboxresolve` joins the viewer-stamped list beside `inboxpull` (the `pulled` resolve is routed as the pull), and a body `viewer` is deleted for both.
- **R108.** `watchedAsk`: an NDJSON ask answer is piped through a `TransformStream` that enqueues each chunk first and reads its lines after; the drop of the held sign-in (`tokenRefusedSeen`) runs off the caller's path and is awaited only at the stream's end. A JSON ask answer is read whole as before. Tests: first line at ~0 ms against a 400 ms wait; last-line `SIGNIN_TOKEN_REFUSED` drops once; a refusal line split across chunks is seen; a short answer is byte for byte; a JSON refusal is read as before.

**Deferred: R105's bound** (its second sentence and second test; R105 stays `not yet met: T50` for that half). Cause: the timed live `acquire` on biosmoke8 was refused by my permission check (BLOCKED J2, `NEEDS BOB`); I did not work around it. Not built: no deadline at the door. BOB's fallback (25 s, `ACQUIRE_TIMED_OUT`, its key a REPORT) is not taken unless BOB says so.

**Correction to J2.** J2 says "307 of 310"; the figure was a mid-run count with a temporary declaration. The module's run now: 301 tests, 298 pass, 3 fail (below).

**Tests and checks.** `node --test test/m/control-plane/`: 301 tests, 298 pass, 3 fail: R103 ×2 (mine: op-declarations R73 is not merged, so `watchitem` … `stakeatpreparation` are undeclared; with a temporary local declaration of eleven of the 15 (the others' owners have no family yet), reverted before commit, both pass and so do R102, R104–R108 and R53), and `r53-routes` R53 (the same cause: the following map's `watchitem`, `secondlook`, `secondlookclear` have no spec; BOB named it mine to diagnose; it passes under the same temporary declaration). Process repository, from the product: format 0 failures; architecture 0 failures; coverage control-plane 76 of 76 live ids named, 0 failures; ownership 0 failures.

**Found in other modules / for BOB.**
1. `plane` (T50-36): the Store's `groupFields()` must take `{project}` (plane R40) for R102; `gatedOp`'s context now has `aiViewer`, the viewer its arms should use for an `ai` caller instead of `aiCred.principal` (R106).
2. R105 asks `inquirypartition` only for whether she sees a question; that read also computes strength and the change history. A lighter store read of a question's sight would do (an owner's, inquiry or membership `inSight`), and the door would call it instead.
3. `BAD_FOR` is raised at a second site (the door), from acquisition's row; acquisition could export one `badFor(op)` builder for both.
4. `admission` R30 is not merged: R106's test pins the door to `callerViewer`'s answer for the same caller, and asserts a project-carrying viewer once admission's merge makes the credential carry one is not yet testable here.
5. Stale generated artifacts this change makes: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) and `program.mjs`'s inputs, not mine to write.

**Size (session_013W39qjn8635aB3vuz3De9S): test runs 14, module lines 3,890** (3,785 at START; under 4,000).

**Read.** Whole: requirements, `build/layers.md`, all five source files, `harness.mjs`, `r101-favicon.test.mjs`, `door-routes.mjs`, the parts of `t46-door.test.mjs` and `t49-door.test.mjs` that R20 and the helpers use; of the used services: `review` (the review copy's answer), `public-read` R36, `admission` (`callerViewer`, `admit`), `membership` (`projectViewer`, `sight`), `signin-door` (`tokenRefusedSeen`), `acquisition` R47, `inquiry` (`partitionOf`), `plane/ask.mjs` (the ask's stream), `op-declarations` R73–R74. The module's other tests run, not read.

## Completion record (T50-35) — R105's bound added (B3, K3770)

**R105's bound.** `bounded()` races the `acquire` handler against 25 s (`ACQUIRE_BOUND_MS`; `hooks.acquireBoundMs` lets a test shorten it); past it the door answers 504 `ACQUIRE_TIMED_OUT` (`code` the same, `op`, `store`, `tokenClass`), with no sentence of this module's. The handler is not cancelled: a capture it goes on to file stands. Test: a slow handler is answered the refusal, a quick one as it gave, another op unbounded. No live timing was taken (K3770: BOB times one in the release walk).

**REPORT for the design lane:** the member-words key for `ACQUIRE_TIMED_OUT` (N1234); the refusal has no catalogue `check` or `translation` until it has one.

**Tests.** `node --test test/m/control-plane/`: 302 tests, 299 pass, 3 fail, all for the one cause in the earlier record (op-declarations R73 unmerged: R103 ×2, `r53-routes` R53); they pass under a local declaration of the ops. Corrects J2's figure.

**Size (session_013W39qjn8635aB3vuz3De9S): test runs 16, module lines 3,908.**

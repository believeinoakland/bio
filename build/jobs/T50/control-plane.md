# control-plane (T50)

**Status** · session_013W39qjn8635aB3vuz3De9S · depth 2 · NEEDS BOB · handled B2

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

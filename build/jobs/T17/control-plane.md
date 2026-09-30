# control-plane (T17)

**Status** · session_01U9c3F6p3iPjDpkKhwgCrCS · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

N398, N399 (K573): four requirements proposed in my wording, and two facts you asked to hear first. I carry on against these readings; nothing here stops the rest of B1.

(1) `op=stats` still lives in legacy-store (you asked to hear this before anything moves). The route is `store.mjs`:3033 and the method `store.mjs`:2020 (`#counts`); the per-class disclosure (no `leads`, no `observations`, `observationsNonLead` for all, `dbBytes` only when `capacity`) is decided there. Control-plane holds only the two stamps (`index.mjs`:2142 `viewer`, :2277 `capacity`). I move nothing. I convert the stamp half at my interface and leave the disclosure (the suite's arms A, B1, C, E, F) to whichever module takes `op=stats` (legacy-store today, record-core's counts under it, N342). Selftest and livefire (arm D) are legacy-index's hooks and cannot be driven at my interface.
Proposed **R40**: `op=stats` is stamped `capacity=1` exactly for the `admin` class (the ADMIN_TOKEN binding and the founder's session), else `capacity=0`, beside its `viewer` (R17); a caller's `capacity` never reaches the store, in either direction.

(2) `op=purge`'s `confirm=<store>` gate is not in control-plane: it is legacy-index's `gatedOp` arm (`src/index.mjs`:524–538). It refuses through legacy-index's `requiredArgument` (C-61.1), a row my requirements' "Decided by BOB" says is not this module's (K78 (3)). Control-plane cannot import legacy-index (order), so I cannot move the gate here without C-61.1's row being readable from control-plane. Best reading: the gate stays in legacy-index this tranche; I convert its admission half at my interface (member binding CLASS_FORBIDDEN, no class NOT_AUTHENTICATED, a session MACHINE_CREDENTIAL_REQUIRED, probe naming `bio` SCOPE_REFUSED, nothing forwarded), which R6, R9, R10 and R11 already cover, and I record the three confirm arms as not carried (legacy-index's). If you would rather the gate move here, rule where C-61.1's row lives (options: legacy-index hands `requiredArgument` in `hooks`, as it hands it to capture, extraction and monitoring; or the row and helper move to control-plane and legacy-index imports them).
Proposed **R39** (for whichever module holds the gate): `op=purge` is refused 400 `REQUIRED_ARGUMENT_MISSING` (C-61.1), naming `expected` (the namespace the request landed in, R6) and `got`, unless `confirm` equals that namespace, before the store is called; nothing is written.

(3) Proposed **R37** (D-78, `surfaced-by.test.mjs`): on `op=promote`, a creation (`base: null`) of an inquiry (its document's `object_type`, a legacy spelling included, through `normalizeType`) that is not a verified replay (R16) has `surfaced_by` in its `bundle.md` front matter set by the control plane: `human` for a session, `agent` for any other caller; the caller's value never reaches the store. Its `sha256` and `bytes` are recomputed when the caller sent no digest or the digest of the text it sent, else left as sent so the store refuses the mismatch. A revision is not restamped.

(4) Proposed **R38** (D-61, `unattended-lease.test.mjs`): `op=lease`'s `actor` is set by the control plane: a session's member, any other caller `token:<class>` (an `ai` credential `token:ai`); the caller's `actor` never reaches the store. Record-core R10 (ANONYMOUS_LEASE, the lease as a courtesy lock) and promotion's CAS stay theirs, already covered there.

## Progress (B1, B3 applied; B2 waits on BOB's CHANGE)

**Applied.**
- N380 (K559, K580): `pull.mjs`'s `pullAndFile` calls capture's `pullKnock({knockId, by, at, within})`; `within` promotes the pulled document inside the pull's own transaction, so a refusal or a throw of either leaves neither written (no receipt, the knock unchanged, no actor, no bundle, no id drawn). The dry run, the provisional document and the "pulled but not filed" residue of a new pull are gone. A knock already pulled does not call `within`: it answers the bundle holding its capture, or, when none does (pulled through capture's own `inboxpull` route), its document is promoted by this door's pull in a transaction of its own.
- Found and fixed in my module: capture carries a thrown `within`'s message into `PULL_WITHIN_FAILED`'s `detail`; `pull.mjs` now rethrows a promotion's fault as a fixed sentence, so no store message (a constraint's text, a path) reaches the answer (R25's rule for a thrown error).
- N381 (K560, K581): the `test.todo` is a test: one pull through the record store's door files the knock end to end over the real capture, provenance and promotion (one information bundle at `collected`, the puller its author, the capture as its blob and register row, no contact anywhere). The stale `PROVENANCE_REGISTER_REFUSED` arm is replaced by it.
- N388 (K580): `captureaccounts` joins `REC30_VIEWER_READS`; `lateattestations` stays unstamped.
- N386: the pull's instant is `stampInstant("second", now)` (record-core R47).
- N379 (K566): `controlPlaneRoutes` dispatches `sourcesOps`, built lazily (the instance is made only when a sources route runs, so no other route constructs it; the R26 fixture over an empty `ctx` caught the eager form). Sources' four reads are classified in `PROJECT_NAMING_READS_NOT` with their reasons.
- N398, N399 (K573, K607): four suites converted, below. R37, R38, R40 as worded by K607; R39 held for N408.

**Converted suites** (the old suites and helpers are left for legacy-tests).
- `test/surfaced-by.test.mjs` → `test/m/control-plane/surfaced-by.test.mjs` (R37, R16), over its focus fixture. Carries "a focus a member surfaced records human" (every session, the founder's included), "a focus an agent surfaced records agent" and "the caller's hardcoded 'human' did NOT survive" (every non-session caller, both kinds of agent credential). Adds the spellings, a revision, a false digest and a verified replay. Not carried: the enrolment arms and the read-back through `op=file` (membership's and promotion's; the store keeps the forwarded bytes, promotion R18).
- `test/unattended-lease.test.mjs` → `lease.test.mjs` (R38, R17). Carries "the lease names the machine, not the caller-claimed actor" (every class reaching `op=lease`), "the completion NAMES the machine writer" and "the start is attributed to the member's session" (the promotion's `author`). Not carried: the lease as a courtesy lock (`heldBy`, a session refused while the machine holds it) and Part B's ANONYMOUS_LEASE (record-core R10); CAS_STALE and the manifest entries (promotion's); enrolment (membership's).
- `test/purge.test.mjs` → `purge.test.mjs` (R6, R9, R10, R11, R12). Carries "member is refused", "public token is unauthenticated", "probe naming bio is confined", each with its row and nothing forwarded; adds a session's MACHINE_CREDENTIAL_REQUIRED with its recorded decision and an agent's AI_BEYOND_TASK_SCOPE. Not carried: the three `confirm=<store>` arms (legacy-index's `gatedOp`, R39 held for N408, K607); the deletion arms (record-core R21).
- `test/stats-disclosure.test.mjs` → `stats.test.mjs` (R40, R17). Carries B2 (a caller's `capacity`, with `operator`, `proof`, `whole`, never reaches the store as the stamp) and B3 (the admin's `capacity=0` overwritten), and which callers are stamped for the admin shape (the admin binding, the founder's session) and which for the member shape (every other caller, an administering member's session included). Not carried: A, B1's answer shape, C, E, F (legacy-store's `#counts` over record-core's counts, N408); D (op=selftest, op=livefire: legacy-index's hooks).

**Found in other modules.**
- control-plane's own requirements, R36 (BOB's to word): its text still describes the dry run ("the promotion is tried first in a transaction rolled back, and a pull whose promotion then fails ... says so"). Since N380 the pull and the promotion are one act; what remains of the repeated pull is a knock already pulled whose capture no bundle holds (pulled through capture's own route). Both its marks (N380, N381) are met.
- capture R65: `PULL_WITHIN_FAILED`'s `detail` carries a thrown `within`'s message (`capture/index.mjs`, `withinFailed`), which can carry store text to a caller; control-plane no longer throws one with a message, but any other caller of the seam would. Suggest a fixed sentence there.

**Tests and checks** (after merging `tranche/T17` for B3). `test/m/control-plane/`: 79 tests, 79 pass, 0 fail, 0 todo. format (72 modules; 0 failures), architecture (19 files, 101 imports; 0 failures), coverage (39 of 39; 0 failures), ownership (9 files; legacy 0/0; 0 failures). Negative controls, each restored: `captureaccounts` out of the viewer reads, `sourcesOps` not dispatched, the fault not sanitised, `within` not passed: each turns a doorbell test red (1, 1, 1, 3 fails).

**Pending:** B2 (TASK_NOT_YOURS decorated at the door), on BOB's CHANGE that tasks' second completion has merged. *(Done under B4: see Completion.)*

## Completion (B1–B4)

**Applied, beyond Progress above.** B2/B4 (N382, K606): after merging `tranche/T17` with tasks' `TASK_NOT_YOURS`, `envelope.test.mjs`' R22 test reads tasks' four rows under their new keys (the old arm pinning `NOT_YOURS` to intent's row is gone), and a new R22 test drives a forwarded `taskresolve` and `taskforward` refusal through the door: decorated with C-76.1 and tasks' sentence, never intent's C-111.15, with intent's own `NOT_YOURS` still reading intent's row as its negative control. No code change was needed: `dec49Row` finds the row by its new key.

**Deferred.** None. R39 (`op=purge`'s confirmation gate) and `op=stats`' disclosure stay with their current modules by K607 (N408).

**Tests and checks** (on the merged tree). `test/m/control-plane/`: 80 tests, 80 pass, 0 fail, 0 todo. format (72 modules; 0 failures), architecture (19 files, 102 imports; 0 failures), coverage (39 of 39; 0 failures), ownership (9 files; legacy 0/0; 0 failures).

Size (session_01U9c3F6p3iPjDpkKhwgCrCS): test runs 17, module lines 9617

## J2 · REPORT

B1 and B3 applied and pushed on job/T17/control-plane (record: 'Progress'); only B2 remains, waiting on your CHANGE that tasks' TASK_NOT_YOURS has merged. After merging tranche/T17: test/m/control-plane 79/79, 0 todo; format, architecture, coverage (39 of 39), ownership (legacy 0/0): 0 failures.
Two things for you now:
(1) R36's text still describes the dry run ("the promotion is tried first in a transaction rolled back, and a pull whose promotion then fails ... says so in its answer and is promoted by a repeated pull"). Since N380 the pull and its promotion are one act: a refusal or throw of either leaves neither written. What remains of the repeated pull is a knock already pulled whose capture no bundle holds (pulled through capture's own `inboxpull` route), which the door's next pull promotes. Both marks (N380, N381) are met.
(2) capture R65 (not mine): `PULL_WITHIN_FAILED`'s `detail` carries a thrown `within`'s message, which can carry store text to a caller. My pull now rethrows a fault as a fixed sentence, so control-plane's path is clean; a fixed sentence in capture's `withinFailed` would close it for any caller.

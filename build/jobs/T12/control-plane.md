# control-plane (T12)

**Status** · session_01UDmj5HcYEvNNWTxaQkjZLn · depth 2 · WORKING · handled B1

## Work (CONTROL-PLANE #1)

Read whole: `roles/JOB.md`, the requirements, the map, `layers.md`, the plan, B1, and `bio-plane/src/index.mjs` (7,124 lines). Not read whole, for the context budget (P6's reading): `store.mjs` (7,294) and `bio-checks.mjs` (12,301); their moves are the steps still open below and a restarted job reads the map's ranges there.

**Done (commits on this branch):**
1. The extraction of `index.mjs` (map §1), by line range, the code unchanged: `src/control-plane/ops.mjs` holds the declarations (the header, `OPS`, the act lists, `SESSION_OPS`, `NEEDS`, `decorateAct`/`ACT_GATE`, `UNATTENDED_BY_DECISION`); `src/control-plane/index.mjs` holds the doors (`SCRATCH` … `caseReader`, `json`, the DEC-49 decoration with `MODULE_CHECK_FILES` and its 33 imports, REC-52's `doAnswer`/`storeSilent`, the row readers but `requiredArgumentRow`, the session gate, `StoreSilent`, `captureKey`, `migrationReplayOf`) and `makeFetch(hooks)`: OPTIONS, `/version`, `/sign`, `/`, op resolution, the namespace gates, `claim`'s bootstrap checks and its store call, the review door, admission, `whoami`, and the whole forward with its stamps, fences, promote scrubs, the mint and the grant secret. `index.mjs` keeps the arms of modules not yet extracted in two functions, `publicOp` (login, invitelook, enroll, verify, publishedmanifest, instancegroup, groupidentity, caseflags, casedocument, publishedcase/bytes, knock, bootstrap) and `gatedOp` (affordances, queue, registeraudit, selftest, purge, livefire, runtime, cpuprobe, linkproject, governor, links, capture, pdfstructure, archivelookup, acquire, attest, monitor, caseratify, ratify), and routes through `makeFetch`; `publicInstanceGroup`, `FLEET_BINDINGS`/`memberVersions`, `requiredArgument` with its row (C-61.1's raiser, §2) and `storageAbsent` (C-68.1, §2) stay. `captureKey` came to control-plane (its one shape, needed by `migrationReplayOf`; legacy-index imports it). legacy-index: 12 lines added, 6,159 removed.
2. N314's Worker half: `monitorpause` is `{classes: [admin, member], machineClasses: [admin]}` and in both session sets; the `actor` stamp is unchanged (a session its member, the ADMIN_TOKEN bearer `class:admin`); monitoring R30 refuses a non-administrator.
3. D-586 (R19): `aiReachesAsMember(spec, op)` answers false for R14's session-only acts (`GOVERNANCE_ACTIONS`, `IDENTITY_ACTIONS`), at the mint and at the gate.
4. K383: the forward answers `NO_SUCH_KNOCK` from `inboxget`/`inboxresolve` with 404.

Behaviour checked against the old battery before/after (only summaries): members 96/0; the red in fence, plane-envelope, d463, d456, aicredential, refusal-wire, daemon-token and admission-gate are all source-text anchors on `index.mjs` (map §4's list), and doorbell (K383's pin) and monitor-cadence (K404's pin) are red on the tranche too.

**Open (in order, for the next session of this job):**
1. Interface tests `test/m/control-plane/` for R1–R34 (a worker of this session is writing them; the record says when they land).
2. legacy-checks (R32): move `ADMISSION_CHECKS` (C-38.1–.8), `NAMESPACE_CHECKS` (C-78.1–.3), `DISPATCH_CHECKS` (C-69.1–.2), C-68.2–.4, C-29.6–.10, C-32.17, C-64.4 and C-66.6 into `src/control-plane/checks.mjs` (map §1 rows 148–154), rewire their readers, and report the row moves to promotion (N318) and the DEC-49 guard's floors to legacy-tests.
3. legacy-store (R25's store half, R26, R27, K93): `Store.fetch`'s frame (store 6902–6934, 7286–7298), `PROJECT_NAMING_READS`, `#existenceRead` (5987–6068) become `dispatch(req)` here, with the route map a legacy-store method and the Durable Object class control-plane's wrapper.
4. D-629 (R25) and D-679 (R24), judged against `land/worker/D-629` @ 5e202b33 and `land/worker/D-679` @ 8894350b.
5. N53: the skills tests that read `index.mjs` by source (`skillpack.test.mjs`, `skillpack.control.mjs`, `skillsequencing.test.mjs`) move into this module's tests.
6. Each `OPS` row's reason to one line (the map's note on row 129); deferred until the moves are done, since it rewrites 1,400 lines of comment.
7. Grep `civicos-ui/` and affordances' lists for what moved; the reports (legacy-tests' anchors, the plane bundle made stale).

## J1 · QUESTION

Q1. The forward's versionchain stamp normalises `address` with subresources' `normalizeAddress` (index.mjs 5826, moved with the forward). control-plane's uses lack `subresources` (layer 1, no cycle), so architecture fails once. My best reading: add the edge `control-plane` → `subresources`; I import it meanwhile. (Also for your review at close: ownership lists two added legacy-index lines it cannot pair with an import, the headers of `publicOp`/`gatedOp`, the functions that now hold legacy-index's remaining arms for `makeFetch`; the arm bodies are unchanged lines.)

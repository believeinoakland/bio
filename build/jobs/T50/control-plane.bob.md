# BOB to control-plane (T50)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 11, control-plane: **T50-35 · control-plane**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/control-plane.md` (read whole), K3747; the ids marked `*(not yet met: T50)*` are yours to meet: R102 (the review copy carries its draft's matter stake), R103 (the 15 new ops routed through their owners' maps), R104 (an unknown address draws a page), R105 (`acquire`'s `for` judged for sight; the door answers within a bound), R106 (the viewer of an AI caller carries its project), R107 (the stamped viewer reaches `inboxpull` and `inboxresolve`), R108 (the ask's stream passes through the door as written).
BOB's notes for this job:
1. Entry: routes T50's new ops; (N1195; K3637 (3)) R108: the ask stream passes the door as written; (N1186) a run credential's viewer carries its project (credentials R79); (N1174, B-14) an unknown address outside `/api/` draws the interface's `unavailable` page, 404, `UNKNOWN_OP` JSON unchanged for an op; (N933) R102: the review copy's `group` for the draft's project; (N1194) `acquire`'s door answers a document or a named refusal within a stated time (screens-intake, merged before you, may REPORT a cause here); (N1117, K3627) the door refuses an `acquire` whose `for` names a question the member may not see, routes `opencaptures` and `capturegrade`, and passes the stamped `viewer` to `inboxpull` and `inboxresolve` (doorbell R13). K3747: R99 reads `refusal.AGENT_WORKER_UNBOUND` as built, R104 amended, R108 new. DEC-267 and DEC-271 (reads lists) are yours by rule 6.
2. M-T50-1: your START re-measures your module (3,763 by the plan; 3,785 lines now); split by copy first if it would pass about 4,000.
3. Merge after T50-24 (op-declarations) and the screens; before plane. U-numbers: none placed on your module.
4. T50 continues with no more effort on the assistant (Bob, K3717, K3718); lines that wait on the remote proof stay unbuilt, accepted red by name.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements (88 KB) and code (289 KB) are well under 600 KB; its tests (704 KB) are run, read only where they name a requirement you change; its used-public figure (2812 KB) is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it as your own (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L11 merge order: rule 1: translations first, then answer-envelope right after it (BOB's exception, K3696), then `modules.json`'s order: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, admission, store-door, interface-assets, interface-shell, then the screen jobs with screens-settings first among them (DEC-283) and the rest in `modules.json`'s order (screens-entry, screens-wizards, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action), then control-plane, plane, installer, site, journey-check last (K3100). A provider merges before its users; interface-shell before every screen job.

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, now about 23 KB and read whole (K3679).

## B2 · ANSWER · re J1

(1) Plan rule 9 binds the remote assistant's proof (N1196), not R105. The timed acquire is an ordinary live call on biosmoke8 as it is deployed today; no deploy is needed. Sign in with the walk's JOURNEY_MEMBER_* (or JOURNEY_ADMIN_*) environment values and reach the copy directly: curl --noproxy '*', or node with the proxy variables unset (the agent proxy replaces Authorization on *.workers.dev). Make one timed acquire of a large page, record the log lines, diagnose where the time goes, and state the bound in your record for me to write into R105. If your session holds no such credential, build the bound at 25 s with the refusal ACQUIRE_TIMED_OUT, its key a REPORT for the design lane, and say which you did. (2) and (3): accepted. r53-routes R53 is yours to diagnose (rule 5 (14)). K3766.

## B3 · ANSWER · re J2

Not Bob's: no session brings Bob an approval request (K3466, K3600), and a refused act is not worked around. Build 25 s: R105 now states it on tranche/T50 (merge it): past 25 s the door answers ACQUIRE_TIMED_OUT, never a silent stop; its key is owed by the design lane (N1234), so name the code and REPORT the key. I time one large acquire on biosmoke8 in T50's release walk. Set your state back to WORKING, then COMPLETE once R105 and its test are in. K3770.

## B4 · CHANGE

From PLANE #40 (P9, K3771), under your R108 (the ask stream passes the door as written): bio-plane/src/control-plane/index.mjs about lines 2187-2191 (signin-door R4's tokenRefusedSeen) awaits armed.clone().json() for op === 'ask' from a session before returning armed, which reads the whole stream first (headers arrive only when the producer finishes: 2,038 ms for a 2 s producer through makeFetch), and an NDJSON body is never one JSON value, so a refusal in a stream is never seen. Look at the stream's lines as they pass (as the plane's ask.mjs watched() does) instead. Test: first line through the Worker's fetch before the producer's wait ends.

## B5 · CHANGE

op-declarations (T50-24) is merged into tranche/T50 (K3776): the fifteen T50 ops are declared and themeread is in both SESSION_OPS sets. Merge tranche/T50 and re-run; only interface-shell's merge remains before yours, and I send one more CHANGE then.

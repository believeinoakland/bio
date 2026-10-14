# plane (T48)

**Status** · session_01QDjs42zsRWgcyCJLgGDJKm · depth 2 · WORKING · handled B3

## J1 · QUESTION

Reading my entries before building, one interface question and my best reading (I build on it unless you answer otherwise):

R55 (trace and member ref) and control-plane R93: the requirements say the door "passes both to the plane's call in process" but name no argument. My reading: the values are strings named `trace` and `memberRef` (signin-door R3's form; the same names agent-model R16 uses). The plane takes them as (a) hook parameters of `gatedOp` (for `ask`, handed on to the `ask` RPC), (b) fields of the `ask(args)` and `draft(args)` RPC args, (c) fields of `transcription({member, project, at, trace?, memberRef?})`, and (d) fields of the Store's `dispatchMemberRun` args, passed to ai-runs beside `run, by, viewer, at` (R46's no-credential rule unchanged). The plane sends them as headers `x-civicsmith-trace` and `x-civicsmith-member-ref`, only when each is a non-empty string, never in a body or address. If control-plane's job names them differently, tell me the names.

Also noted: instance-setup's `readingLanguage` and `updateNoticeState` (R50, R52) are not on the tranche yet. I write R50 and R52 against the services as named in the requirements and test them against stand-ins until instance-setup merges; I re-run on the merged service before COMPLETE.

## J2 · QUESTION

R50 item 2, a second reading (builds on it unless you say otherwise; this replaces nothing, J1 is a separate question):

`readtranslate` for kind `question` or `finding`: the requirement says "text through `inquiry` for her", but `inquiry` exports no read of one question's text. My reading: the subject is a bundle read through record-core's `bundleInfo(id)` gated by `membership.inSight(id, viewer)`; absent or unseen answers inquiry's own `NO_SUCH_BUNDLE` (as `inquiry` and `hypotheses` answer it), the type must be `inquiry`, and the text is the bundle's title (the question's statement, as `deriveInquiryTitle` makes it; a finding is the same bundle concluded). For `note`: `hypotheses.notesOf({viewer})` paged until the note's number is found; absent or another member's answers `NO_SUCH_NOTE` in hypotheses' own shape. For `notice`: `network-notices.noticesOf({project, viewer})`, the notice's latest revision's wording, body and matter, one per line; `project` is the subject's `project`. If you want a read added to `inquiry` instead (a service returning a question's text for a viewer), that is inquiry's module, not mine: say so and I take it when it exists.

## J3 · REPORT

Build state and one edge I need (BOB's file, modules.json):

1. `architecture.mjs bio plane` fails only on `plane → machinery-producers`, which plane R52 and the requirements' Uses name as a new edge ("each earlier") but `build/modules.json` does not yet list. The `ai-accounts`, `jurisdictions` and `signin-door` edges are there. Please add `machinery-producers` to plane's `uses` on `tranche/T48`; I merge it. I build machinery-producers in the composition root with `{updateNotice}` before queue-producers' factory (which keeps the first instance per storage), so a bare one is never made first: machinery-producers' own deps default to its module's instances on the same storage.

2. Done and tested on my branch: R50 (readtranslate, on your J2 reading), R51, R52 (first test green; the op=queue one waits on `queue`'s merge, which now refuses the kind `update-ready` as NO_SUCH_KIND), R53, R55 and the T48 op-map pins (`actionreplyquoting`, `filingread`, `pressurefor`, `aiuseovertime`). R50's language and R52's state use stand-ins for instance-setup's `readingLanguage` and `updateNoticeState` until it merges (the tests use the real ones when present).

3. For control-plane (its R93/R90): the plane takes `trace`/`memberRef` as you confirmed (K3293), and `readtranslate` reaches `draft(args)` as `{op: "readtranslate", member, session, subject: {kind, id, project?}, language?, pack?, trace?, memberRef?}`. The draft answer carries `usage` and `calls` for the door's count; the plane does not count it itself.

4. Findings in other modules (for their records): (a) `extraction` calls the transcriber's `transcription({member, project, at})` without the door's trace and member ref, so `/transcribe` carries them only when extraction passes `trace`/`memberRef` through (the plane's `transcription()` already takes them; its `pagetranscribe` hook is handed them too); (b) `ai-runs.dispatchMemberRun` is handed `trace`/`memberRef` by the Store RPC and must accept and use them for the `/run` call; (c) `credentials`' transitional spread of `aiAccountsOps` overrides ai-accounts' own map in the route map, so the plane drops the names ai-accounts serves from credentials' map (R53: each op reaches one handler); credentials can delete its spread; (d) instance-setup's `assistantGate` still asks `credentials.aiKeptAway`, a delegate, until its job re-points.

## J4 · REPORT

Build state and one edge I need (BOB's file, modules.json):

1. `architecture.mjs bio plane` fails only on `plane → machinery-producers`, which plane R52 and the requirements' Uses name as a new edge ("each earlier") but `build/modules.json` does not yet list. The `ai-accounts`, `jurisdictions` and `signin-door` edges are there. Please add `machinery-producers` to plane's `uses` on `tranche/T48`; I merge it. I build machinery-producers in the composition root with `{updateNotice}` before queue-producers' factory (which keeps the first instance per storage), so a bare one is never made first: machinery-producers' own deps default to its module's instances on the same storage.

2. Done and tested on my branch: R50 (readtranslate, on your J2 reading), R51, R52 (first test green; the op=queue one waits on `queue`'s merge, which now refuses the kind `update-ready` as NO_SUCH_KIND), R53, R55 and the T48 op-map pins (`actionreplyquoting`, `filingread`, `pressurefor`, `aiuseovertime`). R50's language and R52's state use stand-ins for instance-setup's `readingLanguage` and `updateNoticeState` until it merges (the tests use the real ones when present).

3. For control-plane (its R93/R90): the plane takes `trace`/`memberRef` as you confirmed (K3293), and `readtranslate` reaches `draft(args)` as `{op: "readtranslate", member, session, subject: {kind, id, project?}, language?, pack?, trace?, memberRef?}`. The draft answer carries `usage` and `calls` for the door's count; the plane does not count it itself.

4. Findings in other modules (for their records): (a) `extraction` calls the transcriber's `transcription({member, project, at})` without the door's trace and member ref, so `/transcribe` carries them only when extraction passes `trace`/`memberRef` through (the plane's `transcription()` already takes them; its `pagetranscribe` hook is handed them too); (b) `ai-runs.dispatchMemberRun` is handed `trace`/`memberRef` by the Store RPC and must accept and use them for the `/run` call; (c) `credentials`' transitional spread of `aiAccountsOps` overrides ai-accounts' own map in the route map, so the plane drops the names ai-accounts serves from credentials' map (R53: each op reaches one handler); credentials can delete its spread; (d) instance-setup's `assistantGate` still asks `credentials.aiKeptAway`, a delegate, until its job re-points.

## J5 · REPORT

Build state and one edge I need (BOB's file, modules.json):

1. `architecture.mjs bio plane` fails only on `plane → machinery-producers`, which plane R52 and the requirements' Uses name as a new edge ("each earlier") but `build/modules.json` does not yet list. The `ai-accounts`, `jurisdictions` and `signin-door` edges are there. Please add `machinery-producers` to plane's `uses` on `tranche/T48`; I merge it. I build machinery-producers in the composition root with `{updateNotice}` before queue-producers' factory (which keeps the first instance per storage), so a bare one is never made first: machinery-producers' own deps default to its module's instances on the same storage.

2. Done and tested on my branch: R50 (readtranslate, on your J2 reading), R51, R52 (first test green; the op=queue one waits on `queue`'s merge, which now refuses the kind `update-ready` as NO_SUCH_KIND), R53, R55 and the T48 op-map pins (`actionreplyquoting`, `filingread`, `pressurefor`, `aiuseovertime`). R50's language and R52's state use stand-ins for instance-setup's `readingLanguage` and `updateNoticeState` until it merges (the tests use the real ones when present).

3. For control-plane (its R93/R90): the plane takes `trace`/`memberRef` as you confirmed (K3293), and `readtranslate` reaches `draft(args)` as `{op: "readtranslate", member, session, subject: {kind, id, project?}, language?, pack?, trace?, memberRef?}`. The draft answer carries `usage` and `calls` for the door's count; the plane does not count it itself.

4. Findings in other modules (for their records): (a) `extraction` calls the transcriber's `transcription({member, project, at})` without the door's trace and member ref, so `/transcribe` carries them only when extraction passes `trace`/`memberRef` through (the plane's `transcription()` already takes them; its `pagetranscribe` hook is handed them too); (b) `ai-runs.dispatchMemberRun` is handed `trace`/`memberRef` by the Store RPC and must accept and use them for the `/run` call; (c) `credentials`' transitional spread of `aiAccountsOps` overrides ai-accounts' own map in the route map, so the plane drops the names ai-accounts serves from credentials' map (R53: each op reaches one handler); credentials can delete its spread; (d) instance-setup's `assistantGate` still asks `credentials.aiKeptAway`, a delegate, until its job re-points.

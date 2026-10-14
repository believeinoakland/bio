# plane (T48)

**Status** · session_01QDjs42zsRWgcyCJLgGDJKm · depth 2 · WORKING · handled B0

## J1 · QUESTION

Reading my entries before building, one interface question and my best reading (I build on it unless you answer otherwise):

R55 (trace and member ref) and control-plane R93: the requirements say the door "passes both to the plane's call in process" but name no argument. My reading: the values are strings named `trace` and `memberRef` (signin-door R3's form; the same names agent-model R16 uses). The plane takes them as (a) hook parameters of `gatedOp` (for `ask`, handed on to the `ask` RPC), (b) fields of the `ask(args)` and `draft(args)` RPC args, (c) fields of `transcription({member, project, at, trace?, memberRef?})`, and (d) fields of the Store's `dispatchMemberRun` args, passed to ai-runs beside `run, by, viewer, at` (R46's no-credential rule unchanged). The plane sends them as headers `x-civicsmith-trace` and `x-civicsmith-member-ref`, only when each is a non-empty string, never in a body or address. If control-plane's job names them differently, tell me the names.

Also noted: instance-setup's `readingLanguage` and `updateNoticeState` (R50, R52) are not on the tranche yet. I write R50 and R52 against the services as named in the requirements and test them against stand-ins until instance-setup merges; I re-run on the merged service before COMPLETE.

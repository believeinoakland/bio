# plane (T48)

**Status** · session_01QDjs42zsRWgcyCJLgGDJKm · depth 2 · WORKING · handled B1

## J1 · QUESTION

Reading my entries before building, one interface question and my best reading (I build on it unless you answer otherwise):

R55 (trace and member ref) and control-plane R93: the requirements say the door "passes both to the plane's call in process" but name no argument. My reading: the values are strings named `trace` and `memberRef` (signin-door R3's form; the same names agent-model R16 uses). The plane takes them as (a) hook parameters of `gatedOp` (for `ask`, handed on to the `ask` RPC), (b) fields of the `ask(args)` and `draft(args)` RPC args, (c) fields of `transcription({member, project, at, trace?, memberRef?})`, and (d) fields of the Store's `dispatchMemberRun` args, passed to ai-runs beside `run, by, viewer, at` (R46's no-credential rule unchanged). The plane sends them as headers `x-civicsmith-trace` and `x-civicsmith-member-ref`, only when each is a non-empty string, never in a body or address. If control-plane's job names them differently, tell me the names.

Also noted: instance-setup's `readingLanguage` and `updateNoticeState` (R50, R52) are not on the tranche yet. I write R50 and R52 against the services as named in the requirements and test them against stand-ins until instance-setup merges; I re-run on the merged service before COMPLETE.

## J2 · QUESTION

R50 item 2, a second reading (builds on it unless you say otherwise; this replaces nothing, J1 is a separate question):

`readtranslate` for kind `question` or `finding`: the requirement says "text through `inquiry` for her", but `inquiry` exports no read of one question's text. My reading: the subject is a bundle read through record-core's `bundleInfo(id)` gated by `membership.inSight(id, viewer)`; absent or unseen answers inquiry's own `NO_SUCH_BUNDLE` (as `inquiry` and `hypotheses` answer it), the type must be `inquiry`, and the text is the bundle's title (the question's statement, as `deriveInquiryTitle` makes it; a finding is the same bundle concluded). For `note`: `hypotheses.notesOf({viewer})` paged until the note's number is found; absent or another member's answers `NO_SUCH_NOTE` in hypotheses' own shape. For `notice`: `network-notices.noticesOf({project, viewer})`, the notice's latest revision's wording, body and matter, one per line; `project` is the subject's `project`. If you want a read added to `inquiry` instead (a service returning a question's text for a viewer), that is inquiry's module, not mine: say so and I take it when it exists.

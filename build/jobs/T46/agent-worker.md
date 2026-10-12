# agent-worker (T46)

**Status** · session_018akUZcPceLXkFDzzdQL8Tr · depth 2 · WORKING · handled B3

## J1 · QUESTION

Three readings; I carry on with each as my best reading. Only (1) decides anything another job builds (ai-runs R18's dispatch).

(1) R80, the wire for a member's own sign-in run (M-T46-4; ai-runs R18 "agree the wire through BOB"). `/run` today refuses such a run for one reason only: R6 refuses a `signin` account whose `suggestions` is not `false` (`index.mjs`:1521), which the R6 amendment lifts. Everything else already takes it: R5 is a shape test (`aik-` + 64 lowercase hex), liveness and scope are the plane's (R8's `whoami`, then every op under it); R10 compares `session.principal.ref` (`member:<id>`) with `account.member`. So my reading is that `/run` adds no new credential shape: the dispatch sends `{run_id, store, credential, account}` with
  - `credential`: an `ai` credential whose principal is that member's (`member:<id>/<tokenId>`, the run's `principal_plane`), `aik-` shaped, so the plane admits every op of the segment under her principal (run-rules R5);
  - `account`: `{kind: "signin", level: "member", member: "member:<id>", suggestions: <her sign-in's switch, a boolean>}`, no `secret`.
If ai-runs cannot hand such an `aik-` credential (the plane keeps only its SHA-256), the minting is credentials'/ai-runs', not this module's: proposed, a short-lived `aik-` credential minted for her principal at her act, which `/run` takes unchanged. If BOB rules a different form (e.g. her session token or an ask grant), R5 must widen and I will build that instead; tell me which. Tests (R80): a stub plane whose `airun` records `principal.ref` `member:m1` and a sign-in account for `member:m1` with `suggestions: true` runs a segment on a stub RUNNER; control: the same run with another member's account answers `RUN_NAMES_A_DIFFERENT_PAYER`.

(2) R76's `statusreportdraft`: `items` are plan-work R8's items, which carry no id of their own (`{section, ...fields, source}`). My reading: `sources` names the items by their 0-based index in the handed `items` list (distinct integers, at least one, each < items.length), so the door can map each to the item's own `source`; anything else is DRAFT_UNFORMED. `plan` an id string (1–200), `items` a non-empty list of objects within the same 200,000-character bound as K2824's records; else BAD_TASK. The items reach the model only as the `read_facts` result (R61), as K2824's records do.

(3) R79's `untested`: "the label object as run-rules' untestedLabel answers it" read as: deep-equal to `untestedLabel(untested.part)` (run-rules R29, imported at runtime as run-rules already is); a `null` from it, or any other value, `BAD_BODY`. Absent or `null` means no label.

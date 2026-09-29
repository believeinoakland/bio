# publication (T14)

**Status** · session_01DzEFa2jXcS7Vn9phBtGPyZ · depth 2 · WORKING · handled B2

## J1 · QUESTION

R49's `since`: where each instant is read. My best reading, which I am building now; nothing else waits on the answer.

1. `investigating.since`: the earliest recorded instant among the legs of the held questions read that have a leg (inquiry R16 `basisFor`, each leg's `at`, the leg's authored date as `inquiry_basis` projects it). A leg with no instant does not count; with none, `since` is null (R28: stated, never filled). The read is R45's bounded one, so it is "earliest among those read".
2. `matured.since`: the earliest of (a) the `at` of each held question read that the project has concluded (basis-versions R22 `conclusionOf`, the current conclusion, so a withdrawal moves it to the conclusion that earns the stage then) and (b) the earliest `published_cases.ratified_at` of the project's ratified case editions. `earned` still names R45's `basis` evidence (the first concluded question read, else the first ratified case edition by id), so `since` may come from the other half when it is earlier.
3. `forming`: reached whenever the stage is computed, `earned: null`, `since: null` (no evidence earns the ground stage; it is not "skipped").
4. `closed.since` ("the instant the close was recorded, as the store holds it", K452): the `timestamp` of the newest `state_history` entry with `to_state: closed` in the project's stored document; null when there is none or it is not an instant. The alternative is the `manifest.created` of the commit that first wrote the close, which needs a walk of the document's history; I did not take it.
5. Reached stages also carry a `why` (every entry has one): a fixed sentence with counts, e.g. "N held questions read have a leg in their basis."

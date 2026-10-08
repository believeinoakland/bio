# scheduler (T37)

**Status** · session_01LYDPVU33jWW5KRDoigq6gZ · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · QUESTION

**R24 applied; one red decides my next test change.** `scheduler/plane.test.mjs`'s R12 test (:177) now fails a new way after its credential fix: "the request expired within 1000 alarms" (null).

Cause, measured (each firing's answer logged): the run's `op=acquire` makes a capture, so `file-safety` queues its safe view; this Miniflare plane binds no `FILE_SCANNER`, so every `renderBatch` answers `RENDERER_ABSENT`, and `renderWake` (file-safety R39: "the later of `now` and the last `renderBatch` plus `FILE_SAFETY_POLL_MS`" while a view is queued) wants a wake forever. Two consequences:
1. **In production**, an instance holding one queued file with no renderer bound polls `renderBatch` every 5 minutes forever, each refused; it never idles (R15's spirit), unlike `scanWake`, which R39 makes null "with no scanner bound". Not a spin in production, a perpetual poll.
2. **In this test**, file-safety stamps its last `renderBatch` on its own (wall) clock while the test drives `onAlarm` on a virtual clock up to 24 h ahead, so R39 answers about wall + 5 min, i.e. ~100 ms after each virtual firing: the alarm crawls and never reaches the request's 24 h expiry.

The scheduler here does exactly R24 (due and wake are R39's answer; no interval held, R7), so per the START I hold nothing here and report it.

**My best reading / recommendation (QUESTION):** (a) a `file-safety` share: R39's render (and the safe-copy part of it) is null while no renderer is bound, as scan's is with no scanner; my R12 test then passes unchanged. Until it lands, R12's test (:177) is red by this cause alone. Alternatives: (b) I give `plane.test.mjs` a scripted `FILE_SCANNER` service binding that renders, so the queue drains (hides the flaw; adds a stand-in for another module's worker in my test); (c) accept :177 red by name until (a). I recommend (a) with (c) meanwhile. Everything else is done or under way: the other 5 plane tests green (rows 54–58's cause fixed); my suites 104/104 apart from :177; checks next.

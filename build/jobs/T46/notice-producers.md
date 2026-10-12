# notice-producers (T46)

**Status** · session_014SC3rCBPTNFj9KFcNmLCLT · depth 2 · WAITING ON BOB (J1) · handled B2

## Completion (T46-47)

- **Read:** whole: my requirements (public and private), my code (`index.mjs`, `words.mjs`) and all 13 test files. The 19 used modules' public parts plus queue's were over the reading limit (K2700). One helper read them in full and wrote a digest citing each section (steps R12, R29; following R25; duties R9–R14; queue R11, R13, R16, R27, R42, R51); the sources stay binding. No flaw found in my own module.
- **R19 applied:** `facts.step_due.truncated` carries `stepsDue`'s `truncated: true` (only a `true`), beside this module's own cut of 200. Tested over the real steps:
  - 1,001 future-dated open steps → truncated, no item drawn; control: 1,000 after one is ended, not truncated; another member, not truncated.
  - 1,001 reminders due → truncated.
  - Stub controls at the interface.
- **R18 applied, per B2 (K2996):** an occurrence whose first told day (the first candidate's, else its due day's) ended no later than the start of the end day is already told. It is exempt from R5's end of telling: kept with the same key until disposed, and raised as overdue later. It still leaves when met, met late or no longer overdue. An occurrence not told keeps R5's rule.
  - Tested over the real `following` (link, plan closed, stop answered): stopped after it was told → kept on every read; controls: a stop before it came due, and a stop on its first candidate day, raise none.
  - **Known limit:** following answers no instant, so the rule is exact for every stop, but a keep answered before an occurrence whose candidates span its end day reads as told. The exact instant is N967 (T47).
  - The test double of an unbuilt `dutyWatchEndAt` is dropped.
- **Deferred:** none.
- **Found in another module:** `steps.laterFound` answers `truncated` (src/steps), but steps R23 does not state it. So this module does not carry it into `facts.step_later_found`: a bound reached there is silent, against R1's intent. Suggest steps R23 state it; this module would then carry it as R19 does for `stepsDue`.
- **Tests:** `node --test bio-plane/test/m/notice-producers/`: 106 pass, 0 fail. Users: `queue` (`test/m/queue/`, `conclude-project.test.mjs`): 143 pass, 0 fail.
- **Checks:** format 0 failures; architecture (15 files) 0 failures; coverage 19 of 19 ids, 0 failures; ownership (4 files) 0 failures. `run.mjs`: format, architecture and channels 0 failures; its coverage failures are other L11 modules' unbuilt ids, none mine.
- Size (session_014SC3rCBPTNFj9KFcNmLCLT): test runs 9, module lines 1376

## J1 · QUESTION

R18 needs to know whether an occurrence was "already told" before the duty's watch end took hold. This module writes nothing and `queue` keeps no items (its R51, R11: the mint stores nothing), so "told" must be derived on read. `following.dutyWatchEnd(duty)` answers only the end day E. That is exact for a `stop` (E is the answer's own day) but not for a `keep` (E is after the answer's day): with keep until E answered on day A, an occurrence whose first candidate falls in (A, E] and latest after E was never told under R5 (the end was already set when it came due), yet from E alone it looks the same as one told before a stop. R18's own control (told, then stop → kept; stop before told → none) needs the instant the end took hold.

(1) Best reading, which I am building to: an occurrence is told when its told state (overdue: from the end of its due day, the latest candidate's; possibly overdue: from the end of its first candidate's day, civil-time) began before the end took hold; a told occurrence is exempt from R5's end of telling entirely (its state change to overdue raises the overdue item as R5 does, and it leaves as R5 states). An occurrence not told keeps R5's rule (no item when its due day or latest candidate is after E).
(2) What it needs: a read in `following` (your change; following R25), e.g. `dutyWatchEndAt(duty)` → null, or `{day, at}` with `at` the recorded instant (`watch_answers.at`, already stored) of the answer that made the end hold (the latest answer among the duty's links, since the end is null while any link is unanswered). Writes nothing, never throws, as `dutyWatchEnd`.
Recommendation: add (2) to following R25 in this tranche; I read it when present.
Until you answer, I build R18 against (2) with a test double for `following`, and fall back, where `following` has no such read, to the end day alone (told iff its told state began on or before E), which is exact for every stop and errs only for a keep across candidates. Say if you want the fallback dropped (then a real `following` without the read keeps R5's rule as now).

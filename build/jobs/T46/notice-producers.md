# notice-producers (T46)

**Status** · session_014SC3rCBPTNFj9KFcNmLCLT · depth 2 · WAITING ON BOB (J1) · handled B1

## Progress

- Read whole: my requirements (public and private), my code (`index.mjs`, `words.mjs`) and all 13 test files. The 19 used modules' public parts plus queue's (over the reading limit, K2700) were read in full by one helper; its digest cites each section (steps R12, R29; following R25; duties R9–R14; queue R11, R13, R16, R27, R42, R51). The sources stay binding.
- R19 done: `facts.step_due.truncated` carries `stepsDue`'s `truncated: true` (only a `true`), beside this module's own 200 cut. Test over the real steps: 1,001 future-dated open steps → truncated (control: 1,000 after one ended); 1,001 reminders due → truncated; stub controls.
- R18 built to J1's reading: `following.dutyWatchEndAt(duty)` → `{day, at}` read when present; otherwise the fallback on the end day alone. An occurrence told before the end took hold is exempt from the end of telling. Six tests (stand-in duties with candidates 20 Feb – 10 Mar; following in R25's shape).
- Tests 109/109; queue's 143/143. format, architecture, coverage and ownership: 0 failures; `run.mjs`: architecture 0 failures.
- Next: apply BOB's answer to J1, then step 7.

## J1 · QUESTION

R18 needs to know whether an occurrence was "already told" before the duty's watch end took hold. This module writes nothing and `queue` keeps no items (its R51, R11: the mint stores nothing), so "told" must be derived on read. `following.dutyWatchEnd(duty)` answers only the end day E. That is exact for a `stop` (E is the answer's own day) but not for a `keep` (E is after the answer's day): with keep until E answered on day A, an occurrence whose first candidate falls in (A, E] and latest after E was never told under R5 (the end was already set when it came due), yet from E alone it looks the same as one told before a stop. R18's own control (told, then stop → kept; stop before told → none) needs the instant the end took hold.

(1) Best reading, which I am building to: an occurrence is told when its told state (overdue: from the end of its due day, the latest candidate's; possibly overdue: from the end of its first candidate's day, civil-time) began before the end took hold; a told occurrence is exempt from R5's end of telling entirely (its state change to overdue raises the overdue item as R5 does, and it leaves as R5 states). An occurrence not told keeps R5's rule (no item when its due day or latest candidate is after E).
(2) What it needs: a read in `following` (your change; following R25), e.g. `dutyWatchEndAt(duty)` → null, or `{day, at}` with `at` the recorded instant (`watch_answers.at`, already stored) of the answer that made the end hold (the latest answer among the duty's links, since the end is null while any link is unanswered). Writes nothing, never throws, as `dutyWatchEnd`.
Recommendation: add (2) to following R25 in this tranche; I read it when present.
Until you answer, I build R18 against (2) with a test double for `following`, and fall back, where `following` has no such read, to the end day alone (told iff its told state began on or before E), which is exact for every stop and errs only for a keep across candidates. Say if you want the fallback dropped (then a real `following` without the read keeps R5's rule as now).

# Load management: a copy that sheds load instead of failing (draft)

**Status** · DRAFT, not READY: the bound N needs the load test's figure. PLATFORM #3, 2026-10-28. Bob's direction (`DECISIONS.md`, 2026-10-28): manage load just below the level where errors build up, never accept errors as the price of load. For BOB to bring Bob the policy choice in §3.

## 1. What is read and measured (sources named)
- **Today** (read in `bio-plane/src`): `admission` decides who may call an op, plus one window per source for credential-free ops (R21). A search of `plane`, `store-assembly`, `control-plane` for in-flight or concurrency limits found none on member calls (only the scheduler's own in-flight set); not every file was read. The only limiter seen is Cloudflare's: "Durable Object is overloaded. Requests queued for too long." (115 events in the first ramp, `study/s1-results.md`).
- **What breaks** (measured on `plat-s1`, `study/s1-results.md`): errors rise at **15 members** with an administrator walker per ten and an upload a minute, both on PLATFORM #2's run (1.24 %) and this session's (10.5 % of requests, after removing a driver mistake): not at a member count by itself but when heavy work lands together; the room (one Durable Object) resets when it exceeds its memory limit and kills every request in flight (227 resets in 36 h), most during the alarm's reading of promoted documents (22 of 34 reset alarms began in `pending-work`); the holder is not yet named.
- **Consequence for the design:** the limit is **work in flight in the room, not members**, and the room cannot read its own memory (`memoryUsage` answers zeros in workerd). A member-count cap would be a poor proxy.

## 2. Proposed mechanisms (each testable by the load test, PL40-PL45)
1. **A bounded door queue.** The door admits at most N calls to a room at once and holds a bounded line behind them (a few seconds at most); beyond that it answers at once "busy, try again in n seconds" (HTTP 429 with Retry-After), in the team's words, and the page retries quietly. Under N nobody sees an error. N per service level comes from the measured break less a margin (the 70 %/90 % habit of K5438's gauge).
2. **Priority.** Member acts and cheap reads go first; the heavy administrator reads (`heldcaptures`, list reads) and background work (reading, derive) wait. Extends PL7: the alarm starts no reading run while calls are in flight or the line is non-empty, and runs it in idle slices.
3. **A work budget in bytes.** The room reserves memory per admitted call by size (an upload's bytes, a reading's window) and admits only while the sum stays under a budget, since it cannot measure itself. Needs the memory holder named first (study in progress, `proto/levels-2-3-mem`).
4. **Never lose what a member submitted.** An upload that is turned away is held by the page and retried, with the sentence saying so; today a failed upload shows a fault and no retry (T53-585).
5. **Show the load.** The administrator's Home states "busy" and what it is deferring.

## 3. For Bob (to be brought with options)
When a copy is over its limit, which should a member meet? **(a)** a short wait, then "busy, try again"; **(b)** always an answer, from a cache or partial; **(c)** the heaviest things (new uploads, then readings) refused or deferred first while reads and acts go on. **Recommended: (c) then (a)**, with **(b)** for the reads C can serve; nothing a member submitted is lost. Also his: the guarantee, a number per level "up to N members working at once without errors", once measured.

## 4. Test and ownership
Per level: errors **0** below N and only the stated "busy" answer above it, at the ramp's mix; a ramp that goes past N proves the shed (no resets, no 5xx). Owners to be named by PLANNING: the door (`plane`, `control-plane`), the scheduler (idle slices), reading (the byte budget). Not measured: N; the overhead of the queue; whether shedding alone stops the resets (it may not, if one reading breaks the limit alone).

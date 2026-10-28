# S1: the determination of N on `plat-s1` (the chain build)

**Status** · PLATFORM #3, 2026-10-28 20:39-22:37Z. Continues `s1-b-ramp-memory.md`. Live build: `proto/levels-2-3-chain` 9a0e6075 (bundle 8299fcc9…; `PROTO_WINDOW_BYTES=auto`, `PROTO_CHAIN_BYTES=16777216`, `PROTO_CHAIN_REST_MS=20000`, `PROTO_PIECE_UNITS=512`, `PROTO_READOUT=0`, C on). Room at the start: 855 documents, 2,982,101 text units, all indexed. Through the agent proxy, raw times, proxy in; administrator and `plat2-member` sessions; credentials never printed.

**Method.** `study/run-n.sh` (the order was fixed by hand, a shuffle: 15 5 25 10 30 20 25 15 10 30 5 20 10 20 30 5 15 25): 18 steps of the mixed ramp (`ramp3.cjs`: N virtual members replaying the screens' declared reads, 30 s mean think time; one administrator walker per ten members, at least one; one 200 KB upload a minute; each step 240 s plus the walkers' start-up, 4-7 min in all), three replicates of each of N = 5, 10, 15, 20, 25, 30. Before each step `quiet-wait.py` waited for 120 s without an error event in the Worker telemetry and every document indexed (it never gave up; waits 6-101 s). Errors are every answer with a status of 500 or over, or no answer (the replay now sends the body `{"step":"state"}` that the page sends to `subscriptionsignin`). Resets are the Worker telemetry's "Durable Object's isolate exceeded its memory limit and was reset" events within 2 s of one another merged into one reset (a reset logs one event for every request it kills); `study/n-analyse.py`; raw `study/n-analysis.json` and, in the scratchpad, `ramp-nstepNN-mN.json`.

| members | errors / requests in each replicate | resets (per minute) in each replicate | requests killed by resets |
|---|---|---|---|
| 5 | 51/959 (5.32 %), 2/819 (0.24 %), 0/974 | 4 (0.78), 4 (0.86), 0 | 37, 5, 0 |
| 10 | 0/1700, 0/1584, 1/1515 | 0, 0, 1 (0.19) | 0, 0, 1 |
| 15 | 57/2251 (2.53 %), 36/2570 (1.40 %), 0/3063 | 2 (0.29), 3 (0.60), 7 (1.03) | 39, 52, 24 |
| 20 | 1/3384, 0/3066, 0/3300 | 2 (0.35), 5 (0.84), 1 (0.17) | 10, 15, 2 |
| 25 | 0/4295, 37/4536 (0.82 %), 3/4469 | 7 (1.18), 9 (1.49), 6 (0.83) | 42, 56, 20 |
| 30 | 2/5409, 334/4988 (6.70 %), 2/5199 | 2 (0.37), 4 (0.61), 5 (0.85) | 6, 152, 35 |

Pooled by member count: errors 1.93 %, 0.02 %, 1.18 %, 0.01 %, 0.30 %, 2.17 % for 5, 10, 15, 20, 25, 30 members; resets a minute 0.53, 0.06, 0.64, 0.46, 1.14, 0.62; requests killed per reset 5.3, 1.0, 9.6, 3.4, 5.4, 17.5. Uploads that did not answer 200: 0, 0, 2, 1, 1, 1 (of about 3 per step). Cloudflare's "Durable Object is overloaded" shed: 16 lines in all 18 steps, every one in the 30-member steps.

Member frame times, the median of the three replicates' medians / the worst of the three p90 (ms): Home 1,651/3,874 (5), 1,524/3,361 (10), 1,313/4,833 (15), 1,231/5,249 (20), 1,459/7,725 (25), 1,385/5,706 (30); Project 1,381/6,817, 1,720/7,279, 1,480/19,485, 1,361/4,220, 1,759/7,328, 1,562/6,011; Queue medians 1.16-1.25 s throughout, worst p90 2.6-8.6 s.

**Reading (measured; then what it does not show).**
1. **No break point between 5 and 30 members was found.** The error rate does not rise with the member count: the worst replicates are 5 members (5.32 %) and 30 members (6.70 %), and 10 and 20 members were nearly clean in all three replicates. Resets a minute rise a little at 25 (1.14) but not at 30 (0.62).
2. **The errors come in bursts, each a reset killing the requests in flight**: 51 of 59 errors in the worst 5-member replicate and 334 in the worst 30-member one were killed in 4 resets (37 and 152 requests). The requests killed per reset grow with how many are in flight (about 5 at 5-25 members, 17.5 pooled at 30, 38 in the worst replicate).
3. **The frame-time medians do not move with the member count (1.2-1.8 s raw for Home and Queue), the tail does** (worst p90 3-8 s for Home and Queue, 4-19 s for Project): the slowness members would feel is in the tail, as in the earlier ramps.
4. **For the load management** (`load-management-draft.md`): a bound N set from the member count or the error rate cannot be read from these data. The resets happen at every load from 5 members and are not caused by the load rising; what a higher load changes is how many requests a reset kills. So a queue and an admission bound limit the damage of a reset, not its occurrence; removing the reset (the store object's memory) is the lever, and its holder is not yet known (`s1-b-ramp-memory.md`, the allocation profile and the cuts).
5. **Not shown:** whether the resets depend on what the alarm happens to be reading (the room gained no documents over the run: 855 at both ends, the ramp's uploads being captures only; text units 2,982,101 at 20:38 and 3,115,768 from 20:53, as earlier readings finished); the effect of the chain build against the piece build (only the two ramp runs of the piece build exist, and they differ as much among themselves); anything above 30 members or with a different mix.

# queue (T24)

**Status** · session_019oyErz8GFQGd7LLoJeJpcK · depth 2 · WORKING · handled B1

## J1 · QUESTION

Q1 (wording vs wiring, L11 with queue-producers). queue-producers R26 now reads `link-sweep.sweepConditions` (its L11 re-point, running in parallel as QUEUE-PRODUCERS #8). queue hands queue-producers its providers by name through `Queue.PRODUCER_DEPS` (`bio-plane/src/queue/index.mjs`:103), and queue's test world fakes `monitoring.sweepConditions` (`test/m/queue/world.mjs`:135), which `signals.test.mjs` (R1, R5, R11, R12, R14, R19, R30 over the sweep kinds) depends on.

My best reading, which I am building on: queue-producers will take the provider under the dep name `linkSweep` (its convention: `networkNotices`, `filingTemplates`, `corpusExport`). So queue adds `"linkSweep"` to `PRODUCER_DEPS` (as K921 added `filingTemplates`, `localFacts`; queue passes it and calls nothing), and the test world gains a `linkSweep: { sweepConditions }` fake beside monitoring's, with `signals.test.mjs` giving its conditions to both, so queue's tests are green before and after queue-producers' merge. Nothing changes in what queue provides.

Please confirm the dep name with QUEUE-PRODUCERS #8, or give the one it uses; I will match it. This does not block the rest of my job (N508 and the re-scan).

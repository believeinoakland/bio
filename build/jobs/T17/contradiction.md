# contradiction (T17)

**Status** · session_01PJZi1Tddeq3RdfGvVdcz9C · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

N394, my best reading, on which I am building now: the gate CAN be measured at my interface, over the recorded judgement (M-162's three blind runs are a fixed recording keyed by pair text, not a live model), so I propose a requirement rather than a release measurement. Only re-running a live model under the prompt (a new recording) is outside a job's reach, and that is already how R2 moves the digest.

Proposed, as a new **R57** under "The judgement's words" (or folded into R2's text, your ruling):

- **R57** (the over-strictness gate; CONTRADICTION-IDENTIFY-DESIGN §7, M-118, M-162). The judgement recorded under `JUDGEMENT_PROMPT_SHA256` passes the gate over the gate's corpus (26 labelled pairs over K1–K4, synthetic, each shape §7 requires at least once, at least 6 per key, each key with a negative and a conflict) built as a record:
  - every corpus pair is formed by its own key through R5–R11, nothing the corpus does not label is formed, and no key is cut at its bound;
  - R4's input carries every formed pair and no label or fixture id;
  - every formed pair is answered with an R1 label;
  - no `precision` or `unrelated` pair is labelled `world` or `record`: a false-conflict rate of 0 (the threshold M-118 set), per key and over all;
  - recall is stated beside the rate, never as the gate, and each recorded run's beats the lexical baseline's.
  The gate fails by name an empty record (no rate over nothing; each key's R11 level carried instead), an always-`world` judgement, and a silent one, and passes a judgement that gives every pair its gold label. The recording answers only the prompt it was made under: a moved digest (R2) leaves pairs unanswered, and the gate fails. *(its K5 arm not yet met: K488)*

The test (`test/m/contradiction/gate.test.mjs`, new) builds the corpus with my fixture, forms the pairs through `pairs`, renders through `renderJudgementInput`, and judges from the recording; the corpus, gate, baseline and recording are copied into `test/m/contradiction/` (the old helpers stay for legacy-tests to delete). Rest of the old suite: section 6's propose arms go into propose tests under R13–R17 over the corpus; its two source-text censuses (one append site; nothing updates or deletes) are dropped (P7), R17's behaviour already tested at the interface.

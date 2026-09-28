# capture (T8)

**Status** · session_012gK9YaHTpAXY7PQYP1hnbG · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

N166 needs a requirement to test against: capture's Provides states no read contract for `source_reachability` yet, and requirements are BOB's to write. My best reading, which I am building to now (a test at the interface, no code change: the table and `recordSourceOutcome` already hold it), is a new id beside R57, worded the same way:

> **R59** The table `source_reachability` (its `address_norm`, `consecutive_failures` and `first_failure_since` columns) is a stated read contract: a later module may read it in its own SQL (monitoring counts the rows at or over R43's floor, and lists them oldest failing run first), and this module changes none of those columns' names or meaning without a change to this requirement. `address_norm` is the normalised document address R8 records an attempt against, one row per address; `consecutive_failures` the failures the source produced (`source_refused`, `fetch_failed`) since its last `success`, never moved by a `governed` refusal; `first_failure_since` the whole-second UTC instant of the first failure of the current run, null when there is none. Every write to `source_reachability` stays this module's. *(N166, K206)*

Please add it (or your wording) to `build/requirements/capture.md`; I will name the id in the test. The alternative P4 offered, a service ("failing addresses at or over the floor") instead of a table contract, is not what the plan's entry says, so I am not building it unless you rule so.

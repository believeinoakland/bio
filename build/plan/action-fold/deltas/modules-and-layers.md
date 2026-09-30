# `modules.json` and `layers.md` — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, from `build/plan/action-design/deltas.md` §1 and the module deltas beside this file, against `build/modules.json` and `build/layers.md` on `tranche/T17`. Adding the module and every edge is BOB's (K590, P17); the layer-9 contract's wording follows Bob's rulings (K590 (1), (5), (10), D1), already approved in the design ("correct and complete enough", K608 (3)).

## `modules.json`

**The new module**, inserted directly after `escalation` (index 58 today) and before `monitoring`:

```json
{"id": "action-plans", "layer": 9, "paths": ["bio-plane/src/action-plans/"], "tests": ["bio-plane/test/m/action-plans/"], "uses": ["legacy-checks", "jurisdictions", "record-core", "membership", "promotion", "inquiry", "strength", "standards", "conformance", "actions", "escalation", "filings"]}
```

Every use is earlier in the order (P4): `legacy-checks` 0, `jurisdictions` 1, `record-core` 19, `membership` 20, `promotion` 21, `inquiry` 37, `strength` 40, `standards` 53, `conformance` 54, `actions` 56, `filings` 57, `escalation` 58. The design's Size line also names `consequences` (read only by the assistant's suggestions, a Suggestion, not a requirement); it is not a use until a requirement reads it.

**New `uses` edges on existing modules:**

| module (index) | gains | why | P4 |
| --- | --- | --- | --- |
| `queue-producers` (64) | `actions`, `escalation`, `action-plans` | R15 `overdueClocks`, R17 `escalationsDue`, R16 `checkpointsDue` | 56, 58, 59 < 64 |
| `control-plane` (67) | `action-plans` | R26 routes, R22 check table | 59 < 67 |
| `jurisdictions` (1) | `record-grammar` | R39's `BASIS_GRADES` (only if T18 forms `record-grammar` first in the order, K585 (4); otherwise R39 waits) | record-grammar first |

No edge for `queue` (it catalogues kinds and doors only), `scheduler` (already uses `monitoring`), `skills` (the acts come over the wire, R8), `filings`, `escalation`, `monitoring` or `actions` (their new reads are of modules already in their uses). The design's "`queue` gains `action-plans`" is `queue-producers`' after the queue split (N363, K531).

**`status`** gains, at its end: `AMENDED by BOB #74 (or its successor) at T17's close, 2026-09-30: K608, the Action layer's fold: action-plans (layer 9, after escalation); queue-producers uses actions, escalation and action-plans; control-plane uses action-plans; jurisdictions uses record-grammar (with its formation, K585).`

## `layers.md`

**The layer table's row 9**, current:

> | 9 | Action | Functional Architecture "Layer 3: Action"; Design Requirements §7–§8 | An action rests on a published finding and a standard held in the record; the group decides every act, the AI prepares and never files; compliance is recorded as carefully as noncompliance; every deadline names its basis. | standards, conformance, consequences, actions, filings, escalation |

becomes:

> | 9 | Action | 16 (`BIO_Action_v0_1.md`); Functional Architecture "Layer 3: Action"; Design Requirements §7–§8 | An action rests on the record, and one asserting a breach rests on a published finding and a standard held in the record; the group plans and decides every act, the AI proposes and prepares and never files or sends; compliance is recorded as carefully as noncompliance; every deadline names its basis. | standards, conformance, consequences, actions, filings, escalation, action-plans |

**§"Layer 9, Action", the Contract paragraph**, current:

> **Contract.** An action rests on a published finding and on a standard held in the record. The group decides every act; the AI prepares, never files. Compliance is documented as carefully as noncompliance. Every deadline names the statute, order or commitment it comes from.

becomes:

> **Contract.** An action rests on the record, and one asserting a breach rests on a published finding and on a standard held in the record. The group plans and decides every act; the AI proposes and prepares, and never files or sends. Compliance is documented as carefully as noncompliance. Every deadline names the statute, order or commitment it comes from. *(Amended by Bob 2026-09-29/30, K590 (1), (5), (10), D1; K608.)*

**§"Layer 9, Action", the module table** gains a last row:

> | action-plans | A project's working material for deciding what to do about one or more matters, suspected (an inquiry still open) or determined (a determination's outcomes): options the assistant suggests or a member adds, each bound to the matters it serves; the member's choice; up to three scenarios over time with checkpoints a member judges; and the link from each started option to the action it created. No catalogue of options, no budgets, never published; a member closes it with a reason. | `BIO_Action_v0_1.md` §3–§4; Bob, 2026-09-29 and 2026-09-30 (K590) |

**The "Uses, all earlier in the order" sentence** gains at its end, before "`monitoring` gains actions and escalation.":

> `action-plans` uses conformance, actions, escalation, filings, standards, inquiry, strength, jurisdictions.

**The section's sources** (the paragraph beginning "Bob: once a group publishes a finding"): after "State Rules v1.5 §4.4 (the Action object and its clocks)." insert:

> Since 2026-09-30 the layer's level-1 home is `BIO_Action_v0_1.md` (System Design §3 row 16, canon whole, K608), which gathers these and Case Making's action plan (K590).

**A new paragraph after "What it changed."**:

> **The Action layer's fold (T17's close, 2026-09-30; K590, K597, K600, K608).** Bob approved the Action design (`BIO_Action_v0_1.md`) as canon and ruled the layer a priority (K608 (2)). The contract above was re-worded; `action-plans` joined the layer, last; `actions`, `filings`, `escalation`, `monitoring`, `scheduler`, `queue`, `queue-producers`, `skills` and `jurisdictions` gained requirements (`build/plan/action-fold/deltas/`).

**The Status line** gains: `AMENDED at T17's close, 2026-09-30 (K608): layer 9's contract and row, action-plans.`

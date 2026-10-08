# record-grammar (T40)

**Status** · session_01DoeyeHeM15vrBLPc7ti25M · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Found in other modules (against their own requirements; not changed, not verified reachable): eight modules read `STATES` through `vocabFor` with a stored `object_type` and then index the answer (`spec.legal`, `spec.edges[...]`): affordances `affordances.mjs`:699, actions `index.mjs`:1107, queue `index.mjs`:439 and :1604, inquiry `index.mjs`:1617, machinery-producers `index.mjs`:653, basis-versions `index.mjs`:1033, notice-producers `index.mjs`:244, queue-producers `index.mjs`:1267, promotion `index.mjs`:776 and :1080. `vocabFor` answers an inherited key as R34 states, so a row whose `object_type` is `toString`, `constructor` or `__proto__` gives a function or `Object.prototype` there, where `checkBundle` threw before this job. Whether such a type can reach those reads past promotion's gate (which now answers C-2.5 for it) is each module's to judge; the fix would be the own-key lookup `checkBundle` now uses. Not a change to R34 (its tests pin the inherited answer).

Generated artifacts staled: the plane bundle and `release/bio-plane.bundled.mjs` (they carry `bundle.mjs`), accepted red (7), regenerated at layer close.

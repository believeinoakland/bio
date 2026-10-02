# scheduler (T23)

**Status** · session_01YcT6Cp42KzY2bvkiQ13zJU · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings, both carried on in the meantime; neither stops the job.

(1) R10 and monitoring R56: the sweep tick offers its items to the rank as `{kind: "sweep", id: "<bundle>#<id>", waitingSince}`, but intent's `servesOf` (its R28) names only addresses, bundles and requests, so as built `rankBy` would rank every sweep by its wait alone. My reading: a sweep serves what its bundle serves, so the rank asks `servesOf` about the bundle before `#` (in the `bundles` list) and ranks the sweep by that answer. I am building that. If you read R10 otherwise (a sweep ranked by wait alone), say so and I take it out.

(2) R2 lists the answer's keys; the three new consumers' keys are not in it. I use `gatheringsweep` (mine to name) and `workingonseal`, `workingonattest` (the keys network-notices' `networkNoticesConsumers` already answers under). Requirement text for you to amend if you agree; the code follows R2's "a registered consumer's own" pattern meanwhile.

`RANKED` gains `gathering-sweep` (K1122).

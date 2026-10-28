# connections (T53)

**Status** · session_018BhcegFwJCkdsgDuz48E3E · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-28)

# connections · T53 · R1 · report

Entries applied:
- T53-587 (N1200, K5747): `Connections.projectReach({project})` (the records the project's document cites, rel `cites`, not severed, each once, bounded by `Membership.PROJECT_REACH_LIMIT`, never throws), registered by the factory at start through `membership.registerProjectReach("connections", …)`. Test: `project-reach.test.mjs` (reach is the cited, unsevered, once; second registration refused `LISTENER_DECLARED`; no/unheld project reaches nothing; writes nothing).
- T53-148 (K5565): the four regex sites in three files converted (edges: the log heading is now checked structurally; r73-plain-words: reads the two sentences through `localize`; read: the cited ref is read from the answer's `ref`, and the two keys now match the source's). The baseline is BOB's (ownership refuses my edit): BOB removes edges.test.mjs, r73-plain-words.test.mjs and read.test.mjs from `build/tests-english-baseline.json` at the merge; words check 0 failures; the module's suite 157/157.

Not done:
- T53-147 (`named_in`, R74-R76): conditional on measure M-F1, and I find no M-F1 result in the repo. Asked BOB (message sent); built nothing. R74-R76 stay unmet.

Found in other modules:
- store-assembly: `assemble.mjs:393` and `wiring.mjs` `projectReachReaders().connections` (R58) now duplicate the reader connections registers itself; membership refuses the plane's second registration (`LISTENER_DECLARED`, ignored). store-assembly should drop its connections reader and its t50 test's use of it.
- connections requirements: T53-587 has no requirement id. It needs a new line (next free is R77) saying connections registers its project-reach reader; my test and source cite T53-587 until BOB adds it. Requirements file is outside my paths.
- Pre-existing red: `store-assembly/t50.test.mjs` R56 (agent-worker streaming) fails without my change too.

**Met** · none

Tests: 157/157. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegFwJCkdsgDuz48E3E): test runs 1, module lines 3112

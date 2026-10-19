# queue (T51)

**Status** · session_01DggByiBck91qKoo2zJ1P66 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Best reading, no waiting on it: K4065's fix (the test world runs project-roster's `migrate()`) needs `bio-plane/test/m/queue/world.mjs` to import `project-roster`, and `checks/architecture.mjs` refuses it: "world.mjs (queue): imports bio-plane/src/project-roster/index.mjs of project-roster, which queue does not declare in uses". `build/modules.json` is yours: please add `project-roster` to queue's `uses` (it is a test-only use; queue-producers, which queue composes, already uses it for R41/R42). With it the 29 inherited reds are green (queue suite 180 pass, 0 fail here). If you would rather not widen `uses`, tell me another door to the roster's `migrate()` and I will use it. Everything else is applied; I am finishing the record and will COMPLETE once the architecture check can pass.

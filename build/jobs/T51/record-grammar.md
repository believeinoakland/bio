# record-grammar (T51)

**Status** · session_01MURMfVW6xakigf2Z7K2GRE · depth 2 · WORKING · handled B0

## J1 · COMPLETE

T51-1 · record-grammar: done.

**Entries applied.** T51-1 (stale comments):
- `bio-plane/src/record-grammar/labels.mjs`:290–292: the reference to `civicos-ui/app.html` (deleted in T51-126) is now "a surface that renders `Asserted by ${…}` verbatim is one field over from it"; the word TODAY is gone.
- `bio-plane/src/record-grammar/titles.mjs`:12–14: "the setup page embeds this function's source verbatim" (the setup page was deleted at T47-74) is now "its source text, evaluated alone, gives the same answers, so a client that embeds it cannot drift from the store (R30)".
- A sweep of the module's code and tests for `civicos-ui`, "setup page", `app.html` and TODAY found nothing else. No behaviour change.

**Deferred.** Nothing.

**Found in other modules.** Coverage, not this module's: `checks/coverage.mjs` names three live ids with no test: agent-harness R17, agent-runner R36, R37, R38, R40, journey-check R19. Those belong to their own jobs; I changed none of them. The Requirements file of record-grammar still says "instance-setup embeds it verbatim" in R30. It is a requirement, so I left it for BOB: the sentence describes a present embedder that the code no longer has (no caller embeds it today).

**Tests and checks.**
- `node --test bio-plane/test/m/record-grammar/`: 101 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 3 failures, all in other modules (above); channels 0 failures.
- `node checks/ownership.mjs /home/user/bio record-grammar tranche/T51 job/T51/record-grammar`: 1 file changed by record-grammar, 0 failures.

Size (session_01MURMfVW6xakigf2Z7K2GRE): test runs 1, module lines 2618

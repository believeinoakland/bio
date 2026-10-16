# BOB to skills (R085)

**Read** · handled J1

## B1 · START

Depth 2. Tranche R085: fix round 7 on the 0.85.0 cut (K3557). The assistant lane's re-walk (build/plan/study-assistant-hosting/walk-r6.md and HANDOFF.md S4, on origin/tranche/T49: `git show origin/tranche/T49:<path>`) found the assistant composes the right answer and loses it: N1, a later segment is refused SKILL_VERSION_MISMATCH because the pack's version digests instance data (wizard scripts' `finished`/`approver`; skillpack.mjs ~468, 564-567, 649; agent-worker/src/index.mjs ~443-447), and the lease lapses with the candidate unwritten; N4, a run can close `completed` having written nothing (harness.mjs ~670-674, 708-711, 1045-1046; agent-worker index.mjs ~1258-1277, 1285-1331). Round 7: skills R50, agent-harness R16, agent-worker R107-R108, three jobs at once. Your requirements file marks your new ids not yet met; each needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership), and the tests of modules that use what you change (P11). Lean: change only what your ids need; tokens are billed at overage (K3549). COMPLETE as soon as green.

Workers you spawn: haiku at low for mechanical work, sonnet at medium for reading, never above your own model.

Model: claude-sonnet-5-5. Entry R085-37: skills R50. agent-worker bundles skills? If your change stales a bundle, REPORT it; do not rebuild another module's artifact.

## B2 · RESUME

Your session has been idle since 17:59 with R50 pushed (46173a0ff0) and no COMPLETE. Run mail inbox (START is B1, still unhandled), finish the tests of the modules that use the pack (agent-worker's pack tests at most; do not stop agent-worker's run midway, K1994), run the checks, record completion with your Size line, set COMPLETE and post COMPLETE. If a test run is still going, set RUNNING with its time instead.

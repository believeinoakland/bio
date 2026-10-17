# agent-runner (T50)

**Status** · session_015C9SKzHdvKkAX6rzVop4aT · depth 2 · WORKING · handled B1

## J1 · BLOCKED

BLOCKED · cause: needs Bob · R38 step 0 (how the credential reaches the copy and is held) fails before any request can be made.

**Step.** R38 step 0. **Request.** None could be sent: no code path exists by which this module's code, on biosmoke8, obtains a credential that can create a Claude Code cloud session. **Answer.** The documents' own words, read whole at START:
- `build/terms/anthropic.md` AT-22 (the token R27 mints, the only sign-in a copy holds): "It can only make model requests, so it can't establish Remote Control sessions or fetch claude.ai connectors." So the sign-in biosmoke8 holds cannot do step 1.
- `fold-T50-remote.md` Settled 1 (SRS R7-R10): the only documented session creation is the CLI (`claude --cloud`, `claude -p --cloud`), which needs a claude.ai login with scope `user:sessions:claude_code` made by the binary's own `claude auth login` in a process. That process is the container R35 disables (K3611). The sessions service the study lane used (`/v1/code/sessions`, K3537) is undocumented for third parties; no token API, SDK or third-party scope exists.
- The one path left for this module's own code would be to run Claude Code's OAuth login itself (Claude Code's client, outside the binary) to mint a sessions-scoped login, then call the undocumented service. I have not built or tried it: it is not "Claude Code run as published" (AT-14, R22), AT-21 limits OAuth to "ordinary use of Claude Code and other native Anthropic applications", and plan rule 9 forbids running a remote cell from a session's own tools. Whether to go there is Bob's (terms, P17), not a job's.

**Also, for BOB (structure, not Bob's):** R38 says the steps "run through agent-worker R111's `check`", but R111 is CONDITIONAL on R38 (note 5: built only on your CHANGE that the proof passed), so as written the proof has no caller until it has passed. And the proof needs this module's code deployed to biosmoke8 (a deploy no START names).

**Options for Bob (from fold-T50-remote Unknown 1, 3):** (a) routine fire, the documented fallback: a routine and token each member makes by hand on the web, start only, the answer by write-back at the door, text at most 65,536 characters, 30 fires an hour (DRR §2, §7); (b) keep a container for the login only (`claude auth login`, 30-day, renewed by the member), which reverses part of K3611; (c) the member's API key only, no subscription path; (d) wait for a documented sessions API. My reading: (a) is the only one that is documented and keeps R35; it needs Bob's decision on per-member hand setup.

**What I do now (note 2):** R35 (410 `LOCAL_RUNNER_DISABLED`, the class's fetch tests marked suspended) and R39 (the copy's own log, built as the step recorder the proof and R36 would use, tested on a stub interface), then COMPLETE with R36, R37, R38, R40 recorded not met. Nothing past step 0 is built.

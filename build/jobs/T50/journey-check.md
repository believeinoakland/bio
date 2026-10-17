# journey-check (T50)

**Status** · session_014iUBe8NbAGbHPhNo4NvYuv · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Found in other modules while walking the local arm at tranche/T50 d0acb04c19 (merged into my branch). None is mine to change; R17's scan and R16/R18's walk now name them, so the walk reports them until each lands:

1. **"group" said for a team in served pages (R17's scan).** The installer's pages (`/` and `/callback`: "Create your Civicsmith group", "Your group's Civicsmith", "Neighbourhood and issue groups") are `installer`'s; `/app` (home: "Use another group's case", "Your group's wizard"), `/app/security` ("the group's own account", "chosen by the group") and `/app/wizards` are the screens' (home, security: `screens-settings`/`screens-daily`; wizards: `screens-wizards`). Words rows are clean: no row of `words.json` or of `setup-words` says "group" outside `GROUP_SENSE`. Some of the drawn text above may be a sense `GROUP_SENSE` keeps ("groups that check whether government keeps its promises"); the owner decides, and a row added to `GROUP_SENSE` is allowed here as soon as `build_words.mjs` says so.
2. **`screens-inquiry` R50 (the member's own reading) is not on the tranche yet.** The question screen does not draw `question.empty.conclude.own` before a citation and offers no way to conclude after one without an accepted reading. R16's two assertions fail by name at those steps; the rest of the unassisted path (search, capture by address, held and vouched, Find-in, cite) walks and holds.
3. **The shell still draws `shell.signout`, not `shell.menu.signout`** (`interface-shell`; its T50 job). R16's sign-out step asserts the new key.
4. **The assistant cannot be walked locally.** `agent-worker` reaches `REMOTE` only (R109, no `RUNNER` binding), so R11's stub, bound as `RUNNER`, is never reached; the connect screen does not draw `subscriptionsignin` (steps 4 and the member's connection fail by name), so steps 9 to 11 are not reached. R19 (the stub bound as `REMOTE`) waits on the remote proof, as you said. CHECKS: not bound; `remoteReady` needs `REMOTE` and the member's check record, and with no `REMOTE` the member's check is never asked. Binding `CHECKS` alone changes nothing the walk sees (decided by the run above, K3747).
5. **`queue` / catalogue:** `GET /api/?op=queue` answered `ok: false` NO_SUCH_KIND ("'project-invitation' is not a kind this record's catalogue names", C-31.2) in the member's connect step: the queue producers name a kind the catalogue does not hold (`queue-producers` / `answer-envelope`).

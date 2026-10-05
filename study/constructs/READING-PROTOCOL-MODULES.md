# Addendum for module readers (M1–M5)

Follow `READING-PROTOCOL.md` whole; this adds what a module reader does beyond reading.

Your sources are module requirements, `src/req/<module>.txt` (copies of `/home/user/bio/build/requirements/<module>.md`). Read each whole by the protocol. Then, for each module, verify against the repository (read-only; /home/user/bio is on branch tranche/T32, equal to main plus build-state commits):
- **Place:** its layer, its `uses`, and every module that uses it (`build/modules.json`; compute dependents with a short node script).
- **Built:** every requirement marked `*(not yet met: T<n>)*`; and for the requirements bearing on the six constructs, whether the code implements them (find the function in the module's `paths`; read it enough to confirm, and note any limit the code has that the requirement doesn't state, e.g. UTC-only dates).
- **Reached:** which ops expose the module's services (search `build/requirements/op-declarations.md` and the module's own code for op names), and whether the member interface calls them (`grep -c` each op name in `civicos-ui/app.html`). A service no op exposes, or no screen calls, is built but unreachable by a member: say so.
- **AI:** whether any skill, run mode or the agent worker reads or writes it (search `skills`, `run-rules`, `ai-runs`, `agent-worker` requirements and code).
- **Deployment:** anything stated as switched off, undeployed or deferred (search `build/rulings.md` and `build/plan/archive/T32.md` "Left out" for the module's name).

Add to your note, before `## TIME`, a section `## Modules`, with per module:
```
### <module> (layer n; <lines of code in its paths>)
- Purpose: …
- Uses: … · Used by: …
- Relevant provides: R ids with one-line gists, by construct
- Built: verified … / not yet met: … / code limits not in the requirements: …
- Reached: ops … ; UI calls … (counts)
- AI: …
- Deployment: …
```
Then fill the construct sections from these modules as for any document (a module's R line is DESIGN or BUILT; a not-yet-met mark or a stated limit is GAP).

# screens-inquiry — requirements

**Status** · New in T46 (T46-58; K657, K1043): a module built fresh, layer 11 after `screens-daily`, last of the six interface modules (N897 (1), (2), Bob's K2816; N919, Bob's K2892: a member's own sign-in runs check and plan for that member only; DEC-82, DEC-139, DEC-160, DEC-190). Drafted in `build/plan/draft-T46-interface.md` §2.6, worded here by BOB (P5). No ids move. Not yet met (T46).

**Size (P6).** Estimated 2,400–3,000 lines with comments, its own keyed sentences included, measured at its START (M-T46-1, K617).

## Public

### Purpose

The investigation's working screens: a project's home, one question with what supports and cuts against it, one captured document with its passages, and the assistant's panel beside them. Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`** (the screen contract, `interface-shell` R21; words, its R5)

**project** (Projects › <project>; the registry's 6 acts)
- **R1** Reads `projectdirectory` (the project), `projectstage`, `projectparticipants`, `strengthbarof`, the project's questions (`list` of its inquiries) each with `inquirystrength`, and `projectaccountstate` (what pays for the assistant here, read-only; the screen for a project's AI account is T47's). Acts: `promote` "Open a question" (a question in this project); `findin` (opening `find-in` with the project as scope); `strengthbarset` (high friction, `op-grades` R4's dialog); `projectinvite`; `projectjoin` (for a member who has not joined); `planopen` (the plan screen is T47's, so the screen says the plan was opened and lists it). *(not yet met: T46)*

**question** (Projects › <project> › Question; the registry's 11 acts)
- **R2** Reads the inquiry (`image`), `inquirystrength` against `strengthbarof` (two grades and the phrase, never one score; its weakest part and what would raise it; `mark.strength.means`), `basisversions`, `hypotheses` (hunches, `mark.hunch`), and `questionwaits` (what it waits on, with who set a document aside and their reason). Sections: Supports, Cuts against, Hunches, Concluding. Acts: `cite` (a passage, chosen from a document's passages or from `find-in`), `sever`, `reinstate`, `narrow`, `conclude` and `withdrawconclusion` (terminal: `interface-shell` R11's dialog; never with writing help), `hypothesishold`, `planopen`, `checkrequest` (by expertise), `heldrestore` (with a reason), and `search` "Find another source". *(not yet met: T46)*

**document** (Projects › <project> › Document; the registry's 10 acts)
- **R3** Reads the capture (`image`), its reading's passages (`reading`), `gradenote` ("Why B?"), `backlinks` (what cites it), `versionchain` (its versions; a newer version marked changed), and the pages its reading could not make out (`document.unread.pages`). Acts: `findin`, `cite` (per passage), `gradenote`, `release` (by its weight), `attest` (signed: `op-grades` R1 grades it attested), `retire` (terminal), `monitor`, `identityclaim` (a person the record follows, from a name in it), `transcribe` (the member types a page's words), and `pagetranscribe` only while the assistant is reachable (`interface-shell` R20; DEC-190). Opening the original goes through `open-file` (`screens-intake`). *(not yet met: T46)*

**the assistant dock** (registry screen `assistant`, frame `dock`; the registry's 3 acts)
- **R4** The panel says once what it is and what it never does (it finds, reads and checks; it never concludes, signs or sends), and whose account serves this member (`ai.account.*`). Acts on the screen's subject: `airunopen` "Work on this" (a run with the screen's subject as its context, in the mode the owner's shape names), `suggest`, and `airunclose` "Stop the run"; the run's progress and productions are drawn from `airun` and `airunlog`, every production marked `mark.origin.machine`, never drawn as evidence. Refusals by their words: `AI_RUN_MODE_NOT_DEPLOYED`, `AI_KEPT_AWAY`, `AI_NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED` (`ai.refused.*`). *(not yet met: T46)*
- **R6** (N919; Bob's K2892; `ai-runs` R18; K2947, K2952) On a member's own sign-in, "Work on this" starts the run's segment through `control-plane`'s member-run door (`op=airundispatch`, its R77), for that member only: the dock sends it at her act for the run she opened, and draws what the door answers, a run dispatched or running, or the withholding or refusal by its words (`MEMBER_PRINCIPAL_RUN`, `MEMBER_RUN_MODE_NOT_ADMITTED`, `AI_RUN_NOT_PRINCIPAL`, `AGENT_WORKER_UNBOUND`, the run not running). Only a `check` or `plan` run is so started (Bob's K2892); the dock offers it for no other mode. (T46; K2976) Since the door dispatches only a run opened on, and presenting, her own `ai` credential (K2947), the dock, at her first "Work on this" on her own sign-in, mints her a member-scoped credential (`op=aicredentialmint`, `credentials` R12–R14, `expiresInDays: 1`, R42's least), opens the run under it (`airunopen`), and sends each `airundispatch` presenting it in the `Authorization` header only; the value is held in the page's memory alone (never in storage, a URL, the record or any drawn text) and revoked (`op=aicredentialrevoke`, R15) when the run ends, is stopped, or the dock is closed. A page that no longer holds it (reloaded) cannot continue that run: the dock says so and offers a new run; the run stays in the record. Tests: through a stub plane, the mint, open and dispatch carry the credential only in the header and revoke it at the run's end; controls: no request address or body, and no drawn text, carries the value; a reloaded dock offers a new run. *(not yet met: T46)*
  - (K2999) The credential the dock mints names among its declared `writes` the ops it presents it to (`airunopen`, `airundispatch`), so admission admits it (control-plane R77). *(not yet met: T46)*
- **R7** (N897 (2); K2816 (2); `run-rules` R29, `ai-runs` R78) On a test instance, every AI output the dock draws (a run's productions, a suggestion) carries the test-instance label the plane marks it with (`untested`, `run-rules`' `untestedLabel`), drawn by its key `ai.label.untested`: until `words.json` holds it, this module's own row, meaning "Not yet tested: this part of the assistant has not yet passed Civicsmith's tests on real matters. Check what it says against the record." An output without `untested` carries no such label. *(not yet met: T46)*

**Common**
- **R5** `interface-shell` R8–R13 and R16 hold on every screen; every grade is drawn as one mark (the scale's hue and icon and the letter) explaining itself (`mark.scale.<s>.*`, `mark.grade.reading`). *(not yet met: T46)*

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21), the dock (its R20).
- `setup-words`: `WORD_ROWS` keys.
- Through the plane: `project-roster`, `project-stage`, `strength`, `promotion`, `membership` (project acts), `action-plans` (`planopen`), `inquiry`, `basis-versions`, `citation`, `contradiction`, `hypotheses`, `tasks` (`checkrequest`), `capture`, `ratification`, `attestation`, `monitoring`, `people`, `content`, `extraction` (`pagetranscribe`), `reading-pipeline`, `ai-runs` (R18, R78), `run-productions`, `credentials` (`projectaccountstate`), `control-plane` (R77, the member-run door).
- Tests only: `op-declarations` (`OPS`).

### Invariants

None numbered here: `interface-shell` R23 and R24 (no place named; no log of who opened what) bind this module's screens as every screen's.

### Satisfies

- Registry screens `project`, `question`, `document`, `assistant` (DEC-139 (1), (7)); N897 (1), (2) (R7).
- DEC-82, DEC-160 (R2, R5), DEC-190 (R3); canon §P (the assistant: R4), §U (undetermined); N919, K2892 (R6).

### Suggestions

- The mockups' assistant text ("$0.42 of your $2.00 today") comes from `aiusage` for the serving account; omit it when the read does not answer.
- `act.pagetranscribe.does` and `ai.refused.limit.unjudged` are drawn from this module's own rows (`interface-shell` R5: each names Civicsmith bare). `ai.label.untested` is owed by the design stream (BOB's channel act).

# screens-inquiry — requirements

**Status** · New in T46 (T46-58; K657, K1043): a module built fresh, layer 11 after `screens-daily`, last of the six interface modules (N897 (1), (2), Bob's K2816; N919, Bob's K2892: a member's own sign-in runs check and plan for that member only; DEC-82, DEC-139, DEC-160, DEC-190). Drafted in `build/plan/draft-T46-interface.md` §2.6, worded here by BOB (P5). No ids move. Not yet met (T46). Last changed T47 (T47-61: R8 new, `cs.choice` over record data and the dock's `cs.later`, N986; R9 new, the project's questions from `projectquestions`, N974; R10 new, the project's own bar drawn and set by `projectbarset`, N976; R11 new, "Open a question" drawn into the project by `drawquestion`, N975; R12 new, `sever` and `reinstate` on a question's own legs, N977; R13 new, amending R6, the dock holds no credential and a reloaded dock continues the run, N955; R14 new, `projectai`, N721); marked not yet met (T47). Last changed T48 (T48-73: R17 new, amending R4, the assistant panel's thirty days and meter, N1026, K3198; R18 new, amending R1 and R2, the reference links DEC-228 (4) names, K3190, K3195; R19 new, `words.mjs`' DEC-221 texts re-taken, K3192 D1); marked not yet met (T48). R14's citation of `credentials` R54 re-pointed to `ai-accounts` R10 (N996, K3038, unmarked). Last changed T48 (K3254, the L11 design fold of WALK-084 #2, K3250: R20 new, the common line; R21 new, the subject guard; R22 new, the original by its SHA-256); marked not yet met (T48). Last changed T49 (T49-25: R23–R43 new; R6's K3003 clause re-worded per R33; K3334); marked not yet met (T49).

**Size (P6).** Estimated 2,400–3,000 lines with comments, its own keyed sentences included, measured at its START (M-T46-1, K617).

## Public

### Purpose

The investigation's working screens: a project's home, one question with what supports and cuts against it, one captured document with its passages, and the assistant's panel beside them; since T47, the project's own AI account (`projectai`). Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`** (the screen contract, `interface-shell` R21; each sentence read by key)

**project** (Projects › <project>; the registry's 6 acts)
- **R1** Reads `projectdirectory` (the project), `projectstage`, `projectparticipants`, `strengthbarof`, the project's questions (`list` of its inquiries) each with `inquirystrength`, and `projectaccountstate` (what pays for the assistant here, read-only; the screen for a project's AI account is T47's). Acts: `promote` "Open a question" (a question in this project); `findin` (opening `find-in` with the project as scope); `strengthbarset` (high friction, `op-grades` R4's dialog); `projectinvite`; `projectjoin` (for a member who has not joined); `planopen` (the plan screen is T47's, so the screen says the plan was opened and lists it).

**question** (Projects › <project> › Question; the registry's 11 acts)
- **R2** Reads the inquiry (`image`), `inquirystrength` against `strengthbarof` (two grades and the phrase, never one score; its weakest part and what would raise it; `mark.strength.means`), `basisversions`, `hypotheses` (hunches, `mark.hunch`), and `questionwaits` (what it waits on, with who set a document aside and their reason). Sections: Supports, Cuts against, Hunches, Concluding. Acts: `cite` (a passage, chosen from a document's passages or from `find-in`), `sever`, `reinstate`, `narrow`, `conclude` and `withdrawconclusion` (terminal: `interface-shell` R11's dialog; never with writing help), `hypothesishold`, `planopen`, `checkrequest` (by expertise), `heldrestore` (with a reason), and `search` "Find another source".
  - (K3003; SCREENS-INQUIRY #1 J4) In T46: the project's questions (R1) are its document's `cites` references to `INQ-` ids not severed (`basis-versions` R41's rule), read from the project's `image`, their titles from `list` `type=inquiry`; "Open a question" writes the inquiry with `project:` and opens it, and it shows among the project's questions once the project cites it (N975); `projectdirectory` listing the project means she has not joined (`projectjoin` drawn); the untested label is taken from the run (`airun`'s `session.untested`, `airunopen`'s answer) for every output of that run. Not drawn in T46: `strengthbarset` on the project (it sets the group's bar, so its label "Set the project's bar" would be untrue; a project's own bar is N976), and `sever` and `reinstate` on the question (they act only on a project's `cites` edges, refusing an inquiry `NOT_A_PROJECT`; N977).

**document** (Projects › <project> › Document; the registry's 10 acts)
- **R3** Reads the capture (`image`), its reading's passages (`reading`), `gradenote` ("Why B?"), `backlinks` (what cites it), `versionchain` (its versions; a newer version marked changed), and the pages its reading could not make out (`document.unread.pages`). Acts: `findin`, `cite` (per passage), `gradenote`, `release` (by its weight), `attest` (signed: `op-grades` R1 grades it attested), `retire` (terminal), `monitor`, `identityclaim` (a person the record follows, from a name in it), `transcribe` (the member types a page's words), and `pagetranscribe` only while the assistant is reachable (`interface-shell` R20; DEC-190). Opening the original goes through `open-file` (`screens-intake`).

**the assistant dock** (registry screen `assistant`, frame `dock`; the registry's 3 acts)
- **R4** The panel says once what it is and what it never does (it finds, reads and checks; it never concludes, signs or sends), and whose account serves this member (`ai.account.*`). Acts on the screen's subject: `airunopen` "Work on this" (a run with the screen's subject as its context, in the mode the owner's shape names), `suggest`, and `airunclose` "Stop the run"; the run's progress and productions are drawn from `airun` and `airunlog`, every production marked `mark.origin.machine`, never drawn as evidence. Refusals by their words: `AI_RUN_MODE_NOT_DEPLOYED`, `AI_KEPT_AWAY`, `AI_NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED` (`ai.refused.*`).
- **R6** (N919; Bob's K2892; `ai-runs` R18; K2947, K2952) On a member's own sign-in, "Work on this" starts the run's segment through `control-plane`'s member-run door (`op=airundispatch`, its R77), for that member only: the dock sends it at her act for the run she opened, and draws what the door answers, a run dispatched or running, or the withholding or refusal by its words (`MEMBER_PRINCIPAL_RUN`, `MEMBER_RUN_MODE_NOT_ADMITTED`, `AI_RUN_NOT_PRINCIPAL`, `AGENT_WORKER_UNBOUND`, the run not running). Only a `check` or `plan` run is so started (Bob's K2892); the dock offers it for no other mode. (T46; K2976) Since the door dispatches only a run opened on, and presenting, her own `ai` credential (K2947), the dock, at her first "Work on this" on her own sign-in, mints her a member-scoped credential (`op=aicredentialmint`, `credentials` R12–R14, `expiresInDays: 1`, R42's least), opens the run under it (`airunopen`), and sends each `airundispatch` presenting it in the `Authorization` header only; the value is held in the page's memory alone (never in storage, a URL, the record or any drawn text) and revoked (`op=aicredentialrevoke`, R15) when the run ends, is stopped, or the dock is closed. A page that no longer holds it (reloaded) cannot continue that run: the dock says so and offers a new run; the run stays in the record. Tests: through a stub plane, the mint, open and dispatch carry the credential only in the header and revoke it at the run's end; controls: no request address or body, and no drawn text, carries the value; a reloaded dock offers a new run.
  - (K2999) The credential the dock mints names among its declared `writes` the ops it presents it to (`airunopen`, `airundispatch`), so admission admits it (control-plane R77).
  - (K3003; SCREENS-INQUIRY #1 J3) What the dock's `airunopen` sends: `run` a fresh id the page draws; `mode` `check` (the deployed mode; `plan` only with a plan named, which no T46 screen names); the context `{contextType: "inquiry", contextId}` on the question and the assistant, `{contextType: "project", contextId}` on the project, and on a document the project it is filed in when the screen knows it, else "Work on this" is not drawn there; `principalClaude` `member:<whoami.member>`; `skillVersion` the pack and edition `op=agentpack` answers, read once (none answered: "Work on this" is not drawn and the dock says the assistant is not ready); `bounds` `wallclock` 1,800,000 ms and the allowances the run's mode needs, as the plane states them for that mode (R33; the former `fetches` 0, `subsessions` 0 is retired). The minted credential: `principalKind: "member"`, `writes` `airunopen`, `airundispatch`, `airunclose`, `suggest`, `expiresInDays: 1`, its `tokenId` fresh. The dock never sends `at`.
- **R7** (N897 (2); K2816 (2); `run-rules` R29, `ai-runs` R78) On a test instance, every AI output the dock draws (a run's productions, a suggestion) carries the test-instance label the plane marks it with (`untested`, `run-rules`' `untestedLabel`), drawn by its key `ai.label.untested`: until `words.json` holds it, this module's own row, meaning "Not yet tested: this part of the assistant has not yet passed Civicsmith's tests on real matters. Check what it says against the record." An output without `untested` carries no such label.

**Common**
- **R5** `interface-shell` R8–R13 and R16 hold on every screen; every grade is drawn as one mark (the scale's hue and icon and the letter) explaining itself (`mark.scale.<s>.*`, `mark.grade.reading`).

**T47: the project's own questions and bar, a question's own legs, a dock that holds no credential, and the project's AI account** (T47)
- **R8** (T47; N986; K3013; `interface-shell` R27) A choice among record data (a project, a question, a passage) is drawn by `cs.choice` with data options, never as word keys. The dock, while a run it started is running, re-reads `airun` by `cs.later` on the page clock (at most once every 10 seconds, stopping when the member leaves the screen), so a run that ended by itself is drawn ended without the member's next act.
- **R9** (T47; N974; amends R1, R2's K3003 clause; `basis-versions` R50) The project's questions are read through `projectquestions` (each `{inquiry, title}`, paged), in place of deriving them from the project's `image`; each is a reference opening `question`, with its `inquirystrength`.
- **R10** (T47; N976; amends R1; `strength` R40, R14) The project shows its own bar as `strengthbarof` answers it for the project (a declared axis by its letter, an undeclared one in words, no bar as absent, never as zero), and offers "Set the project's bar" as `projectbarset` (both axes, either, or neither to withdraw it) with the member's reason (its weight's reason field, `interface-shell` R11), to a joined member. `strengthbarset` (the group's bar) is not drawn on the project.
- **R11** (T47; N975; amends R1's K3003 clause; `citation` R14) "Open a question" writes the inquiry (`promote`, with `project:`) and then draws it into the project (`drawquestion` with the new inquiry), so it shows among the project's questions at once; a refusal of the second step is drawn beside the act and the question stays open on its own screen. The project also offers `drawquestion` for a question the member chooses (found by `search`), answered `alreadyCited` when the project already draws on it.
- **R12** (T47; N977; amends R2's K3003 clause; `citation` R15) `question` draws `sever` on each live leg (its reference `confirmed` or `proposed`) and `reinstate` on each severed one, each with the member's reason, the act naming the question as its citing object and the leg's target as the selection; a severed leg is drawn severed with its reason, and stays in its section.
- **R13** (T47; N955; amends R6; `ai-runs` R18, `credentials` R63, `control-plane` R77) The dock holds no credential: "Work on this" opens the run under the member's session (`airunopen`, with R6's fields and `principalClaude` `member:<whoami.member>`) and sends `airundispatch` with `run` alone under the session, the segment's credential minted in the plane (`credentials` R63); no `aicredentialmint` or `aicredentialrevoke` is sent and no credential is held, stored or drawn. A reloaded dock continues a running run of hers by the same act (`airundispatch` for that run). R6's T46 clause (the page-held one-day credential, K2976, K2999) is retired. Refusals of the dispatch (`ACCOUNT_MEMBER_NOT_ACTIVE`, `AI_RUN_CREDENTIAL_MALFORMED`, `AI_KEPT_AWAY`, `CREDENTIAL_RECORD_SILENT`, `AI_RUN_NOT_PRINCIPAL`, `MEMBER_RUN_MODE_NOT_ADMITTED`, `AGENT_WORKER_UNBOUND`) are drawn by their words (`interface-shell` R13). Control: no request the dock sends carries an `ai` credential in a header, body or address; after a reload the same run is dispatched.
- **R14** (T47; N721; DEC-188 (1), (7); amends R1) The project links "AI for this project" to **projectai** (Projects › <project> › AI for this project; the registry's 8 acts). Reads `projectaccountstate`, `projectkeynotice`, `projectaikeepawaystate`, and for the project's account `accountuses`, `ailimits`, `aiusage` and `accounthistory` with `owner: "project:<id>"`, drawn by the AI account panel `screens-settings` R9 holds (one render over an `owner`). Acts, each an owner's of the project: `projectkeyset` (the key in the request's body only, never drawn again), `projectsigninset` (the acting owner's own sign-in, offered only while the project has no other participant and her sign-in is connected, `ai-accounts` R10), `projectaccountswitch`, `projectaccountremove`, `projectkeynoticeseen` (the notice, `mark.outward.means`, before the first use), `accountusesset` and `ailimitset` with that `owner`, and `projectaikeepaway` (on only with a reason, saying first what it does). Refusals by their words (`ai.refused.notsole` among them).

#### T47's L11 fold (K3100)

- **R15** (DEC-200 (2)) On `document`, "Watch for changes" sends `monitorset` and "Check for a new version now" sends `monitor`.
- **R16** (DEC-200 (3), (4); amends R10, R11) On `project`, "Draw on a question from elsewhere" chooses among the questions the member may see (`cs.choice` over record data) and sends `drawquestion`; "Set this project's bar" is `projectbarset` by its registry label.

#### T48 (T48-73)

- **R17** (T48; N1026; DEC-215 (1); K3198; `ai-use` R14; `screens-settings` R26; amends R4) The assistant panel draws, for the account that serves the member, `screens-settings` R26's thirty days of bars and its meters, reading `aiuseovertime` with that account's `owner`, only where the member is one of that account's owners (her own account; a project's she owns; the group's key to an administrator). A read refused as `ai-use` R12 refuses a non-owner draws nothing and says nothing of the account's use; `unreadable: true`, or a read that fails, is drawn `state.failed`, never as zeros. Test: a member's own account draws thirty bars; controls: a member served by the group's key who does not administer draws none; `unreadable` drawn failed.
- **R18** (T48; DEC-228 (4); K3190; amends R1, R2) The links DEC-228 (4) names are drawn as the kit's reference links (`REF_SCREENS` kinds, each card the screen's keyed `screen.<id>.name` and `screen.<id>.purpose`), until a DEC places them: the project's page links its `plan`, `timeline`, `money`, `calculation`, `proceeding` and `standard` screens with the project as subject; the question's page links `case-editor`, `review-copy`, `ceremony` and `docket` with the question's case as subject, each drawn only where the screen's reads name such a subject (a project with no plan draws no plan link). Opening one sends nothing. Test: each link opens its screen; control: a project with no plan draws no `plan` link.
- **R19** (T48; K3192 D1; DEC-221) The texts `words.mjs` holds as copies of `words.json`'s words are re-taken at PR #34's merge (`4664e8efd4`), in DEC-221's American spelling, and its test pins them there; this module's own `SCREEN_WORDS` rows that a `WORD_ROWS` key now carries are dropped for that key. Control: no held text contains "labelled".

**The design walk folded** (T48; WALK-084 #2; K3250, K3254)
- **R20** (T48; K3250, K3254 (1), (5); walk C1, C4, C5; DEC-219 (3); K3052; amends R5) The common line, on every screen of the module: every element these screens draw uses a class that a served stylesheet defines (`interface-shell` R56).
  - Where the design draws the element, the screen uses the design's own class: an `mk-*` class as `shell.css` carries it, and a `cs-*` class the design spells `mk-*` (`cs-frontgrid`, `cs-signin`, `cs-fronthead`, `cs-flogo`, `cs-facts`, `cs-note`, `cs-sub`, `cs-small`, `cs-steps`, `cs-passage`, `cs-strengthbox`, `cs-gapblock`, `cs-pickc`, `cs-areas`, `cs-table`) is renamed to the design's spelling. A class the design does not draw is mapped to the kit's or a design class; only where none fits does `interface-shell` carry its style (its R56), with an ASK to UX-DESIGN to draw it (K3254 (1)).
  - Every labelled field is drawn with `cs.field`. No screen draws `cs-form` or a bare `<label>` with `.help`.
  - A section, tray, list, block or reading that holds nothing is not drawn. No count, reading or "finished by" is drawn at zero. A screen with nothing at all to show draws its one designed empty state, which names the first step. (DEC-219 (3) applied to every screen is BOB's reading of K3052, K3254 (5); the designed screen-level empty states are kept.)
  - A read that failed is still drawn as failed (`interface-shell` R10).

  Test: the module's real `SCREENS` compose under `interface-shell` R56, and each screen drawn over an empty fixture shows no empty section and no zero. Control: a failed read is drawn `state.failed`.
- **R21** (T48; K3250, K3254; walk C7, row 6; amends R1, R3, R14) `project`, `question`, `projectai` and `document` mark their subject read `subject: true`. Bare or not found, each draws only "Nothing is here" (`interface-shell` R61): no empty heading, refusal blocks or live forms. Test: each screen bare.
- **R22** (T48; K3250, K3254; walk row 7; amends R3) "Open the original" links `open-file` by the capture's SHA-256, never by the bundle id. A document with no capture digest draws no such link. Test: the link carries the digest. Control: no digest, no link.

#### T49 (T49-25)

**The question page (N1089, DEC-235)**
- **R23** (T49; N1089; DEC-235 (1), (3); DEC-32 clauses 2, 4, 5; `inquiry` R27, R28; amends R2) On `question`, each passage cited in Supports carries, beneath it, what the member answered for it. It reads `question.falls` ("If this turned out to be wrong: your answer falls"), or `question.holds`, with `{others}` filled by the passages named as holding it up. These answers are read from the inquiry's partition (its grounds). While the question cites at least one passage and its document carries no partition, the page draws **state b**:
  - `question.ask.first.title` and `question.ask.first.says`. No strength mark and no strength sentence are drawn in state b (clause 5).
  - "What each passage carries" (`question.ask.title`, explained by `question.ask.help`), with one `question.ask` choice per cited passage (`question.ask.no` / `question.ask.yes`, a radio group, none preselected).
  - For "yes", `question.ask.which`: the member ticks among the other cited passages.
  - Beneath, the read-back in R24's two shapes, then `question.rests.readback`.
  - "Save the answers" (`question.ask.save`) sends `inquiryground` (`inquiry.ground`) with a partition. In it, each passage answered "No, my answer falls" is a part of its own. The passages the member names as holding each other up are one part together. Each part's `statement` is left empty.

  Until the member saves, every passage counts as one the answer cannot do without (clause 4), and nothing on the page says otherwise. No drawn word is AND, OR, or a word `strength` R28 forbids. Refusals are drawn by their words (`interface-shell` R13). Test: a question with three cited passages and no partition draws state b with no strength mark. Saving sends the partition the answers give. Control: a question with a partition draws state a.
- **R24** (T49; N1089; DEC-235 (2); DEC-32 clauses 3, 5, 6; `inquiry` R28; `strength` R11, R12; amends R2) Under Supports, once the question has a partition, "What your answer rests on" (`question.rests.title`) reads the partition back:
  - `question.rests.any`, listing each part of one passage, and each part of several passages as `question.rests.all` with `{passages}`;
  - one `question.origin.shared` line for each pair of parts that `partitionindependence` (`strength.partitionIndependence`, for the reading shown, R25) answers as sharing an origin, with `{passages}` and `{origin}` filled from its `shared` entries. An origin named `undetermined` is drawn as undetermined, never as independence, and `complete: false` is said;
  - `question.rests.set` with who set it and when, from the grounds' `asserted_by` and `at`;
  - each later change as `question.rests.changed`: who, when, the reason, and the strength before and after, as the inquiry's Session Log records them (`inquiry` R28);
  - "Change what a passage carries…" (`question.rests.change`) reopens R23's questions in place. It sends `inquiryground` with the member's reason, since the strength is already shown (`NO_REASON`, `inquiry` R27).

  Test: a partition of one single part and one two-passage part reads back in both shapes. A shared Public Works origin draws its line. Control: `partitionindependence` answering no shared origin draws no such line.
- **R25** (T49; N1089; DEC-235 (4); DEC-40; `basis-versions` R4, R8–R15; `strength` R7, R8; amends R2) **Readings.**
  - **The chooser.** Supports opens with "Reading shown" (`question.reading.shown`, explained by `.shown.help`), a `cs.choice` over the readings `basisversions` answers (record data). It defaults to the reading the screen's project stands on (`current`, read with `project`), else the first accepted one. The passages of Supports, and R24's read-back, are drawn as the chosen reading counts them.
  - **The section.** "Readings" (`question.readings.title`, explained by `.readings.help`) lists each reading that is neither hidden nor rejected, with:
    - its name and description;
    - its state: `question.reading.accepted` (`state_by`, `state_at`), `question.reading.weighing` (with its reason), or `question.reading.suggested`. A reading a machine authored is drawn `mark.origin.machine`, and only while the assistant is reachable (`interface-shell` R20);
    - its strength from `versionstrength` (`strength.versionStrength`) with that `version`. An accepted reading is drawn as `question.reading.strength`. Any other reading is drawn as `question.reading.whatif`, its `states` naming the reading's own state, so the answer is a what-if (`strength` R8). Two grades, never one figure;
    - `question.reading.standson` for the screen's project's CURRENT;
    - its acts: `versionaccept` "Accept", `versionconsider` "Weigh it…", `versionreject` "Reject…", `versionrevert` "Undo the decision…", `versioncurrent` "Stand on this one for {project}…" and `versionhide` "Hide". Stand on is sent with `project`, and offered only on an accepted reading, to a member joined to the project (`basis-versions` R13). Weigh it, Reject, Undo and Stand on each take the member's reason (`basis-versions` R4, R12).
  - **Rejected and hidden.** A line `question.readings.more` with the counts of rejected and hidden readings shows them on press. A hidden reading is still listed then (`basis-versions` R9: never deleted).
  - **Refusals.** Each act's refusal is drawn by its words, `VERSION_AFFIRMATION_INCOMPLETE` among them. The affirmation is asked in the channel act.

  Test: three readings drawn with their states, one a what-if, and "stands on" on the project's CURRENT. Each act sends its op with the version. Control: a machine-authored reading is not drawn while the assistant is not reachable.
- **R26** (T49; N1089; DEC-235 (5); K960; `connections` R20; `basis-versions` R11) "What relies on this" (`question.relies.title`, explained by `.relies.help`) reads `backlinks` (`connections.backlinks`) for the question and draws each citing bundle as a reference (`interface-shell` R16):
  - a project as `question.relies.project`, `{reading}` the name of the reading it stands on (`basisversions` with that `project`), or no reading named when it stands on none;
  - any other bundle as `question.relies.cites`, `{kind}` its type's word.

  When the answer carries `out_of_view: true`, the section ends with `question.relies.outofview`, and nothing says what or how many. The section is not drawn when nothing is answered and `out_of_view` is not true (R20). Test: a project, a question and a published case are each drawn. `out_of_view: true` draws the sentence. Control: with `out_of_view` absent, the sentence is not drawn.

**The project page (N1091, DEC-237; N1078)**
- **R27** (T49; N1091, N1078; DEC-237 (1); `interface-shell` R66; amends R18) On `project`, "This project's work" (`project.work.title`, explained by `project.work.help`) links the project's `plan`, `timeline`, `money`, `calculation`, `proceeding` and `standard` screens as the kit's reference links, each with its card `shell.card.<kind>`. A kind the project has none of, as the screen's reads answer, is not listed, and the section is not drawn when none is listed. On `question`, Concluding links "The case being prepared", "Review copies", "Publishing" and "The published case's record" (`case.links.editor`, `.review`, `.ceremony`, `.docket`; cards `shell.card.case-editor`, `.review-copy`, `.ceremony`, `.docket`) with the question's case as subject. Each is drawn only where a read names such a case (R18's rule). This replaces R18's interim drawing. Test: each link and card. Control: a project with no plan lists no plan.
- **R28** (T49; N1091; DEC-237 (2); `project-roster` R8, R22; `membership` R45) On `project`, "Who can find it" (`project.visibility.title`):
  - It reads `projectvisibility` and draws the setting as `project.visibility.hidden` or `.discoverable`.
  - Its history follows, newest first, each record as `project.visibility.history` (the change, who, when, the reason), ending with `project.visibility.started`.
  - "Change who can find it…" (`projectvisibilityset`, reasoned) is offered to an owner only.
  - A refusal is drawn by its words: `PROJECT_SCOPE_KEEPS_HIDDEN` (a member's own project, or one kept for counsel) or `PROJECT_VISIBILITY_NOT_THE_OWNER`.

  Test: a project made findable draws its history, and an owner sees the act. Control: a member who is not an owner does not see it.
- **R29** (T49; N1091; DEC-237 (3); `project-roster` R3, R4, R7, R29, R30; `membership` R35, R36, R38; `promotion` R41–R44; amends R1) On `project`, Members draws one row per participant, with role (`project.member.owner` / `.member`) and date (`project.member.since` / `.joined`). The founder is named as `project-roster` R29 answers her, and by `member.founder.unnamed` while she has no handle (R40). The row's acts are:
  - for an owner's own row, "Stand down as owner…" (`projectownerremove`, reasoned);
  - on a member's row, to an owner: "Make an owner" (`projectowneradd`) and "Remove from the project…" (`projectremove`). Its reason is asked and shown, and not refused when empty, as `membership` R36 has it.

  Each change waiting on owners (`projectownervotes`, `project-roster` R30) is drawn as `project.owners.pending` or `.pending.remove`. To an owner who has not agreed, it offers `project.owners.agree` (the same act, sent by her). The rule is one line, `project.owners.rule`. A `CONSENSUS_REQUIRED` answer redraws the pending line from its `have` and `awaiting`.

  Beneath the rows:
  - "Invite a member to the project" (`projectinvite`);
  - "Join" (`projectjoin`, as R1);
  - "Ask to leave this project" (`projectleave`);
  - "Start a project from this one…" (`projectfork`), with the new title and the visibility (hidden preselected), opening the new project on success.

  Test: three owners with one change agreed by one draw "waiting for" the other two. Control: a non-owner sees no owner act.
- **R30** (T49; N1091; DEC-237 (4); K2578, K2782; `project-roster` R5, R22) **State c.** An administrator opening a hidden project at its existence only, whose owners are all inactive, sees:
  - `project.rescue.title` with the date, and `project.rescue.says` with `{owners}`;
  - "Why", explained;
  - "Become its owner" (`projectownerrescue`, reasoned, naming herself);
  - `project.rescue.own`.

  Nothing else of the project is drawn. `PROJECT_SCOPE_OWN` and `OWNERS_ARE_ACTIVE` are drawn by their words. Test: the rescue drawn at existence. Control: a project whose scope is `own` is refused and drawn by its words.

**Read in my language (N1094, DEC-240)**
- **R31** (T49; N1094; DEC-240 (N670); DEC-232; `plane` R50) On `question`, "Read in my language" (`translate.read`) sends `readtranslate` with `subject` `{kind: "question", id, project}`. The answer is drawn in place, labeled `translate.label` (`{language}` the original's) and explained by `translate.label.help`, with "Show the original" (`translate.original`) and back (`translate.back`). Nothing is saved. No control is drawn on a document or a passage (R50's kinds only). `LANGUAGE_NOT_SET` and the AI refusals are drawn by their words. The control is drawn only while the assistant is reachable (`interface-shell` R20). N670's R88 is not touched. Test: the act sends the question as subject, and the original returns by one press. Control: no control on a passage.

**Text to write**
- **R32** (T49; N1077, DEC-229; D15 **M**; amends R3) **The document page.**
  - **Acts and reads.** Its acts gain `adoptversion`, `keepversion`, `connectionchoose` and `explore`. Its reads gain capture R57's `links`, connections R24's `links_to` and connections R4's `on_point`.
  - **The grade.** It is the capture's own grade object, drawn as one mark (R5), never "Unrated" beside a B note.
  - **"Its versions".** It draws its refusal by its words (`interface-shell` R61).
  - **The address.** It is drawn as an outside link, unquoted.
  - **The title.** It is the document's title, never the address's last segment.
  - **A testimony.** It offers `find-in` (a link, `screens-daily` R26) and its words, and offers neither `monitorset` nor `monitor`.
  - **Times.** They are drawn by `cs.date`, never in ISO form.

  Test: each over a fixture. Control: a capture graded B draws B.
- **R33** (T49; D3 **B**, D18 **M**; amends R6's K3003 clause, R13, R4) **The dock** (finding 3).
  - **Bounds.** `airunopen` is sent with the bounds the run's mode needs, as the plane states them for that mode. It sends no zero `fetches` or `subsessions` allowance for a mode that uses them. R6's "`fetches` 0, `subsessions` 0" is retired.
  - **Not started.** An answer of `started: false` is a refusal, drawn by its words, and `airundispatch` is not called after it.
  - **Withheld.** A dispatch answered withheld (`AGENT_WORKER_UNBOUND`, `MEMBER_PRINCIPAL_RUN` and the rest) is drawn with its reason by key, never blank. The withheld reasons' keys are owed by the channel act; until given, this module's rows.
  - **Running.** "A run of yours is working on this" is drawn only while a dispatched run is running, as the last `airun` read answers it (R8).

  Test: over a fake plane running `run-rules`' check, `airunopen` is not refused `AI_RUN_BOUND_NO_ALLOWANCE`. Controls: `started: false` sends no dispatch; a withheld dispatch draws its reason.
- **R34** (T49; D14 **M**; amends R2) Supports lists every passage the question cites, from the inquiry's own cited legs, whether or not any reading exists (today it reads `basisversions` alone, `question.mjs`:160–196). The strength sentence is drawn by its words, never as raw grade text. Test: a question with two citations and no reading lists both. Control: a severed leg is drawn severed (R12).
- **R35** (T49; D8 **B**; amends R2) Concluding offers `conclude` once the question's project stands on an accepted reading (R25's `versioncurrent`), carrying that reading. Until then it draws `question.empty.conclude` (or its successor key): what is owed first, accepting a reading and standing on it. So `NO_CLAIM` is never the first a member learns of it. The form is R41's. Test: before a reading stands, no `conclude` is offered and the sentence is drawn. Control: after `versioncurrent`, `conclude` is offered.
- **R36** (T49; D19 **M**; amends R2, R1) After `planopen`, the question links its plan by name, a reference opening `plan`, never "Its screen comes later". The project lists its plans (R27). Test: `planopen` then a plan link. Control: no plan, no link.
- **R37** (T49; D32 **m**; amends R14) `projectai` opened by a member not joined to the project draws the not-joined state by key, with "Join" where she may (`projectjoin`). It never draws "What pays" failed with "No project answers to that id". Test: a non-participant sees the state. Control: a joined member sees the panel.
- **R38** (T49; D12 **M**, its half; `screens-intake` R22) `question` and `project` offer "Add a document" (`question.empty.capture` on an empty question), opening `capture` with that subject (`screens-intake` R22). Test: the link carries the subject.
- **R39** (T49; D11 **M**, its half; amends R1, R2, R14) No screen of this module draws a record id as a title (project, question, `projectai`, and `find-in`'s project). The title is read from the record (`screens-daily` R25), and a record with none draws `state.undetermined`. Test: no heading matches `PROJ-`, `INQ-` or `INFO-`.
- **R40** (T49; N1072; DEC-230 (4); `project-roster` R29) `project`'s participants, and any `{member, handle}` this module draws, draw `founder: true, handle: null` by `member.founder.unnamed`, never `admin`. Test: the unnamed founder drawn. Control: with a handle, the handle.
- **R41** (T49; N1100; DEC-245; `basis-versions` R12, R16–R20; amends R2, R4) The question's states as `SCR.question` draws them (`Q_ST`):
  - **c, new and empty:** `question.empty.heading` and `.note`, with "Capture a document for it" (R38), "Find one the group already holds" (`search`) and "Ask the assistant to look" (`airunopen`, only while reachable);
  - **d, the assistant at work:** machine work, "You can leave this page…", and "Stop the run" (`airunclose`);
  - **e, its proposal:** `question.proposal.heading`, the reading and the passages it rests on, marked machine work. "Accept this reading" (`versionaccept`) or "Decline…" (`versionreject`, reasoned);
  - **f, its limit:** `ai.refused.limit.overall`'s words with `question.limit.note`, naming no cost;
  - **g, concluded:** `question.concluded.by` (who, when), the reading's words, `question.concluded.falsifier`, its strength, "Withdraw the conclusion…" (`withdrawconclusion`) and "Plan what to do" (`planopen`).

  State a's "Conclude" is a form: "The reading you conclude on" (`question.conclude.reading`), "What would change it" (`question.conclude.falsifier`, required, or `question.conclude.nofalsifier`, R16), and "Commentary" (`question.conclude.commentary`, marked not evidence). It is sent by a member, never the assistant.

  Test: each state over a fixture. Control: an empty falsifier with the box unticked sends nothing.
- **R42** (T49; N1100; DEC-246; amends R4, R7) The dock, and the question's state f, list under "Other reasons the assistant can't work here", each by key: switched off, kept away, no account, not installed, and whose account serves the member (R4's `ai.account.*`). On a test instance the proposal names `ai.label.untested` (R7). The dock says which account serves the member. Test: each reason over a fixture. Control: a reachable assistant draws none.
- **R43** (T49; N1100; DEC-245; amends R11; moved here from `screens-daily` R33, finding 4) `project` with no question (state b) draws "Your first question" (`project.firstquestion`, help `project.firstquestion.help`) before "Open a question". The act sends `promote` and then `drawquestion` (R11) with the member's words as the question's title, and opens the new question. Test: a new project's first question is opened and listed. Control: a project with questions draws no state b.

#### T49: words by key (K3366, K3368; DEC-257, DEC-258)

- **R44** (T49; K3366; DEC-257, DEC-258; `setup-words` R11–R13; amends every requirement here that quotes a member-facing sentence) **Words by key.** This module holds no member-facing English: every sentence it draws or answers is read through `setup-words` `word(key, vars)`, and the module holds only keys. Its keys are the `reads` list for it in `docs/development/ux-substrate/screens/words-reads.json` (DEC-258; 273 keys at `fa3c8b7e8e`), with any key a requirement here names. A sentence an earlier requirement here quotes means the key whose English it is: the quotation identifies the key and binds no wording, so a word changed in `words.json` changes no requirement and no code here. The 2 strings that list marks `unkeyed` (none read by a member, each with its reason) stay in source. Test: each key it reads is asserted with `setup-words` `hasWord`; over fixtures, what it draws for a sample of its keys equals `word(key, vars)`; no test holds a sentence's English.

## Private

### Uses

- `setup-words.word`, `setup-words.hasWord` (K3366, K3368): every member-facing sentence, by key.

- `interface-shell`: the kit `cs` and the screen contract (its R21), the dock (its R20).
- `setup-words`: `WORD_ROWS` keys.
- (T47) `screens-settings`: R9's AI account panel render, reused for `projectai` (R14), a new `modules.json` edge (earlier in layer 11). Through the plane: `basis-versions` (`projectquestions`, R50; R9), `strength` (`projectbarset`, R40; R10), `citation` (`drawquestion`, R14, R15; R11, R12), `ai-runs` (R18 as T47 amends it; R13), `credentials` (R54, R59–R61; R14), `ai-use` (R14).
- Through the plane: `project-roster`, `project-stage`, `strength`, `promotion`, `membership` (project acts), `action-plans` (`planopen`), `inquiry`, `basis-versions`, `citation`, `contradiction`, `hypotheses`, `tasks` (`checkrequest`), `capture`, `ratification`, `attestation`, `monitoring`, `people`, `content`, `extraction` (`pagetranscribe`), `reading-pipeline`, `ai-runs` (R18, R78), `run-productions`, `credentials` (`projectaccountstate`), `control-plane` (R77, the member-run door).
- (T48) Through the plane: `ai-use` (`aiuseovertime`, its R14; R17). The screens R18 links are each their own module's (`screens-action`, `screens-investigate`, `screens-publish`), reached by address only, never imported.
- Tests only: `op-declarations` (`OPS`).

### Invariants

None numbered here: `interface-shell` R23 and R24 (no place named; no log of who opened what) bind this module's screens as every screen's.

### Satisfies

- Registry screens `project`, `question`, `document`, `assistant` (DEC-139 (1), (7)); N897 (1), (2) (R7). (T47) `projectai` (`registry.json` at `a0fab7abf0`; DEC-188 (1), (7); N721): R14; N955 (R13), N974 (R9), N975 (R11), N976 (R10), N977 (R12), N986 (R8).
- DEC-82, DEC-160 (R2, R5), DEC-190 (R3); canon §P (the assistant: R4), §U (undetermined); N919, K2892 (R6).

### Suggestions

- The mockups' assistant text ("$0.42 of your $2.00 today") comes from `aiusage` for the serving account; omit it when the read does not answer.
- `act.pagetranscribe.does` and `ai.refused.limit.unjudged` are drawn from this module's own rows (`interface-shell` R5: each names Civicsmith bare). `ai.label.untested` is owed by the design stream (BOB's channel act).

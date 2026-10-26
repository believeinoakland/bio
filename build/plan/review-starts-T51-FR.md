# Review of the wave-2 STARTs of the T51 fix round (read-only worker for BOB)

Read whole: `fix-round-T51.md`, `fix-round-T51-pass.md`, `deadends-T51/CAUSES.md`, the 29 wave-2 STARTs in `starts-T51-FR/`, K4189. Wave 1 STARTs were not reviewed. Check numbers 1 to 9 are those of the brief.

**Mechanical results that hold for all 29** (checked by script across the files):
- Check 1: every cause the plan's section 5 places in a job appears as an entry in that START, and no entry is for a cause placed elsewhere (the only extra is `(registry)` in screens-inquiry and screens-action, which the plan counts).
- Check 5: every "index N" and before/after line agrees with `build/modules.json`. Exceptions are listed per START.
- Check 6: the four over-budget STARTs (screens-settings, screens-inquiry, screens-publish, screens-action) carry the digest step, before the entries, citing source sections.
- Check 7: depth 2, model line, words rule (K3810, K3930), package rule (K4113), scan rule (K3678), checks and ownership commands with the right module name, and the inherited reds of the screen modules (K4174/K4187) are present and correct. The boilerplate lines are byte-identical apart from the module name.

## A. Defects that cut across STARTs

| # | where | quoted | defect | fix |
|---|---|---|---|---|
| X1 | `capture-sources.txt` line 3; `investigation.txt` line 4; `screens-intake.txt` entry 5 (C56); `screens-inquiry.txt` entry 18 (C36) | "the retry screen is not drawn (see Left out in the plan)"; "no screen draws it yet (see the plan's Left out)"; "are not drawn (see Left out)"; "A hunch-graded leg has no operation and is not drawn: see Left out" | Check 8, K4189 (5). Plan section 7 no longer leaves out the controls of C20, C23, C65, C36's hunch-graded leg, or C56's cadenced requests and ratified sweeps; K4189 places them in T51. Four STARTs still say they are not drawn. | Replace with the K4189 wording: the control goes to UX-DESIGN (HANDOFF B405) and the screen job builds it when the drawing merges, else in the round's second pass. For C36 and C56 name the owner job that takes the lines of `draft-req-T51-K4189.md` (the file does not exist yet). |
| X2 | `screens-intake.txt`, `screens-inquiry.txt` (entry lists) | no entry mentions C20, C23 or C65 | Check 8. K4189 says `screens-intake` builds C20's control and `screens-inquiry` those of C23 and C65 "when drawn". Plan section 5 places C20, C23, C65 only in FR-11, FR-10, FR-15, FR-32. No START has a conditional entry. | Add one conditional entry per control (ops `capturecredentialsupply` and `capturerequestretry`; `declareorigin`; `projectclose`), and add the screens to those three rows of section 5. |
| X3 | pass doc section 4; plan section 5 | `capturerequestretry` is in neither | C20's retry op is owned by `capture-requests` (`capture-requests/index.mjs`; hand rows only). The pass table lists no `capture-requests`, and no wave-2 job declares it; the guard will count it undeclared once X2's control exists. | Add `capture-requests` / `capturerequestretry` (sent by `screens-intake`) to the pass table. |
| X4 | `screens-entry.txt` entry 1; `screens-settings.txt` entry 7 | "`screens-settings` draws the same on the team's page"; "the same website file `screens-entry` draws on `setup`" | Check 4, K4164. One cause (C11), one builder of the `{instance, group}` file, its steps and verifier words, written twice in two screen modules; `screens-settings` does not use `screens-entry`. | Name one owner of the builder (screens-entry exports, with a `uses` edge BOB adds; or a shared part of `interface-shell`), the other imports. |
| X5 | `screens-intake.txt` entry 1 (C55); `screens-inquiry.txt` entry 10 | "as `screens-intake` does on the capture screen" | Check 4, same pattern: the four-outcome drawing of `monitor`'s `status` and `note` written in two modules. | One drawing owner, or one shared key set stated in both entries. |
| X6 | `plane.txt` entry 4 (also entries 2 and 3) | "Check that every op this tranche adds is reachable ...: `declareorigin` (provenance), `taskdecide` (tasks), `casedetailsset`, ... `rerunread` (case-import)... Test: A door call for each name answers" | Check 4, K3268: a plane test that hand-lists nine other modules' ops; entries 2 and 3 do the same for `capturecredential*` and `projectclose`. | Iterate the owners' exported `DECLARED_OPS` / ops maps (test-only collector, K4189 (1)), as entry 1 does; entry 4 is then subsumed. |
| X7 | `plane.txt` line 3 and entry 1; plan section 5 K4168 row and section 6 FR-32 | "The second half of the op-declaration assembly (the collector)"; "the collector call FR-32 plane" | Check 8, K4189 (1). The collector is test tooling only; the plane assembles by its own imports. The entry body is right; the word is stale. | Say "the plane's assembly"; remove "collector" from those two plan places. |
| X8 | settings, intake, inquiry, investigate, publish, action merge lines | "The mechanical pass has declared the ops of `provenance-routes`, `progressions`, ... before you start" | Check 8, K4189 (4). The pass changes no arm's behaviour; a module it hands over gets its own wave-2 job. The lines promise something conditional. `wizard-scripts` (`writinghelp`) is in none of the lists. | Append "or, for a module handed over, its own wave-2 job has merged"; add `wizard-scripts`. |
| X9 | 15 STARTs: capture-sources, case-authoring, case-import, case-inputs, connections, credentials, investigation, member-roster, plane, project-roster, provenance, queue-producers, queue, review, tasks | "Reds you inherit: " (empty) | Check 7. An empty line is not "None inherited". | Write "None inherited." |

## B. Per START (checks 1 to 7 hold except as listed)

### file-scanner (FR-06)
| quoted | defect | fix |
|---|---|---|
| "NEW `file-scanner` R38 (next free id)" | Check 3. `build/requirements/file-scanner.md` ends at R33 (line 68). No collision, but R38 is not the next free id. | R34. |
| "Read ClamAV's mirroring guidance and rate limits live, choose" | Check 9, minor: BOB's operational detail unless the terms limit use by many installed teams. | Post a QUESTION if the guidance makes either path not free. |

### member-roster (FR-07)
| quoted | defect | fix |
|---|---|---|
| "NEW `member-roster` R76 (amends R147)" | Check 2. R147 is not a member-roster id; `member-roster.md` line 114 R62 reads "(was membership R147 ...)". | "amends R62". |
| Why: "the declarations of the three ops the Settings screens send" | Entry 3 declares four (`adminendorse`, `expertiseconfirm`, `expertisedeclare`, `memberpairingset`); plan FR-07 also says three. | Say four. |
| entry 3: "Test: ... Requirement: the `DECLARED_OPS` line. Test: as stated." | Two Test sentences; the withdraw behaviour test and the declaration are fused. The arm appends one `withdrawn` event (index.mjs:571-595); "the confirmation and the declaration together" must be shown, not assumed. | Split into two entries. |

### project-roster (FR-08)
| quoted | defect | fix |
|---|---|---|
| "true when `membership`'s three rescue conditions hold (membership/index.mjs:91-93)" | Check 2, wrong citation. Those lines are the administrator's `discoverable` arm of the sight gate. `rescue_open` appears in no project-roster file. The rescue condition is `project-roster/index.mjs:171-179` (`#rescueAtExistence`: project, EXISTENCE, hidden) and `membership` `rescueRefusal` (:1149). C83 (closed: hidden by design) and C84 are easy to confuse. | Cite those and state the exact conditions and which ownerless projects the mark covers. |
| entry 2 declares `projectowneradd`, `projectownerremove` | Check 7: no "Declaration (K4168)" paragraph in this START (it is missing in 16, 8 of which declare nothing). | Add the paragraph. |

### credentials (FR-09)
| quoted | defect | fix |
|---|---|---|
| entry 1 "(`signerRegisterOwn {by: "admin"}` refused; credentials/index.mjs:823-825 ...; control-plane/index.mjs:2879)" | Checks 2 and 4. The refusal at :823-825 is `#signerMemberBar` -> `#memberFacts` -> `noSuchMember`; the founder's absence is `member-roster`'s `memberFacts` (FR-07 entry 1). With member-roster R76 merged credentials may need no code change, only the pin at `own-keys.test.mjs:54` (verified: `["nobody","admin"]`). `control-plane` is not this module's. | Say: run own-keys with R76 merged first; change code only where credentials itself refuses. |

### provenance, case-authoring, case-inputs, case-import, connections, tasks, journey-check, agent-runner, screens-investigate
No defects beyond X9 and X8 where noted. Ids free: provenance R64 to R67, case-authoring R78 and R79, case-inputs R20 to R28 (match the draft), case-import R27 to R32, connections R70, tasks R20 and R21, journey-check R30, agent-runner R42, screens-investigate R49 to R51. Spot-checks held: provenance/index.mjs:1135 with no `declareorigin` in `ops.mjs`; case-authoring :610-614 and :1391; connections :753; progressions :833; `importacceptwithdraw` already exists (case-import/index.mjs:1789, 1809); `agent-worker/wrangler.jsonc:98-100`.

### capture-sources (FR-11)
| quoted | defect | fix |
|---|---|---|
| "the retry screen is not drawn" | X1. | per X1 |
| entry 1 serves supply, list, withdraw only | X3: the retry op `capturerequestretry` is `capture-requests`'. CAUSES C20 lists `capture-requests` among the modules. | per X3 |

### file-safety (FR-12)
| quoted | defect | fix |
|---|---|---|
| "NEW `file-safety` R38 (next free id)" | Check 3, **collision**. `file-safety.md` line 56 holds R38 (`findingKind`); the file runs to R45. | R46. |

### investigation (FR-15)
| quoted | defect | fix |
|---|---|---|
| "no screen draws it yet (see the plan's Left out)" | X1, X2. | per X1 |
| "`NOT_THE_OWNER` for a member who does not own it" | Check 9. The existing arm `projectCloseWithGaps` is gated by `#memberGate` and quiet (:1105-1109), not by ownership, so owner-only is a new rule on who may close a project. | BOB confirms it from canon (project-stage R2, Investigation); to Bob only if canon is silent. |

### review (FR-19)
| quoted | defect | fix |
|---|---|---|
| "read from `case-authoring` and `case-catalogue`" | Checks 2 and 4. `review`'s `uses` has `case-authoring` and `ratification`, not `case-catalogue`; `SUBJECT_POSITIONS` reaches case-authoring from `ratification` (index.mjs:91), `MEMBER_ROLES` is exported at case-authoring :136. | Read from `ratification` and `case-authoring`. |
| "`REVIEW_DRAFT_FIELDS` is `case-authoring`'s `DRAFT_FIELDS`" | `REVIEW_DRAFT_FIELDS` (review/index.mjs:88-89) has no `account`, yet the test also expects the account kept; the START does not say where `account` enters `DRAFT_FIELDS`. | State it. |

### filings (FR-20)
| quoted | defect | fix |
|---|---|---|
| "`templatesave {name, filing \| brief, notes}`" | Check 2. The arm (`templateSave`, filings/index.mjs:2836-2837, door :3003-3005) takes `filing` or `template`, `project`, `name`, `kind`, `use`, `profiles`, `notes`; no `brief`. Whether it already refuses the filing form for a counsel-first filing was not found. Same words in `screens-action` C75. | State the real field that selects the brief form; write the declaration from the arm. |
| "NEW `filings` R66: `filingapprove` declares `resolutions` and `release`" | The line states a declaration, not an outcome. | State the outcome: approval with the declared fields is accepted for flagged text. |
| haiku with "Check the op does this ... fix here if it does not" | An open judgment on the lowest model. | Set sonnet. |

### queue-producers (FR-22)
| quoted | defect | fix |
|---|---|---|
| "After `member-roster` (34 < 146) and `tasks`; before `queue`" | Check 5. Entries read `project-roster`'s `projectOwnerVotes` (R30, index 37), not named. `uses` of `queue-producers` has `project-roster` but not `member-roster` or `tasks`, though R46 and R48 read member-roster R77, R78. | Add `project-roster` to the line; BOB adds the `member-roster` edge to `modules.json`. |

### queue (FR-23)
| quoted | defect | fix |
|---|---|---|
| "`queue-producers` declares `adminendorse` / the owner-vote op ... and `expertiseconfirm`" | Check 4. Those ops are declared by `member-roster` (FR-07) and `project-roster` (FR-08); two modules would declare one op. What a producer declares is the kind's door. | "`queue-producers` names the door op per kind; the op's declaration is its owner's." |

### screens-entry (FR-24)
X4 only. R26 free.

### screens-settings (FR-25)
X4 (entry 7), X8. R63 to R69 free. Digest step present. Spot-check held (members.mjs:129, :192).

### screens-intake (FR-26)
X1 (C56), X2 (C20), X5, X8. R42 to R46 free. Spot-checks held (capture.mjs:313, :400-410).

### screens-daily (FR-27)
| quoted | defect | fix |
|---|---|---|
| merge line "After `project-roster` ... `interface-shell`" | Check 5, minor. Entries 11 and 12 open `bias` (`screens-settings`, 161) and `contradiction` (`screens-inquiry`, 164, merges after this job). | Say the tests rely on the shell's reference kind only. |
| entry 9 "the rest draw no 'Open'" | A lead item can open `leads` (`screens-intake`, C18). | State the rule for lead items. |
R65 to R75 free. Spot-checks held (queue.mjs:47-49, projects.mjs:43-45, queue-states.test.mjs:203).

### screens-inquiry (FR-28)
| quoted | defect | fix |
|---|---|---|
| entry 18 "(A hunch-graded leg ... see Left out.)" | X1. | per X1 |
| no C23 or C65 entry | X2. | per X2 |
| digest scope (b) "`connections`, ... `intent`, `provenance-routes`, and `interface-shell` R8, R9, R104 to R106" | Check 6. Entries also touch `strength` (C37), `project-stage` (C64, R4) and `wizard-scripts`; `uses` includes `screens-settings`. None named. | Add them. |
R84 to R107 free. Spot-checks held (document.mjs:692-694, question.mjs:904-909, project.mjs:220).

### screens-publish (FR-30)
| quoted | defect | fix |
|---|---|---|
| entry 2 "in the bias screen's words" | Words belong to `screens-settings`' `bias` screen (161); not a `uses` of publish. | Say "by key from `words.json`". |
R44 to R58 free. Digest present. Spot-checks held (ceremony.mjs:218, case-editor.mjs:99-106, published.mjs:57).

### screens-action (FR-31)
| quoted | defect | fix |
|---|---|---|
| entry 15 "`templatesave` (name, filing or brief, notes)" | As filings: no `brief` field. | per filings |
| entry 3 "(read them at START)" | Ambiguous: the START holds no fields. | "from `actions`' declaration". |
| entries 11, 12 "Requirement: R45." | Three causes share one requirement id; each new id needs its own named test (K874). | One line per cause. |
| merge line | Check 5. Entry 13 points to `screens-investigate` (165), not named. | Name it. |
R36 to R49 free. Digest present. Spot-checks held (send-steps.mjs:261-263, actions :3305, action-plans :1411).

### plane (FR-32)
X6, X7. R68 to R71 free.

### installer (FR-33)
| quoted | defect | fix |
|---|---|---|
| entry 1 "Find the copies in the code (`steps/uploads.mjs`, `steps/readback.mjs`, `steps/bytes.mjs`, `steps/install.mjs`, `src/index.mjs`)" | Check 4. `newgroup/src/steps/` is the module `installer-steps` (modules.json line 175), which has no job; `installer` owns all of `newgroup/`, so the ownership check passes, but the cause sits in `installer-steps`' code (K4164 goal: fix lands with its owner). | BOB decides: an `installer-steps` job with this entry, or a ruling that `installer` holds it; say so in the START. |
| entry 2 "R11 moved to `installer-steps` R17" | `installer.md` R11 is retired; the stale test (`newgroup/test/requirements.test.mjs`) must match `installer-steps` R17. | Add that file to the reading. |

## C. For Bob (check 9)
Nothing asks a value, legal, money or group-behaviour question that canon leaves open, with two candidates for BOB to confirm from canon before the STARTs go out:
1. `investigation` C65: owner-only close, quiet or not (a rule on whose authority closes a project).
2. `file-scanner`: if ClamAV's mirror terms limit use by many installed teams, the choice of path has a cost side.

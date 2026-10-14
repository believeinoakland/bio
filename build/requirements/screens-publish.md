# screens-publish — requirements

**Status** · New in T47 (T47-63; K657, K1043, K569, K3027 doubt 2): a module built fresh, layer 11 after `screens-investigate` and before `screens-action` (N897 (1); N788's Photos step, N757's marking on screen, N683's "Publish at…"; DEC-78, DEC-96, DEC-100, DEC-112, DEC-116, DEC-147, DEC-180, DEC-181, DEC-183). Drafted in `build/plan/draft-T47-interface.md` §2.3, worded here by BOB (P5). No ids move. Not yet met (T47). Last changed T48 (T48-75: R18 new, amending R2 and R17, the reader's link's end date, N1038, `review` R34; R19 new, amending R6, the published page's evidence and complete edition, K3190 census P1, DEC-228; K3195); marked not yet met (T48). Last changed T48 (K3254, the L11 design fold of WALK-084 #2, K3250: R20 new, the common line); marked not yet met (T48). Last changed T49 (T49-27: R22, R23 new; K3334); marked not yet met (T49).

**Size (P6).** Estimated 2,600–3,200 lines with comments, its own keyed sentences included, measured at its START (M-T47-1, K617).

## Public

### Purpose

From a case's draft to its public page, and what comes in from outside: preparing the case, sharing a review copy, the publication ceremony, the published case page, another group's case imported, the case's docket, and the doorbell's page for someone with no account. Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`** (the screen contract, `interface-shell` R21; words, its R5)

**case-editor** (Projects › <project> › Case; the registry's 5 acts)
- **R1** Reads the project's case drafts (`casedrafts`), the draft's document (`casedocument`), its check (`casecheck`) and the "what changed" drafts (`whatchangeddrafts`). Draws the readiness ladder (Draft, Internally checked, Externally compliant, Distributed, each "not yet evaluated" until checked), the scope, what it leaves out with its acknowledgements, the people it names each with its reason (or that the reason is missing), and what changed since the last edition. Acts: `casedraft` "Prepare the draft"; `whatchangedpropose` "Draft what changed" (only while the assistant is reachable, drawn labelled machine work, `ai.label.untested` where its answer carries `untested`, kept only by the member's own words); `statementack` "Acknowledge what it leaves out", with the acknowledger's own reason (`case-inputs` R1, `STATEMENT_ACK_NO_REASON`); `attribute` "Name with the reason" (its consequence statement in the dialog, `op-grades` R4); `writinghelp` under the scope and "what changed" fields only (`interface-shell` R20; never under a reason).

**review-copy** (Projects › <project> › Review copy; the registry's 3 acts; DEC-100)
- **R2** Reads the draft's review grants and their comments (`reviewcomments`). Each named reader is a row with what they may read and until when, offering `reviewrevoke` "Stop sharing". `reviewgrant` "Share with a named reader" (a name, a role, and an end date) carries `mark.outward.means` and answers the grant's secret once: the screen shows it once as the reader's link `<origin>/app/review#grant=<secret>`, with "Civicsmith sends no email" (K3137; journey 21), for the member to hand over, and never keeps it (no storage, address or later request). `reviewcomment` "Reply" answers a reader's comment.

**ceremony** (Projects › <project> › Publish; the registry's 7 acts; DEC-147, DEC-180, DEC-183; N683, N757, N788)
- **R3** The ceremony draws its steps in order (What, Strength, Leaves out, People, Photos, Disclosures, Bias, Preview, Ties, Sign), the current one marked, and carries the required "Publication ceremony" wizard (`screens-wizards` R7). Reads `publishpreflight` (each finding against the bar, every refusal that holds before signing, by its words), `publishtensions` (what will be disclosed with the case: unresolved contradictions, the timeline frozen at signing), `photomarks` for each photo the case carries, and `publishschedule` for an edition waiting to publish. Acts: `publishpreflight` "Check again"; `publishtensions` "See everything that will be disclosed".
- **R4** The Photos step (N757, N788; DEC-180, DEC-183): each photo the case carries (relied on or supporting) is shown with its marks; the member draws rectangles on the photo and marks each a person not part of a finding, a number plate, or a city staff member at work (a staff area with a reason), and sends `obscuremark` with those areas, or "nothing to obscure" (`areas: []`); a mark is withdrawn by `obscuremarkwithdraw` with a reason, never erased. The step says what the public copy carries (areas obscured and labelled, camera details removed) and that every photo must be marked or "nothing to obscure" before signing; a photo whose format cannot be covered stops the signing, naming it, by its refusal's words.
- **R5** amended (K1490, K3041; `case-authoring` R76; DEC-208 (2)): the Ties step's "Confirm, and prepare Edition <n> for signing" sends `publish` with `tieAttested: true`; Sign is offered only after it answers. Test: `publish` carries `tieAttested`; control: no Sign before it.

**published** (the public frame; the registry's 2 acts; DEC-112, DEC-147 (5))
- **R6** Drawn in the public frame with no session (`interface-shell` R30) at `/app/published/<case>`: reads `publishedcase` (the edition's findings, each with its two strengths and whether it meets the project's bar, its timeline, the people it names, its evidence, and when it was signed and when published) and `publishededitions`; says whose work the case is and how to read a case. Acts: `verify` "Check the signature"; `publishedcase` "Read the case". Nothing on the page needs an account.

**imported** (Projects › Imported › Another group's case; the registry's 4 acts; DEC-96, DEC-112)
- **R7** Reads `importedcases` and `importedcase` (each finding with whether it recreated, in part, or not), drawn in the imported band (read-only). Acts: `caseimport` "Import a case"; `importaccept` "Accept what recreated, with a reason"; `importflag` "Flag an issue"; `importwatch` "Watch the publisher's docket".

**docket** (Projects › <project> › Docket; the registry's 2 acts; DEC-116, DEC-100)
- **R8** Reads `docket` (the case's entries: editions, corrections, withdrawals, court orders, each drafted or posted) and `docketprepare` for a draft entry. Acts: `docketfile` "File a docket entry" (with the member's reason for the record or public choice); `docketpost` "Post it, signed" (signed with her own key, as R5's signing).

**doorbell** (the public frame; the registry's 1 act; DEC-78)
- **R9** Drawn in the public frame with no session (`interface-shell` R30) at `/app/doorbell`, headed by the group's public name (`groupidentity`): what happens to what is sent (it goes only to this group's Civicsmith; a member reads it and decides; an optional secret phrase lets later material be recognised as the same sender without anyone knowing who; nothing here is beyond a court's reach), files chosen, a note (optional) and a secret phrase (optional). `knock` "Hand it over" sends them with no credential; its refusals (`KNOCK_EMPTY`, `KNOCK_PAYLOAD_TOO_LARGE`, `KNOCK_ENVELOPE_TOO_LARGE` and the rest) are drawn by their words, and its answer says the material was received. The secret phrase is never kept by the page.

**Common**
- **R10** `interface-shell` R8–R13 and R16 hold on every screen; after an act, the screen re-reads what it changed and draws it; nothing is drawn as signed, posted or published before its answer.

#### T47's L11 fold (K3100)

- **R12** (DEC-207 (2), (3)) The Sign step: "When it becomes public" (now, or a date and time in the group's zone, offered as `publish_at` says), then one button, "Sign and publish now" (`caseratify`) or "Sign now and publish at <time>" (`publishat`), with `signing.ceremony.who`.
- **R13** (K3080; DEC-207 (4), DEC-208 (1); `ratification` R52) The button asks the password again where due (`interface-shell` R34), then signs in one sitting (`cs.signer.sign`, R41) the case statement (`caseRatifyStatement`) and one `ratifyStatement` per finding the edition pins and per piece of evidence they rest on, each listed; it sends them in the one act R52 takes (until R52 is merged, `caseratify` then each `ratify`); declined, nothing is sent. Nothing is drawn signed before its answer (R10).
- **R14** (DEC-207 (5)) Signed and waiting draws `signing.ceremony.signedat` with "Move the time" (`publishatmove`) and "Cancel publishing" (`publishatcancel`); signed and published draws `signing.ceremony.signednow` with the public page.
- **R15** (DEC-207 (6)–(8), DEC-210) `NO_ATTESTING_KEY` draws `signing.ceremony.nokey` with the keep choice and "Register a signing key in this browser" (`signerregisterown`), returning to the step; at the phone width `signing.ceremony.phone`; `CASE_SIGNER_NOT_AN_OWNER` draws `signing.ceremony.notowner` and "Ask an owner to sign" (`signrequest`).
- **R16** (DEC-116; R8) `docketpost` signs `docketStatement` in `NS_DOCKET` through `cs.signer.sign` within the prepared statement's 60 minutes.
- **R17** (DEC-201 (8)) **review-outside** (published frame, `/app/review#grant=<secret>`, the fragment removed on load): `reviewcopy` (the secret in the body), the link's end date, `reviewcomment`; no session read.

#### T48 (T48-75)

- **R18** (T48; N1038; DEC-100; K3147; `review` R34; amends R2, R17) `reviewgrant` sends `until`, the end of the day the member chose in the group's zone as an instant (`record-core`'s stamp form); each reader's row draws "until <date>" (`cs.date`) from the grant's `until`, and a lapsed grant is drawn ended; `review-outside` draws the link's end date from the same answer. `REVIEW_BAD_UNTIL` is drawn by its words and the form keeps what was typed. Test: a grant ending in three days draws that date; controls: a past date is refused and nothing shared; a grant with no `until` draws "until you stop sharing".
- **R19** (T48; K3190, census P1; DEC-228; `public-read` R3, R5) On `published`, each evidence row with a full SHA-256 opens its bytes through `publishedbytes` by that hash, as a public op with no `Authorization` header (`interface-shell` R30); a row with no sha draws no link. "Download the complete edition" fetches the edition's file through `publishedbytes` with `sha256=<manifest_sha>&format=zip` (`public-read` R5, R23; `cs.download`; K3295), with no credential. Its words are this module's `SCREEN_WORDS` rows from the mockup until the design stream keys them. The "Verify any hash" panel is not drawn (DEC-228: to draw). Test: an evidence row opens its bytes with no header; control: a row with no sha draws no link.

**The design walk folded** (T48; WALK-084 #2; K3250, K3254)
- **R20** (T48; K3250, K3254 (1), (5); walk C1, C4, C5; DEC-219 (3); K3052; amends R10) The common line, on every screen of the module: every element these screens draw uses a class that a served stylesheet defines (`interface-shell` R56).
- **R21** (T48; K3240, K3254, K3279; the 0.84.0 walk, signed out; amends R1) `published` opened with no id, to a signed-out reader, offers the way an outsider can go (the group's public page), never "Go to Home". Test: signed out, a bare `published` links the public page. Control: no "Go to Home" is drawn.
  - Where the design draws the element, the screen uses the design's own class: an `mk-*` class as `shell.css` carries it, and a `cs-*` class the design spells `mk-*` (`cs-frontgrid`, `cs-signin`, `cs-fronthead`, `cs-flogo`, `cs-facts`, `cs-note`, `cs-sub`, `cs-small`, `cs-steps`, `cs-passage`, `cs-strengthbox`, `cs-gapblock`, `cs-pickc`, `cs-areas`, `cs-table`) is renamed to the design's spelling. A class the design does not draw is mapped to the kit's or a design class; only where none fits does `interface-shell` carry its style (its R56), with an ASK to UX-DESIGN to draw it (K3254 (1)).
  - Every labelled field is drawn with `cs.field`. No screen draws `cs-form` or a bare `<label>` with `.help`.
  - A section, tray, list, block or reading that holds nothing is not drawn. No count, reading or "finished by" is drawn at zero. A screen with nothing at all to show draws its one designed empty state, which names the first step. (DEC-219 (3) applied to every screen is BOB's reading of K3052, K3254 (5); the designed screen-level empty states are kept.)
  - A read that failed is still drawn as failed (`interface-shell` R10).
  - It covers `cs-note`, which becomes `mk-note`, and `cs-refusal`, which becomes the shell's refusal (`interface-shell` R61).

  Test: the module's real `SCREENS` compose under `interface-shell` R56, and each screen drawn over an empty fixture shows no empty section and no zero. Control: a failed read is drawn `state.failed`.

#### T49 (T49-27)

- **R22** (T49; N1094; DEC-240 (P1); `public-read` R1, R3; amends R6, R19) On `published`, "Check a file you hold" (`published.check.title`, explained by `published.check.help`):
  - a field "Its SHA-256" (`published.check.field`, help `.field.help`), 64 hexadecimal characters, case-folded;
  - "Check it" (`published.check.go`), which sends `verify` with it as a public op with no `Authorization` header.

  A match in this edition reads `published.check.yes`, with `{n}` and `{finding}` from `publishedcase` read by that `sha256`. No match reads `published.check.no`. No file is read or sent: the page takes the fingerprint only. R19's "the Verify any hash panel is not drawn" is retired. Test: a pinned evidence hash draws the finding. Control: an unknown hash draws `.no`, and no request carries anything but the hash. *(not yet met: T49)*
- **R23** (T49; N1094; DEC-240 (C2); `case-inputs` R1, R5; `review` R15, R28; amends R17) On `review-outside`, "What the case says it does not cover" (`review.statement.title`, explained by `review.statement.help`) draws the group's statement from `reviewcopy`. Beneath it are "Your note" (`review.statement.note`, help `.note.help`, required) and "Acknowledge it" (`review.statement.ack`). That act sends `statementack` with the draft, the note as `reason`, and the grant's secret through the grant door as `reviewcomment` sends it, never in an address. `STATEMENT_ACK_NO_REASON` and the dead answer are drawn by their words, and the note is kept. A copy whose statement is absent draws no section. Test: the acknowledgement sends the note and the secret in the body only. Control: an empty note is refused, and nothing is sent. *(not yet met: T49)*

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21), the public frame (its R30).
- `setup-words`: `WORD_ROWS` keys.
- `wizard-scripts`: `SCREEN_REGISTRY` (its R13, R31), in tests only.
- Through the plane: `review` (`casedraft`, `reviewgrant`, `reviewrevoke`, `reviewcomment`, `reviewcomments`, `casedrafts`), `case-inputs` (`statementack`, `whatchangedpropose`, `whatchangeddrafts`), `case-authoring` (`casedocument`, `publishpreflight`, `publishtensions`, `publish`), `case-check` (`casecheck`), `publication` (`attribute`), `case-carriage` (`obscuremark`, `obscuremarkwithdraw`, `photomarks`), `ratification` (`caseratify`, `publishat`, `caseRatifyStatement`), `publish-schedule` (`publishschedule`), `public-read` (`publishedcase`, `publishededitions`, `verify`; T48: `publishedbytes`, its R5; R19), `case-import`, `docket`, `doorbell` (`knock`), `instance-setup` (`groupidentity`), `wizard-scripts` (`writinghelp`).
- Tests only: `op-declarations` (`OPS`).

### Invariants

- **R11** amended (K3079 (a)): No secret this module's screens handle is written to the browser's storage, an address or a later request; the one exception is the signing key kept by the member's choice (`interface-shell` R40, R42).

### Satisfies

- Registry screens `case-editor`, `review-copy`, `ceremony`, `published`, `imported`, `docket`, `doorbell` (`docs/development/ux-substrate/screens/registry.json` at `a0fab7abf0`; DEC-139); their drawings in `mock-screens.js` at that commit; N897 (1).
- (T48) DEC-228 (P1, drawn): R19. N1038, DEC-100: R18.
- DEC-100 (R2, R8); DEC-147 (R5, R6), N683 (R5); DEC-180, DEC-183, N757, N788 (R4); DEC-181 (R5); DEC-112, DEC-96 (R6, R7); DEC-116 (R8); DEC-78 (R9); DEC-88 (R1's acknowledgement reason).

### Suggestions

- **Owed, before some acts can be drawn** (`draft-T47-interface.md` §5): `statementack`, `reviewcomment`, `publishpreflight` and `publishtensions` are not in `SESSION_OPS.member`, so `interface-shell` R12 draws none of them for a member until `op-declarations` places them there (BOB's); the signer's confirmation of no undeclared tie (R5) is taken by no requirement today; and signing in the browser (R5, R8) has no in-shell signer: the signing page (`/sign`, `signatures` R31) signs `bio-ratify` statements with the member's browser-held key, and the hand-over of its signature to the screen is BOB's to fix at this job's START.
- The screens' own sentences are held in `SCREEN_WORDS` (`screen.<id>.<part>`) from the mockups' English at `a0fab7abf0` until the design stream adopts them (DEC-198 (6)).

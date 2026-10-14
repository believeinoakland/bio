# screens-entry — requirements

**Status** · New in T47 (T47-86; registered K3064, K3070; folded K3100): a module built fresh, layer 11 after `interface-shell` and before `screens-wizards` (N999, N1002, N1005; DEC-201 (1), (2), (5), (6), (12); DEC-202 (1)–(4); DEC-205 (5); K3052, K3053, K3060 D2, D4, D7, K3061 D3). Drafted in `build/plan/draft-T47-L11-fold.md` §B, worded here by BOB (P5). The retired `setup-page` ids R1–R3, R14–R20, R22, R24, R25, R27, R29, R30, R34 name their homes here (R1, R2, R4, R6, R7, R10). Not yet met (T47). Last changed T48 (K3254, the L11 design fold of WALK-084 #2, K3250: R12 new, the common line; R13 new, two columns and the name, never the slug; R14 new, the name asked first at setup; R15, R16 new, T48-84's lede and `published` clauses); marked not yet met (T48).

**Size (P6).** Measured at its START (M-T47-1, K617).

## Public

### Purpose

The screens drawn without a member session, in the public frame (`front`, `tour`, `forgot`, `reset`) and the setup frame (`setup`, `join`). Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`** (the screen contract, `interface-shell` R21; words, its R5)

- **R1** (DEC-202 (1); K3060 D2) **front** ("Your group's page", public frame, at `/` and `/app/front`, no session read): the masthead of the group's name and logo when set (`groupidentity`, `instance-setup` R84), its public purpose (`groupdescription`'s public parts), what it has published (`publishedlist`: each case edition's title, edition, signing date and signer as answered, linking `/app/published/<case>`), "Have something for us?" (`/app/doorbell`), "How we work" with "See how it works, step by step" (`/app/tour`), members' sign-in as a panel, and "<group> uses Civicsmith" at the foot; a part the group keeps from the public is not drawn (DEC-132). Test: each read in its four states (`interface-shell` R10) with no `Authorization` header sent.
- **R2** (K3061 D3; DEC-201 (1), DEC-202 (2); `credentials` R65, R67) The sign-in panel asks the handle (`signin.founderhint` its help), the password and "This device is" (`session.keep`, checked by default, or `session.shared`), and sends `login` with `handle`, `password` and `device` in the body only; on success it hands the session to the shell (`interface-shell` R32) and opens the page kept to return to, else Home. It draws the states refused (`refusal.SIGN_IN_REFUSED`), paused with its end (`refusal.SIGN_IN_PAUSED`, `{time}` from `stated`), signed out (`session.signedout`), ended (`session.ended`) and locked (`session.locked`: the handle, the password, "Unlock" sending `unlock`; "Not <handle>?" signs out). A refusal keeps the handle and clears the password. "Forgot your password?" opens `forgot`; "Not a member yet?" says members join by invitation. Test: each state; control: a sentinel password in no request but `login`'s body.
- **R3** (DEC-205 (5); K3060 D7) **tour** (public frame): the six steps of "How we work" (`screen.tour.*` and this module's `SCREEN_WORDS`), Back, Next, and "Stop here" returning to `front`; the fifth step links the doorbell; no account is asked, no op is sent and nothing is stored. Test: every step drawn; control: no request leaves the page while it is walked.
- **R4** (DEC-201 (2), DEC-202 (3), DEC-205 (4); `credentials` R47, R68) **forgot** (public frame): "Use one of your recovery codes" (handle, code, new password typed twice alike) sends `recover` in the body only and draws `RECOVERY_REFUSED` as one sentence for every arm; on success it says how many codes are left and that other sign-ins ended, linking `front`; "No codes? Ask an administrator for a reset link"; "If no administrator can get in", the hosting account's way (`HOSTING_CONTROL` and the rotation guide's steps, the steps `HOSTING_CONTROL` states (was `setup-page` R27)). Test: success and refusal; control: two passwords that differ send nothing.
- **R5** (DEC-205 (5); `credentials` R69, R71 (6)) **reset** (public frame, `/app/reset#reset=<link>`, the fragment removed on load): `passwordresetlook` draws for whom the link is (handle) and until when; "Set my new password" (typed twice alike, 12+) sends `passwordreset` with the link in the body only; states: set ("Sign in", to `front`), and `RESET_LINK_DEAD` ("Ask an administrator for a new one. Nothing was changed."). Test: live, set, dead; control: the link in no address after load and no storage.
- **R6** (DEC-201 (5); K3053; setup-page R2, R3, R14–R20, R29, R30 moved) **setup** (setup frame, `/app/setup`): the claim fills the one-time password from `#boot=` (removed on load), asks the founder's password twice (12+), sends `claim`, then `login` as handle `admin` (device own) and `recoverycodesissue`, showing the ten codes once (copy; save as a file made in the browser). Then each part is the registry's act for it, every part skippable and resumable: name and website (`groupnameset`, `groupdomainset`), places (`profilesset`, `placewanted`), offices (`officesseed`, `entitycreate`), the assistant (`aikeepaway`, `groupkeyset`, `groupkeyswitch`, `ailimitset`), the court notice (`courtnoticeset`), the hosting account (`hostingaccessset`, beside `HOSTING_CONTROL`'s words), a second administrator (`memberadd`, role `admin`), security tools (`securitytooladd`, `securitytooltest`, the scanner's sentences only while `part_scanner` is `true`); "Finished" links `/app`. No sentence says administrators see spending by member (DEC-188 (5)); "file scanner" and "safe view" only (DEC-200 (5)). Test: a fake plane walked from claim to finish; control: a refused part keeps the step and sends nothing more.
- **R7** (DEC-201 (6), DEC-202 (3); setup-page R2, R3, R22 moved; `credentials` R68) **join** (setup frame, `/app/join`): `#invite=` reads `invitelook`; `#join=` first asks the name the group will know the person by and sends `joinlinkinvite`; a dead link draws "This link no longer works" (one sentence for `NO_SUCH_INVITATION`, `NO_SUCH_JOIN_LINK`, and `JOIN_LINK_DAILY_CAP` by its own words); then the language among the group's (`grouplanguages`, `instance-setup` R85), the handle checked as typed (`handlecheck`; fixed for good, DEC-197), the password twice; `enroll`; `login` (device own); `memberlanguageset`; `recoverycodesissue`, the codes shown once; then Home opens with the welcome offer. "Already a member? Sign in" links `front`. Test: both link kinds walked; control: a dead link draws no form.

**Common**
- **R9** `interface-shell` R5, R8–R13 and R22 hold on every screen here; the public and setup frames draw no rail, tabs or dock (`interface-shell` R30).
- **R11** (K3052) A screen here is served at its address whether or not a session record exists (`interface-shell` R32 opens Home at `/` only for a live session); `setup` and `join` never forward a signed-in visitor away while a fragment is being consumed.

#### T48 (T48-84)

**The design walk folded** (T48; WALK-084 #2; K3250, K3254)
- **R12** (T48; K3250, K3254 (1), (5); walk C1, C4, C5; DEC-219 (3); K3052; amends R9) The common line, on `front`, `tour`, `forgot`, `reset`, `setup` and `join`: every element these screens draw uses a class that a served stylesheet defines (`interface-shell` R56). *(not yet met: T48)*
  - Where the design draws the element, the screen uses the design's own class: an `mk-*` class as `shell.css` carries it, and a `cs-*` class the design spells `mk-*` (`cs-frontgrid`, `cs-signin`, `cs-fronthead`, `cs-flogo`, `cs-facts`, `cs-note`, `cs-sub`, `cs-small`, `cs-steps`, `cs-passage`, `cs-strengthbox`, `cs-gapblock`, `cs-pickc`, `cs-areas`, `cs-table`) is renamed to the design's spelling. A class the design does not draw is mapped to the kit's or a design class; only where none fits does `interface-shell` carry its style (its R56), with an ASK to UX-DESIGN to draw it (K3254 (1)).
  - Every labelled field is drawn with `cs.field`. No screen draws `cs-form` or a bare `<label>` with `.help`.
  - A section, tray, list, block or reading that holds nothing is not drawn. No count, reading or "finished by" is drawn at zero. A screen with nothing at all to show draws its one designed empty state, which names the first step. (DEC-219 (3) applied to every screen is BOB's reading of K3052, K3254 (5); the designed screen-level empty states are kept.)
  - A read that failed is still drawn as failed (`interface-shell` R10).
  - It covers `cs-codes` and `cs-shown`, which become the design's classes or `HOOK_CLASSES`.

  Test: the module's real `SCREENS` compose under `interface-shell` R56, and each screen drawn over an empty fixture shows no empty section and no zero. Control: a failed read is drawn `state.failed`.
- **R13** (T48; K3240, K3250, K3254 (3); walk rows 4, 10; amends R1) At desktop widths `front` draws the design's two columns (`mk-frontgrid`): the group's page on the left, and the sign-in card (`mk-signin`) on the right, visible without scrolling at 1280 px. At the phone width it is one column. Its head (`mk-fronthead`) shows the logo or monogram and the group's name in the serif title, or "Your group" while none is set, never the slug. Test: at 1280 px the sign-in's box lies above the fold. Control: an unnamed group shows no slug. *(not yet met: T48)*
- **R14** (T48; K3250, K3254 (3); walk C8, row 4; amends R6; `instance-setup` R6, R10) `setup`'s first part after the codes asks the group's name (`groupnameset`), before any other part, and says where the name shows. Skipping it leaves "Your group", and Home's first step "Name your group" (`screens-daily` R23). Test: the name is the first part. Control: a skip keeps the step open. *(not yet met: T48)*
- **R15** (T48; K3240, K3254; T48-84's lede clause; amends R6; worker's wording from the plan entry, for BOB's review) On a claimed instance `setup` does not draw `screen.setup.lede` ("Claim what you just installed…"): the lede follows the claimed state, and the claimed state draws only its own "already been claimed" box. Test: a claimed instance's `setup` draws no lede. Control: an unclaimed one draws it. *(not yet met: T48)*
- **R16** (T48; K3240, K3254; T48-84's `published` clause; worker's wording from the plan entry, for BOB's review) `published` opened with no id, to a signed-out reader, offers the way an outsider can go (the group's public page), never "Go to Home". Test: signed out, a bare `published` links the public page. Control: no "Go to Home" is drawn. *(not yet met: T48)*

## Private

### Uses

- `interface-shell`: the kit (its R21, R30).
- `setup-words`: `WORD_ROWS` keys.
- `instance-setup`: `HOSTING_CONTROL` (its R47; R4, R6), a `modules.json` edge to an earlier module (T47-86).
- Through the plane: the ops each screen names (R1–R7), as `op-declarations` declares them.
- Tests only: `op-declarations` (`OPS`).

### Invariants

- **R8** No password, one-time password, recovery code, reset or invitation link typed or shown here is written to the browser's storage, an address, a log or a later request; every fragment is removed on load. Test: sentinels across every flow.
- **R10** (Invariant) No place is named in this module's behaviour or words.

### Satisfies

- Registry screens `front`, `tour`, `forgot`, `reset`, `setup`, `join` (`docs/development/ux-substrate/screens/registry.json` at PR #33's head); their drawings in `mock-screens.js` at that commit.
- N999, N1002, N1005; DEC-201 (1), (2), (5), (6) (R1, R2, R4, R6, R7); DEC-202 (1)–(4) (R1, R2, R4, R7); DEC-205 (5) (R3, R5); K3052 (R11); K3053 (R6).

### Suggestions

- "Set up and claim" has no runner in the setup frame: the setup screen's parts are its steps; the required wizard is offered by the installer's hand-over only (doubt 13 of the fold draft; HANDOFF).
- The screens' own sentences are held in `SCREEN_WORDS` (`screen.<id>.<part>`) until the design stream adopts them.

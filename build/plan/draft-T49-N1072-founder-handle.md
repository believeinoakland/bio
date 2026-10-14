# Draft: T49, N1072: the founder chooses her own handle (Bob's K3265)

**Status** · BOB's draft text for T49 (P18), not applied. Read in full: `requirements/README.md`, `credentials.md`, `membership.md`, `instance-setup.md`, `screens-entry.md`, `installer.md`, `setup-words.md`, `signin-door.md`, PROCESS-MECHANICS §3. Greps run over all `build/requirements/*.md` (for `admin` as a handle, `founderhint`, `R141`, `claim(`) and over `bio-plane/src`, `newgroup/src` (for where the founder's id `admin` reaches a reader). Next free ids: credentials R74 (highest R73), membership R144 (R143), project-roster R29 (R28), screens-entry R12 (R11), control-plane R95 (R94), op-declarations R71 (R70).

**What exists today.** `credentials` R67 resolves the handle `admin` to the founder. `membership` R141 reserves `admin` and R92 answers the founder's `handle: null`. `screens-entry` R2 draws `signin.founderhint` ("Did you set this group up? Your handle is admin."). R6 signs in "as handle `admin`". Its own `SCREEN_WORDS` hold `screen.forgot.handle.help` (the same sentence) and `screen.setup.claimed` ("…signed in as admin…"). `project-roster` R27 answers the founder as `{member: "admin", handle: "admin"}`, and its R1 participants list falls back to the id `admin` (`project-roster/index.mjs`:174–181, 688). `control-plane` sends `claim` only `{role: "admin", password}` (`control-plane/index.mjs`:736). `credentials.login` defaults `role` to the founder when no handle is sent (`credentials/index.mjs`:443), so a `login` with no handle is the founder's sign-in.

---

## membership

- **R144** (T49; N1072; Bob's K3265; amends R92, R141) **The founder's own handle.** `founderHandleSet({handle, by})` records the handle the founder signs in and is known by. It is called in-plane by `credentials`' claim (its R74), inside the claim's act (the caller's transaction), and is also served as `op=founderhandleset`, the founder's own act under her session, for a group claimed before T49 (credentials R75). Refusals, in order, each writing nothing:
  - a `by` that is not the founder (`admin` or `member:admin`), a machine credential included: `FOUNDER_HANDLE_NOT_FOUNDER` (C-96, next free number);
  - a founder handle already held: `HANDLE_FIXED` (R129's row; a handle is chosen once and never changed, DEC-197);
  - R16's `NO_HANDLE`, `BAD_HANDLE` and `HANDLE_TAKEN`, judged exactly as R16 judges them (R12's pattern; every member's current and earlier handle; `admin`, R141).

  On success it holds the handle and answers `{ok: true, handle}`. `founderHandle()` answers the held handle, or `null` while none is held. It writes nothing and never throws.

  From then on:
  - R16's and R123's `HANDLE_TAKEN` comparison also takes the founder's handle.
  - R92's `sessionRights("admin")` answers it as `handle`. So `credentials` R5 and `whoami` (`control-plane` R18) name it, `null` until one is held.
  - R141 reads: `admin` is the founder's internal member id only, the handle of no one, the founder included.

  The founder's member id stays `admin` everywhere: R43, R44, R64, R86 and R94 are unchanged, and no viewer, stamp, `author` or participation row changes. Its table is this module's, declared through `record-core.declareTable`, `export: "never"`, exempt from purge as R115's members are. The pre-auth answer of R132 still names no handle: its test fixture gains a founder handle. *(not yet met: T49)*
  - Tests: an in-plane set by `admin` holds the handle, `sessionRights("admin").handle` answers it, and `handleCheck` answers it `taken`. Controls, one per refusal: `by` a member's id refused `FOUNDER_HANDLE_NOT_FOUNDER`; a second set refused `HANDLE_FIXED`, the first handle kept; `admin` (any case) and a member's earlier handle each refused `HANDLE_TAKEN`; `Bad Handle!` refused `BAD_HANDLE`. Also: `enroll` with the founder's handle is refused `HANDLE_TAKEN`, while a free handle enrols. The R132 census holds with the founder's handle in the store.

## credentials

- **R74** (T49; N1072; K3265; amends R1, R38) **The founder chooses her handle at the claim.** `claim({password, handle, tokenFp, source, country})`.
  - On a claim with no founder handle held (`membership.founderHandle()` null), whether a first claim or a re-armed one, `handle` is required. It is judged and recorded by `membership.founderHandleSet({handle, by: "admin"})` (its R144) inside the claim's act, after R1's `SIGN_IN_PAUSED` and `PASSWORD_TOO_SHORT`. Its refusal is answered as given, and neither password nor handle is written.
  - On a re-armed claim with a handle held, `handle` absent or equal to it is accepted, and any other is refused `HANDLE_FIXED` (`membership` R129's row), writing nothing.
  - A refused claim counts toward R38's window and R44's tally as before. Success answers `handle`, the founder's held handle; that answer reaches only the holder of the bootstrap credential (`control-plane` R15).

  *(not yet met: T49)*
  - Tests: a first claim with a free handle sets the password and the handle, and `login` with that handle succeeds. Controls: a claim with no `handle` is refused `NO_HANDLE`, `admin` `HANDLE_TAKEN`, and a malformed handle `BAD_HANDLE`, each writing neither password nor handle and each counted under R38. A re-armed claim naming another handle is refused `HANDLE_FIXED`; one naming none keeps the handle and answers it.
- **R75** (T49; N1072; K3265; amends R4, R47, R67) **Signing in by the founder's handle.** `login` and `recover` resolve `handle` as follows:
  - the founder's handle (`membership.founderHandle()`) names the role `admin`;
  - a member's handle names `member:<id>` (`membership.memberByHandle`, as R67);
  - `admin` names the role `admin` only while no founder handle is held (a group claimed before T49, until its founder chooses once, `membership` R144's op). Once one is held, `admin` is a handle no one holds.

  `role` is no longer read by either service, and a call naming no handle, an empty one, or a handle no one holds is answered as an unknown handle: `SIGN_IN_REFUSED` (R4) or `RECOVERY_REFUSED` (R47), with the one fixed detail, at the one cost. Each resolution makes the same reads whichever arm holds (`founderHandle` and `memberByHandle` both asked every time), so neither the answer nor its time tells whether `admin` once named the founder or whether the founder has chosen. A refused `admin` counts under R38 as an unknown handle's role (`handle:admin`), never the founder's, so attempts on it never pause her sign-in. *(not yet met: T49)*
  - Tests: with a founder handle held, `login` and `recover` by it succeed as the founder. Controls:
    - `admin` with the founder's right password answers `SIGN_IN_REFUSED`, its answer and timing class equal to an unknown handle's;
    - the same for `recover` with a valid founder code, `RECOVERY_REFUSED`;
    - a `login` with no handle is refused, not signed in as the founder;
    - with no founder handle held, `admin` and the password still sign in (the transition), and the next `admin` sign-in after `founderhandleset` is refused;
    - ten refused `admin` attempts do not pause the founder's own handle.

## project-roster

- **R29** (T49; N1072; K3265; amends R1, R27) Wherever this module names the founder to a reader, it names her by `membership.founderHandle()` (its R144) and never by the id `admin`. That covers R1's participants, the deciders and targets of R6's decisions, R2's removals, R21's and R24's `by`, and R27's `owner`, which reads `{member: "admin", handle: <her handle>}`. While she holds none, `handle` is `null` with `founder: true`, for the screens to draw in their own words (owed by the UX design stream). *(not yet met: T49)*
  - Tests: with a founder handle held, `projectlist` and `projectparticipants` answer it for a project she opened and joined. Control: with none held, no answer holds the string `admin` as a handle, at any depth.

## screens-entry

- **R12** (T49; N1072; K3265; DEC-201; amends R2, R4) The sign-in panel's handle field and `forgot`'s handle field carry no founder hint: `signin.founderhint` and `screen.forgot.handle.help` are withdrawn (this module neither reads nor holds them), and no word drawn here tells anyone a handle. A field's help, if any, is owed by the UX design stream. *(not yet met: T49)*
  - Test: `front` and `forgot` drawn in every state hold neither key and no text naming `admin`. Control: both handle fields are still drawn and send `handle`.
- **R13** (T49; N1072; K3265; amends R6) **setup**'s claim asks, beside the password typed twice, the handle the founder chooses: a new claim-step field, its label and help owed by the UX design stream (held in `SCREEN_WORDS` as `screen.setup.handle` until the stream adopts them). It sends `claim` with `password` and `handle` in the body only, and draws `NO_HANDLE`, `BAD_HANDLE`, `HANDLE_TAKEN` and `HANDLE_FIXED` by their keys, keeping the handle and clearing the passwords. On success it sends `login` with the `handle` the claim answers (device own), never `admin`. `screen.setup.claimed` names her handle (`{handle}`) and never `admin`. *(not yet met: T49)*
  - Tests: a fake plane walked from the claim with a chosen handle sends that handle to `claim` and to `login`. Controls: a refused handle keeps the step and sends no `login`; no request or drawn word in the flow holds `admin` as a handle.
- **R14** (T49; N1072; K3265; `membership` R144; `credentials` R75) **The founder of a group claimed before T49 chooses her handle once.** After a sign-in whose session is the founder's with no handle (`whoami`: `rootOfTrust: true`, `handle: null`), the screen opens a step in the setup frame before Home. The step asks a handle and sends `founderhandleset` with `handle` in the body only, drawing R13's refusals by their keys. On success it says which handle she signs in with from now on (words owed by the UX design stream) and opens Home. "Later" opens Home and leaves `admin` working. The step is offered at each such sign-in until a handle is held, and never to anyone else. *(not yet met: T49)*
  - Tests: a fake plane answering `handle: null` for the founder draws the step, and a chosen handle is sent. Controls: a member's session and a founder holding a handle never see it; "Later" sends nothing.

## control-plane

- **R95** (T49; N1072; K3265; amends R15; `op-declarations` R71) `claim` passes `handle` from the body beside `password` (still checked against the bootstrap credential first, R15), and the claim's answer is relayed with its `handle`. `founderhandleset` is routed through `membership`'s map, refused to any caller not arriving by the founder's own session, with `by` from the session (R17) and `handle` from the body. *(not yet met: T49)*
  - Tests: a claim's body `handle` reaches `credentials.claim`. Control: a `founderhandleset` under a member's session or the bootstrap credential is refused at the door, with nothing sent to the store.

## op-declarations

- **R71** (T49; N1072; K3265; `membership` R144) `OPS` holds a spec for `founderhandleset`, in `membership`'s family, in `SESSION_OPS.admin` only (the founder's session), classes `admin`, `machineClasses: []`, mutating, `by` stamped, `handle` a body field, `NEEDS` `null`, in neither `GOVERNANCE_ACTIONS` nor `IDENTITY_ACTIONS`, not on `AI_GRANT_OPS`. `claim`'s spec gains the body field `handle` where it lists body fields; it is otherwise unchanged (still public). *(not yet met: T49)*
  - Test: the spec as stated. Control: `founderhandleset` is not in `SESSION_OPS.member`.

## No line needed (BOB to confirm)

- **instance-setup.** It does not perform the claim (that is `credentials` R1 and `control-plane` R15). Its `bootstrap` (R17) relays `credentials` R2, which names nobody, and `membership` R132 already forbids a handle in that answer (its test fixture gains the founder's handle, R144). No word of its own names `admin`.
- **installer.** Its pages and final panel name no handle (`newgroup/src` checked). R51's hand-over to `/app/setup#boot=` is unchanged.
- **setup-words.** It carries `words.json` as the design stream gives it. `signin.founderhint` leaves `WORD_ROWS` at the next re-take after the stream removes it, and the new claim-step field's words arrive the same way. Until then the row is carried and unread (screens-entry R12's test).
- **signin-door, admission.** These are untouched. `admin` there is a binding class or session kind, not a handle.

## Plan entries (T49)

- **T49-? · membership** · (N1072, K3265) R144: the founder's own handle, `founderHandleSet` (in-plane at the claim and `op=founderhandleset`), `founderHandle()`, the handle taken for R16 and R123, `sessionRights("admin").handle`, R141 re-worded (`admin` is an id only) · text BOB's · first in L2.
- **T49-? · credentials** · (N1072, K3265) R74: `claim` takes and records the founder's handle; R75: `login` and `recover` resolve her handle, `admin` only until a pre-T49 founder chooses, `role` no longer read, refusals at one cost · text BOB's · after membership.
- **T49-? · project-roster** · (N1072, K3265) R29: the founder named by her handle, never `admin`, in the participants list and in `projectlist`'s owner · text BOB's · after membership.
- **T49-? · op-declarations** · (N1072) R71: the `founderhandleset` spec and `claim`'s `handle` field · text BOB's.
- **T49-? · control-plane** · (N1072) R95: `claim` passes `handle`; `founderhandleset` routed to the founder's session only · text BOB's.
- **T49-? · screens-entry** · (N1072, K3265; DEC-201 words owed by UX-DESIGN) R12: the founder hint withdrawn; R13: the claim asks her handle and signs in by it; R14: a pre-T49 founder's one-time choice · text BOB's; words owed by the UX design stream (NOTICE).

(N1072 names instance-setup and installer: no line for either; see above.)

## Open doubts

**Technical (BOB's; recommendation first):**

1. **Where the handle lives.** In `membership`, beside every other handle, so the "taken" rule stays one comparison (recommended). Not in `credentials`' bootstrap row.
2. **No live check at the claim.** `handleCheck` needs an invitation or a member's session, and the claimer has neither. I recommend not adding a bootstrap-credential arm: the claim's own refusals are drawn on submit. On a fresh group the only handle taken is `admin`.
3. **Re-armed claim.** Once held, the handle stays (DEC-197), and the claim answers it to the bootstrap credential's holder, who controls the group anyway. A pre-T49 group re-armed must choose one then (recommended).
4. **New op versus reopening `handlechange`.** I recommend a new `founderhandleset`, which leaves R129's "refuses every call" intact.
5. **`FOUNDER_HANDLE_NOT_FOUNDER` and `HANDLE_FIXED`.** Recommended: a new C-96 row for a non-founder `by`, and reuse `HANDLE_FIXED` for a second set. Its sentence ("chosen when a member joins") then fits the founder only loosely, so it is returned to the UX stream to re-word.
6. **The `role` hole.** Today a `login` with no handle signs in as the founder (`credentials/index.mjs`:443). R75 closes it (no handle is an unknown handle). Any in-plane test that relies on the default must name the handle.
7. **Census.** Other places may show the founder's id `admin` to a reader:
   - `screens-wizards/guide.mjs`:210, an `asked_by` falling back to `me.member`;
   - `instance-setup`'s `asked_by` labels (R65, R67), which hold a stamp;
   - `tasks`, `case-disclosures` and `case-tensions`, which read `memberFacts(...).handle`. That returns `null` for `admin` today, so these show nothing, not `admin`.

   I recommend that each T49 job's START greps its own module for the founder's id reaching a reader, and that `journey-check` gains one walk asserting that no screen draws `admin` as a name. A finding joins that job's text at START as a line like project-roster R29.
8. **Order.** membership comes before project-roster and credentials (all three in L2). op-declarations, control-plane and screens-entry come in L11. This is all within T49's existing layers.

**Bob's (they change what members see beyond the ruling; options and recommendation to be brought to him):**

9. **Where and how a pre-T49 founder is asked to choose.** Recommended: R14's step after each such sign-in, with "Later" allowed and no deadline. The alternatives are a blocking step (safer, since it retires `admin` at once, but it can lock a founder out of her Home until she chooses) or an item on Home only. The ruling says "until she chooses once", which allows either.
10. **Can members now name the founder by her handle in project acts?** Today the founder has no handle, so `projectInvite` by handle cannot reach her (`membership` R32, R119). With a handle she could be invited like anyone. Recommended: not in T49 (R119 unchanged; `projectinvite` with her handle answers `NO_SUCH_HANDLE` while `handlecheck` says `taken`), and a new N entry brought to Bob.
11. **How the founder is shown before she chooses.** Today she is shown as `admin`. After T49 she is `handle: null` with `founder: true` (project-roster R29), drawn in words the UX stream owes ("the group's founder", say). That is a new visible label: the UX stream's words, and Bob sees it.

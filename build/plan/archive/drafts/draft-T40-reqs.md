# T40 — requirement texts to draft before each layer's START (draft for BOB)

**Status** · Drafted 2026-10-08 by a worker for BOB #144 on `tranche/T40` (P18). Not applied: BOB words, applies each module's text to its file before that layer's START (`current.md` rule 1, K2343's pattern), and records once (`rulings.md`). Every new id is the next free one of its file, read today; every new or amended line is marked `*(not yet met: T40)*`. N812's part C (`draft-T40-N812.md`, K2373, K2376) is binding and is placed here, not re-drafted. Points that may be Bob's are in §Z, apart from the text.

**Sources read whole:** `current.md`; `draft-T40-N812.md`; `requirements/README.md`; PROCESS-MECHANICS §3, §7; `rulings-active.md`; requirements of membership, credentials, case-carriage, publication, case-disclosures, queue §Public; inquiry §Public; the relevant parts of public-read, ratification, op-declarations, op-grades, control-plane, admission, case-grammar, promotion, filings, instance-setup, store-door, wizard-scripts, run-rules, notice-producers. On `main` @ `fc8d9c9f36`: `docs/development/DECISIONS.md` DEC-179–DEC-187 (lines 2795–2930), `BIO_Interaction_Constructs_v0_1.md` §V (lines 907–967), `ux-substrate/screens/words.json` (`photo.*` lines 471–556, `handle.*` lines 559–592). Rulings K1881, K2282, K2348, K2350, K2352, K2353, K2370, K2371, K2373, K2376, K2380, K2383, K2387, K2389. `archive/next-T40.md` lines 12–24 (N797–N819). Row census run today on the tranche (`row-census.test.mjs`: 1 fail, five arrivals).

---

## L2 · membership (T40-M)

Next free id: R123 (R121 is the last held, `membership.md`:172; R122 is N812's).

### N812 (placed from part C, `draft-T40-N812.md`:117–119; binding, K2373)

- **R122** (K231; for `credentials` R54–R57) *(not yet met: T40)* `notTheOwner(by, projectId)` is a module-level function: the one answer `PROJECT_ACT_NOT_THE_OWNER`, with its existing row, and shaped as R84's.
  Placed after R121, under a heading of its own as R84's is (`membership.md`:148). Its row is C-56.2 (`membership/checks.mjs`:346); its `where` moves to this function, a row change for T40-4 (below).
- **R83**, its T40 sentence, appended after the T39 sentence (`membership.md`:159) *(not yet met: T40)*: "(N812 B10; K2373, K2389, K657; T40) The list gains `ai-use` in layer 6, directly after `run-rules` and before `ai-runs`, as `build/modules.json` holds it after T40's opening; until its job merges with its `paths` set, the test tolerates it by name as not yet built (R83's T33-19a rule), and the test pins its place between `run-rules` and `ai-runs`." (`modules.json` today: `run-rules`, `ai-use`, `ai-runs`, ai-use with empty `paths`; K2389.)

### N797 · `handlecheck` (DEC-184; K2282, K2376 (4); `next-T40.md`:12)

Placed under "Invitations, enrolment and the roster", after R98:

- **R123** (DEC-184 (2), (3), DEC-186 (3); K1881; N797) *(not yet met: T40)* `handleCheck({invite, handle, viewer})` (`op=handlecheck`) answers whether `handle` could be taken in this group now, as a person types it. It is asked with a live invitation (`invite`, as R15 reads one) or by an active member (`viewer` naming one, for R124's change); otherwise it answers R15's `NO_SUCH_INVITATION` byte for byte, a spent, expired, withdrawn or unknown invitation alike (R97). It answers `{ok: true, handle, state, problems, suggestion, words}`:
  - `state` `not_allowed` when `handle` fails R12's pattern (2–41 of `a-z0-9-`, starting with a letter or digit), `problems` then naming each: `length`, `start`, and `characters` with the characters that do not fit;
  - else `taken` when R16 would refuse it `HANDLE_TAKEN` (R124's earlier handles included), `suggestion` then a handle R12 admits that is free, made from `handle` by adding `-2`, `-3`, … (the smallest that is free; null when none fits 41 characters);
  - else `free`.

  `words` is the key and its English as `words.json` holds them, read by key (`handle.free`, `handle.taken`, `handle.characters`), placeholders left for the screen. The answer never says who holds a handle, whether that member is active, or whether the handle is someone's earlier one: `taken` is one answer. Each call counts against a two-bucket window (`credentials` R38's form; `capture` R31's) of 60 checks in any 10 minutes per invitation, or per member when asked by `viewer`; at 60 it answers `HANDLE_CHECK_PAUSED` with `stated` and `retryAfter`, before the handle is read. It writes only its count, and never throws. (The per-source window over every public op is `admission` R21's.)

### N799 · `handlechange` (DEC-186, Bob's "S18: B"; K2282, K2376 (4); `next-T40.md`:14)

- **R124** (DEC-186 (1)–(3)) *(not yet met: T40)* `handleChange({handle, by})` (`op=handlechange`) is a member's change of their own handle. Refusals, in order, each writing nothing: `HANDLE_CHANGE_NOT_A_MEMBER` when `by` names no active member (a machine credential, an operator token, the founder's `admin`); `NO_HANDLE`, `BAD_HANDLE` as R16; `HANDLE_FIXED` naming the case and edition, when R125's guard answers that the member's work appears in a published case (its translation `words.json`'s `handle.fixed`, read by key, `{case}` the case named); `HANDLE_CHANGE_UNCHECKED` when no guard is registered, or it throws or answers anything but null or a case (fail closed); `HANDLE_TAKEN` as R16. A `handle` equal to the member's current one answers `{ok: true, unchanged: true}`, writing nothing. Otherwise, in one act, the member's handle becomes `handle` and `{member, from, to, at}` is appended to the member's handle history; it answers `{ok: true, handle, formerly}`. The member's next request reads the new handle (`credentials` R5 reads R92 at each call).
  - **Earlier handles.** A handle any member held before stays taken for every other member, at R16 and here, so "formerly" never names another member; a member may take back an earlier handle of their own (§Z1).
  - **Seen by members.** R17's rows carry `formerly`, that member's earlier handles, latest first, to every caller R17 answers (DEC-186 (2): "inside the group"); R68, R119 and R92 answer the current handle only.
  - **Published cases keep the handle they were signed with:** a handle change rewrites no signed document, published row or stored record (signed bytes are `publication`'s, its R24).
- **R125** (DEC-186 (1); K2376 (4); R116's form) *(not yet met: T40)* `registerHandleGuard(module, fn)`: one later module (`publication`, its R76) registers once at start; a malformed registration is refused `LISTENER_MALFORMED` and a second, whoever makes it, `LISTENER_DECLARED` naming the holder, both through R81. R124 calls `fn({memberId})` synchronously inside its act, before any write; `fn` answers null (no work of the member's in a published case) or `{case, edition}` naming one, or `{unreadable: true}`. This module never reads another module's tables to decide it.
- **R16, amended** (DEC-184 (1); DEC-186 (2)) *(not yet met: T40)*, its `HANDLE_TAKEN` clause to read: "`HANDLE_TAKEN` (exact comparison with every member's current handle and every handle a member held before, R124)".
- **R17, amended** *(not yet met: T40)*: append "(T40; DEC-186 (2)) Each row carries `formerly`, the member's earlier handles (R124), latest first, `[]` for none."
- **R57, amended** (invariant) *(not yet met: T40)*: append "A handle history row (R124) is never deleted or rewritten."
- **R126** (K6; K231) *(not yet met: T40)* The new codes are rows of this module's own C-96 family, the next free numbers at the job's START (C-96.48 onward; C-96.47 is the last held, `membership/checks.mjs`:203), each with its test: `HANDLE_CHECK_PAUSED`, `HANDLE_CHANGE_NOT_A_MEMBER`, `HANDLE_FIXED` (translation `handle.fixed`: "Your handle is fixed: your work is in a published case ({case})."), `HANDLE_CHANGE_UNCHECKED` (BOB's draft, re-wordable by the UX stream: "Whether your work is in a published case could not be checked, so your handle was not changed. Try again."). They await T41's stamp only if this job merges after T40-4; membership merges first in L2, so T40-4 stamps them.
- **Uses, Private:** unchanged (the guard is registered, not used). **Tables:** the handle history is declared exempt from purge with members (R115).
- **Satisfies** add: "DEC-184 (the handle checked as typed: R123), DEC-186 (Bob's "S18: B": R16, R17, R123–R125), K1881 (R123's window)."
- **Status** line: "Last changed T40 (T40-M: R16, R17, R57, R83 amended; R122–R126 new; N797, N799, N812; DEC-184, DEC-186; K2373, K2376); those marked not yet met (T40)."

`handle.changeable` and `handle.formerly` are the screens' words (they carry no refusal), read by the screens from `words.json`; nothing here answers them.

---

## L2 · credentials (T40-3): part C placed against the current file

Next free id: R54 (R53 is the last, `credentials.md`:43). Part C's R54–R59 take R54–R59, none held. Placement:

| part C text (`draft-T40-N812.md`) | goes in `credentials.md` | note |
|---|---|---|
| Purpose, amended (:84) | Purpose (:9) | the second replacement covers the whole sentence "There is no project-level Claude account, … (K1755, R33–R36)." |
| R54, R58, R59 (:85–90, :112, :113) | a new heading "**A project's AI account (D34; K2352, K2353)**" after R36 (:57) | |
| R55 (:91–96) | a new heading "**Kinds of use and their switches (B2)**" after the project's account | |
| R56 (:97–105) | directly after R35 (:55), amending it | |
| R57 (:106–111) | after R52 (:91), under "Keeping the group's material away from AI" | |
| R30, amended (:114) | R30 (:72), the sentence appended | |
| Uses (:115) | Private, Uses, `membership` line (:104) | add `isJoinedParticipant`, `sight`, `notTheOwner` (R122); `isProjectOwner` |

**Conflicts with the current text** (each needs a line BOB words; none changes a meaning Bob ruled, except as §Z says):

1. **Purpose vs R54 (K2353).** Part C's Purpose says "A project may hold one Anthropic API key (D34, A1; R54)", but R54 (K2353) also allows the sole member's own sign-in. Reading: "A project may hold one AI account: an Anthropic API key, or, while it has one member, that member's own sign-in (D34; K2353; R54)". The kept clause should keep "not by a rule of Anthropic's" (`credentials.md`:9).
2. **R24 vs R56.** R24 admits `act.kind` `ask | run | standing` only and refuses any other `NOT_YOUR_ACCOUNT` (:48); R56 passes `draft` (store-door R10, instance-setup R65/R67 resolve drafts). R24 amended: "`act` is `{kind, member}`, `kind` a `USE_KINDS` entry other than `explore` (R55)".
3. **R25, R37 vs R55.** R25's `accountSwitchSet` and R37's `groupSwitchSet` set `suggestions`/`standing`; R55 adds `accountUsesSet` over the same stored switches. Reading (BOB's): both kept as names of the one setting, each amended: "(T40) Its two switches are two of R55's; this act sets them as `accountUsesSet` does." R25's "removing the reference turns both off" extends to every R55 switch of that reference.
4. **R55's `explore` value.** `accountUsesSet({owner, switch, on, by})` takes a boolean `on`, but `explore` holds `no | ask | yes` (B6, K2350). Reading: for `switch: "explore"`, `on` is one of the three words; any other value is refused `UNKNOWN_SWITCH`… which is a second condition on one code (K231). Recommend a new code `SWITCH_VALUE_INVALID`, naming the values. `owner` is spelled as ai-use R1's (`group`, `project:<id>`, `member:<id>`).
5. **R23, R34, R52 answers.** `accountReferenceState` answers `{…, suggestions, standing}` (:47) and `groupKeyState` R37's two switches; each should answer R55's switches and `explore`. `aiKeepAwayState` (R52, :91) should answer `uses` (R57).
6. **R27 has no project.** `aiGrantMint({member, by})` refuses `NO_ACCOUNT` from R35 without a project (:63), so a member whose only account is a project's key cannot ask in that project (answers R30 carries `project`). Amend R27: it takes `project?` (a project the member has joined), asks R56 with `{kind: "ask", member, project}`, and refuses `PROJECT_KEY_NOTICE_DUE` (R58) as it refuses `GROUP_KEY_NOTICE_DUE`.
7. **R54 `projectSigninSet` with no sign-in.** No refusal is stated when the acting owner is not connected (R43). Reading: a new code `SIGNIN_NOT_CONNECTED` (BOB's draft words), never `NO_ACCOUNT` (a different condition).
8. **R56's "refused as R54's absence".** A member who sees the project but has not joined it (an administrator) is answered as absent; elsewhere that condition is `PROJECT_ACT_NOT_A_PARTICIPANT` (membership R55). Reading: absent at `NONE`/`EXISTENCE` (membership R44, R77), `PROJECT_ACT_NOT_A_PARTICIPANT` for a member with sight who has not joined.
9. **Codes.** B11 lists two new credentials codes; part C also mints `PROJECT_NOT_SOLE_MEMBER` (R54) and `PROJECT_KEY_NOTICE_DUE` (R58); with 4 and 7, also `SWITCH_VALUE_INVALID`, `SIGNIN_NOT_CONNECTED`. All C-29, next free at the START, stamped by T40-4 (credentials merges before promotion).
10. **"Only participant".** R54/R59 count "any other participant (owners included)". Reading (K2353's BOB detail, "a second member's join"): participants `joined` or `leaving` (membership R54's `isJoinedParticipant` set); an `invited` member does not yet suspend the account.
11. **Status** line: "Last changed T40 (T40-3: Purpose, R24, R25, R27, R30, R35, R37, R51, R52 amended; R54–R59 new; N812; D34, D37, D38; K2350, K2352, K2353, K2373); those marked not yet met (T40)." **Satisfies** add D34, D37, D38 C, D39 (INVESTIGATION-DESIGN H4–H7) and K2350, K2352, K2353.

---

## L2 · promotion (T40-4): the stamp

**No requirement changes** (T38-6's pattern: "req: none (a stamp)", `archive/T38.md`:71; T35-16's Status, `promotion.md`:3). The stamp moves `CATALOG_VERSION` from 1.66.0 and re-pins `ROW_CENSUS` (R34, R50) over the tree after membership's and credentials' merges.

**Rows awaiting stamp at T39's close** (census run today on `tranche/T40`: 1,556 rows against the 1.66.0 pin of 1,551, `51c6423a…`; five arrivals, no departure or change):
- C-120.20 `DOCUMENT_COPY_UNDETERMINED`, C-120.21 `DOCUMENT_COPY_PENDING`, C-120.22 `DOCUMENT_NOT_CLEANABLE` (case-disclosures R22; K2378);
- C-122.7 `DOCUMENT_COPY_CHANGED_SINCE` (publication R33; K2370);
- C-141.11 `DOCUMENT_COPY_NO_STORE` (case-carriage R15; K2377).

**T40's L1–L2 rows:** membership's C-56.2 `where` (R122) and R126's four C-96 rows; credentials' new C-29 rows (part C's B11 and the conflicts' 4, 7, 9). L1 adds none (K2390: record-grammar R39 and pdf-reader R22, R38 mint no row).

**Status** line: "Last changed T40 (T40-4: a stamp of the rows R34 and R50 count, awaiting stamp at T39's close and minted by T40's L1–L2 jobs; no requirement changed; K2370, K2377, K2378)."

---

## L6 · inquiry (T40-5): N814

**R39, re-written** (Bob, 2026-10-08, in H10: "When a question is deferred, it's deferred for that project. But that won't result in it being deferred in another project. Same with dismissed."; K2371) *(not yet met: T40)*:

> **R39** (K2371; N814) Deferral and dismissal are each project's own act on its own relationship to a question: one project's set-aside never moves the question for another project, and no set-aside is shared. A member of the set that any project draws on (a project whose document holds a `cites` reference to it not marked `severed`, counted over every project whatever the viewer sees, through `leg-earning.projectsDrawingOn`, its R7) is not moved: the set is refused `DRAWN_ON_BY_A_PROJECT`, naming each such member and no project, and how many projects draw on it is never asked, answered or stated. Each project sets it aside for itself through `queue`'s `op=proposedispose` project arm (its R27). R20–R21's shared move is only for a question no project draws on. `divide` and `ground` stay shared acts, because they change what the question is.

- Its code: `DRAWN_ON_BY_SEVERAL_PROJECTS` (C-106.1, `inquiry/index.mjs`:109) retires, its number never reused (a different condition, K231); `DRAWN_ON_BY_A_PROJECT` takes C-106.2, BOB's draft words, re-wordable by the UX stream: "Each project sets this question aside for itself. Set it aside for your project from the project's questions. Nothing was changed." Awaits T41's stamp (rule 4 (2)).
- R20's last clause "`CITED` for a dismissal while `restsOnLive` holds any leg" stands.
- **Status:** "Last changed T40 (T40-5: R39 re-written; N814; K2371); R39 not yet met (T40)."

## L11 · queue (T40-21): N814

**R27, appended** (K2371; N814) *(not yet met: T40)*:

> (T40) A question's set-aside is always this project arm: one project's decision, kept for that project alone (R13), never a move of the question's own state, which `inquiry` R20–R21 make only for a question no project draws on (`inquiry` R39). No refusal of this arm depends on how many projects draw on the question, and none names another project.

R18 and R28 stand. N812's queue kinds (K2376 (2)) are in the L11 section below.

---

## L8 (rule 3): N798, N811, N799, N816, N818

### case-carriage (T40-12)

Next free id: R18 (`case-carriage.md`: R1–R17).

- **R11, its last sentence re-written** (DEC-185 (1), DEC-187 (2); K2248, K2348 (1)) *(not yet met: T40)*: "`OBSCURED_LABEL` is `words.json`'s `photo.obscured.label`, read by key: "Faces, plates and camera details removed for publication; the group holds the original", for a copy with a covered area; `PUBLISHED_LABEL` is `photo.published.label`: "Camera details removed for publication; the group holds the original", for a copy with nothing covered. Both are exported and held once here, protected words held for translation (DEC-179); the design stream re-words them under their keys." A derived copy's stored label follows: `OBSCURED_LABEL` when it covers an area, else `PUBLISHED_LABEL` (today none, `case-carriage/index.mjs`:754).
- **R14, its last sentence re-written** (DEC-187 (3); K2348 (1)) *(not yet met: T40)*: "The four refusals' translations are `words.json`'s, read by key, protected (DEC-187 (3)): `MACHINE_CANNOT_WITHDRAW_MARK` (C-141.7) `photo.withdraw.refused.machine`; `NO_SUCH_MARK` (C-141.8) `photo.withdraw.refused.nomark`, `{photo}` the photo named; `MARK_ALREADY_WITHDRAWN` (C-141.9) `photo.withdraw.refused.already`, `{member}` and `{date}` who withdrew it and when; `WITHDRAW_NO_REASON` (C-141.10) `photo.withdraw.refused.noreason`. They replace BOB's drafts." Four row changes, T41's stamp.
- **R15, its `copyWake` bullet amended** (N816; K2380) *(not yet met: T40)*: append "While no evidence store or bucket is bound, `copyWake` answers null, whatever is queued (as `file-safety` R39 answers no scan wake with no scanner bound); the next `onCopyWork` notice (R17) or the instance's start reads it again."
- **R18** (N818; K2383) *(not yet met: T40)* At start this module registers its receipt listener once with `provenance.onReceipt` (its R47; R15). A refused registration (an answer `{ok: false}`, or one that throws) is a start-up fault: kept, answered by `faults()` as `{notice: "onReceipt", reason, detail}`, and logged, as `scheduler`'s are (its R23), never ignored. `faults()` writes nothing and never throws. A test refuses the registration and finds the fault.
- **Satisfies** add DEC-185, DEC-187 (R11, R14), K2380 (R15), K2383 (R18). **Status:** "Last changed T40 (T40-12: R11, R14, R15 amended; R18 new; N798, N811, N816, N818; DEC-185, DEC-187; K2380, K2383)."

### publication (T40-13)

Next free id: R76 (R75 is the last, `publication.md`:155).

- **R33, its C-122.6 sentence re-written** (DEC-187 (4); K2348 (1)) *(not yet met: T40)*: "(T37; N757; K2206) C-122.6 (R57): `PHOTO_MARKS_CHANGED_SINCE`; (T40; DEC-187 (4)) answered at the commit, always after signing, so its translation is `words.json`'s `photo.refused.changed.signed`, read by key, protected, `{photo}` the photos named: "This case wasn't published: a mark on {photo} changed after it was prepared. Prepare it again, and sign it again." `photo.refused.changed` stays the screens' for the moment before signing (DEC-187 (4)); no check of this module answers before signing. A withdrawal since preparation (`case-carriage` R14) is such a change." One row change, T41's stamp.
- **R76** (DEC-186 (1); K2376 (4); `membership` R125) *(not yet met: T40)* `publishedWorkOf({memberId})` answers whether the member's work appears in a published case: `{case, edition}` for the earliest (by `signed_at`) case edition that is ratified (R22) or waiting (R66: signed, its bytes fixed), whose signer, deliverer (R14) or preparer (`case_documents.authored_by`) is the member, or whose signed document names the member's handle in a row that carries a handle (`material_attestations:` at `cover` or `name`, `case-disclosures` R10; `member_ties:`, its R27; an attribution at `cover` or `name`, `case-tensions` R7); null when none; `{unreadable: true}` when its tables cannot be read. It is synchronous, writes nothing and never throws. At start this module registers it once with `membership.registerHandleGuard` (its R125; K31's pattern, as R61's provider). (The scope of "work", §Z2.)
- **Uses** add `membership`: `registerHandleGuard` (R125). **Satisfies** add DEC-186 (R76), DEC-187 (4) (R33). **Status:** "Last changed T40 (T40-13: R33 amended; R76 new; N799, N811; DEC-186, DEC-187; K2348, K2376)." Size: R76 is about 60 lines; 3,799 + ~60 (`current.md`:55, K617).

### public-read (T40-14)

- **R3, its T37 sentence amended** (DEC-185 (1), DEC-179; N798) *(not yet met: T40)*: after "the label to be shown beside the material word for word," insert: "and `label_key`, the key the reader's surface shows it by (DEC-179): `photo.obscured.label` for a photo's copy whose signed `label` is not null or whose row states it marked (`case-grammar` R12), `photo.published.label` for a photo's copy with nothing covered (a copy carries no camera details, `image-cover` R2, so the key holds for every edition carrying a photo's copy, T37 on), and `document.cleaned.label` (proposed, `case-carriage` R15) for a member document's cleaned copy; a photo carried whole (an edition before T38) has none. The signed `label` is answered as signed, never replaced (R13)."
- **Status:** "Last changed T40 (T40-14: R3 amended; N798; DEC-185)."

### ratification (T40-15)

- **R42, its parenthesis re-worded** (DEC-187 (4); K2370) *(not yet met: T40)*: "(C-122.6's `photo.refused.changed`)" becomes "(C-122.6's `photo.refused.changed.signed`, `publication` R33, read by key)". Its test's expected `cause.translation` is that row's new words. No other change; the stop relays publication's answer as it is (K2370).
- **Status:** "Last changed T40 (T40-15: R42 worded; N811; DEC-187)."

### case-disclosures (T40-16)

- **R6, its photo bullet's last sentences amended** (DEC-185 (1); K2248) *(not yet met: T40)*: "… `obscured: {copy, label, marked}`: `copy` its current copy's SHA-256; `marked` true for `marked`, false for `nothing_to_obscure`; `label` `case-carriage`'s `OBSCURED_LABEL` when marked, else its `PUBLISHED_LABEL` (DEC-185 (1): every photo a published case carries is labelled; replacing K2291's null)."
- **R7, its T37 bullet amended** *(not yet met: T40)*: "… `included: false`, and `obscured: {copy, label, marked}` (`case-grammar` R12) …".
- **R22, its T38 sentence amended** (DEC-187 (1); K2348 (1)) *(not yet met: T40)*: "R6's `PHOTO_UNCHECKED` … Its translation is `words.json`'s `photo.refused.unchecked`, re-worded by DEC-187 (1): "Signing waits until every photo in the case is checked, including one that only supports a finding: {photo}."" The table row (`case-disclosures.md`:225) and `PHOTO_WORDS` (`case-disclosures/checks.mjs`:29) take the same words. One row change, T41's stamp.
- **R29, amended** (DEC-185 (2)) *(not yet met: T40)*: "`words` `OBSCURED_LABEL` for a marked photo with a copy, `PUBLISHED_LABEL` for one with nothing to obscure, …"; append "The step's sentence on camera details (DEC-185 (2)) and its gate sentence (`photo.step.gate`) are the screens' words, read from `words.json`; this module answers neither."
- **Satisfies** add DEC-185, DEC-187 (1). **Status:** "Last changed T40 (T40-16: R6, R7, R22, R29 amended; N798, N811; DEC-185, DEC-187)." Runs case-authoring's suite (P11; `current.md`:58).

### Owed outside the plan's L8 entries (BOB's, §Z5)

DEC-185's label on an unmarked photo reaches the signed document, which two L8 modules not in T40 describe:
- **case-grammar R12** (`case-grammar.md`:54) says a photo's label is "`OBSCURED_LABEL` when it is marked, else null"; **R14** (:74) lists an unmarked copy with "none" and picks its line words by the label being null (`case-grammar/complete.mjs`:259–261). Amend R12: the row also states `obscured_marked` (optional, flat, as `obscured_label`; absent reads by the label: non-null marked, null unmarked, so every earlier edition reads and renders byte for byte); R14 picks the `copy` or `unmarked` line by it and then prints the label word for word when there is one.
- **case-checker**'s specification (`case-checker/spec.mjs`:215, "an unmarked photo's copy has none") and `program.mjs` (regenerated at L8's close).

---

## L9 · filings (T40-9a): N819

**No requirement change** (`next-T40.md`:24, K2387). R25 (`filings.md`:55) stands; the test `test/m/filings/outward.test.mjs`:136 asks its fixture for an exhibit recorded without a receipt (`doc(id, {fetched: false})`, or none), its assertion unchanged.

---

## L11 · the handle ops (N797, N799)

### op-declarations (T40-23)

Next free id after part C's R41: R42 (R40 is the last held, `op-declarations.md`:174).
- **R42** (N797, N799; DEC-184, DEC-186; `membership` R123, R124) *(not yet met: T40)* `OPS` holds a spec for `handlecheck` and `handlechange`, none in `GOVERNANCE_ACTIONS` or `IDENTITY_ACTIONS`, not on `credentials`' `AI_GRANT_OPS`:
  - `handlecheck`: public (`classes: null`), not mutating, no `NEEDS` row, `invite` and `handle` read from the body only (an invitation is never in an address, `admission` R20), `viewer` set as `admission` R16 reads who is asking (as `groupdescription`'s, R22), so an invitee asks with the invitation and a signed-in member without one;
  - `handlechange`: in `SESSION_OPS.member`, a member's session only (classes `admin`, `member`; `machineClasses: []`), mutating, `NEEDS` `null`, `by` stamped, `handle` a body field.
  - R6 and R34 hold over them: `handlechange` needs an `ACT_HELP` entry (`affordances` R48) or an `ACT_HELP_ABSENT` ground; its text is owed by the design stream (NOTICE).

### op-grades (T40-18)

Next free id: R29 (R28 is the last, `op-grades.md`:122).
- **R29** (N797, N799; `op-declarations` R42) *(not yet met: T40)* The handle ops, by R5 and R3, `affordances` R12's totality holding over them: `RUNG_ABSENT` holds `handlechange`, ground `caller-owned`, as `setpassword` (R27): a member's own handle, asking no reason; `NON_ACTS` gives it "member-directed: the caller's own handle, changeable until their work is first in a published case; earlier handles kept and shown as formerly; moves no bundle", and `handlecheck` "read: whether a handle is free, taken or not allowed, never who holds it". Neither is in `MACHINE_REFUSALS` (`membership` refuses a machine by its own code, R124). By R18 both carry `phone: true`.
- N812's ops (part C's op-declarations R41) are graded in the same requirement or a sibling, read from part C; their grades are fixed at L11's START (`current.md`:64).

### control-plane (T40-25)

Next free id after part C's R69: R70 (R68 is the last held, `control-plane.md`:128).
- **R70** (N797, N799; `op-declarations` R42; `membership` R123, R124) *(not yet met: T40)* The door routes `handlecheck` as it routes `invitelook` and `enroll`: credential-free, relayed to the store the caller names (`admission` R3), the body's `invite` and `handle` only, `viewer` set as for `groupdescription` (R54), and nothing of the caller else crossing; and `handlechange` through `membershipOps` (R26's pattern) with `by` from the caller's own session (R17; R29), `handle` from the body. Neither answer carries an invitation, a session or a member id (R30).

### Owed shares not named in the plan (BOB's, §Z5)

- **admission** (L11, index 133): R3's list of public ops that address `scratch` gains `handlecheck` (it reads an invitation, as `invitelook`); R22 counts `op=handlecheck` answered `NO_SUCH_INVITATION` as kind `credential`, as it counts `invitelook`'s.
- **affordances** (T40-19): `ACT_HELP` for `handlechange` (and part C's member-session ops) or `ACT_HELP_ABSENT`; the act `dispose` on a question a project draws on is no longer offered (inquiry R39), the project arm offered instead.
- **plane** (T40-26): composes the guard: publication's start registers R76 with membership's R125 in the instance the plane builds, before `handlechange` is served; a test drives `handlechange` through the plane to `HANDLE_FIXED`.

## L11 · N812's texts placed (part C, `draft-T40-N812.md`:195–225)

| module | part C | current file | placement |
|---|---|---|---|
| wizard-scripts (T40-17) | R27 amended (:196) | R27 (`wizard-scripts.md`:90) | its refusal clause reads "…; `ai-use` R3's `AI_LIMIT_REACHED` and `credentials`' `AI_USE_SWITCHED_OFF`, answered at the door …", and "within that member's ceiling (`ai-runs` R50)" becomes "within the limits of the account that serves (`ai-use` R3)"; "the member's own or the group's key" becomes "the project's, the member's own or the group's" |
| notice-producers (T40-20) | R16 new (:199) | free (R15 is the last, :33) | after R15; Uses add `ai-use`, `credentials`' two reads |
| queue (T40-21) | (K2376 (2)) | R1 (:18) | R1 gains three kinds, with one sentence each: `explore-ask` (one of your accounts may explore today; approve it or let the day pass; `notice-producers` R16), `ai-limit-reached` (a limit of an account you own was reached in this period; `notice-producers` R16), `project-account-suspended` (a project's sign-in account stopped serving because a second member joined; `notice-producers` R16), each `FINDING`; R12's disposition: `available: false`, `instead: exploreapprove` for `explore-ask`, `queuemute` for the other two (§Z4) |
| instance-setup (T40-22) | R65, R67 amended (:203–207) | R65 sub-bullets (`instance-setup.md`:100, :101), R67's (:113) | :100 "within that account's daily ceiling (`ai-runs` R50)" → "within that account's limits for `draft` (`ai-use` R3)"; :101 and :113 the two ceiling codes → `AI_LIMIT_REACHED`, with `AI_USE_SWITCHED_OFF` after `AI_NO_ACCOUNT` |
| op-declarations (T40-23) | R41 new (:210–214) | free | after R40; `aiceilingset`/`aicopyceilingset` leave their declaring requirement (R20's list) |
| store-door (T40-24) | R10 amended (:217) | R10 (`store-door.md`:34) | "then `run-rules` R20's `AI_NO_ACCOUNT`, `AI_USE_CEILING_REACHED` and `AI_USE_COPY_CEILING_REACHED`" → "then `AI_NO_ACCOUNT` or `AI_USE_SWITCHED_OFF` (`credentials` R56), then `ai-use.useCheck`'s `AI_LIMIT_REACHED` (its R3)"; `credentials.aiKeptAway()` → `aiKeptAway({use: "draft"})`; `accountFor` resolved with kind `draft` |
| control-plane (T40-25) | R69 new (:221) | free | after R68 |
| plane (T40-26) | registration (:225) | — | fixed at L11's START |

---

## E1 · Canon and register folds at the opening (part E, `draft-T40-N812.md`:273–277; K2373)

### `BIO_Capability_Ladders_v0_1.md` §10 (line 1315)

Replace the row:
> | No standing AI run but a member's standing question | AI runs only at a member's act, with one exception: a member-authored standing question (cadence, end date), whose saved search re-runs mechanically and calls the AI only when it finds something new, read-only, bounded, within its author's own ceiling (K1481, K1502); machine checks and detectors are computations, and any that uses the model follows K1479 and K1481 (K1491); other periodic work is mechanical, on the one scheduler alarm, never a cron and never a second alarm | D13 as lifted by K1481; K1491; DEC-24 rule 2; AIR §7.3 point 7; SCHEDULER |

with:
> | No standing AI run but a member's standing question and enabled exploring | AI runs only at a member's act, with two exceptions: a member-authored standing question (cadence, end date), whose saved search re-runs mechanically and calls the AI only when it finds something new, read-only, bounded, within the limits of the account that serves its author (K1481, K2352); and exploring an account owner has enabled (group, project or member: No, Ask every day or Yes; "No" never inherited), run only within that account's overall and exploring limits, its finds labelled the machine's with who enabled it, members deciding what becomes evidence (K2350; H6, D33, D39); machine checks and detectors are computations, and any that uses the model follows K1479 and K1481 (K1491); other periodic work is mechanical, on the one scheduler alarm, never a cron and never a second alarm | D13 as lifted by K1481 and, for exploring only, K2350; K1491; DEC-24 rule 2; AIR §7.3 point 7; SCHEDULER |

The §10 preamble (line 1300) adds "and exploring by K2350" after "(QUESTIONS L5 with D13 was ruled by K1481".

### Its "Cross-cutting rulings" (§2, lines 139–151)

First bullet, replace "there is no project-wide Claude account, and the subscription token is each member's own by Bob's choice (K1547, K1755) on every plan;" with "a project may hold one AI account, an API key, or its sole member's own subscription while it has one member (K2353); the subscription token otherwise serves only its member, by Bob's choice (K1547, K1755);", and "within a daily ceiling per member, set by the member, which the administrator may lower (K1450 as amended by K1502)" with "for a member's act the project's account if it has one, else the member's own, else the group's, each within the limits its owner sets, which bind that account only (K2352)".

Add a bullet after *Standing questions*:
> - *Exploring:* each account owner (the group, a project, a member) sets exploring to No, Ask every day or Yes; "No" means not paid from this account and is not inherited; "Ask every day" raises at most one item a day to the account's owners, only when something is worth exploring, silence meaning no; "Yes" runs within the overall and exploring limits; the group's "no AI at all" binds every level, its money settings only the group key; what exploring offers is labelled the machine's with who enabled it (K2350; H6, H7, D38, D39).

**Also owed (not named by part E, same doctrine):** §2's QUESTIONS bullets, line 125: "There is no project account and the subscription token is each member's own by Bob's choice (K1547, K1755); a member's own account serves that member first, the group key serves members without one while it is on" → "A project may hold an API key, or its sole member's own subscription while it has one member (K2353); a member's act is served by the project's account if it has one, else the member's own, else the group's (K2352)"; and line 127's "within its author's own use ceiling" → "within the limits of the account that serves its author (K2352)".

### `BIO_Assistant_and_AI_Roles_v0_1.md` §6 (line 103)

Replace "**K1502 (2026-10-05) retires the project and instance levels, and K1755 (2026-10-06) corrects its reach to subscriptions:** there is no project-wide Claude account and no group-wide subscription, by Bob's choice (K1502, K1547, K1755) on every plan;" with:
> **K1502 (2026-10-05) retired the project and instance levels; K1755 (2026-10-06) corrected its reach to subscriptions; K2352 and K2353 (2026-10-08) restore a project level, and set the cascade:** for a member's act, the project's account if it has one, with the project's limits; else the member's own, with the member's limits; else the group's, with the group's limits; the account chosen is the one used, and one at its limit, or with that use switched off, refuses rather than passing the act on (K2352). A project's account is an Anthropic API key, or its sole member's own subscription while the project has one member; with a second member it serves no longer and the cascade goes on (K2353). There is no group-wide subscription, by Bob's choice (K1502, K1547, K1755) on every plan;

and replace "A member's own account, when held, serves that member's acts first; the group key serves members without one while it is on, and an act it serves is still that member's." with "An act any account serves is still that member's (K1755)."; and "within that member's own use ceiling, which the administrator may lower; the copy's ceiling caps the group key's use (K1450, K1502, K1755)" with "within the limits each account's owner sets, binding that account only; the group's material limits (keep-away) bind every account (K2352; D38)". The disclosure sentence gains "or before their first act a project's key pays for (D311; `credentials` R58)".

### `build/terms/anthropic.md` "Bob's choices" (line 323) and AT-13 (line 145)

Replace:
> - **There is no project-level Claude account** (K1502, "Own subscriptions only", whose project clause K1755 left standing: "the rest of K1502 stands"). No Anthropic page forbids a project-scoped API key (AT-13); the product has none by Bob's choice.

with:
> - **A project's account** (K2353: Bob, "A project can have a personal subscription key if the member is the only member of that project, but with more than 1 member only be an API key is allowed"; replacing K1502's project clause and K2352 (1)). A project-scoped API key is one the pages permit (AT-13), subject to U-3 and U-4, as the group key is. A sole member's own subscription serving their own project is that member's own use, not making the account available to anyone else (AT-3, AT-16 as K2353 reads them); unattended use on it is U-5's question.

AT-13's **Bears on** (line 145): "(a project-level key is excluded by Bob's choice, not by this page)" → "(a project may hold one, by Bob's choice, K2353)". The first bullet (line 322) gains "; a project with one member may use that member's own (K2353)".

### `credentials`' Purpose

As part C (`draft-T40-N812.md`:84) with conflict 1 above.

## E2 · NOTICE to UX-DESIGN (one paragraph)

> T40 (K2389) builds, and owes the design stream the words and screens for: N812 (K2373; D34, D38, D39): the project's AI settings, set by any one owner and recorded with who and when; the project's account (an API key, or the sole member's own sign-in) and the notice when a second member's join suspends it; the per-account switches for each kind of use (ask, draft, run, standing, explore No / Ask every day / Yes); material limits (keep-away by use) for the group and each project; money limits (overall, per use, per member; `usd` on API keys only, tokens, calls; day or month; inclusive or exclusive); the refusals `AI_LIMIT_REACHED` (naming whose limit, never a cost), `AI_USE_SWITCHED_OFF`, `PROJECT_AI_KEPT_AWAY`, `PROJECT_NOT_SOLE_MEMBER`, `PROJECT_KEY_NOTICE_DUE`; the project key's disclosure (`credentials` R58, D311); the three queue items (limit reached, project account suspended, the daily exploring Ask) and the `enabled_by` label; one setting per account, an override only on an open project or question (K2350). N797/N799 (DEC-184, DEC-186): `handlecheck` answers `free`, `taken` with a suggestion, or `not_allowed` naming what does not fit, with `handle.*` by key; `handlechange` answers `HANDLE_FIXED` (`handle.fixed`) and a new `HANDLE_CHANGE_UNCHECKED` (BOB's draft words); members' rows carry `formerly`; a signed-in member's check needs no invitation. N811/N798 (DEC-185, DEC-187): every published photo's copy carries its label by key and the public read answers `label_key`; C-122.6 answers `photo.refused.changed.signed` at the commit and at a scheduled stop, and no plane check answers `photo.refused.changed` before signing. N814 (K2371): a question a project draws on is set aside only per project, and `dispose` on it answers a new `DRAWN_ON_BY_A_PROJECT` (BOB's draft words). Owed texts: `ACT_HELP` for `handlechange` and N812's member ops (DEC-182 (5)); the words of the new refusals and items above; and, still proposed from T39, `document.refused.changed`, `document.cleaned.label`, `document.refused.clean`, `document.refused.pending`.

---

## Z · Points that may be Bob's (best readings), and BOB's doubts

1. **Earlier handles stay taken (R124, R16).** DEC-186 (3) says "the new handle must be free in the group"; Bob did not say whether a handle someone gave up is free. Reserving it changes what a member may choose (K1881: such a limit is Bob's). Reading: reserved, because "formerly mai-k" must never point at two members and published cases keep their handle (DEC-186 (1), (2)); a member may take back their own. If Bob prefers, earlier handles free after a period.
2. **What "their work appears in a published case" covers (publication R76).** Reading: the member's handle is in a published (or signed, waiting) case: as signer, deliverer, preparer, or named by handle in its rows. Work credited only at `group` or `project` level (no handle published) leaves the handle changeable, since DEC-186's reason is that "published cases are signed and permanent". The literal reading (any work, named or not) would fix the handle of every member whose capture any case carries. Including waiting editions (signed, R66) is BOB's detail serving the same reason.
3. **`handlecheck` for a signed-in member (R123).** DEC-184 (3) limits the check to a live invitation; DEC-186 (3) asks the same check as a member types a new handle. Reading: also answered to an active member's own session (members already read the roster's handles, R17), so no outsider gains a probe. BOB's detail, reported.
4. **The daily exploring Ask's class (queue R1).** "Ask" is not one of DEC-131's three classes. Reading: `FINDING` ("Noticed"), its disposition `instead: exploreapprove`, leaving with the day; words the design stream's. Not Bob's unless the stream asks for a fourth class.
5. **Shares outside the plan (BOB's, P10: their layers have not started):** case-grammar (R12, R14) and case-checker's specification in L8, for DEC-185's label on an unmarked copy; admission (R3, R22) in L11 for `handlecheck`. Without them an unmarked photo's copy would be listed in the complete edition as marked (`complete.mjs`:261).
6. **`DRAWN_ON_BY_A_PROJECT` still tells a member that some project draws on a question they can see.** D41 (Bob) forbids showing which; the refusal names none and gives no count. Any refusal of the shared move reveals that much. Not raised unless Bob wants `dispose` silently limited to questions no project draws on.
7. **`photo.refused.changed` before signing** is answered by no plane check today (`marksLapsed` is asked only at the commit). The screens may show it from `photoMarks`; a pre-signing check would be a new entry (`next.md`), not T40's.
8. **R122's one site.** Part C's R122 is placed verbatim; `membership` R55 (`projectAuthority`) should answer its owner refusal through R122 so the code keeps one site (K231): a wording line BOB may add to R55.
9. **Exploring paid by a project's sign-in account** is unattended use on a subscription (U-5). The explorer is not built in T40 (B9, N815); the question goes with N815.

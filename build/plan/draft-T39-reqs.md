# T39 — requirement text for layers 2–10 (draft for BOB)

**Status** · Drafted by a worker for BOB #143, 2026-10-08, from `plan/current.md` (T39's entries), `plan/draft-T39-N806.md` (K2333, K2334), `plan/archive/next-T39.md` (N800, N801, N803–N805), each module's requirements file read whole, and the rulings each entry cites. Nothing here is applied: BOB reviews and applies it. **Reviewed by BOB (K2343):** §B's readings are adopted as drafted, with: (1) C-18.8 as drafted, `latin1` as N808, joining T39-3 (K279); (2) C-4.2 as drafted, and `checkBundle`'s throw is record-grammar's (L1, no T39 job) → N809 (`next.md`); (3) N801 `signin` only, `apikey` refused too; (4) N803 as drafted (no `countAskUsage`); (5) N805 in ratification R42; (6) N806's details as drafted, R17 kept; (7) N807 option (a): the module is named now, `setup-words`, and R83 names it too; (8) case-checker's `/3` spec words join T39 as T39-17 (L8); C-122.6's words stay with UX-DESIGN (B116). Layer 1 (`image-cover`, `pdf-reader`, `doc-clean`) is another worker's draft and is not touched here; this draft names `doc-clean`'s R1–R6 and `CLEAN_MAX_BYTES` as §3 of the N806 draft states them.

Marks: new or amended text that states behaviour not yet built carries `*(not yet met: T39)*`. Text that only re-words built behaviour carries no mark.

## A. For Bob

**None.** Nothing below changes what a requirement means beyond K2285, K2290, K2304, K2307, K2308, K2315, K2333 and K2334. The public label for a cleaned copy (`COPY_CLEANED_LABEL`) and the four new translations are BOB's drafts. The UX stream may re-word them, as with case-carriage R14 and case-disclosures R22. They are not Bob's.

## B. BOB's readings this draft needs (P17: BOB's, report as done)

1. **N800 C-18.8: what "the released bytes" are** (promotion R31). PROMOTION #36 called the check's intent "uncertain, BOB's to read" (`build/jobs/T38/promotion.md`:41). Drafted: the `bundle.md` as it stood after the promotion that recorded the transition. A check that cannot reach those bytes reports an error (fails closed). The same record also notes that `latin1` (`release.mjs`:30) masks characters outside Latin-1. That is not in N800: it is left out here and named for `next.md` if you want it.
2. **N800 C-4.2: what "refuses a prototype-key type" means.** C-4.2 gives an unknown type no finding of its own. Drafted: a prototype-key type is read as an unknown type and never throws. The job record says `checkBundle` throws first at the gate on the same input (`promotion.md`:40), and that is a second site K2285 does not name. Recommend that T39-3 also guards it, or that it is named for `next.md`.
3. **N801: "signin alone"** (agent-runner R2). Read literally, the `apikey` arm goes too, not only `subscription`. `agent-model` R2 never sends `apikey` to the runner (it goes to the Messages API), so the arm has no caller. Drafted: the runner takes `signin` only, and `apikey` and `subscription` are refused `NO_CREDENTIAL`. This also settles agent-runner's Suggestions "Open for BOB (1)". If you would rather keep `apikey`, drop that half of R2's change.
4. **N803's facts differ from its entry** (answers). `answers` never calls `countAskUsage`: `store-door`'s `askusage` route does (`dispatch.mjs`:381; store-door R11). `aiUseCheck` reaches `answers` only as the injected `ceilingRefusal` (`plane/store.mjs`:219), and only R19's standing arm reads it. The account an ask or a draft carries is resolved in `store-door` (`assistantFor`, `dispatch.mjs`:273; store-door R10) and `agent-worker` R6, not in `answers`. So `answers`' only "sign-in arm" is R19's: a standing question whose author `accountFor` serves by sign-in is refused `STANDING_SWITCH_OFF` by credentials R32 (N796, held, K2334). Drafted below: the `uses` edge and a Uses line naming `aiUseCheck` for R19 (and `countAskUsage` only if you want the edge to cover R1's draft mode, see §answers), plus R19's sign-in arm stated with a test. No text claims that `answers` carries an account it does not carry.
5. **N805 names "R67"**, which is `publication`'s (`publishDue`). Ratification has no R67, and its scheduled publisher is R42. Drafted: ratification R42 states the stop for a commit refusal (C-122.6, and C-122.7 with it). It also adds one clause to publication R67 saying the stop keeps `check` and `cause` as answered, which `publication/schedule.mjs`:187–190 already does. The second clause is T39-11's file and is built, so it carries no mark.
6. **N806 details beyond the draft's §3** (BOB's, P17):
   - case-carriage R16 answers two more states, `undetermined` (needed for case-disclosures' arm 1) and `photo`.
   - A new case-carriage **R17** `onCopyWork` gives the scheduler the arming notice `file-safety` R40 gives (the draft's §3 has none, so an idle instance would not wake). You could fold it into R15 instead.
   - `DOCUMENT_COPY_RETRY_MS` (300,000) and `DOCUMENT_COPY_NO_STORE` are added.
   - A member document carries none of R8's archive files, as a photo carries none.
   - R13's rows gain `kind` (`photo` | `document`), so `publication` R57 can tell C-122.6 from C-122.7.
7. **N807's membership share cannot join T39-M as written.** `current.md` L11 says "a membership `MODULE_ORDER` share joins T39-M at the opening". The new module has no name until L11's START, and T39-M merges in L2. Options:
   - (a) name the module now, so `modules.json` and R83 gain it in L2 with empty `paths` (K1043), tolerated by name as not yet built (R83's T33-19a rule);
   - (b) re-open membership at L11 for it (K657, K1185's pattern);
   - (c) accept R83's test red from L11's START until T40.

   Recommend (a) if L11's seam (`setup-words.mjs`) is already settled enough to name; otherwise (b). The R83 text below carries only `doc-clean`.
8. **Gaps with no T39 entry** (for `next.md`):
   - `case-checker`'s readable `/3` specification (its R14; `spec.mjs`:179–220) says only "a photo carried as its copy". After N806, a member document's cleaned copy uses the same `obscured` kind, so the published specification under-describes it. `case-checker` R8 is already worded generically, so only the spec's words change.
   - C-122.6's protected words ("Prepare it again before signing") are answered after a signature and at a scheduled stop (PUBLICATION #25's UX note, K2308). C-122.7's draft below avoids "before signing".
   - The composition root's share: `plane` registers case-carriage's `provenance.onReceipt` listener (case-carriage R15) at start, and hands `scheduler` case-carriage's consumer. This is L11's (`current.md` L11, "plane's composition (case-carriage's listener)").

## C. `modules.json` edges

| edge | indexes (order) | entry | check |
|---|---|---|---|
| `case-carriage` uses `doc-clean` | 93 → 28 | T39-10 | earlier: ok |
| `case-carriage` uses `provenance` | 93 → 39 | T39-10 | already declared; Uses line widened only |
| `scheduler` uses `case-carriage` | 119 → 93 | T39-15 | earlier: ok |
| `file-safety` uses `provenance` | 45 → 39 | T39-6 | already declared; Uses line widened only |
| `answers` uses `ai-runs` | 84 → 80 | T39-7 | earlier: ok (new edge) |

Nothing else changes: `case-disclosures`, `publication` and `ratification` already use `case-carriage` or `publication`; `case-grammar` and `public-read` gain no use; `provenance` R62 uses `ooxml`'s `ARCHIVE_DEPTH_MAX`, already an edge. **No edge points later.** (`case-grammar`, index 91, names `case-carriage`'s labels in text only and imports nothing from it, as today.)

---

## L2

### membership (T39-M; K657, K1185, K2339)

R83 is one line that each re-pin extends with a dated parenthesis. The list itself is in code (`membership/index.mjs`:207), and the test holds it equal to `modules.json`. Append to **R83** after its T38 sentence:

> (N806, N807; K2333, K2343, K657; T39) The list gains `doc-clean` in layer 1, directly after `image-cover` and before `pdf-worker`, and `setup-words` in layer 11, directly before `instance-setup`, as `build/modules.json` holds them after T39's opening. `doc-clean` merges in L1 before this module's job, so it is not tolerated as not yet built; `setup-words` is, until its L11 job (R83's T33-19a rule). *(not yet met: T39)*

Status line: "Last changed T39 (T39-M: R83 re-pinned, now naming `doc-clean`; K657, K2339)."

No other id changes.

### promotion (T39-3; N800; K2285, K1542)

**R31** — append:

> (T39; N800; K2285) The release message's `bundle_md_sha256` is the SHA-256 of the released bytes: the `bundle.md` as it stood after the promotion that recorded that `collected → verified` transition. That promotion is the first manifest entry, in write order (R30), whose `bundle.md` holds the transition in its `state_history`. The bytes are the live `bundle.md` while that promotion is the head, else its copy in history under the snap key of the promotion that followed it. They are never the live `bundle.md` of a later revision, so a later revision of a released bundle never fails a signature that verified over what was released. When those bytes are not in the image the gate reads (no such entry, or a history copy held as a blob), the release is an error stating that what was signed cannot be read. It is never a pass. *(not yet met: T39)*

**R32** — append:

> (T39; N800; K2285) C-4.2 never throws. A document whose `object_type` names no type of its own in the state tables (an inherited key such as `toString`, `constructor` or `__proto__`) has no declared table, and C-4.2 answers it as it answers any type with none: no finding of its own. Refusing an undeclared type is the catalogue's type check. A test gives C-4.2 each of those three keys and finds no throw. *(not yet met: T39)*

**The stamp duty.** It needs no requirement text. R34 and R50 already require the job that moves `CATALOG_VERSION` to re-pin `ROW_CENSUS`, and R18 and R38 hold the changed checks at both sites. The job stamps:
- every row named `awaiting stamp` at T38's close (rule 3 (2));
- L1's and L2's T39 rows: `doc-clean`'s family and any `image-cover` strip refusal rows;
- C-18.8 and C-4.2 as changed checks.

Status line: "Last changed T39 (T39-3: R31, R32 amended; N800; K2285); those marked not yet met (T39)."

## L3

### acquisition (T39-4; N804; K2307)

No text change. R45 already carries `*(not yet met: T39)* (N804)` on its naming test, and BOB strikes the mark when T39-4 merges.

### provenance (T39-5; N806; K2333)

Next free id: **R62** (R61 is the last). New, after R60–R61 under the receipts:

> **fetchedByThisCopy(captureSha) → `{fetched, routes, archive}`** (N806; K2333)
> - **R62** Whether this copy fetched the capture itself. This is the one definition of the source condition that `file-safety` R6 and `case-carriage` R15 read (lifted from `file-safety`, K2333).
>   - `fetched` is true when any receipt naming the capture (R60) has a `via` in `FETCHED_VIAS`, exported as `direct`, `archive.org` and `capture-request`. A receipt with no `via` reads `direct` (R13). Direct, Drive and render fetches all record `direct`.
>   - It is also true when the capture has an `unpacked` receipt (R59) whose retrieval locator names an archive (`zip:<archiveSha>!<index>`) for which this rule answers `fetched: true`. The walk goes outward through at most `ARCHIVE_DEPTH_MAX` archives (`ooxml` R30). One such receipt suffices (K1949).
>   - Otherwise `fetched` is false. That covers a pulled knock (`doorbell`, R51), a capture with no receipt (R26's `unrecorded`), and a file cut from an archive that is not itself fetched.
>   - A walk that meets a digest twice, runs past the bound, or reads a locator that does not name a 64-hex digest and a whole index ends that path not fetched.
>   - `routes` is the sorted set of the capture's own receipts' `via`s.
>   - `archive` is the archive whose answer decided `fetched: true`, else the first archive an `unpacked` receipt names, else null.
>   - A `sha:` prefix and case are ignored, as in R5. It writes nothing and never throws: a read that fails answers `fetched: false` (fail closed), with `routes: []`. *(not yet met: T39)*

Uses: unchanged (`ooxml`'s `ARCHIVE_DEPTH_MAX` is already named for R59; add "and R62"). Satisfies: add "K2315, K2333 (N806): R62". Status line: "Last changed T39 (T39-5: R62 new; N806; K2333); R62 not yet met (T39)."

### file-safety (T39-6; N806; K2333)

**R6**, the source condition. Replace "some receipt's route is a fetch by this copy (direct, Drive, render, web archive) or the file is a member cut from an archive whose own grade's source condition holds (K1949: any one such receipt suffices)" with:

> `provenance.fetchedByThisCopy(captureSha)` (its R62; N806, K2333) answers `fetched: true`. It is the one definition: a fetch by this copy (direct, Drive, render, web archive, a capture request), or a file cut from an archive whose own answer is fetched (K1949: any one such receipt suffices). *(not yet met: T39)*

Also in R6: `source` in the answer is R62's answer as given. The reason `source_not_fetched` and every other arm are unchanged.

Uses, `provenance` line: add "`fetchedByThisCopy` (its R62; R6's source condition, N806)". `receipts` stays for the reputation answer. Status line: "Last changed T39 (T39-6: R6 reads provenance R62; N806; K2333); R6 not yet met (T39)." No meaning changes: the answer is byte for byte today's (the job proves it with R6's existing source-condition arms).

## L6

### answers (T39-7; N803; K2304) — see B4

**R19** — append:

> (T39; N803; K2304) The sign-in arm. When `credentials.accountFor` answers the author's own Claude sign-in (`{kind: "signin", level: "member", member}`, credentials R35), the act is the author's own, as with the author's reference. The ceiling (`ai-runs`' `aiUseCheck`, its R50, R52) is read as for any account. Since T38 it admits a member served by sign-in (K2299, K2304). The grant (credentials R32) is then refused `STANDING_SWITCH_OFF`, since a sign-in has no `standing` switch (K2275; `next.md` N796, held by Bob, K2334). The AI half is held back with `{condition: "switch_off", switch: "member"}`, never `no_account` and never `kept_away`. No account is carried and no model is called. The run's new finds reach the author as R26's do, with `answer` null. A test drives a sign-in author through a run that finds something new and finds that hold, no grant, and no model stub called. *(not yet met: T39)*

Uses: replace "`ai-runs` (the ceiling, usage)" in Rule 3's list with:

> `ai-runs` (T39; N803, K2304; a `modules.json` edge): `aiUseCheck` (its R50, R52), the author's ceiling R19 reads before any grant, reached as the `ceilingRefusal` the composition root hands in. An ask's ceiling and usage (`askceiling`, `askusage`: `aiUseCheck`, `countAskUsage`, its R48) are `store-door`'s routes (its R11), not this module's calls.

If you want the Uses line to name `countAskUsage` as `answers`' own (the entry's wording), it needs a requirement that `answers` counts an ask's or a draft's usage. No such requirement exists today: R13 counts tallies, not usage. Recommend the wording above.

Status line: "Last changed T39 (T39-7: R19's sign-in arm; Uses; N803; K2304); R19's arm not yet met (T39)."

### agent-runner (T39-8; N801; K2290) — see B3

**Terms** — replace "A **conversation request** is `{credential: {kind, secret}, model, …}`" with "`{credential: {kind: "signin", member}, model, system, prompt, tools, max_turns}`", and "The **caller** is `agent-model`'s subscription provider" with "The **caller** is `agent-model`'s `signin` path (its R2)".

**R2** — replace the whole requirement:

> **R2** (K1429, K1502; T37: N708, DEC-156, K1819; T39: N801, K2290) The one credential this module takes is `{kind: "signin", member}`. It carries no secret. Its query runs under this instance's stored sign-in made for `member` (R21), in an environment that replaces the process environment whole, sets neither `CLAUDE_CODE_OAUTH_TOKEN` nor `ANTHROPIC_API_KEY`, and gives `CLAUDE_CONFIG_DIR` no fresh directory. Claude Code therefore authenticates as its own sign-in left it (AT-27). This module neither reads nor copies the stored sign-in to do so (R8), and everything else the query writes is gone when it ends (R9).
>
> Each of these answers `{ok: false, code: "NO_CREDENTIAL"}` and starts nothing:
> - a request with no credential;
> - a credential of any other `kind` (`subscription`, retired with `credentials` R22 in T38, and `apikey`, which `agent-model` R2 sends to the Messages API, never here);
> - a credential carrying a `secret`;
> - a `member` that is not a non-empty string.
>
> No code path of this module takes a token or key from a request. With no stored sign-in in the instance (none was made, or the instance's disk no longer holds it) it answers `{ok: false, code: "NOT_SIGNED_IN"}`. With one made for another member it answers `NOT_THIS_MEMBER` (R21). Each starts nothing. A test sends a `subscription` credential with a sentinel token and an `apikey` one, finds each refused `NO_CREDENTIAL` with nothing started, and finds the sentinel in no output (R8). *(not yet met: T39)*

R8's first sentence ("a request's secret arrives per request…") stays true but has no case left: re-word it to "It holds no credential of its own, and a request carrying a secret is refused (R2), its secret never written to disk, logged or echoed". Optional, no new behaviour.

Suggestions "Open for BOB (1)": strike it, answered by K2290 / T39 (`signin` only). Purpose's "a member's Claude subscription" stays: it means the member's plan, not the retired credential kind. Status line: "Last changed T39 (T39-8: Terms, R2; N801; K2290); R2 not yet met (T39)."

## L8

### case-grammar (T39-9; N806; K2333) — wording only, no format change

**R12**, the `obscured` paragraph:
- Replace "A `document` row may state `obscured`: the photo travels as its copy (`case-carriage` R11), carrying nothing of the original but its pixels, with its marked areas, if any, covered, never whole; a published case states it for every photo it carries." with:

> A `document` row may state `obscured`: the material is carried as its copy, never whole. That is either a photo (`case-carriage` R11), carrying nothing of the original but its pixels, with its marked areas, if any, covered, or (T39; N806, K2333) a member document's cleaned copy (`case-carriage` R15), every picture in it and the document itself carrying none of their details. A published case states it for every photo it carries, and for every member document it carries as its copy.

- In the same paragraph, replace "`label` the sentence the published case shows beside the material: `case-carriage`'s `OBSCURED_LABEL` when the photo is marked, else null (a copy with nothing covered)" with:

> `label` the sentence the published case shows beside the material: for a photo, `case-carriage`'s `OBSCURED_LABEL` when it is marked, else null (a copy with nothing covered); for a member document, `case-carriage`'s `COPY_CLEANED_LABEL`.

**R13**, the `obscured` kind. Replace "the copy of a photo carried in place of its original" with "the copy of a material carried in place of its original (a photo's, R12; or a member document's cleaned copy, T39)". The departures are unchanged.

**R14**, item 3. Replace "A photo carried as its copy (R12's `obscured`) is listed with the original's fingerprint, the copy's fingerprint and its label, word for word, when it has one (an unmarked copy has none)" with "A material carried as its copy (R12's `obscured`: a photo, or a member document's cleaned copy) is listed with the original's fingerprint, the copy's fingerprint and its label, word for word, when it has one (an unmarked photo's copy has none)". The rest is unchanged: an edition stating no `obscured` renders as before.

No mark: the grammar already reads and writes any `document` row's `obscured`, so only the words change. Satisfies: add "K2315, K2333 (N806): R12–R14's wording". Status line: "Last changed T39 (T39-9: R12–R14 worded for a member document's copy; N806; K2333)."

### case-carriage (T39-10; N806; K2333)

Next free ids: **R15, R16, R17** (R14 is the last).

**Purpose** — add after the T37 bullet:

> - (T39; N806; K2315, K2333) It derives and holds the cleaned copy of each member document, a document a member supplied rather than one this copy fetched. In that copy every picture, and the document itself, carry none of their details (`doc-clean`). A published case carries such a document only as that copy, or whole when it carries no such details. A document this copy fetched is carried as captured. Inside the group every document stays as it came.

Also: "This module owns the two tables of held materials and the table of marks" becomes "…, the table of marks, and the queue and record of member documents' copies".

**New section** after R14: "#### A member document and its copy (T39; N806; K2315, K2333)"

> A **member document** is a document capture that is not a photo (R9's term) and for which `provenance.fetchedByThisCopy` (its R62) answers `fetched: false`. That covers a pulled knock, a capture with no receipt, and a file cut from an archive no copy fetched. A photo is always carried as R11's copy, whatever its source.
>
> - **R15** A member document's copy is derived by `doc-clean.cleanDocument` (its R1–R6) from the original's bytes, read from the evidence store by digest (`record-core`'s `evidenceStore`) as R11 reads a photo's.
>   - **What gets queued.** One queue row per digest for each receipt this module hears that is not a fetch: a `provenance.onReceipt` listener (its R47), registered once at start, queues the capture when the receipt's `via` is not in `FETCHED_VIAS` (its R62). It also queues each member document `documentCopy` (R16) finds neither queued nor derived. Queueing writes one row inside the act's transaction and changes nothing else of it.
>   - **copyBatch.** `copyBatch({limit})` (the scheduler's wake; no route) takes queued documents oldest first, at most `limit` (default and bound `DOCUMENT_COPY_BATCH_MAX`, exported). For each it asks R62 again: a capture now fetched is recorded `public`, and no copy is made. A capture whose register byte count exceeds `doc-clean`'s `CLEAN_MAX_BYTES` is recorded refused `DOCUMENT_TOO_LARGE` without being read. Otherwise the bytes are read and cleaned. `clean` is recorded `clean`, with no copy. A rewritten copy is held under its own SHA-256 where R11 holds a photo's copy, labelled derived and naming its original. It is never registered (`provenance`), never a capture, never graded, never cited and never in a provenance chain. A refusal is recorded `refused` with `doc-clean`'s `{code, detail}`. A read of the evidence store that fails leaves the document queued, retried no sooner than `DOCUMENT_COPY_RETRY_MS` (300,000, exported) after it.
>   - **Its answer.** `{ok: true, copied, clean, public, refused, failed, remaining}`. With no evidence store bound it answers `DOCUMENT_COPY_NO_STORE` (a C-141 row) and derives nothing.
>   - **copyWake.** `copyWake(now)` answers null while nothing is queued. It answers `now` while a queued document has not been tried since it was queued, else the earliest retry instant (its last try plus `DOCUMENT_COPY_RETRY_MS`), never before `now`. The instants it reads live in this module's tables and survive a restart. It writes nothing and never throws, as `file-safety` R39 does.
>   - No act of this module changes, replaces or hides the original. *(not yet met: T39)*
> - **R16** `documentCopy(captureSha)` answers synchronously `{state, copy, refused}`, from this module's tables and R62 alone (no bucket read), so `case-disclosures` R6 can ask it inside a preparation's transaction (`case-authoring`:651). `state` is one of:
>   - `public`: R62 answers fetched, carried as captured;
>   - `clean`: carries no details, carried whole;
>   - `copy`: `copy` the cleaned copy's SHA-256;
>   - `refused`: `refused` `{code, detail}`;
>   - `pending`: queued, not yet derived;
>   - `undetermined`: its tables or R62 could not be read (fail closed);
>   - `photo`: a photo, whose copy is R10's.
>
>   `copy` and `refused` are null when they do not apply. A member document neither queued nor derived is queued (R15) and answered `pending`, the one write it makes. It never throws. *(not yet met: T39)*
> - **R17** `onCopyWork(module, fn)`: a later module (`scheduler`, its R25) registers once at start. A second registration by one module, or a `fn` that is not a function, is refused through `membership.listenerRefusal` (its R81). After an act commits that queues a member document (R15, R16), every registered `fn` is called once with `{at}`, `at` R15's `copyWake` as it then stands. A listener that throws or rejects changes nothing of the act or its answer. No call names a member or a file. *(not yet met: T39)*
>
> `COPY_CLEANED_LABEL` is exported and held once here as protected words held for translation, which the design stream may re-word (proposed key `document.cleaned.label`). BOB's draft: **"Details of who made this file, and of its pictures, removed for publication; the group holds the original"**. It mirrors `OBSCURED_LABEL` (R11).

**R1** — amend the T37 bullet. Replace "**a photo carried as its copy**: a row listed `included: false` whose `obscured` names a `copy` (`case-grammar` R12): the copy's bytes as R11 holds them" with:

> **a material carried as its copy**: a row listed `included: false` whose `obscured` names a `copy` (`case-grammar` R12): the copy's bytes as R11 holds them (a photo's) or as R15 holds them (a member document's, T39)

The rest of the bullet holds unchanged: nothing else of that row is held, and a copy not held is `unheld`. Then add after its T38 sentence:

> (T39; N806; K2333) A row listed `included: true` whose capture is a member document (R15's term) whose `documentCopy` state (R16) is not `clean` is not held. It is answered in `unheld` (`kind` `document`, why "a member's document travels only as its copy"), so no member document's original carrying details reaches the published projection. *(not yet met: T39)*

**R8** — append:

> (T39; N806; K2333) A member document (R15's term), whether carried as its copy or whole, carries none of R8's files, as a photo carries none. A walk that reaches an archive for which `provenance.fetchedByThisCopy` (its R62) answers `fetched: false` carries that archive for no material. It answers it in `unheld` (`kind` `archive`, why "the archive was supplied by a member, and a member's file leaves only as its copy"), and the walk stops there. *(not yet met: T39)*

**R13** — amend:
- Each row `{ref, sha, why}` becomes `{ref, sha, kind, why}`, with `kind` `photo` or `document`.
- After "and a photo row carried whole (`included: true`), always", add:

> (T39; N806; K2333) and, with `kind` `document`: a row stating `obscured` with a member document's copy that is not the document's current copy (R16, its `copy` state's `copy`); and a member document carried whole (`included: true`) whose state is not `clean` or `public`. A document whose state is `undetermined` is answered lapsed (fail closed). *(not yet met: T39)*

**New C-141 row:** `DOCUMENT_COPY_NO_STORE` (R15), numbered at its stamp. BOB's draft translation: "Your group's Civicsmith has no evidence store to make a document's publication copy from. Nothing was made." `documentCopy`'s states are answers, not refusals, so they need no row. `doc-clean`'s codes travel as R16's `refused` with their own rows (L1's family).

**Uses** — add:
- `doc-clean` (T39; N806, K2333; a `modules.json` edge): `cleanDocument`, `CLEAN_MAX_BYTES` (its R1–R6; R15).
- `provenance`: `fetchedByThisCopy`, `FETCHED_VIAS` (its R62) and `onReceipt` (its R47), for R15–R16, beside the `register` read contract.
- `membership`: `listenerRefusal` (its R81; R17).

**Invariants** — add to **R12**: "(T39) The queue and the record of member documents' copies are declared to `record-core` with their classes. A copy's record is never a capture, as R11's is not."

**Suggestions** — add "(T39) Hold a document's copy under `<store>/obscured/<sha>` beside a photo's, so `ratification` R39 copies both one way. Tests:
- a fetched PDF held whole;
- a knock PDF with EXIF in an image carried as its copy only (no original byte, no archive file);
- a refused document (`IMAGE_NOT_CLEANABLE`);
- a pending one;
- R13's two document lapses and its fail-closed arm;
- queueing from a receipt, and from R16's miss;
- a capture fetched after queueing recorded `public`;
- `copyWake`'s three answers;
- a member archive carried for no material (R8)."

Satisfies: add "K2315 (Bob's C), K2333, K2334 (N806): R1, R8, R13, R15–R17". **P6:** 984 + ~350. Status line: "Last changed T39 (T39-10: Purpose, R1, R8, R13 amended; R15–R17 new; N806; K2333); those marked not yet met (T39)."

### publication (T39-11; N806; K2333) — small change only (P6: 3,799)

**R57** — append a bullet after the T37/T38 bullet:

> - (T39; N806; K2333) In the same step, a row `case-carriage.marksLapsed` answers with `kind` `document` (a member document's copy no longer its current copy, a member document carried whole that needs a copy, or one whose state cannot be read) is `DOCUMENT_COPY_CHANGED_SINCE` (C-122.7), naming each, and nothing is committed. Its photo rows stay C-122.6. Both are answered when both hold. The remedy is a new preparation, as R51's. *(not yet met: T39)*

**R67** — after "It answers `{published: true, published_at}` or `{stopped: [{code, translation}]}`", add:

> each stop entry recorded with its `check` and `cause` exactly as the publisher answered them (T39; N805), so a waiting edition stopped by C-122.6 or C-122.7 keeps that code and translation.

It is built (`schedule.mjs`:187–190), so it carries no mark. Its test is T39-13's.

**R33** — append:

> (T39; N806; K2333) C-122.7 (R57): `DOCUMENT_COPY_CHANGED_SINCE`, in the same family, its translation BOB's draft, re-wordable by the UX stream (proposed key `document.refused.changed`): **"A document a member supplied now needs a different publication copy from the one this case was prepared with. Prepare the case again. Nothing was published."** A change moves `CATALOG_VERSION`. *(not yet met: T39)*

**Uses**, the `case-carriage` (T37) line: "`marksLapsed` (its R13, its document rows T39), for R57's refusals". Status line: "Last changed T39 (T39-11: R57, R33 amended, R67 worded as built; N806, N805; K2333, K2308); those marked not yet met (T39)."

### public-read (T39-12; N806; K2333) — wording only

**R23**, the materials bullet. Replace "and, for each photo, which the case carries only as its copy, the copy as one file of kind `obscured` under that row's ref" with:

> and, for each material the case carries only as its copy (a photo, `case-carriage` R11, or a member document's cleaned copy, its R15; T39, N806), the copy as one file of kind `obscured` under that row's ref

Also replace "no route of this module serves a photo's original" with "no route of this module serves the original of a material carried as its copy". The rest is unchanged: read by that hash, never the original, its metadata, its extracted text, or an archive or container record of it.

No mark: the code already carries every row stating `obscured` by its hash, and its served-hash filter (K2308) covers any published `obscured` original. A test that a member document's copy is served and its original never is goes with the N806 tests. Satisfies: add "K2333 (N806): R23's wording". Status line: "Last changed T39 (T39-12: R23 worded for a member document's copy; N806; K2333)."

### ratification (T39-13; N805; K2308) — see B5

**R42** — replace "a refusal of the commit itself (R51, R58, R59, `CASE_EDITION_ALREADY_RATIFIED`) is a stop with that cause, nothing committed" with:

> a refusal of the commit itself (`publication` R51, R58, R59, R57's C-122.6 `PHOTO_MARKS_CHANGED_SINCE` and, T39, C-122.7 `DOCUMENT_COPY_CHANGED_SINCE`, and `CASE_EDITION_ALREADY_RATIFIED`) is a stop, `SCHEDULED_CHECK_REFUSED` (C-58.10), whose `cause` carries the commit's own `code`, `check` and `translation` exactly as it answered them (C-122.6's `photo.refused.changed`), and nothing is committed (T39; N805, K2308). `publication` R67 records the stop with that `cause` (its T39 clause). A test makes a waiting edition whose photo's mark is withdrawn after signing, runs `publishDue` past its time, and finds the edition `stopped` with a reason whose `cause.code` is `PHOTO_MARKS_CHANGED_SINCE` and whose `cause.translation` is that row's translation. *(not yet met: T39)*

**R39** — wording, beside N806: replace "(an obscured copy, `case-carriage` R1, R11)" with "(a copy carried in place of its original: a photo's, `case-carriage` R1, R11, or a member document's, its R15)". It is copied the same way, from where case-carriage holds it. No mark is needed if the copy sits under the same prefix (case-carriage Suggestions): the code copies every `derived` material one way.

Status line: "Last changed T39 (T39-13: R42 amended, R39 worded; N805; K2308); R42 not yet met (T39)."

### case-disclosures (T39-14; N806; K2333)

**R6** — add a bullet after "A photo":

> - **A member document** (T39; N806; K2315, K2333). A document material that is not a photo, whose capture `case-carriage.documentCopy` (its R16) answers, is judged by that state, in this order:
>   1. `undetermined` is `DOCUMENT_COPY_UNDETERMINED`, naming the document (fail closed), whichever chain reaches it;
>   2. `pending` is `DOCUMENT_COPY_PENDING`, naming the document, when a load-bearing chain reaches it; when only supporting chains reach it, it is listed `included: false` with no `obscured`;
>   3. `refused` is `DOCUMENT_NOT_CLEANABLE`, naming the document and `doc-clean`'s reason (`refused.code`), when a load-bearing chain reaches it; when only supporting chains reach it, it is listed `included: false` with no `obscured`;
>   4. `copy` is answered `included: false` with `obscured: {copy, label}`, `label` `case-carriage`'s `COPY_CLEANED_LABEL`. It is presentable through its copy and never `RELIED_ON_NOT_PRESENTABLE` for being held so;
>   5. `clean` and `public` are judged as any document, by what is held (the rest of R6).
>
>   Each refusal writes nothing. A member-supplied archive the chain reaches through a member document is never carried (`case-carriage` R8). *(not yet met: T39)*

**R7** — add after the T37 sub-bullet:

> - (T39; N806) A member document R6 answers with `obscured` is written as a photo's copy row is: its fingerprint, its extracted text's fingerprint, its origin and archived copy (the original's), `included: false`, `obscured: {copy, label}` (`case-grammar` R12), and its attestations as any document's. *(not yet met: T39)*

**R22** — append:

> (T39; N806; K2333) R6's `DOCUMENT_COPY_UNDETERMINED`, `DOCUMENT_COPY_PENDING` and `DOCUMENT_NOT_CLEANABLE` are new rows of this family, numbered at their stamp. Their translations are BOB's drafts (below), re-wordable by the UX stream. `DOCUMENT_NOT_CLEANABLE`'s is read by key `document.refused.clean` and `DOCUMENT_COPY_PENDING`'s by `document.refused.pending`, protected, `{document}` the document named, once the UX stream holds the keys. Until then the module's table holds the draft. *(not yet met: T39)*

Table rows to add (DEC-83: what happened, then what to do; DEC-149's voice):

| row | code | translation |
|---|---|---|
| (T39, at its stamp) | `DOCUMENT_NOT_CLEANABLE` | (`document.refused.clean`) "A document a member supplied can't be cleaned of the details that could show who made it: {document}. Capture it from where it was published, supply a plainer copy, or stop relying on it." |
| (T39, at its stamp) | `DOCUMENT_COPY_PENDING` | (`document.refused.pending`) "The publication copy of a document a member supplied is still being made: {document}. Try again in a few minutes." |
| (T39, at its stamp) | `DOCUMENT_COPY_UNDETERMINED` | "A document this case relies on could not be checked for the details a member's file can carry, so what the published case would show of it is not known. Try again. Nothing was written." |

**Uses**, the `case-carriage` line: add "`documentCopy`, `COPY_CLEANED_LABEL` (its R16, R15; T39, R6, R7)". Satisfies: add "K2315 (Bob's C), K2333, K2334 (N806): R6, R7, R22". Status line: "Last changed T39 (T39-14: R6, R7, R22 amended; N806; K2333); those marked not yet met (T39)."

## L10

### scheduler (T39-15; N806; K2333)

Next free id: **R25** (R24 is the last). New, after R24:

> *The member documents' copies* (T39; N806; K2333)
> - **R25** The consumer `document-copy` joins the registry (R5) after `file-reputation`, calling `case-carriage` and holding R1–R4 and R7, its answer under the key `doccopy` (R2).
>   - `tick(now)` is `case-carriage.copyBatch({})` (its R15).
>   - `due(now)` and `wake(now)` are both `case-carriage.copyWake(now)`, asked afresh at every firing, `arm` and start, so a restarted instance re-derives them from case-carriage's durable state (R11).
>   - A refusal case-carriage answers (`DOCUMENT_COPY_NO_STORE`) is the tick's answer.
>   - This module keeps no instant or interval for it (R7, R18).
>   - At start it registers once with `case-carriage.onCopyWork` (its R17), as R9's notice. Each call runs `arm` (R4) at once, so a member document queued on an idle instance is copied at once. A refused registration is a start-up fault, reported as R23's is. The call writes nothing and runs no tick (R17).
>   - No call names a member or a file. *(not yet met: T39)*

**R2** — add `doccopy` (R25) after `filereputation`. **R5** — add `document-copy` after the five of R24 (R5 names R21's six and, by R24, the five after them; the job confirms R5's sentence names R24's consumers or adds them with this one). **R9** — add "a member document queued for its copy (`case-carriage`, R25)".

**Uses** — add "`case-carriage` (T39; N806, K2333; a `modules.json` edge): `copyBatch`, `copyWake`, `onCopyWork` (its R15, R17), the `document-copy` consumer (R25)". Satisfies: add "K2333 (N806): R25". Status line: "Last changed T39 (T39-15: R25 new, R2, R5, R9 amended; N806; K2333); those marked not yet met (T39)."

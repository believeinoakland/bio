# case-carriage (T38)

**Status** · session_01FXB67DiZhzve12wNqAWQcY · depth 2 · WORKING · handled B3

## J1 · QUESTION

R8 (T38; K2291 (2)): "an archive that also holds any image is carried for no material". To know what an archive holds, case-carriage needs the archive's listing. None of its Uses gives one: provenance's register has no reverse link from an archive to its members, record-core has no read contract over provenance.json, and the archive's own bytes are only in the evidence store, which is async, while R1 is synchronous. The listing is `acquisition`'s `archive_entries` (R38's record, written whole when the archive is first opened; a member is only filed from an opened archive).

My best reading, which I am building now:
(a) A `uses` edge case-carriage → acquisition (layer 3 → layer 8, allowed by P4). `acquisition` states `archive_entries` as a read contract, read in case-carriage's own SQL as it reads `register`: columns `archive_sha`, `idx`, `name`, `kind`, `state`, `sha256`. That is BOB's: `modules.json` and acquisition's requirements.
(b) An archive **holds an image**, judged fail closed, when any of these holds:
  - its listing is not recorded (no row at idx −1);
  - an entry of kind `file` has no name, or a name with an image extension (R9's list);
  - an entry's filed or already-held capture is a photo (R9's term);
  - an entry is itself an archive that holds an image by this rule, recursively. An entry is itself an archive when it has its own listing, or its name ends `.zip` and it was never opened.
(c) The rule applies wherever an archive would leave: in R8's walk, and in R1 when an included document is itself such an archive (`unheld` `kind` `document`, why "the archive holds an image, and an image leaves only as its copy"). Otherwise a photo inside a zip that a case cites directly would leave whole.
If you prefer a narrower reading (for example, only the photos this edition carries, as T37 did), answer and I will narrow it. If `archive_entries` must not be read here, the only fail-closed alternative inside my Uses is that no archive is carried, which defeats R8's purpose.

## Reading set (mechanics §17; K2304 step (3))

The START measured 324 KB, which is over 300 KB, so step (3) applied. I read these whole myself:
- `build/requirements/case-carriage.md`;
- layer 8's row of `build/layers.md`;
- the plan's rules at the opening and entry T38-11;
- `plan/draft-T38-L8.md` §2 and §8;
- K2220, K2248, K2291 and K2303;
- the module's code: `index.mjs`, `checks.mjs` and `schema.mjs` (51 KB);
- the tests this entry changes: `fixture.mjs`, `marks`, `obscured`, `hold`, `archive` and `invariants` (103 KB);
- the used services my Uses names that this entry touches: `image-cover` R1–R3 (its Public part), and `acquisition` R38, R41 and the `archive_entries` schema, for J1.

A worker of mine read `rereads.test.mjs` whole (220 lines, R4 and R5). It wrote a 60-line summary citing each test by line (rereads:29–219). The summary found nothing about photos, marks, R1's rows, R8, R13 or `MACHINE_CANNOT_MARK`. Nothing it left out mattered: my change leaves R4 and R5, and the constructor's dependencies, untouched.

## Entries applied (T38-11)

- **R1 (N779):** a row listed `included: true` whose capture is a photo is answered in `unheld` and nothing of it is held: `kind` `document`, why "a photo travels only as its copy" (exported `PHOTO_ONLY_AS_COPY`). A photo is told as R9 tells one: the capture's recorded `content_type`, else its register path's extension. Per J1 (c), confirmed in B2, an included document that is itself an archive holding an image is answered the same way, with R8's why.
- **R8 (K2291 (2); J1, B2, K2307):** an archive that holds any image is carried for no material, whether or not the case carries the photo. Every walk that reaches it answers it in `unheld` (why "the archive holds an image, and an image leaves only as its copy", `ARCHIVE_HOLDS_IMAGE`) and stops there. "Holds an image" is judged fail closed from acquisition's `archive_entries` (its new R45; the `uses` edge is BOB's).
  - It holds one when the listing is not recorded, or a file entry has no name or an image's extension, or a filed capture is a photo.
  - It also holds one when a nested archive holds one (recursively), or an entry is named `.zip` and was never opened.
  - Folders and links do not count. An archive not held is still answered "not held" first.
  - T37's "sealed" set (only photos this edition carries) is gone.
- **R9 (N790):** `MACHINE_CANNOT_MARK` is now `MACHINE_CANNOT_MARK_PHOTO` (C-141.1, row number unchanged).
  - A mark with no area now derives the photo's copy too, with nothing covered.
  - Every mark derives the copy from the marks that stand.
- **R10:** state is read over the standing marks. Each mark now carries `withdrawn` (`{by, at, reason}`, or null), and withdrawn marks stay listed.
- **R11:** a derivation is written after every mark, and after every withdrawal that leaves a mark standing. It covers every area of the standing marks, `[]` when none has an area.
  - With no standing mark the copy is null.
  - A refusal from `image-cover` is named whether the photo is marked or not.
  - `photo_copies` is now ordered by a new `seq` column. A pre-T38 table is rebuilt once at boot with its rows kept in order (tested).
  - An unmarked copy's bucket metadata carries no `OBSCURED_LABEL`, since nothing is covered (case-grammar R12).
  - Withdrawals run in the same per-capture chain as marks.
- **R12:** a new table `photo_mark_withdrawals` (withdrawal, mark, capture, reason, by, at), unique per mark, declared with the marks' classes (`version_chain: true`). The append-only test now covers mark rows, withdrawal rows and derivations through every act, withdrawals included. A test proves that no withdrawal reason, maker, kind or rectangle reaches a copy's bytes.
- **R13 (B3, K2308):** a photo row carried whole always lapses (why "a photo travels only as its copy"). A non-photo document carried whole never lapses. An `obscured` row whose copy is not the current one lapses with why "a mark on the photo was added or withdrawn since the case was prepared, so its copy is no longer the one the case names". Unreadable marks lapse with why "the photo's marks could not be read, so its copy cannot be confirmed".
- **R14 (N788):** `obscureMarkWithdraw({captureSha, mark, reason, by})`, with `op=obscuremarkwithdraw` in `caseCarriageOps` (`by` from the query only; the mark, as a number or a numeric string, and the reason from the body).
  - Refusals, in this order: `MACHINE_CANNOT_WITHDRAW_MARK` (C-141.7), `NO_SUCH_PHOTO`, `NO_SUCH_MARK` (C-141.8), `MARK_ALREADY_WITHDRAWN` (C-141.9, naming when and by whom in `detail` and `withdrawn`), `WITHDRAW_NO_REASON` (C-141.10; 1 to `WITHDRAW_REASON_MAX` = 2,000 characters).
  - Any member who may see the photo may withdraw (K2291's reading).
  - The answer is `{ok, mark, withdrawal, …R10 after the act}`.
  - **The four translations are BOB's drafts** in `checks.mjs`, which the UX stream may re-word. Each ends "Nothing was recorded.", as C-141's other rows do.
- **N790 test:** each C-141 code is held once and is held by no family of the modules I use. The composed catalogue itself is answer-envelope's (L11), which I may not import (P4).

**Deferred.**
- A photo marked only "nothing to obscure" before T38 has no derivation row until its next mark or withdrawal. `photoMarks` answers `copy: null` for it, so `case-disclosures` refuses a case relying on it (fail closed) until a member acts on the photo again. A synchronous read cannot derive a copy, and a boot-time backfill would need the bucket at boot.
- My requirements' Uses does not yet name `acquisition` (`archive_entries`, its R45; R8). That line is BOB's.

## Found in other modules (REPORT J2)

- **op-declarations** (T38-15, L11):
  - `t37.test.mjs`:125 (R38) pins `obscuremark`'s machine refusal as `MACHINE_CANNOT_MARK`; it is now `MACHINE_CANNOT_MARK_PHOTO`.
  - `t33.test.mjs`:210 (R19, R6) is red: "case-carriage: obscuremarkwithdraw has no spec". The declaration is owed by T38-15.
  - `index.mjs`:413's comment names `MACHINE_CANNOT_MARK`.
  - `op-grades/t37.mjs`:8 names it too.
  - The draft for L11 (`draft-T38-L11.md`) uses `WITHDRAW_NO_REASON` and `MACHINE_CANNOT_WITHDRAW_MARK`, the codes merged here.
- **plane** `disclosures.test.mjs`:74 (R18, R5) pins case-carriage's ops as `[obscuremark, photomarks]`; it is now three, with `obscuremarkwithdraw`.
- **answer-envelope** `families.test.mjs`:360 names `MACHINE_CANNOT_MARK` as kept by sources' row. After N790, C-141.1 is `MACHINE_CANNOT_MARK_PHOTO`, decorated with case-carriage's own row. That test is already red on `tranche/T38` before my change.
- **promotion** (stamp): C-141.1 is re-coded and C-141.7 to C-141.10 are new, all awaiting stamp (rule 6 item 2; T39's promotion).
- **Generated artifacts:** the plane bundle is staled by this merge (accepted red 8).
- **A wider finding (for BOB; N779's scope):** a PDF or office document that embeds photos carries them, with their metadata, when it is cited whole. K2248 speaks of photos as captures; whether embedded images count is Bob's.

## Tests and checks

- case-carriage (`bio-plane/test/m/case-carriage/`, 8 files, the new one `withdraw.test.mjs`): 56 tests, 56 pass, 0 fail.
- Users at my head against `tranche/T38` (before B2 and B3), 843 tests each: head 831 pass, 11 fail; base 834 pass, 8 fail.
  - The 8 base failures are inherited: answer-envelope ×3, op-declarations ×2, plane `stats` ×2, and `migrate-released`.
  - The 3 failing only at my head are the op-declarations and plane items above.
  - After B3: publication, case-disclosures and case-authoring 362 tests, 361 pass, 0 fail.
- Process checks (`civicos-process/checks/`):
  - `format.mjs`: 137 modules, 0 failures.
  - `architecture.mjs case-carriage`: 11 product files, 0 failures.
  - `coverage.mjs case-carriage`: 14 of 14 live ids named, 0 failures.
  - `ownership.mjs case-carriage tranche/T38`: 0 failures.
- **P6:** 815 lines at the opening; now 984 (`index.mjs` 798, `schema.mjs` 130, `checks.mjs` 56).

Size (session_01FXB67DiZhzve12wNqAWQcY): test runs 22, module lines 984

## J2 · REPORT

Findings in other modules from T38-11. The detail is in my record under "Found in other modules".
- **op-declarations** (T38-15):
  - `t37.test.mjs`:125 pins `obscuremark`'s machine refusal as `MACHINE_CANNOT_MARK`; it is now `MACHINE_CANNOT_MARK_PHOTO` (N790).
  - `t33.test.mjs`:210 is red: `obscuremarkwithdraw has no spec`. The declaration is owed by T38-15.
  - The codes merged here: `MACHINE_CANNOT_WITHDRAW_MARK` C-141.7, `NO_SUCH_MARK` C-141.8, `MARK_ALREADY_WITHDRAWN` C-141.9, `WITHDRAW_NO_REASON` C-141.10.
  - Comments in `op-declarations/index.mjs`:413 and `op-grades/t37.mjs`:8 still name `MACHINE_CANNOT_MARK`.
- **plane** `disclosures.test.mjs`:74 pins case-carriage's ops as `[obscuremark, photomarks]`; `obscuremarkwithdraw` is now added.
- **answer-envelope** `families.test.mjs`:360 names `MACHINE_CANNOT_MARK` as sources'. That test is already red on the tranche before my change.
- **promotion:** C-141.1 is re-coded, and C-141.7 to C-141.10 are new and awaiting stamp. The four translations are BOB's drafts, for UX-DESIGN to re-word.
- **The plane bundle** is staled by this merge (accepted red 8).
- **For BOB/Bob (N779's scope):** photos embedded in a PDF or office document cited whole leave with their metadata. K2248 speaks of photo captures only.
- **My requirements' Uses** does not yet name `acquisition` (`archive_entries`, its R45; R8).

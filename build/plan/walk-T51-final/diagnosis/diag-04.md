# Diagnosis of the BROKEN rows of sittings 04a and 04b (K4426)

Read: `04a-documents.md` (all 59 KB, in order) on `origin/prep/final-04a-documents`, `04b-documents.md` (all) on `origin/prep/final-04b-documents`, with their scripts. Both records re-fetched at the end: unchanged since first read (04a 1 BROKEN row of 33 shown; 04b 4 BROKEN rows). Product read on `tranche/T51` (HEAD 9f3d643fb1). Nothing in the repository was edited.

Summary table

| record | row | verdict | owning module |
| --- | --- | --- | --- |
| 04a | R30 (d) heldat "changed" for a changed plain page reads `undetermined` | SPECIFIED (C26; walker's page earns no determined digest). One requirement-text lag for BOB | capture (text); nothing to build |
| 04b | R39 refusals: a 7 MiB file as base64 is refused `KNOCK_ENVELOPE_TOO_LARGE` | DEFECT (code follows R1/R6 literally; the requirement is self-defeating) | doorbell |
| 04b | R39 profile words "an unrecognised document" for text and CSV | WORDS, ALREADY PLACED (`build/plan/later-ux.md:117`) | site-profiles (label) / UX design stream |
| 04b | R39 pulled document's title carries the raw knock id | DEFECT (raw id shown to a member), partly WORDS | store-door (+ setup-words row via UX words) |
| 04b | R39 "Already held" shows the holder: `holder` null although the viewer may see it | DEFECT | store-door |

---

## 04a, R30 (d): the look words, `changed` when the site's bytes differ (heldat)

Record: `04a-documents.md` line 21. Check: heldat `check=true` before and after the walker changed what the site serves. Saw: unchanged case `unchanged`; changed case `{"state":"undetermined","basis":"the bytes the site gives differ from this copy's, but this copy recorded no determined digest of its substance, so whether the page itself has changed cannot be told", ...}`.

**Verdict: SPECIFIED (not a product defect). Walker fixture error in the sense that its page cannot reach `changed`.**

1. Root cause. `bio-plane/src/capture/index.mjs:1900-1911` (heldAt, the check arm):
   `/* R96 (C26): the bytes differ, which a page that rebuilds itself on every visit does whether or not its substance changed. Change is judged on the determined (substance) digest ... with no determined digest on the copy, or on what the site serves, the answer is that it cannot be told, never changed. */`
   `const bd = baseline && baseline.digests; if (!bd || bd.determined !== true || typeof bd.evidentiary !== "string" || !bd.evidentiary) return cannot(localize("capture.index.heldat_baseline_no_digest", "the bytes the site gives differ from this copy's, but this copy recorded no determined digest of its substance, so whether the page itself has changed cannot be told"));` (index.mjs:1909-1910). This is the exact sentence the walker saw.
   Why the copy has no determined digest: `bio-plane/src/acquisition/index.mjs:187-199` `substanceDigests`: `const digestCertain = !!profileBytes && stackId.handler.textual === true && stackId.confidence === CONFIDENCE.CERTAIN;` then `if (!digestCertain) return { determined: false, ... }`. The walker's page (`04a-documents.test.mjs:226`, a bare `<!doctype html>` with a paragraph, a stylesheet link and an img, no framework header or markup) matches no host stack, so `identify` falls to `site-profiles/handlers/conservative.mjs` ("Never claims a match", confidence NONE), never CERTAIN, so `determined: false`. The same record's `monitor` row says so too ("the captured baseline recorded no determined evidentiary digest, so the raw bytes were compared").
   The screen draws the `undetermined` branch by requirement: `build/requirements/screens-intake.md` R38: "`held` true and `changed.state` `undetermined`: the row says the team holds the copy and that whether the site changed is not known; it never says unchanged or changed (R96)". So `undetermined` for a plain page is the C26 fix (walk-build C26: "compares raw bytes ... a static page re-checked minutes later is called changed"), working as built.
   Text lag (for BOB, a requirement wording fix, not a code fix): `build/requirements/capture.md` R96 still reads "other bytes are `changed` with `served_sha256`" with no C26 clause. Code (`index.mjs:1900-1925`) and the test below state the C26 rule; R96 should carry it (and the consequence that `changed` is reachable only for a page whose stack is recognised CERTAIN: ASP.NET WebForms, WordPress, etc.).
   Observation, not a defect: for the same plain page `op=monitor` answers `modified` by comparing raw bytes (`monitoring` R5 "Otherwise ... raw bytes"), while `heldat check` answers `undetermined`. Two surfaces, two designed rules.
2. Why the module tests did not catch it: they did and pin it. `bio-plane/test/m/capture/fix2-t51.test.mjs:233` "R96 (C26): a baseline with no determined digest cannot tell whether the site changed: other bytes read undetermined, never changed" (including `plain` bytes, line 247-248), and `:213-232` the control that an ASP.NET page whose substance changes reads `changed` with `served_sha256`. The walker's expectation came from its brief, not from R96 as built.
3. Failing-first test: none to add (behaviour is correct). The walker's case through the real path, corrected to reach `changed`: serve the page with `x-powered-by: ASP.NET` and a `__VIEWSTATE` input and `<main role="main">` (as `fix2-t51.test.mjs:171-182` do), capture by `acquire`, change the `<main>` text, `heldat check=true` -> `changed` with `served_sha256`. Walker's file for that: `build/plan/walk-T51-final/scripts/04a-documents.test.mjs` (change the fixture, expect `undetermined` for the plain page).
4. Owning module: `capture` (`bio-plane/src/capture/`) for the text of R96 only; `acquisition` holds the digest rule (`substanceDigests`). No code change. Platform: none (Node/Miniflare, pure).
   Placement: not in `fix-round-10-T51.md` §1-§3, `fix-round-10-waves.md`, `later-ux.md` (grep for heldat, undetermined: nothing). Original source is walk-build C26 (MINOR, closed as the `undetermined` answer).

---

## 04b, R39: refusals by name and sentence (a 7 MiB file as base64 turned away)

Record row 12. Every other refusal matched (KNOCK_EMPTY, KNOCK_PAYLOAD_TOO_LARGE, KNOCKER_SECRET_WEAK, bad base64 -> 400 REQUIRED_ARGUMENT_MISSING, body over cap -> KNOCK_ENVELOPE_TOO_LARGE). The BROKEN is `s-r39.mjs:88-100`: `seven = knock({contentB64: base64 of 7 MiB})` -> `413 KNOCK_ENVELOPE_TOO_LARGE`, when the published content bound is 8 MiB.

**Verdict: DEFECT (the code does what R1/R6 say; the requirement cannot be met by any file near its own stated bound).**

1. Root cause. `bio-plane/src/doorbell/door.mjs:101`: `if (raw.byteLength > KNOCK.maxBytes + 4096) return refuse(knockEnvelopeTooLarge(), 413);` with `door.mjs:20` `maxBytes: 8 * 1024 * 1024`. The check is made on the raw request body, which for a file is JSON holding the file base64-encoded (4/3 larger): the largest file the door can take is (8 MiB + 4096) * 3/4, about 6.0 MiB. A 7 MiB file is 9.33 MiB of base64, over the envelope. The decoded-size refusal (`door.mjs:115-116`, `if (bytes.length > cap) return refuse(knockPayloadTooLarge(cap, evidence), 413)`) is therefore unreachable for a base64 knock between 6 and 8 MiB, and "8 MiB with an evidence store" (`doorbell.md` R1, R7; `maxBytes` published in both answers) is false for files. The product's own screen sends exactly this shape: `bio-plane/src/screens-publish/doorbell.mjs:72` `const body = { contentB64: btoa(bin) };`, so a member's 7 MiB PDF gets "That is too large to hand over here." (`screen.doorbell.refused.large` for `KNOCK_ENVELOPE_TOO_LARGE`, doorbell.mjs:58-59) while the published bound says 8 MiB. Spec: `build/requirements/doorbell.md` R1 "The envelope over the byte cap plus 4 KiB is `KNOCK_ENVELOPE_TOO_LARGE`" and R6 "A request body longer than the byte cap (8 MiB) plus 4 KiB": R6 counts the body, not the content, so code and spec agree and the spec is the fault (DEC-108 (6) gave the 8 MiB content cap; the envelope allowance is a detail, BOB's).
   Fix shape (BOB rules, amends R1 and R6): the envelope bound is the base64 length of the content cap plus the 4 KiB for the other fields, `Math.ceil(KNOCK.maxBytes / 3) * 4 + 4096` (11,184,812 + 4096 B); `maxBytes` in the envelope answer states the 8 MiB content bound as today. The content cap and the decoded refusal are unchanged.
2. Why the module tests missed it: every size test uses `contentText`, whose JSON length equals the content length, so cap + 4096 looks right: `bio-plane/test/m/doorbell/doorbell.test.mjs:88` (raw `"x".repeat(maxBytes + 4097)`), `:100` and `:180` (`contentText` of `maxBytes + 1`), `:168-174`, `inbox.test.mjs:243-247`. No test sends `contentB64` near the cap, which is the only form a file can take.
3. Failing-first test: `bio-plane/test/m/doorbell/doorbell.test.mjs`, new test "R1/R6: a file of 7 MiB sent as contentB64 is kept; exactly 8 MiB is kept; 8 MiB + 1 B is KNOCK_PAYLOAD_TOO_LARGE (not the envelope); a body past the base64 of 8 MiB + 4 KiB is KNOCK_ENVELOPE_TOO_LARGE", through `send(knock({ contentB64: Buffer.alloc(7*1024*1024, 66).toString("base64"), fileName, mediaType, note: "n".repeat(2000), contact: "c".repeat(300) }))`; red now (413 envelope), plus the same file through the walker's door op. Controls: the existing text cases at :88, :100, :180 stay.
4. Owning module: `doorbell` (`bio-plane/src/doorbell/door.mjs`; requirement doorbell R1, R6). Users: `screens-publish` (no change; its refusal word stays for a true oversize). Platform: Miniflare (L) is enough; one live-copy check at redeploy that a 7.9 MiB base64 body (10.5 MiB) reaches the Worker (the Cloudflare request body limit is far above this). Not placed in fix-round-10 §1-§3, waves or later-ux (grep: doorbell appears only as the fixtures wave line 173 and later-ux "Doorbell small points").

---

## 04b, R39: profile words for a pulled plain text and CSV

Record row 19. Saw: both profiles "an unrecognised document / a document of no recognised type".

**Verdict: WORDS. ALREADY PLACED: `build/plan/later-ux.md:117` ("Add, Held · the profile label "an unrecognised document" for a CSV and a text file · A G76 MINOR (carried from round 7 §2b) · fix round 8 §5 · 2026-10-23"), also `build/plan/archive/fix-round-8-T51.md:492`.**

1. Root cause. G76 (`build/plan/archive/fix-round-7-T51-s1-s5.md:215`; owner site-profiles) removed the false "builds its pages in the browser" profile for non-HTML text: `identify` now falls through to `site-profiles/handlers/conservative.mjs:22-24` `key: "conservative", label: "an unrecognised document"`, and `docprofile/doctypes/registry.mjs:176` reads the unmatched text as the generic type, label `doctypes.generic.label` "a document of no recognised type" (`bio-plane/src/setup-words/rows.mjs:22267`, origin "code"). `site-profiles/index.mjs:343` copies the handler label into `handler_label`. Handler and kind are right (not a shell, no warning); only the label is a sentence a member reads. G76's fix round 7 §2b recorded the label as MINOR carried; no handler or content-type recogniser for plain text and CSV exists, so no code decides this differently. No raw id, no null: wording only.
2. Why the module tests missed it: the G76 tests (`site-profiles/test/r7-plain-text.test.mjs`, reading-pipeline `read` of a CSV) assert the handler is not `client_rendered` and the warning is absent, never the label; `docprofile/test/fixtures/g48-answers.json:343,426,537` record the label "an unrecognised document" as the expected answer.
3. Failing-first test: none yet (wording); once UX design gives the label, `site-profiles` test: `identify` of CSV and plain-text contexts answers a `handler_label` that is not "an unrecognised document" (and `doctypeFor` likewise), and the pulled knock's `document.profile` through `bio-plane/test/m/store-door/pull.test.mjs`.
4. Owning module: the label is `site-profiles` (`handlers/conservative.mjs`) and `docprofile` (`doctypes.generic.label`); the decision of the new words belongs to the UX design stream (T52 list). Platform: none.

---

## 04b, R39: the pulled document's title carries a raw knock id

Record row 20. Saw: three titles in the member's `op=list` such as "Material handed in at the doorbell (KNOCK-2026-10-25-780ea6e1)".

**Verdict: DEFECT (a raw id in a sentence a member reads; the wording itself came from the design stream).**

1. Root cause. `bio-plane/src/store-door/pull.mjs:33`: `const title = word("store-door.title.material_handed_doorbell", { knock_id: String(knockId) })...slice(0, 200);` and the title is stored in the bundle front matter (`pull.mjs:39`, `title: ${JSON.stringify(title)}`) and `meta.title` (`pull.mjs:75`). The word row, `bio-plane/src/setup-words/rows.mjs:15556`: `["store-door.title.material_handed_doorbell","Material handed in at the doorbell ({knock_id})","store-door, =title",null,false,"design"]` (from `docs/development/ux-substrate/screens/words-mod-3.src.py:1057`). Every list names the document by its stored title ("the stored title wins", `screens-intake.md` R54 as amended by fix round 7 G75), so `op=list`, the Held list, the project's documents and the Document page's name show the knock id. Requirement: `screens-intake.md` R32 (3): "No source id (`SRC-...`) or knock id (`KNOCK-...`) is drawn as a heading or a sentence; a delivery's id appears only on a folded "Reference" line". The Inbox itself obeys (`screens-intake/inbox.mjs:59-65` names a card by what was handed in and when); the filed document is the leak.
   Related, not the same site: `later-ux.md:19` "Vouch rows · ... name a knock by raw id" (the Queue's vouch row names the knock's locator `knock:KNOCK-...`, `setup-team` S-04) and `later-ux.md:53` (Inbox knock name/type words); neither names the document's title, so this is not ALREADY PLACED, but the fix of the vouch-row wording should be read with it.
2. Why the module tests missed it: `bio-plane/test/m/store-door/pull.test.mjs` asserts the bundle id (`:81` `/^INFO-\d{4}-0001-doorbell-knock$/`), the transaction and the answer, never the stored title (grep for `title` in that file: none); `bio-plane/test/m/control-plane/inbox-door.test.mjs:67` and `doorbell.test.mjs:364,436` likewise; no screens-intake test reads a pulled document's title.
3. Failing-first test: `bio-plane/test/m/store-door/pull.test.mjs`: after `pullAndFile` of a knock, the bundle's `meta.title` and the front-matter title do not match `/KNOCK-\d{4}-\d\d-\d\d-[0-9a-f]+/` and name what was handed in and when (the date of the knock); and the walker's path, `bio-plane/test/m/control-plane/inbox-door.test.mjs`: `inboxpull` then member `op=list` titles carry no `KNOCK-` id. Red now.
4. Owning module: `store-door` (`bio-plane/src/store-door/pull.mjs:33`). It needs a new words row from UX DESIGN (the row carries `{knock_id}` and is design-origin; the placeholder becomes the knock's date, e.g. `{when}`, supplied by the code from `at`), so the words go in the round's HANDOFF; `setup-words` receives the row. Platform: none (Node/Miniflare). Not placed in fix-round-10 §1-§3, waves or later-ux (see above).

---

## 04b, R39: "Already held" shows the holder (holder null though the viewer may see the bundle)

Record row 21. Saw: second knock of the same bytes, pulled by the same member: `existed true; holder null; bundle {"bundleId":"INFO-2026-0001-doorbell-knock","bundleSha":null,"existed":true}`; the same member's `op=list` shows that bundle.

**Verdict: DEFECT. The walker's own note names the site and it is right.**

1. Root cause. `bio-plane/src/store-door/pull.mjs:117-118`:
   `const pulled = await (resolve ? doorbell.inboxResolve({ knockId, status: "pulled", by, reason, at, within })`
   `                             : doorbell.pullKnock({ knockId, by, at, within }));`
   `pullAndFile` has `viewer` in its arguments (`pull.mjs:110`, `export async function pullAndFile(deps, { knockId, by, identity, viewer, ... })`, and `dispatch.mjs:527-530` passes `viewer: q("viewer")`), and puts it in `who` (`pull.mjs:114`) for the promotion, but never hands it to the doorbell. In `bio-plane/src/doorbell/index.mjs:548,580` both take `viewer = null`; the holder arm `index.mjs:613` is `holder: this.#sees(viewer, home.bundleId) ? home.bundleId : null`, and `#sees` (`index.mjs:715-721`) returns false for a missing viewer (`viewerPredicate(null)` scope DENY). So the answer is always `holder: null` through the door's `inboxpull` / `inboxresolve` (store-door) route, though `doorbell.index.mjs:811,816` (the doorbell's own routes) pass `viewer: q("viewer")`. Spec: `doorbell.md` R13 (T50, N1194): "`holder` the holding bundle's id when `viewer` may see it (membership R43), else null"; `screens-intake.md` R32 (2): the screen draws `screen.inbox.alreadyheld` with the holder "when the answer names it", else `screen.inbox.alreadyheld.other`. Effect: a member who may see the holding document is always told "held by another, you may not see it".
2. Why the module tests missed it: the doorbell's `held.test.mjs:26-78` calls `pullKnock({viewer})` directly (and its :74 test the route stamp), so the doorbell is proven; `store-door/pull.test.mjs` passes `viewer: "member:ann"` at every `pullAndFile` call (:118, :218, :259, :286, :390) but asserts no `holder` anywhere (grep: none), and its dedup case does not pull a second knock of held bytes; the screens-intake tests set the answer by hand.
3. Failing-first test: `bio-plane/test/m/store-door/pull.test.mjs`: two knocks with the same bytes; `pullAndFile` the first as ann; `pullAndFile` the second as ann (`viewer: "member:ann"`, with the home bundle visible to her): `a.holder === firstBundleId`, `a.existed === true`, and again through the resolve arm (`resolve: true, reason`); control: a viewer who may not see the bundle gets `holder: null`. Then the walker's case at the door, `bio-plane/test/m/control-plane/inbox-door.test.mjs`: second `inboxpull` answers `holder` equal to the first bundle id. Red now (holder null).
4. Owning module: `store-door` (`bio-plane/src/store-door/pull.mjs:117-118`: add `viewer` to both calls). Users: `screens-intake` (no change; it already reads `holder`), `control-plane` (the seam test). Platform: none (Node/Miniflare). Not placed in fix-round-10 §1-§3, waves or later-ux (grep: no `holder` placement for the pull).

---

## G76, where placed

G76 is the cause "A CSV or plain text is profiled 'an application that builds its pages in the browser' or 'an unrecognised document'" of fix round 7 (`build/plan/archive/fix-round-7-T51-s1-s5.md:215`, owner site-profiles, merged in round 7; extraction's repair closed with no change by B45/J31; plane's `g48-classify` re-record B69). The handler half is fixed. The remaining label "an unrecognised document" is carried as MINOR to `build/plan/later-ux.md:117` (T52, UX design stream; first entered `build/plan/archive/fix-round-8-T51.md:492`). It is not in `fix-round-10-T51.md`, `fix-round-10-waves.md` or `fix-round-10-words.md`.

## Notes beyond the BROKEN rows (not diagnosed, for BOB)

- 04a rows scored WORKS whose recorded data look wrong, to be judged by BOB: R36 "oversize (1819895 B): 200 {ok:true,...}" where the row's check says `WORKBOOK_TOO_LARGE` should refuse (04a-documents.md line 82); R32 "author is server-stamped" scored NOT REACHED with `TESTIMONY_AUTHOR_SUPPLIED` (the refusal is the stamped behaviour); R32 observation "grade D present false; 'not applicable' false"; R34 UI "Next page controls 0", "Showing: none".
- 04b limits: the `doorbelltally` is read by a member session only; the founder's admin session is refused `MEMBER_SESSION_REQUIRED` (as `doorbell` R3 fences).

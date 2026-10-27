# Placement of the 0.87.0 live walk's causes for T52 (§2)

> Split (mechanics §17) of the placement draft written by a placement worker for BOB #318 from `causes-A.md` to `causes-E.md`; parts: `placement-entries-1.md`, `placement-entries-2.md`, `placement-entries-3.md` (§1), `placement-boundaries.md` (§2), `placement-design-unknown.md` (§3, §4, counts). BOB's decisions on it: K-ruling of the placement.

## 2. Boundary questions

Rule applied: a fix lands in the one module that owns the cause (K4164). The owner is the module that holds the rule or the data whose error or absence is the cause. A module that only draws what the owner answers gets its own entry after the owner's (never a copy of the rule). Where one module can do the whole fix through a read that already exists, it is the one.

**BQ1 · D-K1** (connections' snap key with milliseconds and `_links_` vs record-grammar's C-12.2 key pattern). Candidates: (a) connections writes a conforming key: changes `connections/index.mjs:1030` only; existing bundles (the `_links_` entries already on live copies) stay unmappable; (b) record-grammar's C-12.2 accepts the documented key family: clears new and existing bundles, regenerates `case-checker`; (c) promotion refuses a malformed `snapKey` at write: would also refuse strength `_bar`, investigation `_plan`/`_close`, contradiction `takeup_`/`resolve_` writers that do not fit today, and clears nothing existing. **Recommend record-grammar (b) alone (W1)**: it is the only one that clears existing bundles (history cannot be rewritten), it makes (a) and (c) unnecessary, and its sweep test over every `snapKey:` writer answers the same-shape risk. Not (c) now. `[ruling]` because a catalogue rule's text widens.

**BQ2 · B-K1** (store-door's pull writes no `data/dataset.json`; ratification's ENTRY_REQUIREMENTS). Candidates: ratification relaxes `release.mjs:195-201` (rejected: "mints records the catalog immediately rejects"; the rule is right and the 94 eligible captures pass it); three matching edits in store-door, control-plane, provenance (the shape K4164 forbids); one shared helper owned by one module with the three filers calling it. **Recommend the helper in provenance (W5)**, which owns the document/provenance shape and is earlier in layer than the other two (provenance 43, store-door 156, control-plane 171); the callers are thin entries W22, W33 tested through their own entry (knock, archive member), the testimony through W5. Ratification untouched. The helper reuses `screens-intake/capture.mjs:141-189`'s dataset construction (move the construction into the helper if screens-intake may call it, otherwise copy its R23 result's shape and test they agree; BOB decides at the job).

**BQ3 · A-K2** (tasks vs screens-daily). tasks changes `taskForward` to refuse a target who cannot see `refers_to`, and to answer who can; screens-daily changes the offer (drop oneself, offer only those who can). **Recommend tasks owns the cause (W20)**; screens-daily's draw follows (W28, after W20), drawing tasks' list and removing the viewer.

**BQ4 · A-K6** (screens-settings vs member-roster). The name ("Not joined yet") is screens-settings alone (`m.cover` is in the row). The tally needs a field `memberList` does not return. **Recommend member-roster adds the field (W3), screens-settings draws name and tally (W26, after W3).**

**BQ5 · A-K8** (membership / member-roster / screens-inquiry). (a) no sentence on success: screens-inquiry (W29). (b) invited vs joined: membership answers two codes (W4). (c) the owner's handle: not in `memberByHandle` (pinned by R48 and its tests), so `projectInvite` checks `founderHandle()` first, in membership (W4); the screen comparing with the viewer's handle would only stop this one entry. **Recommend membership (W4), W29 maps its answers.**

**BQ6 · A-K11** (interface-shell vs screens-daily). One rule, what the number counts (snoozed excluded). **Recommend interface-shell owns the one function (W23)** since it draws three of the five places (top bar, rail, 390 bar); screens-daily's Queue line uses it (W28, after W23). Home's strip chip and the sidebar "6" are not placed (DS, U4).

**BQ7 · A-K12** (interface-shell vs screens-entry). `front.mjs` has no arm and cannot know why it is shown; the shell holds the reason (kept return address). **Recommend interface-shell (W23)**, screens-entry untouched.

**BQ8 · A-K14** (interface-shell vs screens-entry). (a) two lock forms: either could go; the shell runs both paths (`:1633-1634`, `lock()` `:1763-1768`); (b) the tip is the shell's. **Recommend interface-shell (W23) for both; the front's lock form stays.**

**BQ9 · A-K16** (wizard-scripts vs screens-wizards). The data names "BOB"; the draw prints what it is given. **Recommend wizard-scripts (W19).**

**BQ10 · B-K3** (screens-intake / interface-shell / file-safety). Candidates: screens-intake draws pages (needs page pictures; none confirmed to exist as an op); the shell gives a byte answer a way to show inline (kit change, `browser.mjs:596-612`); file-safety answers page images (requirement R5 says "pages"). The diagnosis does not establish which op supplies page pictures. **Recommend screens-intake owns the defect (W27)**: its sentence promises "open below" and draws nothing; the job's first step is to confirm what `op=safeview` returns; if the only way to show the PDF is a new kit function, that is a second entry in interface-shell, ordered first, and BOB places it then. `[ruling]` where pages are drawn is a UX decision (inline PDF or page pictures).

**BQ11 · B-K5** (screens-daily vs query-language/retrieval). Two causes: the marker `[`/`]` in-band (only the plane knows the match: **query-language, W10**) and what a record's snippet shows (the screen decides: **screens-daily, W28, after W10**). Not a single module.

**BQ12 · B-K7 + C-K16** (raw ISO instant in the stored authority sentence; writers capture, doorbell, acquisition (and `acquisition/unpack.mjs:842`); drawer screens-inquiry). Candidates: the three/four writers (matching edits; and already-stored records keep the instant); a shared helper (still leaves stored records); the Document page formats an instant inside a stored sentence (one module; covers old and new). **Recommend screens-inquiry (W29)**. The sibling D-K4 (`case-disclosures/index.mjs:363`) builds its sentence at read time, so its owner is case-disclosures (W12), not this question. `[ruling]` if BOB prefers the writers (then one helper module and three call sites).

**BQ13 · C-K2** (inquiry / screens-inquiry / entities). Requirement and UX before placement: which screen states a question's subject. **Recommend screens-inquiry (W29)** once ruled; `inquiry` only if no existing op changes the subject of an existing question (the job confirms; `inquiry/index.mjs:594-599` shows creation with a subject works). Depends on W6.

**BQ14 · C-K4 + D-K11** (screens-inquiry vs strength). `strength/index.mjs:1163` falls back to `part ${k + 1}` for an unnamed group only because the screen sends unnamed groups; the screen can send its own names. **Recommend screens-inquiry (W29)**; strength unchanged. Whether a cutting leg is compared with a supporting one (strength R12) is `[ruling]`.

**BQ15 · C-K5** (citation vs screens-inquiry). A citation edge is per document; a question's citation is a passage. **Recommend citation owns the cause (W11)** (one passage's leg moves; or its refusal names the other passage); `[ruling]` because it decides the record's model. The wrong sentence (missing `refusals` map) is a separate cause in screens-inquiry (W29).

**BQ16 · C-K6** (money vs screens-investigate). The sentence printing `*` is money's; whether the screen offers a field the team cannot satisfy depends on where a fiscal year is stated. **Recommend money (W8)**; screens-investigate unchanged until Bob rules the field's home.

**BQ17 · C-K7** (screens-investigate / money / explore). The screen already sends the set id; no owner answers it. **Recommend money (W8)**: `neighbours` answers a set id (payer, payee, document by title). explore only assembles.

**BQ18 · C-K9** (capture vs screens-inquiry). **Recommend screens-inquiry (W29)** with a read that already takes a name (the money screen's "Search your documents"); capture gets a name filter only if no such read fits (then a second entry, capture first).

**BQ19 · C-K10** (events vs screens-investigate). **Recommend events adds the relations to the timeline item (W7); screens-investigate draws them (W30, after W7).**

**BQ20 · C-K13** (pdf-pixels vs ocr-worker). The detector judges faint text as no text; ocr-worker obeys `text_found:false` by its design. **Recommend pdf-pixels (W2)**; the job's first step logs `lines`/`median` to confirm which test tripped.

**BQ21 · C-K22** (explore vs screens-investigate). Three separate defects: the node name (explore, W9), the letter without a word and the source link (screens-investigate, W30). Not one cause.

**BQ22 · C-K1 + D-K2** (screens-inquiry vs screens-publish vs strength). The plane (strength) is right. **Recommend screens-inquiry (W29)**: the unrated sentence leads to the fold. The publish gate (may a case with an ungraded axis publish) is Bob's policy `[ruling]`; screens-publish does not change until ruled.

**BQ23 · D-K4** (case-disclosures vs screens-publish). The sentence is made in case-disclosures with a machine instant; the ceremony prints it. **Recommend case-disclosures (W12).**

**BQ24 · D-K9** (case-check vs screens-publish). A published edition answers `none` when no check row exists. **Recommend case-check (W15)**: it is the wrong answer; the ladder then reads right unchanged. The "Draft" heading and the next-edition offer are a flow question in screens-publish (W31, `[ruling]`).

**BQ25 · D-K15** (review vs screens-publish). The sentence is right for a member to read; two surfaces misuse it as a name. **Recommend screens-publish (W31)**; review unchanged.

**BQ26 · E-K3** (screens-publish / case-authoring / screens-inquiry). Candidates: screens-publish changes how `ownPublished` reads (cannot tell "this draft was published" from "another draft of this case was"); screens-inquiry sends the published case's `caseId` (fixes the walker's path only; the Docket door already works); case-authoring answers `published` per draft (publication R40, `case_documents.draft_id`). **Recommend case-authoring (W14)**; screen unchanged.

**BQ27 · E-K4** (events vs screens-investigate). The statement binds too many parameters in events; the caller's 200 is its normal load. **Recommend events (W7)**; the silent failure on the standard page is a small screens-investigate addition (W30) only after W7 is green.

**BQ28 · E-K5** (case-inputs vs screens-publish vs admission). **Recommend case-inputs (W13)**: the viewer test and the dead answer are its; screens-publish maps whatever code it adds. `[ruling]` whether an administrator may acknowledge.

**BQ29 · E-K1 + E-K2** (screens-investigate vs conformance vs events). The missing door is the Timeline's (W30); the refusing sentence names the wrong door (W16); `events` already has `eventattest`. Two causes, two modules; no matching edits.

**BQ30 · C-K24 / C-K2** (entities). Parked K5303; **entities (W6)**; Bob decides if it joins this round.

**BQ31 · B-K19** (screens-inquiry and screens-intake, requirement R43). `[ruling]` whether a handed-in file's Document page and Held row link to its source; if yes, each screen is its own entry (W29, W27).

**Requirement / policy questions for Bob raised by entries (not boundary):** C-K5 record model (W11); C-K2 where a question's subject is stated (W29); C-K6 where a team states its fiscal year (W8); C-K7 as-written payer/payee (W8); B-K15 photo attachment in R3 (W27); B-K17 sort/search on Held captures, R4 (W27); B-K19 source link (above); D-K9 next-edition offer (W31); E-K5 may an administrator acknowledge (W13); E-K7 vs DEC-340 mock (W32); C-K24 K5303 (W6); D-K1 C-12.2 widening (W1); D-K2 publish gate (W29); strength R12 cutting-vs-supporting (W29); A-K17 is BOB's own choice (W25), not Bob's.

---


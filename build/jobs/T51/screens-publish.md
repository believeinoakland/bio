# screens-publish (T51)

**Status** · session_01PQvprfcu1QzmpPKVtTTPqR · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

1. **Browser acts need two modules that are not on the tranche yet.** R38 to R40 add the browser acts `pubfloorset`, `pubfloorclear`, `pubprint` and `reviewexport` as acts of `published` and `review-copy`. At the tip (fe5d5656fb), `BROWSER_ACTS` (op-declarations R76) and the shell's R99 (`cs.print`, the screen's `printed`) and R100 (admission of a browser act, pressing one sends nothing) are not built. `checkScreens` throws on an act whose op `OPS` does not hold, so once those four acts are in `SCREENS` every test of my module is red until both modules merge. My reading: build the acts, the print state and the file to the written interface; check them against an uncommitted local stand-in of the two modules; and, once both are on `tranche/T51`, merge it and run the real suites. I will not post COMPLETE before that. Please ring me when interface-shell and op-declarations have merged, or tell me to do otherwise.
2. **R37 (BOB: check).** My reading: the finding page does not draw `body.question` or the finding's `tensions` (the drawing has neither and no key exists), and the address is `<case>/<edition>/<finding>`, a three-part subject on the existing `published` route.
3. **R39 (BOB: check).** My reading: the print footer names the signer and key fingerprint only where `publishedcase` states them (per-finding `attestor`, the case document's signature key), leaves out what it does not state, and draws no container or rendering hash.

## J2 · REPORT

All of T51-121 is built and tested on `job/T51/screens-publish` (134 tests, 0 failing against uncommitted local stand-ins of `BROWSER_ACTS` and the shell's R99/R100). I post COMPLETE once interface-shell and op-declarations are on `tranche/T51`. Findings for BOB, grouped:

**Words with no key, so the page draws no English for them (design stream; DEC-330, DEC-335, K3366)**
1. "Leg n", "supports it", "cuts against it", and the generic leads "Rests on:" and "Cut against by:" (the finding page's legs, the print). The legs' role and place are carried by the "What rests on what" lines (`holds.leg.2/3`, `is.leg.4`); a served leg that cuts against has only the `holds.leg.3.which.cuts` sentence.
2. The minimum's choices "No minimum", "C or better", "B or better", "A only": drawn as the grades themselves ("–", C, B, A).
3. "Save the file" (the act is drawn under "Save as a file"'s label), "Its fingerprint" and "Its author" (the file's stamp and the list draw the values with the keys that exist).
4. The finding page's not-available sentences ("the finding's text could not be read from the store"; "a court order withholds it"): drawn by the plane's refusal words (`refusal.<code>` of `body`) and the orders as stated; nothing when `body` carries no code.
5. The print head ("Edition n · published d · by team") is drawn from `screen.published.dated` and `.whose`; the unresolved edge of "What rests on what" is the `Undetermined` mark; `shell.card.hold` has no row (the docket's reference to `hold` has no card lead); a docket pressure mark of another kind is named by `screen.action.pressure.<kind>` and `screen.action.pressuremark.by`, and one with no member draws no maker sentence.
6. `words-reads.json` for screens-publish does not list the new keys (generated, not mine).

**Drawn items no read answers (R39; your answer B2)**
7. The container hash and the rendering hash are not drawn. `publishedcase` states no key fingerprint: only `attestor: {member, key_b64}` per finding and no case-level signer. The footer takes the signer from `signed_by`, else `attestor`, and the fingerprint from `fingerprint` if stated, else the first eight hexadecimal digits of the SHA-256 of `key_b64`'s wire bytes in two groups of four (the drawing's "ab12 34cd"), computed in the browser. Please place: a provider field in public-read, or confirm this.

**interface-shell (P9)**
8. `refusalOf(a, own, null)` passes no kit to a read's own refusal function (`outcome` calls it with `inst` null), so a screen cannot draw a read's refusal with its own words. `FINDING_IN_SEVERAL_CASES` needs the cases as references, so the finding page reads through `cs.later`-style `view.parts.later` instead.
9. `cs.sec` takes one help key; the drawing explains headings with two or three sentences (R37's two and R38's two, R43's `tip1` and `tip2`). I join them in a part (`secTips`); a list as `help` would do it in the kit.
10. `cs.checks` does not redraw on change, so "one box, then Save the file" uses the `acts` choice (a select whose one value offers the act). R90's `redraw` choice is a select too.

**Requirement text to reconcile (BOB's)**
11. R42 says an unreadable `minutes` source draws no minutes section; the entry (K4025) says the sign step draws `signing.minutes.unread` by word. I follow the entry (state l); R42's line needs the edit.
12. R30 and R4 say `photosOf` answers no date yet; it does now (case-disclosures R33): the ceremony reads `dated`, a local day, not `taken_at`.
13. R40 names `hash.sha256`, `date`, `author` and `floors` of the answer; the control plane puts them in `inband` (the quartet), which is where the file's stamp is read, with the top level as a fallback.

**Recorded, no change:** `imported.mjs`:57's `data-group-fields` is an attribute, not a sentence (N1229 entry).

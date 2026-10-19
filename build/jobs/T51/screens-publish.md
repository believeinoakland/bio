# screens-publish (T51)

**Status** · session_01PQvprfcu1QzmpPKVtTTPqR · depth 2 · WORKING · handled B2

## J1 · QUESTION

1. **Browser acts need two modules that are not on the tranche yet.** R38 to R40 add the browser acts `pubfloorset`, `pubfloorclear`, `pubprint` and `reviewexport` as acts of `published` and `review-copy`. At the tip (fe5d5656fb), `BROWSER_ACTS` (op-declarations R76) and the shell's R99 (`cs.print`, the screen's `printed`) and R100 (admission of a browser act, pressing one sends nothing) are not built. `checkScreens` throws on an act whose op `OPS` does not hold, so once those four acts are in `SCREENS` every test of my module is red until both modules merge. My reading: build the acts, the print state and the file to the written interface; check them against an uncommitted local stand-in of the two modules; and, once both are on `tranche/T51`, merge it and run the real suites. I will not post COMPLETE before that. Please ring me when interface-shell and op-declarations have merged, or tell me to do otherwise.
2. **R37 (BOB: check).** My reading: the finding page does not draw `body.question` or the finding's `tensions` (the drawing has neither and no key exists), and the address is `<case>/<edition>/<finding>`, a three-part subject on the existing `published` route.
3. **R39 (BOB: check).** My reading: the print footer names the signer and key fingerprint only where `publishedcase` states them (per-finding `attestor`, the case document's signature key), leaves out what it does not state, and draws no container or rendering hash.

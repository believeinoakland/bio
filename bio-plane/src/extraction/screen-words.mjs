/* G41 (K4636, K4639, K4640): the sentences the Document page reads about how a document's reading is kept. extraction decides both (a sheet
   whose cells are held and made for a range, R96; a reading too large to keep whole, R97), so they are its code-origin rows; screens-inquiry
   reads them by key (`cs.w("screen.document.<key>")`). `tooLarge` is a function of its {size} and {key}. Owed to the design stream (B491). */
import { localize } from "../setup-words/index.mjs";

export const SCREEN_WORDS = Object.freeze({
  cellsHeld: localize("screen.document.cells_held",
    "This sheet's text is read whole and every line can be searched and cited; its cells are interpreted for a range when you open or cite it."),
  tooLarge: (vars) => localize("screen.document.reading.too_large",
    "This document's reading is too large to keep whole: {size}; the largest part is {key}.", vars),
});

/* G44 (K4662, K4665; file-safety R11, R51): the sentences a drawn safe view of a spreadsheet reads about its cut and about a preview
   that is not drawn. file-safety decides both, so they are its code-origin rows; screens-intake reads them by key only
   (`cs.w("screen.open-file.safe.<key>", vars)`, K4640). Each takes its variables and says that the original holds the rest.
   `notDrawn` takes the size and the bound in MB, one decimal. Stand-ins owed to the design stream (B491), the final sentences
   its to write. */
import { localize } from "../setup-words/index.mjs";

export const SCREEN_WORDS = Object.freeze({
  cut: (vars) => localize("screen.open-file.safe.cut", "Showing rows {from} to {to} of {total}. The original file holds the rest.", vars),
  cutMore: (vars) => localize("screen.open-file.safe.cut.more", "Showing rows {from} to {to}; the sheet goes on. The original file holds the rest.", vars),
  sheetsCut: (vars) => localize("screen.open-file.safe.sheetscut", "Showing {shown} of {total} sheets. The original file holds the rest.", vars),
  notDrawn: (vars) => localize("screen.open-file.safe.notdrawn",
    "This file is {size} MB, more than a preview can show ({bound} MB). The original is unchanged and holds every cell.", vars),
  sheetUnreadable: (vars) => localize("screen.open-file.safe.sheet.unreadable", "The sheet {name} could not be shown. The original file holds it.", vars),
});
/* The keys, as the contract names them. */
export const SCREEN_WORD_KEYS = Object.freeze(["screen.open-file.safe.cut", "screen.open-file.safe.cut.more", "screen.open-file.safe.sheetscut",
  "screen.open-file.safe.notdrawn", "screen.open-file.safe.sheet.unreadable"]);

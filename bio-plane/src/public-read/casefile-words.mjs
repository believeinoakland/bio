/* public-read — THE READER'S SENTENCES FOR THE CASE FILE'S STATE AND CODE (G54; K4702; `screens-publish` R22). `publishedcase` answers a
 * state and a stable code only (`./casefile.mjs`, `caseFileStateOf`), never a sentence; the page that draws them is a drawn-screen
 * module, which may hold no `localize` call and no rows of its own, so it draws each by key and the thirteen stand-ins live here, as
 * `localize` calls this module puts in no answer: the word build reads them (`setup-words`), their rows are owed to UX-DESIGN, and
 * until a row exists the call's English is what `word` falls back to. One key per state that has no case file yet
 * (`screen.published.casefile.<state>`) and one per code of the closed set (`screen.published.casefile.code.<CODE>`). A built
 * edition has no key: the page draws its download and no sentence. */
import { localize } from "../setup-words/index.mjs";

export const CASEFILE_SENTENCES = Object.freeze({
  "being_prepared": localize("screen.published.casefile.being_prepared", "This edition is complete and signed. Its case file is being prepared and will be offered here when it is ready."),
  "retrying": localize("screen.published.casefile.retrying", "This edition is complete and signed, but its case file could not be built yet. It will be tried again."),
  "stopped": localize("screen.published.casefile.stopped", "This edition is complete and signed, and its case file cannot be built because a material is no longer held."),
  "waiting_on_members": localize("screen.published.casefile.waiting_on_members", "This edition is not complete yet, so it has no case file. It is waiting for the rest of its signatures."),
  "code.NO_BUCKET": localize("screen.published.casefile.code.NO_BUCKET", "The place where published files are kept was not available."),
  "code.STORE_SILENT": localize("screen.published.casefile.code.STORE_SILENT", "The record did not answer."),
  "code.MATERIAL_MISSING": localize("screen.published.casefile.code.MATERIAL_MISSING", "A material the case file lists is not held."),
  "code.FINDING_MISSING": localize("screen.published.casefile.code.FINDING_MISSING", "The text of a finding could not be found."),
  "code.BUCKET_FAILED": localize("screen.published.casefile.code.BUCKET_FAILED", "A file of the case file could not be stored."),
  "code.NOT_RECORDED": localize("screen.published.casefile.code.NOT_RECORDED", "The list of the case file's files could not be recorded."),
  "code.INTERRUPTED": localize("screen.published.casefile.code.INTERRUPTED", "An earlier attempt to build it was interrupted."),
  "code.TOO_LARGE": localize("screen.published.casefile.code.TOO_LARGE", "The case file is too large to build in one piece."),
  "code.UNKNOWN": localize("screen.published.casefile.code.UNKNOWN", "It could not be built, for a reason not yet known."),
});

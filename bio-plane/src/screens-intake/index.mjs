/* screens-intake: bringing material in and deciding what enters the record (N897 (1); draft-T46-interface.md §2.4).
 * Five registry screens, `capture`, `held`, `archive` (since T47), `open-file` and `inbox`, each met to interface-shell's screen contract (its
 * R21): `{id, reads, render, acts, words}`. Pure: it reads no table and writes nothing; every read and act is an op the
 * plane serves, called through the kit.
 *
 * The contract is interface-shell R21's (K2996, K2998): every function is self-contained (its parameters, the kit `cs`
 * and the language's own globals), so the shell composes the page's one script from their text and the same functions
 * run in node for the tests. `reads(view)` answers `{name: {op, query, empty?}}`; `render(cs, view)` the screen's HTML;
 * each act `{op, label, send(view, el, cs, extra), done?(view, answer, cs), rereads?, refusals?, dialog?}`. It also
 * reads the parts K2999 and K3002 added to R21: `cs.download(op, {query, body})`, a byte answer handed to the browser
 * as a file (R6); `cs.digest(text)`, the SHA-256 of a text (the bundle an acquire promotes, R1); `cs.now()`; a `send`
 * answering a promise; `extra.picked`, the picked rows' keys; and `{refuse: key, fills}`, this module's word beside the act.
 * `words`: the `WORD_ROWS` keys a screen draws, and its own `SCREEN_WORDS` rows. */

import { SCREEN_WORDS } from "./words.mjs";
import { CAPTURE_SCREEN } from "./capture.mjs";
import { HELD_SCREEN } from "./held.mjs";
import { OPEN_FILE_SCREEN } from "./open-file.mjs";
import { INBOX_SCREEN } from "./inbox.mjs";
import { ARCHIVE_SCREEN } from "./archive.mjs";

export { SCREEN_WORDS };

/* The keys of `setup-words`' `WORD_ROWS` each screen draws, beside its own `screen.<id>.` rows (interface-shell R5). */
const SHARED_WORDS = Object.freeze({
  capture: ["photo.reminder", "ai.label.untested",
            "act.acquire.label.capture", "act.capturerequest.label.capture", "act.monitorset.label.capture", "act.monitor.label.capture",
            "act.capture.label.capture", "act.testify.label.capture", "act.writinghelp.label.capture"],
  held: ["mark.gap.refused.name", "mark.gap.refused.means", "mark.gap.withheld.name", "mark.gap.withheld.means",
         "mark.gap.undetermined.name", "mark.gap.undetermined.means", "state.undetermined",
         "act.heldcaptures.label.held", "act.release.label.held", "act.heldsetaside.label.held", "act.heldrestore.label.held"],
  "open-file": ["mark.origin.machine.name", "mark.origin.machine.means",
                "act.openoriginal.label.open-file", "act.openwithwarning.label.open-file", "act.safeview.label.open-file",
                "act.deepercheck.label.open-file", "act.releasescanhold.label.open-file"],
  inbox: ["act.inboxpull.label.inbox", "act.inboxresolve.label.inbox", "act.sourcelink.label.inbox", "state.loading"],
  archive: ["mark.gap.refused.name", "mark.gap.refused.means", "state.undetermined", "screen.held.ack", "screen.held.ackhelp",
            "screen.held.mitigation", "screen.held.mitigationhelp", "screen.held.none", "screen.held.vouchmissing",
            "screen.held.vouchbad", "screen.held.selectfailed", "screen.held.released",
            "act.gradenote.label.archive", "act.archivelist.label.archive", "act.heldsetaside.label.archive", "act.release.label.archive"],
});

/* A screen's own rows (its `screen.<id>.` keys and the shared keys it re-holds, R5) as rows; the rest as `WORD_ROWS` keys. */
const ROW = new Map(SCREEN_WORDS.map((r) => [r[0], r]));
const wordsOf = (id) => Object.freeze([...SCREEN_WORDS.filter(([k]) => k.startsWith(`screen.${id}.`)),
                                       ...SHARED_WORDS[id].map((k) => ROW.get(k) || k)]);

export const SCREENS = Object.freeze([CAPTURE_SCREEN, HELD_SCREEN, ARCHIVE_SCREEN, OPEN_FILE_SCREEN, INBOX_SCREEN]
  .map((s) => Object.freeze({ ...s, words: wordsOf(s.id) })));

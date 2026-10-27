/* case-carriage's published fixtures (K4990, K4993, K4995, K5044): what the module answers to a caller that reads a member
   document's copy (R16), ticks the copy queue (R15) or registers its listener (R17), made by the module's own code when
   the test runs and never stored. A user's test takes the answer from here and does not write it by hand. Each is called
   by a test of the module's own, `fixtures.test.mjs`, which checks the real answer. The documents are doc-clean's own test
   documents, held only in the evidence store, as a member's upload is (`documents.test.mjs`). */
import { world, supplied, makePng, sha } from "./fixture.mjs";
import { pdf } from "../doc-clean/fixtures.mjs";

const KNOCKED = pdf();                                                    // EXIF with GPS in its image, /Info, XMP
const REFUSED = pdf({ ops: "q 8 0 0 8 0 0 cm BI /W 8 /H 8 /CS /G /BPC 8 /F /DCT ID \xff\xd8\xff EI Q" });   // an inline JPEG

/* R16: `documentCopy` in each state it can be in, over a real captured document in each: `copy` (a member's document
   cleaned by `copyBatch`, its copy held), `photo` (a photo, whose copy is R10's), `refused` (a PDF doc-clean cannot clean),
   `undetermined` (the module's table of copies cannot be read) and `unknown` (a digest no capture holds). Each answers
   `{capture, answer}`: the digest read and the module's answer as it gives it. */
export async function copyReadStates() {
  const cleaned = world();
  const copy = supplied(cleaned, "INFO-2026-0101-knock", KNOCKED);
  await cleaned.cc.copyBatch({});
  const refusing = world();
  const refused = supplied(refusing, "INFO-2026-0103-refused", REFUSED);
  await refusing.cc.copyBatch({});
  const photos = world();
  const photo = photos.photo("INFO-2026-0106-photo", makePng(4, 4));
  const unreadable = world();
  const undetermined = supplied(unreadable, "INFO-2026-0104-knock", KNOCKED);
  unreadable.st.sql.exec(`DROP TABLE document_copies`);
  const unknown = sha("never captured");
  const none = world();
  return {
    copy: { capture: copy, answer: cleaned.cc.documentCopy(copy) },
    photo: { capture: photo, answer: photos.cc.documentCopy(photo) },
    refused: { capture: refused, answer: refusing.cc.documentCopy(refused) },
    undetermined: { capture: undetermined, answer: unreadable.cc.documentCopy(undetermined) },
    unknown: { capture: unknown, answer: none.cc.documentCopy(unknown) },
  };
}

/* R15: a real `copyBatch` and `copyWake` tick with no evidence store bound: the record's own answer when none is bound
   (`evidenceStore()` null, as the instance was built without a bucket). The member's document is queued by its receipt
   (a doorbell, not a fetch); the tick answers DOCUMENT_COPY_NO_STORE and derives nothing. */
export async function copyTickRefusals() {
  const w = world();
  const capture = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  w.record.evidenceStore = () => null;
  const wake = w.cc.copyWake(Date.parse(w.clock.now));
  const batch = await w.cc.copyBatch({});
  return { capture, batch, wake, queued: w.rows(`SELECT capture, tried FROM document_copy_queue ORDER BY queued, capture`) };
}

/* R17: the module's own `onCopyWork` registrar: a first registration by one module stands; a second by the same module
   is refused (LISTENER_DECLARED); a `fn` that is not a function is refused (LISTENER_MALFORMED). */
export function onCopyWorkRegistrarRefusals() {
  const { cc } = world();
  return {
    first: cc.onCopyWork("scheduler", () => {}),
    twice: cc.onCopyWork("scheduler", () => {}),
    malformed: cc.onCopyWork("other", "not a function"),
  };
}

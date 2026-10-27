/* consequences' published fixtures (fix round 10): the answers this module gives to a caller of `consequencesOf` (R13)
   and of `successRecordRead` (R20), made by its real code when the function is called, over the test world of
   fixture.mjs, and never stored. A user's test takes the answer from here and does not write it by hand. */
import { world, V } from "./fixture.mjs";

const S = "STD-2026-0001-law";

/** `consequencesOf` (R13): the real refusal for a determination conformance holds none of (NO_SUCH_DETERMINATION),
 *  and the determination asked for. */
export function consequencesOfRefusal({ determination = "CONF-2026-0099-x" } = {}) {
  const w = world();
  w.c.registerOwnActReader(() => []);
  return { determination, answer: w.c.consequencesOf({ determination, viewer: V("alice") }) };
}

/** `successRecordRead` (R20): the real NO_SUCH_SUCCESS_RECORD refusal for an id no record holds (`absent`), and a stored
 *  success record, with the real read of it (`read`) and its id (`id`). */
export function successRecordRead() {
  const w = world();
  w.c.registerOwnActReader(() => []);
  const cid = w.figure("INFO-2026-0001-report", "Restored 1,000");
  const made = w.c.successRecord({ project: w.P, statement: "The City published the report", changed_on: "2026-05-14",
    evidence: [cid], author: V("alice") });
  if (!made.ok) throw new Error(`successRecordRead: the success record was refused: ${JSON.stringify(made).slice(0, 300)}`);
  return {
    id: made.id,
    absent: w.c.successRecordRead({ id: "SUC-2026-9999", viewer: V("alice") }),
    read: w.c.successRecordRead({ id: made.id, viewer: V("alice") }),
  };
}

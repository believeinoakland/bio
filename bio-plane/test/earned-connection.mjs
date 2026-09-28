/* T7 (legacy-tests), 2026-09-28: A CONNECTION LEG THAT EARNS ITS LETTER, for the old suites whose case fixture authored
 * its connection grade as a `hunch`.
 *
 * WHY THIS EXISTS. Strength R5 (K187, BOB #50, STRENGTH #1 J4/J5): a leg whose grade source is `hunch` is INERT in
 * every pair — it contributes nothing and does not carry up its target's pair — so a case whose only connection leg
 * was a hunch now reaches the connection axis UNRATED, where it used to reach the hunch's stated letter. K187 hands
 * the old battery's hunch fixtures to legacy-tests to RE-READ, never to exempt: the suites these serve (publish,
 * publishedcase, caseflip, reviewcopy-inband) are about the frozen PAIR, the bar and the case, not about hunches, so
 * their connection leg now earns its letter the one way the record grants a connection grade (strength R9, inquiry's
 * `earned`): a RESOLUTION of the cited document's reading against the inquiry's subject entity.
 *
 * THE LETTER IS C, AND IT IS EARNED RATHER THAN CHOSEN. The recogniser's tiers (entities R9, `recogniseTier`): A when
 * the reading reference's composite key is a registered identifier, B when its key is, C when only its NAME matches an
 * alias ("correspondence — plausible, never established"). The reading here names the subject by its label and by a
 * reference and key the registry does not hold, so the strongest resolution is C, and a leg stating `grade: C`,
 * `grade_source: resolution` on the connection axis is the value the record earns (mode 'value': a different letter is
 * refused C-2.8).
 *
 * USE: `const conn = await connectionAtC(create)` where `create(body)` answers op=entitycreate's result; put
 * `subject_entity: ${conn.entityId}` on the inquiry, promote the cited document with `conn.files(captureSha, file)`
 * beside its bundle.md (the capture it registers at `file`), then `op=resolve` that capture. */
import { createHash } from "node:crypto";
import { registerDoc, registerFile } from "./register-doc.mjs";

const sha256Hex = (s) => createHash("sha256").update(s).digest("hex");

export const CONNECTION_SUBJECT_LABEL = "Sewer Fund Transfer Memo";

export async function connectionAtC(create, { label = CONNECTION_SUBJECT_LABEL, at = "2026-07-01T00:00:00Z" } = {}) {
  const e = await create({ kind: "ordinance", label });
  if (!e || typeof e.entity_id !== "string")
    throw new Error(`earned-connection fixture: the subject entity was not created: ${JSON.stringify(e).slice(0, 300)}`);
  /* The reading names the subject by its LABEL (an alias, so the tier is C) and by a reference and key that are no
     registered identifier (so no A or B is found for it). */
  const reading = (captureSha, file) => registerDoc({
    capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at, facts: {},
               entities: [{ ref: "memo:tm-2026-0704", kind: "ordinance", key: "tm-2026-0704", label }] } },
    { file });
  /* The files the cited document carries beside its bundle.md: the reading (C-18.1's intake shape) and the capture
     it names, held in the bundle. */
  const files = (captureSha, file) => {
    const doc = reading(captureSha, file);
    const prov = JSON.stringify({ documents: [doc] });
    return [{ path: "data/provenance.json", text: prov, bytes: new TextEncoder().encode(prov).length,
              sha256: sha256Hex(prov) }, registerFile(doc)];
  };
  return { entityId: e.entity_id, label, files };
}

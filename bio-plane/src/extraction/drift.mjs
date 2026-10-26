/* extraction R38: the drift obligations, moved from `calibration.mjs` (calibration's own path, whose job drops its
   copy) with their reasons unchanged. The measurements and the verdict rule are `calibration`'s (`drifted`, its R2);
   which transcriptions rest on them is this module's, because it holds the text-source rows that bind a chain to a
   calibration. */
import { drifted, DRIFT } from "../calibration.mjs";
import { localize } from "../setup-words/index.mjs";

/** THE ASYMMETRIC DRIFT HANDLER'S ANSWER: which transcriptions rest on a
 *  calibration that has been superseded by a WORSE one?
 *
 *  `supersessions` is `[{ superseded, current, verdict }]` — pairs already
 *  compared by `compare`. `bound` is `[{ id, calibration_id, ... }]`, the
 *  transcriptions and the calibration each one's chain NAMES.
 *
 *  PURE, AND THAT IS RULE 3. It reads two lists and returns a third; it writes
 *  nothing, stores nothing and touches no grade. A caller cannot use it to
 *  re-grade because it returns no grade — the obligation carries the OLD cap
 *  and the NEW one side by side and leaves the decision where DEC-4 puts it.
 *
 *  AND IT NAMES EXACTLY THE AFFECTED ONES. A transcription bound to a
 *  calibration that was superseded by a BETTER one is not here; one bound to no
 *  calibration at all is not here (it never rested on the number, so the number
 *  moving changes nothing about it); one bound to a calibration nothing has
 *  superseded is not here. The item's acceptance is that the set is EXACT in
 *  both directions, so the suite asserts the absences as hard as the presences. */
export function driftObligations(supersessions, bound) {
  const worse = new Map();
  for (const s of (Array.isArray(supersessions) ? supersessions : [])) {
    if (!s || !s.superseded || !s.current) continue;
    if (drifted(s.verdict).raises_obligation !== true) continue;
    worse.set(s.superseded.calibration_id, s);
  }
  const out = [];
  for (const b of (Array.isArray(bound) ? bound : [])) {
    if (!b || b.calibration_id == null) continue;
    const s = worse.get(b.calibration_id);
    if (!s) continue;
    out.push({
      ...b,
      superseded_calibration: s.superseded.calibration_id,
      current_calibration: s.current.calibration_id,
      engine: s.current.engine, version_measured: s.current.version,
      cap_when_graded: s.superseded.cap ?? null,
      cap_now_measured: s.current.cap ?? null,
      measured_at: s.current.at,
      verdict: DRIFT.WORSE,
      /* THE TRIPLE REC-17 ALREADY PUBLISHES, reused rather than minted. A
         second vocabulary for "this needs another look" would be D-164's lesson
         inside the item whose whole thesis is that a provenance rule has ONE
         home. */
      reeval: { flag: true, since: s.current.at, source: "calibration" },
      regraded: false,
      why: localize("extraction.drift.this_text_was_graded_under", "this text was graded under calibration {calibration_id} of {engine} {version} (fidelity {v1}, measured {at}). A probe on {at_2} measured that engine at {v2}, which is WEAKER — so what this transcription may support is now less than the record says. NOTHING HAS BEEN RE-GRADED: a grade moves by an authored act and never by a machine (DEC-4). This names the work; a member does it", { calibration_id: String(s.superseded.calibration_id), engine: String(s.superseded.engine), version: String(s.superseded.version), v1: String(s.superseded.cap ?? "undetermined"), at: String(s.superseded.at), at_2: String(s.current.at), v2: String(s.current.cap ?? "undetermined") }),
    });
  }
  out.sort((a, b) => String(a.id) < String(b.id) ? -1 : 1);
  return out;
}

/* ============================================================================
 * C-42 · THE CALIBRATION FAMILY — a measurement of a derivation engine, and the
 * two ways a record could come to claim one it does not have.
 * ============================================================================
 *
 * CPDF-13, closing D-183 and D-253. The construct is `src/calibration.mjs` and
 * its header carries the full argument; this is the refusal catalogue. Moved here
 * from `bio-checks.mjs` at the module's extraction (K64's precedent, T5-1): the
 * rows are this module's invariants (R14), and their ids and translations are
 * unchanged.
 *
 * THE FAMILY IS SMALL AND IT IS ALL ONE IDEA. A transcription's grade rests on
 * a fidelity letter; a fidelity letter is a MEASUREMENT of a named engine at a
 * date; and the two ways to lose that are to record a measurement nobody made,
 * or to let something that is not a measurement stand in for one. Every row
 * below is one of those two.
 *
 * THE TRANSLATIONS ARE WRITTEN FOR A MEMBER, not for an operator, because these
 * surface through member-facing ops. A member who trips `CAL_NO_PROBE` is
 * usually right that the engine changed — a vendor did announce something — and
 * the translation says so before it says what is missing, because a refusal that
 * reads as "you are wrong" when the member is right is a refusal they will route
 * around.
 * ========================================================================= */
import { word } from '../setup-words/index.mjs';

export const CALIBRATION_CHECKS = {
  CAL_SHAPE: {
    check: 'C-42.1',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: word('refusal.CAL_SHAPE'),
  },
  /* A measurement of "the OCR" is a measurement of nothing re-runnable. */
  CAL_UNNAMED: {
    check: 'C-42.2',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: word('refusal.CAL_UNNAMED'),
  },
  CAL_UNDATED: {
    check: 'C-42.3',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: word('refusal.CAL_UNDATED'),
  },
  /* RULE 1, and the one the announcement watch exists under. */
  CAL_NO_PROBE: {
    check: 'C-42.4',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: word('refusal.CAL_NO_PROBE'),
  },
  CAL_SIGNAL_SHAPE: {
    check: 'C-42.5',
    where: 'src/calibration.mjs checkSignal > is-calibration-signal',
    translation: word('refusal.CAL_SIGNAL_SHAPE'),
  },
  /* RULE 4's first half, refused at the door rather than sanitised quietly. */
  CAL_SIGNAL_CLAIMS_MEASUREMENT: {
    check: 'C-42.6',
    where: 'src/calibration.mjs checkSignal > is-calibration-signal',
    translation: word('refusal.CAL_SIGNAL_CLAIMS_MEASUREMENT'),
  },
  /* RULE 2's teeth at the surface. DEC-4: no machine mints a grade, in EITHER
     direction — and the direction people expect to be allowed is the downgrade. */
  CAL_CANNOT_REGRADE: {
    check: 'C-42.7',
    where: 'src/calibration/index.mjs calibrationRecord > is-calibration-regrade',
    translation: word('refusal.CAL_CANNOT_REGRADE'),
  },
  /* D-668 / D-587 (R5): a calibration naming no one who ran it answered C-42.4's "Nothing here was
     actually measured" though its probe, inputs and scores were all there. Who ran it is the control
     plane's stamp of the caller, never a name the caller wrote. */
  CAL_UNATTRIBUTED: {
    check: 'C-42.8',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: word('refusal.CAL_UNATTRIBUTED'),
  },
  /* D-668 (R8): REGISTERING a subject (op=calibrationsubject) measures nothing and asks no version; it
     answered C-42.2 and C-42.4, written for a measurement. */
  CAL_SUBJECT_UNNAMED: {
    check: 'C-42.9',
    where: 'src/calibration/index.mjs calibrationSubjectRegister > is-calibration-subject',
    translation: word('refusal.CAL_SUBJECT_UNNAMED'),
  },
  CAL_SUBJECT_NO_PROBE: {
    check: 'C-42.10',
    where: 'src/calibration/index.mjs calibrationSubjectRegister > is-calibration-subject',
    translation: word('refusal.CAL_SUBJECT_NO_PROBE'),
  },
};

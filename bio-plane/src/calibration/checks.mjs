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
export const CALIBRATION_CHECKS = {
  CAL_SHAPE: {
    check: 'C-42.1',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: 'This measurement is not readable as one. It has to name an engine, a version, a '
      + 'date, and the probe run that produced it — and the quality figure, where there is one, has '
      + 'to be on the same scale the rest of this record uses.',
  },
  /* A measurement of "the OCR" is a measurement of nothing re-runnable. */
  CAL_UNNAMED: {
    check: 'C-42.2',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: 'A measurement has to say exactly what it measured — which engine, and which '
      + 'version of it. Services are retrained and re-released under the same name, so the name '
      + 'alone cannot tell a later reader whether the thing you measured is the thing that read '
      + 'their document.',
  },
  CAL_UNDATED: {
    check: 'C-42.3',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: 'A measurement has to carry the day it was taken. How good an engine is, is a fact '
      + 'about a particular day — without one, nothing can tell whether anybody has checked recently, '
      + 'and nothing can ever supersede it.',
  },
  /* RULE 1, and the one the announcement watch exists under. */
  CAL_NO_PROBE: {
    check: 'C-42.4',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: 'Nothing here was actually measured. A release note, a changelog, a model card or a '
      + 'new version number all tell you an engine CHANGED — none of them tells you how well it now '
      + 'reads a page, and that is the number the record grades against. Run the probe and record '
      + 'what it scored, including the inputs you gave it, so somebody else can disagree with you '
      + 'later.',
  },
  CAL_SIGNAL_SHAPE: {
    check: 'C-42.5',
    where: 'src/calibration.mjs checkSignal > is-calibration-signal',
    translation: 'This announcement is not readable as one. It has to say which engine it is about '
      + 'and where you saw it, because it is somebody else\'s statement about their own product and '
      + 'the record keeps it attributed to them.',
  },
  /* RULE 4's first half, refused at the door rather than sanitised quietly. */
  CAL_SIGNAL_CLAIMS_MEASUREMENT: {
    check: 'C-42.6',
    where: 'src/calibration.mjs checkSignal > is-calibration-signal',
    translation: 'This announcement carries a quality figure. Noticing that a vendor announced '
      + 'something is useful and the record keeps it — it brings the next check forward. But what '
      + 'they say about their own product is a claim, and a grade in this record rests on a '
      + 'measurement. The announcement cannot stand in for the check, and it cannot change a grade '
      + 'on its own.',
  },
  /* RULE 2's teeth at the surface. DEC-4: no machine mints a grade, in EITHER
     direction — and the direction people expect to be allowed is the downgrade. */
  CAL_CANNOT_REGRADE: {
    check: 'C-42.7',
    where: 'src/calibration/index.mjs calibrationRecord > is-calibration-regrade',
    translation: 'A new measurement cannot re-grade the documents already read by that engine, and '
      + 'that holds even when the new measurement is WORSE. What the record does instead is name '
      + 'exactly which transcriptions were graded under the old measurement, so a person can look at '
      + 'them and decide. Grades in this record are things people put their name to.',
  },
  /* D-668 / D-587 (R5): a calibration naming no one who ran it answered C-42.4's "Nothing here was
     actually measured" though its probe, inputs and scores were all there. Who ran it is the control
     plane's stamp of the caller, never a name the caller wrote. */
  CAL_UNATTRIBUTED: {
    check: 'C-42.8',
    where: 'src/calibration.mjs checkCalibration > is-calibration-shape',
    translation: 'This measurement does not say who ran it. A measurement is something somebody did, and '
      + 'a later reader who doubts the figure needs to know whose it is to ask for it to be run again.',
  },
  /* D-668 (R8): REGISTERING a subject (op=calibrationsubject) measures nothing and asks no version; it
     answered C-42.2 and C-42.4, written for a measurement. */
  CAL_SUBJECT_UNNAMED: {
    check: 'C-42.9',
    where: 'src/calibration/index.mjs calibrationSubjectRegister > is-calibration-subject',
    translation: 'To put an engine on the calibration schedule you have to say which engine. Registering '
      + 'it measures nothing yet — it only says what will be checked, and so it has to name it.',
  },
  CAL_SUBJECT_NO_PROBE: {
    check: 'C-42.10',
    where: 'src/calibration/index.mjs calibrationSubjectRegister > is-calibration-subject',
    translation: 'To put an engine on the calibration schedule you have to say which probe will check '
      + 'it. Registering measures nothing yet, but a schedule with no stated way of measuring is a promise '
      + 'nobody could keep, or tell was kept.',
  },
};

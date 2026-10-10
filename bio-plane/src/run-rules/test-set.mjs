/* R19 as amended (T41-21; D11, D14 C; K2405, K2418): CIVICSMITH'S TEST INVESTIGATIONS, frozen data held with this module.
 * Each matter is a real public matter, frozen with its documents, with answers written by people; an AI part is
 * deployable only once `ai-runs` R75 records that it passed its bar on this set (`./test-bar.mjs`). The set is
 * VERSIONED: a new version (a matter added, removed or its answers changed) re-asks the bar, since a record names the
 * version it was graded on and only the current version's records count.
 *
 * VERSION 1 HOLDS NO MATTERS, and that is a statement, not a placeholder filled by guess: the matters and their
 * answers are written by people (D11), never by this module's job, so none is invented here. With no matters the bar
 * cannot be passed (`testBarHeld` counts no record on an empty set), so no AI part is deployable under R19 as amended
 * until a later version adds them. A group's own test investigations are `ai-runs`' (its R75 `groupTestSet`) and never
 * open or close a deploy gate. */

/** What one matter of the set holds. Described, not checked here: the set is data written under review. */
export const TEST_MATTER_SHAPE = Object.freeze({
  id: "the matter's id within the set, unique and never reused",
  title: "the matter in plain words",
  documents: "the documents it was frozen with, each as its capture's address and digest",
  answers: "what a correct investigation finds, written by people, each with what it rests on",
  answered_by: "who wrote the answers; never a machine",
});

/** Civicsmith's set: its id, its version (a whole number of one or more, raised by every change) and its matters. */
export const CIVICSMITH_TEST_SET = Object.freeze({
  id: "civicsmith",
  version: 1,
  matters: Object.freeze([]),
});

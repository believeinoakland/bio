/* The fixtures hypotheses publishes for its op answers (K4990, K4993, K4995): what `hypothesishold`, `hypothesisrevise` and
 * `hypothesiswithdraw` answer, each ok answer and each refusal the screens draw. Each is made by hypotheses' real code when
 * it is called, over a fresh `world()`, never stored; `fixtures.test.mjs` checks each against the real code. */
import { world, ANN, INQ, E1, E2 } from "./fixture.mjs";

/* A world with the inquiry INQ and one hypothesis Ann holds in it: its id, and the world. */
function held(statement = "They act together.") {
  const w = world();
  w.bundle(INQ);
  const id = w.hold({ statement });
  return { w, id };
}

/** hold's ok answer: `{ok, hypothesis_id, kind, label, at}` (R1). */
export function holdAnswer() {
  const w = world();
  w.bundle(INQ);
  return w.h.hold({ inquiry: INQ, kind: "relation", statement: "They act together.", about: { from: E1, to: E2 }, by: ANN });
}

/** hold's refusals the screens draw (R1), each named by its code. */
export function holdRefusals() {
  const w = world();
  w.bundle(INQ);
  w.bundle("INFO-2026-0001-doc", { type: "information" });
  const ok = { inquiry: INQ, kind: "relation", statement: "They act together.", about: { from: E1, to: E2 }, by: ANN };
  return {
    NO_SUCH_BUNDLE: w.h.hold({ ...ok, inquiry: "INQ-2026-0404-none" }),
    NOT_AN_INQUIRY: w.h.hold({ ...ok, inquiry: "INFO-2026-0001-doc" }),
    MACHINE_CANNOT_HYPOTHESISE: w.h.hold({ ...ok, by: "class:ai" }),
    UNKNOWN_HYPOTHESIS_KIND: w.h.hold({ ...ok, kind: "suspicion" }),
    HYPOTHESIS_NO_STATEMENT: w.h.hold({ ...ok, statement: "" }),
    BAD_ABOUT: w.h.hold({ ...ok, about: { from: E1, to: "not-an-id" } }),
  };
}

/** revise's ok answer: the new statement and a reason, the hypothesis keeping its id (R2). */
export function reviseAnswer() {
  const { w, id } = held();
  return w.h.revise({ hypothesisId: id, statement: "They act together, at the same hour.", reason: "the log shows it", by: ANN });
}

/** revise's refusals the screens draw, each named by its code (R2). */
export function reviseRefusals() {
  const { w, id } = held();
  const withdrawn = held();
  withdrawn.w.h.withdraw({ hypothesisId: withdrawn.id, reason: "mistaken", by: ANN });
  const base = { hypothesisId: id, statement: "They act together, at the same hour.", reason: "the log shows it", by: ANN };
  return {
    NO_SUCH_HYPOTHESIS: w.h.revise({ ...base, hypothesisId: "HYP-2026-9999" }),
    HYPOTHESIS_NO_REASON: w.h.revise({ ...base, reason: "" }),
    HYPOTHESIS_NO_STATEMENT: w.h.revise({ ...base, statement: "" }),
    HYPOTHESIS_WITHDRAWN: withdrawn.w.h.revise({ ...base, hypothesisId: withdrawn.id }),
    MACHINE_CANNOT_HYPOTHESISE: w.h.revise({ ...base, by: "class:ai" }),
  };
}

/** withdraw's ok answer: the hypothesis marked withdrawn, with who, when and why (R2). */
export function withdrawAnswer() {
  const { w, id } = held();
  return w.h.withdraw({ hypothesisId: id, reason: "mistaken", by: ANN });
}

/** withdraw's answer to a second withdrawal: ok, already, with the first withdrawal (R2). */
export function withdrawAlreadyAnswer() {
  const { w, id } = held();
  w.h.withdraw({ hypothesisId: id, reason: "mistaken", by: ANN });
  return w.h.withdraw({ hypothesisId: id, reason: "mistaken again", by: ANN });
}

/** withdraw's refusals the screens draw, each named by its code (R2). */
export function withdrawRefusals() {
  const { w, id } = held();
  const base = { hypothesisId: id, reason: "mistaken", by: ANN };
  return {
    NO_SUCH_HYPOTHESIS: w.h.withdraw({ ...base, hypothesisId: "HYP-2026-9999" }),
    HYPOTHESIS_NO_REASON: w.h.withdraw({ ...base, reason: "" }),
    MACHINE_CANNOT_HYPOTHESISE: w.h.withdraw({ ...base, by: "class:ai" }),
  };
}

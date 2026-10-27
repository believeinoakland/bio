/* steps' published fixtures (fix round 10; K4990, K4993, K4995): each is made by steps' real code over the real modules
   it uses (./fixture.mjs) when a test calls it, never stored. A user takes `steps` (the real module on a real database)
   and the ids and viewers that answer to its reads. */
import { world, ANN, CAT, OUT, AI, Q, QH } from "./fixture.mjs";

const UNKNOWN = "STP-2026-9999";
const URL = "https://example.org/contract.pdf", SHA = "c".repeat(64), DOC = "INFO-2026-0001-doc";

/** R4, R23: `step({step, viewer})` as it answers a step the viewer sees, an unknown id and a step the viewer may not
 *  see (one on a question in a hidden project) (R4's one `NO_SUCH_STEP`), and a step a look found data for later, whose `later_found` entry holds `looked_at`
 *  (the look's own instant) beside `at` (what arrived). */
export function stepRead() {
  const w = world();
  const plain = w.step();
  const hidden = w.step({ by: CAT, place: { questions: [QH] } });
  const looked = w.step({ work: "Ask the clerk whether the contract was posted" });
  const look = { actor_class: "member", actor: ANN, authority_kind: "step", authority: looked, level: "document",
                 subject_kind: "address", subject: URL, detail: "not posted" };
  w.observationLog.observe({ ...look, state: "LOOKED_ABSENT" });
  w.bundle(DOC, { type: "information" });
  w.capture(SHA, DOC);
  w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: DOC, level: "document",
    subject_kind: "address", subject: URL, state: "PRESENT", result_kind: "capture", result_ref: SHA, detail: "new" });
  const viewer = ANN, outsider = OUT;
  return { steps: w.s, world: w, viewer, outsider, step: plain, hiddenStep: hidden, lookedStep: looked, unknown: UNKNOWN,
           read: w.s.step({ step: plain, viewer }),
           lookedRead: w.s.step({ step: looked, viewer }),
           unknownAnswer: w.s.step({ step: UNKNOWN, viewer }),
           unseenAnswer: w.s.step({ step: hidden, viewer: outsider }) };
}

/** R1, R2, R4, R5, R9, B2: steps at its interface over the real record, the way a machine's module drives it. The
 *  returned `steps` is the real module on a world of its own with every act recorded in `acts` (`stepCreate`,
 *  `stepEnd`, `recordProduct`, each with its arguments) and no run holder yet: the user registers its own
 *  (`registerRunHolder`, once). The answers beside it (`made`, `ended`, `product`, `notYourRun`, `noWork`, `seen`,
 *  `unseen`, `unknownStep`) are the real ones from a second world where Ann's assistant holds run RUN-1: an unseen step is
 *  R4's `NO_SUCH_STEP`, a machine without a run `STEP_NOT_YOUR_RUN`, blank work `STEP_NO_WORK`. */
export function stepsWorld() {
  const acts = [];
  const record = (w) => {
    const rec = (name) => (a) => { acts.push([name, a]); return w.s[name](a); };
    return { registerRunHolder: (module, fn) => w.s.registerRunHolder(module, fn), step: (a) => w.s.step(a),
             stepCreate: rec("stepCreate"), stepEnd: rec("stepEnd"), recordProduct: rec("recordProduct") };
  };
  const w = world(), sw = world();
  sw.runs();
  const sample = record(sw);
  const place = { questions: [Q] }, work = "Ask the clerk for the 2025 contract file";
  const made = sample.stepCreate({ by: AI, run: "RUN-1", place, work });
  const ended = sample.stepEnd({ step: made.step, end: "ended", by: AI });
  const made2 = sample.stepCreate({ by: AI, run: "RUN-1", place, work });
  const hidden = sw.step({ by: CAT, place: { questions: [QH] } });
  const product = sample.recordProduct({ step: made2.step, record: DOC, by: "plane" });
  const out = { steps: record(w), world: w, acts, place, work, run: "RUN-1", machine: AI, principal: ANN, unknown: UNKNOWN,
    made, ended, product, hiddenStep: hidden,
    notYourRun: sample.stepCreate({ by: AI, run: "RUN-404", place, work }),
    noWork: sample.stepCreate({ by: AI, run: "RUN-1", place, work: "  " }),
    seen: sample.step({ step: made.step, viewer: ANN }),
    unseen: sample.step({ step: hidden, viewer: OUT }),
    unknownStep: sample.step({ step: UNKNOWN, viewer: ANN }) };
  acts.length = 0;
  return out;
}

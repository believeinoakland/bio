/* progressions' published fixtures (K4990, K4993, K5044): each is made by progressions' real code when it is called, never
   stored. A user takes the answer from here instead of hand-building progressions' answer (a definition read, a
   disposition). Each is checked by `fixtures.test.mjs`, which calls it and compares the real answer. */
import { seeded, FIRST_BASIS } from "./fixture.mjs";

/** A world holding the definition `progressionKey` of `stages` (stage keys, in order; each after the one before). */
function defined(progressionKey, stages) {
  const w = seeded();
  const r = w.p.defineProgression({ progressionKey, label: "Fixture", declaredBy: "member:alice", basis: FIRST_BASIS,
    stages: stages.map((key, i) => ({ key, ...(i ? { after: stages[i - 1] } : {}), cardinality: "1", required: "always" })) });
  if (r.ok !== true) throw new Error(`fixtures: ${JSON.stringify(r)}`);
  return w;
}

/** `definitionRead`: the real definition read (`readProgression({progressionKey})`) of a progression defined as given
 *  (`stages` are stage keys in order), `{ok, progression_key, found, stages: [{stage_key, stage_no, ...}], ...}`; a key
 *  no definition holds answers `found: false` with no stages. Without a key the read is refused NO_KEY. */
export function definitionRead({ progressionKey, stages = ["notice", "minutes"], defined: held = true } = {}) {
  const w = held && progressionKey ? defined(progressionKey, stages) : seeded();
  return w.p.readProgression(progressionKey === undefined ? {} : { progressionKey });
}

/** `disposeProposalOk`: the real success of `disposeProposal` for the stage asked about, over a world that really holds
 *  the progression at that definition version, `{ok, key, progression_key, stage_key, to, state, reason, decided_by, at,
 *  bundle, definition_version}`. `args` are the caller's own (`progressionKey`, `stageKey`, `to`, `reason`,
 *  `definitionVersion`, `decidedBy`); a spy delegates to this with what it was called with. */
export function disposeProposalOk(args = {}) {
  const progressionKey = args.progressionKey ?? String(args.key ?? "proc::award").split("::")[0];
  const stageKey = args.stageKey ?? String(args.key ?? "proc::award").split("::")[1];
  const w = defined(progressionKey, stageKey === "need" ? [stageKey] : ["need", stageKey]);
  return w.p.disposeProposal({ to: "deferred", reason: "later", decidedBy: "member:alice", ...args, progressionKey, stageKey,
                               definitionVersion: args.definitionVersion ?? 1 });
}

/** `disposeProposalRefusal`: the real `disposeProposal({})` refusal, `{ok: false, reason: "NO_KEY", code, detail}`. */
export function disposeProposalRefusal() {
  return seeded().p.disposeProposal({});
}

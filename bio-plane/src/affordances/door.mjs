/* affordances — `op=affordances` (R17), THE plane-sourced act pre-flight (REC-19, DEC-8): for this object as it stands,
 * which acts exist — each with the capability it needs, how it is reached, its set-application weight and its declared
 * ladder rung — plus the object vocabularies, so a surface renders what it received and keeps no copy of any of it.
 *
 * Moved from `src/index.mjs` (T19 layer 11, legacy-index's map §4.1 (1)). The control plane keeps what is its own (K3):
 * routing, the four stamps (`viewer`, `identity`, `author`, `by`, composed by the expressions the acts receive them by),
 * the gate (`{needs, mode}` from `NEEDS` and `SESSION_OPS`, the tables that actually gate the call) and its envelope and
 * store-silence answers, each HANDED IN here; this module composes the answer from them (R11, R17).
 *
 * Two parts. `affordancesAnswer` is the composition, pure: the catalogue or one target's acts, decorated through the gate
 * by `decorate` — the SAME function a queue item's options go through, so the two answers cannot drift (REC-20, R11).
 * `affordancesOp` is the door's arm: it asks the store what the composition needs (the kinds this instance's
 * `actions` accepts, and the target's facts, or with no target the screens and offered wizard scripts, R37) and answers through the envelope it was handed.
 *
 * Nothing is asked of the caller and nothing here writes (R22). `rung` is DECLARED, never guessed, and since FW-14 it is
 * TOTAL: every op the control plane declares mutating carries a rung or is named with the GROUND on which it has none
 * (R12, R24), so `rung: null` is always accompanied by a non-null `rung_absence`. */

import { ACTS, CAPTURE_ACTS, PER_ITEM_ACTS, PER_ITEM_MAX, deriveActs, decorate, vocabulariesFor } from "../affordances.mjs";

const CATALOGUE_DETAIL = "pass target=<record id> for the acts available on that object right now; "
  + "rung is the weight ladder (vocabularies.rung_ladder, low to high, IRREVERSIBLE "
  + "at the top per DEC-19 with vocabularies.rung_correction_path beside it) and is "
  + "null only where the act carries a STATED absence — read rung_absence for the "
  + "ground, and vocabularies.rung_absence_grounds for what that ground means; "
  + "capture_acts are keyed by a capture sha rather than by a record, so they are "
  + "published with their metadata and never derived against an object's state; "
  + "set_acts take a selection as `items` under the per-item weight: each item is "
  + "applied or RETAINED with its own act's reason, and none stops the others";

/** R17: the answer, composed. `kinds` is what this instance's `actions` accepts at the call (R26; `vocabulariesFor`
 *  publishes the product's kinds for anything that is not a kind list). With no `target`, the catalogue — the shape a
 *  surface loads once, searchfields' precedent; with one, `facts` is R13–R14's answer for it: a refusal is returned as
 *  given (stated `ok: false`), and otherwise the target's acts (R8–R10) decorated. */
export function affordancesAnswer({ target = null, facts = null, kinds, gate, screens = [], wizard_scripts = [] } = {}) {
  const vocabularies = vocabulariesFor(kinds);
  const dec = (a) => decorate(a, gate);
  /* REC-38: the SAME block on both arms, and deliberately NOT filtered by a target: a capture act's subject is a capture
     sha, and whether one is attestable turns on the bytes being in the store — a fact `affordanceFacts` does not carry
     and this composition must not guess at. So it is metadata a surface RENDERS beside a capture it already holds, never
     a derivation about the object; deriving one would be the publication disagreeing with op=attest's own
     NO_SUCH_CAPTURE. The reasoning is on CAPTURE_ACTS, where both consumers of the distinction read it. */
  const capture_acts = CAPTURE_ACTS.map(dec);
  if (!target) return {
    target: null,
    catalog: ACTS.map((a) => ({ ...dec(a), appliesTo: a.types })),
    vocabularies,
    capture_acts,
    /* D-126: the acts that take a SET under the `per-item` weight, decorated as every act is, with the bound
       record-core enforces (R6). */
    set_acts: PER_ITEM_ACTS.map((a) => ({ ...dec(a), set_key: a.set_key, item_keys: a.item_keys,
                                          shared_keys: a.shared_keys, max_items: PER_ITEM_MAX })),
    detail: CATALOGUE_DETAIL,
    /* R37 (DEC-120, DEC-121): the registered screens and the offered wizard scripts, for the pack (`skills` R9, R10),
       each as `wizard-scripts` answered it; a list always, `[]` when none is registered or offered. */
    screens: Array.isArray(screens) ? screens : [],
    wizard_scripts: Array.isArray(wizard_scripts) ? wizard_scripts : [],
  };
  if (!facts || facts.ok !== true) return { ok: false, ...facts };
  return { target: facts.target, object_type: facts.object_type, current_state: facts.current_state,
           acts: deriveActs(facts).map(dec), vocabularies, capture_acts };
}

/** R17 at the door: `op=affordances`. `stub` is the store this request addresses; `json`, `doAnswer`, `storeSilent` and
 *  `storeRefusal` the control plane's envelope and silence answers; `gate` its act gate; `viewer`, `identity`, `author`
 *  and `by` its stamps for this caller (R15). */
export async function affordancesOp(url, stub, { json, doAnswer, storeSilent, storeRefusal, gate, viewer, identity,
                                                 author, by, storeName, cls }) {
  const target = url.searchParams.get("target");
  /* N231 (R26): `action_kind` is the kinds this instance's `actions` accepts at this call (actions R42), asked of the
     store; a silence is stated as one, never answered with the product's kinds (REC-52). */
  const kOut = await doAnswer(stub.fetch("http://do/actionkinds"));
  if (kOut.refused) return storeRefusal(kOut);
  if (!kOut.answered) return storeSilent("affordances", kOut.correlation);
  const kinds = kOut.result?.kinds;
  const answer = (result) => json({ ok: true, result, store: storeName, tokenClass: cls }, 200);
  if (!target) {
    /* R37: the screens and offered scripts, asked of the store for this viewer; a silence or refusal is answered as the
       kinds' are (REC-52), never as "no screens". */
    const sOut = await doAnswer(stub.fetch(`http://do/affordancescreens?viewer=${encodeURIComponent(viewer ?? "")}`));
    if (sOut.refused) return storeRefusal(sOut);
    if (!sOut.answered || !sOut.result) return storeSilent("affordances", sOut.correlation);
    return answer(affordancesAnswer({ kinds, gate, screens: sOut.result.screens, wizard_scripts: sOut.result.wizard_scripts }));
  }
  /* R13 (REC-25): an object the viewer may not see answers NO_SUCH_BUNDLE, identical to an absent one. The facts are
     asked with the stamps exactly as the acts receive them (D-311), so each question is asked of the caller the act
     will see. */
  const fOut = await doAnswer(stub.fetch(
    `http://do/affordancefacts?target=${encodeURIComponent(target)}&viewer=${encodeURIComponent(viewer)}`
    + `&identity=${encodeURIComponent(identity)}`
    + `&author=${encodeURIComponent(author ?? "")}&by=${encodeURIComponent(by ?? "")}`));
  if (fOut.refused) return storeRefusal(fOut);
  /* REC-52: a store silence is never answered as "there are no facts about that object", which is a claim about the
     object: what the acts on an object are is the whole of what this op is asked, so answering it out of a failure to
     ask would put a wrong set of affordances in front of a member. The store's own NO_SUCH_BUNDLE, and its 404, stand. */
  if (!fOut.answered) return storeSilent("affordances", fOut.correlation);
  const facts = fOut.result;
  if (!facts) return storeSilent("affordances");
  const result = affordancesAnswer({ target, facts, kinds, gate });
  if (result.ok === false)
    return json({ ...result, store: storeName, tokenClass: cls }, result.reason === "NO_SUCH_BUNDLE" ? 404 : 400);
  return answer(result);
}

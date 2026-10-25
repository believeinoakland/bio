/* intent's published fixtures (fix round 10; K4990, K4993, K4995, K5044): what the module answers, made by its real code over
   the real record, membership, promotion, entities and progressions each time a test calls one, never stored. A module that
   reads intent takes its answer from here and never builds one by hand. */
import { seeded, V } from "./fixture.mjs";

const must = (r, what) => {
  if (!r || r.ok !== true) throw new Error(`fixture ${what} refused: ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};

/** R2, R6, R7, R15 (monitoring reads `watchSet`, `gaps` and `registerSource`): the real `intentOf(...)` over a project whose
 *  objective's condition reads one entity's instances of a three-stage progression (`proc`) at grade B, 50%. Two instances
 *  stand: ENT-1 meets it, ENT-2 (related to ENT-1 as `member_of`) has its `need` placed and its `award` missing, so one gap
 *  stands, an objective-gap. `intent` is the real module; `project` the project; `viewer` a participant; `gaps` and `watch`
 *  are its real answers to `gaps` and `watchSet` for the project; `captures` the digests `watch` names. */
export async function intentWorld() {
  const w = seeded();
  for (const [id, kind] of [["ENT-1", "body"], ["ENT-2", "office"]]) w.entity(id, kind);
  w.relate("ENT-2", "ENT-1", "member_of");
  w.define();
  await w.thread("ENT-1", { need: "A", award: "B" });
  await w.thread("ENT-2", { need: "A" });
  const viewer = V("bob");
  must(w.i.setCondition({ project: w.P, reason: "Measured by the record.", author: viewer, viewer,
    condition: { progression: "proc", entity: "ENT-1", relation: "member_of", required: { grade: "B", stages: ["need", "award"] },
                 satisfied: { share: 50 } } }), "condition");
  return { world: w, intent: w.i, project: w.P, viewer,
           gaps: w.i.gaps({ project: w.P, viewer }), watch: w.i.watchSet({ project: w.P }),
           captures: w.i.watchSet({ project: w.P }).captures };
}

/** R9 (C-111.15, NOT_YOURS): the real refusal of `declareAspiration` when a member declares a member-scope aspiration for
 *  another member, the row a door picks the answer's check and words by. Nothing is written. `refusal` is the answer;
 *  `world` the intent world it was made in. */
export function notYoursRefusal() {
  const w = seeded();
  const refusal = w.i.declareAspiration({ scope: "member", owner: "carol", statement: "Know who holds the contracts.", author: V("bob") });
  return { world: w, intent: w.i, refusal };
}

/** R2, R3, R6, R7, R15 (follow-up 27; monitoring reads `watchSet`, `gaps`, `progress` and `registerSource` per project, over
 *  digests its own tests state): the real `intentOf(...)` whose projects' conditions read exactly the digests `held` names,
 *  made by real acts (a project promoted, a one-stage progression defined, an entity per project, each digest resolved to it
 *  and threaded into an instance, the condition set by `setCondition`), never a stored answer.
 *    `held`      `{ [name]: [digest, ...] }`: a project per name; its condition reads those captures, in digest order. An
 *                empty list is a project with an objective and no condition (`watchSet` answers none, `progress` a null
 *                condition, `gaps` none).
 *    `throwsFor` names whose `watchSet` throws when asked (an unreadable intent); the rest answer as the real module does.
 *    `page`      when set, a `watchSet` that names no `limit` is asked for `page` captures, so the cursor is followed as it
 *                is when more than the real page (WATCH_LIMIT_MAX) are held; the real code pages.
 *  Answers `{ world, intent, projects, viewer, calls, sources }`. `projects[name]` is the project's id, which the record gives
 *  (a project cannot be given an id). `intent` has `watchSet`, `gaps`, `progress` (each the real answer) and `registerSource`
 *  (the real registration, each accepted one also kept in `sources` as `{ kind, reader }`); `calls` records each `watchSet`
 *  asked, `{ project, after }`. `viewer` is a participant of every project. */
export async function watchSetOf(held = {}, { throwsFor = [], page = null } = {}) {
  const w = seeded();
  const viewer = V("bob");
  const defined = w.progressions.defineProgression({ progressionKey: "watched", label: "Watched documents", declaredBy: V("alice"),
    basis: "documents a project's objective rests on", stages: [{ key: "doc", cardinality: "0..n", required: "always" }] });
  must(defined, "progression");
  const projects = {};
  let k = 0;
  for (const [name, digests] of Object.entries(held)) {
    k += 1;
    const id = w.project(`Watched ${name}`, "alice");
    w.join(id, "bob");
    projects[name] = id;
    const shas = [...new Set(digests)].sort();
    if (!shas.length) continue;
    const entity = `ENT-W${k}`;
    w.entity(entity, "body");
    shas.forEach((sha, n) => w.resolve(sha, `INFO-W${k}-${n}`, entity, "A"));
    must(await w.progressions.threadInstance({ progressionKey: "watched", entityId: entity, threadedBy: V("alice"),
      placements: shas.map((captureSha) => ({ stage: "doc", captureSha })) }), "thread");
    must(w.i.setCondition({ project: id, reason: "Measured by the record.", author: viewer, viewer,
      condition: { progression: "watched", entity, required: { grade: "B", stages: ["doc"] }, satisfied: { share: 50 } } }), "condition");
  }
  const unreadable = new Set(throwsFor.map((name) => projects[name] ?? name));
  const calls = [], sources = [];
  const intent = {
    calls, sources,
    watchSet(q = {}) {
      calls.push({ project: q.project, after: q.after ?? null });
      if (unreadable.has(q.project)) throw new Error("intent unreadable");
      return w.i.watchSet(page && q.limit == null ? { ...q, limit: page } : q);
    },
    gaps: (q) => w.i.gaps(q),
    progress: (q) => w.i.progress(q),
    registerSource(kind, reader) {
      const r = w.i.registerSource(kind, reader);
      if (r.ok) sources.push({ kind, reader });
      return r;
    },
  };
  return { world: w, intent, projects, viewer, calls, sources };
}

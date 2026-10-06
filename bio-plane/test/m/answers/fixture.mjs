/* answers over the modules it uses: calculations' test world (the real record-core, membership, promotion, content,
   retrieval, entities, events, standards, money, duties, lines, people and calculations on a real SQLite database at the
   plane's storage shape), with the real credentials beside them, and answers built over them as the composition root
   would. ai-runs (the ceiling) and the standing answerer are not merged: each is a provider the test controls, at the
   interface its approved requirements state (ai-runs R50, J1 (5)). Every test drives `answers` at its interface. */
import { seeded, V, NOW, PROFILE, saved, R } from "../calculations/fixture.mjs";
import { linesOf } from "../../../src/lines/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { answersOf } from "../../../src/answers/index.mjs";

export { V, NOW, PROFILE, saved, R };
export const SEAL = "answers-test-seal-secret-0123456789abcdef";

/** bob and carol members, alice an administrator; answers built with every owner; the rule services on unless `off`. */
export function answersWorld({ rules = true, deps: more = {}, ...opts } = {}) {
  const w = seeded(opts);
  w.lines = linesOf(w.host, { record: w.record });
  w.credentials = credentialsOf(w.host, { record: w.record, membership: w.membership, sealSecret: SEAL });
  w.credentials.migrate();
  w.ceiling = { refusal: null, asked: [] };
  w.deps = { record: w.record, membership: w.membership, standards: w.standards, content: w.content, events: w.events,
    entities: w.entities, lines: w.lines, people: w.people, duties: w.duties, calculations: w.c, retrieval: w.retrieval,
    credentials: w.credentials, now: () => w.clock.now,
    ceilingRefusal: (member, at) => { w.ceiling.asked.push({ member, at }); return w.ceiling.refusal; }, ...more };
  w.a = answersOf(w.host, w.deps);
  /* the plane makes every module's tables at boot; here retrieval's zone (its R69) meets local-facts on its first read,
     so it is read once now, before any test takes its snapshot */
  w.retrieval.zone();
  if (rules) w.record.setSetting("answers_rule_services", true, "admin");
  w.at = (iso) => { w.clock.now = iso; w.clock.ms = Date.parse(iso); };
  return w;
}

/** A well-formed answer, its fields overridden. */
export function answer(over = {}) {
  return { question_as_read: "what did the record say?", clarifying: null, summary: null, sentences: [], holdings: [],
           rules: [], looks: [], bound: null, truncated: false, out_of_view: false, lens: null, not_established: [],
           query: null, next_acts: [], label: "machine work", ...over };
}

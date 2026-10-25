/* entities' published fixtures (K4990, K4993, K4995, K5044): each is made by entities' real code when a test runs and never stored. A later module's test
   takes the answer from here instead of hand-building entities' answer (a refusal with a code, a listing over a registry that cannot be read). Each is
   checked by `fixtures.test.mjs`, which calls it and compares the real answer. */
import { world, sha } from "./fixture.mjs";

const NOTE = "a subject the fixture registers";
const PROFILES = ["test-port-ellery"];

/** `entitiesWorld`: a real `Entities` (`w.e`, the instance `entitiesOf` gives) over a real record, with the test profile active, and three entities it
 *  registered: the person `w.pat`, a second person `w.lee` and the office `w.office`. `w.ok` is an `addIdentifier` act that succeeds (scheme `marlow_bar`,
 *  held by persons). Its refusals are the real ones: `createEntity` answers UNKNOWN_KIND, ENTITY_NO_LABEL and ENTITY_NO_NOTE, and `addIdentifier`
 *  NO_SUCH_ENTITY, UNKNOWN_SCHEME, SCHEME_NOT_FOR_KIND, NO_BASIS and (once `w.ok` is held by `w.pat`, and asked for `w.lee`) IDENTIFIER_TAKEN. */
export function entitiesWorld({ profiles = PROFILES } = {}) {
  const w = world({ profiles });
  const made = (kind, label) => w.e.createEntity({ note: NOTE, kind, label }).entity_id;
  const pat = made("person", "Pat Quill"), lee = made("person", "Lee Quill"), office = made("office", "Harbourmaster");
  const ok = { entityId: pat, scheme: "marlow_bar", id: "bar 12345", basis: "the bar's published roll", by: "member:ann" };
  return { ...w, pat, lee, office, ok };
}

/** `namingInRefused`: the real refusal of `namingIn({captureShas, kinds})` for an input it refuses: `kinds` that name nothing known (NO_KIND, UNKNOWN_KIND),
 *  no capture named (NO_SHA), or more than the cap of captures (TOO_MANY_CAPTURES, with `count` and `max`). Nothing is read or written. */
export function namingInRefused({ code = "UNKNOWN_KIND" } = {}) {
  const { e } = world({ profiles: PROFILES });
  const input = {
    NO_KIND: { captureShas: [sha("c")], kinds: [] },
    UNKNOWN_KIND: { captureShas: [sha("c")], kinds: ["office", "court"] },
    NO_SHA: { captureShas: [], kinds: ["office"] },
    TOO_MANY_CAPTURES: { captureShas: Array.from({ length: 201 }, (_, i) => sha(`c${i}`)), kinds: ["office"] },
  }[code];
  if (!input) throw new Error(`namingInRefused: no refusal ${code}`);
  return e.namingIn({ ...input, viewer: "member:ann" });
}

/** `unreadable`: the real `entitiesOfKind({kind: "office"})` over a registry whose read throws (the entities table is gone):
 *  `{ok: false, reason: "UNREADABLE", detail}`, the detail beginning "the registry could not be read". */
export function unreadable({ kind = "office" } = {}) {
  const w = world({ profiles: PROFILES });
  w.st.sql.exec(`DROP TABLE entities`);
  return w.e.entitiesOfKind({ kind, viewer: "member:ann" });
}

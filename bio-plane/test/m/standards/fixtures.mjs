/* standards' published fixtures (fix-round 10, Wave A batch 1; K4990, K4993, K4995, K5044): what the module answers, made
 * by its real code over the real record, membership, content and entities each time a test calls one, never stored.
 * A module that uses a standards read takes its answer from here and never builds one by hand. Each export returns the
 * real answers together with the ids the real code minted, so a user's test names no id of its own. */
import { seeded, V } from "./fixture.mjs";

const must = (r, what) => {
  if (!r || r.ok !== true) throw new Error(`fixture ${what} refused: ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};
/** The viewer that is a member of the world, and one that names no member (R5). */
export const MEMBER = V("carol"), STRANGER = "nobody";

/** `bindsAt` (R43) as the module answers it for a body that issued a standard in force on the date, and for another body
 *  the standard does not bind: `binds` and `other` are the two real answers. */
export function bindsAt({ date = "2025-01-01" } = {}) {
  const w = seeded();
  const body = w.entity("Port Ellery Selectboard"), elsewhere = w.entity("Marlow Schools Board");
  const standard = must(w.declare({ issuer: body, period: { from: "2020-01-01", to: "2040-12-31" } }), "bindsAt standard").id;
  const ask = (b) => w.s.bindsAt({ standard, body: b, date, viewer: MEMBER });
  return { standard, body, elsewhere, date, binds: ask(body), other: ask(elsewhere) };
}

/** A world with a policy that has every field R5 answers: cite, issuer, designation, edition, access, requires and texts. */
function heldPolicy(w, over = {}) {
  const passage = w.passage();
  const held = must(w.declare({ cite: "Administrative Instruction 9.1, §2", kind: "policy", issuer: "Public Works",
                                designation: "AI 9.1", edition: "2023", access: "free", text: [passage.contentId],
                                requires: [passage.contentId], period: { from: "2023-01-01", to: null }, ...over }), "policy");
  return { id: held.id, contentId: passage.contentId };
}

/** `standardRead` (R5, R17) over a seeded world: the read of a held policy, and the one answer (`NO_SUCH_STANDARD`) for
 *  an id the record does not hold and for a held id read by a viewer naming no member. */
export function standardRead() {
  const w = seeded();
  const { id, contentId } = heldPolicy(w);
  const absentId = "STD-2026-9999-policy";
  return { id, contentId, absentId,
           read: w.s.standardRead({ id, viewer: MEMBER }),
           absent: w.s.standardRead({ id: absentId, viewer: MEMBER }),
           unseen: w.s.standardRead({ id, viewer: STRANGER }) };
}

/** `standardReadWorld`: the real `standardsOf` instance with the policies a test declares through `policy`, read for the
 *  viewers named here. `standardRead({id, viewer})` is the instance's own. */
export function standardReadWorld() {
  const w = seeded();
  return {
    standards: w.s, member: MEMBER, stranger: STRANGER,
    standardRead: (a) => w.s.standardRead(a),
    policy: (over = {}) => heldPolicy(w, over),
    declare: (over = {}) => w.declare(over),
    passage: () => w.passage(),
  };
}

/** `standardRow`: a held policy and an ordinance as one read answers the first (cite, kind, issuer, texts, period), with
 *  the `standardsIn` list of both; `std` and `cnt` are the policy's id and its text passage's content id. */
export function standardRow() {
  const w = seeded();
  const ord = must(w.declare({ cite: "Municipal Code §12.04", kind: "ordinance", issuer: "City Council" }), "ordinance");
  const { id: std, contentId: cnt } = heldPolicy(w);
  return { std, cnt, ordinance: ord.id,
           row: w.s.standardRead({ id: std, viewer: MEMBER }),
           standards: w.s.standardsIn({ viewer: MEMBER }) };
}

/** `standardsEmptyReads` (R32 and law-relations' addressesOf): the reads by key and portion, by a portion's content id
 *  and for the addresses of a key, over a record that holds no standard. */
export function standardsEmptyReads() {
  const w = seeded();
  return { standardsAt: w.s.standardsAt({ key: "/eli/none", viewer: MEMBER }),
           standardsWithPortion: w.s.standardsWithPortion({ contentId: "CNT-2026-0001", viewer: MEMBER }),
           addressesOf: w.s.addressesOf({ key: "/eli/none", viewer: MEMBER }) };
}

/** `standardsIn` (R8) over a record that holds no standard. */
export function standardsIn() {
  return seeded().s.standardsIn({ viewer: MEMBER });
}

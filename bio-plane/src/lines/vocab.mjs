/* lines: the closed vocabularies (Terms; R15). A line kind, a capacity, a role per kind and the members' words for each
   connection kind are revised only by spec (K1441, K1453, K1455, K1486), never by a write. `kinds()`, `capacities()`
   and `roles(kind)` answer them frozen, for `affordances` to publish. */

/* Structure: the bodies and offices, who funds and contracts, who acts for and answers for whom (K1441, K1470). */
export const STRUCTURE_KINDS = Object.freeze(["part_of", "post_in", "holds", "reports_to", "oversees", "appoints",
  "seat_on", "funds", "contracts_with", "acts_for", "responsible_for", "custodian_of", "successor_of"]);
/* People: memberships, schooling, credentials, interests and ties (K1452, K1453; K1455: `related_to` without condition). */
export const PEOPLE_KINDS = Object.freeze(["belongs_to", "educated_at", "credentialed_by", "owns_interest_in",
  "related_to", "associate_of"]);
/* Proceedings: the parties and the links between proceedings (C1). */
export const PROCEEDING_KINDS = Object.freeze(["party_to", "appeal_of", "consolidated_with", "remanded_to", "arises_from"]);
export const LINE_KINDS = Object.freeze([...STRUCTURE_KINDS, ...PEOPLE_KINDS, ...PROCEEDING_KINDS]);

/* `holds` only: the capacity a post is held in. */
export const CAPACITIES = Object.freeze(["employee", "elected", "appointed", "acting", "interim", "ex officio",
  "board member", "officer or director", "partner", "military service", "volunteer", "contractor", "other"]);

/* The OCDS party-role codelist, for `contracts_with`. */
export const OCDS_PARTY_ROLES = Object.freeze(["buyer", "procuringEntity", "supplier", "tenderer", "funder", "enquirer",
  "payer", "payee", "reviewBody", "interestedParty"]);
/* A party's role in a proceeding, closed here (K1505 (10); reading J1 (1)). */
export const PARTY_ROLES = Object.freeze(["plaintiff", "defendant", "petitioner", "respondent", "appellant", "appellee",
  "cross_complainant", "cross_defendant", "intervenor", "real_party_in_interest", "amicus", "applicant", "protestant",
  "complainant", "interested_party", "other"]);
export const ROLES = Object.freeze({
  reports_to: Object.freeze(["administrative", "functional", "budgetary"]),
  contracts_with: OCDS_PARTY_ROLES,
  party_to: PARTY_ROLES,
});

/* R2: the end kinds a kind is fixed to; every other kind takes any registered kinds. */
export const END_KINDS = Object.freeze({
  seat_on: Object.freeze({ from: ["office"], to: ["body"], code: "SEAT_ON_ENDS" }),
  party_to: Object.freeze({ from: null, to: ["proceeding"], code: "PROCEEDING_ENDS" }),
  appeal_of: Object.freeze({ from: ["proceeding"], to: ["proceeding"], code: "PROCEEDING_ENDS" }),
  consolidated_with: Object.freeze({ from: ["proceeding"], to: ["proceeding"], code: "PROCEEDING_ENDS" }),
  remanded_to: Object.freeze({ from: ["proceeding"], to: ["proceeding"], code: "PROCEEDING_ENDS" }),
});

/* The members' words for each kind (K1486): positions and memberships, never "knows", "network" or a measure. */
const WORDS = {
  part_of: "part of", post_in: "a post in", holds: "held the post", reports_to: "reports to", oversees: "oversees",
  appoints: "appoints", seat_on: "a seat on", funds: "funds", contracts_with: "has a contract with",
  acts_for: "acts for", responsible_for: "responsible for", custodian_of: "keeps the records of",
  successor_of: "successor of", belongs_to: "a member of", educated_at: "studied at",
  credentialed_by: "holds a credential from", owns_interest_in: "has an interest in", related_to: "related to",
  associate_of: "an associate of", party_to: "a party to", appeal_of: "an appeal of",
  consolidated_with: "consolidated with", remanded_to: "remanded to", arises_from: "arises from",
};

/* R14: one connection kind per line kind, `holds` one per capacity. */
export const OWNER = "lines";
const slug = (s) => s.replace(/ /g, "_");
export const connectionKind = (kind, capacity = null) =>
  (kind === "holds" ? `line:holds:${slug(capacity ?? "other")}` : `line:${kind}`);
export const CONNECTION_KINDS = Object.freeze([
  ...LINE_KINDS.filter((k) => k !== "holds").map((k) => Object.freeze({ kind: connectionKind(k), word: WORDS[k], class: "evidentiary" })),
  ...CAPACITIES.map((c) => Object.freeze({ kind: connectionKind("holds", c), word: `${WORDS.holds} (${c})`, class: "evidentiary" })),
]);
/* A connection kind back to its line kind and, for `holds`, its capacity; null for none of this owner's. */
export function lineKindOf(ck) {
  if (typeof ck !== "string" || !ck.startsWith("line:")) return null;
  const rest = ck.slice(5);
  if (rest.startsWith("holds:")) {
    const cap = CAPACITIES.find((c) => slug(c) === rest.slice(6));
    return cap ? { kind: "holds", capacity: cap } : null;
  }
  return LINE_KINDS.includes(rest) && rest !== "holds" ? { kind: rest, capacity: null } : null;
}

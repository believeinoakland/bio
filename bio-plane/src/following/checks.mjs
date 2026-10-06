/* following — its refusal rows (requirements: `build/requirements/following.md`; DEC-49; N620, K1836). Every refusal this
 * module answers carries its code, its row and the member's translation (R1's "one with a catalogue row carries its
 * `check`, `code` and `translation`"). A family of its own, C-137 (K1836), so control-plane's composed catalogue never
 * decorates one of these refusals with another module's row: the per-meeting link's `NO_SUCH_ADDRESS`, which monitoring's
 * C-18.12 holds for a different act, is re-keyed `NO_SUCH_MEETING_ADDRESS` (K1836), and the two codes answers' and
 * money-checks' families already held are re-keyed `BAD_FOLLOW_CADENCE` and `NOT_THE_FOLLOWER`, so no code is held in two
 * families. Each translation says what the code already said, no new meaning. New rows: each stays `awaiting stamp`
 * until T35's promotion job (plan T34 Rules (5) 4). The listener refusals of R19 are membership's
 * (`listenerRefusal`), answered through it, never minted here. No translation names a place (R18), and none names the
 * group's own system other than as "your group's Civicsmith" (DEC-149); none needs to. */

const at = (fn, region) => `src/following/index.mjs ${fn} > ${region}`;
const row = (n, fn, region, translation) => Object.freeze({ check: `C-137.${n}`, where: at(fn, region), translation });

export const FOLLOWING_CHECKS = Object.freeze({
  MACHINE_CANNOT_FOLLOW: row(1, "#actorRefusal", "is-follow-member",
    "A follow, and the body a watch is captured before, is a member's own act; the machine follows nothing of its own "
    + "accord. Nothing was written."),
  NO_SUCH_HOME: row(2, "#actorRefusal", "is-follow-home",
    "A follow lives in the project of a bundle you may see, named as its home; no such bundle was named. Nothing was "
    + "written."),
  NO_SUCH_BODY: row(3, "followBody", "is-follow-body",
    "No body by that id is registered that you may see. Nothing was written."),
  NO_LEGISTAR_ID: row(4, "followBody", "is-follow-legistar",
    "That body holds no identifier in a scheme the active jurisdiction profiles name for Legistar, so its records "
    + "cannot be read there. Nothing was written."),
  BAD_PERIOD: row(5, "followBody", "is-follow-period",
    "A follow names the days it covers: a first day, and a last day not before it, or none. Nothing was written."),
  BAD_FOLLOW_CADENCE: row(6, "#cadence", "is-follow-cadence",
    "A follow is read daily, weekly or monthly. Choose one of these. Nothing was written."),
  NO_SUCH_FOLLOW: row(7, "#follow", "is-follow-held",
    "No follow of that kind that you may see is held under that id. Nothing was changed."),
  NOT_THE_AUTHOR: row(8, "unfollow", "is-follow-author",
    "A follow is ended only by the member who made it. Nothing was changed."),
  NO_LOCATOR: row(9, "followRegister", "is-follow-locator",
    "A register or a portal is followed at a public https address. Nothing was written."),
  BAD_RENDER: row(10, "followRegister", "is-follow-render",
    "Whether the register is re-rendered is yes or no. Nothing was written."),
  BAD_GATE: row(11, "#gated", "is-follow-gate",
    "A register behind an account or a fee is declared as one or the other, and one that charges a fee names its "
    + "price, so you see it before any refresh. Nothing was written."),
  PERSON_QUERY_NOT_NAMED: row(12, "followPersonQuery", "is-person-query-named",
    "A person is followed only through one register's own query for one identifier you name, in a scheme the active "
    + "profiles list for that register, at the register's own address for it, in your project; a query by name alone "
    + "or across registers is not followed. Nothing was written."),
  NO_KEY: row(13, "followPortal", "is-portal-key",
    "A portal follow declares the field that keys its rows. Nothing was written."),
  NO_SUCH_MEETING_ADDRESS: row(14, "perMeetingBody", "is-meeting-address",
    "No address you may see is watched per meeting, so no body's meetings can be named for it. Nothing was written."),
  NO_SUCH_SNAPSHOT: row(15, "snapshotDiff", "is-snapshot-held",
    "Each snapshot is named by its number among this portal follow's snapshots; one named is not held. Nothing was "
    + "changed."),
  NOT_GATED: row(16, "refreshRegister", "is-refresh-gated",
    "A public register is read on its schedule; a member's refresh is only for one behind an account or a fee. "
    + "Nothing was read."),
  NOT_THE_FOLLOWER: row(17, "refreshRegister", "is-refresh-follower",
    "Only the member who follows this register refreshes it, with their own credential. Nothing was read."),
  PRICE_FIRST: row(18, "refreshRegister", "is-refresh-price",
    "This register charges a fee; the refresh runs only once its price, as shown, is accepted. Nothing was read."),
  NO_CREDENTIAL: row(19, "refreshRegister", "is-refresh-credential",
    "A register behind an account is read with your own credential, and none was given. Nothing was read."),
  NOT_READ: row(20, "refreshRegister", "is-refresh-read",
    "The register could not be read; the reason is beside this. Nothing was changed."),
});

/** A refusal answer naming one of this module's rows (DEC-49): `{ok: false, reason, code, check, translation, detail,
 *  ...extra}`. */
export function followRefusal(code, detail, extra = {}) {
  const r = FOLLOWING_CHECKS[code];
  return { ok: false, reason: code, code, check: r ? r.check : null, translation: r ? r.translation : null, detail, ...extra };
}

/* ai-accounts' exported constants and small pure helpers (R14, R40–R57, R65). */

/* R14 (T40; N812, D34, B2): the kinds of use. Every account holds a switch for each, `explore` holding one of
   `EXPLORE_VALUES` (B6, K2350), plus `suggestions` (K1479); `USE_SWITCHES` names them all. An act served by an account is
   of any kind but `explore` (R3, R11). Defaults: ask, draft, run, enquire, read, transcribe and account on; standing and
   suggestions off; explore no. */
export const USE_KINDS = Object.freeze(["ask", "draft", "run", "standing", "explore", "enquire", "read", "transcribe",
  "account"]);
export const EXPLORE_VALUES = Object.freeze(["no", "ask", "yes"]);
export const USE_SWITCHES = Object.freeze([...USE_KINDS, "suggestions"]);
export const USE_DEFAULTS = Object.freeze({ ask: true, draft: true, run: true, standing: false, explore: "no", enquire: true,
  read: true, transcribe: true, account: true, suggestions: false });
export const ACT_KINDS = Object.freeze(USE_KINDS.filter((k) => k !== "explore"));
/* The two switches R4 named, two of R14's. */
export const ACCOUNT_SWITCHES = Object.freeze(["suggestions", "standing"]);

/* R14 (T53): each kind of use belongs to one Gate 1 part, which `ai-catalogue` rates per entry (R55). */
export const PART_OF_KIND = Object.freeze({ ask: "ask", standing: "ask", draft: "draft", enquire: "draft", read: "read",
  transcribe: "transcribe", run: "run", explore: "run", account: "account" });

/* R20 (DEC-172): the keep-away reason's bounds, in characters. */
export const KEEP_AWAY_REASON = Object.freeze({ min: 1, max: 2000 });

/* R40: the five means by which an account's credential is reached; R42: a level's rank and a plan scope's. */
export const MEANS = Object.freeze(["gateway", "sealed", "reference", "issued", "none"]);
export const LEVEL_RANK = Object.freeze({ member: 1, project: 2, group: 3 });
export const SCOPE_RANK = Object.freeze({ member: 1, project: 2, team: 3 });

/* R43: a reference's pointer, each part a non-empty string of at most this many characters. */
export const REFERENCE_MAX_CHARS = 512;

/* R52: the checks P1–P7, in their order. */
export const CHECK_IDS = Object.freeze(["P1", "P2", "P3", "P4", "P5", "P6", "P7"]);

/* R50: the reasons an account is moved down the list. */
export const HOP_REASONS = Object.freeze(["limit", "unavailable", "lapsed", "capability", "auth", "member_switch"]);

/* R44: the two routes a gateway key arrives by. */
export const GATEWAY_ROUTES = Object.freeze(["screen", "dashboard"]);

/* R45: why a gateway account was flagged. */
export const PAYER_CAUSES = Object.freeze(["credits", "other_gateway", "log_unreadable"]);

/* R76: a dated terms change is noticed this many days ahead. */
export const TERMS_NOTICE_DAYS = 30;

/* R65: the class the control plane stamps (`token:<class>`, `class:<class>`) for the agent Worker's credential, the one
   principal that is served an account's credential. */
export const WORKER_CLASS = "agent-worker";

/* R2: a held sign-in token's length bounds when the catalogue states none, in characters. */
export const SIGNIN_TOKEN_LENGTH = Object.freeze({ min: 20, max: 2000 });

/* R16: history reads as `credentials` R15's: this many by default, at most this many. */
export const HISTORY_LIMIT_DEFAULT = 200;
export const HISTORY_LIMIT_MAX = 500;

export const HOUR_MS = 3600 * 1000;
export const DAY_MS = 24 * HOUR_MS;

/* A whole-second instant, the record's `…:00Z` spelling; the caller names the instant (R39: the instance clock). */
export const stampSecond = (when) => new Date(when).toISOString().replace(/\.\d+Z$/, "Z");

/* R14: the owner's level word. */
export const levelOf = (owner) => (owner === "group" ? "group" : typeof owner === "string" && owner.startsWith("project:")
  ? "project" : "member");

/* R14, R17: `group`, `project:<id>` or `member:<id>`, the id non-empty and naming no machine here (the caller adds that). */
export function ownerSpelled(owner) {
  if (owner === "group") return true;
  if (typeof owner !== "string") return false;
  if (owner.startsWith("project:")) return owner.length > 8;
  if (!owner.startsWith("member:")) return false;
  const id = owner.slice(7);
  return id !== "" && !id.startsWith("member:");
}

/* The words a level is called in a sentence (K3472: the team, never the group). */
export const LEVEL_WORD = Object.freeze({ group: "team", project: "project", member: "member" });

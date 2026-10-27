/* screens-action's T51 fix-round words, group "send" (R36–R54; the keys this group's entries read, each one setup-words holds; K3366, K3810).
   WORDS: keys added to SCREEN_WORDS. EXTRA: keys a screen draws that do not start with its `screen.<id>.` prefix, by screen id. */
const EX = ["heading", "intro1", "intro2", "intro3", "accepted", "contestable1", "contestable2", "below1", "below2", "undetermined", "captured", "nograde",
  "refused.summary", "refused.body1", "refused.body2", "refused.body3"].map((k) => "screen.start-send.exhibits." + k);
const CONTACT = ["label", "none", "help1", "help2", "help3", "refused.body1", "refused.body2"].map((k) => "screen.start-send.contact." + k);
const TEMPLATE = ["heading", "note1", "note2", "note3", "name.label", "name.help1", "name.help2", "use.label", "use.filing", "use.help1", "use.help2", "use.brief", "notes.label", "notes.help"]
  .map((k) => "screen.start-send.template." + k);
// R42: the choices a pointed-out sentence is answered with, and the refusals of the approval, on both screens that approve
const APPROVAL = ["refusal.ASSERTION_UNRESOLVED", "refusal.ASSERTION_RESOLUTION_REFUSED", "assertion.resolve.rewrite", "assertion.resolve.only_asks",
  "assertion.resolve.breach_claim", "phrasing.assertion.pointed", "refusal.CONTRADICTED_HELD", "pointer.record.contradicted", "act.release.label.start-send", "shell.reason.needed"];
// R48: the template's refusals, by their codes' words
const TEMPLATE_REFUSALS = ["TEMPLATE_FROM_UNAPPROVED", "TEMPLATE_NAME_TAKEN", "TEMPLATE_TIER3_FILE", "TEMPLATE_NAME_REFUSED", "TEMPLATE_USE_REFUSED", "TEMPLATE_KIND_REFUSED",
  "TEMPLATE_TEXT_REFUSED", "TEMPLATE_KIND_UNKNOWN", "TEMPLATE_PROFILE_UNKNOWN", "TEMPLATE_BLANK_UNKNOWN", "TEMPLATE_SCOPE_REFUSED", "TEMPLATE_DRAFT_OPEN", "TEMPLATE_RETIRED",
  "TEMPLATE_NOTES_REFUSED", "TEMPLATE_FROM_REFUSED"].map((c) => "refusal." + c);

// B16 (a), DEC-387: a sentence the record contradicts, released with a reason carried by the approval
const RELEASE = ["head", "why", "why.help", "done"].map((k) => "screen.start-send.release." + k);
// R3 (filings R43, R44; fix round 10): the language the draft is prepared in (the account's own word for it), and on a public comment the voice
const MARKS = ["screen.account.language.field", "voice.group", "voice.group.means", "voice.self", "voice.self.means"];
export const WORDS = Object.freeze([...EX, ...CONTACT, ...TEMPLATE, ...RELEASE]);
export const EXTRA = Object.freeze({
  "start-send": Object.freeze([...APPROVAL, ...TEMPLATE_REFUSALS, "refusal.FILING_TIER_UNDETERMINED", "risk.title", "refusal.ACTION_BASIS_REFUSED", ...MARKS]),
  request: Object.freeze([...APPROVAL, "screen.account.language.field"]),
});

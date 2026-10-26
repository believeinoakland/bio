/* screens-action's T51 fix round 10 words (R56; K5271; the keys this group's entries read, each one setup-words holds; K3366). WORDS: keys added to
   SCREEN_WORDS. EXTRA: keys a screen draws that do not start with its `screen.<id>.` prefix, by screen id. */
export const WORDS = Object.freeze([]);
export const EXTRA = Object.freeze({
  // walk E K-words: a check that cannot be told for want of a day, and one that falls before its phase, worded by key with names; K4: a part of an addressee left empty
  plan: ["findin.fieldneeded", "action-plans.time_zone_held_place", "action-plans.says.whether_regulated_date", "action-plans.says.whether_regulated_date_falls",
    "action-plans.says.regulated_date_falls"],
  // walk C C-M11: a concluded question that is no finding yet is drawn as concluded; walk E C2a: no office or body held points to where one is added
  matter: ["question.concluded.heading", "screen.request.nooffice.admin"],
});

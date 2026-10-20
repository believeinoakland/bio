/* screens-action's T51 fix-round words, group "request" (R39, R46; the keys this group's entries read, each one setup-words holds;
   K3366, K3810). WORDS: keys added to SCREEN_WORDS. EXTRA: keys a screen draws that do not start with its `screen.<id>.` prefix, by
   screen id. */
export const WORDS = Object.freeze([
  // R46: the pointer to the page where an organization's records lines are kept
  "screen.request.nooffice.pointer.a", "screen.request.nooffice.pointer.b",
]);
export const EXTRA = Object.freeze({
  // R39: which name the records concern, asked before the offices (the design's words for naming a subject); R46: the organization's page
  request: ["screen.person.keeper.subject.label", "screen.person.keeper.subject.help.a", "screen.person.keeper.subject.help.b", "screen.person.name", "screen.person.purpose"],
});

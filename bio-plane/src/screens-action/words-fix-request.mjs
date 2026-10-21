/* screens-action's T51 fix-round words, group "request" (R39, R46; the keys this group's entries read, each one setup-words holds;
   K3366, K3810). WORDS: keys added to SCREEN_WORDS. EXTRA: keys a screen draws that do not start with its `screen.<id>.` prefix, by
   screen id. */
export const WORDS = Object.freeze([
  // R46: the pointer to the page where an organization's records lines are kept
  "screen.request.nooffice.pointer.a", "screen.request.nooffice.pointer.b",
  // R39 (DEC-387 B424): which name the records concern
  "screen.request.subject.label", "screen.request.subject.help",
]);
export const EXTRA = Object.freeze({
  // R39: which name the records concern, asked before the offices (`screen.request.subject.*`, DEC-387); R46: the organization's page
  request: ["screen.person.name", "screen.person.purpose"],
});

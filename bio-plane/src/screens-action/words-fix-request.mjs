/* screens-action's T51 fix-round words, group "request" (R39, R46; the keys this group's entries read, each one setup-words holds;
   K3366, K3810). WORDS: keys added to SCREEN_WORDS. EXTRA: keys a screen draws that do not start with its `screen.<id>.` prefix, by
   screen id. */
export const WORDS = Object.freeze([
  // R46: the pointer to the page where an organization's records lines are kept
  "screen.request.nooffice.pointer.a", "screen.request.nooffice.pointer.b",
  // R39 (DEC-387 B424): which name the records concern
  "screen.request.subject.label", "screen.request.subject.help",
  // C64 (DEC-402): "Name the office yourself", the design's own rows
  "screen.request.nameoffice.head", "screen.request.nameoffice.note", "screen.request.nameoffice.name", "screen.request.nameoffice.name.help",
  "screen.request.nameoffice.where", "screen.request.nameoffice.where.help", "screen.request.nameoffice.law", "screen.request.nameoffice.law.help",
  "screen.request.nameoffice.use.help", "screen.request.nameoffice.mark",
]);
export const EXTRA = Object.freeze({
  // R39: which name the records concern, asked before the offices (`screen.request.subject.*`, DEC-387); R46: the organization's page
  // C64: the act's label; a name left empty is asked for by `findin.fieldneeded`; her reason (`entities` R1's note) is the kit's reason field
  request: ["screen.person.name", "screen.person.purpose", "act.entitycreate.label.request", "findin.fieldneeded", "shell.reason", "shell.reason.help"],
});

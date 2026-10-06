/* The per-screen references (DEC-160, widened 6 October): for each screen, the things it names, what each is, and why it
   matters to what the member is doing there. Merged into REFS from mock-shell.js; GLOBAL_REFS cover things named everywhere. */
const SCREEN_REFS = {};
for (const [k, v] of Object.entries(SCREEN_REFS)) REFS[k] = (REFS[k] || []).concat(v);

/* reader-container's public calls (R1-R8): see reader.mjs. */
export { plan, read, collect, macrosNote, encryptedNote } from './reader.mjs';
export { CONVERT, FRAMES, ARCHIVES, REFUSED_BY_NAME, kindOf, routeOf } from './kinds.mjs';
export { ARCHIVE, IMAGE, BYTE_ROWS, PAGES_ROW, TIME_ROW, byteBound } from './limits.mjs';
export { sizeWords } from './refusal.mjs';

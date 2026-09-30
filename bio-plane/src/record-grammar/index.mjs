// @ts-check
/* record-grammar: the record's shared grammar, below every module that reads or writes a document (layer 1, first in
   the order). Pure: no store, no network, no clock (R24). This is the module's one entry; each part is in its own
   file. */
export { BUNDLE_ID_RE, ANN_ID_RE, FILENAME_RE, ISO_TS_RE } from './ids.mjs';
export { OBJECT_TYPES, LEGACY_TYPE_ALIASES, normalizeType } from './types.mjs';
export { CORE_FIELDS, FORBIDDEN_ALIASES, parseFrontmatter } from './frontmatter.mjs';
export { canonicalJson } from './json.mjs';
export { NON_MEMBER_AUTHORS, ACTOR_CLASSES, MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX, MACHINE_STAMP_PREFIXES,
  isMachineStamp, isMachineIdentity } from './actors.mjs';
export { BASIS_ROLES, BASIS_GRADES, GRADE_AXES, TESTIMONY_GRADE, GRADE_SOURCES, EARNED_GRADE_SOURCES,
  EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE } from './grades.mjs';
export { isPublicHttpsLocator } from './locator.mjs';
export { b64ToBytes, createSha256, sha256HexSync } from './sha256.mjs';

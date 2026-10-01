export const SCHEMA = `-- BIO store schema, draft 1, derived from the real bundle.md frontmatter and
-- _history/manifest.json shapes in tree 0.1.94. The bundle format is
-- authoritative; this is a projection of it and must never bend it.

-- Every table is its owner's: each module's migrate() runs its own (record-core's RECORD_SCHEMA first), so this
-- text holds no fragment and nothing runs it.
`;

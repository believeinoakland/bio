import { PROVENANCE_SCHEMA } from "./provenance/schema.mjs";
import { HOST_GOVERNOR_SCHEMA } from "./host-governor/schema.mjs";
import { BIAS_SCHEMA } from "./bias/schema.mjs";
import { AI_RUNS_SCHEMA } from "./ai-runs/schema.mjs";
export const SCHEMA = `-- BIO store schema, draft 1, derived from the real bundle.md frontmatter and
-- _history/manifest.json shapes in tree 0.1.94. The bundle format is
-- authoritative; this is a projection of it and must never bend it.

-- The register, the acquisition receipts (captured_locators) and the route marks are provenance's tables,
-- defined with their reasons in src/provenance/schema.mjs (R41, R48).
${PROVENANCE_SCHEMA}

${AI_RUNS_SCHEMA}

${BIAS_SCHEMA}

${HOST_GOVERNOR_SCHEMA}
`;

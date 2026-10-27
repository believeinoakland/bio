# odf-reader (T53)

**Status** · session_018BhcefXKEEqrV3LsP4yTXY · depth 2 · NEEDS BOB: the odf-reader tests read the keys normalised_by and no_byte_rewritten at runtime, and those rows exist only in the regenerated rows.mjs (build.mjs). Job complete refuses a dirty tree and regenerated rows are not mine, so complete cannot pass before proc merge regenerates them. Rule: regenerate rows in the job's complete step, or commit the regenerated rows for this job
**Sessions** · 1

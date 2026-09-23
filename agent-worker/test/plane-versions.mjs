/* D-220 — THE PLANE MOCK'S `op=search` AND `op=versionchain` BRANCHES, FOR A
 * MOCK THAT HOLDS NO CAPTURES.
 *
 * `collect` now resolves every citation to its document through these two reads
 * (`src/index.mjs`, D-220). A mock that answered them with a 400 "unknown op" made
 * every citation's document UNDETERMINED and put two refusals at the head of the
 * run's `refusals`, which is a fact about the mock and not about the run. A mock
 * that answered "yes, one document" for anything would be `plane-meaning.mjs`'s
 * defect — a fixture that says yes to everything tests nothing.
 *
 * So these branches answer what the REAL plane answers over a record that holds
 * NO bundle and NO captured version: `op=search` finds no hit, and
 * `op=versionchain` answers an empty chain with `documents: 0`. Every citation
 * then resolves UNCHAINED, which is honest for an empty record. The shapes are
 * the ones `Store#search` and `Store#versionChain` return, wrapped the way the
 * control plane wraps a DO answer (`{ ok: true, result }`). What the chain looks
 * like when the record HOLDS versions is measured against the REAL plane in
 * `versions.test.mjs`, never here.
 *
 * NOT a `.test.mjs`: an instrument the suites share, not a suite. */
export const versionReadBranches = () => `
    /* D-220: an EMPTY record's answers, written by test/plane-versions.mjs. */
    if (op === "search")
      return Response.json({ ok: true, result: { query: { q: url.searchParams.get("q") || "" },
        total: 0, limit: 1, offset: 0, hits: [] } });
    if (op === "versionchain") {
      const addr = String(url.searchParams.get("address") || "").trim();
      return Response.json({ ok: true, result: { ok: true, address_norm: addr, documents: 0,
        versions: [], count: 0, total: 0, limit: 200, offset: 0, truncated: false,
        at: null, at_index: null, predecessor: null } });
    }
`;

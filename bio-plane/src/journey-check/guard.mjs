/* journey-check R3: the walk runs only against an instance whose `bootstrap` answers `test_instance: true`. The walker's
   own requests to an instance are this one read and nothing else; every write is a journey act, made by the browser. */

export class WalkRefused extends Error {
  constructor(code, detail) { super(`${code}: ${detail}`); this.code = code; this.detail = detail; }
}

/* `base` the instance's address; `fetchOf` the fetch that reaches it (the local arm's dispatcher, or the network). Answers
   the bootstrap read when it says `test_instance: true` exactly; throws WalkRefused otherwise, before anything is
   written. */
export async function requireTestInstance(base, fetchOf = fetch) {
  let r, j = null;
  try { r = await fetchOf(new Request(new URL("/api/?op=bootstrap", base).href, { method: "GET" })); }
  catch (e) { throw new WalkRefused("INSTANCE_UNREACHABLE", `${base} did not answer bootstrap (${e.message})`); }
  try { j = await r.json(); } catch { j = null; }
  if (!r.ok || !j || j.ok !== true) throw new WalkRefused("INSTANCE_UNREACHABLE", `${base} answered bootstrap with HTTP ${r.status}`);
  if (j.test_instance !== true)
    throw new WalkRefused("NOT_A_TEST_INSTANCE", `${base} does not answer test_instance: true (it answers ${JSON.stringify(j.test_instance ?? null)}); the walk writes only to a test instance`);
  return j;
}

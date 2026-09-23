/* surfacing-run.mjs — REC-171's SHARED FIXTURE: a suite whose fixtures create questions under an instance DEPLOY
 * TOKEN creates them INSIDE A RUN that token holds, as the plane now requires.
 *
 * WHY THIS EXISTS. `INVESTIGATIVE-SESSION.md` §11 item 5, "Rule 2's reach" (BOB #30, 2026-09-23): every creation of an
 * inquiry D-78 stamps `surfaced_by: agent` — every one that did not arrive through a member's session, the admin,
 * member and probe deploy tokens included — names a RUNNING run whose principal is the caller, with room under its
 * `surfaces` bound, or is refused `SURFACE_NO_RUN` (C-66.1). Before REC-171 only an `ai` credential was asked, and
 * dozens of suites built their fixtures by creating questions with the ADMIN or MEMBER token and no run: every one of
 * those fixtures was the defect the ruling closes (an `agent` question the record could say nothing about). They are
 * CORRECTED, never exempted: the plane's rule is unchanged for them, and this module makes their creations obey it.
 *
 * WHAT IT DOES, and nothing else. `withSurfacingRun(mf, tokens)` returns the Miniflare instance with ONE method
 * wrapped, `dispatchFetch`. A request that is `op=promote`, authenticated by one of the DEPLOY `tokens` given, whose
 * body is a CREATION (`base: null`) of an inquiry (by the catalog's `normalizeType`, so the legacy spellings count)
 * and names NO `run`, is sent with `run` set to a run that SAME token holds in the SAME namespace. That run is opened
 * the first time it is needed — through the op, `op=airunopen` over a fixture project the token creates through
 * `op=promote` — and declares a `surfaces` bound large enough for any fixture. Every other request passes through
 * byte-unchanged, and a creation that already names a run (right or wrong) is never touched, so a suite asserting a
 * refusal still gets it.
 *
 * WHAT A SUITE USING IT GIVES UP, stated: its store holds ONE extra project and ONE extra run per (token, namespace)
 * that created a question, and each such question carries an `inquiry_run_surfacings` row. A suite that counts
 * projects, runs or links counts those too — and must, because they are real.
 *
 * `SURFACING_RUN_LABEL` is the run's label, so a suite (or a reader of its store) can tell the fixture's run apart. */
import { normalizeType } from "../checks/bio-checks.mjs";

export const SURFACING_RUN_LABEL = "REC-171 fixture run: the deploy token's questions are surfaced inside it";
const FIXTURE_SURFACES = 1_000_000;

const projectMd = (now) => ["---", "object_type: project", "current_state: forming", `created: "${now}"`,
  `last_updated: "${now}"`, "references: []", "---", "", "## Summary", "",
  "The fixture project a deploy token's surfacing run is opened over (REC-171).", "", "## Session Log", ""].join("\n");

const sha256hex = async (s) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};

export function withSurfacingRun(mf, tokens) {
  /* THE DEPLOY TOKENS: given, or read from the instance's own bindings — the three deploy classes' env values, which
     is exactly what `classify()` compares a token with. A session token is never among them. */
  let deploy = tokens ? Promise.resolve(new Set(tokens.filter((x) => typeof x === "string" && x))) : null;
  const deploySet = () => deploy ??= mf.getBindings().then((env) =>
    new Set(["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN"].map((k) => env[k]).filter((x) => typeof x === "string" && x)));
  const runs = new Map();          // `${token}\u0000${store}` -> Promise<run id>
  const raw = mf.dispatchFetch.bind(mf);
  let seq = 0;

  const openRun = async (token, store, group) => {
    const auth = `token=${encodeURIComponent(token)}${store ? `&store=${encodeURIComponent(store)}` : ""}`;
    const now = new Date().toISOString().split(".")[0] + "Z";
    const md = projectMd(now);
    const pr = await (await raw(`http://x/api/?op=promote&${auth}`, { method: "POST", body: JSON.stringify({
      base: null, snapKey: `${now.replace(/[-:]/g, "")}_5171f1a0`,
      meta: { object_type: "project", title: "REC-171 fixture project", current_state: "forming",
              ...(group ? { group } : {}),
              created: now, last_updated: now },
      files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: await sha256hex(md) }], register: [] }) })).json();
    const project = (pr && pr.result && pr.result.bundleId) || (pr && pr.bundleId);
    if (!project) throw new Error(`REC-171 fixture: the deploy token could not create its fixture project: ${JSON.stringify(pr).slice(0, 400)}`);
    const run = `RUN-2026-0923-rec171-fixture-${++seq}`;
    const ro = await (await raw(`http://x/api/?op=airunopen&${auth}`, { method: "POST", body: JSON.stringify({
      run, contextType: "project", contextId: project, label: SURFACING_RUN_LABEL, mode: "check",
      principalClaude: "instance", principalClaudeRef: "fixture/claude", skillVersion: "investigative-session@1",
      bounds: [{ bound: "surfaces", allowed: FIXTURE_SURFACES, unit: "questions" }], leaseMs: 86_400_000 }) })).json();
    const opened = (ro && ro.result) || ro;
    if (!opened || opened.started !== true)
      throw new Error(`REC-171 fixture: the deploy token could not open its surfacing run: ${JSON.stringify(ro).slice(0, 400)}`);
    return run;
  };

  const wrapped = async (input, init) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? String(input) : input.url);
    const token = url.searchParams.get("token");
    /* A WHOLE-STORE purge takes the fixture's project and run with everything else (D-113), so the next question
       opens a fresh run rather than naming one the store no longer holds. */
    if (url.searchParams.get("op") === "purge" && !url.searchParams.get("bundleId")) {
      const answer = await raw(input, init);
      runs.clear();
      return answer;
    }
    const body = init && typeof init.body === "string" ? init.body : null;
    if (url.searchParams.get("op") !== "promote" || !token || body === null
        || (typeof input !== "string" && !(input instanceof URL)) || !(await deploySet()).has(token))
      return raw(input, init);
    let b;
    try { b = JSON.parse(body); } catch { return raw(input, init); }
    const creation = b && typeof b === "object" && b.base === null && b.meta
      && normalizeType(b.meta.object_type) === "inquiry" && (b.run === undefined || b.run === null || b.run === "");
    if (!creation) return raw(input, init);
    const store = url.searchParams.get("store") || "";
    const key = `${token}\u0000${store}`;
    /* The fixture project states the group the question states (D-436: a creation names its producing group or
       the store's recorded one), so the fixture never records a group the suite did not. */
    const md = Array.isArray(b.files) ? (b.files.find((f) => f && f.path === "bundle.md") || {}).text : null;
    const line = typeof md === "string" ? /^group:\s*(.+)$/m.exec(md) : null;
    const group = (typeof b.meta.group === "string" && b.meta.group.trim()) || (line ? line[1].trim().replace(/^["']|["']$/g, "") : "");
    /* A plane that cannot open the run (a suite's plane built from OLDER sources, which knows no `surfaces` bound)
       gets the creation byte-unchanged: that plane asks no run, and if a current one refused the fixture, its own
       refusal names why — nothing here stands in for it. */
    if (!runs.has(key)) runs.set(key, openRun(token, store, group).catch(() => null));
    const run = await runs.get(key);
    if (!run) return raw(input, init);
    return raw(input, { ...init, body: JSON.stringify({ ...b, run }) });
  };

  return new Proxy(mf, {
    get(target, prop) {
      if (prop === "dispatchFetch") return wrapped;
      const v = Reflect.get(target, prop, target);
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
}

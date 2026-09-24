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
 * `op=promote`, NAMED UNIQUELY per opened run (M0-187: project names are unique per instance) — and declares a
 * `surfaces` bound large enough for any fixture. A run this fixture cannot open is RAISED BY NAME and fails the
 * dispatch; the one exception, a plane that has no surfacing machinery at all, is stated at `NO_SURFACING_MACHINERY`. Every other request passes through
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

/* M0-187: ONE COUNTER FOR THE WHOLE PROCESS, and it is what makes the fixture project's NAME unique.
 * A project's name is unique across an instance (Membership v2 §7.1, `promote`'s NAME_TAKEN), so while every run was
 * opened over a project titled `REC-171 fixture project`, the SECOND deploy token to need a run in a store was
 * refused NAME_TAKEN — and the swallow below turned that into the plane's `SURFACE_NO_RUN`, a refusal about the
 * caller's question that said nothing about the fixture that failed to build its run. MEASURED, two tokens in one
 * store: the admin's question landed with `surfaced_in.run`, the member's read SURFACE_NO_RUN, and only removing the
 * `.catch` named NAME_TAKEN. The counter is MODULE-scoped rather than per-wrapper because a suite may wrap one store
 * TWICE — a per-wrapper counter restarts at 1 and collides with the projects the first wrapper created, which is
 * what `observation-log` and `founder-sight` do when they re-attach a PERSISTED store to a second Miniflare. It
 * counts OPENED RUNS, not (token, store) pairs, which is strictly finer: a run re-opened after a whole-store purge
 * takes a name of its own too. */
let fixtureNo = 0;

/* THE ONE THING THIS FIXTURE MAY ABSORB: a plane that does not HAVE the surfacing machinery — a suite whose plane is
 * built from OLDER sources, where `airunopen` is no op at all or its bound table has no `surfaces`. That plane asks
 * no run, so the creation goes through byte-unchanged and its own answer stands. EVERY OTHER refusal is this
 * fixture's to report BY NAME (`VERIFICATION.md`: a refusal is reported, never swallowed) — the alternative, which
 * is what this module did, hands the suite a plane refusal of an un-run creation, and the reader then diagnoses the
 * subject under test instead of the fixture. The reason is read from wherever the plane put it, and anything
 * UNRECOGNISED THROWS, which is the safe direction: this set can only ever shrink what is raised. */
const NO_SURFACING_MACHINERY = new Set(["UNKNOWN_OP", "unknown op", "AI_RUN_BOUND_UNKNOWN"]);
const refusalName = (answer) => {
  const r = (answer && typeof answer === "object" && answer.result && typeof answer.result === "object")
    ? answer.result : answer;
  for (const v of [r && r.reason, r && r.code, r && r.error, answer && answer.reason, answer && answer.error])
    if (typeof v === "string" && v) return v;
  return "";
};

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

  const openRun = async (token, store, group) => {
    const nth = ++fixtureNo;
    const auth = `token=${encodeURIComponent(token)}${store ? `&store=${encodeURIComponent(store)}` : ""}`;
    const now = new Date().toISOString().split(".")[0] + "Z";
    const md = projectMd(now);
    const pr = await (await raw(`http://x/api/?op=promote&${auth}`, { method: "POST", body: JSON.stringify({
      base: null, snapKey: `${now.replace(/[-:]/g, "")}_5171f1a0`,
      meta: { object_type: "project", title: `REC-171 fixture project ${nth} (${store || "bio"})`,
              current_state: "forming",
              ...(group ? { group } : {}),
              created: now, last_updated: now },
      files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: await sha256hex(md) }], register: [] }) })).json();
    const project = (pr && pr.result && pr.result.bundleId) || (pr && pr.bundleId);
    /* NEVER ABSORBED: every plane a suite builds has `promote`, so a refusal here is a real failure and it is NAMED.
       NAME_TAKEN is the one M0-187 was paid for — the title is now unique per opened run, so a second token in one
       store no longer collides; if one ever does again, this line says so instead of the question's own refusal. */
    if (!project) throw new Error(`REC-171 fixture: the deploy token could not create its fixture project `
      + `(${refusalName(pr) || "no bundleId"}): ${JSON.stringify(pr).slice(0, 400)}`);
    const run = `RUN-2026-0923-rec171-fixture-${nth}`;
    const ro = await (await raw(`http://x/api/?op=airunopen&${auth}`, { method: "POST", body: JSON.stringify({
      run, contextType: "project", contextId: project, label: SURFACING_RUN_LABEL, mode: "check",
      principalClaude: "instance", principalClaudeRef: "fixture/claude", skillVersion: "investigative-session@1",
      bounds: [{ bound: "surfaces", allowed: FIXTURE_SURFACES, unit: "questions" }], leaseMs: 86_400_000 }) })).json();
    const opened = (ro && ro.result) || ro;
    if (opened && opened.started === true) return run;
    /* A plane without the machinery is the ONE tolerated answer, and it is reported as `null` — the caller then
       sends the creation byte-unchanged and the plane's own answer stands. Anything else is raised by name. */
    if (NO_SURFACING_MACHINERY.has(refusalName(ro))) return null;
    throw new Error(`REC-171 fixture: the deploy token could not open its surfacing run `
      + `(${refusalName(ro) || "no reason given"}): ${JSON.stringify(ro).slice(0, 400)}`);
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
    /* A plane that cannot open the run because it does not HAVE the machinery (OLDER sources, which know no
       `surfaces` bound) gets the creation byte-unchanged: that plane asks no run, and its own answer stands —
       nothing here stands in for it. Every other failure REJECTS this dispatch, by name (M0-187): the swallow that
       stood here (`.catch(() => null)`) handed the caller a plane refusal of an un-run creation, which reads as a
       defect in whatever the suite was testing. The rejected promise is CACHED, so every later creation by the same
       (token, store) is told the same cause rather than degrading quietly. */
    if (!runs.has(key)) runs.set(key, openRun(token, store, group));
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

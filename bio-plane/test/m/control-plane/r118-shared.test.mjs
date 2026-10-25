/* control-plane R118 (fix round 3, C14, P2.2; K4363; project-roster R42, review R43): THE DOOR HANDS `review.sharedDraftsByProject` TO
   `project-roster.projectList` AS ITS `sharedDraftsOf`, so `op=projectlist`'s rows answer `shared_drafts`. Part one drives the door's
   map over doubles of the two owners (what is handed, and how often); part two, over Miniflare and the real plane, is R118's own test:
   a project with a draft shared for review answers `shared_drafts.count: 1` on `op=projectlist` (control: one with none answers
   `{count: 0, newest: null}`). The plane hands the door's map the getter `of.projectRoster`. Negative controls throughout (K874). */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { ownerOps as controlPlaneOwnerOps } from "../../../src/store-assembly/owner-ops.mjs";

test("R118 (the door's map): `projectlist` is project-roster's `projectList` over the stamped viewer and the request's `limit` and `after`, handed review's `sharedDraftsByProject` as `sharedDraftsOf`; the roster calls it with the page's projects and the viewer and its answer is what the roster reads; the arm exists once the plane hands the getter (negative control: without it the roster's own `projectlist` arm is left in place)", () => {
  const listed = [], shared = [];
  const of = {
    projectRoster: () => ({ projectList: (a) => { listed.push(a); return { ok: true, projects: a.sharedDraftsOf({ projectIds: ["P1", "P2"], viewer: a.viewer }) }; } }),
    review: () => ({ sharedDraftsByProject: (a) => { shared.push(a); return { P1: { count: 1, newest: "2026-10-21T00:00:00Z" }, P2: { count: 0, newest: null } }; } }),
  };
  const url = new URL("http://do/projectlist?viewer=member%3Aann&limit=5&after=P0&by=forged");
  const got = controlPlaneOwnerOps(of, url, null).projectlist();
  assert.deepEqual(got.projects, { P1: { count: 1, newest: "2026-10-21T00:00:00Z" }, P2: { count: 0, newest: null } });
  assert.deepEqual([listed[0].viewer, listed[0].limit, listed[0].after], ["member:ann", "5", "P0"]);
  assert.deepEqual(Object.keys(listed[0]).sort(), ["after", "limit", "sharedDraftsOf", "viewer"], "nothing else of the request crosses");
  assert.deepEqual(shared, [{ projectIds: ["P1", "P2"], viewer: "member:ann" }], "review is asked once, for the page's projects, as the viewer");
  assert.equal("projectlist" in controlPlaneOwnerOps({ review: of.review }, url, null), false);
});

/* ---- part two: the real plane ---- */
const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-r118-0123456789abcdef", PASSWORD = "the founder's long password";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r118-0123456789abcdef", PROBE_TOKEN: "prb-r118-0123456789abcdef",
              VERSION: "4.6.0", INSTANCE_NAME: "r118-town" },
});
after(() => mf.dispose());
const ORIGIN = "https://group.example";
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
const sha = (s) => createHash("sha256").update(s).digest("hex");
const file = (path, t) => ({ path, text: t, bytes: Buffer.byteLength(t), sha256: sha(t) });
let keys = 0;

test("R118 (through the door, the real plane): `op=projectlist` answers each project's `shared_drafts`: a project with a draft shared for review answers `count: 1` with the instant it was shared, a project with none answers `{count: 0, newest: null}`, and a grant revoked is no longer counted", async () => {
  const claimed = await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  await claimed.arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  const auth = { authorization: `Bearer ${signed.result.token}`, "content-type": "application/json" };
  const asFounder = async (url, body) => (await plane(url, { method: body === undefined ? "GET" : "POST", headers: auth,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json();
  const project = async (title) => {
    const at = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const md = ["---", "object_type: project", "schema: project@1", `title: ${JSON.stringify(title)}`, `objective: ${JSON.stringify(title)}`, "current_state: forming",
      "prior_state: null", `created: "${at}"`, `last_updated: "${at}"`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", "", "## Session Log", ""].join("\n");
    const r = await asFounder("/api/?op=promote", { base: null, snapKey: `${at.replace(/[-:]/g, "")}_r118${String(++keys).padStart(3, "0")}`,
      meta: { object_type: "project", title, current_state: "forming", prior_state: null, created: at, last_updated: at },
      files: [file("bundle.md", md)], register: [] });
    assert.equal(r.ok && r.result?.ok, true, JSON.stringify(r).slice(0, 400));
    return r.result.bundleId;
  };
  const shared = await project("Street lights, shared");
  const quiet = await project("Street lights, quiet");
  const rowsOf = async () => Object.fromEntries(((await asFounder("/api/?op=projectlist")).result.projects || []).map((p) => [p.id, p.shared_drafts]));
  assert.deepEqual(await rowsOf(), { [shared]: { count: 0, newest: null }, [quiet]: { count: 0, newest: null } }, "before any draft is shared");
  const draft = await asFounder("/api/?op=casedraft", { project: shared, scope: "the lights" });
  assert.equal(draft.result?.ok, true, JSON.stringify(draft).slice(0, 400));
  assert.deepEqual(await rowsOf(), { [shared]: { count: 0, newest: null }, [quiet]: { count: 0, newest: null } }, "a draft not shared is not counted");
  const granted = await asFounder("/api/?op=reviewgrant", { draft: draft.result.draftId ?? draft.result.draft_id ?? draft.result.draft, recipient: "A neighbour" });
  assert.equal(granted.result?.ok, true, JSON.stringify(granted).slice(0, 400));
  const rows = await rowsOf();
  assert.equal(rows[shared].count, 1, JSON.stringify(rows));
  assert.match(rows[shared].newest, /^\d{4}-\d\d-\d\dT/, "the instant it was shared");
  assert.deepEqual(rows[quiet], { count: 0, newest: null }, "a project with none");
  const revoked = await asFounder("/api/?op=reviewrevoke", { grant: granted.result.grantId ?? granted.result.grant_id ?? granted.result.grant });
  assert.equal(revoked.result?.ok, true, JSON.stringify(revoked).slice(0, 400));
  assert.deepEqual((await rowsOf())[shared], { count: 0, newest: null }, "a grant revoked is not counted");
});

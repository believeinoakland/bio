/* monitoring R70 (K2524; investigation R18): a watched project's sources. Driven at monitoring's interface over the
   real investigation module (K874), reached as production reaches it (`investigationOf` on the same host, the one per
   storage), with intent R7 the fixture's stand-in in its Provides' shape and investigation's own reads of steps and
   questions standing in at their interfaces, so a test states exactly when the project's work is quiet. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, serve, DAEMON, V, NOW } from "/home/user/bio/bio-plane/test/m/monitoring/fixture.mjs";
import { investigationOf } from "/home/user/bio/bio-plane/src/investigation/index.mjs";
import { normalizeAddress } from "/home/user/bio/bio-plane/src/subresources.mjs";
import { word } from "/home/user/bio/bio-plane/src/setup-words/index.mjs";

const LA = "https://records.example.org/agenda.txt";
const LB = "https://records.example.org/budget.txt";
const LC = "https://records.example.org/contract.txt";
const tick = (w, id) => w.m.monitor({ bundleId: id, viewer: DAEMON, actorClass: "machine", actor: DAEMON });
const receipt = (w, addr, cap) => w.prov.recordReceipt({ address: addr, addressNorm: normalizeAddress(addr), captureSha: cap,
  retrieved: NOW, via: "direct", retrievalLocator: addr, context: { authorityKind: "sweep", authority: "x", actorClass: "plane", actor: null, observe: false } });

/* A project document the record holds, owned by Carol, so its close is a revision through promotion. */
function project(w, title) {
  const md = ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming", "prior_state: null",
    `created: "${NOW}"`, `last_updated: "${NOW}"`, "group: test-group", "objective: Know whether the award was proper",
    "references: []", "state_history: []", "---", "", "## Objective", "", "Know whether the award was proper.", "", "## Session Log", ""].join("\n");
  const made = w.promotion.promote({ base: null, snapKey: `k-${title.replace(/\W/g, "")}`, author: V("carol"), meta: { object_type: "project" },
                                     files: [{ path: "bundle.md", text: md }] });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 400));
  w.st.sql.exec(`INSERT OR REPLACE INTO project_sight (project_id, setting) VALUES (?, 'discoverable')`, made.bundleId);
  w.inProject(made.bundleId, { owner: "carol" });
  return made.bundleId;
}

/* The world: the real investigation, its steps (one ended step per project, more as a test adds them), no questions,
   and intent's progress and gaps (its R5, R6 shapes) for the project's reads and a close. */
function watchWorld() {
  const w = world();
  for (const m of ["carol"])
    w.st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, handle, role, status, created, updated) VALUES (?, 'c', ?, 'member', 'active', '2026-01-01', '2026-01-01')`, m, `${m}-h`);
  w.stepsOf = new Map();
  const steps = {
    stepsIn: ({ project }) => ({ ok: true, steps: w.stepsOf.get(project) ?? [{ step: `STEP-${project}`, state: "ended", at: "2026-09-01T00:00:00Z" }], truncated: false }),
    stepsOn: () => ({ ok: true, steps: [], truncated: false }),
  };
  w.intent.gaps = ({ project }) => ({ ok: true, project, gaps: [] });
  w.intent.progress = ({ project }) => ({ ok: true, project, objective: "Know whether the award was proper", condition: null,
    computable: false, why: word("intent.objective_states_condition") });
  w.inv = investigationOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, intent: w.intent, steps,
    basisVersions: { projectQuestions: () => ({ items: [], cursor: null }), conclusionRecordOf: () => ({ history: [], stance: null }) },
    inquiry: { questionWaits: () => ({ ok: true, waits: [] }), documentWaits: () => ({ ok: true, questions: [] }) },
    captureRequests: { captureRequests: () => ({ requests: [] }) },
    view: () => ({ time_zone: { value: "America/Los_Angeles" } }), now: () => new Date(w.clock.ms).toISOString() });
  w.arrivals = () => w.rows(`SELECT project_id, source, arrived_at FROM inv_watch_arrivals ORDER BY seq`);
  return w;
}


import { multipart, mpFiles } from "./mp.mjs";
import { infoMd } from "/home/user/bio/bio-plane/test/m/monitoring/fixture.mjs";
test("monitoring 1392 whole", async () => {
  for (const label of ["a", "b"]) {
    const w = watchWorld();
    const P1 = project(w, "Watched" + label);
    const m = multipart(label, { extra: { locator: LA } }); m.doc.locator = LA;
    const id = "INFO-2026-0111-v2";
    const md = infoMd(id, LA, { freq: "daily", enabled: true });
    const { files, register } = mpFiles(m, { md });
    const r = w.promote(id, md, { reg: [m.doc], files: files.slice(2), register });
    receipt(w, LA, m.whole);
    console.log(label, "promote", r.ok, JSON.stringify(w.rows(`SELECT whole, substr(capture_sha,1,6) s FROM register WHERE bundle_id=?`, id)));
    w.intent.watch[P1] = [m.whole];
    console.log(label, "projectWatch", w.inv.projectWatch({ project: P1, by: V("carol") }).ok, "watched", JSON.stringify(w.inv.watchedProjects().projects.map((p) => p.project === P1)));
    w.net.routes[LA] = serve("the document is now a different, tiny thing");
    const t = await tick(w, id);
    console.log(label, "tick", t.body.status, "arrivals", JSON.stringify(t.body.arrivals), "reason", t.body.reason ?? "");
    console.log(label, "inv_watch_arrivals", JSON.stringify(w.arrivals()));
    /* control: a project whose watch names the PART only (no whole): R73/R72 mine includes the register rows of the bundle, so it too is reported */
    const P2 = project(w, "PartWatcher" + label); w.intent.watch[P2] = [m.held[0].sha256];
    w.inv.projectWatch({ project: P2, by: V("carol") });
    w.clock.ms += 1000; w.net.routes[LA] = serve("changed again once more");
    const t2 = await tick(w, id);
    console.log(label, "tick2 arrivals", JSON.stringify(t2.body.arrivals?.reported?.map((x) => x.project === P1 ? "P1(whole)" : x.project === P2 ? "P2(part)" : "?")));
  }
});

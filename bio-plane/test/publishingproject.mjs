/* CASE-2 / DEC-72 — THE PUBLISHING PROJECT, AS A SHARED TEST FIXTURE.
 *
 * WHY THIS MODULE EXISTS, since a shared fixture is a thing to justify rather
 * than reach for. DEC-72 makes publication a PRODUCTION OF A PROJECT: `op=publish`
 * now takes a project and refuses without one, and the act is fenced to a project
 * OWNER. **Eight existing suites drive `op=publish` and none of them had a
 * project**, because until this ruling a case needed none. Giving each of them
 * its own copy of a project bundle template and its own ownership dance would put
 * eight implementations of one fixture into the estate — which is the shape this
 * repository keeps paying for (D-267's four inline severance reads are the
 * standing example), and it would guarantee that the day the project schema moves,
 * seven of them rot quietly.
 *
 * WHAT IT DOES NOT DO, deliberately. It does not wrap `op=publish`, and no suite
 * calls it to publish. It builds a project and returns its id; the ACT stays in
 * each suite, spelled out, driven through the control plane, so what a suite
 * asserts about publication is still visible in the suite that asserts it.
 *
 * `caseproduction.test.mjs` — CASE-2's own suite — deliberately does NOT use this
 * helper and builds its roster inline through `projectinvite` / `projectjoin` /
 * `projectowneradd`. That is not duplication: the ownership CEREMONY is part of
 * what that suite tests, and a fixture that short-circuits the fence would be
 * asserting DEC-72's fence against a state the plane's own rules cannot produce.
 *
 * OWNERSHIP IS TAKEN THROUGH `projectclaimowner`, WHICH REQUIRES THE PROJECT TO
 * HAVE NO OWNER YET — so the bundle is promoted with the MACHINE credential,
 * which by design leaves no owner row ("a project created by a machine credential
 * has no owner row, which is honest rather than inventing one", Membership
 * Architecture v2 7.1). The member then claims it. The alternative — granting
 * `create_projects` to each suite's publishing member — would have edited eight
 * enrolments, several of which are themselves under assertion.
 */

/** The minimal project bundle the gate accepts. Kept in ONE place so a change to
 *  the project schema moves one template and not eight. */
export const projectFixtureMd = (id, { created, updated, bar = null, objective =
  "Decide whether to refer this to the auditor." } = {}) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Project ${id}"`, "current_state: investigating", "prior_state: null",
  `created: "${created}"`, `last_updated: "${updated}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", `objective: "${objective}"`,
  ...(bar ? ["required_strength:", `  capture: ${bar.capture}`, `  connection: ${bar.connection}`,
             `  author: ${bar.author}`, `  at: "${bar.at}"`] : []),
  "---", "", "## Thesis Summary", "", "A project.", "",
  "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

/** Promote a project with the MACHINE credential and hand ownership to `owner`.
 *  Returns the project id. THROWS with the plane's own answer on any failure,
 *  because a fixture that fails quietly produces a suite whose assertions are all
 *  measuring the wrong thing.
 *
 *  `post`  — (query, body) => parsed JSON, the suite's own control-plane POST
 *  `mf`    — the suite's Miniflare, for the Durable Object's ownership surface
 *  `sha`   — the suite's own hex digest function
 *
 *  NO BAR IS DECLARED BY DEFAULT. An undeclared project is an ABSENT bar (DEC-72:
 *  the group default is not a fallback publication bar), so a suite that adopts
 *  this fixture keeps publishing exactly the cases it published before — the
 *  fixture adds a publisher, never a gate. A suite that WANTS the bar to bite
 *  passes one.
 */
export async function makePublishingProject({ post, mf, sha, machineToken, owner,
                                              id, created, updated, bar = null } = {}) {
  const r = await post(`op=promote&token=${machineToken}`, {
    bundleId: id, base: null,
    snapKey: `${String(created).replace(/[-:]/g, "").slice(0, 15)}Z_${sha(id).slice(0, 8)}`,
    meta: { object_type: "project", group: "believe-in-oakland", title: `Project ${id}`,
            current_state: "investigating", created, last_updated: updated },
    files: [{ path: "bundle.md", text: projectFixtureMd(id, { created, updated, bar }),
              bytes: projectFixtureMd(id, { created, updated, bar }).length,
              sha256: sha(projectFixtureMd(id, { created, updated, bar })) }],
    register: [],
  });
  const promoted = (r && typeof r === "object" && "result" in r) ? r.result : r;
  if (promoted?.ok === false) throw new Error(`fixture: promote ${id}: ${JSON.stringify(promoted)}`);
  const stub = await mf.getDurableObjectNamespace("STORE");
  const obj = stub.get(stub.idFromName("bio"));
  const c = await (await obj.fetch("http://x/projectclaimowner",
    { method: "POST", body: JSON.stringify({ projectId: id, memberId: owner }) })).json();
  const claimed = (c && typeof c === "object" && "result" in c) ? c.result : c;
  if (claimed?.ok !== true) throw new Error(`fixture: projectclaimowner ${id} -> ${owner}: ${JSON.stringify(claimed)}`);
  return id;
}

/** The all-load-bearing partition for a member set, which is the designation that
 *  keeps an EXISTING suite's assertions measuring what they were written to
 *  measure: every case in the estate before DEC-72 was material the case rested
 *  on, and defaulting to `supporting` would quietly turn each of them into a case
 *  that asserts nothing. A suite testing the partition itself writes it out. */
export const allLoadBearing = (body) => {
  const set = Array.isArray(body?.targets) ? body.targets
            : typeof body?.targets === "string" && body.targets.trim() ? body.targets.split(",")
            : body?.target ? [body.target] : [];
  return Object.fromEntries(set.map((s) => [String(s).trim(), "load_bearing"]));
};

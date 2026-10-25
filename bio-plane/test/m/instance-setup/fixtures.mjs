/* instance-setup's published fixtures (K4990, K4993, K4995, K5044): each answer is made by this module's real code when a
   test runs, never stored, so a user's test takes the answer the module gives and not one it wrote by hand. Each is
   checked by `fixtures.test.mjs`, which calls it and compares the real answer. */
import { boot, io, providers, read } from "./fixture.mjs";
import { world as aiAccountsWorld } from "../ai-accounts/fixture.mjs";
import { bootstrapReport, selftest } from "../../../src/setup.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { CREDENTIALS_SCHEMA } from "../../../src/credentials/schema.mjs";

const REASON = "We hold tenants' medical letters; none of it may leave our own Civicsmith.";

/** `assistantState`: the real `assistantstate` answer `{ok, on, set_by, set_at, reason}` over the real ai-accounts, not kept away (`notKept`, `on: true`
 *  with the three null) and kept away (`kept`, `on: false` with the setting's who, when and reason). */
export async function assistantState() {
  const c = aiAccountsWorld();
  await c.claim();
  const w = await boot({ more: { membership: c.m, aiAccounts: c.a } });
  const notKept = w.m.assistantState();
  const set = c.c.aiKeepAwaySet({ on: true, reason: REASON, by: "admin" });
  if (set.ok !== true) throw new Error(`assistantState: ai-accounts refused the keep-away: ${JSON.stringify(set)}`);
  return { notKept, kept: w.m.assistantState() };
}

/** `instanceGroupAnswer`: the real public `instancegroup` answer: `recorded` `{ok: true, group}` for a store that recorded its group at first boot, `none`
 *  `{ok: true, group: null, detail: NO_GROUP_RECORDED}` for one that recorded none. */
export async function instanceGroupAnswer({ group = "river-town" } = {}) {
  const recorded = (await boot({ env: { INSTANCE_NAME: group } })).m.instanceGroupPublic();
  const none = (await boot({ env: {} })).m.instanceGroupPublic();
  return { recorded, none };
}

/** `selftestAnswer`: the real `selftest` body of a copy whose store binding is not bound: `{ok: false, bindings: {STORE: false, ...}, ...}`, answered at status
 *  500. `status` is the status the Worker answers it at. */
export async function selftestAnswer({ tokens = { ADMIN_TOKEN: "a-live-admin-token-0123456789", PROBE_TOKEN: "a-live-probe-token-0123456789" } } = {}) {
  const res = await selftest(tokens, "bio", { cls: "admin", viewer: "class:admin" }, io);
  const { status, body } = await read(res);
  return { status, ...body };
}

const member = (name, version, status = 200, extra = {}) => ({ fetch: async () => new Response(JSON.stringify({ name, version, ...extra }), { status }) });
const storeSays = (state) => ({ async fetch() { return Response.json({ ok: true, result: state }); } });
const STORE = { claimed: true, rearmed: false, consumedAt: null, storeVersion: "store-7" };
const SERVING = {
  AGENT_WORKER: member("agent-worker", "a-1", 200, { runner: true }), PDF_WORKER: member("pdf-worker", "p-1"), OCR_WORKER: member("ocr-worker", "o-1"),
  SHEET_WORKER: member("sheet-worker", "s-1"), FILE_SCANNER: member("file-scanner", "f-1"),
};

/** `fleetReports`: the real `bootstrapReport` body (status and body, the door's `members=1` ask) for each lag case installer R66 reads: `serving` (every
 *  member answers its own name and version), `silent` (a member answers 500, one answers nothing), `misnamed` (a binding answers another member's name),
 *  `unbound` (a member's binding is absent), `storeVersionAbsent` (the store's answer carries no `storeVersion`), and `withoutMembers` (the door asked without
 *  `members=1`, so the answer carries no `memberVersions`). */
export async function fleetReports() {
  const ask = async (env, state = STORE, members = true) => {
    const { status, body } = await read(await bootstrapReport({ VERSION: "plane-3", ...env }, "fp-1", { members, stub: storeSays(state), ...io }));
    return { status, ...body };
  };
  const { storeVersion: _absent, ...noVersion } = STORE;
  const { OCR_WORKER: _unbound, ...withoutOcr } = SERVING;
  return {
    serving: await ask(SERVING),
    silent: await ask({ ...SERVING, PDF_WORKER: member("pdf-worker", "p-1", 500), OCR_WORKER: { fetch: async () => { throw new Error("connection refused"); } } }),
    misnamed: await ask({ ...SERVING, PDF_WORKER: member("ocr-worker", "o-1") }),
    unbound: await ask(withoutOcr),
    storeVersionAbsent: await ask(SERVING, noVersion),
    withoutMembers: await ask(SERVING, STORE, false),
  };
}

const applySchema = (st, schema) => {
  const bare = schema.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
};
const addProject = (st, id) => st.db.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, current_state, created, last_updated, bundle_sha)
  VALUES ('${id}', 'project', 'river-town', 'active', '2026-10-01T00:00:00Z', '2026-10-01T00:00:00Z', 'sha-${id}')`);

/** `bootstrapFacts`: the real `bootstrapfacts` answer (R95), the seven facts a credentialed caller is told, of an instance set up by real acts: its team named
 *  by the admin (`groupNameSet`), the running release first seen at boot (`installed_at`), three held sessions (the newest is `last_used_at`), and the counts
 *  the caller states: `members` active, `projects` bundles, `documents` on the register, `published` cases. The other modules' counts are stand-ins, as in
 *  the module's own `copy` (t51). Each count is a real read of the module, so a test takes the answer the module gives for the counts it asks for. */
export async function bootstrapFacts({ team = "River Town", members = 3, projects = 2, documents = 5, published = 1 } = {}) {
  const prov = providers();
  prov.membership.memberList = () => ({ members: Array.from({ length: members }, (_, i) => ({ member_id: `m-${i}`, status: "active" })) });
  prov.provenance = { counts: () => ({ register: documents }) };
  prov.publicRead.publishedList = () => ({ published: [], cases: Array.from({ length: published }, (_, i) => ({ case_id: `CASE-${i}`, edition: 1 })) });
  /* `credentials` is the real module over this store (R80's `lastActivity`), made once the store exists. */
  const creds = { ctx: null, lastActivity: () => credentialsOf(creds.ctx).lastActivity() };
  const w = await boot({ env: { INSTANCE_NAME: "river-town", VERSION: "1.4.0" }, prov, now: () => Date.parse("2026-10-10T08:00:00Z"),
                         more: { provenance: prov.provenance, credentials: creds } });
  creds.ctx = w.ctx;
  applySchema(w.st, CREDENTIALS_SCHEMA);
  for (const [sha, last] of [["a", "2026-10-12T09:30:00Z"], ["b", "2026-10-14T17:45:00Z"], ["c", "2026-10-13T01:00:00Z"]]) {
    w.st.db.exec(`INSERT INTO sessions (token_sha, role, expires, created, device, last_active) VALUES ('${sha}', 'admin', 9e15, 'x', 'own', ${Date.parse(last)})`);
  }
  for (let i = 0; i < projects; i += 1) addProject(w.st, `PROJ-${i}`);
  w.m.groupNameSet({ name: team, by: "admin" });
  return w.m.bootstrapFacts();
}

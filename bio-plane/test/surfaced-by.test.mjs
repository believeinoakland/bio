/* REC-3 / D-78: surfaced_by is the ACTOR CLASS, stamped by the SERVER, never
 * the caller's assertion — so an assistant can honestly surface a focus.
 *
 * RULED by Bob: an assistant may open a focus unattended, because that support
 * is central to what BIO offers and a focus is informative and advisory. C-2.8
 * already accepts `agent` or `human`; the doctrine was allowed for at the check
 * level long before any surface could express it. But both bundle writers
 * (setup.mjs and civicos-ui's ported copy) emit the literal `human` for every
 * focus, so an assistant-surfaced focus was indistinguishable from a member's —
 * a false attribution in a system whose whole point is that claims carry their
 * author.
 *
 * The fix stamps surfaced_by at the TRUST BOUNDARY (index.mjs, in the op=promote
 * body handling), exactly where author, owner, by and viewer are already
 * server-stamped by deleting the caller's value and setting it from the
 * credential. A creation by a machine credential (an assistant, viaSession
 * false) records `agent`; a creation by a member's session records `human`. The
 * store keeps byte-trusting bundle.md — which is why the stamp is NOT in the
 * store: 40+ suites (e.g. projection.test) depend on the store projecting the
 * document's own surfaced_by verbatim, and the honest decision belongs where the
 * actor class is known. Stamping here fixes BOTH writers (and any future one) at
 * once. It is a CREATION-time act; a revision carries the document's value
 * forward, so the origin fact is not rewritten by a later editor.
 *
 * NEGATIVE CONTROL: neuter the D-78 stamp in index.mjs (change `want` to always
 * "human", or delete the surfaced_by block) -> the agent-written focus records
 * the writer's hardcoded literal `human`, and the "an agent records agent"
 * assertion fails (the pre-fix behaviour). RUN 2026-07-31: stamp forced to
 * "human" -> the agent assertion fails (surfaced_by=human, 1 fail); restored ->
 * green.
 */
/* NEGATIVE CONTROL: neuter the D-78 stamp in index.mjs op=promote (force `want` to always "human", or delete the surfaced_by block) -> the agent-written focus records the writer's hardcoded literal `human` and the "an agent records agent" (+ "did NOT survive") assertions FAIL. RUN 2026-07-31 record-agent-3: want forced to "human" -> 2 fail; restored -> 8 pass. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "t-admin-1", MEMBER_TOKEN: "t-member-1", PROBE_TOKEN: "t-probe-1", VERSION: "test" },
});
const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body) })).json();

/* A focus bundle.md exactly as the writers produce it: the literal `surfaced_by:
   human`, hardcoded, whoever is writing. The server decides the honest value. */
const focusMd = (id, now) => [
  "---", "id: " + id, "object_type: focus", "schema: focus@1",
  'title: "Is the franchise fee still lawful"', "current_state: surfaced", "prior_state: null",
  "created: " + now, "last_updated: " + now,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
  "surfaced_by: human", "recheck_triggers:", "  - text: Revisit this",
  "    description: replace with a real trigger.", "---", "",
  "## Statement", "", "a question worth asking", "", "## Why It Matters", "",
  "## Open Questions", "", "## Session Log", "", "## Review Notes", ""
].join("\n");

const promoteFocus = (id, tokenQ, now) => POST(`op=promote&${tokenQ}`, {
  bundleId: id, base: null, snapKey: id + "_new",
  meta: { object_type: "focus", group: "believe-in-oakland",
          title: "Is the franchise fee still lawful", current_state: "surfaced",
          created: now, last_updated: now },
  files: [{ path: "bundle.md", text: focusMd(id, now), bytes: focusMd(id, now).length, sha256: sha(focusMd(id, now)) }],
  register: [] });

const readSurfacedBy = async (id, tokenQ) => {
  const r = await GET(`op=file&id=${id}&path=bundle.md&${tokenQ}`);
  const text = r.result?.text ?? "";
  const m = text.match(/^surfaced_by:\s*(\S+)\s*$/m);
  return m ? m[1] : null;
};

const now = "2026-07-31T00:00:00Z";

console.log("\n--- a member's session surfaces a focus: honestly human ---");
/* Bring a member session into being: the admin token adds the founding member,
   who enrolls and logs in. The first member of a group must be an administrator
   (ADMINS_FIRST); an admin session is still viaSession, which is what makes it a
   human writer rather than a machine. */
const add = await POST("op=memberadd&token=t-admin-1", { memberId: "iris", cover: "the analyst", role: "admin" });
t("admin creates a member", add.result.ok, true);
const en = await POST("op=enroll", { invite: add.result.invite, handle: "iris", password: "iris-passphrase-1" });
t("enrollment succeeds", en.result.ok, true);
const lg = await POST("op=login", { role: "member:iris", password: "iris-passphrase-1" });
t("member logs in", lg.result.ok, true);
const S = "token=" + lg.result.token;

const humanId = "FOCUS-2026-0001-human";
const hp = await promoteFocus(humanId, S, now);
t("the session creates the focus", hp.result.ok, true);
t("a focus a member surfaced records surfaced_by: human", await readSurfacedBy(humanId, S), "human");

console.log("\n--- an assistant (a machine credential) surfaces a focus: honestly agent ---");
/* No session: a raw token is a machine credential, viaSession false. It writes
   the SAME bundle.md, carrying the writer's hardcoded `surfaced_by: human`. The
   server overwrites it from the actor class. */
const agentId = "FOCUS-2026-0002-agent";
const ap = await promoteFocus(agentId, "token=t-member-1", now);
t("the machine credential creates the focus", ap.result.ok, true);
t("a focus an agent surfaced records surfaced_by: agent", await readSurfacedBy(agentId, "token=t-member-1"), "agent");
/* The caller's literal was `human`; the record does NOT carry it. Not
   caller-asserted. */
t("the caller's hardcoded 'human' did NOT survive (server-stamped, not caller-asserted)",
  await readSurfacedBy(agentId, "token=t-member-1") === "human", false);

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

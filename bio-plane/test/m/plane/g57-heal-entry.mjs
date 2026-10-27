/* plane (T51 fix round 6, G57; K4720, K4724, K4727), the platform shape of `g57-heal.test.mjs`: `G54Plane` (the plane's REAL `Store` with its scheduler and the `casefile-sweep` consumer, a real
   alarm handler, real DO SQLite and R2) plus the routes a member's earlier acts leave behind and nothing more: `/g57/seed` (the owner, her case edition and a finding the ratify gate admits, through the
   modules' own commits of `g54-seed.mjs`; the signer key a test made registered as the owner's; and a signed-in session for her, so the test reaches `op=ratify` through the Worker's real door with a bearer
   token). The finding is NOT completed here: the member's `op=ratify` completes it. The bucket faults and the alarm handler are `G54Plane`'s (`/g54p/bucket`, `/g54p/alarm`). */
import { G54Plane } from "./g54-l-entry.mjs";
import { seedEdition } from "./g54-seed.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { sha256HexSync } from "../../../src/record-grammar/index.mjs";
export { default } from "./g54-l-entry.mjs";

const TITLE = "Was the transfer authorised";
/* a finding the ratify gate admits (ratification's own `cleanInqMd`) */
const cleanInqMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${TITLE} ${id}?"`,
  "current_state: open", "prior_state: null", `created: "2026-07-01T00:00:00Z"`, `last_updated: "2026-07-01T00:00:00Z"`,
  "produced_by:", "  mode: human", "  capability_tier: none", "group: test-group", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending: false", "visuals: []", "surfaced_by: human",
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "", "## Question", "", `${TITLE} ${id}?`, "", word("conformance.rests"), "", "## Conclusion", "",
  word("conformance.falsify"), "", "## Session Log", "", "## Review Notes", ""].join("\n");
const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });

export class G57Plane extends G54Plane {
  async fetch(req) {
    const url = new URL(req.url), p = url.pathname, q = (k) => url.searchParams.get(k);
    if (!p.startsWith("/g57/")) return super.fetch(req);
    try {
      const ctx = this.ctx, sql = ctx.storage.sql;
      if (p === "/g57/seed") {
        const s = await seedEdition(ctx, q("case"), 1, { env: this.env, findingMd: cleanInqMd, findingSuffix: "-m1" });
        sql.exec(`UPDATE members SET capabilities='["contribute","publish"]' WHERE member_id='olive'`);   /* the capability op=ratify needs */
        const k = credentialsOf(ctx).signerRegisterOwn({ keyB64: q("key"), comment: "g57", by: "olive" });
        if (!k.ok) throw new Error("signer " + JSON.stringify(k));
        const token = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join(""), now = Date.now();
        sql.exec("INSERT INTO sessions (token_sha, role, expires, created, device, last_active, reauth_until) VALUES (?,?,?,?,?,?,?)", sha256HexSync(token), "member:olive", now + 3_600_000, new Date(now).toISOString(), "shared", now, now + 3_000_000);   /* signing asks the password again (R66): its window is open, as `op=reauth` leaves it */
        return json({ ...s, token });
      }
      return json({ error: "unknown g57 step" }, 404);
    } catch (e) { return json({ error: String((e && e.stack) || e).slice(0, 1500) }, 500); }
  }
}

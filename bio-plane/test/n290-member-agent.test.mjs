/* N290 (K334; inquiry R44): op=promote stamps memberUserAgent from a member session's own User-Agent on a creation only; every caller's body copy is deleted. Written by LEGACY-INDEX #7 (T10), committed by legacy-tests. */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DatabaseSync } from "node:sqlite";
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const DIR = mkdtempSync(join(tmpdir(), "n290-"));
const ADM = "adm-n290", MEM = "mem-n290";
const mf = new Miniflare({ modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, durableObjectsPersist: DIR,
  r2Buckets: ["CAPTURES", "PUBLISHED"], bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" } });
let pass = 0, fail = 0;
const t = (l, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${ok ? "" : ` want ${JSON.stringify(want)} got ${JSON.stringify(got)}`}`); ok ? pass++ : fail++; };
const sha = (v) => createHash("sha256").update(v).digest("hex");
const POST = async (q, body, ua) => { const h = ua === undefined ? {} : { "User-Agent": ua };
  const r = await (await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", headers: h, body: JSON.stringify(body ?? {}) })).json();
  return r && typeof r === "object" && "result" in r ? r.result : r; };
const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `c ${id}`, role, capabilities: caps });
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  return "token=" + lg.token; };
await member("ruth", ["contribute"], "admin"); await member("gus", ["contribute"], "admin");
const ALICE = await member("alice", ["contribute"]);
const NOW = "2026-09-19T00:00:00Z";
const md = (id, extra = []) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Question ${id}"`,
  "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${NOW}"`, "group: believe-in-oakland",
  "references: []", "state_history: []", "surfaced_by: human", 'disposition_reason: ""', ...extra, "---", "", "## Question", "", "Did it?", ""].join("\n");
let seq = 0;
const bundle = (id, base = null, extra) => { const m = md(id, extra); return { bundleId: id, base,
  snapKey: `20260919T1200${String(++seq).padStart(2, "0")}Z_aaaa1111`,
  meta: { object_type: "inquiry", group: "believe-in-oakland", current_state: "open", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: m, bytes: m.length, sha256: sha(m) }], register: [] }; };
const rows = [];
const promote = async (who, id, ua, over = {}, base = null) => { const r = await POST(`op=promote&${who}`, { ...bundle(id, base), ...over }, ua); rows.push([id, r?.ok, r?.reason]); return r; };
const UA = "  Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0  ";
const A = "INQ-2026-9290-a", B = "INQ-2026-9290-b", C = "INQ-2026-9290-c", D = "INQ-2026-9290-d", E2 = "INQ-2026-9290-e", F = "INQ-2026-9290-f";
await promote(ALICE, A, UA, { memberUserAgent: "Forged/1.0" });          // session: header wins over body, trimmed
const open = async (tok, run) => POST(`op=airunopen&${tok}`, { run, contextType: "inquiry", contextId: A, label: "sweep", mode: "check",
  principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude", skillVersion: "investigative-session@1",
  bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }, { bound: "surfaces", allowed: 5, unit: "questions" }], leaseMs: 600000 });
const o1 = await open(`token=${MEM}`, "RUN-2026-0919-1"), o2 = await open(`token=${ADM}`, "RUN-2026-0919-2");
console.log(JSON.stringify([o1?.started, o1?.reason, o2?.started, o2?.reason]));
await promote(`token=${MEM}`, B, UA, { memberUserAgent: "Forged/1.0", run: "RUN-2026-0919-1" });  // deploy token: none, body deleted
await promote(`token=${ADM}`, C, UA, { memberUserAgent: "Forged/1.0", run: "RUN-2026-0919-2" });  // admin token: none
await promote(ALICE, D, "y".repeat(600));                                 // at most 512
const a1 = await POST(`op=bundle&${ALICE}&bundleId=${A}`);
const head = a1?.head || a1?.bundle?.head || a1?.snapKey || null;
await promote(ALICE, F, "   ");                                           // blank header: none
console.log(JSON.stringify(rows));
await mf.dispose();
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p); } }; walk(DIR);
const db = files.filter((f) => f.endsWith(".sqlite")).map((f) => new DatabaseSync(f)).find((d) => { try { d.prepare("SELECT 1 FROM inquiry_member_agents").all(); return true; } catch { return false; } });
const got = Object.fromEntries(db.prepare("SELECT bundle_id, user_agent FROM inquiry_member_agents").all().map((r) => [r.bundle_id, r.user_agent]));
t("N290 a member session's creation carries its own User-Agent, trimmed; the body's is deleted", got[A], UA.trim());
t("N290 a member deploy token's creation carries none (the body's deleted)", got[B], undefined);
t("N290 an admin deploy token's creation carries none", got[C], undefined);
t("N290 at most 512 characters", got[D], "y".repeat(512));
t("N290 a blank header: none", got[F], undefined);
t("every promotion landed", rows.every((r) => r[1] === true), true);
console.log(`\n${pass} pass, ${fail} fail`); process.exit(fail ? 1 : 0);

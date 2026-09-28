# legacy-index (T10)

**Status** · session_013Fr8m2QkVBUm76bvxapWas · depth 2 · COMPLETE · handled B2

**Job** · LEGACY-INDEX #7, session `session_013Fr8m2QkVBUm76bvxapWas`, branch `job/T10/legacy-index`, the legacy-index bullet of layer 11 (`build/plan/current.md`). A legacy module: no requirements file and no `tests` path. Its contract is the bullet, BOB's START (B1), N290 and N265's text in `next.md`, and inquiry R44 (the stamp's reader).

## Completion

### Entries applied

1. **N290 (K334).** `op=promote` (`index.mjs`, the promote block, after the `migrationReplay` stamp): `delete b.memberUserAgent` for every caller, then, only when `viaSession && b.base === null` (a creation through a member's session), `b.memberUserAgent` = that request's own `User-Agent` header, trimmed, cut to 512 characters (and trimmed again at the cut), set only when non-empty. A deploy token, an `ai` key and a verified migration replay (admin, no session) carry none. Inquiry R44 records it at the creation (`inquiry_member_agents`). Reading: "at most 512 characters" cuts a longer header rather than dropping it; inquiry's `agentOf` would drop one over 512, so the cut is what lets a real long agent be recorded.
2. **N265, my share.** The `op=acquire` block already hands the reading to extraction (`acquireReadingOp`, extraction R1, `op=extractread` in the Durable Object) and runs none of its own; only the comment was stale. It now says so, and "until `extraction` takes the block (K49)" is gone. No code change was needed.

### Tests (no `tests` path: none committed)

Tested at the op in a scratch suite (Miniflare, `op=promote` through a member session, a member deploy token and an admin deploy token, each sending a forged `memberUserAgent` in the body, then the store's `inquiry_member_agents` read from the persisted SQLite):
- a member session's creation records its own `User-Agent`, trimmed; the body's forged value is gone;
- a member deploy token's creation and an admin deploy token's creation (each inside an open run with a `surfaces` bound) record none;
- a 600-character header records 512 characters; a blank header records none; every promotion landed.
- `6 pass, 0 fail`; negative control (the same suite on the tree without the change): 4 arms fail.

**Proposed for legacy-tests** (it owns `bio-plane/test/`): the scratch suite, if BOB wants N290 pinned in the battery. It is at this session's scratchpad (`zz-n290-scratch.test.mjs`); it can be handed over on request.

Suites run on the changed tree: `acquire` 97 pass, 0 fail; `admission-gate` 57/0; `airun-principal` 27/0; `risk-tier` 90/0; `capturerequests` 138/2 (the same two source-scan reds on the tree without the change: not mine, legacy-tests'); `node --test test/m/inquiry/ test/m/extraction/ test/m/promotion/` 202 pass, 0 fail.

### Checks

- `format: 69 modules, 64 requirements files; 0 failures`
- `architecture: 29 product files, 53 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 0 modules, 0 of 0 live requirement ids named by a test; 0 failures`
- `ownership: 1 files changed by legacy-index between tranche/T10 and HEAD; 0 failures`

### Deferred

Nothing.

### Found in other modules

1. **capture-requests (R14, its private note at line 112).** `#memberAgent` reads only the inquiry document's `member_user_agent` frontmatter. With N290 the member's agent is now recorded by inquiry (R44, `memberUserAgent(id)`), and R14's `member-browser` form never sees it: it still refuses C-28.7 for every inquiry created through the plane. R14 and its Uses line ("inquiry: … its recorded `member_user_agent`") should read inquiry's R44 instead; that is a requirements change for BOB.
2. **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` is stale from `index.mjs` (both edits). Not rebuilt (§14); BOB regenerates at the layer close.

Size (session_013Fr8m2QkVBUm76bvxapWas): test runs 11, module lines 7,041

## J1 · COMPLETE

LEGACY-INDEX #7 complete at 836f85e9b2 (record's Completion). N290: op=promote deletes memberUserAgent for every caller and stamps it only on a creation through a member's session, from that request's User-Agent, trimmed, at most 512 (cut, not dropped); tested at the op in a scratch suite, 6/0, control 4 arms red (no tests path, none committed; offered to legacy-tests). N265: the acquire op already hands the read to extraction (acquireReadingOp); the stale K49 comment corrected, no code change. Checks: format, architecture, coverage, ownership 0 failures. Found: (1) capture-requests R14's #memberAgent reads only the document's member_user_agent, so inquiry R44's recorded stamp never reaches the member-browser form (a requirements change for BOB); (2) bio-plane bundle stale from index.mjs, for the layer close.

### N290 suite (for legacy-tests)

To sit at `bio-plane/test/n290-member-agent.test.mjs`. Run from `bio-plane/`: `node test/n290-member-agent.test.mjs` (exit 0 on `6 pass, 0 fail`; re-run at that path on this branch, 6 pass, 0 fail). It persists the Durable Object to a temp directory and reads `inquiry_member_agents` with `node:sqlite` (Node 22.5+).

```js
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
```

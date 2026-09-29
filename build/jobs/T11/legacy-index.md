# legacy-index (T11)

**Status** · session_017wnYAQFtWif7k7G5n1MVfL · depth 2 · WORKING · handled B2

**Job** · LEGACY-INDEX #8, session `session_017wnYAQFtWif7k7G5n1MVfL`, branch `job/T11/legacy-index`, the legacy-index bullet of layer 11 (`build/plan/current.md`). A legacy module: it has no requirements file and no `tests` path. Its contract is the bullet, BOB's START (B1) and ANSWER (B2, K376), the N-entries' text in `next.md`, and the Provides of the modules it serves (actions R42, affordances R26, monitoring R30).

## Completion

### Entries applied
1. **N231 (its share).** `op=actionkinds` in OPS beside `actionquotes`: every signed-in class (admin, member, probe), `mutating: false`, no viewer stamp and no NEEDS row, since it names no bundle. It forwards to actions' Durable Object route (`kinds()`, actions R42). `op=affordances` (no target and target) and `op=queue` now publish `vocabulariesFor(kinds)` (affordances R26). `kinds` is asked of the store's `actionkinds` route at each call. A store silence answers `storeSilent`, never the product's kinds in its place (REC-52). The fixed `VOCABULARIES` import is gone from this file.
2. **K372 (MONITORING #3), N278 and N247 (their shares).** `doAnswer` is handed into `monitorOp`'s argument object, as it is for `knockOp`. Per K376, nothing was added to the Worker for D-240 (b) and (c): LEGACY-TESTS' planted specimen carries them, and both pass.
   New Worker ops for monitoring R30:
   - `monitorpause` reaches the root of trust only (K376): `classes: ["admin"]`, `SESSION_OPS.admin` alone, NEEDS `null`, the same cut as `governorconfig`. An enrolled administrator's session is told SESSION_ROLE_CANNOT_REACH_OP. `actor` is the server's stamp (the session's member, or `class:<cls>`) and overwrites the caller's copy.
   - `monitorslate` is a read on `monitoring`'s cut and takes the viewer stamp.
3. **N272, as far as it stands without N245.** `dec49Row` reads the catalogue first, then every module file that exports `*_CHECKS` families (33 files, as namespaces, in path order), so a family a module adds to an existing file is found by the suffix. A refusal whose row moved to a module and whose site mints it bare now reaches the wire with `code`, `check` and `translation`. Measured on `op=selection`: `NO_SUCH_SELECTION` (C-33.20, retrieval's `SELECTION_CHECKS` alone) reached the wire bare before this change and translated after it.

### Deferred
- **N272, the rest (K351).** The list of module files (`MODULE_CHECK_FILES`) is hand-kept. A module that opens a new file of families needs a line there until N245's composed catalogue replaces the list. N245 is not in T11.
- **monitoring R30 for enrolled administrators:** N314 (T12), per K376.

### Tests (no `tests` path, so none committed)
Tested at the op in a scratch Miniflare suite (`li8-scratch.test.mjs`, below): **39 pass, 0 fail** on the changed tree, and 39/0 again after merging `tranche/T11`. Negative control on the tree without the change: **15 pass, 24 fail**. Every N231, K372 and N272 arm fails there, and the arms that should hold on either tree (queue, NO_SUCH_BUNDLE, op=monitor, BAD_DIRECTION) pass.

Old-battery suites, before and after the change:

| suite | before | after |
| --- | --- | --- |
| capability | 63/0 | 63/0 |
| d311-roster-affordances | 22/0 | 22/0 |
| queue | 36/0 | 36/0 |
| queue-state | 66/0 | 66/0 |
| queue-conditions | 51/0 | 51/0 |
| aicredential | 97/0 | 97/0 |
| archive-monitoring | 22/0 | 22/0 |
| monitor-address | 33/0 | 33/0 |
| monitor-assess | 91/0 | 91/0 |
| monitor-rendered | 28/0 | 28/0 |
| monitor-substance | 35/0 | 35/0 |
| daemon-token | 54/2 | 54/2 |
| refusal-wire | 41/1 | 41/1 |
| machinefences-dec49 | 88/1 | 88/1 |
| monitor-cadence | 64/3 | 64/3 |
| d334-monitor-credential | 33/8 | 33/8 |
| plane-envelope | 63/1 | 63/1 |
| gate-reads | 165/0 | 164/1 |
| affordances | 100/0 | 99/1 |
| rung-ladder | 47/3 | 45/5, then 47/3 after the merge |

The reds present on both trees are not mine. The three suites whose count moved are totality guards naming the new ops (J2): gate-reads needs legacy-tests to classify `actionkinds` and `monitorslate`; affordances needs a NON_ACTS entry for `monitorpause` (affordances, re-opened by K377); rung-ladder was already back to its baseline after the merge. The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) prints the same 34 failures before and after, apart from a line number.

### Checks (on 956a3ec3d1)
- `format: 69 modules, 64 requirements files; 0 failures`
- `architecture: 29 product files, 86 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 0 modules, 0 of 0 live requirement ids named by a test; 0 failures`
- `ownership: 2 files changed by legacy-index between tranche/T11 and HEAD; 0 failures`

### Found in other modules (J2, and below)
1. **affordances:** a `monitorpause` NON_ACTS entry and RUNG_ABSENT ground (K377 re-opened it). R26's `not yet met` can be struck.
2. **legacy-tests:** gate-reads' classification of `actionkinds` (ungated) and `monitorslate` (gated). Also the scratch suite below, if BOB wants these entries pinned in the battery.
3. **monitoring:** `openEnvelope` is dead now that `doAnswer` is handed in, and it keeps plane-envelope's chokepoint arm red (N313, T12).
4. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale from `index.mjs`. It was not rebuilt (§14); BOB regenerates it at the layer close.

Size (session_017wnYAQFtWif7k7G5n1MVfL): test runs 58, module lines 7,124

### The scratch suite (for legacy-tests)

Run from a directory holding a `node_modules` link to `bio-plane/node_modules`: `node li8-scratch.test.mjs`. It uses absolute paths into this checkout; rewrite them to `../src/…` if it is committed under `bio-plane/test/`.

```js
/* LEGACY-INDEX #8 (T11) scratch suite: N231 (op=actionkinds; op=affordances and op=queue publish vocabulariesFor(kinds)),
   K372 (op=monitorpause, op=monitorslate; doAnswer handed into monitorOp) and N272 (dec49Row reads every module's rows),
   each driven at the op through a Miniflare plane. Run from this directory: node li8-scratch.test.mjs */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DatabaseSync } from "node:sqlite";
import { PRODUCT_KINDS, actionKinds } from "/home/user/bio/bio-plane/src/actions/checks.mjs";
import { combine } from "/home/user/bio/jurisdictions/index.mjs";
import { VOCABULARIES } from "/home/user/bio/bio-plane/src/affordances.mjs";
import { SLATE_FRAMING_OPEN } from "/home/user/bio/bio-plane/src/monitoring/index.mjs";

const IDX = "/home/user/bio/bio-plane/src/index.mjs";
const DIR = mkdtempSync(join(tmpdir(), "li8-"));
const ADM = "adm-li8", MEM = "mem-li8", PRB = "prb-li8", DMN = "dmn-li8";
const plane = () => new Miniflare({ modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, durableObjectsPersist: DIR,
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, DAEMON_TOKEN: DMN, VERSION: "test" } });
let mf = plane();
let pass = 0, fail = 0;
const t = (l, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${ok ? "" : `\n        want ${JSON.stringify(want)}\n        got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++; };
const call = async (method, q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, method === "POST"
    ? { method, body: JSON.stringify(body ?? {}) } : { method });
  return { status: res.status, body: await res.json() };
};
const GET = (q) => call("GET", q);
const POST = (q, b) => call("POST", q, b);
const R = (r) => (r.body && "result" in r.body ? r.body.result : r.body);

/* The founder, two enrolled administrators, and an ordinary member. */
const claim = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-1" });
const founder = "token=" + R(await POST("op=login", { role: "admin", password: "founder-passphrase-1" })).token;
const member = async (id, caps, role = "member") => {
  const add = R(await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `c ${id}`, role, capabilities: caps }));
  await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  return "token=" + R(await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` })).token;
};
const ruth = await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const alice = await member("alice", ["contribute"]);
t("setup: the claim landed and the four sessions exist", [claim.status, [founder, ruth, alice].every((s) => s.length > 20)], [200, true]);

console.log("\n--- N231: op=actionkinds (actions R42) ---");
for (const [who, q] of [["ADMIN_TOKEN", `token=${ADM}`], ["MEMBER_TOKEN", `token=${MEM}`], ["PROBE_TOKEN", `token=${PRB}&store=scratch`],
                        ["a member session", alice], ["the founder's session", founder]]) {
  const r = await GET(`op=actionkinds&${q}`);
  t(`${who} reads the kinds; with no profile active they are the product's kinds alone`, [r.status, R(r)?.ok, R(r)?.kinds],
    [200, true, [...PRODUCT_KINDS]]);
}
{
  const r = await GET(`op=actionkinds&token=${DMN}`);
  t("the daemon class does not reach it (every signed-in class; the daemon is the unattended path)", [r.status, r.body.reason],
    [403, "CLASS_FORBIDDEN"]);
  const n = await GET("op=actionkinds");
  t("no credential: refused unauthenticated", [n.status, n.body.reason], [401, "NOT_AUTHENTICATED"]);
}

console.log("\n--- N231: op=affordances and op=queue publish vocabulariesFor(kinds) (affordances R26) ---");
{
  const a = R(await GET(`op=affordances&${alice}`));
  const { action_kind, ...rest } = a.vocabularies;
  const { action_kind: _fixed, ...fixedRest } = VOCABULARIES;
  t("no target: action_kind is actions' answer (product kinds, no profile)", action_kind, [...PRODUCT_KINDS]);
  t("no target: every other vocabulary key is the published one, unchanged", JSON.stringify(rest), JSON.stringify(fixedRest));
  const q = R(await GET(`op=queue&${alice}`));
  t("op=queue: the same action_kind", q?.vocabularies?.action_kind, [...PRODUCT_KINDS]);
  const miss = await GET(`op=affordances&${alice}&target=INQ-2026-9999`);
  t("with a target the store does not hold: NO_SUCH_BUNDLE at 404, unchanged", [miss.status, miss.body.reason], [404, "NO_SUCH_BUNDLE"]);
}

console.log("\n--- K372: op=monitorslate (monitoring R30) ---");
{
  const s = await GET(`op=monitorslate&${alice}`);
  t("a member session reads the slate: quoted data inside the fixed framing, paused stated", [s.status, R(s)?.ok,
    typeof R(s)?.prompt === "string" && R(s).prompt.startsWith(SLATE_FRAMING_OPEN), R(s)?.paused], [200, true, true, { paused: false }]);
  const m = await GET(`op=monitorslate&token=${MEM}`);
  t("the MEMBER_TOKEN bearer reads it too (monitoring's cut)", [m.status, R(m)?.ok], [200, true]);
  const d = await GET(`op=monitorslate&token=${DMN}`);
  t("the daemon class does not", [d.status, d.body.reason], [403, "CLASS_FORBIDDEN"]);
}

console.log("\n--- K372: op=monitorpause (monitoring R30), the root of trust's act ---");
{
  const r1 = await POST(`op=monitorpause&token=${ADM}&actor=ruth`, { paused: true });
  t("the ADMIN_TOKEN bearer pauses; `by` is the server's stamp, never the caller's actor=", [r1.status, R(r1)?.ok, R(r1)?.paused, R(r1)?.by],
    [200, true, true, "class:admin"]);
  const m = R(await GET(`op=monitoring&${alice}`));
  t("op=monitoring states the pause", [m?.paused?.paused, m?.paused?.by], [true, "class:admin"]);
  const sl = R(await GET(`op=monitorslate&${alice}`));
  t("and so does the slate", sl?.paused?.paused, true);
  const r2 = await POST(`op=monitorpause&${founder}`, { paused: false });
  t("the founder's session resumes, stamped as the founder", [r2.status, R(r2)?.ok, R(r2)?.paused, R(r2)?.by ?? null], [200, true, false, null]);
  const held = R(await GET(`op=monitoring&${alice}`));
  t("resumed: op=monitoring states it", held?.paused, { paused: false });
  const e = await POST(`op=monitorpause&${ruth}`, { paused: true });
  t("an enrolled administrator's session: SESSION_ROLE_CANNOT_REACH_OP, reserved to the founder's session (J1 Q2's reading)",
    [e.status, e.body.reason, e.body.reachedBy, typeof e.body.translation], [403, "SESSION_ROLE_CANNOT_REACH_OP", "founder", "string"]);
  const a = await POST(`op=monitorpause&${alice}`, { paused: true });
  t("a member session: the same refusal", [a.status, a.body.reason], [403, "SESSION_ROLE_CANNOT_REACH_OP"]);
  for (const [who, tok] of [["MEMBER_TOKEN", MEM], ["PROBE_TOKEN", `${PRB}&store=scratch`], ["DAEMON_TOKEN", DMN]]) {
    const b = await POST(`op=monitorpause&token=${tok}`, { paused: true });
    t(`the ${who} bearer: CLASS_FORBIDDEN`, [b.status, b.body.reason], [403, "CLASS_FORBIDDEN"]);
  }
  const bad = await POST(`op=monitorpause&token=${ADM}`, { paused: "yes" });
  t("no boolean: monitoring's REQUIRED_ARGUMENT_MISSING, carrying its row (C-61.1) on the wire", [bad.body.result?.reason ?? bad.body.reason,
    typeof (bad.body.result?.translation ?? bad.body.translation)], ["REQUIRED_ARGUMENT_MISSING", "string"]);
  const still = R(await GET(`op=monitoring&${alice}`));
  t("and nothing was changed", still?.paused, { paused: false });
}

console.log("\n--- K372: op=monitor through the control plane's doAnswer ---");
{
  const r = await POST(`op=monitor&token=${ADM}`, { bundleId: "INQ-2026-9999" });
  t("an absent bundle answers the store's own refusal, verdict false, never a silence", [r.body.ok, r.body.reason === "STORE_DID_NOT_ANSWER"],
    [false, false]);
  const n = await POST(`op=monitor&token=${ADM}`, {});
  t("no bundleId: the argument complaint", [n.status, n.body.reason], [400, "REQUIRED_ARGUMENT_MISSING"]);
}

console.log("\n--- N272: a refusal whose row lives only in a module's checks reaches the wire translated ---");
{
  /* BAD_DIRECTION's row (C-33.5) is in actions' own ACTION_ACT_CHECKS (src/actions/checks.mjs), not in the catalogue,
     and `actionCorrespond` mints it bare ({ok:false, reason, legal, direction, detail}): only dec49Row can put the row on
     the wire. A member session, so the machine fence passes; any target, since the direction is judged first. */
  const { ACTION_ACT_CHECKS } = await import("/home/user/bio/bio-plane/src/actions/checks.mjs");
  const C = await import("/home/user/bio/bio-plane/checks/bio-checks.mjs");
  const inCatalogue = Object.entries(C).some(([f, rows]) => /_CHECKS$/.test(f) && rows && typeof rows === "object" && "BAD_DIRECTION" in rows);
  t("precondition: BAD_DIRECTION's row is actions' and not the catalogue's", [inCatalogue, ACTION_ACT_CHECKS.BAD_DIRECTION?.check], [false, "C-33.5"]);
  const r = await POST(`op=actioncorrespond&${alice}&target=ACT-2026-0001&direction=sideways&at=2026-09-01`, {});
  const x = r.body.result ?? r.body;
  t("op=actioncorrespond with a bad direction reaches the wire with actions' row: code, check C-33.5 and its translation",
    [x.ok, x.reason, x.code, x.check, x.translation], [false, "BAD_DIRECTION", "BAD_DIRECTION", "C-33.5", ACTION_ACT_CHECKS.BAD_DIRECTION.translation]);
  /* THE ARM THAT DISCRIMINATES. actions wraps its refusals in `withRow`, so BAD_DIRECTION above holds on either tree (a
     no-regression arm). retrieval's `selectionResolve` mints NO_SUCH_SELECTION bare, and its row (C-33.20) is in
     retrieval's own SELECTION_CHECKS alone: only dec49Row, reading the module files, can translate it. */
  const { SELECTION_CHECKS } = await import("/home/user/bio/bio-plane/src/retrieval/checks.mjs");
  const selInCat = Object.entries(C).some(([f, rows]) => /_CHECKS$/.test(f) && rows && typeof rows === "object" && "NO_SUCH_SELECTION" in rows);
  t("precondition: NO_SUCH_SELECTION's row is retrieval's and not the catalogue's", [selInCat, SELECTION_CHECKS.NO_SUCH_SELECTION?.check],
    [false, "C-33.20"]);
  const sel = await GET(`op=selection&${alice}&handle=no-such-handle`);
  const z = sel.body.result ?? sel.body;
  t("op=selection with an unknown handle reaches the wire with retrieval's row (N272)", [z.ok, z.reason, z.code, z.check, z.translation],
    [false, "NO_SUCH_SELECTION", "NO_SUCH_SELECTION", "C-33.20", SELECTION_CHECKS.NO_SUCH_SELECTION.translation]);
  const s = await POST(`op=actioncorrespond&${alice}&target=ACT-2026-0001&direction=sent&at=2026-9-1`, {});
  const y = s.body.result ?? s.body;
  t("and BAD_DATE (C-33.6), the next arm, likewise", [y.reason, y.check], ["BAD_DATE", ACTION_ACT_CHECKS.BAD_DATE?.check ?? "C-33.6"]);
}

console.log("\n--- N231: with a profile active, action_kind is the product's kinds and then the profile's ---");
await mf.dispose();
{
  const files = [];
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
  walk(DIR);
  const dbs = files.filter((f) => f.endsWith(".sqlite"));
  let set = 0;
  for (const f of dbs) {
    const db = new DatabaseSync(f);
    const has = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").get();
    if (has) { db.prepare("INSERT INTO settings (name, value, set_by, set_at) VALUES (?, ?, ?, ?)")
                 .run("jurisdiction_profiles", JSON.stringify(["test-port-ellery"]), "admin", "2026-09-29T00:00:00Z"); set++; }
    db.close();
  }
  t("the profile setting was written into the persisted store", set > 0, true);
}
mf = plane();
{
  const want = actionKinds(combine(["test-port-ellery"]).view);
  const k = R(await GET(`op=actionkinds&${alice.replace(/token=.*/, "")}token=${MEM}`));
  t("op=actionkinds answers the combined view's kinds after the product's", k?.kinds, want);
  t("which is more than the product's alone (the profile adds kinds)", want.length > PRODUCT_KINDS.length, true);
  const a = R(await GET(`op=affordances&token=${MEM}`));
  t("op=affordances publishes the same action_kind", a?.vocabularies?.action_kind, want);
  const q = R(await GET(`op=queue&token=${MEM}`));
  t("op=queue publishes the same action_kind", q?.vocabularies?.action_kind, want);
}
await mf.dispose();
console.log(`\nli8-scratch: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
```

## J1 · QUESTION

Two readings. I am building both as stated below while the question is open.

Q1 (N247, legacy-index's share). "With op=monitor in the durable object, the Worker holds the computed-verdict success site (D-240 (b), (c))." My reading: nothing is added to the Worker for (b) and (c). LEGACY-TESTS re-anchored both arms in T9 on a planted specimen (plane-envelope.test.mjs ~L480, `PLANT_COMPUTED`), and they pass today. Writing a computed-verdict site into index.mjs only so a detector has a specimen would pin a shape and not meet a requirement. My share is therefore the envelope half: hand `doAnswer` into `monitorOp` (K372). The one plane-envelope arm still red is "`doAnswer` is the only thing ... that reads `ok` off a Durable Object envelope" (63/1 today). It stays red until monitoring drops its `openEnvelope` fallback (monitoring/index.mjs ~2126), which is monitoring's file; I am reporting it separately.

Q2 (monitoring R30, `monitorpause`, "an administrator"). legacy-index has no requirements file. Two things limit what I can build: the Worker has no administrator refusal code of its own, and NOT_AN_ADMIN is membership's (C-96.1, one code one site, K231/K275). My reading: `monitorpause` is reached by the root of trust only. That is the ADMIN_TOKEN bearer (`classes: ["admin"]`) and the founder's session (`SESSION_OPS.admin` alone), the same cut as `governorconfig`. An enrolled administrator's session is refused with the existing SESSION_ROLE_CANNOT_REACH_OP ("reserved to the founder's session"), and no new code is minted. `by` is the control plane's `actor` stamp (the session's member, or `class:admin`). The wider reading, every enrolled administrator, needs one of two things: a membership service that refuses a non-administrator by its own code, or a new row. Both belong to other modules, and I would defer that half through you. `monitorslate` is a read on `monitoring`'s cut (admin, member, probe) and takes the viewer stamp.

## J2 · REPORT

New ops on the control plane (branch job/T11/legacy-index, not yet complete). Three totality guards now name them, and each needs a line in another module:

1. **affordances (R3, R12; running in layer 11).** `monitorpause` is a new MUTATING op with a NEEDS row (`null`: the root of trust's act, `governorconfig`'s reason). It needs a `NON_ACTS` entry, so `unpublished` stays empty (`affordances.test`: "every op in NEEDS is a published act or a named NON_ACT", got ["monitorpause"]). It also needs a `RUNG_ABSENT` ground, so `unranked` stays empty (`rung-ladder.test` FORWARD and the exact-count arm: want 169, got 168). My suggestion: NON_ACTS "a machine-directed setting over the instance's own fetching, not an act on an object"; RUNG_ABSENT ground `substrate` (or `observational`), whichever affordances judges true. The two new reads, `actionkinds` and `monitorslate`, have no NEEDS row and are not mutating, so they need nothing from affordances.
   Also affordances R26: `op=affordances` (target and no target) and `op=queue` now publish `vocabulariesFor(kinds)`, `kinds` being actions' `kinds()` asked through the store's `actionkinds` route at each call. R26's `not yet met` mark can be struck once BOB confirms (the file is BOB's).
2. **legacy-tests.** `gate-reads.test` "EVERY read op is classified" names `actionkinds` and `monitorslate`. `actionkinds` names no bundle and takes no viewer stamp (ungated, reason: "answers the instance's kinds and names no bundle"). `monitorslate` is viewer-stamped (gated, `monitoring`'s class).
3. **monitoring.** With `doAnswer` handed into `monitorOp` (K372), the fallback `openEnvelope` in `src/monitoring/index.mjs` (~2126) is dead code. It is also what keeps plane-envelope's "`doAnswer` is the only thing in index.mjs that reads `ok` off a Durable Object envelope" red: the Worker corpus counts two `out.ok === true` (63/1, the same before and after my change). Removing it, and making `doAnswer` a required argument, is monitoring's.

Baseline reds I did not cause are unchanged: daemon-token 54/2, rung-ladder's determine, actionmove and escalationresume arms, refusal-wire 41/1 (the pinned forward set gained `r.body`, monitorOp's spread), machinefences-dec49 88/1, monitor-cadence 64/3 and d334 33/8.

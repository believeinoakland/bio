/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/project-mint.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/project-mint.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once), the real sources are hashed before and after, and what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RUN 2026-09-18 in worktree agent-a12cdccbace704eb6 on base 3dee1fdb + REC-141 (real src/index.mjs 660,878 B sha256 98368d9756c0…, src/store.mjs 2,636,157 B sha256 9c6222a402cc…, untouched: YES), every arm AS DECLARED: (a) baseline 40/0 · (b) accept-supplied-id — THE ROW'S CONTROL 1, the refusal removed and the caller's id used -> 32/8, §1's refusal and byte-identity arms (the hidden id answers EXISTS, the free one is CREATED) · (c) hash-before-id — THE ROW'S CONTROL 2, the caller's pre-id sha registered -> 37/3, the returned-sha arm, the not-the-caller's-sha arm and the fork's sha arm · (d) fork-ignores-newid — a named newId silently ignored -> 37/3, the three fork refusal arms · (e) id-anywhere, an over-strict fence -> 38/2, the two over-strictness arms · (f) id-key-other-spelling, correct work in another spelling -> 40/0. RECORDED, NOT SMOOTHED: the FIRST run had (b) and (d) NOT AS DECLARED — (b)'s other-type byte-identity arm stayed green because the armed plane's own §1 creation had made the never-minted id EXIST, so both probes answered EXISTS; (d) failed four committing-fork arms because the armed plane's probe fork took the name the committing fork used. Both were the INSTRUMENT: the other-type probe now uses a second never-minted id and the fork probes a name of their own; re-run, every arm AS DECLARED.
   RE-RUN 2026-09-18 after merging origin/main (8e39602a) and adding the C-59.3 and C-59.4 check assertions (coverage's CHECKS column named both as never asserted), real src/index.mjs 663,811 B sha256 3f4f83fdb5d6…, src/store.mjs 2,642,473 B sha256 e41e7bf843e9… (re-run again after the helper rename, identical figures), untouched: YES — every arm AS DECLARED: baseline 41/0 · accept-supplied-id 33/8 · hash-before-id 38/3 · fork-ignores-newid 37/4 · id-anywhere 39/2 · id-key-other-spelling 41/0. RECORDED: fork-ignores-newid first came back NOT AS DECLARED (37/4) because its declaration lacked the new C-59.3 check arm, which it rightly fails; the declaration was corrected and the arm re-run.
 * =========================================================================
 * REC-141 / D-428 (creation half) / IC-158 — THE PLANE MINTS PROJECT IDS. Membership Architecture v2
 * §7, the bullet *"HOW the plane mints a project id"* (BOB #15, 2026-09-18), with §7.9 (*"not its
 * existence, not its name"*):
 *
 *   a caller-supplied id on a NEW project is REFUSED — never silently ignored — with one byte-identical
 *   answer whether or not that id exists; a fork's `newId` is minted the same way; and the plane WRITES
 *   the minted id into the document's `id:` frontmatter before it hashes and registers the bytes,
 *   refusing bytes that already carry one, and returns the id and the final sha.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`3dee1fdb` + the claim), raw: vera (never invited)
 * CREATING a project at iris's hidden project's id answered `EXISTS`, and at a never-minted id CREATED
 * it — the creation half of D-428's existence oracle (`project-sight.test.mjs` §6 pinned it as KNOWN).
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (a) refuse EVERY creation. Both refusals are then byte-identical and nothing hidden leaks. §2
 *       requires a creation with no id to COMMIT, and reads it back: the `id:` in the registered bytes
 *       is the id returned, and the sha of those bytes is the sha returned and the one `op=list` holds.
 *   (b) keep the caller's own sha — hash BEFORE writing `id:`. §2's sha arms read the stored bytes.
 *   (c) accept a supplied id when it is FREE and refuse it only when taken. §1 compares a taken id's
 *       answer with an untaken one's, byte for byte.
 *   (d) refuse any document whose TEXT contains `id:` anywhere. §3 requires a body line and a nested
 *       key reading `id:` to pass: the rule is the frontmatter's own top-level key.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { BUNDLE_ID_RE, parseFrontmatter } from "../checks/bio-checks.mjs";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.PROJECT_MINT_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec141", MEM = "mem-rec141";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* THE RAW ANSWER: status, content type and the body's exact bytes — nothing parsed away. */
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const rawOf = (r) => ({ status: r.status, type: r.type, sha: sha(r.body) });
const E = encodeURIComponent;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-141" }));
const enrol = async (memberId, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-141` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-141` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const CAPS = ["contribute", "publish", "create_projects"];
/* The founder counts as the first administrator, so the second must be one too (ADMINS_FIRST). */
await enrol("ruth", CAPS, "admin");
const IRIS = await enrol("iris", CAPS);   /* owns the HIDDEN project */
const VERA = await enrol("vera", CAPS);   /* NEVER invited to it: the caller who cannot see it */

/* A project document WITHOUT an `id:` line — the shape a creation now sends. `extra` lands in the
   frontmatter, `body` below the fence. */
const projectMd = (title, { id = null, extra = [], body = "A project." } = {}) => ["---",
  ...(id === null ? [] : [`id: ${id}`]), "object_type: project", `title: "${title}"`, "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []", ...extra,
  "---", "", "## Summary", "", body, "", "## Session Log", ""].join("\n");
let seq = 0;
const createBody = (title, md, bundleId, type = "project") => ({
  ...(bundleId === undefined ? {} : { bundleId }), base: null,
  snapKey: `20260701T0000${String(++seq).padStart(2, "0")}Z_rec141`,
  meta: { object_type: type, group: "believe-in-oakland", title,
          current_state: type === "project" ? "forming" : "collected", created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
const create = (tok, title, { md = projectMd(title), bundleId, type } = {}) =>
  RAW(`op=promote&token=${tok}`, createBody(title, md, bundleId, type));
const listed = async (id) => (parse(await RAW(`op=list&token=${ADM}&limit=1000`)) || {})
  .bundles?.find((b) => b.bundle_id === id) ?? null;
const fileOf = async (tok, id) => {
  const r = parse(await RAW(`op=file&token=${tok}&id=${E(id)}&path=bundle.md`));
  return r && typeof r.text === "string" ? r.text : (typeof r === "string" ? r : r?.content ?? null);
};

/* ============================================ 2 FIRST (the fixture IS the no-id creation) */
console.log("\n--- 2. a creation with NO id COMMITS: the plane mints it, writes it, hashes after, returns both ---");
const made = parse(await create(IRIS, "Sewer Fund Transfers"));
t("iris's creation with no id is ACCEPTED (the liar refusing every creation fails here)", made?.ok, true);
const H = made?.bundleId;
t("the plane returns the id it minted, in the canonical PROJ shape (allocId's pattern and a slug)",
  [typeof H === "string" && BUNDLE_ID_RE.test(H), /^PROJ-\d{4}-\d{4}-sewer-fund-transfers$/.test(String(H))], [true, true]);
const stored = await fileOf(IRIS, H);
t("the registered bytes are readable back", typeof stored, "string");
const fm = stored ? parseFrontmatter(stored).data : null;
t("the `id:` IN THE REGISTERED BYTES is the id returned", fm?.id, H);
t("the `id:` is written ONCE (a single top-level key, first after the fence)",
  [String(stored).split("\n").filter((l) => l.startsWith("id:")).length, String(stored).split("\n")[1]], [1, `id: ${H}`]);
t("THE SHA RETURNED IS THE SHA OF THE REGISTERED BYTES (hashed AFTER the id was written)", made?.bundleSha, stored ? sha(stored) : null);
t("and it is not the caller's own pre-id sha", made?.bundleSha === sha(projectMd("Sewer Fund Transfers")), false);
t("the record's head (op=list's bundle_sha) is that same sha", (await listed(H))?.bundle_sha, made?.bundleSha);
t("the registered file row's own sha256 is that same sha",
  parse(await RAW(`op=file&token=${IRIS}&id=${E(H)}&path=bundle.md`))?.sha256, made?.bundleSha);
t("the creator owns the project it minted", made?.owner, "iris");
const again = parse(await create(IRIS, "Zoning Watch"));
t("a second creation mints a DIFFERENT id", [again?.ok, typeof again?.bundleId === "string" && again.bundleId !== H], [true, true]);
t("a revision of a minted project takes the returned sha as its base (the id now in the bytes)",
  parse(await RAW(`op=promote&token=${IRIS}`, { ...createBody("Sewer Fund Transfers", projectMd("Sewer Fund Transfers", { id: H, body: "Revised." }), H),
                                                base: made?.bundleSha }))?.ok, true);
const machine = parse(await create(ADM, "Machine Made"));
t("a machine credential's creation is minted the same way (no owner: there is no member behind it)",
  [machine?.ok, /^PROJ-\d{4}-\d{4}-machine-made$/.test(String(machine?.bundleId)), machine?.owner], [true, true, null]);

/* ======================================================== 1. ONE ANSWER, TAKEN OR NOT */
console.log("\n--- 1. a SUPPLIED id is refused with ONE answer, whether or not that id exists ---");
const NEVER = H.replace(/-\d{4}-sewer/, "-9999-sewer");   /* the same shape and length, never minted */
t("the never-minted id names nothing", await listed(NEVER), null);
const hid = await create(VERA, "Vera's Attempt", { bundleId: H });
const nev = await create(VERA, "Vera's Attempt", { bundleId: NEVER });
t("vera naming the HIDDEN project's id is REFUSED PROJECT_ID_SUPPLIED", codeOf(parse(hid)), "PROJECT_ID_SUPPLIED");
t("vera naming a NEVER-MINTED id is REFUSED PROJECT_ID_SUPPLIED (the liar accepting a free id fails here)",
  codeOf(parse(nev)), "PROJECT_ID_SUPPLIED");
t("BYTE-IDENTICAL: the hidden id and the never-minted id draw the same status, content type and body",
  rawOf(hid), rawOf(nev));
t("the refusal carries the check and a canned translation (DEC-49)",
  [parse(hid)?.check, typeof parse(hid)?.translation === "string" && parse(hid).translation.length > 40], ["C-59.1", true]);
t("the refusal echoes no id", String(hid.body).includes(H), false);
t("nothing was created at the never-minted id", await listed(NEVER), null);
/* The same question at an id in the PROJECT namespace sent with ANOTHER type: before this, a creation
   of an `information` bundle at a hidden project's id answered EXISTS too. */
/* A SECOND never-minted id, so this probe cannot be answered by what §1's probes left behind (measured by the
   `accept-supplied-id` control arm: with NEVER reused, the arm's own §1 creation made both answers EXISTS). */
const NEVER2 = H.replace(/-\d{4}-sewer/, "-9998-sewer");
const hidI = await create(VERA, "Vera's Note", { bundleId: H, type: "information" });
const nevI = await create(VERA, "Vera's Note", { bundleId: NEVER2, type: "information" });
t("a creation of ANOTHER type at a PROJ- id is refused the same way, taken or not",
  [codeOf(parse(hidI)), codeOf(parse(nevI))], ["PROJECT_ID_SUPPLIED", "PROJECT_ID_SUPPLIED"]);
t("BYTE-IDENTICAL for the other type too", rawOf(hidI), rawOf(nevI));
t("the project's owner is refused the same way at its own id (never EXISTS, never silently ignored)",
  codeOf(parse(await create(IRIS, "Iris Again", { bundleId: H }))), "PROJECT_ID_SUPPLIED");

/* ======================================================== 3. BYTES CARRYING AN ID */
console.log("\n--- 3. bytes that already carry `id:` are refused, taken or not; a body line or a nested key is not an id ---");
const bH = await create(VERA, "Vera's Bytes", { md: projectMd("Vera's Bytes", { id: H }) });
const bN = await create(VERA, "Vera's Bytes", { md: projectMd("Vera's Bytes", { id: NEVER }) });
t("bytes carrying the hidden id are REFUSED PROJECT_ID_IN_BYTES", codeOf(parse(bH)), "PROJECT_ID_IN_BYTES");
t("bytes carrying a never-minted id are REFUSED PROJECT_ID_IN_BYTES", codeOf(parse(bN)), "PROJECT_ID_IN_BYTES");
t("BYTE-IDENTICAL: the two", rawOf(bH), rawOf(bN));
t("its check is C-59.2", parse(bH)?.check, "C-59.2");
const over = parse(await create(VERA, "Over Strict",
  { md: projectMd("Over Strict", { extra: ["objective:", "  id: not-a-top-level-key"], body: "id: a line of prose, not frontmatter" }) }));
t("OVER-STRICTNESS: a nested `id:` and a body line reading `id:` are NOT an id — the creation commits", over?.ok, true);
const overText = over?.bundleId ? await fileOf(ADM, over.bundleId) : null;
t("and the minted id is written beside them, the body untouched",
  [parseFrontmatter(String(overText)).data?.id, String(overText).includes("id: a line of prose, not frontmatter")], [over?.bundleId, true]);
const noFence = parse(await create(VERA, "No Fence", { md: "## Summary\n\nno fence\n" }));
t("a document with no frontmatter is refused by name (nowhere to write the id), check C-59.4",
  [codeOf(noFence), noFence?.check], ["PROJECT_DOCUMENT_UNREADABLE", "C-59.4"]);

/* ======================================================== 4. THE FORK */
console.log("\n--- 4. a fork's newId is minted the same way ---");
/* The refused probes use a name of their own, so a plane that wrongly ACCEPTED one cannot take the name the
   committing fork below uses (measured by the `fork-ignores-newid` control arm's first run). */
const fH = await RAW(`op=projectfork&token=${IRIS}&projectId=${E(H)}&newId=${E(machine?.bundleId)}&title=${E("Fork Probe")}`);
const fN = await RAW(`op=projectfork&token=${IRIS}&projectId=${E(H)}&newId=${E(NEVER)}&title=${E("Fork Probe")}`);
t("a fork naming a TAKEN newId is REFUSED PROJECT_FORK_ID_SUPPLIED", codeOf(parse(fH)), "PROJECT_FORK_ID_SUPPLIED");
t("a fork naming a NEVER-MINTED newId is REFUSED PROJECT_FORK_ID_SUPPLIED", codeOf(parse(fN)), "PROJECT_FORK_ID_SUPPLIED");
t("BYTE-IDENTICAL: the two", rawOf(fH), rawOf(fN));
t("the fork refusal's check is C-59.3, with a canned translation",
  [parse(fH)?.check, typeof parse(fH)?.translation === "string" && parse(fH).translation.length > 40], ["C-59.3", true]);
const fork = parse(await RAW(`op=projectfork&token=${IRIS}&projectId=${E(H)}&title=${E("Fork One")}`));
t("a fork with NO newId COMMITS and returns the id it minted",
  [fork?.ok, /^PROJ-\d{4}-\d{4}-fork-one$/.test(String(fork?.newId))], [true, true]);
const forkText = fork?.newId ? await fileOf(IRIS, fork.newId) : null;
t("the fork's registered `id:` is the minted id (the origin's id is not carried)",
  [parseFrontmatter(String(forkText)).data?.id, String(forkText).split("\n").filter((l) => l.startsWith("id:")).length], [fork?.newId, 1]);
t("the fork's returned sha is the sha of its registered bytes", fork?.bundleSha, forkText ? sha(forkText) : null);
t("the fork still records its origin", String(forkText).includes(`target: ${H}`), true);

/* ======================================================== 5. UNCHANGED */
console.log("\n--- 5. unchanged: the capability, the name rule, and every other type's creation ---");
const NOCAP = await enrol("nell", ["contribute"]);
t("a session without create_projects is still refused NOT_CAPABLE, before any id is minted",
  codeOf(parse(await create(NOCAP, "Nell's Project"))), "NOT_CAPABLE");
t("7.1's name rule still holds for a minted creation (NAME_TAKEN, naming nothing)",
  codeOf(parse(await create(VERA, "sewer   FUND transfers"))), "NAME_TAKEN");
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Info"`,
  "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "---", "", "## Summary", "", "A note.", ""].join("\n");
t("an INFO creation still names its own id (only a project's id is minted)",
  parse(await create(VERA, "Info", { md: infoMd("INFO-2026-9141-note"), bundleId: "INFO-2026-9141-note", type: "information" }))?.ok, true);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nproject-mint: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

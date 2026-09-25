/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d707-promote-request-fields.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of the sources and the battery must not discover it. Re-run from `bio-plane/`: `node test/d707-promote-request-fields.control.mjs [arm]`. RESULTS, RUN 2026-09-25 by D-707's worker on land/worker/D-707 over land/worker/D-692 332c594e (real `src/store.mjs` 3,509,664 B sha256 06c14769..., `checks/bio-checks.mjs` 1,016,947 B sha256 f8877f5f..., hashed before and after every arm and UNCHANGED): 8/8 AS DECLARED, exit 0. (a) baseline 81/0 · (b) no-snap-refusal — THE ROW'S CONTROL for manifest.snap_key -> 66/15, every snap-key arm reads the raw NOT NULL stack or LANDS (blank / object), failing BY NAME, plus the order arm and `NO op=promote answer carries a raw error with a stack`; the other three refusals green · (c) no-path-refusal (files.path) -> 58/23, every path arm and the stack arm · (d) no-content-refusal (files.sha256) -> 70/11 · (e) no-bytes-refusal (files.bytes) -> 63/18 · (f) strict-snap-no-number — OVER-STRICT -> 80/1, only `a NUMBER snapKey still lands` · (g) strict-bytes-positive — OVER-STRICT -> 80/1, only the 0-byte blob arm · (h) spelling — OVER-STRICTNESS, `/\S/` and `Number.isSafeInteger` -> 81/0. UNFIXED TREE (the suite pointed at land/worker/D-692 332c594e's own sources): 12 pass / 69 fail. */
/* D-707 — WHAT THE REQUEST MUST NAME: A SNAP KEY, AND FOR EACH FILE A PATH, SOMETHING HELD AND (FOR A BLOB) A SIZE.
 * `docs/architecture/BIO_Case_Making_v0_1.md` §2 (C-2.5; the promote corrections D-578, D-628, D-692); DEC-49
 * (C-86.10 .. C-86.13). C-86.8's shape for the NOT NULL columns a promotion writes from the REQUEST, not the document.
 *
 * THE DEFECT, measured through op=promote on land/worker/D-692 332c594e before this item: a promotion with no `snapKey`
 * answered `{ ok: false, error: "Error: NOT NULL constraint failed: manifest.snap_key ... at act (.../store.mjs:...)" }`
 * (a revision: `history.snap_key`); a file with no `path`, `files.path`; a blob file with no `bytes`, `files.bytes`; a
 * file with neither text nor a blobSha, `files.sha256`; and a `null` entry beside bundle.md met "TypeError: Cannot read
 * properties of null (reading 'path')" — each a raw stack, for a creation and a revision.
 *
 * THE FIX: op=promote asks, before the transaction and in this order, PROMOTE_SNAP_KEY_UNSTATED (a non-blank string or a
 * finite number), PROMOTED_FILE_PATH_UNSTATED (every entry an object with a non-blank string path), PROMOTED_FILE_CONTENT_
 * UNSTATED (inline text, or a blobSha) and PROMOTED_FILE_BYTES_UNSTATED (a blob's size a whole number from 0).
 *
 * STATED, NOT DECIDED (the row's scope): GOVERNING_LAWS_REWRITTEN answers an ACTION revision whose request carries no
 * readable bundle.md front matter — none at all, a blob-held one, one with no `---` block — because the laws fence's
 * `lawsOf` reads such bytes as the value "unreadable" and runs before NO_BUNDLE_MD. §4 PRINTS those answers, REPORT-ONLY:
 * it gates nothing, and asserting a cause nobody has ruled on would write it into the record.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D707_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { PROMOTED_TYPE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", BLOB = "b".repeat(64);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-d707", MEMBER_TOKEN: "mem-d707", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const get = async (qs) => rP(await (await mf.dispatchFetch(`http://x/api/?token=adm-d707&${qs}`)).json());
/* Every op=promote answer this suite receives, so §5 can ask the whole corpus whether any carried a stack. */
const ANSWERS = [];
const promote = async (body) => {
  const a = rP(await (await mf.dispatchFetch(`http://x/api/?op=promote&token=mem-d707`,
    { method: "POST", body: JSON.stringify(body) })).json());
  ANSWERS.push(a);
  return a;
};

/* A conformant action, as D-628's suite builds one. */
const actionMd = (id, plan = "Ask for the transfer ledger.") => [
  "---", `id: ${id}`, "object_type: action", "schema: action@1", 'title: "Records request"',
  "current_state: planned", "prior_state: null", 'created: "2026-07-24T00:00:00Z"', 'last_updated: "2026-07-25T00:00:00Z"',
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
  "action_kind: cpra_request", "risk_tier: undetermined",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", plan, "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", "",
].join(NL);
const META = { group: "believe-in-oakland", object_type: "action" };
const md = (text) => ({ path: "bundle.md", text, sha256: sha(text) });
let seq = 0;
const key = () => `20260725T0700${String(++seq).padStart(2, "0")}Z_d707`;
/* `over` replaces the request's own fields; a key set to `undefined` is dropped by JSON, i.e. absent. */
const body = (id, extra, base = null, over = {}) =>
  ({ bundleId: id, base, snapKey: key(), author: "member-ruth", meta: META, files: [md(actionMd(id)), ...extra], register: [], ...over });
const held = async (id) => {
  const r = await get(`op=projection&id=${encodeURIComponent(id)}`);
  return r && r.bundle_sha ? r.bundle_sha : null;
};
const exists = async (id) => ((await get(`op=list&limit=1000`))?.bundles || []).some((b) => b.bundle_id === id);
/* A raw error from the store is `error: "Error: ... at act (file:///.../store.mjs:NNN:NN)"`. */
const carriesStack = (a) => typeof a?.error === "string" && /\n\s+at |store\.mjs:\d+|constraint failed|TypeError/.test(a.error);
const named = (r, code) => [r?.ok, r?.reason, r?.code, carriesStack(r)];
const CODES = {
  snap: "PROMOTE_SNAP_KEY_UNSTATED", path: "PROMOTED_FILE_PATH_UNSTATED",
  content: "PROMOTED_FILE_CONTENT_UNSTATED", bytes: "PROMOTED_FILE_BYTES_UNSTATED",
};
const CHECKS = { snap: "C-86.10", path: "C-86.11", content: "C-86.12", bytes: "C-86.13" };

/* Each case: which code, the request's change, and the field the answer names (entries or paths). */
const CASES = [
  ["snap", "no snapKey at all", [], { snapKey: undefined }, null],
  ["snap", "a null snapKey", [], { snapKey: null }, null],
  ["snap", "a blank snapKey", [], { snapKey: "   " }, null],
  ["snap", "an object snapKey", [], { snapKey: { at: 1 } }, null],
  ["path", "a file with no path", [{ text: "x" }], {}, ["entries", [1]]],
  ["path", "a file with a blank path", [{ path: " ", text: "x" }], {}, ["entries", [1]]],
  ["path", "a file whose path is a number", [{ path: 7, text: "x" }], {}, ["entries", [1]]],
  ["path", "a null files entry", [null], {}, ["entries", [1]]],
  ["path", "a string files entry", ["notes.txt"], {}, ["entries", [1]]],
  ["content", "a file with neither text nor a blobSha", [{ path: "a.pdf", bytes: 3 }], {}, ["paths", ["a.pdf"]]],
  ["content", "a file whose text is a number", [{ path: "n.txt", text: 7 }], {}, ["paths", ["n.txt"]]],
  ["bytes", "a blob file with no bytes", [{ path: "a.pdf", blobSha: BLOB }], {}, ["paths", ["a.pdf"]]],
  ["bytes", "a blob file with negative bytes", [{ path: "a.pdf", blobSha: BLOB, bytes: -1 }], {}, ["paths", ["a.pdf"]]],
  ["bytes", "a blob file with fractional bytes", [{ path: "a.pdf", blobSha: BLOB, bytes: 1.5 }], {}, ["paths", ["a.pdf"]]],
  ["bytes", "a blob file whose bytes is a string", [{ path: "a.pdf", blobSha: BLOB, bytes: "12" }], {}, ["paths", ["a.pdf"]]],
];

try {

/* ================================================== 1. A CREATION: REFUSED BY NAME, NOTHING HELD */
console.log("\n--- 1. a CREATION whose request leaves one out is refused by its named code, and nothing lands ---");
let n = 0;
for (const [c, label, extra, over, names] of CASES) {
  const id = `ACTN-2026-0707-c${++n}`;
  const r = await promote(body(id, extra, null, over));
  t(`a CREATION with ${label} is REFUSED ${CODES[c]}, not by a raw error`, named(r), [false, CODES[c], CODES[c], false]);
  t(`…(${label}) the answer carries the catalogue's check and canned translation (DEC-49)`,
    [r?.check, typeof r?.translation === "string" && r.translation === PROMOTED_TYPE_CHECKS[CODES[c]]?.translation],
    [CHECKS[c], true]);
  if (names) t(`…(${label}) and names the entry it fails`, r?.[names[0]], names[1]);
  t(`…(${label}) and its detail says nothing was written, and nothing is held`,
    [/Nothing was written\./.test(r?.detail ?? ""), await exists(id)], [true, false]);
}
for (const c of Object.keys(CODES))
  t(`the catalogue row ${CODES[c]} is ${CHECKS[c]}, in the family D-510 opened, at its own region`,
    [PROMOTED_TYPE_CHECKS[CODES[c]]?.check, /^src\/store\.mjs promote > is-promote-/.test(PROMOTED_TYPE_CHECKS[CODES[c]]?.where ?? "")],
    [CHECKS[c], true]);
const multi = await promote(body("ACTN-2026-0707-multi", [{ text: "x" }, null, { path: "ok.txt", text: "y" }]));
t("a request with SEVERAL pathless entries names every one, counting from 0", [multi?.reason, multi?.entries],
  [CODES.path, [1, 2]]);
const order = await promote(body("ACTN-2026-0707-order", [{ path: "a.pdf", blobSha: BLOB }, { text: "x" }], null, { snapKey: undefined }));
t("a request failing all three is answered by the snap key first (the order is fixed)", order?.reason, CODES.snap);

/* ================================================== 2. A REVISION: REFUSED BY NAME, THE HEAD UNMOVED */
console.log("\n--- 2. a REVISION whose request leaves one out is refused by its named code, and the head is unmoved ---");
const R = "ACTN-2026-0707-rev";
const made = await promote(body(R, []));
if (made?.ok !== true) throw new Error(`fixture ${R}: ${JSON.stringify(made).slice(0, 400)}`);
const head = await held(R);
t("FIXTURE: the action is held at the creation's bytes", head, sha(actionMd(R)));
const revise = (extra, over) => promote({ ...body(R, extra, head, over), files: [md(actionMd(R, "Ask again.")), ...extra] });
for (const [c, label, extra, over] of [CASES[0], CASES[4], CASES[7], CASES[9], CASES[11]]) {
  const r = await revise(extra, over);
  t(`a REVISION with ${label} is REFUSED ${CODES[c]}, not by a raw error`, named(r), [false, CODES[c], CODES[c], false]);
  t(`…(${label}) and the head is unmoved`, await held(R), head);
}
const bmd = await promote({ ...body(R, [], head), files: [{ path: "bundle.md", text: 7 }] });
t("a REVISION whose bundle.md text is a NUMBER is refused as holding nothing (it met GOVERNING_LAWS_REWRITTEN before)",
  named(bmd), [false, CODES.content, CODES.content, false]);

/* ================================================== 3. OVER-STRICTNESS */
console.log("\n--- 3. over-strictness: a request that names each thing, in a spelling the fence did not anticipate, lands ---");
const O1 = "ACTN-2026-0707-numkey";
const o1 = await promote(body(O1, [], null, { snapKey: 20260725 }));
t("OVER-STRICTNESS: a NUMBER snapKey still lands (REC-176's `heldAtKey` reads one)", [o1?.ok, await exists(O1)], [true, true]);
const O2 = "ACTN-2026-0707-blob0";
const o2 = await promote(body(O2, [{ path: "empty.pdf", blobSha: BLOB, bytes: 0 }, { path: "data/big.pdf", blobSha: BLOB.toUpperCase(), bytes: 1048577 }]));
t("OVER-STRICTNESS: blobs of 0 bytes and of 1,048,577 bytes, one addressed in upper case, land", [o2?.ok, o2?.reason ?? null], [true, null]);
const O3 = "ACTN-2026-0707-emptytext";
const o3 = await promote(body(O3, [{ path: "notes/empty.txt", text: "" }, { path: "x.txt", text: "y", bytes: "wrong" }]));
t("OVER-STRICTNESS: an inline file of EMPTY text lands, and an inline file's stated bytes is still REC-178's to compute, never judged",
  [o3?.ok, o3?.reason ?? null], [true, null]);
const O4 = "ACTN-2026-0707-both";
const o4 = await promote(body(O4, [{ path: "both.txt", text: "z", blobSha: BLOB }]));
t("OVER-STRICTNESS: an entry carrying BOTH text and a blobSha is inline, and needs no stated bytes", [o4?.ok, o4?.reason ?? null], [true, null]);
const o5 = await promote({ ...body(R, [], head), files: [md(actionMd(R, "Ask a third time."))] });
t("OVER-STRICTNESS: after every refused revision, a well-formed one still lands on the unmoved head", [o5?.ok, await held(R)],
  [true, sha(actionMd(R, "Ask a third time."))]);

/* ================================================== 4. STATED, NOT DECIDED — REPORT-ONLY */
console.log("\n--- 4. REPORT-ONLY (gates nothing): what an ACTION revision with no readable bundle.md front matter is answered ---");
const G = await held(R);
for (const [label, files] of [["no files at all", []], ["no bundle.md, another file", [{ path: "x.txt", text: "x" }]],
                              ["a blob-held bundle.md", [{ path: "bundle.md", blobSha: BLOB, bytes: 5 }]],
                              ["a bundle.md with no front matter", [md("just a body\n")]]]) {
  const r = await promote({ ...body(R, [], G), files });
  console.log(`  REPORT  ${label}: ${JSON.stringify([r?.ok, r?.reason ?? null, carriesStack(r)])}`);
}

/* ================================================== 5. NO ANSWER CARRIES A STACK */
console.log("\n--- 5. no op=promote answer this suite received carries a stack ---");
t("FIXTURE: the corpus of op=promote answers is non-empty (floor 30)", ANSWERS.length >= 30, true);
t("NO op=promote answer carries a raw error with a stack", ANSWERS.filter(carriesStack).map((a) => String(a.error).slice(0, 120)), []);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd707-promote-request-fields: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

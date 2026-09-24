/* REC-161 — D-195's INDEPENDENCE OVER A PROPOSED PARTITION (INVESTIGATIVE-SESSION.md §12 clause (c), BOB #22).
 *
 * WHAT THIS SUITE IS FOR. The elicitation asks a member *"Would refuting this alone change your
 * conclusion?"* about each of a question's reasons and turns the answers into groups BEFORE anything is
 * written. Clause (c) rules that the read-back names every shared upstream origin between those groups,
 * derived by the ONE implementation, `Store#independenceOf`, over the PROPOSED partition. Until REC-161
 * that function had two consumers, both over a STORED version, so nothing could compute it for a
 * partition not yet written. `op=partitionindependence` is the third consumer.
 *
 * THE ACCEPTS-WHEN, one block each: (A) two parts sharing a capture read as sharing an origin;
 * (B) independent parts read clean; (C) a one-part partition reads `checked: false`; (D) the answer
 * EQUALS `op=versionstrength`'s once the partition is written. HOW A LIAR PASSES IT: a second derivation
 * that agrees today — so (E) pins the call count and the absence of a second walk in the method, and the
 * control swaps in a copy differing in ONE branch.
 *
 * WHAT THIS CANNOT SEE: the walk derives from `register` and `captured_locators`; two documents that came
 * from one place without the record holding a locator saying so read CLEAN here, exactly as they do on
 * `op=versionstrength` — absence is D-129's "did not look". The participation arm of the viewer gate
 * cannot bite on an inquiry today (viewerPredicate filters PROJECT bundles), so (F) drives the fail-closed
 * arm through the Durable Object with no stamp, not a member who was not invited.
 *
 * NEGATIVE CONTROL: three arms, RUN 2026-09-23 by WORKER REC-161 with `node test/nc-rec161.mjs` from bio-plane/, each armed ALONE against a patched copy of src/store.mjs (2,911,504 bytes, sha256 b2369af69dcb…), every restore verified by sha256 AND cmp against a uniquely-named per-arm pristine copy, byte count printed and a minimum guarded. (0) BASELINE first and last -> 18 pass, 0 fail both times. (1) SECOND DERIVATION — `partitionIndependence` computes its own origin walk that agrees on bundles and captures and OMITS the ADDRESS branch, instead of calling `#independenceOf` -> 16/2, FAILS ARM D2 (the equality over an address-shared partition) and ARM E1 (the pin), AS DECLARED; A1, B1, C1 and D1 stay green, which is the liar's case: it agrees on everything but one branch. (2) OVER-STRICT — `#independenceOf` reports every pair of groups as sharing -> 13/5, FAILS B1, B2, D1, AS DECLARED, plus D2 and WITNESS, UNDECLARED and explained: the write gate (CHECK 4, the same function) now refuses the suggestions block D writes, so the correct fixture cannot be written — a fence this wide makes correct work unwritable. (3) DROP THE TOTALITY FENCE -> 17/1, FAILS ARM F4 ALONE, AS DECLARED.
 * NEGATIVE CONTROL (REC-192, the VERSION arm, block H): RUN 2026-09-24 by WORKER REC-192 with `node test/nc-rec192.mjs` from bio-plane/, each arm ALONE against src/store.mjs (2,955,366 bytes, sha256 3a6b4cdf8adb…), every restore verified by sha256 AND cmp against a per-arm pristine copy. (0) BASELINE first and last -> 27 pass, 0 fail both times. (1) A STRENGTH FIELD ON THE VERSION-ARM ANSWER (`pair: {capture, connection, testimony}` added to its head) -> 25/2, FAILS ARM H2 (NO STRENGTH KEY) and ARM H3 (the whole answer), AS DECLARED; H0, H1, H4-H8, D1, D2, E1 stay green. (2) OVER-STRICT — versionstrength's default state set borrowed onto the version arm (a reading not `accepted` refused as absent) -> 23/4, FAILS H1, H3, H4, H5, AS DECLARED; H6 (the accepted reading) stays green, which is what tells a borrowed gate from a broken read. REC-161's three arms RE-RUN on this tree after nc-rec161.mjs was RE-ANCHORED (the partition arm moved one block in): all AS DECLARED — second-derivation 24/3 (D2, E1, and now H1: the version arm goes through the same call), overstrict 15/12 (B1, B2, D1 declared; D2, WITNESS and H0-H6 because CHECK 4 then refuses block D's writes, so the readings H reads are never written — REC-161's explanation, extended), no-totality 26/1 (F4 alone).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const ind = (r) => (r && typeof r === "object" && r.independence && typeof r.independence === "object")
  ? r.independence : null;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r161", MEMBER_TOKEN: "mem-r161", PROBE_TOKEN: "prb-r161", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const DO = async (p, body) => rP(await (await doStub.fetch("http://x/" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-r161",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id, basis) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(basis.length
    ? ["references:", ...[...new Set(basis)].flatMap((b) => [`  - target: ${b}`, "    rel: cites", "    status: confirmed"])]
    : ["references: []"]),
  "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(basis.length ? ["basis:", ...basis.flatMap((b) => [`  - target: ${b}`, "    role: supports"])] : []),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

let snapKeySeq = 0;
const promote = async (id, text, type, register = []) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${String(++snapKeySeq).padStart(6, "0")}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register,
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};

/* THREE DOCUMENTS, three captures. `register` keys a capture to ONE bundle (capture_sha is its primary
   key), so two different documents cannot hold one capture; what "two parts sharing a capture" means in
   this record is two REASONS resting on one captured document — two passages of it (DEC-23: content is a
   part of a document, up to the whole). The question below cites AUDIT at positions 2 AND 3. */
const LEDGER = "INFO-2026-5161-ledger", MINUTES = "INFO-2026-5161-minutes", AUDIT = "INFO-2026-5161-audit";
const SHARED_CAP = sha(`capture-of-${AUDIT}`);
for (const d of [LEDGER, MINUTES, AUDIT])
  await mustPromote(d, infoMd(d), "information",
    [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${d}`), encoding: "binary", bytes: 10 }]);

/* THE QUESTION'S REASONS, in this order: positions 0..3. */
const BASIS = [LEDGER, MINUTES, AUDIT, AUDIT];
const INQ = "INQ-2026-5161-proposed-partition";
await mustPromote(INQ, inquiryMd(INQ, BASIS), "inquiry");

const enc = encodeURIComponent;
const pi = async (partition, id = INQ) =>
  GET(`op=partitionindependence&token=${RUTH}&id=${enc(id)}&partition=${enc(JSON.stringify(partition))}`);

const legsRead = (await pi([[0, 1, 2, 3]]))?.legs_read;
console.log(`  corpus: 3 documents, 3 distinct captures; question reasons read: ${legsRead} (two of them on one captured document)`);
t("FIXTURE IS NON-EMPTY AND ARMS THE TRAP: the question rests on FOUR reasons over THREE documents, "
+ "positions 2 and 3 both resting on the one captured AUDIT",
  [legsRead, new Set(BASIS).size, BASIS[2] === BASIS[3]], [4, 3, true]);

/* THE WITNESS: what the record holds before any read, re-read at the foot. */
const versionsBefore = (await GET(`op=basisversions&token=${RUTH}&id=${enc(INQ)}`))?.total;

/* ====================================================================== A */
console.log("\n--- A. two parts sharing a capture read as sharing an origin ---");
const sharedCap = await pi([[0, 2], [1, 3]]);
{
  const i = ind(sharedCap);
  t("ARM A1 — the partition that puts the two AUDIT reasons in DIFFERENT groups reads as sharing an "
  + "origin, THROUGH THE CAPTURE they both rest on, and names the two groups",
    [sharedCap?.ok, i?.checked, i?.parts, (i?.shared ?? []).length,
     (i?.shared?.[0]?.through ?? []).includes(`capture:${SHARED_CAP}`),
     i?.shared?.[0]?.a, i?.shared?.[0]?.b],
    [true, true, 2, 1, true, "part 1", "part 2"]);
  t("ARM A2 — the answer reads back WHAT WAS PROPOSED, with the documents each group rests on, and "
  + "says it wrote nothing",
    [sharedCap?.partition, sharedCap?.wrote],
    [[{ label: "part 1", legs: [0, 2], targets: [LEDGER, AUDIT] },
      { label: "part 2", legs: [1, 3], targets: [MINUTES, AUDIT] }], false]);
}

/* ====================================================================== B */
console.log("\n--- B. independent parts read clean ---");
const clean = await pi([[0, 1], [2, 3]]);
{
  const i = ind(clean);
  t("ARM B1 — THE SAME FOUR REASONS grouped the other way — the two AUDIT reasons together — read CLEAN: the "
  + "walk ran (`checked: true`), finished (`complete: true`) and found nothing. It is the PARTITION that "
  + "decides, not the reasons",
    [clean?.ok, i?.checked, i?.shared, i?.complete, i?.parts], [true, true, [], true, 2]);
  const four = ind(await pi([[0], [1], [2, 3]]));
  t("ARM B2 — three genuinely separate groups read clean too; a function answering `shared` for any "
  + "multi-part partition fails here",
    [four?.checked, four?.shared, four?.parts], [true, [], 3]);
}

/* ====================================================================== C */
console.log("\n--- C. a one-part partition reads checked: false ---");
{
  const one = await pi([[0, 1, 2, 3]]);
  const i = ind(one);
  t("ARM C1 — ONE group has nothing to compare, so the walk never runs: `checked: false`, `complete: "
  + "null` (a bound nothing tested did not hold) and NOT `shared: []` read as looked-and-found-nothing",
    [one?.ok, i?.checked, i?.complete, i?.parts, i?.shared], [true, false, null, 1, []]);
}

/* ====================================================================== D */
console.log("\n--- D. the answer equals op=versionstrength's once the partition is written ---");
{
  const RUN = "RUN-2026-0923-r161";
  const opened = await POST(`op=airunopen&token=${RUTH}`, {
    run: RUN, contextType: "inquiry", contextId: INQ,
    label: "REC-161 partition fixture", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (opened?.started !== true) throw new Error(`airunopen: ${JSON.stringify(opened)}`);
  const write = async (name, groups) => POST(`op=suggest&token=${RUTH}`, {
    target: INQ, run: RUN, kind: "basis-version", name,
    description: `The partition ${name}, written so its independence can be read back from the store.`,
    relationship: "or",
    grounds: groups.map((g) => ({ ground: g.label })),
    legs: groups.flatMap((g) => g.legs.map((o) => ({ target: BASIS[o], role: "supports", ground: g.label })))
      .sort((x, y) => BASIS.indexOf(x.target) - BASIS.indexOf(y.target)) });
  const strength = async (name) => GET(`op=versionstrength&token=${RUTH}&id=${enc(INQ)}`
    + `&version=${enc(name)}&states=suggested`);

  const CLEAN = [{ label: "the ledger and minutes", legs: [0, 1] }, { label: "the audit", legs: [2, 3] }];
  const w1 = await write("clean grouping", CLEAN);
  const before = ind(await pi(CLEAN)), stored = ind(await strength("clean grouping"));
  t("ARM D1 — a CLEAN partition, proposed under the names it is then written under, reads EXACTLY as "
  + "`op=versionstrength` reads the written version — every field of `independence`",
    [w1?.ok, before !== null, JSON.stringify(before) === JSON.stringify(stored), stored?.checked],
    [true, true, true, true]);

  /* THE SHARED CASE MUST BE WRITTEN CLEAN AND TURN SHARED AFTERWARDS, because CHECK 4 refuses a shared
     version at the write. A locator recorded AFTER the write ties LEDGER and MINUTES to one upstream
     address — the ADDRESS branch of the walk, which neither A nor B reached. */
  const SPLIT = [{ label: "the ledger", legs: [0] }, { label: "everything else", legs: [1, 2, 3] }];
  const w2 = await write("split grouping", SPLIT);
  const ADDR = "https://example.gov/one-upstream-ledger.pdf";
  for (const d of [LEDGER, MINUTES])
    await DO("recordcapturedlocator", { address: ADDR, addressNorm: ADDR,
                                        captureSha: sha(`capture-of-${d}`), retrieved: NOW });
  const prop = ind(await pi(SPLIT)), wrote = ind(await strength("split grouping"));
  t("ARM D2 — a partition sharing an origin THROUGH AN ADDRESS reads exactly as the written version "
  + "does, shared origin and all. A second derivation that skipped a branch agrees on D1 and fails here",
    [w2?.ok, (prop?.shared ?? []).length, prop?.shared?.[0]?.through?.includes(`address:${ADDR}`),
     JSON.stringify(prop) === JSON.stringify(wrote)],
    [true, 1, true, true]);
}

/* ====================================================================== E */
console.log("\n--- E. one implementation: the method calls #independenceOf and walks nothing itself ---");
{
  const decomment = (src) => src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
  const CODE = decomment(STORE_SRC);
  const start = CODE.indexOf("  partitionIndependence(a = {}) {");
  const end = start < 0 ? -1 : CODE.indexOf("\n  }\n", start);
  const body = start < 0 || end < 0 ? "" : CODE.slice(start, end);
  console.log(`  reach: partitionIndependence body ${body.length} chars`);
  t("ARM E1 — `partitionIndependence` exists, calls `this.#independenceOf` exactly ONCE, and contains "
  + "no origin walk of its own (no read of `register` or `captured_locators`)",
    [body.length > 500, (body.match(/this\.#independenceOf\s*\(/g) || []).length,
     /captured_locators|FROM register/.test(body)],
    [true, 1, false]);
}

/* ====================================================================== F */
console.log("\n--- F. what it refuses, by code ---");
{
  const code = (r) => [r?.ok, r?.code, r?.check];
  t("ARM F1 — no question named", code(await GET(`op=partitionindependence&token=${RUTH}&partition=${enc("[[0]]")}`)),
    [false, "PARTITION_INDEPENDENCE_NO_INQUIRY", "C-71.1"]);
  t("ARM F2 — not a question, and a question that does not exist, are ONE answer",
    [code(await pi([[0]], LEDGER)), code(await pi([[0]], "INQ-2026-5161-nobody-asked"))],
    [[false, "PARTITION_INDEPENDENCE_NOT_AN_INQUIRY", "C-71.2"],
     [false, "PARTITION_INDEPENDENCE_NOT_AN_INQUIRY", "C-71.2"]]);
  const noStamp = await DO(`partitionindependence?id=${enc(INQ)}&partition=${enc("[[0,1],[2,3]]")}`);
  const absent = await DO(`partitionindependence?id=${enc("INQ-2026-5161-nobody-asked")}&partition=${enc("[[0]]")}`);
  t("ARM F3 — FAIL-CLOSED: with no viewer stamp a real question refuses BYTE-IDENTICALLY to one that "
  + "does not exist, and no leg is read",
    [code(noStamp), JSON.stringify(noStamp) === JSON.stringify({ ...absent, inquiry: INQ })],
    [[false, "PARTITION_INDEPENDENCE_NOT_AN_INQUIRY", "C-71.2"], true]);
  t("ARM F4 — a reason in NO group is refused, and the refusal names it: a partition covers every "
  + "reason, as a written reading does",
    [...code(await pi([[0, 1], [2]])), (await pi([[0, 1], [2]]))?.unplaced],
    [false, "PARTITION_INDEPENDENCE_NOT_TOTAL", "C-71.6", [3]]);
  t("ARM F5 — a reason in TWO groups, and a position the question does not have",
    [code(await pi([[0, 1], [1, 2, 3]])), code(await pi([[0, 1], [2, 3, 9]]))],
    [[false, "PARTITION_INDEPENDENCE_LEG_TWICE", "C-71.5"],
     [false, "PARTITION_INDEPENDENCE_UNKNOWN_LEG", "C-71.4"]]);
  const bad = await Promise.all([
    GET(`op=partitionindependence&token=${RUTH}&id=${enc(INQ)}`),
    GET(`op=partitionindependence&token=${RUTH}&id=${enc(INQ)}&partition=${enc("not json")}`),
    pi([]), pi([[0, 1], []]), pi([[0, 1], ["two", 3]]),
    pi([{ label: "x", legs: [0, 1] }, { label: "x", legs: [2, 3] }]),
    pi([{ label: " ", legs: [0, 1, 2, 3] }])]);
  t("ARM F6 — SEVEN unreadable shapes (absent, not JSON, empty, an empty group, a non-position, two "
  + "groups sharing a name, a blank name), each refused by the one code",
    bad.map((r) => [r?.code, r?.check]), Array(7).fill(["PARTITION_INDEPENDENCE_UNREADABLE", "C-71.3"]));
  t("ARM F7 — the bound is refused by name, not applied quietly",
    code(await pi(Array.from({ length: 501 }, (_, k) => [k]))),
    [false, "PARTITION_INDEPENDENCE_TOO_MANY_LEGS", "C-71.7"]);
}

/* ====================================================================== G */
console.log("\n--- G. over-strictness: correct work in spellings the author did not write ---");
{
  const canon = ind(await pi([[0, 2], [1, 3]]));
  const shuffled = ind(await pi([[2, 0], [3, 1]]));
  const named = ind(await pi([{ label: "part 1", legs: [0, 2] }, { label: "part 2", legs: [1, 3] }]));
  const posted = await POST(`op=partitionindependence&token=${RUTH}&id=${enc(INQ)}`,
    { partition: [[0, 2], [1, 3]] });
  t("ARM G1 — positions out of order, the same groups NAMED explicitly, and the partition sent as a "
  + "POST body all read exactly as the canonical spelling does",
    [JSON.stringify(shuffled) === JSON.stringify(canon), JSON.stringify(named) === JSON.stringify(canon),
     JSON.stringify(ind(posted)) === JSON.stringify(canon), (canon?.shared ?? []).length > 0],
    [true, true, true, true]);
}

/* ====================================================================== H */
console.log("\n--- H. REC-192: the VERSION arm — a written reading's independence ON ITS OWN, no strength key ---");
{
  /* BOB #31, 2026-09-23 22:22Z (INVESTIGATIVE-SESSION.md §12, UI-74's finding 5): *"a read answers
     `independence` ON ITS OWN, apart from the strength pair, so the separation (a) asks for is structural
     at the wire and not a choice each page makes."* The two readings block D wrote are the subjects: one
     clean, one sharing an origin through an ADDRESS recorded after its write. */
  const vi = async (version, extra = "") => GET(`op=partitionindependence&token=${RUTH}&id=${enc(INQ)}`
    + `&version=${enc(version)}${extra}`);
  const vs = async (version, states = "") => GET(`op=versionstrength&token=${RUTH}&id=${enc(INQ)}`
    + `&version=${enc(version)}${states ? `&states=${enc(states)}` : ""}`);
  /* THE STRENGTH VOCABULARY, taken from the answer that DOES carry a strength rather than typed from
     memory: every key `op=versionstrength` returns that `op=partitionindependence`'s partition arm does
     not, minus the two facts about the version itself. A key added to versionstrength later joins it. */
  const keysDeep = (o, out = new Set()) => {
    if (o && typeof o === "object")
      for (const [k, v] of Object.entries(o)) { if (!Array.isArray(o)) out.add(k); keysDeep(v, out); }
    return out;
  };
  const vsClean = await vs("clean grouping", "suggested");
  const piShape = new Set(Object.keys(await pi([[0, 1], [2, 3]])));
  const FACTS = new Set(["version", "version_state", "legs_complete"]);
  const STRENGTH = [...Object.keys(vsClean ?? {})].filter((k) => !piShape.has(k) && !FACTS.has(k));
  console.log(`  strength vocabulary, derived from op=versionstrength's answer: ${STRENGTH.join(", ")}`);
  t("ARM H0 — THE DETECTOR IS NOT EMPTY: the vocabulary derived from op=versionstrength's answer holds "
  + "`pair` and more, and walking versionstrength's OWN answer finds it — so an absence below is a finding",
    [vsClean?.ok, STRENGTH.includes("pair"), STRENGTH.length >= 5,
     STRENGTH.some((k) => keysDeep(vsClean).has(k))], [true, true, true, true]);

  const clean = await vi("clean grouping"), split = await vi("split grouping");
  const vsSplit = await vs("split grouping", "suggested");
  t("ARM H1 — EQUALITY: the version arm's `independence` EQUALS op=versionstrength's `independence` for "
  + "the same version, every field, over the clean reading AND over the one sharing an origin through an address",
    [clean?.ok, split?.ok,
     JSON.stringify(ind(clean)) === JSON.stringify(ind(vsClean)),
     JSON.stringify(ind(split)) === JSON.stringify(ind(vsSplit)),
     ind(clean)?.shared, (ind(split)?.shared ?? []).length, ind(split)?.checked],
    [true, true, true, true, [], 1, true]);

  const found = [...keysDeep(clean)].filter((k) => STRENGTH.includes(k))
    .concat([...keysDeep(split)].filter((k) => STRENGTH.includes(k)));
  t("ARM H2 — NO STRENGTH KEY: nowhere in the version arm's answer, at any depth, is there a key of the "
  + "strength vocabulary — no pair, no axis, no grade, no state set",
    found, []);
  t("ARM H3 — THE WHOLE ANSWER, and nothing a later edit could slip a strength into unnoticed: exactly "
  + "the question, the reading, its state, the legs read, whether they were complete, `wrote: false`, and `independence`",
    Object.keys(clean ?? {}),
    ["ok", "inquiry", "version", "version_state", "legs_read", "legs_complete", "wrote", "independence"]);
  t("ARM H4 — the facts served beside it are the version's own: its name, its state, its legs",
    [clean?.version, clean?.version_state, clean?.legs_read, clean?.legs_complete, clean?.wrote],
    ["clean grouping", "suggested", 4, true, false]);

  /* OVER-STRICTNESS: the reading a member affirms at the accept ceremony is by construction NOT YET
     accepted, so a state gate borrowed from versionstrength would refuse exactly the read this exists for. */
  const vsDefault = await vs("split grouping");
  t("ARM H5 — NOT STATE-GATED: a `suggested` reading answers here, where op=versionstrength's default "
  + "(accepted) refuses it — a state set filters a STRENGTH, and this answer carries none",
    [split?.ok, vsDefault?.code], [true, "VERSION_STRENGTH_STATE_EXCLUDED"]);
  const acc = await POST(`op=versionaccept&token=${RUTH}&target=${enc(INQ)}`
    + `&version=${enc("clean grouping")}&reason=${enc("the evidence holds")}`
    + `&affirmed=${enc("the ledger and minutes,the audit")}`, {});
  if (!acc?.ok) console.log(`  accept: ${JSON.stringify(acc).slice(0, 500)}`);
  const accV = await vi("clean grouping"), accS = await vs("clean grouping");
  t("ARM H6 — and once ACCEPTED, the version arm still equals op=versionstrength's DEFAULT read, and "
  + "serves the new state",
    [acc?.ok, accS?.ok, accV?.version_state, JSON.stringify(ind(accV)) === JSON.stringify(ind(accS))],
    [true, true, "accepted", true]);

  const code = (r) => [r?.ok, r?.code, r?.check];
  t("ARM H7 — a reading the question does not hold, and a version AND a partition named together, are "
  + "each refused by name; nothing is substituted and neither is silently preferred",
    [code(await vi("no such reading")),
     code(await vi("clean grouping", `&partition=${enc("[[0,1],[2,3]]")}`))],
    [[false, "PARTITION_INDEPENDENCE_NO_SUCH_VERSION", "C-71.9"],
     [false, "PARTITION_INDEPENDENCE_TWO_SUBJECTS", "C-71.8"]]);
  const noStamp = await DO(`partitionindependence?id=${enc(INQ)}&version=${enc("clean grouping")}`);
  const absent = await DO(`partitionindependence?id=${enc("INQ-2026-5161-nobody-asked")}&version=${enc("clean grouping")}`);
  t("ARM H8 — versionstrength's GATE KEPT: with no viewer stamp the version arm on a real question "
  + "refuses BYTE-IDENTICALLY to a question that does not exist, before any leg is read",
    [code(noStamp), JSON.stringify(noStamp) === JSON.stringify({ ...absent, inquiry: INQ })],
    [[false, "PARTITION_INDEPENDENCE_NOT_AN_INQUIRY", "C-71.2"], true]);
}

/* THE WITNESS, re-read: the reads wrote nothing. The two versions D wrote are D's own writes; H's accept
   moves one of them to `accepted` and mints no version. */
const versionsAfter = (await GET(`op=basisversions&token=${RUTH}&id=${enc(INQ)}`))?.total;
t("WITNESS — the question holds exactly the two readings block D WROTE through op=suggest, and no "
+ "partition read added one",
  [versionsBefore, versionsAfter], [0, 2]);

} catch (e) {
  console.log(`  FAIL  BLOCK DIED: ${e && e.stack ? e.stack : e}`);
  fail++;
} finally {
  await mf.dispose();
}

console.log(`\npartitionindependence: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

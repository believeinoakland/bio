/* VF-6 · DEC-53's CARRIED WATCH ITEM, MEASURED: how often does a member accept a
 * machine-composed resolution candidate WITHOUT READING IT?
 *
 * DEC-53's recommendation, verbatim and the whole of this item: *"the number to watch
 * is how often a member accepts without reading, and nobody is measuring that today."*
 *
 * THIS IS AN INSTRUMENT, NOT A SUITE. Named `*.measure.mjs` on
 * `connections-growth.measure.mjs`'s precedent so `scripts/battery.mjs` — which
 * discovers `*.test.mjs` — does not run it. It stands up two whole stores and it
 * reports rather than ratchets. Run it directly:
 *
 *     cd bio-plane && node test/accepts-without-reading.measure.mjs
 *
 * ====================================================================
 * THE FIRST OBLIGATION IS NOT THE NUMBER. IT IS WHAT THE INSTRUMENT CANNOT SEE.
 * ====================================================================
 *
 * "READ" IS NOT DIRECTLY OBSERVABLE BY ANY RECORD. Nothing in this plane, and
 * nothing in any plane, can observe a member's eyes. Every candidate quantity is a
 * PROXY, and a proxy presented as the thing itself is this record's own overclaim
 * class arriving in an instrument — the same defect as a self-reported confidence
 * thresholded as calibrated, which `CPDF-10`'s scope forbids by name as
 * pseudo-confidence, one altitude up. So this file states its proxies BEFORE it
 * states any figure, and the check that enforces that is code (`honesty()` below)
 * rather than a request that the author be careful.
 *
 * THE FOUR PROXIES DEC-53's ENACTMENT NAMED, each PROBED against the live record
 * rather than reasoned about, and each reported PRESENT or ABSENT with its reason:
 *
 *   P1  TIME-TO-ACCEPT — the interval between a member being SHOWN the candidate
 *       list and accepting off it. Needs two recorded events: the read and the write.
 *   P2  DETAIL EVER EXPANDED — whether the member opened the candidate's own
 *       `detail` sentence before accepting.
 *   P3  ACCEPTING A CANDIDATE WHOSE `grade_if_resolved` IS NULL — a member accepting
 *       a candidate the record has told them would mint nothing is a member who did
 *       not read the line saying so.
 *   P4  INTER-ACT GAP — the interval between one member's consecutive recorded
 *       accept acts, from `resolutions.at` and `resolutions.resolved_by`.
 *
 * ====================================================================
 * THE DECISIVE EXPERIMENT, and it is driven rather than argued.
 * ====================================================================
 *
 * Two stores are built from a BYTE-IDENTICAL fixture and diverge in exactly one way:
 *
 *   STORE R  "READ THEN ACCEPT"  — the member calls `op=readingname` (the
 *                                  machine-composed candidate list), reads it, and
 *                                  then accepts one candidate with `op=resolve`.
 *   STORE B  "ACCEPT BLIND"      — the member calls `op=resolve` on the same capture
 *                                  and the same reference, having NEVER called
 *                                  `op=readingname` at all. No list was composed, so
 *                                  nothing could have been read.
 *
 * These are the two ends of the quantity DEC-53 asked about: a maximally-read accept
 * and a definitionally-unread one. **If the record's recorded acts cannot tell them
 * apart, the rate is not measurable from this record at any sample size** — and that
 * is a fact about the record, established by driving it, not a shortfall of effort.
 *
 * ====================================================================
 * WHAT THIS INSTRUMENT CANNOT SEE, STATED UP FRONT AND PRINTED EVERY RUN.
 * ====================================================================
 *
 *  1. IT CANNOT SEE READING. It sees recorded ACTS. Every claim it makes is about
 *     what the record retained, never about what a member did with their attention.
 *  2. IT CANNOT SEE OUT-OF-BAND READING. A member who read the source document last
 *     week and accepts today is, to any surface here, indistinguishable from one who
 *     accepted blind — and is the better-informed of the two. Every proxy below is
 *     wrong in that direction, which is the direction that manufactures a scandal.
 *  3. IT HAS NO POPULATION. There is no corpus of real member accept acts on this
 *     machine, so even a working proxy would have n = 0 live acts to average over.
 *     A rate quoted off driven fixtures would be a statement about the fixtures.
 *  4. IT CANNOT SEE THE SURFACE. Whether `civicos-ui/app.html` renders a candidate's
 *     `detail` inline or behind a disclosure is a property of a page this instrument
 *     never loads; it can only report whether the RECORD retained a signal about it.
 *  5. IT IS MINIFLARE ON A LAPTOP. Any duration here is an order-of-magnitude
 *     reading, never a latency budget — `connections-growth.measure.mjs`'s bound and
 *     it applies unchanged.
 *
 * ====================================================================
 * `undetermined` IS A RESULT, AND IT IS NOT ZERO.
 * ====================================================================
 *
 * `CLAUDE.md`: undetermined is first-class and must be STATED. This instrument may
 * answer `undetermined`, and when it does it says so in that word — never `0`, never
 * `0%`, never an empty field. An ABSENT SIGNAL and a MEASURED ZERO are different
 * facts about the world and this file refuses to let them print alike. That is the
 * same rule `store.mjs` enforces one construct over for provenance routes, where
 * `NEVER_LOOKED` and `LOOKED_INDETERMINATE` are distinct findings for exactly this
 * reason, and it is the rule `inquiry_basis.grade` enforces by being NULLABLE.
 *
 * NEGATIVE CONTROL: THREE arms, each armed ALONE via `--arm=<name>`, run and recorded by
 * `test/accepts-without-reading.control.mjs`; the arms change the instrument's REAL composed
 * output and the check that fires on each is the SAME check that runs in the baseline, never a
 * stub of it. (1) `proxy-as-quantity` -> THE ARM THIS ITEM EXISTS FOR: state the proxy AS the
 * quantity ("members accept without reading N% of the time") with the proxy unnamed and its
 * blind spot dropped -> `honesty()` must FAIL, and its failure must NAME the proxy that was
 * silently substituted; the caveat is load-bearing and travels with the number or the number is
 * worse than nothing. (2) `absence-as-zero` -> feed the instrument the fixture where no
 * read/unread signal exists at all (which is the BASELINE fixture, because that is what this
 * record is) and report the absence as `0%` -> `absence()` must FAIL saying an absent signal and
 * a measured zero are different facts. (3) `vacuity` (OVER-STRICTNESS) -> hardwire the answer to
 * `undetermined` regardless of the census -> `vacuity()` must FAIL, because an instrument that
 * answers `undetermined` whatever it is fed has measured nothing and its `undetermined` is worth
 * as little as a fabricated rate; the arm proves the baseline's `undetermined` is READ OFF the
 * census and not the only thing this file can say.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ARMS = new Set(process.argv.slice(2)
  .filter((a) => a.startsWith("--arm="))
  .map((a) => a.slice("--arm=".length)));
const KNOWN_ARMS = ["proxy-as-quantity", "absence-as-zero", "vacuity"];
for (const a of ARMS) if (!KNOWN_ARMS.includes(a)) {
  console.error(`unknown arm '${a}' — known arms: ${KNOWN_ARMS.join(", ")}`);
  process.exit(2);
}
const armed = (n) => ARMS.has(n);

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const NOW = "2026-07-16T00:00:00Z";
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

let checks = 0, failed = 0;
const check = (label, ok, why) => {
  checks++;
  if (!ok) failed++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok || !why ? "" : `\n          ${why}`}`);
};

/* ------------------------------------------------------------------ a store */
/* One whole plane, from the same fixture every time. The two runs differ in
   exactly one call, which is the experiment. */
async function stand(tag) {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: `adm-${tag}`, MEMBER_TOKEN: `mem-${tag}`, PROBE_TOKEN: `prb-${tag}`,
                VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
  });
  const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
  const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json());

  const member = async (id, caps, role = "member") => {
    const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps }, `adm-${tag}`);
    if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
    const en = await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
    if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
    const lg = await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` });
    if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
    return lg.token;
  };
  /* 4.2/4.3: the first two roster members must be administrators. */
  await member("ruth", ["contribute"], "admin");
  await member("gus", ["contribute"], "admin");
  const nora = await member("nora", ["contribute"]);

  const bundleMd = (id) => [
    "---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "${id}"`, "current_state: collected", "prior_state: null",
    `created: ${NOW}`, `last_updated: ${NOW}`, "produced_by:", "  mode: assisted",
    "  capability_tier: session", "group: believe-in-oakland", "references: []",
    "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
    "  since: null", "  source: null", "visuals: []", "criticality: supporting",
    "source_status: unchanged", "source:", "  locator: in hand",
    "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false",
    "  frequency: none", "---", "", "## Summary", "", "An agenda item.", "",
    "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
  ].join("\n");

  let bseq = 0;
  const doc = async (key, label, ref) => {
    const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-vf6`;
    const md = bundleMd(id);
    const capture = sha(`vf6-${key}`);
    const prov = JSON.stringify({ documents: [{
      capture: { sha256: capture, encoding: "binary", bytes: 10 },
      reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
                 entities: [{ ref, kind: ref.split(":")[0], key, label }] } }] });
    const files = [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ];
    const r = await post("promote", {
      bundleId: id, base: null, snapKey: `${id}-new`, author: "vf6", files,
      register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
      meta: { object_type: "information", group: "believe-in-oakland", title: id,
              current_state: "collected", created: NOW, last_updated: NOW } }, `mem-${tag}`);
    if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
    return { id, capture, ref };
  };

  /* THE A-TIER DOCUMENT: the source's own reference IS the subject's registered
     identifier, so `grade_if_resolved` is "A" and accepting it mints an ESTABLISHED
     resolution in one act. This is precisely the candidate DEC-53 was raised about —
     REC-40 made the identifier tiers reachable in one call, so a member is one act
     from an established resolution off a machine-composed list. */
  const A_DOC = await doc("26-0955", "Fifth Amendment To Lease Agreement", "contract:26-0955");
  /* THE NULL-GRADE DOCUMENT: the subject's name sits INSIDE a longer string, so the
     recogniser would match nothing and `grade_if_resolved` is null. P3 is about a
     member accepting THIS one. */
  const N_DOC = await doc("26-0999", "Fremont Shoreline Improvements At The Estuary", "legislation:26-0999");

  const entity = async (kind, label, aliases) => {
    const r = await post("entitycreate", { kind, label, aliases }, nora);
    if (!r?.ok) throw new Error(`entitycreate ${label}: ${JSON.stringify(r)}`);
    return r.entity_id;
  };
  const SUBJ = await entity("contract", "Lease Amendment Five", ["contract:26-0955"]);
  /* `parcel`, because the registry admits a CLOSED kind vocabulary (D-83) and
     `place` is not in it — introducing a kind is a doctrine change, not a fixture
     convenience. Found by running, not by reading. */
  const NSUBJ = await entity("parcel", "Fremont Shoreline Estuary", ["Fremont Shoreline Estuary"]);

  return { mf, post, get, nora, A_DOC, N_DOC, SUBJ, NSUBJ };
}

/* ============================================================ THE EXPERIMENT */
console.log("\n=== VF-6 · the accepts-without-reading rate, on machine-composed resolution candidates ===");
console.log(`--- instrument: bio-plane/test/accepts-without-reading.measure.mjs · arms: ${ARMS.size ? [...ARMS].join(", ") : "none (baseline)"} ---`);

console.log("\n--- STORE R · READ THEN ACCEPT: the member is SHOWN the candidate list, then accepts off it ---");
const R = await stand("r");
const rList = await R.get("readingname", `entity=${encodeURIComponent(R.SUBJ)}`, R.nora);
const rOffered = (rList?.documents || []).length;
const rCand = (rList?.documents || [])[0] || null;
console.log(`  op=readingname offered ${rOffered} candidate(s); the first carries grade_if_resolved=${JSON.stringify(rCand?.grade_if_resolved)}`);
const tReadR = Date.now();
const rAccept = await R.post("resolve", { captureSha: R.A_DOC.capture, ref: R.A_DOC.ref }, R.nora);
const tAcceptR = Date.now();
const rRows = await R.get("resolutions", `sha256=${R.A_DOC.capture}`, R.nora);

console.log("\n--- STORE B · ACCEPT BLIND: op=readingname is NEVER called, so no list was ever composed ---");
const B = await stand("b");
const bAccept = await B.post("resolve", { captureSha: B.A_DOC.capture, ref: B.A_DOC.ref }, B.nora);
const bRows = await B.get("resolutions", `sha256=${B.A_DOC.capture}`, B.nora);

check("both stores recorded the accept act", rAccept?.ok === true && bAccept?.ok === true,
  `R=${JSON.stringify(rAccept?.ok)} B=${JSON.stringify(bAccept?.ok)}`);
check("and both minted an ESTABLISHED Grade A off the machine-composed candidate — the act DEC-53 was raised about",
  rRows?.resolutions?.[0]?.grade === "A" && rRows.resolutions[0].established === true
  && bRows?.resolutions?.[0]?.grade === "A" && bRows.resolutions[0].established === true,
  `R=${JSON.stringify(rRows?.resolutions?.[0])} B=${JSON.stringify(bRows?.resolutions?.[0])}`);

/* THE COMPARISON. `at` is a server wall-clock stamp taken inside #upsertResolution and
   differs between two runs by construction, so it is REMOVED and REPORTED separately
   rather than quietly ignored — a field dropped without saying so is how a diff lies. */
const strip = (o) => {
  const { at, ...rest } = o || {};
  return rest;
};
const rActs = (rRows?.resolutions || []).map(strip);
const bActs = (bRows?.resolutions || []).map(strip);
const identical = JSON.stringify(rActs) === JSON.stringify(bActs);
console.log("\n--- THE DIFF: what the record retained about a READ accept vs a BLIND one ---");
console.log(`  READ  THEN ACCEPT: ${JSON.stringify(rActs)}`);
console.log(`  ACCEPT BLIND     : ${JSON.stringify(bActs)}`);
console.log(`  the only differing field is 'at': R=${JSON.stringify(rRows?.resolutions?.[0]?.at)} B=${JSON.stringify(bRows?.resolutions?.[0]?.at)}`);
check("THE RECORDED ACTS ARE IDENTICAL apart from the wall-clock stamp — the record does not retain whether the list was ever read",
  identical, "a difference here would mean a signal EXISTS and this instrument's whole finding is wrong");

/* P3, DRIVEN rather than reasoned. A member accepts the candidate whose
   `grade_if_resolved` is null — the record told them, in the candidate's own detail
   sentence, that resolving it would record nothing. What lands? */
console.log("\n--- P3 DRIVEN: a member accepts a candidate whose grade_if_resolved is NULL ---");
const nList = await R.get("readingname", `entity=${encodeURIComponent(R.NSUBJ)}`, R.nora);
const nCand = (nList?.documents || [])[0] || null;
console.log(`  op=readingname offered ${(nList?.documents || []).length} candidate(s); grade_if_resolved=${JSON.stringify(nCand?.grade_if_resolved)}, correspondence=${JSON.stringify(nCand?.correspondence)}`);
await R.post("resolve", { captureSha: R.N_DOC.capture, ref: R.N_DOC.ref }, R.nora);
const nAfter = await R.get("resolutions", `sha256=${R.N_DOC.capture}`, R.nora);
const nToSubj = (nAfter?.resolutions || []).filter((x) => x.entity_id === R.NSUBJ);
check("accepting a NULL-grade candidate writes NO resolution row for that subject — so there is no recorded act to count",
  nCand != null && nCand.grade_if_resolved === null && nToSubj.length === 0,
  `offered=${JSON.stringify(nCand?.grade_if_resolved)} rows_for_subject=${nToSubj.length}`);

/* ================================================== THE PROXY CENSUS ======= */
/* Each proxy is probed against the record that was just driven, and each row says
   PRESENT or ABSENT with the reason a reader can check. This table is the item's
   first obligation discharged: it is what the instrument can and cannot see. */
const census = [
  { id: "P1", proxy: "time-to-accept",
    needs: "a RECORDED read event for op=readingname, paired with the accept",
    present: false,
    why: "op=readingname is declared `mutating: false` in index.mjs's OPS table and writes no row. "
       + "The two stores above prove it by driving: one called it, one never did, and the recorded acts "
       + "are identical. There is no read event to subtract the accept from, so no interval exists. "
       + "The wall-clock gap this harness itself measured (" + (tAcceptR - tReadR) + " ms) is the HARNESS's "
       + "own stopwatch and is not in the record — quoting it as the record's would be inventing an "
       + "instrument out of the observer." },
  { id: "P2", proxy: "whether the candidate's detail was ever expanded",
    needs: "a recorded UI interaction, or a field on the accept naming which candidate was displayed",
    present: false,
    why: "no op writes one. `resolutions` carries capture_sha, bundle_id, ref, entity_id, grade, method, "
       + "basis, established, raised_from, resolved_by and at — and nothing about what was on the "
       + "member's screen. The candidate `detail` sentence is composed on the READ and never stored." },
  { id: "P3", proxy: "acceptance of a candidate whose grade_if_resolved is null",
    needs: "a recorded act attributable to accepting a null-graded candidate",
    present: false,
    why: "DRIVEN above and the absence is STRUCTURAL, not an omission: op=resolve re-runs the recogniser "
       + "and mints what the recogniser mints, so accepting a null-graded candidate writes NOTHING. "
       + "The act that would be the signal is the one act that leaves no trace. Counting rows would "
       + "count exactly zero however many members did it." },
  { id: "P4", proxy: "inter-act gap between one member's consecutive accepts",
    needs: "two or more accept acts by one member, with resolutions.at and resolutions.resolved_by",
    present: false,
    why: "the FIELDS exist — `at` and `resolved_by` are both on the row and both server-stamped — so this "
       + "is the one proxy that is not structurally blocked. It is ABSENT for a different reason and the "
       + "difference matters: `at` is stamped at WRITE time inside #upsertResolution, so it dates the "
       + "accept and not the reading, and a gap between two writes is a gap between two writes. It would "
       + "also need a population, and there are 0 live member accept acts on this machine to average "
       + "over. A rate off this proxy would be a claim about writes wearing a claim about attention." },
];

console.log("\n--- THE PROXY CENSUS: what each candidate proxy needs, and whether the record carries it ---");
for (const p of census) {
  console.log(`  ${p.id}  ${p.present ? "PRESENT" : "ABSENT "}  ${p.proxy}`);
  console.log(`        needs: ${p.needs}`);
  console.log(`        ${p.why}`);
}

/* ==================================================== THE FINDING ========== */
/* THREE-VALUED, and the three are not interchangeable. This is `store.mjs`'s own
   route-finding doctrine one construct over: "the route cannot be shown" and "nobody
   looked" are different facts and they read alike if the field is simply absent. */
const FINDING = {
  RATE: "RATE",                   /* a signal exists; the rate is stated WITH its proxy */
  UNDETERMINED: "undetermined",   /* surfaces were interrogated and none distinguishes read from unread */
};

function decide(cen) {
  /* ARM 3 (over-strictness): hardwire the answer, so the census governs nothing.
     An instrument that answers `undetermined` whatever it is fed has measured
     nothing, and `vacuity()` below is what notices. */
  if (armed("vacuity")) return { finding: FINDING.UNDETERMINED, via: null, rate: null };
  const live = cen.filter((p) => p.present);
  if (live.length === 0) return { finding: FINDING.UNDETERMINED, via: null, rate: null };
  return { finding: FINDING.RATE, via: live[0], rate: live[0].rate ?? null };
}
const answer = decide(census);

/* ------------------------------------------------------- the published number */
/* ARM 2: report an ABSENT signal as a measured zero. An absent signal and a measured
   zero are different facts about the world; this is the line where they would be
   made to read alike. */
const published = armed("absence-as-zero") && answer.finding === FINDING.UNDETERMINED
  ? "0%"
  : answer.finding === FINDING.RATE ? `${answer.rate}%` : FINDING.UNDETERMINED;

/* --------------------------------------------------------- the sentence */
/* THE SENTENCE THIS INSTRUMENT WOULD PUBLISH, composed here so it can be CHECKED
   before it is printed. The caveat is not decoration around the number; it is part
   of the number, and `honesty()` is what makes that structural rather than a habit. */
function sentence(ans, pub) {
  /* ARM 1 — THE ARM THIS ITEM EXISTS FOR: state the proxy AS the quantity. The proxy
     goes unnamed and its blind spot is dropped, which is exactly how a proxy becomes
     an overclaim: nothing about this sentence is false-looking, and that is the
     problem with it. */
  if (armed("proxy-as-quantity"))
    return `Members accept without reading ${pub === FINDING.UNDETERMINED ? "0" : pub.replace("%", "")}% of the time.`;
  if (ans.finding === FINDING.RATE)
    return `Measured through the proxy '${ans.via.proxy}' (NOT reading itself, which no record observes), `
         + `the rate is ${pub}. WHAT THIS MISSES: ${ans.via.why}`;
  return `undetermined — NOT zero. All ${census.length} candidate proxies were probed against the record `
       + `and every one is ABSENT (${census.map((p) => p.id).join(", ")}), so the surfaces cannot distinguish `
       + `a read accept from an unread one. WHAT THIS MISSES: reading itself is unobservable to any record; `
       + `this states that the record retains no proxy for it, and never that members read.`;
}
const SENTENCE = sentence(answer, published);

/* ================================================== THE THREE CHECKS ======= */
/* (1) THE HONESTY ASSERTION. Two properties, and they are code rather than a comment
   asking the author to be careful. A number stated without the proxy that produced it
   is this record's overclaim class, and the failure NAMES the proxy that was silently
   substituted so the reader learns what was traded. */
function honesty(text, ans) {
  const problems = [];
  const statesANumber = /\d+(\.\d+)?%/.test(text) || /\b\d+(\.\d+)?%?\s+of the time\b/.test(text);
  const namesAProxy = /proxy/i.test(text);
  const carriesTheMiss = /WHAT THIS MISSES/.test(text);
  if (statesANumber && !namesAProxy)
    problems.push(`a figure is stated with NO PROXY NAMED. The quantity actually available here is `
      + `'${(ans.via && ans.via.proxy) || census[0].proxy}' — a PROXY for reading, never reading itself, `
      + `which no record observes. Stating it as the quantity is the overclaim class this item exists to refuse.`);
  if (statesANumber && !carriesTheMiss)
    problems.push(`a figure is stated with NO 'WHAT THIS MISSES' clause. The caveat is load-bearing and travels `
      + `with the number or the number is worse than nothing (VF-6's negative control 1).`);
  return problems;
}
/* (2) THE ABSENCE ASSERTION. An absent signal and a measured zero are different facts
   and must not read alike. */
function absence(pub, ans) {
  const problems = [];
  if (ans.finding === FINDING.UNDETERMINED && /^-?\d/.test(String(pub)))
    problems.push(`the answer is UNDETERMINED and it was published as the number '${pub}'. An ABSENT signal and `
      + `a MEASURED ZERO are different facts about the world: '0%' asserts that members were observed and none `
      + `accepted unread, which nothing here observed. The word is 'undetermined'.`);
  return problems;
}
/* (3) THE VACUITY ASSERTION (over-strictness). An instrument that answers
   `undetermined` whatever it is fed has measured nothing. This feeds `decide()` a
   census in which a proxy IS present and requires a RATE back — so the baseline's
   `undetermined` is READ OFF the census and is not the only thing this file can say. */
function vacuity() {
  const problems = [];
  const synthetic = [{ id: "SYN", proxy: "a synthetic read event paired with its accept",
                       needs: "nothing — this row asserts the signal is present", present: true, rate: 37,
                       why: "synthetic, for the vacuity arm only; never published as a measurement" }];
  const d = decide(synthetic);
  if (d.finding !== FINDING.RATE)
    problems.push(`fed a census in which a read/unread signal IS PRESENT, the instrument still answered `
      + `'${d.finding}'. An instrument that says 'undetermined' whatever it is fed has measured nothing, and its `
      + `undetermined is worth as little as a fabricated rate.`);
  const s = sentence(d, `${d.rate}%`);
  if (d.finding === FINDING.RATE && honesty(s, d).length !== 0)
    problems.push(`the RATE path composes a sentence its own honesty check rejects — the check would be `
      + `unreachable in the one case it exists for.`);
  return problems;
}

console.log("\n--- THE ANSWER, and the checks that had to pass before it could be printed ---");
const hp = honesty(SENTENCE, answer), ap = absence(published, answer), vp = vacuity();
for (const p of hp) console.log(`  honesty  ${p}`);
for (const p of ap) console.log(`  absence  ${p}`);
for (const p of vp) console.log(`  vacuity  ${p}`);
check("HONESTY: the published sentence names its proxy and carries what the proxy misses", hp.length === 0, hp.join(" | "));
check("ABSENCE: an absent signal is published as 'undetermined' and never as a number", ap.length === 0, ap.join(" | "));
check("VACUITY: fed a census carrying a real signal, the instrument answers with a RATE and not with 'undetermined'", vp.length === 0, vp.join(" | "));

console.log(`\n  ANSWER      ${published}`);
console.log(`  SENTENCE    ${SENTENCE}`);

console.log("\n--- WHAT THIS INSTRUMENT CANNOT SEE, printed every run so the figure never travels without it ---");
for (const l of [
  "1. It cannot see reading. It sees recorded ACTS; every claim is about what the record retained.",
  "2. It cannot see out-of-band reading. A member who read the source last week is indistinguishable here",
  "   from one who accepted blind, and is the better informed of the two.",
  "3. It has no population: 0 live member accept acts on this machine, so a rate would describe fixtures.",
  "4. It cannot see the surface. Whether app.html renders `detail` inline or behind a disclosure is a",
  "   property of a page this instrument never loads.",
  "5. Miniflare on a laptop: any duration here is an order-of-magnitude reading, never a latency budget.",
]) console.log(`  ${l}`);

await R.mf.dispose();
await B.mf.dispose();

/* The FOOT line, so a control driver can refuse a run that died halfway rather than
   reading a truncated output as a clean one (readingname.test.mjs's harness rule). */
console.log(`\naccepts-without-reading: ${checks - failed} pass, ${failed} fail · answer ${published}`);
process.exit(failed === 0 ? 0 : 1);

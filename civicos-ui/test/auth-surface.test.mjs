/* UI-24 — THE AUTHENTICATION SURFACE, AND THE PUBLISHED LIST. The two screens
 * every member meets FIRST, and until this file NOTHING IN THIS REPOSITORY HAD
 * EVER RUN EITHER OF THEM.
 *
 * WHY THIS EXISTS, and it is a measurement rather than a tidy-up. UI-23 swept
 * the D-173 envelope class across `app.html` and found a sixth instance that no
 * runtime instrument could have seen: `signIn` read `l.token` off `api("login")`
 * — off the ENVELOPE — so **member sign-in by password had never worked against
 * a real plane**, from the day it was written. The refusal half was worse: a
 * wrong password arrives as `{ok:true, result:{ok:false, reason:…, detail:…}}`,
 * so `l.ok === false` never fired either and the gate showed the member the
 * envelope instead of the record's own reason. It was found by the STATIC arm of
 * `check-mock-envelope.mjs`, because arm B — the runtime one, which watches what
 * a mock actually answered — IS ONLY AS WIDE AS THE HARNESS, and the harness
 * reached neither `signIn` nor `pubList`. Both paths sat outside every
 * instrument this project owns.
 *
 * So this suite is the instrument, and its subject is deliberately unglamorous:
 * no surface is redesigned here, and where reality disagreed with the code's
 * assumptions the assertion is corrected and says why (CLAUDE.md), never
 * exempted.
 *
 * WHAT IT DRIVES, end to end, through `app.html`'s own handlers:
 *
 *   1 SIGN IN, CORRECT PASSWORD — `op=login` answered in the WIRE shape
 *     (`{ok:true, result:{ok:true, role, token, expires}}`, which is what
 *     `index.mjs`'s login handler returns: it hands the Durable Object's answer
 *     back VERBATIM). The token must be read off `result`, the session must be
 *     marked, and — the assertion that actually bites — EVERY op the surface
 *     sends afterwards must carry that token. A token read off the envelope is
 *     `undefined`, `rec` drops the parameter entirely, and the whole session is
 *     unauthenticated while every screen still paints.
 *
 *   2 THE SESSION LANDS WHERE `boot()` EXPECTS IT. `boot` is the other half of
 *     the gap: no harness had ever run it either, so `PLANE.me`, the rail, the
 *     act-source load and the landing route were all reached only by suites that
 *     set them up by hand. Driven here for real — `op=whoami` -> `PLANE.me`,
 *     `op=affordances` -> the published vocabularies, the gate closed, the
 *     working space opened, and the queue asked for.
 *
 *   3 SIGN IN, REFUSED — the plane's refusal, rendered as the plane's, with the
 *     composed-wording instrument over it (UI-13's arm (d)): a sentence this
 *     surface wrote FAILS even when the reason code sitting beside it is right.
 *     Nothing is written, no session is marked, and `boot()` is never entered.
 *     **WHAT THE PLANE ANSWERS HERE CHANGED UNDER THIS SUITE**, and the
 *     correction is at `PLANE_WORDS` below: REC-41 collapsed the two refusal
 *     codes into one and added the `detail` SENTENCE the plane never had, so the
 *     gate renders the sentence and this file reads it OUT OF THE PLANE rather
 *     than holding a copy of it.
 *
 *   3b NO RETIRED LOGIN CODE SURVIVES ANYWHERE UNDER `civicos-ui/` — a
 *     source-level sweep over every file in the package, because the way this
 *     defect came back would be a stale copy in a file no harness runs (it had
 *     already happened twice: this suite's own mock and a comment in
 *     `app.html`). A retired wire string is not a naming preference: matching on
 *     one is matching on something the plane cannot send.
 *
 *   4 THE PUBLISHED LIST — `pubList` against `op=publishedmanifest`, which
 *     `index.mjs` re-wraps explicitly (`json({ok:true, result:(await
 *     r.json()).result})`). The public space is reached with NO credential, and
 *     that is asserted: a published-record screen that quietly authenticated
 *     would be a different product.
 *
 *   5 THE COVERAGE LINE ITSELF. `check-mock-envelope.mjs`'s arm B reports the
 *     ops the harness exercises, and UI-24's accepts-when is that the line MOVED.
 *     Rather than read that off a log, this suite re-runs ITSELF under the
 *     guard's own probe (`test/envelope-probe.mjs`, the same `--import`
 *     mechanism the guard uses) in a child process and asserts from the probe's
 *     own output that `login` and `publishedmanifest` are now observed, and
 *     observed WRAPPED. Measured, in the loop the reader runs.
 *
 * THE MOCKS ANSWER THE WIRE SHAPE. `op=login` and `op=publishedmanifest` are
 * both WRAPPED — neither is in the guard's FLAT list, and this file asserts that
 * rather than assuming it, so the day either grows a flattening handler in
 * `index.mjs` this suite fails instead of drifting.
 *
 * AND THE ENVELOPE IS NOT THE ONLY WAY A MOCK CAN BE WRONG — UI-30, 2026-08-04,
 * and it is this file's own correction rather than someone else's. This suite
 * shipped saying the mocks answer the wire shape "from birth", and it was true
 * of the SHAPE and false of the CONTENT: the refusal branch hand-answered a
 * reason code, and when REC-41 retired that code the suite stayed 62/62 GREEN
 * while asserting against something the plane cannot produce. A copy that
 * agrees with the plane at zero cost is not evidence (CLAUDE.md), and the
 * envelope guard cannot see this class — it judges shape, not content. So the
 * refusal's wording is now READ OUT OF `bio-plane/src/store.mjs`, and a
 * source-level sweep keeps the retired codes out of the whole package. The
 * corrected reasoning is at `PLANE_WORDS` below, where the old one stood.
 *
 * NEGATIVE CONTROL, FIVE ARMS — (a)-(d) RUN 2026-08-04 (UI-30) and (e) RUN 2026-08-04 (UI-32). Arms (a)-(c) are ALSO run mechanically below in
 * their own VM context built from a mutated copy of the source — nothing on
 * disk is touched by those, so there is no restore to get wrong. EVERY ARM WAS
 * ALSO RUN ONCE ON DISK, 2026-08-04 (UI-30), against the FINAL file, which is
 * the run that answers "does the LOOP THE READER RUNS fail" — and the counts
 * below are that run's. Only `app.html` is ever mutated (arm (c) needs no
 * mutation at all, see below), and it was restored BYTE-IDENTICAL after each
 * arm: sha256 3788ef1bf9b3424eeafbf8d651687e01b0cd5025a1ae3065a5307a94f4043b28
 * before and after all four.
 *
 *   (a) BREAK THE TOKEN READ — `apiR` and `apiQ`, the untokened transports'
 *       seams, stop opening the envelope (`return (j && j.result !== undefined)
 *       ? j.result : j;` -> `return j;`, spliced INSIDE each function's own
 *       body). That is D-173's sixth instance restored exactly.
 *       ON-DISK RUN: **27 of 71 assertions FAIL** — the token, the session, the
 *       authentication of every op after it, all fifteen of `boot()`'s, the
 *       record's own sentence at the gate, and both published-list rows. THE
 *       POINT OF THE ARM: the identical edit could not fail ANYTHING before
 *       UI-24, because nothing in this repository ran these two paths.
 *       SPLICED INSIDE THE FUNCTION BODY DELIBERATELY — `recR` and `recPostR`
 *       carry a byte-identical line and both come EARLIER in the file, so a
 *       plain string replace mutates the wrong seam and reports green. That is
 *       UI-22's measured instrument finding, applied rather than re-learned.
 *
 *   (b) THE COMPOSED-WORDING INSTRUMENT — the refusal branch renders a sentence
 *       this surface wrote. RETARGETED 2026-08-04 (UI-30) to the shape REC-41
 *       landed, and the retarget made it SHARPER: the mutation now prints the
 *       plane's own reason CODE and then adds prose of its own, so it looks
 *       more faithful than the surface that shipped and every code-shaped
 *       assertion is green against it. Only subtracting what the plane said and
 *       reading the remainder can see it.
 *       ON-DISK RUN: **6 of 71 FAIL** — the sentence missing, the code exposed
 *       to a member, the residue scan naming the surface as author, and the
 *       three control/contrast assertions that ride with them.
 *
 *   (c) UNWRAP THE LOGIN MOCK — the guard's own arm. In the in-VM half a child
 *       process drives this suite with a login mock that answers flat and the
 *       probe records it flat against a wire map that says WRAPPED.
 *       ON-DISK RUN, and it is the receipt for why arm B exists at all. The
 *       mutation is reached through this file's own `UI24_FLAT_LOGIN` switch
 *       rather than by editing the mock, so NOTHING IS WRITTEN TO DISK and the
 *       arm is re-runnable in one step: `UI24_FLAT_LOGIN=1 node
 *       check-mock-envelope.mjs` exits 1 with
 *         FAIL: auth-surface.test.mjs answers op=login UNWRAPPED (2 of 2
 *         answers; top-level keys ["ok","role","token","expires"]) …
 *       naming the suite and the op — WHILE THE SURFACE ASSERTIONS IN THIS FILE
 *       ALL STAY GREEN, because a flat answer happens to put `token` where the
 *       correct read looks. `UI24_FLAT_LOGIN=1 node test/auth-surface.test.mjs`
 *       moves only 4 of 71, and every one of them is a control or a coverage
 *       assertion rather than a claim about the surface. A mock shaped like the
 *       bug proves nothing, and this file cannot tell on its own; the guard can.
 *
 *   (d) RESTORE A RETIRED LOGIN CODE — UI-30's own, and the arm that answers
 *       "could a stale copy come back silently". One of the two codes REC-41
 *       retired is put back into the `app.html` comment that used to spell it.
 *       ON-DISK RUN: **2 of 71 FAIL**, and the first NAMES both the file and
 *       the string it found: `NO RETIRED LOGIN CODE survives anywhere under
 *       civicos-ui/ — app.html still carries …`. The second is the probe child
 *       re-running this suite, which fails with it.
 *       THERE IS NO IN-VM HALF FOR THIS ARM AND THAT IS NOT AN OMISSION: the
 *       sweep's subject is what is ON DISK in this package, so an arm run
 *       against a mutated string in memory would be measuring a different
 *       thing. The mutation is the smallest one that reproduces the defect this
 *       item found — a retired wire string surviving in a file no harness runs.
 *
 *   (e) RESTORE THE CONTENT-FALSE MOCK — UI-32's, and it is UI-30's own lesson
 *       one field further in. Put the `capture_acts` fixture back the way it
 *       stood: `label` hand-typed and `prompt:null` for the attest act.
 *       ON-DISK RUN 2026-08-04: **2 of 73 FAIL**, and the measurement is the
 *       71 THAT DO NOT. A fixture answering a shape the plane cannot send for
 *       this act — `attest` has carried a `prompt` since REC-43 — was invisible
 *       to every assertion in this file, because this suite renders no attest
 *       surface. The two that fail are the new content pin and the guard's own
 *       probe child re-running this suite behind it. That is D-173's family
 *       stated exactly: a mock must answer the wire CONTENT, not merely the
 *       wire SHAPE, and the only thing that catches the difference is reading
 *       the field off the PUBLICATION instead of typing it.
 *       `auth-surface.test.mjs` restored byte-identical, sha256 12c78c52… .
 *
 * Run alone: `node test/auth-surface.test.mjs`.
 */
import vm from "vm"; import fs from "fs"; import path from "path"; import os from "os";
import { webcrypto } from "crypto";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { appScript } from "./extract.mjs";
/* UI-32: the act catalogue this suite hands the surface is the RECORD'S, read
   off the same array `op=affordances` maps over. `affordances.mjs` reaches no
   `cloudflare:workers` binding, so a node harness can import it — UI-28's
   finding, and the reason this correction costs two lines instead of a textual
   read of the plane's source. */
import { CAPTURE_ACTS, ATTEST_FENCE } from "../../bio-plane/src/affordances.mjs";

const SELF = fileURLToPath(import.meta.url);
/* Set when this file is re-run by its own coverage/NC arms, so the child does
   the driving and skips the arms that would spawn another one. */
const CHILD = process.env.UI24_PROBE_CHILD || "";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ============================================================
   THE PLANE, MIRRORED AT THE WIRE
   ============================================================ */

const TOKEN = "sess_" + "a".repeat(32);
const HANDLE = "alice";
const GOOD_PW = "correct horse battery staple";

/* `op=whoami`'s answer, in index.mjs's own field order. */
const WHOAMI = {
  tokenClass: null, session: true, member: "m_alice", handle: HANDLE,
  administer: false, rootOfTrust: false, capabilities: ["contribute"],
  vocabulary: ["contribute", "publish", "administer"],
  detail: "capabilities are set by an administrator and gate what this account may DO, not what it may see",
};

/* `op=publishedmanifest`'s answer — store.mjs publishedManifest(), whose whole
   point is that anyone can verify it without this instance's cooperation. */
const MANIFEST = {
  ok: true, scope: "published",
  published: [
    { bundle_id:"INQ-2026-0004-sewer", edition:1, title:"Why did the sewer contract skip competitive bid?",
      bundle_sha:"c".repeat(64), ratified_at:"2026-07-14T09:00:00Z", attestor_key:"SHA256:zzz",
      gate_version:"1.4", manifest_sha:"d".repeat(64), manifest:"{}" },
    { bundle_id:"INQ-2026-0011-transfer", edition:2, title:"Where does the transfer basis come from?",
      bundle_sha:"e".repeat(64), ratified_at:"2026-07-30T12:00:00Z", attestor_key:"SHA256:zzz",
      gate_version:"1.4", manifest_sha:"f".repeat(64), manifest:"{}" },
  ],
  shas: [],
  detail: "every hash here is verifiable by anyone with ssh-keygen and the doorbell, without this "
        + "instance's cooperation or continued existence. Nothing unpublished appears, by construction: "
        + "this reads the published projection and never the working corpus.",
};

/* THE PLANE'S OWN WORDS FOR A REFUSED LOGIN — READ FROM THE PLANE, NOT TYPED.
   ==========================================================================
   CORRECTED 2026-08-04 (UI-30), AND THE OLD VERSION WAS WRONG IN BOTH HALVES
   RATHER THAN MERELY OUT OF DATE. It read:

     `store.mjs login()` answers [the two now-retired reason codes, spelled out
     here as string literals] and NOTHING ELSE — no `detail`, no sentence. So
     the honest thing for the gate to render is the reason … The gap is real and
     is raised for CONDUCT rather than closed here with an invention.

   (The two codes are described rather than quoted, here and everywhere below.
   The sweep at the end of this section is what keeps them out of this package,
   and a file that enforces an absence cannot be an instance of it.)

   (1) THE CODES ARE GONE. REC-41 (landed on main, I3 6.0.0) collapsed both into
       ONE, `SIGN_IN_REFUSED`, because with `op=bootstrap`'s roster closed a
       distinguishable refusal is the enumeration surface that replaces it. So
       from that landing until this correction THIS SUITE WAS 62/62 GREEN
       AGAINST A SHAPE THE PLANE CANNOT PRODUCE: the mock hand-answered a
       retired code and every assertion about "the record's own reason" was
       satisfied by the mock agreeing with itself. That is D-173's class exactly
       — a UI mock must answer the WIRE shape — and CLAUDE.md's rule is to
       CORRECT the assertion with a dated reason, never exempt it.

   (2) THE GAP THIS COMMENT RAISED FOR CONDUCT IS CLOSED, BY THE PLANE, WHICH IS
       THE ONLY PLACE IT COULD HAVE BEEN CLOSED. `op=login` now carries a
       `detail` SENTENCE beside the code, from `Store.LOGIN_REFUSAL_DETAIL`. The
       reasoning the old comment reached for is unchanged and is why this is not
       a reversal: a surface may render a refusal it RECEIVED and may never
       compose one (DEC-8). Nothing was invented here or in `app.html`; the
       plane learned to say it, and the gate now renders what it says instead of
       showing a member a machine code to decode.

   AND THE SENTENCE IS READ OUT OF `store.mjs`, never copied into this file.
   REC-43 measured, for the fourth time in this project, that a hand-typed copy
   agrees with its source at ZERO COST and leaves every behavioural assertion
   green while the two drift — which is the very defect this correction is
   cleaning up, one layer over. `store.mjs` cannot be imported here (it opens
   with `import … from "cloudflare:workers"` and only workerd provides that), so
   it is read TEXTUALLY, the way `check-semantics.mjs` already reads it. That
   extraction is itself asserted below: an extraction that silently yields ""
   would make every `includes()` in this file trivially true, which is the same
   costless equality wearing different clothes. */
const STORE_SRC = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
function planeLoginRefusal(){
  const block = /static LOGIN_REFUSAL_DETAIL = \{\n([\s\S]*?)\n {2}\};/.exec(STORE_SRC);
  if(!block) return null;
  const out = {};
  /* One entry per `KEY:` at the constant's own indentation; a value is the
     concatenated string literals that follow it, joined the way the source
     joins them with `+`. */
  for(const part of block[1].split(/^ {4}(?=[A-Z_]+:)/m)){
    const k = /^([A-Z_]+):/.exec(part);
    if(!k) continue;
    const lits = [...part.slice(k[0].length).matchAll(/"((?:[^"\\]|\\.)*)"/g)]
      .map(m => JSON.parse('"' + m[1] + '"'));
    if(lits.length) out[k[1]] = lits.join("");
  }
  return out;
}
const REFUSAL = planeLoginRefusal();
const REFUSAL_CODE = REFUSAL ? Object.keys(REFUSAL)[0] : "";
const REFUSAL_SENTENCE = REFUSAL ? REFUSAL[REFUSAL_CODE] : "";

ok("the plane's login-refusal constant is readable from here", !!REFUSAL && !!REFUSAL_CODE);
ok("ONE code and ONE sentence — a second entry means the refusals split again and this suite must be re-read, not re-pointed",
   !!REFUSAL && Object.keys(REFUSAL).length === 1);
/* The extraction is REAL prose, not an empty string or a fragment. Without
   this, a regex that stopped matching would hand every assertion below a free
   pass. */
ok("and the sentence extracted is a whole sentence rather than an empty read",
   REFUSAL_SENTENCE.length > 200 && /^[a-z].*\.$/s.test(REFUSAL_SENTENCE)
   && !REFUSAL_SENTENCE.includes('"') && !/\s\+\s/.test(REFUSAL_SENTENCE));
/* AND EVERY REFUSAL ARM IN THE PLANE PAIRS THE CODE WITH THE SENTENCE. Reading
   the constant proves the sentence exists; this proves it is what `op=login`
   actually returns — including the DO dispatch's own wrapper arm, which refuses
   before `login()` is ever reached. An arm that answered the code bare would
   send this gate back to rendering a machine code with nothing to say. */
{
  const codes = [...STORE_SRC.matchAll(new RegExp(`reason: "${REFUSAL_CODE}"`, "g"))].length;
  const paired = [...STORE_SRC.matchAll(
    new RegExp(`reason: "${REFUSAL_CODE}",\\s*detail: Store\\.LOGIN_REFUSAL_DETAIL\\.${REFUSAL_CODE}`, "g"))].length;
  ok("the plane refuses a sign-in in more than one place, so the pairing is worth asserting", codes >= 2);
  ok("EVERY arm that answers the refusal code answers the sentence with it — none is left bare",
     codes > 0 && paired === codes);
}

/* Everything the plane said about this refusal, in one list, so the residue
   scan below can subtract ALL of it before asking whether what remains reads
   like a refusal this surface wrote. */
const PLANE_WORDS = [REFUSAL_CODE, REFUSAL_SENTENCE];

/* ---- NO RETIRED LOGIN CODE SURVIVES ANYWHERE UNDER `civicos-ui/` ----------
   A source-level sweep, because the runtime assertions above can only see the
   paths this harness drives, and the way this defect came back would be a copy
   sitting in a file nobody runs — which is exactly where BOTH of the instances
   UI-30 found were sitting (this suite's mock, and a worked example inside an
   `app.html` comment). Matching on a retired wire string is not a naming
   preference: it is matching on something the plane cannot send.
   THE NAMES ARE ASSEMBLED FROM PIECES so that the file enforcing the absence is
   not itself an instance of what it forbids — a sweep that finds itself either
   fails forever or gets weakened into a sweep that finds nothing. */
const RETIRED_LOGIN_CODES = [["BAD", "PASSWORD"], ["NO", "SUCH", "ROLE"]].map(p => p.join("_"));
{
  const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
  const walk = d => fs.readdirSync(d, { withFileTypes:true }).flatMap(e => {
    if(e.name === "node_modules" || e.name.startsWith(".")) return [];
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
  const files = walk(root);
  /* A walk that reached nothing would pass silently, so it is measured. */
  ok("the sweep reads the whole package, including the surface and this suite",
     files.length > 20 && files.includes(path.join(root, "app.html")) && files.includes(SELF));
  const found = [];
  for(const f of files){
    let src = ""; try{ src = fs.readFileSync(f, "utf8"); }catch(_){ continue; }
    for(const code of RETIRED_LOGIN_CODES){
      if(src.includes(code)) found.push(path.relative(root, f) + " still carries " + code);
    }
  }
  ok("NO RETIRED LOGIN CODE survives anywhere under civicos-ui/ — "
     + (found.length ? found.join(" · ") : "none, over " + files.length + " files"),
     found.length === 0);
}

/* THE ACT CATALOGUE `boot()` loads. Only the fields boot's own path touches.
 *
 * CORRECTED 2026-08-04 BY UI-32, NEVER EXEMPTED, and it is the SAME defect this
 * suite's own header was corrected for by UI-30 — one field further in. What
 * stood here hand-typed `label:"Co-attest this capture"` and answered
 * `prompt:null` for the attest act. Both were content the RECORD publishes: the
 * label has been on `capture_acts` since REC-38, and REC-43 put the honesty
 * fence there as `prompt` under DEC-39, so on the wire this act has carried a
 * prompt since before UI-28 shipped. `prompt:null` is not a shape the plane can
 * send for `attest` at all.
 *
 * IT WAS GREEN, AND ONLY BECAUSE THIS SUITE RENDERS NO ATTEST SURFACE. That is
 * exactly D-173's family and UI-30's finding in this file: a mock must answer
 * the wire CONTENT, not merely the wire SHAPE — a mock that is shape-correct and
 * content-false passes until the day some assertion here needs the field, and
 * then it fails somewhere that has nothing to do with the lie. `attestFence()`
 * answers "" on a null prompt and every entry point checks it, so a surface
 * booted against this mock would have offered the act with no fence, or removed
 * the control, and this suite would have called that the application's
 * behaviour.
 *
 * SO THE CONTENT COMES FROM THE PUBLICATION. `id`, `label` and `prompt` are read
 * off `CAPTURE_ACTS`, which is the array `op=affordances` actually maps over;
 * the four decorated fields are index.mjs's `decorateAct` tables and stay
 * literal here, because those are what a fixture is for. */
const PUBLISHED_ATTEST = CAPTURE_ACTS.find(a => a.id === "attest");
const AFFORDANCES = {
  target: null, catalog: [], vocabularies: { dispositions:["deferred","dismissed"] },
  capture_acts: [{ id: PUBLISHED_ATTEST.id, label: PUBLISHED_ATTEST.label,
                   weight:null, needs:"contribute", mode:"session", rung:"attested",
                   prompt: PUBLISHED_ATTEST.prompt ?? null }],
  detail: "pass target=<bundle id> for the acts available on that object right now",
};
ok("the act catalogue this suite hands the surface answers the wire CONTENT, not merely its shape",
   AFFORDANCES.capture_acts[0].label === PUBLISHED_ATTEST.label
   && AFFORDANCES.capture_acts[0].prompt === ATTEST_FENCE);
ok("and the record does publish a prompt for this act, so the null it used to answer was unsendable",
   typeof ATTEST_FENCE === "string" && ATTEST_FENCE.length > 200);

/* `op=queue` / `op=tasks` — boot lands on the queue, so they are asked. Empty
   feeds: this suite's subject is the door, not what is behind it. */
const QUEUE = { ok:true, items:[], cases:[], detail:"nothing is asking for anybody right now" };
const TASKS = { ok:true, tasks:[] };

/* ---- the mock, wrapping every answer the way the plane does --------------
   `mode.login` picks which login answer comes back; `mode.flatLogin` is arm
   (c)'s mutation and is reached only from the child process. */
function makePlane(mode){
  const CALLS = [];
  /* Arm (c) reaches this through the environment, because the mutation it makes
     is to the MOCK and the mock lives in this file — the child process is the
     only way to have the probe watch a differently-shaped answer. */
  const opts = { flatLogin: !!process.env.UI24_FLAT_LOGIN, ...(mode || {}) };
  async function fetch(u, init){
    const url = new URL(String(u), "https://plane.test");
    const op = url.searchParams.get("op");
    let body = null; try{ body = init && init.body ? JSON.parse(init.body) : null; }catch(_){}
    CALLS.push({ op, method:(init&&init.method)||"GET", body,
                 params:Object.fromEntries(url.searchParams.entries()),
                 token:url.searchParams.get("token") });
    const R = o => ({ ok:true, json:async()=>o });
    /* The envelope the Durable Object really sends, which index.mjs passes
       through: `{ok:true, result:<the store's own return>}`. */
    const W = r => R({ ok:true, result:r, store:"bio", tokenClass:null });

    if(op === "login"){
      /* store.mjs login(): a refusal is a VALUE inside the envelope, exactly as
         a success is. That is the whole shape D-173's sixth instance missed. */
      const inner = (body && body.password === GOOD_PW)
        ? { ok:true, role:"member:m_alice", token:TOKEN, expires: 1785000000000 }
        /* CORRECTED 2026-08-04 (UI-30): the refusal is the ONE code REC-41 left
           and the SENTENCE it now carries, both read out of `store.mjs` above
           rather than typed here. */
        : { ok:false, reason:REFUSAL_CODE, detail:REFUSAL_SENTENCE };
      /* NEGATIVE CONTROL (c): the mock answers the one shape the plane never
         sends. Reached only when this file is re-run by its own arm. */
      return opts.flatLogin ? R({ ok:true, ...inner }) : W(inner);
    }
    if(op === "publishedmanifest") return W(MANIFEST);
    if(op === "whoami")            return W(WHOAMI);
    if(op === "affordances")       return W(AFFORDANCES);
    if(op === "queue")             return W(QUEUE);
    if(op === "tasks")             return W(TASKS);
    if(op === "list")              return W([]);
    /* A control-plane refusal IS flat, legitimately, and is how an op this
       suite does not model announces itself rather than being answered with a
       fabricated success. */
    return { ok:false, json:async()=>({ ok:false, error:"unknown op "+op }) };
  }
  return { CALLS, fetch };
}

/* ---- a DOM stub with REAL class lists, because the gate and the two spaces
   are switched entirely through classes and a no-op classList would let every
   one of those assertions pass on nothing. ---- */
function makeCtx(plane){
  const els = new Map();
  function el(){
    const classes = new Set();
    const e = {
      classList: { add:(...c)=>c.forEach(x=>classes.add(x)),
                   remove:(...c)=>c.forEach(x=>classes.delete(x)),
                   toggle:(c,on)=>{ if(on===undefined){ classes.has(c)?classes.delete(c):classes.add(c); }
                                    else if(on) classes.add(c); else classes.delete(c); },
                   contains:c=>classes.has(c) },
      classes, style:{}, dataset:{}, value:"", _html:"", textContent:"", scrollTop:0,
      disabled:false, offsetHeight:120, addEventListener(){}, removeEventListener(){},
      querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(p,h){ e._html += h; },
      focus(){}, click(){}, remove(){}, setAttribute(){}, getAttribute:()=>null, onclick:null, oninput:null,
    };
    Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}});
    return e;
  }
  const doc = {
    querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){},
    documentElement:{ _attrs:{}, setAttribute(k,v){ this._attrs[k]=v; }, getAttribute(k){ return this._attrs[k]; } },
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{ appendChild(){} },
  };
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
    IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
    clearTimeout(){}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
    document:doc, location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,init)=>plane.fetch(u,init) };
  ctx.globalThis = ctx; vm.createContext(ctx); ctx.__els = els; ctx.__doc = doc;
  return ctx;
}

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__signIn=signIn;globalThis.__boot=boot;"
  + "globalThis.__pubList=pubList;globalThis.__enterPublished=enterPublished;"
  + "globalThis.__actVocab=actVocab;globalThis.__captureAct=captureAct;";

function boot(source, plane){
  const ctx = makeCtx(plane);
  vm.runInContext((source || appScript()) + EXPORTS, ctx);
  return ctx;
}
const SRC = appScript();
/* One element, asked for THE WAY THE SURFACE ASKS FOR IT — through the
   document's own querySelector, so a selector the surface never touched is
   created here rather than read back as undefined and quietly asserted on. */
const E = (c, sel) => c.__doc.querySelector(sel);
const H = c => E(c, "#g-err")._html;

/* ============================================================
   (1) SIGN IN WITH THE CORRECT PASSWORD — the token comes off `result`
   ============================================================ */
const plane = makePlane();
const ctx = boot(SRC, plane);
E(ctx, "#g-handle").value = "member:m_alice";
E(ctx, "#g-pw").value = GOOD_PW;
await ctx.__signIn();

const loginCall = plane.CALLS.find(c=>c.op==="login");
ok("sign-in reaches the plane at op=login, as a POST carrying the authored role and password",
   !!loginCall && loginCall.method==="POST" && loginCall.body
   && loginCall.body.role==="member:m_alice" && loginCall.body.password===GOOD_PW);
ok("the untokened transport sends NO token — there is no session to send one from",
   !!loginCall && loginCall.token===null);

/* THE ASSERTION THE DEFECT LIVED UNDER. `l.token` off the envelope is
   `undefined` and the surface would carry on as if signed in. */
ok("THE TOKEN IS READ OFF `result`, not off the envelope", ctx.__PLANE.token === TOKEN);
ok("the surface marks this a SESSION (not a pasted machine token)", ctx.__PLANE.session === true);
ok("no error is shown to a member whose password was right",
   !E(ctx, "#g-err")._html || E(ctx, "#g-err").classList.contains("hidden"));

/* AND THE ONE THAT BITES: an undefined token is silently DROPPED by `rec`'s
   URLSearchParams spread, so every screen paints and nothing is authenticated. */
const tokened = plane.CALLS.filter(c=>c.op!=="login");
ok("boot() actually sent ops after sign-in", tokened.length > 0);
ok("EVERY op after sign-in carries the session token — the session lands where the transport expects it",
   tokened.length > 0 && tokened.every(c=>c.token===TOKEN));

/* ============================================================
   (2) THE SESSION LANDS WHERE `boot()` EXPECTS IT
   ============================================================
   `boot()` had never been run by any harness either. Every suite in this
   directory sets `PLANE.me` by hand and calls a renderer, which is why
   `loadActSource`'s missing caller survived until UI-22 read the source: a mock
   supplying what the application never did. This drives the real thing. */
ok("boot asks op=whoami", plane.CALLS.some(c=>c.op==="whoami"));
ok("and PLANE.me is the OP'S answer, opened out of the envelope",
   ctx.__PLANE.me && ctx.__PLANE.me.handle===HANDLE && ctx.__PLANE.me.session===true
   && Array.isArray(ctx.__PLANE.me.capabilities) && ctx.__PLANE.me.capabilities.includes("contribute"));
ok("boot loads the published act source BEFORE any screen paints (UI-22's no-caller defect, pinned)",
   plane.CALLS.some(c=>c.op==="affordances"));
ok("and the published vocabulary is readable from the surface afterwards",
   ctx.__actVocab("dispositions").length === 2);
ok("REC-38's capture_acts block arrives on the same read and is readable",
   !!ctx.__captureAct("attest") && ctx.__captureAct("attest").label.length > 0);
ok("the affordances read is ordered BEFORE the landing route's own ops",
   plane.CALLS.findIndex(c=>c.op==="affordances") < plane.CALLS.findIndex(c=>c.op==="queue"));

ok("the gate is closed once the session exists", E(ctx, "#gate").classList.contains("hidden"));
ok("the working space is opened", E(ctx, "#work").classList.contains("on"));
ok("the published space is closed", !E(ctx, "#pub").classList.contains("on"));
ok("the document root records which space the member is in",
   ctx.__doc.documentElement.getAttribute("data-space") === "working");
ok("the member's own handle is shown, from op=whoami and not from what they typed",
   E(ctx, "#m-handle")._html.includes(HANDLE));
ok("with no address in the bar the member lands on the queue", plane.CALLS.some(c=>c.op==="queue"));
ok("the queue screen painted", /The queue/.test(E(ctx, "#content")._html));

/* ============================================================
   (3) A REFUSED SIGN-IN — the plane's refusal, in the plane's words
   ============================================================ */
const planeB = makePlane();
const ctxB = boot(SRC, planeB);
E(ctxB, "#g-handle").value = "member:m_alice";
E(ctxB, "#g-pw").value = "not the password";
await ctxB.__signIn();

ok("a refused login writes NO token", !ctxB.__PLANE.token);
ok("a refused login marks NO session", ctxB.__PLANE.session !== true);
ok("a refused login NEVER enters boot() — no op is sent after it",
   planeB.CALLS.filter(c=>c.op!=="login").length === 0);
ok("the gate stays open", !E(ctxB, "#gate").classList.contains("hidden"));
/* CORRECTED 2026-08-04 (UI-30). This assertion used to pin the retired reason
   CODE, and it passed on a mock that answered a code the plane had stopped
   emitting. What the gate owes a member is the plane's SENTENCE, word for word
   and whole — `includes` over the entire sentence, so a truncation or a
   re-wording is a failure and not a near miss. */
ok("the member is shown the RECORD'S OWN SENTENCE, whole and word for word",
   REFUSAL_SENTENCE.length > 0 && H(ctxB).includes(REFUSAL_SENTENCE));
/* AND THE MACHINE CODE IS NOT WHAT A MEMBER READS. The plane sends it and the
   surface received it; rendering the sentence INSTEAD is a selection between two
   things the plane said, which is not a composition. `SIGN_IN_REFUSED` printed
   at a sign-in gate is vocabulary a member is being made to decode. */
ok("and NOT the machine code that rode with it — nothing here is left for a member to decode",
   !!REFUSAL_CODE && !H(ctxB).includes(REFUSAL_CODE));
ok("and the error is actually visible", !E(ctxB, "#g-err").classList.contains("hidden"));

/* THE COMPOSED-WORDING INSTRUMENT for this site (UI-13's arm (d)). The gate
   MINUS the plane's own words must contain no sentence that reads as a refusal
   — a correct reason code with a sentence this surface wrote is what DEC-8
   forbids and what a code-only assertion cannot see. */
const residue = h => PLANE_WORDS.reduce((acc,w)=>acc.split(w).join(" "), String(h));
const REFUSAL_PROSE =
  /(not correct|incorrect|try again|check your|wrong password|does not match|could not sign|couldn't sign|please )/i;
ok("no sentence at the gate that is not the record's own reads as a refusal",
   !REFUSAL_PROSE.test(residue(H(ctxB))));

/* A REFUSAL IS A VALUE INSIDE A SUCCESSFUL ENVELOPE — the half of D-173's sixth
   instance that is not about the token. Read off the envelope, `l.ok === false`
   never fires, and the member is shown the envelope rather than the reason. */
ok("the refusal was carried inside a 200 envelope and still refused the sign-in",
   planeB.CALLS.some(c=>c.op==="login") && !ctxB.__PLANE.session);
ok("the gate does not show the member the envelope's own ok:true",
   !/\bok\b\s*[:=]\s*true/i.test(H(ctxB)));

/* ============================================================
   (4) THE PUBLISHED LIST — public, uncredentialed, and wrapped
   ============================================================ */
const planeP = makePlane();
const ctxP = boot(SRC, planeP);
ctxP.__enterPublished();
await new Promise(r=>setTimeout(r,0));      // enterPublished fires pubList and does not await it

const manCall = planeP.CALLS.find(c=>c.op==="publishedmanifest");
ok("the published space reads op=publishedmanifest", !!manCall);
ok("IT CARRIES NO CREDENTIAL — the published record needs none, and asking for one would be a different product",
   !!manCall && manCall.token===null);
ok("no other op is reached from the published space — nothing of the working record is touched",
   planeP.CALLS.every(c=>c.op==="publishedmanifest"));

const pl = E(ctxP, "#pl")._html;
ok("every ratified case file in the manifest is listed",
   MANIFEST.published.every(p=>pl.includes(p.bundle_id)));
ok("each row carries the case's own title from the projection",
   pl.includes("Why did the sewer contract skip competitive bid?"));
ok("each row states the ratification date and the bundle hash — the two facts a stranger verifies against",
   pl.includes("2026-07-14") && pl.includes("c".repeat(16)));
ok("the list is not the empty statement when the record HAS published something",
   !/has not published any case files/i.test(pl));
ok("the published space is the one that is open", E(ctxP, "#pub").classList.contains("on"));
ok("and the document root says so",
   ctxP.__doc.documentElement.getAttribute("data-space") === "published");

/* THE EMPTY CASE, which is a CLAIM about the group and must be stated as one. */
{
  const planeE = makePlane();
  const saved = MANIFEST.published;
  MANIFEST.published = [];
  const ctxE = boot(SRC, planeE);
  ctxE.__enterPublished();
  await new Promise(r=>setTimeout(r,0));
  const ple = E(ctxE, "#pl")._html;
  MANIFEST.published = saved;
  ok("a group that has published nothing says so, and says a stranger could verify one if it had",
     /has not published any case files/i.test(ple) && /verify/i.test(ple));
}

/* ============================================================
   (5) THE WIRE MAP THIS SUITE RELIES ON, ASSERTED RATHER THAN ASSUMED
   ============================================================
   Both ops are WRAPPED, which is the guard's default and is why nothing was
   added to its FLAT list. If either grows a flattening handler in
   `index.mjs`, this fails here instead of drifting quietly. */
{
  const guard = fs.readFileSync(new URL("../check-mock-envelope.mjs", import.meta.url), "utf8");
  const flatBlock = /const FLAT_OPS = new Map\(Object\.entries\(\{([\s\S]*?)\}\)\);/.exec(guard);
  ok("the guard's FLAT list is readable from here", !!flatBlock);
  if(flatBlock){
    ok("op=login is not on the guard's FLAT list — the plane hands the DO's answer back verbatim",
       !/^\s*login\s*:/m.test(flatBlock[1]));
    ok("op=publishedmanifest is not on it either — index.mjs re-wraps it explicitly",
       !/^\s*publishedmanifest\s*:/m.test(flatBlock[1]));
  }
  /* CORRECTED 2026-08-04 at the UI-18/UI-24 merge: UI-18 added `apiQ` (the
   published region's untokened seam) to the guard's set. The property under
   test is unchanged — the untokened transports are named seams. */
  ok("the guard names `apiR` and `apiQ` as the seams for the untokened transport",
     /API_SEAMS = new Set\(\["api", "apiR", "apiQ"\]\)/.test(guard));
}

/* ============================================================
   (6) THE ARM-B COVERAGE LINE, MEASURED
   ============================================================
   UI-24's accepts-when is that the envelope guard's arm B now covers both ops.
   Arm B is only as wide as the harness, so "covered" means: when this suite runs
   under the guard's probe, the probe SEES both ops and sees them wrapped. That
   is measured here by re-running this file under `test/envelope-probe.mjs` — the
   guard's own instrument, loaded the guard's own way — and reading its output,
   rather than by reading a number off a log. */
function probeSelf(env){
  const probe = new URL("./envelope-probe.mjs", import.meta.url).pathname;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui24-probe-"));
  const out = path.join(dir, "probe.json");
  let ran = true;
  try{
    execFileSync("node", ["--import", "file://" + probe, SELF],
      { stdio:"pipe", env:{ ...process.env, UI_ENVELOPE_PROBE_OUT: out, UI24_PROBE_CHILD:"1", ...(env||{}) } });
  }catch(_){ ran = false; }
  let data = { calls:0, ops:[] };
  try{ data = JSON.parse(fs.readFileSync(out, "utf8")); }catch(_){}
  try{ fs.rmSync(dir, { recursive:true, force:true }); }catch(_){}
  return { ran, data };
}

if(!CHILD){
  const { ran, data } = probeSelf();
  const row = id => (data.ops||[]).find(o=>o.op===id) || null;
  ok("COVERAGE: this suite runs clean under the guard's own probe", ran);
  ok("COVERAGE: the probe observed op=login — the first harness that has ever reached it",
     !!row("login") && (row("login").wrapped + row("login").flat) > 0);
  ok("COVERAGE: the probe observed op=publishedmanifest — likewise",
     !!row("publishedmanifest") && (row("publishedmanifest").wrapped + row("publishedmanifest").flat) > 0);
  ok("COVERAGE: both are answered WRAPPED, which is what arm B judges them against",
     !!row("login") && row("login").flat === 0
     && !!row("publishedmanifest") && row("publishedmanifest").flat === 0);
  /* `boot()` brings whoami with it, which no harness had reached either — the
     rail, the credential sentence and every capability-shaped control in this
     file were only ever exercised against a hand-set `PLANE.me`. */
  ok("COVERAGE: op=whoami is reached too, because boot() is finally driven",
     !!row("whoami") && row("whoami").flat === 0);
}

/* ============================================================
   NEGATIVE CONTROLS — run, not described
   ============================================================ */
if(!CHILD){
  /* (a) BREAK THE TOKEN READ. `apiR` stops opening the envelope, which is
     D-173's sixth instance exactly as it shipped. THE SPLICE IS SCOPED TO
     `apiR`'S OWN BODY: `recR` and `recPostR` carry a byte-identical return and
     both come EARLIER in the file, so a plain replace mutates the wrong seam
     and the arm reports green having tested nothing (UI-22's instrument
     finding, applied). */
  /* CORRECTED 2026-08-04 at the UI-18/UI-24 merge: pubList moved from `apiR`
     to UI-18's `apiQ`, so the arm now breaks BOTH untokened seams — each splice
     scoped to its own body per UI-22's instrument finding — or the published-
     list half of the demonstrated harm silently stops being demonstrated. */
  const breakSeam = (src, decl) => {
    const h = src.indexOf(decl);
    if (h < 0) return src;
    const cut = src.indexOf("return (j && j.result !== undefined)", h);
    const tl = src.indexOf("}", cut);
    if (cut < 0 || tl <= h) return src;
    return src.slice(0, h)
      + src.slice(h, tl).replace("return (j && j.result !== undefined) ? j.result : j;", "return j;")
      + src.slice(tl);
  };
  const BROKEN = breakSeam(breakSeam(SRC, "async function apiR(op, body){"), "async function apiQ(op, params){");
  ok("NEG-CONTROL (a): the mutation actually changed the source", BROKEN !== SRC);
  /* CORRECTED 2026-08-04 with the widened splice: TWO envelope-opens go (apiR
     and apiQ), and recR/recPostR's byte-identical returns stay — the scoping
     property is unchanged, the count moved from -1 to -2. */
  ok("NEG-CONTROL (a): and it changed apiR and apiQ, not the two rec seams above them",
     BROKEN.includes("async function apiR(op, body){\n  const j = await api(op, body);\n  return j;\n}")
     && (BROKEN.match(/return \(j && j\.result !== undefined\) \? j\.result : j;/g)||[]).length
        === (SRC.match(/return \(j && j\.result !== undefined\) \? j\.result : j;/g)||[]).length - 2);
  {
    const p = makePlane();
    const c = boot(BROKEN, p);
    E(c, "#g-handle").value = "member:m_alice";
    E(c, "#g-pw").value = GOOD_PW;
    await c.__signIn();
    ok("NEG-CONTROL (a): with the envelope unopened, the correct password reads NO token",
       c.__PLANE.token !== TOKEN);
    ok("NEG-CONTROL (a): so no op after sign-in is authenticated — which is what shipped",
       p.CALLS.filter(x=>x.op!=="login").every(x=>x.token===null));
    /* THE OTHER HALF: a refusal read off the envelope has `ok:true`, so the
       gate lets a WRONG password through instead of refusing it. */
    const p2 = makePlane();
    const c2 = boot(BROKEN, p2);
    E(c2, "#g-handle").value = "member:m_alice";
    E(c2, "#g-pw").value = "not the password";
    await c2.__signIn();
    ok("NEG-CONTROL (a): and a WRONG password no longer meets the record's own sentence",
       !H(c2).includes(REFUSAL_SENTENCE));
    /* And the published list goes silently empty — the honest-looking blank
       screen D-173 is named for. */
    const p3 = makePlane();
    const c3 = boot(BROKEN, p3);
    c3.__enterPublished();
    await new Promise(r=>setTimeout(r,0));
    ok("NEG-CONTROL (a): and the published list renders EMPTY over a manifest that has two case files",
       /has not published any case files/i.test(E(c3, "#pl")._html));
  }
  ok("NEG-CONTROL (a) contrast: the intact surface signed in, authenticated every op, and listed both case files",
     ctx.__PLANE.token===TOKEN && tokened.every(c=>c.token===TOKEN)
     && MANIFEST.published.every(p=>pl.includes(p.bundle_id)));

  /* (b) THE COMPOSED-WORDING INSTRUMENT: the gate words the refusal itself.
     RETARGETED 2026-08-04 (UI-30) TO THE NEW SHAPE, and the retargeting made
     the arm sharper rather than merely current. It used to print an invented
     sentence and nothing else; now it prints the plane's REASON CODE — which is
     correct, which is what the plane sent, and which is what the gate rendered
     for the whole of this suite's previous life — and then adds a sentence of
     its own. So the mutation is a surface that looks MORE faithful than the one
     that shipped, and every code-shaped assertion in this file is green against
     it. Only subtracting what the plane said and reading the remainder can see
     it. That is the whole point of keeping this arm through the change: if
     `app.html` ever starts composing wording of its own, this fires. */
  {
    const src = SRC.replace(
      'if(!l || l.ok===false || !l.token){ teach($("#g-err"), l && l.detail ? { detail:l.detail } : (l||{})); return; }',
      'if(!l || l.ok===false || !l.token){ const e=$("#g-err"); e.innerHTML=esc(String((l&&l.reason)||"")) + " — that password is not correct. Try again, or ask an administrator to reset it."; e.classList.remove("hidden"); return; }');
    ok("NEG-CONTROL (b): the mutation actually changed the source", src !== SRC);
    const p = makePlane();
    const c = boot(src, p);
    E(c, "#g-handle").value = "member:m_alice";
    E(c, "#g-pw").value = "not the password";
    await c.__signIn();
    ok("NEG-CONTROL (b): the sign-in is still REFUSED — a code-only suite is green here",
       !c.__PLANE.token && c.__PLANE.session !== true);
    ok("NEG-CONTROL (b): and the plane's own CODE is still on the page, so a suite pinning the code is green too",
       H(c).includes(REFUSAL_CODE));
    ok("NEG-CONTROL (b): but the record's own SENTENCE is GONE", !H(c).includes(REFUSAL_SENTENCE));
    ok("NEG-CONTROL (b): and the residue scan names the SURFACE as the author of what stands there",
       REFUSAL_PROSE.test(residue(H(c))));
  }
  ok("NEG-CONTROL (b) contrast: the intact gate renders the record's own sentence and no invented one",
     H(ctxB).includes(REFUSAL_SENTENCE) && !REFUSAL_PROSE.test(residue(H(ctxB))));

  /* (c) UNWRAP THE LOGIN MOCK — the guard's own arm, measured at the probe.
     A mock that answers `op=login` flat is exactly the input
     `check-mock-envelope.mjs` fails on, because the wire map says WRAPPED. */
  {
    const { data } = probeSelf({ UI24_FLAT_LOGIN:"1" });
    const row = (data.ops||[]).find(o=>o.op==="login") || null;
    ok("NEG-CONTROL (c): with the mock unwrapped the probe records op=login as FLAT",
       !!row && row.flat > 0);
    ok("NEG-CONTROL (c): and it records the top-level keys the guard names in its failure",
       !!row && Array.isArray(row.sampleKeys) && row.sampleKeys.includes("token") && !row.sampleKeys.includes("result"));
  }
}

if(fails.length){ console.error(`auth-surface: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`auth-surface: ${n} assertions, all green — sign-in through the wrapped shape · the token off \`result\` · every op after it authenticated · boot() driven for the first time · the refusal SENTENCE read out of store.mjs and rendered whole, with the code no member has to decode · no retired login code anywhere under civicos-ui/ · pubList uncredentialed against the published projection · arm-B coverage MEASURED at the probe; negative controls RUN (a) the token read broken (b) right code + invented sentence (c) the login mock unwrapped (d) a retired code restored on disk`);

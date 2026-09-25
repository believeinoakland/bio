/* d628-promoted-fields.control.mjs — D-628's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED
 * COPIES of `src/` and runs `test/d628-promoted-fields.test.mjs` against each (D628_SRC), so the battery must not
 * discover it. The real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d628-promoted-fields.control.mjs [arm]      from bio-plane/
 *
 * Each arm's anchor must occur EXACTLY ONCE in the copy (an arm that did not arm is a finding, not a pass), and what
 * it MUST fail and MUST NOT fail is declared below, before it runs. Output goes to a FILE (D-282), the tally is read
 * from the suite's own foot line, and a missing foot reads -1. D-578's driver is the model.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "d628-promoted-fields.test.mjs");
const REAL = ["src/store.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const CARRY = "        if (promotedState === undefined) promotedState = carriedFields.current_state = cur.current_state;";
const REFUSE = "      if (!cur) {\n        const unstated = [";
const SAYS = "        ...(Object.keys(carriedFields).length ? { fields_carried: { fields: carriedFields, from: \"head\",";
const FALLBACK = "    let promotedState = documentState ?? envelopeState ?? undefined;";
const FILTER = "[\"last_updated\", promotedLastUpdated]].filter(([, v]) => v === undefined).map(([k]) => k);";

const CREATE = ["CREATION stating no current_state is REFUSED", "CREATION stating no created is REFUSED",
                "CREATION stating no last_updated is REFUSED", "stating NONE of the three is refused once",
                "catalogue's check and its canned translation", "its detail says nothing was written",
                "BLANK or NON-STRING values is refused", "STRING meta over a document with no created is REFUSED"];
const REVISE_STATE = ["REVISION stating no current_state LANDS", "(current_state) and the answer SAYS",
                      "(current_state) and the row still holds"];
const REVISE = [...REVISE_STATE, "REVISION stating no created LANDS", "(created) and the answer SAYS",
                "(created) and the row still holds", "REVISION stating no last_updated LANDS",
                "(last_updated) and the answer SAYS", "(last_updated) and the row still holds",
                "STRING meta over a document with no state or last_updated CARRIES"];
const OVER = ["DOCUMENT states all three lands with NO fields_carried", "revision whose DOCUMENT states all three",
              "creation whose ENVELOPE alone states all three", "revision whose ENVELOPE alone states all three",
              "STRING meta over a COMPLETE document lands"];
const STACK = "carries a raw error with a stack";

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: [...CREATE, ...REVISE, ...OVER, STACK] },

  /* THE ROW'S CONTROL: remove the pre-write check. A creation stating a field nowhere reaches the INSERT and reads the
     raw NOT NULL stack again; every revision and over-strictness arm must stay green, and nothing lands (REC-180). */
  "no-creation-refusal": {
    patches: [[REFUSE, "      if (false) {\n        const unstated = ["]],
    /* RE-DECLARED 2026-09-25 at the c23-batch30 union (CONDUCT #23), never exempted: STACK leaves mustFail here and in
       no-state-carry. D-629 (C-69.3 STORE_INTERNAL_ERROR / C-69.4 PLANE_INTERNAL_ERROR, merged beside D-628) answers a
       store that THREW with a named code and no stack, so the raw NOT NULL error these arms re-expose reaches the caller
       as STORE_INTERNAL_ERROR and §5's "no answer carries a stack" arm stays green under them; every named CREATE/REVISE
       arm still fails as declared (the union's run: 27/8 and 31/4). STACK is asserted in NEITHER list for these arms. */
    mustFail: [...CREATE],
    mustPass: [...REVISE, ...OVER, "and nothing is held under that id"] },

  /* The revision half: drop the state's carry. The stateless revisions read the raw NOT NULL error; the date carries,
     the creations and the over-strictness arms are untouched. */
  "no-state-carry": {
    patches: [[CARRY, "        if (false) promotedState = carriedFields.current_state = cur.current_state;"]],
    mustFail: [...REVISE_STATE, "STRING meta over a document with no state or last_updated CARRIES"],  /* STACK: see no-creation-refusal */
    mustPass: [...CREATE, ...OVER, "REVISION stating no created LANDS", "REVISION stating no last_updated LANDS"] },

  /* SILENT CARRY: the values are carried and the answer does not say so. Only the arms reading `fields_carried` fail. */
  "silent-carry": {
    patches: [[SAYS, "        ...(false ? { fields_carried: { fields: carriedFields, from: \"head\","]],
    mustFail: ["(current_state) and the answer SAYS", "(created) and the answer SAYS", "(last_updated) and the answer SAYS",
               "STRING meta over a document with no state or last_updated CARRIES"],
    mustPass: ["REVISION stating no current_state LANDS", "(current_state) and the row still holds", ...CREATE, ...OVER, STACK] },

  /* D-563's OLD FALLBACK for the state: the envelope's raw `current_state` is taken, so a BLANK one is a state. The
     blank-envelope creation is then refused naming two fields, not three — the state '  ' was taken as stated. */
  "raw-fallback": {
    patches: [[FALLBACK, "    let promotedState = documentState ?? (envelopeMeta ? envelopeMeta.current_state : undefined);"]],
    mustFail: ["BLANK or NON-STRING values is refused"],
    mustPass: [...REVISE, ...OVER, "CREATION stating no current_state is REFUSED", STACK] },

  /* OVER-STRICTNESS: the same rule in a spelling this item did not anticipate — everything stays green. */
  spelling: {
    patches: [[CARRY, "        if (promotedState == null) promotedState = carriedFields.current_state = cur.current_state;"],
              [FILTER, "[\"last_updated\", promotedLastUpdated]].filter((p) => typeof p[1] !== \"string\" || !p[1]).map((p) => p[0]);"]],
    mustFail: [],
    mustPass: [...CREATE, ...REVISE, ...OVER, STACK] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d628-control-${name}-`));
  cpSync(join(PLANE, "src"), join(root, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
  const storePath = join(root, "bio-plane", "src", "store.mjs");
  let s = readFileSync(storePath, "utf8");
  const counts = arm.patches.map(([from]) => s.split(from).length - 1);
  for (const [from, to] of arm.patches) s = s.replace(from, () => to);
  writeFileSync(storePath, s);
  const log = join(root, "suite.log"), fd = openSync(log, "w");
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, stdio: ["ignore", fd, fd],
    env: { ...process.env, D628_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d628-promoted-fields: (\d+) passed, (\d+) failed/);
  const failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
  const passed = [...out.matchAll(/^  PASS  (.*)$/gm)].map((m) => m[1]);
  const armed = counts.every((c) => c === 1);
  const asDeclared = armed && !!foot
    && arm.mustFail.every((l) => failed.some((f) => f.includes(l)))
    && arm.mustPass.every((l) => passed.some((p) => p.includes(l)))
    && (name !== "baseline" || (r.status === 0 && failed.length === 0));
  console.log(`\n=== ${name}: anchors ${JSON.stringify(counts)}${armed ? "" : " — DID NOT ARM"} · exit ${r.status} · `
    + `${foot ? `${foot[1]} pass / ${foot[2]} fail` : "NO FOOT (-1)"} · ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  for (const f of failed) console.log(`    FAIL  ${f}`);
  return asDeclared;
};

const before = digest();
console.log("real sources before:\n  " + before.join("\n  "));
const names = process.argv[2] ? [process.argv[2]] : Object.keys(ARMS);
const results = names.map((n) => [n, run(n)]);
const after = digest();
const untouched = JSON.stringify(before) === JSON.stringify(after);
console.log(`\nreal sources after: ${untouched ? "UNCHANGED" : "CHANGED:\n  " + after.join("\n  ")}`);
const ok = untouched && results.every(([, v]) => v);
console.log(`${results.filter(([, v]) => v).length}/${results.length} arms AS DECLARED`);
process.exit(ok ? 0 : 1);

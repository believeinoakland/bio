/* op-claims-ledger: the MAIN half of the op-claims ledger (M0-116).
 *
 * WHY THIS IS A MODULE OF ITS OWN, and it is a measurement rather than tidiness. `tools/gates.mjs` selects the units
 * a change must re-run by what their files NAME, and a file a unit imports is read as code, strings kept, because a
 * path is a string. This list names 18 repository files as strings — `docs/development/MEASUREMENTS.md` among them —
 * and it lived in `op-claims.mjs`, which 38 units reached (most through `tools/coord.mjs`, whose LC-op-claims check
 * imports it; measured by `gates.mjs --explain`, 2026-09-22), so every one of them read as a reader of every file the ledger names: a
 * MEASUREMENTS-only landing re-ran them all (BOB #27, measured 2026-09-22). They read the dispatch table or the
 * state half of the ledger; they never read these files. ONLY `test/op-claims.test.mjs` imports this module, and
 * it is the one unit that sweeps the whole tree against it — so it stays the reader of every file named here, and
 * gates says so. DO NOT IMPORT THIS FROM ANYWHERE ELSE: an import is an input, and every importer inherits the whole
 * list as one.
 *
 * `sweep()` in `./op-claims.mjs` takes the ledger it holds a walk to as its `ledger` argument; it no longer
 * defaults to this list (it cannot, without importing it). The state half stays in `./op-claims.mjs` as
 * `LEDGER_STATE`, where `tools/coord.mjs` LC-op-claims reads it; `LEDGER` below is the whole ledger, both halves. */

import { LEDGER_STATE } from "./op-claims.mjs";

/* THE LEDGER. Every (file, name) where prose names something that is not an op, with
 * a human's reason and an EXACT count. A pair that is not here FAILS; a count that
 * MOVES in either direction fails and the run prints the number to write.
 *
 * Exact, not a ceiling, and the reasoning is `REGISTER_FLOOR`'s: a ceiling is not a
 * ratchet. A ledger that permitted a count to fall silently would let a real
 * correction go unrecorded and would leave slack for the next wrong sentence to
 * occupy. The cost is a one-line edit when a document legitimately changes, and the
 * failure message carries the replacement number.
 *
 * `bio-plane/**` IS DELIBERATELY ALMOST EMPTY HERE. M0-12 CORRECTED the plane's own
 * wrong-level prose rather than registering it, so the plane's corpus is clean and
 * anything new in it is a hard failure. What remains under `bio-plane/` is prose
 * whose SUBJECT is a non-op: fixtures that drive a deliberately unknown op, and
 * comments about DO paths reached past the control plane on purpose.
 */
export const LEDGER_MAIN = [
  /* ---- bio-plane: fixtures whose whole point is an op that is not there ---- */
  { file: "bio-plane/test/bounds.test.mjs", name: "ncsecond", n: 1, kind: "NEVER",
    why: "a negative-control label naming a planted op that must not resolve." },
  { file: "bio-plane/test/installer.test.mjs", name: "nonsense", n: 1, kind: "NEVER",
    why: "the fixture that asserts an unknown op 400s rather than serving the page. The name MUST NOT exist." },
  { file: "bio-plane/test/limits-probe.mjs", name: "sqlprobe", n: 1, kind: "NEVER",
    why: "the probe states in terms that this op does not exist and must not: the store executes compiled statements only." },
  { file: "bio-plane/test/repair-reachability.test.mjs", name: "unverify", n: 1, kind: "NEVER",
    why: "arm (v) plants an op the control plane never declared, and asserts the walk fires on it as a delta." },
  { file: "bio-plane/test/capability.test.mjs", name: "get", n: 1, kind: "NEVER",
    why: "the recorded vacuity of an earlier control — it asked an op that does not exist, so it passed for every input." },

  /* ---- bio-plane: DO paths named as ops in prose ABOUT reaching past the door ---- */
  { file: "bio-plane/test/bias.test.mjs", name: "gatefacts", n: 1, kind: "DO-PATH",
    why: "the comment's own subject is that this is NOT a control-plane op and a caller gets `unknown op`." },
  { file: "bio-plane/test/machine-fences.test.mjs", name: "taskenqueue", n: 1, kind: "DO-PATH",
    why: "the comment says there is no control-plane route and the fixture reaches past the door deliberately." },
  { file: "bio-plane/test/inbox.test.mjs", name: "taskenqueue", n: 1, kind: "DO-PATH",
    why: "the assertion IS that this name is not a control-plane op; the label quotes the name the caller would send." },

  /* ---- civicos-ui: not this item's paths. DELEGATED, see CLAIMS.md ---- */
  { file: "civicos-ui/app.html", name: "strength", n: 1, kind: "DO-PATH",
    why: "UI-35's measured gap: the comment states this exists in the store's route map and is absent from OPS. Correct in substance, wrong in grammar. DELEGATED to UI." },
  { file: "civicos-ui/app.html", name: "basis", n: 1, kind: "DO-PATH",
    why: "same sentence as `strength` above. DELEGATED to UI." },

  /* ---- docs: planning surface. Owners are elsewhere; every one DELEGATED ---- */
  { file: "docs/BIO_DATAPLANE_STATE.md", name: "get", n: 2, kind: "NEVER",
    why: "the historical record of the vacuous control (see capability.test.mjs). The op never existed and the record is about that." },
  { file: "docs/SESSION-KICKOFF.md", name: "get", n: 1, kind: "NEVER",
    why: "same historical record, carried into the kickoff." },
  { file: "docs/development/INTERFACE-CHANGES.md", name: "publishcase", n: 2, kind: "DO-PATH",
    why: "IC-22's struck sentence AND the CORRECTION appended to it — BOTH name the op one level down. Amending a SETTLED IC is a protocol act with an owner. DELEGATED to CONDUCT." },
  { file: "docs/development/INTERFACE-CHANGES.md", name: "inboxlist", n: 1, kind: "DO-PATH",
    why: "an IC naming the DO path as an op. Same protocol constraint. DELEGATED to CONDUCT." },
  { file: "docs/development/INTERFACES.md", name: "publishcase", n: 1, kind: "DO-PATH",
    why: "the interface register naming the DO path as an op. DELEGATED to CONDUCT." },
  { file: "docs/development/INTERFACES.md", name: "reindexnames", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/MEASUREMENTS.md", name: "publishcase", n: 2, kind: "DO-PATH",
    why: "REC-58's measurement rows. MEASUREMENTS is a dated record of what was measured and is not rewritten. DELEGATED to CONDUCT." },
  { file: "docs/development/MEASUREMENTS.md", name: "inboxlist", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/kickoffs/CAPTURE.md", name: "recordsourceoutcome", n: 1, kind: "DO-PATH",
    why: "the area kickoff naming a DO path as an op. DELEGATED to CAPTURE." },
  { file: "docs/archive/research/COMPLETENESS-AUDIT.md", name: "import", n: 1, kind: "NEVER",
    why: "the audit's finding that no import op exists. Must stay absent." },
  { file: "docs/archive/research/COMPLETENESS-AUDIT.md", name: "restore", n: 1, kind: "NEVER",
    why: "same finding, same sentence. Must stay absent." },
  { file: "docs/archive/research/SB-EVIDENCE.md", name: "capturelimit", n: 1, kind: "DO-PATH",
    why: "a research inventory of STORE routes written with an `op=` prefix. DELEGATED to RECORD/research." },
  { file: "docs/archive/research/SB-EVIDENCE.md", name: "loadcapturesession", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/archive/research/SB-EVIDENCE.md", name: "reusedparts", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/archive/research/SB-EVIDENCE.md", name: "siteassets", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/archive/research/SB-EVIDENCE.md", name: "taskenqueue", n: 1, kind: "DO-PATH", why: "as above." },
  /* DATA-MODEL.md's table is the single largest instance of the class in the tree:
     a whole column documenting the store's route map with an `op=` prefix that
     reaches none of it. Registered site by site so the extent is VISIBLE rather
     than folded into one line, and DELEGATED whole to RECORD/research. */
  { file: "docs/development/research/DATA-MODEL.md", name: "gatefacts", n: 1, kind: "DO-PATH", why: "DATA-MODEL's route table. DELEGATED to RECORD/research." },
  { file: "docs/development/research/DATA-MODEL.md", name: "setpassword", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "inboxlist", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "recordcapturelimit", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "capturelimit", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "recordsiteassets", n: 3, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "siteassets", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "sitechrome", n: 2, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "reusedparts", n: 2, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "savecapturesession", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "loadcapturesession", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "recordlinks", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "resolvelinks", n: 2, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "linksto", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "recordlinkverdict", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "recordcapturedlocator", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "recordreuseverdicts", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "reuseverdicts", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "recordsourceoutcome", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "governoradmit", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "recordruntime", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "runtimeobservations", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "recordcpuprobestep", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "cpuprobestate", n: 1, kind: "DO-PATH", why: "as above." },
  { file: "docs/development/research/DATA-MODEL.md", name: "taskenqueue", n: 1, kind: "DO-PATH", why: "as above." },
  /* The two in DATA-MODEL.md that are in NEITHER table — genuine rot rather than a
     level confusion, found by this instrument on its first run. */
  { file: "docs/development/research/DATA-MODEL.md", name: "session", n: 1, kind: "NEVER",
    why: "STALE: names neither an op nor a DO path. The session read is `op=whoami`. DELEGATED to RECORD/research." },
  { file: "docs/development/research/DATA-MODEL.md", name: "wake", n: 1, kind: "NEVER",
    why: "STALE: names neither an op nor a DO path. DELEGATED to RECORD/research." },
];

/* The whole ledger, both halves: what `test/op-claims.test.mjs` floors on (`LEDGER.length >= 20`) and prints. */
export const LEDGER = [...LEDGER_MAIN, ...LEDGER_STATE];

/* D-323 / D-324 — THE PLANE MOCK'S `op=suggest` BRANCH, DERIVED FROM THE PLANE.
 *
 * WHY THIS FILE EXISTS, and it is the same class `plane-meaning.mjs` (D-276) was
 * built for, measured a second time and this time against a DEPLOYED plane.
 *
 * Until 2026-09-13 both of this member's `op=suggest` mocks answered
 * **`{ wrote: true }` for ANY `name`, ANY `kind`, ANY `level` and ANY
 * `description`**, running one staged predicate the suite handed them. So the
 * catalogue had never seen the candidate the run harness actually composes, and
 * three arms across two suites asserted that candidate LANDS. VF-4 drove the
 * real endpoint at 0.57.0 and it does not (MEASUREMENTS M-8):
 *
 *   - `name: "level-empty:<level>"` — a COLON, which `VERSION_NAME_RE` has never
 *     admitted — refused **`BASIS_REFUSED`, finding C-25.2, `wrote: false`**.
 *   - `kind: "new-version"` — not one of §9's five — refused
 *     **`SUGGEST_UNKNOWN_KIND` / C-27.3**.
 *   - a candidate carrying `description: null` — refused **`SUGGEST_BOILERPLATE`
 *     / C-27.12**.
 *
 * and a fourth this file's own derivation found, which no live run had reached:
 *
 *   - `level: "document"` — the run's log spelling, not `SUGGEST_LEVELS`' — is
 *     refused **`SUGGEST_EMPTY_LEVEL_UNSTATED` / C-27.6**, at a DIFFERENT check
 *     several screens before the one D-323 was filed on.
 *
 * **A fixture that says yes to everything is not a test double; it is a
 * guarantee that nothing is tested** — D-276's sentence, and it held for a
 * second endpoint. Fixing the harness without fixing the fixture would leave the
 * NEXT wrong spelling equally invisible, which is why the item is both halves.
 *
 * IT IS DERIVED, NEVER TYPED, AND THAT IS THE WHOLE DESIGN. The kind set comes
 * from `SUGGEST_KINDS`, the level set from `SUGGEST_LEVELS`, the name grammar
 * from `VERSION_NAME_RE`, the placeholder roster from `BOILERPLATE_FORMS` and
 * **the placeholder predicate from `isBoilerplate`'s OWN SOURCE TEXT** — all in
 * the plane's files, none of them re-typed here. A hand copy would agree with
 * the member for free, which this project has now measured at least six times;
 * a derivation cannot. Rename a kind in `bio-checks.mjs` and this fixture
 * changes with it while the member's constant does not, and the suite goes red.
 *
 * IT REPRODUCES **WHERE** THE REFUSAL SITS, which is not where a reader expects
 * and is `plane-meaning.mjs`'s measured finding re-used: a refused submission
 * answers **HTTP 200** with a **top-level `ok: true`**, the refusal nested inside
 * `result` with `wrote: false`. A mock refusing at the envelope would be a
 * fixture for a plane that does not exist.
 *
 * ---- WHAT THIS MOCK CAN AND CANNOT SEE, STATED RATHER THAN IMPLIED ----------
 *
 * IT HOLDS: the closed kind set (C-27.3), the empty-level vocabulary (C-27.6),
 * the placeholder predicate over `description` (C-27.12), the version-name
 * grammar (C-25.2, as `promote`'s `BASIS_REFUSED` with a `findings` array,
 * because that is where the real refusal is raised and what shape it arrives in)
 * and the description floor (C-25.1, same place).
 *
 * IT DOES NOT HOLD, and a suite must not read a green here as evidence of any of
 * them: the viewer gate, the run's existence (C-27.4), name uniqueness against a
 * real document (C-27.5), the leg-reachability walk (C-27.8), the strength pair
 * and partition arithmetic (C-27.9), the independence trace (C-27.10), the
 * substance comparison against existing versions (C-27.7), the single-part
 * licence (C-27.13's structural half), the frontmatter grammar, or anything
 * `promote` does to a document. Those need a real store; `bio-plane/test/`'s own
 * `suggest.test.mjs` is where they are driven, and the live instrument is
 * `bio-plane/test/vf4-suggestprobe.mjs`. **This branch closes the VOCABULARY,
 * not the endpoint.**
 *
 * NOT a `.test.mjs`: the battery discovers suites by that suffix, and this is an
 * instrument the suites share, not a suite.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  VERSION_NAME_RE, SUGGEST_KINDS, SUGGEST_LEVELS, SUGGEST_CHECKS,
  BASIS_VERSION_CHECKS, BOILERPLATE_FORMS, isBoilerplate,
} from "../../bio-plane/checks/bio-checks.mjs";

/** The wire's real vocabulary, read out of the plane's catalog. Exported so a
 *  suite asserts against the PLANE rather than against this file's opinion. */
export const WIRE_KINDS = Object.keys(SUGGEST_KINDS);
export const WIRE_LEVELS = [...SUGGEST_LEVELS];
export const WIRE_NAME_RE = VERSION_NAME_RE;
/** `isBoilerplate` itself, so a suite can ask the plane's own predicate. */
export const wireIsBoilerplate = isBoilerplate;
/** `promote`'s description floor, the one figure C-25.1 turns on — READ OUT OF
 *  THE CHECK'S OWN SOURCE LINE rather than typed. A hand-carried number in a
 *  file nobody re-measures goes stale silently, which is this project's
 *  most-repeated finding; moving the floor in `bio-checks.mjs` moves this, and a
 *  floor that stops being expressible this way THROWS here rather than quietly
 *  reverting to a number this file made up. */
const CHECKS_SRC = readFileSync(
  fileURLToPath(new URL("../../bio-plane/checks/bio-checks.mjs", import.meta.url)), "utf8");
export const DESCRIPTION_MIN = (() => {
  const m = CHECKS_SRC.match(/v\.description\s*!==\s*'string'\s*\|\|\s*v\.description\.trim\(\)\.length\s*<\s*(\d+)/);
  if (!m) throw new Error(
    "plane-suggest.mjs: C-25.1's description floor is no longer readable from bio-checks.mjs. "
    + "The mock will NOT substitute a number of its own — re-derive it at this site.");
  return Number(m[1]);
})();

/** The catalog rows this branch answers with — code, C-number, translation, all
 *  verbatim from the plane. Named here so the suites can assert the mock handed
 *  back the row the catalog holds and not a hand-typed lookalike. */
export const WIRE_CHECKS = {
  SUGGEST_UNKNOWN_KIND: SUGGEST_CHECKS.SUGGEST_UNKNOWN_KIND,
  SUGGEST_EMPTY_LEVEL_UNSTATED: SUGGEST_CHECKS.SUGGEST_EMPTY_LEVEL_UNSTATED,
  SUGGEST_BOILERPLATE: SUGGEST_CHECKS.SUGGEST_BOILERPLATE,
  SUGGEST_UNWRITABLE_STATE: SUGGEST_CHECKS.SUGGEST_UNWRITABLE_STATE,
  VERSION_NAME_NOT_UNIQUE: BASIS_VERSION_CHECKS.VERSION_NAME_NOT_UNIQUE,
  VERSION_NO_DESCRIPTION: BASIS_VERSION_CHECKS.VERSION_NO_DESCRIPTION,
};

const row = (code) => ({ code, reason: code, check: WIRE_CHECKS[code].check,
                         translation: WIRE_CHECKS[code].translation });

/** The `op=suggest` branch, as source, for a plane mock running in workerd.
 *
 *  `opts.f10` emits the F10 half — the stored-refusal replay keyed on the
 *  canonical submission, and the staged `CFG.refuse` / `CFG.boilerplate` hooks
 *  the suite uses to put a named refusal in front of a named candidate. A mock
 *  with no refusal store passes `f10: false` and gets the vocabulary gate alone.
 *
 *  The branch expects the mock's own `op`, `body`, `S` and (when `f10`) `CFG`
 *  and `canon` locals, which both mocks already have.
 *
 *  THE ORDER IS THE PLANE'S ORDER, not a convenient one, because which refusal a
 *  caller gets is what the F10 row routes on: the two `is-suggest-shape` refusals
 *  that fire before a submission can be keyed are NOT stored (the real endpoint
 *  returns them without `remember`), then the F10 replay, then the checks that
 *  are stored, then `promote`'s document gate last. */
export const suggestBranch = ({ f10 = false } = {}) => `
    /* D-323/D-324: DERIVED FROM THE PLANE'S OWN CATALOG by test/plane-suggest.mjs.
       This branch answers the WIRE'S vocabulary — the closed kind set, the
       level spelling, the placeholder predicate and the version-name grammar —
       in the plane's own words, its own C-numbers and (measured) its own PLACE:
       HTTP 200, envelope \`ok\` TRUE, the refusal inside \`result\`, wrote false.
       What it deliberately does NOT hold is listed in that file's header. */
    if (op === "suggest") {
      const WIRE_KINDS = ${JSON.stringify(WIRE_KINDS)};
      const WIRE_LEVELS = ${JSON.stringify(WIRE_LEVELS)};
      const NAME_RE = new RegExp(${JSON.stringify(VERSION_NAME_RE.source)}, ${JSON.stringify(VERSION_NAME_RE.flags)});
      const BOILERPLATE_FORMS = ${JSON.stringify(BOILERPLATE_FORMS)};
      /* THE PLANE'S OWN PREDICATE, BY ITS OWN SOURCE TEXT — not a second
         implementation of the same rule. IS-6's C-22.4 control left its suite
         green at 98 of 98 because a rule had two implementations and either one
         absorbed the control; this is that lesson applied to a fixture. */
      const isBoilerplate = ${isBoilerplate.toString()};
      const refused = (r, extra) => Response.json({ ok: true, result: {
        ok: false, wrote: false, evaluated: true, repeated: false,
        code: r.code, reason: r.reason, check: r.check, translation: r.translation, ...extra,
      } });

      const nm = String((body && body.name) != null ? body.name : "").trim();
      const kd = String((body && body.kind) != null ? body.kind : "").trim();

      /* is-suggest-shape, and NOT stored: the real endpoint returns these two
         before a submission can be keyed to a target. */
      if (!WIRE_KINDS.includes(kd))
        return refused(${JSON.stringify(row("SUGGEST_UNKNOWN_KIND"))},
          { detail: "'" + (kd || "(none)") + "' is not one of \\u00a79's kinds: " + WIRE_KINDS.join(", ") + ".",
            kinds: WIRE_KINDS });
      if (kd === "level-empty" && !(WIRE_LEVELS.includes(String((body && body.level) || ""))
                                   && String((body && body.observed_at) || "").trim() !== ""))
        return refused(${JSON.stringify(row("SUGGEST_EMPTY_LEVEL_UNSTATED"))},
          { detail: "kind=level-empty carries level=<" + WIRE_LEVELS.join("|") + "> and observed_at=<the "
              + "observation-log address of the search that establishes it>.",
            levels: WIRE_LEVELS, level: (body && body.level) || null });
${f10 ? `
      const sub = canon(body || {});
      const prior = S.refusals.get(sub);
      if (prior) {
        /* F10, THE PLANE'S HALF: the stored refusal comes back WITHOUT the
           checks being re-run, and the counter climbs. Nothing else moves. */
        prior.repeats += 1;
        return Response.json({ ok: true, result: { ...prior.payload, repeated: true, evaluated: false,
                                                   wrote: false, repeats: prior.repeats } });
      }
      const remember = (r, extra) => {
        const payload = { ok: false, wrote: false, code: r.code, reason: r.reason,
                          check: r.check, translation: r.translation, ...extra };
        S.refusals.set(sub, { payload, repeats: 0 });
        return Response.json({ ok: true, result: { ...payload, repeated: false, evaluated: true } });
      };
` : `
      const remember = (r, extra) => Response.json({ ok: true, result: {
        ok: false, wrote: false, evaluated: true, repeated: false,
        code: r.code, reason: r.reason, check: r.check, translation: r.translation, ...extra } });
`}
      /* is-suggest-checks, CHECK 5 — the placeholder predicate, on the FIELD.
         Refusing on the offending FIELD rather than on the version's NAME is
         load-bearing for the F10 arm: the first spelling of this mock refused by
         NAME, so a submission whose description had been properly rewritten was
         refused again for a reason the adjustment could never answer. */
      if (isBoilerplate((body || {}).description))
        return remember(${JSON.stringify(row("SUGGEST_BOILERPLATE"))},
          { detail: "description carries filler rather than an account of anything.", fields: ["description"] });
${f10 ? `
      /* THE SUITE'S STAGED REFUSAL, kept: a suite still needs to put a named
         refusal in front of a named candidate to drive F10's two halves. What it
         may no longer do is stage a SUCCESS the wire would refuse. The catalog
         row is LOOKED UP by code rather than typed — the old mock answered every
         staged refusal with C-27.13's number and C-27.13's translation whatever
         code it was asked for, so a SUGGEST_BOILERPLATE refusal arrived wearing
         SUGGEST_UNWRITABLE_STATE's C-number (corrected 2026-09-13, D-324). */
      const ROWS = ${JSON.stringify(Object.fromEntries(Object.keys(WIRE_CHECKS).map((c) => [c, row(c)])))};
      const staged = (CFG.boilerplate || []).includes(String(((body || {}).description) ?? ""))
        ? "SUGGEST_BOILERPLATE"
        : (CFG.refuse || {})[nm];
      if (staged && ROWS[staged]) return remember(ROWS[staged], {});
` : ""}
      /* promote's DOCUMENT GATE, last, and the two rows of it that are about the
         version's own name and description. This is where C-25.2 is raised and
         it arrives as \`BASIS_REFUSED\` carrying a \`findings\` array — the
         endpoint returns promote's refusal UNWRAPPED, which is the shape VF-4
         read off the live plane. */
      const bf = [];
      if (!nm || !NAME_RE.test(nm))
        bf.push({ check: ${JSON.stringify(WIRE_CHECKS.VERSION_NAME_NOT_UNIQUE.check)},
                  detail: "basis_versions[0].name '" + nm + "' is not a version name: 1 to 64 characters "
                    + "of letters, digits, spaces, '-', '_' and '.'", repairs: [] });
      if (!(typeof ((body || {}).description) === "string"
            && String((body || {}).description).trim().length >= ${DESCRIPTION_MIN}))
        bf.push({ check: ${JSON.stringify(WIRE_CHECKS.VERSION_NO_DESCRIPTION.check)},
                  detail: "basis_versions[0] ('" + nm + "') carries no description", repairs: [] });
      if (bf.length) {
        /* The translation is the row for the FIRST finding, looked up by
           C-number — never one row's words standing in for another's, which is
           the defect this branch replaces one refusal family over. */
        const BY_CHECK = ${JSON.stringify(Object.fromEntries(
          [["VERSION_NAME_NOT_UNIQUE"], ["VERSION_NO_DESCRIPTION"]]
            .map(([c]) => [WIRE_CHECKS[c].check, WIRE_CHECKS[c].translation])))};
        return remember({ code: "BASIS_REFUSED", reason: "BASIS_REFUSED",
                          check: bf[0].check, translation: BY_CHECK[bf[0].check] },
          { findings: bf, detail: "the structure this would author is refused by the SAME catalog function "
              + "op=promote runs at the write, so nothing was written." });
      }

      S.suggested.push({ name: nm || null, kind: kd || null${f10 ? ", canon: sub" : ""} });
      return Response.json({ ok: true, result: { wrote: true, version: nm || null } });
    }
`;

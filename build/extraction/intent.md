# intent — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b0f` (`store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682, `index.mjs` 13,438) by a drafting worker for BOB #43 (P18). The contract is `build/requirements/intent.md` (R1–R25); K6, K23, K31, K61 apply. The module exports `intentOf(ctx)` (K61). Intent is a new module: almost nothing exists to extract, and its first job writes it from its requirements. `from` should read `legacy-checks`, not `legacy-store` (§3).

## 1. What moves to `intent`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| C-2.9's objective arm: `if (typeof fm.objective !== 'string' \|\| fm.objective.trim() === '') findings.push(f('C-2.9', …'objective is missing or empty'))` | bio-checks, inside `checkProjectExtension` (4178–4216) | 4181–4183 | R1, R22; registered with `promotion` as a check on a project promotion |

Nothing in `store.mjs`, `schema.mjs` or `index.mjs` implements an aspiration, a goal, a satisfaction condition, progress, gaps, triage or ageing (searched for `objective`, `aspiration`, `goal`, `satisfaction`, `surfaced_by` ageing, `objective-gap`). **Schema (K4):** none moves; the module's own tables (or document types, Open for Bob 1) are new.

**Measured size:** 3 lines.

## 2. What stays, or belongs to another module, and why

| what | where today | owner | why |
| --- | --- | --- | --- |
| the rest of `checkProjectExtension`: C-2.9's `workproduct_state`, `evaluations` and `closed_reason` arms, C-9.1 | bio-checks 4184–4216 | `legacy-checks` until BOB assigns it (the readiness ladder reads as `publication`'s; the project lifecycle as `promotion`'s) | not about intent |
| a project's `objective` written at setup | `bio-plane/src/setup.mjs` 894 | `instance-setup` | it writes the project document; R1 checks it |
| the queue kind `objective-gap` (D-76) | `queuestate.mjs` 145 | `queue` | the kind is queue's vocabulary; `intent` R6 is its producer |
| the authority kind `objective` and its unresolved arm | `schema.mjs` 3237, store.mjs 42143–42151, `airun.mjs` 255 | `observation-log` | its vocabulary (its R1); `intent` R18's run writes looks under it, and observation-log's resolver gains an arm that resolves the project then |
| `proposalsFeed`, `proposeDispose` (the progression arm), `proposal_dispositions` | store 27290ff., 30415ff. | `progressions` | the one proposal source built; `intent` reads and calls them (R15, R16) |
| the machine-surfacing step (`surfaced_by: agent`, C-66) | store 17442ff. | `ai-runs` (its R25–R27) | `intent` R17 ages what it surfaced |
| the inquiry's dispose act and create-at-`surfaced` | store 4575ff. | `inquiry` | R16, R17 call them |

## 3. Undetermined, conflicts, and code others could claim

1. **`from`.** The only code that moves is in `bio-checks.mjs`; nothing leaves `store.mjs`. Proposed: `from` is `legacy-checks`.
2. **Uses.** Declared: `legacy-checks`, `record-core`, `membership`, `content`, `progressions`, `inquiry`, `ai-runs`. The requirements call `promotion` (the check, the project revision R2 writes, document types if Open for Bob 1 goes that way) and `entities` (the condition's entity and relations, R4, R7), and nothing in `content`. Proposed: add `promotion` and `entities`, drop `content`. Both are earlier in the order.
3. **C-2.9 is one id over five arms.** Only the objective arm is intent's. The object is split by the first job to move, the id unchanged on every arm, as C-45 and C-80 are split (content map §5.4).
4. **Proposal sources.** `monitoring` (layer 10) and `scheduler` produce findings that are proposals too; they fill R15's registration, since `intent` may not call them. `progressions` is earlier and read directly.
5. **Other claimants.** `queue`: the gap as an item (R6). `scheduler`: ordering by aspirations and gaps, and the call to R17. `publication`: what was set aside (R14, R16). `ai-runs`: the run R18 opens.

## 4. Old-battery tests

`check-firing.test.mjs` asserts C-2.9's arms by id; the objective arm's assertion follows the module (a `legacy-tests` entry, K53). `project-mint.test.mjs`, `publish.test.mjs` and the case-conclusion suites write projects with an `objective` and are unaffected. No suite tests intent itself.

## 5. The ADDED lines expected in the legacy modules

- `bio-checks.mjs`: none; the three lines are removed and the arm runs through the module's registered check.
- `store.mjs`: `legacy-store` registers intent's check with `promotion` until the dispatcher does, one line; nothing else until intent's ops exist, when their dispatch entries route to `intentOf(this.ctx)`.

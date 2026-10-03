# op-declarations (T31)

**Status** · session_01WV8MW7765m14i8DS4LJJx5 · depth 2 · WORKING · handled B2

## J1 · QUESTION

R15 states `NEEDS` for the five member acts (`contribute`) and the six reads (`null`), and is silent on three ops. Every one needs a row: R3 asks one for each mutating op a session reaches, and affordances R37 names all fifteen in `NON_ACTS` (its R12 reads a missing key as stale). My reading, which I am building on:
1. `wizardpropose`: `contribute`, as `templatepropose` (R8) and `whatchangedpropose` (R10): proposing is contributing, never publishing.
2. `wizardeditorgrant`, `wizardeditorrevoke`: `null`, D-136's reasoning for the governance acts (`membercaps`, `groupnameset`): an administrator's act, bounded by the roster (`NOT_AN_ADMIN`), not a working capability. Spec `classes: ["admin","member"]`, `machineClasses: []`, both session sets (an enrolled administrator's session is a `member` kind).
3. `wizardprogress`: `null`, `queuemute`'s reasoning: an unattributed tally writes nothing in a member's name, and a view-only member runs wizards too (DEC-120 (1)).
Also my reading of "the reads ..., `viewer` stamped, and `wizardcheck`, reached also by an `ai` credential": the five reads are a member session's only (`machineClasses: []`), and `wizardcheck` is `classes: ["admin","member","probe"]` with no `machineClasses`, stamped with nothing (checkScript is pure and takes the registration, not a viewer).
The act lists I add, for control-plane R50's stamps: `WIZARD_SCRIPTS_ACTIONS` (viewer: draft, revise, submit, approve, retire, propose), `WIZARD_SCRIPTS_AUTHOR` (author: draft, revise, submit), `WIZARD_SCRIPTS_BY` (by: approve, retire, editorgrant, editorrevoke), `WIZARD_PROPOSAL_ACTIONS` (proposer: propose), `WIZARD_PROGRESS_ACTIONS` (nothing: progress), `WIZARD_SCRIPTS_READS` (viewer: the five reads), `WIZARD_CHECK_READS` (nothing: wizardcheck). R16: `importwatch`, `importunwatch` join `CASE_IMPORT_ACTIONS` and `CASE_IMPORT_BY`.

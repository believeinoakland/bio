# T28 L11 — the requirement folds for affordances, op-declarations, control-plane and plane

**Status** · DRAFT by a drafting worker for BOB #105, 2026-10-03, on `tranche/T28`, for BOB's review (wording, P17). It folds the L11 share of N520 (DEC-112's share; `case-import`, `case-checker`) and N522 (DEC-96 items 1, 4; `accepted-work`) into the four L11 modules whose T28 entries K1292 left waiting. Queue's share (R28, N527) is already folded. Precedent: T27's docket fold (affordances R34, op-declarations R13, control-plane R48, plane R15). Each new or changed line carries `*(not yet met: T28)*`. Sources: `build/plan/current.md` roster L11; `draft-T28-dec112.md` roster and decisions 1, 7; `draft-T28-n522.md` roster; K1299, K1307, K1310; `case-import` R1–R16; `case-checker` R15; `accepted-work` R1, R4, R6.

**Edges already in `build/modules.json`** (K1299): all four modules use `case-import`; `plane` uses `accepted-work`. **Missing:** `control-plane` → `accepted-work` (its family, below); `plane` → `case-checker` (its factory and start); `control-plane` → `case-checker` only if case-checker's L8 job holds a check family (see ambiguity 2). Each points earlier (accepted-work 44, case-checker 66, case-import 67; L11 modules 84–92), so P4 holds.

---

## 1. affordances (next free id R35)

**(a) New line**, after R34:

```markdown
- **R35** (DEC-112 (6), DEC-96 items 1, 2; N520, N522) The ops `case-import` and `case-checker` add (`op-declarations` R14), by R7 and R27, R12's totality holding with them:
  - `RUNGS` assigns `reasoned` to the four DEC-96 acts ("a reasoned act"): `importaccept` and `importacceptwithdraw` (`case-import` R6, R7 require `reason`, and the acceptance `checked`, refused `IMPORT_ACCEPT_NO_REASON`), and `importflag` and `importflagclear` (its R8 requires the `issue` or `reason`, refused `IMPORT_FLAG_NO_ISSUE`); each is corrected forward and never erased (its R7, R8, R12). Both codes join `JUSTIFICATION_REFUSALS` (R19).
  - `RUNG_ABSENT` holds `caseimport` and `caseimportdocument`, ground `undetermined`, on R27's rule, as `inboxpull`: each brings bytes into this copy in a member's name, asks no authored reason, and no published act takes it back (an import is append-only and read-only, `case-import` R2, R12; a completion stores only bytes the edition already names by fingerprint, its R5). R27's count reads 25 with them (the 21 it names, `whatchangedpropose` (R32), `docketpressure` (R34), and these two).
  - `NON_ACTS` gives each its reason: the six acts "import-directed: keyed by an imported case (an import, an edition, a finding or a flag), reached from the imported cases; writes this module's rows and moves no bundle"; the reads `importedcases` and `importedcase` "read: …"; and `case-checker`'s public reads `casechecker` and `casefilespec` (its R15) "read: public, no credential".
  - None is in `MACHINE_REFUSALS`, which holds only `ACTS` (R7, R20); `case-import` refuses a machine by name itself (`MACHINE_CANNOT_IMPORT`, its R1). No vocabulary is added.

  *(not yet met: T28)*
```

**Proposed grades (for BOB):**

| op | rung | reason |
|---|---|---|
| `caseimport` | `RUNG_ABSENT`, `undetermined` | R27: no authored reason, no act takes it back; the closest comparable, `inboxpull` (external bytes filed in a member's name), is graded so. |
| `caseimportdocument` | `RUNG_ABSENT`, `undetermined` | Same rule. `substrate` was considered (the outcome is fixed by the fingerprint), but it is a member's chosen act, and `substrate` is for ops no member chooses. |
| `importaccept`, `importacceptwithdraw`, `importflag`, `importflagclear` | `reasoned` | DEC-96; backed by `IMPORT_ACCEPT_NO_REASON` and `IMPORT_FLAG_NO_ISSUE` (R19). |

**Refusal codes for affordances' vocabularies:** `IMPORT_ACCEPT_NO_REASON` and `IMPORT_FLAG_NO_ISSUE` join `JUSTIFICATION_REFUSALS`. Docket's R34 added `DOCKET_NO_REASON` the same way. No `MACHINE_REFUSALS` entry is needed.

**(b) Uses.** Add a bullet. The edge is already in `modules.json`, and no `case-checker` edge is needed, because naming an op in `NON_ACTS` imports nothing (as for `network-notices`' public reads, R32):

```markdown
- `case-import` (N520, N522): its op map, the ops R35 grades, and the backing of each rung (R19).
```

**(c) Status sentence to append:**

> Folded by a worker for BOB #105, 2026-10-03, entries N520 (DEC-112's share) and N522 (DEC-96): R35 (the four DEC-96 acts `reasoned`, `caseimport` and `caseimportdocument` `undetermined`, the `NON_ACTS` of `case-import`'s eight ops and `case-checker`'s two public reads) added; Uses gains `case-import`; not yet met (T28).

---

## 2. op-declarations (next free id R14)

**(a) New line**, after R13:

```markdown
- **R14** (DEC-112 (3)(6), DEC-96 items 1, 2; `case-import` R1–R8, `case-checker` R15; N520, N522) `OPS` holds a spec for each op `case-import` and `case-checker` add, each in `SESSION_OPS.member` and `SESSION_OPS.admin` unless it is public, with `NEEDS` `contribute` for every mutating op a member's session reaches, and the stamps the act lists name:
  - `caseimport` (`case-import` R1), `caseimportdocument` (its R5), `importaccept`, `importacceptwithdraw` (its R6, R7), `importflag` and `importflagclear` (its R8): mutating, `by` and `viewer` stamped; `importedcases` and `importedcase` (its R4): reads, `viewer` stamped, each with a `NEEDS` row of no capability (`null`), since `affordances` names them (its R35); each for a member session only, with classes `admin`, `member` and `machineClasses: []` (no machine, AI credential or operator token imports, completes, accepts, withdraws, flags or clears, or reads an import, `case-import` R1, R4, R8);
  - the public reads `casechecker` and `casefilespec` (`public-read` R18; `case-checker` R15): `classes: null`, not mutating, nothing stamped, each with a `NEEDS` row of `null`, since `affordances` names them (its R35).

  `publish` and `publishpreflight` keep their specs: `flagsDisclosed` (`case-authoring` R52, R53) is a body field that reaches the handler as given, as `tensionsDisclosed` does, and no act list names it as a stamp. R6 holds over them. *(not yet met: T28)*
```

**(b) Uses.** The Uses section lists only `affordances`, though `modules.json` also has `link-sweep` and `case-import`. Add:

```markdown
- `case-import` (N520): the ops R14 declares.
```

**(c) Status sentence to append:**

> Folded by a worker for BOB #105, 2026-10-03, entries N520 (DEC-112's share) and N522 (DEC-96): R14 (the specs of `case-import`'s eight ops and `case-checker`'s two public reads; `publish` and `publishpreflight` unchanged, `flagsDisclosed` a body field) added; Uses gains `case-import`; not yet met (T28).

---

## 3. control-plane (next free id R49)

**(a) New line**, after R48:

```markdown
- **R49** (DEC-112 (3)(6), DEC-96; N520, N522) The door routes, through `case-import`'s own map (R26), with the stamps `op-declarations` R14 declares and none taken from the caller (R29):
  - `caseimport`, `importedcases`, `importedcase`, `caseimportdocument`, `importaccept`, `importacceptwithdraw`, `importflag` and `importflagclear` (`case-import` R1–R8), each refused to any caller not arriving by a member's session;
  - `importedcases` and `importedcase` are among the reads declared to name no project (R27), with the reason that `import` is an import's id, never a bundle id, and `case-import` answers a non-member with byte-identical absence itself (its R4);
  - `case-checker`'s public reads `casechecker` and `casefilespec` (its R15), credential-free on the public path, as `public-read` R18 registers them: by their own names and as `op=publicread&name=` (as R45), with no route of this module's.

  *(not yet met: T28)*
```

**Amended line, R43** (N526 and K1310). The families are already required by R43's totality ("every module with a check table has its entry"), as at T21 (K921), so they get no new id. The module order is made explicit, because docket's family is read out of order today (K1280, K1291):

- old: `… and \`CHECK_FAMILIES\` (R22, R41) is composed of the modules' own families and this module's alone, still total over \`build/modules.json\` (every module with a check table has its entry).`
- new: `… and \`CHECK_FAMILIES\` (R22, R41) is composed of the modules' own families, read in the order of \`build/modules.json\`, and this module's last, alone, still total over \`build/modules.json\` (every module with a check table has its entry: \`accepted-work\`'s C-21 rows, \`case-import\`'s family and \`docket\`'s at its place directly after \`publication\` among them; K1310, N526). *(not yet met: T28)*`

The rest of R43 is unchanged. Note that "every code it decorated before reads the same `code`, `check` and `translation`" still holds after docket moves, once docket's own code `MACHINE_CANNOT_MARK_DOCKET_PRESSURE` (docket R2, N526) has replaced the shared one.

**(b) Uses.** Add. The `accepted-work` edge is **missing** from `modules.json` and must be added; `case-checker` is added only if its family exists:

```markdown
- `case-import` (N520): its ops map (R49) and its check family (R22, R43). `accepted-work` (N522): its check family, C-21.4 and C-21.5 (R22, R43; K1310). `case-checker`'s public reads reach the door through `public-read`'s registration (its R18), with no use of this module's.
```

**(c) Status sentence to append:**

> Folded by a worker for BOB #105, 2026-10-03, entries N520 (DEC-112's share), N522 (DEC-96) and N526: R49 (routes `case-import`'s eight ops, its two reads named no project's, and `case-checker`'s public reads) added; R43 names the module order and the families it gains (accepted-work's, case-import's; docket's at its place, K1310, N526); Uses gain `case-import` and `accepted-work`; not yet met (T28).

---

## 4. plane (next free id R16)

**(a) New lines**, after R15:

```markdown
- **R16** (N522; DEC-96 items 1, 4; K1307) The composition root makes `accepted-work`'s one instance per host (`acceptedWorkOf(host, deps)`) before `inquiry`'s factory, starts it so that its promotion check (`accepted-work` R4) is registered at its place in the order before the first request, and hands that same instance to every module that reads accepted work (`strength`, `basis-versions`, `reevaluation`, `publication`; `accepted-work` R2) and to `case-import`, which fills its registration (R17). So one registration serves every reader. *(not yet met: T28)*
- **R17** (N520, N522; DEC-112 (3)(6), DEC-96) The composition root builds `case-checker` and `case-import` on the object's storage in the order of R2 (at their places in `build/modules.json`, directly after `ratification`):
  - it starts `case-checker`, so its two public reads are registered with `public-read` (its R18; `case-checker` R15) before the first request;
  - it builds `case-import` with the deps it reads (`case-checker`, `strength`, `accepted-work`'s instance (R16), `reevaluation`) and the object store for its case-file bytes, runs its migration as R3 says, and declares its tables to purge through `record-core` (K23; `case-import` R13);
  - it starts `case-import`, so that it fills `accepted-work`'s registration (`case-import` R16, `accepted-work` R1) before the first request;
  - it spreads `case-import`'s ops map into R5's route map, so each of its ops reaches its handler through `control-plane`'s door.

  *(not yet met: T28)*
```

**(b) Uses.** Add. The `case-checker` edge is **missing** from `modules.json` and must be added:

```markdown
- `accepted-work` (N522): `acceptedWorkOf` and its start (R16; K1307).
- `case-checker` and `case-import` (N520, N522): their factories, `case-checker`'s start, `case-import`'s `migrate()`, start and ops map (R17).
```

**(c) Status sentence to append:**

> Folded by a worker for BOB #105, 2026-10-03, entries N520 (DEC-112's share) and N522 (DEC-96): R16 (`accepted-work`'s one instance, made before `inquiry`'s factory, K1307) and R17 (`case-checker` and `case-import` built and started, `case-import`'s ops map spread) added; Uses gain `accepted-work`, `case-checker` and `case-import`; not yet met (T28).

---

## Ambiguities and conflicts, each with a recommendation

1. **`flagsDisclosed` needs no op-declarations change.** The roster says `publish` and `publishpreflight` "gain `flagsDisclosed`". But an op spec carries no body fields (`{classes, machineClasses?, mutating}`). `case-authoring`'s op map spreads the body (`{...b, …}`), so `flagsDisclosed` already reaches `publishCase` and `publishPreflight`, as `tensionsDisclosed` does (no other module names it). **Recommend:** record it as met by `case-authoring`'s L8 job, keep only R14's closing sentence (no code), and have control-plane's R29 test confirm the field reaches the handler unchanged. Alternatively, drop it from the L11 roster.
2. **case-checker's check family.** K1310 says control-plane's L11 merge adds "case-checker's family". `draft-T28-dec112.md` decision 1 says "case-checker answers results, not refusals, so it has no rows". **Recommend:** R43's totality decides. Control-plane adds `src/case-checker/checks.mjs` (and the `case-checker` edge) only if case-checker's L8 job holds a family; otherwise nothing. Record a ruling correcting K1310's wording.
3. **Missing edges.** `control-plane` → `accepted-work` is needed to read C-21.4/.5 (red 6). `plane` → `case-checker` is needed for its start. **Recommend:** BOB adds both to `modules.json` when this fold lands. Both point earlier, so P4 holds.
4. **The public reads `casechecker` and `casefilespec` are not on the L11 roster.** The roster names only the eight case-import ops. op-declarations R6 (a spec for every op served) and affordances R12's totality still need specs, `NEEDS` null rows and `NON_ACTS` for them, as `network-notices`' and docket's public reads had. **Recommend:** include them, as drafted, in the op-declarations and affordances jobs.
5. **R27's count is stale.** It still says 21 `undetermined`, but the code holds 23 (`whatchangedpropose`, T23; `docketpressure`, T27). **Recommend:** R35's sentence restates the count as 25 with this fold's two, as drafted. Alternatively, re-word R27 itself in the same fold (amended line, marked T28).
6. **Session-only for `caseimportdocument` and the four acts.** `case-import` says "member session" only for `caseimport` and the reads. The other acts apply R1's machine and operator-token refusal, so they are member-only in effect. **Recommend:** `machineClasses: []` for all eight, as docket's, so the door and the module agree.
7. **The capability for `importaccept`.** Accepting another group's edition lets the group's own findings rest on it (`accepted-work` R3), and `case-import` names no capability beyond membership. **Recommend:** `contribute`, as drafted, the house default for a member's act on the record. A stronger gate (for example `publish`) would change the requirement's meaning and is Bob's.
8. **Docket's family move depends on L8.** It waits on docket's L8 job merging `MACHINE_CANNOT_MARK_DOCKET_PRESSURE`. **Recommend:** control-plane's L11 START confirms that the merge is in the tranche. If it is not, the R43 docket clause stays not met and is carried with N526.
9. **K1292 versus K1299 on the `case-import` edges.** K1292 says the edges wait for the T28 entries; K1299 already added them. This is not a conflict: the edges exist, and only the requirement text was waiting, which this draft supplies.
10. **R2's rule for `accepted-work`'s instance.** Under R2, a module's deps are built first. `strength` and `basis-versions` default to their own `acceptedWorkOf(host)`, so if plane does not pass one instance, `case-import`'s registration could land on an instance they never read. **Recommend:** R16's "one instance per host, handed to each reader", as drafted (K61, K1307).

# wizard-scripts (T45)

**Status** · session_01LvyhffaPeeTv75JqLtwjLD · depth 2 · WORKING · handled B2

## J1 · QUESTION

R13's T45 append ("`machineDrafts` also holds the labelled machine drafts T45's owners serve, once `op-declarations` declares them … A script's step may then carry `{machine: <op>}` for them on acts not in `machineRefused`"). Two readings I need confirmed; I carry on with both as stated.

(1) "Once declared" at my interface. The list is the plane's to pass (plane R19's `MACHINE_DRAFTS`), and T45's op names are not fixed until T45-45 (today only `agent-worker`'s `infractiondraft` task exists, no op; no chance-to-fix draft op is named). My reading: as R13 already does for acts since T37, when an op table is registered, a registered machine draft whose op the table does not hold is not registered, so `{machine: <op>}` for it is refused `WIZARD_DRAFT_REFUSED` until `op-declarations` declares it, and is accepted, with no change here, once it does. The plane may then list the T45 drafts at once. Today's four (`whatchangedpropose`, `escalationreasondraft`, `groupdescriptiondraft`, `writinghelp`) are all in `OPS`, so nothing changes for them. The plane's adding the T45 names to `MACHINE_DRAFTS` is plane's (I report it, not change it).

(2) "on acts not in `machineRefused`". R12 lets a registered machine draft sit on an act in `machineRefused` (the DEC-101 exception), except the two help drafts. My reading: the sentence states where the T45 drafts are placeable and does not narrow R12's exception; I add no frozen list of T45 names (they are not fixed). The alternative is a second exception list like `HELP_DRAFTS` naming T45's drafts once T45-45 fixes them, which I cannot write now. In practice their act is `communicationprepare`, not in `MACHINE_REFUSALS`.

# BOB to plane (R085)

**Read** · handled J1

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). Fix round 6 (K3528, K3531). Your entry is R085-34: plane R57. WIZARD-SCRIPTS #11 made `startFrom` withhold the group-setup scripts from a viewer without `administer` (wizard-scripts R40) when its registration carries `adminActs` and `adminScreens`; `bio-plane/src/plane/wizards.mjs`' `wizardRegistration` does not pass them yet, so live nothing is withheld. Pass interface-shell's `ADMIN_ACTS` and `ADMIN_SCREENS` (BOB added the `uses` edge plane → interface-shell; interface-shell is earlier in the order). Read wizard-scripts' requirements R40 and the job record `build/jobs/R085/wizard-scripts.md` on tranche/R085 for the parameter names. R57 needs its own explicit test naming it (K874). Run your module tests, wizard-scripts' tests (the user of the change) and the checks (format, architecture, coverage, ownership); three screens-daily/screens-wizards tests already fail on the base (listed in wizard-scripts' record): report whether your change alters them, do not edit them. Rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what R57 needs. COMPLETE as soon as green.

Model: claude-haiku-5-5. Workers you spawn name model and effort: haiku at low for mechanical work, sonnet at medium for reading and diagnosis, never above your own model.

# BOB to op-declarations (T27)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T27) L11, op-declarations: N518 R12 (`actionholdrelease`, `actionholdpreview`, `projectholds`) and N520 R13 (the docket's ops and its two public reads). Add a `uses` edge to `docket` only if your specs import its op names (ask BOB; it records the edge). Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T28's promotion stamp (accepted red 2): list such rows in your completion record.

## B2 · CHANGE

K1286: export the docket op lists under exactly these names, which control-plane imports: DOCKET_ACTIONS = docketfile, docketpressure, docketdecline, docketpost; DOCKET_READS = docket, docketprepare, docketinvitation; DOCKET_AUTHOR = docketfile, docketpressure; DOCKET_BY = docketprepare, docketdecline, docketpost; DOCKET_PUBLIC_READS = docketpublic, docketfeed (classes: null). actionholdrelease joins ACTIONS_ACTIONS; actionholdpreview and projectholds join ACTIONS_READS. viewer stamped on all seven docket member ops.

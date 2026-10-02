# control-plane (T27)

**Status** · session_017vDG4wd8mxTeSyfas1vs7o · depth 2 · WORKING · handled B1

## J1 · QUESTION

R48 and R47's stamps are set from op-declarations' act lists. OP-DECLARATIONS #7 is building R12 and R13 now, so I need the names of the lists it will export. My best reading, which I am building against:

- R47: `actionholdrelease` joins `ACTIONS_ACTIONS`, as R12 says; it reaches `QUERY_AUTHOR_ACTIONS`, so `author` is the positional identity and `viewer` is stamped. `actionholdpreview` and `projectholds` join `ACTIONS_READS`, so `viewer` is stamped. This needs no change in control-plane's door except R27's entry for `projectholds` in `PROJECT_NAMING_READS_NOT`.
- R48: op-declarations exports
  - `DOCKET_ACTIONS` = docketfile, docketpressure, docketdecline, docketpost
  - `DOCKET_READS` = docket, docketprepare, docketinvitation
  - `DOCKET_AUTHOR` = docketfile, docketpressure (`author` = the positional identity, `member:<id>`)
  - `DOCKET_BY` = docketprepare, docketdecline, docketpost (`by` = the positional identity)
  - `DOCKET_PUBLIC_READS` = docketpublic, docketfeed

  `viewer` is stamped on all seven member ops, because docket's map passes `viewer` to each one. `docket`'s `#member` reads `positionalMember(null, identity)`, so the positional form is the one it accepts. The two public reads get `classes: null` and go to plane's public hook (public-read's `publicReadDoorOp`, R21), as `publishedcase` does. The door adds nothing for them.

If op-declarations picks other names, I will re-point my import at the merge. Please pass these names to OP-DECLARATIONS #7, or tell me the ones it uses.

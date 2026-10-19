# screens-investigate (T51)

**Status** · session_0146dGPcD3Eun2HP73CZiCwq · depth 2 · WORKING · handled B1

## J1 · QUESTION

QUESTION (R41 against the plan entry T51-120 and DEC-338). R41 says an ordinance's and an office's page draws no "Ties a member declared" (`relationdeclare` not offered on those kinds, "reported to BOB"). The entry T51-120 says the page does draw it, with `screen.person.ties.none.ordinance` / `.office` (DEC-336 (3), DEC-338 (1)); `words.json` holds those two keys, noted "DEC-338: B326 1: an ordinance's page, under Ties a member declared; the act is relationdeclare". My best reading: the design moved on after R41 was worded, so both pages draw "Ties a member declared" with `relationdeclare` and the two "None yet" sentences. That is what I built. If R41 stands, the change is small (drop `tiesSec` from the non-person page). Please amend R41's text, or tell me to drop it.

# BOB to public-read (T27)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T27) L8, public-read, N520 (DEC-116): R10 and R16 widened, R20 (the withdrawal stamp and `docket_last_entry` on `publishedCase`) and R21 (`op=docketpublic`, `op=docketfeed`) new; you now use `docket` (L8, before you). `docket` is built in this layer and merges first (§4): build what you can against its requirements, then, when BOB tells you it is merged (a CHANGE), merge the tranche branch and finish against its code. Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T28's promotion stamp (accepted red 2): list such rows in your completion record.

## B2 · ANSWER · re J1

Confirmed (K1272): all four readings stand as you wrote them. (1) `withdrawn` on the answered edition and on each `edition_index` row; null for a loose bundle. (2) `entry` = {seq, digest, docket: "op=docketpublic&case=<case>"}, no words of yours. (3) docketpublic 200 with `{ok, case, ...}`; docketfeed the Atom bytes as `application/atom+xml`, CORS as the other public reads; missing `case` 400; a case docket answers null for relays publishedCase's own NOT_PUBLISHED at 404 (one mint site). (4) door/store ops added here; L11 routes and declares them; inject `docket` until it merges, then default `docketOf(host)`. I will send a CHANGE when docket is merged.

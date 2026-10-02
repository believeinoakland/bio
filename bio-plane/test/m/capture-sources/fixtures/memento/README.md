# Memento fixtures (capture-sources R37)

Answers in the shapes RFC 7089 specifies (§4 TimeGate, §5 TimeMap, §2.1 headers) and the Wayback Machine's Memento endpoints serve (`/web/<URI-R>` TimeGate, `/web/timemap/link/<URI-R>` TimeMap). They were written out by hand by CAPTURE-SOURCES #9 (T22), not captured over the network: the session's egress refused `web.archive.org` on 2026-10-02. `rfc7089-timemap.txt` follows the RFC's §5.1.1 example with this suite's own addresses.

- `wayback-timemap.txt`: a Wayback TimeMap, `first memento`/`memento`/`last memento` relation forms, one memento with no `datetime` (refused, never placed).
- `rfc7089-timemap.txt`: another archive's TimeMap, the RFC's example form (quoted relations, a TimeMap `from`/`until`).
- `timemap-malformed.txt`: an entry that does not begin with `<` (the negative control for the link-format reader).
- `timegate-302.json`: a TimeGate's negotiated redirect (`Vary: accept-datetime`, `Location`, `Link`), no `Memento-Datetime`.
- `memento-200.json`: the memento it points at, `Memento-Datetime` and `Link` with `original`, `timegate`, `timemap`.
- `memento-301.json`: a memento of an archived redirect.
- `memento-no-datetime.json`: a 200 with no `Memento-Datetime` (the negative control: not a memento).

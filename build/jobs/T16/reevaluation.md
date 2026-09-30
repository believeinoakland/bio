# reevaluation (T16)

**Status** · session_01UhKRLHYErRzwuUv4CKDgXW · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · QUESTION

R28 (N364), entry (1). As worded, R28 needs four things my Uses do not give. My best reading follows each; the answer decides how I build R28, so I am waiting on it (entries 2–4 are done and pushed: N360 re-anchor, N359 `since`, N242's four guard outcomes classified).

(a) **Which captures a source stands behind.** `sources` Provides no read from a capture to its source, or a source to its captures, that writes nothing: `sourceOf` mints a source on first read and logs value reads. Reading: `sources` declares `source_knocks` (`source_id`, `capture_sha`) a read contract, as inquiry R40 does, and I join it. (A disclosure needs its source to exist, so every source with a move has its read knocks there.)

(b) **Rung before, after, and "since the leg's basis version".** `rungOf` answers only the current rung, with no `at`. It also refuses a machine viewer (`#memberOf` returns null, so the answer is `NO_SUCH_SOURCE`). "Read as the plane" therefore has no credential. Reading it as the founder appends `source_reads` rows whenever the founder is on a sight list: a read that writes, against my R18. Reading: I never call `rungOf` on read. My `onDisclosure` listener keeps one row per rung move it hears (rung_before ≠ rung_after): `{source, entry, rung_before, rung_after, at}`, with `at` the commit instant from my clock, because the payload carries no instant. R18 gains that table beside R25's pass position. The cause is then derived on read from those rows. (The alternative is a `sources` change: `rungOf({at})` read as the plane, with no read log.)

(c) **The leg's basis version instant.** `inquiry_basis.at` is not in inquiry R40's contract. Reading: the dependent's `bundles.last_updated` (record-core R37), the latest write of the document that holds its live basis. A move after it is a cause; one at or before it is not. R16 closes it as any cause.

(d) **"A capture a live leg rests on".** Reading: the leg's content row's capture (`content.capture_sha`, content R45). For a leg on a whole document: each capture the target registers (provenance's `register`, R48). Live is R7's (`inquiry.restsOnLive`). The detail carries both rungs and the move's instant, and the leg's grade is untouched.

(e) **The raise.** R8's `kind` is `finding` or `passage`, and a source is neither. Reading: a third kind, `source`: `{kind: "source", subject: <source id>, source: "source", since: at, detail: {rung_before, rung_after}, dependents: [{bundle_id, ord, role, state, target}]}`. It is told once per move, after the listener's own row is written. It carries no value (sources R13).

If you prefer the `sources` change in (b) (and a capture read in (a)), those are SOURCES' to build, and R28 stays `not yet met` with a `test.todo` naming it.

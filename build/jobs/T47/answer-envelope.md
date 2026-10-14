# answer-envelope (T47)

**Status** · session_013osHE4dWKZtRLQMyZZYfNj · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings of R16, each with what I am building meanwhile.

(1) "R6 binds `interfacePage` at `/` and `/app/*`." `interfacePage` is `interface-shell`'s (modules.json index 152, after this module at 148), so no file under my `tests` path may import it (architecture: only earlier, declared modules). My best reading: my test drives `withPagePolicy` over (a) the signer page (as now) and (b) a page shaped as `interface-shell` R2/R3 serves it (every script element carrying `NONCE_SLOT`, a module script, an inline style), served at `/` and at `/app/<screen>`, and finds R6's policy and nonces on each; the setup page leaves the R6 test's page list (no longer served), and the comment and R6's test title name `interfacePage` as the page at `/` and `/app/*`. The test over `interfacePage`'s real bytes is `control-plane` R82's (it serves `/` and imports both). Tell me if you want otherwise (e.g. a `uses` edge is impossible here, since the order runs the other way).

(2) "the door's row for `signintrace` off a test instance (`SIGNINTRACE_NOT_TEST`) joins `DISPATCH_CHECKS`." My best reading: `SIGNINTRACE_NOT_TEST`, check C-69.7 (the next free C-69 number; C-69.6 retired and never reused by R14), `where` `src/signin-door/index.mjs signintrace > is-signintrace-test-instance` (signin-door R5 raises it; signin-door's paths are still empty, so the file and region name are my reading, for SIGNIN-DOOR to match or BOB to correct), translation an interim sentence of this module's until `words.json` holds `refusal.SIGNINTRACE_NOT_TEST`, read by key from a module-local `DOOR_WORDS` (the pattern R14 removes for DISCLOSURE_DUE): "This group's Civicsmith keeps a trace of sign-ins only when it runs as a test instance, and this one does not. Nothing was read or changed." "Its order test" read as: R8's held-rows test names it, and R2's decoration of it is pinned. The row joins the row census red until T48's stamp (rule 5 (2)).

Also, beside R14/R15, I re-pin under R7's re-wording clause (DEC-199, `escalation` R36): C-116.14 `ALREADY_ATTACHED` and C-116.41 `ESCALATION_BY_ACT_ONLY` read their new words, changed.note naming them. That is my reading of the entry's "R8 re-taken from DEC-198/DEC-199, clearing its red".

### from jurisdictions.txt
- [DOCTRINE] jurisdictions Purpose, l.10 — "No other module names a place (`build/layers.md`, "No jurisdiction in the product")."
- [DOCTRINE] jurisdictions l.14 — "An absent section means the profile supplies nothing there, never that nothing exists."
- [DOCTRINE] jurisdictions R2, l.16 — every fact carries a `basis` (measurement, ruling, `UNMEASURED`; `TEST` only in a test profile)
- [DOCTRINE] jurisdictions R15, l.67 — "**combine never chooses between profiles that disagree.** A consumer then finds no fact there, and answers undetermined."
- [DOCTRINE] jurisdictions R27, l.48 — "A module that needs one of these facts and finds none answers undetermined, never a default (R16)."
- [DOCTRINE] jurisdictions R44, l.47 — calendar facts need a researched or ruled basis; "`UNMEASURED` is not a basis for these facts"
- [DOCTRINE] jurisdictions R24, l.34 — counterparties "named by official role and body, never by a person"; R25 l.35 a kind "names no place"
- [DOCTRINE] jurisdictions R20, l.83 — "No service treats a profile by its identity."
- [DOCTRINE] jurisdictions Satisfies, l.101 — DOCUMENT-PROFILES failure asymmetry: "a rule is added only on measurement"
- [DOCTRINE] jurisdictions R40/R45, l.42, l.95 (K921) — a profile template is governed (authored_by ≠ approved_by, reviews); first profile holds "no `template` until one is approved through the build (K921 Q1)"; Tier 3 never a `use: file` template (Design Requirement 8)
### from id-spaces.txt
- [DOCTRINE] id-spaces R25, l.68 — "Absence is never reported as non-existence."
- [DOCTRINE] id-spaces R24, l.67 — "No place is named in this module."; tests use a non-first profile
- [DOCTRINE] id-spaces R16, l.46 — check order fixed; first decisive check decides; the referent last
- [GAP] id-spaces R26, l.56 — legacy adapter retired (N105, K143)
### from docprofile.txt
- [DOCTRINE] docprofile R13, l.69–71 — `meaningful` is `null` when it cannot be judged — "never guessed in either direction"
- [DOCTRINE] docprofile R32, l.200–203 — the failure asymmetry: an unrecognised document is never assumed decorated; without CERTAIN confidence never "unchanged"
- [DOCTRINE] docprofile R33, l.204–206 — "a mass removal is never reported from a failed read"
- [DOCTRINE] docprofile R35, l.210–211 — "absence is never reported as sameness and never as non-existence"
- [RULING] docprofile R6, l.45–47 (K39, K880) — with no view, every non-test profile is combined; "This is permanent behaviour (Bob, K880)."
- [DOCTRINE] docprofile R30, l.191–195 — no place in code; tests use a non-Oakland profile for every content type
### from office-readers.txt
- [RULING] office-readers Satisfies, l.289–290 — DEC-5 (2026-08-01): "surface tracked changes, comments, speaker notes, hidden state and document metadata as evidence; never redact"
- [DOCTRINE] office-readers R22, l.264 — "Never invents structure."; Errors l.239–241 — "never an exception and never a guess"
- [DOCTRINE] office-readers R24, l.271–272 — "This module asserts nothing about MEANING (that judgment belongs to `content`/ `entities`, through I2)"
- [DOCTRINE] office-readers R25, l.273 — no place named
### from odf-reader.txt
- [DOCTRINE] odf-reader R41, l.246–248 — "absence is never emitted as a zero, an empty list or a silent omission a caller could read as "none present""
- [DOCTRINE] odf-reader R35, l.202–205 — the digest refuses when content.xml references other members — "a digest of `content.xml` alone cannot speak for a member it does not hold, so none is claimed"
- [DOCTRINE] odf-reader R40, l.244 — no place, system, form or vocabulary named
### from extraction.txt
- [RULING] extraction R44, l.134 (DEC-4) — "No machine mints a grade: nothing here raises or lowers one; a chain only weakens"; a proposal's grade is computed
- [DOCTRINE] extraction R45, l.135 — "A reading that finds nothing is a failed reading, recorded with its reason, never backfilled"
- [DOCTRINE] extraction R18, l.40 — recognisers run over the instance's jurisdiction view, "never a default"; R50 l.140 no place named
- [DOCTRINE] extraction Satisfies, l.151 — Membership §7 item 7.9: "a hidden bundle answers as an absent one"
### from content.txt
- [DOCTRINE] content R36, l.136 — "A machine credential may mark a passage citable, labelled (R16), and never attests (C-35.10) or types (C-52.1)"
- [DOCTRINE] content R35, l.135 — "Two graded facts, never one": capture grade vs derivation cap; "a leg may claim no more than the weaker"
- [RULING] content R25, R43, l.58, l.83 (DEC-88, K1025) — attestation requires the attestor's note on what they compared (`ATTEST_NO_NOTE`, C-52.10); status l.5 "not yet met (T22)"
- [RULING] content R14, l.37 (DEC-4) — `mixed` chain kind treated as containing machine-read text
- [DOCTRINE] content R37, l.138 — a row the viewer may not see answers "exactly as an absent one"
- [DOCTRINE] content Satisfies, l.150 — Design Requirements: "machine work labelled, never presented as the publisher's"
- [RULING] content R5, l.24 — "there is no `unstated` extent, Bob's 5.3"
### from entities.txt
- [DOCTRINE] entities R26, l.103 — "A declared relation is constitutive: it carries no grade, is never traversed to resolve a reference or to answer R15, and never forms a connection."
- [DOCTRINE] entities R27, l.104 — "Grade states how a reference was matched and nothing else: a `C` never reads as established, the recogniser never mints `D`, and a held grade only rises."
- [RULING] entities R28, l.105 (DEC-52) — a machine is named as one, never as a person
- [RULING] entities R1, l.20 (DEC-88, K1025) — `ENTITY_NO_NOTE` (C-91.8): a subject needs the declarer's note; status l.5 "not yet met (T22)"
- [RULING] entities R32, l.109 (K102; ruling 2026-09-24) — sight: a capture digest and what was read stay visible; the project, its id and members' acts are hidden
- [DOCTRINE] entities R25, R31, l.56, l.108 (K1) — no local system, office or example value named in any sentence
### from connections.txt
- [DOCTRINE] connections Purpose, l.13–14 — "A theme is a lens for finding material and never the basis of a claim. Grade here states how a connection was established, and never how credible a document is."
- [DOCTRINE] connections R34, l.128 — "A connection is no stronger than its weaker end; a `C` at either end is never established; a derivation never forms a connection through a declared relation; `asserted_by` is never the grade."
- [DOCTRINE] connections R47, l.133 (§8.4 fence 4) — "A theme is never evidence and never an entity"; R46 `THEME_NOT_EVIDENCE` (C-81.1) at the leg grammars
- [DOCTRINE] connections R30, l.64 — containment is machine work "never presented as the publisher's link"
- [DOCTRINE] connections R11, l.35 — "No capture grade or testimony grade is mixed into a connection grade, and a null grade is never ranked."
- [DOCTRINE] connections R38, l.132 — authorship stamps from the control plane; "a caller cannot pass a derived connection off as a member's or the source's"
### from progressions.txt
- [DOCTRINE] progressions R25, l.95 (D-79) — "A finding reports and never decides ... Only a member's recorded decision ages it, and an aged finding is still published"
- [DOCTRINE] progressions Satisfies, l.109 — Design Requirements: "derived findings inform, never decide; undetermined is stated"
- [DOCTRINE] progressions R16, l.48 — "no deadline is invented"
- [DOCTRINE] progressions R23, R26, R30, l.93, l.96, l.100 — versions append-only; stamps from the control plane; no place named
### from bias.txt
- [DOCTRINE] bias Purpose, l.13 — a bias set is "held to a rule that it may never issue a verdict on a source"; "Bias is disclosed and never blocks work."
- [DOCTRINE] bias R5, l.24 — C-26.5 refuses text that "assigns a truth verdict wholesale ... or calls a speaker a liar or never credible"
- [DOCTRINE] bias R27, l.96 — "Nothing puts a lens in force but a member's authored adoption ...; no machine credential adopts (C-26.9), and reading a policy never installs one"
- [RULING] bias R28, l.97 (DEC-20) — "Bias is disclosed and never blocks: nothing here refuses publication, ratification or a run because a lens exists or has changed"
- [GAP] bias R24–R26, l.55–57 — interactions and unregistered subjects listed for review not built (K102); strictest-applies "deferred by K102 until evaluation findings exist to apply a lens to, in `strength` and `review`"
- [GAP] bias Suggestions, l.113 — "The regrade and the cross-group rerun ("Differential traversal") come last in the doctrine's own sequencing and are not this module's today."
- [RULING] bias R11, R12, R29, l.34–35 (DEC-88, K1025) — adopter's reason required (`BIAS_ADOPTION_NO_REASON`, C-26.21); status l.5 "not yet met (T22)"
- [OPEN] (observation) none of my files quotes Declared Bias safeguard 4 verbatim; entities Satisfies l.115 paraphrases it as "the registry, aliases, justified and citable relations; every registry kind a legal subject", and entities R26 states "never traversed" — the exact canon text must come from the Declared Bias reader

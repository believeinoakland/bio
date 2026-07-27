# BIO Declared Bias, v0.1 DRAFT

Drafted July 27, 2026, from Bob's proposal in the 2026-07-27 trust session and
the construct discipline agreed there. DRAFT means under discussion: nothing
here is ratified doctrine, no check exists, no code implements it. It is
recorded so the constructs survive the session in exact form.

## Why this exists

Bias is real, it is everywhere, and the most dangerous bias is the denied one.
BIO cannot make its members lensless, so the honest system makes the lens part
of the record. Declared bias legitimizes bias as a visible, first-class
construct: the author must declare and justify their bias for the system to
honor it, and any BIO work done under bias carries the fully declared bias as
part of the evidentiary record of that work. The pedigree to cite when
defending this in public: rules of evidence (adverse-inference rules are
declared inference bias in judicial dress), newsroom sourcing standards, and
the Bayesian requirement that priors be stated before the data arrives.

Terminology: this document says DECLARED BIAS for the construct, because the
word "bias" also names the document flaws the construct exists to counter
(exaggeration, false attribution, labeling others' statements false, selective
or falsified evidence). The reclamation of the word is deliberate and kept; the
modifier keeps the two senses from blurring in doctrine.

## The construct

A **bias** is a set of **statements**. A statement is one declarative that
affects belief about evidence and about the attributed source of evidence.

### Statement kinds, a closed set of three

**scrutiny** — assigns an elevated scrutiny process to a source before that
source's claims may bear load. Example: "Anything that Donald Trump says needs
to be cross-checked for accuracy." Effect: a conclusion resting on an
un-cross-checked claim from the subject draws an evaluation finding.

**inference** — licenses or blocks a specific inference pattern. Example: "The
city attorney often refuses to respond to media requests, so a lack of
response from the city attorney is not an indication of agreement or
disagreement with statements made by others." Effect: a derivation whose
load-bearing step is a blocked inference draws an evaluation finding.

**pattern** — an evidenced empirical claim about an institution's or source's
behavior. Example: "The Oakland Auditor uses its discretion to control the
narrative, which limits identified remediation options." By the epistemics
ladder a pattern statement IS analysis, so it must cite evidence in the
record: a pattern statement without at least one citation cannot leave draft.
Effect: available for citation by analysis like any other analysis; it does
not automatically fail anything.

### The malformedness rule (the discipline that keeps this honest)

A statement that pre-assigns a truth value wholesale to a source or speaker
("X lies," "everything from Y is false") is MALFORMED and refused, no matter
who declares it. Declared bias may raise scrutiny, constrain inference, and
assert evidenced patterns. It may never issue verdicts. The mirror test: the
list of biased-document flaws is exactly the list of things a bias statement
must never itself commit. The construct that fights undeclared distortion is
held to a higher standard than the distortion.

### Statement anatomy

Each statement carries: a stable id within its bundle; its kind; its subject
(the source, institution, office, or topic it addresses); the declarative
text; a required justification; citations (anchored, once anchored citations
exist; required for kind=pattern); and, on instance-level statements only, a
lock flag.

## Bias bundles and adoption

Bias sets are BUNDLES, object_type `bias`, so they inherit everything bundles
already have: append-only history, member-authored transitions, convergent
promotion, conformance checks, and the store. Nothing new is invented for
governance:

**Instance level.** Admins define instance bias. The process by which a group
agrees to adopt a bias bundle at the instance level is defined and documented
by that group, in the group's own process document; the system requires only
that adoption is a recorded, member-authored transition under that documented
process. Adopted instance statements may carry `locked: true`.

**Project level.** Project managers define project bias. A project bias bundle
may add statements and may OVERRIDE (nullify or replace) instance statements.
An override must name the instance statement id it nullifies, so overrides are
structurally loud: recorded as overrides, visible as a diff against the
instance set, reviewed at ratification where the group's check re-enters.

**Locks.** A project override naming a locked instance statement is a
conformance error, full stop. Bob's ruling: if the project managers don't like
it, they can build their project in another instance. Locks bind projects
only; the instance may amend or retire its own locked statements through its
documented adoption process.

**The masking attack, and the safeguards against it.** The attack: a project
does not nullify an instance statement, it ADDS a statement whose net effect
limits or neutralizes one. Five safeguards, layered:

1. **Override is defined by EFFECT, not by form.** Any project statement whose
   effect LOOSENS an instance statement on the same subject (weakens its
   scrutiny demand, licenses an inference it blocks, narrows its reach) IS an
   override, whatever it calls itself, and must name the statement it loosens.
   Loosening a locked statement is a conformance error regardless of framing:
   locks protect the statement's effect, not its text.
2. **Strictest wins in the effective set.** Where statements conflict and no
   named override resolves them, evaluations apply the strictest applicable
   statement. A semantic contradiction that slips past detection therefore
   loosens nothing mechanically; it merely sits in the record looking evasive.
3. **Subject collisions are loud.** Every statement declares its subject. A
   project statement whose subject overlaps an instance statement's subject is
   flagged as an INTERACTION, requires a justification that addresses the
   interaction explicitly, and travels the same review path as an override:
   diffed against the instance set and reviewed at ratification.
4. **Subjects are registry entries, not free text.** Statements do not name
   their subjects in prose; they reference a SUBJECT REGISTRY the instance
   maintains as a bundle: entries for sources, institutions, offices and
   movements, each with its aliases, plus DECLARED RELATIONS between entries
   (proxy_for, member_of, overlaps), each relation justified and citable like
   a pattern statement. Mechanical equivalence extends exactly as far as the
   registry declares: if the registry relates MAGA to Trump, a project
   statement on one collides with an instance statement on the other; if it
   does not, no machine can honestly claim they are the same subject, and the
   design does not pretend one can. What the registry guarantees instead is
   that introducing a NEW subject is itself a loud, reviewed act: a project
   statement referencing a subject the instance registry does not carry is
   flagged for exactly the interaction review an override gets. Semantic
   equivalence is finished where all semantics are finished here: at
   evaluation time, where the evaluator (AI-assisted, member-owned) applies
   statements by meaning rather than string match, and at the adversarial
   backstop, since a rerun by an opposing group will name the dodge in
   public.
5. **The group is the backstop.** Effect comparison is mechanical for
   inference statements and largely mechanical for scrutiny statements;
   pattern statements and artful language are not fully machine-judgeable, and
   the design does not pretend otherwise. What the machine guarantees is that
   nothing on a shared subject is QUIET; the ratification review is where
   human judgment finishes the job.

**Effective bias** for a piece of work = the adopted instance statements at
pinned revisions, minus project nullifications of unlocked statements, plus
project replacements and additions. Every work product cites its BIAS
MANIFEST: the list of (bias bundle id, revision) in force plus a hash of the
computed effective statement set. The manifest is part of the evidentiary
record and travels with publication.

## Integration with the epistemics ladder

Conclusions are graded on how they follow only from evidence and analysis
UNDER THE DECLARED BIAS SET IN FORCE. The consumers are the argument
evaluations Projects already carry (C-9.1 gates work product state on them):
an evaluation consults the effective set; scrutiny statements demand recorded
corroboration for flagged sources; inference statements refuse blocked
inferences as load-bearing; pattern statements stand as citable analysis.

Prerequisite: for bias to bind mechanically rather than remain guidance
humans apply by hand, evidence items need source attribution the system can
match, which anchored citations were already going to carry (an evidence item
is an anchored selection within a document, attributed to a source).

## Bias debt

When a bias is added or changed, existing analysis is not silently stale and
not retroactively invalidated: it is marked as carrying **bias debt**, meaning
a re-run is owed. The old work remains honest as written, because it cites the
bias manifest that was in force when it was made; the debt marker records the
delta between that manifest and the current effective set, so the record
always shows exactly which statement changes a piece of analysis has not yet
been re-evaluated under. Debt is tracked per work product, is visible wherever
the work is consulted, and is cleared by re-running the evaluation (or the
analysis, where the change reaches it) under the current set. Tracking is
continuous; settlement is BATCHABLE, so a group can accumulate changes and
re-run in one pass rather than being stalled by every amendment. A work
product carrying bias debt cannot advance its workproduct_state or be ratified
for publication until the debt is settled.

## Differential traversal and the cross-group rerun

Because the record is re-derivable, two capabilities follow:

**Regrade (mechanical).** Hold evidence and analysis fixed, swap effective
bias B1 for B2, re-run the evaluations, and produce a structured diff: for
each conclusion, its grade under each lens, and the causal chain from each
differing statement to the finding it produced to the premise it touched to
the conclusion it moved. This is the tool that lets a user not just see
different conclusions side by side but dive into the package and understand
the impact of each difference at the analysis and conclusion levels. Honest
limit, named now: regrade re-grades conclusions against the analysis that
exists; it cannot synthesize the analysis a different group would have
written under a different lens.

**Rerun (human).** A work product from one group, with its enclosed bias
manifest, can be rerun by another group under that group's own bias. The two
products sit side by side with possibly very different conclusions, and the
disagreement is LOCALIZED TO NAMED LENS DIFFERENCES instead of narrative
against narrative. This is the no-transitive-trust decision made operational
between groups: the receiving group re-establishes trust at its own hop by
rerunning the work, not by accepting the producing group's reputation.

## The two-audience choice, made knowingly

Published work carries its bias manifest, and opponents will quote it. The
trade is accepted deliberately: a declared, justified, evidence-citing
scrutiny rule is more respectable than the undeclared lens every institution
operates with, and the malformedness rule is what makes each statement
survivable when read aloud by an adversary.

## Sequencing

Not a build order. Dependencies as decided: bulk release (S-11 step 5) is
first in the queue; anchored citations precede evidence attribution; evidence
attribution precedes mechanical bias binding. Declared bias can begin life as
bundles and doctrine (declaration, adoption, manifests, human-applied
evaluation) before the mechanical binding exists, and the regrade tool comes
last because it needs everything above it.

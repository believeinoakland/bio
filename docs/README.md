# Documents

Two files sit at this level because they are entry points fetched by path
at the start of every working session, and moving them would break a
protocol that works:

- **SESSION-KICKOFF.md** — how a session starts, what permission it needs
  for what, and what the next task is. Read this first.
- **BIO_DATAPLANE_STATE.md** — the current state of the build. What exists,
  what was proven, what is next.

Everything else is filed by audience.

## architecture/

Doctrine. What the system is and why, written for people deciding whether
to adopt or extend BIO rather than for people building it this week. These
documents change on human decision, not on build cadence, and they are
meant to be citable on their own.

The wider doctrine corpus (Design Requirements, Functional Architecture,
Technical Architecture Decisions, State Rules and Consistency, Intake
Doctrine, the Roadmap, the Bundle Skill Composite Design, Communications
Platforms) is authored outside this repository. When it lands here it
belongs in this directory, with the authored `.docx` as the source of truth
and a generated `.md` beside it so the text is greppable, diffable, and
readable by a session with no credentials.

## development/

Operational records: migration ledgers, rehearsal logs, and anything else
that documents how a particular piece of work actually went. Useful
evidence, not doctrine, and not something a newcomer needs.

## Why this is one repository and not four

The plane and the installer are coupled by build, not merely by topic. The
installer's build runs the plane's build and inlines its output; the plane
in turn embeds the signing page from `tools/`. Splitting them would require
a submodule, a package dependency, or a mid-build artifact fetch, and it
would make version skew possible where today it cannot happen. Releases
0.4.0 and 0.4.1 were each a single commit spanning plane, installer, tools,
and docs; across separate repositories each becomes a coordinated set of
merges with a window in which the installer can be built against a plane it
was never tested with.

The doctrine corpus is the one part with a real case for its own
repository: a different audience, a human rather than build cadence, and
large binary source files that would permanently bloat a code repository's
history. That split is worth making once the corpus is stable and no longer
being edited alongside the code it describes. Until then it lives in
`architecture/`, and this directory structure is what makes the eventual
split a move rather than a reorganization.

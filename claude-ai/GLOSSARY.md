# BIO / CivicOS glossary for UX design

Read from `/home/user/bio` at `origin/main` `1a7f0bcc0` on 2026-09-24. Every definition comes from the design corpus or from `node tools/status.mjs` / `node tools/decided.mjs`, and each cites its **document › section**. Where a term has two meanings, or an older name was replaced, the entry says so (**⚠ conflict** or **superseded**). Where the corpus has no definition, the entry says **UNDETERMINED — not found in corpus**.

Two rules from the UI lane shape how these words reach the screen:
- The audience is non-technical and is never made to choose between technical options (`kickoffs/UI.md` › What this area should know without being told).
- The "analyst's vocabulary" must not reach members. The UI tests keep one shared list of banned terms (`kickoffs/UI.md` › What a UI worker should know before touching `app.html`). Op names (`op=…`), check ids (`C-…`) and ledger ids (`D-…`, `DEC-…`) in this glossary are for traceability only. They are not labels to show members.

---

## The four things CivicOS is for

> **"CivicOS exists to answer questions, make a case, tell a story, and take action to affect a living civic system"** (Bob, 2026-08-01). Everything else — capture, content, the framework, retrieval, progressions — is substrate for that path.
> — `CLAUDE.md` › §2 What this is; restated in `BIO_System_Design.md` › 1. Purpose — the path, and the stance

The member's path is **questioning → exploring → discovering → documenting → impacting**, plus sharing what comes out of it (`BIO_Case_Making_v0_1.md` › The frame, in Bob's words). The product is **the trustworthiness of the record**. A defect that lets the record claim more than it can support is worse than a missing feature (`BIO_System_Design.md` › 1).

## Built vs designed

The design documents describe a lot that is **not built yet**, and they say so in their own front matter. Build state is kept in one place, `docs/architecture/construct-status.json`, and checked against the code at every push. **Check before you design against a feature:** run `node tools/status.mjs <construct number or word>`. It prints BUILT, PARTIAL or ABSENT with its evidence (`BIO_System_Design.md` › 3. The major constructs). A lookup that returns nothing is *not found*, not *absent*. Examples that matter for UX, as of this reading:
- **Built in the backend, no member screen yet:** the member surface for choosing a connection's on-point mention (`status.mjs 6` → `6.on-point-ui ABSENT`) and the administrator acts (`BIO_Membership_Architecture_v2.md` front matter, §4: "NOT BUILT").
- **Designed, not built:** the request to join a discoverable project (`BIO_Membership_Architecture_v2.md` front matter, §7 item 7.14).

---

## 1. People, groups and authority

**Group** — The people who run one CivicOS installation together. A group can be as small as one person (`BIO_System_Design.md` › 2. The system in one view). Membership is scoped to one group's instance and never crosses a group boundary. There is no network-wide hierarchy (`BIO_Membership_Architecture_v2.md` › 2. What membership is NOT).

**Instance (sovereign instance)** — One group's own copy of CivicOS, running in the group's own Cloudflare account. It holds the group's record, captured files and published corpus under the group's own credentials. There is no hosted service and no central operator (`BIO_Distribution_v0_1.md` › 1. What the construct is; › 2. The sovereign instance).

**Member; cover and handle** — A participant in a group. Each member has two names. The **handle** is chosen by the member at enrolment, is unique in the instance, and is what the record and the public see. The **cover** is a label an administrator assigns so they can tell participants apart. It is deliberately *not* a legal identity, and only administrators see a cover and a handle together (`BIO_Membership_Architecture_v2.md` › 3. Cover and handle). Design note: the cover field must not invite someone to type a legal name.

**Administrator** — A custodian of the membership: the roster, capabilities, key approval and member lifecycle. A solo user is the administrator, and the membership machinery stays invisible until a second person exists. The first invitation creates a second administrator, and the group cannot grow past two members until that second administrator exists (the "two-administrator floor"). Administrators *see* every project but *direct* none: "sight is not authority" (`BIO_Membership_Architecture_v2.md` › 4. Administrators; › 7. Projects). **⚠ conflict:** §4.4 says "administrator status cannot be taken away", but §4.7 defines removal by a majority vote of all administrators, and `BIO_System_Design.md` › 3 (row 1) reports removal votes as BUILT. Read §4.4 as "no *single* administrator can strip another".

**Founder / operator (root of trust)** — Whoever holds the instance's `ADMIN_TOKEN` in the hosting account can take the group over. The corpus says so plainly: "The holders of ADMIN_TOKEN are the root of trust" (`BIO_Membership_Architecture_v2.md` › 4.6). The founder's session counts as an administrator for what it can see (§7, "THE FOUNDER IS AN ADMINISTRATOR HERE TOO").

**Capabilities** — The four working permissions an administrator grants: **contribute**, **publish** (ratify, which also needs a registered signing key), **create projects** and **administer**. **A capability a member lacks is absent from their interface, not shown and refused** (`BIO_Membership_Architecture_v2.md` › 5. Capabilities). The UI repeats the rule as "absent, not greyed" (`CIVICOS_UI_STATE.md` › The runtime; › New in v2: the release flow).

**Owner (project owner), participant** — Authority over a project belongs to its **owners**. The creator is the first owner, and only owners invite, remove participants, and set visibility. Toward a project a member is **uninvited** (sees nothing), **invited, not joined** (sees the skeleton, view only), or **joined** (full working rights, within their capabilities) (`BIO_Membership_Architecture_v2.md` › 7. Projects, 7.1–7.9). Publication doc: "the publisher is a manager of the project, by default its owner" (`BIO_Publication_v0_1.md` › 3, rule 2). No separate definition of **manager** was found.

**Invite / enroll** — An administrator's invitation produces a one-time **burner URL**. The URL is spent on use, and afterwards it reveals neither the group nor the invitee. At **enrolment** the member chooses a handle and a password. The cover and capabilities are already attached and cannot be edited by the member (`BIO_Membership_Architecture_v2.md` › 6. Invitations). A project invitation is a separate thing: an owner invites an existing member by handle, and the member joins with a checkbox (§7.2, 7.4).

**Discoverable / hidden** — Every project is one or the other. **Hidden:** people outside the project see nothing, not even that it exists. **Discoverable:** they see the project's existence and name, plus the one act that is for, asking to join. Its contents stay private. Only an owner sets it. The create and fork screens ask the creator to choose, with **neither option preselected**. Existing projects, and any creation that sends no setting, are Hidden (`BIO_Membership_Architecture_v2.md` › 7.14 Discoverable or hidden, and the request to join).

**Audience** — A *reader* of a published case, such as media, activists, government administrators or lawyers. The documents name eight professional audiences. An audience is distinct from a member or user type, though one person can be both (`BIO_Publication_v0_1.md` › 6. Audiences and output acts; `BIO_Case_Making_v0_1.md` › The frame).

## 2. Getting material in

**Capture** — Bringing a document's bytes into the record together with their provenance. A capture attests "these bytes, this URL, this time" and nothing more (`BIO_System_Design.md` › 3, row 2). Admission requires **provenance, never relevance** (`BIO_Intake_Doctrine_v1_1.md` › 1a).

**Acquire** — The step where the system fetches a source and records it. The path is "acquire → the register (the trust root) → promote" (`BIO_Content_Framework_v0_10.md` › 17. How content is organized and reached). A document's reading is produced at acquire and saved at promote (§16). `status.mjs 2` reports "capture and acquire" as BUILT. The corpus does not define the member-facing difference between *capture* and *acquire*. **UNDETERMINED — not found in corpus** as a user-level distinction.

**Grade (capture grade A/B/C)** — How verifiably the group obtained its copy. It is *not* a rating of how credible the source is or how much the information is worth. **A**: evidentiary archive capture (for example WACZ), required before external distribution. **B**: bytes fetched and hashed at receipt, enough for internal work. **C**: a reference only, with no archived bytes, which cannot carry a load-bearing claim in a distributed work product (`BIO_Intake_Doctrine_v1_1.md` › 3. Capture grades). **⚠ the word "grade" has three separate scales:** capture grade (A–C), **connection grade** (A–D, see below), and a content's **derivation cap**. They are "two scales [that] must never be composed into one number" (`BIO_Case_Making_v0_1.md` › R2; `BIO_System_Design.md` › 4). The UI must never merge them into one score.

**Provenance** — The record of where a document came from: the locator (URL, or "in hand"), the issuing authority, the retrieval time, the capture method, and the kind of actor who captured it (`BIO_Intake_Doctrine_v1_1.md` › 2. The intake contract). Provenance has two independent axes: the **source** (who issued it) and the **capture chain** (how faithfully it was obtained) (› 3).

**Doorbell (knock)** — The one route in that needs no account: anyone can hand the group material. What arrives sits in an inbox, with no attributed source, until a signed-in member pulls it in or discards it. A knock is not a capture and not an act (`BIO_Intake_Doctrine_v1_1.md` › 2a. The doorbell). **⚠** This inbox shares its name with the unrelated task inbox (same section).

**Release (from hold)** — A member's decision that collected material is verified, recorded under that member's name. AI may help with the review but may not decide (`BIO_Intake_Doctrine_v1_1.md` › 4a. Release from hold). In the UI it runs from **Review**, per document or as a checked batch. Nothing is prefilled, and crucial material gets no checkbox, with the reason shown (`CIVICOS_UI_STATE.md` › New in v2: the release flow). **⚠** In the UI, "release" is also a *software* release (see Plane).

**Monitor** — Watching a captured source for changes without anyone asking: the system re-checks on a schedule and detects changes by comparing digests (`BIO_System_Design.md` › 3, row 10; `status.mjs 10` BUILT). Standing requests and sweeps are covered in `BIO_Intake_Doctrine_v1_1.md` › 4.

## 3. What the record holds

**Record** — Everything the instance holds and can prove: captured material with provenance, content, meaning, inquiries and findings, stored and checked on every write (`BIO_System_Design.md` › 2; › 3, row 3). **⚠** The word is also used narrowly, as in "the *published* record" versus "the working corpus" (`BIO_Membership_Architecture_v2.md` › 1.2).

**Bundle** — The record's basic stored object. It is one typed item (Information, Inquiry (formerly Focus), Project, Action) with a state surface (frontmatter plus fixed prose sections) and an append-only history (`BIO_State_Rules_Consistency_v1_5.md` › 2. Bundle anatomy; › 4). An **Information** bundle holds one line of evidence, with its attesting documents inside it (`BIO_Intake_Doctrine_v1_1.md` › 1).

**Document** — What is *harvested*: a capture, identified by its bytes. "Holding a document is not holding an answer" (`BIO_Content_Framework_v0_10.md` › 14.1 The definition; › 14.2 The model; `CLAUDE.md` › §2).

**Content (DEC-23)** — **The unit the record points at: a reference to a part of a document, up to the whole document.** Citations, basis legs and connections point at content, not at whole files. "Pointing at a 300-page PDF is not pointing." Each piece of content carries an **extent** (which part) and an **extraction method** (how the text was produced) (`BIO_Content_Framework_v0_10.md` › 14.1; › 14.2).

**Extraction** — Turning document bytes into content: the publisher's own text layer, a machine reading, OCR, or a member's transcription. **Machine-read text is never shown as if it were the publisher's text**, and OCR never raises a capture grade (`BIO_Content_Framework_v0_10.md` › 14.2; › 14.4; `BIO_System_Design.md` › 7). A member may **attest** that content matches the page, and that is the only route to the top grade (› 14.2).

**Derivation cap** — The strongest fidelity a content's extraction chain can support. It is the weakest step in the chain, because every derivation step weakens and none strengthens. Where a step was never measured, the cap is stated as undetermined (`BIO_Content_Framework_v0_10.md` › 14.2).

**Meaning / derivation** — What is *derived* from documents and content: entities, connections and progressions, each stating how strongly it is established. "Documents are harvested; content is extracted; meaning derives from both" (`BIO_Content_Framework_v0_10.md` › 14.1; `BIO_System_Design.md` › 3, row 6).

**Entity; subject** — An entity is a stable identity (a person, office, ordinance, parcel) with aliases and relations. The **subject registry** used by declared bias is *the same construct* as the entity registry (`BIO_Content_Framework_v0_10.md` › 13, "The subject registry and the entity axis are the same construct"). **⚠** "Subject" is used loosely elsewhere, for example an action as the *subject* of a finding (`BIO_Case_Making_v0_1.md` › 8).

**Connection** — A link between two pieces of content, stored as data. There are two kinds, and **the UI must show them apart**. **Referential** means two things are about each other. **Temporal** means one should follow another, and its most valuable form is an absence with a due date (`BIO_Content_Framework_v0_10.md` › 8. Connections). **Connection grade** records how the link was established: **A** by the source's own link, **B** by a shared identifier, **C** by a matching name or date (flagged for a member to confirm), **D** by a member's stated basis alone (› 8.1 Connection GRADE). The machine never creates a D.

**Progression** — The shape a happening takes over time, such as meeting → agenda → minutes, or need → budget → RFP → award → contract. A **missing predecessor** (an award with no solicitation) and an overdue successor are findings in their own right (`BIO_Content_Framework_v0_10.md` › 8.2 Progressions).

**Sparse (the four levels)** — Sparse is normal. A search may need to cover **meaning, content, documents and the open internet**, in any order, because absence at one level is not evidence of absence at the next. No meaning may mean nothing was extracted. Nothing extracted may mean the document was never read. No document may mean nobody looked. **Saying which of these is true is a first-class obligation**, and "a search that returns documents has not finished" (`BIO_Content_Framework_v0_10.md` › 14.3 The three axes and the four-level search; `CLAUDE.md` › §2). The recorded states are: never looked · looked, absent · looked, indeterminate · present (for documents), and not extracted · partial · extracted · unextractable (for content) (› 14.3).

**Namespace: `bio` vs `scratch`** — Every request names one of exactly two stores. **`bio`** is the real record. **`scratch`** is a separate store used for live verification, which is swept afterwards. Any other value is refused (`status.mjs 1` → `1.namespace-scope` BUILT; `BIO_Distribution_v0_1.md` › 6, rung 6). Public read paths are pinned to `bio` (`BIO_Publication_v0_1.md` › 3, rule 10). No member-facing meaning of `scratch` was found in the corpus.

## 4. Asking, concluding and making a case

**Inquiry (supersedes Focus, which superseded Problem)** — A member's question, as a record object. It nests: a sub-question is an inquiry cited in another inquiry's basis. It concludes as a **finding**. **Superseded names:** `problem` became `focus`, and on 2026-08-01 Bob ruled "`inquiry` early (NOT `focus`)" (`BIO_Case_Making_v0_1.md` › Naming: three names for three phases; › THEY COLLAPSE). Older documents still say Focus or Problem; read them as inquiry (`BIO_Content_Framework_v0_10.md` front matter, §12). Its live states are open, deferred, dismissed, concluded and divided (same front matter). An inquiry can also be **divided** into two or more, and the apportioning is an authored act (`BIO_Case_Making_v0_1.md` › Division).

**Question / answer** — A *question* is what an inquiry holds ("a question nests, concludes as a FINDING", `BIO_System_Design.md` › 3, row 8). *Answer* appears only in the purpose line. **UNDETERMINED — not found in corpus** as a separate object; the closest defined term is *finding*.

**Finding; leg / basis** — A finding is an inquiry that reached a conclusion. Its **legs** (its basis) rest on content and on other inquiries, each with an earned grade. An action is never a leg (`BIO_Case_Making_v0_1.md` › Naming; › 8 · An action is never a leg; `BIO_System_Design.md` › 3, row 8). **Undetermined leg:** a leg whose strength is undetermined leaves the whole chain **unrated**. It neither lowers the chain to the floor nor gets ignored (`BIO_Case_Making_v0_1.md` › R1).

**Hunch** — A suspicion authored with no captured basis. It is temporary declared bias that lets a member explore before evidence exists, and it is **debt that must be cleared before publication** (`BIO_Declared_Bias_v0_1.md` › RULED 2026-08-01: a HUNCH is temporary declared bias; `BIO_Content_Framework_v0_10.md` › 14.4).

**Project** — The investigation: a bundle with an objective and a lifecycle (forming → investigating → matured → closed), its participants, and its owners. It may contain dead ends (`BIO_Membership_Architecture_v2.md` › 7; `BIO_Content_Framework_v0_10.md` › 12; `BIO_Case_Making_v0_1.md` › 1). A project's name is unique in the instance (§7.1).

**Case (case making)** — **A production of a project**: a set of versioned findings, at least one of them load-bearing, published by the project against the project's own **bar** (standard of evidence) (`BIO_Publication_v0_1.md` › 2. The objects; DEC-72). **Superseded:** the 2026-08-01 naming made "case" the *published phase* of an inquiry. DEC-72 (2026-08-10) replaced that and made the case its own object (`BIO_Case_Making_v0_1.md` › Naming, AMENDED note). Case making is "what the whole system is FOR" (`BIO_System_Design.md` › 3, row 8).

**Story (vs narrative)** — "A **story** is what the record supports, told so a person can follow it; a **narrative** is a frame imposed on the material." The tool "should make a supported case easy to build and an unsupported one hard to state". Show strength, name what was left out, and never draft framing for the member (`BIO_Case_Making_v0_1.md` › 4a. "Less narrative" is a design constraint). Temporal connections are "followed to understand a STORY" (`BIO_Content_Framework_v0_10.md` › 8).

**Action; action plan** — An **action** is a step the group takes toward the civic system (states planned → active → awaiting_response → resolved | abandoned), with a **risk tier**: 1 file freely · 2 file with caution · 3 do not file without counsel · or undetermined (`BIO_Case_Making_v0_1.md` › 2. `action` IS the impact substrate). An **action plan** answers "what do we do about it?". It is not a claim about the world, so it is not an inquiry (› THE ACTION PLAN, 1).

**Declared bias** — The lens a member brings, made part of the record rather than denied. A bias is a set of statements of three kinds: **scrutiny**, **inference** and **pattern**. The bias acknowledgement travels with every published case (`BIO_Declared_Bias_v0_1.md` › Why this exists; › Statement kinds; `BIO_Publication_v0_1.md` › 2).

## 5. Acting, reviewing, publishing

**Queue** — "Things that want me", grouped by the case they belong to. Items are a **finding**, an **obligation** or a **condition**, and each says what it offers (do / forward / resolve, or adopt / defer / dismiss). An entry stays standing and accumulates; it is not a stream. A resolution is attributed and visible, never a silent deletion (`BIO_Interaction_Constructs_v0_1.md` › The revised set: TWO constructs).

**Act** — Doing something to a record or a set, in one motion: choose, **see what it will refuse and why before it runs**, write the reason yourself, get a receipt (`BIO_Interaction_Constructs_v0_1.md` › The revised set).

**Rung ladder** — **⚠ conflict: two different ladders carry this name.** (1) Every act's *weight*: **reversible · reasoned · terminal · attested · irreversible**, published by the plane (`BIO_Interaction_Constructs_v0_1.md` › The revised set, "THE RUNG LADDER"). (2) The *sequence* of authored acts: release → stand behind → ground → conclude → accept → ratify (`BIO_System_Design.md` › 3, row 12), which `BIO_Publication_v0_1.md` › 1 extends with "→ publish". Also, "weight" separately names how an act applies to a set: refuse / report / per-item.

**Select (selection-scoped action)** — Any act can be applied to a set. Selection is a modifier, not a separate act. **Nothing is preselected.** An action lands only on the set the member saw, and a refused item never silently drops out of the result (`BIO_Interaction_Constructs_v0_1.md` › S · SELECTION-SCOPED ACTION).

**Review** — **⚠ two meanings.** (1) The UI surface where collected material is checked and released (`CIVICOS_UI_STATE.md` › New in v2: the release flow). (2) A **review copy** (also "advance copy", never "pre-publish"): a case handed to a named recipient *beside* publication. It is marked as what it is, never leaves the instance, and names what is missing (`BIO_Publication_v0_1.md` › 6A. The review copy).

**Ratify** — The signed act that moves material from the working corpus into the published record. It needs the publish capability and a registered signing key, and only a person's own session can deliver it, never a machine (`BIO_Membership_Architecture_v2.md` › 1.2; › 5; `BIO_Assistant_and_AI_Roles_v0_1.md` › 3, rule 4).

**Publication; working space vs published space** — Publishing is **one-way**: what was published never stops answering, and a correction is a new **edition** (`BIO_Publication_v0_1.md` › 2; › 3, rule 1). The UI shows two visual spaces, **working** (on `--paper`) and **published** (on `--sheet`). The **fence** between them is drawn as a printer's double rule and appears nowhere else (`CIVICOS_UI_STATE.md` › The design source of truth). Anyone can verify the published projection without a credential (`BIO_Publication_v0_1.md` › 3, rule 10).

**Refusal (refusal codes)** — When the system declines an act, it says so **by name**. Every refusal carries a named code and a canned translation, and an untranslated code fails the test harness (`BIO_Assistant_and_AI_Roles_v0_1.md` › 3, rule 10, DEC-49). The UI renders the plane's refusal word for word rather than rewording it (`CIVICOS_UI_STATE.md` › New in v2). Codes are named constants such as `NAME_TAKEN` (`BIO_Membership_Architecture_v2.md` front matter, §7).

**Undetermined** — A display primitive, not an act. It must be **rendered identically everywhere** (at least six places) as "what we do not know, and why we do not know it". It is never dressed as an error and never invented past (`BIO_Interaction_Constructs_v0_1.md` › U · UNDETERMINED).

**Guiding voice** — Inform once at the act and never nag (DEC-69). Nothing is prefilled. A missing capability is absent, not greyed (`BIO_System_Design.md` › 3, row 12; › 7).

## 6. The machine

**Assistant / AI roles** — The assistant is one way in on every surface. "**The machine may do the looking; the member does the concluding**" (DEC-24). Its four roles are **FIND** (search all four levels and name where nothing was found), **PURSUE** (gather material for and against a claim), **EXTRACT** (document → content) and **CHECK** (read the record adversarially). It may also request a capture. It never attests, never concludes, and never writes the member's reason, and its work is labelled as machine work (`BIO_Assistant_and_AI_Roles_v0_1.md` › 1; › 2. The four roles; › 3). An assistant-surfaced item must *look* derived (rule 8).

**Investigative session (run)** — The built form of the assistant: a bounded, logged run with an observation log of where it searched and where it stopped (`BIO_Assistant_and_AI_Roles_v0_1.md` › 4). The member-facing assistant flow and wizard are designed but **absent** (› 5).

**Skill / skill pack** — **⚠ three uses.** (1) The **skill pack**: the versioned, five-layer instructions the investigative session runs under. "A skill is instructions; a fence is code" (`BIO_Assistant_and_AI_Roles_v0_1.md` › 3, rule 5; › 4). (2) The retired **bundle skill**, the old single write authority, whose bundle format survives (`BIO_Bundle_Skill_Composite_Design_v1_7.md` front matter). (3) The roadmap's numbered skills, for example "Skills 7 and 8 remain unbuilt" (`BIO_Complete_Roadmap_v5.md` front matter).

## 7. Where it runs

**Plane** — The server behind an instance: a Cloudflare Worker (`bio-plane`, which exposes the ops) in front of a Durable Object with SQLite that holds the record, with captured bytes in R2 (`BIO_System_Design.md` › 6. The runtime shape; `BIO_Distribution_v0_1.md` › 2). Its versions are signed **releases** (› 3).

**The UI (`civicos-ui`)** — The member-facing app, a separate Worker proxied to the plane so UI code never touches the signed plane (`CIVICOS_UI_STATE.md` › What runs where, and why the UI is a separate worker). Its design tokens live in `civicos-ui/tokens.css`. Verdigris is the only signature colour. Terracotta is limited to one attention element per screen. Serif is judgment, sans is plain speech, mono is machine fact. The radius ceiling is 2px (› The design source of truth, the v1 entry of 2026-07-27, which may be dated).

**newgroup (installer)** — A Worker a group opens in a browser. It installs a sovereign instance into the group's own Cloudflare account step by step: authorise, check the plan, create the buckets, install and byte-verify the plane and its fleet (`BIO_Distribution_v0_1.md` › 5. The installer). **⚠ conflict:** Distribution › 4 says the fleet waits on "Bob's click" to deploy `newgroup`. `BIO_System_Design.md` › 6 records the correction (BOB #25, 2026-09-22): DIST deploys the installer at every release cut.

**Fleet** — Helper Workers beside the plane, each doing one heavy job: `pdf-worker`, `ocr-worker` and `agent-worker`. A missing member is stated, never hidden (`BIO_Distribution_v0_1.md` › 4. The fleet).

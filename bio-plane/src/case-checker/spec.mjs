/* case-checker — the readable specification of each case-file format version (requirements:
 * `build/requirements/case-checker.md` R14, R15; K1134 (1); DEC-112 (3) "an open specification").
 *
 * Written from `case-grammar` R11–R13 (the case document's `method:`, `materials:` and `material_attestations:` blocks
 * and the case file) and from what this checker checks (R1–R11, R18), so that anyone can write a checker of their own
 * from it. Each version's text is held here whole and served by `casefilespec` (R15). Its version names the format it
 * specifies. No place is named in it (R17). */

const V1 = `# The case file, format bio-case-file/1

This document specifies version 1 of the case file: the one file (or set of parts) that carries a published case whole, so that anybody can check it and recreate its findings without a copy of CivicOS. It states every field, kind and rule a checker needs. A checker built from this text alone, given the same case file, answers the same as the checker CivicOS runs.

Recreating a case shows that what it carries is intact and consistent with what it states. It does not show that the case is true, and it is not an endorsement of it.

## 1. Parts

A case file is one or more parts. Each part is a ZIP archive whose every entry is stored, not compressed, with fixed timestamps (1980-01-01 00:00:00), names in UTF-8, and no encryption. A case file too large for one part (64 MiB) is split into several; nothing is left out for size.

Every part carries the same manifest, byte for byte, as the entry \`MANIFEST.json\` at the archive's root. Every other entry is a file the manifest lists, at \`<root><path>\`, where \`<root>\` is the manifest's \`layout.root\` when it states one, else the case id followed by \`/\`. A part carries no entry the manifest does not list.

## 2. The manifest

The manifest is a JSON object:

- \`format\`: \`bio-case-file/1\`.
- \`group\`: the slug of the group that published the case.
- \`case\`, \`edition\`: the case's id and its edition (an integer of 1 or more).
- \`doc_sha\`: the SHA-256 (64 lowercase hex) of the case document's bytes.
- \`keys\`: the signing keys, each \`{key, fingerprint}\`. \`key\` is an OpenSSH \`ssh-ed25519\` public key; \`fingerprint\` is its OpenSSH fingerprint, \`SHA256:\` followed by the unpadded base64 of the SHA-256 of the key's wire bytes.
- \`parts\`: each part, \`{index, sha256, bytes}\`. A part's \`sha256\` is the SHA-256 of the canonical JSON (section 7) of that part's file rows \`[{path, sha256, bytes}]\` in path order, and its \`bytes\` the sum of those files' lengths. (The manifest sits inside every part, so it cannot list a digest of a whole part's archive.)
- \`files\`: every file, \`{path, sha256, bytes, part, kind}\`, with \`finding\` (a finding id) on the kinds of one finding and \`ref\` (a material's \`ref\`) on the kinds of one material.

## 3. The kinds of file

- \`case_document\`: the signed case document (section 4). Exactly one.
- \`case_signature\`: the case document's signature, an armored SSH signature (section 5). Exactly one.
- \`complete_edition\`: the complete edition, one HTML file (section 6). Exactly one.
- \`finding\`: one finding's published bytes, with \`finding\`.
- \`finding_signature\`: a member finding's signature, with \`finding\`.
- \`grading_facts\`: one finding's grading facts as recorded at the act, JSON \`{legs, levels?}\`, with \`finding\`. Each leg is \`{target, kind, role, grade, grade_axis, grade_source, ground, answer?, origins?, origins_complete?, captures?, author_key?}\`; \`kind\` is \`document\`, \`observation\`, \`inquiry\` (another finding) or \`imported\` (another group's finding); \`answer\` is, for an \`inquiry\` leg, the pair the finding it rests on answered, per axis \`{state, grade}\`; \`levels\` maps an observation id or a capture's SHA-256 to the attribution level in force.
- \`passages\`: one finding's relied-on passages, a JSON list of \`{content_id, capture_sha, extent, quoted, chain}\`, with \`finding\`. \`extent\` is in the extent grammar's canonical form; \`chain\` is the text chain the passage was read through, or null.
- \`document\`: a captured document's bytes, whole, with \`ref\`.
- \`extracted_text\`: a document's extracted text, with \`ref\`: plain text whose pages are separated by form feeds, or JSON \`{units: [{extent, text}]}\`.
- \`observation\`: an observation's text, whole, with \`ref\`.
- \`attestation\`: a signed account, a timestamp token or a co-archive record, with \`ref\`.

## 4. The case document

The case document is text: a front matter between two lines \`---\`, in the record's restricted grammar (top-level keys; a key whose value is a block holds a map or a list of flat maps; scalars are \`null\`, \`true\`, \`false\`, integers, decimals, double- or single-quoted strings, or bare words), then a Markdown body. Its format is \`bio-case-document/6\` (\`/5\` to \`/1\` are older). A checker reads these fields:

- \`case_id\`, \`case_edition\`, \`case_findings\` (the members), \`case_roles\` (per member \`{target, role, version_sha, edition}\`, \`role\` \`load_bearing\` or \`supporting\`, \`version_sha\` the SHA-256 of the member's published bytes).
- \`case_strength\`: each member's frozen pair, one row per member and axis \`{target, axis, state, grade, …}\`. A case has no strength of its own.
- \`required_strength\`: the bar, \`{declared, capture, connection, …}\`; an axis with a grade is declared.
- \`method:\` \`{grading, checks}\`: the grading method's version and the catalogue version the document was checked under.
- \`materials:\` one row per document or observation any member's chain reaches, \`{ref, kind, sha, text_sha, origin, archived_copy, included, rests_under}\`. \`included\` is true when the material travels whole. Material whose source's identity is withheld is listed like any other.
- \`material_attestations:\` one row per attestation, \`{ref, by_kind, by, level, at, signature, recorded_in}\`. \`by_kind\` is \`member\` (a capturing member's signed account, or an observation's author; at \`group\` or \`project\` level it carries no handle, key or signature), \`co_attestation\` (a trusted timestamp or a co-archive), \`project\` (the project's record holds the material) or \`group\` (\`signature\` is the literal \`case\`: the case document's signature covers it).
- \`capture_accounts:\` each signed account \`{capture, by, at, text_b64, signature_b64}\`.
- \`accepted_work:\` one row per member and leg resting on another group's finding, \`{member, leg_of, ref, group, case, edition, finding, manifest_sha, pair, result, gaps, accepted_by, accepted_at, reason}\`.

## 5. Signatures

Every signature is an armored SSH signature (SSHSIG) by an \`ssh-ed25519\` key, in the namespace \`bio-ratify\`, over the exact bytes of one statement:

- the case document: \`bio-ratify-case <case_id> <case_edition> <doc_sha>\` and a newline;
- a member finding: \`bio-ratify <finding id> <version_sha>\` and a newline;
- a member's account of a capture: \`bio-capture-account <capture sha>\`, a newline, then the account's text.

The key a signature embeds must be among the manifest's \`keys\`. A checker given the group's published keys also says whether each signing key is among them; a checker given none says the keys were not checked against that list.

## 6. The complete edition

The complete edition is one HTML file rendered from the case file's other files, with every style inline, no script and no external reference. The same case file always renders the same bytes, so a checker renders it and compares.

## 7. Canonical JSON

Canonical JSON is JSON with every object's keys sorted by code unit, no whitespace, and strings and numbers as \`JSON.stringify\` writes them.

## 8. Checking a case file

A checker answers, for each finding (a member, or a finding a member's chain reaches through its \`inquiry\` legs), one result: \`recreated\` (nothing missing, nothing differs), \`recreated_in_part\` (something is missing and nothing differs) or \`did_not_recreate\` (something differs). A check of the whole case that finds something missing or differing counts for every finding. Each entry names what is missing or what differs in words a reader can act on, such as a document to fetch with its fingerprint and origin.

1. Integrity. The manifest follows section 2. Every file's SHA-256 and length match its row; every part's files recompute its \`sha256\`. An absent file is missing for each finding that needs it; one that does not match differs.
2. Signatures (section 5). A signature that fails differs, for the case and every finding it covers. Each \`material_attestations:\` row is checked by its kind: a \`member\` row with a signature is verified over its account; a \`group\` row is the case document's signature; a \`project\` or \`co_attestation\` row must name a material the manifest lists. A failed row differs for each finding whose chain reaches that material.
3. Passages. Each passage's quoted text occurs (whitespace compared as single spaces) in its document's extracted text at its extent, and its \`content_id\` is the SHA-256 (of the UTF-8 bytes) of the canonical JSON of \`{v: 1, capture_sha, extent, chain}\`, where \`extent\` is a string holding the canonical JSON of the extent in its canonical form, and \`chain\` a string holding the canonical JSON of the chain, or null. Not found differs; extracted text not carried is missing.
4. Grades. Each finding's pair is recomputed from its grading facts by the grading method the case states (\`method.grading\`), whose text is published with the case's complete edition. A recomputed grade unlike the recorded one differs; a method version the checker does not hold is missing.
5. The bar. A load-bearing member reaches the recorded bar on every declared axis, or differs naming each axis. A supporting member is not asked; a case with no bar has none to meet.
6. Publication checks. The case document passes the publication checks of the catalogue; a check that needs the publishing copy's record is named as not asked. When the case states another catalogue version than the checker's, the answer says the checks ran at the checker's version.
7. Presentability. Every material a load-bearing member's chain reaches is listed in \`materials:\` as \`included: true\` and carried whole (its bytes and extracted text, or an observation's text). Not carried is missing; not listed, or listed as not included, differs.
8. Completion. Bytes supplied later whose SHA-256 is a missing file's fingerprint fill that gap; other bytes are named and never used.
9. The complete edition. The carried complete edition equals the one rendered from the rest of the case file, or differs.
10. Another group's work. A leg on another group's finding (\`imported\`) is recreated up to that leg: its grade is the \`accepted_work:\` row's \`pair\`, passages and material are not followed past it, it adds nothing missing, and the answer names that group's case file (group, case, edition, finding and manifest SHA-256) as the place to check it.
`;

/** R14: every specification held, by the format it specifies. */
export const CASE_FILE_SPECS = Object.freeze({ "bio-case-file/1": V1 });
/** R15: the versions held, oldest first. */
export const CASE_FILE_SPEC_VERSIONS = Object.freeze(Object.keys(CASE_FILE_SPECS));

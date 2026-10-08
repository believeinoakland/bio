# setup-page (T37)

**Status** · session_01QatEuArYAp7eWVj2CoY8JU · depth 2 · WORKING · handled B0

## J1 · QUESTION

R30 (N777), the generic template (`icap`). The amended text asks each `config` field "a generic template's `engine_family` and `handling` among them", so I read it as: templates are now offered "Add this tool" like any entry, each listed field asked by its `label` as a text field and sent under its `name` as typed (a string), required ones checked before sending. But on the real plane such an add cannot succeed from this page: (1) the template's list names no `host`, and file-safety refuses a template with no host (`PROVIDER_UNKNOWN`, its R28 via `template.host`/`config.host`), while R30 forbids sending a field the list does not name; (2) `engine_family` must be a list and `handling` an object (file-scanner `resolveDescriptor`), not typed text; (3) the `handlingDigest` file-safety checks is the digest of the merged handling, which the page cannot show or compute before the maker's statement is given. So every template add would end in file-safety's refusal, stated in its words (R30 is met; the step goes on).
Best reading, which I am building now: the letter (templates addable, their fields asked by label, the refusal stated). Alternative: keep templates unaddable on the page with its note (as today), which would need R30's sentence re-worded. Either way the gap is file-scanner's/file-safety's (a template's list naming `host`, structured values, a digest for a stated handling): I will REPORT it.

# setup-page (T37)

**Status** · session_01QatEuArYAp7eWVj2CoY8JU · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R30 (N777), the generic template (`icap`). The amended text asks each `config` field "a generic template's `engine_family` and `handling` among them", so I read it as: templates are now offered "Add this tool" like any entry, each listed field asked by its `label` as a text field and sent under its `name` as typed (a string), required ones checked before sending. But on the real plane such an add cannot succeed from this page: (1) the template's list names no `host`, and file-safety refuses a template with no host (`PROVIDER_UNKNOWN`, its R28 via `template.host`/`config.host`), while R30 forbids sending a field the list does not name; (2) `engine_family` must be a list and `handling` an object (file-scanner `resolveDescriptor`), not typed text; (3) the `handlingDigest` file-safety checks is the digest of the merged handling, which the page cannot show or compute before the maker's statement is given. So every template add would end in file-safety's refusal, stated in its words (R30 is met; the step goes on).
Best reading, which I am building now: the letter (templates addable, their fields asked by label, the refusal stated). Alternative: keep templates unaddable on the page with its note (as today), which would need R30's sentence re-worded. Either way the gap is file-scanner's/file-safety's (a template's list naming `host`, structured values, a digest for a stated handling): I will REPORT it.

## J2 · REPORT

Found in other modules (B2: for next.md), against file-safety R27/R28 and file-scanner R19/R29 as they read today:
1. A generic template cannot be added from any settings page that asks only the entry's `config` list (setup-page R30 as amended): (a) the three templates' lists (`icap`, `syslog-tls`, `https-webhook`; file-scanner `catalogue.mjs` TEMPLATE_CONFIG) name no `host`, yet file-safety R28 refuses a template with no host `PROVIDER_UNKNOWN` (`index.mjs` securityToolAdd, `template.host` or `config.host`); (b) `engine_family` must be a list and `handling` an object (`resolveDescriptor`), while a field asked by label carries text; (c) `handlingDigest` must equal the digest of the merged handling, which no page can show before the maker's statement is given. Setup-page now asks the template's fields by label and states file-safety's refusal (K2239).
2. The same host gap for a non-template entry: `splunk-hec` is `host_from_spec` with `hosts: []` and an empty `config` list, so a page that sends only listed fields can never name its collector's address; file-safety exempts `host` and `region` from `CONFIG_UNKNOWN` but no list names them, so they are never asked. Suggest: the entries that need an address list `host` (and `region` where it applies) in their `config`, labelled.
No generated artifact made stale by this job (setup-page feeds the plane bundle, regenerated at the layer close as usual).

# record-core (T46)

**Status** · session_01U4VpUHnYKCeaZcQvK8i5XD · depth 2 · WORKING · handled B1

## J1 · QUESTION

R83, one corner the text leaves open: what `getSetting(name, {strict: true})` answers when the read itself fails (no `settings` table, a storage that throws, a `name` whose string form throws), since R83 says the strict form never throws. My reading, which I am building: it answers `SETTING_UNREADABLE`, never `null` (fail closed: a value that may have been set is not reported unset; public-read R34 then reads `undetermined`, as it already does for a throw). Also: a stored value that is not text (a blob) reads `SETTING_UNREADABLE`; an options object whose `strict` is anything but `true` (or that throws when read) is the non-strict form; the non-strict form is left exactly as today, its read failure included. No answer needed unless you want otherwise; I carry on.

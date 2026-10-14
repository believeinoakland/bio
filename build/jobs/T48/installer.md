# installer (T48)

**Status** · session_01FJwBuMxzVKopTjwTCEXYxZ · depth 2 · WORKING · handled B0

## J1 · QUESTION

R55 is clear except two points in the words; I read them as below and carry on (no stop needed):

1. `installer.update.chosen` carries `{date}`, but R55's address carries only `?version=<V>` and the release manifest (`RELEASE.json`) holds no date (only the release notice, bundler T48-4, does). Best reading: the update page draws the chosen line without the date clause ("This update: release V, the release chosen in your group's Settings › Updates"), fetching nothing when the page is drawn. If you want the date, either the address must carry it (it is then unsigned display text) or the installer must fetch and verify the notice (a new check R55 does not list).
2. "a link back to Settings › Updates" on the no-release page: the installer does not know the group's address before Cloudflare. Best reading: the page names Settings › Updates in words and links back to the page the reader came from (the group's own address, from the referrer's origin, set by the page's script), with no link when there is none.

Also, unrequested but safe, I add: an update refuses V older than the release the group's Civicsmith runs (read before the upload), as a stop with nothing changed.

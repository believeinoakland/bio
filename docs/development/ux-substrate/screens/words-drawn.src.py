# DEC-259: the remaining screens keyed (K3268): every sentence a member reads on a screen is a keyed word, word for word
# (check_words_drawn.mjs). DEC-257 keyed the eleven screens on T49's path; this file keys the other fifty-eight, by the same
# rules: where a module's adopted row (DEC-252) and the drawing differed slightly, the drawing governs and the row is reworded
# (REWRITE); where the row is a design ruling's, or the drawing inlined sample data the row has no placeholder for, the
# drawing was changed; otherwise a similar undrawn row under screen.<id>. is reworded, or a new key screen.<id>.<slug> is
# minted. A sentence that carries sample data is keyed as a template, the drawing an instance of it; a sample record (a
# document's title, a file's name, a member's words) is marked .mk-data in the drawing and is not keyed.
# Run: python3 words-drawn.src.py (after words-t49.src.py), then node build_words.mjs, which adds these rows after T49's and
# applies REWRITE in its add(), failing on a reworded key that no row carries.
import json, os
W = []
def w(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note='DEC-259' + (': ' + note if note else '')))
REWRITE = {}

# account
w('screen.account.explain.help', 'Promptly: every explanation opens when you rest on something for half a second. On a longer pause: marks and names still do; what screens, sections, the rail and acts are waits a second and a half, so less opens while you move. Nothing is ever hidden, and keyboard focus or a tap shows everything at once. New members start with promptly; after a month Civicsmith asks once whether to keep it. Alt+Shift+I or the masthead switches it at any time.', False, 'under the Explanations choice')
w('screen.account.signout.note', "Everywhere ends your sign-in on every phone and computer, this one included. Use it if you lost a device or signed in somewhere you shouldn't have.", False, 'under the two sign-out buttons')
w('screen.account.password.heading', 'Password and signing key')
# answers
w('screen.answers.count.line', '{rows} rows · {count} with {rule} (a count, method shown)', False, "a table's count without the assistant: {rule} the counting rule as written")
# archive
w('screen.archive.capturedby', 'Captured by {name} from {source}, {date}', False, "under an archive's name: who captured it, from where and when")
w('screen.archive.samefingerprint', 'Anyone can cut the same file out with ordinary tools and get the same fingerprint.')
w('screen.archive.samename', '{count} entries share this name', False, 'two entries of the archive with one name')
w('screen.archive.samename.each', '{count} entries share this name; each is filed by its number')
w('screen.archive.notfiled.password', 'Not filed: the archive locks this file with a password. It is listed, never opened.')
w('screen.archive.notfiled.size', 'Not filed: {size}, over the {limit} limit for one file. Capture the {kind} from its own address.', False, '{kind} the kind of file, such as video')
w('screen.archive.higher.heading', 'A higher grade for one file')
w('screen.archive.higher.how', 'A file here can earn a higher grade only by being captured on its own, from its own source; the new capture lands beside this one, and nothing is regraded.')
w('screen.archive.higher.capture', 'Capture a file on its own', False, 'a link to Add to the record')
w('screen.archive.refused.head', 'Could not open this archive, because {reason}.', False, '{reason} such as "two of its entries claim the same bytes"')
w('screen.archive.refused.note', 'A damaged or tampered archive is refused whole rather than filed in part. If the city has a clean copy, capture it again from its address; it lands beside this one.')
REWRITE.update({
  'screen.archive.summary': 'Opened when it was captured: {filed} files filed and held for review beside it, {held} already held, {notfiled} not filed, {folders} folders.',
  'screen.archive.alreadyheld': 'Already held · the same file {name} captured directly on {date}; this copy is kept as a second sighting of it',
  'screen.archive.folder': 'A folder · its {count} files are listed and filed below it',
  'screen.archive.refused.none': 'Nothing in it is filed. The archive itself stays captured exactly as it arrived, with its grade, and anyone can check why it was refused.',
})
# --- end DEC-259
keys = [x['key'] for x in W]
dup = sorted({k for k in keys if keys.count(k) > 1})
assert not dup, 'duplicate keys: ' + ', '.join(dup)
assert not set(REWRITE) & set(keys), 'a minted key is also reworded'
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'words-drawn.json')
open(out, 'w').write(json.dumps(dict(rows=W, rewrite=REWRITE), indent=1, ensure_ascii=False) + '\n')
print(f'words-drawn.json: {len(W)} rows, {len(REWRITE)} reworded')

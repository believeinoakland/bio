# The words T47 owes the design stream (DEC-200; BOB's B156, B157).
# Each entry: (key, English, protected, note). Refusals say what happened, then what to do (DEC-83). Placeholders in {braces}
# are filled by the screen. Run build_words.mjs after editing: it reads words-t47.json, which this file writes.
# Run: python3 docs/development/ux-substrate/screens/words-t47.src.py
import json, os
W = []
def w(key, en, prot=False, note=''):
    W.append(dict(key=key, en=en, protected=prot, note=note))
NS = ' Nothing was sent.'
NC = ' Nothing was changed.'

# --- Watching an address (monitoring R74: monitorset turns watching on or off; monitor checks once)
w('refusal.MACHINE_CANNOT_SET_MONITORING', 'Only a member turns watching on or off, and this came from an automated credential.' + NC, False, 'C-18.20')
w('refusal.MONITOR_SET_REFUSED', 'Say whether this document is watched, yes or no, and, if you give one, how often, as one of the listed frequencies ({field} isn\'t).' + NC, False, 'C-18.21, naming the field')

# --- A project's own bar (strength R40)
w('refusal.PROJECT_BAR_NO_REASON', 'Setting this project\'s bar needs your reason, kept on the record with the change.' + NC, False, 'C-107.4')

# --- The safe view's queue (file-safety R43)
w('refusal.RENDER_QUEUE_UNREADABLE', 'Your group\'s Civicsmith couldn\'t read its list of files waiting for a safe view, so none was made just now. Try again in a moment; if it keeps happening, tell an administrator.', False, 'C-140.43; a safe view is installed but its queue could not be read')

# --- Settings (record-core R25, R26)
w('refusal.SETTING_INVALID', 'That isn\'t a value this setting takes. Choose one of the setting\'s own values.' + NC, False, 'C-102.32')
w('refusal.SETTING_NOT_JSON', 'That value can\'t be kept as a setting: a setting holds words, numbers, yes or no, or a list of those.' + NC, False, 'C-102.33')

# --- A run on a member's own sign-in (credentials R63)
w('refusal.AI_RUN_CREDENTIAL_MALFORMED', 'The run couldn\'t start: the pass it needs to work for you was malformed.' + NS + ' Try again; if it happens again, tell an administrator.', False, 'C-29.41')

# --- Writing help on a test instance (screens-settings R6, N984)
w('ai.label.untested.writinghelp', 'Not yet tested: this help with writing hasn\'t yet passed Civicsmith\'s tests on real matters. Read it through before you use any of it.', True, 'on writinghelp\'s marked answer on a test instance')

HERE = os.path.dirname(os.path.abspath(__file__))
keys = [x['key'] for x in W]
assert len(keys) == len(set(keys)), 'duplicate key'
json.dump(W, open(os.path.join(HERE, 'words-t47.json'), 'w'), indent=1, ensure_ascii=False)
print(f'words-t47.json: {len(W)} entries, {sum(x["protected"] for x in W)} protected')

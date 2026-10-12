# The words T47 owes the design stream (DEC-200; BOB's B156, B157; DEC-201, B158, B159).
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

# --- The way in (DEC-201; B158, B159): signing in and out, recovery, claiming, joining
w('refusal.SIGN_IN_REFUSED', 'That handle and password don\'t match. Check both and try again; after several tries, sign-in pauses for a while to keep others from guessing.', False, 'credentials R4; never says which handles exist')
w('refusal.SIGN_IN_PAUSED', 'Sign-in is paused for a while after too many tries from here. This keeps others from guessing passwords; it isn\'t a judgement on you. Try again at {time}.', False, 'credentials R38; {time} the local time the pause ends')
w('refusal.RECOVERY_REFUSED', 'That didn\'t work: the handle, the code or both aren\'t right, or the code was already used. Check them and try again.' + NC, False, 'credentials R47; one answer for every arm')
w('refusal.NOT_SIGNED_IN', 'You aren\'t signed in here any more: your sign-in ended, or you signed out on another device. Sign in again to go back to where you were.', False, 'credentials R39')
w('refusal.PASSWORD_TOO_SHORT', 'A password needs at least 12 characters. A short sentence you can remember works well.' + NC, False)
w('refusal.CURRENT_PASSWORD_WRONG', 'Your current password isn\'t right, so it wasn\'t changed. Check it and try again.', False, 'credentials R3')
w('refusal.ALREADY_CLAIMED', 'Your group\'s Civicsmith already has its first administrator, so this one-time password no longer works. If that was you, sign in instead.', False, 'credentials R1')
w('refusal.NO_SUCH_INVITATION', 'This invitation link doesn\'t work: it may have been used, passed its seven days, or been withdrawn. Ask whoever sent it for a new one.', False, 'one answer for each arm')
w('refusal.NO_SUCH_JOIN_LINK', 'This join link doesn\'t work: it may have been replaced or turned off. Ask the group for its current link.', False, 'membership R104; one answer for each arm')
w('refusal.JOIN_LINK_DAILY_CAP', 'The group\'s join link has let in as many people as it allows today. Try again tomorrow.', False)
w('refusal.NO_COVER', 'Say the name the group will know you by. Only its administrators see it.' + NC, False)
w('session.signedout', 'You are signed out on this device. Your work is saved in your group\'s Civicsmith, not here.', False, 'the front door after signing out')
w('session.ended', 'Your sign-in ended, as it does after the time you chose, or when you signed out everywhere or changed your password on another device. Sign in again to go back to the page you were on.', False, 'the front door after an expiry')
w('session.keep', 'Keep me signed in for 30 days (your own phone or computer)', False, 'DEC-201, pending Bob\'s question on how long a sign-in lasts')
w('session.shared', 'Sign me out when I close the browser (a shared or public computer)', False)
w('signin.founderhint', 'Did you set this group up? Your handle is admin.', False)

HERE = os.path.dirname(os.path.abspath(__file__))
keys = [x['key'] for x in W]
assert len(keys) == len(set(keys)), 'duplicate key'
json.dump(W, open(os.path.join(HERE, 'words-t47.json'), 'w'), indent=1, ensure_ascii=False)
print(f'words-t47.json: {len(W)} entries, {sum(x["protected"] for x in W)} protected')

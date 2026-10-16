# DEC-281 (K3472, BOB's B243): "team" replaces "group" in every text a member, administrator or visitor reads.
# team(s, key) rewrites the word where it names the people who use one Civicsmith (your group, the group's case, another
# group's work, group-wide) and leaves it alone where it is something else:
#   - an identifier: {group}, screen.group-identity, GROUP_UNDETERMINED, producingGroup, a quoted 'group' value;
#   - the ordinary sense of a grouping: grouped, grouping, "groups of one act", the reasons a question is grouped into
#     (the rows named in GROUPING below);
#   - a kind of organization in the world: a community group, an issue group, neighborhood groups (a team may be one).
# Used by words-modules.src.py on the modules' adopted rows and, once, on the design's own sources (DEC-281's pass);
# build_words.mjs refuses any later row that names a team "group" (its GROUP_SENSE list holds the rows that keep the word).
import re

KINDS = ('neighborhood', 'issue', 'community', 'professional', 'civic', 'interest', 'advocacy', 'working', 'consumer',
         'ratepayer', 'environmental', 'business', 'body or')
# rows whose "group" is a grouping of reasons, legs or cases, never a team
GROUPING = ('refusal.PARTITION_INDEPENDENCE_', 'inquiry.next.group_strength_weakest', 'calculations.says.group_two_like',
            'calculations.why.act_undetermined_falls', 'calculations.why.groups_act_like')
WORD = re.compile(r'\b(group|groups|Group|Groups|GROUP|GROUPS)\b')


def grouping(key):
    return bool(key) and any(key == g or (g.endswith('_') and key.startswith(g)) for g in GROUPING)


def team(s, key=None):
    if grouping(key):
        return s
    out, last = [], 0
    for m in WORD.finditer(s):
        a, b, w = m.start(), m.end(), m.group(0)
        pre, post = s[a - 1:a] if a else '', s[b:b + 2]
        before = s[max(0, a - 40):a]
        keep = (
            (pre and pre in '.{_/#$@\\[') or                                  # an identifier or a placeholder
            (pre == '-' and not before.endswith('per-')) or                    # cs-group, data-group (but per-group)
            (pre and pre in '\'"`' and post[:1] == pre) or                    # a quoted value: 'group'
            post[:1] in ('_', '(', '=', '}') or (post[:1] == '.' and post[1:2].isalnum()) or
            s[b:b + 9] == '-identity' or                                     # the screen group-identity
            (post[:1] == ':' and w.islower() and re.search(r'(^\s*|[{,(]\s*|\n\s*)$', before)) or  # an object's key: { group: … }
            re.search(r'\b(' + '|'.join(KINDS) + r')\s+$', before, re.I) or    # a kind of organization in the world
            re.match(r'\s+of\b', s[b:b + 4]) or                              # a group of things: a grouping
            before.endswith('Norman ')                                          # a name: Nielsen Norman Group
        )
        if keep:
            continue
        t = {'group': 'team', 'groups': 'teams', 'Group': 'Team', 'Groups': 'Teams', 'GROUP': 'TEAM', 'GROUPS': 'TEAMS'}[w]
        out.append(s[last:a] + t)
        last = b
    out.append(s[last:])
    return ''.join(out)

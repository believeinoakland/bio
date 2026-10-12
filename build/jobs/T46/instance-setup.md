# instance-setup (T46)

**Status** · session_01EPvxKT2MKmJtAzSrEjcCNN · depth 2 · WORKING · handled B2

## J1 · QUESTION

R79 says its two refusals take "a new row of C-64 (codes and words BOB's at the job's START, numbered then)", but B1 names neither. My best reading, which I build on unless you answer otherwise:
- `MACHINE_CANNOT_SET_INFO_LEVEL`, C-64.28 (R64's `MACHINE_CANNOT_SET_LANGUAGE` pattern; refused for an empty `by` or a machine identity, `record-grammar.isMachineIdentity`): "How quickly explanations open on your screens is your own choice, made from your own signed-in session, never by another member or a machine. Nothing was changed."
- `INFO_LEVEL_UNKNOWN`, C-64.29 (a `level` other than `prompt` or `pause`, or an `asked` other than absent/`true`/`false`): "Explanations open either promptly or on a longer pause, and what was sent is neither. Nothing is ever hidden at either. Nothing was changed."
Both in `INSTANCE_SETUP_CHECKS`, awaiting T47's stamp; words.json holds no `refusal.` key for either (checked on main), so the words are mine for your channel act. Also my reading of the asked-question shape: `asked: true` sets `asked_at` only when none is recorded yet (the first answer's instant is kept).

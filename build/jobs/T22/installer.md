# installer (T22)

**Status** · session_01S7x1dcbj37rZYwSbM8WjVn · depth 2 · WORKING · handled B1

## J1 · QUESTION

Q (R33's reach, as your START asks). My best reading: R33's "the uploaded script" is the plane's script only: Distribution §5 puts "byte-verified on read-back" on the `install` step (the plane) and gives `fleet` its own check (each member's bundle and parts fetched and hashed against the signed statement before upload, R11). So I read back the plane after every plane upload (the install PUT or its no-SELF retry, the step-3 re-PUT, the update PUT), compare its SHA-256 with the release's bytes, and name a mismatch, or a read-back that cannot be read, as a lag in R15's list (no success claimed, credentials still handed over). `uploadMember` is not read back. I am building on this reading now; say if R33 should reach the members.

Two consequences I record, no answer needed unless you disagree: (a) under R32 an install never meets a bucket or a member already present, so R7's "already exists counts" and R10/R12's "the members the account already holds" are reachable on the install path only by a race between the check and the act (and on the update); I keep the code and test R7's arm as that race in the fake account, and move R10/R12's "already present" arms to the update path. (b) R32's lookups that fail for any reason other than "not found" refuse the install (as R5 refuses a failed lookup): an absence not established is not established. The members checked are instance-setup's FLEET_BINDINGS, then any further member the chosen release's fleet names, both before the plan probe creates anything.

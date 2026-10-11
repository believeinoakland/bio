/* escalation: stopped pursuing (R31) waits on record-grammar's `stopped_pursuing` state (N910; K2844, B2), so it is not
   built in T45 and is marked not yet met (T46). Its parts in R16 (a stopped escalation never listed), R25 (the arms
   `escalationstoppursuing` and `escalationreopen`) and R30 (the stop and reopening in the timeline) follow it. The
   T45 job's built version of all four, with its tests, is commit f0c0e4574d on `job/T45/escalation`. */
import test from "node:test";

test.todo("R31 escalationStopPursuing and escalationReopen (T46, N910: record-grammar's stopped_pursuing state first; K2844); with them R16's stopped escalation never listed, R25's two arms and R30's stop and reopening, dated and without reason");

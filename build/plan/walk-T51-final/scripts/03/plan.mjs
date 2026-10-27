/* the sitting's stages, in the order of the journey (shared by the test and the development aid) */
import * as S1 from "./stages1.mjs";
import * as S2 from "./stages2.mjs";
import * as S3 from "./stages3.mjs";
import * as S4 from "./stages4.mjs";
import * as S5 from "./stages5.mjs";
import * as S6 from "./stages6.mjs";
import * as S7 from "./stages7.mjs";
export const PLAN = [
  ["R20-R23 empty room, first visit", S1.s1], ["R23 start projects", S1.s2], ["R24 founder without a handle, then the handle", S2.s3a], ["R24 project page", S2.s3b], ["R24 acts", S2.s3c], ["R24 close", S2.s3d],
  ["R25 invite and join", S3.s4a], ["R25 request to join", S3.s4b], ["R25 owners, two", S3.s4c], ["R25 owners, three", S3.s4d], ["R25 leave", S3.s4e], ["R25 remove, fork, add refusal", S3.s4e2], ["R25 rescue", S3.s4f],
  ["R26 objective", S4.s5], ["R27 themes", S4.s6], ["R28 dashboards", S4.s7], ["R21 queue set acts", S5.s8], ["R21 more: sort, doors, counts", S5.s8b], ["R127-R133", S5.s9], ["R25 hidden lapse, affordances, folds, filing", S5.s9b], ["phone and dark", S6.s10], ["frame, states, weights", S6.s11], ["R216", S6.s12], ["R218", S6.s13], ["R217 and overlay", S7.s14],
];

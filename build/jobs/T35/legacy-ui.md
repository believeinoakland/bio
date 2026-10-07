# legacy-ui (T35)

**Status** · session_01SJohZ5PQ7yKQBnZCaZeVfS · depth 2 · WORKING · handled B2

## J1 · QUESTION

T35-74 names the session (`&token=` → `Authorization: Bearer`). `app.html` also puts a review grant's secret in the address at three calls: `op=reviewcopy` (:26214), `op=reviewcomment` (:26226) and `op=statementack` (:25802), each `secret=` in the query. F1 (K1874) is "every credential … every caller re-pointed", and control-plane R59 says the review doors read the secret from the request body (a POST with a JSON body); publication R73 deprecates the address form.

My best reading, which I am applying now: re-point those three too, each a POST whose JSON body carries `secret` (`reviewcomment`'s body keeps its `text` beside it), and the comment at :25579–:25583 says so. The secret still rides the fragment `#reviewcopy/<secret>` in the recipient's link (a browser never sends a fragment), so that stays. If you rule the secret out of this job, I take those three back out.

# Diagnosis R6: the plane idle (G39)

**Status** · Opened by BOB #255 (K4615). Measured so far by the E3 harness (`diagnosis-R6-shape.md`): the plane Store in a node child idles at 86.4-87.6 MB of heap and array buffers before any document, leaving about 40 MB of the object's 128 MB. What is resident, by module, is being measured by a worker; its findings replace this line.

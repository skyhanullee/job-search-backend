const { Router } = require("express");
const router = Router();

router.use("/login", require("./login"));
router.use("/jobs", require("./jobs"));
router.use("/bookmarklist", require("./bookmarkList"));

module.exports = router;

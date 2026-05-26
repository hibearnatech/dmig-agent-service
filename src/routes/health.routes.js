const express = require("express");
const {APP_NAME} = require("../config/env");

const router = express.Router(); // eslint-disable-line new-cap

router.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    app: APP_NAME,
    service: "instagram-agent",
  });
});

module.exports = router;

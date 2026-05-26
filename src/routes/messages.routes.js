const express = require("express");
const {
  sendManualInstagramMessage,
} = require("../services/sendMessage.service");

const router = express.Router(); // eslint-disable-line new-cap

router.post("/messages/send", async (req, res) => {
  try {
    const {tenantId, recipientId, text} = req.body;

    if (!tenantId || !recipientId || !text) {
      return res.status(400).json({
        ok: false,
        error: "tenantId, recipientId and text are required",
      });
    }

    const result = await sendManualInstagramMessage({
      tenantId,
      recipientId,
      text,
    });

    return res.status(200).json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("Send message route error:", error);

    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;

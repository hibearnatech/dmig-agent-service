const express = require("express");
const {VERIFY_TOKEN} = require("../config/env");
const {
  handleIncomingInstagramTextMessage,
} = require("../orchestrators/message.orchestrator");

const router = express.Router(); // eslint-disable-line new-cap

router.get("/meta/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Meta webhook verification request:", {
    mode,
    token,
    challenge,
  });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

router.post("/meta/webhook", async (req, res) => {
  console.log("Instagram webhook received:");
  console.log(JSON.stringify(req.body, null, 2));

  const body = req.body;

  if (body.object !== "instagram") {
    console.warn("Unsupported webhook object:", body.object);
    return res.sendStatus(404);
  }

  for (const entry of body.entry || []) {
    const instagramBusinessId = entry.id;
    const entryTime = entry.time;

    console.log("Instagram entry:", {
      instagramBusinessId,
      entryTime,
    });

    for (const event of entry.messaging || []) {
      const eventKeys = Object.keys(event);

      console.log("Instagram event keys:", eventKeys);

      const senderId = event.sender && event.sender.id;
      const recipientId = event.recipient && event.recipient.id;

      if (event.message && event.message.text) {
        console.log("Instagram TEXT message received:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          messageId: event.message.mid || null,
          messageText: event.message.text,
        });

        await handleIncomingInstagramTextMessage({
          instagramBusinessId,
          entryTime,
          event,
        });

        continue;
      }

      if (event.message) {
        console.log("Instagram non-text message event:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          messageId: event.message.mid || null,
          rawMessage: event.message,
        });

        continue;
      }

      if (event.message_edit) {
        console.log("Instagram message edit event:", {
          instagramBusinessId,
          timestamp: event.timestamp,
          messageEdit: event.message_edit,
        });

        continue;
      }

      if (event.read) {
        console.log("Instagram read event:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          read: event.read,
        });

        continue;
      }

      if (event.reaction) {
        console.log("Instagram reaction event:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          reaction: event.reaction,
        });

        continue;
      }

      if (event.postback) {
        console.log("Instagram postback event:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          postback: event.postback,
        });

        continue;
      }
    }

    for (const change of entry.changes || []) {
      console.log("Instagram change event:", {
        instagramBusinessId,
        field: change.field,
        value: change.value,
      });
    }
  }

  return res.sendStatus(200);
});

module.exports = router;

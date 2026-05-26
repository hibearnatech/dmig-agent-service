const {db, admin} = require("../config/firebase");
const {
  saveIncomingTextMessage,
} = require("../services/message.service");
const {
  sendManualInstagramMessage,
} = require("../services/sendMessage.service");

/**
 * Handles an incoming Instagram text event.
 * @param {object} params Incoming message params.
 * @param {string} params.instagramBusinessId Instagram Business ID.
 * @param {number|string|null} params.entryTime Instagram entry timestamp.
 * @param {object} params.event Instagram webhook messaging event.
 * @return {Promise<void>}
 */
async function handleIncomingInstagramTextMessage({
  instagramBusinessId,
  entryTime,
  event,
}) {
  await saveIncomingTextMessage({
    instagramBusinessId,
    entryTime,
    event,
  });

  const senderId = event.sender && event.sender.id;
  const message = event.message || {};
  const messageText = message.text || "";

  if (!senderId || !messageText) {
    console.log("Auto reply skipped: missing sender or text");
    return;
  }

  const tenantSnapshot = await db
      .collection("connected_accounts")
      .where("instagramUserId", "==", instagramBusinessId)
      .limit(1)
      .get();

  if (tenantSnapshot.empty) {
    console.log("Auto reply skipped: tenant not found", {
      instagramBusinessId,
    });

    return;
  }

  const tenantDoc = tenantSnapshot.docs[0];
  const tenantId = tenantDoc.id;

  const autoReplyText = "Hola 👋 Gracias por escribirnos.";

  try {
    const result = await sendManualInstagramMessage({
      tenantId,
      recipientId: senderId,
      text: autoReplyText,
    });

    await db.collection("messages").doc(result.message_id).set({
      messageId: result.message_id,
      tenantId,
      instagramBusinessId,
      recipientId: senderId,
      direction: "outbound",
      type: "text",
      text: autoReplyText,
      source: "instagram",
      status: "sent",
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      rawResponse: result,
    }, {merge: true});

    console.log("Auto reply sent and stored:", {
      tenantId,
      recipientId: senderId,
      messageId: result.message_id,
    });
  } catch (error) {
    console.error("Auto reply failed:", {
      tenantId,
      recipientId: senderId,
      error: error.message,
    });
  }
}

module.exports = {
  handleIncomingInstagramTextMessage,
};

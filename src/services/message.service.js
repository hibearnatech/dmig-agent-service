// Message service for handling message storage and conversation updates.

const {admin, db} = require("../config/firebase");
const {buildConversationId} = require("../utils/ids");
const {toFirestoreTimestamp} = require("../utils/timestamps");
const {
  findTenantByInstagramBusinessId,
} = require("./tenant.service");

/**
 * Saves an incoming Instagram text message and updates conversation state.
 * @param {object} params Message save params.
 * @param {string} params.instagramBusinessId Instagram Business ID.
 * @param {number|string|null} params.entryTime Instagram entry timestamp.
 * @param {object} params.event Instagram webhook messaging event.
 * @return {Promise<void>}
 */
async function saveIncomingTextMessage({
  instagramBusinessId,
  entryTime,
  event,
}) {
  const senderId = event.sender && event.sender.id;
  const recipientId = event.recipient && event.recipient.id;
  const message = event.message || {};
  const messageId = message.mid || `${instagramBusinessId}_${event.timestamp}`;
  const messageText = message.text || "";

  const tenantResult = await findTenantByInstagramBusinessId(
      instagramBusinessId,
  );

  const tenantId = tenantResult.tenantId;
  const customerInstagramId = senderId || "unknown_customer";

  const conversationId = buildConversationId(
      tenantId,
      customerInstagramId,
  );

  const messageRef = db.collection("messages").doc(messageId);

  const conversationRef = db
      .collection("conversations")
      .doc(conversationId);

  await messageRef.set({
    messageId,
    conversationId,
    tenantId,
    instagramBusinessId,
    customerInstagramId,
    senderId: senderId || null,
    recipientId: recipientId || null,
    direction: "inbound",
    type: "text",
    text: messageText,
    rawMessage: message,
    entryTime: entryTime || null,
    timestamp: event.timestamp || null,
    receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    source: "instagram",
  }, {merge: true});

  await conversationRef.set({
    conversationId,
    tenantId,
    instagramBusinessId,
    customerInstagramId,
    lastMessageId: messageId,
    lastMessageText: messageText,
    lastMessageAt: toFirestoreTimestamp(event.timestamp),
    lastDirection: "inbound",
    leadStatus: "new",
    botEnabled: true,
    platform: "instagram",
    status: "open",
    tenantResolved: tenantResult.found,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, {merge: true});

  console.log("Instagram text message stored:", {
    tenantId,
    conversationId,
    messageId,
    customerInstagramId,
    tenantResolved: tenantResult.found,
  });
}

module.exports = {
  saveIncomingTextMessage,
};

const {db} = require("../config/firebase");
const {
  sendInstagramTextMessage,
} = require("../adapters/instagram.adapter");

/**
 * Sends a manual message to an Instagram user.
 * @param {object} params Send message params.
 * @param {string} params.tenantId Tenant ID.
 * @param {string} params.recipientId Instagram recipient ID.
 * @param {string} params.text Message text.
 * @return {Promise<object>} Send result.
 */
async function sendManualInstagramMessage({tenantId, recipientId, text}) {
  const accountDoc = await db
      .collection("connected_accounts")
      .doc(tenantId)
      .get();

  if (!accountDoc.exists) {
    throw new Error(`Connected account not found for tenant: ${tenantId}`);
  }

  const account = accountDoc.data();

  if (!account.accessToken) {
    throw new Error(`Missing access token for tenant: ${tenantId}`);
  }

  const result = await sendInstagramTextMessage({
    accessToken: account.accessToken,
    recipientId,
    text,
  });

  await db.collection("messages").doc(result.message_id).set({
    messageId: result.message_id,
    tenantId,
    recipientId,
    text,
    direction: "outbound",
    type: "text",
    source: "instagram",
    status: "sent",
    sentAt: new Date(),
    rawResponse: result,
  });

  return result;
}

module.exports = {
  sendManualInstagramMessage,
};

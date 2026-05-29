// Service for sending messages to Instagram users.

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

  return result;
}

module.exports = {
  sendManualInstagramMessage,
};

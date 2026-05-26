const {db} = require("../config/firebase");

/**
 * Lists messages by conversation ID.
 * @param {string} conversationId Conversation ID.
 * @param {number} limit Max messages to return.
 * @return {Promise<Array<object>>} Messages list.
 */
async function listMessagesByConversationId(conversationId, limit = 100) {
  const snapshot = await db
      .collection("messages")
      .where("conversationId", "==", conversationId)
      .limit(limit)
      .get();

  const messages = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return messages.sort((a, b) => {
    const aTime = a.timestamp || 0;
    const bTime = b.timestamp || 0;

    return Number(aTime) - Number(bTime);
  });
}

module.exports = {
  listMessagesByConversationId,
};

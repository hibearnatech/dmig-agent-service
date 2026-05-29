// functions/src/repositories/conversation.repository.js

const {db} = require("../config/firebase");

/**
 * Lists recent Instagram conversations.
 * @param {number} limit Max conversations.
 * @return {Promise<Array<object>>} Conversations list.
 */
async function listRecentConversations(limit = 50) {
  const snapshot = await db
      .collection("conversations")
      .orderBy("lastMessageAt", "desc")
      .limit(limit)
      .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Finds one conversation by ID.
 * @param {string} conversationId Conversation ID.
 * @return {Promise<object|null>} Conversation data.
 */
async function findConversationById(conversationId) {
  const doc = await db
      .collection("conversations")
      .doc(conversationId)
      .get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
}

module.exports = {
  listRecentConversations,
  findConversationById,
};

const {
  listRecentConversations,
  findConversationById,
} = require("../repositories/conversation.repository");

const {
  listMessagesByConversationId,
} = require("../repositories/message.repository");

/**
 * Gets inbox conversations.
 * @return {Promise<Array<object>>} Conversations.
 */
async function getInboxConversations() {
  return listRecentConversations(50);
}

/**
 * Gets conversation detail with messages.
 * @param {string} conversationId Conversation ID.
 * @return {Promise<object|null>} Conversation detail.
 */
async function getConversationDetail(conversationId) {
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    return null;
  }

  const messages = await listMessagesByConversationId(conversationId);

  return {
    conversation,
    messages,
  };
}

module.exports = {
  getInboxConversations,
  getConversationDetail,
};

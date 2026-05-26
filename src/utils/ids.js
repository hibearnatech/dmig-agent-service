/**
 * Builds a unique conversation ID for a tenant and customer.
 * @param {string} tenantId Tenant identifier.
 * @param {string} customerInstagramId Customer Instagram ID.
 * @return {string} Conversation ID.
 */
function buildConversationId(tenantId, customerInstagramId) {
  return `${tenantId}_${customerInstagramId}`;
}

module.exports = {
  buildConversationId,
};

// Tenant service for managing tenant lookups and related operations.

const {db} = require("../config/firebase");

/**
 * Builds a tenant lookup response.
 * @param {object} doc Firestore document snapshot.
 * @return {object} Tenant lookup result.
 */
function buildTenantResult(doc) {
  return {
    tenantId: doc.id,
    account: doc.data(),
    found: true,
  };
}

/**
 * Finds the connected tenant by Instagram Business ID.
 * It checks both OAuth ID and Webhook Business ID.
 * @param {string} instagramBusinessId Instagram Business ID.
 * @return {Promise<object>} Tenant lookup result.
 */
async function findTenantByInstagramBusinessId(instagramBusinessId) {
  let snapshot = await db
      .collection("connected_accounts")
      .where("instagramUserId", "==", instagramBusinessId)
      .limit(1)
      .get();

  if (!snapshot.empty) {
    return buildTenantResult(snapshot.docs[0]);
  }

  snapshot = await db
      .collection("connected_accounts")
      .where("webhookInstagramBusinessId", "==", instagramBusinessId)
      .limit(1)
      .get();

  if (!snapshot.empty) {
    return buildTenantResult(snapshot.docs[0]);
  }

  return {
    tenantId: `ig_${instagramBusinessId}`,
    account: null,
    found: false,
  };
}

module.exports = {
  findTenantByInstagramBusinessId,
};

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
 * Finds one connected account by field and value.
 * @param {string} field Firestore field name.
 * @param {string} value Firestore field value.
 * @return {Promise<object|null>} Firestore document snapshot or null.
 */
async function findConnectedAccountByField(field, value) {
  const snapshot = await db
      .collection("connected_accounts")
      .where(field, "==", value)
      .limit(1)
      .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0];
}

/**
 * Finds the connected tenant by Instagram webhook or OAuth IDs.
 * @param {string} instagramBusinessId Instagram webhook/account ID.
 * @return {Promise<object>} Tenant lookup result.
 */
async function findTenantByInstagramBusinessId(instagramBusinessId) {
  const lookupFields = [
    "webhookInstagramBusinessId",
    "instagramBusinessId",
    "instagramAccountId",
    "instagramUserId",
  ];

  for (const field of lookupFields) {
    const doc = await findConnectedAccountByField(
        field,
        instagramBusinessId,
    );

    if (doc) {
      return buildTenantResult(doc);
    }
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

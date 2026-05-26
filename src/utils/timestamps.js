const {admin} = require("../config/firebase");

/**
 * Converts an Instagram timestamp to Firestore timestamp.
 * @param {number|string|null} timestamp Instagram timestamp.
 * @return {admin.firestore.Timestamp|admin.firestore.FieldValue}
 * Firestore timestamp.
 */
function toFirestoreTimestamp(timestamp) {
  if (!timestamp) {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  return admin.firestore.Timestamp.fromMillis(Number(timestamp));
}

module.exports = {
  toFirestoreTimestamp,
};

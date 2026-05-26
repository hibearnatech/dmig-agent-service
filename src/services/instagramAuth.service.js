// Instagram Authentication Service

const {admin, db} = require("../config/firebase");
const {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  REDIRECT_URI,
} = require("../config/env");

/**
 * Builds Instagram OAuth URL.
 * @return {string} Instagram OAuth URL.
 */
function buildInstagramAuthUrl() {
  const scopes = [
    "instagram_business_basic",
  ];

  return "https://www.instagram.com/oauth/authorize" +
    `?client_id=${INSTAGRAM_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    "&response_type=code" +
    `&scope=${encodeURIComponent(scopes.join(","))}`;
}

/**
 * Exchanges Instagram authorization code for an access token.
 * @param {string} code Instagram authorization code.
 * @return {Promise<object>} Token response data.
 */
async function exchangeCodeForToken(code) {
  const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: INSTAGRAM_APP_ID,
          client_secret: INSTAGRAM_APP_SECRET,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
          code,
        }),
      },
  );

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(JSON.stringify(tokenData));
  }

  return tokenData;
}

/**
 * Exchanges a short-lived Instagram token for a long-lived token.
 * @param {string} shortLivedToken Instagram short-lived access token.
 * @return {Promise<object>} Long-lived token response data.
 */
async function exchangeForLongLivedToken(shortLivedToken) {
  const url =
    "https://graph.instagram.com/access_token" +
    "?grant_type=ig_exchange_token" +
    `&client_secret=${encodeURIComponent(INSTAGRAM_APP_SECRET)}` +
    `&access_token=${encodeURIComponent(shortLivedToken)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

/**
 * Gets Instagram profile data from Graph API.
 * @param {string} accessToken Instagram access token.
 * @return {Promise<object>} Instagram profile data.
 */
async function getInstagramProfile(accessToken) {
  const profileResponse = await fetch(
      "https://graph.instagram.com/me" +
      "?fields=id,username,account_type" +
      `&access_token=${encodeURIComponent(accessToken)}`,
  );

  const profileData = await profileResponse.json();

  if (!profileResponse.ok) {
    throw new Error(JSON.stringify(profileData));
  }

  return profileData;
}

/**
 * Stores connected Instagram account.
 * @param {object} params Connected account params.
 * @param {string} params.instagramUserId Instagram user ID.
 * @param {string} params.username Instagram username.
 * @param {string} params.accountType Instagram account type.
 * @param {string} params.accessToken Instagram access token.
 * @param {number|null} params.expiresIn Token expiration seconds.
 * @return {Promise<string>} Tenant ID.
 */
async function storeConnectedAccount({
  instagramUserId,
  username,
  accountType,
  accessToken,
  expiresIn,
}) {
  const tenantId = username.toLowerCase();

  await db.collection("connected_accounts").doc(tenantId).set({
    instagramUserId,
    username,
    accountType,
    accessToken,
    tokenType: "long_lived",
    expiresIn: expiresIn || null,
    connectedAt: admin.firestore.FieldValue.serverTimestamp(),
    provider: "instagram",
    status: "connected",
  });

  return tenantId;
}

module.exports = {
  buildInstagramAuthUrl,
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getInstagramProfile,
  storeConnectedAccount,
};

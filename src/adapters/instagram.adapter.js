// functions/src/adapters/instagram.adapter.js

/**
 * Sends a text message through Instagram Messaging API.
 * @param {object} params Send message params.
 * @param {string} params.accessToken Instagram access token.
 * @param {string} params.recipientId Instagram recipient ID.
 * @param {string} params.text Message text.
 * @return {Promise<object>} Meta API response.
 */
async function sendInstagramTextMessage({accessToken, recipientId, text}) {
  const url = "https://graph.instagram.com/v25.0/me/messages";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: {
        id: recipientId,
      },
      message: {
        text,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error && data.error.message ?
      data.error.message :
      "Instagram message send failed";

    console.error("Instagram send message error:", data);
    throw new Error(errorMessage);
  }

  return data;
}

module.exports = {
  sendInstagramTextMessage,
};

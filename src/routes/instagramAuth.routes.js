// functions/src/routes/instagramAuth.routes.js

const express = require("express");
const {
  buildInstagramAuthUrl,
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  subscribeInstagramAccountToWebhooks,
  getInstagramProfile,
  storeConnectedAccount,
} = require("../services/instagramAuth.service");

const router = express.Router(); // eslint-disable-line new-cap

router.get("/instagram/login", (req, res) => {
  const authUrl = buildInstagramAuthUrl();

  console.log("Redirecting to Instagram OAuth:", authUrl);

  return res.redirect(authUrl);
});

router.get("/instagram/callback", async (req, res) => {
  try {
    const code = req.query.code;

    console.log("Instagram OAuth callback received:", {
      hasCode: Boolean(code),
    });

    if (!code) {
      return res.status(400).send(`
        <h1>Instagram connection failed</h1>
        <p>No authorization code received.</p>
      `);
    }

    const tokenData = await exchangeCodeForToken(code);

    const longLivedTokenData = await exchangeForLongLivedToken(
        tokenData.access_token,
    );

    const accessToken = longLivedTokenData.access_token;
    await subscribeInstagramAccountToWebhooks(accessToken);
    const profileData = await getInstagramProfile(accessToken);

    const instagramUserId = profileData.id;
    const username = profileData.username;
    const accountType = profileData.account_type || "UNKNOWN";

    const tenantId = await storeConnectedAccount({
      instagramUserId,
      username,
      accountType,
      accessToken,
      expiresIn: longLivedTokenData.expires_in || null,
    });

    console.log("Instagram account stored successfully:", {
      tenantId,
      instagramUserId,
      username,
    });

    return res.status(200).send(`
      <!doctype html>
      <html>
        <head>
          <title>Instagram connected</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f6f7f9;
              padding: 40px;
            }

            .card {
              max-width: 720px;
              background: white;
              padding: 32px;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            }

            .status {
              margin-top: 24px;
              padding: 16px;
              background: #ecfdf5;
              border-radius: 10px;
            }
          </style>
        </head>

        <body>
          <div class="card">
            <h1>Instagram connected</h1>

            <p>
              The Instagram professional account was connected successfully.
            </p>

            <div class="status">
              <strong>Instagram connected successfully</strong><br />
              Connected Instagram business profile<br /><br />

              <strong>Connected account:</strong> @${username}<br />

              <strong>Instagram User ID:</strong>
              ${instagramUserId}<br />

              <strong>Account type:</strong>
              ${accountType}<br />

              <strong>Access token:</strong>
              Stored securely on server
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Instagram callback error:", error);

    return res.status(500).send(`
      <h1>Instagram callback error</h1>
      <p>${error.message}</p>
    `);
  }
});

module.exports = router;

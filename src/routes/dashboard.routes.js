const express = require("express");
const {db} = require("../config/firebase");
const {APP_NAME} = require("../config/env");

const router = express.Router(); // eslint-disable-line new-cap

router.get("/dashboard", async (req, res) => {
  const accountSnapshot = await db
      .collection("connected_accounts")
      .where("status", "==", "connected")
      .limit(1)
      .get();

  let connectedAccountHtml = `
    <strong>Connected account:</strong>
    Pending authorization<br />

    <strong>Instagram Business ID:</strong>
    Pending authorization
  `;

  if (!accountSnapshot.empty) {
    const account = accountSnapshot.docs[0].data();

    connectedAccountHtml = `
      <strong>Instagram connected successfully</strong><br />
      Connected Instagram business profile<br /><br />

      <strong>Connected account:</strong>
      @${account.username}<br />

      <strong>Instagram User ID:</strong>
      ${account.instagramUserId}<br />

      <strong>Account type:</strong>
      ${account.accountType}<br />

      <strong>Status:</strong>
      ${account.status}
    `;
  }

  return res.status(200).send(`
    <!doctype html>
    <html>
      <head>
        <title>${APP_NAME}</title>
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

          .button {
            display: inline-block;
            padding: 12px 18px;
            background: #111827;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            margin-top: 16px;
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
          <h1>${APP_NAME}</h1>

          <p>
            Connect an Instagram professional account to manage
            messages, qualify leads, and support customer
            conversations.
          </p>

          <a class="button" href="/instagram/login">
            Connect Instagram
          </a>

          <div class="status">
            ${connectedAccountHtml}
          </div>
        </div>
      </body>
    </html>
  `);
});

module.exports = router;

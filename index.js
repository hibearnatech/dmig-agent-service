// functions/index.js

require("dotenv").config();

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

const VERIFY_TOKEN = "hibearna_verify_token_2026";
const INSTAGRAM_APP_ID = "1318648676264792";
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

const REDIRECT_URI =
  "https://api-hhgsmctgnq-uc.a.run.app/instagram/callback";

const APP_NAME = "Hibearna Tech Instagram Agent";

app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    app: APP_NAME,
    service: "instagram-agent",
  });
});

app.get("/dashboard", async (req, res) => {
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

app.get("/instagram/login", (req, res) => {
  const scopes = [
    "instagram_business_basic",
  ];

  const authUrl =
    "https://www.instagram.com/oauth/authorize" +
    `?client_id=${INSTAGRAM_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    "&response_type=code" +
    `&scope=${encodeURIComponent(scopes.join(","))}`;

  console.log("Redirecting to Instagram OAuth:", authUrl);

  return res.redirect(authUrl);
});

app.get("/instagram/callback", async (req, res) => {
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

    console.log("Instagram token exchange completed:", {
      hasAccessToken: Boolean(tokenData.access_token),
      userId: tokenData.user_id || null,
    });

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(500).send(`
        <h1>Instagram token exchange failed</h1>
        <pre>${JSON.stringify(tokenData, null, 2)}</pre>
      `);
    }

    const accessToken = tokenData.access_token;

    const profileResponse = await fetch(
        "https://graph.instagram.com/me" +
        "?fields=id,username,account_type" +
        `&access_token=${encodeURIComponent(accessToken)}`,
    );

    const profileData = await profileResponse.json();

    console.log("Instagram profile response:", profileData);

    if (!profileResponse.ok) {
      return res.status(500).send(`
        <h1>Instagram profile request failed</h1>
        <pre>${JSON.stringify(profileData, null, 2)}</pre>
      `);
    }

    const instagramUserId = profileData.id;
    const username = profileData.username;
    const accountType = profileData.account_type || "UNKNOWN";

    const tenantId = username.toLowerCase();

    await db.collection("connected_accounts").doc(tenantId).set({
      instagramUserId,
      username,
      accountType,
      accessToken,
      connectedAt: admin.firestore.FieldValue.serverTimestamp(),
      provider: "instagram",
      status: "connected",
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
            code {
              word-break: break-all;
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

app.get("/meta/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Meta webhook verification request:", {
    mode,
    token,
    challenge,
  });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/meta/webhook", async (req, res) => {
  console.log("Instagram webhook received:");
  console.log(JSON.stringify(req.body, null, 2));

  const body = req.body;

  if (body.object !== "instagram") {
    console.warn("Unsupported webhook object:", body.object);
    return res.sendStatus(404);
  }

  for (const entry of body.entry || []) {
    const instagramBusinessId = entry.id;
    const entryTime = entry.time;

    console.log("Instagram entry:", {
      instagramBusinessId,
      entryTime,
    });

    for (const event of entry.messaging || []) {
      const eventKeys = Object.keys(event);

      console.log("Instagram event keys:", eventKeys);

      const senderId = event.sender && event.sender.id;
      const recipientId = event.recipient && event.recipient.id;

      if (event.message && event.message.text) {
        console.log("Instagram TEXT message received:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          messageId: event.message.mid || null,
          messageText: event.message.text,
        });

        continue;
      }

      if (event.message) {
        console.log("Instagram non-text message event:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          messageId: event.message.mid || null,
          rawMessage: event.message,
        });

        continue;
      }

      if (event.message_edit) {
        console.log("Instagram message edit event:", {
          instagramBusinessId,
          timestamp: event.timestamp,
          messageEdit: event.message_edit,
        });

        continue;
      }

      if (event.read) {
        console.log("Instagram read event:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          read: event.read,
        });

        continue;
      }

      if (event.reaction) {
        console.log("Instagram reaction event:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          reaction: event.reaction,
        });

        continue;
      }

      if (event.postback) {
        console.log("Instagram postback event:", {
          instagramBusinessId,
          senderId,
          recipientId,
          timestamp: event.timestamp,
          postback: event.postback,
        });

        continue;
      }
    }

    for (const change of entry.changes || []) {
      console.log("Instagram change event:", {
        instagramBusinessId,
        field: change.field,
        value: change.value,
      });
    }
  }

  return res.sendStatus(200);
});

exports.api = functions.https.onRequest(app);

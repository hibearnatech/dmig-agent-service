const express = require("express");
const {
  getInboxConversations,
  getConversationDetail,
} = require("../services/inbox.service");

const router = express.Router(); // eslint-disable-line new-cap

const formatDate = (value) => {
  if (!value || !value.toDate) {
    return "Not available";
  }

  return value.toDate().toLocaleString("en-US");
};

router.get("/inbox", async (req, res) => {
  try {
    const conversations = await getInboxConversations();

    const rows = conversations.map((conversation) => {
      const conversationId = conversation.id;
      const tenantId = conversation.tenantId || "unknown";
      const customerId = conversation.customerInstagramId || "unknown";
      const lastMessage = conversation.lastMessageText || "";
      const leadStatus = conversation.leadStatus || "new";
      const status = conversation.status || "open";

      return `
        <tr>
          <td>${tenantId}</td>
          <td>${customerId}</td>
          <td>${lastMessage}</td>
          <td>${leadStatus}</td>
          <td>${status}</td>
          <td>
            <a href="/inbox/${conversationId}">
              View conversation
            </a>
          </td>
        </tr>
      `;
    }).join("");

    return res.status(200).send(`
      <!doctype html>
      <html>
        <head>
          <title>Instagram Agent Inbox</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f6f7f9;
              padding: 40px;
            }

            .card {
              max-width: 1120px;
              background: white;
              padding: 32px;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            }

            .notice {
              background: #ecfdf5;
              border-radius: 12px;
              padding: 16px;
              margin-top: 20px;
              margin-bottom: 24px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
            }

            th,
            td {
              text-align: left;
              padding: 14px;
              border-bottom: 1px solid #e5e7eb;
            }

            th {
              background: #f9fafb;
            }

            a {
              color: #111827;
              font-weight: 700;
            }
          </style>
        </head>

        <body>
          <div class="card">
            <h1>Instagram Agent Inbox</h1>

            <div class="notice">
              <strong>Reviewer context</strong><br />
              This console shows Instagram conversations received
              through the webhook and stored per connected business
              tenant.
            </div>

            <p>
              Each row represents an inbound Instagram conversation
              associated with a connected Instagram business profile.
            </p>

            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Customer ID</th>
                  <th>Last message</th>
                  <th>Lead status</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                ${rows || `
                  <tr>
                    <td colspan="6">No conversations found.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Inbox route error:", error);
    return res.status(500).send("Error loading inbox");
  }
});

router.get("/inbox/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const detail = await getConversationDetail(conversationId);

    if (!detail) {
      return res.status(404).send("Conversation not found");
    }

    const {conversation, messages} = detail;

    const rows = messages.map((message) => {
      return `
        <tr>
          <td>${message.direction || ""}</td>
          <td>${message.senderId || ""}</td>
          <td>${message.text || ""}</td>
          <td>${message.type || ""}</td>
          <td>${formatDate(message.receivedAt)}</td>
        </tr>
      `;
    }).join("");

    return res.status(200).send(`
      <!doctype html>
      <html>
        <head>
          <title>Conversation Detail</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f6f7f9;
              padding: 40px;
            }

            .card {
              max-width: 1080px;
              background: white;
              padding: 32px;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            }

            .notice {
              background: #ecfdf5;
              border-radius: 12px;
              padding: 16px;
              margin-top: 20px;
              margin-bottom: 24px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
            }

            th,
            td {
              text-align: left;
              padding: 14px;
              border-bottom: 1px solid #e5e7eb;
            }

            th {
              background: #f9fafb;
            }

            .back {
              display: inline-block;
              margin-bottom: 20px;
              font-weight: 700;
              color: #111827;
            }
          </style>
        </head>

        <body>
          <div class="card">
            <a class="back" href="/inbox">← Back to inbox</a>

            <h1>Conversation detail</h1>

            <div class="notice">
              <strong>
                Inbound Instagram message received and stored
                successfully.
              </strong><br />
              This view shows the message stored from the Instagram
              webhook for review and support purposes.
            </div>

            <p>
              <strong>Conversation ID:</strong>
              ${conversation.id}<br />

              <strong>Tenant:</strong>
              ${conversation.tenantId}<br />

              <strong>Instagram Business ID:</strong>
              ${conversation.instagramBusinessId}<br />

              <strong>Customer ID:</strong>
              ${conversation.customerInstagramId}<br />

              <strong>Source:</strong>
              ${conversation.platform}<br />

              <strong>Bot enabled:</strong>
              ${conversation.botEnabled}<br />

              <strong>Status:</strong>
              ${conversation.status}<br />

              <strong>Lead status:</strong>
              ${conversation.leadStatus}
            </p>

            <table>
              <thead>
                <tr>
                  <th>Direction</th>
                  <th>Sender</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Received at</th>
                </tr>
              </thead>

              <tbody>
                ${rows || `
                  <tr>
                    <td colspan="5">No messages found.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Conversation detail route error:", error);
    return res.status(500).send("Error loading conversation");
  }
});

module.exports = router;

const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const instagramAuthRoutes = require("./routes/instagramAuth.routes");
const metaWebhookRoutes = require("./routes/metaWebhook.routes");
const inboxRoutes = require("./routes/inbox.routes");
const messagesRoutes = require("./routes/messages.routes");

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

app.use(healthRoutes);
app.use(dashboardRoutes);
app.use(instagramAuthRoutes);
app.use(metaWebhookRoutes);
app.use(inboxRoutes);
app.use(messagesRoutes);

module.exports = app;

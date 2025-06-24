const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = "my-secret-token"; // ใส่ token ที่จะใช้ใน Facebook
const MAKE_WEBHOOK_URL = "https://hook.us1.make.com/xxxxxx"; // เปลี่ยนเป็น Webhook จาก Make

app.use(express.json());

app.get('/webhook', (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Verified Webhook");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Verification failed");
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  console.log("📥 Message from Facebook:", JSON.stringify(req.body, null, 2));

  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
  } catch (error) {
    console.error("❌ Failed to forward to Make:", error);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

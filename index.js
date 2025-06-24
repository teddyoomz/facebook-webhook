const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = "my-secret-token"; // เปลี่ยนให้ตรงกับที่ใส่ใน Facebook
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/5p6cv5j7n3dlcltdhuo5jrhrjsufh51r"; // ใส่ URL ของ Make

app.use(express.json());

app.get('/webhook', (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ VERIFY SUCCESS");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  console.log("📩 FB Message:", JSON.stringify(req.body, null, 2));
  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
  } catch (e) {
    console.error("❌ Make error:", e);
  }
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

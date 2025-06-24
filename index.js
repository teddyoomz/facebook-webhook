const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = 'my-secret-token'; // เปลี่ยนให้ตรงกับที่ใส่ใน Facebook
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/5p6cv5j7n3dlcltdhuo5jrhrjsufh51r'; // ใส่ URL ของ Make

app.use(express.json());

// ---------- FB VERIFY ----------
app.get('/webhook', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ VERIFY SUCCESS');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ---------- FB POST (messages) ----------
app.post('/webhook', async (req, res) => {
  console.log('📥 [POST] Webhook called');

  // เช็กว่ามีข้อความจริงหรือไม่
  const entry     = req.body?.entry?.[0];
  const messaging = entry?.messaging?.[0];
  const text      = messaging?.message?.text;
  const senderId  = messaging?.sender?.id;

  if (text) {
    console.log(`💬 Message received from ${senderId}: ${text}`);
  } else {
    console.log('⚠️ No message.text found in POST body');
  }

  // ส่งต่อไป Make
  try {
    const resp = await fetch(MAKE_WEBHOOK_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(req.body),
    });
    console.log('✅ Forwarded to Make:', resp.status);
  } catch (e) {
    console.error('❌ Make error:', e);
  }

  res.sendStatus(200);
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

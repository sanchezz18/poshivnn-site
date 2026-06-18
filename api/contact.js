module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, phone, email, note, source } = req.body || {};

  if (!name || !phone) {
    res.status(400).json({ error: 'Missing name or phone' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ error: 'Server not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' });
    return;
  }

  const text = [
    '🆕 Новая заявка с сайта ПошивНН',
    source ? `Источник: ${source}` : null,
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    email ? `Email: ${email}` : null,
    note ? `Сообщение: ${note}` : null,
  ].filter(Boolean).join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!tgRes.ok) {
      const details = await tgRes.text();
      res.status(502).json({ error: 'Telegram error', details });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

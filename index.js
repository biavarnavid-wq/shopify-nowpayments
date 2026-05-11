const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
app = express();

app.use(express.json());

const NOWPAYMENTS_API_KEY = 'YOUR_NOWPAYMENTS_API_KEY';
const SHOPIFY_ACCESS_TOKEN = 'YOUR_SHOPIFY_ACCESS_TOKEN';
const SHOPIFY_STORE = 'chzpsf-iq.myshopify.com';
const IPN_SECRET = 'YOUR_IPN_SECRET';

app.post('/nowpayments-webhook', async (req, res) => {
  const hmac = crypto.createHmac('sha512', IPN_SECRET);
  hmac.update(JSON.stringify(req.body));
  const signature = hmac.digest('hex');

  if (signature !== req.headers['x-nowpayments-sig']) {
    return res.status(401).send('Invalid signature');
  }

  const { payment_status, order_id } = req.body;

  if (payment_status === 'finished' || payment_status === 'confirmed') {
    await axios.post(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/orders/${order_id}/transactions.json`,
      { transaction: { kind: 'capture', status: 'success' } },
      { headers: { 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN } }
    );
  }

  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('NOWPayments Webhook Server Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

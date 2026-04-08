require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const inquiriesRouter = require('./routes/inquiries');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/inquiries', inquiriesRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/debug', async (req, res) => {
  const pool = require('./db');
  const url = process.env.PG_URL || process.env.DATABASE_URL || 'NOT SET';
  try {
    await pool.query('SELECT 1');
    res.json({ db: 'connected', url: url.replace(/:([^:@]+)@/, ':***@') });
  } catch (e) {
    res.json({ db: 'error', error: e.message, url: url.replace(/:([^:@]+)@/, ':***@') });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

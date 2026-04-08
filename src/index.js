require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const pool = require('./db');

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

// 서버 시작 시 memo 컬럼 없으면 자동 추가
pool.query(`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS memo TEXT`)
  .then(() => console.log('[db] memo 컬럼 확인 완료'))
  .catch(err => console.error('[db] memo 컬럼 추가 오류:', err));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


// 매일 새벽 3시 — 처리완료 후 1년 경과 문의 자동 삭제
cron.schedule('0 3 * * *', async () => {
  try {
    const result = await pool.query(
      `DELETE FROM inquiries WHERE status = '처리완료' AND created_at < NOW() - INTERVAL '1 year'`
    );
    console.log(`[cron] 자동 삭제 완료: ${result.rowCount}건`);
  } catch (err) {
    console.error('[cron] 자동 삭제 오류:', err);
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

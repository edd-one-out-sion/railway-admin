require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const pool = require('./db');

const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const inquiriesRouter = require('./routes/inquiries');
const photosRouter = require('./routes/photos');
const reviewsRouter = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/photos', photosRouter);
app.use('/api/reviews', reviewsRouter);

// 서버 시작 시 테이블/컬럼 자동 생성
async function initDb() {
  await pool.query(`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS memo TEXT`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      caption TEXT DEFAULT '',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      author TEXT NOT NULL,
      source TEXT DEFAULT '네이버 플레이스 리뷰',
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('[db] 테이블 초기화 완료');
}
initDb().catch(err => console.error('[db] 초기화 오류:', err));

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

const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews — 공개 (랜딩페이지용)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// POST /api/reviews — 후기 추가 (관리자 전용)
router.post('/', authMiddleware, async (req, res) => {
  const { author, source, content } = req.body;
  if (!author || !content) return res.status(400).json({ error: 'author, content는 필수입니다.' });

  try {
    const result = await pool.query(
      'INSERT INTO reviews (author, source, content) VALUES ($1, $2, $3) RETURNING *',
      [author, source || '네이버 플레이스 리뷰', content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// DELETE /api/reviews/:id — 후기 삭제 (관리자 전용)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: '후기를 찾을 수 없습니다.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;

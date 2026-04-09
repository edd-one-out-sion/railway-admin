const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/photos — 공개 (랜딩페이지용)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM photos ORDER BY sort_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// POST /api/photos — 사진 추가 (관리자 전용)
router.post('/', authMiddleware, async (req, res) => {
  const { url, caption } = req.body;
  if (!url) return res.status(400).json({ error: 'url은 필수입니다.' });

  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM photos');
    const sortOrder = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      'INSERT INTO photos (url, caption, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [url, caption || '', sortOrder]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// DELETE /api/photos/:id — 사진 삭제 (관리자 전용)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM photos WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: '사진을 찾을 수 없습니다.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;

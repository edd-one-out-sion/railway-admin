const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/inquiries — 문의 저장 (랜딩페이지 폼에서 호출)
router.post('/', async (req, res) => {
  const { name, phone, lesson_type, message, referrer, utm_source } = req.body;

  try {
    await pool.query(
      'INSERT INTO inquiries (name, phone, lesson_type, message, referrer, utm_source) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, phone, lesson_type, message, referrer, utm_source]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// GET /api/inquiries — 문의 목록 조회 (관리자 전용)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM inquiries ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// PATCH /api/inquiries/:id/status — 상태 변경 (관리자 전용)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['신규', '확인', '처리완료'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: '유효하지 않은 상태값입니다.' });
  }

  try {
    await pool.query('UPDATE inquiries SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// PATCH /api/inquiries/:id/memo — 메모 저장 (관리자 전용)
router.patch('/:id/memo', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { memo } = req.body;
  try {
    await pool.query('UPDATE inquiries SET memo = $1 WHERE id = $2', [memo, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// DELETE /api/inquiries/:id — 개별 삭제 (관리자 전용)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM inquiries WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;

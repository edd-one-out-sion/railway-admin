const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/me — 로그인 확인용
router.get('/me', authMiddleware, (req, res) => {
  res.json({ username: req.user.username });
});

module.exports = router;

const express = require('express');
const router = express.Router();

// POST /api/forgot-password
router.post('/', async (req, res) => {
  const { email } = req.body;
  // Simulate always success for now
  // In production, look up user, generate token, send email
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  // Simulate delay
  setTimeout(() => {
    res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  }, 1000);
});

module.exports = router;

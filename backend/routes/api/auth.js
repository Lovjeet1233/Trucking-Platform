// routes/api/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, logout } = require('../../controllers/auth');
const { protect } = require('../../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.get('/logout', logout);

module.exports = router;












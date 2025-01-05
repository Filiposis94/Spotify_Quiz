const express = require('express');
const router = express.Router();

const {getAuthUrl, getToken, refreshToken} = require('../controllers/auth');

router.route('/url').get(getAuthUrl);
router.route('/token').get(getToken);
router.route('/token-refresh').get(refreshToken);

module.exports = router;
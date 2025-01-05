const express = require('express');
const router = express.Router();

const {transferPlayback, startPlayback, pausePlayback} = require('../controllers/playback');

router.route('/transfer').get(transferPlayback);
router.route('/start').get(startPlayback);
router.route('/pause').get(pausePlayback);

module.exports = router;
const express = require('express');
const router = express.Router();

const {getUser, getUsersPlaylists, getTracks, getFeaturedPlaylists} = require('../controllers/data');

router.route('/user').get(getUser);
router.route('/users-playlists').get(getUsersPlaylists);
router.route('/tracks').get(getTracks);
router.route('/featured-playlists').get(getFeaturedPlaylists);

module.exports = router;
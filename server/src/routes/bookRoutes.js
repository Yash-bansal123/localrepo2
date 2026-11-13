const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getMyBooks } = require('../controllers/bookController');

const router = express.Router();

router.use(authMiddleware);

router.get('/my-books', getMyBooks);

module.exports = router;

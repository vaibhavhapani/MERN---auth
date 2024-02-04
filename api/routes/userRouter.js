const express = require("express");
const { signUp, login, verifyToken, getUser, refreshToken } = require("../controllers/userController");

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/user', verifyToken, getUser);
router.get('/refresh', refreshToken, verifyToken, getUser);

module.exports = router;
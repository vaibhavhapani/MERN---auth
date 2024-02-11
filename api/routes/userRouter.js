const express = require("express");
const { signUp, login, verifyToken, getUser, logout } = require("../controllers/userController");

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/user', verifyToken, getUser);
// router.get('/refresh', refreshToken, verifyToken, getUser);
router.post('/logout', verifyToken, logout);

module.exports = router;
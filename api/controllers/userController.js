const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = "2b1hb3hj2bw93uhd";

const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;

  let extistingUser;
  try {
    extistingUser = await User.findOne({ email });
  } catch (err) {
    console.log(err);
  }

  if (extistingUser) {
    return res.status(400).json({
      message: "User already exist! Please login",
    });
  }

  const hashedPassword = bcrypt.hashSync(password);
  const user = new User({ name, email, password: hashedPassword });

  try {
    await user.save();
  } catch (err) {
    console.log(err);
  }

  return res.status(201).json({
    message: user,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return new Error(err);
  }

  if (!existingUser) {
    return res.status(400).json({
      message: "User not found!! Please sign up",
    });
  }

  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({
      message: "Invalid Password",
    });
  }

  const token = jwt.sign({ id: existingUser.id }, JWT_SECRET_KEY, {
    expiresIn: "35s",
  });

  console.log("Generated Token\n", token);

  // if(req.cookies[jwt]){
  //   console.log("yumm\n" + req.cookies[jwt])
  //   req.cookies[`${existingUser.id}`] = ""
  // }

  res.cookie("jwt", token, {
    path: "/",
    expires: new Date(Date.now() + 1000 * 30),
    httpOnly: true,
    sameSite: "lax",
  });

  return res.status(200).json({
    message: "Successfuly logged in",
    user: existingUser,
    token,
  });
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log("helloe verify " + token);

  if (!token) {
    res.status(404).json({
      message: "No token found",
    });
  }

  jwt.verify(String(token), JWT_SECRET_KEY, (err, user) => {
    if (err) {
      res.status(400).json({
        message: "Invalid token",
      });
    }
    req.id = user.id;
  });
  next();
};

const getUser = async (req, res, next) => {
  const userId = req.id;
  let user;

  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    return new Error(err);
  }
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  return res.status(200).json({ user });
};

const refreshToken = (req, res, next) => {
  const prevToken = req.cookies.jwt;
  
  if (!prevToken) {
    return res.status(400).json({
      message: "Couldn't find token",
    });
  }

  jwt.verify(String(prevToken), JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({
        message: "apientication failed",
      });
    }

    res.clearCookie(`${jwt}`);
    req.cookies[`${jwt}`] = "";

    const token = jwt.sign({ id: user.id }, JWT_SECRET_KEY, {
      expiresIn: "35s",
    });

    console.log("Regenerated Token\n", token);

    res.cookie("jwt", token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 30),
      httpOnly: true,
      sameSite: "lax",
    });

    req.id = user.id;
    next();
  });
};

exports.signUp = signUp;
exports.login = login;
exports.verifyToken = verifyToken;
exports.getUser = getUser;
exports.refreshToken = refreshToken;

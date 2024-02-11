const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    existingUser = await User.findOne({ email: email });
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
      message: "Invalid Email or Password",
    });
  }

  const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h",
  });

  console.log("Generated Token\n", token);

  res.cookie("jwt", token, {
    path: "/",
    expires: new Date(Date.now() + 1000 * 7200),
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

  if (!token) {
    res.status(404).json({
      message: "No token found",
    });
  }

  jwt.verify(String(token), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        message: "Invalid token",
      });
    }
    req.id = user.id;
    next();
  });
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

// const refreshToken = (req, res, next) => {
//   const prevToken = req.cookies.jwt;
  
//   if (!prevToken) {
//     return res.status(400).json({
//       message: "Couldn't find token",
//     });
//   }

//   jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
//     if (err) {
//       console.log(err);
//       return res.status(403).json({
//         message: "authentication failed",
//       });
//     }

//     res.clearCookie('jwt');
//     req.cookies['jwt'] = "";

//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
//       expiresIn: "35s",
//     });

//     console.log("Regenerated Token\n", token);

//     res.cookie("jwt", token, {
//       path: "/",
//       expires: new Date(Date.now() + 1000 * 30),
//       httpOnly: true,
//       sameSite: "lax",
//     });

//     req.id = user.id;
//     next();
//   });
// };

const logout = (req, res, next) => {
  const prevToken = req.cookies.jwt;
  
  if (!prevToken) {
    return res.status(400).json({
      message: "Couldn't find token",
    });
  }

  jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({
        message: "authentication failed",
      });
    }

    res.clearCookie("jwt");
    req.cookies["jwt"] = "";

    return res.status(200).json({
      message: "Successfully logged out"
    })
  });
  
}

exports.signUp = signUp;
exports.login = login;
exports.verifyToken = verifyToken;
exports.getUser = getUser;
// exports.refreshToken = refreshToken;
exports.logout = logout;

require('dotenv').config();
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

//MIDDLEWARE PROTECTION
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.flash("error_msg", "Please log in to view that resource");
    return res.redirect("/login");
  }
  try {
    const decodedUser = jwt.verify(token, JWT_SECRET);
    req.userId = decodedUser.id;
    
    next();
  } catch (error) {
    console.log(error);

    res.clearCookie("token");
    req.flash("error_msg", "Invalid token. Please log in again.");
    res.redirect("/login");
  }
};

module.exports=authMiddleware;

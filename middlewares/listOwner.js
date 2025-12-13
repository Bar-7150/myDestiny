require('dotenv').config();
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET
const Listing =require("../models/listing.js")
const ExpressError = require("../utils/expressError.js")
const listOwner = async(req, res, next) => {
  const token = req.cookies.token;
  
    const decodedUser = jwt.verify(token, JWT_SECRET);
    req.userId = decodedUser.id;
    let {id}=req.params;
    const myListing=await Listing.findById(id);
    if(myListing.owner==req.userId){
      next()
    }else{

      next(new ExpressError(401,"You are unable to do this"));
    }

}

module.exports=listOwner;
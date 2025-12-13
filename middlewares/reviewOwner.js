require('dotenv').config();
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

const ExpressError = require("../utils/expressError.js")
const Review =require("../models/review.js");

const reviewOwner= async(req,res,next)=>{
    const token = req.cookies.token;
    const decodeUser=jwt.verify(token,JWT_SECRET);
    req.userId=decodeUser.id;
    let {reviewId} = req.params;
    const myReview = await Review.findById(reviewId);
    if(myReview.author==req.userId){
        next();
    }else{
        next(new ExpressError(401,"You are unable to do this"));
    }
};
module.exports=reviewOwner;
require('dotenv').config();
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync=require('../utils/wrapAsync')
const passport=require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET=process.env.JWT_SECRET



router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs")
})
router.post("/signup",wrapAsync(async(req,res)=>{
    const {username,email,password}=req.body;
    try{
     //Check if user exists
     const existingUser= await User.findOne({username});
     if (existingUser){
         req.flash("error_msg","user already exists,please login")
         return  res.redirect("/login");
     }
      //hashed password
      const hashedPassword=await bcrypt.hash(password,10);
      //Create user
      const newUser=new User({
        username,email,password:hashedPassword
      });

      await newUser.save();
    //   req.flash("success","successfully registerd");
      req.flash("success_msg","You are successfully registered")
      res.redirect("/listings");
    }catch(e){
        req.flash("error_msg",`somethig went wrong!please try again;`)
        res.redirect("/signup");
    }
   
}));

//Login

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})
router.post("/login",async(req,res)=>{
    const {username,password}=req.body;
    try{
        //check user exists or not
        const user = await User.findOne({username});
        if(!user){
            req.flash("error_msg","User Not found")
            return  res.redirect("/login")
        } 
            
        // req.flash("failed","please signup before login ")
        // console.log("please signup before login ")
        

        //check password
        const isPasswordCorrect=await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            req.flash("error_msg","Wrong Password")
            return  res.redirect("/login")
        } 
        

        //Genarate token
        //we stored user id and token inside token
        const token =jwt.sign({
            id:user._id,username:user.username
        },JWT_SECRET,{expiresIn:"1hr"});
        //send token to cleint
        // req.flash("success",'successfully logged in');
       res.cookie("token",token,{httpOnly:true,maxAge:3600000})
       res.redirect("/listings");
    } catch(err){
        console.log(err);
        
        res.render("../views/error.ejs",{err});
    }
});
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
});

module.exports=router
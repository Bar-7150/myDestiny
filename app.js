require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride=require('method-override');
const ejsMate= require('ejs-mate')
//ejs-mate: use same parts of code in different pages
const ExpressError = require("./utils/expressError.js")
const wrapAsync=require("./utils/wrapAsync.js")

const listingRouter=require("./routes/listing.js");
const Review =require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser=require("cookie-parser");
const User =require("./models/user.js");
const userRouter = require("./routes/user.js");
const authMiddleware = require("./middlewares/authMiddleware.js")
const reviewOwner = require("./middlewares/reviewOwner.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/myDestiny";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());

app.use(session({
  secret:'secretKey',
  resave:false,
  saveUninitialized:false
}));

 app.use(flash());

//flash middle ware

app.use((req,res,next)=>{
  res.locals.success_msg=req.flash('success')
  res.locals.success_msg=req.flash('failed')
  next();
})

/*app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error")
  next();
})
*/
// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//            email:"sunetra@gmail.com",
//            username:"dipu",

//   })
//  let registeredUser= await User.register(fakeUser,"Bar@1234");
//  res.send(registeredUser);
// })
app.use("/listings",listingRouter)
app.use("/",userRouter)

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.engine('ejs',ejsMate);

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });



//reviews
//post route
app.post("/listings/:id/reviews",authMiddleware,async(req,res)=>{
   let listing=await Listing.findById(req.params.id);
   let newReview=new Review(req.body.review);
   newReview.author=req.userId;
   listing.reviews.push(newReview);
   await newReview.save();
   await listing.save();
   res.redirect(`/listings/${listing._id}`)
   
});

//delete review route

// mongo $pull operator:remove from an existing array all instance of a value or values that match a specified condition
app.delete("/listings/:id/reviews/:reviewId",reviewOwner,wrapAsync(async(req,res)=>{
  let {id , reviewId}=req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`)
})) ;


app.all("/*splat",(req,res,next)=>{
  next(new ExpressError(404,"page not found!"))
});
app.use((err,req,res,next)=>{
  let {statusCode=500,message="something went wrong!"}=err;
  res.status(statusCode).render("error.ejs",{err})
 
});
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
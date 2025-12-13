
const express =require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/expressError.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const Listing =require("../models/listing.js")
const authMiddleware=require("../middleware.js");



const valideteListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};



//Index Route
router.get("/",wrapAsync( async (req, res) => {
  const allListings=await Listing.find({})
  
  res.render("./listings/index.ejs",{allListings});
}));

//New Route
router.get("/new",authMiddleware, (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if(!listing){
    req.flash("error","lISTING YOU REQUESTED IS DOES NOT EXIST!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
});

//Create Route
router.post("/",authMiddleware,valideteListing,wrapAsync(
  async (req, res,next) => {
   
  const newListing = new Listing(req.body.listing);
  console.log(req.userId);
  newListing.owner=req.userId;
   
 // let {title,description,image,price,location,country} =req.body;

  
  await newListing.save();
  req.flash("success","New Listing Created!");
  res.redirect("/listings");
  }
) 
);
//Edit Route
router.get("/:id/edit",authMiddleware,wrapAsync( async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",authMiddleware,wrapAsync( async (req, res) => {
  if(!req.body.listing){
    throw new ExpressError(400,"send valid data for listing")
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",authMiddleware,wrapAsync( async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

module.exports=router;
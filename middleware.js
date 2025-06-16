const Campground = require("./models/campground");
const Review=require("./models/reviews");
const {campgroundSchema,reviewSchema}=require('./schema');
const expressError=require('./utils/expressError');

module.exports.isLoggedIn=(req,res,next)=>{
  if(!req.isAuthenticated()){
    req.session.returnTo=req.originalUrl;
    req.flash('error','Sign in first');
    return res.redirect('/login');
  }
  next();
}

module.exports.storeURL=(req,res,next)=>{
  if(req.session.returnTo){
    res.locals.returnTo=req.session.returnTo;
  }
  next();
}

module.exports.isAuthor=async(req,res,next)=>{
  const {id}=req.params;
  const campground=await Campground.findById(id);
  if(!campground.author.equals(req.user._id)){
    req.flash('error','You do not have the authorization to do this!!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports.validateCampground=(req,res,next)=>{
  const {error}=campgroundSchema.validate(req.body);// this schema is joi one
  if(error){
    const msg = error.details.map(el => el.message).join(',');
    throw new expressError(msg, 400);
  }
  else{
    next();
  }
}

module.exports.isReviewAuthor=async(req,res,next)=>{
  const {id,reviewId}=req.params;
  const review= await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)){
    req.flash('error','You do not have the authorization to do this!!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports.validateReview=(req,res,next)=>{
  const {error}=reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',');
    throw new expressError(msg, 400);
  }
  else{
    next();
  }
}
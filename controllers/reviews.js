const Review=require('../models/reviews');
const Campground = require('../models/campground');

module.exports.postReview=async (req,res)=>{
  const {id}=req.params;
  const {review}=req.body;
  const newReview=new Review(review);
  const camp=await Campground.findById(id);
  newReview.author=req.user._id;
  await newReview.save();
  camp.reviews.push(newReview);
  await camp.save();
  req.flash('success', 'Created new review!');
  res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteReview=async(req,res)=>{
  const {id,reviewId}=req.params;
  await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review')
  res.redirect(`/campgrounds/${id}`);
}
const Campground = require('../models/campground');
const {cloudinary}=require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index=async (req,res)=>{
  const list=await Campground.find({});
  res.render('campgrounds/index',{list});
}

module.exports.newCampForm=(req,res)=>{
  res.render('campgrounds/new');
}

module.exports.newCampPost=async(req,res)=>{
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
  const campground = new Campground(req.body.campground);
  if(geoData.features.length){
    campground.geometry = geoData.features[0].geometry;
  }
  else{
    req.flash('error','Cannot find the location');
    res.redirect(`/campgrounds/new`);
  }
  campground.image= req.files.map(img => ({url:img.path,filename:img.filename}));
  campground.author=req.user._id;
  await campground.save();
  req.flash('success', 'Successfully made a new campground!');
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground=async (req,res)=>{
  const {id}=req.params;
  
  const campground=await Campground.findById(id).populate({
    path:'reviews',
    populate:{
      path:'author'
    }
  }).populate('author');
  if(!campground){
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show',{campground});
}

module.exports.editCampForm=async (req,res)=>{
  const {id}=req.params;
  const campground=await Campground.findById(id) ;
  if(!campground){
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit',{campground});
}

module.exports.editCampPost=async (req,res)=>{
  const {campground}=req.body;
  const {id}=req.params;
  const foundCamp = await Campground.findByIdAndUpdate(
    id,
    { ...campground },
    { new: true } // Returns the updated document
  );

  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
  if(geoData.features.length){
    foundCamp.geometry = geoData.features[0].geometry;
  }
  else{
    req.flash('error','Cannot find the location');
    res.redirect(`/campgrounds/${foundCamp._id}/edit`);
  }

  const arr=req.files.map(img => ({url:img.path,filename:img.filename}));
  foundCamp.image.push(...arr);
  
  if (req.body.deleteImages.length>0) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await foundCamp.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
  }
  await foundCamp.save();

  req.flash('success', 'Successfully updated campground!');
  res.redirect(`/campgrounds/${foundCamp._id}`);
}

module.exports.deleteCamp=async (req,res)=>{
  const {id}=req.params;
  const camp=await Campground.findById(id);

  if (camp.image) {
    for (let img of camp.image) {
      await cloudinary.uploader.destroy(img.filename);
    }
  }
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted campground')
  res.redirect('/campgrounds');
}
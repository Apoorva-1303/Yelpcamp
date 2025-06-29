const mongoose=require('mongoose');
const Review = require('./reviews');

const ImageSchema = new mongoose.Schema({
  url: String,
  filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema=new mongoose.Schema({
  title: String,
  image: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: String,
  description: String,
  location: String,
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  reviews:[{
    type:mongoose.Schema.Types.ObjectId,ref:'Review'
  }]
},opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`
});

campgroundSchema.post('findOneAndDelete',async function (query){
  if(query){
    await Review.deleteMany({_id:{$in:query.reviews}})
  }
})

const Campground= mongoose.model('Campground',campgroundSchema);

module.exports=Campground;
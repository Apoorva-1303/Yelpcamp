if (process.env.NODE_ENV !== "production") {
  require('dotenv').config({ path: '../.env' });
}


const mongoose = require('mongoose');
const cities=require('./cities')
const {descriptors,places} = require('./seedHelper');
const Campground=require('../models/campground');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


mongoose.connect(process.env.DB_URL,{
  useNewUrlParser: true
})
.then(()=>{
  console.log("Mongo Connected");
})
.catch(err=>{
  console.log("Mongo connection error",err);
})

const randInt= arr => arr[Math.floor(Math.random()*arr.length)];




const fillDB = async ()=>{
  await Campground.deleteMany({});
  for(let i=1;i<=300;i++){
    const cityIndex=Math.floor((Math.random()*1000));
    const randPrice = () => {
      let x = Math.floor(Math.random() * 20) + 9.99; 
      return parseFloat(x.toFixed(2));  
    };
    const newCampground= new Campground({
      location: `${cities[cityIndex].city}, ${cities[cityIndex].state} `, 
      title: `${randInt(descriptors)} ${randInt(places)}`,
      price: randPrice(),
      author:'68029c8d22576b04cfe5ae51',
      // image: `https://picsum.photos/400?random=${Math.random()}`,
      geometry:{
        type: "Point",
        coordinates: [
          cities[cityIndex].longitude,
          cities[cityIndex].latitude,
        ]
      },
      image:[
        {
          url: 'https://res.cloudinary.com/ditjpbgzs/image/upload/v1745081514/YelpCamp/an7vbxm2dnwtxydkzx3f.jpg',
          filename: 'YelpCamp/an7vbxm2dnwtxydkzx3f'
        },
        {
          url: 'https://res.cloudinary.com/ditjpbgzs/image/upload/v1745064425/YelpCamp/v1rfbz2y2xpeq5nmpwqj.jpg',
          filename: 'YelpCamp/v1rfbz2y2xpeq5nmpwqj'
        }
      ],
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Impedit suscipit consectetur maiores ab assumenda voluptatem doloremque architecto expedita nihil iusto voluptatum, facilis voluptates quia culpa, quis quas ipsum voluptatibus officia.'
    });
    await newCampground.save();
  }
}


fillDB().then(()=>{
  mongoose.connection.close();
})
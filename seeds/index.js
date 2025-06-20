if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: '../.env' });
}

const mongoose = require('mongoose');
const axios = require('axios');
const { cloudinary } = require('../cloudinary');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper');
const Campground = require('../models/campground');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB Connected");
})
.catch(err => {
    console.log("Mongo connection error:", err);
});

const randInt = arr => arr[Math.floor(Math.random() * arr.length)];

const uploadFromUrl = async (imageUrl) => {
    const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: 'YelpCamp'
        }, (error, result) => {
            if (error) return reject(error);
            resolve({
                url: result.secure_url,
                filename: result.public_id
            });
        });

        response.data.pipe(stream);
    });
};

const getUnsplashImages = async () => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    const allImages = [];

    for (let page = 1; page <= 20; page++) {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            headers: { Authorization: `Client-ID ${accessKey}` },
            params: {
                query: 'campgrounds',
                per_page: 30,
                page: page
            }
        });

        const urls = response.data.results.map(photo => photo.urls.raw + "&w=800");
        allImages.push(...urls);
        if (allImages.length >= 600) break;
    }

    return allImages.slice(0, 600);
};

const fillDB = async () => {
    await Campground.deleteMany({});
    const imageList = await getUnsplashImages();

    for (let i = 0; i < 300; i++) {
        const cityIndex = Math.floor(Math.random() * 1000);
        const randPrice = () => {
            let x = Math.floor(Math.random() * 20) + 9.99;
            return parseFloat(x.toFixed(2));
        };

        const img1 = await uploadFromUrl(imageList[2 * i]);
        const img2 = await uploadFromUrl(imageList[2 * i + 1]);

        const newCampground = new Campground({
            location: `${cities[cityIndex].city}, ${cities[cityIndex].state}`,
            title: `${randInt(descriptors)} ${randInt(places)}`,
            price: randPrice(),
            author: '68029c8d22576b04cfe5ae51',
            geometry: {
                type: "Point",
                coordinates: [
                    cities[cityIndex].longitude,
                    cities[cityIndex].latitude,
                ]
            },
            image: [img1, img2],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Impedit suscipit consectetur maiores ab assumenda voluptatem doloremque architecto expedita nihil iusto voluptatum, facilis voluptates quia culpa, quis quas ipsum voluptatibus officia.'
        });

        await newCampground.save();
        console.log(`Campground ${i + 1}/300 created`);
    }
};

fillDB().then(() => {
    mongoose.connection.close();
});

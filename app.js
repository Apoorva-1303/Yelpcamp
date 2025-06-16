if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}


const express = require('express');
const path= require('path');
const mongoose = require('mongoose');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override');
const app=express();
const session=require('express-session');
const flash = require('connect-flash');
const passport=require('passport');
const localStrategy=require('passport-local');
const User=require('./models/user');
const mongoSanitize=require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');


const campgroundRoute=require('./routes/campgrounds');
const reviewRoute=require('./routes/reviews');
const userRoute=require('./routes/users');

const dbUrl=process.env.DB_URL;
mongoose.connect(dbUrl)
.then(()=>{
  console.log("Mongo Connected");
})
.catch(err=>{
  console.log("Mongo connection error",err);
})

app.engine('ejs',ejsMate);

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: secret
  }
});

const sessionConfig={
  store,
  name:'session',
  secret:secret,
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly: true,
    // secure:true,
    expires: Date.now()+ 1000*60*60*24*30,
    maxAge: 1000*60*60*24*30
  }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
  "https://api.maptiler.com/", 
];

const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/ditjpbgzs/", 
        "https://images.unsplash.com/",
        "https://api.maptiler.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);



app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');
  next();
})


app.use('/campgrounds',campgroundRoute);
app.use('/campgrounds/:id/reviews',reviewRoute);
app.use('/',userRoute);

app.get('/',(req,res)=>{
  res.render('home');
})


app.all(/(.*)/, (req, res, next) => {
  res.send("NOT FOUND!!! 404!!!")
})

app.use((err,req,res,next)=>{
  const {statusCode=500, message}=err;
  if(!message)err.message="Something Went Wrong!!";
  res.status(statusCode).render('error.ejs',{err});
})

const port = process.env.PORT || 3000;

app.listen(port,()=>{
  console.log(`Server connected to port ${port}`);
})


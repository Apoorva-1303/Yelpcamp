const express = require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const { isLoggedIn,isAuthor,validateCampground } = require('../middleware');
const campgrounds=require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn , upload.array('image') ,validateCampground ,catchAsync(campgrounds.newCampPost));

router.get('/new', isLoggedIn ,campgrounds.newCampForm);

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image') ,validateCampground ,catchAsync(campgrounds.editCampPost))
  .delete(isLoggedIn, isAuthor , catchAsync(campgrounds.deleteCamp));

router.get('/:id/edit', isLoggedIn, isAuthor , catchAsync(campgrounds.editCampForm))



module.exports=router;
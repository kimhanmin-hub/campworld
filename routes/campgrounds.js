const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../seeds/utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
   

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports.showCampground = async (req, res, next) => {
    try {
        const campground = await Campground.findById(req.params.id)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author'
                }
            })
            .populate('author');
        
        if (!campground) {
            req.flash('error', '캠프그라운드를 찾을 수 없습니다!');
            return res.redirect('/campgrounds');
        }
        
        res.render('campgrounds/show', { campground });
    } catch (err) {
        next(err);  // 에러를 다음 미들웨어로 전달
    }
}

module.exports = router;
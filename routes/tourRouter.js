const express = require('express')
const {getAllTours , getTourStats, getMonthlyPlan, aliasTopTours, createTour , getTour , updateTour , deleteTour, checkID , checkBody ,getToursWithin,getDistances, uploadTourImages, resizeTourImages } = require('./../controllers/tourController')
const authController = require('./../controllers/authController')
const reviewRouter = require('./../routes/reviewRouter')

const router = express.Router();

// router.param('id', checkID)
router
.route('/top-5-cheap')
.get(aliasTopTours,getAllTours)

router
.route('/tour-stats')
.get(getTourStats)
router
.route('/monthly-plan/:year')
.get(authController.protect,authController.restrictTo('admin','lead-guuide','guide'),getMonthlyPlan)


// /tours-within/233/center/-40,45/unit/mi
// /tours-within?distance=233&center=-40,45&unit=mi
router
.route('/tours-within/:distance/center/:latlang/unit/:unit')      
.get(getToursWithin)

router
.route('/distances/:latlang/unit/:unit')      
.get(getDistances)

router
.route('/')
.get(getAllTours)         
.post(authController.protect,authController.restrictTo('admin','lead-guuide'),createTour)


// chaining multiple middleware functions
//.post(checkBody,createTour);

router
.route('/:id')
.get(getTour)
.patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour)

.delete(authController.protect,authController.restrictTo('admin', 'lead-guide'), deleteTour);



// POST  /tour/234fad4/reviews  
// GET  /tour/234fad4/reviews  
// GET  /tour/234fad4/reviews/9488dsa  

// router
// .route('/:tourId/reviews')
// .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReviews
// )
// Parent Routr
router.use('/:tourId/reviews',reviewRouter)

module.exports = router;
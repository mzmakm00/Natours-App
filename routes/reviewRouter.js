const express = require('express')
const reviewController = require('./../controllers/reviewController')
const authController = require('./../controllers/authController')

//child router
// this (mergeParams : true) means /tour/234fad4/reviews this tour id merging with review url  
const router = express.Router({mergeParams : true})

router.use(authController.protect)

router
.route('/')
.get(reviewController.getAllReviews)
.post( 
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
    )

router
.route('/:id')
.get(reviewController.getReview)
.patch(
    authController.restrictTo('user','admin'),
    reviewController.updateReview
    )
.delete(
    authController.restrictTo('user','admin'),
    reviewController.deleteReview
    );


module.exports = router ;
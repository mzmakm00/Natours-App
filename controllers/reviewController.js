const Review = require('./../models/reviewModel')
const factory = require('./handleFactory')


exports.setTourUserIds = (req,res,next) => {
    
    // Allowing nested routes for create reviews on Tour
    
    if (!req.body.tour ) req.body.tour = req.params.tourId;
    
    if (!req.body.user)  req.body.user = req.user.id;

    next()

}

exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review)
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);





// exports.createReviews = catchAsync(async (req , res , next) => {
    
//     const newReview = await Review.create(req.body)

//     res.status(201).json({
//         status : "success",
//         data : {
//             review : newReview
//         }
//     })
// })

// exports.getAllReviews = catchAsync(async (req , res , next) => {
//     // If req.params.tourId is present, it creates a filter object to find reviews associated with that specific tour; otherwise, it retrieves all reviews.
//     let filter = {};
//     if(req.params.tourId) filter = {tour : req.params.tourId}

//     const reviews = await Review.find(filter);
//     res.status(200).json({
//         status : "success",
//         results : reviews.length,
//         data : {
//             reviews
//         }
//     })
// })


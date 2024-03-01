// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {      // Parent referencing
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
      populate: {
         select: 'name photo', // Include the 'photo' property
      }
   }
   
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour : 1, user: 1}, {unique : true , dropDups: true})

reviewSchema.pre(/^find/, function(next){
//   // this.populate({
//   //   path : 'tour',
//   //   select : 'name'
//   // }).populate({
//   //   path : 'user',
//   //   select : 'name'
//   // })
  this.populate({
    path : 'user',
    select : 'name'
  })

  next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats,stats.length)
  // Check if there are stats to update
  if (stats.length > 0) {
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // Handle the case when there are no reviews for the tour
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Middleware for updating average ratings after saving or updating,deleting a review
reviewSchema.post(['save', 'findOneAndUpdate', 'findOneAndDelete'], async function (doc) {
  // 'this' points to the current review
  await mongoose.model('Review').calcAverageRatings(doc.tour);
});



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
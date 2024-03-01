const catchAsync = require('./../utils/catchAsync')
const APIFeatures = require('./../utils/apiFeature')
const AppError = require('./../utils/appError');

exports.deleteOne = Model => catchAsync(async (req,res , next) => 
{
    const doc = await Model.findByIdAndDelete(req.params.id)
    if( !doc ){
     return next(new AppError ('No Document found with that ID',404))
 } 
    res.status(200).json({
     status: 'success',
     message : 'Data has been deleted'
 })
})

exports.updateOne = Model => catchAsync(async (req,res ,next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body , {new : true , runValidators : true})
    if( !doc ){
        return next(new AppError ('No Document found with that ID',404))
    }  
    res.status(200).json({
        status: 'success',
        data : {
            doc 
        }
    })

})

exports.createOne = Model => catchAsync(async (req,res) => {
    //   console.log(req.body);
        const doc = await Model.create(req.body)
        res.status(201).json({
            status : "success",
            data : {
                doc
            }
        })
});
    
exports.getOne = (Model, popOptions) => catchAsync(async (req,res,next) => {
     let query = Model.findById(req.params.id)
     if(popOptions) query = query.populate(popOptions);
     const doc = await query;

  //  const tour = await Tour.findById(req.params.id).populate('reviews')
 
     if( !doc ){
    return next(new AppError ('No document found with that ID',404))
 }
    res.status(200).json({
     status : "success",
     data : doc
 })
}) 

// exports.getAll = (Model,popOptions) => catchAsync(async ( req, res, next) => {
    
// // If req.params.tourId is present, it creates a filter object to find reviews associated with that specific tour; otherwise, it retrieves all reviews.
//     // Allowing for nested routes reviews on tours
//         let filter = {};
//         if(req.params.tourId) filter = {tour : req.params.tourId}
    
//     let features = new APIFeatures(Model.find(filter), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//     if(popOptions) features = features.populate(popOptions);

//     // console.log(features)
//     const doc = await features.query           /// duration[gte]=5&difficulty=easy&price[lt]=1500&limit=5

//     // send response
//     res.status(200).json({
//         status : 'success',
//         requestedAt : req.requestTime,
//         results : doc.length,
//         data : doc
        
//     })
// }) 

exports.getAll = (Model, popOptions) => catchAsync(async (req, res, next) => {

    // If req.params.tourId is present, it creates a filter object to find reviews associated with that specific tour; otherwise, it retrieves all reviews.
    // Allowing for nested routes reviews on tours
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }

    let features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const query = features.query;   // Get the Mongoose query object

    if (popOptions) {
        // Check if the query object has a `populate` method before calling it
        if (typeof query.populate === 'function') {
            query.populate(popOptions);
        } else {
            console.error('Query object does not have a populate method');
        }
    }

    const doc = await query;

    // send response
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: doc.length,
        data: doc
    })
});

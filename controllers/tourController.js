const Tour = require('./../models/tourModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError');
const factory = require('./handleFactory')
const multer = require('multer')
const sharp = require('sharp')

const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('Not an image! Please upload only images', 400),false)
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
});

exports.uploadTourImages = upload.fields([
    { name : 'imageCover', maxCount : 1},
    { name : 'images', maxCount : 3}
]); 

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    console.log(req.files);
    next();
});


exports.aliasTopTours = (req,res,next) => {      /// Alias routing
    
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next()
}

exports.getAllTours = factory.getAll(Tour, { path : 'reviews'})
exports.getTour = factory.getOne(Tour , { path : 'reviews'})
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTourStats = catchAsync(async ( req, res , next ) => {
        const stats = await Tour.aggregate([
            {
                $match : { ratingsAverage : { $gte : 4.5 } }
            },
            {
                $group : {
                    _id : { $toUpper: '$difficulty'},
                    numTours : {$sum : 1},
                    numRatings : {$sum : '$ratingsQuantity'},
                    avgRating : { $avg : '$ratingsAverage'},
                    avgPrice : { $avg : '$price'},
                    minPrice : { $min : '$price'},
                    maxPrice : { $max : '$price'}
                }
            },
            {  $sort : { avgPrice : 1}
            },
            // {
            //     $match : { _id : {$ne : 'EASY' }}
            // }
        ])
        res.status(200).json({
            status: 'success',
            data : { stats }
        }) 
})    


exports.getMonthlyPlan = catchAsync(async (req,res, next) => {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind : '$startDates'
            },
            {
                $match : 
                {  
                    startDates : 
                    {
                    $gte : new Date(`${year}-01-01`),
                    $lte : new Date(`${year}-12-31`),

                    }  
                }
            },
            {
                $group : {
                    _id : { $month : '$startDates'},
                    numTourStarts : { $sum : 1},
                    toursName : { $push :'$name' }
                }
            },
            {
                $addFields  : { monthNum : '$_id'}
            },
            {
                $project : {                
                    _id : 0,
        //        numTourStarts: 1,
        //         monthNum : 1 
                }
            },
            {
                $sort : { numTourStarts : -1}
            },
            {
                $limit : 6
            }
        ])
        res.status(200).json({
            status: 'success',
            results : plan.length,
            data : { plan }
        })
    })


// /tours-within/233/center/51.174808, -115.570897/unit/mi
// /tours-within/:distance/center/:latlang/unit/:unit   

exports.getToursWithin = async (req,res,next) => {
    const {distance , latlang , unit} = req.params;
    const [lat , lang] = latlang.split(',');

    // converting radius into miles                                         // earth distanc in radius = 3963             
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;   // earth distance in km = 6378.1  

    if(!lat || !lang){
        return next(new AppError('Please provide latitude and longitude in this format lat,lang',400));  // bad request
    }

    const tours = await Tour.find({ 
        startLocation : {$geoWithin : { $centerSphere : [[lang,lat], radius] } } })

    console.log(distance,lat,lang,unit)
    res.status(200).json({
        status : 'success',
        results: tours.length,
        data : {
            data : tours 
        }
    })
    
}

exports.getDistances = async (req,res,next) => {
    const {latlang , unit} = req.params;
    const [lat , lang] = latlang.split(',');

    // 1 meter to miles otherwise kilometes
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lang){
        return next(new AppError('Please provide latitude and longitude in this format lat,lang',400));  // bad request
    }

    const distances = await Tour.aggregate([
        {
            $geoNear : {
                near : {
                    type : 'Point',
                    coordinates : [lang * 1, lat * 1]
                },
                distanceField : 'distance',
                distanceMultiplier : multiplier
            }
        },
        {
            $project : {
                distance : 1,
                name : 1
            }
        }
    ])

    res.status(200).json({
        status : 'success',
        data : {
            data : distances
        }
    })
    
}

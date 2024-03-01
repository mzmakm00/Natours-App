const Tour = require('./../models/tourModel')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

exports.getOverview = catchAsync(async (req,res,next) => {
    // 1) Get Tour data from collection
    const tours = await Tour.find()
    // 2) Build the template
    
    // 3) Render that template using tour data from 1)
    res.status(200).render('overview', {
      title : 'All Tours',
      tours
    })
  }
)

exports.getTour = catchAsync( async (req,res,next ) => {
  //  1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug });

  if (!tour) {
    return next(new AppError('There is no tour with that name',404))
  }
  
  // Fetch reviews and populate user data
  await tour.populate({
    path: 'reviews',
    populate: {
      path: 'user',
      select: 'name photo', // Include the 'photo' property
    },
  });
  //  2) Build the template

  //  3) Render tha template using data from 1)
    res.status(200).render('tour', {
      title : `${tour.name} Tour`, 
      tour 
    })

  })


exports.getAllTours = (req,res) => {
    res.status(200).render('base', {
      tour : 'The Forest Hiker',
      user : 'Jonas'
    })
  }  

  exports.login = (req,res) => {
    res.status(200).render('login', {
      title:'Log in Your account'
    })
  }  


  exports.getAccount = (req, res , next) => {
   res.status(200).render('account',{
    title : 'Your Account'
   }); 
  };

  
// its only for Without API
  exports.updateMe = catchAsync (async(req,res,next) => {
    // console.log('Updated User',req.body)
    const updatedUser = await User.findByIdAndUpdate(
    req.user.id, 
    {
      name : req.body.name,
      email : req.body.email
    },
    {
      new : true,
      runValidators :true 
    })
    res.status(200).render('account',{
      title : 'Your Account',
      user : updatedUser
     });
  })

  
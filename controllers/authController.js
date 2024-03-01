const crypto = require('crypto') 
const {promisify} = require('util')
const User = require('../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')

const signToken = id => {
     // Create and sign a JWT with the provided user ID
     return jwt.sign({ id : id } , process.env.JWT_SECRET , {
       expiresIn : process.env.JWT_EXPIRES_IN
   })
}


const createSendToken = (user, statusCode , res) => {
//   const token = signToken(newUser._id)
     const token = signToken(user._id)
     console.log(token)
     const cookieOptions = {
      expires : new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly : true,
   //   sameSite: 'None' 
     };

     if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
     res.cookie('jwt', token , cookieOptions)

     // remove the password for showing the cookie 
     user.password = undefined
     res.status(statusCode).json({
        status : 'success',
        token,
        data : {
        user 
        }
     })
}
const signUP = catchAsync(async (req , res , next) => {
     const newUser = await User.create(req.body);
     createSendToken(newUser,201,res)
   
});

const logIn = catchAsync(async(req ,res, next) => {
   const email = req.body.email;
   const password = req.body.password ; 
   
   // check if email and password exist
 
   if (!email || !password){
      return next(new AppError ('Please provide email and password !' , 400))
   }

   // // Check if email and password match  
   
    const user = await User.findOne({ email: email }).select('+password');

    if (!user) {
      return next(new AppError("Invalid Email", 401));
    }
    
    const correctPassword = await user.correctPassword(password , user.password);
    
    if (!correctPassword) {
      return next(new AppError("Invalid Password", 401));
    }  
  
   // if match then send the token back to the client
   createSendToken(user,200,res)
   // const token = signToken(user._id)
   // res.status(200).json({
   //    status : 'success',
   //    token 
   // });
});


// const protect = catchAsync(async (req ,res ,next) => {
//   //  1) Getting token and check if its there
//   let token ;
//   if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
//   {
//      //  It splits the string into an array of substrings based on the specified delimiter, which is a space (' ').If the Authorization header is, for example, "Bearer ABC123", then after the split, you'd get an array like ["Bearer", "ABC123"].

//    token = req.headers.authorization.split(' ')[1];             
// } else if(req.cookies.jwt){
//    token = req.cookies.jwt
// }
//    // console.log(token)
   
//    if(!token){
//    return next(new AppError('You are not logged in ! Please log in to get the access.',401))
//   }

//   //  2) Verification token

//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
//   // console.log(decoded)
  
//    //  3) check if user still exists   

//    const curentUser = await User.findById(decoded.id)  
//    if(!curentUser){
//       return next(new AppError('The user belonging to this token does no longer exist !',401))
//    }

//   //  4) check if user changed the password after the token was issued   
//       if (curentUser.changedPasswordAfter(decoded.iat))
//       {
//          return next(new AppError('User recently changed password . Please log in Again', 401))
//       }
  
//     // Grant Access to the protected route
//     req.user = curentUser
//     res.locals.user = curentUser  
//     next() 
// })

const protect = catchAsync(async (req, res, next) => {
   // 1) Getting token and check if it's there
   let token;
   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
     token = req.headers.authorization.split(' ')[1];
   } else if (req.cookies.jwt) {
     token = req.cookies.jwt;
   }
 
   if (!token) {
     return next(new AppError('You are not logged in! Please log in to get access.', 401));
   }
 
   try {
      // 2) Verification token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
      // 3) Check if the user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists!', 401));
      }
  
      // 4) Check if the user changed the password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed the password. Please log in again.', 401));
      }
  
      // Grant Access to the protected route
      req.user = currentUser;
      res.locals.user = currentUser;
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        const expiredAt = new Date(err.expiredAt).toLocaleString();
        return next(new AppError(`Token has expired at ${expiredAt}. Please log in again.`, 401));
      } else if (err instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid token. Please log in again.', 401));
      } else {
        return next(new AppError('Authentication failed.', 401));
      }
    }
  });
 


const isLoggedin = catchAsync(async (req ,res ,next) => {

   if(req.cookies.jwt){
      // 1) verify token 
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      //console.log(decoded)

      // 2) check if user still exists   
 
      const curentUser = await User.findById(decoded.id)  
      if( ! curentUser) {
      return next()
      }

      // 3) check if user changed the password after the token was issued   
      if (curentUser.changedPasswordAfter(decoded.iat))
      {
       return next()
      }
      
      // THERE IS LOGGED IN USER
      res.locals.user = curentUser 
      return next();          
   }
   next();  
 })
 
const loggedOut = (req, res) => {
   try {
     // Clear the 'jwt' cookie
     res.clearCookie('jwt');
     res.status(200).json({ status: 'success' });
   } catch (err) {
     res.status(500).json({ status: 'error', message: 'Could not log out user' });
   }
 };

const restrictTo = (...roles) => {
   return (req, res, next) => {
      // roles [admin , lead-guide]. role ='user'

      if (!roles.includes(req.user.role)) {
         return next(new AppError('You do not have permission to perform this action',403))
      }
      next()
   }
}

   const forgotPassword = catchAsync(async (req, res, next) => {
      // 1) Get user based on POSTed email
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return next(new AppError('There is no user with email address.', 404));
      }
    
      // 2) Generate the random reset token
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });
    
      // 3) Send it to user's email
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
    
      const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your password reset token (valid for 2 min)',
          message
        });
    
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
      } catch (err) {
         console.log('error sending email',err)
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    
        return next(
          new AppError('There was an error sending the email. Try again later!'),
          500
        );
      }
    });
    

const resetPassword = catchAsync(async (req,res,next) => {

   //  1) Get user based on the token

   const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
   const user = await User.findOne({passwordResetToken:hashedToken , passwordResetExpires : { $gt : Date.now() }})
 
   // 2) If token has not expired , and there is user , set the new password 

    if(!user){
      return next(new AppError('Token is invalid or has expired',400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken= undefined ;
    user.passwordResetExpires = undefined ;
    await user.save();

 // 3) Update changedPasswordAt property for the user
 // this updatemiddleware in usermodel

 // 4) Log the user in , send JWT
 createSendToken(user,200,res)
})

const changedPassword = catchAsync(async (req,res,next) => {
   // 1) Get user from collection
   const user = await User.findById(req.user.id).select('+password');

   // 2) Check the current password is correct or not 
   if(! await user.correctPassword(req.body.passwordCurrent, user.password)){
      return next(new AppError('Your current Password is not correct',401))
   }

   // 3) If so update the password
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   await user.save() 

   // 4) Log in again send JWT
   createSendToken(user,200,res)
})

module.exports = {
   signUP ,
   logIn , 
   protect ,
   isLoggedin,
   loggedOut, 
   restrictTo , 
   forgotPassword , 
   resetPassword ,
   changedPassword
}
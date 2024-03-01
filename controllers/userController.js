const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handleFactory')
const multer = require('multer')
const sharp = require('sharp')
// const multerStorage = multer.diskStorage({
//     destination : (req, file, cb) => {
//         cb(null,'public/img/users');
//     },
//     filename : (req, file, cb) => {
//     // user-userid-timestamp.jpeg
//     const ext = file.mimetype.split('/')[1];          // when we do con.log(req.file) then mimetype: 'image/jpeg'
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     } 
// })
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

const uploadUserPhoto = upload.single('photo') 
const uploadresizePhoto = async (req,res,next) => {
    if(!req.file) return next();
 
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
     .resize(500,500)
     .toFormat('jpeg')
     .jpeg({ quality : 90 })
     .toFile(`public/img/users/${req.file.filename}`)

    next() 
}


const getUser = factory.getOne(User);
const getAllUsers = factory.getAll(User);
const deleteUser = factory.deleteOne(User);

// Not update passwords with this
const updateUser = factory.updateOne(User);


const createUser = (req,res) => {
    res.status(500).json({
        status : 'error',
        message : 'For Creating user go to signup'
    })
} 

const getMe = (req,res,next) => {
    req.params.id = req.user.id
    next()
}

const forUpdateuser = (req,res,next) => {
    if (req.body.password || req.body.passwordConfirm)
    {
        return next(new AppError('Sorry, this route is not for password updates . Please use /updatemypassword ',400))
    }
   next()
}

// this is for updateMe
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}


// its for currently logged in user and the otheroption is for administrator
const updateMe = async (req,res,next) => {
    console.log(req.file)
    console.log(req.body)

   // 1) Check if user update password then send it error
    if (req.body.password || req.body.passwordConfirm)
    {
        return next(new AppError('Sorry, this route is not for password updates . Please use /updatemypassword ',400))
    }

    // 2) Filtered out unwanted field names that are not allowed to be updated
 
    const filteredBody = filterObj(req.body, 'name' , 'email')
    if(req.file) filteredBody.photo = req.file.filename
    // 3) Update the user
    const user = await User.findByIdAndUpdate(req.user.id , filteredBody , {
        new : true,
        runValidators : true 
     })

    res.status(200).json({
        status : 'success',
        data : {
        user 
        }
})
} 
const deleteMe = catchAsync(async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id , { active: false})
    
    res.status(204).json({
        status : 'success',
        data : null
        })
    }catch(err){
        console.log(err)
    }
}) 



module.exports =  {
    getAllUsers,
    getUser,
    updateMe,
    updateUser,
    deleteMe,
    deleteUser,
    createUser,
    getMe,
    forUpdateuser,
    uploadUserPhoto,
    uploadresizePhoto
 };

const crypto = require('crypto')
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name : { type : String , required : [ true , 'Name must required'] },
    email : 
    {
         type : String,
         required : [ true , 'Provide your email'],
         unique : true ,
         lowerCase : true,
         validate : [validator.isEmail , 'Provide a valid email']     
    },
    
    photo : {
    type : String,
    default : 'default.jpg'
    },

    role : {
    type : String,
    enum : ['admin', 'user' , 'guide', 'lead-guide'],
    default : 'user'   
    },  
    
    password : 
    { 
        type : String,
        required : [true , 'Provide a password'],
        minlength : 8,
        select:false

    },
    passwordConfirm : 
    {
        type : String ,
        required : [ true , 'Provide Confirm password'],
        validate : {
            // This only works on Create and Save
            validator : function (el) {
                return el === this.password
            },
        message : "Passwords are not same !"    
        }
    },
    passwordChangedAt : Date,

    passwordResetToken : String,
    passwordResetExpires : Date,
    active : {
        type : Boolean,
        default : true ,
        select : false,
    }
});

userSchema.pre(/^find/, function(next ){
    // this point to the current query    {active : true}
    this.find({ active : {$ne : false} })
next()
})

userSchema.pre('save' , async function (next) {
    // only run this functon if password was actually modified
    if(!this.isModified('password')) return next ();
   
    // Hash the password with 12
    this.password = await bcrypt.hash(this.password , 12)
    
    // Delete Confirmation field 
    this.passwordConfirm = undefined;
    next () 
})


userSchema.pre('save', function(next ){
   if(!this.isModified('password') || this.isNew) return next();

   this.passwordChangedAt = Date.now();
   next()
})

// Instance methods

userSchema.methods.correctPassword = async function (candidatePassword , userstoredPassword)
{
    return await bcrypt.compare(candidatePassword , userstoredPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  
    if (this.passwordChangedAt){
        const chnagedTime = parseInt(this.passwordChangedAt.getTime() / 1000 , 10);
        console.log(chnagedTime,JWTTimestamp)

        return JWTTimestamp < chnagedTime ;
  }

  // False means not changed
  return false
}

userSchema.methods.createPasswordResetToken = function() {
    
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken }, this.passwordResetToken)
 
    this.passwordResetExpires = Date.now() + 20 * 60 * 1000;

    return resetToken ;
} 

const User = mongoose.model('User', userSchema)

module.exports = User;  
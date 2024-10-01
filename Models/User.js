const { boolean } = require('joi');
const mongoose = require('mongoose');
const validator = require('validator');



const UserSchema = new mongoose.Schema({
    
    firstName: {
        type: String
        
    },
    lastName:{
        type: String
        
    },
    email : {
        type: String,
        // required: true,
        unique: true,
        validator : {
            validator : function(v) {
                return validator.isEmail(v);
            },
            message : "Your Email  is not valid email"
        }
    },
    password: {
        type: String
        
    },
    confirmPassword: {
        type: String
        
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String
    },
    expiresAt: { 
        type: Date 
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
   
});

module.exports = mongoose.model('user',UserSchema);
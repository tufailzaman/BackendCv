const mongoose = require('mongoose');
//const validator = require('validator');

const CvSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     intro: {
        type: String
     },
     firstName: {type: String},
     lastName: {type : String},
     email : {
        type: String,
        // unique: false,
        // validator : {
        //     validator : function(v) {
        //         return validator.isEmail(v);
        //     },
        //     message : "Your Email  is not valid email"
        // }
    },
     profession: {
         type: String
         
     },
    city: {
        type: String
       
    },
   postalCode: {
       type: Number
    },
    country: {
        type: String
        
    },
    phone: {
        type: String
        
    }, 
    picture: { type: String },

    workExperience: [{ 
        jobTitle: String,
        company: String, 
        location: String,
        startDate: String,
        endDate : String,
     }],

    education: [{
        school: String,
        schoolLoc: String,
        degree: String,
        fieldOfStudy: String,
        graduationDate: String
    }],
    
    skills: [{ type: String }],

    customSections: [{
        sectionTitle: { type: String },
        content: { type: String }
    }],
    stepCompleted: { type: Number, default: 0 },
    templateId : {type:String}
});


module.exports = mongoose.model('cv', CvSchema);
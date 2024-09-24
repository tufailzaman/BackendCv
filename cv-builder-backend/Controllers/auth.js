const userModel = require('../Models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const sendgridTranport = require('nodemailer-sendgrid-transport');
const DataValidation = require('../Models/DataValidator');
const tokenModel = require('../Models/TokenModel');
const cvModel = require('../Models/Cv');
const {config} = require('dotenv');
config();

const transporter = nodemailer.createTransport(sendgridTranport({
    auth:{
        api_key : process.env.api_key
     }
}));

exports.postSignUp = async (req, res, next) => {
    const { error } = DataValidation.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }
   try{
    const {email, firstName, lastName, password, confirmPassword} = req.body;

    
    const user = await userModel.findOne({email: email});
    if(user){
        return res.send({
            sucess: false,
            error: true,
            "message": `This email, ${email} already exist`
        })
    }
    const hashedPassword = await bcrypt.hash(password,12);
    const hashedConfirm = await bcrypt.hash(confirmPassword,12);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const userData = new userModel ({
        email : email,
        firstName: firstName,
        lastName: lastName,
        password: hashedPassword,
        confirmPassword: hashedConfirm,
        verificationCode : verificationCode
    });
    
    await userData.save();

    await transporter.sendMail({
        to: email,
        from: 'generationcv333@gmail.com',
        subject: "Verify your email",
        html: `<h1> Your verification code is ${verificationCode}`
     });
   
    res.send({
        success: true,
        error: false,
        message: " Please check your email to verify your email "
    });
   }
   catch (error) {
    res.send({
        
            success: false,
            error: true,
            message: "can not store personal data in the database"

       
    })
   }
};

exports.generateCode = async (req, res, next) => {
    try{
        const email = req.body.email;
        const user = await userModel.findOne({email: email})
        if(!user) {
            return res.send({
                success: false,
                error: true,
                message: `does not have user of this email ${email}`
            })
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;

        await user.save();
        await transporter.sendMail({
            to: email,
            from: 'tufailzaman789@gmail.com',
            subject: "Verify your email",
            html: `<h1> Your verification code is ${verificationCode}`
         });
         res.send({
            success: true,
            error: false,
            message: "Code is send to your email plz check that.."
         })

    }
    catch (error) {
        res.send({
            success: false,
            error: true,
            message: "Can't generate code"
        })
    }
};

exports.verifyEmail = async (req, res, next) =>{
    try{
        const {email, verificationCode} = req.body;
        const user = await userModel.findOne({email: email});
        if(!user) {
            
            return res.status(400).send("does not have user")
        }
        if(user.verificationCode === verificationCode) {

            user.isVerified = true;
            user.verificationCode = "";
    
           await user.save();

        await  transporter.sendMail({
            to: email,
            from: 'generationcv333@gmail.com',
            subject: "Signed up Sucessfully",
            html: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Automated Cv generation and apply system website</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
            }
    
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #fff;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                text-decoration: none;
            }
            
            .button {
                background-color: #4CAF50;
                color: #fff;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            
            .button:hover {
                background-color: #3e8e41;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Welcome to Automated CV generation and apply system, ${user.firstName} ${user.lastName}!</h2>
            <p>Thank you for signing up for our Automated CV generation and job application system! We're excited to help you take your career to the next level.</p>
            <p>With our cutting-edge technology, you'll be able to create a professional CV in minutes and apply to your dream jobs with ease. Our system is designed to help you stand out from the competition and increase your chances of getting hired.</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out to us at tufailzaman789@gmail.com. We're here to help.</p>
            <p>Best regards,</p>
            <p>Automated CV generation and apply system</p>
        </div>
    </body>
    </html>`
         });


           res.send({
            success: true,
            error: false,
            message: "Email Verified Sucessfully"
           })
        } else {

            res.send({
                sucess: false,
                error : true,
                message: "Incorrect verification code and email deleted from database"
            })
        }
    }
      
    
    catch (error) {
        res.send({
            sucess: false,
            error: true,
            message : "Email does not verified"
        })
    }
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Check if email exists
        const user = await userModel.findOne({ email });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!user || !isMatch) {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'Invalid email or password'
            });
        }

        // Check if the account is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                error: true,
                message: 'Account not verified. Please verify your email first.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET, // Store your JWT secret in env variables
            { expiresIn: '1h' } // Token expires in 1 hour
        );

      const Token =  new tokenModel ({
            userId: user._id,
            token: token
        })
           await Token.save();
        // Successful login
        res.status(200).json({
            success: true,
            error: false,
            message: 'Login successful',
            token,
            userId: user._id
        });
    }
        // transporter.sendMail({
        //     to: email,
        //     from: 'tufailzaman789@gmail.com',
        //     subject: "New Login Alert",
        //     html: `
        //    <
        //     `
        // })
    
    catch(error) {
        res.send({
            sucess: false,
            error: true,
            message: "Can not login"
        })
    }
};

exports.postLogout = async (req, res) => {
    const { userId } = req.user; // Extract userId from the JWT token

try {
    // Remove the user's token from the tokenModel (logout by deleting the token)
    await tokenModel.deleteMany({ userId });

    res.status(200).json({
        success: true,
        message: 'Logout successful. Token invalidated.',
    });
} catch (error) {
    res.status(500).json({
        success: false,
        message: 'Error during logout',
    });
}
   
};

exports.postReset = async (req, res, next) => {
    try{
        const email = req.body.email;

        const user = await userModel.findOne({email: email});
        if(!user) {
         return   res.status(400).send(`Your email, ${email} does not exist`)
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.isVerified = false;
        user.verificationCode = verificationCode;
        await user.save();
       await transporter.sendMail({
            to: email,
            from: 'generationcv333@gmail.com',
            subject: 'Verify your email ',
            html: `your verification code is ${verificationCode}`
        });
        res.send({
            sucess: true,
            error: false,
            message: "Check your email for code to verify your email"
        })
    }
    catch (error) {
        res.send({
            success: false,
            error: true,
            message : "error in sending veriification code"
        })
    }
};

exports.newPassword = async(req, res, next) => {
    try{
        const email = req.body.email;
        const newPassword = req.body.newPassword;
        const user = await userModel.findOne({email : email}); 
    
        if(!user) {
            return res.status(400).send("can't find user with this id");
        }
        if(user.isVerified === false) {
            return res.send({
                success: false,
                error: true,
                message : "First verify your email"
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword,12);
        user.password = hashedPassword;
        user.confirmPassword = hashedPassword;

        await user.save();
        transporter.sendMail({
            to: user.email,
            from: 'generationcv333@gmail.com',
            subject: "Password Updated",
            html: `${user.firstName} ${user.lastName} keep you password secret and do not share with someone else`
        });

        res.send({
            success: true,
            error: false,
            message: "password updated sucessfully"
        });

    }
    catch ( error) {
        res.send({
            success: false,
            error: true,
            message: "New password can't save in the database"
        });
    }
};


exports.postDeleteAccount = async (req, res) => {
    const {password} = req.body;
    const userId = req.user.userId; // Extracted from the JWT token

    try {
        // Find the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }
// Delete associated CVs
    await cvModel.deleteMany({ userId });

// Delete user account
    await userModel.findByIdAndDelete(userId);

// Remove all tokens related to this user (if using DB for tokens)
await tokenModel.deleteMany({ userId });

        res.status(200).json({
            success: true,
            message: 'Account and associated CVs deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during account deletion'
        });
    }
};


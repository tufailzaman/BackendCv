const userModel = require('../Models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const sendgridTranport = require('nodemailer-sendgrid-transport');
const DataValidation = require('../Models/DataValidator');
const tokenModel = require('../Models/TokenModel');
const crypto = require('crypto')
const formDataModel = require('../Models/formDataModel')
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
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    const userData = new userModel ({
        email : email,
        firstName: firstName,
        lastName: lastName,
        password: hashedPassword,
        confirmPassword: hashedConfirm,
        verificationCode : verificationCode,
        expiresAt: expiresAt
    });
    
    await userData.save();

    await transporter.sendMail({
        to: email,
        from: 'generationcv333@gmail.com',
        subject: "Verify your email",
        html: `<h1> Your verification code is ${verificationCode} </h1>`
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

        if (user.isVerified) {
            return res.send({
                success: false,
                error: true,
                message: "Email is already verified."
            });
          }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

        user.verificationCode = verificationCode;
        user.expiresAt = expiresAt;

        await user.save();
        await transporter.sendMail({
            to: email,
            from: 'generationcv333@gmail.com',
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
        
        if (new Date() > user.expiresAt) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
        }
        
        
        if(user.verificationCode === verificationCode) {
            
            user.isVerified = true;
            user.verificationCode = "";
            user.expiresAt = "";
            
            await user.save();
            
      
            await  transporter.sendMail({
                to: email,
                from: 'generationcv333@gmail.com',
                subject: "Signed up Successfully",
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
            message: "Email Verified Successfully"
           })
        } else {

            res.send({
                success: false,
                error : true,
                message: "Incorrect verification code, please try again"
            })
        }
    }
      
    
    catch (error) {
        res.send({
            success: false,
            error: true,
            message : "Email does not verified"
        })
    }
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        
        const user = await userModel.findOne({ email });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!user || !isMatch) {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'Invalid email or password'
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                error: true,
                message: 'Account not verified. Please verify your email first.'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );

      const Token =  new tokenModel ({
            userId: user._id,
            token: token
        })
           await Token.save();
        
        res.status(200).json({
            success: true,
            error: false,
            message: 'Login successful',
            token,
            user,
            userId: user._id
        });
    }
    
    catch(error) {
        res.send({
            success: false,
            error: true,
            message: "Can not login"
        })
    }
};

exports.postLogout = async (req, res) => {
    const { userId } = req.user; 

try {
    
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
    const { email } = req.body;
    
    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 20 * 60 * 1000; 

    await user.save({ validateBeforeSave: false });

    const origin = req.get('origin'); 
    const referer = req.get('referer'); 
    const baseURL = origin || referer;

    
    const resetURL = `${baseURL}/api/newPassword/${resetToken}`;
    try {
    
        await transporter.sendMail({
            to: email,
            from: 'generationcv333@gmail.com',
            subject: "Password Reset",
            html: `You requested a password reset. Click on the following link to reset your password: ${resetURL}`
        })

        res.send({
            success: true,
            error : false,
            message:"Check your email for link"
        })
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({ message: 'Error sending email. Try again later.' });
    }
};

exports.newPassword = async(req, res, next) => {
    try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.send({
            success: false,
            error: true,
            message: "Invalid token or time out"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    
        await transporter.sendMail({
            to: user.email,
            from: 'generationcv333@gmail.com',
            subject: 'Password Updated',
            html:`Hello ${user.firstName} ${user.lastName}, your password has been successfully updated, please do not share with any one else.`
        })
        
        res.status(200).json({ message: 'Password has been reset successfully and email sent' });
    } catch (err) {
        return res.status(500).json({ message: 'Password reset but failed to send confirmation email' });
    }
};


exports.postDeleteAccount = async (req, res) => {
    const {password} = req.body;

    const userId = req.params.userId;

    try {
        
        const user = await userModel.findById(userId);
        console
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }
    await formDataModel.deleteMany({ userId });
    await userModel.findByIdAndDelete(userId);
    await tokenModel.deleteMany({ userId });

        res.status(200).json({
            success: true,
            error:false,
            message: 'Account and associated CVs deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: true,
            message: 'Error during account deletion'
        });
    }
};


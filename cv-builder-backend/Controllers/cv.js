const CvModel = require('../Models/Cv');
const path = require('path');
const pdf = require('html-pdf');


exports.setTemplate = async (req, res, next) => {
    const { userId,templateId, cvId } = req.body;
    try {
        
        let cv = null;

        if (cvId) {
            // If cvId is provided, try to find the CV
            cv = await CvModel.findById(cvId);
        }

        if (cv) {
            // Update existing CV if found
            cv.templateId = templateId || cv.templateId;
            cv.stepCompleted = 0;
            if(userId) {
                cv.user = userId
            }
        } else {
            // Create a new CV if no CV is found
            if(userId){
                cv = new CvModel({
                    templateId: templateId,
                    user: userId,
                    stepCompleted: 0
                });
            }
            else {
            cv = new CvModel({
                templateId: templateId,
                stepCompleted: 0
            }); }
        }
          await cv.save();   

          res.send({
            success: true, 
            error: false,
            message: "You set the template, please proceed with your CV",
            cvId: cv._id
        });
    } catch (error) {
        console.error('Error:', error);
        res.send({
            success: false,
            error: true,
            message: "Can't set the template"
        });
    }
};

exports.postPersonal = async (req , res, next) => {
    try{
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const cvId = req.body.cvId;
        const email = req.body.email;
        const intro = req.body.intro;
        const profession = req.body.profession;
        const city = req.body.city;
        const postalCode = req.body.postalCode;
        const country = req.body.country;
        const phone = req.body.phone;
       
        const picture = req.file ? `/uploads/pictures/${req.file.filename}` : null;
       
        let cv = await CvModel.findById(cvId)
    
        if(!cv ) {
            return res.send({
                success: false,
                error: false,
                message: "can't find your cv"
            })
           } 
           
        if(cv.templateId === undefined) {
            return res.send({
                success: false,
                error: true,
                message: "Please first select the template"
            })
           }
            cv.intro = intro || cv.intro;
            cv.firstName = firstName || cv.firstName;
            cv.lastName= lastName || cv.lastName;
            cv.email= email || cv.email;
            cv.profession = profession || cv.profession;
            cv.city = city || cv.city;
            cv.postalCode = postalCode || cv.postalCode;
            cv.country = country || cv.country;
            cv.phone= phone || cv.phone;

            if (picture) cv.picture = picture || cv.picture;
            cv.stepCompleted = 1;

           
     await cv.save();

        res.send({
            success: true,
            error: false,
            message: "Data Sucessfully save in the database"
        });
    }
    catch(error) {
    res.send({
        success: false,
        error: true,
        message: "Data can not store in the data base"   
     })
    }
};


exports.postWork = async (req, res, next) => {
    try{
        const { cvId, workExperience } = req.body;

        // Find the CV document
        let cv = await CvModel.findById(cvId);

        if (!cv || cv.stepCompleted < 1) {
            return res.send({
                success: false,
                error: true,
                message: "You should complete the first step",
            });
        }

        // If workExperience is provided, process adding or updating
        if (workExperience && Array.isArray(workExperience)) {
            workExperience.forEach((experience) => {
                // If the experience has an _id, attempt to update the existing one
                if (experience._id) {
                    let existingIndex = cv.workExperience.findIndex(
                        (item) => item._id.toString() === experience._id
                    );

                    if (existingIndex !== -1) {
                        // If experience exists, update it
                        cv.workExperience[existingIndex] = experience;
                    } else {
                        // If experience does not exist, add as new
                        cv.workExperience.push(experience);
                    }
                } else {
                    // Add new experience if _id is not present (new entry)
                    cv.workExperience.push(experience);
                }
            });
        }
       cv.stepCompleted = 2;
        
           await cv.save();

        res.send({
            success: true,
            error: false,
            message: " Data of Work Experience is Sucessfully saved in the database"
        })

    }
    catch(error){
        res.send({
            success: false,
            error: true,
            message: "Data Can't save in the dataBase"
        })
    }
};


exports.postEducation = async (req, res, next) => {
    try{
        const { cvId, education } = req.body;

        // Find the CV document by cvId
        let cv = await CvModel.findById(cvId);
        if (!cv || cv.stepCompleted < 1) {
            return res.send({
                success: false,
                error: true,
                message: "You should complete the first step",
            });
        }

        // Check if education is provided and is an array
        if (education && Array.isArray(education)) {
            education.forEach((experience) => {
                // If experience has an _id, check if it exists in the array for updating
                if (experience._id) {
                    let existingIndex = cv.education.findIndex(
                        (item) => item._id.toString() === experience._id
                    );

                    if (existingIndex !== -1) {
                        // Update the existing work experience entry
                        cv.education[existingIndex] = experience;
                    } else {
                        // If not found, add it as a new entry
                        cv.education.push(experience);
                    }
                } else {
                    // If no _id, this is a new work experience, add it to the array
                    cv.education.push(experience);
                }
            });
        }
           cv.stepCompleted = 3

         await cv.save();

        res.send({
            success: true,
            error: false,
            message: "Data of education sucessfully saved in the database"
        })

    }
    catch(error) {
        res.send({
            success: false,
            error: true,
            message: "data can't save sucessfully in the database"
        })
    }
};

exports.postSkill = async (req, res, next) => {
   try{
       const { cvId,skills } = req.body;

       let cv = await CvModel.findById(cvId);

       if(!cv || cv.stepCompleted < 3 ) {
        return res.send({
            sucess: false,
            error: true,
            message:  "complete the previous step"
        });
       }

       cv.skills = cv.skills || [];

       // Add only new skills that are not already in the existing skills
       skills.forEach(skill => {
           if (!cv.skills.includes(skill)) {
               cv.skills.push(skill);
           }
       });
        cv.stepCompleted = 4;
         await cv.save();

        res.send({
            success: true,
            error: false,
            message: "Data of skills is save sucessfully in the database"
        })
   }
   catch(error){
    res.send({
        success: false,
        error: true,
        message: "Data can not saved in the Database"
    })
   }
};

exports.saveCustomSection = async (req, res, next) => {
    const {cvId, sectionTitle, content } = req.body;
    try {
        let cv = await CvModel.findById(cvId);
        if (!cv || cv.stepCompleted < 4) {
            return res.status(400).json({ msg: 'Complete previous steps first' });
        }
        const sectionIndex = cv.customSections.findIndex(section => section.sectionTitle === sectionTitle);

        if (sectionIndex === -1) {
            // If section doesn't exist, add a new one (only if content is provided)
            if (content) {
                cv.customSections.push({ sectionTitle, content });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Content is required for new section'
                });
            }
        } else {
            // If section exists, update its content only if content is provided, otherwise retain existing content
            cv.customSections[sectionIndex].content = content || cv.customSections[sectionIndex].content || cv.customSections[sectionIndex].content ;
        }
        cv.stepCompleted = 5;
        await cv.save();
        res.send({
            sucess: true,
            error: false,
            message: "Data saved"
        });
    } 
    catch (error) {
        res.send({ 
            sucess: false,
            error: true,
            message: "can't work"
        });
    }
};

// Controller to preview CV
exports.previewCv = async (req, res, next) => {
    const { cvId } = req.params;

    try {
        // Find the CV by its ID
        const cv = await CvModel.findById(cvId);

        if (!cv) {
            return res.status(404).json({
                success: false,
                message: "CV not found",
            });
        }

        // Check if the user has selected a template for the CV
        if (!cv.templateId) {
            return res.status(400).json({
                success: false,
                message: "No template selected",
            });
        }

        // Generate the preview based on the selected template
        const templatePath = path.join(__dirname, `../views/templates/template-${cv.templateId}.pug`);

        // Render the Pug template to HTML
        res.render(templatePath, { cv: cv }, (err, html) => {
            if (err) return next(err);

            // Send the HTML for preview
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to preview CV",
            error: error.message,
        });
    }
};


exports.getGenerateCvPdf = async (req, res, next) => {
    const { cvId } = req.params;

    try {
        // Ensure the user is authenticated (logged in)
        const userId = req.user.id;  // Assuming the user ID is stored in the JWT token and verified by middleware

        if (!userId) {
            return res.status(401).json({
              success: false,
              message: 'User not authenticated or user ID not found.',
            });
          }



        // Find the CV by its ID
        const cv = await CvModel.findById(cvId);

        if (!cv) {
            return res.status(404).json({
                success: false,
                message: "CV not found"
            });
        }

        if (!cv.user) {
            // Update CV to include the user ID
            cv.user = userId;
            await cv.save();
          }

        // Ensure the logged-in user is the owner of the CV
        if (cv.user.toString() !== userId) {
            return res.status(403).json({
               success: false,
                message: "You do not have permission to access this CV."
            });
        }

        // Check if the user has selected a template for the CV
        if (!cv.templateId) {
            return res.status(400).json({
                success: false,
                message: "No template selected"
            });
        }

        // Generate the PDF based on the selected template
        const templatePath = path.join(__dirname, `../views/templates/template-${cv.templateId}.pug`);

        // Render the Pug template to HTML
        res.render(templatePath, { cv: cv }, (err, html) => {
            if (err) return next(err);

            // Create a PDF from the rendered HTML
            pdf.create(html).toStream((err, stream) => {
                if (err) return next(err);

                // Send the PDF as a stream
                res.setHeader('Content-type', 'application/pdf');
                stream.pipe(res);
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate CV PDF",
            error: error.message
        });
    }
};
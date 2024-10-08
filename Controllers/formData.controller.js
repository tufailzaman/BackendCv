const FormData = require('../Models/formDataModel');


const submitFormData = async (req, res) => {
  try {
    const formData = new FormData(req.body);
    
    await formData.save();
    res.status(201).json({ message: 'Data saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save data', error });
  }
};

module.exports = {
  submitFormData,
};

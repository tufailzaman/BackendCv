const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { config } = require('dotenv');
const cors = require('cors');

config();

const app = express();

const Mongodb_Url = process.env.Mongodb_Url;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const authRoutes = require('./Routes/auth');
const submitFormData = require('./Routes/formData.Routes')


app.use('/api', authRoutes);
app.use('/api', submitFormData);


mongoose.connect(Mongodb_Url)
    .then(() => {
        app.listen(3000, () => console.log("Running on http://localhost:3000"));
    })
    .catch(err => {
        console.log(err);
    });
